import React, { useState, useEffect } from 'react';
import axios from 'axios';

export function CodigosBarrasProducto({ productoId }) {
  const [codigos, setCodigos] = useState([]);
  const [tiposCodigos, setTiposCodigos] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const [editando, setEditando] = useState(null);
  
  const [nuevoCodigo, setNuevoCodigo] = useState({
    codigoBarraTipoId: '',
    valor: '',
    patron: '',
    esPrincipal: false,
    origen: 'interno',
    notas: '',
    validacionOmitida: false,
    activo: true
  });

  useEffect(() => {
    if (productoId) {
      cargarCodigos();
      cargarTiposCodigos();
    }
  }, [productoId]);

  const cargarCodigos = async () => {
    try {
      const response = await axios.get(`http://145.223.103.219:8080/productos/${productoId}/codigos-barras`);
      setCodigos(response.data);
    } catch (error) {
      console.error('Error al cargar códigos de barras:', error);
      mostrarMensaje('Error al cargar códigos de barras', 'error');
    }
  };

  const manejarEnter = (e) => {
    if (e.key === 'Enter') {
      handleAgregarCodigo(e);
    }
  };

  const cargarTiposCodigos = async () => {
    try {
      const response = await axios.get('http://145.223.103.219:8080/productos/tipos-codigos-barras');
      console.log('Tipos de códigos cargados:', response.data);
      setTiposCodigos(response.data);
      if (!response.data || response.data.length === 0) {
        mostrarMensaje('No hay tipos de códigos disponibles. Verifica la migración SQL.', 'error');
      }
    } catch (error) {
      console.error('Error al cargar tipos de códigos:', error);
      mostrarMensaje('Error al cargar tipos de códigos de barras', 'error');
    }
  };

  const mostrarMensaje = (texto, tipo) => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: '', tipo: '' }), 5000);
  };

  const handleEditar = (codigo) => {
    setEditando(codigo.id);
    setNuevoCodigo({
      codigoBarraTipoId: codigo.codigoBarraTipoId,
      valor: codigo.valor,
      patron: codigo.patron || '',
      esPrincipal: codigo.esPrincipal,
      origen: codigo.origen,
      notas: codigo.notas || '',
      validacionOmitida: codigo.validacionOmitida,
      activo: codigo.activo
    });
    setMostrarFormulario(true);
  };

  const handleCancelarEdicion = () => {
    setEditando(null);
    setNuevoCodigo({
      codigoBarraTipoId: '',
      valor: '',
      patron: '',
      esPrincipal: false,
      origen: 'interno',
      notas: '',
      validacionOmitida: false,
      activo: true
    });
    setMostrarFormulario(false);
  };

  const handleAgregarCodigo = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!nuevoCodigo.codigoBarraTipoId || !nuevoCodigo.valor.trim()) {
      mostrarMensaje('Tipo y valor son obligatorios', 'error');
      return;
    }

    setCargando(true);
    try {
      if (editando) {
        await axios.put(
          `http://145.223.103.219:8080/productos/codigos-barras/${editando}`,
          {
            activo: nuevoCodigo.activo,
            esPrincipal: nuevoCodigo.esPrincipal,
            notas: nuevoCodigo.notas
          }
        );
        mostrarMensaje('Código actualizado correctamente', 'success');
      } else {
        await axios.post(
          `http://145.223.103.219:8080/productos/${productoId}/codigos-barras`,
          nuevoCodigo
        );
        mostrarMensaje('Código de barras agregado correctamente', 'success');
      }
      
      setNuevoCodigo({
        codigoBarraTipoId: '',
        valor: '',
        patron: '',
        esPrincipal: false,
        origen: 'interno',
        notas: '',
        validacionOmitida: false,
        activo: true
      });
      setMostrarFormulario(false);
      setEditando(null);
      await cargarCodigos();
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Error al guardar código de barras';
      mostrarMensaje(errorMsg, 'error');
    } finally {
      setCargando(false);
    }
  };

  const handleToggleActivo = async (codigoId, activoActual) => {
    try {
      await axios.put(
        `http://145.223.103.219:8080/productos/codigos-barras/${codigoId}`,
        { activo: !activoActual }
      );
      mostrarMensaje(
        activoActual ? 'Código desactivado' : 'Código activado',
        'success'
      );
      await cargarCodigos();
    } catch (error) {
      mostrarMensaje('Error al cambiar estado del código', 'error');
    }
  };

  const handleMarcarPrincipal = async (codigoId) => {
    try {
      await axios.put(
        `http://145.223.103.219:8080/productos/codigos-barras/${codigoId}`,
        { esPrincipal: true }
      );
      mostrarMensaje('Código marcado como principal', 'success');
      await cargarCodigos();
    } catch (error) {
      mostrarMensaje('Error al marcar como principal', 'error');
    }
  };

  const handleEliminar = async (codigoId) => {
    if (!window.confirm('¿Está seguro de eliminar este código de barras?')) {
      return;
    }

    try {
      await axios.delete(`http://145.223.103.219:8080/productos/codigos-barras/${codigoId}`);
      mostrarMensaje('Código eliminado correctamente', 'success');
      await cargarCodigos();
    } catch (error) {
      mostrarMensaje('Error al eliminar código', 'error');
    }
  };

  const getOrigenColor = (origen) => {
    const colores = {
      'GS1': '#2563eb',
      'proveedor': '#7c3aed',
      'interno': '#059669',
      'balanza': '#f59e0b'
    };
    return colores[origen] || '#6b7280';
  };

  const codigosActivos = codigos.filter(c => c.activo);
  const codigosInactivos = codigos.filter(c => !c.activo);

  return (
    <div style={{ marginTop: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
          Códigos de Barras
        </h4>
        <button
          type="button"
          onClick={() => mostrarFormulario ? handleCancelarEdicion() : setMostrarFormulario(true)}
          style={{
            padding: '6px 12px',
            fontSize: '12px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {mostrarFormulario ? 'Cancelar' : '+ Agregar Código'}
        </button>
      </div>

      {mensaje.texto && (
        <div style={{
          padding: '8px 12px',
          marginBottom: '12px',
          borderRadius: '4px',
          fontSize: '12px',
          backgroundColor: mensaje.tipo === 'error' ? '#fee2e2' : '#d1fae5',
          color: mensaje.tipo === 'error' ? '#991b1b' : '#065f46',
          border: `1px solid ${mensaje.tipo === 'error' ? '#fecaca' : '#a7f3d0'}`
        }}>
          {mensaje.texto}
        </div>
      )}

      {mostrarFormulario && (
        <div style={{
          padding: '16px',
          backgroundColor: '#f8fafc',
          borderRadius: '6px',
          marginBottom: '16px',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px', color: '#475569' }}>
              Tipo de Código *
            </label>
            <select
              value={nuevoCodigo.codigoBarraTipoId}
              onChange={(e) => setNuevoCodigo({ ...nuevoCodigo, codigoBarraTipoId: e.target.value })}
              required
              style={{
                width: '100%',
                padding: '8px',
                fontSize: '13px',
                border: '1px solid #cbd5e1',
                borderRadius: '4px'
              }}
            >
              <option value="">Seleccionar tipo...</option>
              {tiposCodigos.map(tipo => (
                <option key={tipo.id} value={tipo.id}>
                  {tipo.nombre} {tipo.descripcion && `- ${tipo.descripcion}`}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px', color: '#475569' }}>
              Valor del Código *
            </label>
            <input
              type="text"
              value={nuevoCodigo.valor}
              onChange={(e) => setNuevoCodigo({ ...nuevoCodigo, valor: e.target.value })}
              onKeyDown={manejarEnter}
              placeholder="Ej: 1234567890123"
              required
              style={{
                width: '100%',
                padding: '8px',
                fontSize: '13px',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                fontFamily: 'monospace'
              }}
            />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px', color: '#475569' }}>
              Patrón (opcional - para códigos de balanza)
            </label>
            <input
              type="text"
              value={nuevoCodigo.patron}
              onChange={(e) => setNuevoCodigo({ ...nuevoCodigo, patron: e.target.value })}
              placeholder="Ej: XX00020XXXXXX (X = cualquier dígito)"
              style={{
                width: '100%',
                padding: '8px',
                fontSize: '13px',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                fontFamily: 'monospace'
              }}
            />
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
              💡 Usa X para dígitos variables y números fijos para identificar el producto. Ej: XX00020XXXXXX
            </div>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px', color: '#475569' }}>
              Origen
            </label>
            <select
              value={nuevoCodigo.origen}
              onChange={(e) => setNuevoCodigo({ ...nuevoCodigo, origen: e.target.value })}
              style={{
                width: '100%',
                padding: '8px',
                fontSize: '13px',
                border: '1px solid #cbd5e1',
                borderRadius: '4px'
              }}
            >
              <option value="interno">Interno</option>
              <option value="GS1">GS1</option>
              <option value="proveedor">Proveedor</option>
              <option value="balanza">Balanza</option>
            </select>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', fontSize: '12px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={nuevoCodigo.esPrincipal}
                onChange={(e) => setNuevoCodigo({ ...nuevoCodigo, esPrincipal: e.target.checked })}
                style={{ marginRight: '6px' }}
              />
              Marcar como código principal
            </label>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', fontSize: '12px', cursor: 'pointer', color: '#b45309' }}>
              <input
                type="checkbox"
                checked={nuevoCodigo.validacionOmitida}
                onChange={(e) => setNuevoCodigo({ ...nuevoCodigo, validacionOmitida: e.target.checked })}
                style={{ marginRight: '6px' }}
              />
              Omitir validación de formato (no recomendado)
            </label>
            {nuevoCodigo.validacionOmitida && (
              <div style={{ fontSize: '11px', color: '#b45309', marginTop: '4px' }}>
                Se guardará aunque no cumpla el estándar GS1. Se mostrará una alerta permanente.
              </div>
            )}
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px', color: '#475569' }}>
              Notas (opcional)
            </label>
            <textarea
              value={nuevoCodigo.notas}
              onChange={(e) => setNuevoCodigo({ ...nuevoCodigo, notas: e.target.value })}
              rows="2"
              style={{
                width: '100%',
                padding: '8px',
                fontSize: '13px',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                resize: 'vertical'
              }}
            />
          </div>

          <button
            type="button"
            onClick={handleAgregarCodigo}
            disabled={cargando}
            style={{
              padding: '8px 16px',
              fontSize: '13px',
              backgroundColor: cargando ? '#94a3b8' : '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: cargando ? 'not-allowed' : 'pointer',
              fontWeight: '500'
            }}
          >
            {cargando ? 'Guardando...' : (editando ? 'Actualizar Código' : 'Guardar Código')}
          </button>
        </div>
      )}

      {/* Lista de códigos activos */}
      {codigosActivos.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <h5 style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>
            Códigos Activos
          </h5>
          {codigosActivos.map((codigo) => (
            <div
              key={codigo.id}
              style={{
                padding: '12px',
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                marginBottom: '8px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{
                      fontFamily: 'monospace',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#1e293b'
                    }}>
                      {codigo.valor}
                    </span>
                    {codigo.esPrincipal && (
                      <span style={{
                        fontSize: '10px',
                        padding: '2px 6px',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        borderRadius: '4px',
                        fontWeight: '600'
                      }}>
                        PRINCIPAL
                      </span>
                    )}
                    <span style={{
                      fontSize: '10px',
                      padding: '2px 6px',
                      backgroundColor: getOrigenColor(codigo.origen),
                      color: 'white',
                      borderRadius: '4px',
                      fontWeight: '500'
                    }}>
                      {codigo.origen.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    {codigo.codigoBarraTipoNombre}
                  </div>
                  {codigo.notas && (
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', fontStyle: 'italic' }}>
                      {codigo.notas}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    type="button"
                    onClick={() => handleEditar(codigo)}
                    title="Editar"
                    style={{
                      padding: '4px 8px',
                      fontSize: '11px',
                      backgroundColor: '#e0e7ff',
                      color: '#4338ca',
                      border: '1px solid #c7d2fe',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    ✏️
                  </button>
                  {!codigo.esPrincipal && (
                    <button
                      type="button"
                      onClick={() => handleMarcarPrincipal(codigo.id)}
                      title="Marcar como principal"
                      style={{
                        padding: '4px 8px',
                        fontSize: '11px',
                        backgroundColor: '#eff6ff',
                        color: '#3b82f6',
                        border: '1px solid #bfdbfe',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      ⭐
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleToggleActivo(codigo.id, codigo.activo)}
                    title="Desactivar"
                    style={{
                      padding: '4px 8px',
                      fontSize: '11px',
                      backgroundColor: '#fef3c7',
                      color: '#92400e',
                      border: '1px solid #fde68a',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    ⏸
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEliminar(codigo.id)}
                    title="Eliminar"
                    style={{
                      padding: '4px 8px',
                      fontSize: '11px',
                      backgroundColor: '#fee2e2',
                      color: '#991b1b',
                      border: '1px solid #fecaca',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    🗑
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lista de códigos inactivos */}
      {codigosInactivos.length > 0 && (
        <div>
          <h5 style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>
            Códigos Inactivos
          </h5>
          {codigosInactivos.map((codigo) => (
            <div
              key={codigo.id}
              style={{
                padding: '12px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                marginBottom: '8px',
                opacity: 0.7
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{
                    fontFamily: 'monospace',
                    fontSize: '13px',
                    color: '#64748b',
                    textDecoration: 'line-through'
                  }}>
                    {codigo.valor}
                  </span>
                  <span style={{ fontSize: '11px', color: '#94a3b8', marginLeft: '8px' }}>
                    ({codigo.codigoBarraTipoNombre})
                  </span>
                </div>
                <button
                  onClick={() => handleToggleActivo(codigo.id, codigo.activo)}
                  title="Activar"
                  style={{
                    padding: '4px 8px',
                    fontSize: '11px',
                    backgroundColor: '#dcfce7',
                    color: '#166534',
                    border: '1px solid #bbf7d0',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  ▶
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {codigos.length === 0 && !mostrarFormulario && (
        <div style={{
          padding: '24px',
          textAlign: 'center',
          color: '#94a3b8',
          fontSize: '13px',
          backgroundColor: '#f8fafc',
          borderRadius: '6px',
          border: '1px dashed #cbd5e1'
        }}>
          No hay códigos de barras asignados. Haz clic en "Agregar Código" para comenzar.
        </div>
      )}
    </div>
  );
}
