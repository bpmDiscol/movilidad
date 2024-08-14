import React from "react";
import "./records.css";
import getSubSource from "./getSubSource";
import { Table } from "antd";
import ResponseTable from "./responseTable";

export default function FinancialTable({ dataSource, getColumns, data }) {
  const financialSource = getSubSource(
    [
      "ESTADO_DE_CORTE",
      "INTERES",
      "CORRIENTE_NO_VENCIDA_ACTUAL",
      "CORRIENTE_NO_VENCIDA_ASIGNADA",
      "CORRIENTE_VENCIDA_ACTUAL",
      "CORRIENTE_VENCIDA_ASIGNADA",
      "CORRIENTE_VENCIDA_ASIGNADA",
      "DEUDA_CASTIGADA_ASIGNADA",
      "DEUDA_DIFERIDA",
      "DEUDA_DIFERIDA_ACTUAL",
      "DEUDA_TOTAL_ACTUAL",
      "DEUDA_TOTAL_ASIGNADA",
      "DIAS_DEUDA_ACTUAL",
      "DIAS_DEUDA_ASIGNACION",
      "EDAD_MORA_ACTUAL",
      "NUMERO_DE_LA_ORDEN",
    ],
    dataSource.filter(
      (source) => source.NUMERO_DE_LA_ORDEN == data.NUMERO_DE_LA_ORDEN
    )
  );

  return (
    <Table
      bordered
      columns={getColumns(financialSource)}
      dataSource={financialSource}
      rowKey={(record) => record.NUMERO_DE_LA_ORDEN}
      pagination={false}
      scroll={{
        x: "100dvw",
        //   y: "50dvh",
      }}
      size="small"
      rowClassName={(_, index) =>
        index % 2 === 0 ? "ant-table-row-alternate" : "ant-table-row-base"
      }
      className="ant-table"
      expandable={{
        expandedRowRender: (data) => (
          <ResponseTable
            dataSource={dataSource}
            getColumns={getColumns}
            data={data}
          />
        ),
      }}
    />
  );
}
