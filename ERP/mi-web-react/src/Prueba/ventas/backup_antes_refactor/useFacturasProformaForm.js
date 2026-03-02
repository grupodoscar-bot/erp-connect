import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useTarifasAlbaran } from "./useTarifasAlbaran";
import { useFacturasProforma as useFacturasProformaListado } from "./useDocumentoVenta";

const API_URL = "http://145.223.103.219:8080/facturas-proforma";
const CLIENTES_API_URL = "http://145.223.103.219:8080/clientes";
const PRODUCTOS_API_URL = "http://145.223.103.219:8080/productos";
const TIPOS_IVA_API_URL = "http://145.223.103.219:8080/tipos-iva";
const TRANSFORMACIONES_API_URL = "http://145.223.103.219:8080/documento-transformaciones";
const ARCHIVOS_API_URL = "http://145.223.103.219:8080/archivos-empresa";
const SERIES_API_URL = "http://145.223.103.219:8080/series";
const SERIES_PREF_API_URL = "http://145.223.103.219:8080/series/preferencias";
const ALMACENES_API_URL = "http://145.223.103.219:8080/almacenes";
const API_URL_CONFIG_VENTAS = "http://145.223.103.219:8080/configuracion-ventas";
const DOCUMENTO_SERIE_TIPO = "FACTURA_PROFORMA";

const ESTADOS_FACTURA_PROFORMA_PREDETERMINADOS = [
  { nombre: "Pendiente", colorClaro: "#FDE68A55", colorOscuro: "#92400E55" },
  { nombre: "Emitido", colorClaro: "#BBF7D055", colorOscuro: "#14532D55" },
  { nombre: "Convertida", colorClaro: "#C7D2FE55", colorOscuro: "#312E8155" },
  { nombre: "Cancelada", colorClaro: "#FECACA55", colorOscuro: "#7F1D1D55" },
];

