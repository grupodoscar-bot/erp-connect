import { useCallback, useMemo, useEffect, useState } from "react";
import API_ENDPOINTS from '../../config/api';
import { aplicarCondicionesProveedorEnLineas, aplicarCondicionComercialEnLinea } from '../../utils/condicionesProveedores';
import { useTarifasPedidoCompra } from './useTarifasPedidoCompra';

const extraerContenido = (data, fallback = []) => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.content)) return data.content;
  return fallback;
};

const STORAGE_KEY_FORMULARIOS = "facturas-compra-formularios";

const leerFormulariosPersistidos = () => {
  try {
    const almacenado = sessionStorage.getItem(STORAGE_KEY_FORMULARIOS);
    if (almacenado) {
      return JSON.parse(almacenado);
    }
  } catch (error) {
    console.warn('[FacturasCompra] No se pudo leer formularios persistidos:', error);
  }
  return {};
};

const guardarFormulariosPersistidos = (formularios) => {
  try {
    sessionStorage.setItem(STORAGE_KEY_FORMULARIOS, JSON.stringify(formularios));
  } catch (error) {
    console.warn('[FacturasCompra] No se pudo guardar formularios persistidos:', error);
  }
};

const formFacturaCompraInicial = {
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

export function useFacturasCompraForm(pestanaActiva = null, session = null) {
  const [facturasCompra, setFacturasCompra] = useState([]);
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
  
  const tarifasPedidoCompra = useTarifasPedidoCompra();
  
  const API_URL = API_ENDPOINTS.facturasCompra;

  const tarifaPorDefectoId = useMemo(() => tarifasPedidoCompra.tarifaPorDefecto?.id?.toString() || "", [tarifasPedidoCompra.tarifaPorDefecto]);

  const setFormFacturaCompra = useCallback((nuevoFormulario, pestanaId = null) => {
    const idPestana = pestanaId || pestanaActiva;
    if (!idPestana) return;
    
    setFormulariosPorPestana(prev => {
      const formularioAnterior = prev[idPestana] || formFacturaCompraInicial;
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

  const formFacturaCompra = formulariosPorPestana[pestanaActiva] || formFacturaCompraInicial;

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
    setFormFacturaCompra(prev => ({ ...prev, tarifaId: idFinal }));
    sincronizarTarifaHook(idFinal);
    return idFinal;
  }, [setFormFacturaCompra, sincronizarTarifaHook, tarifaPorDefectoId]);

  useEffect(() => {
    if (!formFacturaCompra.tarifaId && tarifaPorDefectoId) {
      cambiarTarifaFormulario(tarifaPorDefectoId);
    }

    if (!formFacturaCompra.serieId && series.length > 0) {
      setFormFacturaCompra(prev => ({ ...prev, serieId: series[0].id?.toString() || prev.serieId }));
    }
  }, [formFacturaCompra.tarifaId, formFacturaCompra.serieId, tarifaPorDefectoId, cambiarTarifaFormulario, series, setFormFacturaCompra]);

  const limpiarFormularioPestana = useCallback((pestanaId) => {
    setFormulariosPorPestana(prev => {
      const nuevo = { ...prev };
      delete nuevo[pestanaId];
      guardarFormulariosPersistidos(nuevo);
      return nuevo;
    });
  }, []);

  const cargarFacturasCompra = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}?size=1000`);
      if (response.ok) {
        const data = await response.json();
        const facturas = extraerContenido(data, []);
        
        // Cargar origen de cada documento (igual que ventas)
        const facturasConOrigen = await Promise.all(facturas.map(async (factura) => {
          try {
            const resOrigen = await fetch(`${API_ENDPOINTS.documentoTransformaciones}/origen-directo/FACTURA_COMPRA/${factura.id}`);
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
              return { ...factura, origen: formatearOrigen(dataOrigen) };
            }
            return { ...factura, origen: null };
          } catch (err) {
            return { ...factura, origen: null };
          }
        }));
        
        setFacturasCompra(facturasConOrigen);
      }
    } catch (error) {
      console.error('Error al cargar facturas de compra:', error);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  const cargarFacturaCompra = useCallback(async (id) => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/${id}`);
      if (response.ok) {
        const factura = await response.json();
        
        const direccionEnvioSnapshot = {
          pais: factura.direccionEnvioPais || "",
          codigoPostal: factura.direccionEnvioCodigoPostal || "",
          provincia: factura.direccionEnvioProvincia || "",
          poblacion: factura.direccionEnvioPoblacion || "",
          direccion: factura.direccionEnvioDireccion || "",
        };
        
        const direccionFacturacionSnapshot = {
          pais: factura.direccionFacturacionPais || "",
          codigoPostal: factura.direccionFacturacionCodigoPostal || "",
          provincia: factura.direccionFacturacionProvincia || "",
          poblacion: factura.direccionFacturacionPoblacion || "",
          direccion: factura.direccionFacturacionDireccion || "",
        };
        
        let tarifaFormulario = factura.tarifa?.id?.toString() || factura.tarifaId?.toString() || tarifaPorDefectoId;
        const serieFormulario = factura.serie?.id?.toString() || factura.serieId?.toString() || "";

        const fechaLocal = factura.fecha 
          ? new Date(factura.fecha).toISOString().slice(0, 16)
          : new Date().toISOString().slice(0, 16);

        const formateado = {
          ...formFacturaCompraInicial,
          ...factura,
          id: factura.id,
          fecha: fechaLocal,
          fechaOriginal: fechaLocal,
          proveedorId: factura.proveedor?.id?.toString() || factura.proveedorId?.toString() || "",
          tarifaId: tarifaFormulario,
          almacenId: factura.almacen?.id?.toString() || factura.almacenId?.toString() || "",
          serieId: serieFormulario,
          lineas: (factura.lineas || []).map(linea => ({
            ...linea,
            productoId: linea.producto?.id?.toString() || linea.productoId?.toString() || "",
            tipoIvaId: linea.tipoIva?.id?.toString() || linea.tipoIvaId?.toString() || "",
            almacenId: linea.almacen?.id?.toString() || linea.almacenId?.toString() || "",
          })),
          adjuntos: factura.adjuntos || [],
          descuentoAgrupacionManual: factura.descuentoAgrupacion ?? null,
          direccionEnvioSnapshot,
          direccionFacturacionSnapshot,
          direccionId: factura.direccionId?.toString() || "",
          recargoEquivalencia: factura.recargoEquivalencia || false,
        };
        setFormFacturaCompra(formateado);

        // Pasar el objeto de tarifa completo para sincronizar correctamente
        sincronizarTarifaHook(formateado.tarifaId, factura.tarifa || null);
        return factura;
      }
    } catch (error) {
      console.error('Error al cargar factura de compra:', error);
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
      const response = await fetch(`${API_ENDPOINTS.series}?tipoDocumento=FACTURA_COMPRA`);
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
    const serieId = serieIdParam || formFacturaCompra.serieId;
    
    if (formFacturaCompra.numero && formFacturaCompra.numero.trim() !== "") {
      return;
    }
    
    if (!serieId) {
      setFormFacturaCompra(prev => ({ ...prev, numero: "" }));
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
      
      const params = new URLSearchParams({ serieId: serieIdStr, tipo: "FACTURA_COMPRA" });
      const url = `${API_ENDPOINTS.series}/generar-numero?${params.toString()}`;
      
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        if (data?.numeroGenerado) {
          setFormFacturaCompra(prev => ({ ...prev, numero: data.numeroGenerado, usarCodigoManual: true }));
        }
      }
    } catch (error) {
      console.error('Error al generar número:', error);
    } finally {
      setGenerandoNumero(false);
    }
  }, [formFacturaCompra.serieId, formFacturaCompra.numero]);

  useEffect(() => {
    cargarFacturasCompra();
    cargarProveedores();
    cargarProductos();
    cargarTiposIva();
    cargarAlmacenes();
    cargarSeries();
    cargarConfiguracion();
  }, []);

  const cargarHistorialTransformaciones = useCallback(async (tipoDocumentoOrId, documentoIdParam) => {
    let tipoDocumento = 'FACTURA_COMPRA';
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
      console.error('[FacturasCompra] Error cargando historial:', err);
      setHistorialTransformaciones([]);
      return [];
    } finally {
      setCargandoHistorialTransformaciones(false);
    }
  }, []);

  // Funciones para modal de historial (igual que ventas)
  const abrirModalHistorialDocumento = useCallback(async (documento) => {
    setDocumentoHistorial({ tipo: 'FACTURA_COMPRA', id: documento.id, numero: documento.numero });
    setModalHistorialAbierto(true);
    setCargandoHistorialModal(true);
    try {
      const historial = await cargarHistorialTransformaciones('FACTURA_COMPRA', documento.id);
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
    if (formFacturaCompra.id) {
      cargarHistorialTransformaciones('FACTURA_COMPRA', formFacturaCompra.id);
    } else {
      setHistorialTransformaciones([]);
    }
  }, [formFacturaCompra.id, cargarHistorialTransformaciones]);

  const updateFormFacturaCompraField = useCallback(async (field, value) => {
    if (field === 'proveedorId' && value) {
      const proveedorSeleccionado = proveedores.find(p => p.id === parseInt(value));
      const nuevaTarifaId = proveedorSeleccionado?.tarifaAsignada?.id?.toString()
        || formFacturaCompra.tarifaId
        || tarifaPorDefectoId;
      
      setFormFacturaCompra(prev => {
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
              setFormFacturaCompra(prevForm => ({
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
      setFormFacturaCompra(prev => ({ ...prev, proveedorId: "", descuentoAgrupacionManual: 0 }));
      cambiarTarifaFormulario(null);
    } else if (field === 'serieId' && value) {
      setFormFacturaCompra(prev => {
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
      setFormFacturaCompra(prev => ({ ...prev, [field]: value }));
    }
  }, [setFormFacturaCompra, proveedores, productos, series, almacenes, permitirCompraMultialmacen, sincronizarTarifaHook, cambiarTarifaFormulario, formFacturaCompra.tarifaId, tarifasPedidoCompra.obtenerPrecioProducto, tarifasPedidoCompra.tarifaSeleccionada?.id, tarifaPorDefectoId]);

  const setDireccionSnapshot = useCallback((tipo, valores) => {
    const campo = tipo === "facturacion" ? "direccionFacturacionSnapshot" : "direccionEnvioSnapshot";
    setFormFacturaCompra(prev => ({
      ...prev,
      [campo]: valores,
    }));
  }, [setFormFacturaCompra]);

  const updateDireccionSnapshotField = useCallback((tipo, campo, valor) => {
    const campoSnapshot = tipo === "facturacion" ? "direccionFacturacionSnapshot" : "direccionEnvioSnapshot";
    setFormFacturaCompra(prev => ({
      ...prev,
      [campoSnapshot]: {
        ...prev[campoSnapshot],
        [campo]: valor,
      },
    }));
  }, [setFormFacturaCompra]);

  const agregarLinea = useCallback(() => {
    setFormFacturaCompra(prev => ({
      ...prev,
      lineas: [...prev.lineas, { ...lineaInicial }],
    }));
  }, [setFormFacturaCompra]);

  const eliminarLinea = useCallback((index) => {
    setFormFacturaCompra(prev => ({
      ...prev,
      lineas: prev.lineas.filter((_, i) => i !== index),
    }));
  }, [setFormFacturaCompra]);

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
          console.warn('[FacturasCompra] No se pudo obtener precio de tarifa:', err);
        }

        const lineasPrevias = formFacturaCompra.lineas || [];
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

        setFormFacturaCompra(prev => ({ ...prev, lineas: nuevasLineas }));

        if (formFacturaCompra.proveedorId) {
          const proveedorSeleccionado = proveedores.find(p => p.id === parseInt(formFacturaCompra.proveedorId));
          if (proveedorSeleccionado?.agrupacion?.id) {
            try {
              const lineasConCondiciones = await aplicarCondicionesProveedorEnLineas({
                lineas: nuevasLineas,
                proveedorId: formFacturaCompra.proveedorId,
                proveedorConAgrupacion: proveedorSeleccionado,
                proveedores: proveedores,
                productos: productos,
                condicionesApiUrl: API_ENDPOINTS.condicionesComerciales + '-proveedor',
                tarifaId: tarifasPedidoCompra.tarifaSeleccionada?.id,
                obtenerPrecioTarifa: tarifasPedidoCompra.obtenerPrecioProducto,
              });
              setFormFacturaCompra(prev => ({ ...prev, lineas: lineasConCondiciones }));
            } catch (err) {
              console.error('Error al aplicar condiciones comerciales:', err);
            }
          }
        }
      }
      return;
    }
    
    const lineasPrevias = formFacturaCompra.lineas || [];
    const nuevasLineasGenerales = [...lineasPrevias];
    nuevasLineasGenerales[index] = { ...nuevasLineasGenerales[index], [field]: value };
    setFormFacturaCompra(prev => ({ ...prev, lineas: nuevasLineasGenerales }));
    
    if (field === "cantidad" && formFacturaCompra.proveedorId) {
      const proveedorSeleccionado = proveedores.find(p => p.id === parseInt(formFacturaCompra.proveedorId));
      if (proveedorSeleccionado?.agrupacion?.id) {
        try {
          const lineasActualizadas = await aplicarCondicionComercialEnLinea({
            index,
            lineas: nuevasLineasGenerales,
            proveedorId: formFacturaCompra.proveedorId,
            proveedorConAgrupacion: proveedorSeleccionado,
            proveedores: proveedores,
            productos: productos,
            condicionesApiUrl: API_ENDPOINTS.condicionesComerciales + '-proveedor',
            tarifaId: tarifasPedidoCompra.tarifaSeleccionada?.id,
            obtenerPrecioTarifa: tarifasPedidoCompra.obtenerPrecioProducto,
          });
          setFormFacturaCompra(prev => ({ ...prev, lineas: lineasActualizadas }));
        } catch (err) {
          console.error('Error al aplicar condición comercial:', err);
        }
      }
    }
  }, [productos, tarifasPedidoCompra, formFacturaCompra.proveedorId, formFacturaCompra.lineas, proveedores, setFormFacturaCompra]);

  const calcularTotales = useMemo(() => {
    let subtotalBruto = 0;
    let descuentoTotal = 0;
    let totalIva = 0;
    let totalRecargo = 0;
    const desglosePorIva = {};

    formFacturaCompra.lineas.forEach((linea) => {
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
        const descuentoAgrupacionPct = parseFloat(formFacturaCompra.descuentoAgrupacionManual) || 0;
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
    const descuentoAgrupacionPct = parseFloat(formFacturaCompra.descuentoAgrupacionManual) || 0;
    const descuentoAgrupacionImporte = subtotal * (descuentoAgrupacionPct / 100);
    const totalBaseSinImpuestos = subtotal - descuentoAgrupacionImporte;
    const total = totalBaseSinImpuestos + totalIva + totalRecargo;

    const descuentoAgrupacionBase = (() => {
      if (!formFacturaCompra.proveedorId) return 0;
      const proveedor = proveedores.find(p => p.id === parseInt(formFacturaCompra.proveedorId));
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
  }, [formFacturaCompra.lineas, formFacturaCompra.descuentoAgrupacionManual, formFacturaCompra.proveedorId, proveedores, tiposIva]);

  const guardarFacturaCompra = useCallback(async (e, opciones = {}) => {
    if (e) e.preventDefault();

    try {
      const totales = calcularTotales;
      const direccionEnvio = formFacturaCompra.direccionEnvioSnapshot || {};
      const direccionFacturacion = formFacturaCompra.direccionFacturacionSnapshot || {};
      
      const fechaModificada = formFacturaCompra.fecha !== formFacturaCompra.fechaOriginal;
      const fechaFormateada = fechaModificada 
        ? new Date(formFacturaCompra.fecha).toISOString()
        : null;
      
      const payload = {
        id: formFacturaCompra.id || null,
        numero: formFacturaCompra.numero || "",
        usarCodigoManual: formFacturaCompra.usarCodigoManual || false,
        fecha: fechaFormateada,
        proveedorId: parseInt(formFacturaCompra.proveedorId) || null,
        estado: formFacturaCompra.estado,
        observaciones: formFacturaCompra.observaciones || "",
        notas: formFacturaCompra.notas || "",
        descuentoAgrupacion: formFacturaCompra.descuentoAgrupacionManual ?? 0,
        subtotal: parseFloat(totales.subtotal),
        total: parseFloat(totales.total),
        descuentoTotal: parseFloat(totales.descuentoTotal),
        serieId: formFacturaCompra.serieId ? parseInt(formFacturaCompra.serieId) : null,
        tarifaId: formFacturaCompra.tarifaId ? parseInt(formFacturaCompra.tarifaId) : null,
        almacenId: formFacturaCompra.almacenId ? parseInt(formFacturaCompra.almacenId) : null,
        compraMultialmacen: formFacturaCompra.compraMultialmacen || false,
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
        direccionId: formFacturaCompra.direccionId ? parseInt(formFacturaCompra.direccionId) : null,
        recargoEquivalencia: formFacturaCompra.recargoEquivalencia || false,
        lineas: formFacturaCompra.lineas.map((linea) => {
          const tipoIva = tiposIva.find(t => t.id === parseInt(linea.tipoIvaId));
          const cantidad = parseFloat(linea.cantidad) || 0;
          const precio = parseFloat(linea.precioUnitario) || 0;
          const descuento = parseFloat(linea.descuento) || 0;
          const descuentoAgrupacionPct = parseFloat(formFacturaCompra.descuentoAgrupacionManual) || 0;
          
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

      const url = formFacturaCompra.id ? `${API_URL}/${formFacturaCompra.id}` : API_URL;
      const method = formFacturaCompra.id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const facturaGuardada = await response.json();
        
        const adjuntosIds = (formFacturaCompra.adjuntos || []).map(a => a.id).filter(id => id && id > 0);
        try {
          await fetch(`${API_URL}/${facturaGuardada.id}/adjuntos`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(adjuntosIds),
          });
        } catch (e) {
          console.error("Error al vincular adjuntos:", e);
        }
        
        await cargarFacturasCompra();
        
        if (opciones.cerrarDespues && opciones.cerrarPestana) {
          opciones.cerrarPestana();
        }
        
        alert("Factura de compra guardada correctamente");
      } else {
        const error = await response.text();
        alert(`Error al guardar: ${error}`);
      }
    } catch (error) {
      console.error("Error al guardar factura de compra:", error);
      alert("Error al guardar la factura de compra");
    }
  }, [formFacturaCompra, calcularTotales, cargarFacturasCompra, API_URL, tiposIva]);

  const eliminarFacturaCompra = useCallback(async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (response.ok) {
        await cargarFacturasCompra();
      } else {
        throw new Error("Error al eliminar");
      }
    } catch (error) {
      console.error("Error al eliminar factura de compra:", error);
      throw error;
    }
  }, [cargarFacturasCompra, API_URL]);

  const mostrarSelectorAlmacen = useMemo(() => almacenes.length > 1, [almacenes]);

  const recalcularPreciosLineas = useCallback(async () => {
    const lineasActuales = formFacturaCompra.lineas;
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
    
    setFormFacturaCompra(prev => ({ ...prev, lineas: lineasActualizadas }));
  }, [formFacturaCompra.lineas, tarifasPedidoCompra, setFormFacturaCompra]);

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
        setFormFacturaCompra((prev) => ({
          ...prev,
          adjuntos: [...(prev.adjuntos || []), adjunto],
        }));
      }
    } catch (error) {
      console.error("Error al subir adjunto:", error);
    }
  }, [ARCHIVOS_API_URL, setFormFacturaCompra]);

  const eliminarAdjunto = useCallback(async (adjuntoId) => {
    // Solo eliminar físicamente si es un adjunto temporal (ID 0)
    if (!adjuntoId || adjuntoId === 0) {
      const adjunto = formFacturaCompra.adjuntos?.find(a => a.id === adjuntoId || a.id === 0);
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
    setFormFacturaCompra((prev) => ({
      ...prev,
      adjuntos: prev.adjuntos.filter((a) => a.id !== adjuntoId),
    }));
  }, [formFacturaCompra.adjuntos, ARCHIVOS_API_URL, setFormFacturaCompra]);

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
    const base = facturasCompra.reduce((sum, f) => sum + (f.totalBaseSinImpuestos || f.subtotal || 0), 0);
    const iva = facturasCompra.reduce((sum, f) => sum + (f.totalIva || 0), 0);
    const recargo = facturasCompra.reduce((sum, f) => sum + (f.totalRecargo || 0), 0);
    const total = facturasCompra.reduce((sum, f) => sum + (f.total || 0), 0);
    return { base, iva, recargo, total, count: facturasCompra.length };
  }, [facturasCompra]);

  return {
    facturasCompra,
    documentos: facturasCompra,
    formFacturaCompra,
    setFormFacturaCompra,
    proveedores,
    productos,
    tiposIva,
    almacenes,
    series,
    loading,
    estadoOptions,
    cargarFacturasCompra,
    cargarFacturaCompra,
    updateFormFacturaCompraField,
    setDireccionSnapshot,
    updateDireccionSnapshotField,
    agregarLinea,
    eliminarLinea,
    actualizarLinea,
    calcularTotales,
    guardarFacturaCompra,
    eliminarFacturaCompra,
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
