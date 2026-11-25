import React, { useState, useRef, useEffect } from "react";
import { Layers, Check, ChevronDown } from "lucide-react";

// Opções de estilo de mapa com ícones/descrições
const MAP_STYLES = [
  { value: "light", label: "Claro (Carto)", desc: "Padrão claro" },
  { value: "openstreetmap", label: "OpenStreetMap", desc: "Colaborativo" },
  { value: "openstreetmap3d", label: "Visão 3D", desc: "Relevo e edifícios" },
  { value: "satellite", label: "Satélite", desc: "Imagem real" },
];

export default function ButtonTheme({
  activeStyle,
  setActiveStyle,
  toggleTheme,
  isDarkMode = false,
  className,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const currentStyle =
    MAP_STYLES.find((s) => s.value === activeStyle) || MAP_STYLES[0];

  const handleSelect = (value) => {
    setActiveStyle(value);
    setIsOpen(false);
  };

  return (
    <div
      className={`absolute top-4 md:top-6 right-4 z-20 flex items-center gap-2 ${className || ""}`}
    >
      {/* Dropdown de Estilo de Mapa */}
      <div ref={dropdownRef} className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          className={`group flex items-center gap-2 pl-3 pr-2 py-2 h-11 bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-slate-200/60 hover:bg-white hover:shadow-xl active:scale-95 transition-all duration-300 cursor-pointer ${
            isOpen ? "ring-2 ring-[#4180ab]/30 border-[#4180ab]/40" : ""
          }`}
        >
          <Layers
            className={`size-4 shrink-0 transition-colors ${
              isOpen
                ? "text-[#4180ab]"
                : "text-slate-400 group-hover:text-[#4180ab]"
            }`}
          />
          <span className="text-sm font-semibold text-slate-700 max-w-[110px] sm:max-w-none truncate">
            {currentStyle.label}
          </span>
          <ChevronDown
            className={`size-4 text-slate-400 shrink-0 transition-transform duration-300 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Menu Dropdown */}
        {isOpen && (
          <div className="absolute top-full right-0 mt-2 w-60 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden z-30 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200 origin-top-right">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Estilo do Mapa
              </p>
            </div>

            <div className="p-1.5 max-h-72 overflow-y-auto">
              {MAP_STYLES.map((style) => {
                const isActive = style.value === activeStyle;
                return (
                  <button
                    key={style.value}
                    onClick={() => handleSelect(style.value)}
                    className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 group ${
                      isActive
                        ? "bg-[#4180ab]/10 text-[#4180ab]"
                        : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className="flex flex-col min-w-0 flex-1">
                      <span
                        className={`text-sm font-semibold truncate ${
                          isActive ? "text-[#4180ab]" : "text-slate-700"
                        }`}
                      >
                        {style.label}
                      </span>
                      <span className="text-[11px] text-slate-400 truncate">
                        {style.desc}
                      </span>
                    </div>
                    {isActive && (
                      <Check className="size-4 shrink-0 text-[#4180ab]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
