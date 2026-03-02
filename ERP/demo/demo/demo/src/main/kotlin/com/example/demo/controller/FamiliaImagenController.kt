package com.example.demo.controller

import com.example.demo.repository.FamiliaRepository
import org.springframework.core.io.Resource
import org.springframework.core.io.UrlResource
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile
import java.io.IOException
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.Paths
import java.nio.file.StandardCopyOption

@RestController
@RequestMapping("/familias")
@CrossOrigin(origins = ["http://145.223.103.219:3000"])
class FamiliaImagenController(
    private val familiaRepository: FamiliaRepository
) {
    private val imagenesDir: Path = Paths.get("familias-imagenes").toAbsolutePath().normalize()

    init {
        try {
            Files.createDirectories(imagenesDir)
        } catch (ex: Exception) {
            throw RuntimeException("No se pudo crear el directorio de imágenes", ex)
        }
    }

    @PostMapping("/{id}/imagen")
    fun subirImagen(
        @PathVariable id: Long,
        @RequestParam("file") file: MultipartFile
    ): ResponseEntity<Map<String, String>> {
        return familiaRepository.findById(id).map { familia ->
            try {
                val extension = file.originalFilename?.substringAfterLast('.', "") ?: "jpg"
                val nombreArchivo = "${id}.${extension}"
                val targetLocation = imagenesDir.resolve(nombreArchivo)

                Files.copy(file.inputStream, targetLocation, StandardCopyOption.REPLACE_EXISTING)

                val actualizado = familia.copy(imagen = nombreArchivo)
                familiaRepository.save(actualizado)

                ResponseEntity.ok(
                    mapOf(
                        "mensaje" to "Imagen subida correctamente",
                        "nombreArchivo" to nombreArchivo,
                        "url" to "/familias/${id}/imagen"
                    )
                )
            } catch (ex: IOException) {
                ResponseEntity.status(500).body(mapOf("error" to "Error al guardar la imagen"))
            }
        }.orElse(ResponseEntity.notFound().build())
    }

    @GetMapping("/{id}/imagen")
    fun obtenerImagen(@PathVariable id: Long): ResponseEntity<Resource> {
        val familia = familiaRepository.findById(id).orElse(null)
            ?: return ResponseEntity.notFound().build()

        if (familia.imagen.isNullOrBlank()) {
            return ResponseEntity.notFound().build()
        }

        return try {
            val filePath = imagenesDir.resolve(familia.imagen).normalize()
            val resource: Resource = UrlResource(filePath.toUri())

            if (resource.exists() && resource.isReadable) {
                val contentType = Files.probeContentType(filePath) ?: "application/octet-stream"
                ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"${familia.imagen}\"")
                    .body(resource)
            } else {
                ResponseEntity.notFound().build()
            }
        } catch (ex: Exception) {
            ResponseEntity.notFound().build()
        }
    }

    @DeleteMapping("/{id}/imagen")
    fun eliminarImagen(@PathVariable id: Long): ResponseEntity<Map<String, String>> {
        return familiaRepository.findById(id).map { familia ->
            if (familia.imagen.isNullOrBlank()) {
                return@map ResponseEntity.ok(mapOf("mensaje" to "No hay imagen para eliminar"))
            }

            try {
                val filePath = imagenesDir.resolve(familia.imagen).normalize()
                Files.deleteIfExists(filePath)

                val actualizado = familia.copy(imagen = null)
                familiaRepository.save(actualizado)

                ResponseEntity.ok(mapOf("mensaje" to "Imagen eliminada correctamente"))
            } catch (ex: Exception) {
                ResponseEntity.status(500).body(mapOf("error" to "Error al eliminar la imagen"))
            }
        }.orElse(ResponseEntity.notFound().build())
    }
}
