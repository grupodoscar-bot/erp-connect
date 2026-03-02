import React, { useState, useEffect } from 'react';
import { IconEdit, IconPdf, IconTransform, IconEmail, IconFile, IconDownload } from '../iconos';
import { HistorialTransformaciones } from './HistorialTransformaciones';
import API_ENDPOINTS from '../../config/api';

const FALLBACK_BADGE_LIGHT = {
  backgroundColor: "rgba(148, 163, 184, 0.2)",
  color: "#0f172a",
  border: "1px solid rgba(15, 23, 42, 0.15)",
};

const FALLBACK_BADGE_DARK = {
  backgroundColor: "rgba(148, 163, 184, 0.2)",
  color: "#f8fafc",
  border: "1px solid rgba(248, 250, 252, 0.15)",
};

const hexToRgba = (hex) => {
  if (typeof hex !== "string") return null;
  let value = hex.trim();
  if (!value.startsWith("#")) return null;
  value = value.slice(1);
  if (![3, 4, 6, 8].includes(value.length)) return null;
  if (value.length === 3 || value.length === 4) {
    value = value
      .split("")
      .map((c) => `${c}${c}`)
      .join("");
  }
  if (value.length === 6) value = `${value}ff`;
  const intVal = parseInt(value, 16);
  if (Number.isNaN(intVal)) return null;
  return {
    r: (intVal >> 24) & 255,
    g: (intVal >> 16) & 255,
    b: (intVal >> 8) & 255,
    a: (intVal & 255) / 255,
  };
};

const colorWithAlpha = (hex, alpha) => {
  const parsed = hexToRgba(hex);
  if (!parsed) return hex || "transparent";
  const clampedAlpha = Math.max(0, Math.min(1, alpha));
  return `rgba(${parsed.r}, ${parsed.g}, ${parsed.b}, ${clampedAlpha})`;
};

const buildBadgeStyle = (baseColor, modoVisual = "claro") => {
  if (!baseColor || baseColor === "transparent") {
    return modoVisual === "oscuro" ? FALLBACK_BADGE_DARK : FALLBACK_BADGE_LIGHT;
  }
  const background = colorWithAlpha(baseColor, modoVisual === "oscuro" ? 0.7 : 0.9);
  const borderColor =
    modoVisual === "oscuro" ? "rgba(248, 250, 252, 0.15)" : "rgba(15, 23, 42, 0.15)";
  return {
    backgroundColor: background,
    color: modoVisual === "oscuro" ? "#f8fafc" : "#1f2937",
    border: `1px solid ${borderColor}`,
  };
};

