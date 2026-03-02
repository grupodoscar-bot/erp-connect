# Implementar Transformaciones de Documentos en Compras

Añadir funcionalidad completa de transformaciones de documentos en el módulo de compras, reutilizando la infraestructura existente de ventas y permitiendo transformaciones entre todos los documentos de compra (presupuesto ↔ pedido ↔ albarán ↔ factura) con opción de duplicar.

## Requisitos Confirmados

✅ **Transformaciones**: De todos los documentos de compra a todos los de compra  
✅ **Duplicar**: Opción para duplicar sin registrar transformación (documento "nuevo")  
✅ **Estado**: El usuario selecciona el estado del documento transformado en el modal  
✅ **Stock**: Si el estado es "Emitido", se gestiona stock automáticamente  
✅ **Alcance**: Solo compra → compra por ahora (compra ↔ venta en el futuro)

### ⚠️ Lógica Crítica de Stock en Transformaciones

**Confirmación de stock según configuración `documentoDescuentaStock`**:

1. **Transformar a Albarán "Emitido"** + config = "ALBARAN" → **Pedir confirmación** (va a incrementar stock)
2. **Transformar a Factura "Emitido"** + config = "FACTURA" → **Pedir confirmación** (va a incrementar stock)
3. **Transformar Albarán→Factura "Emitido"** donde:
   - Albarán origen ya estaba "Emitido" 
   - Config = "ALBARAN"
   - Cantidades no cambian
   - → **NO pedir confirmación** (stock ya movido, solo ajustar diferencias)

**Backend**: Usar `gestionarStockFacturaCompraConDiferencias` (equivalente a ventas) que solo ajusta diferencias cuando el documento origen ya movió stock.

**Frontend**: Modal debe verificar si necesita confirmación antes de transformar.

## Contexto Técnico

### Backend (Kotlin)
- **Tabla**: `documento_transformaciones` (compartida ventas/compras)
- **Entidad**: `DocumentoTransformacion.kt` (genérica)
- **Patrón en ventas**: 
  - Endpoint `/duplicar` - NO registra transformación
  - Endpoint `/transformar` - SÍ registra transformación (si `esDuplicacion=false`)
  - `TransformarDocumentoRequest` con campos: `tipoOrigen`, `idOrigen`, `tipoDestino`, `serieId`, `fecha`, `estado`, `esDuplicacion`

### Frontend (React)
- **Patrón en ventas**: Modal con selector de tipo + serie + fecha + estado
- **Columna "Origen"**: Badge clickeable que abre historial
- **Componente**: `HistorialTransformaciones.js` (reutilizable)

## Plan de Implementación

### Fase 1: Backend - Data Classes Request

**1.1 Crear AlbaranCompraRequest.kt** (si no existe completo)
- [ ] `DuplicarAlbaranCompraRequest(albaranOrigenId, serieId, fecha, estado)`
- [ ] `TransformarAlbaranCompraRequest(albaranId, pedidoId, presupuestoId, facturaId, serieId, fecha, estado)`
- [ ] `TransformarDocumentoCompraRequest(tipoOrigen, idOrigen, tipoDestino, serieId, fecha, estado, esDuplicacion)`

**1.2 Crear PedidoCompraRequest.kt** (si no existe completo)
- [ ] `DuplicarPedidoCompraRequest`
- [ ] `TransformarPedidoCompraRequest`

**1.3 Crear PresupuestoCompraRequest.kt** (si no existe completo)
- [ ] `DuplicarPresupuestoCompraRequest`
- [ ] `TransformarPresupuestoCompraRequest`

**1.4 Crear FacturaCompraRequest.kt** (si no existe completo)
- [ ] `DuplicarFacturaCompraRequest`
- [ ] `TransformarFacturaCompraRequest`

### Fase 2: Backend - Controllers (copiar patrón de AlbaranController ventas)

**2.1 AlbaranCompraController**
- [ ] `POST /albaranes-compra/{id}/duplicar` - NO registra transformación
- [ ] `POST /albaranes-compra/transformar` - registra si `esDuplicacion=false`
  - Si `estado="Emitido"` y `documentoDescuentaStock="ALBARAN"` → llamar `StockService.gestionarStockAlbaranCompra`
- [ ] `POST /albaranes-compra/desde-presupuesto-compra`
- [ ] `POST /albaranes-compra/desde-pedido-compra`
- [ ] `POST /albaranes-compra/desde-factura-compra`

**2.2 PedidoCompraController**
- [ ] `POST /pedidos-compra/{id}/duplicar`
- [ ] `POST /pedidos-compra/transformar`
  - Pedidos no gestionan stock
- [ ] `POST /pedidos-compra/desde-presupuesto-compra`
- [ ] `POST /pedidos-compra/desde-albaran-compra`
- [ ] `POST /pedidos-compra/desde-factura-compra`

**2.3 PresupuestoCompraController**
- [ ] `POST /presupuestos-compra/{id}/duplicar`
- [ ] `POST /presupuestos-compra/transformar`
  - Presupuestos no gestionan stock
- [ ] `POST /presupuestos-compra/desde-pedido-compra`
- [ ] `POST /presupuestos-compra/desde-albaran-compra`
- [ ] `POST /presupuestos-compra/desde-factura-compra`

**2.4 FacturaCompraController**
- [ ] `POST /facturas-compra/{id}/duplicar`
- [ ] `POST /facturas-compra/transformar`
  - Si `estado="Emitido"` y `documentoDescuentaStock="FACTURA"` → llamar `StockService.gestionarStockFacturaCompra`
