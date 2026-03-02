import React from 'react';

export function DireccionSelector({
  direcciones,
  value,
  onChange,
  placeholder = "Seleccionar dirección...",
  disabled = false
}) {
  const formatearDireccion = (direccion) => {
    if (typeof direccion === 'string') {
      return direccion;
    }
    if (typeof direccion === 'object' && direccion !== null) {
      const partes = [];
      if (direccion.direccion) partes.push(direccion.direccion);
      if (direccion.codigoPostal) partes.push(direccion.codigoPostal);
      if (direccion.poblacion) partes.push(direccion.poblacion);
      if (direccion.provincia) partes.push(direccion.provincia);
      if (direccion.pais && direccion.pais !== 'España') partes.push(direccion.pais);
      return partes.join(', ');
    }
    return '';
  };

  const obtenerEtiquetaDireccion = (index) => {
    if (index === 0) {
      return 'Dirección de facturación';
    }
    return `Dirección de envío #${index}`;
  };

  return (
    <select
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      style={{ width: '100%' }}
    >
      <option value="">{placeholder}</option>
      {direcciones.map((direccion, index) => {
        const direccionFormateada = formatearDireccion(direccion);
        const valor = typeof direccion === 'object' ? direccion.id || index : direccion;
        const etiqueta = obtenerEtiquetaDireccion(index);
        return (
          <option key={index} value={valor}>
            {etiqueta}: {direccionFormateada}
          </option>
        );
      })}
    </select>
  );
}
