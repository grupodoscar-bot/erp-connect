package com.example.demo.controller.compras

import com.example.demo.model.TipoTarifa
import com.example.demo.model.compras.PresupuestoCompra
import com.example.demo.model.compras.PresupuestoCompraLinea
import com.example.demo.model.ventas.DocumentoTransformacion
import com.example.demo.repository.*
import com.example.demo.repository.compras.AlbaranCompraRepository
import com.example.demo.repository.compras.FacturaCompraRepository
import com.example.demo.repository.compras.PedidoCompraRepository
import com.example.demo.repository.compras.PresupuestoCompraRepository
import com.example.demo.repository.ventas.AlbaranRepository
import com.example.demo.repository.ventas.DocumentoTransformacionRepository
import com.example.demo.repository.ventas.FacturaProformaRepository
import com.example.demo.repository.ventas.FacturaRectificativaRepository
import com.example.demo.repository.ventas.FacturaRepository
import com.example.demo.repository.ventas.PedidoRepository
import com.example.demo.repository.ventas.PresupuestoRepository as PresupuestoVentaRepository
import com.example.demo.service.SerieNumeracionService
import com.example.demo.service.TarifaService
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.http.ResponseEntity
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.*
import java.time.LocalDateTime

data class PresupuestoCompraRequest(
    val id: Long? = null,
    val numero: String,
    val fecha: String? = null,
    val proveedorId: Long,
    val observaciones: String? = null,
    val notas: String? = null,
    val estado: String,
    val subtotal: Double,
    val descuentoTotal: Double,
    val total: Double,
    val descuentoAgrupacion: Double? = null,
    val serieId: Long? = null,
    val almacenId: Long? = null,
    val tarifaId: Long? = null,
    val compraMultialmacen: Boolean? = null,
    val usarCodigoManual: Boolean? = null,
    val lineas: List<LineaPresupuestoRequest>,
    val direccionEnvioPais: String? = null,
    val direccionEnvioCodigoPostal: String? = null,
    val direccionEnvioProvincia: String? = null,
    val direccionEnvioPoblacion: String? = null,
    val direccionEnvioDireccion: String? = null,
    val direccionFacturacionPais: String? = null,
    val direccionFacturacionCodigoPostal: String? = null,
    val direccionFacturacionProvincia: String? = null,
    val direccionFacturacionPoblacion: String? = null,
    val direccionFacturacionDireccion: String? = null,
    val direccionId: Long? = null,
    val recargoEquivalencia: Boolean? = null
)

data class LineaPresupuestoRequest(
    val productoId: Long?,
    val nombreProducto: String? = null,
    val referencia: String? = null,
    val cantidad: Double,
    val precioUnitario: Double,
    val descuento: Double,
    val observaciones: String? = null,
    val tipoIvaId: Long?,
    val porcentajeIva: Double? = null,
    val porcentajeRecargo: Double? = null,
    val importeIva: Double? = null,
    val importeRecargo: Double? = null,
    val almacenId: Long? = null
)

