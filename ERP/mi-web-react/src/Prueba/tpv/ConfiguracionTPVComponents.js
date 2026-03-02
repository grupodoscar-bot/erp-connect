import React, { useState, useEffect } from "react";
import {
  IconDownload,
  IconEye,
  IconEdificio,
  IconDocumento,
  IconProductos,
  IconMoneda,
  IconMoney,
  IconEdit,
  IconPaleta,
  IconLapiz
} from "../iconos";
import "./ConfiguracionTPV.css";

export function ConfiguracionTPV({
  configuracionActiva,
  guardarConfiguracion,
  cargando,
}) {
  const [config, setConfig] = useState(null);
  const [vistaPrevia, setVistaPrevia] = useState(false);

  useEffect(() => {
    if (configuracionActiva) {
      setConfig(configuracionActiva);
    }
  }, [configuracionActiva]);

  const handleChange = (campo, valor) => {
    setConfig(prev => ({ ...prev, [campo]: valor }));
  };

  const handleGuardar = async () => {
    if (!config) return;
    await guardarConfiguracion(config);
  };

  if (cargando || !config) {
    return <div className="erp-loading">Cargando configuración...</div>;
  }

  return (
    <div className="erp-crud-container">
      <div className="config-tpv-header">
        <div>
          <h2>Configuración de Tickets TPV</h2>
          <p>Personaliza el diseño y contenido de tus tickets de venta</p>
        </div>
        <div className="config-tpv-actions">
          <button 
            className="erp-btn erp-btn-secondary config-tpv-secondary" 
            onClick={() => setVistaPrevia(!vistaPrevia)}
          >
            {vistaPrevia ? (
              <>
                <IconLapiz className="config-tpv-eye" />
                Editar
              </>
            ) : (
              <>
                <IconEye className="config-tpv-eye" />
                Vista Previa
              </>
            )}
          </button>
          <button className="erp-btn erp-btn-primary config-tpv-primary" onClick={handleGuardar}>
            <IconDownload /> Guardar Configuración
          </button>
        </div>
      </div>

      {vistaPrevia ? (
        <VistaPreviaTicket config={config} />
      ) : (
        <div className="config-tpv-grid" style={{ padding: '24px', background: '#f8fafc' }}>
          {/* Sección: Datos de Empresa */}
          <SeccionConfig titulo="Datos de Empresa">
            <CheckboxConfig
              label="Mostrar nombre de empresa"
              checked={config.mostrarNombreEmpresa}
              onChange={(v) => handleChange("mostrarNombreEmpresa", v)}
            />
            <CheckboxConfig
              label="Mostrar dirección"
              checked={config.mostrarDireccion}
              onChange={(v) => handleChange("mostrarDireccion", v)}
            />
            <CheckboxConfig
              label="Mostrar código postal"
              checked={config.mostrarCodigoPostal}
              onChange={(v) => handleChange("mostrarCodigoPostal", v)}
            />
            <CheckboxConfig
              label="Mostrar provincia"
              checked={config.mostrarProvincia}
              onChange={(v) => handleChange("mostrarProvincia", v)}
            />
            <CheckboxConfig
              label="Mostrar teléfono"
              checked={config.mostrarTelefono}
              onChange={(v) => handleChange("mostrarTelefono", v)}
            />
            <CheckboxConfig
              label="Mostrar CIF"
              checked={config.mostrarCif}
              onChange={(v) => handleChange("mostrarCif", v)}
            />
            <CheckboxConfig
              label="Mostrar logo"
              checked={config.mostrarLogo}
              onChange={(v) => handleChange("mostrarLogo", v)}
            />
          </SeccionConfig>

          {/* Sección: Datos del Ticket */}
          <SeccionConfig titulo="Datos del Ticket">
            <CheckboxConfig
              label="Mostrar número de factura"
              checked={config.mostrarNumeroFactura}
              onChange={(v) => handleChange("mostrarNumeroFactura", v)}
            />
            <CheckboxConfig
              label="Mostrar fecha y hora"
              checked={config.mostrarFechaHora}
              onChange={(v) => handleChange("mostrarFechaHora", v)}
            />
            <CheckboxConfig
              label="Mostrar cliente"
              checked={config.mostrarCliente}
              onChange={(v) => handleChange("mostrarCliente", v)}
            />
          </SeccionConfig>

          {/* Sección: Detalles de Productos */}
          <SeccionConfig titulo="Detalles de Productos">
            <CheckboxConfig
              label="Mostrar referencia de producto"
              checked={config.mostrarReferenciaProducto}
              onChange={(v) => handleChange("mostrarReferenciaProducto", v)}
            />
            <CheckboxConfig
              label="Mostrar descripción"
              checked={config.mostrarDescripcionProducto}
              onChange={(v) => handleChange("mostrarDescripcionProducto", v)}
            />
            <CheckboxConfig
              label="Mostrar cantidad"
              checked={config.mostrarCantidad}
              onChange={(v) => handleChange("mostrarCantidad", v)}
            />
            <CheckboxConfig
              label="Mostrar precio unitario"
              checked={config.mostrarPrecioUnitario}
              onChange={(v) => handleChange("mostrarPrecioUnitario", v)}
            />
            <CheckboxConfig
              label="Mostrar descuento"
              checked={config.mostrarDescuento}
              onChange={(v) => handleChange("mostrarDescuento", v)}
            />
            <CheckboxConfig
              label="Mostrar subtotal de línea"
              checked={config.mostrarSubtotalLinea}
              onChange={(v) => handleChange("mostrarSubtotalLinea", v)}
            />
          </SeccionConfig>

          {/* Sección: Impuestos y Totales */}
          <SeccionConfig titulo="Impuestos y Totales">
            <CheckboxConfig
              label="Mostrar porcentaje de IVA"
              checked={config.mostrarPorcentajeIva}
              onChange={(v) => handleChange("mostrarPorcentajeIva", v)}
            />
            <CheckboxConfig
              label="Mostrar desglose de IVA"
              checked={config.mostrarDesgloseIva}
              onChange={(v) => handleChange("mostrarDesgloseIva", v)}
            />
            <CheckboxConfig
              label="Mostrar base imponible"
              checked={config.mostrarBaseImponible}
              onChange={(v) => handleChange("mostrarBaseImponible", v)}
            />
            <CheckboxConfig
              label="Mostrar cuota de IVA"
              checked={config.mostrarCuotaIva}
              onChange={(v) => handleChange("mostrarCuotaIva", v)}
            />
            <CheckboxConfig
              label="Mostrar subtotal"
              checked={config.mostrarSubtotal}
              onChange={(v) => handleChange("mostrarSubtotal", v)}
            />
            <CheckboxConfig
              label="Mostrar descuento total"
              checked={config.mostrarDescuentoTotal}
              onChange={(v) => handleChange("mostrarDescuentoTotal", v)}
            />
            <CheckboxConfig
              label="Mostrar total"
              checked={config.mostrarTotal}
              onChange={(v) => handleChange("mostrarTotal", v)}
            />
          </SeccionConfig>

          {/* Sección: Método de Pago */}
          <SeccionConfig titulo="Método de Pago">
            <CheckboxConfig
              label="Mostrar método de pago"
              checked={config.mostrarMetodoPago}
              onChange={(v) => handleChange("mostrarMetodoPago", v)}
            />
            <CheckboxConfig
              label="Mostrar importe entregado"
              checked={config.mostrarImporteEntregado}
              onChange={(v) => handleChange("mostrarImporteEntregado", v)}
            />
            <CheckboxConfig
              label="Mostrar cambio"
              checked={config.mostrarCambio}
              onChange={(v) => handleChange("mostrarCambio", v)}
            />
          </SeccionConfig>

          {/* Sección: Textos Personalizables */}
          <SeccionConfig titulo="Textos Personalizables" fullWidth>
            <div className="config-tpv-textos-grid">
              <InputConfig
                label="Texto cabecera"
                value={config.textoCabecera}
                onChange={(v) => handleChange("textoCabecera", v)}
                multiline
              />
              <InputConfig
                label="Texto pie"
                value={config.textoPie}
                onChange={(v) => handleChange("textoPie", v)}
                multiline
              />
              <InputConfig
                label="Texto despedida"
                value={config.textoDespedida}
                onChange={(v) => handleChange("textoDespedida", v)}
              />
              <InputConfig
                label="Etiqueta ticket"
                value={config.textoTicket}
                onChange={(v) => handleChange("textoTicket", v)}
              />
              <InputConfig
                label="Etiqueta fecha"
                value={config.textoFecha}
                onChange={(v) => handleChange("textoFecha", v)}
              />
              <InputConfig
                label="Etiqueta cliente"
                value={config.textoCliente}
                onChange={(v) => handleChange("textoCliente", v)}
              />
              <InputConfig
                label="Etiqueta descripción"
                value={config.textoDescripcion}
                onChange={(v) => handleChange("textoDescripcion", v)}
              />
              <InputConfig
                label="Etiqueta cantidad"
                value={config.textoCantidad}
                onChange={(v) => handleChange("textoCantidad", v)}
              />
              <InputConfig
                label="Etiqueta precio"
                value={config.textoPrecio}
                onChange={(v) => handleChange("textoPrecio", v)}
              />
              <InputConfig
                label="Etiqueta importe"
                value={config.textoImporte}
                onChange={(v) => handleChange("textoImporte", v)}
              />
              <InputConfig
                label="Etiqueta subtotal"
                value={config.textoSubtotal}
                onChange={(v) => handleChange("textoSubtotal", v)}
              />
              <InputConfig
                label="Etiqueta descuento"
                value={config.textoDescuento}
                onChange={(v) => handleChange("textoDescuento", v)}
              />
              <InputConfig
                label="Etiqueta base"
                value={config.textoBase}
                onChange={(v) => handleChange("textoBase", v)}
              />
              <InputConfig
                label="Etiqueta IVA"
                value={config.textoIva}
                onChange={(v) => handleChange("textoIva", v)}
              />
              <InputConfig
                label="Etiqueta total"
                value={config.textoTotal}
                onChange={(v) => handleChange("textoTotal", v)}
              />
              <InputConfig
                label="Etiqueta método de pago"
                value={config.textoMetodoPago}
                onChange={(v) => handleChange("textoMetodoPago", v)}
              />
              <InputConfig
                label="Etiqueta entregado"
                value={config.textoEntregado}
                onChange={(v) => handleChange("textoEntregado", v)}
              />
              <InputConfig
                label="Etiqueta cambio"
                value={config.textoCambio}
                onChange={(v) => handleChange("textoCambio", v)}
              />
            </div>
          </SeccionConfig>

          {/* Sección: Formato y Estilo */}
          <SeccionConfig titulo="Formato y Estilo" fullWidth>
            <div className="config-tpv-formato-grid">
              <SelectConfig
                label="Formato de impresora"
                value={config.formatoImpresora || "80mm"}
                onChange={(v) => handleChange("formatoImpresora", v)}
                options={[
                  { value: "80mm", label: "80mm (Estándar)" },
                  { value: "60mm", label: "60mm (Compacto)" },
                ]}
              />
              <SelectConfig
                label="Familia de fuente"
                value={config.fuenteFamilia}
                onChange={(v) => handleChange("fuenteFamilia", v)}
                options={[
                  { value: "monospace", label: "Monospace" },
                  { value: "sans-serif", label: "Sans-serif" },
                  { value: "serif", label: "Serif" },
                  { value: "Arial", label: "Arial" },
                  { value: "Courier New", label: "Courier New" },
                ]}
              />
              <SelectConfig
                label="Alineación cabecera"
                value={config.alinearCabecera}
                onChange={(v) => handleChange("alinearCabecera", v)}
                options={[
                  { value: "left", label: "Izquierda" },
                  { value: "center", label: "Centro" },
                  { value: "right", label: "Derecha" },
                ]}
              />
              <SelectConfig
                label="Alineación pie"
                value={config.alinearPie}
                onChange={(v) => handleChange("alinearPie", v)}
                options={[
                  { value: "left", label: "Izquierda" },
                  { value: "center", label: "Centro" },
                  { value: "right", label: "Derecha" },
                ]}
              />
              <InputConfig
                label="Separador de línea"
                value={config.separadorLinea}
                onChange={(v) => handleChange("separadorLinea", v)}
                maxLength={5}
              />
              <InputConfig
                label="Espaciado entre líneas"
                type="number"
                value={config.espaciadoLineas}
                onChange={(v) => handleChange("espaciadoLineas", parseInt(v) || 4)}
              />
            </div>
          </SeccionConfig>
        </div>
      )}
    </div>
  );
}

