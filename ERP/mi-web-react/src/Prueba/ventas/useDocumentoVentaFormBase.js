import { useState, useCallback, useEffect, useMemo } from "react";
import { useTarifasAlbaran } from "./useTarifasAlbaran";
import { useStockProductos } from "./useStockProductos";
import API_ENDPOINTS from "../../config/api";

/**
 * Hook genérico base para formularios de documentos de venta
 * Contiene toda la lógica común compartida entre presupuestos, pedidos, facturas, etc.
 * 
 * @param {Object} config - Configuración del documento
 * @param {string} config.tipoDocumento - Tipo de documento (PRESUPUESTO, PEDIDO, FACTURA, etc.)
 * @param {string} config.endpoint - Endpoint de API (ej: 'presupuestos')
 * @param {Array} config.estadosPredeterminados - Estados predeterminados del documento
 * @param {Object} config.formInicial - Formulario inicial del documento
 * @param {string} config.tipoSerie - Tipo de serie para el documento
 * @param {string} pestanaActiva - ID de la pestaña activa
 * @param {Object} session - Sesión del usuario
 */
export function useDocumentoVentaFormBase({
  tipoDocumento,
  endpoint,
  estadosPredeterminados,
  formInicial,
  tipoSerie = tipoDocumento, // Usar tipoDocumento como valor por defecto
  prefijoPestana = null, // Prefijo explícito para pestañas (ej: 'albaran' para 'albaranes')
}, pestanaActiva = null, session = null) {
  
  // Calcular prefijo de pestaña: usar el explícito o derivar del endpoint
  const _prefijo = prefijoPestana || endpoint.replace(/e?s$/, '');
  
  // ========== ESTADO BASE ==========
  const [documentos, setDocumentos] = useState([]);
  const [formulariosPorPestana, setFormulariosPorPestana] = useState({});
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
  const [datosInicializados, setDatosInicializados] = useState(false);
  const [documentoDescuentaStock, setDocumentoDescuentaStock] = useState("ALBARAN");
  const [estadosDocumento, setEstadosDocumento] = useState(estadosPredeterminados);

  // ========== MODAL CAMBIO ESTADO ==========
  const [mostrarModalCambioEstado, setMostrarModalCambioEstado] = useState(false);
  const [datosModalCambioEstado, setDatosModalCambioEstado] = useState({
    tipo: 'DESCUENTO',
    estadoOrigen: '',
    estadoDestino: '',
    productos: []
  });

  // ========== MODAL HISTORIAL ==========
  const [modalHistorialAbierto, setModalHistorialAbierto] = useState(false);
  const [documentoHistorial, setDocumentoHistorial] = useState(null);
  const [historialModal, setHistorialModal] = useState([]);
  const [cargandoHistorialModal, setCargandoHistorialModal] = useState(false);

  // ========== ENDPOINTS ==========
  const API_URL = API_ENDPOINTS[endpoint];
  const CLIENTES_API_URL = API_ENDPOINTS.clientes;
  const PRODUCTOS_API_URL = API_ENDPOINTS.productos;
  const TIPOS_IVA_API_URL = API_ENDPOINTS.tiposIva;
  const ARCHIVOS_API_URL = API_ENDPOINTS.archivosEmpresa;
  const SERIES_API_URL = API_ENDPOINTS.series;
  const SERIES_PREF_API_URL = API_ENDPOINTS.seriesPreferencias;
  const ALMACENES_API_URL = API_ENDPOINTS.almacenes;
  const API_URL_CONFIG_VENTAS = API_ENDPOINTS.configuracionVentas;
  const TRANSFORMACIONES_API_URL = API_ENDPOINTS.documentoTransformaciones;

  // ========== FORMULARIO POR PESTAÑA ==========
  const formDocumento = useMemo(() => {
    if (!pestanaActiva) return formInicial;
    return formulariosPorPestana[pestanaActiva] || formInicial;
  }, [formulariosPorPestana, pestanaActiva, formInicial]);

  const setFormDocumento = useCallback((nuevoFormulario, pestanaId = null) => {
    const idPestana = pestanaId || pestanaActiva;
    if (!idPestana) return;
    
    setFormulariosPorPestana(prev => ({
      ...prev,
      [idPestana]: typeof nuevoFormulario === 'function' 
        ? nuevoFormulario(prev[idPestana] || formInicial)
        : nuevoFormulario
    }));
  }, [pestanaActiva, formInicial]);

  const limpiarFormularioPestana = useCallback((pestanaId) => {
    setFormulariosPorPestana(prev => {
      const nuevo = { ...prev };
      delete nuevo[pestanaId];
      return nuevo;
    });
  }, []);

  // Función para actualizar un campo específico del formulario
  const updateFormDocumentoField = useCallback((field, value) => {
    setFormDocumento((prev) => ({
      ...prev,
      [field]: value
    }));
  }, [setFormDocumento]);

  // ========== TARIFAS Y STOCK ==========
  const tarifasAlbaran = useTarifasAlbaran(formDocumento, setFormDocumento);
  const stockInfo = useStockProductos(productos, formDocumento.almacenId);
  const mostrarSelectorAlmacen = useMemo(() => almacenes.length > 1, [almacenes]);

  // ========== USUARIO ==========
  const usuarioId = useMemo(
    () =>
      session?.usuario?.id ??
      session?.usuarioId ??
      session?.usuario?.usuarioId ??
      null,
    [session]
  );

  // ========== INICIALIZACIÓN DE FORMULARIO ==========
  useEffect(() => {
    if (typeof pestanaActiva === 'string' && pestanaActiva.startsWith(`${_prefijo}-nuevo`)) {
      setFormulariosPorPestana(prev => {
        if (!prev[pestanaActiva]) {
          return {
            ...prev,
            [pestanaActiva]: { ...formInicial }
          };
        }
        return prev;
      });
    }
  }, [pestanaActiva, formInicial, _prefijo]);

  // ========== SELECCIÓN AUTOMÁTICA DE SERIE ==========
  useEffect(() => {
    if (typeof pestanaActiva !== 'string' || !pestanaActiva.startsWith(`${_prefijo}-nuevo`)) return;
    if (seriesDisponibles.length === 0 || formDocumento.serieId) return;
    
    let serieId = "";
    
    if (seriePreferidaUsuario?.serie?.id) {
      serieId = seriePreferidaUsuario.serie.id.toString();
    } else {
      const seriePredeterminada = seriesDisponibles.find(s => s.defaultSistema === true);
      if (seriePredeterminada) {
        serieId = seriePredeterminada.id.toString();
      } else if (seriesDisponibles.length === 1) {
        serieId = seriesDisponibles[0].id.toString();
      }
    }
    
    if (serieId) {
      setFormDocumento(prev => ({ ...prev, serieId }));
    }
  }, [pestanaActiva, seriesDisponibles, formDocumento.serieId, seriePreferidaUsuario, _prefijo, setFormDocumento]);

  // ========== CARGA DE DATOS ==========
  const cargarDocumentos = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      if (response.ok) {
        const data = await response.json();
        
        const documentosConOrigen = await Promise.all((Array.isArray(data) ? data : []).map(async (doc) => {
          try {
            const resOrigen = await fetch(`${TRANSFORMACIONES_API_URL}/origen-directo/${tipoDocumento}/${doc.id}`);
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
                return tipos[tipo] || 'Manual';
              };
              return { ...doc, origen: formatearTipo(dataOrigen.tipoOrigen) };
            }
            return { ...doc, origen: null };
          } catch (err) {
            return { ...doc, origen: null };
          }
        }));
        
        setDocumentos(documentosConOrigen);
        setPaginacion({ totalElements: data.length || 0, totalPages: 1 });
      }
    } catch (error) {
      console.error(`Error al cargar ${endpoint}:`, error);
    } finally {
      setLoading(false);
    }
  }, [API_URL, TRANSFORMACIONES_API_URL, tipoDocumento, endpoint]);

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
  }, [CLIENTES_API_URL]);

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
  }, [PRODUCTOS_API_URL]);

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
  }, [TIPOS_IVA_API_URL]);

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
  }, [ALMACENES_API_URL]);

  const cargarConfiguracionVentas = useCallback(async () => {
    try {
      const res = await fetch(API_URL_CONFIG_VENTAS);
      const data = await res.json();
      setPermitirVentaMultialmacen(data.permitirVentaMultialmacen || false);
      setDocumentoDescuentaStock(data.documentoDescuentaStock || "ALBARAN");
      // Usar estados de la configuración si existen, sino usar predeterminados
      if (data.estadosAlbaran && Array.isArray(data.estadosAlbaran) && data.estadosAlbaran.length > 0) {
        setEstadosDocumento(data.estadosAlbaran);
      } else {
        setEstadosDocumento(estadosPredeterminados);
      }
    } catch (err) {
      console.error("Error al cargar configuración de ventas:", err);
      setEstadosDocumento(estadosPredeterminados);
    }
  }, [API_URL_CONFIG_VENTAS, estadosPredeterminados]);

  const cargarSeries = useCallback(async () => {
    setCargandoSeries(true);
    try {
      const params = new URLSearchParams({
        tipoDocumento: tipoSerie,
        soloActivas: "true",
      });
      const url = `${SERIES_API_URL}?${params.toString()}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setSeriesDisponibles(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error al cargar series:", error);
    } finally {
      setCargandoSeries(false);
    }
  }, [SERIES_API_URL, tipoSerie]);

  const cargarPreferenciaSerie = useCallback(async () => {
    if (!usuarioId) {
      setSeriePreferidaUsuario(null);
      return;
    }
    try {
      const params = new URLSearchParams({
        usuarioId: usuarioId.toString(),
        tipoDocumento: tipoSerie,
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
  }, [usuarioId, SERIES_PREF_API_URL, tipoSerie]);

  // ========== CARGA INICIAL ==========
  useEffect(() => {
    cargarDocumentos();
  }, [cargarDocumentos]);

  useEffect(() => {
    const esPestanaDocumento = typeof pestanaActiva === 'string' && (
      pestanaActiva.startsWith(`${_prefijo}-nuevo`) || 
      pestanaActiva.startsWith(`${_prefijo}-editar`)
    );

    if (!esPestanaDocumento || datosInicializados) return;

    setDatosInicializados(true);
    cargarDocumentos();
    cargarClientes();
    cargarProductos();
    cargarTiposIva();
    cargarAlmacenes();
    cargarConfiguracionVentas();

    if (seriesDisponibles.length === 0) {
      cargarSeries();
    }
  }, [pestanaActiva, datosInicializados, _prefijo, seriesDisponibles.length, cargarDocumentos, cargarClientes, cargarProductos, cargarTiposIva, cargarAlmacenes, cargarSeries, cargarConfiguracionVentas]);

  useEffect(() => {
    if (typeof pestanaActiva !== 'string' || !pestanaActiva.startsWith(`${_prefijo}-nuevo`)) return;
    cargarPreferenciaSerie();
  }, [pestanaActiva, cargarPreferenciaSerie, _prefijo]);

  // ========== GENERACIÓN AUTOMÁTICA DE NÚMERO ==========
  useEffect(() => {
    if (typeof pestanaActiva !== 'string' || !pestanaActiva.startsWith(`${_prefijo}-nuevo`)) return;
    if (!formDocumento.serieId || formDocumento.usarCodigoManual || formDocumento.id) return;

    const generarNumeroAutomatico = async () => {
      setGenerandoNumero(true);
      try {
        const response = await fetch(`${API_URL}/siguiente-numero?serieId=${formDocumento.serieId}`);
        if (response.ok) {
          const data = await response.json();
          setFormDocumento(prev => ({ ...prev, numero: data.numero || data }));
        }
      } catch (error) {
        console.error('Error al generar número:', error);
      } finally {
        setGenerandoNumero(false);
      }
    };

    generarNumeroAutomatico();
  }, [pestanaActiva, formDocumento.serieId, formDocumento.usarCodigoManual, formDocumento.id, API_URL, _prefijo, setFormDocumento]);

  // ========== DESCUENTO DE AGRUPACIÓN ==========
  const descuentoAgrupacionBase = useMemo(() => {
    if (!formDocumento.clienteId) return 0;
    const cliente = clientes.find((c) => c.id === parseInt(formDocumento.clienteId));
    return cliente?.agrupacion?.descuentoGeneral || 0;
  }, [formDocumento.clienteId, clientes]);

  // ========== HISTORIAL DE TRANSFORMACIONES ==========
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
  }, [TRANSFORMACIONES_API_URL]);

  const abrirModalHistorialDocumento = useCallback(async (documento) => {
    setDocumentoHistorial({ tipo: tipoDocumento, id: documento.id, numero: documento.numero });
    setModalHistorialAbierto(true);
    setCargandoHistorialModal(true);
    try {
      const historial = await cargarHistorialTransformaciones(tipoDocumento, documento.id);
      setHistorialModal(historial || []);
    } catch (error) {
      console.error('Error al cargar historial:', error);
      setHistorialModal([]);
    } finally {
      setCargandoHistorialModal(false);
    }
  }, [cargarHistorialTransformaciones, tipoDocumento]);

  const cerrarModalHistorial = useCallback(() => {
    setModalHistorialAbierto(false);
    setDocumentoHistorial(null);
    setHistorialModal([]);
  }, []);

  // ========== ADJUNTOS ==========
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
        setFormDocumento((prev) => ({
          ...prev,
          adjuntos: [...(prev.adjuntos || []), adjunto],
        }));
      }
    } catch (error) {
      console.error("Error al subir adjunto:", error);
    }
  }, [ARCHIVOS_API_URL, setFormDocumento]);

  const eliminarAdjunto = useCallback(async (adjuntoId) => {
    if (!adjuntoId || adjuntoId === 0) {
      const adjunto = formDocumento.adjuntos?.find(a => a.id === adjuntoId || a.id === 0);
      if (adjunto?.idReal) {
        try {
          await fetch(`${ARCHIVOS_API_URL}/${adjunto.idReal}`, { method: "DELETE" });
        } catch (e) {
          console.error("Error al eliminar adjunto temporal:", e);
        }
      }
    }
    setFormDocumento((prev) => ({
      ...prev,
      adjuntos: prev.adjuntos.filter((a) => a.id !== adjuntoId),
    }));
  }, [formDocumento.adjuntos, ARCHIVOS_API_URL, setFormDocumento]);

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
  }, [ARCHIVOS_API_URL]);

  // ========== PREFERENCIA DE SERIE ==========
  const guardarPreferenciaSerie = useCallback(async (serieId) => {
    setGuardandoPreferenciaSerie(true);
    try {
      const response = await fetch(SERIES_PREF_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipoDocumento: tipoSerie, serieId }),
      });
      if (response.ok) {
        alert("Preferencia de serie guardada");
      }
    } catch (error) {
      console.error("Error al guardar preferencia:", error);
    } finally {
      setGuardandoPreferenciaSerie(false);
    }
  }, [SERIES_PREF_API_URL, tipoSerie]);

  // ========== DESCARGAR PDF ==========
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
  }, [API_URL]);

  // ========== RETORNO ==========
  return {
    // Estado
    documentos,
    formDocumento,
    setFormDocumento,
    updateFormDocumentoField,
    limpiarFormularioPestana,
    clientes,
    productos,
    tiposIva,
    loading,
    paginacion,
    seriesDisponibles,
    cargandoSeries,
    seriePreferidaUsuario,
    guardandoPreferenciaSerie,
    generandoNumero,
    estadoOptions: estadosDocumento,
    almacenes,
    mostrarSelectorAlmacen,
    permitirVentaMultialmacen,
    documentoDescuentaStock,
    tarifasAlbaran,
    stockInfo,
    descuentoAgrupacionBase,
    
    // Modal cambio estado
    mostrarModalCambioEstado,
    setMostrarModalCambioEstado,
    datosModalCambioEstado,
    setDatosModalCambioEstado,
    
    // Funciones de carga
    cargarDocumentos,
    cargarClientes,
    cargarProductos,
    cargarTiposIva,
    cargarAlmacenes,
    cargarSeries,
    cargarConfiguracionVentas,
    
    // Adjuntos
    subirAdjunto,
    eliminarAdjunto,
    descargarAdjunto,
    
    // Series
    guardarPreferenciaSerie,
    
    // PDF
    descargarPdf,
    
    // Historial
    modalHistorialAbierto,
    documentoHistorial,
    historialModal,
    cargandoHistorialModal,
    abrirModalHistorialDocumento,
    cerrarModalHistorial,
    cargarHistorialTransformaciones,
    
    // Endpoints (para uso en hooks específicos)
    API_URL,
    TRANSFORMACIONES_API_URL,
  };
}
