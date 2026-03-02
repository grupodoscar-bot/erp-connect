import { useState, useCallback } from "react";

const API_URL = "http://145.223.103.219:8080/subfamilias";
const FAMILIAS_API_URL = "http://145.223.103.219:8080/familias";

const formSubfamiliaInicial = {
  id: null,
  nombre: "",
  descripcion: "",
  familiaId: "",
  imagen: null,
  imagenFile: null,
};

export function useSubfamilias({ setMensaje, abrirPestana, cerrarPestana, pestanaActiva }) {
  const [subfamilias, setSubfamilias] = useState([]);
  const [familiasDisponibles, setFamiliasDisponibles] = useState([]);
  const [formSubfamilia, setFormSubfamilia] = useState(formSubfamiliaInicial);

  const cargarSubfamilias = useCallback(async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setSubfamilias(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setMensaje("Error al cargar subfamilias");
      setSubfamilias([]);
    }
  }, [setMensaje]);

  const cargarFamiliasDisponibles = useCallback(async () => {
    try {
      const res = await fetch(FAMILIAS_API_URL);
      const data = await res.json();
      setFamiliasDisponibles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setFamiliasDisponibles([]);
    }
  }, []);

  const limpiarFormSubfamilia = useCallback(() => {
    setFormSubfamilia(formSubfamiliaInicial);
  }, []);

  const cargarSubfamiliaEnForm = useCallback((subfamilia) => {
    setFormSubfamilia({
      id: subfamilia.id,
      nombre: subfamilia.nombre || "",
      descripcion: subfamilia.descripcion || "",
      familiaId: subfamilia.familia?.id?.toString() || "",
      imagen: subfamilia.imagen ?? null,
      imagenFile: null,
    });
  }, []);

  const abrirNuevaSubfamilia = useCallback(() => {
    limpiarFormSubfamilia();
    abrirPestana("subfamilia-nuevo");
  }, [limpiarFormSubfamilia, abrirPestana]);

  const abrirEditarSubfamilia = useCallback((subfamilia) => {
    cargarSubfamiliaEnForm(subfamilia);
    abrirPestana("subfamilia-editar", subfamilia.id, subfamilia.nombre);
  }, [cargarSubfamiliaEnForm, abrirPestana]);

  const abrirVerSubfamilia = useCallback((subfamilia) => {
    abrirPestana("subfamilia-ver", subfamilia.id, `Ver: ${subfamilia.nombre}`);
  }, [abrirPestana]);

  const guardarSubfamilia = useCallback(async (e) => {
    e.preventDefault();
    setMensaje("");

    const cuerpo = JSON.stringify({
      nombre: formSubfamilia.nombre,
      descripcion: formSubfamilia.descripcion,
      familiaId: formSubfamilia.familiaId ? parseInt(formSubfamilia.familiaId) : null,
    });

    try {
      let res;
      let subfamiliaId = formSubfamilia.id;
      if (!formSubfamilia.id) {
        res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: cuerpo,
        });
        if (!res.ok) throw new Error("Error en la petición");
        const subfamiliaCreada = await res.json();
        subfamiliaId = subfamiliaCreada.id;
      } else {
        res = await fetch(`${API_URL}/${formSubfamilia.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: cuerpo,
        });
      }

      if (!res.ok) throw new Error("Error en la petición");

      if (formSubfamilia.imagenFile && subfamiliaId) {
        const formData = new FormData();
        formData.append("file", formSubfamilia.imagenFile);
        try {
          await fetch(`${API_URL}/${subfamiliaId}/imagen`, {
            method: "POST",
            body: formData,
          });
        } catch (imgErr) {
          console.error("Error al subir imagen:", imgErr);
          setMensaje("Subfamilia guardada pero error al subir imagen");
        }
      }

      await cargarSubfamilias();
      setMensaje("Subfamilia guardada correctamente");
      if (pestanaActiva) cerrarPestana(pestanaActiva);
    } catch (err) {
      console.error(err);
      setMensaje("Error al guardar subfamilia");
    }
  }, [formSubfamilia, cargarSubfamilias, setMensaje, pestanaActiva, cerrarPestana]);

  const borrarSubfamilia = useCallback(async (id) => {
    if (!window.confirm("¿Seguro que quieres borrar esta subfamilia?")) return;

    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) throw new Error("Error al borrar");

      await cargarSubfamilias();
      setMensaje("Subfamilia borrada");
    } catch (err) {
      console.error(err);
      setMensaje("Error al borrar subfamilia");
    }
  }, [cargarSubfamilias, setMensaje]);

  const updateFormSubfamiliaField = useCallback((field, value) => {
    setFormSubfamilia(prev => ({ ...prev, [field]: value }));
  }, []);

  return {
    subfamilias,
    familiasDisponibles,
    formSubfamilia,
    cargarSubfamilias,
    cargarFamiliasDisponibles,
    abrirNuevaSubfamilia,
    abrirEditarSubfamilia,
    abrirVerSubfamilia,
    guardarSubfamilia,
    borrarSubfamilia,
    updateFormSubfamiliaField,
  };
}
