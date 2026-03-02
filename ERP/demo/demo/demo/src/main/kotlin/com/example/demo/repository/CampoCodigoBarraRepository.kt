package com.example.demo.repository

import com.example.demo.model.CampoCodigoBarra
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface CampoCodigoBarraRepository : JpaRepository<CampoCodigoBarra, Long>
