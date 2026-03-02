package com.example.demo.controller

import com.example.demo.model.Modulo
import com.example.demo.model.Usuario

data class UsuarioPermisosRequest(
    val usuario: String,
    val contrasena: String,
    val dni: String,
    val moduloTerceros: Boolean = false,
    val moduloAlmacen: Boolean = false,
    val moduloEmpresa: Boolean = false,
    val moduloVentas: Boolean = false,
    val moduloConfiguracion: Boolean = false,
    val moduloTpv: Boolean = false
)

data class UsuarioPermisosResponse(
    val id: Long,
    val usuario: String,
    val contrasena: String,
    val dni: String,
    val moduloTerceros: Boolean,
    val moduloAlmacen: Boolean,
    val moduloEmpresa: Boolean,
    val moduloVentas: Boolean,
    val moduloConfiguracion: Boolean,
    val moduloTpv: Boolean
) {
    companion object {
        fun from(usuario: Usuario, modulo: Modulo?): UsuarioPermisosResponse =
            UsuarioPermisosResponse(
                id = usuario.id,
                usuario = usuario.usuario,
                contrasena = usuario.contrasena,
                dni = usuario.dni,
                moduloTerceros = modulo?.moduloTerceros ?: false,
                moduloAlmacen = modulo?.moduloAlmacen ?: false,
                moduloEmpresa = modulo?.moduloEmpresa ?: false,
                moduloVentas = modulo?.moduloVentas ?: false,
                moduloConfiguracion = modulo?.moduloConfiguracion ?: false,
                moduloTpv = modulo?.moduloTpv ?: false
            )
    }
}
