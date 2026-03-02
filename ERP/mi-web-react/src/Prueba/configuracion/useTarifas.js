import { useState, useCallback, useEffect } from "react";

const API_URL_TARIFAS = "http://145.223.103.219:8080/tarifas";

export function useTarifas({ setMensaje }) {
  const [tarifas, setTarifas] = useState([]);
  const [tarifaActual, setTarifaActual] = useState(null);
  const [formTarifa, setFormTarifa] = useState({
    id: null,
    nombre: "",
    descripcion: "",
    activa: true,
    esGeneral: false,
    tipoTarifa: "VENTA",
    ajusteVentaPorcentaje: "",
    ajusteVentaCantidad: "",
    ajusteCompraPorcentaje: "",
    ajusteCompraCantidad: ""
  });
  const [cargandoTarifas, setCargandoTarifas] = useState(false);
  const [mensajeTarifas, setMensajeTarifas] = useState("");
  const [modoEdicion, setModoEdicion] = useState(false);

  // Cargar todas las tarifas
  const cargarTarifas = useCallback(async () => {
    try {
      setCargandoTarifas(true);
      const res = await fetch(API_URL_TARIFAS);
      const data = await res.json();
      setTarifas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al cargar tarifas:", err);
      setMensajeTarifas("Error al cargar las tarifas");
    } finally {
      setCargandoTarifas(false);
    }
  }, []);

  // Cargar tarifas activas
  const cargarTarifasActivas = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL_TARIFAS}/activas`);
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error("Error al cargar tarifas activas:", err);
      return [];
    }
  }, []);

  // Obtener tarifa general
  const obtenerTarifaGeneral = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL_TARIFAS}/general`);
      if (res.ok) {
        return await res.json();
      }
      return null;
    } catch (err) {
      console.error("Error al obtener tarifa general:", err);
      return null;
    }
  }, []);

  // Limpiar formulario
  const limpiarFormTarifa = useCallback(() => {
    setFormTarifa({
      id: null,
      nombre: "",
      descripcion: "",
      activa: true,
      esGeneral: false,
      tipoTarifa: "VENTA",
      ajusteVentaPorcentaje: "",
      ajusteVentaCantidad: "",
      ajusteCompraPorcentaje: "",
      ajusteCompraCantidad: ""
    });
    setModoEdicion(false);
  }, []);

  // Editar tarifa
  const editarTarifa = useCallback((tarifa) => {
    setFormTarifa({
      id: tarifa.id,
      nombre: tarifa.nombre || "",
      descripcion: tarifa.descripcion || "",
      activa: tarifa.activa ?? true,
      esGeneral: tarifa.esGeneral ?? false,
      tipoTarifa: tarifa.tipoTarifa || "VENTA",
      ajusteVentaPorcentaje: tarifa.ajusteVentaPorcentaje?.toString() || "",
      ajusteVentaCantidad: tarifa.ajusteVentaCantidad?.toString() || "",
      ajusteCompraPorcentaje: tarifa.ajusteCompraPorcentaje?.toString() || "",
      ajusteCompraCantidad: tarifa.ajusteCompraCantidad?.toString() || ""
    });
    setModoEdicion(true);
  }, []);

  // Guardar tarifa
  const guardarTarifa = useCallback(async () => {
    try {
      setCargandoTarifas(true);
      setMensajeTarifas("");

      // Validar que si se especifican ajustes, no sea tarifa general
      const tieneAjustesVenta = formTarifa.ajusteVentaPorcentaje || formTarifa.ajusteVentaCantidad;
      const tieneAjustesCompra = formTarifa.ajusteCompraPorcentaje || formTarifa.ajusteCompraCantidad;
      const tieneAjustes = tieneAjustesVenta || tieneAjustesCompra;
      
      if (tieneAjustes && formTarifa.esGeneral) {
        throw new Error("No se pueden aplicar ajustes de precio a la tarifa general");
      }

      // Si es edición y hay ajustes, pedir confirmación
      if (formTarifa.id && tieneAjustes) {
        const confirmar = window.confirm(
          "⚠️ ATENCIÓN: Se recalcularán TODOS los precios de esta tarifa basándose en la tarifa general.\n\n" +
          "Esta acción NO se puede deshacer.\n\n" +
          "¿Desea continuar?"
        );
        if (!confirmar) {
          setCargandoTarifas(false);
          return;
        }
      }

      const url = formTarifa.id ? `${API_URL_TARIFAS}/${formTarifa.id}` : API_URL_TARIFAS;
      const method = formTarifa.id ? "PUT" : "POST";

      // Construir parámetros de URL
      const params = new URLSearchParams();
      
      // Para nuevas tarifas o ediciones con ajustes, copiar/recalcular precios
      if (!formTarifa.id || tieneAjustes) {
        params.append('copiarPreciosGeneral', 'true');

        if (formTarifa.ajusteVentaPorcentaje) {
          params.append('porcentajeIncremento', formTarifa.ajusteVentaPorcentaje);
        }
        if (formTarifa.ajusteVentaCantidad) {
          params.append('cantidadFija', formTarifa.ajusteVentaCantidad);
        }
        if (formTarifa.ajusteCompraPorcentaje) {
          params.append('porcentajeIncrementoCompra', formTarifa.ajusteCompraPorcentaje);
        }
        if (formTarifa.ajusteCompraCantidad) {
          params.append('cantidadFijaCompra', formTarifa.ajusteCompraCantidad);
        }
      }

      const urlConParams = params.toString() ? `${url}?${params.toString()}` : url;

      const parseNullableNumber = (value) => {
        if (value === null || value === undefined || value === "") return null;
        const parsed = parseFloat(value);
        return Number.isNaN(parsed) ? null : parsed;
      };

      const res = await fetch(urlConParams, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: formTarifa.nombre,
          descripcion: formTarifa.descripcion,
          activa: formTarifa.activa,
          esGeneral: formTarifa.esGeneral,
          tipoTarifa: formTarifa.tipoTarifa || "VENTA",
          ajusteVentaPorcentaje: parseNullableNumber(formTarifa.ajusteVentaPorcentaje),
          ajusteVentaCantidad: parseNullableNumber(formTarifa.ajusteVentaCantidad),
          ajusteCompraPorcentaje: parseNullableNumber(formTarifa.ajusteCompraPorcentaje),
          ajusteCompraCantidad: parseNullableNumber(formTarifa.ajusteCompraCantidad)
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error al guardar tarifa");
      }

      const result = await res.json();
      await cargarTarifas();
      limpiarFormTarifa();
      
      if (result.productosCopiadosCount || result.productosActualizados) {
        const count = result.productosCopiadosCount || result.productosActualizados || 0;
        const accion = formTarifa.id ? 'actualizada' : 'creada';
        setMensajeTarifas(`✅ Tarifa ${accion} con ${count} precios procesados`);
        setMensaje(`Tarifa ${accion} con ${count} precios procesados`);
      } else {
        setMensajeTarifas("✅ Tarifa guardada correctamente");
        setMensaje("Tarifa guardada correctamente");
      }
      setTimeout(() => setMensajeTarifas(""), 3000);
    } catch (err) {
      console.error("Error al guardar tarifa:", err);
      setMensajeTarifas(`❌ ${err.message}`);
    } finally {
      setCargandoTarifas(false);
    }
  }, [formTarifa, cargarTarifas, limpiarFormTarifa, setMensaje]);

  // Eliminar tarifa
  const eliminarTarifa = useCallback(async (id) => {
    if (!window.confirm("¿Eliminar esta tarifa? Se eliminarán también todos sus precios asociados.")) return;
    
    try {
      setCargandoTarifas(true);
      const res = await fetch(`${API_URL_TARIFAS}/${id}`, { method: "DELETE" });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error al eliminar tarifa");
      }

      await cargarTarifas();
      setMensajeTarifas("✅ Tarifa eliminada");
      setMensaje("Tarifa eliminada");
      setTimeout(() => setMensajeTarifas(""), 3000);
    } catch (err) {
      console.error("Error al eliminar tarifa:", err);
      setMensajeTarifas(`❌ ${err.message}`);
    } finally {
      setCargandoTarifas(false);
    }
  }, [cargarTarifas, setMensaje]);

  // Inicializar tarifa general
  const inicializarTarifaGeneral = useCallback(async () => {
    try {
      setCargandoTarifas(true);
      setMensajeTarifas("");

      const res = await fetch(`${API_URL_TARIFAS}/inicializar-general`, {
        method: "POST"
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error al inicializar tarifa general");
      }

      const data = await res.json();
      await cargarTarifas();
      setMensajeTarifas(`✅ ${data.mensaje}`);
      setMensaje(`Tarifa general creada. ${data.productosMigrados} productos migrados.`);
      setTimeout(() => setMensajeTarifas(""), 5000);
    } catch (err) {
      console.error("Error al inicializar tarifa general:", err);
      setMensajeTarifas(`❌ ${err.message}`);
    } finally {
      setCargandoTarifas(false);
    }
  }, [cargarTarifas, setMensaje]);

  // Actualizar campo del formulario
  const updateFormTarifaField = useCallback((campo, valor) => {
    setFormTarifa((prev) => ({ ...prev, [campo]: valor }));
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    cargarTarifas();
  }, [cargarTarifas]);

  return {
    // Estado
    tarifas,
    tarifaActual,
    setTarifaActual,
    formTarifa,
    cargandoTarifas,
    mensajeTarifas,
    modoEdicion,

    // Acciones
    cargarTarifas,
    cargarTarifasActivas,
    obtenerTarifaGeneral,
    limpiarFormTarifa,
    editarTarifa,
    guardarTarifa,
    eliminarTarifa,
    inicializarTarifaGeneral,
    updateFormTarifaField,
  };
}
