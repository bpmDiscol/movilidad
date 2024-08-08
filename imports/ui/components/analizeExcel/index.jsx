import React, { useState } from "react";
import {
  Button,
  DatePicker,
  Flex,
  Form,
  Input,
  message,
  Progress,
  Upload,
} from "antd";
import { InboxOutlined } from "@ant-design/icons";

import * as XLSX from "xlsx";
import checkKeys from "./checkKkeys";
import normalizeKey from "./normalizeKeys";
import normalizedRecords from "./normalizeRecords";

const { Dragger } = Upload;

export default function AnalizeExcel() {
  const [form] = Form.useForm();
  const [file, setFile] = useState();
  const [progressLevel, setProgressLevel] = useState();
  const [progressStatus, setProgressStatus] = useState("active");

  function uploadRecords(file) {
    const { chargeFile, ...fields } = form.getFieldsValue();
    const { period, ...extra } = fields;
    const extrafields = { ...extra, period: JSON.stringify(period).replace(/["']/g, '') };

    new Promise(() => {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = () => {
        const data = reader.result;
        const wb = XLSX.read(data);

        const ws = wb.Sheets[wb.SheetNames[0]];
        const jsonSheet = XLSX.utils.sheet_to_json(ws);

        if (!checkKeys(jsonSheet[0]))
          return message.error("formato de archivo no valido");

        jsonSheet.forEach((record) => {
          const normalizedRecord = normalizedRecords(record);
          Meteor.call(
            "createRecord",
            { ...normalizedRecord, ...extrafields },
            (err) => {
              setProgressLevel({
                total: jsonSheet.length,
                current: progressLevel ? progressLevel.current++ : 0,
              });
              setProgressStatus(err ? "exception" : "success");
            }
          );
        });
      };
    });
  }

  const props = {
    showUploadList: false,
    name: "file",
    multiple: false,
    async beforeUpload(file) {
      const isExcel =
        file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

      if (!isExcel) {
        message.error(`${file.name} No es un archivo de Excel`);
        return false;
      }
      setFile(file);
      setProgressLevel();
      setProgressStatus("active");
      return false;
    },
  };
  return (
    <Flex style={{ width: "20rem" }}>
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        wrapperCol={{
          span: 32,
        }}
        onFinish={() => {
          uploadRecords(file);
        }}
      >
        <Form.Item
          name={"managementType"}
          rules={[
            {
              required: true,
              message: "Debe ingresar un tipo de gestión!",
            },
          ]}
        >
          <Input placeholder="Tipo de gestión" />
        </Form.Item>
        <Form.Item
          name={"client"}
          rules={[
            {
              required: true,
              message: "Debe ingresar cliente!",
            },
          ]}
        >
          <Input placeholder="Cliente" />
        </Form.Item>
        <Form.Item
          name={"location"}
          rules={[
            {
              required: true,
              message: "Debe ingresar una localización!",
            },
          ]}
        >
          <Input placeholder="Localización" />
        </Form.Item>
        <Form.Item
          name={"period"}
          rules={[
            {
              required: true,
              message: "Debe ingresar un periodo!",
            },
          ]}
        >
          <DatePicker
            placeholder="Selecciona un periodo"
            style={{ width: "20rem" }}
            showNow={false}
            format={"YYYY/MM/DD"}
          />
        </Form.Item>
        <Form.Item
          name={"chargeFile"}
          rules={[
            {
              required: true,
              message: "Debe ingresar un archivo!",
            },
          ]}
        >
          <Dragger {...props}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              Haz click o arrastra un archivo a esta area
            </p>
            <p className="ant-upload-hint">{file?.name}</p>
            {progressLevel ? (
              <Progress
                percent={(progressLevel.total / progressLevel.current) * 100}
                status={progressStatus}
              />
            ) : null}
          </Dragger>
        </Form.Item>
        <Form.Item>
          <Button htmlType="submit" block type="primary">
            Enviar
          </Button>
        </Form.Item>
      </Form>
    </Flex>
  );
}
