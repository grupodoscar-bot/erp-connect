package com.example.demo.repository

import com.example.demo.model.TipoIva
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface TipoIvaRepository : JpaRepository<TipoIva, Long>
