import React from "react";
import { IconEye, IconEdit, IconDelete } from "../iconos";

export function ListaSubfamilias({
  subfamilias,
  abrirNuevaSubfamilia,
  abrirVerSubfamilia,
  abrirEditarSubfamilia,
  borrarSubfamilia,
}) {
  return (
    <div className="erp-list-view">
      <div className="erp-list-toolbar">
        <button className="erp-btn erp-btn-primary" onClick={abrirNuevaSubfamilia}>
          + Nueva Subfamilia
        </button>
        <div className="erp-search">
          <input type="text" placeholder="Buscar subfamilia..." />
        </div>
      </div>

      <table className="erp-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Familia</th>
            <th className="erp-th-actions">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {subfamilias.map((sf) => (
            <tr key={sf.id} onDoubleClick={() => abrirVerSubfamilia(sf)}>
              <td className="erp-td-mono">{sf.id}</td>
              <td className="erp-td-main">{sf.nombre}</td>
              <td>{sf.descripcion || "—"}</td>
              <td>
                {sf.familia ? (
                  <span className="erp-badge">{sf.familia.nombre}</span>
                ) : "—"}
              </td>
              <td className="erp-td-actions">
                <button className="erp-action-btn" onClick={() => abrirVerSubfamilia(sf)} title="Ver">
                  <IconEye className="erp-action-icon" />
                </button>
                <button className="erp-action-btn" onClick={() => abrirEditarSubfamilia(sf)} title="Editar">
                  <IconEdit className="erp-action-icon" />
                </button>
                <button className="erp-action-btn erp-action-danger" onClick={() => borrarSubfamilia(sf.id)} title="Eliminar">
                  <IconDelete className="erp-action-icon" />
                </button>
              </td>
            </tr>
          ))}
          {subfamilias.length === 0 && (
            <tr><td colSpan="5" className="erp-td-empty">No hay subfamilias</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export function FormularioSubfamilia({
  formSubfamilia,
  familiasDisponibles,
  updateFormSubfamiliaField,
  guardarSubfamilia,
  cerrarPestana,
  pestanaActiva,
}) {
  return (
    <div className="erp-form-view">
      <form onSubmit={guardarSubfamilia}>
        <div className="erp-form-content">
          <div className="erp-form-section">
            <div className="erp-form-group">
              <h4 className="erp-form-group-title">Datos de la subfamilia</h4>
              <div className="erp-form-row">
                <label className="erp-field">
                  <span className="erp-field-label">Nombre *</span>
                  <input
                    type="text"
                    value={formSubfamilia.nombre}
                    onChange={(e) => updateFormSubfamiliaField("nombre", e.target.value)}
                    required
                  />
                </label>
                <label className="erp-field">
                  <span className="erp-field-label">Familia</span>
                  <select
                    value={formSubfamilia.familiaId}
                    onChange={(e) => updateFormSubfamiliaField("familiaId", e.target.value)}
                  >
                    <option value="">Sin familia</option>
                    {familiasDisponibles.map((f) => (
                      <option key={f.id} value={f.id}>{f.nombre}</option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="erp-form-row">
                <label className="erp-field erp-field-full">
                  <span className="erp-field-label">Descripción *</span>
                  <textarea
                    rows="3"
                    value={formSubfamilia.descripcion}
                    onChange={(e) => updateFormSubfamiliaField("descripcion", e.target.value)}
                    required
                  />
                </label>
              </div>

              <div className="erp-form-row">
                <div className="erp-form-group" style={{ width: "100%" }}>
                  <h4 className="erp-form-group-title">Imagen de la subfamilia</h4>
                  <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                    {(formSubfamilia.imagenFile || (formSubfamilia.imagen && formSubfamilia.id)) && (
                      <div
                        style={{
                          width: "150px",
                          height: "150px",
                          border: "2px solid var(--erp-border)",
                          borderRadius: "8px",
                          overflow: "hidden",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "var(--erp-bg-section)",
                        }}
                      >
                        <img
                          src={
                            formSubfamilia.imagenFile
                              ? URL.createObjectURL(formSubfamilia.imagenFile)
                              : `http://145.223.103.219:8080/subfamilias/${formSubfamilia.id}/imagen`
                          }
                          alt="Subfamilia"
                          style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                        />
                      </div>
                    )}
                    <div style={{ flex: 1 }}>
                      <label className="erp-field">
                        <span className="erp-field-label">Seleccionar imagen</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              updateFormSubfamiliaField("imagenFile", file);
                            }
                          }}
                        />
                      </label>
                      {(formSubfamilia.imagenFile || formSubfamilia.imagen) && (
                        <button
                          type="button"
                          className="erp-btn erp-btn-secondary"
                          style={{ marginTop: "8px" }}
                          onClick={() => {
                            updateFormSubfamiliaField("imagenFile", null);
                            updateFormSubfamiliaField("imagen", null);
                          }}
                        >
                          Eliminar imagen
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="erp-form-actions">
          <button type="submit" className="erp-btn erp-btn-primary">
            {formSubfamilia.id ? "Guardar cambios" : "Crear subfamilia"}
          </button>
          <button type="button" className="erp-btn erp-btn-secondary" onClick={() => cerrarPestana(pestanaActiva)}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

export function FichaSubfamilia({ subfamilias, subfamiliaId, abrirEditarSubfamilia }) {
  const subfamilia = subfamilias.find(sf => sf.id === subfamiliaId);
  if (!subfamilia) return <div className="erp-empty-state">Subfamilia no encontrada</div>;

  return (
    <div className="erp-detail-view">
      <div className="erp-detail-header">
        <div className="erp-detail-title">
          <h2>{subfamilia.nombre}</h2>
          <span className="erp-detail-subtitle">ID: {subfamilia.id}</span>
        </div>
        <div className="erp-detail-actions">
          <button className="erp-btn erp-btn-secondary" onClick={() => abrirEditarSubfamilia(subfamilia)}>
            ✏️ Editar
          </button>
        </div>
      </div>

      <div className="erp-detail-body">
        <section className="erp-detail-section">
          <h4 className="erp-section-title">Información de la subfamilia</h4>
          <div className="erp-data-grid">
            <div className="erp-data-row">
              <span className="erp-data-label">Nombre</span>
              <span className="erp-data-value">{subfamilia.nombre}</span>
            </div>
            <div className="erp-data-row">
              <span className="erp-data-label">Descripción</span>
              <span className="erp-data-value">{subfamilia.descripcion || "—"}</span>
            </div>
            <div className="erp-data-row">
              <span className="erp-data-label">Familia</span>
              <span className="erp-data-value">{subfamilia.familia?.nombre || "Sin familia"}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
