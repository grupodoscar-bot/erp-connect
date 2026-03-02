import { useState, useCallback, useEffect } from "react";
import { 
  API_URL_VENTAS, 
  API_URL_PLANTILLAS 
} from "./ConfiguracionComponents";
import { useAparienciaConfig } from "./useAparienciaConfig";

const API_URL_TIPOS_IVA = "http://145.223.103.219:8080/tipos-iva";
export const ESTADOS_ALBARAN_PREDETERMINADOS = [
  { nombre: "Pendiente", colorClaro: "#FDE68A55", colorOscuro: "#92400E55" },
  { nombre: "Emitido", colorClaro: "#BBF7D055", colorOscuro: "#14532D55" },
  { nombre: "Entregado", colorClaro: "#C7D2FE55", colorOscuro: "#312E8155" },
  { nombre: "Facturado", colorClaro: "#FBCFE855", colorOscuro: "#701A7555" },
  { nombre: "Cancelado", colorClaro: "#FECACA55", colorOscuro: "#7F1D1D55" },
];

export const COLORES_PRESET = [
  { claro: "#FDE68A55", oscuro: "#92400E55", nombre: "Ámbar" },
  { claro: "#BBF7D055", oscuro: "#14532D55", nombre: "Verde" },
  { claro: "#C7D2FE55", oscuro: "#312E8155", nombre: "Índigo" },
  { claro: "#FBCFE855", oscuro: "#701A7555", nombre: "Fucsia" },
  { claro: "#BAE6FD55", oscuro: "#0C4A6E55", nombre: "Celeste" },
  { claro: "#FECACA55", oscuro: "#7F1D1D55", nombre: "Rojo" },
  { claro: "#FDE68A44", oscuro: "#78350F55", nombre: "Mostaza" },
  { claro: "#DCFCE755", oscuro: "#14532D55", nombre: "Lima" },
  { claro: "#DDD6FE55", oscuro: "#4C1D9555", nombre: "Violeta" },
  { claro: "#F5D0FE55", oscuro: "#86198F55", nombre: "Magenta" },
];

