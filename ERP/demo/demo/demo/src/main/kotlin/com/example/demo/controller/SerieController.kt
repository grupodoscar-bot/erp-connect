package com.example.demo.controller

import com.example.demo.model.PreferenciaSerieUsuario
import com.example.demo.model.SerieDocumento
import com.example.demo.model.Usuario
import com.example.demo.repository.AlmacenRepository
import com.example.demo.repository.PreferenciaSerieUsuarioRepository
import com.example.demo.repository.SerieDocumentoRepository
import com.example.demo.repository.UsuarioRepository
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.time.OffsetDateTime

@RestController
@RequestMapping("/series")
@CrossOrigin(origins = ["http://145.223.103.219:3000"])
class SerieController(
    private val serieDocumentoRepository: SerieDocumentoRepository,
    private val preferenciaSerieUsuarioRepository: PreferenciaSerieUsuarioRepository,
    private val usuarioRepository: UsuarioRepository,
    private val almacenRepository: AlmacenRepository,
    private val serieNumeracionService: com.example.demo.service.SerieNumeracionService,
    private val serieSecuenciaRepository: com.example.demo.repository.SerieSecuenciaRepository,
    private val pedidoCompraRepository: com.example.demo.repository.compras.PedidoCompraRepository
) {

    @GetMapping
    fun obtenerSeries(
        @RequestParam(required = false) tipoDocumento: String?,
        @RequestParam(required = false) soloActivas: Boolean?
    ): ResponseEntity<List<SerieDocumento>> {
        val series = when {
            tipoDocumento != null && soloActivas == true -> 
                serieDocumentoRepository.findByTipoDocumentoAndActivo(tipoDocumento, true)
            tipoDocumento != null -> 
                serieDocumentoRepository.findByTipoDocumento(tipoDocumento)
            else -> 
                serieDocumentoRepository.findAll()
        }
        
        // Ordenar: predeterminadas primero, luego activas, luego por ID
        val seriesOrdenadas = series.sortedWith(
            compareByDescending<SerieDocumento> { it.defaultSistema }
                .thenByDescending { it.activo }
                .thenBy { it.id }
        )
        
        return ResponseEntity.ok(seriesOrdenadas)
    }

    @GetMapping("/{id}")
    fun obtenerSeriePorId(@PathVariable id: Long): ResponseEntity<SerieDocumento> {
        val serie = serieDocumentoRepository.findById(id)
            .orElseThrow { RuntimeException("Serie no encontrada con id: $id") }
        return ResponseEntity.ok(serie)
    }

    @PostMapping
    fun crearSerie(@RequestBody request: SerieDocumentoRequest): ResponseEntity<SerieDocumento> {
        // Validar que no exista otra serie con el mismo prefijo y tipo de documento
        val existente = serieDocumentoRepository.findByTipoDocumento(request.tipoDocumento)
            .find { it.prefijo.equals(request.prefijo, ignoreCase = true) }
        
        if (existente != null) {
            throw RuntimeException("Ya existe una serie con el prefijo '${request.prefijo}' para el tipo de documento '${request.tipoDocumento}'")
        }

        // Si se marca como predeterminada del sistema, desmarcar las demás
        if (request.defaultSistema == true) {
            val seriesDelTipo = serieDocumentoRepository.findByTipoDocumento(request.tipoDocumento)
            seriesDelTipo.forEach { serie ->
                if (serie.defaultSistema) {
                    serieDocumentoRepository.save(serie.copy(defaultSistema = false))
                }
            }
        }

        val almacenPredeterminado = request.almacenPredeterminadoId?.let { 
            almacenRepository.findById(it).orElse(null) 
        }

        val nuevaSerie = SerieDocumento(
            tipoDocumento = request.tipoDocumento,
            prefijo = request.prefijo.uppercase(),
            descripcion = request.descripcion,
            longitudCorrelativo = request.longitudCorrelativo ?: 5,
            activo = request.activo ?: true,
            defaultSistema = request.defaultSistema ?: false,
            permiteSeleccionUsuario = request.permiteSeleccionUsuario ?: true,
            almacenPredeterminado = almacenPredeterminado,
            creadoEn = OffsetDateTime.now(),
            actualizadoEn = OffsetDateTime.now()
        )

        val guardada = serieDocumentoRepository.save(nuevaSerie)
        return ResponseEntity.status(HttpStatus.CREATED).body(guardada)
    }

    @PutMapping("/{id}")
    fun actualizarSerie(
        @PathVariable id: Long,
        @RequestBody request: SerieDocumentoRequest
    ): ResponseEntity<SerieDocumento> {
        val serieExistente = serieDocumentoRepository.findById(id)
            .orElseThrow { RuntimeException("Serie no encontrada con id: $id") }

        // Validar que no exista otra serie con el mismo prefijo (excepto la actual)
        val otraSerie = serieDocumentoRepository.findByTipoDocumento(request.tipoDocumento)
            .find { it.prefijo.equals(request.prefijo, ignoreCase = true) && it.id != id }
        
        if (otraSerie != null) {
            throw RuntimeException("Ya existe otra serie con el prefijo '${request.prefijo}' para el tipo de documento '${request.tipoDocumento}'")
        }

        // Si se marca como predeterminada del sistema, desmarcar las demás
        if (request.defaultSistema == true && !serieExistente.defaultSistema) {
            val seriesDelTipo = serieDocumentoRepository.findByTipoDocumento(request.tipoDocumento)
            seriesDelTipo.forEach { serie ->
                if (serie.defaultSistema && serie.id != id) {
                    serieDocumentoRepository.save(serie.copy(defaultSistema = false))
                }
            }
        }

        val almacenPredeterminado = request.almacenPredeterminadoId?.let { 
            almacenRepository.findById(it).orElse(null) 
        }

        val serieActualizada = serieExistente.copy(
            prefijo = request.prefijo.uppercase(),
            descripcion = request.descripcion,
            longitudCorrelativo = request.longitudCorrelativo ?: serieExistente.longitudCorrelativo,
            activo = request.activo ?: serieExistente.activo,
            defaultSistema = request.defaultSistema ?: serieExistente.defaultSistema,
            permiteSeleccionUsuario = request.permiteSeleccionUsuario ?: serieExistente.permiteSeleccionUsuario,
            almacenPredeterminado = almacenPredeterminado,
            actualizadoEn = OffsetDateTime.now()
        )

        val guardada = serieDocumentoRepository.save(serieActualizada)
        return ResponseEntity.ok(guardada)
    }

    @DeleteMapping("/{id}")
    fun eliminarSerie(@PathVariable id: Long): ResponseEntity<Void> {
        if (!serieDocumentoRepository.existsById(id)) {
            throw RuntimeException("Serie no encontrada con id: $id")
        }
        
        // Verificar que no haya documentos usando esta serie
        // TODO: Añadir validación cuando se implementen otros documentos
        
        serieDocumentoRepository.deleteById(id)
        return ResponseEntity.noContent().build()
    }

    // Endpoints para preferencias de usuario
    @GetMapping("/preferencias")
    fun obtenerPreferencia(
        @RequestParam usuarioId: Long,
        @RequestParam tipoDocumento: String
    ): ResponseEntity<Map<String, Any>> {
        val preferencia = preferenciaSerieUsuarioRepository
            .findByUsuarioIdAndTipoDocumento(usuarioId, tipoDocumento)
            ?: return ResponseEntity.ok(emptyMap())
        
        val response = mapOf(
            "id" to preferencia.id,
            "usuarioId" to preferencia.usuario.id,
            "tipoDocumento" to preferencia.tipoDocumento,
            "serie" to mapOf(
                "id" to preferencia.serie.id,
                "tipoDocumento" to preferencia.serie.tipoDocumento,
                "prefijo" to preferencia.serie.prefijo,
                "descripcion" to (preferencia.serie.descripcion ?: ""),
                "longitudCorrelativo" to preferencia.serie.longitudCorrelativo,
                "activo" to preferencia.serie.activo,
                "defaultSistema" to preferencia.serie.defaultSistema,
                "permiteSeleccionUsuario" to preferencia.serie.permiteSeleccionUsuario
            ),
            "creadoEn" to preferencia.creadoEn,
            "actualizadoEn" to preferencia.actualizadoEn
        )
        
        return ResponseEntity.ok(response)
    }

    @PostMapping("/preferencias")
    fun guardarPreferencia(@RequestBody request: PreferenciaSerieRequest): ResponseEntity<Map<String, Any>> {
        val usuario = usuarioRepository.findById(request.usuarioId)
            .orElseThrow { RuntimeException("Usuario no encontrado con id: ${request.usuarioId}") }
        
        val serie = serieDocumentoRepository.findById(request.serieId)
            .orElseThrow { RuntimeException("Serie no encontrada con id: ${request.serieId}") }

        // Buscar si ya existe una preferencia
        val preferenciaExistente = preferenciaSerieUsuarioRepository
            .findByUsuarioIdAndTipoDocumento(request.usuarioId, request.tipoDocumento)

        val preferencia = if (preferenciaExistente != null) {
            // Actualizar existente
            preferenciaExistente.copy(
                serie = serie,
                actualizadoEn = OffsetDateTime.now()
            )
        } else {
            // Crear nueva
            PreferenciaSerieUsuario(
                usuario = usuario,
                tipoDocumento = request.tipoDocumento,
                serie = serie,
                creadoEn = OffsetDateTime.now(),
                actualizadoEn = OffsetDateTime.now()
            )
        }

        val guardada = preferenciaSerieUsuarioRepository.save(preferencia)
        
        val response = mapOf(
            "id" to guardada.id,
            "usuarioId" to guardada.usuario.id,
            "tipoDocumento" to guardada.tipoDocumento,
            "serie" to mapOf(
                "id" to guardada.serie.id,
                "tipoDocumento" to guardada.serie.tipoDocumento,
                "prefijo" to guardada.serie.prefijo,
                "descripcion" to (guardada.serie.descripcion ?: ""),
                "longitudCorrelativo" to guardada.serie.longitudCorrelativo,
                "activo" to guardada.serie.activo,
                "defaultSistema" to guardada.serie.defaultSistema,
                "permiteSeleccionUsuario" to guardada.serie.permiteSeleccionUsuario
            ),
            "creadoEn" to guardada.creadoEn,
            "actualizadoEn" to guardada.actualizadoEn
        )
        
        return ResponseEntity.ok(response)
    }

    @DeleteMapping("/preferencias")
    fun eliminarPreferencia(
        @RequestParam usuarioId: Long,
        @RequestParam tipoDocumento: String
    ): ResponseEntity<Void> {
        val preferencia = preferenciaSerieUsuarioRepository
            .findByUsuarioIdAndTipoDocumento(usuarioId, tipoDocumento)
            ?: return ResponseEntity.notFound().build()

        preferenciaSerieUsuarioRepository.delete(preferencia)
        return ResponseEntity.noContent().build()
    }

    // Endpoint para reiniciar contador de serie al último número usado + 1
    @PostMapping("/{serieId}/reiniciar-contador")
    fun reiniciarContador(@PathVariable serieId: Long): ResponseEntity<Map<String, Any>> {
        return try {
            val anioActual = java.time.LocalDate.now().year
            
            println("[DEBUG] reiniciarContador - serieId: $serieId, anioActual: $anioActual")
            
            // Obtener el prefijo de la serie
            val serie = serieDocumentoRepository.findById(serieId)
                .orElseThrow { IllegalArgumentException("Serie no encontrada") }
            
            println("[DEBUG] Serie prefijo: ${serie.prefijo}")
            
            // Buscar el último número usado para este prefijo
            val maxNumero = pedidoCompraRepository.findMaxNumeroByPrefijo(serie.prefijo) ?: 0L
            
            println("[DEBUG] maxNumero encontrado: $maxNumero")
            
            // El siguiente número debe ser el último usado + 1
            val siguienteNumero = maxNumero + 1
            
            println("[DEBUG] siguienteNumero calculado: $siguienteNumero")
            
            // Obtener o crear la secuencia para esta serie y año
            val secuencia = serieSecuenciaRepository.findBySerieIdAndAnio(serieId, anioActual)
            
            println("[DEBUG] secuencia existente: $secuencia")
            
            val secuenciaActualizada = if (secuencia != null) {
                // Actualizar la secuencia existente
                secuencia.copy(
                    siguienteNumero = siguienteNumero,
                    actualizadoEn = java.time.OffsetDateTime.now()
                )
            } else {
                // Crear nueva secuencia
                val serie = serieDocumentoRepository.findById(serieId)
                    .orElseThrow { IllegalArgumentException("Serie no encontrada") }
                com.example.demo.model.SerieSecuencia(
                    serie = serie,
                    anio = anioActual,
                    siguienteNumero = siguienteNumero,
                    actualizadoEn = java.time.OffsetDateTime.now()
                )
            }
            
            println("[DEBUG] Guardando secuencia: $secuenciaActualizada")
            
            val guardada = serieSecuenciaRepository.save(secuenciaActualizada)
            
            println("[DEBUG] Secuencia guardada: $guardada")
            
            ResponseEntity.ok(mapOf(
                "serieId" to serieId,
                "anio" to anioActual,
                "ultimoNumeroUsado" to maxNumero,
                "siguienteNumero" to siguienteNumero,
                "secuenciaGuardadaId" to guardada.id,
                "mensaje" to "Contador reiniciado correctamente"
            ))
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(mapOf("error" to (e.message ?: "Error al reiniciar contador")))
        }
    }
    @GetMapping("/generar-numero")
    fun generarNumero(
        @RequestParam serieId: Long,
        @RequestParam tipo: String
    ): ResponseEntity<Map<String, Any>> {
        return try {
            val resultado = serieNumeracionService.generarYReservarNumero(tipo, serieId, null)
            val response = mapOf(
                "serieId" to resultado.serie.id,
                "seriePrefijo" to resultado.serie.prefijo,
                "anio" to resultado.anio,
                "secuencial" to resultado.secuencial,
                "numeroGenerado" to resultado.codigo
            )
            ResponseEntity.ok(response)
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(mapOf("error" to (e.message ?: "Error al generar número")))
        }
    }
}

data class SerieDocumentoRequest(
    val tipoDocumento: String,
    val prefijo: String,
    val descripcion: String?,
    val longitudCorrelativo: Int?,
    val activo: Boolean?,
    val defaultSistema: Boolean?,
    val permiteSeleccionUsuario: Boolean?,
    val almacenPredeterminadoId: Long?
)

data class PreferenciaSerieRequest(
    val usuarioId: Long,
    val tipoDocumento: String,
    val serieId: Long
)
