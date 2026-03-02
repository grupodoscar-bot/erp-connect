package com.example.demo.service

import com.example.demo.repository.EmpresaRepository
import jakarta.mail.Authenticator
import jakarta.mail.PasswordAuthentication
import jakarta.mail.Session
import jakarta.mail.internet.MimeMessage
import org.springframework.mail.javamail.JavaMailSenderImpl
import org.springframework.mail.javamail.MimeMessageHelper
import org.springframework.stereotype.Service
import java.util.Properties

@Service
class EmailService(
    private val empresaRepository: EmpresaRepository
) {

    fun enviarEmailConAdjunto(
        destinatario: String,
        asunto: String,
        cuerpo: String,
        adjuntoNombre: String,
        adjuntoBytes: ByteArray
    ) {
        val empresa = empresaRepository.findAll().firstOrNull()
            ?: throw IllegalStateException("No se encontró configuración de empresa")

        if (empresa.email.isBlank()) {
            throw IllegalStateException("La empresa no tiene un email configurado")
        }

        // Validar configuración SMTP
        val host = empresa.smtpHost
        val port = empresa.smtpPort
        val username = empresa.smtpUsername
        val password = empresa.smtpPassword
        
        if (host.isNullOrBlank() || port == null || 
            username.isNullOrBlank() || password.isNullOrBlank()) {
            throw IllegalStateException("La configuración SMTP no está completa. Por favor, configura el servidor de correo en la sección de Empresa.")
        }

        // Crear JavaMailSender dinámico con la configuración de la empresa
        val mailSender = JavaMailSenderImpl()
        mailSender.host = host
        mailSender.port = port
        mailSender.username = username
        mailSender.password = password

        val props = mailSender.javaMailProperties
        props["mail.transport.protocol"] = "smtp"
        props["mail.smtp.auth"] = (empresa.smtpAuth ?: true).toString()
        props["mail.smtp.starttls.enable"] = (empresa.smtpStarttls ?: true).toString()
        props["mail.smtp.starttls.required"] = (empresa.smtpStarttls ?: true).toString()
        props["mail.smtp.connectiontimeout"] = "5000"
        props["mail.smtp.timeout"] = "5000"
        props["mail.smtp.writetimeout"] = "5000"

        val mensaje: MimeMessage = mailSender.createMimeMessage()
        val helper = MimeMessageHelper(mensaje, true, "UTF-8")

        helper.setFrom(username)
        helper.setTo(destinatario)
        helper.setSubject(asunto)
        helper.setText(cuerpo, false)

        // Adjuntar PDF
        helper.addAttachment(adjuntoNombre, org.springframework.core.io.ByteArrayResource(adjuntoBytes))

        mailSender.send(mensaje)
    }

    fun probarConexion(): Map<String, Any> {
        val empresa = empresaRepository.findAll().firstOrNull()
            ?: return mapOf("success" to false, "mensaje" to "No se encontró configuración de empresa")

        val host = empresa.smtpHost
        val port = empresa.smtpPort
        val username = empresa.smtpUsername
        val password = empresa.smtpPassword
        
        if (host.isNullOrBlank() || port == null || 
            username.isNullOrBlank() || password.isNullOrBlank()) {
            return mapOf("success" to false, "mensaje" to "La configuración SMTP no está completa")
        }

        return try {
            val mailSender = JavaMailSenderImpl()
            mailSender.host = host
            mailSender.port = port
            mailSender.username = username
            mailSender.password = password

            val props = mailSender.javaMailProperties
            props["mail.transport.protocol"] = "smtp"
            props["mail.smtp.auth"] = (empresa.smtpAuth ?: true).toString()
            props["mail.smtp.starttls.enable"] = (empresa.smtpStarttls ?: true).toString()
            props["mail.smtp.connectiontimeout"] = "5000"
            props["mail.smtp.timeout"] = "5000"

            mailSender.testConnection()
            mapOf("success" to true, "mensaje" to "Conexión exitosa con el servidor SMTP")
        } catch (e: Exception) {
            mapOf("success" to false, "mensaje" to "Error al conectar: ${e.message}")
        }
    }
}
