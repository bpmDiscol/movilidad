const tipoServMap = {
  1: "cartera",
  2: "suspension sencilla",
  3: "suspension drastica",
  4: "reconexion",
};
export default function renameKeys(records) {
  const keyMap = {
    PRED_NUMERO: "PRODUCTO",
    PROG_ANNO: "CONTRATO",
    TIPO_SERV: "DESCRIPCION_TIPO_PRODUCTO",
    CLASEUSO: "DESCRIPCION_CATEGORIA",
    ULTFECHAPAGO: "DESCRIPCION_SUBCATEGORIA",
    TIENE_NUM_MEDIDOR: "NUMERO_REFINANCIACIONES_ULTIMO_ANO",
    PRED_ESTADO: "ESTADO_FINANCIERO",
    // "ÚLTIMA LECTURA TOMADA": Omitted as no key was given
    NUM_MEDIDOR: "ELEMENTO_MEDICION",
    BARRIO: "DESCRIPCION_BARRIO",
    RUTA: "DESCRIPCION_CICLO",
    PROG_MES: "IDENTIFICACION",
    NOMBRE: "NOMBRE_CLIENTE",
    DIRECCION: "DIRECCION_PREDIO",
    FECHA_EDAD_FACTURA: "DIAS_DEUDA_ASIGNACION",
    FACT_VALORTOTAL: "DEUDA_TOTAL_ASIGNADA",
    FACT_VRCORRIENTE: "CORRIENTE_NO_VENCIDA_ASIGNADA",
    FACT_CARTERA: "CORRIENTE_VENCIDA_ASIGNADA",
    FINANCIACIONES: "REFINANCIACIONES_PRODUCTO",
    EDAD: "EDAD_MORA_ACTUAL",
    PAGO: "TOTAL_DEUDA_CORRIENTE",
    DIFERIDOS: "INDICADOR",
  };

  let renamedRecords = {};

  for (let key in records) {
    const newKey = keyMap[key] || key; // Use the new key or keep the old key if not found
    const value = records[key];
    if (key === "TIPO_SERV" && tipoServMap[`${value}`]) {
      records[key] = tipoServMap[`${value}`];
    }

    renamedRecords[newKey] = records[key];
  }

  return renamedRecords;
}
