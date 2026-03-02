import { useState, useMemo, useCallback, useEffect } from "react";

const PRODUCTOS_API = "http://145.223.103.219:8080/productos";
const FAMILIAS_API = "http://145.223.103.219:8080/familias";
const SUBFAMILIAS_API = "http://145.223.103.219:8080/subfamilias";
const CLIENTES_API = "http://145.223.103.219:8080/clientes";
const FACTURAS_SIMPLIFICADAS_API = "http://145.223.103.219:8080/facturas-simplificadas";
const CONFIG_TICKET_API = "http://145.223.103.219:8080/tpv/configuracion-tickets/activa";
const EMPRESA_API = "http://145.223.103.219:8080/empresa";

const FORMATOS_IMPRESORA = {
  "80mm": { ancho: 280, cabecera: 14, normal: 11, pie: 10 },
  "60mm": { ancho: 200, cabecera: 12, normal: 9, pie: 8 },
};

const CONFIG_TICKET_DEFAULT = {
  mostrarNombreEmpresa: true,
  mostrarDireccion: true,
  mostrarCodigoPostal: true,
  mostrarProvincia: true,
  mostrarTelefono: true,
  mostrarCif: true,
  mostrarLogo: true,
  mostrarNumeroFactura: true,
  mostrarFechaHora: true,
  mostrarCliente: true,
  mostrarReferenciaProducto: false,
  mostrarDescripcionProducto: true,
  mostrarCantidad: true,
  mostrarPrecioUnitario: true,
  mostrarDescuento: false,
  mostrarSubtotalLinea: true,
  mostrarPorcentajeIva: true,
  mostrarDesgloseIva: true,
  mostrarBaseImponible: true,
  mostrarCuotaIva: true,
  mostrarSubtotal: true,
  mostrarDescuentoTotal: false,
  mostrarTotal: true,
  mostrarMetodoPago: true,
  mostrarImporteEntregado: true,
  mostrarCambio: true,
  textoCabecera: "TPV DOSCAR",
  textoPie: "¡Gracias por su compra!",
  textoDespedida: "Vuelva pronto",
  textoTicket: "Ticket:",
  textoFecha: "Fecha:",
  textoCliente: "Cliente:",
  textoDescripcion: "Descripción",
  textoCantidad: "Cant.",
  textoPrecio: "Precio",
  textoImporte: "Importe",
  textoSubtotal: "Subtotal",
  textoDescuento: "Descuento",
  textoBase: "Base",
  textoIva: "IVA",
  textoTotal: "Total",
  textoMetodoPago: "Método de pago:",
  textoEntregado: "Entregado:",
  textoCambio: "Cambio:",
  formatoImpresora: "80mm",
  anchoTicket: 280,
  fuenteFamilia: "monospace",
  fuenteTamanoCabecera: 14,
  fuenteTamanoNormal: 11,
  fuenteTamanoPie: 10,
  alinearCabecera: "center",
  alinearPie: "center",
  separadorLinea: "=",
  espaciadoLineas: 4,
};

// Contador local para mantener secuencia cuando no se puede acceder a la BD
let contadorLocalTicket = 1;

const generarTicketIdSync = () => {
  // Generar un ID de ticket síncrono secuencial usando contador local
  const numero = contadorLocalTicket++;
  const id = String(numero).padStart(8, "0");
  return `TPV-${id}`;
};

const generarTicketId = async () => {
  try {
    // Obtener el último ticket de la base de datos
    const res = await fetch(FACTURAS_SIMPLIFICADAS_API);
    if (!res.ok) {
      throw new Error("Error al obtener tickets");
    }
    
    const data = await res.json();
    const tickets = Array.isArray(data) ? data : data.content || [];
    
    // Encontrar el ticket con el número más alto
    let maxNumero = 0;
    tickets.forEach(ticket => {
      if (ticket.numero) {
        // Aceptar ambos formatos: "TPV - " y "TPV-" pero estandarizar a sin espacios
        const numeroStr = ticket.numero.replace(/^TPV\s*-\s*/, '').replace(/\D/g, '');
        const numero = parseInt(numeroStr);
        if (!isNaN(numero) && numero > maxNumero) {
          maxNumero = numero;
        }
      }
    });
    
    // Generar siguiente número, asegurando que nunca sea 0
    const siguienteNumero = Math.max(maxNumero + 1, 1);
    // Sincronizar contador local con el valor de la BD
    contadorLocalTicket = siguienteNumero + 1;
    const id = String(siguienteNumero).padStart(8, "0");
    return `TPV-${id}`;
  } catch (error) {
    console.error("Error generando ID de ticket:", error);
    // Si hay error, usar el mismo método que generarTicketIdSync para mantener consistencia
    return generarTicketIdSync();
  }
};

const normalizarImporte = (valor) => {
  if (valor === null || valor === undefined) return null;
  if (typeof valor === "number" && !Number.isNaN(valor)) return valor;
  if (typeof valor === "string") {
    const limpio = valor.replace(/[^\d.,-]/g, "").replace(",", ".");
    const numero = parseFloat(limpio);
    return Number.isFinite(numero) ? numero : null;
  }
  return null;
};

const getPrecioProducto = (producto) => {
  const candidatos = [
    normalizarImporte(producto.precioConImpuestos),
    normalizarImporte(producto.pvpConImpuestos),
    normalizarImporte(producto.pvp),
    normalizarImporte(producto.precio),
    normalizarImporte(producto.precioBase),
    normalizarImporte(producto.precioVenta),
  ];
  const numero = candidatos.find((valor) => typeof valor === "number" && valor > 0);
  return typeof numero === "number" ? numero : 0;
};

const getDescripcionProducto = (producto) =>
  producto.titulo || producto.nombre || producto.descripcion || producto.referencia || "Producto";

