import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useTarifasAlbaran } from "./useTarifasAlbaran";
import { useStockProductos } from "./useStockProductos";

const API_URL = "http://145.223.103.219:8080/facturas-rectificativas";
const CLIENTES_API_URL = "http://145.223.103.219:8080/clientes";
const PRODUCTOS_API_URL = "http://145.223.103.219:8080/productos";
const TIPOS_IVA_API_URL = "http://145.223.103.219:8080/tipos-iva";
const TRANSFORMACIONES_API_URL = "http://145.223.103.219:8080/documento-transformaciones";
const ARCHIVOS_API_URL = "http://145.223.103.219:8080/archivos-empresa";
const SERIES_API_URL = "http://145.223.103.219:8080/series";
const SERIES_PREF_API_URL = "http://145.223.103.219:8080/series/preferencias";
const ALMACENES_API_URL = "http://145.223.103.219:8080/almacenes";
const API_URL_CONFIG_VENTAS = "http://145.223.103.219:8080/configuracion-ventas";
const DOCUMENTO_SERIE_TIPO = "FACTURA_RECTIFICATIVA";

const ESTADOS_FACTURA_RECTIFICATIVA_PREDETERMINADOS = [
  { nombre: "Pendiente", colorClaro: "#FDE68A55", colorOscuro: "#92400E55" },
  { nombre: "Emitido", colorClaro: "#BBF7D055", colorOscuro: "#14532D55" },
  { nombre: "Contabilizada", colorClaro: "#C7D2FE55", colorOscuro: "#312E8155" },
  { nombre: "Cancelada", colorClaro: "#FECACA55", colorOscuro: "#7F1D1D55" },
];

