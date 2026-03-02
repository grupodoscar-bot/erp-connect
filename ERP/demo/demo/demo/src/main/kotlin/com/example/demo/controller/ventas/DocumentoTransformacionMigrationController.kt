package com.example.demo.controller.ventas

import com.example.demo.repository.ventas.*
import jakarta.persistence.EntityManager
import org.springframework.http.ResponseEntity
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/documento-transformaciones-migration")
@CrossOrigin(origins = ["http://145.223.103.219:3000"])
class DocumentoTransformacionMigrationController(
    private val documentoTransformacionRepository: DocumentoTransformacionRepository,
    private val albaranRepository: AlbaranRepository,
    private val facturaRepository: FacturaRepository,
    private val facturaProformaRepository: FacturaProformaRepository,
    private val facturaRectificativaRepository: FacturaRectificativaRepository,
    private val pedidoRepository: PedidoRepository,
    private val presupuestoRepository: PresupuestoRepository,
    private val entityManager: EntityManager
) {

    @PostMapping("/actualizar-numeros")
    @GetMapping("/actualizar-numeros")
    @Transactional
    fun actualizarNumerosTransformaciones(): ResponseEntity<Map<String, Any>> {
        var actualizadas = 0
        var errores = 0
        
        // Obtener IDs de transformaciones con números vacíos
        val queryIds = entityManager.createNativeQuery(
            "SELECT id, tipo_origen, id_origen, tipo_destino, id_destino FROM documento_transformaciones WHERE numero_origen IS NULL OR numero_destino IS NULL OR numero_origen = '' OR numero_destino = ''"
        )
        
        @Suppress("UNCHECKED_CAST")
        val resultados = queryIds.resultList as List<Array<Any>>
        
        resultados.forEach { row ->
            try {
                val id = (row[0] as Number).toLong()
                val tipoOrigen = row[1] as String
                val idOrigen = (row[2] as Number).toLong()
                val tipoDestino = row[3] as String
                val idDestino = (row[4] as Number).toLong()
                
                val numeroOrigen = obtenerNumeroDocumento(tipoOrigen, idOrigen)
                val numeroDestino = obtenerNumeroDocumento(tipoDestino, idDestino)
                
                if (numeroOrigen != null || numeroDestino != null) {
                    val updateQuery = entityManager.createNativeQuery(
                        "UPDATE documento_transformaciones SET numero_origen = COALESCE(:numeroOrigen, numero_origen), numero_destino = COALESCE(:numeroDestino, numero_destino) WHERE id = :id"
                    )
                    updateQuery.setParameter("numeroOrigen", numeroOrigen)
                    updateQuery.setParameter("numeroDestino", numeroDestino)
                    updateQuery.setParameter("id", id)
                    updateQuery.executeUpdate()
                    actualizadas++
                }
            } catch (e: Exception) {
                errores++
                println("Error procesando transformación: ${e.message}")
                e.printStackTrace()
            }
        }

        return ResponseEntity.ok(mapOf(
            "total" to resultados.size,
            "actualizadas" to actualizadas,
            "errores" to errores,
            "mensaje" to "Migración completada"
        ))
    }

    private fun obtenerNumeroDocumento(tipo: String, id: Long): String? {
        return try {
            when (tipo) {
                "ALBARAN" -> albaranRepository.findById(id).map { it.numero }.orElse(null)
                "FACTURA" -> facturaRepository.findById(id).map { it.numero }.orElse(null)
                "FACTURA_PROFORMA" -> facturaProformaRepository.findById(id).map { it.numero }.orElse(null)
                "FACTURA_RECTIFICATIVA" -> facturaRectificativaRepository.findById(id).map { it.numero }.orElse(null)
                "PEDIDO" -> pedidoRepository.findById(id).map { it.numero }.orElse(null)
                "PRESUPUESTO" -> presupuestoRepository.findById(id).map { it.numero }.orElse(null)
                else -> null
            }
        } catch (e: Exception) {
            null
        }
    }
}
