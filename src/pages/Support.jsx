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

const STORAGE_KEY = "epidata_chat_history_v1";

const MENSAGEM_INICIAL = {
  sender: "bot",
  text: "Olá! Sou o seu assistente virtual. Como posso ajudar você hoje?",
  structured: null,
};

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
  } catch (_) {}
}

function RankingCard({ data }) {
  const max = Math.max(...data.itens.map((i) => i.valor), 1);
  const medalhas = ["🥇", "🥈", "🥉"];

  return (
    <div className="rounded-2xl rounded-tl-sm border border-slate-200 bg-white p-4 shadow-sm w-full">
      <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
        📊 {data.titulo}
      </h3>
      <ul className="space-y-2.5">
        {data.itens.map((item, i) => (
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
                style={{ width: `${(item.valor / max) * 100}%` }}
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
  return (
    <div className="rounded-2xl rounded-tl-sm border border-slate-200 bg-white p-4 shadow-sm w-full overflow-hidden">
      <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
        💉 {data.titulo}
      </h3>
      <div className="overflow-x-auto -mx-1">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              {data.colunas.map((c, i) => (
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
            {data.linhas.map((linha, i) => (
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
  if (!data) return null;
  if (data.tipo === "ranking") return <RankingCard data={data} />;
  if (data.tipo === "kpi") return <KpiCard data={data} />;
  if (data.tipo === "tabela") return <TabelaCard data={data} />;
  return null;
}

const mdComponents = {
  p: ({ children }) => (
    <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
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
  li: ({ children }) => <li className="text-sm">{children}</li>,
  h1: ({ children }) => (
    <h1 className="font-bold text-base mb-2">{children}</h1>
  ),
  h2: ({ children }) => <h2 className="font-bold text-sm mb-2">{children}</h2>,
  h3: ({ children }) => (
    <h3 className="font-semibold text-sm mb-1">{children}</h3>
  ),
  code: ({ children }) => (
    <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono">
      {children}
    </code>
  ),
  a: ({ children, href }) => (
    <a
      href={href}
      className="text-blue-600 underline hover:text-blue-800"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
};

function Support({ isPrivateView = false }) {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  // Lazy initializer: lê do sessionStorage só no primeiro render
  const [messages, setMessages] = useState(carregarHistorico);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Persiste no sessionStorage a cada mudança
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
      console.warn("[chat] Não foi possível salvar histórico:", e);
    }
  }, [messages]);

  const toggleChatbot = () => setIsChatbotOpen(!isChatbotOpen);

  const handleResetHistorico = () => {
    limparHistorico();
    setMessages([MENSAGEM_INICIAL]);
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() === "") return;

    const userText = inputValue;

    setMessages((prev) => [
      ...prev,
      { sender: "user", text: userText, structured: null },
    ]);
    setInputValue("");

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    setIsLoading(true);

    try {
      const rawApiUrl = import.meta.env.VITE_API_URL || "";
      const apiUrl = rawApiUrl.replace(/\/+$/, "");

      const response = await fetch(`${apiUrl}/api/chat/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ message: userText }),
      });

      const data = await response.json();

      if (data.status === "success") {
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: data.response,
            structured: data.structured || null,
          },
        ]);
      } else {
        throw new Error("Erro na resposta da API");
      }
    } catch (error) {
      console.error("Erro de comunicação com o chatbot:", error);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Desculpe, ocorreu um erro de conexão com o servidor. Tente novamente mais tarde.",
          structured: null,
        },
      ]);
    } finally {
      setIsLoading(false);
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
      scrollToBottom();
    }
  };

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

        <div className="p-4 md:p-8 lg:p-10 w-full max-w-7xl mx-auto space-y-8 pb-24">
          <section className="bg-[#4180ab] text-white py-12 md:py-16 px-6 lg:px-12 relative overflow-hidden rounded-3xl shadow-xl border border-white/10">
            <div className="absolute inset-0 opacity-30 pointer-events-none">
              <div className="absolute top-0 left-10 w-40 h-40 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
              <div className="absolute top-0 right-10 w-40 h-40 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
              <div className="absolute -bottom-8 left-20 w-40 h-40 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
            </div>

            <div className="mx-auto flex flex-col lg:flex-row items-center justify-between relative z-10 gap-8 md:gap-12">
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
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    <span className="font-semibold text-sm md:text-base tracking-wide">
                      Suporte 24/7 Ativo
                    </span>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-3 flex items-center justify-center gap-3 shadow-sm">
                    <IoChatbubbles className="text-blue-300 text-lg" />
                    <span className="font-semibold text-sm md:text-base tracking-wide">
                      Respostas em tempo real
                    </span>
                  </div>
                </div>
              </div>
              <div className="lg:w-1/3 flex justify-center hidden md:flex">
                <div
                  className="relative w-56 h-56 flex items-center justify-center group cursor-pointer"
                  onClick={toggleChatbot}
                >
                  <div className="absolute inset-0 bg-white/5 rounded-full animate-pulse"></div>
                  <div className="absolute inset-6 bg-white/10 rounded-full group-hover:scale-105 transition-transform duration-500"></div>
                  <div className="absolute inset-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md border border-white/30 shadow-2xl group-hover:bg-white/30 transition-colors duration-500">
                    <IoChatbubbles className="text-white text-6xl drop-shadow-md group-hover:-translate-y-1 transition-transform duration-300" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 className="text-2xl font-extrabold text-slate-800 mb-6 flex items-center gap-2">
              <HelpCircle className="text-[#4180ab] size-6" />
              Dúvidas Frequentes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              {FAQS.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div
                    key={index}
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className={`bg-white rounded-2xl p-5 border shadow-sm hover:shadow-md transition-all cursor-pointer group ${
                      isOpen
                        ? "border-[#4180ab]/50 ring-2 ring-[#4180ab]/10"
                        : "border-slate-200"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300 ${
                          isOpen
                            ? "bg-blue-50"
                            : "bg-slate-50 group-hover:bg-slate-100"
                        }`}
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
                          />
                        </div>
                        <div
                          className={`overflow-hidden transition-all duration-300 ease-in-out ${
                            isOpen
                              ? "max-h-96 mt-3 opacity-100"
                              : "max-h-0 opacity-0"
                          }`}
                        >
                          <p className="text-slate-600 text-sm leading-relaxed">
                            {faq.a}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-amber-50 border-l-4 border-amber-500 p-5 md:p-6 flex flex-col gap-2 rounded-xl shadow-sm">
            <h2 className="flex items-center gap-2 text-lg text-amber-700 font-bold">
              <IoWarning size={24} className="shrink-0" /> Aviso Importante
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

        {!isChatbotOpen && (
          <button
            onClick={toggleChatbot}
            aria-label="Abrir suporte por chat"
            className="fixed bottom-6 right-6 md:bottom-8 md:right-8 w-16 h-16 bg-[#4180ab] text-white rounded-full flex items-center justify-center cursor-pointer shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:shadow-[0_8px_30px_rgb(79,70,229,0.4)] transform hover:-translate-y-1 transition-all duration-300 z-50 group"
          >
            <IoChatbubbles className="text-3xl group-hover:scale-110 transition-transform duration-300" />
            <div className="absolute top-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
          </button>
        )}

        {isChatbotOpen && (
          <div className="fixed inset-0 md:inset-auto md:bottom-8 md:right-8 w-full h-[100dvh] md:h-[600px] md:w-[400px] bg-white md:rounded-3xl shadow-2xl border border-slate-200 z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
            <div className="bg-[#4180ab] p-4 md:p-5 flex justify-between items-center shadow-md z-10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center border border-white/30 backdrop-blur-sm">
                  <IoHardwareChip className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-base leading-none">
                    Assistente Virtual
                  </h3>
                  <span className="text-indigo-200 text-xs font-medium flex items-center gap-1.5 mt-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>{" "}
                    Online
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleResetHistorico}
                  title="Limpar conversa"
                  aria-label="Limpar conversa"
                  className="text-white/70 hover:text-white hover:bg-white/20 rounded-full p-2 transition-colors cursor-pointer"
                >
                  <IoRefresh size={20} />
                </button>
                <button
                  onClick={toggleChatbot}
                  aria-label="Fechar chat"
                  className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-colors cursor-pointer"
                >
                  <IoClose size={24} />
                </button>
              </div>
            </div>

            <div className="flex-1 p-4 md:p-5 flex flex-col gap-4 overflow-y-auto bg-slate-50/50 scroll-smooth">
              <div className="text-center mb-2">
                <span className="text-xs text-slate-400 font-medium bg-slate-100 px-3 py-1 rounded-full">
                  Hoje
                </span>
              </div>

              {messages.map((msg, index) => {
                const isUser = msg.sender === "user";
                const hasStructured = !isUser && !!msg.structured;

                if (hasStructured) {
                  return (
                    <div key={index} className="flex w-full justify-start">
                      <div className="flex flex-col gap-2 max-w-[85%] w-full">
                        <StructuredContent data={msg.structured} />
                        {msg.text && (
                          <div className="bg-white border border-slate-200 text-slate-700 rounded-2xl rounded-tl-sm p-3.5 text-sm md:text-base shadow-sm">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={mdComponents}
                            >
                              {msg.text}
                            </ReactMarkdown>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={index}
                    className={`flex w-full ${
                      isUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`p-3.5 text-sm md:text-base max-w-[85%] shadow-sm ${
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
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex w-full justify-start">
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm p-4 shadow-sm flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                    <span
                      className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></span>
                    <span
                      className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white border-t border-slate-100 flex-shrink-0">
              <div className="relative flex items-end gap-2 bg-slate-50 rounded-3xl border border-slate-200 focus-within:border-[#054060] focus-within:ring-2 focus-within:ring-[#054060]/20 transition-all p-1.5 pl-5">
                <textarea
                  ref={textareaRef}
                  rows={1}
                  placeholder="Escreva sua mensagem..."
                  value={inputValue}
                  onChange={handleInput}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  className="w-full bg-transparent text-slate-800 py-3 pr-2 focus:outline-none text-sm disabled:opacity-50 resize-none overflow-y-auto min-h-[44px] max-h-[120px] custom-scrollbar"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={inputValue.trim() === "" || isLoading}
                  className="p-3 bg-[#054060] text-white rounded-full hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center justify-center shrink-0 mb-0.5"
                >
                  <IoSend size={18} className="translate-x-0.5" />
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
