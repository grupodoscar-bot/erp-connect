import React, { useState, useEffect, useMemo } from 'react';
import API_ENDPOINTS from '../../config/api';
import { HistorialTransformaciones } from '../ventas/HistorialTransformaciones';
import { IconEdit, IconPdf, IconTransform, IconEmail } from '../iconos';

const normalizarPresupuesto = (presupuesto) => {
  if (!presupuesto) return null;

  const compraMultialmacen = presupuesto.compraMultialmacen ?? presupuesto.ventaMultialmacen ?? false;

  return {
    ...presupuesto,
    compraMultialmacen,
    ventaMultialmacen: compraMultialmacen,
    lineas: Array.isArray(presupuesto.lineas) ? presupuesto.lineas : [],
    tarifa: presupuesto.tarifa || (presupuesto.tarifaId ? { id: presupuesto.tarifaId, nombre: `Tarifa ${presupuesto.tarifaId}` } : null),
    almacen: presupuesto.almacen || (presupuesto.almacenId ? { id: presupuesto.almacenId, nombre: `Almacén ${presupuesto.almacenId}` } : null),
    tarifaId: presupuesto.tarifaId ?? presupuesto.tarifa?.id ?? null,
    almacenId: presupuesto.almacenId ?? presupuesto.almacen?.id ?? null,
  };
};

const obtenerValor = (presupuesto, campos = []) => {
  for (const campo of campos) {
    if (campo === undefined) continue;
    const partes = campo.split('.');
    let valor = presupuesto;
    for (const parte of partes) {
      valor = valor?.[parte];
      if (valor === undefined || valor === null) break;
    }
    if (valor !== undefined && valor !== null && valor !== '') {
      return valor;
    }
  }
  return null;
};

const obtenerNombreSerie = (presupuesto) => {
  return obtenerValor(presupuesto, [
    'serie.prefijo',
    'serie.nombre',
    'serieNombre'
  ]) || 'Sin serie';
};

const obtenerNombreTarifa = (presupuesto) => {
  return (
    obtenerValor(presupuesto, ['tarifa.nombre', 'tarifaNombre']) ||
    (presupuesto?.tarifaId ? `Tarifa ${presupuesto.tarifaId}` : '—')
  );
};

const obtenerNombreAlmacen = (presupuesto) => {
  return (
    obtenerValor(presupuesto, ['almacen.nombre', 'almacenNombre']) ||
    (presupuesto?.almacenId ? `Almacén ${presupuesto.almacenId}` : '—')
  );
};

