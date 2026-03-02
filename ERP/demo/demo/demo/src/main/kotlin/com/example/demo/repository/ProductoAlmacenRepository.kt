package com.example.demo.repository

import com.example.demo.model.ProductoAlmacen
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository

@Repository
interface ProductoAlmacenRepository : JpaRepository<ProductoAlmacen, Long> {
    fun findByProductoId(productoId: Long): List<ProductoAlmacen>
    fun findByAlmacenId(almacenId: Long): List<ProductoAlmacen>
    fun findByProductoIdAndAlmacenId(productoId: Long, almacenId: Long): ProductoAlmacen?
    
    @Query("SELECT pa FROM ProductoAlmacen pa WHERE pa.producto.id = :productoId")
    fun findStockByProductoId(productoId: Long): List<ProductoAlmacen>
}
