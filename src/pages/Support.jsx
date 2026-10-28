import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Sidebar from "../components/Sidebar.jsx";
import SidebarPrivate from "@/components/private/SidebarPrivate.jsx";
import { Helmet } from "react-helmet-async";
import {
  IoChatbubbles,
  IoClose,
  IoWarning,
  IoSend,
  IoHardwareChip,
  IoRefresh,
} from "react-icons/io5";
import {
  Menu,
  HelpCircle,
  FileText,
  ShieldCheck,
  Bot,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*                                   Config                                   */
/* -------------------------------------------------------------------------- */

const BRAND = {
  primary: "#4180ab",
  dark: "#054060",
  darker: "#03304a",
};

const FAQS = [
  {
    q: "Como atualizo os dados do mapa?",
    a: "Acesse a aba 'Gerenciar Tabelas', selecione a endemia desejada e clique em 'Importar Arquivo' para subir o relatório atualizado do SINAN (.dbf, .xls ou .csv).",
    icon: <FileText className="size-6 text-blue-500" />,
  },
  {
    q: "O que significa 'Casos em Alerta'?",
    a: "São casos classificados como graves ou com sinais de alarme no momento da notificação (classificação 10 ou 11), exigindo atenção imediata da rede de saúde.",
    icon: <AlertTriangle className="size-6 text-amber-500" />,
  },
  {
    q: "Quem tem acesso à Área do Profissional?",
    a: "O acesso é estritamente restrito a agentes de saúde respectivos da sua UBS, com credenciais cadastradas previamente pela Secretaria de Saúde.",
    icon: <ShieldCheck className="size-6 text-emerald-500" />,
  },
  {
    q: "O Assistente Virtual pode dar diagnósticos?",
    a: "Não. A inteligência artificial foi treinada exclusivamente para sanar dúvidas sobre o uso do sistema EPI-DATA e ajudar a interpretar as métricas da plataforma.",
    icon: <Bot className="size-6 text-purple-500" />,
  },
];

const SUGGESTIONS = [
  "Como atualizo os dados do mapa?",
  "O que significa 'Casos em Alerta'?",
  "Quem tem acesso à Área do Profissional?",
];

const STORAGE_KEY = "epidata_chat_history_v1";
const REQUEST_TIMEOUT_MS = 30_000;
const MAX_INPUT_LENGTH = 2_000;

const MENSAGEM_INICIAL = {
  sender: "bot",
  text: "Olá! Sou o assistente virtual do SIGEP. Como posso ajudar você hoje?",
  structured: null,
};

/* -------------------------------------------------------------------------- */
/*                              Storage helpers                               */
/* -------------------------------------------------------------------------- */

function carregarHistorico() {
  if (typeof window === "undefined") return [MENSAGEM_INICIAL];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [MENSAGEM_INICIAL];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch (e) {
    console.warn("[chat] Falha ao restaurar histórico:", e);
  }
  return [MENSAGEM_INICIAL];
}

function limparHistorico() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch (_) {
    /* ignore */
  }
}

