import { useCallback, useMemo, useEffect, useRef, useState } from "react";
import { useDocumentoVentaFormBase } from "./useDocumentoVentaFormBase";

const ESTADOS_FACTURA_RECTIFICATIVA_PREDETERMINADOS = [
  { nombre: "Pendiente", colorClaro: "#FDE68A55", colorOscuro: "#92400E55" },
  { nombre: "Emitido", colorClaro: "#BBF7D055", colorOscuro: "#14532D55" },
  { nombre: "Cancelada", colorClaro: "#FECACA55", colorOscuro: "#7F1D1D55" },
];

const formFacturaRectificativaInicial = {
  id: null,
  numero: "",
  fecha: new Date().toISOString().split("T")[0],
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

export function useFacturasRectificativasForm(pestanaActiva = null, session = null) {
  const base = useDocumentoVentaFormBase(
    {
      tipoDocumento: "FACTURA_RECTIFICATIVA",
      endpoint: "facturasRectificativas",
      estadosPredeterminados: ESTADOS_FACTURA_RECTIFICATIVA_PREDETERMINADOS,
      formInicial: formFacturaRectificativaInicial,
      tipoSerie: "FACTURA_RECTIFICATIVA",
    },
    pestanaActiva,
    session
  );

  const {
    formDocumento: formFacturaRectificativa,
    setFormDocumento: setFormFacturaRectificativa,
    documentos: facturasRectificativas,
    clientes,
    productos,
    tiposIva,
    API_URL,
  } = base;

  const ultimoClienteIdRef = useRef(null);
  const [datosInicializadosLocal, setDatosInicializadosLocal] = useState(false);

  // Sobrescribir la lógica de inicialización del hook base para usar el prefijo correcto
  useEffect(() => {
    const esPestanaFacturasRect = typeof pestanaActiva === 'string' && (
      pestanaActiva.startsWith('factura-rectificativa-nuevo') || 
      pestanaActiva.startsWith('factura-rectificativa-editar')
    );
    
    if (esPestanaFacturasRect && !datosInicializadosLocal) {
      setDatosInicializadosLocal(true);
      base.cargarClientes();
      base.cargarProductos();
      base.cargarTiposIva();
      base.cargarAlmacenes();
      base.cargarSeries();
      base.cargarConfiguracionVentas();
    }
  }, [pestanaActiva, datosInicializadosLocal, base.cargarClientes, base.cargarProductos, base.cargarTiposIva, base.cargarAlmacenes, base.cargarSeries, base.cargarConfiguracionVentas]);

  useEffect(() => {
    if (!formFacturaRectificativa.clienteId || clientes.length === 0) return;
    if (ultimoClienteIdRef.current === formFacturaRectificativa.clienteId) return;
    
    const clienteSeleccionado = clientes.find((c) => c.id === parseInt(formFacturaRectificativa.clienteId));
    if (!clienteSeleccionado) return;
    
    const descuentoCliente = clienteSeleccionado?.agrupacion?.descuentoGeneral;
    const descuentoFinal = (descuentoCliente !== undefined && descuentoCliente !== null) 
      ? descuentoCliente 
      : 0;
    
    setFormFacturaRectificativa((prev) => ({
      ...prev,
      descuentoAgrupacion: descuentoFinal,
      descuentoAgrupacionManual: descuentoFinal,
    }));
    
    ultimoClienteIdRef.current = formFacturaRectificativa.clienteId;
  }, [formFacturaRectificativa.clienteId, clientes, setFormFacturaRectificativa]);

  const updateFormFacturaRectificativaField = useCallback((field, value) => {
    setFormFacturaRectificativa((prev) => {
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
  }, [base.permitirVentaMultialmacen, base.seriesDisponibles, base.almacenes, setFormFacturaRectificativa]);

  const setDireccionSnapshot = useCallback((tipo, direccion) => {
    const campo = tipo === "facturacion" ? "direccionFacturacionSnapshot" : "direccionEnvioSnapshot";
    setFormFacturaRectificativa((prev) => ({ ...prev, [campo]: direccion }));
  }, [setFormFacturaRectificativa]);

  const updateDireccionSnapshotField = useCallback((tipo, field, value) => {
    const campo = tipo === "facturacion" ? "direccionFacturacionSnapshot" : "direccionEnvioSnapshot";
    setFormFacturaRectificativa((prev) => ({
      ...prev,
      [campo]: { ...(prev[campo] || {}), [field]: value },
    }));
  }, [setFormFacturaRectificativa]);

  const agregarLinea = useCallback(() => {
    setFormFacturaRectificativa((prev) => ({
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
  }, [setFormFacturaRectificativa]);

  const eliminarLinea = useCallback((index) => {
    setFormFacturaRectificativa((prev) => ({
      ...prev,
      lineas: prev.lineas.filter((_, i) => i !== index),
    }));
  }, [setFormFacturaRectificativa]);

  const actualizarLinea = useCallback((index, field, value) => {
    setFormFacturaRectificativa((prev) => {
      const nuevasLineas = [...prev.lineas];
      nuevasLineas[index] = { ...nuevasLineas[index], [field]: value };
      return { ...prev, lineas: nuevasLineas };
    });
  }, [setFormFacturaRectificativa]);

  const calcularTotales = useMemo(() => {
    let subtotalBruto = 0;
    let descuentoTotal = 0;
    let totalIva = 0;
    let totalRecargo = 0;
    const desglosePorIva = {};

    const cliente = clientes.find(c => c.id === parseInt(formFacturaRectificativa.clienteId));
    
    formFacturaRectificativa.lineas.forEach((linea) => {
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
        if (formFacturaRectificativa.descuentoAgrupacionManual !== null && 
            formFacturaRectificativa.descuentoAgrupacionManual !== undefined) {
          const valorManual = String(formFacturaRectificativa.descuentoAgrupacionManual).trim();
          descuentoAgrupacionPct = valorManual === '' ? 0 : (parseFloat(formFacturaRectificativa.descuentoAgrupacionManual) || 0);
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
    if (formFacturaRectificativa.descuentoAgrupacionManual !== null && 
        formFacturaRectificativa.descuentoAgrupacionManual !== undefined) {
      const valorManual = String(formFacturaRectificativa.descuentoAgrupacionManual).trim();
      descuentoAgrupacionPct = valorManual === '' ? 0 : (parseFloat(formFacturaRectificativa.descuentoAgrupacionManual) || 0);
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
  }, [formFacturaRectificativa.lineas, formFacturaRectificativa.descuentoAgrupacionManual, formFacturaRectificativa.descuentoAgrupacion, formFacturaRectificativa.clienteId, productos, tiposIva, clientes, base.descuentoAgrupacionBase]);

  const guardarFacturaRectificativa = useCallback(
    async (e, opciones = {}) => {
      if (e) e.preventDefault();

      if (!formFacturaRectificativa.numero || formFacturaRectificativa.numero.trim() === "") {
        alert("El número del documento no puede estar vacío. Selecciona una serie o activa la numeración manual.");
        return;
      }

      try {
        const totales = calcularTotales;
        
        const direccionFacturacion = formFacturaRectificativa.direccionFacturacionSnapshot || {};
        const direccionEnvio = formFacturaRectificativa.direccionEnvioSnapshot || {};
        
        const payload = {
          ...formFacturaRectificativa,
          notas: formFacturaRectificativa.notas || "",
          descuentoAgrupacion: formFacturaRectificativa.descuentoAgrupacionManual ?? formFacturaRectificativa.descuentoAgrupacion ?? 0,
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
          lineas: formFacturaRectificativa.lineas.map((linea) => ({
            productoId: parseInt(linea.productoId) || null,
            cantidad: parseFloat(linea.cantidad) || 0,
            precioUnitario: parseFloat(linea.precioUnitario) || 0,
            descuento: parseFloat(linea.descuento) || 0,
            tipoIvaId: parseInt(linea.tipoIvaId) || null,
            observaciones: linea.observaciones || "",
            almacenId: parseInt(linea.almacenId) || null,
          })),
        };

        const url = formFacturaRectificativa.id ? `${API_URL}/${formFacturaRectificativa.id}` : API_URL;
        const method = formFacturaRectificativa.id ? "PUT" : "POST";

        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          const facturaRectificativaGuardada = await response.json();
          
          const adjuntosIds = (formFacturaRectificativa.adjuntos || []).map(a => a.id).filter(id => id && id > 0);
          console.log("DEBUG guardar - adjuntos a vincular:", adjuntosIds);
          console.log("DEBUG guardar - adjuntos completos:", formFacturaRectificativa.adjuntos);
          try {
            const responseAdjuntos = await fetch(`${API_URL}/${facturaRectificativaGuardada.id}/adjuntos`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(adjuntosIds),
            });
            console.log("DEBUG guardar - respuesta adjuntos:", responseAdjuntos.status);
          } catch (e) {
            console.error("Error al vincular adjuntos:", e);
          }
          
          await base.cargarDocumentos();
          
          if (opciones.cerrarDespues) {
            setFormFacturaRectificativa(formFacturaRectificativaInicial);
            if (opciones.cerrarPestana) {
              opciones.cerrarPestana();
            }
          } else {
            setFormFacturaRectificativa(prev => ({
              ...prev,
              id: facturaRectificativaGuardada.id,
              numero: facturaRectificativaGuardada.numero,
            }));
          }
          
          alert("Factura rectificativa guardada correctamente");
        } else {
          const error = await response.text();
          alert(`Error al guardar: ${error}`);
        }
      } catch (error) {
        console.error("Error al guardar factura rectificativa:", error);
        alert("Error al guardar la factura rectificativa");
      }
    },
    [formFacturaRectificativa, calcularTotales, base.cargarDocumentos, API_URL, setFormFacturaRectificativa]
  );

  const eliminarFacturaRectificativa = useCallback(
    async (id) => {
      try {
        const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        if (response.ok) {
          await base.cargarDocumentos();
        } else {
          throw new Error("Error al eliminar");
        }
      } catch (error) {
        console.error("Error al eliminar factura rectificativa:", error);
        throw error;
      }
    },
    [base.cargarDocumentos, API_URL]
  );

  const duplicarFacturaRectificativa = useCallback(
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
        console.error("Error al duplicar factura rectificativa:", error);
        throw error;
      }
    },
    [base.cargarDocumentos, API_URL]
  );

  const cargarFacturaRectificativaParaEditar = useCallback(async (facturaRectificativa) => {
    const { id, pestanaId } = facturaRectificativa;
    try {
      const response = await fetch(`${API_URL}/${id}`);
      if (!response.ok) throw new Error('Error al cargar factura rectificativa');
      
      const facturaRectificativaCompleta = await response.json();
      console.log("DEBUG cargar - adjuntos recibidos:", facturaRectificativaCompleta.adjuntos);
      
      // WORKAROUND: El backend no devuelve los adjuntos en la respuesta principal
      // Hacer petición adicional para obtenerlos
      let adjuntos = facturaRectificativaCompleta.adjuntos || [];
      if (!adjuntos || adjuntos.length === 0) {
        try {
          const responseAdjuntos = await fetch(`${API_URL}/${id}/adjuntos`);
          if (responseAdjuntos.ok) {
            adjuntos = await responseAdjuntos.json();
            console.log("DEBUG cargar - adjuntos desde endpoint separado:", adjuntos);
          }
        } catch (e) {
          console.log("DEBUG cargar - no hay endpoint separado para adjuntos");
        }
      }
      
      setFormFacturaRectificativa({
        id: facturaRectificativaCompleta.id,
        numero: facturaRectificativaCompleta.numero,
        fecha: facturaRectificativaCompleta.fecha,
        clienteId: facturaRectificativaCompleta.cliente?.id?.toString() || "",
        estado: facturaRectificativaCompleta.estado || "Pendiente",
        observaciones: facturaRectificativaCompleta.observaciones || "",
        notas: facturaRectificativaCompleta.notas || "",
        serieId: facturaRectificativaCompleta.serie?.id?.toString() || "",
        tarifaId: facturaRectificativaCompleta.tarifa?.id || null,
        almacenId: facturaRectificativaCompleta.almacen?.id || null,
        ventaMultialmacen: facturaRectificativaCompleta.ventaMultialmacen || false,
        descuentoAgrupacion: facturaRectificativaCompleta.descuentoAgrupacion || 0,
        descuentoAgrupacionManual: facturaRectificativaCompleta.descuentoAgrupacion || 0,
        usarCodigoManual: true,
        lineas: (facturaRectificativaCompleta.lineas || []).map(linea => ({
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
          pais: facturaRectificativaCompleta.direccionFacturacionPais || "",
          codigoPostal: facturaRectificativaCompleta.direccionFacturacionCodigoPostal || "",
          provincia: facturaRectificativaCompleta.direccionFacturacionProvincia || "",
          poblacion: facturaRectificativaCompleta.direccionFacturacionPoblacion || "",
          direccion: facturaRectificativaCompleta.direccionFacturacionDireccion || "",
        },
        direccionEnvioSnapshot: {
          pais: facturaRectificativaCompleta.direccionEnvioPais || "",
          codigoPostal: facturaRectificativaCompleta.direccionEnvioCodigoPostal || "",
          provincia: facturaRectificativaCompleta.direccionEnvioProvincia || "",
          poblacion: facturaRectificativaCompleta.direccionEnvioPoblacion || "",
          direccion: facturaRectificativaCompleta.direccionEnvioDireccion || "",
        },
        adjuntos: adjuntos,
      }, pestanaId);
    } catch (error) {
      console.error('Error al cargar factura rectificativa para editar:', error);
      alert('Error al cargar la factura rectificativa');
    }
  }, [API_URL, setFormFacturaRectificativa]);

  return {
    // Estados del hook base
    clientes: base.clientes,
    productos: base.productos,
    tiposIva: base.tiposIva,
    loading: base.loading,
    paginacion: base.paginacion,
    seriesDisponibles: base.seriesDisponibles,
    cargandoSeries: base.cargandoSeries,
    guardandoPreferenciaSerie: base.guardandoPreferenciaSerie,
    generandoNumero: base.generandoNumero,
    estadoOptions: base.estadoOptions,
    almacenes: base.almacenes,
    mostrarSelectorAlmacen: base.mostrarSelectorAlmacen,
    permitirVentaMultialmacen: base.permitirVentaMultialmacen,
    stockInfo: base.stockInfo,
    tarifasAlbaran: base.tarifasAlbaran,
    
    // Documentos
    facturasRectificativas,
    documentos: facturasRectificativas,
    
    // Formulario
    formFacturaRectificativa,
    setFormFacturaRectificativa,
    
    // Funciones de carga
    cargarFacturasRectificativas: base.cargarDocumentos,
    cargarDocumentos: base.cargarDocumentos,
    
    // Funciones de formulario
    updateFormFacturaRectificativaField,
    setDireccionSnapshot,
    updateDireccionSnapshotField,
    agregarLinea,
    eliminarLinea,
    actualizarLinea,
    calcularTotales,
    
    // Funciones de documento
    guardarFacturaRectificativa,
    eliminarFacturaRectificativa,
    duplicarFacturaRectificativa,
    cargarFacturaRectificativaParaEditar,
    
    // Funciones del hook base
    descargarPdf: base.descargarPdf,
    subirAdjunto: base.subirAdjunto,
    eliminarAdjunto: base.eliminarAdjunto,
    descargarAdjunto: base.descargarAdjunto,
    guardarPreferenciaSerie: base.guardarPreferenciaSerie,
    limpiarFormularioPestana: base.limpiarFormularioPestana,
  };
}
