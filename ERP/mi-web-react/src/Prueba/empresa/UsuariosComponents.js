import React from "react";
import { IconEye, IconEdit, IconDelete } from "../iconos";

export function ListaUsuarios({
  usuarios,
  abrirNuevoUsuario,
  abrirVerUsuario,
  abrirEditarUsuario,
  borrarUsuario,
}) {
  return (
    <div className="erp-list-view">
      <div className="erp-list-toolbar">
        <button className="erp-btn erp-btn-primary" onClick={abrirNuevoUsuario}>
          + Nuevo Usuario
        </button>
        <div className="erp-search">
          <input type="text" placeholder="Buscar usuario..." />
        </div>
      </div>

      <table className="erp-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Usuario</th>
            <th>DNI</th>
            <th>Terceros</th>
            <th>Almacén</th>
            <th>Empresa</th>
            <th>Ventas</th>
            <th>TPV</th>
            <th>Config.</th>
            <th className="erp-th-actions">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u) => (
            <tr key={u.id} onDoubleClick={() => abrirVerUsuario(u)}>
              <td className="erp-td-mono">{u.id}</td>
              <td className="erp-td-main">{u.usuario}</td>
              <td className="erp-td-mono">{u.dni || "—"}</td>
              <td>{u.moduloTerceros ? <span className="erp-badge erp-badge-success">✓</span> : <span className="erp-badge erp-badge-danger">✗</span>}</td>
              <td>{u.moduloAlmacen ? <span className="erp-badge erp-badge-success">✓</span> : <span className="erp-badge erp-badge-danger">✗</span>}</td>
              <td>{u.moduloEmpresa ? <span className="erp-badge erp-badge-success">✓</span> : <span className="erp-badge erp-badge-danger">✗</span>}</td>
              <td>{u.moduloVentas ? <span className="erp-badge erp-badge-success">✓</span> : <span className="erp-badge erp-badge-danger">✗</span>}</td>
              <td>{u.moduloTpv ? <span className="erp-badge erp-badge-success">✓</span> : <span className="erp-badge erp-badge-danger">✗</span>}</td>
              <td>{u.moduloConfiguracion ? <span className="erp-badge erp-badge-success">✓</span> : <span className="erp-badge erp-badge-danger">✗</span>}</td>
              <td className="erp-td-actions">
                <button className="erp-action-btn" onClick={() => abrirVerUsuario(u)} title="Ver">
                  <IconEye className="erp-action-icon" />
                </button>
                <button className="erp-action-btn" onClick={() => abrirEditarUsuario(u)} title="Editar">
                  <IconEdit className="erp-action-icon" />
                </button>
                <button className="erp-action-btn erp-action-danger" onClick={() => borrarUsuario(u.id)} title="Eliminar">
                  <IconDelete className="erp-action-icon" />
                </button>
              </td>
            </tr>
          ))}
          {usuarios.length === 0 && (
            <tr><td colSpan="10" className="erp-td-empty">No hay usuarios</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export function FormularioUsuario({
  formUsuario,
  updateFormUsuarioField,
  guardarUsuario,
  cerrarPestana,
  pestanaActiva,
}) {
  return (
    <div className="erp-form-view">
      <form onSubmit={guardarUsuario}>
        <div className="erp-form-content">
          <div className="erp-form-section">
            <div className="erp-form-group">
              <h4 className="erp-form-group-title">Datos del usuario</h4>
              <div className="erp-form-row erp-form-row-3">
                <label className="erp-field">
                  <span className="erp-field-label">Usuario *</span>
                  <input
                    type="text"
                    value={formUsuario.usuario}
                    onChange={(e) => updateFormUsuarioField("usuario", e.target.value)}
                    required
                  />
                </label>
                <label className="erp-field">
                  <span className="erp-field-label">DNI *</span>
                  <input
                    type="text"
                    className="erp-input-mono"
                    value={formUsuario.dni}
                    onChange={(e) => updateFormUsuarioField("dni", e.target.value)}
                    required
                  />
                </label>
                <label className="erp-field">
                  <span className="erp-field-label">Contraseña *</span>
                  <input
                    type="text"
                    value={formUsuario.contrasena}
                    onChange={(e) => updateFormUsuarioField("contrasena", e.target.value)}
                    required
                  />
                </label>
              </div>
            </div>

            <div className="erp-form-group">
              <h4 className="erp-form-group-title">Permisos de módulos</h4>
              <div className="erp-permisos-grid">
                <label className="erp-checkbox">
                  <input
                    type="checkbox"
                    checked={formUsuario.moduloTerceros}
                    onChange={(e) => updateFormUsuarioField("moduloTerceros", e.target.checked)}
                  />
                  <span>Terceros</span>
                </label>
                <label className="erp-checkbox">
                  <input
                    type="checkbox"
                    checked={formUsuario.moduloAlmacen}
                    onChange={(e) => updateFormUsuarioField("moduloAlmacen", e.target.checked)}
                  />
                  <span>Almacén</span>
                </label>
                <label className="erp-checkbox">
                  <input
                    type="checkbox"
                    checked={formUsuario.moduloEmpresa}
                    onChange={(e) => updateFormUsuarioField("moduloEmpresa", e.target.checked)}
                  />
                  <span>Empresa</span>
                </label>
                <label className="erp-checkbox">
                  <input
                    type="checkbox"
                    checked={formUsuario.moduloVentas}
                    onChange={(e) => updateFormUsuarioField("moduloVentas", e.target.checked)}
                  />
                  <span>Ventas</span>
                </label>
                <label className="erp-checkbox">
                  <input
                    type="checkbox"
                    checked={formUsuario.moduloTpv}
                    onChange={(e) => updateFormUsuarioField("moduloTpv", e.target.checked)}
                  />
                  <span>TPV</span>
                </label>
                <label className="erp-checkbox">
                  <input
                    type="checkbox"
                    checked={formUsuario.moduloConfiguracion}
                    onChange={(e) => updateFormUsuarioField("moduloConfiguracion", e.target.checked)}
                  />
                  <span>Configuración</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="erp-form-actions">
          <button type="submit" className="erp-btn erp-btn-primary">
            {formUsuario.id ? "Guardar cambios" : "Crear usuario"}
          </button>
          <button type="button" className="erp-btn erp-btn-secondary" onClick={() => cerrarPestana(pestanaActiva)}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

export function FichaUsuario({ usuarios, usuarioId, abrirEditarUsuario }) {
  const usuario = usuarios.find(u => u.id === usuarioId);
  if (!usuario) return <div className="erp-empty-state">Usuario no encontrado</div>;

  return (
    <div className="erp-detail-view">
      <div className="erp-detail-header">
        <div className="erp-detail-title">
          <h2>{usuario.usuario}</h2>
          <span className="erp-detail-subtitle">ID: {usuario.id}</span>
        </div>
        <div className="erp-detail-actions">
          <button className="erp-btn erp-btn-secondary" onClick={() => abrirEditarUsuario(usuario)}>
            <IconEdit className="erp-action-icon" /> Editar
          </button>
        </div>
      </div>

      <div className="erp-detail-body">
        <section className="erp-detail-section">
          <h4 className="erp-section-title">Información del usuario</h4>
          <div className="erp-data-grid">
            <div className="erp-data-row">
              <span className="erp-data-label">Usuario</span>
              <span className="erp-data-value">{usuario.usuario}</span>
            </div>
            <div className="erp-data-row">
              <span className="erp-data-label">DNI</span>
              <span className="erp-data-value erp-mono">{usuario.dni || "—"}</span>
            </div>
          </div>
        </section>

        <section className="erp-detail-section">
          <h4 className="erp-section-title">Permisos</h4>
          <div className="erp-permisos-display">
            <div className="erp-permiso-item">
              <span>Terceros</span>
              {usuario.moduloTerceros ? <span className="erp-badge erp-badge-success">Activo</span> : <span className="erp-badge erp-badge-danger">Inactivo</span>}
            </div>
            <div className="erp-permiso-item">
              <span>Almacén</span>
              {usuario.moduloAlmacen ? <span className="erp-badge erp-badge-success">Activo</span> : <span className="erp-badge erp-badge-danger">Inactivo</span>}
            </div>
            <div className="erp-permiso-item">
              <span>Empresa</span>
              {usuario.moduloEmpresa ? <span className="erp-badge erp-badge-success">Activo</span> : <span className="erp-badge erp-badge-danger">Inactivo</span>}
            </div>
            <div className="erp-permiso-item">
              <span>Ventas</span>
              {usuario.moduloVentas ? <span className="erp-badge erp-badge-success">Activo</span> : <span className="erp-badge erp-badge-danger">Inactivo</span>}
            </div>
            <div className="erp-permiso-item">
              <span>TPV</span>
              {usuario.moduloTpv ? <span className="erp-badge erp-badge-success">Activo</span> : <span className="erp-badge erp-badge-danger">Inactivo</span>}
            </div>
            <div className="erp-permiso-item">
              <span>Configuración</span>
              {usuario.moduloConfiguracion ? <span className="erp-badge erp-badge-success">Activo</span> : <span className="erp-badge erp-badge-danger">Inactivo</span>}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
