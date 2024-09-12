import React from "react";
import "./records.css";
import getSubSource from "./getSubSource";
import { Table } from "antd";

export default function ResponseTable({ dataSource, getColumns, data }) {

  const response = getSubSource(
    [
      "resultado_de_gestion",
      "causal_de_pago",
      "causal_de_no_pago",
      "fecha_compromiso",
      "contacto",
      "estado_servicio",
      "recibo",
      "valor_recibo",
      "lectura",
      "tipo_de_vivienda",
      "contacto",
      "telefono_sugerido",
      "observacion",
      "FOTOS",
      "LATITUD",
      "LONGITUD"
    ],
    dataSource.filter(
      (source) => source.NUMERO_DE_LA_ORDEN == data.NUMERO_DE_LA_ORDEN
    )
  );

  return (
    <Table
      bordered
      columns={getColumns(response)}
      dataSource={response}
      rowKey={() => Math.random() * 10000}
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
    />
  );
}
