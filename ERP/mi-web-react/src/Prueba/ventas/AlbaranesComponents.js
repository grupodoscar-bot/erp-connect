import React, { useState, useEffect, useCallback } from "react";
import ModalCambioEstadoStock from "./ModalCambioEstadoStock";
import { HistorialTransformaciones } from "./HistorialTransformaciones";
import { ModalHistorialTransformaciones } from "./ModalHistorialTransformaciones";
import API_ENDPOINTS from '../../config/api';
import {
  IconEye,
  IconEdit,
  IconDelete,
  IconDocument,
  IconPdf,
  IconCsv,
  IconPlane,
  IconEmail,
  IconRefresh,
  IconTransform,
  IconSearch,
  IconDuplicate,
  IconProveta,
  IconMoney,
  IconFolder,
  IconUpload,
  IconDownload,
  IconFile
} from "../iconos";
import { ReferenciaSelector } from "./ReferenciaSelector";
import { ClienteSelector } from "./ClienteSelector";
import { DireccionSelector } from "./DireccionSelector";
import { TarifaSelector } from "./TarifaSelector";
import { CampoEscanerCodigo } from "./CampoEscanerCodigo";

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

// Función para formatear fecha con hora a solo fecha (YYYY-MM-DD)
const formatearSoloFecha = (fechaConHora) => {
  if (!fechaConHora) return '';
  // Si ya es solo fecha (YYYY-MM-DD), devolverla tal cual
  if (fechaConHora.length === 10 && fechaConHora.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return fechaConHora;
  }
  // Si tiene hora (YYYY-MM-DDTHH:mm:ss), extraer solo la fecha
  return fechaConHora.split('T')[0];
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

// ========== LISTA DE ALBARANES ==========
export function ListaAlbaranes({
  albaranes,
  clientes,
  cargando,
  estadoOptions,
  modoVisual,
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
  seleccionarTodos,
  toggleSeleccionAlbaran,
  toggleSeleccionarTodos,
  // Acciones masivas
  abrirNuevoAlbaran,
  eliminarSeleccionados,
  exportarExcelCsv,
  abrirModalPdfMultiple,
  // Acciones individuales
  abrirVerAlbaran,
  abrirEditarAlbaran,
  abrirModalTransformar,
  abrirModalEmail,
  abrirModalHistorialDocumento,
  cargarAlbaranes,
  seriesDisponibles = [],
  totalesFiltrados = { base: 0, iva: 0, total: 0, count: 0 },
}) {
  const filtrosActivos = contarFiltrosActivos();

  const parseColorToRGB = (color) => {
    if (!color) return null;
    const value = color.trim();
    if (value.startsWith("#")) {
      let hex = value.slice(1);
      if (hex.length === 3) {
        hex = hex.split("" ).map((ch) => ch + ch).join("");
      }
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return { r, g, b };
    }
    const rgbMatch = value.match(/rgba?\(([^)]+)\)/);
    if (rgbMatch) {
      const [r, g, b] = rgbMatch[1].split(",").map((v) => parseFloat(v.trim()));
      return { r, g, b };
    }
    return null;
  };

  const getTextoContraste = (color) => {
    const rgb = parseColorToRGB(color);
    if (!rgb) return modoVisual === "oscuro" ? "#0f172a" : "#1f2937";
    const luminancia = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    return luminancia > 0.6 ? "#0f172a" : "#f8fafc";
  };

  const getColorEstado = (estado) => {
    if (!estado || !Array.isArray(estadoOptions)) return "transparent";
    const estadoObj = estadoOptions.find(e => e.nombre === estado);
    if (!estadoObj) return "transparent";
    return modoVisual === "oscuro" ? estadoObj.colorOscuro : estadoObj.colorClaro;
  };

  const getEstadoBadgeStyle = (estado) => buildBadgeStyle(getColorEstado(estado), modoVisual);
  const getLineaEstadoStyle = (estado) => {
    const baseColor = getColorEstado(estado);
    if (!baseColor || baseColor === "transparent") return {};
    return {
      backgroundColor: baseColor,
      color: getTextoContraste(baseColor),
      borderLeft: `4px solid ${baseColor}`,
      transition: "background-color 120ms ease"
    };
  };

  return (
    <div className="erp-list-view">
      {/* Toolbar con botones de acción */}
      <div className="erp-list-toolbar">
        <button className="erp-btn erp-btn-primary" onClick={abrirNuevoAlbaran}>
          + Nuevo Albarán
        </button>
        <button 
          className="erp-btn erp-btn-info" 
          onClick={abrirModalPdfMultiple}
          disabled={albaranesSeleccionados.length === 0}
        >
          <IconPdf className="erp-action-icon" /> PDF ({albaranesSeleccionados.length})
        </button>
        <button 
          className="erp-btn erp-btn-secondary" 
          onClick={exportarExcelCsv}
          disabled={albaranesSeleccionados.length === 0}
        >
          <IconCsv className="erp-action-icon" /> Excel ({albaranesSeleccionados.length})
        </button>
        <button 
          className="erp-btn erp-btn-danger" 
          onClick={eliminarSeleccionados}
          disabled={albaranesSeleccionados.length === 0}
        >
          <IconDelete className="erp-action-icon" /> Eliminar ({albaranesSeleccionados.length})
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
          <button className="erp-btn erp-btn-secondary" onClick={cargarAlbaranes}>
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
            Mostrando {albaranes.length} albaranes (Total: {totalElementos})
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

      {/* Tabla de albaranes */}
      {cargando ? (
        <div className="erp-empty-state">
          <div className="erp-empty-icon">⏳</div>
          <h3>Cargando albaranes...</h3>
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
              {albaranes.map((a) => (
                <tr 
                  key={a.id} 
                  onDoubleClick={() => abrirVerAlbaran(a)}
                  style={getLineaEstadoStyle(a.estado)}
                >
                  <td style={{ textAlign: 'center' }}>
                    <input 
                      type="checkbox" 
                      checked={albaranesSeleccionados.includes(a.id)}
                      onChange={() => toggleSeleccionAlbaran(a.id)}
                    />
                  </td>
                  <td className="erp-td-mono erp-td-main">{a.numero}</td>
                  <td className="erp-td-mono">{formatearSoloFecha(a.fecha)}</td>
                  <td>{a.cliente?.nombreComercial || "Sin cliente"}</td>
                  <td>
                    {a.origen ? (
                      <span 
                        className="erp-badge erp-badge-info" 
                        style={{ cursor: 'pointer' }}
                        onClick={() => abrirModalHistorialDocumento && abrirModalHistorialDocumento(a)}
                        title="Ver historial completo"
                      >
                        {a.origen}
                      </span>
                    ) : (
                      <span 
                        className="erp-badge erp-badge-secondary"
                        style={{ cursor: 'pointer' }}
                        onClick={() => abrirModalHistorialDocumento && abrirModalHistorialDocumento(a)}
                        title="Ver historial"
                      >
                        Manual
                      </span>
                    )}
                  </td>
                  <td className="erp-td-mono erp-td-right">{(a.totalBaseSinImpuestos || 0).toFixed(2)} €</td>
                  <td className="erp-td-mono erp-td-right">{(a.totalIva || 0).toFixed(2)} €</td>
                  <td className="erp-td-mono erp-td-right">{(a.totalRecargo || 0).toFixed(2)} €</td>
                  <td className="erp-td-mono erp-td-right">{a.total?.toFixed(2)} €</td>
                  <td>
                    <span className="erp-badge" style={getEstadoBadgeStyle(a.estado)}>
                      {a.estado}
                    </span>
                  </td>
                  <td className="erp-td-actions">
                    <button className="erp-action-btn" onClick={() => abrirVerAlbaran(a)} title="Ver">
                      <IconEye className="erp-action-icon" />
                    </button>
                    <button className="erp-action-btn" onClick={() => abrirEditarAlbaran(a)} title="Editar">
                      <IconEdit className="erp-action-icon" />
                    </button>
                    <button className="erp-action-btn" onClick={() => abrirModalTransformar(a)} title="Transformar">
                      <IconTransform className="erp-action-icon" />
                    </button>
                    <button className="erp-action-btn" onClick={() => abrirModalEmail(a)} title="Enviar por email">
                      <IconEmail className="erp-action-icon" />
                    </button>
                  </td>
                </tr>
              ))}
              {albaranes.length === 0 && (
                <tr><td colSpan="11" className="erp-td-empty">No hay albaranes</td></tr>
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
    </div>
  );
}

export function FormularioAlbaran({ 
  formAlbaran, 
  clientes, 
  productos, 
  tiposIva, 
  seriesDisponibles = [],
  esCompra = false,
  cargandoSeries = false,
  guardarPreferenciaSerie,
  guardandoPreferenciaSerie = false,
  generandoNumero,
  generarNumeroAutomatico,
  estadoOptions,
  updateFormAlbaranField,
  setDireccionSnapshot,
  updateDireccionSnapshotField,
  agregarLinea,
  eliminarLinea,
  actualizarLinea,
  calcularTotales,
  guardarAlbaran,
  cerrarPestana,
  pestanaActiva,
  subirAdjunto,
  eliminarAdjunto,
  descargarAdjunto,
  almacenes = [],
  mostrarSelectorAlmacen = false,
  permitirVentaMultialmacen = false,
  mostrarConfirmacionStock = false,
  confirmarYGuardarAlbaran,
  cancelarConfirmacionStock,
  mostrarErrorStock = false,
  mensajeErrorStock = "",
  cerrarModalErrorStock,
  mostrarModalCambioEstado = false,
  datosModalCambioEstado = {},
  confirmarCambioEstado,
  cancelarCambioEstado,
  tarifasAlbaran,
  tipoDocumento = "albarán", // Nuevo prop para personalizar títulos
}) {
  // CSS para eliminar flechitas de inputs numéricos
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      /* Eliminar flechitas en Chrome, Safari, Edge, Opera */
      input[type=number]::-webkit-inner-spin-button,
      input[type=number]::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
      /* Eliminar flechitas en Firefox */
      input[type=number] {
        -moz-appearance: textfield;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const totalesBase = typeof calcularTotales === 'function'
    ? calcularTotales()
    : (calcularTotales || {});

  const totales = {
    subtotal: Number.parseFloat(totalesBase?.subtotal) || 0,
    descuentoTotal: Number.parseFloat(totalesBase?.descuentoTotal) || 0,
    descuentoAgrupacionPct: Number.parseFloat(totalesBase?.descuentoAgrupacionPct) || 0,
    descuentoAgrupacionImporte: Number.parseFloat(totalesBase?.descuentoAgrupacionImporte) || 0,
    totalIva: Number.parseFloat(totalesBase?.totalIva) || 0,
    totalRecargo: Number.parseFloat(totalesBase?.totalRecargo) || 0,
    baseTrasAgrupacion: Number.parseFloat(totalesBase?.baseTrasAgrupacion || totalesBase?.totalBaseSinImpuestos) || 0,
    totalBaseSinImpuestos: Number.parseFloat(totalesBase?.totalBaseSinImpuestos || totalesBase?.baseTrasAgrupacion) || 0,
    total: Number.parseFloat(totalesBase?.total) || 0,
    desgloseIva: Array.isArray(totalesBase?.desgloseIva) ? totalesBase.desgloseIva : [],
  };
  const clienteSeleccionado = formAlbaran.clienteId
    ? clientes.find(c => c.id === parseInt(formAlbaran.clienteId))
    : null;
  const agrupacionCliente = clienteSeleccionado?.agrupacion;
  
  // Obtener direcciones del cliente seleccionado desde la tabla direcciones
  const [direccionesCliente, setDireccionesCliente] = useState([]);
  
  // Estado para almacenar el stock disponible por línea
  const [stockPorLinea, setStockPorLinea] = useState({});
  
  const snapshotFacturacion = formAlbaran.direccionFacturacionSnapshot || {};
  const snapshotEnvio = formAlbaran.direccionEnvioSnapshot || {};

  const mapearDireccion = useCallback((dir) => ({
    pais: dir?.pais || "España",
    codigoPostal: dir?.codigoPostal || "",
    provincia: dir?.provincia || "",
    poblacion: dir?.poblacion || "",
    direccion: dir?.direccion || "",
  }), []);

  const snapshotVacio = useCallback((snapshot) => {
    if (!snapshot) return true;
    return ["direccion", "codigoPostal", "provincia", "poblacion"].every(
      (campo) => !snapshot[campo] || snapshot[campo].trim() === ""
    );
  }, []);

  const obtenerDireccionClientePorId = useCallback(
    (id) => {
      if (!id) return null;
      const idNumerico = parseInt(id);
      return direccionesCliente.find((dir) => dir.id === idNumerico) || null;
    },
    [direccionesCliente]
  );

  // Actualizar direcciones cuando cambia el cliente/proveedor
  useEffect(() => {
    if (clienteSeleccionado) {
      // Llamar al backend para obtener las direcciones del cliente/proveedor
      const obtenerDirecciones = async () => {
        try {
          // Hacer llamada al backend (Spring Boot)
          const endpoint = esCompra ? API_ENDPOINTS.proveedores : API_ENDPOINTS.clientes;
          const response = await fetch(`${endpoint}/${clienteSeleccionado.id}/direcciones`);
          
          if (response.ok) {
            const direcciones = await response.json();
            
            // Convertir al formato que espera el componente
            const direccionesFormateadas = direcciones.map(dir => ({
              id: dir.id,
              direccion: dir.direccion,
              codigoPostal: dir.codigoPostal,
              poblacion: dir.poblacion,
              provincia: dir.provincia,
              pais: dir.pais || 'España'
            }));
            
            setDireccionesCliente(direccionesFormateadas);
          } else {
            console.error('Error al obtener direcciones:', response.status);
            setDireccionesCliente([]);
          }
        } catch (error) {
          console.error('Error en la llamada al backend:', error);
          setDireccionesCliente([]);
        }
      };
      
      obtenerDirecciones();
    } else {
      setDireccionesCliente([]);
    }
  }, [clienteSeleccionado]);

  // Prefill snapshots for nuevos albaranes usando direcciones del cliente
  useEffect(() => {
    if (!clienteSeleccionado || !direccionesCliente.length) return;
    if (formAlbaran.id) return;

    if (snapshotVacio(formAlbaran.direccionFacturacionSnapshot)) {
      setDireccionSnapshot("facturacion", mapearDireccion(direccionesCliente[0]));
    }

    const direccionSeleccionada = obtenerDireccionClientePorId(formAlbaran.direccionId);
    const candidataEnvio =
      direccionSeleccionada || direccionesCliente[1] || direccionesCliente[0];
    if (candidataEnvio && snapshotVacio(formAlbaran.direccionEnvioSnapshot)) {
      setDireccionSnapshot("envio", mapearDireccion(candidataEnvio));
    }
  }, [
    clienteSeleccionado,
    direccionesCliente,
    formAlbaran.id,
    formAlbaran.direccionId,
    formAlbaran.direccionFacturacionSnapshot,
    formAlbaran.direccionEnvioSnapshot,
    mapearDireccion,
    obtenerDireccionClientePorId,
    setDireccionSnapshot,
    snapshotVacio,
  ]);

  const manejarRecargarFacturacion = useCallback(() => {
    if (!direccionesCliente.length) return;
    setDireccionSnapshot("facturacion", mapearDireccion(direccionesCliente[0]));
  }, [direccionesCliente, mapearDireccion, setDireccionSnapshot]);

  const manejarRecargarEnvio = useCallback(() => {
    const direccionPreferida = formAlbaran.direccionId
      ? obtenerDireccionClientePorId(formAlbaran.direccionId)
      : direccionesCliente[0];
    if (!direccionPreferida) return;
    setDireccionSnapshot("envio", mapearDireccion(direccionPreferida));
  }, [
    direccionesCliente,
    formAlbaran.direccionId,
    mapearDireccion,
    obtenerDireccionClientePorId,
    setDireccionSnapshot,
  ]);

  const manejarCopiarFacturacionAEnvio = useCallback(() => {
    setDireccionSnapshot("envio", mapearDireccion(snapshotFacturacion));
  }, [mapearDireccion, setDireccionSnapshot, snapshotFacturacion]);

  const manejarSeleccionDireccionEnvio = useCallback((direccionId) => {
    updateFormAlbaranField("direccionId", direccionId);
    const dir = obtenerDireccionClientePorId(direccionId);
    if (dir) {
      setDireccionSnapshot("envio", mapearDireccion(dir));
    }
  }, [mapearDireccion, obtenerDireccionClientePorId, setDireccionSnapshot, updateFormAlbaranField]);

  const manejarCambioCampoEnvio = useCallback((campo, valor) => {
    updateDireccionSnapshotField("envio", campo, valor);
  }, [updateDireccionSnapshotField]);

  // Cargar stock disponible cuando cambia producto o almacén en una línea
  useEffect(() => {
    const cargarStockLineas = async () => {
      const nuevoStock = {};

      for (let i = 0; i < formAlbaran.lineas.length; i++) {
        const linea = formAlbaran.lineas[i];
        if (!linea.productoId) continue;

        // Determinar el almacén a consultar
        const almacenId = formAlbaran.ventaMultialmacen
          ? linea.almacenId
          : formAlbaran.almacenId;

        if (!almacenId) continue;

        try {
          const response = await fetch(
            `${API_ENDPOINTS.productos}/${linea.productoId}/stock/${almacenId}`
          );
          if (response.ok) {
            const data = await response.json();
            nuevoStock[i] = data.stock || 0;
          }
        } catch (error) {
          console.error('Error al cargar stock:', error);
        }
      }

      setStockPorLinea(nuevoStock);
    };

    if (formAlbaran.lineas.length > 0) {
      cargarStockLineas();
    }
  }, [
    formAlbaran.lineas,
    formAlbaran.almacenId,
    formAlbaran.ventaMultialmacen
  ]);

  useEffect(() => {
    const manejarAtajoAgregarLinea = (event) => {
      const teclaL = event.key?.toLowerCase() === "l";
      const comboCtrlL = (event.ctrlKey || event.metaKey) && !event.shiftKey && !event.altKey && teclaL;
      if (!comboCtrlL) return;

      // Evitar comportamiento por defecto del navegador (por ejemplo, enfocar la barra de direcciones)
      event.preventDefault();
      agregarLinea();
    };

    window.addEventListener("keydown", manejarAtajoAgregarLinea);
    return () => window.removeEventListener("keydown", manejarAtajoAgregarLinea);
  }, [agregarLinea]);

  return (
    <div className="erp-form-view">
      <form onSubmit={(e) => guardarAlbaran(e, { cerrarDespues: false })}>
        <div className="erp-form-content">
          <div className="erp-form-section">
            <div className="erp-form-group">
              <h4 className="erp-form-group-title">Datos del {tipoDocumento}</h4>
              <div className="erp-form-row erp-form-row-3">
                <label className="erp-field">
                  <span className="erp-field-label">Número *</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      className="erp-input-mono"
                      value={formAlbaran.numero}
                      onChange={(e) => updateFormAlbaranField("numero", e.target.value)}
                      required
                      disabled={!formAlbaran.usarCodigoManual}
                      placeholder="Autogenerado"
                      style={{ flex: 1 }}
                    />
                    {generarNumeroAutomatico && !formAlbaran.usarCodigoManual && (
                      <button
                        type="button"
                        className="erp-btn erp-btn-secondary"
                        onClick={() => {
                          // Extraer el ID de serie correctamente si es un objeto
                          const serieId = formAlbaran.serieId;
                          const serieIdValue = typeof serieId === 'object' && serieId !== null ? serieId.id : serieId;
                          generarNumeroAutomatico(serieIdValue);
                        }}
                        disabled={generandoNumero || !formAlbaran.serieId}
                        style={{ whiteSpace: 'nowrap' }}
                      >
                        {generandoNumero ? "Generando..." : "Generar Nº"}
                      </button>
                    )}
                  </div>
                  {!formAlbaran.usarCodigoManual && (
                    <small style={{ color: '#6b7280', display: 'block', marginTop: '4px' }}>
                      {generandoNumero ? "Generando número..." : "Pulsa 'Generar Nº' para asignar número automáticamente"}
                    </small>
                  )}
                </label>
                <label className="erp-field">
                  <span className="erp-field-label">Serie *</span>
                  <select
                    value={formAlbaran.serieId || ""}
                    onChange={(e) => {
                      const serieId = e.target.value;
                      updateFormAlbaranField("serieId", serieId);
                      // Auto-cambiar tarifa si la serie tiene una predeterminada
                      if (tarifasAlbaran && tarifasAlbaran.cambiarTarifaPorSerie) {
                        tarifasAlbaran.cambiarTarifaPorSerie(serieId);
                      }
                    }}
                    disabled={cargandoSeries || seriesDisponibles.length === 0 || (formAlbaran.permiteSeleccionSerie === false && !formAlbaran.usarCodigoManual)}
                  >
                    <option value="">
                      {cargandoSeries ? "Cargando series..." : "Selecciona una serie"}
                    </option>
                    {seriesDisponibles.map((serie) => (
                      <option key={serie.id} value={serie.id}>
                        {serie.prefijo} — {serie.descripcion || "Sin descripción"}
                      </option>
                    ))}
                  </select>
                  {seriesDisponibles.length === 0 && !cargandoSeries && (
                    <small style={{ color: '#b91c1c', marginTop: '4px', display: 'block' }}>
                      No hay series configuradas para {tipoDocumento}s.
                    </small>
                  )}
                  {formAlbaran.permiteSeleccionSerie === false && !formAlbaran.usarCodigoManual && (
                    <small style={{ color: '#6b7280', marginTop: '4px', display: 'block' }}>
                      Esta serie no permite cambios por el usuario.
                    </small>
                  )}
                </label>
                <label className="erp-field">
                  <span className="erp-field-label">Numeración manual</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                      <input
                        type="checkbox"
                        checked={!!formAlbaran.usarCodigoManual}
                        onChange={(e) => updateFormAlbaranField("usarCodigoManual", e.target.checked)}
                      />
                      Permitir editar número manualmente
                    </label>
                  </div>
                </label>
              </div>

              <div className="erp-form-row erp-form-row-4" style={{ marginTop: '12px' }}>
                <label className="erp-field">
                  <span className="erp-field-label">Fecha y hora *</span>
                  <input
                    type="datetime-local"
                    className="erp-input-mono"
                    value={formAlbaran.fecha || ''}
                    onChange={(e) => updateFormAlbaranField("fecha", e.target.value)}
                    required
                  />
                </label>
                <label className="erp-field">
                  <span className="erp-field-label">{esCompra ? 'Proveedor' : 'Cliente'}</span>
                  <ClienteSelector
                    clientes={clientes}
                    value={formAlbaran.clienteId}
                    onChange={(clienteId) => updateFormAlbaranField("clienteId", clienteId)}
                    placeholder={esCompra ? "Buscar proveedor..." : "Buscar cliente..."}
                  />
                </label>
                <label className="erp-field">
                  <span className="erp-field-label">Estado</span>
                  <select
                    value={formAlbaran.estado}
                    onChange={(e) => updateFormAlbaranField("estado", e.target.value)}
                  >
                    {estadoOptions.map((e) => (
                      <option key={e.nombre} value={e.nombre}>{e.nombre}</option>
                    ))}
                  </select>
                </label>
                <div className="erp-field" style={{ alignSelf: 'flex-end' }}>
                  <button
                    type="button"
                    className="erp-btn erp-btn-secondary"
                    onClick={guardarPreferenciaSerie}
                    disabled={
                      !guardarPreferenciaSerie ||
                      !formAlbaran.serieId ||
                      guardandoPreferenciaSerie
                    }
                  >
                    {guardandoPreferenciaSerie ? "Guardando..." : "Guardar como predeterminada"}
                  </button>
                </div>
              </div>
            </div>

            {/* Direcciones del albarán */}
            <div className="erp-form-group" style={{ marginTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', gap: '16px', flexWrap: 'wrap' }}>
                <h4 className="erp-form-group-title" style={{ margin: 0 }}>Direcciones del {tipoDocumento}</h4>
                {clienteSeleccionado && (
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>
                    Se guardan como snapshot dentro del {tipoDocumento} (no modifican el {esCompra ? 'proveedor' : 'cliente'}).
                  </span>
                )}
              </div>

              <div className="erp-form-row erp-form-row-2" style={{ gap: '20px' }}>
                {/* Dirección de facturación */}
                <div className="erp-field" style={{ border: '1px solid var(--erp-border, #e2e8f0)', borderRadius: '8px', padding: '12px', background: 'var(--erp-bg-section, #f8fafc)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', gap: '8px' }}>
                    <span className="erp-field-label" style={{ margin: 0 }}>Dirección de facturación (snapshot)</span>
                    <button
                      type="button"
                      className="erp-btn erp-btn-light"
                      onClick={manejarRecargarFacturacion}
                      disabled={!clienteSeleccionado || direccionesCliente.length === 0}
                      style={{ padding: '10px 16px', fontSize: '14px', minHeight: '44px' }}
                    >
                      <IconRefresh className="erp-action-icon" /> Recargar
                    </button>
                  </div>
                  <div style={{ display: 'grid', gap: '6px' }}>
                    <label className="erp-field">
                      <span className="erp-field-label">Dirección</span>
                      <textarea rows="2" value={snapshotFacturacion.direccion || ""} readOnly />
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px' }}>
                      <label className="erp-field">
                        <span className="erp-field-label">C.P.</span>
                        <input type="text" value={snapshotFacturacion.codigoPostal || ""} readOnly />
                      </label>
                      <label className="erp-field">
                        <span className="erp-field-label">Población</span>
                        <input type="text" value={snapshotFacturacion.poblacion || ""} readOnly />
                      </label>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: '8px' }}>
                      <label className="erp-field">
                        <span className="erp-field-label">Provincia</span>
                        <input type="text" value={snapshotFacturacion.provincia || ""} readOnly />
                      </label>
                      <label className="erp-field">
                        <span className="erp-field-label">País</span>
                        <input type="text" value={snapshotFacturacion.pais || ""} readOnly />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Dirección de entrega */}
                <div className="erp-field" style={{ border: '1px solid var(--erp-border, #e2e8f0)', borderRadius: '8px', padding: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', gap: '8px', flexWrap: 'wrap' }}>
                    <span className="erp-field-label" style={{ margin: 0 }}>Dirección de entrega (editable)</span>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        className="erp-btn erp-btn-light"
                        onClick={manejarRecargarEnvio}
                        disabled={!clienteSeleccionado || (direccionesCliente.length === 0 && !formAlbaran.direccionId)}
                        style={{ padding: '10px 16px', fontSize: '14px', minHeight: '44px' }}
                      >
                        <IconRefresh className="erp-action-icon" /> Recargar
                      </button>
                      <button
                        type="button"
                        className="erp-btn erp-btn-light"
                        onClick={manejarCopiarFacturacionAEnvio}
                        style={{ padding: '10px 16px', fontSize: '14px', minHeight: '44px' }}
                      >
                        <IconDuplicate className="erp-action-icon" /> Copiar facturación
                      </button>
                    </div>
                  </div>

                  <label className="erp-field">
                    <span className="erp-field-label">Seleccionar desde el cliente</span>
                    <DireccionSelector
                      direcciones={direccionesCliente}
                      value={formAlbaran.direccionId}
                      onChange={manejarSeleccionDireccionEnvio}
                      placeholder={clienteSeleccionado ? "Seleccionar dirección..." : "Selecciona un cliente"}
                      disabled={!clienteSeleccionado}
                    />
                  </label>

                  <div style={{ display: 'grid', gap: '6px', marginTop: '8px' }}>
                    <label className="erp-field">
                      <span className="erp-field-label">Dirección</span>
                      <textarea
                        rows="2"
                        value={snapshotEnvio.direccion || ""}
                        onChange={(e) => manejarCambioCampoEnvio("direccion", e.target.value)}
                        placeholder="Calle, número, piso..."
                      />
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px' }}>
                      <label className="erp-field">
                        <span className="erp-field-label">C.P.</span>
                        <input
                          type="text"
                          value={snapshotEnvio.codigoPostal || ""}
                          onChange={(e) => manejarCambioCampoEnvio("codigoPostal", e.target.value)}
                          placeholder="06000"
                        />
                      </label>
                      <label className="erp-field">
                        <span className="erp-field-label">Población</span>
                        <input
                          type="text"
                          value={snapshotEnvio.poblacion || ""}
                          onChange={(e) => manejarCambioCampoEnvio("poblacion", e.target.value)}
                          placeholder="Ciudad"
                        />
                      </label>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: '8px' }}>
                      <label className="erp-field">
                        <span className="erp-field-label">Provincia</span>
                        <input
                          type="text"
                          value={snapshotEnvio.provincia || ""}
                          onChange={(e) => manejarCambioCampoEnvio("provincia", e.target.value)}
                          placeholder="Provincia"
                        />
                      </label>
                      <label className="erp-field">
                        <span className="erp-field-label">País</span>
                        <input
                          type="text"
                          value={snapshotEnvio.pais || ""}
                          onChange={(e) => manejarCambioCampoEnvio("pais", e.target.value)}
                          placeholder="España"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

            {/* Datos del cliente seleccionado (solo lectura) */}
            {clienteSeleccionado && (
              <div className="erp-datos-cliente-box" style={{ 
                  marginTop: '16px', 
                  padding: '12px 16px', 
                  backgroundColor: '#f8fafc', 
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  fontSize: '13px'
                }}>
                  <div style={{ fontWeight: '600', marginBottom: '8px', color: '#475569' }}>
                    Datos del cliente
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px 24px' }}>
                    <div><span style={{ color: '#64748b' }}>Nombre comercial:</span> <strong>{clienteSeleccionado.nombreComercial || '—'}</strong></div>
                    <div><span style={{ color: '#64748b' }}>Razón social:</span> {clienteSeleccionado.nombreFiscal || '—'}</div>
                    <div><span style={{ color: '#64748b' }}>CIF/NIF:</span> <span style={{ fontFamily: 'monospace' }}>{clienteSeleccionado.nifCif || '—'}</span></div>
                    <div><span style={{ color: '#64748b' }}>Email:</span> {clienteSeleccionado.email || '—'}</div>
                    <div><span style={{ color: '#64748b' }}>Teléfono:</span> {clienteSeleccionado.telefonoFijo || clienteSeleccionado.telefonoMovil || '—'}</div>
                    {clienteSeleccionado.poblacion && <div><span style={{ color: '#64748b' }}>Población:</span> {clienteSeleccionado.poblacion}</div>}
                    {clienteSeleccionado.codigoPostal && <div><span style={{ color: '#64748b' }}>C.P.:</span> {clienteSeleccionado.codigoPostal}</div>}
                    {agrupacionCliente && (
                      <div><span style={{ color: '#64748b' }}>Agrupación:</span> <strong>{agrupacionCliente.nombre}</strong> (Dto. {agrupacionCliente.descuentoGeneral || 0}%)</div>
                    )}
                    {clienteSeleccionado.recargoEquivalencia && (
                      <div><span style={{ color: '#64748b' }}>Recargo Eq.:</span> <span className="erp-badge erp-badge-warning">Sí</span></div>
                    )}
                  </div>
                </div>
            )}

            {/* Selector de tarifa y almacén */}
            <div className="erp-form-group" style={{ marginTop: '16px' }}>
                <div className="erp-form-row erp-form-row-2" style={{ gap: '16px' }}>
                  {tarifasAlbaran && (
                    <label className="erp-field">
                      <TarifaSelector
                        tarifasDisponibles={tarifasAlbaran.tarifasDisponibles}
                        tarifaSeleccionada={tarifasAlbaran.tarifaSeleccionada}
                        esMultitarifaPermitida={tarifasAlbaran.esMultitarifaPermitida}
                        cargandoTarifas={tarifasAlbaran.cargandoTarifas}
                        onCambiarTarifa={tarifasAlbaran.cambiarTarifa}
                        disabled={false}
                        esCompra={esCompra}
                      />
                    </label>
                  )}
                  {mostrarSelectorAlmacen && permitirVentaMultialmacen && !formAlbaran.ventaMultialmacen && (
                    <label className="erp-field">
                      <span className="erp-field-label">Almacén</span>
                      <select
                        value={formAlbaran.almacenId || ""}
                        onChange={(e) => updateFormAlbaranField("almacenId", e.target.value)}
                      >
                        <option value="">Selecciona un almacén</option>
                        {almacenes.map((alm) => (
                          <option key={alm.id} value={alm.id}>
                            {alm.nombre}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                </div>

                {/* Botón recalcular precios y multialmacén */}
                <div className="erp-form-row erp-form-row-2" style={{ marginTop: '8px', gap: '16px' }}>
                  {tarifasAlbaran && (
                    <label className="erp-field">
                      <button
                        type="button"
                        onClick={tarifasAlbaran.recalcularPreciosLineas}
                        className="erp-btn erp-btn-secondary"
                        disabled={!formAlbaran.lineas || formAlbaran.lineas.length === 0}
                        style={{ width: '100%' }}
                      >
                        🔄 Recalcular Precios
                      </button>
                    </label>
                  )}
                  {mostrarSelectorAlmacen && permitirVentaMultialmacen && (
                    <label className="erp-field">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '100%' }}>
                        <input
                          type="checkbox"
                          checked={!!formAlbaran.ventaMultialmacen}
                          onChange={(e) => {
                            updateFormAlbaranField("ventaMultialmacen", e.target.checked);
                            if (e.target.checked) {
                              updateFormAlbaranField("almacenId", "");
                            }
                          }}
                        />
                        <span style={{ fontSize: '13px' }}>Vender de varios almacenes</span>
                      </div>
                    </label>
                  )}
                </div>
              </div>
            </div>

            <div className="erp-form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 className="erp-form-group-title" style={{ margin: 0 }}>Líneas de productos</h4>
                <button
                  type="button"
                  className="erp-btn erp-btn-secondary"
                  onClick={agregarLinea}
                  title="Ctrl + L para añadir línea rápida"
                >
                  + Agregar línea
                </button>
              </div>

              <CampoEscanerCodigo
                onProductoEscaneado={(datos) => {
                  const { producto, cantidad, debeAcumular, codigoBarra } = datos;
                  
                  // Si debe acumular (EAN13/EAN8/CODE128), buscar si ya existe
                  if (debeAcumular) {
                    const indiceExistente = formAlbaran.lineas.findIndex(
                      linea => linea.productoId === producto.id
                    );
                    
                    if (indiceExistente !== -1) {
                      // Sumar cantidad a la línea existente
                      const cantidadActual = formAlbaran.lineas[indiceExistente].cantidad || 0;
                      actualizarLinea(indiceExistente, "cantidad", cantidadActual + cantidad);
                      return;
                    }
                  }
                  
                  // Agregar nueva línea usando agregarLinea y luego actualizar con los datos del producto
                  agregarLinea();
                  
                  // Usar setTimeout para asegurar que la línea se agregó antes de actualizarla
                  setTimeout(() => {
                    const ultimoIndice = formAlbaran.lineas.length;
                    actualizarLinea(ultimoIndice, "productoId", producto.id);
                    actualizarLinea(ultimoIndice, "nombreProducto", producto.titulo);
                    actualizarLinea(ultimoIndice, "referencia", producto.referencia);
                    actualizarLinea(ultimoIndice, "cantidad", cantidad);
                    actualizarLinea(ultimoIndice, "precioUnitario", producto.precio || 0);
                    actualizarLinea(ultimoIndice, "descuento", producto.descuento || 0);
                    if (producto.tipoIva?.id) {
                      actualizarLinea(ultimoIndice, "tipoIvaId", producto.tipoIva.id.toString());
                    }
                    if (producto.almacenPredeterminado?.id) {
                      actualizarLinea(ultimoIndice, "almacenId", producto.almacenPredeterminado.id);
                    }
                  }, 0);
                }}
              />

              <table className="erp-table erp-table-compact">
                <thead>
                  <tr>
                    <th style={{ width: formAlbaran.ventaMultialmacen ? '10%' : '12%' }}>Referencia</th>
                    <th style={{ width: formAlbaran.ventaMultialmacen ? '22%' : '30%' }}>Producto</th>
                    {formAlbaran.ventaMultialmacen && (
                      <th style={{ width: '10%' }}>Almacén</th>
                    )}
                    <th style={{ width: '5%', textAlign: 'center' }}>Cant.</th>
                    <th style={{ width: formAlbaran.ventaMultialmacen ? '9%' : '11%', textAlign: 'center' }}>Precio</th>
                    <th style={{ width: '7%', textAlign: 'center' }}>Dto. %</th>
                    <th style={{ width: '6%', textAlign: 'center' }}>IVA %</th>
                    <th style={{ width: '7%', textAlign: 'center' }}>Rec. %</th>
                    <th style={{ width: formAlbaran.ventaMultialmacen ? '11%' : '18%', textAlign: 'center' }}>Base</th>
                    <th style={{ width: '4%' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {formAlbaran.lineas.map((linea, index) => (
                    <tr key={index}>
                      <td>
                        <div 
                          title={
                            linea.productoId && stockPorLinea[index] !== undefined
                              ? `${linea.nombreProducto || productos.find(p => p.id === linea.productoId)?.titulo || 'Producto'}\nStock disponible: ${stockPorLinea[index]} unidades`
                              : linea.productoId
                              ? linea.nombreProducto || productos.find(p => p.id === linea.productoId)?.titulo || ''
                              : ''
                          }
                        >
                          <ReferenciaSelector
                            productos={productos}
                            value={linea.productoId}
                            referenciaEditable={linea.referencia || ''}
                            onReferenciaChange={(nuevaReferencia) => {
                              actualizarLinea(index, "referencia", nuevaReferencia);
                            }}
                            onChange={(productoId) => {
                              actualizarLinea(index, "productoId", productoId);
                            }}
                            onProductoSelect={(producto, referenciaUsada) => {
                              // Establecer el nombre del producto cuando se selecciona
                              actualizarLinea(index, "nombreProducto", producto.titulo);
                              // Capturar la referencia usada en la búsqueda
                              if (referenciaUsada) {
                                actualizarLinea(index, "referencia", referenciaUsada);
                              } else {
                                actualizarLinea(index, "referencia", producto.referencia);
                              }
                              // Autocompletar otros campos si es necesario
                              if (producto.precio) {
                                actualizarLinea(index, "precioUnitario", parseFloat(producto.precio));
                              }
                              if (producto.tipoIva) {
                                actualizarLinea(index, "tipoIvaId", producto.tipoIva.id.toString());
                                actualizarLinea(index, "porcentajeIva", producto.tipoIva.porcentajeIva || 0);
                              }
                            }}
                            placeholder="Buscar ref..."
                          />
                        </div>
                      </td>
                      <td>
                        <input
                          type="text"
                          className="erp-input"
                          value={linea.nombreProducto || productos.find(p => p.id === linea.productoId)?.titulo || ""}
                          onChange={(e) => actualizarLinea(index, "nombreProducto", e.target.value)}
                          placeholder="Producto"
                          style={{ fontSize: '12px', whiteSpace: 'normal', wordWrap: 'break-word', minHeight: '32px', height: 'auto', lineHeight: '1.4' }}
                        />
                      </td>
                      {formAlbaran.ventaMultialmacen && (
                        <td>
                          <select
                            value={linea.almacenId || ""}
                            onChange={(e) => actualizarLinea(index, "almacenId", e.target.value)}
                            style={{ fontSize: '12px', width: '100%', whiteSpace: 'normal', wordWrap: 'break-word' }}
                          >
                            <option value="">Seleccionar</option>
                            {almacenes.map((alm) => (
                              <option key={alm.id} value={alm.id}>
                                {alm.nombre}
                              </option>
                            ))}
                          </select>
                        </td>
                      )}
                      <td style={{ textAlign: 'center' }}>
                        <input
                          type="number"
                          min="0.001"
                          step="0.001"
                          className="erp-input-mono"
                          value={linea.cantidad === null || linea.cantidad === undefined ? '' : linea.cantidad}
                          onChange={(e) => {
                            const valor = e.target.value;
                            if (valor === '' || valor === null) {
                              actualizarLinea(index, "cantidad", '');
                            } else {
                              const num = parseFloat(valor);
                              actualizarLinea(index, "cantidad", isNaN(num) ? '' : num);
                            }
                          }}
                          onBlur={(e) => {
                            if (e.target.value === '' || e.target.value === null || parseFloat(e.target.value) < 0.001) {
                              actualizarLinea(index, "cantidad", 1);
                            }
                          }}
                          style={{ textAlign: 'center', MozAppearance: 'textfield' }}
                        />
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <input
                          type="number"
                          step="0.01"
                          className="erp-input-mono"
                          value={linea.precioUnitario}
                          onChange={(e) => actualizarLinea(index, "precioUnitario", parseFloat(e.target.value) || 0)}
                          style={{ textAlign: 'center', MozAppearance: 'textfield' }}
                        />
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          className="erp-input-mono"
                          value={linea.descuento ?? ""}
                          style={{ textAlign: 'center', MozAppearance: 'textfield' }}
                          onChange={(e) => {
                            const valorString = (e.target.value ?? "").slice(0, 5);
                            if (valorString === "") {
                              actualizarLinea(index, "descuento", null);
                              return;
                            }
                            const valorParseado = parseFloat(valorString);
                            const valor = isNaN(valorParseado) ? 0 : valorParseado;
                            actualizarLinea(index, "descuento", Math.min(100, Math.max(0, valor)));
                          }}
                        />
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <select
                          value={linea.tipoIvaId?.toString() || ""}
                          onChange={(e) => actualizarLinea(index, "tipoIvaId", e.target.value)}
                          style={{ minWidth: '80px', fontSize: '12px', textAlign: 'center' }}
                        >
                          <option value="">Sin IVA</option>
                          {tiposIva.map((tipo) => (
                            <option key={tipo.id} value={tipo.id.toString()}>
                              {tipo.porcentajeIva}%
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="erp-td-mono" style={{ textAlign: 'center' }}>
                        {(linea.porcentajeRecargo || 0).toFixed(1)}%
                      </td>
                      <td className="erp-td-mono" style={{ textAlign: 'center' }}>
                        {((linea.cantidad * linea.precioUnitario * (1 - linea.descuento / 100)) || 0).toFixed(2)} €
                      </td>
                      <td>
                        <button
                          type="button"
                          className="erp-action-btn erp-action-danger"
                          onClick={() => eliminarLinea(index)}
                        >
                          <IconDelete className="erp-action-icon" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {formAlbaran.lineas.length === 0 && (
                    <tr><td colSpan={formAlbaran.ventaMultialmacen ? 10 : 9} className="erp-td-empty">No hay líneas. Haz clic en "Agregar línea"</td></tr>
                  )}
                </tbody>
              </table>

              {/* Layout de dos columnas: desglose a la izquierda, totales a la derecha */}
              <div style={{ display: 'flex', gap: '24px', marginTop: '16px', justifyContent: 'flex-end' }}>
                {/* Desglose por tipo de IVA (tras descuentos) - solo si hay más de un tipo */}
                {totales.desgloseIva && totales.desgloseIva.length > 1 && (
                  <div style={{ 
                    flex: '0 1 auto',
                    padding: '12px', 
                    backgroundColor: '#f8fafc', 
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '8px', color: '#475569' }}>
                      Desglose por tipo de IVA (tras descuentos)
                    </div>
                    <table style={{ fontSize: '12px' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <th style={{ textAlign: 'left', padding: '4px 8px', fontWeight: '500' }}>Tipo IVA</th>
                          <th style={{ textAlign: 'right', padding: '4px 8px', fontWeight: '500' }}>Base antes dto</th>
                          <th style={{ textAlign: 'right', padding: '4px 8px', fontWeight: '500' }}>Dto. agr.</th>
                          <th style={{ textAlign: 'right', padding: '4px 8px', fontWeight: '500' }}>Base imp.</th>
                          <th style={{ textAlign: 'right', padding: '4px 8px', fontWeight: '500' }}>IVA</th>
                          {(totales.totalRecargo || 0) > 0 && (
                            <th style={{ textAlign: 'right', padding: '4px 8px', fontWeight: '500' }}>Recargo</th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {totales.desgloseIva.map((desglose, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '4px 8px' }}>{desglose.porcentajeIva}%</td>
                            <td style={{ textAlign: 'right', padding: '4px 8px', fontFamily: 'monospace' }}>
                              {(desglose.baseAntesDescuento || 0).toFixed(2)} €
                            </td>
                            <td style={{ textAlign: 'right', padding: '4px 8px', fontFamily: 'monospace', color: '#dc2626' }}>
                              -{Math.abs(desglose.descuentoAgrupacionImporte || 0).toFixed(2)} €
                            </td>
                            <td style={{ textAlign: 'right', padding: '4px 8px', fontFamily: 'monospace' }}>
                              {desglose.baseImponible.toFixed(2)} €
                            </td>
                            <td style={{ textAlign: 'right', padding: '4px 8px', fontFamily: 'monospace' }}>
                              {desglose.importeIva.toFixed(2)} €
                            </td>
                            {(totales.totalRecargo || 0) > 0 && (
                              <td style={{ textAlign: 'right', padding: '4px 8px', fontFamily: 'monospace' }}>
                                {desglose.importeRecargo.toFixed(2)} €
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Totales a la derecha */}
                <div className="erp-totales-box" style={{ flex: '0 0 auto', minWidth: '380px' }}>
                  <div className="erp-total-row">
                    <span>Subtotal:</span>
                    <span className="erp-mono" style={{ whiteSpace: 'nowrap' }}>{totales.subtotal.toFixed(2)} €</span>
                  </div>
                  {totales.descuentoTotal > 0 && (
                    <>
                      <div className="erp-total-row">
                        <span>Descuento líneas:</span>
                        <span className="erp-mono" style={{ color: '#dc2626', whiteSpace: 'nowrap' }}>-{totales.descuentoTotal.toFixed(2)} €</span>
                      </div>
                      <div className="erp-total-row">
                        <span>Base tras dto. líneas:</span>
                        <span className="erp-mono" style={{ whiteSpace: 'nowrap' }}>{(totales.subtotal - totales.descuentoTotal).toFixed(2)} €</span>
                      </div>
                    </>
                  )}
                  <div className="erp-total-row" style={{ alignItems: 'center' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span>{agrupacionCliente ? `Dto. agrup. (${agrupacionCliente.nombre})` : "Dto."}</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        className="erp-input-mono"
                        style={{ width: '50px', textAlign: 'right' }}
                        value={formAlbaran.descuentoAgrupacionManual ?? ""}
                        onChange={(e) => {
                          const valorString = (e.target.value ?? "").slice(0, 5);
                          if (valorString === "") {
                            updateFormAlbaranField("descuentoAgrupacionManual", null);
                            return;
                          }
                          const valorParseado = parseFloat(valorString);
                          const valor = isNaN(valorParseado) ? 0 : valorParseado;
                          updateFormAlbaranField("descuentoAgrupacionManual", Math.min(100, Math.max(0, valor)));
                        }}
                      />
                      <span>%</span>
                      {totales.descuentoAgrupacionBase !== undefined && 
                       totales.descuentoAgrupacionBase !== formAlbaran.descuentoAgrupacionManual && (
                        <span style={{ fontSize: '11px', color: '#6b7280' }}>
                          (base: {totales.descuentoAgrupacionBase}%)
                        </span>
                      )}
                    </span>
                    {totales.descuentoAgrupacion > 0 && (
                      <span className="erp-mono" style={{ color: '#dc2626', whiteSpace: 'nowrap' }}>-{totales.descuentoAgrupacion.toFixed(2)} €</span>
                    )}
                  </div>
                  <div className="erp-total-row">
                    <span>Base imponible:</span>
                    <span className="erp-mono" style={{ whiteSpace: 'nowrap' }}>{(totales.totalBaseSinImpuestos || 0).toFixed(2)} €</span>
                  </div>
                  <div className="erp-total-row">
                    <span>
                      {totales.desgloseIva && totales.desgloseIva.length === 1 
                        ? `Total IVA (${totales.desgloseIva[0].porcentajeIva}%):`
                        : "Total IVA:"
                      }
                    </span>
                    <span className="erp-mono" style={{ whiteSpace: 'nowrap' }}>{(totales.totalIva || 0).toFixed(2)} €</span>
                  </div>
                  {(totales.totalRecargo || 0) > 0 && (
                    <div className="erp-total-row">
                      <span>Total Recargo Eq.:</span>
                      <span className="erp-mono" style={{ whiteSpace: 'nowrap' }}>{(totales.totalRecargo || 0).toFixed(2)} €</span>
                    </div>
                  )}
                  <div className="erp-total-row erp-total-final">
                    <span>TOTAL:</span>
                    <span className="erp-mono" style={{ whiteSpace: 'nowrap' }}>{totales.total.toFixed(2)} €</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="erp-form-group">
              <label className="erp-field erp-field-full">
                <span className="erp-field-label">Observaciones</span>
                <textarea
                  rows="2"
                  value={formAlbaran.observaciones}
                  onChange={(e) => updateFormAlbaranField("observaciones", e.target.value)}
                />
              </label>
            </div>

            {/* Notas internas y Adjuntos - debajo de observaciones */}
            <div className="erp-form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <label className="erp-field">
                <span className="erp-field-label">Notas internas (no se imprimen)</span>
                <textarea
                  rows="3"
                  value={formAlbaran.notas || ""}
                  onChange={(e) => updateFormAlbaranField("notas", e.target.value)}
                  placeholder="Notas privadas para uso interno..."
                  style={{ backgroundColor: '#fffbeb', borderColor: '#fcd34d' }}
                />
              </label>
              
              <div className="erp-field">
                <span className="erp-field-label">Archivos adjuntos</span>
                <div style={{ 
                  border: '2px dashed #cbd5e1', 
                  borderRadius: '8px', 
                  padding: '12px',
                  backgroundColor: '#f8fafc',
                  minHeight: '80px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <input
                      type="file"
                      id="adjunto-albaran"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          subirAdjunto(e.target.files[0]);
                          e.target.value = '';
                        }
                      }}
                    />
                    <label 
                      htmlFor="adjunto-albaran" 
                      className="erp-btn erp-btn-secondary"
                      style={{ 
                        cursor: 'pointer', 
                        margin: 0, 
                        fontSize: '12px', 
                        padding: '4px 8px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <IconUpload className="erp-action-icon" /> Adjuntar
                    </label>
                  </div>
                  
                  {(formAlbaran.adjuntos?.length > 0) ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {formAlbaran.adjuntos.map((adj, idx) => (
                        <div 
                          key={idx} 
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            padding: '4px 8px',
                            backgroundColor: '#fff',
                            borderRadius: '4px',
                            border: '1px solid #e2e8f0',
                            fontSize: '12px'
                          }}
                        >
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <IconFile className="erp-action-icon" /> {adj.nombreOriginal || adj.nombre}
                          </span>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            {adj.id && (
                              <button
                                type="button"
                                className="erp-action-btn erp-action-info"
                                onClick={() => descargarAdjunto(adj.id, adj.nombreOriginal || adj.nombre)}
                                title="Descargar"
                                style={{ 
                                  padding: '2px 4px', 
                                  fontSize: '10px', 
                                  display: 'inline-flex',
                                  alignItems: 'center'
                                }}
                              >
                                <IconDownload className="erp-action-icon" style={{ width: 14, height: 14 }} />
                              </button>
                            )}
                            <button
                              type="button"
                              className="erp-action-btn erp-action-danger"
                              onClick={() => eliminarAdjunto(adj.id)}
                              title="Quitar"
                              style={{ 
                                padding: '2px 4px', 
                                fontSize: '10px',
                                display: 'inline-flex',
                                alignItems: 'center'
                              }}
                            >
                              <IconDelete className="erp-action-icon" style={{ width: 14, height: 14 }} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center' }}>
                      Sin adjuntos
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>

        <div className="erp-form-actions">
          <button type="submit" className="erp-btn erp-btn-primary">
            Guardar
          </button>
          <button
            type="button"
            className="erp-btn erp-btn-primary erp-btn-light"
            onClick={(e) => guardarAlbaran(e, { cerrarDespues: true, cerrarPestana: () => cerrarPestana(pestanaActiva) })}
          >
            Guardar y salir
          </button>
          <button type="button" className="erp-btn erp-btn-secondary" onClick={() => cerrarPestana(pestanaActiva)}>
            Cancelar
          </button>
        </div>
      </form>

      {/* Modal de confirmación de descuento de stock */}
      {mostrarConfirmacionStock && (
        <div className="erp-modal-overlay" onClick={cancelarConfirmacionStock}>
          <div className="erp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="erp-modal-header">
              <h3>⚠️ Confirmación de descuento de stock</h3>
              <button className="erp-modal-close" onClick={cancelarConfirmacionStock}>×</button>
            </div>
            <div className="erp-modal-body">
              <p style={{ marginBottom: '16px', lineHeight: '1.6' }}>
                Estás a punto de guardar este albarán con estado <strong>"Emitido"</strong>.
              </p>
              <div style={{ 
                padding: '12px', 
                backgroundColor: '#fef3c7', 
                border: '1px solid #fbbf24', 
                borderRadius: '6px',
                marginBottom: '16px'
              }}>
                <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5' }}>
                  <strong>⚠️ Importante:</strong> Según la configuración actual, al cambiar el estado a "Emitido" 
                  se <strong>descontará automáticamente el stock</strong> de los productos incluidos en este albarán.
                </p>
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
                ¿Deseas continuar y guardar el albarán?
              </p>
            </div>
            <div className="erp-modal-footer">
              <button 
                className="erp-btn erp-btn-primary" 
                onClick={(e) => confirmarYGuardarAlbaran(e, { cerrarDespues: false })}
              >
                Sí, guardar y descontar stock
              </button>
              <button 
                className="erp-btn erp-btn-secondary" 
                onClick={cancelarConfirmacionStock}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de error de stock insuficiente */}
      {mostrarErrorStock && (
        <div className="erp-modal-overlay" onClick={cerrarModalErrorStock}>
          <div className="erp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="erp-modal-header">
              <h3>❌ Stock insuficiente</h3>
              <button className="erp-modal-close" onClick={cerrarModalErrorStock}>×</button>
            </div>
            <div className="erp-modal-body">
              <div style={{ 
                padding: '16px', 
                backgroundColor: '#fef2f2', 
                border: '1px solid #fca5a5', 
                borderRadius: '6px',
                marginBottom: '16px'
              }}>
                <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.6', color: '#991b1b' }}>
                  <strong>⚠️ No se puede guardar el albarán:</strong>
                </p>
                <p style={{ margin: '12px 0 0 0', fontSize: '14px', lineHeight: '1.6', color: '#7f1d1d' }}>
                  {mensajeErrorStock}
                </p>
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: '#6b7280', lineHeight: '1.5' }}>
                Para resolver este problema puedes:
              </p>
              <ul style={{ marginTop: '8px', fontSize: '13px', color: '#6b7280', lineHeight: '1.6' }}>
                <li>Reducir la cantidad solicitada</li>
                <li>Seleccionar otro almacén con stock disponible</li>
                <li>Activar la opción "Permitir venta con stock insuficiente" en la configuración de ventas</li>
              </ul>
            </div>
            <div className="erp-modal-footer">
              <button 
                className="erp-btn erp-btn-primary" 
                onClick={cerrarModalErrorStock}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de cambio de estado con impacto en stock */}
      <ModalCambioEstadoStock
        mostrar={mostrarModalCambioEstado}
        tipo={datosModalCambioEstado.tipo}
        productos={datosModalCambioEstado.productos}
        onConfirmar={confirmarCambioEstado}
        onCancelar={cancelarCambioEstado}
        estadoOrigen={datosModalCambioEstado.estadoOrigen}
        estadoDestino={datosModalCambioEstado.estadoDestino}
      />
    </div>
  );
}

// ========== FICHA DE ALBARÁN (mismo diseño que formulario, solo lectura) ==========
export function FichaAlbaran({ 
  albaranes, 
  albaranId, 
  abrirEditarAlbaran, 
  generarPdf,
  abrirModalTransformar,
  abrirModalEmail,
  estadoOptions = [],
  modoVisual = "claro",
  descargarAdjunto,
  cargarHistorialTransformaciones,
}) {
  const [albaran, setAlbaran] = useState(null);
  const [cargandoAlbaran, setCargandoAlbaran] = useState(false);
  const cliente = albaran?.cliente;
  const agrupacionCliente = cliente?.agrupacion;
  
  // Obtener direcciones del cliente
  const [direccionesCliente, setDireccionesCliente] = useState([]);
  
  // Historial de transformaciones
  const [historialTransformaciones, setHistorialTransformaciones] = useState([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);

  // Cargar albarán si no está en la lista
  useEffect(() => {
    const albaranEnLista = albaranes.find(a => a.id === albaranId);
    
    if (albaranEnLista) {
      setAlbaran(albaranEnLista);
    } else if (albaranId) {
      // Cargar desde el backend si no está en la lista
      const cargarAlbaran = async () => {
        setCargandoAlbaran(true);
        try {
          const response = await fetch(`${API_ENDPOINTS.albaranes}/${albaranId}`);
          if (response.ok) {
            const data = await response.json();
            setAlbaran(data);
          }
        } catch (error) {
          console.error('Error al cargar albarán:', error);
        } finally {
          setCargandoAlbaran(false);
        }
      };
      cargarAlbaran();
    }
  }, [albaranId, albaranes]);
  
  useEffect(() => {
    if (!cliente) {
      setDireccionesCliente([]);
      return;
    }

    const obtenerDirecciones = async () => {
      try {
        const response = await fetch(`${API_ENDPOINTS.clientes}/${cliente.id}/direcciones`);
        if (response.ok) {
          const direcciones = await response.json();
          const direccionesFormateadas = direcciones.map(dir => ({
            id: dir.id,
            direccion: dir.direccion,
            codigoPostal: dir.codigoPostal,
            poblacion: dir.poblacion,
            provincia: dir.provincia,
            pais: dir.pais || 'España'
          }));
          setDireccionesCliente(direccionesFormateadas);
        } else {
          setDireccionesCliente([]);
        }
      } catch (error) {
        console.error('Error al obtener direcciones:', error);
        setDireccionesCliente([]);
      }
    };

    obtenerDirecciones();
  }, [cliente]);

  // Cargar historial de transformaciones
  useEffect(() => {
    if (!albaran || !cargarHistorialTransformaciones) return;

    const cargarHistorial = async () => {
      setCargandoHistorial(true);
      try {
        const historial = await cargarHistorialTransformaciones('ALBARAN', albaran.id);
        setHistorialTransformaciones(historial || []);
      } catch (error) {
        console.error('Error al cargar historial:', error);
        setHistorialTransformaciones([]);
      } finally {
        setCargandoHistorial(false);
      }
    };

    cargarHistorial();
  }, [albaran, cargarHistorialTransformaciones]);

  if (cargandoAlbaran) return <div className="erp-empty-state">Cargando albarán...</div>;
  if (!albaran) return <div className="erp-empty-state">Albarán no encontrado</div>;
  
  // Calcular totales desde las líneas
  const calcularTotales = () => {
    let subtotal = 0;
    let descuentoTotal = 0;
    let totalIva = 0;
    let totalRecargo = 0;
    const desglosePorIva = {};

    (albaran.lineas || []).forEach(linea => {
      const lineaSubtotal = (linea.cantidad || 0) * (linea.precioUnitario || 0);
      const lineaDescuento = lineaSubtotal * ((linea.descuento || 0) / 100);
      subtotal += lineaSubtotal;
      descuentoTotal += lineaDescuento;

      // Agrupar por tipo de IVA
      const tipoIvaKey = linea.tipoIva?.id || "sin_iva";
      const porcentajeIva = linea.porcentajeIva || 0;
      const porcentajeRecargo = linea.porcentajeRecargo || 0;
      if (!desglosePorIva[tipoIvaKey]) {
        desglosePorIva[tipoIvaKey] = {
          nombre: linea.tipoIva?.nombre || (porcentajeIva > 0 ? `${porcentajeIva}%` : "Sin IVA"),
          porcentajeIva,
          porcentajeRecargo,
          baseAntesDescuento: 0,
          descuentoAgrupacionImporte: 0,
          baseImponible: 0,
          importeIva: 0,
          importeRecargo: 0,
        };
      }
      const baseLinea = lineaSubtotal - lineaDescuento;
      const descuentoAgrupacionPct = albaran.descuentoAgrupacion || 0;
      const baseConAgrupacion = baseLinea * (1 - descuentoAgrupacionPct / 100);
      const descuentoAgrupacionLinea = baseLinea - baseConAgrupacion;
      
      // Calcular IVA y recargo sobre la base CON descuento de agrupación
      const ivaLinea = baseConAgrupacion * (porcentajeIva / 100);
      const recargoLinea = baseConAgrupacion * (porcentajeRecargo / 100);
      
      desglosePorIva[tipoIvaKey].baseAntesDescuento += baseLinea;
      desglosePorIva[tipoIvaKey].descuentoAgrupacionImporte += descuentoAgrupacionLinea;
      desglosePorIva[tipoIvaKey].baseImponible += baseConAgrupacion;
      desglosePorIva[tipoIvaKey].importeIva += ivaLinea;
      desglosePorIva[tipoIvaKey].importeRecargo += recargoLinea;
      
      totalIva += ivaLinea;
      totalRecargo += recargoLinea;
    });

    const totalTrasDescuentosLinea = subtotal - descuentoTotal;
    const descuentoAgrupacionPct = albaran.descuentoAgrupacion || 0;
    const descuentoAgrupacionImporte = totalTrasDescuentosLinea * (descuentoAgrupacionPct / 100);
    const baseTrasAgrupacion = totalTrasDescuentosLinea - descuentoAgrupacionImporte;
    const total = baseTrasAgrupacion + totalIva + totalRecargo;

    const desgloseIvaArray = Object.values(desglosePorIva)
      .filter(d => d.baseImponible > 0)
      .sort((a, b) => a.porcentajeIva - b.porcentajeIva);

    return { subtotal, descuentoTotal, descuentoAgrupacionPct, descuentoAgrupacionImporte, totalIva, totalRecargo, baseTrasAgrupacion, total, desgloseIva: desgloseIvaArray };
  };

  const totales = calcularTotales();

  const aplicarAlphaColorFicha = (color, alpha = 0.2) => {
    if (!color || color === "transparent") return "transparent";
    if (color.startsWith("rgba")) {
      return color.replace(/rgba\(([^,]+),([^,]+),([^,]+),[^)]+\)/, `rgba($1,$2,$3,${alpha})`);
    }
    if (color.startsWith("#")) {
      let hex = color.slice(1);
      if (hex.length === 3) {
        hex = hex.split("").map((ch) => ch + ch).join("");
      }
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    return color;
  };

  const getColorEstado = (estado) => {
    if (!estado || !Array.isArray(estadoOptions)) return "transparent";
    const estadoObj = estadoOptions.find((e) => e.nombre === estado);
    if (!estadoObj) return "transparent";
    return modoVisual === "oscuro" ? estadoObj.colorOscuro : estadoObj.colorClaro;
  };

  const getEstadoBadgeStyle = (estado) =>
    buildBadgeStyle(getColorEstado(estado), modoVisual);
  const getLineaEstadoStyle = (estado) => {
    const base = getColorEstado(estado);
    if (!base || base === "transparent") return {};
    const alpha = modoVisual === "oscuro" ? 0.28 : 0.18;
    return {
      backgroundColor: aplicarAlphaColorFicha(base, alpha),
      borderLeft: `4px solid ${base}`,
    };
  };

  return (
    <div className="erp-form-view">
      {/* Botones de acción arriba */}
      <div className="erp-form-actions" style={{ marginBottom: '16px', paddingTop: 0 }}>
        <button type="button" className="erp-btn erp-btn-primary" onClick={() => abrirEditarAlbaran(albaran)}>
          <IconEdit className="erp-action-icon" /> Editar
        </button>
        <button type="button" className="erp-btn erp-btn-info" onClick={() => generarPdf(albaran.id)}>
          <IconPdf className="erp-action-icon" /> PDF
        </button>
        <button type="button" className="erp-btn erp-btn-secondary" onClick={() => abrirModalTransformar(albaran)}>
          <IconTransform className="erp-action-icon" /> Transformar
        </button>
        <button type="button" className="erp-btn erp-btn-secondary" onClick={() => abrirModalEmail(albaran)}>
          <IconEmail className="erp-action-icon" /> Email
        </button>
      </div>

      <div className="erp-form-content">
        <div className="erp-form-section">
          <div className="erp-form-group">
            <h4 className="erp-form-group-title">Datos del albarán</h4>
            <div className="erp-form-row erp-form-row-4">
              <label className="erp-field">
                <span className="erp-field-label">Número</span>
                <input type="text" className="erp-input-mono" value={albaran.numero || ''} disabled />
              </label>
              <label className="erp-field">
                <span className="erp-field-label">Fecha</span>
                <input type="date" className="erp-input-mono" value={formatearSoloFecha(albaran.fecha) || ''} disabled />
              </label>
              <label className="erp-field">
                <span className="erp-field-label">Cliente</span>
                <input type="text" value={cliente?.nombreComercial || 'Sin cliente'} disabled />
              </label>
              <label className="erp-field">
                <span className="erp-field-label">Estado</span>
                <input
                  type="text"
                  className="erp-input"
                  value={albaran.estado || ''}
                  disabled
                  style={{
                    textTransform: 'uppercase',
                    color: modoVisual === "oscuro" ? "#0f172a" : "#1f2937",
                    fontWeight: 600,
                    ...getLineaEstadoStyle(albaran.estado)
                  }}
                />
              </label>
            </div>

            {/* Serie, Tarifa y Almacén */}
            <div className="erp-form-row erp-form-row-3" style={{ marginTop: '12px' }}>
              <label className="erp-field">
                <span className="erp-field-label">Serie</span>
                <input type="text" value={albaran.serie?.prefijo || 'Sin serie'} disabled />
              </label>
              {albaran.tarifa && (
                <label className="erp-field">
                  <span className="erp-field-label">Tarifa</span>
                  <input type="text" value={albaran.tarifa?.nombre || '—'} disabled />
                </label>
              )}
              {!albaran.ventaMultialmacen && albaran.almacen && (
                <label className="erp-field">
                  <span className="erp-field-label">Almacén</span>
                  <input type="text" value={albaran.almacen?.nombre || '—'} disabled />
                </label>
              )}
              {albaran.ventaMultialmacen && (
                <label className="erp-field">
                  <span className="erp-field-label">Venta multialmacén</span>
                  <div style={{ padding: '8px 12px', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '4px', fontSize: '13px', color: '#0369a1' }}>
                    ✓ Almacenes por línea
                  </div>
                </label>
              )}
            </div>

            {/* Datos del cliente (snapshot histórico) */}
            {(albaran.clienteNombreComercial || cliente) && (
              <div style={{ 
                marginTop: '16px', 
                padding: '12px 16px', 
                backgroundColor: '#f8fafc', 
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                fontSize: '13px'
              }}>
                <div style={{ fontWeight: '600', marginBottom: '8px', color: '#475569' }}>
                  Datos del cliente (en el momento de creación)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px 24px' }}>
                  <div><span style={{ color: '#64748b' }}>Nombre comercial:</span> <strong>{albaran.clienteNombreComercial || cliente?.nombreComercial || '—'}</strong></div>
                  <div><span style={{ color: '#64748b' }}>Razón social:</span> {albaran.clienteNombreFiscal || cliente?.nombreFiscal || '—'}</div>
                  <div><span style={{ color: '#64748b' }}>CIF/NIF:</span> <span style={{ fontFamily: 'monospace' }}>{albaran.clienteNifCif || cliente?.nifCif || '—'}</span></div>
                  <div><span style={{ color: '#64748b' }}>Email:</span> {albaran.clienteEmail || cliente?.email || '—'}</div>
                  <div><span style={{ color: '#64748b' }}>Teléfono:</span> {albaran.clienteTelefono || cliente?.telefonoFijo || cliente?.telefonoMovil || '—'}</div>
                  {agrupacionCliente && (
                    <div><span style={{ color: '#64748b' }}>Agrupación:</span> <strong>{agrupacionCliente.nombre}</strong> (Dto. {agrupacionCliente.descuentoGeneral || 0}%)</div>
                  )}
                  {cliente?.recargoEquivalencia && (
                    <div><span style={{ color: '#64748b' }}>Recargo Eq.:</span> <span className="erp-badge erp-badge-warning">Sí</span></div>
                  )}
                </div>
              </div>
            )}

            {/* Direcciones: Facturación y Envío (snapshot histórico) */}
            <div className="erp-form-row erp-form-row-2" style={{ marginTop: '16px', gap: '16px' }}>
              {/* Dirección de facturación */}
              <div className="erp-field">
                <span className="erp-field-label">Dirección de facturación (en el momento de creación)</span>
                <div style={{ 
                  padding: '8px 12px', 
                  backgroundColor: '#f1f5f9', 
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  color: '#475569',
                  minHeight: '38px',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  {(() => {
                    const partes = [];
                    if (albaran.direccionFacturacionDireccion) partes.push(albaran.direccionFacturacionDireccion);
                    if (albaran.direccionFacturacionCodigoPostal) partes.push(albaran.direccionFacturacionCodigoPostal);
                    if (albaran.direccionFacturacionPoblacion) partes.push(albaran.direccionFacturacionPoblacion);
                    if (albaran.direccionFacturacionProvincia) partes.push(albaran.direccionFacturacionProvincia);
                    if (albaran.direccionFacturacionPais && albaran.direccionFacturacionPais !== 'España') partes.push(albaran.direccionFacturacionPais);
                    if (partes.length > 0) return partes.join(', ');
                    
                    // Fallback a direcciones actuales si no hay snapshot
                    if (direccionesCliente.length > 0) {
                      const dirFacturacion = direccionesCliente[0];
                      const partesFallback = [];
                      if (dirFacturacion.direccion) partesFallback.push(dirFacturacion.direccion);
                      if (dirFacturacion.codigoPostal) partesFallback.push(dirFacturacion.codigoPostal);
                      if (dirFacturacion.poblacion) partesFallback.push(dirFacturacion.poblacion);
                      if (dirFacturacion.provincia) partesFallback.push(dirFacturacion.provincia);
                      if (dirFacturacion.pais && dirFacturacion.pais !== 'España') partesFallback.push(dirFacturacion.pais);
                      return partesFallback.join(', ') || '—';
                    }
                    return '—';
                  })()}
                </div>
              </div>

              {/* Dirección de entrega */}
              <div className="erp-field">
                <span className="erp-field-label">Dirección de entrega (en el momento de creación)</span>
                <div style={{ 
                  padding: '8px 12px', 
                  backgroundColor: '#f1f5f9', 
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  color: '#475569',
                  minHeight: '38px',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  {(() => {
                    const partes = [];
                    if (albaran.direccionEnvioDireccion) partes.push(albaran.direccionEnvioDireccion);
                    if (albaran.direccionEnvioCodigoPostal) partes.push(albaran.direccionEnvioCodigoPostal);
                    if (albaran.direccionEnvioPoblacion) partes.push(albaran.direccionEnvioPoblacion);
                    if (albaran.direccionEnvioProvincia) partes.push(albaran.direccionEnvioProvincia);
                    if (albaran.direccionEnvioPais && albaran.direccionEnvioPais !== 'España') partes.push(albaran.direccionEnvioPais);
                    if (partes.length > 0) return partes.join(', ');
                    
                    // Fallback a dirección seleccionada o primera de envío
                    if (albaran.direccion) {
                      const dir = albaran.direccion;
                      const partesFallback = [];
                      if (dir.direccion) partesFallback.push(dir.direccion);
                      if (dir.codigoPostal) partesFallback.push(dir.codigoPostal);
                      if (dir.poblacion) partesFallback.push(dir.poblacion);
                      if (dir.provincia) partesFallback.push(dir.provincia);
                      if (dir.pais && dir.pais !== 'España') partesFallback.push(dir.pais);
                      return partesFallback.join(', ') || '—';
                    }
                    return direccionesCliente.length > 0 ? 'Misma que facturación' : '—';
                  })()}
                </div>
              </div>
            </div>

          </div>

          <div className="erp-form-group">
            <h4 className="erp-form-group-title" style={{ marginBottom: '12px' }}>Líneas de productos</h4>

            <table className="erp-table erp-table-compact">
              <thead>
                <tr>
                  <th style={{ width: albaran.ventaMultialmacen ? '7%' : '8%' }}>Referencia</th>
                  <th style={{ width: albaran.ventaMultialmacen ? '22%' : '30%' }}>Producto</th>
                  {albaran.ventaMultialmacen && (
                    <th style={{ width: '13%' }}>Almacén</th>
                  )}
                  <th style={{ width: '7%', textAlign: 'center' }}>Cant.</th>
                  <th style={{ width: albaran.ventaMultialmacen ? '11%' : '14%', textAlign: 'center' }}>Precio</th>
                  <th style={{ width: '7%', textAlign: 'center' }}>Dto. %</th>
                  <th style={{ width: '7%', textAlign: 'center' }}>IVA %</th>
                  <th style={{ width: '7%', textAlign: 'center' }}>Rec. %</th>
                  <th style={{ width: albaran.ventaMultialmacen ? '11%' : '18%', textAlign: 'center' }}>Base</th>
                  <th style={{ width: '4%' }}></th>
                </tr>
              </thead>
              <tbody>
                {(albaran.lineas || []).map((linea, index) => (
                  <tr key={index}>
                    <td className="erp-td-mono">{linea.producto?.referencia || '—'}</td>
                    <td>{linea.nombreProducto || linea.producto?.titulo || '—'}</td>
                    {albaran.ventaMultialmacen && (
                      <td style={{ fontSize: '12px' }}>{linea.almacen?.nombre || '—'}</td>
                    )}
                    <td className="erp-td-mono" style={{ textAlign: 'center' }}>{linea.cantidad}</td>
                    <td className="erp-td-mono" style={{ textAlign: 'center' }}>{(linea.precioUnitario || 0).toFixed(2)} €</td>
                    <td className="erp-td-mono" style={{ textAlign: 'center' }}>{linea.descuento || 0}%</td>
                    <td className="erp-td-mono" style={{ textAlign: 'center' }}>{linea.porcentajeIva || 0}%</td>
                    <td className="erp-td-mono" style={{ textAlign: 'center' }}>{(linea.porcentajeRecargo || 0).toFixed(1)}%</td>
                    <td className="erp-td-mono" style={{ textAlign: 'center' }}>
                      {((linea.cantidad || 0) * (linea.precioUnitario || 0) * (1 - (linea.descuento || 0) / 100)).toFixed(2)} €
                    </td>
                    <td></td>
                  </tr>
                ))}
                {(!albaran.lineas || albaran.lineas.length === 0) && (
                  <tr><td colSpan={albaran.ventaMultialmacen ? "10" : "9"} className="erp-td-empty">No hay líneas</td></tr>
                )}
              </tbody>
            </table>

            {/* Layout de dos columnas: desglose a la izquierda, totales a la derecha */}
            <div style={{ display: 'flex', gap: '24px', marginTop: '16px', justifyContent: 'flex-end' }}>
              {/* Desglose por tipo de IVA (tras descuentos) - solo si hay más de un tipo */}
              {totales.desgloseIva && totales.desgloseIva.length > 1 && (
                <div style={{ 
                  flex: '0 1 auto',
                  padding: '12px', 
                  backgroundColor: '#f8fafc', 
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '8px', color: '#475569' }}>
                    Desglose por tipo de IVA (tras descuentos)
                  </div>
                  <table style={{ fontSize: '12px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <th style={{ textAlign: 'left', padding: '4px 8px', fontWeight: '500' }}>Tipo IVA</th>
                        <th style={{ textAlign: 'right', padding: '4px 8px', fontWeight: '500' }}>Base antes dto</th>
                        <th style={{ textAlign: 'right', padding: '4px 8px', fontWeight: '500' }}>Dto. agr.</th>
                        <th style={{ textAlign: 'right', padding: '4px 8px', fontWeight: '500' }}>Base imp.</th>
                        <th style={{ textAlign: 'right', padding: '4px 8px', fontWeight: '500' }}>IVA</th>
                        {(totales.totalRecargo || 0) > 0 && (
                          <th style={{ textAlign: 'right', padding: '4px 8px', fontWeight: '500' }}>Recargo</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {totales.desgloseIva.map((desglose, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '4px 8px' }}>{desglose.porcentajeIva}%</td>
                          <td style={{ textAlign: 'right', padding: '4px 8px', fontFamily: 'monospace' }}>
                            {(desglose.baseAntesDescuento || 0).toFixed(2)} €
                          </td>
                          <td style={{ textAlign: 'right', padding: '4px 8px', fontFamily: 'monospace', color: '#dc2626' }}>
                            -{Math.abs(desglose.descuentoAgrupacionImporte || 0).toFixed(2)} €
                          </td>
                          <td style={{ textAlign: 'right', padding: '4px 8px', fontFamily: 'monospace' }}>
                            {desglose.baseImponible.toFixed(2)} €
                          </td>
                          <td style={{ textAlign: 'right', padding: '4px 8px', fontFamily: 'monospace' }}>
                            {desglose.importeIva.toFixed(2)} €
                          </td>
                          {(totales.totalRecargo || 0) > 0 && (
                            <td style={{ textAlign: 'right', padding: '4px 8px', fontFamily: 'monospace' }}>
                              {desglose.importeRecargo.toFixed(2)} €
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Totales a la derecha */}
              <div
                className="erp-totales-box"
                style={{ flex: '0 0 auto', minWidth: '320px' }}
                title="Los importes totales pueden variar ±0,01 € respecto al desglose por redondeos"
              >
                <div className="erp-total-row">
                  <span>Subtotal:</span>
                  <span className="erp-mono">{totales.subtotal.toFixed(2)} €</span>
                </div>
                {totales.descuentoTotal > 0 && (
                  <>
                    <div className="erp-total-row">
                      <span>Descuento líneas:</span>
                      <span className="erp-mono" style={{ color: '#dc2626' }}>-{totales.descuentoTotal.toFixed(2)} €</span>
                    </div>
                    <div className="erp-total-row">
                      <span>Base tras dto. líneas:</span>
                      <span className="erp-mono">{(totales.subtotal - totales.descuentoTotal).toFixed(2)} €</span>
                    </div>
                  </>
                )}
                {totales.descuentoAgrupacionPct > 0 && (
                  <div className="erp-total-row">
                    <span>Dto. agrup. ({totales.descuentoAgrupacionPct}%):</span>
                    <span className="erp-mono" style={{ color: '#dc2626' }}>-{totales.descuentoAgrupacionImporte.toFixed(2)} €</span>
                  </div>
                )}
                <div className="erp-total-row">
                  <span>Base imponible:</span>
                  <span className="erp-mono">{totales.baseTrasAgrupacion.toFixed(2)} €</span>
                </div>
                <div className="erp-total-row">
                  <span>
                    {totales.desgloseIva && totales.desgloseIva.length === 1 
                      ? `Total IVA (${totales.desgloseIva[0].porcentajeIva}%):`
                      : "Total IVA:"
                    }
                  </span>
                  <span className="erp-mono">{totales.totalIva.toFixed(2)} €</span>
                </div>
                {(totales.totalRecargo || 0) > 0 && (
                  <div className="erp-total-row">
                    <span>Total Recargo Eq.:</span>
                    <span className="erp-mono">{(totales.totalRecargo || 0).toFixed(2)} €</span>
                  </div>
                )}
                <div className="erp-total-row erp-total-final">
                  <span>TOTAL:</span>
                  <span className="erp-mono">{totales.total.toFixed(2)} €</span>
                </div>
              </div>
            </div>
          </div>

          {albaran.observaciones && (
            <div className="erp-form-group">
              <label className="erp-field erp-field-full">
                <span className="erp-field-label">Observaciones</span>
                <textarea rows="2" value={albaran.observaciones} disabled />
              </label>
            </div>
          )}

          {/* Notas internas y Adjuntos - solo si existen */}
          {(albaran.notas || albaran.adjuntos?.length > 0) && (
            <div className="erp-form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
              {albaran.notas && (
                <div className="erp-field">
                  <span className="erp-field-label">Notas internas (no se imprimen)</span>
                  <div style={{ 
                    backgroundColor: '#fffbeb', 
                    borderColor: '#fcd34d',
                    border: '1px solid #fcd34d',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    fontSize: '13px',
                    minHeight: '60px'
                  }}>
                    {albaran.notas}
                  </div>
                </div>
              )}
              
              {albaran.adjuntos?.length > 0 && (
                <div className="erp-field">
                  <span className="erp-field-label">Archivos adjuntos</span>
                  <div style={{ 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '6px', 
                    padding: '8px',
                    backgroundColor: '#f8fafc'
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {albaran.adjuntos.map((adj, idx) => (
                        <div 
                          key={idx} 
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '4px 8px',
                            backgroundColor: '#fff',
                            borderRadius: '4px',
                            border: '1px solid #e2e8f0',
                            fontSize: '12px'
                          }}
                        >
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <IconFile className="erp-action-icon" /> {adj.nombreOriginal || adj.nombre}
                          </span>
                          {adj.id && descargarAdjunto && (
                            <button
                              type="button"
                              className="erp-action-btn erp-action-info"
                              onClick={() => descargarAdjunto(adj)}
                              title="Descargar"
                              style={{ 
                                padding: '2px 6px', 
                                fontSize: '11px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <IconDownload className="erp-action-icon" style={{ width: 14, height: 14 }} /> Descargar
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Historial de transformaciones */}
        <HistorialTransformaciones
          historial={historialTransformaciones}
          tipoDocumento="ALBARAN"
          idDocumento={albaran.id}
          cargando={cargandoHistorial}
          abrirDocumento={async (tipo, id, numero) => {
            // Mapear tipo de documento a tipo de pestaña
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

      </div>
    </div>
  );
}

// ========== MODAL TRANSFORMAR ==========
export function ModalTransformar({
  modalTransformarAbierto,
  albaranParaTransformar,
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
  if (!modalTransformarAbierto || !albaranParaTransformar) return null;

  const opcionesTransformacion = [
    { tipo: 'DUPLICAR', label: 'Duplicar Albarán', icon: IconDuplicate, className: 'erp-btn-secondary' },
    { tipo: 'ALBARAN', label: 'Transformar a Albarán', icon: IconTransform, className: 'erp-btn-secondary' },
    { tipo: 'PEDIDO', label: 'Crear Pedido', icon: IconDocument, className: 'erp-btn-info' },
    { tipo: 'PRESUPUESTO', label: 'Crear Presupuesto', icon: IconDocument, className: 'erp-btn-secondary' },
    { tipo: 'FACTURA', label: 'Crear Factura', icon: IconDocument, className: 'erp-btn-primary' },
    { tipo: 'FACTURA_PROFORMA', label: 'Crear Factura Proforma', icon: IconPdf, className: 'erp-btn-info' },
    { tipo: 'FACTURA_RECTIFICATIVA', label: 'Crear Factura Rectificativa', icon: IconTransform, className: 'erp-btn-warning' },
    { tipo: 'PRESUPUESTO_COMPRA', label: 'Crear Presupuesto Compra', icon: IconDocument, className: 'erp-btn-info' },
    { tipo: 'PEDIDO_COMPRA', label: 'Crear Pedido Compra', icon: IconDocument, className: 'erp-btn-info' },
    { tipo: 'ALBARAN_COMPRA', label: 'Crear Albarán Compra', icon: IconDocument, className: 'erp-btn-info' },
    { tipo: 'FACTURA_COMPRA', label: 'Crear Factura Compra', icon: IconDocument, className: 'erp-btn-success' },
  ];

  return (
    <div className="erp-modal-overlay" onClick={cerrarModalTransformar}>
      <div className="erp-modal" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '90vh', overflow: 'auto' }}>
        <div className="erp-modal-header">
          <h3>Transformar Albarán {albaranParaTransformar.numero}</h3>
          <button className="erp-modal-close" onClick={cerrarModalTransformar}>×</button>
        </div>
        <div className="erp-modal-body">
          {!tipoTransformacionSeleccionado ? (
            <>
              <p style={{ marginBottom: '20px', color: '#6b7280' }}>
                Selecciona qué acción deseas realizar con este albarán:
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
                  <span className="erp-field-label">Fecha y hora</span>
                  <input
                    type="datetime-local"
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

// ========== MODAL EMAIL ==========
export function ModalEmail({
  modalEmailAbierto,
  albaranParaEmail,
  emailDestinatario,
  setEmailDestinatario,
  emailAsunto,
  setEmailAsunto,
  emailCuerpo,
  setEmailCuerpo,
  cerrarModalEmail,
  enviarEmail,
}) {
  if (!modalEmailAbierto || !albaranParaEmail) return null;

  return (
    <div className="erp-modal-overlay" onClick={cerrarModalEmail}>
      <div className="erp-modal erp-modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="erp-modal-header">
          <h3>Enviar Albarán {albaranParaEmail.numero} por Email</h3>
          <button className="erp-modal-close" onClick={cerrarModalEmail}>×</button>
        </div>
        <div className="erp-modal-body">
          <div className="erp-form-group">
            <label className="erp-field">
              <span className="erp-field-label">Destinatario *</span>
              <input
                type="email"
                value={emailDestinatario}
                onChange={(e) => setEmailDestinatario(e.target.value)}
                placeholder="email@ejemplo.com"
                required
              />
            </label>
            <label className="erp-field">
              <span className="erp-field-label">Asunto</span>
              <input
                type="text"
                value={emailAsunto}
                onChange={(e) => setEmailAsunto(e.target.value)}
              />
            </label>
            <label className="erp-field erp-field-full">
              <span className="erp-field-label">Mensaje</span>
              <textarea
                rows="5"
                value={emailCuerpo}
                onChange={(e) => setEmailCuerpo(e.target.value)}
              />
            </label>
          </div>
        </div>
        <div className="erp-modal-footer">
          <button className="erp-btn erp-btn-primary" onClick={enviarEmail}>
            <IconEmail className="erp-action-icon" /> Enviar Email
          </button>
          <button className="erp-btn erp-btn-secondary" onClick={cerrarModalEmail}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

// ========== MODAL PDF MÚLTIPLE ==========
export function ModalPdfMultiple({
  modalPdfMultipleAbierto,
  albaranesSeleccionados,
  tipoPdfMultiple,
  setTipoPdfMultiple,
  cerrarModalPdfMultiple,
  generarPdfMultiple,
}) {
  if (!modalPdfMultipleAbierto) return null;

  return (
    <div className="erp-modal-overlay" onClick={cerrarModalPdfMultiple}>
      <div className="erp-modal" onClick={(e) => e.stopPropagation()}>
        <div className="erp-modal-header">
          <h3>Generar PDFs ({albaranesSeleccionados.length} albaranes)</h3>
          <button className="erp-modal-close" onClick={cerrarModalPdfMultiple}>×</button>
        </div>
        <div className="erp-modal-body">
          <div className="erp-form-group">
            <label className="erp-field">
              <span className="erp-field-label">Tipo de generación</span>
              <select
                value={tipoPdfMultiple}
                onChange={(e) => setTipoPdfMultiple(e.target.value)}
              >
                <option value="individual">PDFs individuales (un archivo por albarán)</option>
                <option value="combinado">PDF combinado (todos en un archivo)</option>
              </select>
            </label>
          </div>
        </div>
        <div className="erp-modal-footer">
          <button className="erp-btn erp-btn-primary" onClick={generarPdfMultiple}>
            <IconPdf className="erp-action-icon" /> Generar PDFs
          </button>
          <button className="erp-btn erp-btn-secondary" onClick={cerrarModalPdfMultiple}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
