import React from "react";
import { createRoot } from "react-dom/client";
import App from "./pages/App.jsx";
import "./index.css";

// Lógica do PWA (Captura o evento de instalação)
window.deferredPrompt = null;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  window.deferredPrompt = e;
  window.dispatchEvent(new Event("pwaInstallReady"));
});

// Renderização correta (Sem o BrowserRouter aqui, pois ele já está no App.jsx)
createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
