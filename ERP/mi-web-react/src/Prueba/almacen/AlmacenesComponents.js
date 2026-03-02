import React from "react";
import { IconEye, IconEdit, IconDelete } from "../iconos";

export function ListaAlmacenes({
  almacenes,
  abrirNuevoAlmacen,
  abrirVerAlmacen,
  abrirEditarAlmacen,
  borrarAlmacen,
}) {
  return (
    <div className="erp-list-view">
      <div className="erp-list-toolbar">
        <button className="erp-btn erp-btn-primary" onClick={abrirNuevoAlmacen}>
          + Nuevo Almacén
        </button>
        <div className="erp-search">
          <input type="text" placeholder="Buscar almacén..." />
        </div>
      </div>

      <table className="erp-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Dirección</th>
            <th>Estado</th>
            <th className="erp-th-actions">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {almacenes.map((a) => (
            <tr key={a.id} onDoubleClick={() => abrirVerAlmacen(a)}>
              <td className="erp-td-main">{a.nombre}</td>
              <td>{a.descripcion || "—"}</td>
              <td>{a.direccion || "—"}</td>
              <td>
                <span className={`erp-badge ${a.activo ? "erp-badge-success" : "erp-badge-danger"}`}>
                  {a.activo ? "Activo" : "Inactivo"}
                </span>
              </td>
              <td className="erp-td-actions">
                <button className="erp-action-btn" onClick={() => abrirVerAlmacen(a)} title="Ver">
                  <IconEye className="erp-action-icon" />
                </button>
                <button className="erp-action-btn" onClick={() => abrirEditarAlmacen(a)} title="Editar">
                  <IconEdit className="erp-action-icon" />
                </button>
                <button className="erp-action-btn erp-action-danger" onClick={() => borrarAlmacen(a.id)} title="Eliminar">
                  <IconDelete className="erp-action-icon" />
                </button>
              </td>
            </tr>
          ))}
          {almacenes.length === 0 && (
            <tr><td colSpan="5" className="erp-td-empty">No hay almacenes</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export function FormularioAlmacen({
  formAlmacen,
  updateFormAlmacenField,
  guardarAlmacen,
  cerrarPestana,
  pestanaActiva,
}) {
  return (
    <div className="erp-form-view">
      <form onSubmit={guardarAlmacen}>
        <div className="erp-form-content">
          <div className="erp-form-section">
            <div className="erp-form-group">
              <h4 className="erp-form-group-title">Información del Almacén</h4>
              <label className="erp-field erp-field-full">
                <span className="erp-field-label">Nombre *</span>
                <input
                  type="text"
                  maxLength={100}
                  value={formAlmacen.nombre}
                  onChange={(e) => updateFormAlmacenField("nombre", e.target.value)}
                  required
                />
              </label>
              <label className="erp-field erp-field-full">
                <span className="erp-field-label">Descripción</span>
                <textarea
                  rows="3"
                  value={formAlmacen.descripcion}
                  onChange={(e) => updateFormAlmacenField("descripcion", e.target.value)}
                />
              </label>
              <label className="erp-field erp-field-full">
                <span className="erp-field-label">Dirección</span>
                <textarea
                  rows="2"
                  value={formAlmacen.direccion}
                  onChange={(e) => updateFormAlmacenField("direccion", e.target.value)}
                />
              </label>
              <label className="erp-checkbox">
                <input
                  type="checkbox"
                  checked={formAlmacen.activo}
                  onChange={(e) => updateFormAlmacenField("activo", e.target.checked)}
                />
                <span>Almacén activo</span>
              </label>
            </div>
          </div>
        </div>

        <div className="erp-form-actions">
          <button type="submit" className="erp-btn erp-btn-primary">
            {formAlmacen.id ? "Guardar cambios" : "Crear almacén"}
          </button>
          <button type="button" className="erp-btn erp-btn-secondary" onClick={() => cerrarPestana(pestanaActiva)}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

export function FichaAlmacen({ almacenes, almacenId, abrirEditarAlmacen }) {
  const almacen = almacenes.find(a => a.id === almacenId);
  if (!almacen) return <div className="erp-empty-state">Almacén no encontrado</div>;

  return (
    <div className="erp-detail-view">
      <div className="erp-detail-header">
        <div className="erp-detail-title">
          <h2>{almacen.nombre}</h2>
          <span className={`erp-badge ${almacen.activo ? "erp-badge-success" : "erp-badge-danger"}`}>
            {almacen.activo ? "Activo" : "Inactivo"}
          </span>
        </div>
        <div className="erp-detail-actions">
          <button className="erp-btn erp-btn-secondary" onClick={() => abrirEditarAlmacen(almacen)}>
            ✏️ Editar
          </button>
        </div>
      </div>

      <div className="erp-detail-body">
        <section className="erp-detail-section">
          <h4 className="erp-section-title">Información General</h4>
          <div className="erp-data-grid">
            <div className="erp-data-row">
              <span className="erp-data-label">Nombre</span>
              <span className="erp-data-value">{almacen.nombre}</span>
            </div>
            <div className="erp-data-row">
              <span className="erp-data-label">Descripción</span>
              <span className="erp-data-value">{almacen.descripcion || "—"}</span>
            </div>
            <div className="erp-data-row">
              <span className="erp-data-label">Dirección</span>
              <span className="erp-data-value">{almacen.direccion || "—"}</span>
            </div>
            <div className="erp-data-row">
              <span className="erp-data-label">Estado</span>
              <span className="erp-data-value">
                <span className={`erp-badge ${almacen.activo ? "erp-badge-success" : "erp-badge-danger"}`}>
                  {almacen.activo ? "Activo" : "Inactivo"}
                </span>
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
