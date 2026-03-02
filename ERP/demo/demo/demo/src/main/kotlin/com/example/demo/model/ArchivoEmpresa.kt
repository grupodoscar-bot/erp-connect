package com.example.demo.model

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "archivos_empresa")
data class ArchivoEmpresa(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false)
    val nombre: String = "",

    @Column(name = "ruta_carpeta", nullable = false)
    val rutaCarpeta: String = "/", // Ruta de la carpeta donde está el archivo (ej: "/", "/documentos", "/facturas")

    @Column(name = "es_carpeta", nullable = false)
    val esCarpeta: Boolean = false, // true si es carpeta, false si es archivo

    @Column(name = "nombre_archivo_sistema")
    val nombreArchivoSistema: String? = null, // Nombre único del archivo en el sistema de archivos

    @Column(name = "tipo_mime")
    val tipoMime: String? = null, // image/png, application/pdf, etc.

    @Column(name = "tamano_bytes")
    val tamanoBytes: Long? = null,

    @Column(name = "fecha_creacion", nullable = false)
    val fechaCreacion: LocalDateTime = LocalDateTime.now(),

    @Column(name = "fecha_modificacion", nullable = false)
    val fechaModificacion: LocalDateTime = LocalDateTime.now(),

    @Column(name = "documento_origen")
    var documentoOrigen: String? = null,

    @Column(name = "documento_origen_id")
    var documentoOrigenId: Long? = null
)
