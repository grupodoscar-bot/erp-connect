package com.example.demo.repository.ventas

import com.example.demo.model.ventas.FacturaProformaLinea
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface FacturaProformaLineaRepository : JpaRepository<FacturaProformaLinea, Long> {
    
    fun findByFacturaProformaId(facturaProformaId: Long): List<FacturaProformaLinea>
    
    fun deleteByFacturaProformaId(facturaProformaId: Long)
}
