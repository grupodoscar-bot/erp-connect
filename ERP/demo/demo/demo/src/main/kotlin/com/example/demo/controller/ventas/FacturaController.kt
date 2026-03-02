package com.example.demo.controller.ventas

import com.example.demo.model.Direccion
import com.example.demo.model.ventas.Albaran
import com.example.demo.model.ventas.AlbaranLinea
import com.example.demo.model.ventas.Factura
import com.example.demo.model.ventas.FacturaLinea
import com.example.demo.model.ventas.FacturaProforma
import com.example.demo.model.ventas.FacturaRectificativa
import com.example.demo.model.ventas.FacturaRectificativaLinea
import com.example.demo.repository.AlmacenRepository
import com.example.demo.repository.ConfiguracionVentasRepository
import com.example.demo.repository.ventas.AlbaranRepository
import com.example.demo.repository.ClienteRepository
import com.example.demo.repository.DireccionRepository
import com.example.demo.repository.ventas.FacturaRepository
import com.example.demo.repository.ventas.FacturaProformaRepository
import com.example.demo.repository.ventas.FacturaRectificativaRepository
import com.example.demo.repository.ventas.PresupuestoRepository
import com.example.demo.repository.ventas.PedidoRepository
import com.example.demo.repository.ProductoRepository
import com.example.demo.repository.TipoIvaRepository
import com.example.demo.repository.compras.AlbaranCompraRepository
import com.example.demo.repository.compras.FacturaCompraRepository
import com.example.demo.repository.compras.PedidoCompraRepository
import com.example.demo.repository.compras.PresupuestoCompraRepository
import com.example.demo.service.FacturaPdfService
import com.example.demo.service.SerieNumeracionService
import com.example.demo.service.StockService
import com.example.demo.service.TarifaService
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.*
import java.time.LocalDate
import java.time.LocalDateTime

