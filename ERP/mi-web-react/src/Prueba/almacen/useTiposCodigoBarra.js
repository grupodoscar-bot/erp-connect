import { useState, useCallback } from "react";

const API_URL = "http://145.223.103.219:8080/tipos-codigo-barra";

const formTipoInicial = {
  id: null,
  nombre: "",
  descripcion: "",
  campos: [{ nombre: "", longitud: 1, orden: 1, decimales: 0 }],
};

export function useTiposCodigoBarra({ setMensaje, abrirPestana, cerrarPestana, pestanaActiva }) {
  const [tipos, setTipos] = useState([]);
  const [formTipo, setFormTipo] = useState(formTipoInicial);
  const [seccionFormActiva, setSeccionFormActiva] = useState("general");
  
  // Estados para prueba de código
  const [tipoPrueba, setTipoPrueba] = useState(null);
  const [codigoPrueba, setCodigoPrueba] = useState("");
  const [resultadoPrueba, setResultadoPrueba] = useState(null);
  const [modalPruebaAbierto, setModalPruebaAbierto] = useState(false);

  const cargarTipos = useCallback(async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setTipos(data);
    } catch (err) {
      console.error(err);
      setMensaje("Error al cargar tipos de código de barras");
    }
  }, [setMensaje]);

  const limpiarFormTipo = useCallback(() => {
    setFormTipo(formTipoInicial);
    setSeccionFormActiva("general");
  }, []);

  const cargarTipoEnForm = useCallback((tipo) => {
    setFormTipo({
      id: tipo.id,
      nombre: tipo.nombre || "",
      descripcion: tipo.descripcion || "",
      campos: tipo.campos?.length > 0 
        ? tipo.campos.map(c => ({ ...c })) 
        : [{ nombre: "", longitud: 1, orden: 1, decimales: 0 }],
    });
    setSeccionFormActiva("general");
  }, []);

  const abrirNuevoTipo = useCallback(() => {
    limpiarFormTipo();
    abrirPestana("tipo-codigo-nuevo");
  }, [limpiarFormTipo, abrirPestana]);

  const abrirEditarTipo = useCallback((tipo) => {
    cargarTipoEnForm(tipo);
    abrirPestana("tipo-codigo-editar", tipo.id, tipo.nombre);
  }, [cargarTipoEnForm, abrirPestana]);

  const abrirVerTipo = useCallback((tipo) => {
    abrirPestana("tipo-codigo-ver", tipo.id, `Ver: ${tipo.nombre}`);
  }, [abrirPestana]);

  const guardarTipo = useCallback(async (e) => {
    e.preventDefault();
    setMensaje("");

    // Validar campos
    for (let campo of formTipo.campos) {
      if (!campo.nombre.trim()) {
        setMensaje("Todos los campos deben tener un nombre");
        return;
      }
      if (campo.longitud < 1) {
        setMensaje("La longitud debe ser al menos 1");
        return;
      }
    }

    const cuerpo = JSON.stringify({
      nombre: formTipo.nombre,
      descripcion: formTipo.descripcion,
      campos: formTipo.campos.map((c, index) => ({
        nombre: c.nombre,
        longitud: parseInt(c.longitud),
        orden: index + 1,
        decimales: parseInt(c.decimales) || 0
      }))
    });

    try {
      let res;
      if (!formTipo.id) {
        res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: cuerpo,
        });
      } else {
        res = await fetch(`${API_URL}/${formTipo.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: cuerpo,
        });
      }

      if (!res.ok) throw new Error("Error en la petición");

      await cargarTipos();
      setMensaje("Tipo guardado correctamente");
      if (pestanaActiva) cerrarPestana(pestanaActiva);
    } catch (err) {
      console.error(err);
      setMensaje("Error al guardar tipo");
    }
  }, [formTipo, cargarTipos, setMensaje, pestanaActiva, cerrarPestana]);

  const borrarTipo = useCallback(async (id) => {
    if (!window.confirm("¿Seguro que quieres borrar este tipo?")) return;

    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) throw new Error("Error al borrar");

      await cargarTipos();
      setMensaje("Tipo borrado");
    } catch (err) {
      console.error(err);
      setMensaje("Error al borrar tipo");
    }
  }, [cargarTipos, setMensaje]);

  const updateFormTipoField = useCallback((field, value) => {
    setFormTipo(prev => ({ ...prev, [field]: value }));
  }, []);

  // Funciones para gestionar campos
  const agregarCampo = useCallback(() => {
    setFormTipo(prev => ({
      ...prev,
      campos: [...prev.campos, { nombre: "", longitud: 1, orden: prev.campos.length + 1, decimales: 0 }]
    }));
  }, []);

  const eliminarCampo = useCallback((index) => {
    setFormTipo(prev => {
      if (prev.campos.length === 1) {
        setMensaje("Debe haber al menos un campo");
        return prev;
      }
      const nuevosCampos = prev.campos.filter((_, i) => i !== index);
      nuevosCampos.forEach((campo, i) => { campo.orden = i + 1; });
      return { ...prev, campos: nuevosCampos };
    });
  }, [setMensaje]);

  const actualizarCampo = useCallback((index, propiedad, valor) => {
    setFormTipo(prev => {
      const nuevosCampos = [...prev.campos];
      nuevosCampos[index] = { ...nuevosCampos[index], [propiedad]: valor };
      return { ...prev, campos: nuevosCampos };
    });
  }, []);

  const moverCampo = useCallback((fromIndex, toIndex) => {
    setFormTipo(prev => {
      const nuevosCampos = [...prev.campos];
      const [removed] = nuevosCampos.splice(fromIndex, 1);
      nuevosCampos.splice(toIndex, 0, removed);
      nuevosCampos.forEach((campo, i) => { campo.orden = i + 1; });
      return { ...prev, campos: nuevosCampos };
    });
  }, []);

  // Funciones para prueba de código
  const abrirModalPrueba = useCallback((tipo) => {
    setTipoPrueba(tipo);
    setCodigoPrueba("");
    setResultadoPrueba(null);
    setModalPruebaAbierto(true);
  }, []);

  const cerrarModalPrueba = useCallback(() => {
    setModalPruebaAbierto(false);
    setCodigoPrueba("");
    setResultadoPrueba(null);
  }, []);

  const calcularLongitudTotal = useCallback((camposList) => {
    return camposList.reduce((sum, campo) => sum + parseInt(campo.longitud || 0), 0);
  }, []);

  const parsearCodigo = useCallback((codigo, campos) => {
    const resultado = [];
    let posicion = 0;
    const camposOrdenados = [...campos].sort((a, b) => a.orden - b.orden);

    for (let campo of camposOrdenados) {
      const longitud = parseInt(campo.longitud);
      const decimales = parseInt(campo.decimales) || 0;
      const valor = codigo.substring(posicion, posicion + longitud);
      
      let valorFormateado = valor;
      if (valor && decimales > 0 && valor.length === longitud) {
        const entero = valor.substring(0, valor.length - decimales);
        const decimal = valor.substring(valor.length - decimales);
        valorFormateado = `${entero || '0'}.${decimal}`;
      }
      
      resultado.push({
        nombre: campo.nombre,
        valor: valor || "",
        valorFormateado: valorFormateado,
        completo: valor.length === longitud,
        decimales: decimales
      });
      posicion += longitud;
    }

    const sobrante = codigo.substring(posicion);
    return { resultado, sobrante };
  }, []);

  const comprobarCodigo = useCallback(() => {
    if (!codigoPrueba || !tipoPrueba) {
      setResultadoPrueba(null);
      return;
    }
    
    let codigoAComprobar = codigoPrueba;
    const longitudEsperada = calcularLongitudTotal(tipoPrueba.campos);
    
    if (codigoAComprobar.length < longitudEsperada) {
      const cerosAgregados = longitudEsperada - codigoAComprobar.length;
      codigoAComprobar = '0'.repeat(cerosAgregados) + codigoAComprobar;
      setCodigoPrueba(codigoAComprobar);
    }
    
    const resultado = parsearCodigo(codigoAComprobar, tipoPrueba.campos);
    setResultadoPrueba(resultado);
  }, [codigoPrueba, tipoPrueba, calcularLongitudTotal, parsearCodigo]);

  return {
    tipos,
    formTipo,
    seccionFormActiva,
    setSeccionFormActiva,
    tipoPrueba,
    codigoPrueba,
    setCodigoPrueba,
    resultadoPrueba,
    modalPruebaAbierto,
    cargarTipos,
    abrirNuevoTipo,
    abrirEditarTipo,
    abrirVerTipo,
    guardarTipo,
    borrarTipo,
    updateFormTipoField,
    agregarCampo,
    eliminarCampo,
    actualizarCampo,
    moverCampo,
    abrirModalPrueba,
    cerrarModalPrueba,
    calcularLongitudTotal,
    comprobarCodigo,
  };
}
