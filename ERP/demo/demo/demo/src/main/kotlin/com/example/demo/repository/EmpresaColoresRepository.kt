package com.example.demo.repository

import com.example.demo.model.EmpresaColores
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface EmpresaColoresRepository : JpaRepository<EmpresaColores, Int>
