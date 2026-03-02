package com.example.demo.controller

import com.example.demo.model.Subfamilia
import com.example.demo.repository.FamiliaRepository
import com.example.demo.repository.SubfamiliaRepository
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/subfamilias")
@CrossOrigin(origins = ["http://145.223.103.219:3000", "http://145.223.103.219:3000"])
class SubfamiliaController(
    private val subfamiliaRepository: SubfamiliaRepository,
    private val familiaRepository: FamiliaRepository
) {

    @GetMapping
    fun listarTodos(): List<Subfamilia> = subfamiliaRepository.findAll()

    @GetMapping("/{id}")
    fun obtenerPorId(@PathVariable id: Long): ResponseEntity<Subfamilia> =
        subfamiliaRepository.findById(id)
            .map { ResponseEntity.ok(it) }
            .orElse(ResponseEntity.notFound().build())

    @PostMapping
    fun crear(@RequestBody request: SubfamiliaRequest): ResponseEntity<Subfamilia> {
        val familia = request.familiaId?.let { familiaRepository.findById(it).orElse(null) }
        val nueva = Subfamilia(
            nombre = request.nombre,
            descripcion = request.descripcion,
            familia = familia
        )
        return ResponseEntity.ok(subfamiliaRepository.save(nueva))
    }

    @PutMapping("/{id}")
    fun actualizar(
        @PathVariable id: Long,
        @RequestBody datos: SubfamiliaRequest
    ): ResponseEntity<Subfamilia> {
        return subfamiliaRepository.findById(id)
            .map { existente ->
                val familia = datos.familiaId?.let { familiaRepository.findById(it).orElse(null) }
                val actualizado = existente.copy(
                    nombre = datos.nombre,
                    descripcion = datos.descripcion,
                    familia = familia
                )
                ResponseEntity.ok(subfamiliaRepository.save(actualizado))
            }
            .orElse(ResponseEntity.notFound().build())
    }

    @DeleteMapping("/{id}")
    fun borrar(@PathVariable id: Long): ResponseEntity<Void> {
        return if (subfamiliaRepository.existsById(id)) {
            subfamiliaRepository.deleteById(id)
            ResponseEntity.noContent().build()
        } else {
            ResponseEntity.notFound().build()
        }
    }
}

data class SubfamiliaRequest(
    val nombre: String,
    val descripcion: String,
    val familiaId: Long?
)
