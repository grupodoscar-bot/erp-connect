import { useState, useCallback, useEffect } from "react";
import { validarDocumentoFiscal } from "./validacionDocumentoFiscal";

const API_URL_PROVEEDORES = "http://145.223.103.219:8080/proveedores";
const crearDireccionVacia = (tipoDireccion = "ENVIO") => ({
  pais: "España",
  codigoPostal: "",
  provincia: "",
  poblacion: "",
  direccion: "",
  tipoDireccion,
});

const formasPago = ["CONTADO", "TARJETA", "TRANSFERENCIA", "CHEQUE"];
const tarifas = ["Normal", "Especial", "Mayorista"];
const modosImpuesto = ["Normal", "Exento", "Reducido"];
const retenciones = ["Exento 0%", "Retención 15%", "Retención 21%"];

const formProveedorInicial = {
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
  recargoEquivalencia: false,
  direcciones: [crearDireccionVacia("FACTURACION"), crearDireccionVacia("ENVIO")],
};

const obtenerAgrupacionIdComoString = (proveedor) => {
  if (!proveedor) return "";
  const posibleId =
    proveedor.agrupacion?.id ??
    proveedor.agrupacionId ??
    proveedor.agrupacion_id ??
    null;
  if (posibleId === null || typeof posibleId === "undefined") return "";
  return posibleId.toString();
};

