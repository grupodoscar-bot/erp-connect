# Estrategia de Listados con Referencias Editables

## Objetivo
Registrar cómo tratar las referencias personalizadas (principal o alternativas) en los informes de ventas, para tener una guía cuando implementemos listados.

## Estado Actual
- Cada línea de venta (albaranes, facturas, etc.) guarda **dos datos separados**:
  1. `productoId`: el ID interno del producto elegido en el catálogo.
  2. `referencia`: el texto que se muestra en el documento (puede ser la principal, una alternativa o una personalizada escrita a mano).
- El `ReferenciaSelector` permite buscar por cualquier referencia y, después de seleccionar, **se puede editar manualmente** la referencia antes de guardar.

## Recomendación para Informes
1. **Agrupar por `productoId` como base**:
   - Garantiza consistencia: aunque el usuario cambie la referencia textual, seguimos sabiendo qué producto real se vendió.
   - Permite listados como "Ventas del producto 123" sin importar la referencia personalizada.

2. **Mostrar la referencia usada en cada línea**:
   - Incluye siempre el campo `referencia` guardado en la línea para saber qué texto vio el cliente (ej: "ref45", "edfasdasd", etc.).
   - Útil para auditoría, trazabilidad y atención al cliente.

3. **Soporte futuro para referencias que cuenten como SKU independiente**:
   - Añadir en `ProductoReferencia` un booleano `contarComoProductoIndependiente` (default `false`).
   - Lógica para informes:
     - Si `false`: agrupar por `productoId`.
     - Si `true`: agrupar por combinación (`productoId`, `referenciaAltId`) o por la referencia alternativa específica.
   - Esto permitiría que ciertos clientes marquen referencias alternativas como productos distintos sin duplicar el catálogo.

4. **Opción por documento** (opcional):
   - En la línea de la venta, guardar un flag `contarComoProductoDistinto` para permitir decisiones caso a caso.
   - Ejemplo: un mismo producto puede contarse como SKU distinto sólo en algunas ventas especiales.

## Próximos Pasos Sugeridos
1. Mantener siempre `productoId` obligatorio en cada línea.
2. Al diseñar los listados:
   - Base: agrupar/filtrar por `productoId`.
   - Mostrar columna adicional con la referencia usada (`linea.referencia`).
3. Si algún cliente necesita tratar referencias alternativas como productos distintos:
   - Añadir el booleano en `ProductoReferencia` y adaptar la lógica de informes.
   - Documentar la regla de negocio (quién decide si es SKU independiente: catálogo o usuario al vender).

Con esta guía tendremos claro cómo responder cuando se pida "listado de ventas por referencia" o "ventas por producto" sin perder información cuando se usan referencias personalizadas.