function SeccionConfig({ titulo, children, fullWidth }) {
  const iconos = {
    "Datos de Empresa": IconEdificio,
    "Datos del Ticket": IconDocumento,
    "Detalles de Productos": IconProductos,
    "Impuestos y Totales": IconMoneda,
    "Método de Pago": IconMoney,
    "Textos Personalizables": IconEdit,
    "Formato y Estilo": IconPaleta
  };

  const Icono = iconos[titulo] || IconDocumento;
  
  return (
    <div className={`config-tpv-seccion ${fullWidth ? "full-width" : ""}`} style={{ 
      background: '#fff', 
      borderRadius: '16px', 
      padding: '20px', 
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      border: '1px solid #e5e7eb'
    }}>
      <h3 className="config-tpv-seccion-titulo" style={{ 
        fontSize: '16px', 
        fontWeight: '700', 
        color: 'var(--erp-text-primary, #0f172a)',
        marginBottom: '16px',
        paddingBottom: '12px',
        borderBottom: '2px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <Icono className="config-tpv-section-icon" />
        {titulo}
      </h3>
      <div className="config-tpv-seccion-contenido">{children}</div>
    </div>
  );
}

function CheckboxConfig({ label, checked, onChange }) {
  const accentColor = "var(--erp-accent, #2563eb)";
  const accentBg = "color-mix(in srgb, var(--erp-accent, #2563eb) 12%, #fff)";
  const hoverBg = "color-mix(in srgb, var(--erp-accent, #2563eb) 6%, #fff)";

  return (
    <label className="config-tpv-checkbox" style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '10px 12px',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      background: checked ? accentBg : 'transparent',
      border: `2px solid ${checked ? accentColor : '#e5e7eb'}`,
      ':hover': { background: hoverBg }
    }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ 
          width: '18px', 
          height: '18px', 
          cursor: 'pointer',
          accentColor: 'var(--erp-accent, #2563eb)'
        }}
      />
      <span style={{ 
        fontSize: '14px', 
        color: checked ? accentColor : '#475569',
        fontWeight: checked ? '600' : '500'
      }}>{label}</span>
    </label>
  );
}

