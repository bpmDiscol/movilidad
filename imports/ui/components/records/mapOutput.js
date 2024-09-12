const formatColumnTitle = (title) => {
  return title
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export default function mapOutput(output) {
  const columns = [
    "PRODUCTO",
    "CONTRATO",
    "CLIENTE",
    "DESCRIPCION_TIPO_PRODUCTO",
    "DESCRIPCION_LOCALIDAD",
    "DESCRIPCION_BARRIO",
    "DESCRIPCION_CICLO",
    "TIPO_CLIENTE",
    "IDENTIFICACION",
    "NOMBRE_CLIENTE",
    "DIRECCION_PREDIO",
    "GESTOR",
    "fecha_gestion",
    "updatedAt",
    "causal_de_no_pago",
    "contacto",
    "resultado_de_gestion",
    "telefono_sugerido",
    "tipo_de_vivienda",
    "ubicacion",
    "fotos",
    "PERIODO",
    "LATITUD",
    "LONGITUD",
    "ELEMENTO_MEDICION",
    "EMAIL",
    "estado_servicio",
    "lectura",
    "COMENTARIO",
    "causal_de_pago",
    "recibo",
    "valor_recibo",
    "IDENTIFICACION_CODEUDOR",
    "NOMBRE_CODEUDOR",
    "TELEFONO_MOVIL_CODEUDOR",
    "TELEFONO_FIJO_CODEUDOR",
    "PAGOS_PERIODOS_ASIGNADO",
    "PROYECTO",
  ];
  const formattedHeaders = columns.map(formatColumnTitle);

  const mappedData = output.map((record) => {
    const mappedRecord = {};
    columns.forEach((col) => {
      mappedRecord[formatColumnTitle(col)] = record[col] || "";
    });
    return mappedRecord;
  });
  return { formattedHeaders, mappedData, columns };
}
