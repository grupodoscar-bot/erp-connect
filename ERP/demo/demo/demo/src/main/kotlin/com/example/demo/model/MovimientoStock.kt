package com.example.demo.model

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "movimientos_stock")
data class MovimientoStock(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false)
    val fecha: LocalDateTime = LocalDateTime.now(),

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "producto_id", nullable = false)
    @JsonIgnoreProperties(value = ["hibernateLazyInitializer", "handler"])
    val producto: Producto? = null,

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "almacen_id", nullable = false)
    @JsonIgnoreProperties(value = ["hibernateLazyInitializer", "handler"])
    val almacen: Almacen? = null,

    @Column(nullable = false)
    val cantidad: Int = 0,

    @Column(name = "stock_anterior", nullable = false)
    val stockAnterior: Int = 0,

    @Column(name = "stock_nuevo", nullable = false)
    val stockNuevo: Int = 0,

    @Column(name = "tipo_movimiento", nullable = false, length = 50)
    val tipoMovimiento: String = "",

    @Column(columnDefinition = "TEXT", nullable = false)
    val descripcion: String = "",

    @Column(name = "documento_tipo", length = 50)
    val documentoTipo: String? = null,

    @Column(name = "documento_id")
    val documentoId: Long? = null,

    @Column(name = "documento_numero", length = 50)
    val documentoNumero: String? = null,

    @Column(name = "usuario_id")
    val usuarioId: Long? = null,

    @Column(name = "created_at", nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now()
)

object TipoMovimientoStock {
    const val EMISION_ALBARAN = "EMISION_ALBARAN"
    const val REVERSION_ALBARAN = "REVERSION_ALBARAN"
    const val EMISION_FACTURA = "EMISION_FACTURA"
    const val REVERSION_FACTURA = "REVERSION_FACTURA"
    const val MODIFICACION_EMITIDO = "MODIFICACION_EMITIDO"
    const val DIFERENCIA_ALBARAN_FACTURA = "DIFERENCIA_ALBARAN_FACTURA"
    const val AJUSTE_MANUAL = "AJUSTE_MANUAL"
    const val EMISION_FACTURA_RECTIFICATIVA = "EMISION_FACTURA_RECTIFICATIVA"
    const val REVERSION_FACTURA_RECTIFICATIVA = "REVERSION_FACTURA_RECTIFICATIVA"
    // Tipos para compras
    const val EMISION_ALBARAN_COMPRA = "EMISION_ALBARAN_COMPRA"
    const val REVERSION_ALBARAN_COMPRA = "REVERSION_ALBARAN_COMPRA"
    const val EMISION_FACTURA_COMPRA = "EMISION_FACTURA_COMPRA"
    const val REVERSION_FACTURA_COMPRA = "REVERSION_FACTURA_COMPRA"
    const val DIFERENCIA_ALBARAN_FACTURA_COMPRA = "DIFERENCIA_ALBARAN_FACTURA_COMPRA"
}
