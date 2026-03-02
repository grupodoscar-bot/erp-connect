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
  fecha: new Date().toISOString().slice(0, 16),
  fechaOriginal: null, // Para tracking de cambios
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

const lineaInicial = {
  nombreProducto: "",
  productoId: "",
  referencia: "",
  cantidad: 1,
  precioUnitario: 0,
  descuento: 0,
  observaciones: "",
  tipoIvaId: "",
  tipoIvaNombre: "",
  porcentajeIva: 0,
  porcentajeRecargo: 0,
  importeIva: 0,
  importeRecargo: 0,
  almacenId: "",
};

export function useFacturasForm(pestanaActiva = null, session = null) {
  const base = useDocumentoVentaFormBase(
    {
      tipoDocumento: "FACTURA",
      endpoint: "facturas",
      formInicial: formFacturaInicial,
      estadosPredeterminados: ESTADOS_FACTURA_PREDETERMINADOS,
      tipoSerie: "FACTURA_VENTA", // La serie en BD usa FACTURA_VENTA
    },
    pestanaActiva,
    session
  );

  // Ref para detectar cambios de estado que afectan stock (useRef para que persista entre renders)
  const estadoOriginalFactura = useRef(null);

  // Calcular totales del documento
  const calcularTotales = useMemo(() => {
    const formFactura = base.formDocumento;
    let subtotalBruto = 0;
    let descuentoTotal = 0;
    let totalIva = 0;
    let totalRecargo = 0;
    const desglosePorIva = {};

    const cliente = base.clientes.find((c) => c.id === parseInt(formFactura.clienteId));
    
    formFactura.lineas.forEach((linea) => {
      const producto = base.productos.find((p) => p.id === parseInt(linea.productoId));
      const cantidad = parseFloat(linea.cantidad) || 0;
      const precio = parseFloat(linea.precioUnitario) || 0;
      const descuento = parseFloat(linea.descuento) || 0;

      const bruto = cantidad * precio;
      const descuentoImporte = bruto * (descuento / 100);
      const baseLinea = bruto - descuentoImporte;
      
      subtotalBruto += bruto;
      descuentoTotal += descuentoImporte;

      const tipoIva = base.tiposIva.find((t) => t.id === parseInt(linea.tipoIvaId)) || producto?.tipoIva;
      if (tipoIva) {
        const porcentajeIva = parseFloat(tipoIva.porcentajeIva ?? tipoIva.porcentaje) || 0;
        const porcentajeRecargo = cliente?.recargoEquivalencia && tipoIva.porcentajeRecargo
          ? parseFloat(tipoIva.porcentajeRecargo)
          : 0;

        const descuentoAgrupacionPct = parseFloat(formFactura.descuentoAgrupacionManual ?? formFactura.descuentoAgrupacion) || 0;
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
    const descuentoAgrupacionPct = parseFloat(formFactura.descuentoAgrupacionManual ?? formFactura.descuentoAgrupacion) || 0;
    const descuentoAgrupacionImporte = subtotal * (descuentoAgrupacionPct / 100);
    const totalBaseSinImpuestos = subtotal - descuentoAgrupacionImporte;
    const total = totalBaseSinImpuestos + totalIva + totalRecargo;

    const desgloseIva = Object.values(desglosePorIva)
      .filter((d) => d.baseImponible > 0)
      .sort((a, b) => a.porcentajeIva - b.porcentajeIva);

    return {
      subtotal: subtotalBruto,
      descuentoTotal,
      descuentoAgrupacionPct,
      descuentoAgrupacionImporte,
      descuentoAgrupacionBase: base.descuentoAgrupacionBase,
      totalBaseSinImpuestos,
      totalIva,
      totalRecargo,
      total,
      desgloseIva,
    };
  }, [base.formDocumento, base.clientes, base.productos, base.tiposIva, base.descuentoAgrupacionBase]);

  // Función específica para guardar factura con aplanamiento de snapshots
  const guardarFactura = useCallback(async (e, opciones = {}) => {
    if (e) e.preventDefault();
    const formFactura = base.formDocumento;
    
    // Validar número de documento
    if (!formFactura.numero || formFactura.numero.trim() === "") {
      alert("El número del documento no puede estar vacío. Selecciona una serie o activa la numeración manual.");
      return;
    }

    // Detectar cambio de estado que afecta stock
    const estadoActual = estadoOriginalFactura.current || formFactura.estado;
    const estadoNuevo = formFactura.estado;
    const eraEmitido = estadoActual === "Emitido";
    const esEmitido = estadoNuevo === "Emitido";
    
    // Si cambia DESDE Emitido a otro estado, mostrar modal de restauración
    // Nota: Siempre mostramos la modal porque las facturas pueden descontar stock
    // incluso si documentoDescuentaStock está en ALBARAN (cuando no hay albarán previo
    // o cuando se modifican cantidades)
    if (eraEmitido && !esEmitido && !opciones.confirmarCambioEstado) {
      const productosAfectados = formFactura.lineas
        .filter(l => l.productoId && l.cantidad > 0)
        .map(l => {
          const producto = base.productos.find(p => p.id === parseInt(l.productoId));
          const almacen = base.almacenes.find(a => a.id === parseInt(l.almacenId));
          return {
            nombre: l.nombreProducto || producto?.nombre || 'Producto',
            cantidad: l.cantidad,
            almacen: almacen?.nombre || 'Principal'
          };
        });
      
      base.setDatosModalCambioEstado({
        tipo: 'RESTAURACION',
        estadoOrigen: estadoActual,
        estadoDestino: estadoNuevo,
        productos: productosAfectados
      });
      base.setMostrarModalCambioEstado(true);
      return;
    }
    
    // Si cambia HACIA Emitido desde otro estado, mostrar modal de descuento
    // Nota: Siempre mostramos la modal porque las facturas pueden descontar stock
    // incluso si documentoDescuentaStock está en ALBARAN (cuando no hay albarán previo
    // o cuando se modifican cantidades)
    if (!eraEmitido && esEmitido && !opciones.confirmarCambioEstado) {
      const productosAfectados = formFactura.lineas
        .filter(l => l.productoId && l.cantidad > 0)
        .map(l => {
          const producto = base.productos.find(p => p.id === parseInt(l.productoId));
          const almacen = base.almacenes.find(a => a.id === parseInt(l.almacenId));
          return {
            nombre: l.nombreProducto || producto?.nombre || 'Producto',
            cantidad: l.cantidad,
            almacen: almacen?.nombre || 'Principal'
          };
        });
      
      base.setDatosModalCambioEstado({
        tipo: 'DESCUENTO',
        estadoOrigen: estadoActual,
        estadoDestino: estadoNuevo,
        productos: productosAfectados
      });
      base.setMostrarModalCambioEstado(true);
      return;
    }
    
    try {
      // Solo enviar fecha si fue modificada (comparar con fechaOriginal)
      const fechaModificada = formFactura.fecha !== formFactura.fechaOriginal;
      const fechaFormateada = fechaModificada 
        ? new Date(formFactura.fecha).toISOString()
        : null; // null = backend preservará la fecha existente
      
      // Aplanar snapshots de direcciones
      const payload = {
        numero: formFactura.numero,
        fecha: fechaFormateada,
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
        
        // Actualizar el estado original después de guardar exitosamente
        estadoOriginalFactura.current = formFactura.estado;
        console.log("DEBUG guardarFactura - Actualizado estadoOriginalFactura.current:", estadoOriginalFactura.current);
        
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

      // Convertir fecha ISO a formato datetime-local (YYYY-MM-DDTHH:mm)
      const fechaLocal = facturaCompleta.fecha 
        ? new Date(facturaCompleta.fecha).toISOString().slice(0, 16)
        : new Date().toISOString().slice(0, 16);

      base.setFormDocumento({
        id: facturaCompleta.id,
        numero: facturaCompleta.numero,
        fecha: fechaLocal,
        fechaOriginal: fechaLocal, // Guardar fecha original para tracking
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
      
      // Guardar el estado original para detectar cambios
      estadoOriginalFactura.current = facturaCompleta.estado || "Pendiente";
    } catch (error) {
      console.error("Error al cargar factura:", error);
      throw error;
    }
  }, [base]);

  // Función para abrir factura en modo edición (carga datos completos)
  const abrirEditarFactura = useCallback(async (factura) => {
    try {
      const pestanaId = `factura-editar-${factura.id}`;
      await cargarFactura({ id: factura.id, pestanaId });
      
      if (window.abrirPestana) {
        window.abrirPestana("factura-editar", factura.id, `Editar ${factura.numero}`);
      }
    } catch (error) {
      console.error("Error al abrir factura para editar:", error);
    }
  }, [cargarFactura]);

  // Funciones para gestión de direcciones
  const setDireccionSnapshot = useCallback((tipo, valores) => {
    const key = tipo === "facturacion" ? "direccionFacturacionSnapshot" : "direccionEnvioSnapshot";
    base.setFormDocumento((prev) => ({
      ...prev,
      [key]: valores,
    }));
  }, [base]);

  const updateDireccionSnapshotField = useCallback((tipo, campo, valor) => {
    const key = tipo === "facturacion" ? "direccionFacturacionSnapshot" : "direccionEnvioSnapshot";
    base.setFormDocumento((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [campo]: valor,
      },
    }));
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

  // Confirmar cambio de estado que mueve stock
  const confirmarCambioEstado = useCallback((e, opciones = {}) => {
    base.setMostrarModalCambioEstado(false);
    guardarFactura(e, { ...opciones, confirmarCambioEstado: true });
  }, [base, guardarFactura]);

  // Cancelar cambio de estado y restaurar el estado original
  const cancelarCambioEstado = useCallback(() => {
    base.setMostrarModalCambioEstado(false);
    // Restaurar el estado original
    if (estadoOriginalFactura.current) {
      base.setFormDocumento(prev => ({
        ...prev,
        estado: estadoOriginalFactura.current
      }));
    }
  }, [base]);

  // Funciones auxiliares para cálculo de impuestos
  const findClienteById = (clientes, clienteId) => {
    if (!clienteId) return null;
    return clientes.find((c) => c.id === parseInt(clienteId));
  };

  const findProductoById = (productos, productoId) => {
    if (!productoId) return null;
    return productos.find((p) => p.id === parseInt(productoId));
  };

  const calcularTotalesLineaSinImpuestos = (linea = {}, descuentoAgrupacion = 0) => {
    const cantidad = parseFloat(linea.cantidad) || 0;
    const precio = parseFloat(linea.precioUnitario) || 0;
    const descuento = parseFloat(linea.descuento) || 0;
    const bruto = cantidad * precio;
    const descuentoImporte = bruto * (descuento / 100);
    const baseAntesAgrupacion = bruto - descuentoImporte;
    const descuentoAgrupacionImporte = baseAntesAgrupacion * (descuentoAgrupacion / 100);
    return {
      bruto,
      descuentoImporte,
      baseAntesAgrupacion,
      descuentoAgrupacionImporte,
      baseImponible: baseAntesAgrupacion - descuentoAgrupacionImporte,
    };
  };

  const calcularImpuestosLinea = (linea, producto, cliente, tiposIva = [], descuentoAgrupacion = 0) => {
    const { baseImponible } = calcularTotalesLineaSinImpuestos(linea, descuentoAgrupacion);
    
    let tipoIva = null;
    if (linea.tipoIvaId) {
      tipoIva = tiposIva.find(t => t.id === parseInt(linea.tipoIvaId));
    }
    if (!tipoIva) {
      tipoIva = producto?.tipoIva;
    }
    
    const porcentajeIva = tipoIva?.porcentajeIva ?? 0;
    const porcentajeRecargo =
      cliente?.recargoEquivalencia && tipoIva?.porcentajeRecargo
        ? tipoIva.porcentajeRecargo
        : 0;

    const importeIva = baseImponible * (porcentajeIva / 100);
    const importeRecargo = baseImponible * (porcentajeRecargo / 100);

    return {
      tipoIvaId: tipoIva?.id?.toString() || linea.tipoIvaId || "",
      tipoIvaNombre: tipoIva?.nombre || "",
      porcentajeIva,
      porcentajeRecargo,
      importeIva,
      importeRecargo,
    };
  };

  const aplicarImpuestosEnLineas = ({ lineas = [], clienteId, clientes, productos, tiposIva = [], descuentoAgrupacion = 0 }) => {
    const cliente = typeof clienteId === "object" ? clienteId : findClienteById(clientes, clienteId);
    return lineas.map((linea) => {
      if (!linea?.productoId) {
        return {
          ...linea,
          tipoIvaId: linea?.tipoIvaId || "",
          tipoIvaNombre: linea?.tipoIvaNombre || "",
          porcentajeIva: linea?.porcentajeIva || 0,
          porcentajeRecargo: linea?.porcentajeRecargo || 0,
          importeIva: linea?.importeIva || 0,
          importeRecargo: linea?.importeRecargo || 0,
        };
      }
      
      const producto = findProductoById(productos, linea.productoId);
      const impuestos = calcularImpuestosLinea(linea, producto, cliente, tiposIva, descuentoAgrupacion);
      return {
        ...linea,
        ...impuestos,
      };
    });
  };

  // Funciones de gestión de líneas
  const recalcularLineasConImpuestos = useCallback(
    (lineas, clienteId, descuentoAgrupacionParam = 0) => {
      return aplicarImpuestosEnLineas({
        lineas,
        clienteId,
        clientes: base.clientes,
        productos: base.productos,
        tiposIva: base.tiposIva,
        descuentoAgrupacion: descuentoAgrupacionParam,
      });
    },
    [base.clientes, base.productos, base.tiposIva]
  );

  const agregarLinea = useCallback(() => {
    base.setFormDocumento(prev => {
      const nuevasLineas = [...prev.lineas, { ...lineaInicial }];
      const conImpuestos = recalcularLineasConImpuestos(nuevasLineas, prev.clienteId, prev.descuentoAgrupacionManual || 0);
      return {
        ...prev,
        lineas: conImpuestos,
      };
    });
  }, [recalcularLineasConImpuestos, base.setFormDocumento]);

  const eliminarLinea = useCallback((index) => {
    base.setFormDocumento(prev => {
      const filtradas = prev.lineas.filter((_, i) => i !== index);
      const conImpuestos = recalcularLineasConImpuestos(filtradas, prev.clienteId, prev.descuentoAgrupacionManual || 0);
      return {
        ...prev,
        lineas: conImpuestos,
      };
    });
  }, [recalcularLineasConImpuestos, base.setFormDocumento]);

  const actualizarLinea = useCallback((index, campo, valor) => {
    base.setFormDocumento(prev => {
      const nuevasLineas = [...prev.lineas];
      nuevasLineas[index] = { ...nuevasLineas[index], [campo]: valor };

      if (campo === "productoId" && valor) {
        const producto = base.productos.find(p => p.id === parseInt(valor));
        if (producto) {
          const precioDetectado =
            producto.precioVenta ??
            producto.precio ??
            producto.precioConImpuestos ??
            producto.precioUnitario ??
            0;
          nuevasLineas[index].precioUnitario = parseFloat(precioDetectado) || 0;
          nuevasLineas[index].tipoIvaId = "";
          nuevasLineas[index].referencia = producto.referencia || "";
          if (prev.ventaMultialmacen && producto.almacenPredeterminado?.id) {
            nuevasLineas[index].almacenId = producto.almacenPredeterminado.id.toString();
          }
        }
      }

      const lineasConImpuestos = recalcularLineasConImpuestos(nuevasLineas, prev.clienteId, prev.descuentoAgrupacionManual || 0);
      return { ...prev, lineas: lineasConImpuestos };
    });
  }, [base.productos, recalcularLineasConImpuestos, base.setFormDocumento]);

  // Exportar todo explícitamente para compatibilidad con el componente
  const exported = {
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
    stockInfo: base.stockInfo,
    tarifasAlbaran: base.tarifasAlbaran,
    mostrarModalCambioEstado: base.mostrarModalCambioEstado,
    datosModalCambioEstado: base.datosModalCambioEstado,
    modalHistorialAbierto: base.modalHistorialAbierto,
    documentoHistorial: base.documentoHistorial,
    historialModal: base.historialModal,
    cargandoHistorialModal: base.cargandoHistorialModal,

    // Funciones del hook base
    cargarFacturas: base.cargarDocumentos,
    cargarDocumentos: base.cargarDocumentos,
    updateFormFacturaField: base.updateFormDocumentoField,
    updateFormAlbaranField: base.updateFormDocumentoField, // Alias para compatibilidad con FormularioAlbaran
    setDireccionSnapshot,
    updateDireccionSnapshotField,
    agregarLinea,
    eliminarLinea,
    actualizarLinea,
    calcularTotales,
    eliminarFactura,
    descargarPdf: base.descargarPdf,
    subirAdjunto: base.subirAdjunto,
    eliminarAdjunto: base.eliminarAdjunto,
    descargarAdjunto: base.descargarAdjunto,
    guardarPreferenciaSerie: base.guardarPreferenciaSerie,
    setFormFactura: base.setFormDocumento,
    limpiarFormularioPestana: base.limpiarFormularioPestana,
    abrirModalHistorialDocumento: base.abrirModalHistorialDocumento,
    cerrarModalHistorial: base.cerrarModalHistorial,
    cargarHistorialTransformaciones: base.cargarHistorialTransformaciones,

    // Funciones específicas sobrescritas
    guardarFactura,
    cargarFactura,
    abrirEditarFactura,
    duplicarFactura,
    confirmarCambioEstado,
    cancelarCambioEstado,
  };
  
  return exported;
}
