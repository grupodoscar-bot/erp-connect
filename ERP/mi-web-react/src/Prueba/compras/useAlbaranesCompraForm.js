import { useCallback, useMemo, useEffect, useState } from "react";
import API_ENDPOINTS from '../../config/api';
import { aplicarCondicionesProveedorEnLineas, aplicarCondicionComercialEnLinea } from '../../utils/condicionesProveedores';
import { useTarifasPedidoCompra } from './useTarifasPedidoCompra';

const extraerContenido = (data, fallback = []) => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.content)) return data.content;
  return fallback;
};

const STORAGE_KEY_FORMULARIOS = "albaranes-compra-formularios";

const leerFormulariosPersistidos = () => {
  try {
    const almacenado = sessionStorage.getItem(STORAGE_KEY_FORMULARIOS);
    if (almacenado) {
      return JSON.parse(almacenado);
    }
  } catch (error) {
    console.warn('[AlbaranesCompra] No se pudo leer formularios persistidos:', error);
  }
  return {};
};

const guardarFormulariosPersistidos = (formularios) => {
  try {
    sessionStorage.setItem(STORAGE_KEY_FORMULARIOS, JSON.stringify(formularios));
  } catch (error) {
    console.warn('[AlbaranesCompra] No se pudo guardar formularios persistidos:', error);
  }
};

