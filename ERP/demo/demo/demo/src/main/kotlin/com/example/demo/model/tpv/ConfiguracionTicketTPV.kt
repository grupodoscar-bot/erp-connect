package com.example.demo.model.tpv

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "tpv_configuracion_tickets")
data class ConfiguracionTicketTPV(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(name = "nombre_configuracion", nullable = false)
    val nombreConfiguracion: String = "Configuración por defecto",

    @Column(nullable = false)
    val activa: Boolean = true,

    // Datos de empresa
    @Column(name = "mostrar_nombre_empresa", nullable = false)
    val mostrarNombreEmpresa: Boolean = true,

    @Column(name = "mostrar_direccion", nullable = false)
    val mostrarDireccion: Boolean = true,

    @Column(name = "mostrar_codigo_postal", nullable = false)
    val mostrarCodigoPostal: Boolean = true,

    @Column(name = "mostrar_provincia", nullable = false)
    val mostrarProvincia: Boolean = true,

    @Column(name = "mostrar_telefono", nullable = false)
    val mostrarTelefono: Boolean = true,

    @Column(name = "mostrar_cif", nullable = false)
    val mostrarCif: Boolean = true,

    @Column(name = "mostrar_logo", nullable = false)
    val mostrarLogo: Boolean = false,

    // Datos del ticket
    @Column(name = "mostrar_numero_factura", nullable = false)
    val mostrarNumeroFactura: Boolean = true,

    @Column(name = "mostrar_fecha_hora", nullable = false)
    val mostrarFechaHora: Boolean = true,

    @Column(name = "mostrar_cliente", nullable = false)
    val mostrarCliente: Boolean = true,

    // Detalles de productos
    @Column(name = "mostrar_referencia_producto", nullable = false)
    val mostrarReferenciaProducto: Boolean = false,

    @Column(name = "mostrar_descripcion_producto", nullable = false)
    val mostrarDescripcionProducto: Boolean = true,

    @Column(name = "mostrar_cantidad", nullable = false)
    val mostrarCantidad: Boolean = true,

    @Column(name = "mostrar_precio_unitario", nullable = false)
    val mostrarPrecioUnitario: Boolean = true,

    @Column(name = "mostrar_descuento", nullable = false)
    val mostrarDescuento: Boolean = true,

    @Column(name = "mostrar_subtotal_linea", nullable = false)
    val mostrarSubtotalLinea: Boolean = true,

    // Impuestos y totales
    @Column(name = "mostrar_porcentaje_iva", nullable = false)
    val mostrarPorcentajeIva: Boolean = true,

    @Column(name = "mostrar_desglose_iva", nullable = false)
    val mostrarDesgloseIva: Boolean = true,

    @Column(name = "mostrar_base_imponible", nullable = false)
    val mostrarBaseImponible: Boolean = true,

    @Column(name = "mostrar_cuota_iva", nullable = false)
    val mostrarCuotaIva: Boolean = true,

    @Column(name = "mostrar_subtotal", nullable = false)
    val mostrarSubtotal: Boolean = true,

    @Column(name = "mostrar_descuento_total", nullable = false)
    val mostrarDescuentoTotal: Boolean = true,

    @Column(name = "mostrar_total", nullable = false)
    val mostrarTotal: Boolean = true,

    // Método de pago
    @Column(name = "mostrar_metodo_pago", nullable = false)
    val mostrarMetodoPago: Boolean = true,

    @Column(name = "mostrar_importe_entregado", nullable = false)
    val mostrarImporteEntregado: Boolean = true,

    @Column(name = "mostrar_cambio", nullable = false)
    val mostrarCambio: Boolean = true,

    // Textos personalizables
    @Column(name = "texto_cabecera", columnDefinition = "TEXT")
    val textoCabecera: String = "TPV DOSCAR",

    @Column(name = "texto_pie", columnDefinition = "TEXT")
    val textoPie: String = "¡Gracias por su compra!",

    @Column(name = "texto_despedida", columnDefinition = "TEXT")
    val textoDespedida: String = "Vuelva pronto",

    @Column(name = "texto_ticket")
    val textoTicket: String = "Ticket:",

    @Column(name = "texto_fecha")
    val textoFecha: String = "Fecha:",

    @Column(name = "texto_cliente")
    val textoCliente: String = "Cliente:",

    @Column(name = "texto_descripcion")
    val textoDescripcion: String = "Descripción",

    @Column(name = "texto_cantidad")
    val textoCantidad: String = "Cant.",

    @Column(name = "texto_precio")
    val textoPrecio: String = "Precio",

    @Column(name = "texto_importe")
    val textoImporte: String = "Importe",

    @Column(name = "texto_subtotal")
    val textoSubtotal: String = "Subtotal",

    @Column(name = "texto_descuento")
    val textoDescuento: String = "Descuento",

    @Column(name = "texto_base")
    val textoBase: String = "Base",

    @Column(name = "texto_iva")
    val textoIva: String = "IVA",

    @Column(name = "texto_total")
    val textoTotal: String = "Total",

    @Column(name = "texto_metodo_pago")
    val textoMetodoPago: String = "Método de pago:",

    @Column(name = "texto_entregado")
    val textoEntregado: String = "Entregado:",

    @Column(name = "texto_cambio")
    val textoCambio: String = "Cambio:",

    // Formato y estilo
    @Column(name = "formato_impresora")
    val formatoImpresora: String = "80mm",

    @Column(name = "ancho_ticket", nullable = false)
    val anchoTicket: Int = 280,

    @Column(name = "fuente_familia")
    val fuenteFamilia: String = "monospace",

    @Column(name = "fuente_tamano_cabecera", nullable = false)
    val fuenteTamanoCabecera: Int = 14,

    @Column(name = "fuente_tamano_normal", nullable = false)
    val fuenteTamanoNormal: Int = 11,

    @Column(name = "fuente_tamano_pie", nullable = false)
    val fuenteTamanoPie: Int = 10,

    @Column(name = "alinear_cabecera")
    val alinearCabecera: String = "center",

    @Column(name = "alinear_pie")
    val alinearPie: String = "center",

    @Column(name = "separador_linea")
    val separadorLinea: String = "=",

    @Column(name = "espaciado_lineas", nullable = false)
    val espaciadoLineas: Int = 4,

    // Metadatos
    @Column(name = "creado_en")
    val creadoEn: LocalDateTime = LocalDateTime.now(),

    @Column(name = "actualizado_en")
    val actualizadoEn: LocalDateTime = LocalDateTime.now()
)
