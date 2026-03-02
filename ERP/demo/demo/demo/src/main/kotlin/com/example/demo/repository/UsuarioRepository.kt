package com.example.demo.repository

import com.example.demo.model.Usuario
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface UsuarioRepository : JpaRepository<Usuario, Long> {

    fun findByUsuario(usuario: String): Usuario?

    fun findByUsuarioAndContrasena(usuario: String, contrasena: String): Usuario?

    fun findByEmail(email: String): Usuario?
}
