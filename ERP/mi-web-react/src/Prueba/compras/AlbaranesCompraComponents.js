import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useAlbaranesCompraForm } from './useAlbaranesCompraForm';
import { FichaAlbaranCompra } from './FichaAlbaranCompra';
import { FormularioAlbaran } from '../ventas/AlbaranesComponents';
import { ModalTransformarCompra } from './ModalTransformarCompra';
import { ModalHistorialTransformaciones } from '../ventas/ModalHistorialTransformaciones';
import {
  IconEye,
  IconEdit,
  IconDelete,
  IconPdf,
  IconCsv,
  IconRefresh,
  IconSearch,
  IconTransform,
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

const formatearSoloFecha = (fechaConHora) => {
  if (!fechaConHora) return '';
  if (fechaConHora.length === 10 && fechaConHora.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return fechaConHora;
  }
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
    padding: "4px 10px",
    borderRadius: "4px",
    fontSize: "13px",
    fontWeight: "500",
    display: "inline-block",
  };
};

export const ListaAlbaranesCompra = ({
  albaranesCompra,
  series,
  estadoOptions,
  onNuevo,
  onEditar,
  onVer,
  eliminarAlbaranCompra,
  cargarAlbaranesCompra,
  loading,
  modoVisual = 'claro',
}) => {
  // Hook para acceder a funciones de historial
  const albaranesCompraModule = useAlbaranesCompraForm();
  const { abrirModalHistorialDocumento, modalHistorialAbierto, cerrarModalHistorial, documentoHistorial, historialModal, cargandoHistorialModal } = albaranesCompraModule;
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroFechaDesde, setFiltroFechaDesde] = useState('');
  const [filtroFechaHasta, setFiltroFechaHasta] = useState('');
  const [filtroSerieId, setFiltroSerieId] = useState('');
  const [filtroNumero, setFiltroNumero] = useState('');
  const [filtroImporteMin, setFiltroImporteMin] = useState('');
  const [filtroImporteMax, setFiltroImporteMax] = useState('');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [albaranesSeleccionados, setAlbaranesSeleccionados] = useState([]);
  const [paginaActual, setPaginaActual] = useState(0);
  const [itemsPorPagina, setItemsPorPagina] = useState(20);
  const [ordenarPor, setOrdenarPor] = useState('fecha');
  const [ordenDireccion, setOrdenDireccion] = useState('desc');
  const [modalTransformarAbierto, setModalTransformarAbierto] = useState(false);
  const [albaranParaTransformar, setAlbaranParaTransformar] = useState(null);

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

  const limpiarFiltros = () => {
    setFiltroEstado('');
    setFiltroFechaDesde('');
    setFiltroFechaHasta('');
    setFiltroSerieId('');
    setFiltroNumero('');
    setFiltroImporteMin('');
    setFiltroImporteMax('');
    setPaginaActual(0);
  };

  const normalizarImporte = (valor) => {
    if (valor === '' || valor === null || valor === undefined) return null;
    const numero = parseFloat(valor);
    return Number.isNaN(numero) ? null : numero;
  };

  const filtrarPorFecha = (valor, desde, hasta) => {
    if (!valor) return true;
    const fecha = new Date(valor);
    if (desde && fecha < new Date(desde)) return false;
    if (hasta && fecha > new Date(hasta)) return false;
    return true;
  };

  const albaranesFiltrados = useMemo(() => {
    const importeMin = normalizarImporte(filtroImporteMin);
    const importeMax = normalizarImporte(filtroImporteMax);

    return albaranesCompra.filter((albaran) => {
      const texto = `${albaran.numero || ''} ${albaran.proveedorNombreComercial || albaran.proveedor?.nombreComercial || ''}`.toLowerCase();
      if (busqueda && !texto.includes(busqueda.toLowerCase())) return false;
      if (filtroEstado && albaran.estado !== filtroEstado) return false;
      if (!filtrarPorFecha(albaran.fecha, filtroFechaDesde, filtroFechaHasta)) return false;
      const serieId = albaran.serie?.id?.toString() || albaran.serieId?.toString();
      if (filtroSerieId && serieId !== filtroSerieId) return false;
      if (filtroNumero && !(albaran.numero || '').includes(filtroNumero)) return false;
      const total = albaran.total ?? 0;
      if (importeMin !== null && total < importeMin) return false;
      if (importeMax !== null && total > importeMax) return false;
      return true;
    });
  }, [busqueda, filtroEstado, filtroFechaDesde, filtroFechaHasta, filtroSerieId, filtroNumero, filtroImporteMin, filtroImporteMax, albaranesCompra]);

  const obtenerValorOrden = (albaran, campo) => {
    switch (campo) {
      case 'numero':
        return albaran.numero || '';
      case 'fecha':
        return new Date(albaran.fecha || 0).getTime();
      case 'proveedor':
        return albaran.proveedorNombreComercial || albaran.proveedor?.nombreComercial || '';
      case 'estado':
        return albaran.estado || '';
      case 'base':
        return albaran.totalBaseSinImpuestos ?? albaran.subtotal ?? 0;
      case 'iva':
        return albaran.totalIva ?? 0;
      case 'recargo':
        return albaran.totalRecargo ?? 0;
      case 'total':
        return albaran.total ?? 0;
      default:
        return albaran.id;
    }
  };

  const albaranesOrdenados = useMemo(() => {
    const datos = [...albaranesFiltrados];
    datos.sort((a, b) => {
      const valorA = obtenerValorOrden(a, ordenarPor);
      const valorB = obtenerValorOrden(b, ordenarPor);
      if (valorA < valorB) return ordenarPor === 'fecha' ? (ordenDireccion === 'asc' ? -1 : 1) : (ordenDireccion === 'asc' ? -1 : 1);
      if (valorA > valorB) return ordenarPor === 'fecha' ? (ordenDireccion === 'asc' ? 1 : -1) : (ordenDireccion === 'asc' ? 1 : -1);
      return 0;
    });
    return datos;
  }, [albaranesFiltrados, ordenarPor, ordenDireccion]);

  const totalElementos = albaranesOrdenados.length;
  const totalPaginas = Math.max(1, Math.ceil(totalElementos / itemsPorPagina));
  const paginaSeguro = Math.min(paginaActual, totalPaginas - 1);
  if (paginaSeguro !== paginaActual) {
    setPaginaActual(paginaSeguro);
  }
  const indiceInicio = paginaSeguro * itemsPorPagina;
  const albaranesPagina = albaranesOrdenados.slice(indiceInicio, indiceInicio + itemsPorPagina);

  const seleccionarTodos = albaranesSeleccionados.length === albaranesOrdenados.length && albaranesOrdenados.length > 0;

  const toggleSeleccionarTodos = () => {
    if (seleccionarTodos) {
      setAlbaranesSeleccionados([]);
    } else {
      setAlbaranesSeleccionados(albaranesOrdenados.map((a) => a.id));
    }
  };

  const toggleSeleccionAlbaran = (id) => {
    setAlbaranesSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const getColorEstado = (estado) => {
    if (!estado || !Array.isArray(estadoOptions)) return 'transparent';
    const estadoObj = estadoOptions.find((e) => e.nombre === estado);
    if (!estadoObj) return 'transparent';
    return modoVisual === 'oscuro' ? estadoObj.colorOscuro : estadoObj.colorClaro;
  };

  const getEstadoBadgeStyle = (estado) => buildBadgeStyle(getColorEstado(estado), modoVisual);

  const parseColorToRGB = (color) => {
    if (!color) return null;
    const value = color.trim();
    if (value.startsWith("#")) {
      let hex = value.slice(1);
      if (hex.length === 3) {
        hex = hex.split("").map((ch) => ch + ch).join("");
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

  const handleEliminar = async (id) => {
    if (window.confirm('¿Eliminar este albarán de compra?')) {
      await eliminarAlbaranCompra(id);
      setAlbaranesSeleccionados((prev) => prev.filter((item) => item !== id));
    }
  };

  const abrirModalTransformar = (albaran) => {
    setAlbaranParaTransformar(albaran);
    setModalTransformarAbierto(true);
  };

  const cerrarModalTransformar = () => {
    setModalTransformarAbierto(false);
    setAlbaranParaTransformar(null);
  };

  const eliminarSeleccionados = async () => {
    if (albaranesSeleccionados.length === 0) return;
    if (window.confirm(`¿Eliminar ${albaranesSeleccionados.length} albarán(es)?`)) {
      for (const id of albaranesSeleccionados) {
        await eliminarAlbaranCompra(id);
      }
      setAlbaranesSeleccionados([]);
    }
  };

  const exportarExcelCsv = () => {
    if (albaranesSeleccionados.length === 0) return;
    alert('Exportar a Excel estará disponible próximamente.');
  };

  const generarPdfMultiple = () => {
    if (albaranesSeleccionados.length === 0) return;
    alert('Generación de PDF múltiple estará disponible próximamente.');
  };

  const resumenTotales = useMemo(() => {
    return albaranesOrdenados.reduce(
      (acc, albaran) => {
        const base = albaran.totalBaseSinImpuestos ?? albaran.subtotal ?? 0;
        const iva = albaran.totalIva ?? 0;
        const recargo = albaran.totalRecargo ?? 0;
        const total = albaran.total ?? 0;
        acc.base += base;
        acc.iva += iva;
        acc.recargo += recargo;
        acc.total += total;
        return acc;
      },
      { base: 0, iva: 0, recargo: 0, total: 0 }
    );
  }, [albaranesOrdenados]);

  const formatearMoneda = (valor) => {
    return (Number(valor) || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const cambiarOrdenacion = (campo) => {
    if (ordenarPor === campo) {
      setOrdenDireccion(ordenDireccion === 'asc' ? 'desc' : 'asc');
    } else {
      setOrdenarPor(campo);
      setOrdenDireccion('desc');
    }
  };

  if (loading) {
    return <div className="erp-empty-state">Cargando albaranes de compra...</div>;
  }

  return (
    <div className="erp-list-view">
      <div className="erp-list-toolbar">
        <button className="erp-btn erp-btn-primary" onClick={onNuevo}>+ Nuevo albarán de compra</button>
        <button className="erp-btn erp-btn-info" onClick={generarPdfMultiple} disabled={albaranesSeleccionados.length === 0}>
          <IconPdf className="erp-action-icon" /> PDF ({albaranesSeleccionados.length})
        </button>
        <button className="erp-btn erp-btn-secondary" onClick={exportarExcelCsv} disabled={albaranesSeleccionados.length === 0}>
          <IconCsv className="erp-action-icon" /> Excel ({albaranesSeleccionados.length})
        </button>
        <button className="erp-btn erp-btn-danger" onClick={eliminarSeleccionados} disabled={albaranesSeleccionados.length === 0}>
          <IconDelete className="erp-action-icon" /> Eliminar ({albaranesSeleccionados.length})
        </button>
      </div>

      <div className="erp-filters-bar">
        <div className="erp-search-row">
          <input
            type="text"
            className="erp-search-input"
            placeholder="Buscar por número o proveedor..."
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPaginaActual(0);
            }}
          />
          <button
            className={`erp-btn ${contarFiltrosActivos() > 0 ? 'erp-btn-primary' : 'erp-btn-secondary'}`}
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
          >
            <IconSearch className="erp-action-icon" /> Filtros {contarFiltrosActivos() > 0 && `(${contarFiltrosActivos()})`}
          </button>
          {contarFiltrosActivos() > 0 && (
            <button className="erp-btn erp-btn-danger" onClick={limpiarFiltros}>
              Limpiar filtros
            </button>
          )}
          <button className="erp-btn erp-btn-secondary" onClick={cargarAlbaranesCompra}>
            <IconRefresh className="erp-action-icon" /> Actualizar
          </button>
        </div>

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
                  {estadoOptions.map((estado) => (
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
                  {series?.map((serie) => (
                    <option key={serie.id} value={serie.id.toString()}>{serie.prefijo} — {serie.descripcion || 'Sin descripción'}</option>
                  ))}
                </select>
              </label>
              <label className="erp-field">
                <span className="erp-field-label">Número contiene</span>
                <input
                  type="text"
                  className="erp-input-mono"
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

        <div className="erp-results-info">
          <span>
            Mostrando {albaranesPagina.length} albaranes (Filtrados: {albaranesOrdenados.length})
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

      {albaranesOrdenados.length === 0 ? (
        <div className="erp-empty-state">
          <div className="erp-empty-icon">📄</div>
          <h3>No hay albaranes de compra con los filtros aplicados</h3>
        </div>
      ) : (
        <>
          <table className="erp-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>
                  <input type="checkbox" checked={seleccionarTodos} onChange={toggleSeleccionarTodos} />
                </th>
                <th onClick={() => cambiarOrdenacion('numero')} style={{ cursor: 'pointer' }}>
                  Número {ordenarPor === 'numero' && (ordenDireccion === 'asc' ? '▲' : '▼')}
                </th>
                <th onClick={() => cambiarOrdenacion('fecha')} style={{ cursor: 'pointer' }}>
                  Fecha {ordenarPor === 'fecha' && (ordenDireccion === 'asc' ? '▲' : '▼')}
                </th>
                <th onClick={() => cambiarOrdenacion('proveedor')} style={{ cursor: 'pointer' }}>
                  Proveedor {ordenarPor === 'proveedor' && (ordenDireccion === 'asc' ? '▲' : '▼')}
                </th>
                <th>Origen</th>
                <th className="erp-th-right" onClick={() => cambiarOrdenacion('base')} style={{ cursor: 'pointer' }}>
                  Base {ordenarPor === 'base' && (ordenDireccion === 'asc' ? '▲' : '▼')}
                </th>
                <th className="erp-th-right" onClick={() => cambiarOrdenacion('iva')} style={{ cursor: 'pointer' }}>
                  IVA {ordenarPor === 'iva' && (ordenDireccion === 'asc' ? '▲' : '▼')}
                </th>
                <th className="erp-th-right" onClick={() => cambiarOrdenacion('recargo')} style={{ cursor: 'pointer' }}>
                  Rec. Eq. {ordenarPor === 'recargo' && (ordenDireccion === 'asc' ? '▲' : '▼')}
                </th>
                <th className="erp-th-right" onClick={() => cambiarOrdenacion('total')} style={{ cursor: 'pointer' }}>
                  Total {ordenarPor === 'total' && (ordenDireccion === 'asc' ? '▲' : '▼')}
                </th>
                <th onClick={() => cambiarOrdenacion('estado')} style={{ cursor: 'pointer' }}>
                  Estado {ordenarPor === 'estado' && (ordenDireccion === 'asc' ? '▲' : '▼')}
                </th>
                <th className="erp-th-actions">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {albaranesPagina.map((albaran) => {
                const base = albaran.totalBaseSinImpuestos ?? albaran.subtotal ?? 0;
                const iva = albaran.totalIva ?? 0;
                const recargo = albaran.totalRecargo ?? 0;
                const total = albaran.total ?? 0;
                const proveedor = albaran.proveedorNombreComercial || albaran.proveedor?.nombreComercial || '—';
                const origen = albaran.origen || albaran.documentoOrigen || 'MANUAL';
                return (
                  <tr 
                    key={albaran.id} 
                    className={albaranesSeleccionados.includes(albaran.id) ? 'erp-row-selected' : ''}
                    style={getLineaEstadoStyle(albaran.estado)}
                  >
                    <td>
                      <input
                        type="checkbox"
                        checked={albaranesSeleccionados.includes(albaran.id)}
                        onChange={() => toggleSeleccionAlbaran(albaran.id)}
                      />
                    </td>
                    <td className="erp-td-numero">{albaran.numero}</td>
                    <td>{formatearSoloFecha(albaran.fecha)}</td>
                    <td>{proveedor}</td>
                    <td>
                      <span 
                        className="erp-badge erp-badge-info"
                        style={{ cursor: 'pointer' }}
                        onClick={() => abrirModalHistorialDocumento && abrirModalHistorialDocumento(albaran)}
                        title="Ver historial"
                      >
                        {albaran.origen || albaran.documentoOrigen || 'Manual'}
                      </span>
                    </td>
                    <td className="erp-td-right">{formatearMoneda(base)} €</td>
                    <td className="erp-td-right">{formatearMoneda(iva)} €</td>
                    <td className="erp-td-right">{formatearMoneda(recargo)} €</td>
                    <td className="erp-td-right">{formatearMoneda(total)} €</td>
                    <td>
                      <span className="erp-badge" style={getEstadoBadgeStyle(albaran.estado)}>{albaran.estado}</span>
                    </td>
                    <td className="erp-td-actions">
                      {onVer && (
                        <button className="erp-action-btn" onClick={() => onVer(albaran)} title="Ver">
                          <IconEye className="erp-action-icon" />
                        </button>
                      )}
                      <button className="erp-action-btn" onClick={() => onEditar(albaran)} title="Editar">
                        <IconEdit className="erp-action-icon" />
                      </button>
                      <button className="erp-action-btn" onClick={() => abrirModalTransformar(albaran)} title="Transformar">
                        <IconTransform className="erp-action-icon" />
                      </button>
                      <button className="erp-action-btn erp-action-btn-danger" onClick={() => handleEliminar(albaran.id)} title="Eliminar">
                        <IconDelete className="erp-action-icon" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

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
              Base: <span style={{ fontFamily: 'monospace', fontSize: '15px' }}>{resumenTotales.base.toFixed(2)} €</span>
            </div>
            <div>
              IVA: <span style={{ fontFamily: 'monospace', fontSize: '15px' }}>{resumenTotales.iva.toFixed(2)} €</span>
            </div>
            <div>
              Rec. Eq.: <span style={{ fontFamily: 'monospace', fontSize: '15px' }}>{(resumenTotales.recargo || 0).toFixed(2)} €</span>
            </div>
            <div>
              Total: <span style={{ fontFamily: 'monospace', fontSize: '15px' }}>{resumenTotales.total.toFixed(2)} €</span>
            </div>
          </div>

          <div className="erp-pagination">
            <button className="erp-btn erp-btn-secondary" onClick={() => setPaginaActual((prev) => Math.max(0, prev - 1))} disabled={paginaSeguro === 0}>
              ← Anterior
            </button>
            <span>Página {paginaSeguro + 1} de {totalPaginas}</span>
            <button className="erp-btn erp-btn-secondary" onClick={() => setPaginaActual((prev) => Math.min(totalPaginas - 1, prev + 1))} disabled={paginaSeguro >= totalPaginas - 1}>
              Siguiente →
            </button>
          </div>
        </>
      )}
      <ModalTransformarCompra
        abierto={modalTransformarAbierto}
        cerrar={cerrarModalTransformar}
        documento={albaranParaTransformar}
        tipoDocumentoActual="ALBARAN_COMPRA"
        estadoOptions={estadoOptions}
        onTransformacionCompletada={() => {
          cerrarModalTransformar();
          cargarAlbaranesCompra();
        }}
      />
      <ModalHistorialTransformaciones
        modalAbierto={modalHistorialAbierto}
        cerrarModal={cerrarModalHistorial}
        documento={documentoHistorial ? { ...documentoHistorial, tipo: 'ALBARAN_COMPRA' } : null}
        historial={historialModal}
        cargando={cargandoHistorialModal}
      />
    </div>
  );
};

export const FormularioAlbaranCompra = ({ cerrarPestana, pestanaActiva, albaranId }) => {
  const albaranesCompraModule = useAlbaranesCompraForm(pestanaActiva);

  useEffect(() => {
    if (albaranId) {
      albaranesCompraModule.cargarAlbaranCompra(albaranId);
    }
  }, [albaranId]);

  const formAdaptado = useMemo(() => ({
    ...albaranesCompraModule.formAlbaranCompra,
    clienteId: albaranesCompraModule.formAlbaranCompra.proveedorId || "",
  }), [albaranesCompraModule.formAlbaranCompra]);

  const updateFieldAdaptado = useCallback((field, value) => {
    if (field === "clienteId") {
      albaranesCompraModule.updateFormAlbaranCompraField("proveedorId", value);
    } else {
      albaranesCompraModule.updateFormAlbaranCompraField(field, value);
    }
  }, [albaranesCompraModule]);

  // Función para manejar el guardado con confirmación de stock
  const handleGuardar = useCallback((e, opciones) => {
    albaranesCompraModule.confirmarGuardarConStock(e, opciones);
  }, [albaranesCompraModule]);

  return (
    <>
      <FormularioAlbaran
        formAlbaran={formAdaptado}
        clientes={albaranesCompraModule.proveedores}
        productos={albaranesCompraModule.productos}
        tiposIva={albaranesCompraModule.tiposIva}
        seriesDisponibles={albaranesCompraModule.series}
        estadoOptions={albaranesCompraModule.estadoOptions}
        updateFormAlbaranField={updateFieldAdaptado}
        setDireccionSnapshot={albaranesCompraModule.setDireccionSnapshot}
        updateDireccionSnapshotField={albaranesCompraModule.updateDireccionSnapshotField}
        agregarLinea={albaranesCompraModule.agregarLinea}
        eliminarLinea={albaranesCompraModule.eliminarLinea}
        actualizarLinea={albaranesCompraModule.actualizarLinea}
        calcularTotales={albaranesCompraModule.calcularTotales}
        guardarAlbaran={handleGuardar}
        cerrarPestana={cerrarPestana}
        pestanaActiva={pestanaActiva}
        almacenes={albaranesCompraModule.almacenes}
        tipoDocumento="albaran-compra"
        esCompra={true}
        mostrarSelectorAlmacen={albaranesCompraModule.mostrarSelectorAlmacen}
        permitirVentaMultialmacen={albaranesCompraModule.permitirCompraMultialmacen}
        generarNumeroAutomatico={albaranesCompraModule.generarNumeroAutomatico}
        generandoNumero={albaranesCompraModule.generandoNumero}
        subirAdjunto={albaranesCompraModule.subirAdjunto}
        eliminarAdjunto={albaranesCompraModule.eliminarAdjunto}
        descargarAdjunto={albaranesCompraModule.descargarAdjunto}
        tarifasAlbaran={albaranesCompraModule.tarifasPedidoCompra ? {
          ...albaranesCompraModule.tarifasPedidoCompra,
          cambiarTarifa: albaranesCompraModule.cambiarTarifaFormulario,
          recalcularPreciosLineas: albaranesCompraModule.recalcularPreciosLineas
        } : null}
      />
      
      {/* Modal de confirmación para incremento de stock */}
      {albaranesCompraModule.mostrarConfirmacionStock && (
        <div className="erp-modal-overlay">
          <div className="erp-modal">
            <div className="erp-modal-header">
              <h3>Confirmar cambio de stock</h3>
            </div>
            <div className="erp-modal-body">
              <p>Este albarán <strong>incrementará el stock</strong> al pasar a estado &quot;Emitido&quot;.</p>
              <p>¿Desea continuar?</p>
            </div>
            <div className="erp-modal-footer">
              <button 
                className="erp-btn erp-btn-secondary" 
                onClick={() => albaranesCompraModule.handleConfirmarIncremento(false)}
              >
                Cancelar
              </button>
              <button 
                className="erp-btn erp-btn-primary" 
                onClick={() => albaranesCompraModule.handleConfirmarIncremento(true)}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de confirmación para restauración de stock */}
      {albaranesCompraModule.mostrarConfirmacionRestaurar && (
        <div className="erp-modal-overlay">
          <div className="erp-modal">
            <div className="erp-modal-header">
              <h3>Confirmar restauración de stock</h3>
            </div>
            <div className="erp-modal-body">
              <p>Este albarán <strong>restará el stock previamente incrementado</strong> al cambiar de estado.</p>
              <p>¿Desea continuar?</p>
            </div>
            <div className="erp-modal-footer">
              <button 
                className="erp-btn erp-btn-secondary" 
                onClick={() => albaranesCompraModule.handleConfirmarRestauracion(false)}
              >
                Cancelar
              </button>
              <button 
                className="erp-btn erp-btn-primary" 
                onClick={() => albaranesCompraModule.handleConfirmarRestauracion(true)}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const VerAlbaranCompra = ({ cerrarPestana, pestanaActiva, albaranId }) => {
  const albaranesCompraModule = useAlbaranesCompraForm(pestanaActiva);

  return (
    <FichaAlbaranCompra
      albaranesCompra={albaranesCompraModule.albaranesCompra}
      albaranId={albaranId}
      abrirEditarAlbaran={(albaran) => {
        if (window.abrirPestana) {
          window.abrirPestana('albaran-compra-editar', albaran.id, `Albarán ${albaran.numero}`);
        }
      }}
      estadoOptions={albaranesCompraModule.estadoOptions}
      descargarAdjunto={albaranesCompraModule.descargarAdjunto}
      cargarHistorialTransformaciones={albaranesCompraModule.cargarHistorialTransformaciones}
    />
  );
};
