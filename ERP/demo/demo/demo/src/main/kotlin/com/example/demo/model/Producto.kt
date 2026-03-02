package com.example.demo.model

import com.fasterxml.jackson.annotation.JsonIgnore
import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import jakarta.persistence.CascadeType
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.JoinTable
import jakarta.persistence.ManyToMany
import jakarta.persistence.ManyToOne
import jakarta.persistence.OneToMany
import jakarta.persistence.Table

@Entity
@Table(name = "productos")
data class Producto(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false, length = 15)
    val referencia: String = "",

    @Column(nullable = false, length = 60)
    val titulo: String = "",

    @Column(nullable = false)
    val nombre: String = "",

    @Column(nullable = false)
    val precio: Double = 0.0,

    val etiquetas: String = "",

    @Column(name = "descripcion_corta", columnDefinition = "TEXT")
    val descripcionCorta: String = "",

    @Column(columnDefinition = "TEXT")
    val notas: String = "",

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fabricante_id")
    @JsonIgnoreProperties(value = ["hibernateLazyInitializer", "handler"])
    val fabricante: Fabricante? = null,

    val peso: Double = 0.0,

    @Column(name = "unidadmedida")
    val unidadMedida: String? = null,

    @Column(name = "unidadmedidareferencia")
    val unidadMedidaReferencia: String? = null,

    @Column(name = "magnitudporunidad")
    val magnitudPorUnidad: String? = null,

    @Column(name = "ultimo_coste")
    val ultimoCoste: Double = 0.0,

    val descuento: Double = 0.0,

    @Column(name = "precio_bloqueado")
    val precioBloqueado: Boolean = false,

    val margen: Double = 0.0,

    @Column(name = "precio_con_impuestos")
    val precioConImpuestos: Double = 0.0,

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "tipo_iva_id")
    @JsonIgnoreProperties(value = ["hibernateLazyInitializer", "handler"])
    val tipoIva: TipoIva? = null,

    val imagen: String? = null,

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "producto_familias",
        joinColumns = [JoinColumn(name = "producto_id")],
        inverseJoinColumns = [JoinColumn(name = "familia_id")]
    )
    @JsonIgnoreProperties(value = ["hibernateLazyInitializer", "handler"])
    val familias: Set<Familia> = emptySet(),

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "producto_subfamilias",
        joinColumns = [JoinColumn(name = "producto_id")],
        inverseJoinColumns = [JoinColumn(name = "subfamilia_id")]
    )
    @JsonIgnoreProperties(value = ["hibernateLazyInitializer", "handler"])
    val subfamilias: Set<Subfamilia> = emptySet(),

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "almacen_predeterminado_id")
    @JsonIgnoreProperties(value = ["hibernateLazyInitializer", "handler"])
    val almacenPredeterminado: Almacen? = null,

    @OneToMany(mappedBy = "producto", cascade = [CascadeType.ALL], orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnore
    val referencias: Set<ProductoReferencia> = emptySet(),

    @OneToMany(mappedBy = "producto", cascade = [CascadeType.ALL], orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnore
    val codigosBarras: Set<ProductoCodigoBarra> = emptySet()
)
