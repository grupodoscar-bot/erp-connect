package com.example.demo.service

import com.example.demo.model.Almacen
import com.example.demo.model.ventas.Albaran
import com.example.demo.model.ventas.AlbaranLinea
import com.example.demo.model.ventas.Factura
import com.example.demo.model.ventas.FacturaLinea
import com.example.demo.model.ventas.FacturaRectificativa
import com.example.demo.model.ventas.FacturaRectificativaLinea
import com.example.demo.model.compras.AlbaranCompra
import com.example.demo.model.compras.AlbaranCompraLinea
import com.example.demo.model.compras.FacturaCompra
import com.example.demo.model.compras.FacturaCompraLinea
import com.example.demo.model.MovimientoStock
import com.example.demo.model.TipoMovimientoStock
import com.example.demo.repository.ProductoAlmacenRepository
import com.example.demo.repository.ConfiguracionVentasRepository
import com.example.demo.repository.MovimientoStockRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Service
class StockService(
    private val productoAlmacenRepository: ProductoAlmacenRepository,
    private val configuracionVentasRepository: ConfiguracionVentasRepository,
    private val movimientoStockRepository: MovimientoStockRepository
) {

    fun restaurarStockAlbaranEmitido(albaran: Albaran) {
        val configuracion = configuracionVentasRepository.findTopByOrderByIdAsc()
        if (configuracion?.documentoDescuentaStock != "ALBARAN") {
            return
        }

        if (albaran.estado != "Emitido") {
            return
        }

        restaurarStockLineas(albaran.lineas, albaran.ventaMultialmacen, albaran.almacen, albaran.id, albaran.numero)
    }

    @Transactional
    fun gestionarStockAlbaran(
        albaranActualizado: Albaran, 
        estadoAnterior: String?,
        lineasAnteriores: List<AlbaranLinea> = emptyList(),
        ventaMultialmacenAnterior: Boolean = false,
        almacenAnterior: Almacen? = null
    ) {
        // Obtener configuración para saber qué documento descuenta stock
        val configuracion = configuracionVentasRepository.findTopByOrderByIdAsc()
        if (configuracion?.documentoDescuentaStock != "ALBARAN") {
            return
        }

        val estadoActual = albaranActualizado.estado
        val eraEmitido = estadoAnterior == "Emitido"
        val esEmitido = estadoActual == "Emitido"

        when {
            // Caso 1: Cambió de NO emitido a Emitido -> Descontar stock
            !eraEmitido && esEmitido -> {
                descontarStock(albaranActualizado)
            }
            // Caso 2: Era Emitido y sigue Emitido -> Restaurar stock anterior y descontar el nuevo
            eraEmitido && esEmitido -> {
                // Restaurar el stock de las líneas anteriores
                restaurarStockLineas(lineasAnteriores, ventaMultialmacenAnterior, almacenAnterior, albaranActualizado.id, albaranActualizado.numero)
                // Descontar el nuevo stock
                descontarStock(albaranActualizado)
            }
            // Caso 3: Era Emitido y cambió a otro estado -> Restaurar stock
            eraEmitido && !esEmitido -> {
                restaurarStockLineas(lineasAnteriores, ventaMultialmacenAnterior, almacenAnterior, albaranActualizado.id, albaranActualizado.numero)
            }
            // Caso 4: No era Emitido y sigue sin serlo -> No hacer nada
            else -> {
                // No hacer nada
            }
        }
    }

    private fun descontarStock(albaran: Albaran) {
        // Obtener configuración para validar si se permite venta sin stock
        val configuracion = configuracionVentasRepository.findTopByOrderByIdAsc()
        val permitirVentaSinStock = configuracion?.permitirVentaSinStock ?: false
        
        albaran.lineas.forEach { linea ->
            val producto = linea.producto ?: return@forEach
            
            // Determinar el almacén: si es multialmacén, usar el de la línea; si no, el del albarán
            val almacenId = if (albaran.ventaMultialmacen) {
                linea.almacen?.id ?: albaran.almacen?.id
            } else {
                albaran.almacen?.id
            } ?: return@forEach

            val productoAlmacen = productoAlmacenRepository.findByProductoIdAndAlmacenId(producto.id, almacenId)
            if (productoAlmacen != null) {
                val stockActual = productoAlmacen.stock ?: 0
                val nuevoStock = stockActual - linea.cantidad
                
                // Validar si el stock quedaría negativo y no está permitido
                if (nuevoStock < 0 && !permitirVentaSinStock) {
                    throw IllegalStateException(
                        "Stock insuficiente para ${producto.nombre}. " +
                        "Stock disponible: $stockActual, cantidad solicitada: ${linea.cantidad}"
                    )
                }
                
                productoAlmacen.stock = nuevoStock
                productoAlmacenRepository.save(productoAlmacen)
                
                registrarMovimiento(
                    producto = producto,
                    almacen = linea.almacen ?: albaran.almacen,
                    cantidad = -linea.cantidad,
                    stockAnterior = stockActual,
                    stockNuevo = nuevoStock,
                    tipoMovimiento = TipoMovimientoStock.EMISION_ALBARAN,
                    descripcion = "Emisión de albarán ${albaran.numero}",
                    documentoTipo = "ALBARAN",
                    documentoId = albaran.id,
                    documentoNumero = albaran.numero
                )
            }
        }
    }

    private fun restaurarStockLineas(
        lineas: List<AlbaranLinea>,
        ventaMultialmacen: Boolean,
        almacenPrincipal: Almacen?,
        documentoId: Long? = null,
        documentoNumero: String? = null
    ) {
        lineas.forEach { linea ->
            val producto = linea.producto ?: return@forEach
            
            // Determinar el almacén: si es multialmacén, usar el de la línea; si no, el del albarán
            val almacenId = if (ventaMultialmacen) {
                linea.almacen?.id ?: almacenPrincipal?.id
            } else {
                almacenPrincipal?.id
            } ?: return@forEach

            val productoAlmacen = productoAlmacenRepository.findByProductoIdAndAlmacenId(producto.id, almacenId)
            if (productoAlmacen != null) {
                val stockActual = productoAlmacen.stock ?: 0
                val nuevoStock = stockActual + linea.cantidad
                productoAlmacen.stock = nuevoStock
                productoAlmacenRepository.save(productoAlmacen)
                
                registrarMovimiento(
                    producto = producto,
                    almacen = linea.almacen ?: almacenPrincipal,
                    cantidad = linea.cantidad,
                    stockAnterior = stockActual,
                    stockNuevo = nuevoStock,
                    tipoMovimiento = TipoMovimientoStock.REVERSION_ALBARAN,
                    descripcion = "Reversión de albarán (cambio de estado desde Emitido)",
                    documentoTipo = "ALBARAN",
                    documentoId = documentoId,
                    documentoNumero = documentoNumero
                )
            }
        }
    }

    @Transactional
    fun gestionarStockFactura(factura: Factura, operacion: String) {
        val configuracion = configuracionVentasRepository.findTopByOrderByIdAsc()
        val documentoDescuentaStock = configuracion?.documentoDescuentaStock ?: "ALBARAN"

        // Si la factura viene de un albarán:
        // - Cuando ALBARÁN es el que descuenta stock, solo ajustar diferencias
        // - Cuando FACTURA es la que descuenta, procesar normalmente (no retornamos)
        if (factura.albaran != null && documentoDescuentaStock == "ALBARAN") {
            gestionarStockFacturaConDiferencias(factura, operacion)
            return
        }

        // Para facturas que NO provienen de un albarán o cuando FACTURA es el documento que descuenta
        if (documentoDescuentaStock != "FACTURA" && factura.albaran != null) {
            // Configuración distinta y el albarán ya gestionó el stock; no repetir
            return
        }

        val permitirVentaSinStock = configuracion?.permitirVentaSinStock ?: false

        factura.lineas.forEach { linea ->
            val producto = linea.producto ?: return@forEach

            val almacenId = if (factura.ventaMultialmacen) {
                linea.almacen?.id ?: factura.almacen?.id
            } else {
                factura.almacen?.id
            } ?: return@forEach

            val productoAlmacen = productoAlmacenRepository.findByProductoIdAndAlmacenId(producto.id, almacenId)
            if (productoAlmacen != null) {
                val stockActual = productoAlmacen.stock ?: 0
                val nuevoStock = when (operacion) {
                    "DECREMENTAR" -> stockActual - linea.cantidad
                    "INCREMENTAR" -> stockActual + linea.cantidad
                    else -> stockActual
                }

                if (operacion == "DECREMENTAR" && nuevoStock < 0 && !permitirVentaSinStock) {
                    throw IllegalStateException(
                        "Stock insuficiente para ${producto.nombre}. " +
                        "Stock disponible: $stockActual, cantidad solicitada: ${linea.cantidad}"
                    )
                }

                productoAlmacen.stock = nuevoStock
                productoAlmacenRepository.save(productoAlmacen)
                
                val tipoMovimiento = if (operacion == "DECREMENTAR") {
                    TipoMovimientoStock.EMISION_FACTURA
                } else {
                    TipoMovimientoStock.REVERSION_FACTURA
                }
                
                val descripcion = if (operacion == "DECREMENTAR") {
                    "Emisión de factura ${factura.numero}"
                } else {
                    "Reversión de factura ${factura.numero} (cambio de estado desde Emitido)"
                }
                
                registrarMovimiento(
                    producto = producto,
                    almacen = linea.almacen ?: factura.almacen,
                    cantidad = if (operacion == "DECREMENTAR") -linea.cantidad else linea.cantidad,
                    stockAnterior = stockActual,
                    stockNuevo = nuevoStock,
                    tipoMovimiento = tipoMovimiento,
                    descripcion = descripcion,
                    documentoTipo = "FACTURA",
                    documentoId = factura.id,
                    documentoNumero = factura.numero
                )
            }
        }
    }

    @Transactional
    fun gestionarStockFacturaConDiferencias(factura: Factura, operacion: String) {
        val configuracion = configuracionVentasRepository.findTopByOrderByIdAsc()
        val permitirVentaSinStock = configuracion?.permitirVentaSinStock ?: false
        val albaran = factura.albaran ?: return

        // Comparar líneas de factura con líneas de albarán
        factura.lineas.forEach { lineaFactura ->
            val producto = lineaFactura.producto ?: return@forEach

            // Buscar la línea correspondiente en el albarán
            val lineaAlbaran = albaran.lineas.find { it.producto?.id == producto.id }
            val cantidadAlbaran = (lineaAlbaran?.cantidad ?: 0).toDouble()
            val cantidadFactura = lineaFactura.cantidad.toDouble()

            // Calcular la diferencia
            val diferencia: Double = cantidadFactura - cantidadAlbaran

            // Solo gestionar stock si hay diferencia
            if (diferencia != 0.0) {
                val almacenId = if (factura.ventaMultialmacen) {
                    lineaFactura.almacen?.id ?: factura.almacen?.id
                } else {
                    factura.almacen?.id
                } ?: return@forEach

                val productoAlmacen = productoAlmacenRepository.findByProductoIdAndAlmacenId(producto.id, almacenId)
                if (productoAlmacen != null) {
                    val stockActual = (productoAlmacen.stock ?: 0).toDouble()
                    
                    // Si la factura tiene MÁS cantidad que el albarán, descontar la diferencia
                    // Si la factura tiene MENOS cantidad que el albarán, incrementar la diferencia
                    val nuevoStock = when (operacion) {
                        "DECREMENTAR" -> stockActual - diferencia
                        "INCREMENTAR" -> stockActual + diferencia
                        else -> stockActual
                    }

                    if (operacion == "DECREMENTAR" && diferencia > 0 && nuevoStock < 0 && !permitirVentaSinStock) {
                        throw IllegalStateException(
                            "Stock insuficiente para ${producto.nombre}. " +
                            "Stock disponible: $stockActual, diferencia a descontar: $diferencia " +
                            "(Albarán: $cantidadAlbaran, Factura: $cantidadFactura)"
                        )
                    }

                    productoAlmacen.stock = nuevoStock.toInt()
                    productoAlmacenRepository.save(productoAlmacen)
                    
                    val descripcion = if (operacion == "DECREMENTAR") {
                        "Diferencia entre albarán ${albaran.numero} (${cantidadAlbaran.toInt()} uds) y factura ${factura.numero} (${cantidadFactura.toInt()} uds)"
                    } else {
                        "Reversión de diferencia entre albarán ${albaran.numero} y factura ${factura.numero}"
                    }
                    
                    registrarMovimiento(
                        producto = producto,
                        almacen = lineaFactura.almacen ?: factura.almacen,
                        cantidad = if (operacion == "DECREMENTAR") -diferencia.toInt() else diferencia.toInt(),
                        stockAnterior = stockActual.toInt(),
                        stockNuevo = nuevoStock.toInt(),
                        tipoMovimiento = TipoMovimientoStock.DIFERENCIA_ALBARAN_FACTURA,
                        descripcion = descripcion,
                        documentoTipo = "FACTURA",
                        documentoId = factura.id,
                        documentoNumero = factura.numero
                    )
                }
            }
        }
    }

    @Transactional
    fun gestionarStockFacturaRectificativa(facturaRectificativa: FacturaRectificativa, operacion: String) {
        // Las facturas rectificativas siempre incrementan stock cuando se emiten
        // (devuelven mercancía al almacén)
        val permitirVentaSinStock = configuracionVentasRepository.findTopByOrderByIdAsc()?.permitirVentaSinStock ?: false

        facturaRectificativa.lineas.forEach { linea ->
            val producto = linea.producto ?: return@forEach

            val almacenId = if (facturaRectificativa.ventaMultialmacen) {
                linea.almacen?.id ?: facturaRectificativa.almacen?.id
            } else {
                facturaRectificativa.almacen?.id
            } ?: return@forEach

            val productoAlmacen = productoAlmacenRepository.findByProductoIdAndAlmacenId(producto.id, almacenId)
            if (productoAlmacen != null) {
                val stockActual = productoAlmacen.stock ?: 0
                val nuevoStock = when (operacion) {
                    "INCREMENTAR" -> stockActual + linea.cantidad
                    "DECREMENTAR" -> stockActual - linea.cantidad
                    else -> stockActual
                }

                productoAlmacen.stock = nuevoStock
                productoAlmacenRepository.save(productoAlmacen)
                
                val tipoMovimiento = if (operacion == "INCREMENTAR") {
                    TipoMovimientoStock.EMISION_FACTURA_RECTIFICATIVA
                } else {
                    TipoMovimientoStock.REVERSION_FACTURA_RECTIFICATIVA
                }
                
                val descripcion = if (operacion == "INCREMENTAR") {
                    "Emisión de factura rectificativa ${facturaRectificativa.numero} (devolución)"
                } else {
                    "Reversión de factura rectificativa ${facturaRectificativa.numero}"
                }
                
                registrarMovimiento(
                    producto = producto,
                    almacen = linea.almacen ?: facturaRectificativa.almacen,
                    cantidad = if (operacion == "INCREMENTAR") linea.cantidad else -linea.cantidad,
                    stockAnterior = stockActual,
                    stockNuevo = nuevoStock,
                    tipoMovimiento = tipoMovimiento,
                    descripcion = descripcion,
                    documentoTipo = "FACTURA_RECTIFICATIVA",
                    documentoId = facturaRectificativa.id,
                    documentoNumero = facturaRectificativa.numero
                )
            }
        }
    }
    
    @Transactional
    fun ajustarDiferenciasEmitido(factura: Factura, cantidadesAnteriores: Map<Long?, Int>) {
        val configuracion = configuracionVentasRepository.findTopByOrderByIdAsc()
        val permitirVentaSinStock = configuracion?.permitirVentaSinStock ?: false
        
        factura.lineas.forEach { linea ->
            val producto = linea.producto ?: return@forEach
            val cantidadAnterior = cantidadesAnteriores[producto.id] ?: 0
            val cantidadNueva = linea.cantidad
            val diferencia = cantidadNueva - cantidadAnterior
            
            // Solo ajustar si hay diferencia
            if (diferencia != 0) {
                val almacenId = if (factura.ventaMultialmacen) {
                    linea.almacen?.id ?: factura.almacen?.id
                } else {
                    factura.almacen?.id
                } ?: return@forEach
                
                val productoAlmacen = productoAlmacenRepository.findByProductoIdAndAlmacenId(producto.id, almacenId)
                if (productoAlmacen != null) {
                    val stockActual = productoAlmacen.stock ?: 0
                    val nuevoStock = stockActual - diferencia
                    
                    if (nuevoStock < 0 && !permitirVentaSinStock) {
                        throw IllegalStateException(
                            "Stock insuficiente para ${producto.nombre}. " +
                            "Stock disponible: $stockActual, diferencia a ajustar: $diferencia"
                        )
                    }
                    
                    productoAlmacen.stock = nuevoStock
                    productoAlmacenRepository.save(productoAlmacen)
                    
                    val descripcion = if (diferencia > 0) {
                        "Modificación de factura ${factura.numero} en estado Emitido: cantidad aumentada de $cantidadAnterior a $cantidadNueva uds (+$diferencia)"
                    } else {
                        "Modificación de factura ${factura.numero} en estado Emitido: cantidad reducida de $cantidadAnterior a $cantidadNueva uds ($diferencia)"
                    }
                    
                    registrarMovimiento(
                        producto = producto,
                        almacen = linea.almacen ?: factura.almacen,
                        cantidad = -diferencia,
                        stockAnterior = stockActual,
                        stockNuevo = nuevoStock,
                        tipoMovimiento = TipoMovimientoStock.MODIFICACION_EMITIDO,
                        descripcion = descripcion,
                        documentoTipo = "FACTURA",
                        documentoId = factura.id,
                        documentoNumero = factura.numero
                    )
                }
            }
        }
    }
    
    // ==================== GESTIÓN DE STOCK PARA COMPRAS ====================
    // Lógica inversa a ventas: SUMA stock en vez de restar
    
    @Transactional
    fun gestionarStockAlbaranCompra(
        albaranCompraActualizado: AlbaranCompra,
        estadoAnterior: String?,
        lineasAnteriores: List<AlbaranCompraLinea> = emptyList(),
        compraMultialmacenAnterior: Boolean = false,
        almacenAnterior: Almacen? = null
    ) {
        val configuracion = configuracionVentasRepository.findTopByOrderByIdAsc()
        if (configuracion?.documentoDescuentaStock != "ALBARAN") {
            return
        }

        val estadoActual = albaranCompraActualizado.estado
        val eraEmitido = estadoAnterior == "Emitido"
        val esEmitido = estadoActual == "Emitido"

        when {
            // Caso 1: Cambió de NO emitido a Emitido → SUMAR stock (inverso a ventas)
            !eraEmitido && esEmitido -> {
                incrementarStockAlbaranCompra(albaranCompraActualizado)
            }
            // Caso 2: Era Emitido y sigue Emitido → Restaurar stock anterior y sumar el nuevo
            eraEmitido && esEmitido -> {
                restaurarStockLineasAlbaranCompra(lineasAnteriores, compraMultialmacenAnterior, almacenAnterior, albaranCompraActualizado.id, albaranCompraActualizado.numero)
                incrementarStockAlbaranCompra(albaranCompraActualizado)
            }
            // Caso 3: Era Emitido y cambió a otro estado → Restaurar stock (restar lo que se sumó)
            eraEmitido && !esEmitido -> {
                restaurarStockLineasAlbaranCompra(lineasAnteriores, compraMultialmacenAnterior, almacenAnterior, albaranCompraActualizado.id, albaranCompraActualizado.numero)
            }
            // Caso 4: No era Emitido y sigue sin serlo → No hacer nada
            else -> {
                // No hacer nada
            }
        }
    }

    private fun incrementarStockAlbaranCompra(albaranCompra: AlbaranCompra) {
        val configuracion = configuracionVentasRepository.findTopByOrderByIdAsc()
        val permitirCompraSinStock = configuracion?.permitirVentaSinStock ?: false
        
        albaranCompra.lineas.forEach { linea ->
            val producto = linea.producto ?: return@forEach
            
            val almacenId = if (albaranCompra.compraMultialmacen) {
                linea.almacen?.id ?: albaranCompra.almacen?.id
            } else {
                albaranCompra.almacen?.id
            } ?: return@forEach

            val productoAlmacen = productoAlmacenRepository.findByProductoIdAndAlmacenId(producto.id, almacenId)
            if (productoAlmacen != null) {
                val stockActual = productoAlmacen.stock ?: 0
                val nuevoStock = stockActual + linea.cantidad // SUMA en vez de resta
                
                productoAlmacen.stock = nuevoStock
                productoAlmacenRepository.save(productoAlmacen)
                
                registrarMovimiento(
                    producto = producto,
                    almacen = linea.almacen ?: albaranCompra.almacen,
                    cantidad = linea.cantidad, // Positivo
                    stockAnterior = stockActual,
                    stockNuevo = nuevoStock,
                    tipoMovimiento = TipoMovimientoStock.EMISION_ALBARAN_COMPRA,
                    descripcion = "Emisión de albarán de compra ${albaranCompra.numero}",
                    documentoTipo = "ALBARAN_COMPRA",
                    documentoId = albaranCompra.id,
                    documentoNumero = albaranCompra.numero
                )
            }
        }
    }

    private fun restaurarStockLineasAlbaranCompra(
        lineas: List<AlbaranCompraLinea>,
        compraMultialmacen: Boolean,
        almacenPrincipal: Almacen?,
        documentoId: Long? = null,
        documentoNumero: String? = null
    ) {
        lineas.forEach { linea ->
            val producto = linea.producto ?: return@forEach
            
            val almacenId = if (compraMultialmacen) {
                linea.almacen?.id ?: almacenPrincipal?.id
            } else {
                almacenPrincipal?.id
            } ?: return@forEach

            val productoAlmacen = productoAlmacenRepository.findByProductoIdAndAlmacenId(producto.id, almacenId)
            if (productoAlmacen != null) {
                val stockActual = productoAlmacen.stock ?: 0
                val nuevoStock = stockActual - linea.cantidad // RESTA lo que se había sumado
                productoAlmacen.stock = nuevoStock
                productoAlmacenRepository.save(productoAlmacen)
                
                registrarMovimiento(
                    producto = producto,
                    almacen = linea.almacen ?: almacenPrincipal,
                    cantidad = -linea.cantidad, // Negativo
                    stockAnterior = stockActual,
                    stockNuevo = nuevoStock,
                    tipoMovimiento = TipoMovimientoStock.REVERSION_ALBARAN_COMPRA,
                    descripcion = "Reversión de albarán de compra (cambio de estado desde Emitido)",
                    documentoTipo = "ALBARAN_COMPRA",
                    documentoId = documentoId,
                    documentoNumero = documentoNumero
                )
            }
        }
    }

    @Transactional
    fun gestionarStockFacturaCompra(facturaCompra: FacturaCompra, operacion: String) {
        val configuracion = configuracionVentasRepository.findTopByOrderByIdAsc()
        val documentoDescuentaStock = configuracion?.documentoDescuentaStock ?: "ALBARAN"

        // Si la factura viene de un albarán de compra:
        // - Cuando ALBARÁN es el que descuenta stock, solo ajustar diferencias
        // - Cuando FACTURA es la que descuenta, procesar normalmente
        if (facturaCompra.albaranCompra != null && documentoDescuentaStock == "ALBARAN") {
            gestionarStockFacturaCompraConDiferencias(facturaCompra, operacion)
            return
        }

        // Para facturas que NO provienen de un albarán o cuando FACTURA es el documento que descuenta
        if (documentoDescuentaStock != "FACTURA" && facturaCompra.albaranCompra != null) {
            return
        }

        val permitirCompraSinStock = configuracion?.permitirVentaSinStock ?: false

        facturaCompra.lineas.forEach { linea ->
            val producto = linea.producto ?: return@forEach

            val almacenId = if (facturaCompra.compraMultialmacen) {
                linea.almacen?.id ?: facturaCompra.almacen?.id
            } else {
                facturaCompra.almacen?.id
            } ?: return@forEach

            val productoAlmacen = productoAlmacenRepository.findByProductoIdAndAlmacenId(producto.id, almacenId)
            if (productoAlmacen != null) {
                val stockActual = productoAlmacen.stock ?: 0
                val nuevoStock = when (operacion) {
                    "INCREMENTAR" -> stockActual + linea.cantidad // SUMA en compras
                    "DECREMENTAR" -> stockActual - linea.cantidad // RESTA al revertir
                    else -> stockActual
                }

                productoAlmacen.stock = nuevoStock
                productoAlmacenRepository.save(productoAlmacen)
                
                val tipoMovimiento = if (operacion == "INCREMENTAR") {
                    TipoMovimientoStock.EMISION_FACTURA_COMPRA
                } else {
                    TipoMovimientoStock.REVERSION_FACTURA_COMPRA
                }
                
                val descripcion = if (operacion == "INCREMENTAR") {
                    "Emisión de factura de compra ${facturaCompra.numero}"
                } else {
                    "Reversión de factura de compra ${facturaCompra.numero}"
                }
                
                registrarMovimiento(
                    producto = producto,
                    almacen = linea.almacen ?: facturaCompra.almacen,
                    cantidad = if (operacion == "INCREMENTAR") linea.cantidad else -linea.cantidad,
                    stockAnterior = stockActual,
                    stockNuevo = nuevoStock,
                    tipoMovimiento = tipoMovimiento,
                    descripcion = descripcion,
                    documentoTipo = "FACTURA_COMPRA",
                    documentoId = facturaCompra.id,
                    documentoNumero = facturaCompra.numero
                )
            }
        }
    }

    @Transactional
    fun gestionarStockFacturaCompraConDiferencias(facturaCompra: FacturaCompra, operacion: String) {
        val configuracion = configuracionVentasRepository.findTopByOrderByIdAsc()
        val permitirCompraSinStock = configuracion?.permitirVentaSinStock ?: false
        val albaranCompra = facturaCompra.albaranCompra ?: return

        // Comparar líneas de factura con líneas de albarán
        facturaCompra.lineas.forEach { lineaFactura ->
            val producto = lineaFactura.producto ?: return@forEach

            val lineaAlbaran = albaranCompra.lineas.find { it.producto?.id == producto.id }
            val cantidadAlbaran = (lineaAlbaran?.cantidad ?: 0).toDouble()
            val cantidadFactura = lineaFactura.cantidad.toDouble()

            // Calcular la diferencia
            val diferencia: Double = cantidadFactura - cantidadAlbaran

            // Solo gestionar stock si hay diferencia
            if (diferencia != 0.0) {
                val almacenId = if (facturaCompra.compraMultialmacen) {
                    lineaFactura.almacen?.id ?: facturaCompra.almacen?.id
                } else {
                    facturaCompra.almacen?.id
                } ?: return@forEach

                val productoAlmacen = productoAlmacenRepository.findByProductoIdAndAlmacenId(producto.id, almacenId)
                if (productoAlmacen != null) {
                    val stockActual = (productoAlmacen.stock ?: 0).toDouble()
                    
                    // LÓGICA INVERSA A VENTAS:
                    // Si la factura tiene MÁS cantidad que el albarán, SUMAR la diferencia
                    // Si la factura tiene MENOS cantidad que el albarán, RESTAR la diferencia
                    val nuevoStock = when (operacion) {
                        "INCREMENTAR" -> stockActual + diferencia // SUMA diferencia en compras
                        "DECREMENTAR" -> stockActual - diferencia // RESTA al revertir
                        else -> stockActual
                    }

                    productoAlmacen.stock = nuevoStock.toInt()
                    productoAlmacenRepository.save(productoAlmacen)
                    
                    val descripcion = if (operacion == "INCREMENTAR") {
                        "Diferencia entre albarán de compra ${albaranCompra.numero} (${cantidadAlbaran.toInt()} uds) y factura ${facturaCompra.numero} (${cantidadFactura.toInt()} uds)"
                    } else {
                        "Reversión de diferencia entre albarán de compra ${albaranCompra.numero} y factura ${facturaCompra.numero}"
                    }
                    
                    registrarMovimiento(
                        producto = producto,
                        almacen = lineaFactura.almacen ?: facturaCompra.almacen,
                        cantidad = if (operacion == "INCREMENTAR") diferencia.toInt() else -diferencia.toInt(),
                        stockAnterior = stockActual.toInt(),
                        stockNuevo = nuevoStock.toInt(),
                        tipoMovimiento = TipoMovimientoStock.DIFERENCIA_ALBARAN_FACTURA_COMPRA,
                        descripcion = descripcion,
                        documentoTipo = "FACTURA_COMPRA",
                        documentoId = facturaCompra.id,
                        documentoNumero = facturaCompra.numero
                    )
                }
            }
        }
    }
    
    private fun registrarMovimiento(
        producto: com.example.demo.model.Producto,
        almacen: Almacen?,
        cantidad: Int,
        stockAnterior: Int,
        stockNuevo: Int,
        tipoMovimiento: String,
        descripcion: String,
        documentoTipo: String?,
        documentoId: Long?,
        documentoNumero: String?,
        usuarioId: Long? = null
    ) {
        if (almacen == null) return
        
        val movimiento = MovimientoStock(
            fecha = LocalDateTime.now(),
            producto = producto,
            almacen = almacen,
            cantidad = cantidad,
            stockAnterior = stockAnterior,
            stockNuevo = stockNuevo,
            tipoMovimiento = tipoMovimiento,
            descripcion = descripcion,
            documentoTipo = documentoTipo,
            documentoId = documentoId,
            documentoNumero = documentoNumero,
            usuarioId = usuarioId,
            createdAt = LocalDateTime.now()
        )
        
        movimientoStockRepository.save(movimiento)
    }
}
