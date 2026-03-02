package com.example.demo.model

enum class TipoCalculoPrecio {
    PRECIO_FIJO,           // Precio específico para esta tarifa
    PORCENTAJE_SOBRE_COSTE, // % sobre el último coste del producto
    CANTIDAD_SOBRE_COSTE,   // Cantidad fija añadida al último coste
    PORCENTAJE_SOBRE_PRECIO, // % sobre el precio de venta del producto
    CANTIDAD_SOBRE_PRECIO    // Cantidad fija añadida al precio de venta
}
