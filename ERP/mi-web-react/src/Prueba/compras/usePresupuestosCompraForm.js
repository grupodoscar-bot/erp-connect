import { useCallback, useMemo, useEffect, useState } from "react";
import API_ENDPOINTS from '../../config/api';
import { aplicarCondicionesProveedorEnLineas, aplicarCondicionComercialEnLinea } from '../../utils/condicionesProveedores';
import { useTarifasPedidoCompra } from './useTarifasPedidoCompra';

const extraerContenido = (data, fallback = []) => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.content)) return data.content;
  return fallback;
};

const STORAGE_KEY_FORMULARIOS = "presupuestos-compra-formularios";

const leerFormulariosPersistidos = () => {
  try {
    const almacenado = sessionStorage.getItem(STORAGE_KEY_FORMULARIOS);
    if (almacenado) {
      return JSON.parse(almacenado);
    }
  } catch (error) {
    console.warn('[PresupuestosCompra] No se pudo leer formularios persistidos:', error);
  }
  return {};
};

const guardarFormulariosPersistidos = (formularios) => {
  try {
    sessionStorage.setItem(STORAGE_KEY_FORMULARIOS, JSON.stringify(formularios));
  } catch (error) {
    console.warn('[PresupuestosCompra] No se pudo guardar formularios persistidos:', error);
  }
};

