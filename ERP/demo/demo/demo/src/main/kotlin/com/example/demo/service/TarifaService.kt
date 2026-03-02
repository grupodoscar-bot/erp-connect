package com.example.demo.service

import com.example.demo.model.*
import com.example.demo.repository.TarifaRepository
import com.example.demo.repository.TarifaProductoRepository
import com.example.demo.repository.ConfiguracionVentasRepository
import org.springframework.stereotype.Service

@Service
class TarifaService(
    private val tarifaRepository: TarifaRepository,
    private val tarifaProductoRepository: TarifaProductoRepository,
    private val configuracionVentasRepository: ConfiguracionVentasRepository
) {

    /**
     * Obtiene el precio de un producto según la tarifa especificada
     * Si no se especifica tarifa, usa la tarifa general
     * Si no existe precio en la tarifa especificada, busca en la tarifa general
     */
    fun obtenerPrecioProducto(producto: Producto, tarifaId: Long? = null): PrecioProducto? {
        val configuracion = configuracionVentasRepository.findTopByOrderByIdAsc()
        
        // Si no está permitido multitarifa, usar solo la tarifa general
        val tarifaAUsar = if (configuracion?.permitirMultitarifa == true && tarifaId != null) {
            tarifaRepository.findById(tarifaId).orElse(null)
        } else {
            tarifaRepository.findByEsGeneralTrue()
        }

        if (tarifaAUsar == null) {
            return null
        }

        // Buscar precio en la tarifa especificada
        val tarifaProducto = tarifaProductoRepository.findByTarifaIdAndProductoId(tarifaAUsar.id, producto.id)
        if (tarifaProducto != null) {
            return PrecioProducto(
                precio = tarifaProducto.precio,
                descuento = tarifaProducto.descuento,
                precioBloqueado = tarifaProducto.precioBloqueado,
                margen = tarifaProducto.margen,
                precioConImpuestos = tarifaProducto.precioConImpuestos,
                tarifa = tarifaAUsar
            )
        }

        // Si no se encuentra en la tarifa especificada y no es la general, buscar en la general
        if (!tarifaAUsar.esGeneral) {
            val tarifaGeneral = tarifaRepository.findByEsGeneralTrue()
            if (tarifaGeneral != null) {
                val tarifaProductoGeneral = tarifaProductoRepository.findByTarifaIdAndProductoId(tarifaGeneral.id, producto.id)
                if (tarifaProductoGeneral != null) {
                    return PrecioProducto(
                        precio = tarifaProductoGeneral.precio,
                        descuento = tarifaProductoGeneral.descuento,
                        precioBloqueado = tarifaProductoGeneral.precioBloqueado,
                        margen = tarifaProductoGeneral.margen,
                        precioConImpuestos = tarifaProductoGeneral.precioConImpuestos,
                        tarifa = tarifaGeneral
                    )
                }
            }
        }

        return null
    }

    /**
     * Obtiene todas las tarifas disponibles según la configuración
     */
    fun obtenerTarifasDisponibles(): List<Tarifa> {
        val configuracion = configuracionVentasRepository.findTopByOrderByIdAsc()
        return if (configuracion?.permitirMultitarifa == true) {
            tarifaRepository.findAllActivasOrdenadas()
        } else {
            listOfNotNull(tarifaRepository.findByEsGeneralTrue())
        }
    }

    /**
     * Obtiene la tarifa por defecto (general)
     */
    fun obtenerTarifaPorDefecto(): Tarifa? {
        return tarifaRepository.findByEsGeneralTrue()
    }

    /**
     * Verifica si está permitido usar múltiples tarifas
     */
    fun esMultitarifaPermitida(): Boolean {
        val configuracion = configuracionVentasRepository.findTopByOrderByIdAsc()
        return configuracion?.permitirMultitarifa == true
    }

    /**
     * Obtiene todos los precios de un producto en todas las tarifas activas
     */
    fun obtenerTodosLosPreciosProducto(producto: Producto): List<PrecioProducto> {
        val tarifasActivas = tarifaRepository.findByActivaTrue()
        val precios = mutableListOf<PrecioProducto>()

        tarifasActivas.forEach { tarifa ->
            val tarifaProducto = tarifaProductoRepository.findByTarifaIdAndProductoId(tarifa.id, producto.id)
            if (tarifaProducto != null) {
                precios.add(
                    PrecioProducto(
                        precio = tarifaProducto.precio,
                        descuento = tarifaProducto.descuento,
                        precioBloqueado = tarifaProducto.precioBloqueado,
                        margen = tarifaProducto.margen,
                        precioConImpuestos = tarifaProducto.precioConImpuestos,
                        tarifa = tarifa
                    )
                )
            }
        }

        return precios
    }

    /**
     * Calcula el precio final basado en el tipo de cálculo configurado
     */
    fun calcularPrecioFinal(producto: Producto, tarifaProducto: TarifaProducto, esCompra: Boolean = false): Double {
        val tipoCalculo = if (esCompra) tarifaProducto.tipoCalculoPrecioCompra else tarifaProducto.tipoCalculoPrecio
        val valorCalculo = if (esCompra) tarifaProducto.valorCalculoCompra else tarifaProducto.valorCalculo
        val precioBase = if (esCompra) tarifaProducto.precioCompra else tarifaProducto.precio
        
        return when (tipoCalculo) {
            TipoCalculoPrecio.PRECIO_FIJO -> {
                // Usar el precio fijo definido en la tarifa
                precioBase ?: 0.0
            }
            TipoCalculoPrecio.PORCENTAJE_SOBRE_COSTE -> {
                // Calcular precio como: ultimoCoste + (ultimoCoste * porcentaje/100)
                val porcentaje = valorCalculo ?: 0.0
                producto.ultimoCoste * (1 + porcentaje / 100.0)
            }
            TipoCalculoPrecio.CANTIDAD_SOBRE_COSTE -> {
                // Calcular precio como: ultimoCoste + cantidad
                val cantidad = valorCalculo ?: 0.0
                producto.ultimoCoste + cantidad
            }
            TipoCalculoPrecio.PORCENTAJE_SOBRE_PRECIO -> {
                // Calcular precio como: precio + (precio * porcentaje/100)
                val porcentaje = valorCalculo ?: 0.0
                producto.precio * (1 + porcentaje / 100.0)
            }
            TipoCalculoPrecio.CANTIDAD_SOBRE_PRECIO -> {
                // Calcular precio como: precio + cantidad
                val cantidad = valorCalculo ?: 0.0
                producto.precio + cantidad
            }
            null -> precioBase ?: 0.0 // Fallback a precio fijo
        }
    }

    /**
     * Calcula el precio de compra final basado en el último coste y la configuración de la tarifa
     */
    fun calcularPrecioFinalCompra(producto: Producto, tarifaProducto: TarifaProducto): Double {
        val precioCompra = tarifaProducto.precioCompra
        // Si hay un precio de compra fijo definido, usarlo
        if (precioCompra != null && precioCompra > 0) {
            return precioCompra
        }
        
        // Si no hay precio de compra fijo, calcular basado en ultimoCoste
        val ultimoCoste = producto.ultimoCoste ?: 0.0
        if (ultimoCoste <= 0) {
            return 0.0
        }
        
        val tipoCalculo = tarifaProducto.tipoCalculoPrecioCompra
        val valorCalculo = tarifaProducto.valorCalculoCompra ?: 0.0
        
        return when (tipoCalculo) {
            TipoCalculoPrecio.PORCENTAJE_SOBRE_COSTE -> {
                // Calcular precio como: ultimoCoste + (ultimoCoste * porcentaje/100)
                ultimoCoste * (1 + valorCalculo / 100.0)
            }
            TipoCalculoPrecio.CANTIDAD_SOBRE_COSTE -> {
                // Calcular precio como: ultimoCoste + cantidad
                ultimoCoste + valorCalculo
            }
            TipoCalculoPrecio.PRECIO_FIJO -> {
                // No debería llegar aquí porque ya verificamos precioCompra arriba
                ultimoCoste
            }
            else -> {
                // Por defecto, usar el último coste sin modificaciones
                ultimoCoste
            }
        }
    }

    /**
     * Obtiene el precio de un producto para compras según la tarifa especificada
     */
    fun obtenerPrecioProductoCompra(producto: Producto, tarifaId: Long? = null): PrecioProducto? {
        val configuracion = configuracionVentasRepository.findTopByOrderByIdAsc()
        
        // Buscar tarifa de compra o ambas
        val tarifaAUsar = if (configuracion?.permitirMultitarifa == true && tarifaId != null) {
            tarifaRepository.findById(tarifaId).orElse(null)?.takeIf { 
                it.tipoTarifa == TipoTarifa.COMPRA || it.tipoTarifa == TipoTarifa.AMBAS 
            }
        } else {
            // Buscar tarifa general de compra
            tarifaRepository.findByEsGeneralTrue()?.takeIf { 
                it.tipoTarifa == TipoTarifa.COMPRA || it.tipoTarifa == TipoTarifa.AMBAS 
            }
        }

        if (tarifaAUsar == null) {
            return null
        }

        // Buscar precio en la tarifa especificada
        val tarifaProducto = tarifaProductoRepository.findByTarifaIdAndProductoId(tarifaAUsar.id, producto.id)
        if (tarifaProducto != null) {
            val precioCalculado = calcularPrecioFinalCompra(producto, tarifaProducto)
            return PrecioProducto(
                precio = precioCalculado,
                descuento = tarifaProducto.descuentoCompra ?: tarifaProducto.descuento,
                precioBloqueado = tarifaProducto.precioBloqueado,
                margen = tarifaProducto.margen,
                precioConImpuestos = tarifaProducto.precioConImpuestos,
                tarifa = tarifaAUsar
            )
        }

        // Si no se encuentra en la tarifa especificada y no es la general, buscar en la general
        if (!tarifaAUsar.esGeneral) {
            val tarifaGeneral = tarifaRepository.findByEsGeneralTrue()?.takeIf { 
                it.tipoTarifa == TipoTarifa.COMPRA || it.tipoTarifa == TipoTarifa.AMBAS 
            }
            if (tarifaGeneral != null) {
                val tarifaProductoGeneral = tarifaProductoRepository.findByTarifaIdAndProductoId(tarifaGeneral.id, producto.id)
                if (tarifaProductoGeneral != null) {
                    val precioCalculado = calcularPrecioFinalCompra(producto, tarifaProductoGeneral)
                    return PrecioProducto(
                        precio = precioCalculado,
                        descuento = tarifaProductoGeneral.descuentoCompra ?: tarifaProductoGeneral.descuento,
                        precioBloqueado = tarifaProductoGeneral.precioBloqueado,
                        margen = tarifaProductoGeneral.margen,
                        precioConImpuestos = tarifaProductoGeneral.precioConImpuestos,
                        tarifa = tarifaGeneral
                    )
                }
            }
        }

        // Si no hay configuración en tarifa_producto, usar ultimoCoste del producto como fallback
        val ultimoCoste = producto.ultimoCoste
        if (ultimoCoste != null && ultimoCoste > 0) {
            return PrecioProducto(
                precio = ultimoCoste,
                descuento = 0.0,
                precioBloqueado = false,
                margen = 0.0,
                precioConImpuestos = 0.0,
                tarifa = tarifaAUsar
            )
        }

        return null
    }
}

data class PrecioProducto(
    val precio: Double,
    val descuento: Double,
    val precioBloqueado: Boolean,
    val margen: Double,
    val precioConImpuestos: Double,
    val tarifa: Tarifa
)
