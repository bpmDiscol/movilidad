import React from "react";
import NotificationProvider from "./contexts/notificationContext";
import SecurityProvider from "./contexts/securityProvider";
import Login from "./login";
import Main from "./main";

export const App = () => (
  <NotificationProvider>
    <SecurityProvider publicPage={<Login />}>
      <Main />
    </SecurityProvider>
  </NotificationProvider>
);
