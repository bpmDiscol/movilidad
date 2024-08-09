import {
  Button,
  DatePicker,
  Input,
  message,
  Select,
  Space,
  Table,
  Typography,
} from "antd";
import React, { useEffect, useRef, useState } from "react";
import { SearchOutlined } from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import convertDate from "../../utils/convertDate";
const { Text } = Typography;

export default function Records() {
  const [dataSource, setDataSource] = useState([]);
  const [managers, setManagers] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  });
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);
  const [searchKeys, setSearchKeys] = useState({});
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedManager, setSelectedManager] = useState(null);

  const fetchRecords = (page, pageSize, search) => {
    Meteor.call("getRecords", page, pageSize, search, (err, resp) => {
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
    });
  };

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);

    const searchTerm = selectedKeys[0];

    setSearchKeys({ ...searchKeys, ...{ [dataIndex]: searchTerm } });
    fetchRecords(1, pagination.pageSize, {
      ...searchKeys,
      ...{ [dataIndex]: searchTerm },
    });
    setPagination((prev) => ({
      ...prev,
      current: 1,
    }));
  };

  const handleTableChange = (pagination) => {
    fetchRecords(pagination.current, pagination.pageSize, searchKeys);
    setPagination(pagination);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
    setSearchedColumn("");
    fetchRecords(1, pagination.pageSize);
    setPagination((prev) => ({
      ...prev,
      current: 1,
    }));
  };
  const handleDateChange = (date, dateString) => {
    const search = date
      ? {
          ...searchKeys,
          ...{ period: JSON.stringify(date).replace(/["']/g, "") },
        }
      : {};
    setSearchKeys(search);
    fetchRecords(1, pagination.pageSize, search);
    setPagination((prev) => ({
      ...prev,
      current: 1,
    }));
  };

  const handleManagerChange = (value, record) => {
    Meteor.call(
      "updateRecordManager",
      record.NUMERO_DE_LA_ORDEN,
      value,
      (error) => {
        if (error) {
          console.error("Error updating manager:", error);
        } else {
          const newDataSource = dataSource.map((item) => {
            if (item._id === record._id) {
              return { ...item, GESTOR: value };
            }
            return item;
          });
          setDataSource(newDataSource);
        }
      }
    );
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

    // Una vez que todas las asignaciones han sido realizadas, refresca los datos
    Promise.all(updates)
      .then(() => {
        message.success("Gestores asignados con éxito.");
        fetchRecords(pagination.current, pagination.pageSize, searchKeys);
        setSelectedRowKeys([]); // Limpia la selección
      })
      .catch((error) => {
        console.error("Error updating manager:", error);
        message.error("Error al asignar el gestor.");
      });
  };

  const getColumnSearchProps = (dataIndex) => {
    return {
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
        close,
      }) => {
        return (
          <div
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
                onClick={() => clearFilters && handleReset(clearFilters)}
                size="small"
                style={{
                  width: 90,
                }}
              >
                Reset
              </Button>

              {/* <Button
                type="link"
                size="small"
                onClick={() => {
                  confirm({
                    closeDropdown: false,
                  });
                  setSearchText(selectedKeys[0]);
                  setSearchedColumn(dataIndex);
                }}
              >
                Resaltar
              </Button> */}
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
          </div>
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
          .toString()
          .toLowerCase()
          .includes(value.toLowerCase()),
      onFilterDropdownOpenChange: (visible) => {
        if (visible) {
          setTimeout(() => searchInput.current?.select(), 100);
        }
      },
      render: (text) =>
        searchedColumn === dataIndex ? (
          <Highlighter
            highlightStyle={{
              backgroundColor: "#ffc069",
              padding: 0,
            }}
            searchWords={[searchText]}
            autoEscape
            textToHighlight={text ? text.toString() : ""}
          />
        ) : (
          text
        ),
    };
  };

  const columns = [
    {
      title: "Gestor",
      dataIndex: "GESTOR",
      fixed: "left",
      render: (text, record) => (
        <Select
          value={record.GESTOR}
          onChange={(value) => handleManagerChange(value, record)}
          style={{ width: 150 }}
          allowClear
        >
          {managers.map((manager) => (
            <Select.Option key={manager.id} value={manager._id}>
              {manager.username}
            </Select.Option>
          ))}
        </Select>
      ),
      width: 180,
    },
    {
      title: "Número de Orden",
      dataIndex: "NUMERO_DE_LA_ORDEN",
      width: 180,
      ...getColumnSearchProps("NUMERO_DE_LA_ORDEN"),
    },
    {
      title: "Contrato",
      dataIndex: "CONTRATO",
      width: 180,
      ...getColumnSearchProps("CONTRATO"),
    },
    {
      title: "Producto",
      dataIndex: "PRODUCTO",
      width: 180,
      ...getColumnSearchProps("PRODUCTO"),
    },
    {
      title: "Barrio",
      dataIndex: "DESCRIPCION_BARRIO",
      width: 180,
      ...getColumnSearchProps("DESCRIPCION_BARRIO"),
    },
    {
      title: "Dirección",
      dataIndex: "DIRECCION_PREDIO",
      width: 180,
      ...getColumnSearchProps("DIRECCION_PREDIO"),
    },
    {
      title: "Periodo",
      dataIndex: "period",
      width: 180,
      render: (date) => convertDate(date),
    },
    {
      title: "Ciclo",
      dataIndex: "DESCRIPCION_CICLO",
      width: 180,
      ...getColumnSearchProps("DESCRIPCION_CICLO"),
    },
    {
      title: "Indicador Operativo",
      dataIndex: "NOMBRE_UNIDAD_OPERATIVA",
      width: 180,
      ...getColumnSearchProps("NOMBRE_UNIDAD_OPERATIVA"),
    },
    {
      title: "Estado financiero",
      dataIndex: "ESTADO_FINANCIERO",
      width: 180,
      ...getColumnSearchProps("ESTADO_FINANCIERO"),
    },
    {
      title: "Plan de acuerdo de pago",
      dataIndex: "PLAN_DE_ACUERDO_DE_PAGO",
      width: 180,
      ...getColumnSearchProps("PLAN_DE_ACUERDO_DE_PAGO"),
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
  }, [pagination.pageSize]);

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <DatePicker
          onChange={handleDateChange}
          format="YYYY-MM-DD"
          placeholder="Fecha"
        />
        {selectedRowKeys.length > 0 && (
          <>
            <Select
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
            <Text keyboard type="danger" >{`${total} Resultados encontrados `}</Text>
          ),
          position: ["topLeft"],
        }}
        onChange={handleTableChange}
        scroll={{
          x: 100,
          y: "50dvh",
        }}
        style={{ width: "100vw", overflowX: "auto" }}
      />
      ;
    </div>
  );
}
