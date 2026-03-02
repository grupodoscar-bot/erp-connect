import React from "react";
import { IconEye, IconEdit, IconDelete } from "../iconos";
import { ReferenciasProducto } from "./ReferenciasProducto";
import { CodigosBarrasProducto } from "./CodigosBarrasProducto";

export function ListaProductos({
  productos,
  abrirNuevoProducto,
  abrirVerProducto,
  abrirEditarProducto,
  borrarProducto,
}) {
  return (
    <div className="erp-list-view">
      <div className="erp-list-toolbar">
        <button className="erp-btn erp-btn-primary" onClick={abrirNuevoProducto}>
          + Nuevo Producto
        </button>
        <div className="erp-search">
          <input type="text" placeholder="Buscar producto..." />
        </div>
      </div>

      <table className="erp-table">
        <thead>
          <tr>
            <th>Ref.</th>
            <th>Título</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Familias</th>
            <th>Subfamilias</th>
            <th className="erp-th-actions">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((p) => {
            const referenciasAlternativas = (p.referencias || []).filter(r => !r.esPrincipal);
            const tieneReferenciasAlt = referenciasAlternativas.length > 0;
            const tooltipRefs = referenciasAlternativas.map(r => r.referencia).join('\n');
            
            const codigosBarras = p.codigosBarras || [];
            const tieneCodigosBarras = codigosBarras.length > 0;
            const tooltipCodigos = codigosBarras.map(c => `${c.valor} (${c.codigoBarraTipoNombre})`).join('\n');
            
            return (
              <tr key={p.id} onDoubleClick={() => abrirVerProducto(p)}>
                <td className="erp-td-mono">
                  <span 
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    title={tieneReferenciasAlt ? `Referencias alternativas:\n${tooltipRefs}` : ''}
                  >
                    {p.referencia}
                    {tieneReferenciasAlt && (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: '20px',
                        height: '20px',
                        padding: '0 6px',
                        backgroundColor: '#64748b',
                        color: 'white',
                        borderRadius: '10px',
                        fontSize: '11px',
                        fontWeight: '600'
                      }}>
                        +{referenciasAlternativas.length}
                      </span>
                    )}
                    {tieneCodigosBarras && (
                      <span 
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minWidth: '20px',
                          height: '20px',
                          padding: '0 6px',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          borderRadius: '10px',
                          fontSize: '11px',
                          fontWeight: '600'
                        }}
                        title={`Códigos de barras:\n${tooltipCodigos}`}
                      >
                        📊{codigosBarras.length}
                      </span>
                    )}
                  </span>
                </td>
                <td className="erp-td-main">{p.titulo}</td>
                <td className="erp-td-mono erp-td-right">{p.precio?.toFixed(2)} €</td>
                <td className="erp-td-mono erp-td-right">{p.stock}</td>
                <td>{p.familias?.map(f => f.nombre).join(", ") || "—"}</td>
                <td>{p.subfamilias?.map(sf => sf.nombre).join(", ") || "—"}</td>
                <td className="erp-td-actions">
                  <button className="erp-action-btn" onClick={() => abrirVerProducto(p)} title="Ver">
                    <IconEye className="erp-action-icon" />
                  </button>
                  <button className="erp-action-btn" onClick={() => abrirEditarProducto(p)} title="Editar">
                    <IconEdit className="erp-action-icon" />
                  </button>
                  <button className="erp-action-btn erp-action-danger" onClick={() => borrarProducto(p.id)} title="Eliminar">
                    <IconDelete className="erp-action-icon" />
                  </button>
                </td>
              </tr>
            );
          })}
          {productos.length === 0 && (
            <tr><td colSpan="7" className="erp-td-empty">No hay productos</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export function FormularioProducto({
  formProducto,
  seccionFormActiva,
  setSeccionFormActiva,
  familias,
  subfamilias,
  fabricantes,
  tiposIva,
  almacenes,
  updateFormProductoField,
  guardarProducto,
  cerrarPestana,
  pestanaActiva,
  tipoImpuestoOptions,
  unidadMedidaOptions,
  tarifas = [],
  preciosPorTarifa = [],
  actualizarPrecioTarifa,
  permitirMultitarifa = false,
}) {
  const handleFamiliaChange = (familiaId, checked) => {
    if (checked) {
      updateFormProductoField("familiaIds", [...formProducto.familiaIds, familiaId.toString()]);
    } else {
      updateFormProductoField("familiaIds", formProducto.familiaIds.filter(id => id !== familiaId.toString()));
      // También quitar subfamilias de esa familia
      const subfamiliasDeEstaFamilia = subfamilias.filter(sf => sf.familia?.id === familiaId);
      const nuevasSubfamiliaIds = formProducto.subfamiliaIds.filter(
        sfId => !subfamiliasDeEstaFamilia.some(sf => sf.id.toString() === sfId)
      );
      updateFormProductoField("subfamiliaIds", nuevasSubfamiliaIds);
    }
  };

  const handleSubfamiliaChange = (subfamiliaId, checked) => {
    if (checked) {
      updateFormProductoField("subfamiliaIds", [...formProducto.subfamiliaIds, subfamiliaId.toString()]);
    } else {
      updateFormProductoField("subfamiliaIds", formProducto.subfamiliaIds.filter(id => id !== subfamiliaId.toString()));
    }
  };

  return (
    <div className="erp-form-view">
      <form onSubmit={guardarProducto}>
        <div className="erp-form-tabs">
          {["general", "distribucion", "precios"].map(sec => (
            <button
              key={sec}
              type="button"
              className={`erp-form-tab ${seccionFormActiva === sec ? "active" : ""}`}
              onClick={() => setSeccionFormActiva(sec)}
            >
              {sec === "general" && "Información General"}
              {sec === "distribucion" && "Distribución"}
              {sec === "precios" && "Descuentos y Precios"}
            </button>
          ))}
        </div>

        <div className="erp-form-content">
          {seccionFormActiva === "general" && (
            <div className="erp-form-section">
              <div className="erp-form-group">
                <h4 className="erp-form-group-title">Identificación</h4>
                <div className="erp-form-row">
                  <label className="erp-field">
                    <span className="erp-field-label">Referencia *</span>
                    <input
                      type="text"
                      maxLength={15}
                      className="erp-input-mono"
                      value={formProducto.referencia}
                      onChange={(e) => updateFormProductoField("referencia", e.target.value)}
                      required
                    />
                  </label>
                  <label className="erp-field">
                    <span className="erp-field-label">Título *</span>
                    <input
                      type="text"
                      maxLength={60}
                      value={formProducto.titulo}
                      onChange={(e) => updateFormProductoField("titulo", e.target.value)}
                      required
                    />
                  </label>
                </div>
                <div className="erp-form-row">
                  <label className="erp-field erp-field-full">
                    <span className="erp-field-label">Nombre interno</span>
                    <input
                      type="text"
                      value={formProducto.nombre}
                      onChange={(e) => updateFormProductoField("nombre", e.target.value)}
                      required
                    />
                  </label>
                </div>
              </div>

              <div className="erp-form-group">
                <h4 className="erp-form-group-title">Imagen del producto</h4>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  {(formProducto.imagen || formProducto.imagenFile) && (
                    <div style={{ 
                      width: '150px', 
                      height: '150px', 
                      border: '2px solid var(--erp-border)', 
                      borderRadius: '8px',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'var(--erp-bg-section)'
                    }}>
                      <img 
                        src={formProducto.imagenFile 
                          ? URL.createObjectURL(formProducto.imagenFile)
                          : `http://145.223.103.219:8080/productos/${formProducto.id}/imagen`
                        }
                        alt="Producto"
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                      />
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <label className="erp-field">
                      <span className="erp-field-label">Seleccionar imagen</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            updateFormProductoField("imagenFile", file);
                          }
                        }}
                      />
                    </label>
                    {(formProducto.imagen || formProducto.imagenFile) && (
                      <button
                        type="button"
                        className="erp-btn erp-btn-secondary"
                        style={{ marginTop: '8px' }}
                        onClick={() => {
                          updateFormProductoField("imagenFile", null);
                          updateFormProductoField("imagen", null);
                        }}
                      >
                        Eliminar imagen
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="erp-form-group">
                <h4 className="erp-form-group-title">Familias y Subfamilias</h4>
                <div style={{ 
                  maxHeight: '250px', 
                  overflowY: 'auto', 
                  border: '1px solid var(--erp-border)', 
                  borderRadius: '4px', 
                  padding: '12px',
                  backgroundColor: 'var(--erp-bg-section)'
                }}>
                  {familias.length === 0 ? (
                    <p style={{ margin: 0, color: 'var(--erp-text-muted)' }}>No hay familias disponibles</p>
                  ) : (
                    familias.map((familia) => {
                      const isFamiliaSelected = formProducto.familiaIds.includes(familia.id.toString());
                      const familiaSubfamilias = subfamilias.filter(sf => sf.familia?.id === familia.id);
                      
                      return (
                        <div key={familia.id} style={{ marginBottom: '12px' }}>
                          <label className="erp-checkbox" style={{ fontWeight: 600 }}>
                            <input
                              type="checkbox"
                              checked={isFamiliaSelected}
                              onChange={(e) => handleFamiliaChange(familia.id, e.target.checked)}
                            />
                            <span>{familia.nombre}</span>
                          </label>
                          
                          {isFamiliaSelected && familiaSubfamilias.length > 0 && (
                            <div style={{ 
                              marginLeft: '24px', 
                              marginTop: '8px',
                              paddingLeft: '12px',
                              borderLeft: '2px solid var(--erp-border)'
                            }}>
                              {familiaSubfamilias.map((subfamilia) => (
                                <label key={subfamilia.id} className="erp-checkbox" style={{ marginBottom: '4px' }}>
                                  <input
                                    type="checkbox"
                                    checked={formProducto.subfamiliaIds.includes(subfamilia.id.toString())}
                                    onChange={(e) => handleSubfamiliaChange(subfamilia.id, e.target.checked)}
                                  />
                                  <span style={{ color: 'var(--erp-text-secondary)' }}>{subfamilia.nombre}</span>
                                </label>
                              ))}
                            </div>
                          )}
                          
                          {isFamiliaSelected && familiaSubfamilias.length === 0 && (
                            <div style={{ 
                              marginLeft: '24px', 
                              marginTop: '4px',
                              fontSize: '12px',
                              color: 'var(--erp-text-muted)',
                              fontStyle: 'italic'
                            }}>
                              Sin subfamilias
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="erp-form-group">
                <h4 className="erp-form-group-title">Etiquetas y Descripción</h4>
                <label className="erp-field erp-field-full">
                  <span className="erp-field-label">Etiquetas</span>
                  <input
                    type="text"
                    placeholder="tag1, tag2..."
                    value={formProducto.etiquetas}
                    onChange={(e) => updateFormProductoField("etiquetas", e.target.value)}
                  />
                </label>
                <label className="erp-field erp-field-full">
                  <span className="erp-field-label">Descripción corta</span>
                  <textarea
                    rows="2"
                    maxLength={160}
                    value={formProducto.descripcionCorta}
                    onChange={(e) => updateFormProductoField("descripcionCorta", e.target.value)}
                  />
                </label>
                <label className="erp-field erp-field-full">
                  <span className="erp-field-label">Notas</span>
                  <textarea
                    rows="3"
                    value={formProducto.notas}
                    onChange={(e) => updateFormProductoField("notas", e.target.value)}
                  />
                </label>
              </div>

              <ReferenciasProducto
                productoId={formProducto.id}
                referencias={formProducto.referencias || []}
                onReferenciasChange={(nuevasReferencias) => {
                  updateFormProductoField("referencias", nuevasReferencias);
                }}
              />

              <CodigosBarrasProducto
                productoId={formProducto.id}
              />
            </div>
          )}

          {seccionFormActiva === "distribucion" && (
            <div className="erp-form-section">
              <div className="erp-form-group">
                <h4 className="erp-form-group-title">Fabricante y Peso</h4>
                <div className="erp-form-row erp-form-row-3">
                  <label className="erp-field">
                    <span className="erp-field-label">Fabricante</span>
                    <select
                      value={formProducto.fabricanteId}
                      onChange={(e) => updateFormProductoField("fabricanteId", e.target.value)}
                    >
                      <option value="">Sin fabricante</option>
                      {fabricantes.map((f) => {
                        const nombreVisible = f.nombreComercial || f.nombreFiscal || `Fabricante #${f.id}`;
                        return (
                          <option key={f.id} value={f.id}>
                            {nombreVisible}
                          </option>
                        );
                      })}
                    </select>
                  </label>
                  <label className="erp-field">
                    <span className="erp-field-label">Almacén predeterminado</span>
                    <select
                      value={formProducto.almacenPredeterminadoId || ""}
                      onChange={(e) => updateFormProductoField("almacenPredeterminadoId", e.target.value)}
                    >
                      <option value="">Sin almacén predeterminado</option>
                      {almacenes.filter(a => a.activo).map((alm) => (
                        <option key={alm.id} value={alm.id}>
                          {alm.nombre}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="erp-field">
                    <span className="erp-field-label">Peso (kg)</span>
                    <input
                      type="number"
                      step="0.01"
                      className="erp-input-mono"
                      value={formProducto.peso}
                      onChange={(e) => updateFormProductoField("peso", e.target.value)}
                    />
                  </label>
                </div>
              </div>

              <div className="erp-form-group">
                <h4 className="erp-form-group-title">Unidades de Medida</h4>
                <div className="erp-form-row erp-form-row-3">
                  <label className="erp-field">
                    <span className="erp-field-label">Unidad de medida</span>
                    <select
                      value={formProducto.unidadMedida}
                      onChange={(e) => updateFormProductoField("unidadMedida", e.target.value)}
                    >
                      {unidadMedidaOptions.map((op) => (
                        <option key={op} value={op}>{op}</option>
                      ))}
                    </select>
                  </label>
                  <label className="erp-field">
                    <span className="erp-field-label">Unidad medida referencia</span>
                    <input
                      type="text"
                      value={formProducto.unidadMedidaReferencia}
                      onChange={(e) => updateFormProductoField("unidadMedidaReferencia", e.target.value)}
                    />
                  </label>
                  <label className="erp-field">
                    <span className="erp-field-label">Magnitud por unidad</span>
                    <input
                      type="text"
                      value={formProducto.magnitudPorUnidad}
                      onChange={(e) => updateFormProductoField("magnitudPorUnidad", e.target.value)}
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {seccionFormActiva === "precios" && (
            <div className="erp-form-section">
              <div className="erp-form-group">
                <h4 className="erp-form-group-title">Costes y Descuentos</h4>
                <div className="erp-form-row erp-form-row-2">
                  <label className="erp-field">
                    <span className="erp-field-label">Descuento (%)</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      className="erp-input-mono"
                      value={formProducto.descuento}
                      onChange={(e) => {
                        const rawValue = e.target.value;
                        if (rawValue === "") {
                          updateFormProductoField("descuento", "");
                        } else {
                          const numValue = parseFloat(rawValue);
                          if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
                            updateFormProductoField("descuento", numValue);
                          }
                        }
                      }}
                    />
                  </label>
                  <label className="erp-field">
                    <span className="erp-field-label">Tipo de IVA *</span>
                    <select
                      value={formProducto.tipoIvaId?.toString() || ""}
                      onChange={(e) => updateFormProductoField("tipoIvaId", e.target.value)}
                      required
                    >
                      <option value="">Selecciona un tipo</option>
                      {(tiposIva || []).map((tipo) => (
                        <option key={tipo.id} value={tipo.id.toString()}>
                          {tipo.nombre} ({tipo.porcentajeIva}% / recargo {tipo.porcentajeRecargo}%)
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>

              <div className="erp-form-group">
                <label className="erp-checkbox">
                  <input
                    type="checkbox"
                    checked={formProducto.precioBloqueado}
                    onChange={(e) => updateFormProductoField("precioBloqueado", e.target.checked)}
                  />
                  <span>Precio bloqueado</span>
                </label>
              </div>

              {(!permitirMultitarifa || !tarifas || tarifas.length === 0) && (
                <div className="erp-form-group">
                  <h4 className="erp-form-group-title">Precios</h4>
                  <div className="erp-form-row erp-form-row-3">
                    <label className="erp-field">
                      <span className="erp-field-label">Margen (%)</span>
                      <input
                        type="number"
                        step="0.01"
                        className="erp-input-mono"
                        value={formProducto.margen}
                        onChange={(e) => updateFormProductoField("margen", e.target.value)}
                      />
                    </label>
                    <label className="erp-field">
                      <span className="erp-field-label">Precio base *</span>
                      <input
                        type="number"
                        step="0.01"
                        className="erp-input-mono"
                        value={formProducto.precio}
                        onChange={(e) => updateFormProductoField("precio", e.target.value)}
                        required
                      />
                    </label>
                    <label className="erp-field">
                      <span className="erp-field-label">Precio + Imp.</span>
                      <input
                        type="number"
                        step="0.01"
                        className="erp-input-mono"
                        value={formProducto.precioConImpuestos}
                        onChange={(e) => updateFormProductoField("precioConImpuestos", e.target.value)}
                      />
                    </label>
                  </div>
                </div>
              )}

              <div className="erp-form-group">
                <h4 className="erp-form-group-title">Stock</h4>
                {almacenes && almacenes.length > 0 ? (
                  <div>
                    <p style={{ marginBottom: '12px', color: 'var(--erp-text-secondary)', fontSize: '14px' }}>
                      Gestión de stock por almacén
                    </p>
                    {almacenes.map((almacen) => {
                      const stockAlmacen = formProducto.stockPorAlmacen?.find(sa => sa.almacenId === almacen.id) || {
                        almacenId: almacen.id,
                        almacenNombre: almacen.nombre,
                        stock: 0,
                        stockMinimo: 0,
                        stockMaximo: null,
                        ubicacion: ""
                      };
                      
                      return (
                        <div key={almacen.id} style={{ 
                          marginBottom: '16px', 
                          padding: '12px', 
                          border: '1px solid var(--erp-border)', 
                          borderRadius: '4px',
                          backgroundColor: 'var(--erp-bg-section)'
                        }}>
                          <h5 style={{ marginBottom: '8px', fontWeight: 600 }}>{almacen.nombre}</h5>
                          <div className="erp-form-row erp-form-row-3">
                            <label className="erp-field">
                              <span className="erp-field-label">Stock</span>
                              <input
                                type="number"
                                className="erp-input-mono"
                                value={stockAlmacen.stock}
                                onChange={(e) => {
                                  const newStockPorAlmacen = formProducto.stockPorAlmacen?.filter(sa => sa.almacenId !== almacen.id) || [];
                                  newStockPorAlmacen.push({
                                    ...stockAlmacen,
                                    almacenId: almacen.id,
                                    almacenNombre: almacen.nombre,
                                    stock: parseInt(e.target.value, 10) || 0
                                  });
                                  updateFormProductoField("stockPorAlmacen", newStockPorAlmacen);
                                }}
                              />
                            </label>
                            <label className="erp-field">
                              <span className="erp-field-label">Stock Mínimo</span>
                              <input
                                type="number"
                                className="erp-input-mono"
                                value={stockAlmacen.stockMinimo}
                                onChange={(e) => {
                                  const newStockPorAlmacen = formProducto.stockPorAlmacen?.filter(sa => sa.almacenId !== almacen.id) || [];
                                  newStockPorAlmacen.push({
                                    ...stockAlmacen,
                                    almacenId: almacen.id,
                                    almacenNombre: almacen.nombre,
                                    stockMinimo: parseInt(e.target.value, 10) || 0
                                  });
                                  updateFormProductoField("stockPorAlmacen", newStockPorAlmacen);
                                }}
                              />
                            </label>
                            <label className="erp-field">
                              <span className="erp-field-label">Stock Máximo</span>
                              <input
                                type="number"
                                className="erp-input-mono"
                                value={stockAlmacen.stockMaximo ?? ""}
                                onChange={(e) => {
                                  const newStockPorAlmacen = formProducto.stockPorAlmacen?.filter(sa => sa.almacenId !== almacen.id) || [];
                                  newStockPorAlmacen.push({
                                    ...stockAlmacen,
                                    almacenId: almacen.id,
                                    almacenNombre: almacen.nombre,
                                    stockMaximo: e.target.value === "" ? null : (parseInt(e.target.value, 10) || 0)
                                  });
                                  updateFormProductoField("stockPorAlmacen", newStockPorAlmacen);
                                }}
                              />
                            </label>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="erp-empty-state">No hay almacenes disponibles</div>
                )}
              </div>

              {/* Sección de precios por tarifa */}
              {permitirMultitarifa && tarifas && tarifas.length > 0 && (
                <div className="erp-form-group">
                  <h4 className="erp-form-group-title">Precios por Tarifa</h4>
                  <p style={{ marginBottom: '12px', color: 'var(--erp-text-secondary)', fontSize: '14px' }}>
                    Configura precios específicos para cada tarifa. El precio de la tarifa general será el precio base del producto y es obligatorio.
                  </p>
                  {([...tarifas].sort((a, b) => (a.esGeneral === b.esGeneral ? 0 : a.esGeneral ? -1 : 1))).map((tarifa) => {
                    const precioTarifa = preciosPorTarifa.find(pt => pt.tarifaId === tarifa.id) || {
                      tarifaId: tarifa.id,
                      precio: '',
                      descuento: '',
                      margen: ''
                    };
                    
                    return (
                      <div key={tarifa.id} style={{ 
                        marginBottom: '16px', 
                        padding: '12px', 
                        border: '1px solid var(--erp-border)', 
                        borderRadius: '4px',
                        backgroundColor: tarifa.esGeneral ? 'var(--erp-bg-info)' : 'var(--erp-bg-section)'
                      }}>
                        <h5 style={{ 
                          marginBottom: '8px', 
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          {tarifa.nombre}
                          {tarifa.esGeneral && (
                            <span style={{
                              fontSize: '12px',
                              padding: '2px 6px',
                              backgroundColor: 'var(--erp-primary)',
                              color: 'white',
                              borderRadius: '4px'
                            }}>
                              General
                            </span>
                          )}
                          {tarifa.tipoTarifa === 'COMPRA' && (
                            <span style={{
                              fontSize: '12px',
                              padding: '2px 6px',
                              backgroundColor: '#f59e0b',
                              color: 'white',
                              borderRadius: '4px'
                            }}>
                              🛒 Compra
                            </span>
                          )}
                          {tarifa.tipoTarifa === 'AMBAS' && (
                            <span style={{
                              fontSize: '12px',
                              padding: '2px 6px',
                              backgroundColor: '#8b5cf6',
                              color: 'white',
                              borderRadius: '4px'
                            }}>
                              🔄 Venta y Compra
                            </span>
                          )}
                        </h5>
                        {/* Para tarifa General (VENTA o sin tipo), mostrar precios de venta y compra juntos */}
                        {tarifa.esGeneral && (!tarifa.tipoTarifa || tarifa.tipoTarifa === 'VENTA') && (
                          <>
                            <div style={{ 
                              display: 'grid', 
                              gridTemplateColumns: '1fr 1fr', 
                              gap: '24px',
                              marginBottom: '16px',
                              padding: '16px',
                              backgroundColor: '#f9fafb',
                              borderRadius: '8px',
                              border: '1px solid #e5e7eb'
                            }}>
                              {/* Columna de VENTA */}
                              <div>
                                <h6 style={{ marginBottom: '12px', fontSize: '13px', fontWeight: 600, color: '#059669', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  📊 Precios de Venta
                                </h6>
                                <div style={{ marginBottom: '12px' }}>
                                  <label className="erp-field">
                                    <span className="erp-field-label">Tipo de Cálculo</span>
                                    <select
                                      className="erp-input"
                                      value={precioTarifa.tipoCalculoPrecio || 'PRECIO_FIJO'}
                                      onChange={(e) => actualizarPrecioTarifa && actualizarPrecioTarifa(tarifa.id, 'tipoCalculoPrecio', e.target.value)}
                                    >
                                      <option value="PRECIO_FIJO">Precio Fijo</option>
                                      <option value="PORCENTAJE_SOBRE_COSTE">% sobre Coste</option>
                                      <option value="CANTIDAD_SOBRE_COSTE">Cantidad sobre Coste</option>
                                      <option value="PORCENTAJE_SOBRE_PRECIO">% sobre Precio Venta</option>
                                      <option value="CANTIDAD_SOBRE_PRECIO">Cantidad sobre Precio Venta</option>
                                    </select>
                                  </label>
                                  {precioTarifa.tipoCalculoPrecio && precioTarifa.tipoCalculoPrecio !== 'PRECIO_FIJO' && (
                                    <label className="erp-field" style={{ marginTop: '8px' }}>
                                      <span className="erp-field-label">
                                        {precioTarifa.tipoCalculoPrecio?.includes('PORCENTAJE') ? 'Porcentaje (%)' : 'Cantidad (€)'}
                                      </span>
                                      <input
                                        type="number"
                                        step="0.01"
                                        className="erp-input-mono"
                                        value={precioTarifa.valorCalculo || ''}
                                        onChange={(e) => actualizarPrecioTarifa && actualizarPrecioTarifa(tarifa.id, 'valorCalculo', e.target.value)}
                                        placeholder="0"
                                      />
                                    </label>
                                  )}
                                </div>
                                <label className="erp-field" style={{ marginBottom: '8px' }}>
                                  <span className="erp-field-label">Precio Venta *</span>
                                  <input
                                    type="number"
                                    step="0.01"
                                    className="erp-input-mono"
                                    value={precioTarifa.precio}
                                    onChange={(e) => actualizarPrecioTarifa && actualizarPrecioTarifa(tarifa.id, 'precio', e.target.value)}
                                    placeholder="Obligatorio"
                                    required
                                    disabled={precioTarifa.tipoCalculoPrecio && precioTarifa.tipoCalculoPrecio !== 'PRECIO_FIJO'}
                                  />
                                  {precioTarifa.tipoCalculoPrecio && precioTarifa.tipoCalculoPrecio !== 'PRECIO_FIJO' && (
                                    <small style={{ color: '#6b7280', fontSize: '11px' }}>Se calculará automáticamente</small>
                                  )}
                                </label>
                                <label className="erp-field" style={{ marginBottom: '8px' }}>
                                  <span className="erp-field-label">Descuento (%)</span>
                                  <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    className="erp-input-mono"
                                    value={precioTarifa.descuento}
                                    onChange={(e) => actualizarPrecioTarifa && actualizarPrecioTarifa(tarifa.id, 'descuento', e.target.value)}
                                    placeholder="Opcional"
                                  />
                                </label>
                                <label className="erp-field">
                                  <span className="erp-field-label">Margen (%)</span>
                                  <input
                                    type="number"
                                    step="0.01"
                                    className="erp-input-mono"
                                    value={precioTarifa.margen}
                                    onChange={(e) => actualizarPrecioTarifa && actualizarPrecioTarifa(tarifa.id, 'margen', e.target.value)}
                                    placeholder="Opcional"
                                  />
                                </label>
                              </div>

                              {/* Columna de COMPRA */}
                              <div>
                                <h6 style={{ marginBottom: '12px', fontSize: '13px', fontWeight: 600, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  🛒 Precios de Compra
                                </h6>
                                <div style={{ marginBottom: '12px' }}>
                                  <label className="erp-field">
                                    <span className="erp-field-label">Tipo de Cálculo</span>
                                    <select
                                      className="erp-input"
                                      value={precioTarifa.tipoCalculoPrecioCompra || 'PRECIO_FIJO'}
                                      onChange={(e) => actualizarPrecioTarifa && actualizarPrecioTarifa(tarifa.id, 'tipoCalculoPrecioCompra', e.target.value)}
                                    >
                                      <option value="PRECIO_FIJO">Precio Fijo</option>
                                      <option value="PORCENTAJE_SOBRE_COSTE">% sobre Coste</option>
                                      <option value="CANTIDAD_SOBRE_COSTE">Cantidad sobre Coste</option>
                                      <option value="PORCENTAJE_SOBRE_PRECIO">% sobre Precio Venta</option>
                                      <option value="CANTIDAD_SOBRE_PRECIO">Cantidad sobre Precio Venta</option>
                                    </select>
                                  </label>
                                  {precioTarifa.tipoCalculoPrecioCompra && precioTarifa.tipoCalculoPrecioCompra !== 'PRECIO_FIJO' && (
                                    <label className="erp-field" style={{ marginTop: '8px' }}>
                                      <span className="erp-field-label">
                                        {precioTarifa.tipoCalculoPrecioCompra?.includes('PORCENTAJE') ? 'Porcentaje (%)' : 'Cantidad (€)'}
                                      </span>
                                      <input
                                        type="number"
                                        step="0.01"
                                        className="erp-input-mono"
                                        value={precioTarifa.valorCalculoCompra || ''}
                                        onChange={(e) => actualizarPrecioTarifa && actualizarPrecioTarifa(tarifa.id, 'valorCalculoCompra', e.target.value)}
                                        placeholder="0"
                                      />
                                    </label>
                                  )}
                                </div>
                                <label className="erp-field" style={{ marginBottom: '8px' }}>
                                  <span className="erp-field-label">Precio Compra</span>
                                  <input
                                    type="number"
                                    step="0.01"
                                    className="erp-input-mono"
                                    value={precioTarifa.precioCompra || ''}
                                    onChange={(e) => actualizarPrecioTarifa && actualizarPrecioTarifa(tarifa.id, 'precioCompra', e.target.value)}
                                    placeholder="Opcional"
                                    disabled={precioTarifa.tipoCalculoPrecioCompra && precioTarifa.tipoCalculoPrecioCompra !== 'PRECIO_FIJO'}
                                  />
                                  {precioTarifa.tipoCalculoPrecioCompra && precioTarifa.tipoCalculoPrecioCompra !== 'PRECIO_FIJO' && (
                                    <small style={{ color: '#6b7280', fontSize: '11px' }}>Se calculará automáticamente</small>
                                  )}
                                </label>
                                <label className="erp-field">
                                  <span className="erp-field-label">Descuento Compra (%)</span>
                                  <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    className="erp-input-mono"
                                    value={precioTarifa.descuentoCompra || ''}
                                    onChange={(e) => actualizarPrecioTarifa && actualizarPrecioTarifa(tarifa.id, 'descuentoCompra', e.target.value)}
                                    placeholder="Opcional"
                                  />
                                </label>
                              </div>
                            </div>
                          </>
                        )}

                        {/* Para tarifas NO generales con tipo VENTA o AMBAS */}
                        {!tarifa.esGeneral && (tarifa.tipoTarifa === 'VENTA' || tarifa.tipoTarifa === 'AMBAS' || !tarifa.tipoTarifa) && (
                          <>
                            {tarifa.tipoTarifa === 'AMBAS' && (
                              <h6 style={{ marginTop: '8px', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#059669' }}>📊 Precios de Venta</h6>
                            )}
                            <div className="erp-form-row erp-form-row-2" style={{ marginBottom: '12px' }}>
                              <label className="erp-field">
                                <span className="erp-field-label">Tipo de Cálculo (Venta)</span>
                                <select
                                  className="erp-input"
                                  value={precioTarifa.tipoCalculoPrecio || 'PRECIO_FIJO'}
                                  onChange={(e) => actualizarPrecioTarifa && actualizarPrecioTarifa(tarifa.id, 'tipoCalculoPrecio', e.target.value)}
                                >
                                  <option value="PRECIO_FIJO">Precio Fijo</option>
                                  <option value="PORCENTAJE_SOBRE_COSTE">% sobre Coste</option>
                                  <option value="CANTIDAD_SOBRE_COSTE">Cantidad sobre Coste</option>
                                  <option value="PORCENTAJE_SOBRE_PRECIO">% sobre Precio Venta</option>
                                  <option value="CANTIDAD_SOBRE_PRECIO">Cantidad sobre Precio Venta</option>
                                </select>
                              </label>
                              {precioTarifa.tipoCalculoPrecio && precioTarifa.tipoCalculoPrecio !== 'PRECIO_FIJO' && (
                                <label className="erp-field">
                                  <span className="erp-field-label">
                                    {precioTarifa.tipoCalculoPrecio?.includes('PORCENTAJE') ? 'Porcentaje (%)' : 'Cantidad (€)'}
                                  </span>
                                  <input
                                    type="number"
                                    step="0.01"
                                    className="erp-input-mono"
                                    value={precioTarifa.valorCalculo || ''}
                                    onChange={(e) => actualizarPrecioTarifa && actualizarPrecioTarifa(tarifa.id, 'valorCalculo', e.target.value)}
                                    placeholder="0"
                                  />
                                </label>
                              )}
                            </div>
                            <div className="erp-form-row erp-form-row-3">
                              <label className="erp-field">
                                <span className="erp-field-label">Precio Venta</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  className="erp-input-mono"
                                  value={precioTarifa.precio}
                                  onChange={(e) => actualizarPrecioTarifa && actualizarPrecioTarifa(tarifa.id, 'precio', e.target.value)}
                                  placeholder="Usar precio general"
                                  disabled={precioTarifa.tipoCalculoPrecio && precioTarifa.tipoCalculoPrecio !== 'PRECIO_FIJO'}
                                />
                                {precioTarifa.tipoCalculoPrecio && precioTarifa.tipoCalculoPrecio !== 'PRECIO_FIJO' && (
                                  <small style={{ color: '#6b7280', fontSize: '11px' }}>Se calculará automáticamente</small>
                                )}
                              </label>
                              <label className="erp-field">
                                <span className="erp-field-label">Descuento (%)</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  max="100"
                                  className="erp-input-mono"
                                  value={precioTarifa.descuento}
                                  onChange={(e) => actualizarPrecioTarifa && actualizarPrecioTarifa(tarifa.id, 'descuento', e.target.value)}
                                  placeholder="0"
                                />
                              </label>
                              <label className="erp-field">
                                <span className="erp-field-label">Margen (%)</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  className="erp-input-mono"
                                  value={precioTarifa.margen}
                                  onChange={(e) => actualizarPrecioTarifa && actualizarPrecioTarifa(tarifa.id, 'margen', e.target.value)}
                                  placeholder="Usar margen base"
                                />
                              </label>
                            </div>
                          </>
                        )}

                        {/* Precios de COMPRA (si aplica) */}
                        {(tarifa.tipoTarifa === 'COMPRA' || tarifa.tipoTarifa === 'AMBAS') && (
                          <>
                            {tarifa.tipoTarifa === 'AMBAS' && (
                              <h6 style={{ marginTop: '16px', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#f59e0b' }}>🛒 Precios de Compra</h6>
                            )}
                            <div className="erp-form-row erp-form-row-2" style={{ marginBottom: '12px' }}>
                              <label className="erp-field">
                                <span className="erp-field-label">Tipo de Cálculo (Compra)</span>
                                <select
                                  className="erp-input"
                                  value={precioTarifa.tipoCalculoPrecioCompra || 'PRECIO_FIJO'}
                                  onChange={(e) => actualizarPrecioTarifa && actualizarPrecioTarifa(tarifa.id, 'tipoCalculoPrecioCompra', e.target.value)}
                                >
                                  <option value="PRECIO_FIJO">Precio Fijo</option>
                                  <option value="PORCENTAJE_SOBRE_COSTE">% sobre Coste</option>
                                  <option value="CANTIDAD_SOBRE_COSTE">Cantidad sobre Coste</option>
                                  <option value="PORCENTAJE_SOBRE_PRECIO">% sobre Precio Venta</option>
                                  <option value="CANTIDAD_SOBRE_PRECIO">Cantidad sobre Precio Venta</option>
                                </select>
                              </label>
                              {precioTarifa.tipoCalculoPrecioCompra && precioTarifa.tipoCalculoPrecioCompra !== 'PRECIO_FIJO' && (
                                <label className="erp-field">
                                  <span className="erp-field-label">
                                    {precioTarifa.tipoCalculoPrecioCompra?.includes('PORCENTAJE') ? 'Porcentaje (%)' : 'Cantidad (€)'}
                                  </span>
                                  <input
                                    type="number"
                                    step="0.01"
                                    className="erp-input-mono"
                                    value={precioTarifa.valorCalculoCompra || ''}
                                    onChange={(e) => actualizarPrecioTarifa && actualizarPrecioTarifa(tarifa.id, 'valorCalculoCompra', e.target.value)}
                                    placeholder="0"
                                  />
                                </label>
                              )}
                            </div>
                            <div className="erp-form-row erp-form-row-2">
                              <label className="erp-field">
                                <span className="erp-field-label">Precio Compra</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  className="erp-input-mono"
                                  value={precioTarifa.precioCompra || ''}
                                  onChange={(e) => actualizarPrecioTarifa && actualizarPrecioTarifa(tarifa.id, 'precioCompra', e.target.value)}
                                  placeholder="Opcional"
                                  disabled={precioTarifa.tipoCalculoPrecioCompra && precioTarifa.tipoCalculoPrecioCompra !== 'PRECIO_FIJO'}
                                />
                                {precioTarifa.tipoCalculoPrecioCompra && precioTarifa.tipoCalculoPrecioCompra !== 'PRECIO_FIJO' && (
                                  <small style={{ color: '#6b7280', fontSize: '11px' }}>Se calculará automáticamente</small>
                                )}
                              </label>
                              <label className="erp-field">
                                <span className="erp-field-label">Descuento Compra (%)</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  max="100"
                                  className="erp-input-mono"
                                  value={precioTarifa.descuentoCompra || ''}
                                  onChange={(e) => actualizarPrecioTarifa && actualizarPrecioTarifa(tarifa.id, 'descuentoCompra', e.target.value)}
                                  placeholder="Opcional"
                                />
                              </label>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="erp-form-actions">
          <button type="submit" className="erp-btn erp-btn-primary">
            {formProducto.id ? "Guardar cambios" : "Crear producto"}
          </button>
          <button type="button" className="erp-btn erp-btn-secondary" onClick={() => cerrarPestana(pestanaActiva)}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

export function FichaProducto({ productos, productoId, abrirEditarProducto }) {
  const producto = productos.find(p => p.id === productoId);
  if (!producto) return <div className="erp-empty-state">Producto no encontrado</div>;

  return (
    <div className="erp-detail-view">
      <div className="erp-detail-header">
        <div className="erp-detail-title">
          <h2>{producto.titulo}</h2>
          <span className="erp-detail-subtitle">Ref: {producto.referencia}</span>
        </div>
        <div className="erp-detail-actions">
          <button className="erp-btn erp-btn-secondary" onClick={() => abrirEditarProducto(producto)}>
            ✏️ Editar
          </button>
        </div>
      </div>

      <div className="erp-detail-body">
        {producto.imagen && (
          <section className="erp-detail-section">
            <h4 className="erp-section-title">Imagen</h4>
            <div style={{ 
              maxWidth: '300px', 
              border: '2px solid var(--erp-border)', 
              borderRadius: '8px',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'var(--erp-bg-section)',
              padding: '16px'
            }}>
              <img 
                src={`http://145.223.103.219:8080/productos/${producto.id}/imagen`}
                alt={producto.titulo}
                style={{ maxWidth: '100%', height: 'auto', objectFit: 'contain' }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
          </section>
        )}
        <section className="erp-detail-section">
          <h4 className="erp-section-title">Información General</h4>
          <div className="erp-data-grid">
            <div className="erp-data-row">
              <span className="erp-data-label">Referencia</span>
              <span className="erp-data-value erp-mono">{producto.referencia}</span>
            </div>
            <div className="erp-data-row">
              <span className="erp-data-label">Título</span>
              <span className="erp-data-value">{producto.titulo}</span>
            </div>
            <div className="erp-data-row">
              <span className="erp-data-label">Nombre interno</span>
              <span className="erp-data-value">{producto.nombre || "—"}</span>
            </div>
            <div className="erp-data-row">
              <span className="erp-data-label">Familias</span>
              <span className="erp-data-value">{producto.familias?.map(f => f.nombre).join(", ") || "—"}</span>
            </div>
            <div className="erp-data-row">
              <span className="erp-data-label">Subfamilias</span>
              <span className="erp-data-value">{producto.subfamilias?.map(sf => sf.nombre).join(", ") || "—"}</span>
            </div>
            <div className="erp-data-row">
              <span className="erp-data-label">Fabricante</span>
              <span className="erp-data-value">{producto.fabricante?.nombre || "—"}</span>
            </div>
          </div>
        </section>

        <section className="erp-detail-section">
          <h4 className="erp-section-title">Precios y Stock</h4>
          <div className="erp-data-grid">
            <div className="erp-data-row">
              <span className="erp-data-label">Precio base</span>
              <span className="erp-data-value erp-mono">{producto.precio?.toFixed(2)} €</span>
            </div>
            <div className="erp-data-row">
              <span className="erp-data-label">Precio + Imp.</span>
              <span className="erp-data-value erp-mono">{producto.precioConImpuestos?.toFixed(2) || "—"} €</span>
            </div>
            {producto.stockPorAlmacen && producto.stockPorAlmacen.length > 0 ? (
              <div className="erp-data-row" style={{ gridColumn: '1 / -1' }}>
                <span className="erp-data-label">Stock por almacén</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {producto.stockPorAlmacen.map((sa, idx) => (
                    <div key={idx} style={{ 
                      padding: '8px 12px', 
                      backgroundColor: 'var(--erp-bg-section)', 
                      borderRadius: '4px',
                      border: '1px solid var(--erp-border)'
                    }}>
                      <strong>{sa.almacenNombre}:</strong> <span className="erp-mono">{sa.stock} unidades</span>
                      {sa.ubicacion && <span style={{ marginLeft: '12px', color: 'var(--erp-text-secondary)' }}>📍 {sa.ubicacion}</span>}
                      {sa.stockMinimo > 0 && <span style={{ marginLeft: '12px', fontSize: '12px', color: 'var(--erp-text-secondary)' }}>Mín: {sa.stockMinimo}</span>}
                    </div>
                  ))}
                  <div style={{ marginTop: '4px', fontWeight: 600 }}>
                    Total: <span className="erp-mono">{producto.stockPorAlmacen.reduce((sum, sa) => sum + sa.stock, 0)} unidades</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="erp-data-row">
                <span className="erp-data-label">Stock</span>
                <span className="erp-data-value erp-mono">{producto.stock ?? 0}</span>
              </div>
            )}
            <div className="erp-data-row">
              <span className="erp-data-label">Tipo impuesto</span>
              <span className="erp-data-value">{producto.tipoImpuesto || "—"}</span>
            </div>
            <div className="erp-data-row">
              <span className="erp-data-label">Tipo de IVA</span>
              <span className="erp-data-value">
                {producto.tipoIva
                  ? `${producto.tipoIva.nombre} (${producto.tipoIva.porcentajeIva}%${producto.tipoIva.porcentajeRecargo ? ` + ${producto.tipoIva.porcentajeRecargo}% recargo` : ""})`
                  : "—"}
              </span>
            </div>
            <div className="erp-data-row">
              <span className="erp-data-label">Descuento</span>
              <span className="erp-data-value erp-mono">{producto.descuento || 0}%</span>
            </div>
          </div>
        </section>

        {producto.descripcionCorta && (
          <section className="erp-detail-section">
            <h4 className="erp-section-title">Descripción</h4>
            <div className="erp-observations">{producto.descripcionCorta}</div>
          </section>
        )}
      </div>
    </div>
  );
}
