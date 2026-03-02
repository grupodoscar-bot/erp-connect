package com.example.demo.controller

import com.example.demo.model.*
import com.example.demo.model.ventas.*
import com.example.demo.repository.ClienteRepository
import com.example.demo.repository.DireccionRepository
import com.example.demo.repository.EmpresaRepository
import com.example.demo.repository.PlantillaPdfRepository
import com.example.demo.repository.ProductoRepository
import com.example.demo.service.AlbaranPdfService
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.time.LocalDateTime

@RestController
@RequestMapping("/plantillas-pdf")
@CrossOrigin(origins = ["http://145.223.103.219:3000"])
class PlantillaPdfController(
    private val plantillaPdfRepository: PlantillaPdfRepository,
    private val albaranPdfService: AlbaranPdfService,
    private val empresaRepository: EmpresaRepository,
    private val clienteRepository: ClienteRepository,
    private val productoRepository: ProductoRepository,
    private val direccionRepository: DireccionRepository
) {

    @GetMapping
    fun listarTodas(): List<PlantillaPdf> =
        plantillaPdfRepository.findAll()

    @GetMapping("/activa")
    fun obtenerActiva(): ResponseEntity<PlantillaPdf> {
        val plantilla = plantillaPdfRepository.findByActivaTrue()
            ?: plantillaPdfRepository.findAll().firstOrNull()
        
        return if (plantilla != null) {
            ResponseEntity.ok(plantilla)
        } else {
            ResponseEntity.notFound().build()
        }
    }

    @GetMapping("/{id}")
    fun obtenerPorId(@PathVariable id: Long): ResponseEntity<PlantillaPdf> =
        plantillaPdfRepository.findById(id)
            .map { ResponseEntity.ok(it) }
            .orElse(ResponseEntity.notFound().build())

    @PostMapping
    fun crear(@RequestBody plantilla: PlantillaPdf): ResponseEntity<PlantillaPdf> {
        // Si la nueva plantilla es activa, desactivar las demás
        if (plantilla.activa) {
            plantillaPdfRepository.findAll().forEach { p ->
                if (p.activa) {
                    plantillaPdfRepository.save(p.copy(activa = false))
                }
            }
        }
        
        val nueva = plantillaPdfRepository.save(plantilla)
        return ResponseEntity.ok(nueva)
    }

    @PutMapping("/{id}")
    fun actualizar(
        @PathVariable id: Long,
        @RequestBody datos: PlantillaPdf
    ): ResponseEntity<PlantillaPdf> {
        return plantillaPdfRepository.findById(id)
            .map { existente ->
                // Si se activa esta plantilla, desactivar las demás
                if (datos.activa && !existente.activa) {
                    plantillaPdfRepository.findAll().forEach { p ->
                        if (p.id != id && p.activa) {
                            plantillaPdfRepository.save(p.copy(activa = false))
                        }
                    }
                }
                
                val actualizado = existente.copy(
                    nombre = datos.nombre,
                    mostrarLogo = datos.mostrarLogo,
                    mostrarEmpresa = datos.mostrarEmpresa,
                    mostrarCliente = datos.mostrarCliente,
                    mostrarDatosAlbaran = datos.mostrarDatosAlbaran,
                    mostrarObservaciones = datos.mostrarObservaciones,
                    mostrarPiePagina = datos.mostrarPiePagina,
                    empresaMostrarRazon = datos.empresaMostrarRazon,
                    empresaMostrarCif = datos.empresaMostrarCif,
                    empresaMostrarDireccion = datos.empresaMostrarDireccion,
                    empresaMostrarTelefono = datos.empresaMostrarTelefono,
                    empresaMostrarEmail = datos.empresaMostrarEmail,
                    clienteMostrarNif = datos.clienteMostrarNif,
                    clienteMostrarDireccion = datos.clienteMostrarDireccion,
                    clienteMostrarTelefono = datos.clienteMostrarTelefono,
                    clienteMostrarEmail = datos.clienteMostrarEmail,
                    productoMostrarReferencia = datos.productoMostrarReferencia,
                    productoMostrarDescuento = datos.productoMostrarDescuento,
                    productoMostrarSubtotal = datos.productoMostrarSubtotal,
                    productoMostrarObservaciones = datos.productoMostrarObservaciones,
                    layoutEmpresaCliente = datos.layoutEmpresaCliente,
                    layoutTablaProductos = datos.layoutTablaProductos,
                    colorPrimario = datos.colorPrimario,
                    tamanoFuente = datos.tamanoFuente,
                    estiloTabla = datos.estiloTabla,
                    textoTitulo = datos.textoTitulo,
                    textoPiePagina = datos.textoPiePagina,
                    repetirEncabezados = datos.repetirEncabezados,
                    activa = datos.activa
                )
                ResponseEntity.ok(plantillaPdfRepository.save(actualizado))
            }
            .orElse(ResponseEntity.notFound().build())
    }

    @DeleteMapping("/{id}")
    fun borrar(@PathVariable id: Long): ResponseEntity<Void> {
        val plantilla = plantillaPdfRepository.findById(id).orElse(null)
            ?: return ResponseEntity.notFound().build()

        if (plantilla.activa) {
            val otras = plantillaPdfRepository.findAll().filter { it.id != id }
            if (otras.isEmpty()) {
                return ResponseEntity.badRequest().build()
            }

            val nuevaActiva = otras.first()
            plantillaPdfRepository.save(nuevaActiva.copy(activa = true))
        }

        plantillaPdfRepository.deleteById(id)
        return ResponseEntity.noContent().build()
    }

    @PostMapping("/{id}/activar")
    fun activar(@PathVariable id: Long): ResponseEntity<PlantillaPdf> {
        return plantillaPdfRepository.findById(id)
            .map { plantilla ->
                // Desactivar todas las demás
                plantillaPdfRepository.findAll().forEach { p ->
                    if (p.id != id && p.activa) {
                        plantillaPdfRepository.save(p.copy(activa = false))
                    }
                }
                
                // Activar esta
                val activada = plantilla.copy(activa = true)
                ResponseEntity.ok(plantillaPdfRepository.save(activada))
            }
            .orElse(ResponseEntity.notFound().build())
    }

    @PostMapping("/preview")
    fun generarPreview(@RequestBody plantilla: PlantillaPdf): ResponseEntity<ByteArray> {
        try {
            // Crear datos de ejemplo
            val empresaEjemplo = empresaRepository.findAll().firstOrNull() ?: Empresa(
                nombreComercial = "Empresa Ejemplo S.L.",
                razon = "Empresa Ejemplo S.L.",
                cif = "B12345678",
                direccion = "Calle Ejemplo, 123",
                telefono = "912345678",
                email = "info@ejemplo.com"
            )

            val clienteExistente = clienteRepository.findAll().firstOrNull()
            val direccionesCliente = clienteExistente?.id?.let { id ->
                direccionRepository.findByTipoTerceroAndIdTercero(Direccion.TipoTercero.CLIENTE, id)
            } ?: emptyList()
            val clienteEjemplo = clienteExistente ?: Cliente(
                nombreComercial = "Cliente Ejemplo",
                nombreFiscal = "Cliente Ejemplo",
                nifCif = "12345678A",
                telefonoFijo = "923456789",
                email = "cliente@ejemplo.com"
            )

            val productosEjemplo = productoRepository.findAll().take(3).ifEmpty {
                listOf(
                    Producto(id = 1, nombre = "Producto 1", referencia = "REF-001", precio = 10.0),
                    Producto(id = 2, nombre = "Producto 2", referencia = "REF-002", precio = 25.0),
                    Producto(id = 3, nombre = "Producto 3", referencia = "REF-003", precio = 15.0)
                )
            }

            val lineasEjemplo = productosEjemplo.mapIndexed { index, producto ->
                AlbaranLinea(
                    id = index.toLong() + 1,
                    producto = producto,
                    cantidad = (index + 1) * 2,
                    precioUnitario = producto.precio,
                    descuento = if (index == 1) 10.0 else 0.0,
                    observaciones = if (index == 0) "Observación de ejemplo" else ""
                )
            }.toMutableList()

            val subtotal = lineasEjemplo.sumOf { it.cantidad * it.precioUnitario }
            val descuentoTotal = lineasEjemplo.sumOf { (it.cantidad * it.precioUnitario) * (it.descuento / 100) }
            val total = subtotal - descuentoTotal

            val albaranEjemplo = Albaran(
                id = 1,
                numero = "ALB-001",
                fecha = LocalDateTime.now(),
                cliente = clienteEjemplo,
                observaciones = "Este es un ejemplo de albarán para previsualizar la plantilla",
                estado = "Pendiente",
                subtotal = subtotal,
                descuentoTotal = descuentoTotal,
                total = total,
                lineas = lineasEjemplo
            )

            // Guardar plantilla temporalmente para generar PDF
            val plantillaTemp = plantillaPdfRepository.save(plantilla.copy(activa = false))
            val pdfBytes = albaranPdfService.generarPdf(albaranEjemplo, plantillaTemp.id)
            
            // Eliminar plantilla temporal si no tenía ID (era nueva)
            if (plantilla.id == 0L) {
                plantillaPdfRepository.deleteById(plantillaTemp.id)
            }

            return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=preview.pdf")
                .body(pdfBytes)
        } catch (e: Exception) {
            e.printStackTrace()
            return ResponseEntity.internalServerError().build()
        }
    }
}
