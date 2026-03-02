const HEX_COLOR_REGEX = /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
const RGBA_REGEX = /^rgba?\(([^)]+)\)$/i;

export const ESTADOS_DOCUMENTO_PREDETERMINADOS = [
  { nombre: "Pendiente", colorClaro: "#FDE68A55", colorOscuro: "#92400E55" },
  { nombre: "Emitido", colorClaro: "#BBF7D055", colorOscuro: "#14532D55" },
  { nombre: "Entregado", colorClaro: "#C7D2FE55", colorOscuro: "#312E8155" },
  { nombre: "Facturado", colorClaro: "#FBCFE855", colorOscuro: "#701A7555" },
  { nombre: "Cancelado", colorClaro: "#FECACA55", colorOscuro: "#7F1D1D55" },
  { nombre: "En reparto", colorClaro: "#BAE6FD55", colorOscuro: "#0C4A6E55" },
  { nombre: "Preparado", colorClaro: "#FDE68A44", colorOscuro: "#78350F55" },
  { nombre: "Devuelto", colorClaro: "#F5D0FE55", colorOscuro: "#86198F55" },
  { nombre: "En revisión", colorClaro: "#DDD6FE55", colorOscuro: "#4C1D9555" },
  { nombre: "Pendiente de pago", colorClaro: "#FEF3C755", colorOscuro: "#713F1255" },
];

const PRESET_LENGTH = ESTADOS_DOCUMENTO_PREDETERMINADOS.length;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const ensureHashHex = (value) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (HEX_COLOR_REGEX.test(trimmed)) {
    return trimmed.length === 7 ? `${trimmed}FF` : trimmed.toUpperCase();
  }
  if (RGBA_REGEX.test(trimmed)) {
    try {
      const rgba = trimmed
        .replace(/rgba?\(/i, "")
        .replace(")", "")
        .split(",")
        .map((p) => p.trim());
      const [r, g, b, a = "1"] = rgba;
      const toByte = (val) => clamp(parseInt(val, 10), 0, 255);
      const red = toByte(r);
      const green = toByte(g);
      const blue = toByte(b);
      const alpha = clamp(parseFloat(a), 0, 1);
      const toHex = (val) => val.toString(16).padStart(2, "0");
      return `#${toHex(red)}${toHex(green)}${toHex(blue)}${toHex(Math.round(alpha * 255))}`.toUpperCase();
    } catch (err) {
      return null;
    }
  }
  return null;
};

export const ensureColorValue = (valor, fallback) => ensureHashHex(valor) || fallback;

export const normalizarEstadoDocumento = (estado, indice = 0) => {
  const preset = ESTADOS_DOCUMENTO_PREDETERMINADOS[indice % PRESET_LENGTH];
  const nombreNormalizado = (estado?.nombre || preset.nombre).toString().trim();
  return {
    nombre: nombreNormalizado || preset.nombre,
    colorClaro: ensureColorValue(estado?.colorClaro, preset.colorClaro),
    colorOscuro: ensureColorValue(estado?.colorOscuro, preset.colorOscuro),
  };
};

export const normalizarListaEstados = (lista) => {
  if (!Array.isArray(lista) || lista.length === 0) return [...ESTADOS_DOCUMENTO_PREDETERMINADOS];
  const utilizados = new Set();
  const resultado = [];

  lista.forEach((estado, index) => {
    const normalizado = normalizarEstadoDocumento(estado, index);
    const clave = normalizado.nombre.toLowerCase();
    if (utilizados.has(clave)) return;
    utilizados.add(clave);
    resultado.push(normalizado);
  });

  return resultado.length ? resultado : [...ESTADOS_DOCUMENTO_PREDETERMINADOS];
};

export const extraerBaseYAlpha = (color) => {
  const valid = ensureHashHex(color);
  if (!valid) return { base: "#FFFFFF", alpha: 100 };
  const base = valid.slice(0, 7);
  const alphaHex = valid.slice(7, 9) || "FF";
  const alpha = Math.round((parseInt(alphaHex, 16) / 255) * 100);
  return { base, alpha };
};

export const componerColorConAlpha = (base, alphaPercent) => {
  if (!HEX_COLOR_REGEX.test(base)) {
    return ensureHashHex(base) || "#FFFFFFFF";
  }
  const hexBase = base.length === 7 ? base.toUpperCase() : base.slice(0, 7).toUpperCase();
  const alpha = clamp(alphaPercent, 0, 100);
  const alphaHex = Math.round((alpha / 100) * 255).toString(16).padStart(2, "0").toUpperCase();
  return `${hexBase}${alphaHex}`;
};

export const obtenerSiguienteEstadoPreset = (indice) =>
  ESTADOS_DOCUMENTO_PREDETERMINADOS[indice % PRESET_LENGTH];
