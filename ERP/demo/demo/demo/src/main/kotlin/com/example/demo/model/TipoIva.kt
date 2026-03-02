package com.example.demo.model

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.OffsetDateTime

@Entity
@Table(name = "tipos_iva")
data class TipoIva(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false, unique = true, length = 100)
    val nombre: String = "",

    @Column(name = "porcentaje_iva", nullable = false)
    val porcentajeIva: Double = 0.0,

    @Column(name = "porcentaje_recargo", nullable = false)
    val porcentajeRecargo: Double = 0.0,

    @Column(nullable = false)
    val activo: Boolean = true,

    @Column(name = "created_at")
    val createdAt: OffsetDateTime = OffsetDateTime.now(),

    @Column(name = "updated_at")
    val updatedAt: OffsetDateTime = OffsetDateTime.now()
)
