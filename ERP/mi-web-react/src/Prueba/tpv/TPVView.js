import React from "react";
import "./TPV.css";
import {
  IconSearch,
  IconDelete,
  IconDocument,
  IconImpresora,
  IconCesta,
  IconRefresh,
} from "../iconos";

export default function TPVView({ tpv }) {
  if (!tpv) return null;

  const {
    familias,
    productosFiltrados,
    categoriaActiva,
    seleccionarCategoria,
    subfamiliaActiva,
    subfamiliasDisponibles,
    seleccionarSubfamilia,
    paginaFamilias,
    paginaSubfamilias,
    avanzarPaginaFamilias,
    retrocederPaginaFamilias,
    avanzarPaginaSubfamilias,
    retrocederPaginaSubfamilias,
    busqueda,
    setBusqueda,
    addProductoAlTicket,
    lineas,
    lineaActivaId,
    setLineaActivaId,
    ajustarCantidad,
    eliminarLinea,
    limpiarTicket,
    clienteSeleccionado,
    seleccionarCliente,
    clientes,
    tecladoModo,
    setTecladoModo,
    tecladoValor,
    handlePadInput,
    aplicarCalculadora,
    iniciarCobro,
    mostrandoPago,
    metodoPago,
    setMetodoPago,
    importeEntregado,
    setImporteEntregado,
    finalizarCobro,
    cancelarCobro,
    cambio,
    imprimirTicket,
    aplazarTicket,
    ticketId,
    fechaTicket,
    totales,
    crearNuevaVenta,
    historialTickets,
    mostrandoHistorial,
    toggleHistorial,
    ticketsPendientes,
    mostrandoTicketsPendientes,
    toggleTicketsPendientes,
    cargarTicketPendiente,
    ticketActivoId,
    recargarContadorDesdeBD,
  } = tpv;

  const obtenerColorFamilia = (producto) => {
    if (producto?.familia?.colorTPV) return producto.familia.colorTPV;
    if (Array.isArray(producto?.familias)) {
      const conColor = producto.familias.find((fam) => fam?.colorTPV);
      if (conColor?.colorTPV) return conColor.colorTPV;
    }
    if (producto?.familia?.id) {
      const familiaGlobal = familias.find((fam) => fam.id === producto.familia.id);
      if (familiaGlobal?.colorTPV) return familiaGlobal.colorTPV;
    }
    if (Array.isArray(producto?.familias)) {
      const familiaGlobal = familias.find((fam) =>
        producto.familias?.some((pf) => pf?.id === fam.id && fam?.colorTPV)
      );
      if (familiaGlobal?.colorTPV) return familiaGlobal.colorTPV;
    }
    return null;
  };

  const SUBFAMILIAS_POR_PAGINA = 4;

  const FAMILIAS_POR_PAGINA = 4;

  const familiasStart = paginaFamilias * FAMILIAS_POR_PAGINA;
  const familiasEnd = familiasStart + FAMILIAS_POR_PAGINA;
  const familiasVisibles = familias.slice(familiasStart, familiasEnd);
  const hayMasFamilias = familiasEnd < familias.length;

  const subfamiliasStart = paginaSubfamilias * SUBFAMILIAS_POR_PAGINA;
  const subfamiliasEnd = subfamiliasStart + SUBFAMILIAS_POR_PAGINA;
  const subfamiliasVisibles = subfamiliasDisponibles.slice(subfamiliasStart, subfamiliasEnd);
  const hayMasSubfamilias = subfamiliasEnd < subfamiliasDisponibles.length;

  const keypadButtons = [
    { label: "7", value: "7", row: 1, col: 1 },
    { label: "8", value: "8", row: 1, col: 2 },
    { label: "9", value: "9", row: 1, col: 3 },
    { label: "C", value: "C", row: 1, col: 4, variant: "clear" },
    { label: "4", value: "4", row: 2, col: 1 },
    { label: "5", value: "5", row: 2, col: 2 },
    { label: "6", value: "6", row: 2, col: 3 },
    { label: "1", value: "1", row: 3, col: 1 },
    { label: "2", value: "2", row: 3, col: 2 },
    { label: "3", value: "3", row: 3, col: 3 },
    { label: "0", value: "0", row: 4, col: 1 },
    { label: ",", value: ".", row: 4, col: 2 },
    { label: "⌫", value: "⌫", row: 4, col: 3 },
    { label: "OK", value: "OK", row: 2, col: 4, rowSpan: 3, variant: "ok" },
  ];

  const actionButtons = [
    { label: "Cobrar", className: "tpv-action-pay", onClick: iniciarCobro, icon: <IconCesta /> },
    { label: "Aplazar Ticket", className: "tpv-action-secondary", onClick: aplazarTicket, icon: <IconDocument /> },
    { label: "Tickets Aplazados", className: "tpv-action-secondary", onClick: toggleTicketsPendientes, icon: <IconDocument /> },
    { label: "Vaciar", className: "tpv-action-danger", onClick: limpiarTicket, icon: <IconDelete /> },
    { label: "Cancelar", className: "tpv-action-warning", onClick: limpiarTicket, icon: "✖" },
  ];

  return (
    <div className="tpv-wrapper">
      <header className="tpv-toolbar">
        <div className="tpv-search">
          <IconSearch className="tpv-search-icon" />
          <input
            type="text"
            value={busqueda}
            placeholder="Buscar por nombre o referencia"
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <div className="tpv-cliente">
          <label>Cliente</label>
          <select
            value={clienteSeleccionado?.id || ""}
            onChange={(e) => seleccionarCliente(e.target.value)}
          >
            <option value="">Mostrador</option>
            {clientes.map((cliente) => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nombreComercial || cliente.nombreFiscal || `Cliente ${cliente.id}`}
              </option>
            ))}
          </select>
        </div>
        <button className="tpv-btn tpv-btn-ghost" onClick={toggleHistorial}>
          {mostrandoHistorial ? "Ocultar historial" : "Ver historial"} (Ctrl+H)
        </button>
        <button className="tpv-btn tpv-btn-ghost" onClick={crearNuevaVenta}>
          Reiniciar ticket
        </button>
      </header>

      <div className="tpv-body">
        <section className="tpv-category-panel">
          <div className="tpv-category-sections">
            <div className="tpv-category-section">
              <div className="tpv-category-title">Familia</div>
              <div className="tpv-family-nav">
                <button
                  className="tpv-nav-arrow"
                  onClick={retrocederPaginaFamilias}
                  disabled={paginaFamilias <= 0}
                >
                  ‹
                </button>

                <button
                  className={`tpv-nav-todos ${categoriaActiva === "todos" ? "active" : ""}`}
                  onClick={() => seleccionarCategoria("todos")}
                >
                  Todos
                </button>

                <button
                  className="tpv-nav-arrow"
                  onClick={avanzarPaginaFamilias}
                  disabled={!hayMasFamilias}
                >
                  ›
                </button>
              </div>

              <div className="tpv-family-grid">
                {familiasVisibles.map((familia) => (
                  <button
                    key={familia.id}
                    className={`tpv-category-btn ${categoriaActiva === familia.id ? "active" : ""}`}
                    onClick={() => seleccionarCategoria(familia.id)}
                    style={{
                      borderWidth: '3px',
                      borderStyle: 'solid',
                      borderColor: familia.colorTPV || familia.colortpv || 'rgba(255, 255, 255, 0.45)'
                    }}
                  >
                    {familia.imagen && (
                      <img
                        className="tpv-category-image"
                        src={`http://145.223.103.219:8080/familias/${familia.id}/imagen`}
                        alt={familia.nombre}
                        loading="lazy"
                      />
                    )}
                    <span className="tpv-category-label">{familia.nombre}</span>
                  </button>
                ))}
              </div>
            </div>

            {categoriaActiva !== "todos" && subfamiliasDisponibles.length > 0 && (
              <div className="tpv-category-section">
                <div className="tpv-category-title">Subfamilia</div>
                <div className="tpv-family-nav">
                  <button
                    className="tpv-nav-arrow"
                    onClick={retrocederPaginaSubfamilias}
                    disabled={paginaSubfamilias <= 0}
                  >
                    ‹
                  </button>

                  <button
                    className={`tpv-nav-todos ${subfamiliaActiva === "todas" ? "active" : ""}`}
                    onClick={() => seleccionarSubfamilia("todas")}
                  >
                    Todas
                  </button>

                  <button
                    className="tpv-nav-arrow"
                    onClick={avanzarPaginaSubfamilias}
                    disabled={!hayMasSubfamilias}
                  >
                    ›
                  </button>
                </div>

                <div className="tpv-family-grid">
                  {subfamiliasVisibles.map((subfamilia) => (
                    <button
                      key={subfamilia.id}
                      className={`tpv-category-btn ${subfamiliaActiva === subfamilia.id ? "active" : ""}`}
                      onClick={() => seleccionarSubfamilia(subfamilia.id)}
                    >
                      {subfamilia.imagen && (
                        <img
                          className="tpv-category-image"
                          src={`http://145.223.103.219:8080/subfamilias/${subfamilia.id}/imagen`}
                          alt={subfamilia.nombre}
                          loading="lazy"
                        />
                      )}
                      <span className="tpv-category-label">{subfamilia.nombre}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="tpv-products-panel">
          {productosFiltrados.length === 0 ? (
            <div className="tpv-empty-products">No hay productos en esta categoría</div>
          ) : (
            <div className="tpv-products-grid">
              {productosFiltrados.map((producto) => {
                const precio = producto.precioConImpuestos || producto.precio || 0;
                const colorFamilia = obtenerColorFamilia(producto);
                const bordeColor = colorFamilia || "#d1d5db";
                return (
                  <button
                    key={producto.id}
                    className="tpv-product-tile"
                    style={{ borderColor: bordeColor }}
                    onClick={() => addProductoAlTicket(producto)}
                  >
                    {producto.imagen ? (
                      <div className="tpv-product-image-container">
                        <img 
                          src={`http://145.223.103.219:8080/productos/${producto.id}/imagen`}
                          alt={producto.titulo || producto.nombre}
                          className="tpv-product-image"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'flex';
                          }}
                        />
                        <span className="tpv-product-code" style={{ display: 'none' }}>
                          {(producto.referencia || producto.nombre || "?").slice(0, 3).toUpperCase()}
                        </span>
                      </div>
                    ) : (
                      <span className="tpv-product-code">
                        {(producto.referencia || producto.nombre || "?").slice(0, 3).toUpperCase()}
                      </span>
                    )}
                    <div className="tpv-product-title-row">
                      <span
                        className="tpv-product-color-dot"
                        style={{
                          backgroundColor: colorFamilia || "#94a3b8",
                          borderColor: colorFamilia || "#cbd5f5",
                        }}
                      />
                      <strong>{producto.titulo || producto.nombre}</strong>
                    </div>
                    <small>{producto.referencia || "—"}</small>
                    <span className="tpv-product-price">{precio.toFixed(2)} €</span>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <section className="tpv-ticket-panel">
          <div className="tpv-ticket-header">
            <div className="tpv-ticket-meta">
              <div className="tpv-ticket-id">
                {ticketId}
                <button 
                  className="tpv-reload-btn" 
                  onClick={recargarContadorDesdeBD}
                  title="Recargar contador desde base de datos"
                >
                  <IconRefresh />
                </button>
              </div>
              <small>{new Date(fechaTicket).toLocaleString()}</small>
            </div>
            <div className="tpv-ticket-columns">
              <span>Descripción</span>
              <span>Cant.</span>
              <span>Importe</span>
            </div>
          </div>
          <div className="tpv-ticket-list">
            {lineas.length === 0 ? (
              <div className="tpv-empty-ticket">Sin artículos</div>
            ) : (
              lineas.map((linea) => {
                const subtotalLinea = linea.cantidad * linea.precioUnitario;
                const descuentoLinea = subtotalLinea * (linea.descuento / 100);
                const totalLinea = subtotalLinea - descuentoLinea;
                return (
                  <article
                    key={linea.id}
                    className={`tpv-ticket-line ${lineaActivaId === linea.id ? "active" : ""}`}
                    onClick={() => setLineaActivaId(linea.id)}
                  >
                    <div className="tpv-ticket-line-desc">
                      <h4>{linea.descripcion}</h4>
                      <div className="tpv-ticket-line-controls">
                        <button onClick={(e) => { e.stopPropagation(); ajustarCantidad(linea.id, -1); }}>-</button>
                        <button onClick={(e) => { e.stopPropagation(); ajustarCantidad(linea.id, 1); }}>+</button>
                        <button onClick={(e) => { e.stopPropagation(); eliminarLinea(linea.id); }}>
                          <IconDelete />
                        </button>
                      </div>
                    </div>
                    <div className="tpv-ticket-line-qty">
                      {linea.cantidad.toFixed(2)}
                    </div>
                    <div className="tpv-ticket-line-importe">
                      {totalLinea.toFixed(2)} €
                    </div>
                  </article>
                );
              })
            )}
          </div>
          <div className="tpv-ticket-footer">
            <div>
              Artículos
              <strong>{` ${totales.totalArticulos.toFixed(2)}`}</strong>
            </div>
            <div>
              Subtotal
              <strong>{` ${totales.subtotal.toFixed(2)} €`}</strong>
            </div>
            {totales.descuento > 0 && (
              <div className="tpv-ticket-discount-total">
                Descuento
                <strong>{` -${totales.descuento.toFixed(2)} €`}</strong>
              </div>
            )}
          </div>
          <div className="tpv-ticket-totalbar">
            <span>Total</span>
            <strong>{totales.total.toFixed(2)} €</strong>
          </div>
        </section>

        <section className="tpv-actions-panel">
          <div className="tpv-calculator">
            <div className="tpv-calc-display">
              <strong>{tecladoValor}</strong>
            </div>
            <div className="tpv-calc-toggle">
              <button
                className={tecladoModo === "cantidad" ? "active" : ""}
                onClick={() => setTecladoModo("cantidad")}
              >
                Cant.
              </button>
              <button
                className={tecladoModo === "precio" ? "active" : ""}
                onClick={() => setTecladoModo("precio")}
              >
                Precio
              </button>
            </div>
            <div className="tpv-keypad-grid">
              {keypadButtons.map((btn) => (
                <button
                  key={`${btn.label}-${btn.row}-${btn.col}`}
                  type="button"
                  className={`tpv-keypad-btn ${btn.variant || ""}`}
                  style={{
                    gridRow: `${btn.row} / span ${btn.rowSpan || 1}`,
                    gridColumn: `${btn.col} / span ${btn.colSpan || 1}`,
                  }}
                  onClick={() =>
                    btn.value === "OK" ? aplicarCalculadora() : handlePadInput(btn.value)
                  }
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          <div className="tpv-actions-grid">
            {actionButtons.map((btn) => (
              <button key={btn.label} className={`tpv-action-tile ${btn.className}`} onClick={btn.onClick}>
                <div className="tpv-action-icon">{btn.icon}</div>
                <strong>{btn.label}</strong>
              </button>
            ))}
          </div>
        </section>
      </div>

      {mostrandoTicketsPendientes && (
        <div className="tpv-payment-overlay">
          <div className="tpv-history-modal">
            <header>
              <h3>Tickets Pendientes</h3>
              <button onClick={toggleTicketsPendientes}>×</button>
            </header>
            <section className="tpv-history-body">
              {ticketsPendientes.length === 0 ? (
                <div className="tpv-empty-history">No hay tickets pendientes</div>
              ) : (
                <div className="tpv-history-list">
                  {ticketsPendientes.map((ticket, index) => (
                    <article key={index} className="tpv-history-item">
                      <div className="tpv-history-header">
                        <strong>{ticket.ticketId}</strong>
                        <span>{ticket.horaVenta}</span>
                      </div>
                      <div className="tpv-history-details">
                        <p>Cliente: {ticket.cliente?.nombreComercial || "Mostrador"}</p>
                        <p>Artículos: {ticket.lineas.length}</p>
                      </div>
                      <div className="tpv-history-footer">
                        <span>Total: <strong>{ticket.total.toFixed(2)} €</strong></span>
                        <button 
                          className="tpv-btn tpv-btn-primary"
                          onClick={() => cargarTicketPendiente(ticket)}
                          style={{ marginLeft: '8px', padding: '4px 8px', fontSize: '12px' }}
                        >
                          📋 Cargar
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
            <footer>
              <button className="tpv-btn tpv-btn-secondary" onClick={toggleTicketsPendientes}>
                Cerrar
              </button>
            </footer>
          </div>
        </div>
      )}

      {mostrandoHistorial && (
        <div className="tpv-payment-overlay">
          <div className="tpv-history-modal">
            <header>
              <h3>Facturas simplificadas de esta sesión</h3>
              <button onClick={toggleHistorial}>×</button>
            </header>
            <section className="tpv-history-body">
              {historialTickets.length === 0 ? (
                <div className="tpv-empty-history">No hay ventas registradas</div>
              ) : (
                <div className="tpv-history-list">
                  {historialTickets.map((ticket, index) => (
                    <article key={index} className="tpv-history-item">
                      <div className="tpv-history-header">
                        <strong>{ticket.ticketId}</strong>
                        <span>{ticket.horaVenta}</span>
                      </div>
                      <div className="tpv-history-details">
                        <p>Cliente: {ticket.cliente?.nombreComercial || "Mostrador"}</p>
                        <p>Método: {ticket.metodoPago}</p>
                        <p>Artículos: {ticket.lineas.length}</p>
                      </div>
                      <div className="tpv-history-footer">
                        <span>Total: <strong>{ticket.total.toFixed(2)} €</strong></span>
                        <span>Cambio: {ticket.cambio.toFixed(2)} €</span>
                        <button 
                          className="tpv-btn tpv-btn-primary"
                          onClick={() => imprimirTicket(ticket)}
                          style={{ marginLeft: '8px', padding: '4px 8px', fontSize: '12px' }}
                        >
                          🖨️ Imprimir
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
            <footer>
              <button className="tpv-btn tpv-btn-secondary" onClick={toggleHistorial}>
                Cerrar
              </button>
            </footer>
          </div>
        </div>
      )}

      {mostrandoPago && (
        <div className="tpv-payment-overlay">
          <div className="tpv-payment-modal">
            <header>
              <h3>Cobro</h3>
              <button onClick={cancelarCobro}>×</button>
            </header>
            <section className="tpv-payment-body">
              <div className="tpv-payment-total">
                <span>Total ticket</span>
                <strong>{totales.total.toFixed(2)} €</strong>
              </div>
              <div className="tpv-payment-field">
                <label>Método de pago</label>
                <div className="tpv-payment-methods">
                  {["Efectivo", "Tarjeta", "Mixto"].map((metodo) => (
                    <button
                      key={metodo}
                      className={metodoPago === metodo ? "active" : ""}
                      onClick={() => setMetodoPago(metodo)}
                    >
                      {metodo}
                    </button>
                  ))}
                </div>
              </div>
              <div className="tpv-payment-field">
                <label>Importe entregado</label>
                <input
                  type="number"
                  step="0.01"
                  autoFocus
                  value={importeEntregado}
                  onChange={(e) => setImporteEntregado(e.target.value)}
                />
              </div>
              <div className="tpv-payment-change">
                <span>Cambio</span>
                <strong>{cambio.toFixed(2)} €</strong>
              </div>
            </section>
            <footer>
              <button className="tpv-btn tpv-btn-secondary" onClick={cancelarCobro}>
                Cancelar
              </button>
              <button className="tpv-btn tpv-btn-primary" onClick={finalizarCobro}>
                Finalizar cobro
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
