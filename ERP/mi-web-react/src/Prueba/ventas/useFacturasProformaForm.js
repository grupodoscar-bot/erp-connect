import { useCallback, useMemo, useEffect, useRef } from "react";
import { useDocumentoVentaFormBase } from "./useDocumentoVentaFormBase";

const ESTADOS_FACTURA_PROFORMA_PREDETERMINADOS = [
  { nombre: "Pendiente", colorClaro: "#FDE68A55", colorOscuro: "#92400E55" },
  { nombre: "Emitido", colorClaro: "#BBF7D055", colorOscuro: "#14532D55" },
  { nombre: "Convertida", colorClaro: "#C7D2FE55", colorOscuro: "#312E8155" },
  { nombre: "Cancelada", colorClaro: "#FECACA55", colorOscuro: "#7F1D1D55" },
];

const formFacturaProformaInicial = {
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

export function useFacturasProformaForm(pestanaActiva = null, session = null) {
  const base = useDocumentoVentaFormBase(
    {
      tipoDocumento: "FACTURA_PROFORMA",
      endpoint: "facturasProforma",
      estadosPredeterminados: ESTADOS_FACTURA_PROFORMA_PREDETERMINADOS,
      formInicial: formFacturaProformaInicial,
      tipoSerie: "FACTURA_PROFORMA",
      prefijoPestana: "factura-proforma",
    },
    pestanaActiva,
    session
  );

  const {
    formDocumento: formFacturaProforma,
    setFormDocumento: setFormFacturaProforma,
    documentos: facturasProforma,
    clientes,
    productos,
    tiposIva,
    API_URL,
  } = base;

  const ultimoClienteIdRef = useRef(null);

  useEffect(() => {
    if (!formFacturaProforma.clienteId || clientes.length === 0) return;
    if (ultimoClienteIdRef.current === formFacturaProforma.clienteId) return;
    
    const clienteSeleccionado = clientes.find((c) => c.id === parseInt(formFacturaProforma.clienteId));
    if (!clienteSeleccionado) return;
    
    const descuentoCliente = clienteSeleccionado?.agrupacion?.descuentoGeneral;
    const descuentoFinal = (descuentoCliente !== undefined && descuentoCliente !== null) 
      ? descuentoCliente 
      : 0;
    
    setFormFacturaProforma((prev) => ({
      ...prev,
      descuentoAgrupacion: descuentoFinal,
      descuentoAgrupacionManual: descuentoFinal,
    }));
    
    ultimoClienteIdRef.current = formFacturaProforma.clienteId;
  }, [formFacturaProforma.clienteId, clientes, setFormFacturaProforma]);

  const updateFormFacturaProformaField = useCallback((field, value) => {
    setFormFacturaProforma((prev) => {
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
  }, [base.permitirVentaMultialmacen, base.seriesDisponibles, base.almacenes, setFormFacturaProforma]);

  const setDireccionSnapshot = useCallback((tipo, direccion) => {
    const campo = tipo === "facturacion" ? "direccionFacturacionSnapshot" : "direccionEnvioSnapshot";
    setFormFacturaProforma((prev) => ({ ...prev, [campo]: direccion }));
  }, [setFormFacturaProforma]);

  const updateDireccionSnapshotField = useCallback((tipo, field, value) => {
    const campo = tipo === "facturacion" ? "direccionFacturacionSnapshot" : "direccionEnvioSnapshot";
    setFormFacturaProforma((prev) => ({
      ...prev,
      [campo]: { ...(prev[campo] || {}), [field]: value },
    }));
  }, [setFormFacturaProforma]);

  const agregarLinea = useCallback(() => {
    setFormFacturaProforma((prev) => ({
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
  }, [setFormFacturaProforma]);

  const eliminarLinea = useCallback((index) => {
    setFormFacturaProforma((prev) => ({
      ...prev,
      lineas: prev.lineas.filter((_, i) => i !== index),
    }));
  }, [setFormFacturaProforma]);

  const actualizarLinea = useCallback((index, field, value) => {
    setFormFacturaProforma((prev) => {
      const nuevasLineas = [...prev.lineas];
      nuevasLineas[index] = { ...nuevasLineas[index], [field]: value };
      return { ...prev, lineas: nuevasLineas };
    });
  }, [setFormFacturaProforma]);

  const calcularTotales = useMemo(() => {
    let subtotalBruto = 0;
    let descuentoTotal = 0;
    let totalIva = 0;
    let totalRecargo = 0;
    const desglosePorIva = {};

    const cliente = clientes.find(c => c.id === parseInt(formFacturaProforma.clienteId));
    
    formFacturaProforma.lineas.forEach((linea) => {
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
        
        let descuentoAgrupacionPct = 0;
        if (formFacturaProforma.descuentoAgrupacionManual !== null && 
            formFacturaProforma.descuentoAgrupacionManual !== undefined) {
          const valorManual = String(formFacturaProforma.descuentoAgrupacionManual).trim();
          descuentoAgrupacionPct = valorManual === '' ? 0 : (parseFloat(formFacturaProforma.descuentoAgrupacionManual) || 0);
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
    
    let descuentoAgrupacionPct = 0;
    if (formFacturaProforma.descuentoAgrupacionManual !== null && 
        formFacturaProforma.descuentoAgrupacionManual !== undefined) {
      const valorManual = String(formFacturaProforma.descuentoAgrupacionManual).trim();
      descuentoAgrupacionPct = valorManual === '' ? 0 : (parseFloat(formFacturaProforma.descuentoAgrupacionManual) || 0);
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
  }, [formFacturaProforma.lineas, formFacturaProforma.descuentoAgrupacionManual, formFacturaProforma.descuentoAgrupacion, formFacturaProforma.clienteId, productos, tiposIva, clientes, base.descuentoAgrupacionBase]);

  const guardarFacturaProforma = useCallback(
    async (e, opciones = {}) => {
      if (e) e.preventDefault();

      if (!formFacturaProforma.numero || formFacturaProforma.numero.trim() === "") {
        alert("El número del documento no puede estar vacío. Selecciona una serie o activa la numeración manual.");
        return;
      }

      try {
        const totales = calcularTotales;
        
        const direccionFacturacion = formFacturaProforma.direccionFacturacionSnapshot || {};
        const direccionEnvio = formFacturaProforma.direccionEnvioSnapshot || {};
        
        // Solo enviar fecha si fue modificada (comparar con fechaOriginal)
        const fechaModificada = formFacturaProforma.fecha !== formFacturaProforma.fechaOriginal;
        const fechaFormateada = fechaModificada 
          ? new Date(formFacturaProforma.fecha).toISOString()
          : null; // null = backend preservará la fecha existente
        
        const payload = {
          ...formFacturaProforma,
          fecha: fechaFormateada,
          notas: formFacturaProforma.notas || "",
          descuentoAgrupacion: formFacturaProforma.descuentoAgrupacionManual ?? formFacturaProforma.descuentoAgrupacion ?? 0,
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
          lineas: formFacturaProforma.lineas.map((linea) => ({
            productoId: parseInt(linea.productoId) || null,
            cantidad: parseFloat(linea.cantidad) || 0,
            precioUnitario: parseFloat(linea.precioUnitario) || 0,
            descuento: parseFloat(linea.descuento) || 0,
            tipoIvaId: parseInt(linea.tipoIvaId) || null,
            observaciones: linea.observaciones || "",
            almacenId: parseInt(linea.almacenId) || null,
          })),
        };

        const url = formFacturaProforma.id ? `${API_URL}/${formFacturaProforma.id}` : API_URL;
        const method = formFacturaProforma.id ? "PUT" : "POST";

        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          const facturaProformaGuardada = await response.json();
          
          const adjuntosIds = (formFacturaProforma.adjuntos || []).map(a => a.id).filter(id => id && id > 0);
          try {
            await fetch(`${API_URL}/${facturaProformaGuardada.id}/adjuntos`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(adjuntosIds),
            });
          } catch (e) {
            console.error("Error al vincular adjuntos:", e);
          }
          
          await base.cargarDocumentos();
          
          if (opciones.cerrarDespues) {
            setFormFacturaProforma(formFacturaProformaInicial);
            if (opciones.cerrarPestana) {
              opciones.cerrarPestana();
            }
          } else {
            setFormFacturaProforma(prev => ({
              ...prev,
              id: facturaProformaGuardada.id,
              numero: facturaProformaGuardada.numero,
            }));
          }
          
          alert("Factura proforma guardada correctamente");
        } else {
          const error = await response.text();
          alert(`Error al guardar: ${error}`);
        }
      } catch (error) {
        console.error("Error al guardar factura proforma:", error);
        alert("Error al guardar la factura proforma");
      }
    },
    [formFacturaProforma, calcularTotales, base.cargarDocumentos, API_URL, setFormFacturaProforma]
  );

  const eliminarFacturaProforma = useCallback(
    async (id) => {
      try {
        const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        if (response.ok) {
          await base.cargarDocumentos();
        } else {
          throw new Error("Error al eliminar");
        }
      } catch (error) {
        console.error("Error al eliminar factura proforma:", error);
        throw error;
      }
    },
    [base.cargarDocumentos, API_URL]
  );

  const duplicarFacturaProforma = useCallback(
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
        console.error("Error al duplicar factura proforma:", error);
        throw error;
      }
    },
    [base.cargarDocumentos, API_URL]
  );

  const cargarFacturaProformaParaEditar = useCallback(async (facturaProforma) => {
    const { id, pestanaId } = facturaProforma;
    try {
      const response = await fetch(`${API_URL}/${id}`);
      if (!response.ok) throw new Error('Error al cargar factura proforma');
      
      const facturaProformaCompleta = await response.json();
      
      // Convertir fecha ISO a formato datetime-local (YYYY-MM-DDTHH:mm)
      const fechaLocal = facturaProformaCompleta.fecha 
        ? new Date(facturaProformaCompleta.fecha).toISOString().slice(0, 16)
        : new Date().toISOString().slice(0, 16);
      
      const formulario = {
        id: facturaProformaCompleta.id,
        numero: facturaProformaCompleta.numero,
        fecha: fechaLocal,
        fechaOriginal: fechaLocal, // Guardar fecha original para tracking
        clienteId: facturaProformaCompleta.cliente?.id?.toString() || "",
        estado: facturaProformaCompleta.estado || "Pendiente",
        observaciones: facturaProformaCompleta.observaciones || "",
        notas: facturaProformaCompleta.notas || "",
        serieId: facturaProformaCompleta.serie?.id?.toString() || "",
        tarifaId: facturaProformaCompleta.tarifa?.id || null,
        almacenId: facturaProformaCompleta.almacen?.id || null,
        ventaMultialmacen: facturaProformaCompleta.ventaMultialmacen || false,
        descuentoAgrupacion: facturaProformaCompleta.descuentoAgrupacion || 0,
        descuentoAgrupacionManual: facturaProformaCompleta.descuentoAgrupacion || 0,
        usarCodigoManual: true,
        lineas: (facturaProformaCompleta.lineas || []).map(linea => ({
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
          pais: facturaProformaCompleta.direccionFacturacionPais || "",
          codigoPostal: facturaProformaCompleta.direccionFacturacionCodigoPostal || "",
          provincia: facturaProformaCompleta.direccionFacturacionProvincia || "",
          poblacion: facturaProformaCompleta.direccionFacturacionPoblacion || "",
          direccion: facturaProformaCompleta.direccionFacturacionDireccion || "",
        },
        direccionEnvioSnapshot: {
          pais: facturaProformaCompleta.direccionEnvioPais || "",
          codigoPostal: facturaProformaCompleta.direccionEnvioCodigoPostal || "",
          provincia: facturaProformaCompleta.direccionEnvioProvincia || "",
          poblacion: facturaProformaCompleta.direccionEnvioPoblacion || "",
          direccion: facturaProformaCompleta.direccionEnvioDireccion || "",
        },
        adjuntos: facturaProformaCompleta.adjuntos || [],
      };
      
      setFormFacturaProforma(formulario, pestanaId);
    } catch (error) {
      console.error('Error al cargar factura proforma para editar:', error);
      alert('Error al cargar la factura proforma');
    }
  }, [API_URL, setFormFacturaProforma]);

  return {
    ...base,
    facturasProforma,
    documentos: facturasProforma,
    formFacturaProforma,
    setFormFacturaProforma,
    cargarFacturasProforma: base.cargarDocumentos,
    updateFormFacturaProformaField,
    setDireccionSnapshot,
    updateDireccionSnapshotField,
    agregarLinea,
    eliminarLinea,
    actualizarLinea,
    calcularTotales,
    guardarFacturaProforma,
    eliminarFacturaProforma,
    duplicarFacturaProforma,
    cargarFacturaProformaParaEditar,
  };
}
