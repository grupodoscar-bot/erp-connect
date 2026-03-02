package com.example.demo.controller

import com.example.demo.model.Agrupacion
import com.example.demo.repository.AgrupacionRepository
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/agrupaciones")
@CrossOrigin(origins = ["http://145.223.103.219:3000"])
class AgrupacionController(
    private val agrupacionRepository: AgrupacionRepository
) {

    @GetMapping
    fun listarTodas(): ResponseEntity<List<Agrupacion>> {
        val agrupaciones = agrupacionRepository.findAll()
        return ResponseEntity.ok(agrupaciones)
    }

    @GetMapping("/activas")
    fun listarActivas(): ResponseEntity<List<Agrupacion>> {
        val agrupaciones = agrupacionRepository.findByActivaTrue()
        return ResponseEntity.ok(agrupaciones)
    }

    @GetMapping("/{id}")
    fun obtenerPorId(@PathVariable id: Long): ResponseEntity<Agrupacion> {
        val agrupacion = agrupacionRepository.findById(id)
            .orElseThrow { RuntimeException("Agrupación no encontrada con id: $id") }
        return ResponseEntity.ok(agrupacion)
    }

    @PostMapping
    fun crear(@RequestBody agrupacion: Agrupacion): ResponseEntity<Any> {
        if (agrupacionRepository.existsByNombre(agrupacion.nombre)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(mapOf("error" to "Ya existe una agrupación con ese nombre"))
        }

        val nuevaAgrupacion = agrupacionRepository.save(agrupacion)
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevaAgrupacion)
    }

    @PutMapping("/{id}")
    fun actualizar(
        @PathVariable id: Long,
        @RequestBody agrupacion: Agrupacion
    ): ResponseEntity<Any> {
        if (!agrupacionRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(mapOf("error" to "Agrupación no encontrada"))
        }

        val existente = agrupacionRepository.findByNombre(agrupacion.nombre)
        if (existente != null && existente.id != id) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(mapOf("error" to "Ya existe otra agrupación con ese nombre"))
        }

        val agrupacionActualizada = agrupacion.copy(id = id)
        agrupacionRepository.save(agrupacionActualizada)
        return ResponseEntity.ok(agrupacionActualizada)
    }

    @DeleteMapping("/{id}")
    fun eliminar(@PathVariable id: Long): ResponseEntity<Any> {
        if (!agrupacionRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(mapOf("error" to "Agrupación no encontrada"))
        }

        agrupacionRepository.deleteById(id)
        return ResponseEntity.ok(mapOf("mensaje" to "Agrupación eliminada correctamente"))
    }
}