const formAlbaranCompraInicial = {
  id: null,
  numero: "",
  fecha: new Date().toISOString().slice(0, 16),
  fechaOriginal: null,
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
  recargoEquivalencia: false,
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

export function useAlbaranesCompraForm(pestanaActiva = null, session = null) {
  const [albaranesCompra, setAlbaranesCompra] = useState([]);
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
  
  // Estados para gestión de stock y confirmaciones
  const [estadoOriginalAlbaran, setEstadoOriginalAlbaran] = useState(null);
  const [configuracionStock, setConfiguracionStock] = useState({ documentoDescuentaStock: 'ALBARAN' });
  const [mostrarConfirmacionStock, setMostrarConfirmacionStock] = useState(false);
  const [mostrarConfirmacionRestaurar, setMostrarConfirmacionRestaurar] = useState(false);
  const [guardarPendiente, setGuardarPendiente] = useState(null);
  
  const tarifasPedidoCompra = useTarifasPedidoCompra();
  
  const API_URL = API_ENDPOINTS.albaranesCompra;

  const tarifaPorDefectoId = useMemo(() => tarifasPedidoCompra.tarifaPorDefecto?.id?.toString() || "", [tarifasPedidoCompra.tarifaPorDefecto]);

  const setFormAlbaranCompra = useCallback((nuevoFormulario, pestanaId = null) => {
    const idPestana = pestanaId || pestanaActiva;
    if (!idPestana) return;
    
    setFormulariosPorPestana(prev => {
      const formularioAnterior = prev[idPestana] || formAlbaranCompraInicial;
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

  const formAlbaranCompra = formulariosPorPestana[pestanaActiva] || formAlbaranCompraInicial;

  const sincronizarTarifaHook = useCallback((tarifaId, tarifaObjetoCompleto = null) => {
    if (tarifaObjetoCompleto && tarifaObjetoCompleto.id) {
      // Si tenemos el objeto completo, pasarlo directamente
      tarifasPedidoCompra.cambiarTarifa(tarifaId?.toString(), tarifaObjetoCompleto);
    } else if (tarifaId) {
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
    setFormAlbaranCompra(prev => ({ ...prev, tarifaId: idFinal }));
    sincronizarTarifaHook(idFinal);
    return idFinal;
  }, [setFormAlbaranCompra, sincronizarTarifaHook, tarifaPorDefectoId]);

  useEffect(() => {
    if (!formAlbaranCompra.tarifaId && tarifaPorDefectoId) {
      cambiarTarifaFormulario(tarifaPorDefectoId);
    }

    if (!formAlbaranCompra.serieId && series.length > 0) {
      setFormAlbaranCompra(prev => ({ ...prev, serieId: series[0].id?.toString() || prev.serieId }));
    }
  }, [formAlbaranCompra.tarifaId, formAlbaranCompra.serieId, tarifaPorDefectoId, cambiarTarifaFormulario, series, setFormAlbaranCompra]);

  const limpiarFormularioPestana = useCallback((pestanaId) => {
    setFormulariosPorPestana(prev => {
      const nuevo = { ...prev };
      delete nuevo[pestanaId];
      guardarFormulariosPersistidos(nuevo);
      return nuevo;
    });
  }, []);

  const cargarAlbaranesCompra = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}?size=1000`);
      if (response.ok) {
        const data = await response.json();
        const albaranes = extraerContenido(data, []);
        
        // Cargar origen de cada documento (igual que ventas)
        const albaranesConOrigen = await Promise.all(albaranes.map(async (albaran) => {
          try {
            const resOrigen = await fetch(`${API_ENDPOINTS.documentoTransformaciones}/origen-directo/ALBARAN_COMPRA/${albaran.id}`);
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
              return { ...albaran, origen: formatearOrigen(dataOrigen) };
            }
            return { ...albaran, origen: null };
          } catch (err) {
            return { ...albaran, origen: null };
          }
        }));
        
        setAlbaranesCompra(albaranesConOrigen);
      }
    } catch (error) {
      console.error('Error al cargar albaranes de compra:', error);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  const cargarAlbaranCompra = useCallback(async (id) => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/${id}`);
      if (response.ok) {
        const albaran = await response.json();
        
        const direccionEnvioSnapshot = {
          pais: albaran.direccionEnvioPais || "",
          codigoPostal: albaran.direccionEnvioCodigoPostal || "",
          provincia: albaran.direccionEnvioProvincia || "",
          poblacion: albaran.direccionEnvioPoblacion || "",
          direccion: albaran.direccionEnvioDireccion || "",
        };
        
        const direccionFacturacionSnapshot = {
          pais: albaran.direccionFacturacionPais || "",
          codigoPostal: albaran.direccionFacturacionCodigoPostal || "",
          provincia: albaran.direccionFacturacionProvincia || "",
          poblacion: albaran.direccionFacturacionPoblacion || "",
          direccion: albaran.direccionFacturacionDireccion || "",
        };
        
        let tarifaFormulario = albaran.tarifa?.id?.toString() || albaran.tarifaId?.toString() || tarifaPorDefectoId;
        const serieFormulario = albaran.serie?.id?.toString() || albaran.serieId?.toString() || "";

        const fechaLocal = albaran.fecha 
          ? new Date(albaran.fecha).toISOString().slice(0, 16)
          : new Date().toISOString().slice(0, 16);

        const formateado = {
          ...formAlbaranCompraInicial,
          ...albaran,
          id: albaran.id,
          fecha: fechaLocal,
          fechaOriginal: fechaLocal,
          proveedorId: albaran.proveedor?.id?.toString() || albaran.proveedorId?.toString() || "",
          tarifaId: tarifaFormulario,
          almacenId: albaran.almacen?.id?.toString() || albaran.almacenId?.toString() || "",
          serieId: serieFormulario,
          lineas: (albaran.lineas || []).map(linea => ({
            ...linea,
            productoId: linea.producto?.id?.toString() || linea.productoId?.toString() || "",
            tipoIvaId: linea.tipoIva?.id?.toString() || linea.tipoIvaId?.toString() || "",
            almacenId: linea.almacen?.id?.toString() || linea.almacenId?.toString() || "",
          })),
          adjuntos: albaran.adjuntos || [],
          descuentoAgrupacionManual: albaran.descuentoAgrupacion ?? null,
          direccionEnvioSnapshot,
          direccionFacturacionSnapshot,
          direccionId: albaran.direccionId?.toString() || "",
          recargoEquivalencia: albaran.recargoEquivalencia || false,
        };
        setFormAlbaranCompra(formateado);
        
        // Guardar estado original para detectar cambios de stock
        setEstadoOriginalAlbaran(albaran.estado || 'Pendiente');

        // Pasar el objeto de tarifa completo para sincronizar correctamente
        sincronizarTarifaHook(formateado.tarifaId, albaran.tarifa || null);
        return albaran;
      }
    } catch (error) {
      console.error('Error al cargar albarán de compra:', error);
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
      const response = await fetch(`${API_ENDPOINTS.series}?tipoDocumento=ALBARAN_COMPRA`);
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
        // Guardar configuración de stock para mostrar mensajes informativos
        setConfiguracionStock({
          documentoDescuentaStock: data.documentoDescuentaStock || 'ALBARAN',
          permitirVentaSinStock: data.permitirVentaSinStock || false
        });
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
    const serieId = serieIdParam || formAlbaranCompra.serieId;
    
    if (formAlbaranCompra.numero && formAlbaranCompra.numero.trim() !== "") {
      return;
    }
    
    if (!serieId) {
      setFormAlbaranCompra(prev => ({ ...prev, numero: "" }));
      return;
    }

    setGenerandoNumero(true);
    try {
      let serieIdStr;
      if (typeof serieId === 'object') {
        serieIdStr = serieId.id?.toString() || serieId.toString();
      } else {
        serieIdStr = serieId.toString();
      }
      
      const params = new URLSearchParams({ serieId: serieIdStr, tipo: "ALBARAN_COMPRA" });
      const url = `${API_ENDPOINTS.series}/generar-numero?${params.toString()}`;
      
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        if (data?.numeroGenerado) {
          setFormAlbaranCompra(prev => ({ ...prev, numero: data.numeroGenerado, usarCodigoManual: true }));
        }
      }
    } catch (error) {
      console.error('Error al generar número:', error);
    } finally {
      setGenerandoNumero(false);
    }
  }, [formAlbaranCompra.serieId, formAlbaranCompra.numero]);

  useEffect(() => {
    cargarAlbaranesCompra();
    cargarProveedores();
    cargarProductos();
    cargarTiposIva();
    cargarAlmacenes();
    cargarSeries();
    cargarConfiguracion();
  }, []);

  const cargarHistorialTransformaciones = useCallback(async (tipoDocumentoOrId, documentoIdParam) => {
    let tipoDocumento = 'ALBARAN_COMPRA';
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
      console.error('[AlbaranesCompra] Error cargando historial:', err);
      setHistorialTransformaciones([]);
      return [];
    } finally {
      setCargandoHistorialTransformaciones(false);
    }
  }, []);

  // Funciones para modal de historial (igual que ventas)
  const abrirModalHistorialDocumento = useCallback(async (documento) => {
    setDocumentoHistorial({ tipo: 'ALBARAN_COMPRA', id: documento.id, numero: documento.numero });
    setModalHistorialAbierto(true);
    setCargandoHistorialModal(true);
    try {
      const historial = await cargarHistorialTransformaciones('ALBARAN_COMPRA', documento.id);
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
    if (formAlbaranCompra.id) {
      cargarHistorialTransformaciones('ALBARAN_COMPRA', formAlbaranCompra.id);
    } else {
      setHistorialTransformaciones([]);
    }
  }, [formAlbaranCompra.id, cargarHistorialTransformaciones]);

  const updateFormAlbaranCompraField = useCallback(async (field, value) => {
    if (field === 'proveedorId' && value) {
      const proveedorSeleccionado = proveedores.find(p => p.id === parseInt(value));
      const nuevaTarifaId = proveedorSeleccionado?.tarifaAsignada?.id?.toString()
        || formAlbaranCompra.tarifaId
        || tarifaPorDefectoId;
      
      setFormAlbaranCompra(prev => {
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
              setFormAlbaranCompra(prevForm => ({
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
      setFormAlbaranCompra(prev => ({ ...prev, proveedorId: "", descuentoAgrupacionManual: 0 }));
      cambiarTarifaFormulario(null);
    } else if (field === 'serieId' && value) {
      setFormAlbaranCompra(prev => {
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
    } else {
      setFormAlbaranCompra(prev => ({ ...prev, [field]: value }));
    }
  }, [setFormAlbaranCompra, proveedores, productos, series, almacenes, permitirCompraMultialmacen, sincronizarTarifaHook, cambiarTarifaFormulario, formAlbaranCompra.tarifaId, tarifasPedidoCompra.obtenerPrecioProducto, tarifasPedidoCompra.tarifaSeleccionada?.id, tarifaPorDefectoId]);

  const setDireccionSnapshot = useCallback((tipo, valores) => {
    const campo = tipo === "facturacion" ? "direccionFacturacionSnapshot" : "direccionEnvioSnapshot";
    setFormAlbaranCompra(prev => ({
      ...prev,
      [campo]: valores,
    }));
  }, [setFormAlbaranCompra]);

  const updateDireccionSnapshotField = useCallback((tipo, campo, valor) => {
    const campoSnapshot = tipo === "facturacion" ? "direccionFacturacionSnapshot" : "direccionEnvioSnapshot";
    setFormAlbaranCompra(prev => ({
      ...prev,
      [campoSnapshot]: {
        ...prev[campoSnapshot],
        [campo]: valor,
      },
    }));
  }, [setFormAlbaranCompra]);

  const agregarLinea = useCallback(() => {
    setFormAlbaranCompra(prev => ({
      ...prev,
      lineas: [...prev.lineas, { ...lineaInicial }],
    }));
  }, [setFormAlbaranCompra]);

  const eliminarLinea = useCallback((index) => {
    setFormAlbaranCompra(prev => ({
      ...prev,
      lineas: prev.lineas.filter((_, i) => i !== index),
    }));
  }, [setFormAlbaranCompra]);

  const actualizarLinea = useCallback(async (index, field, value) => {
    if (field === "productoId" && value) {
      const producto = productos.find(p => p.id === parseInt(value));
      if (producto) {
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
          }
        } catch (err) {
          console.warn('[AlbaranesCompra] No se pudo obtener precio de tarifa:', err);
        }

        const lineasPrevias = formAlbaranCompra.lineas || [];
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

        setFormAlbaranCompra(prev => ({ ...prev, lineas: nuevasLineas }));

        if (formAlbaranCompra.proveedorId) {
          const proveedorSeleccionado = proveedores.find(p => p.id === parseInt(formAlbaranCompra.proveedorId));
          if (proveedorSeleccionado?.agrupacion?.id) {
            try {
              const lineasConCondiciones = await aplicarCondicionesProveedorEnLineas({
                lineas: nuevasLineas,
                proveedorId: formAlbaranCompra.proveedorId,
                proveedorConAgrupacion: proveedorSeleccionado,
                proveedores: proveedores,
                productos: productos,
                condicionesApiUrl: API_ENDPOINTS.condicionesComerciales + '-proveedor',
                tarifaId: tarifasPedidoCompra.tarifaSeleccionada?.id,
                obtenerPrecioTarifa: tarifasPedidoCompra.obtenerPrecioProducto,
              });
              setFormAlbaranCompra(prev => ({ ...prev, lineas: lineasConCondiciones }));
            } catch (err) {
              console.error('Error al aplicar condiciones comerciales:', err);
            }
          }
        }
      }
      return;
    }
    
    const lineasPrevias = formAlbaranCompra.lineas || [];
    const nuevasLineasGenerales = [...lineasPrevias];
    nuevasLineasGenerales[index] = { ...nuevasLineasGenerales[index], [field]: value };
    setFormAlbaranCompra(prev => ({ ...prev, lineas: nuevasLineasGenerales }));
    
    if (field === "cantidad" && formAlbaranCompra.proveedorId) {
      const proveedorSeleccionado = proveedores.find(p => p.id === parseInt(formAlbaranCompra.proveedorId));
      if (proveedorSeleccionado?.agrupacion?.id) {
        try {
          const lineasActualizadas = await aplicarCondicionComercialEnLinea({
            index,
            lineas: nuevasLineasGenerales,
            proveedorId: formAlbaranCompra.proveedorId,
            proveedorConAgrupacion: proveedorSeleccionado,
            proveedores: proveedores,
            productos: productos,
            condicionesApiUrl: API_ENDPOINTS.condicionesComerciales + '-proveedor',
            tarifaId: tarifasPedidoCompra.tarifaSeleccionada?.id,
            obtenerPrecioTarifa: tarifasPedidoCompra.obtenerPrecioProducto,
          });
          setFormAlbaranCompra(prev => ({ ...prev, lineas: lineasActualizadas }));
        } catch (err) {
          console.error('Error al aplicar condición comercial:', err);
        }
      }
    }
  }, [productos, tarifasPedidoCompra, formAlbaranCompra.proveedorId, formAlbaranCompra.lineas, proveedores, setFormAlbaranCompra]);

  const calcularTotales = useMemo(() => {
    let subtotalBruto = 0;
    let descuentoTotal = 0;
    let totalIva = 0;
    let totalRecargo = 0;
    const desglosePorIva = {};

    formAlbaranCompra.lineas.forEach((linea) => {
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
        const descuentoAgrupacionPct = parseFloat(formAlbaranCompra.descuentoAgrupacionManual) || 0;
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
    const descuentoAgrupacionPct = parseFloat(formAlbaranCompra.descuentoAgrupacionManual) || 0;
    const descuentoAgrupacionImporte = subtotal * (descuentoAgrupacionPct / 100);
    const totalBaseSinImpuestos = subtotal - descuentoAgrupacionImporte;
    const total = totalBaseSinImpuestos + totalIva + totalRecargo;

    const descuentoAgrupacionBase = (() => {
      if (!formAlbaranCompra.proveedorId) return 0;
      const proveedor = proveedores.find(p => p.id === parseInt(formAlbaranCompra.proveedorId));
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
  }, [formAlbaranCompra.lineas, formAlbaranCompra.descuentoAgrupacionManual, formAlbaranCompra.proveedorId, proveedores, tiposIva]);

  const guardarAlbaranCompra = useCallback(async (e, opciones = {}) => {
    if (e) e.preventDefault();

    try {
      const totales = calcularTotales;
      const direccionEnvio = formAlbaranCompra.direccionEnvioSnapshot || {};
      const direccionFacturacion = formAlbaranCompra.direccionFacturacionSnapshot || {};
      
      const fechaModificada = formAlbaranCompra.fecha !== formAlbaranCompra.fechaOriginal;
      const fechaFormateada = fechaModificada 
        ? new Date(formAlbaranCompra.fecha).toISOString()
        : null;
      
      const payload = {
        id: formAlbaranCompra.id || null,
        numero: formAlbaranCompra.numero || "",
        usarCodigoManual: formAlbaranCompra.usarCodigoManual || false,
        fecha: fechaFormateada,
        proveedorId: parseInt(formAlbaranCompra.proveedorId) || null,
        estado: formAlbaranCompra.estado,
        observaciones: formAlbaranCompra.observaciones || "",
        notas: formAlbaranCompra.notas || "",
        descuentoAgrupacion: formAlbaranCompra.descuentoAgrupacionManual ?? 0,
        subtotal: parseFloat(totales.subtotal),
        total: parseFloat(totales.total),
        descuentoTotal: parseFloat(totales.descuentoTotal),
        serieId: formAlbaranCompra.serieId ? parseInt(formAlbaranCompra.serieId) : null,
        tarifaId: formAlbaranCompra.tarifaId ? parseInt(formAlbaranCompra.tarifaId) : null,
        almacenId: formAlbaranCompra.almacenId ? parseInt(formAlbaranCompra.almacenId) : null,
        compraMultialmacen: formAlbaranCompra.compraMultialmacen || false,
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
        direccionId: formAlbaranCompra.direccionId ? parseInt(formAlbaranCompra.direccionId) : null,
        recargoEquivalencia: formAlbaranCompra.recargoEquivalencia || false,
        lineas: formAlbaranCompra.lineas.map((linea) => {
          const tipoIva = tiposIva.find(t => t.id === parseInt(linea.tipoIvaId));
          const cantidad = parseFloat(linea.cantidad) || 0;
          const precio = parseFloat(linea.precioUnitario) || 0;
          const descuento = parseFloat(linea.descuento) || 0;
          const descuentoAgrupacionPct = parseFloat(formAlbaranCompra.descuentoAgrupacionManual) || 0;
          
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

      const url = formAlbaranCompra.id ? `${API_URL}/${formAlbaranCompra.id}` : API_URL;
      const method = formAlbaranCompra.id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const albaranGuardado = await response.json();
        
        const adjuntosIds = (formAlbaranCompra.adjuntos || []).map(a => a.id).filter(id => id && id > 0);
        try {
          await fetch(`${API_URL}/${albaranGuardado.id}/adjuntos`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(adjuntosIds),
          });
        } catch (e) {
          console.error("Error al vincular adjuntos:", e);
        }
        
        await cargarAlbaranesCompra();
        
        if (opciones.cerrarDespues && opciones.cerrarPestana) {
          opciones.cerrarPestana();
        }
        
        alert("Albarán de compra guardado correctamente");
      } else {
        const error = await response.text();
        alert(`Error al guardar: ${error}`);
      }
    } catch (error) {
      console.error("Error al guardar albarán de compra:", error);
      alert("Error al guardar el albarán de compra");
    }
  }, [formAlbaranCompra, calcularTotales, cargarAlbaranesCompra, API_URL, tiposIva]);

  const eliminarAlbaranCompra = useCallback(async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (response.ok) {
        await cargarAlbaranesCompra();
      } else {
        throw new Error("Error al eliminar");
      }
    } catch (error) {
      console.error("Error al eliminar albarán de compra:", error);
      throw error;
    }
  }, [cargarAlbaranesCompra, API_URL]);

  const mostrarSelectorAlmacen = useMemo(() => almacenes.length > 1, [almacenes]);

  const recalcularPreciosLineas = useCallback(async () => {
    const lineasActuales = formAlbaranCompra.lineas;
    if (!lineasActuales || lineasActuales.length === 0) return;
    
    const lineasActualizadas = await Promise.all(
      lineasActuales.map(async (linea) => {
        if (!linea.productoId) return linea;
        
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
    
    setFormAlbaranCompra(prev => ({ ...prev, lineas: lineasActualizadas }));
  }, [formAlbaranCompra.lineas, tarifasPedidoCompra, setFormAlbaranCompra]);

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
        setFormAlbaranCompra((prev) => ({
          ...prev,
          adjuntos: [...(prev.adjuntos || []), adjunto],
        }));
      }
    } catch (error) {
      console.error("Error al subir adjunto:", error);
    }
  }, [ARCHIVOS_API_URL, setFormAlbaranCompra]);

  const eliminarAdjunto = useCallback(async (adjuntoId) => {
    // Solo eliminar físicamente si es un adjunto temporal (ID 0)
    if (!adjuntoId || adjuntoId === 0) {
      const adjunto = formAlbaranCompra.adjuntos?.find(a => a.id === adjuntoId || a.id === 0);
      if (adjunto?.idReal) {
        try {
          await fetch(`${ARCHIVOS_API_URL}/${adjunto.idReal}`, { method: "DELETE" });
        } catch (e) {
          console.error("Error al eliminar adjunto temporal:", e);
        }
      }
    }
    // Para adjuntos con ID real, solo eliminar del estado local
    // El backend los desvinculará al guardar el documento
    setFormAlbaranCompra((prev) => ({
      ...prev,
      adjuntos: prev.adjuntos.filter((a) => a.id !== adjuntoId),
    }));
  }, [formAlbaranCompra.adjuntos, ARCHIVOS_API_URL, setFormAlbaranCompra]);

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

  // Función helper para verificar si el albarán afecta stock según configuración
  const afectaStockSegunConfiguracion = useCallback((estado) => {
    const configDocumentoDescuenta = configuracionStock?.documentoDescuentaStock || 'ALBARAN';
    return configDocumentoDescuenta === 'ALBARAN' && estado === 'Emitido';
  }, [configuracionStock]);

  // Función helper para verificar si hay cambio de estado que afecte stock
  const verificarCambioStock = useCallback(() => {
    const estadoActual = formAlbaranCompra.estado || 'Pendiente';
    const estadoOriginal = estadoOriginalAlbaran || 'Pendiente';
    
    if (estadoActual === 'Emitido' && estadoOriginal !== 'Emitido') {
      return {
        tipo: 'INCREMENTAR',
        mensaje: 'Este albarán incrementará el stock al guardarse. ¿Desea continuar?',
        afecta: true
      };
    }
    
    if (estadoOriginal === 'Emitido' && estadoActual !== 'Emitido') {
      return {
        tipo: 'RESTAURAR',
        mensaje: 'Este albarán restará el stock previamente incrementado. ¿Desea continuar?',
        afecta: true
      };
    }
    
    return { tipo: 'NINGUNO', afecta: false };
  }, [formAlbaranCompra.estado, estadoOriginalAlbaran]);

  // Función para confirmar guardado con cambio de stock
  const confirmarGuardarConStock = useCallback((e, opciones = {}) => {
    const cambioStock = verificarCambioStock();
    
    if (!cambioStock.afecta) {
      guardarAlbaranCompra(e, opciones);
      return;
    }
    
    setGuardarPendiente({ e, opciones });
    
    if (cambioStock.tipo === 'INCREMENTAR') {
      setMostrarConfirmacionStock(true);
    } else {
      setMostrarConfirmacionRestaurar(true);
    }
  }, [verificarCambioStock, guardarAlbaranCompra]);

  // Función para manejar confirmación de incremento de stock
  const handleConfirmarIncremento = useCallback((confirmado) => {
    setMostrarConfirmacionStock(false);
    if (confirmado && guardarPendiente) {
      guardarAlbaranCompra(guardarPendiente.e, guardarPendiente.opciones);
    }
    setGuardarPendiente(null);
  }, [guardarPendiente, guardarAlbaranCompra]);

  // Función para manejar confirmación de restauración de stock
  const handleConfirmarRestauracion = useCallback((confirmado) => {
    setMostrarConfirmacionRestaurar(false);
    if (confirmado && guardarPendiente) {
      guardarAlbaranCompra(guardarPendiente.e, guardarPendiente.opciones);
    }
    setGuardarPendiente(null);
  }, [guardarPendiente, guardarAlbaranCompra]);

  const totalesFiltrados = useMemo(() => {
    const base = albaranesCompra.reduce((sum, a) => sum + (a.totalBaseSinImpuestos || a.subtotal || 0), 0);
    const iva = albaranesCompra.reduce((sum, a) => sum + (a.totalIva || 0), 0);
    const recargo = albaranesCompra.reduce((sum, a) => sum + (a.totalRecargo || 0), 0);
    const total = albaranesCompra.reduce((sum, a) => sum + (a.total || 0), 0);
    return { base, iva, recargo, total, count: albaranesCompra.length };
  }, [albaranesCompra]);

  return {
    albaranesCompra,
    documentos: albaranesCompra,
    formAlbaranCompra,
    setFormAlbaranCompra,
    proveedores,
    productos,
    tiposIva,
    almacenes,
    series,
    loading,
    estadoOptions,
    cargarAlbaranesCompra,
    cargarAlbaranCompra,
    updateFormAlbaranCompraField,
    setDireccionSnapshot,
    updateDireccionSnapshotField,
    agregarLinea,
    eliminarLinea,
    actualizarLinea,
    calcularTotales,
    guardarAlbaranCompra,
    confirmarGuardarConStock,
    eliminarAlbaranCompra,
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
    // Estados y funciones para gestión de stock
    configuracionStock,
    estadoOriginalAlbaran,
    mostrarConfirmacionStock,
    mostrarConfirmacionRestaurar,
    setMostrarConfirmacionStock,
    setMostrarConfirmacionRestaurar,
    handleConfirmarIncremento,
    handleConfirmarRestauracion,
    verificarCambioStock,
    afectaStockSegunConfiguracion,
  };
}