// Componente de ficha (vista de solo lectura) para presupuesto de compra
export function FichaPresupuestoCompra({ 
  presupuestosCompra = [],
  presupuestoId, 
  abrirEditarPresupuesto, 
  generarPdf,
  abrirModalTransformar,
  abrirModalEmail,
  estadoOptions = [],
  modoVisual = "claro",
  descargarAdjunto,
  cargarHistorialTransformaciones,
}) {
  const [presupuesto, setPresupuesto] = useState(null);
  const [cargandoPresupuesto, setCargandoPresupuesto] = useState(false);
  const presupuestoData = useMemo(() => normalizarPresupuesto(presupuesto), [presupuesto]);
  const proveedor = presupuestoData?.proveedor;
  const agrupacionProveedor = proveedor?.agrupacion;
  
  const [direccionesProveedor, setDireccionesProveedor] = useState([]);
  
  const [historialTransformaciones, setHistorialTransformaciones] = useState([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);

  // Prefill con datos ya cargados en memoria
  useEffect(() => {
    if (!presupuestoId) return;
    const presupuestoEnLista = presupuestosCompra.find((p) => p.id === presupuestoId);
    if (presupuestoEnLista) {
      setPresupuesto(normalizarPresupuesto(presupuestoEnLista));
    }
  }, [presupuestoId, presupuestosCompra]);

  // Cargar siempre el presupuesto completo desde backend
  useEffect(() => {
    if (!presupuestoId) return;
    let cancelado = false;

    const cargarPresupuesto = async () => {
      setCargandoPresupuesto(true);
      try {
        const response = await fetch(`${API_ENDPOINTS.presupuestosCompra || API_ENDPOINTS.pedidosCompra.replace('/pedidos-compra', '/presupuestos-compra')}/${presupuestoId}`);
        if (response.ok) {
          const data = await response.json();
          if (!cancelado) {
            setPresupuesto(normalizarPresupuesto(data));
          }
        }
      } catch (error) {
        if (!cancelado) {
          console.error('Error al cargar presupuesto de compra:', error);
        }
      } finally {
        if (!cancelado) {
          setCargandoPresupuesto(false);
        }
      }
    };

    cargarPresupuesto();
    return () => {
      cancelado = true;
    };
  }, [presupuestoId]);
  
  useEffect(() => {
    if (!proveedor?.id) {
      setDireccionesProveedor([]);
      return;
    }

    const obtenerDirecciones = async () => {
      try {
        const response = await fetch(`${API_ENDPOINTS.proveedores}/${proveedor.id}/direcciones`);
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
          setDireccionesProveedor(direccionesFormateadas);
        } else {
          setDireccionesProveedor([]);
        }
      } catch (error) {
        console.error('Error al obtener direcciones:', error);
        setDireccionesProveedor([]);
      }
    };

    obtenerDirecciones();
  }, [proveedor?.id]);

  // Cargar historial de transformaciones
  useEffect(() => {
    if (!presupuestoData?.id || !cargarHistorialTransformaciones) return;

    const cargarHistorial = async () => {
      setCargandoHistorial(true);
      try {
        const historial = await cargarHistorialTransformaciones('PRESUPUESTO_COMPRA', presupuestoData.id);
        setHistorialTransformaciones(historial || []);
      } catch (error) {
        console.error('Error al cargar historial:', error);
        setHistorialTransformaciones([]);
      } finally {
        setCargandoHistorial(false);
      }
    };

    cargarHistorial();
  }, [presupuestoData?.id, cargarHistorialTransformaciones]);

  if (cargandoPresupuesto && !presupuestoData) {
    return <div className="erp-empty-state">Cargando presupuesto de compra...</div>;
  }
  if (!presupuestoData) return <div className="erp-empty-state">Presupuesto de compra no encontrado</div>;
  
  // Calcular totales desde las líneas
  const calcularTotales = () => {
    let subtotal = 0;
    let descuentoTotal = 0;
    let totalIva = 0;
    let totalRecargo = 0;
    const desglosePorIva = {};

    (presupuestoData.lineas || []).forEach(linea => {
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
      const descuentoAgrupacionPct = presupuestoData.descuentoAgrupacion || 0;
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
    const descuentoAgrupacionPct = presupuestoData.descuentoAgrupacion || 0;
    const descuentoAgrupacionImporte = totalTrasDescuentosLinea * (descuentoAgrupacionPct / 100);
    const baseTrasAgrupacion = totalTrasDescuentosLinea - descuentoAgrupacionImporte;
    const total = baseTrasAgrupacion + totalIva + totalRecargo;

    const desgloseIvaArray = Object.values(desglosePorIva)
      .filter(d => d.baseImponible > 0)
      .sort((a, b) => a.porcentajeIva - b.porcentajeIva);

    return { subtotal, descuentoTotal, descuentoAgrupacionPct, descuentoAgrupacionImporte, totalIva, totalRecargo, baseTrasAgrupacion, total, desgloseIva: desgloseIvaArray };
  };

  const totales = calcularTotales();

  const formatearSoloFecha = (fecha) => {
    if (!fecha) return '';
    const d = new Date(fecha);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

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

  const getLineaEstadoStyle = (estado) => {
    const base = getColorEstado(estado);
    if (!base || base === "transparent") return {};
    const alpha = modoVisual === "oscuro" ? 0.28 : 0.18;
    return {
      backgroundColor: aplicarAlphaColorFicha(base, alpha),
      borderLeft: `4px solid ${base}`,
    };
  };

  return (
    <div className="erp-form-view">
      {/* Botones de acción arriba */}
      <div className="erp-form-actions" style={{ marginBottom: '16px', paddingTop: 0 }}>
        <button type="button" className="erp-btn erp-btn-primary" onClick={() => abrirEditarPresupuesto(presupuestoData)}>
          <IconEdit className="erp-action-icon" /> Editar
        </button>
        {generarPdf && (
          <button type="button" className="erp-btn erp-btn-info" onClick={() => generarPdf(presupuestoData.id)}>
            <IconPdf className="erp-action-icon" /> PDF
          </button>
        )}
        {abrirModalTransformar && (
          <button type="button" className="erp-btn erp-btn-secondary" onClick={() => abrirModalTransformar(presupuestoData)}>
            <IconTransform className="erp-action-icon" /> Transformar
          </button>
        )}
        {abrirModalEmail && (
          <button type="button" className="erp-btn erp-btn-secondary" onClick={() => abrirModalEmail(presupuestoData)}>
            <IconEmail className="erp-action-icon" /> Email
          </button>
        )}
      </div>

      <div className="erp-form-content">
        <div className="erp-form-section">
          <div className="erp-form-group">
            <h4 className="erp-form-group-title">Datos del presupuesto de compra</h4>
            <div className="erp-form-row erp-form-row-4">
              <label className="erp-field">
                <span className="erp-field-label">Número</span>
                <input type="text" className="erp-input-mono" value={presupuestoData.numero || ''} disabled />
              </label>
              <label className="erp-field">
                <span className="erp-field-label">Fecha</span>
                <input type="date" className="erp-input-mono" value={formatearSoloFecha(presupuestoData.fecha) || ''} disabled />
              </label>
              <label className="erp-field">
                <span className="erp-field-label">Proveedor</span>
                <input type="text" value={presupuestoData.proveedorNombreComercial || proveedor?.nombreComercial || 'Sin proveedor'} disabled />
              </label>
              <label className="erp-field">
                <span className="erp-field-label">Estado</span>
                <input
                  type="text"
                  className="erp-input"
                  value={presupuestoData.estado || ''}
                  disabled
                  style={{
                    textTransform: 'uppercase',
                    color: modoVisual === "oscuro" ? "#0f172a" : "#1f2937",
                    fontWeight: 600,
                    ...getLineaEstadoStyle(presupuestoData.estado)
                  }}
                />
              </label>
            </div>

            {/* Serie, Tarifa, Almacén y Validez */}
            <div className="erp-form-row erp-form-row-4" style={{ marginTop: '12px' }}>
              <label className="erp-field">
                <span className="erp-field-label">Serie</span>
                <input type="text" value={obtenerNombreSerie(presupuestoData)} disabled />
              </label>

              <label className="erp-field">
                <span className="erp-field-label">Tarifa</span>
                <input type="text" value={obtenerNombreTarifa(presupuestoData)} disabled />
              </label>

              {!presupuestoData.ventaMultialmacen ? (
                <label className="erp-field">
                  <span className="erp-field-label">Almacén</span>
                  <input type="text" value={obtenerNombreAlmacen(presupuestoData)} disabled />
                </label>
              ) : (
                <label className="erp-field">
                  <span className="erp-field-label">Compra multialmacén</span>
                  <div style={{ padding: '8px 12px', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '4px', fontSize: '13px', color: '#0369a1' }}>
                    ✓ Almacenes por línea
                  </div>
                </label>
              )}

              <label className="erp-field">
                <span className="erp-field-label">Validez (días)</span>
                <input type="number" value={presupuestoData.validezDias || 30} disabled />
              </label>
            </div>

            {/* Datos del proveedor (snapshot histórico) */}
            {(presupuestoData.proveedorNombreComercial || proveedor) && (
              <div style={{ 
                marginTop: '16px', 
                padding: '12px 16px', 
                backgroundColor: '#f8fafc', 
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                fontSize: '13px'
              }}>
                <div style={{ fontWeight: '600', marginBottom: '8px', color: '#475569' }}>
                  Datos del proveedor (en el momento de creación)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px 24px' }}>
                  <div><span style={{ color: '#64748b' }}>Nombre comercial:</span> <strong>{presupuestoData.proveedorNombreComercial || proveedor?.nombreComercial || '—'}</strong></div>
                  <div><span style={{ color: '#64748b' }}>Razón social:</span> {presupuestoData.proveedorNombreFiscal || proveedor?.nombreFiscal || '—'}</div>
                  <div><span style={{ color: '#64748b' }}>CIF/NIF:</span> <span style={{ fontFamily: 'monospace' }}>{presupuestoData.proveedorNifCif || proveedor?.nifCif || '—'}</span></div>
                  <div><span style={{ color: '#64748b' }}>Email:</span> {presupuestoData.proveedorEmail || proveedor?.email || '—'}</div>
                  <div><span style={{ color: '#64748b' }}>Teléfono:</span> {presupuestoData.proveedorTelefono || proveedor?.telefonoFijo || proveedor?.telefonoMovil || '—'}</div>
                  {agrupacionProveedor && (
                    <div><span style={{ color: '#64748b' }}>Agrupación:</span> <strong>{agrupacionProveedor.nombre}</strong> (Dto. {agrupacionProveedor.descuentoGeneral || 0}%)</div>
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
                    if (presupuestoData.direccionFacturacionDireccion) partes.push(presupuestoData.direccionFacturacionDireccion);
                    if (presupuestoData.direccionFacturacionCodigoPostal) partes.push(presupuestoData.direccionFacturacionCodigoPostal);
                    if (presupuestoData.direccionFacturacionPoblacion) partes.push(presupuestoData.direccionFacturacionPoblacion);
                    if (presupuestoData.direccionFacturacionProvincia) partes.push(presupuestoData.direccionFacturacionProvincia);
                    if (presupuestoData.direccionFacturacionPais && presupuestoData.direccionFacturacionPais !== 'España') partes.push(presupuestoData.direccionFacturacionPais);
                    if (partes.length > 0) return partes.join(', ');
                    
                    if (direccionesProveedor.length > 0) {
                      const dirFacturacion = direccionesProveedor[0];
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
                    if (presupuestoData.direccionEnvioDireccion) partes.push(presupuestoData.direccionEnvioDireccion);
                    if (presupuestoData.direccionEnvioCodigoPostal) partes.push(presupuestoData.direccionEnvioCodigoPostal);
                    if (presupuestoData.direccionEnvioPoblacion) partes.push(presupuestoData.direccionEnvioPoblacion);
                    if (presupuestoData.direccionEnvioProvincia) partes.push(presupuestoData.direccionEnvioProvincia);
                    if (presupuestoData.direccionEnvioPais && presupuestoData.direccionEnvioPais !== 'España') partes.push(presupuestoData.direccionEnvioPais);
                    if (partes.length > 0) return partes.join(', ');
                    
                    if (presupuestoData.direccion) {
                      const dir = presupuestoData.direccion;
                      const partesFallback = [];
                      if (dir.direccion) partesFallback.push(dir.direccion);
                      if (dir.codigoPostal) partesFallback.push(dir.codigoPostal);
                      if (dir.poblacion) partesFallback.push(dir.poblacion);
                      if (dir.provincia) partesFallback.push(dir.provincia);
                      if (dir.pais && dir.pais !== 'España') partesFallback.push(dir.pais);
                      return partesFallback.join(', ') || '—';
                    }
                    return direccionesProveedor.length > 0 ? 'Misma que facturación' : '—';
                  })()}
                </div>
              </div>
            </div>

          </div>

          <div className="erp-form-group">
            <h4 className="erp-form-group-title" style={{ marginBottom: '12px' }}>Líneas de productos</h4>

            <table className="erp-table erp-table-compact">
              <thead>
                <tr>
                  <th style={{ width: presupuestoData.ventaMultialmacen ? '7%' : '8%' }}>Referencia</th>
                  <th style={{ width: presupuestoData.ventaMultialmacen ? '22%' : '30%' }}>Producto</th>
                  {presupuestoData.ventaMultialmacen && (
                    <th style={{ width: '13%' }}>Almacén</th>
                  )}
                  <th style={{ width: '7%', textAlign: 'center' }}>Cant.</th>
                  <th style={{ width: presupuestoData.ventaMultialmacen ? '11%' : '14%', textAlign: 'center' }}>Precio</th>
                  <th style={{ width: '7%', textAlign: 'center' }}>Dto. %</th>
                  <th style={{ width: '7%', textAlign: 'center' }}>IVA %</th>
                  <th style={{ width: '7%', textAlign: 'center' }}>Rec. %</th>
                  <th style={{ width: presupuestoData.ventaMultialmacen ? '11%' : '18%', textAlign: 'center' }}>Base</th>
                  <th style={{ width: '4%' }}></th>
                </tr>
              </thead>
              <tbody>
                {(presupuestoData.lineas || []).map((linea, index) => (
                  <tr key={index}>
                    <td className="erp-td-mono">{linea.producto?.referencia || '—'}</td>
                    <td>{linea.nombreProducto || linea.producto?.titulo || '—'}</td>
                    {presupuestoData.ventaMultialmacen && (
                      <td style={{ fontSize: '12px' }}>{linea.almacen?.nombre || '—'}</td>
                    )}
                    <td className="erp-td-mono" style={{ textAlign: 'center' }}>{(linea.cantidad || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
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
                {(!presupuestoData.lineas || presupuestoData.lineas.length === 0) && (
                  <tr>
                    <td colSpan={presupuestoData.ventaMultialmacen ? 10 : 9} className="erp-td-empty">
                      No hay líneas en este presupuesto
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Totales */}
          <div className="erp-form-group">
            <div style={{ display: 'flex', gap: '24px', marginTop: '16px', justifyContent: 'flex-end' }}>
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
                      : 'Total IVA:'}
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

          {/* Observaciones y notas internas */}
          <div className="erp-form-group">
            <div className="erp-form-row erp-form-row-2">
              <label className="erp-field">
                <span className="erp-field-label">Observaciones</span>
                <textarea
                  rows="3"
                  value={presupuestoData.observaciones || ''}
                  disabled
                  placeholder="—"
                />
              </label>

              <label className="erp-field">
                <span className="erp-field-label">Notas internas (no se imprimen)</span>
                <textarea
                  rows="3"
                  value={presupuestoData.notas || ''}
                  disabled
                  placeholder="—"
                  style={{ backgroundColor: '#fff7ed' }}
                />
              </label>
            </div>
          </div>

          {/* Adjuntos */}
          {presupuestoData.adjuntos && presupuestoData.adjuntos.length > 0 && (
            <div className="erp-form-group">
              <h4 className="erp-form-group-title">Adjuntos</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {presupuestoData.adjuntos.map((adj, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="erp-btn erp-btn-secondary erp-btn-sm"
                    onClick={() => descargarAdjunto && descargarAdjunto(adj.id, adj.nombre || adj.nombreArchivo)}
                  >
                    📎 {adj.nombre || adj.nombreArchivo || 'Archivo sin nombre'}
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Historial de transformaciones */}
        <HistorialTransformaciones
          historial={historialTransformaciones}
          tipoDocumento="PRESUPUESTO_COMPRA"
          idDocumento={presupuestoData.id}
          cargando={cargandoHistorial}
          abrirDocumento={async (tipo, id, numero) => {
            const tipoMap = {
              'PRESUPUESTO_COMPRA': 'presupuesto-compra-ver',
              'PEDIDO_COMPRA': 'pedido-compra-ver',
              'ALBARAN_COMPRA': 'albaran-compra-ver',
              'FACTURA_COMPRA': 'factura-compra-ver',
            };
            const tipoLabel = {
              'PRESUPUESTO_COMPRA': 'Presupuesto de Compra',
              'PEDIDO_COMPRA': 'Pedido de Compra',
              'ALBARAN_COMPRA': 'Albarán de Compra',
              'FACTURA_COMPRA': 'Factura de Compra',
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
