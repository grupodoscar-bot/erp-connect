package com.example.demo.controller

import com.example.demo.model.Familia
import com.example.demo.repository.FamiliaRepository
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/familias")
@CrossOrigin(origins = ["http://145.223.103.219:3000"])
class FamiliaController(
    private val familiaRepository: FamiliaRepository
) {

    @GetMapping
    fun listarTodos(): List<Familia> = familiaRepository.findAll()

    @GetMapping("/{id}")
    fun obtenerPorId(@PathVariable id: Long): ResponseEntity<Familia> =
        familiaRepository.findById(id)
            .map { ResponseEntity.ok(it) }
            .orElse(ResponseEntity.notFound().build())

    @PostMapping
    fun crear(@RequestBody familia: Familia): Familia =
        familiaRepository.save(familia)

    @PutMapping("/{id}")
    fun actualizar(
        @PathVariable id: Long,
        @RequestBody datos: Familia
    ): ResponseEntity<Familia> {
        return familiaRepository.findById(id)
            .map { existente ->
                val actualizado = existente.copy(
                    nombre = datos.nombre,
                    descripcion = datos.descripcion,
                    colorTPV = datos.colorTPV,
                    imagen = datos.imagen ?: existente.imagen
                )
                ResponseEntity.ok(familiaRepository.save(actualizado))
            }
            .orElse(ResponseEntity.notFound().build())
    }

    @DeleteMapping("/{id}")
    fun borrar(@PathVariable id: Long): ResponseEntity<Void> {
        return if (familiaRepository.existsById(id)) {
            familiaRepository.deleteById(id)
            ResponseEntity.noContent().build()
        } else {
            ResponseEntity.notFound().build()
        }
    }
}
