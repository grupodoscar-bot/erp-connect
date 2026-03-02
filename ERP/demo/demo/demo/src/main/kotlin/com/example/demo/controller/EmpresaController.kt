package com.example.demo.controller

import com.example.demo.model.Empresa
import com.example.demo.model.ArchivoEmpresa
import com.example.demo.repository.EmpresaRepository
import com.example.demo.repository.ArchivoEmpresaRepository
import com.example.demo.service.EmailService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.Paths
import java.nio.file.StandardCopyOption
import java.util.*

@RestController
@RequestMapping("/empresa")
@CrossOrigin(origins = ["http://localhost:3000", "http://145.223.103.219:3000"])
class EmpresaController(
    private val empresaRepository: EmpresaRepository,
    private val archivoRepository: ArchivoEmpresaRepository,
    private val emailService: EmailService
) {

    private val directorioBase: Path = detectarRaizProyecto().resolve("disco_virtual")

    init {
        if (!Files.exists(directorioBase)) {
            Files.createDirectories(directorioBase)
        }
    }

    private fun detectarRaizProyecto(): Path {
        val currentDir = Paths.get(System.getProperty("user.dir")).toAbsolutePath().normalize()
        val raiz = generateSequence(currentDir) { it.parent }
            .firstOrNull { dir ->
                Files.exists(dir.resolve("mi-web-react")) && Files.exists(dir.resolve("demo"))
            }
        return raiz ?: currentDir.parent ?: currentDir
    }

    @GetMapping
    fun obtenerEmpresa(): ResponseEntity<Empresa> {
        val empresa = empresaRepository.findAll().firstOrNull()
        return if (empresa != null) {
            ResponseEntity.ok(empresa)
        } else {
            ResponseEntity.notFound().build()
        }
    }

    @PutMapping("/{id}")
    fun actualizar(
        @PathVariable id: Long,
        @RequestBody datos: Empresa
    ): ResponseEntity<Empresa> {
        return empresaRepository.findById(id)
            .map { existente ->
                val actualizado = existente.copy(
                    nombreComercial = datos.nombreComercial,
                    razon = datos.razon,
                    cif = datos.cif,
                    direccion = datos.direccion,
                    codigoPostal = datos.codigoPostal,
                    telefono = datos.telefono,
                    email = datos.email,
                    poblacion = datos.poblacion,
                    provincia = datos.provincia,
                    pais = datos.pais,
                    logo = datos.logo,
                    empresaColoresId = datos.empresaColoresId,
                    smtpHost = datos.smtpHost,
                    smtpPort = datos.smtpPort,
                    smtpUsername = datos.smtpUsername,
                    smtpPassword = datos.smtpPassword,
                    smtpAuth = datos.smtpAuth,
                    smtpStarttls = datos.smtpStarttls,
                    modoVisual = datos.modoVisual
                )
                ResponseEntity.ok(empresaRepository.save(actualizado))
            }
            .orElse(ResponseEntity.notFound().build())
    }

    @PostMapping("/probar-email")
    fun probarConexionEmail(): ResponseEntity<Map<String, Any>> {
        return try {
            val resultado = emailService.probarConexion()
            ResponseEntity.ok(resultado)
        } catch (e: Exception) {
            ResponseEntity.ok(mapOf(
                "success" to false,
                "mensaje" to "Error al probar conexión: ${e.message}"
            ))
        }
    }

    @PostMapping("/{id}/logo")
    fun subirLogo(
        @PathVariable id: Long,
        @RequestParam("file") file: MultipartFile
    ): ResponseEntity<Map<String, String>> {
        return try {
            val empresa = empresaRepository.findById(id).orElse(null)
                ?: return ResponseEntity.notFound().build()

            if (file.isEmpty) {
                return ResponseEntity.badRequest().body(mapOf("error" to "Archivo vacío"))
            }

            val nombreArchivo = "logo-empresa"
            val rutaCarpeta = "/"

            // Buscar si ya existe un logo anterior y eliminarlo
            val logoAnterior = archivoRepository.findByRutaCarpetaAndNombre(rutaCarpeta, nombreArchivo)
            if (logoAnterior != null) {
                // Eliminar archivo físico anterior
                if (logoAnterior.nombreArchivoSistema != null) {
                    val rutaAnterior = directorioBase.resolve(logoAnterior.nombreArchivoSistema)
                    Files.deleteIfExists(rutaAnterior)
                }
                archivoRepository.deleteById(logoAnterior.id)
            }

            // Generar nombre único para el sistema de archivos
            val extension = file.originalFilename?.substringAfterLast(".", "") ?: "png"
            val nombreSistema = "${UUID.randomUUID()}.${extension}"

            // Guardar archivo físicamente en disco_virtual
            val rutaArchivo = directorioBase.resolve(nombreSistema)
            Files.copy(file.inputStream, rutaArchivo, StandardCopyOption.REPLACE_EXISTING)

            // Guardar registro en BD
            val archivoEmpresa = ArchivoEmpresa(
                nombre = nombreArchivo,
                rutaCarpeta = rutaCarpeta,
                esCarpeta = false,
                nombreArchivoSistema = nombreSistema,
                tipoMime = file.contentType,
                tamanoBytes = file.size
            )
            val archivoGuardado = archivoRepository.save(archivoEmpresa)

            // Actualizar empresa con ID del archivo
            val logoUrl = archivoGuardado.id.toString()
            val actualizado = empresa.copy(logo = logoUrl)
            empresaRepository.save(actualizado)

            ResponseEntity.ok(mapOf("logoUrl" to logoUrl, "archivoId" to archivoGuardado.id.toString()))
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(mapOf("error" to (e.message ?: "Error al subir logo")))
        }
    }

    @GetMapping("/logo/{archivoId}")
    fun obtenerLogo(@PathVariable archivoId: Long): ResponseEntity<org.springframework.core.io.Resource> {
        val archivo = archivoRepository.findById(archivoId).orElse(null)
            ?: return ResponseEntity.notFound().build()

        if (archivo.nombreArchivoSistema == null) {
            return ResponseEntity.notFound().build()
        }

        val rutaArchivo = directorioBase.resolve(archivo.nombreArchivoSistema)
        if (!Files.exists(rutaArchivo)) {
            return ResponseEntity.notFound().build()
        }

        val resource = org.springframework.core.io.UrlResource(rutaArchivo.toUri())
        return ResponseEntity.ok()
            .contentType(org.springframework.http.MediaType.parseMediaType(archivo.tipoMime ?: "image/png"))
            .body(resource)
    }
}
