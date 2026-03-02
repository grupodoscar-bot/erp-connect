package com.example.demo.model

import com.fasterxml.jackson.annotation.JsonIgnore
import jakarta.persistence.*

@Entity
@Table(name = "producto_referencias")
data class ProductoReferencia(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "producto_id", nullable = false)
    @JsonIgnore
    val producto: Producto? = null,

    @Column(nullable = false, unique = true, length = 15)
    val referencia: String = "",

    @Column(name = "es_principal", nullable = false)
    val esPrincipal: Boolean = false,

    @Column(nullable = false)
    val orden: Int = 0
)
