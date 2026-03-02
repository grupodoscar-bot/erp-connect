import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useTarifasAlbaran } from "./useTarifasAlbaran";
import { useStockProductos } from "./useStockProductos";
import API_ENDPOINTS from "../../config/api";

const API_URL = API_ENDPOINTS.facturas;
const CLIENTES_API_URL = API_ENDPOINTS.clientes;
const PRODUCTOS_API_URL = API_ENDPOINTS.productos;
const TIPOS_IVA_API_URL = API_ENDPOINTS.tiposIva;
const TRANSFORMACIONES_API_URL = API_ENDPOINTS.documentoTransformaciones;
const ARCHIVOS_API_URL = API_ENDPOINTS.archivosEmpresa;
const SERIES_API_URL = API_ENDPOINTS.series;
const SERIES_PREF_API_URL = API_ENDPOINTS.seriesPreferencias;
const ALMACENES_API_URL = API_ENDPOINTS.almacenes;
const API_URL_CONFIG_VENTAS = API_ENDPOINTS.configuracionVentas;
const DOCUMENTO_SERIE_TIPO = "FACTURA_VENTA";

const ESTADOS_FACTURA_PREDETERMINADOS = [
  { nombre: "Pendiente", colorClaro: "#FDE68A55", colorOscuro: "#92400E55" },
  { nombre: "Emitido", colorClaro: "#BBF7D055", colorOscuro: "#14532D55" },
  { nombre: "Cobrada", colorClaro: "#A7F3D055", colorOscuro: "#065F4655" },
  { nombre: "Vencida", colorClaro: "#FECACA55", colorOscuro: "#7F1D1D55" },
  { nombre: "Cancelada", colorClaro: "#E5E7EB55", colorOscuro: "#37415155" },
];

