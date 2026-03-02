import React, { useState, useEffect, useRef } from 'react';

export function ProductoSelector({
  productos,
  value,
  onChange,
  placeholder = "Escribe referencia o nombre...",
  required = false,
  onProductoSelect = null,
  forceUpdate = null // Para sincronización externa
}) {
  const [busqueda, setBusqueda] = useState('');
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [resultadosFiltrados, setResultadosFiltrados] = useState([]);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Obtener el producto seleccionado
  const productoSeleccionado = productos.find(p => p.id === value);

  // Actualizar el texto del input cuando cambia el producto seleccionado
  useEffect(() => {
    if (productoSeleccionado) {
      setBusqueda(productoSeleccionado.titulo);
    } else {
      setBusqueda('');
    }
  }, [productoSeleccionado]);

  // Forzar actualización cuando viene de otro campo
  useEffect(() => {
    if (forceUpdate && productoSeleccionado) {
      setBusqueda(productoSeleccionado.titulo);
    }
  }, [forceUpdate, productoSeleccionado]);

  // Filtrar productos cuando cambia la búsqueda
  useEffect(() => {
    if (!busqueda.trim()) {
      setResultadosFiltrados([]);
      setMostrarResultados(false);
      return;
    }

    const filtrados = productos.filter(p => {
      const busquedaLower = busqueda.toLowerCase();
      return p.referencia.toLowerCase().includes(busquedaLower) ||
             p.titulo.toLowerCase().includes(busquedaLower);
    }).slice(0, 10); // Limitar a 10 resultados

    setResultadosFiltrados(filtrados);
    setMostrarResultados(filtrados.length > 0);
  }, [busqueda, productos]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setMostrarResultados(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const valor = e.target.value;
    setBusqueda(valor);
    
    // Si el usuario borra todo, limpiar la selección
    if (!valor.trim()) {
      onChange('');
    }
  };

  const handleSelectProducto = (producto) => {
    onChange(producto.id);
    if (onProductoSelect) {
      onProductoSelect(producto);
    }
    setMostrarResultados(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setMostrarResultados(false);
    }
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <input
        ref={inputRef}
        type="text"
        className="erp-input"
        value={busqueda}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setMostrarResultados(resultadosFiltrados.length > 0)}
        placeholder={placeholder}
        required={required}
        style={{ width: '100%' }}
      />
      
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
          marginTop: '4px'
        }}>
          {resultadosFiltrados.map((producto) => (
            <div
              key={producto.id}
              onClick={() => handleSelectProducto(producto)}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                borderBottom: '1px solid #f1f5f9',
                fontSize: '13px'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f8fafc'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
            >
              <div style={{ fontWeight: '500', color: '#1e293b' }}>
                {producto.referencia}
              </div>
              <div style={{ color: '#64748b', fontSize: '12px' }}>
                {producto.titulo}
              </div>
              {producto.precio && (
                <div style={{ color: '#059669', fontSize: '11px', marginTop: '2px' }}>
                  {parseFloat(producto.precio).toFixed(2)} €
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
