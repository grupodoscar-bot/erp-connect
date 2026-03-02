package com.example.demo.service

import org.springframework.stereotype.Service

@Service
class CodigoBarraValidatorService {

    /**
     * Valida un código EAN13 (13 dígitos con dígito de control)
     */
    fun validarEAN13(codigo: String): Boolean {
        if (codigo.length != 13 || !codigo.all { it.isDigit() }) {
            return false
        }
        return validarDigitoControlEAN(codigo)
    }

    /**
     * Valida un código EAN8 (8 dígitos con dígito de control)
     */
    fun validarEAN8(codigo: String): Boolean {
        if (codigo.length != 8 || !codigo.all { it.isDigit() }) {
            return false
        }
        return validarDigitoControlEAN(codigo)
    }

    /**
     * Valida un código CODE128 (alfanumérico, longitud variable)
     */
    fun validarCODE128(codigo: String): Boolean {
        // CODE128 puede contener cualquier carácter ASCII de 0-127
        // Longitud típica entre 1 y 48 caracteres
        return codigo.isNotEmpty() && codigo.length <= 48
    }

    /**
     * Calcula el dígito de control para códigos EAN
     */
    fun calcularDigitoControlEAN(codigoSinDigito: String): Int {
        var suma = 0
        for (i in codigoSinDigito.indices) {
            val digito = codigoSinDigito[i].digitToInt()
            // Alternar multiplicador: impar=1, par=3 (contando desde la derecha)
            val multiplicador = if ((codigoSinDigito.length - i) % 2 == 0) 3 else 1
            suma += digito * multiplicador
        }
        val modulo = suma % 10
        return if (modulo == 0) 0 else 10 - modulo
    }

    /**
     * Valida el dígito de control de un código EAN completo
     */
    private fun validarDigitoControlEAN(codigo: String): Boolean {
        val codigoSinDigito = codigo.substring(0, codigo.length - 1)
        val digitoControl = codigo.last().digitToInt()
        val digitoCalculado = calcularDigitoControlEAN(codigoSinDigito)
        return digitoControl == digitoCalculado
    }

    /**
     * Valida un código según su tipo
     */
    fun validarCodigo(codigo: String, tipo: String): Boolean {
        return when (tipo.uppercase()) {
            "EAN13" -> validarEAN13(codigo)
            "EAN8" -> validarEAN8(codigo)
            "CODE128" -> validarCODE128(codigo)
            else -> true // Para códigos personalizados de balanza
        }
    }

    /**
     * Genera un código EAN13 válido a partir de los primeros 12 dígitos
     */
    fun generarEAN13(primeros12Digitos: String): String? {
        if (primeros12Digitos.length != 12 || !primeros12Digitos.all { it.isDigit() }) {
            return null
        }
        val digitoControl = calcularDigitoControlEAN(primeros12Digitos)
        return primeros12Digitos + digitoControl
    }

    /**
     * Genera un código EAN8 válido a partir de los primeros 7 dígitos
     */
    fun generarEAN8(primeros7Digitos: String): String? {
        if (primeros7Digitos.length != 7 || !primeros7Digitos.all { it.isDigit() }) {
            return null
        }
        val digitoControl = calcularDigitoControlEAN(primeros7Digitos)
        return primeros7Digitos + digitoControl
    }
}
