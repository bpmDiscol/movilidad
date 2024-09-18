import {
  Alert,
  Button,
  DatePicker,
  Flex,
  Input,
  message,
  Modal,
  Select,
  Space,
  Table,
  Typography,
} from "antd";
import React, { useEffect, useRef, useState } from "react";
import {
  SearchOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
} from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import "./records.css";
import formatIfNumber from "../../utils/formatIfNumber";
import moment from "moment";
import ExcelAssignButton from "../excelAssignButton";

const { Text } = Typography;
const serviceOptions = [
  "Cartera",
  "Suspensión Sencilla",
  "Suspensión Drastica",
  "Reconexiones",
];

export default function Records() {
  const [reload, setReload] = useState(0);
  const [dataSource, setDataSource] = useState([]);
  const [managers, setManagers] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    total: 0,
  });
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);
  const [searchKeys, setSearchKeys] = useState({});
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedManager, setSelectedManager] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [managerAlert, setManagerAlert] = useState({
    open: false,
    recordId: 0,
    managerId: 0,
  });
  const project = Meteor.user().profile.project;

  const voidSorter = { sortField: null, sortOrder: 1 };
  const fetchRecords = (page, pageSize, search, sort = voidSorter) => {
    Meteor.call(
      "getRecords",
      page,
      pageSize,
      { ...search, leaderId: Meteor.userId() },
      sort,
      (err, resp) => {
        if (err) {
          console.error(err);
          return;
        }
        setDataSource(resp.data);
        setPagination((prev) => ({
          ...prev,
          current: page,
          total: resp.total,
        }));
      }
    );
  };

  const handleSearch = (
    selectedKeys,
    confirm,
    dataIndex,
    sort = voidSorter
  ) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);

    const searchTerm = selectedKeys[0];
    const search = { ...searchKeys, ...{ [dataIndex]: searchTerm } };
    setSearchKeys(search);
    fetchRecords(1, pagination.pageSize, search, sort);
    setPagination((prev) => ({
      ...prev,
      current: 1,
    }));
  };

  const handleTableChange = (pagination) => {
    fetchRecords(pagination.current, pagination.pageSize, searchKeys);
    setPagination(pagination);
  };

  const handleReset = (clearFilters, dataIndex, confirm) => {
    const search = delete searchKeys[dataIndex];
    clearFilters();
    confirm();
    setSearchText("");
    setSearchedColumn("");
    setSearchKeys(search);
    fetchRecords(1, pagination.pageSize, search);
    setPagination((prev) => ({
      ...prev,
      current: 1,
    }));
  };
  const handleDateChange = (date) => {
    const search = date
      ? {
          ...searchKeys,
          period: moment(date.toString(), "ddd, DD MMM YYYY HH:mm:ss [GMT]")
            .startOf("day")
            .toISOString(),
        }
      : { ...searchKeys, period: "" };
    setSearchKeys(search);
    fetchRecords(1, pagination.pageSize, search);
    setPagination((prev) => ({
      ...prev,
      current: 1,
    }));
  };

  const handleManagerChange = (recordId, managerId) => {
    Meteor.call("updateRecordManager", recordId, managerId, (error) => {
      if (error) message.error("Error asignando gestor");
      fetchRecords(pagination.current, pagination.pageSize, searchKeys);
    });
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedRowKeys) => {
      setSelectedRowKeys(selectedRowKeys);
    },
  };
  const handleBatchAssign = () => {
    if (!selectedManager) {
      message.error("Seleccione un gestor antes de asignar.");
      return;
    }
    const updates = selectedRowKeys.map(
      (recordId) =>
        new Promise((resolve, reject) => {
          Meteor.call(
            "updateRecordManager",
            recordId,
            selectedManager,
            Meteor.userId(),
            (error) => {
              if (error) {
                reject(error);
              } else {
                resolve();
              }
            }
          );
        })
    );
    Promise.all(updates)
      .then(() => {
        message.success("Gestores asignados con éxito.");
        fetchRecords(pagination.current, pagination.pageSize, searchKeys);
        setSelectedRowKeys([]);
      })
      .catch((error) => {
        console.error("Error updating manager:", error);
        message.error("Error al asignar el gestor.");
      });
  };

  function handleManagerChangeAlert(value, record) {
    if (!record.GESTOR)
      return handleManagerChange(record.NUMERO_DE_LA_ORDEN, value);
    setManagerAlert({
      open: true,
      recordId: record.NUMERO_DE_LA_ORDEN,
      managerId: value,
    });
  }

  const excludedFields = ["NUMERO_DE_LA_ORDEN", "CONTRATO", "PRODUCTO"];

  const getColumnSearchProps = (dataIndex) => {
    return {
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
        close,
      }) => {
        return dataIndex === "GESTOR" ? (
          <div
            style={{
              padding: 8,
            }}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <Select
              placeholder="Selecciona un gestor"
              style={{ width: 200 }}
              onChange={(value) => {
                handleSearch([value] || [""], confirm, "GESTOR");
              }}
              allowClear
            >
              {[...managers, { id: 0, username: "SIN ASIGNAR" }].map(
                (manager) => (
                  <Select.Option key={manager.id} value={manager.id}>
                    {manager.username}
                  </Select.Option>
                )
              )}
            </Select>
          </div>
        ) : (
          <Flex
            vertical
            gap={5}
            style={{
              padding: 8,
            }}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <Input
              ref={searchInput}
              placeholder={`Buscar en: ${dataIndex}`}
              value={selectedKeys[0]}
              onChange={(e) =>
                setSelectedKeys(e.target.value ? [e.target.value] : [])
              }
              onPressEnter={() =>
                handleSearch(selectedKeys, confirm, dataIndex)
              }
              style={{
                marginBottom: 8,
                display: "block",
              }}
            />
            <Space style={{ justifyContent: "space-between" }}>
              <Button
                type="primary"
                onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                icon={<SearchOutlined />}
                size="small"
                style={{
                  width: 90,
                }}
              >
                Busca
              </Button>
              <Button
                onClick={() =>
                  clearFilters && handleReset(clearFilters, dataIndex, confirm)
                }
                size="small"
                style={{
                  width: 90,
                }}
              >
                Reset
              </Button>
              <Button
                type="link"
                size="small"
                onClick={() => {
                  close();
                }}
              >
                Cerrar
              </Button>
            </Space>
            <Flex vertical align="start">
              <Button
                icon={<SortAscendingOutlined style={{ fontSize: 20 }} />}
                type="link"
                onClick={() =>
                  handleSearch(selectedKeys, confirm, dataIndex, {
                    sortField: dataIndex,
                    sortOrder: 1,
                  })
                }
              >
                Orden ascendente
              </Button>
              <Button
                icon={<SortDescendingOutlined style={{ fontSize: 20 }} />}
                type="link"
                onClick={() =>
                  handleSearch(selectedKeys, confirm, dataIndex, {
                    sortField: dataIndex,
                    sortOrder: -1,
                  })
                }
              >
                Orden descendente
              </Button>
            </Flex>
          </Flex>
        );
      },
      filterIcon: (filtered) => (
        <SearchOutlined
          style={{
            color: filtered ? "#1677ff" : undefined,
          }}
        />
      ),
      onFilter: (value, record) =>
        record[dataIndex]
          ? record[dataIndex]
              .toString()
              .toLowerCase()
              .includes(value.toLowerCase())
          : false,
      onFilterDropdownOpenChange: (visible) => {
        if (visible) {
          setTimeout(() => searchInput.current?.select(), 100);
        }
      },
      render: (text, record) =>
        dataIndex == "GESTOR" ? (
          <Select
            value={record.GESTOR}
            onChange={(value) => handleManagerChangeAlert(value, record)}
            style={{ width: 150 }}
            allowClear
          >
            {managers.map((manager) => (
              <Select.Option key={manager.id} value={manager._id}>
                {manager.username}
              </Select.Option>
            ))}
          </Select>
        ) : searchedColumn === dataIndex ? (
          <Highlighter
            highlightStyle={{
              backgroundColor: "#ffc069",
              padding: 0,
            }}
            searchWords={[searchText]}
            autoEscape
            textToHighlight={
              excludedFields.includes(dataIndex) ? text : formatIfNumber(text)
            }
          />
        ) : excludedFields.includes(dataIndex) ? (
          text
        ) : (
          formatIfNumber(text)
        ),
    };
  };

  const columns = [
    {
      title: "Gestor",
      dataIndex: "GESTOR",
      fixed: "left",
      width: 180,
      ...getColumnSearchProps("GESTOR"),
    },
    {
      title: "Orden",
      dataIndex: "NUMERO_DE_LA_ORDEN",
      width: 180,
      ...getColumnSearchProps("NUMERO_DE_LA_ORDEN"),
    },
    {
      title: "Producto",
      dataIndex: "PRODUCTO",
      width: 180,
      ...getColumnSearchProps("PRODUCTO"),
    },
    {
      title: "Contrato",
      dataIndex: "CONTRATO",
      width: 180,
      ...getColumnSearchProps("CONTRATO"),
    },
    {
      title: "Tipo de servicio",
      dataIndex: "DESCRIPCION_TIPO_PRODUCTO",
      width: 180,
      ...getColumnSearchProps("DESCRIPCION_TIPO_PRODUCTO"),
    },
    {
      title: "Categoría",
      dataIndex: "DESCRIPCION_CATEGORIA",
      width: 180,
      ...getColumnSearchProps("DESCRIPCION_CATEGORIA"),
    },
    {
      title: "Estrato",
      dataIndex: "DESCRIPCION_SUBCATEGORIA",
      width: 180,
      ...getColumnSearchProps("DESCRIPCION_SUBCATEGORIA"),
    },
    {
      title: "Refinanciaciones/año",
      dataIndex: "NUMERO_REFINANCIACIONES_ULTIMO_ANO",
      width: 180,
      ...getColumnSearchProps("NUMERO_REFINANCIACIONES_ULTIMO_ANO"),
    },
    {
      title: "Estado financiero",
      dataIndex: "ESTADO_FINANCIERO",
      width: 180,
      ...getColumnSearchProps("ESTADO_FINANCIERO"),
    },
    {
      title: "Lectura",
      dataIndex: "ULTIMA_LECTURA_TOMADA",
      width: 180,
      ...getColumnSearchProps("ULTIMA_LECTURA_TOMADA"),
    },
    {
      title: "Medidor",
      dataIndex: "ELEMENTO_MEDICION",
      width: 180,
      ...getColumnSearchProps("ELEMENTO_MEDICION"),
    },
    {
      title: "Barrio",
      dataIndex: "DESCRIPCION_BARRIO",
      width: 180,
      ...getColumnSearchProps("DESCRIPCION_BARRIO"),
    },
    {
      title: "Ciclo",
      dataIndex: "DESCRIPCION_CICLO",
      width: 180,
      ...getColumnSearchProps("DESCRIPCION_CICLO"),
    },
    {
      title: "Identificación",
      dataIndex: "IDENTIFICACION",
      width: 180,
      ...getColumnSearchProps("IDENTIFICACION"),
    },
    {
      title: "Titular del servicio",
      dataIndex: "NOMBRE_CLIENTE",
      width: 180,
      ...getColumnSearchProps("NOMBRE_CLIENTE"),
    },
    {
      title: "Dirección",
      dataIndex: "DIRECCION_PREDIO",
      width: 180,
      ...getColumnSearchProps("DIRECCION_PREDIO"),
    },
    {
      title: "Días deuda",
      dataIndex: "DIAS_DEUDA_ASIGNACION",
      width: 180,
      ...getColumnSearchProps("DIAS_DEUDA_ASIGNACION"),
    },
    {
      title: "Saldo no vencido",
      dataIndex: "DIAS_DEUDA_ASIGNACION",
      width: 180,
      ...getColumnSearchProps("DIAS_DEUDA_ASIGNACION"),
    },
    {
      title: "Saldo vencido",
      dataIndex: "CORRIENTE_VENCIDA_ASIGNADA",
      width: 180,
      ...getColumnSearchProps("CORRIENTE_VENCIDA_ASIGNADA"),
    },
    {
      title: "Refi. Histórico",
      dataIndex: "REFINANCIACIONES_PRODUCTO",
      width: 180,
      ...getColumnSearchProps("REFINANCIACIONES_PRODUCTO"),
    },
    {
      title: "Edad mora actual",
      dataIndex: "EDAD_MORA_ACTUAL",
      width: 180,
      ...getColumnSearchProps("EDAD_MORA_ACTUAL"),
    },
    {
      title: "Total deuda corriente",
      dataIndex: "TOTAL_DEUDA_CORRIENTE",
      width: 180,
      ...getColumnSearchProps("TOTAL_DEUDA_CORRIENTE"),
    },
    {
      title: "Indicador",
      dataIndex: "INDICADOR",
      width: 180,
      ...getColumnSearchProps("INDICADOR"),
    },
    {
      title: "Periodo",
      dataIndex: "period",
      width: 180,
      render: (text) => moment(text).format("DD/MM/YYYY"),
    },
    {
      title: "Deuda total asignada",
      dataIndex: "DEUDA_TOTAL_ASIGNADA",
      width: 180,
      ...getColumnSearchProps("DEUDA_TOTAL_ASIGNADA"),
    },
    {
      title: "Comentario",
      dataIndex: "COMENTARIO",
      width: 180,
      ...getColumnSearchProps("COMENTARIO"),
    },
  ];

  useEffect(() => {
    Meteor.call("getManagers", Meteor.userId(), (error, result) => {
      if (error) {
        console.error("Error fetching managers:", error);
      } else {
        setManagers(result);
      }
    });
    fetchRecords(pagination.current, pagination.pageSize);
  }, [pagination.pageSize, reload]);

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <DatePicker
          onChange={handleDateChange}
          format="DD/MM/YYYY"
          placeholder="Periodo"
          onEmptied={handleDateChange}
        />
        <ExcelAssignButton managers={managers} setReload={setReload} />
        {selectedRowKeys.length > 0 && (
          <>
            <Select
              title="Asignacion en bloque"
              placeholder="Selecciona un gestor"
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

            {project == "sierra" && <Select
              title="Asignacion tipo de servicio"
              placeholder="Tipo de servicio"
              style={{ width: 200 }}
              onChange={(value) => setSelectedService(value)}
              allowClear
            >
              {serviceOptions.map((service) => (
                <Select.Option key={service} value={service.toLowerCase()}>
                  {service}
                </Select.Option>
              ))}
            </Select>}
            <Button type="primary" onClick={handleBatchAssign}>
              Asignar gestores
            </Button>
          </>
        )}
      </Space>
      <Table
        bordered
        rowSelection={rowSelection}
        columns={columns}
        dataSource={dataSource}
        rowKey={(record) => record["NUMERO_DE_LA_ORDEN"]}
        size="small"
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
          x: 100,
        }}
        style={{ width: "100vw", overflowX: "auto" }}
        rowClassName={(_, index) =>
          index % 2 === 0 ? "ant-table-row-alternate" : "ant-table-row-base"
        }
        className="ant-table"
      />
      <Modal
        open={managerAlert.open}
        onCancel={() => setManagerAlert((prev) => ({ ...prev, open: false }))}
        onClose={() => setManagerAlert((prev) => ({ ...prev, open: false }))}
        onOk={() => {
          handleManagerChange(managerAlert.recordId, managerAlert.managerId);
          setManagerAlert((prev) => ({ ...prev, open: false }));
        }}
        closable={false}
      >
        <Alert
          message="Advertencia"
          description={
            "Esta accion cambiará el gestor asignado. ¿Estas seguro de continuar? "
          }
          type="warning"
          showIcon
        />
      </Modal>
    </div>
  );
}
