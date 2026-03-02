package com.example.demo.repository

import com.example.demo.model.CodigoBarraCampo
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository

@Repository
interface CodigoBarraCampoRepository : JpaRepository<CodigoBarraCampo, Long> {
    @Query("SELECT c FROM CodigoBarraCampo c WHERE c.codigoBarraTipo.id = :codigoBarraId")
    fun findByCodigoBarraTipoId(codigoBarraId: Long): List<CodigoBarraCampo>
}
