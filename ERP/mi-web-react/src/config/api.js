// Configuración centralizada de URLs de API
// Para cambiar el servidor, modifica solo API_BASE_URL

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://145.223.103.219:8080';

export const API_ENDPOINTS = {
  // Documentos de venta
  albaranes: `${API_BASE_URL}/albaranes`,
  facturas: `${API_BASE_URL}/facturas`,
  facturasProforma: `${API_BASE_URL}/facturas-proforma`,
  facturasRectificativas: `${API_BASE_URL}/facturas-rectificativas`,
  pedidos: `${API_BASE_URL}/pedidos`,
  presupuestos: `${API_BASE_URL}/presupuestos`,
  
  // Documentos de compra
  pedidosCompra: `${API_BASE_URL}/pedidos-compra`,
  albaranesCompra: `${API_BASE_URL}/albaranes-compra`,
  facturasCompra: `${API_BASE_URL}/facturas-compra`,
  presupuestosCompra: `${API_BASE_URL}/presupuestos-compra`,
  
  // Maestros
  clientes: `${API_BASE_URL}/clientes`,
  productos: `${API_BASE_URL}/productos`,
  proveedores: `${API_BASE_URL}/proveedores`,
  fabricantes: `${API_BASE_URL}/fabricantes`,
  
  // Almacén
  almacenes: `${API_BASE_URL}/almacenes`,
  productoAlmacen: `${API_BASE_URL}/producto-almacen`,
  movimientosStock: `${API_BASE_URL}/movimientos-stock`,
  familias: `${API_BASE_URL}/familias`,
  subfamilias: `${API_BASE_URL}/subfamilias`,
  
  // Configuración
  tiposIva: `${API_BASE_URL}/tipos-iva`,
  series: `${API_BASE_URL}/series`,
  seriesPreferencias: `${API_BASE_URL}/series/preferencias`,
  configuracionVentas: `${API_BASE_URL}/configuracion-ventas`,
  tarifas: `${API_BASE_URL}/tarifas`,
  condicionesComerciales: `${API_BASE_URL}/condiciones-comerciales`,
  agrupaciones: `${API_BASE_URL}/agrupaciones`,
  
  // Transformaciones y trazabilidad
  documentoTransformaciones: `${API_BASE_URL}/documento-transformaciones`,
  
  // Archivos y recursos
  archivosEmpresa: `${API_BASE_URL}/archivos-empresa`,
  imagenes: `${API_BASE_URL}/imagenes`,
  
  // TPV
  configuracionTicketTPV: `${API_BASE_URL}/configuracion-ticket-tpv`,
  
  // Usuarios
  usuarios: `${API_BASE_URL}/usuarios`,
  usuarioInicioPanel: `${API_BASE_URL}/usuario-inicio-panel`,
  
  // Empresa
  empresa: `${API_BASE_URL}/empresa`,
  empresaColores: `${API_BASE_URL}/empresa-colores`,
  
  // Plantillas
  plantillasPdf: `${API_BASE_URL}/plantillas-pdf`,
  
  // Códigos de barras
  tiposCodigoBarra: `${API_BASE_URL}/tipos-codigo-barra`,
  codigosBarras: `${API_BASE_URL}/codigos-barras`,
};

// Helper para construir URLs con parámetros
export const buildUrl = (endpoint, params = {}) => {
  const url = new URL(endpoint);
  Object.keys(params).forEach(key => {
    if (params[key] !== null && params[key] !== undefined) {
      url.searchParams.append(key, params[key]);
    }
  });
  return url.toString();
};

// Helper para construir URL con ID
export const buildUrlWithId = (endpoint, id) => {
  return `${endpoint}/${id}`;
};

export default API_ENDPOINTS;
