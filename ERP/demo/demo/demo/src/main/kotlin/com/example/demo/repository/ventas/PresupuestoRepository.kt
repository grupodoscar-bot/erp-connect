package com.example.demo.repository.ventas

import com.example.demo.model.ventas.Presupuesto
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface PresupuestoRepository : JpaRepository<Presupuesto, Long> {
    
    fun findByClienteId(clienteId: Long): List<Presupuesto>
    
    fun findByEstado(estado: String): List<Presupuesto>
    
    @Query("SELECT p FROM Presupuesto p WHERE p.serie.id = :serieId AND p.anioDocumento = :anio ORDER BY p.numeroSecuencial DESC")
    fun findTopBySerieIdAndAnioDocumentoOrderByNumeroSecuencialDesc(
        @Param("serieId") serieId: Long,
        @Param("anio") anio: Int
    ): List<Presupuesto>
    
    @Query("""
        SELECT p FROM Presupuesto p 
        LEFT JOIN FETCH p.cliente 
        LEFT JOIN FETCH p.serie
        LEFT JOIN FETCH p.tarifa
        LEFT JOIN FETCH p.almacen
        WHERE (:clienteId IS NULL OR p.cliente.id = :clienteId)
        AND (:estado IS NULL OR p.estado = :estado)
        AND (:serieId IS NULL OR p.serie.id = :serieId)
    """)
    fun findAllWithFilters(
        @Param("clienteId") clienteId: Long?,
        @Param("estado") estado: String?,
        @Param("serieId") serieId: Long?,
        pageable: Pageable
    ): Page<Presupuesto>
    
    @Query("SELECT p FROM Presupuesto p LEFT JOIN FETCH p.lineas WHERE p.id = :id")
    fun findByIdWithLineas(@Param("id") id: Long): Presupuesto?
}
