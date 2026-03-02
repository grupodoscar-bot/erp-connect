import { useState, useEffect, useMemo, useCallback } from "react";
import CronometroWidget from "./widgets/CronometroWidget";
import QuickAccessWidget from "./widgets/QuickAccessWidget";
import UltimosAlbaranesWidget from "./widgets/UltimosAlbaranesWidget";

const GRID_COLUMNS = 6;
const GRID_ROWS = 4;
const TOTAL_CELLS = GRID_COLUMNS * GRID_ROWS;
const API_BASE = "http://145.223.103.219:8080";

const clampSpanValue = (value, limit) => {
  const numeric = Number(value);
  const fallback = 1;
  const safe = Number.isFinite(numeric) && numeric > 0 ? numeric : fallback;
  return Math.min(safe, limit);
};

const isPositionOccupied = (widget, position) => {
  const widgetStart = widget.posicion;
  const widgetStartRow = Math.floor(widgetStart / GRID_COLUMNS);
  const widgetStartCol = widgetStart % GRID_COLUMNS;
  const { columns: widgetCols, rows: widgetRows } = getWidgetSpan(widget, widgetStartCol, widgetStartRow);
  
  for (let r = 0; r < widgetRows; r++) {
    for (let c = 0; c < widgetCols; c++) {
      const cellIndex = widgetStart + r * GRID_COLUMNS + c;
      if (cellIndex === position) {
        return true;
      }
    }
  }
  return false;
};

const getWidgetSpan = (widget, startColumn, startRow) => {
  const maxCols = Math.max(1, GRID_COLUMNS - startColumn);
  const maxRows = Math.max(1, GRID_ROWS - startRow);
  return {
    columns: clampSpanValue(widget.sizeW, maxCols),
    rows: clampSpanValue(widget.sizeH, maxRows),
  };
};

const QUICK_ACCESS_CATEGORY_ORDER = ["Terceros", "Almacén", "Empresa", "Ventas", "TPV", "Configuración"];

const WIDGET_LIBRARY = {
  cronometro: {
    type: "cronometro",
    name: "Cronómetro",
    description: "Controla tiempos rápidos desde el escritorio.",
    icon: "⏱️",
    Component: CronometroWidget,
    defaultSize: { w: 1, h: 1 },
    defaultMeta: {},
  },
  "acceso-rapido": {
    type: "acceso-rapido",
    name: "Acceso rápido",
    description: "Fija accesos a módulos del menú lateral.",
    icon: "⚡",
    Component: QuickAccessWidget,
    defaultSize: { w: 1, h: 1 },
    defaultMeta: { shortcutId: null, shortcutLabel: null },
  },
  "ultimos-albaranes": {
    type: "ultimos-albaranes",
    name: "Últimos Albaranes",
    description: "Muestra los últimos 4 albaranes registrados.",
    icon: "📄",
    Component: UltimosAlbaranesWidget,
    defaultSize: { w: 2, h: 2 },
    defaultMeta: {},
  },
};

