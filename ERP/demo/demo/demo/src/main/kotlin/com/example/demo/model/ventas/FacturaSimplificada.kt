package com.example.demo.model.ventas

import com.example.demo.model.Cliente
import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonManagedReference
import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "ventas_facturas_simplificadas")
data class FacturaSimplificada(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false, unique = true)
    val numero: String = "",

    @Column(nullable = false)
    val fecha: LocalDateTime = LocalDateTime.now(),

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "cliente_id")
    @JsonIgnoreProperties(value = ["hibernateLazyInitializer", "handler"])
    val cliente: Cliente? = null,

    @OneToMany(mappedBy = "facturaSimplificada", cascade = [CascadeType.ALL], orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference
    val lineas: MutableList<FacturaSimplificadaLinea> = mutableListOf(),

    @Column(columnDefinition = "TEXT")
    val observaciones: String = "",

    @Column(nullable = false)
    val estado: String = "Pendiente",

    @Column(nullable = false)
    val subtotal: Double = 0.0,

    @Column(name = "descuento_total", nullable = false)
    val descuentoTotal: Double = 0.0,

    @Column(nullable = false)
    val total: Double = 0.0,

    @Column(nullable = false)
    val contabilizado: Boolean = false
)
