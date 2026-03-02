package com.example.demo.model

import jakarta.persistence.*

@Entity
@Table(name = "modulos")
data class Modulo(
    @Id
    @Column(name = "id_usuario")
    val idUsuario: Long = 0,

    @OneToOne
    @JoinColumn(name = "id_usuario", referencedColumnName = "id", insertable = false, updatable = false)
    val usuario: Usuario? = null,

    @Column(name = "modulo_terceros", nullable = false)
    val moduloTerceros: Boolean = false,

    @Column(name = "modulo_almacen", nullable = false)
    val moduloAlmacen: Boolean = false,

    @Column(name = "modulo_empresa", nullable = false)
    val moduloEmpresa: Boolean = false,

    @Column(name = "modulo_ventas", nullable = false)
    val moduloVentas: Boolean = false,

    @Column(name = "modulo_configuracion", nullable = false)
    val moduloConfiguracion: Boolean = false,

    @Column(name = "modulo_tpv", nullable = false)
    val moduloTpv: Boolean = false
)
