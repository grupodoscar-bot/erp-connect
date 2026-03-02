package com.example.demo.model

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import jakarta.persistence.*

@Entity
@Table(name = "subfamilias")
data class Subfamilia(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false, unique = true)
    val nombre: String = "",

    @Column(nullable = false)
    val descripcion: String = "",

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "familia_id")
    @JsonIgnoreProperties(value = ["hibernateLazyInitializer", "handler"])
    val familia: Familia? = null,

    val imagen: String? = null
)
