import React from 'react';

/**
 * Modal bloqueante para advertir sobre cambios de stock al cambiar estado de documentos
 * 
 * @param {Object} props
 * @param {boolean} props.mostrar - Si el modal debe mostrarse
 * @param {string} props.tipo - Tipo de operación: "DESCUENTO", "RESTAURACION", "INCREMENTO", "DECREMENTO"
 * @param {Array} props.productos - Lista de productos afectados [{nombre, cantidad, almacen}]
 * @param {Function} props.onConfirmar - Callback al confirmar
 * @param {Function} props.onCancelar - Callback al cancelar
 * @param {string} props.estadoOrigen - Estado desde el que se cambia
 * @param {string} props.estadoDestino - Estado al que se cambia
 */
export function ModalCambioEstadoStock({
  mostrar,
  tipo,
  productos = [],
  onConfirmar,
  onCancelar,
  estadoOrigen,
  estadoDestino
}) {
  if (!mostrar) return null;

  const configuracion = {
    DESCUENTO: {
      icono: '📦',
      titulo: 'Confirmar descuento de stock',
      color: '#f59e0b',
      mensaje: 'Se descontará el stock de los siguientes productos:',
      accion: 'descontará'
    },
    RESTAURACION: {
      icono: '↩️',
      titulo: 'Confirmar restauración de stock',
      color: '#3b82f6',
      mensaje: 'Se restaurará el stock de los siguientes productos:',
      accion: 'restaurará'
    },
    INCREMENTO: {
      icono: '✅',
      titulo: 'Confirmar devolución de stock',
      color: '#10b981',
      mensaje: 'Se devolverá stock al almacén (factura rectificativa):',
      accion: 'incrementará'
    },
    DECREMENTO: {
      icono: '⚠️',
      titulo: 'Confirmar cancelación de devolución',
      color: '#ef4444',
      mensaje: 'Se restará el stock previamente devuelto:',
      accion: 'decrementará'
    }
  };

  const config = configuracion[tipo] || configuracion.DESCUENTO;

  // Evitar cerrar el modal con click fuera o ESC
  const handleOverlayClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div 
      className="erp-modal-overlay" 
      onClick={handleOverlayClick}
      style={{ zIndex: 10000 }}
    >
      <div 
        className="erp-modal" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '600px' }}
      >
        <div className="erp-modal-header" style={{ borderBottom: `3px solid ${config.color}` }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '24px' }}>{config.icono}</span>
            {config.titulo}
          </h3>
        </div>
        
        <div className="erp-modal-body" style={{ padding: '24px' }}>
          {/* Información del cambio de estado */}
          <div style={{
            backgroundColor: '#f3f4f6',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            <div style={{ fontWeight: '600', marginBottom: '4px' }}>
              Cambio de estado:
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ 
                padding: '4px 12px', 
                backgroundColor: '#e5e7eb', 
                borderRadius: '4px',
                fontWeight: '500'
              }}>
                {estadoOrigen}
              </span>
              <span>→</span>
              <span style={{ 
                padding: '4px 12px', 
                backgroundColor: config.color, 
                color: 'white',
                borderRadius: '4px',
                fontWeight: '500'
              }}>
                {estadoDestino}
              </span>
            </div>
          </div>

          {/* Mensaje principal */}
          <div style={{ 
            fontSize: '15px', 
            marginBottom: '16px',
            color: '#374151',
            fontWeight: '500'
          }}>
            {config.mensaje}
          </div>

          {/* Lista de productos */}
          {productos.length > 0 ? (
            <div style={{
              maxHeight: '300px',
              overflowY: 'auto',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <table style={{ width: '100%', fontSize: '14px' }}>
                <thead style={{ 
                  backgroundColor: '#f9fafb',
                  position: 'sticky',
                  top: 0,
                  borderBottom: '2px solid #e5e7eb'
                }}>
                  <tr>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Producto</th>
                    <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600' }}>Cantidad</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Almacén</th>
                  </tr>
                </thead>
                <tbody>
                  {productos.map((producto, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '12px' }}>{producto.nombre}</td>
                      <td style={{ 
                        padding: '12px', 
                        textAlign: 'center',
                        fontWeight: '600',
                        color: config.color
                      }}>
                        {producto.cantidad}
                      </td>
                      <td style={{ padding: '12px', color: '#6b7280' }}>
                        {producto.almacen || 'Principal'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{
              padding: '20px',
              backgroundColor: '#f3f4f6',
              borderRadius: '8px',
              textAlign: 'center',
              color: '#6b7280',
              marginBottom: '20px'
            }}>
              No hay productos que afecten al stock
            </div>
          )}

          {/* Advertencia importante */}
          <div style={{
            backgroundColor: '#fef3c7',
            border: '1px solid #fbbf24',
            borderRadius: '8px',
            padding: '12px 16px',
            fontSize: '13px',
            color: '#92400e',
            display: 'flex',
            gap: '8px'
          }}>
            <span style={{ fontSize: '16px' }}>⚠️</span>
            <div>
              <strong>Importante:</strong> Esta acción {config.accion} el stock en la base de datos.
              {tipo === 'DESCUENTO' && ' Asegúrate de que el stock esté disponible antes de confirmar.'}
              {tipo === 'RESTAURACION' && ' El stock volverá a estar disponible para otras ventas.'}
            </div>
          </div>
        </div>

        <div className="erp-modal-footer" style={{ 
          display: 'flex', 
          gap: '12px', 
          justifyContent: 'flex-end',
          padding: '16px 24px',
          borderTop: '1px solid #e5e7eb'
        }}>
          <button
            onClick={onCancelar}
            className="erp-btn-secondary"
            style={{ 
              padding: '10px 24px',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirmar}
            className="erp-btn-primary"
            style={{ 
              padding: '10px 24px',
              fontSize: '14px',
              fontWeight: '500',
              backgroundColor: config.color,
              borderColor: config.color
            }}
          >
            Confirmar y Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalCambioEstadoStock;
