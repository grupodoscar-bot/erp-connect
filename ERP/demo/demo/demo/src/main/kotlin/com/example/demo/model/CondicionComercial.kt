package com.example.demo.model

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import jakarta.persistence.*

@Entity
@Table(name = "condiciones_comerciales")
data class CondicionComercial(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "agrupacion_id", nullable = false)
    @JsonIgnoreProperties("hibernateLazyInitializer", "handler")
    val agrupacion: Agrupacion? = null,

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "producto_id", nullable = true)
    @JsonIgnoreProperties("hibernateLazyInitializer", "handler")
    val producto: Producto? = null,

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "tarifa_id", nullable = true)
    @JsonIgnoreProperties("hibernateLazyInitializer", "handler")
    val tarifa: Tarifa? = null,

    @Column(name = "tipo_condicion", nullable = false)
    val tipoCondicion: String = "DESCUENTO_PORCENTAJE",

    @Column(name = "valor")
    val valor: Double = 0.0,

    @Column(name = "precio_especial")
    val precioEspecial: Double? = null,

    @Column(name = "cantidad_minima")
    val cantidadMinima: Int = 0,

    @Column(name = "cantidad_maxima")
    val cantidadMaxima: Int? = null,

    @Column(name = "activa")
    val activa: Boolean = true,

    @Column(columnDefinition = "TEXT")
    val descripcion: String? = null,

    @Column(name = "prioridad")
    val prioridad: Int = 0
)