const formFacturaRectificativaInicial = {
  id: null,
  numero: "",
  fecha: new Date().toISOString().split("T")[0],
  clienteId: "",
  estado: "Pendiente",
  observaciones: "",
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
  const [facturasRectificativas, setFacturasRectificativas] = useState([]);
  // Mapa de formularios por ID de pestaña para permitir múltiples instancias
  const [formulariosPorPestana, setFormulariosPorPestana] = useState({});
  
  // Obtener formulario de la pestaña actual
  const formFacturaRectificativa = useMemo(() => {
    if (!pestanaActiva) return formFacturaRectificativaInicial;
    return formulariosPorPestana[pestanaActiva] || formFacturaRectificativaInicial;
  }, [formulariosPorPestana, pestanaActiva]);
  
  // Función para actualizar el formulario de la pestaña actual
  const setFormFacturaRectificativa = useCallback((nuevoFormulario, pestanaId = null) => {
    const idPestana = pestanaId || pestanaActiva;
    if (!idPestana) return;
    
    setFormulariosPorPestana(prev => ({
      ...prev,
      [idPestana]: typeof nuevoFormulario === 'function' 
        ? nuevoFormulario(prev[idPestana] || formFacturaRectificativaInicial)
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
  const [mostrarModalCambioEstado, setMostrarModalCambioEstado] = useState(false);
  const [datosModalCambioEstado, setDatosModalCambioEstado] = useState({
    tipo: 'INCREMENTO',
    estadoOrigen: '',
    estadoDestino: '',
    productos: []
  });
  const [estadoOriginalFacturaRectificativa, setEstadoOriginalFacturaRectificativa] = useState(null);

  const tarifasAlbaran = useTarifasAlbaran(formFacturaRectificativa, setFormFacturaRectificativa);

  // Determinar si mostrar selector de almacén (solo si hay más de 1 almacén)
  const mostrarSelectorAlmacen = useMemo(() => almacenes.length > 1, [almacenes]);

  // Hook para obtener stock en tiempo real
  const stockInfo = useStockProductos(productos, formFacturaRectificativa.almacenId);

  const estadoOptions = ESTADOS_FACTURA_RECTIFICATIVA_PREDETERMINADOS;

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
    if (pestanaActiva && pestanaActiva.startsWith('factura-rectificativa-nuevo')) {
      setFormulariosPorPestana(prev => {
        if (!prev[pestanaActiva]) {
          return {
            ...prev,
            [pestanaActiva]: { ...formFacturaRectificativaInicial }
          };
        }
        return prev;
      });
    }
  }, [pestanaActiva]);

  // Seleccionar automáticamente la serie con orden de prioridad: usuario > sistema > única
  useEffect(() => {
    // SOLO ejecutar para pestañas nuevas, NUNCA para edición
    if (!pestanaActiva || !pestanaActiva.startsWith('factura-rectificativa-nuevo')) return;
    if (seriesDisponibles.length === 0 || formFacturaRectificativa.serieId) return;
    
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
      setFormFacturaRectificativa(prev => ({ ...prev, serieId }));
    }
  }, [pestanaActiva, seriesDisponibles, formFacturaRectificativa.serieId, seriePreferidaUsuario, setFormFacturaRectificativa]);

  const cargarFacturasRectificativas = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      if (response.ok) {
        const data = await response.json();
        console.log("DEBUG RECTIFICATIVA - Facturas rectificativas cargadas:", data.length);
        
        // Cargar origen de cada documento
        const facturasRectificativasConOrigen = await Promise.all((Array.isArray(data) ? data : []).map(async (factura) => {
          try {
            console.log(`DEBUG RECTIFICATIVA - Cargando origen para factura rectificativa ${factura.id}`);
            const resOrigen = await fetch(`${TRANSFORMACIONES_API_URL}/origen-directo/FACTURA_RECTIFICATIVA/${factura.id}`);
            console.log(`DEBUG RECTIFICATIVA - Respuesta origen factura rectificativa ${factura.id}:`, resOrigen.status);
            if (resOrigen.ok) {
              const dataOrigen = await resOrigen.json();
              console.log(`DEBUG RECTIFICATIVA - Datos origen factura rectificativa ${factura.id}:`, dataOrigen);
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
                return tipos[tipo] || 'Manual';
              };
              const origenFormateado = formatearTipo(dataOrigen.tipoOrigen);
              console.log(`DEBUG RECTIFICATIVA - Origen formateado factura rectificativa ${factura.id}:`, origenFormateado);
              return { ...factura, origen: origenFormateado };
            }
            return { ...factura, origen: null };
          } catch (err) {
            console.error(`DEBUG RECTIFICATIVA - Error cargando origen factura rectificativa ${factura.id}:`, err);
            return { ...factura, origen: null };
          }
        }));
        
        console.log("DEBUG RECTIFICATIVA - Facturas rectificativas con origen:", facturasRectificativasConOrigen);
        setFacturasRectificativas(facturasRectificativasConOrigen);
        setPaginacion({ totalElements: data.length || 0, totalPages: 1 });
      }
    } catch (error) {
      console.error("Error al cargar facturas rectificativas:", error);
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

  // Cargar datos solo cuando hay una pestaña de facturas rectificativas activa
  const [datosInicializados, setDatosInicializados] = useState(false);
  
  // Cargar datos al montar el componente (para vista de listado)
  useEffect(() => {
    cargarFacturasRectificativas();
  }, []);
  
  useEffect(() => {
    // Solo cargar datos si hay una pestaña de facturas rectificativas activa y no se han cargado aún
    const esPestanaFacturasRect = typeof pestanaActiva === 'string' && (
      pestanaActiva.startsWith('factura-rectificativa-nuevo') || 
      pestanaActiva.startsWith('factura-rectificativa-editar')
    );
    
    if (esPestanaFacturasRect && !datosInicializados) {
      setDatosInicializados(true);
      cargarFacturasRectificativas();
      cargarClientes();
      cargarProductos();
      cargarTiposIva();
      cargarAlmacenes();
      cargarSeries();
      cargarConfiguracionVentas();
    }
  }, [pestanaActiva, datosInicializados, cargarFacturasRectificativas, cargarClientes, cargarProductos, cargarTiposIva, cargarAlmacenes, cargarSeries, cargarConfiguracionVentas]);

  useEffect(() => {
    // SOLO ejecutar para pestañas nuevas, NUNCA para edición
    if (typeof pestanaActiva !== 'string' || !pestanaActiva.startsWith('factura-rectificativa-nuevo')) return;
    cargarPreferenciaSerie();
  }, [pestanaActiva, cargarPreferenciaSerie]);

  // Generar número automáticamente cuando se selecciona una serie
  useEffect(() => {
    // SOLO ejecutar para pestañas nuevas, NUNCA para edición
    if (typeof pestanaActiva !== 'string' || !pestanaActiva.startsWith('factura-rectificativa-nuevo')) return;
    if (!formFacturaRectificativa.serieId || formFacturaRectificativa.usarCodigoManual || formFacturaRectificativa.id) return;

    const generarNumeroAutomatico = async () => {

      setGenerandoNumero(true);
      try {
        const response = await fetch(`${API_URL}/siguiente-numero?serieId=${formFacturaRectificativa.serieId}`);
        if (response.ok) {
          const data = await response.json();
          setFormFacturaRectificativa(prev => ({ ...prev, numero: data.numero || data }));
        }
      } catch (error) {
        console.error('Error al generar número:', error);
      } finally {
        setGenerandoNumero(false);
      }
    };

    generarNumeroAutomatico();
  }, [pestanaActiva, formFacturaRectificativa.serieId, formFacturaRectificativa.usarCodigoManual, formFacturaRectificativa.id, setFormFacturaRectificativa]);

  const updateFormFacturaRectificativaField = useCallback((field, value) => {
    setFormFacturaRectificativa((prev) => {
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
  }, [permitirVentaMultialmacen, seriesDisponibles, almacenes, setFormFacturaRectificativa]);

  // Solo aplicar el descuento de la agrupación del cliente si el campo manual está vacío
  useEffect(() => {
    if (!formFacturaRectificativa.clienteId) return;

    if (formFacturaRectificativa.descuentoAgrupacionManual !== null && formFacturaRectificativa.descuentoAgrupacionManual !== undefined) {
      return;
    }

    const clienteSeleccionado = clientes.find((c) => c.id === parseInt(formFacturaRectificativa.clienteId));
    const descuentoCliente = clienteSeleccionado?.agrupacion?.descuentoGeneral;

    if (descuentoCliente !== undefined && descuentoCliente !== null) {
      setFormFacturaRectificativa((prev) => ({
        ...prev,
        descuentoAgrupacionManual: descuentoCliente,
      }));
    }
  }, [formFacturaRectificativa.clienteId, formFacturaRectificativa.descuentoAgrupacionManual, clientes]);

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

  // Descuento base de la agrupación del cliente
  const descuentoAgrupacionBase = useMemo(() => {
    if (!formFacturaRectificativa.clienteId) return 0;
    const cliente = clientes.find(c => c.id === parseInt(formFacturaRectificativa.clienteId));
    return cliente?.agrupacion?.descuentoGeneral || 0;
  }, [formFacturaRectificativa.clienteId, clientes]);

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
        
        const descuentoAgrupacionPct = parseFloat(formFacturaRectificativa.descuentoAgrupacionManual ?? formFacturaRectificativa.descuentoAgrupacion) || 0;
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
    const descuentoAgrupacionPct = parseFloat(formFacturaRectificativa.descuentoAgrupacionManual ?? formFacturaRectificativa.descuentoAgrupacion) || 0;
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
  }, [formFacturaRectificativa.lineas, formFacturaRectificativa.descuentoAgrupacionManual, formFacturaRectificativa.descuentoAgrupacion, formFacturaRectificativa.clienteId, productos, tiposIva, clientes, descuentoAgrupacionBase]);

  const guardarFacturaRectificativa = useCallback(
    async (e, opciones = {}) => {
      if (e) e.preventDefault();
      const { confirmarCambioEstado = false } = opciones;

      // Validar que el número no esté vacío
      if (!formFacturaRectificativa.numero || formFacturaRectificativa.numero.trim() === "") {
        alert("El número del documento no puede estar vacío. Selecciona una serie o activa la numeración manual.");
        return;
      }

      // Detectar cambio de estado
      const estadoActual = estadoOriginalFacturaRectificativa || formFacturaRectificativa.estado;
      const estadoNuevo = formFacturaRectificativa.estado;
      const eraEmitido = estadoActual === "Emitido";
      const esEmitido = estadoNuevo === "Emitido";
      
      // Si cambia A Emitido, mostrar modal de incremento (devolución)
      if (!eraEmitido && esEmitido && !confirmarCambioEstado) {
        const productosAfectados = formFacturaRectificativa.lineas
          .filter(l => l.productoId && l.cantidad > 0)
          .map(l => {
            const producto = productos.find(p => p.id === parseInt(l.productoId));
            const almacen = almacenes.find(a => a.id === parseInt(l.almacenId));
            return {
              nombre: l.nombreProducto || producto?.nombre || 'Producto',
              cantidad: l.cantidad,
              almacen: almacen?.nombre || 'Principal'
            };
          });
        
        setDatosModalCambioEstado({
          tipo: 'INCREMENTO',
          estadoOrigen: estadoActual,
          estadoDestino: estadoNuevo,
          productos: productosAfectados
        });
        setMostrarModalCambioEstado(true);
        return;
      }
      
      // Si cambia DESDE Emitido a otro estado, mostrar modal de decremento
      if (eraEmitido && !esEmitido && !confirmarCambioEstado) {
        const productosAfectados = formFacturaRectificativa.lineas
          .filter(l => l.productoId && l.cantidad > 0)
          .map(l => {
            const producto = productos.find(p => p.id === parseInt(l.productoId));
            const almacen = almacenes.find(a => a.id === parseInt(l.almacenId));
            return {
              nombre: l.nombreProducto || producto?.nombre || 'Producto',
              cantidad: l.cantidad,
              almacen: almacen?.nombre || 'Principal'
            };
          });
        
        setDatosModalCambioEstado({
          tipo: 'DECREMENTO',
          estadoOrigen: estadoActual,
          estadoDestino: estadoNuevo,
          productos: productosAfectados
        });
        setMostrarModalCambioEstado(true);
        return;
      }

      try {
        const totales = calcularTotales;
        
        // Convertir snapshots a campos planos para el backend
        const direccionFacturacion = formFacturaRectificativa.direccionFacturacionSnapshot || {};
        const direccionEnvio = formFacturaRectificativa.direccionEnvioSnapshot || {};
        
        const payload = {
          ...formFacturaRectificativa,
          notas: formFacturaRectificativa.notas || "",
          descuentoAgrupacion: formFacturaRectificativa.descuentoAgrupacionManual ?? formFacturaRectificativa.descuentoAgrupacion ?? 0,
          subtotal: parseFloat(totales.subtotal),
          totalIva: parseFloat(totales.totalIva),
          total: parseFloat(totales.total),
          // Campos planos de dirección de facturación
          direccionFacturacionPais: direccionFacturacion.pais || "",
          direccionFacturacionCodigoPostal: direccionFacturacion.codigoPostal || "",
          direccionFacturacionProvincia: direccionFacturacion.provincia || "",
          direccionFacturacionPoblacion: direccionFacturacion.poblacion || "",
          direccionFacturacionDireccion: direccionFacturacion.direccion || "",
          // Campos planos de dirección de envío
          direccionEnvioPais: direccionEnvio.pais || "",
          direccionEnvioCodigoPostal: direccionEnvio.codigoPostal || "",
          direccionEnvioProvincia: direccionEnvio.provincia || "",
          direccionEnvioPoblacion: direccionEnvio.poblacion || "",
          direccionEnvioDireccion: direccionEnvio.direccion || "",
          // Eliminar los objetos snapshot del payload
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
          const facturaGuardada = await response.json();
          
          // Vincular adjuntos al documento recién guardado
          // Si la lista está vacía, se desvinculan todos los adjuntos existentes
          const adjuntosIds = (formFacturaRectificativa.adjuntos || []).map(a => a.id).filter(id => id && id > 0);
          console.log("DEBUG guardar - adjuntos a vincular:", adjuntosIds);
          try {
            await fetch(`${API_URL}/${facturaGuardada.id}/adjuntos`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(adjuntosIds),
            });
          } catch (e) {
            console.error("Error al vincular adjuntos:", e);
          }
          
          await cargarFacturasRectificativas();
          
          if (opciones.cerrarDespues) {
            setFormFacturaRectificativa(formFacturaRectificativaInicial);
            if (opciones.cerrarPestana) {
              opciones.cerrarPestana();
            }
          } else {
            setFormFacturaRectificativa(prev => ({
              ...prev,
              id: facturaGuardada.id,
              numero: facturaGuardada.numero,
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
    [formFacturaRectificativa, calcularTotales, cargarFacturasRectificativas, productos, almacenes, estadoOriginalFacturaRectificativa, setFormFacturaRectificativa, pestanaActiva]
  );

  const eliminarFacturaRectificativa = useCallback(
    async (id) => {
      try {
        const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        if (response.ok) {
          await cargarFacturasRectificativas();
        } else {
          throw new Error("Error al eliminar");
        }
      } catch (error) {
        console.error("Error al eliminar factura rectificativa:", error);
        throw error;
      }
    },
    [cargarFacturasRectificativas]
  );

  const confirmarCambioEstado = useCallback((e, opciones = {}) => {
    setMostrarModalCambioEstado(false);
    guardarFacturaRectificativa(e, { ...opciones, confirmarCambioEstado: true });
  }, [guardarFacturaRectificativa]);

  const cancelarCambioEstado = useCallback(() => {
    setMostrarModalCambioEstado(false);
    // Restaurar el estado original
    if (estadoOriginalFacturaRectificativa) {
      setFormFacturaRectificativa(prev => ({
        ...prev,
        estado: estadoOriginalFacturaRectificativa
      }), pestanaActiva);
    }
  }, [estadoOriginalFacturaRectificativa, setFormFacturaRectificativa, pestanaActiva]);

  const duplicarFacturaRectificativa = useCallback(
    async (id) => {
      try {
        const response = await fetch(`${API_URL}/${id}/duplicar`, { method: "POST" });
        if (response.ok) {
          const duplicado = await response.json();
          await cargarFacturasRectificativas();
          return duplicado;
        } else {
          throw new Error("Error al duplicar");
        }
      } catch (error) {
        console.error("Error al duplicar factura rectificativa:", error);
        throw error;
      }
    },
    [cargarFacturasRectificativas]
  );

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
        setFormFacturaRectificativa((prev) => ({
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
      const adjunto = formFacturaRectificativa.adjuntos?.find(a => a.id === adjuntoId || a.id === 0);
      if (adjunto?.idReal) {
        try {
          await fetch(`${ARCHIVOS_API_URL}/${adjunto.idReal}`, { method: "DELETE" });
        } catch (e) {
          console.error("Error al eliminar adjunto temporal:", e);
        }
      }
    }
    // Siempre quitar del estado local
    setFormFacturaRectificativa((prev) => ({
      ...prev,
      adjuntos: prev.adjuntos.filter((a) => a.id !== adjuntoId),
    }));
  }, [formFacturaRectificativa.adjuntos]);

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

  const cargarFacturaRectificativaParaEditar = useCallback(async (facturaRectificativa) => {
    const { id, pestanaId } = facturaRectificativa;
    try {
      const response = await fetch(`${API_URL}/${id}`);
      if (!response.ok) throw new Error('Error al cargar factura rectificativa');
      
      const facturaCompleta = await response.json();
      
      setFormFacturaRectificativa({
        id: facturaCompleta.id,
        numero: facturaCompleta.numero,
        fecha: facturaCompleta.fecha,
        clienteId: facturaCompleta.cliente?.id?.toString() || "",
        estado: facturaCompleta.estado || "Pendiente",
        observaciones: facturaCompleta.observaciones || "",
        notas: facturaCompleta.notas || "",
        serieId: facturaCompleta.serie?.id?.toString() || "",
        tarifaId: facturaCompleta.tarifa?.id || null,
        almacenId: facturaCompleta.almacen?.id?.toString() || "",
        ventaMultialmacen: facturaCompleta.ventaMultialmacen || false,
        descuentoAgrupacion: facturaCompleta.descuentoAgrupacion || 0,
        descuentoAgrupacionManual: facturaCompleta.descuentoAgrupacion || 0,
        usarCodigoManual: true,
        lineas: (facturaCompleta.lineas || []).map(linea => ({
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
          pais: facturaCompleta.direccionFacturacionPais || "",
          codigoPostal: facturaCompleta.direccionFacturacionCodigoPostal || "",
          provincia: facturaCompleta.direccionFacturacionProvincia || "",
          poblacion: facturaCompleta.direccionFacturacionPoblacion || "",
          direccion: facturaCompleta.direccionFacturacionDireccion || "",
        },
        direccionEnvioSnapshot: {
          pais: facturaCompleta.direccionEnvioPais || "",
          codigoPostal: facturaCompleta.direccionEnvioCodigoPostal || "",
          provincia: facturaCompleta.direccionEnvioProvincia || "",
          poblacion: facturaCompleta.direccionEnvioPoblacion || "",
          direccion: facturaCompleta.direccionEnvioDireccion || "",
        },
        adjuntos: facturaCompleta.adjuntos || [],
      }, pestanaId);
      
      // Guardar el estado original para detectar cambios
      setEstadoOriginalFacturaRectificativa(facturaCompleta.estado || "Pendiente");
    } catch (error) {
      console.error('Error al cargar factura rectificativa para editar:', error);
      alert('Error al cargar la factura rectificativa');
    }
  }, []);

  return {
    facturasRectificativas,
    documentos: facturasRectificativas, // Alias para compatibilidad con DocumentoVentaListado
    formFacturaRectificativa,
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
    mostrarModalCambioEstado,
    datosModalCambioEstado,
    confirmarCambioEstado,
    cancelarCambioEstado,
    stockInfo,
    tarifasAlbaran,
    cargarFacturasRectificativas,
    cargarDocumentos: cargarFacturasRectificativas, // Alias para compatibilidad con DocumentoVentaListado
    updateFormFacturaRectificativaField,
    setDireccionSnapshot,
    updateDireccionSnapshotField,
    agregarLinea,
    eliminarLinea,
    actualizarLinea,
    calcularTotales,
    guardarFacturaRectificativa,
    eliminarFacturaRectificativa,
    duplicarFacturaRectificativa,
    descargarPdf,
    subirAdjunto,
    eliminarAdjunto,
    descargarAdjunto,
    guardarPreferenciaSerie,
    cargarFacturaRectificativaParaEditar,
    setFormFacturaRectificativa,
    limpiarFormularioPestana,
  };
}
