package com.example.demo.model

import jakarta.persistence.*

@Entity
@Table(name = "usuarios")
data class Usuario(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false, unique = true)
    val usuario: String = "",

    @Column(nullable = false, name = "contrasena")
    val contrasena: String = "",

    @Column(nullable = false, unique = true)
    val dni: String = "",

    @Column(nullable = true)
    val email: String? = null
)
