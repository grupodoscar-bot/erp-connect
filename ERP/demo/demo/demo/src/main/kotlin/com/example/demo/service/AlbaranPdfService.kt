package com.example.demo.service

import com.example.demo.model.Direccion
import com.example.demo.model.ventas.Albaran
import com.example.demo.model.PlantillaPdf
import com.example.demo.repository.ArchivoEmpresaRepository
import com.example.demo.repository.EmpresaRepository
import com.example.demo.repository.DireccionRepository
import com.example.demo.repository.PlantillaPdfRepository
import com.itextpdf.io.image.ImageDataFactory
import com.itextpdf.kernel.colors.ColorConstants
import com.itextpdf.kernel.colors.DeviceRgb
import com.itextpdf.kernel.colors.WebColors
import com.itextpdf.kernel.events.Event
import com.itextpdf.kernel.events.IEventHandler
import com.itextpdf.kernel.events.PdfDocumentEvent
import com.itextpdf.kernel.geom.Rectangle
import com.itextpdf.kernel.pdf.PdfDocument
import com.itextpdf.kernel.pdf.PdfPage
import com.itextpdf.kernel.pdf.PdfWriter
import com.itextpdf.kernel.pdf.canvas.PdfCanvas
import com.itextpdf.layout.Canvas
import com.itextpdf.layout.Document
import com.itextpdf.layout.element.Cell
import com.itextpdf.layout.element.Image
import com.itextpdf.layout.element.Paragraph
import com.itextpdf.layout.element.Table
import com.itextpdf.layout.element.Text
import com.itextpdf.layout.properties.HorizontalAlignment
import com.itextpdf.layout.properties.Property
import com.itextpdf.layout.properties.TextAlignment
import com.itextpdf.layout.properties.UnitValue
import org.springframework.stereotype.Service
import java.io.ByteArrayOutputStream
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.Paths
import java.time.format.DateTimeFormatter

