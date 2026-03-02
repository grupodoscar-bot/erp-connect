package com.example.demo.model

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import jakarta.persistence.*
import java.time.LocalDate

@Entity
@Table(name = "clientes")
data class Cliente(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    // Información general
    @Column(name = "nombre_comercial", nullable = false)
    val nombreComercial: String = "",

    @Column(name = "nombre_fiscal")
    val nombreFiscal: String = "",

    @Column(name = "nif_cif")
    val nifCif: String = "",

    @Column(nullable = false)
    val email: String = "",

    val web: String = "",

    @Column(columnDefinition = "TEXT")
    val observaciones: String = "",

    @Column(name = "telefono_fijo")
    val telefonoFijo: String = "",

    @Column(name = "telefono_movil")
    val telefonoMovil: String = "",

    val fax: String = "",

    // Información adicional
    @Column(name = "fecha_nacimiento")
    val fechaNacimiento: LocalDate? = null,

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "agrupacion_id")
    @JsonIgnoreProperties("hibernateLazyInitializer", "handler")
    val agrupacion: Agrupacion? = null,

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "tarifa_id")
    @JsonIgnoreProperties("hibernateLazyInitializer", "handler")
    val tarifaAsignada: Tarifa? = null,

    val tarifa: String = "Normal",

    val descuento: Double = 0.0,

    @Column(name = "forma_pago")
    val formaPago: String = "CONTADO",

    @Column(name = "dias_pago_1")
    val diasPago1: Int = 0,

    @Column(name = "dias_pago_2")
    val diasPago2: Int = 0,

    @Column(name = "riesgo_autorizado")
    val riesgoAutorizado: Double = 0.0,

    @Column(name = "bloquear_ventas")
    val bloquearVentas: Boolean = false,

    @Column(name = "recargo_equivalencia", nullable = false)
    val recargoEquivalencia: Boolean = false,

    // Información bancaria
    @Column(name = "nombre_entidad_bancaria")
    val nombreEntidadBancaria: String = "",

    @Column(name = "cuenta_ccc_entidad")
    val cuentaCccEntidad: String = "",

    @Column(name = "cuenta_ccc_oficina")
    val cuentaCccOficina: String = "",

    @Column(name = "cuenta_ccc_dc")
    val cuentaCccDc: String = "",

    @Column(name = "cuenta_ccc_numero")
    val cuentaCccNumero: String = "",

    @Column(name = "cuenta_iban")
    val cuentaIban: String = "",

    @Column(name = "cuenta_iban_pais")
    val cuentaIbanPais: String = "ES",

    // Impuestos
    @Column(name = "modo_impuesto")
    val modoImpuesto: String = "Normal",

    @Column(name = "retencion")
    val retencion: String = "Exento 0%"
)
