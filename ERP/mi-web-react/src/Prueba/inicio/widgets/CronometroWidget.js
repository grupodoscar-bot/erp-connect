import { useState, useEffect, useRef } from "react";

const MS_IN_SECOND = 1000;
const MS_IN_MIN = 60 * MS_IN_SECOND;
const MS_IN_HOUR = 60 * MS_IN_MIN;

export default function CronometroWidget({ widgetId, meta = {} }) {
  const [elapsedMs, setElapsedMs] = useState(() => Number(meta.elapsedMs) || 0);
  const [isRunning, setIsRunning] = useState(() => Boolean(meta.isRunning));
  const tickRef = useRef(null);
  const lastTickTime = useRef(null);

  useEffect(() => {
    setElapsedMs(Number(meta.elapsedMs) || 0);
    setIsRunning(Boolean(meta.isRunning));
  }, [meta]);

  useEffect(() => {
    if (!isRunning) {
      cancelAnimationFrame(tickRef.current);
      lastTickTime.current = null;
      return;
    }

    const step = (timestamp) => {
      if (!lastTickTime.current) {
        lastTickTime.current = timestamp;
      }
      const delta = timestamp - lastTickTime.current;
      if (delta >= 200) {
        setElapsedMs(prev => prev + delta);
        lastTickTime.current = timestamp;
      }
      tickRef.current = requestAnimationFrame(step);
    };

    tickRef.current = requestAnimationFrame(step);

    return () => cancelAnimationFrame(tickRef.current);
  }, [isRunning]);

  const handleToggle = () => {
    setIsRunning(prev => !prev);
  };

  const handleReset = () => {
    setElapsedMs(0);
    setIsRunning(false);
  };

  const formatParts = (ms) => {
    const hours = Math.floor(ms / MS_IN_HOUR);
    const minutes = Math.floor((ms % MS_IN_HOUR) / MS_IN_MIN);
    const seconds = Math.floor((ms % MS_IN_MIN) / MS_IN_SECOND);
    return {
      hours,
      minutes: String(minutes).padStart(2, "0"),
      seconds: String(seconds).padStart(2, "0"),
    };
  };

  const { hours, minutes, seconds } = formatParts(elapsedMs);
  const timeLabel = hours > 0 ? `${String(hours).padStart(2, "0")}:${minutes}:${seconds}` : `${minutes}:${seconds}`;
  const statusText = isRunning ? "Cronómetro en marcha" : "Detenido";

  return (
    <article className="erp-widget-card erp-widget-card--cronometro" aria-labelledby={`widget-${widgetId}-title`}>
      <header className="erp-crono-header">
        <span id={`widget-${widgetId}-title`} className="erp-crono-title">
          Cronómetro
        </span>
        <span className="erp-crono-subtitle">Controla tiempos rápidos</span>
      </header>

      <div className="erp-widget-card__body erp-crono-body">
        <div className="erp-crono-face">
          <span className="erp-crono-time__main">{timeLabel}</span>
          <span className="erp-crono-time__sub">Tiempo transcurrido</span>
        </div>

        <p className="erp-crono-status">{statusText}</p>

        <div className="erp-widget-card__actions erp-crono-actions">
          <button type="button" className="erp-btn erp-btn-primary erp-btn-sm" onClick={handleToggle}>
            {isRunning ? "Pausar" : "Iniciar"}
          </button>
          <button type="button" className="erp-btn erp-btn-secondary erp-btn-sm" onClick={handleReset}>
            Reiniciar
          </button>
        </div>
      </div>
    </article>
  );
}
