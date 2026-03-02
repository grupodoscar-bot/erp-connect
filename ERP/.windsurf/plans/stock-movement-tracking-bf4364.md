# Stock Movement Tracking & Dynamic Invoice Adjustment

Implement comprehensive stock movement logging and dynamic quantity adjustment for already-emitted invoices.

## Requirements Summary

1. **Dynamic Stock Adjustment for Emitted Invoices**
   - When an invoice is already in "Emitido" state and quantities are modified, detect the changes and adjust stock accordingly
   - Only the difference should be applied (e.g., if invoice had 7 units and changes to 8, only deduct 1 more)
   - This applies to both standalone invoices and those linked to albaranes

2. **Stock Movement Logging System**
   - Create a database table to record every stock movement
   - Track movements from all sources:
     - State changes (Pendiente → Emitido, Emitido → Pendiente)
     - Quantity modifications while in Emitido state
     - Manual adjustments (to be implemented in frontend later)
   - Each movement should include:
     - Timestamp
     - Product and warehouse
     - Quantity changed (positive or negative)
     - Previous and new stock levels
     - Type of movement (enum/string)
     - Description explaining the reason
     - Reference to source document (if applicable)
     - User who triggered it (if applicable)

## Implementation Plan

### Phase 1: Database Schema Design

**Create `MovimientoStock` table with:**
- `id` (Long, primary key)
- `fecha` (LocalDateTime, timestamp of movement)
- `producto_id` (FK to Producto)
- `almacen_id` (FK to Almacen)
- `cantidad` (Int, positive for increments, negative for decrements)
- `stock_anterior` (Int, stock level before movement)
- `stock_nuevo` (Int, stock level after movement)
- `tipo_movimiento` (String/Enum: "EMISION_ALBARAN", "REVERSION_ALBARAN", "EMISION_FACTURA", "REVERSION_FACTURA", "MODIFICACION_EMITIDO", "AJUSTE_MANUAL", "DIFERENCIA_ALBARAN_FACTURA")
- `descripcion` (TEXT, human-readable explanation)
- `documento_tipo` (String, nullable: "ALBARAN", "FACTURA", "FACTURA_RECTIFICATIVA", etc.)
- `documento_id` (Long, nullable, ID of source document)
- `documento_numero` (String, nullable, document number for reference)
- `usuario_id` (Long, nullable, FK to Usuario if manual)
- `created_at` (LocalDateTime)

### Phase 2: Backend Model & Repository

**Files to create:**
- `/model/MovimientoStock.kt` - Entity class
- `/repository/MovimientoStockRepository.kt` - JPA repository with query methods

**Key repository methods:**
- `findByProductoIdAndAlmacenIdOrderByFechaDesc()` - History for a product in a warehouse
- `findByDocumentoTipoAndDocumentoId()` - All movements for a specific document
- `findByFechaBetween()` - Movements in a date range
- `findByTipoMovimiento()` - Filter by movement type

### Phase 3: Modify StockService

**Update all stock management methods to log movements:**
- `gestionarStockAlbaran()` - Log "EMISION_ALBARAN" or "REVERSION_ALBARAN"
- `gestionarStockFactura()` - Log "EMISION_FACTURA" or "REVERSION_FACTURA"
- `gestionarStockFacturaConDiferencias()` - Log "DIFERENCIA_ALBARAN_FACTURA"
- `gestionarStockFacturaRectificativa()` - Log rectification movements

**Add new method:**
- `registrarMovimiento()` - Private helper to create and save MovimientoStock records

### Phase 4: Detect Quantity Changes in Emitted Invoices

**Modify `FacturaController.actualizar()`:**
- When `eraEmitido && esEmitido` (stays in Emitido state):
  - Compare `existente.lineas` quantities with `request.lineas` quantities
  - For each product, calculate the difference
  - Call `StockService` with only the differences
  - Log as "MODIFICACION_EMITIDO"

**Implementation approach:**
- Before clearing `existente.lineas`, capture the old quantities in a map
- After calculating new lines, compare quantities per product
- Call a new `StockService.ajustarDiferenciasEmitido()` method

### Phase 5: REST API Endpoints

**Create `MovimientoStockController`:**
- `GET /movimientos-stock` - List all movements (paginated, filterable)
- `GET /movimientos-stock/producto/{productoId}` - Movements for a product
- `GET /movimientos-stock/almacen/{almacenId}` - Movements for a warehouse
- `GET /movimientos-stock/documento/{tipo}/{id}` - Movements for a document
- `POST /movimientos-stock/manual` - Create manual adjustment (for future frontend)

**Request/Response DTOs:**
- `MovimientoStockRequest` - For manual adjustments
- `MovimientoStockResponse` - Serialized movement data

### Phase 6: Testing Scenarios

**Manual testing checklist:**
1. Create albaran, emit it → verify movement logged
2. Revert albaran from Emitido → verify restoration logged
3. Create standalone invoice, emit it → verify movement logged
4. Create invoice from albaran with different quantities → verify difference logged
5. Emit invoice, then modify quantity while staying Emitido → verify adjustment logged
6. Revert invoice from Emitido → verify restoration logged

## Questions for User

1. **User tracking:** Should we track which user made each movement? (requires Usuario integration)
2. **Movement types:** Are the proposed movement types sufficient, or do you need additional categories?
3. **Manual adjustments:** What fields should be required for manual stock adjustments?
4. **Permissions:** Should manual stock adjustments require special permissions?

## Files to Create/Modify

**New files:**
- `/model/MovimientoStock.kt`
- `/repository/MovimientoStockRepository.kt`
- `/controller/MovimientoStockController.kt`
- `/controller/MovimientoStockRequest.kt` (DTO)

**Files to modify:**
- `/service/StockService.kt` - Add logging to all methods
- `/controller/ventas/FacturaController.kt` - Detect quantity changes in Emitido state
- `/controller/ventas/AlbaranController.kt` - May need adjustment for consistency

## Out of Scope (Frontend - Later)

- UI for viewing movement history
- UI for creating manual adjustments
- Charts/graphs for stock movements
- Export functionality
