package com.example.demo.model

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "tarifa_productos")
data class TarifaProducto(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tarifa_id", nullable = false)
    @JsonIgnoreProperties(value = ["hibernateLazyInitializer", "handler"])
    val tarifa: Tarifa? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "producto_id", nullable = false)
    @JsonIgnoreProperties(value = ["hibernateLazyInitializer", "handler"])
    val producto: Producto? = null,

    @Column(nullable = false)
    val precio: Double = 0.0,

    val descuento: Double = 0.0,

    @Column(name = "precio_bloqueado")
    val precioBloqueado: Boolean = false,

    val margen: Double = 0.0,

    @Column(name = "precio_con_impuestos")
    val precioConImpuestos: Double = 0.0,

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_calculo_precio")
    val tipoCalculoPrecio: TipoCalculoPrecio? = TipoCalculoPrecio.PRECIO_FIJO,

    @Column(name = "valor_calculo")
    val valorCalculo: Double? = null,

    @Column(name = "precio_compra")
    val precioCompra: Double? = null,

    @Column(name = "descuento_compra")
    val descuentoCompra: Double? = null,

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_calculo_precio_compra")
    val tipoCalculoPrecioCompra: TipoCalculoPrecio? = null,

    @Column(name = "valor_calculo_compra")
    val valorCalculoCompra: Double? = null,

    @Column(name = "created_at", nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "updated_at", nullable = false)
    val updatedAt: LocalDateTime = LocalDateTime.now()
)
