package com.example.demo.repository

import com.example.demo.model.MovimientoStock
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.time.LocalDateTime

@Repository
interface MovimientoStockRepository : JpaRepository<MovimientoStock, Long> {
    
    fun findByProductoIdAndAlmacenIdOrderByFechaDesc(
        productoId: Long,
        almacenId: Long
    ): List<MovimientoStock>
    
    fun findByProductoIdAndAlmacenIdOrderByFechaDesc(
        productoId: Long,
        almacenId: Long,
        pageable: Pageable
    ): Page<MovimientoStock>
    
    fun findByDocumentoTipoAndDocumentoIdOrderByFechaDesc(
        documentoTipo: String,
        documentoId: Long
    ): List<MovimientoStock>
    
    fun findByFechaBetweenOrderByFechaDesc(
        fechaInicio: LocalDateTime,
        fechaFin: LocalDateTime
    ): List<MovimientoStock>
    
    fun findByFechaBetweenOrderByFechaDesc(
        fechaInicio: LocalDateTime,
        fechaFin: LocalDateTime,
        pageable: Pageable
    ): Page<MovimientoStock>
    
    fun findByTipoMovimientoOrderByFechaDesc(
        tipoMovimiento: String
    ): List<MovimientoStock>
    
    fun findByTipoMovimientoOrderByFechaDesc(
        tipoMovimiento: String,
        pageable: Pageable
    ): Page<MovimientoStock>
    
    fun findByAlmacenIdOrderByFechaDesc(
        almacenId: Long,
        pageable: Pageable
    ): Page<MovimientoStock>
    
    fun findByProductoIdOrderByFechaDesc(
        productoId: Long,
        pageable: Pageable
    ): Page<MovimientoStock>
    
    fun findAllByOrderByFechaDesc(pageable: Pageable): Page<MovimientoStock>
}
