package com.example.demo.repository.ventas

import com.example.demo.model.ventas.PedidoLinea
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface PedidoLineaRepository : JpaRepository<PedidoLinea, Long> {
    
    fun findByPedidoId(pedidoId: Long): List<PedidoLinea>
    
    fun deleteByPedidoId(pedidoId: Long)
}