@RestController
@RequestMapping("/presupuestos-compra")
@CrossOrigin(origins = ["http://145.223.103.219:3000"])
class PresupuestoCompraController(
    private val presupuestoCompraRepository: PresupuestoCompraRepository,
    private val proveedorRepository: ProveedorRepository,
    private val productoRepository: ProductoRepository,
    private val tipoIvaRepository: TipoIvaRepository,
    private val almacenRepository: AlmacenRepository,
    private val serieDocumentoRepository: SerieDocumentoRepository,
    private val serieNumeracionService: SerieNumeracionService,
    private val archivoEmpresaRepository: ArchivoEmpresaRepository,
    private val tarifaService: TarifaService,
    private val tarifaRepository: TarifaRepository,
    private val configuracionVentasRepository: ConfiguracionVentasRepository,
    private val albaranCompraRepository: AlbaranCompraRepository,
    private val facturaCompraRepository: FacturaCompraRepository,
    private val pedidoCompraRepository: PedidoCompraRepository,
    private val documentoTransformacionRepository: DocumentoTransformacionRepository,
    private val albaranVentaRepository: AlbaranRepository,
    private val facturaVentaRepository: FacturaRepository,
    private val pedidoVentaRepository: PedidoRepository,
    private val presupuestoVentaRepository: PresupuestoVentaRepository,
    private val facturaProformaRepository: FacturaProformaRepository,
    private val facturaRectificativaRepository: FacturaRectificativaRepository
) {

    @GetMapping
    fun listarPresupuestos(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "50") size: Int,
        @RequestParam(required = false) busqueda: String?,
        @RequestParam(required = false) estado: String?
    ): ResponseEntity<Page<PresupuestoCompra>> {
        return try {
            val pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "fecha"))
            val presupuestos = presupuestoCompraRepository.buscarPresupuestos(busqueda, estado, pageable)
            
            presupuestos.content.forEach { presupuesto ->
                val adjuntos = archivoEmpresaRepository.findByDocumentoOrigenAndDocumentoOrigenId("PRESUPUESTO_COMPRA", presupuesto.id)
                presupuesto.adjuntos = adjuntos
            }
            
            ResponseEntity.ok(presupuestos)
        } catch (e: Exception) {
            e.printStackTrace()
            ResponseEntity.ok(org.springframework.data.domain.PageImpl(emptyList<PresupuestoCompra>(), PageRequest.of(page, size), 0))
        }
    }

    @GetMapping("/{id}")
    fun obtenerPresupuesto(@PathVariable id: Long): ResponseEntity<PresupuestoCompra> {
        val presupuesto = presupuestoCompraRepository.findById(id).orElse(null)
            ?: return ResponseEntity.notFound().build()
        
        val adjuntos = archivoEmpresaRepository.findByDocumentoOrigenAndDocumentoOrigenId("PRESUPUESTO_COMPRA", presupuesto.id)
        presupuesto.adjuntos = adjuntos
        
        return ResponseEntity.ok(presupuesto)
    }

    @PostMapping
    @Transactional
    fun crearPresupuesto(@RequestBody request: PresupuestoCompraRequest): ResponseEntity<PresupuestoCompra> {
        val proveedor = proveedorRepository.findById(request.proveedorId).orElse(null)
            ?: return ResponseEntity.badRequest().build()

        val serie = request.serieId?.let { serieDocumentoRepository.findById(it).orElse(null) }
        val almacen = request.almacenId?.let { almacenRepository.findById(it).orElse(null) }
        val tarifa = request.tarifaId?.let { tarifaRepository.findById(it).orElse(null) }

        var numero = request.numero
        var anioDocumento: Int? = null
        var numeroSecuencial: Long? = null
        var codigoDocumento: String? = null
        
        if (serie != null && numero.isNullOrBlank()) {
            val resultadoNumero = serieNumeracionService.generarYReservarNumero("PRESUPUESTO_COMPRA", serie.id, null)
            numero = resultadoNumero.codigo
            anioDocumento = resultadoNumero.anio
            numeroSecuencial = resultadoNumero.secuencial
            codigoDocumento = resultadoNumero.codigo
        }

        val fechaPresupuesto = request.fecha?.let { parsearFecha(it) } ?: LocalDateTime.now()

        val presupuesto = PresupuestoCompra(
            numero = numero,
            fecha = fechaPresupuesto,
            proveedor = proveedor,
            observaciones = request.observaciones ?: "",
            notas = request.notas ?: "",
            estado = request.estado,
            subtotal = request.subtotal,
            descuentoTotal = request.descuentoTotal,
            total = request.total,
            descuentoAgrupacion = request.descuentoAgrupacion ?: 0.0,
            serie = serie,
            almacen = almacen,
            tarifa = tarifa,
            compraMultialmacen = request.compraMultialmacen ?: false,
            anioDocumento = anioDocumento,
            numeroSecuencial = numeroSecuencial,
            codigoDocumento = codigoDocumento,
            proveedorNombreComercial = proveedor.nombreComercial,
            proveedorNombreFiscal = proveedor.nombreFiscal,
            proveedorNifCif = proveedor.nifCif,
            proveedorEmail = proveedor.email,
            proveedorTelefono = proveedor.telefonoFijo ?: proveedor.telefonoMovil,
            direccionEnvioPais = request.direccionEnvioPais,
            direccionEnvioCodigoPostal = request.direccionEnvioCodigoPostal,
            direccionEnvioProvincia = request.direccionEnvioProvincia,
            direccionEnvioPoblacion = request.direccionEnvioPoblacion,
            direccionEnvioDireccion = request.direccionEnvioDireccion,
            direccionFacturacionPais = request.direccionFacturacionPais,
            direccionFacturacionCodigoPostal = request.direccionFacturacionCodigoPostal,
            direccionFacturacionProvincia = request.direccionFacturacionProvincia,
            direccionFacturacionPoblacion = request.direccionFacturacionPoblacion,
            direccionFacturacionDireccion = request.direccionFacturacionDireccion,
            direccionId = request.direccionId,
            recargoEquivalencia = request.recargoEquivalencia ?: false,
            createdAt = LocalDateTime.now(),
            updatedAt = LocalDateTime.now()
        )

        val presupuestoGuardado = presupuestoCompraRepository.save(presupuesto)

        val lineas = request.lineas.map { lineaReq ->
            val producto = lineaReq.productoId?.let { productoRepository.findById(it).orElse(null) }
            val tipoIva = lineaReq.tipoIvaId?.let { tipoIvaRepository.findById(it).orElse(null) }
            val almacenLinea = lineaReq.almacenId?.let { almacenRepository.findById(it).orElse(null) }

            PresupuestoCompraLinea(
                presupuestoCompra = presupuestoGuardado,
                producto = producto,
                nombreProducto = lineaReq.nombreProducto ?: producto?.nombre ?: "",
                referencia = lineaReq.referencia ?: producto?.referencia ?: "",
                cantidad = lineaReq.cantidad,
                precioUnitario = lineaReq.precioUnitario,
                descuento = lineaReq.descuento,
                observaciones = lineaReq.observaciones ?: "",
                tipoIva = tipoIva,
                porcentajeIva = lineaReq.porcentajeIva ?: 0.0,
                porcentajeRecargo = lineaReq.porcentajeRecargo ?: 0.0,
                importeIva = lineaReq.importeIva ?: 0.0,
                importeRecargo = lineaReq.importeRecargo ?: 0.0,
                almacen = almacenLinea
            )
        }

        presupuestoGuardado.lineas.addAll(lineas)
        val presupuestoFinal = presupuestoCompraRepository.save(presupuestoGuardado)

        return ResponseEntity.ok(presupuestoFinal)
    }

    @PutMapping("/{id}")
    @Transactional
    fun actualizarPresupuesto(@PathVariable id: Long, @RequestBody request: PresupuestoCompraRequest): ResponseEntity<PresupuestoCompra> {
        val presupuestoExistente = presupuestoCompraRepository.findById(id).orElse(null)
            ?: return ResponseEntity.notFound().build()

        val proveedor = proveedorRepository.findById(request.proveedorId).orElse(null)
            ?: return ResponseEntity.badRequest().build()

        val serie = request.serieId?.let { serieDocumentoRepository.findById(it).orElse(null) }
        val almacen = request.almacenId?.let { almacenRepository.findById(it).orElse(null) }
        val tarifa = request.tarifaId?.let { tarifaRepository.findById(it).orElse(null) }

        var numero = request.numero
        var anioDocumento = presupuestoExistente.anioDocumento
        var numeroSecuencial = presupuestoExistente.numeroSecuencial
        var codigoDocumento = presupuestoExistente.codigoDocumento
        
        if (serie != null && request.usarCodigoManual == true && numero.isNullOrBlank()) {
            val resultadoNumero = serieNumeracionService.generarYReservarNumero("PRESUPUESTO_COMPRA", serie.id, null)
            numero = resultadoNumero.codigo
            anioDocumento = resultadoNumero.anio
            numeroSecuencial = resultadoNumero.secuencial
            codigoDocumento = resultadoNumero.codigo
        }

        val presupuestoActualizado = presupuestoExistente.copy(
            numero = numero,
            fecha = request.fecha?.let { parsearFecha(it) } ?: presupuestoExistente.fecha,
            proveedor = proveedor,
            observaciones = request.observaciones ?: "",
            notas = request.notas ?: "",
            estado = request.estado,
            subtotal = request.subtotal,
            descuentoTotal = request.descuentoTotal,
            total = request.total,
            descuentoAgrupacion = request.descuentoAgrupacion ?: 0.0,
            serie = serie,
            almacen = almacen,
            tarifa = tarifa,
            compraMultialmacen = request.compraMultialmacen ?: false,
            anioDocumento = anioDocumento,
            numeroSecuencial = numeroSecuencial,
            codigoDocumento = codigoDocumento,
            direccionEnvioPais = request.direccionEnvioPais,
            direccionEnvioCodigoPostal = request.direccionEnvioCodigoPostal,
            direccionEnvioProvincia = request.direccionEnvioProvincia,
            direccionEnvioPoblacion = request.direccionEnvioPoblacion,
            direccionEnvioDireccion = request.direccionEnvioDireccion,
            direccionFacturacionPais = request.direccionFacturacionPais,
            direccionFacturacionCodigoPostal = request.direccionFacturacionCodigoPostal,
            direccionFacturacionProvincia = request.direccionFacturacionProvincia,
            direccionFacturacionPoblacion = request.direccionFacturacionPoblacion,
            direccionFacturacionDireccion = request.direccionFacturacionDireccion,
            direccionId = request.direccionId,
            recargoEquivalencia = request.recargoEquivalencia ?: false,
            updatedAt = LocalDateTime.now(),
            lineas = mutableListOf()
        )

        val presupuestoGuardado = presupuestoCompraRepository.save(presupuestoActualizado)

        val lineas = request.lineas.map { lineaReq ->
            val producto = lineaReq.productoId?.let { productoRepository.findById(it).orElse(null) }
            val tipoIva = lineaReq.tipoIvaId?.let { tipoIvaRepository.findById(it).orElse(null) }
            val almacenLinea = lineaReq.almacenId?.let { almacenRepository.findById(it).orElse(null) }

            PresupuestoCompraLinea(
                presupuestoCompra = presupuestoGuardado,
                producto = producto,
                nombreProducto = lineaReq.nombreProducto ?: producto?.nombre ?: "",
                referencia = lineaReq.referencia ?: producto?.referencia ?: "",
                cantidad = lineaReq.cantidad,
                precioUnitario = lineaReq.precioUnitario,
                descuento = lineaReq.descuento,
                observaciones = lineaReq.observaciones ?: "",
                tipoIva = tipoIva,
                porcentajeIva = lineaReq.porcentajeIva ?: 0.0,
                porcentajeRecargo = lineaReq.porcentajeRecargo ?: 0.0,
                importeIva = lineaReq.importeIva ?: 0.0,
                importeRecargo = lineaReq.importeRecargo ?: 0.0,
                almacen = almacenLinea
            )
        }

        presupuestoGuardado.lineas.addAll(lineas)
        val presupuestoFinal = presupuestoCompraRepository.save(presupuestoGuardado)

        return ResponseEntity.ok(presupuestoFinal)
    }

    @DeleteMapping("/{id}")
    @Transactional
    fun eliminarPresupuesto(@PathVariable id: Long): ResponseEntity<Void> {
        if (!presupuestoCompraRepository.existsById(id)) {
            return ResponseEntity.notFound().build()
        }
        presupuestoCompraRepository.deleteById(id)
        return ResponseEntity.noContent().build()
    }

    @PostMapping("/{id}/adjuntos")
    @Transactional
    fun vincularAdjuntos(@PathVariable id: Long, @RequestBody adjuntosIds: List<Long>): ResponseEntity<Void> {
        adjuntosIds.forEach { adjuntoId ->
            val adjunto = archivoEmpresaRepository.findById(adjuntoId).orElse(null)
            if (adjunto != null) {
                val adjuntoActualizado = adjunto.copy(
                    documentoOrigen = "PRESUPUESTO_COMPRA",
                    documentoOrigenId = id
                )
                archivoEmpresaRepository.save(adjuntoActualizado)
            }
        }
        return ResponseEntity.ok().build()
    }

    /**
     * Obtiene las tarifas disponibles para presupuestos de compra
     */
    @GetMapping("/tarifas-disponibles")
    fun obtenerTarifasDisponibles(): ResponseEntity<Map<String, Any?>> {
        val configuracion = configuracionVentasRepository.findTopByOrderByIdAsc()
        val esMultitarifaPermitida = configuracion?.permitirMultitarifa == true
        
        val tarifas = if (esMultitarifaPermitida) {
            tarifaRepository.findByActivaTrue().filter { 
                it.tipoTarifa == TipoTarifa.COMPRA || it.tipoTarifa == TipoTarifa.AMBAS 
            }
        } else {
            listOfNotNull(tarifaRepository.findByEsGeneralTrue()?.takeIf { 
                it.tipoTarifa == TipoTarifa.COMPRA || it.tipoTarifa == TipoTarifa.AMBAS 
            })
        }
        
        val tarifaPorDefecto = tarifaRepository.findByEsGeneralTrue()?.takeIf { 
            it.tipoTarifa == TipoTarifa.COMPRA || it.tipoTarifa == TipoTarifa.AMBAS 
        }
        
        return ResponseEntity.ok(mapOf<String, Any?>(
            "tarifas" to tarifas,
            "esMultitarifaPermitida" to esMultitarifaPermitida,
            "tarifaPorDefecto" to tarifaPorDefecto
        ))
    }

    /**
     * Obtiene el precio de un producto según la tarifa de compra seleccionada
     */
    @GetMapping("/precio-producto")
    fun obtenerPrecioProducto(
        @RequestParam productoId: Long,
        @RequestParam(required = false) tarifaId: Long?
    ): ResponseEntity<Any> {
        val producto = productoRepository.findById(productoId).orElse(null)
            ?: return ResponseEntity.badRequest().body(mapOf(
                "error" to "Producto no encontrado"
            ))
        
        val precioProducto = tarifaService.obtenerPrecioProductoCompra(producto, tarifaId)
            ?: return ResponseEntity.badRequest().body(mapOf(
                "error" to "No se encontró precio para este producto en la tarifa seleccionada"
            ))
        
        return ResponseEntity.ok(mapOf(
            "precio" to precioProducto.precio,
            "descuento" to precioProducto.descuento,
            "precioBloqueado" to precioProducto.precioBloqueado,
            "margen" to precioProducto.margen,
            "precioConImpuestos" to precioProducto.precioConImpuestos,
            "tarifaNombre" to precioProducto.tarifa.nombre
        ))
    }

    private fun parsearFecha(fechaStr: String?): java.time.LocalDateTime {
        if (fechaStr.isNullOrBlank()) return LocalDateTime.now()
        return try {
            java.time.LocalDateTime.parse(fechaStr)
        } catch (e: Exception) {
            try {
                java.time.LocalDate.parse(fechaStr).atTime(java.time.LocalTime.now())
            } catch (e2: Exception) {
                LocalDateTime.now()
            }
        }
    }

    // ========== TRANSFORMACIONES ==========

    @PostMapping("/transformar")
    @Transactional
    fun transformarDocumento(@RequestBody request: TransformarDocumentoCompraRequest): ResponseEntity<Any> {
        if (request.tipoDestino != "PRESUPUESTO_COMPRA") {
            return ResponseEntity.badRequest().body(mapOf("error" to "Este endpoint solo crea presupuestos de compra"))
        }

        val (proveedorOrigen, lineasOrigen, descuentoAgrupacion, almacenOrigen, tarifaOrigen, observaciones, notas, snap) = when (request.tipoOrigen) {
            "ALBARAN_COMPRA" -> {
                val origen = albaranCompraRepository.findById(request.idOrigen).orElse(null)
                    ?: return ResponseEntity.badRequest().body(mapOf("error" to "Albarán de compra no encontrado"))
                OrigenPresupData(origen.proveedor, origen.lineas.map { LineaOrigenPresup(it.producto, it.nombreProducto, it.referencia, it.cantidad.toDouble(), it.precioUnitario, it.descuento, it.observaciones ?: "", it.tipoIva, it.porcentajeIva, it.porcentajeRecargo, it.importeIva, it.importeRecargo, it.almacen) }, origen.descuentoAgrupacion, origen.almacen, origen.tarifa, origen.observaciones ?: "", origen.notas ?: "", SnapPresup(origen.proveedorNombreComercial, origen.proveedorNombreFiscal, origen.proveedorNifCif, origen.proveedorEmail, origen.proveedorTelefono, origen.direccionFacturacionPais, origen.direccionFacturacionCodigoPostal, origen.direccionFacturacionProvincia, origen.direccionFacturacionPoblacion, origen.direccionFacturacionDireccion, origen.direccionEnvioPais, origen.direccionEnvioCodigoPostal, origen.direccionEnvioProvincia, origen.direccionEnvioPoblacion, origen.direccionEnvioDireccion, origen.recargoEquivalencia, origen.compraMultialmacen, origen.direccionId))
            }
            "PEDIDO_COMPRA" -> {
                val origen = pedidoCompraRepository.findById(request.idOrigen).orElse(null)
                    ?: return ResponseEntity.badRequest().body(mapOf("error" to "Pedido de compra no encontrado"))
                OrigenPresupData(origen.proveedor, origen.lineas.map { LineaOrigenPresup(it.producto, it.nombreProducto, it.referencia, it.cantidad, it.precioUnitario, it.descuento, it.observaciones ?: "", it.tipoIva, it.porcentajeIva, it.porcentajeRecargo, it.importeIva, it.importeRecargo, it.almacen) }, origen.descuentoAgrupacion, origen.almacen, origen.tarifa, origen.observaciones ?: "", origen.notas ?: "", SnapPresup(origen.proveedorNombreComercial, origen.proveedorNombreFiscal, origen.proveedorNifCif, origen.proveedorEmail, origen.proveedorTelefono, origen.direccionFacturacionPais, origen.direccionFacturacionCodigoPostal, origen.direccionFacturacionProvincia, origen.direccionFacturacionPoblacion, origen.direccionFacturacionDireccion, origen.direccionEnvioPais, origen.direccionEnvioCodigoPostal, origen.direccionEnvioProvincia, origen.direccionEnvioPoblacion, origen.direccionEnvioDireccion, origen.recargoEquivalencia, origen.compraMultialmacen ?: false, origen.direccionId))
            }
            "PRESUPUESTO_COMPRA" -> {
                val origen = presupuestoCompraRepository.findById(request.idOrigen).orElse(null)
                    ?: return ResponseEntity.badRequest().body(mapOf("error" to "Presupuesto de compra no encontrado"))
                OrigenPresupData(origen.proveedor, origen.lineas.map { LineaOrigenPresup(it.producto, it.nombreProducto, it.referencia, it.cantidad, it.precioUnitario, it.descuento, it.observaciones ?: "", it.tipoIva, it.porcentajeIva, it.porcentajeRecargo, it.importeIva, it.importeRecargo, it.almacen) }, origen.descuentoAgrupacion, origen.almacen, origen.tarifa, origen.observaciones ?: "", origen.notas ?: "", SnapPresup(origen.proveedorNombreComercial, origen.proveedorNombreFiscal, origen.proveedorNifCif, origen.proveedorEmail, origen.proveedorTelefono, origen.direccionFacturacionPais, origen.direccionFacturacionCodigoPostal, origen.direccionFacturacionProvincia, origen.direccionFacturacionPoblacion, origen.direccionFacturacionDireccion, origen.direccionEnvioPais, origen.direccionEnvioCodigoPostal, origen.direccionEnvioProvincia, origen.direccionEnvioPoblacion, origen.direccionEnvioDireccion, origen.recargoEquivalencia, origen.compraMultialmacen ?: false, origen.direccionId))
            }
            "FACTURA_COMPRA" -> {
                val origen = facturaCompraRepository.findById(request.idOrigen).orElse(null)
                    ?: return ResponseEntity.badRequest().body(mapOf("error" to "Factura de compra no encontrada"))
                OrigenPresupData(origen.proveedor, origen.lineas.map { LineaOrigenPresup(it.producto, it.nombreProducto, it.referencia, it.cantidad.toDouble(), it.precioUnitario, it.descuento, it.observaciones ?: "", it.tipoIva, it.porcentajeIva, it.porcentajeRecargo, it.importeIva, it.importeRecargo, it.almacen) }, origen.descuentoAgrupacion, origen.almacen, origen.tarifa, origen.observaciones ?: "", origen.notas ?: "", SnapPresup(origen.proveedorNombreComercial, origen.proveedorNombreFiscal, origen.proveedorNifCif, origen.proveedorEmail, origen.proveedorTelefono, origen.direccionFacturacionPais, origen.direccionFacturacionCodigoPostal, origen.direccionFacturacionProvincia, origen.direccionFacturacionPoblacion, origen.direccionFacturacionDireccion, origen.direccionEnvioPais, origen.direccionEnvioCodigoPostal, origen.direccionEnvioProvincia, origen.direccionEnvioPoblacion, origen.direccionEnvioDireccion, origen.recargoEquivalencia, origen.compraMultialmacen, origen.direccionId))
            }
            // Orígenes de ventas (transformación cruzada compra)
            "FACTURA_PROFORMA" -> return ResponseEntity.badRequest().body(mapOf("error" to "Factura Proforma no puede transformarse a documentos de compra"))
            "PRESUPUESTO" -> {
                val origen = presupuestoVentaRepository.findById(request.idOrigen).orElse(null)
                    ?: return ResponseEntity.badRequest().body(mapOf("error" to "Presupuesto no encontrado"))
                val proveedor = request.proveedorId?.let { proveedorRepository.findById(it).orElse(null) }
                OrigenPresupData(proveedor, origen.lineas.map { LineaOrigenPresup(it.producto, it.nombreProducto, it.referencia, it.cantidad.toDouble(), it.precioUnitario, it.descuento, it.observaciones ?: "", it.tipoIva, it.porcentajeIva, it.porcentajeRecargo, it.importeIva, it.importeRecargo, it.almacen) }, origen.descuentoAgrupacion, origen.almacen, origen.tarifa, origen.observaciones ?: "", origen.notas ?: "", SnapPresup(null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, false, false, null))
            }
            "PEDIDO" -> {
                val origen = pedidoVentaRepository.findById(request.idOrigen).orElse(null)
                    ?: return ResponseEntity.badRequest().body(mapOf("error" to "Pedido no encontrado"))
                val proveedor = request.proveedorId?.let { proveedorRepository.findById(it).orElse(null) }
                OrigenPresupData(proveedor, origen.lineas.map { LineaOrigenPresup(it.producto, it.nombreProducto, it.referencia, it.cantidad.toDouble(), it.precioUnitario, it.descuento, it.observaciones ?: "", it.tipoIva, it.porcentajeIva, it.porcentajeRecargo, it.importeIva, it.importeRecargo, it.almacen) }, origen.descuentoAgrupacion, origen.almacen, origen.tarifa, origen.observaciones ?: "", origen.notas ?: "", SnapPresup(null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, false, false, null))
            }
            "ALBARAN" -> {
                val origen = albaranVentaRepository.findById(request.idOrigen).orElse(null)
                    ?: return ResponseEntity.badRequest().body(mapOf("error" to "Albarán no encontrado"))
                val proveedor = request.proveedorId?.let { proveedorRepository.findById(it).orElse(null) }
                OrigenPresupData(proveedor, origen.lineas.map { LineaOrigenPresup(it.producto, it.nombreProducto, it.referencia, it.cantidad.toDouble(), it.precioUnitario, it.descuento, it.observaciones ?: "", it.tipoIva, it.porcentajeIva, it.porcentajeRecargo, it.importeIva, it.importeRecargo, it.almacen) }, origen.descuentoAgrupacion, origen.almacen, origen.tarifa, origen.observaciones ?: "", origen.notas ?: "", SnapPresup(null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, false, origen.ventaMultialmacen, null))
            }
            "FACTURA" -> {
                val origen = facturaVentaRepository.findById(request.idOrigen).orElse(null)
                    ?: return ResponseEntity.badRequest().body(mapOf("error" to "Factura no encontrada"))
                val proveedor = request.proveedorId?.let { proveedorRepository.findById(it).orElse(null) }
                OrigenPresupData(proveedor, origen.lineas.map { LineaOrigenPresup(it.producto, it.nombreProducto, it.referencia, it.cantidad.toDouble(), it.precioUnitario, it.descuento, it.observaciones ?: "", it.tipoIva, it.porcentajeIva, it.porcentajeRecargo, it.importeIva, it.importeRecargo, it.almacen) }, origen.descuentoAgrupacion, origen.almacen, origen.tarifa, origen.observaciones ?: "", origen.notas ?: "", SnapPresup(null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, false, origen.ventaMultialmacen ?: false, null))
            }
            "FACTURA_RECTIFICATIVA" -> {
                val origen = facturaRectificativaRepository.findById(request.idOrigen).orElse(null)
                    ?: return ResponseEntity.badRequest().body(mapOf("error" to "Factura rectificativa no encontrada"))
                val proveedor = request.proveedorId?.let { proveedorRepository.findById(it).orElse(null) }
                OrigenPresupData(proveedor, origen.lineas.map { LineaOrigenPresup(it.producto, it.nombreProducto, it.referencia, it.cantidad.toDouble(), it.precioUnitario, it.descuento, it.observaciones ?: "", it.tipoIva, it.porcentajeIva, it.porcentajeRecargo, it.importeIva, it.importeRecargo, it.almacen) }, origen.descuentoAgrupacion ?: 0.0, origen.almacen, null, origen.observaciones ?: "", origen.notas ?: "", SnapPresup(null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, false, false, null))
            }
            else -> return ResponseEntity.badRequest().body(mapOf("error" to "Tipo de origen no soportado: ${request.tipoOrigen}"))
        }

        val proveedor = proveedorOrigen ?: return ResponseEntity.badRequest().body(mapOf("error" to "Proveedor no encontrado en documento origen"))
        val serie = request.serieId?.let { serieDocumentoRepository.findById(it).orElse(null) }

        val numeracion = if (serie != null) {
            serieNumeracionService.generarYReservarNumero("PRESUPUESTO_COMPRA", serie.id, null)
        } else {
            serieNumeracionService.generarYReservarNumero("PRESUPUESTO_COMPRA", null, null)
        }

        val fechaTransformada = request.fecha?.let { parsearFecha(it) } ?: LocalDateTime.now()

        val subtotal = lineasOrigen.sumOf { it.cantidad * it.precioUnitario }
        val descuentoTotal = lineasOrigen.sumOf { (it.cantidad * it.precioUnitario) * (it.descuento / 100) }
        val total = subtotal - descuentoTotal

        val nuevoPresupuesto = PresupuestoCompra(
            numero = numeracion.codigo,
            fecha = fechaTransformada,
            proveedor = proveedor,
            observaciones = observaciones,
            notas = notas,
            estado = request.estado,
            subtotal = subtotal,
            descuentoTotal = descuentoTotal,
            total = total,
            descuentoAgrupacion = descuentoAgrupacion,
            serie = numeracion.serie,
            almacen = almacenOrigen,
            tarifa = tarifaOrigen,
            compraMultialmacen = snap.compraMultialmacen,
            anioDocumento = numeracion.anio,
            numeroSecuencial = numeracion.secuencial,
            codigoDocumento = numeracion.codigo,
            proveedorNombreComercial = snap.proveedorNombreComercial,
            proveedorNombreFiscal = snap.proveedorNombreFiscal,
            proveedorNifCif = snap.proveedorNifCif,
            proveedorEmail = snap.proveedorEmail,
            proveedorTelefono = snap.proveedorTelefono,
            direccionFacturacionPais = snap.direccionFacturacionPais,
            direccionFacturacionCodigoPostal = snap.direccionFacturacionCodigoPostal,
            direccionFacturacionProvincia = snap.direccionFacturacionProvincia,
            direccionFacturacionPoblacion = snap.direccionFacturacionPoblacion,
            direccionFacturacionDireccion = snap.direccionFacturacionDireccion,
            direccionEnvioPais = snap.direccionEnvioPais,
            direccionEnvioCodigoPostal = snap.direccionEnvioCodigoPostal,
            direccionEnvioProvincia = snap.direccionEnvioProvincia,
            direccionEnvioPoblacion = snap.direccionEnvioPoblacion,
            direccionEnvioDireccion = snap.direccionEnvioDireccion,
            direccionId = snap.direccionId,
            recargoEquivalencia = snap.recargoEquivalencia,
            createdAt = LocalDateTime.now(),
            updatedAt = LocalDateTime.now()
        )

        val presupuestoGuardado = presupuestoCompraRepository.save(nuevoPresupuesto)

        lineasOrigen.forEach { linea ->
            val nuevaLinea = PresupuestoCompraLinea(
                presupuestoCompra = presupuestoGuardado,
                producto = linea.producto,
                nombreProducto = linea.nombreProducto,
                referencia = linea.referencia ?: linea.producto?.referencia ?: "",
                cantidad = linea.cantidad,
                precioUnitario = linea.precioUnitario,
                descuento = linea.descuento,
                observaciones = linea.observaciones,
                tipoIva = linea.tipoIva,
                porcentajeIva = linea.porcentajeIva,
                porcentajeRecargo = linea.porcentajeRecargo,
                importeIva = linea.importeIva,
                importeRecargo = linea.importeRecargo,
                almacen = linea.almacen
            )
            presupuestoGuardado.lineas.add(nuevaLinea)
        }

        val presupuestoFinal = presupuestoCompraRepository.save(presupuestoGuardado)

        // Presupuestos no gestionan stock

        // Registrar transformación solo si NO es duplicación
        if (!request.esDuplicacion) {
            val numeroOrigen = obtenerNumeroDocumentoOrigen(request.tipoOrigen, request.idOrigen)
            val transformacion = DocumentoTransformacion(
                tipoOrigen = request.tipoOrigen,
                idOrigen = request.idOrigen,
                numeroOrigen = numeroOrigen,
                tipoDestino = "PRESUPUESTO_COMPRA",
                idDestino = presupuestoFinal.id,
                numeroDestino = presupuestoFinal.numero,
                tipoTransformacion = "CONVERTIR",
                fechaTransformacion = java.time.LocalDateTime.now()
            )
            documentoTransformacionRepository.save(transformacion)
        }

        return ResponseEntity.ok(presupuestoFinal)
    }

    private fun obtenerNumeroDocumentoOrigen(tipo: String, id: Long): String? {
        return when (tipo) {
            "ALBARAN_COMPRA" -> albaranCompraRepository.findById(id).orElse(null)?.numero
            "PEDIDO_COMPRA" -> pedidoCompraRepository.findById(id).orElse(null)?.numero
            "PRESUPUESTO_COMPRA" -> presupuestoCompraRepository.findById(id).orElse(null)?.numero
            "FACTURA_COMPRA" -> facturaCompraRepository.findById(id).orElse(null)?.numero
            "ALBARAN" -> albaranVentaRepository.findById(id).orElse(null)?.numero
            "PEDIDO" -> pedidoVentaRepository.findById(id).orElse(null)?.numero
            "PRESUPUESTO" -> presupuestoVentaRepository.findById(id).orElse(null)?.numero
            "FACTURA" -> facturaVentaRepository.findById(id).orElse(null)?.numero
            "FACTURA_RECTIFICATIVA" -> facturaRectificativaRepository.findById(id).orElse(null)?.numero
            else -> null
        }
    }

    private fun formatearTipoDocumento(tipo: String): String {
        return when (tipo) {
            "ALBARAN_COMPRA" -> "Albarán Compra"
            "PEDIDO_COMPRA" -> "Pedido Compra"
            "PRESUPUESTO_COMPRA" -> "Presupuesto Compra"
            "FACTURA_COMPRA" -> "Factura Compra"
            else -> tipo
        }
    }

    private data class LineaOrigenPresup(
        val producto: com.example.demo.model.Producto?,
        val nombreProducto: String,
        val referencia: String?,
        val cantidad: Double,
        val precioUnitario: Double,
        val descuento: Double,
        val observaciones: String,
        val tipoIva: com.example.demo.model.TipoIva?,
        val porcentajeIva: Double,
        val porcentajeRecargo: Double,
        val importeIva: Double,
        val importeRecargo: Double,
        val almacen: com.example.demo.model.Almacen?
    )

    private data class SnapPresup(
        val proveedorNombreComercial: String?,
        val proveedorNombreFiscal: String?,
        val proveedorNifCif: String?,
        val proveedorEmail: String?,
        val proveedorTelefono: String?,
        val direccionFacturacionPais: String?,
        val direccionFacturacionCodigoPostal: String?,
        val direccionFacturacionProvincia: String?,
        val direccionFacturacionPoblacion: String?,
        val direccionFacturacionDireccion: String?,
        val direccionEnvioPais: String?,
        val direccionEnvioCodigoPostal: String?,
        val direccionEnvioProvincia: String?,
        val direccionEnvioPoblacion: String?,
        val direccionEnvioDireccion: String?,
        val recargoEquivalencia: Boolean,
        val compraMultialmacen: Boolean,
        val direccionId: Long?
    )

    private data class OrigenPresupData(
        val proveedor: com.example.demo.model.Proveedor?,
        val lineas: List<LineaOrigenPresup>,
        val descuentoAgrupacion: Double,
        val almacen: com.example.demo.model.Almacen?,
        val tarifa: com.example.demo.model.Tarifa?,
        val observaciones: String,
        val notas: String,
        val snapshot: SnapPresup
    )
}
