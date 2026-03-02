import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { API_URL_COLORES, API_URL_EMPRESA } from "./ConfiguracionComponents";

const THEME_STORAGE_KEY = "erp-tema-activo";
const MODE_STORAGE_KEY = "erp-tema-modo";
const DEFAULT_MODE = "claro";

const pickColor = (...values) => {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return null;
};

const normalizarModoVisual = (valor) => {
  if (!valor || typeof valor !== "string") return DEFAULT_MODE;
  const normalized = valor.trim().toLowerCase();
  return normalized === "oscuro" ? "oscuro" : "claro";
};

const obtenerModoTema = (tema) =>
  normalizarModoVisual(
    tema?.modoVisual ??
      tema?.modo_visual ??
      tema?.modo ??
      tema?.modoTema ??
      tema?.modo_variacion ??
      tema?.variant ??
      tema?.tipo ??
      DEFAULT_MODE
  );

const hexToRgb = (hex) => {
  if (typeof hex !== "string") return null;
  let value = hex.trim();
  if (!value.startsWith("#")) return null;
  value = value.slice(1);
  if (![3, 6].includes(value.length)) return null;
  if (value.length === 3) {
    value = value.split("").map((c) => `${c}${c}`).join("");
  }
  const intVal = parseInt(value, 16);
  if (Number.isNaN(intVal)) return null;
  return {
    r: (intVal >> 16) & 255,
    g: (intVal >> 8) & 255,
    b: intVal & 255,
  };
};

