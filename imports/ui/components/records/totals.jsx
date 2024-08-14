import React from "react";
import { Flex, Typography } from "antd";
import formatNumber from "../../utils/formatNumbers";
const { Text } = Typography;

export default function Totals({ totales }) {
  return (
    <Flex
      align="end"
      gap={10}
      style={{
        position: "relative",
        right: "-55%",
        top: "40px",
        visibility: totales ? "visible" : "hidden",
      }}
    >
      <Flex>
        <Text italic strong style={{ color: "red" }}>
          Total deuda asignada: $
          {formatNumber(totales?.deudaTotalAsignada || 0)}
        </Text>
      </Flex>
      <Flex vertical>
        <Text strong>Indicador</Text>

        <Text italic>
          Normalización: {totales?.indicadorCounts.Normalizacion}
        </Text>
        <Text italic>Contención: {totales?.indicadorCounts.Contencion}</Text>
        <Text italic>Castigados: {totales?.indicadorCounts.Castigado}</Text>
      </Flex>
      <Flex vertical>
        <Text strong>Tipo de servicio</Text>
        <Text italic>Gas {totales?.descripcionTipoProductoCounts.GAS}</Text>
        <Text italic>
          Brilla Surtigas {totales?.descripcionTipoProductoCounts.BRILLA}
        </Text>
        <Text italic>
          Servicios financieros{" "}
          {totales?.descripcionTipoProductoCounts.SERVICIOS_FINANCIEROS}
        </Text>
      </Flex>
    </Flex>
  );
}
