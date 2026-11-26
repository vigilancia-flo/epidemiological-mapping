import React, { useState, useEffect, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import SidebarPrivate from "@/components/private/SidebarPrivate.jsx";
import {
  ShieldCheck,
  CheckCircle2,
  Activity,
  Baby,
  Syringe,
  Smile,
  User,
  Menu,
  Info,
  Sparkles,
  TrendingUp,
  Zap,
  Target,
  AlertTriangle,
  Award,
} from "lucide-react";

/* ============================== HELPERS ============================== */

const normalizar = (s) =>
  String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/^vacina\s+/i, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const contemTermo = (nomeNormalizado, termo) => {
  const palavrasTermo = normalizar(termo).split(/\s+/).filter(Boolean);
  if (palavrasTermo.length === 0) return false;
  const palavrasNome = new Set(nomeNormalizado.split(/\s+/).filter(Boolean));
  return palavrasTermo.every((p) => palavrasNome.has(p));
};

const EXCLUSAO_GLOBAL = [
  "adulto",
  "antitetano",
  "imunoglobulina",
  "raiva",
  "influenza",
  "covid",
];

const FAIXAS_ETARIAS = {
  "Ao Nascer": {
    include: ["bcg", "hepatite b"],
  },

  "Menores de 1 ano de idade": {
    include: [
      "febre amarela",
      "poliomielite",
      "pneumococica",
      "meningococica",
      "penta",
      "rotavirus",
    ],
    exclude: ["reforco"],
  },

  "1 ano de idade": {
    include: [
      "hepatite a",
      "dtp 1 reforco",
      "triplice viral 1 dose",
      "triplice viral 2 dose",
      "pneumococica 1 reforco",
      "poliomielite 1 reforco",
      "meningococica 1 reforco",
      "varicela",
    ],
    exclude: ["varicela 2 dose"],
  },

  "4 anos de idade": {
    include: [
      "dtp 2 reforco",
      "varicela 2 dose",
      "poliomielite 2 reforco",
      "febre amarela reforco",
    ],
  },
};

const TABS_ICONS = {
  "Ao Nascer": Baby,
  "Menores de 1 ano de idade": Syringe,
  "1 ano de idade": Smile,
  "4 anos de idade": User,
};

const FAIXA_ACCENTS = {
  "Ao Nascer": {
    from: "from-rose-500/15",
    to: "to-pink-500/5",
    iconBg: "from-rose-50 to-pink-100",
    iconRing: "ring-rose-500/15",
    iconHoverRing: "group-hover:ring-rose-500/40",
    iconColor: "text-rose-600",
    iconShadow: "group-hover:shadow-rose-500/25",
  },
  "Menores de 1 ano de idade": {
    from: "from-sky-500/15",
    to: "to-blue-500/5",
    iconBg: "from-sky-50 to-blue-100",
    iconRing: "ring-sky-500/15",
    iconHoverRing: "group-hover:ring-sky-500/40",
    iconColor: "text-sky-600",
    iconShadow: "group-hover:shadow-sky-500/25",
  },
  "1 ano de idade": {
    from: "from-amber-500/15",
    to: "to-orange-500/5",
    iconBg: "from-amber-50 to-orange-100",
    iconRing: "ring-amber-500/15",
    iconHoverRing: "group-hover:ring-amber-500/40",
    iconColor: "text-amber-600",
    iconShadow: "group-hover:shadow-amber-500/25",
  },
  "4 anos de idade": {
    from: "from-emerald-500/15",
    to: "to-teal-500/5",
    iconBg: "from-emerald-50 to-teal-100",
    iconRing: "ring-emerald-500/15",
    iconHoverRing: "group-hover:ring-emerald-500/40",
    iconColor: "text-emerald-600",
    iconShadow: "group-hover:shadow-emerald-500/25",
  },
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

function matchFaixa(imunobiologico, regra) {
  const nome = normalizar(imunobiologico);

  if (EXCLUSAO_GLOBAL.some((ex) => contemTermo(nome, ex))) {
    return false;
  }

  if (regra.exclude?.some((ex) => contemTermo(nome, ex))) {
    return false;
  }

  return regra.include.some((inc) => contemTermo(nome, inc));
}

/* ============================== PROGRESS BAR ============================== */

function ProgressBarMS({ percentual, meta }) {
  const isMetaAtingida = percentual >= meta;
  let corBarra = "from-[#1d4ed8] via-[#2563eb] to-[#0a7ea3]";
  let glow = "shadow-[#1d4ed8]/50";

  if (!isMetaAtingida) {
    if (percentual <= 20) {
      corBarra = "from-[#7f1d1d] to-[#dc2626]";
      glow = "shadow-rose-900/40";
    } else if (percentual <= 40) {
      corBarra = "from-[#e11d48] to-[#f43f5e]";
      glow = "shadow-rose-500/40";
    } else if (percentual <= 60) {
      corBarra = "from-[#f59e0b] to-[#fbbf24]";
      glow = "shadow-amber-500/40";
    } else if (percentual <= 80) {
      corBarra = "from-[#eab308] to-[#facc15]";
      glow = "shadow-yellow-500/40";
    } else {
      corBarra = "from-[#10b981] to-[#34d399]";
      glow = "shadow-emerald-500/40";
    }
  }

  return (
    <div className="w-full bg-slate-200/80 rounded-full h-2.5 mt-2 overflow-hidden relative ring-1 ring-inset ring-slate-300/30">
      <div
        className={`bg-linear-to-r ${corBarra} h-2.5 rounded-full transition-all duration-1000 relative overflow-hidden shadow-sm ${glow}`}
        style={{ width: `${Math.min(percentual, 100)}%` }}
      >
        <span className="absolute inset-0 bg-linear-to-r from-transparent via-white/50 to-transparent animate-bar-shimmer" />
      </div>
    </div>
  );
}

/* ============================== VACINA CARD ============================== */

function VacinaCard({ dados }) {
  const isMetaAtingida = dados.cobertura_percentual >= dados.meta_otima;
  const nomeExibicao = dados.imunobiologico
    .replace(/^vacina /i, "")
    .replace("adsorvida difteria, tétano e pertussis", "Penta (DTP/HepB/Hib)");

  const percentual = Number(dados.cobertura_percentual || 0);
  const meta = Number(dados.meta_otima || 95);

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl bg-white p-5 flex flex-col justify-between h-48 shadow-[0_4px_20px_-8px_rgba(5,64,96,0.15)] border-2 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_25px_50px_-15px_rgba(5,64,96,0.35)] ${
        isMetaAtingida
          ? "border-[#1d4ed8]/60"
          : "border-slate-200/80 hover:border-[#1d4ed8]/40"
      }`}
    >
      {/* Gradient wash */}
      <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-[#054060]/5 via-transparent to-[#0a7ea3]/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      {/* Shine sweep */}
      <div className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/60 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />

      {/* Corner glow */}
      {isMetaAtingida && (
        <div className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-[#1d4ed8]/20 blur-3xl animate-glow-pulse" />
      )}

      <div className="relative flex justify-between items-start">
        <div className="pr-14">
          <h3 className="font-bold text-slate-800 text-[15px] leading-tight capitalize transition-colors duration-300 group-hover:text-[#054060]">
            {nomeExibicao}
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Meta ótima{" "}
            <span className="font-bold text-[#054060]">
              {dados.meta_otima}%
            </span>
          </p>
        </div>

        {isMetaAtingida && (
          <div className="absolute top-0 right-0 flex flex-col items-center justify-center bg-linear-to-br from-[#1d4ed8] via-[#2563eb] to-[#0a7ea3] text-white rounded-full w-12 h-12 shadow-lg shadow-[#1d4ed8]/40 border-2 border-white animate-badge-pop">
            <span className="text-[6px] font-bold mt-0.5">META</span>
            <CheckCircle2 className="size-4" />
            <span className="text-[5px] font-bold mb-0.5">ATINGIDA</span>
          </div>
        )}
      </div>

      <div className="relative flex flex-col items-end mt-auto">
        <h4 className="text-3xl font-black mb-1 bg-linear-to-r from-[#054060] via-[#0a7ea3] to-[#054060] bg-[length:200%_auto] bg-clip-text text-transparent animate-gradient-x">
          {percentual.toFixed(2).replace(".", ",")}%
        </h4>
        <ProgressBarMS percentual={percentual} meta={meta} />
      </div>
    </div>
  );
}

/* ============================== KPI CARD ============================== */

function KpiCard({ icon: Icon, label, value, accent, iconColor, delay }) {
  return (
    <div
      className="group relative overflow-hidden rounded-2xl border border-white/80 bg-white/90 p-4 shadow-[0_4px_20px_-10px_rgba(5,64,96,0.2)] backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(5,64,96,0.3)] animate-kpi-in"
      style={{ animationDelay: delay }}
    >
      <div
        className={`pointer-events-none absolute inset-0 bg-linear-to-br ${accent} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
      />
      <div className="pointer-events-none absolute -right-8 -top-8 size-24 rounded-full bg-current opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-15 ${iconColor}" />

      <div className="relative flex items-center gap-3">
        <div
          className={`flex size-11 shrink-0 items-center justify-center rounded-xl bg-white ring-1 ring-inset ring-slate-200/60 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 ${iconColor}`}
        >
          <Icon className="size-5" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
            {label}
          </p>
          <p className="text-2xl font-black text-slate-800 leading-tight">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ============================== MAIN ============================== */

export default function DashboardCoberturaVacinal({ isPrivateView = true }) {
  const [dadosVacinais, setDadosVacinais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const anoVigente = 2026;
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAdmin(isAdminUser());
  }, []);

  useEffect(() => {
    const fetchDados = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_URL;
        const token =
          localStorage.getItem("access_token") ||
          localStorage.getItem("token") ||
          sessionStorage.getItem("access_token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const response = await fetch(`${baseUrl}/api/coberturavacinal/`, {
          headers,
        });
        if (!response.ok) {
          throw new Error(`Erro ${response.status} ao buscar dados`);
        }
        const data = await response.json();
        console.log("[CoberturaVacinal] registros:", data.length);
        console.log("[CoberturaVacinal] anos:", [
          ...new Set(data.map((d) => d.ano)),
        ]);
        console.log(
          "[CoberturaVacinal] vacinas do ano:",
          data
            .filter((d) => Number(d.ano) === anoVigente)
            .map((d) => d.imunobiologico),
        );

        setDadosVacinais(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("[CoberturaVacinal] erro:", error);
        setErro(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDados();
  }, []);

  const dadosAno = useMemo(
    () => dadosVacinais.filter((d) => Number(d.ano) === anoVigente),
    [dadosVacinais],
  );

  const vacinasNaoAlocadas = useMemo(() => {
    const alocadas = new Set();
    Object.values(FAIXAS_ETARIAS).forEach((regra) => {
      dadosAno.forEach((d) => {
        if (matchFaixa(d.imunobiologico, regra)) {
          alocadas.add(d.imunobiologico);
        }
      });
    });
    return dadosAno
      .filter((d) => !alocadas.has(d.imunobiologico))
      .map((d) => d.imunobiologico);
  }, [dadosAno]);

  /* KPIs agregados */
  const stats = useMemo(() => {
    let atingidas = 0;
    let emProgresso = 0;
    let criticas = 0;
    dadosAno.forEach((d) => {
      const p = Number(d.cobertura_percentual || 0);
      const m = Number(d.meta_otima || 95);
      if (p >= m) atingidas++;
      else if (p <= 40) criticas++;
      else emProgresso++;
    });
    return {
      total: dadosAno.length,
      atingidas,
      emProgresso,
      criticas,
    };
  }, [dadosAno]);

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden text-slate-800">
      <Helmet>
        <title>Cobertura Vacinal</title>
      </Helmet>
      <SidebarPrivate
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <main className="relative flex-1 flex flex-col h-full w-full overflow-y-auto overflow-x-hidden ml-0 md:ml-[var(--sidebar-width,16rem)] transition-all duration-300">
        {/* ==================== BACKGROUND ==================== */}
        <div
          className="pointer-events-none fixed inset-0 opacity-[0.03] [background-image:linear-gradient(to_right,#054060_1px,transparent_1px),linear-gradient(to_bottom,#054060_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_70%)]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none fixed -left-40 top-40 h-96 w-96 rounded-full bg-sky-400/10 blur-3xl animate-float-slow"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none fixed -right-40 bottom-0 h-96 w-96 rounded-full bg-[#054060]/8 blur-3xl animate-float-slow"
          style={{ animationDelay: "2s" }}
          aria-hidden="true"
        />

        {/* ==================== HEADER ==================== */}
        <header className="px-4 md:px-8 py-3 flex items-center justify-between sticky top-0 z-30 bg-gradient-to-br from-[#4180ab] to-[#054060] backdrop-blur-md shadow-sm border-b border-white/10 transition-all duration-300">
          <div className="flex items-center gap-2 text-slate-800">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 text-white bg-white/10 rounded-lg hover:bg-white/20 active:scale-95 transition-all"
            >
              <Menu className="size-6" />
            </button>
            <ShieldCheck className="size-5 md:size-6 text-white" />
            <h2 className="text-s md:text-xl font-bold tracking-wide text-white">
              Cobertura Vacinal Infantil - {anoVigente}
            </h2>
          </div>
        </header>

        {/* ==================== CONTENT ==================== */}
        <div className="relative p-4 md:p-8 w-full max-w-350 mx-auto space-y-6 animate-in fade-in duration-500 pb-32 md:mb-15">
          {loading ? (
            <div className="flex flex-col justify-center items-center h-64 gap-4">
              <div className="relative flex items-center justify-center">
                <span className="absolute inline-flex size-16 rounded-full bg-[#1d4ed8]/20 animate-ping" />
                <Activity className="relative size-8 text-[#1d4ed8] animate-spin" />
              </div>
              <p className="text-sm font-semibold uppercase tracking-widest text-slate-400">
                Carregando dados vacinais...
              </p>
            </div>
          ) : (
            <>
              {erro && (
                <div className="relative overflow-hidden bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
                  <span className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-rose-400 via-rose-500 to-rose-400" />
                  <AlertTriangle className="size-5 shrink-0 mt-0.5" />
                  <p className="text-sm">
                    <strong>Falha ao carregar:</strong> {erro}
                  </p>
                </div>
              )}

              {/* Nota informativa */}
              <div className="group relative overflow-hidden bg-linear-to-r from-blue-50 to-sky-50 border border-blue-200 text-[#054060] rounded-2xl p-4 flex items-start gap-3 shadow-sm transition-all duration-500 hover:shadow-md hover:shadow-blue-500/10">
                <span className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-[#054060] via-[#0a7ea3] to-[#054060]" />
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/70 ring-1 ring-inset ring-blue-200/60">
                  <Info className="size-5 text-[#4180ab]" />
                </div>
                <p className="text-sm md:text-base leading-relaxed">
                  <strong className="font-bold">Nota sobre os dados:</strong> As
                  informações são importadas diretamente do site oficial
                  (SINAN/DataSUS). Por isso, pode haver um pequeno atraso entre
                  a notificação e a atualização nesta plataforma.
                </p>
              </div>

              {dadosAno.length === 0 && !erro && (
                <div className="relative overflow-hidden bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-4 text-sm shadow-sm">
                  <span className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-amber-400 via-amber-500 to-amber-400" />
                  <strong>Nenhum registro para {anoVigente}.</strong> Anos
                  disponíveis:{" "}
                  {[...new Set(dadosVacinais.map((d) => d.ano))]
                    .sort()
                    .join(", ") || "nenhum"}
                </div>
              )}

              {/* ==================== KPIs ==================== */}
              {dadosAno.length > 0 && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                  <KpiCard
                    icon={Target}
                    label="Total"
                    value={stats.total}
                    accent="from-slate-500/10 to-transparent"
                    iconColor="text-[#054060]"
                    delay="0ms"
                  />
                  <KpiCard
                    icon={Award}
                    label="Meta Atingida"
                    value={stats.atingidas}
                    accent="from-emerald-500/15 to-transparent"
                    iconColor="text-emerald-600"
                    delay="80ms"
                  />
                  <KpiCard
                    icon={TrendingUp}
                    label="Em Progresso"
                    value={stats.emProgresso}
                    accent="from-amber-500/15 to-transparent"
                    iconColor="text-amber-600"
                    delay="160ms"
                  />
                  <KpiCard
                    icon={AlertTriangle}
                    label="Críticas"
                    value={stats.criticas}
                    accent="from-rose-500/15 to-transparent"
                    iconColor="text-rose-600"
                    delay="240ms"
                  />
                </div>
              )}

              {/* ==================== MENU DE ATALHOS ==================== */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
                {Object.keys(FAIXAS_ETARIAS).map((faixa) => {
                  const Icon = TABS_ICONS[faixa];
                  const acc = FAIXA_ACCENTS[faixa];
                  return (
                    <button
                      key={faixa}
                      onClick={() =>
                        document
                          .getElementById(faixa)
                          ?.scrollIntoView({ behavior: "smooth" })
                      }
                      className="group relative overflow-hidden bg-white border-2 border-slate-200 hover:border-[#1d4ed8] rounded-2xl p-6 flex flex-col items-center justify-center gap-4 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-[#1d4ed8]/20 cursor-pointer"
                    >
                      {/* Gradient wash */}
                      <div
                        className={`pointer-events-none absolute inset-0 bg-linear-to-br ${acc.from} ${acc.to} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
                      />
                      {/* Shine sweep */}
                      <div className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/60 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />

                      <div
                        className={`relative w-14 h-14 rounded-full bg-linear-to-br ${acc.iconBg} flex items-center justify-center transition-all duration-500 ring-1 ring-inset ${acc.iconRing} ${acc.iconHoverRing} group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-lg ${acc.iconShadow}`}
                      >
                        <Icon
                          className={`size-7 ${acc.iconColor} transition-transform group-hover:scale-110`}
                        />
                      </div>
                      <span className="relative text-sm font-semibold text-slate-700 text-center transition-colors duration-300 group-hover:text-[#054060]">
                        {faixa}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* ==================== SEÇÕES ==================== */}
              {Object.entries(FAIXAS_ETARIAS).map(([faixa, regra]) => {
                const vacinasEncontradas = dadosAno.filter((d) =>
                  matchFaixa(d.imunobiologico, regra),
                );
                const Icon = TABS_ICONS[faixa];
                const acc = FAIXA_ACCENTS[faixa];

                return (
                  <section key={faixa} id={faixa} className="pt-4 scroll-mt-24">
                    {/* Section header */}
                    <div className="flex items-center justify-center gap-3 mb-6">
                      <span className="h-px w-8 sm:w-16 bg-linear-to-r from-transparent to-[#1d4ed8]/40" />
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm">
                        <div
                          className={`flex size-6 items-center justify-center rounded-lg bg-linear-to-br ${acc.iconBg} ring-1 ring-inset ${acc.iconRing}`}
                        >
                          <Icon className={`size-3.5 ${acc.iconColor}`} />
                        </div>
                        <h2 className="text-sm md:text-base font-bold bg-linear-to-r from-[#054060] to-[#0a7ea3] bg-clip-text text-transparent">
                          {faixa}
                        </h2>
                        <span className="text-[10px] font-bold text-[#1d4ed8] bg-blue-50 border border-blue-200 rounded-full px-2 py-0.5">
                          {vacinasEncontradas.length}
                        </span>
                      </div>
                      <span className="h-px w-8 sm:w-16 bg-linear-to-l from-transparent to-[#1d4ed8]/40" />
                    </div>

                    {vacinasEncontradas.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {vacinasEncontradas.map((vacina) => (
                          <VacinaCard key={vacina.id} dados={vacina} />
                        ))}
                      </div>
                    ) : (
                      <div className="relative overflow-hidden flex flex-col items-center justify-center gap-3 py-12 bg-white rounded-2xl border-2 border-dashed border-slate-200 text-slate-400">
                        <div
                          className={`flex size-12 items-center justify-center rounded-full bg-linear-to-br ${acc.iconBg} opacity-60 ring-1 ring-inset ${acc.iconRing}`}
                        >
                          <Icon className={`size-6 ${acc.iconColor}`} />
                        </div>
                        <span className="text-sm font-medium">
                          Aguardando dados para esta faixa etária...
                        </span>
                      </div>
                    )}
                  </section>
                );
              })}

              {/* Dev hint */}
              {vacinasNaoAlocadas.length > 0 && (
                <div className="relative overflow-hidden bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-500">
                  <span className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-slate-300 via-slate-400 to-slate-300" />
                  <strong className="text-slate-700">
                    {vacinasNaoAlocadas.length} imunobiológico(s) não alocado(s)
                    em nenhuma faixa:
                  </strong>{" "}
                  <span className="font-mono text-[11px]">
                    {vacinasNaoAlocadas.join(" · ")}
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {/* ==================== LEGENDA FLUTUANTE ==================== */}
        {!loading && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-full px-4 sm:px-8 py-3 shadow-[0_8px_40px_-8px_rgba(5,64,96,0.25)] flex flex-wrap gap-4 sm:gap-6 items-center justify-center text-[10px] sm:text-xs font-semibold text-slate-600 z-40 w-[95%] md:w-auto ring-1 ring-inset ring-white/60">
            <div className="flex items-center gap-1.5 transition-transform hover:scale-105 cursor-default">
              <span className="w-5 h-2.5 rounded-full bg-[#7f1d1d] shadow-[0_0_6px_rgba(127,29,29,0.4)]" />{" "}
              0-20%
            </div>
            <div className="flex items-center gap-1.5 transition-transform hover:scale-105 cursor-default">
              <span className="w-5 h-2.5 rounded-full bg-[#e11d48] shadow-[0_0_6px_rgba(225,29,72,0.4)]" />{" "}
              21-40%
            </div>
            <div className="flex items-center gap-1.5 transition-transform hover:scale-105 cursor-default">
              <span className="w-5 h-2.5 rounded-full bg-[#f59e0b] shadow-[0_0_6px_rgba(245,158,11,0.4)]" />{" "}
              41-60%
            </div>
            <div className="flex items-center gap-1.5 transition-transform hover:scale-105 cursor-default">
              <span className="w-5 h-2.5 rounded-full bg-[#eab308] shadow-[0_0_6px_rgba(234,179,8,0.4)]" />{" "}
              61-80%
            </div>
            <div className="flex items-center gap-1.5 transition-transform hover:scale-105 cursor-default">
              <span className="w-5 h-2.5 rounded-full bg-[#10b981] shadow-[0_0_6px_rgba(16,185,129,0.4)]" />{" "}
              Avanço significativo ({">"}80%)
            </div>
            <div className="flex items-center gap-1.5 transition-transform hover:scale-105 cursor-default">
              <span className="w-5 h-2.5 rounded-full bg-[#1d4ed8] shadow-[0_0_8px_rgba(29,78,216,0.6)] animate-pulse" />{" "}
              Meta ótima
            </div>
          </div>
        )}
      </main>

      {/* ==================== KEYFRAMES ==================== */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes gradient-x {
              0%, 100% { background-position: 0% 50%; }
              50%      { background-position: 100% 50%; }
            }
            @keyframes glow-pulse {
              0%, 100% { opacity: 0.4; transform: scale(0.9); }
              50%      { opacity: 0.9; transform: scale(1.1); }
            }
            @keyframes float-slow {
              0%, 100% { transform: translate(0, 0) scale(1); }
              50%      { transform: translate(16px, -20px) scale(1.05); }
            }
            @keyframes bar-shimmer {
              0%   { transform: translateX(-100%); }
              100% { transform: translateX(200%); }
            }
            @keyframes badge-pop {
              0%   { transform: scale(0) rotate(-45deg); opacity: 0; }
              60%  { transform: scale(1.15) rotate(5deg); opacity: 1; }
              100% { transform: scale(1) rotate(0deg); opacity: 1; }
            }
            @keyframes kpi-in {
              0%   { opacity: 0; transform: translateY(12px) scale(0.96); }
              100% { opacity: 1; transform: translateY(0) scale(1); }
            }

            .animate-gradient-x { animation: gradient-x 8s ease infinite; }
            .animate-glow-pulse { animation: glow-pulse 3.5s ease-in-out infinite; }
            .animate-float-slow { animation: float-slow 10s ease-in-out infinite; }
            .animate-bar-shimmer { animation: bar-shimmer 2.4s ease-in-out infinite; }
            .animate-badge-pop { animation: badge-pop 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
            .animate-kpi-in { animation: kpi-in 0.6s cubic-bezier(0.22, 1, 0.36, 1) both; }

            @media (prefers-reduced-motion: reduce) {
              .animate-gradient-x,
              .animate-glow-pulse,
              .animate-float-slow,
              .animate-bar-shimmer,
              .animate-badge-pop,
              .animate-kpi-in {
                animation: none !important;
              }
            }
          `,
        }}
      />
    </div>
  );
}
