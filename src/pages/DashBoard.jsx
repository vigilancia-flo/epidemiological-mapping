import React, { useEffect, useState, useMemo, useRef } from "react";
import Sidebar from "../components/Sidebar.jsx";
import SidebarPrivate from "@/components/private/SidebarPrivate.jsx";
import { Helmet } from "react-helmet-async";
import {
  Users,
  Activity,
  AlertTriangle,
  MapPin,
  RefreshCw,
  Menu,
  Bell,
  UserCircle,
  CalendarDays,
  ChevronDown,
  Check,
  LayoutDashboard,
} from "lucide-react";
import PatientModal from "../components/Modal/PatientModal.jsx";
import {
  CurvaEpidemica,
  StatusDonut,
  PerfilDemografico,
} from "../components/Modal/DashboardCharts.jsx";
import { formatarBairro } from "@/lib/bairros.js";
import KpisGrid from "../components/KpisGrid.jsx";
import DistribuicaoQuadrante from "../components/DistribuicaoQuadrante.jsx";
import CasosRecentes from "../components/CasosRecentes.jsx";
import DistribuicaoBairro from "@/components/DistribuicaoBairro.jsx";
import EvolucaoMensal from "@/components/EvolucaoMensal.jsx";
import ComparativoMensal from "@/components/ComparativoMensal.jsx";
import TabelaCasos from "@/components/TabelaCasos.jsx";
import { useAuth } from "@/contexts/AuthContext.jsx";
import UserProfileMenu from "@/components/Modal/UserProfileMenu.jsx";
import DashboardSifilis from "./DashboardSifilis.jsx";
import DashboardTuberculose from "./DashBoardTuberculose.jsx";
import DashboardChagas from "./DashBoardChagas.jsx";
import DashboardHanseniase from "./DashBoardHans.jsx";
import DashboardHepatite from "./DashBoardHepa.jsx";
import DashboardViolencia from "./private/DashBoardViolencia.jsx";
import EndemiaSelector from "../components/EndemiasSelector.jsx";
import DashboardAcidentes from "./DashboardAcidentes.jsx";
import DashboardIntoxicacao from "./DashboardIntoxicacao.jsx";
import DashBoardLeishmaniose from "./DashBoardLeishmaniose.jsx";
import DashBoardAids from "./DashBoardAids.jsx";

const getToken = () =>
  localStorage.getItem("access_token") ||
  localStorage.getItem("token") ||
  sessionStorage.getItem("access_token") ||
  null;

