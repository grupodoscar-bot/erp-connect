package com.example.demo.controller

import com.example.demo.model.EmpresaColores
import com.example.demo.repository.EmpresaColoresRepository
import com.example.demo.repository.EmpresaRepository
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/empresa-colores")
@CrossOrigin(origins = ["http://localhost:3000", "http://145.223.103.219:3000"])
class EmpresaColoresController(
    private val empresaColoresRepository: EmpresaColoresRepository,
    private val empresaRepository: EmpresaRepository
) {

    @GetMapping
    fun obtenerColores(): ResponseEntity<EmpresaColores> {
        val empresa = empresaRepository.findAll().firstOrNull()
        
        val empresaColoresId = empresa?.empresaColoresId
        if (empresaColoresId != null) {
            val colores = empresaColoresRepository.findById(empresaColoresId)
            return if (colores.isPresent) {
                ResponseEntity.ok(colores.get())
            } else {
                ResponseEntity.notFound().build()
            }
        }
        
        return ResponseEntity.notFound().build()
    }

    @GetMapping("/todos")
    fun obtenerTodosLosTemas(): ResponseEntity<List<EmpresaColores>> {
        val temas = empresaColoresRepository.findAll()
        return ResponseEntity.ok(temas)
    }

    @PutMapping("/{id}")
    fun actualizar(
        @PathVariable id: Int,
        @RequestBody datos: EmpresaColores
    ): ResponseEntity<EmpresaColores> {
        return empresaColoresRepository.findById(id)
            .map { existente ->
                val actualizado = existente.copy(
                    navigationFondo = datos.navigationFondo,
                    botonFondo = datos.botonFondo,
                    formSurface = datos.formSurface,
                    textoTitulo = datos.textoTitulo,
                    panelCabeceraFondo = datos.panelCabeceraFondo,
                    nombreDelTema = datos.nombreDelTema,
                    inputSurface = datos.inputSurface,
                    inputBorder = datos.inputBorder,
                    modoVisual = datos.modoVisual
                )
                ResponseEntity.ok(empresaColoresRepository.save(actualizado))
            }
            .orElse(ResponseEntity.notFound().build())
    }

    @PostMapping
    fun crear(@RequestBody datos: EmpresaColores): ResponseEntity<EmpresaColores> {
        val nueva = empresaColoresRepository.save(datos)
        return ResponseEntity.ok(nueva)
    }
}
