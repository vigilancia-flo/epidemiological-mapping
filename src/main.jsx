import React from "react";
import { createRoot } from "react-dom/client";
import App from "./pages/App.jsx";
import "./index.css";

window.deferredPrompt = null;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  window.deferredPrompt = e;
  window.dispatchEvent(new Event("pwaInstallReady"));
});

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