const formFacturaInicial = {
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

export function useFacturasForm(pestanaActiva = null, session = null) {
  const [facturas, setFacturas] = useState([]);
  // Mapa de formularios por ID de pestaña para permitir múltiples instancias
  const [formulariosPorPestana, setFormulariosPorPestana] = useState({});
  
  // Obtener formulario de la pestaña actual
  const formFactura = useMemo(() => {
    if (!pestanaActiva) return formFacturaInicial;
    return formulariosPorPestana[pestanaActiva] || formFacturaInicial;
  }, [formulariosPorPestana, pestanaActiva]);
  
  // Función para actualizar el formulario de la pestaña actual
  const setFormFactura = useCallback((nuevoFormulario, pestanaId = null) => {
    const idPestana = pestanaId || pestanaActiva;
    if (!idPestana) return;
    
    setFormulariosPorPestana(prev => ({
      ...prev,
      [idPestana]: typeof nuevoFormulario === 'function' 
        ? nuevoFormulario(prev[idPestana] || formFacturaInicial)
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
  const [documentoDescuentaStock, setDocumentoDescuentaStock] = useState("ALBARAN");
  const [mostrarModalCambioEstado, setMostrarModalCambioEstado] = useState(false);
  const [datosModalCambioEstado, setDatosModalCambioEstado] = useState({
    tipo: 'DESCUENTO',
    estadoOrigen: '',
    estadoDestino: '',
    productos: []
  });
  const [estadoOriginalFactura, setEstadoOriginalFactura] = useState(null);
  const [modalHistorialAbierto, setModalHistorialAbierto] = useState(false);
  const [documentoHistorial, setDocumentoHistorial] = useState(null);
  const [historialModal, setHistorialModal] = useState([]);
  const [cargandoHistorialModal, setCargandoHistorialModal] = useState(false);

  const tarifasAlbaran = useTarifasAlbaran(formFactura, setFormFactura);

  // Determinar si mostrar selector de almacén (solo si hay más de 1 almacén)
  const mostrarSelectorAlmacen = useMemo(() => almacenes.length > 1, [almacenes]);

  // Hook para obtener stock en tiempo real
  const stockInfo = useStockProductos(productos, formFactura.almacenId);

  const estadoOptions = ESTADOS_FACTURA_PREDETERMINADOS;

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
    if (typeof pestanaActiva === 'string' && pestanaActiva.startsWith('factura-nuevo')) {
      setFormulariosPorPestana(prev => {
        if (!prev[pestanaActiva]) {
          return {
            ...prev,
            [pestanaActiva]: { ...formFacturaInicial }
          };
        }
        return prev;
      });
    }
  }, [pestanaActiva]);

  // Seleccionar automáticamente la serie con orden de prioridad: usuario > sistema > única
  useEffect(() => {
    // SOLO ejecutar para pestañas nuevas, NUNCA para edición
    if (typeof pestanaActiva !== 'string' || !pestanaActiva.startsWith('factura-nuevo')) return;
    if (seriesDisponibles.length === 0 || formFactura.serieId) return;
    
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
      setFormFactura(prev => ({ ...prev, serieId }));
    }
  }, [pestanaActiva, seriesDisponibles, formFactura.serieId, seriePreferidaUsuario]);

  const cargarFacturas = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      if (response.ok) {
        const data = await response.json();
        console.log("DEBUG FACTURAS - Facturas cargadas:", data.length);
        
        // Cargar origen de cada documento
        const facturasConOrigen = await Promise.all((Array.isArray(data) ? data : []).map(async (factura) => {
          try {
            console.log(`DEBUG FACTURAS - Cargando origen para factura ${factura.id}`);
            const resOrigen = await fetch(`${TRANSFORMACIONES_API_URL}/origen-directo/FACTURA/${factura.id}`);
            console.log(`DEBUG FACTURAS - Respuesta origen factura ${factura.id}:`, resOrigen.status);
            if (resOrigen.ok) {
              const dataOrigen = await resOrigen.json();
              console.log(`DEBUG FACTURAS - Datos origen factura ${factura.id}:`, dataOrigen);
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
              console.log(`DEBUG FACTURAS - Origen formateado factura ${factura.id}:`, origenFormateado);
              return { ...factura, origen: origenFormateado };
            }
            return { ...factura, origen: null };
          } catch (err) {
            console.error(`DEBUG FACTURAS - Error cargando origen factura ${factura.id}:`, err);
            return { ...factura, origen: null };
          }
        }));
        
        console.log("DEBUG FACTURAS - Facturas con origen:", facturasConOrigen);
        setFacturas(facturasConOrigen);
        setPaginacion({ totalElements: data.length || 0, totalPages: 1 });
      }
    } catch (error) {
      console.error("Error al cargar facturas:", error);
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
      setDocumentoDescuentaStock(data.documentoDescuentaStock || "ALBARAN");
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

  // Cargar datos solo cuando hay una pestaña de facturas activa
  const [datosInicializados, setDatosInicializados] = useState(false);
  
  // Cargar datos al montar el componente (para vista de listado)
  useEffect(() => {
    cargarFacturas();
  }, []);
  
  useEffect(() => {
    // Solo cargar datos si hay una pestaña de facturas activa y no se han cargado aún
    const esPestanaFacturas = typeof pestanaActiva === 'string' && (
      pestanaActiva.startsWith('factura-nuevo') || 
      pestanaActiva.startsWith('factura-editar')
    );
    
    if (esPestanaFacturas && !datosInicializados) {
      setDatosInicializados(true);
      cargarFacturas();
      cargarClientes();
      cargarProductos();
      cargarTiposIva();
      cargarAlmacenes();
      cargarSeries();
      cargarConfiguracionVentas();
    }
  }, [pestanaActiva, datosInicializados, cargarFacturas, cargarClientes, cargarProductos, cargarTiposIva, cargarAlmacenes, cargarSeries, cargarConfiguracionVentas]);

  useEffect(() => {
    // SOLO ejecutar para pestañas nuevas, NUNCA para edición
    if (typeof pestanaActiva !== 'string' || !pestanaActiva.startsWith('factura-nuevo')) return;
    cargarPreferenciaSerie();
  }, [pestanaActiva, cargarPreferenciaSerie]);

  // Generar número automáticamente cuando se selecciona una serie
  useEffect(() => {
    // SOLO ejecutar para pestañas nuevas, NUNCA para edición
    if (typeof pestanaActiva !== 'string' || !pestanaActiva.startsWith('factura-nuevo')) return;
    if (!formFactura.serieId || formFactura.usarCodigoManual || formFactura.id) return;

    const generarNumeroAutomatico = async () => {

      setGenerandoNumero(true);
      try {
        const response = await fetch(`${API_URL}/siguiente-numero?serieId=${formFactura.serieId}`);
        if (response.ok) {
          const data = await response.json();
          setFormFactura(prev => ({ ...prev, numero: data.numero || data }));
        }
      } catch (error) {
        console.error('Error al generar número:', error);
      } finally {
        setGenerandoNumero(false);
      }
    };

    generarNumeroAutomatico();
  }, [pestanaActiva, formFactura.serieId, formFactura.usarCodigoManual, formFactura.id]);

  const updateFormFacturaField = useCallback((field, value) => {
    setFormFactura((prev) => {
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
  }, [permitirVentaMultialmacen, seriesDisponibles, almacenes, setFormFactura]);

  // Solo aplicar el descuento del cliente cuando el campo manual esté vacío
  useEffect(() => {
    if (!formFactura.clienteId) return;
    if (formFactura.descuentoAgrupacionManual !== null && formFactura.descuentoAgrupacionManual !== undefined) {
      return;
    }

    const clienteSeleccionado = clientes.find((c) => c.id === parseInt(formFactura.clienteId));
    const descuentoCliente = clienteSeleccionado?.agrupacion?.descuentoGeneral;

    if (descuentoCliente !== undefined && descuentoCliente !== null) {
      setFormFactura((prev) => ({
        ...prev,
        descuentoAgrupacionManual: descuentoCliente,
      }));
    }
  }, [formFactura.clienteId, formFactura.descuentoAgrupacionManual, clientes, setFormFactura]);

  const setDireccionSnapshot = useCallback((tipo, direccion) => {
    const campo = tipo === "facturacion" ? "direccionFacturacionSnapshot" : "direccionEnvioSnapshot";
    setFormFactura((prev) => ({ ...prev, [campo]: direccion }));
  }, [setFormFactura]);

  const updateDireccionSnapshotField = useCallback((tipo, field, value) => {
    const campo = tipo === "facturacion" ? "direccionFacturacionSnapshot" : "direccionEnvioSnapshot";
    setFormFactura((prev) => ({
      ...prev,
      [campo]: { ...(prev[campo] || {}), [field]: value },
    }));
  }, [setFormFactura]);

  const agregarLinea = useCallback(() => {
    setFormFactura((prev) => ({
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
  }, [setFormFactura]);

  const eliminarLinea = useCallback((index) => {
    setFormFactura((prev) => ({
      ...prev,
      lineas: prev.lineas.filter((_, i) => i !== index),
    }));
  }, [setFormFactura]);

  const actualizarLinea = useCallback((index, field, value) => {
    setFormFactura((prev) => {
      const nuevasLineas = [...prev.lineas];
      nuevasLineas[index] = { ...nuevasLineas[index], [field]: value };
      return { ...prev, lineas: nuevasLineas };
    });
  }, [setFormFactura]);

  // Descuento base de la agrupación
  const descuentoAgrupacionBase = useMemo(() => {
    if (!formFactura.clienteId) return 0;
    const cliente = clientes.find((c) => c.id === parseInt(formFactura.clienteId));
    return cliente?.agrupacion?.descuentoGeneral || 0;
  }, [formFactura.clienteId, clientes]);

  const calcularTotales = useMemo(() => {
    let subtotalBruto = 0;
    let descuentoTotal = 0;
    let totalIva = 0;
    let totalRecargo = 0;
    const desglosePorIva = {};

    const cliente = clientes.find((c) => c.id === parseInt(formFactura.clienteId));
    
    formFactura.lineas.forEach((linea) => {
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
        const porcentajeIva = parseFloat(tipoIva.porcentajeIva ?? tipoIva.porcentaje) || 0;
        const porcentajeRecargo = cliente?.recargoEquivalencia && tipoIva.porcentajeRecargo
          ? parseFloat(tipoIva.porcentajeRecargo)
          : 0;

        const descuentoAgrupacionPct = parseFloat(formFactura.descuentoAgrupacionManual ?? formFactura.descuentoAgrupacion) || 0;
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
    const descuentoAgrupacionPct = parseFloat(formFactura.descuentoAgrupacionManual ?? formFactura.descuentoAgrupacion) || 0;
    const descuentoAgrupacionImporte = subtotal * (descuentoAgrupacionPct / 100);
    const totalBaseSinImpuestos = subtotal - descuentoAgrupacionImporte;
    const total = totalBaseSinImpuestos + totalIva + totalRecargo;

    const desgloseIva = Object.values(desglosePorIva)
      .filter((d) => d.baseImponible > 0)
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
  }, [formFactura.lineas, formFactura.descuentoAgrupacionManual, formFactura.descuentoAgrupacion, formFactura.clienteId, productos, tiposIva, clientes, descuentoAgrupacionBase]);

  const guardarFactura = useCallback(
    async (e, opciones = {}) => {
      if (e) e.preventDefault();
      const { confirmarCambioEstado = false } = opciones;

      // Validar que el número no esté vacío
      if (!formFactura.numero || formFactura.numero.trim() === "") {
        alert("El número del documento no puede estar vacío. Selecciona una serie o activa la numeración manual.");
        return;
      }

      // Detectar cambio de estado
      const estadoActual = estadoOriginalFactura || formFactura.estado;
      const estadoNuevo = formFactura.estado;
      const eraEmitido = estadoActual === "Emitido";
      const esEmitido = estadoNuevo === "Emitido";
      
      // Si cambia DESDE Emitido a otro estado, mostrar modal de restauración
      if (eraEmitido && !esEmitido && documentoDescuentaStock === "FACTURA" && !confirmarCambioEstado) {
        const productosAfectados = formFactura.lineas
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
          tipo: 'RESTAURACION',
          estadoOrigen: estadoActual,
          estadoDestino: estadoNuevo,
          productos: productosAfectados
        });
        setMostrarModalCambioEstado(true);
        return;
      }

      try {
        const payload = {
          ...formFactura,
          notas: formFactura.notas || "",
          descuentoAgrupacion: formFactura.descuentoAgrupacionManual ?? formFactura.descuentoAgrupacion ?? 0,
          subtotal: parseFloat(calcularTotales.subtotal),
          totalIva: parseFloat(calcularTotales.totalIva),
          total: parseFloat(calcularTotales.total),
          lineas: formFactura.lineas.map((linea) => ({
            productoId: parseInt(linea.productoId) || null,
            cantidad: parseFloat(linea.cantidad) || 0,
            precioUnitario: parseFloat(linea.precioUnitario) || 0,
            descuento: parseFloat(linea.descuento) || 0,
            tipoIvaId: parseInt(linea.tipoIvaId) || null,
            observaciones: linea.observaciones || "",
            almacenId: parseInt(linea.almacenId) || null,
          })),
        };

        const url = formFactura.id ? `${API_URL}/${formFactura.id}` : API_URL;
        const method = formFactura.id ? "PUT" : "POST";

        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          const facturaGuardada = await response.json();
          
          // Vincular adjuntos al documento recién guardado
          // Si la lista está vacía, se desvinculan todos los adjuntos existentes
          const adjuntosIds = (formFactura.adjuntos || []).map(a => a.id).filter(id => id && id > 0);
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
          
          await cargarFacturas();
          
          if (opciones.cerrarDespues) {
            setFormFactura(formFacturaInicial);
            if (opciones.cerrarPestana) {
              opciones.cerrarPestana();
            }
          } else {
            setFormFactura(prev => ({
              ...prev,
              id: facturaGuardada.id,
              numero: facturaGuardada.numero,
            }));
          }
          
          alert("Factura guardada correctamente");
        } else {
          const error = await response.text();
          alert(`Error al guardar: ${error}`);
        }
      } catch (error) {
        console.error("Error al guardar factura:", error);
        alert("Error al guardar la factura");
      }
    },
    [formFactura, calcularTotales, cargarFacturas, setFormFactura]
  );

  const eliminarFactura = useCallback(
    async (id) => {
      try {
        const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        if (response.ok) {
          await cargarFacturas();
        } else {
          throw new Error("Error al eliminar");
        }
      } catch (error) {
        console.error("Error al eliminar factura:", error);
        throw error;
      }
    },
    [cargarFacturas]
  );

  const confirmarCambioEstado = useCallback((e, opciones = {}) => {
    setMostrarModalCambioEstado(false);
    guardarFactura(e, { ...opciones, confirmarCambioEstado: true });
  }, [guardarFactura]);

  const cancelarCambioEstado = useCallback(() => {
    setMostrarModalCambioEstado(false);
    // Restaurar el estado original
    if (estadoOriginalFactura) {
      setFormFactura(prev => ({
        ...prev,
        estado: estadoOriginalFactura
      }), pestanaActiva);
    }
  }, [estadoOriginalFactura, setFormFactura, pestanaActiva]);

  const duplicarFactura = useCallback(
    async (id) => {
      try {
        const response = await fetch(`${API_URL}/${id}/duplicar`, { method: "POST" });
        if (response.ok) {
          const duplicado = await response.json();
          await cargarFacturas();
          return duplicado;
        } else {
          throw new Error("Error al duplicar");
        }
      } catch (error) {
        console.error("Error al duplicar factura:", error);
        throw error;
      }
    },
    [cargarFacturas]
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
        setFormFactura((prev) => ({
          ...prev,
          adjuntos: [...(prev.adjuntos || []), adjunto],
        }));
      }
    } catch (error) {
      console.error("Error al subir adjunto:", error);
    }
  }, [setFormFactura]);

  const eliminarAdjunto = useCallback(async (adjuntoId) => {
    // Solo eliminar físicamente si es temporal (ID 0 o null)
    if (!adjuntoId || adjuntoId === 0) {
      const adjunto = formFactura.adjuntos?.find(a => a.id === adjuntoId || a.id === 0);
      if (adjunto?.idReal) {
        try {
          await fetch(`${ARCHIVOS_API_URL}/${adjunto.idReal}`, { method: "DELETE" });
        } catch (e) {
          console.error("Error al eliminar adjunto temporal:", e);
        }
      }
    }
    // Siempre quitar del estado local
    setFormFactura((prev) => ({
      ...prev,
      adjuntos: prev.adjuntos.filter((a) => a.id !== adjuntoId),
    }));
  }, [formFactura.adjuntos, setFormFactura]);

// ...
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

  const guardarPreferenciaSerie = useCallback(async (serieIdOrEvent) => {
    if (!usuarioId) {
      console.warn("No hay usuario activo para guardar la preferencia");
      return;
    }

    const serieId = typeof serieIdOrEvent === "object" && serieIdOrEvent?.target
      ? (serieIdOrEvent.preventDefault?.(), formFactura.serieId)
      : (serieIdOrEvent || formFactura.serieId);

    if (!serieId) return;

    setGuardandoPreferenciaSerie(true);
    try {
      const response = await fetch(SERIES_PREF_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipoDocumento: DOCUMENTO_SERIE_TIPO, serieId, usuarioId }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Error al guardar preferencia");
      }
    } catch (error) {
      console.error("Error al guardar preferencia:", error);
    } finally {
      setGuardandoPreferenciaSerie(false);
    }
  }, [formFactura.serieId, usuarioId]);

  const cargarFactura = useCallback(
    async (factura) => {
      const { id, pestanaId } = factura;
      try {
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) throw new Error("Error al cargar factura");

        const facturaCompleta = await response.json();

        setFormFactura({
          id: facturaCompleta.id,
          numero: facturaCompleta.numero,
          fecha: facturaCompleta.fecha,
          clienteId: facturaCompleta.cliente?.id?.toString() || "",
          estado: facturaCompleta.estado || "Pendiente",
          observaciones: facturaCompleta.observaciones || "",
          notas: facturaCompleta.notas || "",
          serieId: facturaCompleta.serie?.id?.toString() || "",
          tarifaId: facturaCompleta.tarifa?.id || null,
          almacenId: facturaCompleta.almacen?.id || null,
          ventaMultialmacen: facturaCompleta.ventaMultialmacen || false,
          descuentoAgrupacion: facturaCompleta.descuentoAgrupacion || 0,
          descuentoAgrupacionManual: facturaCompleta.descuentoAgrupacion || 0,
          usarCodigoManual: true,
          lineas: (facturaCompleta.lineas || []).map((linea) => ({
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
        setEstadoOriginalFactura(facturaCompleta.estado || "Pendiente");
      } catch (error) {
        console.error("Error al cargar factura:", error);
        alert("Error al cargar la factura");
      }
    },
    [setFormFactura]
  );

  const cargarHistorialTransformaciones = useCallback(async (tipo, id) => {
    try {
      const res = await fetch(`${TRANSFORMACIONES_API_URL}/historial/${tipo}/${id}`);
      if (res.ok) {
        return await res.json();
      }
      return [];
    } catch (err) {
      console.error('Error al cargar historial de transformaciones:', err);
      return [];
    }
  }, []);

  const abrirModalHistorialDocumento = useCallback(async (factura) => {
    setDocumentoHistorial({ tipo: 'FACTURA', id: factura.id, numero: factura.numero });
    setModalHistorialAbierto(true);
    setCargandoHistorialModal(true);
    try {
      const historial = await cargarHistorialTransformaciones('FACTURA', factura.id);
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
    facturas,
    documentos: facturas, // Alias para compatibilidad con DocumentoVentaListado
    formFactura,
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
    documentoDescuentaStock,
    mostrarModalCambioEstado,
    datosModalCambioEstado,
    confirmarCambioEstado,
    cancelarCambioEstado,
    stockInfo,
    tarifasAlbaran,
    // Modal historial
    modalHistorialAbierto,
    documentoHistorial,
    historialModal,
    cargandoHistorialModal,
    abrirModalHistorialDocumento,
    cerrarModalHistorial,
    cargarFacturas,
    cargarDocumentos: cargarFacturas, // Alias para compatibilidad con DocumentoVentaListado
    updateFormFacturaField,
    setDireccionSnapshot,
    updateDireccionSnapshotField,
    agregarLinea,
    eliminarLinea,
    actualizarLinea,
    calcularTotales,
    guardarFactura,
    eliminarFactura,
    duplicarFactura,
    descargarPdf,
    subirAdjunto,
    eliminarAdjunto,
    descargarAdjunto,
    guardarPreferenciaSerie,
    cargarFactura,
    setFormFactura,
    limpiarFormularioPestana,
  };
}
