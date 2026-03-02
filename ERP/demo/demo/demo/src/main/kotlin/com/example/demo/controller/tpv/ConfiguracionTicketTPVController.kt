package com.example.demo.controller.tpv

import com.example.demo.model.tpv.ConfiguracionTicketTPV
import com.example.demo.repository.tpv.ConfiguracionTicketTPVRepository
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.time.LocalDateTime

@RestController
@RequestMapping("/tpv/configuracion-tickets")
@CrossOrigin(origins = ["http://145.223.103.219:3000"])
class ConfiguracionTicketTPVController(
    private val configuracionRepository: ConfiguracionTicketTPVRepository
) {

    @GetMapping
    fun listarTodas(): List<ConfiguracionTicketTPV> =
        configuracionRepository.findAll()

    @GetMapping("/activa")
    fun obtenerConfiguracionActiva(): ResponseEntity<ConfiguracionTicketTPV> {
        val config = configuracionRepository.findConfiguracionActiva()
        return if (config != null) {
            ResponseEntity.ok(config)
        } else {
            // Si no hay configuración activa, crear una por defecto
            val nuevaConfig = ConfiguracionTicketTPV()
            val guardada = configuracionRepository.save(nuevaConfig)
            ResponseEntity.ok(guardada)
        }
    }

    @GetMapping("/{id}")
    fun obtenerPorId(@PathVariable id: Long): ResponseEntity<ConfiguracionTicketTPV> =
        configuracionRepository.findById(id)
            .map { ResponseEntity.ok(it) }
            .orElse(ResponseEntity.notFound().build())

    @PostMapping
    fun crear(@RequestBody config: ConfiguracionTicketTPV): ResponseEntity<ConfiguracionTicketTPV> {
        if (config.activa) {
            desactivarTodasLasConfiguraciones()
        }
        return ResponseEntity.ok(configuracionRepository.save(config))
    }

    @PutMapping("/{id}")
    fun actualizar(
        @PathVariable id: Long,
        @RequestBody config: ConfiguracionTicketTPV
    ): ResponseEntity<ConfiguracionTicketTPV> {
        return configuracionRepository.findById(id)
            .map { existente ->
                if (config.activa && !existente.activa) {
                    desactivarTodasLasConfiguraciones(id)
                }
                val actualizada = config.copy(
                    id = id,
                    creadoEn = existente.creadoEn,
                    actualizadoEn = LocalDateTime.now()
                )
                ResponseEntity.ok(configuracionRepository.save(actualizada))
            }
            .orElse(ResponseEntity.notFound().build())
    }

    @DeleteMapping("/{id}")
    fun borrar(@PathVariable id: Long): ResponseEntity<Any> {
        if (!configuracionRepository.existsById(id)) {
            return ResponseEntity.notFound().build()
        }
        configuracionRepository.deleteById(id)
        return ResponseEntity.noContent().build()
    }

    @PostMapping("/{id}/activar")
    fun activarConfiguracion(@PathVariable id: Long): ResponseEntity<ConfiguracionTicketTPV> {
        return configuracionRepository.findById(id)
            .map { config ->
                desactivarTodasLasConfiguraciones(id)
                val activada = config.copy(activa = true, actualizadoEn = LocalDateTime.now())
                ResponseEntity.ok(configuracionRepository.save(activada))
            }
            .orElse(ResponseEntity.notFound().build())
    }

    private fun desactivarTodasLasConfiguraciones(exceptoId: Long? = null) {
        configuracionRepository.findByActiva(true).forEach { config ->
            if (exceptoId == null || config.id != exceptoId) {
                val desactivada = config.copy(activa = false, actualizadoEn = LocalDateTime.now())
                configuracionRepository.save(desactivada)
            }
        }
    }
}

