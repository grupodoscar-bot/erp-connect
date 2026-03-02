package com.example.demo.model

import jakarta.persistence.*
import java.time.LocalDateTime
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes

@Entity
@Table(name = "usuario_inicio_panel")
data class UsuarioInicioPanel(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(name = "usuario_id", nullable = false)
    var usuarioId: Long,

    @Column(nullable = false)
    var tipo: String,

    @Column(nullable = false)
    var target: String,

    var titulo: String? = null,
    var descripcion: String? = null,

    @Column(name = "size_w", nullable = false)
    var sizeW: Int = 1,

    @Column(name = "size_h", nullable = false)
    var sizeH: Int = 1,

    @Column(nullable = false)
    var posicion: Int = 0,

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    var meta: Map<String, Any?> = emptyMap(),

    @Column(name = "creado_en")
    var creadoEn: LocalDateTime? = null,

    @Column(name = "actualizado_en")
    var actualizadoEn: LocalDateTime? = null
) {

    @PrePersist
    fun onCreate() {
        val now = LocalDateTime.now()
        creadoEn = now
        actualizadoEn = now
    }

    @PreUpdate
    fun onUpdate() {
        actualizadoEn = LocalDateTime.now()
    }
}
