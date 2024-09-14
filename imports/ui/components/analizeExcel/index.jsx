import React, { useEffect, useState } from "react";
import { Random } from "meteor/random";

import {
  Button,
  DatePicker,
  Flex,
  Form,
  Input,
  message,
  Progress,
  Spin,
  Upload,
} from "antd";
import { InboxOutlined } from "@ant-design/icons";

import * as XLSX from "xlsx";
import normalizedRecords from "./normalizeRecords";
import List from "./list";
import renameKeys from "./renameKeys";
import moment from "moment";

const { Dragger } = Upload;

export default function AnalizeExcel() {
  const [form] = Form.useForm();
  const [file, setFile] = useState();
  const [progressLevel, setProgressLevel] = useState({ total: 0, current: 0 });
  const [progressStatus, setProgressStatus] = useState("active");
  const [totalUpdates, setTotalUpdates] = useState(0);
  const [displayedProgress, setDisplayedProgress] = useState(0);
  const [reloading, setReloading] = useState(false);
  const [reloadList, setReloadList] = useState(0);
  const [reading, setReading] = useState(false);

  function uploadRecords(file) {
    setReading(true);
    setProgressLevel({ total: 0, current: 0 });
    setTotalUpdates(0);
    setDisplayedProgress(0);
    const { chargeFile, ...fields } = form.getFieldsValue();
    const { period, ...extra } = fields;
    const extrafields = {
      ...extra,
      period: JSON.stringify(period).replace(/["']/g, ""),
    };

    new Promise(() => {
      const reader = new FileReader();

      reader.readAsArrayBuffer(file);
      reader.onload = () => {
        const data = reader.result;
        const wb = XLSX.read(data);

        const ws = wb.Sheets[wb.SheetNames[0]];
        const jsonSheet = XLSX.utils.sheet_to_json(ws);

        // if (!checkKeys(jsonSheet[0])) {
        //   setReading(false);
        //   return message.error("formato de archivo no valido");
        // }

        const proyect = Meteor.user({ profile: 1 }).profile.proyect;
        let successfulUpdates = 0;
        jsonSheet.forEach((record_) => {
          const normalized_record = normalizedRecords(record_);
          const record = renameKeys(normalized_record);

          let totalDeudaCorriente = 0;
          if (record["ESTADO_FINANCIERO"] === "C") {
            totalDeudaCorriente = record["DEUDA_CASTIGADA_ASIGNADA"] || 0;
          } else {
            totalDeudaCorriente =
              parseFloat(record["CORRIENTE_NO_VENCIDA_ASIGNADA"] || 0) +
              parseFloat(record["CORRIENTE_VENCIDA_ASIGNADA"] || 0);
          }

          // Cálculo del campo INDICADOR
          // const diasDeudaAsignacion = record["DIAS_DEUDA_ASIGNACION"] || 0;
          // let indicador = "Normalizacion"; // valor por defecto

          // if (parseInt(diasDeudaAsignacion) + 30 <= 90) {
          //   indicador = "Contencion";
          // } else if (parseInt(diasDeudaAsignacion) === 0) {
          //   indicador = "Castigado";
          // }

          const normalizedRecord = {
            ...record,
            ...extrafields,
            TOTAL_DEUDA_CORRIENTE: parseFloat(totalDeudaCorriente),
            // INDICADOR: indicador,
            DESCRIPCION_TIPO_PRODUCTO: record["DESCRIPCION_TIPO_PRODUCTO"]
              ? record["DESCRIPCION_TIPO_PRODUCTO"].toUpperCase()
              : "",
            status: "pending",
            proyect,
            NUMERO_DE_LA_ORDEN:
              record.NUMERO_DE_LA_ORDEN ||
              "S-" + Random.id(8) + "-" + moment().format("DD-MM-YYYY"),
          };
          setReading(false);
          Meteor.call(
            "createRecord",
            normalizedRecord,
            Meteor.userId(),
            (err, result) => {
              setProgressLevel((prev) => ({
                total: jsonSheet.length,
                current: prev.current + 1,
              }));
              if (!err) {
                successfulUpdates++;
                setProgressStatus("success");
              } else {
                message.warning(
                  "No fue posible cargar Orden No:" + record.NUMERO_DE_LA_ORDEN
                );
                setProgressStatus("exception");
              }
              setTotalUpdates(successfulUpdates);
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
      setProgressLevel({ total: 0, current: 0 });
      setTotalUpdates(0);
      setProgressStatus("active");
      return false;
    },
  };

  useEffect(() => {
    if (progressLevel && progressLevel.total && progressLevel.current) {
      const targetProgress =
        (progressLevel.current / progressLevel.total) * 100;
      const increment = (targetProgress - displayedProgress) / 1;
      const interval = Meteor.setInterval(() => {
        setDisplayedProgress((prev) => {
          const nextValue = prev + increment;
          if (nextValue >= targetProgress) {
            Meteor.clearInterval(interval);
            return targetProgress;
          }
          return nextValue;
        });
      }, 10); // Adjust this value for smoother/slower animation

      function update() {
        addDocument(totalUpdates);
        setReloading(false);
        setReloadList(Math.random());
      }

      if ((progressLevel.current / progressLevel.total) * 100 == 100) {
        setReloading(true);
        Meteor.setTimeout(update, 1000);
      }

      return () => clearInterval(interval);
    }
  }, [progressLevel]);

  async function addDocument(updates) {
    const { chargeFile, ...fields } = form.getFieldsValue();
    const { period, ...extra } = fields;
    const extrafields = {
      ...extra,
      period: JSON.stringify(period).replace(/["']/g, ""),
    };
    await Meteor.callAsync("createDocument", {
      ...extrafields,
      updates,
      leaderId: Meteor.userId(),
    }).catch((error) => {
      if (error.error === "document-exists") {
        message.warning(error.reason);
      }
    });
  }

  return (
    <Form
      form={form}
      requiredMark={false}
      wrapperCol={{
        span: 32,
      }}
      onFinish={() => {
        uploadRecords(file);
      }}
    >
      <Flex
        gap={32}
        align="center"
        justify="center"
        style={{ width: "100%", height: "70dvh" }}
      >
        <Spin fullscreen spinning={reloading} />
        <Flex vertical>
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
              format={"DD/MM/YYYY"}
            />
          </Form.Item>
          <Form.Item>
            <Button htmlType="submit" block type="primary">
              Enviar
            </Button>
          </Form.Item>
        </Flex>
        <Flex vertical>
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
              {progressLevel.total ? (
                <>
                  <Progress
                    percent={displayedProgress}
                    status={progressStatus}
                  />
                  {progressStatus === "success" ? (
                    <>
                      <p>Se realizaron {totalUpdates} actualizaciones</p>
                    </>
                  ) : (
                    <p>Error en la carga</p>
                  )}
                </>
              ) : null}
            </Dragger>
          </Form.Item>
        </Flex>
      </Flex>
      <List key={reloadList} />
      <Spin fullscreen tip="Analizando archivo" spinning={reading} />
    </Form>
  );
}
