package com.example.demo.service

import com.example.demo.model.Cliente
import com.example.demo.model.Producto
import com.example.demo.model.Proveedor
import com.example.demo.model.TipoIva
import org.springframework.stereotype.Service
import kotlin.math.max

data class ImpuestoCalculo(
    val tipoIva: TipoIva?,
    val porcentajeIva: Double,
    val porcentajeRecargo: Double,
    val importeIva: Double,
    val importeRecargo: Double
)

data class LineaImpuesto<T>(
    val request: T,
    val producto: Producto?,
    val impuestos: ImpuestoCalculo
)

@Service
class ImpuestoService {
    fun calcularImpuestos(
        producto: Producto?,
        cliente: Cliente?,
        cantidad: Int,
        precioUnitario: Double,
        descuento: Double,
        descuentoAgrupacion: Double = 0.0
    ): ImpuestoCalculo {
        if (producto == null) {
            return ImpuestoCalculo(null, 0.0, 0.0, 0.0, 0.0)
        }

        val tipoIva = producto.tipoIva
        val porcentajeIva = tipoIva?.porcentajeIva ?: 0.0
        val porcentajeRecargo = if (cliente?.recargoEquivalencia == true) {
            tipoIva?.porcentajeRecargo ?: 0.0
        } else {
            0.0
        }

        // Calcular base teniendo en cuenta el descuento de línea y el descuento de agrupación
        val subtotal = cantidad * precioUnitario
        val descuentoLineaImporte = subtotal * (descuento / 100.0)
        val baseAntesAgrupacion = subtotal - descuentoLineaImporte
        val descuentoAgrupacionImporte = baseAntesAgrupacion * (descuentoAgrupacion / 100.0)
        val base = max(0.0, baseAntesAgrupacion - descuentoAgrupacionImporte)
        
        val importeIva = base * (porcentajeIva / 100.0)
        val importeRecargo = base * (porcentajeRecargo / 100.0)

        return ImpuestoCalculo(
            tipoIva = tipoIva,
            porcentajeIva = porcentajeIva,
            porcentajeRecargo = porcentajeRecargo,
            importeIva = importeIva,
            importeRecargo = importeRecargo
        )
    }

    fun calcularImpuestosProveedor(
        producto: Producto?,
        proveedor: Proveedor?,
        cantidad: Int,
        precioUnitario: Double,
        descuento: Double,
        descuentoAgrupacion: Double = 0.0
    ): ImpuestoCalculo {
        if (producto == null) {
            return ImpuestoCalculo(null, 0.0, 0.0, 0.0, 0.0)
        }

        val tipoIva = producto.tipoIva
        val porcentajeIva = tipoIva?.porcentajeIva ?: 0.0
        val porcentajeRecargo = if (proveedor?.recargoEquivalencia == true) {
            tipoIva?.porcentajeRecargo ?: 0.0
        } else {
            0.0
        }

        val subtotal = cantidad * precioUnitario
        val descuentoLineaImporte = subtotal * (descuento / 100.0)
        val baseAntesAgrupacion = subtotal - descuentoLineaImporte
        val descuentoAgrupacionImporte = baseAntesAgrupacion * (descuentoAgrupacion / 100.0)
        val base = max(0.0, baseAntesAgrupacion - descuentoAgrupacionImporte)
        
        val importeIva = base * (porcentajeIva / 100.0)
        val importeRecargo = base * (porcentajeRecargo / 100.0)

        return ImpuestoCalculo(
            tipoIva = tipoIva,
            porcentajeIva = porcentajeIva,
            porcentajeRecargo = porcentajeRecargo,
            importeIva = importeIva,
            importeRecargo = importeRecargo
        )
    }
}
