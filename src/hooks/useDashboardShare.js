// src/hooks/useDashboardShare.js
import { useEffect, useRef, useCallback, useState } from "react";

const PERIODOS_VALIDOS = new Set([
  "todos",
  "ultimoMes",
  "ultimos3Meses",
  "ultimos6Meses",
  "esteAno",
  "anoPassado",
  "personalizado",
]);

const isValidDate = (v) =>
  typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);

const buildParams = ({ endemiaId, periodo, inicio, fim }) => {
  const params = new URLSearchParams();
  if (endemiaId) params.set("endemia", endemiaId);
  if (periodo && periodo !== "todos") params.set("periodo", periodo);
  if (periodo === "personalizado") {
    if (isValidDate(inicio)) params.set("inicio", inicio);
    if (isValidDate(fim)) params.set("fim", fim);
  }
  return params;
};

/**
 * Sincroniza filtros do dashboard com a URL e gera link compartilhável.
 *
 * Uso:
 *   const { copiarLink, gerarLinkCompartilhavel, copiado } = useDashboardShare({...});
 */
export function useDashboardShare({
  endemiasDisponiveis = [],
  endemiaSelecionada,
  setEndemiaSelecionada,
  filtroTipo,
  setFiltroTipo,
  dataInicio,
  setDataInicio,
  dataFim,
  setDataFim,
  onShare,
}) {
  const hydratedRef = useRef(false);
  const skipFirstSyncRef = useRef(true);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const endemiaId = params.get("endemia");
    const periodo = params.get("periodo");
    const inicio = params.get("inicio");
    const fim = params.get("fim");

    if (endemiaId) {
      const found = endemiasDisponiveis.find((e) => e.id === endemiaId);
      if (found) setEndemiaSelecionada(found);
    }

    if (periodo && PERIODOS_VALIDOS.has(periodo)) {
      setFiltroTipo(periodo);
      if (periodo === "personalizado") {
        if (isValidDate(inicio)) setDataInicio(inicio);
        if (isValidDate(fim)) setDataFim(fim);
      }
    }

    hydratedRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // roda só no mount

  useEffect(() => {
    if (!hydratedRef.current) return;

    // Pula o primeiro ciclo (ainda reflete o estado pré-hidratação)
    if (skipFirstSyncRef.current) {
      skipFirstSyncRef.current = false;
      return;
    }

    const params = buildParams({
      endemiaId: endemiaSelecionada?.id,
      periodo: filtroTipo,
      inicio: dataInicio,
      fim: dataFim,
    });

    const url = new URL(window.location.href);
    url.search = params.toString();
    window.history.replaceState({}, "", url.toString());
  }, [endemiaSelecionada, filtroTipo, dataInicio, dataFim]);

  const gerarLinkCompartilhavel = useCallback(() => {
    const params = buildParams({
      endemiaId: endemiaSelecionada?.id,
      periodo: filtroTipo,
      inicio: dataInicio,
      fim: dataFim,
    });
    const url = new URL(window.location.href);
    url.search = params.toString();
    return url.toString();
  }, [endemiaSelecionada, filtroTipo, dataInicio, dataFim]);

  const copiarLink = useCallback(async () => {
    const link = gerarLinkCompartilhavel();

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(link);
      } else {
        const ta = document.createElement("textarea");
        ta.value = link;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }

      setCopiado(true);
      onShare?.({ sucesso: true, link });
      setTimeout(() => setCopiado(false), 2200);
      return true;
    } catch (err) {
      console.error("Falha ao copiar link:", err);
      onShare?.({ sucesso: false, link, erro: err });
      return false;
    }
  }, [gerarLinkCompartilhavel, onShare]);

  return { copiarLink, gerarLinkCompartilhavel, copiado };
}
