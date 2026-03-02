package com.example.demo.controller

import com.example.demo.model.*
import com.example.demo.repository.TarifaRepository
import com.example.demo.repository.TarifaProductoRepository
import com.example.demo.repository.ProductoRepository
import com.example.demo.repository.ConfiguracionVentasRepository
import org.springframework.http.ResponseEntity
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.*
import java.time.LocalDateTime

@RestController
@RequestMapping("/tarifas")
@CrossOrigin(origins = ["http://145.223.103.219:3000"])
class TarifaController(
    private val tarifaRepository: TarifaRepository,
    private val tarifaProductoRepository: TarifaProductoRepository,
    private val productoRepository: ProductoRepository,
    private val configuracionVentasRepository: ConfiguracionVentasRepository
) {

    @GetMapping
    fun listarTarifas(): List<Tarifa> {
        val configuracion = configuracionVentasRepository.findTopByOrderByIdAsc()
        return if (configuracion?.permitirMultitarifa == true) {
            tarifaRepository.findAllActivasOrdenadas()
        } else {
            // Solo devolver la tarifa general si no está permitido multitarifa
            listOfNotNull(tarifaRepository.findByEsGeneralTrue())
        }
    }

    @GetMapping("/activas")
    fun listarTarifasActivas(): List<Tarifa> = tarifaRepository.findByActivaTrue()

    @GetMapping("/{id}")
    fun obtenerTarifa(@PathVariable id: Long): ResponseEntity<Tarifa> =
        tarifaRepository.findById(id)
            .map { ResponseEntity.ok(it) }
            .orElse(ResponseEntity.notFound().build())

    @GetMapping("/general")
    fun obtenerTarifaGeneral(): ResponseEntity<Tarifa> {
        val tarifaGeneral = tarifaRepository.findByEsGeneralTrue()
        return if (tarifaGeneral != null) {
            ResponseEntity.ok(tarifaGeneral)
        } else {
            ResponseEntity.notFound().build()
        }
    }

    @PostMapping
    @Transactional
    fun crearTarifa(
        @RequestBody request: TarifaRequest,
        @RequestParam(required = false) copiarPreciosGeneral: Boolean = false,
        @RequestParam(required = false) porcentajeIncremento: Double? = null,
        @RequestParam(required = false) cantidadFija: Double? = null,
        @RequestParam(required = false) porcentajeIncrementoCompra: Double? = null,
        @RequestParam(required = false) cantidadFijaCompra: Double? = null
    ): ResponseEntity<Any> {
        val configuracion = configuracionVentasRepository.findTopByOrderByIdAsc()
        
        // Verificar si está permitido crear múltiples tarifas
        if (configuracion?.permitirMultitarifa != true && request.esGeneral != true) {
            return ResponseEntity.badRequest().body(mapOf(
                "error" to "No está permitido crear múltiples tarifas. Active la configuración de multitarifa primero."
            ))
        }

        // Verificar que no exista una tarifa con el mismo nombre
        if (tarifaRepository.existsByNombre(request.nombre)) {
            return ResponseEntity.badRequest().body(mapOf(
                "error" to "Ya existe una tarifa con el nombre '${request.nombre}'"
            ))
        }

        // Si es tarifa general, verificar que no exista otra
        if (request.esGeneral == true && tarifaRepository.findByEsGeneralTrue() != null) {
            return ResponseEntity.badRequest().body(mapOf(
                "error" to "Ya existe una tarifa general. Solo puede haber una tarifa general."
            ))
        }

        val nuevaTarifa = Tarifa(
            nombre = request.nombre,
            descripcion = request.descripcion ?: "",
            activa = request.activa ?: true,
            esGeneral = request.esGeneral ?: false,
            tipoTarifa = request.tipoTarifa ?: TipoTarifa.VENTA,
            ajusteVentaPorcentaje = request.ajusteVentaPorcentaje,
            ajusteVentaCantidad = request.ajusteVentaCantidad,
            ajusteCompraPorcentaje = request.ajusteCompraPorcentaje,
            ajusteCompraCantidad = request.ajusteCompraCantidad,
            createdAt = LocalDateTime.now(),
            updatedAt = LocalDateTime.now()
        )

        val tarifaGuardada = tarifaRepository.save(nuevaTarifa)
        
        // Copiar precios de la tarifa general si se solicita
        var productosCopiadosCount = 0
        if (copiarPreciosGeneral && !tarifaGuardada.esGeneral) {
            val tarifaGeneral = tarifaRepository.findByEsGeneralTrue()
            if (tarifaGeneral != null) {
                val preciosGenerales = tarifaProductoRepository.findByTarifaId(tarifaGeneral.id)
                val ajustes = obtenerAjustesParaTarifa(
                    tarifaGuardada,
                    porcentajeIncremento,
                    cantidadFija,
                    porcentajeIncrementoCompra,
                    cantidadFijaCompra
                )
                preciosGenerales.forEach { precioGeneral ->
                    var precioAjustado = precioGeneral.precio
                    ajustes.porcentaje?.takeIf { it != 0.0 }?.let { porcentaje ->
                        precioAjustado += precioAjustado * (porcentaje / 100.0)
                    }
                    ajustes.cantidad?.takeIf { it != 0.0 }?.let { cantidad ->
                        precioAjustado += cantidad
                    }
                    
                    val nuevoTarifaProducto = TarifaProducto(
                        tarifa = tarifaGuardada,
                        producto = precioGeneral.producto,
                        precio = precioAjustado,
                        descuento = precioGeneral.descuento,
                        precioBloqueado = precioGeneral.precioBloqueado,
                        margen = precioGeneral.margen,
                        precioConImpuestos = precioGeneral.precioConImpuestos,
                        createdAt = LocalDateTime.now(),
                        updatedAt = LocalDateTime.now()
                    )
                    tarifaProductoRepository.save(nuevoTarifaProducto)
                    productosCopiadosCount++
                }
            }
        }
        
        return ResponseEntity.ok(mapOf(
            "id" to tarifaGuardada.id,
            "nombre" to tarifaGuardada.nombre,
            "descripcion" to tarifaGuardada.descripcion,
            "activa" to tarifaGuardada.activa,
            "esGeneral" to tarifaGuardada.esGeneral,
            "tipoTarifa" to tarifaGuardada.tipoTarifa,
            "ajusteVentaPorcentaje" to tarifaGuardada.ajusteVentaPorcentaje,
            "ajusteVentaCantidad" to tarifaGuardada.ajusteVentaCantidad,
            "ajusteCompraPorcentaje" to tarifaGuardada.ajusteCompraPorcentaje,
            "ajusteCompraCantidad" to tarifaGuardada.ajusteCompraCantidad,
            "productosCopiadosCount" to productosCopiadosCount
        ))
    }

    @PutMapping("/{id}")
    @Transactional
    fun actualizarTarifa(
        @PathVariable id: Long,
        @RequestBody request: TarifaRequest,
        @RequestParam(required = false) copiarPreciosGeneral: Boolean = false,
        @RequestParam(required = false) porcentajeIncremento: Double? = null,
        @RequestParam(required = false) cantidadFija: Double? = null,
        @RequestParam(required = false) porcentajeIncrementoCompra: Double? = null,
        @RequestParam(required = false) cantidadFijaCompra: Double? = null
    ): ResponseEntity<Any> {
        val tarifa = tarifaRepository.findById(id).orElse(null)
            ?: return ResponseEntity.notFound().build()

        // Verificar que no exista otra tarifa con el mismo nombre
        val tarifaExistente = tarifaRepository.findByNombre(request.nombre)
        if (tarifaExistente != null && tarifaExistente.id != id) {
            return ResponseEntity.badRequest().body(mapOf(
                "error" to "Ya existe una tarifa con el nombre '${request.nombre}'"
            ))
        }

        // Si se marca como tarifa general, desmarcar la anterior
        if (request.esGeneral == true && tarifa.esGeneral != true) {
            val tarifaGeneralAnterior = tarifaRepository.findByEsGeneralTrue()
            if (tarifaGeneralAnterior != null && tarifaGeneralAnterior.id != id) {
                // Desmarcar la tarifa general anterior
                val tarifaDesactualizada = tarifaGeneralAnterior.copy(
                    esGeneral = false,
                    updatedAt = LocalDateTime.now()
                )
                tarifaRepository.save(tarifaDesactualizada)
            }
        }

        val tarifaActualizada = tarifa.copy(
            nombre = request.nombre,
            descripcion = request.descripcion ?: tarifa.descripcion,
            activa = request.activa ?: tarifa.activa,
            esGeneral = request.esGeneral ?: tarifa.esGeneral,
            tipoTarifa = request.tipoTarifa ?: tarifa.tipoTarifa,
            ajusteVentaPorcentaje = request.ajusteVentaPorcentaje ?: tarifa.ajusteVentaPorcentaje,
            ajusteVentaCantidad = request.ajusteVentaCantidad ?: tarifa.ajusteVentaCantidad,
            ajusteCompraPorcentaje = request.ajusteCompraPorcentaje ?: tarifa.ajusteCompraPorcentaje,
            ajusteCompraCantidad = request.ajusteCompraCantidad ?: tarifa.ajusteCompraCantidad,
            updatedAt = LocalDateTime.now()
        )

        val tarifaGuardada = tarifaRepository.save(tarifaActualizada)
        
        // Recalcular precios si se solicita
        var productosActualizados = 0
        if (copiarPreciosGeneral && !tarifaGuardada.esGeneral) {
            val tarifaGeneral = tarifaRepository.findByEsGeneralTrue()
            if (tarifaGeneral != null) {
                // Eliminar precios existentes de esta tarifa
                tarifaProductoRepository.deleteByTarifaId(id)
                val ajustes = obtenerAjustesParaTarifa(
                    tarifaGuardada,
                    porcentajeIncremento,
                    cantidadFija,
                    porcentajeIncrementoCompra,
                    cantidadFijaCompra
                )
                
                // Copiar precios de la tarifa general con ajustes
                val preciosGenerales = tarifaProductoRepository.findByTarifaId(tarifaGeneral.id)
                preciosGenerales.forEach { precioGeneral ->
                    var precioAjustado = precioGeneral.precio
                    ajustes.porcentaje?.takeIf { it != 0.0 }?.let { porcentaje ->
                        precioAjustado += precioAjustado * (porcentaje / 100.0)
                    }
                    ajustes.cantidad?.takeIf { it != 0.0 }?.let { cantidad ->
                        precioAjustado += cantidad
                    }
                    
                    val nuevoTarifaProducto = TarifaProducto(
                        tarifa = tarifaGuardada,
                        producto = precioGeneral.producto,
                        precio = precioAjustado,
                        descuento = precioGeneral.descuento,
                        precioBloqueado = precioGeneral.precioBloqueado,
                        margen = precioGeneral.margen,
                        precioConImpuestos = precioGeneral.precioConImpuestos,
                        createdAt = LocalDateTime.now(),
                        updatedAt = LocalDateTime.now()
                    )
                    tarifaProductoRepository.save(nuevoTarifaProducto)
                    productosActualizados++
                }
            }
        }
        
        return ResponseEntity.ok(mapOf(
            "id" to tarifaGuardada.id,
            "nombre" to tarifaGuardada.nombre,
            "descripcion" to tarifaGuardada.descripcion,
            "activa" to tarifaGuardada.activa,
            "esGeneral" to tarifaGuardada.esGeneral,
            "tipoTarifa" to tarifaGuardada.tipoTarifa,
            "ajusteVentaPorcentaje" to tarifaGuardada.ajusteVentaPorcentaje,
            "ajusteVentaCantidad" to tarifaGuardada.ajusteVentaCantidad,
            "ajusteCompraPorcentaje" to tarifaGuardada.ajusteCompraPorcentaje,
            "ajusteCompraCantidad" to tarifaGuardada.ajusteCompraCantidad,
            "productosActualizados" to productosActualizados
        ))
    }

    @DeleteMapping("/{id}")
    @Transactional
    fun eliminarTarifa(@PathVariable id: Long): ResponseEntity<Any> {
        val tarifa = tarifaRepository.findById(id).orElse(null)
            ?: return ResponseEntity.notFound().build()

        // No permitir eliminar la tarifa general
        if (tarifa.esGeneral) {
            return ResponseEntity.badRequest().body(mapOf(
                "error" to "No se puede eliminar la tarifa general"
            ))
        }

        // Eliminar primero todas las relaciones con productos
        tarifaProductoRepository.deleteByTarifaId(id)
        
        // Eliminar la tarifa
        tarifaRepository.deleteById(id)
        
        return ResponseEntity.noContent().build()
    }

    @GetMapping("/{tarifaId}/productos")
    fun obtenerProductosDeTarifa(@PathVariable tarifaId: Long): List<TarifaProducto> =
        tarifaProductoRepository.findByTarifaId(tarifaId)

    @PostMapping("/{tarifaId}/productos")
    @Transactional
    fun agregarProductoATarifa(
        @PathVariable tarifaId: Long,
        @RequestBody request: TarifaProductoRequest
    ): ResponseEntity<Any> {
        val tarifa = tarifaRepository.findById(tarifaId).orElse(null)
            ?: return ResponseEntity.badRequest().body(mapOf("error" to "Tarifa no encontrada"))

        val producto = productoRepository.findById(request.productoId).orElse(null)
            ?: return ResponseEntity.badRequest().body(mapOf("error" to "Producto no encontrado"))

        // Verificar si ya existe la relación
        val existente = tarifaProductoRepository.findByTarifaIdAndProductoId(tarifaId, request.productoId)
        if (existente != null) {
            return ResponseEntity.badRequest().body(mapOf(
                "error" to "El producto ya está asignado a esta tarifa"
            ))
        }

        val tarifaProducto = TarifaProducto(
            tarifa = tarifa,
            producto = producto,
            precio = request.precio,
            descuento = request.descuento ?: 0.0,
            precioBloqueado = request.precioBloqueado ?: false,
            margen = request.margen ?: 0.0,
            precioConImpuestos = request.precioConImpuestos ?: 0.0,
            tipoCalculoPrecio = request.tipoCalculoPrecio,
            valorCalculo = request.valorCalculo,
            precioCompra = request.precioCompra,
            descuentoCompra = request.descuentoCompra,
            tipoCalculoPrecioCompra = request.tipoCalculoPrecioCompra,
            valorCalculoCompra = request.valorCalculoCompra,
            createdAt = LocalDateTime.now(),
            updatedAt = LocalDateTime.now()
        )

        val guardado = tarifaProductoRepository.save(tarifaProducto)
        return ResponseEntity.ok(guardado)
    }

    @PutMapping("/productos/{tarifaProductoId}")
    @Transactional
    fun actualizarTarifaProducto(
        @PathVariable tarifaProductoId: Long,
        @RequestBody request: TarifaProductoRequest
    ): ResponseEntity<Any> {
        val tarifaProducto = tarifaProductoRepository.findById(tarifaProductoId).orElse(null)
            ?: return ResponseEntity.notFound().build()

        val actualizado = tarifaProducto.copy(
            precio = request.precio,
            descuento = request.descuento ?: tarifaProducto.descuento,
            precioBloqueado = request.precioBloqueado ?: tarifaProducto.precioBloqueado,
            margen = request.margen ?: tarifaProducto.margen,
            precioConImpuestos = request.precioConImpuestos ?: tarifaProducto.precioConImpuestos,
            tipoCalculoPrecio = request.tipoCalculoPrecio ?: tarifaProducto.tipoCalculoPrecio,
            valorCalculo = request.valorCalculo ?: tarifaProducto.valorCalculo,
            precioCompra = request.precioCompra ?: tarifaProducto.precioCompra,
            descuentoCompra = request.descuentoCompra ?: tarifaProducto.descuentoCompra,
            tipoCalculoPrecioCompra = request.tipoCalculoPrecioCompra ?: tarifaProducto.tipoCalculoPrecioCompra,
            valorCalculoCompra = request.valorCalculoCompra ?: tarifaProducto.valorCalculoCompra,
            updatedAt = LocalDateTime.now()
        )

        val guardado = tarifaProductoRepository.save(actualizado)
        return ResponseEntity.ok(guardado)
    }

    @DeleteMapping("/productos/{tarifaProductoId}")
    @Transactional
    fun eliminarTarifaProducto(@PathVariable tarifaProductoId: Long): ResponseEntity<Any> {
        if (!tarifaProductoRepository.existsById(tarifaProductoId)) {
            return ResponseEntity.notFound().build()
        }

        tarifaProductoRepository.deleteById(tarifaProductoId)
        return ResponseEntity.noContent().build()
    }

    @GetMapping("/producto/{productoId}")
    fun obtenerTarifasDeProducto(@PathVariable productoId: Long): List<TarifaProducto> =
        tarifaProductoRepository.findByProductoIdAndTarifaActiva(productoId)

    @PostMapping("/inicializar-general")
    @Transactional
    fun inicializarTarifaGeneral(): ResponseEntity<Any> {
        // Verificar si ya existe una tarifa general
        val tarifaGeneral = tarifaRepository.findByEsGeneralTrue()
        if (tarifaGeneral != null) {
            return ResponseEntity.badRequest().body(mapOf(
                "error" to "Ya existe una tarifa general"
            ))
        }

        // Crear la tarifa general
        val nuevaTarifaGeneral = Tarifa(
            nombre = "General",
            descripcion = "Tarifa general del sistema",
            activa = true,
            esGeneral = true,
            createdAt = LocalDateTime.now(),
            updatedAt = LocalDateTime.now()
        )

        val tarifaGuardada = tarifaRepository.save(nuevaTarifaGeneral)
        
        // Migrar todos los productos existentes a la tarifa general
        val productos = productoRepository.findAll()
        productos.forEach { producto ->
            val tarifaProducto = TarifaProducto(
                tarifa = tarifaGuardada,
                producto = producto,
                precio = producto.precio,
                descuento = producto.descuento,
                precioBloqueado = producto.precioBloqueado,
                margen = producto.margen,
                precioConImpuestos = producto.precioConImpuestos,
                createdAt = LocalDateTime.now(),
                updatedAt = LocalDateTime.now()
            )
            tarifaProductoRepository.save(tarifaProducto)
        }

        return ResponseEntity.ok(mapOf(
            "mensaje" to "Tarifa general creada y productos migrados correctamente",
            "tarifa" to tarifaGuardada,
            "productosMigrados" to productos.size
        ))
    }
}

