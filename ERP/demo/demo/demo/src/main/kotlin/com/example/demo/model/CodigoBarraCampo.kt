package com.example.demo.model

import com.fasterxml.jackson.annotation.JsonIgnore
import jakarta.persistence.*

@Entity
@Table(name = "codigo_barra_campos")
data class CodigoBarraCampo(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false)
    val nombre: String = "",

    @Column(nullable = false)
    val longitud: Int = 0,

    @Column(nullable = false)
    val orden: Int = 0,

    @Column(nullable = false)
    val decimales: Int = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "codigo_barra_id")
    @JsonIgnore
    val codigoBarraTipo: CodigoBarra? = null
)
