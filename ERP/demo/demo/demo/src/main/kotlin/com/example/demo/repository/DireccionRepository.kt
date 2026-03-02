package com.example.demo.repository

import com.example.demo.model.Direccion
import org.springframework.data.jpa.repository.JpaRepository

interface DireccionRepository : JpaRepository<Direccion, Long> {
    fun findByTipoTerceroAndIdTercero(tipoTercero: Direccion.TipoTercero, idTercero: Long): List<Direccion>
    fun deleteByTipoTerceroAndIdTercero(tipoTercero: Direccion.TipoTercero, idTercero: Long)
}
