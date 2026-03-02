import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useDocumentoVentaFormBase } from "./useDocumentoVentaFormBase";
import { useConfiguracion } from "../configuracion/useConfiguracion";
import { useTarifasAlbaran } from "./useTarifasAlbaran";
import { useStockProductos } from "./useStockProductos";
import {
  aplicarCondicionComercialEnLinea,
  aplicarDescuentosAgrupacionEnLineas,
} from "../../utils/descuentosAgrupaciones";
import API_ENDPOINTS from "../../config/api";

const API_URL = API_ENDPOINTS.albaranes;
const CLIENTES_API_URL = API_ENDPOINTS.clientes;
const PRODUCTOS_API_URL = API_ENDPOINTS.productos;
const CONDICIONES_API_URL = API_ENDPOINTS.condicionesComerciales;
const TIPOS_IVA_API_URL = API_ENDPOINTS.tiposIva;
const ARCHIVOS_API_URL = API_ENDPOINTS.archivosEmpresa;
const SERIES_API_URL = API_ENDPOINTS.series;
const SERIES_PREF_API_URL = API_ENDPOINTS.seriesPreferencias;
const TRANSFORMACIONES_API_URL = API_ENDPOINTS.documentoTransformaciones;
const ALMACENES_API_URL = API_ENDPOINTS.almacenes;
const DOCUMENTO_SERIE_TIPO = "ALBARAN_VENTA";

const API_URL_CONFIG_VENTAS = API_ENDPOINTS.configuracionVentas;

const ESTADOS_ALBARAN_PREDETERMINADOS = [
  { nombre: "Pendiente", colorClaro: "#FDE68A55", colorOscuro: "#92400E55" },
  { nombre: "Emitido", colorClaro: "#BBF7D055", colorOscuro: "#14532D55" },
  { nombre: "Entregado", colorClaro: "#C7D2FE55", colorOscuro: "#312E8155" },
  { nombre: "Facturado", colorClaro: "#FBCFE855", colorOscuro: "#701A7555" },
  { nombre: "Cancelado", colorClaro: "#FECACA55", colorOscuro: "#7F1D1D55" },
];

const normalizarEstados = (lista) => {
  const vistos = new Set();
  const resultado = [];
  (Array.isArray(lista) ? lista : []).forEach((estado) => {
    if (typeof estado === "string") {
      const limpio = estado.trim();
      if (limpio && !vistos.has(limpio.toLowerCase())) {
        vistos.add(limpio.toLowerCase());
        resultado.push({ nombre: limpio, colorClaro: "#FDE68A55", colorOscuro: "#92400E55" });
      }
    } else if (estado && typeof estado === "object" && estado.nombre) {
      const limpio = estado.nombre.trim();
      if (limpio && !vistos.has(limpio.toLowerCase())) {
        vistos.add(limpio.toLowerCase());
        resultado.push({
          nombre: limpio,
          colorClaro: estado.colorClaro || "#FDE68A55",
          colorOscuro: estado.colorOscuro || "#92400E55"
        });
      }
    }
  });
  return resultado;
};

const safeNumber = (value, fallback = 0) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const findClienteById = (clientes, clienteId) => {
  if (!clienteId) return null;
  return clientes.find((c) => c.id === parseInt(clienteId));
};

const findProductoById = (productos, productoId) => {
  if (!productoId) return null;
  return productos.find((p) => p.id === parseInt(productoId));
};

const calcularTotalesLineaSinImpuestos = (linea = {}, descuentoAgrupacion = 0) => {
  const cantidad = parseFloat(linea.cantidad) || 0;
  const precio = parseFloat(linea.precioUnitario) || 0;
  const descuento = parseFloat(linea.descuento) || 0;
  const bruto = cantidad * precio;
  const descuentoImporte = bruto * (descuento / 100);
  const baseAntesAgrupacion = bruto - descuentoImporte;
  const descuentoAgrupacionImporte = baseAntesAgrupacion * (descuentoAgrupacion / 100);
  return {
    bruto,
    descuentoImporte,
    baseAntesAgrupacion,
    descuentoAgrupacionImporte,
    baseImponible: baseAntesAgrupacion - descuentoAgrupacionImporte,
  };
};

const calcularImpuestosLinea = (linea, producto, cliente, tiposIva = [], descuentoAgrupacion = 0) => {
  const { baseImponible } = calcularTotalesLineaSinImpuestos(linea, descuentoAgrupacion);
  
  // Si la línea tiene un tipoIvaId específico, usarlo; si no, usar el del producto
  let tipoIva = null;
  if (linea.tipoIvaId) {
    tipoIva = tiposIva.find(t => t.id === parseInt(linea.tipoIvaId));
  }
  if (!tipoIva) {
    tipoIva = producto?.tipoIva;
  }
  
  const porcentajeIva = tipoIva?.porcentajeIva ?? 0;
  const porcentajeRecargo =
    cliente?.recargoEquivalencia && tipoIva?.porcentajeRecargo
      ? tipoIva.porcentajeRecargo
      : 0;

  const importeIva = baseImponible * (porcentajeIva / 100);
  const importeRecargo = baseImponible * (porcentajeRecargo / 100);

  return {
    tipoIvaId: tipoIva?.id?.toString() || linea.tipoIvaId || "",
    tipoIvaNombre: tipoIva?.nombre || "",
    porcentajeIva,
    porcentajeRecargo,
    importeIva,
    importeRecargo,
  };
};

const aplicarImpuestosEnLineas = ({ lineas = [], clienteId, clientes, productos, tiposIva = [], descuentoAgrupacion = 0, preservarValoresExistentes = false }) => {
  const cliente = typeof clienteId === "object" ? clienteId : findClienteById(clientes, clienteId);
  return lineas.map((linea) => {
    if (!linea?.productoId) {
      return {
        ...linea,
        tipoIvaId: linea?.tipoIvaId || "",
        tipoIvaNombre: linea?.tipoIvaNombre || "",
        porcentajeIva: linea?.porcentajeIva || 0,
        porcentajeRecargo: linea?.porcentajeRecargo || 0,
        importeIva: linea?.importeIva || 0,
        importeRecargo: linea?.importeRecargo || 0,
      };
    }
    
    // Si preservarValoresExistentes es true y la línea ya tiene tipoIvaId, no recalcular
    if (preservarValoresExistentes && linea.tipoIvaId) {
      return linea;
    }
    
    const producto = findProductoById(productos, linea.productoId);
    const impuestos = calcularImpuestosLinea(linea, producto, cliente, tiposIva, descuentoAgrupacion);
    return {
      ...linea,
      ...impuestos,
    };
  });
};

const lineasSonIguales = (a = [], b = []) => {
  if (a.length !== b.length) return false;
  return a.every((linea, index) => {
    const otra = b[index];
    if (!otra) return false;
    return (
      linea.productoId === otra.productoId &&
      linea.cantidad === otra.cantidad &&
      linea.precioUnitario === otra.precioUnitario &&
      linea.descuento === otra.descuento &&
      linea.rangoPrecioEspecial === otra.rangoPrecioEspecial &&
      (linea.porcentajeIva || 0) === (otra.porcentajeIva || 0) &&
      (linea.porcentajeRecargo || 0) === (otra.porcentajeRecargo || 0) &&
      (linea.importeIva || 0) === (otra.importeIva || 0) &&
      (linea.importeRecargo || 0) === (otra.importeRecargo || 0)
    );
  });
};

const direccionSnapshotInicial = {
  pais: "España",
  codigoPostal: "",
  provincia: "",
  poblacion: "",
  direccion: "",
};

const formAlbaranInicial = {
  id: null,
  numero: "",
  fecha: new Date().toISOString().slice(0, 16),
  fechaOriginal: null, // Para tracking de cambios
  clienteId: "",
  direccionId: "",
  direccionFacturacionSnapshot: { ...direccionSnapshotInicial },
  direccionEnvioSnapshot: { ...direccionSnapshotInicial },
  observaciones: "",
  notas: "",
  estado: ESTADOS_ALBARAN_PREDETERMINADOS[0]?.nombre || "Pendiente",
  lineas: [],
  descuentoAgrupacionManual: 0,
  adjuntos: [],
  serieId: "",
  usarCodigoManual: false,
  almacenId: "",
  ventaMultialmacen: false,
};

const lineaInicial = {
  nombreProducto: "",
  productoId: "",
  referencia: "",
  cantidad: 1,
  precioUnitario: 0,
  descuento: 0,
  observaciones: "",
  tipoIvaId: "",
  tipoIvaNombre: "",
  porcentajeIva: 0,
  porcentajeRecargo: 0,
  importeIva: 0,
  importeRecargo: 0,
  almacenId: "",
};

