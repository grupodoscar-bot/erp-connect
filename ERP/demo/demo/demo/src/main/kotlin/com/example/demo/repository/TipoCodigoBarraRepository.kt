package com.example.demo.repository

import com.example.demo.model.TipoCodigoBarra
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface TipoCodigoBarraRepository : JpaRepository<TipoCodigoBarra, Long>
