import React from 'react';
import {
  IconEye,
  IconEdit,
  IconDelete,
  IconPdf,
  IconCsv,
  IconEmail,
  IconRefresh,
  IconTransform,
  IconSearch,
} from '../iconos';

const FALLBACK_BADGE_LIGHT = {
  backgroundColor: "rgba(148, 163, 184, 0.2)",
  color: "#0f172a",
  border: "1px solid rgba(15, 23, 42, 0.15)",
};

const FALLBACK_BADGE_DARK = {
  backgroundColor: "rgba(148, 163, 184, 0.2)",
  color: "#f8fafc",
  border: "1px solid rgba(248, 250, 252, 0.15)",
};

const hexToRgba = (hex) => {
  if (typeof hex !== "string") return null;
  let value = hex.trim();
  if (!value.startsWith("#")) return null;
  value = value.slice(1);
  if (![3, 4, 6, 8].includes(value.length)) return null;
  if (value.length === 3 || value.length === 4) {
    value = value
      .split("")
      .map((c) => `${c}${c}`)
      .join("");
  }
  if (value.length === 6) value = `${value}ff`;
  const intVal = parseInt(value, 16);
  if (Number.isNaN(intVal)) return null;
  return {
    r: (intVal >> 24) & 255,
    g: (intVal >> 16) & 255,
    b: (intVal >> 8) & 255,
    a: (intVal & 255) / 255,
  };
};

const colorWithAlpha = (hex, alpha) => {
  const parsed = hexToRgba(hex);
  if (!parsed) return hex || "transparent";
  const clampedAlpha = Math.max(0, Math.min(1, alpha));
  return `rgba(${parsed.r}, ${parsed.g}, ${parsed.b}, ${clampedAlpha})`;
};

const buildBadgeStyle = (baseColor, modoVisual = "claro") => {
  if (!baseColor || baseColor === "transparent") {
    return modoVisual === "oscuro" ? FALLBACK_BADGE_DARK : FALLBACK_BADGE_LIGHT;
  }
  const background = colorWithAlpha(baseColor, modoVisual === "oscuro" ? 0.7 : 0.9);
  const borderColor =
    modoVisual === "oscuro" ? "rgba(248, 250, 252, 0.15)" : "rgba(15, 23, 42, 0.15)";
  return {
    backgroundColor: background,
    color: modoVisual === "oscuro" ? "#f8fafc" : "#1f2937",
    border: `1px solid ${borderColor}`,
  };
};

/**
 * Componente genérico de listado para documentos de venta
 * Usa exactamente la misma estructura que ListaAlbaranes
 */
