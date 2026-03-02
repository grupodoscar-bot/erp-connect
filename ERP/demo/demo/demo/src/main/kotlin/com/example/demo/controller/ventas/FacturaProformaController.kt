package com.example.demo.controller.ventas

import com.example.demo.model.Almacen
import com.example.demo.model.Cliente
import com.example.demo.model.Producto
import com.example.demo.model.TipoIva
import com.example.demo.model.ventas.*
import com.example.demo.repository.AlmacenRepository
import com.example.demo.repository.ClienteRepository
import com.example.demo.repository.ProductoRepository
import com.example.demo.repository.TipoIvaRepository
import com.example.demo.repository.ventas.*
import com.example.demo.repository.compras.AlbaranCompraRepository
import com.example.demo.repository.compras.FacturaCompraRepository
import com.example.demo.repository.compras.PedidoCompraRepository
import com.example.demo.repository.compras.PresupuestoCompraRepository
import com.example.demo.service.FacturaProformaPdfService
import org.springframework.transaction.annotation.Transactional
import com.example.demo.service.ImpuestoCalculo
import com.example.demo.service.ImpuestoService
import com.example.demo.service.LineaImpuesto
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.time.LocalDate
import java.time.LocalDateTime

@RestController
@RequestMapping("/facturas-proforma")
@CrossOrigin(origins = ["http://145.223.103.219:3000", "http://localhost:3000"])
class FacturaProformaController(
    private val facturaProformaRepository: FacturaProformaRepository,
    private val facturaRepository: FacturaRepository,
    private val facturaRectificativaRepository: FacturaRectificativaRepository,
    private val albaranRepository: AlbaranRepository,
    private val pedidoRepository: PedidoRepository,
    private val presupuestoRepository: PresupuestoRepository,
    private val clienteRepository: ClienteRepository,
    private val productoRepository: ProductoRepository,
    private val tipoIvaRepository: TipoIvaRepository,
    private val almacenRepository: AlmacenRepository,
    private val tarifaRepository: com.example.demo.repository.TarifaRepository,
    private val archivoEmpresaRepository: com.example.demo.repository.ArchivoEmpresaRepository,
    private val facturaProformaPdfService: FacturaProformaPdfService,
    private val impuestoService: ImpuestoService,
    private val serieNumeracionService: com.example.demo.service.SerieNumeracionService,
    private val documentoTransformacionRepository: com.example.demo.repository.ventas.DocumentoTransformacionRepository,
    private val albaranCompraRepository: AlbaranCompraRepository,
    private val facturaCompraRepository: FacturaCompraRepository,
    private val pedidoCompraRepository: PedidoCompraRepository,
    private val presupuestoCompraRepository: PresupuestoCompraRepository
) {

    companion object {
        private const val DOCUMENTO_SERIE_TIPO = "FACTURA_PROFORMA"
    }

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

    private fun construirLineaFacturaProforma(
        factura: FacturaProforma,
        lineaReq: FacturaProformaLineaRequest,
        productoExistente: Producto? = null,
        almacenExistente: Almacen? = null,
        tipoIvaExistente: TipoIva? = null,
        impuestosCalculados: ImpuestoCalculo? = null
    ): FacturaProformaLinea {
        val producto = productoExistente ?: lineaReq.productoId?.let { productoRepository.findById(it).orElse(null) }
        val tipoIva = tipoIvaExistente
            ?: impuestosCalculados?.tipoIva
            ?: lineaReq.tipoIvaId?.let { tipoIvaRepository.findById(it).orElse(null) }
            ?: producto?.tipoIva
        val almacen = almacenExistente ?: lineaReq.almacenId?.let { almacenRepository.findById(it).orElse(null) }

        val nombreProducto = when {
            lineaReq.nombreProducto.isNotBlank() -> lineaReq.nombreProducto
            !producto?.nombre.isNullOrBlank() -> producto?.nombre ?: ""
            else -> ""
        }
        val referencia = lineaReq.referencia ?: producto?.referencia

        val subtotalLinea = lineaReq.cantidad * lineaReq.precioUnitario
        val descuentoImporte = subtotalLinea * (lineaReq.descuento / 100.0)
        val baseLinea = subtotalLinea - descuentoImporte

        val porcentajeIva = impuestosCalculados?.porcentajeIva ?: when {
            lineaReq.porcentajeIva > 0 -> lineaReq.porcentajeIva
            tipoIva?.porcentajeIva != null -> tipoIva.porcentajeIva
            else -> 0.0
        }
        val porcentajeRecargo = impuestosCalculados?.porcentajeRecargo ?: when {
            lineaReq.porcentajeRecargo > 0 -> lineaReq.porcentajeRecargo
            tipoIva?.porcentajeRecargo != null -> tipoIva.porcentajeRecargo
            else -> 0.0
        }

        val importeIva = impuestosCalculados?.importeIva ?: baseLinea * (porcentajeIva / 100.0)
        val importeRecargo = impuestosCalculados?.importeRecargo ?: baseLinea * (porcentajeRecargo / 100.0)

        return FacturaProformaLinea(
            facturaProforma = factura,
            producto = producto,
            nombreProducto = nombreProducto,
            referencia = referencia,
            cantidad = lineaReq.cantidad,
            precioUnitario = lineaReq.precioUnitario,
            descuento = lineaReq.descuento,
            observaciones = lineaReq.observaciones ?: "",
            tipoIva = tipoIva,
            porcentajeIva = porcentajeIva,
            porcentajeRecargo = porcentajeRecargo,
            importeIva = importeIva,
            importeRecargo = importeRecargo,
            almacen = almacen
        )
    }

    private fun calcularLineaConImpuestos(
        lineaReq: FacturaProformaLineaRequest,
        cliente: Cliente?,
        descuentoAgrupacion: Double
    ): LineaImpuesto<FacturaProformaLineaRequest> {
        val producto = lineaReq.productoId?.let { productoRepository.findById(it).orElse(null) }

        val subtotalLinea = lineaReq.cantidad * lineaReq.precioUnitario
        val descuentoLinea = subtotalLinea * (lineaReq.descuento / 100.0)
        val baseAntesAgrupacion = subtotalLinea - descuentoLinea
        val baseLineaConAgrupacion = baseAntesAgrupacion * (1 - descuentoAgrupacion / 100.0)

        val tipoIva = lineaReq.tipoIvaId?.let { tipoIvaRepository.findById(it).orElse(null) }
            ?: producto?.tipoIva

        val porcentajeIva = when {
            lineaReq.porcentajeIva > 0 -> lineaReq.porcentajeIva
            tipoIva?.porcentajeIva != null -> tipoIva.porcentajeIva
            else -> 0.0
        }

        val porcentajeRecargo = when {
            lineaReq.porcentajeRecargo > 0 -> lineaReq.porcentajeRecargo
            cliente?.recargoEquivalencia == true && tipoIva?.porcentajeRecargo != null -> tipoIva.porcentajeRecargo
            else -> 0.0
        }

        val impuestos = ImpuestoCalculo(
            tipoIva = tipoIva,
            porcentajeIva = porcentajeIva,
            porcentajeRecargo = porcentajeRecargo,
            importeIva = baseLineaConAgrupacion * (porcentajeIva / 100.0),
            importeRecargo = baseLineaConAgrupacion * (porcentajeRecargo / 100.0)
        )

        return LineaImpuesto(lineaReq, producto, impuestos)
    }

    @GetMapping
    fun listarTodas(): List<FacturaProforma> =
        facturaProformaRepository.findAll()

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
            org.springframework.data.domain.Sort.by(sortBy).ascending()
        } else {
            org.springframework.data.domain.Sort.by(sortBy).descending()
        }

        val pageRequest = org.springframework.data.domain.PageRequest.of(page, size, sort)
        val facturasPage = facturaProformaRepository.findAll(pageRequest)

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
    fun obtenerPorId(@PathVariable id: Long): ResponseEntity<FacturaProforma> {
        val factura = facturaProformaRepository.findByIdWithLineas(id)
        return if (factura != null) {
            cargarAdjuntos(factura)
            ResponseEntity.ok(factura)
        } else {
            ResponseEntity.notFound().build()
        }
    }

    @GetMapping("/siguiente-numero")
    fun obtenerSiguienteNumero(@RequestParam(required = false) serieId: Long?): ResponseEntity<Map<String, Any>> {
        val numeracion = serieNumeracionService.generarYReservarNumero(DOCUMENTO_SERIE_TIPO, serieId)
        return ResponseEntity.ok(mapOf(
            "numero" to numeracion.codigo,
            "serie" to mapOf(
                "id" to (numeracion.serie?.id ?: 0),
                "prefijo" to (numeracion.serie?.prefijo ?: ""),
                "descripcion" to (numeracion.serie?.descripcion ?: "")
            )
        ))
    }

    @PostMapping
    fun crear(@RequestBody request: FacturaProformaRequest): ResponseEntity<FacturaProforma> {
        val cliente = request.clienteId?.let { clienteRepository.findById(it).orElse(null) }
        
        val numeracion = serieNumeracionService.generarYReservarNumero(DOCUMENTO_SERIE_TIPO, request.serieId)

        val lineasCalculadas = request.lineas.map { calcularLineaConImpuestos(it, cliente, request.descuentoAgrupacion) }

        val subtotal = lineasCalculadas.sumOf { it.request.cantidad * it.request.precioUnitario }
        val descuentoTotal = lineasCalculadas.sumOf {
            (it.request.cantidad * it.request.precioUnitario) * (it.request.descuento / 100)
        }
        val baseAntesAgrupacion = subtotal - descuentoTotal
        val descuentoAgrupacionImporte = baseAntesAgrupacion * (request.descuentoAgrupacion / 100)
        val baseImponible = baseAntesAgrupacion - descuentoAgrupacionImporte
        val impuestosTotales = lineasCalculadas.sumOf { lineaCalc ->
            lineaCalc.impuestos.importeIva + lineaCalc.impuestos.importeRecargo
        }
        val total = baseImponible + impuestosTotales
        
        val nuevaFacturaProforma = FacturaProforma(
            numero = numeracion.codigo,
            fecha = parsearFecha(request.fecha?.toString()),
            cliente = cliente,
            observaciones = request.observaciones ?: "",
            notas = request.notas ?: "",
            estado = request.estado ?: "Pendiente",
            subtotal = subtotal,
            descuentoTotal = descuentoTotal,
            total = total,
            descuentoAgrupacion = request.descuentoAgrupacion,
            serie = numeracion.serie,
            anioDocumento = numeracion.anio,
            numeroSecuencial = numeracion.secuencial,
            codigoDocumento = numeracion.codigo,
            // Almacen, tarifa y venta multialmacen
            almacen = request.almacenId?.let { almacenRepository.findById(it).orElse(null) },
            tarifa = request.tarifaId?.let { tarifaRepository.findById(it).orElse(null) },
            ventaMultialmacen = request.ventaMultialmacen ?: false,
            // Snapshots de cliente
            clienteNombreComercial = request.clienteNombreComercial,
            clienteNombreFiscal = request.clienteNombreFiscal,
            clienteNifCif = request.clienteNifCif,
            clienteEmail = request.clienteEmail,
            clienteTelefono = request.clienteTelefono,
            // Snapshots de dirección de facturación
            direccionFacturacionPais = request.direccionFacturacionPais,
            direccionFacturacionCodigoPostal = request.direccionFacturacionCodigoPostal,
            direccionFacturacionProvincia = request.direccionFacturacionProvincia,
            direccionFacturacionPoblacion = request.direccionFacturacionPoblacion,
            direccionFacturacionDireccion = request.direccionFacturacionDireccion,
            // Snapshots de dirección de envío
            direccionEnvioPais = request.direccionEnvioPais,
            direccionEnvioCodigoPostal = request.direccionEnvioCodigoPostal,
            direccionEnvioProvincia = request.direccionEnvioProvincia,
            direccionEnvioPoblacion = request.direccionEnvioPoblacion,
            direccionEnvioDireccion = request.direccionEnvioDireccion
        )
        
        val facturaProformaGuardada = facturaProformaRepository.save(nuevaFacturaProforma)
        
        lineasCalculadas.forEach { lineaCalc ->
            facturaProformaGuardada.lineas.add(
                construirLineaFacturaProforma(
                    factura = facturaProformaGuardada,
                    lineaReq = lineaCalc.request,
                    productoExistente = lineaCalc.producto,
                    tipoIvaExistente = lineaCalc.impuestos.tipoIva,
                    impuestosCalculados = lineaCalc.impuestos
                )
            )
        }
        
        return ResponseEntity.ok(facturaProformaRepository.save(facturaProformaGuardada))
    }

    @PutMapping("/{id}")
    fun actualizar(
        @PathVariable id: Long,
        @RequestBody datos: FacturaProformaRequest
    ): ResponseEntity<FacturaProforma> {
        // DEBUG: Log datos recibidos
        println("DEBUG - Datos recibidos en actualizar:")
        println("  almacenId: ${datos.almacenId}")
        println("  ventaMultialmacen: ${datos.ventaMultialmacen}")
        println("  tarifaId: ${datos.tarifaId}")
        println("  direccionFacturacionPais: ${datos.direccionFacturacionPais}")
        println("  direccionFacturacionDireccion: ${datos.direccionFacturacionDireccion}")
        println("  direccionEnvioPais: ${datos.direccionEnvioPais}")
        println("  direccionEnvioDireccion: ${datos.direccionEnvioDireccion}")
        
        return facturaProformaRepository.findById(id)
            .map { existente ->
                val cliente = datos.clienteId?.let { clienteRepository.findById(it).orElse(null) }
                
                val lineasCalculadas = datos.lineas.map { calcularLineaConImpuestos(it, cliente, datos.descuentoAgrupacion) }

                val subtotal = lineasCalculadas.sumOf { it.request.cantidad * it.request.precioUnitario }
                val descuentoTotal = lineasCalculadas.sumOf {
                    (it.request.cantidad * it.request.precioUnitario) * (it.request.descuento / 100)
                }
                val baseAntesAgrupacion = subtotal - descuentoTotal
                val descuentoAgrupacionImporte = baseAntesAgrupacion * (datos.descuentoAgrupacion / 100)
                val baseImponible = baseAntesAgrupacion - descuentoAgrupacionImporte
                val impuestosTotales = lineasCalculadas.sumOf { lineaCalc ->
                    lineaCalc.impuestos.importeIva + lineaCalc.impuestos.importeRecargo
                }
                val total = baseImponible + impuestosTotales
                
                // Determinar almacén: usar el del request, mantener el existente, o usar el primero disponible
                val almacen = datos.almacenId?.let { almacenRepository.findById(it).orElse(null) }
                    ?: existente.almacen
                    ?: almacenRepository.findAll().firstOrNull()
                
                // Limpiar líneas existentes primero
                existente.lineas.clear()
                
                // Crear copia actualizada
                val actualizada = existente.copy(
                    fecha = parsearFecha(datos.fecha?.toString()),
                    cliente = cliente,
                    observaciones = datos.observaciones,
                    notas = datos.notas,
                    estado = datos.estado,
                    subtotal = subtotal,
                    descuentoTotal = descuentoTotal,
                    total = total,
                    descuentoAgrupacion = datos.descuentoAgrupacion,
                    almacen = almacen,
                    ventaMultialmacen = datos.ventaMultialmacen ?: existente.ventaMultialmacen,
                    tarifa = datos.tarifaId?.let { tarifaRepository.findById(it).orElse(null) } ?: existente.tarifa,
                    // Snapshots de dirección de facturación
                    direccionFacturacionPais = datos.direccionFacturacionPais,
                    direccionFacturacionCodigoPostal = datos.direccionFacturacionCodigoPostal,
                    direccionFacturacionProvincia = datos.direccionFacturacionProvincia,
                    direccionFacturacionPoblacion = datos.direccionFacturacionPoblacion,
                    direccionFacturacionDireccion = datos.direccionFacturacionDireccion,
                    // Snapshots de dirección de envío
                    direccionEnvioPais = datos.direccionEnvioPais,
                    direccionEnvioCodigoPostal = datos.direccionEnvioCodigoPostal,
                    direccionEnvioProvincia = datos.direccionEnvioProvincia,
                    direccionEnvioPoblacion = datos.direccionEnvioPoblacion,
                    direccionEnvioDireccion = datos.direccionEnvioDireccion
                )
                
                // Guardar primero la factura actualizada
                val facturaSaved = facturaProformaRepository.save(actualizada)
                
                // Ahora agregar las líneas a la factura guardada
                lineasCalculadas.forEach { lineaCalc ->
                    // Heredar almacén si no se especifica
                    val almacenLinea = lineaCalc.request.almacenId?.let { almacenRepository.findById(it).orElse(null) }
                        ?: almacen
                    
                    facturaSaved.lineas.add(
                        construirLineaFacturaProforma(
                            factura = facturaSaved,
                            lineaReq = lineaCalc.request,
                            productoExistente = lineaCalc.producto,
                            almacenExistente = almacenLinea,
                            tipoIvaExistente = lineaCalc.impuestos.tipoIva,
                            impuestosCalculados = lineaCalc.impuestos
                        )
                    )
                }
                
                ResponseEntity.ok(facturaProformaRepository.save(facturaSaved))
            }
            .orElse(ResponseEntity.notFound().build())
    }

    @DeleteMapping("/{id}")
    fun borrar(@PathVariable id: Long): ResponseEntity<Any> {
        if (!facturaProformaRepository.existsById(id)) {
            return ResponseEntity.notFound().build()
        }
        facturaProformaRepository.deleteById(id)
        return ResponseEntity.noContent().build()
    }

    @PostMapping("/desde-pedido")
    @org.springframework.transaction.annotation.Transactional
    fun crearDesdePedido(@RequestBody request: TransformarAlbaranRequest): ResponseEntity<Any> {
        val pedido = pedidoRepository.findById(request.pedidoId ?: return ResponseEntity.badRequest().body(mapOf("error" to "ID de pedido requerido"))).orElse(null)
            ?: return ResponseEntity.badRequest().body(mapOf("error" to "Pedido no encontrado"))

        val numeracion = serieNumeracionService.generarYReservarNumero(DOCUMENTO_SERIE_TIPO, request.serieId)

        val subtotal = pedido.lineas.sumOf { it.cantidad * it.precioUnitario }
        val descuentoTotal = pedido.lineas.sumOf { (it.cantidad * it.precioUnitario) * (it.descuento / 100) }
        val total = subtotal - descuentoTotal

        val nuevaFacturaProforma = FacturaProforma(
            numero = numeracion.codigo,
            fecha = parsearFecha(request.fecha?.toString()),
            cliente = pedido.cliente,
            pedido = pedido,
            observaciones = pedido.observaciones ?: "",
            estado = request.estado ?: "Pendiente",
            subtotal = subtotal,
            descuentoTotal = descuentoTotal,
            total = total,
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

        val facturaProformaGuardada = facturaProformaRepository.save(nuevaFacturaProforma)

        pedido.lineas.forEach { lineaPedido ->
            val lineaReq = FacturaProformaLineaRequest(
                productoId = lineaPedido.producto?.id,
                nombreProducto = lineaPedido.nombreProducto ?: "",
                referencia = lineaPedido.referencia,
                cantidad = lineaPedido.cantidad,
                precioUnitario = lineaPedido.precioUnitario,
                descuento = lineaPedido.descuento,
                observaciones = lineaPedido.observaciones ?: "",
                tipoIvaId = lineaPedido.tipoIva?.id,
                porcentajeIva = lineaPedido.porcentajeIva,
                porcentajeRecargo = lineaPedido.porcentajeRecargo,
                importeIva = lineaPedido.importeIva,
                importeRecargo = lineaPedido.importeRecargo,
                almacenId = lineaPedido.almacen?.id
            )
            val impuestos = ImpuestoCalculo(
                tipoIva = lineaPedido.tipoIva,
                porcentajeIva = lineaPedido.porcentajeIva,
                porcentajeRecargo = lineaPedido.porcentajeRecargo,
                importeIva = lineaPedido.importeIva,
                importeRecargo = lineaPedido.importeRecargo
            )
            facturaProformaGuardada.lineas.add(
                construirLineaFacturaProforma(
                    factura = facturaProformaGuardada,
                    lineaReq = lineaReq,
                    productoExistente = lineaPedido.producto,
                    almacenExistente = lineaPedido.almacen,
                    tipoIvaExistente = lineaPedido.tipoIva,
                    impuestosCalculados = impuestos
                )
            )
        }

        val facturaProformaFinal = facturaProformaRepository.save(facturaProformaGuardada)

        // Registrar transformación
        val transformacion = com.example.demo.model.ventas.DocumentoTransformacion(
            tipoOrigen = "PEDIDO",
            idOrigen = pedido.id,
            numeroOrigen = pedido.numero,
            tipoDestino = "FACTURA_PROFORMA",
            idDestino = facturaProformaFinal.id,
            numeroDestino = facturaProformaFinal.numero,
            tipoTransformacion = "CONVERTIR",
            fechaTransformacion = java.time.LocalDateTime.now()
        )
        documentoTransformacionRepository.save(transformacion)

        return ResponseEntity.ok(facturaProformaFinal)
    }

    @PostMapping("/desde-albaran")
    @org.springframework.transaction.annotation.Transactional
    fun crearDesdeAlbaran(@RequestBody request: TransformarAlbaranRequest): ResponseEntity<Any> {
        val albaran = albaranRepository.findById(request.albaranId ?: return ResponseEntity.badRequest().body(mapOf("error" to "ID de albarán requerido"))).orElse(null)
            ?: return ResponseEntity.badRequest().body(mapOf("error" to "Albarán no encontrado"))

        val numeracion = serieNumeracionService.generarYReservarNumero(DOCUMENTO_SERIE_TIPO, request.serieId)

        val subtotal = albaran.lineas.sumOf { it.cantidad * it.precioUnitario }
        val descuentoTotal = albaran.lineas.sumOf { (it.cantidad * it.precioUnitario) * (it.descuento / 100) }
        val total = subtotal - descuentoTotal

        val nuevaFacturaProforma = FacturaProforma(
            numero = numeracion.codigo,
            fecha = parsearFecha(request.fecha?.toString()),
            cliente = albaran.cliente,
            albaran = albaran,
            observaciones = albaran.observaciones ?: "",
            estado = request.estado ?: "Pendiente",
            subtotal = subtotal,
            descuentoTotal = descuentoTotal,
            total = total,
            descuentoAgrupacion = request.descuentoAgrupacion,
            almacen = albaran.almacen,
            ventaMultialmacen = albaran.ventaMultialmacen,
            tarifa = albaran.tarifa,
            serie = numeracion.serie,
            anioDocumento = numeracion.anio,
            numeroSecuencial = numeracion.secuencial,
            codigoDocumento = numeracion.codigo,
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

        val facturaProformaGuardada = facturaProformaRepository.save(nuevaFacturaProforma)

        albaran.lineas.forEach { lineaAlbaran ->
            val lineaReq = FacturaProformaLineaRequest(
                productoId = lineaAlbaran.producto?.id,
                nombreProducto = lineaAlbaran.nombreProducto ?: "",
                referencia = lineaAlbaran.referencia,
                cantidad = lineaAlbaran.cantidad,
                precioUnitario = lineaAlbaran.precioUnitario,
                descuento = lineaAlbaran.descuento,
                observaciones = lineaAlbaran.observaciones ?: "",
                tipoIvaId = lineaAlbaran.tipoIva?.id,
                porcentajeIva = lineaAlbaran.porcentajeIva,
                porcentajeRecargo = lineaAlbaran.porcentajeRecargo,
                importeIva = lineaAlbaran.importeIva,
                importeRecargo = lineaAlbaran.importeRecargo,
                almacenId = lineaAlbaran.almacen?.id
            )
            val impuestos = ImpuestoCalculo(
                tipoIva = lineaAlbaran.tipoIva,
                porcentajeIva = lineaAlbaran.porcentajeIva,
                porcentajeRecargo = lineaAlbaran.porcentajeRecargo,
                importeIva = lineaAlbaran.importeIva,
                importeRecargo = lineaAlbaran.importeRecargo
            )
            facturaProformaGuardada.lineas.add(
                construirLineaFacturaProforma(
                    factura = facturaProformaGuardada,
                    lineaReq = lineaReq,
                    productoExistente = lineaAlbaran.producto,
                    almacenExistente = lineaAlbaran.almacen,
                    tipoIvaExistente = lineaAlbaran.tipoIva,
                    impuestosCalculados = impuestos
                )
            )
        }

        val facturaProformaFinal = facturaProformaRepository.save(facturaProformaGuardada)

        // Registrar transformación
        val transformacion = com.example.demo.model.ventas.DocumentoTransformacion(
            tipoOrigen = "ALBARAN",
            idOrigen = albaran.id,
            numeroOrigen = albaran.numero,
            tipoDestino = "FACTURA_PROFORMA",
            idDestino = facturaProformaFinal.id,
            numeroDestino = facturaProformaFinal.numero,
            tipoTransformacion = "CONVERTIR",
            fechaTransformacion = java.time.LocalDateTime.now()
        )
        documentoTransformacionRepository.save(transformacion)

        return ResponseEntity.ok(facturaProformaFinal)
    }


    @GetMapping("/{id}/pdf")
    fun generarPdf(@PathVariable id: Long): ResponseEntity<ByteArray> {
        val facturaProforma = facturaProformaRepository.findById(id)
            .orElseThrow { RuntimeException("Factura proforma no encontrada") }

        val pdfBytes = facturaProformaPdfService.generarPdf(facturaProforma)

        val headers = HttpHeaders()
        headers.contentType = MediaType.APPLICATION_PDF
        headers.setContentDispositionFormData("inline", "factura-proforma-${facturaProforma.numero}.pdf")

        return ResponseEntity.ok()
            .headers(headers)
            .body(pdfBytes)
    }

    @PostMapping("/desde-factura")
    @org.springframework.transaction.annotation.Transactional
    fun crearDesdeFactura(@RequestBody request: TransformarAlbaranRequest): ResponseEntity<Any> {
        val factura = facturaRepository.findById(request.facturaId ?: return ResponseEntity.badRequest().body(mapOf("error" to "ID de factura requerido"))).orElse(null)
            ?: return ResponseEntity.badRequest().body(mapOf("error" to "Factura no encontrada"))

        val numeracion = serieNumeracionService.generarYReservarNumero(DOCUMENTO_SERIE_TIPO, request.serieId)

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

        val nuevaFacturaProforma = FacturaProforma(
            numero = numeracion.codigo,
            fecha = parsearFecha(request.fecha?.toString()),
            cliente = factura.cliente,
            observaciones = factura.observaciones ?: "",
            estado = request.estado ?: "Pendiente",
            subtotal = subtotal,
            descuentoTotal = descuentoTotal,
            total = total,
            descuentoAgrupacion = request.descuentoAgrupacion,
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

        val facturaProformaGuardada = facturaProformaRepository.save(nuevaFacturaProforma)

        factura.lineas.forEach { lineaFactura ->
            val lineaReq = FacturaProformaLineaRequest(
                productoId = lineaFactura.producto?.id,
                nombreProducto = lineaFactura.nombreProducto ?: "",
                referencia = lineaFactura.referencia,
                cantidad = lineaFactura.cantidad,
                precioUnitario = lineaFactura.precioUnitario,
                descuento = lineaFactura.descuento,
                observaciones = lineaFactura.observaciones ?: "",
                tipoIvaId = lineaFactura.tipoIva?.id,
                porcentajeIva = lineaFactura.porcentajeIva,
                porcentajeRecargo = lineaFactura.porcentajeRecargo,
                importeIva = lineaFactura.importeIva,
                importeRecargo = lineaFactura.importeRecargo,
                almacenId = lineaFactura.almacen?.id
            )
            val impuestos = ImpuestoCalculo(
                tipoIva = lineaFactura.tipoIva,
                porcentajeIva = lineaFactura.porcentajeIva,
                porcentajeRecargo = lineaFactura.porcentajeRecargo,
                importeIva = lineaFactura.importeIva,
                importeRecargo = lineaFactura.importeRecargo
            )
            facturaProformaGuardada.lineas.add(
                construirLineaFacturaProforma(
                    factura = facturaProformaGuardada,
                    lineaReq = lineaReq,
                    productoExistente = lineaFactura.producto,
                    almacenExistente = lineaFactura.almacen,
                    tipoIvaExistente = lineaFactura.tipoIva,
                    impuestosCalculados = impuestos
                )
            )
        }

        val facturaProformaFinal = facturaProformaRepository.save(facturaProformaGuardada)

        val transformacion = DocumentoTransformacion(
            tipoOrigen = "FACTURA",
            idOrigen = factura.id,
            numeroOrigen = factura.numero,
            tipoDestino = "FACTURA_PROFORMA",
            idDestino = facturaProformaFinal.id,
            numeroDestino = facturaProformaFinal.numero,
            tipoTransformacion = "CONVERTIR",
            fechaTransformacion = java.time.LocalDateTime.now()
        )
        documentoTransformacionRepository.save(transformacion)

        return ResponseEntity.ok(facturaProformaFinal)
    }

    @PostMapping("/desde-factura-rectificativa")
    @org.springframework.transaction.annotation.Transactional
    fun crearDesdeFacturaRectificativa(@RequestBody request: TransformarAlbaranRequest): ResponseEntity<Any> {
        val facturaRectificativa = facturaRectificativaRepository.findById(request.facturaRectificativaId ?: return ResponseEntity.badRequest().body(mapOf("error" to "ID de factura rectificativa requerido"))).orElse(null)
            ?: return ResponseEntity.badRequest().body(mapOf("error" to "Factura Rectificativa no encontrada"))

        val numeracion = serieNumeracionService.generarYReservarNumero(DOCUMENTO_SERIE_TIPO, request.serieId)

        val nuevaFacturaProforma = FacturaProforma(
            numero = numeracion.codigo,
            fecha = parsearFecha(request.fecha?.toString()),
            cliente = facturaRectificativa.cliente,
            observaciones = facturaRectificativa.observaciones ?: "",
            estado = request.estado ?: "Pendiente",
            subtotal = facturaRectificativa.subtotal,
            descuentoTotal = facturaRectificativa.descuentoTotal,
            total = facturaRectificativa.total,
            descuentoAgrupacion = request.descuentoAgrupacion,
            almacen = facturaRectificativa.almacen,
            ventaMultialmacen = facturaRectificativa.ventaMultialmacen,
            tarifa = facturaRectificativa.tarifa,
            serie = numeracion.serie,
            anioDocumento = numeracion.anio,
            numeroSecuencial = numeracion.secuencial,
            codigoDocumento = numeracion.codigo,
            clienteNombreComercial = facturaRectificativa.clienteNombreComercial,
            clienteNombreFiscal = facturaRectificativa.clienteNombreFiscal,
            clienteNifCif = facturaRectificativa.clienteNifCif,
            clienteEmail = facturaRectificativa.clienteEmail,
            clienteTelefono = facturaRectificativa.clienteTelefono,
            direccionFacturacionPais = facturaRectificativa.direccionFacturacionPais,
            direccionFacturacionCodigoPostal = facturaRectificativa.direccionFacturacionCodigoPostal,
            direccionFacturacionProvincia = facturaRectificativa.direccionFacturacionProvincia,
            direccionFacturacionPoblacion = facturaRectificativa.direccionFacturacionPoblacion,
            direccionFacturacionDireccion = facturaRectificativa.direccionFacturacionDireccion,
            direccionEnvioPais = facturaRectificativa.direccionEnvioPais,
            direccionEnvioCodigoPostal = facturaRectificativa.direccionEnvioCodigoPostal,
            direccionEnvioProvincia = facturaRectificativa.direccionEnvioProvincia,
            direccionEnvioPoblacion = facturaRectificativa.direccionEnvioPoblacion,
            direccionEnvioDireccion = facturaRectificativa.direccionEnvioDireccion
        )

        val facturaProformaGuardada = facturaProformaRepository.save(nuevaFacturaProforma)

        facturaRectificativa.lineas.forEach { lineaFacturaRectificativa ->
            val lineaReq = FacturaProformaLineaRequest(
                productoId = lineaFacturaRectificativa.producto?.id,
                nombreProducto = lineaFacturaRectificativa.nombreProducto ?: "",
                referencia = lineaFacturaRectificativa.referencia,
                cantidad = lineaFacturaRectificativa.cantidad,
                precioUnitario = lineaFacturaRectificativa.precioUnitario,
                descuento = lineaFacturaRectificativa.descuento,
                observaciones = lineaFacturaRectificativa.observaciones ?: "",
                tipoIvaId = lineaFacturaRectificativa.tipoIva?.id,
                porcentajeIva = lineaFacturaRectificativa.porcentajeIva,
                porcentajeRecargo = lineaFacturaRectificativa.porcentajeRecargo,
                importeIva = lineaFacturaRectificativa.importeIva,
                importeRecargo = lineaFacturaRectificativa.importeRecargo,
                almacenId = lineaFacturaRectificativa.almacen?.id
            )
            val impuestos = ImpuestoCalculo(
                tipoIva = lineaFacturaRectificativa.tipoIva,
                porcentajeIva = lineaFacturaRectificativa.porcentajeIva,
                porcentajeRecargo = lineaFacturaRectificativa.porcentajeRecargo,
                importeIva = lineaFacturaRectificativa.importeIva,
                importeRecargo = lineaFacturaRectificativa.importeRecargo
            )
            facturaProformaGuardada.lineas.add(
                construirLineaFacturaProforma(
                    factura = facturaProformaGuardada,
                    lineaReq = lineaReq,
                    productoExistente = lineaFacturaRectificativa.producto,
                    almacenExistente = lineaFacturaRectificativa.almacen,
                    tipoIvaExistente = lineaFacturaRectificativa.tipoIva,
                    impuestosCalculados = impuestos
                )
            )
        }

        val facturaProformaFinal = facturaProformaRepository.save(facturaProformaGuardada)

        val transformacion = com.example.demo.model.ventas.DocumentoTransformacion(
            tipoOrigen = "FACTURA_RECTIFICATIVA",
            idOrigen = facturaRectificativa.id,
            numeroOrigen = facturaRectificativa.numero,
            tipoDestino = "FACTURA_PROFORMA",
            idDestino = facturaProformaFinal.id,
            numeroDestino = facturaProformaFinal.numero,
            tipoTransformacion = "CONVERTIR",
            fechaTransformacion = java.time.LocalDateTime.now()
        )
        documentoTransformacionRepository.save(transformacion)

        return ResponseEntity.ok(facturaProformaFinal)
    }

    @PostMapping("/desde-presupuesto")
    @org.springframework.transaction.annotation.Transactional
    fun crearDesdePresupuesto(@RequestBody request: TransformarAlbaranRequest): ResponseEntity<Any> {
        val presupuesto = presupuestoRepository.findById(request.presupuestoId ?: return ResponseEntity.badRequest().body(mapOf("error" to "ID de presupuesto requerido"))).orElse(null)
            ?: return ResponseEntity.badRequest().body(mapOf("error" to "Presupuesto no encontrado"))

        val numeracion = serieNumeracionService.generarYReservarNumero(DOCUMENTO_SERIE_TIPO, request.serieId)

        val nuevaFacturaProforma = FacturaProforma(
            numero = numeracion.codigo,
            fecha = parsearFecha(request.fecha?.toString()),
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

        val facturaProformaGuardada = facturaProformaRepository.save(nuevaFacturaProforma)

        presupuesto.lineas.forEach { lineaPresupuesto ->
            val lineaReq = FacturaProformaLineaRequest(
                productoId = lineaPresupuesto.producto?.id,
                nombreProducto = lineaPresupuesto.nombreProducto ?: "",
                referencia = lineaPresupuesto.referencia,
                cantidad = lineaPresupuesto.cantidad,
                precioUnitario = lineaPresupuesto.precioUnitario,
                descuento = lineaPresupuesto.descuento,
                observaciones = lineaPresupuesto.observaciones ?: "",
                tipoIvaId = lineaPresupuesto.tipoIva?.id,
                porcentajeIva = lineaPresupuesto.porcentajeIva,
                porcentajeRecargo = lineaPresupuesto.porcentajeRecargo,
                importeIva = lineaPresupuesto.importeIva,
                importeRecargo = lineaPresupuesto.importeRecargo,
                almacenId = lineaPresupuesto.almacen?.id
            )
            val impuestos = ImpuestoCalculo(
                tipoIva = lineaPresupuesto.tipoIva,
                porcentajeIva = lineaPresupuesto.porcentajeIva,
                porcentajeRecargo = lineaPresupuesto.porcentajeRecargo,
                importeIva = lineaPresupuesto.importeIva,
                importeRecargo = lineaPresupuesto.importeRecargo
            )
            facturaProformaGuardada.lineas.add(
                construirLineaFacturaProforma(
                    factura = facturaProformaGuardada,
                    lineaReq = lineaReq,
                    productoExistente = lineaPresupuesto.producto,
                    almacenExistente = lineaPresupuesto.almacen,
                    tipoIvaExistente = lineaPresupuesto.tipoIva,
                    impuestosCalculados = impuestos
                )
            )
        }

        val facturaProformaFinal = facturaProformaRepository.save(facturaProformaGuardada)

        val transformacion = com.example.demo.model.ventas.DocumentoTransformacion(
            tipoOrigen = "PRESUPUESTO",
            idOrigen = presupuesto.id,
            numeroOrigen = presupuesto.numero,
            tipoDestino = "FACTURA_PROFORMA",
            idDestino = facturaProformaFinal.id,
            numeroDestino = facturaProformaFinal.numero,
            tipoTransformacion = "CONVERTIR",
            fechaTransformacion = java.time.LocalDateTime.now()
        )
        documentoTransformacionRepository.save(transformacion)

        return ResponseEntity.ok(facturaProformaFinal)
    }

    @PostMapping("/duplicar")
    @org.springframework.transaction.annotation.Transactional
    fun duplicar(@RequestBody request: TransformarAlbaranRequest): ResponseEntity<Any> {
        val facturaProformaOrigen = facturaProformaRepository.findById(request.facturaProformaId ?: return ResponseEntity.badRequest().body(mapOf("error" to "ID de factura proforma requerido"))).orElse(null)
            ?: return ResponseEntity.badRequest().body(mapOf("error" to "Factura Proforma no encontrada"))

        val numeracion = serieNumeracionService.generarYReservarNumero(DOCUMENTO_SERIE_TIPO, request.serieId)

        val nuevaFacturaProforma = FacturaProforma(
            numero = numeracion.codigo,
            fecha = parsearFecha(request.fecha?.toString()),
            cliente = facturaProformaOrigen.cliente,
            observaciones = facturaProformaOrigen.observaciones ?: "",
            notas = facturaProformaOrigen.notas ?: "",
            estado = request.estado ?: "Pendiente",
            subtotal = facturaProformaOrigen.subtotal,
            descuentoTotal = facturaProformaOrigen.descuentoTotal,
            total = facturaProformaOrigen.total,
            descuentoAgrupacion = request.descuentoAgrupacion,
            almacen = facturaProformaOrigen.almacen,
            ventaMultialmacen = facturaProformaOrigen.ventaMultialmacen,
            tarifa = facturaProformaOrigen.tarifa,
            serie = numeracion.serie,
            anioDocumento = numeracion.anio,
            numeroSecuencial = numeracion.secuencial,
            codigoDocumento = numeracion.codigo,
            clienteNombreComercial = facturaProformaOrigen.clienteNombreComercial,
            clienteNombreFiscal = facturaProformaOrigen.clienteNombreFiscal,
            clienteNifCif = facturaProformaOrigen.clienteNifCif,
            clienteEmail = facturaProformaOrigen.clienteEmail,
            clienteTelefono = facturaProformaOrigen.clienteTelefono,
            direccionFacturacionPais = facturaProformaOrigen.direccionFacturacionPais,
            direccionFacturacionCodigoPostal = facturaProformaOrigen.direccionFacturacionCodigoPostal,
            direccionFacturacionProvincia = facturaProformaOrigen.direccionFacturacionProvincia,
            direccionFacturacionPoblacion = facturaProformaOrigen.direccionFacturacionPoblacion,
            direccionFacturacionDireccion = facturaProformaOrigen.direccionFacturacionDireccion,
            direccionEnvioPais = facturaProformaOrigen.direccionEnvioPais,
            direccionEnvioCodigoPostal = facturaProformaOrigen.direccionEnvioCodigoPostal,
            direccionEnvioProvincia = facturaProformaOrigen.direccionEnvioProvincia,
            direccionEnvioPoblacion = facturaProformaOrigen.direccionEnvioPoblacion,
            direccionEnvioDireccion = facturaProformaOrigen.direccionEnvioDireccion
        )

        val facturaProformaGuardada = facturaProformaRepository.save(nuevaFacturaProforma)

        facturaProformaOrigen.lineas.forEach { lineaOrigen ->
            val lineaReq = FacturaProformaLineaRequest(
                productoId = lineaOrigen.producto?.id,
                nombreProducto = lineaOrigen.nombreProducto ?: "",
                referencia = lineaOrigen.referencia,
                cantidad = lineaOrigen.cantidad,
                precioUnitario = lineaOrigen.precioUnitario,
                descuento = lineaOrigen.descuento,
                observaciones = lineaOrigen.observaciones ?: "",
                tipoIvaId = lineaOrigen.tipoIva?.id,
                porcentajeIva = lineaOrigen.porcentajeIva,
                porcentajeRecargo = lineaOrigen.porcentajeRecargo,
                importeIva = lineaOrigen.importeIva,
                importeRecargo = lineaOrigen.importeRecargo,
                almacenId = lineaOrigen.almacen?.id
            )
            val impuestos = ImpuestoCalculo(
                tipoIva = lineaOrigen.tipoIva,
                porcentajeIva = lineaOrigen.porcentajeIva,
                porcentajeRecargo = lineaOrigen.porcentajeRecargo,
                importeIva = lineaOrigen.importeIva,
                importeRecargo = lineaOrigen.importeRecargo
            )
            facturaProformaGuardada.lineas.add(
                construirLineaFacturaProforma(
                    factura = facturaProformaGuardada,
                    lineaReq = lineaReq,
                    productoExistente = lineaOrigen.producto,
                    almacenExistente = lineaOrigen.almacen,
                    tipoIvaExistente = lineaOrigen.tipoIva,
                    impuestosCalculados = impuestos
                )
            )
        }

        val facturaProformaFinal = facturaProformaRepository.save(facturaProformaGuardada)

        // Duplicar no registra transformación - se trata como documento nuevo/manual
        return ResponseEntity.ok(facturaProformaFinal)
    }

    // Función auxiliar para calcular totales
    private fun calcularTotales(lineas: List<LineaCalculada>, descuentoAgrupacion: Double): Totales {
        val subtotal = lineas.sumOf { it.cantidad * it.precioUnitario }
        val descuentoTotal = lineas.sumOf { (it.cantidad * it.precioUnitario) * (it.descuento / 100) }
        val baseAntesAgrupacion = subtotal - descuentoTotal
        val descuentoAgrupacionImporte = baseAntesAgrupacion * (descuentoAgrupacion / 100)
        val baseImponible = baseAntesAgrupacion - descuentoAgrupacionImporte
        val impuestosTotales = lineas.sumOf { linea ->
            val baseLineaSinAgrupacion = (linea.cantidad * linea.precioUnitario) * (1 - linea.descuento / 100)
            val baseLineaConAgrupacion = baseLineaSinAgrupacion * (1 - descuentoAgrupacion / 100)
            val ivaLinea = baseLineaConAgrupacion * (linea.porcentajeIva / 100)
            val recargoLinea = baseLineaConAgrupacion * (linea.porcentajeRecargo / 100)
            ivaLinea + recargoLinea
        }
        val total = baseImponible + impuestosTotales

        return Totales(subtotal, descuentoTotal, total)
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
        val tipoIva: TipoIva?,
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

    @PostMapping("/transformar")
    @Transactional
    fun transformarDocumento(@RequestBody request: TransformarDocumentoRequest): ResponseEntity<Any> {
        data class LineaOrigen(val producto: Producto?, val nombreProducto: String, val referencia: String?, val cantidad: Double, val precioUnitario: Double, val descuento: Double, val observaciones: String?, val tipoIva: TipoIva?, val porcentajeIva: Double, val porcentajeRecargo: Double, val importeIva: Double, val importeRecargo: Double, val almacen: Almacen?)
        data class DatosOrigen(val cliente: Cliente?, val lineas: List<LineaOrigen>, val descuentoAgrupacion: Double, val almacen: Almacen?, val tarifa: com.example.demo.model.Tarifa?, val ventaMultialmacen: Boolean, val observaciones: String?, val notas: String?, val clienteNombreComercial: String?, val clienteNombreFiscal: String?, val clienteNifCif: String?, val clienteEmail: String?, val clienteTelefono: String?, val direccionFacturacionPais: String?, val direccionFacturacionCodigoPostal: String?, val direccionFacturacionProvincia: String?, val direccionFacturacionPoblacion: String?, val direccionFacturacionDireccion: String?, val direccionEnvioPais: String?, val direccionEnvioCodigoPostal: String?, val direccionEnvioProvincia: String?, val direccionEnvioPoblacion: String?, val direccionEnvioDireccion: String?)

        val datos: DatosOrigen = when (request.tipoOrigen) {
            "PRESUPUESTO" -> { val o = presupuestoRepository.findById(request.idOrigen).orElse(null) ?: return ResponseEntity.badRequest().body(mapOf("error" to "Presupuesto no encontrado")); DatosOrigen(o.cliente, o.lineas.map { LineaOrigen(it.producto, it.nombreProducto, it.referencia, it.cantidad.toDouble(), it.precioUnitario, it.descuento, it.observaciones, it.tipoIva, it.porcentajeIva, it.porcentajeRecargo, it.importeIva, it.importeRecargo, it.almacen) }, o.descuentoAgrupacion, o.almacen, o.tarifa, o.ventaMultialmacen, o.observaciones, o.notas, o.clienteNombreComercial, o.clienteNombreFiscal, o.clienteNifCif, o.clienteEmail, o.clienteTelefono, o.direccionFacturacionPais, o.direccionFacturacionCodigoPostal, o.direccionFacturacionProvincia, o.direccionFacturacionPoblacion, o.direccionFacturacionDireccion, o.direccionEnvioPais, o.direccionEnvioCodigoPostal, o.direccionEnvioProvincia, o.direccionEnvioPoblacion, o.direccionEnvioDireccion) }
            "PEDIDO" -> { val o = pedidoRepository.findById(request.idOrigen).orElse(null) ?: return ResponseEntity.badRequest().body(mapOf("error" to "Pedido no encontrado")); DatosOrigen(o.cliente, o.lineas.map { LineaOrigen(it.producto, it.nombreProducto, it.referencia, it.cantidad.toDouble(), it.precioUnitario, it.descuento, it.observaciones, it.tipoIva, it.porcentajeIva, it.porcentajeRecargo, it.importeIva, it.importeRecargo, it.almacen) }, o.descuentoAgrupacion, o.almacen, o.tarifa, o.ventaMultialmacen ?: false, o.observaciones, o.notas, o.clienteNombreComercial, o.clienteNombreFiscal, o.clienteNifCif, o.clienteEmail, o.clienteTelefono, o.direccionFacturacionPais, o.direccionFacturacionCodigoPostal, o.direccionFacturacionProvincia, o.direccionFacturacionPoblacion, o.direccionFacturacionDireccion, o.direccionEnvioPais, o.direccionEnvioCodigoPostal, o.direccionEnvioProvincia, o.direccionEnvioPoblacion, o.direccionEnvioDireccion) }
            "ALBARAN" -> { val o = albaranRepository.findById(request.idOrigen).orElse(null) ?: return ResponseEntity.badRequest().body(mapOf("error" to "Albarán no encontrado")); DatosOrigen(o.cliente, o.lineas.map { LineaOrigen(it.producto, it.nombreProducto, it.referencia, it.cantidad.toDouble(), it.precioUnitario, it.descuento, it.observaciones, it.tipoIva, it.porcentajeIva, it.porcentajeRecargo, it.importeIva, it.importeRecargo, it.almacen) }, o.descuentoAgrupacion, o.almacen, o.tarifa, o.ventaMultialmacen, o.observaciones, o.notas, o.clienteNombreComercial, o.clienteNombreFiscal, o.clienteNifCif, o.clienteEmail, o.clienteTelefono, o.direccionFacturacionPais, o.direccionFacturacionCodigoPostal, o.direccionFacturacionProvincia, o.direccionFacturacionPoblacion, o.direccionFacturacionDireccion, o.direccionEnvioPais, o.direccionEnvioCodigoPostal, o.direccionEnvioProvincia, o.direccionEnvioPoblacion, o.direccionEnvioDireccion) }
            "FACTURA" -> { val o = facturaRepository.findById(request.idOrigen).orElse(null) ?: return ResponseEntity.badRequest().body(mapOf("error" to "Factura no encontrada")); DatosOrigen(o.cliente, o.lineas.map { LineaOrigen(it.producto, it.nombreProducto, it.referencia, it.cantidad.toDouble(), it.precioUnitario, it.descuento, it.observaciones, it.tipoIva, it.porcentajeIva, it.porcentajeRecargo, it.importeIva, it.importeRecargo, it.almacen) }, o.descuentoAgrupacion, o.almacen, o.tarifa, o.ventaMultialmacen ?: false, o.observaciones, o.notas, o.clienteNombreComercial, o.clienteNombreFiscal, o.clienteNifCif, o.clienteEmail, o.clienteTelefono, o.direccionFacturacionPais, o.direccionFacturacionCodigoPostal, o.direccionFacturacionProvincia, o.direccionFacturacionPoblacion, o.direccionFacturacionDireccion, o.direccionEnvioPais, o.direccionEnvioCodigoPostal, o.direccionEnvioProvincia, o.direccionEnvioPoblacion, o.direccionEnvioDireccion) }
            "FACTURA_PROFORMA" -> { val o = facturaProformaRepository.findById(request.idOrigen).orElse(null) ?: return ResponseEntity.badRequest().body(mapOf("error" to "Factura proforma no encontrada")); DatosOrigen(o.cliente, o.lineas.map { LineaOrigen(it.producto, it.nombreProducto, it.referencia, it.cantidad.toDouble(), it.precioUnitario, it.descuento, it.observaciones, it.tipoIva, it.porcentajeIva, it.porcentajeRecargo, it.importeIva, it.importeRecargo, it.almacen) }, o.descuentoAgrupacion, o.almacen, o.tarifa, o.ventaMultialmacen, o.observaciones, o.notas, o.clienteNombreComercial, o.clienteNombreFiscal, o.clienteNifCif, o.clienteEmail, o.clienteTelefono, o.direccionFacturacionPais, o.direccionFacturacionCodigoPostal, o.direccionFacturacionProvincia, o.direccionFacturacionPoblacion, o.direccionFacturacionDireccion, o.direccionEnvioPais, o.direccionEnvioCodigoPostal, o.direccionEnvioProvincia, o.direccionEnvioPoblacion, o.direccionEnvioDireccion) }
            "FACTURA_RECTIFICATIVA" -> { val o = facturaRectificativaRepository.findById(request.idOrigen).orElse(null) ?: return ResponseEntity.badRequest().body(mapOf("error" to "Factura rectificativa no encontrada")); DatosOrigen(o.cliente, o.lineas.map { LineaOrigen(it.producto, it.nombreProducto, it.referencia, it.cantidad.toDouble(), it.precioUnitario, it.descuento, it.observaciones, it.tipoIva, it.porcentajeIva, it.porcentajeRecargo, it.importeIva, it.importeRecargo, it.almacen) }, o.descuentoAgrupacion ?: 0.0, o.almacen, null, false, o.observaciones, o.notas, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null) }
            // Factura Proforma NO acepta orígenes de compra
            "PRESUPUESTO_COMPRA", "PEDIDO_COMPRA", "ALBARAN_COMPRA", "FACTURA_COMPRA" -> return ResponseEntity.badRequest().body(mapOf("error" to "Factura Proforma no acepta orígenes de documentos de compra"))
            else -> return ResponseEntity.badRequest().body(mapOf("error" to "Tipo de origen no soportado: ${request.tipoOrigen}"))
        }

        val numeracion = serieNumeracionService.generarYReservarNumero(DOCUMENTO_SERIE_TIPO, request.serieId)
        val fechaTransformada = parsearFecha(request.fecha)
        val subtotal = datos.lineas.sumOf { it.cantidad * it.precioUnitario }
        val descuentoTotal = datos.lineas.sumOf { (it.cantidad * it.precioUnitario) * (it.descuento / 100) }
        val baseImponible = (subtotal - descuentoTotal) * (1 - datos.descuentoAgrupacion / 100)
        val impuestosTotales = datos.lineas.sumOf { l -> val base = (l.cantidad * l.precioUnitario) * (1 - l.descuento / 100) * (1 - datos.descuentoAgrupacion / 100); base * (l.porcentajeIva + l.porcentajeRecargo) / 100 }
        val total = baseImponible + impuestosTotales

        val nuevaFacturaProforma = FacturaProforma(
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

        val proformaGuardada = facturaProformaRepository.save(nuevaFacturaProforma)

        datos.lineas.forEach { linea ->
            proformaGuardada.lineas.add(FacturaProformaLinea(
                facturaProforma = proformaGuardada,
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

        val proformaFinal = facturaProformaRepository.save(proformaGuardada)

        if (!request.esDuplicacion) {
            documentoTransformacionRepository.save(DocumentoTransformacion(
                tipoOrigen = request.tipoOrigen,
                idOrigen = request.idOrigen,
                numeroOrigen = null,
                tipoDestino = "FACTURA_PROFORMA",
                idDestino = proformaFinal.id,
                numeroDestino = proformaFinal.numero,
                tipoTransformacion = "CONVERTIR",
                fechaTransformacion = LocalDateTime.now()
            ))
        }

        return ResponseEntity.ok(proformaFinal)
    }

    // ========== ADJUNTOS ==========
    private fun cargarAdjuntos(facturaProforma: FacturaProforma): FacturaProforma {
        facturaProforma.adjuntos = obtenerAdjuntos(facturaProforma.id)
        return facturaProforma
    }

    private fun obtenerAdjuntos(facturaProformaId: Long): List<com.example.demo.model.ArchivoEmpresa> {
        return archivoEmpresaRepository.findByDocumentoOrigenAndDocumentoOrigenId("FACTURA_PROFORMA", facturaProformaId)
    }

    private fun actualizarAdjuntosFacturaProforma(facturaProformaId: Long, adjuntosIds: List<Long>) {
        // Primero, desvincular todos los adjuntos existentes de esta factura proforma
        val adjuntosExistentes = archivoEmpresaRepository.findByDocumentoOrigenAndDocumentoOrigenId("FACTURA_PROFORMA", facturaProformaId)
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
                    documentoOrigen = "FACTURA_PROFORMA",
                    documentoOrigenId = facturaProformaId
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
            actualizarAdjuntosFacturaProforma(id, adjuntosIds)
            ResponseEntity.ok(mapOf("mensaje" to "Adjuntos actualizados correctamente"))
        } catch (e: Exception) {
            ResponseEntity.status(500).body(mapOf("error" to "Error al actualizar adjuntos: ${e.message}"))
        }
    }
}

