import { useState, useCallback } from "react";

const API_URL = "http://145.223.103.219:8080/agrupaciones";
const CONDICIONES_API_URL = "http://145.223.103.219:8080/condiciones-comerciales-proveedor";
const PRODUCTOS_API_URL = "http://145.223.103.219:8080/productos";
const TARIFAS_API_URL = "http://145.223.103.219:8080/tarifas";

const formAgrupacionInicial = {
  id: null,
  nombre: "",
  descripcion: "",
  descuentoGeneral: "0",
  activa: true,
  observaciones: "",
};

const formCondicionInicial = {
  id: null,
  productoId: "",
  tarifaId: "",
  tipoCondicion: "DESCUENTO_POR_CANTIDAD",
  valor: "",
  precioEspecial: "",
  cantidadMinima: "",
  cantidadMaxima: "",
  activa: true,
  descripcion: "",
  prioridad: "10",
};

export function useAgrupacionesProveedores({ setMensaje, abrirPestana, cerrarPestana, pestanaActiva }) {
  const [agrupaciones, setAgrupaciones] = useState([]);
  const [formAgrupacion, setFormAgrupacion] = useState(formAgrupacionInicial);
  
  // Estados para condiciones comerciales
  const [agrupacionSeleccionada, setAgrupacionSeleccionada] = useState(null);
  const [condiciones, setCondiciones] = useState([]);
  const [productos, setProductos] = useState([]);
  const [tarifas, setTarifas] = useState([]);
  const [formCondicion, setFormCondicion] = useState(formCondicionInicial);
  const [modalCondicionAbierto, setModalCondicionAbierto] = useState(false);
  const [guardandoCondicion, setGuardandoCondicion] = useState(false);

  const cargarAgrupaciones = useCallback(async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setAgrupaciones(data);
    } catch (err) {
      console.error(err);
      setMensaje("Error al cargar agrupaciones");
    }
  }, [setMensaje]);

  const cargarProductos = useCallback(async () => {
    try {
      const res = await fetch(PRODUCTOS_API_URL);
      const data = await res.json();
      setProductos(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const cargarTarifas = useCallback(async () => {
    try {
      const res = await fetch(TARIFAS_API_URL);
      const data = await res.json();
      // Filtrar solo tarifas de compra o ambas
      const tarifasCompra = Array.isArray(data) 
        ? data.filter(t => t.tipoTarifa === 'COMPRA' || t.tipoTarifa === 'AMBAS')
        : [];
      setTarifas(tarifasCompra);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const cargarCondiciones = useCallback(async (agrupacionId) => {
    try {
      const res = await fetch(`${CONDICIONES_API_URL}/agrupacion/${agrupacionId}`);
      const data = await res.json();
      setCondiciones(data);
    } catch (err) {
      console.error(err);
      setMensaje("Error al cargar condiciones comerciales de proveedor");
    }
  }, [setMensaje]);

  const limpiarFormAgrupacion = useCallback(() => {
    setFormAgrupacion(formAgrupacionInicial);
  }, []);

  const cargarAgrupacionEnForm = useCallback((agrupacion) => {
    setFormAgrupacion({
      id: agrupacion.id,
      nombre: agrupacion.nombre || "",
      descripcion: agrupacion.descripcion || "",
      descuentoGeneral: agrupacion.descuentoGeneral?.toString() || "0",
      activa: agrupacion.activa !== false,
      observaciones: agrupacion.observaciones || "",
    });
  }, []);

  const abrirNuevaAgrupacion = useCallback(() => {
    limpiarFormAgrupacion();
    abrirPestana("agrupacion-proveedor-nueva");
  }, [limpiarFormAgrupacion, abrirPestana]);

  const abrirEditarAgrupacion = useCallback((agrupacion) => {
    cargarAgrupacionEnForm(agrupacion);
    abrirPestana("agrupacion-proveedor-editar", agrupacion.id, agrupacion.nombre);
  }, [cargarAgrupacionEnForm, abrirPestana]);

  const abrirVerAgrupacion = useCallback((agrupacion) => {
    abrirPestana("agrupacion-proveedor-ver", agrupacion.id, `Ver: ${agrupacion.nombre}`);
  }, [abrirPestana]);

  const abrirCondicionesAgrupacion = useCallback(async (agrupacion) => {
    setAgrupacionSeleccionada(agrupacion);
    await cargarCondiciones(agrupacion.id);
    await cargarProductos();
    await cargarTarifas();
    abrirPestana("condiciones-proveedor", agrupacion.id, `Condiciones: ${agrupacion.nombre}`);
  }, [cargarCondiciones, cargarProductos, cargarTarifas, abrirPestana]);

  const guardarAgrupacion = useCallback(async (e) => {
    e.preventDefault();

    const cuerpo = JSON.stringify({
      nombre: formAgrupacion.nombre,
      descripcion: formAgrupacion.descripcion,
      descuentoGeneral: parseFloat(formAgrupacion.descuentoGeneral),
      activa: formAgrupacion.activa,
      observaciones: formAgrupacion.observaciones,
    });

    try {
      let res;
      if (!formAgrupacion.id) {
        res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: cuerpo,
        });
      } else {
        res = await fetch(`${API_URL}/${formAgrupacion.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: cuerpo,
        });
      }

      if (!res.ok) throw new Error("Error en la petición");

      await cargarAgrupaciones();
      setMensaje("✅ Agrupación guardada correctamente");
      if (pestanaActiva) cerrarPestana(pestanaActiva);
    } catch (err) {
      console.error(err);
      setMensaje("Error al guardar agrupación");
    }
  }, [formAgrupacion, cargarAgrupaciones, setMensaje, pestanaActiva, cerrarPestana]);

  const borrarAgrupacion = useCallback(async (id) => {
    if (!window.confirm("¿Seguro que quieres borrar esta agrupación?")) return;

    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) throw new Error("Error al borrar");

      await cargarAgrupaciones();
      setMensaje("✅ Agrupación borrada");
    } catch (err) {
      console.error(err);
      setMensaje("Error al borrar agrupación");
    }
  }, [cargarAgrupaciones, setMensaje]);

  const updateFormAgrupacionField = useCallback((field, value) => {
    setFormAgrupacion(prev => ({ ...prev, [field]: value }));
  }, []);

  // Funciones para condiciones comerciales
  const limpiarFormCondicion = useCallback(() => {
    setFormCondicion(formCondicionInicial);
  }, []);

  const abrirNuevaCondicion = useCallback(() => {
    limpiarFormCondicion();
    setModalCondicionAbierto(true);
  }, [limpiarFormCondicion]);

  const cerrarModalCondicion = useCallback(() => {
    setModalCondicionAbierto(false);
    limpiarFormCondicion();
  }, [limpiarFormCondicion]);

  const editarCondicion = useCallback((condicion) => {
    setFormCondicion({
      id: condicion.id,
      productoId: condicion.producto?.id?.toString() || "",
      tarifaId: condicion.tarifa?.id?.toString() || "",
      tipoCondicion: condicion.tipoCondicion || "DESCUENTO_POR_CANTIDAD",
      valor: condicion.valor?.toString() || "",
      precioEspecial: condicion.precioEspecial?.toString() || "",
      cantidadMinima: condicion.cantidadMinima?.toString() || "",
      cantidadMaxima: condicion.cantidadMaxima?.toString() || "",
      activa: condicion.activa !== false,
      descripcion: condicion.descripcion || "",
      prioridad: condicion.prioridad?.toString() || "10",
    });
    setModalCondicionAbierto(true);
  }, []);

  const guardarCondicion = useCallback(async (e) => {
    e.preventDefault();
    
    if (guardandoCondicion) {
      console.log("Ya hay un guardado en proceso, ignorando...");
      return;
    }
    
    setGuardandoCondicion(true);
    setMensaje("");

    const minVal = formCondicion.cantidadMinima !== "" ? parseInt(formCondicion.cantidadMinima, 10) : null;
    const maxVal = formCondicion.cantidadMaxima !== "" ? parseInt(formCondicion.cantidadMaxima, 10) : null;

    if (maxVal !== null && minVal !== null && maxVal < minVal) {
      setMensaje("⚠️ La cantidad máxima no puede ser menor que la mínima.");
      setGuardandoCondicion(false);
      return;
    }

    const tarifaIdParsed = formCondicion.tarifaId && formCondicion.tarifaId !== "" 
      ? parseInt(formCondicion.tarifaId, 10) 
      : null;

    const cuerpo = JSON.stringify({
      agrupacionId: agrupacionSeleccionada.id,
      productoId: parseInt(formCondicion.productoId),
      tarifaId: tarifaIdParsed,
      tipoCondicion: formCondicion.tipoCondicion,
      valor: formCondicion.tipoCondicion === "DESCUENTO_POR_CANTIDAD" ? parseFloat(formCondicion.valor) : null,
      precioEspecial: formCondicion.tipoCondicion === "PRECIO_ESPECIAL" ? parseFloat(formCondicion.precioEspecial) : null,
      cantidadMinima: minVal,
      cantidadMaxima: maxVal,
      activa: formCondicion.activa,
      descripcion: formCondicion.descripcion || null,
      prioridad: parseInt(formCondicion.prioridad)
    });

    try {
      let res;
      if (!formCondicion.id) {
        res = await fetch(CONDICIONES_API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: cuerpo,
        });
      } else {
        res = await fetch(`${CONDICIONES_API_URL}/${formCondicion.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: cuerpo,
        });
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.mensaje || errorData.error || "Error en la petición");
      }

      await cargarCondiciones(agrupacionSeleccionada.id);
      cerrarModalCondicion();
      setMensaje("✅ Condición guardada correctamente");
    } catch (err) {
      console.error(err);
      setMensaje(err.message || "Error al guardar condición");
    } finally {
      setGuardandoCondicion(false);
    }
  }, [formCondicion, agrupacionSeleccionada, cargarCondiciones, setMensaje, cerrarModalCondicion, guardandoCondicion]);

  const borrarCondicion = useCallback(async (id) => {
    if (!window.confirm("¿Seguro que quieres borrar esta condición?")) return;

    try {
      const res = await fetch(`${CONDICIONES_API_URL}/${id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) throw new Error("Error al borrar");

      await cargarCondiciones(agrupacionSeleccionada.id);
      setMensaje("✅ Condición borrada");
    } catch (err) {
      console.error(err);
      setMensaje("Error al borrar condición");
    }
  }, [agrupacionSeleccionada, cargarCondiciones, setMensaje]);

  const updateFormCondicionField = useCallback((field, value) => {
    setFormCondicion(prev => ({ ...prev, [field]: value }));
  }, []);

  return {
    agrupaciones,
    formAgrupacion,
    agrupacionSeleccionada,
    condiciones,
    productos,
    tarifas,
    formCondicion,
    modalCondicionAbierto,
    guardandoCondicion,
    cargarAgrupaciones,
    cargarProductos,
    abrirNuevaAgrupacion,
    abrirEditarAgrupacion,
    abrirVerAgrupacion,
    abrirCondicionesAgrupacion,
    guardarAgrupacion,
    borrarAgrupacion,
    updateFormAgrupacionField,
    abrirNuevaCondicion,
    cerrarModalCondicion,
    editarCondicion,
    guardarCondicion,
    borrarCondicion,
    updateFormCondicionField,
  };
}