const rgbToHex = ({ r, g, b }) => {
  const toHex = (val) => {
    const hex = Math.max(0, Math.min(255, Math.round(val))).toString(16);
    return hex.length === 1 ? `0${hex}` : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const mixColors = (colorA, colorB, amount) => {
  const weight = Math.max(0, Math.min(1, amount));
  const rgbA = hexToRgb(colorA);
  const rgbB = hexToRgb(colorB);
  if (!rgbA || !rgbB) {
    return weight >= 0.5 ? colorB : colorA;
  }
  const mix = {
    r: rgbA.r * (1 - weight) + rgbB.r * weight,
    g: rgbA.g * (1 - weight) + rgbB.g * weight,
    b: rgbA.b * (1 - weight) + rgbB.b * weight,
  };
  return rgbToHex(mix);
};

const tintColor = (color, amount) => mixColors(color, "#ffffff", amount);
const shadeColor = (color, amount) => mixColors(color, "#000000", amount);

const mapTemaToCssVars = (tema, modo = DEFAULT_MODE) => {
  const sidebar = pickColor(tema?.sidebarFondo, tema?.navigationFondo, tema?.colorPrimario, "#1e293b");
  const mainBg = pickColor(tema?.backgroundGeneral, sidebar, tema?.colorSecundario, "#f1f5f9");
  const content = pickColor(tema?.colorFondo, tema?.panelCabeceraFondo, "#edf2f7");
  const section = pickColor(tema?.panelCabeceraFondo, tema?.colorFondo, "#fafbfc");
  const accent = pickColor(tema?.botonFondo, tema?.colorPrimario, tema?.accentColor, "#2563eb");
  const textPrimary = pickColor(tema?.colorTexto, tema?.textoPrincipal, "#0f172a");
  const textSecondary = pickColor(tema?.colorTextoSecundario, "#475569");
  const textMuted = pickColor(tema?.colorTextoMuted, "#94a3b8");
  const textInverse = pickColor(tema?.colorTextoInverso, "#f8fafc");
  const border = pickColor(tema?.colorBorde, "#e2e8f0");
  const borderDark = pickColor(tema?.colorBordeOscuro, border, "#cbd5e1");
  const formSurface = pickColor(
    tema?.formSurface,
    tema?.panelCabeceraFondo,
    "rgba(255, 255, 255, 0.9)"
  );
  const inputBg = pickColor(tema?.inputSurface, "#ffffff");
  const inputBorder = pickColor(tema?.inputBorder, border, "rgba(15, 23, 42, 0.08)");

  const baseVars = {
    "--erp-bg-main": mainBg,
    "--erp-bg-sidebar": sidebar,
    "--erp-bg-content": content,
    "--erp-bg-section": section,
    "--erp-form-surface": formSurface,
    "--erp-input-bg": inputBg,
    "--erp-input-border": inputBorder,
    "--erp-border": border,
    "--erp-border-dark": borderDark,
    "--erp-text-primary": textPrimary,
    "--erp-text-secondary": textSecondary,
    "--erp-text-muted": textMuted,
    "--erp-text-inverse": textInverse,
    "--erp-accent": accent,
    "--erp-accent-hover": tintColor(accent, 0.18),
    "--erp-success": pickColor(tema?.colorExito, "#059669"),
    "--erp-danger": pickColor(tema?.colorPeligro, "#dc2626"),
    "--erp-warning": pickColor(tema?.colorAdvertencia, "#d97706"),
  };

  if (modo === "oscuro") {
    const baseInverse = baseVars["--erp-text-inverse"] || "#f8fafc";
    return {
      ...baseVars,
      "--erp-bg-main": shadeColor(baseVars["--erp-bg-main"] || "#0f172a", 0.7) || "#050810",
      "--erp-bg-sidebar": shadeColor(baseVars["--erp-bg-sidebar"] || "#111827", 0.45) || "#0f172a",
      "--erp-bg-content": shadeColor(baseVars["--erp-bg-content"] || "#1f2937", 0.55) || "#111827",
      "--erp-bg-section": shadeColor(baseVars["--erp-bg-section"] || "#1f2937", 0.45) || "#182133",
      "--erp-form-surface": shadeColor(baseVars["--erp-form-surface"] || "#1f2937", 0.4) || "#1f2435",
      "--erp-input-bg": shadeColor(baseVars["--erp-input-bg"] || "#1f2937", 0.3) || "#1f2430",
      "--erp-input-border": "rgba(148, 163, 184, 0.35)",
      "--erp-border": "rgba(148, 163, 184, 0.25)",
      "--erp-border-dark": "rgba(148, 163, 184, 0.45)",
      "--erp-text-primary": tintColor(baseInverse, 0.05) || "#e2e8f0",
      "--erp-text-secondary": tintColor(baseVars["--erp-text-secondary"] || "#cbd5f5", 0.2) || "#cbd5f5",
      "--erp-text-muted": tintColor(baseVars["--erp-text-muted"] || "#94a3b8", 0.15) || "#a5b4cb",
      "--erp-text-inverse": baseInverse,
      "--erp-accent": tintColor(baseVars["--erp-accent"] || "#38bdf8", 0.2) || "#60a5fa",
      "--erp-accent-hover": tintColor(baseVars["--erp-accent"] || "#38bdf8", 0.34) || "#93c5fd",
    };
  }

  return baseVars;
};

export function useAparienciaConfig({ setMensaje }) {
  const [temas, setTemas] = useState([]);
  const [temaActivo, setTemaActivo] = useState(null);
  const [modoVisual, setModoVisual] = useState(DEFAULT_MODE);
  const [cargandoApariencia, setCargandoApariencia] = useState(false);
  const [cambiandoModo, setCambiandoModo] = useState(false);
  const [mensajeApariencia, setMensajeApariencia] = useState("");
  const animationTimeoutRef = useRef(null);

  const triggerThemeAnimation = useCallback(() => {
    if (typeof document === "undefined") return;
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }
    document.body.classList.add("erp-theme-animating");
    animationTimeoutRef.current = setTimeout(() => {
      document.body.classList.remove("erp-theme-animating");
      animationTimeoutRef.current = null;
    }, 600);
  }, []);

  const applyThemeToDocument = useCallback((tema, modo = DEFAULT_MODE) => {
    if (!tema || typeof document === "undefined") return;
    const root = document.documentElement;
    const cssVars = mapTemaToCssVars(tema, modo);
    triggerThemeAnimation();
    root.setAttribute("data-erp-theme-mode", modo);
    Object.entries(cssVars).forEach(([variable, value]) => {
      if (value) {
        root.style.setProperty(variable, value);
      }
    });
    if (typeof window !== "undefined") {
      if (tema.id !== undefined && tema.id !== null) {
        window.localStorage?.setItem(THEME_STORAGE_KEY, tema.id.toString());
      }
      window.localStorage?.setItem(MODE_STORAGE_KEY, modo);
    }
  }, [triggerThemeAnimation]);

  const getTemaById = useCallback(
    (id) => {
      if (id === null || id === undefined) return null;
      return temas.find((tema) => tema.id?.toString() === id.toString()) || null;
    },
    [temas]
  );

  const getDefaultTemaForModo = useCallback(
    (modo) => {
      const normalized = normalizarModoVisual(modo);
      return temas.find((tema) => obtenerModoTema(tema) === normalized) || null;
    },
    [temas]
  );

  const cargarTemas = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL_COLORES}/todos`);
      const data = await res.json();
      setTemas(data);
    } catch (err) {
      console.error(err);
      setMensajeApariencia("Error al cargar temas de colores");
    }
  }, []);

  const cargarTemaActivo = useCallback(async () => {
    try {
      const res = await fetch(API_URL_EMPRESA);
      const empresa = await res.json();
      if (empresa && empresa.empresaColoresId) {
        setTemaActivo(empresa.empresaColoresId);
      }
      if (empresa?.modoVisual) {
        setModoVisual(empresa.modoVisual);
        if (typeof window !== "undefined") {
          window.localStorage?.setItem(MODE_STORAGE_KEY, empresa.modoVisual);
        }
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const actualizarEmpresa = useCallback(async (updater) => {
    const resEmpresa = await fetch(API_URL_EMPRESA);
    const empresa = await resEmpresa.json();

    if (!empresa || !empresa.id) {
      throw new Error("No se encontró información de la empresa");
    }

    const payload = typeof updater === "function" ? updater(empresa) : { ...empresa, ...updater };
    const resActualizar = await fetch(`${API_URL_EMPRESA}/${empresa.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!resActualizar.ok) {
      throw new Error("Error al actualizar el tema");
    }

    return payload;
  }, []);

  const aplicarTema = useCallback(
    async (temaId) => {
      setCargandoApariencia(true);
      setMensajeApariencia("");

      try {
        await actualizarEmpresa((empresa) => ({
          ...empresa,
          empresaColoresId: temaId,
          modoVisual: normalizarModoVisual(modoVisual || empresa.modoVisual || DEFAULT_MODE),
        }));
        setTemaActivo(temaId);
        const temaSeleccionado = getTemaById(temaId);
        if (temaSeleccionado) {
          applyThemeToDocument(temaSeleccionado, modoVisual);
        }
        const mensajeExito = "✅ Tema aplicado correctamente.";
        setMensajeApariencia(mensajeExito);
        setMensaje("Tema aplicado correctamente.");
      } catch (err) {
        console.error(err);
        setMensajeApariencia(`❌ ${err.message || "Error al aplicar el tema"}`);
      } finally {
        setCargandoApariencia(false);
      }
    },
    [getTemaById, applyThemeToDocument, setMensaje, actualizarEmpresa, modoVisual]
  );

  const actualizarModoVisual = useCallback(
    async (nuevoModo) => {
      setCambiandoModo(true);
      setMensajeApariencia("");
      try {
        const normalizedModo = normalizarModoVisual(nuevoModo);
        const defaultTema = getDefaultTemaForModo(normalizedModo) || getTemaById(temaActivo) || temas[0];
        const nuevoTemaId = defaultTema?.id ?? null;

        const empresaActualizada = await actualizarEmpresa((empresa) => ({
          ...empresa,
          modoVisual: normalizedModo,
          empresaColoresId: nuevoTemaId || empresa.empresaColoresId || temaActivo,
        }));

        const temaSeleccionado =
          getTemaById(empresaActualizada.empresaColoresId) ||
          defaultTema ||
          temas.find((t) => obtenerModoTema(t) === normalizedModo);

        setModoVisual(normalizedModo);
        if (temaSeleccionado) {
          setTemaActivo(temaSeleccionado.id);
          applyThemeToDocument(temaSeleccionado, normalizedModo);
        }
        setMensajeApariencia(
          `✅ Modo ${normalizedModo === "oscuro" ? "oscuro" : "claro"} aplicado correctamente.`
        );
        setMensaje(`Modo ${normalizedModo === "oscuro" ? "oscuro" : "claro"} aplicado correctamente.`);
      } catch (err) {
        console.error(err);
        setMensajeApariencia(`❌ ${err.message || "Error al cambiar el modo visual"}`);
      } finally {
        setCambiandoModo(false);
      }
    },
    [actualizarEmpresa, applyThemeToDocument, getDefaultTemaForModo, getTemaById, setMensaje, temaActivo, temas]
  );

  const alternarModoVisual = useCallback(() => {
    const nuevoModo = modoVisual === "oscuro" ? "claro" : "oscuro";
    return actualizarModoVisual(nuevoModo);
  }, [modoVisual, actualizarModoVisual]);

  useEffect(() => {
    cargarTemas();
    cargarTemaActivo();
  }, [cargarTemas, cargarTemaActivo]);

  useEffect(() => {
    if (!temas.length) return;

    const normalizedModo = normalizarModoVisual(modoVisual);
    let temaSeleccionado = getTemaById(temaActivo);
    let modo = normalizedModo;

    if (!temaSeleccionado && typeof window !== "undefined") {
      const storedId = window.localStorage?.getItem(THEME_STORAGE_KEY);
      if (storedId) {
        temaSeleccionado = getTemaById(storedId);
        if (temaSeleccionado && !temaActivo) {
          setTemaActivo(temaSeleccionado.id);
        }
      }
    }

    if (!modo && typeof window !== "undefined") {
      const storedMode = window.localStorage?.getItem(MODE_STORAGE_KEY);
      if (storedMode) {
        setModoVisual(storedMode);
        modo = storedMode;
      }
    }

    if (temaSeleccionado && obtenerModoTema(temaSeleccionado) === normalizedModo) {
      applyThemeToDocument(temaSeleccionado, modo || DEFAULT_MODE);
    } else {
      const fallback = getDefaultTemaForModo(normalizedModo);
      if (fallback) {
        setTemaActivo(fallback.id);
        applyThemeToDocument(fallback, normalizedModo);
      }
    }
  }, [temas, temaActivo, getTemaById, applyThemeToDocument, modoVisual, getDefaultTemaForModo]);

  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  const temasModoActual = useMemo(
    () => temas.filter((tema) => obtenerModoTema(tema) === normalizarModoVisual(modoVisual)),
    [temas, modoVisual]
  );

  return {
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
  };
}
