import {
  Affix,
  Button,
  DatePicker,
  Flex,
  Select,
  Space,
  Table,
  Typography,
} from "antd";
import React, { useEffect, useState } from "react";
import moment from "moment";
import { Meteor } from "meteor/meteor";
import XLSX from "xlsx";
import convertDate from "../../utils/convertDate";
import formatNumber from "../../utils/formatNumbers";
import "./records.css";
import MainTable from "./mainTable";
import ReportTable from "./reportTable";

const { Text, Title } = Typography;

export default function GetReport() {
  const [dataSource, setDataSource] = useState([]);
  const [managers, setManagers] = useState([]);
  const [selectedManager, setSelectedManager] = useState(null);
  const [period, setPeriod] = useState(null);
  const [date, setDate] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [report, setReport] = useState();
  const [totales, setTotales] = useState();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  });

  useEffect(() => {
    fetchReport(pagination.current, pagination.pageSize);
    Meteor.call("getManagers", Meteor.userId(), (error, result) => {
      if (error) {
        console.error("Error fetching managers:", error);
      } else {
        setManagers(result);
      }
    });
  }, []);

  const fetchReport = (page, pageSize) => {
    Meteor.call(
      "reportManagement",
      {
        page,
        pageSize,
        managerId: selectedManager,
        period: period ? moment(period).toISOString() : null,
        date: date ? moment(date, "DD/MM/YYYY").format("DD/MM/YYYY") : null,
        startDate: startDate
          ? moment(startDate, "DD/MM/YYYY").format("DD/MM/YYYY")
          : null,
        endDate: endDate
          ? moment(endDate, "DD/MM/YYYY").format("DD/MM/YYYY")
          : null,
        managersIds: managers,
      },
      (error, result) => {
        if (error) {
          console.error("Error fetching report:", error);
        } else {
          const updatedResult = result[0].data.map((record) => ({
            ...record,
            GESTOR:
              managers.find((manager) => manager.id === record.GESTOR)
                ?.username || record.GESTOR,
            period: convertDate(record.period),
          }));
          setDataSource(updatedResult);
          setReport(result.report[0]);
          setTotales(result.totales[0]);
          setPagination((prev) => ({
            ...prev,
            current: page,
            total: result[0].totalCount,
          }));
        }
      }
    );
  };

  const handleTableChange = (pagination) => {
    fetchReport(pagination.current, pagination.pageSize);
    setPagination(pagination);
  };

  const handleExport = () => {
    Meteor.call(
      "reportManagement",
      {
        page: 1,
        pageSize: 99999999,
        managerId: selectedManager,
        period: period ? moment(period).toISOString() : null,
        date: date ? moment(date, "DD/MM/YYYY").format("YYYY-MM-DD") : null,
        startDate: startDate
          ? moment(startDate, "DD/MM/YYYY").format("YYYY-MM-DD")
          : null,
        endDate: endDate
          ? moment(endDate, "DD/MM/YYYY").format("YYYY-MM-DD")
          : null,
      },
      (error, result) => {
        if (error) {
          console.error("Error encontrando reportes:", error);
          return;
        }

        // Replace GESTOR ID with the username
        const updatedResult = result[0].data.map((record) => ({
          ...record,
          GESTOR:
            managers.find((manager) => manager.id === record.GESTOR)
              ?.username || record.GESTOR,
          PERIODO: convertDate(record.period),
          LATITUD: record.ubicacion?.latitud,
          LONGITUD: record.ubicacion?.longitud,
        }));

        const ws = XLSX.utils.json_to_sheet(updatedResult);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Report");
        XLSX.writeFile(wb, `Reporte_Gestion-${Date.now()}.xlsx`);
      }
    );
  };

  const getColumns = () => {
    if (dataSource.length === 0) return [];

    // Generate columns dynamically from the keys of the first record
    return Object.keys(dataSource[0])
      .filter(
        (key) =>
          ![
            "_id",
            "ULTIMO_TIPO_COMENTARIO_OT",
            "UNIDAD_OPERATIVA",
            "VALIDACION_REF_PRODUCTO",
            "updatedAt",
          ].includes(key)
      )
      .map((key) => ({
        title: key.toUpperCase(),
        dataIndex: key,
        key: key,
        width: 200,
        fixed: key === "GESTOR",
        elipsis: true,
        render: (text, record) => {
          if (key === "GESTOR") {
            // Replace GESTOR ID with the username
            const manager = managers.find(
              (manager) => manager.id === record[key]
            );
            return <Text>{manager ? manager.username : text}</Text>;
          }
          if (key === "period") return <Text code>{text}</Text>;
          if (key === "fecha_gestion")
            return <Text code>{moment(text).format("DD/MM/YYYY")}</Text>;
          return <Text>{text}</Text>;
        },
      }));
  };

  return (
    <Flex vertical>
      <Affix offsetTop={120} >
        <Flex align="center" justify="space-between" style={{backgroundColor:'whitesmoke', padding:'10px'}}>
          <Select
            placeholder="Gestor"
            style={{ width: 200 }}
            onChange={(value) => setSelectedManager(value)}
            allowClear
          >
            {managers.map((manager) => (
              <Select.Option key={manager.id} value={manager.id}>
                {manager.username}
              </Select.Option>
            ))}
          </Select>
          <DatePicker
            onChange={(date) =>
              setPeriod(JSON.stringify(date).replace(/["']/g, ""))
            }
            format="YYYY-MM-DD"
            placeholder="Periodo asignado"
          />
          <DatePicker
            onChange={(date, dateString) => setDate(dateString)}
            format="DD/MM/YYYY"
            placeholder="Fecha de gestion"
          />
          <DatePicker.RangePicker
            onChange={(_, dateStrings) => {
              setStartDate(dateStrings[0]);
              setEndDate(dateStrings[1]);
            }}
            format="DD/MM/YYYY"
            placeholder={["Inicio", "Final"]}
          />
          <Button
            type="primary"
            onClick={() => fetchReport(1, pagination.pageSize)}
          >
            Buscar Reportes
          </Button>
        </Flex>
      </Affix>
      <Flex align="center" justify="space-between" style={{paddingTop:'32px'}}>
        <Title>Reporte general</Title>
        <Button
          type="primary"
          onClick={handleExport}
          disabled={dataSource.length === 0}
        >
          Exportar a Excel
        </Button>
      </Flex>
      <Flex
        align="end"
        gap={10}
        style={{
          position: "relative",
          right: "-55%",
          top: "40px",
          visibility: totales ? "visible" : "hidden",
        }}
      >
        <Flex>
          <Text italic>
            Total deuda corriente: $
            {formatNumber(totales?.totalDeudaCorriente || 0)}
          </Text>
        </Flex>
        <Flex vertical>
          <Text strong>Indicador</Text>

          <Text italic>
            Normalización: {totales?.indicadorCounts.Normalizacion}
          </Text>
          <Text italic>Contención: {totales?.indicadorCounts.Contencion}</Text>
          <Text italic>Castigados: {totales?.indicadorCounts.Castigado}</Text>
        </Flex>
        <Flex vertical>
          <Text strong>Tipo de servicio</Text>
          <Text italic>Gas {totales?.descripcionTipoProductoCounts.GAS}</Text>
          <Text italic>
            Brilla Surtigas {totales?.descripcionTipoProductoCounts.BRILLA}
          </Text>
          <Text italic>
            Servicios financieros{" "}
            {totales?.descripcionTipoProductoCounts.SERVICIOS_FINANCIEROS}
          </Text>
        </Flex>
      </Flex>
      <Flex vertical gap={32}>
        <MainTable
          dataSource={dataSource}
          handleTableChange={handleTableChange}
          pagination={pagination}
          getColumns={getColumns}
        />
        {managers && report && (
          <ReportTable report={report} managers={managers} />
        )}
      </Flex>
    </Flex>
  );
}
