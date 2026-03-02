import React from 'react';
import { HistorialTransformaciones } from './HistorialTransformaciones';

export function ModalHistorialTransformaciones({ 
  modalAbierto, 
  cerrarModal, 
  documento,
  historial,
  cargando,
  abrirDocumento
}) {
  if (!modalAbierto) return null;

  const formatearTipoDocumento = (tipo) => {
    const tipos = {
      'ALBARAN': 'Albarán',
      'FACTURA': 'Factura',
      'FACTURA_PROFORMA': 'Factura Proforma',
      'FACTURA_RECTIFICATIVA': 'Factura Rectificativa',
      'PEDIDO': 'Pedido',
      'PRESUPUESTO': 'Presupuesto'
    };
    return tipos[tipo] || tipo;
  };

  return (
    <div 
      className="erp-modal-overlay"
      onClick={cerrarModal}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
    >
      <div 
        className="erp-modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--erp-bg-primary, #fff)',
          borderRadius: '12px',
          padding: '24px',
          maxWidth: '900px',
          width: '90%',
          maxHeight: '80vh',
          overflow: 'auto',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }}
      >
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '20px',
          paddingBottom: '16px',
          borderBottom: '1px solid var(--erp-border, #e2e8f0)'
        }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
            Historial de Transformaciones
            {documento && (
              <span style={{ 
                marginLeft: '12px',
                fontSize: '14px',
                fontWeight: '400',
                color: '#6b7280'
              }}>
                {formatearTipoDocumento(documento.tipo)} {documento.numero}
              </span>
            )}
          </h3>
          <button
            onClick={cerrarModal}
            className="erp-action-btn"
            style={{
              padding: '8px',
              borderRadius: '6px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Cerrar"
          >
            ✕
          </button>
        </div>

        <HistorialTransformaciones
          historial={historial}
          tipoDocumento={documento?.tipo}
          idDocumento={documento?.id}
          cargando={cargando}
          abrirDocumento={abrirDocumento}
        />
      </div>
    </div>
  );
}
