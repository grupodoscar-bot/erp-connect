package com.example.demo.model

import jakarta.persistence.*

@Entity
@Table(name = "empresa")
data class Empresa(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(name = "nombre comercial")
    val nombreComercial: String = "",

    @Column(name = "razon")
    val razon: String = "",

    @Column(name = "cif")
    val cif: String = "",

    @Column(name = "direccion")
    val direccion: String = "",

    @Column(name = "codigo postal")
    val codigoPostal: String = "",

    @Column(name = "telefono")
    val telefono: String = "",

    @Column(name = "email")
    val email: String = "",

    @Column(name = "poblacion")
    val poblacion: String = "",

    @Column(name = "provincia")
    val provincia: String = "",

    @Column(name = "pais")
    val pais: String = "",

    @Column(name = "logo")
    val logo: String? = null,

    @Column(name = "empresa_colores_id")
    val empresaColoresId: Int? = null,

    // Configuración de email SMTP
    @Column(name = "smtp_host")
    val smtpHost: String? = null,

    @Column(name = "smtp_port")
    val smtpPort: Int? = null,

    @Column(name = "smtp_username")
    val smtpUsername: String? = null,

    @Column(name = "smtp_password")
    val smtpPassword: String? = null,

    @Column(name = "smtp_auth")
    val smtpAuth: Boolean? = true,

    @Column(name = "smtp_starttls")
    val smtpStarttls: Boolean? = true,

    @Column(name = "modo_visual")
    val modoVisual: String? = "claro"
)
