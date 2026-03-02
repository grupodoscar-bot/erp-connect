export const SECCIONES_FILTRO = [
  { id: "identificacion", titulo: "Identificación" },
  { id: "contacto", titulo: "Contacto" },
  { id: "comercial", titulo: "Condiciones comerciales" },
  { id: "fiscal", titulo: "Configuración fiscal" },
];

const buildOptionsFromArray = (values = [], emptyLabel = "Todos") => [
  { value: "", label: emptyLabel },
  ...values.map((value) => ({
    value: value?.toString() ?? "",
    label: value?.toString() ?? "",
  })),
];

const matchExacto = (item, valorFiltro, campo) => {
  if (valorFiltro === "") return true;
  const valorCampo = campo.accessor ? campo.accessor(item) : item?.[campo.key];
  if (valorCampo === undefined || valorCampo === null) return false;
  return valorCampo.toString() === valorFiltro;
};

const normalizarValor = (valor) => {
  if (valor === null || valor === undefined) return "";
  return valor.toString().trim().toLowerCase();
};

const matchBasico = (item, valorFiltro, campo) => {
  const valorCampo = campo.accessor ? campo.accessor(item) : item?.[campo.key];
  if (valorCampo === undefined || valorCampo === null) return false;
  return normalizarValor(valorCampo).includes(normalizarValor(valorFiltro));
};

export const buildCamposFiltroTerceros = ({
  tarifas = [],
  modosImpuesto = [],
  retenciones = [],
  agrupaciones = [],
} = {}) => {
  const opcionesTarifa = buildOptionsFromArray(tarifas, "Todas las tarifas");
  const opcionesModoImpuesto = buildOptionsFromArray(modosImpuesto, "Todos los modos");
  const opcionesRetenciones = buildOptionsFromArray(retenciones, "Todas las retenciones");
  const opcionesAgrupaciones = [
    { value: "", label: "Todas las agrupaciones" },
    ...agrupaciones.map((agr) => ({
      value: agr.id?.toString() ?? "",
      label: agr.nombre || `Agrupación ${agr.id}`,
    })),
  ];

  return [
    { key: "nombreComercial", label: "Nombre comercial", placeholder: "Ej. Ferretería Sol", section: "identificacion" },
    { key: "nombreFiscal", label: "Nombre fiscal", placeholder: "Razón social", section: "identificacion" },
    { key: "nifCif", label: "NIF/CIF", placeholder: "12345678A", section: "identificacion", inputProps: { className: "erp-input-mono" } },
    { key: "pais", label: "País", placeholder: "España", section: "identificacion" },
    { key: "codigoPostal", label: "Código postal", placeholder: "28001", section: "identificacion", inputProps: { className: "erp-input-mono" } },
    { key: "direccion", label: "Dirección", placeholder: "Calle, número...", section: "identificacion" },
    { key: "email", label: "Email", placeholder: "correo@dominio.com", section: "contacto", inputProps: { type: "email" } },
    { key: "web", label: "Web", placeholder: "https://", section: "contacto" },
    { key: "observaciones", label: "Observaciones", placeholder: "Notas internas", section: "contacto" },
    { key: "telefonoFijo", label: "Teléfono fijo", placeholder: "912...", section: "contacto", inputProps: { className: "erp-input-mono" } },
    { key: "telefonoMovil", label: "Teléfono móvil", placeholder: "600...", section: "contacto", inputProps: { className: "erp-input-mono" } },
    { key: "fax", label: "Fax", placeholder: "", section: "contacto", inputProps: { className: "erp-input-mono" } },
    { key: "fechaNacimiento", label: "Fecha nacimiento", section: "comercial", inputProps: { type: "date" } },
    {
      key: "agrupacionId",
      label: "Agrupación",
      section: "comercial",
      type: "select",
      options: opcionesAgrupaciones,
      accessor: (item) => item?.agrupacion?.id?.toString() || "",
      match: matchExacto,
    },
    {
      key: "tarifa",
      label: "Tarifa",
      section: "comercial",
      type: "select",
      options: opcionesTarifa,
      match: matchExacto,
    },
    { key: "formaPago", label: "Forma de pago", placeholder: "CONTADO...", section: "comercial" },
    {
      key: "bloquearVentas",
      label: "Riesgo bloqueado",
      section: "comercial",
      type: "select",
      options: [
        { value: "", label: "Todos" },
        { value: "true", label: "Sí" },
        { value: "false", label: "No" },
      ],
      match: (item, valor) => {
        if (valor === "") return true;
        const boolValor = valor === "true";
        return Boolean(item?.bloquearVentas) === boolValor;
      },
    },
    {
      key: "modoImpuesto",
      label: "Modo impuesto",
      section: "fiscal",
      type: "select",
      options: opcionesModoImpuesto,
      match: matchExacto,
    },
    {
      key: "retencion",
      label: "Retención",
      section: "fiscal",
      type: "select",
      options: opcionesRetenciones,
      match: matchExacto,
    },
  ];
};

export const crearFiltrosIniciales = (campos = []) => {
  const base = {};
  campos.forEach((campo) => {
    base[campo.key] = campo.defaultValue ?? "";
  });
  return base;
};

export const pasaFiltrosAvanzados = (item, filtros, campos = []) => {
  return campos.every((campo) => {
    const valorFiltro = filtros[campo.key];
    if (valorFiltro === "" || valorFiltro === null || valorFiltro === undefined) {
      return true;
    }
    if (campo.match) {
      return campo.match(item, valorFiltro, campo);
    }
    return matchBasico(item, valorFiltro, campo);
  });
};

export default {
  SECCIONES_FILTRO,
  buildCamposFiltroTerceros,
  crearFiltrosIniciales,
  pasaFiltrosAvanzados,
};
