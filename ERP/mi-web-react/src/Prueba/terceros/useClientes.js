import { useState, useCallback } from "react";
import { validarDocumentoFiscal } from "./validacionDocumentoFiscal";

const API_URL_CLIENTES = "http://145.223.103.219:8080/clientes";

const formasPago = ["CONTADO", "TARJETA", "TRANSFERENCIA", "CHEQUE"];
const tarifas = ["Normal", "Especial", "Mayorista"];
const modosImpuesto = ["Normal", "Exento", "Reducido"];
const retenciones = ["Exento 0%", "Retención 15%", "Retención 21%"];

export const crearDireccionVacia = () => ({
  id: null,
  pais: "España",
  codigoPostal: "",
  provincia: "",
  poblacion: "",
  direccion: "",
});

export const formClienteInicial = {
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
  tarifaId: "",
  tarifa: "Normal",
  descuento: "0",
  formaPago: "CONTADO",
  diasPago1: 0,
  diasPago2: 0,
  riesgoAutorizado: 0,
  bloquearVentas: false,
  recargoEquivalencia: false,
  nombreEntidadBancaria: "",
  cuentaCccEntidad: "",
  cuentaCccOficina: "",
  cuentaCccDc: "",
  cuentaCccNumero: "",
  cuentaIban: "",
  cuentaIbanPais: "",
  modoImpuesto: "Normal",
  retencion: "Exento 0%",
  direcciones: [crearDireccionVacia()],
};

export const mapClienteToFormCliente = (cliente = {}) => ({
  id: cliente.id ?? null,
  nombreComercial: cliente.nombreComercial || "",
  nombreFiscal: cliente.nombreFiscal || "",
  nifCif: cliente.nifCif || "",
  email: cliente.email || "",
  web: cliente.web || "",
  observaciones: cliente.observaciones || "",
  telefonoFijo: cliente.telefonoFijo || "",
  telefonoMovil: cliente.telefonoMovil || "",
  fax: cliente.fax || "",
  fechaNacimiento: cliente.fechaNacimiento || "",
  agrupacionId: cliente.agrupacion?.id?.toString() || "",
  tarifaId: cliente.tarifaAsignada?.id?.toString() || "",
  tarifa: cliente.tarifa || "Normal",
  descuento: cliente.descuento?.toString() || "0",
  formaPago: cliente.formaPago || "CONTADO",
  diasPago1: cliente.diasPago1 || 0,
  diasPago2: cliente.diasPago2 || 0,
  riesgoAutorizado: cliente.riesgoAutorizado || 0,
  bloquearVentas: cliente.bloquearVentas || false,
  recargoEquivalencia: cliente.recargoEquivalencia || false,
  nombreEntidadBancaria: cliente.nombreEntidadBancaria || "",
  cuentaCccEntidad: cliente.cuentaCccEntidad || "",
  cuentaCccOficina: cliente.cuentaCccOficina || "",
  cuentaCccDc: cliente.cuentaCccDc || "",
  cuentaCccNumero: cliente.cuentaCccNumero || "",
  cuentaIban: cliente.cuentaIban || "",
  cuentaIbanPais: cliente.cuentaIbanPais || "",
  modoImpuesto: cliente.modoImpuesto || "Normal",
  retencion: cliente.retencion || "Exento 0%",
  direcciones:
    Array.isArray(cliente.direcciones) && cliente.direcciones.length > 0
      ? cliente.direcciones.map((dir) => ({
          id: dir.id ?? null,
          pais: dir.pais || "España",
          codigoPostal: dir.codigoPostal || "",
          provincia: dir.provincia || "",
          poblacion: dir.poblacion || "",
          direccion: dir.direccion || "",
        }))
      : [crearDireccionVacia()],
});

