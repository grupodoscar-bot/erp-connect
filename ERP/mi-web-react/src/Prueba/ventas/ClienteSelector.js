import React, { useState, useEffect, useRef } from 'react';

export function ClienteSelector({
  clientes,
  value,
  onChange,
  placeholder = "Buscar cliente...",
  onClienteSelect = null,
  forceUpdate = null
}) {
  const [busqueda, setBusqueda] = useState('');
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [resultadosFiltrados, setResultadosFiltrados] = useState([]);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const abiertoManualmenteRef = useRef(false);

  const sincronizarBusqueda = (texto) => {
    abiertoManualmenteRef.current = false;
    setMostrarResultados(false);
    setBusqueda(texto);
  };

  // Obtener el cliente seleccionado
  const clienteSeleccionado = clientes.find(c => c.id === parseInt(value));

  // Actualizar el texto del input cuando cambia el cliente seleccionado
  useEffect(() => {
    if (clienteSeleccionado) {
      sincronizarBusqueda(clienteSeleccionado.nombreComercial || '');
    } else {
      sincronizarBusqueda('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clienteSeleccionado]);

  // Forzar actualización cuando viene de otro campo
  useEffect(() => {
    if (forceUpdate && clienteSeleccionado) {
      sincronizarBusqueda(clienteSeleccionado.nombreComercial || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forceUpdate, clienteSeleccionado]);

  // Filtrar clientes cuando cambia la búsqueda
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

    const filtrados = clientes.filter(c => {
      const busquedaLower = busqueda.toLowerCase();
      const coincideNombreComercial = c.nombreComercial && c.nombreComercial.toLowerCase().includes(busquedaLower);
      const coincideNombreFiscal = c.nombreFiscal && c.nombreFiscal.toLowerCase().includes(busquedaLower);
      const coincideNif = c.nifCif && c.nifCif.toLowerCase().includes(busquedaLower);
      const coincideId = c.id && c.id.toString().includes(busquedaLower);
      const coincideTelefono = (c.telefonoFijo && c.telefonoFijo.toLowerCase().includes(busquedaLower)) ||
        (c.telefonoMovil && c.telefonoMovil.toLowerCase().includes(busquedaLower));

      return coincideNombreComercial || coincideNombreFiscal || coincideNif || coincideId || coincideTelefono;
    }).slice(0, 50); // Limitar a 50 resultados para mejor rendimiento

    setResultadosFiltrados(filtrados);
    if (abiertoManualmenteRef.current) {
      setMostrarResultados(filtrados.length > 0);
    } else {
      setMostrarResultados(false);
    }
  }, [busqueda, clientes]);

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
    
    // Si el usuario borra todo, limpiar la selección
    if (!valor.trim()) {
      onChange('');
    }
  };

  const handleSelectCliente = (cliente) => {
    onChange(cliente.id);
    if (onClienteSelect) {
      onClienteSelect(cliente);
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
        className="erp-input"
        value={busqueda}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        placeholder={placeholder}
        style={{ width: '100%' }}
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
          minWidth: '300px'
        }}>
          {resultadosFiltrados.map((cliente) => (
            <div
              key={cliente.id}
              onClick={() => handleSelectCliente(cliente)}
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
                {cliente.nombreComercial}
              </div>
              {cliente.nombreFiscal && cliente.nombreFiscal !== cliente.nombreComercial && (
                <div style={{ color: '#64748b', fontSize: '12px' }}>
                  {cliente.nombreFiscal}
                </div>
              )}
              {cliente.nifCif && (
                <div style={{ color: '#059669', fontSize: '11px', marginTop: '2px' }}>
                  CIF/NIF: {cliente.nifCif}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
