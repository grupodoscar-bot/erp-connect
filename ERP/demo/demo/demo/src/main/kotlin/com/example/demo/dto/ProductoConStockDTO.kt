package com.example.demo.dto

data class ProductoConStockDTO(
    val id: Long,
    val referencia: String,
    val titulo: String,
    val nombre: String,
    val precio: Double,
    val stock: Int, // Total stock across all warehouses
    val etiquetas: String,
    val descripcionCorta: String,
    val notas: String,
    val fabricante: FabricanteSimpleDTO?,
    val almacenPredeterminado: AlmacenSimpleDTO?,
    val peso: Double,
    val unidadMedida: String?,
    val unidadMedidaReferencia: String?,
    val magnitudPorUnidad: String?,
    val ultimoCoste: Double,
    val descuento: Double,
    val precioBloqueado: Boolean,
    val margen: Double,
    val precioConImpuestos: Double,
    val tipoIva: TipoIvaSimpleDTO?,
    val imagen: String?,
    val familias: Set<FamiliaSimpleDTO>,
    val subfamilias: Set<SubfamiliaSimpleDTO>,
    val stockPorAlmacen: List<StockAlmacenDTO>,
    val referencias: List<ProductoReferenciaDTO> = emptyList(),
    val codigosBarras: List<ProductoCodigoBarraDTO> = emptyList()
)

data class FabricanteSimpleDTO(
    val id: Long,
    val nombre: String
)

data class TipoIvaSimpleDTO(
    val id: Long,
    val nombre: String,
    val porcentaje: Double
)

data class FamiliaSimpleDTO(
    val id: Long,
    val nombre: String,
    val color: String?,
    val imagen: String?
)

data class SubfamiliaSimpleDTO(
    val id: Long,
    val nombre: String,
    val familiaId: Long?
)

data class StockAlmacenDTO(
    val almacenId: Long,
    val almacenNombre: String,
    val stock: Int,
    val stockMinimo: Int?,
    val stockMaximo: Int?,
    val ubicacion: String?
)

data class AlmacenSimpleDTO(
    val id: Long,
    val nombre: String
)
