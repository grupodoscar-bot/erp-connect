# Solución: Múltiples Instancias de Formularios por Pestaña

## Problema Actual
- Todos los formularios (nuevo y editar) comparten el mismo estado en el hook
- Cuando abres múltiples pestañas, todas modifican el mismo formulario
- Al crear un nuevo documento mientras editas otro, se pierde el contenido del que estabas editando

## Solución Propuesta
Cambiar de un único formulario global a un **mapa de formularios indexado por ID de pestaña**:

```javascript
// ANTES (incorrecto)
const [formPresupuesto, setFormPresupuesto] = useState(formPresupuestoInicial);

// DESPUÉS (correcto)
const [formulariosPorPestana, setFormulariosPorPestana] = useState({});
const formPresupuesto = formulariosPorPestana[pestanaActiva] || formPresupuestoInicial;
```

## Arquitectura

### 1. Estado de Formularios
```javascript
// Mapa: { [pestanaId]: formulario }
const [formulariosPorPestana, setFormulariosPorPestana] = useState({});
```

### 2. Obtener Formulario Actual
```javascript
const formPresupuesto = useMemo(() => {
  return formulariosPorPestana[pestanaActiva] || formPresupuestoInicial;
}, [formulariosPorPestana, pestanaActiva]);
```

### 3. Actualizar Formulario de Pestaña Específica
```javascript
const setFormPresupuesto = useCallback((nuevoFormulario) => {
  if (!pestanaActiva) return;
  
  setFormulariosPorPestana(prev => ({
    ...prev,
    [pestanaActiva]: typeof nuevoFormulario === 'function' 
      ? nuevoFormulario(prev[pestanaActiva] || formPresupuestoInicial)
      : nuevoFormulario
  }));
}, [pestanaActiva]);
```

### 4. Limpiar Formulario al Cerrar Pestaña
```javascript
const limpiarFormularioPestana = useCallback((pestanaId) => {
  setFormulariosPorPestana(prev => {
    const nuevo = { ...prev };
    delete nuevo[pestanaId];
    return nuevo;
  });
}, []);
```

### 5. Inicializar Formulario para Nueva Pestaña
```javascript
useEffect(() => {
  if (pestanaActiva && pestanaActiva.startsWith('presupuesto-nuevo')) {
    // Solo inicializar si no existe ya
    if (!formulariosPorPestana[pestanaActiva]) {
      setFormulariosPorPestana(prev => ({
        ...prev,
        [pestanaActiva]: { ...formPresupuestoInicial }
      }));
    }
  }
}, [pestanaActiva]);
```

## Cambios Necesarios

### Hooks a Modificar
1. ✅ `usePresupuestos.js`
2. ✅ `usePedidos.js`
3. ✅ `useFacturasForm.js`
4. ✅ `useFacturasProformaForm.js`
5. ✅ `useFacturasRectificativasForm.js`
6. ✅ `useAlbaranes.js`

### Cambios en PruebaWorkspace.js
- Pasar función `limpiarFormularioPestana` a los hooks
- Llamar a `limpiarFormularioPestana` cuando se cierra una pestaña

### Consideraciones
- **Memoria**: Los formularios se mantienen en memoria mientras la pestaña está abierta
- **Limpieza**: Al cerrar una pestaña, se elimina su formulario del mapa
- **Persistencia**: Si cambias de pestaña y vuelves, el formulario mantiene su estado
- **Independencia**: Cada pestaña tiene su propio formulario completamente independiente

## Beneficios
1. ✅ Múltiples documentos pueden editarse simultáneamente
2. ✅ Crear nuevo documento no afecta a los que se están editando
3. ✅ Cambiar entre pestañas mantiene el estado de cada una
4. ✅ Cerrar pestaña libera memoria
5. ✅ Arquitectura escalable para cualquier número de pestañas

## Implementación
1. Modificar cada hook para usar mapa de formularios
2. Actualizar `cerrarPestana` en PruebaWorkspace para limpiar formularios
3. Probar con múltiples pestañas abiertas simultáneamente
