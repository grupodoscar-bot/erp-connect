package com.example.demo.service

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier
import com.google.api.client.http.javanet.NetHttpTransport
import com.google.api.client.json.gson.GsonFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.util.*

@Service
class GoogleAuthService {

    @Value("\${google.client.id:}")
    private lateinit var clientId: String

    private val transport = NetHttpTransport()
    private val jsonFactory = GsonFactory.getDefaultInstance()

    fun verifyGoogleToken(idTokenString: String): GoogleIdToken.Payload? {
        return try {
            val verifier = GoogleIdTokenVerifier.Builder(transport, jsonFactory)
                .setAudience(Collections.singletonList(clientId))
                .build()

            val idToken = verifier.verify(idTokenString)
            idToken?.payload
        } catch (e: Exception) {
            println("Error verificando token de Google: ${e.message}")
            null
        }
    }
}
