import React from "react";
import { IconDelete, IconEye, IconRefresh } from "../iconos";

export function ListaFacturasSimplificadas({
  facturasSimplificadas,
  cargando,
  cargarFacturasSimplificadas,
  abrirVerFactura,
  borrarFactura,
  imprimirFactura,
  paginaActual,
  setPaginaActual,
  itemsPorPagina,
  setItemsPorPagina,
  totalElementos,
  totalPaginas,
  ordenarPor,
  ordenDireccion,
  cambiarOrdenacion,
}) {
  if (cargando) {
    return <div className="erp-loading">Cargando historial TPV...</div>;
  }

  const renderIconoOrden = (campo) => {
    if (ordenarPor !== campo) return null;
    return ordenDireccion === "asc" ? " ▲" : " ▼";
  };

  return (
    <div className="erp-crud-container">
      <div className="erp-crud-header">
        <h2>Facturas Simplificadas</h2>
        <div className="erp-crud-actions">
          <button className="erp-btn erp-btn-secondary" onClick={cargarFacturasSimplificadas}>
            <IconRefresh /> Actualizar
          </button>
        </div>
      </div>

      {facturasSimplificadas.length === 0 ? (
        <div className="erp-empty-state">
          <p>No hay facturas simplificadas registradas</p>
        </div>
      ) : (
        <>
          <div className="erp-table-container">
            <table className="erp-table">
              <thead>
                <tr>
                  <th onClick={() => cambiarOrdenacion("numero")} style={{ cursor: "pointer" }}>
                    Número{renderIconoOrden("numero")}
                  </th>
                  <th onClick={() => cambiarOrdenacion("fecha")} style={{ cursor: "pointer" }}>
                    Fecha{renderIconoOrden("fecha")}
                  </th>
                  <th>Cliente</th>
                  <th onClick={() => cambiarOrdenacion("total")} style={{ cursor: "pointer" }}>
                    Total{renderIconoOrden("total")}
                  </th>
                  <th>Estado</th>
                  <th>Contabilizado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {facturasSimplificadas.map((factura) => (
                  <tr key={factura.id}>
                    <td>{factura.numero}</td>
                    <td>{factura.fecha}</td>
                    <td>{factura.cliente?.nombreComercial || "Mostrador"}</td>
                    <td>{factura.total?.toFixed(2)} €</td>
                    <td>
                      <span className={`erp-badge erp-badge-${factura.estado === "Cobrada" ? "success" : "warning"}`}>
                        {factura.estado}
                      </span>
                    </td>
                    <td>
                      <span className={`erp-badge erp-badge-${factura.contabilizado ? "success" : "secondary"}`}>
                        {factura.contabilizado ? "Sí" : "No"}
                      </span>
                    </td>
                    <td>
                      <div className="erp-table-actions">
                        <button
                          className="erp-btn-icon erp-btn-icon-primary"
                          onClick={() => abrirVerFactura(factura)}
                          title="Ver detalle"
                        >
                          <IconEye />
                        </button>
                        <button
                          className="erp-btn-icon erp-btn-icon-secondary"
                          onClick={() => imprimirFactura(factura)}
                          title="Imprimir ticket"
                        >
                          🖨️
                        </button>
                        <button
                          className="erp-btn-icon erp-btn-icon-danger"
                          onClick={() => borrarFactura(factura.id)}
                          title="Eliminar"
                        >
                          <IconDelete />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="erp-pagination">
            <div className="erp-pagination-info">
              Mostrando {paginaActual * itemsPorPagina + 1} - {Math.min((paginaActual + 1) * itemsPorPagina, totalElementos)} de {totalElementos} registros
            </div>
            <div className="erp-pagination-controls">
              <button
                className="erp-btn erp-btn-secondary"
                onClick={() => setPaginaActual(0)}
                disabled={paginaActual === 0}
              >
                ««
              </button>
              <button
                className="erp-btn erp-btn-secondary"
                onClick={() => setPaginaActual(prev => Math.max(0, prev - 1))}
                disabled={paginaActual === 0}
              >
                ‹
              </button>
              <span className="erp-pagination-current">
                Página {paginaActual + 1} de {totalPaginas || 1}
              </span>
              <button
                className="erp-btn erp-btn-secondary"
                onClick={() => setPaginaActual(prev => Math.min(totalPaginas - 1, prev + 1))}
                disabled={paginaActual >= totalPaginas - 1}
              >
                ›
              </button>
              <button
                className="erp-btn erp-btn-secondary"
                onClick={() => setPaginaActual(totalPaginas - 1)}
                disabled={paginaActual >= totalPaginas - 1}
              >
                »»
              </button>
            </div>
            <div className="erp-pagination-size">
              <label>Registros por página:</label>
              <select
                value={itemsPorPagina}
                onChange={(e) => {
                  setItemsPorPagina(Number(e.target.value));
                  setPaginaActual(0);
                }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function FichaFacturaSimplificada({ factura }) {
  if (!factura) {
    return <div className="erp-loading">Cargando factura...</div>;
  }

  const calcularSubtotalLinea = (linea) => linea.cantidad * linea.precioUnitario;
  const calcularDescuentoLinea = (linea) => calcularSubtotalLinea(linea) * (linea.descuento / 100);
  const calcularBaseLinea = (linea) => calcularSubtotalLinea(linea) - calcularDescuentoLinea(linea);
  const totalArticulos = factura.lineas?.reduce((acc, linea) => acc + linea.cantidad, 0) || 0;

  return (
    <div className="erp-ficha-container">
      <div className="erp-ficha-header">
        <div>
          <span className="erp-ficha-kicker">Factura simplificada</span>
          <h2>{factura.numero}</h2>
          <p className="erp-ficha-date">{factura.fecha}</p>
        </div>
        <div className="erp-ficha-status">
          <span className={`erp-badge erp-badge-${factura.estado === "Cobrada" ? "success" : "warning"}`}>
            {factura.estado}
          </span>
          <span className={`erp-badge ${factura.contabilizado ? "erp-badge-success" : "erp-badge-secondary"}`}>
            {factura.contabilizado ? "Stock restado" : "Sin contabilizar"}
          </span>
        </div>
      </div>

      <div className="erp-ficha-summary-grid">
        <div className="erp-summary-card">
          <span>Total cobrado</span>
          <strong>{factura.total?.toFixed(2)} €</strong>
        </div>
        <div className="erp-summary-card">
          <span>Subtotal</span>
          <strong>{factura.subtotal?.toFixed(2)} €</strong>
        </div>
        <div className="erp-summary-card">
          <span>Descuento aplicado</span>
          <strong>-{factura.descuentoTotal?.toFixed(2)} €</strong>
        </div>
        <div className="erp-summary-card">
          <span>Artículos vendidos</span>
          <strong>{totalArticulos}</strong>
        </div>
      </div>

      <div className="erp-ficha-body">
        <section className="erp-ficha-section erp-ficha-info">
          <div className="erp-ficha-grid">
            <div className="erp-ficha-field">
              <label>Número</label>
              <span>{factura.numero}</span>
            </div>
            <div className="erp-ficha-field">
              <label>Fecha</label>
              <span>{factura.fecha}</span>
            </div>
            <div className="erp-ficha-field">
              <label>Cliente</label>
              <span>{factura.cliente?.nombreComercial || "Mostrador"}</span>
            </div>
            <div className="erp-ficha-field">
              <label>Método de pago</label>
              <span>{factura.observaciones?.split("Método de pago:")[1]?.split(".")[0]?.trim() || "N/D"}</span>
            </div>
            <div className="erp-ficha-field">
              <label>Importe entregado</label>
              <span>
                {factura.observaciones?.match(/Importe entregado:\s?([0-9,.]+)/)?.[1]
                  ? `${factura.observaciones.match(/Importe entregado:\s?([0-9,.]+)/)[1]}`
                  : "-"}
              </span>
            </div>
          </div>
          {factura.observaciones && (
            <div className="erp-ficha-nota">
              <label>Observaciones</label>
              <p>{factura.observaciones}</p>
            </div>
          )}
        </section>

        <section className="erp-ficha-section">
          <div className="erp-section-header">
            <h3>Líneas de venta</h3>
            <span>{factura.lineas?.length || 0} productos</span>
          </div>
          <table className="erp-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio Unit.</th>
                <th>Desc. %</th>
                <th>Base</th>
                <th>IVA %</th>
                <th>Imp. IVA</th>
                <th>Total Línea</th>
              </tr>
            </thead>
            <tbody>
              {factura.lineas?.map((linea, index) => (
                <tr key={index}>
                  <td>{linea.descripcion || linea.producto?.nombre || "Sin descripción"}</td>
                  <td>{linea.cantidad}</td>
                  <td>{linea.precioUnitario.toFixed(2)} €</td>
                  <td>{linea.descuento.toFixed(2)}%</td>
                  <td>{calcularBaseLinea(linea).toFixed(2)} €</td>
                  <td>{linea.porcentajeIva.toFixed(2)}%</td>
                  <td>{linea.importeIva.toFixed(2)} €</td>
                  <td><strong>{linea.importeTotalLinea.toFixed(2)} €</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="erp-ficha-section erp-totales-panel">
          <div className="erp-section-header">
            <h3>Totales</h3>
          </div>
          <div className="erp-totales-grid">
            <div className="erp-total-row">
              <span>Subtotal:</span>
              <strong>{factura.subtotal?.toFixed(2)} €</strong>
            </div>
            <div className="erp-total-row">
              <span>Descuento Total:</span>
              <strong>-{factura.descuentoTotal?.toFixed(2)} €</strong>
            </div>
            <div className="erp-total-row erp-total-final">
              <span>TOTAL:</span>
              <strong>{factura.total?.toFixed(2)} €</strong>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
