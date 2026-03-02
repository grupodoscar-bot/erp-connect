import React from "react";
import { IconChevronDown } from "../iconos";

export function TarifaSelector({
  tarifasDisponibles,
  tarifaSeleccionada,
  esMultitarifaPermitida,
  cargandoTarifas,
  onCambiarTarifa,
  disabled = false,
  esCompra = false
}) {
  // Filtrar tarifas según el contexto (compra o venta)
  const tarifasFiltradas = tarifasDisponibles.filter(tarifa => {
    if (!tarifa.tipoTarifa) return true; // Compatibilidad con tarifas antiguas
    
    if (esCompra) {
      // En compras, mostrar solo COMPRA y AMBAS
      return tarifa.tipoTarifa === 'COMPRA' || tarifa.tipoTarifa === 'AMBAS';
    } else {
      // En ventas, mostrar solo VENTA y AMBAS
      return tarifa.tipoTarifa === 'VENTA' || tarifa.tipoTarifa === 'AMBAS';
    }
  });

  if (!esMultitarifaPermitida || tarifasFiltradas.length <= 1) {
    // Modo tarifa única - solo mostrar información
    return (
      <div className="tarifa-selector-simple">
        <span className="tarifa-label">Tarifa:</span>
        <span className="tarifa-nombre">
          {tarifaSeleccionada?.nombre || "General"}
        </span>
        <style>{`
          .tarifa-selector-simple {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 4px 0;
            font-size: 14px;
          }

          .tarifa-label {
            font-weight: 500;
            color: #475569;
          }

          .tarifa-nombre {
            color: #0f172a;
            font-weight: 600;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="tarifa-selector">
      <label className="tarifa-selector-label">Tarifa de precios</label>

      <div className="tarifa-selector-wrapper">
        <select
          value={tarifaSeleccionada?.id || ""}
          onChange={(e) => {
            const tarifaId = e.target.value;
            if (tarifaId) {
              onCambiarTarifa(tarifaId);
            }
          }}
          disabled={disabled || cargandoTarifas}
          className="tarifa-selector-select"
        >
          <option value="">Seleccionar tarifa...</option>
          {tarifasFiltradas.map((tarifa) => (
            <option key={tarifa.id} value={tarifa.id}>
              {tarifa.nombre}
              {tarifa.esGeneral ? " (General)" : ""}
              {!tarifa.activa ? " (Inactiva)" : ""}
            </option>
          ))}
        </select>

        <div className="tarifa-selector-icon">
          <IconChevronDown />
        </div>
      </div>

      {tarifaSeleccionada && tarifaSeleccionada.descripcion && (
        <div className="tarifa-descripcion">
          <p>{tarifaSeleccionada.descripcion}</p>
        </div>
      )}

      <style>{`
        .tarifa-selector {
          width: 100%;
        }

        .tarifa-selector-label {
          display: block;
          font-weight: 500;
          color: #374151;
          margin-bottom: 6px;
          font-size: 14px;
        }

        .tarifa-selector-wrapper {
          position: relative;
          width: 100%;
        }

        .tarifa-selector-select {
          width: 100%;
          padding: 10px 40px 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: white;
          font-size: 14px;
          color: #374151;
          appearance: none;
          cursor: pointer;
        }

        .tarifa-selector-select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .tarifa-selector-select:disabled {
          background: #f9fafb;
          color: #9ca3af;
          cursor: not-allowed;
        }

        .tarifa-selector-icon {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          color: #6b7280;
        }

        .tarifa-selector-icon :global(svg) {
          width: 16px;
          height: 16px;
        }

        .tarifa-descripcion {
          margin-top: 6px;
          font-size: 13px;
          color: #64748b;
        }
      `}</style>
    </div>
  );
}
