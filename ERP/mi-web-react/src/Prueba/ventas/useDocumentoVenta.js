import { useState, useCallback, useEffect } from "react";
import API_ENDPOINTS from "../../config/api";

const BASE_API_URL = API_ENDPOINTS.albaranes.replace('/albaranes', '');
const TRANSFORMACIONES_API_URL = API_ENDPOINTS.documentoTransformaciones;

// Mapeo de tipos de documento para la API de transformaciones
const TIPO_DOCUMENTO_TRANSFORMACION = {
  'presupuestos': 'PRESUPUESTO',
  'pedidos': 'PEDIDO',
  'facturas': 'FACTURA',
  'facturas-proforma': 'FACTURA_PROFORMA',
  'facturas-rectificativas': 'FACTURA_RECTIFICATIVA',
  'albaranes': 'ALBARAN'
};

/**
 * Hook genérico para gestionar documentos de venta
 * @param {string} tipoDocumento - Tipo de documento: 'presupuestos', 'pedidos', 'facturas', 'facturas-proforma', 'facturas-rectificativas'
 * @param {object} options - Opciones adicionales
 */
export const useDocumentoVenta = (tipoDocumento, options = {}) => {
  const API_URL = `${BASE_API_URL}/${tipoDocumento}`;
  const soportaPaginado = options?.paginado !== false;
  
  const [documentos, setDocumentos] = useState([]);
  const [documentoActual, setDocumentoActual] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paginacion, setPaginacion] = useState({
    page: 0,
    size: 50,
    totalElements: 0,
    totalPages: 0,
  });

  // Cargar lista de documentos
  const cargarDocumentos = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      let data;
      if (soportaPaginado) {
        const queryParams = new URLSearchParams({
          page: params.page ?? paginacion.page,
          size: params.size ?? paginacion.size,
          sortBy: params.sortBy ?? 'id',
          sortDir: params.sortDir ?? 'DESC',
          ...(params.search && { search: params.search }),
          ...(params.estado && { estado: params.estado }),
        });

        const response = await fetch(`${API_URL}/paginado?${queryParams}`);
        if (!response.ok) throw new Error('Error al cargar documentos paginados');
        
        const paginatedData = await response.json();
        data = paginatedData.content || [];
        setPaginacion({
          page: paginatedData.currentPage,
          size: paginatedData.pageSize,
          totalElements: paginatedData.totalElements,
          totalPages: paginatedData.totalPages,
        });
      } else {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Error al cargar documentos');
        data = await response.json();
        data = Array.isArray(data) ? data : [];
        setPaginacion((prev) => ({ ...prev, totalElements: data.length || 0, totalPages: 1 }));
      }

      // Cargar origen de cada documento (trazabilidad)
      const tipoTransformacion = TIPO_DOCUMENTO_TRANSFORMACION[tipoDocumento];
      if (tipoTransformacion) {
        const documentosConOrigen = await Promise.all(data.map(async (doc) => {
          try {
            const resOrigen = await fetch(`${TRANSFORMACIONES_API_URL}/origen-directo/${tipoTransformacion}/${doc.id}`);
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
              return { ...doc, origen: formatearTipo(dataOrigen.tipoOrigen) };
            }
            return { ...doc, origen: null };
          } catch (err) {
            return { ...doc, origen: null };
          }
        }));
        setDocumentos(documentosConOrigen);
      } else {
        setDocumentos(data);
      }
      
      return { content: data };
    } catch (err) {
      setError(err.message);
      // Fallback a carga simple sin trazabilidad
      try {
        const response = await fetch(API_URL);
        if (response.ok) {
          const data = await response.json();
          const documentosData = Array.isArray(data) ? data : [];
          setDocumentos(documentosData);
          setPaginacion((prev) => ({ ...prev, totalElements: documentosData.length || 0, totalPages: 1 }));
          return { content: documentosData };
        }
      } catch (e) {
        console.error('Error en fallback:', e);
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, [API_URL, paginacion.page, paginacion.size, soportaPaginado, tipoDocumento]);

  // Cargar un documento por ID
  const cargarDocumento = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/${id}`);
      if (!response.ok) throw new Error('Documento no encontrado');
      
      const data = await response.json();
      
      // Convertir fecha ISO a formato datetime-local (YYYY-MM-DDTHH:mm)
      if (data.fecha) {
        data.fecha = new Date(data.fecha).toISOString().slice(0, 16);
      }
      
      setDocumentoActual(data);
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  // Obtener siguiente número
  const obtenerSiguienteNumero = useCallback(async (serieId = null) => {
    try {
      const params = serieId ? `?serieId=${serieId}` : '';
      const response = await fetch(`${API_URL}/siguiente-numero${params}`);
      if (!response.ok) throw new Error('Error al obtener número');
      return await response.json();
    } catch (err) {
      console.error('Error obteniendo siguiente número:', err);
      return null;
    }
  }, [API_URL]);

  // Crear documento
  const crearDocumento = useCallback(async (datos) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error al crear documento');
      }
      
      const nuevoDocumento = await response.json();
      setDocumentos(prev => [nuevoDocumento, ...prev]);
      return nuevoDocumento;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  // Actualizar documento
  const actualizarDocumento = useCallback(async (id, datos) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error al actualizar documento');
      }
      
      const documentoActualizado = await response.json();
      setDocumentos(prev => 
        prev.map(doc => doc.id === id ? documentoActualizado : doc)
      );
      setDocumentoActual(documentoActualizado);
      return documentoActualizado;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  // Eliminar documento
  const eliminarDocumento = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error al eliminar documento');
      }
      
      setDocumentos(prev => prev.filter(doc => doc.id !== id));
      if (documentoActual?.id === id) {
        setDocumentoActual(null);
      }
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [API_URL, documentoActual]);

  // Duplicar documento
  const duplicarDocumento = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/${id}/duplicar`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error al duplicar documento');
      }
      
      const documentoDuplicado = await response.json();
      setDocumentos(prev => [documentoDuplicado, ...prev]);
      return documentoDuplicado;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  // Convertir a otro tipo de documento
  const convertirDocumento = useCallback(async (id, tipoDestino) => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = `${API_URL}/${id}/convertir-a-${tipoDestino}`;
      const response = await fetch(endpoint, {
        method: 'POST',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error al convertir documento');
      }
      
      return await response.json();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  // Obtener tarifas disponibles
  const obtenerTarifas = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/tarifas-disponibles`);
      if (!response.ok) return { tarifas: [], tarifaPorDefecto: null };
      return await response.json();
    } catch (err) {
      console.error('Error obteniendo tarifas:', err);
      return { tarifas: [], tarifaPorDefecto: null };
    }
  }, [API_URL]);

  // Obtener precio de producto según tarifa
  const obtenerPrecioProducto = useCallback(async (productoId, tarifaId = null) => {
    try {
      const params = new URLSearchParams({ productoId });
      if (tarifaId) params.append('tarifaId', tarifaId);
      
      const response = await fetch(`${API_URL}/precio-producto?${params}`);
      if (!response.ok) return null;
      return await response.json();
    } catch (err) {
      console.error('Error obteniendo precio:', err);
      return null;
    }
  }, [API_URL]);

  // Descargar PDF
  const descargarPdf = useCallback(async (id, nombreArchivo) => {
    try {
      const response = await fetch(`${API_URL}/${id}/pdf`);
      if (!response.ok) throw new Error('Error al generar PDF');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = nombreArchivo || `documento-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }, [API_URL]);

  // Limpiar error
  const limpiarError = useCallback(() => {
    setError(null);
  }, []);

  // Resetear documento actual
  const resetearDocumentoActual = useCallback(() => {
    setDocumentoActual(null);
  }, []);

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

  const abrirModalHistorialDocumento = useCallback(async (documento) => {
    const tipoTransformacion = TIPO_DOCUMENTO_TRANSFORMACION[tipoDocumento];
    setDocumentoHistorial({ 
      tipo: tipoTransformacion, 
      id: documento.id, 
      numero: documento.numero 
    });
    setModalHistorialAbierto(true);
    setCargandoHistorialModal(true);
    try {
      const historial = await cargarHistorialTransformaciones(tipoTransformacion, documento.id);
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

  return {
    // Estado
    documentos,
    documentoActual,
    loading,
    error,
    paginacion,
    
    // Modal historial
    modalHistorialAbierto,
    documentoHistorial,
    historialModal,
    cargandoHistorialModal,
    abrirModalHistorialDocumento,
    cerrarModalHistorial,
    
    // Acciones
    cargarDocumentos,
    cargarDocumento,
    obtenerSiguienteNumero,
    crearDocumento,
    actualizarDocumento,
    eliminarDocumento,
    duplicarDocumento,
    convertirDocumento,
    obtenerTarifas,
    obtenerPrecioProducto,
    descargarPdf,
    limpiarError,
    resetearDocumentoActual,
    setDocumentoActual,
    setDocumentos,
  };
};

// Hooks específicos para cada tipo de documento
export const usePresupuestos = (options = {}) => useDocumentoVenta('presupuestos', options);
export const usePedidos = (options = {}) => useDocumentoVenta('pedidos', options);
export const useFacturas = (options = {}) => useDocumentoVenta('facturas', options);
export const useFacturasProforma = (options = {}) => useDocumentoVenta('facturas-proforma', options);
export const useFacturasRectificativas = (options = {}) => useDocumentoVenta('facturas-rectificativas', options);

export default useDocumentoVenta;
