import { useState, useCallback } from "react";
import { validarDocumentoFiscal } from "./validacionDocumentoFiscal";

const API_URL = "http://145.223.103.219:8080/fabricantes";
const crearDireccionVacia = () => ({
  pais: "España",
  codigoPostal: "",
  provincia: "",
  poblacion: "",
  direccion: "",
});

const formasPago = ["CONTADO", "TARJETA", "TRANSFERENCIA", "CHEQUE"];
const tarifas = ["Normal", "Especial", "Mayorista"];
const modosImpuesto = ["Normal", "Exento", "Reducido"];
const retenciones = ["Exento 0%", "Retención 15%", "Retención 21%"];

const formFabricanteInicial = {
  id: null,
  nombreComercial: "",
  nombreFiscal: "",
  nifCif: "",
  email: "",
  web: "",
  observaciones: "",
  telefonoFijo: "",
  telefonoMovil: "",
  fax: "",
  fechaNacimiento: "",
  agrupacionId: "",
  tarifa: "Normal",
  descuento: "0",
  formaPago: "CONTADO",
  diasPago1: "0",
  diasPago2: "0",
  riesgoAutorizado: "0",
  bloquearVentas: false,
  nombreEntidadBancaria: "",
  cuentaCccEntidad: "",
  cuentaCccOficina: "",
  cuentaCccDc: "",
  cuentaCccNumero: "",
  cuentaIban: "",
  cuentaIbanPais: "ES",
  modoImpuesto: "Normal",
  retencion: "Exento 0%",
  direcciones: [crearDireccionVacia()],
};

const obtenerAgrupacionIdComoString = (fabricante) => {
  if (!fabricante) return "";
  const posibleId =
    fabricante.agrupacion?.id ??
    fabricante.agrupacionId ??
    fabricante.agrupacion_id ??
    null;
  if (posibleId === null || typeof posibleId === "undefined") return "";
  return posibleId.toString();
};

