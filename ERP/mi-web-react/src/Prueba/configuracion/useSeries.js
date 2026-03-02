import { useState, useCallback, useEffect } from "react";

const SERIES_API_URL = "http://145.223.103.219:8080/series";
const SERIES_PREF_API_URL = "http://145.223.103.219:8080/series/preferencias";
const USUARIOS_API_URL = "http://145.223.103.219:8080/usuarios";

const tiposDocumentoOptions = [
  { value: "ALBARAN_VENTA", label: "Albarán de Venta" },
  { value: "FACTURA_VENTA", label: "Factura de Venta" },
  { value: "FACTURA_PROFORMA", label: "Factura Proforma" },
  { value: "FACTURA_RECTIFICATIVA", label: "Factura Rectificativa" },
  { value: "PRESUPUESTO", label: "Presupuesto" },
  { value: "PEDIDO_VENTA", label: "Pedido de Venta" },
  { value: "PEDIDO_COMPRA", label: "Pedido de Compra" },
  { value: "ALBARAN_COMPRA", label: "Albarán de Compra" },
  { value: "FACTURA_COMPRA", label: "Factura de Compra" },
  { value: "PRESUPUESTO_COMPRA", label: "Presupuesto de Compra" },
];

const formSerieInicial = {
  id: null,
  tipoDocumento: "",
  prefijo: "",
  descripcion: "",
  longitudCorrelativo: 5,
  activo: true,
  defaultSistema: false,
  permiteSeleccionUsuario: true,
  almacenPredeterminadoId: "",
  tarifaPredeterminadaId: "",
};

