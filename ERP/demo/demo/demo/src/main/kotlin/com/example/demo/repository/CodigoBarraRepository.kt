package com.example.demo.repository

import com.example.demo.model.CodigoBarra
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface CodigoBarraRepository : JpaRepository<CodigoBarra, Long> {
    fun findByTipo(tipo: String): CodigoBarra?
    fun findByEsEstandar(esEstandar: Boolean): List<CodigoBarra>
}
