import { Meteor } from "meteor/meteor";
import { Button, message, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import XLSX from "xlsx";
import React, { useState } from "react";

export default function ExcelAssignButton({ managers, setReload }) {
  const [loading, setLoading] = useState(false);

  const handleFileUpload = (file) => {
    setLoading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      // Suponiendo que los datos están en la primera hoja
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = XLSX.utils.sheet_to_json(
        workbook.Sheets[firstSheetName],
        { header: 1 }
      );

      // Omitir las dos primeras filas
      const rows = worksheet.slice(2);

      const gestoresNoExistentes = new Set();

      rows.forEach((row) => {
        const [nombreGestor, idOrden] = row;

        if (
          !nombreGestor ||
          !idOrden ||
          gestoresNoExistentes.has(nombreGestor)
        ) {
          return;
        }

        // Verificar si el gestor existe
        const gestor = managers.filter(
          (manager) => manager.username == nombreGestor
        );

        if (!gestor.length) {
          if (!gestoresNoExistentes.has(nombreGestor)) {
            gestoresNoExistentes.add(nombreGestor);
          }
          message.warning(
            `El gestor ${nombreGestor} no esta bajo su cargo o no existe.`
          );
          return;
        }
        Meteor.call(
          "updateRecordManager",
          idOrden.toString(),
          gestor[0].id,
          (err) => {
            if (err)
              message.error(
                `Error al asignar la orden ${idOrden} al gestor ${nombreGestor}`
              );
            setReload(Math.random())
          }
        );
      });

      setLoading(false);

      message.success("Operación terminada exitosamente.");
    };

    reader.onerror = (error) => {
      console.error("Error leyendo el archivo:", error);
      message.error("Error al cargar el archivo.");
    };

    reader.readAsArrayBuffer(file);
    return false;
  };

  return (
    <Upload beforeUpload={handleFileUpload} showUploadList={false}>
      <Button loading={loading} icon={<UploadOutlined />}>
        Subir Archivo de Tareas
      </Button>
    </Upload>
  );
}
