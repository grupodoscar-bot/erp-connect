package com.example.demo.repository

import com.example.demo.model.Agrupacion
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface AgrupacionRepository : JpaRepository<Agrupacion, Long> {
    fun findByNombre(nombre: String): Agrupacion?
    fun findByActivaTrue(): List<Agrupacion>
    fun existsByNombre(nombre: String): Boolean
}
