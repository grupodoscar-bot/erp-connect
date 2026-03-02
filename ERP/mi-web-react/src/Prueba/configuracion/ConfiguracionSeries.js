import React from "react";
import { IconEdit, IconDelete } from "../iconos";

const IconCheck = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
  </svg>
);

const IconX = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
  </svg>
);

export function ConfiguracionSeries({
  series,
  formSerie,
  cargando,
  modoEdicion,
  tiposDocumentoOptions,
  limpiarFormSerie,
  editarSerie,
  updateFormSerieField,
  guardarSerie,
  eliminarSerie,
  reiniciarContador,
  usuarios,
  cargandoUsuarios,
  preferenciaForm,
  preferenciaActual,
  updatePreferenciaFormField,
  guardarPreferenciaUsuario,
  guardandoPreferenciaUsuario,
  cargandoPreferenciaUsuario,
  seriesPorTipo,
  almacenes = [],
  tarifas = [],
  permitirMultitarifa = false,
}) {
  const getTipoDocumentoLabel = (tipo) => {
    const opcion = tiposDocumentoOptions.find((opt) => opt.value === tipo);
    return opcion ? opcion.label : tipo;
  };

  const seriesDisponiblesParaTipo = seriesPorTipo
    ? seriesPorTipo(preferenciaForm?.tipoDocumento).filter(s => s.activo && s.permiteSeleccionUsuario)
    : series.filter((serie) => serie.tipoDocumento === preferenciaForm?.tipoDocumento && serie.activo && serie.permiteSeleccionUsuario);

  return (
    <div className="erp-config-view">
      <div className="erp-config-header">
        <h2>Configuración de Series</h2>
        <p className="erp-config-description">
          Gestiona las series de numeración para los diferentes tipos de documentos.
          Cada serie define un prefijo y formato para la numeración automática.
        </p>
      </div>

      <div className="erp-config-content">
        {/* Formulario de creación/edición */}
        <div className="erp-config-section">
          <h3>{modoEdicion ? "Editar Serie" : "Nueva Serie"}</h3>
          <form onSubmit={guardarSerie} className="erp-form">
            <div className="erp-form-row erp-form-row-3">
              <label className="erp-field">
                <span className="erp-field-label">Tipo de Documento *</span>
                <select
                  value={formSerie.tipoDocumento}
                  onChange={(e) =>
                    updateFormSerieField("tipoDocumento", e.target.value)
                  }
                  required
                  disabled={modoEdicion}
                >
                  <option value="">Selecciona un tipo</option>
                  {tiposDocumentoOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {modoEdicion && (
                  <small style={{ color: '#6b7280', marginTop: '4px', display: 'block' }}>
                    El tipo de documento no se puede modificar
                  </small>
                )}
              </label>
              <label className="erp-field">
                <span className="erp-field-label">Prefijo *</span>
                <input
                  type="text"
                  className="erp-input-mono"
                  value={formSerie.prefijo}
                  onChange={(e) =>
                    updateFormSerieField("prefijo", e.target.value.toUpperCase())
                  }
                  placeholder="Ej: VF25"
                  maxLength="10"
                  required
                  style={{ textTransform: 'uppercase' }}
                />
                <small style={{ color: '#6b7280', marginTop: '4px', display: 'block' }}>
                  Prefijo que aparecerá en el número (ej: VF25-00001)
                </small>
              </label>
              <label className="erp-field">
                <span className="erp-field-label">Longitud del Correlativo</span>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formSerie.longitudCorrelativo}
                  onChange={(e) =>
                    updateFormSerieField("longitudCorrelativo", e.target.value)
                  }
                  placeholder="5"
                />
                <small style={{ color: '#6b7280', marginTop: '4px', display: 'block' }}>
                  Número de dígitos (ej: 5 = 00001)
                </small>
              </label>
            </div>

            <div className="erp-form-row erp-form-row-3">
              <label className="erp-field">
                <span className="erp-field-label">Descripción</span>
                <input
                  type="text"
                  value={formSerie.descripcion}
                  onChange={(e) =>
                    updateFormSerieField("descripcion", e.target.value)
                  }
                  placeholder="Descripción de la serie"
                />
              </label>
              <label className="erp-field">
                <span className="erp-field-label">Almacén predeterminado</span>
                <select
                  value={formSerie.almacenPredeterminadoId || ""}
                  onChange={(e) =>
                    updateFormSerieField("almacenPredeterminadoId", e.target.value)
                  }
                >
                  <option value="">Sin almacén predeterminado</option>
                  {almacenes.filter(a => a.activo).map((alm) => (
                    <option key={alm.id} value={alm.id}>
                      {alm.nombre}
                    </option>
                  ))}
                </select>
                <small style={{ color: '#6b7280', marginTop: '4px', display: 'block' }}>
                  Se usará en documentos de esta serie
                </small>
              </label>
              <div className="erp-field">
                <span className="erp-field-label">Opciones</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                    <input
                      type="checkbox"
                      checked={formSerie.activo}
                      onChange={(e) =>
                        updateFormSerieField("activo", e.target.checked)
                      }
                    />
                    Serie activa
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                    <input
                      type="checkbox"
                      checked={formSerie.defaultSistema}
                      onChange={(e) =>
                        updateFormSerieField("defaultSistema", e.target.checked)
                      }
                    />
                    Serie predeterminada del sistema
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                    <input
                      type="checkbox"
                      checked={formSerie.permiteSeleccionUsuario}
                      onChange={(e) =>
                        updateFormSerieField("permiteSeleccionUsuario", e.target.checked)
                      }
                    />
                    Permitir selección por usuario
                  </label>
                </div>
              </div>

              {/* Configuración de tarifa predeterminada */}
              {permitirMultitarifa && tarifas && tarifas.length > 0 && (
                <div className="erp-field">
                  <label className="erp-field-label">Tarifa predeterminada</label>
                  <select
                    value={formSerie.tarifaPredeterminadaId || ""}
                    onChange={(e) => updateFormSerieField("tarifaPredeterminadaId", e.target.value)}
                  >
                    <option value="">Sin tarifa específica (usar configuración global)</option>
                    {tarifas.map((tarifa) => (
                      <option key={tarifa.id} value={tarifa.id}>
                        {tarifa.nombre} {tarifa.esGeneral ? "(General)" : ""}
                      </option>
                    ))}
                  </select>
                  <small style={{ color: '#6b7280', marginTop: '4px', display: 'block' }}>
                    Al crear documentos con esta serie, se seleccionará automáticamente esta tarifa
                  </small>
                </div>
              )}
            </div>

            <div className="erp-form-actions">
              <button
                type="submit"
                className="erp-btn erp-btn-primary"
                disabled={cargando}
              >
                {cargando ? "Guardando..." : modoEdicion ? "Actualizar Serie" : "Crear Serie"}
              </button>
              {modoEdicion && (
                <button
                  type="button"
                  className="erp-btn erp-btn-secondary"
                  onClick={limpiarFormSerie}
                  disabled={cargando}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Lista de series existentes */}
        <div className="erp-config-section">
          <h3>Series Configuradas</h3>
          {cargando && series.length === 0 ? (
            <p>Cargando series...</p>
          ) : series.length === 0 ? (
            <p className="erp-empty-message">
              No hay series configuradas. Crea la primera serie usando el formulario anterior.
            </p>
          ) : (
            <div className="erp-table-container">
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>Tipo de Documento</th>
                    <th>Prefijo</th>
                    <th>Descripción</th>
                    <th>Almacén</th>
                    {permitirMultitarifa && <th>Tarifa</th>}
                    <th style={{ textAlign: 'center' }}>Long. Corr.</th>
                    <th style={{ textAlign: 'center' }}>Activa</th>
                    <th style={{ textAlign: 'center' }}>Predeterminada</th>
                    <th style={{ textAlign: 'center' }}>Selección Usuario</th>
                    <th style={{ width: '120px', textAlign: 'center' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {series.map((serie) => (
                    <tr key={serie.id}>
                      <td>{getTipoDocumentoLabel(serie.tipoDocumento)}</td>
                      <td className="erp-td-mono" style={{ fontWeight: '600' }}>
                        {serie.prefijo}
                      </td>
                      <td>{serie.descripcion || "—"}</td>
                      <td>{serie.almacenPredeterminado?.nombre || "—"}</td>
                      {permitirMultitarifa && (
                        <td>
                          {serie.tarifaPredeterminadaId 
                            ? tarifas.find(t => t.id === serie.tarifaPredeterminadaId)?.nombre || "—"
                            : "—"
                          }
                        </td>
                      )}
                      <td className="erp-td-mono erp-td-center">
                        {serie.longitudCorrelativo}
                      </td>
                      <td className="erp-td-center">
                        {serie.activo ? (
                          <IconCheck className="erp-icon-success" />
                        ) : (
                          <IconX className="erp-icon-danger" />
                        )}
                      </td>
                      <td className="erp-td-center">
                        {serie.defaultSistema ? (
                          <IconCheck className="erp-icon-success" />
                        ) : (
                          <IconX className="erp-icon-muted" />
                        )}
                      </td>
                      <td className="erp-td-center">
                        {serie.permiteSeleccionUsuario ? (
                          <IconCheck className="erp-icon-success" />
                        ) : (
                          <IconX className="erp-icon-muted" />
                        )}
                      </td>
                      <td>
                        <div className="erp-action-buttons">
                          <button
                            className="erp-action-btn erp-action-edit"
                            onClick={() => editarSerie(serie)}
                            title="Editar"
                            disabled={cargando}
                          >
                            <IconEdit className="erp-action-icon" />
                          </button>
                          <button
                            className="erp-action-btn erp-action-secondary"
                            onClick={() => {
                              console.log('[DEBUG] Click reiniciarContador, serie.id:', serie.id, 'función:', reiniciarContador);
                              reiniciarContador && reiniciarContador(serie.id);
                            }}
                            title="Reiniciar contador (último usado +1)"
                            disabled={cargando}
                            style={{ backgroundColor: '#f59e0b', color: 'white' }}
                          >
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                              <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z"/>
                              <path fillRule="evenodd" d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.1z"/>
                            </svg>
                          </button>
                          <button
                            className="erp-action-btn erp-action-danger"
                            onClick={() => eliminarSerie(serie.id)}
                            title="Eliminar"
                            disabled={cargando}
                          >
                            <IconDelete className="erp-action-icon" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Preferencias por usuario */}
        <div className="erp-config-section">
          <h3>Preferencia de serie por usuario</h3>
          <p className="erp-config-description" style={{ marginBottom: '16px' }}>
            Define qué serie se seleccionará automáticamente para cada usuario y tipo de documento.
            Estas preferencias tienen prioridad sobre la predeterminada del sistema.
          </p>

          <div className="erp-form">
            <div className="erp-form-row erp-form-row-3">
              <label className="erp-field">
                <span className="erp-field-label">Usuario *</span>
                <select
                  value={preferenciaForm.usuarioId}
                  onChange={(e) => updatePreferenciaFormField("usuarioId", e.target.value)}
                >
                  <option value="">
                    {cargandoUsuarios ? "Cargando usuarios..." : "Selecciona un usuario"}
                  </option>
                  {usuarios.map((usuario) => (
                    <option key={usuario.id} value={usuario.id}>
                      {usuario.usuario} ({usuario.dni})
                    </option>
                  ))}
                </select>
              </label>

              <label className="erp-field">
                <span className="erp-field-label">Tipo de documento *</span>
                <select
                  value={preferenciaForm.tipoDocumento}
                  onChange={(e) => updatePreferenciaFormField("tipoDocumento", e.target.value)}
                >
                  {tiposDocumentoOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="erp-field">
                <span className="erp-field-label">Serie asignada</span>
                <select
                  value={preferenciaForm.serieId}
                  onChange={(e) => updatePreferenciaFormField("serieId", e.target.value)}
                  disabled={preferenciaForm.sinPreferencia || !seriesDisponiblesParaTipo.length}
                >
                  <option value="">
                    {cargandoPreferenciaUsuario
                      ? "Cargando..."
                      : seriesDisponiblesParaTipo.length
                        ? "Selecciona una serie"
                        : "No hay series disponibles"}
                  </option>
                  {seriesDisponiblesParaTipo.map((serie) => (
                    <option key={serie.id} value={serie.id}>
                      {serie.prefijo} — {serie.descripcion || "Sin descripción"}
                    </option>
                  ))}
                </select>
                {!seriesDisponiblesParaTipo.length && !preferenciaForm.sinPreferencia && (
                  <small style={{ color: '#b91c1c', marginTop: '4px', display: 'block' }}>
                    No hay series activas para este tipo de documento.
                  </small>
                )}
              </label>
              <label className="erp-field" style={{ alignSelf: 'flex-end' }}>
                <span className="erp-field-label">Sin preferencia</span>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                  <input
                    type="checkbox"
                    checked={preferenciaForm.sinPreferencia}
                    onChange={(e) => updatePreferenciaFormField("sinPreferencia", e.target.checked)}
                    disabled={!preferenciaForm.usuarioId}
                  />
                  Usar serie predeterminada del sistema
                </label>
              </label>
            </div>

            {preferenciaActual && (
              <div className="erp-alert-info" style={{ marginBottom: '16px' }}>
                Preferencia actual:&nbsp;
                {preferenciaActual?.serie ? (
                  <>
                    <strong>{preferenciaActual.serie.prefijo}</strong> — {preferenciaActual.serie.descripcion || "Sin descripción"}.
                  </>
                ) : (
                  <>Sin asignar (usando predeterminada del documento).</>
                )}
              </div>
            )}

            <div className="erp-form-actions">
              <button
                type="button"
                className="erp-btn erp-btn-primary"
                onClick={guardarPreferenciaUsuario}
                disabled={
                  guardandoPreferenciaUsuario ||
                  !preferenciaForm.usuarioId ||
                  !preferenciaForm.tipoDocumento ||
                  (!preferenciaForm.sinPreferencia && !preferenciaForm.serieId)
                }
              >
                {guardandoPreferenciaUsuario ? "Guardando..." : "Guardar preferencia"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
