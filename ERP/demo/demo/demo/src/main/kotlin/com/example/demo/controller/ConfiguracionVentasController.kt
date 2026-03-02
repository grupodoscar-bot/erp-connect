package com.example.demo.controller

import com.example.demo.model.ConfiguracionVentas
import com.example.demo.repository.ConfiguracionVentasRepository
import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.time.LocalDateTime

@RestController
@RequestMapping("/configuracion-ventas")
@CrossOrigin(origins = ["http://145.223.103.219:3000"])
class ConfiguracionVentasController(
    private val configuracionVentasRepository: ConfiguracionVentasRepository
) {

    companion object {
        private val objectMapper = jacksonObjectMapper()

        private val ESTADOS_POR_DEFECTO = listOf(
            EstadoDocumentoConfig("Pendiente", "#FDE68A55", "#92400E55"),
            EstadoDocumentoConfig("Emitido", "#BBF7D055", "#14532D55"),
            EstadoDocumentoConfig("Entregado", "#C7D2FE55", "#312E8155"),
            EstadoDocumentoConfig("Facturado", "#FBCFE855", "#701A7555"),
            EstadoDocumentoConfig("Cancelado", "#FECACA55", "#7F1D1D55")
        )
    }

    @GetMapping
    fun obtenerConfiguracion(): ResponseEntity<ConfiguracionVentasResponse> {
        val configuracion = configuracionVentasRepository.findTopByOrderByIdAsc()
            ?: configuracionVentasRepository.save(ConfiguracionVentas())
        return ResponseEntity.ok(configuracion.toResponse())
    }

    @PutMapping
    fun actualizarConfiguracion(@RequestBody request: ConfiguracionVentasRequest): ResponseEntity<ConfiguracionVentasResponse> {
        val configuracion = configuracionVentasRepository.findTopByOrderByIdAsc()
            ?: ConfiguracionVentas()

        configuracion.contabilizarAlbaran = request.contabilizarAlbaran ?: configuracion.contabilizarAlbaran
        configuracion.contabilizarPresupuesto = request.contabilizarPresupuesto ?: configuracion.contabilizarPresupuesto
        configuracion.documentoDescuentaStock = request.documentoDescuentaStock ?: configuracion.documentoDescuentaStock
        request.permitirVentaMultialmacen?.let { configuracion.permitirVentaMultialmacen = it }
        request.permitirVentaSinStock?.let { configuracion.permitirVentaSinStock = it }
        request.permitirMultitarifa?.let { configuracion.permitirMultitarifa = it }

        request.estadosAlbaran?.let {
            val normalizados = normalizarEstados(it)
            configuracion.estadosAlbaran = objectMapper.writeValueAsString(normalizados)
        }

        if (configuracion.estadosAlbaran.isBlank()) {
            configuracion.estadosAlbaran = objectMapper.writeValueAsString(ESTADOS_POR_DEFECTO)
        }

        configuracion.actualizadoEn = LocalDateTime.now()

        val guardado = configuracionVentasRepository.save(configuracion)
        return ResponseEntity.ok(guardado.toResponse())
    }

    private fun normalizarEstados(estados: List<EstadoDocumentoConfigPayload>): List<EstadoDocumentoConfig> {
        if (estados.isEmpty()) return ESTADOS_POR_DEFECTO
        val resultado = mutableListOf<EstadoDocumentoConfig>()
        val nombresUsados = mutableSetOf<String>()
        
        // Validar que existan los estados obligatorios
        val tienePendiente = estados.any { it.nombre?.trim()?.lowercase() == "pendiente" }
        val tieneEmitido = estados.any { it.nombre?.trim()?.lowercase() == "emitido" }
        
        if (!tienePendiente || !tieneEmitido) {
            throw IllegalArgumentException("Los estados 'Pendiente' y 'Emitido' son obligatorios y no pueden ser eliminados")
        }
        
        // Validar que no haya duplicados de Pendiente o Emitido
        var contadorPendiente = 0
        var contadorEmitido = 0

        estados.forEach { payload ->
            val nombreLimpio = payload.nombre?.trim().orEmpty()
            if (nombreLimpio.isEmpty()) return@forEach
            val clave = nombreLimpio.lowercase()
            
            // Contar estados protegidos
            if (clave == "pendiente") contadorPendiente++
            if (clave == "emitido") contadorEmitido++
            
            if (nombresUsados.contains(clave)) return@forEach

            resultado.add(
                EstadoDocumentoConfig(
                    nombre = nombreLimpio,
                    colorClaro = payload.colorClaro?.trim() ?: "#FDE68A55",
                    colorOscuro = payload.colorOscuro?.trim() ?: "#92400E55"
                )
            )
            nombresUsados.add(clave)
        }
        
        // Validar que no haya duplicados de estados protegidos
        if (contadorPendiente > 1) {
            throw IllegalArgumentException("No puede haber más de un estado 'Pendiente'")
        }
        if (contadorEmitido > 1) {
            throw IllegalArgumentException("No puede haber más de un estado 'Emitido'")
        }

        return if (resultado.isEmpty()) ESTADOS_POR_DEFECTO else resultado
    }

    private fun ConfiguracionVentas.estadosComoLista(): List<EstadoDocumentoConfig> {
        val contenido = this.estadosAlbaran.trim()
        if (contenido.isEmpty()) return ESTADOS_POR_DEFECTO

        return try {
            objectMapper.readValue(contenido, object : TypeReference<List<EstadoDocumentoConfig>>() {})
                .filter { it.nombre.isNotBlank() }
                .ifEmpty { ESTADOS_POR_DEFECTO }
        } catch (_: Exception) {
            contenido.split(",")
                .map { it.trim() }
                .filter { it.isNotEmpty() }
                .mapIndexed { index, nombre ->
                    val preset = ESTADOS_POR_DEFECTO.getOrNull(index) ?: ESTADOS_POR_DEFECTO[0]
                    EstadoDocumentoConfig(
                        nombre = nombre,
                        colorClaro = preset.colorClaro,
                        colorOscuro = preset.colorOscuro
                    )
                }
                .ifEmpty { ESTADOS_POR_DEFECTO }
        }
    }

    private fun ConfiguracionVentas.toResponse() = ConfiguracionVentasResponse(
        contabilizarAlbaran = this.contabilizarAlbaran,
        contabilizarPresupuesto = this.contabilizarPresupuesto,
        documentoDescuentaStock = this.documentoDescuentaStock,
        estadosAlbaran = this.estadosComoLista(),
        permitirVentaMultialmacen = this.permitirVentaMultialmacen,
        permitirVentaSinStock = this.permitirVentaSinStock,
        permitirMultitarifa = this.permitirMultitarifa,
        actualizadoEn = this.actualizadoEn
    )
}

data class ConfiguracionVentasRequest(
    val contabilizarAlbaran: String?,
    val contabilizarPresupuesto: String?,
    val documentoDescuentaStock: String?,
    val estadosAlbaran: List<EstadoDocumentoConfigPayload>?,
    val permitirVentaMultialmacen: Boolean?,
    val permitirVentaSinStock: Boolean?,
    val permitirMultitarifa: Boolean?
)

data class ConfiguracionVentasResponse(
    val contabilizarAlbaran: String,
    val contabilizarPresupuesto: String,
    val documentoDescuentaStock: String,
    val estadosAlbaran: List<EstadoDocumentoConfig>,
    val permitirVentaMultialmacen: Boolean,
    val permitirVentaSinStock: Boolean,
    val permitirMultitarifa: Boolean,
    val actualizadoEn: LocalDateTime?
)

data class EstadoDocumentoConfigPayload(
    val nombre: String?,
    val colorClaro: String?,
    val colorOscuro: String?
)

data class EstadoDocumentoConfig(
    val nombre: String,
    val colorClaro: String,
    val colorOscuro: String
)
