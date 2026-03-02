package com.example.demo.controller

import com.example.demo.model.Direccion
import com.example.demo.repository.DireccionRepository
import com.example.demo.repository.ProveedorRepository
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.CrossOrigin
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/proveedores/{proveedorId}/direcciones")
@CrossOrigin(origins = ["http://145.223.103.219:3000"])
class ProveedorDireccionesController(
    private val proveedorRepository: ProveedorRepository,
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

    data class DireccionResponse(
        val id: Long,
        val pais: String,
        val codigoPostal: String?,
        val provincia: String?,
        val poblacion: String?,
        val direccion: String,
        val tipoDireccion: String
    )

    private fun DireccionRequest.toEntity(proveedorId: Long, index: Int) = Direccion(
        tipoTercero = Direccion.TipoTercero.PROVEEDOR,
        idTercero = proveedorId,
        pais = this.pais,
        codigoPostal = this.codigoPostal,
        provincia = this.provincia,
        poblacion = this.poblacion,
        direccion = this.direccion,
        tipoDireccion = if (index == 0) Direccion.TipoDireccion.FACTURACION else Direccion.TipoDireccion.ENVIO
    )

    private fun Direccion.toResponse() = DireccionResponse(
        id = this.id,
        pais = this.pais,
        codigoPostal = this.codigoPostal,
        provincia = this.provincia,
        poblacion = this.poblacion,
        direccion = this.direccion,
        tipoDireccion = this.tipoDireccion.name
    )

    @GetMapping
    fun listar(@PathVariable proveedorId: Long): ResponseEntity<List<DireccionResponse>> {
        if (!proveedorRepository.existsById(proveedorId)) {
            return ResponseEntity.notFound().build()
        }

        val direcciones = direccionRepository
            .findByTipoTerceroAndIdTercero(Direccion.TipoTercero.PROVEEDOR, proveedorId)
            .map { it.toResponse() }
        return ResponseEntity.ok(direcciones)
    }

    @PutMapping
    fun reemplazarTodas(
        @PathVariable proveedorId: Long,
        @RequestBody direcciones: List<DireccionRequest>
    ): ResponseEntity<List<Direccion>> {
        if (!proveedorRepository.existsById(proveedorId)) {
            return ResponseEntity.notFound().build()
        }

        // Ensure at least one address exists (billing address)
        if (direcciones.isEmpty()) {
            return ResponseEntity.badRequest().build()
        }

        direccionRepository.deleteByTipoTerceroAndIdTercero(Direccion.TipoTercero.PROVEEDOR, proveedorId)
        val guardadas = direcciones.mapIndexed { index, req -> 
            direccionRepository.save(req.toEntity(proveedorId, index)) 
        }
        return ResponseEntity.ok(guardadas)
    }
}
