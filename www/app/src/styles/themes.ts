import { createTheme, PaletteMode } from "@mui/material";

// Inject custom palette values for "code"
declare module "@mui/material/styles" {
  interface Palette {
    code: Palette["primary"];
  }
  interface PaletteOptions {
    code: PaletteOptions["primary"];
  }
}

export const getDesign = (mode: PaletteMode) => ({
  palette: {
    mode,
    ...(mode === "light"
      ? {
          // palette values for light mode
          primary: {
            main: "#3498DB",
          },
          secondary: {
            main: "#E9E9E9",
          },
          code: {
            main: "#FBFBFB",
          },
        }
      : {
          // palette values for dark mode
          primary: {
            main: "#001F3F",
          },
          secondary: {
            main: "#636E72",
          },
          code: {
            main: "#373E40",
          },
        }),
  },
});

export const DefaultTheme = (prefersDarkMode: boolean) =>
  createTheme(getDesign(prefersDarkMode ? "dark" : "light"));
