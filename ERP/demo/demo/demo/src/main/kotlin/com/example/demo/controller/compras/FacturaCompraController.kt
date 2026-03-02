package com.example.demo.controller.compras

import com.example.demo.model.Proveedor
import com.example.demo.model.compras.AlbaranCompra
import com.example.demo.model.compras.FacturaCompra
import com.example.demo.model.compras.FacturaCompraLinea
import com.example.demo.model.compras.PedidoCompra
import com.example.demo.model.ventas.DocumentoTransformacion
import com.example.demo.repository.AlmacenRepository
import com.example.demo.repository.ArchivoEmpresaRepository
import com.example.demo.repository.ConfiguracionVentasRepository
import com.example.demo.repository.ProductoRepository
import com.example.demo.repository.ProveedorRepository
import com.example.demo.repository.TipoIvaRepository
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
import com.example.demo.repository.ventas.PresupuestoRepository
import com.example.demo.service.ImpuestoCalculo
import com.example.demo.service.ImpuestoService
import com.example.demo.service.LineaImpuesto
import com.example.demo.service.SerieNumeracionService
import com.example.demo.service.StockService
import com.example.demo.service.TarifaService
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.http.ResponseEntity
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.*
import java.time.LocalDate
import java.time.LocalDateTime

@RestController
@RequestMapping("/facturas-compra")
@CrossOrigin(origins = ["http://145.223.103.219:3000"])
class FacturaCompraController(
    private val facturaCompraRepository: FacturaCompraRepository,
    private val albaranCompraRepository: AlbaranCompraRepository,
    private val pedidoCompraRepository: PedidoCompraRepository,
    private val proveedorRepository: ProveedorRepository,
    private val productoRepository: ProductoRepository,
    private val tipoIvaRepository: TipoIvaRepository,
    private val archivoEmpresaRepository: ArchivoEmpresaRepository,
    private val almacenRepository: AlmacenRepository,
    private val serieNumeracionService: SerieNumeracionService,
    private val stockService: StockService,
    private val tarifaService: TarifaService,
    private val configuracionVentasRepository: ConfiguracionVentasRepository,
    private val impuestoService: ImpuestoService,
    private val presupuestoCompraRepository: PresupuestoCompraRepository,
    private val documentoTransformacionRepository: DocumentoTransformacionRepository,
    private val albaranVentaRepository: AlbaranRepository,
    private val facturaVentaRepository: FacturaRepository,
    private val pedidoVentaRepository: PedidoRepository,
    private val presupuestoVentaRepository: PresupuestoRepository,
    private val facturaProformaRepository: FacturaProformaRepository,
    private val facturaRectificativaRepository: FacturaRectificativaRepository
) {

    private fun normalizarCadena(valor: String?): String? =
        valor?.trim()?.takeIf { it.isNotEmpty() }

    private fun snapshot(valorRequest: String?, valorPorDefecto: String?): String? =
        normalizarCadena(valorRequest) ?: valorPorDefecto

    private fun parsearFecha(fechaStr: String?): LocalDateTime {
        if (fechaStr == null) return LocalDateTime.now()
        return try {
            LocalDateTime.parse(fechaStr)
        } catch (e: Exception) {
            try {
                LocalDate.parse(fechaStr).atTime(java.time.LocalTime.now())
            } catch (e2: Exception) {
                LocalDateTime.now()
            }
        }
    }

    companion object {
        private const val DOCUMENTO_SERIE_TIPO = "FACTURA_COMPRA"
    }

    @GetMapping
    fun listarTodas(): List<FacturaCompra> = facturaCompraRepository.findAll()

    @GetMapping("/paginado")
    fun listarPaginado(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "50") size: Int,
        @RequestParam(defaultValue = "fecha") sortBy: String,
        @RequestParam(defaultValue = "DESC") sortDir: String,
        @RequestParam(required = false) search: String?,
        @RequestParam(required = false) estado: String?,
        @RequestParam(required = false) contabilizado: Boolean?
    ): ResponseEntity<Map<String, Any>> {
        val sort = if (sortDir.uppercase() == "ASC") {
            Sort.by(sortBy).ascending()
        } else {
            Sort.by(sortBy).descending()
        }

        val pageRequest = PageRequest.of(page, size, sort)
        val facturasPage: Page<FacturaCompra> = facturaCompraRepository.findAll(pageRequest)

        var facturasFiltradas = facturasPage.content.toList()

        if (!search.isNullOrBlank()) {
            facturasFiltradas = facturasFiltradas.filter { factura ->
                factura.numero.contains(search, ignoreCase = true) ||
                factura.proveedor?.nombreComercial?.contains(search, ignoreCase = true) == true ||
                factura.proveedor?.nombreFiscal?.contains(search, ignoreCase = true) == true
            }
        }

        if (!estado.isNullOrBlank()) {
            facturasFiltradas = facturasFiltradas.filter { it.estado == estado }
        }

        if (contabilizado != null) {
            facturasFiltradas = facturasFiltradas.filter { it.contabilizado == contabilizado }
        }

        val response = mapOf<String, Any>(
            "content" to facturasFiltradas,
            "totalElements" to facturasPage.totalElements,
            "totalPages" to facturasPage.totalPages,
            "currentPage" to facturasPage.number,
            "pageSize" to facturasPage.size,
            "hasNext" to facturasPage.hasNext(),
            "hasPrevious" to facturasPage.hasPrevious()
        )

        return ResponseEntity.ok(response)
    }

    @GetMapping("/{id}")
    fun obtenerPorId(@PathVariable id: Long): ResponseEntity<FacturaCompra> =
        facturaCompraRepository.findById(id)
            .map { ResponseEntity.ok(cargarAdjuntos(it)) }
            .orElse(ResponseEntity.notFound().build())

    @GetMapping("/siguiente-numero")
    fun obtenerSiguienteNumero(
        @RequestParam(required = false) serieId: Long?,
        @RequestParam(required = false) usuarioId: Long?
    ): ResponseEntity<Map<String, Any>> {
        val preview = serieNumeracionService.previsualizarNumero(DOCUMENTO_SERIE_TIPO, serieId, usuarioId)
        val response = mapOf(
            "numero" to preview.codigo,
            "serieId" to preview.serie.id,
            "prefijo" to preview.serie.prefijo,
            "anio" to preview.anio,
            "secuencial" to preview.secuencial,
            "permiteSeleccionUsuario" to preview.serie.permiteSeleccionUsuario
        )
        return ResponseEntity.ok(response)
    }

    @PostMapping
    @Transactional
    fun crear(@RequestBody request: FacturaCompraRequest): ResponseEntity<FacturaCompra> {
        val proveedor = request.proveedorId?.let { proveedorRepository.findById(it).orElse(null) }
        val pedidoCompra = request.pedidoCompraId?.let { pedidoCompraRepository.findById(it).orElse(null) }
        val albaranCompra = request.albaranCompraId?.let { albaranCompraRepository.findById(it).orElse(null) }
        val almacen = request.almacenId?.let { almacenRepository.findById(it).orElse(null) }

        val tarifa = if (request.tarifaId != null) {
            tarifaService.obtenerTarifasDisponibles().find { it.id == request.tarifaId }
        } else {
            tarifaService.obtenerTarifaPorDefecto()
        }

        val numeracion = prepararNumeracionParaNuevaFactura(request)
        val numeroFactura = numeracion.codigo

        val lineasCalculadas = request.lineas.map { calcularLineaConImpuestos(it, proveedor, request.descuentoAgrupacion, usarValoresDelRequest = true, tarifa = tarifa) }

        val subtotal = lineasCalculadas.sumOf { it.request.cantidad * it.request.precioUnitario }
        val descuentoTotal = lineasCalculadas.sumOf {
            (it.request.cantidad * it.request.precioUnitario) * (it.request.descuento / 100)
        }
        val baseAntesAgrupacion = subtotal - descuentoTotal
        val descuentoAgrupacionImporte = baseAntesAgrupacion * (request.descuentoAgrupacion / 100)
        val baseImponible = baseAntesAgrupacion - descuentoAgrupacionImporte

        val impuestosTotales = lineasCalculadas.sumOf { lineaCalc ->
            val subtotalLinea = lineaCalc.request.cantidad * lineaCalc.request.precioUnitario
            val descuentoLinea = subtotalLinea * (lineaCalc.request.descuento / 100)
            val baseLineaSinAgrupacion = subtotalLinea - descuentoLinea
            val baseLineaConAgrupacion = baseLineaSinAgrupacion * (1 - request.descuentoAgrupacion / 100)
            val ivaLinea = baseLineaConAgrupacion * (lineaCalc.impuestos.porcentajeIva / 100)
            val recargoLinea = baseLineaConAgrupacion * (lineaCalc.impuestos.porcentajeRecargo / 100)
            ivaLinea + recargoLinea
        }
        val total = baseImponible + impuestosTotales

        val fechaFactura = request.fecha?.let { parsearFecha(it) } ?: LocalDateTime.now()

        val nuevaFactura = FacturaCompra(
            numero = numeroFactura,
            fecha = fechaFactura,
            proveedor = proveedor,
            pedidoCompra = pedidoCompra,
            albaranCompra = albaranCompra,
            observaciones = request.observaciones ?: "",
            notas = request.notas ?: "",
            estado = request.estado,
            subtotal = subtotal,
            descuentoTotal = descuentoTotal,
            total = total,
            descuentoAgrupacion = request.descuentoAgrupacion,
            almacen = almacen,
            compraMultialmacen = request.compraMultialmacen,
            tarifa = tarifa,
            serie = numeracion.serie,
            anioDocumento = numeracion.anio,
            numeroSecuencial = numeracion.secuencial,
            codigoDocumento = numeroFactura,
            proveedorNombreComercial = proveedor?.nombreComercial,
            proveedorNombreFiscal = proveedor?.nombreFiscal,
            proveedorNifCif = proveedor?.nifCif,
            proveedorEmail = proveedor?.email,
            proveedorTelefono = proveedor?.telefonoFijo ?: proveedor?.telefonoMovil,
            direccionFacturacionPais = request.direccionFacturacionPais,
            direccionFacturacionCodigoPostal = request.direccionFacturacionCodigoPostal,
            direccionFacturacionProvincia = request.direccionFacturacionProvincia,
            direccionFacturacionPoblacion = request.direccionFacturacionPoblacion,
            direccionFacturacionDireccion = request.direccionFacturacionDireccion,
            direccionEnvioPais = request.direccionEnvioPais,
            direccionEnvioCodigoPostal = request.direccionEnvioCodigoPostal,
            direccionEnvioProvincia = request.direccionEnvioProvincia,
            direccionEnvioPoblacion = request.direccionEnvioPoblacion,
            direccionEnvioDireccion = request.direccionEnvioDireccion,
            direccionId = request.direccionId,
            recargoEquivalencia = request.recargoEquivalencia
        )

        val facturaGuardada = facturaCompraRepository.save(nuevaFactura)

        actualizarAdjuntosFactura(facturaGuardada.id, request.adjuntosIds)
        facturaGuardada.adjuntos = obtenerAdjuntos(facturaGuardada.id)

        lineasCalculadas.forEach { (lineaReq, producto, impuestos) ->
            val almacenLinea = lineaReq.almacenId?.let { almacenRepository.findById(it).orElse(null) }
            val linea = FacturaCompraLinea(
                facturaCompra = facturaGuardada,
                producto = producto,
                nombreProducto = lineaReq.nombreProducto,
                referencia = lineaReq.referencia ?: producto?.referencia,
                cantidad = lineaReq.cantidad,
                precioUnitario = lineaReq.precioUnitario,
                descuento = lineaReq.descuento,
                observaciones = lineaReq.observaciones,
                tipoIva = impuestos.tipoIva,
                porcentajeIva = impuestos.porcentajeIva,
                porcentajeRecargo = impuestos.porcentajeRecargo,
                importeIva = impuestos.importeIva,
                importeRecargo = impuestos.importeRecargo,
                almacen = almacenLinea
            )
            facturaGuardada.lineas.add(linea)
        }

        val facturaFinal = facturaCompraRepository.save(facturaGuardada)

        // Gestionar stock si el estado es Emitido (LÓGICA INVERSA A VENTAS - SUMA STOCK)
        val configuracion = configuracionVentasRepository.findTopByOrderByIdAsc()
        val documentoDescuentaStock = configuracion?.documentoDescuentaStock ?: "ALBARAN"
        val esEmitido = facturaFinal.estado == "Emitido"
        val vieneDeAlbaran = facturaFinal.albaranCompra != null
        val debeIncrementarStock = esEmitido && documentoDescuentaStock == "FACTURA"

        if (esEmitido) {
            if (vieneDeAlbaran && documentoDescuentaStock == "ALBARAN") {
                stockService.gestionarStockFacturaCompraConDiferencias(facturaFinal, "INCREMENTAR")
            } else if (debeIncrementarStock) {
                stockService.gestionarStockFacturaCompra(facturaFinal, "INCREMENTAR")
            }
        }

        return ResponseEntity.ok(cargarAdjuntos(facturaFinal))
    }

    @PutMapping("/{id}")
    @Transactional
    fun actualizar(
        @PathVariable id: Long,
        @RequestBody request: FacturaCompraRequest
    ): ResponseEntity<FacturaCompra> {
        return facturaCompraRepository.findById(id)
            .map { existente ->
                val proveedor = request.proveedorId?.let { proveedorRepository.findById(it).orElse(null) }
                val pedidoCompra = request.pedidoCompraId?.let { pedidoCompraRepository.findById(it).orElse(null) }
                val albaranCompra = request.albaranCompraId?.let { albaranCompraRepository.findById(it).orElse(null) }
                val almacen = request.almacenId?.let { almacenRepository.findById(it).orElse(null) }

                val tarifa = if (request.tarifaId != null) {
                    tarifaService.obtenerTarifasDisponibles().find { it.id == request.tarifaId }
                } else {
                    tarifaService.obtenerTarifaPorDefecto()
                }

                val lineasCalculadas = request.lineas.map { calcularLineaConImpuestos(it, proveedor, request.descuentoAgrupacion, usarValoresDelRequest = true, tarifa = tarifa) }

                val subtotal = lineasCalculadas.sumOf { it.request.cantidad * it.request.precioUnitario }
                val descuentoTotal = lineasCalculadas.sumOf {
                    (it.request.cantidad * it.request.precioUnitario) * (it.request.descuento / 100)
                }
                val baseAntesAgrupacion = subtotal - descuentoTotal
                val descuentoAgrupacionImporte = baseAntesAgrupacion * (request.descuentoAgrupacion / 100)
                val baseImponible = baseAntesAgrupacion - descuentoAgrupacionImporte

                val impuestosTotales = lineasCalculadas.sumOf { lineaCalc ->
                    val subtotalLinea = lineaCalc.request.cantidad * lineaCalc.request.precioUnitario
                    val descuentoLinea = subtotalLinea * (lineaCalc.request.descuento / 100)
                    val baseLineaSinAgrupacion = subtotalLinea - descuentoLinea
                    val baseLineaConAgrupacion = baseLineaSinAgrupacion * (1 - request.descuentoAgrupacion / 100)
                    val ivaLinea = baseLineaConAgrupacion * (lineaCalc.impuestos.porcentajeIva / 100)
                    val recargoLinea = baseLineaConAgrupacion * (lineaCalc.impuestos.porcentajeRecargo / 100)
                    ivaLinea + recargoLinea
                }
                val total = baseImponible + impuestosTotales

                val configuracion = configuracionVentasRepository.findTopByOrderByIdAsc()
                val documentoDescuentaStock = configuracion?.documentoDescuentaStock ?: "ALBARAN"

                val estadoAnterior = existente.estado
                val eraEmitido = estadoAnterior == "Emitido"
                val esEmitido = request.estado == "Emitido"
                val vieneDeAlbaran = existente.albaranCompra != null

                val debeRestaurarStock = eraEmitido && !esEmitido && documentoDescuentaStock == "FACTURA"
                val debeRestaurarDiferencias = eraEmitido && !esEmitido && vieneDeAlbaran && documentoDescuentaStock == "ALBARAN"

                if (debeRestaurarStock) {
                    stockService.gestionarStockFacturaCompra(existente, "DECREMENTAR")
                }
                if (debeRestaurarDiferencias) {
                    stockService.gestionarStockFacturaCompraConDiferencias(existente, "DECREMENTAR")
                }

                existente.lineas.clear()
                facturaCompraRepository.saveAndFlush(existente)

                val fechaActualizada = request.fecha?.let { parsearFecha(it) } ?: existente.fecha

                val actualizada = existente.copy(
                    numero = request.numero ?: existente.numero,
                    fecha = fechaActualizada,
                    proveedor = proveedor,
                    pedidoCompra = pedidoCompra,
                    albaranCompra = albaranCompra,
                    observaciones = request.observaciones ?: "",
                    notas = request.notas ?: "",
                    estado = request.estado,
                    subtotal = subtotal,
                    descuentoTotal = descuentoTotal,
                    total = total,
                    descuentoAgrupacion = request.descuentoAgrupacion,
                    almacen = almacen,
                    compraMultialmacen = request.compraMultialmacen,
                    tarifa = tarifa,
                    proveedorNombreComercial = proveedor?.nombreComercial,
                    proveedorNombreFiscal = proveedor?.nombreFiscal,
                    proveedorNifCif = proveedor?.nifCif,
                    proveedorEmail = proveedor?.email,
                    proveedorTelefono = proveedor?.telefonoFijo ?: proveedor?.telefonoMovil,
                    direccionFacturacionPais = request.direccionFacturacionPais,
                    direccionFacturacionCodigoPostal = request.direccionFacturacionCodigoPostal,
                    direccionFacturacionProvincia = request.direccionFacturacionProvincia,
                    direccionFacturacionPoblacion = request.direccionFacturacionPoblacion,
                    direccionFacturacionDireccion = request.direccionFacturacionDireccion,
                    direccionEnvioPais = request.direccionEnvioPais,
                    direccionEnvioCodigoPostal = request.direccionEnvioCodigoPostal,
                    direccionEnvioProvincia = request.direccionEnvioProvincia,
                    direccionEnvioPoblacion = request.direccionEnvioPoblacion,
                    direccionEnvioDireccion = request.direccionEnvioDireccion,
                    direccionId = request.direccionId,
                    recargoEquivalencia = request.recargoEquivalencia
                )

                val facturaGuardada = facturaCompraRepository.save(actualizada)

                actualizarAdjuntosFactura(facturaGuardada.id, request.adjuntosIds)
                facturaGuardada.adjuntos = obtenerAdjuntos(facturaGuardada.id)

                lineasCalculadas.forEach { (lineaReq, producto, impuestos) ->
                    val almacenLinea = lineaReq.almacenId?.let { almacenRepository.findById(it).orElse(null) }
                    val linea = FacturaCompraLinea(
                        facturaCompra = facturaGuardada,
                        producto = producto,
                        nombreProducto = lineaReq.nombreProducto,
                        referencia = lineaReq.referencia ?: producto?.referencia,
                        cantidad = lineaReq.cantidad,
                        precioUnitario = lineaReq.precioUnitario,
                        descuento = lineaReq.descuento,
                        observaciones = lineaReq.observaciones,
                        tipoIva = impuestos.tipoIva,
                        porcentajeIva = impuestos.porcentajeIva,
                        porcentajeRecargo = impuestos.porcentajeRecargo,
                        importeIva = impuestos.importeIva,
                        importeRecargo = impuestos.importeRecargo,
                        almacen = almacenLinea
                    )
                    facturaGuardada.lineas.add(linea)
                }

                val facturaFinal = facturaCompraRepository.save(facturaGuardada)

                val debeIncrementarStock = esEmitido && documentoDescuentaStock == "FACTURA"
                val debeAjustarDiferencias = esEmitido && vieneDeAlbaran && documentoDescuentaStock == "ALBARAN"

                if (debeIncrementarStock) {
                    stockService.gestionarStockFacturaCompra(facturaFinal, "INCREMENTAR")
                }

                if (debeAjustarDiferencias) {
                    stockService.gestionarStockFacturaCompraConDiferencias(facturaFinal, "INCREMENTAR")
                }

                ResponseEntity.ok(cargarAdjuntos(facturaFinal))
            }
            .orElse(ResponseEntity.notFound().build())
    }

    @DeleteMapping("/{id}")
    fun eliminar(@PathVariable id: Long): ResponseEntity<Void> {
        return if (facturaCompraRepository.existsById(id)) {
            facturaCompraRepository.deleteById(id)
            ResponseEntity.ok().build()
        } else {
            ResponseEntity.notFound().build()
        }
    }

    @PostMapping("/{id}/adjuntos")
    fun vincularAdjuntos(
        @PathVariable id: Long,
        @RequestBody adjuntosIds: List<Long>
    ): ResponseEntity<Void> {
        return facturaCompraRepository.findById(id)
            .map {
                actualizarAdjuntosFactura(id, adjuntosIds)
                ResponseEntity.ok().build<Void>()
            }
            .orElse(ResponseEntity.notFound().build())
    }

    // Métodos auxiliares
    private fun prepararNumeracionParaNuevaFactura(request: FacturaCompraRequest): SerieNumeracionService.NumeroSerieResult {
        return if (request.usarCodigoManual && !request.numero.isNullOrBlank()) {
            val serie = serieNumeracionService.obtenerSerieAplicable(DOCUMENTO_SERIE_TIPO, request.serieId, null)
            SerieNumeracionService.NumeroSerieResult(
                codigo = request.numero,
                serie = serie,
                anio = java.time.LocalDate.now().year,
                secuencial = 0
            )
        } else {
            serieNumeracionService.generarYReservarNumero(DOCUMENTO_SERIE_TIPO, request.serieId, null)
        }
    }

    private fun calcularLineaConImpuestos(
        lineaReq: FacturaCompraLineaRequest,
        proveedor: Proveedor?,
        descuentoAgrupacion: Double = 0.0,
        usarValoresDelRequest: Boolean = false,
        tarifa: com.example.demo.model.Tarifa? = null
    ): LineaImpuesto<FacturaCompraLineaRequest> {
        val producto = lineaReq.productoId?.let { productoRepository.findById(it).orElse(null) }
        
        val precioUnitario = if (lineaReq.precioUnitario > 0.0) {
            lineaReq.precioUnitario
        } else if (producto != null && tarifa != null) {
            val precioTarifa = tarifaService.obtenerPrecioProducto(producto, tarifa.id)
            precioTarifa?.precio ?: 0.0
        } else {
            0.0
        }
        
        val subtotalLinea = lineaReq.cantidad * precioUnitario
        val descuentoLineaImporte = subtotalLinea * (lineaReq.descuento / 100)
        val baseAntesAgrupacion = subtotalLinea - descuentoLineaImporte
        val descuentoAgrupacionImporte = baseAntesAgrupacion * (descuentoAgrupacion / 100)
        val baseImponibleLinea = baseAntesAgrupacion - descuentoAgrupacionImporte
        
        if (usarValoresDelRequest && lineaReq.tipoIvaId != null) {
            val tipoIva = tipoIvaRepository.findById(lineaReq.tipoIvaId).orElse(null)
            val porcentajeIva = tipoIva?.porcentajeIva ?: lineaReq.porcentajeIva
            val porcentajeRecargo = if (proveedor?.recargoEquivalencia == true) {
                tipoIva?.porcentajeRecargo ?: lineaReq.porcentajeRecargo
            } else 0.0
            
            val importeIva = baseImponibleLinea * (porcentajeIva / 100)
            val importeRecargo = baseImponibleLinea * (porcentajeRecargo / 100)
            
            val impuestos = ImpuestoCalculo(
                tipoIva = tipoIva,
                porcentajeIva = porcentajeIva,
                porcentajeRecargo = porcentajeRecargo,
                importeIva = importeIva,
                importeRecargo = importeRecargo
            )
            return LineaImpuesto(lineaReq, producto, impuestos)
        }
        
        val impuestos = impuestoService.calcularImpuestosProveedor(
            producto = producto,
            proveedor = proveedor,
            cantidad = lineaReq.cantidad,
            precioUnitario = lineaReq.precioUnitario,
            descuento = lineaReq.descuento,
            descuentoAgrupacion = descuentoAgrupacion
        )
        return LineaImpuesto(lineaReq, producto, impuestos)
    }

    private fun cargarAdjuntos(factura: FacturaCompra): FacturaCompra {
        factura.adjuntos = obtenerAdjuntos(factura.id)
        return factura
    }

    private fun obtenerAdjuntos(facturaId: Long): List<com.example.demo.model.ArchivoEmpresa> {
        return archivoEmpresaRepository.findByDocumentoOrigenAndDocumentoOrigenId("FACTURA_COMPRA", facturaId)
    }

    private fun actualizarAdjuntosFactura(facturaId: Long, adjuntosIds: List<Long>) {
        val adjuntosExistentes = archivoEmpresaRepository.findByDocumentoOrigenAndDocumentoOrigenId("FACTURA_COMPRA", facturaId)
        adjuntosExistentes.forEach { adjunto ->
            val adjuntoDesvinculado = adjunto.copy(
                documentoOrigen = null,
                documentoOrigenId = null
            )
            archivoEmpresaRepository.save(adjuntoDesvinculado)
        }
        
        adjuntosIds.forEach { archivoId ->
            val archivo = archivoEmpresaRepository.findById(archivoId).orElse(null)
            if (archivo != null) {
                val archivoActualizado = archivo.copy(
                    documentoOrigen = "FACTURA_COMPRA",
                    documentoOrigenId = facturaId
                )
                archivoEmpresaRepository.save(archivoActualizado)
            }
        }
    }

    // ========== TRANSFORMACIONES ==========

    @PostMapping("/transformar")
    @Transactional
    fun transformarDocumento(@RequestBody request: TransformarDocumentoCompraRequest): ResponseEntity<Any> {
        if (request.tipoDestino != "FACTURA_COMPRA") {
            return ResponseEntity.badRequest().body(mapOf("error" to "Este endpoint solo crea facturas de compra"))
        }

        // Determinar si el origen es un albarán emitido (para lógica de stock)
        var albaranOrigenEmitido: AlbaranCompra? = null

        val (proveedor, lineasOrigen, descuentoAgrupacion, almacenOrigen, tarifaOrigen, observaciones, notas, snap) = when (request.tipoOrigen) {
            "ALBARAN_COMPRA" -> {
                val origen = albaranCompraRepository.findById(request.idOrigen).orElse(null)
                    ?: return ResponseEntity.badRequest().body(mapOf("error" to "Albarán de compra no encontrado"))
                if (origen.estado == "Emitido") albaranOrigenEmitido = origen
                OrigenFacturaData(origen.proveedor, origen.lineas.map { LineaOrigenFactura(it.producto, it.nombreProducto, it.referencia, it.cantidad.toDouble(), it.precioUnitario, it.descuento, it.observaciones ?: "", it.tipoIva, it.porcentajeIva, it.porcentajeRecargo, it.importeIva, it.importeRecargo, it.almacen) }, origen.descuentoAgrupacion, origen.almacen, origen.tarifa, origen.observaciones ?: "", origen.notas ?: "", SnapFactura(origen.proveedorNombreComercial, origen.proveedorNombreFiscal, origen.proveedorNifCif, origen.proveedorEmail, origen.proveedorTelefono, origen.direccionFacturacionPais, origen.direccionFacturacionCodigoPostal, origen.direccionFacturacionProvincia, origen.direccionFacturacionPoblacion, origen.direccionFacturacionDireccion, origen.direccionEnvioPais, origen.direccionEnvioCodigoPostal, origen.direccionEnvioProvincia, origen.direccionEnvioPoblacion, origen.direccionEnvioDireccion, origen.recargoEquivalencia, origen.compraMultialmacen, origen.direccionId))
            }
            "PEDIDO_COMPRA" -> {
                val origen = pedidoCompraRepository.findById(request.idOrigen).orElse(null)
                    ?: return ResponseEntity.badRequest().body(mapOf("error" to "Pedido de compra no encontrado"))
                OrigenFacturaData(origen.proveedor, origen.lineas.map { LineaOrigenFactura(it.producto, it.nombreProducto, it.referencia, it.cantidad, it.precioUnitario, it.descuento, it.observaciones ?: "", it.tipoIva, it.porcentajeIva, it.porcentajeRecargo, it.importeIva, it.importeRecargo, it.almacen) }, origen.descuentoAgrupacion, origen.almacen, origen.tarifa, origen.observaciones ?: "", origen.notas ?: "", SnapFactura(origen.proveedorNombreComercial, origen.proveedorNombreFiscal, origen.proveedorNifCif, origen.proveedorEmail, origen.proveedorTelefono, origen.direccionFacturacionPais, origen.direccionFacturacionCodigoPostal, origen.direccionFacturacionProvincia, origen.direccionFacturacionPoblacion, origen.direccionFacturacionDireccion, origen.direccionEnvioPais, origen.direccionEnvioCodigoPostal, origen.direccionEnvioProvincia, origen.direccionEnvioPoblacion, origen.direccionEnvioDireccion, origen.recargoEquivalencia, origen.compraMultialmacen ?: false, origen.direccionId))
            }
            "PRESUPUESTO_COMPRA" -> {
                val origen = presupuestoCompraRepository.findById(request.idOrigen).orElse(null)
                    ?: return ResponseEntity.badRequest().body(mapOf("error" to "Presupuesto de compra no encontrado"))
                OrigenFacturaData(origen.proveedor, origen.lineas.map { LineaOrigenFactura(it.producto, it.nombreProducto, it.referencia, it.cantidad, it.precioUnitario, it.descuento, it.observaciones ?: "", it.tipoIva, it.porcentajeIva, it.porcentajeRecargo, it.importeIva, it.importeRecargo, it.almacen) }, origen.descuentoAgrupacion, origen.almacen, origen.tarifa, origen.observaciones ?: "", origen.notas ?: "", SnapFactura(origen.proveedorNombreComercial, origen.proveedorNombreFiscal, origen.proveedorNifCif, origen.proveedorEmail, origen.proveedorTelefono, origen.direccionFacturacionPais, origen.direccionFacturacionCodigoPostal, origen.direccionFacturacionProvincia, origen.direccionFacturacionPoblacion, origen.direccionFacturacionDireccion, origen.direccionEnvioPais, origen.direccionEnvioCodigoPostal, origen.direccionEnvioProvincia, origen.direccionEnvioPoblacion, origen.direccionEnvioDireccion, origen.recargoEquivalencia, origen.compraMultialmacen ?: false, origen.direccionId))
            }
            "FACTURA_COMPRA" -> {
                val origen = facturaCompraRepository.findById(request.idOrigen).orElse(null)
                    ?: return ResponseEntity.badRequest().body(mapOf("error" to "Factura de compra no encontrada"))
                OrigenFacturaData(origen.proveedor, origen.lineas.map { LineaOrigenFactura(it.producto, it.nombreProducto, it.referencia, it.cantidad.toDouble(), it.precioUnitario, it.descuento, it.observaciones ?: "", it.tipoIva, it.porcentajeIva, it.porcentajeRecargo, it.importeIva, it.importeRecargo, it.almacen) }, origen.descuentoAgrupacion, origen.almacen, origen.tarifa, origen.observaciones ?: "", origen.notas ?: "", SnapFactura(origen.proveedorNombreComercial, origen.proveedorNombreFiscal, origen.proveedorNifCif, origen.proveedorEmail, origen.proveedorTelefono, origen.direccionFacturacionPais, origen.direccionFacturacionCodigoPostal, origen.direccionFacturacionProvincia, origen.direccionFacturacionPoblacion, origen.direccionFacturacionDireccion, origen.direccionEnvioPais, origen.direccionEnvioCodigoPostal, origen.direccionEnvioProvincia, origen.direccionEnvioPoblacion, origen.direccionEnvioDireccion, origen.recargoEquivalencia, origen.compraMultialmacen, origen.direccionId))
            }
            // Orígenes de ventas (transformación cruzada compra)
            "FACTURA_PROFORMA" -> return ResponseEntity.badRequest().body(mapOf("error" to "Factura Proforma no puede transformarse a documentos de compra"))
            "PRESUPUESTO" -> {
                val origen = presupuestoVentaRepository.findById(request.idOrigen).orElse(null)
                    ?: return ResponseEntity.badRequest().body(mapOf("error" to "Presupuesto no encontrado"))
                val proveedor = request.proveedorId?.let { proveedorRepository.findById(it).orElse(null) }
                OrigenFacturaData(proveedor, origen.lineas.map { LineaOrigenFactura(it.producto, it.nombreProducto, it.referencia, it.cantidad.toDouble(), it.precioUnitario, it.descuento, it.observaciones ?: "", it.tipoIva, it.porcentajeIva, it.porcentajeRecargo, it.importeIva, it.importeRecargo, it.almacen) }, origen.descuentoAgrupacion, origen.almacen, origen.tarifa, origen.observaciones ?: "", origen.notas ?: "", SnapFactura(null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, false, false, null))
            }
            "PEDIDO" -> {
                val origen = pedidoVentaRepository.findById(request.idOrigen).orElse(null)
                    ?: return ResponseEntity.badRequest().body(mapOf("error" to "Pedido no encontrado"))
                val proveedor = request.proveedorId?.let { proveedorRepository.findById(it).orElse(null) }
                OrigenFacturaData(proveedor, origen.lineas.map { LineaOrigenFactura(it.producto, it.nombreProducto, it.referencia, it.cantidad.toDouble(), it.precioUnitario, it.descuento, it.observaciones ?: "", it.tipoIva, it.porcentajeIva, it.porcentajeRecargo, it.importeIva, it.importeRecargo, it.almacen) }, origen.descuentoAgrupacion, origen.almacen, origen.tarifa, origen.observaciones ?: "", origen.notas ?: "", SnapFactura(null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, false, false, null))
            }
            "ALBARAN" -> {
                val origen = albaranVentaRepository.findById(request.idOrigen).orElse(null)
                    ?: return ResponseEntity.badRequest().body(mapOf("error" to "Albarán no encontrado"))
                if (origen.estado == "Emitido") albaranOrigenEmitido = null // No es albarán de compra, sin efecto stock especial
                val proveedor = request.proveedorId?.let { proveedorRepository.findById(it).orElse(null) }
                OrigenFacturaData(proveedor, origen.lineas.map { LineaOrigenFactura(it.producto, it.nombreProducto, it.referencia, it.cantidad.toDouble(), it.precioUnitario, it.descuento, it.observaciones ?: "", it.tipoIva, it.porcentajeIva, it.porcentajeRecargo, it.importeIva, it.importeRecargo, it.almacen) }, origen.descuentoAgrupacion, origen.almacen, origen.tarifa, origen.observaciones ?: "", origen.notas ?: "", SnapFactura(null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, false, origen.ventaMultialmacen, null))
            }
            "FACTURA" -> {
                val origen = facturaVentaRepository.findById(request.idOrigen).orElse(null)
                    ?: return ResponseEntity.badRequest().body(mapOf("error" to "Factura no encontrada"))
                val proveedor = request.proveedorId?.let { proveedorRepository.findById(it).orElse(null) }
                OrigenFacturaData(proveedor, origen.lineas.map { LineaOrigenFactura(it.producto, it.nombreProducto, it.referencia, it.cantidad.toDouble(), it.precioUnitario, it.descuento, it.observaciones ?: "", it.tipoIva, it.porcentajeIva, it.porcentajeRecargo, it.importeIva, it.importeRecargo, it.almacen) }, origen.descuentoAgrupacion, origen.almacen, origen.tarifa, origen.observaciones ?: "", origen.notas ?: "", SnapFactura(null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, false, origen.ventaMultialmacen ?: false, null))
            }
            "FACTURA_RECTIFICATIVA" -> {
                val origen = facturaRectificativaRepository.findById(request.idOrigen).orElse(null)
                    ?: return ResponseEntity.badRequest().body(mapOf("error" to "Factura rectificativa no encontrada"))
                val proveedor = request.proveedorId?.let { proveedorRepository.findById(it).orElse(null) }
                OrigenFacturaData(proveedor, origen.lineas.map { LineaOrigenFactura(it.producto, it.nombreProducto, it.referencia, it.cantidad.toDouble(), it.precioUnitario, it.descuento, it.observaciones ?: "", it.tipoIva, it.porcentajeIva, it.porcentajeRecargo, it.importeIva, it.importeRecargo, it.almacen) }, origen.descuentoAgrupacion ?: 0.0, origen.almacen, null, origen.observaciones ?: "", origen.notas ?: "", SnapFactura(null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, false, false, null))
            }
            else -> return ResponseEntity.badRequest().body(mapOf("error" to "Tipo de origen no soportado: ${request.tipoOrigen}"))
        }

        val numeracion = serieNumeracionService.generarYReservarNumero(DOCUMENTO_SERIE_TIPO, request.serieId, usuarioId = null)
        val fechaTransformada = request.fecha?.let { parsearFecha(it) } ?: LocalDateTime.now()

        val subtotal = lineasOrigen.sumOf { it.cantidad * it.precioUnitario }
        val descuentoTotal = lineasOrigen.sumOf { (it.cantidad * it.precioUnitario) * (it.descuento / 100) }
        val baseAntesAgrupacion = subtotal - descuentoTotal
        val descuentoAgrupacionImporte = baseAntesAgrupacion * (descuentoAgrupacion / 100)
        val baseImponible = baseAntesAgrupacion - descuentoAgrupacionImporte
        val impuestosTotales = lineasOrigen.sumOf { linea ->
            val subtotalLinea = linea.cantidad * linea.precioUnitario
            val descuentoLinea = subtotalLinea * (linea.descuento / 100)
            val baseLineaSinAgrupacion = subtotalLinea - descuentoLinea
            val baseLineaConAgrupacion = baseLineaSinAgrupacion * (1 - descuentoAgrupacion / 100)
            val ivaLinea = baseLineaConAgrupacion * (linea.porcentajeIva / 100)
            val recargoLinea = baseLineaConAgrupacion * (linea.porcentajeRecargo / 100)
            ivaLinea + recargoLinea
        }
        val total = baseImponible + impuestosTotales

        // Si viene de un albarán, vincular
        val albaranCompraVinculado = if (request.tipoOrigen == "ALBARAN_COMPRA") {
            albaranCompraRepository.findById(request.idOrigen).orElse(null)
        } else null

        val nuevaFactura = FacturaCompra(
            numero = numeracion.codigo,
            fecha = fechaTransformada,
            proveedor = proveedor,
            albaranCompra = albaranCompraVinculado,
            observaciones = observaciones,
            notas = notas,
            estado = request.estado,
            subtotal = subtotal,
            descuentoTotal = descuentoTotal,
            total = total,
            descuentoAgrupacion = descuentoAgrupacion,
            almacen = almacenOrigen,
            compraMultialmacen = snap.compraMultialmacen,
            tarifa = tarifaOrigen,
            serie = numeracion.serie,
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
            recargoEquivalencia = snap.recargoEquivalencia
        )

        val facturaGuardada = facturaCompraRepository.save(nuevaFactura)

        lineasOrigen.forEach { linea ->
            val nuevaLinea = FacturaCompraLinea(
                facturaCompra = facturaGuardada,
                producto = linea.producto,
                nombreProducto = linea.nombreProducto,
                referencia = linea.referencia ?: linea.producto?.referencia,
                cantidad = linea.cantidad.toInt(),
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
            facturaGuardada.lineas.add(nuevaLinea)
        }

        val facturaFinal = facturaCompraRepository.save(facturaGuardada)

        // Gestionar stock si el estado es Emitido
        if (request.estado == "Emitido") {
            val configuracion = configuracionVentasRepository.findTopByOrderByIdAsc()
            val documentoDescuentaStock = configuracion?.documentoDescuentaStock ?: "ALBARAN"

            if (albaranOrigenEmitido != null && documentoDescuentaStock == "ALBARAN") {
                // Albarán origen ya estaba emitido y config dice ALBARAN descuenta stock
                // Solo ajustar diferencias (en este caso no hay porque las cantidades son iguales)
                stockService.gestionarStockFacturaCompraConDiferencias(facturaFinal, "INCREMENTAR")
            } else if (documentoDescuentaStock == "FACTURA") {
                // La factura es la que gestiona stock
                stockService.gestionarStockFacturaCompra(facturaFinal, "INCREMENTAR")
            }
        }

        // Registrar transformación solo si NO es duplicación
        if (!request.esDuplicacion) {
            val numeroOrigen = obtenerNumeroDocumentoOrigen(request.tipoOrigen, request.idOrigen)
            val transformacion = DocumentoTransformacion(
                tipoOrigen = request.tipoOrigen,
                idOrigen = request.idOrigen,
                numeroOrigen = numeroOrigen,
                tipoDestino = "FACTURA_COMPRA",
                idDestino = facturaFinal.id,
                numeroDestino = facturaFinal.numero,
                tipoTransformacion = "CONVERTIR",
                fechaTransformacion = java.time.LocalDateTime.now()
            )
            documentoTransformacionRepository.save(transformacion)
        }

        return ResponseEntity.ok(cargarAdjuntos(facturaFinal))
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

    private data class LineaOrigenFactura(
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

    private data class SnapFactura(
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

    private data class OrigenFacturaData(
        val proveedor: com.example.demo.model.Proveedor?,
        val lineas: List<LineaOrigenFactura>,
        val descuentoAgrupacion: Double,
        val almacen: com.example.demo.model.Almacen?,
        val tarifa: com.example.demo.model.Tarifa?,
        val observaciones: String,
        val notas: String,
        val snapshot: SnapFactura
    )
}