function formatTime(ts) {
  if (!ts) return "";
  try {
    return new Date(ts).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

/* -------------------------------------------------------------------------- */
/*                              API call helper                               */
/* -------------------------------------------------------------------------- */

async function postChatMessage(message, signal) {
  const rawApiUrl = import.meta.env.VITE_API_URL || "";
  const apiUrl = rawApiUrl.replace(/\/+$/, "");

  const response = await fetch(`${apiUrl}/api/chat/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ message }),
    signal,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  if (!data || data.status !== "success") {
    throw new Error(data?.message || "Resposta inválida da API");
  }
  return data;
}

/* -------------------------------------------------------------------------- */
/*                          Structured message cards                          */
/* -------------------------------------------------------------------------- */

function RankingCard({ data }) {
  const itens = Array.isArray(data.itens) ? data.itens : [];
  const max = Math.max(...itens.map((i) => Number(i.valor) || 0), 1);
  const medalhas = ["🥇", "🥈", "🥉"];

  return (
    <div className="rounded-2xl rounded-tl-sm border border-slate-200 bg-white p-4 shadow-sm w-full">
      <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
        📊 {data.titulo || "Ranking"}
      </h3>
      <ul className="space-y-2.5">
        {itens.map((item, i) => (
          <li key={i} className="flex items-center gap-2">
            <span className="w-6 text-xs font-bold text-slate-500 shrink-0">
              {medalhas[i] || `${i + 1}º`}
            </span>
            <span className="flex-1 text-xs text-slate-700 truncate font-medium">
              {item.label}
            </span>
            <div className="w-20 bg-slate-100 h-1.5 rounded-full overflow-hidden shrink-0">
              <div
                className={`h-full rounded-full ${
                  i === 0 ? "bg-[#4180ab]" : "bg-[#4180ab]/60"
                }`}
                style={{ width: `${(Number(item.valor) / max) * 100}%` }}
              />
            </div>
            <span className="text-xs font-bold text-[#054060] w-8 text-right shrink-0">
              {item.valor}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function KpiCard({ data }) {
  return (
    <div className="rounded-2xl rounded-tl-sm border border-slate-200 bg-gradient-to-br from-[#4180ab]/10 to-white p-5 shadow-sm w-full">
      <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">
        {data.titulo}
      </p>
      <p className="text-4xl font-extrabold text-[#054060] leading-none">
        {data.valor}
      </p>
      <p className="text-xs text-slate-500 mt-1">{data.subtitulo}</p>
    </div>
  );
}

function TabelaCard({ data }) {
  const colunas = Array.isArray(data.colunas) ? data.colunas : [];
  const linhas = Array.isArray(data.linhas) ? data.linhas : [];

  return (
    <div className="rounded-2xl rounded-tl-sm border border-slate-200 bg-white p-4 shadow-sm w-full overflow-hidden">
      <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
        💉 {data.titulo || "Tabela"}
      </h3>
      <div className="overflow-x-auto -mx-1">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              {colunas.map((c, i) => (
                <th
                  key={i}
                  className="pb-2 pr-2 font-semibold whitespace-nowrap"
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {linhas.map((linha, i) => (
              <tr key={i} className="border-b border-slate-100 last:border-0">
                {linha.map((cell, j) => (
                  <td
                    key={j}
                    className={`py-2 pr-2 ${
                      j === 0 ? "font-medium text-slate-700" : "text-slate-600"
                    }`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StructuredContent({ data }) {
  if (!data || typeof data !== "object") return null;
  if (
    data.tipo === "ranking" &&
    Array.isArray(data.itens) &&
    data.itens.length > 0
  ) {
    return <RankingCard data={data} />;
  }
  if (data.tipo === "kpi" && data.valor !== undefined && data.valor !== null) {
    return <KpiCard data={data} />;
  }
  if (
    data.tipo === "tabela" &&
    Array.isArray(data.colunas) &&
    Array.isArray(data.linhas)
  ) {
    return <TabelaCard data={data} />;
  }
  return null;
}

/* -------------------------------------------------------------------------- */
/*                             Markdown renderer                              */
/* -------------------------------------------------------------------------- */

const mdComponents = {
  p: ({ children }) => (
    <p className="mb-2 last:mb-0 leading-relaxed break-words">{children}</p>
  ),
  strong: ({ children }) => (
    <strong className="font-bold text-slate-900">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  ul: ({ children }) => (
    <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>
  ),
  li: ({ children }) => <li className="text-sm break-words">{children}</li>,
  h1: ({ children }) => (
    <h1 className="font-bold text-base mb-2">{children}</h1>
  ),
  h2: ({ children }) => <h2 className="font-bold text-sm mb-2">{children}</h2>,
  h3: ({ children }) => (
    <h3 className="font-semibold text-sm mb-1">{children}</h3>
  ),
  code: ({ children }) => (
    <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono break-all">
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="bg-slate-100 p-3 rounded-lg overflow-x-auto text-xs font-mono mb-2">
      {children}
    </pre>
  ),
  a: ({ children, href }) => (
    <a
      href={href}
      className="text-blue-600 underline hover:text-blue-800 break-all"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
};

/* -------------------------------------------------------------------------- */
/*                                  Component                                 */
/* -------------------------------------------------------------------------- */

function Support({ isPrivateView = false }) {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const [messages, setMessages] = useState(carregarHistorico);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const abortRef = useRef(null);

  /* ------------------------------- scroll --------------------------------- */

  const scrollToBottom = (behavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    if (!isChatbotOpen) return;
    scrollToBottom();
  }, [messages, isLoading, isChatbotOpen]);

  /* ---------------------------- persistência ------------------------------ */

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
      console.warn("[chat] Não foi possível salvar histórico:", e);
    }
  }, [messages]);

  /* ------------------- teclado: ESC fecha o chat -------------------------- */

  useEffect(() => {
    if (!isChatbotOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") setIsChatbotOpen(false);
    };
    document.addEventListener("keydown", onKey);
    // autofocus no textarea
    const t = setTimeout(() => textareaRef.current?.focus(), 50);
    return () => {
      document.removeEventListener("keydown", onKey);
      clearTimeout(t);
    };
  }, [isChatbotOpen]);

  /* -------------- lock de scroll do body (apenas mobile) ------------------ */

  useEffect(() => {
    if (!isChatbotOpen) return;
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(max-width: 767px)").matches) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [isChatbotOpen]);

  /* --------------------- cleanup: aborta request ao sair ------------------ */

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      abortRef.current = null;
    };
  }, []);

  /* ------------------------------- actions -------------------------------- */

  const toggleChatbot = () => setIsChatbotOpen((v) => !v);

  const handleResetHistorico = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    limparHistorico();
    setMessages([MENSAGEM_INICIAL]);
    setIsLoading(false);
    setInputValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.focus();
    }
  };

  const handleSendMessage = async (overrideText) => {
    const text = (
      typeof overrideText === "string" ? overrideText : inputValue
    ).trim();

    if (text === "" || isLoading) return;

    // Cancela requisição anterior (defensivo)
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const timeoutId = setTimeout(
      () => controller.abort("timeout"),
      REQUEST_TIMEOUT_MS,
    );

    setMessages((prev) => [
      ...prev,
      { sender: "user", text, structured: null, timestamp: Date.now() },
    ]);
    setInputValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.focus();
    }
    setIsLoading(true);

    try {
      const data = await postChatMessage(text, controller.signal);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: typeof data.response === "string" ? data.response : "",
          structured: data.structured ?? null,
          timestamp: Date.now(),
        },
      ]);
    } catch (error) {
      if (error?.name === "AbortError") {
        // Se ainda é a requisição corrente → foi timeout
        if (abortRef.current === controller) {
          setMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: "A resposta demorou demais para chegar. Tente novamente em instantes.",
              structured: null,
              timestamp: Date.now(),
            },
          ]);
        }
        return;
      }

      console.error("Erro de comunicação com o chatbot:", error);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Desculpe, ocorreu um erro de conexão com o servidor. Tente novamente mais tarde.",
          structured: null,
          timestamp: Date.now(),
        },
      ]);
    } finally {
      clearTimeout(timeoutId);
      if (abortRef.current === controller) abortRef.current = null;
      setIsLoading(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInput = (e) => {
    setInputValue(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        120,
      )}px`;
    }
  };

  const handleSuggestion = (text) => {
    handleSendMessage(text);
  };

  /* -------------------------------- render -------------------------------- */

  return (
    <div className="flex h-screen w-full bg-slate-50/50 overflow-hidden text-slate-800">
      <Helmet>
        <title>Suporte</title>
      </Helmet>

      {isPrivateView ? (
        <SidebarPrivate
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      ) : (
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      )}

      <main className="flex-1 flex flex-col h-full w-full overflow-y-auto overflow-x-hidden ml-0 md:ml-[var(--sidebar-width,16rem)] transition-all duration-300">
        {/* HEADER */}
        <header className="px-4 md:px-8 py-3 flex items-center justify-between sticky top-0 z-30 bg-gradient-to-br from-[#4180ab] to-[#054060] backdrop-blur-md shadow-sm border-b border-white/10">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Abrir menu lateral"
              className="md:hidden p-2 text-white bg-white/10 rounded-lg hover:bg-white/20 active:scale-95 transition-all"
            >
              <Menu className="size-6" aria-hidden="true" />
            </button>
            <div className="flex items-center gap-2 text-white">
              <HelpCircle className="size-5 md:size-6" aria-hidden="true" />
              <h2 className="text-base md:text-xl font-bold tracking-wide">
                Administração do Sistema
              </h2>
            </div>
          </div>
        </header>

        <div className="p-4 md:p-8 lg:p-10 w-full max-w-7xl mx-auto space-y-8 pb-24">
          {/* HERO */}
          <section className="bg-[#4180ab] text-white py-12 md:py-16 px-6 lg:px-12 relative overflow-hidden rounded-3xl shadow-xl border border-white/10">
            <div
              className="absolute inset-0 opacity-30 pointer-events-none"
              aria-hidden="true"
            >
              <div className="absolute top-0 left-10 w-40 h-40 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
              <div className="absolute top-0 right-10 w-40 h-40 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
              <div className="absolute -bottom-8 left-20 w-40 h-40 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000" />
            </div>

            <div className="mx-auto flex flex-col lg:flex-row items-center justify-between relative z-10 gap-8 md:gap-12 select-none">
              <div className="lg:w-2/3 text-center lg:text-left">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 leading-tight drop-shadow-sm">
                  Como podemos ajudar?
                </h1>
                <p className="text-blue-100 text-base md:text-lg mb-8 max-w-2xl mx-auto lg:mx-0 font-medium leading-relaxed">
                  Obtenha suporte instantâneo para suas necessidades na
                  plataforma com nossa inteligência artificial.
                </p>
                <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center lg:justify-start">
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-3 flex items-center justify-center gap-3 shadow-sm">
                    <span className="relative flex h-3 w-3" aria-hidden="true">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
                    </span>
                    <span className="font-semibold text-sm md:text-base tracking-wide">
                      Suporte 24/7 Ativo
                    </span>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-3 flex items-center justify-center gap-3 shadow-sm">
                    <IoChatbubbles
                      className="text-blue-300 text-lg"
                      aria-hidden="true"
                    />
                    <span className="font-semibold text-sm md:text-base tracking-wide">
                      Respostas em tempo real
                    </span>
                  </div>
                </div>
              </div>

              <div className="lg:w-1/3 flex justify-center hidden md:flex">
                <button
                  type="button"
                  onClick={toggleChatbot}
                  aria-label="Abrir assistente virtual"
                  className="relative w-56 h-56 flex items-center justify-center group cursor-pointer bg-transparent border-0 p-0 rounded-full focus:outline-none focus-visible:ring-4 focus-visible:ring-white/40"
                >
                  <div className="absolute inset-0 bg-white/5 rounded-full animate-pulse" />
                  <div className="absolute inset-6 bg-white/10 rounded-full group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md border border-white/30 shadow-2xl group-hover:bg-white/30 transition-colors duration-500">
                    <IoChatbubbles
                      className="text-white text-6xl drop-shadow-md group-hover:-translate-y-1 transition-transform duration-300"
                      aria-hidden="true"
                    />
                  </div>
                </button>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <div className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 className="text-2xl font-extrabold text-slate-800 mb-6 flex items-center gap-2 select-none">
              <HelpCircle
                className="text-[#4180ab] size-6"
                aria-hidden="true"
              />
              Dúvidas Frequentes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              {FAQS.map((faq, index) => {
                const isOpen = openFaq === index;
                const contentId = `faq-content-${index}`;
                return (
                  <div
                    key={index}
                    className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all ${
                      isOpen
                        ? "border-[#4180ab]/50 ring-2 ring-[#4180ab]/10"
                        : "border-slate-200"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      aria-expanded={isOpen}
                      aria-controls={contentId}
                      className="w-full flex items-start gap-4 text-left p-5 bg-transparent border-0 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4180ab]/40 cursor-pointer"
                    >
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300 ${
                          isOpen
                            ? "bg-blue-50"
                            : "bg-slate-50 group-hover:bg-slate-100"
                        }`}
                        aria-hidden="true"
                      >
                        <div
                          className={`transition-transform duration-300 ${
                            isOpen ? "scale-110" : "scale-100"
                          }`}
                        >
                          {faq.icon}
                        </div>
                      </div>
                      <div className="flex-1 w-full">
                        <div className="flex justify-between items-start w-full">
                          <h3
                            className={`font-bold text-base md:text-lg pr-4 transition-colors ${
                              isOpen ? "text-[#054060]" : "text-slate-800"
                            }`}
                          >
                            {faq.q}
                          </h3>
                          <ChevronDown
                            className={`size-5 shrink-0 text-slate-400 transition-transform duration-300 ${
                              isOpen ? "rotate-180 text-[#054060]" : ""
                            }`}
                            aria-hidden="true"
                          />
                        </div>
                      </div>
                    </button>
                    <div
                      id={contentId}
                      role="region"
                      className={`grid transition-all duration-300 ease-in-out ${
                        isOpen
                          ? "grid-rows-[1fr] opacity-100"
                          : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p className="text-slate-600 text-sm leading-relaxed px-5 pb-5 md:pl-[84px]">
                          {faq.a}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AVISO */}
          <div className="bg-amber-50 border-l-4 border-amber-500 p-5 md:p-6 flex flex-col gap-2 rounded-xl shadow-sm select-none">
            <h2 className="flex items-center gap-2 text-lg text-amber-700 font-bold">
              <IoWarning size={24} className="shrink-0" aria-hidden="true" />{" "}
              Aviso Importante
            </h2>
            <p className="text-slate-700 leading-relaxed text-sm md:text-base pl-8">
              As respostas do chat automatizado são geradas por uma Inteligência
              Artificial focada no contexto geral da plataforma. Para demandas
              complexas ou específicas, nossa equipe humana está pronta para
              ajudar pelo email:{" "}
              <a
                href="mailto:vigilanciafloriano@gmail.com"
                className="text-amber-700 hover:text-amber-800 font-bold underline underline-offset-2 break-all transition-colors hover:no-underline"
              >
                vigilanciafloriano@gmail.com
              </a>
            </p>
          </div>
        </div>

        {/* FAB */}
        {!isChatbotOpen && (
          <button
            type="button"
            onClick={toggleChatbot}
            aria-label="Abrir suporte por chat"
            className="fixed bottom-6 right-6 md:bottom-8 md:right-8 w-16 h-16 bg-[#4180ab] text-white rounded-full flex items-center justify-center cursor-pointer shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:shadow-[0_8px_30px_rgba(65,128,171,0.45)] transform hover:-translate-y-1 transition-all duration-300 z-50 group focus:outline-none focus-visible:ring-4 focus-visible:ring-white/60"
          >
            <IoChatbubbles
              className="text-3xl group-hover:scale-110 transition-transform duration-300"
              aria-hidden="true"
            />
            <span
              className="absolute top-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"
              aria-hidden="true"
            />
          </button>
        )}

        {/* CHAT */}
        {isChatbotOpen && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Assistente virtual"
            className="fixed inset-0 md:inset-auto md:bottom-8 md:right-8 w-full h-[100dvh] md:h-[600px] md:w-[400px] bg-white md:rounded-3xl shadow-2xl border border-slate-200 z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 duration-300"
          >
            {/* Header do chat */}
            <div className="bg-[#4180ab] p-4 md:p-5 flex justify-between items-center shadow-md z-10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center border border-white/30 backdrop-blur-sm">
                  <IoHardwareChip
                    className="text-white text-xl"
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <h3 className="text-white font-bold text-base leading-none">
                    Assistente Virtual
                  </h3>
                  <span className="text-blue-100 text-xs font-medium flex items-center gap-1.5 mt-1.5">
                    <span
                      className="w-2 h-2 rounded-full bg-green-400 animate-pulse"
                      aria-hidden="true"
                    />{" "}
                    Online
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleResetHistorico}
                  title="Limpar conversa"
                  aria-label="Limpar conversa"
                  className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                >
                  <IoRefresh size={20} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={toggleChatbot}
                  aria-label="Fechar chat"
                  className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                >
                  <IoClose size={24} aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Mensagens */}
            <div
              role="log"
              aria-live="polite"
              aria-atomic="false"
              aria-relevant="additions"
              className="flex-1 p-4 md:p-5 flex flex-col gap-4 overflow-y-auto overflow-x-hidden bg-slate-50/50 scroll-smooth"
            >
              <div className="text-center mb-2">
                <span className="text-xs text-slate-400 font-medium bg-slate-100 px-3 py-1 rounded-full">
                  Hoje
                </span>
              </div>

              {messages.map((msg, index) => {
                const isUser = msg.sender === "user";
                const hasStructured = !isUser && !!msg.structured;
                const time = formatTime(msg.timestamp);

                if (hasStructured) {
                  return (
                    <div key={index} className="flex w-full justify-start">
                      <div className="flex flex-col gap-2 max-w-[85%] w-full">
                        <StructuredContent data={msg.structured} />
                        {msg.text && (
                          <div className="bg-white border border-slate-200 text-slate-700 rounded-2xl rounded-tl-sm p-3.5 text-sm md:text-base shadow-sm break-words">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={mdComponents}
                            >
                              {msg.text}
                            </ReactMarkdown>
                          </div>
                        )}
                        {time && (
                          <span className="text-[10px] text-slate-400 pl-1">
                            {time}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={index}
                    className={`flex flex-col w-full ${
                      isUser ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`p-3.5 text-sm md:text-base max-w-[85%] shadow-sm break-words ${
                        isUser
                          ? "bg-[#054060] text-white rounded-2xl rounded-tr-sm whitespace-pre-wrap"
                          : "bg-white border border-slate-200 text-slate-700 rounded-2xl rounded-tl-sm"
                      }`}
                    >
                      {isUser ? (
                        msg.text
                      ) : (
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={mdComponents}
                        >
                          {msg.text}
                        </ReactMarkdown>
                      )}
                    </div>
                    {time && (
                      <span className="text-[10px] text-slate-400 mt-1 px-1">
                        {time}
                      </span>
                    )}
                  </div>
                );
              })}

              {/* Sugestões rápidas (só quando há apenas a mensagem inicial) */}
              {messages.length === 1 && !isLoading && (
                <div className="flex flex-wrap gap-2 justify-center mt-2 px-2">
                  {SUGGESTIONS.map((s, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSuggestion(s)}
                      className="text-xs bg-white border border-slate-200 rounded-full px-3 py-1.5 text-slate-600 hover:border-[#4180ab] hover:text-[#054060] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4180ab]/40"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {isLoading && (
                <div className="flex w-full justify-start">
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm p-4 shadow-sm flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                    <span
                      className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-slate-100 shrink-0">
              <div className="relative flex items-end gap-2 bg-slate-50 rounded-3xl border border-slate-200 focus-within:border-[#054060] focus-within:ring-2 focus-within:ring-[#054060]/20 transition-all p-1.5 pl-5">
                <textarea
                  ref={textareaRef}
                  rows={1}
                  maxLength={MAX_INPUT_LENGTH}
                  placeholder="Escreva sua mensagem..."
                  value={inputValue}
                  onChange={handleInput}
                  onKeyDown={handleKeyDown}
                  aria-label="Mensagem para o assistente"
                  className="w-full bg-transparent text-slate-800 py-3 pr-2 focus:outline-none text-sm resize-none overflow-y-auto min-h-11 max-h-30 custom-scrollbar"
                />
                <button
                  type="button"
                  onClick={handleSendMessage}
                  disabled={inputValue.trim() === "" || isLoading}
                  aria-label={
                    isLoading ? "Enviando mensagem" : "Enviar mensagem"
                  }
                  className="p-3 bg-[#054060] text-white rounded-full hover:bg-[#03304a] disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center justify-center shrink-0 mb-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#054060]/40"
                >
                  {isLoading ? (
                    <span
                      className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                      aria-hidden="true"
                    />
                  ) : (
                    <IoSend
                      size={18}
                      className="translate-x-0.5"
                      aria-hidden="true"
                    />
                  )}
                </button>
              </div>
              <div className="text-center mt-2">
                <span className="text-[10px] text-slate-400">
                  A IA pode cometer erros. Verifique informações importantes.
                </span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Support;
