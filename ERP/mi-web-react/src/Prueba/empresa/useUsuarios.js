import { useState, useCallback } from "react";

const API_URL = "http://145.223.103.219:8080/usuarios";

const formUsuarioInicial = {
  id: null,
  usuario: "",
  contrasena: "",
  dni: "",
  moduloTerceros: false,
  moduloAlmacen: false,
  moduloEmpresa: false,
  moduloVentas: false,
  moduloConfiguracion: false,
  moduloTpv: false,
};

export function useUsuarios({ setMensaje, abrirPestana, cerrarPestana, pestanaActiva }) {
  const [usuarios, setUsuarios] = useState([]);
  const [formUsuario, setFormUsuario] = useState(formUsuarioInicial);

  const cargarUsuarios = useCallback(async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setUsuarios(data);
    } catch (err) {
      console.error(err);
      setMensaje("Error al cargar usuarios");
    }
  }, [setMensaje]);

  const limpiarFormUsuario = useCallback(() => {
    setFormUsuario(formUsuarioInicial);
  }, []);

  const cargarUsuarioEnForm = useCallback((usuario) => {
    setFormUsuario({
      id: usuario.id,
      usuario: usuario.usuario || "",
      contrasena: usuario.contrasena || "",
      dni: usuario.dni || "",
      moduloTerceros: Boolean(usuario.moduloTerceros),
      moduloAlmacen: Boolean(usuario.moduloAlmacen),
      moduloEmpresa: Boolean(usuario.moduloEmpresa),
      moduloVentas: Boolean(usuario.moduloVentas),
      moduloConfiguracion: Boolean(usuario.moduloConfiguracion),
      moduloTpv: Boolean(usuario.moduloTpv),
    });
  }, []);

  const abrirNuevoUsuario = useCallback(() => {
    limpiarFormUsuario();
    abrirPestana("usuario-nuevo");
  }, [limpiarFormUsuario, abrirPestana]);

  const abrirEditarUsuario = useCallback((usuario) => {
    cargarUsuarioEnForm(usuario);
    abrirPestana("usuario-editar", usuario.id, usuario.usuario);
  }, [cargarUsuarioEnForm, abrirPestana]);

  const abrirVerUsuario = useCallback((usuario) => {
    abrirPestana("usuario-ver", usuario.id, `Ver: ${usuario.usuario}`);
  }, [abrirPestana]);

  const guardarUsuario = useCallback(async (e) => {
    e.preventDefault();
    setMensaje("");

    const cuerpo = JSON.stringify({
      usuario: formUsuario.usuario,
      contrasena: formUsuario.contrasena,
      dni: formUsuario.dni,
      moduloTerceros: formUsuario.moduloTerceros,
      moduloAlmacen: formUsuario.moduloAlmacen,
      moduloEmpresa: formUsuario.moduloEmpresa,
      moduloVentas: formUsuario.moduloVentas,
      moduloConfiguracion: formUsuario.moduloConfiguracion,
      moduloTpv: formUsuario.moduloTpv,
    });

    try {
      let res;
      if (!formUsuario.id) {
        res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: cuerpo,
        });
      } else {
        res = await fetch(`${API_URL}/${formUsuario.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: cuerpo,
        });
      }

      if (!res.ok) throw new Error("Error en la petición");

      await cargarUsuarios();
      setMensaje("Usuario guardado correctamente");
      if (pestanaActiva) cerrarPestana(pestanaActiva);
    } catch (err) {
      console.error(err);
      setMensaje("Error al guardar usuario");
    }
  }, [formUsuario, cargarUsuarios, setMensaje, pestanaActiva, cerrarPestana]);

  const borrarUsuario = useCallback(async (id) => {
    if (!window.confirm("¿Seguro que quieres borrar este usuario?")) return;

    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) throw new Error("Error al borrar");

      await cargarUsuarios();
      setMensaje("Usuario borrado");
    } catch (err) {
      console.error(err);
      setMensaje("Error al borrar usuario");
    }
  }, [cargarUsuarios, setMensaje]);

  const updateFormUsuarioField = useCallback((field, value) => {
    setFormUsuario(prev => ({ ...prev, [field]: value }));
  }, []);

  return {
    usuarios,
    formUsuario,
    cargarUsuarios,
    abrirNuevoUsuario,
    abrirEditarUsuario,
    abrirVerUsuario,
    guardarUsuario,
    borrarUsuario,
    updateFormUsuarioField,
  };
}
