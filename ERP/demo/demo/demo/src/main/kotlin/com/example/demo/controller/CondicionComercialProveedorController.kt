package com.example.demo.controller

import com.example.demo.model.CondicionComercialProveedor
import com.example.demo.repository.CondicionComercialProveedorRepository
import com.example.demo.repository.AgrupacionRepository
import com.example.demo.repository.ProductoRepository
import com.example.demo.repository.TarifaRepository
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/condiciones-comerciales-proveedor")
@CrossOrigin(origins = ["http://145.223.103.219:3000"])
class CondicionComercialProveedorController(
    private val condicionComercialProveedorRepository: CondicionComercialProveedorRepository,
    private val agrupacionRepository: AgrupacionRepository,
    private val productoRepository: ProductoRepository,
    private val tarifaRepository: TarifaRepository
) {

    @GetMapping
    fun listarTodas(): ResponseEntity<List<CondicionComercialProveedor>> {
        val condiciones = condicionComercialProveedorRepository.findAll()
        return ResponseEntity.ok(condiciones)
    }

    @GetMapping("/{id}")
    fun obtenerPorId(@PathVariable id: Long): ResponseEntity<CondicionComercialProveedor> {
        val condicion = condicionComercialProveedorRepository.findById(id)
            .orElseThrow { RuntimeException("Condición comercial de proveedor no encontrada con id: $id") }
        return ResponseEntity.ok(condicion)
    }

    @GetMapping("/agrupacion/{agrupacionId}")
    fun obtenerPorAgrupacion(@PathVariable agrupacionId: Long): ResponseEntity<List<CondicionComercialProveedor>> {
        val condiciones = condicionComercialProveedorRepository.findByAgrupacionId(agrupacionId)
        return ResponseEntity.ok(condiciones)
    }

    @GetMapping("/agrupacion/{agrupacionId}/producto/{productoId}")
    fun obtenerPorAgrupacionYProducto(
        @PathVariable agrupacionId: Long,
        @PathVariable productoId: Long
    ): ResponseEntity<List<CondicionComercialProveedor>> {
        val condiciones = condicionComercialProveedorRepository.findByAgrupacionIdAndProductoId(
            agrupacionId, 
            productoId
        )
        return ResponseEntity.ok(condiciones)
    }

    data class CondicionComercialProveedorRequest(
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
    fun crear(@RequestBody request: CondicionComercialProveedorRequest): ResponseEntity<Any> {
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

        val condicion = CondicionComercialProveedor(
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

        val nuevaCondicion = condicionComercialProveedorRepository.save(condicion)
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevaCondicion)
    }

    @PutMapping("/{id}")
    fun actualizar(
        @PathVariable id: Long,
        @RequestBody request: CondicionComercialProveedorRequest
    ): ResponseEntity<Any> {
        if (!condicionComercialProveedorRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(mapOf("error" to "Condición comercial de proveedor no encontrada"))
        }

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

        val condicionActualizada = CondicionComercialProveedor(
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

        val resultado = condicionComercialProveedorRepository.save(condicionActualizada)
        return ResponseEntity.ok(resultado)
    }

    @DeleteMapping("/{id}")
    fun eliminar(@PathVariable id: Long): ResponseEntity<Void> {
        if (!condicionComercialProveedorRepository.existsById(id)) {
            return ResponseEntity.notFound().build()
        }
        condicionComercialProveedorRepository.deleteById(id)
        return ResponseEntity.noContent().build()
    }
}
