import React, { useState, useEffect, useMemo, useRef } from "react";
import SidebarPrivate from "@/components/private/SidebarPrivate";
import { Helmet } from "react-helmet-async";
import {
  Menu,
  Edit,
  Trash2,
  Plus,
  Search,
  RefreshCw,
  Save,
  X,
  Database,
  AlertCircle,
  CheckCircle2,
  Upload,
  FileUp,
  ChevronDown,
  Check,
  BookOpen,
  ChevronUp,
  Info,
  Download,
  FileSpreadsheet,
  FileText,
  FileDown,
} from "lucide-react";

const TABELAS = [
  { id: "dengue", nome: "Dengue", endpoint: "/api/dengue/" },
  { id: "tuberculose", nome: "Tuberculose", endpoint: "/api/tuberculose/" },
  { id: "sifilis", nome: "Sífilis", endpoint: "/api/sifilis/" },
  { id: "chagas", nome: "Chagas", endpoint: "/api/chagas/" },
  {
    id: "violenciadomestica",
    nome: "Violência Doméstica",
    endpoint: "/api/violenciadomestica/",
  },
  { id: "hans", nome: "Hanseníase", endpoint: "/api/hans/" },
  { id: "hepatite", nome: "Hepatite", endpoint: "/api/hepatite/" },
  {
    id: "animaispec",
    nome: "Animais Peçonhentos",
    endpoint: "/api/animaispec/",
  },
  { id: "intoxicacao", nome: "Intoxicação", endpoint: "/api/intoxicacao/" },
  { id: "leish", nome: "Leishmaniose", endpoint: "/api/leish/" },
  { id: "aidsadulta", nome: "AIDS Adulta", endpoint: "/api/aidsadulta/" },
  {
    id: "coberturavacinal",
    nome: "Cobertura Vacinal",
    endpoint: "/api/coberturavacinal/",
  },
];

const BACKEND_KEYS = {
  dengue: "dengue",
  tuberculose: "tuberculose",
  sifilis: "sifilis",
  chagas: "chagas",
  violenciadomestica: "violencia",
  hans: "hanseniase",
  hepatite: "hepatite",
  animaispec: "animais_peconhentos",
  intoxicacao: "intoxicacao",
  leish: "leishmaniose",
  aidsadulta: "aids",
  // coberturavacinal não está em DOENCAS → exportação bloqueada
};

const FORMATOS_EXPORT = [
  {
    id: "xlsx",
    label: "Excel (.xlsx)",
    desc: "Recomendado para planilhas",
    icon: FileSpreadsheet,
    accent: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    id: "csv",
    label: "CSV (.csv)",
    desc: "Texto separado por ponto e vírgula",
    icon: FileText,
    accent: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    id: "dbf",
    label: "DBF (.dbf)",
    desc: "Compatível com SINAN/legado",
    icon: FileDown,
    accent: "text-amber-600",
    bg: "bg-amber-50",
  },
];

const TABLE_SCHEMAS = {
  dengue: [
    "numero_notificacao",
    "id_unidade",
    "nome_paciente",
    "endereco",
    "data_notificacao",
    "data_pri_sintoma",
    "data_nascimento",
    "id_agravo",
    "hospital",
    "cs_sexo",
    "classi_fin",
  ],
  tuberculose: ["id_unidade", "nm_ubs", "ano_notific", "nu_notific"],
  sifilis: [
    "nu_notific",
    "id_unidade",
    "un_saude",
    "nm_ubs",
    "mu_residen",
    "data_notificacao",
    "data_notificacao_precisao",
    "ano_notific",
    "id_agravo",
    "nm_pacient",
  ],
  chagas: ["id_unidade", "nm_ubs", "nu_notific", "ano_notific"],
  violenciadomestica: ["nu_notific", "id_unidade", "nm_ubs", "ano_notific"],
  hans: ["id_unidade", "nm_ubs", "ano_notific", "nu_notific"],
  hepatite: ["nu_notific", "id_unidade", "nm_ubs", "ano_notific"],
  animaispec: ["id_unidade", "nm_ubs", "hospital", "ano_notific", "nu_notific"],
  intoxicacao: [
    "id_unidade",
    "nm_ubs",
    "hospital",
    "ano_notific",
    "nu_notific",
  ],
  leish: ["id_unidade", "nm_ubs", "hospital", "ano_notific", "nu_notific"],
  aidsadulta: ["id_unidade", "nm_ubs", "hospital", "ano_notific", "nu_notific"],
  coberturavacinal: [
    "ano",
    "imunobiologico",
    "cobertura_percentual",
    "meta_otima",
    "data_atualizacao",
  ],
};

