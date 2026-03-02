package com.example.demo.controller.ventas

import com.example.demo.model.Almacen
import com.example.demo.model.ArchivoEmpresa
import com.example.demo.model.Cliente
import com.example.demo.model.Direccion
import com.example.demo.model.SerieDocumento
import com.example.demo.model.ventas.Albaran
import com.example.demo.model.ventas.AlbaranLinea
import com.example.demo.model.ventas.Factura
import com.example.demo.model.ventas.FacturaLinea
import com.example.demo.model.ventas.FacturaProforma
import com.example.demo.model.ventas.Pedido
import com.example.demo.model.ventas.Presupuesto
import com.example.demo.repository.AlmacenRepository
import com.example.demo.repository.ArchivoEmpresaRepository
import com.example.demo.repository.ClienteRepository
import com.example.demo.repository.ConfiguracionVentasRepository
import com.example.demo.repository.compras.AlbaranCompraRepository
import com.example.demo.repository.compras.FacturaCompraRepository
import com.example.demo.repository.compras.PedidoCompraRepository
import com.example.demo.repository.compras.PresupuestoCompraRepository
import com.example.demo.repository.ProductoAlmacenRepository
import com.example.demo.repository.ProductoRepository
import com.example.demo.repository.TipoIvaRepository
import com.example.demo.repository.DireccionRepository
import com.example.demo.repository.ventas.AlbaranRepository
import com.example.demo.repository.ventas.FacturaProformaRepository
import com.example.demo.repository.ventas.FacturaRectificativaRepository
import com.example.demo.repository.ventas.FacturaRepository
import com.example.demo.repository.ventas.PedidoRepository
import com.example.demo.repository.ventas.PresupuestoRepository
import com.example.demo.service.AlbaranPdfService
import com.example.demo.service.EmailService
import com.example.demo.service.ImpuestoCalculo
import com.example.demo.service.ImpuestoService
import com.example.demo.service.LineaImpuesto
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

