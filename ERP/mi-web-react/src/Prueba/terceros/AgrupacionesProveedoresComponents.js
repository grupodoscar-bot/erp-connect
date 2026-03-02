import React from "react";
import { IconEye, IconEdit, IconDelete, IconDiana } from "../iconos";

export function ListaAgrupacionesProveedores({
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
          + Nueva Agrupación de Proveedores
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
                  title="Gestionar condiciones especiales de compra"
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
            <tr><td colSpan="6" className="erp-td-empty">No hay agrupaciones de proveedores</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export function FormularioAgrupacionProveedor({
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
                    className="erp-input"
                    value={formAgrupacion.nombre}
                    onChange={(e) => updateFormAgrupacionField("nombre", e.target.value)}
                    required
                  />
                </label>
                <label className="erp-field">
                  <span className="erp-field-label">Descuento General (%)</span>
                  <input
                    type="number"
                    step="0.01"
                    className="erp-input"
                    value={formAgrupacion.descuentoGeneral}
                    onChange={(e) => updateFormAgrupacionField("descuentoGeneral", e.target.value)}
                  />
                </label>
              </div>
              <div className="erp-form-row">
                <label className="erp-field">
                  <span className="erp-field-label">Descripción</span>
                  <textarea
                    className="erp-input"
                    rows="3"
                    value={formAgrupacion.descripcion}
                    onChange={(e) => updateFormAgrupacionField("descripcion", e.target.value)}
                  />
                </label>
              </div>
              <div className="erp-form-row">
                <label className="erp-field">
                  <span className="erp-field-label">Observaciones</span>
                  <textarea
                    className="erp-input"
                    rows="3"
                    value={formAgrupacion.observaciones}
                    onChange={(e) => updateFormAgrupacionField("observaciones", e.target.value)}
                  />
                </label>
              </div>
              <div className="erp-form-row">
                <label className="erp-field erp-field-checkbox">
                  <input
                    type="checkbox"
                    checked={formAgrupacion.activa}
                    onChange={(e) => updateFormAgrupacionField("activa", e.target.checked)}
                  />
                  <span className="erp-field-label">Activa</span>
                </label>
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
            className="erp-btn erp-btn-secondary"
            onClick={() => cerrarPestana(pestanaActiva)}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

// Componente para gestionar condiciones comerciales de proveedores
export function CondicionesAgrupacionProveedor({
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
          <h3 style={{margin: 0}}>Condiciones de Compra - {agrupacionSeleccionada.nombre}</h3>
          <p style={{margin: '5px 0 0 0', color: '#6b7280', fontSize: '14px'}}>
            Descuentos y precios especiales por cantidad de productos
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
                  {c.tipoCondicion === "DESCUENTO_POR_CANTIDAD" ? (
                    <span className="erp-badge erp-badge-info">Descuento</span>
                  ) : (
                    <span className="erp-badge erp-badge-warning">Precio Especial</span>
                  )}
                </td>
                <td className="erp-td-mono">
                  {c.tipoCondicion === "DESCUENTO_POR_CANTIDAD" ? (
                    <span style={{color: '#059669', fontWeight: 'bold'}}>-{c.valor}%</span>
                  ) : (
                    <span style={{color: '#f59e0b', fontWeight: 'bold'}}>{c.precioEspecial}€</span>
                  )}
                </td>
                <td className="erp-td-mono">{c.cantidadMinima || 0}</td>
                <td className="erp-td-mono">{c.cantidadMaxima || '∞'}</td>
                <td>
                  {c.activa ? (
                    <span className="erp-badge erp-badge-success">Activa</span>
                  ) : (
                    <span className="erp-badge erp-badge-danger">Inactiva</span>
                  )}
                </td>
                <td className="erp-td-actions">
                  <button className="erp-action-btn" onClick={() => editarCondicion(c)} title="Editar">
                    <IconEdit className="erp-action-icon" />
                  </button>
                  <button className="erp-action-btn erp-action-danger" onClick={() => borrarCondicion(c.id)} title="Eliminar">
                    <IconDelete className="erp-action-icon" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="erp-empty-state">
          <p>No hay condiciones especiales configuradas</p>
          <button className="erp-btn erp-btn-primary" onClick={abrirNuevaCondicion}>
            + Crear primera condición
          </button>
        </div>
      )}

      {modalCondicionAbierto && (
        <div className="erp-modal-overlay" onClick={cerrarModalCondicion}>
          <div className="erp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="erp-modal-header">
              <h3>{formCondicion.id ? "Editar Condición" : "Nueva Condición"}</h3>
              <button className="erp-modal-close" onClick={cerrarModalCondicion}>×</button>
            </div>
            <form onSubmit={guardarCondicion}>
              <div className="erp-modal-body">
                <div className="erp-form-row">
                  <label className="erp-field">
                    <span className="erp-field-label">Producto *</span>
                    <select
                      className="erp-input"
                      value={formCondicion.productoId}
                      onChange={(e) => updateFormCondicionField("productoId", e.target.value)}
                      required
                    >
                      <option value="">Seleccionar producto...</option>
                      {productos.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.titulo} ({p.referencia})
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="erp-form-row">
                  <label className="erp-field">
                    <span className="erp-field-label">Tarifa (opcional)</span>
                    <select
                      className="erp-input"
                      value={formCondicion.tarifaId}
                      onChange={(e) => updateFormCondicionField("tarifaId", e.target.value)}
                    >
                      <option value="">Todas las tarifas</option>
                      {tarifas.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.nombre} {t.esGeneral ? '(General)' : ''}
                        </option>
                      ))}
                    </select>
                    <small style={{color: '#6b7280', fontSize: '12px'}}>
                      Si no se selecciona, la condición aplica a todas las tarifas
                    </small>
                  </label>
                </div>

                <div className="erp-form-row">
                  <label className="erp-field">
                    <span className="erp-field-label">Tipo de Condición *</span>
                    <select
                      className="erp-input"
                      value={formCondicion.tipoCondicion}
                      onChange={(e) => updateFormCondicionField("tipoCondicion", e.target.value)}
                      required
                    >
                      <option value="DESCUENTO_POR_CANTIDAD">Descuento por Cantidad</option>
                      <option value="PRECIO_ESPECIAL">Precio Especial</option>
                    </select>
                  </label>
                </div>

                {formCondicion.tipoCondicion === "DESCUENTO_POR_CANTIDAD" ? (
                  <div className="erp-form-row">
                    <label className="erp-field">
                      <span className="erp-field-label">Descuento (%) *</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        className="erp-input"
                        value={formCondicion.valor}
                        onChange={(e) => updateFormCondicionField("valor", e.target.value)}
                        required
                      />
                    </label>
                  </div>
                ) : (
                  <div className="erp-form-row">
                    <label className="erp-field">
                      <span className="erp-field-label">Precio Especial (€) *</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="erp-input"
                        value={formCondicion.precioEspecial}
                        onChange={(e) => updateFormCondicionField("precioEspecial", e.target.value)}
                        required
                      />
                    </label>
                  </div>
                )}

                <div className="erp-form-row">
                  <label className="erp-field">
                    <span className="erp-field-label">Cantidad Mínima</span>
                    <input
                      type="number"
                      min="0"
                      className="erp-input"
                      value={formCondicion.cantidadMinima}
                      onChange={(e) => updateFormCondicionField("cantidadMinima", e.target.value)}
                      placeholder="0"
                    />
                  </label>
                  <label className="erp-field">
                    <span className="erp-field-label">Cantidad Máxima</span>
                    <input
                      type="number"
                      min="0"
                      className="erp-input"
                      value={formCondicion.cantidadMaxima}
                      onChange={(e) => updateFormCondicionField("cantidadMaxima", e.target.value)}
                      placeholder="Sin límite"
                    />
                  </label>
                </div>

                <div className="erp-form-row">
                  <label className="erp-field">
                    <span className="erp-field-label">Prioridad</span>
                    <input
                      type="number"
                      min="0"
                      className="erp-input"
                      value={formCondicion.prioridad}
                      onChange={(e) => updateFormCondicionField("prioridad", e.target.value)}
                    />
                    <small style={{color: '#6b7280', fontSize: '12px'}}>
                      Mayor prioridad = se aplica primero (por defecto: 10)
                    </small>
                  </label>
                </div>

                <div className="erp-form-row">
                  <label className="erp-field">
                    <span className="erp-field-label">Descripción</span>
                    <textarea
                      className="erp-input"
                      rows="2"
                      value={formCondicion.descripcion}
                      onChange={(e) => updateFormCondicionField("descripcion", e.target.value)}
                      placeholder="Descripción opcional de la condición"
                    />
                  </label>
                </div>

                <div className="erp-form-row">
                  <label className="erp-field erp-field-checkbox">
                    <input
                      type="checkbox"
                      checked={formCondicion.activa}
                      onChange={(e) => updateFormCondicionField("activa", e.target.checked)}
                    />
                    <span className="erp-field-label">Activa</span>
                  </label>
                </div>
              </div>

              <div className="erp-modal-footer">
                <button type="submit" className="erp-btn erp-btn-primary" disabled={guardandoCondicion}>
                  {guardandoCondicion ? "Guardando..." : "Guardar"}
                </button>
                <button type="button" className="erp-btn erp-btn-secondary" onClick={cerrarModalCondicion}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