const REGRAS_NOMENCLATURA = [
  { prefixo: "deng", tabela: "Dengue", exemplo: "DENGBR26.dbf" },
  { prefixo: "tubercu", tabela: "Tuberculose", exemplo: "TUBERCU26.dbf" },
  { prefixo: "sifi", tabela: "Sífilis", exemplo: "SIFIBR26.dbf" },
  {
    prefixo: "violencia",
    tabela: "Violência Doméstica",
    exemplo: "VIOLENCIA26.dbf",
  },
  { prefixo: "chagas", tabela: "Chagas", exemplo: "CHAGASBR26.dbf" },
  { prefixo: "hans", tabela: "Hanseníase", exemplo: "HANSNET26.dbf" },
  { prefixo: "hepatite", tabela: "Hepatite", exemplo: "HEPATITE26.dbf" },
  {
    prefixo: "animaispec",
    tabela: "Animais Peçonhentos",
    exemplo: "ANIMAISPEC26.dbf",
  },
  {
    prefixo: "intoxicacao",
    tabela: "Intoxicação",
    exemplo: "INTOXICACAO26.dbf",
  },
  { prefixo: "leish", tabela: "Leishmaniose", exemplo: "LEISHBR26.dbf" },
  { prefixo: "aidsadulto", tabela: "AIDS Adulto", exemplo: "AIDSADULTO26.dbf" },
  {
    prefixo: "coberturavacinal",
    tabela: "Cobertura Vacinal",
    exemplo: "cobertura_2026.csv",
  },
];

const getToken = () => {
  return (
    localStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("access_token") ||
    null
  );
};

