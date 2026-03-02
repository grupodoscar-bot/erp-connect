import { useCallback, useMemo, useEffect, useRef } from "react";
import { useDocumentoVentaFormBase } from "./useDocumentoVentaFormBase";

const ESTADOS_PEDIDO_PREDETERMINADOS = [
  { nombre: "Pendiente", colorClaro: "#FDE68A55", colorOscuro: "#92400E55" },
  { nombre: "Confirmado", colorClaro: "#BBF7D055", colorOscuro: "#14532D55" },
  { nombre: "En preparación", colorClaro: "#C7D2FE55", colorOscuro: "#312E8155" },
  { nombre: "Servido", colorClaro: "#A7F3D055", colorOscuro: "#065F4655" },
  { nombre: "Cancelado", colorClaro: "#FECACA55", colorOscuro: "#7F1D1D55" },
];

const formPedidoInicial = {
  id: null,
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

export function usePedidos(pestanaActiva = null, session = null) {
  const base = useDocumentoVentaFormBase(
    {
      tipoDocumento: "PEDIDO",
      endpoint: "pedidos",
      estadosPredeterminados: ESTADOS_PEDIDO_PREDETERMINADOS,
      formInicial: formPedidoInicial,
      tipoSerie: "PEDIDO_VENTA",
    },
    pestanaActiva,
    session
  );

  const {
    formDocumento: formPedido,
    setFormDocumento: setFormPedido,
    documentos: pedidos,
    clientes,
    productos,
    tiposIva,
    API_URL,
  } = base;

  const ultimoClienteIdRef = useRef(null);

  useEffect(() => {
    if (!formPedido.clienteId || clientes.length === 0) return;
    if (ultimoClienteIdRef.current === formPedido.clienteId) return;
    
    const clienteSeleccionado = clientes.find((c) => c.id === parseInt(formPedido.clienteId));
    if (!clienteSeleccionado) return;
    
    const descuentoCliente = clienteSeleccionado?.agrupacion?.descuentoGeneral;
    const descuentoFinal = (descuentoCliente !== undefined && descuentoCliente !== null) 
      ? descuentoCliente 
      : 0;
    
    setFormPedido((prev) => ({
      ...prev,
      descuentoAgrupacion: descuentoFinal,
      descuentoAgrupacionManual: descuentoFinal,
    }));
    
    ultimoClienteIdRef.current = formPedido.clienteId;
  }, [formPedido.clienteId, clientes, setFormPedido]);

  const updateFormPedidoField = useCallback((field, value) => {
    setFormPedido((prev) => {
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
  }, [base.permitirVentaMultialmacen, base.seriesDisponibles, base.almacenes, setFormPedido]);

  const setDireccionSnapshot = useCallback((tipo, direccion) => {
    const campo = tipo === "facturacion" ? "direccionFacturacionSnapshot" : "direccionEnvioSnapshot";
    setFormPedido((prev) => ({ ...prev, [campo]: direccion }));
  }, [setFormPedido]);

  const updateDireccionSnapshotField = useCallback((tipo, field, value) => {
    const campo = tipo === "facturacion" ? "direccionFacturacionSnapshot" : "direccionEnvioSnapshot";
    setFormPedido((prev) => ({
      ...prev,
      [campo]: { ...(prev[campo] || {}), [field]: value },
    }));
  }, [setFormPedido]);

  const agregarLinea = useCallback(() => {
    setFormPedido((prev) => ({
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
  }, [setFormPedido]);

  const eliminarLinea = useCallback((index) => {
    setFormPedido((prev) => ({
      ...prev,
      lineas: prev.lineas.filter((_, i) => i !== index),
    }));
  }, [setFormPedido]);

  const actualizarLinea = useCallback((index, field, value) => {
    setFormPedido((prev) => {
      const nuevasLineas = [...prev.lineas];
      nuevasLineas[index] = { ...nuevasLineas[index], [field]: value };
      return { ...prev, lineas: nuevasLineas };
    });
  }, [setFormPedido]);

  const calcularTotales = useMemo(() => {
    let subtotalBruto = 0;
    let descuentoTotal = 0;
    let totalIva = 0;
    let totalRecargo = 0;
    const desglosePorIva = {};

    const cliente = clientes.find(c => c.id === parseInt(formPedido.clienteId));
    
    formPedido.lineas.forEach((linea) => {
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
        if (formPedido.descuentoAgrupacionManual !== null && 
            formPedido.descuentoAgrupacionManual !== undefined) {
          const valorManual = String(formPedido.descuentoAgrupacionManual).trim();
          descuentoAgrupacionPct = valorManual === '' ? 0 : (parseFloat(formPedido.descuentoAgrupacionManual) || 0);
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
    if (formPedido.descuentoAgrupacionManual !== null && 
        formPedido.descuentoAgrupacionManual !== undefined) {
      const valorManual = String(formPedido.descuentoAgrupacionManual).trim();
      descuentoAgrupacionPct = valorManual === '' ? 0 : (parseFloat(formPedido.descuentoAgrupacionManual) || 0);
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
  }, [formPedido.lineas, formPedido.descuentoAgrupacionManual, formPedido.descuentoAgrupacion, formPedido.clienteId, productos, tiposIva, clientes, base.descuentoAgrupacionBase]);

  const guardarPedido = useCallback(
    async (e, opciones = {}) => {
      if (e) e.preventDefault();

      if (!formPedido.numero || formPedido.numero.trim() === "") {
        alert("El número del documento no puede estar vacío. Selecciona una serie o activa la numeración manual.");
        return;
      }

      try {
        const totales = calcularTotales;
        
        const direccionFacturacion = formPedido.direccionFacturacionSnapshot || {};
        const direccionEnvio = formPedido.direccionEnvioSnapshot || {};
        
        // Solo enviar fecha si fue modificada (comparar con fechaOriginal)
        const fechaModificada = formPedido.fecha !== formPedido.fechaOriginal;
        const fechaFormateada = fechaModificada 
          ? new Date(formPedido.fecha).toISOString()
          : null; // null = backend preservará la fecha existente
        
        const payload = {
          ...formPedido,
          fecha: fechaFormateada,
          notas: formPedido.notas || "",
          descuentoAgrupacion: formPedido.descuentoAgrupacionManual ?? formPedido.descuentoAgrupacion ?? 0,
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
          lineas: formPedido.lineas.map((linea) => ({
            productoId: parseInt(linea.productoId) || null,
            cantidad: parseFloat(linea.cantidad) || 0,
            precioUnitario: parseFloat(linea.precioUnitario) || 0,
            descuento: parseFloat(linea.descuento) || 0,
            tipoIvaId: parseInt(linea.tipoIvaId) || null,
            observaciones: linea.observaciones || "",
            almacenId: parseInt(linea.almacenId) || null,
          })),
        };

        const url = formPedido.id ? `${API_URL}/${formPedido.id}` : API_URL;
        const method = formPedido.id ? "PUT" : "POST";

        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          const pedidoGuardado = await response.json();
          
          const adjuntosIds = (formPedido.adjuntos || []).map(a => a.id).filter(id => id && id > 0);
          try {
            await fetch(`${API_URL}/${pedidoGuardado.id}/adjuntos`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(adjuntosIds),
            });
          } catch (e) {
            console.error("Error al vincular adjuntos:", e);
          }
          
          await base.cargarDocumentos();
          
          if (opciones.cerrarDespues) {
            setFormPedido(formPedidoInicial);
            if (opciones.cerrarPestana) {
              opciones.cerrarPestana();
            }
          } else {
            setFormPedido(prev => ({
              ...prev,
              id: pedidoGuardado.id,
              numero: pedidoGuardado.numero,
            }));
          }
          
          alert("Pedido guardado correctamente");
        } else {
          const error = await response.text();
          alert(`Error al guardar: ${error}`);
        }
      } catch (error) {
        console.error("Error al guardar pedido:", error);
        alert("Error al guardar el pedido");
      }
    },
    [formPedido, calcularTotales, base.cargarDocumentos, API_URL, setFormPedido]
  );

  const eliminarPedido = useCallback(
    async (id) => {
      try {
        const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        if (response.ok) {
          await base.cargarDocumentos();
        } else {
          throw new Error("Error al eliminar");
        }
      } catch (error) {
        console.error("Error al eliminar pedido:", error);
        throw error;
      }
    },
    [base.cargarDocumentos, API_URL]
  );

  const duplicarPedido = useCallback(
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
        console.error("Error al duplicar pedido:", error);
        throw error;
      }
    },
    [base.cargarDocumentos, API_URL]
  );

  const cargarPedidoParaEditar = useCallback(async (pedido) => {
    const { id, pestanaId } = pedido;
    try {
      const response = await fetch(`${API_URL}/${id}`);
      if (!response.ok) throw new Error('Error al cargar pedido');
      
      const pedidoCompleto = await response.json();
      
      // Convertir fecha ISO a formato datetime-local (YYYY-MM-DDTHH:mm)
      const fechaLocal = pedidoCompleto.fecha 
        ? new Date(pedidoCompleto.fecha).toISOString().slice(0, 16)
        : new Date().toISOString().slice(0, 16);
      
      setFormPedido({
        id: pedidoCompleto.id,
        numero: pedidoCompleto.numero,
        fecha: fechaLocal,
        fechaOriginal: fechaLocal, // Guardar fecha original para tracking
        clienteId: pedidoCompleto.cliente?.id?.toString() || "",
        estado: pedidoCompleto.estado || "Pendiente",
        observaciones: pedidoCompleto.observaciones || "",
        notas: pedidoCompleto.notas || "",
        serieId: pedidoCompleto.serie?.id?.toString() || "",
        tarifaId: pedidoCompleto.tarifa?.id || null,
        almacenId: pedidoCompleto.almacen?.id || null,
        ventaMultialmacen: pedidoCompleto.ventaMultialmacen || false,
        descuentoAgrupacion: pedidoCompleto.descuentoAgrupacion || 0,
        descuentoAgrupacionManual: pedidoCompleto.descuentoAgrupacion || 0,
        usarCodigoManual: true,
        lineas: (pedidoCompleto.lineas || []).map(linea => ({
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
          pais: pedidoCompleto.direccionFacturacionPais || "",
          codigoPostal: pedidoCompleto.direccionFacturacionCodigoPostal || "",
          provincia: pedidoCompleto.direccionFacturacionProvincia || "",
          poblacion: pedidoCompleto.direccionFacturacionPoblacion || "",
          direccion: pedidoCompleto.direccionFacturacionDireccion || "",
        },
        direccionEnvioSnapshot: {
          pais: pedidoCompleto.direccionEnvioPais || "",
          codigoPostal: pedidoCompleto.direccionEnvioCodigoPostal || "",
          provincia: pedidoCompleto.direccionEnvioProvincia || "",
          poblacion: pedidoCompleto.direccionEnvioPoblacion || "",
          direccion: pedidoCompleto.direccionEnvioDireccion || "",
        },
        adjuntos: pedidoCompleto.adjuntos || [],
      }, pestanaId);
    } catch (error) {
      console.error('Error al cargar pedido para editar:', error);
      alert('Error al cargar el pedido');
    }
  }, [API_URL, setFormPedido]);

  return {
    ...base,
    pedidos,
    documentos: pedidos,
    formPedido,
    setFormPedido,
    cargarPedidos: base.cargarDocumentos,
    updateFormPedidoField,
    setDireccionSnapshot,
    updateDireccionSnapshotField,
    agregarLinea,
    eliminarLinea,
    actualizarLinea,
    calcularTotales,
    guardarPedido,
    eliminarPedido,
    duplicarPedido,
    cargarPedidoParaEditar,
  };
}
