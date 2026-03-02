import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import API_ENDPOINTS from '../../config/api';
import { procesarCodigoEscaneado } from './codigoBarrasHelper';

/**
 * Componente de campo de escaneo de códigos de barras
 * Se integra en formularios de venta (albaranes, pedidos, etc.)
 */
export function CampoEscanerCodigo({ onProductoEscaneado, disabled = false }) {
  const [codigo, setCodigo] = useState('');
  const [procesando, setProcesando] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const [tiposCodigos, setTiposCodigos] = useState([]);
  const inputRef = useRef(null);
  const [tieneFoco, setTieneFoco] = useState(false);

  useEffect(() => {
    cargarTiposCodigos();
  }, []);

  const cargarTiposCodigos = async () => {
    try {
      const response = await axios.get(`${API_ENDPOINTS.productos}/tipos-codigos-barras`);
      setTiposCodigos(response.data);
    } catch (error) {
      console.error('Error al cargar tipos de códigos:', error);
    }
  };

  const mostrarMensaje = (texto, tipo) => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: '', tipo: '' }), 3000);
  };

  const handleKeyDown = async (e) => {
    if (e.key === 'Enter' && codigo.trim()) {
      e.preventDefault();
      await procesarCodigo();
    }
  };

  const procesarCodigo = async () => {
    if (!codigo.trim() || procesando) {
      return;
    }

    setProcesando(true);
    
    try {
      const resultado = await procesarCodigoEscaneado(codigo, axios, tiposCodigos);
      
      if (resultado.success) {
        // Notificar al componente padre con los datos del producto
        if (onProductoEscaneado) {
          onProductoEscaneado({
            producto: resultado.producto,
            codigoBarra: resultado.codigoBarra,
            cantidad: resultado.cantidad,
            debeAcumular: resultado.debeAcumular,
            tipoCodigo: resultado.tipoCodigo,
            esBalanza: resultado.esBalanza || false
          });
        }
        
        const mensajeProducto = resultado.esBalanza 
          ? `✓ ${resultado.producto.titulo} - ${resultado.cantidad}kg`
          : `✓ ${resultado.producto.titulo}`;
        mostrarMensaje(mensajeProducto, 'success');
        setCodigo('');
        
        // Enfocar de nuevo el input para siguiente escaneo
        setTimeout(() => inputRef.current?.focus(), 100);
      } else {
        mostrarMensaje(resultado.error || 'Código no encontrado', 'error');
        // No limpiar el código para que el usuario pueda verlo
      }
    } catch (error) {
      console.error('Error al procesar código:', error);
      mostrarMensaje('Error al procesar código', 'error');
    } finally {
      setProcesando(false);
    }
  };

  const resolverBorderColor = () => {
    if (tieneFoco) return '#3b82f6';
    if (mensaje.tipo === 'error') return '#ef4444';
    if (mensaje.tipo === 'success') return '#10b981';
    return '#cbd5e1';
  };

  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <label style={{ 
            display: 'block', 
            fontSize: '12px', 
            fontWeight: '500', 
            marginBottom: '4px',
            color: '#475569'
          }}>
            Escanear Código de Barras
          </label>
          <input
            ref={inputRef}
            type="text"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled || procesando}
            placeholder="Escanea o escribe el código y presiona Enter..."
            style={{
              width: '100%',
              padding: '10px 12px',
              fontSize: '14px',
              fontFamily: 'monospace',
              borderWidth: '2px',
              borderStyle: 'solid',
              borderColor: resolverBorderColor(),
              borderRadius: '6px',
              backgroundColor: disabled ? '#f1f5f9' : 'white',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={() => setTieneFoco(true)}
            onBlur={() => setTieneFoco(false)}
          />
        </div>
        <button
          type="button"
          onClick={procesarCodigo}
          disabled={!codigo.trim() || procesando || disabled}
          style={{
            marginTop: '28px',
            padding: '10px 16px',
            fontSize: '13px',
            fontWeight: '500',
            backgroundColor: procesando || disabled ? '#94a3b8' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: procesando || disabled ? 'not-allowed' : 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          {procesando ? '⏳ Buscando...' : '🔍 Buscar'}
        </button>
      </div>
      
      {mensaje.texto && (
        <div style={{
          marginTop: '8px',
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: '500',
          backgroundColor: mensaje.tipo === 'error' ? '#fee2e2' : '#d1fae5',
          color: mensaje.tipo === 'error' ? '#991b1b' : '#065f46',
          border: `1px solid ${mensaje.tipo === 'error' ? '#fecaca' : '#a7f3d0'}`,
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          {mensaje.texto}
        </div>
      )}
      
      <div style={{
        marginTop: '6px',
        fontSize: '11px',
        color: '#64748b',
        fontStyle: 'italic'
      }}>
        💡 Los códigos EAN13/EAN8/CODE128 sumarán cantidad si el producto ya está en la lista
      </div>
    </div>
  );
}
