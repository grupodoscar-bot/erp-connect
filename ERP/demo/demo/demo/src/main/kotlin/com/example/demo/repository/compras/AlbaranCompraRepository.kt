package com.example.demo.repository.compras

import com.example.demo.model.compras.AlbaranCompra
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface AlbaranCompraRepository : JpaRepository<AlbaranCompra, Long> {
    fun findByNumero(numero: String): AlbaranCompra?
}
