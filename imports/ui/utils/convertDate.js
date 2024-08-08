export default function convertDate(fechaISO) {
  const opciones = { year: "numeric", month: "long", day: "numeric" };
  const fecha = new Date(fechaISO);
  return fecha.toLocaleDateString("es-ES", opciones);
}