export function FichaDocumentoVenta({
  documento,
  documentoId,
  tipoDocumento = 'DOCUMENTO',
  nombreDocumento = 'documento',
  abrirEditar,
  generarPdf,
  abrirModalTransformar,
  abrirModalEmail,
  estadoOptions = [],
  modoVisual = "claro",
  descargarAdjunto,
  cargarHistorialTransformaciones,
}) {
  const [documentoCompleto, setDocumentoCompleto] = useState(documento);
  const [cargandoDocumento, setCargandoDocumento] = useState(false);
  const [direccionesCliente, setDireccionesCliente] = useState([]);
  const [historialTransformaciones, setHistorialTransformaciones] = useState([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);
  
  // Cargar documento completo si no está disponible
  useEffect(() => {
    // Cargar si no hay documento o está incompleto
    const necesitaCargar = !documento || 
                          !documento.cliente || 
                          !documento.serie ||
                          !documento.lineas || 
                          documento.lineas.length === 0;
    
    if (!documentoId) return;
    if (!necesitaCargar) return;
    
    const cargarDocumento = async () => {
      setCargandoDocumento(true);
      try {
        const endpointMap = {
          'PRESUPUESTO': API_ENDPOINTS.presupuestos,
          'PEDIDO': API_ENDPOINTS.pedidos,
          'ALBARAN': API_ENDPOINTS.albaranes,
          'FACTURA': API_ENDPOINTS.facturas,
          'FACTURA_PROFORMA': API_ENDPOINTS.facturasProforma,
          'FACTURA_RECTIFICATIVA': API_ENDPOINTS.facturasRectificativas
        };
        
        const endpoint = endpointMap[tipoDocumento] || API_ENDPOINTS.albaranes;
        const url = `${endpoint}/${documentoId}`;
        
        const response = await fetch(url);
        
        if (response.ok) {
          const doc = await response.json();
          setDocumentoCompleto(doc);
        }
      } catch (error) {
        console.error('Error al cargar documento:', error);
      } finally {
        setCargandoDocumento(false);
      }
    };
    
    cargarDocumento();
  }, [documento, documentoId, tipoDocumento]);
  
  const docActual = documentoCompleto || documento;
  const clienteActual = docActual?.cliente;
  
  useEffect(() => {
    if (!clienteActual) {
      setDireccionesCliente([]);
      return;
    }

    const obtenerDirecciones = async () => {
      try {
        const response = await fetch(`${API_ENDPOINTS.clientes}/${clienteActual.id}/direcciones`);
        if (response.ok) {
          const direcciones = await response.json();
          const direccionesFormateadas = direcciones.map(dir => ({
            id: dir.id,
            direccion: dir.direccion,
            codigoPostal: dir.codigoPostal,
            poblacion: dir.poblacion,
            provincia: dir.provincia,
            pais: dir.pais || 'España'
          }));
          setDireccionesCliente(direccionesFormateadas);
        } else {
          setDireccionesCliente([]);
        }
      } catch (error) {
        console.error('Error al obtener direcciones:', error);
        setDireccionesCliente([]);
      }
    };

    obtenerDirecciones();
  }, [clienteActual]);

  useEffect(() => {
    if (!docActual || !cargarHistorialTransformaciones) {
      return;
    }

    const cargarHistorial = async () => {
      setCargandoHistorial(true);
      try {
        const historial = await cargarHistorialTransformaciones(tipoDocumento, docActual.id);
        setHistorialTransformaciones(historial || []);
      } catch (error) {
        console.error('Error al cargar historial:', error);
        setHistorialTransformaciones([]);
      } finally {
        setCargandoHistorial(false);
      }
    };

    cargarHistorial();
  }, [docActual, cargarHistorialTransformaciones, tipoDocumento]);

  if (!docActual) return <div className="erp-empty-state">{nombreDocumento.charAt(0).toUpperCase() + nombreDocumento.slice(1)} no encontrado</div>;
  
  if (cargandoDocumento) return <div className="erp-empty-state">Cargando {nombreDocumento}...</div>;
  
  const calcularTotales = () => {
    let subtotal = 0;
    let descuentoTotal = 0;
    let totalIva = 0;
    let totalRecargo = 0;
    const desglosePorIva = {};

    (docActual.lineas || []).forEach(linea => {
      const lineaSubtotal = (linea.cantidad || 0) * (linea.precioUnitario || 0);
      const lineaDescuento = lineaSubtotal * ((linea.descuento || 0) / 100);
      subtotal += lineaSubtotal;
      descuentoTotal += lineaDescuento;

      const tipoIvaKey = linea.tipoIva?.id || "sin_iva";
      const porcentajeIva = linea.porcentajeIva || 0;
      const porcentajeRecargo = linea.porcentajeRecargo || 0;
      if (!desglosePorIva[tipoIvaKey]) {
        desglosePorIva[tipoIvaKey] = {
          nombre: linea.tipoIva?.nombre || (porcentajeIva > 0 ? `${porcentajeIva}%` : "Sin IVA"),
          porcentajeIva,
          porcentajeRecargo,
          baseAntesDescuento: 0,
          descuentoAgrupacionImporte: 0,
          baseImponible: 0,
          importeIva: 0,
          importeRecargo: 0,
        };
      }
      const baseLinea = lineaSubtotal - lineaDescuento;
      const descuentoAgrupacionPct = docActual.descuentoAgrupacion || 0;
      const baseConAgrupacion = baseLinea * (1 - descuentoAgrupacionPct / 100);
      const descuentoAgrupacionLinea = baseLinea - baseConAgrupacion;
      
      const ivaLinea = baseConAgrupacion * (porcentajeIva / 100);
      const recargoLinea = baseConAgrupacion * (porcentajeRecargo / 100);
      
      desglosePorIva[tipoIvaKey].baseAntesDescuento += baseLinea;
      desglosePorIva[tipoIvaKey].descuentoAgrupacionImporte += descuentoAgrupacionLinea;
      desglosePorIva[tipoIvaKey].baseImponible += baseConAgrupacion;
      desglosePorIva[tipoIvaKey].importeIva += ivaLinea;
      desglosePorIva[tipoIvaKey].importeRecargo += recargoLinea;
      
      totalIva += ivaLinea;
      totalRecargo += recargoLinea;
    });

    const totalTrasDescuentosLinea = subtotal - descuentoTotal;
    const descuentoAgrupacionPct = docActual.descuentoAgrupacion || 0;
    const descuentoAgrupacionImporte = totalTrasDescuentosLinea * (descuentoAgrupacionPct / 100);
    const baseTrasAgrupacion = totalTrasDescuentosLinea - descuentoAgrupacionImporte;
    const total = baseTrasAgrupacion + totalIva + totalRecargo;

    const desgloseIvaArray = Object.values(desglosePorIva)
      .filter(d => d.baseImponible > 0)
      .sort((a, b) => a.porcentajeIva - b.porcentajeIva);

    return { 
      subtotal, 
      descuentoTotal, 
      descuentoAgrupacionPct, 
      descuentoAgrupacionImporte, 
      totalIva, 
      totalRecargo, 
      baseTrasAgrupacion: baseTrasAgrupacion,
      totalBaseSinImpuestos: baseTrasAgrupacion,
      total, 
      desgloseIva: desgloseIvaArray 
    };
  };

  const totales = calcularTotales();

  const aplicarAlphaColorFicha = (color, alpha = 0.2) => {
    if (!color || color === "transparent") return "transparent";
    if (color.startsWith("rgba")) {
      return color.replace(/rgba\(([^,]+),([^,]+),([^,]+),[^)]+\)/, `rgba($1,$2,$3,${alpha})`);
    }
    if (color.startsWith("#")) {
      let hex = color.slice(1);
      if (hex.length === 3) {
        hex = hex.split("").map((ch) => ch + ch).join("");
      }
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    return color;
  };

  const getColorEstado = (estado) => {
    if (!estado || !Array.isArray(estadoOptions)) return "transparent";
    const estadoObj = estadoOptions.find((e) => e.nombre === estado);
    if (!estadoObj) return "transparent";
    return modoVisual === "oscuro" ? estadoObj.colorOscuro : estadoObj.colorClaro;
  };

  const getEstadoBadgeStyle = (estado) =>
    buildBadgeStyle(getColorEstado(estado), modoVisual);

  const getLineaEstadoStyle = (estado) => {
    const base = getColorEstado(estado);
    if (!base || base === "transparent") return {};
    const alpha = modoVisual === "oscuro" ? 0.28 : 0.18;
    return {
      backgroundColor: colorWithAlpha(base, alpha),
      borderLeft: `4px solid ${base}`,
    };
  };

  const ventaMultialmacen = docActual.ventaMultialmacen;
  const cliente = clienteActual;

  return (
    <div className="erp-form-view">
      {/* Botones de acción arriba */}
      <div className="erp-form-actions" style={{ marginBottom: '16px', paddingTop: 0 }}>
        {abrirEditar && (
          <button type="button" className="erp-btn erp-btn-primary" onClick={() => abrirEditar(docActual)}>
            <IconEdit className="erp-action-icon" /> Editar
          </button>
        )}
        {generarPdf && (
          <button type="button" className="erp-btn erp-btn-info" onClick={() => generarPdf(docActual.id)}>
            <IconPdf className="erp-action-icon" /> PDF
          </button>
        )}
        {abrirModalTransformar && (
          <button type="button" className="erp-btn erp-btn-secondary" onClick={() => abrirModalTransformar(docActual)}>
            <IconTransform className="erp-action-icon" /> Transformar
          </button>
        )}
        {abrirModalEmail && (
          <button type="button" className="erp-btn erp-btn-secondary" onClick={() => abrirModalEmail(docActual)}>
            <IconEmail className="erp-action-icon" /> Email
          </button>
        )}
      </div>

      <div className="erp-form-content">
        <div className="erp-form-section">
          {/* Datos del documento */}
          <div className="erp-form-group">
            <h4 className="erp-form-group-title">Datos del {nombreDocumento}</h4>
            <div className="erp-form-row erp-form-row-4">
              <div className="erp-field">
                <span className="erp-field-label">Número</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 500, fontSize: '14px' }}>{docActual.numero || '—'}</span>
              </div>
              <div className="erp-field">
                <span className="erp-field-label">Fecha</span>
                <span style={{ fontSize: '14px' }}>{docActual.fecha || '—'}</span>
              </div>
              <div className="erp-field">
                <span className="erp-field-label">Cliente</span>
                <span style={{ fontSize: '14px' }}>{cliente?.nombreComercial || 'Sin cliente'}</span>
              </div>
              <div className="erp-field">
                <span className="erp-field-label">Estado</span>
                <span className="erp-badge" style={getEstadoBadgeStyle(docActual.estado)}>
                  {docActual.estado || '—'}
                </span>
              </div>
            </div>

            {/* Serie, Tarifa y Almacén */}
            <div className="erp-form-row erp-form-row-3" style={{ marginTop: '12px' }}>
              <div className="erp-field">
                <span className="erp-field-label">Serie</span>
                <span style={{ fontSize: '14px' }}>{docActual.serie?.prefijo || 'Sin serie'}</span>
              </div>
              {docActual.tarifa && (
                <div className="erp-field">
                  <span className="erp-field-label">Tarifa</span>
                  <span style={{ fontSize: '14px' }}>{docActual.tarifa?.nombre || '—'}</span>
                </div>
              )}
              {!ventaMultialmacen && docActual.almacen && (
                <div className="erp-field">
                  <span className="erp-field-label">Almacén</span>
                  <span style={{ fontSize: '14px' }}>{docActual.almacen?.nombre || '—'}</span>
                </div>
              )}
              {ventaMultialmacen && (
                <div className="erp-field">
                  <span className="erp-field-label">Venta multialmacén</span>
                  <span style={{ padding: '4px 8px', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '4px', fontSize: '13px', color: '#0369a1' }}>
                    ✓ Almacenes por línea
                  </span>
                </div>
              )}
            </div>

            {/* Datos del cliente (snapshot histórico) */}
            {(docActual.clienteNombreComercial || cliente) && (
              <div style={{ 
                marginTop: '16px', 
                padding: '12px 16px', 
                backgroundColor: '#f8fafc', 
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                fontSize: '13px'
              }}>
                <div style={{ fontWeight: '600', marginBottom: '8px', color: '#475569' }}>
                  Datos del cliente (en el momento de creación)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px 24px' }}>
                  <div><span style={{ color: '#64748b' }}>Nombre comercial:</span> <strong>{docActual.clienteNombreComercial || cliente?.nombreComercial || '—'}</strong></div>
                  <div><span style={{ color: '#64748b' }}>Razón social:</span> {docActual.clienteNombreFiscal || cliente?.nombreFiscal || '—'}</div>
                  <div><span style={{ color: '#64748b' }}>CIF/NIF:</span> <span style={{ fontFamily: 'monospace' }}>{docActual.clienteNifCif || cliente?.nifCif || '—'}</span></div>
                  <div><span style={{ color: '#64748b' }}>Email:</span> {docActual.clienteEmail || cliente?.email || '—'}</div>
                  <div><span style={{ color: '#64748b' }}>Teléfono:</span> {docActual.clienteTelefono || cliente?.telefonoFijo || cliente?.telefonoMovil || '—'}</div>
                  {cliente?.agrupacion && (
                    <div><span style={{ color: '#64748b' }}>Agrupación:</span> <strong>{cliente.agrupacion.nombre}</strong> (Dto. {cliente.agrupacion.descuentoGeneral || 0}%)</div>
                  )}
                  {cliente?.recargoEquivalencia && (
                    <div><span style={{ color: '#64748b' }}>Recargo Eq.:</span> <span className="erp-badge erp-badge-warning">Sí</span></div>
                  )}
                </div>
              </div>
            )}

            {/* Direcciones: Facturación y Envío (snapshot histórico) */}
            <div className="erp-form-row erp-form-row-2" style={{ marginTop: '16px', gap: '16px' }}>
              {/* Dirección de facturación */}
              <div className="erp-field">
                <span className="erp-field-label">Dirección de facturación (en el momento de creación)</span>
                <div style={{ 
                  padding: '8px 12px', 
                  backgroundColor: '#f1f5f9', 
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  color: '#475569',
                  minHeight: '38px',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  {(() => {
                    const partes = [];
                    if (docActual.direccionFacturacionDireccion) partes.push(docActual.direccionFacturacionDireccion);
                    if (docActual.direccionFacturacionCodigoPostal) partes.push(docActual.direccionFacturacionCodigoPostal);
                    if (docActual.direccionFacturacionPoblacion) partes.push(docActual.direccionFacturacionPoblacion);
                    if (docActual.direccionFacturacionProvincia) partes.push(docActual.direccionFacturacionProvincia);
                    if (docActual.direccionFacturacionPais && docActual.direccionFacturacionPais !== 'España') partes.push(docActual.direccionFacturacionPais);
                    if (partes.length > 0) return partes.join(', ');
                    
                    if (direccionesCliente.length > 0) {
                      const dirFacturacion = direccionesCliente[0];
                      const partesFallback = [];
                      if (dirFacturacion.direccion) partesFallback.push(dirFacturacion.direccion);
                      if (dirFacturacion.codigoPostal) partesFallback.push(dirFacturacion.codigoPostal);
                      if (dirFacturacion.poblacion) partesFallback.push(dirFacturacion.poblacion);
                      if (dirFacturacion.provincia) partesFallback.push(dirFacturacion.provincia);
                      if (dirFacturacion.pais && dirFacturacion.pais !== 'España') partesFallback.push(dirFacturacion.pais);
                      return partesFallback.join(', ') || '—';
                    }
                    return '—';
                  })()}
                </div>
              </div>

              {/* Dirección de entrega */}
              <div className="erp-field">
                <span className="erp-field-label">Dirección de entrega (en el momento de creación)</span>
                <div style={{ 
                  padding: '8px 12px', 
                  backgroundColor: '#f1f5f9', 
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  color: '#475569',
                  minHeight: '38px',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  {(() => {
                    const partes = [];
                    if (docActual.direccionEnvioDireccion) partes.push(docActual.direccionEnvioDireccion);
                    if (docActual.direccionEnvioCodigoPostal) partes.push(docActual.direccionEnvioCodigoPostal);
                    if (docActual.direccionEnvioPoblacion) partes.push(docActual.direccionEnvioPoblacion);
                    if (docActual.direccionEnvioProvincia) partes.push(docActual.direccionEnvioProvincia);
                    if (docActual.direccionEnvioPais && docActual.direccionEnvioPais !== 'España') partes.push(docActual.direccionEnvioPais);
                    if (partes.length > 0) return partes.join(', ');
                    
                    if (docActual.direccion) {
                      const dir = docActual.direccion;
                      const partesFallback = [];
                      if (dir.direccion) partesFallback.push(dir.direccion);
                      if (dir.codigoPostal) partesFallback.push(dir.codigoPostal);
                      if (dir.poblacion) partesFallback.push(dir.poblacion);
                      if (dir.provincia) partesFallback.push(dir.provincia);
                      if (dir.pais && dir.pais !== 'España') partesFallback.push(dir.pais);
                      return partesFallback.join(', ') || '—';
                    }
                    return direccionesCliente.length > 0 ? 'Misma que facturación' : '—';
                  })()}
                </div>
              </div>
            </div>
          </div>

          {/* Líneas de productos */}
          <div className="erp-form-group">
            <h4 className="erp-form-group-title" style={{ marginBottom: '12px' }}>Líneas de productos</h4>

            <table className="erp-table erp-table-compact">
              <thead>
                <tr>
                  <th style={{ width: ventaMultialmacen ? '7%' : '8%' }}>Referencia</th>
                  <th style={{ width: ventaMultialmacen ? '22%' : '30%' }}>Producto</th>
                  {ventaMultialmacen && (
                    <th style={{ width: '13%' }}>Almacén</th>
                  )}
                  <th style={{ width: '7%', textAlign: 'center' }}>Cant.</th>
                  <th style={{ width: ventaMultialmacen ? '11%' : '14%', textAlign: 'center' }}>Precio</th>
                  <th style={{ width: '7%', textAlign: 'center' }}>Dto. %</th>
                  <th style={{ width: '7%', textAlign: 'center' }}>IVA %</th>
                  <th style={{ width: '7%', textAlign: 'center' }}>Rec. %</th>
                  <th style={{ width: ventaMultialmacen ? '11%' : '18%', textAlign: 'center' }}>Base</th>
                  <th style={{ width: '4%' }}></th>
                </tr>
              </thead>
              <tbody>
                {(docActual.lineas || []).map((linea, index) => (
                  <tr key={index}>
                    <td className="erp-td-mono">{linea.producto?.referencia || '—'}</td>
                    <td>{linea.nombreProducto || linea.producto?.titulo || '—'}</td>
                    {ventaMultialmacen && (
                      <td style={{ fontSize: '12px' }}>{linea.almacen?.nombre || '—'}</td>
                    )}
                    <td className="erp-td-mono" style={{ textAlign: 'center' }}>{linea.cantidad}</td>
                    <td className="erp-td-mono" style={{ textAlign: 'center' }}>{(linea.precioUnitario || 0).toFixed(2)} €</td>
                    <td className="erp-td-mono" style={{ textAlign: 'center' }}>{linea.descuento || 0}%</td>
                    <td className="erp-td-mono" style={{ textAlign: 'center' }}>{linea.porcentajeIva || 0}%</td>
                    <td className="erp-td-mono" style={{ textAlign: 'center' }}>{(linea.porcentajeRecargo || 0).toFixed(1)}%</td>
                    <td className="erp-td-mono" style={{ textAlign: 'center' }}>
                      {((linea.cantidad || 0) * (linea.precioUnitario || 0) * (1 - (linea.descuento || 0) / 100)).toFixed(2)} €
                    </td>
                    <td></td>
                  </tr>
                ))}
                {(!docActual.lineas || docActual.lineas.length === 0) && (
                  <tr><td colSpan={ventaMultialmacen ? "10" : "9"} className="erp-td-empty">No hay líneas</td></tr>
                )}
              </tbody>
            </table>

            {/* Layout de dos columnas: desglose a la izquierda, totales a la derecha */}
            <div style={{ display: 'flex', gap: '24px', marginTop: '16px', justifyContent: 'flex-end' }}>
              {/* Desglose por tipo de IVA (tras descuentos) - solo si hay más de un tipo */}
              {totales.desgloseIva && totales.desgloseIva.length > 1 && (
                <div style={{ 
                  flex: '0 1 auto',
                  padding: '12px', 
                  backgroundColor: '#f8fafc', 
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '8px', color: '#475569' }}>
                    Desglose por tipo de IVA (tras descuentos)
                  </div>
                  <table style={{ fontSize: '12px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <th style={{ textAlign: 'left', padding: '4px 8px', fontWeight: '500' }}>Tipo IVA</th>
                        <th style={{ textAlign: 'right', padding: '4px 8px', fontWeight: '500' }}>Base antes dto</th>
                        <th style={{ textAlign: 'right', padding: '4px 8px', fontWeight: '500' }}>Dto. agr.</th>
                        <th style={{ textAlign: 'right', padding: '4px 8px', fontWeight: '500' }}>Base imp.</th>
                        <th style={{ textAlign: 'right', padding: '4px 8px', fontWeight: '500' }}>IVA</th>
                        {(totales.totalRecargo || 0) > 0 && (
                          <th style={{ textAlign: 'right', padding: '4px 8px', fontWeight: '500' }}>Recargo</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {totales.desgloseIva.map((desglose, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '4px 8px' }}>{desglose.porcentajeIva}%</td>
                          <td style={{ textAlign: 'right', padding: '4px 8px', fontFamily: 'monospace' }}>
                            {(desglose.baseAntesDescuento || 0).toFixed(2)} €
                          </td>
                          <td style={{ textAlign: 'right', padding: '4px 8px', fontFamily: 'monospace', color: '#dc2626' }}>
                            -{Math.abs(desglose.descuentoAgrupacionImporte || 0).toFixed(2)} €
                          </td>
                          <td style={{ textAlign: 'right', padding: '4px 8px', fontFamily: 'monospace' }}>
                            {desglose.baseImponible.toFixed(2)} €
                          </td>
                          <td style={{ textAlign: 'right', padding: '4px 8px', fontFamily: 'monospace' }}>
                            {desglose.importeIva.toFixed(2)} €
                          </td>
                          {(totales.totalRecargo || 0) > 0 && (
                            <td style={{ textAlign: 'right', padding: '4px 8px', fontFamily: 'monospace' }}>
                              {desglose.importeRecargo.toFixed(2)} €
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Totales a la derecha */}
              <div
                className="erp-totales-box"
                style={{ flex: '0 0 auto', minWidth: '320px' }}
                title="Los importes totales pueden variar ±0,01 € respecto al desglose por redondeos"
              >
                <div className="erp-total-row">
                  <span>Subtotal:</span>
                  <span className="erp-mono">{totales.subtotal.toFixed(2)} €</span>
                </div>
                {totales.descuentoTotal > 0 && (
                  <>
                    <div className="erp-total-row">
                      <span>Descuento líneas:</span>
                      <span className="erp-mono" style={{ color: '#dc2626' }}>-{totales.descuentoTotal.toFixed(2)} €</span>
                    </div>
                    <div className="erp-total-row">
                      <span>Base tras dto. líneas:</span>
                      <span className="erp-mono">{(totales.subtotal - totales.descuentoTotal).toFixed(2)} €</span>
                    </div>
                  </>
                )}
                {totales.descuentoAgrupacionPct > 0 && (
                  <div className="erp-total-row">
                    <span>Dto. agrup. ({totales.descuentoAgrupacionPct}%):</span>
                    <span className="erp-mono" style={{ color: '#dc2626' }}>-{totales.descuentoAgrupacionImporte.toFixed(2)} €</span>
                  </div>
                )}
                <div className="erp-total-row">
                  <span>Base imponible:</span>
                  <span className="erp-mono">{totales.baseTrasAgrupacion.toFixed(2)} €</span>
                </div>
                <div className="erp-total-row">
                  <span>
                    {totales.desgloseIva && totales.desgloseIva.length === 1 
                      ? `Total IVA (${totales.desgloseIva[0].porcentajeIva}%):`
                      : "Total IVA:"
                    }
                  </span>
                  <span className="erp-mono">{totales.totalIva.toFixed(2)} €</span>
                </div>
                {(totales.totalRecargo || 0) > 0 && (
                  <div className="erp-total-row">
                    <span>Total Recargo Eq.:</span>
                    <span className="erp-mono">{(totales.totalRecargo || 0).toFixed(2)} €</span>
                  </div>
                )}
                <div className="erp-total-row erp-total-final">
                  <span>TOTAL:</span>
                  <span className="erp-mono">{totales.total.toFixed(2)} €</span>
                </div>
              </div>
            </div>
          </div>

          {/* Observaciones */}
          {docActual.observaciones && (
            <div className="erp-form-group">
              <label className="erp-field erp-field-full">
                <span className="erp-field-label">Observaciones</span>
                <textarea rows="2" value={docActual.observaciones} disabled />
              </label>
            </div>
          )}

          {/* Notas internas y Adjuntos */}
          {(docActual.notas || docActual.adjuntos?.length > 0) && (
            <div className="erp-form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
              {docActual.notas && (
                <div className="erp-field">
                  <span className="erp-field-label">Notas internas (no se imprimen)</span>
                  <div style={{ 
                    backgroundColor: '#fffbeb', 
                    borderColor: '#fcd34d',
                    border: '1px solid #fcd34d',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    fontSize: '13px',
                    minHeight: '60px'
                  }}>
                    {docActual.notas}
                  </div>
                </div>
              )}
              
              {docActual.adjuntos?.length > 0 && (
                <div className="erp-field">
                  <span className="erp-field-label">Archivos adjuntos</span>
                  <div style={{ 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '6px', 
                    padding: '8px',
                    backgroundColor: '#f8fafc'
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {docActual.adjuntos.map((adj, idx) => (
                        <div 
                          key={idx} 
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '4px 8px',
                            backgroundColor: '#fff',
                            borderRadius: '4px',
                            border: '1px solid #e2e8f0',
                            fontSize: '12px'
                          }}
                        >
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <IconFile className="erp-action-icon" /> {adj.nombreOriginal || adj.nombre}
                          </span>
                          {adj.id && descargarAdjunto && (
                            <button
                              type="button"
                              className="erp-action-btn erp-action-info"
                              onClick={() => descargarAdjunto(adj)}
                              title="Descargar"
                              style={{ 
                                padding: '2px 6px', 
                                fontSize: '11px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <IconDownload className="erp-action-icon" style={{ width: 14, height: 14 }} /> Descargar
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Historial de transformaciones */}
        <HistorialTransformaciones
          historial={historialTransformaciones}
          tipoDocumento={tipoDocumento}
          idDocumento={docActual.id}
          cargando={cargandoHistorial}
          abrirDocumento={async (tipo, id, numero) => {
            const tipoMap = {
              'ALBARAN': 'albaran-ver',
              'FACTURA': 'factura-ver',
              'FACTURA_PROFORMA': 'factura-proforma-ver',
              'FACTURA_RECTIFICATIVA': 'factura-rectificativa-ver',
              'PEDIDO': 'pedido-ver',
              'PRESUPUESTO': 'presupuesto-ver'
            };
            const tipoLabel = {
              'ALBARAN': 'Albarán',
              'FACTURA': 'Factura',
              'FACTURA_PROFORMA': 'Factura Proforma',
              'FACTURA_RECTIFICATIVA': 'Factura Rectificativa',
              'PEDIDO': 'Pedido',
              'PRESUPUESTO': 'Presupuesto'
            };
            const tipoPestana = tipoMap[tipo];
            if (tipoPestana && window.abrirPestana) {
              const titulo = numero ? `${tipoLabel[tipo]} ${numero}` : null;
              window.abrirPestana(tipoPestana, id, titulo);
            }
          }}
        />

      </div>
    </div>
  );
}
