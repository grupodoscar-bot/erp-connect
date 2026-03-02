package com.example.demo.controller

import com.example.demo.model.Direccion
import com.example.demo.repository.DireccionRepository
import com.example.demo.repository.FabricanteRepository
import org.springframework.http.ResponseEntity
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/fabricantes/{fabricanteId}/direcciones")
@CrossOrigin(origins = ["http://145.223.103.219:3000"])
class FabricanteDireccionesController(
    private val fabricanteRepository: FabricanteRepository,
    private val direccionRepository: DireccionRepository
) {

    data class DireccionRequest(
        val pais: String,
        val codigoPostal: String? = null,
        val provincia: String? = null,
        val poblacion: String? = null,
        val direccion: String,
        val tipoDireccion: String? = null
    )

    private fun DireccionRequest.toEntity(fabricanteId: Long, index: Int) = Direccion(
        tipoTercero = Direccion.TipoTercero.FABRICANTE,
        idTercero = fabricanteId,
        pais = this.pais,
        codigoPostal = this.codigoPostal,
        provincia = this.provincia,
        poblacion = this.poblacion,
        direccion = this.direccion,
        tipoDireccion = if (index == 0) Direccion.TipoDireccion.FACTURACION else Direccion.TipoDireccion.ENVIO
    )

    @GetMapping
    fun listar(@PathVariable fabricanteId: Long): ResponseEntity<List<Direccion>> {
        if (!fabricanteRepository.existsById(fabricanteId)) {
            return ResponseEntity.notFound().build()
        }

        val direcciones = direccionRepository.findByTipoTerceroAndIdTercero(Direccion.TipoTercero.FABRICANTE, fabricanteId)
        return ResponseEntity.ok(direcciones)
    }

    @PutMapping
    @Transactional
    fun reemplazarTodas(
        @PathVariable fabricanteId: Long,
        @RequestBody direcciones: List<DireccionRequest>
    ): ResponseEntity<List<Direccion>> {
        if (!fabricanteRepository.existsById(fabricanteId)) {
            return ResponseEntity.notFound().build()
        }

        // Ensure at least one address exists (billing address)
        if (direcciones.isEmpty()) {
            return ResponseEntity.badRequest().build()
        }

        direccionRepository.deleteByTipoTerceroAndIdTercero(Direccion.TipoTercero.FABRICANTE, fabricanteId)
        val guardadas = direcciones.mapIndexed { index, req -> 
            direccionRepository.save(req.toEntity(fabricanteId, index)) 
        }
        return ResponseEntity.ok(guardadas)
    }
}
