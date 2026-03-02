package com.example.demo.repository

import com.example.demo.model.ArchivoEmpresa
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface ArchivoEmpresaRepository : JpaRepository<ArchivoEmpresa, Long> {
    fun findByRutaCarpetaOrderByEsCarpetaDescNombreAsc(rutaCarpeta: String): List<ArchivoEmpresa>
    fun existsByRutaCarpetaAndNombre(rutaCarpeta: String, nombre: String): Boolean
    fun findByRutaCarpetaStartingWith(ruta: String): List<ArchivoEmpresa>
    fun findByRutaCarpetaAndNombre(rutaCarpeta: String, nombre: String): ArchivoEmpresa?
    fun findByDocumentoOrigenAndDocumentoOrigenId(documentoOrigen: String, documentoOrigenId: Long): List<ArchivoEmpresa>
}
