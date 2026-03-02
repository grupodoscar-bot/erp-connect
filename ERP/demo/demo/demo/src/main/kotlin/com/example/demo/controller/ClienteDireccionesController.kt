package com.example.demo.controller

import com.example.demo.model.Direccion
import com.example.demo.repository.ClienteRepository
import com.example.demo.repository.DireccionRepository
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.CrossOrigin
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/clientes/{clienteId}/direcciones")
@CrossOrigin(origins = ["http://145.223.103.219:3000"])
class ClienteDireccionesController(
    private val clienteRepository: ClienteRepository,
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

    private fun DireccionRequest.toEntity(clienteId: Long, index: Int): Direccion = Direccion(
        tipoTercero = Direccion.TipoTercero.CLIENTE,
        idTercero = clienteId,
        pais = this.pais,
        codigoPostal = this.codigoPostal,
        provincia = this.provincia,
        poblacion = this.poblacion,
        direccion = this.direccion,
        tipoDireccion = if (index == 0) Direccion.TipoDireccion.FACTURACION else Direccion.TipoDireccion.ENVIO
    )

    @GetMapping
    fun listar(@PathVariable clienteId: Long): ResponseEntity<List<Direccion>> {
        if (!clienteRepository.existsById(clienteId)) {
            return ResponseEntity.notFound().build()
        }

        val direcciones = direccionRepository.findByTipoTerceroAndIdTercero(Direccion.TipoTercero.CLIENTE, clienteId)
        return ResponseEntity.ok(direcciones)
    }

    @PutMapping
    fun reemplazarTodas(
        @PathVariable clienteId: Long,
        @RequestBody direcciones: List<DireccionRequest>
    ): ResponseEntity<List<Direccion>> {
        if (!clienteRepository.existsById(clienteId)) {
            return ResponseEntity.notFound().build()
        }

        // Ensure at least one address exists (billing address)
        if (direcciones.isEmpty()) {
            return ResponseEntity.badRequest().build()
        }

        direccionRepository.deleteByTipoTerceroAndIdTercero(Direccion.TipoTercero.CLIENTE, clienteId)
        val guardadas = direcciones.mapIndexed { index, req -> 
            direccionRepository.save(req.toEntity(clienteId, index)) 
        }
        return ResponseEntity.ok(guardadas)
    }
}
