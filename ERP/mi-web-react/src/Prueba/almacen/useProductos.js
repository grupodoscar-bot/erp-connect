import { useState, useCallback, useEffect } from "react";

const API_URL = "http://145.223.103.219:8080/productos";
const FAMILIAS_API_URL = "http://145.223.103.219:8080/familias";
const SUBFAMILIAS_API_URL = "http://145.223.103.219:8080/subfamilias";
const FABRICANTES_API_URL = "http://145.223.103.219:8080/fabricantes";
const TIPOS_IVA_API_URL = "http://145.223.103.219:8080/tipos-iva";
const ALMACENES_API_URL = "http://145.223.103.219:8080/almacenes";
const TARIFAS_API_URL = "http://145.223.103.219:8080/tarifas";

const unidadMedidaOptions = ["Unidades", "Kilogramos", "Litros", "Metros", "Caja"];

const formProductoInicial = {
  id: null,
  referencia: "",
  titulo: "",
  nombre: "",
  etiquetas: "",
  descripcionCorta: "",
  notas: "",
  precio: "",
  fabricanteId: "",
  almacenPredeterminadoId: "",
  peso: "",
  unidadMedida: unidadMedidaOptions[0],
  unidadMedidaReferencia: "",
  magnitudPorUnidad: "",
  ultimoCoste: "",
  descuento: "",
  precioBloqueado: false,
  margen: "",
  precioConImpuestos: "",
  familiaIds: [],
  subfamiliaIds: [],
  tipoIvaId: "",
  imagen: null,
  imagenFile: null,
  stockPorAlmacen: [],
};

