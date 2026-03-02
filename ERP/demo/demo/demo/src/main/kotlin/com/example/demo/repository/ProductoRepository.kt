package com.example.demo.repository

import com.example.demo.model.Producto
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface ProductoRepository : JpaRepository<Producto, Long> {
    fun findByReferencia(referencia: String): Producto?
    fun existsByReferencia(referencia: String): Boolean
}
