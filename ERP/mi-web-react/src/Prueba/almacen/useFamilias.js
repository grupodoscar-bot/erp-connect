import { useState, useCallback } from "react";

const API_URL = "http://145.223.103.219:8080/familias";

const formFamiliaInicial = {
  id: null,
  nombre: "",
  descripcion: "",
  colorTPV: "#1d4ed8",
  imagen: null,
  imagenFile: null,
};

export function useFamilias({ setMensaje, abrirPestana, cerrarPestana, pestanaActiva }) {
  const [familias, setFamilias] = useState([]);
  const [formFamilia, setFormFamilia] = useState(formFamiliaInicial);

  const cargarFamilias = useCallback(async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      let familiasList = [];
      if (Array.isArray(data)) {
        familiasList = data;
      } else if (Array.isArray(data?.content)) {
        familiasList = data.content;
      }
      familiasList.sort((a, b) => a.id - b.id);
      setFamilias(familiasList);
    } catch (err) {
      console.error(err);
      setMensaje("Error al cargar familias");
      setFamilias([]);
    }
  }, [setMensaje]);

  const limpiarFormFamilia = useCallback(() => {
    setFormFamilia(formFamiliaInicial);
  }, []);

  const cargarFamiliaEnForm = useCallback((familia) => {
    setFormFamilia({
      id: familia.id,
      nombre: familia.nombre || "",
      descripcion: familia.descripcion || "",
      colorTPV: familia.colorTPV || "#1d4ed8",
      imagen: familia.imagen ?? null,
      imagenFile: null,
    });
  }, []);

  const abrirNuevaFamilia = useCallback(() => {
    limpiarFormFamilia();
    abrirPestana("familia-nuevo");
  }, [limpiarFormFamilia, abrirPestana]);

  const abrirEditarFamilia = useCallback((familia) => {
    cargarFamiliaEnForm(familia);
    abrirPestana("familia-editar", familia.id, familia.nombre);
  }, [cargarFamiliaEnForm, abrirPestana]);

  const abrirVerFamilia = useCallback((familia) => {
    abrirPestana("familia-ver", familia.id, `Ver: ${familia.nombre}`);
  }, [abrirPestana]);

  const guardarFamilia = useCallback(async (e) => {
    e.preventDefault();
    setMensaje("");

    const cuerpo = JSON.stringify({
      nombre: formFamilia.nombre,
      descripcion: formFamilia.descripcion,
      colorTPV: formFamilia.colorTPV,
    });

    try {
      let res;
      let familiaId = formFamilia.id;
      if (!formFamilia.id) {
        res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: cuerpo,
        });
        if (!res.ok) throw new Error("Error en la petición");
        const familiaCreada = await res.json();
        familiaId = familiaCreada.id;
      } else {
        res = await fetch(`${API_URL}/${formFamilia.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: cuerpo,
        });
      }

      if (!res.ok) throw new Error("Error en la petición");

      if (formFamilia.imagenFile && familiaId) {
        const formData = new FormData();
        formData.append("file", formFamilia.imagenFile);
        try {
          await fetch(`${API_URL}/${familiaId}/imagen`, {
            method: "POST",
            body: formData,
          });
        } catch (imgErr) {
          console.error("Error al subir imagen:", imgErr);
          setMensaje("Familia guardada pero error al subir imagen");
        }
      }

      await cargarFamilias();
      setMensaje("Familia guardada correctamente");
      if (pestanaActiva) cerrarPestana(pestanaActiva);
    } catch (err) {
      console.error(err);
      setMensaje("Error al guardar familia");
    }
  }, [formFamilia, cargarFamilias, setMensaje, pestanaActiva, cerrarPestana]);

  const borrarFamilia = useCallback(async (id) => {
    if (!window.confirm("¿Seguro que quieres borrar esta familia?")) return;

    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) throw new Error("Error al borrar");

      await cargarFamilias();
      setMensaje("Familia borrada");
    } catch (err) {
      console.error(err);
      setMensaje("Error al borrar familia");
    }
  }, [cargarFamilias, setMensaje]);

  const updateFormFamiliaField = useCallback((field, value) => {
    setFormFamilia(prev => ({ ...prev, [field]: value }));
  }, []);

  return {
    familias,
    formFamilia,
    cargarFamilias,
    abrirNuevaFamilia,
    abrirEditarFamilia,
    abrirVerFamilia,
    guardarFamilia,
    borrarFamilia,
    updateFormFamiliaField,
  };
}
