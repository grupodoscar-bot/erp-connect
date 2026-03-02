package com.example.demo.controller.ventas

data class PresupuestoRequest(
    val fecha: String? = null,
    val clienteId: Long? = null,
    val observaciones: String = "",
    val notas: String = "",
    val estado: String = "Pendiente",
    val descuentoAgrupacion: Double = 0.0,
    val serieId: Long? = null,
    val almacenId: Long? = null,
    val ventaMultialmacen: Boolean = false,
    val tarifaId: Long? = null,
    val lineas: List<PresupuestoLineaRequest> = emptyList(),
    
    // Snapshots de direcciones (opcionales, si el usuario los modifica)
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

data class PresupuestoLineaRequest(
    val productoId: Long? = null,
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
