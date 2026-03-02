import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { usePedidosCompraForm } from './usePedidosCompraForm';
import { FormularioAlbaran } from '../ventas/AlbaranesComponents';
import { TarifaSelector } from '../ventas/TarifaSelector';
import { ModalTransformarCompra } from './ModalTransformarCompra';
import { ModalHistorialTransformaciones } from '../ventas/ModalHistorialTransformaciones';
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

export const PedidosCompraListado = ({ onEditar, onNuevo, onVer, modoVisual = "claro" }) => {
  const {
    pedidosCompra,
    loading,
    estadoOptions,
    eliminarPedidoCompra,
    series,
    cargarPedidosCompra,
    // Modal historial
    abrirModalHistorialDocumento,
    modalHistorialAbierto,
    cerrarModalHistorial,
    documentoHistorial,
    historialModal,
    cargandoHistorialModal,
  } = usePedidosCompraForm();

  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroFechaDesde, setFiltroFechaDesde] = useState('');
  const [filtroFechaHasta, setFiltroFechaHasta] = useState('');
  const [filtroSerieId, setFiltroSerieId] = useState('');
  const [filtroNumero, setFiltroNumero] = useState('');
  const [filtroImporteMin, setFiltroImporteMin] = useState('');
  const [filtroImporteMax, setFiltroImporteMax] = useState('');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [pedidosSeleccionados, setPedidosSeleccionados] = useState([]);
  const [paginaActual, setPaginaActual] = useState(0);
  const [itemsPorPagina, setItemsPorPagina] = useState(20);
  const [ordenarPor, setOrdenarPor] = useState('fecha');
  const [ordenDireccion, setOrdenDireccion] = useState('desc');
  const [modalTransformarAbierto, setModalTransformarAbierto] = useState(false);
  const [pedidoParaTransformar, setPedidoParaTransformar] = useState(null);

  const abrirModalTransformar = (pedido) => {
    setPedidoParaTransformar(pedido);
    setModalTransformarAbierto(true);
  };

  const cerrarModalTransformar = () => {
    setModalTransformarAbierto(false);
    setPedidoParaTransformar(null);
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

  const pedidosFiltrados = useMemo(() => {
    const importeMin = normalizarImporte(filtroImporteMin);
    const importeMax = normalizarImporte(filtroImporteMax);

    return pedidosCompra.filter((pedido) => {
      const texto = `${pedido.numero || ''} ${pedido.proveedorNombreComercial || pedido.proveedor?.nombreComercial || ''}`.toLowerCase();
      if (busqueda && !texto.includes(busqueda.toLowerCase())) return false;
      if (filtroEstado && pedido.estado !== filtroEstado) return false;
      if (!filtrarPorFecha(pedido.fecha, filtroFechaDesde, filtroFechaHasta)) return false;
      const serieId = pedido.serie?.id?.toString() || pedido.serieId?.toString();
      if (filtroSerieId && serieId !== filtroSerieId) return false;
      if (filtroNumero && !(pedido.numero || '').includes(filtroNumero)) return false;
      const total = pedido.total ?? 0;
      if (importeMin !== null && total < importeMin) return false;
      if (importeMax !== null && total > importeMax) return false;
      return true;
    });
  }, [busqueda, filtroEstado, filtroFechaDesde, filtroFechaHasta, filtroSerieId, filtroNumero, filtroImporteMin, filtroImporteMax, pedidosCompra]);

  const obtenerValorOrden = (pedido, campo) => {
    switch (campo) {
      case 'numero':
        return pedido.numero || '';
      case 'fecha':
        return new Date(pedido.fecha || 0).getTime();
      case 'proveedor':
        return pedido.proveedorNombreComercial || pedido.proveedor?.nombreComercial || '';
      case 'estado':
        return pedido.estado || '';
      case 'base':
        return pedido.totalBaseSinImpuestos ?? pedido.subtotal ?? 0;
      case 'iva':
        return pedido.totalIva ?? 0;
      case 'recargo':
        return pedido.totalRecargo ?? 0;
      case 'total':
        return pedido.total ?? 0;
      default:
        return pedido.id;
    }
  };

  const pedidosOrdenados = useMemo(() => {
    const datos = [...pedidosFiltrados];
    datos.sort((a, b) => {
      const valorA = obtenerValorOrden(a, ordenarPor);
      const valorB = obtenerValorOrden(b, ordenarPor);
      if (valorA < valorB) return ordenarPor === 'fecha' ? (ordenDireccion === 'asc' ? -1 : 1) : (ordenDireccion === 'asc' ? -1 : 1);
      if (valorA > valorB) return ordenarPor === 'fecha' ? (ordenDireccion === 'asc' ? 1 : -1) : (ordenDireccion === 'asc' ? 1 : -1);
      return 0;
    });
    return datos;
  }, [pedidosFiltrados, ordenarPor, ordenDireccion]);

  const totalElementos = pedidosOrdenados.length;
  const totalPaginas = Math.max(1, Math.ceil(totalElementos / itemsPorPagina));
  const paginaSeguro = Math.min(paginaActual, totalPaginas - 1);
  if (paginaSeguro !== paginaActual) {
    // Ajustar página cuando disminuye el número de elementos
    setPaginaActual(paginaSeguro);
  }
  const indiceInicio = paginaSeguro * itemsPorPagina;
  const pedidosPagina = pedidosOrdenados.slice(indiceInicio, indiceInicio + itemsPorPagina);

  const seleccionarTodos = pedidosSeleccionados.length === pedidosOrdenados.length && pedidosOrdenados.length > 0;

  const toggleSeleccionarTodos = () => {
    if (seleccionarTodos) {
      setPedidosSeleccionados([]);
    } else {
      setPedidosSeleccionados(pedidosOrdenados.map((p) => p.id));
    }
  };

  const toggleSeleccionPedido = (id) => {
    setPedidosSeleccionados((prev) =>
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
    if (window.confirm('¿Eliminar este pedido de compra?')) {
      await eliminarPedidoCompra(id);
      setPedidosSeleccionados((prev) => prev.filter((item) => item !== id));
    }
  };

  const eliminarSeleccionados = async () => {
    if (pedidosSeleccionados.length === 0) return;
    if (window.confirm(`¿Eliminar ${pedidosSeleccionados.length} pedido(s)?`)) {
      for (const id of pedidosSeleccionados) {
        await eliminarPedidoCompra(id);
      }
      setPedidosSeleccionados([]);
    }
  };

  const exportarExcelCsv = () => {
    if (pedidosSeleccionados.length === 0) return;
    alert('Exportar a Excel estará disponible próximamente.');
  };

  const generarPdfMultiple = () => {
    if (pedidosSeleccionados.length === 0) return;
    alert('Generación de PDF múltiple estará disponible próximamente.');
  };

  const resumenTotales = useMemo(() => {
    return pedidosOrdenados.reduce(
      (acc, pedido) => {
        const base = pedido.totalBaseSinImpuestos ?? pedido.subtotal ?? 0;
        const iva = pedido.totalIva ?? 0;
        const recargo = pedido.totalRecargo ?? 0;
        const total = pedido.total ?? 0;
        acc.base += base;
        acc.iva += iva;
        acc.recargo += recargo;
        acc.total += total;
        return acc;
      },
      { base: 0, iva: 0, recargo: 0, total: 0 }
    );
  }, [pedidosOrdenados]);

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
    return <div className="erp-empty-state">Cargando pedidos de compra...</div>;
  }

  return (
    <div className="erp-list-view">
      <div className="erp-list-toolbar">
        <button className="erp-btn erp-btn-primary" onClick={onNuevo}>+ Nuevo pedido de compra</button>
        <button className="erp-btn erp-btn-info" onClick={generarPdfMultiple} disabled={pedidosSeleccionados.length === 0}>
          <IconPdf className="erp-action-icon" /> PDF ({pedidosSeleccionados.length})
        </button>
        <button className="erp-btn erp-btn-secondary" onClick={exportarExcelCsv} disabled={pedidosSeleccionados.length === 0}>
          <IconCsv className="erp-action-icon" /> Excel ({pedidosSeleccionados.length})
        </button>
        <button className="erp-btn erp-btn-danger" onClick={eliminarSeleccionados} disabled={pedidosSeleccionados.length === 0}>
          <IconDelete className="erp-action-icon" /> Eliminar ({pedidosSeleccionados.length})
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
          <button className="erp-btn erp-btn-secondary" onClick={cargarPedidosCompra}>
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
            Mostrando {pedidosPagina.length} pedidos (Filtrados: {pedidosOrdenados.length})
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

      {pedidosOrdenados.length === 0 ? (
        <div className="erp-empty-state">
          <div className="erp-empty-icon">📄</div>
          <h3>No hay pedidos de compra con los filtros aplicados</h3>
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
              {pedidosPagina.map((pedido) => {
                const base = pedido.totalBaseSinImpuestos ?? pedido.subtotal ?? 0;
                const iva = pedido.totalIva ?? 0;
                const recargo = pedido.totalRecargo ?? 0;
                const total = pedido.total ?? 0;
                const proveedor = pedido.proveedorNombreComercial || pedido.proveedor?.nombreComercial || '—';
                const origen = pedido.origen || pedido.documentoOrigen || 'MANUAL';
                return (
                  <tr 
                    key={pedido.id} 
                    className={pedidosSeleccionados.includes(pedido.id) ? 'erp-row-selected' : ''}
                    style={getLineaEstadoStyle(pedido.estado)}
                  >
                    <td>
                      <input
                        type="checkbox"
                        checked={pedidosSeleccionados.includes(pedido.id)}
                        onChange={() => toggleSeleccionPedido(pedido.id)}
                      />
                    </td>
                    <td className="erp-td-numero">{pedido.numero}</td>
                    <td>{formatearSoloFecha(pedido.fecha)}</td>
                    <td>{proveedor}</td>
                    <td>
                      <span 
                        className="erp-badge erp-badge-info"
                        style={{ cursor: 'pointer' }}
                        onClick={() => abrirModalHistorialDocumento && abrirModalHistorialDocumento(pedido)}
                        title="Ver historial"
                      >
                        {pedido.origen || pedido.documentoOrigen || 'Manual'}
                      </span>
                    </td>
                    <td className="erp-td-right">{formatearMoneda(base)} €</td>
                    <td className="erp-td-right">{formatearMoneda(iva)} €</td>
                    <td className="erp-td-right">{formatearMoneda(recargo)} €</td>
                    <td className="erp-td-right">{formatearMoneda(total)} €</td>
                    <td>
                      <span className="erp-badge" style={getEstadoBadgeStyle(pedido.estado)}>{pedido.estado}</span>
                    </td>
                    <td className="erp-td-actions">
                      {onVer && (
                        <button className="erp-action-btn" onClick={() => onVer(pedido)} title="Ver">
                          <IconEye className="erp-action-icon" />
                        </button>
                      )}
                      <button className="erp-action-btn" onClick={() => onEditar(pedido)} title="Editar">
                        <IconEdit className="erp-action-icon" />
                      </button>
                      <button className="erp-action-btn" onClick={() => abrirModalTransformar(pedido)} title="Transformar">
                        <IconTransform className="erp-action-icon" />
                      </button>
                      <button className="erp-action-btn erp-action-btn-danger" onClick={() => handleEliminar(pedido.id)} title="Eliminar">
                        <IconDelete className="erp-action-icon" />
                      </button>
                    </td>
                  </tr>
                );
              })}
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
        documento={pedidoParaTransformar}
        tipoDocumentoActual="PEDIDO_COMPRA"
        estadoOptions={estadoOptions}
        onTransformacionCompletada={() => {
          cerrarModalTransformar();
          cargarPedidosCompra();
        }}
      />
      <ModalHistorialTransformaciones
        modalAbierto={modalHistorialAbierto}
        cerrarModal={cerrarModalHistorial}
        documento={documentoHistorial ? { ...documentoHistorial, tipo: 'PEDIDO_COMPRA' } : null}
        historial={historialModal}
        cargando={cargandoHistorialModal}
      />
    </div>
  );
};

export const FormularioPedidoCompra = ({ cerrarPestana, pestanaActiva, pedidoId }) => {
  const pedidosCompraModule = usePedidosCompraForm(pestanaActiva);

  // Cargar pedido existente al montar el componente
  useEffect(() => {
    if (pedidoId) {
      pedidosCompraModule.cargarPedidoCompra(pedidoId);
    }
  }, [pedidoId]);

  const formAdaptado = useMemo(() => ({
    ...pedidosCompraModule.formPedidoCompra,
    clienteId: pedidosCompraModule.formPedidoCompra.proveedorId || "",
  }), [pedidosCompraModule.formPedidoCompra]);

  const updateFieldAdaptado = useCallback((field, value) => {
    if (field === "clienteId") {
      pedidosCompraModule.updateFormPedidoCompraField("proveedorId", value);
    } else {
      pedidosCompraModule.updateFormPedidoCompraField(field, value);
    }
  }, [pedidosCompraModule]);

  return (
    <FormularioAlbaran
      formAlbaran={formAdaptado}
      clientes={pedidosCompraModule.proveedores}
      productos={pedidosCompraModule.productos}
      tiposIva={pedidosCompraModule.tiposIva}
      seriesDisponibles={pedidosCompraModule.series}
      estadoOptions={pedidosCompraModule.estadoOptions}
      updateFormAlbaranField={updateFieldAdaptado}
      setDireccionSnapshot={pedidosCompraModule.setDireccionSnapshot}
      updateDireccionSnapshotField={pedidosCompraModule.updateDireccionSnapshotField}
      agregarLinea={pedidosCompraModule.agregarLinea}
      eliminarLinea={pedidosCompraModule.eliminarLinea}
      actualizarLinea={pedidosCompraModule.actualizarLinea}
      calcularTotales={pedidosCompraModule.calcularTotales}
      guardarAlbaran={pedidosCompraModule.guardarPedidoCompra}
      cerrarPestana={cerrarPestana}
      pestanaActiva={pestanaActiva}
      almacenes={pedidosCompraModule.almacenes}
      tipoDocumento="pedido-compra"
      esCompra={true}
      mostrarSelectorAlmacen={pedidosCompraModule.mostrarSelectorAlmacen}
      permitirVentaMultialmacen={pedidosCompraModule.permitirCompraMultialmacen}
      generarNumeroAutomatico={pedidosCompraModule.generarNumeroAutomatico}
      generandoNumero={pedidosCompraModule.generandoNumero}
      subirAdjunto={pedidosCompraModule.subirAdjunto}
      eliminarAdjunto={pedidosCompraModule.eliminarAdjunto}
      descargarAdjunto={pedidosCompraModule.descargarAdjunto}
      tarifasAlbaran={pedidosCompraModule.tarifasPedidoCompra ? {
        ...pedidosCompraModule.tarifasPedidoCompra,
        cambiarTarifa: pedidosCompraModule.cambiarTarifaFormulario,
        recalcularPreciosLineas: pedidosCompraModule.recalcularPreciosLineas
      } : null}
    />
  );
};
