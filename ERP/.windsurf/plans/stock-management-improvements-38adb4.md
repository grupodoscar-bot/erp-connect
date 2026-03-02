# Mejoras en el Sistema de Gestión de Stock

Implementar un sistema completo de gestión de stock que maneje correctamente los descuentos según el tipo de documento (Albarán/Factura), validaciones, transformaciones entre documentos, y notificaciones al usuario sobre cambios de estado que afectan el inventario.

## Análisis del Sistema Actual

### Backend (Kotlin/Spring Boot)

**Archivos clave:**
- `StockService.kt` - Servicio principal de gestión de stock
- `AlbaranController.kt` - Controlador de albaranes
- `FacturaController.kt` - Controlador de facturas
- `FacturaRectificativaController.kt` - Controlador de facturas rectificativas
- `ConfiguracionVentas.kt` - Configuración con `documentoDescuentaStock` (ALBARAN/FACTURA)

**Funcionalidad actual:**

1. **Albaranes:**
   - `gestionarStockAlbaran()` descuenta stock cuando estado cambia a "Emitido" si `documentoDescuentaStock = "ALBARAN"`
   - Restaura stock si cambia de "Emitido" a otro estado
   - Valida stock insuficiente si `permitirVentaSinStock = false`

2. **Facturas:**
   - `gestionarStockFactura()` descuenta stock si `documentoDescuentaStock = "FACTURA"`
   - Verifica `existente.albaran == null` para evitar doble descuento (línea 313)
   - No maneja diferencias de cantidad/precio entre albarán y factura

3. **Facturas Rectificativas:**
   - `gestionarStockFacturaRectificativa()` INCREMENTA stock cuando operación = "INCREMENTAR"
   - Actualmente no se llama automáticamente al cambiar a "Emitido"

### Frontend (React)

**Archivos clave:**
- `useAlbaranes.js` - Hook de gestión de albaranes
- `AlbaranesComponents.js` - Componentes UI
- `useConfiguracion.js` - Configuración de ventas

**Funcionalidad actual:**
- Modal de confirmación cuando albarán cambia a "Emitido" y `documentoDescuentaStock = "ALBARAN"`
- Modal de error cuando stock es insuficiente
- No hay avisos al cambiar DE "Emitido" a otro estado

## Problemas Identificados

1. ❌ **Facturas de albaranes con diferencias:** No se descuenta la diferencia si la factura tiene cantidades/precios diferentes al albarán origen
2. ❌ **Facturas rectificativas:** No suman stock automáticamente al pasar a "Emitido"
3. ❌ **Cambio de estado desde Emitido:** No avisa al usuario que se restaurará el stock
4. ❌ **Validación en frontend:** No valida stock antes de guardar (solo en backend)
5. ❌ **Transformaciones:** No se registra correctamente la relación albarán-factura para gestión de stock

## Requisitos del Usuario

### 1. Configuración: Albarán descuenta stock

**Albaranes:**
- ✅ Descontar stock al cambiar a "Emitido" (ya implementado)
- ✅ No permitir venta si stock ≤ 0 y `permitirVentaSinStock = false` (ya implementado)
- ⚠️ Avisar al cambiar DE "Emitido" a otro estado que se restaurará stock (falta)

**Facturas:**
- ✅ NO descontar si viene de albarán sin cambios (ya implementado parcialmente)
- ❌ Descontar DIFERENCIA si factura tiene cantidades/precios diferentes al albarán (falta)
- ⚠️ Avisar al cambiar DE "Emitido" a otro estado (falta)

### 2. Configuración: Factura descuenta stock

**Facturas:**
- ✅ Descontar stock al cambiar a "Emitido" (ya implementado)
- ✅ No permitir venta si stock ≤ 0 y `permitirVentaSinStock = false` (ya implementado)
- ⚠️ Avisar al cambiar DE "Emitido" a otro estado que se restaurará stock (falta)

### 3. Facturas Rectificativas

**Siempre:**
- ❌ SUMAR stock (no restar) al cambiar a "Emitido" (falta implementar llamada automática)
- ⚠️ Avisar al cambiar DE "Emitido" a otro estado que se restará el stock devuelto (falta)
- ❌ **NUEVO:** Solo permitir productos que existen en la factura origen (falta)
- ❌ **NUEVO:** Validar que cantidades no excedan las de la factura origen (falta)
- ✅ Impedir eliminar factura origen si tiene rectificativas (ya implementado - línea 392-396 FacturaController.kt)

## Plan de Implementación

### Fase 1: Backend - Gestión de Stock en Facturas con Diferencias

**Archivos a modificar:**
- `StockService.kt`
- `FacturaController.kt`

**Tareas:**