data class TarifaRequest(
    val nombre: String,
    val descripcion: String? = null,
    val activa: Boolean? = true,
    val esGeneral: Boolean? = false,
    val tipoTarifa: TipoTarifa? = TipoTarifa.VENTA,
    val ajusteVentaPorcentaje: Double? = null,
    val ajusteVentaCantidad: Double? = null,
    val ajusteCompraPorcentaje: Double? = null,
    val ajusteCompraCantidad: Double? = null
)

data class TarifaProductoRequest(
    val productoId: Long,
    val precio: Double,
    val descuento: Double? = 0.0,
    val precioBloqueado: Boolean? = false,
    val margen: Double? = 0.0,
    val precioConImpuestos: Double? = 0.0,
    val tipoCalculoPrecio: TipoCalculoPrecio? = TipoCalculoPrecio.PRECIO_FIJO,
    val valorCalculo: Double? = null,
    val precioCompra: Double? = null,
    val descuentoCompra: Double? = null,
    val tipoCalculoPrecioCompra: TipoCalculoPrecio? = null,
    val valorCalculoCompra: Double? = null
)

private data class AjustesTarifa(
    val porcentaje: Double?,
    val cantidad: Double?
)

private fun obtenerAjustesParaTarifa(
    tarifa: Tarifa,
    porcentajeVenta: Double?,
    cantidadVenta: Double?,
    porcentajeCompra: Double?,
    cantidadCompra: Double?
): AjustesTarifa {
    return when (tarifa.tipoTarifa) {
        TipoTarifa.COMPRA -> AjustesTarifa(
            porcentajeCompra ?: tarifa.ajusteCompraPorcentaje,
            cantidadCompra ?: tarifa.ajusteCompraCantidad
        )
        else -> AjustesTarifa(
            porcentajeVenta ?: tarifa.ajusteVentaPorcentaje,
            cantidadVenta ?: tarifa.ajusteVentaCantidad
        )
    }
}
