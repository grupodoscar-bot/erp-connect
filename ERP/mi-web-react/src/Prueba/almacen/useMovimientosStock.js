import { useState, useEffect, useCallback } from 'react';

const API_URL = 'http://145.223.103.219:8080';

export function useMovimientosStock() {
  const [movimientos, setMovimientos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [paginacion, setPaginacion] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    pageSize: 50
  });

  const [filtros, setFiltros] = useState({
    productoId: null,
    almacenId: null,
    tipoMovimiento: null,
    documentoTipo: null,
    fechaInicio: null,
    fechaFin: null
  });

  const [tiposMovimiento, setTiposMovimiento] = useState([]);
  const [mostrarModalAjuste, setMostrarModalAjuste] = useState(false);
  const [guardandoAjuste, setGuardandoAjuste] = useState(false);

  const cargarTiposMovimiento = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/movimientos-stock/tipos`);
      if (response.ok) {
        const data = await response.json();
        setTiposMovimiento(data);
      }
    } catch (err) {
      console.error('Error cargando tipos de movimiento:', err);
    }
  }, []);

  const cargarMovimientos = useCallback(async (page = 0) => {
    setCargando(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: paginacion.pageSize.toString()
      });

      if (filtros.productoId) params.append('productoId', filtros.productoId);
      if (filtros.almacenId) params.append('almacenId', filtros.almacenId);
      if (filtros.tipoMovimiento) params.append('tipoMovimiento', filtros.tipoMovimiento);
      if (filtros.documentoTipo) params.append('documentoTipo', filtros.documentoTipo);
      if (filtros.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
      if (filtros.fechaFin) params.append('fechaFin', filtros.fechaFin);

      const response = await fetch(`${API_URL}/movimientos-stock?${params}`);
      if (!response.ok) throw new Error('Error al cargar movimientos');

      const data = await response.json();
      setMovimientos(data.content);
      setPaginacion({
        currentPage: data.currentPage,
        totalPages: data.totalPages,
        totalElements: data.totalElements,
        pageSize: data.pageSize
      });
    } catch (err) {
      setError(err.message);
      console.error('Error:', err);
    } finally {
      setCargando(false);
    }
  }, [filtros, paginacion.pageSize]);

  const cargarMovimientosProducto = useCallback(async (productoId, almacenId = null) => {
    setCargando(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: '0',
        size: '100'
      });
      if (almacenId) params.append('almacenId', almacenId);

      const response = await fetch(`${API_URL}/movimientos-stock/producto/${productoId}?${params}`);
      if (!response.ok) throw new Error('Error al cargar movimientos del producto');

      const data = await response.json();
      setMovimientos(data.content);
      setPaginacion({
        currentPage: data.currentPage,
        totalPages: data.totalPages,
        totalElements: data.totalElements,
        pageSize: data.pageSize
      });
    } catch (err) {
      setError(err.message);
      console.error('Error:', err);
    } finally {
      setCargando(false);
    }
  }, []);

  const cargarMovimientosDocumento = useCallback(async (tipo, id) => {
    setCargando(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/movimientos-stock/documento/${tipo}/${id}`);
      if (!response.ok) throw new Error('Error al cargar movimientos del documento');

      const data = await response.json();
      setMovimientos(data);
    } catch (err) {
      setError(err.message);
      console.error('Error:', err);
    } finally {
      setCargando(false);
    }
  }, []);

  const crearAjusteManual = useCallback(async (ajuste) => {
    setGuardandoAjuste(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/movimientos-stock/manual`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ajuste)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear ajuste manual');
      }

      const data = await response.json();
      setMostrarModalAjuste(false);
      cargarMovimientos(paginacion.currentPage);
      return data;
    } catch (err) {
      setError(err.message);
      console.error('Error:', err);
      throw err;
    } finally {
      setGuardandoAjuste(false);
    }
  }, [cargarMovimientos, paginacion.currentPage]);

  const aplicarFiltros = useCallback((nuevosFiltros) => {
    setFiltros(prev => ({ ...prev, ...nuevosFiltros }));
  }, []);

  const limpiarFiltros = useCallback(() => {
    setFiltros({
      productoId: null,
      almacenId: null,
      tipoMovimiento: null,
      documentoTipo: null,
      fechaInicio: null,
      fechaFin: null
    });
  }, []);

  const cambiarPagina = useCallback((nuevaPagina) => {
    cargarMovimientos(nuevaPagina);
  }, [cargarMovimientos]);

  const obtenerNombreTipoMovimiento = useCallback((tipo) => {
    const nombres = {
      'EMISION_ALBARAN': 'Emisión de Albarán',
      'REVERSION_ALBARAN': 'Reversión de Albarán',
      'EMISION_FACTURA': 'Emisión de Factura',
      'REVERSION_FACTURA': 'Reversión de Factura',
      'MODIFICACION_EMITIDO': 'Modificación en Emitido',
      'DIFERENCIA_ALBARAN_FACTURA': 'Diferencia Albarán-Factura',
      'EMISION_FACTURA_RECTIFICATIVA': 'Emisión Factura Rectificativa',
      'REVERSION_FACTURA_RECTIFICATIVA': 'Reversión Factura Rectificativa',
      'AJUSTE_MANUAL': 'Ajuste Manual'
    };
    return nombres[tipo] || tipo;
  }, []);

  const obtenerColorTipoMovimiento = useCallback((tipo) => {
    const colores = {
      'EMISION_ALBARAN': '#ef4444',
      'REVERSION_ALBARAN': '#10b981',
      'EMISION_FACTURA': '#ef4444',
      'REVERSION_FACTURA': '#10b981',
      'MODIFICACION_EMITIDO': '#f59e0b',
      'DIFERENCIA_ALBARAN_FACTURA': '#8b5cf6',
      'EMISION_FACTURA_RECTIFICATIVA': '#10b981',
      'REVERSION_FACTURA_RECTIFICATIVA': '#ef4444',
      'AJUSTE_MANUAL': '#3b82f6'
    };
    return colores[tipo] || '#6b7280';
  }, []);

  useEffect(() => {
    cargarTiposMovimiento();
    cargarMovimientos(0);
  }, [cargarTiposMovimiento]);

  return {
    movimientos,
    cargando,
    error,
    paginacion,
    filtros,
    tiposMovimiento,
    mostrarModalAjuste,
    guardandoAjuste,
    cargarMovimientos,
    cargarMovimientosProducto,
    cargarMovimientosDocumento,
    crearAjusteManual,
    aplicarFiltros,
    limpiarFiltros,
    cambiarPagina,
    setMostrarModalAjuste,
    obtenerNombreTipoMovimiento,
    obtenerColorTipoMovimiento
  };
}
