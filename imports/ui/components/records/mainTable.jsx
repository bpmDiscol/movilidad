import "./records.css";
import { Table, Typography } from "antd";
const { Text, Title } = Typography;
import React from "react";

export default function MainTable({
  dataSource,
  pagination,
  handleTableChange,
  getColumns,
}) {
  return (
    <>
      <Table
        bordered
        columns={getColumns()}
        dataSource={dataSource}
        rowKey={(record) => record._id}
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
          y: "50dvh",
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
