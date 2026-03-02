package com.example.demo.controller

import com.example.demo.model.MovimientoStock
import com.example.demo.model.TipoMovimientoStock
import com.example.demo.repository.MovimientoStockRepository
import com.example.demo.repository.ProductoAlmacenRepository
import com.example.demo.repository.ProductoRepository
import com.example.demo.repository.AlmacenRepository
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.http.ResponseEntity
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.*
import java.time.LocalDateTime

@RestController
@RequestMapping("/movimientos-stock")
@CrossOrigin(origins = ["http://145.223.103.219:3000"])
class MovimientoStockController(
    private val movimientoStockRepository: MovimientoStockRepository,
    private val productoRepository: ProductoRepository,
    private val almacenRepository: AlmacenRepository,
    private val productoAlmacenRepository: ProductoAlmacenRepository
) {

    @GetMapping
    fun listarMovimientos(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "50") size: Int,
        @RequestParam(required = false) productoId: Long?,
        @RequestParam(required = false) almacenId: Long?,
        @RequestParam(required = false) tipoMovimiento: String?,
        @RequestParam(required = false) documentoTipo: String?,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) fechaInicio: LocalDateTime?,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) fechaFin: LocalDateTime?
    ): ResponseEntity<Map<String, Any>> {
        val pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "fecha"))
        
        // Get all movements and filter in memory for now (can be optimized later with Specifications)
        val allMovimientos = movimientoStockRepository.findAllByOrderByFechaDesc(pageRequest)
        
        // Apply filters manually
        var filteredContent = allMovimientos.content.asSequence()
        
        if (productoId != null) {
            filteredContent = filteredContent.filter { it.producto?.id == productoId }
        }
        if (almacenId != null) {
            filteredContent = filteredContent.filter { it.almacen?.id == almacenId }
        }
        if (tipoMovimiento != null) {
            filteredContent = filteredContent.filter { it.tipoMovimiento == tipoMovimiento }
        }
        if (documentoTipo != null) {
            filteredContent = filteredContent.filter { it.documentoTipo == documentoTipo }
        }
        if (fechaInicio != null) {
            filteredContent = filteredContent.filter { it.fecha.isAfter(fechaInicio) || it.fecha.isEqual(fechaInicio) }
        }
        if (fechaFin != null) {
            filteredContent = filteredContent.filter { it.fecha.isBefore(fechaFin) || it.fecha.isEqual(fechaFin) }
        }
        
        val finalContent = filteredContent.toList()

        val response = mapOf(
            "content" to finalContent,
            "totalElements" to finalContent.size.toLong(),
            "totalPages" to if (finalContent.isEmpty()) 0 else 1,
            "currentPage" to page,
            "pageSize" to size,
            "hasNext" to false,
            "hasPrevious" to false
        )

        return ResponseEntity.ok(response)
    }

    @GetMapping("/producto/{productoId}")
    fun listarMovimientosProducto(
        @PathVariable productoId: Long,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "50") size: Int,
        @RequestParam(required = false) almacenId: Long?
    ): ResponseEntity<Map<String, Any>> {
        val pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "fecha"))
        
        val movimientosPage: Page<MovimientoStock> = if (almacenId != null) {
            movimientoStockRepository.findByProductoIdAndAlmacenIdOrderByFechaDesc(
                productoId = productoId,
                almacenId = almacenId,
                pageable = pageRequest
            )
        } else {
            movimientoStockRepository.findByProductoIdOrderByFechaDesc(
                productoId = productoId,
                pageable = pageRequest
            )
        }

        val response = mapOf(
            "content" to movimientosPage.content,
            "totalElements" to movimientosPage.totalElements,
            "totalPages" to movimientosPage.totalPages,
            "currentPage" to movimientosPage.number,
            "pageSize" to movimientosPage.size
        )

        return ResponseEntity.ok(response)
    }

    @GetMapping("/almacen/{almacenId}")
    fun listarMovimientosAlmacen(
        @PathVariable almacenId: Long,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "50") size: Int
    ): ResponseEntity<Map<String, Any>> {
        val pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "fecha"))
        
        val movimientosPage = movimientoStockRepository.findByAlmacenIdOrderByFechaDesc(
            almacenId = almacenId,
            pageable = pageRequest
        )

        val response = mapOf(
            "content" to movimientosPage.content,
            "totalElements" to movimientosPage.totalElements,
            "totalPages" to movimientosPage.totalPages,
            "currentPage" to movimientosPage.number,
            "pageSize" to movimientosPage.size
        )

        return ResponseEntity.ok(response)
    }

    @GetMapping("/documento/{tipo}/{id}")
    fun listarMovimientosDocumento(
        @PathVariable tipo: String,
        @PathVariable id: Long
    ): ResponseEntity<List<MovimientoStock>> {
        val movimientos = movimientoStockRepository.findByDocumentoTipoAndDocumentoIdOrderByFechaDesc(
            documentoTipo = tipo,
            documentoId = id
        )
        return ResponseEntity.ok(movimientos)
    }

    @GetMapping("/tipos")
    fun listarTiposMovimiento(): ResponseEntity<List<String>> {
        val tipos = listOf(
            TipoMovimientoStock.EMISION_ALBARAN,
            TipoMovimientoStock.REVERSION_ALBARAN,
            TipoMovimientoStock.EMISION_FACTURA,
            TipoMovimientoStock.REVERSION_FACTURA,
            TipoMovimientoStock.MODIFICACION_EMITIDO,
            TipoMovimientoStock.DIFERENCIA_ALBARAN_FACTURA,
            TipoMovimientoStock.EMISION_FACTURA_RECTIFICATIVA,
            TipoMovimientoStock.REVERSION_FACTURA_RECTIFICATIVA,
            TipoMovimientoStock.AJUSTE_MANUAL
        )
        return ResponseEntity.ok(tipos)
    }

    @PostMapping("/manual")
    @Transactional
    fun crearAjusteManual(@RequestBody request: AjusteManualRequest): ResponseEntity<Any> {
        val producto = productoRepository.findById(request.productoId).orElse(null)
            ?: return ResponseEntity.badRequest().body(mapOf("error" to "Producto no encontrado"))

        val almacen = almacenRepository.findById(request.almacenId).orElse(null)
            ?: return ResponseEntity.badRequest().body(mapOf("error" to "Almacén no encontrado"))

        val productoAlmacen = productoAlmacenRepository.findByProductoIdAndAlmacenId(
            request.productoId,
            request.almacenId
        ) ?: return ResponseEntity.badRequest().body(mapOf("error" to "Producto no existe en este almacén"))

        val stockAnterior = productoAlmacen.stock ?: 0
        val nuevoStock = stockAnterior + request.cantidad

        if (nuevoStock < 0) {
            return ResponseEntity.badRequest().body(mapOf(
                "error" to "El ajuste resultaría en stock negativo. Stock actual: $stockAnterior, ajuste: ${request.cantidad}"
            ))
        }

        productoAlmacen.stock = nuevoStock
        productoAlmacenRepository.save(productoAlmacen)

        val movimiento = MovimientoStock(
            fecha = LocalDateTime.now(),
            producto = producto,
            almacen = almacen,
            cantidad = request.cantidad,
            stockAnterior = stockAnterior,
            stockNuevo = nuevoStock,
            tipoMovimiento = TipoMovimientoStock.AJUSTE_MANUAL,
            descripcion = request.descripcion,
            documentoTipo = null,
            documentoId = null,
            documentoNumero = null,
            usuarioId = request.usuarioId,
            createdAt = LocalDateTime.now()
        )

        val movimientoGuardado = movimientoStockRepository.save(movimiento)
        return ResponseEntity.ok(movimientoGuardado)
    }

    @GetMapping("/{id}")
    fun obtenerMovimiento(@PathVariable id: Long): ResponseEntity<MovimientoStock> {
        return movimientoStockRepository.findById(id)
            .map { ResponseEntity.ok(it) }
            .orElse(ResponseEntity.notFound().build())
    }
}

data class AjusteManualRequest(
    val productoId: Long,
    val almacenId: Long,
    val cantidad: Int,
    val descripcion: String,
    val usuarioId: Long? = null
)
