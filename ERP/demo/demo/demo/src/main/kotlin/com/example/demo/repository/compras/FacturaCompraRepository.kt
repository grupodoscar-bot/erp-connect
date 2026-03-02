package com.example.demo.repository.compras

import com.example.demo.model.compras.FacturaCompra
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface FacturaCompraRepository : JpaRepository<FacturaCompra, Long> {
    fun findByNumero(numero: String): FacturaCompra?
}
