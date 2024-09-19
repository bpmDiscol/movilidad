import React, { useRef, useState } from "react";
import { UserOutlined, LogoutOutlined } from "@ant-design/icons";
import { Flex, Layout, Menu, theme } from "antd";
import useRole from "./hooks/useRole";
import roleMenu from "./utils/roleMenues";
import Vacio from "./vacio";
const { Header, Sider, Content } = Layout;
const Main = () => {
  const [view, setView] = useState(<Vacio />);
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const role = useRole();

  return (
    <Layout style={{ height: "100dvh" }}>
      <Sider trigger={null}>
        <Flex
          vertical
          align="center"
          justify="center"
          style={{ padding: 10, color: "Highlight" }}
        >
          <img src="/logo-mini.png" style={{ width: "120px" }} />
          Movilidad
        </Flex>
        <Menu
          theme="dark"
          mode="inline"
          items={[
            {
              key: "1",
              icon: <UserOutlined />,
              label: "Mis opciones",
              type: "group",
              children: roleMenu(role.userRole, setView),
            },
            {
              key: "2",
              type: "divider",
            },
            {
              key: "3",
              label: "Cuenta",
              type: "group",
              children: [
                {
                  key: "1",
                  icon: <LogoutOutlined />,
                  label: "Cerrar sesión",
                  onClick: () => Meteor.logout(),
                },
              ],
            },
          ]}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: 0,
            background: colorBgContainer,
          }}
        >
          <Flex gap={10} style={{ paddingRight: "2%" }} justify="end">
            {Meteor.user().username.toUpperCase()}
            <UserOutlined />
          </Flex>
        </Header>
        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          {view && view}
        </Content>
      </Layout>
    </Layout>
  );
};
export default Main;
