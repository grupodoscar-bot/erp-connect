package com.example.demo.repository

import com.example.demo.model.SerieDocumento
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface SerieDocumentoRepository : JpaRepository<SerieDocumento, Long> {
    fun findByTipoDocumento(tipoDocumento: String): List<SerieDocumento>
    fun findByTipoDocumentoAndActivo(tipoDocumento: String, activo: Boolean): List<SerieDocumento>
    fun findByTipoDocumentoAndDefaultSistema(tipoDocumento: String, defaultSistema: Boolean): SerieDocumento?
    
    @Query("""
        SELECT s FROM SerieDocumento s 
        JOIN PreferenciaSerieUsuario p ON p.serie.id = s.id 
        WHERE p.usuario.id = :usuarioId AND p.tipoDocumento = :tipoDocumento
    """)
    fun findPreferenciaUsuario(
        @Param("usuarioId") usuarioId: Long,
        @Param("tipoDocumento") tipoDocumento: String
    ): SerieDocumento?
}
