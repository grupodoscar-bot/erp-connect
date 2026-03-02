package com.example.demo.repository.ventas

import com.example.demo.model.ventas.Factura
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface FacturaRepository : JpaRepository<Factura, Long> {
    
    fun findByClienteId(clienteId: Long): List<Factura>
    
    fun findByEstado(estado: String): List<Factura>
    
    fun existsByNumero(numero: String): Boolean
    
    fun findTopByOrderByIdDesc(): Factura?
    
    @Query("SELECT f FROM Factura f WHERE f.serie.id = :serieId AND f.anioDocumento = :anio ORDER BY f.numeroSecuencial DESC")
    fun findTopBySerieIdAndAnioDocumentoOrderByNumeroSecuencialDesc(
        @Param("serieId") serieId: Long,
        @Param("anio") anio: Int
    ): List<Factura>
    
    @Query("""
        SELECT f FROM Factura f 
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
    ): Page<Factura>
    
    @Query("SELECT f FROM Factura f LEFT JOIN FETCH f.lineas WHERE f.id = :id")
    fun findByIdWithLineas(@Param("id") id: Long): Factura?
    
    fun findByAlbaranId(albaranId: Long): List<Factura>
}
