import React from 'react';

const IndicadorStock = ({ stock, cantidad = 0, mostrarTexto = true, tamaño = 'normal' }) => {
  if (stock === null || stock === undefined) {
    return null;
  }

  const stockDisponible = stock - cantidad;
  
  // Determinar el estado del stock
  let estado = 'suficiente';
  let color = '#10b981'; // verde
  let icono = '✓';
  let mensaje = `Stock: ${stock}`;

  if (stockDisponible < 0) {
    estado = 'insuficiente';
    color = '#ef4444'; // rojo
    icono = '✗';
    mensaje = `Stock insuficiente (disponible: ${stock})`;
  } else if (stockDisponible === 0) {
    estado = 'justo';
    color = '#f59e0b'; // naranja
    icono = '⚠';
    mensaje = `Stock justo (disponible: ${stock})`;
  } else if (stockDisponible <= 5) {
    estado = 'bajo';
    color = '#f59e0b'; // naranja
    icono = '⚠';
    mensaje = `Stock bajo (disponible: ${stock})`;
  }

  const estilos = {
    contenedor: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: tamaño === 'pequeño' ? '12px' : '13px',
    },
    indicador: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: tamaño === 'pequeño' ? '16px' : '18px',
      height: tamaño === 'pequeño' ? '16px' : '18px',
      borderRadius: '50%',
      backgroundColor: color,
      color: 'white',
      fontSize: tamaño === 'pequeño' ? '10px' : '11px',
      fontWeight: 'bold',
    },
    texto: {
      color: color,
      fontWeight: '500',
    }
  };

  return (
    <div style={estilos.contenedor} title={mensaje}>
      <span style={estilos.indicador}>{icono}</span>
      {mostrarTexto && <span style={estilos.texto}>{stock}</span>}
    </div>
  );
};

export default IndicadorStock;
