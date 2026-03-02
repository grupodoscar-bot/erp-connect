package com.example.demo.repository.compras

import com.example.demo.model.compras.PedidoCompra
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface PedidoCompraRepository : JpaRepository<PedidoCompra, Long> {
    
    @Query("""
        SELECT p FROM PedidoCompra p 
        LEFT JOIN FETCH p.proveedor 
        LEFT JOIN FETCH p.serie 
        LEFT JOIN FETCH p.almacen
        WHERE (:busqueda IS NULL OR :busqueda = '' OR 
               LOWER(p.numero) LIKE LOWER(CONCAT('%', :busqueda, '%')) OR
               LOWER(p.proveedor.nombreComercial) LIKE LOWER(CONCAT('%', :busqueda, '%')) OR
               LOWER(p.proveedor.nombreFiscal) LIKE LOWER(CONCAT('%', :busqueda, '%')))
        AND (:estado IS NULL OR :estado = '' OR p.estado = :estado)
    """)
    fun buscarPedidos(
        @Param("busqueda") busqueda: String?,
        @Param("estado") estado: String?,
        pageable: Pageable
    ): Page<PedidoCompra>
    
    fun findByNumero(numero: String): PedidoCompra?
    
    @Query(
        value = """
            SELECT MAX(CAST(SUBSTRING(p.numero FROM '[0-9]+$') AS BIGINT)) 
            FROM compras_pedidos p 
            WHERE p.numero LIKE CONCAT(:prefijo, '%')
        """,
        nativeQuery = true
    )
    fun findMaxNumeroByPrefijo(
        @Param("prefijo") prefijo: String
    ): Long?
    
    @Query("""
        SELECT MAX(p.numeroSecuencial) FROM PedidoCompra p 
        WHERE p.serie.id = :serieId AND p.anioDocumento = :anio
    """)
    fun findMaxNumeroSecuencialBySerieAndAnio(
        @Param("serieId") serieId: Long,
        @Param("anio") anio: Int
    ): Long?
}
