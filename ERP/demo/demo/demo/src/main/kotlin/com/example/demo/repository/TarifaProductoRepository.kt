package com.example.demo.repository

import com.example.demo.model.TarifaProducto
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface TarifaProductoRepository : JpaRepository<TarifaProducto, Long> {
    fun findByTarifaIdAndProductoId(tarifaId: Long, productoId: Long): TarifaProducto?
    fun findByTarifaId(tarifaId: Long): List<TarifaProducto>
    fun findByProductoId(productoId: Long): List<TarifaProducto>
    
    @Query("SELECT tp FROM TarifaProducto tp WHERE tp.tarifa.id = :tarifaId AND tp.producto.id IN :productosIds")
    fun findByTarifaIdAndProductoIdIn(@Param("tarifaId") tarifaId: Long, @Param("productosIds") productosIds: List<Long>): List<TarifaProducto>
    
    @Query("SELECT tp FROM TarifaProducto tp JOIN tp.tarifa t WHERE tp.producto.id = :productoId AND t.activa = true")
    fun findByProductoIdAndTarifaActiva(@Param("productoId") productoId: Long): List<TarifaProducto>
    
    @Modifying
    fun deleteByTarifaId(tarifaId: Long)
    
    @Modifying
    fun deleteByProductoId(productoId: Long)
}
