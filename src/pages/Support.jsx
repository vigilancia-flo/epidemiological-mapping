import { useState, useRef, useEffect, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Sidebar from "../components/Sidebar.jsx";
import SidebarPrivate from "@/components/private/SidebarPrivate.jsx";
import { Helmet } from "react-helmet-async";
import {
  IoChatbubbles,
  IoClose,
  IoSend,
  IoRefresh,
  IoSparkles,
} from "react-icons/io5";
import {
  Menu,
  HelpCircle,
  FileText,
  ShieldCheck,
  Bot,
  AlertTriangle,
  ChevronDown,
  Search,
  Mail,
  ArrowUpRight,
  CheckCircle2,
  X,
  BarChart3,
  Activity,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import Mascote from "../assets/LogoSupport.png";
import Caricatura from "../assets/Caricatura.png";

/* -------------------------------------------------------------------------- */
/*                                   Config                                   */
/* -------------------------------------------------------------------------- */

const FAQS = [
  {
    id: "import-dados",
    category: "Dados & Mapas",
    q: "Como atualizo os dados do mapa?",
    a: "Acesse a aba 'Gerenciar Tabelas', selecione a endemia desejada e clique em 'Importar Arquivo' para subir o relatório atualizado do SINAN (.dbf, .xls ou .csv). O processamento geográfico ocorre automaticamente após a validação das colunas.",
    icon: FileText,
    accent: "text-sky-600 bg-sky-50 border-sky-100",
  },
  {
    id: "casos-alerta",
    category: "Epidemiologia",
    q: "O que significa 'Casos em Alerta'?",
    a: "São casos classificados como graves ou com sinais de alarme no momento da notificação (classificação 10 ou 11 no protocolo SINAN), exigindo atenção prioritária e monitoramento imediato da rede de saúde.",
    icon: AlertTriangle,
    accent: "text-amber-600 bg-amber-50 border-amber-100",
  },
  {
    id: "acesso-restrito",
    category: "Segurança & Acesso",
    q: "Quem tem acesso à Área do Profissional?",
    a: "O acesso é estritamente restrito aos agentes de saúde e coordenadores vinculados à respectiva UBS, utilizando credenciais cadastradas e auditadas previamente pela Secretaria Municipal de Saúde.",
    icon: ShieldCheck,
    accent: "text-emerald-600 bg-emerald-50 border-emerald-100",
  },
  {
    id: "escopo-ia",
    category: "Assistente IA",
    q: "O Assistente Virtual pode dar diagnósticos?",
    a: "Não. A inteligência artificial do SIGEP foi treinada exclusivamente para sanar dúvidas operacionais sobre a plataforma e auxiliar na leitura e cruzamento das métricas epidemiológicas já consolidadas.",
    icon: Bot,
    accent: "text-indigo-600 bg-indigo-50 border-indigo-100",
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
  text: "Olá! Sou o **Assistente Virtual do SIGEP**. Posso ajudar com dúvidas sobre importação de dados do SINAN, leitura de indicadores ou navegação na plataforma. Como posso ajudar?",
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

  return (
    <div className="rounded-2xl rounded-tl-sm border border-slate-200/90 bg-white p-4 shadow-sm w-full">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
        <h3 className="font-semibold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
          <BarChart3 className="size-3.5 text-[#4180ab]" />
          {data.titulo || "Ranking"}
        </h3>
        <span className="text-[10px] font-medium text-slate-400">
          Top {itens.length}
        </span>
      </div>
      <ul className="space-y-3">
        {itens.map((item, i) => {
          const pct = Math.round((Number(item.valor) / max) * 100);
          return (
            <li key={i} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`w-5 h-5 rounded-md flex items-center justify-center text-[11px] font-bold shrink-0 ${
                      i === 0
                        ? "bg-[#054060] text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className="text-slate-700 truncate font-medium">
                    {item.label}
                  </span>
                </div>
                <span className="font-bold text-[#054060] tabular-nums ml-2 shrink-0">
                  {item.valor}
                </span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    i === 0 ? "bg-[#054060]" : "bg-[#4180ab]"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function KpiCard({ data }) {
  return (
    <div className="rounded-2xl rounded-tl-sm border border-[#4180ab]/20 bg-gradient-to-br from-[#054060] to-[#1a5b85] text-white p-4 shadow-sm w-full relative overflow-hidden">
      <Activity className="size-16 text-white/5 absolute -right-2 -bottom-2 pointer-events-none" />
      <p className="text-[11px] uppercase tracking-wider text-sky-200 font-semibold mb-1">
        {data.titulo}
      </p>
      <p className="text-3xl font-extrabold tracking-tight tabular-nums leading-none my-1.5">
        {data.valor}
      </p>
      {data.subtitulo && (
        <p className="text-xs text-sky-100/80 mt-1">{data.subtitulo}</p>
      )}
    </div>
  );
}

function TabelaCard({ data }) {
  const colunas = Array.isArray(data.colunas) ? data.colunas : [];
  const linhas = Array.isArray(data.linhas) ? data.linhas : [];

  return (
    <div className="rounded-2xl rounded-tl-sm border border-slate-200/90 bg-white p-4 shadow-sm w-full overflow-hidden">
      <h3 className="font-semibold text-slate-800 text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5">
        <FileText className="size-3.5 text-[#4180ab]" />
        {data.titulo || "Detalhamento"}
      </h3>
      <div className="overflow-x-auto -mx-1">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-400">
              {colunas.map((c, i) => (
                <th
                  key={i}
                  className="pb-2 pr-3 font-semibold whitespace-nowrap"
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {linhas.map((linha, i) => (
              <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                {linha.map((cell, j) => (
                  <td
                    key={j}
                    className={`py-2 pr-3 tabular-nums ${
                      j === 0
                        ? "font-semibold text-slate-800"
                        : "text-slate-600"
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
    <strong className="font-semibold text-slate-900">{children}</strong>
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
    <h1 className="font-bold text-base mb-2 text-slate-900">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="font-bold text-sm mb-1.5 text-slate-900">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="font-semibold text-sm mb-1 text-slate-900">{children}</h3>
  ),
  code: ({ children }) => (
    <code className="bg-slate-100 text-[#054060] px-1.5 py-0.5 rounded text-xs font-mono break-all">
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="bg-slate-900 text-slate-100 p-3 rounded-xl overflow-x-auto text-xs font-mono mb-2">
      {children}
    </pre>
  ),
  a: ({ children, href }) => (
    <a
      href={href}
      className="text-[#4180ab] font-medium underline underline-offset-2 hover:text-[#054060] break-all"
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
  const [openFaq, setOpenFaq] = useState("import-dados");
  const [searchQuery, setSearchQuery] = useState("");
  const [helpfulVotes, setHelpfulVotes] = useState({});

  const [messages, setMessages] = useState(carregarHistorico);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const abortRef = useRef(null);

  /* -------------------------- filtro da base FAQ -------------------------- */

  const filteredFaqs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return FAQS;
    return FAQS.filter(
      (item) =>
        item.q.toLowerCase().includes(q) ||
        item.a.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q),
    );
  }, [searchQuery]);

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
    const t = setTimeout(() => textareaRef.current?.focus(), 60);
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

  const openChatWithPrompt = (promptText) => {
    setIsChatbotOpen(true);
    if (promptText && promptText.trim()) {
      setTimeout(() => {
        handleSendMessage(promptText);
      }, 150);
    }
  };

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
        if (abortRef.current === controller) {
          setMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: "A resposta demorou mais que o esperado. Por favor, tente novamente em instantes.",
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
          text: "Não foi possível conectar ao servidor no momento. Verifique sua conexão ou tente novamente em alguns instantes.",
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

  /* -------------------------------- render -------------------------------- */

  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] overflow-hidden text-slate-800 antialiased">
      <Helmet>
        <title>Central de Ajuda & Suporte</title>
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
        {/* TOPBAR MINIMALISTA */}
        <header className="px-4 md:px-8 py-3 flex items-center justify-between sticky top-0 z-30 bg-gradient-to-br from-[#4180ab] to-[#054060] backdrop-blur-md shadow-sm border-b border-white/10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 text-white bg-white/10 rounded-lg hover:bg-white/20 active:scale-95 transition-all"
            >
              <Menu className="size-6" />
            </button>
            <div className="flex items-center gap-2 text-white">
              <HelpCircle className="size-5 md:size-6" />
              <h2 className="text-base md:text-xl font-bold tracking-wide">
                Administração do Sistema
              </h2>
            </div>
          </div>
        </header>

        {/* CONTEÚDO PRINCIPAL */}
        <div className="p-4 md:p-8 lg:p-10 w-full max-w-6xl mx-auto space-y-10 pb-28">
          {/* HERO SECTION */}
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#054060] via-[#13547a] to-[#4180ab] text-white p-6 sm:p-10 lg:p-12 shadow-lg border border-white/10">
            {/* Padrão geométrico sutil */}
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
                backgroundSize: "24px 24px",
              }}
              aria-hidden="true"
            />
            <div
              className="absolute -right-24 -top-24 w-80 h-80 rounded-full bg-sky-300/20 blur-3xl pointer-events-none"
              aria-hidden="true"
            />

            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="w-full lg:w-2/3 space-y-5 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-medium text-sky-100">
                  <IoSparkles className="text-sky-300" />
                  <span>Suporte 24/7 com Inteligência Artificial</span>
                </div>

                <h1 className="text-2xl sm:text-4xl lg:text-[42px] font-extrabold tracking-tight leading-[1.15]">
                  Como podemos ajudar você hoje?
                </h1>

                <p className="text-sky-100/90 text-sm sm:text-base max-w-xl mx-auto lg:mx-0 leading-relaxed">
                  Pesquise em nossa base de conhecimento sobre importação do
                  SINAN, indicadores epidemiológicos ou converse em tempo real
                  com nosso assistente.
                </p>

                {/* BARRA DE BUSCA INTEGRADA */}
                <div className="max-w-xl mx-auto lg:mx-0 pt-1">
                  <div className="relative flex items-center bg-white rounded-2xl shadow-xl shadow-slate-950/15 p-1.5 focus-within:ring-4 focus-within:ring-sky-300/40 transition-all">
                    <Search
                      className="size-5 text-slate-400 ml-3 shrink-0"
                      aria-hidden="true"
                    />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar por 'SINAN', 'Casos em Alerta', 'acesso'..."
                      aria-label="Pesquisar dúvidas frequentes"
                      className="w-full bg-transparent text-slate-800 placeholder:text-slate-400 text-sm px-3 py-2.5 focus:outline-none"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        aria-label="Limpar busca"
                        className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                      >
                        <X className="size-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => openChatWithPrompt(searchQuery)}
                      className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#054060] hover:bg-[#03304a] text-white text-xs font-semibold transition-colors shrink-0 cursor-pointer"
                    >
                      <span>Perguntar à IA</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* MASCOTE INTERATIVO */}
              <div className="hidden md:flex lg:w-1/3 justify-center relative">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-52 h-52 rounded-full border border-white/15 animate-[spin_24s_linear_infinite]" />
                  <div className="w-40 h-40 rounded-full bg-white/10 blur-xl" />
                </div>

                <button
                  type="button"
                  onClick={toggleChatbot}
                  aria-label="Iniciar conversa com o mascote assistente"
                  className="relative z-10 group cursor-pointer bg-transparent border-0 p-0 focus:outline-none"
                >
                  <div className="absolute -top-4 -left-4 bg-white text-[#054060] text-xs font-bold px-3.5 py-2 rounded-2xl rounded-br-sm shadow-lg opacity-95 group-hover:-translate-y-1 transition-all duration-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Precisa de ajuda?
                  </div>
                  <img
                    src={Mascote}
                    alt="Mascote SIGEP"
                    className="w-63.75 lg:w-68.75 drop-shadow-2xl group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                </button>
              </div>
            </div>
          </section>

          {/* BASE DE CONHECIMENTO / FAQ */}
          <section aria-labelledby="faq-heading" className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <h2
                  id="faq-heading"
                  className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight"
                >
                  Dúvidas Frequentes
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  Respostas rápidas sobre o funcionamento e as regras da
                  plataforma.
                </p>
              </div>
              {searchQuery && (
                <span className="text-xs font-medium text-slate-500">
                  {filteredFaqs.length}{" "}
                  {filteredFaqs.length === 1
                    ? "resultado encontrado"
                    : "resultados encontrados"}
                </span>
              )}
            </div>

            {filteredFaqs.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200/90 p-8 text-center space-y-4 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
                  <Search className="size-6" />
                </div>
                <div className="max-w-md mx-auto space-y-1">
                  <h3 className="font-bold text-slate-900">
                    Nenhum artigo encontrado para "{searchQuery}"
                  </h3>
                  <p className="text-sm text-slate-500">
                    Você pode enviar essa dúvida diretamente para o nosso
                    Assistente Virtual analisá-la em tempo real.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Limpar filtro
                  </button>
                  <button
                    type="button"
                    onClick={() => openChatWithPrompt(searchQuery)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#054060] text-white text-xs font-semibold hover:bg-[#03304a] transition-colors cursor-pointer"
                  >
                    <IoSparkles className="text-sky-300" />
                    Perguntar ao Assistente
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                {filteredFaqs.map((faq) => {
                  const isOpen = openFaq === faq.id;
                  const contentId = `faq-content-${faq.id}`;
                  const IconComponent = faq.icon;
                  const vote = helpfulVotes[faq.id];

                  return (
                    <article
                      key={faq.id}
                      className={`bg-white rounded-2xl border transition-all duration-200 ${
                        isOpen
                          ? "border-[#4180ab]/40 shadow-md ring-4 ring-[#4180ab]/5"
                          : "border-slate-200/90 shadow-sm hover:border-slate-300"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                        aria-expanded={isOpen}
                        aria-controls={contentId}
                        className="w-full flex items-start gap-4 text-left p-5 bg-transparent border-0 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4180ab]/40 cursor-pointer"
                      >
                        <div
                          className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 transition-transform duration-200 ${
                            faq.accent
                          } ${isOpen ? "scale-105" : ""}`}
                          aria-hidden="true"
                        >
                          <IconComponent className="size-5" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <span className="inline-block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                            {faq.category}
                          </span>
                          <div className="flex justify-between items-start gap-3">
                            <h3
                              className={`font-bold text-base leading-snug transition-colors ${
                                isOpen ? "text-[#054060]" : "text-slate-800"
                              }`}
                            >
                              {faq.q}
                            </h3>
                            <ChevronDown
                              className={`size-5 shrink-0 text-slate-400 mt-0.5 transition-transform duration-300 ${
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
                          <div className="px-5 pb-5 sm:pl-[80px] space-y-4">
                            <p className="text-slate-600 text-sm leading-relaxed">
                              {faq.a}
                            </p>

                            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                              <span>Esta resposta foi útil?</span>
                              {vote ? (
                                <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                                  <CheckCircle2 className="size-3.5" />
                                  Obrigado pelo feedback!
                                </span>
                              ) : (
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setHelpfulVotes((v) => ({
                                        ...v,
                                        [faq.id]: "yes",
                                      }))
                                    }
                                    aria-label="Marcar como útil"
                                    className="p-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
                                  >
                                    <ThumbsUp className="size-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setHelpfulVotes((v) => ({
                                        ...v,
                                        [faq.id]: "no",
                                      }))
                                    }
                                    aria-label="Marcar como não útil"
                                    className="p-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
                                  >
                                    <ThumbsDown className="size-3.5" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          {/* RODAPÉ DE ESCALONAMENTO / SUPORTE HUMANO */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm flex flex-col sm:flex-row items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200/70 text-amber-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="size-5" aria-hidden="true" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-slate-900">
                  Sobre as respostas da Inteligência Artificial
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  O assistente automatizado utiliza IA generativa treinada no
                  contexto operacional do SIGEP. Ele não substitui protocolos
                  clínicos oficiais nem realiza diagnósticos médicos.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm flex flex-col justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#4180ab]">
                  Suporte Técnico Especializado
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Precisa de atendimento humano?
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Para cadastro de credenciais UBS ou falhas na base SINAN.
                </p>
              </div>
              <a
                href="mailto:vigilanciafloriano@gmail.com"
                className="inline-flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-xs font-semibold text-slate-800 transition-colors group"
              >
                <span className="flex items-center gap-2 truncate">
                  <Mail className="size-4 text-[#4180ab] shrink-0" />
                  <span className="truncate">vigilanciafloriano@gmail.com</span>
                </span>
                <ArrowUpRight className="size-4 text-slate-400 group-hover:text-slate-700 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </div>
          </section>
        </div>

        {/* FLOATING ACTION BUTTON (FAB) */}
        {!isChatbotOpen && (
          <button
            type="button"
            onClick={toggleChatbot}
            aria-label="Abrir assistente virtual"
            className="fixed bottom-5 right-5 md:bottom-7 md:right-7 h-14 px-4 md:px-5 bg-[#054060] hover:bg-[#03304a] text-white rounded-full flex items-center gap-3 cursor-pointer shadow-[0_12px_32px_rgba(5,64,96,0.3)] hover:shadow-[0_16px_36px_rgba(5,64,96,0.4)] hover:-translate-y-0.5 transition-all duration-200 z-40 group focus:outline-none focus-visible:ring-4 focus-visible:ring-[#4180ab]/40"
          >
            <div className="relative flex items-center justify-center">
              <IoChatbubbles className="text-2xl text-sky-200 group-hover:scale-110 transition-transform" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#054060]" />
            </div>
            <span className="hidden sm:inline text-sm font-semibold tracking-tight pr-1">
              Tirar dúvida
            </span>
          </button>
        )}

        {/* JANELA DO CHAT CONCIERGE */}
        {isChatbotOpen && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Assistente virtual SIGEP"
            className="fixed inset-0 md:inset-auto md:bottom-7 md:right-7 w-full h-[100dvh] md:h-[620px] md:w-[420px] bg-white md:rounded-3xl shadow-[0_24px_60px_rgba(15,23,42,0.22)] border border-slate-200/90 z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 duration-200"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#054060] to-[#1a5b85] px-4 py-3.5 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center ring-2 ring-white/30 shadow-sm overflow-hidden">
                    <img
                      src={Caricatura}
                      alt="Avatar do Assistente"
                      className="w-full h-full object-cover object-top scale-110"
                    />
                  </div>
                  <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[#054060]" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-white font-bold text-sm leading-none">
                      Assistente SIGEP
                    </h3>
                    <span className="px-1.5 py-0.5 rounded bg-white/15 text-[10px] font-semibold text-sky-100 uppercase tracking-wider">
                      IA
                    </span>
                  </div>
                  <p className="text-sky-100/85 text-xs mt-1">
                    Online • Responde instantaneamente
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleResetHistorico}
                  title="Reiniciar conversa"
                  aria-label="Reiniciar conversa"
                  className="text-white/80 hover:text-white hover:bg-white/15 rounded-xl p-2 transition-colors cursor-pointer"
                >
                  <IoRefresh size={18} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={toggleChatbot}
                  aria-label="Fechar assistente"
                  className="text-white/80 hover:text-white hover:bg-white/15 rounded-xl p-2 transition-colors cursor-pointer"
                >
                  <IoClose size={22} aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Área de mensagens */}
            <div
              role="log"
              aria-live="polite"
              aria-atomic="false"
              aria-relevant="additions"
              className="flex-1 px-4 py-5 flex flex-col gap-4 overflow-y-auto overflow-x-hidden bg-[#F8FAFC] scroll-smooth"
            >
              <div className="flex justify-center">
                <span className="text-[11px] text-slate-400 font-medium bg-white border border-slate-200/70 px-3 py-0.5 rounded-full shadow-2xs">
                  Sessão atual
                </span>
              </div>

              {messages.map((msg, index) => {
                const isUser = msg.sender === "user";
                const hasStructured = !isUser && !!msg.structured;
                const time = formatTime(msg.timestamp);

                if (isUser) {
                  return (
                    <div key={index} className="flex flex-col items-end w-full">
                      <div className="bg-[#054060] text-white rounded-2xl rounded-tr-sm px-4 py-3 text-sm max-w-[82%] shadow-xs break-words whitespace-pre-wrap leading-relaxed">
                        {msg.text}
                      </div>
                      {time && (
                        <span className="text-[10px] text-slate-400 mt-1 px-1 tabular-nums">
                          {time}
                        </span>
                      )}
                    </div>
                  );
                }

                return (
                  <div
                    key={index}
                    className="flex items-start gap-2.5 w-full justify-start"
                  >
                    <img
                      src={Caricatura}
                      alt=""
                      aria-hidden="true"
                      className="w-7 h-7 rounded-full object-cover object-top bg-white border border-slate-200 shrink-0 mt-0.5"
                    />
                    <div className="flex flex-col gap-2 max-w-[85%] w-full">
                      {hasStructured && (
                        <StructuredContent data={msg.structured} />
                      )}
                      {msg.text && (
                        <div className="bg-white border border-slate-200/90 text-slate-700 rounded-2xl rounded-tl-sm px-4 py-3 text-sm shadow-2xs break-words">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={mdComponents}
                          >
                            {msg.text}
                          </ReactMarkdown>
                        </div>
                      )}
                      {time && (
                        <span className="text-[10px] text-slate-400 pl-1 tabular-nums">
                          {time}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Sugestões iniciais */}
              {messages.length === 1 && !isLoading && (
                <div className="pt-1 pl-9 flex flex-col items-start gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Sugestões rápidas
                  </span>
                  <div className="flex flex-col gap-1.5 w-full">
                    {SUGGESTIONS.map((s, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSendMessage(s)}
                        className="text-left text-xs bg-white border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-slate-700 hover:border-[#4180ab] hover:bg-sky-50/40 hover:text-[#054060] transition-all cursor-pointer flex items-center justify-between group"
                      >
                        <span>{s}</span>
                        <ArrowUpRight className="size-3.5 text-slate-300 group-hover:text-[#4180ab] shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Indicador de digitação */}
              {isLoading && (
                <div className="flex items-start gap-2.5 w-full">
                  <img
                    src={Caricatura}
                    alt=""
                    aria-hidden="true"
                    className="w-7 h-7 rounded-full object-cover object-top bg-white border border-slate-200 shrink-0 mt-0.5"
                  />
                  <div className="bg-white border border-slate-200/90 rounded-2xl rounded-tl-sm px-4 py-3.5 shadow-2xs flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-[#4180ab] rounded-full animate-bounce" />
                    <span
                      className="w-1.5 h-1.5 bg-[#4180ab] rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="w-1.5 h-1.5 bg-[#4180ab] rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Composer */}
            <div className="p-3.5 bg-white border-t border-slate-200/80 shrink-0">
              <div className="relative flex items-end gap-2 bg-slate-50 rounded-2xl border border-slate-200 focus-within:bg-white focus-within:border-[#4180ab] focus-within:ring-4 focus-within:ring-[#4180ab]/10 transition-all p-1.5 pl-3.5">
                <textarea
                  ref={textareaRef}
                  rows={1}
                  maxLength={MAX_INPUT_LENGTH}
                  placeholder="Digite sua dúvida sobre o SIGEP..."
                  value={inputValue}
                  onChange={handleInput}
                  onKeyDown={handleKeyDown}
                  aria-label="Mensagem para o assistente"
                  className="w-full bg-transparent text-slate-800 placeholder:text-slate-400 py-2 pr-1 focus:outline-none text-sm resize-none overflow-y-auto min-h-[40px] max-h-[120px] custom-scrollbar"
                />
                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  disabled={inputValue.trim() === "" || isLoading}
                  aria-label={
                    isLoading ? "Enviando mensagem" : "Enviar mensagem"
                  }
                  className="w-9 h-9 bg-[#054060] text-white rounded-xl hover:bg-[#03304a] disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center shrink-0 mb-0.5 cursor-pointer"
                >
                  {isLoading ? (
                    <span
                      className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                      aria-hidden="true"
                    />
                  ) : (
                    <IoSend
                      size={15}
                      className="translate-x-0.5"
                      aria-hidden="true"
                    />
                  )}
                </button>
              </div>
              <div className="flex items-center justify-between mt-2 px-1">
                <span className="text-[10px] text-slate-400">
                  Enter envia • Shift+Enter quebra linha
                </span>
                {inputValue.length > MAX_INPUT_LENGTH * 0.8 && (
                  <span className="text-[10px] text-amber-600 font-medium tabular-nums">
                    {inputValue.length}/{MAX_INPUT_LENGTH}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Support;
