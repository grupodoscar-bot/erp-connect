import React, { useState, useEffect } from 'react';
import { useFacturasForm } from './useFacturasForm';
import DocumentoVentaListado from './DocumentoVentaListado';
import { 
  IconDocument, 
  IconTransform, 
  IconDuplicate,
  IconPdf 
} from '../iconos';

const ESTADOS_FACTURA = [
  { nombre: "Pendiente", colorClaro: "#FDE68A55", colorOscuro: "#92400E55" },
  { nombre: "Emitido", colorClaro: "#BBF7D055", colorOscuro: "#14532D55" },
  { nombre: "Cobrada", colorClaro: "#A7F3D055", colorOscuro: "#065F4655" },
  { nombre: "Vencida", colorClaro: "#FECACA55", colorOscuro: "#7F1D1D55" },
  { nombre: "Cancelada", colorClaro: "#E5E7EB55", colorOscuro: "#37415155" },
];

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

export const FacturasListado = ({ onEditar, onNuevo, modoVisual = "claro", abrirModalHistorialDocumento: abrirModalHistorialProp }) => {
  const {
    documentos,
    loading,
    paginacion,
    cargarDocumentos,
    eliminarDocumento,
    duplicarDocumento,
    descargarPdf,
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
  const [mostrarModalTransformar, setMostrarModalTransformar] = useState(false);
  const [facturaParaTransformar, setFacturaParaTransformar] = useState(null);
  const [tipoTransformacionSeleccionado, setTipoTransformacionSeleccionado] = useState(null);
  const [serieSeleccionada, setSerieSeleccionada] = useState('');
  const [fechaTransformacion, setFechaTransformacion] = useState(new Date().toISOString().split('T')[0]);
  const [estadoTransformacion, setEstadoTransformacion] = useState('Pendiente');
  const [seriesDisponibles, setSeriesDisponibles] = useState([]);
  const [cargandoSeries, setCargandoSeries] = useState(false);

  useEffect(() => {
    cargarDocumentos();
  }, []);

  const seleccionarTodos = documentosSeleccionados.length === documentos.length && documentos.length > 0;

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

  const abrirModalTransformar = (factura) => {
    setFacturaParaTransformar(factura);
    setMostrarModalTransformar(true);
    setTipoTransformacionSeleccionado(null);
    setSerieSeleccionada('');
    setFechaTransformacion(new Date().toISOString().split('T')[0]);
    setEstadoTransformacion('Pendiente');
  };

  const cerrarModalTransformar = () => {
    setMostrarModalTransformar(false);
    setFacturaParaTransformar(null);
    setTipoTransformacionSeleccionado(null);
    setSerieSeleccionada('');
  };

  // Cargar series según el tipo de transformación seleccionado
  useEffect(() => {
    if (!tipoTransformacionSeleccionado) return;
    
    const cargarSeriesPorTipo = async () => {
      const tipoDocumentoMap = {
        'DUPLICAR': 'FACTURA_VENTA',
        'ALBARAN': 'ALBARAN',
        'PEDIDO': 'PEDIDO_VENTA',
        'PRESUPUESTO': 'PRESUPUESTO',
        'FACTURA_PROFORMA': 'FACTURA_PROFORMA',
        'FACTURA_RECTIFICATIVA': 'FACTURA_RECTIFICATIVA',
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
        const url = `http://145.223.103.219:8080/series?${params.toString()}`;
        
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
      switch (tipoTransformacionSeleccionado) {
        case 'DUPLICAR': {
          const res = await fetch(`http://145.223.103.219:8080/facturas/${facturaParaTransformar.id}/duplicar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          });

          if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Error al duplicar');
          }

          const creado = await res.json();
          alert(`Factura ${creado.numero} duplicada correctamente`);
          cerrarModalTransformar();
          cargarDocumentos();
          break;
        }

        case 'ALBARAN': {
          const payload = {
            albaranId: facturaParaTransformar.id,
            serieId: serieSeleccionada ? parseInt(serieSeleccionada) : null,
            fecha: fechaTransformacion,
            estado: estadoTransformacion,
            descuentoAgrupacion: facturaParaTransformar.descuentoAgrupacion || 0
          };

          const res = await fetch('http://145.223.103.219:8080/albaranes/desde-factura', {
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

        case 'PEDIDO': {
          const payload = {
            albaranId: facturaParaTransformar.id,
            serieId: serieSeleccionada ? parseInt(serieSeleccionada) : null,
            fecha: fechaTransformacion,
            estado: estadoTransformacion,
            descuentoAgrupacion: facturaParaTransformar.descuentoAgrupacion || 0
          };

          const res = await fetch('http://145.223.103.219:8080/pedidos/desde-factura', {
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
            albaranId: facturaParaTransformar.id,
            serieId: serieSeleccionada ? parseInt(serieSeleccionada) : null,
            fecha: fechaTransformacion,
            estado: estadoTransformacion,
            descuentoAgrupacion: facturaParaTransformar.descuentoAgrupacion || 0
          };

          const res = await fetch('http://145.223.103.219:8080/presupuestos/desde-factura', {
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

        case 'FACTURA_PROFORMA': {
          const payload = {
            facturaId: facturaParaTransformar.id,
            serieId: serieSeleccionada ? parseInt(serieSeleccionada) : null,
            fecha: fechaTransformacion,
            estado: estadoTransformacion,
            descuentoAgrupacion: facturaParaTransformar.descuentoAgrupacion || 0
          };

          const res = await fetch('http://145.223.103.219:8080/facturas-proforma/desde-factura', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Error al crear factura proforma');
          }

          const factura = await res.json();
          alert(`Factura Proforma ${factura.numero} creada correctamente`);
          cerrarModalTransformar();
          break;
        }

        case 'FACTURA_RECTIFICATIVA': {
          const payload = {
            facturaId: facturaParaTransformar.id,
            serieId: serieSeleccionada ? parseInt(serieSeleccionada) : null,
            fecha: fechaTransformacion,
            estado: estadoTransformacion,
            descuentoAgrupacion: facturaParaTransformar.descuentoAgrupacion || 0
          };

          const res = await fetch('http://145.223.103.219:8080/facturas-rectificativas/desde-factura', {
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

  return (
    <DocumentoVentaListado
      tituloSingular="factura"
      documentos={documentos}
      cargando={loading}
      estadoOptions={ESTADOS_FACTURA}
      modoVisual={modoVisual}
      paginaActual={paginaActual}
      setPaginaActual={setPaginaActual}
      itemsPorPagina={itemsPorPagina}
      setItemsPorPagina={setItemsPorPagina}
      totalElementos={paginacion?.totalElements || documentos.length}
      totalPaginas={paginacion?.totalPages || 1}
      ordenarPor="numero"
      ordenDireccion="desc"
      cambiarOrdenacion={() => {}}
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
      abrirVerDocumento={(doc) => onEditar(doc)}
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
          estadoOptions={ESTADOS_FACTURA}
          ejecutarTransformacion={ejecutarTransformacion}
        />
      )}
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
}) {
  if (!modalTransformarAbierto || !facturaParaTransformar) return null;

  const opcionesTransformacion = [
    { tipo: 'DUPLICAR', label: 'Duplicar Factura', icon: IconDuplicate, className: 'erp-btn-secondary' },
    { tipo: 'ALBARAN', label: 'Crear Albarán', icon: IconDocument, className: 'erp-btn-info' },
    { tipo: 'PEDIDO', label: 'Crear Pedido', icon: IconDocument, className: 'erp-btn-info' },
    { tipo: 'PRESUPUESTO', label: 'Crear Presupuesto', icon: IconDocument, className: 'erp-btn-secondary' },
    { tipo: 'FACTURA_PROFORMA', label: 'Crear Factura Proforma', icon: IconPdf, className: 'erp-btn-info' },
    { tipo: 'FACTURA_RECTIFICATIVA', label: 'Crear Factura Rectificativa', icon: IconTransform, className: 'erp-btn-warning' },
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