1. **Crear método `gestionarStockFacturaConDiferencias()` en StockService:**
   ```kotlin
   fun gestionarStockFacturaConDiferencias(
       factura: Factura,
       estadoAnterior: String?
   )
   ```
   - Verificar si factura viene de albarán (`factura.albaran != null`)
   - Si viene de albarán Y `documentoDescuentaStock = "ALBARAN"`:
     - Comparar líneas de factura vs líneas de albarán
     - Calcular diferencias de cantidad por producto/almacén
     - Descontar solo las diferencias (si cantidad factura > cantidad albarán)
     - **Restaurar diferencias (si cantidad factura < cantidad albarán)** ✅
   - Si NO viene de albarán Y `documentoDescuentaStock = "FACTURA"`:
     - Descontar todo el stock normalmente

2. **Modificar `gestionarStockAlbaran()` para registrar estado:**
   - Añadir campo `stockDescontado: Boolean` en modelo Albaran
   - Marcar cuando se descuenta stock

3. **Actualizar FacturaController.actualizar():**
   - ⚠️ **TRANSACCIONAL:** Verificar que tiene `@Transactional`
   - **Orden de ejecución crítico:**
     1. Validar datos de entrada
     2. Guardar documento en BD (actualizar factura)
     3. Gestionar stock (solo después de guardar exitosamente)
     4. Commit automático al final del método
     5. Rollback automático si cualquier operación falla
   - Reemplazar llamada a `gestionarStockFactura()` por `gestionarStockFacturaConDiferencias()`
   - Pasar `estadoAnterior` al método

### Fase 2: Backend - Facturas Rectificativas - Gestión de Stock

**Archivos a modificar:**
- `FacturaRectificativaController.kt`
- `StockService.kt`

**Tareas:**

1. **Modificar `gestionarStockFacturaRectificativa()` en StockService:**
   - Cambiar lógica para que SIEMPRE incremente stock cuando estado = "Emitido"
   - Restaurar (decrementar) stock cuando cambia DE "Emitido" a otro estado

2. **Actualizar FacturaRectificativaController.actualizar():**
   - ⚠️ **TRANSACCIONAL:** Añadir `@Transactional` si no existe
   - Detectar cambio de estado a/desde "Emitido"
   - **Orden de ejecución:**
     1. Guardar cambios del documento en BD
     2. Gestionar stock (solo si guardado exitoso)
     3. Commit automático (Spring @Transactional)
     4. Rollback automático si cualquier paso falla
   - Llamar a `gestionarStockFacturaRectificativa()` automáticamente:
     - "INCREMENTAR" cuando cambia a "Emitido"
     - "DECREMENTAR" cuando cambia de "Emitido" a otro estado

### Fase 6: Backend - Validaciones de Facturas Rectificativas

**Archivos a modificar:**
- `FacturaRectificativaController.kt`

**Tareas:**

1. **Validar productos en `crear()` y `actualizar()`:**
   - Si `facturaOrigen != null`, validar que todos los productos de la rectificativa existen en la factura origen
   - Lanzar excepción si se intenta añadir un producto que no está en la factura origen
   - Mensaje de error: "El producto [nombre] no existe en la factura origen [número]"

2. **Validar cantidades en `crear()` y `actualizar()`:**
   - Si `facturaOrigen != null`, para cada línea de la rectificativa:
     - Buscar la línea correspondiente en la factura origen (mismo productoId)
     - Validar que `cantidad_rectificativa <= cantidad_factura_origen`
     - Lanzar excepción si la cantidad excede la original
     - Mensaje de error: "La cantidad de [producto] (X unidades) excede la cantidad de la factura origen (Y unidades)"

3. **Crear método auxiliar `validarLineasRectificativa()`:**
   ```kotlin
   private fun validarLineasRectificativa(
       lineasRectificativa: List<FacturaRectificativaLineaRequest>,
       facturaOrigen: Factura?
   ) {
       if (facturaOrigen == null) return
       
       lineasRectificativa.forEach { lineaRect ->
           // Buscar producto en factura origen
           val lineaOrigen = facturaOrigen.lineas.find { 
               it.producto?.id == lineaRect.productoId 
           }
           
           if (lineaOrigen == null) {
               throw IllegalArgumentException(
                   "El producto ${lineaRect.nombreProducto} no existe en la factura origen ${facturaOrigen.numero}"
               )
           }
           
           if (lineaRect.cantidad > lineaOrigen.cantidad) {
               throw IllegalArgumentException(
                   "La cantidad de ${lineaRect.nombreProducto} (${lineaRect.cantidad}) " +
                   "excede la cantidad de la factura origen (${lineaOrigen.cantidad})"
               )
           }
       }
   }
   ```

