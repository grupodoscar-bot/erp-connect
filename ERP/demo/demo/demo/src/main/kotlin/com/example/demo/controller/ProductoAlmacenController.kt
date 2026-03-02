package com.example.demo.controller

import com.example.demo.model.ProductoAlmacen
import com.example.demo.repository.AlmacenRepository
import com.example.demo.repository.ProductoAlmacenRepository
import com.example.demo.repository.ProductoRepository
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.time.LocalDateTime

@RestController
@RequestMapping("/producto-almacen")
@CrossOrigin(origins = ["http://145.223.103.219:3000", "http://145.223.103.219:3000"])
class ProductoAlmacenController(
    private val productoAlmacenRepository: ProductoAlmacenRepository,
    private val productoRepository: ProductoRepository,
    private val almacenRepository: AlmacenRepository
) {

    @GetMapping("/producto/{productoId}")
    fun obtenerStockPorProducto(@PathVariable productoId: Long): List<ProductoAlmacen> =
        productoAlmacenRepository.findByProductoId(productoId)

    @GetMapping("/producto/{productoId}/almacen/{almacenId}")
    fun obtenerStockPorProductoYAlmacen(
        @PathVariable productoId: Long,
        @PathVariable almacenId: Long
    ): ResponseEntity<ProductoAlmacen> {
        val productoAlmacen = productoAlmacenRepository.findByProductoIdAndAlmacenId(productoId, almacenId)
        return if (productoAlmacen != null) {
            ResponseEntity.ok(productoAlmacen)
        } else {
            ResponseEntity.notFound().build()
        }
    }

    @GetMapping("/almacen/{almacenId}")
    fun obtenerProductosPorAlmacen(@PathVariable almacenId: Long): List<ProductoAlmacen> =
        productoAlmacenRepository.findByAlmacenId(almacenId)

    @PostMapping
    fun crear(@RequestBody request: ProductoAlmacenRequest): ResponseEntity<Any> {
        val producto = productoRepository.findById(request.productoId).orElse(null)
            ?: return ResponseEntity.badRequest().body(mapOf("error" to "Producto no encontrado"))

        val almacen = almacenRepository.findById(request.almacenId).orElse(null)
            ?: return ResponseEntity.badRequest().body(mapOf("error" to "Almacén no encontrado"))

        // Check if relationship already exists
        val existente = productoAlmacenRepository.findByProductoIdAndAlmacenId(request.productoId, request.almacenId)
        if (existente != null) {
            return ResponseEntity.badRequest().body(mapOf("error" to "Ya existe una relación entre este producto y almacén"))
        }

        val nuevo = ProductoAlmacen(
            producto = producto,
            almacen = almacen,
            stock = request.stock,
            stockMinimo = request.stockMinimo,
            stockMaximo = request.stockMaximo,
            ubicacion = request.ubicacion
        )
        return ResponseEntity.ok(productoAlmacenRepository.save(nuevo))
    }

    @PutMapping("/{id}")
    fun actualizar(
        @PathVariable id: Long,
        @RequestBody datos: ProductoAlmacenRequest
    ): ResponseEntity<ProductoAlmacen> {
        return productoAlmacenRepository.findById(id)
            .map { existente ->
                val actualizado = existente.copy(
                    stock = datos.stock,
                    stockMinimo = datos.stockMinimo,
                    stockMaximo = datos.stockMaximo,
                    ubicacion = datos.ubicacion,
                    updatedAt = LocalDateTime.now()
                )
                ResponseEntity.ok(productoAlmacenRepository.save(actualizado))
            }
            .orElse(ResponseEntity.notFound().build())
    }

    @PutMapping("/producto/{productoId}/almacen/{almacenId}")
    fun actualizarPorProductoYAlmacen(
        @PathVariable productoId: Long,
        @PathVariable almacenId: Long,
        @RequestBody datos: ProductoAlmacenUpdateRequest
    ): ResponseEntity<ProductoAlmacen> {
        val existente = productoAlmacenRepository.findByProductoIdAndAlmacenId(productoId, almacenId)
            ?: return ResponseEntity.notFound().build()

        val actualizado = existente.copy(
            stock = datos.stock,
            stockMinimo = datos.stockMinimo ?: existente.stockMinimo,
            stockMaximo = datos.stockMaximo,
            ubicacion = datos.ubicacion ?: existente.ubicacion,
            updatedAt = LocalDateTime.now()
        )
        return ResponseEntity.ok(productoAlmacenRepository.save(actualizado))
    }

    @DeleteMapping("/{id}")
    fun borrar(@PathVariable id: Long): ResponseEntity<Void> {
        return if (productoAlmacenRepository.existsById(id)) {
            productoAlmacenRepository.deleteById(id)
            ResponseEntity.noContent().build()
        } else {
            ResponseEntity.notFound().build()
        }
    }
}

data class ProductoAlmacenRequest(
    val productoId: Long,
    val almacenId: Long,
    val stock: Int,
    val stockMinimo: Int? = 0,
    val stockMaximo: Int? = null,
    val ubicacion: String? = null
)

data class ProductoAlmacenUpdateRequest(
    val stock: Int,
    val stockMinimo: Int? = null,
    val stockMaximo: Int? = null,
    val ubicacion: String? = null
)