const getAuthHeaders = (extraHeaders = {}) => {
  const token = getToken();
  return {
    ...extraHeaders,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleAuthError = (status) => {
  if (status === 401) {
    console.warn("Token expirado/inválido. Redirecionando para login...");
    localStorage.removeItem("access_token");
    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");
    sessionStorage.clear();
    window.location.href = "/login";
    return true;
  }
  return false;
};

const isAdminUser = () => {
  try {
    const token =
      localStorage.getItem("access_token") ||
      localStorage.getItem("token") ||
      sessionStorage.getItem("access_token");
    if (!token) return false;

    const payload = JSON.parse(atob(token.split(".")[1]));

    return (
      payload.role === "ADMIN" ||
      payload.role === "admin" ||
      payload.is_superuser === true
    );
  } catch {
    return false;
  }
};

export default function SystemInformation() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [tabelaAtiva, setTabelaAtiva] = useState(TABELAS[0]);
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [editingId, setEditingId] = useState(null);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const [isTableDropdownOpen, setIsTableDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // === Export ===
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(null); // guarda o formato em andamento
  const exportDropdownRef = useRef(null);

  const [mensagem, setMensagem] = useState({ texto: "", tipo: "" });
  const [isDocOpen, setIsDocOpen] = useState(false);

  const baseUrl = import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "";

  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAdmin(isAdminUser());
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsTableDropdownOpen(false);
      }
      if (
        exportDropdownRef.current &&
        !exportDropdownRef.current.contains(event.target)
      ) {
        setIsExportDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const handleSyncGoverno = async () => {
    setIsSyncing(true);
    setMensagem({
      texto:
        "Conectando ao Ministério da Saúde. Isso pode levar alguns segundos...",
      tipo: "sucesso",
    });
    try {
      const response = await fetch(`${baseUrl}/api/sincronizar-governo/`, {
        method: "POST",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
      });
      const data = await response.json();
      if (handleAuthError(response.status)) return;
      if (!response.ok) throw new Error(data.erro || "Falha na sincronização.");
      mostrarMensagem(data.mensagem, "sucesso");
      fetchDados();
    } catch (error) {
      console.error(error);
      mostrarMensagem(
        error.message || "Erro ao sincronizar com a API do SUS.",
        "erro",
      );
    } finally {
      setIsSyncing(false);
    }
  };

  const fetchDados = async () => {
    setLoading(true);
    setMensagem({ texto: "", tipo: "" });
    try {
      const response = await fetch(`${baseUrl}${tabelaAtiva.endpoint}`, {
        method: "GET",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
      });

      if (handleAuthError(response.status)) return;

      if (!response.ok) {
        const errBody = await response.text();
        console.error("Erro na requisição:", response.status, errBody);
        throw new Error(`Erro ${response.status} ao buscar dados`);
      }

      const data = await response.json();
      setDados(data);
    } catch (error) {
      console.error("Erro na requisição:", error);
      mostrarMensagem(
        "Erro ao carregar os dados. Verifique a conexão com o servidor.",
        "erro",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDados();
  }, [tabelaAtiva]);

  const mostrarMensagem = (texto, tipo) => {
    setMensagem({ texto, tipo });
    setTimeout(() => setMensagem({ texto: "", tipo: "" }), 5000);
  };

  const dadosFiltrados = useMemo(() => {
    if (!searchTerm) return dados;
    const lowerSearch = searchTerm.toLowerCase();
    return dados.filter((item) =>
      Object.values(item).some((val) =>
        String(val).toLowerCase().includes(lowerSearch),
      ),
    );
  }, [dados, searchTerm]);

  const colunas = TABLE_SCHEMAS[tabelaAtiva.id] || [];

  const handleOpenModal = (item = null) => {
    if (item) {
      setFormData(item);
      setEditingId(item.id);
    } else {
      const initialData = {};
      colunas.forEach((col) => (initialData[col] = ""));
      setFormData(initialData);
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({});
    setEditingId(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    const url = editingId
      ? `${baseUrl}${tabelaAtiva.endpoint}${editingId}/`
      : `${baseUrl}${tabelaAtiva.endpoint}`;
    const method = editingId ? "PUT" : "POST";
    try {
      const response = await fetch(url, {
        method,
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(formData),
      });

      if (handleAuthError(response.status)) return;

      if (!response.ok) {
        const errBody = await response.text();
        console.error("Erro ao salvar:", response.status, errBody);
        throw new Error("Falha ao salvar o registro.");
      }

      mostrarMensagem(
        `Registro ${editingId ? "atualizado" : "criado"} com sucesso!`,
        "sucesso",
      );
      handleCloseModal();
      fetchDados();
    } catch (error) {
      console.error(error);
      mostrarMensagem("Erro ao salvar o registro.", "erro");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Tem certeza que deseja excluir este registro irreversivelmente?",
      )
    )
      return;
    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}${tabelaAtiva.endpoint}${id}/`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (handleAuthError(response.status)) return;

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("Você não tem permissão para excluir registros.");
        }
        throw new Error("Falha ao excluir.");
      }

      mostrarMensagem("Registro excluído com sucesso!", "sucesso");
      fetchDados();
    } catch (error) {
      console.error(error);
      mostrarMensagem(error.message || "Erro ao excluir o registro.", "erro");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) return;
    setIsUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append("arquivo", uploadFile);
    formDataUpload.append("tabela_destino", tabelaAtiva.id);
    try {
      const response = await fetch(`${baseUrl}/api/upload/`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: formDataUpload,
      });

      if (handleAuthError(response.status)) return;

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(
          data?.erro || "Falha ao importar. Verifique o formato do arquivo.",
        );
      }
      mostrarMensagem(
        data?.mensagem || "Arquivo importado e processado com sucesso!",
        "sucesso",
      );
      setIsImportModalOpen(false);
      setUploadFile(null);
      fetchDados();
    } catch (error) {
      console.error(error);
      mostrarMensagem(
        error.message || "Erro ao importar. Verifique o formato do arquivo.",
        "erro",
      );
    } finally {
      setIsUploading(false);
    }
  };

  // ============================================================ EXPORT
  const handleExport = async (formato) => {
    const backendKey = BACKEND_KEYS[tabelaAtiva.id];
    if (!backendKey) {
      mostrarMensagem(
        `Exportação não disponível para ${tabelaAtiva.nome}.`,
        "erro",
      );
      setIsExportDropdownOpen(false);
      return;
    }

    setIsExporting(formato);
    setMensagem({ texto: "", tipo: "" });

    try {
      const params = new URLSearchParams({ formato });
      const url = `${baseUrl}/api/exportar/${backendKey}/?${params.toString()}`;

      const response = await fetch(url, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (handleAuthError(response.status)) return;

      if (!response.ok) {
        // tenta extrair o JSON de erro do backend
        let erroMsg = `Erro ${response.status} ao exportar`;
        try {
          const body = await response.json();
          if (body?.erro) erroMsg = body.erro;
        } catch {
          /* corpo não era JSON, mantém mensagem padrão */
        }
        throw new Error(erroMsg);
      }

      const blob = await response.blob();

      // Dispara o download via âncora temporária
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `${backendKey}_${new Date().toISOString().slice(0, 10)}.${formato}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);

      mostrarMensagem(
        `${tabelaAtiva.nome} exportada com sucesso como ${formato.toUpperCase()}!`,
        "sucesso",
      );
    } catch (error) {
      console.error("Erro ao exportar:", error);
      mostrarMensagem(error.message || "Erro ao exportar os dados.", "erro");
    } finally {
      setIsExporting(null);
      setIsExportDropdownOpen(false);
    }
  };

  const somenteAdmin = tabelaAtiva.id === "coberturavacinal";
  const podeEditar = !somenteAdmin || isAdmin;
  const podeExportar = Boolean(BACKEND_KEYS[tabelaAtiva.id]);

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden text-slate-800">
      <Helmet>
        <title>Informações do Sistema</title>
      </Helmet>
      <SidebarPrivate
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

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
              <Database className="size-5 md:size-6" />
              <h2 className="text-base md:text-xl font-bold tracking-wide">
                Administração do Sistema
              </h2>
            </div>
          </div>
        </header>

        <div className="p-3 sm:p-4 md:p-8 w-full max-w-[1600px] mx-auto space-y-4 md:space-y-6 animate-in fade-in duration-500 md:-mt-6">
          <div className="flex flex-col gap-3">
            <p className="text-slate-500 text-xs sm:text-sm">
              Visualize, edite, remova e importe dados brutos SINAN do sistema.
            </p>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative w-full sm:w-64" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsTableDropdownOpen(!isTableDropdownOpen)}
                  className={`flex items-center justify-between w-full bg-white border ${
                    isTableDropdownOpen
                      ? "border-[#4180ab] ring-2 ring-[#4180ab]/20"
                      : "border-slate-300"
                  } text-slate-700 rounded-xl px-4 py-2.5 outline-none font-medium shadow-sm transition-all hover:border-[#4180ab]/50 cursor-pointer`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Database className="w-4 h-4 text-[#4180ab] shrink-0" />
                    <span className="truncate text-sm">
                      Tabela: {tabelaAtiva.nome}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-500 transition-transform duration-200 shrink-0 ${
                      isTableDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isTableDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 shadow-xl rounded-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200 max-h-72 overflow-y-auto custom-scrollbar">
                    <div className="p-1">
                      {TABELAS.map((tabela) => {
                        const isSelected = tabelaAtiva.id === tabela.id;
                        return (
                          <button
                            key={tabela.id}
                            onClick={() => {
                              setTabelaAtiva(tabela);
                              setIsTableDropdownOpen(false);
                            }}
                            className={`flex items-center justify-between w-full px-3 py-2.5 text-sm text-left rounded-lg transition-colors cursor-pointer ${
                              isSelected
                                ? "bg-[#4180ab]/10 text-[#4180ab] font-bold"
                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium"
                            }`}
                          >
                            <span className="truncate">{tabela.nome}</span>
                            {isSelected && (
                              <Check className="w-4 h-4 text-[#4180ab]" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={fetchDados}
                disabled={loading}
                className="flex items-center justify-center gap-2 sm:w-auto px-4 py-2.5 bg-white border border-slate-300 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors shadow-sm hover:cursor-pointer disabled:opacity-50 text-sm font-medium"
                title="Atualizar Dados"
              >
                <RefreshCw
                  className={`size-4 ${loading ? "animate-spin text-[#4180ab]" : ""}`}
                />
                <span className="sm:hidden">Atualizar</span>
              </button>
            </div>
          </div>

          {mensagem.texto && (
            <div
              className={`p-3 sm:p-4 rounded-xl flex items-start sm:items-center gap-3 border ${
                mensagem.tipo === "sucesso"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                  : "bg-red-50 border-red-200 text-red-700"
              }`}
            >
              {mensagem.tipo === "sucesso" ? (
                <CheckCircle2 className="size-5 shrink-0 mt-0.5 sm:mt-0" />
              ) : (
                <AlertCircle className="size-5 shrink-0 mt-0.5 sm:mt-0" />
              )}
              <span className="font-medium text-xs sm:text-sm">
                {mensagem.texto}
              </span>
            </div>
          )}

          {/* === MINI DOCUMENTAÇÃO === */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => setIsDocOpen((v) => !v)}
              className="w-full flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 bg-gradient-to-r from-[#4180ab]/5 to-transparent hover:from-[#4180ab]/10 transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 bg-[#4180ab]/10 rounded-lg shrink-0">
                  <BookOpen className="size-4 sm:size-5 text-[#4180ab]" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm sm:text-base font-bold text-slate-800 truncate">
                    Como nomear os arquivos para importação
                  </p>
                  <p className="text-xs sm:text-sm text-slate-500 truncate">
                    Regras de nomenclatura aceitas pelo sistema
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="hidden sm:inline text-xs font-semibold text-[#4180ab] bg-[#4180ab]/10 px-2.5 py-1 rounded-full">
                  {isDocOpen ? "Fechar" : "Ver regras"}
                </span>
                {isDocOpen ? (
                  <ChevronUp className="size-5 text-slate-400" />
                ) : (
                  <ChevronDown className="size-5 text-slate-400" />
                )}
              </div>
            </button>

            {isDocOpen && (
              <div className="border-t border-slate-100 p-4 sm:p-6 space-y-5 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-start gap-3 p-3.5 bg-amber-50 border border-amber-200 rounded-xl">
                  <Info className="size-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs sm:text-sm text-amber-800 leading-relaxed">
                    <p className="font-bold mb-1">
                      O nome do arquivo define em qual tabela os dados serão
                      importados.
                    </p>
                    <p>
                      O sistema identifica a doença pela{" "}
                      <strong>parte inicial do nome do arquivo</strong> (antes
                      da extensão). Se o nome não contiver nenhum dos prefixos
                      da lista abaixo, a importação será recusada.
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                          Prefixo obrigatório
                        </th>
                        <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                          Tabela de destino
                        </th>
                        <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                          Exemplo de arquivo
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {REGRAS_NOMENCLATURA.map((regra) => (
                        <tr
                          key={regra.prefixo}
                          className="hover:bg-slate-50/70 transition-colors"
                        >
                          <td className="px-4 py-2.5 whitespace-nowrap">
                            <code className="px-2 py-1 bg-[#4180ab]/10 text-[#4180ab] text-xs font-bold rounded-md font-mono">
                              {regra.prefixo}
                            </code>
                          </td>
                          <td className="px-4 py-2.5 text-slate-700 font-medium whitespace-nowrap">
                            {regra.tabela}
                          </td>
                          <td className="px-4 py-2.5 text-slate-500 font-mono text-xs whitespace-nowrap">
                            {regra.exemplo}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                      <p className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
                        Válidos
                      </p>
                    </div>
                    <ul className="space-y-1 text-xs sm:text-sm text-emerald-800 font-mono">
                      <li>✅ DENGBR26.dbf</li>
                      <li>✅ dengue.xlsx</li>
                      <li>✅ TUBERCU_2026.xls</li>
                      <li>✅ hans_jan_dez.dbf</li>
                    </ul>
                  </div>

                  <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="size-4 text-red-600 shrink-0" />
                      <p className="text-xs font-bold text-red-800 uppercase tracking-wide">
                        Inválidos
                      </p>
                    </div>
                    <ul className="space-y-1 text-xs sm:text-sm text-red-800 font-mono">
                      <li>❌ planilha_final.xlsx</li>
                      <li>❌ dados_2026.dbf</li>
                      <li>❌ notificacoes.xls</li>
                      <li>❌ arquivo.dbf</li>
                    </ul>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
                    <li className="flex items-start gap-2">
                      <span className="text-[#4180ab] font-bold shrink-0">
                        •
                      </span>
                      <span>
                        <strong>Extensões aceitas:</strong>{" "}
                        <code className="px-1.5 py-0.5 bg-slate-100 rounded text-xs font-mono">
                          .dbf
                        </code>{" "}
                        (padrão SINAN),{" "}
                        <code className="px-1.5 py-0.5 bg-slate-100 rounded text-xs font-mono">
                          .xlsx
                        </code>
                        ,{" "}
                        <code className="px-1.5 py-0.5 bg-slate-100 rounded text-xs font-mono">
                          .xls
                        </code>{" "}
                        (Excel) e{" "}
                        <code className="px-1.5 py-0.5 bg-slate-100 rounded text-xs font-mono">
                          .csv
                        </code>{" "}
                        (CSV).
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#4180ab] font-bold shrink-0">
                        •
                      </span>
                      <span>
                        <strong>Colunas:</strong> para arquivos Excel, os
                        cabeçalhos devem seguir o padrão SINAN (ex:{" "}
                        <code className="px-1.5 py-0.5 bg-slate-100 rounded text-xs font-mono">
                          NU_NOTIFIC
                        </code>
                        ,{" "}
                        <code className="px-1.5 py-0.5 bg-slate-100 rounded text-xs font-mono">
                          NM_PACIENT
                        </code>
                        ,{" "}
                        <code className="px-1.5 py-0.5 bg-slate-100 rounded text-xs font-mono">
                          DT_NOTIFIC
                        </code>
                        ).
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#4180ab] font-bold shrink-0">
                        •
                      </span>
                      <span>
                        <strong>Maiúsculas/minúsculas:</strong> não importa — o
                        sistema normaliza automaticamente.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#4180ab] font-bold shrink-0">
                        •
                      </span>
                      <span>
                        <strong>Dúvidas?</strong> Contate{" "}
                        <a
                          href="mailto:vigilanciafloriano@gmail.com"
                          className="text-[#4180ab] font-semibold hover:underline"
                        >
                          vigilanciafloriano@gmail.com
                        </a>
                        .
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl flex flex-col overflow-hidden md:h-[calc(100vh-280px)] md:min-h-160">
            <div className="p-3 sm:p-4 border-b border-slate-100 flex flex-col gap-3 bg-slate-50/50">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                <input
                  type="text"
                  placeholder="Buscar nos registros..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#4180ab] focus:ring-1 focus:ring-[#4180ab] transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:flex md:flex-row gap-2 w-full md:w-auto md:ml-auto">
                {podeEditar && (
                  <>
                    <button
                      onClick={handleSyncGoverno}
                      disabled={isSyncing}
                      className="w-full md:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium text-sm transition-colors shadow-sm hover:cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isSyncing ? (
                        <RefreshCw className="size-4 animate-spin" />
                      ) : (
                        <Database className="size-4" />
                      )}
                      Sincronizar DataSUS
                    </button>

                    <button
                      onClick={() => setIsImportModalOpen(true)}
                      className="w-full md:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg font-medium text-sm transition-colors shadow-sm hover:cursor-pointer"
                    >
                      <Upload className="size-4 shrink-0" />
                      Importar
                    </button>

                    {/* ===== BOTÃO EXPORTAR (dropdown) ===== */}
                    {podeExportar && (
                      <div
                        className="relative w-full md:w-auto"
                        ref={exportDropdownRef}
                      >
                        <button
                          type="button"
                          onClick={() => setIsExportDropdownOpen((v) => !v)}
                          disabled={!!isExporting || loading}
                          className={`w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2.5 rounded-lg font-medium text-sm transition-colors shadow-sm hover:cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed ${
                            isExportDropdownOpen ? "ring-2 ring-amber-300" : ""
                          }`}
                        >
                          {isExporting ? (
                            <RefreshCw className="size-4 animate-spin" />
                          ) : (
                            <Download className="size-4 shrink-0" />
                          )}
                          {isExporting
                            ? `Exportando ${isExporting.toUpperCase()}...`
                            : "Exportar"}
                          <ChevronDown
                            className={`size-3.5 transition-transform duration-200 ${
                              isExportDropdownOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        {isExportDropdownOpen && (
                          <div className="absolute top-full right-0 mt-2 w-72 bg-white border border-slate-100 shadow-xl rounded-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                            {/* ... (conteúdo do dropdown mantido igual) ... */}
                            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100">
                              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                Formato de exportação
                              </p>
                              <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                                {tabelaAtiva.nome} • {dadosFiltrados.length}{" "}
                                registro(s)
                              </p>
                            </div>

                            <div className="p-1">
                              {FORMATOS_EXPORT.map((fmt) => {
                                const Icon = fmt.icon;
                                const isCurrent = isExporting === fmt.id;
                                return (
                                  <button
                                    key={fmt.id}
                                    onClick={() => handleExport(fmt.id)}
                                    disabled={!!isExporting}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-lg hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
                                  >
                                    <div
                                      className={`p-2 rounded-lg ${fmt.bg} shrink-0 group-hover:scale-105 transition-transform`}
                                    >
                                      {isCurrent ? (
                                        <RefreshCw
                                          className={`size-4 ${fmt.accent} animate-spin`}
                                        />
                                      ) : (
                                        <Icon
                                          className={`size-4 ${fmt.accent}`}
                                        />
                                      )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-sm font-semibold text-slate-800 truncate">
                                        {fmt.label}
                                      </p>
                                      <p className="text-[11px] text-slate-500 truncate">
                                        {fmt.desc}
                                      </p>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>

                            <div className="px-4 py-2 bg-slate-50 border-t border-slate-100">
                              <p className="text-[10px] text-slate-400 leading-relaxed">
                                💡 A exportação respeita o escopo de acesso: UBS
                                exporta somente os próprios registros.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <button
                      onClick={() => handleOpenModal()}
                      className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#4180ab] hover:bg-[#32678c] text-white px-4 py-2.5 rounded-lg font-medium text-sm transition-colors shadow-sm hover:cursor-pointer"
                    >
                      <Plus className="size-4 shrink-0" />
                      Adicionar
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* === MOBILE: Cards === */}
            <div className="md:hidden divide-y divide-slate-100">
              {loading && dados.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm">
                  <RefreshCw className="size-6 animate-spin mx-auto mb-2 text-[#4180ab]" />
                  Carregando registros...
                </div>
              ) : dadosFiltrados.length === 0 ? (
                <div className="p-8 text-center text-slate-400 font-medium text-sm">
                  Nenhum registro encontrado.
                </div>
              ) : (
                dadosFiltrados.map((item) => (
                  <div key={item.id} className="p-4 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center px-2 py-0.5 bg-[#4180ab]/10 text-[#4180ab] text-xs font-bold rounded-md">
                        #{item.id}
                      </span>
                      {podeEditar ? (
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleOpenModal(item)}
                            className="p-2 text-blue-600 bg-blue-50 rounded-lg active:scale-95 transition-transform"
                            title="Editar"
                          >
                            <Edit className="size-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 text-red-600 bg-red-50 rounded-lg active:scale-95 transition-transform"
                            title="Excluir"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-300 text-[10px] italic">
                          somente leitura
                        </span>
                      )}
                    </div>

                    <dl className="grid grid-cols-1 gap-1.5">
                      {colunas.map((col) => (
                        <div
                          key={col}
                          className="flex items-start justify-between gap-3 text-sm"
                        >
                          <dt className="text-slate-500 font-medium shrink-0 text-xs uppercase tracking-wide">
                            {col.replace(/_/g, " ")}
                          </dt>
                          <dd className="text-slate-700 text-right break-words min-w-0">
                            {item[col] || (
                              <span className="text-slate-300 italic">
                                vazio
                              </span>
                            )}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                ))
              )}
            </div>

            {/* === DESKTOP: Tabela === */}
            <div className="hidden md:block flex-1 overflow-auto">
              <table className="w-full text-left border-collapse min-w-200">
                <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200 shadow-sm">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      ID
                    </th>
                    {colunas.map((col) => (
                      <th
                        key={col}
                        className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap"
                      >
                        {col.replace(/_/g, " ")}
                      </th>
                    ))}
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap text-right">
                      AÇÕES
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading && dados.length === 0 ? (
                    <tr>
                      <td
                        colSpan={colunas.length + 2}
                        className="px-6 py-12 text-center text-slate-400"
                      >
                        <RefreshCw className="size-6 animate-spin mx-auto mb-2 text-[#4180ab]" />
                        Carregando registros...
                      </td>
                    </tr>
                  ) : dadosFiltrados.length === 0 ? (
                    <tr>
                      <td
                        colSpan={colunas.length + 2}
                        className="px-6 py-12 text-center text-slate-400 font-medium"
                      >
                        Nenhum registro encontrado.
                      </td>
                    </tr>
                  ) : (
                    dadosFiltrados.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/70 transition-colors group"
                      >
                        <td className="px-6 py-4 text-sm font-semibold text-slate-700 whitespace-nowrap">
                          #{item.id}
                        </td>
                        {colunas.map((col) => (
                          <td
                            key={col}
                            className="px-6 py-4 text-sm text-slate-600 max-w-50 truncate"
                            title={item[col]}
                          >
                            {item[col] || (
                              <span className="text-slate-300 italic">
                                vazio
                              </span>
                            )}
                          </td>
                        ))}
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          {podeEditar ? (
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleOpenModal(item)}
                                className="p-1.5 text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors cursor-pointer"
                                title="Editar"
                              >
                                <Edit className="size-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="p-1.5 text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors cursor-pointer"
                                title="Excluir"
                              >
                                <Trash2 className="size-4" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-300 text-xs italic pr-2">
                              somente leitura
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-3 border-t border-slate-100 bg-slate-50 text-xs text-slate-500 font-medium text-center md:text-left">
              Total de registros: {dadosFiltrados.length}
            </div>
          </div>
        </div>
      </main>

      {/* Modal Import */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-xl w-full sm:max-w-md flex flex-col animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200 max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
                <FileUp className="size-5 text-emerald-600" />
                Importar SINAN
              </h3>
              <button
                onClick={() => {
                  setIsImportModalOpen(false);
                  setUploadFile(null);
                }}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 hover:cursor-pointer p-1.5 rounded-full transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 text-center overflow-y-auto">
              <p className="text-sm text-slate-600 mb-5">
                Selecione um arquivo <strong>.dbf</strong>,{" "}
                <strong>.xls</strong> ou <strong>.xlsx</strong> para popular a
                tabela{" "}
                <strong className="text-[#4180ab]">{tabelaAtiva.nome}</strong>.
              </p>

              <label
                htmlFor="dropzone-file"
                className="flex flex-col items-center justify-center w-full h-36 sm:h-40 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-slate-400" />
                  <p className="mb-1 text-sm text-slate-500 font-semibold">
                    Clique para selecionar
                  </p>
                  <p className="text-xs text-slate-400">
                    DBF, XLS, XLSX ou CSV
                  </p>
                </div>
                <input
                  id="dropzone-file"
                  type="file"
                  className="hidden"
                  accept=".dbf, .xls, .xlsx, .csv"
                  onChange={(e) => setUploadFile(e.target.files[0])}
                />
              </label>

              {uploadFile && (
                <div className="mt-4 p-3 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-lg border border-emerald-100 truncate">
                  {uploadFile.name}
                </div>
              )}
            </div>

            <div className="p-4 sm:p-5 border-t border-slate-100 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 bg-slate-50/50 rounded-b-none sm:rounded-b-2xl">
              <button
                type="button"
                onClick={() => {
                  setIsImportModalOpen(false);
                  setUploadFile(null);
                }}
                className="w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleFileUpload}
                disabled={isUploading || !uploadFile}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <RefreshCw className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                {isUploading ? "Processando..." : "Iniciar Importação"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal CRUD */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-xl w-full sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 shrink-0">
              <h3 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2 truncate pr-2">
                {editingId ? (
                  <Edit className="size-5 text-[#4180ab] shrink-0" />
                ) : (
                  <Plus className="size-5 text-[#4180ab] shrink-0" />
                )}
                <span className="truncate">
                  {editingId ? "Editar Registro" : "Novo Registro"} —{" "}
                  {tabelaAtiva.nome}
                </span>
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-full transition-colors shrink-0"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto flex-1 custom-scrollbar">
              <form
                id="recordForm"
                onSubmit={handleSave}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                {colunas.map((col) => {
                  const label = col.replace(/_/g, " ").toUpperCase();
                  const type =
                    col.includes("data") || col.includes("dt")
                      ? "date"
                      : "text";
                  return (
                    <div key={col} className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 tracking-wide">
                        {label}
                      </label>
                      <input
                        type={type}
                        name={col}
                        value={formData[col] || ""}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-[#4180ab] focus:ring-1 focus:ring-[#4180ab] transition-all"
                        placeholder={`Inserir ${label.toLowerCase()}...`}
                      />
                    </div>
                  );
                })}
              </form>
            </div>

            <div className="p-4 sm:p-5 border-t border-slate-100 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 bg-slate-50/50 shrink-0">
              <button
                type="button"
                onClick={handleCloseModal}
                className="w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="recordForm"
                disabled={loading}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-[#4180ab] rounded-lg hover:bg-[#32678c] hover:cursor-pointer transition-colors disabled:opacity-70"
              >
                {loading ? (
                  <RefreshCw className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                Salvar Dados
              </button>
            </div>
          </div>
        </div>
      )}

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `,
        }}
      />
    </div>
  );
}
