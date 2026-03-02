import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useTarifasAlbaran } from "./useTarifasAlbaran";
import API_ENDPOINTS from "../../config/api";

const API_URL = API_ENDPOINTS.presupuestos;
const CLIENTES_API_URL = API_ENDPOINTS.clientes;
const PRODUCTOS_API_URL = API_ENDPOINTS.productos;
const TIPOS_IVA_API_URL = API_ENDPOINTS.tiposIva;
const ARCHIVOS_API_URL = API_ENDPOINTS.archivosEmpresa;
const SERIES_API_URL = API_ENDPOINTS.series;
const SERIES_PREF_API_URL = API_ENDPOINTS.seriesPreferencias;
const ALMACENES_API_URL = API_ENDPOINTS.almacenes;
const API_URL_CONFIG_VENTAS = API_ENDPOINTS.configuracionVentas;
const TRANSFORMACIONES_API_URL = API_ENDPOINTS.documentoTransformaciones;
const DOCUMENTO_SERIE_TIPO = "PRESUPUESTO";

const ESTADOS_PRESUPUESTO_PREDETERMINADOS = [
  { nombre: "Pendiente", colorClaro: "#FDE68A55", colorOscuro: "#92400E55" },
  { nombre: "Aceptado", colorClaro: "#BBF7D055", colorOscuro: "#14532D55" },
  { nombre: "Rechazado", colorClaro: "#FECACA55", colorOscuro: "#7F1D1D55" },
  { nombre: "Convertido", colorClaro: "#C7D2FE55", colorOscuro: "#312E8155" },
  { nombre: "Cancelado", colorClaro: "#E5E7EB55", colorOscuro: "#37415155" },
];

const formPresupuestoInicial = {
  id: null,
  numero: "",
  fecha: new Date().toISOString().split("T")[0],
  clienteId: "",
  estado: "Pendiente",
  observaciones: "",
  notas: "",
  lineas: [],
  adjuntos: [],
  direccionFacturacionSnapshot: null,
  direccionEnvioSnapshot: null,
  usarCodigoManual: false,
  serieId: "",
  tarifaId: null,
  descuentoAgrupacion: 0,
  descuentoAgrupacionManual: null,
  almacenId: null,
  ventaMultialmacen: false,
};

