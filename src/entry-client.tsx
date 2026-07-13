import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App";
import "./index.css";

const container = document.getElementById("root");
if (!container) {
  throw new Error("Root element #root not found");
}

// Prerendered HTML is for crawlers; client mounts fresh to avoid hydration
// mismatches from Radix IDs, routers, and client-only widgets.
createRoot(container).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>,
);
