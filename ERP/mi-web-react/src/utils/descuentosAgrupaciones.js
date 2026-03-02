export const obtenerClienteActivo = (clienteId, clienteConAgrupacion, clientes) => {
  if (clienteConAgrupacion) {
    return clienteConAgrupacion;
  }
  return clientes.find((c) => c.id === parseInt(clienteId));
};

export const obtenerPrecioBaseProducto = (productoId, productos) => {
  const producto = productos.find((p) => p.id === parseInt(productoId));
  if (!producto) return 0;
  // Buscar el precio en diferentes campos posibles
  return producto.precioVenta ?? producto.precio ?? producto.precioConImpuestos ?? producto.precioUnitario ?? 0;
};

export const quitarDescuentosDeLineas = (lineas) =>
  lineas.map((linea) => ({
    ...linea,
    descuento: 0,
  }));

export const cargarCondicionesPorAgrupacion = async (agrupacionId, condicionesApiUrl) => {
  if (!agrupacionId) return [];

  try {
    const res = await fetch(`${condicionesApiUrl}/agrupacion/${agrupacionId}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error("Error al cargar condiciones comerciales:", err);
  }

  return [];
};

const esCondicionValidaParaCantidad = (condicion, cantidad) => {
  if (cantidad < (condicion.cantidadMinima || 0)) return false;

  // Permitir null, undefined, string vacía
  if (condicion.cantidadMaxima === null || condicion.cantidadMaxima === undefined || condicion.cantidadMaxima === "") {
    return true;
  }

  if (typeof condicion.cantidadMaxima === "string") {
    if (condicion.cantidadMaxima.trim() === "") {
      return true;
    }
  }

  const maxima = parseInt(condicion.cantidadMaxima, 10);
  if (Number.isNaN(maxima)) return true;

  // Validación: máxima no puede ser menor que mínima
  const minima = condicion.cantidadMinima || 0;
  if (maxima < minima) return false;

  return cantidad <= maxima;
};

const formatearRangoCantidad = (condicion) => {
  const minima = condicion.cantidadMinima || 0;
  const maximaRaw = condicion.cantidadMaxima;
  if (maximaRaw === null || maximaRaw === undefined || (typeof maximaRaw === "string" && maximaRaw.trim() === "")) {
    return `≥ ${minima}`;
  }
  return `${minima} - ${maximaRaw}`;
};

export const aplicarCondicionComercialEnLinea = async ({
  index,
  lineas,
  clienteId,
  clienteConAgrupacion,
  clientes,
  productos,
  condicionesApiUrl,
  tarifaId = null,
  obtenerPrecioTarifa = null,
}) => {
  const lineasActualizadas = [...lineas];
  const linea = lineasActualizadas[index];
  const clienteSeleccionado = obtenerClienteActivo(clienteId, clienteConAgrupacion, clientes);

  if (!linea || !linea.productoId) {
    return lineasActualizadas;
  }

  const precioBase = obtenerPrecioBaseProducto(linea.productoId, productos);

  // Intentar obtener precio de tarifa si está disponible
  let precioTarifa = precioBase;
  if (obtenerPrecioTarifa && tarifaId) {
    try {
      const precioData = await obtenerPrecioTarifa(linea.productoId);
      if (precioData?.precio) {
        precioTarifa = precioData.precio;
      }
    } catch (err) {
      console.error("Error al obtener precio de tarifa:", err);
    }
  }

  // Si no hay agrupación, usar precio de tarifa o precio base
  if (!clienteSeleccionado?.agrupacion?.id) {
    lineasActualizadas[index] = {
      ...linea,
      precioUnitario: precioTarifa,
      descuento: 0,
      rangoPrecioEspecial: null,
    };
    return lineasActualizadas;
  }

  try {
    const res = await fetch(
      `${condicionesApiUrl}/agrupacion/${clienteSeleccionado.agrupacion.id}/producto/${linea.productoId}`
    );

    if (res.ok) {
      const condiciones = await res.json();
      // Filtrar condiciones activas y por tarifa si aplica
      const condicionesActivas = condiciones.filter((c) => {
        if (!c.activa) return false;

        const condicionTarifaId = c.tarifa?.id != null ? Number(c.tarifa.id) : null;
        const tarifaActualId = tarifaId != null ? Number(tarifaId) : null;

        // Si la condición tiene tarifa específica, solo aplicar si coincide con la tarifa actual
        if (condicionTarifaId && tarifaActualId && condicionTarifaId !== tarifaActualId) {
          return false;
        }
        return true;
      });

      if (condicionesActivas.length > 0) {
        const cantidad = parseInt(linea.cantidad, 10) || 0;
        // Priorizar condiciones con tarifa específica sobre las generales
        const condicionesOrdenadas = condicionesActivas.sort((a, b) => {
          const aTieneTarifa = a.tarifa?.id != null;
          const bTieneTarifa = b.tarifa?.id != null;
          if (aTieneTarifa && !bTieneTarifa) return -1;
          if (!aTieneTarifa && bTieneTarifa) return 1;
          return (b.prioridad || 0) - (a.prioridad || 0);
        });
        const condicionAplicable = condicionesOrdenadas.find((c) => esCondicionValidaParaCantidad(c, cantidad));

        if (condicionAplicable) {
          if (condicionAplicable.tipoCondicion === "DESCUENTO_POR_CANTIDAD") {
            // Aplicar descuento sobre precio de tarifa (o base si no hay tarifa)
            lineasActualizadas[index] = {
              ...linea,
              precioUnitario: precioTarifa,
              descuento: parseFloat(condicionAplicable.valor),
              rangoPrecioEspecial: null,
              tieneCondicionComercial: true,
            };
          } else if (condicionAplicable.tipoCondicion === "PRECIO_ESPECIAL") {
            lineasActualizadas[index] = {
              ...linea,
              precioUnitario: parseFloat(condicionAplicable.precioEspecial),
              descuento: 0,
              rangoPrecioEspecial: formatearRangoCantidad(condicionAplicable),
              tieneCondicionComercial: true,
            };
          }
          return lineasActualizadas;
        }
      }
    }
  } catch (err) {
    console.error("Error al aplicar condición comercial:", err);
  }

  // Si no hay condición aplicable, usar precio de tarifa (o base si no hay tarifa)
  lineasActualizadas[index] = {
    ...linea,
    precioUnitario: precioTarifa,
    descuento: 0,
    rangoPrecioEspecial: null,
    tieneCondicionComercial: false,
  };
  return lineasActualizadas;
};

export const aplicarDescuentosAgrupacionEnLineas = async ({
  lineas,
  clienteId,
  clienteConAgrupacion,
  clientes,
  productos,
  condicionesApiUrl,
  tarifaId = null,
  obtenerPrecioTarifa = null,
}) => {
  if (!clienteConAgrupacion?.agrupacion) {
    return lineas;
  }

  let resultado = lineas.map((linea) => {
    if (!linea.productoId) return linea;
    const precioBase = obtenerPrecioBaseProducto(linea.productoId, productos);
    return {
      ...linea,
      precioUnitario: precioBase || linea.precioUnitario,
    };
  });

  for (let i = 0; i < resultado.length; i++) {
    if (!resultado[i].productoId) continue;
    resultado = await aplicarCondicionComercialEnLinea({
      index: i,
      lineas: resultado,
      clienteId,
      clienteConAgrupacion,
      clientes,
      productos,
      condicionesApiUrl,
      tarifaId,
      obtenerPrecioTarifa,
    });
  }

  return resultado;
};
