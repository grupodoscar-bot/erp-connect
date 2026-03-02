import { useState, useEffect } from "react";
import { ReactComponent as DocumentoIcon } from "../../../Recursos/iconos/documento.svg";

const API_BASE = "http://145.223.103.219:8080";

export default function UltimosAlbaranesWidget({ widgetId, meta, isDisabled, onAlbaranClick }) {
  const [albaranes, setAlbaranes] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUltimosAlbaranes = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/albaranes`);
        if (!res.ok) {
          throw new Error("No se pudieron cargar los albaranes");
        }
        const data = await res.json();
        // Sort by date descending and take first 4
        const sortedAlbaranes = Array.isArray(data) 
          ? data.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, 4)
          : [];
        setAlbaranes(sortedAlbaranes);
      } catch (err) {
        console.error(err);
        setError("Error al cargar albaranes");
      } finally {
        setLoading(false);
      }
    };

    fetchUltimosAlbaranes();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", { 
      day: "2-digit", 
      month: "2-digit", 
      year: "2-digit" 
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getEstadoColor = (estado) => {
    switch (estado?.toLowerCase()) {
      case "pendiente":
        return "#f59e0b";
      case "completado":
        return "#10b981";
      case "facturado":
        return "#3b82f6";
      case "cancelado":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  if (isLoading) {
    return (
      <div className="erp-widget-card erp-widget-card--ultimos-albaranes">
        <header>
          <DocumentoIcon />
          <div>
            <strong>Últimos Albaranes</strong>
            <small>Cargando...</small>
          </div>
        </header>
        <div className="erp-widget-card__body">
          <div className="erp-loading-spinner">
            <div className="erp-spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="erp-widget-card erp-widget-card--ultimos-albaranes">
        <header>
          <DocumentoIcon />
          <div>
            <strong>Últimos Albaranes</strong>
            <small>Error</small>
          </div>
        </header>
        <div className="erp-widget-card__body">
          <p className="erp-widget-card__hint">{error}</p>
        </div>
      </div>
    );
  }

  if (albaranes.length === 0) {
    return (
      <div className="erp-widget-card erp-widget-card--ultimos-albaranes">
        <header>
          <DocumentoIcon />
          <div>
            <strong>Últimos Albaranes</strong>
            <small>Sin datos</small>
          </div>
        </header>
        <div className="erp-widget-card__body">
          <p className="erp-widget-card__hint">No hay albaranes registrados</p>
        </div>
      </div>
    );
  }

  return (
    <div className="erp-widget-card erp-widget-card--ultimos-albaranes">
      <header>
        <DocumentoIcon />
        <div>
          <strong>Últimos Albaranes</strong>
          <small>Últimos 4 registros</small>
        </div>
      </header>
      <div className="erp-widget-card__body">
        <div className="erp-ultimos-albaranes-list">
          {albaranes.map((albaran) => (
            <div 
              key={albaran.id} 
              className="erp-ultimos-albaranes-item"
              onClick={() => onAlbaranClick && onAlbaranClick(albaran)}
              style={{ cursor: onAlbaranClick ? "pointer" : "default" }}
            >
              <div className="erp-ultimos-albaranes-main">
                <div className="erp-ultimos-albaranes-numero">
                  {albaran.numero}
                </div>
                <div className="erp-ultimos-albaranes-info">
                  <div className="erp-ultimos-albaranes-fecha">
                    {formatDate(albaran.fecha)}
                  </div>
                  <div className="erp-ultimos-albaranes-cliente">
                    {albaran.cliente?.nombreComercial || "Sin cliente"}
                  </div>
                </div>
              </div>
              <div className="erp-ultimos-albaranes-right">
                <div 
                  className="erp-ultimos-albaranes-estado"
                  style={{ color: getEstadoColor(albaran.estado) }}
                >
                  {albaran.estado || "Pendiente"}
                </div>
                <div className="erp-ultimos-albaranes-total">
                  {formatCurrency(albaran.total)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
