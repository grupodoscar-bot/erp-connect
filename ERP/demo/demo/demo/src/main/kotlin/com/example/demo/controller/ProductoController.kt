package com.example.demo.controller

import com.example.demo.dto.*
import com.example.demo.model.Producto
import com.example.demo.model.ProductoAlmacen
import com.example.demo.model.ProductoReferencia
import com.example.demo.model.ProductoCodigoBarra
import com.example.demo.repository.*
import com.example.demo.service.CodigoBarraValidatorService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.*
import java.time.LocalDateTime

@RestController
@RequestMapping("/productos")
@CrossOrigin(origins = ["http://145.223.103.219:3000", "http://145.223.103.219:3000"])
class ProductoController(
    private val productoRepository: ProductoRepository,
    private val familiaRepository: FamiliaRepository,
    private val subfamiliaRepository: SubfamiliaRepository,
    private val fabricanteRepository: FabricanteRepository,
    private val tipoIvaRepository: TipoIvaRepository,
    private val almacenRepository: AlmacenRepository,
    private val productoAlmacenRepository: ProductoAlmacenRepository,
    private val tarifaRepository: TarifaRepository,
    private val tarifaProductoRepository: TarifaProductoRepository,
    private val productoReferenciaRepository: ProductoReferenciaRepository,
    private val codigoBarraRepository: CodigoBarraRepository,
    private val productoCodigoBarraRepository: ProductoCodigoBarraRepository,
    private val codigoBarraCampoRepository: CodigoBarraCampoRepository,
    private val codigoBarraValidatorService: CodigoBarraValidatorService
) {

    @GetMapping
    fun listarTodos(): List<ProductoConStockDTO> {
        val productos = productoRepository.findAll()
        return productos.map { producto ->
            try {
                val stockPorAlmacen = productoAlmacenRepository.findByProductoId(producto.id)
                    .mapNotNull { pa ->
                        try {
                            // Safely access almacen properties
                            val almacen = pa.almacen
                            if (almacen != null) {
                                StockAlmacenDTO(
                                    almacenId = almacen.id,
                                    almacenNombre = almacen.nombre,
                                    stock = pa.stock,
                                    stockMinimo = pa.stockMinimo,
                                    stockMaximo = pa.stockMaximo,
                                    ubicacion = pa.ubicacion
                                )
                            } else {
                                null
                            }
                        } catch (e: Exception) {
                            println("Error loading almacen for producto ${producto.id}: ${e.message}")
                            null
                        }
                    }
                
                val stockTotal = stockPorAlmacen.sumOf { it.stock }
                
                val referencias = productoReferenciaRepository.findByProductoId(producto.id)
                    .map { ProductoReferenciaDTO(it.id, it.referencia, it.esPrincipal, it.orden) }
                    .sortedBy { it.orden }
                
                val codigosBarras = productoCodigoBarraRepository.findByProductoIdAndActivo(producto.id, true)
                    .map { codigo ->
                        ProductoCodigoBarraDTO(
                            id = codigo.id,
                            productoId = producto.id,
                            codigoBarraTipoId = codigo.codigoBarraTipo?.id ?: 0,
                            codigoBarraTipoNombre = codigo.codigoBarraTipo?.nombre ?: "",
                            codigoBarraTipo = codigo.codigoBarraTipo?.tipo,
                            valor = codigo.valor,
                            patron = codigo.patron,
                            esPrincipal = codigo.esPrincipal,
                            origen = codigo.origen,
                            activo = codigo.activo,
                            notas = codigo.notas,
                            validacionOmitida = codigo.validacionOmitida,
                            createdAt = codigo.createdAt,
                            createdBy = codigo.createdBy,
                            updatedAt = codigo.updatedAt
                        )
                    }
                
                ProductoConStockDTO(
                    id = producto.id,
                    referencia = producto.referencia,
                    titulo = producto.titulo,
                    nombre = producto.nombre,
                    precio = producto.precio,
                    stock = stockTotal,
                    etiquetas = producto.etiquetas,
                    descripcionCorta = producto.descripcionCorta,
                    notas = producto.notas,
                    fabricante = producto.fabricante?.let { 
                        FabricanteSimpleDTO(it.id, it.nombreComercial) 
                    },
                    almacenPredeterminado = producto.almacenPredeterminado?.let {
                        AlmacenSimpleDTO(it.id, it.nombre)
                    },
                    peso = producto.peso,
                    unidadMedida = producto.unidadMedida,
                    unidadMedidaReferencia = producto.unidadMedidaReferencia,
                    magnitudPorUnidad = producto.magnitudPorUnidad,
                    ultimoCoste = producto.ultimoCoste,
                    descuento = producto.descuento,
                    precioBloqueado = producto.precioBloqueado,
                    margen = producto.margen,
                    precioConImpuestos = producto.precioConImpuestos,
                    tipoIva = producto.tipoIva?.let { 
                        TipoIvaSimpleDTO(it.id, it.nombre, it.porcentajeIva) 
                    },
                    imagen = producto.imagen,
                    familias = producto.familias.map { 
                        FamiliaSimpleDTO(it.id, it.nombre, it.colorTPV, it.imagen) 
                    }.toSet(),
                    subfamilias = producto.subfamilias.map { 
                        SubfamiliaSimpleDTO(it.id, it.nombre, it.familia?.id) 
                    }.toSet(),
                    stockPorAlmacen = stockPorAlmacen,
                    referencias = referencias,
                    codigosBarras = codigosBarras
                )
            } catch (e: Exception) {
                println("Error loading producto ${producto.id}: ${e.message}")
                e.printStackTrace()
                // Return product with basic info if there's an error
                ProductoConStockDTO(
                    id = producto.id,
                    referencia = producto.referencia,
                    titulo = producto.titulo,
                    nombre = producto.nombre,
                    precio = producto.precio,
                    stock = 0,
                    etiquetas = producto.etiquetas,
                    descripcionCorta = producto.descripcionCorta,
                    notas = producto.notas,
                    fabricante = null,
                    almacenPredeterminado = null,
                    peso = producto.peso,
                    unidadMedida = producto.unidadMedida,
                    unidadMedidaReferencia = producto.unidadMedidaReferencia,
                    magnitudPorUnidad = producto.magnitudPorUnidad,
                    ultimoCoste = producto.ultimoCoste,
                    descuento = producto.descuento,
                    precioBloqueado = producto.precioBloqueado,
                    margen = producto.margen,
                    precioConImpuestos = producto.precioConImpuestos,
                    tipoIva = null,
                    imagen = producto.imagen,
                    familias = emptySet(),
                    subfamilias = emptySet(),
                    stockPorAlmacen = emptyList()
                )
            }
        }
    }

    @GetMapping("/{id}")
    fun obtenerPorId(@PathVariable id: Long): ResponseEntity<ProductoConStockDTO> {
        val producto = productoRepository.findById(id).orElse(null)
            ?: return ResponseEntity.notFound().build()
        
        val stockPorAlmacen = productoAlmacenRepository.findByProductoId(producto.id)
            .mapNotNull { pa ->
                try {
                    val almacen = pa.almacen
                    if (almacen != null) {
                        StockAlmacenDTO(
                            almacenId = almacen.id,
                            almacenNombre = almacen.nombre,
                            stock = pa.stock,
                            stockMinimo = pa.stockMinimo,
                            stockMaximo = pa.stockMaximo,
                            ubicacion = pa.ubicacion
                        )
                    } else {
                        null
                    }
                } catch (e: Exception) {
                    println("Error loading almacen for producto ${producto.id}: ${e.message}")
                    null
                }
            }
        val stockTotal = stockPorAlmacen.sumOf { it.stock }
        
        val dto = ProductoConStockDTO(
            id = producto.id,
            referencia = producto.referencia,
            titulo = producto.titulo,
            nombre = producto.nombre,
            precio = producto.precio,
            stock = stockTotal,
            etiquetas = producto.etiquetas,
            descripcionCorta = producto.descripcionCorta,
            notas = producto.notas,
            fabricante = producto.fabricante?.let { 
                FabricanteSimpleDTO(it.id, it.nombreComercial) 
            },
            almacenPredeterminado = producto.almacenPredeterminado?.let {
                AlmacenSimpleDTO(it.id, it.nombre)
            },
            peso = producto.peso,
            unidadMedida = producto.unidadMedida,
            unidadMedidaReferencia = producto.unidadMedidaReferencia,
            magnitudPorUnidad = producto.magnitudPorUnidad,
            ultimoCoste = producto.ultimoCoste,
            descuento = producto.descuento,
            precioBloqueado = producto.precioBloqueado,
            margen = producto.margen,
            precioConImpuestos = producto.precioConImpuestos,
            tipoIva = producto.tipoIva?.let { 
                TipoIvaSimpleDTO(it.id, it.nombre, it.porcentajeIva) 
            },
            imagen = producto.imagen,
            familias = producto.familias.map { 
                FamiliaSimpleDTO(it.id, it.nombre, it.colorTPV, it.imagen) 
            }.toSet(),
            subfamilias = producto.subfamilias.map { 
                SubfamiliaSimpleDTO(it.id, it.nombre, it.familia?.id) 
            }.toSet(),
            stockPorAlmacen = stockPorAlmacen
        )
        
        return ResponseEntity.ok(dto)
    }

    @PostMapping
    fun crear(@RequestBody request: ProductoRequest): ResponseEntity<ProductoConStockDTO> {
        val familias = request.familiaIds
            .mapNotNull { familiaRepository.findById(it).orElse(null) }
            .toSet()
        val subfamilias = request.subfamiliaIds
            .mapNotNull { subfamiliaRepository.findById(it).orElse(null) }
            .toSet()
        val fabricante = request.fabricanteId?.let { fabricanteRepository.findById(it).orElse(null) }
        val tipoIva = request.tipoIvaId?.let { tipoIvaRepository.findById(it).orElse(null) }
        val almacenPredeterminado = request.almacenPredeterminadoId?.let { almacenRepository.findById(it).orElse(null) }
        
        val nuevo = Producto(
            referencia = request.referencia,
            titulo = request.titulo,
            nombre = request.nombre,
            precio = request.precio,
            etiquetas = request.etiquetas,
            descripcionCorta = request.descripcionCorta,
            notas = request.notas,
            fabricante = fabricante,
            almacenPredeterminado = almacenPredeterminado,
            peso = request.peso,
            unidadMedida = request.unidadMedida,
            unidadMedidaReferencia = request.unidadMedidaReferencia,
            magnitudPorUnidad = request.magnitudPorUnidad,
            ultimoCoste = request.ultimoCoste,
            descuento = request.descuento,
            precioBloqueado = request.precioBloqueado,
            margen = request.margen,
            precioConImpuestos = request.precioConImpuestos,
            tipoIva = tipoIva,
            imagen = request.imagen,
            familias = familias,
            subfamilias = subfamilias
        )
        val productoGuardado = productoRepository.save(nuevo)
        
        val stockPorAlmacenList = mutableListOf<StockAlmacenDTO>()
        
        // Create warehouse stock entries if provided
        if (request.stockPorAlmacen != null && request.stockPorAlmacen.isNotEmpty()) {
            request.stockPorAlmacen.forEach { stockData ->
                val almacen = almacenRepository.findById(stockData.almacenId).orElse(null)
                if (almacen != null) {
                    val productoAlmacen = ProductoAlmacen(
                        producto = productoGuardado,
                        almacen = almacen,
                        stock = stockData.stock,
                        stockMinimo = stockData.stockMinimo ?: 0,
                        stockMaximo = stockData.stockMaximo,
                        ubicacion = stockData.ubicacion
                    )
                    productoAlmacenRepository.save(productoAlmacen)
                    stockPorAlmacenList.add(StockAlmacenDTO(
                        almacenId = almacen.id,
                        almacenNombre = almacen.nombre,
                        stock = stockData.stock,
                        stockMinimo = stockData.stockMinimo,
                        stockMaximo = stockData.stockMaximo,
                        ubicacion = stockData.ubicacion
                    ))
                }
            }
        } else {
            // If no warehouse stock provided, create entry in default warehouse with stock = 0
            val almacenes = almacenRepository.findByActivoTrue()
            if (almacenes.isNotEmpty()) {
                val almacenPrincipal = almacenes.first()
                val productoAlmacen = ProductoAlmacen(
                    producto = productoGuardado,
                    almacen = almacenPrincipal,
                    stock = 0,
                    stockMinimo = 0
                )
                productoAlmacenRepository.save(productoAlmacen)
                stockPorAlmacenList.add(StockAlmacenDTO(
                    almacenId = almacenPrincipal.id,
                    almacenNombre = almacenPrincipal.nombre,
                    stock = 0,
                    stockMinimo = 0,
                    stockMaximo = null,
                    ubicacion = null
                ))
            }
        }

        val stockTotal = stockPorAlmacenList.sumOf { it.stock }
        
        val dto = ProductoConStockDTO(
            id = productoGuardado.id,
            referencia = productoGuardado.referencia,
            titulo = productoGuardado.titulo,
            nombre = productoGuardado.nombre,
            precio = productoGuardado.precio,
            stock = stockTotal,
            etiquetas = productoGuardado.etiquetas,
            descripcionCorta = productoGuardado.descripcionCorta,
            notas = productoGuardado.notas,
            fabricante = productoGuardado.fabricante?.let { 
                FabricanteSimpleDTO(it.id, it.nombreComercial) 
            },
            almacenPredeterminado = productoGuardado.almacenPredeterminado?.let {
                AlmacenSimpleDTO(it.id, it.nombre)
            },
            peso = productoGuardado.peso,
            unidadMedida = productoGuardado.unidadMedida,
            unidadMedidaReferencia = productoGuardado.unidadMedidaReferencia,
            magnitudPorUnidad = productoGuardado.magnitudPorUnidad,
            ultimoCoste = productoGuardado.ultimoCoste,
            descuento = productoGuardado.descuento,
            precioBloqueado = productoGuardado.precioBloqueado,
            margen = productoGuardado.margen,
            precioConImpuestos = productoGuardado.precioConImpuestos,
            tipoIva = productoGuardado.tipoIva?.let { 
                TipoIvaSimpleDTO(it.id, it.nombre, it.porcentajeIva) 
            },
            imagen = productoGuardado.imagen,
            familias = productoGuardado.familias.map { 
                FamiliaSimpleDTO(it.id, it.nombre, it.colorTPV, it.imagen) 
            }.toSet(),
            subfamilias = productoGuardado.subfamilias.map { 
                SubfamiliaSimpleDTO(it.id, it.nombre, it.familia?.id) 
            }.toSet(),
            stockPorAlmacen = stockPorAlmacenList
        )
        
        return ResponseEntity.ok(dto)
    }

    @PutMapping("/{id}")
    fun actualizar(
        @PathVariable id: Long,
        @RequestBody datos: ProductoRequest
    ): ResponseEntity<ProductoConStockDTO> {
        return productoRepository.findById(id)
            .map { existente ->
                val familias = datos.familiaIds
                    .mapNotNull { familiaRepository.findById(it).orElse(null) }
                    .toSet()
                val subfamilias = datos.subfamiliaIds
                    .mapNotNull { subfamiliaRepository.findById(it).orElse(null) }
                    .toSet()
                val fabricante = datos.fabricanteId?.let { fabricanteRepository.findById(it).orElse(null) }
                val tipoIva = datos.tipoIvaId?.let { tipoIvaRepository.findById(it).orElse(null) }
                val almacenPredeterminado = datos.almacenPredeterminadoId?.let { almacenRepository.findById(it).orElse(null) }
                val actualizado = existente.copy(
                    referencia = datos.referencia,
                    titulo = datos.titulo,
                    nombre = datos.nombre,
                    precio = datos.precio,
                    etiquetas = datos.etiquetas,
                    descripcionCorta = datos.descripcionCorta,
                    notas = datos.notas,
                    fabricante = fabricante,
                    almacenPredeterminado = almacenPredeterminado,
                    peso = datos.peso,
                    unidadMedida = datos.unidadMedida,
                    unidadMedidaReferencia = datos.unidadMedidaReferencia,
                    magnitudPorUnidad = datos.magnitudPorUnidad,
                    ultimoCoste = datos.ultimoCoste,
                    descuento = datos.descuento,
                    precioBloqueado = datos.precioBloqueado,
                    margen = datos.margen,
                    precioConImpuestos = datos.precioConImpuestos,
                    tipoIva = tipoIva,
                    imagen = datos.imagen ?: existente.imagen,
                    familias = familias,
                    subfamilias = subfamilias
                )
                val productoGuardado = productoRepository.save(actualizado)
                
                val stockPorAlmacenList = mutableListOf<StockAlmacenDTO>()
                
                // Update warehouse stock if provided
                if (datos.stockPorAlmacen != null && datos.stockPorAlmacen.isNotEmpty()) {
                    datos.stockPorAlmacen.forEach { stockData ->
                        val existingStock = productoAlmacenRepository.findByProductoIdAndAlmacenId(
                            productoGuardado.id,
                            stockData.almacenId
                        )
                        
                        if (existingStock != null) {
                            val updated = existingStock.copy(
                                stock = stockData.stock,
                                stockMinimo = stockData.stockMinimo ?: existingStock.stockMinimo,
                                stockMaximo = stockData.stockMaximo,
                                ubicacion = stockData.ubicacion ?: existingStock.ubicacion,
                                createdAt = existingStock.createdAt ?: LocalDateTime.now(),
                                updatedAt = LocalDateTime.now()
                            )
                            productoAlmacenRepository.save(updated)
                            updated.almacen?.let { almacen ->
                                stockPorAlmacenList.add(StockAlmacenDTO(
                                    almacenId = almacen.id,
                                    almacenNombre = almacen.nombre,
                                    stock = updated.stock,
                                    stockMinimo = updated.stockMinimo,
                                    stockMaximo = updated.stockMaximo,
                                    ubicacion = updated.ubicacion
                                ))
                            }
                        } else {
                            val almacen = almacenRepository.findById(stockData.almacenId).orElse(null)
                            if (almacen != null) {
                                val nuevo = ProductoAlmacen(
                                    producto = productoGuardado,
                                    almacen = almacen,
                                    stock = stockData.stock,
                                    stockMinimo = stockData.stockMinimo ?: 0,
                                    stockMaximo = stockData.stockMaximo,
                                    ubicacion = stockData.ubicacion
                                )
                                productoAlmacenRepository.save(nuevo)
                                stockPorAlmacenList.add(StockAlmacenDTO(
                                    almacenId = almacen.id,
                                    almacenNombre = almacen.nombre,
                                    stock = stockData.stock,
                                    stockMinimo = stockData.stockMinimo,
                                    stockMaximo = stockData.stockMaximo,
                                    ubicacion = stockData.ubicacion
                                ))
                            }
                        }
                    }
                }

                // If not provided, return current stock records
                if (stockPorAlmacenList.isEmpty()) {
                    productoAlmacenRepository.findByProductoId(productoGuardado.id).forEach { pa ->
                        pa.almacen?.let { almacen ->
                            stockPorAlmacenList.add(StockAlmacenDTO(
                                almacenId = almacen.id,
                                almacenNombre = almacen.nombre,
                                stock = pa.stock,
                                stockMinimo = pa.stockMinimo,
                                stockMaximo = pa.stockMaximo,
                                ubicacion = pa.ubicacion
                            ))
                        }
                    }
                }

                val stockTotal = stockPorAlmacenList.sumOf { it.stock }
                
                val dto = ProductoConStockDTO(
                    id = productoGuardado.id,
                    referencia = productoGuardado.referencia,
                    titulo = productoGuardado.titulo,
                    nombre = productoGuardado.nombre,
                    precio = productoGuardado.precio,
                    stock = stockTotal,
                    etiquetas = productoGuardado.etiquetas,
                    descripcionCorta = productoGuardado.descripcionCorta,
                    notas = productoGuardado.notas,
                    fabricante = productoGuardado.fabricante?.let { 
                        FabricanteSimpleDTO(it.id, it.nombreComercial) 
                    },
                    almacenPredeterminado = productoGuardado.almacenPredeterminado?.let {
                        AlmacenSimpleDTO(it.id, it.nombre)
                    },
                    peso = productoGuardado.peso,
                    unidadMedida = productoGuardado.unidadMedida,
                    unidadMedidaReferencia = productoGuardado.unidadMedidaReferencia,
                    magnitudPorUnidad = productoGuardado.magnitudPorUnidad,
                    ultimoCoste = productoGuardado.ultimoCoste,
                    descuento = productoGuardado.descuento,
                    precioBloqueado = productoGuardado.precioBloqueado,
                    margen = productoGuardado.margen,
                    precioConImpuestos = productoGuardado.precioConImpuestos,
                    tipoIva = productoGuardado.tipoIva?.let { 
                        TipoIvaSimpleDTO(it.id, it.nombre, it.porcentajeIva) 
                    },
                    imagen = productoGuardado.imagen,
                    familias = productoGuardado.familias.map { 
                        FamiliaSimpleDTO(it.id, it.nombre, it.colorTPV, it.imagen) 
                    }.toSet(),
                    subfamilias = productoGuardado.subfamilias.map { 
                        SubfamiliaSimpleDTO(it.id, it.nombre, it.familia?.id) 
                    }.toSet(),
                    stockPorAlmacen = stockPorAlmacenList
                )
                
                ResponseEntity.ok(dto)
            }
            .orElse(ResponseEntity.notFound().build())
    }

    @DeleteMapping("/{id}")
    fun borrar(@PathVariable id: Long): ResponseEntity<Void> {
        return if (productoRepository.existsById(id)) {
            productoRepository.deleteById(id)
            ResponseEntity.noContent().build()
        } else {
            ResponseEntity.notFound().build()
        }
    }

    @GetMapping("/{productoId}/stock/{almacenId}")
    fun obtenerStock(
        @PathVariable productoId: Long,
        @PathVariable almacenId: Long
    ): ResponseEntity<Map<String, Any>> {
        val productoAlmacen = productoAlmacenRepository.findByProductoIdAndAlmacenId(productoId, almacenId)
        return if (productoAlmacen != null) {
            ResponseEntity.ok(mapOf(
                "productoId" to productoId,
                "almacenId" to almacenId,
                "stock" to (productoAlmacen.stock ?: 0)
            ))
        } else {
            ResponseEntity.ok(mapOf(
                "productoId" to productoId,
                "almacenId" to almacenId,
                "stock" to 0
            ))
        }
    }

    // ========== ENDPOINTS PARA PRECIOS POR TARIFA ==========
    
    @GetMapping("/{id}/precios-tarifa")
    fun obtenerPreciosPorTarifa(@PathVariable id: Long): ResponseEntity<List<Map<String, Any?>>> {
        val producto = productoRepository.findById(id).orElse(null)
            ?: return ResponseEntity.notFound().build()
        
        val preciosTarifa = tarifaProductoRepository.findByProductoId(id)
        
        return ResponseEntity.ok(preciosTarifa.map { tp ->
            mapOf(
                "tarifaId" to tp.tarifa?.id,
                "precio" to tp.precio,
                "descuento" to tp.descuento,
                "margen" to tp.margen,
                "precioCompra" to tp.precioCompra,
                "descuentoCompra" to tp.descuentoCompra,
                "tipoCalculoPrecioCompra" to tp.tipoCalculoPrecioCompra,
                "valorCalculoCompra" to tp.valorCalculoCompra
            )
        })
    }
    
    @PostMapping("/{id}/precios-tarifa")
    @Transactional
    fun guardarPreciosPorTarifa(
        @PathVariable id: Long,
        @RequestBody precios: List<PrecioTarifaRequest>
    ): ResponseEntity<String> {
        val producto = productoRepository.findById(id).orElse(null)
            ?: return ResponseEntity.notFound().build()
        
        // Obtener precios existentes
        val preciosExistentes = tarifaProductoRepository.findByProductoId(id)
        
        // Actualizar o crear precios
        precios.forEach { precioReq ->
            val tarifa = tarifaRepository.findById(precioReq.tarifaId).orElse(null)
            if (tarifa != null) {
                // Buscar si ya existe un precio para esta tarifa
                val existente = preciosExistentes.find { it.tarifa?.id == precioReq.tarifaId }
                
                if (existente != null) {
                    // Actualizar existente - mantener precios de venta y actualizar compra si se proporcionan
                    val actualizado = existente.copy(
                        precio = precioReq.precio ?: existente.precio,
                        descuento = precioReq.descuento ?: existente.descuento,
                        margen = precioReq.margen ?: existente.margen,
                        precioCompra = precioReq.precioCompra ?: existente.precioCompra,
                        descuentoCompra = precioReq.descuentoCompra ?: existente.descuentoCompra,
                        tipoCalculoPrecioCompra = precioReq.tipoCalculoPrecioCompra ?: existente.tipoCalculoPrecioCompra,
                        valorCalculoCompra = precioReq.valorCalculoCompra ?: existente.valorCalculoCompra,
                        updatedAt = LocalDateTime.now()
                    )
                    tarifaProductoRepository.save(actualizado)
                } else {
                    // Crear nuevo
                    val nuevo = com.example.demo.model.TarifaProducto(
                        tarifa = tarifa,
                        producto = producto,
                        precio = precioReq.precio ?: 0.0,
                        descuento = precioReq.descuento ?: 0.0,
                        margen = precioReq.margen ?: 0.0,
                        precioCompra = precioReq.precioCompra,
                        descuentoCompra = precioReq.descuentoCompra,
                        tipoCalculoPrecioCompra = precioReq.tipoCalculoPrecioCompra,
                        valorCalculoCompra = precioReq.valorCalculoCompra,
                        createdAt = LocalDateTime.now(),
                        updatedAt = LocalDateTime.now()
                    )
                    tarifaProductoRepository.save(nuevo)
                }
            }
        }
        
        return ResponseEntity.ok("Precios por tarifa guardados correctamente")
    }

    // ========== ENDPOINTS PARA REFERENCIAS ALTERNATIVAS ==========
    
    @GetMapping("/{id}/referencias")
    fun obtenerReferencias(@PathVariable id: Long): ResponseEntity<List<ProductoReferenciaDTO>> {
        val producto = productoRepository.findById(id).orElse(null)
            ?: return ResponseEntity.notFound().build()
        
        val referencias = productoReferenciaRepository.findByProductoId(id)
            .map { ProductoReferenciaDTO(it.id, it.referencia, it.esPrincipal, it.orden) }
            .sortedBy { it.orden }
        
        return ResponseEntity.ok(referencias)
    }
    
    @PostMapping("/{id}/referencias")
    @Transactional
    fun agregarReferencia(
        @PathVariable id: Long,
        @RequestBody request: AgregarReferenciaRequest
    ): ResponseEntity<Any> {
        val producto = productoRepository.findById(id).orElse(null)
            ?: return ResponseEntity.notFound().build()
        
        // Validar que la referencia no exista ya (ni como principal ni como alternativa)
        if (productoRepository.existsByReferencia(request.referencia)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(mapOf("error" to "La referencia '${request.referencia}' ya existe como referencia principal de otro producto"))
        }
        
        if (productoReferenciaRepository.existsByReferencia(request.referencia)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(mapOf("error" to "La referencia '${request.referencia}' ya existe como referencia alternativa de otro producto"))
        }
        
        // Obtener el siguiente orden
        val maxOrden = productoReferenciaRepository.findByProductoId(id)
            .maxOfOrNull { it.orden } ?: 0
        
        val nuevaReferencia = ProductoReferencia(
            producto = producto,
            referencia = request.referencia,
            esPrincipal = false,
            orden = maxOrden + 1
        )
        
        val guardada = productoReferenciaRepository.save(nuevaReferencia)
        
        return ResponseEntity.ok(ProductoReferenciaDTO(
            guardada.id,
            guardada.referencia,
            guardada.esPrincipal,
            guardada.orden
        ))
    }
    
    @DeleteMapping("/referencias/{referenciaId}")
    @Transactional
    fun eliminarReferencia(@PathVariable referenciaId: Long): ResponseEntity<Void> {
        val referencia = productoReferenciaRepository.findById(referenciaId).orElse(null)
            ?: return ResponseEntity.notFound().build()
        
        // No permitir eliminar referencia principal
        if (referencia.esPrincipal) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build()
        }
        
        productoReferenciaRepository.deleteById(referenciaId)
        return ResponseEntity.noContent().build()
    }
    
    @GetMapping("/buscar-por-referencia/{referencia}")
    fun buscarPorReferencia(@PathVariable referencia: String): ResponseEntity<ProductoConStockDTO> {
        // Buscar primero en referencias principales
        var producto = productoRepository.findByReferencia(referencia)
        
        // Si no se encuentra, buscar en referencias alternativas
        if (producto == null) {
            val referenciaAlternativa = productoReferenciaRepository.findByReferencia(referencia)
            producto = referenciaAlternativa?.producto
        }
        
        if (producto == null) {
            return ResponseEntity.notFound().build()
        }
        
        // Construir DTO completo
        val stockPorAlmacen = productoAlmacenRepository.findByProductoId(producto.id)
            .mapNotNull { pa ->
                pa.almacen?.let { almacen ->
                    StockAlmacenDTO(
                        almacenId = almacen.id,
                        almacenNombre = almacen.nombre,
                        stock = pa.stock,
                        stockMinimo = pa.stockMinimo,
                        stockMaximo = pa.stockMaximo,
                        ubicacion = pa.ubicacion
                    )
                }
            }
        
        val stockTotal = stockPorAlmacen.sumOf { it.stock }
        
        val referencias = productoReferenciaRepository.findByProductoId(producto.id)
            .map { ProductoReferenciaDTO(it.id, it.referencia, it.esPrincipal, it.orden) }
            .sortedBy { it.orden }
        
        val dto = ProductoConStockDTO(
            id = producto.id,
            referencia = producto.referencia,
            titulo = producto.titulo,
            nombre = producto.nombre,
            precio = producto.precio,
            stock = stockTotal,
            etiquetas = producto.etiquetas,
            descripcionCorta = producto.descripcionCorta,
            notas = producto.notas,
            fabricante = producto.fabricante?.let { 
                FabricanteSimpleDTO(it.id, it.nombreComercial) 
            },
            almacenPredeterminado = producto.almacenPredeterminado?.let {
                AlmacenSimpleDTO(it.id, it.nombre)
            },
            peso = producto.peso,
            unidadMedida = producto.unidadMedida,
            unidadMedidaReferencia = producto.unidadMedidaReferencia,
            magnitudPorUnidad = producto.magnitudPorUnidad,
            ultimoCoste = producto.ultimoCoste,
            descuento = producto.descuento,
            precioBloqueado = producto.precioBloqueado,
            margen = producto.margen,
            precioConImpuestos = producto.precioConImpuestos,
            tipoIva = producto.tipoIva?.let { 
                TipoIvaSimpleDTO(it.id, it.nombre, it.porcentajeIva) 
            },
            imagen = producto.imagen,
            familias = producto.familias.map { 
                FamiliaSimpleDTO(it.id, it.nombre, it.colorTPV, it.imagen) 
            }.toSet(),
            subfamilias = producto.subfamilias.map { 
                SubfamiliaSimpleDTO(it.id, it.nombre, it.familia?.id) 
            }.toSet(),
            stockPorAlmacen = stockPorAlmacen,
            referencias = referencias
        )
        
        return ResponseEntity.ok(dto)
    }

    // ==================== ENDPOINTS DE CÓDIGOS DE BARRAS ====================

    /**
     * Listar todos los códigos de barras de un producto
     */
    @GetMapping("/{id}/codigos-barras")
    fun listarCodigosBarras(
        @PathVariable id: Long,
        @RequestParam(required = false) activo: Boolean?
    ): ResponseEntity<List<ProductoCodigoBarraDTO>> {
        val producto = productoRepository.findById(id).orElse(null)
            ?: return ResponseEntity.notFound().build()

        val codigos = if (activo != null) {
            productoCodigoBarraRepository.findByProductoIdAndActivo(id, activo)
        } else {
            productoCodigoBarraRepository.findByProductoId(id)
        }

        val dtos = codigos.map { codigo ->
            ProductoCodigoBarraDTO(
                id = codigo.id,
                productoId = id,
                codigoBarraTipoId = codigo.codigoBarraTipo?.id ?: 0,
                codigoBarraTipoNombre = codigo.codigoBarraTipo?.nombre ?: "",
                codigoBarraTipo = codigo.codigoBarraTipo?.tipo,
                valor = codigo.valor,
                patron = codigo.patron,
                esPrincipal = codigo.esPrincipal,
                origen = codigo.origen,
                activo = codigo.activo,
                notas = codigo.notas,
                validacionOmitida = codigo.validacionOmitida,
                createdAt = codigo.createdAt,
                createdBy = codigo.createdBy,
                updatedAt = codigo.updatedAt
            )
        }

        return ResponseEntity.ok(dtos)
    }

    /**
     * Agregar un código de barras a un producto
     */
    @PostMapping("/{id}/codigos-barras")
    @Transactional
    fun agregarCodigoBarra(
        @PathVariable id: Long,
        @RequestBody request: CrearProductoCodigoBarraRequest
    ): ResponseEntity<Any> {
        val producto = productoRepository.findById(id).orElse(null)
            ?: return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(mapOf("error" to "Producto no encontrado"))

        val codigoBarraTipo = codigoBarraRepository.findById(request.codigoBarraTipoId).orElse(null)
            ?: return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(mapOf("error" to "Tipo de código de barras no encontrado"))

        // Validar que el código no exista ya
        if (productoCodigoBarraRepository.existsByValor(request.valor)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(mapOf("error" to "Este código de barras ya está asignado a otro producto"))
        }

        // Validar formato del código según su tipo
        val tipoCodigo = codigoBarraTipo.tipo
        if (!request.validacionOmitida && tipoCodigo != null && !codigoBarraValidatorService.validarCodigo(request.valor, tipoCodigo)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(mapOf("error" to "El código no es válido para el formato $tipoCodigo"))
        }

        // Si se marca como principal, desmarcar el anterior
        if (request.esPrincipal) {
            val principalActual = productoCodigoBarraRepository.findPrincipalByProductoId(id)
            if (principalActual != null) {
                val actualizado = principalActual.copy(esPrincipal = false)
                productoCodigoBarraRepository.save(actualizado)
            }
        }

        val nuevoCodigo = ProductoCodigoBarra(
            producto = producto,
            codigoBarraTipo = codigoBarraTipo,
            valor = request.valor,
            patron = request.patron,
            esPrincipal = request.esPrincipal,
            origen = request.origen,
            notas = request.notas,
            validacionOmitida = request.validacionOmitida,
            createdAt = LocalDateTime.now(),
            updatedAt = LocalDateTime.now()
        )

        val guardado = productoCodigoBarraRepository.save(nuevoCodigo)

        val dto = ProductoCodigoBarraDTO(
            id = guardado.id,
            productoId = id,
            codigoBarraTipoId = guardado.codigoBarraTipo?.id ?: 0,
            codigoBarraTipoNombre = guardado.codigoBarraTipo?.nombre ?: "",
            codigoBarraTipo = guardado.codigoBarraTipo?.tipo,
            valor = guardado.valor,
            patron = guardado.patron,
            esPrincipal = guardado.esPrincipal,
            origen = guardado.origen,
            activo = guardado.activo,
            notas = guardado.notas,
            validacionOmitida = guardado.validacionOmitida,
            createdAt = guardado.createdAt,
            createdBy = guardado.createdBy,
            updatedAt = guardado.updatedAt
        )

        return ResponseEntity.status(HttpStatus.CREATED).body(dto)
    }

    /**
     * Actualizar un código de barras (cambiar estado, principal, notas)
     */
    @PutMapping("/codigos-barras/{codigoId}")
    @Transactional
    fun actualizarCodigoBarra(
        @PathVariable codigoId: Long,
        @RequestBody request: ActualizarProductoCodigoBarraRequest
    ): ResponseEntity<Any> {
        val codigo = productoCodigoBarraRepository.findById(codigoId).orElse(null)
            ?: return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(mapOf("error" to "Código de barras no encontrado"))

        // Si se marca como principal, desmarcar el anterior
        if (request.esPrincipal == true && !codigo.esPrincipal) {
            val principalActual = productoCodigoBarraRepository.findPrincipalByProductoId(codigo.producto?.id ?: 0)
            if (principalActual != null && principalActual.id != codigoId) {
                val actualizado = principalActual.copy(esPrincipal = false)
                productoCodigoBarraRepository.save(actualizado)
            }
        }

        val actualizado = codigo.copy(
            esPrincipal = request.esPrincipal ?: codigo.esPrincipal,
            activo = request.activo ?: codigo.activo,
            notas = request.notas ?: codigo.notas,
            updatedAt = LocalDateTime.now()
        )

        val guardado = productoCodigoBarraRepository.save(actualizado)

        val dto = ProductoCodigoBarraDTO(
            id = guardado.id,
            productoId = guardado.producto?.id ?: 0,
            codigoBarraTipoId = guardado.codigoBarraTipo?.id ?: 0,
            codigoBarraTipoNombre = guardado.codigoBarraTipo?.nombre ?: "",
            codigoBarraTipo = guardado.codigoBarraTipo?.tipo,
            valor = guardado.valor,
            patron = guardado.patron,
            esPrincipal = guardado.esPrincipal,
            origen = guardado.origen,
            activo = guardado.activo,
            notas = guardado.notas,
            validacionOmitida = guardado.validacionOmitida,
            createdAt = guardado.createdAt,
            createdBy = guardado.createdBy,
            updatedAt = guardado.updatedAt
        )

        return ResponseEntity.ok(dto)
    }

    /**
     * Eliminar un código de barras
     */
    @DeleteMapping("/codigos-barras/{codigoId}")
    @Transactional
    fun eliminarCodigoBarra(@PathVariable codigoId: Long): ResponseEntity<Any> {
        val codigo = productoCodigoBarraRepository.findById(codigoId).orElse(null)
            ?: return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(mapOf("error" to "Código de barras no encontrado"))

        productoCodigoBarraRepository.delete(codigo)
        return ResponseEntity.ok(mapOf("message" to "Código de barras eliminado correctamente"))
    }

    /**
     * Buscar producto por código de barras (directo o por patrón)
     */
    @GetMapping("/buscar-por-codigo/{codigo}")
    fun buscarPorCodigoBarra(@PathVariable codigo: String): ResponseEntity<Any> {
        val codigoDecoded = java.net.URLDecoder.decode(codigo, "UTF-8")
        
        // Primero intentar búsqueda directa
        var codigoEncontrado = productoCodigoBarraRepository.findByValorAndActivo(codigoDecoded, true)
        
        // Si no se encuentra, buscar por patrón
        if (codigoEncontrado == null) {
            val todosLosPatrones = productoCodigoBarraRepository.findAll()
                .filter { it.patron != null && it.activo }
            
            for (codigoConPatron in todosLosPatrones) {
                if (coincideConPatron(codigoDecoded, codigoConPatron.patron!!)) {
                    codigoEncontrado = codigoConPatron
                    break
                }
            }
        }
        
        if (codigoEncontrado == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(mapOf("error" to "Código de barras no encontrado"))
        }

        val productoNullable = codigoEncontrado.producto
            ?: return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(mapOf("error" to "Producto no encontrado"))
        
        // Usar variable local no-nullable para smart cast
        val producto = productoNullable

        // Construir DTO completo del producto
        val stockPorAlmacen = productoAlmacenRepository.findByProductoId(producto.id)
            .mapNotNull { pa ->
                val almacen = pa.almacen
                if (almacen != null) {
                    StockAlmacenDTO(
                        almacenId = almacen.id,
                        almacenNombre = almacen.nombre,
                        stock = pa.stock,
                        stockMinimo = pa.stockMinimo,
                        stockMaximo = pa.stockMaximo,
                        ubicacion = pa.ubicacion
                    )
                } else null
            }

        val referencias = productoReferenciaRepository.findByProductoId(producto.id)
            .map { ref ->
                ProductoReferenciaDTO(
                    id = ref.id,
                    referencia = ref.referencia,
                    esPrincipal = ref.esPrincipal,
                    orden = ref.orden
                )
            }

        val dto = ProductoConStockDTO(
            id = producto.id,
            referencia = producto.referencia,
            titulo = producto.titulo,
            nombre = producto.nombre,
            precio = producto.precio,
            stock = stockPorAlmacen.sumOf { it.stock },
            etiquetas = producto.etiquetas,
            descripcionCorta = producto.descripcionCorta,
            notas = producto.notas,
            fabricante = producto.fabricante?.let { 
                FabricanteSimpleDTO(it.id, it.nombreComercial) 
            },
            almacenPredeterminado = producto.almacenPredeterminado?.let {
                AlmacenSimpleDTO(it.id, it.nombre)
            },
            peso = producto.peso,
            unidadMedida = producto.unidadMedida,
            unidadMedidaReferencia = producto.unidadMedidaReferencia,
            magnitudPorUnidad = producto.magnitudPorUnidad,
            ultimoCoste = producto.ultimoCoste,
            descuento = producto.descuento,
            precioBloqueado = producto.precioBloqueado,
            margen = producto.margen,
            precioConImpuestos = producto.precioConImpuestos,
            tipoIva = producto.tipoIva?.let { 
                TipoIvaSimpleDTO(it.id, it.nombre, it.porcentajeIva) 
            },
            imagen = producto.imagen,
            familias = producto.familias.map { 
                FamiliaSimpleDTO(it.id, it.nombre, it.colorTPV, it.imagen) 
            }.toSet(),
            subfamilias = producto.subfamilias.map { 
                SubfamiliaSimpleDTO(it.id, it.nombre, it.familia?.id) 
            }.toSet(),
            stockPorAlmacen = stockPorAlmacen,
            referencias = referencias
        )

        return ResponseEntity.ok(mapOf(
            "producto" to dto,
            "codigoBarra" to ProductoCodigoBarraDTO(
                id = codigoEncontrado.id,
                productoId = producto.id,
                codigoBarraTipoId = codigoEncontrado.codigoBarraTipo?.id ?: 0,
                codigoBarraTipoNombre = codigoEncontrado.codigoBarraTipo?.nombre ?: "",
                codigoBarraTipo = codigoEncontrado.codigoBarraTipo?.tipo,
                valor = codigoEncontrado.valor,
                patron = codigoEncontrado.patron,
                esPrincipal = codigoEncontrado.esPrincipal,
                origen = codigoEncontrado.origen,
                activo = codigoEncontrado.activo,
                notas = codigoEncontrado.notas,
                validacionOmitida = codigoEncontrado.validacionOmitida,
                createdAt = codigoEncontrado.createdAt,
                createdBy = codigoEncontrado.createdBy,
                updatedAt = codigoEncontrado.updatedAt
            )
        ))
    }

    /**
     * Función auxiliar para comparar un código escaneado con un patrón
     * Patrón: X = cualquier dígito, números fijos deben coincidir
     * Ejemplo: XX00020XXXXXX coincide con 0300020134145
     */
    private fun coincideConPatron(codigo: String, patron: String): Boolean {
        if (codigo.length != patron.length) {
            return false
        }

        for (i in codigo.indices) {
            val charCodigo = codigo[i]
            val charPatron = patron[i]
            
            if (charPatron != 'X' && charPatron != charCodigo) {
                return false
            }
        }

        return true
    }

    /**
     * Listar todos los tipos de códigos de barras disponibles
     */
    @GetMapping("/tipos-codigos-barras")
    fun listarTiposCodigosBarras(): ResponseEntity<List<Map<String, Any?>>> {
        try {
            val tipos = codigoBarraRepository.findAll()
            val dtos = tipos.map { tipo ->
                // Cargar campos manualmente para evitar lazy loading
                val camposData = try {
                    codigoBarraCampoRepository.findByCodigoBarraTipoId(tipo.id)
                        .sortedBy { it.orden }
                        .map { campo ->
                            mapOf(
                                "id" to campo.id,
                                "nombre" to campo.nombre,
                                "longitud" to campo.longitud,
                                "orden" to campo.orden,
                                "decimales" to campo.decimales
                            )
                        }
                } catch (e: Exception) {
                    emptyList<Map<String, Any?>>()
                }
                
                mapOf(
                    "id" to tipo.id,
                    "nombre" to tipo.nombre,
                    "descripcion" to tipo.descripcion,
                    "tipo" to tipo.tipo,
                    "esEstandar" to tipo.esEstandar,
                    "longitudFija" to tipo.longitudFija,
                    "campos" to camposData
                )
            }
            return ResponseEntity.ok(dtos)
        } catch (e: Exception) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(listOf(mapOf("error" to e.message)))
        }
    }
}

data class PrecioTarifaRequest(
    val tarifaId: Long,
    val precio: Double?,
    val descuento: Double?,
    val margen: Double?,
    val precioCompra: Double? = null,
    val descuentoCompra: Double? = null,
    val tipoCalculoPrecioCompra: com.example.demo.model.TipoCalculoPrecio? = null,
    val valorCalculoCompra: Double? = null
)

data class AgregarReferenciaRequest(
    val referencia: String
)
