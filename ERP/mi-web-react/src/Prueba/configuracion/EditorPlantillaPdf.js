import React, { useState, useEffect, useRef, useMemo } from "react";
import { IconDocument, IconRefresh } from "../iconos";

const layoutOptions = [
  { value: "horizontal", label: "Horizontal (3 columnas)" },
  { value: "vertical", label: "Vertical (apilado)" },
  { value: "empresa_arriba", label: "Empresa arriba" },
  { value: "cliente_arriba", label: "Cliente arriba" }
];

const tamanoFuenteOptions = [
  { value: "pequeño", label: "Pequeño" },
  { value: "normal", label: "Normal" },
  { value: "grande", label: "Grande" }
];

const estiloTablaOptions = [
  { value: "lineas", label: "Con líneas" },
  { value: "cebra", label: "Cebra (alternado)" },
  { value: "minimalista", label: "Minimalista" }
];

export function EditorPlantillaPdf({
  plantilla,
  guardarPlantilla,
  cerrarEditor,
  mensaje,
}) {
  const [tabActiva, setTabActiva] = useState("general");
  const [previewUrl, setPreviewUrl] = useState(null);
  const [cargandoPreview, setCargandoPreview] = useState(false);
  const [errorPreview, setErrorPreview] = useState("");
  const previewTimeoutRef = useRef(null);

  // Estados del formulario
  const [nombre, setNombre] = useState("");
  const [mostrarLogo, setMostrarLogo] = useState(true);
  const [mostrarEmpresa, setMostrarEmpresa] = useState(true);
  const [mostrarCliente, setMostrarCliente] = useState(true);
  const [mostrarDatosAlbaran, setMostrarDatosAlbaran] = useState(true);
  const [mostrarObservaciones, setMostrarObservaciones] = useState(true);
  const [mostrarPiePagina, setMostrarPiePagina] = useState(true);

  // Empresa
  const [empresaMostrarRazon, setEmpresaMostrarRazon] = useState(true);
  const [empresaMostrarCif, setEmpresaMostrarCif] = useState(true);
  const [empresaMostrarDireccion, setEmpresaMostrarDireccion] = useState(true);
  const [empresaMostrarTelefono, setEmpresaMostrarTelefono] = useState(true);
  const [empresaMostrarEmail, setEmpresaMostrarEmail] = useState(true);

  // Cliente
  const [clienteMostrarNif, setClienteMostrarNif] = useState(true);
  const [clienteMostrarDireccion, setClienteMostrarDireccion] = useState(true);
  const [clienteMostrarTelefono, setClienteMostrarTelefono] = useState(true);
  const [clienteMostrarEmail, setClienteMostrarEmail] = useState(true);

  // Productos
  const [productoMostrarReferencia, setProductoMostrarReferencia] = useState(true);
  const [productoMostrarDescuento, setProductoMostrarDescuento] = useState(true);
  const [productoMostrarSubtotal, setProductoMostrarSubtotal] = useState(true);
  const [productoMostrarObservaciones, setProductoMostrarObservaciones] = useState(true);

  // Layout
  const [layoutEmpresaCliente, setLayoutEmpresaCliente] = useState("horizontal");
  const [layoutTablaProductos, setLayoutTablaProductos] = useState("completa");

  // Estilos
  const [colorPrimario, setColorPrimario] = useState("#1a3161");
  const [tamanoFuente, setTamanoFuente] = useState("normal");
  const [estiloTabla, setEstiloTabla] = useState("lineas");

  // Textos
  const [textoTitulo, setTextoTitulo] = useState("ALBARÁN DE ENTREGA");
  const [textoPiePagina, setTextoPiePagina] = useState("Gracias por su confianza");

  // Paginación
  const [repetirEncabezados, setRepetirEncabezados] = useState(true);

  // Cargar datos de la plantilla
  useEffect(() => {
    if (plantilla) {
      setNombre(plantilla.nombre || "");
      setMostrarLogo(plantilla.mostrarLogo ?? true);
      setMostrarEmpresa(plantilla.mostrarEmpresa ?? true);
      setMostrarCliente(plantilla.mostrarCliente ?? true);
      setMostrarDatosAlbaran(plantilla.mostrarDatosAlbaran ?? true);
      setMostrarObservaciones(plantilla.mostrarObservaciones ?? true);
      setMostrarPiePagina(plantilla.mostrarPiePagina ?? true);
      
      setEmpresaMostrarRazon(plantilla.empresaMostrarRazon ?? true);
      setEmpresaMostrarCif(plantilla.empresaMostrarCif ?? true);
      setEmpresaMostrarDireccion(plantilla.empresaMostrarDireccion ?? true);
      setEmpresaMostrarTelefono(plantilla.empresaMostrarTelefono ?? true);
      setEmpresaMostrarEmail(plantilla.empresaMostrarEmail ?? true);
      
      setClienteMostrarNif(plantilla.clienteMostrarNif ?? true);
      setClienteMostrarDireccion(plantilla.clienteMostrarDireccion ?? true);
      setClienteMostrarTelefono(plantilla.clienteMostrarTelefono ?? true);
      setClienteMostrarEmail(plantilla.clienteMostrarEmail ?? true);
      
      setProductoMostrarReferencia(plantilla.productoMostrarReferencia ?? true);
      setProductoMostrarDescuento(plantilla.productoMostrarDescuento ?? true);
      setProductoMostrarSubtotal(plantilla.productoMostrarSubtotal ?? true);
      setProductoMostrarObservaciones(plantilla.productoMostrarObservaciones ?? true);
      
      setLayoutEmpresaCliente(plantilla.layoutEmpresaCliente || "horizontal");
      setLayoutTablaProductos(plantilla.layoutTablaProductos || "completa");
      
      setColorPrimario(plantilla.colorPrimario || "#1a3161");
      setTamanoFuente(plantilla.tamanoFuente || "normal");
      setEstiloTabla(plantilla.estiloTabla || "lineas");
      
      setTextoTitulo(plantilla.textoTitulo || "ALBARÁN DE ENTREGA");
      setTextoPiePagina(plantilla.textoPiePagina || "Gracias por su confianza");
      
      setRepetirEncabezados(plantilla.repetirEncabezados ?? true);
    } else {
      // Nueva plantilla - valores por defecto
      setNombre("Nueva plantilla");
    }
  }, [plantilla]);

  const plantillaPreviewData = useMemo(() => ({
    id: plantilla?.id || 0,
    nombre,
    mostrarLogo,
    mostrarEmpresa,
    mostrarCliente,
    mostrarDatosAlbaran,
    mostrarObservaciones,
    mostrarPiePagina,
    empresaMostrarRazon,
    empresaMostrarCif,
    empresaMostrarDireccion,
    empresaMostrarTelefono,
    empresaMostrarEmail,
    clienteMostrarNif,
    clienteMostrarDireccion,
    clienteMostrarTelefono,
    clienteMostrarEmail,
    productoMostrarReferencia,
    productoMostrarDescuento,
    productoMostrarSubtotal,
    productoMostrarObservaciones,
    layoutEmpresaCliente,
    layoutTablaProductos,
    colorPrimario,
    tamanoFuente,
    estiloTabla,
    textoTitulo,
    textoPiePagina,
    repetirEncabezados,
    activa: false
  }), [
    plantilla?.id,
    nombre,
    mostrarLogo,
    mostrarEmpresa,
    mostrarCliente,
    mostrarDatosAlbaran,
    mostrarObservaciones,
    mostrarPiePagina,
    empresaMostrarRazon,
    empresaMostrarCif,
    empresaMostrarDireccion,
    empresaMostrarTelefono,
    empresaMostrarEmail,
    clienteMostrarNif,
    clienteMostrarDireccion,
    clienteMostrarTelefono,
    clienteMostrarEmail,
    productoMostrarReferencia,
    productoMostrarDescuento,
    productoMostrarSubtotal,
    productoMostrarObservaciones,
    layoutEmpresaCliente,
    layoutTablaProductos,
    colorPrimario,
    tamanoFuente,
    estiloTabla,
    textoTitulo,
    textoPiePagina,
    repetirEncabezados
  ]);

  const generarPreview = async (dataOverride) => {
    setCargandoPreview(true);
    setErrorPreview("");

    const plantillaData = dataOverride || plantillaPreviewData;

    try {
      const res = await fetch("http://145.223.103.219:8080/plantillas-pdf/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(plantillaData)
      });

      if (!res.ok) throw new Error("Error al generar preview");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      
      setPreviewUrl(url);
    } catch (err) {
      console.error(err);
      setErrorPreview("Error al generar la vista previa");
    } finally {
      setCargandoPreview(false);
    }
  };

  useEffect(() => {
    if (previewTimeoutRef.current) {
      clearTimeout(previewTimeoutRef.current);
    }

    previewTimeoutRef.current = setTimeout(() => {
      generarPreview(plantillaPreviewData);
    }, 2000);

    return () => {
      if (previewTimeoutRef.current) {
        clearTimeout(previewTimeoutRef.current);
      }
    };
  }, [plantillaPreviewData]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => {
      if (previewTimeoutRef.current) {
        clearTimeout(previewTimeoutRef.current);
      }
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const plantillaData = {
      ...(plantilla?.id && { id: plantilla.id }),
      nombre,
      mostrarLogo,
      mostrarEmpresa,
      mostrarCliente,
      mostrarDatosAlbaran,
      mostrarObservaciones,
      mostrarPiePagina,
      empresaMostrarRazon,
      empresaMostrarCif,
      empresaMostrarDireccion,
      empresaMostrarTelefono,
      empresaMostrarEmail,
      clienteMostrarNif,
      clienteMostrarDireccion,
      clienteMostrarTelefono,
      clienteMostrarEmail,
      productoMostrarReferencia,
      productoMostrarDescuento,
      productoMostrarSubtotal,
      productoMostrarObservaciones,
      layoutEmpresaCliente,
      layoutTablaProductos,
      colorPrimario,
      tamanoFuente,
      estiloTabla,
      textoTitulo,
      textoPiePagina,
      repetirEncabezados,
      activa: plantilla?.activa ?? false
    };

    guardarPlantilla(plantillaData);
  };

  return (
    <div className="erp-editor-plantilla">
      <div className="erp-editor-header">
        <div>
          <h2>{plantilla ? `Editar: ${plantilla.nombre}` : "Nueva Plantilla"}</h2>
          <p>Configura la apariencia y contenido de los documentos PDF</p>
        </div>
        <button className="erp-btn erp-btn-secondary" onClick={cerrarEditor}>
          Volver a la lista
        </button>
      </div>

      {mensaje && (
        <div className={`erp-message ${mensaje.includes('✅') ? 'erp-message-success' : 'erp-message-error'}`}>
          {mensaje}
        </div>
      )}

      <div className="erp-editor-container">
        <div className="erp-editor-form">
          <div className="erp-tabs">
            <button
              className={`erp-tab ${tabActiva === "general" ? "active" : ""}`}
              onClick={() => setTabActiva("general")}
            >
              General
            </button>
            <button
              className={`erp-tab ${tabActiva === "campos" ? "active" : ""}`}
              onClick={() => setTabActiva("campos")}
            >
              Campos Visibles
            </button>
            <button
              className={`erp-tab ${tabActiva === "layout" ? "active" : ""}`}
              onClick={() => setTabActiva("layout")}
            >
              Disposición
            </button>
            <button
              className={`erp-tab ${tabActiva === "estilos" ? "active" : ""}`}
              onClick={() => setTabActiva("estilos")}
            >
              Estilos
            </button>
          </div>

          <form onSubmit={handleSubmit} className="erp-form">
            {tabActiva === "general" && (
              <div className="erp-tab-content">
                <h3>Configuración General</h3>
                
                <label className="erp-field">
                  <span className="erp-field-label">Nombre de la plantilla</span>
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                  />
                </label>

                <div className="erp-section-title">Secciones del PDF</div>
                
                <label className="erp-checkbox">
                  <input
                    type="checkbox"
                    checked={mostrarLogo}
                    onChange={(e) => setMostrarLogo(e.target.checked)}
                  />
                  <span>Mostrar logo de la empresa</span>
                </label>

                <label className="erp-checkbox">
                  <input
                    type="checkbox"
                    checked={mostrarEmpresa}
                    onChange={(e) => setMostrarEmpresa(e.target.checked)}
                  />
                  <span>Mostrar datos de la empresa</span>
                </label>

                <label className="erp-checkbox">
                  <input
                    type="checkbox"
                    checked={mostrarCliente}
                    onChange={(e) => setMostrarCliente(e.target.checked)}
                  />
                  <span>Mostrar datos del cliente</span>
                </label>

                <label className="erp-checkbox">
                  <input
                    type="checkbox"
                    checked={mostrarDatosAlbaran}
                    onChange={(e) => setMostrarDatosAlbaran(e.target.checked)}
                  />
                  <span>Mostrar datos del albarán</span>
                </label>

                <label className="erp-checkbox">
                  <input
                    type="checkbox"
                    checked={mostrarObservaciones}
                    onChange={(e) => setMostrarObservaciones(e.target.checked)}
                  />
                  <span>Mostrar observaciones</span>
                </label>

                <label className="erp-checkbox">
                  <input
                    type="checkbox"
                    checked={mostrarPiePagina}
                    onChange={(e) => setMostrarPiePagina(e.target.checked)}
                  />
                  <span>Mostrar pie de página</span>
                </label>

                <div className="erp-section-title">Textos Personalizados</div>

                <label className="erp-field">
                  <span className="erp-field-label">Título del documento</span>
                  <input
                    type="text"
                    value={textoTitulo}
                    onChange={(e) => setTextoTitulo(e.target.value)}
                  />
                </label>

                <label className="erp-field">
                  <span className="erp-field-label">Texto del pie de página</span>
                  <input
                    type="text"
                    value={textoPiePagina}
                    onChange={(e) => setTextoPiePagina(e.target.value)}
                  />
                </label>
              </div>
            )}

            {tabActiva === "campos" && (
              <div className="erp-tab-content">
                <div className="erp-campos-section">
                  <h3>Campos de Empresa</h3>
                  <div className="erp-campos-grid">
                    <label className="erp-checkbox">
                      <input
                        type="checkbox"
                        checked={empresaMostrarRazon}
                        onChange={(e) => setEmpresaMostrarRazon(e.target.checked)}
                        disabled={!mostrarEmpresa}
                      />
                      <span>Razón social</span>
                    </label>

                    <label className="erp-checkbox">
                      <input
                        type="checkbox"
                        checked={empresaMostrarCif}
                        onChange={(e) => setEmpresaMostrarCif(e.target.checked)}
                        disabled={!mostrarEmpresa}
                      />
                      <span>CIF</span>
                    </label>

                    <label className="erp-checkbox">
                      <input
                        type="checkbox"
                        checked={empresaMostrarDireccion}
                        onChange={(e) => setEmpresaMostrarDireccion(e.target.checked)}
                        disabled={!mostrarEmpresa}
                      />
                      <span>Dirección</span>
                    </label>

                    <label className="erp-checkbox">
                      <input
                        type="checkbox"
                        checked={empresaMostrarTelefono}
                        onChange={(e) => setEmpresaMostrarTelefono(e.target.checked)}
                        disabled={!mostrarEmpresa}
                      />
                      <span>Teléfono</span>
                    </label>

                    <label className="erp-checkbox">
                      <input
                        type="checkbox"
                        checked={empresaMostrarEmail}
                        onChange={(e) => setEmpresaMostrarEmail(e.target.checked)}
                        disabled={!mostrarEmpresa}
                      />
                      <span>Email</span>
                    </label>
                  </div>
                </div>

                <div className="erp-campos-section">
                  <h3>Campos de Cliente</h3>
                  <div className="erp-campos-grid">
                    <label className="erp-checkbox">
                      <input
                        type="checkbox"
                        checked={clienteMostrarNif}
                        onChange={(e) => setClienteMostrarNif(e.target.checked)}
                        disabled={!mostrarCliente}
                      />
                      <span>NIF/CIF</span>
                    </label>

                    <label className="erp-checkbox">
                      <input
                        type="checkbox"
                        checked={clienteMostrarDireccion}
                        onChange={(e) => setClienteMostrarDireccion(e.target.checked)}
                        disabled={!mostrarCliente}
                      />
                      <span>Dirección</span>
                    </label>

                    <label className="erp-checkbox">
                      <input
                        type="checkbox"
                        checked={clienteMostrarTelefono}
                        onChange={(e) => setClienteMostrarTelefono(e.target.checked)}
                        disabled={!mostrarCliente}
                      />
                      <span>Teléfono</span>
                    </label>

                    <label className="erp-checkbox">
                      <input
                        type="checkbox"
                        checked={clienteMostrarEmail}
                        onChange={(e) => setClienteMostrarEmail(e.target.checked)}
                        disabled={!mostrarCliente}
                      />
                      <span>Email</span>
                    </label>
                  </div>
                </div>

                <div className="erp-campos-section">
                  <h3>Campos de Productos</h3>
                  <div className="erp-campos-grid">
                    <label className="erp-checkbox">
                      <input
                        type="checkbox"
                        checked={productoMostrarReferencia}
                        onChange={(e) => setProductoMostrarReferencia(e.target.checked)}
                      />
                      <span>Referencia</span>
                    </label>

                    <label className="erp-checkbox">
                      <input
                        type="checkbox"
                        checked={productoMostrarDescuento}
                        onChange={(e) => setProductoMostrarDescuento(e.target.checked)}
                      />
                      <span>Descuento</span>
                    </label>

                    <label className="erp-checkbox">
                      <input
                        type="checkbox"
                        checked={productoMostrarSubtotal}
                        onChange={(e) => setProductoMostrarSubtotal(e.target.checked)}
                      />
                      <span>Subtotal</span>
                    </label>

                    <label className="erp-checkbox">
                      <input
                        type="checkbox"
                        checked={productoMostrarObservaciones}
                        onChange={(e) => setProductoMostrarObservaciones(e.target.checked)}
                      />
                      <span>Observaciones de línea</span>
                    </label>
                  </div>

                  <div className="erp-info-box">
                    💡 Las observaciones de cada línea de producto se mostrarán debajo del producto en una fila separada con formato especial.
                  </div>
                </div>
              </div>
            )}

            {tabActiva === "layout" && (
              <div className="erp-tab-content">
                <h3>Disposición del PDF</h3>

                <label className="erp-field">
                  <span className="erp-field-label">Disposición Empresa/Cliente/Albarán</span>
                  <select
                    value={layoutEmpresaCliente}
                    onChange={(e) => setLayoutEmpresaCliente(e.target.value)}
                  >
                    {layoutOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="erp-section-title">Paginación</div>

                <label className="erp-checkbox">
                  <input
                    type="checkbox"
                    checked={repetirEncabezados}
                    onChange={(e) => setRepetirEncabezados(e.target.checked)}
                  />
                  <span>Repetir datos de empresa, cliente y albarán en cada página</span>
                </label>

                <div className="erp-info-box">
                  <p>
                    💡 <strong>Paginación automática:</strong> Si el albarán tiene muchos productos y no caben en una página, 
                    automáticamente se crearán páginas adicionales.
                  </p>
                  <p>
                    {repetirEncabezados 
                      ? "✅ Los datos de empresa, cliente y albarán se repetirán en cada página nueva."
                      : "❌ Los datos solo aparecerán en la primera página."}
                  </p>
                  <p>
                    Los totales siempre aparecerán solo en la última página.
                  </p>
                </div>

                <div className="erp-layout-preview">
                  <div className="erp-layout-preview-title">Vista previa del layout:</div>
                  <div className={`erp-layout-preview-content layout-${layoutEmpresaCliente}`}>
                    {layoutEmpresaCliente === "horizontal" && (
                      <>
                        <div className="preview-box">Empresa</div>
                        <div className="preview-box">Cliente</div>
                        <div className="preview-box">Albarán</div>
                      </>
                    )}
                    {layoutEmpresaCliente === "vertical" && (
                      <>
                        <div className="preview-box full">Empresa</div>
                        <div className="preview-box full">Cliente</div>
                        <div className="preview-box full">Albarán</div>
                      </>
                    )}
                    {layoutEmpresaCliente === "empresa_arriba" && (
                      <>
                        <div className="preview-box full">Empresa</div>
                        <div className="preview-box">Cliente</div>
                        <div className="preview-box">Albarán</div>
                      </>
                    )}
                    {layoutEmpresaCliente === "cliente_arriba" && (
                      <>
                        <div className="preview-box full">Cliente</div>
                        <div className="preview-box">Empresa</div>
                        <div className="preview-box">Albarán</div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {tabActiva === "estilos" && (
              <div className="erp-tab-content">
                <h3>Estilos del PDF</h3>

                <label className="erp-field">
                  <span className="erp-field-label">Color primario</span>
                  <div className="erp-color-picker-container">
                    <input
                      type="color"
                      value={colorPrimario}
                      onChange={(e) => setColorPrimario(e.target.value)}
                      className="erp-color-picker"
                    />
                    <input
                      type="text"
                      value={colorPrimario}
                      onChange={(e) => setColorPrimario(e.target.value)}
                      className="erp-color-input"
                    />
                  </div>
                </label>

                <label className="erp-field">
                  <span className="erp-field-label">Tamaño de fuente</span>
                  <select
                    value={tamanoFuente}
                    onChange={(e) => setTamanoFuente(e.target.value)}
                  >
                    {tamanoFuenteOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="erp-field">
                  <span className="erp-field-label">Estilo de tabla</span>
                  <select
                    value={estiloTabla}
                    onChange={(e) => setEstiloTabla(e.target.value)}
                  >
                    {estiloTablaOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="erp-color-preview" style={{ backgroundColor: colorPrimario }}>
                  <span>Vista previa del color</span>
                </div>
              </div>
            )}

            <div className="erp-form-actions">
              <button className="erp-btn erp-btn-primary" type="submit">
                Guardar Plantilla
              </button>
              <button className="erp-btn erp-btn-secondary" type="button" onClick={cerrarEditor}>
                Cancelar
              </button>
            </div>
          </form>
        </div>

        <div className="erp-editor-preview">
          <h3><IconDocument className="erp-action-icon" /> Vista Previa</h3>
          <p className="erp-preview-hint">La vista previa se actualizará automáticamente.</p>

          {cargandoPreview && (
            <div className="erp-preview-loading">
              <IconRefresh className="erp-action-icon spinning" /> Generando vista previa...
            </div>
          )}

          {errorPreview && (
            <div className="erp-preview-error">
              ⚠️ {errorPreview}
            </div>
          )}

          {!cargandoPreview && !errorPreview && previewUrl && (
            <div className="erp-preview-iframe-container">
              <iframe
                src={previewUrl}
                className="erp-preview-iframe"
                title="Vista previa del PDF"
              />
            </div>
          )}

          {!cargandoPreview && !errorPreview && !previewUrl && (
            <div className="erp-preview-loading">
              <IconRefresh className="erp-action-icon spinning" /> Generando vista previa...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
