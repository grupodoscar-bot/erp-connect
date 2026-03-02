import React, { useState, useEffect } from 'react';
import { useMovimientosStock } from './useMovimientosStock';

const API_URL = 'http://145.223.103.219:8080';

export function MovimientosStockView() {
  const {
    movimientos,
    cargando,
    error,
    paginacion,
    filtros,
    tiposMovimiento,
    mostrarModalAjuste,
    guardandoAjuste,
    aplicarFiltros,
    limpiarFiltros,
    cambiarPagina,
    setMostrarModalAjuste,
    crearAjusteManual,
    obtenerNombreTipoMovimiento,
    obtenerColorTipoMovimiento
  } = useMovimientosStock();

  const [productos, setProductos] = useState([]);
  const [almacenes, setAlmacenes] = useState([]);

  const [filtrosLocales, setFiltrosLocales] = useState({
    productoId: '',
    almacenId: '',
    tipoMovimiento: '',
    documentoTipo: '',
    fechaInicio: '',
    fechaFin: ''
  });

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const response = await fetch(`${API_URL}/productos`);
        if (response.ok) {
          const data = await response.json();
          setProductos(data);
        }
      } catch (err) {
        console.error('Error cargando productos:', err);
      }
    };

    const cargarAlmacenes = async () => {
      try {
        const response = await fetch(`${API_URL}/almacenes`);
        if (response.ok) {
          const data = await response.json();
          setAlmacenes(data);
        }
      } catch (err) {
        console.error('Error cargando almacenes:', err);
      }
    };

    cargarProductos();
    cargarAlmacenes();
  }, []);

  const handleFiltroChange = (campo, valor) => {
    setFiltrosLocales(prev => ({ ...prev, [campo]: valor }));
  };

  const handleAplicarFiltros = () => {
    const filtrosAplicar = {};
    if (filtrosLocales.productoId) filtrosAplicar.productoId = filtrosLocales.productoId;
    if (filtrosLocales.almacenId) filtrosAplicar.almacenId = filtrosLocales.almacenId;
    if (filtrosLocales.tipoMovimiento) filtrosAplicar.tipoMovimiento = filtrosLocales.tipoMovimiento;
    if (filtrosLocales.documentoTipo) filtrosAplicar.documentoTipo = filtrosLocales.documentoTipo;
    if (filtrosLocales.fechaInicio) filtrosAplicar.fechaInicio = filtrosLocales.fechaInicio;
    if (filtrosLocales.fechaFin) filtrosAplicar.fechaFin = filtrosLocales.fechaFin;
    aplicarFiltros(filtrosAplicar);
  };

  const handleLimpiarFiltros = () => {
    setFiltrosLocales({
      productoId: '',
      almacenId: '',
      tipoMovimiento: '',
      documentoTipo: '',
      fechaInicio: '',
      fechaFin: ''
    });
    limpiarFiltros();
  };

  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return '-';
    const fecha = new Date(fechaStr);
    return fecha.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatearCantidad = (cantidad) => {
    if (cantidad > 0) {
      return <span style={{ color: '#10b981', fontWeight: 'bold' }}>+{cantidad}</span>;
    } else if (cantidad < 0) {
      return <span style={{ color: '#ef4444', fontWeight: 'bold' }}>{cantidad}</span>;
    }
    return <span>{cantidad}</span>;
  };

  return (
    <div className="erp-list-view">
      <div className="erp-list-toolbar">
        <button 
          className="erp-btn erp-btn-primary" 
          onClick={() => setMostrarModalAjuste(true)}
        >
          + Ajuste Manual
        </button>
        <div className="erp-search">
          <input 
            type="text" 
            placeholder="Buscar en movimientos..." 
          />
        </div>
      </div>

      <div className="erp-filters-panel" style={{ 
        background: 'var(--erp-form-surface)',
        padding: '1rem',
        borderRadius: '8px',
        marginBottom: '1rem',
        border: '1px solid var(--erp-border)'
      }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
          gap: '0.75rem',
          marginBottom: '0.75rem'
        }}>
          <div className="erp-form-group">
            <label>Producto</label>
            <select
              value={filtrosLocales.productoId}
              onChange={(e) => handleFiltroChange('productoId', e.target.value)}
              className="erp-input"
            >
              <option value="">Todos los productos</option>
              {productos.map(p => (
                <option key={p.id} value={p.id}>
                  {p.referencia} - {p.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="erp-form-group">
            <label>Almacén</label>
            <select
              value={filtrosLocales.almacenId}
              onChange={(e) => handleFiltroChange('almacenId', e.target.value)}
              className="erp-input"
            >
              <option value="">Todos los almacenes</option>
              {almacenes.map(a => (
                <option key={a.id} value={a.id}>{a.nombre}</option>
              ))}
            </select>
          </div>

          <div className="erp-form-group">
            <label>Tipo de Movimiento</label>
            <select
              value={filtrosLocales.tipoMovimiento}
              onChange={(e) => handleFiltroChange('tipoMovimiento', e.target.value)}
              className="erp-input"
            >
              <option value="">Todos los tipos</option>
              {tiposMovimiento.map(tipo => (
                <option key={tipo} value={tipo}>
                  {obtenerNombreTipoMovimiento(tipo)}
                </option>
              ))}
            </select>
          </div>

          <div className="erp-form-group">
            <label>Tipo de Documento</label>
            <select
              value={filtrosLocales.documentoTipo}
              onChange={(e) => handleFiltroChange('documentoTipo', e.target.value)}
              className="erp-input"
            >
              <option value="">Todos los documentos</option>
              <option value="ALBARAN">Albarán</option>
              <option value="FACTURA">Factura</option>
              <option value="FACTURA_RECTIFICATIVA">Factura Rectificativa</option>
            </select>
          </div>

          <div className="erp-form-group">
            <label>Fecha Inicio</label>
            <input
              type="datetime-local"
              value={filtrosLocales.fechaInicio}
              onChange={(e) => handleFiltroChange('fechaInicio', e.target.value)}
              className="erp-input"
            />
          </div>

          <div className="erp-form-group">
            <label>Fecha Fin</label>
            <input
              type="datetime-local"
              value={filtrosLocales.fechaFin}
              onChange={(e) => handleFiltroChange('fechaFin', e.target.value)}
              className="erp-input"
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className="erp-btn erp-btn-primary"
            onClick={handleAplicarFiltros}
            style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
          >
            Aplicar Filtros
          </button>
          <button
            className="erp-btn erp-btn-secondary"
            onClick={handleLimpiarFiltros}
            style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
          >
            Limpiar
          </button>
        </div>
      </div>

      {error && (
        <div className="erp-alert erp-alert-error" style={{ marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {cargando ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--erp-text-muted)' }}>
          Cargando movimientos...
        </div>
      ) : (
        <>
          <table className="erp-table">
            <thead>
              <tr>
                <th style={{ width: '140px' }}>Fecha</th>
                <th>Producto</th>
                <th style={{ width: '120px' }}>Almacén</th>
                <th className="erp-th-right" style={{ width: '80px' }}>Cant.</th>
                <th className="erp-th-right" style={{ width: '90px' }}>Stock Ant.</th>
                <th className="erp-th-right" style={{ width: '90px' }}>Stock Nuevo</th>
                <th style={{ width: '180px' }}>Tipo</th>
                <th>Descripción</th>
                <th style={{ width: '120px' }}>Documento</th>
              </tr>
            </thead>
            <tbody>
              {movimientos.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '3rem', color: 'var(--erp-text-muted)' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📦</div>
                    <div>No hay movimientos registrados</div>
                    <div style={{ fontSize: '0.75rem', marginTop: '0.25rem', opacity: 0.7 }}>Los movimientos aparecerán aquí cuando se realicen operaciones de stock</div>
                  </td>
                </tr>
              ) : (
                movimientos.map((mov) => (
                  <tr key={mov.id}>
                    <td className="erp-td-mono" style={{ fontSize: '0.8125rem' }}>
                      {formatearFecha(mov.fecha)}
                    </td>
                    <td>
                      <div className="erp-td-mono" style={{ fontWeight: '600', fontSize: '0.875rem' }}>
                        {mov.producto?.referencia}
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--erp-text-secondary)', marginTop: '2px' }}>
                        {mov.producto?.nombre}
                      </div>
                    </td>
                    <td style={{ fontSize: '0.875rem' }}>{mov.almacen?.nombre}</td>
                    <td className="erp-td-mono erp-td-right">
                      {formatearCantidad(mov.cantidad)}
                    </td>
                    <td className="erp-td-mono erp-td-right">{mov.stockAnterior}</td>
                    <td className="erp-td-mono erp-td-right" style={{ fontWeight: '600' }}>
                      {mov.stockNuevo}
                    </td>
                    <td>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          backgroundColor: `${obtenerColorTipoMovimiento(mov.tipoMovimiento)}15`,
                          color: obtenerColorTipoMovimiento(mov.tipoMovimiento),
                          border: `1px solid ${obtenerColorTipoMovimiento(mov.tipoMovimiento)}30`
                        }}
                      >
                        {obtenerNombreTipoMovimiento(mov.tipoMovimiento)}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8125rem', maxWidth: '300px' }}>
                      {mov.descripcion}
                    </td>
                    <td>
                      {mov.documentoTipo && mov.documentoNumero ? (
                        <div>
                          <div className="erp-td-mono" style={{ fontWeight: '600', fontSize: '0.8125rem' }}>
                            {mov.documentoTipo}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--erp-text-muted)', marginTop: '2px' }}>
                            {mov.documentoNumero}
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--erp-text-muted)' }}>—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {paginacion.totalPages > 1 && (
            <div className="erp-pagination" style={{ marginTop: '1rem' }}>
            <button
              className="erp-btn erp-btn-secondary"
              onClick={() => cambiarPagina(paginacion.currentPage - 1)}
              disabled={paginacion.currentPage === 0}
            >
              ← Anterior
            </button>
            <span style={{ color: 'var(--erp-text-secondary)', fontSize: '0.875rem' }}>
              Página {paginacion.currentPage + 1} de {paginacion.totalPages} ({paginacion.totalElements} movimientos)
            </span>
            <button
              className="erp-btn erp-btn-secondary"
              onClick={() => cambiarPagina(paginacion.currentPage + 1)}
              disabled={paginacion.currentPage >= paginacion.totalPages - 1}
            >
              Siguiente →
            </button>
          </div>
          )}
        </>
      )}

      {mostrarModalAjuste && (
        <ModalAjusteManual
          onClose={() => setMostrarModalAjuste(false)}
          onGuardar={crearAjusteManual}
          guardando={guardandoAjuste}
          productos={productos}
          almacenes={almacenes}
        />
      )}
    </div>
  );
}

function ModalAjusteManual({ onClose, onGuardar, guardando, productos, almacenes }) {
  const [formAjuste, setFormAjuste] = useState({
    productoId: '',
    almacenId: '',
    cantidad: '',
    descripcion: ''
  });
  const [error, setError] = useState(null);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [stockActual, setStockActual] = useState(null);

  useEffect(() => {
    if (formAjuste.productoId && formAjuste.almacenId) {
      const producto = productos.find(p => p.id === parseInt(formAjuste.productoId));
      if (producto) {
        setProductoSeleccionado(producto);
        const almacenStock = producto.almacenes?.find(
          a => a.almacen?.id === parseInt(formAjuste.almacenId)
        );
        setStockActual(almacenStock?.stock ?? 0);
      }
    } else {
      setProductoSeleccionado(null);
      setStockActual(null);
    }
  }, [formAjuste.productoId, formAjuste.almacenId, productos]);

  const handleChange = (campo, valor) => {
    setFormAjuste(prev => ({ ...prev, [campo]: valor }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formAjuste.productoId || !formAjuste.almacenId) {
      setError('Debe seleccionar un producto y un almacén');
      return;
    }

    if (!formAjuste.cantidad || formAjuste.cantidad === '0') {
      setError('La cantidad debe ser diferente de cero');
      return;
    }

    if (!formAjuste.descripcion.trim()) {
      setError('Debe proporcionar una descripción del ajuste');
      return;
    }

    try {
      await onGuardar({
        productoId: parseInt(formAjuste.productoId),
        almacenId: parseInt(formAjuste.almacenId),
        cantidad: parseInt(formAjuste.cantidad),
        descripcion: formAjuste.descripcion.trim()
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const calcularStockResultante = () => {
    if (stockActual === null || !formAjuste.cantidad) return null;
    return stockActual + parseInt(formAjuste.cantidad || 0);
  };

  const stockResultante = calcularStockResultante();

  return (
    <div className="erp-modal-overlay" onClick={onClose}>
      <div className="erp-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="erp-modal-header">
          <h2>Crear Ajuste Manual de Stock</h2>
          <button className="erp-modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="erp-modal-body">
            {error && (
              <div className="erp-alert erp-alert-error">
                {error}
              </div>
            )}

            <div className="erp-form-group">
              <label>Producto *</label>
              <select
                value={formAjuste.productoId}
                onChange={(e) => handleChange('productoId', e.target.value)}
                className="erp-input"
                required
              >
                <option value="">Seleccione un producto</option>
                {productos.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.referencia} - {p.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="erp-form-group">
              <label>Almacén *</label>
              <select
                value={formAjuste.almacenId}
                onChange={(e) => handleChange('almacenId', e.target.value)}
                className="erp-input"
                required
              >
                <option value="">Seleccione un almacén</option>
                {almacenes.map(a => (
                  <option key={a.id} value={a.id}>{a.nombre}</option>
                ))}
              </select>
            </div>

            {stockActual !== null && (
              <div className="erp-info-box" style={{
                padding: '1rem',
                backgroundColor: '#f3f4f6',
                borderRadius: '0.5rem',
                marginBottom: '1rem'
              }}>
                <div style={{ fontWeight: '500', marginBottom: '0.5rem' }}>
                  Stock Actual: <span style={{ fontSize: '1.25rem', color: '#1f2937' }}>
                    {stockActual} unidades
                  </span>
                </div>
                {stockResultante !== null && formAjuste.cantidad && (
                  <div style={{ fontWeight: '500' }}>
                    Stock Resultante: <span style={{
                      fontSize: '1.25rem',
                      color: stockResultante < 0 ? '#ef4444' : '#10b981'
                    }}>
                      {stockResultante} unidades
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="erp-form-group">
              <label>Cantidad de Ajuste *</label>
              <input
                type="number"
                value={formAjuste.cantidad}
                onChange={(e) => handleChange('cantidad', e.target.value)}
                className="erp-input"
                placeholder="Positivo para entrada, negativo para salida"
                required
              />
              <small style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                Use números positivos para incrementar stock o negativos para decrementar
              </small>
            </div>

            <div className="erp-form-group">
              <label>Descripción del Ajuste *</label>
              <textarea
                value={formAjuste.descripcion}
                onChange={(e) => handleChange('descripcion', e.target.value)}
                className="erp-input"
                rows="3"
                placeholder="Ej: Ajuste por inventario físico, corrección de error, merma, etc."
                required
              />
            </div>
          </div>

          <div className="erp-modal-footer">
            <button
              type="button"
              className="erp-btn-secondary"
              onClick={onClose}
              disabled={guardando}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="erp-btn-primary"
              disabled={guardando}
            >
              {guardando ? 'Guardando...' : 'Crear Ajuste'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
