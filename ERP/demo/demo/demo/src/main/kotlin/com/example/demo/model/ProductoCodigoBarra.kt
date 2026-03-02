package com.example.demo.model

import com.fasterxml.jackson.annotation.JsonIgnore
import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "producto_codigo_barra")
data class ProductoCodigoBarra(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "producto_id", nullable = false)
    @JsonIgnore
    val producto: Producto? = null,

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "codigo_barra_tipo_id", nullable = false)
    val codigoBarraTipo: CodigoBarra? = null,

    @Column(nullable = false, unique = true, length = 128)
    val valor: String = "",

    @Column(length = 128)
    val patron: String? = null,

    @Column(name = "es_principal", nullable = false)
    val esPrincipal: Boolean = false,

    @Column(nullable = false, length = 50)
    val origen: String = "interno",

    @Column(nullable = false)
    val activo: Boolean = true,

    @Column(columnDefinition = "TEXT")
    val notas: String? = null,

    @Column(name = "validacion_omitida", nullable = false)
    val validacionOmitida: Boolean = false,

    @Column(name = "created_at", nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "created_by")
    val createdBy: String? = null,

    @Column(name = "updated_at", nullable = false)
    val updatedAt: LocalDateTime = LocalDateTime.now()
)
