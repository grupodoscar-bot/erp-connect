import React, { useState } from "react";
import { IconMoney, IconDocument, IconSearch, IconRefresh, IconDelete } from "../iconos";
import { COLORES_PRESET } from "./useConfiguracion";

const API_URL_VENTAS = "http://145.223.103.219:8080/configuracion-ventas";
const API_URL_COLORES = "http://145.223.103.219:8080/empresa-colores";
const API_URL_EMPRESA = "http://145.223.103.219:8080/empresa";
const API_URL_PLANTILLAS = "http://145.223.103.219:8080/plantillas-pdf";

// ========== CONFIGURACIÓN DE VENTAS ==========
export function ConfiguracionVentas({
  contabilizarAlbaran,
  setContabilizarAlbaran,
  documentoDescuentaStock,
  setDocumentoDescuentaStock,
  permitirVentaMultialmacen,
  setPermitirVentaMultialmacen,
  permitirVentaSinStock,
  setPermitirVentaSinStock,
  permitirMultitarifa,
  setPermitirMultitarifa,
  estadosAlbaran,
  agregarEstadoAlbaran,
  actualizarEstadoAlbaran,
  eliminarEstadoAlbaran,
  restaurarEstadosAlbaran,
  guardarConfiguracion,
  mensaje,
  cargando,
}) {
  const [nuevoEstado, setNuevoEstado] = useState("");
  const [colorClaroSeleccionado, setColorClaroSeleccionado] = useState(COLORES_PRESET[0].claro);
  const [colorOscuroSeleccionado, setColorOscuroSeleccionado] = useState(COLORES_PRESET[0].oscuro);

  const manejarAgregarEstado = () => {
    if (!nuevoEstado.trim()) return;
    agregarEstadoAlbaran(nuevoEstado, colorClaroSeleccionado, colorOscuroSeleccionado);
    setNuevoEstado("");
    setColorClaroSeleccionado(COLORES_PRESET[0].claro);
    setColorOscuroSeleccionado(COLORES_PRESET[0].oscuro);
  };

  return (
    <div className="erp-config-view">
      <div className="erp-config-header">
        <h2>Configuración de Ventas</h2>
        <p>Define cómo se contabilizan los documentos de venta</p>
      </div>

      {mensaje && (
        <div className={`erp-message ${mensaje.includes('✅') ? 'erp-message-success' : 'erp-message-error'}`}>
          {mensaje}
        </div>
      )}

      <div className="erp-config-section">
        <h3><IconMoney className="erp-action-icon" /> Descuento de Stock</h3>
        
        {/* Documento que descuenta stock - 3 columnas */}
        <div className="erp-config-item">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', alignItems: 'start' }}>
            {/* Columna 1: Pregunta */}
            <div className="erp-config-item-label" style={{ marginBottom: 0 }}>
              <strong>Documento que descuenta stock</strong>
              <p>¿Qué tipo de documento debe descontar el stock cuando cambia a estado "Emitido"?</p>
            </div>
            
            {/* Columna 2: Selector */}
            <div>
              <select
                value={documentoDescuentaStock}
                onChange={(e) => setDocumentoDescuentaStock(e.target.value)}
                className="erp-select"
              >
                <option value="ALBARAN">Albarán</option>
                <option value="FACTURA">Factura</option>
              </select>
            </div>
            
            {/* Columna 3: Descripción */}
            <div>
              {documentoDescuentaStock === 'ALBARAN' && (
                <div className="erp-config-desc-item automatico">
                  <span>📦</span>
                  <div>
                    <strong>Albarán descuenta stock</strong>
                    <p>El stock se descontará automáticamente cuando un albarán cambie a estado "Emitido".</p>
                  </div>
                </div>
              )}
              
              {documentoDescuentaStock === 'FACTURA' && (
                <div className="erp-config-desc-item preguntar">
                  <span>🧾</span>
                  <div>
                    <strong>Factura descuenta stock</strong>
                    <p>El stock se descontará automáticamente cuando una factura cambie a estado "Emitido".</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Aviso informativo */}
          <div style={{ 
            marginTop: '12px', 
            padding: '12px', 
            background: '#eff6ff', 
            border: '1px solid #bfdbfe', 
            borderRadius: '6px' 
          }}>
            <p style={{ margin: 0, fontSize: '13px', color: '#1e40af', lineHeight: '1.5' }}>
              ℹ️ <strong>Importante:</strong> El descuento de stock solo se aplicará cuando el documento cambie su estado a "Emitido". 
              Si modificas un documento que ya está en estado "Emitido", el sistema evitará descontar el stock por segunda vez.
            </p>
          </div>
        </div>

        {/* Venta Multialmacén - 3 columnas */}
        <div className="erp-config-item">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', alignItems: 'start' }}>
            {/* Columna 1: Pregunta */}
            <div className="erp-config-item-label" style={{ marginBottom: 0 }}>
              <strong>Venta multialmacén</strong>
              <p>Permite seleccionar un almacén diferente para cada línea del documento</p>
            </div>
            
            {/* Columna 2: Descripción (cuadro azul en el medio) */}
            <div>
              {permitirVentaMultialmacen && (
                <div style={{ padding: '12px', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '6px' }}>
                  <p style={{ margin: 0, fontSize: '13px', color: '#0369a1' }}>
                    ℹ️ Cuando está activo, aparecerá un checkbox en los albaranes para permitir seleccionar el almacén por cada línea de producto.
                  </p>
                </div>
              )}
            </div>
            
            {/* Columna 3: Checkbox */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={permitirVentaMultialmacen}
                  onChange={(e) => setPermitirVentaMultialmacen(e.target.checked)}
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                  Activar venta desde múltiples almacenes
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Permitir venta sin stock - 3 columnas */}
        <div className="erp-config-item">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', alignItems: 'start' }}>
            {/* Columna 1: Pregunta */}
            <div className="erp-config-item-label" style={{ marginBottom: 0 }}>
              <strong>Permitir venta con stock cero o negativo</strong>
              <p>Permite emitir documentos aunque el stock sea insuficiente</p>
            </div>
            
            {/* Columna 2: Descripción (cuadro azul en el medio) */}
            <div>
              {permitirVentaSinStock ? (
                <div style={{ padding: '12px', background: '#fef3c7', border: '1px solid #fbbf24', borderRadius: '6px' }}>
                  <p style={{ margin: 0, fontSize: '13px', color: '#92400e' }}>
                    ⚠️ El sistema permitirá emitir documentos aunque no haya stock disponible. Útil para clientes que transforman productos o no reflejan compras.
                  </p>
                </div>
              ) : (
                <div style={{ padding: '12px', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '6px' }}>
                  <p style={{ margin: 0, fontSize: '13px', color: '#0369a1' }}>
                    ℹ️ El sistema bloqueará la emisión de documentos si el stock es insuficiente.
                  </p>
                </div>
              )}
            </div>
            
            {/* Columna 3: Checkbox */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={permitirVentaSinStock}
                  onChange={(e) => setPermitirVentaSinStock(e.target.checked)}
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                  Permitir ventas con stock insuficiente
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Multi-tarifa - 3 columnas */}
        <div className="erp-config-item">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', alignItems: 'start' }}>
            {/* Columna 1 */}
            <div className="erp-config-item-label" style={{ marginBottom: 0 }}>
              <strong>Multi-tarifa para productos</strong>
              <p>Permite definir varias tarifas de precios y seleccionarlas en los albaranes.</p>
            </div>

            {/* Columna 2: Información */}
            <div>
              {permitirMultitarifa ? (
                <div style={{ padding: '12px', background: '#ecfccb', border: '1px solid #bef264', borderRadius: '6px' }}>
                  <p style={{ margin: 0, fontSize: '13px', color: '#365314' }}>
                    ✅ Activado. Encontrarás el módulo de tarifas en la configuración y podrás elegir la tarifa en cada albarán.
                  </p>
                </div>
              ) : (
                <div style={{ padding: '12px', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '6px' }}>
                  <p style={{ margin: 0, fontSize: '13px', color: '#0369a1' }}>
                    ℹ️ Cuando está desactivado solo se usa la tarifa general y los precios se mantienen como hasta ahora.
                  </p>
                </div>
              )}
            </div>

            {/* Columna 3: Switch */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={permitirMultitarifa}
                  onChange={(e) => setPermitirMultitarifa(e.target.checked)}
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                  Permitir múltiples tarifas de precios
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="erp-config-section">
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <h3 style={{ marginBottom: 0 }}>
            <IconDocument className="erp-action-icon" /> Estados de los documentos de venta
          </h3>
          <p style={{ margin: 0, color: "#6b7280" }}>
            Define los estados disponibles para los distintos documentos (albaranes, pedidos, facturas, etc.).
          </p>
        </div>

        <div
          className="erp-config-estados-container"
          style={{
            marginTop: "16px",
            border: "1px solid var(--erp-border, #e2e8f0)",
            borderRadius: "8px",
            padding: "16px",
            background: "var(--erp-bg-section, #fafbfc)",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              maxHeight: "280px",
              overflowY: "auto",
            }}
          >
            {estadosAlbaran.map((estado, index) => (
              <div
                key={`${estado.nombre}-${index}`}
                className="erp-config-estado-item"
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 1fr auto",
                  gap: "12px",
                  alignItems: "center",
                  padding: "8px 12px",
                  background: "var(--erp-form-surface, #ffffff)",
                  border: "1px solid var(--erp-border, #e2e8f0)",
                  borderRadius: "6px",
                }}
              >
                <input
                  type="text"
                  value={estado.nombre}
                  onChange={(e) => actualizarEstadoAlbaran(index, "nombre", e.target.value)}
                  className="erp-input"
                  placeholder="Nombre del estado"
                />
                <select
                  value={estado.colorClaro}
                  onChange={(e) => actualizarEstadoAlbaran(index, "colorClaro", e.target.value)}
                  className="erp-input erp-color-select-claro"
                  style={{ background: estado.colorClaro, color: '#000', fontWeight: '600' }}
                >
                  {COLORES_PRESET.map((preset, i) => (
                    <option key={i} value={preset.claro}>
                      {preset.nombre}
                    </option>
                  ))}
                </select>
                <select
                  value={estado.colorOscuro}
                  onChange={(e) => actualizarEstadoAlbaran(index, "colorOscuro", e.target.value)}
                  className="erp-input erp-color-select-oscuro"
                  style={{ background: estado.colorOscuro, color: "#fff", border: "1px solid #475569", fontWeight: '600' }}
                >
                  {COLORES_PRESET.map((preset, i) => (
                    <option key={i} value={preset.oscuro}>
                      {preset.nombre}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="erp-btn erp-btn-danger"
                  onClick={() => eliminarEstadoAlbaran(index)}
                  title="Eliminar estado"
                  disabled={estadosAlbaran.length <= 1}
                  style={{
                    width: "36px",
                    height: "36px",
                    padding: 0,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <IconDelete className="erp-action-icon" style={{ width: 16, height: 16 }} />
                </button>
              </div>
            ))}
            {estadosAlbaran.length === 0 && (
              <div
                className="erp-hint"
                style={{ textAlign: "center", padding: "12px 0", color: "#94a3b8" }}
              >
                No hay estados configurados. Añade al menos uno.
              </div>
            )}
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
              alignItems: "center",
              borderTop: "1px solid #e2e8f0",
              paddingTop: "12px",
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "12px", flex: "1 1 auto" }}>
              <label className="erp-field">
                <span className="erp-field-label">Nuevo estado</span>
                <input
                  type="text"
                  value={nuevoEstado}
                  onChange={(e) => setNuevoEstado(e.target.value)}
                  className="erp-input"
                  placeholder="Ej. En reparto"
                />
              </label>
              <label className="erp-field">
                <span className="erp-field-label">Color claro</span>
                <select
                  value={colorClaroSeleccionado}
                  onChange={(e) => setColorClaroSeleccionado(e.target.value)}
                  className="erp-input erp-color-select-claro"
                  style={{ background: colorClaroSeleccionado, color: '#000', fontWeight: '600' }}
                >
                  {COLORES_PRESET.map((preset, i) => (
                    <option key={i} value={preset.claro}>
                      {preset.nombre}
                    </option>
                  ))}
                </select>
              </label>
              <label className="erp-field">
                <span className="erp-field-label">Color oscuro</span>
                <select
                  value={colorOscuroSeleccionado}
                  onChange={(e) => setColorOscuroSeleccionado(e.target.value)}
                  className="erp-input erp-color-select-oscuro"
                  style={{ background: colorOscuroSeleccionado, color: "#fff", border: "1px solid #475569", fontWeight: '600' }}
                >
                  {COLORES_PRESET.map((preset, i) => (
                    <option key={i} value={preset.oscuro}>
                      {preset.nombre}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <button
                type="button"
                className="erp-btn erp-btn-secondary"
                onClick={manejarAgregarEstado}
                disabled={!nuevoEstado.trim()}
              >
                Añadir estado
              </button>
              <button
                type="button"
                className="erp-btn erp-btn-light"
                onClick={restaurarEstadosAlbaran}
              >
                <IconRefresh className="erp-action-icon" /> Restaurar predeterminados
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="erp-config-actions">
        <button
          onClick={guardarConfiguracion}
          disabled={cargando}
          className="erp-btn erp-btn-primary"
        >
          {cargando ? '⏳ Guardando...' : 'Guardar Configuración'}
        </button>
      </div>
    </div>
  );
}

// ========== APARIENCIA ==========
export function ConfiguracionApariencia({
  temas,
  temasModoActual,
  temaActivo,
  aplicarTema,
  mensaje,
  cargando,
  modoVisual,
  alternarModoVisual,
  cambiandoModo,
  actualizarModoVisual,
}) {
  const obtenerColor = (tema, claves, fallback) => {
    for (const key of claves) {
      const valor = tema?.[key];
      if (valor) return valor;
    }
    return fallback;
  };

  return (
    <div className="erp-config-view">
      <div className="erp-config-header">
        <h2>Apariencia del Sistema</h2>
        <p>Elige el tema que quieres aplicar al ERP</p>
      </div>

      {mensaje && (
        <div className={`apariencia-message ${mensaje.includes("✅") ? "success" : "error"}`}>
          {mensaje}
        </div>
      )}

      <div className="apariencia-container">
        <div className="apariencia-header">
          <div className="apariencia-header-copy">
            <h3>Selecciona un tema de colores</h3>
            <p>Visualiza una previsualización rápida y actívalo con un solo clic</p>
          </div>

          <div className="apariencia-mode-toggle">
            <div className="erp-mode-toggle-card">
              <div className="erp-mode-toggle-label">
                <span className="label-eyebrow">Modo visual</span>
                <strong>{modoVisual === "oscuro" ? "Modo Oscuro" : "Modo Claro"}</strong>
                <p>
                  Ajusta el contraste general del ERP manteniendo la misma paleta corporativa.
                </p>
              </div>

              <button
                type="button"
                className={`erp-mode-toggle-switch ${modoVisual}`}
                onClick={alternarModoVisual}
                disabled={cambiandoModo}
              >
                <span className="erp-mode-toggle-thumb" />
                <span className="mode-icon mode-icon--sun">☀️</span>
                <span className="mode-icon mode-icon--moon">🌙</span>
              </button>

              <div className="erp-mode-toggle-options">
                <button
                  type="button"
                  className={`erp-mode-toggle-option ${modoVisual === "claro" ? "active" : ""}`}
                  onClick={() => actualizarModoVisual("claro")}
                  disabled={modoVisual === "claro" || cambiandoModo}
                >
                  Claro
                </button>
                <button
                  type="button"
                  className={`erp-mode-toggle-option ${modoVisual === "oscuro" ? "active" : ""}`}
                  onClick={() => actualizarModoVisual("oscuro")}
                  disabled={modoVisual === "oscuro" || cambiandoModo}
                >
                  Oscuro
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="temas-grid">
          {temasModoActual.map((tema) => {
            const navColor = obtenerColor(tema, ["navigationFondo", "sidebarFondo", "colorPrimario", "colorSecundario"], "#1a3161");
            const botonColor = obtenerColor(tema, ["botonFondo", "colorPrimario", "accentColor"], "#2563eb");
            const panelColor = obtenerColor(tema, ["panelCabeceraFondo", "colorFondo", "colorSecundario"], "#f3f4f6");
            const nombreTema = tema.nombreDelTema || tema.nombre || `Tema ${tema.id}`;
            const isActivo = temaActivo === tema.id;

            const handleAplicar = () => {
              if (cargando || isActivo) return;
              aplicarTema(tema.id);
            };

            return (
              <div
                key={tema.id}
                className={`tema-card ${isActivo ? "active" : ""}`}
                onClick={handleAplicar}
              >
                <div className="tema-preview">
                  <div className="preview-nav" style={{ backgroundColor: navColor }}>
                    <div className="preview-nav-text">Navegación</div>
                  </div>
                  <div className="preview-content">
                    <div className="preview-button" style={{ backgroundColor: botonColor }}>
                      Botón
                    </div>
                    <div className="preview-panel" style={{ backgroundColor: panelColor }}>
                      Panel
                    </div>
                  </div>
                </div>

                <div className="tema-info">
                  <h4 className="tema-nombre">{nombreTema}</h4>
                  {isActivo && <span className="tema-badge">✓ Activo</span>}
                </div>

                {!isActivo && (
                  <button
                    className="tema-aplicar-btn"
                    disabled={cargando}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAplicar();
                    }}
                  >
                    {cargando ? "Aplicando..." : "Aplicar tema"}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {temasModoActual.length === 0 && (
          <div className="apariencia-empty">
            <p>No hay temas disponibles para el modo {modoVisual}. Crea uno en el panel de administración.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ========== PLANTILLAS PDF ==========
export function ConfiguracionPlantillas({
  plantillas,
  plantillaActual,
  cargarPlantilla,
  activarPlantilla,
  eliminarPlantilla,
  nuevaPlantilla,
  editarPlantilla,
  mensaje,
}) {
  return (
    <div className="erp-config-view">
      <div className="erp-config-header">
        <h2>Plantillas PDF</h2>
        <p>Gestiona las plantillas para generar documentos PDF</p>
        <button className="erp-btn erp-btn-primary" onClick={nuevaPlantilla}>
          + Nueva Plantilla
        </button>
      </div>

      {mensaje && (
        <div className={`erp-message ${mensaje.includes('✅') ? 'erp-message-success' : 'erp-message-error'}`}>
          {mensaje}
        </div>
      )}

      <div className="erp-plantillas-list">
        {plantillas.map((p) => (
          <div
            key={p.id}
            className={`erp-plantilla-item ${plantillaActual?.id === p.id ? 'active' : ''}`}
          >
            <div className="erp-plantilla-info">
              <IconDocument className="erp-action-icon" />
              <div>
                <h4>{p.nombre}</h4>
                {p.activa && <span className="erp-badge erp-badge-success">Activa</span>}
              </div>
            </div>
            <div className="erp-plantilla-actions">
              <button
                className="erp-btn erp-btn-sm erp-btn-secondary"
                onClick={() => editarPlantilla(p)}
              >
                Editar
              </button>
              {!p.activa && (
                <button
                  className="erp-btn erp-btn-sm erp-btn-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    activarPlantilla(p.id);
                  }}
                >
                  Activar
                </button>
              )}
              <button
                className="erp-btn erp-btn-sm erp-btn-danger"
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm(`¿Eliminar plantilla "${p.nombre}"?`)) {
                    eliminarPlantilla(p.id);
                  }
                }}
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ========== TIPOS DE IVA ==========
export function ConfiguracionTiposIva({
  tiposIva,
  formTipoIva,
  limpiarFormTipoIva,
  editarTipoIva,
  guardarTipoIva,
  eliminarTipoIva,
  updateFormTipoIvaField,
  mensaje,
}) {
  return (
    <div className="erp-config-view">
      <div className="erp-config-header">
        <h2>Tipos de IVA</h2>
        <p>Gestiona los tipos de IVA y recargo de equivalencia</p>
      </div>

      {mensaje && (
        <div className={`erp-message ${mensaje.includes('✅') ? 'erp-message-success' : 'erp-message-error'}`}>
          {mensaje}
        </div>
      )}

      <div className="erp-config-section">
        <h3>{formTipoIva.id ? "Editar tipo de IVA" : "Nuevo tipo de IVA"}</h3>
        <div className="erp-form-row" style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <label className="erp-field" style={{ flex: '2', minWidth: '150px' }}>
            <span className="erp-field-label">Nombre *</span>
            <input
              type="text"
              value={formTipoIva.nombre}
              onChange={(e) => updateFormTipoIvaField("nombre", e.target.value)}
              placeholder="Ej: IVA General"
              required
            />
          </label>
          <label className="erp-field" style={{ flex: '1', minWidth: '100px' }}>
            <span className="erp-field-label">% IVA *</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formTipoIva.porcentajeIva}
              onChange={(e) => updateFormTipoIvaField("porcentajeIva", e.target.value)}
            />
          </label>
          <label className="erp-field" style={{ flex: '1', minWidth: '100px' }}>
            <span className="erp-field-label">% Recargo</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formTipoIva.porcentajeRecargo}
              onChange={(e) => updateFormTipoIvaField("porcentajeRecargo", e.target.value)}
            />
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="erp-btn erp-btn-primary"
              onClick={guardarTipoIva}
              disabled={!formTipoIva.nombre}
            >
              {formTipoIva.id ? "Actualizar" : "Añadir"}
            </button>
            {formTipoIva.id && (
              <button
                type="button"
                className="erp-btn erp-btn-secondary"
                onClick={limpiarFormTipoIva}
              >
                Cancelar
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="erp-config-section">
        <h3>Tipos de IVA existentes</h3>
        {tiposIva.length === 0 ? (
          <p style={{ color: '#6b7280' }}>No hay tipos de IVA configurados. Añade uno arriba.</p>
        ) : (
          <table className="erp-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th style={{ width: '15%' }}>% IVA</th>
                <th style={{ width: '15%' }}>% Recargo</th>
                <th style={{ width: '20%' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tiposIva.map((tipo) => (
                <tr key={tipo.id}>
                  <td>{tipo.nombre}</td>
                  <td className="erp-td-mono">{tipo.porcentajeIva}%</td>
                  <td className="erp-td-mono">{tipo.porcentajeRecargo}%</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="erp-btn erp-btn-sm erp-btn-secondary"
                        onClick={() => editarTipoIva(tipo)}
                      >
                        Editar
                      </button>
                      <button
                        className="erp-btn erp-btn-sm erp-btn-danger"
                        onClick={() => eliminarTipoIva(tipo.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export { API_URL_VENTAS, API_URL_COLORES, API_URL_EMPRESA, API_URL_PLANTILLAS };
