import { useState, useCallback, useEffect } from "react";

const API_URL = "http://145.223.103.219:8080/tpv/configuracion-tickets";

export function useConfiguracionTPV({ setMensaje }) {
  const [configuraciones, setConfiguraciones] = useState([]);
  const [configuracionActiva, setConfiguracionActiva] = useState(null);
  const [cargando, setCargando] = useState(false);

  const cargarConfiguraciones = useCallback(async () => {
    try {
      setCargando(true);
      const res = await fetch(API_URL);
      const data = await res.json();
      setConfiguraciones(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error cargando configuraciones:", err);
      setMensaje("Error al cargar configuraciones de tickets");
    } finally {
      setCargando(false);
    }
  }, [setMensaje]);

  const cargarConfiguracionActiva = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/activa`);
      const data = await res.json();
      setConfiguracionActiva(data);
      return data;
    } catch (err) {
      console.error("Error cargando configuración activa:", err);
      setMensaje("Error al cargar configuración activa");
      return null;
    }
  }, [setMensaje]);

  useEffect(() => {
    cargarConfiguraciones();
    cargarConfiguracionActiva();
  }, [cargarConfiguraciones, cargarConfiguracionActiva]);

  const guardarConfiguracion = useCallback(async (config) => {
    try {
      const method = config.id ? "PUT" : "POST";
      const url = config.id ? `${API_URL}/${config.id}` : API_URL;
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      if (!res.ok) throw new Error("Error al guardar configuración");

      const guardada = await res.json();
      setMensaje("Configuración guardada correctamente");
      cargarConfiguraciones();
      if (guardada.activa) {
        setConfiguracionActiva(guardada);
      }
      return guardada;
    } catch (err) {
      console.error(err);
      setMensaje("Error al guardar configuración");
      return null;
    }
  }, [setMensaje, cargarConfiguraciones]);

  const activarConfiguracion = useCallback(async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}/activar`, {
        method: "POST",
      });

      if (!res.ok) throw new Error("Error al activar configuración");

      const activada = await res.json();
      setMensaje("Configuración activada");
      setConfiguracionActiva(activada);
      cargarConfiguraciones();
      return activada;
    } catch (err) {
      console.error(err);
      setMensaje("Error al activar configuración");
      return null;
    }
  }, [setMensaje, cargarConfiguraciones]);

  const borrarConfiguracion = useCallback(async (id) => {
    if (!window.confirm("¿Eliminar esta configuración?")) return;
    try {
      await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      setMensaje("Configuración eliminada");
      cargarConfiguraciones();
      if (configuracionActiva?.id === id) {
        cargarConfiguracionActiva();
      }
    } catch (err) {
      console.error(err);
      setMensaje("Error al eliminar configuración");
    }
  }, [setMensaje, cargarConfiguraciones, cargarConfiguracionActiva, configuracionActiva]);

  return {
    configuraciones,
    configuracionActiva,
    cargando,
    cargarConfiguraciones,
    cargarConfiguracionActiva,
    guardarConfiguracion,
    activarConfiguracion,
    borrarConfiguracion,
  };
}
