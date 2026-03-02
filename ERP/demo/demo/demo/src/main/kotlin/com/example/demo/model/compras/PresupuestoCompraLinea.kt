package com.example.demo.model.compras

import com.example.demo.model.Almacen
import com.example.demo.model.Producto
import com.example.demo.model.TipoIva
import com.fasterxml.jackson.annotation.JsonBackReference
import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import jakarta.persistence.*

@Entity
@Table(name = "compras_presupuestos_lineas")
data class PresupuestoCompraLinea(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "presupuesto_compra_id", nullable = false)
    @JsonBackReference
    val presupuestoCompra: PresupuestoCompra? = null,

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "producto_id")
    @JsonIgnoreProperties(value = ["hibernateLazyInitializer", "handler"])
    val producto: Producto? = null,

    @Column(name = "nombre_producto")
    val nombreProducto: String = "",

    @Column(name = "referencia")
    val referencia: String = "",

    @Column(nullable = false)
    val cantidad: Double = 0.0,

    @Column(name = "precio_unitario", nullable = false)
    val precioUnitario: Double = 0.0,

    @Column(nullable = false)
    val descuento: Double = 0.0,

    @Column(columnDefinition = "TEXT")
    val observaciones: String = "",

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "tipo_iva_id")
    @JsonIgnoreProperties(value = ["hibernateLazyInitializer", "handler"])
    val tipoIva: TipoIva? = null,

    @Column(name = "porcentaje_iva", nullable = false)
    val porcentajeIva: Double = 0.0,

    @Column(name = "porcentaje_recargo", nullable = false)
    val porcentajeRecargo: Double = 0.0,

    @Column(name = "importe_iva", nullable = false)
    val importeIva: Double = 0.0,

    @Column(name = "importe_recargo", nullable = false)
    val importeRecargo: Double = 0.0,

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "almacen_id")
    @JsonIgnoreProperties(value = ["hibernateLazyInitializer", "handler"])
    val almacen: Almacen? = null
)
