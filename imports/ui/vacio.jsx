import { Flex } from "antd";
import React from "react";

export default function Vacio() {
  return (
    <Flex
      align="center"
      justify="center"
      style={{
        width: "100%",
        height:"50dvh",
        background:
          "radial-gradient(circle, rgba(34,113,177,0.6811099439775911) 0%, rgba(255,255,255,0) 99%)",
      }}
    >
      <img src="/logo.png" />
    </Flex>
  );
}