export function useProductos({ setMensaje, abrirPestana, cerrarPestana, pestanaActiva }) {
  const [productos, setProductos] = useState([]);
  const [familias, setFamilias] = useState([]);
  const [subfamilias, setSubfamilias] = useState([]);
  const [fabricantes, setFabricantes] = useState([]);
  const [tiposIva, setTiposIva] = useState([]);
  const [almacenes, setAlmacenes] = useState([]);
  const [tarifas, setTarifas] = useState([]);
  const [preciosPorTarifa, setPreciosPorTarifa] = useState([]);
  const [productoIdActual, setProductoIdActual] = useState(null);
  const [permitirMultitarifa, setPermitirMultitarifa] = useState(false);
  const [formProducto, setFormProducto] = useState(formProductoInicial);
  const [seccionFormActiva, setSeccionFormActiva] = useState("general");

  const cargarProductos = useCallback(async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      if (Array.isArray(data)) {
        setProductos(data);
      } else if (Array.isArray(data?.content)) {
        setProductos(data.content);
      } else {
        setProductos([]);
      }
    } catch (err) {
      console.error(err);
      setMensaje("Error al cargar productos");
      setProductos([]);
    }
  }, [setMensaje]);

  const cargarFamilias = useCallback(async () => {
    try {
      const res = await fetch(FAMILIAS_API_URL);
      const data = await res.json();
      setFamilias(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setFamilias([]);
    }
  }, []);

  const cargarSubfamilias = useCallback(async () => {
    try {
      const res = await fetch(SUBFAMILIAS_API_URL);
      const data = await res.json();
      setSubfamilias(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setSubfamilias([]);
    }
  }, []);

  const cargarFabricantes = useCallback(async () => {
    try {
      const res = await fetch(FABRICANTES_API_URL);
      const data = await res.json();
      setFabricantes(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const cargarTiposIva = useCallback(async () => {
    try {
      const res = await fetch(TIPOS_IVA_API_URL);
      const data = await res.json();
      setTiposIva(Array.isArray(data) ? data : data.content || []);
    } catch (err) {
      console.error(err);
      setTiposIva([]);
    }
  }, []);

  const cargarAlmacenes = useCallback(async () => {
    try {
      const res = await fetch(ALMACENES_API_URL);
      const data = await res.json();
      setAlmacenes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setAlmacenes([]);
    }
  }, []);

  const limpiarFormProducto = useCallback(() => {
    setFormProducto(formProductoInicial);
    setSeccionFormActiva("general");
  }, []);

  useEffect(() => {
    cargarTiposIva();
    cargarAlmacenes();
  }, [cargarTiposIva, cargarAlmacenes]);

  const cargarProductoEnForm = useCallback((producto) => {
    // If product has warehouse stock, use it; otherwise initialize with all warehouses if multiple exist
    let stockPorAlmacen = [];
    if (producto.stockPorAlmacen && producto.stockPorAlmacen.length > 0) {
      stockPorAlmacen = producto.stockPorAlmacen.map(sa => ({
        almacenId: sa.almacenId,
        almacenNombre: sa.almacenNombre,
        stock: sa.stock,
        stockMinimo: sa.stockMinimo || 0,
        stockMaximo: sa.stockMaximo || null,
        ubicacion: sa.ubicacion || ""
      }));
      
      // Add missing warehouses if any
      if (almacenes.length > 1) {
        const existingIds = new Set(stockPorAlmacen.map(sa => sa.almacenId));
        almacenes.forEach(almacen => {
          if (!existingIds.has(almacen.id)) {
            stockPorAlmacen.push({
              almacenId: almacen.id,
              almacenNombre: almacen.nombre,
              stock: 0,
              stockMinimo: 0,
              stockMaximo: null,
              ubicacion: ""
            });
          }
        });
      }
    } else if (almacenes.length > 1) {
      // Initialize with all warehouses
      stockPorAlmacen = almacenes.map(almacen => ({
        almacenId: almacen.id,
        almacenNombre: almacen.nombre,
        stock: 0,
        stockMinimo: 0,
        stockMaximo: null,
        ubicacion: ""
      }));
    } else if (almacenes.length === 1) {
      stockPorAlmacen = [{
        almacenId: almacenes[0].id,
        almacenNombre: almacenes[0].nombre,
        stock: 0,
        stockMinimo: 0,
        stockMaximo: null,
        ubicacion: ""
      }];
    }
    
    setFormProducto({
      id: producto.id,
      referencia: producto.referencia ?? "",
      titulo: producto.titulo ?? "",
      nombre: producto.nombre ?? "",
      etiquetas: producto.etiquetas ?? "",
      descripcionCorta: producto.descripcionCorta ?? "",
      notas: producto.notas ?? "",
      precio: producto.precio?.toString() ?? "",
      fabricanteId: producto.fabricante?.id?.toString() ?? "",
      almacenPredeterminadoId: producto.almacenPredeterminado?.id?.toString() ?? "",
      peso: producto.peso?.toString() ?? "",
      unidadMedida: producto.unidadMedida || unidadMedidaOptions[0],
      unidadMedidaReferencia: producto.unidadMedidaReferencia ?? "",
      magnitudPorUnidad: producto.magnitudPorUnidad ?? "",
      ultimoCoste: producto.ultimoCoste?.toString() ?? "",
      descuento: producto.descuento?.toString() ?? "",
      precioBloqueado: Boolean(producto.precioBloqueado),
      margen: producto.margen?.toString() ?? "",
      precioConImpuestos: producto.precioConImpuestos?.toString() ?? "",
      familiaIds: producto.familias?.map(f => f.id.toString()) ?? [],
      subfamiliaIds: producto.subfamilias?.map(sf => sf.id.toString()) ?? [],
      tipoIvaId: producto.tipoIva?.id?.toString() ?? "",
      imagen: producto.imagen ?? null,
      imagenFile: null,
      stockPorAlmacen: stockPorAlmacen,
    });
    setSeccionFormActiva("general");
    setProductoIdActual(producto.id);
  }, [almacenes]);

  const abrirNuevoProducto = useCallback(() => {
    limpiarFormProducto();
    setProductoIdActual(null);
    // Initialize stockPorAlmacen with active warehouses (or at least one if exists)
    if (almacenes.length >= 1) {
      const stockInicial = almacenes.map(almacen => ({
        almacenId: almacen.id,
        almacenNombre: almacen.nombre,
        stock: 0,
        stockMinimo: 0,
        stockMaximo: null,
        ubicacion: ""
      }));
      setFormProducto(prev => ({ ...prev, stockPorAlmacen: stockInicial }));
    }
    abrirPestana("producto-nuevo");
  }, [limpiarFormProducto, abrirPestana, almacenes]);

  const abrirEditarProducto = useCallback((producto) => {
    cargarProductoEnForm(producto);
    abrirPestana("producto-editar", producto.id, producto.titulo);
  }, [cargarProductoEnForm, abrirPestana]);

  const abrirVerProducto = useCallback((producto) => {
    abrirPestana("producto-ver", producto.id, `Ver: ${producto.titulo}`);
  }, [abrirPestana]);

  const guardarProducto = useCallback(async (e) => {
    if (e?.preventDefault) e.preventDefault();

    const cuerpo = JSON.stringify({
      referencia: formProducto.referencia,
      titulo: formProducto.titulo,
      nombre: formProducto.nombre,
      precio: parseFloat(formProducto.precio),
      etiquetas: formProducto.etiquetas,
      descripcionCorta: formProducto.descripcionCorta,
      notas: formProducto.notas,
      fabricanteId: formProducto.fabricanteId ? Number(formProducto.fabricanteId) : null,
      almacenPredeterminadoId: formProducto.almacenPredeterminadoId ? Number(formProducto.almacenPredeterminadoId) : null,
      peso: formProducto.peso ? parseFloat(formProducto.peso) : 0,
      unidadMedida: formProducto.unidadMedida,
      unidadMedidaReferencia: formProducto.unidadMedidaReferencia,
      magnitudPorUnidad: formProducto.magnitudPorUnidad,
      ultimoCoste: formProducto.ultimoCoste ? parseFloat(formProducto.ultimoCoste) : 0,
      descuento: formProducto.descuento ? parseFloat(formProducto.descuento) : 0,
      precioBloqueado: formProducto.precioBloqueado,
      margen: formProducto.margen ? parseFloat(formProducto.margen) : 0,
      precioConImpuestos: formProducto.precioConImpuestos ? parseFloat(formProducto.precioConImpuestos) : 0,
      familiaIds: formProducto.familiaIds.map(id => Number(id)),
      subfamiliaIds: formProducto.subfamiliaIds.map(id => Number(id)),
      tipoIvaId: formProducto.tipoIvaId ? Number(formProducto.tipoIvaId) : null,
      stockPorAlmacen: formProducto.stockPorAlmacen.length > 0
        ? formProducto.stockPorAlmacen.map(sa => ({
            almacenId: Number(sa.almacenId),
            stock: parseInt(sa.stock, 10),
            stockMinimo: sa.stockMinimo ? parseInt(sa.stockMinimo, 10) : 0,
            stockMaximo: sa.stockMaximo ? parseInt(sa.stockMaximo, 10) : null,
            ubicacion: sa.ubicacion || null
          }))
        : null,
    });

    try {
      const obtenerDetalleError = async (res) => {
        try {
          const texto = await res.text();
          if (!texto) return `HTTP ${res.status} ${res.statusText}`;
          try {
            const json = JSON.parse(texto);
            return json?.message || json?.error || JSON.stringify(json);
          } catch {
            return texto;
          }
        } catch {
          return `HTTP ${res.status} ${res.statusText}`;
        }
      };

      let res;
      let productoId = formProducto.id;

      if (!formProducto.id) {
        res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: cuerpo,
        });
        if (!res.ok) {
          const detalle = await obtenerDetalleError(res);
          throw new Error(detalle);
        }
        const productoCreado = await res.json();
        productoId = productoCreado.id;
      } else {
        res = await fetch(`${API_URL}/${formProducto.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: cuerpo,
        });
        if (!res.ok) {
          const detalle = await obtenerDetalleError(res);
          throw new Error(detalle);
        }
      }

      // Si hay una imagen nueva, subirla
      if (formProducto.imagenFile && productoId) {
        const formData = new FormData();
        formData.append("file", formProducto.imagenFile);

        try {
          await fetch(`${API_URL}/${productoId}/imagen`, {
            method: "POST",
            body: formData,
          });
        } catch (imgErr) {
          console.error("Error al subir imagen:", imgErr);
          setMensaje("Producto guardado pero error al subir imagen");
        }
      }

      // Guardar precios por tarifa si hay
      console.log("DEBUG - preciosPorTarifa:", preciosPorTarifa);
      if (permitirMultitarifa && productoId && preciosPorTarifa && preciosPorTarifa.length > 0) {
        try {
          const parseNullableFloat = (valor) => {
            if (valor === "" || valor === null || valor === undefined) return null;
            const num = parseFloat(valor);
            return Number.isNaN(num) ? null : num;
          };

          const preciosFiltrados = preciosPorTarifa.filter(pt => pt && pt.tarifaId);
          
          console.log("DEBUG - preciosFiltrados:", preciosFiltrados);
          
          if (preciosFiltrados.length > 0) {
            const payload = preciosFiltrados.map(pt => ({
              tarifaId: parseInt(pt.tarifaId),
              precio: parseNullableFloat(pt.precio),
              descuento: parseNullableFloat(pt.descuento),
              margen: parseNullableFloat(pt.margen),
              precioCompra: parseNullableFloat(pt.precioCompra),
              descuentoCompra: parseNullableFloat(pt.descuentoCompra),
              tipoCalculoPrecioCompra: pt.tipoCalculoPrecioCompra || null,
              valorCalculoCompra: parseNullableFloat(pt.valorCalculoCompra)
            }));
            
            console.log("DEBUG - Enviando precios por tarifa:", payload);
            
            const resTarifa = await fetch(`${API_URL}/${productoId}/precios-tarifa`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload)
            });
            
            console.log("DEBUG - Respuesta del servidor:", resTarifa.status);
            
            if (!resTarifa.ok) {
              const errorText = await resTarifa.text();
              console.error("DEBUG - Error del servidor:", errorText);
            }
          } else {
            console.log("DEBUG - No hay precios filtrados para guardar");
          }
        } catch (tarifaErr) {
          console.error("Error al guardar precios por tarifa:", tarifaErr);
          setMensaje("Producto guardado pero error al guardar precios por tarifa");
        }
      } else {
        console.log("DEBUG - No se cumplen condiciones para guardar precios:", {
          productoId,
          preciosPorTarifaLength: preciosPorTarifa?.length
        });
      }

      await cargarProductos();
      setMensaje("Producto guardado correctamente");
      if (pestanaActiva) cerrarPestana(pestanaActiva);
    } catch (err) {
      console.error(err);
      const detalle = err?.message ? `: ${err.message}` : "";
      setMensaje(`Error al guardar producto${detalle}`);
    }
  }, [formProducto, preciosPorTarifa, cargarProductos, setMensaje, pestanaActiva, cerrarPestana]);

  const borrarProducto = useCallback(async (id) => {
    if (!window.confirm("¿Seguro que quieres borrar este producto?")) return;

    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) throw new Error("Error al borrar");

      await cargarProductos();
      setMensaje("Producto borrado");
    } catch (err) {
      console.error(err);
      setMensaje("Error al borrar producto");
    }
  }, [cargarProductos, setMensaje]);

  // Cargar tarifas
  const cargarTarifas = useCallback(async () => {
    try {
      const res = await fetch(TARIFAS_API_URL);
      const data = await res.json();
      setTarifas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al cargar tarifas:", err);
    }
  }, []);

  // Cargar configuración multitarifa
  const cargarConfiguracionMultitarifa = useCallback(async () => {
    try {
      const res = await fetch("http://145.223.103.219:8080/configuracion-ventas");
      const data = await res.json();
      setPermitirMultitarifa(data.permitirMultitarifa || false);
    } catch (err) {
      console.error("Error al cargar configuración:", err);
    }
  }, []);

  // Cargar precios por tarifa para un producto
  const cargarPreciosPorTarifa = useCallback(async (productoId) => {
    if (!productoId) {
      setPreciosPorTarifa([]);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/${productoId}/precios-tarifa`);
      if (!res.ok) {
        setPreciosPorTarifa([]);
        return;
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        const normalizados = data.map(pt => ({
          tarifaId: pt.tarifaId,
          precio: pt.precio !== null && pt.precio !== undefined ? pt.precio.toString() : "",
          descuento: pt.descuento !== null && pt.descuento !== undefined ? pt.descuento.toString() : "",
          margen: pt.margen !== null && pt.margen !== undefined ? pt.margen.toString() : "",
          precioCompra: pt.precioCompra !== null && pt.precioCompra !== undefined ? pt.precioCompra.toString() : "",
          descuentoCompra: pt.descuentoCompra !== null && pt.descuentoCompra !== undefined ? pt.descuentoCompra.toString() : "",
          tipoCalculoPrecioCompra: pt.tipoCalculoPrecioCompra || "PRECIO_FIJO",
          valorCalculoCompra: pt.valorCalculoCompra !== null && pt.valorCalculoCompra !== undefined ? pt.valorCalculoCompra.toString() : "",
        }));
        setPreciosPorTarifa(normalizados);
      } else {
        setPreciosPorTarifa([]);
      }
    } catch (err) {
      console.error("Error al cargar precios por tarifa:", err);
      setPreciosPorTarifa([]);
    }
  }, []);

  // Actualizar precio por tarifa
  const actualizarPrecioTarifa = useCallback((tarifaId, campo, valor) => {
    setPreciosPorTarifa(prev => {
      const existing = prev.find(pt => pt.tarifaId === tarifaId);
      if (existing) {
        return prev.map(pt => 
          pt.tarifaId === tarifaId 
            ? { ...pt, [campo]: valor }
            : pt
        );
      } else {
        return [...prev, { 
          tarifaId, 
          [campo]: valor, 
          precio: '', 
          descuento: '', 
          margen: '',
          tipoCalculoPrecio: 'PRECIO_FIJO',
          valorCalculo: '',
          precioCompra: '',
          descuentoCompra: '',
          tipoCalculoPrecioCompra: 'PRECIO_FIJO',
          valorCalculoCompra: ''
        }];
      }
    });
    const tarifa = tarifas.find(t => t.id === tarifaId);
    if (tarifa?.esGeneral) {
      setFormProducto(prev => ({
        ...prev,
        ...(campo === "precio" ? { precio: valor } : {}),
        ...(campo === "descuento" ? { descuento: valor } : {}),
        ...(campo === "margen" ? { margen: valor } : {}),
      }));
    }
  }, [tarifas]);

  const updateFormProductoField = useCallback((field, value) => {
    setFormProducto(prev => ({ ...prev, [field]: value }));
  }, []);

  // Mantener sincronizada la tarifa general con el precio base
  useEffect(() => {
    if (!tarifas || tarifas.length === 0) return;
    const tarifaGeneral = tarifas.find(t => t.esGeneral);
    if (!tarifaGeneral) return;

    setPreciosPorTarifa(prev => {
      const valoresGenerales = {
        tarifaId: tarifaGeneral.id,
        precio: formProducto.precio?.toString() ?? "",
        descuento: formProducto.descuento?.toString() ?? "",
        margen: formProducto.margen?.toString() ?? "",
      };

      const existente = prev.find(pt => pt.tarifaId === tarifaGeneral.id);
      if (!existente) {
        return [...prev, valoresGenerales];
      }

      if (
        existente.precio === valoresGenerales.precio &&
        existente.descuento === valoresGenerales.descuento &&
        existente.margen === valoresGenerales.margen
      ) {
        return prev;
      }

      return prev.map(pt =>
        pt.tarifaId === tarifaGeneral.id ? { ...pt, ...valoresGenerales } : pt
      );
    });
  }, [tarifas, formProducto.precio, formProducto.descuento, formProducto.margen]);

  // Cargar precios cuando cambia el producto en edición
  useEffect(() => {
    if (productoIdActual) {
      cargarPreciosPorTarifa(productoIdActual);
    } else {
      setPreciosPorTarifa([]);
    }
  }, [productoIdActual, cargarPreciosPorTarifa]);

  // Cargar datos iniciales
  useEffect(() => {
    cargarConfiguracionMultitarifa();
    cargarTarifas();
  }, [cargarConfiguracionMultitarifa, cargarTarifas]);

  return {
    productos,
    familias,
    subfamilias,
    fabricantes,
    tiposIva,
    almacenes,
    tarifas,
    preciosPorTarifa,
    permitirMultitarifa,
    formProducto,
    seccionFormActiva,
    setSeccionFormActiva,
    cargarProductos,
    cargarFamilias,
    cargarSubfamilias,
    cargarFabricantes,
    cargarTiposIva,
    cargarAlmacenes,
    cargarTarifas,
    cargarPreciosPorTarifa,
    actualizarPrecioTarifa,
    abrirNuevoProducto,
    abrirEditarProducto,
    abrirVerProducto,
    guardarProducto,
    borrarProducto,
    updateFormProductoField,
    unidadMedidaOptions,
  };
}
