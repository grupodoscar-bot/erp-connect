import { useCallback, useEffect, useMemo, useState } from "react";
import API_ENDPOINTS from "../../config/api";

const API_URL = API_ENDPOINTS.facturas;
const CLIENTES_API_URL = API_ENDPOINTS.clientes;
const PRODUCTOS_API_URL = API_ENDPOINTS.productos;
const ALBARANES_API_URL = API_ENDPOINTS.albaranes;
const TRANSFORMACIONES_API_URL = API_ENDPOINTS.documentoTransformaciones;

const estadoOptions = ["Pendiente", "Emitida", "Pagada", "Cancelada"];

const findClienteById = (clientes, clienteId) => {
  if (!clienteId) return null;
  return clientes.find((c) => c.id === parseInt(clienteId));
};

const findProductoById = (productos, productoId) => {
  if (!productoId) return null;
  return productos.find((p) => p.id === parseInt(productoId));
};

const calcularTotalesLineaSinImpuestos = (linea = {}) => {
  const cantidad = parseFloat(linea.cantidad) || 0;
  const precio = parseFloat(linea.precioUnitario) || 0;
  const descuento = parseFloat(linea.descuento) || 0;
  const bruto = cantidad * precio;
  const descuentoImporte = bruto * (descuento / 100);
  return {
    bruto,
    descuentoImporte,
    baseImponible: bruto - descuentoImporte,
  };
};

const calcularImpuestosLinea = (linea, producto, cliente) => {
  const { baseImponible } = calcularTotalesLineaSinImpuestos(linea);
  const tipoIva = producto?.tipoIva;
  const porcentajeIva = tipoIva?.porcentajeIva ?? 0;
  const porcentajeRecargo =
    cliente?.recargoEquivalencia && tipoIva?.porcentajeRecargo
      ? tipoIva.porcentajeRecargo
      : 0;

  const importeIva = baseImponible * (porcentajeIva / 100);
  const importeRecargo = baseImponible * (porcentajeRecargo / 100);

  return {
    tipoIvaNombre: tipoIva?.nombre || "",
    porcentajeIva,
    porcentajeRecargo,
    importeIva,
    importeRecargo,
  };
};

const aplicarImpuestosEnLineas = ({ lineas = [], clienteId, clientes, productos }) => {
  const cliente = typeof clienteId === "object" ? clienteId : findClienteById(clientes, clienteId);
  return lineas.map((linea) => {
    if (!linea?.productoId) {
      return {
        ...linea,
        tipoIvaNombre: linea?.tipoIvaNombre || "",
        porcentajeIva: linea?.porcentajeIva || 0,
        porcentajeRecargo: linea?.porcentajeRecargo || 0,
        importeIva: linea?.importeIva || 0,
        importeRecargo: linea?.importeRecargo || 0,
      };
    }
    const producto = findProductoById(productos, linea.productoId);
    const impuestos = calcularImpuestosLinea(linea, producto, cliente);
    return {
      ...linea,
      ...impuestos,
    };
  });
};

const lineasSonIguales = (a = [], b = []) => {
  if (a.length !== b.length) return false;
  return a.every((linea, index) => {
    const otra = b[index];
    if (!otra) return false;
    return (
      linea.productoId === otra.productoId &&
      linea.cantidad === otra.cantidad &&
      linea.precioUnitario === otra.precioUnitario &&
      linea.descuento === otra.descuento &&
      (linea.porcentajeIva || 0) === (otra.porcentajeIva || 0) &&
      (linea.porcentajeRecargo || 0) === (otra.porcentajeRecargo || 0) &&
      (linea.importeIva || 0) === (otra.importeIva || 0) &&
      (linea.importeRecargo || 0) === (otra.importeRecargo || 0)
    );
  });
};

const formFacturaInicial = {
  id: null,
  numero: "",
  fecha: "",
  clienteId: "",
  albaranId: "",
  observaciones: "",
  estado: estadoOptions[0]?.nombre || "Pendiente",
  descuentoAgrupacionManual: 0,
  lineas: [],
};

const lineaInicial = {
  productoId: "",
  cantidad: 1,
  precioUnitario: 0,
  descuento: 0,
  observaciones: "",
  tipoIvaNombre: "",
  porcentajeIva: 0,
  porcentajeRecargo: 0,
  importeIva: 0,
  importeRecargo: 0,
};

