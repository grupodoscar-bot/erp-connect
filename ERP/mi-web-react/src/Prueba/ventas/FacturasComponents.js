import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useFacturasForm } from './useFacturasForm';
import DocumentoVentaListado from './DocumentoVentaListado';
import { ModalHistorialTransformaciones } from './ModalHistorialTransformaciones';
import { 
  IconTransform, 
  IconDuplicate,
  IconPdf,
  IconDocument
} from '../iconos';
import API_ENDPOINTS from '../../config/api';

const COLUMNAS_FACTURA = [
  { field: 'numero', header: 'Número', tipo: 'texto' },
  { field: 'fecha', header: 'Fecha', tipo: 'fecha' },
  { accessor: 'cliente.nombreComercial', header: 'Cliente', tipo: 'texto' },
  { field: 'estado', header: 'Estado', tipo: 'estado' },
  { field: 'totalBaseSinImpuestos', header: 'Base', tipo: 'moneda' },
  { field: 'totalIva', header: 'IVA', tipo: 'moneda' },
  { field: 'totalRecargo', header: 'Rec. Eq.', tipo: 'moneda' },
  { field: 'total', header: 'Total', tipo: 'moneda' },
  { 
    field: 'contabilizado', 
    header: 'Contab.', 
    tipo: 'texto',
    render: (valor) => valor ? '✓' : '-'
  },
];

