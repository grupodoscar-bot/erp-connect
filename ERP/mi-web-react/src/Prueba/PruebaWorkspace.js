import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import "./PruebaWorkspace.css";
import logoPng from "../Recursos/logo.png";
import InicioPanel from "./inicio/InicioPanel";

// Iconos SVG
import { ReactComponent as PersonaIcon } from "../Recursos/iconos/persona.svg";
import { ReactComponent as EdificioIcon } from "../Recursos/iconos/edificio.svg";
import { ReactComponent as PersonasIcon } from "../Recursos/iconos/personas.svg";
import { ReactComponent as CarpetaIcon } from "../Recursos/iconos/carpeta.svg";
import { ReactComponent as ProductosIcon } from "../Recursos/iconos/productos.svg";
import { ReactComponent as FamiliasIcon } from "../Recursos/iconos/familias.svg";
import { ReactComponent as SubfamiliasIcon } from "../Recursos/iconos/subfamilias.svg";
import { ReactComponent as CodigoBarrasIcon } from "../Recursos/iconos/codigo-de-barra.svg";
import { ReactComponent as UsuarioEscudoIcon } from "../Recursos/iconos/usuario-escudo.svg";
import { ReactComponent as DiscoDuroIcon } from "../Recursos/iconos/disco-duro.svg";
import { ReactComponent as AvionPapelIcon } from "../Recursos/iconos/avion-papel.svg";
import { ReactComponent as DocumentoIcon } from "../Recursos/iconos/documento.svg";
import { ReactComponent as LibroIcon } from "../Recursos/iconos/libro.svg";
import { ReactComponent as EngranajeIcon } from "../Recursos/iconos/engranaje.svg";
import { ReactComponent as ProvetaIcon } from "../Recursos/iconos/proveta.svg";
import { ReactComponent as CajaIcon } from "../Recursos/iconos/caja.svg";
import { ReactComponent as MonedaIcon } from "../Recursos/iconos/moneda.svg";
import { ReactComponent as AlmacenIcon } from "../Recursos/iconos/almacen.svg";
import { ReactComponent as CestaIcon } from "../Recursos/iconos/cesta.svg";

// Módulos de Clientes
import { useClientes } from "./terceros/useClientes";
import { ListaClientes, FormularioCliente, FichaCliente } from "./terceros/ClientesComponents";

// Módulos de Proveedores
import { useProveedores } from "./terceros/useProveedores";
import { ListaProveedores, FormularioProveedor, FichaProveedor } from "./terceros/ProveedoresComponents";

// Módulos de Fabricantes
import { useFabricantes } from "./terceros/useFabricantes";
import { ListaFabricantes, FormularioFabricante, FichaFabricante } from "./terceros/FabricantesComponents";

// Módulos de Agrupaciones
import { useAgrupaciones } from "./terceros/useAgrupaciones";
import { ListaAgrupaciones, FormularioAgrupacion, FichaAgrupacion, CondicionesAgrupacion } from "./terceros/AgrupacionesComponents";

// Módulos de Agrupaciones de Proveedores
import { useAgrupacionesProveedores } from "./terceros/useAgrupacionesProveedores";
import { ListaAgrupacionesProveedores, FormularioAgrupacionProveedor, CondicionesAgrupacionProveedor } from "./terceros/AgrupacionesProveedoresComponents";

// Módulos de Productos
import { useProductos } from "./almacen/useProductos";
import { ListaProductos, FormularioProducto, FichaProducto } from "./almacen/ProductosComponents";

// Módulos de Almacenes
import { useAlmacenes } from "./almacen/useAlmacenes";
import { ListaAlmacenes, FormularioAlmacen, FichaAlmacen } from "./almacen/AlmacenesComponents";
import { FichaDocumentoVenta } from './ventas/FichaDocumentoVenta';

// Módulos de Familias
import { useFamilias } from "./almacen/useFamilias";
import { ListaFamilias, FormularioFamilia, FichaFamilia } from "./almacen/FamiliasComponents";

// Módulos de Subfamilias
import { useSubfamilias } from "./almacen/useSubfamilias";
import { ListaSubfamilias, FormularioSubfamilia, FichaSubfamilia } from "./almacen/SubfamiliasComponents";

// Módulos de Tipos Código Barra
import { useTiposCodigoBarra } from "./almacen/useTiposCodigoBarra";
import { ListaTiposCodigoBarra, FormularioTipoCodigoBarra, FichaTipoCodigoBarra, ModalPruebaCodigo } from "./almacen/TiposCodigoBarraComponents";

// Módulos de Datos Empresa
import { useDatosEmpresa } from "./empresa/useDatosEmpresa";
import { VistaDatosEmpresa, FormularioDatosEmpresa } from "./empresa/DatosEmpresaComponents";

// Módulos de Usuarios
import { useUsuarios } from "./empresa/useUsuarios";
import { ListaUsuarios, FormularioUsuario, FichaUsuario } from "./empresa/UsuariosComponents";

// Módulos de Disco Virtual
import { useDiscoVirtual } from "./empresa/useDiscoVirtual";
import { VistaDiscoVirtual, ModalNuevaCarpeta, ModalRenombrar } from "./empresa/DiscoVirtualComponents";

// Módulos de Albaranes
import { useAlbaranes } from "./ventas/useAlbaranes";
import { 
  ListaAlbaranes, 
  FormularioAlbaran, 
  FichaAlbaran,
  ModalTransformar,
  ModalEmail,
  ModalPdfMultiple
} from "./ventas/AlbaranesComponents";
import { ModalHistorialTransformaciones } from "./ventas/ModalHistorialTransformaciones";

// Módulos de Presupuestos
import { PresupuestosListado } from "./ventas/PresupuestosComponents";
import { usePresupuestos } from "./ventas/usePresupuestos";

// Módulos de Pedidos
import { PedidosListado } from "./ventas/PedidosComponents";
import { usePedidos } from "./ventas/usePedidos";

// Módulos de Facturas
import { FacturasListado } from "./ventas/FacturasComponents";
import { useFacturasForm } from "./ventas/useFacturasForm";

// Módulos de Facturas Proforma
import { FacturasProformaListado } from "./ventas/FacturasProformaComponents";
import { useFacturasProformaForm } from "./ventas/useFacturasProformaForm";

// Módulos de Facturas Rectificativas
import { FacturasRectificativasListado } from "./ventas/FacturasRectificativasComponents";
import { useFacturasRectificativasForm } from "./ventas/useFacturasRectificativasForm";

// Módulos de Presupuestos de Compra
import { ListaPresupuestosCompra, FormularioPresupuestoCompra, VerPresupuestoCompra } from "./compras/PresupuestosCompraComponents";
import { usePresupuestosCompraForm } from "./compras/usePresupuestosCompraForm";

// Módulos de Pedidos de Compra
import { PedidosCompraListado, FormularioPedidoCompra } from "./compras/PedidosCompraComponents";
import { FichaPedidoCompra } from "./compras/FichaPedidoCompra";
import { usePedidosCompraForm } from "./compras/usePedidosCompraForm";

// Módulos de Albaranes de Compra
import { ListaAlbaranesCompra, FormularioAlbaranCompra, VerAlbaranCompra } from "./compras/AlbaranesCompraComponents";
import { useAlbaranesCompraForm } from "./compras/useAlbaranesCompraForm";

// Módulos de Facturas de Compra
import { ListaFacturasCompra, FormularioFacturaCompra, VerFacturaCompra } from "./compras/FacturasCompraComponents";
import { useFacturasCompraForm } from "./compras/useFacturasCompraForm";

// Módulos de Configuración
import { useConfiguracion } from "./configuracion/useConfiguracion";
import { 
  ConfiguracionVentas,
  ConfiguracionApariencia,
  ConfiguracionPlantillas,
  ConfiguracionTiposIva
} from "./configuracion/ConfiguracionComponents";

// Módulos de Tarifas
import { useTarifas } from "./configuracion/useTarifas";
import { GestionTarifas } from "./configuracion/TarifasComponents";

// Módulos de Movimientos de Stock
import { MovimientosStockView } from "./almacen/MovimientosStockComponents";
import { EditorPlantillaPdf } from "./configuracion/EditorPlantillaPdf";
import { useSeries } from "./configuracion/useSeries";
import { ConfiguracionSeries } from "./configuracion/ConfiguracionSeries";

// Módulo TPV
import { useTPV } from "./tpv/useTPV";
import TPVView from "./tpv/TPVView";
import { useFacturasSimplificadas } from "./tpv/useFacturasSimplificadas";
import { ListaFacturasSimplificadas, FichaFacturaSimplificada } from "./tpv/FacturasSimplificadasComponents";
import { useConfiguracionTPV } from "./tpv/useConfiguracionTPV";
import { ConfiguracionTPV } from "./tpv/ConfiguracionTPVComponents";

const TITULOS_DEFAULT = {
  clientes: "Clientes",
  "cliente-nuevo": "Nuevo Cliente",
  proveedores: "Proveedores",
  "proveedor-nuevo": "Nuevo Proveedor",
  productos: "Productos",
  "producto-nuevo": "Nuevo Producto",
  fabricantes: "Fabricantes",
  "fabricante-nuevo": "Nuevo Fabricante",
  almacenes: "Almacenes",
  "almacen-nuevo": "Nuevo Almacén",
};

const obtenerTituloPorDefecto = (tipo, id) => {
  if (TITULOS_DEFAULT[tipo]) return TITULOS_DEFAULT[tipo];
  if (id) return `#${id}`;
  return "Nuevo";
};

const construirIdPestana = (tipo, id) => {
  if (id) return `${tipo}-${id}`;
  const esFormularioIndividual = /-(nuevo|editar|ver)$/i.test(tipo);
  if (esFormularioIndividual) {
    return `${tipo}-${Date.now()}`;
  }
  return tipo;
};

const MENUS_ESTADO_INICIAL = {
  terceros: false,
  almacen: false,
  empresa: false,
  ventas: false,
  compras: false,
  configuracion: false,
  tpv: false,
};

