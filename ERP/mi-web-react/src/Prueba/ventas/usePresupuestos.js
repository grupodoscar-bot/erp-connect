import { useCallback, useMemo, useEffect, useRef } from "react";
import { useDocumentoVentaFormBase } from "./useDocumentoVentaFormBase";

const ESTADOS_PRESUPUESTO_PREDETERMINADOS = [
  { nombre: "Pendiente", colorClaro: "#FDE68A55", colorOscuro: "#92400E55" },
  { nombre: "Aceptado", colorClaro: "#BBF7D055", colorOscuro: "#14532D55" },
  { nombre: "Rechazado", colorClaro: "#FECACA55", colorOscuro: "#7F1D1D55" },
  { nombre: "Convertido", colorClaro: "#C7D2FE55", colorOscuro: "#312E8155" },
  { nombre: "Cancelado", colorClaro: "#E5E7EB55", colorOscuro: "#37415155" },
];

const formPresupuestoInicial = {
  id: null,
  numero: "",
  fecha: new Date().toISOString().slice(0, 16),
  fechaOriginal: null, // Para tracking de cambios
  clienteId: "",
  estado: "Pendiente",
  observaciones: "",
  notas: "",
  lineas: [],
  adjuntos: [],
  direccionFacturacionSnapshot: null,
  direccionEnvioSnapshot: null,
  usarCodigoManual: false,
  serieId: "",
  tarifaId: null,
  descuentoAgrupacion: 0,
  descuentoAgrupacionManual: null,
  almacenId: null,
  ventaMultialmacen: false,
};

