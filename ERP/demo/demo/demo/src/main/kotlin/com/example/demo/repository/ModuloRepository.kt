package com.example.demo.repository

import com.example.demo.model.Modulo
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface ModuloRepository : JpaRepository<Modulo, Long> {

    fun findByIdUsuario(idUsuario: Long): Modulo?

    fun findAllByIdUsuarioIn(ids: List<Long>): List<Modulo>
}