export function useProveedores({ setMensaje, abrirPestana, cerrarPestana, pestanaActiva }) {
  const [proveedores, setProveedores] = useState([]);
  const [agrupacionesDisponibles, setAgrupacionesDisponibles] = useState([]);
  const [formProveedor, setFormProveedor] = useState(formProveedorInicial);
  const [seccionFormActiva, setSeccionFormActiva] = useState("general");

  const cargarProveedores = useCallback(async () => {
    try {
      const res = await fetch(API_URL_PROVEEDORES);
      const data = await res.json();
      setProveedores(data);
    } catch (err) {
      console.error(err);
      setMensaje("Error al cargar proveedores");
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

  useEffect(() => {
    cargarAgrupaciones();
  }, [cargarAgrupaciones]);

  const limpiarFormProveedor = useCallback(() => {
    setFormProveedor(formProveedorInicial);
    setSeccionFormActiva("general");
  }, []);

  const cargarProveedorEnForm = useCallback((proveedor) => {
    const agrupacionIdString = obtenerAgrupacionIdComoString(proveedor);
    setFormProveedor({
      id: proveedor.id,
      nombreComercial: proveedor.nombreComercial || "",
      nombreFiscal: proveedor.nombreFiscal || "",
      nifCif: proveedor.nifCif || "",
      email: proveedor.email || "",
      web: proveedor.web || "",
      observaciones: proveedor.observaciones || "",
      telefonoFijo: proveedor.telefonoFijo || "",
      telefonoMovil: proveedor.telefonoMovil || "",
      fax: proveedor.fax || "",
      fechaNacimiento: proveedor.fechaNacimiento || "",
      agrupacionId: agrupacionIdString,
      tarifa: proveedor.tarifa || "Normal",
      descuento: proveedor.descuento?.toString() || "0",
      formaPago: proveedor.formaPago || "CONTADO",
      diasPago1: proveedor.diasPago1?.toString() || "0",
      diasPago2: proveedor.diasPago2?.toString() || "0",
      riesgoAutorizado: proveedor.riesgoAutorizado?.toString() || "0",
      bloquearVentas: proveedor.bloquearVentas || false,
      nombreEntidadBancaria: proveedor.nombreEntidadBancaria || "",
      cuentaCccEntidad: proveedor.cuentaCccEntidad || "",
      cuentaCccOficina: proveedor.cuentaCccOficina || "",
      cuentaCccDc: proveedor.cuentaCccDc || "",
      cuentaCccNumero: proveedor.cuentaCccNumero || "",
      cuentaIban: proveedor.cuentaIban || "",
      cuentaIbanPais: proveedor.cuentaIbanPais || "ES",
      modoImpuesto: proveedor.modoImpuesto || "Normal",
      retencion: proveedor.retencion || "Exento 0%",
      recargoEquivalencia: !!proveedor.recargoEquivalencia,
      direcciones:
        Array.isArray(proveedor.direcciones) && proveedor.direcciones.length > 0
          ? proveedor.direcciones.map((dir) => ({
              pais: dir.pais || "España",
              codigoPostal: dir.codigoPostal || "",
              provincia: dir.provincia || "",
              poblacion: dir.poblacion || "",
              direccion: dir.direccion || "",
              tipoDireccion: dir.tipoDireccion || "ENVIO",
            }))
          : [crearDireccionVacia("FACTURACION"), crearDireccionVacia("ENVIO")],
    });
    setSeccionFormActiva("general");
  }, []);

  const cargarDireccionesProveedor = useCallback(async (proveedorId) => {
    if (!proveedorId) return;
    try {
      const res = await fetch(`${API_URL_PROVEEDORES}/${proveedorId}/direcciones`);
      if (!res.ok) throw new Error("Error al cargar direcciones");
      const data = await res.json();
      setFormProveedor((prev) => ({
        ...prev,
        direcciones:
          Array.isArray(data) && data.length > 0
            ? data.map((dir) => ({
                pais: dir.pais || "España",
                codigoPostal: dir.codigoPostal || "",
                provincia: dir.provincia || "",
                poblacion: dir.poblacion || "",
                direccion: dir.direccion || "",
                tipoDireccion: dir.tipoDireccion || "ENVIO",
              }))
            : [crearDireccionVacia("FACTURACION"), crearDireccionVacia("ENVIO")],
      }));
    } catch (error) {
      console.error(error);
      setMensaje?.("No se pudieron cargar las direcciones del proveedor");
      setFormProveedor((prev) => ({ ...prev, direcciones: [crearDireccionVacia("FACTURACION"), crearDireccionVacia("ENVIO")] }));
    }
  }, [setMensaje]);

  const abrirNuevoProveedor = useCallback(() => {
    limpiarFormProveedor();
    abrirPestana("proveedor-nuevo", null, "Nuevo Proveedor");
  }, [limpiarFormProveedor, abrirPestana]);

  const abrirEditarProveedor = useCallback((proveedor) => {
    cargarProveedorEnForm(proveedor);
    cargarDireccionesProveedor(proveedor.id);
    abrirPestana("proveedor-editar", proveedor.id, proveedor.nombreComercial);
  }, [cargarProveedorEnForm, cargarDireccionesProveedor, abrirPestana]);

  const abrirVerProveedor = useCallback((proveedor) => {
    abrirPestana("proveedor-ver", proveedor.id, `Ver: ${proveedor.nombreComercial}`);
  }, [abrirPestana]);

  const guardarProveedor = useCallback(async (e) => {
    e.preventDefault();
    setMensaje("");

    const validacionDocumento = validarDocumentoFiscal(formProveedor.nifCif);
    if (formProveedor.nifCif && !validacionDocumento.esValido) {
      setMensaje("El NIF/CIF/DNI/NIE no es válido");
      return;
    }

    const agrupacionIdValue = formProveedor.agrupacionId
      ? parseInt(formProveedor.agrupacionId, 10)
      : null;
    const agrupacionId = Number.isNaN(agrupacionIdValue) ? null : agrupacionIdValue;

      const direccionesLimpias = (formProveedor.direcciones || [])
      .map((dir) => ({
        pais: dir.pais || "España",
        codigoPostal: dir.codigoPostal || "",
        provincia: dir.provincia || "",
        poblacion: dir.poblacion || "",
        direccion: dir.direccion || "",
        tipoDireccion: dir.tipoDireccion || "ENVIO",
      }))
      .filter((dir) => dir.direccion.trim() !== "");

    const cuerpo = JSON.stringify({
      nombreComercial: formProveedor.nombreComercial,
      nombreFiscal: formProveedor.nombreFiscal,
      nifCif: validacionDocumento.valorNormalizado,
      email: formProveedor.email,
      web: formProveedor.web,
      observaciones: formProveedor.observaciones,
      telefonoFijo: formProveedor.telefonoFijo,
      telefonoMovil: formProveedor.telefonoMovil,
      fax: formProveedor.fax,
      fechaNacimiento: formProveedor.fechaNacimiento || null,
      agrupacionId,
      agrupacion: agrupacionId ? { id: agrupacionId } : null,
      tarifa: formProveedor.tarifa,
      descuento: parseFloat(formProveedor.descuento) || 0,
      formaPago: formProveedor.formaPago,
      diasPago1: parseInt(formProveedor.diasPago1, 10) || 0,
      diasPago2: parseInt(formProveedor.diasPago2, 10) || 0,
      riesgoAutorizado: parseFloat(formProveedor.riesgoAutorizado) || 0,
      bloquearVentas: formProveedor.bloquearVentas,
      nombreEntidadBancaria: formProveedor.nombreEntidadBancaria,
      cuentaCccEntidad: formProveedor.cuentaCccEntidad,
      cuentaCccOficina: formProveedor.cuentaCccOficina,
      cuentaCccDc: formProveedor.cuentaCccDc,
      cuentaCccNumero: formProveedor.cuentaCccNumero,
      cuentaIban: formProveedor.cuentaIban,
      cuentaIbanPais: formProveedor.cuentaIbanPais,
      modoImpuesto: formProveedor.modoImpuesto,
      retencion: formProveedor.retencion,
      recargoEquivalencia: !!formProveedor.recargoEquivalencia,
      direcciones:
        direccionesLimpias.length > 0
          ? direccionesLimpias
          : [crearDireccionVacia("FACTURACION"), crearDireccionVacia("ENVIO")],
    });

    try {
      let res;
      if (!formProveedor.id) {
        res = await fetch(API_URL_PROVEEDORES, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: cuerpo,
        });
      } else {
        res = await fetch(`${API_URL_PROVEEDORES}/${formProveedor.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: cuerpo,
        });
      }

      if (!res.ok) throw new Error("Error en la petición");

      await cargarProveedores();
      setMensaje("Guardado correctamente");
      
      if (pestanaActiva) {
        cerrarPestana(pestanaActiva);
      }
    } catch (err) {
      console.error(err);
      setMensaje("Error al guardar proveedor");
    }
  }, [formProveedor, cargarProveedores, setMensaje, pestanaActiva, cerrarPestana]);

  const borrarProveedor = useCallback(async (id) => {
    if (!window.confirm("¿Seguro que quieres borrar este proveedor?")) return;

    try {
      const res = await fetch(`${API_URL_PROVEEDORES}/${id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) throw new Error("Error al borrar");

      await cargarProveedores();
      setMensaje("Proveedor borrado");
    } catch (err) {
      console.error(err);
      setMensaje("Error al borrar proveedor");
    }
  }, [cargarProveedores, setMensaje]);

  const updateFormProveedorField = useCallback((field, value) => {
    setFormProveedor(prev => ({ ...prev, [field]: value }));
  }, []);

  const agregarDireccion = useCallback(() => {
    setFormProveedor((prev) => {
      const direcciones = [...(prev.direcciones || []), crearDireccionVacia("ENVIO")];
      // Asegurar que la primera siempre sea FACTURACION
      if (direcciones.length > 0) {
        direcciones[0] = { ...direcciones[0], tipoDireccion: "FACTURACION" };
      }
      return { ...prev, direcciones };
    });
  }, []);

  const actualizarDireccion = useCallback((indice, campo, valor) => {
    setFormProveedor((prev) => {
      const direcciones = [...(prev.direcciones || [])];
      if (!direcciones[indice]) return prev;
      direcciones[indice] = { ...direcciones[indice], [campo]: valor };
      // Asegurar que la primera siempre sea FACTURACION y el resto ENVIO
      direcciones[0] = { ...direcciones[0], tipoDireccion: "FACTURACION" };
      for (let i = 1; i < direcciones.length; i++) {
        direcciones[i] = { ...direcciones[i], tipoDireccion: "ENVIO" };
      }
      return { ...prev, direcciones };
    });
  }, []);

  const eliminarDireccion = useCallback((indice) => {
    setFormProveedor((prev) => {
      const direcciones = [...(prev.direcciones || [])].filter((_, i) => i !== indice);
      const result = direcciones.length > 0 ? direcciones : [crearDireccionVacia("FACTURACION")];
      // Asegurar que la primera siempre sea FACTURACION
      if (result.length > 0) {
        result[0] = { ...result[0], tipoDireccion: "FACTURACION" };
      }
      return { ...prev, direcciones: result };
    });
  }, []);

  return {
    proveedores,
    agrupacionesDisponibles,
    formProveedor,
    seccionFormActiva,
    setSeccionFormActiva,
    cargarProveedores,
    cargarAgrupaciones,
    abrirNuevoProveedor,
    abrirEditarProveedor,
    abrirVerProveedor,
    guardarProveedor,
    borrarProveedor,
    updateFormProveedorField,
    agregarDireccion,
    actualizarDireccion,
    eliminarDireccion,
    formasPago,
    tarifas,
    modosImpuesto,
    retenciones,
  };
}