export function useClientes({ setMensaje, abrirPestana, cerrarPestana, pestanaActiva }) {
  const [clientes, setClientes] = useState([]);
  const [agrupacionesDisponibles, setAgrupacionesDisponibles] = useState([]);
  const [formCliente, setFormCliente] = useState(formClienteInicial);
  const [seccionFormActiva, setSeccionFormActiva] = useState("general");

  const cargarClientes = useCallback(async () => {
    try {
      const res = await fetch(API_URL_CLIENTES);
      const data = await res.json();
      setClientes(data);
    } catch (err) {
      console.error(err);
      setMensaje("Error al cargar clientes");
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

  const limpiarFormCliente = useCallback(() => {
    setFormCliente(formClienteInicial);
    setSeccionFormActiva("general");
  }, []);

  const cargarClienteEnForm = useCallback((cliente) => {
    setFormCliente(mapClienteToFormCliente(cliente));
    setSeccionFormActiva("general");
  }, []);

  const cargarDireccionesCliente = useCallback(
    async (clienteId) => {
      if (!clienteId) return;
      try {
        const res = await fetch(`${API_URL_CLIENTES}/${clienteId}/direcciones`);
        if (!res.ok) throw new Error("Error al cargar direcciones");
        const data = await res.json();
        setFormCliente((prev) => ({
          ...prev,
          direcciones:
            Array.isArray(data) && data.length > 0
              ? data.map((dir) => ({
                  id: dir.id ?? null,
                  pais: dir.pais || "España",
                  codigoPostal: dir.codigoPostal || "",
                  provincia: dir.provincia || "",
                  poblacion: dir.poblacion || "",
                  direccion: dir.direccion || "",
                }))
              : [crearDireccionVacia()],
        }));
      } catch (err) {
        console.error(err);
        setMensaje?.("No se pudieron cargar las direcciones");
        setFormCliente((prev) => ({ ...prev, direcciones: [crearDireccionVacia()] }));
      }
    },
    [setMensaje]
  );

  const abrirEditarCliente = useCallback(
    (cliente) => {
      cargarClienteEnForm(cliente);
      cargarDireccionesCliente(cliente.id);
      abrirPestana("cliente-editar", cliente.id, cliente.nombreComercial);
    },
    [cargarClienteEnForm, cargarDireccionesCliente, abrirPestana]
  );

  const abrirNuevoCliente = useCallback(() => {
    limpiarFormCliente();
    abrirPestana("cliente-nuevo");
  }, [limpiarFormCliente, abrirPestana]);

  const abrirVerCliente = useCallback((cliente) => {
    abrirPestana("cliente-ver", cliente.id, `Ver: ${cliente.nombreComercial}`);
  }, [abrirPestana]);

  const guardarCliente = useCallback(async (e) => {
    e.preventDefault();
    setMensaje("");

    const validacionDocumento = validarDocumentoFiscal(formCliente.nifCif);
    if (formCliente.nifCif && !validacionDocumento.esValido) {
      setMensaje("El NIF/CIF/DNI/NIE no es válido");
      return;
    }

    const direccionesLimpias = (formCliente.direcciones || [])
      .map((dir) => ({
        id: dir.id ?? null,
        pais: dir.pais || "España",
        codigoPostal: dir.codigoPostal || "",
        provincia: dir.provincia || "",
        poblacion: dir.poblacion || "",
        direccion: dir.direccion || "",
      }))
      .filter((dir) => dir.direccion.trim() !== "");

    const cuerpo = JSON.stringify({
      nombreComercial: formCliente.nombreComercial,
      nombreFiscal: formCliente.nombreFiscal,
      nifCif: validacionDocumento.valorNormalizado,
      email: formCliente.email,
      web: formCliente.web,
      observaciones: formCliente.observaciones,
      telefonoFijo: formCliente.telefonoFijo,
      telefonoMovil: formCliente.telefonoMovil,
      fax: formCliente.fax,
      fechaNacimiento: formCliente.fechaNacimiento || null,
      agrupacionId: formCliente.agrupacionId ? parseInt(formCliente.agrupacionId) : null,
      tarifaId: formCliente.tarifaId ? parseInt(formCliente.tarifaId) : null,
      tarifa: formCliente.tarifa,
      descuento: parseFloat(formCliente.descuento) || 0,
      formaPago: formCliente.formaPago,
      diasPago1: parseInt(formCliente.diasPago1) || 0,
      diasPago2: parseInt(formCliente.diasPago2) || 0,
      riesgoAutorizado: parseFloat(formCliente.riesgoAutorizado) || 0,
      bloquearVentas: formCliente.bloquearVentas,
      recargoEquivalencia: formCliente.recargoEquivalencia,
      nombreEntidadBancaria: formCliente.nombreEntidadBancaria || "",
      cuentaCccEntidad: formCliente.cuentaCccEntidad || "",
      cuentaCccOficina: formCliente.cuentaCccOficina || "",
      cuentaCccDc: formCliente.cuentaCccDc || "",
      cuentaCccNumero: formCliente.cuentaCccNumero || "",
      cuentaIban: formCliente.cuentaIban || "",
      cuentaIbanPais: formCliente.cuentaIbanPais || "",
      modoImpuesto: formCliente.modoImpuesto,
      retencion: formCliente.retencion,
      direcciones: direccionesLimpias.length > 0 ? direccionesLimpias : [crearDireccionVacia()],
    });

    try {
      let res;
      if (!formCliente.id) {
        res = await fetch(API_URL_CLIENTES, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: cuerpo,
        });
      } else {
        res = await fetch(`${API_URL_CLIENTES}/${formCliente.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: cuerpo,
        });
      }

      if (!res.ok) {
        const errorBody = await res.text();
        let detalleError = `HTTP ${res.status}`;
        if (errorBody) {
          try {
            const parsed = JSON.parse(errorBody);
            detalleError = parsed.message || parsed.error || JSON.stringify(parsed);
          } catch {
            detalleError = errorBody;
          }
        }
        throw new Error(detalleError);
      }

      await cargarClientes();
      setMensaje("Guardado correctamente");
      
      if (pestanaActiva) {
        cerrarPestana(pestanaActiva);
      }
    } catch (err) {
      console.error(err);
      setMensaje(`Error al guardar: ${err.message || err.toString()}`);
    }
  }, [formCliente, cargarClientes, setMensaje, pestanaActiva, cerrarPestana]);

  const borrarCliente = useCallback(async (id) => {
    if (!window.confirm("¿Seguro que quieres borrar este cliente?")) return;

    try {
      const res = await fetch(`${API_URL_CLIENTES}/${id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) throw new Error("Error al borrar");

      await cargarClientes();
      setMensaje("Cliente borrado");
    } catch (err) {
      console.error(err);
      setMensaje("Error al borrar");
    }
  }, [cargarClientes, setMensaje]);

  const updateFormField = useCallback((field, value) => {
    setFormCliente(prev => ({ ...prev, [field]: value }));
  }, []);

  const agregarDireccion = useCallback(() => {
    setFormCliente((prev) => ({
      ...prev,
      direcciones: [...(prev.direcciones || []), crearDireccionVacia()],
    }));
  }, []);

  const actualizarDireccion = useCallback((index, field, value) => {
    setFormCliente((prev) => {
      const direcciones = [...(prev.direcciones || [])];
      if (!direcciones[index]) return prev;
      direcciones[index] = { ...direcciones[index], [field]: value };
      return { ...prev, direcciones };
    });
  }, []);

  const eliminarDireccion = useCallback((index) => {
    // Prevent deletion of first address (billing address)
    if (index === 0) {
      return;
    }
    setFormCliente((prev) => {
      const direcciones = [...(prev.direcciones || [])].filter((_, i) => i !== index);
      return { ...prev, direcciones: direcciones.length > 0 ? direcciones : [crearDireccionVacia()] };
    });
  }, []);

  return {
    clientes,
    agrupacionesDisponibles,
    formCliente,
    seccionFormActiva,
    setSeccionFormActiva,
    cargarClientes,
    cargarAgrupaciones,
    abrirNuevoCliente,
    abrirEditarCliente,
    abrirVerCliente,
    guardarCliente,
    borrarCliente,
    updateFormField,
    agregarDireccion,
    actualizarDireccion,
    eliminarDireccion,
    formasPago,
    tarifas,
    modosImpuesto,
    retenciones,
  };
}
