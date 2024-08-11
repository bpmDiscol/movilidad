import formatNumber from "./formatNumbers";

export default function formatIfNumber(input) {
  // Intenta convertir el string a un número
  const number = parseFloat(input);

  // Verifica si el input es un número y no es NaN
  if (!isNaN(number) && isFinite(number)) {
    // Formatea el número usando la función de formateo
    return formatNumber(number);
  } else {
    // Si no es un número, devuelve el string original
    return input;
  }
}
