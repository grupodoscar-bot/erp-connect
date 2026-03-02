package com.example.demo.controller

import com.example.demo.model.CampoCodigoBarra
import com.example.demo.model.TipoCodigoBarra
import com.example.demo.repository.TipoCodigoBarraRepository
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/tipos-codigo-barra")
@CrossOrigin(origins = ["http://145.223.103.219:3000"])
class TipoCodigoBarraController(
    private val tipoCodigoBarraRepository: TipoCodigoBarraRepository
) {

    @GetMapping
    fun listarTodos(): List<TipoCodigoBarra> =
        tipoCodigoBarraRepository.findAll()

    @GetMapping("/{id}")
    fun obtenerPorId(@PathVariable id: Long): ResponseEntity<TipoCodigoBarra> =
        tipoCodigoBarraRepository.findById(id)
            .map { ResponseEntity.ok(it) }
            .orElse(ResponseEntity.notFound().build())

    data class TipoCodigoBarraRequest(
        val nombre: String,
        val descripcion: String,
        val campos: List<CampoRequest>
    )

    data class CampoRequest(
        val nombre: String,
        val longitud: Int,
        val orden: Int,
        val decimales: Int = 0
    )

    @PostMapping
    fun crear(@RequestBody request: TipoCodigoBarraRequest): ResponseEntity<TipoCodigoBarra> {
        val tipo = TipoCodigoBarra(
            nombre = request.nombre,
            descripcion = request.descripcion
        )

        val camposCreados = request.campos.map { campo ->
            CampoCodigoBarra(
                tipoCodigoBarra = tipo,
                nombre = campo.nombre,
                longitud = campo.longitud,
                orden = campo.orden,
                decimales = campo.decimales
            )
        }.toMutableList()

        tipo.campos.addAll(camposCreados)
        val guardado = tipoCodigoBarraRepository.save(tipo)
        return ResponseEntity.ok(guardado)
    }

    @PutMapping("/{id}")
    fun actualizar(
        @PathVariable id: Long,
        @RequestBody request: TipoCodigoBarraRequest
    ): ResponseEntity<TipoCodigoBarra> {
        return tipoCodigoBarraRepository.findById(id)
            .map { existente ->
                // Limpiar campos antiguos
                existente.campos.clear()

                // Crear nuevos campos
                val camposNuevos = request.campos.map { campo ->
                    CampoCodigoBarra(
                        tipoCodigoBarra = existente,
                        nombre = campo.nombre,
                        longitud = campo.longitud,
                        orden = campo.orden,
                        decimales = campo.decimales
                    )
                }

                existente.campos.addAll(camposNuevos)

                val actualizado = existente.copy(
                    nombre = request.nombre,
                    descripcion = request.descripcion,
                    campos = existente.campos
                )

                ResponseEntity.ok(tipoCodigoBarraRepository.save(actualizado))
            }
            .orElse(ResponseEntity.notFound().build())
    }

    @DeleteMapping("/{id}")
    fun borrar(@PathVariable id: Long): ResponseEntity<Any> {
        val tipo = tipoCodigoBarraRepository.findById(id).orElse(null)
            ?: return ResponseEntity.notFound().build()
        
        // Proteger formatos estándar (EAN13, EAN8, CODE128)
        val formatosProtegidos = listOf("EAN13", "EAN8", "CODE128", "EAN13-Peso")
        if (tipo.nombre in formatosProtegidos) {
            return ResponseEntity.badRequest()
                .body(mapOf("error" to "No se puede eliminar el formato estándar ${tipo.nombre}"))
        }
        
        tipoCodigoBarraRepository.deleteById(id)
        return ResponseEntity.noContent().build()
    }
}
