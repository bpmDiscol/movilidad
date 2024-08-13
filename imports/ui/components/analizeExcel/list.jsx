import { Table } from "antd";
import moment from "moment";
import React, { useEffect, useState } from "react";

export default function List() {
  const [dataSource, setDataSource] = useState();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 1,
    total: 0,
  });

  const fetchDocuments = (page, pageSize) => {
    Meteor.call("getDocuments", page, pageSize, (err, resp) => {
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

  useEffect(() => {
    fetchDocuments(pagination.current, pagination.pageSize);
  }, []);

  const columns = [
    {
      title: "Tipo de gestion",
      dataIndex: "managementType",
    },
    {
      title: "Ciente",
      dataIndex: "location",
    },
    {
      title: "Localización",
      dataIndex: "location",
    },
    {
      title: "Periodo",
      dataIndex: "period",
      render: (value) => moment(value).format("DD/MM/YYYY"),
    },
    {
      title: "Fecha de carga",
      dataIndex: "createdAt",
      render: (value) => moment(value).format("DD/MM/YYYY"),
    },
  ];

  const handleTableChange = (pagination) => {
    fetchDocuments(pagination.current, pagination.pageSize);
    setPagination(pagination);
  };

  return (
    <div>
      <Table
        columns={columns}
        pagination={{ ...pagination, position: ["topLeft"] }}
        dataSource={dataSource}
        onChange={handleTableChange}
        rowKey={(record) => record._id}
      />
    </div>
  );
}