const formFacturaProformaInicial = {
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

export function useFacturasProformaForm(pestanaActiva = null, session = null) {
  const [facturasProforma, setFacturasProforma] = useState([]);
  // Mapa de formularios por ID de pestaña para permitir múltiples instancias
  const [formulariosPorPestana, setFormulariosPorPestana] = useState({});
  
  // Obtener formulario de la pestaña actual
  const formFacturaProforma = useMemo(() => {
    if (!pestanaActiva) return formFacturaProformaInicial;
    return formulariosPorPestana[pestanaActiva] || formFacturaProformaInicial;
  }, [formulariosPorPestana, pestanaActiva]);
  
  // Función para actualizar el formulario de la pestaña actual
  const setFormFacturaProforma = useCallback((nuevoFormulario, pestanaId = null) => {
    const idPestana = pestanaId || pestanaActiva;
    if (!idPestana) return;
    
    setFormulariosPorPestana(prev => ({
      ...prev,
      [idPestana]: typeof nuevoFormulario === 'function' 
        ? nuevoFormulario(prev[idPestana] || formFacturaProformaInicial)
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
  const [modalHistorialAbierto, setModalHistorialAbierto] = useState(false);
  const [documentoHistorial, setDocumentoHistorial] = useState(null);
  const [historialModal, setHistorialModal] = useState([]);
  const [cargandoHistorialModal, setCargandoHistorialModal] = useState(false);

  const tarifasAlbaran = useTarifasAlbaran(formFacturaProforma, setFormFacturaProforma);

  // Determinar si mostrar selector de almacén (solo si hay más de 1 almacén)
  const mostrarSelectorAlmacen = useMemo(() => almacenes.length > 1, [almacenes]);

  const facturasProformaListado = useFacturasProformaListado({ paginado: false });

  const estadoOptions = ESTADOS_FACTURA_PROFORMA_PREDETERMINADOS;

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
    if (typeof pestanaActiva === 'string' && pestanaActiva.startsWith('factura-proforma-nuevo')) {
      setFormulariosPorPestana(prev => {
        if (!prev[pestanaActiva]) {
          return {
            ...prev,
            [pestanaActiva]: { ...formFacturaProformaInicial }
          };
        }
        return prev;
      });
    }
  }, [pestanaActiva]);

  // Seleccionar automáticamente la serie con orden de prioridad: usuario > sistema > única
  useEffect(() => {
    // SOLO ejecutar para pestañas nuevas, NUNCA para edición
    if (typeof pestanaActiva !== 'string' || !pestanaActiva.startsWith('factura-proforma-nuevo')) return;
    if (seriesDisponibles.length === 0 || formFacturaProforma.serieId) return;
    
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
      setFormFacturaProforma(prev => ({ ...prev, serieId }));
    }
  }, [pestanaActiva, seriesDisponibles, formFacturaProforma.serieId, seriePreferidaUsuario, setFormFacturaProforma]);

  const cargarFacturasProforma = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      if (response.ok) {
        const data = await response.json();
        console.log("DEBUG PROFORMA - Facturas proforma cargadas:", data.length);
        
        // Cargar origen de cada documento
        const facturasProformaConOrigen = await Promise.all((Array.isArray(data) ? data : []).map(async (factura) => {
          try {
            console.log(`DEBUG PROFORMA - Cargando origen para factura proforma ${factura.id}`);
            const resOrigen = await fetch(`${TRANSFORMACIONES_API_URL}/origen-directo/FACTURA_PROFORMA/${factura.id}`);
            console.log(`DEBUG PROFORMA - Respuesta origen factura proforma ${factura.id}:`, resOrigen.status);
            if (resOrigen.ok) {
              const dataOrigen = await resOrigen.json();
              console.log(`DEBUG PROFORMA - Datos origen factura proforma ${factura.id}:`, dataOrigen);
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
                return tipos[tipo] || 'Manual';
              };
              const origenFormateado = formatearTipo(dataOrigen.tipoOrigen);
              console.log(`DEBUG PROFORMA - Origen formateado factura proforma ${factura.id}:`, origenFormateado);
              return { ...factura, origen: origenFormateado };
            }
            return { ...factura, origen: null };
          } catch (err) {
            console.error(`DEBUG PROFORMA - Error cargando origen factura proforma ${factura.id}:`, err);
            return { ...factura, origen: null };
          }
        }));
        
        console.log("DEBUG PROFORMA - Facturas proforma con origen:", facturasProformaConOrigen);
        setFacturasProforma(facturasProformaConOrigen);
        setPaginacion({ totalElements: data.length || 0, totalPages: 1 });
      }
    } catch (error) {
      console.error("Error al cargar facturas proforma:", error);
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

  // Cargar datos solo cuando hay una pestaña de facturas proforma activa
  const [datosInicializados, setDatosInicializados] = useState(false);
  
  // Cargar datos al montar el componente (para vista de listado)
  useEffect(() => {
    cargarFacturasProforma();
  }, []);
  
  useEffect(() => {
    // Solo cargar datos si hay una pestaña de facturas proforma activa y no se han cargado aún
    const esPestanaFacturasProforma = typeof pestanaActiva === 'string' && (
      pestanaActiva.startsWith('factura-proforma-nuevo') || 
      pestanaActiva.startsWith('factura-proforma-editar')
    );
    
    if (esPestanaFacturasProforma && !datosInicializados) {
      setDatosInicializados(true);
      cargarFacturasProforma();
      cargarClientes();
      cargarProductos();
      cargarTiposIva();
      cargarAlmacenes();
      cargarSeries();
      cargarConfiguracionVentas();
    }
  }, [pestanaActiva, datosInicializados, cargarFacturasProforma, cargarClientes, cargarProductos, cargarTiposIva, cargarAlmacenes, cargarSeries, cargarConfiguracionVentas]);

  useEffect(() => {
    // SOLO ejecutar para pestañas nuevas, NUNCA para edición
    if (typeof pestanaActiva !== 'string' || !pestanaActiva.startsWith('factura-proforma-nuevo')) return;
    cargarPreferenciaSerie();
  }, [pestanaActiva, cargarPreferenciaSerie]);

  // Generar número automáticamente cuando se selecciona una serie
  useEffect(() => {
    // SOLO ejecutar para pestañas nuevas, NUNCA para edición
    if (typeof pestanaActiva !== 'string' || !pestanaActiva.startsWith('factura-proforma-nuevo')) return;
    if (!formFacturaProforma.serieId || formFacturaProforma.usarCodigoManual || formFacturaProforma.id) return;

    const generarNumeroAutomatico = async () => {
      setGenerandoNumero(true);
      try {
        const response = await fetch(`${API_URL}/siguiente-numero?serieId=${formFacturaProforma.serieId}`);
        if (response.ok) {
          const data = await response.json();
          setFormFacturaProforma(prev => ({ ...prev, numero: data.numero || data }));
        }
      } catch (error) {
        console.error('Error al generar número:', error);
      } finally {
        setGenerandoNumero(false);
      }
    };

    generarNumeroAutomatico();
  }, [pestanaActiva, formFacturaProforma.serieId, formFacturaProforma.usarCodigoManual, formFacturaProforma.id, setFormFacturaProforma]);

  const updateFormFacturaProformaField = useCallback((field, value) => {
    setFormFacturaProforma((prev) => {
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
  }, [permitirVentaMultialmacen, seriesDisponibles, almacenes, setFormFacturaProforma]);

  // Solo aplicar el descuento de la agrupación del cliente si el campo manual está vacío
  useEffect(() => {
    if (!formFacturaProforma.clienteId) return;

    if (formFacturaProforma.descuentoAgrupacionManual !== null && formFacturaProforma.descuentoAgrupacionManual !== undefined) {
      return;
    }

    const clienteSeleccionado = clientes.find((c) => c.id === parseInt(formFacturaProforma.clienteId));
    const descuentoCliente = clienteSeleccionado?.agrupacion?.descuentoGeneral;

    if (descuentoCliente !== undefined && descuentoCliente !== null) {
      setFormFacturaProforma((prev) => ({
        ...prev,
        descuentoAgrupacionManual: descuentoCliente,
      }));
    }
  }, [formFacturaProforma.clienteId, formFacturaProforma.descuentoAgrupacionManual, clientes]);

  const setDireccionSnapshot = useCallback((tipo, direccion) => {
    const campo = tipo === "facturacion" ? "direccionFacturacionSnapshot" : "direccionEnvioSnapshot";
    setFormFacturaProforma((prev) => ({ ...prev, [campo]: direccion }));
  }, [setFormFacturaProforma]);

  const updateDireccionSnapshotField = useCallback((tipo, field, value) => {
    const campo = tipo === "facturacion" ? "direccionFacturacionSnapshot" : "direccionEnvioSnapshot";
    setFormFacturaProforma((prev) => ({
      ...prev,
      [campo]: { ...(prev[campo] || {}), [field]: value },
    }));
  }, [setFormFacturaProforma]);

  const agregarLinea = useCallback(() => {
    setFormFacturaProforma((prev) => ({
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
  }, [setFormFacturaProforma]);

  const eliminarLinea = useCallback((index) => {
    setFormFacturaProforma((prev) => ({
      ...prev,
      lineas: prev.lineas.filter((_, i) => i !== index),
    }));
  }, [setFormFacturaProforma]);

  const actualizarLinea = useCallback((index, field, value) => {
    setFormFacturaProforma((prev) => {
      const nuevasLineas = [...prev.lineas];
      nuevasLineas[index] = { ...nuevasLineas[index], [field]: value };
      return { ...prev, lineas: nuevasLineas };
    });
  }, [setFormFacturaProforma]);

  // Descuento base de la agrupación del cliente
  const descuentoAgrupacionBase = useMemo(() => {
    if (!formFacturaProforma.clienteId) return 0;
    const cliente = clientes.find(c => c.id === parseInt(formFacturaProforma.clienteId));
    return cliente?.agrupacion?.descuentoGeneral || 0;
  }, [formFacturaProforma.clienteId, clientes]);

  const calcularTotales = useMemo(() => {
    let subtotalBruto = 0;
    let descuentoTotal = 0;
    let totalIva = 0;
    let totalRecargo = 0;
    const desglosePorIva = {};

    formFacturaProforma.lineas.forEach((linea) => {
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
        const porcentajeRecargo = parseFloat(tipoIva.porcentajeRecargo) || 0;
        
        const descuentoAgrupacionPct = parseFloat(formFacturaProforma.descuentoAgrupacionManual ?? formFacturaProforma.descuentoAgrupacion) || 0;
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
    const descuentoAgrupacionPct = parseFloat(formFacturaProforma.descuentoAgrupacionManual ?? formFacturaProforma.descuentoAgrupacion) || 0;
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
  }, [formFacturaProforma.lineas, formFacturaProforma.descuentoAgrupacionManual, formFacturaProforma.descuentoAgrupacion, formFacturaProforma.clienteId, productos, tiposIva, clientes, descuentoAgrupacionBase]);

  const guardarFacturaProforma = useCallback(
    async (e, opciones = {}) => {
      if (e) e.preventDefault();

      // Validar que el número no esté vacío
      if (!formFacturaProforma.numero || formFacturaProforma.numero.trim() === "") {
        alert("El número del documento no puede estar vacío. Selecciona una serie o activa la numeración manual.");
        return;
      }

      try {
        const totales = calcularTotales;
        
        // Convertir snapshots a campos planos para el backend
        const direccionFacturacion = formFacturaProforma.direccionFacturacionSnapshot || {};
        const direccionEnvio = formFacturaProforma.direccionEnvioSnapshot || {};
        
        const payload = {
          ...formFacturaProforma,
          notas: formFacturaProforma.notas || "",
          descuentoAgrupacion: formFacturaProforma.descuentoAgrupacionManual ?? formFacturaProforma.descuentoAgrupacion ?? 0,
          subtotal: parseFloat(totales.subtotal),
          totalIva: parseFloat(totales.totalIva),
          total: parseFloat(totales.total),
          // Campos de almacén, tarifa y venta multialmacén
          almacenId: formFacturaProforma.almacenId || null,
          ventaMultialmacen: formFacturaProforma.ventaMultialmacen || false,
          tarifaId: formFacturaProforma.tarifaId || null,
          // Campos planos de dirección de facturación
          direccionFacturacionPais: direccionFacturacion.pais || "",
          direccionFacturacionCodigoPostal: direccionFacturacion.codigoPostal || "",
          direccionFacturacionProvincia: direccionFacturacion.provincia || "",
          direccionFacturacionPoblacion: direccionFacturacion.poblacion || "",
          direccionFacturacionDireccion: direccionFacturacion.direccion || "",
          // Campos planos de dirección de envío
          direccionEnvioPais: direccionEnvio.pais || "",
          direccionEnvioCodigoPostal: direccionEnvio.codigoPostal || "",
          direccionEnvioProvincia: direccionEnvio.provincia || "",
          direccionEnvioPoblacion: direccionEnvio.poblacion || "",
          direccionEnvioDireccion: direccionEnvio.direccion || "",
          // Eliminar los objetos snapshot del payload
          direccionFacturacionSnapshot: undefined,
          direccionEnvioSnapshot: undefined,
          lineas: formFacturaProforma.lineas.map((linea) => ({
            productoId: parseInt(linea.productoId) || null,
            cantidad: parseFloat(linea.cantidad) || 0,
            precioUnitario: parseFloat(linea.precioUnitario) || 0,
            descuento: parseFloat(linea.descuento) || 0,
            tipoIvaId: parseInt(linea.tipoIvaId) || null,
            observaciones: linea.observaciones || "",
            almacenId: parseInt(linea.almacenId) || null,
          })),
        };

        const url = formFacturaProforma.id ? `${API_URL}/${formFacturaProforma.id}` : API_URL;
        const method = formFacturaProforma.id ? "PUT" : "POST";

        // DEBUG: Log what we're sending
        console.log("DEBUG - Enviando a backend:", {
          url,
          method,
          payload: {
            almacenId: payload.almacenId,
            ventaMultialmacen: payload.ventaMultialmacen,
            tarifaId: payload.tarifaId,
            notas: payload.notas,
            direccionFacturacionPais: payload.direccionFacturacionPais,
            direccionEnvioPais: payload.direccionEnvioPais,
            adjuntosCount: payload.adjuntos?.length || 0,
          }
        });

        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          const facturaGuardada = await response.json();
          
          // Vincular adjuntos al documento recién guardado
          // Si la lista está vacía, se desvinculan todos los adjuntos existentes
          const adjuntosIds = (formFacturaProforma.adjuntos || []).map(a => a.id).filter(id => id && id > 0);
          console.log("DEBUG guardar - adjuntos a vincular:", adjuntosIds);
          try {
            await fetch(`${API_URL}/${facturaGuardada.id}/adjuntos`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(adjuntosIds),
            });
          } catch (e) {
            console.error("Error al vincular adjuntos:", e);
          }
          
          await cargarFacturasProforma();
          
          if (opciones.cerrarDespues) {
            setFormFacturaProforma(formFacturaProformaInicial);
            if (opciones.cerrarPestana) {
              opciones.cerrarPestana();
            }
          } else {
            setFormFacturaProforma(prev => ({
              ...prev,
              id: facturaGuardada.id,
              numero: facturaGuardada.numero,
            }));
          }
          
          alert("Factura proforma guardada correctamente");
        } else {
          const error = await response.text();
          alert(`Error al guardar: ${error}`);
        }
      } catch (error) {
        console.error("Error al guardar factura proforma:", error);
        alert("Error al guardar la factura proforma");
      }
    },
    [formFacturaProforma, calcularTotales, cargarFacturasProforma]
  );

  const eliminarFacturaProforma = useCallback(
    async (id) => {
      try {
        const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        if (response.ok) {
          await cargarFacturasProforma();
        } else {
          throw new Error("Error al eliminar");
        }
      } catch (error) {
        console.error("Error al eliminar factura proforma:", error);
        throw error;
      }
    },
    [cargarFacturasProforma]
  );

  const duplicarFacturaProforma = useCallback(
    async (id) => {
      try {
        const response = await fetch(`${API_URL}/${id}/duplicar`, { method: "POST" });
        if (response.ok) {
          const duplicado = await response.json();
          await cargarFacturasProforma();
          return duplicado;
        } else {
          throw new Error("Error al duplicar");
        }
      } catch (error) {
        console.error("Error al duplicar factura proforma:", error);
        throw error;
      }
    },
    [cargarFacturasProforma]
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
    console.log("DEBUG subirAdjunto - archivo recibido:", file?.name, file?.size, file?.type);
    if (!file || file.size === 0) {
      console.error("DEBUG subirAdjunto - archivo vacío o inválido");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("archivo", file);
      formData.append("rutaCarpeta", "/");
      // Log FormData entries
      for (let [key, value] of formData.entries()) {
        console.log("DEBUG FormData -", key, ":", value instanceof File ? `File(${value.name})` : value);
      }
      console.log("DEBUG subirAdjunto - enviando a:", `${ARCHIVOS_API_URL}/subir`);
      const response = await fetch(`${ARCHIVOS_API_URL}/subir`, {
        method: "POST",
        body: formData,
      });
      console.log("DEBUG subirAdjunto - respuesta status:", response.status);
      if (response.ok) {
        const adjunto = await response.json();
        console.log("DEBUG subirAdjunto - adjunto recibido:", adjunto);
        setFormFacturaProforma((prev) => ({
          ...prev,
          adjuntos: [...(prev.adjuntos || []), adjunto],
        }));
      } else {
        const errorText = await response.text();
        console.error("DEBUG subirAdjunto - error en respuesta:", response.status, errorText);
      }
    } catch (error) {
      console.error("Error al subir adjunto:", error);
    }
  }, []);

  const eliminarAdjunto = useCallback(async (adjuntoId) => {
    // Si es temporal (ID 0 o null), eliminar físicamente del servidor
    if (!adjuntoId || adjuntoId === 0) {
      // Buscar el adjunto temporal para obtener su ID real si existe
      const adjunto = formFacturaProforma.adjuntos?.find(a => a.id === adjuntoId || a.id === 0);
      if (adjunto?.idReal) {
        try {
          await fetch(`${ARCHIVOS_API_URL}/${adjunto.idReal}`, { method: "DELETE" });
        } catch (e) {
          console.error("Error al eliminar adjunto temporal:", e);
        }
      }
    }
    // Siempre quitar del estado local
    setFormFacturaProforma((prev) => ({
      ...prev,
      adjuntos: prev.adjuntos.filter((a) => a.id !== adjuntoId),
    }));
  }, [formFacturaProforma.adjuntos]);

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

  const cargarFacturaProformaParaEditar = useCallback(async (facturaProforma) => {
    const { id, pestanaId } = facturaProforma;
    try {
      const response = await fetch(`${API_URL}/${id}`);
      if (!response.ok) throw new Error('Error al cargar factura proforma');
      
      const facturaCompleta = await response.json();
      console.log('DEBUG LINEAS API:', {
        id: facturaCompleta.id,
        lineas: facturaCompleta.lineas?.length || 0
      });
      
      setFormFacturaProforma({
        id: facturaCompleta.id,
        numero: facturaCompleta.numero,
        fecha: facturaCompleta.fecha,
        clienteId: facturaCompleta.cliente?.id?.toString() || "",
        estado: facturaCompleta.estado || "Pendiente",
        observaciones: facturaCompleta.observaciones || "",
        notas: facturaCompleta.notas || "",
        serieId: facturaCompleta.serie?.id?.toString() || "",
        tarifaId: facturaCompleta.tarifa?.id || null,
        almacenId: facturaCompleta.almacen?.id?.toString() || "",
        ventaMultialmacen: facturaCompleta.ventaMultialmacen || false,
        descuentoAgrupacion: facturaCompleta.descuentoAgrupacion || 0,
        descuentoAgrupacionManual: facturaCompleta.descuentoAgrupacion || 0,
        usarCodigoManual: true,
        lineas: (facturaCompleta.lineas || []).map(linea => ({
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
          pais: facturaCompleta.direccionFacturacionPais || "",
          codigoPostal: facturaCompleta.direccionFacturacionCodigoPostal || "",
          provincia: facturaCompleta.direccionFacturacionProvincia || "",
          poblacion: facturaCompleta.direccionFacturacionPoblacion || "",
          direccion: facturaCompleta.direccionFacturacionDireccion || "",
        },
        direccionEnvioSnapshot: {
          pais: facturaCompleta.direccionEnvioPais || "",
          codigoPostal: facturaCompleta.direccionEnvioCodigoPostal || "",
          provincia: facturaCompleta.direccionEnvioProvincia || "",
          poblacion: facturaCompleta.direccionEnvioPoblacion || "",
          direccion: facturaCompleta.direccionEnvioDireccion || "",
        },
        adjuntos: facturaCompleta.adjuntos || [],
      }, pestanaId);
    } catch (error) {
      console.error('Error al cargar factura proforma para editar:', error);
      alert('Error al cargar la factura proforma');
    }
  }, []);

  const cargarHistorialTransformaciones = useCallback(async (tipo, id) => {
    try {
      const res = await fetch(`${TRANSFORMACIONES_API_URL}/historial/${tipo}/${id}`);
      if (res.ok) {
        return await res.json();
      }
      return [];
    } catch (err) {
      console.error('Error al cargar historial de transformaciones:', err);
      return [];
    }
  }, []);

  const abrirModalHistorialDocumento = useCallback(async (facturaProforma) => {
    setDocumentoHistorial({ tipo: 'FACTURA_PROFORMA', id: facturaProforma.id, numero: facturaProforma.numero });
    setModalHistorialAbierto(true);
    setCargandoHistorialModal(true);
    try {
      const historial = await cargarHistorialTransformaciones('FACTURA_PROFORMA', facturaProforma.id);
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
    facturasProforma,
    documentos: facturasProforma, // Alias para compatibilidad con DocumentoVentaListado
    documentos: facturasProforma, // Alias para compatibilidad con DocumentoVentaListado
    formFacturaProforma,
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
    cargarFacturasProforma,
    cargarDocumentos: cargarFacturasProforma, // Alias para compatibilidad con DocumentoVentaListado
    updateFormFacturaProformaField,
    setDireccionSnapshot,
    updateDireccionSnapshotField,
    agregarLinea,
    eliminarLinea,
    actualizarLinea,
    calcularTotales,
    guardarFacturaProforma,
    eliminarFacturaProforma,
    duplicarFacturaProforma,
    descargarPdf,
    subirAdjunto,
    eliminarAdjunto,
    descargarAdjunto,
    guardarPreferenciaSerie,
    cargarFacturaProformaParaEditar,
    setFormFacturaProforma,
    limpiarFormularioPestana,
  };
}
