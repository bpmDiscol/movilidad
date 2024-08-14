import "./records.css";
import { Badge, Flex, Table, Typography } from "antd";
const { Text, Title, Link } = Typography;
import React from "react";
import getSubSource from "./getSubSource";
import moment from "moment";
import FinancialTable from "./financialTable";
import formatIfNumber from "../../utils/formatIfNumber";

export default function MainTable({
  dataSource,
  pagination,
  handleTableChange,
  managers,
}) {

  const mainSource = getSubSource(
    [
      "GESTOR",
      "PERIODO",
      "NUMERO_DE_LA_ORDEN",
      "FECHA_DE_GESTION",
      "INDICADOR",
      "DESCRIPCION_TIPO_PRODUCTO",
      "ESTADO_DE_PRODUCTO",
      "ESTADO_FINANCIERO",
      "DESCRIPCION_CICLO",
      "DESCRIPCION_LOCALIDAD",
      "CONTRATO",
      "NOMBRE_CLIENTE",
      "CLIENTE",
      "IDENTIFICACION",
      "TIPO_CLIENTE",
      "DESCRIPCION_BARRIO",
      "DESCRIPCION_CATEGORIA",
      "DESCRIPCION_SUBCATEGORIA",
      "DIRECCION_PREDIO",
      "DIRECCION_COBRO",
      "LOTE_ASIGNACION",
      "NIVEL_TIPO_ASIGNACION",
      "UNIDAD_OPERATIVA",
      "ULTIMA_LECTURA_TOMADA",
    ],
    dataSource
  );

  const getColumns = (source) => {
    if (dataSource.length === 0) return [];

    // Generate columns dynamically from the keys of the first record
    return Object.keys(source[0])
      .filter((key) => key != "_id")
      .map((key, idx) => ({
        title: <Text strong style={{fontSize:'11px'}}>{key.toUpperCase().replace(/_/g, " ").replace(/_{2,}/g, " ")}</Text> ,
        dataIndex: key,
        key: key + idx,
        width: 170,
        fixed: key === "GESTOR",
        render: (text, record) => {
          if (key === "GESTOR") {
            // Replace GESTOR ID with the username
            const manager = managers.find(
              (manager) => manager.id === record[key]
            );
            return (
              <Text key={key + idx}>{manager ? manager.username : text}</Text>
            );
          }
          if (key === "PERIODO")
            return (
              <Text key={key + idx} code>
                {text}
              </Text>
            );
          if (key === "FECHA_DE_GESTION")
            return (
              <Text key={key + idx} code>
                <Badge status={text ? "success" : "processing"} />{" "}
                {text ? moment(text).format("DD/MM/YYYY") : "no gestionado"}
              </Text>
            );
          if (key === "FOTOS")
            return (
              <Flex vertical>
                {text?.map((link, ind) => (
                  <Link href={link} target="_blank" key={ind}>
                    Foto {ind + 1}
                  </Link>
                ))}
              </Flex>
            );

          return <Text key={key + idx}>{formatIfNumber(text)}</Text>;
        },
      }));
  };

  return (
    <>
      <Table
        bordered
        columns={getColumns(mainSource)}
        dataSource={mainSource}
        expandable={{
          expandedRowRender: (data) => (
            <FinancialTable dataSource={dataSource} getColumns={getColumns} data={data} />
          ),
        }}
        rowKey={(record) => record.NUMERO_DE_LA_ORDEN}
        pagination={{
          ...pagination,
          showTotal: (total) => (
            <Text
              keyboard
              type="danger"
            >{`${total} Resultados encontrados `}</Text>
          ),
          position: ["topLeft"],
        }}
        onChange={handleTableChange}
        scroll={{
          x: "100dvw",
        }}
        style={{ width: "100vw", overflowX: "auto" }}
        size="small"
        rowClassName={(_, index) =>
          index % 2 === 0 ? "ant-table-row-alternate" : "ant-table-row-base"
        }
        className="ant-table"
      />
    </>
  );
}