export default function InicioPanel({ session, shortcuts = [], onShortcutLaunch, abrirVerAlbaran }) {
  const [widgets, setWidgets] = useState([]);
  const [isPickerOpen, setPickerOpen] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [quickShortcutFilter, setQuickShortcutFilter] = useState("");
  const [quickShortcutId, setQuickShortcutId] = useState("");
  const [expandedCategories, setExpandedCategories] = useState(new Set(["Terceros", "Almacén", "Empresa", "Ventas", "TPV", "Configuración"]));
  const [draggingWidgetId, setDraggingWidgetId] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [error, setError] = useState("");
  const [isSubmitting, setSubmitting] = useState(false);
  const [isReordering, setReordering] = useState(false);
  const [pickerError, setPickerError] = useState("");

  const userId = session?.usuario?.id;

  // Verificar permisos del usuario actual
  const tienePermiso = useCallback((modulo) => {
    return session?.permisos?.[modulo] === true;
  }, [session]);

  // Mapear módulos a permisos
  const moduloPermisoMap = {
    "Terceros": "moduloTerceros",
    "Almacén": "moduloAlmacen", 
    "Empresa": "moduloEmpresa",
    "Ventas": "moduloVentas",
    "TPV": "moduloTpv",
    "Configuración": "moduloConfiguracion"
  };

  // Filtrar shortcuts según permisos
  const shortcutsFiltrados = useMemo(() => {
    return shortcuts.filter(shortcut => {
      const permiso = moduloPermisoMap[shortcut.category];
      // Si no hay permiso definido o el usuario tiene el permiso, mostrar
      return !permiso || tienePermiso(permiso);
    });
  }, [shortcuts, tienePermiso]);

  const fetchWidgets = useCallback(async () => {
    if (!userId) {
      setWidgets([]);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/usuarios/${userId}/widgets`);
      if (!res.ok) {
        throw new Error("No se pudieron obtener los widgets");
      }
      const data = await res.json();
      setWidgets(Array.isArray(data) ? data.sort((a, b) => a.posicion - b.posicion) : []);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los widgets de inicio");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchWidgets();
  }, [fetchWidgets]);

  const orderedWidgets = useMemo(
    () => [...widgets].sort((a, b) => (a.posicion ?? 0) - (b.posicion ?? 0)),
    [widgets],
  );

  const widgetIndexLookup = useMemo(() => {
    const lookup = new Map();
    orderedWidgets.forEach((widget, index) => lookup.set(widget.id, index));
    return lookup;
  }, [orderedWidgets]);

  const occupiedPositions = useMemo(() => {
    const taken = new Set();
    widgets.forEach(widget => {
      const start = widget.posicion ?? 0;
      if (start < 0 || start >= TOTAL_CELLS) return;
      const startRow = Math.floor(start / GRID_COLUMNS);
      const startCol = start % GRID_COLUMNS;
      const { columns, rows } = getWidgetSpan(widget, startCol, startRow);
      for (let r = 0; r < rows; r += 1) {
        for (let c = 0; c < columns; c += 1) {
          const idx = start + r * GRID_COLUMNS + c;
          if (idx < TOTAL_CELLS) {
            taken.add(idx);
          }
        }
      }
    });
    return taken;
  }, [widgets]);

  const getNextPosition = useCallback(() => {
    for (let i = 0; i < TOTAL_CELLS; i += 1) {
      if (!occupiedPositions.has(i)) return i;
    }
    return TOTAL_CELLS;
  }, [occupiedPositions]);

  const { items: gridItems, freeCells } = useMemo(() => {
    const processed = Array(TOTAL_CELLS).fill(false);
    const occupied = Array(TOTAL_CELLS).fill(false);
    const items = [];
    
    // Create a map of all occupied positions by all widgets
    const positionToWidget = new Map();
    widgets.forEach(widget => {
      if (widget.posicion >= 0 && widget.posicion < TOTAL_CELLS) {
        const start = widget.posicion;
        const startRow = Math.floor(start / GRID_COLUMNS);
        const startCol = start % GRID_COLUMNS;
        const { columns, rows } = getWidgetSpan(widget, startCol, startRow);
        
        for (let r = 0; r < rows; r += 1) {
          for (let c = 0; c < columns; c += 1) {
            const idx = start + r * GRID_COLUMNS + c;
            if (idx < TOTAL_CELLS) {
              positionToWidget.set(idx, widget);
            }
          }
        }
      }
    });

    let occupiedCount = 0;

    for (let index = 0; index < TOTAL_CELLS; index += 1) {
      if (processed[index]) continue;

      const widget = positionToWidget.get(index);
      const row = Math.floor(index / GRID_COLUMNS);
      const col = index % GRID_COLUMNS;

      if (widget) {
        // Only process if this is the starting position of the widget
        if (widget.posicion === index) {
          const { columns, rows } = getWidgetSpan(widget, col, row);

          items.push({
            key: `widget-${widget.id}`,
            type: "widget",
            widget,
            style: {
              gridColumn: `${col + 1} / span ${columns}`,
              gridRow: `${row + 1} / span ${rows}`,
            },
          });

          for (let r = 0; r < rows; r += 1) {
            for (let c = 0; c < columns; c += 1) {
              const coveredIndex = index + r * GRID_COLUMNS + c;
              if (coveredIndex < TOTAL_CELLS) {
                if (!occupied[coveredIndex]) {
                  occupied[coveredIndex] = true;
                  occupiedCount += 1;
                }
                processed[coveredIndex] = true;
              }
            }
          }
        } else {
          // This is an occupied cell but not the starting position, skip it
          processed[index] = true;
        }
        continue;
      } else {
        items.push({
          key: `placeholder-${index}`,
          type: "placeholder",
          index,
          style: {
            gridColumn: `${col + 1} / span 1`,
            gridRow: `${row + 1} / span 1`,
          },
        });
        processed[index] = true;
      }
    }

    return {
      items,
      freeCells: Math.max(0, TOTAL_CELLS - occupiedCount),
    };
  }, [widgets]);

  const canAddMore = freeCells > 0;

  const handleUpdateWidgetMeta = useCallback(
    async (widget, metaPatch) => {
      if (!userId || !widget?.id) return;
      const widgetId = widget.id;
      const previous = widgets.find(item => item.id === widgetId) || widget;
      const previousSnapshot = {
        ...previous,
        meta: { ...(previous.meta || {}) },
      };
      const nextMeta = { ...previousSnapshot.meta, ...metaPatch };

      setWidgets(prev =>
        prev.map(item => (item.id === widgetId ? { ...item, meta: nextMeta } : item)),
      );

      try {
        const res = await fetch(`${API_BASE}/usuarios/${userId}/widgets/${widgetId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tipo: previousSnapshot.tipo,
            target: previousSnapshot.target,
            titulo: previousSnapshot.titulo,
            descripcion: previousSnapshot.descripcion,
            sizeW: previousSnapshot.sizeW,
            sizeH: previousSnapshot.sizeH,
            posicion: previousSnapshot.posicion,
            meta: nextMeta,
          }),
        });
        if (!res.ok) {
          throw new Error("Error al actualizar widget");
        }
        const updated = await res.json();
        setWidgets(prev => prev.map(item => (item.id === widgetId ? updated : item)));
      } catch (err) {
        console.error(err);
        setError("No se pudo actualizar el widget");
        setWidgets(prev =>
          prev.map(item => (item.id === widgetId ? previousSnapshot : item)),
        );
      }
    },
    [userId, widgets],
  );

  const handleAddWidget = useCallback(async (type, metaOverrides = {}) => {
    if (!userId || !canAddMore) return;
    const libraryEntry = WIDGET_LIBRARY[type];
    if (!libraryEntry) return;
    if (type === "acceso-rapido" && !metaOverrides.shortcutId) {
      setPickerError("Selecciona un destino para el acceso rápido");
      return;
    }
    setSubmitting(true);
    setError("");

    const posicion = getNextPosition();
    const payload = {
      tipo: type,
      target: `${type}-${Date.now()}`,
      titulo: libraryEntry.name ?? type,
      descripcion: libraryEntry.description ?? "",
      sizeW: libraryEntry.defaultSize?.w ?? 1,
      sizeH: libraryEntry.defaultSize?.h ?? 1,
      posicion,
      meta: {
        ...(libraryEntry.defaultMeta ?? {}),
        ...metaOverrides,
      },
    };

    try {
      const res = await fetch(`${API_BASE}/usuarios/${userId}/widgets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error("Error al crear widget");
      }
      const created = await res.json();
      setWidgets(prev => [...prev, created].sort((a, b) => a.posicion - b.posicion));
      if (type === "acceso-rapido") {
        setQuickShortcutId("");
        setQuickShortcutFilter("");
      }
      setPickerOpen(false);
      setPickerError("");
    } catch (err) {
      console.error(err);
      setError("No se pudo crear el widget");
    } finally {
      setSubmitting(false);
    }
  }, [userId, canAddMore, getNextPosition]);

  const handleRemoveWidget = useCallback(async (widgetId) => {
    if (!userId) return;
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/usuarios/${userId}/widgets/${widgetId}`, {
        method: "DELETE",
      });
      if (!res.ok && res.status !== 204) {
        throw new Error("Error al eliminar widget");
      }
      setWidgets(prev => prev.filter(widget => widget.id !== widgetId));
    } catch (err) {
      console.error(err);
      setError("No se pudo eliminar el widget");
    } finally {
      setSubmitting(false);
    }
  }, [userId]);

  const handleReorderWidgets = useCallback(async (newOrder, reorderedWidgets) => {
    if (!userId || isReordering) return;
    setReordering(true);
    setError("");

    console.log("Enviando reorder a backend:", { userId, newOrder });

    try {
      const positions = reorderedWidgets.map(w => ({ id: w.id, posicion: w.posicion }));
        console.log("Positions enviadas:", positions);
        
        const res = await fetch(`${API_BASE}/usuarios/${userId}/widgets/reordenar`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            ids: newOrder,
            positions
          }),
        });
      if (!res.ok) {
        throw new Error("Error al reordenar widgets");
      }
      const updated = await res.json();
      console.log("Respuesta backend reorder:", updated);
      setWidgets(Array.isArray(updated) ? updated : []);
      console.log("Posiciones después de actualizar:", updated.map(w => ({ id: w.id, posicion: w.posicion })));
      console.log("Array completo:", updated);
    } catch (err) {
      console.error("Error en reorder:", err);
      setError("No se pudo reordenar los widgets");
    } finally {
      setReordering(false);
    }
  }, [userId, isReordering]);

  const handleDragStart = useCallback((e, widgetId) => {
    setDraggingWidgetId(widgetId);
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleDragOver = useCallback((e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    console.log("handleDragOver called with index:", index);
    setDragOverIndex(index);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverIndex(null);
  }, []);

  const handleDrop = useCallback(
    (e, targetIndex) => {
      e.preventDefault();
      console.log("handleDrop called with targetIndex:", targetIndex);
      setDragOverIndex(null);
      if (draggingWidgetId === null) return;

      const draggedWidget = widgets.find(w => w.id === draggingWidgetId);
      if (!draggedWidget) return;

      const currentPos = draggedWidget.posicion;
      if (currentPos === targetIndex) return;

      console.log("Drag & drop:", { draggingWidgetId, currentPos, targetIndex });

      // Calculate the span of the dragged widget
      const draggedStartRow = Math.floor(currentPos / GRID_COLUMNS);
      const draggedStartCol = currentPos % GRID_COLUMNS;
      const { columns: draggedCols, rows: draggedRows } = getWidgetSpan(draggedWidget, draggedStartCol, draggedStartRow);

      // Calculate the span at target position
      const targetRow = Math.floor(targetIndex / GRID_COLUMNS);
      const targetCol = targetIndex % GRID_COLUMNS;
      const { columns: targetCols, rows: targetRows } = getWidgetSpan(draggedWidget, targetCol, targetRow);

      // Check if target position is valid for this widget
      const targetEndRow = targetRow + targetRows - 1;
      const targetEndCol = targetCol + targetCols - 1;
      if (targetEndRow >= GRID_ROWS || targetEndCol >= GRID_COLUMNS) {
        console.log("Target position out of bounds");
        return;
      }

      const newWidgets = [...widgets];
      const otherWidgets = newWidgets.filter(w => w.id !== draggingWidgetId);

      // Find all widgets that would be affected by this move
      const affectedWidgets = [];
      const targetOccupiedCells = new Set();
      
      // Calculate all cells that the dragged widget would occupy at target
        for (let r = 0; r < targetRows; r++) {
          for (let c = 0; c < targetCols; c++) {
            const cellIndex = targetIndex + r * GRID_COLUMNS + c;
            if (cellIndex < TOTAL_CELLS) {
              targetOccupiedCells.add(cellIndex);
            }
          }
        }

        console.log("Target position:", targetIndex, "Target cells:", Array.from(targetOccupiedCells));

        // Find widgets that occupy any of the target cells
        otherWidgets.forEach(widget => {
          const widgetStart = widget.posicion;
          const widgetStartRow = Math.floor(widgetStart / GRID_COLUMNS);
          const widgetStartCol = widgetStart % GRID_COLUMNS;
          const { columns: widgetCols, rows: widgetRows } = getWidgetSpan(widget, widgetStartCol, widgetStartRow);
          
          console.log("Checking widget:", widget.id, "at position", widgetStart, "span", widgetCols, "x", widgetRows);
          
          for (let r = 0; r < widgetRows; r++) {
            for (let c = 0; c < widgetCols; c++) {
              const cellIndex = widgetStart + r * GRID_COLUMNS + c;
              console.log("Widget cell:", cellIndex, "Target cells contain it?", targetOccupiedCells.has(cellIndex));
              if (targetOccupiedCells.has(cellIndex)) {
                affectedWidgets.push(widget);
                console.log("Widget affected:", widget.id);
                break;
              }
            }
            if (affectedWidgets.includes(widget)) break;
          }
        });

      console.log("Affected widgets:", affectedWidgets);

      if (affectedWidgets.length > 0) {
        // Push affected widgets to the nearest available position
        const reordered = otherWidgets.map(w => {
          if (affectedWidgets.includes(w)) {
            // Find the nearest available position that doesn't conflict with the dragged widget
            let newPos = w.posicion;
            const widgetRow = Math.floor(w.posicion / GRID_COLUMNS);
            const widgetCol = w.posicion % GRID_COLUMNS;
            const { columns: widgetCols, rows: widgetRows } = getWidgetSpan(w, widgetCol, widgetRow);
            
            // Try positions to the right first (nearest)
            let found = false;
            for (let col = widgetCol + 1; col < GRID_COLUMNS; col++) {
              const testPos = widgetRow * GRID_COLUMNS + col;
              const testEndCol = col + widgetCols - 1;
              const testEndRow = widgetRow + widgetRows - 1;
              
              if (testEndCol < GRID_COLUMNS && testEndRow < GRID_ROWS) {
                // Check if this position is free (including checking against dragged widget's target position)
                let canPlace = true;
                
                // Check all cells this widget would occupy
                for (let r = 0; r < widgetRows; r++) {
                  for (let c = 0; c < widgetCols; c++) {
                    const checkPos = testPos + r * GRID_COLUMNS + c;
                    if (checkPos >= TOTAL_CELLS) {
                      canPlace = false;
                      break;
                    }
                    
                    // Check if this cell conflicts with dragged widget's target position
                    if (targetOccupiedCells.has(checkPos)) {
                      canPlace = false;
                      break;
                    }
                    
                    // Check against all other widgets (including the dragged one)
                    for (const otherWidget of otherWidgets) {
                      if (otherWidget.id === w.id) continue;
                      
                      const otherStart = otherWidget.posicion;
                      const otherRow = Math.floor(otherStart / GRID_COLUMNS);
                      const otherCol = otherStart % GRID_COLUMNS;
                      const { columns: otherCols, rows: otherRows } = getWidgetSpan(otherWidget, otherCol, otherRow);
                      
                      // Check if this cell would overlap with any cell of the other widget
                      for (let or = 0; or < otherRows; or++) {
                        for (let oc = 0; oc < otherCols; oc++) {
                          const otherCellPos = otherStart + or * GRID_COLUMNS + oc;
                          if (checkPos === otherCellPos) {
                            canPlace = false;
                            break;
                          }
                        }
                        if (!canPlace) break;
                      }
                      if (!canPlace) break;
                    }
                    if (!canPlace) break;
                  }
                  if (!canPlace) break;
                }
                
                if (canPlace) {
                  newPos = testPos;
                  found = true;
                  break;
                }
              }
            }
            
            // If not found to the right, try next row starting from left
            if (!found) {
              for (let row = widgetRow + 1; row < GRID_ROWS; row++) {
                for (let col = 0; col < GRID_COLUMNS; col++) {
                  const testPos = row * GRID_COLUMNS + col;
                  const testEndCol = col + widgetCols - 1;
                  const testEndRow = row + widgetRows - 1;
                  
                  if (testEndCol < GRID_COLUMNS && testEndRow < GRID_ROWS) {
                    // Check if this position is free (including checking against dragged widget's target position)
                    let canPlace = true;
                    
                    // Check all cells this widget would occupy
                    for (let r = 0; r < widgetRows; r++) {
                      for (let c = 0; c < widgetCols; c++) {
                        const checkPos = testPos + r * GRID_COLUMNS + c;
                        if (checkPos >= TOTAL_CELLS) {
                          canPlace = false;
                          break;
                        }
                        
                        // Check if this cell conflicts with dragged widget's target position
                        if (targetOccupiedCells.has(checkPos)) {
                          canPlace = false;
                          break;
                        }
                        
                        // Check against all other widgets (including the dragged one)
                        for (const otherWidget of otherWidgets) {
                          if (otherWidget.id === w.id) continue;
                          
                          const otherStart = otherWidget.posicion;
                          const otherRow = Math.floor(otherStart / GRID_COLUMNS);
                          const otherCol = otherStart % GRID_COLUMNS;
                          const { columns: otherCols, rows: otherRows } = getWidgetSpan(otherWidget, otherCol, otherRow);
                          
                          // Check if this cell would overlap with any cell of the other widget
                          for (let or = 0; or < otherRows; or++) {
                            for (let oc = 0; oc < otherCols; oc++) {
                              const otherCellPos = otherStart + or * GRID_COLUMNS + oc;
                              if (checkPos === otherCellPos) {
                                canPlace = false;
                                break;
                              }
                            }
                            if (!canPlace) break;
                          }
                          if (!canPlace) break;
                        }
                        if (!canPlace) break;
                      }
                      if (!canPlace) break;
                    }
                    
                    if (canPlace) {
                      newPos = testPos;
                      found = true;
                      break;
                    }
                  }
                }
                if (found) break;
              }
            }
            
            return { ...w, posicion: newPos };
          }
          return w;
        });
        
        reordered.push({ ...draggedWidget, posicion: targetIndex });
        console.log("Reordenado local (con empuje):", reordered);
        setWidgets(reordered);
        const orderedIds = reordered.sort((a, b) => a.posicion - b.posicion).map(w => w.id);
        handleReorderWidgets(orderedIds, reordered);
      } else {
        // Move to empty cells
        console.log("Moviendo a celdas vacías, targetIndex:", targetIndex);
        const reordered = [...otherWidgets, { ...draggedWidget, posicion: targetIndex }];
        console.log("Reordenado local (celda vacía):", reordered);
        setWidgets(reordered);
        const orderedIds = reordered.sort((a, b) => a.posicion - b.posicion).map(w => w.id);
        console.log("Enviando IDs a backend (celda vacía):", orderedIds);
        handleReorderWidgets(orderedIds, reordered);
      }

      setDraggingWidgetId(null);
    },
    [draggingWidgetId, widgets, handleReorderWidgets],
  );

  const handleDragEnd = useCallback(() => {
    setDraggingWidgetId(null);
    setDragOverIndex(null);
  }, []);

  const isDisabled = !userId || isSubmitting || isReordering;
  const effectiveShortcutLaunch = onShortcutLaunch || (() => {});

  const renderWidget = useCallback(
    (widget) => {
      const libraryEntry = WIDGET_LIBRARY[widget.tipo || widget.type];
      if (!libraryEntry) return null;
      const WidgetComponent = libraryEntry.Component;
      const baseProps = {
        widgetId: widget.id,
        meta: widget.meta,
        isDisabled,
      };

      if (libraryEntry.type === "acceso-rapido") {
        const shortcutEntry = shortcutsFiltrados.find(item => item.id === widget.meta?.shortcutId);
        baseProps.icon = shortcutEntry?.icon;
        baseProps.label = shortcutEntry?.label ?? widget.meta?.shortcutLabel;
        baseProps.onLaunchShortcut = effectiveShortcutLaunch;
      }

      if (libraryEntry.type === "ultimos-albaranes") {
        baseProps.onAlbaranClick = abrirVerAlbaran;
      }

      return <WidgetComponent {...baseProps} />;
    },
    [effectiveShortcutLaunch, handleUpdateWidgetMeta, isDisabled, shortcutsFiltrados, abrirVerAlbaran],
  );

  const filteredShortcuts = useMemo(() => {
    const query = quickShortcutFilter.trim().toLowerCase();
    if (!query) return shortcutsFiltrados;
    return shortcutsFiltrados.filter(option => option.label.toLowerCase().includes(query));
  }, [quickShortcutFilter, shortcutsFiltrados]);

  const selectedShortcut = useMemo(
    () => shortcutsFiltrados.find(item => item.id === quickShortcutId),
    [quickShortcutId, shortcutsFiltrados],
  );

  const groupedShortcuts = useMemo(() => {
    const buckets = filteredShortcuts.reduce((acc, shortcut) => {
      const category = shortcut.category || "Otros";
      if (!acc[category]) acc[category] = [];
      acc[category].push(shortcut);
      return acc;
    }, {});

    const ordered = [];
    QUICK_ACCESS_CATEGORY_ORDER.forEach(category => {
      if (buckets[category]?.length) {
        ordered.push({ category, items: buckets[category] });
        delete buckets[category];
      }
    });

    Object.keys(buckets)
      .sort()
      .forEach(category => {
        ordered.push({ category, items: buckets[category] });
      });

    return ordered;
  }, [filteredShortcuts]);

  const closePicker = useCallback(() => {
    setPickerOpen(false);
    setPickerError("");
    setQuickShortcutId("");
    setQuickShortcutFilter("");
    setExpandedCategories(new Set());
  }, []);

  const toggleCategory = useCallback((category) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  }, []);

  return (
    <section className="erp-inicio-panel">
      <div className="erp-quick-section">
        <div className="erp-quick-section__header">
          <div>
            <p className="erp-eyebrow">Panel principal</p>
          </div>
          <div className="erp-quick-section__actions">
            <button
              type="button"
              className="erp-btn erp-btn-primary erp-btn-sm"
              onClick={() => setPickerOpen(true)}
              disabled={!canAddMore || isDisabled}
            >
              + Añadir widget
            </button>
          </div>
        </div>

        {error && <p className="erp-error-text">{error}</p>}
        {!userId && (
          <p className="erp-muted">
            Inicia sesión para personalizar este panel con tus widgets.
          </p>
        )}

        <div className="erp-inicio-grid" aria-label={`Panel inicial de ${GRID_COLUMNS} por ${GRID_ROWS} celdas`}>
          {gridItems.map(item => {
            if (item.type === "widget") {
              return (
                <div
                  key={item.key}
                  className={`erp-inicio-grid__cell has-widget ${dragOverIndex === item.widget.posicion ? "drag-over" : ""}`}
                  style={item.style}
                  draggable={!isDisabled}
                  onDragStart={(e) => handleDragStart(e, item.widget.id)}
                  onDragOver={(e) => handleDragOver(e, item.widget.posicion)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, item.widget.posicion)}
                  onDragEnd={handleDragEnd}
                >
                  <button
                    type="button"
                    className="erp-inicio-grid__remove"
                    aria-label="Eliminar widget"
                    onClick={() => handleRemoveWidget(item.widget.id)}
                    disabled={isDisabled}
                  >
                    ×
                  </button>
                  {renderWidget(item.widget)}
                </div>
              );
            }

            return (
              <div
                key={item.key}
                className={`erp-inicio-grid__cell ${dragOverIndex === item.index ? "drag-over" : ""}`}
                style={item.style}
                onDragOver={(e) => handleDragOver(e, item.index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, item.index)}
                aria-label={`Celda libre ${item.index + 1}`}
              />
            );
          })}
        </div>

        {isLoading && <p className="erp-muted">Cargando widgets...</p>}
      </div>

      {isPickerOpen && (
        <div className="erp-widget-picker" role="dialog" aria-modal="true">
          <div className="erp-widget-picker__backdrop" onClick={closePicker} />
          <div className="erp-widget-picker__card">
            <header>
              <h3>Selecciona un widget</h3>
              <p>Los widgets que añadas quedarán guardados en este panel.</p>
            </header>

            <div className="erp-widget-picker__list">
              {Object.values(WIDGET_LIBRARY).map(option => (
                option.type === "acceso-rapido" ? (
                  <div key={option.type} className="erp-widget-picker__option erp-widget-picker__option--qa">
                    <div>
                      <strong>{option.name}</strong>
                      <span>{option.description}</span>
                    </div>
                    <div className="erp-qa-picker">
                      <label className="erp-qa-picker__label" htmlFor="qa-picker-search">
                        Selecciona el destino del acceso
                      </label>
                      <div className="erp-qa-picker__search">
                        <input
                          id="qa-picker-search"
                          type="text"
                          placeholder="Busca por nombre..."
                          value={quickShortcutFilter}
                          onChange={(event) => setQuickShortcutFilter(event.target.value)}
                          disabled={isDisabled}
                        />
                        {quickShortcutId && selectedShortcut && (
                          <div className="erp-qa-picker__badge">
                            Seleccionado: <strong>{selectedShortcut.label}</strong>
                            <button
                              type="button"
                              className="erp-qa-picker__badge-reset"
                              onClick={() => setQuickShortcutId("")}
                              disabled={isDisabled}
                            >
                              Cambiar
                            </button>
                          </div>
                        )}
                      </div>
                      {groupedShortcuts.length > 0 ? (
                        <div className="erp-qa-picker__categories">
                          {groupedShortcuts.map(group => {
                            const isExpanded = expandedCategories.has(group.category);
                            return (
                              <section key={group.category} className="erp-qa-picker__category">
                                <button
                                  type="button"
                                  className="erp-qa-picker__category-title"
                                  onClick={() => toggleCategory(group.category)}
                                  disabled={isDisabled}
                                >
                                  <span>{group.category}</span>
                                  <span className="erp-qa-picker__category-count">
                                    {group.items.length} módulo{group.items.length > 1 ? "s" : ""}
                                  </span>
                                  <span className={`erp-qa-picker__category-toggle ${isExpanded ? "is-expanded" : ""}`}>
                                    {isExpanded ? "−" : "+"}
                                  </span>
                                </button>
                                {isExpanded && (
                                  <div className="erp-qa-picker__grid">
                                    {group.items.map(optionShortcut => {
                                      const ShortcutIcon = optionShortcut.icon;
                                      const isSelected = quickShortcutId === optionShortcut.id;
                                      return (
                                        <button
                                          key={optionShortcut.id}
                                          type="button"
                                          className={`erp-qa-picker__item ${isSelected ? "is-selected" : ""}`}
                                          onClick={() => {
                                            setQuickShortcutId(optionShortcut.id);
                                            setPickerError("");
                                          }}
                                          disabled={isDisabled}
                                        >
                                          <div className="erp-qa-picker__item-icon">
                                            <ShortcutIcon />
                                          </div>
                                          <span>{optionShortcut.label}</span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}
                              </section>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="erp-muted">No se encontraron accesos rápidos</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    key={option.type}
                    className="erp-widget-picker__option"
                    onClick={() => handleAddWidget(option.type)}
                    disabled={isDisabled}
                  >
                    <div className="erp-widget-picker__icon">{option.icon}</div>
                    <div>
                      <strong>{option.name}</strong>
                      <span>{option.description}</span>
                    </div>
                  </button>
                )
              ))}
            </div>

            <div className="erp-widget-picker__actions">
              {Object.values(WIDGET_LIBRARY).find(option => option.type === "acceso-rapido") && (
                <button
                  type="button"
                  className="erp-btn erp-btn-primary"
                  disabled={!quickShortcutId || isDisabled}
                  onClick={() => {
                    const shortcutEntry = shortcutsFiltrados.find(item => item.id === quickShortcutId);
                    handleAddWidget("acceso-rapido", {
                      shortcutId: quickShortcutId,
                      shortcutLabel: shortcutEntry?.label ?? "",
                    });
                  }}
                >
                  Crear acceso
                </button>
              )}
              <button
                type="button"
                className="erp-btn erp-btn-secondary"
                onClick={closePicker}
              >
                Cancelar
              </button>
            </div>
            {pickerError && <p className="erp-error-text">{pickerError}</p>}
          </div>
        </div>
      )}
    </section>
  );
}