export function useFacturas({ setMensaje, abrirPestana, cerrarPestana, pestanaActiva }) {
  const [facturas, setFacturas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [albaranes, setAlbaranes] = useState([]);
  const [formFactura, setFormFactura] = useState(formFacturaInicial);
  const [cargando, setCargando] = useState(false);

  const cargarFacturas = useCallback(async () => {
    try {
      setCargando(true);
      const res = await fetch(API_URL);
      const data = await res.json();
      const facturasData = Array.isArray(data) ? data : data.content || [];
      
      // Cargar origen de cada documento
      const facturasConOrigen = await Promise.all(facturasData.map(async (factura) => {
        try {
          const resOrigen = await fetch(`${TRANSFORMACIONES_API_URL}/origen-directo/FACTURA/${factura.id}`);
          if (resOrigen.ok) {
            const dataOrigen = await resOrigen.json();
            const formatearTipo = (tipo) => {
              const tipos = {
                'PRESUPUESTO': 'Presupuesto',
                'PEDIDO': 'Pedido',
                'ALBARAN': 'Albarán',
                'FACTURA': 'Factura',
                'FACTURA_PROFORMA': 'F. Proforma',
                'FACTURA_RECTIFICATIVA': 'F. Rectificativa',
                'DUPLICAR': 'Duplicado',
                'CONVERTIR': 'Conversión'
              };
              return tipos[dataOrigen.tipoTransformacion] || tipos[dataOrigen.tipoOrigen] || 'Manual';
            };
            return { ...factura, origen: formatearTipo(dataOrigen.tipoOrigen) };
          }
          return { ...factura, origen: null };
        } catch (err) {
          return { ...factura, origen: null };
        }
      }));
      
      setFacturas(facturasConOrigen);
    } catch (err) {
      console.error(err);
      setMensaje("Error al cargar facturas");
    } finally {
      setCargando(false);
    }
  }, [setMensaje]);

  const cargarClientes = useCallback(async () => {
    try {
      const res = await fetch(CLIENTES_API_URL);
      const data = await res.json();
      setClientes(Array.isArray(data) ? data : data.content || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const cargarProductos = useCallback(async () => {
    try {
      const res = await fetch(PRODUCTOS_API_URL);
      const data = await res.json();
      setProductos(Array.isArray(data) ? data : data.content || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const cargarAlbaranes = useCallback(async () => {
    try {
      const res = await fetch(ALBARANES_API_URL);
      const data = await res.json();
      setAlbaranes(Array.isArray(data) ? data : data.content || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    cargarFacturas();
    cargarClientes();
    cargarProductos();
    cargarAlbaranes();
  }, [cargarFacturas, cargarClientes, cargarProductos, cargarAlbaranes]);

  const recalcularLineasConImpuestos = useCallback(
    (lineas, clienteId) =>
      aplicarImpuestosEnLineas({
        lineas,
        clienteId,
        clientes,
        productos,
      }),
    [clientes, productos]
  );

  useEffect(() => {
    setFormFactura((prev) => {
      if (!prev.lineas.length) return prev;
      const conImpuestos = recalcularLineasConImpuestos(prev.lineas, prev.clienteId);
      if (lineasSonIguales(conImpuestos, prev.lineas)) {
        return prev;
      }
      return {
        ...prev,
        lineas: conImpuestos,
      };
    });
  }, [clientes, productos, recalcularLineasConImpuestos]);

  const agregarLinea = useCallback(() => {
    setFormFactura((prev) => {
      const nuevasLineas = [...prev.lineas, { ...lineaInicial }];
      return {
        ...prev,
        lineas: recalcularLineasConImpuestos(nuevasLineas, prev.clienteId),
      };
    });
  }, [recalcularLineasConImpuestos, setFormFactura]);

  const eliminarLinea = useCallback(
    (index) => {
      setFormFactura((prev) => {
        const filtradas = prev.lineas.filter((_, i) => i !== index);
        return {
          ...prev,
          lineas: recalcularLineasConImpuestos(filtradas, prev.clienteId),
        };
      });
    },
    [recalcularLineasConImpuestos, setFormFactura]
  );

  const actualizarLinea = useCallback(
    (index, campo, valor) => {
      setFormFactura((prev) => {
        const nuevasLineas = [...prev.lineas];
        nuevasLineas[index] = { ...nuevasLineas[index], [campo]: valor };

        if (campo === "productoId" && valor) {
          const producto = productos.find((p) => p.id === parseInt(valor));
          if (producto) {
            const precioDetectado =
              producto.precioVenta ??
              producto.precio ??
              producto.precioConImpuestos ??
              producto.precioUnitario ??
              0;
            nuevasLineas[index].precioUnitario = parseFloat(precioDetectado) || 0;
          }
        }

        return {
          ...prev,
          lineas: recalcularLineasConImpuestos(nuevasLineas, prev.clienteId),
        };
      });
    },
    [productos, recalcularLineasConImpuestos]
  );

  const calcularTotalLinea = useCallback((linea) => {
    const { baseImponible } = calcularTotalesLineaSinImpuestos(linea);
    const importeIva = linea.importeIva || 0;
    const importeRecargo = linea.importeRecargo || 0;
    return baseImponible + importeIva + importeRecargo;
  }, []);

  const descuentoAgrupacionBase = useMemo(() => {
    if (!formFactura.clienteId) return 0;
    const cliente = clientes.find((c) => c.id === parseInt(formFactura.clienteId));
    return cliente?.agrupacion?.descuentoGeneral || 0;
  }, [formFactura.clienteId, clientes]);

  useEffect(() => {
    setFormFactura((prev) => {
      if (prev.descuentoAgrupacionManual === 0 || prev.descuentoAgrupacionManual === null) {
        return { ...prev, descuentoAgrupacionManual: descuentoAgrupacionBase };
      }
      return prev;
    });
  }, [descuentoAgrupacionBase]);

  const porcentajeDescuentoAgrupacionEfectivo =
    formFactura.descuentoAgrupacionManual ?? descuentoAgrupacionBase;

  const calcularTotales = useCallback(() => {
    let subtotal = 0;
    let descuentoTotal = 0;
    let totalIva = 0;
    let totalRecargo = 0;

    formFactura.lineas.forEach((linea) => {
      const lineaSubtotal = linea.cantidad * linea.precioUnitario;
      const lineaDescuento = lineaSubtotal * (linea.descuento / 100);
      subtotal += lineaSubtotal;
      descuentoTotal += lineaDescuento;
      totalIva += parseFloat(linea.importeIva) || 0;
      totalRecargo += parseFloat(linea.importeRecargo) || 0;
    });

    const totalTrasDescuentosLinea = subtotal - descuentoTotal;
    const descuentoAgrupacion =
      totalTrasDescuentosLinea * (porcentajeDescuentoAgrupacionEfectivo / 100);
    const baseTrasAgrupacion = totalTrasDescuentosLinea - descuentoAgrupacion;
    const total = baseTrasAgrupacion + totalIva + totalRecargo;

    return {
      subtotal,
      descuentoTotal,
      descuentoAgrupacion,
      porcentajeDescuentoAgrupacion: porcentajeDescuentoAgrupacionEfectivo,
      descuentoAgrupacionBase,
      totalIva,
      totalRecargo,
      totalBaseSinImpuestos: baseTrasAgrupacion,
      total,
    };
  }, [
    formFactura.lineas,
    porcentajeDescuentoAgrupacionEfectivo,
    descuentoAgrupacionBase,
  ]);

  const abrirNuevoFactura = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/siguiente-numero`);
      const data = await res.json();
      setFormFactura({
        ...formFacturaInicial,
        numero: data.numero || "",
        fecha: new Date().toISOString().slice(0, 16),
      });
    } catch {
      setFormFactura({
        ...formFacturaInicial,
        fecha: new Date().toISOString().slice(0, 16),
      });
    }
    abrirPestana("factura-nueva", null, "Nueva Factura");
  }, [abrirPestana]);

  const abrirEditarFactura = useCallback(
    (factura) => {
      const cliente = clientes.find((c) => c.id === factura.cliente?.id);
      const descuentoBase = cliente?.agrupacion?.descuentoGeneral || 0;

      setFormFactura({
        id: factura.id,
        numero: factura.numero,
        fecha: factura.fecha,
        clienteId: factura.cliente?.id || "",
        albaranId: factura.albaran?.id || "",
        observaciones: factura.observaciones || "",
        estado: factura.estado || estadoOptions[0]?.nombre || "Pendiente",
        descuentoAgrupacionManual: factura.descuentoAgrupacion ?? descuentoBase,
        lineas:
          factura.lineas?.map((l) => ({
            productoId: l.producto?.id || "",
            cantidad: l.cantidad,
            precioUnitario: l.precioUnitario,
            descuento: l.descuento || 0,
            observaciones: l.observaciones || "",
            porcentajeIva: l.porcentajeIva || 0,
            porcentajeRecargo: l.porcentajeRecargo || 0,
            importeIva: l.importeIva || 0,
            importeRecargo: l.importeRecargo || 0,
          })) || [],
      });

      abrirPestana("factura-editar", factura.id, `Editar ${factura.numero}`);
    },
    [abrirPestana, clientes]
  );

  const abrirVerFactura = useCallback(
    (factura) => {
      abrirPestana("factura-ver", factura.id, `Factura ${factura.numero}`);
    },
    [abrirPestana]
  );

  const guardarFactura = useCallback(
    async (e) => {
      e.preventDefault();
      const metodo = formFactura.id ? "PUT" : "POST";
      const url = formFactura.id ? `${API_URL}/${formFactura.id}` : API_URL;

      const payload = {
        numero: formFactura.numero,
        fecha: formFactura.fecha,
        clienteId: formFactura.clienteId || null,
        albaranId: formFactura.albaranId || null,
        observaciones: formFactura.observaciones,
        estado: formFactura.estado,
        lineas: formFactura.lineas.map((l) => ({
          productoId: l.productoId,
          cantidad: l.cantidad,
          precioUnitario: l.precioUnitario,
          descuento: l.descuento,
          observaciones: l.observaciones,
          porcentajeIva: l.porcentajeIva || 0,
          porcentajeRecargo: l.porcentajeRecargo || 0,
          importeIva: l.importeIva || 0,
          importeRecargo: l.importeRecargo || 0,
        })),
      };

      try {
        const res = await fetch(url, {
          method: metodo,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error("Error al guardar factura");
        setMensaje(formFactura.id ? "Factura actualizada" : "Factura creada");
        cerrarPestana(pestanaActiva);
        cargarFacturas();
      } catch (err) {
        console.error(err);
        setMensaje("Error al guardar factura");
      }
    },
    [formFactura, setMensaje, cerrarPestana, pestanaActiva, cargarFacturas]
  );

  const borrarFactura = useCallback(
    async (id) => {
      if (!window.confirm("¿Eliminar esta factura?")) return;
      try {
        await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        setMensaje("Factura eliminada");
        cargarFacturas();
      } catch (err) {
        console.error(err);
        setMensaje("Error al eliminar factura");
      }
    },
    [setMensaje, cargarFacturas]
  );

  const updateFormField = useCallback(
    (campo, valor) => {
      setFormFactura((prev) => {
        let siguiente = { ...prev, [campo]: valor };
        if (campo === "clienteId") {
          siguiente.lineas = recalcularLineasConImpuestos(siguiente.lineas, valor);
        }
        return siguiente;
      });
    },
    [recalcularLineasConImpuestos]
  );

  // ========== HISTORIAL DE TRANSFORMACIONES ==========
  const [modalHistorialAbierto, setModalHistorialAbierto] = useState(false);
  const [documentoHistorial, setDocumentoHistorial] = useState(null);
  const [historialModal, setHistorialModal] = useState([]);
  const [cargandoHistorialModal, setCargandoHistorialModal] = useState(false);

  const cargarHistorialTransformaciones = useCallback(async (tipo, id) => {
    try {
      const res = await fetch(`${TRANSFORMACIONES_API_URL}/historial/${tipo}/${id}`);
      if (res.ok) {
        const data = await res.json();
        return data;
      }
      return [];
    } catch (err) {
      console.error("Error cargando historial de transformaciones:", err);
      return [];
    }
  }, []);

  const abrirModalHistorialDocumento = useCallback(async (factura) => {
    setDocumentoHistorial({ tipo: 'FACTURA', id: factura.id, numero: factura.numero });
    setModalHistorialAbierto(true);
    setCargandoHistorialModal(true);
    try {
      const historial = await cargarHistorialTransformaciones('FACTURA', factura.id);
      setHistorialModal(historial || []);
    } catch (error) {
      console.error('Error al cargar historial:', error);
      setHistorialModal([]);
    } finally {
      setCargandoHistorialModal(false);
    }
  }, [cargarHistorialTransformaciones]);

  const cerrarModalHistorial = useCallback(() => {
    setModalHistorialAbierto(false);
    setDocumentoHistorial(null);
    setHistorialModal([]);
  }, []);

  return {
    // datos
    facturas,
    clientes,
    productos,
    albaranes,
    formFactura,
    estadoOptions,
    cargando,

    // funciones
    cargarFacturas,
    abrirNuevoFactura,
    abrirEditarFactura,
    abrirVerFactura,
    borrarFactura,
    guardarFactura,

    updateFormField,
    agregarLinea,
    eliminarLinea,
    actualizarLinea,
    calcularTotalLinea,
    calcularTotales,
    
    // Modal historial
    modalHistorialAbierto,
    documentoHistorial,
    historialModal,
    cargandoHistorialModal,
    abrirModalHistorialDocumento,
    cerrarModalHistorial,
  };
}
