package com.example.demo.controller.ventas

import com.example.demo.model.ventas.DocumentoTransformacion
import com.example.demo.repository.ventas.DocumentoTransformacionRepository
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/documento-transformaciones")
@CrossOrigin(origins = ["http://145.223.103.219:3000"])
class DocumentoTransformacionController(
    private val documentoTransformacionRepository: DocumentoTransformacionRepository
) {

    @GetMapping("/historial/{tipo}/{id}")
    fun obtenerHistorial(
        @PathVariable tipo: String,
        @PathVariable id: Long
    ): ResponseEntity<List<DocumentoTransformacion>> {
        val historial = obtenerHistorialCompleto(tipo, id)
        return ResponseEntity.ok(historial)
    }

    private fun obtenerHistorialCompleto(tipo: String, id: Long): List<DocumentoTransformacion> {
        val resultado = mutableSetOf<DocumentoTransformacion>()
        val visitados = mutableSetOf<Pair<String, Long>>()
        val cola: ArrayDeque<Pair<String, Long>> = ArrayDeque()
        cola.add(Pair(tipo, id))

        while (cola.isNotEmpty()) {
            val (tipoActual, idActual) = cola.removeFirst()
            val claveActual = Pair(tipoActual, idActual)
            
            // Marcar como visitado para evitar ciclos infinitos
            if (!visitados.add(claveActual)) {
                continue
            }

            // Buscar todas las transformaciones donde este documento es ORIGEN
            val destinos = documentoTransformacionRepository.findByTipoOrigenAndIdOrigen(tipoActual, idActual)
            destinos.forEach { transformacion ->
                if (resultado.add(transformacion)) {
                    // Solo añadir a la cola si es una transformación nueva
                    cola.add(Pair(transformacion.tipoDestino, transformacion.idDestino))
                }
            }

            // Buscar todas las transformaciones donde este documento es DESTINO
            val origenes = documentoTransformacionRepository.findByTipoDestinoAndIdDestino(tipoActual, idActual)
            origenes.forEach { transformacion ->
                if (resultado.add(transformacion)) {
                    // Solo añadir a la cola si es una transformación nueva
                    cola.add(Pair(transformacion.tipoOrigen, transformacion.idOrigen))
                }
            }
        }

        return resultado.sortedBy { it.fechaTransformacion }
    }

    @GetMapping("/origenes/{tipo}/{id}")
    fun obtenerOrigenes(
        @PathVariable tipo: String,
        @PathVariable id: Long
    ): ResponseEntity<List<DocumentoTransformacion>> {
        val origenes = documentoTransformacionRepository.findByTipoDestinoAndIdDestino(tipo, id)
        return ResponseEntity.ok(origenes)
    }

    @GetMapping("/destinos/{tipo}/{id}")
    fun obtenerDestinos(
        @PathVariable tipo: String,
        @PathVariable id: Long
    ): ResponseEntity<List<DocumentoTransformacion>> {
        val destinos = documentoTransformacionRepository.findByTipoOrigenAndIdOrigen(tipo, id)
        return ResponseEntity.ok(destinos)
    }

    @GetMapping("/origen-directo/{tipo}/{id}")
    fun obtenerOrigenDirecto(
        @PathVariable tipo: String,
        @PathVariable id: Long
    ): ResponseEntity<Map<String, Any?>> {
        val origen = documentoTransformacionRepository.findByTipoDestinoAndIdDestino(tipo, id).firstOrNull()
        if (origen != null) {
            return ResponseEntity.ok(mapOf(
                "tipoOrigen" to origen.tipoOrigen,
                "idOrigen" to origen.idOrigen,
                "numeroOrigen" to origen.numeroOrigen,
                "tipoTransformacion" to origen.tipoTransformacion
            ))
        }
        return ResponseEntity.ok(mapOf("tipoOrigen" to "MANUAL"))
    }
}
