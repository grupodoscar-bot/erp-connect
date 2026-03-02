import React, { useState } from "react";
import { IconEdit, IconDelete, IconPlus, IconRefresh, IconMoney } from "../iconos";

export function GestionTarifas({
  // Estado de tarifas
  tarifas,
  formTarifa,
  cargandoTarifas,
  mensajeTarifas,
  modoEdicion,
  
  // Acciones
  editarTarifa,
  eliminarTarifa,
  guardarTarifa,
  limpiarFormTarifa,
  inicializarTarifaGeneral,
  updateFormTarifaField,
  cargarTarifas,
  
  // Configuración
  permitirMultitarifa
}) {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const handleNuevaTarifa = () => {
    limpiarFormTarifa();
    setMostrarFormulario(true);
  };

  const handleEditarTarifa = (tarifa) => {
    editarTarifa(tarifa);
    setMostrarFormulario(true);
  };

  const handleGuardarTarifa = async () => {
    await guardarTarifa();
    setMostrarFormulario(false);
  };

  const handleCancelar = () => {
    limpiarFormTarifa();
    setMostrarFormulario(false);
  };

  const tarifaGeneral = tarifas.find(t => t.esGeneral);
  const tarifasNoGenerales = tarifas.filter(t => !t.esGeneral);

  return (
    <div className="tariff-management">
      <div className="section-header">
        <h3>
          <IconMoney />
          Gestión de Tarifas
        </h3>
        <div className="header-actions">
          <button
            onClick={cargarTarifas}
            disabled={cargandoTarifas}
            className="erp-action-btn"
            title="Actualizar lista"
          >
            <IconRefresh className="erp-action-icon" />
          </button>
          {permitirMultitarifa && (
            <button
              onClick={handleNuevaTarifa}
              disabled={cargandoTarifas}
              className="btn-primary btn-compact"
            >
              <IconPlus />
              Nueva Tarifa
            </button>
          )}
        </div>
      </div>

      {mensajeTarifas && (
        <div className={`mensaje ${mensajeTarifas.includes('❌') ? 'error' : 'success'}`}>
          {mensajeTarifas}
        </div>
      )}

      {!permitirMultitarifa && (
        <div className="info-box">
          <p>
            <strong>Modo Tarifa Única:</strong> Solo se permite usar la tarifa general. 
            Active "Permitir múltiples tarifas" en la configuración para crear tarifas adicionales.
          </p>
        </div>
      )}

      {/* Tarifa General */}
      <div className="tariff-section">
        <h4>Tarifa General</h4>
        {tarifaGeneral ? (
          <div className="tariff-card general">
            <div className="tariff-info">
              <h5>{tarifaGeneral.nombre}</h5>
              <p>{tarifaGeneral.descripcion}</p>
              <div className="tariff-badges">
                <span className={`status ${tarifaGeneral.activa ? 'active' : 'inactive'}`}>
                  {tarifaGeneral.activa ? 'Activa' : 'Inactiva'}
                </span>
                <span className="badge badge-type">
                  {tarifaGeneral.tipoTarifa === 'VENTA' ? '📊 Venta' : 
                   tarifaGeneral.tipoTarifa === 'COMPRA' ? '🛒 Compra' : 
                   '🔄 Venta y Compra'}
                </span>
              </div>
            </div>
            <div className="tariff-actions">
              <button
                onClick={() => handleEditarTarifa(tarifaGeneral)}
                className="erp-action-btn"
                title="Editar"
              >
                <IconEdit className="erp-action-icon" />
              </button>
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <p>No hay tarifa general configurada</p>
            <button
              onClick={inicializarTarifaGeneral}
              disabled={cargandoTarifas}
              className="btn-primary"
            >
              Crear Tarifa General
            </button>
          </div>
        )}
      </div>

      {/* Tarifas Adicionales */}
      {permitirMultitarifa && (
        <div className="tariff-section">
          <h4>Tarifas Adicionales</h4>
          {tarifasNoGenerales.length > 0 ? (
            <div className="tariff-grid">
              {tarifasNoGenerales.map((tarifa) => (
                <div key={tarifa.id} className="tariff-card">
                  <div className="tariff-info">
                    <h5>{tarifa.nombre}</h5>
                    <p>{tarifa.descripcion}</p>
                    <div className="tariff-badges">
                      <span className={`status ${tarifa.activa ? 'active' : 'inactive'}`}>
                        {tarifa.activa ? 'Activa' : 'Inactiva'}
                      </span>
                      <span className="badge badge-type">
                        {tarifa.tipoTarifa === 'VENTA' ? '📊 Venta' : 
                         tarifa.tipoTarifa === 'COMPRA' ? '🛒 Compra' : 
                         '🔄 Venta y Compra'}
                      </span>
                    </div>
                  </div>
                  <div className="tariff-actions">
                    <button
                      onClick={() => handleEditarTarifa(tarifa)}
                      className="erp-action-btn"
                      title="Editar"
                    >
                      <IconEdit className="erp-action-icon" />
                    </button>
                    <button
                      onClick={() => eliminarTarifa(tarifa.id)}
                      className="erp-action-btn erp-action-danger"
                      title="Eliminar"
                    >
                      <IconDelete className="erp-action-icon" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No hay tarifas adicionales</p>
            </div>
          )}
        </div>
      )}

      {/* Formulario de Edición */}
      {mostrarFormulario && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h4>{modoEdicion ? 'Editar Tarifa' : 'Nueva Tarifa'}</h4>
              <button onClick={handleCancelar} className="btn-close">×</button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Nombre *</label>
                <input
                  type="text"
                  value={formTarifa.nombre}
                  onChange={(e) => updateFormTarifaField('nombre', e.target.value)}
                  placeholder="Nombre de la tarifa"
                  maxLength={100}
                />
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  value={formTarifa.descripcion}
                  onChange={(e) => updateFormTarifaField('descripcion', e.target.value)}
                  placeholder="Descripción opcional"
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formTarifa.activa}
                    onChange={(e) => updateFormTarifaField('activa', e.target.checked)}
                  />
                  Tarifa activa
                </label>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formTarifa.esGeneral}
                    onChange={(e) => updateFormTarifaField('esGeneral', e.target.checked)}
                  />
                  Es tarifa general
                </label>
                <small>Solo puede haber una tarifa general en el sistema</small>
              </div>

              <div className="form-group">
                <label>Tipo de Tarifa *</label>
                <select
                  value={formTarifa.tipoTarifa || 'VENTA'}
                  onChange={(e) => updateFormTarifaField('tipoTarifa', e.target.value)}
                  className="form-select"
                >
                  <option value="VENTA">Venta</option>
                  <option value="COMPRA">Compra</option>
                  <option value="AMBAS">Ambas (Venta y Compra)</option>
                </select>
                <small>Define si esta tarifa se usa para ventas, compras o ambos tipos de documentos</small>
              </div>

              {!formTarifa.esGeneral && (
                <>
                  <div className="form-group-divider">
                    <h5>Ajustes Automáticos desde Tarifa General</h5>
                    <small style={{ color: '#6b7280', display: 'block', marginTop: '4px' }}>
                      Define incrementos independientes para los precios de venta y de compra al copiar desde la tarifa general.
                    </small>
                  </div>

                  <div className="form-row ajustes-row">
                    <div className="form-group">
                      <label>Ajustes para Venta</label>
                      <div className="ajuste-row">
                        <div className="ajuste-field">
                          <small>Porcentaje (%)</small>
                          <input
                            type="number"
                            value={formTarifa.ajusteVentaPorcentaje}
                            onChange={(e) => updateFormTarifaField('ajusteVentaPorcentaje', e.target.value)}
                            placeholder="Ej: 5"
                            step="0.01"
                          />
                        </div>
                        <div className="ajuste-field">
                          <small>Cantidad fija (€)</small>
                          <input
                            type="number"
                            value={formTarifa.ajusteVentaCantidad}
                            onChange={(e) => updateFormTarifaField('ajusteVentaCantidad', e.target.value)}
                            placeholder="Ej: 5"
                            step="0.01"
                          />
                        </div>
                      </div>
                      <small>Ejemplo: precio 10€ + 5% + 5€ = 15,5€.</small>
                    </div>

                    <div className="form-group">
                      <label>Ajustes para Compra</label>
                      <div className="ajuste-row">
                        <div className="ajuste-field">
                          <small>Porcentaje (%)</small>
                          <input
                            type="number"
                            value={formTarifa.ajusteCompraPorcentaje}
                            onChange={(e) => updateFormTarifaField('ajusteCompraPorcentaje', e.target.value)}
                            placeholder="Ej: 0"
                            step="0.01"
                          />
                        </div>
                        <div className="ajuste-field">
                          <small>Cantidad fija (€)</small>
                          <input
                            type="number"
                            value={formTarifa.ajusteCompraCantidad}
                            onChange={(e) => updateFormTarifaField('ajusteCompraCantidad', e.target.value)}
                            placeholder="Ej: 0"
                            step="0.01"
                          />
                        </div>
                      </div>
                      <small>Ideal cuando compra y venta necesitan ajustes distintos.</small>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="modal-footer">
              <button
                onClick={handleCancelar}
                className="btn-secondary"
                disabled={cargandoTarifas}
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardarTarifa}
                className="btn-primary"
                disabled={cargandoTarifas || !formTarifa.nombre.trim()}
              >
                {cargandoTarifas ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .tariff-management {
          padding: 40px 32px 64px;
          background: linear-gradient(135deg, #f0f4f8 0%, #e8f1ff 100%);
          min-height: 100vh;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 0 auto 40px;
          max-width: 1200px;
          padding: 0 20px;
        }

        .section-header h3 {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 0;
          font-size: 26px;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -0.02em;
        }

        .section-header h3 :global(svg) {
          width: 28px;
          height: 28px;
          color: #3b82f6;
        }

        .header-actions {
          display: flex;
          gap: 12px;
        }

        .tariff-section {
          margin: 0 auto 40px;
          max-width: 1200px;
          padding: 0 20px;
        }

        .tariff-section h4 {
          margin-bottom: 20px;
          font-size: 18px;
          font-weight: 600;
          color: #1e293b;
          border-bottom: 3px solid #cbd5e1;
          padding-bottom: 8px;
          letter-spacing: -0.01em;
        }

        .tariff-card {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 24px;
          border: 2px solid #e2e8f0;
          border-radius: 16px;
          margin-bottom: 16px;
          background: #ffffff;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          transition: all 0.2s ease;
        }

        .tariff-card:hover {
          border-color: #cbd5e1;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          transform: translateY(-2px);
        }

        .tariff-card.general {
          border-color: #3b82f6;
          background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
          box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.2), 0 2px 4px -1px rgba(59, 130, 246, 0.1);
        }

        .tariff-card.general:hover {
          border-color: #2563eb;
          box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.3), 0 4px 6px -2px rgba(59, 130, 246, 0.15);
        }

        .tariff-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 15px;
        }

        .tariff-info h5 {
          margin: 0 0 8px 0;
          font-size: 18px;
          font-weight: 600;
          color: #0f172a;
          letter-spacing: -0.01em;
        }

        .tariff-info p {
          margin: 0 0 12px 0;
          color: #64748b;
          font-size: 14px;
          line-height: 1.5;
        }

        .status {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .status.active {
          background: #d1fae5;
          color: #065f46;
          border: 1px solid #10b981;
        }

        .status.inactive {
          background: #fee2e2;
          color: #991b1b;
          border: 1px solid #ef4444;
        }

        .tariff-badges {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          align-items: center;
        }

        .badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
        }

        .badge-type {
          background: #e0e7ff;
          color: #4338ca;
          border: 1px solid #818cf8;
        }

        .tariff-actions {
          display: flex;
          gap: 10px;
        }

        .ajustes-row {
          gap: 24px;
        }

        .ajuste-row {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .ajuste-field {
          flex: 1;
        }

        .btn-icon {
          padding: 10px 14px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          border-radius: 10px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          color: #0f172a;
          fill: #0f172a;
          opacity: 1;
          min-width: 36px;
          min-height: 32px;
        }

        :global(.tariff-icon) {
          width: 18px;
          height: 18px;
          display: block;
          color: #0f172a;
          fill: currentColor;
          transition: color 0.2s ease;
          opacity: 1;
        }

        :global(.tariff-icon path),
        :global(.tariff-icon rect),
        :global(.tariff-icon circle),
        :global(.tariff-icon polygon) {
          fill: currentColor !important;
          stroke: currentColor;
        }

        .btn-icon:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
          transform: translateY(-1px);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          color: #111827;
          fill: #111827;
        }

        .btn-icon:hover :global(.tariff-icon) {
          color: #111827;
          opacity: 1;
        }

        .btn-icon.danger:hover {
          background: #fef2f2;
          border-color: #fecaca;
          color: #dc2626;
          fill: #dc2626;
        }

        .btn-icon.danger:hover :global(.tariff-icon) {
          color: #dc2626;
          opacity: 1;
        }

        .empty-state {
          text-align: center;
          padding: 60px 40px;
          color: #64748b;
          background: #f8fafc;
          border-radius: 16px;
          border: 2px dashed #cbd5e1;
        }

        .empty-state p {
          margin: 0 0 20px 0;
          font-size: 15px;
        }

        .info-box {
          background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
          border: 2px solid #fbbf24;
          border-radius: 12px;
          padding: 18px 20px;
          margin: 0 auto 24px;
          max-width: 1200px;
        }

        .info-box p {
          margin: 0;
          color: #92400e;
          font-size: 14px;
          line-height: 1.6;
        }

        .btn-primary.btn-compact {
          padding: 10px 18px;
          font-size: 14px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .btn-primary.btn-compact :global(svg) {
          width: 18px;
          height: 18px;
        }

        .mensaje {
          padding: 16px 20px;
          border-radius: 12px;
          margin: 0 auto 20px;
          max-width: 1200px;
          font-size: 14px;
          font-weight: 500;
        }

        .mensaje.success {
          background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
          color: #065f46;
          border: 2px solid #10b981;
        }

        .mensaje.error {
          background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
          color: #991b1b;
          border: 2px solid #ef4444;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal {
          background: white;
          border-radius: 16px;
          width: 90%;
          max-width: 540px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 28px;
          border-bottom: 2px solid #e5e7eb;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        }

        .modal-header h4 {
          margin: 0;
          font-size: 20px;
          font-weight: 700;
          color: #0f172a;
        }

        .btn-close {
          background: #f1f5f9;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #64748b;
          width: 36px;
          height: 36px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .btn-close:hover {
          background: #e2e8f0;
          color: #0f172a;
        }

        .modal-body {
          padding: 28px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #374151;
          font-size: 14px;
        }

        .form-group-divider {
          margin: 24px 0 16px;
          padding-top: 20px;
          border-top: 2px solid #e5e7eb;
        }

        .form-group-divider h5 {
          margin: 0 0 4px 0;
          font-size: 15px;
          font-weight: 600;
          color: #0f172a;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .checkbox-label {
          display: flex !important;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }

        .checkbox-label input {
          width: auto !important;
          margin: 0;
        }

        .form-group small {
          display: block;
          margin-top: 5px;
          color: #6b7280;
          font-size: 12px;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 20px 28px;
          border-top: 2px solid #e5e7eb;
          background: #f8fafc;
        }

        .btn-primary {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 10px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3), 0 2px 4px -1px rgba(59, 130, 246, 0.2);
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .btn-primary:hover:not(:disabled) {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          transform: translateY(-1px);
          box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.4), 0 4px 6px -2px rgba(59, 130, 246, 0.3);
        }

        .btn-primary:active:not(:disabled) {
          transform: translateY(0);
        }

        .btn-primary:disabled {
          background: #cbd5e1;
          cursor: not-allowed;
          box-shadow: none;
        }

        .btn-primary :global(svg) {
          width: 18px;
          height: 18px;
        }

        .btn-secondary {
          background: #ffffff;
          color: #475569;
          border: 1px solid #cbd5e1;
          padding: 10px 20px;
          border-radius: 10px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #f8fafc;
          border-color: #94a3b8;
          transform: translateY(-1px);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .btn-secondary:active:not(:disabled) {
          transform: translateY(0);
        }

        .btn-secondary :global(svg) {
          width: 18px;
          height: 18px;
        }
      `}</style>
    </div>
  );
}
