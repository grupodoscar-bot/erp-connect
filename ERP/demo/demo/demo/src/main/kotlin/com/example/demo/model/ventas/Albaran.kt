package com.example.demo.model.ventas

import com.example.demo.model.Almacen
import com.example.demo.model.ArchivoEmpresa
import com.example.demo.model.Cliente
import com.example.demo.model.Direccion
import com.example.demo.model.SerieDocumento
import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonManagedReference
import jakarta.persistence.CascadeType
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.OneToMany
import jakarta.persistence.Table
import jakarta.persistence.Transient
import java.time.LocalDate
import java.time.LocalDateTime

@Entity
@Table(name = "ventas_albaranes")
data class Albaran(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false, unique = true)
    val numero: String = "",

    @Column(nullable = false)
    val fecha: LocalDateTime = LocalDateTime.now(),

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "cliente_id")
    @JsonIgnoreProperties(value = ["hibernateLazyInitializer", "handler"])
    val cliente: Cliente? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "factura_id")
    @JsonIgnoreProperties(value = ["hibernateLazyInitializer", "handler", "lineas"])
    val factura: Factura? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "factura_proforma_origen_id")
    @JsonIgnoreProperties(value = ["hibernateLazyInitializer", "handler", "lineas"])
    val facturaProformaOrigen: FacturaProforma? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "factura_rectificativa_origen_id")
    @JsonIgnoreProperties(value = ["hibernateLazyInitializer", "handler", "lineas"])
    val facturaRectificativaOrigen: FacturaRectificativa? = null,

    @OneToMany(mappedBy = "albaran", cascade = [CascadeType.ALL], orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference
    val lineas: MutableList<AlbaranLinea> = mutableListOf(),

    @Column(columnDefinition = "TEXT")
    val observaciones: String = "",

    @Column(columnDefinition = "TEXT")
    val notas: String = "",

    @Column(nullable = false)
    val estado: String = "Pendiente",

    @Column(nullable = false)
    val subtotal: Double = 0.0,

    @Column(nullable = false)
    val descuentoTotal: Double = 0.0,

    @Column(nullable = false)
    val total: Double = 0.0,

    @Column(nullable = false)
    val contabilizado: Boolean = false,

    @Column(name = "descuento_agrupacion", nullable = false)
    val descuentoAgrupacion: Double = 0.0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "direccion_id")
    @JsonIgnoreProperties(value = ["hibernateLazyInitializer", "handler"])
    val direccion: Direccion? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "serie_id")
    @JsonIgnoreProperties(value = ["hibernateLazyInitializer", "handler"])
    val serie: SerieDocumento? = null,

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "almacen_id")
    @JsonIgnoreProperties(value = ["hibernateLazyInitializer", "handler"])
    val almacen: Almacen? = null,

    @Column(name = "venta_multialmacen", nullable = false)
    val ventaMultialmacen: Boolean = false,

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "tarifa_id")
    @JsonIgnoreProperties(value = ["hibernateLazyInitializer", "handler"])
    val tarifa: com.example.demo.model.Tarifa? = null,

    @Column(name = "anio_documento")
    val anioDocumento: Int? = null,

    @Column(name = "numero_secuencial")
    val numeroSecuencial: Long? = null,

    @Column(name = "codigo_documento")
    val codigoDocumento: String? = null,

    // Snapshot de datos del cliente en el momento de creación
    @Column(name = "cliente_nombre_comercial")
    val clienteNombreComercial: String? = null,

    @Column(name = "cliente_nombre_fiscal")
    val clienteNombreFiscal: String? = null,

    @Column(name = "cliente_nif_cif")
    val clienteNifCif: String? = null,

    @Column(name = "cliente_email")
    val clienteEmail: String? = null,

    @Column(name = "cliente_telefono")
    val clienteTelefono: String? = null,

    // Snapshot de dirección de facturación
    @Column(name = "direccion_facturacion_pais")
    val direccionFacturacionPais: String? = null,

    @Column(name = "direccion_facturacion_codigo_postal")
    val direccionFacturacionCodigoPostal: String? = null,

    @Column(name = "direccion_facturacion_provincia")
    val direccionFacturacionProvincia: String? = null,

    @Column(name = "direccion_facturacion_poblacion")
    val direccionFacturacionPoblacion: String? = null,

    @Column(name = "direccion_facturacion_direccion", columnDefinition = "TEXT")
    val direccionFacturacionDireccion: String? = null,

    // Snapshot de dirección de envío
    @Column(name = "direccion_envio_pais")
    val direccionEnvioPais: String? = null,

    @Column(name = "direccion_envio_codigo_postal")
    val direccionEnvioCodigoPostal: String? = null,

    @Column(name = "direccion_envio_provincia")
    val direccionEnvioProvincia: String? = null,

    @Column(name = "direccion_envio_poblacion")
    val direccionEnvioPoblacion: String? = null,

    @Column(name = "direccion_envio_direccion", columnDefinition = "TEXT")
    val direccionEnvioDireccion: String? = null,

    @Transient
    var adjuntos: List<ArchivoEmpresa> = emptyList()
) {
    fun getTotalBaseSinImpuestos(): Double = subtotal - descuentoTotal - (subtotal - descuentoTotal) * (descuentoAgrupacion / 100.0)
    
    fun getTotalIva(): Double = lineas.sumOf { it.importeIva }
    
    fun getTotalRecargo(): Double = lineas.sumOf { it.importeRecargo }
}
