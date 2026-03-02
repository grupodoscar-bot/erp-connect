# Mejoras de Multitarifa y Multialmacén

Implementar comportamiento completo y consistente para las configuraciones `permitirMultitarifa` y `permitirVentaMultialmacen`, ocultando/deshabilitando funcionalidad cuando están desactivadas y usando valores predeterminados automáticamente.

## Análisis del Estado Actual

### Multitarifa (`permitirMultitarifa`)
**Comportamiento actual:**
- ✅ El componente `GestionTarifas` muestra un mensaje informativo cuando está desactivado
- ✅ Impide crear nuevas tarifas cuando está desactivado
- ❌ El selector de tarifa en clientes sigue visible
- ❌ El selector de tarifa en productos sigue visible
- ❌ El selector de tarifa en documentos de venta sigue visible
- ❌ La sección de precios por tarifa en productos sigue visible

**Comportamiento esperado:**
- Cuando `permitirMultitarifa = false`:
  - Solo existe y se usa la tarifa general
  - No se muestra selector de tarifa en clientes (campo oculto)
  - No se muestra selector de tarifa en productos (solo precio base)
  - No se muestra selector de tarifa en documentos de venta
  - Los documentos usan automáticamente la tarifa general
  - No se muestran precios por tarifa en productos

### Multialmacén (`permitirVentaMultialmacen`)
**Comportamiento actual:**
- ✅ El checkbox "Vender de varios almacenes" se oculta cuando está desactivado
- ❌ El selector de almacén global del documento sigue visible
- ❌ La columna de almacén en líneas aparece si `ventaMultialmacen` está activo (aunque no debería poder activarse)

**Comportamiento esperado:**
- Cuando `permitirVentaMultialmacen = false`:
  - No se muestra el checkbox "Vender de varios almacenes"
  - No se muestra selector de almacén global en el documento
  - No se muestra columna de almacén en las líneas
  - Se usa automáticamente el almacén predeterminado de la serie o el almacén general del sistema
  - El campo `ventaMultialmacen` siempre es `false`

## Plan de Implementación

### 1. Multitarifa - Clientes (`ClientesComponents.js`)
**Archivo:** `/home/ruben/Desktop/ERP/mi-web-react/src/Prueba/terceros/ClientesComponents.js`

- Añadir prop `permitirMultitarifa` al componente `FormularioCliente`
- Condicionar la sección "Tarifa asignada" (líneas ~498-506):
  ```javascript
  {permitirMultitarifa && (
    <label className="erp-field">
      <span className="erp-field-label">Tarifa asignada</span>
      <select value={formCliente.tarifaId} ...>
        ...
      </select>
    </label>
  )}
  ```
- Pasar `permitirMultitarifa` desde `PruebaWorkspace.js` al componente

### 2. Multitarifa - Productos (`ProductosComponents.js`)
**Archivo:** `/home/ruben/Desktop/ERP/mi-web-react/src/Prueba/almacen/ProductosComponents.js`

- La sección de precios por tarifa ya está condicionada (línea 667)
- Asegurar que cuando `permitirMultitarifa = false`:
  - Solo se muestra la sección de "Precios" básica (líneas 536-573)
  - No se muestra la sección "Precios por Tarifa"

### 3. Multitarifa - Documentos de Venta
**Archivos:**
- `/home/ruben/Desktop/ERP/mi-web-react/src/Prueba/ventas/AlbaranesComponents.js`
- Otros componentes de documentos (Pedidos, Presupuestos, Facturas, etc.)

**Cambios en `TarifaSelector.js`:**
- Modificar para que cuando `esMultitarifaPermitida = false`:
  - No muestre el selector
  - Solo muestre texto informativo: "Tarifa: General"
  - Ya está parcialmente implementado (líneas 12-40)

**Cambios en componentes de documentos:**
- El `TarifaSelector` ya maneja el caso cuando no hay multitarifa
- Verificar que `tarifasAlbaran.esMultitarifaPermitida` se pasa correctamente

### 4. Multialmacén - Documentos de Venta
**Archivos:**
- `/home/ruben/Desktop/ERP/mi-web-react/src/Prueba/ventas/AlbaranesComponents.js` (líneas 1103-1152)
- Otros componentes de documentos

**Cambios necesarios:**

a) **Selector de almacén global del documento** (líneas 1103-1118):
   - Actualmente se muestra si `mostrarSelectorAlmacen && !formAlbaran.ventaMultialmacen`
   - Cambiar a: `mostrarSelectorAlmacen && permitirVentaMultialmacen && !formAlbaran.ventaMultialmacen`
   - Si `permitirVentaMultialmacen = false`, no mostrar el selector

b) **Checkbox "Vender de varios almacenes"** (líneas 1136-1152):
   - Ya está condicionado correctamente con `permitirVentaMultialmacen`

c) **Columna de almacén en líneas** (líneas 1215-1217, 1284-1298):
   - Actualmente se muestra si `formAlbaran.ventaMultialmacen`
   - Mantener esta lógica (ya es correcta)

