import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n";

// Restore SPA path saved by 404.html — but only once and only when we landed on root.
// Avoids stale entries hijacking direct navigations like /login.
try {
  const redirectedPath = sessionStorage.getItem("spa-redirect-path");
  if (redirectedPath) {
    sessionStorage.removeItem("spa-redirect-path");
    const onRoot = window.location.pathname === "/" || window.location.pathname === "";
    const looksValid = redirectedPath.startsWith("/") && redirectedPath !== "/" && redirectedPath !== "/index";
    if (onRoot && looksValid) {
      window.history.replaceState(null, "", redirectedPath);
    }
  }
} catch {
  // sessionStorage unavailable — ignore
}

createRoot(document.getElementById("root")!).render(<App />);
