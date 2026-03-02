package com.example.demo.model.compras

import com.example.demo.model.Almacen
import com.example.demo.model.ArchivoEmpresa
import com.example.demo.model.Proveedor
import com.example.demo.model.SerieDocumento
import com.example.demo.model.Tarifa
import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonManagedReference
import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "compras_albaranes")
data class AlbaranCompra(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false, unique = true)
    val numero: String = "",

    @Column(nullable = false)
    val fecha: LocalDateTime = LocalDateTime.now(),

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "proveedor_id")
    @JsonIgnoreProperties(value = ["hibernateLazyInitializer", "handler"])
    val proveedor: Proveedor? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "factura_compra_id")
    @JsonIgnoreProperties(value = ["hibernateLazyInitializer", "handler", "lineas"])
    val facturaCompra: FacturaCompra? = null,


    @OneToMany(mappedBy = "albaranCompra", cascade = [CascadeType.ALL], orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference
    val lineas: MutableList<AlbaranCompraLinea> = mutableListOf(),

    @Column(columnDefinition = "TEXT")
    val observaciones: String = "",

    @Column(columnDefinition = "TEXT")
    val notas: String = "",

    @Column(nullable = false)
    val estado: String = "Pendiente",

    @Column(nullable = false)
    val subtotal: Double = 0.0,

    @Column(name = "descuento_total", nullable = false)
    val descuentoTotal: Double = 0.0,

    @Column(nullable = false)
    val total: Double = 0.0,

    @Column(nullable = false)
    val contabilizado: Boolean = false,

    @Column(name = "descuento_agrupacion", nullable = false)
    val descuentoAgrupacion: Double = 0.0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "serie_id")
    @JsonIgnoreProperties(value = ["hibernateLazyInitializer", "handler"])
    val serie: SerieDocumento? = null,

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "almacen_id")
    @JsonIgnoreProperties(value = ["hibernateLazyInitializer", "handler"])
    val almacen: Almacen? = null,

    @Column(name = "compra_multialmacen", nullable = false)
    val compraMultialmacen: Boolean = false,

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "tarifa_id")
    @JsonIgnoreProperties(value = ["hibernateLazyInitializer", "handler"])
    val tarifa: Tarifa? = null,

    @Column(name = "anio_documento")
    val anioDocumento: Int? = null,

    @Column(name = "numero_secuencial")
    val numeroSecuencial: Long? = null,

    @Column(name = "codigo_documento")
    val codigoDocumento: String? = null,

    // Snapshot de datos del proveedor en el momento de creación
    @Column(name = "proveedor_nombre_comercial")
    val proveedorNombreComercial: String? = null,

    @Column(name = "proveedor_nombre_fiscal")
    val proveedorNombreFiscal: String? = null,

    @Column(name = "proveedor_nif_cif")
    val proveedorNifCif: String? = null,

    @Column(name = "proveedor_email")
    val proveedorEmail: String? = null,

    @Column(name = "proveedor_telefono")
    val proveedorTelefono: String? = null,

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

    @Column(name = "direccion_id")
    val direccionId: Long? = null,

    @Column(name = "recargo_equivalencia")
    val recargoEquivalencia: Boolean = false,

    @Column(name = "created_at")
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @Transient
    var adjuntos: List<ArchivoEmpresa> = emptyList()
) {
    fun getTotalBaseSinImpuestos(): Double = subtotal - descuentoTotal - (subtotal - descuentoTotal) * (descuentoAgrupacion / 100.0)
    
    fun getTotalIva(): Double = lineas.sumOf { it.importeIva }
    
    fun getTotalRecargo(): Double = lineas.sumOf { it.importeRecargo }
}
