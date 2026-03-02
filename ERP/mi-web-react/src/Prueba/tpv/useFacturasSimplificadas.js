import { useState, useCallback, useEffect } from "react";

const API_URL = "http://145.223.103.219:8080/facturas-simplificadas";

export function useFacturasSimplificadas({ setMensaje, abrirPestana, cerrarPestana, pestanaActiva, imprimirTicketTPV }) {
  const [todasLasFacturas, setTodasLasFacturas] = useState(null);
  const [facturasSimplificadas, setFacturasSimplificadas] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [paginaActual, setPaginaActual] = useState(0);
  const [itemsPorPagina, setItemsPorPagina] = useState(10);
  const [totalElementos, setTotalElementos] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [ordenarPor, setOrdenarPor] = useState("fecha");
  const [ordenDireccion, setOrdenDireccion] = useState("desc");

  const cargarTodasLasFacturas = useCallback(async () => {
    if (todasLasFacturas !== null) return;
    
    try {
      setCargando(true);
      const res = await fetch(API_URL);
      const data = await res.json();
      const facturas = Array.isArray(data) ? data : [];
      setTodasLasFacturas(facturas);
      setTotalElementos(facturas.length);
    } catch (err) {
      console.error("Error cargando facturas simplificadas:", err);
      setMensaje("Error al cargar facturas simplificadas");
      setTodasLasFacturas([]);
    } finally {
      setCargando(false);
    }
  }, [todasLasFacturas, setMensaje]);

  const cargarFacturasSimplificadas = useCallback(async () => {
    setTodasLasFacturas(null);
    setPaginaActual(0);
  }, []);

  useEffect(() => {
    cargarTodasLasFacturas();
  }, [cargarTodasLasFacturas]);

  useEffect(() => {
    if (!todasLasFacturas) return;
    
    let facturasOrdenadas = [...todasLasFacturas];
    facturasOrdenadas.sort((a, b) => {
      let valorA, valorB;
      
      switch (ordenarPor) {
        case "numero":
          valorA = a.numero || "";
          valorB = b.numero || "";
          break;
        case "fecha":
          valorA = new Date(a.fecha || 0);
          valorB = new Date(b.fecha || 0);
          break;
        case "total":
          valorA = a.total || 0;
          valorB = b.total || 0;
          break;
        default:
          return 0;
      }
      
      if (valorA < valorB) return ordenDireccion === "asc" ? -1 : 1;
      if (valorA > valorB) return ordenDireccion === "asc" ? 1 : -1;
      return 0;
    });
    
    const inicio = paginaActual * itemsPorPagina;
    const fin = inicio + itemsPorPagina;
    const facturasPaginadas = facturasOrdenadas.slice(inicio, fin);
    
    setFacturasSimplificadas(facturasPaginadas);
    setTotalPaginas(Math.ceil(todasLasFacturas.length / itemsPorPagina));
  }, [todasLasFacturas, paginaActual, itemsPorPagina, ordenarPor, ordenDireccion]);

  const abrirVerFactura = useCallback((factura) => {
    abrirPestana("factura-simplificada-ver", factura.id, `Ticket ${factura.numero}`);
  }, [abrirPestana]);

  const borrarFactura = useCallback(async (id) => {
    if (!window.confirm("¿Eliminar esta factura simplificada?")) return;
    try {
      await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      setMensaje("Factura simplificada eliminada");
      cargarFacturasSimplificadas();
    } catch (err) {
      console.error(err);
      setMensaje("Error al eliminar factura simplificada");
    }
  }, [setMensaje, cargarFacturasSimplificadas]);

  const imprimirFactura = useCallback((factura) => {
    if (imprimirTicketTPV) {
      imprimirTicketTPV(factura);
    } else {
      setMensaje("Función de impresión no disponible");
    }
  }, [imprimirTicketTPV, setMensaje]);

  const cambiarOrdenacion = useCallback((campo) => {
    if (ordenarPor === campo) {
      setOrdenDireccion(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setOrdenarPor(campo);
      setOrdenDireccion("desc");
    }
    setPaginaActual(0);
  }, [ordenarPor]);

  return {
    facturasSimplificadas,
    cargando,
    cargarFacturasSimplificadas,
    abrirVerFactura,
    borrarFactura,
    imprimirFactura,
    paginaActual,
    setPaginaActual,
    itemsPorPagina,
    setItemsPorPagina,
    totalElementos,
    totalPaginas,
    ordenarPor,
    ordenDireccion,
    cambiarOrdenacion,
  };
}
