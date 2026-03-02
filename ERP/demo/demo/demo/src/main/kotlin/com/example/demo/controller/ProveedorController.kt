package com.example.demo.controller

import com.example.demo.model.Proveedor
import com.example.demo.repository.ProveedorRepository
import com.example.demo.repository.AgrupacionRepository
import com.example.demo.repository.DireccionRepository
import org.springframework.http.ResponseEntity
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/proveedores")
@CrossOrigin(origins = ["http://145.223.103.219:3000"])
class ProveedorController(
    private val proveedorRepository: ProveedorRepository,
    private val agrupacionRepository: AgrupacionRepository,
    private val direccionRepository: DireccionRepository
) {

    @GetMapping
    fun listarTodos(): List<Proveedor> = proveedorRepository.findAll()

    @GetMapping("/{id}")
    fun obtenerPorId(@PathVariable id: Long): ResponseEntity<Proveedor> =
        proveedorRepository.findById(id)
            .map { ResponseEntity.ok(it) }
            .orElse(ResponseEntity.notFound().build())

    data class DireccionRequest(
        val pais: String,
        val codigoPostal: String? = null,
        val provincia: String? = null,
        val poblacion: String? = null,
        val direccion: String,
        val tipoDireccion: String = "ENVIO"
    )

    data class ProveedorRequest(
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
        val tarifa: String,
        val descuento: Double,
        val formaPago: String,
        val diasPago1: Int,
        val diasPago2: Int,
        val riesgoAutorizado: Double,
        val bloquearVentas: Boolean,
        val nombreEntidadBancaria: String,
        val cuentaCccEntidad: String,
        val cuentaCccOficina: String,
        val cuentaCccDc: String,
        val cuentaCccNumero: String,
        val cuentaIban: String,
        val cuentaIbanPais: String,
        val modoImpuesto: String,
        val retencion: String,
        val recargoEquivalencia: Boolean = false,
        val direcciones: List<DireccionRequest> = emptyList()
    )

    @PostMapping
    @Transactional
    fun crear(@RequestBody datos: ProveedorRequest): Proveedor {
        val agrupacion = datos.agrupacionId?.let { agrupacionRepository.findById(it).orElse(null) }

        val proveedor = Proveedor(
            nombreComercial = datos.nombreComercial,
            nombreFiscal = datos.nombreFiscal,
            nifCif = datos.nifCif,
            email = datos.email,
            web = datos.web,
            observaciones = datos.observaciones,
            telefonoFijo = datos.telefonoFijo,
            telefonoMovil = datos.telefonoMovil,
            fax = datos.fax,
            fechaNacimiento = datos.fechaNacimiento,
            agrupacion = agrupacion,
            tarifa = datos.tarifa,
            descuento = datos.descuento,
            formaPago = datos.formaPago,
            diasPago1 = datos.diasPago1,
            diasPago2 = datos.diasPago2,
            riesgoAutorizado = datos.riesgoAutorizado,
            bloquearVentas = datos.bloquearVentas,
            nombreEntidadBancaria = datos.nombreEntidadBancaria,
            cuentaCccEntidad = datos.cuentaCccEntidad,
            cuentaCccOficina = datos.cuentaCccOficina,
            cuentaCccDc = datos.cuentaCccDc,
            cuentaCccNumero = datos.cuentaCccNumero,
            cuentaIban = datos.cuentaIban,
            cuentaIbanPais = datos.cuentaIbanPais,
            modoImpuesto = datos.modoImpuesto,
            retencion = datos.retencion,
            recargoEquivalencia = datos.recargoEquivalencia
        )

        val guardado = proveedorRepository.save(proveedor)
        guardarDireccionesProveedor(guardado.id, datos.direcciones)
        return guardado
    }

    @PutMapping("/{id}")
    @Transactional
    fun actualizar(
        @PathVariable id: Long,
        @RequestBody datos: ProveedorRequest
    ): ResponseEntity<Proveedor> {
        return proveedorRepository.findById(id)
            .map { existente ->
                val agrupacion = datos.agrupacionId?.let { agrupacionRepository.findById(it).orElse(null) }
                val actualizado = existente.copy(
                    nombreComercial = datos.nombreComercial,
                    nombreFiscal = datos.nombreFiscal,
                    nifCif = datos.nifCif,
                    email = datos.email,
                    web = datos.web,
                    observaciones = datos.observaciones,
                    telefonoFijo = datos.telefonoFijo,
                    telefonoMovil = datos.telefonoMovil,
                    fax = datos.fax,
                    fechaNacimiento = datos.fechaNacimiento,
                    agrupacion = agrupacion,
                    tarifa = datos.tarifa,
                    descuento = datos.descuento,
                    formaPago = datos.formaPago,
                    diasPago1 = datos.diasPago1,
                    diasPago2 = datos.diasPago2,
                    riesgoAutorizado = datos.riesgoAutorizado,
                    bloquearVentas = datos.bloquearVentas,
                    nombreEntidadBancaria = datos.nombreEntidadBancaria,
                    cuentaCccEntidad = datos.cuentaCccEntidad,
                    cuentaCccOficina = datos.cuentaCccOficina,
                    cuentaCccDc = datos.cuentaCccDc,
                    cuentaCccNumero = datos.cuentaCccNumero,
                    cuentaIban = datos.cuentaIban,
                    cuentaIbanPais = datos.cuentaIbanPais,
                    modoImpuesto = datos.modoImpuesto,
                    retencion = datos.retencion,
                    recargoEquivalencia = datos.recargoEquivalencia
                )
                val proveedorActualizado = proveedorRepository.save(actualizado)
                guardarDireccionesProveedor(proveedorActualizado.id, datos.direcciones)
                ResponseEntity.ok(proveedorActualizado)
            }
            .orElse(ResponseEntity.notFound().build())
    }

    @DeleteMapping("/{id}")
    fun borrar(@PathVariable id: Long): ResponseEntity<Void> {
        return if (proveedorRepository.existsById(id)) {
            proveedorRepository.deleteById(id)
            ResponseEntity.noContent().build()
        } else {
            ResponseEntity.notFound().build()
        }
    }

    private fun guardarDireccionesProveedor(proveedorId: Long, direcciones: List<DireccionRequest>) {
        direccionRepository.deleteByTipoTerceroAndIdTercero(com.example.demo.model.Direccion.TipoTercero.PROVEEDOR, proveedorId)
        direcciones.forEach { dir ->
            val tipoDireccion = try {
                com.example.demo.model.Direccion.TipoDireccion.valueOf(dir.tipoDireccion.uppercase())
            } catch (e: Exception) {
                com.example.demo.model.Direccion.TipoDireccion.ENVIO
            }
            
            direccionRepository.save(
                com.example.demo.model.Direccion(
                    tipoTercero = com.example.demo.model.Direccion.TipoTercero.PROVEEDOR,
                    idTercero = proveedorId,
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