export function useFabricantes({ setMensaje, abrirPestana, cerrarPestana, pestanaActiva }) {
  const [fabricantes, setFabricantes] = useState([]);
  const [agrupacionesDisponibles, setAgrupacionesDisponibles] = useState([]);
  const [formFabricante, setFormFabricante] = useState(formFabricanteInicial);
  const [seccionFormActiva, setSeccionFormActiva] = useState("general");

  const cargarFabricantes = useCallback(async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setFabricantes(data);
    } catch (err) {
      console.error(err);
      setMensaje("Error al cargar fabricantes");
    }
  }, [setMensaje]);

  const cargarAgrupaciones = useCallback(async () => {
    try {
      const res = await fetch("http://145.223.103.219:8080/agrupaciones/activas");
      const data = await res.json();
      setAgrupacionesDisponibles(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const limpiarFormFabricante = useCallback(() => {
    setFormFabricante(formFabricanteInicial);
    setSeccionFormActiva("general");
  }, []);

  const cargarFabricanteEnForm = useCallback((fabricante) => {
    const agrupacionIdString = obtenerAgrupacionIdComoString(fabricante);
    setFormFabricante({
      id: fabricante.id,
      nombreComercial: fabricante.nombreComercial || "",
      nombreFiscal: fabricante.nombreFiscal || "",
      nifCif: fabricante.nifCif || "",
      email: fabricante.email || "",
      web: fabricante.web || "",
      observaciones: fabricante.observaciones || "",
      telefonoFijo: fabricante.telefonoFijo || "",
      telefonoMovil: fabricante.telefonoMovil || "",
      fax: fabricante.fax || "",
      fechaNacimiento: fabricante.fechaNacimiento || "",
      agrupacionId: agrupacionIdString,
      tarifa: fabricante.tarifa || "Normal",
      descuento: fabricante.descuento?.toString() || "0",
      formaPago: fabricante.formaPago || "CONTADO",
      diasPago1: fabricante.diasPago1?.toString() || "0",
      diasPago2: fabricante.diasPago2?.toString() || "0",
      riesgoAutorizado: fabricante.riesgoAutorizado?.toString() || "0",
      bloquearVentas: fabricante.bloquearVentas || false,
      nombreEntidadBancaria: fabricante.nombreEntidadBancaria || "",
      cuentaCccEntidad: fabricante.cuentaCccEntidad || "",
      cuentaCccOficina: fabricante.cuentaCccOficina || "",
      cuentaCccDc: fabricante.cuentaCccDc || "",
      cuentaCccNumero: fabricante.cuentaCccNumero || "",
      cuentaIban: fabricante.cuentaIban || "",
      cuentaIbanPais: fabricante.cuentaIbanPais || "ES",
      modoImpuesto: fabricante.modoImpuesto || "Normal",
      retencion: fabricante.retencion || "Exento 0%",
      direcciones:
        Array.isArray(fabricante.direcciones) && fabricante.direcciones.length > 0
          ? fabricante.direcciones.map((dir) => ({
              pais: dir.pais || "España",
              codigoPostal: dir.codigoPostal || "",
              provincia: dir.provincia || "",
              poblacion: dir.poblacion || "",
              direccion: dir.direccion || "",
            }))
          : [crearDireccionVacia()],
    });
    setSeccionFormActiva("general");
  }, []);

  const cargarDireccionesFabricante = useCallback(async (fabricanteId) => {
    if (!fabricanteId) return;
    try {
      const res = await fetch(`${API_URL}/${fabricanteId}/direcciones`);
      if (!res.ok) throw new Error("Error al cargar direcciones");
      const data = await res.json();
      setFormFabricante((prev) => ({
        ...prev,
        direcciones:
          Array.isArray(data) && data.length > 0
            ? data.map((dir) => ({
                pais: dir.pais || "España",
                codigoPostal: dir.codigoPostal || "",
                provincia: dir.provincia || "",
                poblacion: dir.poblacion || "",
                direccion: dir.direccion || "",
              }))
            : [crearDireccionVacia()],
      }));
    } catch (error) {
      console.error(error);
      setMensaje?.("No se pudieron cargar las direcciones del fabricante");
      setFormFabricante((prev) => ({ ...prev, direcciones: [crearDireccionVacia()] }));
    }
  }, [setMensaje]);

  const abrirNuevoFabricante = useCallback(() => {
    limpiarFormFabricante();
    abrirPestana("fabricante-nuevo", null, "Nuevo Fabricante");
  }, [limpiarFormFabricante, abrirPestana]);

  const abrirEditarFabricante = useCallback((fabricante) => {
    cargarFabricanteEnForm(fabricante);
    cargarDireccionesFabricante(fabricante.id);
    abrirPestana("fabricante-editar", fabricante.id, fabricante.nombreComercial);
  }, [cargarFabricanteEnForm, cargarDireccionesFabricante, abrirPestana]);

  const abrirVerFabricante = useCallback((fabricante) => {
    abrirPestana("fabricante-ver", fabricante.id, `Ver: ${fabricante.nombreComercial}`);
  }, [abrirPestana]);

  const guardarFabricante = useCallback(async (e) => {
    e.preventDefault();
    setMensaje("");

    const validacionDocumento = validarDocumentoFiscal(formFabricante.nifCif);
    if (formFabricante.nifCif && !validacionDocumento.esValido) {
      setMensaje("El NIF/CIF/DNI/NIE no es válido");
      return;
    }

    const agrupacionIdValue = formFabricante.agrupacionId
      ? parseInt(formFabricante.agrupacionId, 10)
      : null;
    const agrupacionId = Number.isNaN(agrupacionIdValue) ? null : agrupacionIdValue;

    const direccionesLimpias = (formFabricante.direcciones || [])
      .map((dir) => ({
        pais: dir.pais || "España",
        codigoPostal: dir.codigoPostal || "",
        provincia: dir.provincia || "",
        poblacion: dir.poblacion || "",
        direccion: dir.direccion || "",
      }))
      .filter((dir) => dir.direccion.trim() !== "");

    const cuerpo = JSON.stringify({
      nombreComercial: formFabricante.nombreComercial,
      nombreFiscal: formFabricante.nombreFiscal,
      nifCif: validacionDocumento.valorNormalizado,
      email: formFabricante.email,
      web: formFabricante.web,
      observaciones: formFabricante.observaciones,
      telefonoFijo: formFabricante.telefonoFijo,
      telefonoMovil: formFabricante.telefonoMovil,
      fax: formFabricante.fax,
      fechaNacimiento: formFabricante.fechaNacimiento || null,
      agrupacionId,
      agrupacion: agrupacionId ? { id: agrupacionId } : null,
      tarifa: formFabricante.tarifa,
      descuento: parseFloat(formFabricante.descuento) || 0,
      formaPago: formFabricante.formaPago,
      diasPago1: parseInt(formFabricante.diasPago1, 10) || 0,
      diasPago2: parseInt(formFabricante.diasPago2, 10) || 0,
      riesgoAutorizado: parseFloat(formFabricante.riesgoAutorizado) || 0,
      bloquearVentas: formFabricante.bloquearVentas,
      nombreEntidadBancaria: formFabricante.nombreEntidadBancaria,
      cuentaCccEntidad: formFabricante.cuentaCccEntidad,
      cuentaCccOficina: formFabricante.cuentaCccOficina,
      cuentaCccDc: formFabricante.cuentaCccDc,
      cuentaCccNumero: formFabricante.cuentaCccNumero,
      cuentaIban: formFabricante.cuentaIban,
      cuentaIbanPais: formFabricante.cuentaIbanPais,
      modoImpuesto: formFabricante.modoImpuesto,
      retencion: formFabricante.retencion,
      direcciones: direccionesLimpias.length > 0 ? direccionesLimpias : [crearDireccionVacia()],
    });

    try {
      let res;
      if (!formFabricante.id) {
        res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: cuerpo,
        });
      } else {
        res = await fetch(`${API_URL}/${formFabricante.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: cuerpo,
        });
      }

      if (!res.ok) {
        const errorText = await res.text();
        const mensajeError = `Error en la petición: ${res.status} - ${res.statusText || ""} ${errorText}`.trim();
        console.error("[guardarFabricante] Request body:", JSON.parse(cuerpo));
        console.error("[guardarFabricante] Response:", mensajeError);
        throw new Error(mensajeError);
      }

      await cargarFabricantes();
      setMensaje("Guardado correctamente");
      
      if (pestanaActiva) {
        cerrarPestana(pestanaActiva);
      }
    } catch (err) {
      console.error("[guardarFabricante] Error:", err);
      setMensaje(`Error al guardar fabricante: ${err.message}`);
    }
  }, [formFabricante, cargarFabricantes, setMensaje, pestanaActiva, cerrarPestana]);

  const borrarFabricante = useCallback(async (id) => {
    if (!window.confirm("¿Seguro que quieres borrar este fabricante?")) return;

    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) throw new Error("Error al borrar");

      await cargarFabricantes();
      setMensaje("Fabricante borrado");
    } catch (err) {
      console.error(err);
      setMensaje("Error al borrar fabricante");
    }
  }, [cargarFabricantes, setMensaje]);

  const updateFormFabricanteField = useCallback((field, value) => {
    setFormFabricante(prev => ({ ...prev, [field]: value }));
  }, []);

  const agregarDireccion = useCallback(() => {
    setFormFabricante((prev) => ({
      ...prev,
      direcciones: [...(prev.direcciones || []), crearDireccionVacia()],
    }));
  }, []);

  const actualizarDireccion = useCallback((indice, campo, valor) => {
    setFormFabricante((prev) => {
      const direcciones = [...(prev.direcciones || [])];
      if (!direcciones[indice]) return prev;
      direcciones[indice] = { ...direcciones[indice], [campo]: valor };
      return { ...prev, direcciones };
    });
  }, []);

  const eliminarDireccion = useCallback((indice) => {
    setFormFabricante((prev) => {
      const direcciones = [...(prev.direcciones || [])].filter((_, i) => i !== indice);
      return { ...prev, direcciones: direcciones.length > 0 ? direcciones : [crearDireccionVacia()] };
    });
  }, []);

  return {
    fabricantes,
    agrupacionesDisponibles,
    formFabricante,
    seccionFormActiva,
    setSeccionFormActiva,
    cargarFabricantes,
    cargarAgrupaciones,
    abrirNuevoFabricante,
    abrirEditarFabricante,
    abrirVerFabricante,
    guardarFabricante,
    borrarFabricante,
    updateFormFabricanteField,
    agregarDireccion,
    actualizarDireccion,
    eliminarDireccion,
    formasPago,
    tarifas,
    modosImpuesto,
    retenciones,
  };
}
