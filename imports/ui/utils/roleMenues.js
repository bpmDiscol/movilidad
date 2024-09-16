import React from "react";
import {
  CloudUploadOutlined,
  UserOutlined,
  SnippetsOutlined,
  UserAddOutlined,
  UsergroupAddOutlined,
} from "@ant-design/icons";
import NewUser from "../components/newUser";
import AssignManagers from "../components/assignManagers";
import Records from "../components/records";
import AnalizeExcel from "../components/analizeExcel";
import GetReport from "../components/records/getReport";

function download(url) {
  const newTab = document.createElement("a");
  newTab.href = url;
  newTab.target = "_blank";
  // newTab.download = true;
  newTab.click();
}

export default function getMenu(role, setView) {
  const roles = {
    admin: [
      {
        key: "10",
        icon: <UserAddOutlined />,
        label: "Crear usuario",
        onClick: () => setView(<NewUser />),
      },
      {
        key: "11",
        icon: <UsergroupAddOutlined />,
        label: "Gestores",
        onClick: () => setView(<AssignManagers />),
      },
      {
        key: "12",
        icon: <SnippetsOutlined />,
        label: "Asignaciones",
        onClick: () => setView(<GetReport admin />),
      },
    ],
    management: [
      {
        key: "13",
        icon: <SnippetsOutlined />,
        label: "Aplicativo",
        onClick: () =>
          download(
            Meteor.user({ profile: 1 }).profile.project == "sierra"
              ? "/sierra.apk"
              : "/movilidad.apk"
          ),
      },
    ],
    leader: [
      {
        key: "10",
        icon: <CloudUploadOutlined />,
        label: "Cargar ",
        onClick: () => setView(<AnalizeExcel />),
      },
      {
        key: "11",
        icon: <UserOutlined />,
        label: "Asignar gestores",
        onClick: () => setView(<Records />),
      },
      {
        key: "12",
        icon: <SnippetsOutlined />,
        label: "Reportes",
        onClick: () => setView(<GetReport />),
      },
    ],
  };

  return roles[role];
}
