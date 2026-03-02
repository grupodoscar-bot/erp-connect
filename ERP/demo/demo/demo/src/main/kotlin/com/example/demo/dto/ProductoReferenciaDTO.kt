package com.example.demo.dto

data class ProductoReferenciaDTO(
    val id: Long? = null,
    val referencia: String,
    val esPrincipal: Boolean = false,
    val orden: Int = 0
)
