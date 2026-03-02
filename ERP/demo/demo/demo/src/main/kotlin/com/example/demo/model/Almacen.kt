package com.example.demo.model

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "almacenes")
data class Almacen(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false, unique = true, length = 100)
    val nombre: String = "",

    @Column(columnDefinition = "TEXT")
    val descripcion: String? = null,

    @Column(columnDefinition = "TEXT")
    val direccion: String? = null,

    @Column(nullable = false)
    val activo: Boolean = true,

    @Column(name = "created_at")
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "updated_at")
    val updatedAt: LocalDateTime = LocalDateTime.now()
)
