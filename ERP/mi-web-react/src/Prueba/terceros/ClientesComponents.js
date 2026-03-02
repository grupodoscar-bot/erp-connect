import React, { useEffect, useMemo, useState } from "react";
import { IconEye, IconEdit, IconDelete, IconSearch } from "../iconos";
import {
  SECCIONES_FILTRO,
  buildCamposFiltroTerceros,
  crearFiltrosIniciales,
  pasaFiltrosAvanzados,
} from "./filtrosTercerosConfig";

const EMPTY_ARRAY = [];

export function ListaClientes({
  clientes,
  abrirNuevoCliente,
  abrirVerCliente,
  abrirEditarCliente,
  borrarCliente,
  agrupacionesDisponibles = EMPTY_ARRAY,
  tarifas = EMPTY_ARRAY,
  modosImpuesto = EMPTY_ARRAY,
  retenciones = EMPTY_ARRAY,
}) {
  const [busqueda, setBusqueda] = useState("");
  const termino = busqueda.trim().toLowerCase();

  const [mostrarFiltrosAvanzados, setMostrarFiltrosAvanzados] = useState(false);
  const camposFiltro = useMemo(
    () =>
      buildCamposFiltroTerceros({
        tarifas,
        modosImpuesto,
        retenciones,
        agrupaciones: agrupacionesDisponibles,
      }),
    [tarifas, modosImpuesto, retenciones, agrupacionesDisponibles]
  );
  const [filtrosAvanzados, setFiltrosAvanzados] = useState(() => crearFiltrosIniciales(camposFiltro));

  useEffect(() => {
    setFiltrosAvanzados((prev) => {
      const valoresPrevios = prev || {};
      const base = crearFiltrosIniciales(camposFiltro);
      Object.keys(base).forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(valoresPrevios, key)) {
          base[key] = valoresPrevios[key];
        }
      });
      return base;
    });
  }, [camposFiltro]);

  const filtrosActivos = useMemo(
    () =>
      Object.values(filtrosAvanzados).filter(
        (valor) => valor !== "" && valor !== null && valor !== undefined
      ).length,
    [filtrosAvanzados]
  );

  const actualizarFiltro = (clave, valor) => {
    setFiltrosAvanzados((prev) => ({
      ...prev,
      [clave]: valor,
    }));
  };

  const renderCampoFiltro = (campo) => {
    const valor = filtrosAvanzados[campo.key] ?? "";
    if (campo.type === "select" && campo.options) {
      return (
        <label className="erp-field" key={campo.key}>
          <span className="erp-field-label">{campo.label}</span>
          <select value={valor} onChange={(e) => actualizarFiltro(campo.key, e.target.value)}>
            {campo.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      );
    }

    const inputProps = campo.inputProps || {};
    const { type = "text", ...restInputProps } = inputProps;

    return (
      <label className="erp-field" key={campo.key}>
        <span className="erp-field-label">{campo.label}</span>
        <input
          type={type}
          placeholder={campo.placeholder}
          value={valor}
          onChange={(e) => actualizarFiltro(campo.key, e.target.value)}
          {...restInputProps}
        />
      </label>
    );
  };

  const renderPanelFiltros = () => (
    <div className="erp-filters-panel erp-filters-panel-large">
      {SECCIONES_FILTRO.map((seccion) => {
        const camposSeccion = camposFiltro.filter((campo) => campo.section === seccion.id);
        if (camposSeccion.length === 0) return null;
        return (
          <div className="erp-filter-section" key={seccion.id}>
            <h5 className="erp-filter-section-title">{seccion.titulo}</h5>
            <div className="erp-filters-grid">
              {camposSeccion.map((campo) => renderCampoFiltro(campo))}
            </div>
          </div>
        );
      })}
      <div className="erp-filters-actions">
        <button type="button" className="erp-btn erp-btn-secondary" onClick={() => limpiarFiltros()}>
          Limpiar filtros
        </button>
      </div>
    </div>
  );

  const limpiarFiltros = () => {
    setBusqueda("");
    setFiltrosAvanzados(crearFiltrosIniciales(camposFiltro));
  };

  const clientesFiltrados = useMemo(() => {
    if (!Array.isArray(clientes)) return [];

    return clientes.filter((cliente) => {
      const referencia = cliente?.id?.toString().toLowerCase() || "";
      const nombre = `${cliente?.nombreComercial || ""} ${cliente?.nombreFiscal || ""}`.toLowerCase();
      const nif = (cliente?.nifCif || "").toLowerCase();
      const coincideTexto =
        !termino ||
        referencia.includes(termino) ||
        nombre.includes(termino) ||
        nif.includes(termino);

      if (!coincideTexto) return false;
      if (!pasaFiltrosAvanzados(cliente, filtrosAvanzados, camposFiltro)) return false;

      return true;
    });
  }, [clientes, termino, filtrosAvanzados, camposFiltro]);

  return (
    <div className="erp-list-view">
      <div className="erp-list-toolbar">
        <div
          className="erp-toolbar-inline"
          style={{ display: "flex", gap: "12px", alignItems: "center", width: "100%" }}
        >
          <button className="erp-btn erp-btn-primary" onClick={abrirNuevoCliente}>
            + Nuevo Cliente
          </button>
          <div
            className="erp-toolbar-search"
            style={{ display: "flex", gap: "8px", alignItems: "center", flex: 1 }}
          >
            <input
              type="text"
              className="erp-search-input"
              placeholder="Buscar por referencia, nombre o NIF/CIF..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{ flex: 1 }}
            />
            <button
              type="button"
              className={`erp-btn ${mostrarFiltrosAvanzados ? "erp-btn-primary" : "erp-btn-secondary"}`}
              onClick={() => setMostrarFiltrosAvanzados(!mostrarFiltrosAvanzados)}
            >
              <IconSearch className="erp-action-icon" /> Filtros
              {filtrosActivos > 0 ? ` (${filtrosActivos})` : ""}
            </button>
          </div>
        </div>
      </div>
      {mostrarFiltrosAvanzados && renderPanelFiltros()}

      <table className="erp-table">
        <thead>
          <tr>
            <th>Referencia</th>
            <th>Nombre comercial</th>
            <th>NIF/CIF</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Agrupación</th>
            <th>Riesgo</th>
            <th>Recargo eq.</th>
            <th className="erp-th-actions">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clientesFiltrados.map((c) => (
            <tr key={c.id} onDoubleClick={() => abrirVerCliente(c)}>
              <td className="erp-td-mono">{c.id}</td>
              <td className="erp-td-main">{c.nombreComercial}</td>
              <td className="erp-td-mono">{c.nifCif || "—"}</td>
              <td>{c.email || "—"}</td>
              <td className="erp-td-mono">{c.telefonoMovil || c.telefonoFijo || "—"}</td>
              <td>
                {c.agrupacion ? (
                  <span className="erp-badge">{c.agrupacion.nombre}</span>
                ) : "—"}
              </td>
              <td className="erp-td-mono erp-td-right">
                {c.riesgoAutorizado ? `${c.riesgoAutorizado.toLocaleString()} €` : "—"}
              </td>
              <td>
                <span className={`erp-badge ${c.recargoEquivalencia ? "erp-badge-info" : "erp-badge-muted"}`}>
                  {c.recargoEquivalencia ? "Sí" : "No"}
                </span>
              </td>
              <td className="erp-td-actions">
                <button className="erp-action-btn" onClick={() => abrirVerCliente(c)} title="Ver">
                  <IconEye className="erp-action-icon" />
                </button>
                <button className="erp-action-btn" onClick={() => abrirEditarCliente(c)} title="Editar">
                  <IconEdit className="erp-action-icon" />
                </button>
                <button className="erp-action-btn erp-action-danger" onClick={() => borrarCliente(c.id)} title="Eliminar">
                  <IconDelete className="erp-action-icon" />
                </button>
              </td>
            </tr>
          ))}
          {clientesFiltrados.length === 0 && (
            <tr><td colSpan="7" className="erp-td-empty">No hay clientes que coincidan con la búsqueda o filtros</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export function FormularioCliente({
  formCliente,
  seccionFormActiva,
  setSeccionFormActiva,
  agrupacionesDisponibles,
  tarifasDisponibles = [],
  updateFormField,
  agregarDireccion,
  actualizarDireccion,
  eliminarDireccion,
  guardarCliente,
  cerrarPestana,
  pestanaActiva,
  formasPago,
  tarifas,
  modosImpuesto,
  retenciones,
  permitirMultitarifa = false,
}) {
  return (
    <div className="erp-form-view">
      <form onSubmit={guardarCliente}>
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
                      value={formCliente.nombreComercial}
                      onChange={(e) => updateFormField("nombreComercial", e.target.value)}
                      required
                    />
                  </label>
                  <label className="erp-field">
                    <span className="erp-field-label">Nombre fiscal</span>
                    <input
                      type="text"
                      maxLength={200}
                      value={formCliente.nombreFiscal}
                      onChange={(e) => updateFormField("nombreFiscal", e.target.value)}
                    />
                  </label>
                </div>
                <div className="erp-form-row erp-form-row-3">
                  <label className="erp-field">
                    <span className="erp-field-label">NIF/CIF</span>
                    <input
                      type="text"
                      className="erp-input-mono"
                      maxLength={20}
                      value={formCliente.nifCif}
                      onChange={(e) => updateFormField("nifCif", e.target.value)}
                    />
                  </label>
                </div>
                <div className="erp-form-row">
                  <label className="erp-field">
                    <span className="erp-field-label">Fecha nacimiento</span>
                    <input
                      type="date"
                      value={formCliente.fechaNacimiento}
                      onChange={(e) => updateFormField("fechaNacimiento", e.target.value)}
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
                    + Añadir dirección de envío
                  </button>
                </div>
                <div className="erp-direcciones-grid">
                  {(formCliente.direcciones || []).map((dir, index) => (
                    <div key={`direccion-${index}`} className="erp-card erp-card-bordered">
                      <div className="erp-card-header">
                        <strong>{index === 0 ? 'Dirección de facturación' : `Dirección de envío #${index}`}</strong>
                        {index > 0 && (
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
                      value={formCliente.email}
                      onChange={(e) => updateFormField("email", e.target.value)}
                      required
                    />
                  </label>
                  <label className="erp-field">
                    <span className="erp-field-label">Web</span>
                    <input
                      type="text"
                      maxLength={2048}
                      value={formCliente.web}
                      onChange={(e) => updateFormField("web", e.target.value)}
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
                      value={formCliente.telefonoFijo}
                      onChange={(e) => updateFormField("telefonoFijo", e.target.value)}
                    />
                  </label>
                  <label className="erp-field">
                    <span className="erp-field-label">Teléfono móvil</span>
                    <input
                      type="text"
                      className="erp-input-mono"
                      maxLength={20}
                      value={formCliente.telefonoMovil}
                      onChange={(e) => updateFormField("telefonoMovil", e.target.value)}
                    />
                  </label>
                  <label className="erp-field">
                    <span className="erp-field-label">Fax</span>
                    <input
                      type="text"
                      className="erp-input-mono"
                      maxLength={20}
                      value={formCliente.fax}
                      onChange={(e) => updateFormField("fax", e.target.value)}
                    />
                  </label>
                </div>
              </div>

              <div className="erp-form-group">
                <h4 className="erp-form-group-title">Observaciones</h4>
                <label className="erp-field erp-field-full">
                  <textarea
                    rows="3"
                    value={formCliente.observaciones}
                    onChange={(e) => updateFormField("observaciones", e.target.value)}
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
                    <span className="erp-field-label">Agrupación</span>
                    <select
                      value={formCliente.agrupacionId}
                      onChange={(e) => updateFormField("agrupacionId", e.target.value)}
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
                  {permitirMultitarifa && (
                    <label className="erp-field">
                      <span className="erp-field-label">Tarifa asignada</span>
                      <select value={formCliente.tarifaId} onChange={(e) => updateFormField("tarifaId", e.target.value)}>
                        <option value="">Tarifa general</option>
                        {tarifasDisponibles.filter(t => !t.esGeneral).map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.nombre}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                  <label className="erp-field">
                    <span className="erp-field-label">Tarifa (legacy)</span>
                    <select value={formCliente.tarifa} onChange={(e) => updateFormField("tarifa", e.target.value)}>
                      {tarifas.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </label>
                  <label className="erp-field">
                    <span className="erp-field-label">Descuento (%)</span>
                    <input
                      type="number"
                      step="0.01"
                      className="erp-input-mono"
                      value={formCliente.descuento}
                      onChange={(e) => updateFormField("descuento", e.target.value)}
                    />
                  </label>
                  <label className="erp-field">
                    <span className="erp-field-label">Forma de pago</span>
                    <select value={formCliente.formaPago} onChange={(e) => updateFormField("formaPago", e.target.value)}>
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
                      value={formCliente.diasPago1}
                      onChange={(e) => updateFormField("diasPago1", e.target.value)}
                    />
                  </label>
                  <label className="erp-field">
                    <span className="erp-field-label">Días pago 2º</span>
                    <input
                      type="number"
                      className="erp-input-mono"
                      value={formCliente.diasPago2}
                      onChange={(e) => updateFormField("diasPago2", e.target.value)}
                    />
                  </label>
                  <label className="erp-field">
                    <span className="erp-field-label">Riesgo autorizado (€)</span>
                    <input
                      type="number"
                      step="0.01"
                      className="erp-input-mono"
                      value={formCliente.riesgoAutorizado}
                      onChange={(e) => updateFormField("riesgoAutorizado", e.target.value)}
                    />
                  </label>
                </div>
                <label className="erp-checkbox">
                  <input
                    type="checkbox"
                    checked={formCliente.bloquearVentas}
                    onChange={(e) => updateFormField("bloquearVentas", e.target.checked)}
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
                    value={formCliente.nombreEntidadBancaria}
                    onChange={(e) => updateFormField("nombreEntidadBancaria", e.target.value)}
                  />
                </label>
                <div className="erp-form-row erp-form-row-4">
                  <label className="erp-field">
                    <span className="erp-field-label">Entidad</span>
                    <input
                      type="text"
                      className="erp-input-mono"
                      maxLength="4"
                      value={formCliente.cuentaCccEntidad}
                      onChange={(e) => updateFormField("cuentaCccEntidad", e.target.value)}
                    />
                  </label>
                  <label className="erp-field">
                    <span className="erp-field-label">Oficina</span>
                    <input
                      type="text"
                      className="erp-input-mono"
                      maxLength="4"
                      value={formCliente.cuentaCccOficina}
                      onChange={(e) => updateFormField("cuentaCccOficina", e.target.value)}
                    />
                  </label>
                  <label className="erp-field">
                    <span className="erp-field-label">DC</span>
                    <input
                      type="text"
                      className="erp-input-mono"
                      maxLength="2"
                      value={formCliente.cuentaCccDc}
                      onChange={(e) => updateFormField("cuentaCccDc", e.target.value)}
                    />
                  </label>
                  <label className="erp-field">
                    <span className="erp-field-label">Nº Cuenta</span>
                    <input
                      type="text"
                      className="erp-input-mono"
                      maxLength="10"
                      value={formCliente.cuentaCccNumero}
                      onChange={(e) => updateFormField("cuentaCccNumero", e.target.value)}
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
                      value={formCliente.cuentaIban}
                      onChange={(e) => updateFormField("cuentaIban", e.target.value)}
                    />
                  </label>
                  <label className="erp-field erp-field-small">
                    <span className="erp-field-label">País</span>
                    <input
                      type="text"
                      className="erp-input-mono"
                      maxLength="2"
                      value={formCliente.cuentaIbanPais}
                      onChange={(e) => updateFormField("cuentaIbanPais", e.target.value)}
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
                    <select value={formCliente.modoImpuesto} onChange={(e) => updateFormField("modoImpuesto", e.target.value)}>
                      {modosImpuesto.map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </label>
                  <label className="erp-field">
                    <span className="erp-field-label">Retención</span>
                    <select value={formCliente.retencion} onChange={(e) => updateFormField("retencion", e.target.value)}>
                      {retenciones.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </label>
                </div>
                <label className="erp-checkbox">
                  <input
                    type="checkbox"
                    checked={Boolean(formCliente.recargoEquivalencia)}
                    onChange={(e) => updateFormField("recargoEquivalencia", e.target.checked)}
                  />
                  <span>Este cliente está sujeto a recargo de equivalencia</span>
                </label>
              </div>
            </div>
          )}
        </div>

        <div className="erp-form-actions">
          <button type="submit" className="erp-btn erp-btn-primary">
            {formCliente.id ? "Guardar cambios" : "Crear cliente"}
          </button>
          <button type="button" className="erp-btn erp-btn-secondary" onClick={() => cerrarPestana(pestanaActiva)}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

export function FichaCliente({ clientes, clienteId, abrirEditarCliente, albaranes = [], abrirVerAlbaran }) {
  const [seccionActiva, setSeccionActiva] = React.useState("general");
  const cliente = clientes.find(c => c.id === clienteId);
  if (!cliente) return <div className="erp-empty-state">Cliente no encontrado</div>;

  const albaranesCliente = albaranes.filter(a => a.cliente?.id === clienteId);
  const direcciones = Array.isArray(cliente.direcciones) && cliente.direcciones.length > 0 
    ? cliente.direcciones 
    : [];

  return (
    <div className="erp-form-view">
      <div className="erp-detail-header">
        <div className="erp-detail-title">
          <h2>{cliente.nombreComercial}</h2>
          <span className="erp-detail-subtitle">{cliente.nifCif || "Sin NIF/CIF"}</span>
        </div>
        <div className="erp-detail-actions">
          <button className="erp-btn erp-btn-secondary" onClick={() => abrirEditarCliente(cliente)}>
            ✏️ Editar
          </button>
        </div>
      </div>

      <div className="erp-form-tabs">
        {["general", "comercial", "bancaria", "impuestos", "opc"].map(sec => (
          <button
            key={sec}
            type="button"
            className={`erp-form-tab ${seccionActiva === sec ? "active" : ""}`}
            onClick={() => setSeccionActiva(sec)}
          >
            {sec === "general" && "Datos Generales"}
            {sec === "comercial" && "Comercial"}
            {sec === "bancaria" && "Bancaria"}
            {sec === "impuestos" && "Impuestos"}
            {sec === "opc" && "OPC"}
          </button>
        ))}
      </div>

      <div className="erp-form-content">
        {seccionActiva === "general" && (
          <div className="erp-form-section">
            <div className="erp-form-group">
              <h4 className="erp-form-group-title">Identificación</h4>
              <div className="erp-form-row">
                <label className="erp-field">
                  <span className="erp-field-label">Nombre comercial *</span>
                  <input
                    type="text"
                    value={cliente.nombreComercial || ""}
                    disabled
                  />
                </label>
                <label className="erp-field">
                  <span className="erp-field-label">Nombre fiscal</span>
                  <input
                    type="text"
                    value={cliente.nombreFiscal || ""}
                    disabled
                  />
                </label>
              </div>
              <div className="erp-form-row erp-form-row-3">
                <label className="erp-field">
                  <span className="erp-field-label">NIF/CIF</span>
                  <input
                    type="text"
                    className="erp-input-mono"
                    value={cliente.nifCif || ""}
                    disabled
                  />
                </label>
              </div>
              <div className="erp-form-row">
                <label className="erp-field">
                  <span className="erp-field-label">Fecha nacimiento</span>
                  <input
                    type="date"
                    value={cliente.fechaNacimiento || ""}
                    disabled
                  />
                </label>
              </div>
            </div>

            <div className="erp-form-group">
              <div className="erp-form-group-title-row">
                <h4 className="erp-form-group-title">Direcciones</h4>
              </div>
              <div className="erp-direcciones-grid">
                {direcciones.length > 0 ? direcciones.map((dir, index) => (
                  <div key={`direccion-${index}`} className="erp-card erp-card-bordered">
                    <div className="erp-card-header">
                      <strong>{index === 0 ? 'Dirección de facturación' : `Dirección de envío #${index}`}</strong>
                    </div>
                    <div className="erp-form-row erp-form-row-2">
                      <label className="erp-field">
                        <span className="erp-field-label">País</span>
                        <input
                          type="text"
                          value={dir.pais || ""}
                          disabled
                        />
                      </label>
                      <label className="erp-field">
                        <span className="erp-field-label">Código postal</span>
                        <input
                          type="text"
                          className="erp-input-mono"
                          value={dir.codigoPostal || ""}
                          disabled
                        />
                      </label>
                    </div>
                    <div className="erp-form-row erp-form-row-2">
                      <label className="erp-field">
                        <span className="erp-field-label">Provincia</span>
                        <input
                          type="text"
                          value={dir.provincia || ""}
                          disabled
                        />
                      </label>
                      <label className="erp-field">
                        <span className="erp-field-label">Población</span>
                        <input
                          type="text"
                          value={dir.poblacion || ""}
                          disabled
                        />
                      </label>
                    </div>
                    <label className="erp-field erp-field-full">
                      <span className="erp-field-label">Dirección completa</span>
                      <textarea
                        rows="2"
                        value={dir.direccion || ""}
                        disabled
                      />
                    </label>
                  </div>
                )) : (
                  <div className="erp-card erp-card-bordered">
                    <div className="erp-card-header">
                      <strong>Dirección de facturación</strong>
                    </div>
                    <div className="erp-form-row erp-form-row-2">
                      <label className="erp-field">
                        <span className="erp-field-label">País</span>
                        <input type="text" value="" disabled />
                      </label>
                      <label className="erp-field">
                        <span className="erp-field-label">Código postal</span>
                        <input type="text" className="erp-input-mono" value="" disabled />
                      </label>
                    </div>
                    <div className="erp-form-row erp-form-row-2">
                      <label className="erp-field">
                        <span className="erp-field-label">Provincia</span>
                        <input type="text" value="" disabled />
                      </label>
                      <label className="erp-field">
                        <span className="erp-field-label">Población</span>
                        <input type="text" value="" disabled />
                      </label>
                    </div>
                    <label className="erp-field erp-field-full">
                      <span className="erp-field-label">Dirección completa</span>
                      <textarea rows="2" value="" disabled />
                    </label>
                  </div>
                )}
              </div>
            </div>

            <div className="erp-form-group">
              <h4 className="erp-form-group-title">Contacto</h4>
              <div className="erp-form-row">
                <label className="erp-field">
                  <span className="erp-field-label">Email *</span>
                  <input
                    type="email"
                    value={cliente.email || ""}
                    disabled
                  />
                </label>
                <label className="erp-field">
                  <span className="erp-field-label">Web</span>
                  <input
                    type="text"
                    value={cliente.web || ""}
                    disabled
                  />
                </label>
              </div>
              <div className="erp-form-row erp-form-row-3">
                <label className="erp-field">
                  <span className="erp-field-label">Teléfono fijo</span>
                  <input
                    type="text"
                    className="erp-input-mono"
                    value={cliente.telefonoFijo || ""}
                    disabled
                  />
                </label>
                <label className="erp-field">
                  <span className="erp-field-label">Teléfono móvil</span>
                  <input
                    type="text"
                    className="erp-input-mono"
                    value={cliente.telefonoMovil || ""}
                    disabled
                  />
                </label>
                <label className="erp-field">
                  <span className="erp-field-label">Fax</span>
                  <input
                    type="text"
                    className="erp-input-mono"
                    value={cliente.fax || ""}
                    disabled
                  />
                </label>
              </div>
            </div>

            <div className="erp-form-group">
              <h4 className="erp-form-group-title">Observaciones</h4>
              <label className="erp-field erp-field-full">
                <textarea
                  rows="3"
                  value={cliente.observaciones || ""}
                  disabled
                />
              </label>
            </div>
          </div>
        )}

        {seccionActiva === "comercial" && (
          <div className="erp-form-section">
            <div className="erp-form-group">
              <h4 className="erp-form-group-title">Condiciones comerciales</h4>
              <div className="erp-form-row">
                <label className="erp-field">
                  <span className="erp-field-label">Agrupación</span>
                  <input
                    type="text"
                    value={cliente.agrupacion?.nombre || "Sin agrupación"}
                    disabled
                  />
                </label>
              </div>
              <div className="erp-form-row erp-form-row-3">
                <label className="erp-field">
                  <span className="erp-field-label">Tarifa</span>
                  <input
                    type="text"
                    value={cliente.tarifa || "Normal"}
                    disabled
                  />
                </label>
                <label className="erp-field">
                  <span className="erp-field-label">Descuento (%)</span>
                  <input
                    type="number"
                    className="erp-input-mono"
                    value={cliente.descuento || 0}
                    disabled
                  />
                </label>
                <label className="erp-field">
                  <span className="erp-field-label">Forma de pago</span>
                  <input
                    type="text"
                    value={cliente.formaPago || "CONTADO"}
                    disabled
                  />
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
                    value={cliente.diasPago1 || 0}
                    disabled
                  />
                </label>
                <label className="erp-field">
                  <span className="erp-field-label">Días pago 2º</span>
                  <input
                    type="number"
                    className="erp-input-mono"
                    value={cliente.diasPago2 || 0}
                    disabled
                  />
                </label>
                <label className="erp-field">
                  <span className="erp-field-label">Riesgo autorizado (€)</span>
                  <input
                    type="number"
                    className="erp-input-mono"
                    value={cliente.riesgoAutorizado || 0}
                    disabled
                  />
                </label>
              </div>
              <label className="erp-checkbox">
                <input
                  type="checkbox"
                  checked={Boolean(cliente.bloquearVentas)}
                  disabled
                />
                <span>Bloquear ventas si supera el riesgo</span>
              </label>
            </div>
          </div>
        )}

        {seccionActiva === "bancaria" && (
          <div className="erp-form-section">
            <div className="erp-form-group">
              <h4 className="erp-form-group-title">Datos bancarios</h4>
              <label className="erp-field erp-field-half">
                <span className="erp-field-label">Entidad bancaria</span>
                <input
                  type="text"
                  value={cliente.nombreEntidadBancaria || ""}
                  disabled
                />
              </label>
              <div className="erp-form-row erp-form-row-4">
                <label className="erp-field">
                  <span className="erp-field-label">Entidad</span>
                  <input
                    type="text"
                    className="erp-input-mono"
                    value={cliente.cuentaCccEntidad || ""}
                    disabled
                  />
                </label>
                <label className="erp-field">
                  <span className="erp-field-label">Oficina</span>
                  <input
                    type="text"
                    className="erp-input-mono"
                    value={cliente.cuentaCccOficina || ""}
                    disabled
                  />
                </label>
                <label className="erp-field">
                  <span className="erp-field-label">DC</span>
                  <input
                    type="text"
                    className="erp-input-mono"
                    value={cliente.cuentaCccDc || ""}
                    disabled
                  />
                </label>
                <label className="erp-field">
                  <span className="erp-field-label">Nº Cuenta</span>
                  <input
                    type="text"
                    className="erp-input-mono"
                    value={cliente.cuentaCccNumero || ""}
                    disabled
                  />
                </label>
              </div>
              <div className="erp-form-row">
                <label className="erp-field">
                  <span className="erp-field-label">IBAN</span>
                  <input
                    type="text"
                    className="erp-input-mono"
                    value={cliente.cuentaIban || ""}
                    disabled
                  />
                </label>
                <label className="erp-field erp-field-small">
                  <span className="erp-field-label">País</span>
                  <input
                    type="text"
                    className="erp-input-mono"
                    value={cliente.cuentaIbanPais || ""}
                    disabled
                  />
                </label>
              </div>
            </div>
          </div>
        )}

        {seccionActiva === "impuestos" && (
          <div className="erp-form-section">
            <div className="erp-form-group">
              <h4 className="erp-form-group-title">Configuración fiscal</h4>
              <div className="erp-form-row">
                <label className="erp-field">
                  <span className="erp-field-label">Modo impuesto</span>
                  <input
                    type="text"
                    value={cliente.modoImpuesto || "Normal"}
                    disabled
                  />
                </label>
                <label className="erp-field">
                  <span className="erp-field-label">Retención</span>
                  <input
                    type="text"
                    value={cliente.retencion || "Exento 0%"}
                    disabled
                  />
                </label>
              </div>
              <label className="erp-checkbox">
                <input
                  type="checkbox"
                  checked={Boolean(cliente.recargoEquivalencia)}
                  disabled
                />
                <span>Este cliente está sujeto a recargo de equivalencia</span>
              </label>
            </div>
          </div>
        )}

        {seccionActiva === "opc" && (
          <div className="erp-form-section">
            <div className="erp-form-group">
              <h4 className="erp-form-group-title">Albaranes del cliente</h4>
              {albaranesCliente.length === 0 ? (
                <div className="erp-empty-state">
                  <p>No hay albaranes registrados para este cliente</p>
                </div>
              ) : (
                <table className="erp-table">
                  <thead>
                    <tr>
                      <th>Número</th>
                      <th>Fecha</th>
                      <th className="erp-th-right">Total</th>
                      <th>Estado</th>
                      <th>Contabilizado</th>
                      <th className="erp-th-actions">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {albaranesCliente.map((albaran) => (
                      <tr key={albaran.id} onDoubleClick={() => abrirVerAlbaran && abrirVerAlbaran(albaran)}>
                        <td className="erp-td-mono erp-td-main">{albaran.numero}</td>
                        <td className="erp-td-mono">{albaran.fecha}</td>
                        <td className="erp-td-mono erp-td-right">{albaran.total?.toFixed(2)} €</td>
                        <td>
                          <span className={`erp-badge ${
                            albaran.estado === "Entregado" ? "erp-badge-success" :
                            albaran.estado === "Cancelado" ? "erp-badge-danger" :
                            "erp-badge-warning"
                          }`}>
                            {albaran.estado}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {albaran.contabilizado ? (
                            <span className="erp-badge erp-badge-success">✓ Sí</span>
                          ) : (
                            <span className="erp-badge erp-badge-danger">✗ No</span>
                          )}
                        </td>
                        <td className="erp-td-actions">
                          {abrirVerAlbaran && (
                            <button 
                              className="erp-btn erp-btn-secondary erp-btn-sm" 
                              onClick={() => abrirVerAlbaran(albaran)}
                              title="Ver albarán"
                            >
                              👁️ Ver
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
