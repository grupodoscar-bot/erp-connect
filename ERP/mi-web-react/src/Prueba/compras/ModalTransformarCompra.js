import React, { useState, useEffect, useCallback, useRef } from 'react';
import { IconTransform, IconDuplicate, IconDocument, IconSearch } from '../iconos';
import API_ENDPOINTS from '../../config/api';

const TIPOS_DOCUMENTO_COMPRA = {
  PRESUPUESTO_COMPRA: { label: 'Presupuesto Compra', serie: 'PRESUPUESTO_COMPRA', endpoint: 'presupuestosCompra', tipo: 'compra' },
  PEDIDO_COMPRA: { label: 'Pedido Compra', serie: 'PEDIDO_COMPRA', endpoint: 'pedidosCompra', tipo: 'compra' },
  ALBARAN_COMPRA: { label: 'Albarán Compra', serie: 'ALBARAN_COMPRA', endpoint: 'albaranesCompra', tipo: 'compra' },
  FACTURA_COMPRA: { label: 'Factura Compra', serie: 'FACTURA_COMPRA', endpoint: 'facturasCompra', tipo: 'compra' },
};

const TIPOS_DOCUMENTO_VENTAS = {
  PRESUPUESTO: { label: 'Presupuesto', serie: 'PRESUPUESTO', endpoint: 'presupuestos', tipo: 'ventas' },
  PEDIDO: { label: 'Pedido', serie: 'PEDIDO_VENTA', endpoint: 'pedidos', tipo: 'ventas' },
  ALBARAN: { label: 'Albarán', serie: 'ALBARAN_VENTA', endpoint: 'albaranes', tipo: 'ventas' },
  FACTURA: { label: 'Factura', serie: 'FACTURA_VENTA', endpoint: 'facturas', tipo: 'ventas' },
  FACTURA_PROFORMA: { label: 'Factura Proforma', serie: 'FACTURA_PROFORMA', endpoint: 'facturasProforma', tipo: 'ventas' },
  FACTURA_RECTIFICATIVA: { label: 'Factura Rectificativa', serie: 'FACTURA_RECTIFICATIVA', endpoint: 'facturasRectificativas', tipo: 'ventas' },
};

const TODOS_LOS_TIPOS = { ...TIPOS_DOCUMENTO_VENTAS, ...TIPOS_DOCUMENTO_COMPRA };

