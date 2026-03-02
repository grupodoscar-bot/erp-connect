# Implementación de Albarán de Compra y Factura de Compra

Crear documentos de compra (AlbaranCompra y FacturaCompra) con gestión de stock inversa a ventas, reciclando código de documentos de ventas y aplicando la misma lógica de configuración de stock.

## Análisis de la Complejidad

### Gestión de Stock en Ventas (para replicar inversamente)

**Albarán de Ventas:**
- Si `documentoDescuentaStock = "ALBARAN"` y estado = "Emitido" → **RESTA stock**
- Cambio de estado: gestiona stock según transición (Emitido ↔ otros estados)
- Restaura stock si sale de "Emitido"
- Multialmacén: usa almacén de línea o del documento

**Factura de Ventas:**
- Si `documentoDescuentaStock = "FACTURA"`:
  - Sin albarán → **RESTA stock** al emitir
  - Con albarán → solo ajusta **diferencias** entre cantidades
- Lógica de diferencias: si factura tiene 5 y albarán tenía 3 → resta 2 adicionales

### Gestión de Stock en Compras (lógica inversa)

**AlbaranCompra:**
- Si `documentoDescuentaStock = "ALBARAN"` y estado = "Emitido" → **SUMA stock**
- Cambio de estado: gestiona stock según transición
- Restaura stock (resta) si sale de "Emitido"

**FacturaCompra:**
- Si `documentoDescuentaStock = "FACTURA"`:
  - Sin albarán → **SUMA stock** al emitir
  - Con albarán → solo ajusta **diferencias**
- Lógica de diferencias: si factura tiene 5 y albarán tenía 3 → suma 2 adicionales (inverso a ventas)

## Plan de Implementación

### 1. Backend - Modelos y Entidades

**Crear:**
- `AlbaranCompra.kt` (basado en `Albaran.kt`)
- `AlbaranCompraLinea.kt` (basado en `AlbaranLinea.kt`)
- `FacturaCompra.kt` (basado en `Factura.kt`)
- `FacturaCompraLinea.kt` (basado en `FacturaLinea.kt`)

**Campos clave:**
- Relación con `Proveedor` (en vez de `Cliente`)
- Snapshots de proveedor y direcciones
- Relación `FacturaCompra.albaranCompra` (opcional, como en ventas)
- Estados configurables
- Multialmacén, tarifa, serie

### 2. Backend - Repositorios

**Crear:**
- `AlbaranCompraRepository.kt`
- `FacturaCompraRepository.kt`

### 3. Backend - Servicio de Stock (StockService)

**Añadir métodos:**
- `gestionarStockAlbaranCompra()` - Lógica inversa a `gestionarStockAlbaran()`
  - Emitido → **SUMA** stock (en vez de restar)
  - Sale de Emitido → **RESTA** stock (restaura)
  
- `gestionarStockFacturaCompra()` - Lógica inversa a `gestionarStockFactura()`
  - Sin albarán → **SUMA** stock al emitir
  - Con albarán → ajusta diferencias sumando
  
- `gestionarStockFacturaCompraConDiferencias()` - Lógica inversa
  - Si factura > albarán → **SUMA** diferencia
  - Si factura < albarán → **RESTA** diferencia

**Nuevos tipos de movimiento:**
- `EMISION_ALBARAN_COMPRA`
- `REVERSION_ALBARAN_COMPRA`
- `EMISION_FACTURA_COMPRA`
- `REVERSION_FACTURA_COMPRA`
- `DIFERENCIA_ALBARAN_FACTURA_COMPRA`

### 4. Backend - Controladores

**Crear:**
- `AlbaranCompraController.kt` (basado en `AlbaranController.kt`)
  - CRUD completo
  - Gestión de stock en crear/actualizar
  - Transformaciones (a FacturaCompra)
  - PDF y email
  - Adjuntos
  
- `FacturaCompraController.kt` (basado en `FacturaController.kt`)
  - CRUD completo
  - Gestión de stock con/sin albarán
  - Transformaciones desde AlbaranCompra, PedidoCompra
  - PDF y email
  - Adjuntos

**Lógica de stock en controladores:**
- Capturar estado anterior antes de actualizar
- Llamar a `stockService.gestionarStock*Compra()` después de guardar
- Validar stock insuficiente según configuración