d) **Lógica de asignación automática de almacén:**
   - En hooks de documentos (`useAlbaranes.js`, `usePedidos.js`, etc.)
   - Cuando `permitirVentaMultialmacen = false`:
     - Asignar automáticamente el almacén predeterminado de la serie
     - Si no hay almacén en la serie, usar el primer almacén disponible
     - Forzar `ventaMultialmacen = false`

### 5. Hooks de Documentos - Lógica de Almacén
**Archivos:**
- `/home/ruben/Desktop/ERP/mi-web-react/src/Prueba/ventas/useAlbaranes.js`
- `/home/ruben/Desktop/ERP/mi-web-react/src/Prueba/ventas/usePedidos.js`
- `/home/ruben/Desktop/ERP/mi-web-react/src/Prueba/ventas/usePresupuestos.js`
- `/home/ruben/Desktop/ERP/mi-web-react/src/Prueba/ventas/useFacturasForm.js`
- `/home/ruben/Desktop/ERP/mi-web-react/src/Prueba/ventas/useFacturasProformaForm.js`
- `/home/ruben/Desktop/ERP/mi-web-react/src/Prueba/ventas/useFacturasRectificativasForm.js`

**Cambios:**
- Cargar configuración `permitirVentaMultialmacen` desde el backend
- Cuando se crea un nuevo documento o se selecciona una serie:
  - Si `permitirVentaMultialmacen = false`:
    - Asignar automáticamente `almacenId` desde la serie o primer almacén
    - Forzar `ventaMultialmacen = false`
- Añadir `useEffect` que reaccione a cambios en `permitirVentaMultialmacen`

### 6. Hooks de Documentos - Lógica de Tarifa
**Archivos:** (mismos que punto 5)

**Cambios:**
- El hook `useTarifasAlbaran` ya maneja `esMultitarifaPermitida`
- Verificar que cuando `esMultitarifaPermitida = false`:
  - Se usa automáticamente la tarifa general
  - No se permite cambiar de tarifa

### 7. PruebaWorkspace - Pasar Props
**Archivo:** `/home/ruben/Desktop/ERP/mi-web-react/src/Prueba/PruebaWorkspace.js`

**Cambios:**
- Pasar `permitirMultitarifa` a `FormularioCliente` (línea ~636)
- Verificar que `permitirMultitarifa` ya se pasa a `FormularioProducto` (línea ~826)
- Los componentes de documentos ya reciben `permitirVentaMultialmacen`

## Orden de Implementación

1. **Multitarifa en Clientes** - Ocultar selector de tarifa
2. **Multitarifa en Productos** - Ya está implementado, solo verificar
3. **Multialmacén en Documentos - UI** - Ocultar selectores de almacén
4. **Multialmacén en Documentos - Lógica** - Asignación automática de almacén
5. **Verificación de Tarifas en Documentos** - Asegurar uso de tarifa general
6. **Testing completo** - Probar todos los flujos con ambas configuraciones

## Archivos a Modificar

### Modificaciones principales:
1. `/home/ruben/Desktop/ERP/mi-web-react/src/Prueba/terceros/ClientesComponents.js`
2. `/home/ruben/Desktop/ERP/mi-web-react/src/Prueba/ventas/AlbaranesComponents.js`
3. `/home/ruben/Desktop/ERP/mi-web-react/src/Prueba/ventas/useAlbaranes.js`
4. `/home/ruben/Desktop/ERP/mi-web-react/src/Prueba/ventas/usePedidos.js`
5. `/home/ruben/Desktop/ERP/mi-web-react/src/Prueba/ventas/usePresupuestos.js`
6. `/home/ruben/Desktop/ERP/mi-web-react/src/Prueba/ventas/useFacturasForm.js`
7. `/home/ruben/Desktop/ERP/mi-web-react/src/Prueba/ventas/useFacturasProformaForm.js`
8. `/home/ruben/Desktop/ERP/mi-web-react/src/Prueba/ventas/useFacturasRectificativasForm.js`
9. `/home/ruben/Desktop/ERP/mi-web-react/src/Prueba/PruebaWorkspace.js`

### Verificaciones (posiblemente sin cambios):
- `/home/ruben/Desktop/ERP/mi-web-react/src/Prueba/almacen/ProductosComponents.js` (ya condicionado)
- `/home/ruben/Desktop/ERP/mi-web-react/src/Prueba/ventas/TarifaSelector.js` (ya maneja modo simple)

## Notas Importantes

- **Tarifa General:** Siempre debe existir una tarifa marcada como `esGeneral = true`
- **Almacén por Defecto:** Cada serie puede tener un almacén predeterminado
- **Compatibilidad:** Los cambios deben ser retrocompatibles con documentos existentes
- **Recarga de Configuración:** Cuando se cambia la configuración, los formularios abiertos deben reflejar el cambio
