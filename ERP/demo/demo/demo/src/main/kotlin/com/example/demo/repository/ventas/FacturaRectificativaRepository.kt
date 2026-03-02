package com.example.demo.repository.ventas

import com.example.demo.model.ventas.FacturaRectificativa
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface FacturaRectificativaRepository : JpaRepository<FacturaRectificativa, Long> {
    
    fun findByClienteId(clienteId: Long): List<FacturaRectificativa>
    
    fun findByEstado(estado: String): List<FacturaRectificativa>
    
    fun existsByNumero(numero: String): Boolean
    
    fun findTopByOrderByIdDesc(): FacturaRectificativa?
    
    @Query("SELECT f FROM FacturaRectificativa f WHERE f.serie.id = :serieId AND f.anioDocumento = :anio ORDER BY f.numeroSecuencial DESC")
    fun findTopBySerieIdAndAnioDocumentoOrderByNumeroSecuencialDesc(
        @Param("serieId") serieId: Long,
        @Param("anio") anio: Int
    ): List<FacturaRectificativa>
    
    @Query("""
        SELECT f FROM FacturaRectificativa f 
        LEFT JOIN FETCH f.cliente 
        LEFT JOIN FETCH f.serie
        LEFT JOIN FETCH f.tarifa
        LEFT JOIN FETCH f.almacen
        WHERE (:clienteId IS NULL OR f.cliente.id = :clienteId)
        AND (:estado IS NULL OR f.estado = :estado)
        AND (:serieId IS NULL OR f.serie.id = :serieId)
    """)
    fun findAllWithFilters(
        @Param("clienteId") clienteId: Long?,
        @Param("estado") estado: String?,
        @Param("serieId") serieId: Long?,
        pageable: Pageable
    ): Page<FacturaRectificativa>
    
    @Query("SELECT f FROM FacturaRectificativa f LEFT JOIN FETCH f.lineas WHERE f.id = :id")
    fun findByIdWithLineas(@Param("id") id: Long): FacturaRectificativa?
    
    fun findByFacturaOrigenId(facturaOrigenId: Long): List<FacturaRectificativa>
}
