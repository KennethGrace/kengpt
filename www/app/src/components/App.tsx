import React, {
  FC,
  lazy,
  LazyExoticComponent,
  Suspense,
  useEffect,
  useState,
} from "react";

import { Box } from "@mui/material";

import NotificationsProvider from "./contexts/NotificationProvider";
import ChatProvider from "./contexts/ChatProvider";

const Viewport = lazy(() => import("./Viewport"));
const Banner = lazy(() => import("./Banner"));

export const App: FC = () => {
  return (
    <Box
      component="main"
      sx={{
        display: "flex",
        flexDirection: "column",
        minWidth: "500px",
        width: "100vw",
        minHeight: "500px",
        height: "100vh",
      }}
    >
      <NotificationsProvider>
        <ChatProvider>
          <Banner />
          <Viewport />
        </ChatProvider>
      </NotificationsProvider>
    </Box>
  );
};

export default App;