const formPresupuestoCompraInicial = {
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
  validezDias: 30,
  fechaCaducidad: null,
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

export function usePresupuestosCompraForm(pestanaActiva = null, session = null) {
  const [presupuestosCompra, setPresupuestosCompra] = useState([]);
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
  
  const tarifasPresupuestoCompra = useTarifasPedidoCompra();
  
  const API_URL = API_ENDPOINTS.presupuestosCompra || `${API_ENDPOINTS.pedidosCompra.replace('/pedidos-compra', '/presupuestos-compra')}`;

  const tarifaPorDefectoId = useMemo(() => tarifasPresupuestoCompra.tarifaPorDefecto?.id?.toString() || "", [tarifasPresupuestoCompra.tarifaPorDefecto]);

  const setFormPresupuestoCompra = useCallback((nuevoFormulario, pestanaId = null) => {
    const idPestana = pestanaId || pestanaActiva;
    if (!idPestana) return;
    
    setFormulariosPorPestana(prev => {
      const formularioAnterior = prev[idPestana] || formPresupuestoCompraInicial;
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

  const formPresupuestoCompra = formulariosPorPestana[pestanaActiva] || formPresupuestoCompraInicial;

  const sincronizarTarifaHook = useCallback((tarifaId, tarifaObjetoCompleto = null) => {
    if (tarifaObjetoCompleto && tarifaObjetoCompleto.id) {
      tarifasPresupuestoCompra.cambiarTarifa(tarifaId?.toString(), tarifaObjetoCompleto);
    } else if (tarifaId) {
      tarifasPresupuestoCompra.cambiarTarifa(tarifaId.toString());
    } else if (tarifaPorDefectoId) {
      tarifasPresupuestoCompra.cambiarTarifa(tarifaPorDefectoId);
    } else {
      tarifasPresupuestoCompra.resetearTarifaPorDefecto();
    }
  }, [tarifasPresupuestoCompra, tarifaPorDefectoId]);

  const cambiarTarifaFormulario = useCallback((tarifaId) => {
    let idFinal = tarifaId ? tarifaId.toString() : "";
    if (!idFinal && tarifaPorDefectoId) {
      idFinal = tarifaPorDefectoId;
    }
    setFormPresupuestoCompra(prev => ({ ...prev, tarifaId: idFinal }));
    sincronizarTarifaHook(idFinal);
    return idFinal;
  }, [setFormPresupuestoCompra, sincronizarTarifaHook, tarifaPorDefectoId]);

  useEffect(() => {
    if (!formPresupuestoCompra.tarifaId && tarifaPorDefectoId) {
      cambiarTarifaFormulario(tarifaPorDefectoId);
    }

    if (!formPresupuestoCompra.serieId && series.length > 0) {
      setFormPresupuestoCompra(prev => ({ ...prev, serieId: series[0].id?.toString() || prev.serieId }));
    }
  }, [formPresupuestoCompra.tarifaId, formPresupuestoCompra.serieId, tarifaPorDefectoId, cambiarTarifaFormulario, series, setFormPresupuestoCompra]);

  const limpiarFormularioPestana = useCallback((pestanaId) => {
    setFormulariosPorPestana(prev => {
      const nuevo = { ...prev };
      delete nuevo[pestanaId];
      guardarFormulariosPersistidos(nuevo);
      return nuevo;
    });
  }, []);

  const cargarPresupuestosCompra = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}?size=1000`);
      if (response.ok) {
        const data = await response.json();
        const presupuestos = extraerContenido(data, []);
        
        // Cargar origen de cada documento (igual que ventas)
        const presupuestosConOrigen = await Promise.all(presupuestos.map(async (presupuesto) => {
          try {
            const resOrigen = await fetch(`${API_ENDPOINTS.documentoTransformaciones}/origen-directo/PRESUPUESTO_COMPRA/${presupuesto.id}`);
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
              return { ...presupuesto, origen: formatearOrigen(dataOrigen) };
            }
            return { ...presupuesto, origen: null };
          } catch (err) {
            return { ...presupuesto, origen: null };
          }
        }));
        
        setPresupuestosCompra(presupuestosConOrigen);
      }
    } catch (error) {
      console.error('Error al cargar presupuestos de compra:', error);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  const cargarPresupuestoCompra = useCallback(async (id) => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/${id}`);
      if (response.ok) {
        const presupuesto = await response.json();
        
        const direccionEnvioSnapshot = {
          pais: presupuesto.direccionEnvioPais || "",
          codigoPostal: presupuesto.direccionEnvioCodigoPostal || "",
          provincia: presupuesto.direccionEnvioProvincia || "",
          poblacion: presupuesto.direccionEnvioPoblacion || "",
          direccion: presupuesto.direccionEnvioDireccion || "",
        };
        
        const direccionFacturacionSnapshot = {
          pais: presupuesto.direccionFacturacionPais || "",
          codigoPostal: presupuesto.direccionFacturacionCodigoPostal || "",
          provincia: presupuesto.direccionFacturacionProvincia || "",
          poblacion: presupuesto.direccionFacturacionPoblacion || "",
          direccion: presupuesto.direccionFacturacionDireccion || "",
        };
        
        let tarifaFormulario = presupuesto.tarifa?.id?.toString() || presupuesto.tarifaId?.toString() || tarifaPorDefectoId;
        const serieFormulario = presupuesto.serie?.id?.toString() || presupuesto.serieId?.toString() || "";

        const fechaLocal = presupuesto.fecha 
          ? new Date(presupuesto.fecha).toISOString().slice(0, 16)
          : new Date().toISOString().slice(0, 16);

        const formateado = {
          ...formPresupuestoCompraInicial,
          ...presupuesto,
          id: presupuesto.id,
          fecha: fechaLocal,
          fechaOriginal: fechaLocal,
          proveedorId: presupuesto.proveedor?.id?.toString() || presupuesto.proveedorId?.toString() || "",
          tarifaId: tarifaFormulario,
          almacenId: presupuesto.almacen?.id?.toString() || presupuesto.almacenId?.toString() || "",
          serieId: serieFormulario,
          lineas: (presupuesto.lineas || []).map(linea => ({
            ...linea,
            productoId: linea.producto?.id?.toString() || linea.productoId?.toString() || "",
            tipoIvaId: linea.tipoIva?.id?.toString() || linea.tipoIvaId?.toString() || "",
            almacenId: linea.almacen?.id?.toString() || linea.almacenId?.toString() || "",
          })),
          adjuntos: presupuesto.adjuntos || [],
          descuentoAgrupacionManual: presupuesto.descuentoAgrupacion ?? null,
          direccionEnvioSnapshot,
          direccionFacturacionSnapshot,
          direccionId: presupuesto.direccionId?.toString() || "",
          recargoEquivalencia: presupuesto.recargoEquivalencia || false,
          validezDias: presupuesto.validezDias || 30,
          fechaCaducidad: presupuesto.fechaCaducidad,
        };
        setFormPresupuestoCompra(formateado);

        sincronizarTarifaHook(formateado.tarifaId, presupuesto.tarifa || null);
        return presupuesto;
      }
    } catch (error) {
      console.error('Error al cargar presupuesto de compra:', error);
    } finally {
      setLoading(false);
    }
  }, [API_URL, tarifaPorDefectoId, sincronizarTarifaHook]);

  const cargarProveedores = useCallback(async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.proveedores}?size=1000`);
      if (response.ok) {
        const data = await response.json();
        setProveedores(extraerContenido(data));
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
        setProductos(extraerContenido(data));
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
      const response = await fetch(`${API_ENDPOINTS.series}?tipoDocumento=PRESUPUESTO_COMPRA`);
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
    const serieId = serieIdParam || formPresupuestoCompra.serieId;
    
    if (formPresupuestoCompra.numero && formPresupuestoCompra.numero.trim() !== "") {
      return;
    }
    
    if (!serieId) {
      setFormPresupuestoCompra(prev => ({ ...prev, numero: "" }));
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
      
      const params = new URLSearchParams({ serieId: serieIdStr, tipo: "PRESUPUESTO_COMPRA" });
      const url = `${API_ENDPOINTS.series}/generar-numero?${params.toString()}`;
      
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        if (data?.numeroGenerado) {
          setFormPresupuestoCompra(prev => ({ ...prev, numero: data.numeroGenerado, usarCodigoManual: true }));
        }
      }
    } catch (error) {
      console.error('Error al generar número:', error);
    } finally {
      setGenerandoNumero(false);
    }
  }, [formPresupuestoCompra.serieId, formPresupuestoCompra.numero]);

  useEffect(() => {
    cargarPresupuestosCompra();
    cargarProveedores();
    cargarProductos();
    cargarTiposIva();
    cargarAlmacenes();
    cargarSeries();
    cargarConfiguracion();
  }, []);

  const cargarHistorialTransformaciones = useCallback(async (tipoDocumentoOrId, documentoIdParam) => {
    let tipoDocumento = 'PRESUPUESTO_COMPRA';
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
      console.error('[PresupuestosCompra] Error cargando historial:', err);
      setHistorialTransformaciones([]);
      return [];
    } finally {
      setCargandoHistorialTransformaciones(false);
    }
  }, []);

  // Funciones para modal de historial (igual que ventas)
  const abrirModalHistorialDocumento = useCallback(async (documento) => {
    setDocumentoHistorial({ tipo: 'PRESUPUESTO_COMPRA', id: documento.id, numero: documento.numero });
    setModalHistorialAbierto(true);
    setCargandoHistorialModal(true);
    try {
      const historial = await cargarHistorialTransformaciones('PRESUPUESTO_COMPRA', documento.id);
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
    if (formPresupuestoCompra.id) {
      cargarHistorialTransformaciones('PRESUPUESTO_COMPRA', formPresupuestoCompra.id);
    } else {
      setHistorialTransformaciones([]);
    }
  }, [formPresupuestoCompra.id, cargarHistorialTransformaciones]);

  const updateFormPresupuestoCompraField = useCallback(async (field, value) => {
    if (field === 'proveedorId' && value) {
      const proveedorSeleccionado = proveedores.find(p => p.id === parseInt(value));
      const nuevaTarifaId = proveedorSeleccionado?.tarifaAsignada?.id?.toString()
        || formPresupuestoCompra.tarifaId
        || tarifaPorDefectoId;
      
      setFormPresupuestoCompra(prev => {
        let nuevoForm = { ...prev, [field]: value };
        
        if (proveedorSeleccionado?.agrupacion?.id) {
          const descuentoAgrupacion = parseFloat(proveedorSeleccionado.agrupacion.descuentoGeneral) || 0;
          nuevoForm.descuentoAgrupacionManual = descuentoAgrupacion;
          nuevoForm.tarifaId = nuevaTarifaId;
          
          if (prev.lineas && prev.lineas.length > 0) {
            const tarifaParaCondiciones = nuevaTarifaId || tarifasPresupuestoCompra.tarifaSeleccionada?.id;
            aplicarCondicionesProveedorEnLineas({
              lineas: prev.lineas,
              proveedorId: value,
              proveedorConAgrupacion: proveedorSeleccionado,
              proveedores: proveedores,
              productos: productos,
              condicionesApiUrl: API_ENDPOINTS.condicionesComerciales + '-proveedor',
              tarifaId: tarifaParaCondiciones ? parseInt(tarifaParaCondiciones) : undefined,
              obtenerPrecioTarifa: tarifasPresupuestoCompra.obtenerPrecioProducto,
            }).then(lineasActualizadas => {
              setFormPresupuestoCompra(prevForm => ({
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
      setFormPresupuestoCompra(prev => ({ ...prev, proveedorId: "", descuentoAgrupacionManual: 0 }));
      cambiarTarifaFormulario(null);
    } else if (field === 'serieId' && value) {
      setFormPresupuestoCompra(prev => {
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
      setFormPresupuestoCompra(prev => ({ ...prev, [field]: value }));
    }
  }, [setFormPresupuestoCompra, proveedores, productos, series, almacenes, permitirCompraMultialmacen, sincronizarTarifaHook, cambiarTarifaFormulario, formPresupuestoCompra.tarifaId, tarifasPresupuestoCompra.obtenerPrecioProducto, tarifasPresupuestoCompra.tarifaSeleccionada?.id, tarifaPorDefectoId]);

  const setDireccionSnapshot = useCallback((tipo, valores) => {
    const campo = tipo === "facturacion" ? "direccionFacturacionSnapshot" : "direccionEnvioSnapshot";
    setFormPresupuestoCompra(prev => ({
      ...prev,
      [campo]: valores,
    }));
  }, [setFormPresupuestoCompra]);

  const updateDireccionSnapshotField = useCallback((tipo, campo, valor) => {
    const campoSnapshot = tipo === "facturacion" ? "direccionFacturacionSnapshot" : "direccionEnvioSnapshot";
    setFormPresupuestoCompra(prev => ({
      ...prev,
      [campoSnapshot]: {
        ...prev[campoSnapshot],
        [campo]: valor,
      },
    }));
  }, [setFormPresupuestoCompra]);

  const agregarLinea = useCallback(() => {
    setFormPresupuestoCompra(prev => ({
      ...prev,
      lineas: [...prev.lineas, { ...lineaInicial }],
    }));
  }, [setFormPresupuestoCompra]);

  const eliminarLinea = useCallback((index) => {
    setFormPresupuestoCompra(prev => ({
      ...prev,
      lineas: prev.lineas.filter((_, i) => i !== index),
    }));
  }, [setFormPresupuestoCompra]);

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
          const precioData = await tarifasPresupuestoCompra.obtenerPrecioProducto(value);
          if (precioData) {
            precioCompra = parseFloat(precioData.precio) || precioCompra;
            descuento = parseFloat(precioData.descuento) || 0;
          }
        } catch (err) {
          console.warn('[PresupuestosCompra] No se pudo obtener precio de tarifa:', err);
        }

        const lineasPrevias = formPresupuestoCompra.lineas || [];
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

        setFormPresupuestoCompra(prev => ({ ...prev, lineas: nuevasLineas }));

        if (formPresupuestoCompra.proveedorId) {
          const proveedorSeleccionado = proveedores.find(p => p.id === parseInt(formPresupuestoCompra.proveedorId));
          if (proveedorSeleccionado?.agrupacion?.id) {
            try {
              const lineasConCondiciones = await aplicarCondicionesProveedorEnLineas({
                lineas: nuevasLineas,
                proveedorId: formPresupuestoCompra.proveedorId,
                proveedorConAgrupacion: proveedorSeleccionado,
                proveedores: proveedores,
                productos: productos,
                condicionesApiUrl: API_ENDPOINTS.condicionesComerciales + '-proveedor',
                tarifaId: tarifasPresupuestoCompra.tarifaSeleccionada?.id,
                obtenerPrecioTarifa: tarifasPresupuestoCompra.obtenerPrecioProducto,
              });
              setFormPresupuestoCompra(prev => ({ ...prev, lineas: lineasConCondiciones }));
            } catch (err) {
              console.error('Error al aplicar condiciones comerciales:', err);
            }
          }
        }
      }
      return;
    }
    
    const lineasPrevias = formPresupuestoCompra.lineas || [];
    const nuevasLineasGenerales = [...lineasPrevias];
    nuevasLineasGenerales[index] = { ...nuevasLineasGenerales[index], [field]: value };
    setFormPresupuestoCompra(prev => ({ ...prev, lineas: nuevasLineasGenerales }));
    
    if (field === "cantidad" && formPresupuestoCompra.proveedorId) {
      const proveedorSeleccionado = proveedores.find(p => p.id === parseInt(formPresupuestoCompra.proveedorId));
      if (proveedorSeleccionado?.agrupacion?.id) {
        try {
          const lineasActualizadas = await aplicarCondicionComercialEnLinea({
            index,
            lineas: nuevasLineasGenerales,
            proveedorId: formPresupuestoCompra.proveedorId,
            proveedorConAgrupacion: proveedorSeleccionado,
            proveedores: proveedores,
            productos: productos,
            condicionesApiUrl: API_ENDPOINTS.condicionesComerciales + '-proveedor',
            tarifaId: tarifasPresupuestoCompra.tarifaSeleccionada?.id,
            obtenerPrecioTarifa: tarifasPresupuestoCompra.obtenerPrecioProducto,
          });
          setFormPresupuestoCompra(prev => ({ ...prev, lineas: lineasActualizadas }));
        } catch (err) {
          console.error('Error al aplicar condición comercial:', err);
        }
      }
    }
  }, [productos, tarifasPresupuestoCompra, formPresupuestoCompra.proveedorId, formPresupuestoCompra.lineas, proveedores, setFormPresupuestoCompra]);

  const calcularTotales = useMemo(() => {
    let subtotalBruto = 0;
    let descuentoTotal = 0;
    let totalIva = 0;
    let totalRecargo = 0;
    const desglosePorIva = {};

    formPresupuestoCompra.lineas.forEach((linea) => {
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
        const descuentoAgrupacionPct = parseFloat(formPresupuestoCompra.descuentoAgrupacionManual) || 0;
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
    const descuentoAgrupacionPct = parseFloat(formPresupuestoCompra.descuentoAgrupacionManual) || 0;
    const descuentoAgrupacionImporte = subtotal * (descuentoAgrupacionPct / 100);
    const totalBaseSinImpuestos = subtotal - descuentoAgrupacionImporte;
    const total = totalBaseSinImpuestos + totalIva + totalRecargo;

    const descuentoAgrupacionBase = (() => {
      if (!formPresupuestoCompra.proveedorId) return 0;
      const proveedor = proveedores.find(p => p.id === parseInt(formPresupuestoCompra.proveedorId));
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
  }, [formPresupuestoCompra.lineas, formPresupuestoCompra.descuentoAgrupacionManual, formPresupuestoCompra.proveedorId, proveedores, tiposIva]);

  const guardarPresupuestoCompra = useCallback(async (e, opciones = {}) => {
    if (e) e.preventDefault();

    try {
      const totales = calcularTotales;
      const direccionEnvio = formPresupuestoCompra.direccionEnvioSnapshot || {};
      const direccionFacturacion = formPresupuestoCompra.direccionFacturacionSnapshot || {};
      
      const fechaModificada = formPresupuestoCompra.fecha !== formPresupuestoCompra.fechaOriginal;
      const fechaFormateada = fechaModificada 
        ? new Date(formPresupuestoCompra.fecha).toISOString()
        : null;
      
      const payload = {
        id: formPresupuestoCompra.id || null,
        numero: formPresupuestoCompra.numero || "",
        usarCodigoManual: formPresupuestoCompra.usarCodigoManual || false,
        fecha: fechaFormateada,
        proveedorId: parseInt(formPresupuestoCompra.proveedorId) || null,
        estado: formPresupuestoCompra.estado,
        observaciones: formPresupuestoCompra.observaciones || "",
        notas: formPresupuestoCompra.notas || "",
        descuentoAgrupacion: formPresupuestoCompra.descuentoAgrupacionManual ?? 0,
        subtotal: parseFloat(totales.subtotal),
        total: parseFloat(totales.total),
        descuentoTotal: parseFloat(totales.descuentoTotal),
        serieId: formPresupuestoCompra.serieId ? parseInt(formPresupuestoCompra.serieId) : null,
        tarifaId: formPresupuestoCompra.tarifaId ? parseInt(formPresupuestoCompra.tarifaId) : null,
        almacenId: formPresupuestoCompra.almacenId ? parseInt(formPresupuestoCompra.almacenId) : null,
        compraMultialmacen: formPresupuestoCompra.compraMultialmacen || false,
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
        direccionId: formPresupuestoCompra.direccionId ? parseInt(formPresupuestoCompra.direccionId) : null,
        recargoEquivalencia: formPresupuestoCompra.recargoEquivalencia || false,
        validezDias: formPresupuestoCompra.validezDias || 30,
        fechaCaducidad: formPresupuestoCompra.fechaCaducidad,
        lineas: formPresupuestoCompra.lineas.map((linea) => {
          const tipoIva = tiposIva.find(t => t.id === parseInt(linea.tipoIvaId));
          const cantidad = parseFloat(linea.cantidad) || 0;
          const precio = parseFloat(linea.precioUnitario) || 0;
          const descuento = parseFloat(linea.descuento) || 0;
          const descuentoAgrupacionPct = parseFloat(formPresupuestoCompra.descuentoAgrupacionManual) || 0;
          
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

      const url = formPresupuestoCompra.id ? `${API_URL}/${formPresupuestoCompra.id}` : API_URL;
      const method = formPresupuestoCompra.id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const presupuestoGuardado = await response.json();
        
        const adjuntosIds = (formPresupuestoCompra.adjuntos || []).map(a => a.id).filter(id => id && id > 0);
        try {
          await fetch(`${API_URL}/${presupuestoGuardado.id}/adjuntos`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(adjuntosIds),
          });
        } catch (e) {
          console.error("Error al vincular adjuntos:", e);
        }
        
        await cargarPresupuestosCompra();
        
        if (opciones.cerrarDespues && opciones.cerrarPestana) {
          opciones.cerrarPestana();
        }
        
        alert("Presupuesto de compra guardado correctamente");
      } else {
        const error = await response.text();
        alert(`Error al guardar: ${error}`);
      }
    } catch (error) {
      console.error("Error al guardar presupuesto de compra:", error);
      alert("Error al guardar el presupuesto de compra");
    }
  }, [formPresupuestoCompra, calcularTotales, cargarPresupuestosCompra, API_URL, tiposIva]);

  const eliminarPresupuestoCompra = useCallback(async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (response.ok) {
        await cargarPresupuestosCompra();
      } else {
        throw new Error("Error al eliminar");
      }
    } catch (error) {
      console.error("Error al eliminar presupuesto de compra:", error);
      throw error;
    }
  }, [cargarPresupuestosCompra, API_URL]);

  const mostrarSelectorAlmacen = useMemo(() => almacenes.length > 1, [almacenes]);

  const recalcularPreciosLineas = useCallback(async () => {
    const lineasActuales = formPresupuestoCompra.lineas;
    if (!lineasActuales || lineasActuales.length === 0) return;
    
    const lineasActualizadas = await Promise.all(
      lineasActuales.map(async (linea) => {
        if (!linea.productoId) return linea;
        
        if (linea.tieneCondicionComercial === true) {
          return linea;
        }
        
        try {
          const precioData = await tarifasPresupuestoCompra.obtenerPrecioProducto(linea.productoId);
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
    
    setFormPresupuestoCompra(prev => ({ ...prev, lineas: lineasActualizadas }));
  }, [formPresupuestoCompra.lineas, tarifasPresupuestoCompra, setFormPresupuestoCompra]);

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
        setFormPresupuestoCompra((prev) => ({
          ...prev,
          adjuntos: [...(prev.adjuntos || []), adjunto],
        }));
      }
    } catch (error) {
      console.error("Error al subir adjunto:", error);
    }
  }, [ARCHIVOS_API_URL, setFormPresupuestoCompra]);

  const eliminarAdjunto = useCallback(async (adjuntoId) => {
    if (!adjuntoId || adjuntoId === 0) {
      const adjunto = formPresupuestoCompra.adjuntos?.find(a => a.id === adjuntoId || a.id === 0);
      if (adjunto?.idReal) {
        try {
          await fetch(`${ARCHIVOS_API_URL}/${adjunto.idReal}`, { method: "DELETE" });
        } catch (e) {
          console.error("Error al eliminar adjunto temporal:", e);
        }
      }
    }
    setFormPresupuestoCompra((prev) => ({
      ...prev,
      adjuntos: prev.adjuntos.filter((a) => a.id !== adjuntoId),
    }));
  }, [formPresupuestoCompra.adjuntos, ARCHIVOS_API_URL, setFormPresupuestoCompra]);

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

  const totalesFiltrados = useMemo(() => {
    const base = presupuestosCompra.reduce((sum, p) => sum + (p.totalBaseSinImpuestos || p.subtotal || 0), 0);
    const iva = presupuestosCompra.reduce((sum, p) => sum + (p.totalIva || 0), 0);
    const recargo = presupuestosCompra.reduce((sum, p) => sum + (p.totalRecargo || 0), 0);
    const total = presupuestosCompra.reduce((sum, p) => sum + (p.total || 0), 0);
    return { base, iva, recargo, total, count: presupuestosCompra.length };
  }, [presupuestosCompra]);

  return {
    presupuestosCompra,
    documentos: presupuestosCompra,
    formPresupuestoCompra,
    setFormPresupuestoCompra,
    proveedores,
    productos,
    tiposIva,
    almacenes,
    series,
    loading,
    estadoOptions,
    cargarPresupuestosCompra,
    cargarPresupuestoCompra,
    updateFormPresupuestoCompraField,
    setDireccionSnapshot,
    updateDireccionSnapshotField,
    agregarLinea,
    eliminarLinea,
    actualizarLinea,
    calcularTotales,
    guardarPresupuestoCompra,
    eliminarPresupuestoCompra,
    limpiarFormularioPestana,
    permitirCompraMultialmacen,
    mostrarSelectorAlmacen,
    generandoNumero,
    generarNumeroAutomatico,
    subirAdjunto,
    eliminarAdjunto,
    descargarAdjunto,
    tarifasPresupuestoCompra,
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