export function useSeries({ setMensaje }) {
  const [series, setSeries] = useState([]);
  const [formSerie, setFormSerie] = useState(formSerieInicial);
  const [cargando, setCargando] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  const [cargandoUsuarios, setCargandoUsuarios] = useState(false);
  const [preferenciaForm, setPreferenciaForm] = useState({
    usuarioId: "",
    tipoDocumento: tiposDocumentoOptions[0]?.value || "",
    serieId: "",
    sinPreferencia: false,
  });
  const [preferenciaActual, setPreferenciaActual] = useState(null);
  const [cargandoPreferenciaUsuario, setCargandoPreferenciaUsuario] = useState(false);
  const [guardandoPreferenciaUsuario, setGuardandoPreferenciaUsuario] = useState(false);

  const cargarSeries = useCallback(async () => {
    try {
      setCargando(true);
      const res = await fetch(SERIES_API_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setSeries(Array.isArray(data) ? data : data.content || []);
    } catch (err) {
      console.error("Error cargando series:", err);
      setMensaje("Error al cargar las series");
    } finally {
      setCargando(false);
    }
  }, [setMensaje]);

  const cargarUsuarios = useCallback(async () => {
    try {
      setCargandoUsuarios(true);
      const res = await fetch(USUARIOS_API_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setUsuarios(Array.isArray(data) ? data : data.content || []);
    } catch (err) {
      console.error("Error cargando usuarios:", err);
      setMensaje("No se pudieron cargar los usuarios");
    } finally {
      setCargandoUsuarios(false);
    }
  }, [setMensaje]);

  useEffect(() => {
    cargarSeries();
    cargarUsuarios();
  }, [cargarSeries, cargarUsuarios]);

  const limpiarFormSerie = useCallback(() => {
    setFormSerie(formSerieInicial);
    setModoEdicion(false);
  }, []);

  const editarSerie = useCallback((serie) => {
    setFormSerie({
      id: serie.id,
      tipoDocumento: serie.tipoDocumento || "",
      prefijo: serie.prefijo || "",
      descripcion: serie.descripcion || "",
      longitudCorrelativo: serie.longitudCorrelativo || 5,
      activo: serie.activo !== undefined ? serie.activo : true,
      defaultSistema: serie.defaultSistema || false,
      permiteSeleccionUsuario: serie.permiteSeleccionUsuario !== undefined ? serie.permiteSeleccionUsuario : true,
      almacenPredeterminadoId: serie.almacenPredeterminado?.id?.toString() || "",
      tarifaPredeterminadaId: serie.tarifaPredeterminadaId?.toString() || "",
    });
    setModoEdicion(true);
  }, []);

  const updateFormSerieField = useCallback((campo, valor) => {
    setFormSerie((prev) => ({ ...prev, [campo]: valor }));
  }, []);

  const guardarSerie = useCallback(
    async (e) => {
      e?.preventDefault();

      if (!formSerie.tipoDocumento || !formSerie.prefijo) {
        setMensaje("Tipo de documento y prefijo son obligatorios");
        return;
      }

      try {
        setCargando(true);
        const url = formSerie.id
          ? `${SERIES_API_URL}/${formSerie.id}`
          : SERIES_API_URL;
        const metodo = formSerie.id ? "PUT" : "POST";

        const payload = {
          tipoDocumento: formSerie.tipoDocumento,
          prefijo: formSerie.prefijo.toUpperCase(),
          descripcion: formSerie.descripcion || null,
          longitudCorrelativo: parseInt(formSerie.longitudCorrelativo) || 5,
          activo: Boolean(formSerie.activo),
          defaultSistema: Boolean(formSerie.defaultSistema),
          permiteSeleccionUsuario: Boolean(formSerie.permiteSeleccionUsuario),
          almacenPredeterminadoId: formSerie.almacenPredeterminadoId ? parseInt(formSerie.almacenPredeterminadoId) : null,
          tarifaPredeterminadaId: formSerie.tarifaPredeterminadaId ? parseInt(formSerie.tarifaPredeterminadaId) : null,
        };

        const res = await fetch(url, {
          method: metodo,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText || `HTTP ${res.status}`);
        }

        setMensaje(
          formSerie.id
            ? "Serie actualizada correctamente"
            : "Serie creada correctamente"
        );
        limpiarFormSerie();
        await cargarSeries();
      } catch (err) {
        console.error("Error guardando serie:", err);
        setMensaje(err.message || "Error al guardar la serie");
      } finally {
        setCargando(false);
      }
    },
    [formSerie, setMensaje, limpiarFormSerie, cargarSeries]
  );

  const eliminarSerie = useCallback(
    async (id) => {
      if (!window.confirm("¿Estás seguro de eliminar esta serie?")) return;

      try {
        setCargando(true);
        const res = await fetch(`${SERIES_API_URL}/${id}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText || `HTTP ${res.status}`);
        }

        setMensaje("Serie eliminada correctamente");
        await cargarSeries();
      } catch (err) {
        console.error("Error eliminando serie:", err);
        setMensaje(err.message || "Error al eliminar la serie");
      } finally {
        setCargando(false);
      }
    },
    [setMensaje, cargarSeries]
  );

  const reiniciarContador = useCallback(
    async (serieId) => {
      if (!window.confirm("¿Reiniciar el contador al último número usado +1?\n\nEsto ajustará la numeración para evitar saltos.")) return;

      try {
        setCargando(true);
        const res = await fetch(`${SERIES_API_URL}/${serieId}/reiniciar-contador`, {
          method: "POST",
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText || `HTTP ${res.status}`);
        }

        const data = await res.json();
        setMensaje(`Contador reiniciado: último usado ${data.ultimoNumeroUsado}, siguiente será ${data.siguienteNumero}`);
      } catch (err) {
        console.error("Error reiniciando contador:", err);
        setMensaje(err.message || "Error al reiniciar el contador");
      } finally {
        setCargando(false);
      }
    },
    [setMensaje]
  );

  const seriesPorTipo = useCallback(
    (tipoDocumento) => series.filter((serie) => serie.tipoDocumento === tipoDocumento),
    [series]
  );

  const cargarPreferenciaUsuarioSerie = useCallback(
    async (usuarioId, tipoDocumento) => {
      if (!usuarioId || !tipoDocumento) {
        setPreferenciaActual(null);
        setPreferenciaForm((prev) => ({ ...prev, serieId: "" }));
        return;
      }
      try {
        setCargandoPreferenciaUsuario(true);
        const params = new URLSearchParams({
          usuarioId: usuarioId.toString(),
          tipoDocumento,
        });
        const res = await fetch(`${SERIES_PREF_API_URL}?${params.toString()}`);
        if (res.status === 404) {
          setPreferenciaActual(null);
          setPreferenciaForm((prev) => ({ ...prev, serieId: "", sinPreferencia: false }));
          return;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setPreferenciaActual(data);
        if (data?.serie?.id) {
          setPreferenciaForm((prev) =>
            prev.serieId === data.serie.id.toString()
              ? { ...prev, sinPreferencia: false }
              : { ...prev, serieId: data.serie.id.toString(), sinPreferencia: false }
          );
        }
      } catch (err) {
        console.error("Error cargando preferencia de usuario:", err);
        setMensaje("No se pudo cargar la preferencia del usuario");
      } finally {
        setCargandoPreferenciaUsuario(false);
      }
    },
    [setMensaje]
  );

  useEffect(() => {
    if (preferenciaForm.usuarioId && preferenciaForm.tipoDocumento) {
      cargarPreferenciaUsuarioSerie(preferenciaForm.usuarioId, preferenciaForm.tipoDocumento);
    } else {
      setPreferenciaActual(null);
      setPreferenciaForm((prev) =>
        prev.serieId ? { ...prev, serieId: "" } : prev
      );
    }
  }, [preferenciaForm.usuarioId, preferenciaForm.tipoDocumento, cargarPreferenciaUsuarioSerie]);

  const updatePreferenciaFormField = useCallback((campo, valor) => {
    setPreferenciaForm((prev) => {
      if (campo === "sinPreferencia") {
        return {
          ...prev,
          sinPreferencia: Boolean(valor),
          serieId: valor ? "" : prev.serieId,
        };
      }
      if (campo === "serieId") {
        return {
          ...prev,
          serieId: valor,
          sinPreferencia: valor ? false : prev.sinPreferencia,
        };
      }
      if (campo === "usuarioId" || campo === "tipoDocumento") {
        return {
          ...prev,
          [campo]: valor,
          serieId: "",
          sinPreferencia: false,
        };
      }
      return {
        ...prev,
        [campo]: valor,
      };
    });
  }, []);

  const guardarPreferenciaUsuario = useCallback(async () => {
    if (!preferenciaForm.usuarioId || !preferenciaForm.tipoDocumento) {
      setMensaje("Selecciona usuario y tipo de documento");
      return;
    }
    try {
      setGuardandoPreferenciaUsuario(true);
      if (preferenciaForm.sinPreferencia) {
        const params = new URLSearchParams({
          usuarioId: preferenciaForm.usuarioId,
          tipoDocumento: preferenciaForm.tipoDocumento,
        });
        const res = await fetch(`${SERIES_PREF_API_URL}?${params.toString()}`, {
          method: "DELETE",
        });
        if (res.status !== 204 && res.status !== 404) {
          throw new Error(`HTTP ${res.status}`);
        }
        setPreferenciaActual(null);
        setPreferenciaForm((prev) => ({ ...prev, serieId: "", sinPreferencia: true }));
        setMensaje("Preferencia eliminada, se usará la predeterminada del documento");
      } else {
        if (!preferenciaForm.serieId) {
          setMensaje("Selecciona una serie para asignar la preferencia");
          return;
        }
        const payload = {
          usuarioId: parseInt(preferenciaForm.usuarioId),
          tipoDocumento: preferenciaForm.tipoDocumento,
          serieId: parseInt(preferenciaForm.serieId),
        };
        const res = await fetch(SERIES_PREF_API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setPreferenciaActual(data);
        setPreferenciaForm((prev) => ({ ...prev, sinPreferencia: false }));
        setMensaje("Preferencia del usuario guardada");
      }
    } catch (err) {
      console.error("Error guardando preferencia del usuario:", err);
      setMensaje("No se pudo actualizar la preferencia del usuario");
    } finally {
      setGuardandoPreferenciaUsuario(false);
    }
  }, [preferenciaForm, setMensaje]);

  return {
    series,
    formSerie,
    cargando,
    modoEdicion,
    tiposDocumentoOptions,
    usuarios,
    cargandoUsuarios,
    preferenciaForm,
    preferenciaActual,
    cargarPreferenciaUsuarioSerie,
    cargandoPreferenciaUsuario,
    guardandoPreferenciaUsuario,
    updatePreferenciaFormField,
    guardarPreferenciaUsuario,
    seriesPorTipo,
    cargarSeries,
    limpiarFormSerie,
    editarSerie,
    updateFormSerieField,
    guardarSerie,
    eliminarSerie,
    reiniciarContador,
  };
}
