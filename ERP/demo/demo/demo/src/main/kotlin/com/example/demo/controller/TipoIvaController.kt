package com.example.demo.controller

import com.example.demo.model.TipoIva
import com.example.demo.repository.TipoIvaRepository
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.time.OffsetDateTime

@RestController
@RequestMapping("/tipos-iva")
@CrossOrigin(origins = ["http://145.223.103.219:3000"])
class TipoIvaController(
    private val tipoIvaRepository: TipoIvaRepository
) {

    data class TipoIvaRequest(
        val nombre: String,
        val porcentajeIva: Double,
        val porcentajeRecargo: Double = 0.0
    )

    @GetMapping
    fun listar(): List<TipoIva> = tipoIvaRepository.findAll()

    @GetMapping("/{id}")
    fun obtener(@PathVariable id: Long): ResponseEntity<TipoIva> =
        tipoIvaRepository.findById(id)
            .map { ResponseEntity.ok(it) }
            .orElse(ResponseEntity.notFound().build())

    @PostMapping
    fun crear(@RequestBody request: TipoIvaRequest): TipoIva {
        val tipoIva = TipoIva(
            nombre = request.nombre,
            porcentajeIva = request.porcentajeIva,
            porcentajeRecargo = request.porcentajeRecargo,
            activo = true,
            createdAt = OffsetDateTime.now(),
            updatedAt = OffsetDateTime.now()
        )
        return tipoIvaRepository.save(tipoIva)
    }

    @PutMapping("/{id}")
    fun actualizar(
        @PathVariable id: Long,
        @RequestBody request: TipoIvaRequest
    ): ResponseEntity<TipoIva> {
        return tipoIvaRepository.findById(id)
            .map { existente ->
                val actualizado = existente.copy(
                    nombre = request.nombre,
                    porcentajeIva = request.porcentajeIva,
                    porcentajeRecargo = request.porcentajeRecargo,
                    updatedAt = OffsetDateTime.now()
                )
                ResponseEntity.ok(tipoIvaRepository.save(actualizado))
            }
            .orElse(ResponseEntity.notFound().build())
    }

    @DeleteMapping("/{id}")
    fun eliminar(@PathVariable id: Long): ResponseEntity<Void> {
        return if (tipoIvaRepository.existsById(id)) {
            tipoIvaRepository.deleteById(id)
            ResponseEntity.noContent().build()
        } else {
            ResponseEntity.notFound().build()
        }
    }
}
