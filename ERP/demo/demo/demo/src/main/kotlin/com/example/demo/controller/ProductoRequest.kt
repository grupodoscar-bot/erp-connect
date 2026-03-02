package com.example.demo.controller

data class ProductoRequest(
    val referencia: String,
    val titulo: String,
    val nombre: String,
    val precio: Double,
    val etiquetas: String,
    val descripcionCorta: String,
    val notas: String,
    val fabricanteId: Long?,
    val almacenPredeterminadoId: Long?,
    val peso: Double,
    val unidadMedida: String,
    val unidadMedidaReferencia: String,
    val magnitudPorUnidad: String,
    val ultimoCoste: Double,
    val descuento: Double,
    val precioBloqueado: Boolean,
    val margen: Double,
    val precioConImpuestos: Double,
    val imagen: String? = null,
    val familiaIds: List<Long> = emptyList(),
    val subfamiliaIds: List<Long> = emptyList(),
    val tipoIvaId: Long?,
    val stockPorAlmacen: List<StockAlmacenRequest>? = null
)

data class StockAlmacenRequest(
    val almacenId: Long,
    val stock: Int,
    val stockMinimo: Int? = 0,
    val stockMaximo: Int? = null,
    val ubicacion: String? = null
)
