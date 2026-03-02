import { useState, useCallback, useEffect } from "react";

const API_URL = "http://145.223.103.219:8080/almacenes";

const formAlmacenInicial = {
  id: null,
  nombre: "",
  descripcion: "",
  direccion: "",
  activo: true,
};

export function useAlmacenes({ setMensaje, abrirPestana, cerrarPestana, pestanaActiva }) {
  const [almacenes, setAlmacenes] = useState([]);
  const [formAlmacen, setFormAlmacen] = useState(formAlmacenInicial);

  const cargarAlmacenes = useCallback(async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      if (Array.isArray(data)) {
        setAlmacenes(data);
      } else {
        setAlmacenes([]);
      }
    } catch (err) {
      console.error(err);
      setMensaje("Error al cargar almacenes");
      setAlmacenes([]);
    }
  }, [setMensaje]);

  const limpiarFormAlmacen = useCallback(() => {
    setFormAlmacen(formAlmacenInicial);
  }, []);

  const cargarAlmacenEnForm = useCallback((almacen) => {
    setFormAlmacen({
      id: almacen.id,
      nombre: almacen.nombre ?? "",
      descripcion: almacen.descripcion ?? "",
      direccion: almacen.direccion ?? "",
      activo: Boolean(almacen.activo),
    });
  }, []);

  const abrirNuevoAlmacen = useCallback(() => {
    limpiarFormAlmacen();
    abrirPestana("almacen-nuevo");
  }, [limpiarFormAlmacen, abrirPestana]);

  const abrirEditarAlmacen = useCallback((almacen) => {
    cargarAlmacenEnForm(almacen);
    abrirPestana("almacen-editar", almacen.id, almacen.nombre);
  }, [cargarAlmacenEnForm, abrirPestana]);

  const abrirVerAlmacen = useCallback((almacen) => {
    abrirPestana("almacen-ver", almacen.id, `Ver: ${almacen.nombre}`);
  }, [abrirPestana]);

  const guardarAlmacen = useCallback(async (e) => {
    e.preventDefault();
    setMensaje("");

    const cuerpo = JSON.stringify({
      nombre: formAlmacen.nombre,
      descripcion: formAlmacen.descripcion,
      direccion: formAlmacen.direccion,
      activo: formAlmacen.activo,
    });

    try {
      let res;
      if (!formAlmacen.id) {
        res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: cuerpo,
        });
      } else {
        res = await fetch(`${API_URL}/${formAlmacen.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: cuerpo,
        });
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error en la petición");
      }

      await cargarAlmacenes();
      setMensaje("Almacén guardado correctamente");
      if (pestanaActiva) cerrarPestana(pestanaActiva);
    } catch (err) {
      console.error(err);
      setMensaje(err.message || "Error al guardar almacén");
    }
  }, [formAlmacen, cargarAlmacenes, setMensaje, pestanaActiva, cerrarPestana]);

  const borrarAlmacen = useCallback(async (id) => {
    if (!window.confirm("¿Seguro que quieres borrar este almacén?")) return;

    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error al borrar");
      }

      await cargarAlmacenes();
      setMensaje("Almacén borrado");
    } catch (err) {
      console.error(err);
      setMensaje(err.message || "Error al borrar almacén");
    }
  }, [cargarAlmacenes, setMensaje]);

  const updateFormAlmacenField = useCallback((field, value) => {
    setFormAlmacen(prev => ({ ...prev, [field]: value }));
  }, []);

  useEffect(() => {
    cargarAlmacenes();
  }, [cargarAlmacenes]);

  return {
    almacenes,
    formAlmacen,
    cargarAlmacenes,
    abrirNuevoAlmacen,
    abrirEditarAlmacen,
    abrirVerAlmacen,
    guardarAlmacen,
    borrarAlmacen,
    updateFormAlmacenField,
  };
}
