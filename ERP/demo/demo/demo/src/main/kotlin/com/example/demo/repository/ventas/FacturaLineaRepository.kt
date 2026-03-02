package com.example.demo.repository.ventas

import com.example.demo.model.ventas.FacturaLinea
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface FacturaLineaRepository : JpaRepository<FacturaLinea, Long> {
    
    fun findByFacturaId(facturaId: Long): List<FacturaLinea>
    
    fun deleteByFacturaId(facturaId: Long)
}