export function useAlbaranes({ setMensaje, abrirPestana, cerrarPestana, pestanaActiva, session }) {
  // ========== HOOK BASE ==========
  const base = useDocumentoVentaFormBase(
    {
      tipoDocumento: "ALBARAN",
      endpoint: "albaranes",
      prefijoPestana: "albaran",
      formInicial: formAlbaranInicial,
      estadosPredeterminados: ESTADOS_ALBARAN_PREDETERMINADOS,
      tipoSerie: "ALBARAN_VENTA",
    },
    pestanaActiva,
    session
  );

  // ========== ALIASES (para que todo el código existente funcione sin cambios) ==========
  const formAlbaran = base.formDocumento;
  const setFormAlbaran = base.setFormDocumento;
  const limpiarFormularioPestana = base.limpiarFormularioPestana;
  const clientes = base.clientes;
  const productos = base.productos;
  const tiposIva = base.tiposIva;
  const almacenes = base.almacenes;
  const seriesDisponibles = base.seriesDisponibles;
  const cargandoSeries = base.cargandoSeries;
  const seriePreferidaUsuario = base.seriePreferidaUsuario;
  const guardarPreferenciaSerie = base.guardarPreferenciaSerie;
  const guardandoPreferenciaSerie = base.guardandoPreferenciaSerie;
  const estadoOptions = base.estadoOptions;
  const documentoDescuentaStock = base.documentoDescuentaStock;
  const permitirVentaMultialmacen = base.permitirVentaMultialmacen;
  const mostrarModalCambioEstado = base.mostrarModalCambioEstado;
  const setMostrarModalCambioEstado = base.setMostrarModalCambioEstado;
  const datosModalCambioEstado = base.datosModalCambioEstado;
  const setDatosModalCambioEstado = base.setDatosModalCambioEstado;

  // Estados específicos de albaranes (no están en el hook base)
  const [albaranes, setAlbaranes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [generandoNumero, setGenerandoNumero] = useState(false);
  const [mostrarConfirmacionStock, setMostrarConfirmacionStock] = useState(false);
  const [mostrarErrorStock, setMostrarErrorStock] = useState(false);
  const [mensajeErrorStock, setMensajeErrorStock] = useState("");

  // Ref para detectar cambios de estado que afectan stock (useRef para persistencia entre renders)
  const estadoOriginalAlbaran = useRef(null);
  
  // Hook de tarifas para albaranes
  const tarifasAlbaran = useTarifasAlbaran();

  const formAlbaranRef = useRef(formAlbaran);
  // Ref para evitar recálculo automático al cargar datos existentes
  const cargandoDatosExistentesRef = useRef(false);

  // Hook para obtener stock en tiempo real
  const stockInfo = useStockProductos(productos, formAlbaran.almacenId);

  const recalcularLineasConImpuestos = useCallback(
    (lineas, clienteId, descuentoAgrupacionParam = 0) =>
      aplicarImpuestosEnLineas({
        lineas,
        clienteId,
        clientes,
        productos,
        tiposIva,
        descuentoAgrupacion: descuentoAgrupacionParam,
      }),
    [clientes, productos, tiposIva]
  );

  const obtenerClienteConAgrupacion = useCallback(
    async (clienteId) => {
      if (!clienteId) return null;
      const idNumerico = parseInt(clienteId, 10);
      if (Number.isNaN(idNumerico)) return null;

      const clienteEnMemoria = clientes.find((c) => c.id === idNumerico);
      if (clienteEnMemoria?.agrupacion?.id) {
        return clienteEnMemoria;
      }

      try {
        const res = await fetch(`${CLIENTES_API_URL}/${idNumerico}`);
        if (res.ok) {
          return await res.json();
        }
      } catch (err) {
        console.error("Error al obtener datos del cliente para condiciones:", err);
      }

      return clienteEnMemoria || null;
    },
    [clientes]
  );

  const usuarioId = useMemo(
    () =>
      session?.usuario?.id ??
      session?.usuarioId ??
      session?.usuario?.usuarioId ??
      null,
    [session]
  );

  useEffect(() => {
    formAlbaranRef.current = formAlbaran;
  }, [formAlbaran]);

  // Inicializar formulario para nueva pestaña si no existe (solo para "nuevo", no para "editar")
  useEffect(() => {
    if (pestanaActiva && pestanaActiva.startsWith('albaran-nuevo')) {
      if (!formAlbaran.id && !formAlbaran.clienteId) {
        estadoOriginalAlbaran.current = ESTADOS_ALBARAN_PREDETERMINADOS[0]?.nombre || "Pendiente";
      }
    }
  }, [pestanaActiva, formAlbaran]);

  // Filtros (definir antes de usarlos en helpers)
  const [paginaActual, setPaginaActual] = useState(0);
  const [itemsPorPagina, setItemsPorPagina] = useState(50);
  const [totalElementos, setTotalElementos] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [ordenarPor, setOrdenarPor] = useState("fecha");
  const [ordenDireccion, setOrdenDireccion] = useState("desc");
  const [busqueda, setBusqueda] = useState("");
  const [filtroFechaDesde, setFiltroFechaDesde] = useState("");
  const [filtroFechaHasta, setFiltroFechaHasta] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroSerieId, setFiltroSerieId] = useState("");
  const [filtroNumero, setFiltroNumero] = useState("");
  const [filtroImporteMin, setFiltroImporteMin] = useState("");
  const [filtroImporteMax, setFiltroImporteMax] = useState("");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // Ordenar albaranes en el frontend para evitar recargas del backend
  const albaranesOrdenados = useMemo(() => {
    const docs = [...albaranes];
    
    docs.sort((a, b) => {
      let valorA, valorB;
      
      switch (ordenarPor) {
        case 'numero':
          valorA = a.numero || '';
          valorB = b.numero || '';
          break;
        case 'fecha':
          valorA = new Date(a.fecha || 0);
          valorB = new Date(b.fecha || 0);
          break;
        case 'cliente':
          valorA = a.cliente?.nombreComercial || '';
          valorB = b.cliente?.nombreComercial || '';
          break;
        case 'estado':
          valorA = a.estado || '';
          valorB = b.estado || '';
          break;
        case 'total':
          valorA = a.total || 0;
          valorB = b.total || 0;
          break;
        default:
          return 0;
      }
      
      if (valorA < valorB) return ordenDireccion === 'asc' ? -1 : 1;
      if (valorA > valorB) return ordenDireccion === 'asc' ? 1 : -1;
      return 0;
    });
    
    return docs;
  }, [albaranes, ordenarPor, ordenDireccion]);

  const serieIdPorDefecto = useMemo(() => {
    if (seriePreferidaUsuario?.serie?.id) {
      return seriePreferidaUsuario.serie.id.toString();
    }
    const serieDefault = seriesDisponibles.find(s => s.defaultSistema);
    if (serieDefault) return serieDefault.id.toString();
    const primeraActiva = seriesDisponibles.find(s => s.activo);
    if (primeraActiva) return primeraActiva.id.toString();
    if (seriesDisponibles.length > 0) return seriesDisponibles[0].id.toString();
    return "";
  }, [seriesDisponibles, seriePreferidaUsuario]);

  // Determinar almacén predeterminado: prioridad serie > primer almacén activo
  const almacenIdPorDefecto = useMemo(() => {
    // Si solo hay un almacén, usar ese
    if (almacenes.length === 1) return almacenes[0].id.toString();
    // Si hay serie seleccionada con almacén predeterminado, usar ese
    const serieActual = seriesDisponibles.find(s => s.id?.toString() === formAlbaran.serieId);
    if (serieActual?.almacenPredeterminado?.id) {
      return serieActual.almacenPredeterminado.id.toString();
    }
    // Si no, usar el primer almacén activo
    if (almacenes.length > 0) return almacenes[0].id.toString();
    return "";
  }, [pestanaActiva, seriesDisponibles, formAlbaran.serieId, seriePreferidaUsuario, setFormAlbaran, almacenes]);

  // Determinar si mostrar selector de almacén (solo si hay más de 1 almacén)
  const mostrarSelectorAlmacen = useMemo(() => almacenes.length > 1, [almacenes, setFormAlbaran]);

  // asegurarEstadoEnOpciones, cargarConfiguracionVentas, sincronizarEstadosConfigurables,
  // cargarEstadosConfiguracion, cargarAlmacenes → Ya están en el hook base

  // Selección múltiple
  const [albaranesSeleccionados, setAlbaranesSeleccionados] = useState([]);
  const [seleccionarTodos, setSeleccionarTodos] = useState(false);

  // Modal transformar
  const [albaranParaTransformar, setAlbaranParaTransformar] = useState(null);
  const [modalTransformarAbierto, setModalTransformarAbierto] = useState(false);
  const [tipoTransformacionSeleccionado, setTipoTransformacionSeleccionado] = useState(null);
  const [serieSeleccionada, setSerieSeleccionada] = useState("");
  // Series locales para el modal de transformación (puede cargar series de otros tipos de documento)
  const [seriesTransformacion, setSeriesTransformacion] = useState([]);
  const [cargandoSeriesTransformacion, setCargandoSeriesTransformacion] = useState(false);
  // Estados para selector de proveedor
  const [proveedorId, setProveedorId] = useState('');
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);
  const [proveedoresLista, setProveedoresLista] = useState([]);
  const [busquedaProveedor, setBusquedaProveedor] = useState('');
  const [mostrarProveedores, setMostrarProveedores] = useState(false);
  const dropdownProveedorRef = useRef(null);
  const [fechaTransformacion, setFechaTransformacion] = useState(new Date().toISOString().slice(0, 16));
  const [estadoTransformacion, setEstadoTransformacion] = useState("Pendiente");

  // Modal email
  const [modalEmailAbierto, setModalEmailAbierto] = useState(false);
  const [albaranParaEmail, setAlbaranParaEmail] = useState(null);
  const [emailDestinatario, setEmailDestinatario] = useState("");
  const [emailAsunto, setEmailAsunto] = useState("");
  const [emailCuerpo, setEmailCuerpo] = useState("");

  // Modal PDF múltiple
  const [modalPdfMultipleAbierto, setModalPdfMultipleAbierto] = useState(false);
  const [tipoPdfMultiple, setTipoPdfMultiple] = useState("individual");

  // Modal historial transformaciones
  const [modalHistorialAbierto, setModalHistorialAbierto] = useState(false);
  const [documentoHistorial, setDocumentoHistorial] = useState(null);
  const [historialModal, setHistorialModal] = useState([]);
  const [cargandoHistorialModal, setCargandoHistorialModal] = useState(false);

  // ========== CARGA DE DATOS ==========
  const cargarAlbaranes = useCallback(async () => {
    try {
      setCargando(true);
      const params = new URLSearchParams({
        page: paginaActual.toString(),
        size: itemsPorPagina.toString(),
        sortBy: ordenarPor,
        sortDir: ordenDireccion.toUpperCase()
      });

      if (busqueda) params.append("search", busqueda.trim());
      if (filtroEstado) params.append("estado", filtroEstado);

      // Usar endpoint /paginado para que el backend solo devuelva los registros de esa página
      const res = await fetch(`${API_URL}/paginado?${params}`);
      const data = await res.json();

      if (data.content) {
        let resultado = data.content;
        
        // Filtros locales adicionales
        if (filtroFechaDesde) {
          resultado = resultado.filter(a => a.fecha >= filtroFechaDesde);
        }
        if (filtroFechaHasta) {
          resultado = resultado.filter(a => a.fecha <= filtroFechaHasta);
        }
        if (filtroSerieId) {
          resultado = resultado.filter(a => {
            const serieId = a.serie?.id || a.serieId;
            return serieId?.toString() === filtroSerieId;
          });
        }
        if (filtroNumero) {
          const filtroNumeroUpper = filtroNumero.toString().trim().toUpperCase();
          resultado = resultado.filter(a => (a.numero || "").toString().toUpperCase().includes(filtroNumeroUpper));
        }
        if (filtroImporteMin) {
          resultado = resultado.filter(a => a.total >= parseFloat(filtroImporteMin));
        }
        if (filtroImporteMax) {
          resultado = resultado.filter(a => a.total <= parseFloat(filtroImporteMax));
        }

        // Cargar origen de cada documento y calcular totales
        const albaranesConOrigen = await Promise.all(resultado.map(async (albaran) => {
          // Calcular base e IVA si no vienen del backend
          let totalBaseSinImpuestos = albaran.totalBaseSinImpuestos || 0;
          let totalIva = albaran.totalIva || 0;
          
          // Si no tenemos los totales calculados, derivarlos del subtotal y total
          if (!albaran.totalBaseSinImpuestos) {
            const subtotal = albaran.subtotal || 0;
            const descuentoTotal = albaran.descuentoTotal || 0;
            const descuentoAgrupacion = albaran.descuentoAgrupacion || 0;
            const total = albaran.total || 0;
            
            // Base después de descuentos de línea
            const baseTrasDescuentosLinea = subtotal - descuentoTotal;
            // Base imponible final = base tras descuentos de línea con descuento de agrupación aplicado
            totalBaseSinImpuestos = baseTrasDescuentosLinea * (1 - descuentoAgrupacion / 100);
            // IVA = total - base imponible
            totalIva = total - totalBaseSinImpuestos;
          }
          
          try {
            const resOrigen = await fetch(`${TRANSFORMACIONES_API_URL}/origen-directo/ALBARAN/${albaran.id}`);
            if (resOrigen.ok) {
              const dataOrigen = await resOrigen.json();
              const formatearOrigen = (data) => {
                // Mapeo de tipos a nombres legibles
                const tipos = {
                  'PRESUPUESTO': 'Presupuesto',
                  'PEDIDO': 'Pedido',
                  'ALBARAN': 'Albarán',
                  'FACTURA': 'Factura',
                  'FACTURA_PROFORMA': 'F. Proforma',
                  'FACTURA_RECTIFICATIVA': 'F. Rectificativa',
                  'MANUAL': 'Manual'
                };
                
                // Siempre mostrar el tipo de documento origen
                return tipos[data.tipoOrigen] || 'Manual';
              };
              return { ...albaran, origen: formatearOrigen(dataOrigen), totalBaseSinImpuestos, totalIva };
            }
            return { ...albaran, origen: null, totalBaseSinImpuestos, totalIva };
          } catch (err) {
            return { ...albaran, origen: null, totalBaseSinImpuestos, totalIva };
          }
        }));
        
        setAlbaranes(albaranesConOrigen);
        setTotalElementos(data.totalElements);
        setTotalPaginas(data.totalPages);
      } else {
        setAlbaranes(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Error cargando albaranes:", err);
      // No llamar setMensaje aquí para evitar bucle infinito
    } finally {
      setCargando(false);
    }
  }, [paginaActual, itemsPorPagina, ordenarPor, ordenDireccion, busqueda, filtroEstado, filtroSerieId, filtroNumero, filtroFechaDesde, filtroFechaHasta, filtroImporteMin, filtroImporteMax]);

  const obtenerAlbaranPorId = useCallback(
    async (id) => {
      try {
        const res = await fetch(`${API_URL}/${id}`);
        if (!res.ok) throw new Error(`No se pudo obtener el albarán (HTTP ${res.status})`);
        return await res.json();
      } catch (err) {
        console.error("Error obteniendo albarán:", err);
        setMensaje(err.message || "Error al obtener el albarán");
        return null;
      }
    },
    [setMensaje]
  );

  // Recargar automáticamente cuando cambien los parámetros de paginación/filtros
  // Usar ref para evitar bucles infinitos
  const prevParamsRef = useRef({});
  
  useEffect(() => {
    // Solo ejecutar si hay una pestaña de albaranes activa
    if (!pestanaActiva) return;
    const esPestanaAlbaranes = pestanaActiva === 'albaranes' ||
      pestanaActiva.startsWith('albaran-nuevo') || 
      pestanaActiva.startsWith('albaran-editar') ||
      pestanaActiva.startsWith('albaran-ver');
    if (!esPestanaAlbaranes) return;
    
    const currentParams = {
      paginaActual,
      itemsPorPagina,
      busqueda,
      filtroEstado,
      filtroSerieId,
      filtroNumero,
      filtroFechaDesde,
      filtroFechaHasta,
      filtroImporteMin,
      filtroImporteMax
    };
    
    // Solo cargar si los parámetros realmente cambiaron
    const paramsChanged = JSON.stringify(prevParamsRef.current) !== JSON.stringify(currentParams);
    
    if (paramsChanged) {
      prevParamsRef.current = currentParams;
      cargarAlbaranes();
    }
  }, [paginaActual, itemsPorPagina, busqueda, filtroEstado, filtroSerieId, filtroNumero, filtroFechaDesde, filtroFechaHasta, filtroImporteMin, filtroImporteMax, cargarAlbaranes, pestanaActiva]);

  // cargarClientes, cargarProductos, cargarTiposIva, cargarSeries,
  // cargarPreferenciaSerie, guardarPreferenciaSerie → Ya están en el hook base

  const generarNumeroParaSerie = useCallback(
    async (serieIdParam) => {
      try {
        const params = new URLSearchParams();
        if (serieIdParam) {
          params.append("serieId", serieIdParam.toString());
        }
        if (usuarioId) {
          params.append("usuarioId", usuarioId.toString());
        }
        const query = params.toString();
        const endpoint = query ? `${API_URL}/siguiente-numero?${query}` : `${API_URL}/siguiente-numero`;
        const res = await fetch(endpoint);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        return data;
      } catch (err) {
        console.error("Error obteniendo número de albarán:", err);
        setMensaje("No se pudo obtener el siguiente número");
        return null;
      }
    },
    [setMensaje, usuarioId]
  );

  // La carga de datos maestros, series, almacenes, configuración y preferencia de serie
  // ya se manejan automáticamente desde el hook base

  useEffect(() => {
    // SOLO ejecutar para pestañas nuevas, NUNCA para edición
    if (!pestanaActiva || !pestanaActiva.startsWith('albaran-nuevo')) return;
    
    setFormAlbaran(prev => {
      if (prev.id || prev.serieId || !serieIdPorDefecto) return prev;
      return { ...prev, serieId: serieIdPorDefecto };
    });
  }, [pestanaActiva, serieIdPorDefecto]);

  // Establecer almacén predeterminado cuando cambia la serie o se crea nuevo albarán
  useEffect(() => {
    // SOLO ejecutar para pestañas nuevas, NUNCA para edición
    if (!pestanaActiva || !pestanaActiva.startsWith('albaran-nuevo')) return;
    
    setFormAlbaran(prev => {
      // No cambiar si ya tiene almacén o es edición
      if (prev.id || prev.almacenId) return prev;
      if (!almacenIdPorDefecto) return prev;
      return { ...prev, almacenId: almacenIdPorDefecto };
    });
  }, [pestanaActiva, almacenIdPorDefecto]);

  // ========== FILTROS ==========
  const limpiarFiltros = useCallback(() => {
    setBusqueda("");
    setFiltroFechaDesde("");
    setFiltroFechaHasta("");
    setFiltroEstado("");
    setFiltroSerieId("");
    setFiltroNumero("");
    setFiltroImporteMin("");
    setFiltroImporteMax("");
    setPaginaActual(0);
  }, []);

  const contarFiltrosActivos = useCallback(() => {
    let count = 0;
    if (busqueda) count++;
    if (filtroFechaDesde) count++;
    if (filtroFechaHasta) count++;
    if (filtroEstado) count++;
    if (filtroSerieId) count++;
    if (filtroNumero) count++;
    if (filtroImporteMin) count++;
    if (filtroImporteMax) count++;
    return count;
  }, [busqueda, filtroFechaDesde, filtroFechaHasta, filtroEstado, filtroSerieId, filtroNumero, filtroImporteMin, filtroImporteMax]);

  const cambiarOrdenacion = useCallback((campo) => {
    if (ordenarPor === campo) {
      setOrdenDireccion(ordenDireccion === "asc" ? "desc" : "asc");
    } else {
      setOrdenarPor(campo);
      setOrdenDireccion("desc");
    }
  }, [ordenarPor, ordenDireccion]);

  // ========== SELECCIÓN MÚLTIPLE ==========
  const toggleSeleccionAlbaran = useCallback((id) => {
    setAlbaranesSeleccionados(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }, []);

  const toggleSeleccionarTodos = useCallback(() => {
    if (seleccionarTodos) {
      setAlbaranesSeleccionados([]);
    } else {
      setAlbaranesSeleccionados(albaranes.map(a => a.id));
    }
    setSeleccionarTodos(!seleccionarTodos);
  }, [seleccionarTodos, albaranes]);

  // ========== ACCIONES MASIVAS ==========
  const eliminarSeleccionados = useCallback(async () => {
    if (albaranesSeleccionados.length === 0) return;
    if (!window.confirm(`¿Eliminar ${albaranesSeleccionados.length} albaranes?`)) return;

    try {
      for (const id of albaranesSeleccionados) {
        await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      }
      setMensaje(`${albaranesSeleccionados.length} albaranes eliminados`);
      setAlbaranesSeleccionados([]);
      setSeleccionarTodos(false);
      cargarAlbaranes();
    } catch (err) {
      console.error(err);
      setMensaje("Error al eliminar albaranes");
    }
  }, [albaranesSeleccionados, setMensaje, cargarAlbaranes]);

  const exportarExcelCsv = useCallback(() => {
    if (albaranesSeleccionados.length === 0) return;

    const seleccionados = albaranes.filter(a => albaranesSeleccionados.includes(a.id));
    const headers = ["Número", "Fecha", "Cliente", "Total", "Estado"];
    const rows = seleccionados.map(a => [
      a.numero,
      a.fecha,
      a.cliente?.nombreComercial || "",
      a.total?.toFixed(2) || "0.00",
      a.estado
    ]);

    const csvContent = [headers.join(";"), ...rows.map(r => r.join(";"))].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `albaranes_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    setMensaje(`Exportados ${seleccionados.length} albaranes a CSV`);
  }, [albaranes, albaranesSeleccionados, setMensaje]);

  // ========== PDF ==========
  const generarPdf = useCallback(async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}/pdf`);
      if (!res.ok) throw new Error("Error al generar PDF");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `albaran_${id}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      setMensaje("PDF generado correctamente");
    } catch (err) {
      console.error(err);
      setMensaje("Error al generar PDF");
    }
  }, [setMensaje]);

  const abrirModalPdfMultiple = useCallback(() => {
    if (albaranesSeleccionados.length === 0) return;
    setModalPdfMultipleAbierto(true);
  }, [albaranesSeleccionados]);

  const cerrarModalPdfMultiple = useCallback(() => {
    setModalPdfMultipleAbierto(false);
    setTipoPdfMultiple("individual");
  }, []);

  const generarPdfMultiple = useCallback(async () => {
    if (albaranesSeleccionados.length === 0) {
      setMensaje("No hay albaranes seleccionados");
      return;
    }

    cerrarModalPdfMultiple();
    setMensaje("Generando PDFs...");

    if (tipoPdfMultiple === "combinado") {
      // PDF unificado - un solo archivo con todos los albaranes
      try {
        const res = await fetch(`${API_URL}/pdf-multiple`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(albaranesSeleccionados) // Enviar array directamente, no objeto
        });

        if (!res.ok) throw new Error("Error al generar PDF unificado");

        const blob = await res.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = `albaranes_${albaranesSeleccionados.length}_documentos.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(downloadUrl);
        document.body.removeChild(a);

        setMensaje(`PDF unificado generado con ${albaranesSeleccionados.length} albarán(es)`);
      } catch (err) {
        console.error("Error al generar PDF unificado:", err);
        setMensaje("Error al generar el PDF unificado");
      }
    } else {
      // PDFs individuales
      for (const id of albaranesSeleccionados) {
        const albaran = albaranes.find(a => a.id === id);
        if (!albaran) continue;

        try {
          const res = await fetch(`${API_URL}/${id}/pdf`);

          if (!res.ok) throw new Error("Error al generar PDF");

          const blob = await res.blob();
          const downloadUrl = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = downloadUrl;
          a.download = `albaran_${albaran.numero}.pdf`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(downloadUrl);
          document.body.removeChild(a);

          // Pequeña pausa entre descargas para evitar problemas
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (err) {
          console.error(`Error al generar PDF para albarán ${albaran.numero}:`, err);
        }
      }
      setMensaje(`${albaranesSeleccionados.length} PDF(s) individual(es) generado(s)`);
    }

    setAlbaranesSeleccionados([]);
    setSeleccionarTodos(false);
  }, [albaranesSeleccionados, albaranes, tipoPdfMultiple, setMensaje, cerrarModalPdfMultiple]);

  // ========== TRANSFORMAR ==========
  const abrirModalTransformar = useCallback(async (albaran) => {
    setAlbaranParaTransformar(albaran);
    setModalTransformarAbierto(true);
    setTipoTransformacionSeleccionado(null);
    setSerieSeleccionada("");
    setFechaTransformacion(new Date().toISOString().slice(0, 16));
    setEstadoTransformacion(estadoOptions[0]?.nombre || "Pendiente");
    setProveedorId('');
    setProveedorSeleccionado(null);
    setBusquedaProveedor('');
    setMostrarProveedores(false);
    // Cargar series de albarán por defecto
    base.cargarSeries();
    // Cargar proveedores
    try {
      const response = await fetch(`${API_ENDPOINTS.proveedores}?page=0&size=1000`);
      if (response.ok) {
        const data = await response.json();
        setProveedoresLista(data.content || data);
      }
    } catch (err) {
      console.error('Error al cargar proveedores:', err);
    }
  }, [estadoOptions, base]);

  const cerrarModalTransformar = useCallback(() => {
    setModalTransformarAbierto(false);
    setAlbaranParaTransformar(null);
    setTipoTransformacionSeleccionado(null);
    setSerieSeleccionada("");
    setFechaTransformacion(new Date().toISOString().slice(0, 16));
    setEstadoTransformacion("Pendiente");
  }, []);

  // Funciones para selector de proveedor
  const filtrarProveedores = useCallback((query) => {
    if (!query || query.trim().length < 3) return [];
    const busquedaLower = query.toLowerCase();
    return proveedoresLista.filter(p => {
      const coincideNombreComercial = p.nombreComercial?.toLowerCase().includes(busquedaLower);
      const coincideNombreFiscal = p.nombreFiscal?.toLowerCase().includes(busquedaLower);
      const coincideNif = p.nifCif?.toLowerCase().includes(busquedaLower);
      const coincideReferencia = p.referencia?.toLowerCase().includes(busquedaLower);
      const coincideCodigo = p.codigo?.toLowerCase().includes(busquedaLower);
      const coincideId = p.id?.toString().includes(query);
      return coincideNombreComercial || coincideNombreFiscal || coincideNif || coincideReferencia || coincideCodigo || coincideId;
    }).slice(0, 50);
  }, [proveedoresLista]);

  const handleInputProveedorChange = useCallback((e) => {
    const valor = e.target.value;
    setBusquedaProveedor(valor);
    setMostrarProveedores(true);
    if (!valor.trim()) {
      setProveedorId('');
    }
  }, []);

  const seleccionarProveedor = useCallback((proveedor) => {
    setProveedorId(proveedor.id);
    setProveedorSeleccionado(proveedor);
    setBusquedaProveedor(proveedor.nombreComercial || '');
    setMostrarProveedores(false);
  }, []);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownProveedorRef.current && !dropdownProveedorRef.current.contains(event.target)) {
        setMostrarProveedores(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cargar series según el tipo de transformación seleccionado
  useEffect(() => {
    if (!tipoTransformacionSeleccionado) return;
    
    const cargarSeriesPorTipo = async () => {
      const tipoDocumentoMap = {
        'DUPLICAR': 'ALBARAN_VENTA',
        'ALBARAN': 'ALBARAN_VENTA', // Transformar a albarán
        'FACTURA': 'FACTURA_VENTA',
        'FACTURA_PROFORMA': 'FACTURA_PROFORMA',
        'FACTURA_RECTIFICATIVA': 'FACTURA_RECTIFICATIVA',
        'PEDIDO': 'PEDIDO_VENTA',
        'PRESUPUESTO': 'PRESUPUESTO',
        'PRESUPUESTO_COMPRA': 'PRESUPUESTO_COMPRA',
        'PEDIDO_COMPRA': 'PEDIDO_COMPRA',
        'ALBARAN_COMPRA': 'ALBARAN_COMPRA',
        'FACTURA_COMPRA': 'FACTURA_COMPRA',
      };
      
      const tipoDocumento = tipoDocumentoMap[tipoTransformacionSeleccionado];
      if (!tipoDocumento) return;
      
      console.log('Cargando series para tipo:', tipoDocumento);
      
      try {
        setCargandoSeriesTransformacion(true);
        // Limpiar series primero
        setSeriesTransformacion([]);
        setSerieSeleccionada("");
        
        const params = new URLSearchParams({
          tipoDocumento: tipoDocumento,
          soloActivas: "true"
        });
        const url = `${SERIES_API_URL}?${params.toString()}`;
        
        const res = await fetch(url);
        if (!res.ok) throw new Error("Error al cargar series");
        const data = await res.json();
        const series = Array.isArray(data) ? data : data.content || [];
        
        setSeriesTransformacion(series);
      } catch (err) {
        console.error("Error cargando series:", err);
        setSeriesTransformacion([]);
      } finally {
        setCargandoSeriesTransformacion(false);
      }
    };
    
    cargarSeriesPorTipo();
  }, [tipoTransformacionSeleccionado]);

  const ejecutarTransformacion = useCallback(async () => {
    if (!albaranParaTransformar || !tipoTransformacionSeleccionado) return;

    try {
      const tipoDocumentoMap = {
        'DUPLICAR': { endpoint: API_ENDPOINTS.albaranes, tipoOrigen: 'ALBARAN', tipoDestino: 'ALBARAN', esDuplicacion: true },
        'ALBARAN': { endpoint: API_ENDPOINTS.albaranes, tipoOrigen: 'ALBARAN', tipoDestino: 'ALBARAN', esDuplicacion: false },
        'FACTURA': { endpoint: API_ENDPOINTS.facturas, tipoOrigen: 'ALBARAN', tipoDestino: 'FACTURA', esDuplicacion: false },
        'FACTURA_PROFORMA': { endpoint: API_ENDPOINTS.facturasProforma, tipoOrigen: 'ALBARAN', tipoDestino: 'FACTURA_PROFORMA', esDuplicacion: false },
        'FACTURA_RECTIFICATIVA': { endpoint: API_ENDPOINTS.facturasRectificativas, tipoOrigen: 'ALBARAN', tipoDestino: 'FACTURA_RECTIFICATIVA', esDuplicacion: false },
        'PEDIDO': { endpoint: API_ENDPOINTS.pedidos, tipoOrigen: 'ALBARAN', tipoDestino: 'PEDIDO', esDuplicacion: false },
        'PRESUPUESTO': { endpoint: API_ENDPOINTS.presupuestos, tipoOrigen: 'ALBARAN', tipoDestino: 'PRESUPUESTO', esDuplicacion: false },
        'PRESUPUESTO_COMPRA': { endpoint: API_ENDPOINTS.presupuestosCompra, tipoOrigen: 'ALBARAN', tipoDestino: 'PRESUPUESTO_COMPRA', esDuplicacion: false },
        'PEDIDO_COMPRA': { endpoint: API_ENDPOINTS.pedidosCompra, tipoOrigen: 'ALBARAN', tipoDestino: 'PEDIDO_COMPRA', esDuplicacion: false },
        'ALBARAN_COMPRA': { endpoint: API_ENDPOINTS.albaranesCompra, tipoOrigen: 'ALBARAN', tipoDestino: 'ALBARAN_COMPRA', esDuplicacion: false },
        'FACTURA_COMPRA': { endpoint: API_ENDPOINTS.facturasCompra, tipoOrigen: 'ALBARAN', tipoDestino: 'FACTURA_COMPRA', esDuplicacion: false },
      };

      const config = tipoDocumentoMap[tipoTransformacionSeleccionado];
      if (!config) {
        throw new Error("Tipo de transformación no válido");
      }

      const payload = {
        tipoOrigen: config.tipoOrigen,
        idOrigen: albaranParaTransformar.id,
        tipoDestino: config.tipoDestino,
        serieId: serieSeleccionada ? parseInt(serieSeleccionada) : null,
        fecha: fechaTransformacion,
        estado: estadoTransformacion,
        esDuplicacion: config.esDuplicacion,
      };

      // Añadir proveedorId si el destino es compra
      const esCompra = ['PRESUPUESTO_COMPRA', 'PEDIDO_COMPRA', 'ALBARAN_COMPRA', 'FACTURA_COMPRA'].includes(tipoTransformacionSeleccionado);
      if (esCompra && proveedorId) {
        payload.proveedorId = parseInt(proveedorId);
      }

      const res = await fetch(`${config.endpoint}/transformar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error al transformar");
      }

      const creado = await res.json();
      const accion = tipoTransformacionSeleccionado === 'DUPLICAR' ? 'duplicado' : 
                     tipoTransformacionSeleccionado === 'ALBARAN' ? 'transformado' : 'creado';
      const tipoLabel = {
        'DUPLICAR': 'Albarán',
        'ALBARAN': 'Albarán',
        'FACTURA': 'Factura',
        'FACTURA_PROFORMA': 'Factura Proforma',
        'FACTURA_RECTIFICATIVA': 'Factura Rectificativa',
        'PEDIDO': 'Pedido',
        'PRESUPUESTO': 'Presupuesto',
        'PRESUPUESTO_COMPRA': 'Presupuesto Compra',
        'PEDIDO_COMPRA': 'Pedido Compra',
        'ALBARAN_COMPRA': 'Albarán Compra',
        'FACTURA_COMPRA': 'Factura Compra',
      }[tipoTransformacionSeleccionado];
      
      setMensaje(`${tipoLabel} ${creado.numero} ${accion} correctamente`);
      cerrarModalTransformar();
      cargarAlbaranes();
    } catch (err) {
      console.error(err);
      setMensaje(err.message || "Error al transformar documento");
    }
  }, [
    albaranParaTransformar,
    tipoTransformacionSeleccionado,
    serieSeleccionada,
    fechaTransformacion,
    estadoTransformacion,
    setMensaje,
    cerrarModalTransformar,
    cargarAlbaranes
  ]);


  // ========== EMAIL ==========
  const abrirModalEmail = useCallback((albaran) => {
    setAlbaranParaEmail(albaran);
    setEmailDestinatario(albaran.cliente?.email || "");
    setEmailAsunto(`Albarán ${albaran.numero}`);
    setEmailCuerpo(`Estimado cliente,\n\nAdjunto le enviamos el albarán ${albaran.numero}.\n\nSaludos.`);
    setModalEmailAbierto(true);
  }, []);

  const cerrarModalEmail = useCallback(() => {
    setModalEmailAbierto(false);
    setAlbaranParaEmail(null);
    setEmailDestinatario("");
    setEmailAsunto("");
    setEmailCuerpo("");
  }, []);

  const enviarEmail = useCallback(async () => {
    if (!albaranParaEmail || !emailDestinatario) {
      setMensaje("Falta el destinatario del email");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/${albaranParaEmail.id}/enviar-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destinatario: emailDestinatario,
          asunto: emailAsunto,
          cuerpo: emailCuerpo
        })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error al enviar email");
      }

      setMensaje("Email enviado correctamente");
      cerrarModalEmail();
    } catch (err) {
      console.error(err);
      setMensaje(err.message || "Error al enviar email");
    }
  }, [albaranParaEmail, emailDestinatario, emailAsunto, emailCuerpo, setMensaje, cerrarModalEmail]);

  // ========== HISTORIAL TRANSFORMACIONES ==========
  const cargarHistorialTransformaciones = useCallback(async (tipoDocumento, idDocumento) => {
    try {
      const res = await fetch(`${TRANSFORMACIONES_API_URL}/historial/${tipoDocumento}/${idDocumento}`);
      if (!res.ok) throw new Error("Error al cargar historial");
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("Error cargando historial de transformaciones:", err);
      return [];
    }
  }, []);

  const abrirModalHistorialDocumento = useCallback(async (albaran) => {
    setDocumentoHistorial({ tipo: 'ALBARAN', id: albaran.id, numero: albaran.numero });
    setModalHistorialAbierto(true);
    setCargandoHistorialModal(true);
    try {
      const historial = await cargarHistorialTransformaciones('ALBARAN', albaran.id);
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

  // ========== ACTUALIZAR PRECIOS POR TARIFA ==========
  const actualizarPreciosLineasPorTarifa = useCallback(async (lineasActuales) => {
    if (!lineasActuales || lineasActuales.length === 0) return lineasActuales;
    
    const lineasActualizadas = await Promise.all(
      lineasActuales.map(async (linea) => {
        if (!linea.productoId) return linea;
        
        // IMPORTANTE: No modificar líneas con condiciones comerciales aplicadas
        if (linea.tieneCondicionComercial === true) {
          return linea;
        }
        
        try {
          const precioData = await tarifasAlbaran.obtenerPrecioProducto(linea.productoId);
          if (precioData) {
            return {
              ...linea,
              precioUnitario: precioData.precio || linea.precioUnitario,
              descuento: precioData.descuento || linea.descuento,
            };
          }
        } catch (err) {
          console.error(`Error al obtener precio para producto ${linea.productoId}:`, err);
        }
        return linea;
      })
    );
    
    return lineasActualizadas;
  }, [tarifasAlbaran]);

  // Función manual para recalcular precios con prioridad correcta
  const recalcularPreciosLineas = useCallback(async () => {
    const lineasActuales = formAlbaran.lineas;
    if (!lineasActuales || lineasActuales.length === 0) return;

    const clienteIdActual = formAlbaran.clienteId;
    const descuentoActual = formAlbaran.descuentoAgrupacionManual ?? 0;
    const clienteSeleccionadoBasico = clientes.find(c => c.id === parseInt(clienteIdActual));
    const tarifaIdActual = tarifasAlbaran.tarifaSeleccionada?.id;

    try {
      const clienteDetallado = await obtenerClienteConAgrupacion(clienteIdActual);
      const clienteConAgrupacion = clienteDetallado || clienteSeleccionadoBasico;
      // PRIMERO: Aplicar condiciones comerciales si el cliente tiene agrupación
      if (clienteIdActual && clienteConAgrupacion?.agrupacion?.id) {
        const lineasConCondiciones = await aplicarDescuentosAgrupacionEnLineas({
          lineas: lineasActuales,
          clienteId: clienteIdActual,
          clienteConAgrupacion,
          clientes,
          productos,
          condicionesApiUrl: CONDICIONES_API_URL,
          tarifaId: tarifaIdActual,
          obtenerPrecioTarifa: tarifasAlbaran.obtenerPrecioProducto,
        });

        // SEGUNDO: Actualizar precios de tarifa solo en líneas SIN condiciones
        const lineasFinales = await actualizarPreciosLineasPorTarifa(lineasConCondiciones);
        
        setFormAlbaran(prev => ({
          ...prev,
          lineas: recalcularLineasConImpuestos(lineasFinales, clienteIdActual, descuentoActual),
        }));
      } else {
        // Si no hay agrupación, solo actualizar precios por tarifa
        const lineasActualizadas = await actualizarPreciosLineasPorTarifa(lineasActuales);
        setFormAlbaran(prev => ({
          ...prev,
          lineas: recalcularLineasConImpuestos(lineasActualizadas, clienteIdActual, descuentoActual),
        }));
      }
    } catch (err) {
      console.error("Error al recalcular precios:", err);
    }
  }, [
    formAlbaran.lineas,
    formAlbaran.clienteId,
    formAlbaran.descuentoAgrupacionManual,
    clientes,
    productos,
    tarifasAlbaran.tarifaSeleccionada?.id,
    tarifasAlbaran.obtenerPrecioProducto,
    actualizarPreciosLineasPorTarifa,
    recalcularLineasConImpuestos,
    obtenerClienteConAgrupacion,
  ]);

  // subirAdjunto, eliminarAdjunto, descargarAdjunto → Ya están en el hook base

  // ========== CRUD ==========
  const abrirNuevoAlbaran = useCallback(async () => {
    const seriesActualizadas = await base.cargarSeries();
    
    let preferenciaUsuario = null;
    if (usuarioId) {
      try {
        const params = new URLSearchParams({
          usuarioId: usuarioId.toString(),
          tipoDocumento: DOCUMENTO_SERIE_TIPO,
        });
        const res = await fetch(`${SERIES_PREF_API_URL}?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          preferenciaUsuario = data && Object.keys(data).length ? data : null;
        }
      } catch (err) {
        console.error("Error cargando preferencia:", err);
      }
    }
    
    let serieSeleccionada = "";
    if (preferenciaUsuario?.serie?.id) {
      serieSeleccionada = preferenciaUsuario.serie.id.toString();
    } else if (seriesActualizadas && seriesActualizadas.length > 0) {
      serieSeleccionada = seriesActualizadas[0].id.toString();
    }
    
    let numeroGenerado = "";
    let permiteSeleccion = true;
    
    if (serieSeleccionada) {
      setGenerandoNumero(true);
      const resultado = await generarNumeroParaSerie(serieSeleccionada);
      if (resultado) {
        numeroGenerado = resultado.numero || "";
        permiteSeleccion = resultado.permiteSeleccionUsuario !== false;
      }
      setGenerandoNumero(false);
    }
    
    // Construir el ID de la pestaña que se va a abrir (mismo formato que construirIdPestana)
    const pestanaId = `albaran-nuevo-${Date.now()}`;
    
    setFormAlbaran({
      ...formAlbaranInicial,
      numero: numeroGenerado || "",
      fecha: new Date().toISOString().split("T")[0],
      serieId: serieSeleccionada,
      usarCodigoManual: false,
      permiteSeleccionSerie: permiteSeleccion,
    }, pestanaId);
    abrirPestana("albaran-nuevo", null, "Nuevo Albarán");
  }, [abrirPestana, generarNumeroParaSerie, base, usuarioId]);

  const actualizarListaConDetalle = useCallback((albaranDetallado) => {
    if (!albaranDetallado?.id) return;
    setAlbaranes((prev) =>
      prev.map((a) => (a.id === albaranDetallado.id ? { ...albaranDetallado } : a))
    );
  }, []);

  const abrirVerAlbaran = useCallback(
    async (albaran) => {
      const detalle = albaran?.lineas?.length
        ? albaran
        : await obtenerAlbaranPorId(albaran.id);
      if (!detalle) return;
      actualizarListaConDetalle(detalle);
      abrirPestana("albaran-ver", detalle.id, `Albarán ${detalle.numero}`);
    },
    [abrirPestana, obtenerAlbaranPorId, actualizarListaConDetalle]
  );

  const abrirEditarAlbaran = useCallback(
    async (albaran) => {
      const detalle = albaran?.lineas?.length
        ? albaran
        : await obtenerAlbaranPorId(albaran.id);
      if (!detalle) return;

      actualizarListaConDetalle(detalle);

      // Marcar que estamos cargando datos existentes para evitar recálculos automáticos
      cargandoDatosExistentesRef.current = true;

      // Usar el descuento de agrupación guardado en el albarán, no recalcularlo
      const descuentoAgrupacionGuardado = detalle.descuentoAgrupacion ?? 0;

      // Determinar si la serie permite selección por usuario
      const permiteSeleccionSerie = detalle.serie?.permiteSeleccionUsuario !== false;

      // Construir el ID de la pestaña que se va a abrir
      const pestanaId = `albaran-editar-${detalle.id}`;

      setFormAlbaran({
        id: detalle.id,
        numero: detalle.numero,
        fecha: detalle.fecha,
        fechaOriginal: detalle.fecha, // Guardar fecha original para tracking
        clienteId: detalle.cliente?.id || "",
        direccionId: detalle.direccion?.id?.toString() || "",
        direccionFacturacionSnapshot: {
          pais: detalle.direccionFacturacionPais || "España",
          codigoPostal: detalle.direccionFacturacionCodigoPostal || "",
          provincia: detalle.direccionFacturacionProvincia || "",
          poblacion: detalle.direccionFacturacionPoblacion || "",
          direccion: detalle.direccionFacturacionDireccion || "",
        },
        direccionEnvioSnapshot: {
          pais: detalle.direccionEnvioPais || "España",
          codigoPostal: detalle.direccionEnvioCodigoPostal || "",
          provincia: detalle.direccionEnvioProvincia || "",
          poblacion: detalle.direccionEnvioPoblacion || "",
          direccion: detalle.direccionEnvioDireccion || "",
        },
        observaciones: detalle.observaciones || "",
        notas: detalle.notas || "",
        estado: detalle.estado || estadoOptions[0]?.nombre || "Pendiente",
        descuentoAgrupacionManual: descuentoAgrupacionGuardado,
        serieId: detalle.serie?.id?.toString() || "",
        permiteSeleccionSerie: permiteSeleccionSerie,
        usarCodigoManual: detalle.serie?.id ? false : true,
        codigoManual: detalle.serie?.id ? "" : detalle.numero,
        adjuntos: detalle.adjuntos || [],
        almacenId: detalle.almacen?.id?.toString() || "",
        ventaMultialmacen: Boolean(detalle.ventaMultialmacen),
        lineas:
          detalle.lineas?.map((l) => ({
            nombreProducto: l.nombreProducto || "",
            productoId: l.producto?.id?.toString() || "",
            referencia: l.referencia || l.producto?.referencia || "",
            cantidad: l.cantidad,
            precioUnitario: l.precioUnitario,
            descuento: l.descuento || 0,
            observaciones: l.observaciones || "",
            tipoIvaId: l.tipoIva?.id?.toString() || "",
            tipoIvaNombre: l.tipoIva?.nombre || "",
            porcentajeIva: l.porcentajeIva || 0,
            porcentajeRecargo: l.porcentajeRecargo || 0,
            importeIva: l.importeIva || 0,
            importeRecargo: l.importeRecargo || 0,
            almacenId: l.almacen?.id?.toString() || "",
          })) || [],
      }, pestanaId);
      
      // Guardar el estado original para detectar cambios
      estadoOriginalAlbaran.current = detalle.estado || estadoOptions[0]?.nombre || "Pendiente";
      
      abrirPestana("albaran-editar", detalle.id, `Editar ${detalle.numero}`);
    },
    [abrirPestana, obtenerAlbaranPorId, actualizarListaConDetalle, estadoOptions]
  );

  const guardarAlbaran = useCallback(async (e, opciones = {}) => {
    if (e?.preventDefault) {
      e.preventDefault();
    }
    const { cerrarDespues = false, confirmarStock = false, confirmarCambioEstado = false } = opciones;
    
    // Validar que el número no esté vacío
    if (!formAlbaran.numero || formAlbaran.numero.trim() === "") {
      setMensaje("El número del documento no puede estar vacío. Selecciona una serie o activa la numeración manual.");
      return;
    }
    
    // Detectar cambio de estado
    const estadoActual = estadoOriginalAlbaran.current || formAlbaran.estado;
    const estadoNuevo = formAlbaran.estado;
    const eraEmitido = estadoActual === "Emitido";
    const esEmitido = estadoNuevo === "Emitido";
    
    // Consultar configuración actual de la BD antes de verificar cambios de stock
    let configuracionActual = documentoDescuentaStock;
    if ((eraEmitido && !esEmitido) || (!eraEmitido && esEmitido)) {
      try {
        const respConfig = await fetch(`${API_ENDPOINTS.configuracionVentas}`);
        if (respConfig.ok) {
          const config = await respConfig.json();
          configuracionActual = config.documentoDescuentaStock || "ALBARAN";
        }
      } catch (error) {
        console.error('Error al consultar configuración actual:', error);
      }
    }
    
    // Si cambia DESDE Emitido a otro estado, mostrar modal de restauración
    if (eraEmitido && !esEmitido && configuracionActual === "ALBARAN" && !confirmarCambioEstado) {
      const productosAfectados = formAlbaran.lineas
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
    
    // Si el estado es "Emitido" y la configuración indica que albaranes descuentan stock
    // y no se ha confirmado aún, mostrar modal de confirmación
    if (!eraEmitido && esEmitido && configuracionActual === "ALBARAN" && !confirmarStock) {
      setMostrarConfirmacionStock(true);
      return;
    }
    
    const metodo = formAlbaran.id ? "PUT" : "POST";
    const url = formAlbaran.id ? `${API_URL}/${formAlbaran.id}` : API_URL;

    const lineasPreparadas = formAlbaran.lineas
      .filter((l) => l.productoId || l.nombreProducto)
      .map((l) => {
        const referencia = l.referencia || productos.find(p => p.id === l.productoId)?.referencia || "";
        return {
          productoId: l.productoId ? parseInt(l.productoId) : null,
          nombreProducto: l.nombreProducto || "",
          referencia,
          cantidad: safeNumber(l.cantidad, 0),
          precioUnitario: safeNumber(l.precioUnitario, 0),
          descuento: safeNumber(l.descuento, 0),
          observaciones: l.observaciones || "",
          tipoIvaId: l.tipoIvaId ? parseInt(l.tipoIvaId) : null,
          porcentajeIva: safeNumber(l.porcentajeIva, 0),
          porcentajeRecargo: safeNumber(l.porcentajeRecargo, 0),
          importeIva: safeNumber(l.importeIva, 0),
          importeRecargo: safeNumber(l.importeRecargo, 0),
          almacenId: l.almacenId ? parseInt(l.almacenId) : null,
        };
      });

    if (!lineasPreparadas.length) {
      setMensaje("Añade al menos una línea con producto antes de guardar.");
      return;
    }

    const payload = {
      numero: formAlbaran.numero,
      fecha: formAlbaran.fecha !== formAlbaran.fechaOriginal 
        ? new Date(formAlbaran.fecha).toISOString() 
        : null, // null = backend preservará la fecha existente
      clienteId: formAlbaran.clienteId || null,
      direccionId: formAlbaran.direccionId ? parseInt(formAlbaran.direccionId) : null,
      observaciones: formAlbaran.observaciones,
      notas: formAlbaran.notas || "",
      estado: formAlbaran.estado,
      lineas: lineasPreparadas,
      descuentoAgrupacion: safeNumber(formAlbaran.descuentoAgrupacionManual, 0),
      adjuntosIds: (formAlbaran.adjuntos || []).map(adj => adj.id).filter(id => id),
      serieId: formAlbaran.serieId ? parseInt(formAlbaran.serieId) : null,
      usarCodigoManual: Boolean(formAlbaran.usarCodigoManual),
      codigoManual: formAlbaran.usarCodigoManual ? formAlbaran.numero : null,
      usuarioId: usuarioId || null,
      almacenId: formAlbaran.almacenId ? parseInt(formAlbaran.almacenId) : null,
      ventaMultialmacen: Boolean(formAlbaran.ventaMultialmacen),
      direccionFacturacionPais: formAlbaran.direccionFacturacionSnapshot?.pais || null,
      direccionFacturacionCodigoPostal: formAlbaran.direccionFacturacionSnapshot?.codigoPostal || null,
      direccionFacturacionProvincia: formAlbaran.direccionFacturacionSnapshot?.provincia || null,
      direccionFacturacionPoblacion: formAlbaran.direccionFacturacionSnapshot?.poblacion || null,
      direccionFacturacionDireccion: formAlbaran.direccionFacturacionSnapshot?.direccion || null,
      direccionEnvioPais: formAlbaran.direccionEnvioSnapshot?.pais || null,
      direccionEnvioCodigoPostal: formAlbaran.direccionEnvioSnapshot?.codigoPostal || null,
      direccionEnvioProvincia: formAlbaran.direccionEnvioSnapshot?.provincia || null,
      direccionEnvioPoblacion: formAlbaran.direccionEnvioSnapshot?.poblacion || null,
      direccionEnvioDireccion: formAlbaran.direccionEnvioSnapshot?.direccion || null,
    };

    try {
      const res = await fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let detalleError = "";
        try {
          const texto = await res.text();
          if (texto) {
            try {
              const json = JSON.parse(texto);
              detalleError = json?.message || json?.error || JSON.stringify(json);
            } catch {
              detalleError = texto;
            }
          }
        } catch (lecturaErr) {
          console.error("No se pudo leer el detalle del error:", lecturaErr);
        }
        throw new Error(detalleError || `HTTP ${res.status} ${res.statusText}`);
      }
      let datosGuardados = null;
      try {
        datosGuardados = await res.json();
      } catch (errLectura) {
        datosGuardados = null;
      }

      setMensaje(formAlbaran.id ? "Albarán actualizado" : "Albarán creado");

      if (datosGuardados?.id) {
        setFormAlbaran(prev => ({
          ...prev,
          id: datosGuardados.id,
          numero: datosGuardados.numero ?? prev.numero,
          clienteId: datosGuardados.cliente?.id?.toString() ?? prev.clienteId,
          direccionId: datosGuardados.direccion?.id?.toString() ?? prev.direccionId,
        }));
      }

      // Actualizar el estado original después de guardar exitosamente
      estadoOriginalAlbaran.current = formAlbaran.estado;

      if (cerrarDespues) {
        cerrarPestana(pestanaActiva);
      }
      cargarAlbaranes();
    } catch (err) {
      console.error(err);
      const detalle = err?.message || "Error desconocido";
      
      // Si el error es de stock insuficiente, mostrar modal en vez de mensaje
      if (detalle.includes("Stock insuficiente")) {
        setMensajeErrorStock(detalle);
        setMostrarErrorStock(true);
      } else {
        setMensaje(`Error al guardar albarán: ${detalle}`);
      }
    }
  }, [formAlbaran, documentoDescuentaStock, setMensaje, cerrarPestana, pestanaActiva, cargarAlbaranes, setFormAlbaran]);

  const confirmarYGuardarAlbaran = useCallback((e, opciones = {}) => {
    setMostrarConfirmacionStock(false);
    guardarAlbaran(e, { ...opciones, confirmarStock: true });
  }, [guardarAlbaran]);

  const cancelarConfirmacionStock = useCallback(() => {
    setMostrarConfirmacionStock(false);
  }, []);

  const confirmarCambioEstado = useCallback((e, opciones = {}) => {
    setMostrarModalCambioEstado(false);
    guardarAlbaran(e, { ...opciones, confirmarCambioEstado: true });
  }, [guardarAlbaran]);

  const cancelarCambioEstado = useCallback(() => {
    setMostrarModalCambioEstado(false);
    // Restaurar el estado original
    if (estadoOriginalAlbaran.current) {
      setFormAlbaran(prev => ({
        ...prev,
        estado: estadoOriginalAlbaran.current
      }), pestanaActiva);
    }
  }, [estadoOriginalAlbaran, setFormAlbaran, pestanaActiva]);

  const cerrarModalErrorStock = useCallback(() => {
    setMostrarErrorStock(false);
    setMensajeErrorStock("");
  }, []);

  const borrarAlbaran = useCallback(async (id) => {
    if (!window.confirm("¿Eliminar este albarán?")) return;
    try {
      await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      setMensaje("Albarán eliminado");
      cargarAlbaranes();
    } catch (err) {
      console.error(err);
      setMensaje("Error al eliminar albarán");
    }
  }, [setMensaje, cargarAlbaranes]);

  const setDireccionSnapshot = useCallback((tipo, valores) => {
    const key =
      tipo === "facturacion" ? "direccionFacturacionSnapshot" : "direccionEnvioSnapshot";
    setFormAlbaran((prev) => ({
      ...prev,
      [key]: {
        ...direccionSnapshotInicial,
        ...(valores || {}),
      },
    }));
  }, [setFormAlbaran]);

  const updateDireccionSnapshotField = useCallback((tipo, campo, valor) => {
    const key =
      tipo === "facturacion" ? "direccionFacturacionSnapshot" : "direccionEnvioSnapshot";
    setFormAlbaran((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] || direccionSnapshotInicial),
        [campo]: valor,
      },
    }));
  }, [setFormAlbaran]);

  const updateFormAlbaranField = useCallback((campo, valor) => {
    setFormAlbaran(prev => {
      let siguiente = { ...prev };

      if (campo === "usarCodigoManual") {
        const habilitarManual = Boolean(valor);
        siguiente.usarCodigoManual = habilitarManual;
        siguiente.numero = "";
        siguiente.serieId = "";
        siguiente.almacenId = "";
      } else if (campo === "serieId") {
        siguiente.serieId = valor;
        
        // Si se selecciona una serie y no es multialmacén, asignar el almacén predeterminado de la serie
        if (valor && !siguiente.ventaMultialmacen) {
          const serieSeleccionada = seriesDisponibles.find(s => s.id === parseInt(valor));
          if (serieSeleccionada?.almacenPredeterminado?.id) {
            siguiente.almacenId = serieSeleccionada.almacenPredeterminado.id.toString();
          }
        }
        
        // Si no está permitido multialmacén, forzar almacén predeterminado
        if (!permitirVentaMultialmacen && valor) {
          const serieSeleccionada = seriesDisponibles.find(s => s.id === parseInt(valor));
          if (serieSeleccionada?.almacenPredeterminado?.id) {
            siguiente.almacenId = serieSeleccionada.almacenPredeterminado.id.toString();
          } else if (almacenes.length > 0) {
            siguiente.almacenId = almacenes[0].id.toString();
          }
          siguiente.ventaMultialmacen = false;
        }
      } else {
        siguiente = { ...siguiente, [campo]: valor };
      }

      if (campo === "clienteId") {
        siguiente.direccionId = "";
        siguiente.direccionFacturacionSnapshot = { ...direccionSnapshotInicial };
        siguiente.direccionEnvioSnapshot = { ...direccionSnapshotInicial };
        siguiente.lineas = recalcularLineasConImpuestos(
          siguiente.lineas,
          valor,
          siguiente.descuentoAgrupacionManual || 0
        );
      }
      return siguiente;
    });

    if (campo === "serieId") {
      if (valor && !formAlbaran.usarCodigoManual) {
        setGenerandoNumero(true);
        generarNumeroParaSerie(valor)
          .then(resultado => {
            if (resultado) {
              setFormAlbaran(prev => ({ 
                ...prev, 
                numero: resultado.numero || "",
                permiteSeleccionSerie: resultado.permiteSeleccionUsuario !== false
              }));
            }
          })
          .finally(() => setGenerandoNumero(false));
      } else if (!valor && !formAlbaran.usarCodigoManual) {
        setFormAlbaran(prev => ({ ...prev, numero: "" }));
      }
    }

    // Si cambia el cliente, aplicar condiciones comerciales a todas las líneas y cambiar tarifa
    if (campo === "clienteId" && valor) {
      setTimeout(async () => {
        const clienteSeleccionado = clientes.find(c => c.id === parseInt(valor));
        
        // Cambiar tarifa según el cliente seleccionado
        if (clienteSeleccionado) {
          tarifasAlbaran.cambiarTarifaPorCliente(clienteSeleccionado);
        }
        
        setFormAlbaran(prev => {
          if (!clienteSeleccionado) return prev;

          // Actualizar el descuento de agrupación manual con el del nuevo cliente
          const nuevoDescuentoAgrupacion = clienteSeleccionado?.agrupacion?.descuentoGeneral || 0;

          // Si no hay líneas, solo actualizar el descuento
          if (prev.lineas.length === 0) {
            return { ...prev, descuentoAgrupacionManual: nuevoDescuentoAgrupacion };
          }

          // Aplicar condiciones comerciales a todas las líneas
          aplicarDescuentosAgrupacionEnLineas({
            lineas: prev.lineas,
            clienteId: valor,
            clienteConAgrupacion: clienteSeleccionado,
            clientes,
            productos,
            condicionesApiUrl: CONDICIONES_API_URL,
            tarifaId: clienteSeleccionado.tarifaAsignada?.id || null,
            obtenerPrecioTarifa: tarifasAlbaran.obtenerPrecioProducto,
          }).then(lineasActualizadas => {
            setFormAlbaran(current => ({
              ...current,
              lineas: recalcularLineasConImpuestos(lineasActualizadas, valor, nuevoDescuentoAgrupacion),
              descuentoAgrupacionManual: nuevoDescuentoAgrupacion,
            }));
          });

          return { ...prev, descuentoAgrupacionManual: nuevoDescuentoAgrupacion };
        });
      }, 50);
    }
  }, [clientes, productos, recalcularLineasConImpuestos, seriesDisponibles, setFormAlbaran]);

  useEffect(() => {
    // No recalcular si estamos cargando datos existentes (edición)
    if (cargandoDatosExistentesRef.current) {
      cargandoDatosExistentesRef.current = false;
      return;
    }
    setFormAlbaran(prev => {
      // Solo recalcular si es un albarán nuevo (sin id)
      if (prev.id) return prev;
      if (!prev.lineas.length) return prev;
      const conImpuestos = recalcularLineasConImpuestos(prev.lineas, prev.clienteId, prev.descuentoAgrupacionManual || 0);
      if (lineasSonIguales(conImpuestos, prev.lineas)) {
        return prev;
      }
      return {
        ...prev,
        lineas: conImpuestos,
      };
    });
  }, [clientes, productos, recalcularLineasConImpuestos]);

  const agregarLinea = useCallback(() => {
    setFormAlbaran(prev => {
      const nuevasLineas = [...prev.lineas, { ...lineaInicial }];
      const conImpuestos = recalcularLineasConImpuestos(nuevasLineas, prev.clienteId, prev.descuentoAgrupacionManual || 0);
      return {
        ...prev,
        lineas: conImpuestos,
      };
    });
  }, [recalcularLineasConImpuestos, setFormAlbaran]);

  const eliminarLinea = useCallback((index) => {
    setFormAlbaran(prev => {
      const filtradas = prev.lineas.filter((_, i) => i !== index);
      const conImpuestos = recalcularLineasConImpuestos(filtradas, prev.clienteId, prev.descuentoAgrupacionManual || 0);
      return {
        ...prev,
        lineas: conImpuestos,
      };
    });
  }, [recalcularLineasConImpuestos, setFormAlbaran]);

  const actualizarLinea = useCallback(async (index, campo, valor) => {
    // Primero actualizamos el valor básico
    setFormAlbaran(prev => {
      const nuevasLineas = [...prev.lineas];
      nuevasLineas[index] = { ...nuevasLineas[index], [campo]: valor };

      // Si el usuario edita manualmente el precio o descuento, quitar flag de condición comercial
      if (campo === "precioUnitario" || campo === "descuento") {
        nuevasLineas[index].tieneCondicionComercial = false;
        nuevasLineas[index].rangoPrecioEspecial = null;
      }

      // Si cambia el producto, actualizar precio y recalcular IVA desde el producto
      if (campo === "productoId" && valor) {
        const producto = productos.find(p => p.id === parseInt(valor));
        if (producto) {
          const precioDetectado =
            producto.precioVenta ??
            producto.precio ??
            producto.precioConImpuestos ??
            producto.precioUnitario ??
            0;
          nuevasLineas[index].precioUnitario = parseFloat(precioDetectado) || 0;
          // Limpiar tipoIvaId para que se recalcule desde el producto
          nuevasLineas[index].tipoIvaId = "";
          nuevasLineas[index].referencia = producto.referencia || "";
          // Si está en modo multialmacén, establecer el almacén predeterminado del producto
          if (prev.ventaMultialmacen && producto.almacenPredeterminado?.id) {
            nuevasLineas[index].almacenId = producto.almacenPredeterminado.id.toString();
          }
        }
        const lineasConImpuestos = recalcularLineasConImpuestos(nuevasLineas, prev.clienteId, prev.descuentoAgrupacionManual || 0);
        return { ...prev, lineas: lineasConImpuestos };
      }
      
      // Si cambia el tipoIvaId manualmente, recalcular solo los importes con el nuevo IVA
      if (campo === "tipoIvaId" && valor) {
        const tipoIva = tiposIva.find(t => t.id === parseInt(valor));
        const cliente = clientes.find(c => c.id === parseInt(prev.clienteId));
        const linea = nuevasLineas[index];
        const { baseImponible } = calcularTotalesLineaSinImpuestos(linea, prev.descuentoAgrupacionManual || 0);
        
        const porcentajeIva = tipoIva?.porcentajeIva ?? 0;
        const porcentajeRecargo = cliente?.recargoEquivalencia && tipoIva?.porcentajeRecargo
          ? tipoIva.porcentajeRecargo
          : 0;
        
        nuevasLineas[index] = {
          ...linea,
          tipoIvaId: valor,
          tipoIvaNombre: tipoIva?.nombre || "",
          porcentajeIva,
          porcentajeRecargo,
          importeIva: baseImponible * (porcentajeIva / 100),
          importeRecargo: baseImponible * (porcentajeRecargo / 100),
        };
        return { ...prev, lineas: nuevasLineas };
      }

      // Para otros campos (cantidad, descuento, etc.), recalcular impuestos preservando el tipoIvaId
      const lineasConImpuestos = recalcularLineasConImpuestos(nuevasLineas, prev.clienteId, prev.descuentoAgrupacionManual || 0);
      return { ...prev, lineas: lineasConImpuestos };
    });

    // Si cambia productoId o cantidad, aplicar condiciones comerciales
    if (campo === "productoId" || campo === "cantidad") {
      // Pequeño delay para asegurar que el estado se actualizó
      setTimeout(async () => {
        setFormAlbaran(prev => {
          const clienteSeleccionado = clientes.find(c => c.id === parseInt(prev.clienteId));
          if (!clienteSeleccionado?.agrupacion?.id) return prev;

          const linea = prev.lineas[index];
          if (!linea?.productoId) return prev;

          // Aplicar condición comercial de forma asíncrona
          aplicarCondicionComercialEnLinea({
            index,
            lineas: prev.lineas,
            clienteId: prev.clienteId,
            clienteConAgrupacion: clienteSeleccionado,
            clientes,
            productos,
            condicionesApiUrl: CONDICIONES_API_URL,
            tarifaId: tarifasAlbaran.tarifaSeleccionada?.id,
            obtenerPrecioTarifa: tarifasAlbaran.obtenerPrecioProducto,
          }).then(lineasActualizadas => {
            if (!lineasSonIguales(lineasActualizadas, prev.lineas)) {
              setFormAlbaran(current => ({
                ...current,
                lineas: recalcularLineasConImpuestos(lineasActualizadas, current.clienteId, current.descuentoAgrupacionManual || 0),
              }));
            }
          });

          return prev;
        });
      }, 50);
    }
  }, [productos, clientes, tiposIva, recalcularLineasConImpuestos, setFormAlbaran]);

  const calcularTotalLinea = useCallback((linea, descuentoAgrupacionParam = 0) => {
    const { baseImponible } = calcularTotalesLineaSinImpuestos(linea, descuentoAgrupacionParam);
    const importeIva = linea.importeIva || 0;
    const importeRecargo = linea.importeRecargo || 0;
    return baseImponible + importeIva + importeRecargo;
  }, []);

  const calcularTotales = useMemo(() => {
    // Calcular descuento base de la agrupación del cliente
    const descuentoAgrupacionBase = (() => {
      if (!formAlbaran.clienteId) return 0;
      const cliente = clientes.find(c => c.id === parseInt(formAlbaran.clienteId));
      return cliente?.agrupacion?.descuentoGeneral || 0;
    })();
    
    // Calcular porcentaje efectivo de descuento de agrupación
    const porcentajeDescuentoAgrupacionEfectivo = 
      formAlbaran.descuentoAgrupacionManual !== null && formAlbaran.descuentoAgrupacionManual !== undefined
        ? formAlbaran.descuentoAgrupacionManual
        : (formAlbaran.descuentoAgrupacion || descuentoAgrupacionBase || 0);
    
    let subtotal = 0;
    let descuentoTotal = 0;
    let totalIva = 0;
    let totalRecargo = 0;
    
    // Desglose por tipo de IVA
    const desglosePorIva = {};

    formAlbaran.lineas.forEach(linea => {
      const lineaSubtotal = linea.cantidad * linea.precioUnitario;
      const lineaDescuento = lineaSubtotal * (linea.descuento / 100);
      subtotal += lineaSubtotal;
      descuentoTotal += lineaDescuento;
      totalIva += parseFloat(linea.importeIva) || 0;
      totalRecargo += parseFloat(linea.importeRecargo) || 0;
      
      // Agrupar por tipo de IVA
      const tipoIvaKey = linea.tipoIvaId || "sin_iva";
      const porcentajeIva = parseFloat(linea.porcentajeIva) || 0;
      const tipoIvaNombre = linea.tipoIvaNombre || (porcentajeIva > 0 ? `${porcentajeIva}%` : "Sin IVA");
      
      if (!desglosePorIva[tipoIvaKey]) {
        desglosePorIva[tipoIvaKey] = {
          tipoIvaId: linea.tipoIvaId,
          nombre: tipoIvaNombre,
          porcentajeIva: porcentajeIva,
          porcentajeRecargo: parseFloat(linea.porcentajeRecargo) || 0,
          baseAntesDescuento: 0,
          descuentoAgrupacionImporte: 0,
          baseImponible: 0,
          importeIva: 0,
          importeRecargo: 0,
        };
      }
      
      // Calcular base antes de descuento de agrupación (solo con descuento de línea)
      const baseAntesAgrupacion = (linea.cantidad * linea.precioUnitario) * (1 - (linea.descuento || 0) / 100);
      // Calcular base imponible de la línea (con descuento de agrupación)
      const { baseImponible } = calcularTotalesLineaSinImpuestos(linea, porcentajeDescuentoAgrupacionEfectivo);
      const descuentoAgrupacionLinea = baseAntesAgrupacion - baseImponible;
      
      desglosePorIva[tipoIvaKey].baseAntesDescuento += baseAntesAgrupacion;
      desglosePorIva[tipoIvaKey].descuentoAgrupacionImporte += descuentoAgrupacionLinea;
      desglosePorIva[tipoIvaKey].baseImponible += baseImponible;
      desglosePorIva[tipoIvaKey].importeIva += parseFloat(linea.importeIva) || 0;
      desglosePorIva[tipoIvaKey].importeRecargo += parseFloat(linea.importeRecargo) || 0;
    });

    const totalTrasDescuentosLinea = subtotal - descuentoTotal;
    const descuentoAgrupacion = totalTrasDescuentosLinea * (porcentajeDescuentoAgrupacionEfectivo / 100);
    const baseTrasAgrupacion = totalTrasDescuentosLinea - descuentoAgrupacion;
    const total = baseTrasAgrupacion + totalIva + totalRecargo;
    
    // Convertir desglose a array y ordenar por porcentaje de IVA
    const desgloseIvaArray = Object.values(desglosePorIva)
      .filter(d => d.baseImponible > 0)
      .sort((a, b) => a.porcentajeIva - b.porcentajeIva);

    return {
      subtotal,
      descuentoTotal,
      descuentoAgrupacion,
      porcentajeDescuentoAgrupacion: porcentajeDescuentoAgrupacionEfectivo,
      descuentoAgrupacionBase,
      totalIva,
      totalRecargo,
      totalBaseSinImpuestos: baseTrasAgrupacion,
      total,
      desgloseIva: desgloseIvaArray,
    };
  }, [
    formAlbaran.lineas,
    formAlbaran.descuentoAgrupacionManual,
    formAlbaran.descuentoAgrupacion,
    formAlbaran.clienteId,
    clientes,
  ]);

  // Calcular totales de todos los albaranes filtrados (no solo la página actual)
  const totalesFiltrados = useMemo(() => {
    const base = albaranes.reduce((sum, a) => sum + (a.totalBaseSinImpuestos || 0), 0);
    const iva = albaranes.reduce((sum, a) => sum + (a.totalIva || 0), 0);
    const recargo = albaranes.reduce((sum, a) => sum + (a.totalRecargo || 0), 0);
    const total = albaranes.reduce((sum, a) => sum + (a.total || 0), 0);
    return { base, iva, recargo, total, count: albaranes.length };
  }, [albaranes]);

  return {
    // Datos
    albaranes: albaranesOrdenados,
    clientes,
    productos,
    formAlbaran,
    cargando,
    seriesDisponibles,
    cargandoSeries,
    guardarPreferenciaSerie,
    guardandoPreferenciaSerie,
    generandoNumero,
    estadoOptions,
    totalesFiltrados,
    documentoDescuentaStock,
    mostrarConfirmacionStock,
    confirmarYGuardarAlbaran,
    cancelarConfirmacionStock,
    mostrarErrorStock,
    mensajeErrorStock,
    cerrarModalErrorStock,
    mostrarModalCambioEstado,
    datosModalCambioEstado,
    confirmarCambioEstado,
    cancelarCambioEstado,
    stockInfo,

    // Paginación
    paginaActual,
    setPaginaActual,
    itemsPorPagina,
    setItemsPorPagina,
    totalElementos,
    totalPaginas,
    ordenarPor,
    ordenDireccion,
    cambiarOrdenacion,

    // Filtros
    busqueda,
    setBusqueda,
    filtroFechaDesde,
    setFiltroFechaDesde,
    filtroFechaHasta,
    setFiltroFechaHasta,
    filtroEstado,
    setFiltroEstado,
    filtroSerieId,
    setFiltroSerieId,
    filtroNumero,
    setFiltroNumero,
    filtroImporteMin,
    setFiltroImporteMin,
    filtroImporteMax,
    setFiltroImporteMax,
    mostrarFiltros,
    setMostrarFiltros,
    limpiarFiltros,
    contarFiltrosActivos,

    // Selección
    albaranesSeleccionados,
    setAlbaranesSeleccionados,
    seleccionarTodos,
    toggleSeleccionAlbaran,
    toggleSeleccionarTodos,

    eliminarSeleccionados,
    exportarExcelCsv,

    // PDF
    generarPdf,
    modalPdfMultipleAbierto,
    tipoPdfMultiple,
    setTipoPdfMultiple,
    abrirModalPdfMultiple,
    cerrarModalPdfMultiple,
    generarPdfMultiple,

    // Transformar
    albaranParaTransformar,
    modalTransformarAbierto,
    abrirModalTransformar,
    cerrarModalTransformar,
    tipoTransformacionSeleccionado,
    setTipoTransformacionSeleccionado,
    serieSeleccionada,
    setSerieSeleccionada,
    fechaTransformacion,
    setFechaTransformacion,
    estadoTransformacion,
    setEstadoTransformacion,
    ejecutarTransformacion,
    seriesTransformacion,
    cargandoSeriesTransformacion,
    // Proveedor selector
    proveedorId,
    proveedorSeleccionado,
    busquedaProveedor,
    handleInputProveedorChange,
    seleccionarProveedor,
    filtrarProveedores,
    mostrarProveedores,
    dropdownProveedorRef,

    // Email
    modalEmailAbierto,
    albaranParaEmail,
    emailDestinatario,
    setEmailDestinatario,
    emailAsunto,
    setEmailAsunto,
    emailCuerpo,
    setEmailCuerpo,
    abrirModalEmail,
    cerrarModalEmail,
    enviarEmail,

    // Historial transformaciones
    cargarHistorialTransformaciones,
    modalHistorialAbierto,
    documentoHistorial,
    historialModal,
    cargandoHistorialModal,
    abrirModalHistorialDocumento,
    cerrarModalHistorial,

    // CRUD
    cargarAlbaranes,
    cargarClientes: base.cargarClientes,
    cargarProductos: base.cargarProductos,
    cargarTiposIva: base.cargarTiposIva,
    cargarSeries: base.cargarSeries,
    cargarAlmacenes: base.cargarAlmacenes,
    tiposIva,
    abrirNuevoAlbaran,
    abrirVerAlbaran,
    abrirEditarAlbaran,
    guardarAlbaran,
    borrarAlbaran,

    // Formulario
    updateFormAlbaranField,
    setDireccionSnapshot,
    updateDireccionSnapshotField,
    agregarLinea,
    eliminarLinea,
    actualizarLinea,
    calcularTotalLinea,
    calcularTotales,

    // Adjuntos (del hook base)
    subirAdjunto: base.subirAdjunto,
    eliminarAdjunto: base.eliminarAdjunto,
    descargarAdjunto: base.descargarAdjunto,

    // Almacenes
    almacenes,
    almacenIdPorDefecto,
    mostrarSelectorAlmacen,
    permitirVentaMultialmacen,

    // Tarifas
    tarifasAlbaran,
    recalcularPreciosLineas,
    limpiarFormularioPestana,
  };
}
