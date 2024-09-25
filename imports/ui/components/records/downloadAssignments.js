import { Meteor } from "meteor/meteor";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// Función para descargar los datos como archivo Excel
const downloadRecordsAsExcel = (managers, leaders) => {
  // Llamamos al método del servidor para obtener los datos
  Meteor.call("get_assignments", (error, result) => {
    if (error) {
      console.error("Error fetching records:", error);
      return;
    }

    const data = result.map((res) => {
      const GESTOR =
        managers.find((manager) => manager.id === res.GESTOR)?.username ||
        record.GESTOR ||
        "No asignado";

      const LIDER =
        leaders.find((leader) => leader.id === res.leaderId).username ||
        "no encontrado";

      return {
        GESTOR,
        LIDER,
        DESCRIPCION_TIPO_PRODUCTO: res.DESCRIPCION_TIPO_PRODUCTO,
        STATUS: res.status,
      };
    });

    // Convertir los datos a formato de hoja de cálculo
    const ws = XLSX.utils.json_to_sheet(data);

    // Crear un nuevo libro de trabajo
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Records");

    // Generar el archivo Excel en formato binario
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "binary" });

    // Convertir la salida a un formato que pueda descargarse
    const s2ab = (s) => {
      const buf = new ArrayBuffer(s.length); // Crea un buffer de la longitud del string
      const view = new Uint8Array(buf); // Crea una vista en ese buffer
      for (let i = 0; i < s.length; i++) {
        view[i] = s.charCodeAt(i) & 0xff; // Llena el buffer con los datos del string
      }
      return buf;
    };

    // Guardar el archivo Excel generado
    saveAs(
      new Blob([s2ab(wbout)], { type: "application/octet-stream" }),
      "asignaciones.xlsx"
    );
  });
};

// Llamar a la función para iniciar la descarga
export default downloadRecordsAsExcel;
