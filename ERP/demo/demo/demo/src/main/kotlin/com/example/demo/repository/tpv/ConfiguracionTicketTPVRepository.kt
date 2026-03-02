package com.example.demo.repository.tpv

import com.example.demo.model.tpv.ConfiguracionTicketTPV
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository

@Repository
interface ConfiguracionTicketTPVRepository : JpaRepository<ConfiguracionTicketTPV, Long> {
    
    @Query("SELECT c FROM ConfiguracionTicketTPV c WHERE c.activa = true ORDER BY c.id DESC LIMIT 1")
    fun findConfiguracionActiva(): ConfiguracionTicketTPV?
    
    fun findByActiva(activa: Boolean): List<ConfiguracionTicketTPV>
}
