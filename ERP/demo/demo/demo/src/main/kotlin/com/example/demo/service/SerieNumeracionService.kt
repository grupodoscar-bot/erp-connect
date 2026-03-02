package com.example.demo.service

import com.example.demo.model.SerieDocumento
import com.example.demo.model.SerieSecuencia
import com.example.demo.repository.SerieDocumentoRepository
import com.example.demo.repository.SerieSecuenciaRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.time.OffsetDateTime

@Service
class SerieNumeracionService(
    private val serieDocumentoRepository: SerieDocumentoRepository,
    private val serieSecuenciaRepository: SerieSecuenciaRepository
) {

    data class NumeroSerieResult(
        val serie: SerieDocumento,
        val anio: Int,
        val secuencial: Long,
        val codigo: String
    )

    @Transactional(readOnly = true)
    fun previsualizarNumero(tipoDocumento: String, serieId: Long?, usuarioId: Long? = null): NumeroSerieResult {
        val serie = obtenerSerieAplicable(tipoDocumento, serieId, usuarioId)
        val anioActual = LocalDate.now().year
        val secuencia = serieSecuenciaRepository.findBySerieIdAndAnio(serie.id, anioActual)
        val secuencial = secuencia?.siguienteNumero ?: 1L
        val codigo = construirCodigo(serie.prefijo, secuencial, serie.longitudCorrelativo)
        return NumeroSerieResult(serie, anioActual, secuencial, codigo)
    }

    @Transactional
    fun generarYReservarNumero(tipoDocumento: String, serieId: Long?, usuarioId: Long? = null): NumeroSerieResult {
        val serie = obtenerSerieAplicable(tipoDocumento, serieId, usuarioId)
        val anioActual = LocalDate.now().year
        val secuencia = obtenerSecuenciaParaActualizacion(serie, anioActual)
        val secuencialAsignado = secuencia.siguienteNumero
        secuencia.siguienteNumero = secuencia.siguienteNumero + 1
        secuencia.actualizadoEn = OffsetDateTime.now()
        serieSecuenciaRepository.save(secuencia)
        val codigo = construirCodigo(serie.prefijo, secuencialAsignado, serie.longitudCorrelativo)
        return NumeroSerieResult(serie, anioActual, secuencialAsignado, codigo)
    }

    fun obtenerSerieAplicable(tipoDocumento: String, serieId: Long?, usuarioId: Long?): SerieDocumento {
        if (serieId != null) {
            return serieDocumentoRepository.findById(serieId)
                .orElseThrow { IllegalArgumentException("Serie no encontrada con id: $serieId") }
        }

        if (usuarioId != null) {
            val preferenciaUsuario = serieDocumentoRepository.findPreferenciaUsuario(usuarioId, tipoDocumento)
            if (preferenciaUsuario != null) {
                return preferenciaUsuario
            }
        }

        return serieDocumentoRepository.findByTipoDocumentoAndDefaultSistema(tipoDocumento, true)
            ?: serieDocumentoRepository.findByTipoDocumentoAndActivo(tipoDocumento, true).firstOrNull()
            ?: throw IllegalStateException("No hay series configuradas para el tipo de documento $tipoDocumento")
    }

    private fun construirCodigo(prefijo: String, secuencial: Long, longitud: Int): String {
        val correlativo = secuencial.toString().padStart(longitud, '0')
        return "$prefijo-$correlativo"
    }

    private fun obtenerSecuenciaParaActualizacion(serie: SerieDocumento, anio: Int): SerieSecuencia {
        val existente = serieSecuenciaRepository.findBySerieIdAndAnioForUpdate(serie.id, anio)
        if (existente != null) {
            return existente
        }
        val nuevaSecuencia = SerieSecuencia(
            serie = serie,
            anio = anio,
            siguienteNumero = 1,
            actualizadoEn = OffsetDateTime.now()
        )
        return serieSecuenciaRepository.save(nuevaSecuencia)
    }
}
