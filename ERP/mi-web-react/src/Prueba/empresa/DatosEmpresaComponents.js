import React, { useRef } from "react";

export function VistaDatosEmpresa({
  empresa,
  formEmpresa,
  logoPreview,
  abrirEditarEmpresa,
}) {
  if (!empresa) {
    return <div className="erp-empty-state">Cargando datos de la empresa...</div>;
  }

  return (
    <div className="erp-detail-view">
      <div className="erp-detail-header">
        <div className="erp-detail-title">
          <h2>{formEmpresa.nombreComercial || "Empresa"}</h2>
          <span className="erp-detail-subtitle">Datos de la empresa</span>
        </div>
        <div className="erp-detail-actions">
          <button className="erp-btn erp-btn-secondary" onClick={abrirEditarEmpresa}>
            ✏️ Editar datos
          </button>
        </div>
      </div>

      <div className="erp-detail-body">
        {logoPreview && (
          <section className="erp-detail-section">
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              <img 
                src={logoPreview} 
                alt="Logo de la empresa" 
                style={{ maxWidth: '200px', maxHeight: '100px', objectFit: 'contain' }}
              />
            </div>
          </section>
        )}

        <section className="erp-detail-section">
          <h4 className="erp-section-title">Información básica</h4>
          <div className="erp-data-grid">
            <div className="erp-data-row">
              <span className="erp-data-label">Nombre comercial</span>
              <span className="erp-data-value">{formEmpresa.nombreComercial || "—"}</span>
            </div>
            <div className="erp-data-row">
              <span className="erp-data-label">Razón social</span>
              <span className="erp-data-value">{formEmpresa.razon || "—"}</span>
            </div>
            <div className="erp-data-row">
              <span className="erp-data-label">CIF</span>
              <span className="erp-data-value erp-mono">{formEmpresa.cif || "—"}</span>
            </div>
          </div>
        </section>

        <section className="erp-detail-section">
          <h4 className="erp-section-title">Dirección</h4>
          <div className="erp-data-grid">
            <div className="erp-data-row">
              <span className="erp-data-label">Dirección</span>
              <span className="erp-data-value">{formEmpresa.direccion || "—"}</span>
            </div>
            <div className="erp-data-row">
              <span className="erp-data-label">Código postal</span>
              <span className="erp-data-value erp-mono">{formEmpresa.codigoPostal || "—"}</span>
            </div>
            <div className="erp-data-row">
              <span className="erp-data-label">Población</span>
              <span className="erp-data-value">{formEmpresa.poblacion || "—"}</span>
            </div>
            <div className="erp-data-row">
              <span className="erp-data-label">Provincia</span>
              <span className="erp-data-value">{formEmpresa.provincia || "—"}</span>
            </div>
            <div className="erp-data-row">
              <span className="erp-data-label">País</span>
              <span className="erp-data-value">{formEmpresa.pais || "—"}</span>
            </div>
          </div>
        </section>

        <section className="erp-detail-section">
          <h4 className="erp-section-title">Contacto</h4>
          <div className="erp-data-grid">
            <div className="erp-data-row">
              <span className="erp-data-label">Teléfono</span>
              <span className="erp-data-value erp-mono">{formEmpresa.telefono || "—"}</span>
            </div>
            <div className="erp-data-row">
              <span className="erp-data-label">Email</span>
              <span className="erp-data-value">{formEmpresa.email || "—"}</span>
            </div>
          </div>
        </section>

        <section className="erp-detail-section">
          <h4 className="erp-section-title">Configuración SMTP</h4>
          <div className="erp-data-grid">
            <div className="erp-data-row">
              <span className="erp-data-label">Servidor SMTP</span>
              <span className="erp-data-value erp-mono">{formEmpresa.smtpHost || "No configurado"}</span>
            </div>
            <div className="erp-data-row">
              <span className="erp-data-label">Puerto</span>
              <span className="erp-data-value erp-mono">{formEmpresa.smtpPort || "—"}</span>
            </div>
            <div className="erp-data-row">
              <span className="erp-data-label">Usuario SMTP</span>
              <span className="erp-data-value">{formEmpresa.smtpUsername || "—"}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export function FormularioDatosEmpresa({
  formEmpresa,
  logoPreview,
  mostrarPassword,
  setMostrarPassword,
  probandoConexion,
  resultadoPrueba,
  handleLogoChange,
  guardarEmpresa,
  probarConexionEmail,
  usarConfiguracionGmail,
  usarConfiguracionOutlook,
  updateFormEmpresaField,
  cerrarPestana,
  pestanaActiva,
}) {
  const logoInputRef = useRef(null);

  const handleSubmit = (e) => {
    const logoFile = logoInputRef.current?.files[0];
    guardarEmpresa(e, logoFile);
  };

  return (
    <div className="erp-form-view">
      <form onSubmit={handleSubmit}>
        <div className="erp-form-content">
          <div className="erp-form-section">
            <div className="erp-form-group">
              <h4 className="erp-form-group-title">Logo de la empresa</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                {logoPreview && (
                  <img 
                    src={logoPreview} 
                    alt="Logo preview" 
                    style={{ maxWidth: '150px', maxHeight: '80px', objectFit: 'contain', border: '1px solid var(--erp-border)', borderRadius: '4px', padding: '8px' }}
                  />
                )}
                <label className="erp-field">
                  <span className="erp-field-label">Subir logo (PNG recomendado)</span>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={handleLogoChange}
                  />
                </label>
              </div>
            </div>

            <div className="erp-form-group">
              <h4 className="erp-form-group-title">Información básica</h4>
              <div className="erp-form-row erp-form-row-3">
                <label className="erp-field">
                  <span className="erp-field-label">Nombre comercial *</span>
                  <input
                    type="text"
                    value={formEmpresa.nombreComercial}
                    onChange={(e) => updateFormEmpresaField("nombreComercial", e.target.value)}
                    maxLength={150}
                    required
                  />
                </label>
                <label className="erp-field">
                  <span className="erp-field-label">Razón social *</span>
                  <input
                    type="text"
                    value={formEmpresa.razon}
                    onChange={(e) => updateFormEmpresaField("razon", e.target.value)}
                    maxLength={200}
                    required
                  />
                </label>
                <label className="erp-field">
                  <span className="erp-field-label">CIF *</span>
                  <input
                    type="text"
                    className="erp-input-mono"
                    value={formEmpresa.cif}
                    onChange={(e) => updateFormEmpresaField("cif", e.target.value)}
                    maxLength={20}
                    required
                  />
                </label>
              </div>
            </div>

            <div className="erp-form-group">
              <h4 className="erp-form-group-title">Dirección</h4>
              <div className="erp-form-row">
                <label className="erp-field erp-field-full">
                  <span className="erp-field-label">Dirección *</span>
                  <input
                    type="text"
                    value={formEmpresa.direccion}
                    onChange={(e) => updateFormEmpresaField("direccion", e.target.value)}
                    maxLength={255}
                    required
                  />
                </label>
              </div>
              <div className="erp-form-row erp-form-row-4">
                <label className="erp-field">
                  <span className="erp-field-label">Código postal</span>
                  <input
                    type="text"
                    className="erp-input-mono"
                    value={formEmpresa.codigoPostal}
                    onChange={(e) => updateFormEmpresaField("codigoPostal", e.target.value)}
                    maxLength={12}
                  />
                </label>
                <label className="erp-field">
                  <span className="erp-field-label">Población</span>
                  <input
                    type="text"
                    value={formEmpresa.poblacion}
                    onChange={(e) => updateFormEmpresaField("poblacion", e.target.value)}
                    maxLength={100}
                  />
                </label>
                <label className="erp-field">
                  <span className="erp-field-label">Provincia</span>
                  <input
                    type="text"
                    value={formEmpresa.provincia}
                    onChange={(e) => updateFormEmpresaField("provincia", e.target.value)}
                    maxLength={100}
                  />
                </label>
                <label className="erp-field">
                  <span className="erp-field-label">País</span>
                  <input
                    type="text"
                    value={formEmpresa.pais}
                    onChange={(e) => updateFormEmpresaField("pais", e.target.value)}
                    maxLength={56}
                  />
                </label>
              </div>
            </div>

            <div className="erp-form-group">
              <h4 className="erp-form-group-title">Contacto</h4>
              <div className="erp-form-row">
                <label className="erp-field">
                  <span className="erp-field-label">Teléfono</span>
                  <input
                    type="text"
                    className="erp-input-mono"
                    value={formEmpresa.telefono}
                    onChange={(e) => updateFormEmpresaField("telefono", e.target.value)}
                    maxLength={20}
                  />
                </label>
                <label className="erp-field">
                  <span className="erp-field-label">Email</span>
                  <input
                    type="email"
                    value={formEmpresa.email}
                    onChange={(e) => updateFormEmpresaField("email", e.target.value)}
                    maxLength={254}
                  />
                </label>
              </div>
            </div>

            <div className="erp-form-group" style={{ background: '#f0f9ff', padding: '20px', borderRadius: '8px', border: '2px solid #3b82f6' }}>
              <h4 className="erp-form-group-title" style={{ color: '#3b82f6' }}>📧 Configuración de Correo Electrónico (SMTP)</h4>
              
              <div style={{ background: '#eff6ff', padding: '12px', borderRadius: '6px', marginBottom: '16px', fontSize: '13px', color: '#1e3a8a' }}>
                <strong>Tutorial:</strong> Para Gmail, activa la verificación en 2 pasos y genera una contraseña de aplicación.
              </div>

              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <button type="button" className="erp-btn erp-btn-info" onClick={usarConfiguracionGmail}>
                  📧 Usar Gmail
                </button>
                <button type="button" className="erp-btn erp-btn-info" onClick={usarConfiguracionOutlook}>
                  📧 Usar Outlook
                </button>
              </div>

              <div className="erp-form-row erp-form-row-4">
                <label className="erp-field">
                  <span className="erp-field-label">Servidor SMTP *</span>
                  <input
                    type="text"
                    value={formEmpresa.smtpHost}
                    onChange={(e) => updateFormEmpresaField("smtpHost", e.target.value)}
                    maxLength={255}
                    placeholder="smtp.gmail.com"
                  />
                </label>
                <label className="erp-field">
                  <span className="erp-field-label">Puerto *</span>
                  <input
                    type="number"
                    className="erp-input-mono"
                    value={formEmpresa.smtpPort}
                    onChange={(e) => updateFormEmpresaField("smtpPort", e.target.value)}
                    placeholder="587"
                  />
                </label>
                <label className="erp-field">
                  <span className="erp-field-label">Usuario SMTP *</span>
                  <input
                    type="email"
                    value={formEmpresa.smtpUsername}
                    onChange={(e) => updateFormEmpresaField("smtpUsername", e.target.value)}
                    maxLength={255}
                    placeholder="tu-email@gmail.com"
                  />
                </label>
                <label className="erp-field">
                  <span className="erp-field-label">Contraseña *</span>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={mostrarPassword ? "text" : "password"}
                      value={formEmpresa.smtpPassword}
                      onChange={(e) => updateFormEmpresaField("smtpPassword", e.target.value)}
                      maxLength={255}
                      placeholder="Contraseña de aplicación"
                      style={{ paddingRight: '40px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarPassword(!mostrarPassword)}
                      style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}
                    >
                      {mostrarPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '20px', marginTop: '12px' }}>
                <label className="erp-checkbox">
                  <input
                    type="checkbox"
                    checked={formEmpresa.smtpAuth}
                    onChange={(e) => updateFormEmpresaField("smtpAuth", e.target.checked)}
                  />
                  <span>Requiere autenticación</span>
                </label>
                <label className="erp-checkbox">
                  <input
                    type="checkbox"
                    checked={formEmpresa.smtpStarttls}
                    onChange={(e) => updateFormEmpresaField("smtpStarttls", e.target.checked)}
                  />
                  <span>Usar STARTTLS</span>
                </label>
              </div>

              <div style={{ marginTop: '16px' }}>
                <button
                  type="button"
                  className="erp-btn erp-btn-primary"
                  onClick={probarConexionEmail}
                  disabled={probandoConexion || !formEmpresa.smtpHost || !formEmpresa.smtpPort || !formEmpresa.smtpUsername || !formEmpresa.smtpPassword}
                  style={{ width: '100%' }}
                >
                  {probandoConexion ? '🔄 Probando conexión...' : '🧪 Probar Conexión SMTP'}
                </button>

                {resultadoPrueba && (
                  <div style={{
                    marginTop: '12px',
                    padding: '12px',
                    borderRadius: '6px',
                    background: resultadoPrueba.success ? '#d1fae5' : '#fee2e2',
                    border: `1px solid ${resultadoPrueba.success ? '#10b981' : '#ef4444'}`,
                    color: resultadoPrueba.success ? '#065f46' : '#991b1b',
                  }}>
                    {resultadoPrueba.success ? '✅' : '❌'} {resultadoPrueba.mensaje}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="erp-form-actions">
          <button type="submit" className="erp-btn erp-btn-primary">
            Guardar cambios
          </button>
          <button type="button" className="erp-btn erp-btn-secondary" onClick={() => cerrarPestana(pestanaActiva)}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
