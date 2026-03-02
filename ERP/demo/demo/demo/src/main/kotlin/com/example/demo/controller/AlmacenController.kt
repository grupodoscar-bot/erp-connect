package com.example.demo.controller

import com.example.demo.model.Almacen
import com.example.demo.repository.AlmacenRepository
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.time.LocalDateTime

@RestController
@RequestMapping("/almacenes")
@CrossOrigin(origins = ["http://145.223.103.219:3000", "http://145.223.103.219:3000"])
class AlmacenController(
    private val almacenRepository: AlmacenRepository
) {

    @GetMapping
    fun listarTodos(): List<Almacen> =
        almacenRepository.findAll()

    @GetMapping("/activos")
    fun listarActivos(): List<Almacen> =
        almacenRepository.findByActivoTrue()

    @GetMapping("/{id}")
    fun obtenerPorId(@PathVariable id: Long): ResponseEntity<Almacen> =
        almacenRepository.findById(id)
            .map { ResponseEntity.ok(it) }
            .orElse(ResponseEntity.notFound().build())

    @PostMapping
    fun crear(@RequestBody request: AlmacenRequest): ResponseEntity<Any> {
        if (almacenRepository.existsByNombre(request.nombre)) {
            return ResponseEntity.badRequest().body(mapOf("error" to "Ya existe un almacén con ese nombre"))
        }

        val nuevo = Almacen(
            nombre = request.nombre,
            descripcion = request.descripcion,
            direccion = request.direccion,
            activo = request.activo
        )
        return ResponseEntity.ok(almacenRepository.save(nuevo))
    }

    @PutMapping("/{id}")
    fun actualizar(
        @PathVariable id: Long,
        @RequestBody datos: AlmacenRequest
    ): ResponseEntity<Any> {
        val almacenOpt = almacenRepository.findById(id)
        if (!almacenOpt.isPresent) {
            return ResponseEntity.notFound().build()
        }

        val existente = almacenOpt.get()
        
        // Check if name is being changed and if new name already exists
        if (existente.nombre != datos.nombre && almacenRepository.existsByNombre(datos.nombre)) {
            return ResponseEntity.badRequest().body(mapOf("error" to "Ya existe un almacén con ese nombre"))
        }

        val actualizado = existente.copy(
            nombre = datos.nombre,
            descripcion = datos.descripcion,
            direccion = datos.direccion,
            activo = datos.activo,
            updatedAt = LocalDateTime.now()
        )
        return ResponseEntity.ok(almacenRepository.save(actualizado))
    }

    @DeleteMapping("/{id}")
    fun borrar(@PathVariable id: Long): ResponseEntity<Any> {
        return if (almacenRepository.existsById(id)) {
            try {
                almacenRepository.deleteById(id)
                ResponseEntity.noContent().build()
            } catch (e: Exception) {
                ResponseEntity.badRequest().body(mapOf("error" to "No se puede eliminar el almacén porque tiene productos asociados"))
            }
        } else {
            ResponseEntity.notFound().build()
        }
    }
}

data class AlmacenRequest(
    val nombre: String,
    val descripcion: String? = null,
    val direccion: String? = null,
    val activo: Boolean = true
)
