package com.example.demo.model

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import jakarta.persistence.*
import java.time.OffsetDateTime

@Entity
@Table(name = "series_documento")
data class SerieDocumento(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(name = "tipo_documento", nullable = false)
    val tipoDocumento: String,

    @Column(name = "prefijo", nullable = false)
    val prefijo: String,

    val descripcion: String? = null,

    @Column(name = "longitud_correlativo", nullable = false)
    val longitudCorrelativo: Int = 5,

    @Column(nullable = false)
    val activo: Boolean = true,

    @Column(name = "default_sistema", nullable = false)
    val defaultSistema: Boolean = false,

    @Column(name = "permite_seleccion_usuario", nullable = false)
    val permiteSeleccionUsuario: Boolean = true,

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "almacen_predeterminado_id")
    @JsonIgnoreProperties(value = ["hibernateLazyInitializer", "handler"])
    val almacenPredeterminado: Almacen? = null,

    @Column(name = "creado_en")
    val creadoEn: OffsetDateTime = OffsetDateTime.now(),

    @Column(name = "actualizado_en")
    val actualizadoEn: OffsetDateTime = OffsetDateTime.now()
)

@Entity
@Table(name = "series_secuencia")
data class SerieSecuencia(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "serie_id", nullable = false)
    val serie: SerieDocumento,

    @Column(name = "anio", nullable = false)
    val anio: Int,

    @Column(name = "siguiente_numero", nullable = false)
    var siguienteNumero: Long = 1,

    @Column(name = "actualizado_en")
    var actualizadoEn: OffsetDateTime = OffsetDateTime.now()
)

@Entity
@Table(name = "preferencias_series_usuario")
data class PreferenciaSerieUsuario(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    @JsonIgnoreProperties(value = ["hibernateLazyInitializer", "handler"])
    val usuario: Usuario,

    @Column(name = "tipo_documento", nullable = false)
    val tipoDocumento: String,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "serie_id", nullable = false)
    @JsonIgnoreProperties(value = ["hibernateLazyInitializer", "handler"])
    val serie: SerieDocumento,

    @Column(name = "creado_en")
    val creadoEn: OffsetDateTime = OffsetDateTime.now(),

    @Column(name = "actualizado_en")
    var actualizadoEn: OffsetDateTime = OffsetDateTime.now()
)