export default function PruebaWorkspace({ session }) {
  // Sistema de pestañas dinámicas
  const [pestanasAbiertas, setPestanasAbiertas] = useState([]);
  const [pestanaActiva, setPestanaActiva] = useState(null);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    if (!mensaje) return;

    const timer = setTimeout(() => setMensaje(""), 5000);
    return () => clearTimeout(timer);
  }, [mensaje]);

  // Menú sidebar desplegable
  const [menusDesplegados, setMenusDesplegados] = useState(() => ({ ...MENUS_ESTADO_INICIAL }));
  const [sidebarColapsado, setSidebarColapsado] = useState(false);

  const toggleMenu = (menu) => {
    setMenusDesplegados(prev => {
      if (sidebarColapsado) {
        // En modo colapsado, solo un menú abierto a la vez
        const nuevoEstado = { ...MENUS_ESTADO_INICIAL };
        nuevoEstado[menu] = !prev[menu];
        return nuevoEstado;
      } else {
        // En modo expandido, comportamiento normal
        return { ...prev, [menu]: !prev[menu] };
      }
    });
  };

  // Cerrar todos los menús cuando se colapsa/expande el sidebar
  useEffect(() => {
    setMenusDesplegados({ ...MENUS_ESTADO_INICIAL });
  }, [sidebarColapsado]);

  // Cerrar menús al hacer clic fuera cuando está colapsado
  useEffect(() => {
    if (!sidebarColapsado) return;

    const handleClickOutside = (e) => {
      const sidebar = document.querySelector('.erp-sidebar');
      if (sidebar && !sidebar.contains(e.target)) {
        setMenusDesplegados({ ...MENUS_ESTADO_INICIAL });
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarColapsado]);

  // Verificar permisos del usuario actual
  const tienePermiso = useCallback((modulo) => {
    return session?.permisos?.[modulo] === true;
  }, [session]);

  // Gestión de pestañas (se define primero, luego se actualiza con recargarModulo)
  const abrirPestana = useCallback((tipo, id = null, titulo = null) => {
    const pestanaId = construirIdPestana(tipo, id);

    setPestanasAbiertas(prev => {
      const existe = prev.find(p => p.id === pestanaId);
      if (existe) {
        setPestanaActiva(pestanaId);
        return prev;
      }

      const nuevaPestana = {
        id: pestanaId,
        tipo,
        titulo: titulo || obtenerTituloPorDefecto(tipo, id),
        datos: id || null
      };

      setPestanaActiva(pestanaId);
      return [...prev, nuevaPestana];
    });
  }, []);

  // Exponer abrirPestana globalmente para el historial de transformaciones
  useEffect(() => {
    window.abrirPestana = abrirPestana;
    return () => {
      delete window.abrirPestana;
    };
  }, [abrirPestana]);

  // Definición temporal de cerrarPestana (se redefinirá después de inicializar los módulos)
  const cerrarPestana = useCallback((pestanaId, e) => {
    e?.stopPropagation();
    setPestanasAbiertas(prev => {
      const nuevas = prev.filter(p => p.id !== pestanaId);
      setPestanaActiva(current => {
        if (current === pestanaId) {
          return nuevas.length > 0 ? nuevas[nuevas.length - 1].id : null;
        }
        return current;
      });
      return nuevas;
    });
  }, []);

  // Hook de Clientes
  const clientesModule = useClientes({
    setMensaje,
    abrirPestana,
    cerrarPestana,
    pestanaActiva,
  });

  // Hook de Proveedores
  const proveedoresModule = useProveedores({
    setMensaje,
    abrirPestana,
    cerrarPestana,
    pestanaActiva,
  });

  // Hook de Fabricantes
  const fabricantesModule = useFabricantes({
    setMensaje,
    abrirPestana,
    cerrarPestana,
    pestanaActiva,
  });

  // Hook de Agrupaciones
  const agrupacionesModule = useAgrupaciones({
    setMensaje,
    abrirPestana,
    cerrarPestana,
    pestanaActiva,
  });

  // Hook de Agrupaciones de Proveedores
  const agrupacionesProveedoresModule = useAgrupacionesProveedores({
    setMensaje,
    abrirPestana,
    cerrarPestana,
    pestanaActiva,
  });

  // Hook de Productos
  const productosModule = useProductos({
    setMensaje,
    abrirPestana,
    cerrarPestana,
    pestanaActiva,
  });

  // Hook de Almacenes
  const almacenesModule = useAlmacenes({
    setMensaje,
    abrirPestana,
    cerrarPestana,
    pestanaActiva,
  });

  // Hook de Familias
  const familiasModule = useFamilias({
    setMensaje,
    abrirPestana,
    cerrarPestana,
    pestanaActiva,
  });

  // Hook de Subfamilias
  const subfamiliasModule = useSubfamilias({
    setMensaje,
    abrirPestana,
    cerrarPestana,
    pestanaActiva,
  });

  // Hook de Tipos Código Barra
  const tiposCodigoBarraModule = useTiposCodigoBarra({
    setMensaje,
    abrirPestana,
    cerrarPestana,
    pestanaActiva,
  });

  // Hook de Datos Empresa
  const datosEmpresaModule = useDatosEmpresa({
    setMensaje,
    abrirPestana,
    cerrarPestana,
    pestanaActiva,
  });

  // Hook de Usuarios
  const usuariosModule = useUsuarios({
    setMensaje,
    abrirPestana,
    cerrarPestana,
    pestanaActiva,
  });

  // Hook de Disco Virtual
  const discoVirtualModule = useDiscoVirtual({
    setMensaje,
  });

  // Hook de Albaranes
  const albaranesModule = useAlbaranes({
    setMensaje,
    abrirPestana,
    cerrarPestana,
    pestanaActiva,
    session,
  });

  // Hooks de otros documentos de venta
  const presupuestosModule = usePresupuestos(pestanaActiva, session);
  const pedidosModule = usePedidos(pestanaActiva, session);
  const facturasModule = useFacturasForm(pestanaActiva, session);
  const facturasProformaModule = useFacturasProformaForm(pestanaActiva, session);
  const facturasRectificativasModule = useFacturasRectificativasForm(pestanaActiva, session);
  const presupuestosCompraModule = usePresupuestosCompraForm(pestanaActiva);
  const pedidosCompraModule = usePedidosCompraForm(pestanaActiva);
  const albaranesCompraModule = useAlbaranesCompraForm(pestanaActiva);
  const facturasCompraModule = useFacturasCompraForm(pestanaActiva);

  // Rastrear qué pestañas ya han cargado datos
  const pestanasCargadasRef = useRef(new Set());

  // Cargar datos de edición cuando se abre una pestaña de editar
  useEffect(() => {
    const pestanaActual = pestanasAbiertas.find(p => p.id === pestanaActiva);
    if (!pestanaActual) return;
    
    // Si ya cargamos datos para esta pestaña, no volver a cargar
    if (pestanasCargadasRef.current.has(pestanaActiva)) return;
    
    let id;
    
    if (pestanaActual.tipo === 'presupuesto-editar' && pestanaActual.datos) {
      id = pestanaActual.datos;
      pestanasCargadasRef.current.add(pestanaActiva);
      presupuestosModule.cargarPresupuestoParaEditar({ id, pestanaId: pestanaActiva });
    } else if (pestanaActual.tipo === 'pedido-editar' && pestanaActual.datos) {
      id = pestanaActual.datos;
      pestanasCargadasRef.current.add(pestanaActiva);
      pedidosModule.cargarPedidoParaEditar({ id, pestanaId: pestanaActiva });
    } else if (pestanaActual.tipo === 'factura-editar' && pestanaActual.datos) {
      id = pestanaActual.datos;
      pestanasCargadasRef.current.add(pestanaActiva);
      facturasModule.cargarFactura({ id, pestanaId: pestanaActiva });
    } else if (pestanaActual.tipo === 'factura-proforma-editar' && pestanaActual.datos) {
      id = pestanaActual.datos;
      pestanasCargadasRef.current.add(pestanaActiva);
      facturasProformaModule.cargarFacturaProformaParaEditar({ id, pestanaId: pestanaActiva });
    } else if (pestanaActual.tipo === 'factura-rectificativa-editar' && pestanaActual.datos) {
      id = pestanaActual.datos;
      pestanasCargadasRef.current.add(pestanaActiva);
      facturasRectificativasModule.cargarFacturaRectificativaParaEditar({ id, pestanaId: pestanaActiva });
    }
  }, [pestanaActiva, pestanasAbiertas, presupuestosModule, pedidosModule, facturasModule, facturasProformaModule, facturasRectificativasModule]);

  // Hook de Configuración
  const configuracionModule = useConfiguracion({
    setMensaje,
  });

  // Hook de Tarifas
  const tarifasModule = useTarifas({
    setMensaje,
  });

  // Hook de Series
  const seriesModule = useSeries({
    setMensaje,
  });

  const tpvModule = useTPV({ setMensaje });

  const facturasSimplificadasModule = useFacturasSimplificadas({
    setMensaje,
    abrirPestana,
    cerrarPestana,
    pestanaActiva,
    imprimirTicketTPV: tpvModule.imprimirTicket,
  });

  const configuracionTPVModule = useConfiguracionTPV({
    setMensaje,
  });

  // Función para abrir pestaña y recargar datos del módulo
  const abrirPestanaConRecarga = useCallback((tipo, id = null, titulo = null) => {
    // Recargar datos del módulo correspondiente
    switch (tipo) {
      case "clientes":
        clientesModule.cargarClientes();
        break;
      case "proveedores":
        proveedoresModule.cargarProveedores();
        break;
      case "fabricantes":
        fabricantesModule.cargarFabricantes();
        break;
      case "agrupaciones":
        agrupacionesModule.cargarAgrupaciones();
        break;
      case "agrupaciones-proveedores":
        agrupacionesProveedoresModule.cargarAgrupaciones();
        break;
      case "productos":
        productosModule.cargarProductos();
        break;
      case "almacenes":
        almacenesModule.cargarAlmacenes();
        break;
      case "tpv":
        tpvModule.cargarDatos();
        break;
      case "facturas-simplificadas":
        facturasSimplificadasModule.cargarFacturasSimplificadas();
        break;
      case "config-tpv":
        configuracionTPVModule.cargarConfiguraciones();
        break;
      case "familias":
        familiasModule.cargarFamilias();
        break;
      case "subfamilias":
        subfamiliasModule.cargarSubfamilias();
        break;
      case "tipos-codigo-barra":
        tiposCodigoBarraModule.cargarTipos();
        break;
      case "datos-empresa":
        datosEmpresaModule.cargarEmpresa();
        break;
      case "usuarios":
        usuariosModule.cargarUsuarios();
        break;
      case "disco-virtual":
        discoVirtualModule.cargarArchivos();
        break;
      case "albaranes":
        albaranesModule.cargarAlbaranes();
        break;
      default:
        break;
    }
    // Abrir la pestaña
    abrirPestana(tipo, id, titulo);
  }, [abrirPestana, clientesModule, proveedoresModule, fabricantesModule, agrupacionesModule, productosModule, familiasModule, subfamiliasModule, tiposCodigoBarraModule, datosEmpresaModule, usuariosModule, discoVirtualModule, albaranesModule]);

  // Limpiar formularios cuando se cierran pestañas
  const pestanasAbiertasRef = useRef(pestanasAbiertas);
  useEffect(() => {
    const pestanasCerradas = pestanasAbiertasRef.current.filter(
      prev => !pestanasAbiertas.find(actual => actual.id === prev.id)
    );
    
    pestanasCerradas.forEach(pestana => {
      // Limpiar del Set de pestañas cargadas
      pestanasCargadasRef.current.delete(pestana.id);
      
      // Limpiar formulario del mapa
      if (pestana.tipo?.startsWith('presupuesto-')) {
        presupuestosModule?.limpiarFormularioPestana?.(pestana.id);
      } else if (pestana.tipo?.startsWith('pedido-')) {
        pedidosModule?.limpiarFormularioPestana?.(pestana.id);
      } else if (pestana.tipo?.startsWith('factura-rectificativa-')) {
        facturasRectificativasModule?.limpiarFormularioPestana?.(pestana.id);
      } else if (pestana.tipo?.startsWith('factura-proforma-')) {
        facturasProformaModule?.limpiarFormularioPestana?.(pestana.id);
      } else if (pestana.tipo?.startsWith('factura-')) {
        facturasModule?.limpiarFormularioPestana?.(pestana.id);
      } else if (pestana.tipo?.startsWith('albaran-')) {
        albaranesModule?.limpiarFormularioPestana?.(pestana.id);
      }
    });
    
    pestanasAbiertasRef.current = pestanasAbiertas;
  }, [pestanasAbiertas, presupuestosModule, pedidosModule, facturasModule, facturasProformaModule, facturasRectificativasModule, albaranesModule]);

  const quickAccessShortcuts = useMemo(
    () => [
      { id: "clientes", label: "Clientes", icon: PersonaIcon, category: "Terceros" },
      { id: "proveedores", label: "Proveedores", icon: EdificioIcon, category: "Terceros" },
      { id: "fabricantes", label: "Fabricantes", icon: ProvetaIcon, category: "Terceros" },
      { id: "agrupaciones", label: "Agrupaciones", icon: PersonasIcon, category: "Terceros" },
      { id: "productos", label: "Productos", icon: ProductosIcon, category: "Almacén" },
      { id: "familias", label: "Familias", icon: FamiliasIcon, category: "Almacén" },
      { id: "subfamilias", label: "Subfamilias", icon: SubfamiliasIcon, category: "Almacén" },
      { id: "tipos-codigo-barra", label: "Formatos códigos de barras", icon: CodigoBarrasIcon, category: "Almacén" },
      { id: "datos-empresa", label: "Datos Empresa", icon: EdificioIcon, category: "Empresa" },
      { id: "usuarios", label: "Usuarios", icon: UsuarioEscudoIcon, category: "Empresa" },
      { id: "disco-virtual", label: "Disco Virtual", icon: DiscoDuroIcon, category: "Empresa" },
      { id: "albaranes", label: "Albaranes", icon: LibroIcon, category: "Ventas" },
      { id: "tpv", label: "Terminal TPV", icon: CajaIcon, category: "TPV" },
      { id: "facturas-simplificadas", label: "Facturas Simplificadas", icon: DocumentoIcon, category: "TPV" },
      { id: "config-tpv", label: "Configuración TPV", icon: EngranajeIcon, category: "TPV" },
      { id: "config-ventas", label: "Config. Ventas", icon: LibroIcon, category: "Configuración" },
      { id: "config-apariencia", label: "Apariencia", icon: EngranajeIcon, category: "Configuración" },
      { id: "config-plantillas", label: "Plantillas PDF", icon: DocumentoIcon, category: "Configuración" },
      { id: "config-tipos-iva", label: "Tipos de IVA", icon: MonedaIcon, category: "Configuración" },
      { id: "config-series", label: "Series", icon: LibroIcon, category: "Configuración" },
    ],
    [],
  );

  const handleShortcutLaunch = useCallback(
    (shortcutId) => {
      switch (shortcutId) {
        case "clientes":
        case "proveedores":
        case "fabricantes":
        case "agrupaciones":
        case "productos":
        case "familias":
        case "subfamilias":
        case "tipos-codigo-barra":
        case "datos-empresa":
        case "usuarios":
        case "disco-virtual":
        case "albaranes":
        case "tpv":
        case "facturas-simplificadas":
        case "config-tpv":
        case "config-ventas":
        case "config-apariencia":
        case "config-plantillas":
        case "config-tipos-iva":
        case "config-series":
          abrirPestanaConRecarga(shortcutId, null, quickAccessShortcuts.find(item => item.id === shortcutId)?.label);
          break;
        default:
          break;
      }
    },
    [abrirPestanaConRecarga, quickAccessShortcuts],
  );

  const volverAlInicio = useCallback(() => {
    setPestanaActiva(null);
    setMensaje("");
  }, []);

  // Renderizado de contenido según pestaña activa
  const renderContenidoPestana = () => {
    if (!pestanaActiva) {
      return (
        <InicioPanel
          session={session}
          shortcuts={quickAccessShortcuts}
          onShortcutLaunch={handleShortcutLaunch}
          abrirVerAlbaran={albaranesModule.abrirVerAlbaran}
        />
      );
    }

    const pestana = pestanasAbiertas.find(p => p.id === pestanaActiva);
    if (!pestana) return null;

    switch (pestana.tipo) {
      case "clientes":
        return (
          <ListaClientes
            clientes={clientesModule.clientes}
            abrirNuevoCliente={clientesModule.abrirNuevoCliente}
            abrirVerCliente={clientesModule.abrirVerCliente}
            abrirEditarCliente={clientesModule.abrirEditarCliente}
            borrarCliente={clientesModule.borrarCliente}
          />
        );
      case "cliente-nuevo":
      case "cliente-editar":
        return (
          <FormularioCliente
            formCliente={clientesModule.formCliente}
            seccionFormActiva={clientesModule.seccionFormActiva}
            setSeccionFormActiva={clientesModule.setSeccionFormActiva}
            agrupacionesDisponibles={clientesModule.agrupacionesDisponibles}
            tarifasDisponibles={tarifasModule.tarifas}
            updateFormField={clientesModule.updateFormField}
            agregarDireccion={clientesModule.agregarDireccion}
            actualizarDireccion={clientesModule.actualizarDireccion}
            eliminarDireccion={clientesModule.eliminarDireccion}
            guardarCliente={clientesModule.guardarCliente}
            cerrarPestana={cerrarPestana}
            pestanaActiva={pestanaActiva}
            formasPago={clientesModule.formasPago}
            tarifas={clientesModule.tarifas}
            modosImpuesto={clientesModule.modosImpuesto}
            retenciones={clientesModule.retenciones}
            permitirMultitarifa={configuracionModule.permitirMultitarifa}
          />
        );
      case "cliente-ver":
        return (
          <FichaCliente
            clientes={clientesModule.clientes}
            clienteId={pestana.datos}
            abrirEditarCliente={clientesModule.abrirEditarCliente}
            albaranes={albaranesModule.albaranes}
            abrirVerAlbaran={albaranesModule.abrirVerAlbaran}
          />
        );
      case "proveedores":
        return (
          <ListaProveedores
            proveedores={proveedoresModule.proveedores}
            abrirNuevoProveedor={proveedoresModule.abrirNuevoProveedor}
            abrirVerProveedor={proveedoresModule.abrirVerProveedor}
            abrirEditarProveedor={proveedoresModule.abrirEditarProveedor}
            borrarProveedor={proveedoresModule.borrarProveedor}
          />
        );
      case "proveedor-nuevo":
      case "proveedor-editar":
        return (
          <FormularioProveedor
            formProveedor={proveedoresModule.formProveedor}
            seccionFormActiva={proveedoresModule.seccionFormActiva}
            setSeccionFormActiva={proveedoresModule.setSeccionFormActiva}
            agrupacionesDisponibles={proveedoresModule.agrupacionesDisponibles}
            updateFormProveedorField={proveedoresModule.updateFormProveedorField}
            agregarDireccion={proveedoresModule.agregarDireccion}
            actualizarDireccion={proveedoresModule.actualizarDireccion}
            eliminarDireccion={proveedoresModule.eliminarDireccion}
            guardarProveedor={proveedoresModule.guardarProveedor}
            cerrarPestana={cerrarPestana}
            pestanaActiva={pestanaActiva}
            formasPago={proveedoresModule.formasPago}
            tarifas={proveedoresModule.tarifas}
            modosImpuesto={proveedoresModule.modosImpuesto}
            retenciones={proveedoresModule.retenciones}
          />
        );
      case "proveedor-ver":
        return (
          <FichaProveedor
            proveedores={proveedoresModule.proveedores}
            proveedorId={pestana.datos}
            abrirEditarProveedor={proveedoresModule.abrirEditarProveedor}
          />
        );
      case "fabricantes":
        return (
          <ListaFabricantes
            fabricantes={fabricantesModule.fabricantes}
            abrirNuevoFabricante={fabricantesModule.abrirNuevoFabricante}
            abrirVerFabricante={fabricantesModule.abrirVerFabricante}
            abrirEditarFabricante={fabricantesModule.abrirEditarFabricante}
            borrarFabricante={fabricantesModule.borrarFabricante}
          />
        );
      case "fabricante-nuevo":
      case "fabricante-editar":
        return (
          <FormularioFabricante
            formFabricante={fabricantesModule.formFabricante}
            seccionFormActiva={fabricantesModule.seccionFormActiva}
            setSeccionFormActiva={fabricantesModule.setSeccionFormActiva}
            agrupacionesDisponibles={fabricantesModule.agrupacionesDisponibles}
            updateFormFabricanteField={fabricantesModule.updateFormFabricanteField}
            agregarDireccion={fabricantesModule.agregarDireccion}
            actualizarDireccion={fabricantesModule.actualizarDireccion}
            eliminarDireccion={fabricantesModule.eliminarDireccion}
            guardarFabricante={fabricantesModule.guardarFabricante}
            cerrarPestana={cerrarPestana}
            pestanaActiva={pestanaActiva}
            formasPago={fabricantesModule.formasPago}
            tarifas={fabricantesModule.tarifas}
            modosImpuesto={fabricantesModule.modosImpuesto}
            retenciones={fabricantesModule.retenciones}
          />
        );
      case "fabricante-ver":
        return (
          <FichaFabricante
            fabricantes={fabricantesModule.fabricantes}
            fabricanteId={pestana.datos}
            abrirEditarFabricante={fabricantesModule.abrirEditarFabricante}
          />
        );
      case "agrupaciones":
        return (
          <ListaAgrupaciones
            agrupaciones={agrupacionesModule.agrupaciones}
            abrirNuevaAgrupacion={agrupacionesModule.abrirNuevaAgrupacion}
            abrirVerAgrupacion={agrupacionesModule.abrirVerAgrupacion}
            abrirEditarAgrupacion={agrupacionesModule.abrirEditarAgrupacion}
            abrirCondicionesAgrupacion={agrupacionesModule.abrirCondicionesAgrupacion}
            borrarAgrupacion={agrupacionesModule.borrarAgrupacion}
          />
        );
      case "agrupacion-nuevo":
      case "agrupacion-editar":
        return (
          <FormularioAgrupacion
            formAgrupacion={agrupacionesModule.formAgrupacion}
            updateFormAgrupacionField={agrupacionesModule.updateFormAgrupacionField}
            guardarAgrupacion={agrupacionesModule.guardarAgrupacion}
            cerrarPestana={cerrarPestana}
            pestanaActiva={pestanaActiva}
          />
        );
      case "agrupacion-ver":
        return (
          <FichaAgrupacion
            agrupaciones={agrupacionesModule.agrupaciones}
            agrupacionId={pestana.datos}
            abrirEditarAgrupacion={agrupacionesModule.abrirEditarAgrupacion}
            abrirCondicionesAgrupacion={agrupacionesModule.abrirCondicionesAgrupacion}
          />
        );
      case "agrupacion-condiciones":
        return (
          <CondicionesAgrupacion
            agrupacionSeleccionada={agrupacionesModule.agrupacionSeleccionada}
            condiciones={agrupacionesModule.condiciones}
            productos={agrupacionesModule.productos}
            tarifas={agrupacionesModule.tarifas}
            formCondicion={agrupacionesModule.formCondicion}
            modalCondicionAbierto={agrupacionesModule.modalCondicionAbierto}
            guardandoCondicion={agrupacionesModule.guardandoCondicion}
            abrirNuevaCondicion={agrupacionesModule.abrirNuevaCondicion}
            cerrarModalCondicion={agrupacionesModule.cerrarModalCondicion}
            editarCondicion={agrupacionesModule.editarCondicion}
            guardarCondicion={agrupacionesModule.guardarCondicion}
            borrarCondicion={agrupacionesModule.borrarCondicion}
            updateFormCondicionField={agrupacionesModule.updateFormCondicionField}
            cerrarPestana={cerrarPestana}
            pestanaActiva={pestanaActiva}
          />
        );
      case "agrupaciones-proveedores":
        return (
          <ListaAgrupacionesProveedores
            agrupaciones={agrupacionesProveedoresModule.agrupaciones}
            abrirNuevaAgrupacion={agrupacionesProveedoresModule.abrirNuevaAgrupacion}
            abrirVerAgrupacion={agrupacionesProveedoresModule.abrirVerAgrupacion}
            abrirEditarAgrupacion={agrupacionesProveedoresModule.abrirEditarAgrupacion}
            abrirCondicionesAgrupacion={agrupacionesProveedoresModule.abrirCondicionesAgrupacion}
            borrarAgrupacion={agrupacionesProveedoresModule.borrarAgrupacion}
          />
        );
      case "agrupacion-proveedor-nueva":
      case "agrupacion-proveedor-editar":
        return (
          <FormularioAgrupacionProveedor
            formAgrupacion={agrupacionesProveedoresModule.formAgrupacion}
            updateFormAgrupacionField={agrupacionesProveedoresModule.updateFormAgrupacionField}
            guardarAgrupacion={agrupacionesProveedoresModule.guardarAgrupacion}
            cerrarPestana={cerrarPestana}
            pestanaActiva={pestanaActiva}
          />
        );
      case "condiciones-proveedor":
        return (
          <CondicionesAgrupacionProveedor
            agrupacionSeleccionada={agrupacionesProveedoresModule.agrupacionSeleccionada}
            condiciones={agrupacionesProveedoresModule.condiciones}
            productos={agrupacionesProveedoresModule.productos}
            tarifas={agrupacionesProveedoresModule.tarifas}
            formCondicion={agrupacionesProveedoresModule.formCondicion}
            modalCondicionAbierto={agrupacionesProveedoresModule.modalCondicionAbierto}
            guardandoCondicion={agrupacionesProveedoresModule.guardandoCondicion}
            abrirNuevaCondicion={agrupacionesProveedoresModule.abrirNuevaCondicion}
            cerrarModalCondicion={agrupacionesProveedoresModule.cerrarModalCondicion}
            editarCondicion={agrupacionesProveedoresModule.editarCondicion}
            guardarCondicion={agrupacionesProveedoresModule.guardarCondicion}
            borrarCondicion={agrupacionesProveedoresModule.borrarCondicion}
            updateFormCondicionField={agrupacionesProveedoresModule.updateFormCondicionField}
            cerrarPestana={cerrarPestana}
            pestanaActiva={pestanaActiva}
          />
        );
      // ========== ALMACÉN ==========
      case "productos":
        return (
          <ListaProductos
            productos={productosModule.productos}
            abrirNuevoProducto={productosModule.abrirNuevoProducto}
            abrirVerProducto={productosModule.abrirVerProducto}
            abrirEditarProducto={productosModule.abrirEditarProducto}
            borrarProducto={productosModule.borrarProducto}
          />
        );
      case "producto-nuevo":
      case "producto-editar":
        return (
          <FormularioProducto
            formProducto={productosModule.formProducto}
            seccionFormActiva={productosModule.seccionFormActiva}
            setSeccionFormActiva={productosModule.setSeccionFormActiva}
            familias={productosModule.familias}
            subfamilias={productosModule.subfamilias}
            fabricantes={productosModule.fabricantes}
            updateFormProductoField={productosModule.updateFormProductoField}
            guardarProducto={productosModule.guardarProducto}
            cerrarPestana={cerrarPestana}
            pestanaActiva={pestanaActiva}
            tipoImpuestoOptions={productosModule.tipoImpuestoOptions}
            unidadMedidaOptions={productosModule.unidadMedidaOptions}
            tiposIva={productosModule.tiposIva}
            almacenes={productosModule.almacenes}
            tarifas={productosModule.tarifas}
            preciosPorTarifa={productosModule.preciosPorTarifa}
            actualizarPrecioTarifa={productosModule.actualizarPrecioTarifa}
            permitirMultitarifa={productosModule.permitirMultitarifa}
          />
        );
      case "producto-ver":
        return (
          <FichaProducto
            productos={productosModule.productos}
            productoId={pestana.datos}
            abrirEditarProducto={productosModule.abrirEditarProducto}
          />
        );
      case "almacenes":
        return (
          <ListaAlmacenes
            almacenes={almacenesModule.almacenes}
            abrirNuevoAlmacen={almacenesModule.abrirNuevoAlmacen}
            abrirVerAlmacen={almacenesModule.abrirVerAlmacen}
            abrirEditarAlmacen={almacenesModule.abrirEditarAlmacen}
            borrarAlmacen={almacenesModule.borrarAlmacen}
          />
        );
      case "almacen-nuevo":
      case "almacen-editar":
        return (
          <FormularioAlmacen
            formAlmacen={almacenesModule.formAlmacen}
            updateFormAlmacenField={almacenesModule.updateFormAlmacenField}
            guardarAlmacen={almacenesModule.guardarAlmacen}
            cerrarPestana={cerrarPestana}
            pestanaActiva={pestanaActiva}
          />
        );
      case "almacen-ver":
        return (
          <FichaAlmacen
            almacenes={almacenesModule.almacenes}
            almacenId={pestana.datos}
            abrirEditarAlmacen={almacenesModule.abrirEditarAlmacen}
          />
        );
      case "familias":
        return (
          <ListaFamilias
            familias={familiasModule.familias}
            abrirNuevaFamilia={familiasModule.abrirNuevaFamilia}
            abrirVerFamilia={familiasModule.abrirVerFamilia}
            abrirEditarFamilia={familiasModule.abrirEditarFamilia}
            borrarFamilia={familiasModule.borrarFamilia}
          />
        );
      case "familia-nuevo":
      case "familia-editar":
        return (
          <FormularioFamilia
            formFamilia={familiasModule.formFamilia}
            updateFormFamiliaField={familiasModule.updateFormFamiliaField}
            guardarFamilia={familiasModule.guardarFamilia}
            cerrarPestana={cerrarPestana}
            pestanaActiva={pestanaActiva}
          />
        );
      case "familia-ver":
        return (
          <FichaFamilia
            familias={familiasModule.familias}
            familiaId={pestana.datos}
            abrirEditarFamilia={familiasModule.abrirEditarFamilia}
          />
        );
      case "subfamilias":
        return (
          <ListaSubfamilias
            subfamilias={subfamiliasModule.subfamilias}
            abrirNuevaSubfamilia={subfamiliasModule.abrirNuevaSubfamilia}
            abrirVerSubfamilia={subfamiliasModule.abrirVerSubfamilia}
            abrirEditarSubfamilia={subfamiliasModule.abrirEditarSubfamilia}
            borrarSubfamilia={subfamiliasModule.borrarSubfamilia}
          />
        );
      case "subfamilia-nuevo":
      case "subfamilia-editar":
        return (
          <FormularioSubfamilia
            formSubfamilia={subfamiliasModule.formSubfamilia}
            familiasDisponibles={subfamiliasModule.familiasDisponibles}
            updateFormSubfamiliaField={subfamiliasModule.updateFormSubfamiliaField}
            guardarSubfamilia={subfamiliasModule.guardarSubfamilia}
            cerrarPestana={cerrarPestana}
            pestanaActiva={pestanaActiva}
          />
        );
      case "subfamilia-ver":
        return (
          <FichaSubfamilia
            subfamilias={subfamiliasModule.subfamilias}
            subfamiliaId={pestana.datos}
            abrirEditarSubfamilia={subfamiliasModule.abrirEditarSubfamilia}
          />
        );
      case "tipos-codigo-barra":
        return (
          <>
            <ListaTiposCodigoBarra
              tipos={tiposCodigoBarraModule.tipos}
              abrirNuevoTipo={tiposCodigoBarraModule.abrirNuevoTipo}
              abrirVerTipo={tiposCodigoBarraModule.abrirVerTipo}
              abrirEditarTipo={tiposCodigoBarraModule.abrirEditarTipo}
              abrirModalPrueba={tiposCodigoBarraModule.abrirModalPrueba}
              borrarTipo={tiposCodigoBarraModule.borrarTipo}
              calcularLongitudTotal={tiposCodigoBarraModule.calcularLongitudTotal}
            />
            <ModalPruebaCodigo
              tipoPrueba={tiposCodigoBarraModule.tipoPrueba}
              codigoPrueba={tiposCodigoBarraModule.codigoPrueba}
              setCodigoPrueba={tiposCodigoBarraModule.setCodigoPrueba}
              resultadoPrueba={tiposCodigoBarraModule.resultadoPrueba}
              modalPruebaAbierto={tiposCodigoBarraModule.modalPruebaAbierto}
              cerrarModalPrueba={tiposCodigoBarraModule.cerrarModalPrueba}
              comprobarCodigo={tiposCodigoBarraModule.comprobarCodigo}
              calcularLongitudTotal={tiposCodigoBarraModule.calcularLongitudTotal}
            />
          </>
        );
      case "tipo-codigo-nuevo":
      case "tipo-codigo-editar":
        return (
          <FormularioTipoCodigoBarra
            formTipo={tiposCodigoBarraModule.formTipo}
            seccionFormActiva={tiposCodigoBarraModule.seccionFormActiva}
            setSeccionFormActiva={tiposCodigoBarraModule.setSeccionFormActiva}
            updateFormTipoField={tiposCodigoBarraModule.updateFormTipoField}
            agregarCampo={tiposCodigoBarraModule.agregarCampo}
            eliminarCampo={tiposCodigoBarraModule.eliminarCampo}
            actualizarCampo={tiposCodigoBarraModule.actualizarCampo}
            guardarTipo={tiposCodigoBarraModule.guardarTipo}
            cerrarPestana={cerrarPestana}
            pestanaActiva={pestanaActiva}
            calcularLongitudTotal={tiposCodigoBarraModule.calcularLongitudTotal}
          />
        );
      case "tipo-codigo-ver":
        return (
          <>
            <FichaTipoCodigoBarra
              tipos={tiposCodigoBarraModule.tipos}
              tipoId={pestana.datos}
              abrirEditarTipo={tiposCodigoBarraModule.abrirEditarTipo}
              abrirModalPrueba={tiposCodigoBarraModule.abrirModalPrueba}
              calcularLongitudTotal={tiposCodigoBarraModule.calcularLongitudTotal}
            />
            <ModalPruebaCodigo
              tipoPrueba={tiposCodigoBarraModule.tipoPrueba}
              codigoPrueba={tiposCodigoBarraModule.codigoPrueba}
              setCodigoPrueba={tiposCodigoBarraModule.setCodigoPrueba}
              resultadoPrueba={tiposCodigoBarraModule.resultadoPrueba}
              modalPruebaAbierto={tiposCodigoBarraModule.modalPruebaAbierto}
              cerrarModalPrueba={tiposCodigoBarraModule.cerrarModalPrueba}
              comprobarCodigo={tiposCodigoBarraModule.comprobarCodigo}
              calcularLongitudTotal={tiposCodigoBarraModule.calcularLongitudTotal}
            />
          </>
        );
      case "tarifas":
        return (
          <GestionTarifas
            tarifas={tarifasModule.tarifas}
            formTarifa={tarifasModule.formTarifa}
            cargandoTarifas={tarifasModule.cargandoTarifas}
            mensajeTarifas={tarifasModule.mensajeTarifas}
            modoEdicion={tarifasModule.modoEdicion}
            editarTarifa={tarifasModule.editarTarifa}
            eliminarTarifa={tarifasModule.eliminarTarifa}
            guardarTarifa={tarifasModule.guardarTarifa}
            limpiarFormTarifa={tarifasModule.limpiarFormTarifa}
            inicializarTarifaGeneral={tarifasModule.inicializarTarifaGeneral}
            updateFormTarifaField={tarifasModule.updateFormTarifaField}
            cargarTarifas={tarifasModule.cargarTarifas}
            permitirMultitarifa={configuracionModule.permitirMultitarifa}
          />
        );
      case "movimientos-stock":
        return <MovimientosStockView />;
      // ========== EMPRESA ==========
      case "datos-empresa":
        return (
          <VistaDatosEmpresa
            empresa={datosEmpresaModule.empresa}
            formEmpresa={datosEmpresaModule.formEmpresa}
            logoPreview={datosEmpresaModule.logoPreview}
            abrirEditarEmpresa={datosEmpresaModule.abrirEditarEmpresa}
          />
        );
      case "empresa-editar":
        return (
          <FormularioDatosEmpresa
            formEmpresa={datosEmpresaModule.formEmpresa}
            logoPreview={datosEmpresaModule.logoPreview}
            mostrarPassword={datosEmpresaModule.mostrarPassword}
            setMostrarPassword={datosEmpresaModule.setMostrarPassword}
            probandoConexion={datosEmpresaModule.probandoConexion}
            resultadoPrueba={datosEmpresaModule.resultadoPrueba}
            handleLogoChange={datosEmpresaModule.handleLogoChange}
            guardarEmpresa={datosEmpresaModule.guardarEmpresa}
            probarConexionEmail={datosEmpresaModule.probarConexionEmail}
            usarConfiguracionGmail={datosEmpresaModule.usarConfiguracionGmail}
            usarConfiguracionOutlook={datosEmpresaModule.usarConfiguracionOutlook}
            updateFormEmpresaField={datosEmpresaModule.updateFormEmpresaField}
            cerrarPestana={cerrarPestana}
            pestanaActiva={pestanaActiva}
          />
        );
      case "usuarios":
        return (
          <ListaUsuarios
            usuarios={usuariosModule.usuarios}
            abrirNuevoUsuario={usuariosModule.abrirNuevoUsuario}
            abrirVerUsuario={usuariosModule.abrirVerUsuario}
            abrirEditarUsuario={usuariosModule.abrirEditarUsuario}
            borrarUsuario={usuariosModule.borrarUsuario}
          />
        );
      case "usuario-nuevo":
      case "usuario-editar":
        return (
          <FormularioUsuario
            formUsuario={usuariosModule.formUsuario}
            updateFormUsuarioField={usuariosModule.updateFormUsuarioField}
            guardarUsuario={usuariosModule.guardarUsuario}
            cerrarPestana={cerrarPestana}
            pestanaActiva={pestanaActiva}
          />
        );
      case "usuario-ver":
        return (
          <FichaUsuario
            usuarios={usuariosModule.usuarios}
            usuarioId={pestana.datos}
            abrirEditarUsuario={usuariosModule.abrirEditarUsuario}
          />
        );
      case "disco-virtual":
        return (
          <>
            <VistaDiscoVirtual
              archivos={discoVirtualModule.archivos}
              rutaActual={discoVirtualModule.rutaActual}
              archivoSubir={discoVirtualModule.archivoSubir}
              setArchivoSubir={discoVirtualModule.setArchivoSubir}
              setMostrarModalCarpeta={discoVirtualModule.setMostrarModalCarpeta}
              subirArchivo={discoVirtualModule.subirArchivo}
              descargarArchivo={discoVirtualModule.descargarArchivo}
              eliminarArchivo={discoVirtualModule.eliminarArchivo}
              abrirModalRenombrar={discoVirtualModule.abrirModalRenombrar}
              navegarCarpeta={discoVirtualModule.navegarCarpeta}
              irAtras={discoVirtualModule.irAtras}
              formatearTamano={discoVirtualModule.formatearTamano}
            />
            <ModalNuevaCarpeta
              mostrarModalCarpeta={discoVirtualModule.mostrarModalCarpeta}
              nombreNuevaCarpeta={discoVirtualModule.nombreNuevaCarpeta}
              setNombreNuevaCarpeta={discoVirtualModule.setNombreNuevaCarpeta}
              crearCarpeta={discoVirtualModule.crearCarpeta}
              cerrarModalCarpeta={discoVirtualModule.cerrarModalCarpeta}
            />
            <ModalRenombrar
              mostrarModalRenombrar={discoVirtualModule.mostrarModalRenombrar}
              nuevoNombre={discoVirtualModule.nuevoNombre}
              setNuevoNombre={discoVirtualModule.setNuevoNombre}
              renombrar={discoVirtualModule.renombrar}
              cerrarModalRenombrar={discoVirtualModule.cerrarModalRenombrar}
            />
          </>
        );
      // ========== VENTAS ==========
      case "albaranes":
        return (
          <>
            <ListaAlbaranes
              albaranes={albaranesModule.albaranes}
              clientes={albaranesModule.clientes}
              cargando={albaranesModule.cargando}
              estadoOptions={albaranesModule.estadoOptions}
              modoVisual={configuracionModule.modoVisual}
              // Paginación
              paginaActual={albaranesModule.paginaActual}
              setPaginaActual={albaranesModule.setPaginaActual}
              itemsPorPagina={albaranesModule.itemsPorPagina}
              setItemsPorPagina={albaranesModule.setItemsPorPagina}
              totalElementos={albaranesModule.totalElementos}
              totalPaginas={albaranesModule.totalPaginas}
              ordenarPor={albaranesModule.ordenarPor}
              ordenDireccion={albaranesModule.ordenDireccion}
              cambiarOrdenacion={albaranesModule.cambiarOrdenacion}
              // Filtros
              busqueda={albaranesModule.busqueda}
              setBusqueda={albaranesModule.setBusqueda}
              filtroFechaDesde={albaranesModule.filtroFechaDesde}
              setFiltroFechaDesde={albaranesModule.setFiltroFechaDesde}
              filtroFechaHasta={albaranesModule.filtroFechaHasta}
              setFiltroFechaHasta={albaranesModule.setFiltroFechaHasta}
              filtroEstado={albaranesModule.filtroEstado}
              setFiltroEstado={albaranesModule.setFiltroEstado}
              filtroSerieId={albaranesModule.filtroSerieId}
              setFiltroSerieId={albaranesModule.setFiltroSerieId}
              filtroNumero={albaranesModule.filtroNumero}
              setFiltroNumero={albaranesModule.setFiltroNumero}
              filtroImporteMin={albaranesModule.filtroImporteMin}
              setFiltroImporteMin={albaranesModule.setFiltroImporteMin}
              filtroImporteMax={albaranesModule.filtroImporteMax}
              setFiltroImporteMax={albaranesModule.setFiltroImporteMax}
              mostrarFiltros={albaranesModule.mostrarFiltros}
              setMostrarFiltros={albaranesModule.setMostrarFiltros}
              limpiarFiltros={albaranesModule.limpiarFiltros}
              contarFiltrosActivos={albaranesModule.contarFiltrosActivos}
              // Selección
              albaranesSeleccionados={albaranesModule.albaranesSeleccionados}
              seleccionarTodos={albaranesModule.seleccionarTodos}
              toggleSeleccionAlbaran={albaranesModule.toggleSeleccionAlbaran}
              toggleSeleccionarTodos={albaranesModule.toggleSeleccionarTodos}
              // Acciones masivas
              abrirNuevoAlbaran={albaranesModule.abrirNuevoAlbaran}
              eliminarSeleccionados={albaranesModule.eliminarSeleccionados}
              exportarExcelCsv={albaranesModule.exportarExcelCsv}
              abrirModalPdfMultiple={albaranesModule.abrirModalPdfMultiple}
              // Acciones individuales
              abrirVerAlbaran={albaranesModule.abrirVerAlbaran}
              abrirEditarAlbaran={albaranesModule.abrirEditarAlbaran}
              abrirModalTransformar={albaranesModule.abrirModalTransformar}
              abrirModalEmail={albaranesModule.abrirModalEmail}
              abrirModalHistorialDocumento={albaranesModule.abrirModalHistorialDocumento}
              cargarAlbaranes={albaranesModule.cargarAlbaranes}
              seriesDisponibles={albaranesModule.seriesDisponibles}
              totalesFiltrados={albaranesModule.totalesFiltrados}
            />
            <ModalTransformar
              modalTransformarAbierto={albaranesModule.modalTransformarAbierto}
              albaranParaTransformar={albaranesModule.albaranParaTransformar}
              cerrarModalTransformar={albaranesModule.cerrarModalTransformar}
              tipoTransformacionSeleccionado={albaranesModule.tipoTransformacionSeleccionado}
              setTipoTransformacionSeleccionado={albaranesModule.setTipoTransformacionSeleccionado}
              serieSeleccionada={albaranesModule.serieSeleccionada}
              setSerieSeleccionada={albaranesModule.setSerieSeleccionada}
              fechaTransformacion={albaranesModule.fechaTransformacion}
              setFechaTransformacion={albaranesModule.setFechaTransformacion}
              estadoTransformacion={albaranesModule.estadoTransformacion}
              setEstadoTransformacion={albaranesModule.setEstadoTransformacion}
              series={albaranesModule.seriesTransformacion}
              estadoOptions={albaranesModule.estadoOptions}
              ejecutarTransformacion={albaranesModule.ejecutarTransformacion}
              proveedorId={albaranesModule.proveedorId}
              proveedorSeleccionado={albaranesModule.proveedorSeleccionado}
              busquedaProveedor={albaranesModule.busquedaProveedor}
              handleInputProveedorChange={albaranesModule.handleInputProveedorChange}
              seleccionarProveedor={albaranesModule.seleccionarProveedor}
              filtrarProveedores={albaranesModule.filtrarProveedores}
              mostrarProveedores={albaranesModule.mostrarProveedores}
              dropdownProveedorRef={albaranesModule.dropdownProveedorRef}
            />
            <ModalEmail
              modalEmailAbierto={albaranesModule.modalEmailAbierto}
              albaranParaEmail={albaranesModule.albaranParaEmail}
              emailDestinatario={albaranesModule.emailDestinatario}
              setEmailDestinatario={albaranesModule.setEmailDestinatario}
              emailAsunto={albaranesModule.emailAsunto}
              setEmailAsunto={albaranesModule.setEmailAsunto}
              emailCuerpo={albaranesModule.emailCuerpo}
              setEmailCuerpo={albaranesModule.setEmailCuerpo}
              cerrarModalEmail={albaranesModule.cerrarModalEmail}
              enviarEmail={albaranesModule.enviarEmail}
            />
            <ModalPdfMultiple
              modalPdfMultipleAbierto={albaranesModule.modalPdfMultipleAbierto}
              albaranesSeleccionados={albaranesModule.albaranesSeleccionados}
              tipoPdfMultiple={albaranesModule.tipoPdfMultiple}
              setTipoPdfMultiple={albaranesModule.setTipoPdfMultiple}
              cerrarModalPdfMultiple={albaranesModule.cerrarModalPdfMultiple}
              generarPdfMultiple={albaranesModule.generarPdfMultiple}
            />
            <ModalHistorialTransformaciones
              modalAbierto={albaranesModule.modalHistorialAbierto}
              cerrarModal={albaranesModule.cerrarModalHistorial}
              documento={albaranesModule.documentoHistorial}
              historial={albaranesModule.historialModal}
              cargando={albaranesModule.cargandoHistorialModal}
              abrirDocumento={(tipo, id, numero) => {
                const tipoMap = {
                  'ALBARAN': 'albaran-ver',
                  'FACTURA': 'factura-ver',
                  'FACTURA_PROFORMA': 'factura-proforma-ver',
                  'FACTURA_RECTIFICATIVA': 'factura-rectificativa-ver',
                  'PEDIDO': 'pedido-ver'
                };
                const tipoLabel = {
                  'ALBARAN': 'Albarán',
                  'FACTURA': 'Factura',
                  'FACTURA_PROFORMA': 'Factura Proforma',
                  'FACTURA_RECTIFICATIVA': 'Factura Rectificativa',
                  'PEDIDO': 'Pedido'
                };
                const tipoPestana = tipoMap[tipo];
                if (tipoPestana) {
                  const titulo = numero ? `${tipoLabel[tipo]} ${numero}` : null;
                  abrirPestana(tipoPestana, id, titulo);
                }
              }}
            />
          </>
        );
      case "albaran-nuevo":
      case "albaran-editar":
        return (
          <FormularioAlbaran
            formAlbaran={albaranesModule.formAlbaran}
            clientes={albaranesModule.clientes}
            productos={albaranesModule.productos}
            tiposIva={albaranesModule.tiposIva}
            seriesDisponibles={albaranesModule.seriesDisponibles}
            cargandoSeries={albaranesModule.cargandoSeries}
            guardarPreferenciaSerie={albaranesModule.guardarPreferenciaSerie}
            guardandoPreferenciaSerie={albaranesModule.guardandoPreferenciaSerie}
            generandoNumero={albaranesModule.generandoNumero}
            estadoOptions={albaranesModule.estadoOptions}
            updateFormAlbaranField={albaranesModule.updateFormAlbaranField}
            setDireccionSnapshot={albaranesModule.setDireccionSnapshot}
            updateDireccionSnapshotField={albaranesModule.updateDireccionSnapshotField}
            agregarLinea={albaranesModule.agregarLinea}
            eliminarLinea={albaranesModule.eliminarLinea}
            actualizarLinea={albaranesModule.actualizarLinea}
            calcularTotalLinea={albaranesModule.calcularTotalLinea}
            calcularTotales={albaranesModule.calcularTotales}
            guardarAlbaran={albaranesModule.guardarAlbaran}
            cerrarPestana={cerrarPestana}
            pestanaActiva={pestanaActiva}
            subirAdjunto={albaranesModule.subirAdjunto}
            eliminarAdjunto={albaranesModule.eliminarAdjunto}
            descargarAdjunto={albaranesModule.descargarAdjunto}
            almacenes={albaranesModule.almacenes}
            mostrarSelectorAlmacen={albaranesModule.mostrarSelectorAlmacen}
            permitirVentaMultialmacen={albaranesModule.permitirVentaMultialmacen}
            mostrarConfirmacionStock={albaranesModule.mostrarConfirmacionStock}
            confirmarYGuardarAlbaran={albaranesModule.confirmarYGuardarAlbaran}
            cancelarConfirmacionStock={albaranesModule.cancelarConfirmacionStock}
            mostrarErrorStock={albaranesModule.mostrarErrorStock}
            mensajeErrorStock={albaranesModule.mensajeErrorStock}
            cerrarModalErrorStock={albaranesModule.cerrarModalErrorStock}
            mostrarModalCambioEstado={albaranesModule.mostrarModalCambioEstado}
            datosModalCambioEstado={albaranesModule.datosModalCambioEstado}
            confirmarCambioEstado={albaranesModule.confirmarCambioEstado}
            cancelarCambioEstado={albaranesModule.cancelarCambioEstado}
            tarifasAlbaran={{
              ...albaranesModule.tarifasAlbaran,
              recalcularPreciosLineas: albaranesModule.recalcularPreciosLineas,
            }}
          />
        );
      case "albaran-ver":
        return (
          <FichaAlbaran
            albaranes={albaranesModule.albaranes}
            albaranId={pestana.datos}
            abrirEditarAlbaran={albaranesModule.abrirEditarAlbaran}
            generarPdf={albaranesModule.generarPdf}
            abrirModalTransformar={albaranesModule.abrirModalTransformar}
            abrirModalEmail={albaranesModule.abrirModalEmail}
            estadoOptions={albaranesModule.estadoOptions}
            modoVisual={configuracionModule.modoVisual}
            descargarAdjunto={albaranesModule.descargarAdjunto}
            cargarHistorialTransformaciones={albaranesModule.cargarHistorialTransformaciones}
          />
        );
      case "presupuesto-ver":
        return (
          <FichaDocumentoVenta
            documento={presupuestosModule.documentos.find(d => d.id === pestana.datos)}
            documentoId={pestana.datos}
            tipoDocumento="PRESUPUESTO"
            nombreDocumento="presupuesto"
            abrirEditar={(doc) => abrirPestana("presupuesto-editar", doc.id, `Editar ${doc.numero}`)}
            generarPdf={presupuestosModule.descargarPdf}
            estadoOptions={presupuestosModule.estadoOptions}
            modoVisual={configuracionModule.modoVisual}
            descargarAdjunto={presupuestosModule.descargarAdjunto}
            cargarHistorialTransformaciones={presupuestosModule.cargarHistorialTransformaciones}
          />
        );
      case "pedido-ver":
        return (
          <FichaDocumentoVenta
            documento={pedidosModule.documentos.find(d => d.id === pestana.datos)}
            documentoId={pestana.datos}
            tipoDocumento="PEDIDO"
            nombreDocumento="pedido"
            abrirEditar={(doc) => abrirPestana("pedido-editar", doc.id, `Editar ${doc.numero}`)}
            generarPdf={pedidosModule.descargarPdf}
            estadoOptions={pedidosModule.estadoOptions}
            modoVisual={configuracionModule.modoVisual}
            descargarAdjunto={pedidosModule.descargarAdjunto}
            cargarHistorialTransformaciones={pedidosModule.cargarHistorialTransformaciones}
          />
        );
      case "factura-ver":
        return (
          <FichaDocumentoVenta
            documento={facturasModule.documentos.find(d => d.id === pestana.datos)}
            documentoId={pestana.datos}
            tipoDocumento="FACTURA"
            nombreDocumento="factura"
            abrirEditar={facturasModule.abrirEditarFactura}
            generarPdf={facturasModule.descargarPdf}
            estadoOptions={facturasModule.estadoOptions}
            modoVisual={configuracionModule.modoVisual}
            descargarAdjunto={facturasModule.descargarAdjunto}
            cargarHistorialTransformaciones={facturasModule.cargarHistorialTransformaciones}
          />
        );
      case "factura-proforma-ver":
        return (
          <FichaDocumentoVenta
            documento={facturasProformaModule.documentos.find(d => d.id === pestana.datos)}
            documentoId={pestana.datos}
            tipoDocumento="FACTURA_PROFORMA"
            nombreDocumento="factura proforma"
            abrirEditar={(doc) => abrirPestana("factura-proforma-editar", doc.id, `Editar ${doc.numero}`)}
            generarPdf={facturasProformaModule.descargarPdf}
            estadoOptions={facturasProformaModule.estadoOptions}
            modoVisual={configuracionModule.modoVisual}
            descargarAdjunto={facturasProformaModule.descargarAdjunto}
            cargarHistorialTransformaciones={facturasProformaModule.cargarHistorialTransformaciones}
          />
        );
      case "factura-rectificativa-ver":
        return (
          <FichaDocumentoVenta
            documento={facturasRectificativasModule.documentos.find(d => d.id === pestana.datos)}
            documentoId={pestana.datos}
            tipoDocumento="FACTURA_RECTIFICATIVA"
            nombreDocumento="factura rectificativa"
            abrirEditar={(doc) => abrirPestana("factura-rectificativa-editar", doc.id, `Editar ${doc.numero}`)}
            generarPdf={facturasRectificativasModule.descargarPdf}
            estadoOptions={facturasRectificativasModule.estadoOptions}
            modoVisual={configuracionModule.modoVisual}
            descargarAdjunto={facturasRectificativasModule.descargarAdjunto}
            cargarHistorialTransformaciones={facturasRectificativasModule.cargarHistorialTransformaciones}
          />
        );
      case "presupuestos":
        return (
          <>
            <PresupuestosListado
              onVer={(doc) => abrirPestana("presupuesto-ver", doc.id, `Ver ${doc.numero}`)}
              onEditar={(doc) => abrirPestana("presupuesto-editar", doc.id, `Editar ${doc.numero}`)}
              onNuevo={() => abrirPestana("presupuesto-nuevo", null, "Nuevo Presupuesto")}
              modoVisual={configuracionModule.modoVisual}
              abrirModalHistorialDocumento={presupuestosModule.abrirModalHistorialDocumento}
            />
            <ModalHistorialTransformaciones
              modalAbierto={presupuestosModule.modalHistorialAbierto}
              cerrarModal={presupuestosModule.cerrarModalHistorial}
              documento={presupuestosModule.documentoHistorial}
              historial={presupuestosModule.historialModal}
              cargando={presupuestosModule.cargandoHistorialModal}
              abrirDocumento={(tipo, id, numero) => {
                const tipoMap = {
                  'PRESUPUESTO': 'presupuesto-ver',
                  'PEDIDO': 'pedido-ver',
                  'ALBARAN': 'albaran-ver',
                  'FACTURA': 'factura-ver',
                  'FACTURA_PROFORMA': 'factura-proforma-ver',
                  'FACTURA_RECTIFICATIVA': 'factura-rectificativa-ver'
                };
                const tipoLabel = {
                  'PRESUPUESTO': 'Presupuesto',
                  'PEDIDO': 'Pedido',
                  'ALBARAN': 'Albarán',
                  'FACTURA': 'Factura',
                  'FACTURA_PROFORMA': 'Factura Proforma',
                  'FACTURA_RECTIFICATIVA': 'Factura Rectificativa'
                };
                const tipoPestana = tipoMap[tipo];
                if (tipoPestana) {
                  const titulo = numero ? `${tipoLabel[tipo]} ${numero}` : null;
                  abrirPestana(tipoPestana, id, titulo);
                }
              }}
            />
          </>
        );
      case "presupuesto-nuevo":
      case "presupuesto-editar":
        return (
          <FormularioAlbaran
            formAlbaran={presupuestosModule.formPresupuesto}
            clientes={presupuestosModule.clientes}
            productos={presupuestosModule.productos}
            tiposIva={presupuestosModule.tiposIva}
            seriesDisponibles={presupuestosModule.seriesDisponibles}
            cargandoSeries={presupuestosModule.cargandoSeries}
            guardarPreferenciaSerie={presupuestosModule.guardarPreferenciaSerie}
            guardandoPreferenciaSerie={presupuestosModule.guardandoPreferenciaSerie}
            generandoNumero={presupuestosModule.generandoNumero}
            estadoOptions={presupuestosModule.estadoOptions}
            updateFormAlbaranField={presupuestosModule.updateFormPresupuestoField}
            setDireccionSnapshot={presupuestosModule.setDireccionSnapshot}
            updateDireccionSnapshotField={presupuestosModule.updateDireccionSnapshotField}
            agregarLinea={presupuestosModule.agregarLinea}
            eliminarLinea={presupuestosModule.eliminarLinea}
            actualizarLinea={presupuestosModule.actualizarLinea}
            calcularTotales={presupuestosModule.calcularTotales}
            guardarAlbaran={presupuestosModule.guardarPresupuesto}
            cerrarPestana={cerrarPestana}
            pestanaActiva={pestanaActiva}
            subirAdjunto={presupuestosModule.subirAdjunto}
            eliminarAdjunto={presupuestosModule.eliminarAdjunto}
            descargarAdjunto={presupuestosModule.descargarAdjunto}
            almacenes={presupuestosModule.almacenes}
            mostrarSelectorAlmacen={presupuestosModule.mostrarSelectorAlmacen}
            permitirVentaMultialmacen={presupuestosModule.permitirVentaMultialmacen}
            tarifasAlbaran={presupuestosModule.tarifasAlbaran}
            tipoDocumento="presupuesto"
          />
        );
      case "pedidos":
        return (
          <>
            <PedidosListado
              onVer={(doc) => abrirPestana("pedido-ver", doc.id, `Ver ${doc.numero}`)}
              onEditar={(doc) => abrirPestana("pedido-editar", doc.id, `Editar ${doc.numero}`)}
              onNuevo={() => abrirPestana("pedido-nuevo", null, "Nuevo Pedido")}
              modoVisual={configuracionModule.modoVisual}
              abrirModalHistorialDocumento={pedidosModule.abrirModalHistorialDocumento}
            />
            <ModalHistorialTransformaciones
              modalAbierto={pedidosModule.modalHistorialAbierto}
              cerrarModal={pedidosModule.cerrarModalHistorial}
              documento={pedidosModule.documentoHistorial}
              historial={pedidosModule.historialModal}
              cargando={pedidosModule.cargandoHistorialModal}
              abrirDocumento={(tipo, id, numero) => {
                const tipoMap = {
                  'PRESUPUESTO': 'presupuesto-ver',
                  'PEDIDO': 'pedido-ver',
                  'ALBARAN': 'albaran-ver',
                  'FACTURA': 'factura-ver',
                  'FACTURA_PROFORMA': 'factura-proforma-ver',
                  'FACTURA_RECTIFICATIVA': 'factura-rectificativa-ver'
                };
                const tipoLabel = {
                  'PRESUPUESTO': 'Presupuesto',
                  'PEDIDO': 'Pedido',
                  'ALBARAN': 'Albarán',
                  'FACTURA': 'Factura',
                  'FACTURA_PROFORMA': 'Factura Proforma',
                  'FACTURA_RECTIFICATIVA': 'Factura Rectificativa'
                };
                const tipoPestana = tipoMap[tipo];
                if (tipoPestana) {
                  const titulo = numero ? `${tipoLabel[tipo]} ${numero}` : null;
                  abrirPestana(tipoPestana, id, titulo);
                }
              }}
            />
          </>
        );
      case "pedido-nuevo":
      case "pedido-editar":
        return (
          <FormularioAlbaran
            formAlbaran={pedidosModule.formPedido}
            clientes={pedidosModule.clientes}
            productos={pedidosModule.productos}
            tiposIva={pedidosModule.tiposIva}
            seriesDisponibles={pedidosModule.seriesDisponibles}
            cargandoSeries={pedidosModule.cargandoSeries}
            guardarPreferenciaSerie={pedidosModule.guardarPreferenciaSerie}
            guardandoPreferenciaSerie={pedidosModule.guardandoPreferenciaSerie}
            generandoNumero={pedidosModule.generandoNumero}
            estadoOptions={pedidosModule.estadoOptions}
            updateFormAlbaranField={pedidosModule.updateFormPedidoField}
            setDireccionSnapshot={pedidosModule.setDireccionSnapshot}
            updateDireccionSnapshotField={pedidosModule.updateDireccionSnapshotField}
            agregarLinea={pedidosModule.agregarLinea}
            eliminarLinea={pedidosModule.eliminarLinea}
            actualizarLinea={pedidosModule.actualizarLinea}
            calcularTotales={pedidosModule.calcularTotales}
            guardarAlbaran={pedidosModule.guardarPedido}
            cerrarPestana={cerrarPestana}
            pestanaActiva={pestanaActiva}
            subirAdjunto={pedidosModule.subirAdjunto}
            eliminarAdjunto={pedidosModule.eliminarAdjunto}
            descargarAdjunto={pedidosModule.descargarAdjunto}
            almacenes={pedidosModule.almacenes}
            mostrarSelectorAlmacen={pedidosModule.mostrarSelectorAlmacen}
            permitirVentaMultialmacen={pedidosModule.permitirVentaMultialmacen}
            tarifasAlbaran={pedidosModule.tarifasAlbaran}
            tipoDocumento="pedido"
          />
        );
      case "facturas":
        return (
          <>
            <FacturasListado
              onVer={(doc) => abrirPestana("factura-ver", doc.id, `Ver ${doc.numero}`)}
              onEditar={(doc) => abrirPestana("factura-editar", doc.id, `Editar ${doc.numero}`)}
              onNuevo={() => abrirPestana("factura-nuevo", null, "Nueva Factura")}
              modoVisual={configuracionModule.modoVisual}
              abrirModalHistorialDocumento={facturasModule.abrirModalHistorialDocumento}
            />
            <ModalHistorialTransformaciones
              modalAbierto={facturasModule.modalHistorialAbierto}
              cerrarModal={facturasModule.cerrarModalHistorial}
              documento={facturasModule.documentoHistorial}
              historial={facturasModule.historialModal}
              cargando={facturasModule.cargandoHistorialModal}
              abrirDocumento={(tipo, id, numero) => {
                const tipoMap = {
                  'PRESUPUESTO': 'presupuesto-ver',
                  'PEDIDO': 'pedido-ver',
                  'ALBARAN': 'albaran-ver',
                  'FACTURA': 'factura-ver',
                  'FACTURA_PROFORMA': 'factura-proforma-ver',
                  'FACTURA_RECTIFICATIVA': 'factura-rectificativa-ver'
                };
                const tipoLabel = {
                  'PRESUPUESTO': 'Presupuesto',
                  'PEDIDO': 'Pedido',
                  'ALBARAN': 'Albarán',
                  'FACTURA': 'Factura',
                  'FACTURA_PROFORMA': 'Factura Proforma',
                  'FACTURA_RECTIFICATIVA': 'Factura Rectificativa'
                };
                const tipoPestana = tipoMap[tipo];
                if (tipoPestana) {
                  const titulo = numero ? `${tipoLabel[tipo]} ${numero}` : null;
                  abrirPestana(tipoPestana, id, titulo);
                }
              }}
            />
          </>
        );
      case "factura-nuevo":
      case "factura-editar":
        return (
          <FormularioAlbaran
            formAlbaran={facturasModule.formFactura}
            clientes={facturasModule.clientes}
            productos={facturasModule.productos}
            tiposIva={facturasModule.tiposIva}
            seriesDisponibles={facturasModule.seriesDisponibles}
            cargandoSeries={facturasModule.cargandoSeries}
            guardarPreferenciaSerie={facturasModule.guardarPreferenciaSerie}
            guardandoPreferenciaSerie={facturasModule.guardandoPreferenciaSerie}
            generandoNumero={facturasModule.generandoNumero}
            estadoOptions={facturasModule.estadoOptions}
            updateFormAlbaranField={facturasModule.updateFormAlbaranField}
            setDireccionSnapshot={facturasModule.setDireccionSnapshot}
            updateDireccionSnapshotField={facturasModule.updateDireccionSnapshotField}
            agregarLinea={facturasModule.agregarLinea}
            eliminarLinea={facturasModule.eliminarLinea}
            actualizarLinea={facturasModule.actualizarLinea}
            calcularTotales={facturasModule.calcularTotales}
            guardarAlbaran={facturasModule.guardarFactura}
            cerrarPestana={cerrarPestana}
            pestanaActiva={pestanaActiva}
            subirAdjunto={facturasModule.subirAdjunto}
            eliminarAdjunto={facturasModule.eliminarAdjunto}
            descargarAdjunto={facturasModule.descargarAdjunto}
            almacenes={facturasModule.almacenes}
            mostrarSelectorAlmacen={facturasModule.mostrarSelectorAlmacen}
            permitirVentaMultialmacen={facturasModule.permitirVentaMultialmacen}
            tarifasAlbaran={facturasModule.tarifasAlbaran}
            mostrarModalCambioEstado={facturasModule.mostrarModalCambioEstado}
            datosModalCambioEstado={facturasModule.datosModalCambioEstado}
            confirmarCambioEstado={facturasModule.confirmarCambioEstado}
            cancelarCambioEstado={facturasModule.cancelarCambioEstado}
            documentoDescuentaStock={facturasModule.documentoDescuentaStock}
            tipoDocumento="factura"
          />
        );
      case "facturas-proforma":
        return (
          <>
            <FacturasProformaListado
              onVer={(doc) => abrirPestana("factura-proforma-ver", doc.id, `Ver ${doc.numero}`)}
              onEditar={(doc) => abrirPestana("factura-proforma-editar", doc.id, `Editar ${doc.numero}`)}
              onNuevo={() => abrirPestana("factura-proforma-nuevo", null, "Nueva Factura Proforma")}
              modoVisual={configuracionModule.modoVisual}
              abrirModalHistorialDocumento={facturasProformaModule.abrirModalHistorialDocumento}
            />
            <ModalHistorialTransformaciones
              modalAbierto={facturasProformaModule.modalHistorialAbierto}
              cerrarModal={facturasProformaModule.cerrarModalHistorial}
              documento={facturasProformaModule.documentoHistorial}
              historial={facturasProformaModule.historialModal}
              cargando={facturasProformaModule.cargandoHistorialModal}
              abrirDocumento={(tipo, id, numero) => {
                const tipoMap = {
                  'PRESUPUESTO': 'presupuesto-ver',
                  'PEDIDO': 'pedido-ver',
                  'ALBARAN': 'albaran-ver',
                  'FACTURA': 'factura-ver',
                  'FACTURA_PROFORMA': 'factura-proforma-ver',
                  'FACTURA_RECTIFICATIVA': 'factura-rectificativa-ver'
                };
                const tipoLabel = {
                  'PRESUPUESTO': 'Presupuesto',
                  'PEDIDO': 'Pedido',
                  'ALBARAN': 'Albarán',
                  'FACTURA': 'Factura',
                  'FACTURA_PROFORMA': 'Factura Proforma',
                  'FACTURA_RECTIFICATIVA': 'Factura Rectificativa'
                };
                const tipoPestana = tipoMap[tipo];
                if (tipoPestana) {
                  const titulo = numero ? `${tipoLabel[tipo]} ${numero}` : null;
                  abrirPestana(tipoPestana, id, titulo);
                }
              }}
            />
          </>
        );
      case "factura-proforma-nuevo":
      case "factura-proforma-editar":
        return (
          <FormularioAlbaran
            formAlbaran={facturasProformaModule.formFacturaProforma}
            clientes={facturasProformaModule.clientes}
            productos={facturasProformaModule.productos}
            tiposIva={facturasProformaModule.tiposIva}
            seriesDisponibles={facturasProformaModule.seriesDisponibles}
            cargandoSeries={facturasProformaModule.cargandoSeries}
            guardarPreferenciaSerie={facturasProformaModule.guardarPreferenciaSerie}
            guardandoPreferenciaSerie={facturasProformaModule.guardandoPreferenciaSerie}
            generandoNumero={facturasProformaModule.generandoNumero}
            estadoOptions={facturasProformaModule.estadoOptions}
            updateFormAlbaranField={facturasProformaModule.updateFormFacturaProformaField}
            setDireccionSnapshot={facturasProformaModule.setDireccionSnapshot}
            updateDireccionSnapshotField={facturasProformaModule.updateDireccionSnapshotField}
            agregarLinea={facturasProformaModule.agregarLinea}
            eliminarLinea={facturasProformaModule.eliminarLinea}
            actualizarLinea={facturasProformaModule.actualizarLinea}
            calcularTotales={facturasProformaModule.calcularTotales}
            guardarAlbaran={facturasProformaModule.guardarFacturaProforma}
            cerrarPestana={cerrarPestana}
            pestanaActiva={pestanaActiva}
            subirAdjunto={facturasProformaModule.subirAdjunto}
            eliminarAdjunto={facturasProformaModule.eliminarAdjunto}
            descargarAdjunto={facturasProformaModule.descargarAdjunto}
            almacenes={facturasProformaModule.almacenes}
            mostrarSelectorAlmacen={facturasProformaModule.mostrarSelectorAlmacen}
            permitirVentaMultialmacen={facturasProformaModule.permitirVentaMultialmacen}
            tarifasAlbaran={facturasProformaModule.tarifasAlbaran}
            tipoDocumento="factura proforma"
          />
        );
      case "facturas-rectificativas":
        return (
          <>
            <FacturasRectificativasListado
              onVer={(doc) => abrirPestana("factura-rectificativa-ver", doc.id, `Ver ${doc.numero}`)}
              onEditar={(doc) => abrirPestana("factura-rectificativa-editar", doc.id, `Editar ${doc.numero}`)}
              onNuevo={() => abrirPestana("factura-rectificativa-nuevo", null, "Nueva Factura Rectificativa")}
              modoVisual={configuracionModule.modoVisual}
              abrirModalHistorialDocumento={facturasRectificativasModule.abrirModalHistorialDocumento}
            />
            <ModalHistorialTransformaciones
              modalAbierto={facturasRectificativasModule.modalHistorialAbierto}
              cerrarModal={facturasRectificativasModule.cerrarModalHistorial}
              documento={facturasRectificativasModule.documentoHistorial}
              historial={facturasRectificativasModule.historialModal}
              cargando={facturasRectificativasModule.cargandoHistorialModal}
              abrirDocumento={(tipo, id, numero) => {
                const tipoMap = {
                  'PRESUPUESTO': 'presupuesto-ver',
                  'PEDIDO': 'pedido-ver',
                  'ALBARAN': 'albaran-ver',
                  'FACTURA': 'factura-ver',
                  'FACTURA_PROFORMA': 'factura-proforma-ver',
                  'FACTURA_RECTIFICATIVA': 'factura-rectificativa-ver'
                };
                const tipoLabel = {
                  'PRESUPUESTO': 'Presupuesto',
                  'PEDIDO': 'Pedido',
                  'ALBARAN': 'Albarán',
                  'FACTURA': 'Factura',
                  'FACTURA_PROFORMA': 'Factura Proforma',
                  'FACTURA_RECTIFICATIVA': 'Factura Rectificativa'
                };
                const tipoPestana = tipoMap[tipo];
                if (tipoPestana) {
                  const titulo = numero ? `${tipoLabel[tipo]} ${numero}` : null;
                  abrirPestana(tipoPestana, id, titulo);
                }
              }}
            />
          </>
        );
      case "factura-rectificativa-nuevo":
      case "factura-rectificativa-editar":
        return (
          <FormularioAlbaran
            formAlbaran={facturasRectificativasModule.formFacturaRectificativa}
            clientes={facturasRectificativasModule.clientes}
            productos={facturasRectificativasModule.productos}
            tiposIva={facturasRectificativasModule.tiposIva}
            seriesDisponibles={facturasRectificativasModule.seriesDisponibles}
            cargandoSeries={facturasRectificativasModule.cargandoSeries}
            guardarPreferenciaSerie={facturasRectificativasModule.guardarPreferenciaSerie}
            guardandoPreferenciaSerie={facturasRectificativasModule.guardandoPreferenciaSerie}
            generandoNumero={facturasRectificativasModule.generandoNumero}
            estadoOptions={facturasRectificativasModule.estadoOptions}
            updateFormAlbaranField={facturasRectificativasModule.updateFormFacturaRectificativaField}
            setDireccionSnapshot={facturasRectificativasModule.setDireccionSnapshot}
            updateDireccionSnapshotField={facturasRectificativasModule.updateDireccionSnapshotField}
            agregarLinea={facturasRectificativasModule.agregarLinea}
            eliminarLinea={facturasRectificativasModule.eliminarLinea}
            actualizarLinea={facturasRectificativasModule.actualizarLinea}
            calcularTotales={facturasRectificativasModule.calcularTotales}
            guardarAlbaran={facturasRectificativasModule.guardarFacturaRectificativa}
            cerrarPestana={cerrarPestana}
            pestanaActiva={pestanaActiva}
            subirAdjunto={facturasRectificativasModule.subirAdjunto}
            eliminarAdjunto={facturasRectificativasModule.eliminarAdjunto}
            descargarAdjunto={facturasRectificativasModule.descargarAdjunto}
            almacenes={facturasRectificativasModule.almacenes}
            mostrarSelectorAlmacen={facturasRectificativasModule.mostrarSelectorAlmacen}
            permitirVentaMultialmacen={facturasRectificativasModule.permitirVentaMultialmacen}
            tarifasAlbaran={facturasRectificativasModule.tarifasAlbaran}
            mostrarModalCambioEstado={facturasRectificativasModule.mostrarModalCambioEstado}
            datosModalCambioEstado={facturasRectificativasModule.datosModalCambioEstado}
            confirmarCambioEstado={facturasRectificativasModule.confirmarCambioEstado}
            cancelarCambioEstado={facturasRectificativasModule.cancelarCambioEstado}
            tipoDocumento="factura rectificativa"
          />
        );
      case "tpv":
        return <TPVView tpv={tpvModule} />;
      case "facturas-simplificadas":
        return (
          <ListaFacturasSimplificadas
            facturasSimplificadas={facturasSimplificadasModule.facturasSimplificadas}
            cargando={facturasSimplificadasModule.cargando}
            cargarFacturasSimplificadas={facturasSimplificadasModule.cargarFacturasSimplificadas}
            abrirVerFactura={facturasSimplificadasModule.abrirVerFactura}
            borrarFactura={facturasSimplificadasModule.borrarFactura}
            imprimirFactura={facturasSimplificadasModule.imprimirFactura}
            paginaActual={facturasSimplificadasModule.paginaActual}
            setPaginaActual={facturasSimplificadasModule.setPaginaActual}
            itemsPorPagina={facturasSimplificadasModule.itemsPorPagina}
            setItemsPorPagina={facturasSimplificadasModule.setItemsPorPagina}
            totalElementos={facturasSimplificadasModule.totalElementos}
            totalPaginas={facturasSimplificadasModule.totalPaginas}
            ordenarPor={facturasSimplificadasModule.ordenarPor}
            ordenDireccion={facturasSimplificadasModule.ordenDireccion}
            cambiarOrdenacion={facturasSimplificadasModule.cambiarOrdenacion}
          />
        );
      case "factura-simplificada-ver":
        const facturaSimplificada = facturasSimplificadasModule.facturasSimplificadas.find(
          f => f.id === pestana.datos
        );
        return <FichaFacturaSimplificada factura={facturaSimplificada} />;
      case "config-tpv":
        return (
          <ConfiguracionTPV
            configuracionActiva={configuracionTPVModule.configuracionActiva}
            guardarConfiguracion={configuracionTPVModule.guardarConfiguracion}
            cargando={configuracionTPVModule.cargando}
          />
        );
      // ========== COMPRAS ==========
      case "presupuestos-compra":
        return (
          <ListaPresupuestosCompra
            presupuestosCompra={presupuestosCompraModule.presupuestosCompra}
            series={presupuestosCompraModule.series}
            estadoOptions={presupuestosCompraModule.estadoOptions}
            onNuevo={() => abrirPestana("presupuesto-compra-nuevo", null, "Nuevo Presupuesto de Compra")}
            onEditar={(doc) => abrirPestana("presupuesto-compra-editar", doc.id, `Editar ${doc.numero}`)}
            onVer={(doc) => abrirPestana("presupuesto-compra-ver", doc.id, `Ver ${doc.numero}`)}
            eliminarPresupuestoCompra={presupuestosCompraModule.eliminarPresupuestoCompra}
            cargarPresupuestosCompra={presupuestosCompraModule.cargarPresupuestosCompra}
            loading={presupuestosCompraModule.loading}
            modoVisual={configuracionModule.modoVisual}
          />
        );
      case "presupuesto-compra-nuevo":
      case "presupuesto-compra-editar":
        return (
          <FormularioPresupuestoCompra
            cerrarPestana={() => cerrarPestana(pestanaActiva)}
            pestanaActiva={pestanaActiva}
            presupuestoId={pestana.datos}
          />
        );
      case "presupuesto-compra-ver":
        return (
          <VerPresupuestoCompra
            cerrarPestana={() => cerrarPestana(pestanaActiva)}
            pestanaActiva={pestanaActiva}
            presupuestoId={pestana.datos}
          />
        );
      
      case "pedidos-compra":
        return (
          <PedidosCompraListado
            onVer={(doc) => abrirPestana("pedido-compra-ver", doc.id, `Ver ${doc.numero}`)}
            onEditar={(doc) => abrirPestana("pedido-compra-editar", doc.id, `Editar ${doc.numero}`)}
            onNuevo={() => abrirPestana("pedido-compra-nuevo", null, "Nuevo Pedido de Compra")}
            modoVisual={configuracionModule.modoVisual}
          />
        );
      case "pedido-compra-nuevo":
      case "pedido-compra-editar":
        return (
          <FormularioPedidoCompra
            cerrarPestana={() => cerrarPestana(pestanaActiva)}
            pestanaActiva={pestanaActiva}
            pedidoId={pestana.datos}
          />
        );
      case "pedido-compra-ver":
        return (
          <FichaPedidoCompra
            pedidosCompra={pedidosCompraModule.pedidosCompra}
            pedidoId={pestana.datos}
            abrirEditarPedido={(pedido) => abrirPestana("pedido-compra-editar", pedido.id, `Editar ${pedido.numero}`)}
            generarPdf={null}
            abrirModalTransformar={null}
            abrirModalEmail={null}
            estadoOptions={pedidosCompraModule.estadoOptions}
            modoVisual={configuracionModule.modoVisual}
            descargarAdjunto={pedidosCompraModule.descargarAdjunto}
            cargarHistorialTransformaciones={pedidosCompraModule.cargarHistorialTransformaciones}
          />
        );
      
      case "albaranes-compra":
        return (
          <ListaAlbaranesCompra
            albaranesCompra={albaranesCompraModule.albaranesCompra}
            series={albaranesCompraModule.series}
            estadoOptions={albaranesCompraModule.estadoOptions}
            onNuevo={() => abrirPestana("albaran-compra-nuevo", null, "Nuevo Albarán de Compra")}
            onEditar={(doc) => abrirPestana("albaran-compra-editar", doc.id, `Editar ${doc.numero}`)}
            onVer={(doc) => abrirPestana("albaran-compra-ver", doc.id, `Ver ${doc.numero}`)}
            eliminarAlbaranCompra={albaranesCompraModule.eliminarAlbaranCompra}
            cargarAlbaranesCompra={albaranesCompraModule.cargarAlbaranesCompra}
            loading={albaranesCompraModule.loading}
            modoVisual={configuracionModule.modoVisual}
          />
        );
      case "albaran-compra-nuevo":
      case "albaran-compra-editar":
        return (
          <FormularioAlbaranCompra
            cerrarPestana={() => cerrarPestana(pestanaActiva)}
            pestanaActiva={pestanaActiva}
            albaranId={pestana.datos}
          />
        );
      case "albaran-compra-ver":
        return (
          <VerAlbaranCompra
            cerrarPestana={() => cerrarPestana(pestanaActiva)}
            pestanaActiva={pestanaActiva}
            albaranId={pestana.datos}
          />
        );
      
      case "facturas-compra":
        return (
          <ListaFacturasCompra
            facturasCompra={facturasCompraModule.facturasCompra}
            series={facturasCompraModule.series}
            estadoOptions={facturasCompraModule.estadoOptions}
            onNuevo={() => abrirPestana("factura-compra-nuevo", null, "Nueva Factura de Compra")}
            onEditar={(doc) => abrirPestana("factura-compra-editar", doc.id, `Editar ${doc.numero}`)}
            onVer={(doc) => abrirPestana("factura-compra-ver", doc.id, `Ver ${doc.numero}`)}
            eliminarFacturaCompra={facturasCompraModule.eliminarFacturaCompra}
            cargarFacturasCompra={facturasCompraModule.cargarFacturasCompra}
            loading={facturasCompraModule.loading}
            modoVisual={configuracionModule.modoVisual}
          />
        );
      case "factura-compra-nuevo":
      case "factura-compra-editar":
        return (
          <FormularioFacturaCompra
            cerrarPestana={() => cerrarPestana(pestanaActiva)}
            pestanaActiva={pestanaActiva}
            facturaId={pestana.datos}
          />
        );
      case "factura-compra-ver":
        return (
          <VerFacturaCompra
            cerrarPestana={() => cerrarPestana(pestanaActiva)}
            pestanaActiva={pestanaActiva}
            facturaId={pestana.datos}
          />
        );
      
      // ========== CONFIGURACIÓN ==========
      case "config-ventas":
        return (
          <ConfiguracionVentas
            contabilizarAlbaran={configuracionModule.contabilizarAlbaran}
            setContabilizarAlbaran={configuracionModule.setContabilizarAlbaran}
            documentoDescuentaStock={configuracionModule.documentoDescuentaStock}
            setDocumentoDescuentaStock={configuracionModule.setDocumentoDescuentaStock}
            permitirVentaMultialmacen={configuracionModule.permitirVentaMultialmacen}
            setPermitirVentaMultialmacen={configuracionModule.setPermitirVentaMultialmacen}
            permitirVentaSinStock={configuracionModule.permitirVentaSinStock}
            setPermitirVentaSinStock={configuracionModule.setPermitirVentaSinStock}
            permitirMultitarifa={configuracionModule.permitirMultitarifa}
            setPermitirMultitarifa={configuracionModule.setPermitirMultitarifa}
            estadosAlbaran={configuracionModule.estadosAlbaran}
            agregarEstadoAlbaran={configuracionModule.agregarEstadoAlbaran}
            actualizarEstadoAlbaran={configuracionModule.actualizarEstadoAlbaran}
            eliminarEstadoAlbaran={configuracionModule.eliminarEstadoAlbaran}
            restaurarEstadosAlbaran={configuracionModule.restaurarEstadosAlbaran}
            guardarConfiguracion={configuracionModule.guardarConfiguracionVentas}
            mensaje={configuracionModule.mensajeVentas}
            cargando={configuracionModule.cargandoVentas}
          />
        );
      case "config-apariencia":
        return (
          <ConfiguracionApariencia
            temas={configuracionModule.temas}
            temasModoActual={configuracionModule.temasModoActual}
            temaActivo={configuracionModule.temaActivo}
            aplicarTema={configuracionModule.aplicarTema}
            mensaje={configuracionModule.mensajeApariencia}
            cargando={configuracionModule.cargandoApariencia}
            modoVisual={configuracionModule.modoVisual}
            alternarModoVisual={configuracionModule.alternarModoVisual}
            cambiandoModo={configuracionModule.cambiandoModo}
            actualizarModoVisual={configuracionModule.actualizarModoVisual}
          />
        );
      case "config-plantillas":
        if (configuracionModule.modoEdicion) {
          return (
            <EditorPlantillaPdf
              plantilla={configuracionModule.plantillaParaEditar}
              guardarPlantilla={configuracionModule.guardarPlantillaEditada}
              cerrarEditor={configuracionModule.cerrarEditor}
              mensaje={configuracionModule.mensajePlantillas}
            />
          );
        }
        return (
          <ConfiguracionPlantillas
            plantillas={configuracionModule.plantillas}
            plantillaActual={configuracionModule.plantillaActual}
            cargarPlantilla={configuracionModule.cargarPlantilla}
            activarPlantilla={configuracionModule.activarPlantilla}
            eliminarPlantilla={configuracionModule.eliminarPlantilla}
            nuevaPlantilla={configuracionModule.nuevaPlantilla}
            editarPlantilla={configuracionModule.editarPlantilla}
            mensaje={configuracionModule.mensajePlantillas}
          />
        );
      case "config-tipos-iva":
        return (
          <ConfiguracionTiposIva
            tiposIva={configuracionModule.tiposIva}
            formTipoIva={configuracionModule.formTipoIva}
            limpiarFormTipoIva={configuracionModule.limpiarFormTipoIva}
            editarTipoIva={configuracionModule.editarTipoIva}
            guardarTipoIva={configuracionModule.guardarTipoIva}
            eliminarTipoIva={configuracionModule.eliminarTipoIva}
            updateFormTipoIvaField={configuracionModule.updateFormTipoIvaField}
            mensaje={configuracionModule.mensajeTiposIva}
          />
        );
      case "config-series":
        return (
          <ConfiguracionSeries
            series={seriesModule.series}
            formSerie={seriesModule.formSerie}
            cargando={seriesModule.cargando}
            modoEdicion={seriesModule.modoEdicion}
            tiposDocumentoOptions={seriesModule.tiposDocumentoOptions}
            limpiarFormSerie={seriesModule.limpiarFormSerie}
            editarSerie={seriesModule.editarSerie}
            updateFormSerieField={seriesModule.updateFormSerieField}
            guardarSerie={seriesModule.guardarSerie}
            eliminarSerie={seriesModule.eliminarSerie}
            reiniciarContador={seriesModule.reiniciarContador}
            usuarios={seriesModule.usuarios}
            cargandoUsuarios={seriesModule.cargandoUsuarios}
            preferenciaForm={seriesModule.preferenciaForm}
            preferenciaActual={seriesModule.preferenciaActual}
            updatePreferenciaFormField={seriesModule.updatePreferenciaFormField}
            guardarPreferenciaUsuario={seriesModule.guardarPreferenciaUsuario}
            guardandoPreferenciaUsuario={seriesModule.guardandoPreferenciaUsuario}
            cargandoPreferenciaUsuario={seriesModule.cargandoPreferenciaUsuario}
            seriesPorTipo={seriesModule.seriesPorTipo}
            almacenes={almacenesModule.almacenes}
            tarifas={tarifasModule.tarifas}
            permitirMultitarifa={configuracionModule.permitirMultitarifa}
          />
        );
      default:
        return <div>Contenido no disponible</div>;
    }
  };

  return (
    <div className="erp-workspace">
      {/* Sidebar con menú */}
      <aside className={`erp-sidebar ${sidebarColapsado ? 'collapsed' : ''}`}>
          {/* Logo */}
          <div className="erp-sidebar-header">
            <div
              className="erp-sidebar-logo"
              role="button"
              tabIndex={0}
              onClick={volverAlInicio}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  volverAlInicio();
                }
              }}
            >
              <img src={logoPng} alt="Doscar" className="erp-logo-img" />
              {!sidebarColapsado && (
                <div className="erp-logo-text">
                  <span className="erp-logo-title">DOSCAR</span>
                  <span className="erp-logo-subtitle">Software de gestión</span>
                </div>
              )}
            </div>
            <button
              className="erp-sidebar-toggle"
              onClick={() => setSidebarColapsado(!sidebarColapsado)}
              aria-label={sidebarColapsado ? "Expandir menú" : "Colapsar menú"}
            >
              {sidebarColapsado ? "▸" : "◂"}
            </button>
          </div>

          {/* Menú Terceros */}
          {tienePermiso('moduloTerceros') && (
            <div className="erp-menu-group">
              <button className="erp-menu-toggle" onClick={() => toggleMenu("terceros")}>
                <PersonaIcon className="erp-menu-icon" />
                <span>Terceros</span>
              </button>
              {menusDesplegados.terceros && (
                <div className="erp-menu-items">
                  <button className="erp-menu-item" onClick={() => abrirPestanaConRecarga("clientes", null, "Clientes")}>
                    <PersonaIcon className="erp-menu-icon" /> Clientes
                  </button>
                  <button className="erp-menu-item" onClick={() => abrirPestanaConRecarga("proveedores", null, "Proveedores")}>
                    <EdificioIcon className="erp-menu-icon" /> Proveedores
                  </button>
                  <button className="erp-menu-item" onClick={() => abrirPestanaConRecarga("fabricantes", null, "Fabricantes")}>
                    <ProvetaIcon className="erp-menu-icon" /> Fabricantes
                  </button>
                  <button className="erp-menu-item" onClick={() => abrirPestanaConRecarga("agrupaciones", null, "Agrupaciones")}>
                    <PersonasIcon className="erp-menu-icon" /> Agrupaciones
                  </button>
                  <button className="erp-menu-item" onClick={() => abrirPestanaConRecarga("agrupaciones-proveedores", null, "Agrupaciones Proveedores")}>
                    <PersonasIcon className="erp-menu-icon" /> Agrup. Proveedores
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Menú Almacén */}
          {tienePermiso('moduloAlmacen') && (
            <div className="erp-menu-group">
              <button className="erp-menu-toggle" onClick={() => toggleMenu("almacen")}>
                <AlmacenIcon className="erp-menu-icon" />
                <span>Almacén</span>
              </button>
              {menusDesplegados.almacen && (
                <div className="erp-menu-items">
                  <button className="erp-menu-item" onClick={() => abrirPestanaConRecarga("almacenes", null, "Almacenes")}>
                    <CajaIcon className="erp-menu-icon" /> Almacenes
                  </button>
                  <button className="erp-menu-item" onClick={() => abrirPestanaConRecarga("productos", null, "Productos")}>
                    <ProductosIcon className="erp-menu-icon" /> Productos
                  </button>
                  <button className="erp-menu-item" onClick={() => abrirPestanaConRecarga("familias", null, "Familias")}>
                    <FamiliasIcon className="erp-menu-icon" /> Familias
                  </button>
                  <button className="erp-menu-item" onClick={() => abrirPestanaConRecarga("subfamilias", null, "Subfamilias")}>
                    <SubfamiliasIcon className="erp-menu-icon" /> Subfamilias
                  </button>
                  <button className="erp-menu-item" onClick={() => abrirPestanaConRecarga("tipos-codigo-barra", null, "Formatos códigos de barras")}>
                    <CodigoBarrasIcon className="erp-menu-icon" /> Formatos códigos de barras
                  </button>
                  <button className="erp-menu-item" onClick={() => abrirPestanaConRecarga("tarifas", null, "Tarifas")}>
                    <MonedaIcon className="erp-menu-icon" /> Tarifas
                  </button>
                  <button className="erp-menu-item" onClick={() => abrirPestanaConRecarga("movimientos-stock", null, "Movimientos de Stock")}>
                    <LibroIcon className="erp-menu-icon" /> Movimientos de Stock
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Menú Empresa */}
          {tienePermiso('moduloEmpresa') && (
            <div className="erp-menu-group">
              <button className="erp-menu-toggle" onClick={() => toggleMenu("empresa")}>
                <EdificioIcon className="erp-menu-icon" />
                <span>Empresa</span>
              </button>
              {menusDesplegados.empresa && (
                <div className="erp-menu-items">
                  <button className="erp-menu-item" onClick={() => abrirPestanaConRecarga("datos-empresa", null, "Datos Empresa")}>
                    <EdificioIcon className="erp-menu-icon" /> Datos Empresa
                  </button>
                  <button className="erp-menu-item" onClick={() => abrirPestanaConRecarga("usuarios", null, "Usuarios")}>
                    <UsuarioEscudoIcon className="erp-menu-icon" /> Usuarios
                  </button>
                  <button className="erp-menu-item" onClick={() => abrirPestanaConRecarga("disco-virtual", null, "Disco Virtual")}>
                    <DiscoDuroIcon className="erp-menu-icon" /> Disco Virtual
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Menú Compras */}
          {tienePermiso('moduloVentas') && (
            <div className="erp-menu-group">
              <button className="erp-menu-toggle" onClick={() => toggleMenu("compras")}>
                <LibroIcon className="erp-menu-icon" />
                <span>Compras</span>
              </button>
              {menusDesplegados.compras && (
                <div className="erp-menu-items">
                  <button className="erp-menu-item" onClick={() => abrirPestanaConRecarga("presupuestos-compra", null, "Presupuestos de Compra")}>
                    <DocumentoIcon className="erp-menu-icon" /> Presupuestos
                  </button>
                  <button className="erp-menu-item" onClick={() => abrirPestanaConRecarga("pedidos-compra", null, "Pedidos de Compra")}>
                    <DocumentoIcon className="erp-menu-icon" /> Pedidos
                  </button>
                  <button className="erp-menu-item" onClick={() => abrirPestanaConRecarga("albaranes-compra", null, "Albaranes de Compra")}>
                    <DocumentoIcon className="erp-menu-icon" /> Albaranes
                  </button>
                  <button className="erp-menu-item" onClick={() => abrirPestanaConRecarga("facturas-compra", null, "Facturas de Compra")}>
                    <DocumentoIcon className="erp-menu-icon" /> Facturas
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Menú Ventas */}
          {tienePermiso('moduloVentas') && (
            <div className="erp-menu-group">
              <button className="erp-menu-toggle" onClick={() => toggleMenu("ventas")}>
                <CestaIcon className="erp-menu-icon" />
                <span>Ventas</span>
              </button>
              {menusDesplegados.ventas && (
                <div className="erp-menu-items">
                  <button className="erp-menu-item" onClick={() => abrirPestanaConRecarga("presupuestos", null, "Presupuestos")}>
                    <DocumentoIcon className="erp-menu-icon" /> Presupuestos
                  </button>
                  <button className="erp-menu-item" onClick={() => abrirPestanaConRecarga("pedidos", null, "Pedidos")}>
                    <DocumentoIcon className="erp-menu-icon" /> Pedidos
                  </button>
                  <button className="erp-menu-item" onClick={() => abrirPestanaConRecarga("albaranes", null, "Albaranes")}>
                    <LibroIcon className="erp-menu-icon" /> Albaranes
                  </button>
                  <button className="erp-menu-item" onClick={() => abrirPestanaConRecarga("facturas-proforma", null, "Facturas Proforma")}>
                    <DocumentoIcon className="erp-menu-icon" /> Facturas Proforma
                  </button>
                  <button className="erp-menu-item" onClick={() => abrirPestanaConRecarga("facturas", null, "Facturas")}>
                    <DocumentoIcon className="erp-menu-icon" /> Facturas
                  </button>
                  <button className="erp-menu-item" onClick={() => abrirPestanaConRecarga("facturas-rectificativas", null, "Facturas Rectificativas")}>
                    <DocumentoIcon className="erp-menu-icon" /> Facturas Rectificativas
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TPV */}
          {tienePermiso('moduloTpv') && (
            <div className="erp-menu-group">
              <button className="erp-menu-toggle" onClick={() => toggleMenu("tpv")}>
                <CajaIcon className="erp-menu-icon" />
                <span>TPV</span>
              </button>
              {menusDesplegados.tpv && (
                <div className="erp-menu-items">
                  <button className="erp-menu-item" onClick={() => abrirPestanaConRecarga("tpv", null, "Terminal Punto de Venta")}>
                    <CajaIcon className="erp-menu-icon" /> Terminal TPV
                  </button>
                  <button className="erp-menu-item" onClick={() => abrirPestanaConRecarga("facturas-simplificadas", null, "Facturas Simplificadas")}>
                    <DocumentoIcon className="erp-menu-icon" /> Facturas Simplificadas
                  </button>
                  <button className="erp-menu-item" onClick={() => abrirPestanaConRecarga("config-tpv", null, "Configuración TPV")}>
                    <EngranajeIcon className="erp-menu-icon" /> Configuración TPV
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Configuración */}
          {tienePermiso('moduloConfiguracion') && (
            <div className="erp-menu-group">
              <button className="erp-menu-toggle" onClick={() => toggleMenu("configuracion")}>
                <EngranajeIcon className="erp-menu-icon" />
                <span>Configuración</span>
              </button>
              {menusDesplegados.configuracion && (
                <div className="erp-menu-items">
                  <button className="erp-menu-item" onClick={() => abrirPestanaConRecarga("config-ventas", null, "Configuración de Ventas")}>
                    <LibroIcon className="erp-menu-icon" /> Ventas
                  </button>
                  <button className="erp-menu-item" onClick={() => abrirPestanaConRecarga("config-apariencia", null, "Apariencia")}>
                    <EngranajeIcon className="erp-menu-icon" /> Apariencia
                  </button>
                  <button className="erp-menu-item" onClick={() => abrirPestanaConRecarga("config-plantillas", null, "Plantillas PDF")}>
                    <DocumentoIcon className="erp-menu-icon" /> Plantillas PDF
                  </button>
                  <button className="erp-menu-item" onClick={() => abrirPestanaConRecarga("config-tipos-iva", null, "Tipos de IVA")}>
                    <MonedaIcon className="erp-menu-icon" /> Tipos de IVA
                  </button>
                  <button className="erp-menu-item" onClick={() => abrirPestanaConRecarga("config-series", null, "Series")}>
                    <LibroIcon className="erp-menu-icon" /> Series
                  </button>
                </div>
              )}
            </div>
          )}
        </aside>

      {/* Layout principal con pestañas y contenido */}
      <div className="erp-main-layout">
        {/* Barra de pestañas */}
        <div className="erp-tabs-bar">
          {pestanasAbiertas.map(p => (
            <div
              key={p.id}
              className={`erp-tab ${pestanaActiva === p.id ? "active" : ""}`}
              onClick={() => {
                setPestanaActiva(p.id);
                // Recargar datos del módulo al hacer clic en la pestaña (sin abrir nueva)
                switch (p.tipo) {
                  case "clientes": clientesModule.cargarClientes(); break;
                  case "proveedores": proveedoresModule.cargarProveedores(); break;
                  case "fabricantes": fabricantesModule.cargarFabricantes(); break;
                  case "agrupaciones": agrupacionesModule.cargarAgrupaciones(); break;
                  case "productos": productosModule.cargarProductos(); break;
                  case "familias": familiasModule.cargarFamilias(); break;
                  case "subfamilias": subfamiliasModule.cargarSubfamilias(); break;
                  case "tipos-codigo-barra": tiposCodigoBarraModule.cargarTipos(); break;
                  case "datos-empresa": datosEmpresaModule.cargarEmpresa(); break;
                  case "usuarios": usuariosModule.cargarUsuarios(); break;
                  case "disco-virtual": discoVirtualModule.cargarArchivos(); break;
                  case "albaranes": albaranesModule.cargarAlbaranes(); break;
                  case "tpv": tpvModule.cargarDatos(); break;
                  case "facturas-simplificadas": facturasSimplificadasModule.cargarFacturasSimplificadas(); break;
                  default: break;
                }
              }}
            >
              <span className="erp-tab-title">{p.titulo}</span>
              <button className="erp-tab-close" onClick={(e) => cerrarPestana(p.id, e)}>×</button>
            </div>
          ))}
        </div>

        {/* Contenido principal */}
        <main className="erp-content">
          {mensaje && <div className="erp-message">{mensaje}</div>}
          {renderContenidoPestana()}
        </main>
      </div>
    </div>
  );
}
