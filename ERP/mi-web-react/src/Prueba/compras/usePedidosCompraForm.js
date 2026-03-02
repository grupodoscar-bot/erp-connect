import { useCallback, useMemo, useEffect, useRef, useState } from "react";
import API_ENDPOINTS from '../../config/api';
import { aplicarCondicionesProveedorEnLineas, aplicarCondicionComercialEnLinea } from '../../utils/condicionesProveedores';
import { useTarifasPedidoCompra } from './useTarifasPedidoCompra';

const extraerContenido = (data, fallback = []) => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.content)) return data.content;
  return fallback;
};

const STORAGE_KEY_FORMULARIOS = "pedidos-compra-formularios";

const leerFormulariosPersistidos = () => {
  try {
    const almacenado = sessionStorage.getItem(STORAGE_KEY_FORMULARIOS);
    if (almacenado) {
      return JSON.parse(almacenado);
    }
  } catch (error) {
    console.warn('[PedidosCompra] No se pudo leer formularios persistidos:', error);
  }
  return {};
};

const guardarFormulariosPersistidos = (formularios) => {
  try {
    sessionStorage.setItem(STORAGE_KEY_FORMULARIOS, JSON.stringify(formularios));
  } catch (error) {
    console.warn('[PedidosCompra] No se pudo guardar formularios persistidos:', error);
  }
};

const formPedidoCompraInicial = {
  id: null,
  numero: "",
  fecha: new Date().toISOString().slice(0, 16),
  fechaOriginal: null, // Para tracking de cambios
  proveedorId: "",
  estado: "Pendiente",
  observaciones: "",
  notas: "",
  lineas: [],
  adjuntos: [],
  direccionFacturacionSnapshot: null,
  direccionEnvioSnapshot: null,
  direccionId: "",
  usarCodigoManual: false,
  serieId: "",
  generandoNumero: false,
  tarifaId: null,
  descuentoAgrupacion: 0,
  descuentoAgrupacionManual: null,
  almacenId: null,
  compraMultialmacen: false,
};

const lineaInicial = {
  nombreProducto: "",
  productoId: "",
  referencia: "",
  cantidad: 1,
  precioUnitario: 0,
  descuento: 0,
  observaciones: "",
  tipoIvaId: "",
  almacenId: "",
};