export function usePresupuestos(pestanaActiva = null, session = null) {
  // Usar el hook base con configuración específica de presupuestos
  const base = useDocumentoVentaFormBase(
    {
      tipoDocumento: "PRESUPUESTO",
      endpoint: "presupuestos",
      estadosPredeterminados: ESTADOS_PRESUPUESTO_PREDETERMINADOS,
      formInicial: formPresupuestoInicial,
      tipoSerie: "PRESUPUESTO",
    },
    pestanaActiva,
    session
  );

  const {
    formDocumento: formPresupuesto,
    setFormDocumento: setFormPresupuesto,
    documentos: presupuestos,
    clientes,
    productos,
    tiposIva,
    API_URL,
  } = base;

  // ========== LÓGICA ESPECÍFICA DE PRESUPUESTOS ==========

  // Ref para rastrear el último cliente seleccionado y evitar loops
  const ultimoClienteIdRef = useRef(null);

  // Aplicar descuento de agrupación del cliente automáticamente solo cuando cambia el cliente
  useEffect(() => {
    if (!formPresupuesto.clienteId || clientes.length === 0) return;
    
    // Solo ejecutar cuando cambia el cliente, no cuando cambia el descuento
    if (ultimoClienteIdRef.current === formPresupuesto.clienteId) return;
    
    const clienteSeleccionado = clientes.find((c) => c.id === parseInt(formPresupuesto.clienteId));
    if (!clienteSeleccionado) return;
    
    const descuentoCliente = clienteSeleccionado?.agrupacion?.descuentoGeneral;
    const descuentoFinal = (descuentoCliente !== undefined && descuentoCliente !== null) 
      ? descuentoCliente 
      : 0;
    
    setFormPresupuesto((prev) => ({
      ...prev,
      descuentoAgrupacion: descuentoFinal,
      descuentoAgrupacionManual: descuentoFinal,
    }));
    
    // Actualizar el ref para evitar ejecutar de nuevo con el mismo cliente
    ultimoClienteIdRef.current = formPresupuesto.clienteId;
  }, [formPresupuesto.clienteId, clientes, setFormPresupuesto]);

  const updateFormPresupuestoField = useCallback((field, value) => {
    setFormPresupuesto((prev) => {
      let siguiente = { ...prev, [field]: value };
      
      if (field === "serieId" && !base.permitirVentaMultialmacen && value) {
        const serieSeleccionada = base.seriesDisponibles.find(s => s.id === parseInt(value));
        if (serieSeleccionada?.almacenPredeterminado?.id) {
          siguiente.almacenId = serieSeleccionada.almacenPredeterminado.id.toString();
        } else if (base.almacenes.length > 0) {
          siguiente.almacenId = base.almacenes[0].id.toString();
        }
        siguiente.ventaMultialmacen = false;
      }
      
      return siguiente;
    });
  }, [base.permitirVentaMultialmacen, base.seriesDisponibles, base.almacenes, setFormPresupuesto]);

  const setDireccionSnapshot = useCallback((tipo, direccion) => {
    const campo = tipo === "facturacion" ? "direccionFacturacionSnapshot" : "direccionEnvioSnapshot";
    setFormPresupuesto((prev) => ({ ...prev, [campo]: direccion }));
  }, [setFormPresupuesto]);

  const updateDireccionSnapshotField = useCallback((tipo, field, value) => {
    const campo = tipo === "facturacion" ? "direccionFacturacionSnapshot" : "direccionEnvioSnapshot";
    setFormPresupuesto((prev) => ({
      ...prev,
      [campo]: { ...(prev[campo] || {}), [field]: value },
    }));
  }, [setFormPresupuesto]);

  const agregarLinea = useCallback(() => {
    setFormPresupuesto((prev) => ({
      ...prev,
      lineas: [
        ...prev.lineas,
        {
          id: Date.now(),
          productoId: "",
          cantidad: 1,
          precioUnitario: 0,
          descuento: 0,
          tipoIvaId: "",
          observaciones: "",
          almacenId: "",
        },
      ],
    }));
  }, [setFormPresupuesto]);

  const eliminarLinea = useCallback((index) => {
    setFormPresupuesto((prev) => ({
      ...prev,
      lineas: prev.lineas.filter((_, i) => i !== index),
    }));
  }, [setFormPresupuesto]);

  const actualizarLinea = useCallback((index, field, value) => {
    setFormPresupuesto((prev) => {
      const nuevasLineas = [...prev.lineas];
      nuevasLineas[index] = { ...nuevasLineas[index], [field]: value };
      return { ...prev, lineas: nuevasLineas };
    });
  }, [setFormPresupuesto]);

  const calcularTotales = useMemo(() => {
    let subtotalBruto = 0;
    let descuentoTotal = 0;
    let totalIva = 0;
    let totalRecargo = 0;
    const desglosePorIva = {};

    const cliente = clientes.find(c => c.id === parseInt(formPresupuesto.clienteId));
    
    formPresupuesto.lineas.forEach((linea) => {
      const producto = productos.find((p) => p.id === parseInt(linea.productoId));
      const cantidad = parseFloat(linea.cantidad) || 0;
      const precio = parseFloat(linea.precioUnitario) || 0;
      const descuento = parseFloat(linea.descuento) || 0;

      const bruto = cantidad * precio;
      const descuentoImporte = bruto * (descuento / 100);
      const baseLinea = bruto - descuentoImporte;
      
      subtotalBruto += bruto;
      descuentoTotal += descuentoImporte;

      const tipoIva = tiposIva.find((t) => t.id === parseInt(linea.tipoIvaId)) || producto?.tipoIva;
      if (tipoIva) {
        const porcentajeIva = parseFloat(tipoIva.porcentajeIva) || 0;
        const porcentajeRecargo = cliente?.recargoEquivalencia && tipoIva.porcentajeRecargo
          ? parseFloat(tipoIva.porcentajeRecargo)
          : 0;
        
        // Obtener el descuento de agrupación efectivo
        // Si el campo manual tiene un valor (incluso 0), usarlo
        // Si está vacío (null, undefined o string vacío), usar 0
        let descuentoAgrupacionPct = 0;
        if (formPresupuesto.descuentoAgrupacionManual !== null && 
            formPresupuesto.descuentoAgrupacionManual !== undefined) {
          const valorManual = String(formPresupuesto.descuentoAgrupacionManual).trim();
          descuentoAgrupacionPct = valorManual === '' ? 0 : (parseFloat(formPresupuesto.descuentoAgrupacionManual) || 0);
        }
        
        const baseConAgrupacion = baseLinea * (1 - descuentoAgrupacionPct / 100);
        
        const ivaLinea = baseConAgrupacion * (porcentajeIva / 100);
        const recargoLinea = baseConAgrupacion * (porcentajeRecargo / 100);
        
        totalIva += ivaLinea;
        totalRecargo += recargoLinea;

        const key = `${porcentajeIva}-${porcentajeRecargo}`;
        if (!desglosePorIva[key]) {
          desglosePorIva[key] = {
            porcentajeIva,
            porcentajeRecargo,
            baseAntesDescuento: 0,
            descuentoAgrupacionImporte: 0,
            baseImponible: 0,
            importeIva: 0,
            importeRecargo: 0,
          };
        }
        const descuentoAgrupacionLineaImporte = baseLinea - baseConAgrupacion;
        desglosePorIva[key].baseAntesDescuento += baseLinea;
        desglosePorIva[key].descuentoAgrupacionImporte += descuentoAgrupacionLineaImporte;
        desglosePorIva[key].baseImponible += baseConAgrupacion;
        desglosePorIva[key].importeIva += ivaLinea;
        desglosePorIva[key].importeRecargo += recargoLinea;
      }
    });

    const subtotal = subtotalBruto - descuentoTotal;
    
    // Obtener el descuento de agrupación efectivo
    // Si el campo manual tiene un valor (incluso 0), usarlo
    // Si está vacío (null, undefined o string vacío), usar 0
    let descuentoAgrupacionPct = 0;
    if (formPresupuesto.descuentoAgrupacionManual !== null && 
        formPresupuesto.descuentoAgrupacionManual !== undefined) {
      const valorManual = String(formPresupuesto.descuentoAgrupacionManual).trim();
      descuentoAgrupacionPct = valorManual === '' ? 0 : (parseFloat(formPresupuesto.descuentoAgrupacionManual) || 0);
    }
    
    const descuentoAgrupacionImporte = subtotal * (descuentoAgrupacionPct / 100);
    const totalBaseSinImpuestos = subtotal - descuentoAgrupacionImporte;
    const total = totalBaseSinImpuestos + totalIva + totalRecargo;

    const desgloseIva = Object.values(desglosePorIva)
      .filter(d => d.baseImponible > 0)
      .sort((a, b) => a.porcentajeIva - b.porcentajeIva);

    return {
      subtotal: subtotalBruto,
      descuentoTotal,
      descuentoAgrupacionPct,
      descuentoAgrupacionImporte,
      descuentoAgrupacionBase: base.descuentoAgrupacionBase,
      totalBaseSinImpuestos,
      totalIva,
      totalRecargo,
      total,
      desgloseIva,
    };
  }, [formPresupuesto.lineas, formPresupuesto.descuentoAgrupacionManual, formPresupuesto.descuentoAgrupacion, formPresupuesto.clienteId, productos, tiposIva, clientes, base.descuentoAgrupacionBase]);

  const guardarPresupuesto = useCallback(
    async (e, opciones = {}) => {
      if (e) e.preventDefault();

      if (!formPresupuesto.numero || formPresupuesto.numero.trim() === "") {
        alert("El número del documento no puede estar vacío. Selecciona una serie o activa la numeración manual.");
        return;
      }

      try {
        const totales = calcularTotales;
        
        const direccionFacturacion = formPresupuesto.direccionFacturacionSnapshot || {};
        const direccionEnvio = formPresupuesto.direccionEnvioSnapshot || {};
        
        // Solo enviar fecha si fue modificada (comparar con fechaOriginal)
        const fechaModificada = formPresupuesto.fecha !== formPresupuesto.fechaOriginal;
        const fechaFormateada = fechaModificada 
          ? new Date(formPresupuesto.fecha).toISOString()
          : null; // null = backend preservará la fecha existente
        
        const payload = {
          ...formPresupuesto,
          fecha: fechaFormateada,
          notas: formPresupuesto.notas || "",
          descuentoAgrupacion: formPresupuesto.descuentoAgrupacionManual ?? formPresupuesto.descuentoAgrupacion ?? 0,
          subtotal: parseFloat(totales.subtotal),
          totalIva: parseFloat(totales.totalIva),
          total: parseFloat(totales.total),
          direccionFacturacionPais: direccionFacturacion.pais || "",
          direccionFacturacionCodigoPostal: direccionFacturacion.codigoPostal || "",
          direccionFacturacionProvincia: direccionFacturacion.provincia || "",
          direccionFacturacionPoblacion: direccionFacturacion.poblacion || "",
          direccionFacturacionDireccion: direccionFacturacion.direccion || "",
          direccionEnvioPais: direccionEnvio.pais || "",
          direccionEnvioCodigoPostal: direccionEnvio.codigoPostal || "",
          direccionEnvioProvincia: direccionEnvio.provincia || "",
          direccionEnvioPoblacion: direccionEnvio.poblacion || "",
          direccionEnvioDireccion: direccionEnvio.direccion || "",
          direccionFacturacionSnapshot: undefined,
          direccionEnvioSnapshot: undefined,
          lineas: formPresupuesto.lineas.map((linea) => ({
            productoId: parseInt(linea.productoId) || null,
            cantidad: parseFloat(linea.cantidad) || 0,
            precioUnitario: parseFloat(linea.precioUnitario) || 0,
            descuento: parseFloat(linea.descuento) || 0,
            tipoIvaId: parseInt(linea.tipoIvaId) || null,
            observaciones: linea.observaciones || "",
            almacenId: parseInt(linea.almacenId) || null,
          })),
        };

        const url = formPresupuesto.id ? `${API_URL}/${formPresupuesto.id}` : API_URL;
        const method = formPresupuesto.id ? "PUT" : "POST";

        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          const presupuestoGuardado = await response.json();
          
          const adjuntosIds = (formPresupuesto.adjuntos || []).map(a => a.id).filter(id => id && id > 0);
          try {
            await fetch(`${API_URL}/${presupuestoGuardado.id}/adjuntos`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(adjuntosIds),
            });
          } catch (e) {
            console.error("Error al vincular adjuntos:", e);
          }
          
          await base.cargarDocumentos();
          
          if (opciones.cerrarDespues) {
            setFormPresupuesto(formPresupuestoInicial);
            if (opciones.cerrarPestana) {
              opciones.cerrarPestana();
            }
          } else {
            setFormPresupuesto(prev => ({
              ...prev,
              id: presupuestoGuardado.id,
              numero: presupuestoGuardado.numero,
            }));
          }
          
          alert("Presupuesto guardado correctamente");
        } else {
          const error = await response.text();
          alert(`Error al guardar: ${error}`);
        }
      } catch (error) {
        console.error("Error al guardar presupuesto:", error);
        alert("Error al guardar el presupuesto");
      }
    },
    [formPresupuesto, calcularTotales, base.cargarDocumentos, API_URL, setFormPresupuesto]
  );

  const eliminarPresupuesto = useCallback(
    async (id) => {
      try {
        const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        if (response.ok) {
          await base.cargarDocumentos();
        } else {
          throw new Error("Error al eliminar");
        }
      } catch (error) {
        console.error("Error al eliminar presupuesto:", error);
        throw error;
      }
    },
    [base.cargarDocumentos, API_URL]
  );

  const duplicarPresupuesto = useCallback(
    async (id) => {
      try {
        const response = await fetch(`${API_URL}/${id}/duplicar`, { method: "POST" });
        if (response.ok) {
          const duplicado = await response.json();
          await base.cargarDocumentos();
          return duplicado;
        } else {
          throw new Error("Error al duplicar");
        }
      } catch (error) {
        console.error("Error al duplicar presupuesto:", error);
        throw error;
      }
    },
    [base.cargarDocumentos, API_URL]
  );

  const cargarPresupuestoParaEditar = useCallback(async (presupuesto) => {
    const { id, pestanaId } = presupuesto;
    try {
      const response = await fetch(`${API_URL}/${id}`);
      if (!response.ok) throw new Error('Error al cargar presupuesto');
      
      const presupuestoCompleto = await response.json();
      
      // Convertir fecha ISO a formato datetime-local (YYYY-MM-DDTHH:mm)
      const fechaLocal = presupuestoCompleto.fecha 
        ? new Date(presupuestoCompleto.fecha).toISOString().slice(0, 16)
        : new Date().toISOString().slice(0, 16);
      
      setFormPresupuesto({
        id: presupuestoCompleto.id,
        numero: presupuestoCompleto.numero,
        fecha: fechaLocal,
        fechaOriginal: fechaLocal, // Guardar fecha original para tracking
        clienteId: presupuestoCompleto.cliente?.id?.toString() || "",
        estado: presupuestoCompleto.estado || "Pendiente",
        observaciones: presupuestoCompleto.observaciones || "",
        notas: presupuestoCompleto.notas || "",
        serieId: presupuestoCompleto.serie?.id?.toString() || "",
        tarifaId: presupuestoCompleto.tarifa?.id || null,
        almacenId: presupuestoCompleto.almacen?.id || null,
        ventaMultialmacen: presupuestoCompleto.ventaMultialmacen || false,
        descuentoAgrupacion: presupuestoCompleto.descuentoAgrupacion || 0,
        descuentoAgrupacionManual: presupuestoCompleto.descuentoAgrupacion || 0,
        usarCodigoManual: true,
        lineas: (presupuestoCompleto.lineas || []).map(linea => ({
          id: linea.id,
          productoId: linea.producto?.id?.toString() || "",
          nombreProducto: linea.nombreProducto || "",
          referencia: linea.referencia || "",
          cantidad: linea.cantidad || 0,
          precioUnitario: linea.precioUnitario || 0,
          descuento: linea.descuento || 0,
          tipoIvaId: linea.tipoIva?.id?.toString() || "",
          porcentajeIva: linea.porcentajeIva || 0,
          porcentajeRecargo: linea.porcentajeRecargo || 0,
          observaciones: linea.observaciones || "",
          almacenId: linea.almacen?.id || null,
        })),
        direccionFacturacionSnapshot: {
          pais: presupuestoCompleto.direccionFacturacionPais || "",
          codigoPostal: presupuestoCompleto.direccionFacturacionCodigoPostal || "",
          provincia: presupuestoCompleto.direccionFacturacionProvincia || "",
          poblacion: presupuestoCompleto.direccionFacturacionPoblacion || "",
          direccion: presupuestoCompleto.direccionFacturacionDireccion || "",
        },
        direccionEnvioSnapshot: {
          pais: presupuestoCompleto.direccionEnvioPais || "",
          codigoPostal: presupuestoCompleto.direccionEnvioCodigoPostal || "",
          provincia: presupuestoCompleto.direccionEnvioProvincia || "",
          poblacion: presupuestoCompleto.direccionEnvioPoblacion || "",
          direccion: presupuestoCompleto.direccionEnvioDireccion || "",
        },
        adjuntos: presupuestoCompleto.adjuntos || [],
      }, pestanaId);
    } catch (error) {
      console.error('Error al cargar presupuesto para editar:', error);
      alert('Error al cargar el presupuesto');
    }
  }, [API_URL, setFormPresupuesto]);

  // ========== RETORNO ==========
  return {
    // Del hook base
    ...base,
    
    // Renombrar para compatibilidad
    presupuestos,
    documentos: presupuestos,
    formPresupuesto,
    setFormPresupuesto,
    cargarPresupuestos: base.cargarDocumentos,
    
    // Funciones específicas de presupuestos
    updateFormPresupuestoField,
    setDireccionSnapshot,
    updateDireccionSnapshotField,
    agregarLinea,
    eliminarLinea,
    actualizarLinea,
    calcularTotales,
    guardarPresupuesto,
    eliminarPresupuesto,
    duplicarPresupuesto,
    cargarPresupuestoParaEditar,
  };
}