export function useConfiguracion({ setMensaje }) {
  // ========== CONFIGURACIÓN DE VENTAS ==========
  const [contabilizarAlbaran, setContabilizarAlbaran] = useState("PREGUNTAR");
  const [documentoDescuentaStock, setDocumentoDescuentaStock] = useState("ALBARAN");
  const [permitirVentaMultialmacen, setPermitirVentaMultialmacen] = useState(false);
  const [permitirVentaSinStock, setPermitirVentaSinStock] = useState(false);
  const [permitirMultitarifa, setPermitirMultitarifa] = useState(false);
  const [estadosAlbaran, setEstadosAlbaran] = useState(ESTADOS_ALBARAN_PREDETERMINADOS);
  const [cargandoVentas, setCargandoVentas] = useState(false);
  const [mensajeVentas, setMensajeVentas] = useState("");

  const cargarConfiguracionVentas = useCallback(async () => {
    try {
      const res = await fetch(API_URL_VENTAS);
      const data = await res.json();
      setContabilizarAlbaran(data.contabilizarAlbaran || "PREGUNTAR");
      setDocumentoDescuentaStock(data.documentoDescuentaStock || "ALBARAN");
      setPermitirVentaMultialmacen(data.permitirVentaMultialmacen || false);
      setPermitirVentaSinStock(data.permitirVentaSinStock || false);
      setPermitirMultitarifa(data.permitirMultitarifa || false);
      const estados = Array.isArray(data.estadosAlbaran) ? data.estadosAlbaran : [];
      setEstadosAlbaran(estados.length ? estados : ESTADOS_ALBARAN_PREDETERMINADOS);
    } catch (err) {
      console.error("Error al cargar configuración:", err);
      setMensajeVentas("Error al cargar la configuración");
    }
  }, []);

  const guardarConfiguracionVentas = useCallback(async () => {
    try {
      setCargandoVentas(true);
      setMensajeVentas("");

      const res = await fetch(API_URL_VENTAS, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contabilizarAlbaran,
          documentoDescuentaStock,
          permitirVentaMultialmacen,
          permitirVentaSinStock,
          permitirMultitarifa,
          estadosAlbaran,
        }),
      });

      if (!res.ok) {
        throw new Error("Error al guardar configuración");
      }

      await res.json();
      setMensajeVentas("✅ Configuración guardada correctamente");
      setMensaje("Configuración de ventas guardada");

      setTimeout(() => setMensajeVentas(""), 3000);
    } catch (err) {
      console.error("Error al guardar configuración:", err);
      setMensajeVentas("❌ Error al guardar la configuración");
    } finally {
      setCargandoVentas(false);
    }
  }, [contabilizarAlbaran, documentoDescuentaStock, permitirVentaMultialmacen, permitirVentaSinStock, permitirMultitarifa, estadosAlbaran, setMensaje]);

  const agregarEstadoAlbaran = useCallback((nombre, colorClaro, colorOscuro) => {
    const limpio = (nombre || "").trim();
    if (!limpio) return;
    const preset = COLORES_PRESET[0];
    setEstadosAlbaran((prev) => {
      if (prev.some(e => e.nombre.toLowerCase() === limpio.toLowerCase())) return prev;
      return [...prev, {
        nombre: limpio,
        colorClaro: colorClaro || preset.claro,
        colorOscuro: colorOscuro || preset.oscuro
      }];
    });
  }, []);

  const actualizarEstadoAlbaran = useCallback((index, campo, valor) => {
    setEstadosAlbaran((prev) => {
      if (index < 0 || index >= prev.length) return prev;
      const copia = [...prev];
      copia[index] = { ...copia[index], [campo]: valor };
      return copia;
    });
  }, []);

  const eliminarEstadoAlbaran = useCallback((index) => {
    setEstadosAlbaran((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const restaurarEstadosAlbaran = useCallback(() => {
    setEstadosAlbaran(ESTADOS_ALBARAN_PREDETERMINADOS);
  }, []);

  // ========== APARIENCIA ==========
  const {
    temas,
    temasModoActual,
    temaActivo,
    aplicarTema,
    mensajeApariencia,
    cargandoApariencia,
    modoVisual,
    alternarModoVisual,
    cambiandoModo,
    actualizarModoVisual,
  } = useAparienciaConfig({ setMensaje });

  // ========== PLANTILLAS PDF ==========
  const [plantillas, setPlantillas] = useState([]);
  const [plantillaActual, setPlantillaActual] = useState(null);
  const [mensajePlantillas, setMensajePlantillas] = useState('');

  const cargarPlantillas = useCallback(async () => {
    try {
      const res = await fetch(API_URL_PLANTILLAS);
      const data = await res.json();
      setPlantillas(data);
      
      const activa = data.find(p => p.activa);
      if (activa) {
        setPlantillaActual(activa);
      } else if (data.length > 0) {
        setPlantillaActual(data[0]);
      }
    } catch (err) {
      console.error(err);
      setMensajePlantillas("Error al cargar plantillas");
    }
  }, []);

  const cargarPlantilla = useCallback((plantilla) => {
    setPlantillaActual(plantilla);
  }, []);

  const activarPlantilla = useCallback(async (id) => {
    try {
      const res = await fetch(`${API_URL_PLANTILLAS}/${id}/activar`, {
        method: "POST"
      });

      if (!res.ok) throw new Error("Error al activar");

      await cargarPlantillas();
      setMensajePlantillas("✅ Plantilla activada");
      setMensaje("Plantilla activada correctamente");
    } catch (err) {
      console.error(err);
      setMensajePlantillas("❌ Error al activar plantilla");
    }
  }, [cargarPlantillas, setMensaje]);

  const eliminarPlantilla = useCallback(async (id) => {
    try {
      const res = await fetch(`${API_URL_PLANTILLAS}/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Error al eliminar");
      }

      if (plantillaActual?.id === id) {
        setPlantillaActual(null);
      }

      await cargarPlantillas();
      setMensajePlantillas("✅ Plantilla eliminada");
      setMensaje("Plantilla eliminada correctamente");
    } catch (err) {
      console.error(err);
      setMensajePlantillas("❌ No se pudo eliminar la plantilla");
    }
  }, [plantillaActual, cargarPlantillas, setMensaje]);

  const [plantillaParaEditar, setPlantillaParaEditar] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);

  const nuevaPlantilla = useCallback(() => {
    setPlantillaParaEditar(null);
    setModoEdicion(true);
  }, []);

  const editarPlantilla = useCallback((plantilla) => {
    setPlantillaParaEditar(plantilla);
    setModoEdicion(true);
  }, []);

  const cerrarEditor = useCallback(() => {
    setModoEdicion(false);
    setPlantillaParaEditar(null);
  }, []);

  const guardarPlantillaEditada = useCallback(async (plantillaData) => {
    try {
      const url = plantillaData.id 
        ? `${API_URL_PLANTILLAS}/${plantillaData.id}` 
        : API_URL_PLANTILLAS;
      const method = plantillaData.id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(plantillaData),
      });

      if (!res.ok) throw new Error("Error al guardar");

      await cargarPlantillas();
      setMensajePlantillas("✅ Plantilla guardada correctamente");
      setMensaje("Plantilla guardada correctamente");
      setModoEdicion(false);
      setPlantillaParaEditar(null);
    } catch (err) {
      console.error(err);
      setMensajePlantillas("❌ Error al guardar plantilla");
    }
  }, [cargarPlantillas, setMensaje]);

  // ========== TIPOS DE IVA ==========
  const [tiposIva, setTiposIva] = useState([]);
  const [formTipoIva, setFormTipoIva] = useState({ id: null, nombre: "", porcentajeIva: 0, porcentajeRecargo: 0 });
  const [mensajeTiposIva, setMensajeTiposIva] = useState("");

  const cargarTiposIva = useCallback(async () => {
    try {
      const res = await fetch(API_URL_TIPOS_IVA);
      const data = await res.json();
      setTiposIva(Array.isArray(data) ? data : data.content || []);
    } catch (err) {
      console.error(err);
      setMensajeTiposIva("Error al cargar tipos de IVA");
    }
  }, []);

  const limpiarFormTipoIva = useCallback(() => {
    setFormTipoIva({ id: null, nombre: "", porcentajeIva: 0, porcentajeRecargo: 0 });
  }, []);

  const editarTipoIva = useCallback((tipo) => {
    setFormTipoIva({
      id: tipo.id,
      nombre: tipo.nombre || "",
      porcentajeIva: tipo.porcentajeIva || 0,
      porcentajeRecargo: tipo.porcentajeRecargo || 0,
    });
  }, []);

  const guardarTipoIva = useCallback(async () => {
    try {
      const url = formTipoIva.id ? `${API_URL_TIPOS_IVA}/${formTipoIva.id}` : API_URL_TIPOS_IVA;
      const method = formTipoIva.id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: formTipoIva.nombre,
          porcentajeIva: parseFloat(formTipoIva.porcentajeIva) || 0,
          porcentajeRecargo: parseFloat(formTipoIva.porcentajeRecargo) || 0,
        }),
      });

      if (!res.ok) throw new Error("Error al guardar");

      await cargarTiposIva();
      limpiarFormTipoIva();
      setMensajeTiposIva("✅ Tipo de IVA guardado");
      setMensaje("Tipo de IVA guardado correctamente");
      setTimeout(() => setMensajeTiposIva(""), 3000);
    } catch (err) {
      console.error(err);
      setMensajeTiposIva("❌ Error al guardar tipo de IVA");
    }
  }, [formTipoIva, cargarTiposIva, limpiarFormTipoIva, setMensaje]);

  const eliminarTipoIva = useCallback(async (id) => {
    if (!window.confirm("¿Eliminar este tipo de IVA?")) return;
    try {
      const res = await fetch(`${API_URL_TIPOS_IVA}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar");
      await cargarTiposIva();
      setMensajeTiposIva("✅ Tipo de IVA eliminado");
      setMensaje("Tipo de IVA eliminado");
      setTimeout(() => setMensajeTiposIva(""), 3000);
    } catch (err) {
      console.error(err);
      setMensajeTiposIva("❌ Error al eliminar tipo de IVA");
    }
  }, [cargarTiposIva, setMensaje]);

  const updateFormTipoIvaField = useCallback((campo, valor) => {
    setFormTipoIva((prev) => ({ ...prev, [campo]: valor }));
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    cargarConfiguracionVentas();
    cargarPlantillas();
    cargarTiposIva();
  }, [cargarConfiguracionVentas, cargarPlantillas, cargarTiposIva]);

  return {
    // Ventas
    contabilizarAlbaran,
    setContabilizarAlbaran,
    documentoDescuentaStock,
    setDocumentoDescuentaStock,
    permitirVentaMultialmacen,
    setPermitirVentaMultialmacen,
    permitirVentaSinStock,
    setPermitirVentaSinStock,
    permitirMultitarifa,
    setPermitirMultitarifa,
    estadosAlbaran,
    agregarEstadoAlbaran,
    actualizarEstadoAlbaran,
    eliminarEstadoAlbaran,
    restaurarEstadosAlbaran,
    guardarConfiguracionVentas,
    mensajeVentas,
    cargandoVentas,

    // Apariencia
    temas,
    temasModoActual,
    temaActivo,
    aplicarTema,
    mensajeApariencia,
    cargandoApariencia,
    modoVisual,
    alternarModoVisual,
    cambiandoModo,
    actualizarModoVisual,

    // Plantillas
    plantillas,
    plantillaActual,
    cargarPlantilla,
    activarPlantilla,
    eliminarPlantilla,
    nuevaPlantilla,
    editarPlantilla,
    plantillaParaEditar,
    modoEdicion,
    cerrarEditor,
    guardarPlantillaEditada,
    mensajePlantillas,

    // Tipos de IVA
    tiposIva,
    formTipoIva,
    limpiarFormTipoIva,
    editarTipoIva,
    guardarTipoIva,
    eliminarTipoIva,
    updateFormTipoIvaField,
    mensajeTiposIva,
  };
}
