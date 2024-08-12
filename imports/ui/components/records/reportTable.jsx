import { Button, Flex, Table, Typography } from "antd";
import React from "react";
import XLSX from "xlsx";

import formatNumber from "../../utils/formatNumbers";
import "./records.css";

const { Title, Text } = Typography;
export default function ReportTable({ report, managers }) {
  const reporte = [
    ...report.gestores,
    {
      asignadas: report.totalAsignadas,
      gestionadas: report.totalGestionadas,
      gestor: "TOTAL",
      pendientes: report.totalPendientes,
      totalDeudaCorrienteAsignada: report.totalDeudaCorrienteAsignada,
      totalDeudaCorrienteGestionada: report.totalDeudaCorrienteGestionada,
    },
  ];

  function filterManager(id) {
    if (id == "TOTAL") return "TOTAL";
    const filtered = managers.filter((manager) => manager.id == id)[0];
    if (!filtered) return "Gestor no encontrado";
    return filtered.username.toUpperCase();
  }

  function handleExport() {
    const updatedResult = reporte.map((report) => ({
      Gestor: report.gestor ? filterManager(report.gestor) : "No asignado",
      Asignadas: report.asignadas,
      Gestionadas: report.gestionadas,
      Pendientes: report.pendientes,
      "Total deuda corriente asignada": report.totalDeudaCorrienteAsignada,
      "Total deuda corriente gestionada": report.totalDeudaCorrienteGestionada,
    }));
    console.log(updatedResult);

    const ws = XLSX.utils.json_to_sheet(updatedResult);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, `Reporte-Gestores-${Date.now()}.xlsx`);
  }

  return (
    <>
      <Flex align="center" justify="space-between">
        <Title>Reporte por gestor</Title>
        <Button type="primary" onClick={() => handleExport()}>
          Exportar a excel
        </Button>
      </Flex>

      <Table
        dataSource={reporte}
        pagination={false}
        rowClassName={(_, index) =>
          index % 2 === 0 ? "ant-table-row-alternate" : "ant-table-row-base"
        }
      >
        <Table.Column
          title="Gestor"
          dataIndex={"gestor"}
          render={(value, _, index) => (
            <Text strong={index == reporte.length - 1}>
              {value ? filterManager(value) : "No asignado"}
            </Text>
          )}
        />
        <Table.Column
          title="Asignadas"
          dataIndex={"asignadas"}
          render={(value, _, index) => (
            <Text strong={index == reporte.length - 1}>
              {formatNumber(value)}
            </Text>
          )}
        />
        <Table.Column
          title="Deuda corriente asignada"
          dataIndex={"totalDeudaCorrienteAsignada"}
          render={(value, _, index) => (
            <Text strong={index == reporte.length - 1}>
              ${formatNumber(value)}
            </Text>
          )}
        />
        <Table.Column
          title="Deuda corriente gestionada"
          dataIndex={"totalDeudaCorrienteGestionada"}
          render={(value, _, index) => (
            <Text strong={index == reporte.length - 1}>
              ${formatNumber(value)}
            </Text>
          )}
        />
        <Table.Column
          title="Pendientes"
          dataIndex={"pendientes"}
          render={(value, _, index) => (
            <Text strong={index == reporte.length - 1}>
              {formatNumber(value)}
            </Text>
          )}
        />
      </Table>
    </>
  );
}
