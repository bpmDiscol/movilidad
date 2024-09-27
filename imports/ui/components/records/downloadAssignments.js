import { message } from "antd";
import { Meteor } from "meteor/meteor";
import * as XLSX from "xlsx";

export default async function downloadRecordsAsExcel(managers, leaders, cb) {
  Meteor.call("get_assignments", (error, result) => {
    if (error) {
      console.error("Error fetching records:", error);
      return;
    }

    const data = result.map((res) => {
      const GESTOR =
        managers.find((manager) => manager.id === res.GESTOR)?.username ||
        res.GESTOR ||
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
    message.loading('data')

    const ws = XLSX.utils.json_to_sheet(data);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Asignaciones");
    XLSX.writeFile(wb, `Asignaciones-${Date.now()}.xlsx`);
    cb(false)
  });
}