- [ ] `POST /facturas-compra/desde-presupuesto-compra`
- [ ] `POST /facturas-compra/desde-pedido-compra`
- [ ] `POST /facturas-compra/desde-albaran-compra`
  - **CRÍTICO**: Si albaran origen estaba "Emitido" y config="ALBARAN" → usar `gestionarStockFacturaCompraConDiferencias`

**Tipos de documento**:
- `PRESUPUESTO_COMPRA`
- `PEDIDO_COMPRA`
- `ALBARAN_COMPRA`
- `FACTURA_COMPRA`

**2.5 StockService - Métodos para Compras**
- [ ] Verificar que existan (ya deberían estar):
  - `gestionarStockAlbaranCompra(albaran, operacion)` - incrementa stock
  - `gestionarStockFacturaCompra(factura, operacion)` - incrementa stock
  - `gestionarStockFacturaCompraConDiferencias(factura, operacion)` - solo ajusta diferencias vs albarán origen

### Fase 3: Frontend - Hooks

**3.1 usePresupuestosCompraForm.js**
- [ ] Estado modal: `modalTransformarAbierto`, `presupuestoParaTransformar`, `tipoTransformacionSeleccionado`
- [ ] Función `abrirModalTransformar(presupuesto)`
- [ ] Función `ejecutarTransformacion()` - llama a `/transformar` con `esDuplicacion` según tipo
- [ ] Cargar origen: `GET /documento-transformaciones/origen-directo/PRESUPUESTO_COMPRA/{id}`
- [ ] Añadir campo `origen` al estado del documento

**3.2 usePedidosCompraForm.js**
- [ ] Misma estructura que presupuestos

**3.3 useAlbaranesCompraForm.js**
- [ ] Misma estructura que presupuestos

**3.4 useFacturasCompraForm.js**
- [ ] Misma estructura que presupuestos

### Fase 4: Frontend - Modal Transformar

**4.1 ModalTransformarCompra.js** (nuevo componente)
- [ ] Props: `abierto`, `cerrar`, `documento`, `tipoDocumentoActual`, `ejecutar`, `configuracionStock`
- [ ] Selector tipo transformación:
  - "DUPLICAR" (mismo tipo)
  - "PRESUPUESTO_COMPRA"
  - "PEDIDO_COMPRA"
  - "ALBARAN_COMPRA"
  - "FACTURA_COMPRA"
- [ ] Selector serie (filtrado por tipo destino)
- [ ] Selector fecha
- [ ] Selector estado
- [ ] **Lógica de confirmación de stock**:
  - Si `estado="Emitido"` y `tipoDestino="ALBARAN_COMPRA"` y `config.documentoDescuentaStock="ALBARAN"` → Mostrar warning
  - Si `estado="Emitido"` y `tipoDestino="FACTURA_COMPRA"` y `config.documentoDescuentaStock="FACTURA"` → Mostrar warning
  - Si transformando `ALBARAN_COMPRA→FACTURA_COMPRA` y albaran origen ya "Emitido" y config="ALBARAN" → NO mostrar warning
- [ ] Botón "Transformar" / "Duplicar"

### Fase 5: Frontend - Listados

**5.1 PresupuestosCompraComponents.js**
- [ ] Añadir columna "Origen" con badge clickeable
- [ ] Añadir botón "Transformar" en acciones
- [ ] Integrar `ModalTransformarCompra`
- [ ] Integrar `HistorialTransformaciones` en ficha

**5.2 PedidosCompraComponents.js**
- [ ] Columna "Origen"
- [ ] Botón "Transformar"
- [ ] Modal e historial

**5.3 AlbaranesCompraComponents.js**
- [ ] Columna "Origen"
- [ ] Botón "Transformar"
- [ ] Modal e historial

**5.4 FacturasCompraComponents.js**
- [ ] Columna "Origen"
- [ ] Botón "Transformar"
- [ ] Modal e historial

### Fase 6: Frontend - Historial

**6.1 HistorialTransformaciones.js**
- [ ] Actualizar `formatearTipo()` con tipos de compra:
  ```js
  'PRESUPUESTO_COMPRA': 'Presupuesto Compra',
  'PEDIDO_COMPRA': 'Pedido Compra',
  'ALBARAN_COMPRA': 'Albarán Compra',
  'FACTURA_COMPRA': 'Factura Compra'
  ```

## Archivos a Crear/Modificar

### Backend (Kotlin)
- `AlbaranCompraRequest.kt` - crear data classes
- `PedidoCompraRequest.kt` - crear data classes
- `PresupuestoCompraRequest.kt` - crear data classes
- `FacturaCompraRequest.kt` - crear data classes
- `AlbaranCompraController.kt` - añadir endpoints
- `PedidoCompraController.kt` - añadir endpoints
- `PresupuestoCompraController.kt` - añadir endpoints
- `FacturaCompraController.kt` - añadir endpoints

### Frontend (React)
- `ModalTransformarCompra.js` - **NUEVO**
- `usePresupuestosCompraForm.js` - modificar
- `usePedidosCompraForm.js` - modificar
- `useAlbaranesCompraForm.js` - modificar
- `useFacturasCompraForm.js` - modificar
- `PresupuestosCompraComponents.js` - modificar
- `PedidosCompraComponents.js` - modificar
- `AlbaranesCompraComponents.js` - modificar
- `FacturasCompraComponents.js` - modificar
- `HistorialTransformaciones.js` - modificar (añadir tipos)

## Reutilización Máxima

✅ Tabla `documento_transformaciones` (ya existe)  
✅ Entidad `DocumentoTransformacion` (ya existe)  
✅ Controller `DocumentoTransformacionController` (ya existe)  
✅ Componente `HistorialTransformaciones.js` (solo añadir tipos)  
✅ Patrón de endpoints de `AlbaranController` ventas  
✅ Lógica de modal de ventas
