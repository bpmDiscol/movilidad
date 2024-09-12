import {
  Affix,
  Button,
  DatePicker,
  Flex,
  message,
  Select,
  Typography,
} from "antd";
import React, { useEffect, useState } from "react";
import moment from "moment";
import { Meteor } from "meteor/meteor";
import XLSX from "xlsx";
import convertDate from "../../utils/convertDate";
import "./records.css";
import MainTable from "./mainTable";
import ReportTable from "./reportTable";
import Totals from "./totals";
import mapOutput from "./mapOutput";

const { Text, Title, Link } = Typography;

export default function GetReport({ admin = false }) {
  const [leaders, setLeaders] = useState([]);
  const [selectedLeader, setSelectedLeader] = useState();
  const [dataSource, setDataSource] = useState([]);
  const [managers, setManagers] = useState([]);
  const [allManagers, setAllManagers] = useState([]);
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

  const [downloadReport, setDownloadReport] = useState({
    loading: false,
    percent: 0,
  });

  useEffect(() => {
    if (admin) {
      fetchReport(1, pagination.pageSize);
      Meteor.call("getLeaders", Meteor.userId(), (err, resp) => {
        if (err) message.error(err.reason);
        setLeaders(resp);
      });
      Meteor.call("getAllManagers", Meteor.userId(), (err, resp) => {
        if (err) message.error(err.reason);
        setAllManagers(resp);
      });
    }
    if (!admin) {
      fetchReport(pagination.current, pagination.pageSize);
      Meteor.call("getManagers", Meteor.userId(), (error, result) => {
        if (error) {
          console.error("Error fetching managers:", error);
        } else {
          setManagers(result);
        }
      });
    }
  }, []);

  const fetchReport = (page, pageSize) => {
    Meteor.call(
      "reportManagement",
      {
        page,
        pageSize,
        managerId: selectedManager,
        period: period ? moment(period).toISOString() : null,
        date,
        startDate,
        endDate,
        managerIds: managers,
        leaderId: admin ? selectedLeader : Meteor.userId(),
      },
      async (error, result) => {
        if (error) {
          console.error("Error fetching report:", error);
        } else {
          const updatedResult = await result[0].data.map(async (record) => {
            const { ubicacion, period, fotos, ...update } = record;
            const photoPromises = fotos
              ? fotos.map((photoId) => Meteor.callAsync("getFileLink", photoId))
              : null;
            const FOTOS = photoPromises
              ? await Promise.all(photoPromises)
                  .then((photos) => photos.flat(1).map((p) => p.link))
                  .catch(() => "Error")
              : [];

            return {
              ...update,
              GESTOR:
                managers.find((manager) => manager.id === record.GESTOR)
                  ?.username || record.GESTOR,
              PERIODO: convertDate(record.period),
              LATITUD: record.ubicacion?.latitud,
              LONGITUD: record.ubicacion?.longitud,
              FOTOS,
              FECHA_DE_GESTION: record.fecha_gestion,
              ULTIMA_ACTUALIZACION: record.updatedAt,
            };
          });

          const resolved = await Promise.all(updatedResult)
            .then((photos) => photos)
            .catch(() => "error");

          setDataSource(resolved);
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
  function manageLeaderChange(leaderId) {
    setSelectedLeader(leaderId);
    if (!leaderId) return setManagers([]);
    Meteor.call("getManagers", leaderId, (error, result) => {
      if (error) console.error("Error fetching managers:", error);
      else setManagers(result);
    });
  }

  const handleTableChange = (pagination) => {
    fetchReport(pagination.current, pagination.pageSize);
    setPagination(pagination);
  };

  async function handleExport() {
    const pageSize = 100;
    let page = 1;
    const allData = [];
    let total = Infinity;
    try {
      while (total / pageSize >= page) {
        const partData = await Meteor.callAsync("reportManagement", {
          page,
          pageSize,
          managerId: selectedManager,
          leaderId: admin ? selectedLeader : Meteor.userId(),
          period: period ? moment(period).toISOString() : null,
          date,
          startDate,
          endDate,
          sortField: "CONTRATO",
        }).catch((e) => {
          console.error(e);
          throw new TypeError("Error durante la descarga");
        });
        if (partData[0].totalCount) total = partData[0].totalCount;

        const updatedResult = partData[0].data.map((record) => ({
          ...record,
          GESTOR:
            managers.find((manager) => manager.id === record.GESTOR)
              ?.username ||
            record.GESTOR ||
            "No asignado",
          PERIODO: convertDate(record.period),
          LATITUD: record.ubicacion?.latitud,
          LONGITUD: record.ubicacion?.longitud,
        }));

        allData.push(updatedResult);
        setDownloadReport({ percent: page / total, loading: true });
        page++;
      }
      const { mappedData, formattedHeaders, columns } = mapOutput(
        allData.flat(2)
      );

      const ws = XLSX.utils.json_to_sheet(mappedData, {
        header: formattedHeaders,
      });
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Report");
      XLSX.writeFile(wb, `Reporte_-${Date.now()}.xlsx`);
    } catch (error) {
      message.error(error.message);
    } finally {
      setDownloadReport({ percent: 0, loading: false });
    }
  }

  return (
    <Flex vertical>
      <Affix offsetTop={120}>
        <Flex
          align="center"
          justify="space-between"
          style={{ backgroundColor: "#8178ba", padding: "10px" }}
        >
          {admin && (
            <Select
              placeholder="Lider"
              style={{ width: 200 }}
              onChange={manageLeaderChange}
              allowClear
            >
              {leaders.map((leader) => (
                <Select.Option key={leader.id} value={leader.id}>
                  {leader.username}
                </Select.Option>
              ))}
            </Select>
          )}
          <Select
            placeholder="Gestor"
            style={{ width: 200 }}
            onChange={(value) => setSelectedManager(value)}
            allowClear
            // status="warning"
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
      <Flex
        align="center"
        justify="space-between"
        style={{ paddingTop: "32px" }}
      >
        <Title>Reporte general</Title>
        <Button
          type="primary"
          style={{ width: "10rem" }}
          onClick={handleExport}
          disabled={dataSource.length === 0}
          loading={downloadReport.loading}
          danger={downloadReport.loading}
        >
          {downloadReport.loading
            ? (downloadReport.percent * 10000).toFixed(1) + "% descargado"
            : "Exportar a Excel"}
        </Button>
      </Flex>
      <Totals totales={totales} />
      <Flex vertical gap={32}>
        <MainTable
          dataSource={dataSource}
          handleTableChange={handleTableChange}
          pagination={pagination}
          managers={admin ? allManagers : managers}
          />
        {managers && report && (
          <ReportTable
            report={report}
            managers={admin ? allManagers : managers}
          />
        )}
      </Flex>
    </Flex>
  );
}
