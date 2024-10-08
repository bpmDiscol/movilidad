export default function checkKeys(obj) {
  const clavesRequeridas = [
    "CLIENTE",
    "CONTRATO",
    "CORRIENTE NO VENCIDA ACTUAL",
    "CORRIENTE NO VENCIDA ASIGNADA",
    "CORRIENTE VENCIDA ACTUAL",
    "CORRIENTE VENCIDA ASIGNADA",
    "DESCRIPCIÓN BARRIO",
    "DESCRIPCIÓN CATEGORÍA",
    "DESCRIPCIÓN CICLO",
    "DESCRIPCIÓN ESTADO ORDEN",
    "DESCRIPCIÓN LOCALIDAD",
    "DESCRIPCIÓN SUBCATEGORÍA",
    "DESCRIPCIÓN TIPO PRODUCTO",
    "DEUDA CASTIGADA ACTUAL",
    "DEUDA CASTIGADA ASIGNADA",
    "DEUDA DIFERIDA",
    "DEUDA DIFERIDA ACTUAL",
    "DEUDA TOTAL ACTUAL",
    "DEUDA TOTAL ASIGNADA",
    "DIRECCIÓN COBRO",
    "DIRECCIÓN PREDIO",
    "DÍAS DEUDA ACTUAL",
    "DÍAS DEUDA ASIGNACIÓN",
    "EDAD MORA",
    "EDAD MORA ACTUAL",
    "ESTADO DE CORTE",
    "ESTADO DE PRODUCTO",
    "ESTADO FINANCIERO",
    "FECHA DE ASIGNACIÓN",
    "IDENTIFICACIÓN",
    "INTERÉS",
    "LOTE ASIGNACIÓN",
    "NIVEL TIPO ASIGNACIÓN",
    "NOMBRE CLIENTE",
    "NOMBRE UNIDAD OPERATIVA",
    "NÚMERO DE LA ORDEN",
    "NÚMERO REFINANCIACIONES ÚLTIMO AÑO",
    "PRODUCTO",
    "RECARGO POR MORA",
    "REFINANCIACIONES PRODUCTO",
    "TIPO CLIENTE",
    "UNIDAD OPERATIVA",
    "VALIDACIÓN REF PRODUCTO",
    "ÚLTIMA LECTURA TOMADA",
    "ÚLTIMO TIPO COMENTARIO OT",
    "INDICADOR"
  ];

  return clavesRequeridas.every((clave) => obj.hasOwnProperty(clave));
}