### 5. Backend - Servicios PDF

**Crear:**
- `AlbaranCompraPdfService.kt` (basado en `AlbaranPdfService.kt`)
- `FacturaCompraPdfService.kt` (basado en `FacturaPdfService.kt`)

### 6. Frontend - Hooks

**Crear:**
- `useAlbaranesCompra.js` (basado en `useAlbaranes.js`)
  - Gestión de formulario con proveedores
  - Tracking de `fechaOriginal`
  - Totales filtrados
  - Estados configurables
  
- `useFacturasCompra.js` (basado en `useFacturasForm.js`)
  - Gestión de formulario
  - Relación opcional con AlbaranCompra
  - Tracking de fecha

### 7. Frontend - Componentes

**Crear:**
- `AlbaranesCompraComponents.js` (basado en `AlbaranesComponents.js`)
  - Lista con filtros y paginación
  - Formulario de edición
  - Barra de totales (Base, IVA, Rec. Eq., Total)
  - Modal de transformación a factura
  
- `FacturasCompraComponents.js` (basado en `FacturasComponents.js`)
  - Lista con filtros
  - Formulario
  - Barra de totales
  - Transformación desde albarán/pedido

### 8. Frontend - Integración

**Actualizar:**
- Menú de navegación para incluir "Albaranes de Compra" y "Facturas de Compra"
- Rutas en el router
- API endpoints en `config/api.js`

### 9. Configuración

**Reutilizar:**
- `ConfiguracionVentas.documentoDescuentaStock` se aplica también a compras
- `ConfiguracionVentas.permitirVentaSinStock` se aplica a compras
- `ConfiguracionVentas.permitirVentaMultialmacen` se aplica a compras

## Decisiones Confirmadas

1. **Configuración compartida:** ✅ La configuración de stock es única para ventas y compras. Si `documentoDescuentaStock = "ALBARAN"`, aplica tanto a AlbaranVenta como AlbaranCompra.

2. **Estados de documentos:** ✅ AlbaranCompra y FacturaCompra usan los mismos estados que ventas (Pendiente, Emitido, etc.)

3. **Transformaciones:** ✅ Implementar todas las transformaciones entre documentos de compra:
   - PedidoCompra → AlbaranCompra
   - PedidoCompra → FacturaCompra
   - AlbaranCompra → FacturaCompra
   - AlbaranCompra → PedidoCompra (duplicar)
   - FacturaCompra → AlbaranCompra (duplicar)
   - FacturaCompra → PedidoCompra (duplicar)

4. **Numeración:** ✅ Series de numeración separadas entre compras y ventas (como ya existe con PedidoCompra)

5. **Implementación:** ✅ Proceder con la implementación completa

## Archivos a Crear/Modificar

### Backend (Kotlin)
- `model/compras/AlbaranCompra.kt` ✨
- `model/compras/AlbaranCompraLinea.kt` ✨
- `model/compras/FacturaCompra.kt` ✨
- `model/compras/FacturaCompraLinea.kt` ✨
- `repository/compras/AlbaranCompraRepository.kt` ✨
- `repository/compras/FacturaCompraRepository.kt` ✨
- `controller/compras/AlbaranCompraController.kt` ✨
- `controller/compras/FacturaCompraController.kt` ✨
- `service/StockService.kt` 🔧 (añadir métodos para compras)
- `service/AlbaranCompraPdfService.kt` ✨
- `service/FacturaCompraPdfService.kt` ✨
- `model/MovimientoStock.kt` 🔧 (añadir tipos de movimiento)

### Frontend (React)
- `compras/useAlbaranesCompra.js` ✨
- `compras/AlbaranesCompraComponents.js` ✨
- `compras/useFacturasCompra.js` ✨
- `compras/FacturasCompraComponents.js` ✨
- `config/api.js` 🔧 (añadir endpoints)

**Leyenda:** ✨ Nuevo | 🔧 Modificar

## Estimación

- **Backend:** ~15-20 archivos (4 modelos, 2 repos, 2 controladores, 2 servicios PDF, modificaciones a StockService)
- **Frontend:** ~4 archivos principales + modificaciones menores
- **Complejidad:** Alta (lógica de stock compleja con múltiples casos)
- **Reutilización:** ~70% del código de ventas es reutilizable con adaptaciones
