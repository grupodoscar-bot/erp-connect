package com.example.demo.model

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "configuracion_ventas")
data class ConfiguracionVentas(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(name = "contabilizar_albaran", nullable = false)
    var contabilizarAlbaran: String = "PREGUNTAR",

    @Column(name = "contabilizar_presupuesto", nullable = false)
    var contabilizarPresupuesto: String = "NO",

    @Column(name = "documento_descuenta_stock", nullable = false)
    var documentoDescuentaStock: String = "ALBARAN",

    @Column(name = "estados_albaran", columnDefinition = "TEXT")
    var estadosAlbaran: String = "Pendiente,Emitido,Entregado,Facturado,Cancelado",

    @Column(name = "permitir_venta_multialmacen", nullable = false)
    var permitirVentaMultialmacen: Boolean = false,

    @Column(name = "permitir_venta_sin_stock", nullable = false)
    var permitirVentaSinStock: Boolean = false,

    @Column(name = "permitir_multitarifa", nullable = false)
    var permitirMultitarifa: Boolean = false,

    @Column(name = "actualizado_en", nullable = false)
    var actualizadoEn: LocalDateTime = LocalDateTime.now()
)