function InputConfig({ label, value, onChange, type = "text", multiline, maxLength }) {
  return (
    <div className="config-tpv-input" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--erp-text-secondary, #475569)' }}>{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          maxLength={maxLength}
          style={{
            padding: '12px',
            borderRadius: '8px',
            border: '2px solid #e5e7eb',
            fontSize: '14px',
            fontFamily: 'inherit',
            transition: 'border-color 0.2s',
            resize: 'vertical'
          }}
          onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
          onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={maxLength}
          style={{
            padding: '12px',
            borderRadius: '8px',
            border: '2px solid #e5e7eb',
            fontSize: '14px',
            transition: 'border-color 0.2s'
          }}
          onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
          onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
        />
      )}
    </div>
  );
}

function SelectConfig({ label, value, onChange, options }) {
  return (
    <div className="config-tpv-input" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--erp-text-secondary, #475569)' }}>{label}</label>
      <select 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: '12px',
          borderRadius: '8px',
          border: '2px solid #e5e7eb',
          fontSize: '14px',
          background: '#fff',
          cursor: 'pointer',
          transition: 'border-color 0.2s'
        }}
        onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
        onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function VistaPreviaTicket({ config }) {
  const separador = config.separadorLinea.repeat(40);
  const anchoTicket = Math.min(Math.max(config.anchoTicket || 280, 240), 420);
  const espaciado = Math.min(Math.max(config.espaciadoLineas || 4, 3), 8);
  const escalaTarget = 360 / anchoTicket;
  const escalaPreview = Math.min(Math.max(escalaTarget, 0.9), 1.3);

  return (
    <div className="vista-previa-ticket-wrapper">
      <div className="vista-previa-ticket-stage">
        <div 
          className="vista-previa-ticket"
          style={{
            width: `${anchoTicket}px`,
            fontFamily: config.fuenteFamilia,
            fontSize: `${config.fuenteTamanoNormal}px`,
            lineHeight: `${espaciado * 4}px`,
            transform: `scale(${escalaPreview})`,
            transformOrigin: "top center",
          }}
        >
          {/* Cabecera */}
          <div 
            style={{ 
              textAlign: config.alinearCabecera,
              fontSize: `${config.fuenteTamanoCabecera}px`,
              fontWeight: 'bold',
              marginBottom: '12px'
            }}
          >
            {config.textoCabecera}
          </div>

        {config.mostrarNombreEmpresa && <div>DOSCAR S.L.</div>}
        {config.mostrarDireccion && <div>Calle Ejemplo, 123</div>}
        {config.mostrarCodigoPostal && <div>28001</div>}
        {config.mostrarProvincia && <div>Madrid</div>}
        {config.mostrarTelefono && <div>Tel: 912 345 678</div>}
        {config.mostrarCif && <div>CIF: B12345678</div>}

        <div style={{ margin: '8px 0' }}>{separador}</div>

        {config.mostrarNumeroFactura && <div>{config.textoTicket} TPV-20251229-094205</div>}
        {config.mostrarFechaHora && <div>{config.textoFecha} 29/12/2025, 9:42:05</div>}
        {config.mostrarCliente && <div>{config.textoCliente} Mostrador</div>}

        <div style={{ margin: '8px 0' }}>{separador}</div>

        {/* Líneas de productos */}
        <div style={{ marginBottom: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
            <span>{config.textoDescripcion}</span>
            <span>{config.textoCantidad}</span>
            <span>{config.textoImporte}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Cerveza de barril</span>
            <span>1</span>
            <span>2.75 €</span>
          </div>
        </div>

          <div style={{ margin: '8px 0' }}>{separador}</div>

          {/* Totales */}
          {config.mostrarSubtotal && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{config.textoSubtotal}</span>
              <span>2.75 €</span>
            </div>
          )}
          {config.mostrarTotal && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '14px' }}>
              <span>{config.textoTotal}</span>
              <span>2.75 €</span>
            </div>
          )}

          <div style={{ margin: '8px 0' }}>{separador}</div>

          {/* Pie */}
          <div 
            style={{ 
              textAlign: config.alinearPie,
              fontSize: `${config.fuenteTamanoPie}px`,
              marginTop: '12px'
            }}
          >
            <div>{config.textoPie}</div>
            <div>{config.textoDespedida}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
