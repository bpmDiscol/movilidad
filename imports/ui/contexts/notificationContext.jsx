import React, { createContext, useEffect, useState } from "react";
import { notification } from "antd";

export const NotificationContext = createContext();

export default function NotificationProvider({ children }) {
  const [api, contextHolder] = notification.useNotification();
  const [message, alertMessage] = useState();

  function openNotification(message) {
    api[message.type](message);
  }

  useEffect(() => {
    if (message) openNotification(message);
  }, [message]);

  return (
    <NotificationContext.Provider value={{alertMessage}}>
      {contextHolder}
      {children}
    </NotificationContext.Provider>
  );
}
