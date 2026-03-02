# Sistema de Múltiples Referencias por Producto

Implementar la capacidad de que cada producto tenga múltiples referencias (una principal + alternativas ilimitadas), permitiendo búsqueda por cualquier referencia y conservando la referencia usada en la búsqueda en los documentos de venta.

## 1. Cambios en el Backend (Kotlin/Spring Boot)

### 1.1 Nuevo Modelo de Datos
- **Crear entidad `ProductoReferencia`**:
  - `id: Long` (PK)
  - `producto: Producto` (ManyToOne)
  - `referencia: String` (única, max 15 caracteres)
  - `esPrincipal: Boolean` (default false)
  - `orden: Int` (para ordenar las referencias)
  
- **Modificar entidad `Producto`**:
  - Mantener campo `referencia` actual como referencia principal (compatibilidad)
  - Agregar relación `@OneToMany referencias: Set<ProductoReferencia>`
  - El campo `referencia` existente será siempre la referencia principal

### 1.2 Repository y Service
- **Crear `ProductoReferenciaRepository`**:
  - `findByReferencia(referencia: String): ProductoReferencia?`
  - `findByProductoId(productoId: Long): List<ProductoReferencia>`
  - `existsByReferencia(referencia: String): Boolean`

- **Actualizar `ProductoService`** (o crear si no existe):
  - Método para agregar/eliminar referencias alternativas
  - Validación de unicidad de referencias (principal + alternativas)
  - Al buscar producto por referencia, buscar en ambas tablas

### 1.3 Controller
- **Actualizar `ProductoController`**:
  - Endpoint `GET /productos/buscar-por-referencia/{referencia}` - busca en principal y alternativas
  - Endpoint `POST /productos/{id}/referencias` - agregar referencia alternativa
  - Endpoint `DELETE /productos/referencias/{referenciaId}` - eliminar referencia alternativa
  - Endpoint `GET /productos/{id}/referencias` - listar todas las referencias
  - Modificar endpoint de creación/edición para manejar referencias

### 1.4 DTOs
- **Crear `ProductoReferenciaDTO`**:
  ```kotlin
  data class ProductoReferenciaDTO(
    val id: Long?,
    val referencia: String,
    val esPrincipal: Boolean,
    val orden: Int
  )
  ```

- **Actualizar `ProductoConStockDTO`**:
  - Agregar campo `referencias: List<ProductoReferenciaDTO>`

## 2. Cambios en el Frontend (React)

### 2.1 Componente de Gestión de Referencias
- **Crear `ReferenciasProducto.js`**:
  - Lista de referencias con indicador de principal
  - Botón para agregar nueva referencia
  - Botón para eliminar referencias alternativas (no la principal)
  - Validación de unicidad en tiempo real
  - Drag & drop para reordenar (opcional)

### 2.2 Listado de Productos
- **Actualizar `ListaProductos` en `ProductosComponents.js`**:
  - Columna "Ref." mostrará: `<referencia principal> <badge si hay alternativas>`
  - Badge formato: pequeño círculo gris con número, ej: `(+3)`
  - Tooltip al hover: lista vertical de todas las referencias alternativas
  - Ejemplo visual: `ABC123 (+3)` → tooltip muestra: `DEF456`, `GHI789`, `JKL012`

### 2.3 Formulario de Producto
- **Actualizar `FormularioProducto` en `ProductosComponents.js`**:
  - Mantener campo "Referencia" actual como referencia principal
  - Agregar sección "Referencias Alternativas" con el nuevo componente
  - Al guardar, enviar referencias alternativas al backend

### 2.4 Búsqueda en Ventas
- **Actualizar `ReferenciaSelector.js`**:
  - Modificar búsqueda para incluir referencias alternativas
  - Al seleccionar producto, guardar la referencia usada en la búsqueda
  - Mostrar en dropdown: "Ref: ABC123 (alternativa)" si no es la principal

### 2.5 Documentos de Venta
- **Actualizar `useAlbaranes.js` y otros hooks de documentos**:
  - Al agregar línea, capturar la referencia usada en la búsqueda
  - Guardar esa referencia específica en la línea del documento
  - Si se agrega producto sin búsqueda, usar referencia principal

- **Actualizar `AlbaranesComponents.js`**:
  - Mostrar la referencia específica que se usó (ya guardada en `linea.referencia`)
  - No cambios necesarios en visualización (ya usa `linea.referencia`)

## 3. Migración de Datos

### 3.1 Script de Migración SQL
```sql
-- Crear tabla de referencias
CREATE TABLE producto_referencias (
  id BIGSERIAL PRIMARY KEY,
  producto_id BIGINT NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  referencia VARCHAR(15) NOT NULL UNIQUE,
  es_principal BOOLEAN DEFAULT FALSE,
  orden INT DEFAULT 0,
  CONSTRAINT fk_producto FOREIGN KEY (producto_id) REFERENCES productos(id)
);

-- Crear índices
CREATE INDEX idx_producto_ref_producto ON producto_referencias(producto_id);
CREATE INDEX idx_producto_ref_referencia ON producto_referencias(referencia);

-- Migrar referencias principales existentes (opcional, para consistencia)
-- INSERT INTO producto_referencias (producto_id, referencia, es_principal, orden)
-- SELECT id, referencia, true, 0 FROM productos WHERE referencia IS NOT NULL;
```

