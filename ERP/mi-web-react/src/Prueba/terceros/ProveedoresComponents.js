import React, { useEffect, useMemo, useState } from "react";
import { IconEye, IconEdit, IconDelete, IconSearch } from "../iconos";
import {
  SECCIONES_FILTRO,
  buildCamposFiltroTerceros,
  crearFiltrosIniciales,
  pasaFiltrosAvanzados,
} from "./filtrosTercerosConfig";

const EMPTY_ARRAY = [];

export function ListaProveedores({
  proveedores,
  abrirNuevoProveedor,
  abrirVerProveedor,
  abrirEditarProveedor,
  borrarProveedor,
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

  const proveedoresFiltrados = useMemo(() => {
    if (!Array.isArray(proveedores)) return [];

    return proveedores.filter((proveedor) => {
      const referencia = proveedor?.id?.toString().toLowerCase() || "";
      const nombre = `${proveedor?.nombreComercial || ""} ${proveedor?.nombreFiscal || ""}`.toLowerCase();
      const nif = (proveedor?.nifCif || "").toLowerCase();
      const coincideTexto =
        !termino ||
        referencia.includes(termino) ||
        nombre.includes(termino) ||
        nif.includes(termino);

      if (!coincideTexto) return false;

      if (!pasaFiltrosAvanzados(proveedor, filtrosAvanzados, camposFiltro)) return false;

      return true;
    });
  }, [proveedores, termino, filtrosAvanzados, camposFiltro]);

  return (
    <div className="erp-list-view">
      <div className="erp-list-toolbar">
        <div
          className="erp-toolbar-inline"
          style={{ display: "flex", gap: "12px", alignItems: "center", width: "100%" }}
        >
          <button className="erp-btn erp-btn-primary" onClick={abrirNuevoProveedor}>
            + Nuevo Proveedor
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
            <th className="erp-th-actions">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {proveedoresFiltrados.map((p) => (
            <tr key={p.id} onDoubleClick={() => abrirVerProveedor(p)}>
              <td className="erp-td-mono">{p.id}</td>
              <td className="erp-td-main">{p.nombreComercial || p.nombre || "—"}</td>
              <td className="erp-td-mono">{p.nifCif || "—"}</td>
              <td>{p.email || "—"}</td>
              <td className="erp-td-mono">{p.telefonoMovil || p.telefono || "—"}</td>
              <td className="erp-td-actions">
                <button className="erp-action-btn" onClick={() => abrirVerProveedor(p)} title="Ver">
                  <IconEye className="erp-action-icon" />
                </button>
                <button className="erp-action-btn" onClick={() => abrirEditarProveedor(p)} title="Editar">
                  <IconEdit className="erp-action-icon" />
                </button>
                <button className="erp-action-btn erp-action-danger" onClick={() => borrarProveedor(p.id)} title="Eliminar">
                  <IconDelete className="erp-action-icon" />
                </button>
              </td>
            </tr>
          ))}
          {proveedoresFiltrados.length === 0 && (
            <tr><td colSpan="6" className="erp-td-empty">No hay proveedores que coincidan con la búsqueda o filtros</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export function FormularioProveedor({
  formProveedor,
  seccionFormActiva,
  setSeccionFormActiva,
  agrupacionesDisponibles,
  updateFormProveedorField,
  agregarDireccion,
  actualizarDireccion,
  eliminarDireccion,
  guardarProveedor,
  cerrarPestana,
  pestanaActiva,
  formasPago,
  tarifas,
  modosImpuesto,
  retenciones,
}) {
  return (
    <div className="erp-form-view">
      <form onSubmit={guardarProveedor}>
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
                      value={formProveedor.nombreComercial}
                      onChange={(e) => updateFormProveedorField("nombreComercial", e.target.value)}
                      required
                    />
                  </label>
                  <label className="erp-field">
                    <span className="erp-field-label">Nombre fiscal</span>
                    <input
                      type="text"
                      maxLength={200}
                      value={formProveedor.nombreFiscal}
                      onChange={(e) => updateFormProveedorField("nombreFiscal", e.target.value)}
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
                      value={formProveedor.nifCif}
                      onChange={(e) => updateFormProveedorField("nifCif", e.target.value)}
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
                  {(formProveedor.direcciones || []).map((dir, index) => (
                    <div key={`direccion-proveedor-${index}`} className="erp-card erp-card-bordered">
                      <div className="erp-card-header">
                        <strong>{index === 0 ? 'Dirección de facturación' : `Dirección #${index}`}</strong>
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
                      value={formProveedor.email}
                      onChange={(e) => updateFormProveedorField("email", e.target.value)}
                      required
                    />
                  </label>
                  <label className="erp-field">
                    <span className="erp-field-label">Web</span>
                    <input
                      type="text"
                      maxLength={2048}
                      value={formProveedor.web}
                      onChange={(e) => updateFormProveedorField("web", e.target.value)}
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
                      value={formProveedor.telefonoFijo}
                      onChange={(e) => updateFormProveedorField("telefonoFijo", e.target.value)}
                    />
                  </label>
                  <label className="erp-field">
                    <span className="erp-field-label">Teléfono móvil</span>
                    <input
                      type="text"
                      className="erp-input-mono"
                      maxLength={20}
                      value={formProveedor.telefonoMovil}
                      onChange={(e) => updateFormProveedorField("telefonoMovil", e.target.value)}
                    />
                  </label>
                  <label className="erp-field">
                    <span className="erp-field-label">Fax</span>
                    <input
                      type="text"
                      className="erp-input-mono"
                      maxLength={20}
                      value={formProveedor.fax}
                      onChange={(e) => updateFormProveedorField("fax", e.target.value)}
                    />
                  </label>
                </div>
              </div>

              <div className="erp-form-group">
                <h4 className="erp-form-group-title">Observaciones</h4>
                <label className="erp-field erp-field-full">
                  <textarea
                    rows="3"
                    value={formProveedor.observaciones}
                    onChange={(e) => updateFormProveedorField("observaciones", e.target.value)}
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
                      value={formProveedor.fechaNacimiento}
                      onChange={(e) => updateFormProveedorField("fechaNacimiento", e.target.value)}
                    />
                  </label>
                  <label className="erp-field">
                    <span className="erp-field-label">Agrupación</span>
                    <select
                      value={formProveedor.agrupacionId}
                      onChange={(e) => updateFormProveedorField("agrupacionId", e.target.value)}
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
                    <select value={formProveedor.tarifa} onChange={(e) => updateFormProveedorField("tarifa", e.target.value)}>
                      {tarifas.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </label>
                  <label className="erp-field">
                    <span className="erp-field-label">Descuento (%)</span>
                    <input
                      type="number"
                      step="0.01"
                      className="erp-input-mono"
                      value={formProveedor.descuento}
                      onChange={(e) => updateFormProveedorField("descuento", e.target.value)}
                    />
                  </label>
                  <label className="erp-field">
                    <span className="erp-field-label">Forma de pago</span>
                    <select value={formProveedor.formaPago} onChange={(e) => updateFormProveedorField("formaPago", e.target.value)}>
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
                      value={formProveedor.diasPago1}
                      onChange={(e) => updateFormProveedorField("diasPago1", e.target.value)}
                    />
                  </label>
                  <label className="erp-field">
                    <span className="erp-field-label">Días pago 2º</span>
                    <input
                      type="number"
                      className="erp-input-mono"
                      value={formProveedor.diasPago2}
                      onChange={(e) => updateFormProveedorField("diasPago2", e.target.value)}
                    />
                  </label>
                  <label className="erp-field">
                    <span className="erp-field-label">Riesgo autorizado (€)</span>
                    <input
                      type="number"
                      step="0.01"
                      className="erp-input-mono"
                      value={formProveedor.riesgoAutorizado}
                      onChange={(e) => updateFormProveedorField("riesgoAutorizado", e.target.value)}
                    />
                  </label>
                </div>
                <label className="erp-checkbox">
                  <input
                    type="checkbox"
                    checked={formProveedor.bloquearVentas}
                    onChange={(e) => updateFormProveedorField("bloquearVentas", e.target.checked)}
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
                    value={formProveedor.nombreEntidadBancaria}
                    onChange={(e) => updateFormProveedorField("nombreEntidadBancaria", e.target.value)}
                  />
                </label>
                <div className="erp-form-row erp-form-row-4">
                  <label className="erp-field">
                    <span className="erp-field-label">Entidad</span>
                    <input
                      type="text"
                      className="erp-input-mono"
                      maxLength={4}
                      value={formProveedor.cuentaCccEntidad}
                      onChange={(e) => updateFormProveedorField("cuentaCccEntidad", e.target.value)}
                    />
                  </label>
                  <label className="erp-field">
                    <span className="erp-field-label">Oficina</span>
                    <input
                      type="text"
                      className="erp-input-mono"
                      maxLength={4}
                      value={formProveedor.cuentaCccOficina}
                      onChange={(e) => updateFormProveedorField("cuentaCccOficina", e.target.value)}
                    />
                  </label>
                  <label className="erp-field">
                    <span className="erp-field-label">DC</span>
                    <input
                      type="text"
                      className="erp-input-mono"
                      maxLength={2}
                      value={formProveedor.cuentaCccDc}
                      onChange={(e) => updateFormProveedorField("cuentaCccDc", e.target.value)}
                    />
                  </label>
                  <label className="erp-field">
                    <span className="erp-field-label">Nº Cuenta</span>
                    <input
                      type="text"
                      className="erp-input-mono"
                      maxLength={10}
                      value={formProveedor.cuentaCccNumero}
                      onChange={(e) => updateFormProveedorField("cuentaCccNumero", e.target.value)}
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
                      value={formProveedor.cuentaIban}
                      onChange={(e) => updateFormProveedorField("cuentaIban", e.target.value)}
                    />
                  </label>
                  <label className="erp-field erp-field-small">
                    <span className="erp-field-label">País</span>
                    <input
                      type="text"
                      className="erp-input-mono"
                      maxLength={2}
                      value={formProveedor.cuentaIbanPais}
                      onChange={(e) => updateFormProveedorField("cuentaIbanPais", e.target.value)}
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
                    <select value={formProveedor.modoImpuesto} onChange={(e) => updateFormProveedorField("modoImpuesto", e.target.value)}>
                      {modosImpuesto.map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </label>
                  <label className="erp-field">
                    <span className="erp-field-label">Retención</span>
                    <select value={formProveedor.retencion} onChange={(e) => updateFormProveedorField("retencion", e.target.value)}>
                      {retenciones.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </label>
                </div>
                <label className="erp-checkbox" style={{ marginTop: '12px' }}>
                  <input
                    type="checkbox"
                    checked={!!formProveedor.recargoEquivalencia}
                    onChange={(e) => updateFormProveedorField("recargoEquivalencia", e.target.checked)}
                  />
                  <span>Proveedor sujeto a recargo de equivalencia</span>
                </label>
              </div>
            </div>
          )}
        </div>

        <div className="erp-form-actions">
          <button type="submit" className="erp-btn erp-btn-primary">
            {formProveedor.id ? "Guardar cambios" : "Crear proveedor"}
          </button>
          <button type="button" className="erp-btn erp-btn-secondary" onClick={() => cerrarPestana(pestanaActiva)}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

export function FichaProveedor({ proveedores, proveedorId, abrirEditarProveedor }) {
  const proveedor = proveedores.find(p => p.id === proveedorId);
  const direcciones = proveedor?.direcciones || [];
  if (!proveedor) return <div className="erp-empty-state">Proveedor no encontrado</div>;

  return (
    <div className="erp-detail-view">
      <div className="erp-detail-header">
        <div className="erp-detail-title">
          <h2>{proveedor.nombreComercial}</h2>
          <span className="erp-detail-subtitle">{proveedor.nifCif || "Sin NIF/CIF"}</span>
        </div>
        <div className="erp-detail-actions">
          <button className="erp-btn erp-btn-secondary" onClick={() => abrirEditarProveedor(proveedor)}>
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
              <span className="erp-data-value">{proveedor.nombreComercial}</span>
            </div>
            <div className="erp-data-row">
              <span className="erp-data-label">Nombre fiscal</span>
              <span className="erp-data-value">{proveedor.nombreFiscal || "—"}</span>
            </div>
            <div className="erp-data-row">
              <span className="erp-data-label">NIF/CIF</span>
              <span className="erp-data-value erp-mono">{proveedor.nifCif || "—"}</span>
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
                <div key={`dir-${idx}`} className="erp-card erp-card-bordered">
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
              <span className="erp-data-value">{proveedor.email || "—"}</span>
            </div>
            <div className="erp-data-row">
              <span className="erp-data-label">Web</span>
              <span className="erp-data-value">{proveedor.web || "—"}</span>
            </div>
            <div className="erp-data-row">
              <span className="erp-data-label">Teléfono fijo</span>
              <span className="erp-data-value erp-mono">{proveedor.telefonoFijo || "—"}</span>
            </div>
            <div className="erp-data-row">
              <span className="erp-data-label">Teléfono móvil</span>
              <span className="erp-data-value erp-mono">{proveedor.telefonoMovil || "—"}</span>
            </div>
            <div className="erp-data-row">
              <span className="erp-data-label">Fax</span>
              <span className="erp-data-value erp-mono">{proveedor.fax || "—"}</span>
            </div>
          </div>
        </section>

        <section className="erp-detail-section">
          <h4 className="erp-section-title">Condiciones comerciales</h4>
          <div className="erp-data-grid">
            <div className="erp-data-row">
              <span className="erp-data-label">Fecha nacimiento</span>
              <span className="erp-data-value">{proveedor.fechaNacimiento || "—"}</span>
            </div>
            <div className="erp-data-row">
              <span className="erp-data-label">Agrupación</span>
              <span className="erp-data-value">{proveedor.agrupacion?.nombre || "Sin agrupación"}</span>
            </div>
            <div className="erp-data-row">
              <span className="erp-data-label">Tarifa</span>
              <span className="erp-data-value">{proveedor.tarifa || "—"}</span>
            </div>
            <div className="erp-data-row">
              <span className="erp-data-label">Descuento</span>
              <span className="erp-data-value">{proveedor.descuento ? `${proveedor.descuento}%` : "—"}</span>
            </div>
            <div className="erp-data-row">
              <span className="erp-data-label">Forma de pago</span>
              <span className="erp-data-value">{proveedor.formaPago || "—"}</span>
            </div>
            <div className="erp-data-row">
              <span className="erp-data-label">Días pago 1º</span>
              <span className="erp-data-value">{proveedor.diasPago1 || "—"}</span>
            </div>
            <div className="erp-data-row">
              <span className="erp-data-label">Días pago 2º</span>
              <span className="erp-data-value">{proveedor.diasPago2 || "—"}</span>
            </div>
            <div className="erp-data-row">
              <span className="erp-data-label">Riesgo autorizado</span>
              <span className="erp-data-value">{proveedor.riesgoAutorizado ? `${proveedor.riesgoAutorizado} €` : "—"}</span>
            </div>
            <div className="erp-data-row">
              <span className="erp-data-label">Bloquear ventas</span>
              <span className="erp-data-value">{proveedor.bloquearVentas ? "Sí" : "No"}</span>
            </div>
          </div>
        </section>

        <section className="erp-detail-section">
          <h4 className="erp-section-title">Datos bancarios</h4>
          <div className="erp-data-grid">
            <div className="erp-data-row">
              <span className="erp-data-label">Entidad bancaria</span>
              <span className="erp-data-value">{proveedor.nombreEntidadBancaria || "—"}</span>
            </div>
            <div className="erp-data-row">
              <span className="erp-data-label">CCC</span>
              <span className="erp-data-value erp-mono">
                {proveedor.cuentaCccEntidad && proveedor.cuentaCccOficina && proveedor.cuentaCccDc && proveedor.cuentaCccNumero
                  ? `${proveedor.cuentaCccEntidad}-${proveedor.cuentaCccOficina}-${proveedor.cuentaCccDc}-${proveedor.cuentaCccNumero}`
                  : "—"}
              </span>
            </div>
            <div className="erp-data-row">
              <span className="erp-data-label">IBAN</span>
              <span className="erp-data-value erp-mono">{proveedor.cuentaIban || "—"}</span>
            </div>
            <div className="erp-data-row">
              <span className="erp-data-label">País IBAN</span>
              <span className="erp-data-value erp-mono">{proveedor.cuentaIbanPais || "—"}</span>
            </div>
          </div>
        </section>

        <section className="erp-detail-section">
          <h4 className="erp-section-title">Configuración fiscal</h4>
          <div className="erp-data-grid">
            <div className="erp-data-row">
              <span className="erp-data-label">Modo impuesto</span>
              <span className="erp-data-value">{proveedor.modoImpuesto || "—"}</span>
            </div>
            <div className="erp-data-row">
              <span className="erp-data-label">Retención</span>
              <span className="erp-data-value">{proveedor.retencion || "—"}</span>
            </div>
          </div>
        </section>

        <section className="erp-detail-section">
          <h4 className="erp-section-title">Observaciones</h4>
          <div className="erp-data-grid">
            <div className="erp-data-row erp-data-row-full">
              <span className="erp-data-value erp-data-value-full">{proveedor.observaciones || "Sin observaciones"}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
