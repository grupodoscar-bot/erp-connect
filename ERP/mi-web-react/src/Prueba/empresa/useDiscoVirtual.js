import { useState, useCallback, useEffect } from "react";

const API_URL = "http://145.223.103.219:8080/archivos-empresa";

export function useDiscoVirtual({ setMensaje }) {
  const [archivos, setArchivos] = useState([]);
  const [rutaActual, setRutaActual] = useState("/");

  // Recargar archivos cuando cambia la ruta
  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await fetch(`${API_URL}?rutaCarpeta=${encodeURIComponent(rutaActual)}`);
        const data = await res.json();
        setArchivos(data);
      } catch (err) {
        console.error(err);
      }
    };
    cargar();
  }, [rutaActual]);
  const [mostrarModalCarpeta, setMostrarModalCarpeta] = useState(false);
  const [mostrarModalRenombrar, setMostrarModalRenombrar] = useState(false);
  const [nombreNuevaCarpeta, setNombreNuevaCarpeta] = useState("");
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [archivoSubir, setArchivoSubir] = useState(null);

  const cargarArchivos = useCallback(async (ruta = rutaActual) => {
    try {
      const res = await fetch(`${API_URL}?rutaCarpeta=${encodeURIComponent(ruta)}`);
      const data = await res.json();
      setArchivos(data);
    } catch (err) {
      console.error(err);
      setMensaje("Error al cargar archivos");
    }
  }, [rutaActual, setMensaje]);

  const crearCarpeta = useCallback(async () => {
    if (!nombreNuevaCarpeta.trim()) {
      setMensaje("El nombre de la carpeta no puede estar vacío");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/carpeta`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rutaCarpeta: rutaActual,
          nombre: nombreNuevaCarpeta
        })
      });

      if (res.ok) {
        setMensaje("Carpeta creada correctamente");
        setNombreNuevaCarpeta("");
        setMostrarModalCarpeta(false);
        cargarArchivos();
      } else {
        setMensaje("Error: La carpeta ya existe");
      }
    } catch (err) {
      console.error(err);
      setMensaje("Error al crear carpeta");
    }
  }, [nombreNuevaCarpeta, rutaActual, cargarArchivos, setMensaje]);

  const subirArchivo = useCallback(async () => {
    if (!archivoSubir) {
      setMensaje("Selecciona un archivo");
      return;
    }

    const formData = new FormData();
    formData.append("archivo", archivoSubir);
    formData.append("rutaCarpeta", rutaActual);

    try {
      const res = await fetch(`${API_URL}/subir`, {
        method: "POST",
        body: formData
      });

      if (res.ok) {
        setMensaje("Archivo subido correctamente");
        setArchivoSubir(null);
        cargarArchivos();
      } else {
        setMensaje("Error: El archivo ya existe");
      }
    } catch (err) {
      console.error(err);
      setMensaje("Error al subir archivo");
    }
  }, [archivoSubir, rutaActual, cargarArchivos, setMensaje]);

  const descargarArchivo = useCallback(async (id, nombre) => {
    try {
      const res = await fetch(`${API_URL}/descargar/${id}`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = nombre;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setMensaje("Archivo descargado");
    } catch (err) {
      console.error(err);
      setMensaje("Error al descargar archivo");
    }
  }, [setMensaje]);

  const eliminarArchivo = useCallback(async (id, nombre, esCarpeta) => {
    if (!window.confirm(`¿Eliminar ${esCarpeta ? "carpeta" : "archivo"} "${nombre}"?`)) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE"
      });

      if (res.ok) {
        setMensaje(`${esCarpeta ? "Carpeta" : "Archivo"} eliminado`);
        cargarArchivos();
      } else {
        setMensaje("Error: La carpeta debe estar vacía para eliminarla");
      }
    } catch (err) {
      console.error(err);
      setMensaje("Error al eliminar");
    }
  }, [cargarArchivos, setMensaje]);

  const abrirModalRenombrar = useCallback((archivo) => {
    setArchivoSeleccionado(archivo);
    setNuevoNombre(archivo.nombre);
    setMostrarModalRenombrar(true);
  }, []);

  const renombrar = useCallback(async () => {
    if (!nuevoNombre.trim()) {
      setMensaje("El nombre no puede estar vacío");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/${archivoSeleccionado.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: nuevoNombre })
      });

      if (res.ok) {
        setMensaje("Renombrado correctamente");
        setMostrarModalRenombrar(false);
        cargarArchivos();
      } else {
        setMensaje("Error: Ya existe un archivo con ese nombre");
      }
    } catch (err) {
      console.error(err);
      setMensaje("Error al renombrar");
    }
  }, [nuevoNombre, archivoSeleccionado, cargarArchivos, setMensaje]);

  const navegarCarpeta = useCallback((carpeta) => {
    const nuevaRuta = rutaActual === "/"
      ? `/${carpeta.nombre}`
      : `${rutaActual}/${carpeta.nombre}`;
    setRutaActual(nuevaRuta);
  }, [rutaActual]);

  const irAtras = useCallback(() => {
    if (rutaActual === "/") return;
    const partes = rutaActual.split("/").filter(p => p);
    partes.pop();
    setRutaActual(partes.length === 0 ? "/" : "/" + partes.join("/"));
  }, [rutaActual]);

  const formatearTamano = useCallback((bytes) => {
    if (!bytes) return "—";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  }, []);

  const cerrarModalCarpeta = useCallback(() => {
    setMostrarModalCarpeta(false);
    setNombreNuevaCarpeta("");
  }, []);

  const cerrarModalRenombrar = useCallback(() => {
    setMostrarModalRenombrar(false);
    setNuevoNombre("");
    setArchivoSeleccionado(null);
  }, []);

  return {
    archivos,
    rutaActual,
    setRutaActual,
    mostrarModalCarpeta,
    setMostrarModalCarpeta,
    mostrarModalRenombrar,
    nombreNuevaCarpeta,
    setNombreNuevaCarpeta,
    archivoSeleccionado,
    nuevoNombre,
    setNuevoNombre,
    archivoSubir,
    setArchivoSubir,
    cargarArchivos,
    crearCarpeta,
    subirArchivo,
    descargarArchivo,
    eliminarArchivo,
    abrirModalRenombrar,
    renombrar,
    navegarCarpeta,
    irAtras,
    formatearTamano,
    cerrarModalCarpeta,
    cerrarModalRenombrar,
  };
}
