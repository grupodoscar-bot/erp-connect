package com.example.demo.controller.compras

import com.example.demo.model.Almacen
import com.example.demo.model.Proveedor
import com.example.demo.model.compras.AlbaranCompra
import com.example.demo.model.compras.AlbaranCompraLinea
import com.example.demo.model.compras.PedidoCompra
import com.example.demo.model.ventas.DocumentoTransformacion
import com.example.demo.repository.AlmacenRepository
import com.example.demo.repository.ArchivoEmpresaRepository
import com.example.demo.repository.ConfiguracionVentasRepository
import com.example.demo.repository.ProductoAlmacenRepository
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
@RequestMapping("/albaranes-compra")
@CrossOrigin(origins = ["http://145.223.103.219:3000"])
class AlbaranCompraController(
    private val albaranCompraRepository: AlbaranCompraRepository,
    private val facturaCompraRepository: FacturaCompraRepository,
    private val pedidoCompraRepository: PedidoCompraRepository,
    private val proveedorRepository: ProveedorRepository,
    private val productoRepository: ProductoRepository,
    private val productoAlmacenRepository: ProductoAlmacenRepository,
    private val tipoIvaRepository: TipoIvaRepository,
    private val archivoEmpresaRepository: ArchivoEmpresaRepository,
    private val almacenRepository: AlmacenRepository,
    private val serieNumeracionService: SerieNumeracionService,
    private val stockService: StockService,
    private val tarifaService: TarifaService,
    private val impuestoService: ImpuestoService,
    private val presupuestoCompraRepository: PresupuestoCompraRepository,
    private val documentoTransformacionRepository: DocumentoTransformacionRepository,
    private val configuracionVentasRepository: ConfiguracionVentasRepository,
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
        private const val DOCUMENTO_SERIE_TIPO = "ALBARAN_COMPRA"
    }

    @GetMapping
    fun listarTodos(): List<AlbaranCompra> =
        albaranCompraRepository.findAll().map { cargarAdjuntos(it) }

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
        val albaranesPage: Page<AlbaranCompra> = albaranCompraRepository.findAll(pageRequest)

        var albaranesFiltrados = albaranesPage.content.toList()

        if (!search.isNullOrBlank()) {
            albaranesFiltrados = albaranesFiltrados.filter { albaran ->
                albaran.numero.contains(search, ignoreCase = true) ||
                albaran.proveedor?.nombreComercial?.contains(search, ignoreCase = true) == true ||
                albaran.proveedor?.nombreFiscal?.contains(search, ignoreCase = true) == true
            }
        }

        if (!estado.isNullOrBlank()) {
            albaranesFiltrados = albaranesFiltrados.filter { it.estado == estado }
        }

        if (contabilizado != null) {
            albaranesFiltrados = albaranesFiltrados.filter { it.contabilizado == contabilizado }
        }

        val albaranesConAdjuntos = albaranesFiltrados.map { cargarAdjuntos(it) }

        val response = mapOf<String, Any>(
            "content" to albaranesConAdjuntos,
            "totalElements" to albaranesPage.totalElements,
            "totalPages" to albaranesPage.totalPages,
            "currentPage" to albaranesPage.number,
            "pageSize" to albaranesPage.size,
            "hasNext" to albaranesPage.hasNext(),
            "hasPrevious" to albaranesPage.hasPrevious()
        )

        return ResponseEntity.ok(response)
    }

    @GetMapping("/{id}")
    fun obtenerPorId(@PathVariable id: Long): ResponseEntity<AlbaranCompra> =
        albaranCompraRepository.findById(id)
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

    @GetMapping("/tarifas-disponibles")
    fun obtenerTarifasDisponibles(): ResponseEntity<Map<String, Any?>> {
        val tarifas = tarifaService.obtenerTarifasDisponibles()
        val esMultitarifaPermitida = tarifaService.esMultitarifaPermitida()
        val tarifaPorDefecto = tarifaService.obtenerTarifaPorDefecto()

        val response = mapOf(
            "tarifas" to tarifas,
            "esMultitarifaPermitida" to esMultitarifaPermitida,
            "tarifaPorDefecto" to tarifaPorDefecto
        )
        return ResponseEntity.ok(response)
    }

    @GetMapping("/precio-producto")
    fun obtenerPrecioProducto(
        @RequestParam productoId: Long,
        @RequestParam(required = false) tarifaId: Long?
    ): ResponseEntity<Map<String, Any>> {
        val producto = productoRepository.findById(productoId).orElse(null)
            ?: return ResponseEntity.badRequest().body(mapOf("error" to "Producto no encontrado"))

        val precioProducto = tarifaService.obtenerPrecioProducto(producto, tarifaId)

        return if (precioProducto != null) {
            ResponseEntity.ok(mapOf(
                "precio" to precioProducto.precio,
                "descuento" to precioProducto.descuento,
                "precioBloqueado" to precioProducto.precioBloqueado,
                "margen" to precioProducto.margen,
                "precioConImpuestos" to precioProducto.precioConImpuestos,
                "tarifa" to mapOf(
                    "id" to precioProducto.tarifa.id,
                    "nombre" to precioProducto.tarifa.nombre
                )
            ))
        } else {
            ResponseEntity.badRequest().body(mapOf(
                "error" to "No se encontró precio para este producto en la tarifa especificada"
            ))
        }
    }

    @PostMapping
    fun crear(@RequestBody request: AlbaranCompraRequest): ResponseEntity<AlbaranCompra> {
        val proveedor = request.proveedorId?.let { proveedorRepository.findById(it).orElse(null) }
        val almacen = request.almacenId?.let { almacenRepository.findById(it).orElse(null) }

        val tarifa = if (request.tarifaId != null) {
            tarifaService.obtenerTarifasDisponibles().find { it.id == request.tarifaId }
        } else {
            tarifaService.obtenerTarifaPorDefecto()
        }

        val numeracion = prepararNumeracionParaNuevoAlbaran(request)
        val numeroAlbaran = numeracion.codigo

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

        val fechaAlbaran = request.fecha?.let { parsearFecha(it) } ?: LocalDateTime.now()

        val nuevoAlbaran = AlbaranCompra(
            numero = numeroAlbaran,
            fecha = fechaAlbaran,
            proveedor = proveedor,
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
            codigoDocumento = numeroAlbaran,
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

        val albaranGuardado = albaranCompraRepository.save(nuevoAlbaran)

        actualizarAdjuntosAlbaran(albaranGuardado.id, request.adjuntosIds)
        albaranGuardado.adjuntos = obtenerAdjuntos(albaranGuardado.id)

        lineasCalculadas.forEach { (lineaReq, producto, impuestos) ->
            val almacenLinea = lineaReq.almacenId?.let { almacenRepository.findById(it).orElse(null) }
            val linea = AlbaranCompraLinea(
                albaranCompra = albaranGuardado,
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
            albaranGuardado.lineas.add(linea)
        }

        return ResponseEntity.ok(albaranCompraRepository.save(albaranGuardado))
    }

    @PutMapping("/{id}")
    @Transactional
    fun actualizar(
        @PathVariable id: Long,
        @RequestBody datos: AlbaranCompraRequest
    ): ResponseEntity<AlbaranCompra> {
        return albaranCompraRepository.findById(id)
            .map { existente ->
                val proveedor = datos.proveedorId?.let { proveedorRepository.findById(it).orElse(null) }
                val almacen = datos.almacenId?.let { almacenRepository.findById(it).orElse(null) }

                val tarifa = if (datos.tarifaId != null) {
                    tarifaService.obtenerTarifasDisponibles().find { it.id == datos.tarifaId }
                } else {
                    tarifaService.obtenerTarifaPorDefecto()
                }

                val lineasCalculadas = datos.lineas.map { calcularLineaConImpuestos(it, proveedor, datos.descuentoAgrupacion, usarValoresDelRequest = true, tarifa = tarifa) }

                val subtotal = lineasCalculadas.sumOf { it.request.cantidad * it.request.precioUnitario }
                val descuentoTotal = lineasCalculadas.sumOf {
                    (it.request.cantidad * it.request.precioUnitario) * (it.request.descuento / 100)
                }
                val baseAntesAgrupacion = subtotal - descuentoTotal
                val descuentoAgrupacionImporte = baseAntesAgrupacion * (datos.descuentoAgrupacion / 100)
                val baseImponible = baseAntesAgrupacion - descuentoAgrupacionImporte

                val impuestosTotales = lineasCalculadas.sumOf { lineaCalc ->
                    val subtotalLinea = lineaCalc.request.cantidad * lineaCalc.request.precioUnitario
                    val descuentoLinea = subtotalLinea * (lineaCalc.request.descuento / 100)
                    val baseLineaSinAgrupacion = subtotalLinea - descuentoLinea
                    val baseLineaConAgrupacion = baseLineaSinAgrupacion * (1 - datos.descuentoAgrupacion / 100)
                    val ivaLinea = baseLineaConAgrupacion * (lineaCalc.impuestos.porcentajeIva / 100)
                    val recargoLinea = baseLineaConAgrupacion * (lineaCalc.impuestos.porcentajeRecargo / 100)
                    ivaLinea + recargoLinea
                }
                val total = baseImponible + impuestosTotales

                val estadoAnterior = existente.estado
                val lineasAnteriores = existente.lineas.toList()
                val compraMultialmacenAnterior = existente.compraMultialmacen
                val almacenAnterior = existente.almacen

                existente.lineas.clear()
                albaranCompraRepository.saveAndFlush(existente)

                val fechaActualizada = datos.fecha?.let { parsearFecha(it) } ?: existente.fecha

                val actualizado = existente.copy(
                    numero = datos.numero ?: existente.numero,
                    fecha = fechaActualizada,
                    proveedor = proveedor,
                    observaciones = datos.observaciones ?: "",
                    notas = datos.notas ?: "",
                    estado = datos.estado,
                    subtotal = subtotal,
                    descuentoTotal = descuentoTotal,
                    total = total,
                    descuentoAgrupacion = datos.descuentoAgrupacion,
                    almacen = almacen,
                    compraMultialmacen = datos.compraMultialmacen,
                    tarifa = tarifa,
                    proveedorNombreComercial = proveedor?.nombreComercial,
                    proveedorNombreFiscal = proveedor?.nombreFiscal,
                    proveedorNifCif = proveedor?.nifCif,
                    proveedorEmail = proveedor?.email,
                    proveedorTelefono = proveedor?.telefonoFijo ?: proveedor?.telefonoMovil,
                    direccionFacturacionPais = datos.direccionFacturacionPais,
                    direccionFacturacionCodigoPostal = datos.direccionFacturacionCodigoPostal,
                    direccionFacturacionProvincia = datos.direccionFacturacionProvincia,
                    direccionFacturacionPoblacion = datos.direccionFacturacionPoblacion,
                    direccionFacturacionDireccion = datos.direccionFacturacionDireccion,
                    direccionEnvioPais = datos.direccionEnvioPais,
                    direccionEnvioCodigoPostal = datos.direccionEnvioCodigoPostal,
                    direccionEnvioProvincia = datos.direccionEnvioProvincia,
                    direccionEnvioPoblacion = datos.direccionEnvioPoblacion,
                    direccionEnvioDireccion = datos.direccionEnvioDireccion,
                    direccionId = datos.direccionId,
                    recargoEquivalencia = datos.recargoEquivalencia
                )

                val albaranGuardado = albaranCompraRepository.save(actualizado)

                actualizarAdjuntosAlbaran(albaranGuardado.id, datos.adjuntosIds)
                albaranGuardado.adjuntos = obtenerAdjuntos(albaranGuardado.id)

                lineasCalculadas.forEach { (lineaReq, producto, impuestos) ->
                    val almacenLinea = lineaReq.almacenId?.let { almacenRepository.findById(it).orElse(null) }
                    val linea = AlbaranCompraLinea(
                        albaranCompra = albaranGuardado,
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
                    albaranGuardado.lineas.add(linea)
                }

                val albaranFinal = albaranCompraRepository.save(albaranGuardado)

                // Gestionar stock según el cambio de estado (LÓGICA INVERSA A VENTAS)
                stockService.gestionarStockAlbaranCompra(
                    albaranCompraActualizado = albaranFinal,
                    estadoAnterior = estadoAnterior,
                    lineasAnteriores = lineasAnteriores,
                    compraMultialmacenAnterior = compraMultialmacenAnterior,
                    almacenAnterior = almacenAnterior
                )

                ResponseEntity.ok(cargarAdjuntos(albaranFinal))
            }
            .orElse(ResponseEntity.notFound().build())
    }

    @DeleteMapping("/{id}")
    fun eliminar(@PathVariable id: Long): ResponseEntity<Void> {
        return if (albaranCompraRepository.existsById(id)) {
            albaranCompraRepository.deleteById(id)
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
        return albaranCompraRepository.findById(id)
            .map {
                actualizarAdjuntosAlbaran(id, adjuntosIds)
                ResponseEntity.ok().build<Void>()
            }
            .orElse(ResponseEntity.notFound().build())
    }

    // Métodos auxiliares
    private fun prepararNumeracionParaNuevoAlbaran(request: AlbaranCompraRequest): SerieNumeracionService.NumeroSerieResult {
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
        lineaReq: AlbaranCompraLineaRequest,
        proveedor: Proveedor?,
        descuentoAgrupacion: Double = 0.0,
        usarValoresDelRequest: Boolean = false,
        tarifa: com.example.demo.model.Tarifa? = null
    ): LineaImpuesto<AlbaranCompraLineaRequest> {
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

    private fun cargarAdjuntos(albaran: AlbaranCompra): AlbaranCompra {
        albaran.adjuntos = obtenerAdjuntos(albaran.id)
        return albaran
    }

    private fun obtenerAdjuntos(albaranId: Long): List<com.example.demo.model.ArchivoEmpresa> {
        return archivoEmpresaRepository.findByDocumentoOrigenAndDocumentoOrigenId("ALBARAN_COMPRA", albaranId)
    }

    private fun actualizarAdjuntosAlbaran(albaranId: Long, adjuntosIds: List<Long>) {
        val adjuntosExistentes = archivoEmpresaRepository.findByDocumentoOrigenAndDocumentoOrigenId("ALBARAN_COMPRA", albaranId)
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
                    documentoOrigen = "ALBARAN_COMPRA",
                    documentoOrigenId = albaranId
                )
                archivoEmpresaRepository.save(archivoActualizado)
            }
        }
    }

    // ========== TRANSFORMACIONES ==========

    @PostMapping("/transformar")
    @Transactional
    fun transformarDocumento(@RequestBody request: TransformarDocumentoCompraRequest): ResponseEntity<Any> {
        // Obtener líneas y datos del documento origen
        val (proveedor, lineasOrigen, descuentoAgrupacion, almacenOrigen, tarifaOrigen, observaciones, notas, snapshotData) = when (request.tipoOrigen) {
            "ALBARAN_COMPRA" -> {
                val origen = albaranCompraRepository.findById(request.idOrigen).orElse(null)
                    ?: return ResponseEntity.badRequest().body(mapOf("error" to "Albarán de compra no encontrado"))
                OrigenCompraData(
                    proveedor = origen.proveedor,
                    lineas = origen.lineas.map { LineaOrigenCompra(it.producto, it.nombreProducto, it.referencia, it.cantidad.toDouble(), it.precioUnitario, it.descuento, it.observaciones ?: "", it.tipoIva, it.porcentajeIva, it.porcentajeRecargo, it.importeIva, it.importeRecargo, it.almacen) },
                    descuentoAgrupacion = origen.descuentoAgrupacion,
                    almacen = origen.almacen,
                    tarifa = origen.tarifa,
                    observaciones = origen.observaciones ?: "",
                    notas = origen.notas ?: "",
                    snapshot = SnapshotCompra(origen.proveedorNombreComercial, origen.proveedorNombreFiscal, origen.proveedorNifCif, origen.proveedorEmail, origen.proveedorTelefono, origen.direccionFacturacionPais, origen.direccionFacturacionCodigoPostal, origen.direccionFacturacionProvincia, origen.direccionFacturacionPoblacion, origen.direccionFacturacionDireccion, origen.direccionEnvioPais, origen.direccionEnvioCodigoPostal, origen.direccionEnvioProvincia, origen.direccionEnvioPoblacion, origen.direccionEnvioDireccion, origen.recargoEquivalencia, origen.compraMultialmacen, origen.direccionId)
                )
            }
            "PEDIDO_COMPRA" -> {
                val origen = pedidoCompraRepository.findById(request.idOrigen).orElse(null)
                    ?: return ResponseEntity.badRequest().body(mapOf("error" to "Pedido de compra no encontrado"))
                OrigenCompraData(
                    proveedor = origen.proveedor,
                    lineas = origen.lineas.map { LineaOrigenCompra(it.producto, it.nombreProducto, it.referencia, it.cantidad, it.precioUnitario, it.descuento, it.observaciones ?: "", it.tipoIva, it.porcentajeIva, it.porcentajeRecargo, it.importeIva, it.importeRecargo, it.almacen) },
                    descuentoAgrupacion = origen.descuentoAgrupacion,
                    almacen = origen.almacen,
                    tarifa = origen.tarifa,
                    observaciones = origen.observaciones ?: "",
                    notas = origen.notas ?: "",
                    snapshot = SnapshotCompra(origen.proveedorNombreComercial, origen.proveedorNombreFiscal, origen.proveedorNifCif, origen.proveedorEmail, origen.proveedorTelefono, origen.direccionFacturacionPais, origen.direccionFacturacionCodigoPostal, origen.direccionFacturacionProvincia, origen.direccionFacturacionPoblacion, origen.direccionFacturacionDireccion, origen.direccionEnvioPais, origen.direccionEnvioCodigoPostal, origen.direccionEnvioProvincia, origen.direccionEnvioPoblacion, origen.direccionEnvioDireccion, origen.recargoEquivalencia, origen.compraMultialmacen ?: false, origen.direccionId)
                )
            }
            "PRESUPUESTO_COMPRA" -> {
                val origen = presupuestoCompraRepository.findById(request.idOrigen).orElse(null)
                    ?: return ResponseEntity.badRequest().body(mapOf("error" to "Presupuesto de compra no encontrado"))
                OrigenCompraData(
                    proveedor = origen.proveedor,
                    lineas = origen.lineas.map { LineaOrigenCompra(it.producto, it.nombreProducto, it.referencia, it.cantidad, it.precioUnitario, it.descuento, it.observaciones ?: "", it.tipoIva, it.porcentajeIva, it.porcentajeRecargo, it.importeIva, it.importeRecargo, it.almacen) },
                    descuentoAgrupacion = origen.descuentoAgrupacion,
                    almacen = origen.almacen,
                    tarifa = origen.tarifa,
                    observaciones = origen.observaciones ?: "",
                    notas = origen.notas ?: "",
                    snapshot = SnapshotCompra(origen.proveedorNombreComercial, origen.proveedorNombreFiscal, origen.proveedorNifCif, origen.proveedorEmail, origen.proveedorTelefono, origen.direccionFacturacionPais, origen.direccionFacturacionCodigoPostal, origen.direccionFacturacionProvincia, origen.direccionFacturacionPoblacion, origen.direccionFacturacionDireccion, origen.direccionEnvioPais, origen.direccionEnvioCodigoPostal, origen.direccionEnvioProvincia, origen.direccionEnvioPoblacion, origen.direccionEnvioDireccion, origen.recargoEquivalencia, origen.compraMultialmacen ?: false, origen.direccionId)
                )
            }
            "FACTURA_COMPRA" -> {
                val origen = facturaCompraRepository.findById(request.idOrigen).orElse(null)
                    ?: return ResponseEntity.badRequest().body(mapOf("error" to "Factura de compra no encontrada"))
                OrigenCompraData(
                    proveedor = origen.proveedor,
                    lineas = origen.lineas.map { LineaOrigenCompra(it.producto, it.nombreProducto, it.referencia, it.cantidad.toDouble(), it.precioUnitario, it.descuento, it.observaciones ?: "", it.tipoIva, it.porcentajeIva, it.porcentajeRecargo, it.importeIva, it.importeRecargo, it.almacen) },
                    descuentoAgrupacion = origen.descuentoAgrupacion,
                    almacen = origen.almacen,
                    tarifa = origen.tarifa,
                    observaciones = origen.observaciones ?: "",
                    notas = origen.notas ?: "",
                    snapshot = SnapshotCompra(origen.proveedorNombreComercial, origen.proveedorNombreFiscal, origen.proveedorNifCif, origen.proveedorEmail, origen.proveedorTelefono, origen.direccionFacturacionPais, origen.direccionFacturacionCodigoPostal, origen.direccionFacturacionProvincia, origen.direccionFacturacionPoblacion, origen.direccionFacturacionDireccion, origen.direccionEnvioPais, origen.direccionEnvioCodigoPostal, origen.direccionEnvioProvincia, origen.direccionEnvioPoblacion, origen.direccionEnvioDireccion, origen.recargoEquivalencia, origen.compraMultialmacen, origen.direccionId)
                )
            }
            // Orígenes de ventas (transformación cruzada compra)
            "FACTURA_PROFORMA" -> return ResponseEntity.badRequest().body(mapOf("error" to "Factura Proforma no puede transformarse a documentos de compra"))
            "PRESUPUESTO" -> {
                val origen = presupuestoVentaRepository.findById(request.idOrigen).orElse(null)
                    ?: return ResponseEntity.badRequest().body(mapOf("error" to "Presupuesto no encontrado"))
                val proveedor = request.proveedorId?.let { proveedorRepository.findById(it).orElse(null) }
                OrigenCompraData(
                    proveedor = proveedor,
                    lineas = origen.lineas.map { LineaOrigenCompra(it.producto, it.nombreProducto, it.referencia, it.cantidad.toDouble(), it.precioUnitario, it.descuento, it.observaciones ?: "", it.tipoIva, it.porcentajeIva, it.porcentajeRecargo, it.importeIva, it.importeRecargo, it.almacen) },
                    descuentoAgrupacion = origen.descuentoAgrupacion,
                    almacen = origen.almacen,
                    tarifa = origen.tarifa,
                    observaciones = origen.observaciones ?: "",
                    notas = origen.notas ?: "",
                    snapshot = SnapshotCompra(null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, false, false, null)
                )
            }
            "PEDIDO" -> {
                val origen = pedidoVentaRepository.findById(request.idOrigen).orElse(null)
                    ?: return ResponseEntity.badRequest().body(mapOf("error" to "Pedido no encontrado"))
                val proveedor = request.proveedorId?.let { proveedorRepository.findById(it).orElse(null) }
                OrigenCompraData(
                    proveedor = proveedor,
                    lineas = origen.lineas.map { LineaOrigenCompra(it.producto, it.nombreProducto, it.referencia, it.cantidad.toDouble(), it.precioUnitario, it.descuento, it.observaciones ?: "", it.tipoIva, it.porcentajeIva, it.porcentajeRecargo, it.importeIva, it.importeRecargo, it.almacen) },
                    descuentoAgrupacion = origen.descuentoAgrupacion,
                    almacen = origen.almacen,
                    tarifa = origen.tarifa,
                    observaciones = origen.observaciones ?: "",
                    notas = origen.notas ?: "",
                    snapshot = SnapshotCompra(null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, false, false, null)
                )
            }
            "ALBARAN" -> {
                val origen = albaranVentaRepository.findById(request.idOrigen).orElse(null)
                    ?: return ResponseEntity.badRequest().body(mapOf("error" to "Albarán no encontrado"))
                val proveedor = request.proveedorId?.let { proveedorRepository.findById(it).orElse(null) }
                OrigenCompraData(
                    proveedor = proveedor,
                    lineas = origen.lineas.map { LineaOrigenCompra(it.producto, it.nombreProducto, it.referencia, it.cantidad.toDouble(), it.precioUnitario, it.descuento, it.observaciones ?: "", it.tipoIva, it.porcentajeIva, it.porcentajeRecargo, it.importeIva, it.importeRecargo, it.almacen) },
                    descuentoAgrupacion = origen.descuentoAgrupacion,
                    almacen = origen.almacen,
                    tarifa = origen.tarifa,
                    observaciones = origen.observaciones ?: "",
                    notas = origen.notas ?: "",
                    snapshot = SnapshotCompra(null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, false, origen.ventaMultialmacen, null)
                )
            }
            "FACTURA" -> {
                val origen = facturaVentaRepository.findById(request.idOrigen).orElse(null)
                    ?: return ResponseEntity.badRequest().body(mapOf("error" to "Factura no encontrada"))
                val proveedor = request.proveedorId?.let { proveedorRepository.findById(it).orElse(null) }
                OrigenCompraData(
                    proveedor = proveedor,
                    lineas = origen.lineas.map { LineaOrigenCompra(it.producto, it.nombreProducto, it.referencia, it.cantidad.toDouble(), it.precioUnitario, it.descuento, it.observaciones ?: "", it.tipoIva, it.porcentajeIva, it.porcentajeRecargo, it.importeIva, it.importeRecargo, it.almacen) },
                    descuentoAgrupacion = origen.descuentoAgrupacion,
                    almacen = origen.almacen,
                    tarifa = origen.tarifa,
                    observaciones = origen.observaciones ?: "",
                    notas = origen.notas ?: "",
                    snapshot = SnapshotCompra(null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, false, origen.ventaMultialmacen ?: false, null)
                )
            }
            "FACTURA_RECTIFICATIVA" -> {
                val origen = facturaRectificativaRepository.findById(request.idOrigen).orElse(null)
                    ?: return ResponseEntity.badRequest().body(mapOf("error" to "Factura rectificativa no encontrada"))
                val proveedor = request.proveedorId?.let { proveedorRepository.findById(it).orElse(null) }
                OrigenCompraData(
                    proveedor = proveedor,
                    lineas = origen.lineas.map { LineaOrigenCompra(it.producto, it.nombreProducto, it.referencia, it.cantidad.toDouble(), it.precioUnitario, it.descuento, it.observaciones ?: "", it.tipoIva, it.porcentajeIva, it.porcentajeRecargo, it.importeIva, it.importeRecargo, it.almacen) },
                    descuentoAgrupacion = origen.descuentoAgrupacion ?: 0.0,
                    almacen = origen.almacen,
                    tarifa = null,
                    observaciones = origen.observaciones ?: "",
                    notas = origen.notas ?: "",
                    snapshot = SnapshotCompra(null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, false, false, null)
                )
            }
            else -> return ResponseEntity.badRequest().body(mapOf("error" to "Tipo de origen no soportado: ${request.tipoOrigen}"))
        }

        // El destino siempre es ALBARAN_COMPRA en este controller
        if (request.tipoDestino != "ALBARAN_COMPRA") {
            return ResponseEntity.badRequest().body(mapOf("error" to "Este endpoint solo crea albaranes de compra"))
        }

        val numeracion = serieNumeracionService.generarYReservarNumero(DOCUMENTO_SERIE_TIPO, request.serieId, usuarioId = null)
        val fechaTransformada = request.fecha?.let { parsearFecha(it) } ?: LocalDateTime.now()

        // Calcular totales
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

        val nuevoAlbaran = AlbaranCompra(
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
            almacen = almacenOrigen,
            compraMultialmacen = snapshotData.compraMultialmacen,
            tarifa = tarifaOrigen,
            serie = numeracion.serie,
            anioDocumento = numeracion.anio,
            numeroSecuencial = numeracion.secuencial,
            codigoDocumento = numeracion.codigo,
            proveedorNombreComercial = snapshotData.proveedorNombreComercial,
            proveedorNombreFiscal = snapshotData.proveedorNombreFiscal,
            proveedorNifCif = snapshotData.proveedorNifCif,
            proveedorEmail = snapshotData.proveedorEmail,
            proveedorTelefono = snapshotData.proveedorTelefono,
            direccionFacturacionPais = snapshotData.direccionFacturacionPais,
            direccionFacturacionCodigoPostal = snapshotData.direccionFacturacionCodigoPostal,
            direccionFacturacionProvincia = snapshotData.direccionFacturacionProvincia,
            direccionFacturacionPoblacion = snapshotData.direccionFacturacionPoblacion,
            direccionFacturacionDireccion = snapshotData.direccionFacturacionDireccion,
            direccionEnvioPais = snapshotData.direccionEnvioPais,
            direccionEnvioCodigoPostal = snapshotData.direccionEnvioCodigoPostal,
            direccionEnvioProvincia = snapshotData.direccionEnvioProvincia,
            direccionEnvioPoblacion = snapshotData.direccionEnvioPoblacion,
            direccionEnvioDireccion = snapshotData.direccionEnvioDireccion,
            direccionId = snapshotData.direccionId,
            recargoEquivalencia = snapshotData.recargoEquivalencia
        )

        val albaranGuardado = albaranCompraRepository.save(nuevoAlbaran)

        lineasOrigen.forEach { linea ->
            val nuevaLinea = AlbaranCompraLinea(
                albaranCompra = albaranGuardado,
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
            albaranGuardado.lineas.add(nuevaLinea)
        }

        val albaranFinal = albaranCompraRepository.save(albaranGuardado)

        // Gestionar stock si el estado es Emitido
        if (request.estado == "Emitido") {
            val configuracion = configuracionVentasRepository.findTopByOrderByIdAsc()
            val documentoDescuentaStock = configuracion?.documentoDescuentaStock ?: "ALBARAN"
            if (documentoDescuentaStock == "ALBARAN") {
                stockService.gestionarStockAlbaranCompra(
                    albaranCompraActualizado = albaranFinal,
                    estadoAnterior = "Pendiente",
                    lineasAnteriores = emptyList(),
                    compraMultialmacenAnterior = false,
                    almacenAnterior = null
                )
            }
        }

        // Registrar transformación solo si NO es duplicación
        if (!request.esDuplicacion) {
            val numeroOrigen = obtenerNumeroDocumentoOrigen(request.tipoOrigen, request.idOrigen)
            val transformacion = DocumentoTransformacion(
                tipoOrigen = request.tipoOrigen,
                idOrigen = request.idOrigen,
                numeroOrigen = numeroOrigen,
                tipoDestino = "ALBARAN_COMPRA",
                idDestino = albaranFinal.id,
                numeroDestino = albaranFinal.numero,
                tipoTransformacion = "CONVERTIR",
                fechaTransformacion = java.time.LocalDateTime.now()
            )
            documentoTransformacionRepository.save(transformacion)
        }

        return ResponseEntity.ok(cargarAdjuntos(albaranFinal))
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
            "ALBARAN" -> "Albarán"
            "PEDIDO" -> "Pedido"
            "PRESUPUESTO" -> "Presupuesto"
            "FACTURA" -> "Factura"
            "FACTURA_RECTIFICATIVA" -> "Factura Rectificativa"
            else -> tipo
        }
    }

    // Data classes auxiliares para transformaciones
    private data class LineaOrigenCompra(
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

    private data class SnapshotCompra(
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

    private data class OrigenCompraData(
        val proveedor: com.example.demo.model.Proveedor?,
        val lineas: List<LineaOrigenCompra>,
        val descuentoAgrupacion: Double,
        val almacen: com.example.demo.model.Almacen?,
        val tarifa: com.example.demo.model.Tarifa?,
        val observaciones: String,
        val notas: String,
        val snapshot: SnapshotCompra
    )
}
