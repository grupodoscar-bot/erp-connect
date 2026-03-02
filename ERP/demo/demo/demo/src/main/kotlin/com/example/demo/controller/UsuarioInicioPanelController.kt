package com.example.demo.controller

import com.example.demo.model.UsuarioInicioPanel
import com.example.demo.repository.UsuarioInicioPanelRepository
import com.example.demo.repository.UsuarioRepository
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.CrossOrigin
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/usuarios/{usuarioId}/widgets")
@CrossOrigin(origins = ["http://145.223.103.219:3000"])
class UsuarioInicioPanelController(
    private val usuarioInicioPanelRepository: UsuarioInicioPanelRepository,
    private val usuarioRepository: UsuarioRepository,
) {

    data class WidgetRequest(
        val tipo: String,
        val target: String,
        val titulo: String? = null,
        val descripcion: String? = null,
        val sizeW: Int? = null,
        val sizeH: Int? = null,
        val posicion: Int? = null,
        val meta: Map<String, Any?>? = emptyMap(),
    )

    data class WidgetResponse(
        val id: Long,
        val usuarioId: Long,
        val tipo: String,
        val target: String,
        val titulo: String?,
        val descripcion: String?,
        val sizeW: Int,
        val sizeH: Int,
        val posicion: Int,
        val meta: Map<String, Any?>,
        val creadoEn: String?,
        val actualizadoEn: String?,
    )

    data class ReordenRequest(
    val ids: List<Long> = emptyList(),
    val positions: List<WidgetPosition> = emptyList()
)

data class WidgetPosition(val id: Long, val posicion: Int)

    @GetMapping
    fun listar(@PathVariable usuarioId: Long): ResponseEntity<List<WidgetResponse>> {
        if (!usuarioRepository.existsById(usuarioId)) {
            return ResponseEntity.notFound().build()
        }

        val widgets = usuarioInicioPanelRepository.findByUsuarioIdOrderByPosicionAsc(usuarioId)
            .map { it.toResponse() }
        return ResponseEntity.ok(widgets)
    }

    @PostMapping
    fun crear(
        @PathVariable usuarioId: Long,
        @RequestBody request: WidgetRequest,
    ): ResponseEntity<WidgetResponse> {
        if (!usuarioRepository.existsById(usuarioId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build()
        }

        val posicion = request.posicion?.coerceAtLeast(0)
            ?: (usuarioInicioPanelRepository.findTopByUsuarioIdOrderByPosicionDesc(usuarioId)?.posicion?.plus(1) ?: 0)

        val nuevoWidget = usuarioInicioPanelRepository.save(
            UsuarioInicioPanel(
                usuarioId = usuarioId,
                tipo = request.tipo,
                target = request.target,
                titulo = request.titulo,
                descripcion = request.descripcion,
                sizeW = validarSize(request.sizeW, 1),
                sizeH = validarSize(request.sizeH, 1),
                posicion = posicion,
                meta = request.meta ?: emptyMap(),
            ),
        )

        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoWidget.toResponse())
    }

    @PutMapping("/{widgetId}")
    fun actualizar(
        @PathVariable usuarioId: Long,
        @PathVariable widgetId: Long,
        @RequestBody request: WidgetRequest,
    ): ResponseEntity<WidgetResponse> {
        val widget = usuarioInicioPanelRepository.findById(widgetId)
            .filter { it.usuarioId == usuarioId }
            .orElse(null) ?: return ResponseEntity.notFound().build()

        widget.tipo = request.tipo
        widget.target = request.target
        widget.titulo = request.titulo
        widget.descripcion = request.descripcion
        widget.sizeW = validarSize(request.sizeW, widget.sizeW)
        widget.sizeH = validarSize(request.sizeH, widget.sizeH)
        widget.meta = request.meta ?: emptyMap()
        request.posicion?.let { widget.posicion = it.coerceAtLeast(0) }

        val actualizado = usuarioInicioPanelRepository.save(widget)
        return ResponseEntity.ok(actualizado.toResponse())
    }

    @DeleteMapping("/{widgetId}")
    fun eliminar(
        @PathVariable usuarioId: Long,
        @PathVariable widgetId: Long,
    ): ResponseEntity<Void> {
        val widget = usuarioInicioPanelRepository.findById(widgetId)
            .filter { it.usuarioId == usuarioId }
            .orElse(null) ?: return ResponseEntity.notFound().build()

        usuarioInicioPanelRepository.delete(widget)
        return ResponseEntity.noContent().build()
    }

    @PostMapping("/reordenar")
    fun reordenar(
        @PathVariable usuarioId: Long,
        @RequestBody request: ReordenRequest,
    ): ResponseEntity<List<WidgetResponse>> {
        if (!usuarioRepository.existsById(usuarioId)) {
            return ResponseEntity.notFound().build()
        }

        val widgets = usuarioInicioPanelRepository.findByUsuarioIdOrderByPosicionAsc(usuarioId)
        if (widgets.isEmpty()) {
            return ResponseEntity.ok(emptyList())
        }

        // Usar las posiciones específicas si se proporcionan, sino usar el orden del array
        request.positions.forEach { position ->
            val widget = widgets.find { it.id == position.id }
            if (widget != null && widget.posicion != position.posicion) {
                widget.posicion = position.posicion
                usuarioInicioPanelRepository.save(widget)
            }
        }

        // Fallback: asignar posiciones consecutivas si no se proporcionaron posiciones específicas
        if (request.positions.isEmpty()) {
            request.ids.forEachIndexed { index, widgetId ->
                val widget = widgets.find { it.id == widgetId }
                if (widget != null && widget.posicion != index) {
                    widget.posicion = index
                    usuarioInicioPanelRepository.save(widget)
                }
            }
        }

        val respuesta = usuarioInicioPanelRepository.findByUsuarioIdOrderByPosicionAsc(usuarioId)
            .map { it.toResponse() }
        return ResponseEntity.ok(respuesta)
    }

    private fun validarSize(valor: Int?, fallback: Int): Int =
        valor?.coerceIn(1, 4) ?: fallback.coerceIn(1, 4)

    private fun UsuarioInicioPanel.toResponse(): WidgetResponse =
        WidgetResponse(
            id = id,
            usuarioId = usuarioId,
            tipo = tipo,
            target = target,
            titulo = titulo,
            descripcion = descripcion,
            sizeW = sizeW,
            sizeH = sizeH,
            posicion = posicion,
            meta = meta ?: emptyMap(),
            creadoEn = creadoEn?.toString(),
            actualizadoEn = actualizadoEn?.toString(),
        )
}
