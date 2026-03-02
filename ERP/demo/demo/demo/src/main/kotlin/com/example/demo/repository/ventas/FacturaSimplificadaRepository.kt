package com.example.demo.repository.ventas

import com.example.demo.model.ventas.FacturaSimplificada
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository

@Repository
interface FacturaSimplificadaRepository : JpaRepository<FacturaSimplificada, Long> {
    fun existsByNumero(numero: String): Boolean
    
    @Query("SELECT f FROM FacturaSimplificada f ORDER BY f.id DESC LIMIT 1")
    fun findLastFacturaSimplificada(): FacturaSimplificada?
    
    fun findTopByOrderByIdDesc(): FacturaSimplificada?
}
