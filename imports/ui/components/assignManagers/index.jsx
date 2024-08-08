import React, { useState, useEffect } from "react";
import { Form, Button, Select, message, Flex, Typography } from "antd";
import { Meteor } from "meteor/meteor";

const { Option } = Select;
const { Title } = Typography;


const AssignManagers = () => {
  const [form] = Form.useForm();
  const [leaders, setLeaders] = useState([]);
  const [managers, setManagers] = useState([]);
  const [assignedManagers, setAssignedManagers] = useState([]);

  useEffect(() => {
    Meteor.call("getUsersByRole", "leader", (error, result) => {
      if (!error) {
        setLeaders(result);
      }
    });

    Meteor.call("getUsersByRole", "management", (error, result) => {
      if (!error) {
        setManagers(result);
      }
    });
  }, []);

  const handleLeaderChange = (leaderId) => {
    if (leaderId) {
      Meteor.call("getManagersForLeader", leaderId, (error, result) => {
        if (!error) {
          setAssignedManagers(result);
          form.setFieldsValue({ selectedManagers: result });
        } else {
          message.error("Error al cargar gestores: " + error.reason);
        }
      });
    } else {
      setAssignedManagers([]);
      form.setFieldsValue({ selectedManagers: [] });
    }
  };

  const onFinish = (values) => {
    const { leader, selectedManagers } = values;

    Meteor.call("assignManagersToLeader", leader, selectedManagers, (error) => {
      if (error) {
        message.error("Error asignando gestores: " + error.reason);
      } else {
        message.success("Gestor asignado con éxito");
        form.resetFields();
        setAssignedManagers([]);
      }
    });
  };

  return (
    <>
     <Flex vertical align="center" style={{ width: "100%" }}>
        <Title level={2}>Asignación de gestores</Title>
      </Flex>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        style={{ maxWidth: "400px", margin: "auto" }}
      >
        <Form.Item
          name="leader"
          rules={[
            { required: true, message: "Por favor, seleciona un lider!" },
          ]}
        >
          <Select
            placeholder="Seleciona un lider"
            onChange={handleLeaderChange}
          >
            {leaders.map((leader) => (
              <Option key={leader._id} value={leader._id}>
                {leader.username}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="selectedManagers"
          rules={[
            { required: true, message: "Por favor selecciona un gestor!" },
          ]}
        >
          <Select mode="multiple" placeholder="Selecciona los gestores">
            {managers.map((manager) => (
              <Option key={manager._id} value={manager._id}>
                {manager.username}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Asignar Gestores
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

export default AssignManagers;
