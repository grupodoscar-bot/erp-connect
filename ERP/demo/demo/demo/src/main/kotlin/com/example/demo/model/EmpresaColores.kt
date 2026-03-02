package com.example.demo.model

import jakarta.persistence.*

@Entity
@Table(name = "empresa_colores")
data class EmpresaColores(
    @Id
    @Column(name = "id")
    val id: Int = 0,

    @Column(name = "navigation_fondo")
    val navigationFondo: String? = null,

    @Column(name = "boton_fondo")
    val botonFondo: String? = null,

    @Column(name = "boton_hover")
    val formSurface: String? = null,

    @Column(name = "texto_titulo")
    val textoTitulo: String? = null,

    @Column(name = "panel_cabecera_fondo")
    val panelCabeceraFondo: String? = null,

    @Column(name = "nombre_del_tema")
    val nombreDelTema: String? = null,

    @Column(name = "boton_fondo_menu")
    val inputSurface: String? = null,

    @Column(name = "boton_hover_menu")
    val inputBorder: String? = null,

    @Column(name = "modo_visual")
    val modoVisual: String? = "claro"
)
