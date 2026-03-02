import { useState, useCallback, useEffect } from "react";

const API_URL_ALBARANES = "http://145.223.103.219:8080/albaranes";

export function useTarifasAlbaran() {
  const [tarifasDisponibles, setTarifasDisponibles] = useState([]);
  const [tarifaSeleccionada, setTarifaSeleccionada] = useState(null);
  const [esMultitarifaPermitida, setEsMultitarifaPermitida] = useState(false);
  const [tarifaPorDefecto, setTarifaPorDefecto] = useState(null);
  const [cargandoTarifas, setCargandoTarifas] = useState(false);

  // Cargar tarifas disponibles para albaranes
  const cargarTarifasDisponibles = useCallback(async () => {
    try {
      setCargandoTarifas(true);
      const res = await fetch(`${API_URL_ALBARANES}/tarifas-disponibles`);
      const data = await res.json();
      
      setTarifasDisponibles(data.tarifas || []);
      setEsMultitarifaPermitida(data.esMultitarifaPermitida || false);
      setTarifaPorDefecto(data.tarifaPorDefecto);
      
      // Mantener la selección actual si la tarifa aún existe, sino usar por defecto
      setTarifaSeleccionada(prev => {
        if (prev) {
          // Verificar si la tarifa seleccionada aún existe en las disponibles
          const tarifaAunExiste = (data.tarifas || []).find(t => t.id === prev.id);
          if (tarifaAunExiste) {
            return tarifaAunExiste; // Mantener selección actual
          }
        }
        // Si no hay selección previa o ya no existe, usar por defecto
        return data.tarifaPorDefecto || null;
      });
    } catch (err) {
      console.error("Error al cargar tarifas:", err);
    } finally {
      setCargandoTarifas(false);
    }
  }, []);

  // Obtener precio de producto según tarifa seleccionada
  const obtenerPrecioProducto = useCallback(async (productoId) => {
    if (!productoId) return null;
    
    try {
      const tarifaId = tarifaSeleccionada?.id;
      const params = new URLSearchParams({ productoId: productoId.toString() });
      if (tarifaId) {
        params.append('tarifaId', tarifaId.toString());
      }
      
      const res = await fetch(`${API_URL_ALBARANES}/precio-producto?${params}`);
      
      if (res.ok) {
        return await res.json();
      } else {
        const errorData = await res.json();
        console.warn("No se encontró precio para producto:", errorData.error);
        return null;
      }
    } catch (err) {
      console.error("Error al obtener precio del producto:", err);
      return null;
    }
  }, [tarifaSeleccionada]);

  // Cambiar tarifa seleccionada
  const cambiarTarifa = useCallback((tarifaId) => {
    const tarifa = tarifasDisponibles.find(t => t.id === parseInt(tarifaId));
    setTarifaSeleccionada(tarifa || null);
  }, [tarifasDisponibles]);

  // Resetear a tarifa por defecto
  const resetearTarifaPorDefecto = useCallback(() => {
    if (tarifaPorDefecto) {
      setTarifaSeleccionada(tarifaPorDefecto);
    }
  }, [tarifaPorDefecto]);

  // Cambiar tarifa basada en el cliente seleccionado
  const cambiarTarifaPorCliente = useCallback((cliente) => {
    if (!cliente || !esMultitarifaPermitida) {
      resetearTarifaPorDefecto();
      return;
    }
    
    // Si el cliente tiene tarifa asignada, usarla
    if (cliente.tarifaAsignada?.id) {
      const tarifaCliente = tarifasDisponibles.find(
        t => t.id === parseInt(cliente.tarifaAsignada.id)
      );
      if (tarifaCliente) {
        setTarifaSeleccionada(tarifaCliente);
      } else {
        resetearTarifaPorDefecto();
      }
    } else {
      // Si no tiene tarifa asignada, usar la general
      resetearTarifaPorDefecto();
    }
  }, [tarifasDisponibles, esMultitarifaPermitida, resetearTarifaPorDefecto]);

  // Cargar tarifas al montar el componente
  useEffect(() => {
    cargarTarifasDisponibles();
  }, [cargarTarifasDisponibles]);

  return {
    // Estado
    tarifasDisponibles,
    tarifaSeleccionada,
    tarifaSeleccionadaId: tarifaSeleccionada?.id || null,
    esMultitarifaPermitida,
    tarifaPorDefecto,
    cargandoTarifas,

    // Acciones
    cargarTarifasDisponibles,
    obtenerPrecioProducto,
    cambiarTarifa,
    cambiarTarifaPorCliente,
    resetearTarifaPorDefecto,
    refrescarTarifas: cargarTarifasDisponibles,
  };
}
