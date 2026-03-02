package com.example.demo.repository

import com.example.demo.model.CondicionComercial
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository

@Repository
interface CondicionComercialRepository : JpaRepository<CondicionComercial, Long> {
    fun findByAgrupacionId(agrupacionId: Long): List<CondicionComercial>
    fun findByProductoId(productoId: Long): List<CondicionComercial>
    fun findByAgrupacionIdAndProductoId(agrupacionId: Long, productoId: Long): List<CondicionComercial>
    fun findByAgrupacionIdAndActivaTrue(agrupacionId: Long): List<CondicionComercial>
    
    @Query("SELECT c FROM CondicionComercial c WHERE c.agrupacion.id = :agrupacionId AND c.producto.id = :productoId AND c.activa = true ORDER BY c.prioridad DESC")
    fun findCondicionesActivasByAgrupacionAndProducto(agrupacionId: Long, productoId: Long): List<CondicionComercial>
}
