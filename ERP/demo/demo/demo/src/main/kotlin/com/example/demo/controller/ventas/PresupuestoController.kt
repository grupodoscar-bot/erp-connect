package com.example.demo.controller.ventas

import com.example.demo.model.Direccion
import com.example.demo.model.ventas.Presupuesto
import com.example.demo.model.ventas.PresupuestoLinea
import com.example.demo.model.ventas.Pedido
import com.example.demo.model.ventas.PedidoLinea
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
import com.example.demo.repository.ventas.PresupuestoRepository
import com.example.demo.repository.ventas.PedidoRepository
import com.example.demo.repository.ventas.FacturaProformaRepository
import com.example.demo.repository.ventas.FacturaRectificativaRepository
import com.example.demo.repository.compras.AlbaranCompraRepository
import com.example.demo.repository.compras.FacturaCompraRepository
import com.example.demo.repository.compras.PedidoCompraRepository
import com.example.demo.repository.compras.PresupuestoCompraRepository
import com.example.demo.service.ImpuestoService
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
@RequestMapping("/presupuestos")
@CrossOrigin(origins = ["http://145.223.103.219:3000"])
class PresupuestoController(
    private val presupuestoRepository: PresupuestoRepository,
    private val pedidoRepository: PedidoRepository,
    private val facturaProformaRepository: FacturaProformaRepository,
    private val facturaRectificativaRepository: FacturaRectificativaRepository,
    private val clienteRepository: ClienteRepository,
    private val productoRepository: ProductoRepository,
    private val tipoIvaRepository: TipoIvaRepository,
    private val direccionRepository: DireccionRepository,
    private val almacenRepository: AlmacenRepository,
    private val impuestoService: ImpuestoService,
    private val serieNumeracionService: SerieNumeracionService,
    private val tarifaService: TarifaService,
    private val albaranRepository: com.example.demo.repository.ventas.AlbaranRepository,
    private val facturaRepository: com.example.demo.repository.ventas.FacturaRepository,
    private val documentoTransformacionRepository: com.example.demo.repository.ventas.DocumentoTransformacionRepository,
    private val archivoEmpresaRepository: com.example.demo.repository.ArchivoEmpresaRepository,
    private val albaranCompraRepository: AlbaranCompraRepository,
    private val facturaCompraRepository: FacturaCompraRepository,
    private val pedidoCompraRepository: PedidoCompraRepository,
    private val presupuestoCompraRepository: PresupuestoCompraRepository
) {

    companion object {
        private const val DOCUMENTO_SERIE_TIPO = "PRESUPUESTO"
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
    fun listarTodos(): List<Presupuesto> = presupuestoRepository.findAll()

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
        val presupuestosPage: Page<Presupuesto> = presupuestoRepository.findAll(pageRequest)

        var presupuestosFiltrados = presupuestosPage.content.toList()

        if (!search.isNullOrBlank()) {
            presupuestosFiltrados = presupuestosFiltrados.filter { presupuesto ->
                presupuesto.numero.contains(search, ignoreCase = true) ||
                presupuesto.cliente?.nombreComercial?.contains(search, ignoreCase = true) == true ||
                presupuesto.cliente?.nombreFiscal?.contains(search, ignoreCase = true) == true
            }
        }

        if (!estado.isNullOrBlank()) {
            presupuestosFiltrados = presupuestosFiltrados.filter { it.estado == estado }
        }

        val response = mapOf<String, Any>(
            "content" to presupuestosFiltrados,
            "totalElements" to presupuestosPage.totalElements,
            "totalPages" to presupuestosPage.totalPages,
            "currentPage" to presupuestosPage.number,
            "pageSize" to presupuestosPage.size,
            "hasNext" to presupuestosPage.hasNext(),
            "hasPrevious" to presupuestosPage.hasPrevious()
        )

        return ResponseEntity.ok(response)
    }

    @GetMapping("/{id}")
    fun obtenerPorId(@PathVariable id: Long): ResponseEntity<Presupuesto> =
        presupuestoRepository.findById(id)
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
    @Transactional
    fun crear(@RequestBody request: PresupuestoRequest): ResponseEntity<Presupuesto> {
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

        val numeracion = serieNumeracionService.generarYReservarNumero(DOCUMENTO_SERIE_TIPO, request.serieId)

        val lineasCalculadas = calcularLineas(request.lineas, cliente, request.descuentoAgrupacion)
        val totales = calcularTotales(lineasCalculadas, request.descuentoAgrupacion)

        val fechaPresupuesto = request.fecha?.let { parsearFecha(it) } ?: LocalDateTime.now()

        val nuevoPresupuesto = Presupuesto(
            numero = numeracion.codigo,
            fecha = fechaPresupuesto,
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

        val presupuestoGuardado = presupuestoRepository.save(nuevoPresupuesto)

        lineasCalculadas.forEach { lineaCalc ->
            val almacenLinea = lineaCalc.almacenId?.let { almacenRepository.findById(it).orElse(null) }
            val linea = PresupuestoLinea(
                presupuesto = presupuestoGuardado,
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
            presupuestoGuardado.lineas.add(linea)
        }

        return ResponseEntity.ok(presupuestoRepository.save(presupuestoGuardado))
    }

    @PutMapping("/{id}")
    @Transactional
    fun actualizar(
        @PathVariable id: Long,
        @RequestBody request: PresupuestoRequest
    ): ResponseEntity<Presupuesto> {
        return presupuestoRepository.findById(id)
            .map { existente ->
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

                val lineasCalculadas = calcularLineas(request.lineas, cliente, request.descuentoAgrupacion)
                val totales = calcularTotales(lineasCalculadas, request.descuentoAgrupacion)

                existente.lineas.clear()

                val fechaActualizada = request.fecha?.let { parsearFecha(it) } ?: existente.fecha

                val actualizado = existente.copy(
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

                val guardado = presupuestoRepository.save(actualizado)

                lineasCalculadas.forEach { lineaCalc ->
                    val almacenLinea = lineaCalc.almacenId?.let { almacenRepository.findById(it).orElse(null) }
                    val linea = PresupuestoLinea(
                        presupuesto = guardado,
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

                ResponseEntity.ok(presupuestoRepository.save(guardado))
            }
            .orElse(ResponseEntity.notFound().build())
    }

    @DeleteMapping("/{id}")
    @Transactional
    fun eliminar(@PathVariable id: Long): ResponseEntity<Void> {
        return if (presupuestoRepository.existsById(id)) {
            presupuestoRepository.deleteById(id)
            ResponseEntity.noContent().build()
        } else {
            ResponseEntity.notFound().build()
        }
    }

    @PostMapping("/{id}/duplicar")
    @Transactional
    fun duplicar(@PathVariable id: Long): ResponseEntity<Presupuesto> {
        val original = presupuestoRepository.findByIdWithLineas(id)
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

        val guardado = presupuestoRepository.save(duplicado)

        original.lineas.forEach { lineaOriginal ->
            val nuevaLinea = PresupuestoLinea(
                presupuesto = guardado,
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

        return ResponseEntity.ok(presupuestoRepository.save(guardado))
    }

    @PostMapping("/{id}/convertir-a-pedido")
    @Transactional
    fun convertirAPedido(@PathVariable id: Long): ResponseEntity<Pedido> {
        val presupuesto = presupuestoRepository.findByIdWithLineas(id)
            ?: return ResponseEntity.notFound().build()

        val numeracionPedido = serieNumeracionService.generarYReservarNumero("PEDIDO", null)

        val pedido = Pedido(
            numero = numeracionPedido.codigo,
            fecha = LocalDateTime.now(),
            cliente = presupuesto.cliente,
            presupuesto = presupuesto,
            observaciones = presupuesto.observaciones,
            notas = presupuesto.notas,
            estado = "Pendiente",
            subtotal = presupuesto.subtotal,
            descuentoTotal = presupuesto.descuentoTotal,
            total = presupuesto.total,
            descuentoAgrupacion = presupuesto.descuentoAgrupacion,
            almacen = presupuesto.almacen,
            ventaMultialmacen = presupuesto.ventaMultialmacen,
            tarifa = presupuesto.tarifa,
            serie = numeracionPedido.serie,
            anioDocumento = numeracionPedido.anio,
            numeroSecuencial = numeracionPedido.secuencial,
            codigoDocumento = numeracionPedido.codigo,
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

        val pedidoGuardado = pedidoRepository.save(pedido)

        presupuesto.lineas.forEach { lineaPresupuesto ->
            val lineaPedido = PedidoLinea(
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
            pedidoGuardado.lineas.add(lineaPedido)
        }

        return ResponseEntity.ok(pedidoRepository.save(pedidoGuardado))
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
        lineas: List<PresupuestoLineaRequest>,
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

        val nuevoPresupuesto = Presupuesto(
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

        val presupuestoGuardado = presupuestoRepository.save(nuevoPresupuesto)

        lineasCalculadas.forEach { linea ->
            val almacen = linea.almacenId?.let { almacenRepository.findById(it).orElse(null) }
            val lineaPresupuesto = PresupuestoLinea(
                presupuesto = presupuestoGuardado,
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
            presupuestoGuardado.lineas.add(lineaPresupuesto)
        }

        val presupuestoFinal = presupuestoRepository.save(presupuestoGuardado)

        // Registrar transformación
        val transformacion = com.example.demo.model.ventas.DocumentoTransformacion(
            tipoOrigen = "ALBARAN",
            idOrigen = albaran.id,
            numeroOrigen = albaran.numero,
            tipoDestino = "PRESUPUESTO",
            idDestino = presupuestoFinal.id,
            numeroDestino = presupuestoFinal.numero,
            tipoTransformacion = "CONVERTIR",
            fechaTransformacion = java.time.LocalDateTime.now()
        )
        documentoTransformacionRepository.save(transformacion)

        return ResponseEntity.ok(presupuestoFinal)
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

        val nuevoPresupuesto = Presupuesto(
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

        val presupuestoGuardado = presupuestoRepository.save(nuevoPresupuesto)

        lineasCalculadas.forEach { linea ->
            val almacen = linea.almacenId?.let { almacenRepository.findById(it).orElse(null) }
            val lineaPresupuesto = PresupuestoLinea(
                presupuesto = presupuestoGuardado,
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
            presupuestoGuardado.lineas.add(lineaPresupuesto)
        }

        val presupuestoFinal = presupuestoRepository.save(presupuestoGuardado)

        val transformacion = com.example.demo.model.ventas.DocumentoTransformacion(
            tipoOrigen = "FACTURA",
            idOrigen = factura.id,
            numeroOrigen = factura.numero,
            tipoDestino = "PRESUPUESTO",
            idDestino = presupuestoFinal.id,
            numeroDestino = presupuestoFinal.numero,
            tipoTransformacion = "CONVERTIR",
            fechaTransformacion = java.time.LocalDateTime.now()
        )
        documentoTransformacionRepository.save(transformacion)

        return ResponseEntity.ok(presupuestoFinal)
    }

    @PostMapping("/desde-pedido")
    @Transactional
    fun crearDesdePedido(@RequestBody request: TransformarAlbaranRequest): ResponseEntity<Any> {
        val pedido = pedidoRepository.findById(request.pedidoId ?: return ResponseEntity.badRequest().body(mapOf("error" to "ID de pedido requerido"))).orElse(null)
            ?: return ResponseEntity.badRequest().body(mapOf("error" to "Pedido no encontrado"))

        val numeracion = serieNumeracionService.generarYReservarNumero(
            "PRESUPUESTO",
            request.serieId
        )

        val fechaDesdePedido = request.fecha?.let { parsearFecha(it) } ?: pedido.fecha

        val presupuesto = Presupuesto(
            numero = numeracion.codigo,
            serie = numeracion.serie,
            fecha = fechaDesdePedido,
            estado = request.estado ?: "Pendiente",
            cliente = pedido.cliente,
            subtotal = pedido.subtotal,
            descuentoTotal = pedido.descuentoTotal,
            total = pedido.total,
            observaciones = pedido.observaciones,
            descuentoAgrupacion = request.descuentoAgrupacion ?: pedido.descuentoAgrupacion
        )

        val presupuestoGuardado = presupuestoRepository.save(presupuesto)

        val lineasPresupuesto = pedido.lineas.map { lineaPedido ->
            PresupuestoLinea(
                presupuesto = presupuestoGuardado,
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
        }

        presupuestoRepository.save(presupuestoGuardado.copy(lineas = lineasPresupuesto.toMutableList()))

        val presupuestoFinal = presupuestoRepository.findById(presupuestoGuardado.id).get()

        val transformacion = DocumentoTransformacion(
            tipoOrigen = "PEDIDO",
            idOrigen = pedido.id,
            numeroOrigen = pedido.numero,
            tipoDestino = "PRESUPUESTO",
            idDestino = presupuestoFinal.id,
            numeroDestino = presupuestoFinal.numero,
            tipoTransformacion = "CONVERTIR",
            fechaTransformacion = LocalDateTime.now()
        )
        documentoTransformacionRepository.save(transformacion)

        return ResponseEntity.ok(presupuestoFinal)
    }

    @PostMapping("/desde-factura-proforma")
    @Transactional
    fun crearDesdeFacturaProforma(@RequestBody request: TransformarAlbaranRequest): ResponseEntity<Any> {
        val facturaProforma = facturaProformaRepository.findById(request.facturaProformaId ?: return ResponseEntity.badRequest().body(mapOf("error" to "ID de factura proforma requerido"))).orElse(null)
            ?: return ResponseEntity.badRequest().body(mapOf("error" to "Factura Proforma no encontrada"))

        val numeracion = serieNumeracionService.generarYReservarNumero(
            "PRESUPUESTO",
            request.serieId
        )

        val fechaDesdeFacturaProforma = request.fecha?.let { parsearFecha(it) } ?: facturaProforma.fecha

        val presupuesto = Presupuesto(
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

        val presupuestoGuardado = presupuestoRepository.save(presupuesto)

        val lineasPresupuesto = facturaProforma.lineas.map { lineaProforma ->
            PresupuestoLinea(
                presupuesto = presupuestoGuardado,
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

        presupuestoRepository.save(presupuestoGuardado.copy(lineas = lineasPresupuesto.toMutableList()))

        val presupuestoFinal = presupuestoRepository.findById(presupuestoGuardado.id).get()

        val transformacion = DocumentoTransformacion(
            tipoOrigen = "FACTURA_PROFORMA",
            idOrigen = facturaProforma.id,
            numeroOrigen = facturaProforma.numero,
            tipoDestino = "PRESUPUESTO",
            idDestino = presupuestoFinal.id,
            numeroDestino = presupuestoFinal.numero,
            tipoTransformacion = "CONVERTIR",
            fechaTransformacion = LocalDateTime.now()
        )
        documentoTransformacionRepository.save(transformacion)

        return ResponseEntity.ok(presupuestoFinal)
    }

    @PostMapping("/desde-factura-rectificativa")
    @Transactional
    fun crearDesdeFacturaRectificativa(@RequestBody request: TransformarAlbaranRequest): ResponseEntity<Any> {
        val facturaRectificativa = facturaRectificativaRepository.findById(request.facturaRectificativaId ?: return ResponseEntity.badRequest().body(mapOf("error" to "ID de factura rectificativa requerido"))).orElse(null)
            ?: return ResponseEntity.badRequest().body(mapOf("error" to "Factura Rectificativa no encontrada"))

        val numeracion = serieNumeracionService.generarYReservarNumero(
            "PRESUPUESTO",
            request.serieId
        )

        val fechaDesdeFacturaRectificativa = request.fecha?.let { parsearFecha(it) } ?: facturaRectificativa.fecha

        val presupuesto = Presupuesto(
            numero = numeracion.codigo,
            serie = numeracion.serie,
            fecha = fechaDesdeFacturaRectificativa,
            estado = request.estado ?: "Pendiente",
            cliente = facturaRectificativa.cliente,
            subtotal = facturaRectificativa.subtotal,
            descuentoTotal = facturaRectificativa.descuentoTotal,
            total = facturaRectificativa.total,
            observaciones = facturaRectificativa.observaciones,
            descuentoAgrupacion = request.descuentoAgrupacion ?: facturaRectificativa.descuentoAgrupacion
        )

        val presupuestoGuardado = presupuestoRepository.save(presupuesto)

        val lineasPresupuesto = facturaRectificativa.lineas.map { lineaRectificativa ->
            PresupuestoLinea(
                presupuesto = presupuestoGuardado,
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

        presupuestoRepository.save(presupuestoGuardado.copy(lineas = lineasPresupuesto.toMutableList()))

        val presupuestoFinal = presupuestoRepository.findById(presupuestoGuardado.id).get()

        val transformacion = DocumentoTransformacion(
            tipoOrigen = "FACTURA_RECTIFICATIVA",
            idOrigen = facturaRectificativa.id,
            numeroOrigen = facturaRectificativa.numero,
            tipoDestino = "PRESUPUESTO",
            idDestino = presupuestoFinal.id,
            numeroDestino = presupuestoFinal.numero,
            tipoTransformacion = "CONVERTIR",
            fechaTransformacion = LocalDateTime.now()
        )
        documentoTransformacionRepository.save(transformacion)

        return ResponseEntity.ok(presupuestoFinal)
    }

    @PostMapping("/transformar")
    @Transactional
    fun transformarDocumento(@RequestBody request: TransformarDocumentoRequest): ResponseEntity<Any> {
        data class LineaOrigen(
            val producto: com.example.demo.model.Producto?,
            val nombreProducto: String,
            val referencia: String?,
            val cantidad: Double,
            val precioUnitario: Double,
            val descuento: Double,
            val observaciones: String?,
            val tipoIva: com.example.demo.model.TipoIva?,
            val porcentajeIva: Double,
            val porcentajeRecargo: Double,
            val importeIva: Double,
            val importeRecargo: Double,
            val almacen: com.example.demo.model.Almacen?
        )
        data class DatosOrigen(
            val cliente: com.example.demo.model.Cliente?,
            val lineas: List<LineaOrigen>,
            val descuentoAgrupacion: Double,
            val almacen: com.example.demo.model.Almacen?,
            val tarifa: com.example.demo.model.Tarifa?,
            val ventaMultialmacen: Boolean,
            val observaciones: String?,
            val notas: String?,
            val clienteNombreComercial: String?,
            val clienteNombreFiscal: String?,
            val clienteNifCif: String?,
            val clienteEmail: String?,
            val clienteTelefono: String?,
            val direccionFacturacionPais: String?,
            val direccionFacturacionCodigoPostal: String?,
            val direccionFacturacionProvincia: String?,
            val direccionFacturacionPoblacion: String?,
            val direccionFacturacionDireccion: String?,
            val direccionEnvioPais: String?,
            val direccionEnvioCodigoPostal: String?,
            val direccionEnvioProvincia: String?,
            val direccionEnvioPoblacion: String?,
            val direccionEnvioDireccion: String?
        )

        val datos: DatosOrigen = when (request.tipoOrigen) {
            "PRESUPUESTO" -> {
                val o = presupuestoRepository.findById(request.idOrigen).orElse(null)
                    ?: return ResponseEntity.badRequest().body(mapOf("error" to "Presupuesto no encontrado"))
                DatosOrigen(o.cliente, o.lineas.map { LineaOrigen(it.producto, it.nombreProducto, it.referencia, it.cantidad.toDouble(), it.precioUnitario, it.descuento, it.observaciones, it.tipoIva, it.porcentajeIva, it.porcentajeRecargo, it.importeIva, it.importeRecargo, it.almacen) }, o.descuentoAgrupacion, o.almacen, o.tarifa, o.ventaMultialmacen, o.observaciones, o.notas, o.clienteNombreComercial, o.clienteNombreFiscal, o.clienteNifCif, o.clienteEmail, o.clienteTelefono, o.direccionFacturacionPais, o.direccionFacturacionCodigoPostal, o.direccionFacturacionProvincia, o.direccionFacturacionPoblacion, o.direccionFacturacionDireccion, o.direccionEnvioPais, o.direccionEnvioCodigoPostal, o.direccionEnvioProvincia, o.direccionEnvioPoblacion, o.direccionEnvioDireccion)
            }
            "PEDIDO" -> {
                val o = pedidoRepository.findById(request.idOrigen).orElse(null)
                    ?: return ResponseEntity.badRequest().body(mapOf("error" to "Pedido no encontrado"))
                DatosOrigen(o.cliente, o.lineas.map { LineaOrigen(it.producto, it.nombreProducto, it.referencia, it.cantidad.toDouble(), it.precioUnitario, it.descuento, it.observaciones, it.tipoIva, it.porcentajeIva, it.porcentajeRecargo, it.importeIva, it.importeRecargo, it.almacen) }, o.descuentoAgrupacion, o.almacen, o.tarifa, o.ventaMultialmacen, o.observaciones, o.notas, o.clienteNombreComercial, o.clienteNombreFiscal, o.clienteNifCif, o.clienteEmail, o.clienteTelefono, o.direccionFacturacionPais, o.direccionFacturacionCodigoPostal, o.direccionFacturacionProvincia, o.direccionFacturacionPoblacion, o.direccionFacturacionDireccion, o.direccionEnvioPais, o.direccionEnvioCodigoPostal, o.direccionEnvioProvincia, o.direccionEnvioPoblacion, o.direccionEnvioDireccion)
            }
            "ALBARAN" -> {
                val o = albaranRepository.findById(request.idOrigen).orElse(null)
                    ?: return ResponseEntity.badRequest().body(mapOf("error" to "Albarán no encontrado"))
                DatosOrigen(o.cliente, o.lineas.map { LineaOrigen(it.producto, it.nombreProducto, it.referencia, it.cantidad.toDouble(), it.precioUnitario, it.descuento, it.observaciones, it.tipoIva, it.porcentajeIva, it.porcentajeRecargo, it.importeIva, it.importeRecargo, it.almacen) }, o.descuentoAgrupacion, o.almacen, o.tarifa, o.ventaMultialmacen, o.observaciones, o.notas, o.clienteNombreComercial, o.clienteNombreFiscal, o.clienteNifCif, o.clienteEmail, o.clienteTelefono, o.direccionFacturacionPais, o.direccionFacturacionCodigoPostal, o.direccionFacturacionProvincia, o.direccionFacturacionPoblacion, o.direccionFacturacionDireccion, o.direccionEnvioPais, o.direccionEnvioCodigoPostal, o.direccionEnvioProvincia, o.direccionEnvioPoblacion, o.direccionEnvioDireccion)
            }
            "FACTURA" -> {
                val o = facturaRepository.findById(request.idOrigen).orElse(null)
                    ?: return ResponseEntity.badRequest().body(mapOf("error" to "Factura no encontrada"))
                DatosOrigen(o.cliente, o.lineas.map { LineaOrigen(it.producto, it.nombreProducto, it.referencia, it.cantidad.toDouble(), it.precioUnitario, it.descuento, it.observaciones, it.tipoIva, it.porcentajeIva, it.porcentajeRecargo, it.importeIva, it.importeRecargo, it.almacen) }, o.descuentoAgrupacion, o.almacen, o.tarifa, o.ventaMultialmacen ?: false, o.observaciones, o.notas, o.clienteNombreComercial, o.clienteNombreFiscal, o.clienteNifCif, o.clienteEmail, o.clienteTelefono, o.direccionFacturacionPais, o.direccionFacturacionCodigoPostal, o.direccionFacturacionProvincia, o.direccionFacturacionPoblacion, o.direccionFacturacionDireccion, o.direccionEnvioPais, o.direccionEnvioCodigoPostal, o.direccionEnvioProvincia, o.direccionEnvioPoblacion, o.direccionEnvioDireccion)
            }
            "FACTURA_PROFORMA" -> {
                val o = facturaProformaRepository.findById(request.idOrigen).orElse(null)
                    ?: return ResponseEntity.badRequest().body(mapOf("error" to "Factura proforma no encontrada"))
                DatosOrigen(o.cliente, o.lineas.map { LineaOrigen(it.producto, it.nombreProducto, it.referencia, it.cantidad.toDouble(), it.precioUnitario, it.descuento, it.observaciones, it.tipoIva, it.porcentajeIva, it.porcentajeRecargo, it.importeIva, it.importeRecargo, it.almacen) }, o.descuentoAgrupacion, o.almacen, o.tarifa, o.ventaMultialmacen, o.observaciones, o.notas, o.clienteNombreComercial, o.clienteNombreFiscal, o.clienteNifCif, o.clienteEmail, o.clienteTelefono, o.direccionFacturacionPais, o.direccionFacturacionCodigoPostal, o.direccionFacturacionProvincia, o.direccionFacturacionPoblacion, o.direccionFacturacionDireccion, o.direccionEnvioPais, o.direccionEnvioCodigoPostal, o.direccionEnvioProvincia, o.direccionEnvioPoblacion, o.direccionEnvioDireccion)
            }
            "FACTURA_RECTIFICATIVA" -> {
                val o = facturaRectificativaRepository.findById(request.idOrigen).orElse(null)
                    ?: return ResponseEntity.badRequest().body(mapOf("error" to "Factura rectificativa no encontrada"))
                DatosOrigen(o.cliente, o.lineas.map { LineaOrigen(it.producto, it.nombreProducto, it.referencia, it.cantidad.toDouble(), it.precioUnitario, it.descuento, it.observaciones, it.tipoIva, it.porcentajeIva, it.porcentajeRecargo, it.importeIva, it.importeRecargo, it.almacen) }, o.descuentoAgrupacion ?: 0.0, o.almacen, null, false, o.observaciones, o.notas, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null)
            }
            // Compra origins - require clienteId
            "PRESUPUESTO_COMPRA" -> {
                val o = presupuestoCompraRepository.findById(request.idOrigen).orElse(null)
                    ?: return ResponseEntity.badRequest().body(mapOf("error" to "Presupuesto de compra no encontrado"))
                val cliente = request.clienteId?.let { clienteRepository.findById(it).orElse(null) }
                DatosOrigen(cliente, o.lineas.map { LineaOrigen(it.producto, it.nombreProducto, it.referencia, it.cantidad.toDouble(), it.precioUnitario, it.descuento, it.observaciones, it.tipoIva, it.porcentajeIva, it.porcentajeRecargo, it.importeIva, it.importeRecargo, it.almacen) }, o.descuentoAgrupacion, o.almacen, o.tarifa, o.compraMultialmacen ?: false, o.observaciones, o.notas, cliente?.nombreComercial, cliente?.nombreFiscal, cliente?.nifCif, cliente?.email, cliente?.telefonoFijo ?: cliente?.telefonoMovil, null, null, null, null, null, null, null, null, null, null)
            }
            "PEDIDO_COMPRA" -> {
                val o = pedidoCompraRepository.findById(request.idOrigen).orElse(null)
                    ?: return ResponseEntity.badRequest().body(mapOf("error" to "Pedido de compra no encontrado"))
                val cliente = request.clienteId?.let { clienteRepository.findById(it).orElse(null) }
                DatosOrigen(cliente, o.lineas.map { LineaOrigen(it.producto, it.nombreProducto, it.referencia, it.cantidad.toDouble(), it.precioUnitario, it.descuento, it.observaciones, it.tipoIva, it.porcentajeIva, it.porcentajeRecargo, it.importeIva, it.importeRecargo, it.almacen) }, o.descuentoAgrupacion, o.almacen, o.tarifa, o.compraMultialmacen ?: false, o.observaciones, o.notas, cliente?.nombreComercial, cliente?.nombreFiscal, cliente?.nifCif, cliente?.email, cliente?.telefonoFijo ?: cliente?.telefonoMovil, null, null, null, null, null, null, null, null, null, null)
            }
            "ALBARAN_COMPRA" -> {
                val o = albaranCompraRepository.findById(request.idOrigen).orElse(null)
                    ?: return ResponseEntity.badRequest().body(mapOf("error" to "Albarán de compra no encontrado"))
                val cliente = request.clienteId?.let { clienteRepository.findById(it).orElse(null) }
                DatosOrigen(cliente, o.lineas.map { LineaOrigen(it.producto, it.nombreProducto, it.referencia, it.cantidad.toDouble(), it.precioUnitario, it.descuento, it.observaciones, it.tipoIva, it.porcentajeIva, it.porcentajeRecargo, it.importeIva, it.importeRecargo, it.almacen) }, o.descuentoAgrupacion, o.almacen, o.tarifa, o.compraMultialmacen, o.observaciones, o.notas, cliente?.nombreComercial, cliente?.nombreFiscal, cliente?.nifCif, cliente?.email, cliente?.telefonoFijo ?: cliente?.telefonoMovil, null, null, null, null, null, null, null, null, null, null)
            }
            "FACTURA_COMPRA" -> {
                val o = facturaCompraRepository.findById(request.idOrigen).orElse(null)
                    ?: return ResponseEntity.badRequest().body(mapOf("error" to "Factura de compra no encontrada"))
                val cliente = request.clienteId?.let { clienteRepository.findById(it).orElse(null) }
                DatosOrigen(cliente, o.lineas.map { LineaOrigen(it.producto, it.nombreProducto, it.referencia, it.cantidad.toDouble(), it.precioUnitario, it.descuento, it.observaciones, it.tipoIva, it.porcentajeIva, it.porcentajeRecargo, it.importeIva, it.importeRecargo, it.almacen) }, o.descuentoAgrupacion, o.almacen, o.tarifa, o.compraMultialmacen, o.observaciones, o.notas, cliente?.nombreComercial, cliente?.nombreFiscal, cliente?.nifCif, cliente?.email, cliente?.telefonoFijo ?: cliente?.telefonoMovil, null, null, null, null, null, null, null, null, null, null)
            }
            else -> return ResponseEntity.badRequest().body(mapOf("error" to "Tipo de origen no soportado: ${request.tipoOrigen}"))
        }

        val numeracion = serieNumeracionService.generarYReservarNumero(DOCUMENTO_SERIE_TIPO, request.serieId)
        val fechaTransformada = request.fecha?.let { parsearFecha(it) } ?: LocalDateTime.now()

        val subtotal = datos.lineas.sumOf { it.cantidad * it.precioUnitario }
        val descuentoTotal = datos.lineas.sumOf { (it.cantidad * it.precioUnitario) * (it.descuento / 100) }
        val baseAntesAgrupacion = subtotal - descuentoTotal
        val baseImponible = baseAntesAgrupacion * (1 - datos.descuentoAgrupacion / 100)
        val impuestosTotales = datos.lineas.sumOf { l ->
            val base = (l.cantidad * l.precioUnitario) * (1 - l.descuento / 100) * (1 - datos.descuentoAgrupacion / 100)
            base * (l.porcentajeIva + l.porcentajeRecargo) / 100
        }
        val total = baseImponible + impuestosTotales

        val nuevoPresupuesto = Presupuesto(
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

        val presupuestoGuardado = presupuestoRepository.save(nuevoPresupuesto)

        datos.lineas.forEach { linea ->
            val nuevaLinea = PresupuestoLinea(
                presupuesto = presupuestoGuardado,
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
            )
            presupuestoGuardado.lineas.add(nuevaLinea)
        }

        val presupuestoFinal = presupuestoRepository.save(presupuestoGuardado)

        if (!request.esDuplicacion) {
            val transformacion = DocumentoTransformacion(
                tipoOrigen = request.tipoOrigen,
                idOrigen = request.idOrigen,
                numeroOrigen = null,
                tipoDestino = "PRESUPUESTO",
                idDestino = presupuestoFinal.id,
                numeroDestino = presupuestoFinal.numero,
                tipoTransformacion = "CONVERTIR",
                fechaTransformacion = LocalDateTime.now()
            )
            documentoTransformacionRepository.save(transformacion)
        }

        return ResponseEntity.ok(presupuestoFinal)
    }

    @PostMapping("/duplicar")
    @Transactional
    fun duplicar(@RequestBody request: TransformarAlbaranRequest): ResponseEntity<Any> {
        val presupuestoOrigen = presupuestoRepository.findById(request.presupuestoId ?: return ResponseEntity.badRequest().body(mapOf("error" to "ID de presupuesto requerido"))).orElse(null)
            ?: return ResponseEntity.badRequest().body(mapOf("error" to "Presupuesto no encontrado"))

        val numeracion = serieNumeracionService.generarYReservarNumero(DOCUMENTO_SERIE_TIPO, request.serieId)

        val fechaDesdePresupuestoOrigen = request.fecha?.let { parsearFecha(it) } ?: presupuestoOrigen.fecha

        val nuevoPresupuesto = Presupuesto(
            numero = numeracion.codigo,
            fecha = fechaDesdePresupuestoOrigen,
            cliente = presupuestoOrigen.cliente,
            observaciones = presupuestoOrigen.observaciones ?: "",
            estado = request.estado ?: "Pendiente",
            subtotal = presupuestoOrigen.subtotal,
            descuentoTotal = presupuestoOrigen.descuentoTotal,
            total = presupuestoOrigen.total,
            serie = numeracion.serie,
            anioDocumento = numeracion.anio,
            numeroSecuencial = numeracion.secuencial,
            codigoDocumento = numeracion.codigo,
            almacen = presupuestoOrigen.almacen,
            tarifa = presupuestoOrigen.tarifa,
            ventaMultialmacen = presupuestoOrigen.ventaMultialmacen,
            // Campos de dirección
            clienteNombreComercial = presupuestoOrigen.clienteNombreComercial,
            clienteNombreFiscal = presupuestoOrigen.clienteNombreFiscal,
            clienteNifCif = presupuestoOrigen.clienteNifCif,
            clienteEmail = presupuestoOrigen.clienteEmail,
            clienteTelefono = presupuestoOrigen.clienteTelefono,
            direccionFacturacionPais = presupuestoOrigen.direccionFacturacionPais,
            direccionFacturacionCodigoPostal = presupuestoOrigen.direccionFacturacionCodigoPostal,
            direccionFacturacionProvincia = presupuestoOrigen.direccionFacturacionProvincia,
            direccionFacturacionPoblacion = presupuestoOrigen.direccionFacturacionPoblacion,
            direccionFacturacionDireccion = presupuestoOrigen.direccionFacturacionDireccion,
            direccionEnvioPais = presupuestoOrigen.direccionEnvioPais,
            direccionEnvioCodigoPostal = presupuestoOrigen.direccionEnvioCodigoPostal,
            direccionEnvioProvincia = presupuestoOrigen.direccionEnvioProvincia,
            direccionEnvioPoblacion = presupuestoOrigen.direccionEnvioPoblacion,
            direccionEnvioDireccion = presupuestoOrigen.direccionEnvioDireccion
        )

        val presupuestoGuardado = presupuestoRepository.save(nuevoPresupuesto)

        presupuestoOrigen.lineas.forEach { lineaOrigen ->
            val lineaPresupuesto = PresupuestoLinea(
                presupuesto = presupuestoGuardado,
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
            presupuestoGuardado.lineas.add(lineaPresupuesto)
        }

        val presupuestoFinal = presupuestoRepository.save(presupuestoGuardado)

        // Duplicar no registra transformación - se trata como documento nuevo/manual
        return ResponseEntity.ok(presupuestoFinal)
    }

    // ========== ADJUNTOS ==========
    private fun cargarAdjuntos(presupuesto: Presupuesto): Presupuesto {
        presupuesto.adjuntos = obtenerAdjuntos(presupuesto.id)
        return presupuesto
    }

    private fun obtenerAdjuntos(presupuestoId: Long): List<com.example.demo.model.ArchivoEmpresa> {
        return archivoEmpresaRepository.findByDocumentoOrigenAndDocumentoOrigenId("PRESUPUESTO", presupuestoId)
    }

    private fun actualizarAdjuntosPresupuesto(presupuestoId: Long, adjuntosIds: List<Long>) {
        // Primero, desvincular todos los adjuntos existentes de este presupuesto
        val adjuntosExistentes = archivoEmpresaRepository.findByDocumentoOrigenAndDocumentoOrigenId("PRESUPUESTO", presupuestoId)
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
                    documentoOrigen = "PRESUPUESTO",
                    documentoOrigenId = presupuestoId
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
            actualizarAdjuntosPresupuesto(id, adjuntosIds)
            ResponseEntity.ok(mapOf("mensaje" to "Adjuntos actualizados correctamente"))
        } catch (e: Exception) {
            ResponseEntity.status(500).body(mapOf("error" to "Error al actualizar adjuntos: ${e.message}"))
        }
    }
}
