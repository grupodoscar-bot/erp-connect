package com.example.demo.controller

import com.example.demo.model.ArchivoEmpresa
import com.example.demo.repository.ArchivoEmpresaRepository
import org.springframework.core.io.Resource
import org.springframework.core.io.UrlResource
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile
import java.io.File
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.Paths
import java.time.LocalDateTime
import java.util.*

@RestController
@RequestMapping("/archivos-empresa")
@CrossOrigin(origins = ["http://localhost:3000"])
class ArchivoEmpresaController(
    private val archivoRepository: ArchivoEmpresaRepository
) {
    
    private val directorioBase: Path = detectarRaizProyecto().resolve("disco_virtual")

    init {
        // Crear directorio base si no existe
        if (!Files.exists(directorioBase)) {
            Files.createDirectories(directorioBase)
        }
    }

    private fun detectarRaizProyecto(): Path {
        val currentDir = Paths.get(System.getProperty("user.dir")).toAbsolutePath().normalize()

        // Buscar hacia arriba algún directorio que contenga los proyectos principales
        val raiz = generateSequence(currentDir) { it.parent }
            .firstOrNull { dir ->
                Files.exists(dir.resolve("mi-web-react")) && Files.exists(dir.resolve("demo"))
            }

        return raiz ?: currentDir.parent ?: currentDir
    }

    private fun resolverRutaFisica(rutaCarpeta: String): Path {
        if (rutaCarpeta.isBlank() || rutaCarpeta == "/") {
            return directorioBase
        }

        val segmentos = rutaCarpeta.trim('/')
            .split("/")
            .filter { it.isNotBlank() && it != "." }

        var ruta = directorioBase
        var rutaVirtual = "/"

        segmentos.forEach { segmento ->
            val limpio = segmento.replace("..", "")
            val registro = archivoRepository.findByRutaCarpetaAndNombre(rutaVirtual, limpio)
            val nombreFisico = registro?.nombreArchivoSistema ?: limpio

            ruta = ruta.resolve(nombreFisico)
            rutaVirtual = if (rutaVirtual == "/") "/$limpio" else "$rutaVirtual/$limpio"
        }

        return ruta
    }

    @GetMapping
    fun listarArchivos(@RequestParam(defaultValue = "/") rutaCarpeta: String): List<ArchivoEmpresa> {
        return archivoRepository.findByRutaCarpetaOrderByEsCarpetaDescNombreAsc(rutaCarpeta)
    }

    @PostMapping("/carpeta")
    fun crearCarpeta(@RequestBody datos: Map<String, String>): ResponseEntity<ArchivoEmpresa> {
        val rutaCarpeta = datos["rutaCarpeta"] ?: "/"
        val nombre = datos["nombre"] ?: return ResponseEntity.badRequest().build()

        // Verificar si ya existe
        if (archivoRepository.existsByRutaCarpetaAndNombre(rutaCarpeta, nombre)) {
            return ResponseEntity.badRequest().build()
        }

        val nombreFisico = UUID.randomUUID().toString()
        val rutaFisica = resolverRutaFisica(rutaCarpeta).resolve(nombreFisico)
        Files.createDirectories(rutaFisica)

        val carpeta = ArchivoEmpresa(
            nombre = nombre,
            rutaCarpeta = rutaCarpeta,
            esCarpeta = true,
            nombreArchivoSistema = nombreFisico
        )

        return ResponseEntity.ok(archivoRepository.save(carpeta))
    }

    @PostMapping("/subir")
    fun subirArchivo(
        @RequestParam("archivo") archivo: MultipartFile,
        @RequestParam("rutaCarpeta") rutaCarpeta: String
    ): ResponseEntity<ArchivoEmpresa> {
        if (archivo.isEmpty) {
            return ResponseEntity.badRequest().body(null)
        }

        val nombreOriginal = archivo.originalFilename ?: "archivo"
        
        // Nota: Permitimos archivos con mismo nombre para adjuntos de documentos
        // El nombre físico en disco siempre es único (UUID)

        // Generar nombre único para el sistema de archivos
        val extension = nombreOriginal.substringAfterLast(".", "")
        val nombreSistema = "${UUID.randomUUID()}${if (extension.isNotEmpty()) ".$extension" else ""}"
        
        // Guardar archivo físicamente
        val rutaDirectorio = resolverRutaFisica(rutaCarpeta)
        if (!Files.exists(rutaDirectorio)) {
            Files.createDirectories(rutaDirectorio)
        }
        val rutaArchivo = rutaDirectorio.resolve(nombreSistema)
        Files.copy(archivo.inputStream, rutaArchivo)

        // Guardar registro en BD
        val archivoEmpresa = ArchivoEmpresa(
            nombre = nombreOriginal,
            rutaCarpeta = rutaCarpeta,
            esCarpeta = false,
            nombreArchivoSistema = nombreSistema,
            tipoMime = archivo.contentType,
            tamanoBytes = archivo.size
        )

        return ResponseEntity.ok(archivoRepository.save(archivoEmpresa))
    }

    @GetMapping("/descargar/{id}")
    fun descargarArchivo(@PathVariable id: Long): ResponseEntity<Resource> {
        val archivo = archivoRepository.findById(id).orElse(null)
            ?: return ResponseEntity.notFound().build()

        if (archivo.esCarpeta || archivo.nombreArchivoSistema == null) {
            return ResponseEntity.badRequest().build()
        }

        val rutaArchivo = resolverRutaFisica(archivo.rutaCarpeta).resolve(archivo.nombreArchivoSistema)
        if (!Files.exists(rutaArchivo)) {
            return ResponseEntity.notFound().build()
        }

        val resource: Resource = UrlResource(rutaArchivo.toUri())

        return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType(archivo.tipoMime ?: "application/octet-stream"))
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"${archivo.nombre}\"")
            .body(resource)
    }

    @DeleteMapping("/{id}")
    fun eliminar(@PathVariable id: Long): ResponseEntity<Void> {
        val archivo = archivoRepository.findById(id).orElse(null)
            ?: return ResponseEntity.notFound().build()

        // Si es carpeta, verificar que esté vacía
        if (archivo.esCarpeta) {
            val rutaCarpeta = if (archivo.rutaCarpeta == "/") "/${archivo.nombre}" else "${archivo.rutaCarpeta}/${archivo.nombre}"
            val contenido = archivoRepository.findByRutaCarpetaOrderByEsCarpetaDescNombreAsc(rutaCarpeta)
            if (contenido.isNotEmpty()) {
                return ResponseEntity.badRequest().build() // No se puede eliminar carpeta con contenido
            }

            val nombreFisico = archivo.nombreArchivoSistema ?: archivo.nombre
            val rutaFisica = resolverRutaFisica(archivo.rutaCarpeta).resolve(nombreFisico)
            Files.deleteIfExists(rutaFisica)
        } else {
            // Eliminar archivo físico
            if (archivo.nombreArchivoSistema != null) {
                val rutaArchivo = resolverRutaFisica(archivo.rutaCarpeta).resolve(archivo.nombreArchivoSistema)
                Files.deleteIfExists(rutaArchivo)
            }
        }

        archivoRepository.deleteById(id)
        return ResponseEntity.ok().build()
    }

    @PutMapping("/{id}")
    fun renombrar(@PathVariable id: Long, @RequestBody datos: Map<String, String>): ResponseEntity<ArchivoEmpresa> {
        val archivo = archivoRepository.findById(id).orElse(null)
            ?: return ResponseEntity.notFound().build()

        val nuevoNombre = datos["nombre"] ?: return ResponseEntity.badRequest().build()

        // Verificar que no exista otro con el mismo nombre en la misma carpeta
        val existe = archivoRepository.findByRutaCarpetaOrderByEsCarpetaDescNombreAsc(archivo.rutaCarpeta)
            .any { it.nombre == nuevoNombre && it.id != id }

        if (existe) {
            return ResponseEntity.badRequest().build()
        }

        val actualizado = archivo.copy(
            nombre = nuevoNombre,
            fechaModificacion = LocalDateTime.now()
        )

        return ResponseEntity.ok(archivoRepository.save(actualizado))
    }
}
