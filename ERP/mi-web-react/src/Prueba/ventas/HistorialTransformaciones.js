import React from 'react';
import { IconTransform, IconDuplicate, IconDocument } from '../iconos';

export function HistorialTransformaciones({ historial, tipoDocumento, idDocumento, cargando, abrirDocumento }) {

  const formatearTipo = (tipo) => {
    const tipos = {
      'ALBARAN': 'Albarán',
      'FACTURA': 'Factura',
      'FACTURA_PROFORMA': 'Factura Proforma',
      'FACTURA_RECTIFICATIVA': 'Factura Rectificativa',
      'PEDIDO': 'Pedido',
      'PRESUPUESTO_COMPRA': 'Presupuesto Compra',
      'PEDIDO_COMPRA': 'Pedido Compra',
      'ALBARAN_COMPRA': 'Albarán Compra',
      'FACTURA_COMPRA': 'Factura Compra'
    };
    return tipos[tipo] || tipo;
  };

  const formatearTipoTransformacion = (tipo) => {
    const tipos = {
      'DUPLICAR': 'Duplicación',
      'CONVERTIR': 'Conversión',
      'AGRUPAR': 'Agrupación'
    };
    return tipos[tipo] || tipo;
  };

  const getIconoTransformacion = (tipo) => {
    switch (tipo) {
      case 'DUPLICAR':
        return <IconDuplicate className="erp-action-icon" style={{ color: '#6366f1' }} />;
      case 'CONVERTIR':
        return <IconTransform className="erp-action-icon" style={{ color: '#10b981' }} />;
      case 'AGRUPAR':
        return <IconDocument className="erp-action-icon" style={{ color: '#f59e0b' }} />;
      default:
        return <IconTransform className="erp-action-icon" />;
    }
  };

  const formatearFecha = (fecha) => {
    const date = new Date(fecha);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const historialOrdenado = React.useMemo(() => {
    if (!Array.isArray(historial)) return [];
    return [...historial].sort(
      (a, b) => new Date(a.fechaTransformacion) - new Date(b.fechaTransformacion)
    );
  }, [historial]);

  if (cargando) {
    return (
      <div style={{ padding: '16px', textAlign: 'center', color: '#6b7280' }}>
        Cargando historial...
      </div>
    );
  }

  if (!historialOrdenado.length) {
    return (
      <div style={{ padding: '16px', textAlign: 'center', color: '#6b7280' }}>
        No hay transformaciones registradas para este documento.
      </div>
    );
  }

  const esDocumentoActual = (tipo, id) => tipo === tipoDocumento && id === idDocumento;

  const renderDocumento = (tipo, id, numero) => {
    const actual = esDocumentoActual(tipo, id);
    return (
      <span
        onClick={() => abrirDocumento && abrirDocumento(tipo, id, numero)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontFamily: 'monospace',
          padding: '2px 8px',
          borderRadius: '999px',
          background: actual ? 'rgba(59,130,246,0.15)' : 'var(--erp-bg-section, #f8fafc)',
          color: actual ? '#1d4ed8' : '#0f172a',
          cursor: abrirDocumento ? 'pointer' : 'default',
          textDecoration: abrirDocumento ? 'underline' : 'none'
        }}
        title={abrirDocumento ? 'Click para abrir' : ''}
      >
        {numero || `${formatearTipo(tipo)} #${id}`}
        {actual && (
          <span
            style={{
              fontSize: '10px',
              fontWeight: 600,
              textTransform: 'uppercase',
              color: '#1d4ed8'
            }}
          >
            Actual
          </span>
        )}
      </span>
    );
  };

  return (
    <div style={{ marginTop: '24px' }}>
      <h4 style={{ 
        fontSize: '16px', 
        fontWeight: '600', 
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <IconTransform className="erp-action-icon" />
        Historial de Transformaciones
      </h4>
      
      <div style={{ 
        border: '1px solid var(--erp-border, #e2e8f0)', 
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', fontSize: '13px' }}>
          <thead style={{ 
            background: 'var(--erp-bg-section, #f8fafc)',
            borderBottom: '1px solid var(--erp-border, #e2e8f0)'
          }}>
            <tr>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Tipo</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Transformación</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {historialOrdenado.map((item, index) => {
              return (
                <tr 
                  key={item.id || index}
                  style={{ 
                    borderBottom: index < historialOrdenado.length - 1 ? '1px solid var(--erp-border, #e2e8f0)' : 'none'
                  }}
                >
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {getIconoTransformacion(item.tipoTransformacion)}
                      <span style={{ fontWeight: '500' }}>
                        {formatearTipoTransformacion(item.tipoTransformacion)}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <strong>{formatearTipo(item.tipoOrigen)}</strong>
                      {renderDocumento(item.tipoOrigen, item.idOrigen, item.numeroOrigen)}
                      <span style={{ color: '#6b7280', margin: '0 4px' }}>→</span>
                      <strong>{formatearTipo(item.tipoDestino)}</strong>
                      {renderDocumento(item.tipoDestino, item.idDestino, item.numeroDestino)}
                    </div>
                  </td>
                  <td style={{ padding: '12px', color: '#6b7280' }}>
                    {formatearFecha(item.fechaTransformacion)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
