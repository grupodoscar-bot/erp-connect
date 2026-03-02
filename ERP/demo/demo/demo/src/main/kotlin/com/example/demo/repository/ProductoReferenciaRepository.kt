package com.example.demo.repository

import com.example.demo.model.ProductoReferencia
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface ProductoReferenciaRepository : JpaRepository<ProductoReferencia, Long> {
    fun findByReferencia(referencia: String): ProductoReferencia?
    fun findByProductoId(productoId: Long): List<ProductoReferencia>
    fun existsByReferencia(referencia: String): Boolean
    fun deleteByProductoIdAndId(productoId: Long, id: Long)
}