export function DocumentoVentaListado({
  // Datos
  documentos = [],
  cargando = false,
  estadoOptions = [],
  modoVisual = "claro",
  tituloSingular = "documento",
  // Paginación
  paginaActual = 0,
  setPaginaActual = () => {},
  itemsPorPagina = 20,
  setItemsPorPagina = () => {},
  totalElementos = 0,
  totalPaginas = 1,
  ordenarPor = "numero",
  ordenDireccion = "desc",
  cambiarOrdenacion = () => {},
  // Filtros
  busqueda = "",
  setBusqueda = () => {},
  filtroFechaDesde = "",
  setFiltroFechaDesde = () => {},
  filtroFechaHasta = "",
  setFiltroFechaHasta = () => {},
  filtroEstado = "",
  setFiltroEstado = () => {},
  filtroSerieId = "",
  setFiltroSerieId = () => {},
  filtroNumero = "",
  setFiltroNumero = () => {},
  filtroImporteMin = "",
  setFiltroImporteMin = () => {},
  filtroImporteMax = "",
  setFiltroImporteMax = () => {},
  mostrarFiltros = false,
  setMostrarFiltros = () => {},
  limpiarFiltros = () => {},
  contarFiltrosActivos,
  // Selección
  documentosSeleccionados = [],
  seleccionarTodos = false,
  toggleSeleccionDocumento = () => {},
  toggleSeleccionarTodos = () => {},
  // Acciones masivas
  abrirNuevoDocumento = () => {},
  eliminarSeleccionados = () => {},
  exportarExcelCsv = () => {},
  abrirModalPdfMultiple = () => {},
  // Acciones individuales
  abrirVerDocumento = () => {},
  abrirEditarDocumento = () => {},
  abrirModalTransformar = () => {},
  abrirModalEmail = () => {},
  abrirModalHistorialDocumento,
  cargarDocumentos = () => {},
  seriesDisponibles = [],
  totalesFiltrados = { base: 0, iva: 0, total: 0, count: 0 },
  children,
}) {
  const filtrosActivos = contarFiltrosActivos ? contarFiltrosActivos() : 0;

  const getColorEstado = (estado) => {
    if (!estado || !Array.isArray(estadoOptions)) return "transparent";
    const estadoObj = estadoOptions.find(e => e.nombre === estado);
    if (!estadoObj) return "transparent";
    return modoVisual === "oscuro" ? estadoObj.colorOscuro : estadoObj.colorClaro;
  };

  const getEstadoBadgeStyle = (estado) => buildBadgeStyle(getColorEstado(estado), modoVisual);

  return (
    <div className="erp-list-view">
      {/* Toolbar con botones de acción */}
      <div className="erp-list-toolbar">
        <button className="erp-btn erp-btn-primary" onClick={abrirNuevoDocumento}>
          + Nuevo {tituloSingular}
        </button>
        <button 
          className="erp-btn erp-btn-info" 
          onClick={abrirModalPdfMultiple}
          disabled={documentosSeleccionados.length === 0}
        >
          <IconPdf className="erp-action-icon" /> PDF ({documentosSeleccionados.length})
        </button>
        <button 
          className="erp-btn erp-btn-secondary" 
          onClick={exportarExcelCsv}
          disabled={documentosSeleccionados.length === 0}
        >
          <IconCsv className="erp-action-icon" /> Excel ({documentosSeleccionados.length})
        </button>
        <button 
          className="erp-btn erp-btn-danger" 
          onClick={eliminarSeleccionados}
          disabled={documentosSeleccionados.length === 0}
        >
          <IconDelete className="erp-action-icon" /> Eliminar ({documentosSeleccionados.length})
        </button>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="erp-filters-bar">
        <div className="erp-search-row">
          <input
            type="text"
            className="erp-search-input"
            placeholder="Buscar por número, cliente o producto..."
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPaginaActual(0);
            }}
          />
          <button
            className={`erp-btn ${filtrosActivos > 0 ? 'erp-btn-primary' : 'erp-btn-secondary'}`}
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
          >
            <IconSearch className="erp-action-icon" /> Filtros {filtrosActivos > 0 && `(${filtrosActivos})`}
          </button>
          {filtrosActivos > 0 && (
            <button className="erp-btn erp-btn-danger" onClick={limpiarFiltros}>
              Limpiar filtros
            </button>
          )}
          <button className="erp-btn erp-btn-secondary" onClick={cargarDocumentos}>
            <IconRefresh className="erp-action-icon" /> Actualizar
          </button>
        </div>

        {/* Panel de filtros colapsable */}
        {mostrarFiltros && (
          <div className="erp-filters-panel">
            <div className="erp-filters-grid">
              <label className="erp-field">
                <span className="erp-field-label">Fecha desde</span>
                <input
                  type="date"
                  className="erp-input-mono"
                  value={filtroFechaDesde}
                  onChange={(e) => {
                    setFiltroFechaDesde(e.target.value);
                    setPaginaActual(0);
                  }}
                />
              </label>
              <label className="erp-field">
                <span className="erp-field-label">Fecha hasta</span>
                <input
                  type="date"
                  className="erp-input-mono"
                  value={filtroFechaHasta}
                  onChange={(e) => {
                    setFiltroFechaHasta(e.target.value);
                    setPaginaActual(0);
                  }}
                />
              </label>
              <label className="erp-field">
                <span className="erp-field-label">Estado</span>
                <select
                  value={filtroEstado}
                  onChange={(e) => {
                    setFiltroEstado(e.target.value);
                    setPaginaActual(0);
                  }}
                >
                  <option value="">Todos los estados</option>
                  {estadoOptions.map(estado => (
                    <option key={estado.nombre} value={estado.nombre}>{estado.nombre}</option>
                  ))}
                </select>
              </label>
              <label className="erp-field">
                <span className="erp-field-label">Serie</span>
                <select
                  value={filtroSerieId}
                  onChange={(e) => {
                    setFiltroSerieId(e.target.value);
                    setPaginaActual(0);
                  }}
                >
                  <option value="">Todas las series</option>
                  {seriesDisponibles?.map((serie) => (
                    <option key={serie.id} value={serie.id}>{serie.prefijo} — {serie.descripcion || "Sin descripción"}</option>
                  ))}
                </select>
              </label>
              <label className="erp-field">
                <span className="erp-field-label">Número contiene</span>
                <input
                  type="text"
                  className="erp-input-mono"
                  placeholder="Ej: 100"
                  value={filtroNumero}
                  onChange={(e) => {
                    setFiltroNumero(e.target.value);
                    setPaginaActual(0);
                  }}
                />
              </label>
              <label className="erp-field">
                <span className="erp-field-label">Importe mín. (€)</span>
                <input
                  type="number"
                  step="0.01"
                  className="erp-input-mono"
                  placeholder="0.00"
                  value={filtroImporteMin}
                  onChange={(e) => {
                    setFiltroImporteMin(e.target.value);
                    setPaginaActual(0);
                  }}
                />
              </label>
              <label className="erp-field">
                <span className="erp-field-label">Importe máx. (€)</span>
                <input
                  type="number"
                  step="0.01"
                  className="erp-input-mono"
                  placeholder="9999.99"
                  value={filtroImporteMax}
                  onChange={(e) => {
                    setFiltroImporteMax(e.target.value);
                    setPaginaActual(0);
                  }}
                />
              </label>
            </div>
          </div>
        )}

        {/* Info de resultados y paginación */}
        <div className="erp-results-info">
          <span>
            Mostrando {documentos.length} {tituloSingular}s (Total: {totalElementos})
          </span>
          <div className="erp-page-size">
            <span>Mostrar:</span>
            <select
              value={itemsPorPagina}
              onChange={(e) => {
                setItemsPorPagina(parseInt(e.target.value));
                setPaginaActual(0);
              }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>por página</span>
          </div>
        </div>
      </div>

      {/* Tabla de documentos */}
      {cargando ? (
        <div className="erp-empty-state">
          <div className="erp-empty-icon">⏳</div>
          <h3>Cargando {tituloSingular}s...</h3>
        </div>
      ) : (
        <>
          <table className="erp-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>
                  <input 
                    type="checkbox" 
                    checked={seleccionarTodos}
                    onChange={toggleSeleccionarTodos}
                    title="Seleccionar todos"
                  />
                </th>
                <th 
                  onClick={() => cambiarOrdenacion('numero')}
                  style={{ cursor: 'pointer' }}
                >
                  Número {ordenarPor === 'numero' && (ordenDireccion === 'asc' ? '▲' : '▼')}
                </th>
                <th 
                  onClick={() => cambiarOrdenacion('fecha')}
                  style={{ cursor: 'pointer' }}
                >
                  Fecha {ordenarPor === 'fecha' && (ordenDireccion === 'asc' ? '▲' : '▼')}
                </th>
                <th 
                  onClick={() => cambiarOrdenacion('cliente')}
                  style={{ cursor: 'pointer' }}
                >
                  Cliente {ordenarPor === 'cliente' && (ordenDireccion === 'asc' ? '▲' : '▼')}
                </th>
                <th>Origen</th>
                <th className="erp-th-right">Base</th>
                <th className="erp-th-right">IVA</th>
                <th className="erp-th-right">Rec. Eq.</th>
                <th 
                  onClick={() => cambiarOrdenacion('total')}
                  style={{ cursor: 'pointer' }}
                  className="erp-th-right"
                >
                  Total {ordenarPor === 'total' && (ordenDireccion === 'asc' ? '▲' : '▼')}
                </th>
                <th 
                  onClick={() => cambiarOrdenacion('estado')}
                  style={{ cursor: 'pointer' }}
                >
                  Estado {ordenarPor === 'estado' && (ordenDireccion === 'asc' ? '▲' : '▼')}
                </th>
                <th className="erp-th-actions">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {documentos.map((doc) => {
                // Usar los campos calculados del backend
                const baseImponible = doc.totalBaseSinImpuestos || 0;
                const totalIva = doc.totalIva || 0;
                const totalRecargo = doc.totalRecargo || 0;
                const total = doc.total || 0;

                return (
                  <tr 
                    key={doc.id} 
                    onDoubleClick={() => abrirVerDocumento(doc)}
                    style={{ backgroundColor: getColorEstado(doc.estado) }}
                  >
                    <td style={{ textAlign: 'center' }}>
                      <input 
                        type="checkbox" 
                        checked={documentosSeleccionados.includes(doc.id)}
                        onChange={() => toggleSeleccionDocumento(doc.id)}
                      />
                    </td>
                    <td className="erp-td-mono erp-td-main">{doc.numero}</td>
                    <td className="erp-td-mono">{doc.fecha}</td>
                    <td>{doc.cliente?.nombreComercial || "Sin cliente"}</td>
                    <td>
                      <span 
                        className="erp-badge erp-badge-info"
                        style={{ cursor: 'pointer' }}
                        onClick={() => abrirModalHistorialDocumento && abrirModalHistorialDocumento(doc)}
                        title="Ver historial"
                      >
                        {doc.origen || "Manual"}
                      </span>
                    </td>
                    <td className="erp-td-mono erp-td-right">{baseImponible.toFixed(2)} €</td>
                    <td className="erp-td-mono erp-td-right">{totalIva.toFixed(2)} €</td>
                    <td className="erp-td-mono erp-td-right">{totalRecargo.toFixed(2)} €</td>
                    <td className="erp-td-mono erp-td-right">{total.toFixed(2)} €</td>
                    <td>
                      <span className="erp-badge" style={getEstadoBadgeStyle(doc.estado)}>
                        {doc.estado}
                      </span>
                    </td>
                    <td className="erp-td-actions">
                      <button className="erp-action-btn" onClick={() => abrirVerDocumento(doc)} title="Ver">
                        <IconEye className="erp-action-icon" />
                      </button>
                      <button className="erp-action-btn" onClick={() => abrirEditarDocumento(doc)} title="Editar">
                        <IconEdit className="erp-action-icon" />
                      </button>
                      <button className="erp-action-btn" onClick={() => abrirModalTransformar(doc)} title="Transformar">
                        <IconTransform className="erp-action-icon" />
                      </button>
                      <button className="erp-action-btn" onClick={() => abrirModalEmail(doc)} title="Enviar por email">
                        <IconEmail className="erp-action-icon" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {documentos.length === 0 && (
                <tr><td colSpan="10" className="erp-td-empty">No hay {tituloSingular}s</td></tr>
              )}
            </tbody>
          </table>

          {/* Resumen de totales */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            padding: '12px 16px', 
            backgroundColor: modoVisual === 'oscuro' ? 'rgba(15, 23, 42, 0.65)' : 'rgba(14, 165, 233, 0.08)', 
            color: modoVisual === 'oscuro' ? '#e2e8f0' : '#0f172a',
            border: modoVisual === 'oscuro' ? '1px solid rgba(148, 163, 184, 0.3)' : '1px solid rgba(14, 116, 144, 0.2)',
            fontWeight: '600',
            fontSize: '14px',
            gap: '24px',
            borderRadius: '4px',
            marginTop: '8px'
          }}>
            <div>
              Base: <span style={{ fontFamily: 'monospace', fontSize: '15px' }}>{totalesFiltrados.base.toFixed(2)} €</span>
            </div>
            <div>
              IVA: <span style={{ fontFamily: 'monospace', fontSize: '15px' }}>{totalesFiltrados.iva.toFixed(2)} €</span>
            </div>
            <div>
              Rec. Eq.: <span style={{ fontFamily: 'monospace', fontSize: '15px' }}>{(totalesFiltrados.recargo || 0).toFixed(2)} €</span>
            </div>
            <div>
              Total: <span style={{ fontFamily: 'monospace', fontSize: '15px' }}>{totalesFiltrados.total.toFixed(2)} €</span>
            </div>
          </div>

          {/* Paginación */}
          {totalPaginas > 1 && (
            <div className="erp-pagination">
              <button 
                className="erp-btn erp-btn-secondary"
                disabled={paginaActual === 0}
                onClick={() => setPaginaActual(0)}
              >
                ⏮ Primera
              </button>
              <button 
                className="erp-btn erp-btn-secondary"
                disabled={paginaActual === 0}
                onClick={() => setPaginaActual(paginaActual - 1)}
              >
                ◀ Anterior
              </button>
              <span className="erp-pagination-info">
                Página {paginaActual + 1} de {totalPaginas}
              </span>
              <button 
                className="erp-btn erp-btn-secondary"
                disabled={paginaActual >= totalPaginas - 1}
                onClick={() => setPaginaActual(paginaActual + 1)}
              >
                Siguiente ▶
              </button>
              <button 
                className="erp-btn erp-btn-secondary"
                disabled={paginaActual >= totalPaginas - 1}
                onClick={() => setPaginaActual(totalPaginas - 1)}
              >
                Última ⏭
              </button>
            </div>
          )}
        </>
      )}
      {children}
    </div>
  );
}

export default DocumentoVentaListado;