@RestController
@RequestMapping("/albaranes")
@CrossOrigin(origins = ["http://145.223.103.219:3000"])
class AlbaranController(
    private val albaranRepository: AlbaranRepository,
    private val facturaRepository: FacturaRepository,
    private val facturaProformaRepository: FacturaProformaRepository,
    private val facturaRectificativaRepository: FacturaRectificativaRepository,
    private val pedidoRepository: PedidoRepository,
    private val presupuestoRepository: PresupuestoRepository,
    private val clienteRepository: ClienteRepository,
    private val productoRepository: ProductoRepository,
    private val productoAlmacenRepository: ProductoAlmacenRepository,
    private val tipoIvaRepository: TipoIvaRepository,
    private val archivoEmpresaRepository: ArchivoEmpresaRepository,
    private val direccionRepository: DireccionRepository,
    private val almacenRepository: AlmacenRepository,
    private val albaranPdfService: AlbaranPdfService,
    private val emailService: EmailService,
    private val impuestoService: ImpuestoService,
    private val serieNumeracionService: SerieNumeracionService,
    private val stockService: StockService,
    private val tarifaService: TarifaService,
    private val documentoTransformacionRepository: com.example.demo.repository.ventas.DocumentoTransformacionRepository,
    private val configuracionVentasRepository: ConfiguracionVentasRepository,
    private val albaranCompraRepository: AlbaranCompraRepository,
    private val facturaCompraRepository: FacturaCompraRepository,
    private val pedidoCompraRepository: PedidoCompraRepository,
    private val presupuestoCompraRepository: PresupuestoCompraRepository
) {

    private fun normalizarCadena(valor: String?): String? =
        valor?.trim()?.takeIf { it.isNotEmpty() }

    private fun snapshot(valorRequest: String?, valorPorDefecto: String?): String? =
        normalizarCadena(valorRequest) ?: valorPorDefecto

    private fun parsearFecha(fechaStr: String?): java.time.LocalDateTime {
        if (fechaStr == null) return java.time.LocalDateTime.now()
        return try {
            java.time.LocalDateTime.parse(fechaStr)
        } catch (e: Exception) {
            try {
                java.time.LocalDate.parse(fechaStr).atTime(java.time.LocalTime.now())
            } catch (e2: Exception) {
                java.time.LocalDateTime.now()
            }
        }
    }

    companion object {
        private const val DOCUMENTO_SERIE_TIPO = "ALBARAN_VENTA"
    }

    @GetMapping
    fun listarTodos(): List<Albaran> =
        albaranRepository.findAll().map { cargarAdjuntos(it) }

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
        val albaranesPage: Page<Albaran> = albaranRepository.findAll(pageRequest)

        // Filtrar en memoria si hay criterios de búsqueda
        var albaranesFiltrados = albaranesPage.content.toList()

        
        if (!search.isNullOrBlank()) {
            albaranesFiltrados = albaranesFiltrados.filter { albaran ->
                albaran.numero.contains(search, ignoreCase = true) ||
                albaran.cliente?.nombreComercial?.contains(search, ignoreCase = true) == true ||
                albaran.cliente?.nombreFiscal?.contains(search, ignoreCase = true) == true
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
    fun obtenerPorId(@PathVariable id: Long): ResponseEntity<Albaran> =
        albaranRepository.findById(id)
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
    fun crear(@RequestBody request: AlbaranRequest): ResponseEntity<Albaran> {
        val cliente = request.clienteId?.let { clienteRepository.findById(it).orElse(null) }
        val factura = request.facturaId?.let { facturaRepository.findById(it).orElse(null) }
        val direccion = request.direccionId?.let { direccionRepository.findById(it).orElse(null) }
        val almacen = request.almacenId?.let { almacenRepository.findById(it).orElse(null) }
        
        // Obtener la tarifa a usar (si no se especifica, usar la tarifa por defecto)
        val tarifa = if (request.tarifaId != null) {
            tarifaService.obtenerTarifasDisponibles().find { it.id == request.tarifaId }
        } else {
            tarifaService.obtenerTarifaPorDefecto()
        }
        
        // Obtener direcciones del cliente para snapshot
        val direccionesCliente = if (cliente != null) {
            direccionRepository.findByTipoTerceroAndIdTercero(Direccion.TipoTercero.CLIENTE, cliente.id)
        } else emptyList()
        
        val direccionFacturacion = direccionesCliente.firstOrNull { it.tipoDireccion == Direccion.TipoDireccion.FACTURACION }
        val direccionEnvio = direccion ?: direccionesCliente.firstOrNull { it.tipoDireccion == Direccion.TipoDireccion.ENVIO }

        val direccionFacturacionPais = snapshot(request.direccionFacturacionPais, direccionFacturacion?.pais)
        val direccionFacturacionCodigoPostal = snapshot(request.direccionFacturacionCodigoPostal, direccionFacturacion?.codigoPostal)
        val direccionFacturacionProvincia = snapshot(request.direccionFacturacionProvincia, direccionFacturacion?.provincia)
        val direccionFacturacionPoblacion = snapshot(request.direccionFacturacionPoblacion, direccionFacturacion?.poblacion)
        val direccionFacturacionDireccion = snapshot(request.direccionFacturacionDireccion, direccionFacturacion?.direccion)

        val direccionEnvioPais = snapshot(request.direccionEnvioPais, direccionEnvio?.pais)
        val direccionEnvioCodigoPostal = snapshot(request.direccionEnvioCodigoPostal, direccionEnvio?.codigoPostal)
        val direccionEnvioProvincia = snapshot(request.direccionEnvioProvincia, direccionEnvio?.provincia)
        val direccionEnvioPoblacion = snapshot(request.direccionEnvioPoblacion, direccionEnvio?.poblacion)
        val direccionEnvioDireccion = snapshot(request.direccionEnvioDireccion, direccionEnvio?.direccion)

        val numeracion = prepararNumeracionParaNuevoAlbaran(request)
        val numeroAlbaran = numeracion.codigo
        
        // Usar los valores de IVA del request si el usuario los ha modificado
        val lineasCalculadas = request.lineas.map { calcularLineaConImpuestos(it, cliente, request.descuentoAgrupacion, usarValoresDelRequest = true, tarifa = tarifa) }

        val subtotal = lineasCalculadas.sumOf { it.request.cantidad * it.request.precioUnitario }
        val descuentoTotal = lineasCalculadas.sumOf {
            (it.request.cantidad * it.request.precioUnitario) * (it.request.descuento / 100)
        }
        val baseAntesAgrupacion = subtotal - descuentoTotal
        val descuentoAgrupacionImporte = baseAntesAgrupacion * (request.descuentoAgrupacion / 100)
        val baseImponible = baseAntesAgrupacion - descuentoAgrupacionImporte
        
        // Calcular IVA sobre la base imponible DESPUÉS del descuento de agrupación
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
        
        // Crear albarán con totales y snapshot de datos
        val fechaAlbaran = request.fecha?.let { parsearFecha(it) } ?: java.time.LocalDateTime.now()

        val nuevoAlbaran = Albaran(
            numero = numeroAlbaran,
            fecha = fechaAlbaran,
            cliente = cliente,
            factura = factura,
            observaciones = request.observaciones,
            notas = request.notas,
            estado = request.estado,
            subtotal = subtotal,
            descuentoTotal = descuentoTotal,
            total = total,
            descuentoAgrupacion = request.descuentoAgrupacion,
            direccion = direccion,
            almacen = almacen,
            ventaMultialmacen = request.ventaMultialmacen,
            tarifa = tarifa,
            serie = numeracion.serie,
            anioDocumento = numeracion.anio,
            numeroSecuencial = numeracion.secuencial,
            codigoDocumento = numeroAlbaran,
            // Snapshot de datos del cliente
            clienteNombreComercial = cliente?.nombreComercial,
            clienteNombreFiscal = cliente?.nombreFiscal,
            clienteNifCif = cliente?.nifCif,
            clienteEmail = cliente?.email,
            clienteTelefono = cliente?.telefonoFijo ?: cliente?.telefonoMovil,
            // Snapshot de dirección de facturación
            direccionFacturacionPais = direccionFacturacionPais,
            direccionFacturacionCodigoPostal = direccionFacturacionCodigoPostal,
            direccionFacturacionProvincia = direccionFacturacionProvincia,
            direccionFacturacionPoblacion = direccionFacturacionPoblacion,
            direccionFacturacionDireccion = direccionFacturacionDireccion,
            // Snapshot de dirección de envío
            direccionEnvioPais = direccionEnvioPais,
            direccionEnvioCodigoPostal = direccionEnvioCodigoPostal,
            direccionEnvioProvincia = direccionEnvioProvincia,
            direccionEnvioPoblacion = direccionEnvioPoblacion,
            direccionEnvioDireccion = direccionEnvioDireccion
        )
        
        // Guardar albarán
        val albaranGuardado = albaranRepository.save(nuevoAlbaran)

        // Asociar adjuntos existentes
        actualizarAdjuntosAlbaran(albaranGuardado.id, request.adjuntosIds)
        albaranGuardado.adjuntos = obtenerAdjuntos(albaranGuardado.id)
        
        // Crear y agregar líneas
        lineasCalculadas.forEach { (lineaReq, producto, impuestos) ->
            val almacenLinea = lineaReq.almacenId?.let { almacenRepository.findById(it).orElse(null) }
            val linea = AlbaranLinea(
                albaran = albaranGuardado,
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
        
        // Guardar con líneas
        return ResponseEntity.ok(albaranRepository.save(albaranGuardado))
    }

    @PutMapping("/{id}")
    @Transactional
    fun actualizar(
        @PathVariable id: Long,
        @RequestBody datos: AlbaranRequest
    ): ResponseEntity<Albaran> {
        return albaranRepository.findById(id)
            .map { existente ->
                val cliente = datos.clienteId?.let { clienteRepository.findById(it).orElse(null) }
                val factura = datos.facturaId?.let { facturaRepository.findById(it).orElse(null) }
                val direccion = datos.direccionId?.let { direccionRepository.findById(it).orElse(null) }
                val almacen = datos.almacenId?.let { almacenRepository.findById(it).orElse(null) }
                
                // Obtener la tarifa a usar (si no se especifica, usar la tarifa por defecto)
                val tarifa = if (datos.tarifaId != null) {
                    tarifaService.obtenerTarifasDisponibles().find { it.id == datos.tarifaId }
                } else {
                    tarifaService.obtenerTarifaPorDefecto()
                }
                
                // Obtener direcciones del cliente para snapshot
                val direccionesCliente = if (cliente != null) {
                    direccionRepository.findByTipoTerceroAndIdTercero(Direccion.TipoTercero.CLIENTE, cliente.id)
                } else emptyList()
                
                val direccionFacturacion = direccionesCliente.firstOrNull { it.tipoDireccion == Direccion.TipoDireccion.FACTURACION }
                val direccionEnvio = direccion ?: direccionesCliente.firstOrNull { it.tipoDireccion == Direccion.TipoDireccion.ENVIO }

                val direccionFacturacionPais = snapshot(datos.direccionFacturacionPais, direccionFacturacion?.pais)
                val direccionFacturacionCodigoPostal = snapshot(datos.direccionFacturacionCodigoPostal, direccionFacturacion?.codigoPostal)
                val direccionFacturacionProvincia = snapshot(datos.direccionFacturacionProvincia, direccionFacturacion?.provincia)
                val direccionFacturacionPoblacion = snapshot(datos.direccionFacturacionPoblacion, direccionFacturacion?.poblacion)
                val direccionFacturacionDireccion = snapshot(datos.direccionFacturacionDireccion, direccionFacturacion?.direccion)

                val direccionEnvioPais = snapshot(datos.direccionEnvioPais, direccionEnvio?.pais)
                val direccionEnvioCodigoPostal = snapshot(datos.direccionEnvioCodigoPostal, direccionEnvio?.codigoPostal)
                val direccionEnvioProvincia = snapshot(datos.direccionEnvioProvincia, direccionEnvio?.provincia)
                val direccionEnvioPoblacion = snapshot(datos.direccionEnvioPoblacion, direccionEnvio?.poblacion)
                val direccionEnvioDireccion = snapshot(datos.direccionEnvioDireccion, direccionEnvio?.direccion)

                val lineasCalculadas = datos.lineas.map { calcularLineaConImpuestos(it, cliente, datos.descuentoAgrupacion, usarValoresDelRequest = true, tarifa = tarifa) }

                val subtotal = lineasCalculadas.sumOf { it.request.cantidad * it.request.precioUnitario }
                val descuentoTotal = lineasCalculadas.sumOf {
                    (it.request.cantidad * it.request.precioUnitario) * (it.request.descuento / 100)
                }
                val baseAntesAgrupacion = subtotal - descuentoTotal
                val descuentoAgrupacionImporte = baseAntesAgrupacion * (datos.descuentoAgrupacion / 100)
                val baseImponible = baseAntesAgrupacion - descuentoAgrupacionImporte
                
                // Calcular IVA sobre la base imponible DESPUÉS del descuento de agrupación
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

                // Capturar estado anterior y datos completos para lógica de stock
                val estadoAnterior = existente.estado
                val lineasAnteriores = existente.lineas.toList()
                val ventaMultialmacenAnterior = existente.ventaMultialmacen
                val almacenAnterior = existente.almacen

                // Limpiar líneas existentes
                existente.lineas.clear()
                albaranRepository.saveAndFlush(existente)

                // Crear el albarán actualizado con snapshot de datos
                val fechaActualizada = datos.fecha?.let { parsearFecha(it) } ?: existente.fecha

                val actualizado = existente.copy(
                    numero = datos.numero,
                    fecha = fechaActualizada,
                    cliente = cliente,
                    factura = factura,
                    observaciones = datos.observaciones,
                    notas = datos.notas,
                    estado = datos.estado,
                    subtotal = subtotal,
                    descuentoTotal = descuentoTotal,
                    total = total,
                    descuentoAgrupacion = datos.descuentoAgrupacion,
                    direccion = direccion,
                    almacen = almacen,
                    ventaMultialmacen = datos.ventaMultialmacen,
                    tarifa = tarifa,
                    // Snapshot de datos del cliente
                    clienteNombreComercial = cliente?.nombreComercial,
                    clienteNombreFiscal = cliente?.nombreFiscal,
                    clienteNifCif = cliente?.nifCif,
                    clienteEmail = cliente?.email,
                    clienteTelefono = cliente?.telefonoFijo ?: cliente?.telefonoMovil,
                    // Snapshot de dirección de facturación
                    direccionFacturacionPais = direccionFacturacionPais,
                    direccionFacturacionCodigoPostal = direccionFacturacionCodigoPostal,
                    direccionFacturacionProvincia = direccionFacturacionProvincia,
                    direccionFacturacionPoblacion = direccionFacturacionPoblacion,
                    direccionFacturacionDireccion = direccionFacturacionDireccion,
                    // Snapshot de dirección de envío
                    direccionEnvioPais = direccionEnvioPais,
                    direccionEnvioCodigoPostal = direccionEnvioCodigoPostal,
                    direccionEnvioProvincia = direccionEnvioProvincia,
                    direccionEnvioPoblacion = direccionEnvioPoblacion,
                    direccionEnvioDireccion = direccionEnvioDireccion
                )

                // Guardar primero el albarán actualizado
                val albaranGuardado = albaranRepository.save(actualizado)

                actualizarAdjuntosAlbaran(albaranGuardado.id, datos.adjuntosIds)
                albaranGuardado.adjuntos = obtenerAdjuntos(albaranGuardado.id)

                // Añadir las nuevas líneas
                lineasCalculadas.forEach { (lineaReq, producto, impuestos) ->
                    val almacenLinea = lineaReq.almacenId?.let { almacenRepository.findById(it).orElse(null) }
                    val linea = AlbaranLinea(
                        albaran = albaranGuardado,
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

                val albaranFinal = albaranRepository.save(albaranGuardado)
                
                // Gestionar stock según el cambio de estado
                stockService.gestionarStockAlbaran(
                    albaranActualizado = albaranFinal,
                    estadoAnterior = estadoAnterior,
                    lineasAnteriores = lineasAnteriores,
                    ventaMultialmacenAnterior = ventaMultialmacenAnterior,
                    almacenAnterior = almacenAnterior
                )
                
                ResponseEntity.ok(albaranFinal)
            }
            .orElse(ResponseEntity.notFound().build())
    }

    @DeleteMapping("/{id}")
    fun borrar(@PathVariable id: Long): ResponseEntity<Any> {
        val albaran = albaranRepository.findById(id).orElse(null)
            ?: return ResponseEntity.notFound().build()

        // Verificar si hay facturas que referencian este albarán
        val facturasReferenciadas = facturaRepository.findAll().filter { it.albaran?.id == id }
        if (facturasReferenciadas.isNotEmpty()) {
            val numerosFacturas = facturasReferenciadas.joinToString(", ") { it.numero }
            return ResponseEntity.badRequest().body(
                mapOf(
                    "error" to "No se puede borrar el albarán porque tiene facturas referenciadas",
                    "mensaje" to "Este albarán está referenciado por las siguientes facturas: $numerosFacturas. Elimine primero estas referencias.",
                    "facturas" to numerosFacturas
                )
            )
        }

        return try {
            stockService.restaurarStockAlbaranEmitido(albaran)
            albaranRepository.deleteById(id)
            ResponseEntity.noContent().build()
        } catch (ex: Exception) {
            ResponseEntity.badRequest().body(mapOf(
                "error" to "No se pudo eliminar el albarán",
                "mensaje" to (ex.message ?: "Error interno al restaurar stock")
            ))
        }
    }

    @PostMapping("/desde-albaran-a-factura/{albaranId}")
    fun crearFacturaDesdeAlbaran(@PathVariable albaranId: Long): ResponseEntity<Any> {
        val albaran = albaranRepository.findById(albaranId).orElse(null)
            ?: return ResponseEntity.badRequest().body(mapOf("error" to "Albarán no encontrado"))

        val numeracionFactura = serieNumeracionService.generarYReservarNumero("FACTURA", albaran.serie?.id)

        val subtotal = albaran.lineas.sumOf { it.cantidad * it.precioUnitario }
        val descuentoTotal = albaran.lineas.sumOf { (it.cantidad * it.precioUnitario) * (it.descuento / 100) }
        val total = subtotal - descuentoTotal

        val nuevaFactura = Factura(
            numero = numeracionFactura.codigo,
            fecha = albaran.fecha,
            cliente = albaran.cliente,
            albaran = albaran,
            observaciones = albaran.observaciones,
            estado = "Pendiente",
            subtotal = subtotal,
            descuentoTotal = descuentoTotal,
            total = total,
            serie = numeracionFactura.serie,
            anioDocumento = numeracionFactura.anio,
            numeroSecuencial = numeracionFactura.secuencial,
            codigoDocumento = numeracionFactura.codigo
        )

        val facturaGuardada = facturaRepository.save(nuevaFactura)

        albaran.lineas.forEach { lineaAlbaran ->
            val linea = FacturaLinea(
                factura = facturaGuardada,
                producto = lineaAlbaran.producto,
                cantidad = lineaAlbaran.cantidad,
                precioUnitario = lineaAlbaran.precioUnitario,
                descuento = lineaAlbaran.descuento,
                observaciones = lineaAlbaran.observaciones
            )
            facturaGuardada.lineas.add(linea)
        }

        val facturaFinal = facturaRepository.save(facturaGuardada)

        return ResponseEntity.ok(facturaFinal)
    }

    private data class NumeracionAsignada(
        val codigo: String,
        val serie: SerieDocumento?,
        val anio: Int?,
        val secuencial: Long?
    )

    private fun prepararNumeracionParaNuevoAlbaran(request: AlbaranRequest): NumeracionAsignada {
        if (request.usarCodigoManual) {
            val codigoManual = (request.codigoManual?.ifBlank { null } ?: request.numero).trim()
            require(codigoManual.isNotBlank()) { "Debe proporcionar un código manual válido" }
            if (albaranRepository.existsByNumero(codigoManual)) {
                throw IllegalArgumentException("Ya existe un documento con el número $codigoManual")
            }
            return NumeracionAsignada(
                codigo = codigoManual,
                serie = null,
                anio = null,
                secuencial = null
            )
        }

        val resultado = serieNumeracionService.generarYReservarNumero(DOCUMENTO_SERIE_TIPO, request.serieId, request.usuarioId)
        if (albaranRepository.existsByNumero(resultado.codigo)) {
            throw IllegalStateException("El número generado ${resultado.codigo} ya existe, intenta de nuevo")
        }
        return NumeracionAsignada(
            codigo = resultado.codigo,
            serie = resultado.serie,
            anio = resultado.anio,
            secuencial = resultado.secuencial
        )
    }

    private fun calcularLineaConImpuestos(
        lineaReq: AlbaranLineaRequest,
        cliente: Cliente?,
        descuentoAgrupacion: Double = 0.0,
        usarValoresDelRequest: Boolean = false,
        tarifa: com.example.demo.model.Tarifa? = null
    ): LineaImpuesto<AlbaranLineaRequest> {
        val producto = productoRepository.findById(lineaReq.productoId).orElse(null)
        
        // Si no se especifica precio en la línea y hay tarifa, obtener precio de la tarifa
        val precioUnitario = if (lineaReq.precioUnitario > 0.0) {
            lineaReq.precioUnitario
        } else if (producto != null && tarifa != null) {
            val precioTarifa = tarifaService.obtenerPrecioProducto(producto, tarifa.id)
            precioTarifa?.precio ?: 0.0
        } else {
            0.0
        }
        
        // Calcular base imponible de la línea teniendo en cuenta el descuento de agrupación
        val subtotalLinea = lineaReq.cantidad * precioUnitario
        val descuentoLineaImporte = subtotalLinea * (lineaReq.descuento / 100)
        val baseAntesAgrupacion = subtotalLinea - descuentoLineaImporte
        val descuentoAgrupacionImporte = baseAntesAgrupacion * (descuentoAgrupacion / 100)
        val baseImponibleLinea = baseAntesAgrupacion - descuentoAgrupacionImporte
        
        // Si usarValoresDelRequest es true y el request ya tiene datos de IVA, usar el tipo de IVA pero recalcular importes
        if (usarValoresDelRequest && lineaReq.tipoIvaId != null) {
            val tipoIva = tipoIvaRepository.findById(lineaReq.tipoIvaId).orElse(null)
            val porcentajeIva = tipoIva?.porcentajeIva ?: lineaReq.porcentajeIva
            val porcentajeRecargo = if (cliente?.recargoEquivalencia == true) {
                tipoIva?.porcentajeRecargo ?: lineaReq.porcentajeRecargo
            } else 0.0
            
            // Recalcular importes sobre la base imponible real (con descuento de agrupación)
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
        
        // Si no, calcular desde el producto con el descuento de agrupación
        val impuestos = impuestoService.calcularImpuestos(
            producto = producto,
            cliente = cliente,
            cantidad = lineaReq.cantidad,
            precioUnitario = lineaReq.precioUnitario,
            descuento = lineaReq.descuento,
            descuentoAgrupacion = descuentoAgrupacion
        )
        return LineaImpuesto(lineaReq, producto, impuestos)
    }

    @GetMapping("/{id}/pdf")
    fun exportarPdf(
        @PathVariable id: Long,
        @RequestParam(required = false) plantillaId: Long?
    ): ResponseEntity<ByteArray> {
        return albaranRepository.findById(id)
            .map { albaran ->
                val pdfBytes = albaranPdfService.generarPdf(albaran, plantillaId)
                
                val headers = HttpHeaders()
                headers.contentType = MediaType.APPLICATION_PDF
                headers.setContentDispositionFormData("attachment", "albaran_${albaran.numero}.pdf")
                headers.contentLength = pdfBytes.size.toLong()
                
                ResponseEntity.ok()
                    .headers(headers)
                    .body(pdfBytes)
            }
            .orElse(ResponseEntity.notFound().build())
    }

    @PostMapping("/pdf-multiple")
    fun exportarPdfMultiple(
        @RequestBody albaranIds: List<Long>,
        @RequestParam(required = false) plantillaId: Long?
    ): ResponseEntity<ByteArray> {
        if (albaranIds.isEmpty()) {
            return ResponseEntity.badRequest().build()
        }

        val albaranes = albaranRepository.findAllById(albaranIds)
        if (albaranes.isEmpty()) {
            return ResponseEntity.notFound().build()
        }

        val pdfBytes = albaranPdfService.generarPdfMultiple(albaranes.toList(), plantillaId)
        
        val headers = HttpHeaders()
        headers.contentType = MediaType.APPLICATION_PDF
        headers.setContentDispositionFormData("attachment", "albaranes_${albaranes.size}_documentos.pdf")
        headers.contentLength = pdfBytes.size.toLong()
        
        return ResponseEntity.ok()
            .headers(headers)
            .body(pdfBytes)
    }

    data class EmailRequest(
        val destinatario: String,
        val asunto: String,
        val cuerpo: String,
        val plantillaId: Long?
    )

    @PostMapping("/{id}/enviar-email")
    fun enviarEmail(
        @PathVariable id: Long,
        @RequestBody emailRequest: EmailRequest
    ): ResponseEntity<Map<String, String>> {
        return albaranRepository.findById(id)
            .map { albaran ->
                try {
                    // Generar PDF
                    val pdfBytes = albaranPdfService.generarPdf(albaran, emailRequest.plantillaId)
                    
                    // Enviar email con PDF adjunto
                    emailService.enviarEmailConAdjunto(
                        destinatario = emailRequest.destinatario,
                        asunto = emailRequest.asunto,
                        cuerpo = emailRequest.cuerpo,
                        adjuntoNombre = "albaran_${albaran.numero}.pdf",
                        adjuntoBytes = pdfBytes
                    )
                    
                    ResponseEntity.ok(mapOf(
                        "mensaje" to "Email enviado correctamente a ${emailRequest.destinatario}",
                        "destinatario" to emailRequest.destinatario,
                        "asunto" to emailRequest.asunto
                    ))
                } catch (e: Exception) {
                    ResponseEntity.status(500).body(mapOf(
                        "error" to "Error al enviar email: ${e.message}"
                    ))
                }
            }
            .orElse(ResponseEntity.notFound().build())
    }

    @PostMapping("/{id}/contabilizar")
    fun contabilizarAlbaran(@PathVariable id: Long): ResponseEntity<Any> {
        val albaran = albaranRepository.findById(id).orElse(null)
            ?: return ResponseEntity.badRequest().body(mapOf("error" to "Albarán no encontrado"))

        // Verificar si ya está contabilizado
        if (albaran.contabilizado) {
            return ResponseEntity.badRequest().body(mapOf("error" to "El albarán ya está contabilizado"))
        }

        // Restar stock de cada producto (producto_almacen)
        albaran.lineas.forEach { linea ->
            val producto = linea.producto
            val almacenId = linea.almacen?.id ?: albaran.almacen?.id
                ?: almacenRepository.findByActivoTrue().firstOrNull()?.id

            if (producto != null && almacenId != null) {
                val existing = productoAlmacenRepository.findByProductoIdAndAlmacenId(producto.id, almacenId)
                    ?: productoAlmacenRepository.save(
                        com.example.demo.model.ProductoAlmacen(
                            producto = producto,
                            almacen = almacenRepository.findById(almacenId).orElse(null),
                            stock = 0,
                            stockMinimo = 0
                        )
                    )

                val nuevoStock = existing.stock - linea.cantidad
                if (nuevoStock < 0) {
                    return ResponseEntity.badRequest().body(
                        mapOf(
                            "error" to "Stock insuficiente para el producto ${producto.nombre}. Stock actual: ${existing.stock}, solicitado: ${linea.cantidad}"
                        )
                    )
                }

                productoAlmacenRepository.save(
                    existing.copy(
                        stock = nuevoStock,
                        updatedAt = java.time.LocalDateTime.now()
                    )
                )
            }
        }

        // Marcar el albarán como contabilizado
        val albaranContabilizado = albaran.copy(contabilizado = true)
        val albaranGuardado = albaranRepository.save(albaranContabilizado)

        return ResponseEntity.ok(mapOf(
            "mensaje" to "Albarán contabilizado correctamente",
            "albaran" to albaranGuardado
        ))
    }

    private fun cargarAdjuntos(albaran: Albaran): Albaran {
        albaran.adjuntos = obtenerAdjuntos(albaran.id)
        return albaran
    }

    private fun obtenerAdjuntos(albaranId: Long): List<ArchivoEmpresa> {
        return archivoEmpresaRepository.findByDocumentoOrigenAndDocumentoOrigenId("ALBARAN", albaranId)
    }

    private fun actualizarAdjuntosAlbaran(albaranId: Long, adjuntosIds: List<Long>) {
        // Primero, desvincular todos los adjuntos existentes de este albarán
        val adjuntosExistentes = archivoEmpresaRepository.findByDocumentoOrigenAndDocumentoOrigenId("ALBARAN", albaranId)
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
                    documentoOrigen = "ALBARAN",
                    documentoOrigenId = albaranId
                )
                archivoEmpresaRepository.save(archivoActualizado)
            }
        }
    }

    @PostMapping("/duplicar")
    fun duplicarAlbaran(@RequestBody request: DuplicarAlbaranRequest): ResponseEntity<Albaran> {
        val albaranOrigen = albaranRepository.findById(request.albaranOrigenId)
            .orElseThrow { IllegalArgumentException("Albarán origen no encontrado") }

        val numeracion = serieNumeracionService.generarYReservarNumero(DOCUMENTO_SERIE_TIPO, request.serieId, usuarioId = null)

        // Copiar líneas del albarán origen
        val lineasCalculadas = albaranOrigen.lineas.map { lineaOrigen ->
            val lineaRequest = AlbaranLineaRequest(
                productoId = lineaOrigen.producto?.id ?: 0,
                nombreProducto = lineaOrigen.nombreProducto,
                referencia = lineaOrigen.referencia,
                cantidad = lineaOrigen.cantidad,
                precioUnitario = lineaOrigen.precioUnitario,
                descuento = lineaOrigen.descuento,
                observaciones = lineaOrigen.observaciones,
                tipoIvaId = lineaOrigen.tipoIva?.id,
                porcentajeIva = lineaOrigen.porcentajeIva,
                porcentajeRecargo = lineaOrigen.porcentajeRecargo,
                importeIva = lineaOrigen.importeIva,
                importeRecargo = lineaOrigen.importeRecargo
            )
            calcularLineaConImpuestos(lineaRequest, albaranOrigen.cliente, albaranOrigen.descuentoAgrupacion, usarValoresDelRequest = true, tarifa = albaranOrigen.tarifa)
        }

        val subtotal = lineasCalculadas.sumOf { it.request.cantidad * it.request.precioUnitario }
        val descuentoTotal = lineasCalculadas.sumOf {
            (it.request.cantidad * it.request.precioUnitario) * (it.request.descuento / 100)
        }
        val baseAntesAgrupacion = subtotal - descuentoTotal
        val descuentoAgrupacionImporte = baseAntesAgrupacion * (albaranOrigen.descuentoAgrupacion / 100)
        val baseImponible = baseAntesAgrupacion - descuentoAgrupacionImporte
        
        // Calcular IVA sobre la base imponible DESPUÉS del descuento de agrupación
        val impuestosTotales = lineasCalculadas.sumOf { lineaCalc ->
            val subtotalLinea = lineaCalc.request.cantidad * lineaCalc.request.precioUnitario
            val descuentoLinea = subtotalLinea * (lineaCalc.request.descuento / 100)
            val baseLineaSinAgrupacion = subtotalLinea - descuentoLinea
            val baseLineaConAgrupacion = baseLineaSinAgrupacion * (1 - albaranOrigen.descuentoAgrupacion / 100)
            val ivaLinea = baseLineaConAgrupacion * (lineaCalc.impuestos.porcentajeIva / 100)
            val recargoLinea = baseLineaConAgrupacion * (lineaCalc.impuestos.porcentajeRecargo / 100)
            ivaLinea + recargoLinea
        }
        val total = baseImponible + impuestosTotales

        // Crear nuevo albarán duplicado - siempre en estado Pendiente
        val fechaDuplicado = request.fecha?.let { parsearFecha(it) } ?: albaranOrigen.fecha

        val nuevoAlbaran = Albaran(
            numero = numeracion.codigo,
            fecha = fechaDuplicado,
            cliente = albaranOrigen.cliente,
            observaciones = albaranOrigen.observaciones,
            notas = albaranOrigen.notas,
            estado = "Pendiente",
            subtotal = subtotal,
            descuentoTotal = descuentoTotal,
            total = total,
            descuentoAgrupacion = albaranOrigen.descuentoAgrupacion,
            direccion = albaranOrigen.direccion,
            almacen = albaranOrigen.almacen,
            ventaMultialmacen = albaranOrigen.ventaMultialmacen,
            tarifa = albaranOrigen.tarifa,
            serie = numeracion.serie,
            anioDocumento = numeracion.anio,
            numeroSecuencial = numeracion.secuencial,
            codigoDocumento = numeracion.codigo,
            clienteNombreComercial = albaranOrigen.clienteNombreComercial,
            clienteNombreFiscal = albaranOrigen.clienteNombreFiscal,
            clienteNifCif = albaranOrigen.clienteNifCif,
            clienteEmail = albaranOrigen.clienteEmail,
            clienteTelefono = albaranOrigen.clienteTelefono,
            direccionFacturacionPais = albaranOrigen.direccionFacturacionPais,
            direccionFacturacionCodigoPostal = albaranOrigen.direccionFacturacionCodigoPostal,
            direccionFacturacionProvincia = albaranOrigen.direccionFacturacionProvincia,
            direccionFacturacionPoblacion = albaranOrigen.direccionFacturacionPoblacion,
            direccionFacturacionDireccion = albaranOrigen.direccionFacturacionDireccion,
            direccionEnvioPais = albaranOrigen.direccionEnvioPais,
            direccionEnvioCodigoPostal = albaranOrigen.direccionEnvioCodigoPostal,
            direccionEnvioProvincia = albaranOrigen.direccionEnvioProvincia,
            direccionEnvioPoblacion = albaranOrigen.direccionEnvioPoblacion,
            direccionEnvioDireccion = albaranOrigen.direccionEnvioDireccion
        )

        val albaranGuardado = albaranRepository.save(nuevoAlbaran)

        // Crear líneas
        lineasCalculadas.forEach { (lineaReq, producto, impuestos) ->
            val linea = AlbaranLinea(
                albaran = albaranGuardado,
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
                importeRecargo = impuestos.importeRecargo
            )
            albaranGuardado.lineas.add(linea)
        }

        val albaranFinal = albaranRepository.save(albaranGuardado)

        // Copiar adjuntos del albarán origen
        val adjuntosOrigen = obtenerAdjuntos(albaranOrigen.id)
        if (adjuntosOrigen.isNotEmpty()) {
            actualizarAdjuntosAlbaran(albaranFinal.id, adjuntosOrigen.map { it.id })
        }

        // Duplicar no registra transformación - se trata como documento nuevo/manual
        return ResponseEntity.ok(albaranFinal)
    }

    @PostMapping("/transformar")
    @Transactional
    fun transformarDocumento(@RequestBody request: TransformarDocumentoRequest): ResponseEntity<Any> {
        // Extraer datos del documento origen según tipo
        data class OrigenVentaData(
            val cliente: com.example.demo.model.Cliente?,
            val lineas: List<Triple<com.example.demo.model.Producto?, Int, com.example.demo.model.ventas.AlbaranLinea?>>,
            val lineasGeneral: List<AlbaranLinea>,
            val descuentoAgrupacion: Double,
            val almacen: Almacen?,
            val ventaMultialmacen: Boolean,
            val tarifa: com.example.demo.model.Tarifa?,
            val observaciones: String,
            val notas: String,
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

        // Handle compra origins for cross-module transformation
        if (request.tipoOrigen in listOf("PRESUPUESTO_COMPRA", "PEDIDO_COMPRA", "ALBARAN_COMPRA", "FACTURA_COMPRA")) {
            val cliente = request.clienteId?.let { clienteRepository.findById(it).orElse(null) }

            data class LineaCompra(val producto: com.example.demo.model.Producto?, val cantidad: Int, val precioUnitario: Double, val descuento: Double, val observaciones: String, val tipoIva: com.example.demo.model.TipoIva?, val porcentajeIva: Double, val porcentajeRecargo: Double, val importeIva: Double, val importeRecargo: Double, val almacen: Almacen?, val nombreProducto: String, val referencia: String?)

            val lineasCompra: List<LineaCompra>
            val descuentoAgrupacion: Double
            val almacenOrigen: Almacen?
            val multialmacen: Boolean
            val tarifaOrigen: com.example.demo.model.Tarifa?
            val observaciones: String
            val notas: String

            when (request.tipoOrigen) {
                "PRESUPUESTO_COMPRA" -> {
                    val origen = presupuestoCompraRepository.findById(request.idOrigen).orElse(null)
                        ?: return ResponseEntity.badRequest().body(mapOf("error" to "Presupuesto de compra no encontrado"))
                    lineasCompra = origen.lineas.map { LineaCompra(it.producto, it.cantidad.toInt(), it.precioUnitario, it.descuento, it.observaciones ?: "", it.tipoIva, it.porcentajeIva, it.porcentajeRecargo, it.importeIva, it.importeRecargo, it.almacen, it.nombreProducto, it.referencia) }
                    descuentoAgrupacion = origen.descuentoAgrupacion; almacenOrigen = origen.almacen; multialmacen = origen.compraMultialmacen ?: false; tarifaOrigen = origen.tarifa; observaciones = origen.observaciones ?: ""; notas = origen.notas ?: ""
                }
                "PEDIDO_COMPRA" -> {
                    val origen = pedidoCompraRepository.findById(request.idOrigen).orElse(null)
                        ?: return ResponseEntity.badRequest().body(mapOf("error" to "Pedido de compra no encontrado"))
                    lineasCompra = origen.lineas.map { LineaCompra(it.producto, it.cantidad.toInt(), it.precioUnitario, it.descuento, it.observaciones ?: "", it.tipoIva, it.porcentajeIva, it.porcentajeRecargo, it.importeIva, it.importeRecargo, it.almacen, it.nombreProducto, it.referencia) }
                    descuentoAgrupacion = origen.descuentoAgrupacion; almacenOrigen = origen.almacen; multialmacen = origen.compraMultialmacen ?: false; tarifaOrigen = origen.tarifa; observaciones = origen.observaciones ?: ""; notas = origen.notas ?: ""
                }
                "ALBARAN_COMPRA" -> {
                    val origen = albaranCompraRepository.findById(request.idOrigen).orElse(null)
                        ?: return ResponseEntity.badRequest().body(mapOf("error" to "Albarán de compra no encontrado"))
                    lineasCompra = origen.lineas.map { LineaCompra(it.producto, it.cantidad, it.precioUnitario, it.descuento, it.observaciones ?: "", it.tipoIva, it.porcentajeIva, it.porcentajeRecargo, it.importeIva, it.importeRecargo, it.almacen, it.nombreProducto, it.referencia) }
                    descuentoAgrupacion = origen.descuentoAgrupacion; almacenOrigen = origen.almacen; multialmacen = origen.compraMultialmacen; tarifaOrigen = origen.tarifa; observaciones = origen.observaciones ?: ""; notas = origen.notas ?: ""
                }
                "FACTURA_COMPRA" -> {
                    val origen = facturaCompraRepository.findById(request.idOrigen).orElse(null)
                        ?: return ResponseEntity.badRequest().body(mapOf("error" to "Factura de compra no encontrada"))
                    lineasCompra = origen.lineas.map { LineaCompra(it.producto, it.cantidad, it.precioUnitario, it.descuento, it.observaciones ?: "", it.tipoIva, it.porcentajeIva, it.porcentajeRecargo, it.importeIva, it.importeRecargo, it.almacen, it.nombreProducto, it.referencia) }
                    descuentoAgrupacion = origen.descuentoAgrupacion; almacenOrigen = origen.almacen; multialmacen = origen.compraMultialmacen; tarifaOrigen = origen.tarifa; observaciones = origen.observaciones ?: ""; notas = origen.notas ?: ""
                }
                else -> return ResponseEntity.badRequest().body(mapOf("error" to "Tipo de origen no soportado"))
            }

            val subtotal = lineasCompra.sumOf { it.cantidad * it.precioUnitario }
            val descuentoTotal = lineasCompra.sumOf { (it.cantidad * it.precioUnitario) * (it.descuento / 100) }
            val baseAntesAgrupacion = subtotal - descuentoTotal
            val descuentoAgrupacionImporte = baseAntesAgrupacion * (descuentoAgrupacion / 100)
            val baseImponible = baseAntesAgrupacion - descuentoAgrupacionImporte
            val impuestosTotales = lineasCompra.sumOf { linea ->
                val base = (linea.cantidad * linea.precioUnitario) * (1 - linea.descuento / 100) * (1 - descuentoAgrupacion / 100)
                base * (linea.porcentajeIva + linea.porcentajeRecargo) / 100
            }
            val total = baseImponible + impuestosTotales

            val numeracion = serieNumeracionService.generarYReservarNumero(DOCUMENTO_SERIE_TIPO, request.serieId, usuarioId = null)
            val fechaTransformada = request.fecha?.let { parsearFecha(it) } ?: java.time.LocalDateTime.now()

            val nuevoAlbaran = Albaran(
                numero = numeracion.codigo,
                fecha = fechaTransformada,
                cliente = cliente,
                observaciones = observaciones,
                notas = notas,
                estado = request.estado,
                subtotal = subtotal,
                descuentoTotal = descuentoTotal,
                total = total,
                descuentoAgrupacion = descuentoAgrupacion,
                almacen = almacenOrigen,
                ventaMultialmacen = multialmacen,
                tarifa = tarifaOrigen,
                serie = numeracion.serie,
                anioDocumento = numeracion.anio,
                numeroSecuencial = numeracion.secuencial,
                codigoDocumento = numeracion.codigo,
                clienteNombreComercial = cliente?.nombreComercial,
                clienteNombreFiscal = cliente?.nombreFiscal,
                clienteNifCif = cliente?.nifCif,
                clienteEmail = cliente?.email,
                clienteTelefono = cliente?.telefonoFijo ?: cliente?.telefonoMovil
            )

            val albaranGuardado = albaranRepository.save(nuevoAlbaran)

            lineasCompra.forEach { linea ->
                val nuevaLinea = AlbaranLinea(
                    albaran = albaranGuardado,
                    producto = linea.producto,
                    nombreProducto = linea.nombreProducto,
                    referencia = linea.referencia ?: linea.producto?.referencia,
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
                albaranGuardado.lineas.add(nuevaLinea)
            }

            val albaranFinal = albaranRepository.save(albaranGuardado)

            // Gestionar stock si estado es Emitido
            if (request.estado == "Emitido") {
                val configuracion = configuracionVentasRepository.findTopByOrderByIdAsc()
                if (configuracion?.documentoDescuentaStock == "ALBARAN") {
                    stockService.gestionarStockAlbaran(albaranFinal, "Pendiente", emptyList(), false, null)
                }
            }

            if (!request.esDuplicacion) {
                val transformacion = com.example.demo.model.ventas.DocumentoTransformacion(
                    tipoOrigen = request.tipoOrigen,
                    idOrigen = request.idOrigen,
                    numeroOrigen = null,
                    tipoDestino = "ALBARAN",
                    idDestino = albaranFinal.id,
                    numeroDestino = albaranFinal.numero,
                    tipoTransformacion = "CONVERTIR",
                    fechaTransformacion = java.time.LocalDateTime.now()
                )
                documentoTransformacionRepository.save(transformacion)
            }

            return ResponseEntity.ok(albaranFinal)
        }

        val albaranOrigen = albaranRepository.findById(request.idOrigen)
            .orElseThrow { IllegalArgumentException("Albarán origen no encontrado") }

        // Determinar el tipo de transformación
        val tipoTransformacion = when {
            request.esDuplicacion -> "DUPLICAR"
            request.tipoDestino == request.tipoOrigen -> "CONVERTIR" // Mismo tipo pero no es duplicación
            else -> "CONVERTIR"
        }

        return when (request.tipoDestino) {
            "ALBARAN" -> {
                // Transformar a albarán (duplicar o convertir)
                val numeracion = serieNumeracionService.generarYReservarNumero(DOCUMENTO_SERIE_TIPO, request.serieId, usuarioId = null)

                val lineasCalculadas = albaranOrigen.lineas.map { lineaOrigen ->
                    val lineaRequest = AlbaranLineaRequest(
                        productoId = lineaOrigen.producto?.id ?: 0,
                        nombreProducto = lineaOrigen.nombreProducto,
                        referencia = lineaOrigen.referencia,
                        cantidad = lineaOrigen.cantidad,
                        precioUnitario = lineaOrigen.precioUnitario,
                        descuento = lineaOrigen.descuento,
                        observaciones = lineaOrigen.observaciones,
                        tipoIvaId = lineaOrigen.tipoIva?.id,
                        porcentajeIva = lineaOrigen.porcentajeIva,
                        porcentajeRecargo = lineaOrigen.porcentajeRecargo,
                        importeIva = lineaOrigen.importeIva,
                        importeRecargo = lineaOrigen.importeRecargo
                    )
                    calcularLineaConImpuestos(lineaRequest, albaranOrigen.cliente, albaranOrigen.descuentoAgrupacion, usarValoresDelRequest = true, tarifa = albaranOrigen.tarifa)
                }

                val subtotal = lineasCalculadas.sumOf { it.request.cantidad * it.request.precioUnitario }
                val descuentoTotal = lineasCalculadas.sumOf {
                    (it.request.cantidad * it.request.precioUnitario) * (it.request.descuento / 100)
                }
                val baseAntesAgrupacion = subtotal - descuentoTotal
                val descuentoAgrupacionImporte = baseAntesAgrupacion * (albaranOrigen.descuentoAgrupacion / 100)
                val baseImponible = baseAntesAgrupacion - descuentoAgrupacionImporte
                
                val impuestosTotales = lineasCalculadas.sumOf { lineaCalc ->
                    val subtotalLinea = lineaCalc.request.cantidad * lineaCalc.request.precioUnitario
                    val descuentoLinea = subtotalLinea * (lineaCalc.request.descuento / 100)
                    val baseLineaSinAgrupacion = subtotalLinea - descuentoLinea
                    val baseLineaConAgrupacion = baseLineaSinAgrupacion * (1 - albaranOrigen.descuentoAgrupacion / 100)
                    val ivaLinea = baseLineaConAgrupacion * (lineaCalc.impuestos.porcentajeIva / 100)
                    val recargoLinea = baseLineaConAgrupacion * (lineaCalc.impuestos.porcentajeRecargo / 100)
                    ivaLinea + recargoLinea
                }
                val total = baseImponible + impuestosTotales

                val fechaTransformada = request.fecha?.let { parsearFecha(it) } ?: albaranOrigen.fecha

                val nuevoAlbaran = Albaran(
                    numero = numeracion.codigo,
                    fecha = fechaTransformada,
                    cliente = albaranOrigen.cliente,
                    observaciones = albaranOrigen.observaciones,
                    notas = albaranOrigen.notas,
                    estado = request.estado,
                    subtotal = subtotal,
                    descuentoTotal = descuentoTotal,
                    total = total,
                    descuentoAgrupacion = albaranOrigen.descuentoAgrupacion,
                    direccion = albaranOrigen.direccion,
                    almacen = albaranOrigen.almacen,
                    ventaMultialmacen = albaranOrigen.ventaMultialmacen,
                    tarifa = albaranOrigen.tarifa,
                    serie = numeracion.serie,
                    anioDocumento = numeracion.anio,
                    numeroSecuencial = numeracion.secuencial,
                    codigoDocumento = numeracion.codigo,
                    clienteNombreComercial = albaranOrigen.clienteNombreComercial,
                    clienteNombreFiscal = albaranOrigen.clienteNombreFiscal,
                    clienteNifCif = albaranOrigen.clienteNifCif,
                    clienteEmail = albaranOrigen.clienteEmail,
                    clienteTelefono = albaranOrigen.clienteTelefono,
                    direccionFacturacionPais = albaranOrigen.direccionFacturacionPais,
                    direccionFacturacionCodigoPostal = albaranOrigen.direccionFacturacionCodigoPostal,
                    direccionFacturacionProvincia = albaranOrigen.direccionFacturacionProvincia,
                    direccionFacturacionPoblacion = albaranOrigen.direccionFacturacionPoblacion,
                    direccionFacturacionDireccion = albaranOrigen.direccionFacturacionDireccion,
                    direccionEnvioPais = albaranOrigen.direccionEnvioPais,
                    direccionEnvioCodigoPostal = albaranOrigen.direccionEnvioCodigoPostal,
                    direccionEnvioProvincia = albaranOrigen.direccionEnvioProvincia,
                    direccionEnvioPoblacion = albaranOrigen.direccionEnvioPoblacion,
                    direccionEnvioDireccion = albaranOrigen.direccionEnvioDireccion
                )

                val albaranGuardado = albaranRepository.save(nuevoAlbaran)

                lineasCalculadas.forEach { (lineaReq, producto, impuestos) ->
                    val linea = AlbaranLinea(
                        albaran = albaranGuardado,
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
                        importeRecargo = impuestos.importeRecargo
                    )
                    albaranGuardado.lineas.add(linea)
                }

                val albaranFinal = albaranRepository.save(albaranGuardado)

                // Solo registrar transformación si NO es duplicación
                if (!request.esDuplicacion) {
                    val transformacion = com.example.demo.model.ventas.DocumentoTransformacion(
                        tipoOrigen = "ALBARAN",
                        idOrigen = albaranOrigen.id,
                        numeroOrigen = albaranOrigen.numero,
                        tipoDestino = "ALBARAN",
                        idDestino = albaranFinal.id,
                        numeroDestino = albaranFinal.numero,
                        tipoTransformacion = tipoTransformacion,
                        fechaTransformacion = java.time.LocalDateTime.now()
                    )
                    documentoTransformacionRepository.save(transformacion)
                }

                ResponseEntity.ok(albaranFinal)
            }
            
            "FACTURA" -> {
                // Delegar a FacturaController
                val transformarRequest = TransformarAlbaranRequest(
                    albaranId = request.idOrigen,
                    serieId = request.serieId,
                    fecha = request.fecha,
                    estado = request.estado
                )
                // Llamar al endpoint de facturas
                ResponseEntity.status(302).body(mapOf(
                    "redirect" to "/facturas/desde-albaran",
                    "payload" to transformarRequest
                ))
            }
            
            "FACTURA_PROFORMA" -> {
                // Delegar a FacturaProformaController
                val transformarRequest = TransformarAlbaranRequest(
                    albaranId = request.idOrigen,
                    serieId = request.serieId,
                    fecha = request.fecha,
                    estado = request.estado
                )
                ResponseEntity.status(302).body(mapOf(
                    "redirect" to "/facturas-proforma/desde-albaran",
                    "payload" to transformarRequest
                ))
            }
            
            "FACTURA_RECTIFICATIVA" -> {
                // Delegar a FacturaRectificativaController
                val transformarRequest = TransformarAlbaranRequest(
                    albaranId = request.idOrigen,
                    serieId = request.serieId,
                    fecha = request.fecha,
                    estado = request.estado
                )
                ResponseEntity.status(302).body(mapOf(
                    "redirect" to "/facturas-rectificativas/desde-albaran",
                    "payload" to transformarRequest
                ))
            }
            
            else -> ResponseEntity.badRequest().body(mapOf("error" to "Tipo de destino no soportado: ${request.tipoDestino}"))
        }
    }

    @PostMapping("/desde-factura")
    @Transactional
    fun crearDesdeFactura(@RequestBody request: TransformarAlbaranRequest): ResponseEntity<Any> {
        val factura = facturaRepository.findById(request.albaranId ?: return ResponseEntity.badRequest().body(mapOf("error" to "ID de factura requerido"))).orElse(null)
            ?: return ResponseEntity.badRequest().body(mapOf("error" to "Factura no encontrada"))

        val numeracion = serieNumeracionService.generarYReservarNumero("ALBARAN", request.serieId, usuarioId = null)

        val subtotal = factura.lineas.sumOf { it.cantidad * it.precioUnitario }
        val descuentoTotal = factura.lineas.sumOf { (it.cantidad * it.precioUnitario) * (it.descuento / 100) }
        val baseAntesAgrupacion = subtotal - descuentoTotal
        val descuentoAgrupacionImporte = baseAntesAgrupacion * (request.descuentoAgrupacion / 100)
        val baseImponible = baseAntesAgrupacion - descuentoAgrupacionImporte
        val impuestosTotales = factura.lineas.sumOf { linea ->
            val baseLineaSinAgrupacion = (linea.cantidad * linea.precioUnitario) * (1 - linea.descuento / 100)
            val baseLineaConAgrupacion = baseLineaSinAgrupacion * (1 - request.descuentoAgrupacion / 100)
            val ivaLinea = baseLineaConAgrupacion * (linea.porcentajeIva / 100)
            val recargoLinea = baseLineaConAgrupacion * (linea.porcentajeRecargo / 100)
            ivaLinea + recargoLinea
        }
        val total = baseImponible + impuestosTotales

        val fechaDesdeFactura = request.fecha?.let { parsearFecha(it) } ?: factura.fecha

        val nuevoAlbaran = Albaran(
            numero = numeracion.codigo,
            fecha = fechaDesdeFactura,
            cliente = factura.cliente,
            observaciones = factura.observaciones ?: "",
            notas = factura.notas ?: "",
            estado = request.estado ?: "Pendiente",
            subtotal = subtotal,
            descuentoTotal = descuentoTotal,
            total = total,
            descuentoAgrupacion = request.descuentoAgrupacion,
            direccion = null,
            almacen = factura.almacen,
            ventaMultialmacen = factura.ventaMultialmacen ?: false,
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

        val albaranGuardado = albaranRepository.save(nuevoAlbaran)

        factura.lineas.forEach { lineaFactura ->
            val almacen = lineaFactura.almacen ?: factura.almacen
            val lineaAlbaran = AlbaranLinea(
                albaran = albaranGuardado,
                producto = lineaFactura.producto,
                nombreProducto = lineaFactura.nombreProducto,
                referencia = lineaFactura.referencia,
                cantidad = lineaFactura.cantidad,
                precioUnitario = lineaFactura.precioUnitario,
                descuento = lineaFactura.descuento,
                observaciones = lineaFactura.observaciones ?: "",
                tipoIva = lineaFactura.tipoIva,
                porcentajeIva = lineaFactura.porcentajeIva,
                porcentajeRecargo = lineaFactura.porcentajeRecargo,
                importeIva = lineaFactura.importeIva,
                importeRecargo = lineaFactura.importeRecargo,
                almacen = almacen
            )
            albaranGuardado.lineas.add(lineaAlbaran)
        }

        val albaranFinal = albaranRepository.save(albaranGuardado)

        val transformacion = com.example.demo.model.ventas.DocumentoTransformacion(
            tipoOrigen = "FACTURA",
            idOrigen = factura.id,
            numeroOrigen = factura.numero,
            tipoDestino = "ALBARAN",
            idDestino = albaranFinal.id,
            numeroDestino = albaranFinal.numero,
            tipoTransformacion = "CONVERTIR",
            fechaTransformacion = java.time.LocalDateTime.now()
        )
        documentoTransformacionRepository.save(transformacion)

        return ResponseEntity.ok(albaranFinal)
    }

    @PostMapping("/desde-factura-rectificativa")
    @Transactional
    fun crearDesdeFacturaRectificativa(@RequestBody request: TransformarAlbaranRequest): ResponseEntity<Any> {
        val facturaRectificativa = facturaRectificativaRepository.findById(request.facturaRectificativaId ?: return ResponseEntity.badRequest().body(mapOf("error" to "ID de factura rectificativa requerido"))).orElse(null)
            ?: return ResponseEntity.badRequest().body(mapOf("error" to "Factura Rectificativa no encontrada"))

        val numeracion = serieNumeracionService.generarYReservarNumero("ALBARAN_VENTA", request.serieId)

        val nuevoAlbaran = Albaran(
            numero = numeracion.codigo,
            fecha = parsearFecha(request.fecha?.toString()),
            cliente = facturaRectificativa.cliente,
            observaciones = facturaRectificativa.observaciones ?: "",
            notas = "",
            estado = request.estado ?: "Pendiente",
            subtotal = facturaRectificativa.subtotal,
            descuentoTotal = facturaRectificativa.descuentoTotal,
            total = facturaRectificativa.total,
            serie = numeracion.serie,
            anioDocumento = numeracion.anio,
            numeroSecuencial = numeracion.secuencial,
            codigoDocumento = numeracion.codigo
        )

        val albaranGuardado = albaranRepository.save(nuevoAlbaran)

        facturaRectificativa.lineas.forEach { lineaFacturaRectificativa ->
            val almacen = lineaFacturaRectificativa.almacen ?: facturaRectificativa.almacen
            val lineaAlbaran = AlbaranLinea(
                albaran = albaranGuardado,
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
            albaranGuardado.lineas.add(lineaAlbaran)
        }

        val albaranFinal = albaranRepository.save(albaranGuardado)

        val transformacion = com.example.demo.model.ventas.DocumentoTransformacion(
            tipoOrigen = "FACTURA_RECTIFICATIVA",
            idOrigen = facturaRectificativa.id,
            numeroOrigen = facturaRectificativa.numero,
            tipoDestino = "ALBARAN",
            idDestino = albaranFinal.id,
            numeroDestino = albaranFinal.numero,
            tipoTransformacion = "CONVERTIR",
            fechaTransformacion = java.time.LocalDateTime.now()
        )
        documentoTransformacionRepository.save(transformacion)

        return ResponseEntity.ok(albaranFinal)
    }

    @PostMapping("/desde-presupuesto")
    @Transactional
    fun crearDesdePresupuesto(@RequestBody request: TransformarAlbaranRequest): ResponseEntity<Any> {
        val presupuesto = presupuestoRepository.findById(request.presupuestoId ?: return ResponseEntity.badRequest().body(mapOf("error" to "ID de presupuesto requerido"))).orElse(null)
            ?: return ResponseEntity.badRequest().body(mapOf("error" to "Presupuesto no encontrado"))

        val numeracion = serieNumeracionService.generarYReservarNumero("ALBARAN_VENTA", request.serieId)

        val nuevoAlbaran = Albaran(
            numero = numeracion.codigo,
            fecha = parsearFecha(request.fecha?.toString()),
            cliente = presupuesto.cliente,
            observaciones = presupuesto.observaciones ?: "",
            notas = "",
            estado = request.estado ?: "Pendiente",
            subtotal = presupuesto.subtotal,
            descuentoTotal = presupuesto.descuentoTotal,
            total = presupuesto.total,
            descuentoAgrupacion = request.descuentoAgrupacion,
            direccion = null,
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

        val albaranGuardado = albaranRepository.save(nuevoAlbaran)

        presupuesto.lineas.forEach { lineaPresupuesto ->
            val almacen = lineaPresupuesto.almacen ?: presupuesto.almacen
            val lineaAlbaran = AlbaranLinea(
                albaran = albaranGuardado,
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
            albaranGuardado.lineas.add(lineaAlbaran)
        }

        val albaranFinal = albaranRepository.save(albaranGuardado)

        val transformacion = com.example.demo.model.ventas.DocumentoTransformacion(
            tipoOrigen = "PRESUPUESTO",
            idOrigen = presupuesto.id,
            numeroOrigen = presupuesto.numero,
            tipoDestino = "ALBARAN",
            idDestino = albaranFinal.id,
            numeroDestino = albaranFinal.numero,
            tipoTransformacion = "CONVERTIR",
            fechaTransformacion = java.time.LocalDateTime.now()
        )
        documentoTransformacionRepository.save(transformacion)

        return ResponseEntity.ok(albaranFinal)
    }

    @PostMapping("/desde-pedido")
    @Transactional
    fun crearDesdePedido(@RequestBody request: TransformarAlbaranRequest): ResponseEntity<Any> {
        val pedido = pedidoRepository.findById(request.pedidoId ?: return ResponseEntity.badRequest().body(mapOf("error" to "ID de pedido requerido"))).orElse(null)
            ?: return ResponseEntity.badRequest().body(mapOf("error" to "Pedido no encontrado"))

        val numeracion = serieNumeracionService.generarYReservarNumero("ALBARAN_VENTA", request.serieId)

        val nuevoAlbaran = Albaran(
            numero = numeracion.codigo,
            fecha = parsearFecha(request.fecha?.toString()),
            cliente = pedido.cliente,
            observaciones = pedido.observaciones ?: "",
            notas = "",
            estado = request.estado ?: "Pendiente",
            subtotal = pedido.subtotal,
            descuentoTotal = pedido.descuentoTotal,
            total = pedido.total,
            descuentoAgrupacion = request.descuentoAgrupacion,
            direccion = null,
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

        val albaranGuardado = albaranRepository.save(nuevoAlbaran)

        pedido.lineas.forEach { lineaPedido ->
            val almacen = lineaPedido.almacen ?: pedido.almacen
            val lineaAlbaran = AlbaranLinea(
                albaran = albaranGuardado,
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
            albaranGuardado.lineas.add(lineaAlbaran)
        }

        val albaranFinal = albaranRepository.save(albaranGuardado)

        val transformacion = com.example.demo.model.ventas.DocumentoTransformacion(
            tipoOrigen = "PEDIDO",
            idOrigen = pedido.id,
            numeroOrigen = pedido.numero,
            tipoDestino = "ALBARAN",
            idDestino = albaranFinal.id,
            numeroDestino = albaranFinal.numero,
            tipoTransformacion = "CONVERTIR",
            fechaTransformacion = java.time.LocalDateTime.now()
        )
        documentoTransformacionRepository.save(transformacion)

        return ResponseEntity.ok(albaranFinal)
    }

    @PostMapping("/desde-factura-proforma")
    @Transactional
    fun crearDesdeFacturaProforma(@RequestBody request: TransformarAlbaranRequest): ResponseEntity<Any> {
        val facturaProforma = facturaProformaRepository.findById(request.facturaProformaId ?: return ResponseEntity.badRequest().body(mapOf("error" to "ID de factura proforma requerido"))).orElse(null)
            ?: return ResponseEntity.badRequest().body(mapOf("error" to "Factura Proforma no encontrada"))

        val numeracion = serieNumeracionService.generarYReservarNumero("ALBARAN_VENTA", request.serieId)

        val nuevoAlbaran = Albaran(
            numero = numeracion.codigo,
            fecha = parsearFecha(request.fecha?.toString()),
            cliente = facturaProforma.cliente,
            observaciones = facturaProforma.observaciones ?: "",
            notas = "",
            estado = request.estado ?: "Pendiente",
            subtotal = facturaProforma.subtotal,
            descuentoTotal = facturaProforma.descuentoTotal,
            total = facturaProforma.total,
            descuentoAgrupacion = request.descuentoAgrupacion,
            direccion = null,
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

        val albaranGuardado = albaranRepository.save(nuevoAlbaran)

        facturaProforma.lineas.forEach { lineaFacturaProforma ->
            val almacen = lineaFacturaProforma.almacen ?: facturaProforma.almacen
            val lineaAlbaran = AlbaranLinea(
                albaran = albaranGuardado,
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
            albaranGuardado.lineas.add(lineaAlbaran)
        }

        val albaranFinal = albaranRepository.save(albaranGuardado)

        val transformacion = com.example.demo.model.ventas.DocumentoTransformacion(
            tipoOrigen = "FACTURA_PROFORMA",
            idOrigen = facturaProforma.id,
            numeroOrigen = facturaProforma.numero,
            tipoDestino = "ALBARAN",
            idDestino = albaranFinal.id,
            numeroDestino = albaranFinal.numero,
            tipoTransformacion = "CONVERTIR",
            fechaTransformacion = java.time.LocalDateTime.now()
        )
        documentoTransformacionRepository.save(transformacion)

        return ResponseEntity.ok(albaranFinal)
    }
}
