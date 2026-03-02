package com.example.demo.controller.ventas

data class AlbaranLineaRequest(
    val productoId: Long,
    val nombreProducto: String = "",
    val referencia: String? = null,
    val cantidad: Int = 1,
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

data class AlbaranRequest(
    val numero: String,
    val fecha: String? = null,
    val clienteId: Long?,
    val facturaId: Long? = null,
    val pedidoId: Long? = null,
    val direccionId: Long? = null,
    val lineas: List<AlbaranLineaRequest>,
    val observaciones: String,
    val notas: String = "",
    val estado: String,
    val descuentoAgrupacion: Double = 0.0,
    val adjuntosIds: List<Long> = emptyList(),
    val serieId: Long? = null,
    val usarCodigoManual: Boolean = false,
    val codigoManual: String? = null,
    val usuarioId: Long? = null,
    val almacenId: Long? = null,
    val ventaMultialmacen: Boolean = false,
    val tarifaId: Long? = null,
    val direccionFacturacionPais: String? = null,
    val direccionFacturacionCodigoPostal: String? = null,
    val direccionFacturacionProvincia: String? = null,
    val direccionFacturacionPoblacion: String? = null,
    val direccionFacturacionDireccion: String? = null,
    val direccionEnvioPais: String? = null,
    val direccionEnvioCodigoPostal: String? = null,
    val direccionEnvioProvincia: String? = null,
    val direccionEnvioPoblacion: String? = null,
    val direccionEnvioDireccion: String? = null
)

data class DuplicarAlbaranRequest(
    val albaranOrigenId: Long,
    val serieId: Long? = null,
    val fecha: String? = null,
    val estado: String
)

data class TransformarAlbaranRequest(
    val albaranId: Long? = null,
    val pedidoId: Long? = null,
    val presupuestoId: Long? = null,
    val facturaProformaId: Long? = null,
    val facturaRectificativaId: Long? = null,
    val facturaId: Long? = null,
    val serieId: Long? = null,
    val fecha: String? = null,
    val estado: String? = null,
    val descuentoAgrupacion: Double = 0.0
)

data class TransformarDocumentoRequest(
    val tipoOrigen: String, // ALBARAN, FACTURA, PEDIDO, etc.
    val idOrigen: Long,
    val tipoDestino: String, // ALBARAN, FACTURA, FACTURA_PROFORMA, etc.
    val serieId: Long? = null,
    val fecha: String? = null,
    val estado: String = "Pendiente",
    val esDuplicacion: Boolean = false, // true si es duplicar, false si es transformar
    val clienteId: Long? = null,   // Requerido cuando el origen es de compras (venta→compra cross-module)
    val proveedorId: Long? = null  // Requerido cuando el origen es de ventas (venta→compra cross-module)
)
