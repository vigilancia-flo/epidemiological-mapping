// src/hooks/useFiltrosMapa.js
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

const PERIODOS_VALIDOS = [
  "todos",
  "ultimoMes",
  "ultimos3Meses",
  "ultimos6Meses",
  "esteAno",
  "anoPassado",
  "personalizado",
];

export function useFiltrosMapa() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Lê da URL só na primeira renderização
  const [filtroTipo, setFiltroTipo] = useState(() => {
    const p = searchParams.get("periodo");
    return PERIODOS_VALIDOS.includes(p) ? p : "todos";
  });
  const [dataInicio, setDataInicio] = useState(
    () => searchParams.get("de") || "",
  );
  const [dataFim, setDataFim] = useState(() => searchParams.get("ate") || "");

  // Sempre que um filtro mudar, espelha na URL (sem poluir o histórico)
  useEffect(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);

        if (filtroTipo === "todos") next.delete("periodo");
        else next.set("periodo", filtroTipo);

        if (filtroTipo === "personalizado") {
          if (dataInicio) next.set("de", dataInicio);
          else next.delete("de");
          if (dataFim) next.set("ate", dataFim);
          else next.delete("ate");
        } else {
          next.delete("de");
          next.delete("ate");
        }

        return next;
      },
      { replace: true },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroTipo, dataInicio, dataFim]);

  return {
    filtroTipo,
    setFiltroTipo,
    dataInicio,
    setDataInicio,
    dataFim,
    setDataFim,
  };
}
