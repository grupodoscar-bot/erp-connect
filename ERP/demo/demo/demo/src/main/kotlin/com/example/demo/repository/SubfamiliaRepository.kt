package com.example.demo.repository

import com.example.demo.model.Subfamilia
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface SubfamiliaRepository : JpaRepository<Subfamilia, Long>
