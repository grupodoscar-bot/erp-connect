import React, { useState, useEffect, useRef } from 'react';
import { IconSearch } from '../iconos';

export function AutocompletarProducto({ 
  productos, 
  value, 
  onChange, 
  onSelect, 
  placeholder = "Buscar por referencia o nombre..." 
}) {
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [resultados, setResultados] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const inputRef = useRef(null);
  const contenedorRef = useRef(null);

  // Inicializar con el valor del producto si existe
  useEffect(() => {
    if (value && productos.length > 0) {
      const producto = productos.find(p => p.id === parseInt(value));
      if (producto) {
        setProductoSeleccionado(producto);
        setTerminoBusqueda(`${producto.referencia} - ${producto.titulo}`);
      }
    }
  }, [value, productos]);

  // Filtrar productos según término de búsqueda
  useEffect(() => {
    if (!terminoBusqueda.trim()) {
      setResultados([]);
      setMostrarResultados(false);
      return;
    }

    const termino = terminoBusqueda.toLowerCase();
    const filtrados = productos.filter(producto => 
      producto.referencia.toLowerCase().includes(termino) ||
      producto.titulo.toLowerCase().includes(termino)
    ).slice(0, 10); // Limitar a 10 resultados

    setResultados(filtrados);
    setMostrarResultados(filtrados.length > 0);
  }, [terminoBusqueda, productos]);

  // Cerrar resultados al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (contenedorRef.current && !contenedorRef.current.contains(event.target)) {
        setMostrarResultados(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const valor = e.target.value;
    setTerminoBusqueda(valor);
    setProductoSeleccionado(null);
    onChange(''); // Limpiar el valor del producto seleccionado
  };

  const handleSeleccion = (producto) => {
    setProductoSeleccionado(producto);
    setTerminoBusqueda(`${producto.referencia} - ${producto.titulo}`);
    setMostrarResultados(false);
    onChange(producto.id.toString());
    onSelect && onSelect(producto);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setMostrarResultados(false);
    }
  };

  return (
    <div ref={contenedorRef} className="autocompletar-producto" style={{ position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input
          ref={inputRef}
          type="text"
          className="erp-input"
          value={terminoBusqueda}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setMostrarResultados(resultados.length > 0)}
          placeholder={placeholder}
          style={{ flex: 1 }}
        />
        <IconSearch className="erp-action-icon" style={{ color: '#64748b', flexShrink: 0 }} />
      </div>
      
      {mostrarResultados && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          backgroundColor: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '6px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          zIndex: 1000,
          maxHeight: '200px',
          overflowY: 'auto'
        }}>
          {resultados.map((producto) => (
            <div
              key={producto.id}
              onClick={() => handleSeleccion(producto)}
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
