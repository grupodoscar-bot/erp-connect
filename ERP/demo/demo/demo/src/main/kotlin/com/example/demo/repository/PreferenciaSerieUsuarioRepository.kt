package com.example.demo.repository

import com.example.demo.model.PreferenciaSerieUsuario
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface PreferenciaSerieUsuarioRepository : JpaRepository<PreferenciaSerieUsuario, Long> {
    fun findByUsuarioIdAndTipoDocumento(usuarioId: Long, tipoDocumento: String): PreferenciaSerieUsuario?
}
