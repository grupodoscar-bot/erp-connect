package com.example.demo.service

import com.example.demo.model.Direccion
import com.example.demo.model.ventas.FacturaProforma
import com.example.demo.repository.ClienteRepository
import com.example.demo.repository.DireccionRepository
import com.example.demo.repository.EmpresaRepository
import com.example.demo.repository.ProductoRepository
import com.itextpdf.kernel.colors.DeviceRgb
import com.itextpdf.kernel.pdf.PdfDocument
import com.itextpdf.kernel.pdf.PdfWriter
import com.itextpdf.layout.Document
import com.itextpdf.layout.element.Cell
import com.itextpdf.layout.element.Paragraph
import com.itextpdf.layout.element.Table
import com.itextpdf.layout.properties.TextAlignment
import com.itextpdf.layout.properties.UnitValue
import org.springframework.stereotype.Service
import java.io.ByteArrayOutputStream
import java.time.format.DateTimeFormatter

@Service
class FacturaProformaPdfService(
    private val empresaRepository: EmpresaRepository,
    private val clienteRepository: ClienteRepository,
    private val direccionRepository: DireccionRepository,
    private val productoRepository: ProductoRepository
) {

    fun generarPdf(facturaProforma: FacturaProforma): ByteArray {
        val outputStream = ByteArrayOutputStream()
        val writer = PdfWriter(outputStream)
        val pdfDoc = PdfDocument(writer)
        val document = Document(pdfDoc)

        val colorPrimario = DeviceRgb(59, 77, 122)

        // Título
        val titulo = Paragraph("FACTURA PROFORMA")
            .setFontSize(24f)
            .setBold()
            .setFontColor(colorPrimario)
            .setTextAlignment(TextAlignment.CENTER)
            .setMarginBottom(20f)
        document.add(titulo)

        // Información de la empresa
        val empresa = empresaRepository.findAll().firstOrNull()
        if (empresa != null) {
            val infoEmpresa = Paragraph()
                .add("${empresa.nombreComercial}\n")
                .add("CIF: ${empresa.cif}\n")
                .add("${empresa.direccion}\n")
                .add("${empresa.poblacion}, ${empresa.provincia}\n")
                .setFontSize(10f)
                .setMarginBottom(15f)
            document.add(infoEmpresa)
        }

        // Información del cliente y factura
        val tablaInfo = Table(2).useAllAvailableWidth().setMarginBottom(20f)
        
        // Cliente
        val clienteInfo = facturaProforma.cliente?.let { cliente ->
            val direcciones = direccionRepository.findByTipoTerceroAndIdTercero(
                Direccion.TipoTercero.CLIENTE,
                cliente.id
            )
            val direccionPrincipal = direcciones.firstOrNull()
            buildString {
                append("Cliente: ${cliente.nombreComercial}\n")
                append("NIF/CIF: ${cliente.nifCif}\n")
                direccionPrincipal?.let { dir ->
                    append("Dirección: ${dir.direccion}")
                    val ubicacion = buildString {
                        if (!dir.codigoPostal.isNullOrBlank()) append(" ${dir.codigoPostal}")
                        if (!dir.poblacion.isNullOrBlank()) append(" ${dir.poblacion}")
                        if (!dir.provincia.isNullOrBlank()) append(", ${dir.provincia}")
                        if (!dir.pais.isNullOrBlank()) append(" (${dir.pais})")
                    }.trim()
                    if (ubicacion.isNotBlank()) append("\n$ubicacion")
                }
            }
        } ?: "Sin cliente"
        tablaInfo.addCell(Cell().add(Paragraph(clienteInfo).setFontSize(10f)))
        
        // Factura
        val facturaInfo = "Número: ${facturaProforma.numero}\n" +
            "Fecha: ${facturaProforma.fecha.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))}\n" +
            "Estado: ${facturaProforma.estado}"
        tablaInfo.addCell(Cell().add(Paragraph(facturaInfo).setFontSize(10f)))
        
        document.add(tablaInfo)

        // Tabla de líneas
        val tablaLineas = Table(floatArrayOf(3f, 1f, 2f, 1f, 2f))
            .useAllAvailableWidth()
            .setMarginBottom(20f)

        // Cabecera
        tablaLineas.addHeaderCell(Cell().add(Paragraph("Producto").setBold()).setBackgroundColor(DeviceRgb(208, 214, 228)))
        tablaLineas.addHeaderCell(Cell().add(Paragraph("Cant.").setBold()).setBackgroundColor(DeviceRgb(208, 214, 228)))
        tablaLineas.addHeaderCell(Cell().add(Paragraph("P. Unit.").setBold()).setBackgroundColor(DeviceRgb(208, 214, 228)))
        tablaLineas.addHeaderCell(Cell().add(Paragraph("Desc.").setBold()).setBackgroundColor(DeviceRgb(208, 214, 228)))
        tablaLineas.addHeaderCell(Cell().add(Paragraph("Total").setBold()).setBackgroundColor(DeviceRgb(208, 214, 228)))

        // Líneas
        facturaProforma.lineas.forEach { linea ->
            val nombreProducto = linea.producto?.nombre ?: "Producto eliminado"
            val totalLinea = (linea.cantidad * linea.precioUnitario) * (1 - linea.descuento / 100)
            
            tablaLineas.addCell(Cell().add(Paragraph(nombreProducto).setFontSize(9f)))
            tablaLineas.addCell(Cell().add(Paragraph(linea.cantidad.toString()).setFontSize(9f)))
            tablaLineas.addCell(Cell().add(Paragraph("${linea.precioUnitario} €").setFontSize(9f)))
            tablaLineas.addCell(Cell().add(Paragraph("${linea.descuento}%").setFontSize(9f)))
            tablaLineas.addCell(Cell().add(Paragraph(String.format("%.2f €", totalLinea)).setFontSize(9f)))
        }

        document.add(tablaLineas)

        // Totales
        val tablaTotales = Table(2).useAllAvailableWidth()
        tablaTotales.addCell(Cell().add(Paragraph("Subtotal:").setBold()).setTextAlignment(TextAlignment.RIGHT).setBorder(null))
        tablaTotales.addCell(Cell().add(Paragraph(String.format("%.2f €", facturaProforma.subtotal))).setTextAlignment(TextAlignment.RIGHT).setBorder(null))
        
        tablaTotales.addCell(Cell().add(Paragraph("Descuento:").setBold()).setTextAlignment(TextAlignment.RIGHT).setBorder(null))
        tablaTotales.addCell(Cell().add(Paragraph(String.format("%.2f €", facturaProforma.descuentoTotal))).setTextAlignment(TextAlignment.RIGHT).setBorder(null))
        
        tablaTotales.addCell(Cell().add(Paragraph("TOTAL:").setBold().setFontSize(14f)).setTextAlignment(TextAlignment.RIGHT).setBorder(null))
        tablaTotales.addCell(Cell().add(Paragraph(String.format("%.2f €", facturaProforma.total)).setBold().setFontSize(14f)).setTextAlignment(TextAlignment.RIGHT).setBorder(null))

        document.add(tablaTotales)

        // Observaciones
        if (!facturaProforma.observaciones.isNullOrBlank()) {
            document.add(Paragraph("\nObservaciones:").setBold().setMarginTop(20f))
            document.add(Paragraph(facturaProforma.observaciones).setFontSize(9f))
        }

        document.close()
        return outputStream.toByteArray()
    }
}
