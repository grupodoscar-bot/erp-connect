package com.example.demo.repository

import com.example.demo.model.ConfiguracionVentas
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository

@Repository
interface ConfiguracionVentasRepository : JpaRepository<ConfiguracionVentas, Long> {

    fun findTopByOrderByIdAsc(): ConfiguracionVentas?
}