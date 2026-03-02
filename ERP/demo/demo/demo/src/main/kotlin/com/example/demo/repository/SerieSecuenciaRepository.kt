package com.example.demo.repository

import com.example.demo.model.SerieSecuencia
import jakarta.persistence.LockModeType
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Lock
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface SerieSecuenciaRepository : JpaRepository<SerieSecuencia, Long> {
    fun findBySerieIdAndAnio(serieId: Long, anio: Int): SerieSecuencia?

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT ss FROM SerieSecuencia ss WHERE ss.serie.id = :serieId AND ss.anio = :anio")
    fun findBySerieIdAndAnioForUpdate(
        @Param("serieId") serieId: Long,
        @Param("anio") anio: Int
    ): SerieSecuencia?
}
