import { useState, useCallback } from "react";

const API_URL = "http://145.223.103.219:8080/empresa";

const formEmpresaInicial = {
  id: null,
  nombreComercial: "",
  razon: "",
  cif: "",
  direccion: "",
  codigoPostal: "",
  telefono: "",
  email: "",
  poblacion: "",
  provincia: "",
  pais: "",
  logo: null,
  smtpHost: "",
  smtpPort: "",
  smtpUsername: "",
  smtpPassword: "",
  smtpAuth: true,
  smtpStarttls: true,
};

export function useDatosEmpresa({ setMensaje, abrirPestana, cerrarPestana, pestanaActiva }) {
  const [empresa, setEmpresa] = useState(null);
  const [formEmpresa, setFormEmpresa] = useState(formEmpresaInicial);
  const [logoPreview, setLogoPreview] = useState(null);
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [probandoConexion, setProbandoConexion] = useState(false);
  const [resultadoPrueba, setResultadoPrueba] = useState(null);

  const cargarEmpresa = useCallback(async () => {
    try {
      const res = await fetch(API_URL);
      if (res.ok) {
        const data = await res.json();
        setEmpresa(data);
        setFormEmpresa({
          id: data.id,
          nombreComercial: data.nombreComercial || "",
          razon: data.razon || "",
          cif: data.cif || "",
          direccion: data.direccion || "",
          codigoPostal: data.codigoPostal || "",
          telefono: data.telefono || "",
          email: data.email || "",
          poblacion: data.poblacion || "",
          provincia: data.provincia || "",
          pais: data.pais || "",
          logo: data.logo,
          smtpHost: data.smtpHost || "",
          smtpPort: data.smtpPort?.toString() || "",
          smtpUsername: data.smtpUsername || "",
          smtpPassword: data.smtpPassword || "",
          smtpAuth: data.smtpAuth !== undefined ? data.smtpAuth : true,
          smtpStarttls: data.smtpStarttls !== undefined ? data.smtpStarttls : true,
        });
        setLogoPreview(data.logo ? `http://145.223.103.219:8080/empresa/logo/${data.logo}` : null);
      }
    } catch (err) {
      console.error(err);
      setMensaje("Error al cargar datos de la empresa");
    }
  }, [setMensaje]);

  const abrirEditarEmpresa = useCallback(() => {
    abrirPestana("empresa-editar", empresa?.id || 1, "Editar Empresa");
  }, [abrirPestana, empresa]);

  const handleLogoChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const subirLogo = useCallback(async (file) => {
    if (!empresa || !empresa.id) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_URL}/${empresa.id}/logo`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Error al subir logo");

      const data = await res.json();
      setFormEmpresa(prev => ({ ...prev, logo: data.logoUrl }));
      setMensaje("Logo actualizado correctamente");
      await cargarEmpresa();
    } catch (err) {
      console.error(err);
      setMensaje("Error al subir logo");
    }
  }, [empresa, cargarEmpresa, setMensaje]);

  const guardarEmpresa = useCallback(async (e, logoFile) => {
    e.preventDefault();
    setMensaje("");

    if (!empresa || !empresa.id) {
      setMensaje("No se puede actualizar: empresa no encontrada");
      return;
    }

    const cuerpo = JSON.stringify({
      nombreComercial: formEmpresa.nombreComercial,
      razon: formEmpresa.razon,
      cif: formEmpresa.cif,
      direccion: formEmpresa.direccion,
      codigoPostal: formEmpresa.codigoPostal,
      telefono: formEmpresa.telefono,
      email: formEmpresa.email,
      poblacion: formEmpresa.poblacion,
      provincia: formEmpresa.provincia,
      pais: formEmpresa.pais,
      logo: formEmpresa.logo,
      smtpHost: formEmpresa.smtpHost,
      smtpPort: formEmpresa.smtpPort ? parseInt(formEmpresa.smtpPort) : null,
      smtpUsername: formEmpresa.smtpUsername,
      smtpPassword: formEmpresa.smtpPassword,
      smtpAuth: formEmpresa.smtpAuth,
      smtpStarttls: formEmpresa.smtpStarttls,
    });

    try {
      const res = await fetch(`${API_URL}/${empresa.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: cuerpo,
      });

      if (!res.ok) throw new Error("Error en la petición");

      if (logoFile) {
        await subirLogo(logoFile);
      }

      await cargarEmpresa();
      setMensaje("Datos actualizados correctamente");
      if (pestanaActiva) cerrarPestana(pestanaActiva);
    } catch (err) {
      console.error(err);
      setMensaje("Error al guardar");
    }
  }, [empresa, formEmpresa, cargarEmpresa, subirLogo, setMensaje, pestanaActiva, cerrarPestana]);

  const probarConexionEmail = useCallback(async () => {
    setProbandoConexion(true);
    setResultadoPrueba(null);

    try {
      const res = await fetch(`${API_URL}/probar-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!res.ok) throw new Error("Error al probar conexión");

      const data = await res.json();
      setResultadoPrueba(data);
    } catch (err) {
      console.error(err);
      setResultadoPrueba({
        success: false,
        mensaje: "Error al probar conexión: " + err.message
      });
    } finally {
      setProbandoConexion(false);
    }
  }, []);

  const usarConfiguracionGmail = useCallback(() => {
    setFormEmpresa(prev => ({
      ...prev,
      smtpHost: "smtp.gmail.com",
      smtpPort: "587",
      smtpAuth: true,
      smtpStarttls: true,
    }));
  }, []);

  const usarConfiguracionOutlook = useCallback(() => {
    setFormEmpresa(prev => ({
      ...prev,
      smtpHost: "smtp-mail.outlook.com",
      smtpPort: "587",
      smtpAuth: true,
      smtpStarttls: true,
    }));
  }, []);

  const updateFormEmpresaField = useCallback((field, value) => {
    setFormEmpresa(prev => ({ ...prev, [field]: value }));
  }, []);

  return {
    empresa,
    formEmpresa,
    logoPreview,
    mostrarPassword,
    setMostrarPassword,
    probandoConexion,
    resultadoPrueba,
    cargarEmpresa,
    abrirEditarEmpresa,
    handleLogoChange,
    guardarEmpresa,
    probarConexionEmail,
    usarConfiguracionGmail,
    usarConfiguracionOutlook,
    updateFormEmpresaField,
  };
}
