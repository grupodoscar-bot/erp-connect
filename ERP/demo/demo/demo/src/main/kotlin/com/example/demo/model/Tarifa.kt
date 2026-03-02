package com.example.demo.model

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "tarifas")
data class Tarifa(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false, unique = true)
    val nombre: String = "",

    @Column(columnDefinition = "TEXT")
    val descripcion: String = "",

    @Column(nullable = false)
    val activa: Boolean = true,

    @Column(name = "es_general", nullable = false)
    val esGeneral: Boolean = false,

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_tarifa", nullable = false)
    val tipoTarifa: TipoTarifa = TipoTarifa.VENTA,

    @Column(name = "ajuste_venta_porcentaje")
    val ajusteVentaPorcentaje: Double? = null,

    @Column(name = "ajuste_venta_cantidad")
    val ajusteVentaCantidad: Double? = null,

    @Column(name = "ajuste_compra_porcentaje")
    val ajusteCompraPorcentaje: Double? = null,

    @Column(name = "ajuste_compra_cantidad")
    val ajusteCompraCantidad: Double? = null,

    @Column(name = "created_at", nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "updated_at", nullable = false)
    val updatedAt: LocalDateTime = LocalDateTime.now()
)
