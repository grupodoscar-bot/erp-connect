import React, { useState, useEffect, useMemo } from 'react';
import { useFacturasProformaForm } from './useFacturasProformaForm';
import DocumentoVentaListado from './DocumentoVentaListado';
import { ModalHistorialTransformaciones } from './ModalHistorialTransformaciones';
import { ArrowRight, Copy as IconDuplicate, FileText as IconDocument, FileCheck as IconPdf } from 'lucide-react';
import API_ENDPOINTS from '../../config/api';

const COLUMNAS_FACTURA_PROFORMA = [
  { field: 'numero', header: 'Número', tipo: 'texto' },
  { field: 'fecha', header: 'Fecha', tipo: 'fecha' },
  { accessor: 'cliente.nombreComercial', header: 'Cliente', tipo: 'texto' },
  { field: 'estado', header: 'Estado', tipo: 'estado' },
  { field: 'totalBaseSinImpuestos', header: 'Base', tipo: 'moneda' },
  { field: 'totalIva', header: 'IVA', tipo: 'moneda' },
  { field: 'totalRecargo', header: 'Rec. Eq.', tipo: 'moneda' },
  { field: 'total', header: 'Total', tipo: 'moneda' },
];

export const FacturasProformaListado = ({ onEditar, onVer, onNuevo, modoVisual = "claro", abrirModalHistorialDocumento: abrirModalHistorialProp }) => {
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
  } = useFacturasProformaForm({ paginado: false });

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
  const [modalTransformarAbierto, setModalTransformarAbierto] = useState(false);
  const [facturaParaTransformar, setFacturaParaTransformar] = useState(null);
  const [tipoTransformacionSeleccionado, setTipoTransformacionSeleccionado] = useState('');
  const [serieSeleccionada, setSerieSeleccionada] = useState('');
  const [fechaTransformacion, setFechaTransformacion] = useState(new Date().toISOString().split('T')[0]);
  const [estadoTransformacion, setEstadoTransformacion] = useState('Pendiente');
  const [seriesDisponibles, setSeriesDisponibles] = useState([]);

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
    if (window.confirm(`¿Está seguro de eliminar ${documentosSeleccionados.length} factura(s) proforma?`)) {
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

  const abrirModalTransformar = (factura) => {
    setFacturaParaTransformar(factura);
    setModalTransformarAbierto(true);
    setTipoTransformacionSeleccionado('');
    setSerieSeleccionada('');
    setFechaTransformacion(new Date().toISOString().split('T')[0]);
    setEstadoTransformacion('Pendiente');
  };

  const cerrarModalTransformar = () => {
    setModalTransformarAbierto(false);
    setFacturaParaTransformar(null);
    setTipoTransformacionSeleccionado('');
  };

  useEffect(() => {
    if (!tipoTransformacionSeleccionado) return;
    
    const cargarSeriesPorTipo = async () => {
      const tipoDocumentoMap = {
        'DUPLICAR': 'FACTURA_PROFORMA',
        'ALBARAN': 'ALBARAN_VENTA',
        'FACTURA': 'FACTURA_VENTA',
        'PEDIDO': 'PEDIDO_VENTA',
        'PRESUPUESTO': 'PRESUPUESTO',
        'FACTURA_RECTIFICATIVA': 'FACTURA_RECTIFICATIVA',
      };
      
      const tipoDocumento = tipoDocumentoMap[tipoTransformacionSeleccionado];
      if (!tipoDocumento) return;
      
      try {
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
        
        setSeriesDisponibles(data.content || data);
      } catch (err) {
        console.error('Error al cargar series:', err);
        setSeriesDisponibles([]);
      }
    };
    
    cargarSeriesPorTipo();
  }, [tipoTransformacionSeleccionado]);

  const ejecutarTransformacion = async () => {
    if (!facturaParaTransformar || !tipoTransformacionSeleccionado) return;

    try {
      switch (tipoTransformacionSeleccionado) {
        case 'DUPLICAR': {
          const payload = {
            facturaProformaId: facturaParaTransformar.id,
            serieId: serieSeleccionada ? parseInt(serieSeleccionada) : null,
            fecha: fechaTransformacion,
            estado: estadoTransformacion,
            descuentoAgrupacion: facturaParaTransformar.descuentoAgrupacion || 0
          };

          const res = await fetch(`${API_ENDPOINTS.facturasProforma}/duplicar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Error al duplicar');
          }

          const creado = await res.json();
          alert(`Factura Proforma ${creado.numero} duplicada correctamente`);
          cerrarModalTransformar();
          cargarDocumentos();
          break;
        }

        case 'ALBARAN': {
          const payload = {
            facturaProformaId: facturaParaTransformar.id,
            serieId: serieSeleccionada ? parseInt(serieSeleccionada) : null,
            fecha: fechaTransformacion,
            estado: estadoTransformacion,
            descuentoAgrupacion: facturaParaTransformar.descuentoAgrupacion || 0
          };

          const res = await fetch(`${API_ENDPOINTS.albaranes}/desde-factura-proforma`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Error al crear albarán');
          }

          const albaran = await res.json();
          alert(`Albarán ${albaran.numero} creado correctamente`);
          cerrarModalTransformar();
          break;
        }

        case 'FACTURA': {
          const payload = {
            facturaProformaId: facturaParaTransformar.id,
            serieId: serieSeleccionada ? parseInt(serieSeleccionada) : null,
            fecha: fechaTransformacion,
            estado: estadoTransformacion,
            descuentoAgrupacion: facturaParaTransformar.descuentoAgrupacion || 0
          };

          const res = await fetch(`${API_ENDPOINTS.facturas}/desde-factura-proforma`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Error al crear factura');
          }

          const factura = await res.json();
          alert(`Factura ${factura.numero} creada correctamente`);
          cerrarModalTransformar();
          break;
        }

        case 'PEDIDO': {
          const payload = {
            facturaProformaId: facturaParaTransformar.id,
            serieId: serieSeleccionada ? parseInt(serieSeleccionada) : null,
            fecha: fechaTransformacion,
            estado: estadoTransformacion,
            descuentoAgrupacion: facturaParaTransformar.descuentoAgrupacion || 0
          };

          const res = await fetch(`${API_ENDPOINTS.pedidos}/desde-factura-proforma`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Error al crear pedido');
          }

          const pedido = await res.json();
          alert(`Pedido ${pedido.numero} creado correctamente`);
          cerrarModalTransformar();
          break;
        }

        case 'PRESUPUESTO': {
          const payload = {
            facturaProformaId: facturaParaTransformar.id,
            serieId: serieSeleccionada ? parseInt(serieSeleccionada) : null,
            fecha: fechaTransformacion,
            estado: estadoTransformacion,
            descuentoAgrupacion: facturaParaTransformar.descuentoAgrupacion || 0
          };

          const res = await fetch(`${API_ENDPOINTS.presupuestos}/desde-factura-proforma`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Error al crear presupuesto');
          }

          const presupuesto = await res.json();
          alert(`Presupuesto ${presupuesto.numero} creado correctamente`);
          cerrarModalTransformar();
          break;
        }

        case 'FACTURA_RECTIFICATIVA': {
          const payload = {
            facturaProformaId: facturaParaTransformar.id,
            serieId: serieSeleccionada ? parseInt(serieSeleccionada) : null,
            fecha: fechaTransformacion,
            estado: estadoTransformacion,
            descuentoAgrupacion: facturaParaTransformar.descuentoAgrupacion || 0
          };

          const res = await fetch(`${API_ENDPOINTS.facturasRectificativas}/desde-factura-proforma`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Error al crear factura rectificativa');
          }

          const factura = await res.json();
          alert(`Factura Rectificativa ${factura.numero} creada correctamente`);
          cerrarModalTransformar();
          cargarDocumentos();
          break;
        }

        default:
          throw new Error('Tipo de transformación no válido');
      }
    } catch (err) {
      console.error(err);
      alert(err.message || 'Error al transformar documento');
    }
  };

  const totalesFiltrados = {
    base: documentosOrdenados.reduce((sum, doc) => sum + (doc.totalBaseSinImpuestos || 0), 0),
    iva: documentosOrdenados.reduce((sum, doc) => sum + (doc.totalIva || 0), 0),
    recargo: documentosOrdenados.reduce((sum, doc) => sum + (doc.totalRecargo || 0), 0),
    total: documentosOrdenados.reduce((sum, doc) => sum + (doc.total || 0), 0),
    count: documentosOrdenados.length
  };

  return (
    <DocumentoVentaListado
      tituloSingular="factura proforma"
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
      modalTransformarAbierto={modalTransformarAbierto}
      documentoParaTransformar={facturaParaTransformar}
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
      ejecutarTransformacion={ejecutarTransformacion}
    >
      {modalTransformarAbierto && facturaParaTransformar && (
        <ModalTransformarFacturaProforma
          modalTransformarAbierto={modalTransformarAbierto}
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
        />
      )}
      
      {/* Modal de Historial de Transformaciones */}
      <ModalHistorialTransformaciones
        modalAbierto={modalHistorialAbierto}
        cerrarModal={cerrarModalHistorial}
        documento={documentoHistorial ? { ...documentoHistorial, tipo: 'FACTURA_PROFORMA' } : null}
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

export function ModalTransformarFacturaProforma({
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
}) {
  if (!modalTransformarAbierto || !facturaParaTransformar) return null;

  const opcionesTransformacion = [
    { tipo: 'DUPLICAR', label: 'Duplicar Factura Proforma', icon: IconDuplicate, className: 'erp-btn-secondary' },
    { tipo: 'ALBARAN', label: 'Crear Albarán', icon: IconDocument, className: 'erp-btn-info' },
    { tipo: 'FACTURA', label: 'Crear Factura', icon: IconDocument, className: 'erp-btn-success' },
    { tipo: 'PEDIDO', label: 'Crear Pedido', icon: IconDocument, className: 'erp-btn-info' },
    { tipo: 'PRESUPUESTO', label: 'Crear Presupuesto', icon: IconDocument, className: 'erp-btn-secondary' },
    { tipo: 'FACTURA_RECTIFICATIVA', label: 'Crear Factura Rectificativa', icon: ArrowRight, className: 'erp-btn-warning' },
  ];

  return (
    <div className="erp-modal-overlay" onClick={cerrarModalTransformar}>
      <div className="erp-modal" onClick={(e) => e.stopPropagation()}>
        <div className="erp-modal-header">
          <h3>Transformar Factura Proforma {facturaParaTransformar.numero}</h3>
          <button className="erp-modal-close" onClick={cerrarModalTransformar}>×</button>
        </div>
        <div className="erp-modal-body">
          {!tipoTransformacionSeleccionado ? (
            <>
              <p style={{ marginBottom: '20px', color: '#6b7280' }}>
                Selecciona qué acción deseas realizar con esta factura proforma:
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
                      No hay series configuradas para este tipo de documento.
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
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button
                  className="erp-btn erp-btn-secondary"
                  onClick={() => setTipoTransformacionSeleccionado('')}
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

export default FacturasProformaListado;
