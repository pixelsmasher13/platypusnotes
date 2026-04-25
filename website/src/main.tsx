import React from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import App from "./App";

const theme = extendTheme({
  fonts: {
    heading: `"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`,
    body: `"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`,
  },
  colors: {
    ink: {
      50: "#FAFAFA",
      100: "#F4F4F5",
      200: "#E4E4E7",
      300: "#D4D4D8",
      400: "#A1A1AA",
      500: "#71717A",
      600: "#52525B",
      700: "#3F3F46",
      800: "#27272A",
      900: "#18181B",
      950: "#09090B",
    },
  },
  styles: {
    global: {
      "html, body": {
        scrollBehavior: "smooth",
        overflowX: "hidden",
        maxWidth: "100vw",
      },
      body: {
        bg: "white",
        color: "ink.900",
        fontWeight: 400,
      },
    },
  },
  components: {
    Heading: {
      baseStyle: {
        letterSpacing: "-0.025em",
        fontWeight: 700,
      },
    },
    Button: {
      baseStyle: {
        fontWeight: 500,
        letterSpacing: "-0.005em",
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>
);
