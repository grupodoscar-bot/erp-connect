package com.example.demo.repository

import com.example.demo.model.UsuarioInicioPanel
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface UsuarioInicioPanelRepository : JpaRepository<UsuarioInicioPanel, Long> {
    fun findByUsuarioIdOrderByPosicionAsc(usuarioId: Long): List<UsuarioInicioPanel>
    fun findTopByUsuarioIdOrderByPosicionDesc(usuarioId: Long): UsuarioInicioPanel?
}
