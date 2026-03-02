package com.example.demo.model

import jakarta.persistence.*

@Entity
@Table(name = "familias")
data class Familia(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false, unique = true)
    val nombre: String = "",

    @Column(nullable = false)
    val descripcion: String = "",

    @Column(name = "colortpv")
    val colorTPV: String? = null,

    val imagen: String? = null
)
