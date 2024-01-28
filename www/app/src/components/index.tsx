// React
import ReactDOM from "react-dom";
import React, { FC, Suspense, lazy, useMemo } from "react";

// MUI
import { ThemeProvider, Box, CssBaseline, useMediaQuery } from "@mui/material";
import { DefaultTheme } from "../styles/themes";

// Loading Indicator
import { LoadingIndicator } from "./common/Loaders";

const app = document.getElementById("app");
const Application = lazy(() => import("./App"));

const Index: FC<any> = (props: any) => {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  // Application Theme
  const theme = useMemo(() => DefaultTheme(prefersDarkMode), [prefersDarkMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Suspense fallback={<LoadingIndicator label="Hello User" />}>
        <Application />
      </Suspense>
    </ThemeProvider>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <Index />
  </React.StrictMode>,
  app
);
