const DNI_LETTERS = "TRWAGMYFPDXBNJZSQVHLCKE";
const CONTROL_LETTERS = "JABCDEFGHI";
const CIF_PREFIXES_FORCE_DIGIT = new Set(["A", "B", "E", "H"]);
const CIF_PREFIXES_FORCE_LETTER = new Set(["P", "Q", "S", "K", "W"]);

export const normalizarDocumentoFiscal = (valor = "") => valor.toUpperCase().replace(/[^A-Z0-9]/g, "");

const esDniValido = (valor) => {
  if (!/^\d{8}[A-Z]$/.test(valor)) return false;
  const numero = parseInt(valor.slice(0, 8), 10);
  const letraEsperada = DNI_LETTERS[numero % 23];
  return valor[8] === letraEsperada;
};

const esNieValido = (valor) => {
  if (!/^[XYZ]\d{7}[A-Z]$/.test(valor)) return false;
  const prefijo = { X: "0", Y: "1", Z: "2" }[valor[0]];
  const convertido = `${prefijo}${valor.slice(1)}`;
  return esDniValido(convertido);
};

const esCifValido = (valor) => {
  if (!/^[ABCDEFGHJKLMNPQRSUVW]\d{7}[0-9A-J]$/.test(valor)) return false;

  const cuerpo = valor.slice(1, 8);
  const control = valor[8];

  let sumaImpares = 0;
  let sumaPares = 0;

  for (let i = 0; i < cuerpo.length; i++) {
    const digito = parseInt(cuerpo[i], 10);
    if ((i + 1) % 2 === 0) {
      sumaPares += digito;
    } else {
      const doble = digito * 2;
      sumaImpares += Math.floor(doble / 10) + (doble % 10);
    }
  }

  const total = sumaImpares + sumaPares;
  const controlDigit = (10 - (total % 10)) % 10;
  const controlLetter = CONTROL_LETTERS[controlDigit];
  const controlDigitStr = controlDigit.toString();
  const prefijo = valor[0];

  if (CIF_PREFIXES_FORCE_DIGIT.has(prefijo)) {
    return control === controlDigitStr;
  }
  if (CIF_PREFIXES_FORCE_LETTER.has(prefijo)) {
    return control === controlLetter;
  }
  return control === controlDigitStr || control === controlLetter;
};

export const validarDocumentoFiscal = (valor) => {
  const limpio = normalizarDocumentoFiscal(valor);
  if (!limpio) {
    return { esValido: true, tipo: null, valorNormalizado: "" };
  }
  if (esDniValido(limpio)) {
    return { esValido: true, tipo: "DNI", valorNormalizado: limpio };
  }
  if (esNieValido(limpio)) {
    return { esValido: true, tipo: "NIE", valorNormalizado: limpio };
  }
  if (esCifValido(limpio)) {
    return { esValido: true, tipo: "CIF", valorNormalizado: limpio };
  }
  return { esValido: false, tipo: null, valorNormalizado: limpio };
};
