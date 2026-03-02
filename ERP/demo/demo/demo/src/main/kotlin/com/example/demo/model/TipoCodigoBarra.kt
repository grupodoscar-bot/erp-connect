package com.example.demo.model

import jakarta.persistence.*

@Entity
@Table(name = "codigo_barra")
data class TipoCodigoBarra(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false)
    val nombre: String = "",

    @Column(columnDefinition = "TEXT")
    val descripcion: String = "",

    @OneToMany(mappedBy = "tipoCodigoBarra", cascade = [CascadeType.ALL], orphanRemoval = true, fetch = FetchType.EAGER)
    val campos: MutableList<CampoCodigoBarra> = mutableListOf()
)
