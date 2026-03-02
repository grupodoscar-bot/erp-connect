package com.example.demo.dto

import java.time.LocalDateTime

data class ProductoCodigoBarraDTO(
    val id: Long,
    val productoId: Long,
    val codigoBarraTipoId: Long,
    val codigoBarraTipoNombre: String,
    val codigoBarraTipo: String?,
    val valor: String,
    val patron: String?,
    val esPrincipal: Boolean,
    val origen: String,
    val activo: Boolean,
    val notas: String?,
    val validacionOmitida: Boolean,
    val createdAt: LocalDateTime,
    val createdBy: String?,
    val updatedAt: LocalDateTime
)

data class CrearProductoCodigoBarraRequest(
    val codigoBarraTipoId: Long,
    val valor: String,
    val patron: String? = null,
    val esPrincipal: Boolean = false,
    val origen: String = "interno",
    val notas: String? = null,
    val validacionOmitida: Boolean = false
)

data class ActualizarProductoCodigoBarraRequest(
    val esPrincipal: Boolean? = null,
    val activo: Boolean? = null,
    val notas: String? = null
)
