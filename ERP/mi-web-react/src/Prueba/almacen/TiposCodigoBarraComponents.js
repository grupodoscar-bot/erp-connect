import React from "react";
import { IconEdit, IconDelete, IconProveta } from "../iconos";

export function ListaTiposCodigoBarra({
  tipos,
  abrirNuevoTipo,
  abrirVerTipo,
  abrirEditarTipo,
  abrirModalPrueba,
  borrarTipo,
  calcularLongitudTotal,
}) {
  return (
    <div className="erp-list-view">
      <div className="erp-list-toolbar">
        <button className="erp-btn erp-btn-primary" onClick={abrirNuevoTipo}>
          + Nuevo Tipo
        </button>
        <div className="erp-search">
          <input type="text" placeholder="Buscar tipo..." />
        </div>
      </div>

      <div className="erp-cards-grid">
        {tipos.map((tipo) => (
          <div key={tipo.id} className="erp-card">
            <div className="erp-card-header">
              <h3 className="erp-card-title">{tipo.nombre}</h3>
              <div className="erp-card-actions">
                <button 
                  className="erp-action-btn erp-action-info" 
                  onClick={() => abrirModalPrueba(tipo)} 
                  title="Probar código"
                >
                  <IconProveta className="erp-action-icon" />
                </button>
                <button className="erp-action-btn" onClick={() => abrirEditarTipo(tipo)} title="Editar">
                  <IconEdit className="erp-action-icon" />
                </button>
                <button className="erp-action-btn erp-action-danger" onClick={() => borrarTipo(tipo.id)} title="Eliminar">
                  <IconDelete className="erp-action-icon" />
                </button>
              </div>
            </div>
            
            {tipo.descripcion && (
              <p className="erp-card-description">{tipo.descripcion}</p>
            )}

            <div className="erp-card-badges">
              <span className="erp-badge erp-badge-info">
                {tipo.campos?.length || 0} campo{tipo.campos?.length !== 1 ? "s" : ""}
              </span>
              <span className="erp-badge erp-badge-info">
                Longitud: {calcularLongitudTotal(tipo.campos || [])}
              </span>
            </div>

            <div className="erp-card-fields">
              {tipo.campos?.slice().sort((a, b) => a.orden - b.orden).map((campo, index) => (
                <div key={index} className="erp-card-field">
                  <span className="erp-card-field-name">{campo.nombre}</span>
                  <span className="erp-card-field-length">{campo.longitud}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
        {tipos.length === 0 && (
          <div className="erp-empty-state">No hay tipos de código de barras</div>
        )}
      </div>
    </div>
  );
}

export function FormularioTipoCodigoBarra({
  formTipo,
  seccionFormActiva,
  setSeccionFormActiva,
  updateFormTipoField,
  agregarCampo,
  eliminarCampo,
  actualizarCampo,
  guardarTipo,
  cerrarPestana,
  pestanaActiva,
  calcularLongitudTotal,
}) {
  return (
    <div className="erp-form-view">
      <form onSubmit={guardarTipo}>
        <div className="erp-form-tabs">
          {["general", "campos"].map(sec => (
            <button
              key={sec}
              type="button"
              className={`erp-form-tab ${seccionFormActiva === sec ? "active" : ""}`}
              onClick={() => setSeccionFormActiva(sec)}
            >
              {sec === "general" && "Información General"}
              {sec === "campos" && "Campos del Código"}
            </button>
          ))}
        </div>

        <div className="erp-form-content">
          {seccionFormActiva === "general" && (
            <div className="erp-form-section">
              <div className="erp-form-group">
                <h4 className="erp-form-group-title">Datos del tipo</h4>
                <div className="erp-form-row">
                  <label className="erp-field erp-field-full">
                    <span className="erp-field-label">Nombre del tipo *</span>
                    <input
                      type="text"
                      value={formTipo.nombre}
                      onChange={(e) => updateFormTipoField("nombre", e.target.value)}
                      required
                      placeholder="Ej: Código EAN-13, Código personalizado..."
                    />
                  </label>
                </div>
                <div className="erp-form-row">
                  <label className="erp-field erp-field-full">
                    <span className="erp-field-label">Descripción</span>
                    <textarea
                      rows="3"
                      value={formTipo.descripcion}
                      onChange={(e) => updateFormTipoField("descripcion", e.target.value)}
                      placeholder="Descripción opcional"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {seccionFormActiva === "campos" && (
            <div className="erp-form-section">
              <div className="erp-form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <span className="erp-badge erp-badge-info" style={{ fontSize: '13px', padding: '6px 12px' }}>
                      Longitud total: <strong>{calcularLongitudTotal(formTipo.campos)}</strong> caracteres
                    </span>
                  </div>
                  <button type="button" className="erp-btn erp-btn-secondary" onClick={agregarCampo}>
                    + Agregar campo
                  </button>
                </div>

                <div className="erp-campos-list">
                  {formTipo.campos.map((campo, index) => (
                    <div key={index} className="erp-campo-row">
                      <div className="erp-campo-orden">
                        <span>⋮⋮</span>
                        <span>{index + 1}</span>
                      </div>
                      <input
                        type="text"
                        placeholder="Nombre del campo"
                        value={campo.nombre}
                        onChange={(e) => actualizarCampo(index, "nombre", e.target.value)}
                        required
                        className="erp-campo-nombre"
                      />
                      <input
                        type="number"
                        min="1"
                        max="999"
                        placeholder="Long."
                        value={campo.longitud}
                        onChange={(e) => actualizarCampo(index, "longitud", e.target.value)}
                        required
                        className="erp-campo-longitud erp-input-mono"
                      />
                      <input
                        type="number"
                        min="0"
                        max="9"
                        placeholder="Dec."
                        value={campo.decimales}
                        onChange={(e) => actualizarCampo(index, "decimales", e.target.value)}
                        title="Número de decimales"
                        className="erp-campo-decimales erp-input-mono"
                      />
                      <button
                        type="button"
                        className="erp-action-btn erp-action-danger"
                        onClick={() => eliminarCampo(index)}
                        disabled={formTipo.campos.length === 1}
                        title="Eliminar campo"
                      >
                        <IconDelete className="erp-action-icon" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="erp-form-actions">
          <button type="submit" className="erp-btn erp-btn-primary">
            {formTipo.id ? "Guardar cambios" : "Crear tipo"}
          </button>
          <button type="button" className="erp-btn erp-btn-secondary" onClick={() => cerrarPestana(pestanaActiva)}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

export function FichaTipoCodigoBarra({ tipos, tipoId, abrirEditarTipo, abrirModalPrueba, calcularLongitudTotal }) {
  const tipo = tipos.find(t => t.id === tipoId);
  if (!tipo) return <div className="erp-empty-state">Tipo no encontrado</div>;

  return (
    <div className="erp-detail-view">
      <div className="erp-detail-header">
        <div className="erp-detail-title">
          <h2>{tipo.nombre}</h2>
          <span className="erp-detail-subtitle">
            {tipo.campos?.length || 0} campos · {calcularLongitudTotal(tipo.campos || [])} caracteres
          </span>
        </div>
        <div className="erp-detail-actions">
          <button className="erp-btn erp-btn-info" onClick={() => abrirModalPrueba(tipo)}>
            <IconProveta className="erp-action-icon" /> Probar
          </button>
          <button className="erp-btn erp-btn-secondary" onClick={() => abrirEditarTipo(tipo)}>
            <IconEdit className="erp-action-icon" /> Editar
          </button>
        </div>
      </div>

      <div className="erp-detail-body">
        {tipo.descripcion && (
          <section className="erp-detail-section">
            <h4 className="erp-section-title">Descripción</h4>
            <div className="erp-observations">{tipo.descripcion}</div>
          </section>
        )}

        <section className="erp-detail-section">
          <h4 className="erp-section-title">Campos del código</h4>
          <div className="erp-card-fields" style={{ marginTop: '12px' }}>
            {tipo.campos?.slice().sort((a, b) => a.orden - b.orden).map((campo, index) => (
              <div key={index} className="erp-card-field">
                <span className="erp-card-field-name">
                  {campo.nombre}
                  {campo.decimales > 0 && (
                    <span style={{ marginLeft: '8px', fontSize: '11px', color: 'var(--erp-accent)' }}>
                      ({campo.decimales} dec.)
                    </span>
                  )}
                </span>
                <span className="erp-card-field-length">{campo.longitud}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export function ModalPruebaCodigo({
  tipoPrueba,
  codigoPrueba,
  setCodigoPrueba,
  resultadoPrueba,
  modalPruebaAbierto,
  cerrarModalPrueba,
  comprobarCodigo,
  calcularLongitudTotal,
}) {
  if (!modalPruebaAbierto || !tipoPrueba) return null;

  const longitudEsperada = calcularLongitudTotal(tipoPrueba.campos || []);

  return (
    <div className="erp-modal-overlay" onClick={cerrarModalPrueba}>
      <div className="erp-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
        <div className="erp-modal-header">
          <h3><IconProveta className="erp-action-icon" /> Probar: {tipoPrueba.nombre}</h3>
          <button className="erp-modal-close" onClick={cerrarModalPrueba}>×</button>
        </div>
        <div className="erp-modal-body">
          <div className="erp-form-group">
            <p style={{ color: 'var(--erp-text-secondary)', marginBottom: '12px' }}>
              Introduce un código numérico para ver cómo se divide según los campos configurados.
            </p>
            <span className="erp-badge erp-badge-info" style={{ marginBottom: '16px', display: 'inline-block' }}>
              Longitud esperada: <strong>{longitudEsperada}</strong> caracteres
            </span>

            <label className="erp-field">
              <span className="erp-field-label">Código</span>
              <div style={{ display: 'flex', gap: '12px' }}>
                <input
                  type="text"
                  value={codigoPrueba}
                  onChange={(e) => setCodigoPrueba(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && comprobarCodigo()}
                  placeholder={`Hasta ${longitudEsperada} caracteres`}
                  className="erp-input-mono"
                  style={{ flex: 1 }}
                  autoFocus
                />
                <button
                  type="button"
                  className="erp-btn erp-btn-primary"
                  onClick={comprobarCodigo}
                  disabled={!codigoPrueba}
                >
                  Comprobar
                </button>
              </div>
              <small style={{ color: 'var(--erp-text-muted)', marginTop: '4px' }}>
                Longitud actual: <strong>{codigoPrueba.length}</strong>
              </small>
            </label>
          </div>

          {resultadoPrueba && (
            <div className="erp-form-group" style={{ marginTop: '20px' }}>
              <h4 className="erp-form-group-title">Resultado del parseo</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {resultadoPrueba.resultado.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: `1px solid ${item.completo ? '#86efac' : '#fed7aa'}`,
                      background: item.completo ? '#f0fdf4' : '#fffbeb',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 600 }}>
                        {item.nombre}
                        {item.decimales > 0 && (
                          <span className="erp-badge erp-badge-info" style={{ marginLeft: '8px', fontSize: '10px' }}>
                            {item.decimales} dec.
                          </span>
                        )}
                      </span>
                      <span style={{ color: 'var(--erp-text-muted)', fontSize: '12px' }}>
                        {item.valor.length} / {tipoPrueba.campos.find(c => c.nombre === item.nombre)?.longitud || 0}
                      </span>
                    </div>
                    <div style={{ fontFamily: 'var(--erp-font-mono)', fontSize: '16px' }}>
                      {item.valor ? (
                        <>
                          <span>{item.valor}</span>
                          {item.decimales > 0 && item.completo && (
                            <span style={{ color: 'var(--erp-accent)', marginLeft: '12px' }}>
                              → {item.valorFormateado}
                            </span>
                          )}
                        </>
                      ) : (
                        <span style={{ color: 'var(--erp-text-muted)' }}>(vacío)</span>
                      )}
                    </div>
                    {!item.completo && item.valor && (
                      <div style={{ color: '#f59e0b', marginTop: '6px', fontSize: '12px' }}>
                        ⚠️ Incompleto
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {resultadoPrueba.sobrante && (
                <div style={{
                  marginTop: '12px',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid #fca5a5',
                  background: '#fef2f2',
                  color: '#991b1b',
                }}>
                  <strong>⚠️ Caracteres sobrantes:</strong>
                  <div style={{ fontFamily: 'var(--erp-font-mono)', marginTop: '6px' }}>
                    {resultadoPrueba.sobrante} ({resultadoPrueba.sobrante.length} caracteres)
                  </div>
                </div>
              )}

              {codigoPrueba.length === longitudEsperada && !resultadoPrueba.sobrante && (
                <div style={{
                  marginTop: '12px',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid #86efac',
                  background: '#f0fdf4',
                  color: '#166534',
                  fontWeight: 600,
                }}>
                  ✅ El código tiene la longitud exacta y todos los campos están completos
                </div>
              )}
            </div>
          )}
        </div>
        <div className="erp-modal-footer">
          <button type="button" className="erp-btn erp-btn-secondary" onClick={cerrarModalPrueba}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
