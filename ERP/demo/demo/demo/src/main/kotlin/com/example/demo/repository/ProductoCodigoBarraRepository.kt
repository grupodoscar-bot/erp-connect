package com.example.demo.repository

import com.example.demo.model.ProductoCodigoBarra
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository

@Repository
interface ProductoCodigoBarraRepository : JpaRepository<ProductoCodigoBarra, Long> {
    fun findByValor(valor: String): ProductoCodigoBarra?
    fun findByValorAndActivo(valor: String, activo: Boolean): ProductoCodigoBarra?
    fun existsByValor(valor: String): Boolean
    fun findByProductoId(productoId: Long): List<ProductoCodigoBarra>
    fun findByProductoIdAndActivo(productoId: Long, activo: Boolean): List<ProductoCodigoBarra>
    
    @Query("SELECT p FROM ProductoCodigoBarra p WHERE p.producto.id = :productoId AND p.esPrincipal = true")
    fun findPrincipalByProductoId(productoId: Long): ProductoCodigoBarra?
    
    fun findByOrigen(origen: String): List<ProductoCodigoBarra>
    fun findByActivoTrue(): List<ProductoCodigoBarra>
}
