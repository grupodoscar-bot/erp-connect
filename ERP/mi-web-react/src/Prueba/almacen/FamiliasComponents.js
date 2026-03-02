import React from "react";
import { IconEye, IconEdit, IconDelete } from "../iconos";

export function ListaFamilias({
  familias,
  abrirNuevaFamilia,
  abrirVerFamilia,
  abrirEditarFamilia,
  borrarFamilia,
}) {
  return (
    <div className="erp-list-view">
      <div className="erp-list-toolbar">
        <button className="erp-btn erp-btn-primary" onClick={abrirNuevaFamilia}>
          + Nueva Familia
        </button>
        <div className="erp-search">
          <input type="text" placeholder="Buscar familia..." />
        </div>
      </div>

      <table className="erp-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Descripción</th>
            <th className="erp-th-actions">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {familias.map((f) => (
            <tr key={f.id} onDoubleClick={() => abrirVerFamilia(f)}>
              <td className="erp-td-mono">{f.id}</td>
              <td className="erp-td-main">{f.nombre}</td>
              <td>{f.descripcion || "—"}</td>
              <td className="erp-td-actions">
                <button className="erp-action-btn" onClick={() => abrirVerFamilia(f)} title="Ver">
                  <IconEye className="erp-action-icon" />
                </button>
                <button className="erp-action-btn" onClick={() => abrirEditarFamilia(f)} title="Editar">
                  <IconEdit className="erp-action-icon" />
                </button>
                <button className="erp-action-btn erp-action-danger" onClick={() => borrarFamilia(f.id)} title="Eliminar">
                  <IconDelete className="erp-action-icon" />
                </button>
              </td>
            </tr>
          ))}
          {familias.length === 0 && (
            <tr><td colSpan="4" className="erp-td-empty">No hay familias</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export function FormularioFamilia({
  formFamilia,
  updateFormFamiliaField,
  guardarFamilia,
  cerrarPestana,
  pestanaActiva,
}) {
  return (
    <div className="erp-form-view">
      <form onSubmit={guardarFamilia}>
        <div className="erp-form-content">
          <div className="erp-form-section">
            <div className="erp-form-group">
              <h4 className="erp-form-group-title">Datos de la familia</h4>
              <div className="erp-form-row">
                <label className="erp-field erp-field-full">
                  <span className="erp-field-label">Nombre *</span>
                  <input
                    type="text"
                    value={formFamilia.nombre}
                    onChange={(e) => updateFormFamiliaField("nombre", e.target.value)}
                    required
                  />
                </label>
              </div>
              <div className="erp-form-row">
                <label className="erp-field erp-field-full">
                  <span className="erp-field-label">Descripción *</span>
                  <textarea
                    rows="3"
                    value={formFamilia.descripcion}
                    onChange={(e) => updateFormFamiliaField("descripcion", e.target.value)}
                    required
                  />
                </label>
              </div>
              <div className="erp-form-row">
                <label className="erp-field erp-field-half">
                  <span className="erp-field-label">Color para TPV</span>
                  <input
                    type="color"
                    value={formFamilia.colorTPV}
                    onChange={(e) => updateFormFamiliaField("colorTPV", e.target.value)}
                    title="Color que se mostrará junto al producto en el TPV"
                  />
                </label>
                <label className="erp-field erp-field-half">
                  <span className="erp-field-label">Código HEX</span>
                  <input
                    type="text"
                    value={formFamilia.colorTPV}
                    onChange={(e) => updateFormFamiliaField("colorTPV", e.target.value)}
                    placeholder="#1d4ed8"
                    pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                  />
                </label>
              </div>

              <div className="erp-form-row">
                <div className="erp-form-group" style={{ width: "100%" }}>
                  <h4 className="erp-form-group-title">Imagen de la familia</h4>
                  <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                    {(formFamilia.imagenFile || (formFamilia.imagen && formFamilia.id)) && (
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
                            formFamilia.imagenFile
                              ? URL.createObjectURL(formFamilia.imagenFile)
                              : `http://145.223.103.219:8080/familias/${formFamilia.id}/imagen`
                          }
                          alt="Familia"
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
                              updateFormFamiliaField("imagenFile", file);
                            }
                          }}
                        />
                      </label>
                      {(formFamilia.imagenFile || formFamilia.imagen) && (
                        <button
                          type="button"
                          className="erp-btn erp-btn-secondary"
                          style={{ marginTop: "8px" }}
                          onClick={() => {
                            updateFormFamiliaField("imagenFile", null);
                            updateFormFamiliaField("imagen", null);
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
            {formFamilia.id ? "Guardar cambios" : "Crear familia"}
          </button>
          <button type="button" className="erp-btn erp-btn-secondary" onClick={() => cerrarPestana(pestanaActiva)}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

export function FichaFamilia({ familias, familiaId, abrirEditarFamilia }) {
  const familia = familias.find(f => f.id === familiaId);
  if (!familia) return <div className="erp-empty-state">Familia no encontrada</div>;

  return (
    <div className="erp-detail-view">
      <div className="erp-detail-header">
        <div className="erp-detail-title">
          <h2>{familia.nombre}</h2>
          <span className="erp-detail-subtitle">ID: {familia.id}</span>
        </div>
        <div className="erp-detail-actions">
          <button className="erp-btn erp-btn-secondary" onClick={() => abrirEditarFamilia(familia)}>
            ✏️ Editar
          </button>
        </div>
      </div>

      <div className="erp-detail-body">
        <section className="erp-detail-section">
          <h4 className="erp-section-title">Información de la familia</h4>
          <div className="erp-data-grid">
            <div className="erp-data-row">
              <span className="erp-data-label">Nombre</span>
              <span className="erp-data-value">{familia.nombre}</span>
            </div>
            <div className="erp-data-row">
              <span className="erp-data-label">Descripción</span>
              <span className="erp-data-value">{familia.descripcion || "—"}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
