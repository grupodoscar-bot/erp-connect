import { useState, useEffect, useCallback, useRef } from 'react';
import API_ENDPOINTS from '../../config/api';

const API_URL_STOCK = API_ENDPOINTS.productoAlmacen;

export function useStockProductos(productos = [], almacenId = null) {
  const [stockPorProducto, setStockPorProducto] = useState({});
  const [cargandoStock, setCargandoStock] = useState(false);
  
  // Referencias para trackear estado sin causar re-renders
  const productosCargadosRef = useRef('');
  const almacenCargadoRef = useRef(null);
  const stockActualRef = useRef({});

  const cargarStock = useCallback(async (forzarRecarga = false) => {
    if (!productos.length) {
      setStockPorProducto({});
      stockActualRef.current = {};
      productosCargadosRef.current = '';
      return;
    }

    // Crear clave única para estos productos (IDs ordenados)
    const claveProductos = productos
      .map(p => p.id)
      .filter(Boolean)
      .sort()
      .join(',');
    
    // Si ya cargamos para estos mismos productos y almacén, no recargar
    if (!forzarRecarga && 
        claveProductos === productosCargadosRef.current && 
        almacenId === almacenCargadoRef.current) {
      return;
    }

    setCargandoStock(true);
    try {
      const stockMap = {};
      
      // Cargar stock para cada producto
      for (const producto of productos) {
        if (!producto.id) continue;
        
        // Si ya tenemos stock para este producto y almacén, reusarlo
        const stockExistente = stockActualRef.current[producto.id];
        if (!forzarRecarga && stockExistente && stockExistente.almacenId === almacenId) {
          stockMap[producto.id] = stockExistente;
          continue;
        }
        
        try {
          const url = almacenId 
            ? `${API_URL_STOCK}/producto/${producto.id}/almacen/${almacenId}`
            : `${API_URL_STOCK}/producto/${producto.id}`;
          
          const response = await fetch(url);
          
          if (response.ok) {
            const data = await response.json();
            
            if (almacenId) {
              stockMap[producto.id] = {
                stock: data.stock || 0,
                almacenId: almacenId
              };
            } else {
              const stockTotal = Array.isArray(data) 
                ? data.reduce((sum, pa) => sum + (pa.stock || 0), 0)
                : 0;
              stockMap[producto.id] = {
                stock: stockTotal,
                almacenId: null
              };
            }
          } else if (response.status === 404) {
            stockMap[producto.id] = { 
              stock: 0, 
              almacenId: almacenId || null 
            };
          }
        } catch (error) {
          if (error.message !== 'Failed to fetch') {
            console.error(`Error al cargar stock del producto ${producto.id}:`, error);
          }
          stockMap[producto.id] = { stock: 0, almacenId: null };
        }
      }
      
      // Actualizar refs
      productosCargadosRef.current = claveProductos;
      almacenCargadoRef.current = almacenId;
      stockActualRef.current = stockMap;
      
      setStockPorProducto(stockMap);
    } catch (error) {
      console.error('Error al cargar stock de productos:', error);
    } finally {
      setCargandoStock(false);
    }
  }, [productos, almacenId]); // Eliminado stockPorProducto de dependencias

  useEffect(() => {
    cargarStock();
  }, [cargarStock]);

  const obtenerStock = useCallback((productoId, almacenIdEspecifico = null) => {
    if (!productoId) return null;
    
    const stockInfo = stockActualRef.current[productoId];
    if (!stockInfo) return null;
    
    // Si se especifica un almacén diferente al cargado, no podemos dar el stock exacto
    if (almacenIdEspecifico && stockInfo.almacenId && almacenIdEspecifico !== stockInfo.almacenId) {
      return null;
    }
    
    return stockInfo.stock;
  }, [stockPorProducto]);

  const verificarStockDisponible = useCallback((productoId, cantidad, almacenIdEspecifico = null) => {
    const stock = obtenerStock(productoId, almacenIdEspecifico);
    if (stock === null) return { disponible: true, mensaje: '' };
    
    if (stock < cantidad) {
      return {
        disponible: false,
        mensaje: `Stock insuficiente. Disponible: ${stock}, solicitado: ${cantidad}`
      };
    }
    
    return { disponible: true, mensaje: '' };
  }, [obtenerStock]);

  return {
    stockPorProducto,
    cargandoStock,
    obtenerStock,
    verificarStockDisponible,
    recargarStock: cargarStock
  };
}
