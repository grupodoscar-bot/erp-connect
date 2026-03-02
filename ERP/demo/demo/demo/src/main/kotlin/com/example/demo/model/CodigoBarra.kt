package com.example.demo.model

import jakarta.persistence.*

@Entity
@Table(name = "codigo_barra")
data class CodigoBarra(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false)
    val nombre: String = "",

    @Column(columnDefinition = "TEXT")
    val descripcion: String? = null,

    @Column(length = 20)
    val tipo: String? = null,

    @Column(name = "es_estandar")
    val esEstandar: Boolean = false,

    @Column(name = "longitud_fija")
    val longitudFija: Int? = null,

    @OneToMany(mappedBy = "codigoBarraTipo", cascade = [CascadeType.ALL], fetch = FetchType.LAZY)
    val campos: Set<CodigoBarraCampo> = emptySet()
)
