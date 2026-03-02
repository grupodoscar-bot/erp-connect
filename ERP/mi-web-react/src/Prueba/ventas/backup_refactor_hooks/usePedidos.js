import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useTarifasAlbaran } from "./useTarifasAlbaran";
import API_ENDPOINTS from "../../config/api";

const API_URL = API_ENDPOINTS.pedidos;
const CLIENTES_API_URL = API_ENDPOINTS.clientes;
const PRODUCTOS_API_URL = API_ENDPOINTS.productos;
const TIPOS_IVA_API_URL = API_ENDPOINTS.tiposIva;
const ARCHIVOS_API_URL = API_ENDPOINTS.archivosEmpresa;
const SERIES_API_URL = API_ENDPOINTS.series;
const SERIES_PREF_API_URL = API_ENDPOINTS.seriesPreferencias;
const ALMACENES_API_URL = API_ENDPOINTS.almacenes;
const API_URL_CONFIG_VENTAS = API_ENDPOINTS.configuracionVentas;
const TRANSFORMACIONES_API_URL = API_ENDPOINTS.documentoTransformaciones;
const DOCUMENTO_SERIE_TIPO = "PEDIDO_VENTA";

const ESTADOS_PEDIDO_PREDETERMINADOS = [
  { nombre: "Pendiente", colorClaro: "#FDE68A55", colorOscuro: "#92400E55" },
  { nombre: "Confirmado", colorClaro: "#BBF7D055", colorOscuro: "#14532D55" },
  { nombre: "En preparación", colorClaro: "#C7D2FE55", colorOscuro: "#312E8155" },
  { nombre: "Servido", colorClaro: "#A7F3D055", colorOscuro: "#065F4655" },
  { nombre: "Cancelado", colorClaro: "#FECACA55", colorOscuro: "#7F1D1D55" },
];

