import React from "react";
import { Form, Input, Button, Select, message, Typography, Flex } from "antd";
import { Meteor } from "meteor/meteor";

const { Option } = Select;
const { Title } = Typography;

export default function NewUser() {
  const [form] = Form.useForm();

  const onFinish = (values) => {
    const { username, password, role, proyect } = values;

    Meteor.call(
      "createUserWithRole",
      username,
      password,
      role,
      proyect,
      (error) => {
        if (error) {
          message.error("Error creando usuario: " + error.reason);
        } else {
          message.success("Usuario creado con exito");
          form.resetFields();
        }
      }
    );
  };
  return (
    <>
      <Flex vertical align="center" style={{ width: "100%" }}>
        <Title level={2}>Creación de usuarios</Title>
      </Flex>
      <Form
        title="Creacion de usuarios"
        form={form}
        layout="vertical"
        onFinish={onFinish}
        style={{ maxWidth: "400px", margin: "auto" }}
      >
        <Form.Item
          name="username"
          rules={[
            { required: true, message: "Por favor introduce el nombre!" },
          ]}
        >
          <Input placeholder="Asignar nombre de Usuario" />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[
            { required: true, message: "Plor favor asifna una contraseña!" },
          ]}
        >
          <Input placeholder="Asignar contraseña" />
        </Form.Item>
        <Form.Item
          name="role"
          rules={[{ required: true, message: "Por favor, selecciona un rol!" }]}
        >
          <Select placeholder="Asignar un rol">
            <Option value="leader">Lider</Option>
            <Option value="management">Gestor</Option>
          </Select>
        </Form.Item>
        <Form.Item
          name="proyect"
          rules={[
            { required: true, message: "Por favor, selecciona un proyecto!" },
          ]}
        >
          <Select placeholder="Asignar un proyecto">
            <Option value="movilidad">Movilidad</Option>
            <Option value="sierra">Sierra</Option>
          </Select>
        </Form.Item>
        <Form.Item>
          <Button type="primary" block htmlType="submit">
            Crear usuario
          </Button>
        </Form.Item>
      </Form>
    </>
  );
}