export function usePedidosCompraForm(pestanaActiva = null, session = null) {
  const [pedidosCompra, setPedidosCompra] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [productos, setProductos] = useState([]);
  const [tiposIva, setTiposIva] = useState([]);
  const [almacenes, setAlmacenes] = useState([]);
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formulariosPorPestana, setFormulariosPorPestana] = useState(() => leerFormulariosPersistidos());
  const [permitirCompraMultialmacen, setPermitirCompraMultialmacen] = useState(false);
  const [generandoNumero, setGenerandoNumero] = useState(false);
  const [historialTransformaciones, setHistorialTransformaciones] = useState([]);
  const [cargandoHistorialTransformaciones, setCargandoHistorialTransformaciones] = useState(false);
  // Estados para modal de historial (igual que ventas)
  const [modalHistorialAbierto, setModalHistorialAbierto] = useState(false);
  const [documentoHistorial, setDocumentoHistorial] = useState(null);
  const [historialModal, setHistorialModal] = useState([]);
  const [cargandoHistorialModal, setCargandoHistorialModal] = useState(false);
  const [estadoOptions, setEstadoOptions] = useState([]);
  
  // Hook de tarifas
  const tarifasPedidoCompra = useTarifasPedidoCompra();
  
  const API_URL = API_ENDPOINTS.pedidosCompra;

  const tarifaPorDefectoId = useMemo(() => tarifasPedidoCompra.tarifaPorDefecto?.id?.toString() || "", [tarifasPedidoCompra.tarifaPorDefecto]);

  const setFormPedidoCompra = useCallback((nuevoFormulario, pestanaId = null) => {
    const idPestana = pestanaId || pestanaActiva;
    if (!idPestana) return;
    
    setFormulariosPorPestana(prev => {
      const formularioAnterior = prev[idPestana] || formPedidoCompraInicial;
      const formularioActualizado = typeof nuevoFormulario === 'function'
        ? nuevoFormulario(formularioAnterior)
        : nuevoFormulario;
      const nuevoEstado = {
        ...prev,
        [idPestana]: formularioActualizado,
      };
      guardarFormulariosPersistidos(nuevoEstado);
      return nuevoEstado;
    });
  }, [pestanaActiva]);

  const formPedidoCompra = formulariosPorPestana[pestanaActiva] || formPedidoCompraInicial;

  const sincronizarTarifaHook = useCallback((tarifaId) => {
    if (tarifaId) {
      tarifasPedidoCompra.cambiarTarifa(tarifaId.toString());
    } else if (tarifaPorDefectoId) {
      tarifasPedidoCompra.cambiarTarifa(tarifaPorDefectoId);
    } else {
      tarifasPedidoCompra.resetearTarifaPorDefecto();
    }
  }, [tarifasPedidoCompra, tarifaPorDefectoId]);

  const cambiarTarifaFormulario = useCallback((tarifaId) => {
    let idFinal = tarifaId ? tarifaId.toString() : "";
    if (!idFinal && tarifaPorDefectoId) {
      idFinal = tarifaPorDefectoId;
    }
    setFormPedidoCompra(prev => ({ ...prev, tarifaId: idFinal }));
    sincronizarTarifaHook(idFinal);
    return idFinal;
  }, [setFormPedidoCompra, sincronizarTarifaHook, tarifaPorDefectoId]);

  useEffect(() => {
    if (!formPedidoCompra.tarifaId && tarifaPorDefectoId) {
      cambiarTarifaFormulario(tarifaPorDefectoId);
    }

    if (!formPedidoCompra.serieId && series.length > 0) {
      setFormPedidoCompra(prev => ({ ...prev, serieId: series[0].id?.toString() || prev.serieId }));
    }
  }, [formPedidoCompra.tarifaId, formPedidoCompra.serieId, tarifaPorDefectoId, cambiarTarifaFormulario, series, setFormPedidoCompra]);

  const limpiarFormularioPestana = useCallback((pestanaId) => {
    setFormulariosPorPestana(prev => {
      const nuevo = { ...prev };
      delete nuevo[pestanaId];
      guardarFormulariosPersistidos(nuevo);
      return nuevo;
    });
  }, []);

  const cargarPedidosCompra = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}?size=1000`);
      if (response.ok) {
        const data = await response.json();
        const pedidos = data.content || [];
        
        // Cargar origen de cada documento (igual que ventas)
        const pedidosConOrigen = await Promise.all(pedidos.map(async (pedido) => {
          try {
            const resOrigen = await fetch(`${API_ENDPOINTS.documentoTransformaciones}/origen-directo/PEDIDO_COMPRA/${pedido.id}`);
            if (resOrigen.ok) {
              const dataOrigen = await resOrigen.json();
              const formatearOrigen = (data) => {
                const tipos = {
                  'PRESUPUESTO_COMPRA': 'Presupuesto Compra',
                  'PEDIDO_COMPRA': 'Pedido Compra',
                  'ALBARAN_COMPRA': 'Albarán Compra',
                  'FACTURA_COMPRA': 'Factura Compra',
                  'MANUAL': 'Manual'
                };
                return tipos[data.tipoOrigen] || 'Manual';
              };
              return { ...pedido, origen: formatearOrigen(dataOrigen) };
            }
            return { ...pedido, origen: null };
          } catch (err) {
            return { ...pedido, origen: null };
          }
        }));
        
        setPedidosCompra(pedidosConOrigen);
      }
    } catch (error) {
      console.error('Error al cargar pedidos de compra:', error);
    } finally {
      setLoading(false);
    }
  }, [API_URL, tarifasPedidoCompra]);

  const cargarPedidoCompra = useCallback(async (id) => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/${id}`);
      if (response.ok) {
        const pedido = await response.json();
        
        // Construir snapshots de dirección desde campos planos del backend
        const direccionEnvioSnapshot = {
          pais: pedido.direccionEnvioPais || "",
          codigoPostal: pedido.direccionEnvioCodigoPostal || "",
          provincia: pedido.direccionEnvioProvincia || "",
          poblacion: pedido.direccionEnvioPoblacion || "",
          direccion: pedido.direccionEnvioDireccion || "",
        };
        
        const direccionFacturacionSnapshot = {
          pais: pedido.direccionFacturacionPais || "",
          codigoPostal: pedido.direccionFacturacionCodigoPostal || "",
          provincia: pedido.direccionFacturacionProvincia || "",
          poblacion: pedido.direccionFacturacionPoblacion || "",
          direccion: pedido.direccionFacturacionDireccion || "",
        };
        
        // Mapear el pedido al formato del formulario
        let tarifaFormulario = pedido.tarifa?.id?.toString() || pedido.tarifaId?.toString() || tarifaPorDefectoId;
        const serieFormulario = pedido.serie?.id?.toString() || pedido.serieId?.toString() || "";

        // Convertir fecha ISO a formato datetime-local (YYYY-MM-DDTHH:mm)
        const fechaLocal = pedido.fecha 
          ? new Date(pedido.fecha).toISOString().slice(0, 16)
          : new Date().toISOString().slice(0, 16);

        const formateado = {
          ...formPedidoCompraInicial,
          ...pedido,
          id: pedido.id,
          fecha: fechaLocal,
          fechaOriginal: fechaLocal, // Guardar fecha original para comparación
          proveedorId: pedido.proveedor?.id?.toString() || pedido.proveedorId?.toString() || "",
          // Extraer tarifaId y almacenId de objetos anidados
          tarifaId: tarifaFormulario,
          almacenId: pedido.almacen?.id?.toString() || pedido.almacenId?.toString() || "",
          serieId: serieFormulario,
          // Mapear líneas con tipoIvaId
          lineas: (pedido.lineas || []).map(linea => ({
            ...linea,
            productoId: linea.producto?.id?.toString() || linea.productoId?.toString() || "",
            tipoIvaId: linea.tipoIva?.id?.toString() || linea.tipoIvaId?.toString() || "",
            almacenId: linea.almacen?.id?.toString() || linea.almacenId?.toString() || "",
          })),
          adjuntos: pedido.adjuntos || [],
          // Mapear descuentoAgrupacion a descuentoAgrupacionManual
          descuentoAgrupacionManual: pedido.descuentoAgrupacion ?? null,
          // Restaurar snapshots de direcciones desde campos planos
          direccionEnvioSnapshot,
          direccionFacturacionSnapshot,
          direccionId: pedido.direccionId?.toString() || "",
        };
        setFormPedidoCompra(formateado);

        sincronizarTarifaHook(formateado.tarifaId);
        return pedido;
      }
    } catch (error) {
      console.error('Error al cargar pedido de compra:', error);
    } finally {
      setLoading(false);
    }
  }, [API_URL, tarifaPorDefectoId, sincronizarTarifaHook]);

  const cargarProveedores = useCallback(async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.proveedores}?size=1000`);
      if (response.ok) {
        const data = await response.json();
        const proveedoresNormalizados = extraerContenido(data);
        setProveedores(proveedoresNormalizados);
        console.log('[PedidosCompra] Proveedores cargados:', proveedoresNormalizados.length);
      }
    } catch (error) {
      console.error('Error al cargar proveedores:', error);
    }
  }, []);

  const cargarProductos = useCallback(async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.productos}?size=10000`);
      if (response.ok) {
        const data = await response.json();
        const productosNormalizados = extraerContenido(data);
        setProductos(productosNormalizados);
        console.log('[PedidosCompra] Productos cargados:', productosNormalizados.length);
      }
    } catch (error) {
      console.error('Error al cargar productos:', error);
    }
  }, []);

  const cargarTiposIva = useCallback(async () => {
    try {
      const response = await fetch(API_ENDPOINTS.tiposIva);
      if (response.ok) {
        const data = await response.json();
        setTiposIva(data);
      }
    } catch (error) {
      console.error('Error al cargar tipos de IVA:', error);
    }
  }, []);

  const cargarAlmacenes = useCallback(async () => {
    try {
      const response = await fetch(API_ENDPOINTS.almacenes);
      if (response.ok) {
        const data = await response.json();
        setAlmacenes(data);
      }
    } catch (error) {
      console.error('Error al cargar almacenes:', error);
    }
  }, []);

  const cargarSeries = useCallback(async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.series}?tipoDocumento=PEDIDO_COMPRA`);
      if (response.ok) {
        const data = await response.json();
        setSeries(data);
      }
    } catch (error) {
      console.error('Error al cargar series:', error);
    }
  }, []);

  const cargarConfiguracion = useCallback(async () => {
    try {
      const response = await fetch(API_ENDPOINTS.configuracionVentas);
      if (response.ok) {
        const data = await response.json();
        setPermitirCompraMultialmacen(data.permitirVentaMultialmacen || false);
        // Cargar estados desde configuración
        if (data.estadosAlbaran && Array.isArray(data.estadosAlbaran) && data.estadosAlbaran.length > 0) {
          setEstadoOptions(data.estadosAlbaran);
        }
      }
    } catch (error) {
      console.error('Error al cargar configuración:', error);
    }
  }, []);

  const generarNumeroAutomatico = useCallback(async (serieIdParam) => {
    // Usar el serieId del parámetro o del estado del formulario
    const serieId = serieIdParam || formPedidoCompra.serieId;
    
    // Si ya hay un número generado, no generar uno nuevo (evita saltos al pulsar 2 veces)
    if (formPedidoCompra.numero && formPedidoCompra.numero.trim() !== "") {
      console.log('[DEBUG] Ya hay un número asignado, no se genera nuevo:', formPedidoCompra.numero);
      return;
    }
    
    if (!serieId) {
      console.log('[DEBUG] No serieId available, clearing numero');
      setFormPedidoCompra(prev => ({ ...prev, numero: "" }));
      return;
    }

    setGenerandoNumero(true);
    try {
      // Asegurar que serieId sea un string/number, no un objeto
      let serieIdStr;
      if (typeof serieId === 'object') {
        console.log('[DEBUG] serieId is object:', serieId);
        serieIdStr = serieId.id?.toString() || serieId.toString();
      } else {
        serieIdStr = serieId.toString();
      }
      
      console.log('[DEBUG] Using serieIdStr:', serieIdStr);
      
      const params = new URLSearchParams({ serieId: serieIdStr, tipo: "PEDIDO_COMPRA" });
      const url = `${API_ENDPOINTS.series}/generar-numero?${params.toString()}`;
      console.log('[DEBUG] Fetching URL:', url);
      
      const response = await fetch(url);
      console.log('[DEBUG] Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('[DEBUG] Response data:', data);
        if (data?.numeroGenerado) {
          setFormPedidoCompra(prev => ({ ...prev, numero: data.numeroGenerado, usarCodigoManual: false }));
        }
      } else {
        const errorText = await response.text();
        console.error('[DEBUG] Error response:', errorText);
      }
    } catch (error) {
      console.error('[DEBUG] Error in generarNumeroAutomatico:', error);
    } finally {
      setGenerandoNumero(false);
    }
  }, [formPedidoCompra.serieId, formPedidoCompra.numero]);

  useEffect(() => {
    cargarPedidosCompra();
    cargarProveedores();
    cargarProductos();
    cargarTiposIva();
    cargarAlmacenes();
    cargarSeries();
    cargarConfiguracion();
  }, []);

  const cargarHistorialTransformaciones = useCallback(async (tipoDocumentoOrId, documentoIdParam) => {
    let tipoDocumento = 'PEDIDO_COMPRA';
    let documentoId = documentoIdParam;

    if (documentoId === undefined) {
      documentoId = tipoDocumentoOrId;
    } else if (tipoDocumentoOrId) {
      tipoDocumento = tipoDocumentoOrId;
    }

    if (!documentoId) {
      setHistorialTransformaciones([]);
      return [];
    }

    setCargandoHistorialTransformaciones(true);
    try {
      const res = await fetch(`${API_ENDPOINTS.documentoTransformaciones}/historial/${tipoDocumento}/${documentoId}`);
      if (res.ok) {
        const data = await res.json();
        setHistorialTransformaciones(Array.isArray(data) ? data : []);
        return data;
      }
      setHistorialTransformaciones([]);
      return [];
    } catch (err) {
      console.error('[PedidosCompra] Error cargando historial:', err);
      setHistorialTransformaciones([]);
      return [];
    } finally {
      setCargandoHistorialTransformaciones(false);
    }
  }, []);

  // Funciones para modal de historial (igual que ventas)
  const abrirModalHistorialDocumento = useCallback(async (documento) => {
    setDocumentoHistorial({ tipo: 'PEDIDO_COMPRA', id: documento.id, numero: documento.numero });
    setModalHistorialAbierto(true);
    setCargandoHistorialModal(true);
    try {
      const historial = await cargarHistorialTransformaciones('PEDIDO_COMPRA', documento.id);
      setHistorialModal(historial || []);
    } catch (err) {
      console.error('Error al cargar historial para modal:', err);
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

  useEffect(() => {
    if (formPedidoCompra.id) {
      cargarHistorialTransformaciones('PEDIDO_COMPRA', formPedidoCompra.id);
    } else {
      setHistorialTransformaciones([]);
    }
  }, [formPedidoCompra.id, cargarHistorialTransformaciones]);

  const updateFormPedidoCompraField = useCallback(async (field, value) => {
    if (field === 'proveedorId' && value) {
      const proveedorSeleccionado = proveedores.find(p => p.id === parseInt(value));
      const nuevaTarifaId = proveedorSeleccionado?.tarifaAsignada?.id?.toString()
        || formPedidoCompra.tarifaId
        || tarifaPorDefectoId;
      
      setFormPedidoCompra(prev => {
        let nuevoForm = { ...prev, [field]: value };
        
        if (proveedorSeleccionado?.agrupacion?.id) {
          const descuentoAgrupacion = parseFloat(proveedorSeleccionado.agrupacion.descuentoGeneral) || 0;
          nuevoForm.descuentoAgrupacionManual = descuentoAgrupacion;
          
          nuevoForm.tarifaId = nuevaTarifaId;
          
          if (prev.lineas && prev.lineas.length > 0) {
            const tarifaParaCondiciones = nuevaTarifaId || tarifasPedidoCompra.tarifaSeleccionada?.id;
            aplicarCondicionesProveedorEnLineas({
              lineas: prev.lineas,
              proveedorId: value,
              proveedorConAgrupacion: proveedorSeleccionado,
              proveedores: proveedores,
              productos: productos,
              condicionesApiUrl: API_ENDPOINTS.condicionesComerciales + '-proveedor',
              tarifaId: tarifaParaCondiciones ? parseInt(tarifaParaCondiciones) : undefined,
              obtenerPrecioTarifa: tarifasPedidoCompra.obtenerPrecioProducto,
            }).then(lineasActualizadas => {
              setFormPedidoCompra(prevForm => ({
                ...prevForm,
                lineas: lineasActualizadas
              }));
            }).catch(err => {
              console.error('Error al aplicar condiciones comerciales de proveedor:', err);
            });
          }
        } else {
          nuevoForm.descuentoAgrupacionManual = 0;
          nuevoForm.tarifaId = nuevaTarifaId;
        }
        
        return nuevoForm;
      });

      sincronizarTarifaHook(nuevaTarifaId);
    } else if (field === 'proveedorId' && !value) {
      setFormPedidoCompra(prev => ({ ...prev, proveedorId: "", descuentoAgrupacionManual: 0 }));
      cambiarTarifaFormulario(null);
    } else if (field === 'serieId' && value) {
      // Al cambiar serie, asignar almacén predeterminado si la serie lo tiene
      setFormPedidoCompra(prev => {
        let nuevoForm = { ...prev, [field]: value };
        
        if (!permitirCompraMultialmacen) {
          const serieSeleccionada = series.find(s => s.id === parseInt(value));
          if (serieSeleccionada?.almacenPredeterminado?.id) {
            nuevoForm.almacenId = serieSeleccionada.almacenPredeterminado.id.toString();
          } else if (almacenes.length > 0) {
            nuevoForm.almacenId = almacenes[0].id.toString();
          }
          nuevoForm.compraMultialmacen = false;
        }
        
        return nuevoForm;
      });

      // Ya no generamos número automáticamente al cambiar serie
      // El usuario debe pulsar el botón "Generar número" explícitamente
    } else {
      setFormPedidoCompra(prev => ({ ...prev, [field]: value }));
    }
  }, [setFormPedidoCompra, proveedores, productos, series, almacenes, permitirCompraMultialmacen, sincronizarTarifaHook, cambiarTarifaFormulario, formPedidoCompra.tarifaId, tarifasPedidoCompra.obtenerPrecioProducto, tarifasPedidoCompra.tarifaSeleccionada?.id, tarifaPorDefectoId]);

  const setDireccionSnapshot = useCallback((tipo, valores) => {
    const campo = tipo === "facturacion" ? "direccionFacturacionSnapshot" : "direccionEnvioSnapshot";
    setFormPedidoCompra(prev => ({
      ...prev,
      [campo]: valores,
    }));
  }, [setFormPedidoCompra]);

  const updateDireccionSnapshotField = useCallback((tipo, campo, valor) => {
    const campoSnapshot = tipo === "facturacion" ? "direccionFacturacionSnapshot" : "direccionEnvioSnapshot";
    setFormPedidoCompra(prev => ({
      ...prev,
      [campoSnapshot]: {
        ...prev[campoSnapshot],
        [campo]: valor,
      },
    }));
  }, [setFormPedidoCompra]);

  const agregarLinea = useCallback(() => {
    setFormPedidoCompra(prev => ({
      ...prev,
      lineas: [...prev.lineas, { ...lineaInicial }],
    }));
  }, [setFormPedidoCompra]);

  const eliminarLinea = useCallback((index) => {
    setFormPedidoCompra(prev => ({
      ...prev,
      lineas: prev.lineas.filter((_, i) => i !== index),
    }));
  }, [setFormPedidoCompra]);

  const actualizarLinea = useCallback(async (index, field, value) => {
    // Si es selección de producto, obtener precio de compra desde la tarifa
    if (field === "productoId" && value) {
      const producto = productos.find(p => p.id === parseInt(value));
      if (producto) {
        // Obtener precio de compra desde la tarifa seleccionada
        let precioCompra = producto.precioCompra || producto.precio || 0;
        let descuento = 0;
        const tipoIvaProducto = producto.tipoIva?.id?.toString() || "";
        const porcentajeIvaProducto = producto.tipoIva?.porcentajeIva || 0;
        const porcentajeRecargoProducto = producto.tipoIva?.porcentajeRecargo || 0;

        try {
          const precioData = await tarifasPedidoCompra.obtenerPrecioProducto(value);
          if (precioData) {
            precioCompra = parseFloat(precioData.precio) || precioCompra;
            descuento = parseFloat(precioData.descuento) || 0;
            console.log('[PedidosCompra] Precio de tarifa obtenido:', precioCompra, 'descuento:', descuento);
          }
        } catch (err) {
          console.warn('[PedidosCompra] No se pudo obtener precio de tarifa, usando precio del producto:', err);
        }

        const lineasPrevias = formPedidoCompra.lineas || [];
        const nuevasLineas = [...lineasPrevias];
        nuevasLineas[index] = {
          ...nuevasLineas[index],
          [field]: value,
          precioUnitario: precioCompra,
          descuento: descuento,
          tipoIvaId: tipoIvaProducto,
          porcentajeIva: porcentajeIvaProducto,
          porcentajeRecargo: porcentajeRecargoProducto,
          referencia: producto.referencia || "",
          nombreProducto: producto.nombre || "",
        };

        setFormPedidoCompra(prev => ({ ...prev, lineas: nuevasLineas }));

        // Aplicar condiciones comerciales de proveedor si hay proveedor seleccionado
        if (formPedidoCompra.proveedorId) {
          const proveedorSeleccionado = proveedores.find(p => p.id === parseInt(formPedidoCompra.proveedorId));
          if (proveedorSeleccionado?.agrupacion?.id) {
            try {
              const lineasConCondiciones = await aplicarCondicionesProveedorEnLineas({
                lineas: nuevasLineas,
                proveedorId: formPedidoCompra.proveedorId,
                proveedorConAgrupacion: proveedorSeleccionado,
                proveedores: proveedores,
                productos: productos,
                condicionesApiUrl: API_ENDPOINTS.condicionesComerciales + '-proveedor',
                tarifaId: tarifasPedidoCompra.tarifaSeleccionada?.id,
                obtenerPrecioTarifa: tarifasPedidoCompra.obtenerPrecioProducto,
              });
              setFormPedidoCompra(prev => ({ ...prev, lineas: lineasConCondiciones }));
            } catch (err) {
              console.error('Error al aplicar condiciones comerciales de proveedor:', err);
            }
          }
        }
      }
      return;
    }
    
    const lineasPrevias = formPedidoCompra.lineas || [];
    const nuevasLineasGenerales = [...lineasPrevias];
    nuevasLineasGenerales[index] = { ...nuevasLineasGenerales[index], [field]: value };
    setFormPedidoCompra(prev => ({ ...prev, lineas: nuevasLineasGenerales }));
    
    // Si cambia la cantidad, aplicar condiciones comerciales
    if (field === "cantidad" && formPedidoCompra.proveedorId) {
      const proveedorSeleccionado = proveedores.find(p => p.id === parseInt(formPedidoCompra.proveedorId));
      if (proveedorSeleccionado?.agrupacion?.id) {
        try {
          const lineasActualizadas = await aplicarCondicionComercialEnLinea({
            index,
            lineas: nuevasLineasGenerales,
            proveedorId: formPedidoCompra.proveedorId,
            proveedorConAgrupacion: proveedorSeleccionado,
            proveedores: proveedores,
            productos: productos,
            condicionesApiUrl: API_ENDPOINTS.condicionesComerciales + '-proveedor',
            tarifaId: tarifasPedidoCompra.tarifaSeleccionada?.id,
            obtenerPrecioTarifa: tarifasPedidoCompra.obtenerPrecioProducto,
          });
          setFormPedidoCompra(prev => ({ ...prev, lineas: lineasActualizadas }));
        } catch (err) {
          console.error('Error al aplicar condición comercial por cantidad:', err);
        }
      }
    }
  }, [productos, tarifasPedidoCompra, formPedidoCompra.proveedorId, formPedidoCompra.lineas, proveedores, setFormPedidoCompra]);

  const calcularTotales = useMemo(() => {
    let subtotalBruto = 0;
    let descuentoTotal = 0;
    let totalIva = 0;
    let totalRecargo = 0;
    const desglosePorIva = {};

    formPedidoCompra.lineas.forEach((linea) => {
      const cantidad = parseFloat(linea.cantidad) || 0;
      const precio = parseFloat(linea.precioUnitario) || 0;
      const descuento = parseFloat(linea.descuento) || 0;

      const bruto = cantidad * precio;
      const descuentoImporte = bruto * (descuento / 100);
      const baseLinea = bruto - descuentoImporte;
      
      subtotalBruto += bruto;
      descuentoTotal += descuentoImporte;

      const tipoIva = tiposIva.find((t) => t.id === parseInt(linea.tipoIvaId));
      if (tipoIva) {
        const porcentajeIva = parseFloat(tipoIva.porcentajeIva) || 0;
        const porcentajeRecargo = parseFloat(tipoIva.porcentajeRecargo) || 0;
        const descuentoAgrupacionPct = parseFloat(formPedidoCompra.descuentoAgrupacionManual) || 0;
        const baseConAgrupacion = baseLinea * (1 - descuentoAgrupacionPct / 100);
        
        const ivaLinea = baseConAgrupacion * (porcentajeIva / 100);
        const recargoLinea = baseConAgrupacion * (porcentajeRecargo / 100);
        totalIva += ivaLinea;
        totalRecargo += recargoLinea;
        
        const claveIva = `${porcentajeIva}_${porcentajeRecargo}`;
        if (!desglosePorIva[claveIva]) {
          desglosePorIva[claveIva] = {
            porcentajeIva,
            porcentajeRecargo,
            baseAntesDescuento: 0,
            descuentoAgrupacionImporte: 0,
            baseImponible: 0,
            importeIva: 0,
            importeRecargo: 0,
            nombreIva: tipoIva.nombre || `IVA ${porcentajeIva}%`,
          };
        }
        const descuentoAgrupacionLinea = baseLinea - baseConAgrupacion;
        desglosePorIva[claveIva].baseAntesDescuento += baseLinea;
        desglosePorIva[claveIva].descuentoAgrupacionImporte += descuentoAgrupacionLinea;
        desglosePorIva[claveIva].baseImponible += baseConAgrupacion;
        desglosePorIva[claveIva].importeIva += ivaLinea;
        desglosePorIva[claveIva].importeRecargo += recargoLinea;
      }
    });

    const subtotal = subtotalBruto - descuentoTotal;
    const descuentoAgrupacionPct = parseFloat(formPedidoCompra.descuentoAgrupacionManual) || 0;
    const descuentoAgrupacionImporte = subtotal * (descuentoAgrupacionPct / 100);
    const totalBaseSinImpuestos = subtotal - descuentoAgrupacionImporte;
    const total = totalBaseSinImpuestos + totalIva + totalRecargo;

    // Calcular descuento base de la agrupación del proveedor
    const descuentoAgrupacionBase = (() => {
      if (!formPedidoCompra.proveedorId) return 0;
      const proveedor = proveedores.find(p => p.id === parseInt(formPedidoCompra.proveedorId));
      return proveedor?.agrupacion?.descuentoGeneral || 0;
    })();

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
      desgloseIva: Object.values(desglosePorIva),
    };
  }, [formPedidoCompra.lineas, formPedidoCompra.descuentoAgrupacionManual, formPedidoCompra.proveedorId, proveedores, tiposIva]);

  const guardarPedidoCompra = useCallback(async (e, opciones = {}) => {
    if (e) e.preventDefault();

    try {
      const totales = calcularTotales;
      const direccionEnvio = formPedidoCompra.direccionEnvioSnapshot || {};
      const direccionFacturacion = formPedidoCompra.direccionFacturacionSnapshot || {};
      
      // Solo enviar fecha si fue modificada (comparar con fechaOriginal)
      const fechaModificada = formPedidoCompra.fecha !== formPedidoCompra.fechaOriginal;
      const fechaFormateada = fechaModificada 
        ? new Date(formPedidoCompra.fecha).toISOString()
        : null; // null = backend preservará la fecha existente
      
      const payload = {
        id: formPedidoCompra.id || null,
        numero: formPedidoCompra.numero || "",
        fecha: fechaFormateada,
        proveedorId: parseInt(formPedidoCompra.proveedorId) || null,
        estado: formPedidoCompra.estado,
        observaciones: formPedidoCompra.observaciones || "",
        notas: formPedidoCompra.notas || "",
        descuentoAgrupacion: formPedidoCompra.descuentoAgrupacionManual ?? 0,
        subtotal: parseFloat(totales.subtotal),
        total: parseFloat(totales.total),
        descuentoTotal: parseFloat(totales.descuentoTotal),
        serieId: formPedidoCompra.serieId ? parseInt(formPedidoCompra.serieId) : null,
        tarifaId: formPedidoCompra.tarifaId ? parseInt(formPedidoCompra.tarifaId) : null,
        almacenId: formPedidoCompra.almacenId ? parseInt(formPedidoCompra.almacenId) : null,
        compraMultialmacen: formPedidoCompra.compraMultialmacen || false,
        direccionEnvioPais: direccionEnvio.pais || "",
        direccionEnvioCodigoPostal: direccionEnvio.codigoPostal || "",
        direccionEnvioProvincia: direccionEnvio.provincia || "",
        direccionEnvioPoblacion: direccionEnvio.poblacion || "",
        direccionEnvioDireccion: direccionEnvio.direccion || "",
        direccionFacturacionPais: direccionFacturacion.pais || "",
        direccionFacturacionCodigoPostal: direccionFacturacion.codigoPostal || "",
        direccionFacturacionProvincia: direccionFacturacion.provincia || "",
        direccionFacturacionPoblacion: direccionFacturacion.poblacion || "",
        direccionFacturacionDireccion: direccionFacturacion.direccion || "",
        direccionId: formPedidoCompra.direccionId ? parseInt(formPedidoCompra.direccionId) : null,
        recargoEquivalencia: formPedidoCompra.recargoEquivalencia || false,
        lineas: formPedidoCompra.lineas.map((linea) => {
          const tipoIva = tiposIva.find(t => t.id === parseInt(linea.tipoIvaId));
          const cantidad = parseFloat(linea.cantidad) || 0;
          const precio = parseFloat(linea.precioUnitario) || 0;
          const descuento = parseFloat(linea.descuento) || 0;
          const descuentoAgrupacionPct = parseFloat(formPedidoCompra.descuentoAgrupacionManual) || 0;
          
          const bruto = cantidad * precio;
          const descuentoImporte = bruto * (descuento / 100);
          const baseLinea = bruto - descuentoImporte;
          const baseConAgrupacion = baseLinea * (1 - descuentoAgrupacionPct / 100);
          
          const porcentajeIva = parseFloat(tipoIva?.porcentajeIva) || 0;
          const porcentajeRecargo = parseFloat(tipoIva?.porcentajeRecargo) || 0;
          const importeIva = baseConAgrupacion * (porcentajeIva / 100);
          const importeRecargo = baseConAgrupacion * (porcentajeRecargo / 100);
          
          return {
            productoId: parseInt(linea.productoId) || null,
            nombreProducto: linea.nombreProducto || "",
            referencia: linea.referencia || "",
            cantidad: cantidad,
            precioUnitario: precio,
            descuento: descuento,
            tipoIvaId: parseInt(linea.tipoIvaId) || null,
            porcentajeIva: porcentajeIva,
            porcentajeRecargo: porcentajeRecargo,
            importeIva: importeIva,
            importeRecargo: importeRecargo,
            observaciones: linea.observaciones || "",
            almacenId: parseInt(linea.almacenId) || null,
          };
        }),
      };

      console.log('[PedidosCompra] Payload a enviar:', payload);

      const url = formPedidoCompra.id ? `${API_URL}/${formPedidoCompra.id}` : API_URL;
      const method = formPedidoCompra.id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log('[PedidosCompra] Respuesta guardar:', response.status);

      if (response.ok) {
        const pedidoGuardado = await response.json();
        
        const adjuntosIds = (formPedidoCompra.adjuntos || []).map(a => a.id).filter(id => id && id > 0);
        if (adjuntosIds.length > 0) {
          try {
            await fetch(`${API_URL}/${pedidoGuardado.id}/adjuntos`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(adjuntosIds),
            });
          } catch (e) {
            console.error("Error al vincular adjuntos:", e);
          }
        }
        
        await cargarPedidosCompra();
        
        if (opciones.cerrarDespues && opciones.cerrarPestana) {
          opciones.cerrarPestana();
        }
        
        alert("Pedido de compra guardado correctamente");
      } else {
        const error = await response.text();
        alert(`Error al guardar: ${error}`);
      }
    } catch (error) {
      console.error("Error al guardar pedido de compra:", error);
      alert("Error al guardar el pedido de compra");
    }
  }, [formPedidoCompra, calcularTotales, cargarPedidosCompra, API_URL, tiposIva]);

  const eliminarPedidoCompra = useCallback(async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (response.ok) {
        await cargarPedidosCompra();
      } else {
        throw new Error("Error al eliminar");
      }
    } catch (error) {
      console.error("Error al eliminar pedido de compra:", error);
      throw error;
    }
  }, [cargarPedidosCompra, API_URL]);

  const mostrarSelectorAlmacen = useMemo(() => almacenes.length > 1, [almacenes]);

  // ========== TARIFAS Y PRECIOS ==========
  const recalcularPreciosLineas = useCallback(async () => {
    const lineasActuales = formPedidoCompra.lineas;
    if (!lineasActuales || lineasActuales.length === 0) return;
    
    const lineasActualizadas = await Promise.all(
      lineasActuales.map(async (linea) => {
        if (!linea.productoId) return linea;
        
        // No modificar líneas con condiciones comerciales aplicadas
        if (linea.tieneCondicionComercial === true) {
          return linea;
        }
        
        try {
          const precioData = await tarifasPedidoCompra.obtenerPrecioProducto(linea.productoId);
          if (precioData) {
            return {
              ...linea,
              precioUnitario: parseFloat(precioData.precio) || linea.precioUnitario,
              descuento: parseFloat(precioData.descuento) || linea.descuento,
            };
          }
        } catch (err) {
          console.error(`Error al obtener precio para producto ${linea.productoId}:`, err);
        }
        return linea;
      })
    );
    
    setFormPedidoCompra(prev => ({ ...prev, lineas: lineasActualizadas }));
  }, [formPedidoCompra.lineas, tarifasPedidoCompra, setFormPedidoCompra]);

  // ========== ADJUNTOS ==========
  const ARCHIVOS_API_URL = API_ENDPOINTS.archivosEmpresa;

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
        setFormPedidoCompra((prev) => ({
          ...prev,
          adjuntos: [...(prev.adjuntos || []), adjunto],
        }));
      }
    } catch (error) {
      console.error("Error al subir adjunto:", error);
    }
  }, [ARCHIVOS_API_URL, setFormPedidoCompra]);

  const eliminarAdjunto = useCallback(async (adjuntoId) => {
    // Si tiene un ID real (no es temporal), eliminar del servidor primero
    if (adjuntoId && adjuntoId !== 0) {
      try {
        await fetch(`${ARCHIVOS_API_URL}/${adjuntoId}`, { method: "DELETE" });
      } catch (e) {
        console.error("Error al eliminar adjunto del servidor:", e);
      }
    }
    // Si es un adjunto temporal (id === 0), buscar su idReal
    if (adjuntoId === 0) {
      const adjunto = formPedidoCompra.adjuntos?.find(a => a.id === adjuntoId || a.id === 0);
      if (adjunto?.idReal) {
        try {
          await fetch(`${ARCHIVOS_API_URL}/${adjunto.idReal}`, { method: "DELETE" });
        } catch (e) {
          console.error("Error al eliminar adjunto temporal:", e);
        }
      }
    }
    // Eliminar del estado local
    setFormPedidoCompra((prev) => ({
      ...prev,
      adjuntos: prev.adjuntos.filter((a) => a.id !== adjuntoId),
    }));
  }, [formPedidoCompra.adjuntos, ARCHIVOS_API_URL, setFormPedidoCompra]);

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
  }, [ARCHIVOS_API_URL]);

  // Calcular totales de todos los pedidos filtrados
  const totalesFiltrados = useMemo(() => {
    const base = pedidosCompra.reduce((sum, p) => sum + (p.totalBaseSinImpuestos || p.subtotal || 0), 0);
    const iva = pedidosCompra.reduce((sum, p) => sum + (p.totalIva || 0), 0);
    const recargo = pedidosCompra.reduce((sum, p) => sum + (p.totalRecargo || 0), 0);
    const total = pedidosCompra.reduce((sum, p) => sum + (p.total || 0), 0);
    return { base, iva, recargo, total, count: pedidosCompra.length };
  }, [pedidosCompra]);

  return {
    pedidosCompra,
    documentos: pedidosCompra,
    formPedidoCompra,
    setFormPedidoCompra,
    proveedores,
    productos,
    tiposIva,
    almacenes,
    series,
    loading,
    estadoOptions,
    cargarPedidosCompra,
    cargarPedidoCompra,
    updateFormPedidoCompraField,
    setDireccionSnapshot,
    updateDireccionSnapshotField,
    agregarLinea,
    eliminarLinea,
    actualizarLinea,
    calcularTotales,
    guardarPedidoCompra,
    eliminarPedidoCompra,
    limpiarFormularioPestana,
    permitirCompraMultialmacen,
    mostrarSelectorAlmacen,
    generandoNumero,
    generarNumeroAutomatico,
    subirAdjunto,
    eliminarAdjunto,
    descargarAdjunto,
    tarifasPedidoCompra,
    cambiarTarifaFormulario,
    recalcularPreciosLineas,
    historialTransformaciones,
    cargandoHistorialTransformaciones,
    cargarHistorialTransformaciones,
    // Modal historial (igual que ventas)
    modalHistorialAbierto,
    documentoHistorial,
    historialModal,
    cargandoHistorialModal,
    abrirModalHistorialDocumento,
    cerrarModalHistorial,
    totalesFiltrados,
  };
}
