window.deferredPrompt = null;

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  window.deferredPrompt = e;
  // Avisa os componentes React que o PWA está pronto para ser instalado
  window.dispatchEvent(new Event("pwaInstallReady"));
});

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import "maplibre-gl/dist/maplibre-gl.css";
import App from "./pages/App.jsx";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").then(
      (registration) => {
        console.log("Service Worker registrado com sucesso:", registration);
      },
      (error) => {
        console.log("Falha ao registrar o Service Worker:", error);
      },
    );
  });
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