const formPedidoInicial = {
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

export function usePedidos(pestanaActiva = null, session = null) {
  const [pedidos, setPedidos] = useState([]);
  // Mapa de formularios por ID de pestaña para permitir múltiples instancias
  const [formulariosPorPestana, setFormulariosPorPestana] = useState({});
  
  // Obtener formulario de la pestaña actual
  const formPedido = useMemo(() => {
    if (!pestanaActiva) return formPedidoInicial;
    return formulariosPorPestana[pestanaActiva] || formPedidoInicial;
  }, [formulariosPorPestana, pestanaActiva]);
  
  // Función para actualizar el formulario de la pestaña actual
  const setFormPedido = useCallback((nuevoFormulario, pestanaId = null) => {
    const idPestana = pestanaId || pestanaActiva;
    if (!idPestana) return;
    
    setFormulariosPorPestana(prev => ({
      ...prev,
      [idPestana]: typeof nuevoFormulario === 'function' 
        ? nuevoFormulario(prev[idPestana] || formPedidoInicial)
        : nuevoFormulario
    }));
  }, [pestanaActiva]);
  
  // Función para limpiar formulario al cerrar pestaña
  const limpiarFormularioPestana = useCallback((pestanaId) => {
    setFormulariosPorPestana(prev => {
      const nuevo = { ...prev };
      delete nuevo[pestanaId];
      return nuevo;
    });
  }, []);
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [tiposIva, setTiposIva] = useState([]);
  const [loading, setLoading] = useState(false);
  const [paginacion, setPaginacion] = useState({ totalElements: 0, totalPages: 0 });
  const [seriesDisponibles, setSeriesDisponibles] = useState([]);
  const [cargandoSeries, setCargandoSeries] = useState(false);
  const [seriePreferidaUsuario, setSeriePreferidaUsuario] = useState(null);
  const [guardandoPreferenciaSerie, setGuardandoPreferenciaSerie] = useState(false);
  const [generandoNumero, setGenerandoNumero] = useState(false);
  const [almacenes, setAlmacenes] = useState([]);
  const [permitirVentaMultialmacen, setPermitirVentaMultialmacen] = useState(false);

  const tarifasAlbaran = useTarifasAlbaran(formPedido, setFormPedido);

  // Determinar si mostrar selector de almacén (solo si hay más de 1 almacén)
  const mostrarSelectorAlmacen = useMemo(() => almacenes.length > 1, [almacenes]);

  const estadoOptions = ESTADOS_PEDIDO_PREDETERMINADOS;

  const usuarioId = useMemo(
    () =>
      session?.usuario?.id ??
      session?.usuarioId ??
      session?.usuario?.usuarioId ??
      null,
    [session]
  );

  // Inicializar formulario para nueva pestaña si no existe (solo para "nuevo", no para "editar")
  useEffect(() => {
    if (pestanaActiva && pestanaActiva.startsWith('pedido-nuevo')) {
      setFormulariosPorPestana(prev => {
        // Solo inicializar si no existe
        if (!prev[pestanaActiva]) {
          return {
            ...prev,
            [pestanaActiva]: { ...formPedidoInicial }
          };
        }
        return prev;
      });
    }
  }, [pestanaActiva]);

  // Seleccionar automáticamente la serie con orden de prioridad: usuario > sistema > única
  useEffect(() => {
    // SOLO ejecutar para pestañas nuevas, NUNCA para edición
    if (!pestanaActiva || !pestanaActiva.startsWith('pedido-nuevo')) return;
    if (seriesDisponibles.length === 0 || formPedido.serieId) return;
    
    let serieId = "";
    
    // 1. Preferencia del usuario
    if (seriePreferidaUsuario?.serie?.id) {
      serieId = seriePreferidaUsuario.serie.id.toString();
    }
    // 2. Serie predeterminada del sistema
    else {
      const seriePredeterminada = seriesDisponibles.find(s => s.defaultSistema === true);
      if (seriePredeterminada) {
        serieId = seriePredeterminada.id.toString();
      }
      // 3. Única serie disponible
      else if (seriesDisponibles.length === 1) {
        serieId = seriesDisponibles[0].id.toString();
      }
    }
    
    if (serieId) {
      setFormPedido(prev => ({ ...prev, serieId }));
    }
  }, [pestanaActiva, seriesDisponibles, formPedido.serieId, seriePreferidaUsuario]);

  const cargarPedidos = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      if (response.ok) {
        const data = await response.json();
        
        // Cargar origen de cada documento
        const pedidosConOrigen = await Promise.all((Array.isArray(data) ? data : []).map(async (pedido) => {
          try {
            const resOrigen = await fetch(`${TRANSFORMACIONES_API_URL}/origen-directo/PEDIDO/${pedido.id}`);
            if (resOrigen.ok) {
              const dataOrigen = await resOrigen.json();
              const formatearTipo = (tipo) => {
                const tipos = {
                  'PRESUPUESTO': 'Presupuesto',
                  'PEDIDO': 'Pedido',
                  'ALBARAN': 'Albarán',
                  'FACTURA': 'Factura',
                  'FACTURA_PROFORMA': 'F. Proforma',
                  'FACTURA_RECTIFICATIVA': 'F. Rectificativa',
                  'DUPLICAR': 'Duplicado',
                  'CONVERTIR': 'Conversión'
                };
                return tipos[dataOrigen.tipoTransformacion] || tipos[dataOrigen.tipoOrigen] || 'Manual';
              };
              return { ...pedido, origen: formatearTipo(dataOrigen.tipoOrigen) };
            }
            return { ...pedido, origen: null };
          } catch (err) {
            return { ...pedido, origen: null };
          }
        }));
        
        setPedidos(pedidosConOrigen);
        setPaginacion({ totalElements: data.length || 0, totalPages: 1 });
      }
    } catch (error) {
      console.error("Error al cargar pedidos:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const cargarClientes = useCallback(async () => {
    try {
      const response = await fetch(CLIENTES_API_URL);
      if (response.ok) {
        const data = await response.json();
        setClientes(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error al cargar clientes:", error);
    }
  }, []);

  const cargarProductos = useCallback(async () => {
    try {
      const response = await fetch(PRODUCTOS_API_URL);
      if (response.ok) {
        const data = await response.json();
        setProductos(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error al cargar productos:", error);
    }
  }, []);

  const cargarTiposIva = useCallback(async () => {
    try {
      const response = await fetch(TIPOS_IVA_API_URL);
      if (response.ok) {
        const data = await response.json();
        setTiposIva(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error al cargar tipos de IVA:", error);
    }
  }, []);

  const cargarAlmacenes = useCallback(async () => {
    try {
      const response = await fetch(ALMACENES_API_URL);
      if (response.ok) {
        const data = await response.json();
        setAlmacenes(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error al cargar almacenes:", error);
    }
  }, []);

  const cargarConfiguracionVentas = useCallback(async () => {
    try {
      const res = await fetch(API_URL_CONFIG_VENTAS);
      const data = await res.json();
      setPermitirVentaMultialmacen(data.permitirVentaMultialmacen || false);
    } catch (err) {
      console.error("Error al cargar configuración de ventas:", err);
    }
  }, []);

  const cargarSeries = useCallback(async () => {
    setCargandoSeries(true);
    try {
      const params = new URLSearchParams({
        tipoDocumento: DOCUMENTO_SERIE_TIPO,
        soloActivas: "true",
      });
      const response = await fetch(`${SERIES_API_URL}?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setSeriesDisponibles(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error al cargar series:", error);
    } finally {
      setCargandoSeries(false);
    }
  }, []);

  const cargarPreferenciaSerie = useCallback(async () => {
    if (!usuarioId) {
      setSeriePreferidaUsuario(null);
      return;
    }
    try {
      const params = new URLSearchParams({
        usuarioId: usuarioId.toString(),
        tipoDocumento: DOCUMENTO_SERIE_TIPO,
      });
      const res = await fetch(`${SERIES_PREF_API_URL}?${params.toString()}`);
      if (!res.ok) {
        if (res.status === 404) {
          setSeriePreferidaUsuario(null);
        }
        return;
      }
      const data = await res.json();
      setSeriePreferidaUsuario(data && Object.keys(data).length ? data : null);
    } catch (err) {
      console.error("Error cargando preferencia de serie:", err);
    }
  }, [usuarioId]);

  // Cargar datos solo cuando hay una pestaña de pedidos activa
  const [datosInicializados, setDatosInicializados] = useState(false);
  
  useEffect(() => {
    if (!pestanaActiva) return;
    const esPestanaPedidos = pestanaActiva.startsWith('pedido-nuevo') || 
      pestanaActiva.startsWith('pedido-editar');
    
    if (esPestanaPedidos && !datosInicializados) {
      setDatosInicializados(true);
      cargarPedidos();
      cargarClientes();
      cargarProductos();
      cargarTiposIva();
      cargarAlmacenes();
      cargarSeries();
      cargarConfiguracionVentas();
    }
  }, [pestanaActiva, datosInicializados, cargarPedidos, cargarClientes, cargarProductos, cargarTiposIva, cargarAlmacenes, cargarSeries, cargarConfiguracionVentas]);

  // Cargar preferencia de serie cuando cambie el usuario
  useEffect(() => {
    // SOLO ejecutar para pestañas nuevas, NUNCA para edición
    if (!pestanaActiva || !pestanaActiva.startsWith('pedido-nuevo')) return;
    cargarPreferenciaSerie();
  }, [pestanaActiva, cargarPreferenciaSerie]);

  // Generar número automáticamente cuando se selecciona una serie
  useEffect(() => {
    // SOLO ejecutar para pestañas nuevas, NUNCA para edición
    if (!pestanaActiva || !pestanaActiva.startsWith('pedido-nuevo')) return;
    if (!formPedido.serieId || formPedido.usarCodigoManual || formPedido.id) return;

    const generarNumeroAutomatico = async () => {

      setGenerandoNumero(true);
      try {
        const response = await fetch(`${API_URL}/siguiente-numero?serieId=${formPedido.serieId}`);
        if (response.ok) {
          const data = await response.json();
          setFormPedido(prev => ({ ...prev, numero: data.numero || data }));
        }
      } catch (error) {
        console.error('Error al generar número:', error);
      } finally {
        setGenerandoNumero(false);
      }
    };

    generarNumeroAutomatico();
  }, [pestanaActiva, formPedido.serieId, formPedido.usarCodigoManual, formPedido.id]);

  const updateFormPedidoField = useCallback((field, value) => {
    setFormPedido((prev) => {
      let siguiente = { ...prev, [field]: value };
      
      // Si se selecciona una serie y no está permitido multialmacén, asignar almacén automáticamente
      if (field === "serieId" && !permitirVentaMultialmacen && value) {
        const serieSeleccionada = seriesDisponibles.find(s => s.id === parseInt(value));
        if (serieSeleccionada?.almacenPredeterminado?.id) {
          siguiente.almacenId = serieSeleccionada.almacenPredeterminado.id.toString();
        } else if (almacenes.length > 0) {
          siguiente.almacenId = almacenes[0].id.toString();
        }
        siguiente.ventaMultialmacen = false;
      }
      
      return siguiente;
    });
  }, [permitirVentaMultialmacen, seriesDisponibles, almacenes, setFormPedido]);

  // Solo aplicar el descuento de la agrupación del cliente si el campo manual está vacío
  useEffect(() => {
    if (!formPedido.clienteId) return;

    if (formPedido.descuentoAgrupacionManual !== null && formPedido.descuentoAgrupacionManual !== undefined) {
      return;
    }

    const clienteSeleccionado = clientes.find((c) => c.id === parseInt(formPedido.clienteId));
    const descuentoCliente = clienteSeleccionado?.agrupacion?.descuentoGeneral;

    if (descuentoCliente !== undefined && descuentoCliente !== null) {
      setFormPedido((prev) => ({
        ...prev,
        descuentoAgrupacionManual: descuentoCliente,
      }));
    }
  }, [formPedido.clienteId, formPedido.descuentoAgrupacionManual, clientes]);

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

  // Descuento base de la agrupación del cliente
  const descuentoAgrupacionBase = useMemo(() => {
    if (!formPedido.clienteId) return 0;
    const cliente = clientes.find(c => c.id === parseInt(formPedido.clienteId));
    return cliente?.agrupacion?.descuentoGeneral || 0;
  }, [formPedido.clienteId, clientes]);

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
        
        // Aplicar descuento de agrupación si existe
        const descuentoAgrupacionPct = parseFloat(formPedido.descuentoAgrupacionManual ?? formPedido.descuentoAgrupacion) || 0;
        const baseConAgrupacion = baseLinea * (1 - descuentoAgrupacionPct / 100);
        
        const ivaLinea = baseConAgrupacion * (porcentajeIva / 100);
        const recargoLinea = baseConAgrupacion * (porcentajeRecargo / 100);
        
        totalIva += ivaLinea;
        totalRecargo += recargoLinea;

        // Agrupar por tipo de IVA para desglose
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
    const descuentoAgrupacionPct = parseFloat(formPedido.descuentoAgrupacionManual ?? formPedido.descuentoAgrupacion) || 0;
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
      descuentoAgrupacionBase,
      totalBaseSinImpuestos,
      totalIva,
      totalRecargo,
      total,
      desgloseIva,
    };
  }, [formPedido.lineas, formPedido.descuentoAgrupacionManual, formPedido.descuentoAgrupacion, formPedido.clienteId, productos, tiposIva, clientes, descuentoAgrupacionBase]);

  const guardarPedido = useCallback(
    async (e, opciones = {}) => {
      if (e) e.preventDefault();

      // Validar que el número no esté vacío
      if (!formPedido.numero || formPedido.numero.trim() === "") {
        alert("El número del documento no puede estar vacío. Selecciona una serie o activa la numeración manual.");
        return;
      }

      try {
        const totales = calcularTotales;
        const payload = {
          ...formPedido,
          descuentoAgrupacion: formPedido.descuentoAgrupacionManual ?? formPedido.descuentoAgrupacion ?? 0,
          subtotal: parseFloat(totales.subtotal),
          totalIva: parseFloat(totales.totalIva),
          total: parseFloat(totales.total),
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
          
          // Vincular adjuntos al documento recién guardado
          // Si la lista está vacía, se desvinculan todos los adjuntos existentes
          const adjuntosIds = (formPedido.adjuntos || []).map(a => a.id).filter(id => id && id > 0);
          console.log("DEBUG guardar - adjuntos a vincular:", adjuntosIds);
          try {
            await fetch(`${API_URL}/${pedidoGuardado.id}/adjuntos`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(adjuntosIds),
            });
          } catch (e) {
            console.error("Error al vincular adjuntos:", e);
          }
          
          await cargarPedidos();
          
          // Si es cerrar después, resetear formulario
          if (opciones.cerrarDespues) {
            setFormPedido(formPedidoInicial);
            if (opciones.cerrarPestana) {
              opciones.cerrarPestana();
            }
          } else {
            // Si no es cerrar después, mantener el pedido guardado en el formulario
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
    [formPedido, calcularTotales, cargarPedidos]
  );

  const eliminarPedido = useCallback(
    async (id) => {
      try {
        const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        if (response.ok) {
          await cargarPedidos();
        } else {
          throw new Error("Error al eliminar");
        }
      } catch (error) {
        console.error("Error al eliminar pedido:", error);
        throw error;
      }
    },
    [cargarPedidos]
  );

  const duplicarPedido = useCallback(
    async (id) => {
      try {
        const response = await fetch(`${API_URL}/${id}/duplicar`, { method: "POST" });
        if (response.ok) {
          const duplicado = await response.json();
          await cargarPedidos();
          return duplicado;
        } else {
          throw new Error("Error al duplicar");
        }
      } catch (error) {
        console.error("Error al duplicar pedido:", error);
        throw error;
      }
    },
    [cargarPedidos]
  );

  const cargarPedidoParaEditar = useCallback(async (pedido) => {
    const { id, pestanaId } = pedido;
    try {
      // Cargar el pedido completo con sus líneas
      const response = await fetch(`${API_URL}/${id}`);
      if (!response.ok) throw new Error('Error al cargar pedido');
      
      const pedidoCompleto = await response.json();
      
      setFormPedido({
        id: pedidoCompleto.id,
        numero: pedidoCompleto.numero,
        fecha: pedidoCompleto.fecha,
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
  }, []);

  const descargarPdf = useCallback(async (id, nombreArchivo) => {
    try {
      const response = await fetch(`${API_URL}/${id}/pdf`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = nombreArchivo;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Error al descargar PDF:", error);
    }
  }, []);

  const subirAdjunto = useCallback(async (file) => {
    try {
      const formData = new FormData();
      formData.append("archivo", file);
      formData.append("rutaCarpeta", "/");
      const response = await fetch(`${ARCHIVOS_API_URL}/subir`, {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        const adjunto = await response.json();
        setFormPedido((prev) => ({
          ...prev,
          adjuntos: [...(prev.adjuntos || []), adjunto],
        }));
      }
    } catch (error) {
      console.error("Error al subir adjunto:", error);
    }
  }, []);

  const eliminarAdjunto = useCallback(async (adjuntoId) => {
    // Solo eliminar físicamente si es temporal (ID 0 o null)
    if (!adjuntoId || adjuntoId === 0) {
      const adjunto = formPedido.adjuntos?.find(a => a.id === adjuntoId || a.id === 0);
      if (adjunto?.idReal) {
        try {
          await fetch(`${ARCHIVOS_API_URL}/${adjunto.idReal}`, { method: "DELETE" });
        } catch (e) {
          console.error("Error al eliminar adjunto temporal:", e);
        }
      }
    }
    // Siempre quitar del estado local
    setFormPedido((prev) => ({
      ...prev,
      adjuntos: prev.adjuntos.filter((a) => a.id !== adjuntoId),
    }));
  }, [formPedido.adjuntos]);

  const descargarAdjunto = useCallback(async (adjuntoId, nombreArchivo) => {
    try {
      const response = await fetch(`${ARCHIVOS_API_URL}/descargar/${adjuntoId}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = nombreArchivo;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Error al descargar adjunto:", error);
    }
  }, []);

  const guardarPreferenciaSerie = useCallback(async (serieId) => {
    setGuardandoPreferenciaSerie(true);
    try {
      const response = await fetch(SERIES_PREF_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipoDocumento: DOCUMENTO_SERIE_TIPO, serieId }),
      });
      if (response.ok) {
        alert("Preferencia de serie guardada");
      }
    } catch (error) {
      console.error("Error al guardar preferencia:", error);
    } finally {
      setGuardandoPreferenciaSerie(false);
    }
  }, []);

  const cargarPedido = useCallback(
    async (id) => {
      try {
        const response = await fetch(`${API_URL}/${id}`);
        if (response.ok) {
          const data = await response.json();
          setFormPedido({
            ...data,
            clienteId: data.cliente?.id?.toString() || "",
            serieId: data.serie?.id?.toString() || "",
            tarifaId: data.tarifa?.id || null,
            lineas: (data.lineas || []).map((linea) => ({
              ...linea,
              productoId: linea.producto?.id?.toString() || "",
              tipoIvaId: linea.tipoIva?.id?.toString() || "",
              almacenId: linea.almacen?.id?.toString() || "",
            })),
          });
        }
      } catch (error) {
        console.error("Error al cargar pedido:", error);
      }
    },
    []
  );

  // ========== HISTORIAL DE TRANSFORMACIONES ==========
  const [modalHistorialAbierto, setModalHistorialAbierto] = useState(false);
  const [documentoHistorial, setDocumentoHistorial] = useState(null);
  const [historialModal, setHistorialModal] = useState([]);
  const [cargandoHistorialModal, setCargandoHistorialModal] = useState(false);

  const cargarHistorialTransformaciones = useCallback(async (tipo, id) => {
    try {
      const res = await fetch(`${TRANSFORMACIONES_API_URL}/historial/${tipo}/${id}`);
      if (res.ok) {
        const data = await res.json();
        return data;
      }
      return [];
    } catch (err) {
      console.error("Error cargando historial de transformaciones:", err);
      return [];
    }
  }, []);

  const abrirModalHistorialDocumento = useCallback(async (pedido) => {
    setDocumentoHistorial({ tipo: 'PEDIDO', id: pedido.id, numero: pedido.numero });
    setModalHistorialAbierto(true);
    setCargandoHistorialModal(true);
    try {
      const historial = await cargarHistorialTransformaciones('PEDIDO', pedido.id);
      setHistorialModal(historial || []);
    } catch (error) {
      console.error('Error al cargar historial:', error);
      setHistorialModal([]);
    } finally {
      setCargandoHistorialModal(false);
    }
  }, [cargarHistorialTransformaciones]);

  const cerrarModalHistorial = useCallback(() => {
    setModalHistorialAbierto(false);
    setDocumentoHistorial(null);
    setHistorialModal([]);
  }, []);

  return {
    pedidos,
    documentos: pedidos, // Alias para compatibilidad con DocumentoVentaListado
    formPedido,
    clientes,
    productos,
    tiposIva,
    loading,
    paginacion,
    seriesDisponibles,
    cargandoSeries,
    guardandoPreferenciaSerie,
    generandoNumero,
    estadoOptions,
    almacenes,
    mostrarSelectorAlmacen,
    permitirVentaMultialmacen,
    tarifasAlbaran,
    // Modal historial
    modalHistorialAbierto,
    documentoHistorial,
    historialModal,
    cargandoHistorialModal,
    abrirModalHistorialDocumento,
    cerrarModalHistorial,
    cargarPedidos,
    cargarDocumentos: cargarPedidos, // Alias para compatibilidad con DocumentoVentaListado
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
    descargarPdf,
    subirAdjunto,
    eliminarAdjunto,
    descargarAdjunto,
    guardarPreferenciaSerie,
    cargarPedido,
    setFormPedido,
    limpiarFormularioPestana,
  };
}
