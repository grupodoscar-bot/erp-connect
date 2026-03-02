package com.example.demo.controller.compras

data class AlbaranCompraRequest(
    val id: Long? = null,
    val numero: String? = null,
    val fecha: String? = null,
    val proveedorId: Long? = null,
    val direccionId: Long? = null,
    val observaciones: String? = null,
    val notas: String? = null,
    val estado: String = "Pendiente",
    val lineas: List<AlbaranCompraLineaRequest> = emptyList(),
    val descuentoAgrupacion: Double = 0.0,
    val adjuntosIds: List<Long> = emptyList(),
    val serieId: Long? = null,
    val usarCodigoManual: Boolean = false,
    val tarifaId: Long? = null,
    val almacenId: Long? = null,
    val compraMultialmacen: Boolean = false,
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
    val recargoEquivalencia: Boolean = false
)

data class AlbaranCompraLineaRequest(
    val productoId: Long? = null,
    val nombreProducto: String = "",
    val referencia: String? = null,
    val cantidad: Int = 0,
    val precioUnitario: Double = 0.0,
    val descuento: Double = 0.0,
    val observaciones: String = "",
    val tipoIvaId: Long? = null,
    val porcentajeIva: Double = 0.0,
    val porcentajeRecargo: Double = 0.0,
    val importeIva: Double = 0.0,
    val importeRecargo: Double = 0.0,
    val almacenId: Long? = null
)

data class TransformarDocumentoCompraRequest(
    val tipoOrigen: String,
    val idOrigen: Long,
    val tipoDestino: String,
    val serieId: Long? = null,
    val fecha: String? = null,
    val estado: String = "Pendiente",
    val esDuplicacion: Boolean = false,
    val clienteId: Long? = null,   // Requerido cuando el destino es de ventas (compra→venta cross-module)
    val proveedorId: Long? = null  // Requerido cuando el origen es de ventas (venta→compra cross-module)
)