const getAuthHeaders = (extra = {}) => {
  const token = getToken();
  return {
    ...extra,
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

// 🔍 Lê o role do usuário direto do payload do JWT
const getUserRole = () => {
  try {
    const token = getToken();
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.role || null;
  } catch {
    return null;
  }
};

const ENDEMIAS = [
  { id: "dengue", nome: "Dengue", endpoint: "/api/dengue/" },
  { id: "sifilis", nome: "Sífilis", endpoint: "/api/sifilis/" },
  { id: "tuberculose", nome: "Tuberculose", endpoint: "/api/tuberculose/" },
  { id: "chagas", nome: "Chagas", endpoint: "/api/chagas/" },
  { id: "hanseniase", nome: "Hanseníase", endpoint: "/api/hans/" },
  { id: "hepatite", nome: "Hepatite", endpoint: "/api/hepatite/" },
  {
    id: "animaispec",
    nome: "Animais Peçonhentos",
    endpoint: "/api/animaispec/",
  },
  {
    id: "intoxicacao",
    nome: "Casos de Intoxicação",
    endpoint: "/api/animaispec/",
  },
  {
    id: "violencia",
    nome: "Violência Doméstica",
    endpoint: "/api/violenciadomestica/",
  },
  {
    id: "leish",
    nome: "Leishmaniose",
    endpoint: "/api/leish/",
  },
  {
    id: "aidsadulta",
    nome: "Aids",
    endpoint: "/api/aidsadulta/",
  },
];

const BAIRRO_PARA_UBS = {
  CENTRO: "UBS Floriano (Centro)",
  SAMBAIBA: "UBS Dirceu Arcoverde",
  "SAMBAIBA VELHA": "UBS Dirceu Arcoverde",
  MANGUINHA: "UBS José Paraguassú",
  "ALTO DA CRUZ": "UBS Theodoro F. Sobral",
  "CAMPO VELHO": "UBS Pedro Simplício",
  "REDE NOVA": "UBS Alfredo de Carvalho",
  TABOCA: "UBS Luiz Tavares",
  "IRAPUA I": "UBS Camilo Filho",
  "IRAPUA II": "UBS Camilo Filho",
  "NOSSA SENHORA DA GUIA": "UBS N. Sra. da Guia",
  TIBERAO: "UBS Raimundo Filho",
  "BOM LUGAR": "UBS Paulo Kalume",
  "BOSQUE SANTA TEREZINHA": "UBS João Elias Oka",
  "CAIXA D AGUA": "UBS Theodoro F. Sobral",
  CAJUEIRO: "UBS João Elias Oka",
  "ALTO DA GUIA": "UBS N. Sra. da Guia",
  CURADOR: "UBS Theodoro F. Sobral",
  IBIAPABA: "UBS Viana de Carvalho",
  "PAU FERRADO": "UBS Paulo Martins",
  "SAO BORJA": "UBS Pedro Simplício",
  "PLANALTO SAMBAIBA": "UBS Dirceu Arcoverde",
  CATUMBI: "UBS Raimundo Filho",
  "SAO CRISTOVAO": "UBS Floriano (Centro)",
  TAMBORIL: "UBS Alfredo de Carvalho",
  "CONJUNTO PARAISO": "UBS Jasmina Bucar",
  CANCELA: "UBS Paulo Kalume",
  CANOAS: "UBS José Paraguassú",
  "PLANALTO BELA VISTA": "UBS Pedro Simplício",
  MELADAO: "UBS Pedro Simplício",
  VIAZUL: "UBS Raimundo Filho",
  "PEDRO SIMPLICIO": "UBS Pedro Simplício",
};

const PERIODO_OPTIONS = [
  { value: "todos", label: "Todo o Período" },
  { value: "ultimoMes", label: "Último Mês" },
  { value: "ultimos3Meses", label: "Últimos 3 Meses" },
  { value: "ultimos6Meses", label: "Últimos 6 Meses" },
  { value: "esteAno", label: "Este Ano" },
  { value: "anoPassado", label: "Ano Passado" },
  { value: "personalizado", label: "Período Específico..." },
];

// 🆕 Skeleton Loader que imita o layout real do dashboard
const DashboardSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    {/* KPIs Skeleton */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 md:p-6 border-l-4 border-l-slate-200"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-2 flex-1">
              <div className="h-4 w-32 bg-slate-200 rounded"></div>
              <div className="h-8 w-20 bg-slate-200 rounded"></div>
            </div>
            <div className="w-12 h-12 bg-slate-200 rounded-xl shrink-0 ml-3"></div>
          </div>
          <div className="mt-4 flex justify-between items-center">
            <div className="h-3 w-24 bg-slate-100 rounded"></div>
            <div className="h-6 w-14 bg-slate-100 rounded-full"></div>
          </div>
        </div>
      ))}
    </div>

    {/* Linha 2: Curva + Donut */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-5 md:p-6">
        <div className="h-5 w-40 bg-slate-200 rounded mb-3"></div>
        <div className="h-4 w-64 bg-slate-100 rounded mb-6"></div>
        <div className="h-52 bg-slate-100 rounded"></div>
      </div>
      <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-100 p-5 md:p-6">
        <div className="h-5 w-32 bg-slate-200 rounded mb-3"></div>
        <div className="h-4 w-48 bg-slate-100 rounded mb-6"></div>
        <div className="h-52 flex items-center justify-center">
          <div className="w-40 h-40 bg-slate-100 rounded-full"></div>
        </div>
      </div>
    </div>

    {/* Linha 3: Perfil + Distribuição + Casos Recentes */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 md:p-6"
        >
          <div className="h-5 w-40 bg-slate-200 rounded mb-3"></div>
          <div className="h-4 w-52 bg-slate-100 rounded mb-6"></div>
          <div className="space-y-3">
            <div className="h-12 bg-slate-100 rounded"></div>
            <div className="h-12 bg-slate-100 rounded"></div>
            <div className="h-12 bg-slate-100 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default function Dashboard({ isPrivateView = false }) {
  const { user } = useAuth();

  // 🌍 Detecta o papel do usuário via JWT
  const role = getUserRole();
  const isUBSView = isPrivateView && role === "UBS";
  const isAdminView =
    isPrivateView && (role === "ADMIN" || user?.is_superuser === true);

  // 🆕 Mostra os gráficos extras pra UBS e Admin
  const showExtraCharts = isUBSView || isAdminView;

  // 🆕 Escopo dos dados: "unidade" pra UBS, "geral" pra admin
  const escopoDados = isUBSView ? "unidade" : "geral";

  const endemiasDisponiveis = isPrivateView
    ? ENDEMIAS
    : ENDEMIAS.filter((endemia) => endemia.id !== "violencia");

  const [endemiaSelecionada, setEndemiaSelecionada] = useState(
    endemiasDisponiveis[0],
  );

  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pacienteSelecionado, setPacienteSelecionado] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  const [isPeriodoDropdownOpen, setIsPeriodoDropdownOpen] = useState(false);
  const periodoDropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        periodoDropdownRef.current &&
        !periodoDropdownRef.current.contains(event.target)
      ) {
        setIsPeriodoDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    let cancelado = false;
    setLoading(true);

    const baseUrl = import.meta.env.VITE_API_URL;
    const url = `${baseUrl}${endemiaSelecionada.endpoint}`;

    fetch(url, {
      method: "GET",
      headers: getAuthHeaders({ "Content-Type": "application/json" }),
    })
      .then((response) => {
        if (handleAuthError(response.status)) return null;

        if (!response.ok) {
          console.error(`Erro ${response.status} em ${url}`);
          throw new Error(`Erro HTTP! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (cancelado || data === null) return;
        setPacientes(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((error) => {
        if (cancelado) return;
        console.error("Erro ao buscar dados:", error);
        setPacientes([]);
        setLoading(false);
      });

    return () => {
      cancelado = true;
    };
  }, [endemiaSelecionada]);

  // Função auxiliar para calcular a variação percentual real
  const calcularVariacao = (atual, anterior) => {
    if (anterior === 0) {
      return atual > 0
        ? { trend: "up", value: "100%" }
        : { trend: "neutral", value: "0%" };
    }
    const variacao = ((atual - anterior) / anterior) * 100;
    return {
      trend: variacao > 0 ? "up" : variacao < 0 ? "down" : "neutral",
      value: `${Math.abs(Math.round(variacao))}%`,
    };
  };

  const pacientesFiltrados = useMemo(() => {
    if (filtroTipo === "todos") return pacientes;

    const hoje = new Date();
    const anoAtual = hoje.getFullYear();
    let dataRefInicio = new Date();
    let dataRefFim = hoje;

    switch (filtroTipo) {
      case "ultimoMes":
        dataRefInicio.setMonth(hoje.getMonth() - 1);
        break;
      case "ultimos3Meses":
        dataRefInicio.setMonth(hoje.getMonth() - 3);
        break;
      case "ultimos6Meses":
        dataRefInicio.setMonth(hoje.getMonth() - 6);
        break;
      case "esteAno":
        dataRefInicio = new Date(anoAtual, 0, 1);
        break;
      case "anoPassado":
        dataRefInicio = new Date(anoAtual - 1, 0, 1);
        dataRefFim = new Date(anoAtual - 1, 11, 31, 23, 59, 59);
        break;
      case "personalizado":
        if (!dataInicio || !dataFim) return pacientes;
        dataRefInicio = new Date(dataInicio + "T00:00:00");
        dataRefFim = new Date(dataFim + "T23:59:59");
        break;
      default:
        return pacientes;
    }

    return pacientes.filter((p) => {
      // 1. Tenta filtrar por data exata (Dengue, Sífilis)
      const dt = p.data_notificacao || p.dt_notific;
      if (dt) {
        const [ano, mes, dia] = dt.split("-");
        const dataNotificacao = new Date(ano, mes - 1, dia);
        return (
          dataNotificacao >= dataRefInicio && dataNotificacao <= dataRefFim
        );
      }

      // 2. Fallback: Filtra por ano (Tuberculose, Chagas, Hanseníase, etc)
      const anoNotific = p.ano_notific || p["ANO NOTIFIC"] || p.ano;
      if (anoNotific) {
        const anoNum = Number(anoNotific);

        if (filtroTipo === "anoPassado") return anoNum === anoAtual - 1;
        if (filtroTipo === "esteAno") return anoNum === anoAtual;

        // Para filtros de meses, se só temos o ano, mostramos se for do ano atual
        if (
          ["ultimoMes", "ultimos3Meses", "ultimos6Meses"].includes(filtroTipo)
        ) {
          return anoNum === anoAtual;
        }

        if (filtroTipo === "personalizado" && dataInicio && dataFim) {
          const anoInicio = new Date(dataInicio).getFullYear();
          const anoFim = new Date(dataFim).getFullYear();
          return anoNum >= anoInicio && anoNum <= anoFim;
        }
      }

      return false; // Se não tem data nem ano, esconde
    });
  }, [pacientes, filtroTipo, dataInicio, dataFim]);

  const pacientesPeriodoAnterior = useMemo(() => {
    if (filtroTipo === "todos") return [];

    const hoje = new Date();
    const anoAtual = hoje.getFullYear();
    let dataRefInicioAnterior = new Date();
    let dataRefFimAnterior = new Date();

    if (filtroTipo === "ultimoMes") {
      dataRefInicioAnterior.setMonth(hoje.getMonth() - 2);
      dataRefFimAnterior.setMonth(hoje.getMonth() - 1);
    } else if (filtroTipo === "ultimos3Meses") {
      dataRefInicioAnterior.setMonth(hoje.getMonth() - 6);
      dataRefFimAnterior.setMonth(hoje.getMonth() - 3);
    } else if (filtroTipo === "ultimos6Meses") {
      dataRefInicioAnterior.setMonth(hoje.getMonth() - 12);
      dataRefFimAnterior.setMonth(hoje.getMonth() - 6);
    } else if (filtroTipo === "esteAno") {
      dataRefInicioAnterior = new Date(anoAtual - 1, 0, 1);
      dataRefFimAnterior = new Date(
        anoAtual - 1,
        hoje.getMonth(),
        hoje.getDate(),
        23,
        59,
        59,
      );
    } else if (filtroTipo === "anoPassado") {
      dataRefInicioAnterior = new Date(anoAtual - 2, 0, 1);
      dataRefFimAnterior = new Date(anoAtual - 2, 11, 31, 23, 59, 59);
    } else if (filtroTipo === "personalizado") {
      if (!dataInicio || !dataFim) return [];
      const dInicio = new Date(dataInicio + "T00:00:00");
      const dFim = new Date(dataFim + "T23:59:59");
      const diffTime = Math.abs(dFim - dInicio);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      dataRefFimAnterior = new Date(dInicio);
      dataRefFimAnterior.setDate(dataRefFimAnterior.getDate() - 1);
      dataRefFimAnterior.setHours(23, 59, 59);

      dataRefInicioAnterior = new Date(dataRefFimAnterior);
      dataRefInicioAnterior.setDate(dataRefInicioAnterior.getDate() - diffDays);
      dataRefInicioAnterior.setHours(0, 0, 0);
    } else {
      return [];
    }

    return pacientes.filter((p) => {
      const dt = p.data_notificacao || p.dt_notific;
      if (dt) {
        const [ano, mes, dia] = dt.split("-");
        const dataNotificacao = new Date(ano, mes - 1, dia);
        return (
          dataNotificacao >= dataRefInicioAnterior &&
          dataNotificacao <= dataRefFimAnterior
        );
      }

      const anoNotific = p.ano_notific || p["ANO NOTIFIC"] || p.ano;
      if (anoNotific) {
        const anoNum = Number(anoNotific);
        if (filtroTipo === "anoPassado") return anoNum === anoAtual - 2;
        if (filtroTipo === "esteAno") return anoNum === anoAtual - 1;

        if (
          ["ultimoMes", "ultimos3Meses", "ultimos6Meses"].includes(filtroTipo)
        ) {
          return anoNum === anoAtual - 1; // Fallback grosseiro para o ano anterior
        }
        if (filtroTipo === "personalizado" && dataInicio && dataFim) {
          const anoInicioAnt = dataRefInicioAnterior.getFullYear();
          const anoFimAnt = dataRefFimAnterior.getFullYear();
          return anoNum >= anoInicioAnt && anoNum <= anoFimAnt;
        }
      }
      return false;
    });
  }, [pacientes, filtroTipo, dataInicio, dataFim]);

  const obterBairroNormalizado = (endereco) => {
    if (!endereco) return "";
    const partes = endereco.split(",");
    let bairroStr = partes[partes.length - 1].trim();
    if (/^[0-9-]+$/.test(bairroStr) && partes.length >= 2) {
      bairroStr = partes[partes.length - 2].trim();
    } else if (/^[0-9-]+$/.test(bairroStr)) {
      return "";
    }
    return bairroStr
      .toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  };

  const extrairBairroVisual = (endereco) => {
    if (!endereco) return "Não informado";
    const partes = endereco.split(",");
    let bairroStr = partes[partes.length - 1].trim();
    if (/^[0-9-]+$/.test(bairroStr) && partes.length >= 2) {
      bairroStr = partes[partes.length - 2].trim();
    } else if (/^[0-9-]+$/.test(bairroStr)) {
      return "CEP Genérico";
    }
    return formatarBairro(bairroStr);
  };

  const casosAlerta = pacientesFiltrados.filter((p) => {
    const classFinal = String(p.classi_fin || "").trim();
    return classFinal === "10" || classFinal === "11";
  }).length;

  // 🆕 Cálculo de alertas do período anterior
  const casosAlertaAnterior = pacientesPeriodoAnterior.filter((p) => {
    const classFinal = String(p.classi_fin || "").trim();
    return classFinal === "10" || classFinal === "11";
  }).length;

  const casosRecentes = [...pacientesFiltrados]
    .sort((a, b) => {
      const dateA = a.data_notificacao || "0000-00-00";
      const dateB = b.data_notificacao || "0000-00-00";
      return dateA !== dateB
        ? dateB.localeCompare(dateA)
        : (b.id || 0) - (a.id || 0);
    })
    .slice(0, 5)
    .map((paciente) => {
      const bairro = extrairBairroVisual(paciente.endereco);
      let ubsTag = "";
      if (endemiaSelecionada.id === "dengue") {
        ubsTag =
          BAIRRO_PARA_UBS[obterBairroNormalizado(paciente.endereco)] ||
          "Não Mapeada";
      } else {
        ubsTag = paciente.nm_ubs || paciente.un_saude || "Não informada";
      }
      const classFinal = String(paciente.classi_fin || "").trim();
      let statusCor = "bg-amber-500";
      if (classFinal === "10" || classFinal === "11") statusCor = "bg-rose-600";
      else if (classFinal === "5") statusCor = "bg-emerald-500";
      else if (classFinal === "8") statusCor = "bg-slate-400";
      return {
        name: `Caso #${paciente.numero_notificacao || "S/N"}`,
        condition: `Sintoma: ${paciente.data_pri_sintoma_display ?? "N/I"} | Sexo: ${paciente.cs_sexo || "N/I"}`,
        ubs: `UBS: ${ubsTag} | ${bairro}`,
        corClassificacao: statusCor,
        dadosOriginais: paciente,
      };
    });

  // 📊 Distribuição por UBS (modo admin / público)
  const contagemUbs = pacientesFiltrados.reduce((acc, paciente) => {
    let ubs = "Não Informada";
    if (endemiaSelecionada.id === "dengue") {
      const bairroNormalizado = obterBairroNormalizado(paciente.endereco);
      ubs = BAIRRO_PARA_UBS[bairroNormalizado] || "Outras Regiões";
    } else {
      const nomeAPI = paciente.nm_ubs || paciente.un_saude;
      if (nomeAPI) ubs = nomeAPI;
    }
    acc[ubs] = (acc[ubs] || 0) + 1;
    return acc;
  }, {});

  const maxCasosUbs = Math.max(...Object.values(contagemUbs), 1);
  const coresDistribuicao = [
    "bg-blue-500",
    "bg-emerald-500",
    "bg-amber-500",
    "bg-rose-500",
    "bg-purple-500",
  ];

  const distribuicaoUbs = Object.entries(contagemUbs)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([nome, valor], index) => ({
      name: nome,
      value: valor,
      max: maxCasosUbs,
      color: coresDistribuicao[index % coresDistribuicao.length],
    }));

  const ubsMaisAfetadaNome =
    Object.keys(contagemUbs).length > 0
      ? Object.keys(contagemUbs).reduce((a, b) =>
          contagemUbs[a] > contagemUbs[b] ? a : b,
        )
      : "Nenhuma";
  const ubsMaisAfetadaValor = contagemUbs[ubsMaisAfetadaNome] || 0;

  // 📍 Distribuição por Bairro (usado só quando é UBS)
  const contagemBairro = pacientesFiltrados.reduce((acc, paciente) => {
    let bairro = "Não informado";
    if (paciente.endereco) {
      bairro = extrairBairroVisual(paciente.endereco);
    } else if (paciente.nm_ubs) {
      bairro = paciente.nm_ubs;
    }
    acc[bairro] = (acc[bairro] || 0) + 1;
    return acc;
  }, {});

  const maxCasosBairro = Math.max(...Object.values(contagemBairro), 1);
  const distribuicaoBairros = Object.entries(contagemBairro)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([nome, valor], index) => ({
      name: nome,
      value: valor,
      max: maxCasosBairro,
      color: coresDistribuicao[index % coresDistribuicao.length],
    }));

  const bairroMaisAfetadoNome =
    Object.keys(contagemBairro).length > 0
      ? Object.keys(contagemBairro).reduce((a, b) =>
          contagemBairro[a] > contagemBairro[b] ? a : b,
        )
      : "Nenhum";
  const bairroMaisAfetadoValor = contagemBairro[bairroMaisAfetadoNome] || 0;

  // 🔢 KPIs do período
  const hoje = new Date();
  const seteDiasAtras = new Date();
  seteDiasAtras.setDate(hoje.getDate() - 7);

  const casosUltimos7Dias = pacientesFiltrados.filter((p) => {
    const dt = p.data_notificacao || p.dt_notific;
    if (!dt) return false;
    const [ano, mes, dia] = dt.split("-");
    const dataNotificacao = new Date(ano, mes - 1, dia);
    return dataNotificacao >= seteDiasAtras && dataNotificacao <= hoje;
  }).length;

  const taxaNovosCasos =
    pacientesFiltrados.length > 0
      ? Math.round((casosUltimos7Dias / pacientesFiltrados.length) * 100)
      : 0;

  const totalNotificacoes =
    endemiaSelecionada.id === "tuberculose"
      ? pacientesFiltrados.reduce(
          (acc, p) => acc + Number(p.nu_notific || 0),
          0,
        )
      : pacientesFiltrados.length;

  // 🆕 Cálculo de notificações do período anterior
  const totalNotificacoesAnterior =
    endemiaSelecionada.id === "tuberculose"
      ? pacientesPeriodoAnterior.reduce(
          (acc, p) => acc + Number(p.nu_notific || 0),
          0,
        )
      : pacientesPeriodoAnterior.length;

  // 🆕 Cálculo de novos casos (últimos 7 dias) do período anterior para tendência
  const catorzeDiasAtras = new Date();
  catorzeDiasAtras.setDate(hoje.getDate() - 14);
  const seteDiasAtrasAnterior = new Date();
  seteDiasAtrasAnterior.setDate(hoje.getDate() - 7);

  const casosUltimos7DiasAnterior = pacientes.filter((p) => {
    const dt = p.data_notificacao || p.dt_notific;
    if (!dt) return false;
    const [ano, mes, dia] = dt.split("-");
    const dataNotificacao = new Date(ano, mes - 1, dia);
    return (
      dataNotificacao >= catorzeDiasAtras &&
      dataNotificacao < seteDiasAtrasAnterior
    );
  }).length;

  const totalNotificacoesBaseAnterior = pacientes.length || 1; // Evita divisão por zero
  const taxaNovosCasosAnterior = Math.round(
    (casosUltimos7DiasAnterior / totalNotificacoesBaseAnterior) * 100,
  );

  // 🆕 Cálculo das tendências reais
  const trendTotal = calcularVariacao(
    totalNotificacoes,
    totalNotificacoesAnterior,
  );
  const trendAlerta = calcularVariacao(casosAlerta, casosAlertaAnterior);
  const trendNovos = calcularVariacao(taxaNovosCasos, taxaNovosCasosAnterior);

  const kpis = [
    {
      title: "Total de Notificações",
      value: totalNotificacoes,
      icon: Users,
      color: "blue",
      subtext: "Registros no período.",
      trend: trendTotal.trend,
      trendValue: trendTotal.value,
    },
    {
      title: "Casos em Alerta (Graves)",
      value: casosAlerta,
      icon: AlertTriangle,
      color: "amber",
      subtext: "Graves/Sinais de alarme.",
      trend: trendAlerta.trend,
      trendValue: trendAlerta.value,
    },
    {
      title: isUBSView ? "Bairro mais Afetado" : "UBS mais Afetada",
      value: isUBSView ? bairroMaisAfetadoNome : ubsMaisAfetadaNome,
      icon: MapPin,
      color: "rose",
      subtext: `${isUBSView ? bairroMaisAfetadoValor : ubsMaisAfetadaValor} casos registrados.`,
      trend: "neutral", // Categorias não têm tendência percentual simples
      trendValue: "0%",
    },
    {
      title: "Últimos Casos (7 dias)",
      value: `${taxaNovosCasos}%`,
      icon: Activity,
      color: "emerald",
      subtext: `${casosUltimos7Dias} casos recentes.`,
      trend: trendNovos.trend,
      trendValue: trendNovos.value,
    },
  ];

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden text-slate-800">
      <Helmet>
        <title>Dados Gerais do Sistema</title>
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
      <div className="flex-1 flex flex-col h-full w-full overflow-y-auto overflow-x-hidden ml-0 md:ml-[var(--sidebar-width,16rem)] transition-all duration-300">
        <header className="px-3 sm:px-4 md:px-8 py-3 flex items-center justify-between sticky top-0 z-30 bg-gradient-to-br from-[#4180ab] to-[#054060] backdrop-blur-md shadow-sm border-b border-white/10 transition-all duration-300">
          <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden shrink-0 group p-2 text-white bg-white/10 rounded-xl hover:bg-white/20 border border-transparent hover:border-white/10 transition-all duration-300"
              aria-label="Abrir menu"
            >
              <Menu className="size-5 sm:size-6 group-hover:scale-110 transition-transform duration-200" />
            </button>

            <div className="flex items-center gap-2 min-w-0">
              <LayoutDashboard className="size-5 md:size-6 text-white shrink-0" />
              <h2 className="text-sm sm:text-base md:text-xl font-bold tracking-wide text-white truncate">
                {isUBSView ? "Painel da Unidade" : "Dados Gerais"}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <UserProfileMenu className="hover:cursor-pointer" />
          </div>
        </header>

        <main className="p-4 md:p-8 space-y-6 w-full max-w-7xl mx-auto overflow-x-hidden">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <p className="text-sm md:text-base text-slate-500 mt-1">
                Acompanhamento epidemiológico dos casos de{" "}
                {endemiaSelecionada.nome}
                {isUBSView ? " na sua unidade" : ""}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div
                  className="relative w-full sm:w-auto min-w-[200px]"
                  ref={periodoDropdownRef}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setIsPeriodoDropdownOpen(!isPeriodoDropdownOpen)
                    }
                    className={`flex items-center justify-between w-full bg-white border ${
                      isPeriodoDropdownOpen
                        ? "border-[#4180ab] ring-2 ring-[#4180ab]/20"
                        : "border-slate-200"
                    } text-slate-700 rounded-lg px-4 py-2.5 outline-none font-medium shadow-sm transition-all hover:border-[#4180ab]/50 cursor-pointer`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <CalendarDays className="w-4 h-4 text-slate-400" />
                      <span className="text-sm truncate">
                        {PERIODO_OPTIONS.find((opt) => opt.value === filtroTipo)
                          ?.label || "Selecione"}
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
                        isPeriodoDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isPeriodoDropdownOpen && (
                    <div className="absolute top-full right-0 sm:left-0 mt-2 w-full sm:w-56 bg-white border border-slate-100 shadow-xl rounded-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                      <div className="p-1 flex flex-col">
                        {PERIODO_OPTIONS.map((opcao) => {
                          const isSelected = filtroTipo === opcao.value;
                          return (
                            <button
                              key={opcao.value}
                              onClick={() => {
                                setFiltroTipo(opcao.value);
                                if (opcao.value !== "personalizado") {
                                  setDataInicio("");
                                  setDataFim("");
                                }
                                setIsPeriodoDropdownOpen(false);
                              }}
                              className={`flex items-center justify-between w-full px-3 py-2.5 text-sm text-left rounded-lg transition-colors cursor-pointer ${
                                isSelected
                                  ? "bg-[#4180ab]/10 text-[#4180ab] font-bold"
                                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium"
                              }`}
                            >
                              <span className="truncate">{opcao.label}</span>
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

                {filtroTipo === "personalizado" && (
                  <div className="flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200 bg-white border border-slate-200 p-1 rounded-lg shadow-sm">
                    <input
                      type="date"
                      value={dataInicio}
                      onChange={(e) => setDataInicio(e.target.value)}
                      className="text-sm text-slate-700 bg-transparent rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#4180ab]/50 hover:bg-slate-50 cursor-pointer"
                    />
                    <span className="text-slate-300 font-medium text-sm">
                      até
                    </span>
                    <input
                      type="date"
                      value={dataFim}
                      onChange={(e) => setDataFim(e.target.value)}
                      className="text-sm text-slate-700 bg-transparent rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#4180ab]/50 hover:bg-slate-50 cursor-pointer"
                    />
                  </div>
                )}
              </div>

              <EndemiaSelector
                options={endemiasDisponiveis}
                value={endemiaSelecionada}
                onChange={setEndemiaSelecionada}
                className={"cursor-pointer bg-amber-400"}
              />
            </div>
          </div>

          {loading ? (
            <DashboardSkeleton />
          ) : (
            <>
              {endemiaSelecionada.id === "violencia" && isPrivateView ? (
                <DashboardViolencia pacientes={pacientesFiltrados} />
              ) : endemiaSelecionada.id === "sifilis" ? (
                <DashboardSifilis
                  pacientes={pacientesFiltrados}
                  distribuicaoUbs={distribuicaoUbs}
                />
              ) : endemiaSelecionada.id === "tuberculose" ? (
                <DashboardTuberculose pacientes={pacientesFiltrados} />
              ) : endemiaSelecionada.id === "chagas" ? (
                <DashboardChagas pacientes={pacientesFiltrados} />
              ) : endemiaSelecionada.id === "hanseniase" ? (
                <DashboardHanseniase pacientes={pacientesFiltrados} />
              ) : endemiaSelecionada.id === "hepatite" ? (
                <DashboardHepatite pacientes={pacientesFiltrados} />
              ) : endemiaSelecionada.id === "animaispec" ? (
                <DashboardAcidentes pacientes={pacientesFiltrados} />
              ) : endemiaSelecionada.id === "intoxicacao" ? (
                <DashboardIntoxicacao pacientes={pacientesFiltrados} />
              ) : endemiaSelecionada.id === "leish" ? (
                <DashBoardLeishmaniose pacientes={pacientesFiltrados} />
              ) : endemiaSelecionada.id === "aidsadulta" ? (
                <DashBoardAids pacientes={pacientesFiltrados} />
              ) : (
                <>
                  <KpisGrid kpis={kpis} />

                  {/* Linha 2: Curva + Donut */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 overflow-hidden w-full">
                      <CurvaEpidemica pacientes={pacientesFiltrados} />
                    </div>
                    <div className="lg:col-span-1 overflow-hidden w-full">
                      <StatusDonut pacientes={pacientesFiltrados} />
                    </div>
                  </div>

                  {/* Linha 3: Perfil + Distribuição + Casos Recentes */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 overflow-hidden w-full">
                      <PerfilDemografico pacientes={pacientesFiltrados} />
                    </div>

                    {isUBSView ? (
                      <DistribuicaoBairro
                        distribuicaoBairros={distribuicaoBairros}
                      />
                    ) : (
                      <DistribuicaoQuadrante
                        distribuicaoUbs={distribuicaoUbs}
                      />
                    )}

                    <CasosRecentes
                      casos={casosRecentes}
                      onSelectPaciente={(paciente) => {
                        setPacienteSelecionado(paciente);
                        setModalAberto(true);
                      }}
                    />
                  </div>

                  {/* 🆕 Linhas extras para UBS e Admin */}
                  {showExtraCharts && (
                    <>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ComparativoMensal
                          pacientes={pacientesFiltrados}
                          escopo={escopoDados}
                        />
                        <EvolucaoMensal
                          pacientes={pacientesFiltrados}
                          escopo={escopoDados}
                        />
                      </div>

                      <TabelaCasos
                        pacientes={pacientesFiltrados}
                        escopo={escopoDados}
                      />
                    </>
                  )}
                </>
              )}
            </>
          )}
        </main>
      </div>

      <PatientModal
        isOpen={modalAberto}
        paciente={pacienteSelecionado}
        onClose={() => setModalAberto(false)}
      />
    </div>
  );
}