export function useTPV({ setMensaje }) {
  const [productos, setProductos] = useState([]);
  const [familias, setFamilias] = useState([]);
  const [subfamilias, setSubfamilias] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [categoriaActiva, setCategoriaActiva] = useState("todos");
  const [subfamiliaActiva, setSubfamiliaActiva] = useState("todas");
  const [paginaFamilias, setPaginaFamilias] = useState(0);
  const [paginaSubfamilias, setPaginaSubfamilias] = useState(0);
  const [busqueda, setBusqueda] = useState("");
  const [lineas, setLineas] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [lineaActivaId, setLineaActivaId] = useState(null);
  const [tecladoModo, setTecladoModo] = useState("cantidad");
  const [tecladoValor, setTecladoValor] = useState("0");
  const [cantidadPredefinida, setCantidadPredefinida] = useState(1);
  const [mostrandoPago, setMostrandoPago] = useState(false);
  const [metodoPago, setMetodoPago] = useState("Efectivo");
  const [importeEntregado, setImporteEntregado] = useState("");
  const [ticketId, setTicketId] = useState("TPV-00000001"); // Valor inicial seguro, se actualizará con useEffect
  const [fechaTicket, setFechaTicket] = useState(new Date());
  const [historialTickets, setHistorialTickets] = useState([]);
  const [historialCargado, setHistorialCargado] = useState(false);
  const [mostrandoHistorial, setMostrandoHistorial] = useState(false);
  const [ticketsPendientes, setTicketsPendientes] = useState([]);
  const [mostrandoTicketsPendientes, setMostrandoTicketsPendientes] = useState(false);
  const [ticketActivoId, setTicketActivoId] = useState(null);
  const [configuracionTicket, setConfiguracionTicket] = useState(null);
  const [datosEmpresa, setDatosEmpresa] = useState(null);
  const [logoEmpresaBase64, setLogoEmpresaBase64] = useState(null);
  const [inicioSesion] = useState(() => new Date());

  const cargarProductos = useCallback(async () => {
    try {
      const res = await fetch(PRODUCTOS_API);
      const data = await res.json();
      setProductos(Array.isArray(data) ? data : data.content || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    const cargarConfiguracion = async () => {
      try {
        const res = await fetch(CONFIG_TICKET_API);
        if (res.ok) {
          const data = await res.json();
          setConfiguracionTicket(data);
        }
      } catch (err) {
        console.error("Error cargando config ticket", err);
      }
    };
    const cargarEmpresa = async () => {
      try {
        const res = await fetch(EMPRESA_API);
        if (res.ok) {
          const data = await res.json();
          setDatosEmpresa(data);
        }
      } catch (err) {
        console.error("Error cargando empresa", err);
      }
    };
    cargarConfiguracion();
    cargarEmpresa();
  }, []);

  useEffect(() => {
    const cargarLogo = async () => {
      if (!datosEmpresa?.logo) {
        console.log("TPV: No hay logo configurado en datos de empresa");
        setLogoEmpresaBase64(null);
        return;
      }
      console.log("TPV: Cargando logo:", datosEmpresa.logo);
      try {
        const url = `http://145.223.103.219:8080/empresa/logo/${datosEmpresa.logo}`;
        console.log("TPV: URL del logo:", url);
        const res = await fetch(url);
        if (!res.ok) {
          console.error("TPV: Error al cargar logo, status:", res.status);
          return;
        }
        const blob = await res.blob();
        console.log("TPV: Logo cargado como blob, tamaño:", blob.size, "tipo:", blob.type);
        const reader = new FileReader();
        reader.onloadend = () => {
          console.log("TPV: Logo convertido a base64, longitud:", reader.result?.length);
          setLogoEmpresaBase64(reader.result);
        };
        reader.onerror = (err) => {
          console.error("TPV: Error al leer blob como base64:", err);
        };
        reader.readAsDataURL(blob);
      } catch (err) {
        console.error("TPV: Error cargando logo empresa", err);
        setLogoEmpresaBase64(null);
      }
    };
    cargarLogo();
  }, [datosEmpresa]);

  const cargarFamilias = useCallback(async () => {
    try {
      const res = await fetch(FAMILIAS_API);
      const data = await res.json();
      const familiasList = Array.isArray(data) ? data : data.content || [];
      familiasList.sort((a, b) => a.id - b.id);
      setFamilias(familiasList);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const cargarSubfamilias = useCallback(async () => {
    try {
      const res = await fetch(SUBFAMILIAS_API);
      const data = await res.json();
      setSubfamilias(Array.isArray(data) ? data : data.content || []);
    } catch (err) {
      console.error(err);
      setSubfamilias([]);
    }
  }, []);

  const cargarClientes = useCallback(async () => {
    try {
      const res = await fetch(CLIENTES_API);
      const data = await res.json();
      setClientes(Array.isArray(data) ? data : data.content || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const cargarDatos = useCallback(async () => {
    await Promise.all([cargarProductos(), cargarFamilias(), cargarSubfamilias(), cargarClientes()]);
  }, [cargarProductos, cargarFamilias, cargarSubfamilias, cargarClientes]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Función para recargar el contador desde la base de datos
  const recargarContadorDesdeBD = useCallback(async () => {
    try {
      console.log("Recargando contador desde base de datos...");
      const nuevoTicketId = await generarTicketId();
      setTicketId(nuevoTicketId);
      console.log("Contador recargado, nuevo ticketId:", nuevoTicketId);
      setMensaje && setMensaje("Contador de tickets actualizado desde base de datos");
    } catch (error) {
      console.error("Error recargando contador:", error);
      setMensaje && setMensaje("Error al recargar contador de tickets");
    }
  }, [setMensaje]);

  // Inicializar el ID del ticket consultando la base de datos
  useEffect(() => {
    const inicializarTicketId = async () => {
      try {
        const nuevoTicketId = await generarTicketId();
        setTicketId(nuevoTicketId);
      } catch (error) {
        console.error("Error inicializando ID de ticket:", error);
        // Si hay error, usar método síncrono como fallback
        setTicketId(generarTicketIdSync());
      }
    };
    inicializarTicketId();
  }, []);

  const subfamiliasDisponibles = useMemo(() => {
    if (categoriaActiva === "todos") return [];
    return subfamilias.filter(
      (sf) => sf.familia?.id && sf.familia.id.toString() === categoriaActiva.toString()
    );
  }, [categoriaActiva, subfamilias]);

  const productosFiltrados = useMemo(() => {
    let listaProductos = [...productos].sort((a, b) => (a.id || 0) - (b.id || 0));
    const termino = busqueda.trim().toLowerCase();
    return listaProductos.filter((producto) => {
      const coincideBusqueda =
        !termino ||
        getDescripcionProducto(producto).toLowerCase().includes(termino) ||
        (producto.referencia || "").toLowerCase().includes(termino);

      if (!coincideBusqueda) return false;

      if (categoriaActiva === "todos") return true;

      const familiasProducto = producto.familias || [];
      const familiaPrincipal = producto.familia ? [producto.familia] : [];
      const todasFamilias = [...familiasProducto, ...familiaPrincipal];
      const coincideFamilia = todasFamilias.some(
        (fam) => fam && fam.id && fam.id.toString() === categoriaActiva.toString()
      );

      if (!coincideFamilia) return false;

      if (subfamiliaActiva === "todas") return true;

      const subfamiliasProductoArray = Array.isArray(producto.subfamilias) ? producto.subfamilias : [];
      const subfamiliaSingularArray = producto.subfamilia ? [producto.subfamilia] : [];
      const subfamiliasPorObjeto = [...subfamiliasProductoArray, ...subfamiliaSingularArray];

      const coincidePorObjeto = subfamiliasPorObjeto.some(
        (sub) => sub && sub.id && sub.id.toString() === subfamiliaActiva.toString()
      );
      if (coincidePorObjeto) return true;

      const idsCandidatos =
        (Array.isArray(producto.subfamiliaIds) && producto.subfamiliaIds) ||
        (Array.isArray(producto.subfamiliasIds) && producto.subfamiliasIds) ||
        (Array.isArray(producto.subFamiliaIds) && producto.subFamiliaIds) ||
        (Array.isArray(producto.subFamiliasIds) && producto.subFamiliasIds) ||
        [];

      return idsCandidatos.some(
        (id) => id !== null && id !== undefined && id.toString() === subfamiliaActiva.toString()
      );
    });
  }, [productos, categoriaActiva, subfamiliaActiva, busqueda]);

  const seleccionarCategoria = useCallback((categoriaId) => {
    setCategoriaActiva(categoriaId);
    setSubfamiliaActiva("todas");
    setPaginaSubfamilias(0);
  }, []);

  const seleccionarSubfamilia = useCallback((subfamiliaId) => {
    setSubfamiliaActiva(subfamiliaId);
  }, []);

  const avanzarPaginaFamilias = useCallback(() => {
    setPaginaFamilias(prev => prev + 1);
  }, []);

  const retrocederPaginaFamilias = useCallback(() => {
    setPaginaFamilias(prev => Math.max(0, prev - 1));
  }, []);

  const avanzarPaginaSubfamilias = useCallback(() => {
    setPaginaSubfamilias(prev => prev + 1);
  }, []);

  const retrocederPaginaSubfamilias = useCallback(() => {
    setPaginaSubfamilias(prev => Math.max(0, prev - 1));
  }, []);

  const seleccionarCliente = useCallback(
    (clienteId) => {
      if (!clienteId) {
        setClienteSeleccionado(null);
        setLineas(prev => prev.map(linea => ({ ...linea, descuento: 0 })));
        return;
      }
      const match = clientes.find((cliente) => cliente.id?.toString() === clienteId.toString());
      setClienteSeleccionado(match || null);
      
      if (match && match.agrupacion && match.agrupacion.descuentoGeneral > 0) {
        const descuento = match.agrupacion.descuentoGeneral;
        setLineas(prev => prev.map(linea => ({ ...linea, descuento })));
        setMensaje && setMensaje(`Descuento del ${descuento}% aplicado por agrupación`);
      } else {
        setLineas(prev => prev.map(linea => ({ ...linea, descuento: 0 })));
      }
    },
    [clientes, setMensaje]
  );

  const crearNuevaVenta = useCallback(async () => {
    setLineas([]);
    setLineaActivaId(null);
    setClienteSeleccionado(null);
    setCantidadPredefinida(1);
    setTecladoValor("1");
    setTecladoModo("cantidad");
    setMostrandoPago(false);
    setImporteEntregado("");
    const nuevoTicketId = await generarTicketId();
    setTicketId(nuevoTicketId);
    setFechaTicket(new Date());
  }, []);

  const crearNuevaVentaSync = useCallback(() => {
    setLineas([]);
    setLineaActivaId(null);
    setClienteSeleccionado(null);
    setCantidadPredefinida(1);
    setTecladoValor("1");
    setTecladoModo("cantidad");
    setMostrandoPago(false);
    setImporteEntregado("");
    setTicketId(generarTicketIdSync());
    setFechaTicket(new Date());
  }, []);

  const addProductoAlTicket = useCallback(
    (producto) => {
      if (!producto) return;
      const cantidad = Math.max(parseFloat(cantidadPredefinida) || 1, 0.01);
      const precio = getPrecioProducto(producto);
      const descripcion = getDescripcionProducto(producto);
      
      const descuentoCliente = clienteSeleccionado?.agrupacion?.descuentoGeneral || 0;

      setLineas((prev) => {
        const existente = prev.find((linea) => linea.productoId === producto.id);
        if (existente) {
          return prev.map((linea) =>
            linea.productoId === producto.id
              ? { ...linea, cantidad: linea.cantidad + cantidad }
              : linea
          );
        }
        const nuevaLinea = {
          id: `${producto.id}-${Date.now()}`,
          productoId: producto.id,
          descripcion,
          cantidad,
          precioUnitario: precio,
          descuento: descuentoCliente,
          imagenUrl: producto.imagenUrl || producto.imagen || null,
        };
        setLineaActivaId(nuevaLinea.id);
        return [...prev, nuevaLinea];
      });

      setCantidadPredefinida(1);
      setTecladoValor("1");
    },
    [cantidadPredefinida, clienteSeleccionado]
  );

  const ajustarCantidad = useCallback((lineaId, delta) => {
    let lineaEliminada = false;
    setLineas((prev) => {
      const actualizadas = [];
      prev.forEach((linea) => {
        if (linea.id !== lineaId) {
          actualizadas.push(linea);
          return;
        }
        const nuevaCantidad = parseFloat((linea.cantidad + delta).toFixed(2));
        if (nuevaCantidad <= 0) {
          lineaEliminada = true;
          return;
        }
        actualizadas.push({ ...linea, cantidad: nuevaCantidad });
      });
      return actualizadas;
    });
    if (lineaEliminada) {
      setLineaActivaId((prevId) => (prevId === lineaId ? null : prevId));
    }
  }, []);

  const eliminarLinea = useCallback((lineaId) => {
    setLineas((prev) => prev.filter((linea) => linea.id !== lineaId));
    setLineaActivaId((prevId) => (prevId === lineaId ? null : prevId));
  }, []);

  const limpiarTicket = useCallback(() => {
    setLineas([]);
    setLineaActivaId(null);
    setCantidadPredefinida(1);
    setTecladoValor("1");
  }, []);

  const calcularTotales = useMemo(() => {
    return lineas.reduce(
      (acc, linea) => {
        const producto = productos.find((p) => p.id === linea.productoId);
        const tipoIva = producto?.tipoIva;
        
        // Usar el porcentajeIva de la línea si existe, si no usar el del producto actual
        const porcentajeIva = linea.porcentajeIva || tipoIva?.porcentajeIva || 0;
        
        // Calcular con IVA incluido
        const precioConIva = linea.precioUnitario * (1 + porcentajeIva / 100);
        const subtotalLinea = precioConIva * linea.cantidad;
        const descuentoLinea = subtotalLinea * (linea.descuento / 100);
        
        acc.subtotal += subtotalLinea;
        acc.descuento += descuentoLinea;
        acc.totalArticulos += linea.cantidad;
        acc.total = acc.subtotal - acc.descuento;
        return acc;
      },
      { subtotal: 0, descuento: 0, total: 0, totalArticulos: 0 }
    );
  }, [lineas, productos]);

  const cambio = useMemo(() => {
    const pagado = Number.parseFloat(
      (importeEntregado ?? "")
        .toString()
        .replace(",", ".")
    ) || 0;
    return Math.max(pagado - calcularTotales.total, 0);
  }, [importeEntregado, calcularTotales.total]);

  const handlePadInput = useCallback(
    (valor) => {
      if (valor === "C") {
        setTecladoValor("0");
        return;
      }
      if (valor === "⌫") {
        setTecladoValor((prev) => (prev.length > 1 ? prev.slice(0, -1) : "0"));
        return;
      }
      if (valor === "OK") {
        return;
      }
      setTecladoValor((prev) => {
        if (prev === "0" && valor !== ".") {
          return valor;
        }
        if (valor === "." && prev.includes(".")) {
          return prev;
        }
        return `${prev}${valor}`;
      });
    },
    [tecladoModo]
  );

  const aplicarCalculadora = useCallback(() => {
    const valorNumerico = Math.max(parseFloat(tecladoValor.replace(",", ".")) || 0, 0);

    if (lineaActivaId) {
      setLineas((prev) =>
        prev.map((linea) => {
          if (linea.id !== lineaActivaId) return linea;
          if (tecladoModo === "cantidad") {
            return { ...linea, cantidad: Math.max(valorNumerico || 1, 0.01) };
          }
          return { ...linea, precioUnitario: Math.max(valorNumerico, 0) };
        })
      );
      return;
    }

    if (tecladoModo === "cantidad") {
      setCantidadPredefinida(Math.max(valorNumerico || 1, 0.01));
      setMensaje && setMensaje("Cantidad preparada para el próximo producto");
    } else {
      setMensaje && setMensaje("Selecciona una línea para editar el precio");
    }
  }, [lineaActivaId, tecladoModo, tecladoValor, setMensaje]);

  const iniciarCobro = useCallback(() => {
    if (lineas.length === 0) {
      setMensaje && setMensaje("Añade productos al ticket antes de cobrar");
      return;
    }
    setMostrandoPago(true);
    setImporteEntregado(calcularTotales.total.toFixed(2));
  }, [lineas.length, calcularTotales.total, setMensaje]);

  const cancelarCobro = useCallback(() => {
    setMostrandoPago(false);
    setImporteEntregado("");
  }, []);

  const generarLineasIva = useCallback(() => {
    const resumen = new Map();
    lineas.forEach((linea) => {
      const producto = productos.find((p) => p.id === linea.productoId);
      const tipoIva = producto?.tipoIva;
      const porcentajeIva = tipoIva?.porcentajeIva || 0;
      const baseLinea = linea.precioUnitario * linea.cantidad;
      const descuentoLinea = baseLinea * (linea.descuento / 100);
      const baseImponible = baseLinea - descuentoLinea;
      const importeIva = baseImponible * (porcentajeIva / 100);
      const key = porcentajeIva.toFixed(2);
      if (!resumen.has(key)) {
        resumen.set(key, { porcentaje: porcentajeIva, base: 0, cuota: 0 });
      }
      const actual = resumen.get(key);
      actual.base += baseImponible;
      actual.cuota += importeIva;
    });
    return Array.from(resumen.values());
  }, [lineas, productos]);

  const generarLineasIvaFromFactura = useCallback((lineasFactura) => {
    const resumen = new Map();
    lineasFactura.forEach((linea) => {
      const porcentajeIva = linea.porcentajeIva || 0;
      const baseLinea = linea.precioUnitario * linea.cantidad;
      const descuentoLinea = baseLinea * (linea.descuento / 100);
      const baseImponible = baseLinea - descuentoLinea;
      const importeIva = baseImponible * (porcentajeIva / 100);
      const key = porcentajeIva.toFixed(2);
      if (!resumen.has(key)) {
        resumen.set(key, { porcentaje: porcentajeIva, base: 0, cuota: 0 });
      }
      const actual = resumen.get(key);
      actual.base += baseImponible;
      actual.cuota += importeIva;
    });
    return Array.from(resumen.values());
  }, []);

  const generarTicketHtml = useCallback((facturaData = null) => {
    // Si se pasa facturaData, usar esos datos; si no, usar el ticket actual
    const lineasImprimir = facturaData?.lineas || lineas;
    const ticketIdImprimir = facturaData?.numero || ticketId;
    const fechaImprimir = facturaData?.fecha ? new Date(facturaData.fecha) : fechaTicket;
    const clienteImprimir = facturaData?.cliente || clienteSeleccionado;
    const totalImprimir = facturaData?.total || calcularTotales.total;
    const metodoPagoImprimir = facturaData?.metodoPago || metodoPago;
    const importeEntregadoImprimir = facturaData?.importeEntregado || importeEntregado;

    if (lineasImprimir.length === 0) {
      return null;
    }

    const config = { ...CONFIG_TICKET_DEFAULT, ...(configuracionTicket || {}) };
    
    // Aplicar formato de impresora si está definido
    const formato = FORMATOS_IMPRESORA[config.formatoImpresora] || FORMATOS_IMPRESORA["80mm"];
    config.anchoTicket = formato.ancho;
    config.fuenteTamanoCabecera = formato.cabecera;
    config.fuenteTamanoNormal = formato.normal;
    config.fuenteTamanoPie = formato.pie;
    
    const empresaLogoUrl = logoEmpresaBase64
      ? logoEmpresaBase64
      : datosEmpresa?.logo
      ? `http://145.223.103.219:8080/empresa/logo/${datosEmpresa.logo}`
      : null;
    
    console.log("TPV Ticket: mostrarLogo:", config.mostrarLogo);
    console.log("TPV Ticket: logoEmpresaBase64:", logoEmpresaBase64 ? "presente (longitud: " + logoEmpresaBase64.length + ")" : "null");
    console.log("TPV Ticket: datosEmpresa.logo:", datosEmpresa?.logo);
    console.log("TPV Ticket: empresaLogoUrl:", empresaLogoUrl ? (empresaLogoUrl.startsWith("data:") ? "base64" : empresaLogoUrl) : "null");
    const separador = config.separadorLinea.repeat(config.formatoImpresora === "60mm" ? 28 : 40);
    const pago = parseFloat(importeEntregado) || 0;
    const cambioCalculado = Math.max(pago - calcularTotales.total, 0);
    
    // Ajustar anchos de columna según formato
    const anchos = config.formatoImpresora === "60mm" 
      ? { cant: "30px", precio: "55px", importe: "55px" }
      : { cant: "35px", precio: "65px", importe: "65px" };
    
    const columnas = [];
    if (config.mostrarDescripcionProducto) columnas.push({ key: "descripcion", label: config.textoDescripcion, align: "left", width: "" });
    if (config.mostrarReferenciaProducto) columnas.push({ key: "referencia", label: "Ref.", align: "left", width: "" });
    if (config.mostrarCantidad) columnas.push({ key: "cantidad", label: config.textoCantidad, align: "center", width: `width:${anchos.cant};` });
    if (config.mostrarPrecioUnitario) columnas.push({ key: "precio", label: config.textoPrecio, align: "right", width: `width:${anchos.precio};` });
    if (config.mostrarSubtotalLinea) columnas.push({ key: "importe", label: config.textoImporte, align: "right", width: `width:${anchos.importe};` });

    const lineasTabla = lineasImprimir
      .map((linea) => {
        const producto = productos.find((p) => p.id === (linea.productoId || linea.producto?.id));
        const tipoIva = producto?.tipoIva;
        const porcentajeIva = tipoIva?.porcentajeIva || 0;
        
        // Precio unitario con IVA incluido
        const precioConIva = linea.precioUnitario * (1 + porcentajeIva / 100);
        
        // Importe = precio con IVA * cantidad
        const importeLinea = precioConIva * linea.cantidad;
        
        let row = '<tr>';
        if (config.mostrarDescripcionProducto)
          row += `<td style="text-align:left; padding-right:3px; overflow:hidden; text-overflow:ellipsis;">${linea.descripcion}</td>`;
        if (config.mostrarReferenciaProducto)
          row += `<td style="text-align:left; padding-right:3px;">${producto?.referencia || "-"}</td>`;
        if (config.mostrarCantidad)
          row += `<td style="text-align:center; width:${anchos.cant};">${linea.cantidad}</td>`;
        if (config.mostrarPrecioUnitario)
          row += `<td style="text-align:right; white-space:nowrap; width:${anchos.precio};">${precioConIva.toFixed(2)}&nbsp;€</td>`;
        if (config.mostrarSubtotalLinea)
          row += `<td style="text-align:right; white-space:nowrap; width:${anchos.importe};">${importeLinea.toFixed(2)}&nbsp;€</td>`;
        row += '</tr>';
        return row;
      })
      .join("");

    const columnasIva = [];
    if (config.mostrarBaseImponible)
      columnasIva.push({
        key: "base",
        label: config.textoBase || "Base",
        align: "left",
        width: "33%",
      });
    if (config.mostrarPorcentajeIva)
      columnasIva.push({
        key: "porcentaje",
        label: config.textoIva || "IVA",
        align: "center",
        width: "20%",
      });
    if (config.mostrarCuotaIva)
      columnasIva.push({
        key: "cuota",
        label: "Total IVA",
        align: "right",
        width: "33%",
      });

    const filasIvaData = facturaData ? generarLineasIvaFromFactura(lineasImprimir) : generarLineasIva();
    const filasIva = filasIvaData
      .map((iva) => {
        const cells = [];
        if (config.mostrarBaseImponible)
          cells.push(
            `<td style="padding:2px 4px 2px 0;">${iva.base.toFixed(2)}&nbsp;€</td>`
          );
        if (config.mostrarPorcentajeIva)
          cells.push(
            `<td style="padding:2px 4px; text-align:center;">${iva.porcentaje.toFixed(
              2
            )}%</td>`
          );
        if (config.mostrarCuotaIva)
          cells.push(
            `<td style="padding:2px 0; text-align:right; white-space:nowrap;">${iva.cuota.toFixed(
              2
            )}&nbsp;€</td>`
          );
        return `<tr>${cells.join("")}</tr>`;
      })
      .join("");

    const seccionTotales = `
      <div style="margin-top:8px;">
        ${
          config.mostrarSubtotal
            ? `<div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>${config.textoSubtotal}</span><span>${(facturaData?.subtotal || calcularTotales.subtotal).toFixed(2)}&nbsp;€</span></div>`
            : ""
        }
        ${
          config.mostrarDescuentoTotal
            ? `<div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>${config.textoDescuento}</span><span>-${(facturaData?.descuentoTotal || calcularTotales.descuento).toFixed(2)}&nbsp;€</span></div>`
            : ""
        }
        ${
          config.mostrarTotal
            ? `<div style="display:flex; justify-content:space-between; font-weight:bold; font-size:${config.fuenteTamanoCabecera}px; margin-top:6px;"><span>${config.textoTotal}</span><span>${totalImprimir.toFixed(2)}&nbsp;€</span></div>`
            : ""
        }
      </div>`;

    const seccionPago =
      config.mostrarMetodoPago || config.mostrarImporteEntregado || config.mostrarCambio
        ? `<div style="margin-top:8px;">
            ${config.mostrarMetodoPago ? `<div>${config.textoMetodoPago} ${metodoPagoImprimir}</div>` : ""}
            ${config.mostrarImporteEntregado ? `<div>${config.textoEntregado} ${pago.toFixed(2)}&nbsp;€</div>` : ""}
            ${config.mostrarCambio ? `<div>${config.textoCambio} ${cambioCalculado.toFixed(2)}&nbsp;€</div>` : ""}
          </div>`
        : "";

    const headerLineas = [
      config.mostrarNombreEmpresa ? datosEmpresa?.nombreComercial || "TPV" : null,
      config.mostrarDireccion ? datosEmpresa?.direccion : null,
      config.mostrarCodigoPostal ? datosEmpresa?.codigoPostal : null,
      config.mostrarProvincia ? datosEmpresa?.provincia : null,
      config.mostrarTelefono ? (datosEmpresa?.telefono ? `Tel: ${datosEmpresa.telefono}` : null) : null,
      config.mostrarCif ? (datosEmpresa?.cif ? `CIF: ${datosEmpresa.cif}` : null) : null,
    ]
      .filter(Boolean)
      .map((texto) => `<div>${texto}</div>`)
      .join("");

    const detalleTicket = `
      ${config.mostrarNumeroFactura ? `<div>${config.textoTicket} ${ticketIdImprimir}</div>` : ""}
      ${config.mostrarFechaHora ? `<div>${config.textoFecha} ${fechaImprimir.toLocaleString()}</div>` : ""}
      ${config.mostrarCliente ? `<div>${config.textoCliente} ${clienteImprimir?.nombreComercial || "Mostrador"}</div>` : ""}
    `;

    const tablaColumnas =
      columnas.length > 0
        ? `<table style="width:100%; border-collapse:collapse; font-size:${config.fuenteTamanoNormal}px; table-layout:fixed;">
            <thead>
              <tr>
                ${columnas
                  .map((col) => `<th style="text-align:${col.align}; border-bottom:1px solid #000; padding:2px 0; ${col.width}">${col.label}</th>`)
                  .join("")}
              </tr>
            </thead>
            <tbody>${lineasTabla}</tbody>
          </table>`
        : "";

    const tablaIva =
      config.mostrarDesgloseIva && filasIva && columnasIva.length > 0
        ? `<div style="margin-top:8px; margin-bottom:8px;">
            <div style="font-weight:bold; margin-bottom:6px;">${config.textoIva}</div>
            <table style="width:100%; font-size:${config.fuenteTamanoNormal}px; border-collapse:collapse; table-layout:fixed;">
              <thead>
                <tr>
                  ${columnasIva
                    .map(
                      (col) =>
                        `<th style="text-align:${col.align}; padding:2px 4px; border-bottom:1px solid #000; width:${col.width}; white-space:nowrap;">${col.label}</th>`
                    )
                    .join("")}
                </tr>
              </thead>
              <tbody>${filasIva}</tbody>
            </table>
          </div>`
        : "";

    const pageWidth = config.formatoImpresora === "60mm" ? "58mm" : "80mm";
    return `<!DOCTYPE html><html><head><title>Ticket ${ticketIdImprimir}</title>
      <style>
        @page { size: ${pageWidth} auto; margin: 0; }
        @media print { 
          html, body { height: auto !important; }
          body { page-break-inside: avoid !important; }
          * { page-break-inside: avoid !important; page-break-before: avoid !important; page-break-after: avoid !important; }
        }
        body { font-family: ${config.fuenteFamilia}; font-size:${config.fuenteTamanoNormal}px; padding: 4mm 3mm 2mm; width: 100%; max-width: 100%; margin:0; color:#000; line-height:1.3; box-sizing:border-box; }
        .cabecera { text-align: ${config.alinearCabecera}; font-size:${config.fuenteTamanoCabecera}px; font-weight:bold; margin-bottom:8px; }
        .pie { text-align:${config.alinearPie}; font-size:${config.fuenteTamanoPie}px; margin-top:8px; margin-bottom:0; padding-bottom:0; }
        table { width:100%; border-collapse:collapse; table-layout:fixed; page-break-inside: avoid; }
        td, th { padding:3px 2px; vertical-align:top; }
        img { display: block; margin: 0 auto 8px; max-width: 100px; max-height: 60px; }
      </style></head><body>
        <div class="cabecera">
          ${config.mostrarLogo && empresaLogoUrl ? `<img src="${empresaLogoUrl}" alt="Logo" style="max-height:60px; margin-bottom:8px;" />` : ""}
          <div>${config.textoCabecera}</div>
        </div>
        <div style="margin-top:8px;">${headerLineas}</div>
        <div style="margin:8px 0;">${separador}</div>
        <div>${detalleTicket}</div>
        <div style="margin:8px 0;">${separador}</div>
        ${tablaColumnas}
        <div style="margin:8px 0;">${separador}</div>
        ${tablaIva}
        ${seccionTotales}
        ${seccionPago}
        <div class="pie">
          <div>${config.textoPie}</div>
          <div>${config.textoDespedida}</div>
        </div>
      </body></html>`;
  }, [
    lineas,
    productos,
    configuracionTicket,
    datosEmpresa,
    importeEntregado,
    calcularTotales,
    ticketId,
    fechaTicket,
    clienteSeleccionado,
    metodoPago,
    generarLineasIva,
  ]);

  const imprimirTicket = useCallback(async (facturaData = null) => {
    const ticketHtml = generarTicketHtml(facturaData);
    if (!ticketHtml) {
      setMensaje && setMensaje("No hay productos en el ticket");
      return;
    }
    if (typeof window === "undefined") {
      setMensaje && setMensaje("Impresión no disponible en este entorno");
      return;
    }

    const iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";
    iframe.style.visibility = "hidden";
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(ticketHtml);
    iframeDoc.close();

    const cleanupIframe = () => {
      if (iframe && iframe.parentNode) {
        document.body.removeChild(iframe);
      }
    };

    iframe.contentWindow.onafterprint = cleanupIframe;
    iframe.contentWindow.onbeforeunload = cleanupIframe;

    iframe.contentWindow.focus();
    setTimeout(() => {
      try {
        iframe.contentWindow.print();
      } catch (err) {
        console.error("Error al imprimir:", err);
        cleanupIframe();
      }
      setTimeout(cleanupIframe, 1000);
    }, 250);
  }, [generarTicketHtml, setMensaje]);

  const aplazarTicket = useCallback(async () => {
    console.log("aplazarTicket llamado", { lineasLength: lineas.length, ticketActivoId });
    
    if (lineas.length === 0) {
      setMensaje && setMensaje("No hay artículos en el ticket para aplazar");
      return;
    }

    console.log("Preparando payload para aplazar ticket");
    // Preparar payload para factura simplificada con estado "Pendiente"
    const fechaConOffset = new Date(fechaTicket.getTime() + 3600 * 1000);
    const fechaISO = fechaConOffset.toISOString();

    // Función para crear payload seguro sin referencias circulares
    const crearPayloadSeguro = () => {
      const payload = {
        numero: ticketId,
        fecha: fechaISO,
        clienteId: clienteSeleccionado?.id || null,
        observaciones: "Ticket aplazado - pendiente de cobro",
        estado: "Pendiente",
        subtotal: Number(calcularTotales.subtotal) || 0,
        descuentoTotal: Number(calcularTotales.descuento) || 0,
        total: Number(calcularTotales.total) || 0,
        contabilizado: false,
        lineas: lineas.map((linea) => {
          // Buscar producto de forma segura y extraer solo datos primitivos
          const producto = productos.find(p => p.id === linea.productoId);
          const tipoIva = producto?.tipoIva;
          
          // Calcular valores de forma segura sin referencias a objetos complejos
          const baseLinea = Number(linea.precioUnitario) * Number(linea.cantidad);
          const descuentoLinea = baseLinea * (Number(linea.descuento) / 100);
          const baseImponible = baseLinea - descuentoLinea;
          const porcentajeIva = Number(tipoIva?.porcentajeIva) || 0;
          const porcentajeRecargo = (clienteSeleccionado?.recargoEquivalencia && Number(tipoIva?.porcentajeRecargo)) 
            ? Number(tipoIva.porcentajeRecargo) 
            : 0;
          const importeIva = baseImponible * (porcentajeIva / 100);
          const importeRecargo = baseImponible * (porcentajeRecargo / 100);
          
          // Crear objeto con solo datos primitivos
          return {
            productoId: Number(linea.productoId),
            descripcion: String(linea.descripcion || ''),
            cantidad: Number(linea.cantidad),
            precioUnitario: Number(linea.precioUnitario),
            descuento: Number(linea.descuento),
            tipoIvaId: tipoIva?.id ? Number(tipoIva.id) : null,
            porcentajeIva: Number(porcentajeIva),
            porcentajeRecargo: Number(porcentajeRecargo),
            importeIva: Number(importeIva),
            importeRecargo: Number(importeRecargo),
            importeTotalLinea: Number(baseImponible + importeIva + importeRecargo),
          };
        }),
      };
      return payload;
    };

    let payload;
    try {
      payload = crearPayloadSeguro();
      
      // Depuración: intentar serializar cada parte del payload por separado
      console.log("Depurando payload...");
      console.log("Payload básico:", JSON.stringify({
        numero: payload.numero,
        fecha: payload.fecha,
        clienteId: payload.clienteId,
        observaciones: payload.observaciones,
        estado: payload.estado,
        subtotal: payload.subtotal,
        descuentoTotal: payload.descuentoTotal,
        total: payload.total,
        contabilizado: payload.contabilizado
      }));
      
      console.log("Intentando serializar lineas...");
      console.log("Lineas payload:", JSON.stringify(payload.lineas));
      
      // Verificación final
      JSON.stringify(payload);
    } catch (error) {
      console.error("Error al crear payload seguro:", error);
      console.error("Detalles del error:", error.message);
      
      // Intentar crear un payload mínimo si falla
      try {
        payload = {
          numero: ticketId,
          fecha: fechaISO,
          clienteId: clienteSeleccionado?.id || null,
          observaciones: "Ticket aplazado - pendiente de cobro",
          estado: "Pendiente",
          subtotal: Number(calcularTotales.subtotal) || 0,
          descuentoTotal: Number(calcularTotales.descuento) || 0,
          total: Number(calcularTotales.total) || 0,
          contabilizado: false,
          lineas: lineas.map((linea) => ({
            productoId: Number(linea.productoId),
            descripcion: String(linea.descripcion || ''),
            cantidad: Number(linea.cantidad),
            precioUnitario: Number(linea.precioUnitario),
            descuento: Number(linea.descuento),
            tipoIvaId: null,
            porcentajeIva: 0,
            porcentajeRecargo: 0,
            importeIva: 0,
            importeRecargo: 0,
            importeTotalLinea: Number(linea.precioUnitario) * Number(linea.cantidad),
          }))
        };
        JSON.stringify(payload); // Verificar que este sí funciona
        console.log("Usando payload mínimo sin IVA");
      } catch (fallbackError) {
        console.error("Incluso el payload mínimo falla:", fallbackError);
        setMensaje && setMensaje("Error crítico al preparar los datos del ticket");
        return;
      }
    }

    try {
      console.log("Intentando crear/actualizar ticket aplazado");
      console.log("ticketActivoId:", ticketActivoId);
      
      let facturaActualizada;
      
      if (ticketActivoId) {
        // Reemplazar ticket existente: eliminar y crear nuevo
        console.log("Reemplazando ticket existente, ID:", ticketActivoId);
        console.log("URL base:", FACTURAS_SIMPLIFICADAS_API);
        
        try {
          // Primero intentar eliminar el ticket existente
          console.log("Intentando eliminar ticket existente...");
          const deleteRes = await fetch(`${FACTURAS_SIMPLIFICADAS_API}/${ticketActivoId}`, {
            method: "DELETE",
          });
          
          if (deleteRes.ok) {
            console.log("Ticket existente eliminado correctamente");
          } else {
            console.log("No se pudo eliminar el ticket existente (puede que no exista), continuando...");
          }
        } catch (deleteError) {
          console.log("Error eliminando ticket existente (continuando con creación):", deleteError);
        }
        
        // Ahora crear el nuevo ticket
        console.log("Creando nuevo ticket como reemplazo...");
        const res = await fetch(FACTURAS_SIMPLIFICADAS_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        
        console.log("Respuesta POST status:", res.status);
        console.log("Respuesta POST ok:", res.ok);

        if (!res.ok) {
          const error = await res.json();
          console.error("Error creando ticket reemplazo:", error);
          throw new Error(error.error || "Error al crear ticket de reemplazo");
        }

        facturaActualizada = await res.json();
        console.log("Ticket reemplazo creado:", facturaActualizada);
        setMensaje && setMensaje(`Ticket ${facturaActualizada.numero} reemplazado correctamente`);
      } else {
        // Crear nuevo ticket
        console.log("Creando nuevo ticket");
        console.log("Intentando POST a:", FACTURAS_SIMPLIFICADAS_API);
        
        const res = await fetch(FACTURAS_SIMPLIFICADAS_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const error = await res.json();
          console.error("Error creando ticket:", error);
          throw new Error(error.error || "Error al aplazar ticket");
        }

        facturaActualizada = await res.json();
        console.log("Ticket creado:", facturaActualizada);
        setMensaje && setMensaje(`Ticket ${facturaActualizada.numero} aplazado correctamente`);
      }
      
      // Agregar al historial local y marcar que debe recargarse
      setHistorialTickets(prev => [{
        ticketId: facturaActualizada.numero,
        id: facturaActualizada.id,
        cliente: clienteSeleccionado,
        metodoPago: "Pendiente",
        lineas: facturaActualizada.lineas || [],
        total: facturaActualizada.total,
        cambio: 0,
        horaVenta: new Date().toLocaleString()
      }, ...prev]);
      setHistorialCargado(false);
      
      // Crear nuevo ticket después de aplazar
      // Si tenemos un ticketActivoId, significa que cargamos un ticket existente
      // En ese caso, mantener el mismo ID en lugar de generar uno nuevo
      if (ticketActivoId) {
        // Es un ticket previamente cargado, mantener el mismo ID
        setLineas([]);
        setLineaActivaId(null);
        setClienteSeleccionado(null);
        setCantidadPredefinida(1);
        setTecladoValor("1");
        setTecladoModo("cantidad");
        setMostrandoPago(false);
        setImporteEntregado("");
        // Mantener el mismo ticketId
        setFechaTicket(new Date());
      } else {
        // Es un ticket nuevo, generar nuevo ID
        crearNuevaVentaSync();
      }
      setTicketActivoId(null);
      console.log("Ticket aplazado completado");
    } catch (err) {
      console.error("Error en aplazarTicket:", err);
      if (err.message === "Failed to fetch") {
        console.error("Error de red - Verificar:");
        console.error("1. Servidor backend en ejecución");
        console.error("2. URL correcta:", FACTURAS_SIMPLIFICADAS_API);
        console.error("3. Sin problemas de CORS");
        console.error("4. Firewall no bloqueando");
        setMensaje && setMensaje("Error de conexión con el servidor");
      } else {
        setMensaje && setMensaje(err.message || "Error al aplazar ticket");
      }
    }
  }, [
    lineas,
    calcularTotales,
    ticketId,
    fechaTicket,
    clienteSeleccionado,
    productos,
    setMensaje,
    crearNuevaVenta,
  ]);

  const finalizarCobro = useCallback(async () => {
    if (lineas.length === 0) {
      setMensaje && setMensaje("No hay artículos en el ticket");
      return;
    }
    const pagado = Number.parseFloat(
      (importeEntregado ?? "")
        .toString()
        .replace(",", ".")
    ) || 0;
    const totalTicket = calcularTotales.total;
    const diferencia = pagado - totalTicket;
    if (diferencia < -0.005) {
      setMensaje && setMensaje("El importe entregado es insuficiente");
      return;
    }

    // Preparar payload para factura simplificada
    const fechaConOffset = new Date(fechaTicket.getTime() + 3600 * 1000);
    const fechaISO = fechaConOffset.toISOString();

    const payload = {
      numero: ticketId,
      fecha: fechaISO,
      clienteId: clienteSeleccionado?.id || null,
      observaciones: `Método de pago: ${metodoPago}. Importe entregado: ${pagado.toFixed(2)}€`,
      estado: "Cobrada",
      subtotal: calcularTotales.subtotal,
      descuentoTotal: calcularTotales.descuento,
      total: calcularTotales.total,
      contabilizado: true,
      lineas: lineas.map((linea) => {
        const producto = productos.find(p => p.id === linea.productoId);
        const tipoIva = producto?.tipoIva;
        const baseLinea = linea.precioUnitario * linea.cantidad;
        const descuentoLinea = baseLinea * (linea.descuento / 100);
        const baseImponible = baseLinea - descuentoLinea;
        const porcentajeIva = tipoIva?.porcentajeIva || 0;
        const porcentajeRecargo = clienteSeleccionado?.recargoEquivalencia && tipoIva?.porcentajeRecargo 
          ? tipoIva.porcentajeRecargo 
          : 0;
        const importeIva = baseImponible * (porcentajeIva / 100);
        const importeRecargo = baseImponible * (porcentajeRecargo / 100);
        
        return {
          productoId: linea.productoId,
          descripcion: linea.descripcion,
          cantidad: linea.cantidad,
          precioUnitario: linea.precioUnitario,
          descuento: linea.descuento,
          tipoIvaId: tipoIva?.id || null,
          porcentajeIva,
          porcentajeRecargo,
          importeIva,
          importeRecargo,
          importeTotalLinea: baseImponible + importeIva + importeRecargo,
        };
      }),
    };

    try {
      let res;
      let facturaCreada;
      
      if (ticketActivoId) {
        // Actualizar ticket existente manteniendo el mismo número
        console.log("Actualizando ticket existente al cobrar, ID:", ticketActivoId);
        
        // Para tickets cargados, mantener el mismo número en lugar de generar uno nuevo
        const payloadActualizacion = {
          ...payload,
          // Mantener el número original del ticket cargado
          numero: ticketId,
        };
        
        try {
          // Intentar actualizar con PUT primero
          console.log("Intentando PUT para actualizar ticket...");
          res = await fetch(`${FACTURAS_SIMPLIFICADAS_API}/${ticketActivoId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payloadActualizacion),
          });
          
          console.log("Respuesta PUT status:", res.status);
          
          if (res.ok) {
            facturaCreada = await res.json();
            console.log("Ticket actualizado con PUT:", facturaCreada);
            setMensaje && setMensaje(`Ticket ${facturaCreada.numero} cobrado correctamente`);
          } else {
            throw new Error("PUT no soportado");
          }
        } catch (putError) {
          console.log("PUT no funciona, usando DELETE+POST como fallback...");
          
          // Si PATCH no funciona, usar el método anterior pero manteniendo el número
          try {
            // Eliminar ticket existente
            const deleteRes = await fetch(`${FACTURAS_SIMPLIFICADAS_API}/${ticketActivoId}`, {
              method: "DELETE",
            });
            
            if (deleteRes.ok) {
              console.log("Ticket existente eliminado correctamente");
            } else {
              console.log("No se pudo eliminar el ticket existente, continuando...");
            }
          } catch (deleteError) {
            console.log("Error eliminando ticket existente:", deleteError);
          }
          
          // Crear nuevo ticket pero con el mismo número
          res = await fetch(FACTURAS_SIMPLIFICADAS_API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payloadActualizacion),
          });
          
          if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || "Error al crear ticket cobrado");
          }
          
          facturaCreada = await res.json();
          console.log("Ticket cobrado recreado con mismo número:", facturaCreada);
          setMensaje && setMensaje(`Ticket ${facturaCreada.numero} cobrado correctamente`);
        }
      } else {
        // Crear nuevo ticket
        res = await fetch(FACTURAS_SIMPLIFICADAS_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || "Error al crear factura simplificada");
        }

        facturaCreada = await res.json();
        setMensaje && setMensaje(`Factura simplificada ${facturaCreada.numero} creada. Stock actualizado.`);
      }
      
      // Agregar al historial local y marcar que debe recargarse
      setHistorialTickets(prev => [{
        ticketId: facturaCreada.numero,
        id: facturaCreada.id,
        cliente: clienteSeleccionado,
        metodoPago: metodoPago,
        lineas: facturaCreada.lineas || [],
        total: facturaCreada.total,
        cambio: pagado - calcularTotales.total,
        horaVenta: new Date().toLocaleString()
      }, ...prev]);
      setHistorialCargado(false);
    } catch (err) {
      console.error(err);
      setMensaje && setMensaje(err.message || "Error al procesar el cobro");
      return;
    } finally {
      setMostrandoPago(false);
      imprimirTicket();
      
      // Solo crear nuevo ticket si no estamos trabajando con un ticket cargado
      if (!ticketActivoId) {
        crearNuevaVentaSync();
      } else {
        // Si es un ticket cargado, solo limpiar el formulario sin generar nuevo ID
        setLineas([]);
        setLineaActivaId(null);
        setClienteSeleccionado(null);
        setCantidadPredefinida(1);
        setTecladoValor("1");
        setTecladoModo("cantidad");
        setMostrandoPago(false);
        setImporteEntregado("");
        setFechaTicket(new Date());
        
        // Actualizar el ticketId visualmente para mostrar el siguiente número
        const actualizarTicketIdVisual = async () => {
          try {
            const siguienteTicketId = await generarTicketId();
            setTicketId(siguienteTicketId);
          } catch (error) {
            console.error("Error actualizando ticketId visual:", error);
            // Si hay error, usar método síncrono
            setTicketId(generarTicketIdSync());
          }
        };
        actualizarTicketIdVisual();
      }
      setTicketActivoId(null);
    }
  }, [
    lineas,
    importeEntregado,
    calcularTotales,
    ticketId,
    fechaTicket,
    clienteSeleccionado,
    metodoPago,
    productos,
    ticketActivoId,
    setMensaje,
    imprimirTicket,
    crearNuevaVenta,
  ]);

  const cargarTicketsPendientes = useCallback(async () => {
    try {
      const res = await fetch(FACTURAS_SIMPLIFICADAS_API);
      const data = await res.json();
      const ticketsPendientes = (Array.isArray(data) ? data : [])
        .filter((factura) => factura.estado === "Pendiente")
        .map((factura) => ({
          ticketId: factura.numero,
          id: factura.id,
          cliente: factura.cliente,
          lineas: factura.lineas || [],
          total: factura.total,
          fecha: factura.fecha,
          horaVenta: new Date(factura.fecha).toLocaleString(),
        }));
      setTicketsPendientes(ticketsPendientes);
    } catch (err) {
      console.error("Error cargando tickets pendientes:", err);
    }
  }, []);

  const cargarHistorialTickets = useCallback(async () => {
    if (historialCargado) return;
    try {
      const res = await fetch(FACTURAS_SIMPLIFICADAS_API);
      const data = await res.json();
      const facturasFormateadas = (Array.isArray(data) ? data : [])
        .filter((factura) => {
          const fechaFactura = new Date(factura.fecha);
          return fechaFactura >= inicioSesion;
        })
        .map((factura) => ({
          ticketId: factura.numero,
          id: factura.id,
          cliente: factura.cliente,
          metodoPago: factura.observaciones?.includes("Método de pago:")
            ? factura.observaciones.split("Método de pago: ")[1]?.split(".")[0] || "Efectivo"
            : "Efectivo",
          lineas: factura.lineas || [],
          total: factura.total,
          cambio: 0,
          horaVenta: new Date(factura.fecha).toLocaleString(),
        }));
      setHistorialTickets(facturasFormateadas);
      setHistorialCargado(true);
    } catch (err) {
      console.error("Error cargando historial:", err);
    }
  }, [historialCargado, inicioSesion]);

  const toggleTicketsPendientes = useCallback(() => {
    setMostrandoTicketsPendientes(prev => {
      if (!prev) {
        cargarTicketsPendientes();
      }
      return !prev;
    });
  }, [cargarTicketsPendientes]);

  const cargarTicketPendiente = useCallback(async (ticketPendiente) => {
    try {
      // Para cada línea, usar el precio guardado como precio base
      const lineasConPrecioBase = ticketPendiente.lineas.map(linea => {
        const producto = productos.find(p => p.id === linea.productoId);
        
        // El precioUnitario guardado en la base de datos ya es el precio base
        // No necesitamos hacer cálculos, simplemente usarlo como está
        let precioBase = linea.precioUnitario;
        
        // Si tenemos el producto actual y queremos usar su precio actual en lugar del guardado
        if (producto) {
          // Opcional: usar precio actual del producto si ha cambiado
          precioBase = normalizarImporte(producto.precio) || 
                      normalizarImporte(producto.precioBase) || 
                      normalizarImporte(producto.precioVenta) || 
                      linea.precioUnitario;
        }
        
        return {
          ...linea,
          id: `${linea.productoId}-${Date.now()}-${Math.random()}`,
          precioUnitario: precioBase, // Usar precio base directamente
        };
      });
      
      setLineas(lineasConPrecioBase);
      setClienteSeleccionado(ticketPendiente.cliente || null);
      setTicketId(ticketPendiente.ticketId);
      setFechaTicket(new Date(ticketPendiente.fecha));
      setTicketActivoId(ticketPendiente.id);
      setMostrandoTicketsPendientes(false);
      setMensaje && setMensaje(`Ticket ${ticketPendiente.ticketId} cargado`);
    } catch (err) {
      console.error("Error cargando ticket pendiente:", err);
      setMensaje && setMensaje("Error al cargar el ticket");
    }
  }, [productos, setMensaje]);

  const toggleHistorial = useCallback(() => {
    setMostrandoHistorial((prev) => {
      if (!prev && !historialCargado) {
        cargarHistorialTickets();
      }
      return !prev;
    });
  }, [cargarHistorialTickets, historialCargado]);

  const aplicarDescuentoGlobal = useCallback((porcentaje) => {
    setLineas(prev => prev.map(linea => ({
      ...linea,
      descuento: porcentaje
    })));
    setMensaje && setMensaje(`Descuento del ${porcentaje}% aplicado a todas las líneas`);
  }, [setMensaje]);

  const atajosTeclado = useCallback((e) => {
    if (e.ctrlKey || e.metaKey) {
      switch(e.key.toLowerCase()) {
        case 'n':
          e.preventDefault();
          crearNuevaVentaSync();
          break;
        case 'p':
          e.preventDefault();
          if (lineas.length > 0) iniciarCobro();
          break;
        case 'i':
          e.preventDefault();
          if (lineas.length > 0) imprimirTicket();
          break;
        case 'h':
          e.preventDefault();
          toggleHistorial();
          break;
        default:
          break;
      }
    }
  }, [crearNuevaVentaSync, lineas.length, iniciarCobro, imprimirTicket, toggleHistorial]);

  useEffect(() => {
    window.addEventListener('keydown', atajosTeclado);
    return () => window.removeEventListener('keydown', atajosTeclado);
  }, [atajosTeclado]);

  return {
    familias,
    productosFiltrados,
    categoriaActiva,
    seleccionarCategoria,
    subfamiliaActiva,
    subfamiliasDisponibles,
    seleccionarSubfamilia,
    paginaFamilias,
    paginaSubfamilias,
    avanzarPaginaFamilias,
    retrocederPaginaFamilias,
    avanzarPaginaSubfamilias,
    retrocederPaginaSubfamilias,
    busqueda,
    setBusqueda,
    addProductoAlTicket,
    lineas,
    lineaActivaId,
    setLineaActivaId,
    ajustarCantidad,
    eliminarLinea,
    limpiarTicket,
    clienteSeleccionado,
    seleccionarCliente,
    clientes,
    tecladoModo,
    setTecladoModo,
    tecladoValor,
    handlePadInput,
    aplicarCalculadora,
    cantidadPredefinida,
    iniciarCobro,
    mostrandoPago,
    metodoPago,
    setMetodoPago,
    importeEntregado,
    setImporteEntregado,
    finalizarCobro,
    cancelarCobro,
    cambio,
    imprimirTicket,
    aplazarTicket,
    ticketId,
    fechaTicket,
    totales: calcularTotales,
    crearNuevaVenta,
    cargarDatos,
    historialTickets,
    mostrandoHistorial,
    toggleHistorial,
    ticketsPendientes,
    mostrandoTicketsPendientes,
    toggleTicketsPendientes,
    cargarTicketPendiente,
    ticketActivoId,
    aplicarDescuentoGlobal,
    recargarContadorDesdeBD,
  };
}
