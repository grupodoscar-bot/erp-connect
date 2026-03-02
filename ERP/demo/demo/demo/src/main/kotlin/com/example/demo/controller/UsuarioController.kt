package com.example.demo.controller

import com.example.demo.model.Modulo
import com.example.demo.model.Usuario
import com.example.demo.repository.ModuloRepository
import com.example.demo.repository.UsuarioRepository
import com.example.demo.service.GoogleAuthService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/usuarios")
@CrossOrigin(origins = ["http://145.223.103.219:3000"])
class UsuarioController(
    private val usuarioRepository: UsuarioRepository,
    private val moduloRepository: ModuloRepository,
    private val googleAuthService: GoogleAuthService
) {

    // ================== CRUD BÁSICO ==================

    // GET /usuarios -> lista todos
    @GetMapping
    fun listarTodos(): List<UsuarioPermisosResponse> {
        val usuarios = usuarioRepository.findAll()
        if (usuarios.isEmpty()) return emptyList()

        val modulos = moduloRepository.findAllByIdUsuarioIn(usuarios.map { it.id })
            .associateBy { it.idUsuario }

        return usuarios.map { UsuarioPermisosResponse.from(it, modulos[it.id]) }
    }

    // GET /usuarios/{id} -> obtener 1 por id
    @GetMapping("/{id}")
    fun obtenerPorId(@PathVariable id: Long): ResponseEntity<UsuarioPermisosResponse> =
        usuarioRepository.findById(id)
            .map { usuario ->
                val modulos = moduloRepository.findByIdUsuario(usuario.id)
                ResponseEntity.ok(UsuarioPermisosResponse.from(usuario, modulos))
            }
            .orElse(ResponseEntity.notFound().build())

    // POST /usuarios -> crear
    @PostMapping
    fun crear(@RequestBody request: UsuarioPermisosRequest): UsuarioPermisosResponse {
        val nuevoUsuario = usuarioRepository.save(
            Usuario(
                usuario = request.usuario,
                contrasena = request.contrasena,
                dni = request.dni
            )
        )

        moduloRepository.save(
            Modulo(
                idUsuario = nuevoUsuario.id,
                moduloTerceros = request.moduloTerceros,
                moduloAlmacen = request.moduloAlmacen,
                moduloEmpresa = request.moduloEmpresa,
                moduloVentas = request.moduloVentas,
                moduloConfiguracion = request.moduloConfiguracion,
                moduloTpv = request.moduloTpv
            )
        )

        return UsuarioPermisosResponse.from(nuevoUsuario, moduloRepository.findByIdUsuario(nuevoUsuario.id))
    }

    // PUT /usuarios/{id} -> actualizar
    @PutMapping("/{id}")
    fun actualizar(
        @PathVariable id: Long,
        @RequestBody datos: UsuarioPermisosRequest
    ): ResponseEntity<UsuarioPermisosResponse> {
        return usuarioRepository.findById(id)
            .map { existente ->
                val actualizado = existente.copy(
                    usuario = datos.usuario,
                    contrasena = datos.contrasena,
                    dni = datos.dni
                )
                val usuarioGuardado = usuarioRepository.save(actualizado)

                val modulo = moduloRepository.findByIdUsuario(id)
                if (modulo != null) {
                    moduloRepository.save(
                        modulo.copy(
                            moduloTerceros = datos.moduloTerceros,
                            moduloAlmacen = datos.moduloAlmacen,
                            moduloEmpresa = datos.moduloEmpresa,
                            moduloVentas = datos.moduloVentas,
                            moduloConfiguracion = datos.moduloConfiguracion,
                            moduloTpv = datos.moduloTpv
                        )
                    )
                } else {
                    moduloRepository.save(
                        Modulo(
                            idUsuario = id,
                            moduloTerceros = datos.moduloTerceros,
                            moduloAlmacen = datos.moduloAlmacen,
                            moduloEmpresa = datos.moduloEmpresa,
                            moduloVentas = datos.moduloVentas,
                            moduloConfiguracion = datos.moduloConfiguracion,
                            moduloTpv = datos.moduloTpv
                        )
                    )
                }

                val modulosActualizados = moduloRepository.findByIdUsuario(id)

                ResponseEntity.ok(UsuarioPermisosResponse.from(usuarioGuardado, modulosActualizados))
            }
            .orElse(ResponseEntity.notFound().build())
    }

    // DELETE /usuarios/{id} -> borrar
    @DeleteMapping("/{id}")
    fun borrar(@PathVariable id: Long): ResponseEntity<Void> {
        return if (usuarioRepository.existsById(id)) {
            moduloRepository.findByIdUsuario(id)?.let { moduloRepository.delete(it) }
            usuarioRepository.deleteById(id)
            ResponseEntity.noContent().build()
        } else {
            ResponseEntity.notFound().build()
        }
    }

    // ================== LOGIN ==================

    @PostMapping("/login")
    fun login(@RequestBody request: LoginRequest): ResponseEntity<Any> {
        val usuario = usuarioRepository.findByUsuarioAndContrasena(
            request.usuario,
            request.contrasena
        )

        return if (usuario != null) {
            val permisos = moduloRepository.findByIdUsuario(usuario.id)
                ?.let {
                    mapOf(
                        "moduloTerceros" to it.moduloTerceros,
                        "moduloAlmacen" to it.moduloAlmacen,
                        "moduloEmpresa" to it.moduloEmpresa,
                        "moduloVentas" to it.moduloVentas,
                        "moduloConfiguracion" to it.moduloConfiguracion,
                        "moduloTpv" to it.moduloTpv
                    )
                } ?: mapOf(
                "moduloTerceros" to false,
                "moduloAlmacen" to false,
                "moduloEmpresa" to false,
                "moduloVentas" to false,
                "moduloConfiguracion" to false,
                "moduloTpv" to false
            )

            val usuarioPayload = mapOf(
                "id" to usuario.id,
                "usuario" to usuario.usuario,
                "dni" to usuario.dni
            )

            ResponseEntity.ok(
                mapOf(
                    "mensaje" to "Login correcto",
                    "usuario" to usuarioPayload,
                    "permisos" to permisos
                )
            )
        } else {
            ResponseEntity.status(401).body(mapOf("mensaje" to "Usuario o contraseña incorrectos"))
        }
    }

    @PostMapping("/login/google")
    fun loginWithGoogle(@RequestBody request: GoogleLoginRequest): ResponseEntity<Any> {
        val payload = googleAuthService.verifyGoogleToken(request.idToken)

        return if (payload != null) {
            val email = payload.email

            if (email == null) {
                return ResponseEntity.status(400).body(mapOf("mensaje" to "No se pudo obtener el email de Google"))
            }

            val usuario = usuarioRepository.findByEmail(email)

            if (usuario != null) {
                val permisos = moduloRepository.findByIdUsuario(usuario.id)
                    ?.let {
                        mapOf(
                            "moduloTerceros" to it.moduloTerceros,
                            "moduloAlmacen" to it.moduloAlmacen,
                            "moduloEmpresa" to it.moduloEmpresa,
                            "moduloVentas" to it.moduloVentas,
                            "moduloConfiguracion" to it.moduloConfiguracion,
                            "moduloTpv" to it.moduloTpv
                        )
                    } ?: mapOf(
                    "moduloTerceros" to false,
                    "moduloAlmacen" to false,
                    "moduloEmpresa" to false,
                    "moduloVentas" to false,
                    "moduloConfiguracion" to false,
                    "moduloTpv" to false
                )

                val usuarioPayload = mapOf(
                    "id" to usuario.id,
                    "usuario" to usuario.usuario,
                    "dni" to usuario.dni,
                    "email" to usuario.email
                )

                ResponseEntity.ok(
                    mapOf(
                        "mensaje" to "Login con Google correcto",
                        "usuario" to usuarioPayload,
                        "permisos" to permisos
                    )
                )
            } else {
                ResponseEntity.status(404).body(mapOf("mensaje" to "No existe un usuario con el email: $email"))
            }
        } else {
            ResponseEntity.status(401).body(mapOf("mensaje" to "Token de Google inválido"))
        }
    }
}