4. **Llamar a validación en ambos métodos:**
   - En `crear()`: después de obtener `facturaOrigen`, antes de crear la rectificativa
   - En `actualizar()`: después de obtener `facturaOrigen`, antes de actualizar

### Fase 3: Backend - Gestión de Cambios de Estado

**Archivos a modificar:**
- `AlbaranController.kt`
- `FacturaController.kt`
- `FacturaRectificativaController.kt`

**Tareas:**

1. **Añadir validación de cambio de estado en todos los controladores:**
   - ⚠️ **TRANSACCIONAL:** Todos los métodos `actualizar()` deben tener `@Transactional`
   - Detectar cuando `estadoAnterior = "Emitido"` y `estadoNuevo != "Emitido"`
   - **Orden de ejecución:**
     1. Validar cambio de estado
     2. Guardar documento con nuevo estado
     3. Gestionar stock (restaurar si sale de Emitido)
     4. Commit automático
     5. Rollback si falla cualquier paso
   - Retornar información sobre el impacto en stock en la respuesta
   - Ejemplo de respuesta:
     ```json
     {
       "documento": {...},
       "advertenciaStock": {
         "tipo": "RESTAURACION",
         "mensaje": "El stock será restaurado al cambiar el estado",
         "productos": [
           {"nombre": "Producto A", "cantidad": 5, "almacen": "Principal"}
         ]
       }
     }
     ```

2. **Implementar endpoint de validación previa (opcional):**
   - `POST /albaranes/{id}/validar-cambio-estado`
   - `POST /facturas/{id}/validar-cambio-estado`
   - `POST /facturas-rectificativas/{id}/validar-cambio-estado`
   - Retorna información sobre impacto en stock SIN guardar cambios
   - **Nota:** Puede no ser necesario si el modal se muestra antes de enviar al backend

### Fase 4: Frontend - Validación y Avisos de Stock

**Archivos a modificar:**
- `useAlbaranes.js`
- `useFacturasForm.js`
- `useFacturasRectificativasForm.js`
- `AlbaranesComponents.js` (componente reutilizable para todos)

**Tareas:**

1. **Crear componente `ModalCambioEstadoStock`:**
   - ⚠️ **OBLIGATORIO:** Modal bloqueante que requiere confirmación explícita
   - No se puede cerrar con click fuera o ESC
   - Tipos de advertencia:
     - "DESCUENTO" - Stock será descontado (al cambiar a Emitido)
     - "RESTAURACION" - Stock será restaurado (al salir de Emitido)
     - "INCREMENTO" - Stock será incrementado (rectificativas a Emitido)
     - "DECREMENTO" - Stock será decrementado (rectificativas saliendo de Emitido)
   - Muestra lista de productos afectados con cantidades
   - Botones: "Confirmar y Guardar" y "Cancelar"
   - **Comportamiento:** Solo envía al backend si usuario confirma

2. **Modificar `guardarAlbaran()` en useAlbaranes.js:**
   - ⚠️ **CRÍTICO:** Detectar cambio de estado ANTES de enviar al backend
   - **Flujo:**
     1. Usuario hace cambios en UI (incluido cambio de estado)
     2. Usuario pulsa "Guardar"
     3. Detectar si estado cambió a/desde "Emitido"
     4. Si hay cambio de estado → Mostrar modal OBLIGATORIO
     5. Si usuario confirma → Enviar al backend (guardar + gestionar stock)
     6. Si usuario cancela → NO enviar nada, mantener UI sin cambios
   - Si cambia DE "Emitido" a otro:
     - Modal: "⚠️ Se restaurará el stock de X productos"
   - Si cambia A "Emitido":
     - Modal: "📦 Se descontará el stock de X productos" (ya existe, mejorar)

3. **Implementar misma lógica en useFacturasForm.js:**
   - Detectar cambios de estado ANTES de enviar
   - Mostrar modal obligatorio con advertencias
   - Considerar si viene de albarán (mensaje diferente)
   - **NO enviar al backend** hasta confirmación del usuario

4. **Implementar lógica en useFacturasRectificativasForm.js:**
   - Modal al cambiar A "Emitido": "✅ Se devolverá stock (incremento)"
   - Modal al salir DE "Emitido": "⚠️ Se restará el stock devuelto"
   - Confirmación obligatoria en ambos casos

5. **Validación de stock en frontend:**
   - ✅ Mostrar stock disponible en tiempo real al seleccionar producto
   - ✅ Advertencia visual si cantidad > stock disponible
   - ⚠️ **IMPORTANTE:** Esta validación es solo informativa en UI
   - La validación definitiva y cambios de stock ocurren en backend
   - Si `permitirVentaSinStock = false`, el backend rechazará la operación

