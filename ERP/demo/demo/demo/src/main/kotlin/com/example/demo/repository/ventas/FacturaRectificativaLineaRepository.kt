package com.example.demo.repository.ventas

import com.example.demo.model.ventas.FacturaRectificativaLinea
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface FacturaRectificativaLineaRepository : JpaRepository<FacturaRectificativaLinea, Long> {
    
    fun findByFacturaRectificativaId(facturaRectificativaId: Long): List<FacturaRectificativaLinea>
    
    fun deleteByFacturaRectificativaId(facturaRectificativaId: Long)
}
