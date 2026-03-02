package com.example.demo.model

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import jakarta.persistence.*

@Entity
@Table(name = "agrupaciones")
data class Agrupacion(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @Column(nullable = false, unique = true)
    val nombre: String = "",

    @Column(columnDefinition = "TEXT")
    val descripcion: String? = null,

    @Column(name = "descuento_general")
    val descuentoGeneral: Double = 0.0,

    @Column(name = "activa")
    val activa: Boolean = true,

    @Column(columnDefinition = "TEXT")
    val observaciones: String? = null
)
