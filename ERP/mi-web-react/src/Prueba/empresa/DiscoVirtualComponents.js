import React from "react";
import {
  IconFolder,
  IconUpload,
  IconFolderOpen,
  IconEdit,
  IconDelete,
  IconDownload,
  IconBack,
  IconLocation,
  IconDocument,
  IconCsv,
  IconImage
} from "../iconos";

export function VistaDiscoVirtual({
  archivos,
  rutaActual,
  archivoSubir,
  setArchivoSubir,
  setMostrarModalCarpeta,
  subirArchivo,
  descargarArchivo,
  eliminarArchivo,
  abrirModalRenombrar,
  navegarCarpeta,
  irAtras,
  formatearTamano,
}) {
  const obtenerIcono = (archivo) => {
    if (archivo.esCarpeta) return <IconFolder className="erp-action-icon" />;
    const ext = archivo.nombre.split(".").pop().toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp"].includes(ext)) return <IconImage className="erp-action-icon" />;
    if (["pdf"].includes(ext)) return <IconDocument className="erp-action-icon" />;
    if (["doc", "docx"].includes(ext)) return <IconDocument className="erp-action-icon" />;
    if (["xls", "xlsx"].includes(ext)) return <IconCsv className="erp-action-icon" />;
    if (["zip", "rar", "7z"].includes(ext)) return <IconFolderOpen className="erp-action-icon" />;
    return <IconDocument className="erp-action-icon" />;
  };

  return (
    <div className="erp-list-view">
      <div className="erp-list-toolbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            className="erp-btn erp-btn-secondary" 
            onClick={irAtras} 
            disabled={rutaActual === "/"}
          >
            <IconBack className="erp-action-icon" /> Atrás
          </button>
          <span style={{ fontFamily: 'var(--erp-font-mono)', fontSize: '13px', color: 'var(--erp-text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <IconLocation className="erp-action-icon" /> {rutaActual}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button className="erp-btn erp-btn-primary" onClick={() => setMostrarModalCarpeta(true)}>
            <IconFolder className="erp-action-icon" /> Nueva Carpeta
          </button>
          <label className="erp-btn erp-btn-secondary" style={{ cursor: 'pointer' }}>
            <IconUpload className="erp-action-icon" /> Subir Archivo
            <input
              type="file"
              onChange={(e) => setArchivoSubir(e.target.files[0])}
              style={{ display: "none" }}
            />
          </label>
        </div>
      </div>

      {archivoSubir && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px', 
          padding: '12px 16px', 
          background: '#eff6ff', 
          borderRadius: '8px', 
          marginBottom: '16px',
          border: '1px solid #3b82f6'
        }}>
          <span style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px' }}><IconDocument className="erp-action-icon" /> {archivoSubir.name}</span>
          <button className="erp-btn erp-btn-primary" onClick={subirArchivo}>
            ✓ Confirmar subida
          </button>
          <button className="erp-btn erp-btn-secondary" onClick={() => setArchivoSubir(null)}>
            ✕ Cancelar
          </button>
        </div>
      )}

      {archivos.length === 0 ? (
        <div className="erp-empty-state">
          <div className="erp-empty-icon">
            <IconFolder className="erp-action-icon" />
          </div>
          <h3>Esta carpeta está vacía</h3>
          <p>Crea una carpeta o sube archivos para comenzar</p>
        </div>
      ) : (
        <table className="erp-table">
          <thead>
            <tr>
              <th style={{ width: '50px' }}>Tipo</th>
              <th>Nombre</th>
              <th>Tamaño</th>
              <th>Fecha</th>
              <th className="erp-th-actions">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {archivos.map((archivo) => (
              <tr 
                key={archivo.id} 
                onDoubleClick={() => archivo.esCarpeta && navegarCarpeta(archivo)}
                style={{ cursor: archivo.esCarpeta ? 'pointer' : 'default' }}
              >
                <td style={{ fontSize: '20px', textAlign: 'center' }}>{obtenerIcono(archivo)}</td>
                <td className="erp-td-main">{archivo.nombre}</td>
                <td className="erp-td-mono">{formatearTamano(archivo.tamanoBytes)}</td>
                <td className="erp-td-mono">{archivo.fechaCreacion ? new Date(archivo.fechaCreacion).toLocaleDateString() : "—"}</td>
                <td className="erp-td-actions">
                  {archivo.esCarpeta ? (
                    <>
                      <button className="erp-action-btn" onClick={() => navegarCarpeta(archivo)} title="Abrir">
                        <IconFolderOpen className="erp-action-icon" />
                      </button>
                      <button className="erp-action-btn" onClick={() => abrirModalRenombrar(archivo)} title="Renombrar">
                        <IconEdit className="erp-action-icon" />
                      </button>
                      <button className="erp-action-btn erp-action-danger" onClick={() => eliminarArchivo(archivo.id, archivo.nombre, true)} title="Eliminar">
                        <IconDelete className="erp-action-icon" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="erp-action-btn" onClick={() => descargarArchivo(archivo.id, archivo.nombre)} title="Descargar">
                        <IconDownload className="erp-action-icon" />
                      </button>
                      <button className="erp-action-btn" onClick={() => abrirModalRenombrar(archivo)} title="Renombrar">
                        <IconEdit className="erp-action-icon" />
                      </button>
                      <button className="erp-action-btn erp-action-danger" onClick={() => eliminarArchivo(archivo.id, archivo.nombre, false)} title="Eliminar">
                        <IconDelete className="erp-action-icon" />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export function ModalNuevaCarpeta({
  mostrarModalCarpeta,
  nombreNuevaCarpeta,
  setNombreNuevaCarpeta,
  crearCarpeta,
  cerrarModalCarpeta,
}) {
  if (!mostrarModalCarpeta) return null;

  return (
    <div className="erp-modal-overlay" onClick={cerrarModalCarpeta}>
      <div className="erp-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
        <div className="erp-modal-header">
          <h3>📁 Nueva Carpeta</h3>
          <button className="erp-modal-close" onClick={cerrarModalCarpeta}>×</button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); crearCarpeta(); }}>
          <div className="erp-modal-body">
            <label className="erp-field">
              <span className="erp-field-label">Nombre de la carpeta</span>
              <input
                type="text"
                value={nombreNuevaCarpeta}
                onChange={(e) => setNombreNuevaCarpeta(e.target.value)}
                placeholder="Nombre de la carpeta"
                autoFocus
                required
              />
            </label>
          </div>
          <div className="erp-modal-footer">
            <button type="button" className="erp-btn erp-btn-secondary" onClick={cerrarModalCarpeta}>
              Cancelar
            </button>
            <button type="submit" className="erp-btn erp-btn-primary">
              Crear
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ModalRenombrar({
  mostrarModalRenombrar,
  nuevoNombre,
  setNuevoNombre,
  renombrar,
  cerrarModalRenombrar,
}) {
  if (!mostrarModalRenombrar) return null;

  return (
    <div className="erp-modal-overlay" onClick={cerrarModalRenombrar}>
      <div className="erp-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
        <div className="erp-modal-header">
          <h3>✏️ Renombrar</h3>
          <button className="erp-modal-close" onClick={cerrarModalRenombrar}>×</button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); renombrar(); }}>
          <div className="erp-modal-body">
            <label className="erp-field">
              <span className="erp-field-label">Nuevo nombre</span>
              <input
                type="text"
                value={nuevoNombre}
                onChange={(e) => setNuevoNombre(e.target.value)}
                placeholder="Nuevo nombre"
                autoFocus
                required
              />
            </label>
          </div>
          <div className="erp-modal-footer">
            <button type="button" className="erp-btn erp-btn-secondary" onClick={cerrarModalRenombrar}>
              Cancelar
            </button>
            <button type="submit" className="erp-btn erp-btn-primary">
              Renombrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
