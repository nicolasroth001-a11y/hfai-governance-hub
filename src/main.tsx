import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n";

const redirectedPath = sessionStorage.getItem("spa-redirect-path");

if (redirectedPath) {
  sessionStorage.removeItem("spa-redirect-path");

  const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (redirectedPath !== currentPath) {
    window.history.replaceState(null, "", redirectedPath);
  }
}

createRoot(document.getElementById("root")!).render(<App />);
