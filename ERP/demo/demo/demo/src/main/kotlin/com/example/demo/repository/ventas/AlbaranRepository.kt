package com.example.demo.repository.ventas

import com.example.demo.model.ventas.Albaran
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface AlbaranRepository : JpaRepository<Albaran, Long> {
    @Query("SELECT a FROM Albaran a ORDER BY a.id DESC LIMIT 1")
    fun findLastAlbaran(): Albaran?
    
    fun existsByNumero(numero: String): Boolean
    
    fun findTopByOrderByIdDesc(): Albaran?

    @Query("SELECT CASE WHEN COUNT(a) > 0 THEN true ELSE false END FROM Albaran a WHERE a.direccion.id = :direccionId")
    fun existeAlbaranConDireccion(@Param("direccionId") direccionId: Long): Boolean
}
