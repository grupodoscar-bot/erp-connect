package com.example.demo.repository

import com.example.demo.model.Tarifa
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository

@Repository
interface TarifaRepository : JpaRepository<Tarifa, Long> {
    fun findByActivaTrue(): List<Tarifa>
    fun findByEsGeneralTrue(): Tarifa?
    fun findByNombre(nombre: String): Tarifa?
    fun existsByNombre(nombre: String): Boolean
    
    @Query("SELECT t FROM Tarifa t WHERE t.activa = true ORDER BY t.esGeneral DESC, t.nombre ASC")
    fun findAllActivasOrdenadas(): List<Tarifa>
}
