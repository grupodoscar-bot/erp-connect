import { useEffect, useRef, useState, useCallback } from "react";
import { ReactComponent as IconPersona } from "../Recursos/iconos/persona.svg";
import { ReactComponent as IconCandado } from "../Recursos/iconos/candado.svg";
import fondoVideo from "../Recursos/fondo-login.mp4";
import "./Login.css";

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || "";

export default function Login({ onLogin }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [recordarme, setRecordarme] = useState(true);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.6;
    }
  }, []);

  const handleGoogleLogin = useCallback(async (credentialResponse) => {
    setError("");
    setCargando(true);

    try {
      const respuesta = await fetch("http://145.223.103.219:8080/usuarios/login/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idToken: credentialResponse.credential,
        }),
      });

      if (respuesta.ok) {
        const data = await respuesta.json();
        onLogin({
          usuario: data.usuario,
          permisos: data.permisos || {},
        });
      } else if (respuesta.status === 404) {
        const data = await respuesta.json();
        setError(data.mensaje || "No existe un usuario con tu email de Google");
      } else if (respuesta.status === 401) {
        setError("Token de Google inválido");
      } else {
        setError("Error en el servidor");
      }
    } catch (err) {
      console.error(err);
      setError("No se pudo conectar con el servidor");
    } finally {
      setCargando(false);
    }
  }, [onLogin]);

  useEffect(() => {
    if (window.google && GOOGLE_CLIENT_ID) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleLogin,
      });

      window.google.accounts.id.renderButton(
        document.getElementById("googleSignInButton"),
        {
          theme: "outline",
          size: "large",
          width: "100%",
          text: "continue_with",
        }
      );
    }
  }, [handleGoogleLogin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setCargando(true);

    try {
      const respuesta = await fetch("http://145.223.103.219:8080/usuarios/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usuario: user,
          contrasena: pass,
        }),
      });

      if (respuesta.ok) {
        const data = await respuesta.json();
        onLogin({
          usuario: data.usuario,
          permisos: data.permisos || {},
        });
      } else if (respuesta.status === 401) {
        setError("Usuario o contraseña incorrectos");
      } else {
        setError("Error en el servidor");
      }
    } catch (err) {
      console.error(err);
      setError("No se pudo conectar con el servidor");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-screen">
      <video
        ref={videoRef}
        className="login-background-video"
        src={fondoVideo}
        autoPlay
        loop
        muted
        playsInline
      />
      <div className="login-card">
        <div className="login-card-icon">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5zm-3 5a3 3 0 0 1 6 0v3H9z"
              fill="currentColor"
            />
          </svg>
        </div>

        <h1 className="login-card-title">Acceso al ERP</h1>
        <p className="login-card-subtitle">Gestión profesional de tu empresa</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="login-field">
            <span>Usuario</span>
            <div className="login-input-wrapper">
              <span className="login-input-icon">
                <IconPersona />
              </span>
              <input
                className="login-input"
                type="text"
                placeholder="Tu usuario"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                required
              />
            </div>
          </label>

          <label className="login-field">
            <span>Contraseña</span>
            <div className="login-input-wrapper">
              <span className="login-input-icon">
                <IconCandado />
              </span>
              <input
                className="login-input"
                type="password"
                placeholder="********"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                required
              />
            </div>
          </label>

          <div className="login-aux">
            <label className="login-remember">
              <input
                type="checkbox"
                checked={recordarme}
                onChange={(e) => setRecordarme(e.target.checked)}
              />
              Recordarme
            </label>
            <button className="login-link" type="button">
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <button className="login-button" type="submit" disabled={cargando}>
            {cargando ? "Accediendo..." : "Iniciar sesión"}
          </button>
        </form>

        <div className="login-secure-row">
          <span className="login-secure-icon">
            <IconCandado aria-hidden="true" />
          </span>
          Conexión segura · Datos cifrados
        </div>

        <div className="login-divider">
          <span>o continuar con</span>
        </div>

        <div id="googleSignInButton" style={{ marginBottom: "16px" }}></div>

        <button className="login-secondary-button" type="button">
          Acceso demo
        </button>

        <p className="login-footnote">
          Soporte técnico disponible <button className="login-link" type="button">24/7</button>
        </p>

        {error && <p className="login-error">{error}</p>}
      </div>
    </div>
  );
}
