package com.example.demo.model

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "producto_almacen")
data class ProductoAlmacen(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "producto_id", nullable = false)
    @JsonIgnoreProperties(value = ["hibernateLazyInitializer", "handler"])
    val producto: Producto? = null,

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "almacen_id", nullable = false)
    @JsonIgnoreProperties(value = ["hibernateLazyInitializer", "handler"])
    val almacen: Almacen? = null,

    @Column(nullable = false)
    var stock: Int = 0,

    @Column(name = "stock_minimo")
    val stockMinimo: Int? = 0,

    @Column(name = "stock_maximo")
    val stockMaximo: Int? = null,

    @Column(length = 50)
    val ubicacion: String? = null,

    @Column(name = "created_at")
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "updated_at")
    val updatedAt: LocalDateTime = LocalDateTime.now()
)
