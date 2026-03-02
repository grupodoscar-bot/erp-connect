package com.example.demo.controller.ventas

import com.example.demo.model.ventas.FacturaSimplificada
import com.example.demo.model.ventas.FacturaSimplificadaLinea
import com.example.demo.model.ProductoAlmacen
import com.example.demo.repository.AlmacenRepository
import com.example.demo.repository.ClienteRepository
import com.example.demo.repository.ProductoAlmacenRepository
import com.example.demo.repository.ProductoRepository
import com.example.demo.repository.TipoIvaRepository
import com.example.demo.repository.ventas.FacturaSimplificadaRepository
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

@RestController
@RequestMapping("/facturas-simplificadas")
@CrossOrigin(origins = ["http://145.223.103.219:3000"])
class FacturaSimplificadaController(
    private val facturaSimplificadaRepository: FacturaSimplificadaRepository,
    private val clienteRepository: ClienteRepository,
    private val productoRepository: ProductoRepository,
    private val productoAlmacenRepository: ProductoAlmacenRepository,
    private val almacenRepository: AlmacenRepository,
    private val tipoIvaRepository: TipoIvaRepository
) {

    @GetMapping
    fun listarTodas(): List<FacturaSimplificada> =
        facturaSimplificadaRepository.findAll()

    @GetMapping("/{id}")
    fun obtenerPorId(@PathVariable id: Long): ResponseEntity<FacturaSimplificada> =
        facturaSimplificadaRepository.findById(id)
            .map { ResponseEntity.ok(it) }
            .orElse(ResponseEntity.notFound().build())

    @GetMapping("/siguiente-numero")
    fun obtenerSiguienteNumero(): ResponseEntity<Map<String, String>> {
        val ultimaFactura = facturaSimplificadaRepository.findLastFacturaSimplificada()
        val siguienteNumero = if (ultimaFactura != null) {
            val numeroActual = ultimaFactura.numero.replace("TPV-", "").replace("-", "").toIntOrNull() ?: 0
            "TPV-${String.format("%08d", numeroActual + 1)}"
        } else {
            "TPV-00000001"
        }
        return ResponseEntity.ok(mapOf("numero" to siguienteNumero))
    }

    @PostMapping
    fun crear(@RequestBody request: FacturaSimplificadaRequest): ResponseEntity<Any> {
        try {
            val cliente = request.clienteId?.let { clienteRepository.findById(it).orElse(null) }
            
            // Verificar si el número ya existe
            var numeroFactura = request.numero
            if (facturaSimplificadaRepository.existsByNumero(numeroFactura)) {
                val ultimaFactura = facturaSimplificadaRepository.findTopByOrderByIdDesc()
                numeroFactura = if (ultimaFactura != null) {
                    val ultimoNumero = ultimaFactura.numero.replace("TPV-", "").replace("-", "").toIntOrNull() ?: 0
                    "TPV-${String.format("%08d", ultimoNumero + 1)}"
                } else {
                    "TPV-00000001"
                }
            }
            
            // Crear factura simplificada
            val formatter = DateTimeFormatter.ISO_DATE_TIME
            val fechaParseada = LocalDateTime.parse(request.fecha, formatter)

            val nuevaFactura = FacturaSimplificada(
                numero = numeroFactura,
                fecha = fechaParseada,
                cliente = cliente,
                observaciones = request.observaciones ?: "",
                estado = request.estado,
                subtotal = request.subtotal,
                descuentoTotal = request.descuentoTotal,
                total = request.total,
                contabilizado = request.contabilizado
            )
            
            // Guardar factura
            val facturaGuardada = facturaSimplificadaRepository.save(nuevaFactura)
            
            // Crear y agregar líneas
            request.lineas.forEach { lineaReq ->
                val producto = productoRepository.findById(lineaReq.productoId).orElse(null)
                val tipoIva = lineaReq.tipoIvaId?.let { tipoIvaRepository.findById(it).orElse(null) }
                
                val linea = FacturaSimplificadaLinea(
                    facturaSimplificada = facturaGuardada,
                    producto = producto,
                    descripcion = lineaReq.descripcion,
                    cantidad = lineaReq.cantidad,
                    precioUnitario = lineaReq.precioUnitario,
                    descuento = lineaReq.descuento,
                    tipoIva = tipoIva,
                    porcentajeIva = lineaReq.porcentajeIva,
                    porcentajeRecargo = lineaReq.porcentajeRecargo,
                    importeIva = lineaReq.importeIva,
                    importeRecargo = lineaReq.importeRecargo,
                    importeTotalLinea = lineaReq.importeTotalLinea
                )
                facturaGuardada.lineas.add(linea)
                
                // Si está contabilizado, restar stock
                if (request.contabilizado && producto != null) {
                    val almacenId = almacenRepository.findByActivoTrue().firstOrNull()?.id
                        ?: return ResponseEntity.badRequest().body(mapOf("error" to "No hay almacenes activos"))

                    val existing = productoAlmacenRepository.findByProductoIdAndAlmacenId(producto.id, almacenId)
                        ?: productoAlmacenRepository.save(
                            ProductoAlmacen(
                                producto = producto,
                                almacen = almacenRepository.findById(almacenId).orElse(null),
                                stock = 0,
                                stockMinimo = 0
                            )
                        )

                    val cantidad = lineaReq.cantidad.toInt()
                    val nuevoStock = existing.stock - cantidad
                    if (nuevoStock < 0) {
                        return ResponseEntity.badRequest().body(
                            mapOf("error" to "Stock insuficiente para el producto ${producto.nombre}. Stock actual: ${existing.stock}, solicitado: ${lineaReq.cantidad}")
                        )
                    }

                    productoAlmacenRepository.save(
                        existing.copy(
                            stock = nuevoStock,
                            updatedAt = LocalDateTime.now()
                        )
                    )
                }
            }
            
            // Guardar con líneas
            val facturaFinal = facturaSimplificadaRepository.save(facturaGuardada)
            return ResponseEntity.ok(facturaFinal)
            
        } catch (e: Exception) {
            e.printStackTrace()
            return ResponseEntity.badRequest().body(
                mapOf("error" to (e.message ?: "Error al crear factura simplificada"))
            )
        }
    }

    @PutMapping("/{id}")
    fun actualizar(@PathVariable id: Long, @RequestBody request: FacturaSimplificadaRequest): ResponseEntity<Any> {
        try {
            val facturaExistente = facturaSimplificadaRepository.findById(id)
                .orElse(null) ?: return ResponseEntity.notFound().build()
            
            val cliente = request.clienteId?.let { clienteRepository.findById(it).orElse(null) }
            
            // Crear formatter para fecha
            val formatter = DateTimeFormatter.ISO_DATE_TIME
            val fechaParseada = LocalDateTime.parse(request.fecha, formatter)

            // Actualizar factura existente manteniendo el mismo número
            val facturaActualizada = facturaExistente.copy(
                numero = request.numero, // Mantener el número original
                fecha = fechaParseada,
                cliente = cliente,
                observaciones = request.observaciones ?: "",
                estado = request.estado,
                subtotal = request.subtotal,
                descuentoTotal = request.descuentoTotal,
                total = request.total,
                contabilizado = request.contabilizado,
                lineas = mutableListOf() // Limpiar líneas para volver a agregarlas
            )
            
            // Guardar factura actualizada (sin líneas primero)
            val facturaGuardada = facturaSimplificadaRepository.save(facturaActualizada)
            
            // Eliminar líneas existentes y crear nuevas
            facturaExistente.lineas.clear()
            facturaSimplificadaRepository.save(facturaExistente)
            
            // Crear y agregar nuevas líneas
            request.lineas.forEach { lineaReq ->
                val producto = productoRepository.findById(lineaReq.productoId).orElse(null)
                val tipoIva = lineaReq.tipoIvaId?.let { tipoIvaRepository.findById(it).orElse(null) }
                
                val linea = FacturaSimplificadaLinea(
                    facturaSimplificada = facturaGuardada,
                    producto = producto,
                    descripcion = lineaReq.descripcion,
                    cantidad = lineaReq.cantidad,
                    precioUnitario = lineaReq.precioUnitario,
                    descuento = lineaReq.descuento,
                    tipoIva = tipoIva,
                    porcentajeIva = lineaReq.porcentajeIva,
                    porcentajeRecargo = lineaReq.porcentajeRecargo,
                    importeIva = lineaReq.importeIva,
                    importeRecargo = lineaReq.importeRecargo,
                    importeTotalLinea = lineaReq.importeTotalLinea
                )
                facturaGuardada.lineas.add(linea)
                
                // Si está contabilizado y no lo estaba antes, restar stock
                if (request.contabilizado && !facturaExistente.contabilizado && producto != null) {
                    val almacenId = almacenRepository.findByActivoTrue().firstOrNull()?.id
                        ?: return ResponseEntity.badRequest().body(mapOf("error" to "No hay almacenes activos"))

                    val existing = productoAlmacenRepository.findByProductoIdAndAlmacenId(producto.id, almacenId)
                        ?: productoAlmacenRepository.save(
                            ProductoAlmacen(
                                producto = producto,
                                almacen = almacenRepository.findById(almacenId).orElse(null),
                                stock = 0,
                                stockMinimo = 0
                            )
                        )

                    val cantidad = lineaReq.cantidad.toInt()
                    val nuevoStock = existing.stock - cantidad
                    if (nuevoStock < 0) {
                        return ResponseEntity.badRequest().body(
                            mapOf("error" to "Stock insuficiente para el producto ${producto.nombre}. Stock actual: ${existing.stock}, solicitado: ${lineaReq.cantidad}")
                        )
                    }

                    productoAlmacenRepository.save(
                        existing.copy(
                            stock = nuevoStock,
                            updatedAt = LocalDateTime.now()
                        )
                    )
                }
            }
            
            // Guardar con líneas nuevas
            val facturaFinal = facturaSimplificadaRepository.save(facturaGuardada)
            return ResponseEntity.ok(facturaFinal)
            
        } catch (e: Exception) {
            e.printStackTrace()
            return ResponseEntity.badRequest().body(
                mapOf("error" to (e.message ?: "Error al actualizar factura simplificada"))
            )
        }
    }

    @DeleteMapping("/{id}")
    fun borrar(@PathVariable id: Long): ResponseEntity<Any> {
        if (!facturaSimplificadaRepository.existsById(id)) {
            return ResponseEntity.notFound().build()
        }
        facturaSimplificadaRepository.deleteById(id)
        return ResponseEntity.noContent().build()
    }
}

data class FacturaSimplificadaRequest(
    val numero: String,
    val fecha: String,
    val clienteId: Long?,
    val observaciones: String?,
    val estado: String,
    val subtotal: Double,
    val descuentoTotal: Double,
    val total: Double,
    val contabilizado: Boolean,
    val lineas: List<FacturaSimplificadaLineaRequest>
)

data class FacturaSimplificadaLineaRequest(
    val productoId: Long,
    val descripcion: String?,
    val cantidad: Double,
    val precioUnitario: Double,
    val descuento: Double,
    val tipoIvaId: Long?,
    val porcentajeIva: Double,
    val porcentajeRecargo: Double,
    val importeIva: Double,
    val importeRecargo: Double,
    val importeTotalLinea: Double
)