export function usePresupuestos(pestanaActiva = null, session = null) {
  const [presupuestos, setPresupuestos] = useState([]);
  // Mapa de formularios por ID de pestaña para permitir múltiples instancias
  const [formulariosPorPestana, setFormulariosPorPestana] = useState({});
  
  // Obtener formulario de la pestaña actual
  const formPresupuesto = useMemo(() => {
    if (!pestanaActiva) return formPresupuestoInicial;
    return formulariosPorPestana[pestanaActiva] || formPresupuestoInicial;
  }, [formulariosPorPestana, pestanaActiva]);
  
  // Función para actualizar el formulario de la pestaña actual
  const setFormPresupuesto = useCallback((nuevoFormulario, pestanaId = null) => {
    const idPestana = pestanaId || pestanaActiva;
    if (!idPestana) return;
    
    setFormulariosPorPestana(prev => ({
      ...prev,
      [idPestana]: typeof nuevoFormulario === 'function' 
        ? nuevoFormulario(prev[idPestana] || formPresupuestoInicial)
        : nuevoFormulario
    }));
  }, [pestanaActiva]);
  
  // Función para limpiar formulario al cerrar pestaña
  const limpiarFormularioPestana = useCallback((pestanaId) => {
    setFormulariosPorPestana(prev => {
      const nuevo = { ...prev };
      delete nuevo[pestanaId];
      return nuevo;
    });
  }, []);
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [tiposIva, setTiposIva] = useState([]);
  const [loading, setLoading] = useState(false);
  const [paginacion, setPaginacion] = useState({ totalElements: 0, totalPages: 0 });
  const [seriesDisponibles, setSeriesDisponibles] = useState([]);
  const [cargandoSeries, setCargandoSeries] = useState(false);
  const [seriePreferidaUsuario, setSeriePreferidaUsuario] = useState(null);
  const [guardandoPreferenciaSerie, setGuardandoPreferenciaSerie] = useState(false);
  const [generandoNumero, setGenerandoNumero] = useState(false);
  const [almacenes, setAlmacenes] = useState([]);
  const [permitirVentaMultialmacen, setPermitirVentaMultialmacen] = useState(false);

  const tarifasAlbaran = useTarifasAlbaran(formPresupuesto, setFormPresupuesto);

  // Determinar si mostrar selector de almacén (solo si hay más de 1 almacén)
  const mostrarSelectorAlmacen = useMemo(() => almacenes.length > 1, [almacenes]);

  const estadoOptions = ESTADOS_PRESUPUESTO_PREDETERMINADOS;

  const usuarioId = useMemo(
    () =>
      session?.usuario?.id ??
      session?.usuarioId ??
      session?.usuario?.usuarioId ??
      null,
    [session]
  );

  // Inicializar formulario para nueva pestaña si no existe (solo para "nuevo", no para "editar")
  useEffect(() => {
    if (pestanaActiva && pestanaActiva.startsWith('presupuesto-nuevo')) {
      setFormulariosPorPestana(prev => {
        if (!prev[pestanaActiva]) {
          return {
            ...prev,
            [pestanaActiva]: { ...formPresupuestoInicial }
          };
        }
        return prev;
      });
    }
  }, [pestanaActiva]);

  // Seleccionar automáticamente la serie con orden de prioridad: usuario > sistema > única
  useEffect(() => {
    // SOLO ejecutar para pestañas nuevas, NUNCA para edición
    if (!pestanaActiva || !pestanaActiva.startsWith('presupuesto-nuevo')) return;
    if (seriesDisponibles.length === 0 || formPresupuesto.serieId) return;
    
    let serieId = "";
    
    // 1. Preferencia del usuario
    if (seriePreferidaUsuario?.serie?.id) {
      serieId = seriePreferidaUsuario.serie.id.toString();
    }
    // 2. Serie predeterminada del sistema
    else {
      const seriePredeterminada = seriesDisponibles.find(s => s.defaultSistema === true);
      if (seriePredeterminada) {
        serieId = seriePredeterminada.id.toString();
      }
      // 3. Única serie disponible
      else if (seriesDisponibles.length === 1) {
        serieId = seriesDisponibles[0].id.toString();
      }
    }
    
    if (serieId) {
      setFormPresupuesto(prev => ({ ...prev, serieId }));
    }
  }, [pestanaActiva, seriesDisponibles, formPresupuesto.serieId, seriePreferidaUsuario]);

  const cargarPresupuestos = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      if (response.ok) {
        const data = await response.json();
        
        // Cargar origen de cada documento
        const presupuestosConOrigen = await Promise.all((Array.isArray(data) ? data : []).map(async (presupuesto) => {
          try {
            const resOrigen = await fetch(`${TRANSFORMACIONES_API_URL}/origen-directo/PRESUPUESTO/${presupuesto.id}`);
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
              return { ...presupuesto, origen: formatearTipo(dataOrigen.tipoOrigen) };
            }
            return { ...presupuesto, origen: null };
          } catch (err) {
            return { ...presupuesto, origen: null };
          }
        }));
        
        setPresupuestos(presupuestosConOrigen);
        setPaginacion({ totalElements: data.length || 0, totalPages: 1 });
      }
    } catch (error) {
      console.error("Error al cargar presupuestos:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const cargarClientes = useCallback(async () => {
    try {
      const response = await fetch(CLIENTES_API_URL);
      if (response.ok) {
        const data = await response.json();
        setClientes(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error al cargar clientes:", error);
    }
  }, []);

  const cargarProductos = useCallback(async () => {
    try {
      const response = await fetch(PRODUCTOS_API_URL);
      if (response.ok) {
        const data = await response.json();
        setProductos(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error al cargar productos:", error);
    }
  }, []);

  const cargarTiposIva = useCallback(async () => {
    try {
      const response = await fetch(TIPOS_IVA_API_URL);
      if (response.ok) {
        const data = await response.json();
        setTiposIva(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error al cargar tipos de IVA:", error);
    }
  }, []);

  const cargarAlmacenes = useCallback(async () => {
    try {
      const response = await fetch(ALMACENES_API_URL);
      if (response.ok) {
        const data = await response.json();
        setAlmacenes(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error al cargar almacenes:", error);
    }
  }, []);

  const cargarConfiguracionVentas = useCallback(async () => {
    try {
      const res = await fetch(API_URL_CONFIG_VENTAS);
      const data = await res.json();
      setPermitirVentaMultialmacen(data.permitirVentaMultialmacen || false);
    } catch (err) {
      console.error("Error al cargar configuración de ventas:", err);
    }
  }, []);

  const cargarSeries = useCallback(async () => {
    setCargandoSeries(true);
    try {
      const params = new URLSearchParams({
        tipoDocumento: DOCUMENTO_SERIE_TIPO,
        soloActivas: "true",
      });
      const response = await fetch(`${SERIES_API_URL}?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setSeriesDisponibles(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error al cargar series:", error);
    } finally {
      setCargandoSeries(false);
    }
  }, []);

  const cargarPreferenciaSerie = useCallback(async () => {
    if (!usuarioId) {
      setSeriePreferidaUsuario(null);
      return;
    }
    try {
      const params = new URLSearchParams({
        usuarioId: usuarioId.toString(),
        tipoDocumento: DOCUMENTO_SERIE_TIPO,
      });
      const res = await fetch(`${SERIES_PREF_API_URL}?${params.toString()}`);
      if (!res.ok) {
        if (res.status === 404) {
          setSeriePreferidaUsuario(null);
        }
        return;
      }
      const data = await res.json();
      setSeriePreferidaUsuario(data && Object.keys(data).length ? data : null);
    } catch (err) {
      console.error("Error cargando preferencia de serie:", err);
    }
  }, [usuarioId]);

  // Cargar datos solo cuando hay una pestaña de presupuestos activa
  const [datosInicializados, setDatosInicializados] = useState(false);
  
useEffect(() => {
  if (!pestanaActiva) return;
  const esPestanaPresupuestos = pestanaActiva.startsWith('presupuesto-nuevo') || 
    pestanaActiva.startsWith('presupuesto-editar');
  
  if (esPestanaPresupuestos && !datosInicializados) {
    setDatosInicializados(true);
    cargarPresupuestos();
    cargarClientes();
    cargarProductos();
    cargarTiposIva();
    cargarAlmacenes();
    cargarSeries();
    cargarConfiguracionVentas();
  }
}, [pestanaActiva, datosInicializados, cargarPresupuestos, cargarClientes, cargarProductos, cargarTiposIva, cargarAlmacenes, cargarSeries, cargarConfiguracionVentas]);

// Cargar preferencia de serie cuando cambie el usuario
useEffect(() => {
  // SOLO ejecutar para pestañas nuevas, NUNCA para edición
  if (!pestanaActiva || !pestanaActiva.startsWith('presupuesto-nuevo')) return;
  cargarPreferenciaSerie();
}, [pestanaActiva, cargarPreferenciaSerie]);

  // Generar número automáticamente cuando se selecciona una serie
  useEffect(() => {
    // SOLO ejecutar para pestañas nuevas, NUNCA para edición
    if (!pestanaActiva || !pestanaActiva.startsWith('presupuesto-nuevo')) return;
    if (!formPresupuesto.serieId || formPresupuesto.usarCodigoManual || formPresupuesto.id) return;

    const generarNumeroAutomatico = async () => {
      setGenerandoNumero(true);
      try {
        const response = await fetch(`${API_URL}/siguiente-numero?serieId=${formPresupuesto.serieId}`);
        if (response.ok) {
          const data = await response.json();
          setFormPresupuesto(prev => ({ ...prev, numero: data.numero || data }));
        }
      } catch (error) {
        console.error('Error al generar número:', error);
      } finally {
        setGenerandoNumero(false);
      }
    };

    generarNumeroAutomatico();
  }, [pestanaActiva, formPresupuesto.serieId, formPresupuesto.usarCodigoManual, formPresupuesto.id]);

  const updateFormPresupuestoField = useCallback((field, value) => {
    setFormPresupuesto((prev) => {
      let siguiente = { ...prev, [field]: value };
      
      // Si se selecciona una serie y no está permitido multialmacén, asignar almacén automáticamente
      if (field === "serieId" && !permitirVentaMultialmacen && value) {
        const serieSeleccionada = seriesDisponibles.find(s => s.id === parseInt(value));
        if (serieSeleccionada?.almacenPredeterminado?.id) {
          siguiente.almacenId = serieSeleccionada.almacenPredeterminado.id.toString();
        } else if (almacenes.length > 0) {
          siguiente.almacenId = almacenes[0].id.toString();
        }
        siguiente.ventaMultialmacen = false;
      }
      
      return siguiente;
    });
  }, [permitirVentaMultialmacen, seriesDisponibles, almacenes, setFormPresupuesto]);

  // Solo aplicar el descuento de la agrupación del cliente si el campo manual está vacío
  useEffect(() => {
    if (!formPresupuesto.clienteId) return;

    if (formPresupuesto.descuentoAgrupacionManual !== null && formPresupuesto.descuentoAgrupacionManual !== undefined) {
      return;
    }

    const clienteSeleccionado = clientes.find((c) => c.id === parseInt(formPresupuesto.clienteId));
    const descuentoCliente = clienteSeleccionado?.agrupacion?.descuentoGeneral;

    if (descuentoCliente !== undefined && descuentoCliente !== null) {
      setFormPresupuesto((prev) => ({
        ...prev,
        descuentoAgrupacionManual: descuentoCliente,
      }));
    }
  }, [formPresupuesto.clienteId, formPresupuesto.descuentoAgrupacionManual, clientes]);

  const setDireccionSnapshot = useCallback((tipo, direccion) => {
    const campo = tipo === "facturacion" ? "direccionFacturacionSnapshot" : "direccionEnvioSnapshot";
    setFormPresupuesto((prev) => ({ ...prev, [campo]: direccion }));
  }, [setFormPresupuesto]);

  const updateDireccionSnapshotField = useCallback((tipo, field, value) => {
    const campo = tipo === "facturacion" ? "direccionFacturacionSnapshot" : "direccionEnvioSnapshot";
    setFormPresupuesto((prev) => ({
      ...prev,
      [campo]: { ...(prev[campo] || {}), [field]: value },
    }));
  }, [setFormPresupuesto]);

  const agregarLinea = useCallback(() => {
    setFormPresupuesto((prev) => ({
      ...prev,
      lineas: [
        ...prev.lineas,
        {
          id: Date.now(),
          productoId: "",
          cantidad: 1,
          precioUnitario: 0,
          descuento: 0,
          tipoIvaId: "",
          observaciones: "",
          almacenId: "",
        },
      ],
    }));
  }, [setFormPresupuesto]);

  const eliminarLinea = useCallback((index) => {
    setFormPresupuesto((prev) => ({
      ...prev,
      lineas: prev.lineas.filter((_, i) => i !== index),
    }));
  }, [setFormPresupuesto]);

  const actualizarLinea = useCallback((index, field, value) => {
    setFormPresupuesto((prev) => {
      const nuevasLineas = [...prev.lineas];
      nuevasLineas[index] = { ...nuevasLineas[index], [field]: value };
      return { ...prev, lineas: nuevasLineas };
    });
  }, [setFormPresupuesto]);

  // Descuento base de la agrupación del cliente
  const descuentoAgrupacionBase = useMemo(() => {
    if (!formPresupuesto.clienteId) return 0;
    const cliente = clientes.find(c => c.id === parseInt(formPresupuesto.clienteId));
    return cliente?.agrupacion?.descuentoGeneral || 0;
  }, [formPresupuesto.clienteId, clientes]);

  const calcularTotales = useMemo(() => {
    let subtotalBruto = 0;
    let descuentoTotal = 0;
    let totalIva = 0;
    let totalRecargo = 0;
    const desglosePorIva = {};

    const cliente = clientes.find(c => c.id === parseInt(formPresupuesto.clienteId));
    
    formPresupuesto.lineas.forEach((linea) => {
      const producto = productos.find((p) => p.id === parseInt(linea.productoId));
      const cantidad = parseFloat(linea.cantidad) || 0;
      const precio = parseFloat(linea.precioUnitario) || 0;
      const descuento = parseFloat(linea.descuento) || 0;

      const bruto = cantidad * precio;
      const descuentoImporte = bruto * (descuento / 100);
      const baseLinea = bruto - descuentoImporte;
      
      subtotalBruto += bruto;
      descuentoTotal += descuentoImporte;

      const tipoIva = tiposIva.find((t) => t.id === parseInt(linea.tipoIvaId)) || producto?.tipoIva;
      if (tipoIva) {
        const porcentajeIva = parseFloat(tipoIva.porcentajeIva) || 0;
        const porcentajeRecargo = cliente?.recargoEquivalencia && tipoIva.porcentajeRecargo
          ? parseFloat(tipoIva.porcentajeRecargo)
          : 0;
        
        const descuentoAgrupacionPct = parseFloat(formPresupuesto.descuentoAgrupacionManual ?? formPresupuesto.descuentoAgrupacion) || 0;
        const baseConAgrupacion = baseLinea * (1 - descuentoAgrupacionPct / 100);
        
        const ivaLinea = baseConAgrupacion * (porcentajeIva / 100);
        const recargoLinea = baseConAgrupacion * (porcentajeRecargo / 100);
        
        totalIva += ivaLinea;
        totalRecargo += recargoLinea;

        const key = `${porcentajeIva}-${porcentajeRecargo}`;
        if (!desglosePorIva[key]) {
          desglosePorIva[key] = {
            porcentajeIva,
            porcentajeRecargo,
            baseAntesDescuento: 0,
            descuentoAgrupacionImporte: 0,
            baseImponible: 0,
            importeIva: 0,
            importeRecargo: 0,
          };
        }
        const descuentoAgrupacionLineaImporte = baseLinea - baseConAgrupacion;
        desglosePorIva[key].baseAntesDescuento += baseLinea;
        desglosePorIva[key].descuentoAgrupacionImporte += descuentoAgrupacionLineaImporte;
        desglosePorIva[key].baseImponible += baseConAgrupacion;
        desglosePorIva[key].importeIva += ivaLinea;
        desglosePorIva[key].importeRecargo += recargoLinea;
      }
    });

    const subtotal = subtotalBruto - descuentoTotal;
    const descuentoAgrupacionPct = parseFloat(formPresupuesto.descuentoAgrupacionManual ?? formPresupuesto.descuentoAgrupacion) || 0;
    const descuentoAgrupacionImporte = subtotal * (descuentoAgrupacionPct / 100);
    const totalBaseSinImpuestos = subtotal - descuentoAgrupacionImporte;
    const total = totalBaseSinImpuestos + totalIva + totalRecargo;

    const desgloseIva = Object.values(desglosePorIva)
      .filter(d => d.baseImponible > 0)
      .sort((a, b) => a.porcentajeIva - b.porcentajeIva);

    return {
      subtotal: subtotalBruto,
      descuentoTotal,
      descuentoAgrupacionPct,
      descuentoAgrupacionImporte,
      descuentoAgrupacionBase,
      totalBaseSinImpuestos,
      totalIva,
      totalRecargo,
      total,
      desgloseIva,
    };
  }, [formPresupuesto.lineas, formPresupuesto.descuentoAgrupacionManual, formPresupuesto.descuentoAgrupacion, formPresupuesto.clienteId, productos, tiposIva, clientes, descuentoAgrupacionBase]);

  const guardarPresupuesto = useCallback(
    async (e, opciones = {}) => {
      if (e) e.preventDefault();

      // Validar que el número no esté vacío
      if (!formPresupuesto.numero || formPresupuesto.numero.trim() === "") {
        alert("El número del documento no puede estar vacío. Selecciona una serie o activa la numeración manual.");
        return;
      }

      try {
        const totales = calcularTotales;
        const payload = {
          ...formPresupuesto,
          descuentoAgrupacion: formPresupuesto.descuentoAgrupacionManual ?? formPresupuesto.descuentoAgrupacion ?? 0,
          subtotal: parseFloat(totales.subtotal),
          totalIva: parseFloat(totales.totalIva),
          total: parseFloat(totales.total),
          lineas: formPresupuesto.lineas.map((linea) => ({
            productoId: parseInt(linea.productoId) || null,
            cantidad: parseFloat(linea.cantidad) || 0,
            precioUnitario: parseFloat(linea.precioUnitario) || 0,
            descuento: parseFloat(linea.descuento) || 0,
            tipoIvaId: parseInt(linea.tipoIvaId) || null,
            observaciones: linea.observaciones || "",
            almacenId: parseInt(linea.almacenId) || null,
          })),
        };

        const url = formPresupuesto.id ? `${API_URL}/${formPresupuesto.id}` : API_URL;
        const method = formPresupuesto.id ? "PUT" : "POST";

        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          const presupuestoGuardado = await response.json();
          
          // Vincular adjuntos al documento recién guardado
          // Si la lista está vacía, se desvinculan todos los adjuntos existentes
          const adjuntosIds = (formPresupuesto.adjuntos || []).map(a => a.id).filter(id => id && id > 0);
          console.log("DEBUG guardar - adjuntos a vincular:", adjuntosIds);
          try {
            await fetch(`${API_URL}/${presupuestoGuardado.id}/adjuntos`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(adjuntosIds),
            });
          } catch (e) {
            console.error("Error al vincular adjuntos:", e);
          }
          
          await cargarPresupuestos();
          
          if (opciones.cerrarDespues) {
            setFormPresupuesto(formPresupuestoInicial);
            if (opciones.cerrarPestana) {
              opciones.cerrarPestana();
            }
          } else {
            setFormPresupuesto(prev => ({
              ...prev,
              id: presupuestoGuardado.id,
              numero: presupuestoGuardado.numero,
            }));
          }
          
          alert("Presupuesto guardado correctamente");
        } else {
          const error = await response.text();
          alert(`Error al guardar: ${error}`);
        }
      } catch (error) {
        console.error("Error al guardar presupuesto:", error);
        alert("Error al guardar el presupuesto");
      }
    },
    [formPresupuesto, calcularTotales, cargarPresupuestos]
  );

  const eliminarPresupuesto = useCallback(
    async (id) => {
      try {
        const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        if (response.ok) {
          await cargarPresupuestos();
        } else {
          throw new Error("Error al eliminar");
        }
      } catch (error) {
        console.error("Error al eliminar presupuesto:", error);
        throw error;
      }
    },
    [cargarPresupuestos]
  );

  const duplicarPresupuesto = useCallback(
    async (id) => {
      try {
        const response = await fetch(`${API_URL}/${id}/duplicar`, { method: "POST" });
        if (response.ok) {
          const duplicado = await response.json();
          await cargarPresupuestos();
          return duplicado;
        } else {
          throw new Error("Error al duplicar");
        }
      } catch (error) {
        console.error("Error al duplicar presupuesto:", error);
        throw error;
      }
    },
    [cargarPresupuestos]
  );

  const descargarPdf = useCallback(async (id, nombreArchivo) => {
    try {
      const response = await fetch(`${API_URL}/${id}/pdf`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = nombreArchivo;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Error al descargar PDF:", error);
    }
  }, []);

  const subirAdjunto = useCallback(async (file) => {
    try {
      const formData = new FormData();
      formData.append("archivo", file);
      formData.append("rutaCarpeta", "/");
      const response = await fetch(`${ARCHIVOS_API_URL}/subir`, {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        const adjunto = await response.json();
        setFormPresupuesto((prev) => ({
          ...prev,
          adjuntos: [...(prev.adjuntos || []), adjunto],
        }));
      }
    } catch (error) {
      console.error("Error al subir adjunto:", error);
    }
  }, []);

  const eliminarAdjunto = useCallback(async (adjuntoId) => {
    // Solo eliminar físicamente si es temporal (ID 0 o null)
    if (!adjuntoId || adjuntoId === 0) {
      const adjunto = formPresupuesto.adjuntos?.find(a => a.id === adjuntoId || a.id === 0);
      if (adjunto?.idReal) {
        try {
          await fetch(`${ARCHIVOS_API_URL}/${adjunto.idReal}`, { method: "DELETE" });
        } catch (e) {
          console.error("Error al eliminar adjunto temporal:", e);
        }
      }
    }
    // Siempre quitar del estado local
    setFormPresupuesto((prev) => ({
      ...prev,
      adjuntos: prev.adjuntos.filter((a) => a.id !== adjuntoId),
    }));
  }, [formPresupuesto.adjuntos]);

  const descargarAdjunto = useCallback(async (adjuntoId, nombreArchivo) => {
    try {
      const response = await fetch(`${ARCHIVOS_API_URL}/descargar/${adjuntoId}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = nombreArchivo;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Error al descargar adjunto:", error);
    }
  }, []);

  const guardarPreferenciaSerie = useCallback(async (serieId) => {
    setGuardandoPreferenciaSerie(true);
    try {
      const response = await fetch(SERIES_PREF_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipoDocumento: DOCUMENTO_SERIE_TIPO, serieId }),
      });
      if (response.ok) {
        alert("Preferencia de serie guardada");
      }
    } catch (error) {
      console.error("Error al guardar preferencia:", error);
    } finally {
      setGuardandoPreferenciaSerie(false);
    }
  }, []);

  const cargarPresupuestoParaEditar = useCallback(async (presupuesto) => {
    const { id, pestanaId } = presupuesto;
    try {
      const response = await fetch(`${API_URL}/${id}`);
      if (!response.ok) throw new Error('Error al cargar presupuesto');
      
      const presupuestoCompleto = await response.json();
      
      setFormPresupuesto({
        id: presupuestoCompleto.id,
        numero: presupuestoCompleto.numero,
        fecha: presupuestoCompleto.fecha,
        clienteId: presupuestoCompleto.cliente?.id?.toString() || "",
        estado: presupuestoCompleto.estado || "Pendiente",
        observaciones: presupuestoCompleto.observaciones || "",
        notas: presupuestoCompleto.notas || "",
        serieId: presupuestoCompleto.serie?.id?.toString() || "",
        tarifaId: presupuestoCompleto.tarifa?.id || null,
        almacenId: presupuestoCompleto.almacen?.id || null,
        ventaMultialmacen: presupuestoCompleto.ventaMultialmacen || false,
        descuentoAgrupacion: presupuestoCompleto.descuentoAgrupacion || 0,
        descuentoAgrupacionManual: presupuestoCompleto.descuentoAgrupacion || 0,
        usarCodigoManual: true,
        lineas: (presupuestoCompleto.lineas || []).map(linea => ({
          id: linea.id,
          productoId: linea.producto?.id?.toString() || "",
          nombreProducto: linea.nombreProducto || "",
          referencia: linea.referencia || "",
          cantidad: linea.cantidad || 0,
          precioUnitario: linea.precioUnitario || 0,
          descuento: linea.descuento || 0,
          tipoIvaId: linea.tipoIva?.id?.toString() || "",
          porcentajeIva: linea.porcentajeIva || 0,
          porcentajeRecargo: linea.porcentajeRecargo || 0,
          observaciones: linea.observaciones || "",
          almacenId: linea.almacen?.id || null,
        })),
        direccionFacturacionSnapshot: {
          pais: presupuestoCompleto.direccionFacturacionPais || "",
          codigoPostal: presupuestoCompleto.direccionFacturacionCodigoPostal || "",
          provincia: presupuestoCompleto.direccionFacturacionProvincia || "",
          poblacion: presupuestoCompleto.direccionFacturacionPoblacion || "",
          direccion: presupuestoCompleto.direccionFacturacionDireccion || "",
        },
        direccionEnvioSnapshot: {
          pais: presupuestoCompleto.direccionEnvioPais || "",
          codigoPostal: presupuestoCompleto.direccionEnvioCodigoPostal || "",
          provincia: presupuestoCompleto.direccionEnvioProvincia || "",
          poblacion: presupuestoCompleto.direccionEnvioPoblacion || "",
          direccion: presupuestoCompleto.direccionEnvioDireccion || "",
        },
        adjuntos: presupuestoCompleto.adjuntos || [],
      }, pestanaId);
    } catch (error) {
      console.error('Error al cargar presupuesto para editar:', error);
      alert('Error al cargar el presupuesto');
    }
  }, []);

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

  const abrirModalHistorialDocumento = useCallback(async (presupuesto) => {
    setDocumentoHistorial({ tipo: 'PRESUPUESTO', id: presupuesto.id, numero: presupuesto.numero });
    setModalHistorialAbierto(true);
    setCargandoHistorialModal(true);
    try {
      const historial = await cargarHistorialTransformaciones('PRESUPUESTO', presupuesto.id);
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
    presupuestos,
    documentos: presupuestos, // Alias para compatibilidad con DocumentoVentaListado
    formPresupuesto,
    clientes,
    productos,
    tiposIva,
    loading,
    paginacion,
    seriesDisponibles,
    cargandoSeries,
    guardandoPreferenciaSerie,
    generandoNumero,
    estadoOptions,
    almacenes,
    mostrarSelectorAlmacen,
    permitirVentaMultialmacen,
    tarifasAlbaran,
    // Modal historial
    modalHistorialAbierto,
    documentoHistorial,
    historialModal,
    cargandoHistorialModal,
    abrirModalHistorialDocumento,
    cerrarModalHistorial,
    cargarPresupuestos,
    cargarDocumentos: cargarPresupuestos, // Alias para compatibilidad con DocumentoVentaListado
    updateFormPresupuestoField,
    setDireccionSnapshot,
    updateDireccionSnapshotField,
    agregarLinea,
    eliminarLinea,
    actualizarLinea,
    calcularTotales,
    guardarPresupuesto,
    eliminarPresupuesto,
    duplicarPresupuesto,
    descargarPdf,
    subirAdjunto,
    eliminarAdjunto,
    descargarAdjunto,
    guardarPreferenciaSerie,
    cargarPresupuestoParaEditar,
    setFormPresupuesto,
    limpiarFormularioPestana,
  };
}
