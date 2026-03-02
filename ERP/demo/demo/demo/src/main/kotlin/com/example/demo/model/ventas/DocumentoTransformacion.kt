package com.example.demo.model.ventas

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "documento_transformaciones")
data class DocumentoTransformacion(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(name = "tipo_origen", nullable = false, length = 50)
    val tipoOrigen: String = "", // "ALBARAN", "FACTURA", "FACTURA_PROFORMA", etc.

    @Column(name = "id_origen", nullable = false)
    val idOrigen: Long = 0,

    @Column(name = "numero_origen", length = 100)
    val numeroOrigen: String? = null,

    @Column(name = "tipo_destino", nullable = false, length = 50)
    val tipoDestino: String = "", // "ALBARAN", "FACTURA", "FACTURA_PROFORMA", etc.

    @Column(name = "id_destino", nullable = false)
    val idDestino: Long = 0,

    @Column(name = "numero_destino", length = 100)
    val numeroDestino: String? = null,

    @Column(name = "tipo_transformacion", nullable = false, length = 50)
    val tipoTransformacion: String = "", // "DUPLICAR", "CONVERTIR", "AGRUPAR"

    @Column(name = "fecha_transformacion", nullable = false)
    val fechaTransformacion: LocalDateTime = LocalDateTime.now(),

    @Column(name = "usuario_id")
    val usuarioId: Long? = null,

    @Column(columnDefinition = "TEXT")
    val observaciones: String? = null
)
