package com.example.demo.model

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table

@Entity
@Table(name = "direcciones")
data class Direccion(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_tercero", nullable = false, length = 20)
    val tipoTercero: TipoTercero,

    @Column(name = "id_tercero", nullable = false)
    val idTercero: Long,

    @Column(nullable = false, length = 56)
    val pais: String = "",

    @Column(name = "codigo_postal", length = 12)
    val codigoPostal: String? = null,

    @Column(length = 100)
    val provincia: String? = null,

    @Column(length = 100)
    val poblacion: String? = null,

    @Column(nullable = false, length = 255)
    val direccion: String = "",

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_direccion", nullable = false, length = 20)
    val tipoDireccion: TipoDireccion = TipoDireccion.ENVIO
) {
    enum class TipoTercero {
        CLIENTE,
        PROVEEDOR,
        FABRICANTE
    }

    enum class TipoDireccion {
        FACTURACION,
        ENVIO
    }
}
