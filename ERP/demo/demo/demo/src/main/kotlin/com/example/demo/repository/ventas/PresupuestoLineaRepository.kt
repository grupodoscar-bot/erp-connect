package com.example.demo.repository.ventas

import com.example.demo.model.ventas.PresupuestoLinea
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface PresupuestoLineaRepository : JpaRepository<PresupuestoLinea, Long> {
    
    fun findByPresupuestoId(presupuestoId: Long): List<PresupuestoLinea>
    
    fun deleteByPresupuestoId(presupuestoId: Long)
}
