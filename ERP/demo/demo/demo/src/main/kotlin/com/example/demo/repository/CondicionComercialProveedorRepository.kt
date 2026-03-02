package com.example.demo.repository

import com.example.demo.model.CondicionComercialProveedor
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface CondicionComercialProveedorRepository : JpaRepository<CondicionComercialProveedor, Long> {
    fun findByAgrupacionId(agrupacionId: Long): List<CondicionComercialProveedor>
    fun findByAgrupacionIdAndProductoId(agrupacionId: Long, productoId: Long): List<CondicionComercialProveedor>
}
