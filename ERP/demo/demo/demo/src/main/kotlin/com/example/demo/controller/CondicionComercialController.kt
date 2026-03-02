package com.example.demo.controller

import com.example.demo.model.CondicionComercial
import com.example.demo.repository.CondicionComercialRepository
import com.example.demo.repository.AgrupacionRepository
import com.example.demo.repository.ProductoRepository
import com.example.demo.repository.TarifaRepository
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/condiciones-comerciales")
@CrossOrigin(origins = ["http://145.223.103.219:3000"])
class CondicionComercialController(
    private val condicionComercialRepository: CondicionComercialRepository,
    private val agrupacionRepository: AgrupacionRepository,
    private val productoRepository: ProductoRepository,
    private val tarifaRepository: TarifaRepository
) {

    @GetMapping
    fun listarTodas(): ResponseEntity<List<CondicionComercial>> {
        val condiciones = condicionComercialRepository.findAll()
        return ResponseEntity.ok(condiciones)
    }

    @GetMapping("/{id}")
    fun obtenerPorId(@PathVariable id: Long): ResponseEntity<CondicionComercial> {
        val condicion = condicionComercialRepository.findById(id)
            .orElseThrow { RuntimeException("Condición comercial no encontrada con id: $id") }
        return ResponseEntity.ok(condicion)
    }

    @GetMapping("/agrupacion/{agrupacionId}")
    fun obtenerPorAgrupacion(@PathVariable agrupacionId: Long): ResponseEntity<List<CondicionComercial>> {
        val condiciones = condicionComercialRepository.findByAgrupacionId(agrupacionId)
        return ResponseEntity.ok(condiciones)
    }

    @GetMapping("/agrupacion/{agrupacionId}/activas")
    fun obtenerActivasPorAgrupacion(@PathVariable agrupacionId: Long): ResponseEntity<List<CondicionComercial>> {
        val condiciones = condicionComercialRepository.findByAgrupacionIdAndActivaTrue(agrupacionId)
        return ResponseEntity.ok(condiciones)
    }

    @GetMapping("/producto/{productoId}")
    fun obtenerPorProducto(@PathVariable productoId: Long): ResponseEntity<List<CondicionComercial>> {
        val condiciones = condicionComercialRepository.findByProductoId(productoId)
        return ResponseEntity.ok(condiciones)
    }

    @GetMapping("/agrupacion/{agrupacionId}/producto/{productoId}")
    fun obtenerPorAgrupacionYProducto(
        @PathVariable agrupacionId: Long,
        @PathVariable productoId: Long
    ): ResponseEntity<List<CondicionComercial>> {
        val condiciones = condicionComercialRepository.findCondicionesActivasByAgrupacionAndProducto(
            agrupacionId, 
            productoId
        )
        return ResponseEntity.ok(condiciones)
    }

    data class CondicionComercialRequest(
        val agrupacionId: Long,
        val productoId: Long?,
        val tarifaId: Long?,
        val tipoCondicion: String,
        val valor: Double,
        val precioEspecial: Double?,
        val cantidadMinima: Int,
        val cantidadMaxima: Int?,
        val activa: Boolean,
        val descripcion: String?,
        val prioridad: Int
    )

    @PostMapping
    fun crear(@RequestBody request: CondicionComercialRequest): ResponseEntity<Any> {
        println("[CondicionComercialController] Creando condición para agrupación ${request.agrupacionId} con tarifaId=${request.tarifaId}")
        val agrupacion = agrupacionRepository.findById(request.agrupacionId)
            .orElseThrow { RuntimeException("Agrupación no encontrada") }

        val producto = if (request.productoId != null) {
            productoRepository.findById(request.productoId)
                .orElseThrow { RuntimeException("Producto no encontrado") }
        } else null

        val tarifa = if (request.tarifaId != null) {
            tarifaRepository.findById(request.tarifaId)
                .orElseThrow { RuntimeException("Tarifa no encontrada") }
        } else null

        val condicion = CondicionComercial(
            agrupacion = agrupacion,
            producto = producto,
            tarifa = tarifa,
            tipoCondicion = request.tipoCondicion,
            valor = request.valor,
            precioEspecial = request.precioEspecial,
            cantidadMinima = request.cantidadMinima,
            cantidadMaxima = request.cantidadMaxima,
            activa = request.activa,
            descripcion = request.descripcion,
            prioridad = request.prioridad
        )

        val nuevaCondicion = condicionComercialRepository.save(condicion)
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevaCondicion)
    }

    @PutMapping("/{id}")
    fun actualizar(
        @PathVariable id: Long,
        @RequestBody request: CondicionComercialRequest
    ): ResponseEntity<Any> {
        if (!condicionComercialRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(mapOf("error" to "Condición comercial no encontrada"))
        }

        println("[CondicionComercialController] Actualizando condición $id con tarifaId=${request.tarifaId}")
        val agrupacion = agrupacionRepository.findById(request.agrupacionId)
            .orElseThrow { RuntimeException("Agrupación no encontrada") }

        val producto = if (request.productoId != null) {
            productoRepository.findById(request.productoId)
                .orElseThrow { RuntimeException("Producto no encontrado") }
        } else null

        val tarifa = if (request.tarifaId != null) {
            tarifaRepository.findById(request.tarifaId)
                .orElseThrow { RuntimeException("Tarifa no encontrada") }
        } else null

        println("[CondicionComercialController] Tarifa resuelta para condición $id: ${tarifa?.id}")
        val condicionActualizada = CondicionComercial(
            id = id,
            agrupacion = agrupacion,
            producto = producto,
            tarifa = tarifa,
            tipoCondicion = request.tipoCondicion,
            valor = request.valor,
            precioEspecial = request.precioEspecial,
            cantidadMinima = request.cantidadMinima,
            cantidadMaxima = request.cantidadMaxima,
            activa = request.activa,
            descripcion = request.descripcion,
            prioridad = request.prioridad
        )

        condicionComercialRepository.save(condicionActualizada)
        return ResponseEntity.ok(condicionActualizada)
    }

    @DeleteMapping("/{id}")
    fun eliminar(@PathVariable id: Long): ResponseEntity<Any> {
        if (!condicionComercialRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(mapOf("error" to "Condición comercial no encontrada"))
        }

        condicionComercialRepository.deleteById(id)
        return ResponseEntity.ok(mapOf("mensaje" to "Condición comercial eliminada correctamente"))
    }
}
