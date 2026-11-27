import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Map,
  Activity,
  CircleQuestionMark,
  X,
  Database,
  ChevronLeft,
  Syringe,
  ChevronsLeft,
  Megaphone,
} from "lucide-react";

const NAV_ITEMS = [
  {
    path: "/profissional/dashboard",
    icon: LayoutDashboard,
    label: "Dados Gerais",
    desc: "Visão geral",
  },
  {
    path: "/profissional/mapa-epidemiologico",
    icon: Map,
    label: "Mapa Epidemiológico",
    desc: "Georreferenciamento",
  },
  {
    path: "/profissional/cobertura-vacinal",
    icon: Syringe,
    label: "Cobertura Vacinal",
    desc: "Imunização infantil",
  },
  {
    path: "/profissional/mural",
    icon: Megaphone,
    label: "Canal de Comunicação",
    desc: "Mural epidemiológico",
  },
  {
    path: "/profissional/informacoes-sistema",
    icon: Database,
    label: "Gerenciar Tabelas",
    desc: "Dados SINAN",
  },
  {
    path: "/profissional/suporte",
    icon: CircleQuestionMark,
    label: "Dúvidas Frequentes",
    desc: "Ajuda e suporte",
  },
];

const SidebarPrivate = ({ isOpen, onClose }) => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    // Verifica se o evento já foi capturado pelo main.jsx
    if (window.deferredPrompt) {
      setDeferredPrompt(window.deferredPrompt);
    }

    // Ouve o evento customizado disparado pelo main.jsx
    const handleInstallReady = () => {
      if (window.deferredPrompt) {
        setDeferredPrompt(window.deferredPrompt);
      }
    };

    window.addEventListener("pwaInstallReady", handleInstallReady);

    return () => {
      window.removeEventListener("pwaInstallReady", handleInstallReady);
    };
  }, []);

  // Sincroniza a largura da sidebar com uma variável CSS global
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--sidebar-width",
      isCollapsed ? "5.5rem" : "17rem",
    );
  }, [isCollapsed]);

  const isActive = (itemPath) => {
    const rotaFinal = itemPath.split("/").pop();
    return location.pathname.includes(rotaFinal);
  };

  return (
    <>
      {/* Overlay do mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-screen bg-white border-r border-slate-200/80 flex flex-col z-50 transition-all duration-300 ease-in-out shadow-[4px_0_24px_rgba(0,0,0,0.03)] w-72 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 ${isCollapsed ? "md:w-22" : "md:w-68"}`}
      >
        {/* Botão de Encolher (Desktop) */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? "Expandir menu" : "Encolher menu"}
          className="hidden md:flex absolute -right-3.5 top-20 bg-white border border-slate-200 rounded-full p-1.5 z-50 shadow-md hover:shadow-lg hover:border-[#538CB3]/40 hover:bg-[#538CB3]/5 transition-all duration-300 cursor-pointer group"
        >
          <ChevronsLeft
            className={`size-4 text-slate-500 group-hover:text-[#538CB3] transition-all duration-300 ${
              isCollapsed ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Cabeçalho / Logo */}
        <div
          className={`h-20 flex items-center border-b border-slate-100 transition-all duration-300 ${
            isCollapsed ? "justify-center px-3" : "justify-between px-5"
          }`}
        >
          <Link
            to="/profissional/dashboard"
            className={`flex items-center group cursor-pointer ${
              isCollapsed ? "justify-center" : "gap-3"
            }`}
            onClick={onClose}
          >
            <div className="relative shrink-0">
              <div className="absolute inset-0 bg-linear-to-br from-[#538CB3] to-[#054060] rounded-xl blur-md opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
              <div className="relative bg-linear-to-br from-[#538CB3] to-[#054060] p-2.5 rounded-xl shadow-sm group-hover:scale-105 transition-transform duration-300">
                <Activity className="size-5 text-white" strokeWidth={2.5} />
              </div>
            </div>
            <span
              className={`text-xl font-black tracking-tight text-slate-900 transition-all duration-300 whitespace-nowrap overflow-hidden ${
                isCollapsed ? "max-w-0 opacity-0" : "max-w-32 opacity-100"
              }`}
            >
              SIG<span className="text-[#538CB3]">EP</span>
            </span>
          </Link>

          {!isCollapsed && (
            <button
              onClick={onClose}
              aria-label="Fechar menu"
              className="md:hidden text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 p-2 rounded-lg transition-colors"
            >
              <X className="size-5" />
            </button>
          )}
        </div>

        {/* Divisor decorativo */}
        <div
          className={`transition-all duration-300 ${
            isCollapsed ? "mx-4 mt-4" : "mx-5 mt-4"
          }`}
        >
          <div className="h-px bg-linear-to-r from-transparent via-slate-200 to-transparent"></div>
        </div>

        {/* Navegação Principal */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-5 px-3 custom-scrollbar">
          <p
            className={`px-3 text-[10px] font-bold tracking-[0.15em] text-slate-400 uppercase transition-all duration-300 overflow-hidden whitespace-nowrap ${
              isCollapsed
                ? "max-h-0 opacity-0 mb-0"
                : "max-h-10 opacity-100 mb-3"
            }`}
          >
            Menu Principal
          </p>

          <ul className="space-y-1">
            {NAV_ITEMS.map(({ path, icon: Icon, label, desc }) => {
              const active = isActive(path);
              return (
                <li key={path} className="relative group/nav">
                  <Link
                    to={path}
                    onClick={onClose}
                    className={`relative flex items-center ${
                      isCollapsed
                        ? "justify-center px-0 h-12"
                        : "px-3.5 gap-3 py-3"
                    } rounded-xl transition-all duration-300 ${
                      active
                        ? "bg-[#538CB3]/8 text-[#054060]"
                        : "text-slate-500 hover:bg-slate-50 hover:text-[#054060]"
                    }`}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 bg-linear-to-b from-[#538CB3] to-[#054060] rounded-r-full" />
                    )}

                    <Icon
                      className={`size-5 shrink-0 transition-all duration-300 ${
                        active
                          ? "text-[#054060]"
                          : "text-slate-400 group-hover/nav:text-[#538CB3] group-hover/nav:scale-110"
                      }`}
                      strokeWidth={active ? 2.5 : 2}
                    />

                    <div
                      className={`flex flex-col overflow-hidden transition-all duration-300 whitespace-nowrap ${
                        isCollapsed
                          ? "max-w-0 opacity-0"
                          : "max-w-52 opacity-100"
                      }`}
                    >
                      <span
                        className={`text-sm font-semibold leading-tight ${
                          active ? "text-[#054060]" : ""
                        }`}
                      >
                        {label}
                      </span>
                      {desc && (
                        <span className="text-[10px] text-slate-400 font-medium leading-tight mt-0.5">
                          {desc}
                        </span>
                      )}
                    </div>
                  </Link>

                  {isCollapsed && (
                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-lg whitespace-nowrap opacity-0 pointer-events-none group-hover/nav:opacity-100 group-hover/nav:translate-x-0 -translate-x-2 transition-all duration-200 z-50 hidden md:block">
                      {label}
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-slate-900 rotate-45"></span>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Rodapé (Status do Sistema) */}
        <div className="p-3 border-t border-slate-100">
          <div
            className={`flex items-center rounded-xl bg-linear-to-br from-slate-50 to-slate-100/50 border border-slate-100 transition-all duration-300 ${
              isCollapsed ? "justify-center px-0 py-3" : "gap-3 px-3.5 py-3"
            }`}
            title={isCollapsed ? "Acesso Profissional - Autenticado" : ""}
          >
            <div className="relative flex size-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full size-2.5 bg-emerald-500"></span>
            </div>
            <div
              className={`flex flex-col overflow-hidden transition-all duration-300 whitespace-nowrap ${
                isCollapsed ? "max-w-0 opacity-0" : "max-w-44 opacity-100"
              }`}
            >
              <span className="text-[13px] font-bold text-slate-700 leading-none mb-1">
                Acesso Profissional
              </span>
              <span className="text-[11px] font-medium text-emerald-600 leading-none">
                Autenticado
              </span>
            </div>
          </div>
          <div
            className={`mt-2 transition-all duration-300 ${isCollapsed ? "opacity-0 max-h-0 overflow-hidden" : "opacity-100 max-h-10"}`}
          ></div>
        </div>
      </aside>
    </>
  );
};

export default SidebarPrivate;
