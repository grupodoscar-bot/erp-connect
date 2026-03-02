package com.example.demo.controller.ventas

import com.example.demo.model.Direccion
import com.example.demo.model.ventas.Pedido
import com.example.demo.model.ventas.PedidoLinea
import com.example.demo.model.ventas.Albaran
import com.example.demo.model.ventas.AlbaranLinea
import com.example.demo.model.ventas.Presupuesto
import com.example.demo.model.ventas.PresupuestoLinea
import com.example.demo.model.ventas.FacturaProforma
import com.example.demo.model.ventas.FacturaProformaLinea
import com.example.demo.model.ventas.FacturaRectificativa
import com.example.demo.model.ventas.FacturaRectificativaLinea
import com.example.demo.model.ventas.DocumentoTransformacion
import com.example.demo.repository.AlmacenRepository
import com.example.demo.repository.ClienteRepository
import com.example.demo.repository.ProductoRepository
import com.example.demo.repository.TipoIvaRepository
import com.example.demo.repository.DireccionRepository
import com.example.demo.repository.ventas.PedidoRepository as PedidoVentaRepository
import com.example.demo.repository.ventas.PresupuestoRepository
import com.example.demo.repository.ventas.AlbaranRepository as AlbaranVentaRepository
import com.example.demo.repository.ventas.FacturaRepository as FacturaVentaRepository
import com.example.demo.repository.ventas.FacturaProformaRepository
import com.example.demo.repository.ventas.FacturaRectificativaRepository
import com.example.demo.repository.ventas.DocumentoTransformacionRepository
import com.example.demo.repository.compras.AlbaranCompraRepository
import com.example.demo.repository.compras.FacturaCompraRepository
import com.example.demo.repository.compras.PedidoCompraRepository
import com.example.demo.repository.compras.PresupuestoCompraRepository
import com.example.demo.service.SerieNumeracionService
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
@RequestMapping("/pedidos")
@CrossOrigin(origins = ["http://145.223.103.219:3000"])
class PedidoController(
    private val pedidoRepository: com.example.demo.repository.ventas.PedidoRepository,
    private val presupuestoRepository: com.example.demo.repository.ventas.PresupuestoRepository,
    private val albaranRepository: com.example.demo.repository.ventas.AlbaranRepository,
    private val facturaRepository: com.example.demo.repository.ventas.FacturaRepository,
    private val facturaProformaRepository: FacturaProformaRepository,
    private val facturaRectificativaRepository: FacturaRectificativaRepository,
    private val clienteRepository: ClienteRepository,
    private val productoRepository: ProductoRepository,
    private val tipoIvaRepository: TipoIvaRepository,
    private val direccionRepository: DireccionRepository,
    private val almacenRepository: AlmacenRepository,
    private val serieNumeracionService: SerieNumeracionService,
    private val tarifaService: TarifaService,
    private val archivoEmpresaRepository: com.example.demo.repository.ArchivoEmpresaRepository,
    private val documentoTransformacionRepository: DocumentoTransformacionRepository,
    private val albaranCompraRepository: AlbaranCompraRepository,
    private val facturaCompraRepository: FacturaCompraRepository,
    private val pedidoCompraRepository: PedidoCompraRepository,
    private val presupuestoCompraRepository: PresupuestoCompraRepository
) {

    companion object {
        private const val DOCUMENTO_SERIE_TIPO = "PEDIDO"
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
    fun listarTodos(): List<Pedido> = pedidoRepository.findAll()

    @GetMapping("/paginado")
    fun listarPaginado(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "50") size: Int,
        @RequestParam(defaultValue = "fecha") sortBy: String,
        @RequestParam(defaultValue = "DESC") sortDir: String,
        @RequestParam(required = false) search: String?,
        @RequestParam(required = false) estado: String?
    ): ResponseEntity<Map<String, Any>> {
        val sort = if (sortDir.uppercase() == "ASC") {
            Sort.by(sortBy).ascending()
        } else {
            Sort.by(sortBy).descending()
        }

        val pageRequest = PageRequest.of(page, size, sort)
        val pedidosPage: Page<Pedido> = pedidoRepository.findAll(pageRequest)

        var pedidosFiltrados = pedidosPage.content.toList()

        if (!search.isNullOrBlank()) {
            pedidosFiltrados = pedidosFiltrados.filter { pedido ->
                pedido.numero.contains(search, ignoreCase = true) ||
                pedido.cliente?.nombreComercial?.contains(search, ignoreCase = true) == true ||
                pedido.cliente?.nombreFiscal?.contains(search, ignoreCase = true) == true
            }
        }

        if (!estado.isNullOrBlank()) {
            pedidosFiltrados = pedidosFiltrados.filter { it.estado == estado }
        }

        val response = mapOf<String, Any>(
            "content" to pedidosFiltrados,
            "totalElements" to pedidosPage.totalElements,
            "totalPages" to pedidosPage.totalPages,
            "currentPage" to pedidosPage.number,
            "pageSize" to pedidosPage.size,
            "hasNext" to pedidosPage.hasNext(),
            "hasPrevious" to pedidosPage.hasPrevious()
        )

        return ResponseEntity.ok(response)
    }

    @GetMapping("/{id}")
    fun obtenerPorId(@PathVariable id: Long): ResponseEntity<Pedido> {
        val pedido = pedidoRepository.findById(id).orElse(null)
            ?: return ResponseEntity.notFound().build()
        cargarAdjuntos(pedido)
        return ResponseEntity.ok(pedido)
    }

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
    fun crear(@RequestBody request: PedidoRequest): ResponseEntity<Pedido> {
        val cliente = request.clienteId?.let { clienteRepository.findById(it).orElse(null) }
        val presupuesto = request.presupuestoId?.let { presupuestoRepository.findById(it).orElse(null) }
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

        val lineasCalculadas = calcularLineas(request.lineas, cliente, request.descuentoAgrupacion)
        val totales = calcularTotales(lineasCalculadas, request.descuentoAgrupacion)

        val fechaPedido = request.fecha?.let { parsearFecha(it) } ?: LocalDateTime.now()

        val nuevoPedido = Pedido(
            numero = numeracion.codigo,
            fecha = fechaPedido,
            cliente = cliente,
            presupuesto = presupuesto,
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

        val pedidoGuardado = pedidoRepository.save(nuevoPedido)

        lineasCalculadas.forEach { lineaCalc ->
            val almacenLinea = lineaCalc.almacenId?.let { almacenRepository.findById(it).orElse(null) }
            val linea = PedidoLinea(
                pedido = pedidoGuardado,
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
            pedidoGuardado.lineas.add(linea)
        }

        return ResponseEntity.ok(pedidoRepository.save(pedidoGuardado))
    }

    @PutMapping("/{id}")
    @Transactional
    fun actualizar(
        @PathVariable id: Long,
        @RequestBody request: PedidoRequest
    ): ResponseEntity<Pedido> {
        return pedidoRepository.findById(id)
            .map { existente ->
                val cliente = request.clienteId?.let { clienteRepository.findById(it).orElse(null) }
                val presupuesto = request.presupuestoId?.let { presupuestoRepository.findById(it).orElse(null) }
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

                val lineasCalculadas = calcularLineas(request.lineas, cliente, request.descuentoAgrupacion)
                val totales = calcularTotales(lineasCalculadas, request.descuentoAgrupacion)

                existente.lineas.clear()

                val fechaActualizada = request.fecha?.let { parsearFecha(it) } ?: existente.fecha

                val actualizado = existente.copy(
                    fecha = fechaActualizada,
                    cliente = cliente,
                    presupuesto = presupuesto,
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

                val guardado = pedidoRepository.save(actualizado)

                lineasCalculadas.forEach { lineaCalc ->
                    val almacenLinea = lineaCalc.almacenId?.let { almacenRepository.findById(it).orElse(null) }
                    val linea = PedidoLinea(
                        pedido = guardado,
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
                    guardado.lineas.add(linea)
                }

                ResponseEntity.ok(pedidoRepository.save(guardado))
            }
            .orElse(ResponseEntity.notFound().build())
    }

    @DeleteMapping("/{id}")
    @Transactional
    fun eliminar(@PathVariable id: Long): ResponseEntity<Void> {
        return if (pedidoRepository.existsById(id)) {
            pedidoRepository.deleteById(id)
            ResponseEntity.noContent().build()
        } else {
            ResponseEntity.notFound().build()
        }
    }

    @PostMapping("/{id}/duplicar")
    @Transactional
    fun duplicar(@PathVariable id: Long): ResponseEntity<Pedido> {
        val original = pedidoRepository.findByIdWithLineas(id)
            ?: return ResponseEntity.notFound().build()

        val numeracion = serieNumeracionService.generarYReservarNumero(DOCUMENTO_SERIE_TIPO, original.serie?.id)

        val duplicado = original.copy(
            id = 0,
            numero = numeracion.codigo,
            fecha = LocalDateTime.now(),
            estado = "Pendiente",
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

        val guardado = pedidoRepository.save(duplicado)

        original.lineas.forEach { lineaOriginal ->
            val nuevaLinea = PedidoLinea(
                pedido = guardado,
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
            guardado.lineas.add(nuevaLinea)
        }

        return ResponseEntity.ok(pedidoRepository.save(guardado))
    }

    @PostMapping("/{id}/convertir-a-albaran")
    @Transactional
    fun convertirAAlbaran(@PathVariable id: Long): ResponseEntity<Albaran> {
        val pedido = pedidoRepository.findByIdWithLineas(id)
            ?: return ResponseEntity.notFound().build()

        val numeracionAlbaran = serieNumeracionService.generarYReservarNumero("ALBARAN_VENTA", null)

        val albaran = Albaran(
            numero = numeracionAlbaran.codigo,
            fecha = LocalDateTime.now(),
            cliente = pedido.cliente,
            observaciones = pedido.observaciones,
            notas = pedido.notas,
            estado = "Pendiente",
            subtotal = pedido.subtotal,
            descuentoTotal = pedido.descuentoTotal,
            total = pedido.total,
            descuentoAgrupacion = pedido.descuentoAgrupacion,
            almacen = pedido.almacen,
            ventaMultialmacen = pedido.ventaMultialmacen,
            tarifa = pedido.tarifa,
            serie = numeracionAlbaran.serie,
            anioDocumento = numeracionAlbaran.anio,
            numeroSecuencial = numeracionAlbaran.secuencial,
            codigoDocumento = numeracionAlbaran.codigo,
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

        val albaranGuardado = albaranRepository.save(albaran)

        pedido.lineas.forEach { lineaPedido ->
            val lineaAlbaran = AlbaranLinea(
                albaran = albaranGuardado,
                producto = lineaPedido.producto,
                nombreProducto = lineaPedido.nombreProducto,
                referencia = lineaPedido.referencia,
                cantidad = lineaPedido.cantidad,
                precioUnitario = lineaPedido.precioUnitario,
                descuento = lineaPedido.descuento,
                observaciones = lineaPedido.observaciones,
                tipoIva = lineaPedido.tipoIva,
                porcentajeIva = lineaPedido.porcentajeIva,
                porcentajeRecargo = lineaPedido.porcentajeRecargo,
                importeIva = lineaPedido.importeIva,
                importeRecargo = lineaPedido.importeRecargo,
                almacen = lineaPedido.almacen
            )
            albaranGuardado.lineas.add(lineaAlbaran)
        }

        return ResponseEntity.ok(albaranRepository.save(albaranGuardado))
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
        lineas: List<PedidoLineaRequest>,
        cliente: com.example.demo.model.Cliente?,
        descuentoAgrupacion: Double
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
                almacenId = lineaReq.almacenId
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

        val nuevoPedido = Pedido(
            numero = numeracion.codigo,
            fecha = fechaDesdeAlbaran,
            cliente = albaran.cliente,
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

        val pedidoGuardado = pedidoRepository.save(nuevoPedido)

        lineasCalculadas.forEach { linea ->
            val almacen = linea.almacenId?.let { almacenRepository.findById(it).orElse(null) }
            val lineaPedido = PedidoLinea(
                pedido = pedidoGuardado,
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
            pedidoGuardado.lineas.add(lineaPedido)
        }

        val pedidoFinal = pedidoRepository.save(pedidoGuardado)

        // Registrar transformación
        val transformacion = com.example.demo.model.ventas.DocumentoTransformacion(
            tipoOrigen = "ALBARAN",
            idOrigen = albaran.id,
            numeroOrigen = albaran.numero,
            tipoDestino = "PEDIDO",
            idDestino = pedidoFinal.id,
            numeroDestino = pedidoFinal.numero,
            tipoTransformacion = "CONVERTIR",
            fechaTransformacion = java.time.LocalDateTime.now()
        )
        documentoTransformacionRepository.save(transformacion)

        return ResponseEntity.ok(pedidoFinal)
    }

    @PostMapping("/desde-factura")
    @Transactional
    fun crearDesdeFactura(@RequestBody request: TransformarAlbaranRequest): ResponseEntity<Any> {
        val factura = facturaRepository.findById(request.albaranId ?: return ResponseEntity.badRequest().body(mapOf("error" to "ID de factura requerido"))).orElse(null)
            ?: return ResponseEntity.badRequest().body(mapOf("error" to "Factura no encontrada"))

        val numeracion = serieNumeracionService.generarYReservarNumero(DOCUMENTO_SERIE_TIPO, request.serieId, usuarioId = null)

        val lineasCalculadas = factura.lineas.map { lineaFactura ->
            LineaCalculada(
                cantidad = lineaFactura.cantidad,
                precioUnitario = lineaFactura.precioUnitario,
                descuento = lineaFactura.descuento,
                producto = lineaFactura.producto,
                nombreProducto = lineaFactura.nombreProducto,
                referencia = lineaFactura.referencia,
                observaciones = lineaFactura.observaciones ?: "",
                tipoIva = lineaFactura.tipoIva,
                porcentajeIva = lineaFactura.porcentajeIva,
                porcentajeRecargo = lineaFactura.porcentajeRecargo,
                importeIva = lineaFactura.importeIva,
                importeRecargo = lineaFactura.importeRecargo,
                almacenId = lineaFactura.almacen?.id
            )
        }

        val totales = calcularTotales(lineasCalculadas, factura.descuentoAgrupacion)

        val fechaDesdeFactura = request.fecha?.let { parsearFecha(it) } ?: factura.fecha

        val nuevoPedido = Pedido(
            numero = numeracion.codigo,
            fecha = fechaDesdeFactura,
            cliente = factura.cliente,
            observaciones = factura.observaciones ?: "",
            notas = factura.notas ?: "",
            estado = request.estado ?: "Pendiente",
            subtotal = totales.subtotal,
            descuentoTotal = totales.descuentoTotal,
            total = totales.total,
            descuentoAgrupacion = factura.descuentoAgrupacion,
            serie = numeracion.serie,
            anioDocumento = numeracion.anio,
            numeroSecuencial = numeracion.secuencial,
            codigoDocumento = numeracion.codigo,
            tarifa = factura.tarifa,
            almacen = factura.almacen,
            ventaMultialmacen = factura.ventaMultialmacen ?: false,
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

        val pedidoGuardado = pedidoRepository.save(nuevoPedido)

        lineasCalculadas.forEach { linea ->
            val almacen = linea.almacenId?.let { almacenRepository.findById(it).orElse(null) }
            val lineaPedido = PedidoLinea(
                pedido = pedidoGuardado,
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
            pedidoGuardado.lineas.add(lineaPedido)
        }

        val pedidoFinal = pedidoRepository.save(pedidoGuardado)

        // Registrar transformación
        val transformacion = com.example.demo.model.ventas.DocumentoTransformacion(
            tipoOrigen = "FACTURA",
            idOrigen = factura.id,
            numeroOrigen = factura.numero,
            tipoDestino = "PEDIDO",
            idDestino = pedidoFinal.id,
            numeroDestino = pedidoFinal.numero,
            tipoTransformacion = "CONVERTIR",
            fechaTransformacion = java.time.LocalDateTime.now()
        )
        documentoTransformacionRepository.save(transformacion)

        return ResponseEntity.ok(pedidoFinal)
    }

    @PostMapping("/desde-presupuesto")
    @Transactional
    fun crearDesdePresupuesto(@RequestBody request: TransformarAlbaranRequest): ResponseEntity<Any> {
        val presupuesto = presupuestoRepository.findById(request.presupuestoId ?: return ResponseEntity.badRequest().body(mapOf("error" to "ID de presupuesto requerido"))).orElse(null)
            ?: return ResponseEntity.badRequest().body(mapOf("error" to "Presupuesto no encontrado"))

        val numeracion = serieNumeracionService.generarYReservarNumero(
            "PEDIDO_VENTA",
            request.serieId
        )

        val fechaDesdePresupuesto = request.fecha?.let { parsearFecha(it) } ?: presupuesto.fecha

        val pedido = Pedido(
            numero = numeracion.codigo,
            serie = numeracion.serie,
            fecha = fechaDesdePresupuesto,
            estado = request.estado ?: "Pendiente",
            cliente = presupuesto.cliente,
            subtotal = presupuesto.subtotal,
            descuentoTotal = presupuesto.descuentoTotal,
            total = presupuesto.total,
            observaciones = presupuesto.observaciones,
            descuentoAgrupacion = request.descuentoAgrupacion ?: presupuesto.descuentoAgrupacion
        )

        val pedidoGuardado = pedidoRepository.save(pedido)

        val lineasPedido = presupuesto.lineas.map { lineaPresupuesto ->
            PedidoLinea(
                pedido = pedidoGuardado,
                producto = lineaPresupuesto.producto,
                nombreProducto = lineaPresupuesto.nombreProducto,
                referencia = lineaPresupuesto.referencia,
                cantidad = lineaPresupuesto.cantidad,
                precioUnitario = lineaPresupuesto.precioUnitario,
                descuento = lineaPresupuesto.descuento,
                observaciones = lineaPresupuesto.observaciones,
                tipoIva = lineaPresupuesto.tipoIva,
                porcentajeIva = lineaPresupuesto.porcentajeIva,
                porcentajeRecargo = lineaPresupuesto.porcentajeRecargo,
                importeIva = lineaPresupuesto.importeIva,
                importeRecargo = lineaPresupuesto.importeRecargo,
                almacen = lineaPresupuesto.almacen
            )
        }

        pedidoRepository.save(pedidoGuardado.copy(lineas = lineasPedido.toMutableList()))

        val pedidoFinal = pedidoRepository.findById(pedidoGuardado.id).get()

        val transformacion = DocumentoTransformacion(
            tipoOrigen = "PRESUPUESTO",
            idOrigen = presupuesto.id,
            numeroOrigen = presupuesto.numero,
            tipoDestino = "PEDIDO",
            idDestino = pedidoFinal.id,
            numeroDestino = pedidoFinal.numero,
            tipoTransformacion = "CONVERTIR",
            fechaTransformacion = LocalDateTime.now()
        )
        documentoTransformacionRepository.save(transformacion)

        return ResponseEntity.ok(pedidoFinal)
    }

    @PostMapping("/desde-factura-proforma")
    @Transactional
    fun crearDesdeFacturaProforma(@RequestBody request: TransformarAlbaranRequest): ResponseEntity<Any> {
        val facturaProforma = facturaProformaRepository.findById(request.facturaProformaId ?: return ResponseEntity.badRequest().body(mapOf("error" to "ID de factura proforma requerido"))).orElse(null)
            ?: return ResponseEntity.badRequest().body(mapOf("error" to "Factura Proforma no encontrada"))

        val numeracion = serieNumeracionService.generarYReservarNumero(
            "PEDIDO_VENTA",
            request.serieId
        )

        val fechaDesdeFacturaProforma = request.fecha?.let { parsearFecha(it) } ?: facturaProforma.fecha

        val pedido = Pedido(
            numero = numeracion.codigo,
            serie = numeracion.serie,
            fecha = fechaDesdeFacturaProforma,
            estado = request.estado ?: "Pendiente",
            cliente = facturaProforma.cliente,
            subtotal = facturaProforma.subtotal,
            descuentoTotal = facturaProforma.descuentoTotal,
            total = facturaProforma.total,
            observaciones = facturaProforma.observaciones,
            descuentoAgrupacion = request.descuentoAgrupacion ?: facturaProforma.descuentoAgrupacion
        )

        val pedidoGuardado = pedidoRepository.save(pedido)

        val lineasPedido = facturaProforma.lineas.map { lineaProforma ->
            PedidoLinea(
                pedido = pedidoGuardado,
                producto = lineaProforma.producto,
                nombreProducto = lineaProforma.nombreProducto,
                referencia = lineaProforma.referencia,
                cantidad = lineaProforma.cantidad,
                precioUnitario = lineaProforma.precioUnitario,
                descuento = lineaProforma.descuento,
                observaciones = lineaProforma.observaciones,
                tipoIva = lineaProforma.tipoIva,
                porcentajeIva = lineaProforma.porcentajeIva,
                porcentajeRecargo = lineaProforma.porcentajeRecargo,
                importeIva = lineaProforma.importeIva,
                importeRecargo = lineaProforma.importeRecargo,
                almacen = lineaProforma.almacen
            )
        }

        pedidoRepository.save(pedidoGuardado.copy(lineas = lineasPedido.toMutableList()))

        val pedidoFinal = pedidoRepository.findById(pedidoGuardado.id).get()

        val transformacion = DocumentoTransformacion(
            tipoOrigen = "FACTURA_PROFORMA",
            idOrigen = facturaProforma.id,
            numeroOrigen = facturaProforma.numero,
            tipoDestino = "PEDIDO",
            idDestino = pedidoFinal.id,
            numeroDestino = pedidoFinal.numero,
            tipoTransformacion = "CONVERTIR",
            fechaTransformacion = LocalDateTime.now()
        )
        documentoTransformacionRepository.save(transformacion)

        return ResponseEntity.ok(pedidoFinal)
    }

    @PostMapping("/desde-factura-rectificativa")
    @Transactional
    fun crearDesdeFacturaRectificativa(@RequestBody request: TransformarAlbaranRequest): ResponseEntity<Any> {
        val facturaRectificativa = facturaRectificativaRepository.findById(request.facturaRectificativaId ?: return ResponseEntity.badRequest().body(mapOf("error" to "ID de factura rectificativa requerido"))).orElse(null)
            ?: return ResponseEntity.badRequest().body(mapOf("error" to "Factura Rectificativa no encontrada"))

        val numeracion = serieNumeracionService.generarYReservarNumero(
            "PEDIDO_VENTA",
            request.serieId
        )

        val pedido = Pedido(
            numero = numeracion.codigo,
            serie = numeracion.serie,
            fecha = parsearFecha(request.fecha?.toString()),
            estado = request.estado ?: "Pendiente",
            cliente = facturaRectificativa.cliente,
            subtotal = facturaRectificativa.subtotal,
            descuentoTotal = facturaRectificativa.descuentoTotal,
            total = facturaRectificativa.total,
            observaciones = facturaRectificativa.observaciones,
            descuentoAgrupacion = request.descuentoAgrupacion ?: facturaRectificativa.descuentoAgrupacion
        )

        val pedidoGuardado = pedidoRepository.save(pedido)

        val lineasPedido = facturaRectificativa.lineas.map { lineaRectificativa ->
            PedidoLinea(
                pedido = pedidoGuardado,
                producto = lineaRectificativa.producto,
                nombreProducto = lineaRectificativa.nombreProducto,
                referencia = lineaRectificativa.referencia,
                cantidad = lineaRectificativa.cantidad,
                precioUnitario = lineaRectificativa.precioUnitario,
                descuento = lineaRectificativa.descuento,
                observaciones = lineaRectificativa.observaciones,
                tipoIva = lineaRectificativa.tipoIva,
                porcentajeIva = lineaRectificativa.porcentajeIva,
                porcentajeRecargo = lineaRectificativa.porcentajeRecargo,
                importeIva = lineaRectificativa.importeIva,
                importeRecargo = lineaRectificativa.importeRecargo,
                almacen = lineaRectificativa.almacen
            )
        }

        pedidoRepository.save(pedidoGuardado.copy(lineas = lineasPedido.toMutableList()))

        val pedidoFinal = pedidoRepository.findById(pedidoGuardado.id).get()

        val transformacion = DocumentoTransformacion(
            tipoOrigen = "FACTURA_RECTIFICATIVA",
            idOrigen = facturaRectificativa.id,
            numeroOrigen = facturaRectificativa.numero,
            tipoDestino = "PEDIDO",
            idDestino = pedidoFinal.id,
            numeroDestino = pedidoFinal.numero,
            tipoTransformacion = "CONVERTIR",
            fechaTransformacion = LocalDateTime.now()
        )
        documentoTransformacionRepository.save(transformacion)

        return ResponseEntity.ok(pedidoFinal)
    }

    @PostMapping("/transformar")
    @Transactional
    fun transformarDocumento(@RequestBody request: TransformarDocumentoRequest): ResponseEntity<Any> {
        data class LineaOrigen(val producto: com.example.demo.model.Producto?, val nombreProducto: String, val referencia: String?, val cantidad: Double, val precioUnitario: Double, val descuento: Double, val observaciones: String?, val tipoIva: com.example.demo.model.TipoIva?, val porcentajeIva: Double, val porcentajeRecargo: Double, val importeIva: Double, val importeRecargo: Double, val almacen: com.example.demo.model.Almacen?)
        data class DatosOrigen(val cliente: com.example.demo.model.Cliente?, val lineas: List<LineaOrigen>, val descuentoAgrupacion: Double, val almacen: com.example.demo.model.Almacen?, val tarifa: com.example.demo.model.Tarifa?, val ventaMultialmacen: Boolean, val observaciones: String?, val notas: String?, val clienteNombreComercial: String?, val clienteNombreFiscal: String?, val clienteNifCif: String?, val clienteEmail: String?, val clienteTelefono: String?, val direccionFacturacionPais: String?, val direccionFacturacionCodigoPostal: String?, val direccionFacturacionProvincia: String?, val direccionFacturacionPoblacion: String?, val direccionFacturacionDireccion: String?, val direccionEnvioPais: String?, val direccionEnvioCodigoPostal: String?, val direccionEnvioProvincia: String?, val direccionEnvioPoblacion: String?, val direccionEnvioDireccion: String?)

        val datos: DatosOrigen = when (request.tipoOrigen) {
            "PRESUPUESTO" -> { val o = presupuestoRepository.findById(request.idOrigen).orElse(null) ?: return ResponseEntity.badRequest().body(mapOf("error" to "Presupuesto no encontrado")); DatosOrigen(o.cliente, o.lineas.map { LineaOrigen(it.producto, it.nombreProducto, it.referencia, it.cantidad.toDouble(), it.precioUnitario, it.descuento, it.observaciones, it.tipoIva, it.porcentajeIva, it.porcentajeRecargo, it.importeIva, it.importeRecargo, it.almacen) }, o.descuentoAgrupacion, o.almacen, o.tarifa, o.ventaMultialmacen, o.observaciones, o.notas, o.clienteNombreComercial, o.clienteNombreFiscal, o.clienteNifCif, o.clienteEmail, o.clienteTelefono, o.direccionFacturacionPais, o.direccionFacturacionCodigoPostal, o.direccionFacturacionProvincia, o.direccionFacturacionPoblacion, o.direccionFacturacionDireccion, o.direccionEnvioPais, o.direccionEnvioCodigoPostal, o.direccionEnvioProvincia, o.direccionEnvioPoblacion, o.direccionEnvioDireccion) }
            "PEDIDO" -> { val o = pedidoRepository.findById(request.idOrigen).orElse(null) ?: return ResponseEntity.badRequest().body(mapOf("error" to "Pedido no encontrado")); DatosOrigen(o.cliente, o.lineas.map { LineaOrigen(it.producto, it.nombreProducto, it.referencia, it.cantidad.toDouble(), it.precioUnitario, it.descuento, it.observaciones, it.tipoIva, it.porcentajeIva, it.porcentajeRecargo, it.importeIva, it.importeRecargo, it.almacen) }, o.descuentoAgrupacion, o.almacen, o.tarifa, o.ventaMultialmacen, o.observaciones, o.notas, o.clienteNombreComercial, o.clienteNombreFiscal, o.clienteNifCif, o.clienteEmail, o.clienteTelefono, o.direccionFacturacionPais, o.direccionFacturacionCodigoPostal, o.direccionFacturacionProvincia, o.direccionFacturacionPoblacion, o.direccionFacturacionDireccion, o.direccionEnvioPais, o.direccionEnvioCodigoPostal, o.direccionEnvioProvincia, o.direccionEnvioPoblacion, o.direccionEnvioDireccion) }
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
        val fechaTransformada = request.fecha?.let { parsearFecha(it) } ?: LocalDateTime.now()
        val subtotal = datos.lineas.sumOf { it.cantidad * it.precioUnitario }
        val descuentoTotal = datos.lineas.sumOf { (it.cantidad * it.precioUnitario) * (it.descuento / 100) }
        val baseAntesAgrupacion = subtotal - descuentoTotal
        val baseImponible = baseAntesAgrupacion * (1 - datos.descuentoAgrupacion / 100)
        val impuestosTotales = datos.lineas.sumOf { l -> val base = (l.cantidad * l.precioUnitario) * (1 - l.descuento / 100) * (1 - datos.descuentoAgrupacion / 100); base * (l.porcentajeIva + l.porcentajeRecargo) / 100 }
        val total = baseImponible + impuestosTotales

        val nuevoPedido = Pedido(
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

        val pedidoGuardado = pedidoRepository.save(nuevoPedido)

        datos.lineas.forEach { linea ->
            pedidoGuardado.lineas.add(PedidoLinea(
                pedido = pedidoGuardado,
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

        val pedidoFinal = pedidoRepository.save(pedidoGuardado)

        if (!request.esDuplicacion) {
            documentoTransformacionRepository.save(DocumentoTransformacion(
                tipoOrigen = request.tipoOrigen,
                idOrigen = request.idOrigen,
                numeroOrigen = null,
                tipoDestino = "PEDIDO",
                idDestino = pedidoFinal.id,
                numeroDestino = pedidoFinal.numero,
                tipoTransformacion = "CONVERTIR",
                fechaTransformacion = LocalDateTime.now()
            ))
        }

        return ResponseEntity.ok(pedidoFinal)
    }

    @PostMapping("/duplicar")
    @Transactional
    fun duplicar(@RequestBody request: TransformarAlbaranRequest): ResponseEntity<Any> {
        val pedidoOrigen = pedidoRepository.findById(request.pedidoId ?: return ResponseEntity.badRequest().body(mapOf("error" to "ID de pedido requerido"))).orElse(null)
            ?: return ResponseEntity.badRequest().body(mapOf("error" to "Pedido no encontrado"))

        val numeracion = serieNumeracionService.generarYReservarNumero(DOCUMENTO_SERIE_TIPO, request.serieId)

        val fechaDesdePedidoOrigen = request.fecha?.let { parsearFecha(it) } ?: pedidoOrigen.fecha

        val nuevoPedido = Pedido(
            numero = numeracion.codigo,
            fecha = fechaDesdePedidoOrigen,
            cliente = pedidoOrigen.cliente,
            observaciones = pedidoOrigen.observaciones ?: "",
            estado = request.estado ?: "Pendiente",
            subtotal = pedidoOrigen.subtotal,
            descuentoTotal = pedidoOrigen.descuentoTotal,
            total = pedidoOrigen.total,
            serie = numeracion.serie,
            anioDocumento = numeracion.anio,
            numeroSecuencial = numeracion.secuencial,
            codigoDocumento = numeracion.codigo,
            almacen = pedidoOrigen.almacen,
            tarifa = pedidoOrigen.tarifa,
            ventaMultialmacen = pedidoOrigen.ventaMultialmacen,
            // Campos de dirección
            clienteNombreComercial = pedidoOrigen.clienteNombreComercial,
            clienteNombreFiscal = pedidoOrigen.clienteNombreFiscal,
            clienteNifCif = pedidoOrigen.clienteNifCif,
            clienteEmail = pedidoOrigen.clienteEmail,
            clienteTelefono = pedidoOrigen.clienteTelefono,
            direccionFacturacionPais = pedidoOrigen.direccionFacturacionPais,
            direccionFacturacionCodigoPostal = pedidoOrigen.direccionFacturacionCodigoPostal,
            direccionFacturacionProvincia = pedidoOrigen.direccionFacturacionProvincia,
            direccionFacturacionPoblacion = pedidoOrigen.direccionFacturacionPoblacion,
            direccionFacturacionDireccion = pedidoOrigen.direccionFacturacionDireccion,
            direccionEnvioPais = pedidoOrigen.direccionEnvioPais,
            direccionEnvioCodigoPostal = pedidoOrigen.direccionEnvioCodigoPostal,
            direccionEnvioProvincia = pedidoOrigen.direccionEnvioProvincia,
            direccionEnvioPoblacion = pedidoOrigen.direccionEnvioPoblacion,
            direccionEnvioDireccion = pedidoOrigen.direccionEnvioDireccion
        )

        val pedidoGuardado = pedidoRepository.save(nuevoPedido)

        pedidoOrigen.lineas.forEach { lineaOrigen ->
            val lineaPedido = PedidoLinea(
                pedido = pedidoGuardado,
                producto = lineaOrigen.producto,
                nombreProducto = lineaOrigen.nombreProducto,
                referencia = lineaOrigen.referencia,
                cantidad = lineaOrigen.cantidad,
                precioUnitario = lineaOrigen.precioUnitario,
                descuento = lineaOrigen.descuento,
                observaciones = lineaOrigen.observaciones ?: "",
                tipoIva = lineaOrigen.tipoIva,
                porcentajeIva = lineaOrigen.porcentajeIva,
                porcentajeRecargo = lineaOrigen.porcentajeRecargo,
                importeIva = lineaOrigen.importeIva,
                importeRecargo = lineaOrigen.importeRecargo,
                almacen = lineaOrigen.almacen
            )
            pedidoGuardado.lineas.add(lineaPedido)
        }

        val pedidoFinal = pedidoRepository.save(pedidoGuardado)

        // Duplicar no registra transformación - se trata como documento nuevo/manual
        return ResponseEntity.ok(pedidoFinal)
    }

    // ========== ADJUNTOS ==========
    private fun cargarAdjuntos(pedido: Pedido): Pedido {
        pedido.adjuntos = obtenerAdjuntos(pedido.id)
        return pedido
    }

    private fun obtenerAdjuntos(pedidoId: Long): List<com.example.demo.model.ArchivoEmpresa> {
        return archivoEmpresaRepository.findByDocumentoOrigenAndDocumentoOrigenId("PEDIDO", pedidoId)
    }

    private fun actualizarAdjuntosPedido(pedidoId: Long, adjuntosIds: List<Long>) {
        // Primero, desvincular todos los adjuntos existentes de este pedido
        val adjuntosExistentes = archivoEmpresaRepository.findByDocumentoOrigenAndDocumentoOrigenId("PEDIDO", pedidoId)
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
                    documentoOrigen = "PEDIDO",
                    documentoOrigenId = pedidoId
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
            actualizarAdjuntosPedido(id, adjuntosIds)
            ResponseEntity.ok(mapOf("mensaje" to "Adjuntos actualizados correctamente"))
        } catch (e: Exception) {
            ResponseEntity.status(500).body(mapOf("error" to "Error al actualizar adjuntos: ${e.message}"))
        }
    }
}
