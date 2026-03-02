package com.example.demo.controller

import com.example.demo.model.Cliente
import com.example.demo.repository.AgrupacionRepository
import com.example.demo.repository.ClienteRepository
import com.example.demo.repository.DireccionRepository
import com.example.demo.repository.TarifaRepository
import com.example.demo.repository.ventas.AlbaranRepository
import org.springframework.http.ResponseEntity
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/clientes")
@CrossOrigin(origins = ["http://145.223.103.219:3000"])
class ClienteController(
    private val clienteRepository: ClienteRepository,
    private val agrupacionRepository: AgrupacionRepository,
    private val direccionRepository: DireccionRepository,
    private val albaranRepository: AlbaranRepository,
    private val tarifaRepository: TarifaRepository
) {

    @GetMapping
    fun listarTodos(): List<Cliente> = clienteRepository.findAll()

    @GetMapping("/{id}")
    fun obtenerPorId(@PathVariable id: Long): ResponseEntity<Cliente> =
        clienteRepository.findById(id)
            .map { ResponseEntity.ok(it) }
            .orElse(ResponseEntity.notFound().build())

    data class ClienteRequest(
        val nombreComercial: String,
        val nombreFiscal: String,
        val nifCif: String,
        val email: String,
        val web: String,
        val observaciones: String,
        val telefonoFijo: String,
        val telefonoMovil: String,
        val fax: String,
        val fechaNacimiento: java.time.LocalDate?,
        val agrupacionId: Long?,
        val tarifaId: Long?,
        val tarifa: String,
        val descuento: Double,
        val formaPago: String,
        val diasPago1: Int,
        val diasPago2: Int,
        val riesgoAutorizado: Double,
        val bloquearVentas: Boolean,
        val recargoEquivalencia: Boolean,
        val nombreEntidadBancaria: String,
        val cuentaCccEntidad: String,
        val cuentaCccOficina: String,
        val cuentaCccDc: String,
        val cuentaCccNumero: String,
        val cuentaIban: String,
        val cuentaIbanPais: String,
        val modoImpuesto: String,
        val retencion: String,
        val direcciones: List<DireccionRequest> = emptyList()
    )

    data class DireccionRequest(
        val id: Long? = null,
        val pais: String,
        val codigoPostal: String? = null,
        val provincia: String? = null,
        val poblacion: String? = null,
        val direccion: String
    )

    @PostMapping
    @Transactional
    fun crear(@RequestBody request: ClienteRequest): Cliente {
        val agrupacion = if (request.agrupacionId != null) {
            agrupacionRepository.findById(request.agrupacionId).orElse(null)
        } else null

        val tarifaAsignada = if (request.tarifaId != null) {
            tarifaRepository.findById(request.tarifaId).orElse(null)
        } else null

        val cliente = Cliente(
            nombreComercial = request.nombreComercial,
            nombreFiscal = request.nombreFiscal,
            nifCif = request.nifCif,
            email = request.email,
            web = request.web,
            observaciones = request.observaciones,
            telefonoFijo = request.telefonoFijo,
            telefonoMovil = request.telefonoMovil,
            fax = request.fax,
            fechaNacimiento = request.fechaNacimiento,
            agrupacion = agrupacion,
            tarifaAsignada = tarifaAsignada,
            tarifa = request.tarifa,
            descuento = request.descuento,
            formaPago = request.formaPago,
            diasPago1 = request.diasPago1,
            diasPago2 = request.diasPago2,
            riesgoAutorizado = request.riesgoAutorizado,
            bloquearVentas = request.bloquearVentas,
            recargoEquivalencia = request.recargoEquivalencia,
            nombreEntidadBancaria = request.nombreEntidadBancaria,
            cuentaCccEntidad = request.cuentaCccEntidad,
            cuentaCccOficina = request.cuentaCccOficina,
            cuentaCccDc = request.cuentaCccDc,
            cuentaCccNumero = request.cuentaCccNumero,
            cuentaIban = request.cuentaIban,
            cuentaIbanPais = request.cuentaIbanPais,
            modoImpuesto = request.modoImpuesto,
            retencion = request.retencion
        )
        val guardado = clienteRepository.save(cliente)
        guardarDireccionesCliente(guardado.id, request.direcciones)
        return guardado
    }

    @PutMapping("/{id}")
    @Transactional
    fun actualizar(
        @PathVariable id: Long,
        @RequestBody request: ClienteRequest
    ): ResponseEntity<Cliente> {
        return clienteRepository.findById(id)
            .map { existente ->
                val agrupacion = if (request.agrupacionId != null) {
                    agrupacionRepository.findById(request.agrupacionId).orElse(null)
                } else null

                val tarifaAsignada = if (request.tarifaId != null) {
                    tarifaRepository.findById(request.tarifaId).orElse(null)
                } else null

                val actualizado = existente.copy(
                    nombreComercial = request.nombreComercial,
                    nombreFiscal = request.nombreFiscal,
                    nifCif = request.nifCif,
                    email = request.email,
                    web = request.web,
                    observaciones = request.observaciones,
                    telefonoFijo = request.telefonoFijo,
                    telefonoMovil = request.telefonoMovil,
                    fax = request.fax,
                    fechaNacimiento = request.fechaNacimiento,
                    agrupacion = agrupacion,
                    tarifaAsignada = tarifaAsignada,
                    tarifa = request.tarifa,
                    descuento = request.descuento,
                    formaPago = request.formaPago,
                    diasPago1 = request.diasPago1,
                    diasPago2 = request.diasPago2,
                    riesgoAutorizado = request.riesgoAutorizado,
                    bloquearVentas = request.bloquearVentas,
                    recargoEquivalencia = request.recargoEquivalencia,
                    nombreEntidadBancaria = request.nombreEntidadBancaria,
                    cuentaCccEntidad = request.cuentaCccEntidad,
                    cuentaCccOficina = request.cuentaCccOficina,
                    cuentaCccDc = request.cuentaCccDc,
                    cuentaCccNumero = request.cuentaCccNumero,
                    cuentaIban = request.cuentaIban,
                    cuentaIbanPais = request.cuentaIbanPais,
                    modoImpuesto = request.modoImpuesto,
                    retencion = request.retencion
                )
                val clienteActualizado = clienteRepository.save(actualizado)
                guardarDireccionesCliente(clienteActualizado.id, request.direcciones)
                ResponseEntity.ok(clienteActualizado)
            }
            .orElse(ResponseEntity.notFound().build())
    }

    @DeleteMapping("/{id}")
    fun borrar(@PathVariable id: Long): ResponseEntity<Void> {
        return if (clienteRepository.existsById(id)) {
            clienteRepository.deleteById(id)
            ResponseEntity.noContent().build()
        } else {
            ResponseEntity.notFound().build()
        }
    }

    private fun guardarDireccionesCliente(clienteId: Long, direcciones: List<DireccionRequest>) {
        val direccionesNormalizadas = direcciones.ifEmpty {
            return
        }

        val existentes = direccionRepository
            .findByTipoTerceroAndIdTercero(com.example.demo.model.Direccion.TipoTercero.CLIENTE, clienteId)
        val existentesPorId = existentes.associateBy { it.id }

        direccionesNormalizadas.forEachIndexed { index, dir ->
            val tipoDireccion = if (index == 0) {
                com.example.demo.model.Direccion.TipoDireccion.FACTURACION
            } else {
                com.example.demo.model.Direccion.TipoDireccion.ENVIO
            }

            val existente = dir.id?.let { existentesPorId[it] }
            if (existente != null) {
                direccionRepository.save(
                    existente.copy(
                        pais = dir.pais,
                        codigoPostal = dir.codigoPostal,
                        provincia = dir.provincia,
                        poblacion = dir.poblacion,
                        direccion = dir.direccion,
                        tipoDireccion = tipoDireccion
                    )
                )
            } else {
                direccionRepository.save(
                    com.example.demo.model.Direccion(
                        tipoTercero = com.example.demo.model.Direccion.TipoTercero.CLIENTE,
                        idTercero = clienteId,
                        pais = dir.pais,
                        codigoPostal = dir.codigoPostal,
                        provincia = dir.provincia,
                        poblacion = dir.poblacion,
                        direccion = dir.direccion,
                        tipoDireccion = tipoDireccion
                    )
                )
            }
        }
    }
}
