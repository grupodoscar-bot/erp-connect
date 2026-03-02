package com.example.demo.repository

import com.example.demo.model.Almacen
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface AlmacenRepository : JpaRepository<Almacen, Long> {
    fun findByActivoTrue(): List<Almacen>
    fun existsByNombre(nombre: String): Boolean
}
