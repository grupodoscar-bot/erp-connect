import React, { useState, useEffect, useRef } from 'react';

export function ReferenciaSelector({
  productos,
  value,
  onChange,
  placeholder = "Buscar ref o nombre...",
  onProductoSelect = null,
  forceUpdate = null, // Para sincronización externa
  referenciaEditable = null, // Referencia editable independiente
  onReferenciaChange = null // Callback para cambios en la referencia
}) {
  const [busqueda, setBusqueda] = useState('');
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [resultadosFiltrados, setResultadosFiltrados] = useState([]);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const abiertoManualmenteRef = useRef(false);

  // Obtener el producto seleccionado
  const productoSeleccionado = productos.find(p => {
    if (p?.id == null || value == null) return false;
    return p.id.toString() === value.toString();
  });

  const sincronizarBusqueda = (texto) => {
    abiertoManualmenteRef.current = false;
    setMostrarResultados(false);
    setBusqueda(texto);
  };

  // Si hay referenciaEditable, usarla en lugar de sincronizar con el producto
  useEffect(() => {
    if (referenciaEditable !== null) {
      setBusqueda(referenciaEditable);
    } else if (productoSeleccionado) {
      sincronizarBusqueda(productoSeleccionado.referencia || '');
    } else {
      sincronizarBusqueda('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [referenciaEditable, productoSeleccionado]);

  // Forzar actualización cuando viene de otro campo
  useEffect(() => {
    if (forceUpdate && productoSeleccionado && referenciaEditable === null) {
      sincronizarBusqueda(productoSeleccionado.referencia || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forceUpdate, productoSeleccionado]);

  // Filtrar productos cuando cambia la búsqueda
  useEffect(() => {
    if (!busqueda.trim()) {
      setResultadosFiltrados([]);
      if (!abiertoManualmenteRef.current) {
        setMostrarResultados(false);
      }
      return;
    }

    // Buscar solo a partir de 3 caracteres
    if (busqueda.trim().length < 3) {
      setResultadosFiltrados([]);
      setMostrarResultados(false);
      return;
    }

    const filtrados = productos.filter(p => {
      const busquedaLower = busqueda.toLowerCase();
      // Buscar en referencia principal
      if (p.referencia.toLowerCase().includes(busquedaLower)) {
        return true;
      }
      // Buscar en título
      if (p.titulo.toLowerCase().includes(busquedaLower)) {
        return true;
      }
      // Buscar en referencias alternativas
      if (p.referencias && Array.isArray(p.referencias)) {
        return p.referencias.some(ref => 
          !ref.esPrincipal && ref.referencia.toLowerCase().includes(busquedaLower)
        );
      }
      return false;
    }).slice(0, 50); // Limitar a 50 resultados para mejor rendimiento

    setResultadosFiltrados(filtrados);
    if (abiertoManualmenteRef.current) {
      setMostrarResultados(filtrados.length > 0);
    } else {
      setMostrarResultados(false);
    }
  }, [busqueda, productos]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setMostrarResultados(false);
        abiertoManualmenteRef.current = false;
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const valor = e.target.value;
    abiertoManualmenteRef.current = true;
    setBusqueda(valor);
    
    // Si hay callback de referencia editable, notificar el cambio
    if (onReferenciaChange) {
      onReferenciaChange(valor);
    }
    
    // Si el usuario borra todo, limpiar la selección
    if (!valor.trim()) {
      onChange('');
    }
  };

  const handleSelectProducto = (producto, referenciaUsada) => {
    onChange(producto.id);
    if (onProductoSelect) {
      onProductoSelect(producto, referenciaUsada);
    }
    setMostrarResultados(false);
    abiertoManualmenteRef.current = false;
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setMostrarResultados(false);
      abiertoManualmenteRef.current = false;
    }
  };

  const handleFocus = () => {
    abiertoManualmenteRef.current = true;
    // Solo mostrar resultados si ya hay 3+ caracteres escritos
    if (busqueda.trim().length >= 3) {
      setMostrarResultados(resultadosFiltrados.length > 0);
    }
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <input
        ref={inputRef}
        type="text"
        className="erp-input-mono"
        value={busqueda}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        placeholder={placeholder}
        style={{ width: '100%', fontSize: '12px' }}
      />
      
      {busqueda.trim().length > 0 && busqueda.trim().length < 3 && abiertoManualmenteRef.current && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          backgroundColor: '#fffbeb',
          border: '1px solid #fbbf24',
          borderRadius: '6px',
          padding: '8px 12px',
          zIndex: 1000,
          marginTop: '4px',
          fontSize: '12px',
          color: '#92400e'
        }}>
          Escribe al menos 3 caracteres para buscar...
        </div>
      )}

      {mostrarResultados && resultadosFiltrados.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          backgroundColor: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '6px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          maxHeight: '200px',
          overflowY: 'auto',
          zIndex: 1000,
          marginTop: '4px',
          minWidth: '300px' // Hacerlo más ancho
        }}>
          {resultadosFiltrados.map((producto) => {
            // Determinar qué referencia coincide con la búsqueda
            const busquedaLower = busqueda.toLowerCase();
            let referenciaCoincidente = producto.referencia;
            let esAlternativa = false;
            
            // Verificar si coincide con referencia principal
            if (!producto.referencia.toLowerCase().includes(busquedaLower)) {
              // Buscar en referencias alternativas
              const refAlt = producto.referencias?.find(ref => 
                !ref.esPrincipal && ref.referencia.toLowerCase().includes(busquedaLower)
              );
              if (refAlt) {
                referenciaCoincidente = refAlt.referencia;
                esAlternativa = true;
              }
            }
            
            return (
              <div
                key={producto.id}
                onClick={() => handleSelectProducto(producto, referenciaCoincidente)}
                style={{
                  padding: '8px 12px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #f1f5f9',
                  fontSize: '13px'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f8fafc'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
              >
                <div style={{ 
                  fontWeight: '500', 
                  color: '#1e293b', 
                  fontFamily: 'monospace',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  {referenciaCoincidente}
                  {esAlternativa && (
                    <span style={{
                      fontSize: '10px',
                      padding: '2px 6px',
                      backgroundColor: '#f59e0b',
                      color: 'white',
                      borderRadius: '4px',
                      fontWeight: '600'
                    }}>
                      ALT
                    </span>
                  )}
                </div>
                <div style={{ color: '#64748b', fontSize: '12px' }}>
                  {producto.titulo}
                </div>
                {esAlternativa && (
                  <div style={{ color: '#64748b', fontSize: '11px', marginTop: '2px', fontFamily: 'monospace' }}>
                    Principal: {producto.referencia}
                  </div>
                )}
                {producto.precio && (
                  <div style={{ color: '#059669', fontSize: '11px', marginTop: '2px' }}>
                    {parseFloat(producto.precio).toFixed(2)} €
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
