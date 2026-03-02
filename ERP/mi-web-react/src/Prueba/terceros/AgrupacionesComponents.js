import React from "react";
import { IconEye, IconEdit, IconDelete, IconDiana } from "../iconos";

export function ListaAgrupaciones({
  agrupaciones,
  abrirNuevaAgrupacion,
  abrirVerAgrupacion,
  abrirEditarAgrupacion,
  abrirCondicionesAgrupacion,
  borrarAgrupacion,
}) {
  return (
    <div className="erp-list-view">
      <div className="erp-list-toolbar">
        <button className="erp-btn erp-btn-primary" onClick={abrirNuevaAgrupacion}>
          + Nueva Agrupación
        </button>
        <div className="erp-search">
          <input type="text" placeholder="Buscar agrupación..." />
        </div>
      </div>

      <table className="erp-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Descuento General</th>
            <th>Estado</th>
            <th>Condiciones</th>
            <th className="erp-th-actions">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {agrupaciones.map((a) => (
            <tr key={a.id} onDoubleClick={() => abrirVerAgrupacion(a)}>
              <td className="erp-td-main"><strong>{a.nombre}</strong></td>
              <td>{a.descripcion || "—"}</td>
              <td className="erp-td-mono">
                {a.descuentoGeneral > 0 ? (
                  <span style={{color: '#059669', fontWeight: 'bold'}}>-{a.descuentoGeneral}%</span>
                ) : (
                  <span>0%</span>
                )}
              </td>
              <td>
                {a.activa ? (
                  <span className="erp-badge erp-badge-success">Activa</span>
                ) : (
                  <span className="erp-badge erp-badge-danger">Inactiva</span>
                )}
              </td>
              <td>
                <button 
                  className="erp-action-btn erp-action-info" 
                  onClick={() => abrirCondicionesAgrupacion(a)}
                  title="Gestionar condiciones especiales"
                >
                  <IconDiana className="erp-action-icon" />
                </button>
              </td>
              <td className="erp-td-actions">
                <button className="erp-action-btn" onClick={() => abrirVerAgrupacion(a)} title="Ver">
                  <IconEye className="erp-action-icon" />
                </button>
                <button className="erp-action-btn" onClick={() => abrirEditarAgrupacion(a)} title="Editar">
                  <IconEdit className="erp-action-icon" />
                </button>
                <button className="erp-action-btn erp-action-danger" onClick={() => borrarAgrupacion(a.id)} title="Eliminar">
                  <IconDelete className="erp-action-icon" />
                </button>
              </td>
            </tr>
          ))}
          {agrupaciones.length === 0 && (
            <tr><td colSpan="6" className="erp-td-empty">No hay agrupaciones</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export function FormularioAgrupacion({
  formAgrupacion,
  updateFormAgrupacionField,
  guardarAgrupacion,
  cerrarPestana,
  pestanaActiva,
}) {
  return (
    <div className="erp-form-view">
      <form onSubmit={guardarAgrupacion}>
        <div className="erp-form-content">
          <div className="erp-form-section">
            <div className="erp-form-group">
              <h4 className="erp-form-group-title">Información de la agrupación</h4>
              <div className="erp-form-row">
                <label className="erp-field">
                  <span className="erp-field-label">Nombre *</span>
                  <input
                    type="text"
                    value={formAgrupacion.nombre}
                    onChange={(e) => updateFormAgrupacionField("nombre", e.target.value)}
                    required
                    placeholder="Ej: MERCADONA, CARREFOUR, etc."
                  />
                </label>
              </div>
              <div className="erp-form-row">
                <label className="erp-field erp-field-full">
                  <span className="erp-field-label">Descripción</span>
                  <textarea
                    rows="3"
                    value={formAgrupacion.descripcion}
                    onChange={(e) => updateFormAgrupacionField("descripcion", e.target.value)}
                    placeholder="Descripción de la agrupación"
                  />
                </label>
              </div>
              <div className="erp-form-row">
                <label className="erp-field">
                  <span className="erp-field-label">Descuento General (%)</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    className="erp-input-mono"
                    value={formAgrupacion.descuentoGeneral}
                    onChange={(e) => updateFormAgrupacionField("descuentoGeneral", e.target.value)}
                  />
                </label>
                <label className="erp-checkbox" style={{alignSelf: 'flex-end', marginBottom: '10px'}}>
                  <input
                    type="checkbox"
                    checked={formAgrupacion.activa}
                    onChange={(e) => updateFormAgrupacionField("activa", e.target.checked)}
                  />
                  <span>Agrupación activa</span>
                </label>
              </div>
              <div className="erp-form-row">
                <label className="erp-field erp-field-full">
                  <span className="erp-field-label">Observaciones</span>
                  <textarea
                    rows="3"
                    value={formAgrupacion.observaciones}
                    onChange={(e) => updateFormAgrupacionField("observaciones", e.target.value)}
                    placeholder="Observaciones adicionales"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="erp-form-actions">
          <button type="submit" className="erp-btn erp-btn-primary">
            {formAgrupacion.id ? "Guardar cambios" : "Crear agrupación"}
          </button>
          <button type="button" className="erp-btn erp-btn-secondary" onClick={() => cerrarPestana(pestanaActiva)}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

export function FichaAgrupacion({ agrupaciones, agrupacionId, abrirEditarAgrupacion, abrirCondicionesAgrupacion }) {
  const agrupacion = agrupaciones.find(a => a.id === agrupacionId);
  if (!agrupacion) return <div className="erp-empty-state">Agrupación no encontrada</div>;

  return (
    <div className="erp-detail-view">
      <div className="erp-detail-header">
        <div className="erp-detail-title">
          <h2>{agrupacion.nombre}</h2>
          <span className="erp-detail-subtitle">
            {agrupacion.activa ? (
              <span style={{color: '#059669'}}>✓ Activa</span>
            ) : (
              <span style={{color: '#dc2626'}}>✗ Inactiva</span>
            )}
          </span>
        </div>
        <div className="erp-detail-actions">
          <button className="erp-btn erp-btn-info" onClick={() => abrirCondicionesAgrupacion(agrupacion)}>
            <IconDiana className="erp-action-icon" /> Condiciones
          </button>
          <button className="erp-btn erp-btn-secondary" onClick={() => abrirEditarAgrupacion(agrupacion)}>
            <IconEdit className="erp-action-icon" /> Editar
          </button>
        </div>
      </div>

      <div className="erp-detail-body">
        <section className="erp-detail-section">
          <h4 className="erp-section-title">Información de la agrupación</h4>
          <div className="erp-data-grid">
            <div className="erp-data-row">
              <span className="erp-data-label">Nombre</span>
              <span className="erp-data-value">{agrupacion.nombre}</span>
            </div>
            <div className="erp-data-row">
              <span className="erp-data-label">Descripción</span>
              <span className="erp-data-value">{agrupacion.descripcion || "—"}</span>
            </div>
            <div className="erp-data-row">
              <span className="erp-data-label">Descuento General</span>
              <span className="erp-data-value erp-mono">
                {agrupacion.descuentoGeneral > 0 ? (
                  <span style={{color: '#059669', fontWeight: 'bold'}}>-{agrupacion.descuentoGeneral}%</span>
                ) : (
                  "0%"
                )}
              </span>
            </div>
            <div className="erp-data-row">
              <span className="erp-data-label">Estado</span>
              <span className="erp-data-value">
                {agrupacion.activa ? "Activa" : "Inactiva"}
              </span>
            </div>
          </div>
        </section>

        {agrupacion.observaciones && (
          <section className="erp-detail-section">
            <h4 className="erp-section-title">Observaciones</h4>
            <div className="erp-observations">{agrupacion.observaciones}</div>
          </section>
        )}
      </div>
    </div>
  );
}

// Componente para gestionar condiciones comerciales
export function CondicionesAgrupacion({
  agrupacionSeleccionada,
  condiciones,
  productos,
  tarifas,
  formCondicion,
  modalCondicionAbierto,
  guardandoCondicion,
  abrirNuevaCondicion,
  cerrarModalCondicion,
  editarCondicion,
  guardarCondicion,
  borrarCondicion,
  updateFormCondicionField,
  cerrarPestana,
  pestanaActiva,
}) {
  if (!agrupacionSeleccionada) {
    return <div className="erp-empty-state">Agrupación no encontrada</div>;
  }

  const formatearRangoCantidad = (min, max) => {
    if (min && max) return `${min} - ${max} uds`;
    if (min && !max) return `≥ ${min} uds`;
    if (!min && max) return `≤ ${max} uds`;
    return "Cualquier cantidad";
  };

  return (
    <div className="erp-list-view">
      <div className="erp-list-toolbar">
        <div>
          <h3 style={{margin: 0}}>Condiciones Especiales - {agrupacionSeleccionada.nombre}</h3>
          <p style={{margin: '5px 0 0 0', color: '#6b7280', fontSize: '14px'}}>
            Descuentos por cantidad de productos
          </p>
        </div>
        <button className="erp-btn erp-btn-primary" onClick={abrirNuevaCondicion}>
          + Nueva Condición
        </button>
      </div>

      {condiciones.length > 0 ? (
        <table className="erp-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Tarifa</th>
              <th>Tipo</th>
              <th>Valor</th>
              <th>Cantidad Mín.</th>
              <th>Cantidad Máx.</th>
              <th>Estado</th>
              <th className="erp-th-actions">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {condiciones.map((c) => (
              <tr key={c.id}>
                <td className="erp-td-main"><strong>{c.producto?.titulo || 'Producto eliminado'}</strong></td>
                <td>
                  {c.tarifa ? (
                    <span style={{ color: c.tarifa.esGeneral ? '#3b82f6' : '#059669', fontWeight: '500' }}>
                      {c.tarifa.nombre}
                    </span>
                  ) : (
                    <span style={{ color: '#9ca3af' }}>Todas</span>
                  )}
                </td>
                <td>
                  {c.tipoCondicion === 'DESCUENTO_POR_CANTIDAD' ? (
                    <span style={{ color: '#059669' }}>Descuento por Cantidad</span>
                  ) : (
                    <span style={{ color: '#3b82f6' }}>Precio Especial</span>
                  )}
                </td>
                <td>
                  {c.tipoCondicion === 'DESCUENTO_POR_CANTIDAD' ? (
                    <div>
                      <span style={{ color: '#059669', fontWeight: 'bold' }}>-{c.valor}%</span>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        {formatearRangoCantidad(c.cantidadMinima, c.cantidadMaxima)}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>{c.precioEspecial}€</span>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        {formatearRangoCantidad(c.cantidadMinima, c.cantidadMaxima)}
                      </div>
                    </div>
                  )}
                </td>
                <td className="erp-td-mono">{c.cantidadMinima || '—'}</td>
                <td className="erp-td-mono">{c.cantidadMaxima || '∞'}</td>
                <td>
                  {c.activa ? (
                    <span className="erp-badge erp-badge-success">✓ Activa</span>
                  ) : (
                    <span className="erp-badge erp-badge-danger">✗ Inactiva</span>
                  )}
                </td>
                <td className="erp-td-actions">
                  <button className="erp-action-btn" onClick={() => editarCondicion(c)} title="Editar">✏️</button>
                  <button className="erp-action-btn erp-action-danger" onClick={() => borrarCondicion(c.id)} title="Eliminar">🗑</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="erp-empty-state" style={{margin: '20px 0'}}>
          <p>No hay condiciones especiales configuradas para esta agrupación.</p>
          <p style={{fontSize: '14px', color: '#9ca3af'}}>
            Haz clic en "Nueva Condición" para crear descuentos por cantidad o precios especiales.
          </p>
        </div>
      )}

      <div style={{marginTop: '20px', display: 'flex', justifyContent: 'flex-end'}}>
        <button className="erp-btn erp-btn-secondary" onClick={() => cerrarPestana(pestanaActiva)}>
          Cerrar
        </button>
      </div>

      {/* Modal para crear/editar condición */}
      {modalCondicionAbierto && (
        <div className="erp-modal-overlay" onClick={cerrarModalCondicion}>
          <div className="erp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="erp-modal-header">
              <h3>{formCondicion.id ? "Editar Condición Especial" : "Nueva Condición Especial"}</h3>
              <button className="erp-modal-close" onClick={cerrarModalCondicion}>×</button>
            </div>
            <form onSubmit={guardarCondicion}>
              <div className="erp-modal-body">
                <div className="erp-form-group">
                  <label className="erp-field">
                    <span className="erp-field-label">Producto *</span>
                    <select
                      value={formCondicion.productoId}
                      onChange={(e) => updateFormCondicionField("productoId", e.target.value)}
                      required
                    >
                      <option value="">Seleccionar producto...</option>
                      {productos.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.titulo} - {p.precio}€
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="erp-field">
                    <span className="erp-field-label">Tarifa (opcional)</span>
                    <select
                      value={formCondicion.tarifaId}
                      onChange={(e) => updateFormCondicionField("tarifaId", e.target.value)}
                    >
                      <option value="">Todas las tarifas</option>
                      {tarifas.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.nombre}{t.esGeneral ? ' (General)' : ''}
                        </option>
                      ))}
                    </select>
                    <small style={{ color: '#6b7280', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                      Si seleccionas una tarifa, esta condición solo aplicará a esa tarifa específica.
                    </small>
                  </label>

                  <label className="erp-field">
                    <span className="erp-field-label">Tipo de Condición *</span>
                    <select
                      value={formCondicion.tipoCondicion}
                      onChange={(e) => updateFormCondicionField("tipoCondicion", e.target.value)}
                      required
                    >
                      <option value="DESCUENTO_POR_CANTIDAD">Descuento por Cantidad</option>
                      <option value="PRECIO_ESPECIAL">Precio Especial</option>
                    </select>
                  </label>

                  {formCondicion.tipoCondicion === 'DESCUENTO_POR_CANTIDAD' ? (
                    <label className="erp-field">
                      <span className="erp-field-label">Descuento (%) *</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        className="erp-input-mono"
                        value={formCondicion.valor}
                        onChange={(e) => updateFormCondicionField("valor", e.target.value)}
                        required
                        placeholder="Ej: 15"
                      />
                    </label>
                  ) : (
                    <label className="erp-field">
                      <span className="erp-field-label">Precio Especial (€) *</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="erp-input-mono"
                        value={formCondicion.precioEspecial}
                        onChange={(e) => updateFormCondicionField("precioEspecial", e.target.value)}
                        required
                        placeholder="Ej: 9.99"
                      />
                    </label>
                  )}

                  <div className="erp-form-row">
                    <label className="erp-field">
                      <span className="erp-field-label">Cantidad Mínima</span>
                      <input
                        type="number"
                        min="0"
                        className="erp-input-mono"
                        value={formCondicion.cantidadMinima}
                        onChange={(e) => updateFormCondicionField("cantidadMinima", e.target.value)}
                        placeholder="Ej: 10"
                      />
                    </label>
                    <label className="erp-field">
                      <span className="erp-field-label">Cantidad Máxima</span>
                      <input
                        type="number"
                        min="0"
                        className="erp-input-mono"
                        value={formCondicion.cantidadMaxima}
                        onChange={(e) => updateFormCondicionField("cantidadMaxima", e.target.value)}
                        placeholder="Ej: 100 (vacío = sin límite)"
                      />
                    </label>
                  </div>

                  <label className="erp-field">
                    <span className="erp-field-label">Prioridad</span>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      className="erp-input-mono"
                      value={formCondicion.prioridad}
                      onChange={(e) => updateFormCondicionField("prioridad", e.target.value)}
                      placeholder="10"
                    />
                    <small style={{ color: '#6b7280', fontSize: '12px' }}>
                      Mayor número = mayor prioridad (si hay múltiples condiciones)
                    </small>
                  </label>

                  <label className="erp-field">
                    <span className="erp-field-label">Descripción</span>
                    <textarea
                      rows="2"
                      value={formCondicion.descripcion}
                      onChange={(e) => updateFormCondicionField("descripcion", e.target.value)}
                      placeholder="Descripción opcional de la condición"
                    />
                  </label>

                  <label className="erp-checkbox">
                    <input
                      type="checkbox"
                      checked={formCondicion.activa}
                      onChange={(e) => updateFormCondicionField("activa", e.target.checked)}
                    />
                    <span>Condición activa</span>
                  </label>

                  <div style={{ 
                    marginTop: '15px', 
                    padding: '15px', 
                    backgroundColor: '#eff6ff', 
                    borderRadius: '8px',
                    border: '1px solid #93c5fd'
                  }}>
                    <p style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '600', color: '#1e40af' }}>
                      💡 Ejemplo de uso:
                    </p>
                    <p style={{ margin: 0, fontSize: '13px', color: '#1e3a8a' }}>
                      Si configuras un descuento del <strong>15%</strong> con cantidad mínima <strong>10</strong> y máxima <strong>100</strong>,
                      el cliente obtendrá ese descuento al comprar entre 10 y 100 unidades de este producto.
                    </p>
                    <p style={{ margin: '10px 0 0 0', fontSize: '13px', color: '#1e3a8a' }}>
                      <strong>Prioridad:</strong> Las condiciones comerciales tienen prioridad sobre los precios de tarifa.
                      Si especificas una tarifa, la condición solo aplicará cuando se use esa tarifa en el albarán.
                    </p>
                  </div>
                </div>
              </div>
              <div className="erp-modal-footer">
                <button type="button" className="erp-btn erp-btn-secondary" onClick={cerrarModalCondicion} disabled={guardandoCondicion}>
                  Cancelar
                </button>
                <button type="submit" className="erp-btn erp-btn-primary" disabled={guardandoCondicion}>
                  {guardandoCondicion ? 'Guardando...' : 'Guardar Condición'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