@Service
class AlbaranPdfService(
    private val empresaRepository: EmpresaRepository,
    private val plantillaPdfRepository: PlantillaPdfRepository,
    private val archivoRepository: ArchivoEmpresaRepository,
    private val direccionRepository: DireccionRepository
) {

    private val directorioBase: Path = detectarRaizProyecto().resolve("disco_virtual")

    private fun detectarRaizProyecto(): Path {
        val currentDir = Paths.get(System.getProperty("user.dir")).toAbsolutePath().normalize()
        val raiz = generateSequence(currentDir) { it.parent }
            .firstOrNull { dir ->
                Files.exists(dir.resolve("mi-web-react")) && Files.exists(dir.resolve("demo"))
            }
        return raiz ?: currentDir.parent ?: currentDir
    }

    fun generarPdfMultiple(albaranes: List<Albaran>, plantillaId: Long? = null): ByteArray {
        val plantilla = if (plantillaId != null) {
            plantillaPdfRepository.findById(plantillaId).orElse(null)
        } else {
            plantillaPdfRepository.findByActivaTrue()
        } ?: crearPlantillaPorDefecto()

        val outputStream = ByteArrayOutputStream()
        val writer = PdfWriter(outputStream)
        val pdfDoc = PdfDocument(writer)
        val document = Document(pdfDoc)

        val colorPrimario = try {
            WebColors.getRGBColor(plantilla.colorPrimario)
        } catch (e: Exception) {
            DeviceRgb(26, 49, 97)
        }

        val tamanoBase = when (plantilla.tamanoFuente) {
            "pequeño" -> 0.9f
            "grande" -> 1.1f
            else -> 1.0f
        }

        // Generar cada albarán en una nueva página
        albaranes.forEachIndexed { index, albaran ->
            if (index > 0) {
                document.add(com.itextpdf.layout.element.AreaBreak())
            }

            // Logo y Título
            if (plantilla.mostrarLogo) {
                agregarLogoYTitulo(document, plantilla, colorPrimario, tamanoBase)
            } else {
                val titulo = Paragraph(plantilla.textoTitulo)
                    .setFontSize(24f * tamanoBase)
                    .setBold()
                    .setFontColor(colorPrimario)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(20f)
                document.add(titulo)
            }

            // Empresa y Cliente según layout
            when (plantilla.layoutEmpresaCliente) {
                "horizontal" -> agregarEmpresaClienteHorizontal(document, albaran, plantilla, colorPrimario, tamanoBase)
                "vertical" -> agregarEmpresaClienteVertical(document, albaran, plantilla, colorPrimario, tamanoBase)
                "empresa_arriba" -> agregarEmpresaArriba(document, albaran, plantilla, colorPrimario, tamanoBase)
                "cliente_arriba" -> agregarClienteArriba(document, albaran, plantilla, colorPrimario, tamanoBase)
                else -> agregarEmpresaClienteVertical(document, albaran, plantilla, colorPrimario, tamanoBase)
            }

            // Línea separadora
            val linea = Table(1).useAllAvailableWidth().setMarginBottom(15f)
            linea.addCell(
                Cell().add(Paragraph(""))
                    .setHeight(2f)
                    .setBackgroundColor(colorPrimario)
                    .setBorder(null)
            )
            document.add(linea)

            // Tabla de productos
            agregarTablaProductos(document, albaran, plantilla, colorPrimario, tamanoBase)

            // Totales
            agregarTotales(document, albaran, colorPrimario, tamanoBase)

            // Observaciones
            if (plantilla.mostrarObservaciones && albaran.observaciones.isNotBlank()) {
                agregarObservaciones(document, albaran.observaciones, colorPrimario, tamanoBase)
            }

            // Pie de página
            if (plantilla.mostrarPiePagina) {
                agregarPiePagina(document, plantilla.textoPiePagina, tamanoBase)
            }
        }

        document.close()
        return outputStream.toByteArray()
    }

    fun generarPdf(albaran: Albaran, plantillaId: Long? = null): ByteArray {
        val plantilla = if (plantillaId != null) {
            plantillaPdfRepository.findById(plantillaId).orElse(null)
        } else {
            plantillaPdfRepository.findByActivaTrue()
        } ?: crearPlantillaPorDefecto()

        val outputStream = ByteArrayOutputStream()
        val writer = PdfWriter(outputStream)
        val pdfDoc = PdfDocument(writer)
        val document = Document(pdfDoc)

        val colorPrimario = try {
            WebColors.getRGBColor(plantilla.colorPrimario)
        } catch (e: Exception) {
            DeviceRgb(26, 49, 97)
        }

        val tamanoBase = when (plantilla.tamanoFuente) {
            "pequeño" -> 0.9f
            "grande" -> 1.1f
            else -> 1.0f
        }

        // Logo y Título
        if (plantilla.mostrarLogo) {
            agregarLogoYTitulo(document, plantilla, colorPrimario, tamanoBase)
        } else {
            val titulo = Paragraph(plantilla.textoTitulo)
                .setFontSize(24f * tamanoBase)
                .setBold()
                .setFontColor(colorPrimario)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(20f)
            document.add(titulo)
        }

        // Empresa y Cliente según layout
        when (plantilla.layoutEmpresaCliente) {
            "horizontal" -> agregarEmpresaClienteHorizontal(document, albaran, plantilla, colorPrimario, tamanoBase)
            "vertical" -> agregarEmpresaClienteVertical(document, albaran, plantilla, colorPrimario, tamanoBase)
            "empresa_arriba" -> agregarEmpresaArriba(document, albaran, plantilla, colorPrimario, tamanoBase)
            "cliente_arriba" -> agregarClienteArriba(document, albaran, plantilla, colorPrimario, tamanoBase)
            else -> agregarEmpresaClienteVertical(document, albaran, plantilla, colorPrimario, tamanoBase)
        }

        // Línea separadora
        val linea = Table(1).useAllAvailableWidth().setMarginBottom(15f)
        linea.addCell(
            Cell().add(Paragraph(""))
                .setHeight(2f)
                .setBackgroundColor(colorPrimario)
                .setBorder(null)
        )
        document.add(linea)

        // Tabla de productos
        agregarTablaProductos(document, albaran, plantilla, colorPrimario, tamanoBase)

        // Totales
        agregarTotales(document, albaran, colorPrimario, tamanoBase)

        // Observaciones
        if (plantilla.mostrarObservaciones && albaran.observaciones.isNotBlank()) {
            agregarObservaciones(document, albaran.observaciones, colorPrimario, tamanoBase)
        }

        // Pie de página
        if (plantilla.mostrarPiePagina) {
            agregarPiePagina(document, plantilla.textoPiePagina, tamanoBase)
        }

        document.close()
        return outputStream.toByteArray()
    }

    private fun agregarEmpresaClienteHorizontal(
        document: Document,
        albaran: Albaran,
        plantilla: PlantillaPdf,
        colorPrimario: DeviceRgb,
        tamanoBase: Float
    ) {
        val table = Table(UnitValue.createPercentArray(floatArrayOf(1f, 1f, 1f)))
            .useAllAvailableWidth()
            .setMarginBottom(20f)

        if (plantilla.mostrarEmpresa) {
            table.addCell(
                Cell().add(crearParrafoEmpresa(plantilla, colorPrimario, tamanoBase))
                    .setBorder(null)
                    .setPadding(10f)
                    .setBackgroundColor(DeviceRgb(248, 250, 252))
            )
        }

        if (plantilla.mostrarCliente) {
            table.addCell(
                Cell().add(crearParrafoCliente(albaran, plantilla, colorPrimario, tamanoBase))
                    .setBorder(null)
                    .setPadding(10f)
                    .setBackgroundColor(DeviceRgb(248, 250, 252))
            )
        }

        if (plantilla.mostrarDatosAlbaran) {
            table.addCell(
                Cell().add(crearParrafoAlbaran(albaran, plantilla, colorPrimario, tamanoBase))
                    .setBorder(null)
                    .setPadding(10f)
                    .setBackgroundColor(DeviceRgb(248, 250, 252))
            )
        }

        document.add(table)
    }

    private fun agregarEmpresaArriba(
        document: Document,
        albaran: Albaran,
        plantilla: PlantillaPdf,
        colorPrimario: DeviceRgb,
        tamanoBase: Float
    ) {
        val table = Table(UnitValue.createPercentArray(floatArrayOf(1f, 1f)))
            .useAllAvailableWidth()
            .setMarginBottom(20f)

        if (plantilla.mostrarEmpresa) {
            table.addCell(
                Cell(1, 2).add(crearParrafoEmpresa(plantilla, colorPrimario, tamanoBase))
                    .setBorder(null)
                    .setPadding(10f)
                    .setBackgroundColor(DeviceRgb(248, 250, 252))
            )
        }

        val segundaFila = mutableListOf<Cell>()
        if (plantilla.mostrarCliente) {
            segundaFila.add(
                Cell().add(crearParrafoCliente(albaran, plantilla, colorPrimario, tamanoBase))
                    .setBorder(null)
                    .setPadding(10f)
                    .setBackgroundColor(DeviceRgb(248, 250, 252))
            )
        }
        if (plantilla.mostrarDatosAlbaran) {
            segundaFila.add(
                Cell().add(crearParrafoAlbaran(albaran, plantilla, colorPrimario, tamanoBase))
                    .setBorder(null)
                    .setPadding(10f)
                    .setBackgroundColor(DeviceRgb(248, 250, 252))
            )
        }

        agregarFilaSecundaria(table, segundaFila)

        document.add(table)
    }

    private fun agregarClienteArriba(
        document: Document,
        albaran: Albaran,
        plantilla: PlantillaPdf,
        colorPrimario: DeviceRgb,
        tamanoBase: Float
    ) {
        val table = Table(UnitValue.createPercentArray(floatArrayOf(1f, 1f)))
            .useAllAvailableWidth()
            .setMarginBottom(20f)

        if (plantilla.mostrarCliente) {
            table.addCell(
                Cell(1, 2).add(crearParrafoCliente(albaran, plantilla, colorPrimario, tamanoBase))
                    .setBorder(null)
                    .setPadding(10f)
                    .setBackgroundColor(DeviceRgb(248, 250, 252))
            )
        }

        val segundaFila = mutableListOf<Cell>()
        if (plantilla.mostrarEmpresa) {
            segundaFila.add(
                Cell().add(crearParrafoEmpresa(plantilla, colorPrimario, tamanoBase))
                    .setBorder(null)
                    .setPadding(10f)
                    .setBackgroundColor(DeviceRgb(248, 250, 252))
            )
        }
        if (plantilla.mostrarDatosAlbaran) {
            segundaFila.add(
                Cell().add(crearParrafoAlbaran(albaran, plantilla, colorPrimario, tamanoBase))
                    .setBorder(null)
                    .setPadding(10f)
                    .setBackgroundColor(DeviceRgb(248, 250, 252))
            )
        }

        agregarFilaSecundaria(table, segundaFila)

        document.add(table)
    }

    private fun agregarFilaSecundaria(table: Table, celdas: List<Cell>) {
        when (celdas.size) {
            0 -> return
            1 -> {
                table.addCell(celdas.first())
                table.addCell(
                    Cell().setBorder(null)
                        .setPadding(10f)
                        .setBackgroundColor(DeviceRgb(248, 250, 252))
                )
            }
            else -> celdas.forEach { table.addCell(it) }
        }
    }

    private fun agregarEmpresaClienteVertical(
        document: Document,
        albaran: Albaran,
        plantilla: PlantillaPdf,
        colorPrimario: DeviceRgb,
        tamanoBase: Float
    ) {
        if (plantilla.mostrarEmpresa) {
            agregarDatosEmpresa(document, plantilla, colorPrimario, tamanoBase, true)
        }
        if (plantilla.mostrarCliente) {
            agregarDatosCliente(document, albaran, plantilla, colorPrimario, tamanoBase, true)
        }
        if (plantilla.mostrarDatosAlbaran) {
            agregarDatosAlbaran(document, albaran, plantilla, colorPrimario, tamanoBase, true)
        }
    }

    private fun agregarLogoYTitulo(
        document: Document,
        plantilla: PlantillaPdf,
        colorPrimario: DeviceRgb,
        tamanoBase: Float
    ) {
        val empresa = empresaRepository.findAll().firstOrNull()
        val logoArchivo = empresa?.logo?.toLongOrNull()?.let { archivoRepository.findById(it).orElse(null) }

        if (logoArchivo?.nombreArchivoSistema != null) {
            try {
                val rutaLogo = directorioBase.resolve(logoArchivo.nombreArchivoSistema)
                if (Files.exists(rutaLogo)) {
                    val imageData = ImageDataFactory.create(rutaLogo.toAbsolutePath().toString())
                    val logo = Image(imageData)
                        .setWidth(120f * tamanoBase)
                        .setHeight(60f * tamanoBase)
                        .setHorizontalAlignment(HorizontalAlignment.CENTER)

                    val titulo = Paragraph(plantilla.textoTitulo)
                        .setFontSize(24f * tamanoBase)
                        .setBold()
                        .setFontColor(colorPrimario)
                        .setTextAlignment(TextAlignment.CENTER)
                        .setMarginTop(10f)

                    val headerTable = Table(1).useAllAvailableWidth().setMarginBottom(20f)
                    headerTable.addCell(
                        Cell().add(logo)
                            .setBorder(null)
                            .setTextAlignment(TextAlignment.CENTER)
                    )
                    headerTable.addCell(
                        Cell().add(titulo)
                            .setBorder(null)
                            .setTextAlignment(TextAlignment.CENTER)
                    )
                    document.add(headerTable)
                    return
                }
            } catch (e: Exception) {
                // Si falla, mostrar solo título
            }
        }

        val titulo = Paragraph(plantilla.textoTitulo)
            .setFontSize(24f * tamanoBase)
            .setBold()
            .setFontColor(colorPrimario)
            .setTextAlignment(TextAlignment.CENTER)
            .setMarginBottom(20f)
        document.add(titulo)
    }

    private fun agregarDatosEmpresa(
        document: Document,
        plantilla: PlantillaPdf,
        colorPrimario: DeviceRgb,
        tamanoBase: Float,
        conFondo: Boolean
    ) {
        val table = Table(1).useAllAvailableWidth().setMarginBottom(15f)
        table.addCell(
            Cell().add(crearParrafoEmpresa(plantilla, colorPrimario, tamanoBase))
                .setBorder(null)
                .setPadding(10f)
                .apply {
                    if (conFondo) setBackgroundColor(DeviceRgb(248, 250, 252))
                }
        )
        document.add(table)
    }

    private fun agregarDatosCliente(
        document: Document,
        albaran: Albaran,
        plantilla: PlantillaPdf,
        colorPrimario: DeviceRgb,
        tamanoBase: Float,
        conFondo: Boolean
    ) {
        val table = Table(1).useAllAvailableWidth().setMarginBottom(15f)
        table.addCell(
            Cell().add(crearParrafoCliente(albaran, plantilla, colorPrimario, tamanoBase))
                .setBorder(null)
                .setPadding(10f)
                .apply {
                    if (conFondo) setBackgroundColor(DeviceRgb(248, 250, 252))
                }
        )
        document.add(table)
    }

    private fun agregarDatosAlbaran(
        document: Document,
        albaran: Albaran,
        plantilla: PlantillaPdf,
        colorPrimario: DeviceRgb,
        tamanoBase: Float,
        conFondo: Boolean
    ) {
        val table = Table(1).useAllAvailableWidth().setMarginBottom(15f)
        table.addCell(
            Cell().add(crearParrafoAlbaran(albaran, plantilla, colorPrimario, tamanoBase))
                .setBorder(null)
                .setPadding(10f)
                .apply {
                    if (conFondo) setBackgroundColor(DeviceRgb(248, 250, 252))
                }
        )
        document.add(table)
    }

    private fun crearParrafoEmpresa(
        plantilla: PlantillaPdf,
        colorPrimario: DeviceRgb,
        tamanoBase: Float
    ): Paragraph {
        val empresa = empresaRepository.findAll().firstOrNull()
        val parrafo = Paragraph()
        
        // Título en su propia línea
        parrafo.add(com.itextpdf.layout.element.Text("EMPRESA\n")
            .setBold()
            .setFontSize(12f * tamanoBase)
            .setFontColor(colorPrimario))

        if (empresa != null) {
            val nombreEmpresa = if (empresa.nombreComercial.isNotBlank())
                empresa.nombreComercial
            else
                empresa.razon.ifBlank { "MI EMPRESA" }

            parrafo.add(Paragraph(nombreEmpresa).setBold().setFontSize(11f * tamanoBase))

            if (plantilla.empresaMostrarRazon && empresa.razon.isNotBlank() && empresa.razon != empresa.nombreComercial) {
                parrafo.add(Paragraph(empresa.razon).setFontSize(10f * tamanoBase))
            }
            if (plantilla.empresaMostrarCif && empresa.cif.isNotBlank()) {
                parrafo.add(Paragraph("CIF: ${empresa.cif}").setFontSize(10f * tamanoBase))
            }
            if (plantilla.empresaMostrarDireccion && empresa.direccion.isNotBlank()) {
                parrafo.add(Paragraph(empresa.direccion).setFontSize(10f * tamanoBase))
                val ubicacion = buildString {
                    if (empresa.codigoPostal.isNotBlank()) append("${empresa.codigoPostal} ")
                    if (empresa.poblacion.isNotBlank()) append("${empresa.poblacion}, ")
                    if (empresa.provincia.isNotBlank()) append(empresa.provincia)
                }
                if (ubicacion.isNotBlank()) {
                    parrafo.add(Paragraph(ubicacion.trimEnd(',', ' ')).setFontSize(10f * tamanoBase))
                }
            }
            if (plantilla.empresaMostrarTelefono && empresa.telefono.isNotBlank()) {
                parrafo.add(Paragraph("Tel: ${empresa.telefono}").setFontSize(10f * tamanoBase))
            }
            if (plantilla.empresaMostrarEmail && empresa.email.isNotBlank()) {
                parrafo.add(Paragraph("Email: ${empresa.email}").setFontSize(10f * tamanoBase))
            }
        }

        return parrafo
    }

    private fun crearParrafoCliente(
        albaran: Albaran,
        plantilla: PlantillaPdf,
        colorPrimario: DeviceRgb,
        tamanoBase: Float
    ): Paragraph {
        val cliente = albaran.cliente
        val parrafo = Paragraph()

        parrafo.add(
            com.itextpdf.layout.element.Text("CLIENTE\n")
                .setBold()
                .setFontSize(12f * tamanoBase)
                .setFontColor(colorPrimario)
        )

        parrafo.add(
            Paragraph(cliente?.nombreComercial ?: "Sin cliente")
                .setBold()
                .setFontSize(11f * tamanoBase)
        )

        if (cliente != null) {
            if (plantilla.clienteMostrarNif && cliente.nifCif.isNotBlank()) {
                parrafo.add(Paragraph("NIF/CIF: ${cliente.nifCif}").setFontSize(10f * tamanoBase))
            }
            if (plantilla.clienteMostrarDireccion) {
                val direcciones = direccionRepository.findByTipoTerceroAndIdTercero(
                    Direccion.TipoTercero.CLIENTE,
                    cliente.id
                )
                val direccionPrincipal = direcciones.firstOrNull()
                if (direccionPrincipal != null) {
                    if (direccionPrincipal.direccion.isNotBlank()) {
                        parrafo.add(Paragraph(direccionPrincipal.direccion).setFontSize(10f * tamanoBase))
                    }
                    val ubicacion = buildString {
                        if (!direccionPrincipal.codigoPostal.isNullOrBlank()) append("${direccionPrincipal.codigoPostal} ")
                        if (!direccionPrincipal.poblacion.isNullOrBlank()) append("${direccionPrincipal.poblacion}, ")
                        if (!direccionPrincipal.provincia.isNullOrBlank()) append(direccionPrincipal.provincia)
                        if (!direccionPrincipal.pais.isNullOrBlank()) append(" (${direccionPrincipal.pais})")
                    }.trim()
                    if (ubicacion.isNotBlank()) {
                        parrafo.add(Paragraph(ubicacion.trimEnd(',', ' ')).setFontSize(10f * tamanoBase))
                    }
                }
            }
            if (plantilla.clienteMostrarTelefono) {
                val telefono = if (cliente.telefonoFijo.isNotBlank()) cliente.telefonoFijo else cliente.telefonoMovil
                if (telefono.isNotBlank()) {
                    parrafo.add(Paragraph("Tel: $telefono").setFontSize(10f * tamanoBase))
                }
            }
            if (plantilla.clienteMostrarEmail && cliente.email.isNotBlank()) {
                parrafo.add(Paragraph("Email: ${cliente.email}").setFontSize(10f * tamanoBase))
            }
        }

        return parrafo
    }

    private fun crearParrafoAlbaran(
        albaran: Albaran,
        plantilla: PlantillaPdf,
        colorPrimario: DeviceRgb,
        tamanoBase: Float
    ): Paragraph {
        val parrafo = Paragraph()
        
        // Título en su propia línea
        parrafo.add(com.itextpdf.layout.element.Text("DATOS DEL ALBARÁN\n")
            .setBold()
            .setFontSize(12f * tamanoBase)
            .setFontColor(colorPrimario))
        
        return parrafo
            .add(Paragraph("Número: ${albaran.numero}").setBold().setFontSize(11f * tamanoBase))
            .add(Paragraph("Fecha: ${albaran.fecha.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))}").setFontSize(10f * tamanoBase))
            .add(Paragraph("Estado: ${albaran.estado}").setFontSize(10f * tamanoBase))
    }

    private fun agregarTablaProductos(
        document: Document,
        albaran: Albaran,
        plantilla: PlantillaPdf,
        colorPrimario: DeviceRgb,
        tamanoBase: Float
    ) {
        val columnas = mutableListOf<Float>()
        val headers = mutableListOf<String>()

        headers.add("Producto")
        columnas.add(3f)

        headers.add("Cant.")
        columnas.add(1f)

        headers.add("Precio Unit.")
        columnas.add(1.5f)

        if (plantilla.productoMostrarDescuento) {
            headers.add("Desc. %")
            columnas.add(1f)
        }

        if (plantilla.productoMostrarSubtotal) {
            headers.add("Subtotal")
            columnas.add(1.5f)
        }

        headers.add("Total")
        columnas.add(1.5f)

        val productosTable = Table(UnitValue.createPercentArray(columnas.toFloatArray()))
            .useAllAvailableWidth()
            .setMarginBottom(15f)

        // Encabezados
        headers.forEach { header ->
            productosTable.addHeaderCell(
                Cell().add(Paragraph(header).setBold().setFontSize(10f * tamanoBase))
                    .setBackgroundColor(colorPrimario)
                    .setFontColor(ColorConstants.WHITE)
                    .setPadding(8f)
                    .setTextAlignment(TextAlignment.CENTER)
            )
        }

        // Aplicar estilo de tabla
        val fondoCebra = plantilla.estiloTabla == "cebra"
        var fila = 0

        // Líneas de productos
        albaran.lineas.forEach { linea ->
            val producto = linea.producto
            val nombreProducto = buildString {
                append(producto?.titulo ?: "Producto desconocido")
                if (plantilla.productoMostrarReferencia && producto?.referencia?.isNotBlank() == true) {
                    append(" (Ref: ${producto.referencia})")
                }
            }

            // Verificar si tiene observaciones para mantener juntas las filas
            val tieneObservaciones = plantilla.productoMostrarObservaciones && !linea.observaciones.isNullOrBlank()

            val celdaProducto = Cell().add(Paragraph(nombreProducto).setFontSize(9f * tamanoBase))
                .setPadding(6f)
            if (fondoCebra && fila % 2 == 1) celdaProducto.setBackgroundColor(DeviceRgb(248, 250, 252))
            if (tieneObservaciones) {
                celdaProducto.setKeepTogether(true)
                celdaProducto.setProperty(Property.KEEP_WITH_NEXT, true)
            }
            productosTable.addCell(celdaProducto)

            val celdaCantidad = Cell().add(Paragraph(linea.cantidad.toString()).setFontSize(9f * tamanoBase))
                .setPadding(6f)
                .setTextAlignment(TextAlignment.CENTER)
            if (fondoCebra && fila % 2 == 1) celdaCantidad.setBackgroundColor(DeviceRgb(248, 250, 252))
            if (tieneObservaciones) celdaCantidad.setKeepTogether(true)
            productosTable.addCell(celdaCantidad)

            val celdaPrecio = Cell().add(Paragraph(String.format("%.2f €", linea.precioUnitario)).setFontSize(9f * tamanoBase))
                .setPadding(6f)
                .setTextAlignment(TextAlignment.RIGHT)
            if (fondoCebra && fila % 2 == 1) celdaPrecio.setBackgroundColor(DeviceRgb(248, 250, 252))
            if (tieneObservaciones) celdaPrecio.setKeepTogether(true)
            productosTable.addCell(celdaPrecio)

            if (plantilla.productoMostrarDescuento) {
                val celdaDescuento = Cell().add(Paragraph(String.format("%.2f%%", linea.descuento)).setFontSize(9f * tamanoBase))
                    .setPadding(6f)
                    .setTextAlignment(TextAlignment.CENTER)
                if (fondoCebra && fila % 2 == 1) celdaDescuento.setBackgroundColor(DeviceRgb(248, 250, 252))
                if (tieneObservaciones) celdaDescuento.setKeepTogether(true)
                productosTable.addCell(celdaDescuento)
            }

            if (plantilla.productoMostrarSubtotal) {
                val subtotal = linea.cantidad * linea.precioUnitario
                val celdaSubtotal = Cell().add(Paragraph(String.format("%.2f €", subtotal)).setFontSize(9f * tamanoBase))
                    .setPadding(6f)
                    .setTextAlignment(TextAlignment.RIGHT)
                if (fondoCebra && fila % 2 == 1) celdaSubtotal.setBackgroundColor(DeviceRgb(248, 250, 252))
                if (tieneObservaciones) celdaSubtotal.setKeepTogether(true)
                productosTable.addCell(celdaSubtotal)
            }

            val descuentoLinea = (linea.cantidad * linea.precioUnitario) * (linea.descuento / 100)
            val totalLinea = (linea.cantidad * linea.precioUnitario) - descuentoLinea
            val celdaTotal = Cell().add(Paragraph(String.format("%.2f €", totalLinea)).setFontSize(9f * tamanoBase).setBold())
                .setPadding(6f)
                .setTextAlignment(TextAlignment.RIGHT)
            if (fondoCebra && fila % 2 == 1) celdaTotal.setBackgroundColor(DeviceRgb(248, 250, 252))
            if (tieneObservaciones) celdaTotal.setKeepTogether(true)
            productosTable.addCell(celdaTotal)

            // Añadir fila de observaciones si está configurado y hay observaciones
            if (tieneObservaciones) {
                val celdaObservaciones = Cell(1, columnas.size)
                    .add(Paragraph("Obs: ${linea.observaciones}")
                        .setFontSize(8f * tamanoBase)
                        .setItalic()
                        .setFontColor(ColorConstants.DARK_GRAY))
                    .setPadding(4f)
                    .setPaddingLeft(20f)
                    .setBackgroundColor(DeviceRgb(250, 250, 250))
                    .setKeepTogether(true)
                productosTable.addCell(celdaObservaciones)
            }

            fila++
        }

        document.add(productosTable)
    }

    private fun agregarTotales(
        document: Document,
        albaran: Albaran,
        colorPrimario: DeviceRgb,
        tamanoBase: Float
    ) {
        val totalesTable = Table(UnitValue.createPercentArray(floatArrayOf(3f, 1f)))
            .useAllAvailableWidth()
            .setMarginBottom(20f)

        totalesTable.addCell(
            Cell().add(Paragraph("Subtotal:").setTextAlignment(TextAlignment.RIGHT).setFontSize(11f * tamanoBase))
                .setBorder(null)
                .setPadding(5f)
        )
        totalesTable.addCell(
            Cell().add(Paragraph(String.format("%.2f €", albaran.subtotal)).setTextAlignment(TextAlignment.RIGHT).setFontSize(11f * tamanoBase))
                .setBorder(null)
                .setPadding(5f)
        )

        totalesTable.addCell(
            Cell().add(Paragraph("Descuento:").setTextAlignment(TextAlignment.RIGHT).setFontSize(11f * tamanoBase))
                .setBorder(null)
                .setPadding(5f)
        )
        totalesTable.addCell(
            Cell().add(Paragraph(String.format("-%.2f €", albaran.descuentoTotal)).setTextAlignment(TextAlignment.RIGHT).setFontSize(11f * tamanoBase).setFontColor(ColorConstants.RED))
                .setBorder(null)
                .setPadding(5f)
        )

        totalesTable.addCell(
            Cell().add(Paragraph("TOTAL:").setTextAlignment(TextAlignment.RIGHT).setBold().setFontSize(13f * tamanoBase).setFontColor(colorPrimario))
                .setBorder(null)
                .setPadding(5f)
                .setBackgroundColor(DeviceRgb(248, 250, 252))
        )
        totalesTable.addCell(
            Cell().add(Paragraph(String.format("%.2f €", albaran.total)).setTextAlignment(TextAlignment.RIGHT).setBold().setFontSize(13f * tamanoBase).setFontColor(colorPrimario))
                .setBorder(null)
                .setPadding(5f)
                .setBackgroundColor(DeviceRgb(248, 250, 252))
        )

        document.add(totalesTable)
    }

    private fun agregarObservaciones(
        document: Document,
        observaciones: String,
        colorPrimario: DeviceRgb,
        tamanoBase: Float
    ) {
        val obsTable = Table(1).useAllAvailableWidth().setMarginBottom(20f)
        obsTable.addCell(
            Cell().add(
                Paragraph()
                    .add(Paragraph("Observaciones:").setBold().setFontSize(11f * tamanoBase).setFontColor(colorPrimario))
                    .add(Paragraph(observaciones).setFontSize(10f * tamanoBase))
            )
            .setPadding(10f)
            .setBackgroundColor(DeviceRgb(255, 250, 240))
        )
        document.add(obsTable)
    }

    private fun agregarPiePagina(
        document: Document,
        textoPie: String,
        tamanoBase: Float
    ) {
        val pie = Paragraph(textoPie)
            .setFontSize(10f * tamanoBase)
            .setTextAlignment(TextAlignment.CENTER)
            .setFontColor(ColorConstants.GRAY)
            .setMarginTop(30f)
        document.add(pie)
    }

    private fun crearPlantillaPorDefecto(): PlantillaPdf {
        return PlantillaPdf(
            nombre = "Plantilla por defecto",
            activa = true
        )
    }
}
