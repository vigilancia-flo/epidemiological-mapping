import { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "maplibre-gl/dist/maplibre-gl.css";
import "mapbox-gl/dist/mapbox-gl.css";
import Home from "./Home.jsx";
import Dashboard from "./DashBoard.jsx";
import Support from "./Support.jsx";
import { AuthProvider } from "../contexts/AuthContext.jsx";
import EpidemiologicMap from "./EpidemiologyMap.jsx";
import MapDengue from "./maps/MapDengue.jsx";
import MapTubercu from "./maps/MapTubercu.jsx";
import MapSifi from "./maps/MapSifi.jsx";
import MapChaga from "./maps/MapChagas.jsx";
import MapHans from "./maps/MapHans.jsx";
import MapHepa from "./maps/MapHepa.jsx";
import MapViolencia from "./maps/MapViolencia.jsx";
import MapLeishmaniose from "./maps/MapLeishmaniose.jsx";
import MapAids from "./maps/MapAids.jsx";
import SystemInformation from "./SystemInformation.jsx";
import NotFound from "./NotFound.jsx";
import ProtectedRoute from "@/utils/ProtectedRoute.jsx";
import CoberturaVacinal from "./CoberturaVacinal.jsx";
import AboutDeveloper from "../components/Modal/AboutDeveloper.jsx";

function App() {
  return (
    <>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Rotas Públicas */}
            <Route path="/" element={<Home />} />
            <Route path="/mapa-epidemiologico" element={<EpidemiologicMap />} />
            <Route
              path="/mapa-epidemiologico/endemias/tuberculose"
              element={<MapTubercu />}
            />
            <Route
              path="/mapa-epidemiologico/endemias/sifi"
              element={<MapSifi />}
            />
            <Route
              path="/mapa-epidemiologico/endemias/dengue"
              element={<MapDengue />}
            />
            <Route
              path="/mapa-epidemiologico/endemias/chagas"
              element={<MapChaga />}
            />
            <Route
              path="/mapa-epidemiologico/endemias/hanseniase"
              element={<MapHans />}
            />
            <Route
              path="/mapa-epidemiologico/endemias/hepatite"
              element={<MapHepa />}
            />
            <Route
              path="/mapa-epidemiologico/endemias/leishmaniose"
              element={<MapLeishmaniose />}
            />
            <Route
              path="/mapa-epidemiologico/endemias/aids"
              element={<MapAids />}
            />
            <Route
              path="/dashboard"
              element={<Dashboard isPrivateView={false} />}
            />
            <Route path="/suporte" element={<Support />} />
            <Route
              path="/desenvolvedor"
              element={<AboutDeveloper isPrivateView={false} />}
            />
            <Route path="*" element={<NotFound />} />

            {/* =================== Rotas Privadas Admin ===================*/}
            <Route element={<ProtectedRoute />}>
              <Route
                path="/profissional/dashboard"
                element={<Dashboard isPrivateView={true} />}
              />
              <Route
                path="profissional/mapa-epidemiologico"
                element={<EpidemiologicMap isPrivateView={true} />}
              />
              <Route
                path="profissional/mapa-epidemiologico/endemias/tuberculose"
                element={<MapTubercu isPrivateView={true} />}
              />
              <Route
                path="profissional/mapa-epidemiologico/endemias/sifi"
                element={<MapSifi isPrivateView={true} />}
              />
              <Route
                path="profissional/mapa-epidemiologico/endemias/dengue"
                element={<MapDengue isPrivateView={true} />}
              />
              <Route
                path="profissional/mapa-epidemiologico/endemias/chagas"
                element={<MapChaga isPrivateView={true} />}
              />
              <Route
                path="profissional/mapa-epidemiologico/endemias/hanseniase"
                element={<MapHans isPrivateView={true} />}
              />
              <Route
                path="profissional/mapa-epidemiologico/endemias/hepatite"
                element={<MapHepa isPrivateView={true} />}
              />
              <Route
                path="profissional/mapa-epidemiologico/endemias/violenciadom"
                element={<MapViolencia isPrivateView={true} />}
              />
              <Route
                path="profissional/mapa-epidemiologico/endemias/leishmaniose"
                element={<MapLeishmaniose isPrivateView={true} />}
              />
              <Route
                path="profissional/mapa-epidemiologico/endemias/aids"
                element={<MapAids isPrivateView={true} />}
              />
              <Route
                path="profissional/suporte"
                element={<Support isPrivateView={true} />}
              />
              <Route
                path="profissional/informacoes-sistema"
                element={<SystemInformation isPrivateView={true} />}
              />
              <Route
                path="profissional/cobertura-vacinal"
                element={<CoberturaVacinal />}
                isPrivateView={true}
              />
              <Route
                path="profissional/desenvolvedor"
                element={<AboutDeveloper />}
                isPrivateView={true}
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </>
  );
}

export default App;
