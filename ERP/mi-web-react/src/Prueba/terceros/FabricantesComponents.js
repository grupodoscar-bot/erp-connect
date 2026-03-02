import React, { useMemo, useState } from "react";
import { IconEye, IconEdit, IconDelete } from "../iconos";

export function ListaFabricantes({
  fabricantes,
  abrirNuevoFabricante,
  abrirVerFabricante,
  abrirEditarFabricante,
  borrarFabricante,
}) {
  const [busqueda, setBusqueda] = useState("");
  const termino = busqueda.trim().toLowerCase();

  const [mostrarFiltrosAvanzados, setMostrarFiltrosAvanzados] = useState(false);
  const [filtroFormaPago, setFiltroFormaPago] = useState("");
  const [filtroTarifa, setFiltroTarifa] = useState("");
  const [filtroPais, setFiltroPais] = useState("");
  const [filtroAgrupacion, setFiltroAgrupacion] = useState("");

  const filtrosActivos = [
    filtroFormaPago,
    filtroTarifa,
    filtroPais,
    filtroAgrupacion,
  ].filter(Boolean).length;

  const limpiarFiltros = () => {
    setBusqueda("");
    setFiltroFormaPago("");
    setFiltroTarifa("");
    setFiltroPais("");
    setFiltroAgrupacion("");
  };

  const fabricantesFiltrados = useMemo(() => {
    if (!Array.isArray(fabricantes)) return [];

    return fabricantes.filter((fabricante) => {
      const referencia = fabricante?.id?.toString().toLowerCase() || "";
      const nombre = `${fabricante?.nombreComercial || ""} ${fabricante?.nombreFiscal || ""}`.toLowerCase();
      const nif = (fabricante?.nifCif || "").toLowerCase();
      const coincideTexto =
        !termino ||
        referencia.includes(termino) ||
        nombre.includes(termino) ||
        nif.includes(termino);

      if (!coincideTexto) return false;

      if (filtroFormaPago && (fabricante?.formaPago || "").toLowerCase() !== filtroFormaPago.toLowerCase()) {
        return false;
      }
      if (filtroTarifa && (fabricante?.tarifa || "").toLowerCase() !== filtroTarifa.toLowerCase()) {
        return false;
      }
      const primerDireccion = fabricante?.direcciones?.[0];
      if (filtroPais && (primerDireccion?.pais || "").toLowerCase() !== filtroPais.toLowerCase()) {
        return false;
      }
      if (filtroAgrupacion) {
        const nombreAgrupacion = fabricante?.agrupacion?.nombre?.toLowerCase() || "";
        if (!nombreAgrupacion.includes(filtroAgrupacion.toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  }, [fabricantes, termino, filtroFormaPago, filtroTarifa, filtroPais, filtroAgrupacion]);

  return (
    <div className="erp-list-view">
      <div className="erp-list-toolbar">
        <button className="erp-btn erp-btn-primary" onClick={abrirNuevoFabricante}>
          + Nuevo Fabricante
        </button>
        <div className="erp-filters-bar">
          <div className="erp-search-row">
            <input
              type="text"
              className="erp-search-input"
              placeholder="Buscar por referencia, nombre o NIF/CIF..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            <button
              type="button"
              className={`erp-btn ${mostrarFiltrosAvanzados ? "erp-btn-primary" : "erp-btn-secondary"}`}
              onClick={() => setMostrarFiltrosAvanzados(!mostrarFiltrosAvanzados)}
            >
              Filtros {filtrosActivos > 0 ? `(${filtrosActivos})` : ""}
            </button>
            {filtrosActivos > 0 && (
              <button type="button" className="erp-btn erp-btn-danger" onClick={limpiarFiltros}>
                Limpiar filtros
              </button>
            )}
          </div>
          {mostrarFiltrosAvanzados && (
            <div className="erp-filters-panel">
              <div className="erp-filters-grid">
                <label className="erp-field">
                  <span className="erp-field-label">Forma de pago</span>
                  <input
                    type="text"
                    value={filtroFormaPago}
                    onChange={(e) => setFiltroFormaPago(e.target.value)}
                    placeholder="CONTADO..."
                  />
                </label>
                <label className="erp-field">
                  <span className="erp-field-label">Tarifa</span>
                  <input
                    type="text"
                    value={filtroTarifa}
                    onChange={(e) => setFiltroTarifa(e.target.value)}
                    placeholder="Normal..."
                  />
                </label>
                <label className="erp-field">
                  <span className="erp-field-label">País</span>
                  <input
                    type="text"
                    value={filtroPais}
                    onChange={(e) => setFiltroPais(e.target.value)}
                    placeholder="España..."
                  />
                </label>
                <label className="erp-field">
                  <span className="erp-field-label">Agrupación</span>
                  <input
                    type="text"
                    value={filtroAgrupacion}
                    onChange={(e) => setFiltroAgrupacion(e.target.value)}
                    placeholder="Nombre agrupación"
                  />
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      <table className="erp-table">
        <thead>
          <tr>
            <th>Referencia</th>
            <th>Nombre comercial</th>
            <th>NIF/CIF</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th className="erp-th-actions">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {fabricantesFiltrados.map((f) => (
            <tr key={f.id} onDoubleClick={() => abrirVerFabricante(f)}>
              <td className="erp-td-mono">{f.id}</td>
              <td className="erp-td-main">{f.nombreComercial || f.nombre || "—"}</td>
              <td className="erp-td-mono">{f.nifCif || "—"}</td>
              <td>{f.email || "—"}</td>
              <td className="erp-td-mono">{f.telefonoMovil || f.telefono || "—"}</td>
              <td className="erp-td-actions">
                <button className="erp-action-btn" onClick={() => abrirVerFabricante(f)} title="Ver">
                  <IconEye className="erp-action-icon" />
                </button>
                <button className="erp-action-btn" onClick={() => abrirEditarFabricante(f)} title="Editar">
                  <IconEdit className="erp-action-icon" />
                </button>
                <button className="erp-action-btn erp-action-danger" onClick={() => borrarFabricante(f.id)} title="Eliminar">
                  <IconDelete className="erp-action-icon" />
                </button>
              </td>
            </tr>
          ))}
          {fabricantesFiltrados.length === 0 && (
            <tr><td colSpan="6" className="erp-td-empty">No hay fabricantes que coincidan con la búsqueda o filtros</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export function FormularioFabricante({
  formFabricante,
  seccionFormActiva,
  setSeccionFormActiva,
  agrupacionesDisponibles,
  updateFormFabricanteField,
  agregarDireccion,
  actualizarDireccion,
  eliminarDireccion,
  guardarFabricante,
  cerrarPestana,
  pestanaActiva,
  formasPago,
  tarifas,
  modosImpuesto,
  retenciones,
}) {
  return (
    <div className="erp-form-view">
      <form onSubmit={guardarFabricante}>
        <div className="erp-form-tabs">
          {["general", "comercial", "bancaria", "impuestos"].map(sec => (
            <button
              key={sec}
              type="button"
              className={`erp-form-tab ${seccionFormActiva === sec ? "active" : ""}`}
              onClick={() => setSeccionFormActiva(sec)}
            >
              {sec === "general" && "Datos Generales"}
              {sec === "comercial" && "Comercial"}
              {sec === "bancaria" && "Bancaria"}
              {sec === "impuestos" && "Impuestos"}
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
                    <span className="erp-field-label">Nombre comercial *</span>
                    <input
                      type="text"
                      maxLength={150}
                      value={formFabricante.nombreComercial}
                      onChange={(e) => updateFormFabricanteField("nombreComercial", e.target.value)}
                      required
                    />
                  </label>
                  <label className="erp-field">
                    <span className="erp-field-label">Nombre fiscal</span>
                    <input
                      type="text"
                      maxLength={200}
                      value={formFabricante.nombreFiscal}
                      onChange={(e) => updateFormFabricanteField("nombreFiscal", e.target.value)}
                    />
                  </label>
                </div>
                <div className="erp-form-row erp-form-row-1">
                  <label className="erp-field">
                    <span className="erp-field-label">NIF/CIF</span>
                    <input
                      type="text"
                      className="erp-input-mono"
                      maxLength={20}
                      value={formFabricante.nifCif}
                      onChange={(e) => updateFormFabricanteField("nifCif", e.target.value)}
                    />
                  </label>
                </div>
              </div>

              <div className="erp-form-group">
                <div className="erp-form-group-title-row">
                  <h4 className="erp-form-group-title">Direcciones</h4>
                  <button
                    type="button"
                    className="erp-btn erp-btn-secondary"
                    onClick={agregarDireccion}
                  >
                    + Añadir dirección
                  </button>
                </div>
                <div className="erp-direcciones-grid">
                  {(formFabricante.direcciones || []).map((dir, index) => (
                    <div key={`direccion-fabricante-${index}`} className="erp-card erp-card-bordered">
                      <div className="erp-card-header">
                        <strong>Dirección #{index + 1}</strong>
                        {(formFabricante.direcciones?.length || 0) > 1 && (
                          <button
                            type="button"
                            className="erp-btn erp-btn-link erp-text-danger"
                            onClick={() => eliminarDireccion(index)}
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
                      <div className="erp-form-row erp-form-row-2">
                        <label className="erp-field">
                          <span className="erp-field-label">País</span>
                          <input
                            type="text"
                            maxLength={56}
                            value={dir.pais}
                            onChange={(e) => actualizarDireccion(index, "pais", e.target.value)}
                          />
                        </label>
                        <label className="erp-field">
                          <span className="erp-field-label">Código postal</span>
                          <input
                            type="text"
                            className="erp-input-mono"
                            maxLength={12}
                            value={dir.codigoPostal}
                            onChange={(e) => actualizarDireccion(index, "codigoPostal", e.target.value)}
                          />
                        </label>
                      </div>
                      <div className="erp-form-row erp-form-row-2">
                        <label className="erp-field">
                          <span className="erp-field-label">Provincia</span>
                          <input
                            type="text"
                            maxLength={100}
                            value={dir.provincia}
                            onChange={(e) => actualizarDireccion(index, "provincia", e.target.value)}
                          />
                        </label>
                        <label className="erp-field">
                          <span className="erp-field-label">Población</span>
                          <input
                            type="text"
                            maxLength={100}
                            value={dir.poblacion}
                            onChange={(e) => actualizarDireccion(index, "poblacion", e.target.value)}
                          />
                        </label>
                      </div>
                      <label className="erp-field erp-field-full">
                        <span className="erp-field-label">Dirección completa</span>
                        <textarea
                          rows="2"
                          maxLength={255}
                          value={dir.direccion}
                          onChange={(e) => actualizarDireccion(index, "direccion", e.target.value)}
                        />
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="erp-form-group">
                <h4 className="erp-form-group-title">Contacto</h4>
                <div className="erp-form-row">
                  <label className="erp-field">
                    <span className="erp-field-label">Email *</span>
                    <input
                      type="email"
                      maxLength={254}
                      value={formFabricante.email}
                      onChange={(e) => updateFormFabricanteField("email", e.target.value)}
                      required
                    />
                  </label>
                  <label className="erp-field">
                    <span className="erp-field-label">Web</span>
                    <input
                      type="text"
                      maxLength={2048}
                      value={formFabricante.web}
                      onChange={(e) => updateFormFabricanteField("web", e.target.value)}
                    />
                  </label>
                </div>
                <div className="erp-form-row erp-form-row-3">
                  <label className="erp-field">
                    <span className="erp-field-label">Teléfono fijo</span>
                    <input
                      type="text"
                      className="erp-input-mono"
                      maxLength={20}
                      value={formFabricante.telefonoFijo}
                      onChange={(e) => updateFormFabricanteField("telefonoFijo", e.target.value)}
                    />
                  </label>
                  <label className="erp-field">
                    <span className="erp-field-label">Teléfono móvil</span>
                    <input
                      type="text"
                      className="erp-input-mono"
                      maxLength={20}
                      value={formFabricante.telefonoMovil}
                      onChange={(e) => updateFormFabricanteField("telefonoMovil", e.target.value)}
                    />
                  </label>
                  <label className="erp-field">
                    <span className="erp-field-label">Fax</span>
                    <input
                      type="text"
                      className="erp-input-mono"
                      maxLength={20}
                      value={formFabricante.fax}
                      onChange={(e) => updateFormFabricanteField("fax", e.target.value)}
                    />
                  </label>
                </div>
              </div>

              <div className="erp-form-group">
                <h4 className="erp-form-group-title">Observaciones</h4>
                <label className="erp-field erp-field-full">
                  <textarea
                    rows="3"
                    value={formFabricante.observaciones}
                    onChange={(e) => updateFormFabricanteField("observaciones", e.target.value)}
                  />
                </label>
              </div>
            </div>
          )}

          {seccionFormActiva === "comercial" && (
            <div className="erp-form-section">
              <div className="erp-form-group">
                <h4 className="erp-form-group-title">Condiciones comerciales</h4>
                <div className="erp-form-row">
                  <label className="erp-field">
                    <span className="erp-field-label">Fecha nacimiento</span>
                    <input
                      type="date"
                      value={formFabricante.fechaNacimiento}
                      onChange={(e) => updateFormFabricanteField("fechaNacimiento", e.target.value)}
                    />
                  </label>
                  <label className="erp-field">
                    <span className="erp-field-label">Agrupación</span>
                    <select
                      value={formFabricante.agrupacionId}
                      onChange={(e) => updateFormFabricanteField("agrupacionId", e.target.value)}
                    >
                      <option value="">Sin agrupación</option>
                      {agrupacionesDisponibles.map((agr) => (
                        <option key={agr.id} value={agr.id}>
                          {agr.nombre} {agr.descuentoGeneral > 0 && `(${agr.descuentoGeneral}%)`}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="erp-form-row erp-form-row-3">
                  <label className="erp-field">
                    <span className="erp-field-label">Tarifa</span>
                    <select value={formFabricante.tarifa} onChange={(e) => updateFormFabricanteField("tarifa", e.target.value)}>
                      {tarifas.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </label>
                  <label className="erp-field">
                    <span className="erp-field-label">Descuento (%)</span>
                    <input
                      type="number"
                      step="0.01"
                      className="erp-input-mono"
                      value={formFabricante.descuento}
                      onChange={(e) => updateFormFabricanteField("descuento", e.target.value)}
                    />
                  </label>
                  <label className="erp-field">
                    <span className="erp-field-label">Forma de pago</span>
                    <select value={formFabricante.formaPago} onChange={(e) => updateFormFabricanteField("formaPago", e.target.value)}>
                      {formasPago.map((f) => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </label>
                </div>
              </div>

              <div className="erp-form-group">
                <h4 className="erp-form-group-title">Riesgo y pagos</h4>
                <div className="erp-form-row erp-form-row-3">
                  <label className="erp-field">
                    <span className="erp-field-label">Días pago 1º</span>
                    <input
                      type="number"
                      className="erp-input-mono"
                      value={formFabricante.diasPago1}
                      onChange={(e) => updateFormFabricanteField("diasPago1", e.target.value)}
                    />
                  </label>
                  <label className="erp-field">
                    <span className="erp-field-label">Días pago 2º</span>
                    <input
                      type="number"
                      className="erp-input-mono"
                      value={formFabricante.diasPago2}
                      onChange={(e) => updateFormFabricanteField("diasPago2", e.target.value)}
                    />
                  </label>
                  <label className="erp-field">
                    <span className="erp-field-label">Riesgo autorizado (€)</span>
                    <input
                      type="number"
                      step="0.01"
                      className="erp-input-mono"
                      value={formFabricante.riesgoAutorizado}
                      onChange={(e) => updateFormFabricanteField("riesgoAutorizado", e.target.value)}
                    />
                  </label>
                </div>
                <label className="erp-checkbox">
                  <input
                    type="checkbox"
                    checked={formFabricante.bloquearVentas}
                    onChange={(e) => updateFormFabricanteField("bloquearVentas", e.target.checked)}
                  />
                  <span>Bloquear ventas si supera el riesgo</span>
                </label>
              </div>
            </div>
          )}

          {seccionFormActiva === "bancaria" && (
            <div className="erp-form-section">
              <div className="erp-form-group">
                <h4 className="erp-form-group-title">Datos bancarios</h4>
                <label className="erp-field erp-field-half">
                  <span className="erp-field-label">Entidad bancaria</span>
                  <input
                    type="text"
                    maxLength={100}
                    value={formFabricante.nombreEntidadBancaria}
                    onChange={(e) => updateFormFabricanteField("nombreEntidadBancaria", e.target.value)}
                  />
                </label>
                <div className="erp-form-row erp-form-row-4">
                  <label className="erp-field">
                    <span className="erp-field-label">Entidad</span>
                    <input
                      type="text"
                      className="erp-input-mono"
                      maxLength={4}
                      value={formFabricante.cuentaCccEntidad}
                      onChange={(e) => updateFormFabricanteField("cuentaCccEntidad", e.target.value)}
                    />
                  </label>
                  <label className="erp-field">
                    <span className="erp-field-label">Oficina</span>
                    <input
                      type="text"
                      className="erp-input-mono"
                      maxLength={4}
                      value={formFabricante.cuentaCccOficina}
                      onChange={(e) => updateFormFabricanteField("cuentaCccOficina", e.target.value)}
                    />
                  </label>
                  <label className="erp-field">
                    <span className="erp-field-label">DC</span>
                    <input
                      type="text"
                      className="erp-input-mono"
                      maxLength={2}
                      value={formFabricante.cuentaCccDc}
                      onChange={(e) => updateFormFabricanteField("cuentaCccDc", e.target.value)}
                    />
                  </label>
                  <label className="erp-field">
                    <span className="erp-field-label">Nº Cuenta</span>
                    <input
                      type="text"
                      className="erp-input-mono"
                      maxLength={10}
                      value={formFabricante.cuentaCccNumero}
                      onChange={(e) => updateFormFabricanteField("cuentaCccNumero", e.target.value)}
                    />
                  </label>
                </div>
                <div className="erp-form-row">
                  <label className="erp-field">
                    <span className="erp-field-label">IBAN</span>
                    <input
                      type="text"
                      className="erp-input-mono"
                      maxLength={34}
                      value={formFabricante.cuentaIban}
                      onChange={(e) => updateFormFabricanteField("cuentaIban", e.target.value)}
                    />
                  </label>
                  <label className="erp-field erp-field-small">
                    <span className="erp-field-label">País</span>
                    <input
                      type="text"
                      className="erp-input-mono"
                      maxLength={2}
                      value={formFabricante.cuentaIbanPais}
                      onChange={(e) => updateFormFabricanteField("cuentaIbanPais", e.target.value)}
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {seccionFormActiva === "impuestos" && (
            <div className="erp-form-section">
              <div className="erp-form-group">
                <h4 className="erp-form-group-title">Configuración fiscal</h4>
                <div className="erp-form-row">
                  <label className="erp-field">
                    <span className="erp-field-label">Modo impuesto</span>
                    <select value={formFabricante.modoImpuesto} onChange={(e) => updateFormFabricanteField("modoImpuesto", e.target.value)}>
                      {modosImpuesto.map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </label>
                  <label className="erp-field">
                    <span className="erp-field-label">Retención</span>
                    <select value={formFabricante.retencion} onChange={(e) => updateFormFabricanteField("retencion", e.target.value)}>
                      {retenciones.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="erp-form-actions">
          <button type="submit" className="erp-btn erp-btn-primary">
            {formFabricante.id ? "Guardar cambios" : "Crear fabricante"}
          </button>
          <button type="button" className="erp-btn erp-btn-secondary" onClick={() => cerrarPestana(pestanaActiva)}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

export function FichaFabricante({ fabricantes, fabricanteId, abrirEditarFabricante }) {
  const fabricante = fabricantes.find(f => f.id === fabricanteId);
  const direcciones = fabricante?.direcciones || [];
  if (!fabricante) return <div className="erp-empty-state">Fabricante no encontrado</div>;

  return (
    <div className="erp-detail-view">
      <div className="erp-detail-header">
        <div className="erp-detail-title">
          <h2>{fabricante.nombreComercial}</h2>
          <span className="erp-detail-subtitle">{fabricante.nifCif || "Sin NIF/CIF"}</span>
        </div>
        <div className="erp-detail-actions">
          <button className="erp-btn erp-btn-secondary" onClick={() => abrirEditarFabricante(fabricante)}>
            ✏️ Editar
          </button>
        </div>
      </div>

      <div className="erp-detail-body">
        <section className="erp-detail-section">
          <h4 className="erp-section-title">Identificación</h4>
          <div className="erp-data-grid">
            <div className="erp-data-row">
              <span className="erp-data-label">Nombre comercial</span>
              <span className="erp-data-value">{fabricante.nombreComercial}</span>
            </div>
            <div className="erp-data-row">
              <span className="erp-data-label">Nombre fiscal</span>
              <span className="erp-data-value">{fabricante.nombreFiscal || "—"}</span>
            </div>
            <div className="erp-data-row">
              <span className="erp-data-label">NIF/CIF</span>
              <span className="erp-data-value erp-mono">{fabricante.nifCif || "—"}</span>
            </div>
          </div>
        </section>

        <section className="erp-detail-section">
          <h4 className="erp-section-title">Direcciones</h4>
          {direcciones.length === 0 && (
            <div className="erp-data-row">
              <span className="erp-data-value">Sin direcciones registradas</span>
            </div>
          )}
          {direcciones.length > 0 && (
            <div className="erp-direcciones-grid">
              {direcciones.map((dir, idx) => (
                <div key={`fabricante-dir-${idx}`} className="erp-card erp-card-bordered">
                  <div className="erp-card-header">
                    <strong>Dirección #{idx + 1}</strong>
                  </div>
                  <div className="erp-card-body">
                    <p>{dir.direccion || "—"}</p>
                    <p className="erp-mono">
                      {(dir.codigoPostal || "") + (dir.codigoPostal ? " " : "")}
                      {dir.poblacion || ""}
                    </p>
                    <p>{dir.provincia || ""} {dir.pais ? `(${dir.pais})` : ""}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="erp-detail-section">
          <h4 className="erp-section-title">Contacto</h4>
          <div className="erp-data-grid">
            <div className="erp-data-row">
              <span className="erp-data-label">Email</span>
              <span className="erp-data-value">{fabricante.email || "—"}</span>
            </div>
            <div className="erp-data-row">
              <span className="erp-data-label">Web</span>
              <span className="erp-data-value">{fabricante.web || "—"}</span>
            </div>
            <div className="erp-data-row">
              <span className="erp-data-label">Teléfono fijo</span>
              <span className="erp-data-value erp-mono">{fabricante.telefonoFijo || "—"}</span>
            </div>
            <div className="erp-data-row">
              <span className="erp-data-label">Teléfono móvil</span>
              <span className="erp-data-value erp-mono">{fabricante.telefonoMovil || "—"}</span>
            </div>
            <div className="erp-data-row">
              <span className="erp-data-label">Fax</span>
              <span className="erp-data-value erp-mono">{fabricante.fax || "—"}</span>
            </div>
          </div>
        </section>

        <section className="erp-detail-section">
          <h4 className="erp-section-title">Condiciones comerciales</h4>
          <div className="erp-data-grid">
            <div className="erp-data-row">
              <span className="erp-data-label">Fecha nacimiento</span>
              <span className="erp-data-value">{fabricante.fechaNacimiento || "—"}</span>
            </div>
            <div className="erp-data-row">
              <span className="erp-data-label">Agrupación</span>
              <span className="erp-data-value">{fabricante.agrupacion?.nombre || "Sin agrupación"}</span>
            </div>
            <div className="erp-data-row">
              <span className="erp-data-label">Tarifa</span>
              <span className="erp-data-value">{fabricante.tarifa || "—"}</span>
            </div>
            <div className="erp-data-row">
              <span className="erp-data-label">Descuento</span>
              <span className="erp-data-value">{fabricante.descuento ? `${fabricante.descuento}%` : "—"}</span>
            </div>
            <div className="erp-data-row">
              <span className="erp-data-label">Forma de pago</span>
              <span className="erp-data-value">{fabricante.formaPago || "—"}</span>
            </div>
            <div className="erp-data-row">
              <span className="erp-data-label">Días pago 1º</span>
              <span className="erp-data-value">{fabricante.diasPago1 || "—"}</span>
            </div>
            <div className="erp-data-row">
              <span className="erp-data-label">Días pago 2º</span>
              <span className="erp-data-value">{fabricante.diasPago2 || "—"}</span>
            </div>
            <div className="erp-data-row">
              <span className="erp-data-label">Riesgo autorizado</span>
              <span className="erp-data-value">{fabricante.riesgoAutorizado ? `${fabricante.riesgoAutorizado} €` : "—"}</span>
            </div>
            <div className="erp-data-row">
              <span className="erp-data-label">Bloquear ventas</span>
              <span className="erp-data-value">{fabricante.bloquearVentas ? "Sí" : "No"}</span>
            </div>
          </div>
        </section>

        <section className="erp-detail-section">
          <h4 className="erp-section-title">Datos bancarios</h4>
          <div className="erp-data-grid">
            <div className="erp-data-row">
              <span className="erp-data-label">Entidad bancaria</span>
              <span className="erp-data-value">{fabricante.nombreEntidadBancaria || "—"}</span>
            </div>
            <div className="erp-data-row">
              <span className="erp-data-label">CCC</span>
              <span className="erp-data-value erp-mono">
                {fabricante.cuentaCccEntidad && fabricante.cuentaCccOficina && fabricante.cuentaCccDc && fabricante.cuentaCccNumero
                  ? `${fabricante.cuentaCccEntidad}-${fabricante.cuentaCccOficina}-${fabricante.cuentaCccDc}-${fabricante.cuentaCccNumero}`
                  : "—"}
              </span>
            </div>
            <div className="erp-data-row">
              <span className="erp-data-label">IBAN</span>
              <span className="erp-data-value erp-mono">{fabricante.cuentaIban || "—"}</span>
            </div>
            <div className="erp-data-row">
              <span className="erp-data-label">País IBAN</span>
              <span className="erp-data-value erp-mono">{fabricante.cuentaIbanPais || "—"}</span>
            </div>
          </div>
        </section>

        <section className="erp-detail-section">
          <h4 className="erp-section-title">Configuración fiscal</h4>
          <div className="erp-data-grid">
            <div className="erp-data-row">
              <span className="erp-data-label">Modo impuesto</span>
              <span className="erp-data-value">{fabricante.modoImpuesto || "—"}</span>
            </div>
            <div className="erp-data-row">
              <span className="erp-data-label">Retención</span>
              <span className="erp-data-value">{fabricante.retencion || "—"}</span>
            </div>
          </div>
        </section>

        <section className="erp-detail-section">
          <h4 className="erp-section-title">Observaciones</h4>
          <div className="erp-data-grid">
            <div className="erp-data-row erp-data-row-full">
              <span className="erp-data-value erp-data-value-full">{fabricante.observaciones || "Sin observaciones"}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