@RestController
@RequestMapping("/facturas")
@CrossOrigin(origins = ["http://145.223.103.219:3000"])
class FacturaController(
    private val facturaRepository: FacturaRepository,
    private val facturaProformaRepository: FacturaProformaRepository,
    private val facturaRectificativaRepository: FacturaRectificativaRepository,
    private val presupuestoRepository: PresupuestoRepository,
    private val pedidoRepository: PedidoRepository,
    private val albaranRepository: AlbaranRepository,
    private val clienteRepository: ClienteRepository,
    private val productoRepository: ProductoRepository,
    private val tipoIvaRepository: TipoIvaRepository,
    private val direccionRepository: DireccionRepository,
    private val almacenRepository: AlmacenRepository,
    private val facturaPdfService: FacturaPdfService,
    private val serieNumeracionService: SerieNumeracionService,
    private val stockService: StockService,
    private val tarifaService: TarifaService,
    private val documentoTransformacionRepository: com.example.demo.repository.ventas.DocumentoTransformacionRepository,
    private val configuracionVentasRepository: ConfiguracionVentasRepository,
    private val archivoEmpresaRepository: com.example.demo.repository.ArchivoEmpresaRepository,
    private val albaranCompraRepository: AlbaranCompraRepository,
    private val facturaCompraRepository: FacturaCompraRepository,
    private val pedidoCompraRepository: PedidoCompraRepository,
    private val presupuestoCompraRepository: PresupuestoCompraRepository
) {

    companion object {
        private const val DOCUMENTO_SERIE_TIPO = "FACTURA"
    }

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

    @GetMapping
    fun listarTodas(): List<Factura> = facturaRepository.findAll()

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
        val facturasPage: Page<Factura> = facturaRepository.findAll(pageRequest)

        var facturasFiltradas = facturasPage.content.toList()

        if (!search.isNullOrBlank()) {
            facturasFiltradas = facturasFiltradas.filter { factura ->
                factura.numero.contains(search, ignoreCase = true) ||
                factura.cliente?.nombreComercial?.contains(search, ignoreCase = true) == true ||
                factura.cliente?.nombreFiscal?.contains(search, ignoreCase = true) == true
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
    fun obtenerPorId(@PathVariable id: Long): ResponseEntity<Factura> =
        facturaRepository.findById(id)
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
                "error" to "No se encontró precio para este producto"
            ))
        }
    }

    @PostMapping
    @Transactional
    fun crear(@RequestBody request: FacturaRequest): ResponseEntity<Factura> {
        val cliente = request.clienteId?.let { clienteRepository.findById(it).orElse(null) }
        val presupuesto = request.presupuestoId?.let { presupuestoRepository.findById(it).orElse(null) }
        val pedido = request.pedidoId?.let { pedidoRepository.findById(it).orElse(null) }
        val albaran = request.albaranId?.let { albaranRepository.findById(it).orElse(null) }
        val facturaProforma = request.facturaProformaId?.let { facturaProformaRepository.findById(it).orElse(null) }
        val almacen = request.almacenId?.let { almacenRepository.findById(it).orElse(null) }

        val tarifa = if (request.tarifaId != null) {
            tarifaService.obtenerTarifasDisponibles().find { it.id == request.tarifaId }
        } else {
            tarifaService.obtenerTarifaPorDefecto()
        }

        val direccionesCliente = if (cliente != null) {
            direccionRepository.findByTipoTerceroAndIdTercero(Direccion.TipoTercero.CLIENTE, cliente.id)
        } else emptyList()

        val direccionFacturacion = direccionesCliente.firstOrNull { it.tipoDireccion == Direccion.TipoDireccion.FACTURACION }
        val direccionEnvio = direccionesCliente.firstOrNull { it.tipoDireccion == Direccion.TipoDireccion.ENVIO }

        val numeracion = serieNumeracionService.generarYReservarNumero(DOCUMENTO_SERIE_TIPO, request.serieId)

        val lineasCalculadas = calcularLineas(
            request.lineas,
            cliente,
            request.descuentoAgrupacion,
            almacen,
            request.ventaMultialmacen
        )
        val totales = calcularTotales(lineasCalculadas, request.descuentoAgrupacion)

        val fechaFactura = request.fecha?.let { parsearFecha(it) } ?: LocalDateTime.now()

        val nuevaFactura = Factura(
            numero = numeracion.codigo,
            fecha = fechaFactura,
            cliente = cliente,
            presupuesto = presupuesto,
            pedido = pedido,
            albaran = albaran,
            facturaProforma = facturaProforma,
            observaciones = request.observaciones,
            notas = request.notas,
            estado = request.estado,
            subtotal = totales.subtotal,
            descuentoTotal = totales.descuentoTotal,
            total = totales.total,
            descuentoAgrupacion = request.descuentoAgrupacion,
            almacen = almacen,
            ventaMultialmacen = request.ventaMultialmacen,
            tarifa = tarifa,
            serie = numeracion.serie,
            anioDocumento = numeracion.anio,
            numeroSecuencial = numeracion.secuencial,
            codigoDocumento = numeracion.codigo,
            clienteNombreComercial = cliente?.nombreComercial,
            clienteNombreFiscal = cliente?.nombreFiscal,
            clienteNifCif = cliente?.nifCif,
            clienteEmail = cliente?.email,
            clienteTelefono = cliente?.telefonoFijo ?: cliente?.telefonoMovil,
            direccionFacturacionPais = snapshot(request.direccionFacturacionPais, direccionFacturacion?.pais),
            direccionFacturacionCodigoPostal = snapshot(request.direccionFacturacionCodigoPostal, direccionFacturacion?.codigoPostal),
            direccionFacturacionProvincia = snapshot(request.direccionFacturacionProvincia, direccionFacturacion?.provincia),
            direccionFacturacionPoblacion = snapshot(request.direccionFacturacionPoblacion, direccionFacturacion?.poblacion),
            direccionFacturacionDireccion = snapshot(request.direccionFacturacionDireccion, direccionFacturacion?.direccion),
            direccionEnvioPais = snapshot(request.direccionEnvioPais, direccionEnvio?.pais),
            direccionEnvioCodigoPostal = snapshot(request.direccionEnvioCodigoPostal, direccionEnvio?.codigoPostal),
            direccionEnvioProvincia = snapshot(request.direccionEnvioProvincia, direccionEnvio?.provincia),
            direccionEnvioPoblacion = snapshot(request.direccionEnvioPoblacion, direccionEnvio?.poblacion),
            direccionEnvioDireccion = snapshot(request.direccionEnvioDireccion, direccionEnvio?.direccion),
            createdAt = LocalDateTime.now(),
            updatedAt = LocalDateTime.now()
        )

        val facturaGuardada = facturaRepository.save(nuevaFactura)

        lineasCalculadas.forEach { lineaCalc ->
            val almacenLinea = lineaCalc.almacenId?.let { almacenRepository.findById(it).orElse(null) }
            val linea = FacturaLinea(
                factura = facturaGuardada,
                producto = lineaCalc.producto,
                nombreProducto = lineaCalc.nombreProducto,
                referencia = lineaCalc.referencia,
                cantidad = lineaCalc.cantidad,
                precioUnitario = lineaCalc.precioUnitario,
                descuento = lineaCalc.descuento,
                observaciones = lineaCalc.observaciones,
                tipoIva = lineaCalc.tipoIva,
                porcentajeIva = lineaCalc.porcentajeIva,
                porcentajeRecargo = lineaCalc.porcentajeRecargo,
                importeIva = lineaCalc.importeIva,
                importeRecargo = lineaCalc.importeRecargo,
                almacen = almacenLinea
            )
            facturaGuardada.lineas.add(linea)
        }

        val facturaFinal = facturaRepository.save(facturaGuardada)

        val configuracion = configuracionVentasRepository.findTopByOrderByIdAsc()
        val documentoDescuentaStock = configuracion?.documentoDescuentaStock ?: "ALBARAN"
        val esEmitido = request.estado == "Emitido"
        val vieneDeAlbaran = albaran != null

        val debeDescontarStock = esEmitido && (
            documentoDescuentaStock == "FACTURA" || !vieneDeAlbaran
        )

        if (esEmitido) {
            if (vieneDeAlbaran && documentoDescuentaStock == "ALBARAN") {
                stockService.gestionarStockFacturaConDiferencias(facturaFinal, "DECREMENTAR")
            } else if (debeDescontarStock) {
                stockService.gestionarStockFactura(facturaFinal, "DECREMENTAR")
            }
        }

        return ResponseEntity.ok(facturaFinal)
    }

    @PutMapping("/{id}")
    @Transactional
    fun actualizar(
        @PathVariable id: Long,
        @RequestBody request: FacturaRequest
    ): ResponseEntity<Factura> {
        return facturaRepository.findById(id)
            .map { existente ->
                val estadoAnterior = existente.estado
                val cliente = request.clienteId?.let { clienteRepository.findById(it).orElse(null) }
                val almacen = request.almacenId?.let { almacenRepository.findById(it).orElse(null) }

                val tarifa = if (request.tarifaId != null) {
                    tarifaService.obtenerTarifasDisponibles().find { it.id == request.tarifaId }
                } else {
                    tarifaService.obtenerTarifaPorDefecto()
                }

                val direccionesCliente = if (cliente != null) {
                    direccionRepository.findByTipoTerceroAndIdTercero(Direccion.TipoTercero.CLIENTE, cliente.id)
                } else emptyList()

                val direccionFacturacion = direccionesCliente.firstOrNull { it.tipoDireccion == Direccion.TipoDireccion.FACTURACION }
                val direccionEnvio = direccionesCliente.firstOrNull { it.tipoDireccion == Direccion.TipoDireccion.ENVIO }

                val lineasCalculadas = calcularLineas(
                    request.lineas,
                    cliente,
                    request.descuentoAgrupacion,
                    almacen,
                    request.ventaMultialmacen
                )
                val totales = calcularTotales(lineasCalculadas, request.descuentoAgrupacion)

                val configuracion = configuracionVentasRepository.findTopByOrderByIdAsc()
                val documentoDescuentaStock = configuracion?.documentoDescuentaStock ?: "ALBARAN"

                // Detectar cambios de estado para gestión de stock
                val eraEmitido = estadoAnterior == "Emitido"
                val esEmitido = request.estado == "Emitido"
                val vieneDeAlbaran = existente.albaran != null
                val facturaSinAlbaran = !vieneDeAlbaran

                val debeDescontarStock = !eraEmitido && esEmitido && !existente.contabilizado && (
                    documentoDescuentaStock == "FACTURA" || facturaSinAlbaran
                )

                val debeRestaurarStock = eraEmitido && !esEmitido && existente.contabilizado && (
                    documentoDescuentaStock == "FACTURA" || facturaSinAlbaran
                )

                val debeAjustarDiferencias = esEmitido && vieneDeAlbaran && documentoDescuentaStock == "ALBARAN"
                val debeRestaurarDiferencias = eraEmitido && !esEmitido && vieneDeAlbaran && documentoDescuentaStock == "ALBARAN"
                
                // Detectar si la factura permanece en Emitido y hay cambios de cantidad
                val sigueEmitido = eraEmitido && esEmitido
                val cantidadesAnteriores = if (sigueEmitido) {
                    existente.lineas.associate { it.producto?.id to it.cantidad }
                } else {
                    emptyMap()
                }

                // Si salimos de Emitido, restaurar stock con el estado anterior antes de modificar líneas
                if (debeRestaurarStock) {
                    stockService.gestionarStockFactura(existente, "INCREMENTAR")
                }
                if (debeRestaurarDiferencias) {
                    stockService.gestionarStockFacturaConDiferencias(existente, "INCREMENTAR")
                }

                existente.lineas.clear()

                val fechaActualizada = request.fecha?.let { parsearFecha(it) } ?: existente.fecha

                val actualizada = existente.copy(
                    fecha = fechaActualizada,
                    cliente = cliente,
                    observaciones = request.observaciones,
                    notas = request.notas,
                    estado = request.estado,
                    subtotal = totales.subtotal,
                    descuentoTotal = totales.descuentoTotal,
                    total = totales.total,
                    descuentoAgrupacion = request.descuentoAgrupacion,
                    almacen = almacen,
                    ventaMultialmacen = request.ventaMultialmacen,
                    tarifa = tarifa,
                    contabilizado = when {
                        debeDescontarStock -> true
                        debeRestaurarStock -> false
                        else -> existente.contabilizado
                    },
                    clienteNombreComercial = cliente?.nombreComercial,
                    clienteNombreFiscal = cliente?.nombreFiscal,
                    clienteNifCif = cliente?.nifCif,
                    clienteEmail = cliente?.email,
                    clienteTelefono = cliente?.telefonoFijo ?: cliente?.telefonoMovil,
                    direccionFacturacionPais = snapshot(request.direccionFacturacionPais, direccionFacturacion?.pais),
                    direccionFacturacionCodigoPostal = snapshot(request.direccionFacturacionCodigoPostal, direccionFacturacion?.codigoPostal),
                    direccionFacturacionProvincia = snapshot(request.direccionFacturacionProvincia, direccionFacturacion?.provincia),
                    direccionFacturacionPoblacion = snapshot(request.direccionFacturacionPoblacion, direccionFacturacion?.poblacion),
                    direccionFacturacionDireccion = snapshot(request.direccionFacturacionDireccion, direccionFacturacion?.direccion),
                    direccionEnvioPais = snapshot(request.direccionEnvioPais, direccionEnvio?.pais),
                    direccionEnvioCodigoPostal = snapshot(request.direccionEnvioCodigoPostal, direccionEnvio?.codigoPostal),
                    direccionEnvioProvincia = snapshot(request.direccionEnvioProvincia, direccionEnvio?.provincia),
                    direccionEnvioPoblacion = snapshot(request.direccionEnvioPoblacion, direccionEnvio?.poblacion),
                    direccionEnvioDireccion = snapshot(request.direccionEnvioDireccion, direccionEnvio?.direccion),
                    updatedAt = LocalDateTime.now()
                )

                val guardada = facturaRepository.save(actualizada)

                lineasCalculadas.forEach { lineaCalc ->
                    val almacenLinea = lineaCalc.almacenId?.let { almacenRepository.findById(it).orElse(null) }
                    val linea = FacturaLinea(
                        factura = guardada,
                        producto = lineaCalc.producto,
                        nombreProducto = lineaCalc.nombreProducto,
                        referencia = lineaCalc.referencia,
                        cantidad = lineaCalc.cantidad,
                        precioUnitario = lineaCalc.precioUnitario,
                        descuento = lineaCalc.descuento,
                        observaciones = lineaCalc.observaciones,
                        tipoIva = lineaCalc.tipoIva,
                        porcentajeIva = lineaCalc.porcentajeIva,
                        porcentajeRecargo = lineaCalc.porcentajeRecargo,
                        importeIva = lineaCalc.importeIva,
                        importeRecargo = lineaCalc.importeRecargo,
                        almacen = almacenLinea
                    )
                    guardada.lineas.add(linea)
                }

                val facturaFinal = facturaRepository.save(guardada)

                // Gestionar stock después de guardar exitosamente
                if (debeDescontarStock) {
                    stockService.gestionarStockFactura(facturaFinal, "DECREMENTAR")
                }

                if (debeAjustarDiferencias) {
                    stockService.gestionarStockFacturaConDiferencias(facturaFinal, "DECREMENTAR")
                }
                
                // Si la factura permanece en Emitido, ajustar solo las diferencias de cantidad
                if (sigueEmitido && cantidadesAnteriores.isNotEmpty()) {
                    stockService.ajustarDiferenciasEmitido(facturaFinal, cantidadesAnteriores)
                }

                ResponseEntity.ok(facturaFinal)
            }
            .orElse(ResponseEntity.notFound().build())
    }

    @DeleteMapping("/{id}")
    @Transactional
    fun eliminar(@PathVariable id: Long): ResponseEntity<Any> {
        val factura = facturaRepository.findById(id).orElse(null)
            ?: return ResponseEntity.notFound().build()

        // Verificar dependencias
        val rectificativas = facturaRectificativaRepository.findByFacturaOrigenId(id)
        if (rectificativas.isNotEmpty()) {
            return ResponseEntity.badRequest().body(mapOf(
                "error" to "No se puede eliminar la factura porque tiene facturas rectificativas asociadas"
            ))
        }

        facturaRepository.deleteById(id)
        return ResponseEntity.noContent().build()
    }

    @PostMapping("/{id}/duplicar")
    @Transactional
    fun duplicar(@PathVariable id: Long): ResponseEntity<Factura> {
        val original = facturaRepository.findByIdWithLineas(id)
            ?: return ResponseEntity.notFound().build()

        val numeracion = serieNumeracionService.generarYReservarNumero(DOCUMENTO_SERIE_TIPO, original.serie?.id)

        val duplicada = original.copy(
            id = 0,
            numero = numeracion.codigo,
            fecha = LocalDateTime.now(),
            estado = "Pendiente",
            contabilizado = false,
            serie = numeracion.serie,
            anioDocumento = numeracion.anio,
            numeroSecuencial = numeracion.secuencial,
            codigoDocumento = numeracion.codigo,
            createdAt = LocalDateTime.now(),
            updatedAt = LocalDateTime.now(),
            lineas = mutableListOf(),
            almacen = original.almacen,
            tarifa = original.tarifa,
            ventaMultialmacen = original.ventaMultialmacen,
            // Campos de dirección
            clienteNombreComercial = original.clienteNombreComercial,
            clienteNombreFiscal = original.clienteNombreFiscal,
            clienteNifCif = original.clienteNifCif,
            clienteEmail = original.clienteEmail,
            clienteTelefono = original.clienteTelefono,
            direccionFacturacionPais = original.direccionFacturacionPais,
            direccionFacturacionCodigoPostal = original.direccionFacturacionCodigoPostal,
            direccionFacturacionProvincia = original.direccionFacturacionProvincia,
            direccionFacturacionPoblacion = original.direccionFacturacionPoblacion,
            direccionFacturacionDireccion = original.direccionFacturacionDireccion,
            direccionEnvioPais = original.direccionEnvioPais,
            direccionEnvioCodigoPostal = original.direccionEnvioCodigoPostal,
            direccionEnvioProvincia = original.direccionEnvioProvincia,
            direccionEnvioPoblacion = original.direccionEnvioPoblacion,
            direccionEnvioDireccion = original.direccionEnvioDireccion
        )

        val guardada = facturaRepository.save(duplicada)

        original.lineas.forEach { lineaOriginal ->
            val nuevaLinea = FacturaLinea(
                factura = guardada,
                producto = lineaOriginal.producto,
                nombreProducto = lineaOriginal.nombreProducto,
                referencia = lineaOriginal.referencia,
                cantidad = lineaOriginal.cantidad,
                precioUnitario = lineaOriginal.precioUnitario,
                descuento = lineaOriginal.descuento,
                observaciones = lineaOriginal.observaciones,
                tipoIva = lineaOriginal.tipoIva,
                porcentajeIva = lineaOriginal.porcentajeIva,
                porcentajeRecargo = lineaOriginal.porcentajeRecargo,
                importeIva = lineaOriginal.importeIva,
                importeRecargo = lineaOriginal.importeRecargo,
                almacen = lineaOriginal.almacen
            )
            guardada.lineas.add(nuevaLinea)
        }

        return ResponseEntity.ok(facturaRepository.save(guardada))
    }

    @PostMapping("/{id}/crear-rectificativa")
    @Transactional
    fun crearRectificativa(@PathVariable id: Long): ResponseEntity<FacturaRectificativa> {
        val factura = facturaRepository.findByIdWithLineas(id)
            ?: return ResponseEntity.notFound().build()

        val numeracion = serieNumeracionService.generarYReservarNumero("FACTURA_RECTIFICATIVA", null)

        val rectificativa = FacturaRectificativa(
            numero = numeracion.codigo,
            fecha = LocalDateTime.now(),
            cliente = factura.cliente,
            facturaOrigen = factura,
            observaciones = "Rectificativa de factura ${factura.numero}",
            notas = factura.notas,
            estado = "Pendiente",
            subtotal = factura.subtotal,
            descuentoTotal = factura.descuentoTotal,
            total = factura.total,
            descuentoAgrupacion = factura.descuentoAgrupacion,
            almacen = factura.almacen,
            ventaMultialmacen = factura.ventaMultialmacen,
            tarifa = factura.tarifa,
            serie = numeracion.serie,
            anioDocumento = numeracion.anio,
            numeroSecuencial = numeracion.secuencial,
            codigoDocumento = numeracion.codigo,
            clienteNombreComercial = factura.clienteNombreComercial,
            clienteNombreFiscal = factura.clienteNombreFiscal,
            clienteNifCif = factura.clienteNifCif,
            clienteEmail = factura.clienteEmail,
            clienteTelefono = factura.clienteTelefono,
            direccionFacturacionPais = factura.direccionFacturacionPais,
            direccionFacturacionCodigoPostal = factura.direccionFacturacionCodigoPostal,
            direccionFacturacionProvincia = factura.direccionFacturacionProvincia,
            direccionFacturacionPoblacion = factura.direccionFacturacionPoblacion,
            direccionFacturacionDireccion = factura.direccionFacturacionDireccion,
            direccionEnvioPais = factura.direccionEnvioPais,
            direccionEnvioCodigoPostal = factura.direccionEnvioCodigoPostal,
            direccionEnvioProvincia = factura.direccionEnvioProvincia,
            direccionEnvioPoblacion = factura.direccionEnvioPoblacion,
            direccionEnvioDireccion = factura.direccionEnvioDireccion
        )

        val guardada = facturaRectificativaRepository.save(rectificativa)

        factura.lineas.forEach { lineaFactura ->
            val linea = FacturaRectificativaLinea(
                facturaRectificativa = guardada,
                producto = lineaFactura.producto,
                nombreProducto = lineaFactura.nombreProducto,
                referencia = lineaFactura.referencia,
                cantidad = lineaFactura.cantidad,
                precioUnitario = lineaFactura.precioUnitario,
                descuento = lineaFactura.descuento,
                observaciones = lineaFactura.observaciones,
                tipoIva = lineaFactura.tipoIva,
                porcentajeIva = lineaFactura.porcentajeIva,
                porcentajeRecargo = lineaFactura.porcentajeRecargo,
                importeIva = lineaFactura.importeIva,
                importeRecargo = lineaFactura.importeRecargo,
                almacen = lineaFactura.almacen
            )
            guardada.lineas.add(linea)
        }

        return ResponseEntity.ok(facturaRectificativaRepository.save(guardada))
    }

    @GetMapping("/{id}/pdf")
    fun exportarPdf(
        @PathVariable id: Long,
        @RequestParam(required = false) plantillaId: Long?
    ): ResponseEntity<ByteArray> {
        return facturaRepository.findById(id)
            .map { factura ->
                val pdfBytes = facturaPdfService.generarPdf(factura, plantillaId)

                val headers = HttpHeaders()
                headers.contentType = MediaType.APPLICATION_PDF
                headers.setContentDispositionFormData("attachment", "factura_${factura.numero}.pdf")
                headers.contentLength = pdfBytes.size.toLong()

                ResponseEntity.ok()
                    .headers(headers)
                    .body(pdfBytes)
            }
            .orElse(ResponseEntity.notFound().build())
    }

    // Clases auxiliares
    private data class LineaCalculada(
        val producto: com.example.demo.model.Producto?,
        val nombreProducto: String,
        val referencia: String?,
        val cantidad: Int,
        val precioUnitario: Double,
        val descuento: Double,
        val observaciones: String,
        val tipoIva: com.example.demo.model.TipoIva?,
        val porcentajeIva: Double,
        val porcentajeRecargo: Double,
        val importeIva: Double,
        val importeRecargo: Double,
        val almacenId: Long?
    )

    private data class Totales(
        val subtotal: Double,
        val descuentoTotal: Double,
        val total: Double
    )

    private fun calcularLineas(
        lineas: List<FacturaLineaRequest>,
        cliente: com.example.demo.model.Cliente?,
        descuentoAgrupacion: Double,
        almacenPorDefecto: com.example.demo.model.Almacen?,
        ventaMultialmacen: Boolean
    ): List<LineaCalculada> {
        return lineas.map { lineaReq ->
            val producto = lineaReq.productoId?.let { productoRepository.findById(it).orElse(null) }
            val tipoIva = lineaReq.tipoIvaId?.let { tipoIvaRepository.findById(it).orElse(null) }
                ?: producto?.tipoIva

            val baseLinea = lineaReq.cantidad * lineaReq.precioUnitario
            val descuentoLinea = baseLinea * (lineaReq.descuento / 100)
            val baseConDescuento = baseLinea - descuentoLinea
            val baseConAgrupacion = baseConDescuento * (1 - descuentoAgrupacion / 100)

            val porcentajeIva = lineaReq.porcentajeIva.takeIf { it > 0 } ?: tipoIva?.porcentajeIva ?: 0.0
            val porcentajeRecargo = lineaReq.porcentajeRecargo.takeIf { it > 0 }
                ?: if (cliente?.recargoEquivalencia == true) tipoIva?.porcentajeRecargo ?: 0.0 else 0.0

            val importeIva = baseConAgrupacion * (porcentajeIva / 100)
            val importeRecargo = baseConAgrupacion * (porcentajeRecargo / 100)

            LineaCalculada(
                producto = producto,
                nombreProducto = lineaReq.nombreProducto.ifEmpty { producto?.nombre ?: "" },
                referencia = lineaReq.referencia ?: producto?.referencia,
                cantidad = lineaReq.cantidad,
                precioUnitario = lineaReq.precioUnitario,
                descuento = lineaReq.descuento,
                observaciones = lineaReq.observaciones,
                tipoIva = tipoIva,
                porcentajeIva = porcentajeIva,
                porcentajeRecargo = porcentajeRecargo,
                importeIva = importeIva,
                importeRecargo = importeRecargo,
                almacenId = if (ventaMultialmacen) {
                    lineaReq.almacenId ?: almacenPorDefecto?.id
                } else {
                    lineaReq.almacenId ?: almacenPorDefecto?.id
                }
            )
        }
    }

    private fun calcularTotales(lineas: List<LineaCalculada>, descuentoAgrupacion: Double): Totales {
        val subtotal = lineas.sumOf { it.cantidad * it.precioUnitario }
        val descuentoTotal = lineas.sumOf {
            (it.cantidad * it.precioUnitario) * (it.descuento / 100)
        }
        val baseAntesAgrupacion = subtotal - descuentoTotal
        val descuentoAgrupacionImporte = baseAntesAgrupacion * (descuentoAgrupacion / 100)
        val baseImponible = baseAntesAgrupacion - descuentoAgrupacionImporte
        
        // Calcular IVA sobre la base imponible DESPUÉS del descuento de agrupación
        val impuestosTotales = lineas.sumOf { linea ->
            val subtotalLinea = linea.cantidad * linea.precioUnitario
            val descuentoLinea = subtotalLinea * (linea.descuento / 100)
            val baseLineaSinAgrupacion = subtotalLinea - descuentoLinea
            val baseLineaConAgrupacion = baseLineaSinAgrupacion * (1 - descuentoAgrupacion / 100)
            val ivaLinea = baseLineaConAgrupacion * (linea.porcentajeIva / 100)
            val recargoLinea = baseLineaConAgrupacion * (linea.porcentajeRecargo / 100)
            ivaLinea + recargoLinea
        }
        val total = baseImponible + impuestosTotales

        return Totales(subtotal, descuentoTotal, total)
    }

    @PostMapping("/desde-albaran")
    @Transactional
    fun crearDesdeAlbaran(@RequestBody request: TransformarAlbaranRequest): ResponseEntity<Any> {
        val albaran = albaranRepository.findById(request.albaranId ?: return ResponseEntity.badRequest().body(mapOf("error" to "ID de albarán requerido"))).orElse(null)
            ?: return ResponseEntity.badRequest().body(mapOf("error" to "Albarán no encontrado"))

        val numeracion = serieNumeracionService.generarYReservarNumero(DOCUMENTO_SERIE_TIPO, request.serieId, usuarioId = null)

        val lineasCalculadas = albaran.lineas.map { lineaAlbaran ->
            LineaCalculada(
                cantidad = lineaAlbaran.cantidad,
                precioUnitario = lineaAlbaran.precioUnitario,
                descuento = lineaAlbaran.descuento,
                producto = lineaAlbaran.producto,
                nombreProducto = lineaAlbaran.nombreProducto,
                referencia = lineaAlbaran.referencia,
                observaciones = lineaAlbaran.observaciones ?: "",
                tipoIva = lineaAlbaran.tipoIva,
                porcentajeIva = lineaAlbaran.porcentajeIva,
                porcentajeRecargo = lineaAlbaran.porcentajeRecargo,
                importeIva = lineaAlbaran.importeIva,
                importeRecargo = lineaAlbaran.importeRecargo,
                almacenId = lineaAlbaran.almacen?.id
            )
        }

        val totales = calcularTotales(lineasCalculadas, albaran.descuentoAgrupacion)

        val fechaDesdeAlbaran = request.fecha?.let { parsearFecha(it) } ?: albaran.fecha

        val nuevaFactura = Factura(
            numero = numeracion.codigo,
            fecha = fechaDesdeAlbaran,
            cliente = albaran.cliente,
            albaran = albaran,
            observaciones = albaran.observaciones ?: "",
            notas = albaran.notas ?: "",
            estado = request.estado ?: "Pendiente",
            subtotal = totales.subtotal,
            descuentoTotal = totales.descuentoTotal,
            total = totales.total,
            descuentoAgrupacion = albaran.descuentoAgrupacion,
            serie = numeracion.serie,
            anioDocumento = numeracion.anio,
            numeroSecuencial = numeracion.secuencial,
            codigoDocumento = numeracion.codigo,
            tarifa = albaran.tarifa,
            almacen = albaran.almacen,
            ventaMultialmacen = albaran.ventaMultialmacen ?: false,
            clienteNombreComercial = albaran.clienteNombreComercial,
            clienteNombreFiscal = albaran.clienteNombreFiscal,
            clienteNifCif = albaran.clienteNifCif,
            clienteEmail = albaran.clienteEmail,
            clienteTelefono = albaran.clienteTelefono,
            direccionFacturacionPais = albaran.direccionFacturacionPais,
            direccionFacturacionCodigoPostal = albaran.direccionFacturacionCodigoPostal,
            direccionFacturacionProvincia = albaran.direccionFacturacionProvincia,
            direccionFacturacionPoblacion = albaran.direccionFacturacionPoblacion,
            direccionFacturacionDireccion = albaran.direccionFacturacionDireccion,
            direccionEnvioPais = albaran.direccionEnvioPais,
            direccionEnvioCodigoPostal = albaran.direccionEnvioCodigoPostal,
            direccionEnvioProvincia = albaran.direccionEnvioProvincia,
            direccionEnvioPoblacion = albaran.direccionEnvioPoblacion,
            direccionEnvioDireccion = albaran.direccionEnvioDireccion
        )

        val facturaGuardada = facturaRepository.save(nuevaFactura)

        lineasCalculadas.forEach { linea ->
            val almacen = linea.almacenId?.let { almacenRepository.findById(it).orElse(null) }
            val lineaFactura = FacturaLinea(
                factura = facturaGuardada,
                producto = linea.producto,
                nombreProducto = linea.nombreProducto,
                referencia = linea.referencia,
                cantidad = linea.cantidad,
                precioUnitario = linea.precioUnitario,
                descuento = linea.descuento,
                observaciones = linea.observaciones,
                tipoIva = linea.tipoIva,
                porcentajeIva = linea.porcentajeIva,
                porcentajeRecargo = linea.porcentajeRecargo,
                importeIva = linea.importeIva,
                importeRecargo = linea.importeRecargo,
                almacen = almacen
            )
            facturaGuardada.lineas.add(lineaFactura)
        }

        val facturaFinal = facturaRepository.save(facturaGuardada)

        val configuracion = configuracionVentasRepository.findTopByOrderByIdAsc()
        val documentoDescuentaStock = configuracion?.documentoDescuentaStock ?: "ALBARAN"
        val esEmitido = request.estado == "Emitido"

        if (esEmitido) {
            if (documentoDescuentaStock == "ALBARAN") {
                stockService.gestionarStockFacturaConDiferencias(facturaFinal, "DECREMENTAR")
            } else {
                stockService.gestionarStockFactura(facturaFinal, "DECREMENTAR")
            }
        }

        // Registrar transformación
        val transformacion = com.example.demo.model.ventas.DocumentoTransformacion(
            tipoOrigen = "ALBARAN",
            idOrigen = albaran.id,
            numeroOrigen = albaran.numero,
            tipoDestino = "FACTURA",
            idDestino = facturaFinal.id,
            numeroDestino = facturaFinal.numero,
            tipoTransformacion = "CONVERTIR",
            fechaTransformacion = java.time.LocalDateTime.now()
        )
        documentoTransformacionRepository.save(transformacion)

        return ResponseEntity.ok(facturaFinal)
    }

    @PostMapping("/desde-factura-rectificativa")
    @Transactional
    fun crearDesdeFacturaRectificativa(@RequestBody request: TransformarAlbaranRequest): ResponseEntity<Any> {
        val facturaRectificativa = facturaRectificativaRepository.findById(request.facturaRectificativaId ?: return ResponseEntity.badRequest().body(mapOf("error" to "ID de factura rectificativa requerido"))).orElse(null)
            ?: return ResponseEntity.badRequest().body(mapOf("error" to "Factura Rectificativa no encontrada"))

        val numeracion = serieNumeracionService.generarYReservarNumero(DOCUMENTO_SERIE_TIPO, request.serieId)

        val fechaDesdeFacturaRectificativa = request.fecha?.let { parsearFecha(it) } ?: facturaRectificativa.fecha

        val nuevaFactura = Factura(
            numero = numeracion.codigo,
            fecha = fechaDesdeFacturaRectificativa,
            cliente = facturaRectificativa.cliente,
            observaciones = facturaRectificativa.observaciones ?: "",
            estado = request.estado ?: "Pendiente",
            subtotal = facturaRectificativa.subtotal,
            descuentoTotal = facturaRectificativa.descuentoTotal,
            total = facturaRectificativa.total,
            serie = numeracion.serie,
            anioDocumento = numeracion.anio,
            numeroSecuencial = numeracion.secuencial,
            codigoDocumento = numeracion.codigo
        )

        val facturaGuardada = facturaRepository.save(nuevaFactura)

        facturaRectificativa.lineas.forEach { lineaFacturaRectificativa ->
            val almacen = lineaFacturaRectificativa.almacen ?: facturaRectificativa.almacen
            val lineaFactura = FacturaLinea(
                factura = facturaGuardada,
                producto = lineaFacturaRectificativa.producto,
                nombreProducto = lineaFacturaRectificativa.nombreProducto,
                referencia = lineaFacturaRectificativa.referencia,
                cantidad = lineaFacturaRectificativa.cantidad,
                precioUnitario = lineaFacturaRectificativa.precioUnitario,
                descuento = lineaFacturaRectificativa.descuento,
                observaciones = lineaFacturaRectificativa.observaciones ?: "",
                tipoIva = lineaFacturaRectificativa.tipoIva,
                porcentajeIva = lineaFacturaRectificativa.porcentajeIva,
                porcentajeRecargo = lineaFacturaRectificativa.porcentajeRecargo,
                importeIva = lineaFacturaRectificativa.importeIva,
                importeRecargo = lineaFacturaRectificativa.importeRecargo,
                almacen = almacen
            )
            facturaGuardada.lineas.add(lineaFactura)
        }

        val facturaFinal = facturaRepository.save(facturaGuardada)

        val transformacion = com.example.demo.model.ventas.DocumentoTransformacion(
            tipoOrigen = "FACTURA_RECTIFICATIVA",
            idOrigen = facturaRectificativa.id,
            numeroOrigen = facturaRectificativa.numero,
            tipoDestino = "FACTURA",
            idDestino = facturaFinal.id,
            numeroDestino = facturaFinal.numero,
            tipoTransformacion = "CONVERTIR",
            fechaTransformacion = java.time.LocalDateTime.now()
        )
        documentoTransformacionRepository.save(transformacion)

        return ResponseEntity.ok(facturaFinal)
    }

    @PostMapping("/desde-presupuesto")
    @Transactional
    fun crearDesdePresupuesto(@RequestBody request: TransformarAlbaranRequest): ResponseEntity<Any> {
        val presupuesto = presupuestoRepository.findById(request.presupuestoId ?: return ResponseEntity.badRequest().body(mapOf("error" to "ID de presupuesto requerido"))).orElse(null)
            ?: return ResponseEntity.badRequest().body(mapOf("error" to "Presupuesto no encontrado"))

        val numeracion = serieNumeracionService.generarYReservarNumero(DOCUMENTO_SERIE_TIPO, request.serieId)

        val fechaDesdePresupuesto = request.fecha?.let { parsearFecha(it) } ?: presupuesto.fecha

        val nuevaFactura = Factura(
            numero = numeracion.codigo,
            fecha = fechaDesdePresupuesto,
            cliente = presupuesto.cliente,
            observaciones = presupuesto.observaciones ?: "",
            estado = request.estado ?: "Pendiente",
            subtotal = presupuesto.subtotal,
            descuentoTotal = presupuesto.descuentoTotal,
            total = presupuesto.total,
            descuentoAgrupacion = request.descuentoAgrupacion,
            almacen = presupuesto.almacen,
            ventaMultialmacen = presupuesto.ventaMultialmacen,
            tarifa = presupuesto.tarifa,
            serie = numeracion.serie,
            anioDocumento = numeracion.anio,
            numeroSecuencial = numeracion.secuencial,
            codigoDocumento = numeracion.codigo,
            clienteNombreComercial = presupuesto.clienteNombreComercial,
            clienteNombreFiscal = presupuesto.clienteNombreFiscal,
            clienteNifCif = presupuesto.clienteNifCif,
            clienteEmail = presupuesto.clienteEmail,
            clienteTelefono = presupuesto.clienteTelefono,
            direccionFacturacionPais = presupuesto.direccionFacturacionPais,
            direccionFacturacionCodigoPostal = presupuesto.direccionFacturacionCodigoPostal,
            direccionFacturacionProvincia = presupuesto.direccionFacturacionProvincia,
            direccionFacturacionPoblacion = presupuesto.direccionFacturacionPoblacion,
            direccionFacturacionDireccion = presupuesto.direccionFacturacionDireccion,
            direccionEnvioPais = presupuesto.direccionEnvioPais,
            direccionEnvioCodigoPostal = presupuesto.direccionEnvioCodigoPostal,
            direccionEnvioProvincia = presupuesto.direccionEnvioProvincia,
            direccionEnvioPoblacion = presupuesto.direccionEnvioPoblacion,
            direccionEnvioDireccion = presupuesto.direccionEnvioDireccion
        )

        val facturaGuardada = facturaRepository.save(nuevaFactura)

        presupuesto.lineas.forEach { lineaPresupuesto ->
            val almacen = lineaPresupuesto.almacen ?: presupuesto.almacen
            val lineaFactura = FacturaLinea(
                factura = facturaGuardada,
                producto = lineaPresupuesto.producto,
                nombreProducto = lineaPresupuesto.nombreProducto,
                referencia = lineaPresupuesto.referencia,
                cantidad = lineaPresupuesto.cantidad,
                precioUnitario = lineaPresupuesto.precioUnitario,
                descuento = lineaPresupuesto.descuento,
                observaciones = lineaPresupuesto.observaciones ?: "",
                tipoIva = lineaPresupuesto.tipoIva,
                porcentajeIva = lineaPresupuesto.porcentajeIva,
                porcentajeRecargo = lineaPresupuesto.porcentajeRecargo,
                importeIva = lineaPresupuesto.importeIva,
                importeRecargo = lineaPresupuesto.importeRecargo,
                almacen = almacen
            )
            facturaGuardada.lineas.add(lineaFactura)
        }

        val facturaFinal = facturaRepository.save(facturaGuardada)

        val transformacion = com.example.demo.model.ventas.DocumentoTransformacion(
            tipoOrigen = "PRESUPUESTO",
            idOrigen = presupuesto.id,
            numeroOrigen = presupuesto.numero,
            tipoDestino = "FACTURA",
            idDestino = facturaFinal.id,
            numeroDestino = facturaFinal.numero,
            tipoTransformacion = "CONVERTIR",
            fechaTransformacion = java.time.LocalDateTime.now()
        )
        documentoTransformacionRepository.save(transformacion)

        return ResponseEntity.ok(facturaFinal)
    }

    @PostMapping("/desde-pedido")
    @Transactional
    fun crearDesdePedido(@RequestBody request: TransformarAlbaranRequest): ResponseEntity<Any> {
        val pedido = pedidoRepository.findById(request.pedidoId ?: return ResponseEntity.badRequest().body(mapOf("error" to "ID de pedido requerido"))).orElse(null)
            ?: return ResponseEntity.badRequest().body(mapOf("error" to "Pedido no encontrado"))

        val numeracion = serieNumeracionService.generarYReservarNumero(DOCUMENTO_SERIE_TIPO, request.serieId)

        val fechaDesdePedido = request.fecha?.let { parsearFecha(it) } ?: pedido.fecha

        val nuevaFactura = Factura(
            numero = numeracion.codigo,
            fecha = fechaDesdePedido,
            cliente = pedido.cliente,
            observaciones = pedido.observaciones ?: "",
            estado = request.estado ?: "Pendiente",
            subtotal = pedido.subtotal,
            descuentoTotal = pedido.descuentoTotal,
            total = pedido.total,
            descuentoAgrupacion = request.descuentoAgrupacion,
            almacen = pedido.almacen,
            ventaMultialmacen = pedido.ventaMultialmacen,
            tarifa = pedido.tarifa,
            serie = numeracion.serie,
            anioDocumento = numeracion.anio,
            numeroSecuencial = numeracion.secuencial,
            codigoDocumento = numeracion.codigo,
            clienteNombreComercial = pedido.clienteNombreComercial,
            clienteNombreFiscal = pedido.clienteNombreFiscal,
            clienteNifCif = pedido.clienteNifCif,
            clienteEmail = pedido.clienteEmail,
            clienteTelefono = pedido.clienteTelefono,
            direccionFacturacionPais = pedido.direccionFacturacionPais,
            direccionFacturacionCodigoPostal = pedido.direccionFacturacionCodigoPostal,
            direccionFacturacionProvincia = pedido.direccionFacturacionProvincia,
            direccionFacturacionPoblacion = pedido.direccionFacturacionPoblacion,
            direccionFacturacionDireccion = pedido.direccionFacturacionDireccion,
            direccionEnvioPais = pedido.direccionEnvioPais,
            direccionEnvioCodigoPostal = pedido.direccionEnvioCodigoPostal,
            direccionEnvioProvincia = pedido.direccionEnvioProvincia,
            direccionEnvioPoblacion = pedido.direccionEnvioPoblacion,
            direccionEnvioDireccion = pedido.direccionEnvioDireccion
        )

        val facturaGuardada = facturaRepository.save(nuevaFactura)

        pedido.lineas.forEach { lineaPedido ->
            val almacen = lineaPedido.almacen ?: pedido.almacen
            val lineaFactura = FacturaLinea(
                factura = facturaGuardada,
                producto = lineaPedido.producto,
                nombreProducto = lineaPedido.nombreProducto,
                referencia = lineaPedido.referencia,
                cantidad = lineaPedido.cantidad,
                precioUnitario = lineaPedido.precioUnitario,
                descuento = lineaPedido.descuento,
                observaciones = lineaPedido.observaciones ?: "",
                tipoIva = lineaPedido.tipoIva,
                porcentajeIva = lineaPedido.porcentajeIva,
                porcentajeRecargo = lineaPedido.porcentajeRecargo,
                importeIva = lineaPedido.importeIva,
                importeRecargo = lineaPedido.importeRecargo,
                almacen = almacen
            )
            facturaGuardada.lineas.add(lineaFactura)
        }

        val facturaFinal = facturaRepository.save(facturaGuardada)

        val transformacion = com.example.demo.model.ventas.DocumentoTransformacion(
            tipoOrigen = "PEDIDO",
            idOrigen = pedido.id,
            numeroOrigen = pedido.numero,
            tipoDestino = "FACTURA",
            idDestino = facturaFinal.id,
            numeroDestino = facturaFinal.numero,
            tipoTransformacion = "CONVERTIR",
            fechaTransformacion = java.time.LocalDateTime.now()
        )
        documentoTransformacionRepository.save(transformacion)

        return ResponseEntity.ok(facturaFinal)
    }

    @PostMapping("/desde-factura-proforma")
    @Transactional
    fun crearDesdeFacturaProforma(@RequestBody request: TransformarAlbaranRequest): ResponseEntity<Any> {
        val facturaProforma = facturaProformaRepository.findById(request.facturaProformaId ?: return ResponseEntity.badRequest().body(mapOf("error" to "ID de factura proforma requerido"))).orElse(null)
            ?: return ResponseEntity.badRequest().body(mapOf("error" to "Factura Proforma no encontrada"))

        val numeracion = serieNumeracionService.generarYReservarNumero(DOCUMENTO_SERIE_TIPO, request.serieId)

        val nuevaFactura = Factura(
            numero = numeracion.codigo,
            fecha = parsearFecha(request.fecha?.toString()),
            cliente = facturaProforma.cliente,
            observaciones = facturaProforma.observaciones ?: "",
            estado = request.estado ?: "Pendiente",
            subtotal = facturaProforma.subtotal,
            descuentoTotal = facturaProforma.descuentoTotal,
            total = facturaProforma.total,
            descuentoAgrupacion = request.descuentoAgrupacion,
            almacen = facturaProforma.almacen,
            ventaMultialmacen = facturaProforma.ventaMultialmacen,
            tarifa = facturaProforma.tarifa,
            serie = numeracion.serie,
            anioDocumento = numeracion.anio,
            numeroSecuencial = numeracion.secuencial,
            codigoDocumento = numeracion.codigo,
            clienteNombreComercial = facturaProforma.clienteNombreComercial,
            clienteNombreFiscal = facturaProforma.clienteNombreFiscal,
            clienteNifCif = facturaProforma.clienteNifCif,
            clienteEmail = facturaProforma.clienteEmail,
            clienteTelefono = facturaProforma.clienteTelefono,
            direccionFacturacionPais = facturaProforma.direccionFacturacionPais,
            direccionFacturacionCodigoPostal = facturaProforma.direccionFacturacionCodigoPostal,
            direccionFacturacionProvincia = facturaProforma.direccionFacturacionProvincia,
            direccionFacturacionPoblacion = facturaProforma.direccionFacturacionPoblacion,
            direccionFacturacionDireccion = facturaProforma.direccionFacturacionDireccion,
            direccionEnvioPais = facturaProforma.direccionEnvioPais,
            direccionEnvioCodigoPostal = facturaProforma.direccionEnvioCodigoPostal,
            direccionEnvioProvincia = facturaProforma.direccionEnvioProvincia,
            direccionEnvioPoblacion = facturaProforma.direccionEnvioPoblacion,
            direccionEnvioDireccion = facturaProforma.direccionEnvioDireccion
        )

        val facturaGuardada = facturaRepository.save(nuevaFactura)

        facturaProforma.lineas.forEach { lineaFacturaProforma ->
            val almacen = lineaFacturaProforma.almacen ?: facturaProforma.almacen
            val lineaFactura = FacturaLinea(
                factura = facturaGuardada,
                producto = lineaFacturaProforma.producto,
                nombreProducto = lineaFacturaProforma.nombreProducto,
                referencia = lineaFacturaProforma.referencia,
                cantidad = lineaFacturaProforma.cantidad,
                precioUnitario = lineaFacturaProforma.precioUnitario,
                descuento = lineaFacturaProforma.descuento,
                observaciones = lineaFacturaProforma.observaciones ?: "",
                tipoIva = lineaFacturaProforma.tipoIva,
                porcentajeIva = lineaFacturaProforma.porcentajeIva,
                porcentajeRecargo = lineaFacturaProforma.porcentajeRecargo,
                importeIva = lineaFacturaProforma.importeIva,
                importeRecargo = lineaFacturaProforma.importeRecargo,
                almacen = almacen
            )
            facturaGuardada.lineas.add(lineaFactura)
        }

        val facturaFinal = facturaRepository.save(facturaGuardada)

        val transformacion = com.example.demo.model.ventas.DocumentoTransformacion(
            tipoOrigen = "FACTURA_PROFORMA",
            idOrigen = facturaProforma.id,
            numeroOrigen = facturaProforma.numero,
            tipoDestino = "FACTURA",
            idDestino = facturaFinal.id,
            numeroDestino = facturaFinal.numero,
            tipoTransformacion = "CONVERTIR",
            fechaTransformacion = java.time.LocalDateTime.now()
        )
        documentoTransformacionRepository.save(transformacion)

        return ResponseEntity.ok(facturaFinal)
    }

    @PostMapping("/transformar")
    @Transactional
    fun transformarDocumento(@RequestBody request: TransformarDocumentoRequest): ResponseEntity<Any> {
        data class LineaOrigen(val producto: com.example.demo.model.Producto?, val nombreProducto: String, val referencia: String?, val cantidad: Double, val precioUnitario: Double, val descuento: Double, val observaciones: String?, val tipoIva: com.example.demo.model.TipoIva?, val porcentajeIva: Double, val porcentajeRecargo: Double, val importeIva: Double, val importeRecargo: Double, val almacen: com.example.demo.model.Almacen?)
        data class DatosOrigen(val cliente: com.example.demo.model.Cliente?, val lineas: List<LineaOrigen>, val descuentoAgrupacion: Double, val almacen: com.example.demo.model.Almacen?, val tarifa: com.example.demo.model.Tarifa?, val ventaMultialmacen: Boolean, val observaciones: String?, val notas: String?, val clienteNombreComercial: String?, val clienteNombreFiscal: String?, val clienteNifCif: String?, val clienteEmail: String?, val clienteTelefono: String?, val direccionFacturacionPais: String?, val direccionFacturacionCodigoPostal: String?, val direccionFacturacionProvincia: String?, val direccionFacturacionPoblacion: String?, val direccionFacturacionDireccion: String?, val direccionEnvioPais: String?, val direccionEnvioCodigoPostal: String?, val direccionEnvioProvincia: String?, val direccionEnvioPoblacion: String?, val direccionEnvioDireccion: String?)

        val datos: DatosOrigen = when (request.tipoOrigen) {
            "PRESUPUESTO" -> { val o = presupuestoRepository.findById(request.idOrigen).orElse(null) ?: return ResponseEntity.badRequest().body(mapOf("error" to "Presupuesto no encontrado")); DatosOrigen(o.cliente, o.lineas.map { LineaOrigen(it.producto, it.nombreProducto, it.referencia, it.cantidad.toDouble(), it.precioUnitario, it.descuento, it.observaciones, it.tipoIva, it.porcentajeIva, it.porcentajeRecargo, it.importeIva, it.importeRecargo, it.almacen) }, o.descuentoAgrupacion, o.almacen, o.tarifa, o.ventaMultialmacen, o.observaciones, o.notas, o.clienteNombreComercial, o.clienteNombreFiscal, o.clienteNifCif, o.clienteEmail, o.clienteTelefono, o.direccionFacturacionPais, o.direccionFacturacionCodigoPostal, o.direccionFacturacionProvincia, o.direccionFacturacionPoblacion, o.direccionFacturacionDireccion, o.direccionEnvioPais, o.direccionEnvioCodigoPostal, o.direccionEnvioProvincia, o.direccionEnvioPoblacion, o.direccionEnvioDireccion) }
            "PEDIDO" -> { val o = pedidoRepository.findById(request.idOrigen).orElse(null) ?: return ResponseEntity.badRequest().body(mapOf("error" to "Pedido no encontrado")); DatosOrigen(o.cliente, o.lineas.map { LineaOrigen(it.producto, it.nombreProducto, it.referencia, it.cantidad.toDouble(), it.precioUnitario, it.descuento, it.observaciones, it.tipoIva, it.porcentajeIva, it.porcentajeRecargo, it.importeIva, it.importeRecargo, it.almacen) }, o.descuentoAgrupacion, o.almacen, o.tarifa, o.ventaMultialmacen ?: false, o.observaciones, o.notas, o.clienteNombreComercial, o.clienteNombreFiscal, o.clienteNifCif, o.clienteEmail, o.clienteTelefono, o.direccionFacturacionPais, o.direccionFacturacionCodigoPostal, o.direccionFacturacionProvincia, o.direccionFacturacionPoblacion, o.direccionFacturacionDireccion, o.direccionEnvioPais, o.direccionEnvioCodigoPostal, o.direccionEnvioProvincia, o.direccionEnvioPoblacion, o.direccionEnvioDireccion) }
            "ALBARAN" -> { val o = albaranRepository.findById(request.idOrigen).orElse(null) ?: return ResponseEntity.badRequest().body(mapOf("error" to "Albarán no encontrado")); DatosOrigen(o.cliente, o.lineas.map { LineaOrigen(it.producto, it.nombreProducto, it.referencia, it.cantidad.toDouble(), it.precioUnitario, it.descuento, it.observaciones, it.tipoIva, it.porcentajeIva, it.porcentajeRecargo, it.importeIva, it.importeRecargo, it.almacen) }, o.descuentoAgrupacion, o.almacen, o.tarifa, o.ventaMultialmacen, o.observaciones, o.notas, o.clienteNombreComercial, o.clienteNombreFiscal, o.clienteNifCif, o.clienteEmail, o.clienteTelefono, o.direccionFacturacionPais, o.direccionFacturacionCodigoPostal, o.direccionFacturacionProvincia, o.direccionFacturacionPoblacion, o.direccionFacturacionDireccion, o.direccionEnvioPais, o.direccionEnvioCodigoPostal, o.direccionEnvioProvincia, o.direccionEnvioPoblacion, o.direccionEnvioDireccion) }
            "FACTURA" -> { val o = facturaRepository.findById(request.idOrigen).orElse(null) ?: return ResponseEntity.badRequest().body(mapOf("error" to "Factura no encontrada")); DatosOrigen(o.cliente, o.lineas.map { LineaOrigen(it.producto, it.nombreProducto, it.referencia, it.cantidad.toDouble(), it.precioUnitario, it.descuento, it.observaciones, it.tipoIva, it.porcentajeIva, it.porcentajeRecargo, it.importeIva, it.importeRecargo, it.almacen) }, o.descuentoAgrupacion, o.almacen, o.tarifa, o.ventaMultialmacen ?: false, o.observaciones, o.notas, o.clienteNombreComercial, o.clienteNombreFiscal, o.clienteNifCif, o.clienteEmail, o.clienteTelefono, o.direccionFacturacionPais, o.direccionFacturacionCodigoPostal, o.direccionFacturacionProvincia, o.direccionFacturacionPoblacion, o.direccionFacturacionDireccion, o.direccionEnvioPais, o.direccionEnvioCodigoPostal, o.direccionEnvioProvincia, o.direccionEnvioPoblacion, o.direccionEnvioDireccion) }
            "FACTURA_PROFORMA" -> { val o = facturaProformaRepository.findById(request.idOrigen).orElse(null) ?: return ResponseEntity.badRequest().body(mapOf("error" to "Factura proforma no encontrada")); DatosOrigen(o.cliente, o.lineas.map { LineaOrigen(it.producto, it.nombreProducto, it.referencia, it.cantidad.toDouble(), it.precioUnitario, it.descuento, it.observaciones, it.tipoIva, it.porcentajeIva, it.porcentajeRecargo, it.importeIva, it.importeRecargo, it.almacen) }, o.descuentoAgrupacion, o.almacen, o.tarifa, o.ventaMultialmacen, o.observaciones, o.notas, o.clienteNombreComercial, o.clienteNombreFiscal, o.clienteNifCif, o.clienteEmail, o.clienteTelefono, o.direccionFacturacionPais, o.direccionFacturacionCodigoPostal, o.direccionFacturacionProvincia, o.direccionFacturacionPoblacion, o.direccionFacturacionDireccion, o.direccionEnvioPais, o.direccionEnvioCodigoPostal, o.direccionEnvioProvincia, o.direccionEnvioPoblacion, o.direccionEnvioDireccion) }
            "FACTURA_RECTIFICATIVA" -> { val o = facturaRectificativaRepository.findById(request.idOrigen).orElse(null) ?: return ResponseEntity.badRequest().body(mapOf("error" to "Factura rectificativa no encontrada")); DatosOrigen(o.cliente, o.lineas.map { LineaOrigen(it.producto, it.nombreProducto, it.referencia, it.cantidad.toDouble(), it.precioUnitario, it.descuento, it.observaciones, it.tipoIva, it.porcentajeIva, it.porcentajeRecargo, it.importeIva, it.importeRecargo, it.almacen) }, o.descuentoAgrupacion ?: 0.0, o.almacen, null, false, o.observaciones, o.notas, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null) }
            "PRESUPUESTO_COMPRA" -> { val o = presupuestoCompraRepository.findById(request.idOrigen).orElse(null) ?: return ResponseEntity.badRequest().body(mapOf("error" to "Presupuesto de compra no encontrado")); val c = request.clienteId?.let { clienteRepository.findById(it).orElse(null) }; DatosOrigen(c, o.lineas.map { LineaOrigen(it.producto, it.nombreProducto, it.referencia, it.cantidad.toDouble(), it.precioUnitario, it.descuento, it.observaciones, it.tipoIva, it.porcentajeIva, it.porcentajeRecargo, it.importeIva, it.importeRecargo, it.almacen) }, o.descuentoAgrupacion, o.almacen, o.tarifa, o.compraMultialmacen ?: false, o.observaciones, o.notas, c?.nombreComercial, c?.nombreFiscal, c?.nifCif, c?.email, c?.telefonoFijo ?: c?.telefonoMovil, null, null, null, null, null, null, null, null, null, null) }
            "PEDIDO_COMPRA" -> { val o = pedidoCompraRepository.findById(request.idOrigen).orElse(null) ?: return ResponseEntity.badRequest().body(mapOf("error" to "Pedido de compra no encontrado")); val c = request.clienteId?.let { clienteRepository.findById(it).orElse(null) }; DatosOrigen(c, o.lineas.map { LineaOrigen(it.producto, it.nombreProducto, it.referencia, it.cantidad.toDouble(), it.precioUnitario, it.descuento, it.observaciones, it.tipoIva, it.porcentajeIva, it.porcentajeRecargo, it.importeIva, it.importeRecargo, it.almacen) }, o.descuentoAgrupacion, o.almacen, o.tarifa, o.compraMultialmacen ?: false, o.observaciones, o.notas, c?.nombreComercial, c?.nombreFiscal, c?.nifCif, c?.email, c?.telefonoFijo ?: c?.telefonoMovil, null, null, null, null, null, null, null, null, null, null) }
            "ALBARAN_COMPRA" -> { val o = albaranCompraRepository.findById(request.idOrigen).orElse(null) ?: return ResponseEntity.badRequest().body(mapOf("error" to "Albarán de compra no encontrado")); val c = request.clienteId?.let { clienteRepository.findById(it).orElse(null) }; DatosOrigen(c, o.lineas.map { LineaOrigen(it.producto, it.nombreProducto, it.referencia, it.cantidad.toDouble(), it.precioUnitario, it.descuento, it.observaciones, it.tipoIva, it.porcentajeIva, it.porcentajeRecargo, it.importeIva, it.importeRecargo, it.almacen) }, o.descuentoAgrupacion, o.almacen, o.tarifa, o.compraMultialmacen, o.observaciones, o.notas, c?.nombreComercial, c?.nombreFiscal, c?.nifCif, c?.email, c?.telefonoFijo ?: c?.telefonoMovil, null, null, null, null, null, null, null, null, null, null) }
            "FACTURA_COMPRA" -> { val o = facturaCompraRepository.findById(request.idOrigen).orElse(null) ?: return ResponseEntity.badRequest().body(mapOf("error" to "Factura de compra no encontrada")); val c = request.clienteId?.let { clienteRepository.findById(it).orElse(null) }; DatosOrigen(c, o.lineas.map { LineaOrigen(it.producto, it.nombreProducto, it.referencia, it.cantidad.toDouble(), it.precioUnitario, it.descuento, it.observaciones, it.tipoIva, it.porcentajeIva, it.porcentajeRecargo, it.importeIva, it.importeRecargo, it.almacen) }, o.descuentoAgrupacion, o.almacen, o.tarifa, o.compraMultialmacen, o.observaciones, o.notas, c?.nombreComercial, c?.nombreFiscal, c?.nifCif, c?.email, c?.telefonoFijo ?: c?.telefonoMovil, null, null, null, null, null, null, null, null, null, null) }
            else -> return ResponseEntity.badRequest().body(mapOf("error" to "Tipo de origen no soportado: ${request.tipoOrigen}"))
        }

        val numeracion = serieNumeracionService.generarYReservarNumero(DOCUMENTO_SERIE_TIPO, request.serieId)
        val fechaTransformada = parsearFecha(request.fecha)
        val subtotal = datos.lineas.sumOf { it.cantidad * it.precioUnitario }
        val descuentoTotal = datos.lineas.sumOf { (it.cantidad * it.precioUnitario) * (it.descuento / 100) }
        val baseImponible = (subtotal - descuentoTotal) * (1 - datos.descuentoAgrupacion / 100)
        val impuestosTotales = datos.lineas.sumOf { l -> val base = (l.cantidad * l.precioUnitario) * (1 - l.descuento / 100) * (1 - datos.descuentoAgrupacion / 100); base * (l.porcentajeIva + l.porcentajeRecargo) / 100 }
        val total = baseImponible + impuestosTotales

        val nuevaFactura = Factura(
            numero = numeracion.codigo,
            fecha = fechaTransformada,
            cliente = datos.cliente,
            observaciones = datos.observaciones ?: "",
            notas = datos.notas ?: "",
            estado = request.estado,
            subtotal = subtotal,
            descuentoTotal = descuentoTotal,
            total = total,
            descuentoAgrupacion = datos.descuentoAgrupacion,
            serie = numeracion.serie,
            anioDocumento = numeracion.anio,
            numeroSecuencial = numeracion.secuencial,
            codigoDocumento = numeracion.codigo,
            tarifa = datos.tarifa,
            almacen = datos.almacen,
            ventaMultialmacen = datos.ventaMultialmacen,
            clienteNombreComercial = datos.clienteNombreComercial,
            clienteNombreFiscal = datos.clienteNombreFiscal,
            clienteNifCif = datos.clienteNifCif,
            clienteEmail = datos.clienteEmail,
            clienteTelefono = datos.clienteTelefono,
            direccionFacturacionPais = datos.direccionFacturacionPais,
            direccionFacturacionCodigoPostal = datos.direccionFacturacionCodigoPostal,
            direccionFacturacionProvincia = datos.direccionFacturacionProvincia,
            direccionFacturacionPoblacion = datos.direccionFacturacionPoblacion,
            direccionFacturacionDireccion = datos.direccionFacturacionDireccion,
            direccionEnvioPais = datos.direccionEnvioPais,
            direccionEnvioCodigoPostal = datos.direccionEnvioCodigoPostal,
            direccionEnvioProvincia = datos.direccionEnvioProvincia,
            direccionEnvioPoblacion = datos.direccionEnvioPoblacion,
            direccionEnvioDireccion = datos.direccionEnvioDireccion
        )

        val facturaGuardada = facturaRepository.save(nuevaFactura)

        datos.lineas.forEach { linea ->
            facturaGuardada.lineas.add(FacturaLinea(
                factura = facturaGuardada,
                producto = linea.producto,
                nombreProducto = linea.nombreProducto,
                referencia = linea.referencia ?: linea.producto?.referencia,
                cantidad = linea.cantidad.toInt(),
                precioUnitario = linea.precioUnitario,
                descuento = linea.descuento,
                observaciones = linea.observaciones ?: "",
                tipoIva = linea.tipoIva,
                porcentajeIva = linea.porcentajeIva,
                porcentajeRecargo = linea.porcentajeRecargo,
                importeIva = linea.importeIva,
                importeRecargo = linea.importeRecargo,
                almacen = linea.almacen
            ))
        }

        val facturaFinal = facturaRepository.save(facturaGuardada)

        // Gestionar stock si estado es Emitido
        if (request.estado == "Emitido") {
            val configuracion = configuracionVentasRepository.findTopByOrderByIdAsc()
            if (configuracion?.documentoDescuentaStock == "FACTURA") {
                stockService.gestionarStockFactura(facturaFinal, "CREAR")
            }
        }

        if (!request.esDuplicacion) {
            documentoTransformacionRepository.save(com.example.demo.model.ventas.DocumentoTransformacion(
                tipoOrigen = request.tipoOrigen,
                idOrigen = request.idOrigen,
                numeroOrigen = null,
                tipoDestino = "FACTURA",
                idDestino = facturaFinal.id,
                numeroDestino = facturaFinal.numero,
                tipoTransformacion = "CONVERTIR",
                fechaTransformacion = LocalDateTime.now()
            ))
        }

        return ResponseEntity.ok(facturaFinal)
    }

    // ========== ADJUNTOS ==========
    private fun cargarAdjuntos(factura: Factura): Factura {
        factura.adjuntos = obtenerAdjuntos(factura.id)
        return factura
    }

    private fun obtenerAdjuntos(facturaId: Long): List<com.example.demo.model.ArchivoEmpresa> {
        return archivoEmpresaRepository.findByDocumentoOrigenAndDocumentoOrigenId("FACTURA", facturaId)
    }

    private fun actualizarAdjuntosFactura(facturaId: Long, adjuntosIds: List<Long>) {
        // Primero, desvincular todos los adjuntos existentes de esta factura
        val adjuntosExistentes = archivoEmpresaRepository.findByDocumentoOrigenAndDocumentoOrigenId("FACTURA", facturaId)
        adjuntosExistentes.forEach { adjunto ->
            val adjuntoDesvinculado = adjunto.copy(
                documentoOrigen = null,
                documentoOrigenId = null
            )
            archivoEmpresaRepository.save(adjuntoDesvinculado)
        }
        
        // Luego, vincular los nuevos adjuntos
        adjuntosIds.forEach { archivoId ->
            val archivo = archivoEmpresaRepository.findById(archivoId).orElse(null)
            if (archivo != null) {
                val archivoActualizado = archivo.copy(
                    documentoOrigen = "FACTURA",
                    documentoOrigenId = facturaId
                )
                archivoEmpresaRepository.save(archivoActualizado)
            }
        }
    }

    @PostMapping("/{id}/adjuntos")
    fun actualizarAdjuntosEndpoint(
        @PathVariable id: Long,
        @RequestBody adjuntosIds: List<Long>
    ): ResponseEntity<Any> {
        return try {
            actualizarAdjuntosFactura(id, adjuntosIds)
            ResponseEntity.ok(mapOf("mensaje" to "Adjuntos actualizados correctamente"))
        } catch (e: Exception) {
            ResponseEntity.status(500).body(mapOf("error" to "Error al actualizar adjuntos: ${e.message}"))
        }
    }
}
