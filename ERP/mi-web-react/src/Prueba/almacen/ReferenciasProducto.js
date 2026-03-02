import React, { useState } from 'react';
import { IconDelete, IconPlus } from '../iconos';

const API_URL = "http://145.223.103.219:8080";

export function ReferenciasProducto({ 
  productoId, 
  referencias = [],
  onReferenciasChange 
}) {
  const [nuevaReferencia, setNuevaReferencia] = useState('');
  const [agregando, setAgregando] = useState(false);
  const [error, setError] = useState('');

  const agregarReferencia = async () => {
    if (!nuevaReferencia.trim()) {
      setError('La referencia no puede estar vacía');
      return;
    }

    if (nuevaReferencia.length > 15) {
      setError('La referencia no puede tener más de 15 caracteres');
      return;
    }

    setAgregando(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/productos/${productoId}/referencias`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referencia: nuevaReferencia.trim() })
      });

      if (response.ok) {
        const nuevaRef = await response.json();
        onReferenciasChange([...referencias, nuevaRef]);
        setNuevaReferencia('');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error al agregar la referencia');
      }
    } catch (err) {
      setError('Error de conexión al agregar la referencia');
      console.error('Error:', err);
    } finally {
      setAgregando(false);
    }
  };

  const eliminarReferencia = async (referenciaId) => {
    if (!window.confirm('¿Estás seguro de eliminar esta referencia alternativa?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/productos/referencias/${referenciaId}`, {
        method: 'DELETE'
      });

      if (response.ok || response.status === 204) {
        onReferenciasChange(referencias.filter(r => r.id !== referenciaId));
      } else {
        alert('Error al eliminar la referencia');
      }
    } catch (err) {
      alert('Error de conexión al eliminar la referencia');
      console.error('Error:', err);
    }
  };

  const referenciasAlternativas = referencias.filter(r => !r.esPrincipal);

  return (
    <div className="erp-form-group">
      <h4 className="erp-form-group-title">Referencias Alternativas</h4>
      
      {/* Lista de referencias alternativas */}
      {referenciasAlternativas.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <table className="erp-table erp-table-compact">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>Orden</th>
                <th>Referencia</th>
                <th style={{ width: '80px' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {referenciasAlternativas.map((ref, index) => (
                <tr key={ref.id}>
                  <td className="erp-td-mono" style={{ textAlign: 'center' }}>
                    {index + 1}
                  </td>
                  <td className="erp-td-mono">{ref.referencia}</td>
                  <td className="erp-td-actions">
                    <button
                      type="button"
                      className="erp-action-btn erp-action-danger"
                      onClick={() => eliminarReferencia(ref.id)}
                      title="Eliminar"
                    >
                      <IconDelete className="erp-action-icon" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Formulario para agregar nueva referencia */}
      <div style={{ 
        display: 'flex', 
        gap: '12px', 
        alignItems: 'flex-start',
        padding: '16px',
        backgroundColor: 'var(--erp-bg-section)',
        borderRadius: '8px',
        border: '1px solid var(--erp-border)'
      }}>
        <div style={{ flex: 1 }}>
          <label className="erp-field">
            <span className="erp-field-label">Nueva referencia alternativa</span>
            <input
              type="text"
              className="erp-input-mono"
              maxLength={15}
              value={nuevaReferencia}
              onChange={(e) => {
                setNuevaReferencia(e.target.value);
                setError('');
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  agregarReferencia();
                }
              }}
              placeholder="Ej: REF-ALT-001"
              disabled={!productoId || agregando}
            />
          </label>
          {error && (
            <div style={{ 
              color: '#dc2626', 
              fontSize: '12px', 
              marginTop: '4px' 
            }}>
              {error}
            </div>
          )}
        </div>
        <button
          type="button"
          className="erp-btn erp-btn-secondary"
          onClick={agregarReferencia}
          disabled={!productoId || !nuevaReferencia.trim() || agregando}
          style={{ marginTop: '24px' }}
        >
          <IconPlus className="erp-action-icon" />
          {agregando ? 'Agregando...' : 'Agregar'}
        </button>
      </div>

      {!productoId && (
        <div style={{ 
          marginTop: '12px',
          padding: '12px',
          backgroundColor: '#fffbeb',
          border: '1px solid #fbbf24',
          borderRadius: '6px',
          fontSize: '13px',
          color: '#92400e'
        }}>
          Guarda el producto primero para poder agregar referencias alternativas
        </div>
      )}

      {referenciasAlternativas.length === 0 && productoId && (
        <div style={{ 
          marginTop: '12px',
          padding: '12px',
          backgroundColor: '#f1f5f9',
          border: '1px solid #cbd5e1',
          borderRadius: '6px',
          fontSize: '13px',
          color: '#475569',
          textAlign: 'center'
        }}>
          No hay referencias alternativas. Agrega una usando el formulario de arriba.
        </div>
      )}
    </div>
  );
}