### Fase 5: Frontend - Mejoras en UI

**Archivos a modificar:**
- `AlbaranesComponents.js`
- Componentes de facturas

**Tareas:**

1. **Indicador visual de estado de stock:**
   - Badge o icono que muestre si el documento ha descontado stock
   - Ejemplo: "📦 Stock descontado" / "⏳ Stock pendiente"

2. **Información en formulario:**
   - Mostrar stock disponible al seleccionar producto
   - Advertencia visual si cantidad > stock disponible
   - Considerar stock ya descontado por otros documentos

3. **Historial de movimientos de stock:**
   - Mostrar en detalle del documento qué movimientos de stock generó
   - Fecha, cantidad, almacén, tipo de operación

## ✅ Respuestas del Usuario - Requisitos Confirmados

1. **Facturas con diferencias de albarán:**
   - ✅ SÍ restaurar stock si factura tiene menos cantidad que albarán
   - ✅ Mostrar modal de advertencia ANTES de guardar (igual que al emitir)

2. **Cambio de estado:**
   - ✅ Modales OBLIGATORIOS siempre cuando se emite o se cambia desde emitido
   - ✅ Usuario debe confirmar explícitamente antes de guardar

3. **Validación de stock y transaccionalidad:**
   - ✅ Validar stock en frontend (mostrar disponible en tiempo real)
   - ⚠️ **CRÍTICO:** Cambios de stock SOLO si se guarda en base de datos
   - ⚠️ **CRÍTICO:** NO hacer cambios si solo se cambia estado en UI sin guardar
   - ⚠️ **CRÍTICO:** Usar transacciones con COMMIT al final
   - ⚠️ **CRÍTICO:** ROLLBACK automático si falla cualquier operación
   - Orden: Guardar documento → Gestionar stock → Commit (todo o nada)

4. **Facturas rectificativas:**
   - ✅ Pueden cambiar de "Emitido" a otro estado
   - ✅ Necesitan confirmación especial (modal obligatorio)

## Orden de Implementación Recomendado

1. ✅ **Fase 6** - Validaciones de facturas rectificativas (crítico, previene errores de datos)
2. ✅ **Fase 2** - Facturas Rectificativas stock (más simple, caso especial)
3. ✅ **Fase 3** - Gestión de cambios de estado (base para avisos)
4. ✅ **Fase 4** - Frontend avisos (UX crítica)
5. ✅ **Fase 1** - Facturas con diferencias (caso más complejo)
6. ✅ **Fase 5** - Mejoras UI (opcional, mejora experiencia)

## Archivos Afectados

### Backend
- `demo/demo/demo/src/main/kotlin/com/example/demo/service/StockService.kt`
- `demo/demo/demo/src/main/kotlin/com/example/demo/controller/ventas/AlbaranController.kt`
- `demo/demo/demo/src/main/kotlin/com/example/demo/controller/ventas/FacturaController.kt`
- `demo/demo/demo/src/main/kotlin/com/example/demo/controller/ventas/FacturaRectificativaController.kt`
- `demo/demo/demo/src/main/kotlin/com/example/demo/model/ventas/Albaran.kt` (añadir campo stockDescontado)

### Frontend
- `mi-web-react/src/Prueba/ventas/useAlbaranes.js`
- `mi-web-react/src/Prueba/ventas/useFacturasForm.js`
- `mi-web-react/src/Prueba/ventas/useFacturasRectificativasForm.js`
- `mi-web-react/src/Prueba/ventas/AlbaranesComponents.js`
- Crear: `mi-web-react/src/Prueba/ventas/ModalCambioEstadoStock.js` (nuevo componente)

## Estimación de Esfuerzo

- **Fase 1:** 4-6 horas (complejidad alta - comparación de líneas)
- **Fase 2:** 2-3 horas (complejidad media - gestión stock rectificativas)
- **Fase 3:** 3-4 horas (complejidad media - múltiples controladores)
- **Fase 4:** 4-5 horas (complejidad media - múltiples hooks)
- **Fase 5:** 2-3 horas (complejidad baja - UI)
- **Fase 6:** 2-3 horas (complejidad media - validaciones rectificativas)

**Total estimado:** 17-24 horas

## Riesgos y Consideraciones

1. **Transacciones:** Asegurar que todos los cambios de stock sean transaccionales
2. **Concurrencia:** Manejar casos donde múltiples usuarios editan el mismo documento
3. **Historial:** Considerar guardar log de todos los movimientos de stock
4. **Rollback:** Asegurar que se pueda revertir operaciones si algo falla
5. **Testing:** Probar exhaustivamente todos los casos de transformación de documentos
