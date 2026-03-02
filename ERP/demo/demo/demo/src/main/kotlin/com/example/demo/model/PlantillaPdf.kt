package com.example.demo.model

import jakarta.persistence.*

@Entity
@Table(name = "plantilla_pdf")
data class PlantillaPdf(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false)
    val nombre: String = "Plantilla por defecto",

    // Configuración de campos visibles
    @Column(name = "mostrar_logo")
    val mostrarLogo: Boolean = true,

    @Column(name = "mostrar_empresa")
    val mostrarEmpresa: Boolean = true,

    @Column(name = "mostrar_cliente")
    val mostrarCliente: Boolean = true,

    @Column(name = "mostrar_datos_albaran")
    val mostrarDatosAlbaran: Boolean = true,

    @Column(name = "mostrar_observaciones")
    val mostrarObservaciones: Boolean = true,

    @Column(name = "mostrar_pie_pagina")
    val mostrarPiePagina: Boolean = true,

    // Campos específicos de empresa
    @Column(name = "empresa_mostrar_razon")
    val empresaMostrarRazon: Boolean = true,

    @Column(name = "empresa_mostrar_cif")
    val empresaMostrarCif: Boolean = true,

    @Column(name = "empresa_mostrar_direccion")
    val empresaMostrarDireccion: Boolean = true,

    @Column(name = "empresa_mostrar_telefono")
    val empresaMostrarTelefono: Boolean = true,

    @Column(name = "empresa_mostrar_email")
    val empresaMostrarEmail: Boolean = true,

    // Campos específicos de cliente
    @Column(name = "cliente_mostrar_nif")
    val clienteMostrarNif: Boolean = true,

    @Column(name = "cliente_mostrar_direccion")
    val clienteMostrarDireccion: Boolean = true,

    @Column(name = "cliente_mostrar_telefono")
    val clienteMostrarTelefono: Boolean = true,

    @Column(name = "cliente_mostrar_email")
    val clienteMostrarEmail: Boolean = true,

    // Campos de productos
    @Column(name = "producto_mostrar_referencia")
    val productoMostrarReferencia: Boolean = true,

    @Column(name = "producto_mostrar_descuento")
    val productoMostrarDescuento: Boolean = true,

    @Column(name = "producto_mostrar_subtotal")
    val productoMostrarSubtotal: Boolean = true,

    @Column(name = "producto_mostrar_observaciones")
    val productoMostrarObservaciones: Boolean = true,

    // Disposición (layout)
    @Column(name = "layout_empresa_cliente")
    val layoutEmpresaCliente: String = "horizontal", // horizontal, vertical, empresa_arriba, cliente_arriba

    @Column(name = "layout_tabla_productos")
    val layoutTablaProductos: String = "completa", // completa, simple, detallada

    // Estilos
    @Column(name = "color_primario")
    val colorPrimario: String = "#1a3161",

    @Column(name = "tamano_fuente")
    val tamanoFuente: String = "normal", // pequeño, normal, grande

    @Column(name = "estilo_tabla")
    val estiloTabla: String = "lineas", // lineas, cebra, minimalista

    // Textos personalizados
    @Column(name = "texto_titulo", columnDefinition = "TEXT")
    val textoTitulo: String = "ALBARÁN DE ENTREGA",

    @Column(name = "texto_pie_pagina", columnDefinition = "TEXT")
    val textoPiePagina: String = "Gracias por su confianza",

    // Paginación
    @Column(name = "repetir_encabezados")
    val repetirEncabezados: Boolean = true,

    // Configuración activa
    @Column(name = "activa")
    val activa: Boolean = false
)
