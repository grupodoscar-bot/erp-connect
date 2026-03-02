package com.example.demo.repository.ventas

import com.example.demo.model.ventas.DocumentoTransformacion
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface DocumentoTransformacionRepository : JpaRepository<DocumentoTransformacion, Long> {
    
    // Buscar todas las transformaciones donde el documento es origen
    fun findByTipoOrigenAndIdOrigen(tipoOrigen: String, idOrigen: Long): List<DocumentoTransformacion>
    
    // Buscar todas las transformaciones donde el documento es destino
    fun findByTipoDestinoAndIdDestino(tipoDestino: String, idDestino: Long): List<DocumentoTransformacion>
    
    // Buscar todo el historial de un documento (tanto como origen como destino)
    @Query("""
        SELECT dt FROM DocumentoTransformacion dt 
        WHERE (dt.tipoOrigen = :tipo AND dt.idOrigen = :id) 
           OR (dt.tipoDestino = :tipo AND dt.idDestino = :id)
        ORDER BY dt.fechaTransformacion DESC
    """)
    fun findHistorialDocumento(@Param("tipo") tipo: String, @Param("id") id: Long): List<DocumentoTransformacion>
}