export function ModalTransformarCompra({
  abierto,
  cerrar,
  documento,
  tipoDocumentoActual,
  estadoOptions = [],
  onTransformacionCompletada,
  configuracionStock,
}) {
  const [paso, setPaso] = useState('seleccion'); // 'seleccion' | 'configuracion'
  const [tipoDestino, setTipoDestino] = useState('');
  const [esDuplicacion, setEsDuplicacion] = useState(false);
  const [serieSeleccionada, setSerieSeleccionada] = useState('');
  const [fechaTransformacion, setFechaTransformacion] = useState(new Date().toISOString().split('T')[0]);
  const [estadoTransformacion, setEstadoTransformacion] = useState('Pendiente');
  const [seriesDestino, setSeriesDestino] = useState([]);
  const [cargandoSeries, setCargandoSeries] = useState(false);
  const [ejecutando, setEjecutando] = useState(false);
  const [mostrarWarningStock, setMostrarWarningStock] = useState(false);
  const [pendienteEjecutar, setPendienteEjecutar] = useState(false);
  
  // Estados para selector de cliente/proveedor cuando se transforma entre ventas y compra
  const [clienteId, setClienteId] = useState('');
  const [proveedorId, setProveedorId] = useState('');
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);
  const [clientesLista, setClientesLista] = useState([]);
  const [proveedoresLista, setProveedoresLista] = useState([]);
  const [busquedaCliente, setBusquedaCliente] = useState('');
  const [busquedaProveedor, setBusquedaProveedor] = useState('');
  const [mostrarClientes, setMostrarClientes] = useState(false);
  const [mostrarProveedores, setMostrarProveedores] = useState(false);
  const dropdownClienteRef = useRef(null);
  const dropdownProveedorRef = useRef(null);

  // Reset al abrir
  useEffect(() => {
    if (abierto) {
      setPaso('seleccion');
      setTipoDestino('');
      setEsDuplicacion(false);
      setSerieSeleccionada('');
      setFechaTransformacion(new Date().toISOString().split('T')[0]);
      setEstadoTransformacion('Pendiente');
      setSeriesDestino([]);
      setMostrarWarningStock(false);
      setPendienteEjecutar(false);
      setClienteId('');
      setProveedorId('');
      setClienteSeleccionado(null);
      setProveedorSeleccionado(null);
      setBusquedaCliente('');
      setBusquedaProveedor('');
      setMostrarClientes(false);
      setMostrarProveedores(false);
      // Cargar clientes y proveedores
      cargarClientes();
      cargarProveedores();
    }
  }, [abierto]);

  // Cargar series al seleccionar tipo destino
  const cargarSeriesParaTipo = useCallback(async (tipoSerie) => {
    setCargandoSeries(true);
    try {
      const response = await fetch(`${API_ENDPOINTS.series}?tipoDocumento=${tipoSerie}`);
      if (response.ok) {
        const data = await response.json();
        setSeriesDestino(data);
      }
    } catch (err) {
      console.error('Error al cargar series:', err);
    } finally {
      setCargandoSeries(false);
    }
  }, []);

  const seleccionarTipo = useCallback((tipo, duplicar = false) => {
    setTipoDestino(tipo);
    setEsDuplicacion(duplicar);
    setPaso('configuracion');

    const tipoInfo = duplicar ? TODOS_LOS_TIPOS[tipoDocumentoActual] : TODOS_LOS_TIPOS[tipo];
    if (tipoInfo?.serie) {
      cargarSeriesParaTipo(tipoInfo.serie);
    }
  }, [tipoDocumentoActual, cargarSeriesParaTipo]);

  // Cargar clientes y proveedores
  const cargarClientes = useCallback(async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.clientes}?page=0&size=1000`);
      if (response.ok) {
        const data = await response.json();
        setClientesLista(data.content || data);
      }
    } catch (err) {
      console.error('Error al cargar clientes:', err);
    }
  }, []);

  const cargarProveedores = useCallback(async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.proveedores}?page=0&size=1000`);
      if (response.ok) {
        const data = await response.json();
        setProveedoresLista(data.content || data);
      }
    } catch (err) {
      console.error('Error al cargar proveedores:', err);
    }
  }, []);

  // Filtrar clientes y proveedores localmente
  const filtrarClientes = useCallback((query) => {
    if (!query || query.trim().length < 3) {
      return [];
    }
    const busquedaLower = query.toLowerCase();
    return clientesLista.filter(c => {
      const coincideNombreComercial = c.nombreComercial?.toLowerCase().includes(busquedaLower);
      const coincideNombreFiscal = c.nombreFiscal?.toLowerCase().includes(busquedaLower);
      const coincideNif = c.nifCif?.toLowerCase().includes(busquedaLower);
      const coincideReferencia = c.referencia?.toLowerCase().includes(busquedaLower);
      return coincideNombreComercial || coincideNombreFiscal || coincideNif || coincideReferencia;
    }).slice(0, 50);
  }, [clientesLista]);

  const filtrarProveedores = useCallback((query) => {
    if (!query || query.trim().length < 3) {
      return [];
    }
    const busquedaLower = query.toLowerCase();
    return proveedoresLista.filter(p => {
      const coincideNombreComercial = p.nombreComercial?.toLowerCase().includes(busquedaLower);
      const coincideNombreFiscal = p.nombreFiscal?.toLowerCase().includes(busquedaLower);
      const coincideNif = p.nifCif?.toLowerCase().includes(busquedaLower);
      const coincideReferencia = p.referencia?.toLowerCase().includes(busquedaLower);
      return coincideNombreComercial || coincideNombreFiscal || coincideNif || coincideReferencia;
    }).slice(0, 50);
  }, [proveedoresLista]);

  const handleInputClienteChange = (e) => {
    const valor = e.target.value;
    setBusquedaCliente(valor);
    setMostrarClientes(true);
    if (!valor.trim()) {
      setClienteId('');
    }
  };

  const handleInputProveedorChange = (e) => {
    const valor = e.target.value;
    setBusquedaProveedor(valor);
    setMostrarProveedores(true);
    if (!valor.trim()) {
      setProveedorId('');
    }
  };

  const seleccionarCliente = useCallback((cliente) => {
    setClienteId(cliente.id);
    setClienteSeleccionado(cliente);
    setBusquedaCliente(cliente.nombreComercial || '');
    setMostrarClientes(false);
  }, []);

  const seleccionarProveedor = useCallback((proveedor) => {
    setProveedorId(proveedor.id);
    setProveedorSeleccionado(proveedor);
    setBusquedaProveedor(proveedor.nombreComercial || '');
    setMostrarProveedores(false);
  }, []);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownClienteRef.current && !dropdownClienteRef.current.contains(event.target)) {
        setMostrarClientes(false);
      }
      if (dropdownProveedorRef.current && !dropdownProveedorRef.current.contains(event.target)) {
        setMostrarProveedores(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Verificar si necesita confirmación de stock
  const necesitaConfirmacionStock = useCallback(() => {
    if (estadoTransformacion !== 'Emitido') return false;
    const docDescuentaStock = configuracionStock?.documentoDescuentaStock || 'ALBARAN';
    const destinoReal = esDuplicacion ? tipoDocumentoActual : tipoDestino;

    // Caso 1: Transformar a Albarán Emitido y config = ALBARAN
    if (destinoReal === 'ALBARAN_COMPRA' && docDescuentaStock === 'ALBARAN') {
      return true;
    }

    // Caso 2: Transformar a Factura Emitido y config = FACTURA
    if (destinoReal === 'FACTURA_COMPRA' && docDescuentaStock === 'FACTURA') {
      // Caso 3: Si viene de albarán emitido y config = ALBARAN → NO pedir confirmación
      if (tipoDocumentoActual === 'ALBARAN_COMPRA' && documento?.estado === 'Emitido' && docDescuentaStock === 'ALBARAN') {
        return false;
      }
      return true;
    }

    // Caso 3 directo: Albarán→Factura emitido, config ALBARAN, albarán ya emitido → NO confirmar
    if (destinoReal === 'FACTURA_COMPRA' && tipoDocumentoActual === 'ALBARAN_COMPRA' && documento?.estado === 'Emitido' && docDescuentaStock === 'ALBARAN') {
      return false;
    }

    return false;
  }, [estadoTransformacion, configuracionStock, tipoDestino, tipoDocumentoActual, esDuplicacion, documento]);

  const ejecutarTransformacion = useCallback(async () => {
    if (!documento?.id) return;

    // Verificar si necesita confirmación de stock
    if (necesitaConfirmacionStock() && !pendienteEjecutar) {
      setMostrarWarningStock(true);
      setPendienteEjecutar(true);
      return;
    }

    setEjecutando(true);
    try {
      const destinoReal = esDuplicacion ? tipoDocumentoActual : tipoDestino;
      const endpointKey = TODOS_LOS_TIPOS[destinoReal]?.endpoint;
      if (!endpointKey) {
        alert('Tipo de documento destino no válido');
        return;
      }

      const baseUrl = API_ENDPOINTS[endpointKey];
      const body = {
        tipoOrigen: tipoDocumentoActual,
        idOrigen: documento.id,
        tipoDestino: destinoReal,
        serieId: serieSeleccionada ? parseInt(serieSeleccionada) : null,
        fecha: fechaTransformacion,
        estado: estadoTransformacion,
        esDuplicacion: esDuplicacion,
      };

      // Añadir clienteId o proveedorId según el tipo de transformación
      const origenEsVentas = TODOS_LOS_TIPOS[tipoDocumentoActual]?.tipo === 'ventas';
      const destinoEsCompra = TODOS_LOS_TIPOS[destinoReal]?.tipo === 'compra';
      const destinoEsVentas = TODOS_LOS_TIPOS[destinoReal]?.tipo === 'ventas';

      // Si el origen es ventas y destino es compra → necesitamos proveedorId
      if (origenEsVentas && destinoEsCompra && proveedorId) {
        body.proveedorId = parseInt(proveedorId);
      }
      // Si el origen es compra y destino es ventas → necesitamos clienteId
      if (!origenEsVentas && destinoEsVentas && clienteId) {
        body.clienteId = parseInt(clienteId);
      }

      const response = await fetch(`${baseUrl}/transformar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const resultado = await response.json();
        const tipoLabel = esDuplicacion ? 'Duplicado' : TODOS_LOS_TIPOS[destinoReal]?.label || destinoReal;
        alert(`${tipoLabel} ${resultado.numero} creado correctamente`);
        cerrar();
        if (onTransformacionCompletada) {
          onTransformacionCompletada(resultado, destinoReal);
        }
      } else {
        const error = await response.json().catch(() => ({}));
        alert(`Error: ${error.error || 'Error al transformar documento'}`);
      }
    } catch (err) {
      console.error('Error al transformar:', err);
      alert('Error al transformar el documento');
    } finally {
      setEjecutando(false);
      setMostrarWarningStock(false);
      setPendienteEjecutar(false);
    }
  }, [documento, tipoDocumentoActual, tipoDestino, esDuplicacion, serieSeleccionada, fechaTransformacion, estadoTransformacion, cerrar, onTransformacionCompletada, necesitaConfirmacionStock, pendienteEjecutar]);

  // Ejecutar tras confirmar warning de stock
  useEffect(() => {
    if (pendienteEjecutar && !mostrarWarningStock) {
      ejecutarTransformacion();
    }
  }, [pendienteEjecutar, mostrarWarningStock]);

  if (!abierto || !documento) return null;

  const opcionesTransformacion = [
    { tipo: 'DUPLICAR', label: `Duplicar ${TODOS_LOS_TIPOS[tipoDocumentoActual]?.label || ''}`, icon: IconDuplicate, className: 'erp-btn-secondary', duplicar: true },
    ...Object.entries(TODOS_LOS_TIPOS)
      .filter(([key]) => key !== tipoDocumentoActual)
      .map(([key, val]) => ({
        tipo: key,
        label: `Crear ${val.label}`,
        icon: IconDocument,
        className: key === 'FACTURA' || key === 'FACTURA_COMPRA' ? 'erp-btn-success' : 'erp-btn-info',
        duplicar: false,
      })),
  ];

  return (
    <>
      <div className="erp-modal-overlay" onClick={cerrar}>
        <div className="erp-modal" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '90vh', overflow: 'auto' }}>
          <div className="erp-modal-header">
            <h3>
              <IconTransform className="erp-action-icon" style={{ marginRight: '8px' }} />
              Transformar {TODOS_LOS_TIPOS[tipoDocumentoActual]?.label} {documento.numero}
            </h3>
            <button className="erp-modal-close" onClick={cerrar}>×</button>
          </div>
          <div className="erp-modal-body">
            {paso === 'seleccion' ? (
              <>
                <p style={{ marginBottom: '20px', color: '#6b7280' }}>
                  Selecciona qué acción deseas realizar con este documento:
                </p>
                <div className="erp-transform-options">
                  {opcionesTransformacion.map(opcion => {
                    const Icon = opcion.icon;
                    return (
                      <button
                        key={opcion.tipo}
                        className={`erp-btn ${opcion.className} erp-btn-block`}
                        onClick={() => seleccionarTipo(opcion.duplicar ? tipoDocumentoActual : opcion.tipo, opcion.duplicar)}
                      >
                        <Icon className="erp-action-icon" /> {opcion.label}
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <>
                <p style={{ marginBottom: '20px', color: '#6b7280' }}>
                  Configura los datos del nuevo documento:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <label className="erp-field">
                    <span className="erp-field-label">Serie</span>
                    <select
                      value={serieSeleccionada}
                      onChange={(e) => setSerieSeleccionada(e.target.value)}
                      className="erp-input"
                      disabled={cargandoSeries}
                    >
                      <option value="">Sin serie</option>
                      {seriesDestino.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.prefijo} — {s.descripcion || 'Sin descripción'}
                        </option>
                      ))}
                    </select>
                    {cargandoSeries && (
                      <small style={{ color: '#6b7280', marginTop: '4px', display: 'block' }}>
                        Cargando series...
                      </small>
                    )}
                  </label>
                  <label className="erp-field">
                    <span className="erp-field-label">Fecha</span>
                    <input
                      type="date"
                      value={fechaTransformacion}
                      onChange={(e) => setFechaTransformacion(e.target.value)}
                      className="erp-input"
                    />
                  </label>
                  <label className="erp-field">
                    <span className="erp-field-label">Estado</span>
                    <select
                      value={estadoTransformacion}
                      onChange={(e) => setEstadoTransformacion(e.target.value)}
                      className="erp-input"
                    >
                      {estadoOptions.map(e => (
                        <option key={e.nombre} value={e.nombre}>{e.nombre}</option>
                      ))}
                    </select>
                  </label>

                  {/* Selector de Cliente - cuando origen es compra y destino es ventas */}
                  {TODOS_LOS_TIPOS[tipoDocumentoActual]?.tipo === 'compra' && TODOS_LOS_TIPOS[tipoDestino]?.tipo === 'ventas' && (
                    <div className="erp-field" ref={dropdownClienteRef}>
                      <span className="erp-field-label">Cliente *</span>
                      {clienteSeleccionado ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', background: '#f3f4f6', borderRadius: '4px' }}>
                          <span style={{ flex: 1 }}>{clienteSeleccionado.nombreComercial || clienteSeleccionado.nombreFiscal}</span>
                          <button 
                            className="erp-btn erp-btn-sm erp-btn-secondary"
                            onClick={() => { setClienteId(''); setClienteSeleccionado(null); setBusquedaCliente(''); }}
                          >
                            Cambiar
                          </button>
                        </div>
                      ) : (
                        <div style={{ position: 'relative' }}>
                          <input
                            type="text"
                            placeholder="Buscar cliente..."
                            className="erp-input"
                            value={busquedaCliente}
                            onChange={handleInputClienteChange}
                            onFocus={() => setMostrarClientes(true)}
                            style={{ width: '100%' }}
                          />
                          <IconSearch style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', width: '16px', height: '16px' }} />
                          
                          {/* Mensaje: escribe al menos 3 caracteres */}
                          {busquedaCliente.trim().length > 0 && busquedaCliente.trim().length < 3 && (
                            <div style={{
                              position: 'absolute',
                              top: '100%',
                              left: 0,
                              right: 0,
                              backgroundColor: '#fffbeb',
                              border: '1px solid #fbbf24',
                              borderRadius: '6px',
                              padding: '8px 12px',
                              zIndex: 1000,
                              marginTop: '4px',
                              fontSize: '12px',
                              color: '#92400e'
                            }}>
                              Escribe al menos 3 caracteres para buscar...
                            </div>
                          )}
                          
                          {/* Lista de resultados */}
                          {mostrarClientes && busquedaCliente.trim().length >= 3 && (
                            <div style={{
                              position: 'absolute',
                              top: '100%',
                              left: 0,
                              right: 0,
                              backgroundColor: 'white',
                              border: '1px solid #e2e8f0',
                              borderRadius: '6px',
                              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                              maxHeight: '200px',
                              overflowY: 'auto',
                              zIndex: 1000,
                              marginTop: '4px'
                            }}>
                              {filtrarClientes(busquedaCliente).length === 0 ? (
                                <div style={{ padding: '8px 12px', fontSize: '13px', color: '#6b7280' }}>
                                  No se encontraron clientes
                                </div>
                              ) : (
                                filtrarClientes(busquedaCliente).map((cliente) => (
                                  <div
                                    key={cliente.id}
                                    onClick={() => seleccionarCliente(cliente)}
                                    style={{
                                      padding: '8px 12px',
                                      cursor: 'pointer',
                                      borderBottom: '1px solid #f1f5f9',
                                      fontSize: '13px'
                                    }}
                                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f8fafc'}
                                    onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                                  >
                                    <div style={{ fontWeight: '500', color: '#1e293b' }}>
                                      {cliente.nombreComercial}
                                    </div>
                                    {cliente.nombreFiscal && cliente.nombreFiscal !== cliente.nombreComercial && (
                                      <div style={{ color: '#64748b', fontSize: '12px' }}>
                                        {cliente.nombreFiscal}
                                      </div>
                                    )}
                                    {cliente.nifCif && (
                                      <div style={{ color: '#059669', fontSize: '11px', marginTop: '2px' }}>
                                        CIF/NIF: {cliente.nifCif}
                                      </div>
                                    )}
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Selector de Proveedor - cuando origen es ventas y destino es compra */}
                  {TODOS_LOS_TIPOS[tipoDocumentoActual]?.tipo === 'ventas' && TODOS_LOS_TIPOS[tipoDestino]?.tipo === 'compra' && (
                    <div className="erp-field" ref={dropdownProveedorRef}>
                      <span className="erp-field-label">Proveedor *</span>
                      {proveedorSeleccionado ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', background: '#f3f4f6', borderRadius: '4px' }}>
                          <span style={{ flex: 1 }}>{proveedorSeleccionado.nombreComercial || proveedorSeleccionado.nombreFiscal}</span>
                          <button 
                            className="erp-btn erp-btn-sm erp-btn-secondary"
                            onClick={() => { setProveedorId(''); setProveedorSeleccionado(null); setBusquedaProveedor(''); }}
                          >
                            Cambiar
                          </button>
                        </div>
                      ) : (
                        <div style={{ position: 'relative' }}>
                          <input
                            type="text"
                            placeholder="Buscar proveedor..."
                            className="erp-input"
                            value={busquedaProveedor}
                            onChange={handleInputProveedorChange}
                            onFocus={() => setMostrarProveedores(true)}
                            style={{ width: '100%' }}
                          />
                          <IconSearch style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', width: '16px', height: '16px' }} />
                          
                          {/* Mensaje: escribe al menos 3 caracteres */}
                          {busquedaProveedor.trim().length > 0 && busquedaProveedor.trim().length < 3 && (
                            <div style={{
                              position: 'absolute',
                              top: '100%',
                              left: 0,
                              right: 0,
                              backgroundColor: '#fffbeb',
                              border: '1px solid #fbbf24',
                              borderRadius: '6px',
                              padding: '8px 12px',
                              zIndex: 1000,
                              marginTop: '4px',
                              fontSize: '12px',
                              color: '#92400e'
                            }}>
                              Escribe al menos 3 caracteres para buscar...
                            </div>
                          )}
                          
                          {/* Lista de resultados */}
                          {mostrarProveedores && busquedaProveedor.trim().length >= 3 && (
                            <div style={{
                              position: 'absolute',
                              top: '100%',
                              left: 0,
                              right: 0,
                              backgroundColor: 'white',
                              border: '1px solid #e2e8f0',
                              borderRadius: '6px',
                              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                              maxHeight: '200px',
                              overflowY: 'auto',
                              zIndex: 1000,
                              marginTop: '4px'
                            }}>
                              {filtrarProveedores(busquedaProveedor).length === 0 ? (
                                <div style={{ padding: '8px 12px', fontSize: '13px', color: '#6b7280' }}>
                                  No se encontraron proveedores
                                </div>
                              ) : (
                                filtrarProveedores(busquedaProveedor).map((proveedor) => (
                                  <div
                                    key={proveedor.id}
                                    onClick={() => seleccionarProveedor(proveedor)}
                                    style={{
                                      padding: '8px 12px',
                                      cursor: 'pointer',
                                      borderBottom: '1px solid #f1f5f9',
                                      fontSize: '13px'
                                    }}
                                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f8fafc'}
                                    onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                                  >
                                    <div style={{ fontWeight: '500', color: '#1e293b' }}>
                                      {proveedor.nombreComercial}
                                    </div>
                                    {proveedor.nombreFiscal && proveedor.nombreFiscal !== proveedor.nombreComercial && (
                                      <div style={{ color: '#64748b', fontSize: '12px' }}>
                                        {proveedor.nombreFiscal}
                                      </div>
                                    )}
                                    {proveedor.nifCif && (
                                      <div style={{ color: '#059669', fontSize: '11px', marginTop: '2px' }}>
                                        CIF/NIF: {proveedor.nifCif}
                                      </div>
                                    )}
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                  <button
                    className="erp-btn erp-btn-secondary"
                    onClick={() => setPaso('seleccion')}
                  >
                    Atrás
                  </button>
                  <button
                    className="erp-btn erp-btn-primary"
                    onClick={ejecutarTransformacion}
                    style={{ flex: 1 }}
                    disabled={ejecutando}
                  >
                    {ejecutando ? 'Procesando...' : (esDuplicacion ? 'Duplicar' : 'Confirmar Transformación')}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal de confirmación de stock */}
      {mostrarWarningStock && (
        <div className="erp-modal-overlay" style={{ zIndex: 10001 }} onClick={() => {}}>
          <div className="erp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="erp-modal-header">
              <h3>Confirmar cambio de stock</h3>
            </div>
            <div className="erp-modal-body">
              <p>El documento se creará con estado <strong>"Emitido"</strong>, lo que <strong>incrementará el stock</strong> de los productos.</p>
              <p>¿Desea continuar?</p>
            </div>
            <div className="erp-modal-footer" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button
                className="erp-btn erp-btn-secondary"
                onClick={() => {
                  setMostrarWarningStock(false);
                  setPendienteEjecutar(false);
                }}
              >
                Cancelar
              </button>
              <button
                className="erp-btn erp-btn-primary"
                onClick={() => {
                  setMostrarWarningStock(false);
                  // pendienteEjecutar stays true, useEffect will trigger ejecutarTransformacion
                }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ModalTransformarCompra;