export const FacturasListado = ({ onEditar, onVer, onNuevo, modoVisual = "claro", abrirModalHistorialDocumento: abrirModalHistorialProp }) => {
  const {
    documentos,
    loading,
    paginacion,
    cargarDocumentos,
    eliminarDocumento,
    duplicarDocumento,
    descargarPdf,
    estadoOptions,
    // Modal historial - usar la prop pasada desde PruebaWorkspace
    modalHistorialAbierto,
    documentoHistorial,
    historialModal,
    cargandoHistorialModal,
    abrirModalHistorialDocumento: abrirModalHistorialHook,
    cerrarModalHistorial,
  } = useFacturasForm();

  // Usar la prop si se pasa, sino usar la del hook
  const abrirModalHistorialDocumento = abrirModalHistorialProp || abrirModalHistorialHook;

  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroFechaDesde, setFiltroFechaDesde] = useState('');
  const [filtroFechaHasta, setFiltroFechaHasta] = useState('');
  const [filtroSerieId, setFiltroSerieId] = useState('');
  const [filtroNumero, setFiltroNumero] = useState('');
  const [filtroImporteMin, setFiltroImporteMin] = useState('');
  const [filtroImporteMax, setFiltroImporteMax] = useState('');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [documentosSeleccionados, setDocumentosSeleccionados] = useState([]);
  const [paginaActual, setPaginaActual] = useState(0);
  const [itemsPorPagina, setItemsPorPagina] = useState(20);
  const [ordenarPor, setOrdenarPor] = useState('fechaCreacion');
  const [ordenDireccion, setOrdenDireccion] = useState('desc');
  const [mostrarModalTransformar, setMostrarModalTransformar] = useState(false);
  const [facturaParaTransformar, setFacturaParaTransformar] = useState(null);
  const [tipoTransformacionSeleccionado, setTipoTransformacionSeleccionado] = useState(null);
  const [serieSeleccionada, setSerieSeleccionada] = useState('');
  const [fechaTransformacion, setFechaTransformacion] = useState(new Date().toISOString().split('T')[0]);
  const [estadoTransformacion, setEstadoTransformacion] = useState('Pendiente');
  const [seriesDisponibles, setSeriesDisponibles] = useState([]);
  const [cargandoSeries, setCargandoSeries] = useState(false);
  const [proveedorId, setProveedorId] = useState('');
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);
  const [proveedoresLista, setProveedoresLista] = useState([]);
  const [busquedaProveedor, setBusquedaProveedor] = useState('');
  const [mostrarProveedores, setMostrarProveedores] = useState(false);
  const dropdownProveedorRef = useRef(null);

  useEffect(() => {
    cargarDocumentos();
  }, []);

  const cambiarOrdenacion = (campo) => {
    if (ordenarPor === campo) {
      setOrdenDireccion(ordenDireccion === 'asc' ? 'desc' : 'asc');
    } else {
      setOrdenarPor(campo);
      setOrdenDireccion('desc');
    }
  };

  const documentosOrdenados = useMemo(() => {
    const docs = [...documentos];
    
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
        case 'fechaCreacion':
          valorA = new Date(a.fechaCreacion || a.fecha || 0);
          valorB = new Date(b.fechaCreacion || b.fecha || 0);
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
  }, [documentos, ordenarPor, ordenDireccion]);

  const seleccionarTodos = documentosSeleccionados.length === documentosOrdenados.length && documentosOrdenados.length > 0;

  const toggleSeleccionarTodos = () => {
    if (seleccionarTodos) {
      setDocumentosSeleccionados([]);
    } else {
      setDocumentosSeleccionados(documentos.map(d => d.id));
    }
  };

  const toggleSeleccionDocumento = (id) => {
    setDocumentosSeleccionados(prev => 
      prev.includes(id) ? prev.filter(docId => docId !== id) : [...prev, id]
    );
  };

  const eliminarSeleccionados = async () => {
    if (documentosSeleccionados.length === 0) return;
    if (window.confirm(`¿Está seguro de eliminar ${documentosSeleccionados.length} factura(s)?`)) {
      try {
        for (const id of documentosSeleccionados) {
          await eliminarDocumento(id);
        }
        setDocumentosSeleccionados([]);
        cargarDocumentos();
      } catch (error) {
        alert('Error al eliminar: ' + error.message);
      }
    }
  };

  const exportarExcelCsv = () => {
    if (documentosSeleccionados.length === 0) return;
    alert('Función de exportación en desarrollo');
  };

  const abrirModalPdfMultiple = () => {
    if (documentosSeleccionados.length === 0) return;
    alert('Función de PDF múltiple en desarrollo');
  };

  const limpiarFiltros = () => {
    setFiltroEstado('');
    setFiltroFechaDesde('');
    setFiltroFechaHasta('');
    setFiltroSerieId('');
    setFiltroNumero('');
    setFiltroImporteMin('');
    setFiltroImporteMax('');
  };

  const contarFiltrosActivos = () => {
    let count = 0;
    if (filtroEstado) count++;
    if (filtroFechaDesde) count++;
    if (filtroFechaHasta) count++;
    if (filtroSerieId) count++;
    if (filtroNumero) count++;
    if (filtroImporteMin) count++;
    if (filtroImporteMax) count++;
    return count;
  };

  const totalesFiltrados = {
    base: documentos.reduce((sum, doc) => sum + (doc.totalBaseSinImpuestos || 0), 0),
    iva: documentos.reduce((sum, doc) => sum + (doc.totalIva || 0), 0),
    recargo: documentos.reduce((sum, doc) => sum + (doc.totalRecargo || 0), 0),
    total: documentos.reduce((sum, doc) => sum + (doc.total || 0), 0),
    count: documentos.length
  };

  const abrirModalTransformar = async (factura) => {
    setFacturaParaTransformar(factura);
    setMostrarModalTransformar(true);
    setTipoTransformacionSeleccionado(null);
    setSerieSeleccionada('');
    setFechaTransformacion(new Date().toISOString().split('T')[0]);
    setEstadoTransformacion('Pendiente');
    setProveedorId('');
    setProveedorSeleccionado(null);
    setBusquedaProveedor('');
    setMostrarProveedores(false);
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
  };

  const cerrarModalTransformar = () => {
    setMostrarModalTransformar(false);
    setFacturaParaTransformar(null);
    setTipoTransformacionSeleccionado(null);
    setSerieSeleccionada('');
  };

  // Funciones para selector de proveedor
  const filtrarProveedores = (query) => {
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
  };

  const handleInputProveedorChange = (e) => {
    const valor = e.target.value;
    setBusquedaProveedor(valor);
    setMostrarProveedores(true);
    if (!valor.trim()) {
      setProveedorId('');
    }
  };

  const seleccionarProveedor = (proveedor) => {
    setProveedorId(proveedor.id);
    setProveedorSeleccionado(proveedor);
    setBusquedaProveedor(proveedor.nombreComercial || '');
    setMostrarProveedores(false);
  };

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
        'DUPLICAR': 'FACTURA_VENTA',
        'ALBARAN': 'ALBARAN_VENTA',
        'PEDIDO': 'PEDIDO_VENTA',
        'PRESUPUESTO': 'PRESUPUESTO',
        'FACTURA_PROFORMA': 'FACTURA_PROFORMA',
        'FACTURA_RECTIFICATIVA': 'FACTURA_RECTIFICATIVA',
        'PRESUPUESTO_COMPRA': 'PRESUPUESTO_COMPRA',
        'PEDIDO_COMPRA': 'PEDIDO_COMPRA',
        'ALBARAN_COMPRA': 'ALBARAN_COMPRA',
        'FACTURA_COMPRA': 'FACTURA_COMPRA',
      };
      
      const tipoDocumento = tipoDocumentoMap[tipoTransformacionSeleccionado];
      if (!tipoDocumento) return;
      
      try {
        setCargandoSeries(true);
        setSeriesDisponibles([]);
        setSerieSeleccionada('');
        
        const params = new URLSearchParams({
          tipoDocumento: tipoDocumento,
          soloActivas: 'true'
        });
        const url = `${API_ENDPOINTS.series}?${params.toString()}`;
        
        const res = await fetch(url);
        if (!res.ok) throw new Error('Error al cargar series');
        const data = await res.json();
        const series = Array.isArray(data) ? data : data.content || [];
        
        setSeriesDisponibles(series);
      } catch (err) {
        console.error('Error cargando series:', err);
        setSeriesDisponibles([]);
      } finally {
        setCargandoSeries(false);
      }
    };
    
    cargarSeriesPorTipo();
  }, [tipoTransformacionSeleccionado]);

  const ejecutarTransformacion = async () => {
    if (!facturaParaTransformar || !tipoTransformacionSeleccionado) return;

    try {
      const tipoDocumentoMap = {
        'DUPLICAR': { endpoint: API_ENDPOINTS.facturas, serie: 'FACTURA_VENTA' },
        'ALBARAN': { endpoint: API_ENDPOINTS.albaranes, serie: 'ALBARAN_VENTA' },
        'PEDIDO': { endpoint: API_ENDPOINTS.pedidos, serie: 'PEDIDO_VENTA' },
        'PRESUPUESTO': { endpoint: API_ENDPOINTS.presupuestos, serie: 'PRESUPUESTO' },
        'FACTURA_PROFORMA': { endpoint: API_ENDPOINTS.facturasProforma, serie: 'FACTURA_PROFORMA' },
        'FACTURA_RECTIFICATIVA': { endpoint: API_ENDPOINTS.facturasRectificativas, serie: 'FACTURA_RECTIFICATIVA' },
        'PRESUPUESTO_COMPRA': { endpoint: API_ENDPOINTS.presupuestosCompra, serie: 'PRESUPUESTO_COMPRA' },
        'PEDIDO_COMPRA': { endpoint: API_ENDPOINTS.pedidosCompra, serie: 'PEDIDO_COMPRA' },
        'ALBARAN_COMPRA': { endpoint: API_ENDPOINTS.albaranesCompra, serie: 'ALBARAN_COMPRA' },
        'FACTURA_COMPRA': { endpoint: API_ENDPOINTS.facturasCompra, serie: 'FACTURA_COMPRA' },
      };

      const config = tipoDocumentoMap[tipoTransformacionSeleccionado];
      if (!config) {
        throw new Error('Tipo de transformación no válido');
      }

      const body = {
        tipoOrigen: 'FACTURA',
        idOrigen: facturaParaTransformar.id,
        tipoDestino: tipoTransformacionSeleccionado,
        serieId: serieSeleccionada ? parseInt(serieSeleccionada) : null,
        fecha: fechaTransformacion,
        estado: estadoTransformacion,
        esDuplicacion: tipoTransformacionSeleccionado === 'DUPLICAR',
      };

      // Añadir proveedorId si el destino es compra
      const esCompra = ['PRESUPUESTO_COMPRA', 'PEDIDO_COMPRA', 'ALBARAN_COMPRA', 'FACTURA_COMPRA'].includes(tipoTransformacionSeleccionado);
      if (esCompra && proveedorId) {
        body.proveedorId = parseInt(proveedorId);
      }

      const response = await fetch(`${config.endpoint}/transformar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al transformar documento');
      }

      const resultado = await response.json();
      alert(`Documento transformado correctamente: ${resultado.numero || ''}`);
      cerrarModalTransformar();
      cargarDocumentos();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Error al transformar documento');
    }
  };

  return (
    <DocumentoVentaListado
      tituloSingular="factura"
      documentos={documentosOrdenados}
      cargando={loading}
      estadoOptions={estadoOptions}
      modoVisual={modoVisual}
      paginaActual={paginaActual}
      setPaginaActual={setPaginaActual}
      itemsPorPagina={itemsPorPagina}
      setItemsPorPagina={setItemsPorPagina}
      totalElementos={paginacion?.totalElements || documentosOrdenados.length}
      totalPaginas={paginacion?.totalPages || 1}
      ordenarPor={ordenarPor}
      ordenDireccion={ordenDireccion}
      cambiarOrdenacion={cambiarOrdenacion}
      busqueda={busqueda}
      setBusqueda={setBusqueda}
      filtroFechaDesde={filtroFechaDesde}
      setFiltroFechaDesde={setFiltroFechaDesde}
      filtroFechaHasta={filtroFechaHasta}
      setFiltroFechaHasta={setFiltroFechaHasta}
      filtroEstado={filtroEstado}
      setFiltroEstado={setFiltroEstado}
      filtroSerieId={filtroSerieId}
      setFiltroSerieId={setFiltroSerieId}
      filtroNumero={filtroNumero}
      setFiltroNumero={setFiltroNumero}
      filtroImporteMin={filtroImporteMin}
      setFiltroImporteMin={setFiltroImporteMin}
      filtroImporteMax={filtroImporteMax}
      setFiltroImporteMax={setFiltroImporteMax}
      mostrarFiltros={mostrarFiltros}
      setMostrarFiltros={setMostrarFiltros}
      limpiarFiltros={limpiarFiltros}
      contarFiltrosActivos={contarFiltrosActivos}
      documentosSeleccionados={documentosSeleccionados}
      seleccionarTodos={seleccionarTodos}
      toggleSeleccionDocumento={toggleSeleccionDocumento}
      toggleSeleccionarTodos={toggleSeleccionarTodos}
      abrirNuevoDocumento={onNuevo}
      eliminarSeleccionados={eliminarSeleccionados}
      exportarExcelCsv={exportarExcelCsv}
      abrirModalPdfMultiple={abrirModalPdfMultiple}
      abrirVerDocumento={(doc) => onVer ? onVer(doc) : onEditar(doc)}
      abrirEditarDocumento={onEditar}
      abrirModalTransformar={abrirModalTransformar}
      abrirModalEmail={() => {}}
      abrirModalHistorialDocumento={abrirModalHistorialDocumento}
      cargarDocumentos={cargarDocumentos}
      seriesDisponibles={[]}
      totalesFiltrados={totalesFiltrados}
    >
      {mostrarModalTransformar && facturaParaTransformar && (
        <ModalTransformarFactura
          modalTransformarAbierto={mostrarModalTransformar}
          facturaParaTransformar={facturaParaTransformar}
          cerrarModalTransformar={cerrarModalTransformar}
          tipoTransformacionSeleccionado={tipoTransformacionSeleccionado}
          setTipoTransformacionSeleccionado={setTipoTransformacionSeleccionado}
          serieSeleccionada={serieSeleccionada}
          setSerieSeleccionada={setSerieSeleccionada}
          fechaTransformacion={fechaTransformacion}
          setFechaTransformacion={setFechaTransformacion}
          estadoTransformacion={estadoTransformacion}
          setEstadoTransformacion={setEstadoTransformacion}
          series={seriesDisponibles}
          estadoOptions={estadoOptions}
          ejecutarTransformacion={ejecutarTransformacion}
          proveedorId={proveedorId}
          proveedorSeleccionado={proveedorSeleccionado}
          busquedaProveedor={busquedaProveedor}
          handleInputProveedorChange={handleInputProveedorChange}
          seleccionarProveedor={seleccionarProveedor}
          filtrarProveedores={filtrarProveedores}
          mostrarProveedores={mostrarProveedores}
          dropdownProveedorRef={dropdownProveedorRef}
        />
      )}
      
      {/* Modal de Historial de Transformaciones */}
      <ModalHistorialTransformaciones
        modalAbierto={modalHistorialAbierto}
        cerrarModal={cerrarModalHistorial}
        documento={documentoHistorial ? { ...documentoHistorial, tipo: 'FACTURA' } : null}
        historial={historialModal}
        cargando={cargandoHistorialModal}
        abrirDocumento={async (tipo, id, numero) => {
          const tipoMap = {
            'ALBARAN': 'albaran-ver',
            'FACTURA': 'factura-ver',
            'FACTURA_PROFORMA': 'factura-proforma-ver',
            'FACTURA_RECTIFICATIVA': 'factura-rectificativa-ver',
            'PEDIDO': 'pedido-ver',
            'PRESUPUESTO': 'presupuesto-ver'
          };
          const tipoLabel = {
            'ALBARAN': 'Albarán',
            'FACTURA': 'Factura',
            'FACTURA_PROFORMA': 'Factura Proforma',
            'FACTURA_RECTIFICATIVA': 'Factura Rectificativa',
            'PEDIDO': 'Pedido',
            'PRESUPUESTO': 'Presupuesto'
          };
          const tipoPestana = tipoMap[tipo];
          if (tipoPestana && window.abrirPestana) {
            const titulo = numero ? `${tipoLabel[tipo]} ${numero}` : null;
            window.abrirPestana(tipoPestana, id, titulo);
          }
        }}
      />
    </DocumentoVentaListado>
  );
};

// ========== MODAL TRANSFORMAR FACTURA ==========
export function ModalTransformarFactura({
  modalTransformarAbierto,
  facturaParaTransformar,
  cerrarModalTransformar,
  tipoTransformacionSeleccionado,
  setTipoTransformacionSeleccionado,
  serieSeleccionada,
  setSerieSeleccionada,
  fechaTransformacion,
  setFechaTransformacion,
  estadoTransformacion,
  setEstadoTransformacion,
  series,
  estadoOptions,
  ejecutarTransformacion,
  proveedorId,
  proveedorSeleccionado,
  busquedaProveedor,
  handleInputProveedorChange,
  seleccionarProveedor,
  filtrarProveedores,
  mostrarProveedores,
  dropdownProveedorRef,
}) {
  if (!modalTransformarAbierto || !facturaParaTransformar) return null;

  const opcionesTransformacion = [
    { tipo: 'DUPLICAR', label: 'Duplicar Factura', icon: IconDuplicate, className: 'erp-btn-secondary' },
    { tipo: 'ALBARAN', label: 'Crear Albarán', icon: IconDocument, className: 'erp-btn-info' },
    { tipo: 'PEDIDO', label: 'Crear Pedido', icon: IconDocument, className: 'erp-btn-info' },
    { tipo: 'PRESUPUESTO', label: 'Crear Presupuesto', icon: IconDocument, className: 'erp-btn-secondary' },
    { tipo: 'FACTURA_PROFORMA', label: 'Crear Factura Proforma', icon: IconPdf, className: 'erp-btn-info' },
    { tipo: 'FACTURA_RECTIFICATIVA', label: 'Crear Factura Rectificativa', icon: IconTransform, className: 'erp-btn-warning' },
    { tipo: 'PRESUPUESTO_COMPRA', label: 'Crear Presupuesto Compra', icon: IconDocument, className: 'erp-btn-info' },
    { tipo: 'PEDIDO_COMPRA', label: 'Crear Pedido Compra', icon: IconDocument, className: 'erp-btn-info' },
    { tipo: 'ALBARAN_COMPRA', label: 'Crear Albarán Compra', icon: IconDocument, className: 'erp-btn-info' },
    { tipo: 'FACTURA_COMPRA', label: 'Crear Factura Compra', icon: IconDocument, className: 'erp-btn-success' },
  ];

  return (
    <div className="erp-modal-overlay" onClick={cerrarModalTransformar}>
      <div className="erp-modal" onClick={(e) => e.stopPropagation()}>
        <div className="erp-modal-header">
          <h3>Transformar Factura {facturaParaTransformar.numero}</h3>
          <button className="erp-modal-close" onClick={cerrarModalTransformar}>×</button>
        </div>
        <div className="erp-modal-body">
          {!tipoTransformacionSeleccionado ? (
            <>
              <p style={{ marginBottom: '20px', color: '#6b7280' }}>
                Selecciona qué acción deseas realizar con esta factura:
              </p>
              <div className="erp-transform-options">
                {opcionesTransformacion.map(opcion => {
                  const Icon = opcion.icon;
                  return (
                    <button
                      key={opcion.tipo}
                      className={`erp-btn ${opcion.className} erp-btn-block`}
                      onClick={() => setTipoTransformacionSeleccionado(opcion.tipo)}
                    >
                      <Icon className="erp-action-icon" /> {opcion.label}
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              <p style={{ marginBottom: '20px', color: '#6b7280' }}>
                Configura los datos del nuevo documento:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <label className="erp-field">
                  <span className="erp-field-label">Serie</span>
                  <select
                    value={serieSeleccionada}
                    onChange={(e) => setSerieSeleccionada(e.target.value)}
                    className="erp-input"
                  >
                    <option value="">Sin serie</option>
                    {series && series.length > 0 ? (
                      series.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.prefijo} — {s.descripcion || 'Sin descripción'}
                        </option>
                      ))
                    ) : null}
                  </select>
                  {(!series || series.length === 0) && (
                    <small style={{ color: '#dc3545', marginTop: '4px', display: 'block' }}>
                      No hay series configuradas para este tipo de documento. Créalas en Configuración → Series.
                    </small>
                  )}
                </label>
                <label className="erp-field">
                  <span className="erp-field-label">Fecha</span>
                  <input
                    type="date"
                    value={fechaTransformacion}
                    onChange={(e) => setFechaTransformacion(e.target.value)}
                    className="erp-input"
                  />
                </label>
                <label className="erp-field">
                  <span className="erp-field-label">Estado</span>
                  <select
                    value={estadoTransformacion}
                    onChange={(e) => setEstadoTransformacion(e.target.value)}
                    className="erp-input"
                  >
                    {estadoOptions.map(e => (
                      <option key={e.nombre} value={e.nombre}>{e.nombre}</option>
                    ))}
                  </select>
                </label>

                {/* Selector de Proveedor - cuando destino es compra */}
                {['PRESUPUESTO_COMPRA', 'PEDIDO_COMPRA', 'ALBARAN_COMPRA', 'FACTURA_COMPRA'].includes(tipoTransformacionSeleccionado) && (
                  <div className="erp-field" ref={dropdownProveedorRef}>
                    <span className="erp-field-label">Proveedor *</span>
                    {proveedorSeleccionado ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', background: '#f3f4f6', borderRadius: '4px' }}>
                        <span style={{ flex: 1 }}>{proveedorSeleccionado.nombreComercial || proveedorSeleccionado.nombreFiscal}</span>
                        <button 
                          className="erp-btn erp-btn-sm erp-btn-secondary"
                          onClick={() => { seleccionarProveedor({ id: '', nombreComercial: '' }); }}
                        >
                          Cambiar
                        </button>
                      </div>
                    ) : (
                      <div style={{ position: 'relative' }}>
                        <input
                          type="text"
                          placeholder="Buscar proveedor..."
                          className="erp-input"
                          value={busquedaProveedor}
                          onChange={handleInputProveedorChange}
                          style={{ width: '100%' }}
                        />
                        
                        {busquedaProveedor.trim().length > 0 && busquedaProveedor.trim().length < 3 && (
                          <div style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            backgroundColor: '#fffbeb',
                            border: '1px solid #fbbf24',
                            borderRadius: '6px',
                            padding: '8px 12px',
                            zIndex: 1000,
                            marginTop: '4px',
                            fontSize: '12px',
                            color: '#92400e'
                          }}>
                            Escribe al menos 3 caracteres para buscar...
                          </div>
                        )}
                        
                        {mostrarProveedores && busquedaProveedor.trim().length >= 3 && (
                          <div style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            backgroundColor: 'white',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                            maxHeight: '200px',
                            overflowY: 'auto',
                            zIndex: 1000,
                            marginTop: '4px'
                          }}>
                            {filtrarProveedores(busquedaProveedor).length === 0 ? (
                              <div style={{ padding: '8px 12px', fontSize: '13px', color: '#6b7280' }}>
                                No se encontraron proveedores
                              </div>
                            ) : (
                              filtrarProveedores(busquedaProveedor).map((proveedor) => (
                                <div
                                  key={proveedor.id}
                                  onClick={() => seleccionarProveedor(proveedor)}
                                  style={{
                                    padding: '8px 12px',
                                    cursor: 'pointer',
                                    borderBottom: '1px solid #f1f5f9',
                                    fontSize: '13px'
                                  }}
                                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f8fafc'}
                                  onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                                >
                                  <div style={{ fontWeight: '500', color: '#1e293b' }}>
                                    {proveedor.nombreComercial}
                                  </div>
                                  {proveedor.nombreFiscal && proveedor.nombreFiscal !== proveedor.nombreComercial && (
                                    <div style={{ color: '#64748b', fontSize: '12px' }}>
                                      {proveedor.nombreFiscal}
                                    </div>
                                  )}
                                  {proveedor.nifCif && (
                                    <div style={{ color: '#059669', fontSize: '11px', marginTop: '2px' }}>
                                      CIF/NIF: {proveedor.nifCif}
                                    </div>
                                  )}
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button
                  className="erp-btn erp-btn-secondary"
                  onClick={() => setTipoTransformacionSeleccionado(null)}
                >
                  Atrás
                </button>
                <button
                  className="erp-btn erp-btn-primary"
                  onClick={ejecutarTransformacion}
                  style={{ flex: 1 }}
                >
                  Confirmar Transformación
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default FacturasListado;
