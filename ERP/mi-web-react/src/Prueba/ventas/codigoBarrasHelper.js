import API_ENDPOINTS from '../../config/api';

/**
 * Helper para parsear y validar códigos de barras
 */

/**
 * Determina si un código es EAN13, EAN8 o CODE128 estándar
 */
export function detectarTipoCodigo(codigo) {
  if (!codigo || typeof codigo !== 'string') {
    return null;
  }

  const codigoLimpio = codigo.trim();
  
  // EAN13: 13 dígitos numéricos
  if (/^\d{13}$/.test(codigoLimpio)) {
    return 'EAN13';
  }
  
  // EAN8: 8 dígitos numéricos
  if (/^\d{8}$/.test(codigoLimpio)) {
    return 'EAN8';
  }
  
  // CODE128: alfanumérico, longitud variable (1-48 caracteres)
  if (codigoLimpio.length >= 1 && codigoLimpio.length <= 48) {
    return 'CODE128';
  }
  
  return null;
}

/**
 * Valida el dígito de control de códigos EAN
 */
export function validarDigitoControlEAN(codigo) {
  if (!codigo || !/^\d+$/.test(codigo)) {
    return false;
  }

  const codigoSinDigito = codigo.substring(0, codigo.length - 1);
  const digitoControl = parseInt(codigo.charAt(codigo.length - 1));
  
  let suma = 0;
  for (let i = 0; i < codigoSinDigito.length; i++) {
    const digito = parseInt(codigoSinDigito.charAt(i));
    // Alternar multiplicador: impar=1, par=3 (contando desde la derecha)
    const multiplicador = (codigoSinDigito.length - i) % 2 === 0 ? 3 : 1;
    suma += digito * multiplicador;
  }
  
  const modulo = suma % 10;
  const digitoCalculado = modulo === 0 ? 0 : 10 - modulo;
  
  return digitoControl === digitoCalculado;
}

/**
 * Valida un código según su tipo
 */
export function validarCodigo(codigo, tipo) {
  if (!codigo || !tipo) {
    return false;
  }

  switch (tipo) {
    case 'EAN13':
      return /^\d{13}$/.test(codigo) && validarDigitoControlEAN(codigo);
    case 'EAN8':
      return /^\d{8}$/.test(codigo) && validarDigitoControlEAN(codigo);
    case 'CODE128':
      return codigo.length >= 1 && codigo.length <= 48;
    default:
      return true; // Para códigos personalizados de balanza
  }
}

/**
 * Determina si un código debe sumar cantidad en la misma línea
 * o crear una nueva línea
 */
export function debeAcumularCantidad(tipoCodigo) {
  // Solo EAN13, EAN8 y CODE128 acumulan cantidad
  return ['EAN13', 'EAN8', 'CODE128'].includes(tipoCodigo);
}

/**
 * Parsea un código de barras de balanza con formato personalizado
 * Retorna: { codigoProducto, peso, prefijo, etc. } o null si no es formato balanza
 */
export function parsearCodigoBalanza(codigo, formatoBalanza) {
  if (!formatoBalanza || !formatoBalanza.campos || formatoBalanza.campos.length === 0) {
    return null;
  }

  // Verificar que el código tenga la longitud correcta
  const longitudEsperada = formatoBalanza.longitudFija;
  if (longitudEsperada && codigo.length !== longitudEsperada) {
    return null;
  }

  const resultado = {};
  let posicion = 0;

  // Parsear cada campo según su configuración
  for (const campo of formatoBalanza.campos) {
    const valor = codigo.substring(posicion, posicion + campo.longitud);
    
    if (campo.nombre === 'peso' || campo.nombre === 'precio') {
      // Convertir a número con decimales
      const numeroEntero = parseInt(valor);
      if (isNaN(numeroEntero)) {
        return null;
      }
      resultado[campo.nombre] = numeroEntero / Math.pow(10, campo.decimales);
    } else if (campo.nombre === 'producto') {
      // Código del producto (sin convertir a número para mantener ceros a la izquierda)
      resultado.codigoProducto = valor;
    } else {
      // Otros campos (prefijo, lote, etc.)
      resultado[campo.nombre] = valor;
    }
    
    posicion += campo.longitud;
  }

  return resultado;
}

/**
 * Busca un producto por código de barras
 */
export async function buscarProductoPorCodigo(codigo, axios) {
  try {
    const response = await axios.get(
      `${API_ENDPOINTS.productos}/buscar-por-codigo/${encodeURIComponent(codigo)}`
    );
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

/**
 * Extrae el peso de un código de balanza usando el patrón y los campos configurados
 */
function extraerPesoDeCodigoBalanza(codigo, codigoBarra, tiposCodigos) {
  // Si el código tiene patrón, usar los campos del tipo para extraer el peso
  if (!codigoBarra.patron) {
    return 1; // Sin patrón, cantidad por defecto
  }

  // Buscar el tipo de código en la configuración
  const tipoFormato = tiposCodigos.find(t => t.tipo === codigoBarra.codigoBarraTipo);
  if (!tipoFormato || !tipoFormato.campos || tipoFormato.campos.length === 0) {
    return 1;
  }

  // Parsear el código usando la configuración de campos
  const datosBalanza = parsearCodigoBalanza(codigo, tipoFormato);
  if (datosBalanza && datosBalanza.peso) {
    return datosBalanza.peso;
  }

  return 1;
}

/**
 * Normaliza códigos de 12 dígitos a 13 dígitos (EAN13) agregando un 0 al inicio
 */
function normalizarCodigoEAN(codigo) {
  // Si el código tiene 12 dígitos, agregar un 0 al inicio para convertirlo a EAN13
  if (codigo.length === 12 && /^\d+$/.test(codigo)) {
    return '0' + codigo;
  }
  return codigo;
}

/**
 * Procesa un código de barras escaneado y retorna la información del producto
 * y datos adicionales (cantidad, peso, etc.)
 */
export async function procesarCodigoEscaneado(codigo, axios, tiposCodigos = []) {
  if (!codigo || !codigo.trim()) {
    return { error: 'Código vacío' };
  }

  let codigoLimpio = codigo.trim();
  
  // Normalizar códigos de 12 dígitos a 13 dígitos
  codigoLimpio = normalizarCodigoEAN(codigoLimpio);
  
  const tipoCodigo = detectarTipoCodigo(codigoLimpio);

  // Helper para buscar productos por código de barras (directo o por patrón)
  try {
    const resultado = await buscarProductoPorCodigo(codigoLimpio, axios);
    
    if (resultado) {
      const { producto, codigoBarra } = resultado;
      
      // Si el código tiene patrón, es un código de balanza
      const esBalanza = codigoBarra.patron != null;
      const cantidad = esBalanza 
        ? extraerPesoDeCodigoBalanza(codigoLimpio, codigoBarra, tiposCodigos)
        : 1;
      
      return {
        success: true,
        producto,
        codigoBarra,
        tipoCodigo: codigoBarra.codigoBarraTipo || tipoCodigo,
        cantidad,
        debeAcumular: !esBalanza && debeAcumularCantidad(codigoBarra.codigoBarraTipo || tipoCodigo),
        esBalanza
      };
    }
    
    return {
      success: false,
      error: 'Código de barras no encontrado'
    };
    
  } catch (error) {
    console.error('Error al procesar código:', error);
    return {
      success: false,
      error: 'Error al buscar el código de barras'
    };
  }
}
