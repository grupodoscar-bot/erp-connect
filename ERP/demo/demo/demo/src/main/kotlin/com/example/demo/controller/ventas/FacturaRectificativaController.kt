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
import com.example.demo.service.FacturaRectificativaPdfService
import com.example.demo.service.ImpuestoCalculo
import com.example.demo.service.ImpuestoService
import com.example.demo.service.LineaImpuesto
import com.example.demo.service.StockService
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.*
import java.time.LocalDate

@RestController
@RequestMapping("/facturas-rectificativas")
@CrossOrigin(origins = ["http://145.223.103.219:3000", "http://localhost:3000"])
class FacturaRectificativaController(
    private val facturaRectificativaRepository: FacturaRectificativaRepository,
    private val facturaRepository: FacturaRepository,
    private val facturaProformaRepository: FacturaProformaRepository,
    private val albaranRepository: AlbaranRepository,
    private val pedidoRepository: PedidoRepository,
    private val presupuestoRepository: PresupuestoRepository,
    private val clienteRepository: ClienteRepository,
    private val productoRepository: ProductoRepository,
    private val tipoIvaRepository: TipoIvaRepository,
    private val almacenRepository: AlmacenRepository,
    private val impuestoService: ImpuestoService,
    private val facturaRectificativaPdfService: FacturaRectificativaPdfService,
    private val serieNumeracionService: com.example.demo.service.SerieNumeracionService,
    private val documentoTransformacionRepository: com.example.demo.repository.ventas.DocumentoTransformacionRepository,
    private val stockService: StockService,
    private val archivoEmpresaRepository: com.example.demo.repository.ArchivoEmpresaRepository,
    private val albaranCompraRepository: AlbaranCompraRepository,
    private val facturaCompraRepository: FacturaCompraRepository,
    private val pedidoCompraRepository: PedidoCompraRepository,
    private val presupuestoCompraRepository: PresupuestoCompraRepository
) {

    companion object {
        private const val DOCUMENTO_SERIE_TIPO = "FACTURA_RECTIFICATIVA"
    }

    private fun parsearFecha(fechaStr: String?): java.time.LocalDateTime {
        if (fechaStr == null) return java.time.LocalDateTime.now()
        return try {
            java.time.LocalDateTime.parse(fechaStr)
        } catch (e: Exception) {
            try {
                LocalDate.parse(fechaStr).atTime(java.time.LocalTime.now())
            } catch (e2: Exception) {
                java.time.LocalDateTime.now()
            }
        }
    }

    private fun construirLineaFacturaRectificativa(
        factura: FacturaRectificativa,
        lineaReq: FacturaRectificativaLineaRequest,
        productoExistente: Producto? = null,
        almacenExistente: Almacen? = null,
        tipoIvaExistente: TipoIva? = null,
        impuestosCalculados: ImpuestoCalculo? = null
    ): FacturaRectificativaLinea {
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

        return FacturaRectificativaLinea(
            facturaRectificativa = factura,
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
        lineaReq: FacturaRectificativaLineaRequest,
        cliente: Cliente?,
        descuentoAgrupacion: Double
    ): LineaImpuesto<FacturaRectificativaLineaRequest> {
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

    /**
     * Valida que las líneas de una factura rectificativa cumplan con las restricciones:
     * 1. Todos los productos deben existir en la factura origen
     * 2. Las cantidades no pueden exceder las de la factura origen
     */
    private fun validarLineasRectificativa(
        lineasRectificativa: List<FacturaRectificativaLineaRequest>,
        facturaOrigen: Factura?
    ) {
        // Si no hay factura origen, no hay restricciones
        if (facturaOrigen == null) return
        
        // Cargar las líneas de la factura origen si no están cargadas
        val facturaConLineas = facturaRepository.findByIdWithLineas(facturaOrigen.id)
            ?: throw IllegalArgumentException("No se pudo cargar la factura origen con sus líneas")
        
        lineasRectificativa.forEach { lineaRect ->
            // Buscar el producto en la factura origen
            val lineaOrigen = facturaConLineas.lineas.find { 
                it.producto?.id == lineaRect.productoId 
            }
            
            if (lineaOrigen == null) {
                val nombreProducto = lineaRect.nombreProducto.ifBlank { 
                    lineaRect.productoId?.let { 
                        productoRepository.findById(it).orElse(null)?.nombre 
                    } ?: "Desconocido"
                }
                throw IllegalArgumentException(
                    "El producto '$nombreProducto' no existe en la factura origen ${facturaConLineas.numero}"
                )
            }
            
            // Validar que la cantidad no exceda la original
            if (lineaRect.cantidad > lineaOrigen.cantidad) {
                val nombreProducto = lineaRect.nombreProducto.ifBlank { lineaOrigen.nombreProducto ?: "Desconocido" }
                throw IllegalArgumentException(
                    "La cantidad de '$nombreProducto' (${lineaRect.cantidad}) excede la cantidad de la factura origen (${lineaOrigen.cantidad})"
                )
            }
        }
    }

    @GetMapping
    fun listarTodas(): List<FacturaRectificativa> =
        facturaRectificativaRepository.findAll()

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
        val facturasPage = facturaRectificativaRepository.findAll(pageRequest)

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
    fun obtenerPorId(@PathVariable id: Long): ResponseEntity<FacturaRectificativa> {
        val factura = facturaRectificativaRepository.findByIdWithLineas(id)
        return if (factura != null) {
            val facturaConAdjuntos = cargarAdjuntos(factura)
            ResponseEntity.ok(facturaConAdjuntos)
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
    fun crear(@RequestBody request: FacturaRectificativaRequest): ResponseEntity<FacturaRectificativa> {
        val cliente = request.clienteId?.let { clienteRepository.findById(it).orElse(null) }
        val facturaOrigen = request.facturaOrigenId?.let { facturaRepository.findById(it).orElse(null) }
        
        // Validar que las líneas cumplan con las restricciones de la factura origen
        validarLineasRectificativa(request.lineas, facturaOrigen)
        
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
        
        // Determinar almacén: usar el del request, heredar de factura origen, o usar el primero disponible
        val almacen = request.almacenId?.let { almacenRepository.findById(it).orElse(null) }
            ?: facturaOrigen?.almacen
            ?: almacenRepository.findAll().firstOrNull()
        
        val nuevaFacturaRectificativa = FacturaRectificativa(
            numero = numeracion.codigo,
            fecha = parsearFecha(request.fecha.toString()),
            cliente = cliente,
            facturaOrigen = facturaOrigen,
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
            almacen = almacen,
            ventaMultialmacen = request.ventaMultialmacen ?: facturaOrigen?.ventaMultialmacen ?: false,
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
        
        val facturaRectificativaGuardada = facturaRectificativaRepository.save(nuevaFacturaRectificativa)
        
        lineasCalculadas.forEach { lineaCalc ->
            // Heredar almacén de la línea de la factura origen si no se especifica
            val almacenLinea = lineaCalc.request.almacenId?.let { almacenRepository.findById(it).orElse(null) }
                ?: facturaOrigen?.lineas?.find { it.producto?.id == lineaCalc.producto?.id }?.almacen
                ?: almacen
            
            facturaRectificativaGuardada.lineas.add(
                construirLineaFacturaRectificativa(
                    factura = facturaRectificativaGuardada,
                    lineaReq = lineaCalc.request,
                    productoExistente = lineaCalc.producto,
                    almacenExistente = almacenLinea,
                    tipoIvaExistente = lineaCalc.impuestos.tipoIva,
                    impuestosCalculados = lineaCalc.impuestos
                )
            )
        }
        
        val facturaFinal = facturaRectificativaRepository.save(facturaRectificativaGuardada)
        
        // Gestionar stock si se crea directamente con estado Emitido
        if (facturaFinal.estado == "Emitido") {
            stockService.gestionarStockFacturaRectificativa(facturaFinal, "INCREMENTAR")
        }
        
        return ResponseEntity.ok(facturaFinal)
    }

    @PutMapping("/{id}")
    @Transactional
    fun actualizar(
        @PathVariable id: Long,
        @RequestBody datos: FacturaRectificativaRequest
    ): ResponseEntity<FacturaRectificativa> {
        return facturaRectificativaRepository.findById(id)
            .map { existente ->
                val cliente = datos.clienteId?.let { clienteRepository.findById(it).orElse(null) }
                val facturaOrigen = datos.facturaOrigenId?.let { facturaRepository.findById(it).orElse(null) }
                
                // Validar que las líneas cumplan con las restricciones de la factura origen
                validarLineasRectificativa(datos.lineas, facturaOrigen)
                
                // Detectar cambio de estado para gestión de stock
                val estadoAnterior = existente.estado
                val estadoNuevo = datos.estado
                val eraEmitido = estadoAnterior == "Emitido"
                val esEmitido = estadoNuevo == "Emitido"
                
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
                
                // Determinar almacén: usar el del request, heredar de factura origen, o mantener el existente
                val almacen = datos.almacenId?.let { almacenRepository.findById(it).orElse(null) }
                    ?: facturaOrigen?.almacen
                    ?: existente.almacen
                    ?: almacenRepository.findAll().firstOrNull()
                
                // Limpiar líneas existentes primero
                existente.lineas.clear()
                
                // Crear copia actualizada
                val actualizada = existente.copy(
                    fecha = parsearFecha(datos.fecha.toString()),
                    cliente = cliente,
                    facturaOrigen = facturaOrigen,
                    observaciones = datos.observaciones,
                    notas = datos.notas,
                    estado = datos.estado,
                    subtotal = subtotal,
                    descuentoTotal = descuentoTotal,
                    total = total,
                    descuentoAgrupacion = datos.descuentoAgrupacion,
                    almacen = almacen,
                    ventaMultialmacen = datos.ventaMultialmacen ?: facturaOrigen?.ventaMultialmacen ?: existente.ventaMultialmacen,
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
                val facturaSaved = facturaRectificativaRepository.save(actualizada)
                
                // Ahora agregar las líneas a la factura guardada
                lineasCalculadas.forEach { lineaCalc ->
                    // Heredar almacén de la línea de la factura origen si no se especifica
                    val almacenLinea = lineaCalc.request.almacenId?.let { almacenRepository.findById(it).orElse(null) }
                        ?: facturaOrigen?.lineas?.find { it.producto?.id == lineaCalc.producto?.id }?.almacen
                        ?: almacen
                    
                    facturaSaved.lineas.add(
                        construirLineaFacturaRectificativa(
                            factura = facturaSaved,
                            lineaReq = lineaCalc.request,
                            productoExistente = lineaCalc.producto,
                            almacenExistente = almacenLinea,
                            tipoIvaExistente = lineaCalc.impuestos.tipoIva,
                            impuestosCalculados = lineaCalc.impuestos
                        )
                    )
                }
                
                val facturaFinal = facturaRectificativaRepository.save(facturaSaved)
                
                // Gestionar stock después de guardar exitosamente
                // Las facturas rectificativas SIEMPRE incrementan stock al emitirse (devolución)
                // y decrementan al salir de emitido (cancelar devolución)
                when {
                    // Cambió de NO emitido a Emitido -> INCREMENTAR stock (devolución)
                    !eraEmitido && esEmitido -> {
                        stockService.gestionarStockFacturaRectificativa(facturaFinal, "INCREMENTAR")
                    }
                    // Era Emitido y cambió a otro estado -> DECREMENTAR stock (cancelar devolución)
                    eraEmitido && !esEmitido -> {
                        stockService.gestionarStockFacturaRectificativa(facturaFinal, "DECREMENTAR")
                    }
                    // Era Emitido y sigue Emitido -> Restaurar stock anterior y aplicar el nuevo
                    eraEmitido && esEmitido -> {
                        // Primero decrementar el stock que se había incrementado
                        stockService.gestionarStockFacturaRectificativa(existente, "DECREMENTAR")
                        // Luego incrementar con las nuevas cantidades
                        stockService.gestionarStockFacturaRectificativa(facturaFinal, "INCREMENTAR")
                    }
                }
                
                ResponseEntity.ok(facturaFinal)
            }
            .orElse(ResponseEntity.notFound().build())
    }

    @DeleteMapping("/{id}")
    fun borrar(@PathVariable id: Long): ResponseEntity<Any> {
        if (!facturaRectificativaRepository.existsById(id)) {
            return ResponseEntity.notFound().build()
        }

        facturaRectificativaRepository.deleteById(id)
        return ResponseEntity.noContent().build()
    }

    @PostMapping("/desde-albaran")
    fun crearDesdeAlbaran(@RequestBody request: TransformarAlbaranRequest): ResponseEntity<Any> {
        val albaran = albaranRepository.findById(request.albaranId ?: return ResponseEntity.badRequest().body(mapOf("error" to "ID de albarán requerido"))).orElse(null)
            ?: return ResponseEntity.badRequest().body(mapOf("error" to "Albarán no encontrado"))

        val numeracion = serieNumeracionService.generarYReservarNumero(DOCUMENTO_SERIE_TIPO, request.serieId)

        val subtotal = albaran.lineas.sumOf { it.cantidad * it.precioUnitario }
        val descuentoTotal = albaran.lineas.sumOf { (it.cantidad * it.precioUnitario) * (it.descuento / 100) }
        val baseAntesAgrupacion = subtotal - descuentoTotal
        val descuentoAgrupacionImporte = baseAntesAgrupacion * (request.descuentoAgrupacion / 100)
        val baseImponible = baseAntesAgrupacion - descuentoAgrupacionImporte
        val impuestosTotales = albaran.lineas.sumOf { linea ->
            val baseLineaSinAgrupacion = (linea.cantidad * linea.precioUnitario) * (1 - linea.descuento / 100)
            val baseLineaConAgrupacion = baseLineaSinAgrupacion * (1 - request.descuentoAgrupacion / 100)
            val ivaLinea = baseLineaConAgrupacion * (linea.porcentajeIva / 100)
            val recargoLinea = baseLineaConAgrupacion * (linea.porcentajeRecargo / 100)
            ivaLinea + recargoLinea
        }
        val total = baseImponible + impuestosTotales

        val nuevaFacturaRectificativa = FacturaRectificativa(
            numero = numeracion.codigo,
            fecha = parsearFecha(request.fecha?.toString()),
            cliente = albaran.cliente,
            observaciones = albaran.observaciones ?: "",
            estado = request.estado ?: "Pendiente",
            subtotal = subtotal,
            descuentoTotal = descuentoTotal,
            total = total,
            descuentoAgrupacion = request.descuentoAgrupacion,
            serie = numeracion.serie,
            almacen = albaran.almacen,
            ventaMultialmacen = albaran.ventaMultialmacen,
            tarifa = albaran.tarifa,
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

        val facturaRectificativaGuardada = facturaRectificativaRepository.save(nuevaFacturaRectificativa)

        albaran.lineas.forEach { lineaAlbaran ->
            val lineaReq = FacturaRectificativaLineaRequest(
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
            facturaRectificativaGuardada.lineas.add(
                construirLineaFacturaRectificativa(
                    factura = facturaRectificativaGuardada,
                    lineaReq = lineaReq,
                    productoExistente = lineaAlbaran.producto,
                    almacenExistente = lineaAlbaran.almacen,
                    tipoIvaExistente = lineaAlbaran.tipoIva,
                    impuestosCalculados = impuestos
                )
            )
        }

        val facturaRectificativaFinal = facturaRectificativaRepository.save(facturaRectificativaGuardada)

        // Registrar transformación
        val transformacion = com.example.demo.model.ventas.DocumentoTransformacion(
            tipoOrigen = "ALBARAN",
            idOrigen = albaran.id,
            numeroOrigen = albaran.numero,
            tipoDestino = "FACTURA_RECTIFICATIVA",
            idDestino = facturaRectificativaFinal.id,
            numeroDestino = facturaRectificativaFinal.numero,
            tipoTransformacion = "CONVERTIR",
            fechaTransformacion = java.time.LocalDateTime.now()
        )
        documentoTransformacionRepository.save(transformacion)

        return ResponseEntity.ok(facturaRectificativaFinal)
    }


    @GetMapping("/{id}/pdf")
    fun generarPdf(@PathVariable id: Long): ResponseEntity<ByteArray> {
        val facturaRectificativa = facturaRectificativaRepository.findById(id)
            .orElseThrow { RuntimeException("Factura rectificativa no encontrada") }

        val pdfBytes = facturaRectificativaPdfService.generarPdf(facturaRectificativa)

        val headers = HttpHeaders()
        headers.contentType = MediaType.APPLICATION_PDF
        headers.setContentDispositionFormData("inline", "factura-rectificativa-${facturaRectificativa.numero}.pdf")

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

        val nuevaFacturaRectificativa = FacturaRectificativa(
            numero = numeracion.codigo,
            fecha = parsearFecha(request.fecha?.toString()),
            cliente = factura.cliente,
            facturaOrigen = factura,
            observaciones = factura.observaciones ?: "",
            estado = request.estado ?: "Pendiente",
            subtotal = subtotal,
            descuentoTotal = descuentoTotal,
            total = total,
            descuentoAgrupacion = request.descuentoAgrupacion,
            serie = numeracion.serie,
            almacen = factura.almacen,
            ventaMultialmacen = factura.ventaMultialmacen,
            tarifa = factura.tarifa,
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

        val facturaRectificativaGuardada = facturaRectificativaRepository.save(nuevaFacturaRectificativa)

        factura.lineas.forEach { lineaFactura ->
            val lineaReq = FacturaRectificativaLineaRequest(
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
            facturaRectificativaGuardada.lineas.add(
                construirLineaFacturaRectificativa(
                    factura = facturaRectificativaGuardada,
                    lineaReq = lineaReq,
                    productoExistente = lineaFactura.producto,
                    almacenExistente = lineaFactura.almacen,
                    tipoIvaExistente = lineaFactura.tipoIva,
                    impuestosCalculados = impuestos
                )
            )
        }

        val facturaRectificativaFinal = facturaRectificativaRepository.save(facturaRectificativaGuardada)

        val transformacion = com.example.demo.model.ventas.DocumentoTransformacion(
            tipoOrigen = "FACTURA",
            idOrigen = factura.id,
            numeroOrigen = factura.numero,
            tipoDestino = "FACTURA_RECTIFICATIVA",
            idDestino = facturaRectificativaFinal.id,
            numeroDestino = facturaRectificativaFinal.numero,
            tipoTransformacion = "CONVERTIR",
            fechaTransformacion = java.time.LocalDateTime.now()
        )
        documentoTransformacionRepository.save(transformacion)

        return ResponseEntity.ok(facturaRectificativaFinal)
    }

    @PostMapping("/desde-pedido")
    @Transactional
    fun crearDesdePedido(@RequestBody request: TransformarAlbaranRequest): ResponseEntity<Any> {
        val pedido = pedidoRepository.findById(request.pedidoId ?: return ResponseEntity.badRequest().body(mapOf("error" to "ID de pedido requerido"))).orElse(null)
            ?: return ResponseEntity.badRequest().body(mapOf("error" to "Pedido no encontrado"))

        val numeracion = serieNumeracionService.generarYReservarNumero(DOCUMENTO_SERIE_TIPO, request.serieId)

        val subtotal = pedido.subtotal
        val descuentoTotal = pedido.descuentoTotal
        val total = pedido.total

        val nuevaFacturaRectificativa = FacturaRectificativa(
            numero = numeracion.codigo,
            fecha = parsearFecha(request.fecha?.toString()),
            cliente = pedido.cliente,
            observaciones = pedido.observaciones ?: "",
            estado = request.estado ?: "Pendiente",
            subtotal = subtotal,
            descuentoTotal = descuentoTotal,
            total = total,
            descuentoAgrupacion = request.descuentoAgrupacion,
            serie = numeracion.serie,
            almacen = pedido.almacen,
            ventaMultialmacen = pedido.ventaMultialmacen,
            tarifa = pedido.tarifa,
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

        val facturaRectificativaGuardada = facturaRectificativaRepository.save(nuevaFacturaRectificativa)

        pedido.lineas.forEach { lineaPedido ->
            val lineaReq = FacturaRectificativaLineaRequest(
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
            facturaRectificativaGuardada.lineas.add(
                construirLineaFacturaRectificativa(
                    factura = facturaRectificativaGuardada,
                    lineaReq = lineaReq,
                    productoExistente = lineaPedido.producto,
                    almacenExistente = lineaPedido.almacen,
                    tipoIvaExistente = lineaPedido.tipoIva,
                    impuestosCalculados = impuestos
                )
            )
        }

        val facturaRectificativaFinal = facturaRectificativaRepository.save(facturaRectificativaGuardada)

        val transformacion = com.example.demo.model.ventas.DocumentoTransformacion(
            tipoOrigen = "PEDIDO",
            idOrigen = pedido.id,
            numeroOrigen = pedido.numero,
            tipoDestino = "FACTURA_RECTIFICATIVA",
            idDestino = facturaRectificativaFinal.id,
            numeroDestino = facturaRectificativaFinal.numero,
            tipoTransformacion = "CONVERTIR",
            fechaTransformacion = java.time.LocalDateTime.now()
        )
        documentoTransformacionRepository.save(transformacion)

        return ResponseEntity.ok(facturaRectificativaFinal)
    }

    @PostMapping("/desde-presupuesto")
    @Transactional
    fun crearDesdePresupuesto(@RequestBody request: TransformarAlbaranRequest): ResponseEntity<Any> {
        val presupuesto = presupuestoRepository.findById(request.presupuestoId ?: return ResponseEntity.badRequest().body(mapOf("error" to "ID de presupuesto requerido"))).orElse(null)
            ?: return ResponseEntity.badRequest().body(mapOf("error" to "Presupuesto no encontrado"))

        val numeracion = serieNumeracionService.generarYReservarNumero(DOCUMENTO_SERIE_TIPO, request.serieId)

        val subtotal = presupuesto.subtotal
        val descuentoTotal = presupuesto.descuentoTotal
        val total = presupuesto.total

        val nuevaFacturaRectificativa = FacturaRectificativa(
            numero = numeracion.codigo,
            fecha = parsearFecha(request.fecha?.toString()),
            cliente = presupuesto.cliente,
            observaciones = presupuesto.observaciones ?: "",
            estado = request.estado ?: "Pendiente",
            subtotal = subtotal,
            descuentoTotal = descuentoTotal,
            total = total,
            descuentoAgrupacion = request.descuentoAgrupacion,
            serie = numeracion.serie,
            almacen = presupuesto.almacen,
            ventaMultialmacen = presupuesto.ventaMultialmacen,
            tarifa = presupuesto.tarifa,
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

        val facturaRectificativaGuardada = facturaRectificativaRepository.save(nuevaFacturaRectificativa)

        presupuesto.lineas.forEach { lineaPresupuesto ->
            val lineaReq = FacturaRectificativaLineaRequest(
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
            facturaRectificativaGuardada.lineas.add(
                construirLineaFacturaRectificativa(
                    factura = facturaRectificativaGuardada,
                    lineaReq = lineaReq,
                    productoExistente = lineaPresupuesto.producto,
                    almacenExistente = lineaPresupuesto.almacen,
                    tipoIvaExistente = lineaPresupuesto.tipoIva,
                    impuestosCalculados = impuestos
                )
            )
        }

        val facturaRectificativaFinal = facturaRectificativaRepository.save(facturaRectificativaGuardada)

        val transformacion = com.example.demo.model.ventas.DocumentoTransformacion(
            tipoOrigen = "PRESUPUESTO",
            idOrigen = presupuesto.id,
            numeroOrigen = presupuesto.numero,
            tipoDestino = "FACTURA_RECTIFICATIVA",
            idDestino = facturaRectificativaFinal.id,
            numeroDestino = facturaRectificativaFinal.numero,
            tipoTransformacion = "CONVERTIR",
            fechaTransformacion = java.time.LocalDateTime.now()
        )
        documentoTransformacionRepository.save(transformacion)

        return ResponseEntity.ok(facturaRectificativaFinal)
    }

    @PostMapping("/desde-factura-proforma")
    @Transactional
    fun crearDesdeFacturaProforma(@RequestBody request: TransformarAlbaranRequest): ResponseEntity<Any> {
        val facturaProforma = facturaProformaRepository.findById(request.facturaProformaId ?: return ResponseEntity.badRequest().body(mapOf("error" to "ID de factura proforma requerido"))).orElse(null)
            ?: return ResponseEntity.badRequest().body(mapOf("error" to "Factura Proforma no encontrada"))

        val numeracion = serieNumeracionService.generarYReservarNumero(DOCUMENTO_SERIE_TIPO, request.serieId)

        val subtotal = facturaProforma.subtotal
        val descuentoTotal = facturaProforma.descuentoTotal
        val total = facturaProforma.total

        val nuevaFacturaRectificativa = FacturaRectificativa(
            numero = numeracion.codigo,
            fecha = parsearFecha(request.fecha?.toString()),
            cliente = facturaProforma.cliente,
            observaciones = facturaProforma.observaciones ?: "",
            estado = request.estado ?: "Pendiente",
            subtotal = subtotal,
            descuentoTotal = descuentoTotal,
            total = total,
            descuentoAgrupacion = request.descuentoAgrupacion,
            serie = numeracion.serie,
            almacen = facturaProforma.almacen,
            ventaMultialmacen = facturaProforma.ventaMultialmacen,
            tarifa = facturaProforma.tarifa,
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

        val facturaRectificativaGuardada = facturaRectificativaRepository.save(nuevaFacturaRectificativa)

        facturaProforma.lineas.forEach { lineaFacturaProforma ->
            val lineaReq = FacturaRectificativaLineaRequest(
                productoId = lineaFacturaProforma.producto?.id,
                nombreProducto = lineaFacturaProforma.nombreProducto ?: "",
                referencia = lineaFacturaProforma.referencia,
                cantidad = lineaFacturaProforma.cantidad,
                precioUnitario = lineaFacturaProforma.precioUnitario,
                descuento = lineaFacturaProforma.descuento,
                observaciones = lineaFacturaProforma.observaciones ?: "",
                tipoIvaId = lineaFacturaProforma.tipoIva?.id,
                porcentajeIva = lineaFacturaProforma.porcentajeIva,
                porcentajeRecargo = lineaFacturaProforma.porcentajeRecargo,
                importeIva = lineaFacturaProforma.importeIva,
                importeRecargo = lineaFacturaProforma.importeRecargo,
                almacenId = lineaFacturaProforma.almacen?.id
            )
            val impuestos = ImpuestoCalculo(
                tipoIva = lineaFacturaProforma.tipoIva,
                porcentajeIva = lineaFacturaProforma.porcentajeIva,
                porcentajeRecargo = lineaFacturaProforma.porcentajeRecargo,
                importeIva = lineaFacturaProforma.importeIva,
                importeRecargo = lineaFacturaProforma.importeRecargo
            )
            facturaRectificativaGuardada.lineas.add(
                construirLineaFacturaRectificativa(
                    factura = facturaRectificativaGuardada,
                    lineaReq = lineaReq,
                    productoExistente = lineaFacturaProforma.producto,
                    almacenExistente = lineaFacturaProforma.almacen,
                    tipoIvaExistente = lineaFacturaProforma.tipoIva,
                    impuestosCalculados = impuestos
                )
            )
        }

        val facturaRectificativaFinal = facturaRectificativaRepository.save(facturaRectificativaGuardada)

        val transformacion = com.example.demo.model.ventas.DocumentoTransformacion(
            tipoOrigen = "FACTURA_PROFORMA",
            idOrigen = facturaProforma.id,
            numeroOrigen = facturaProforma.numero,
            tipoDestino = "FACTURA_RECTIFICATIVA",
            idDestino = facturaRectificativaFinal.id,
            numeroDestino = facturaRectificativaFinal.numero,
            tipoTransformacion = "CONVERTIR",
            fechaTransformacion = java.time.LocalDateTime.now()
        )
        documentoTransformacionRepository.save(transformacion)

        return ResponseEntity.ok(facturaRectificativaFinal)
    }

    @PostMapping("/duplicar")
    @Transactional
    fun duplicar(@RequestBody request: TransformarAlbaranRequest): ResponseEntity<Any> {
        val facturaRectificativaOrigen = facturaRectificativaRepository.findById(request.facturaRectificativaId ?: return ResponseEntity.badRequest().body(mapOf("error" to "ID de factura rectificativa requerido"))).orElse(null)
            ?: return ResponseEntity.badRequest().body(mapOf("error" to "Factura Rectificativa no encontrada"))

        val numeracion = serieNumeracionService.generarYReservarNumero(DOCUMENTO_SERIE_TIPO, request.serieId)

        val nuevaFacturaRectificativa = FacturaRectificativa(
            numero = numeracion.codigo,
            fecha = parsearFecha(request.fecha?.toString()),
            cliente = facturaRectificativaOrigen.cliente,
            observaciones = facturaRectificativaOrigen.observaciones ?: "",
            notas = facturaRectificativaOrigen.notas ?: "",
            estado = request.estado ?: "Pendiente",
            subtotal = facturaRectificativaOrigen.subtotal,
            descuentoTotal = facturaRectificativaOrigen.descuentoTotal,
            total = facturaRectificativaOrigen.total,
            descuentoAgrupacion = request.descuentoAgrupacion,
            serie = numeracion.serie,
            almacen = facturaRectificativaOrigen.almacen,
            ventaMultialmacen = facturaRectificativaOrigen.ventaMultialmacen,
            tarifa = facturaRectificativaOrigen.tarifa,
            anioDocumento = numeracion.anio,
            numeroSecuencial = numeracion.secuencial,
            codigoDocumento = numeracion.codigo,
            clienteNombreComercial = facturaRectificativaOrigen.clienteNombreComercial,
            clienteNombreFiscal = facturaRectificativaOrigen.clienteNombreFiscal,
            clienteNifCif = facturaRectificativaOrigen.clienteNifCif,
            clienteEmail = facturaRectificativaOrigen.clienteEmail,
            clienteTelefono = facturaRectificativaOrigen.clienteTelefono,
            direccionFacturacionPais = facturaRectificativaOrigen.direccionFacturacionPais,
            direccionFacturacionCodigoPostal = facturaRectificativaOrigen.direccionFacturacionCodigoPostal,
            direccionFacturacionProvincia = facturaRectificativaOrigen.direccionFacturacionProvincia,
            direccionFacturacionPoblacion = facturaRectificativaOrigen.direccionFacturacionPoblacion,
            direccionFacturacionDireccion = facturaRectificativaOrigen.direccionFacturacionDireccion,
            direccionEnvioPais = facturaRectificativaOrigen.direccionEnvioPais,
            direccionEnvioCodigoPostal = facturaRectificativaOrigen.direccionEnvioCodigoPostal,
            direccionEnvioProvincia = facturaRectificativaOrigen.direccionEnvioProvincia,
            direccionEnvioPoblacion = facturaRectificativaOrigen.direccionEnvioPoblacion,
            direccionEnvioDireccion = facturaRectificativaOrigen.direccionEnvioDireccion
        )

        val facturaRectificativaGuardada = facturaRectificativaRepository.save(nuevaFacturaRectificativa)

        facturaRectificativaOrigen.lineas.forEach { lineaOrigen ->
            val lineaReq = FacturaRectificativaLineaRequest(
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
            facturaRectificativaGuardada.lineas.add(
                construirLineaFacturaRectificativa(
                    factura = facturaRectificativaGuardada,
                    lineaReq = lineaReq,
                    productoExistente = lineaOrigen.producto,
                    almacenExistente = lineaOrigen.almacen,
                    tipoIvaExistente = lineaOrigen.tipoIva,
                    impuestosCalculados = impuestos
                )
            )
        }

        val facturaRectificativaFinal = facturaRectificativaRepository.save(facturaRectificativaGuardada)

        // Duplicar no registra transformación - se trata como documento nuevo/manual
        return ResponseEntity.ok(facturaRectificativaFinal)
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

        val nuevaFacturaRect = FacturaRectificativa(
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
            almacen = datos.almacen,
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

        val rectGuardada = facturaRectificativaRepository.save(nuevaFacturaRect)

        datos.lineas.forEach { linea ->
            rectGuardada.lineas.add(FacturaRectificativaLinea(
                facturaRectificativa = rectGuardada,
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

        val rectFinal = facturaRectificativaRepository.save(rectGuardada)

        if (!request.esDuplicacion) {
            documentoTransformacionRepository.save(DocumentoTransformacion(
                tipoOrigen = request.tipoOrigen,
                idOrigen = request.idOrigen,
                numeroOrigen = null,
                tipoDestino = "FACTURA_RECTIFICATIVA",
                idDestino = rectFinal.id,
                numeroDestino = rectFinal.numero,
                tipoTransformacion = "CONVERTIR",
                fechaTransformacion = java.time.LocalDateTime.now()
            ))
        }

        return ResponseEntity.ok(rectFinal)
    }

    // ========== ADJUNTOS ==========
    private fun cargarAdjuntos(facturaRectificativa: FacturaRectificativa): FacturaRectificativa {
        facturaRectificativa.adjuntos = obtenerAdjuntos(facturaRectificativa.id)
        return facturaRectificativa
    }

    private fun obtenerAdjuntos(facturaRectificativaId: Long): List<com.example.demo.model.ArchivoEmpresa> {
        return archivoEmpresaRepository.findByDocumentoOrigenAndDocumentoOrigenId("FACTURA_RECTIFICATIVA", facturaRectificativaId)
    }

    private fun actualizarAdjuntosFacturaRectificativa(facturaRectificativaId: Long, adjuntosIds: List<Long>) {
        // Primero, desvincular todos los adjuntos existentes de esta factura rectificativa
        val adjuntosExistentes = archivoEmpresaRepository.findByDocumentoOrigenAndDocumentoOrigenId("FACTURA_RECTIFICATIVA", facturaRectificativaId)
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
                    documentoOrigen = "FACTURA_RECTIFICATIVA",
                    documentoOrigenId = facturaRectificativaId
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
            actualizarAdjuntosFacturaRectificativa(id, adjuntosIds)
            ResponseEntity.ok(mapOf("mensaje" to "Adjuntos actualizados correctamente"))
        } catch (e: Exception) {
            ResponseEntity.status(500).body(mapOf("error" to "Error al actualizar adjuntos: ${e.message}"))
        }
    }
}