### 3.2 Estrategia de Compatibilidad
- **Mantener campo `productos.referencia`** como referencia principal
- **No migrar datos automáticamente** - las referencias alternativas se agregarán manualmente
- **Búsqueda híbrida**: buscar primero en `productos.referencia`, luego en `producto_referencias`

## 4. Flujo de Trabajo del Usuario

### 4.1 Crear/Editar Producto
1. Usuario ingresa referencia principal (campo obligatorio actual)
2. Usuario puede agregar referencias alternativas en nueva sección
3. Al guardar, se valida unicidad de todas las referencias
4. Se guardan referencias alternativas en tabla separada

### 4.2 Buscar Producto en Ventas
1. Usuario escribe 3+ caracteres en `ReferenciaSelector`
2. Sistema busca en:
   - `productos.referencia` (principal)
   - `producto_referencias.referencia` (alternativas)
3. Dropdown muestra productos encontrados con indicador de tipo de referencia
4. Al seleccionar, se guarda la referencia específica usada

### 4.3 Documento de Venta
1. Línea del documento almacena la referencia usada en búsqueda
2. Al visualizar/imprimir, se muestra esa referencia específica
3. Si producto se agregó sin búsqueda, usa referencia principal

## 5. Puntos de Impacto (No Romper Nada)

### 5.1 Compatibilidad Hacia Atrás
- ✅ Campo `productos.referencia` se mantiene (referencia principal)
- ✅ Documentos existentes siguen funcionando (usan `linea.referencia`)
- ✅ Búsqueda actual sigue funcionando (se extiende, no se reemplaza)
- ✅ PDFs y reportes siguen mostrando referencias correctamente

### 5.2 Validaciones Críticas
- Unicidad de referencias (principal + alternativas) a nivel global
- No permitir eliminar referencia principal
- No permitir referencias vacías o duplicadas
- Validar longitud máxima (15 caracteres)

### 5.3 Módulos Afectados
- ✅ **Productos**: Formulario de creación/edición
- ✅ **Ventas**: Todos los documentos (Albaranes, Presupuestos, Pedidos, Facturas, etc.)
- ✅ **PDFs**: Generación de albaranes y facturas (ya usan `linea.referencia`)
- ✅ **TPV**: Si usa referencias (verificar)
- ✅ **Búsquedas**: Todos los selectores de productos

## 6. Orden de Implementación

1. **Backend - Modelo y Repository** (sin romper nada)
2. **Backend - Service y validaciones**
3. **Backend - Controller y endpoints**
4. **Frontend - Componente de gestión de referencias**
5. **Frontend - Actualizar formulario de producto**
6. **Frontend - Actualizar búsqueda en ventas**
7. **Testing - Crear producto con múltiples referencias**
8. **Testing - Buscar y usar en documentos de venta**
9. **Testing - Verificar PDFs y reportes**

## 7. Consideraciones Técnicas

### 7.1 Rendimiento
- Índices en `producto_referencias.referencia` para búsqueda rápida
- Límite razonable de referencias por producto (aunque ilimitado, sugerir máximo práctico)
- Caché de referencias más usadas (opcional)

### 7.2 UX
- Indicador visual claro de referencia principal vs alternativas
- Autocompletado en búsqueda mostrando tipo de referencia
- Validación en tiempo real de unicidad
- Mensajes claros de error

### 7.3 Seguridad
- Validar permisos para agregar/eliminar referencias
- Sanitizar input de referencias
- Prevenir inyección SQL en búsquedas

## 8. Testing Checklist

- [ ] Crear producto con referencia principal
- [ ] Agregar 3 referencias alternativas
- [ ] Buscar producto por referencia principal
- [ ] Buscar producto por referencia alternativa
- [ ] Crear albarán usando referencia alternativa
- [ ] Verificar que albarán muestra referencia alternativa usada
- [ ] Generar PDF y verificar referencia correcta
- [ ] Editar producto y eliminar referencia alternativa
- [ ] Intentar crear referencia duplicada (debe fallar)
- [ ] Verificar documentos existentes siguen funcionando

## 9. Requisitos Confirmados

### 9.1 Historial de Cambios
- ❌ **No implementar historial específico** - se agregará un sistema de log general próximamente
- Las referencias se pueden agregar/eliminar sin tracking individual

### 9.2 Listado de Productos
- ✅ **Mostrar referencia principal + badge con contador** - ej: "ABC123 (+3)"
- ✅ **Tooltip al pasar ratón** - muestra lista completa de referencias alternativas
- ✅ **Búsqueda funciona con todas las referencias** - aunque solo se muestre la principal en tabla
- Implementación: Badge pequeño, discreto, solo visible si hay referencias alternativas

### 9.3 Validación de Unicidad
- ✅ **Referencias únicas a nivel global** - no se pueden repetir entre productos
- Validar tanto en backend como frontend
- Mensaje claro si referencia ya existe

### 9.4 Importación/Exportación
- ✅ **Exportar referencias alternativas** en Excel/CSV
- ✅ **Importar referencias alternativas** en carga masiva
- Formato sugerido: columnas adicionales "ref_alt_1", "ref_alt_2", etc. o campo separado por comas
