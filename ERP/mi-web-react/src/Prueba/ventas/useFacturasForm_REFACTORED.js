import { useCallback, useMemo, useEffect, useRef, useState } from "react";
import { useDocumentoVentaFormBase } from "./useDocumentoVentaFormBase";

const ESTADOS_FACTURA_PREDETERMINADOS = [
  { nombre: "Pendiente", colorClaro: "#FDE68A55", colorOscuro: "#92400E55" },
  { nombre: "Emitido", colorClaro: "#BBF7D055", colorOscuro: "#14532D55" },
  { nombre: "Cobrada", colorClaro: "#A7F3D055", colorOscuro: "#065F4655" },
  { nombre: "Vencida", colorClaro: "#FECACA55", colorOscuro: "#7F1D1D55" },
  { nombre: "Cancelada", colorClaro: "#E5E7EB55", colorOscuro: "#37415155" },
];

const formFacturaInicial = {
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

export function useFacturasForm(pestanaActiva = null, session = null) {
  const base = useDocumentoVentaFormBase(
    {
      tipoDocumento: "FACTURA_VENTA",
      endpoint: "facturas",
      formInicial: formFacturaInicial,
      estadosPredeterminados: ESTADOS_FACTURA_PREDETERMINADOS,
    },
    pestanaActiva,
    session
  );

  // Estado local para controlar la inicialización (evitar bucle infinito)
  const [datosInicializadosLocal, setDatosInicializadosLocal] = useState(false);

  // Lógica de inicialización específica para facturas
  useEffect(() => {
    const esPestanaFactura = typeof pestanaActiva === 'string' && (
      pestanaActiva.startsWith('factura-nuevo') || 
      pestanaActiva.startsWith('factura-editar')
    );
    
    if (esPestanaFactura && !datosInicializadosLocal) {
      setDatosInicializadosLocal(true);
      base.cargarDocumentos();
      base.cargarClientes();
      base.cargarProductos();
      base.cargarTiposIva();
      base.cargarAlmacenes();
      base.cargarSeries();
      base.cargarConfiguracionVentas();
    }
  }, [pestanaActiva, datosInicializadosLocal, base.cargarDocumentos, base.cargarClientes, base.cargarProductos, base.cargarTiposIva, base.cargarAlmacenes, base.cargarSeries, base.cargarConfiguracionVentas]);

  // Función específica para guardar factura con aplanamiento de snapshots
  const guardarFactura = useCallback(async (e, opciones = {}) => {
    if (e) e.preventDefault();
    const formFactura = base.formDocumento;
    const calcularTotales = base.calcularTotales();
    
    try {
      // Aplanar snapshots de direcciones
      const payload = {
        numero: formFactura.numero,
        fecha: formFactura.fecha,
        clienteId: parseInt(formFactura.clienteId) || null,
        estado: formFactura.estado || "Pendiente",
        observaciones: formFactura.observaciones || "",
        notas: formFactura.notas || "",
        serieId: parseInt(formFactura.serieId) || null,
        tarifaId: formFactura.tarifaId || null,
        almacenId: parseInt(formFactura.almacenId) || null,
        ventaMultialmacen: formFactura.ventaMultialmacen || false,
        descuentoAgrupacion: parseFloat(formFactura.descuentoAgrupacion) || 0,
        subtotal: parseFloat(calcularTotales.subtotal),
        totalIva: parseFloat(calcularTotales.totalIva),
        total: parseFloat(calcularTotales.total),
        lineas: formFactura.lineas.map((linea) => ({
          productoId: parseInt(linea.productoId) || null,
          cantidad: parseFloat(linea.cantidad) || 0,
          precioUnitario: parseFloat(linea.precioUnitario) || 0,
          descuento: parseFloat(linea.descuento) || 0,
          tipoIvaId: parseInt(linea.tipoIvaId) || null,
          observaciones: linea.observaciones || "",
          almacenId: parseInt(linea.almacenId) || null,
        })),
        // Dirección de facturación
        direccionFacturacionPais: formFactura.direccionFacturacionSnapshot?.pais || null,
        direccionFacturacionCodigoPostal: formFactura.direccionFacturacionSnapshot?.codigoPostal || null,
        direccionFacturacionProvincia: formFactura.direccionFacturacionSnapshot?.provincia || null,
        direccionFacturacionPoblacion: formFactura.direccionFacturacionSnapshot?.poblacion || null,
        direccionFacturacionDireccion: formFactura.direccionFacturacionSnapshot?.direccion || null,
        // Dirección de envío
        direccionEnvioPais: formFactura.direccionEnvioSnapshot?.pais || null,
        direccionEnvioCodigoPostal: formFactura.direccionEnvioSnapshot?.codigoPostal || null,
        direccionEnvioProvincia: formFactura.direccionEnvioSnapshot?.provincia || null,
        direccionEnvioPoblacion: formFactura.direccionEnvioSnapshot?.poblacion || null,
        direccionEnvioDireccion: formFactura.direccionEnvioSnapshot?.direccion || null,
      };

      const url = formFactura.id ? `${base.API_URL}/${formFactura.id}` : base.API_URL;
      const method = formFactura.id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const facturaGuardada = await response.json();
        
        // Vincular adjuntos
        const adjuntosIds = (formFactura.adjuntos || []).map(a => a.id).filter(id => id && id > 0);
        try {
          await fetch(`${base.API_URL}/${facturaGuardada.id}/adjuntos`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(adjuntosIds),
          });
        } catch (e) {
          console.error("Error al vincular adjuntos:", e);
        }
        
        await base.cargarDocumentos();
        
        if (opciones.cerrarDespues) {
          base.setFormDocumento(formFacturaInicial);
          if (opciones.cerrarPestana) {
            opciones.cerrarPestana();
          }
        } else {
          base.setFormDocumento(prev => ({
            ...prev,
            id: facturaGuardada.id,
            numero: facturaGuardada.numero,
          }));
        }
        
        alert("Factura guardada correctamente");
      } else {
        const error = await response.text();
        alert(`Error al guardar: ${error}`);
      }
    } catch (error) {
      console.error("Error al guardar factura:", error);
      alert("Error al guardar la factura");
    }
  }, [base]);

  // Función específica para cargar factura con reconstrucción de snapshots
  const cargarFactura = useCallback(async (factura) => {
    const { id, pestanaId } = factura;
    try {
      const response = await fetch(`${base.API_URL}/${id}`);
      if (!response.ok) throw new Error("Error al cargar factura");

      const facturaCompleta = await response.json();

      base.setFormDocumento({
        id: facturaCompleta.id,
        numero: facturaCompleta.numero,
        fecha: facturaCompleta.fecha,
        clienteId: facturaCompleta.cliente?.id?.toString() || "",
        estado: facturaCompleta.estado || "Pendiente",
        observaciones: facturaCompleta.observaciones || "",
        notas: facturaCompleta.notas || "",
        serieId: facturaCompleta.serie?.id?.toString() || "",
        tarifaId: facturaCompleta.tarifa?.id || null,
        almacenId: facturaCompleta.almacen?.id || null,
        ventaMultialmacen: facturaCompleta.ventaMultialmacen || false,
        descuentoAgrupacion: facturaCompleta.descuentoAgrupacion || 0,
        descuentoAgrupacionManual: facturaCompleta.descuentoAgrupacion || 0,
        usarCodigoManual: true,
        lineas: (facturaCompleta.lineas || []).map((linea) => ({
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
        adjuntos: facturaCompleta.adjuntos || [],
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
      }, pestanaId);
    } catch (error) {
      console.error("Error al cargar factura:", error);
      throw error;
    }
  }, [base]);

  // Función específica para duplicar factura
  const duplicarFactura = useCallback(async (facturaId) => {
    try {
      const response = await fetch(`${base.TRANSFORMACIONES_API_URL}/duplicar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipoDocumento: "FACTURA",
          documentoId: facturaId,
        }),
      });

      if (response.ok) {
        await base.cargarDocumentos();
        alert("Factura duplicada correctamente");
      } else {
        throw new Error("Error al duplicar");
      }
    } catch (error) {
      console.error("Error al duplicar factura:", error);
      alert("Error al duplicar la factura");
    }
  }, [base]);

  // Función para eliminar factura
  const eliminarFactura = useCallback(async (id) => {
    try {
      const response = await fetch(`${base.API_URL}/${id}`, { method: "DELETE" });
      if (response.ok) {
        await base.cargarDocumentos();
      } else {
        throw new Error("Error al eliminar");
      }
    } catch (error) {
      console.error("Error al eliminar factura:", error);
      throw error;
    }
  }, [base]);

  // Exportar todo explícitamente para compatibilidad con el componente
  return {
    // Datos del hook base
    documentos: base.documentos,
    facturas: base.documentos, // Alias específico
    formFactura: base.formDocumento,
    formulariosPorPestana: base.formulariosPorPestana,
    clientes: base.clientes,
    productos: base.productos,
    tiposIva: base.tiposIva,
    loading: base.loading,
    paginacion: base.paginacion,
    seriesDisponibles: base.seriesDisponibles,
    cargandoSeries: base.cargandoSeries,
    guardandoPreferenciaSerie: base.guardandoPreferenciaSerie,
    generandoNumero: base.generandoNumero,
    estadoOptions: base.estadoOptions,
    almacenes: base.almacenes,
    mostrarSelectorAlmacen: base.mostrarSelectorAlmacen,
    permitirVentaMultialmacen: base.permitirVentaMultialmacen,
    documentoDescuentaStock: base.documentoDescuentaStock,
    mostrarModalCambioEstado: base.mostrarModalCambioEstado,
    datosModalCambioEstado: base.datosModalCambioEstado,
    stockInfo: base.stockInfo,
    tarifasAlbaran: base.tarifasAlbaran,
    modalHistorialAbierto: base.modalHistorialAbierto,
    documentoHistorial: base.documentoHistorial,
    historialModal: base.historialModal,
    cargandoHistorialModal: base.cargandoHistorialModal,

    // Funciones del hook base
    cargarFacturas: base.cargarDocumentos,
    cargarDocumentos: base.cargarDocumentos,
    updateFormFacturaField: base.updateFormDocumentoField,
    updateFormAlbaranField: base.updateFormDocumentoField, // Alias para compatibilidad con FormularioAlbaran
    setDireccionSnapshot: base.setDireccionSnapshot,
    updateDireccionSnapshotField: base.updateDireccionSnapshotField,
    agregarLinea: base.agregarLinea,
    eliminarLinea: base.eliminarLinea,
    actualizarLinea: base.actualizarLinea,
    calcularTotales: base.calcularTotales,
    eliminarFactura: base.eliminarDocumento,
    descargarPdf: base.descargarPdf,
    subirAdjunto: base.subirAdjunto,
    eliminarAdjunto: base.eliminarAdjunto,
    descargarAdjunto: base.descargarAdjunto,
    guardarPreferenciaSerie: base.guardarPreferenciaSerie,
    setFormFactura: base.setFormDocumento,
    limpiarFormularioPestana: base.limpiarFormularioPestana,
    confirmarCambioEstado: base.confirmarCambioEstado,
    cancelarCambioEstado: base.cancelarCambioEstado,
    abrirModalHistorialDocumento: base.abrirModalHistorialDocumento,
    cerrarModalHistorial: base.cerrarModalHistorial,

    // Funciones específicas sobrescritas
    guardarFactura,
    cargarFactura,
    duplicarFactura,
  };
}
