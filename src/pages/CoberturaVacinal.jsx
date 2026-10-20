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
} from "lucide-react";

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
    // Bloqueia QUALQUER dose de reforço — base não puxa 1º/2º reforço
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
      "varicela", // <- base da varicela mora aqui (era órfã)
    ],
    // A base "Varicela" casaria também com "Varicela - 2º dose" por prefixo;
    // a 2ª dose pertence à faixa de 4 anos
    exclude: ["varicela 2 dose"],
  },

  "4 anos de idade": {
    include: [
      "dtp 2 reforco",
      "varicela 2 dose",
      "poliomielite 2 reforco", // ok deixar — quando o seed tiver, aparece
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

function ProgressBarMS({ percentual, meta }) {
  const isMetaAtingida = percentual >= meta;
  let corBarra = "bg-[#1d4ed8]";
  if (!isMetaAtingida) {
    if (percentual <= 20) corBarra = "bg-[#7f1d1d]";
    else if (percentual <= 40) corBarra = "bg-[#e11d48]";
    else if (percentual <= 60) corBarra = "bg-[#f59e0b]";
    else if (percentual <= 80) corBarra = "bg-[#eab308]";
    else corBarra = "bg-[#10b981]";
  }
  return (
    <div className="w-full bg-slate-200 rounded-full h-2.5 mt-2">
      <div
        className={`${corBarra} h-2.5 rounded-full transition-all duration-1000`}
        style={{ width: `${Math.min(percentual, 100)}%` }}
      />
    </div>
  );
}

function VacinaCard({ dados }) {
  const isMetaAtingida = dados.cobertura_percentual >= dados.meta_otima;
  const nomeExibicao = dados.imunobiologico
    .replace(/^vacina /i, "")
    .replace("adsorvida difteria, tétano e pertussis", "Penta (DTP/HepB/Hib)");

  return (
    <div className="bg-white rounded-2xl shadow-sm border-2 border-[#1e40af] p-5 flex flex-col justify-between h-44 relative hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="pr-14">
          <h3 className="font-bold text-slate-800 text-[15px] leading-tight capitalize">
            {nomeExibicao}
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Meta ótima {dados.meta_otima}%
          </p>
        </div>
        {isMetaAtingida && (
          <div className="absolute top-4 right-4 flex flex-col items-center justify-center bg-[#1d4ed8] text-white rounded-full w-12 h-12 shadow-sm border-2 border-white">
            <span className="text-[6px] font-bold mt-0.5">META</span>
            <CheckCircle2 className="size-4" />
            <span className="text-[5px] font-bold mb-0.5">ATINGIDA</span>
          </div>
        )}
      </div>
      <div className="flex flex-col items-end mt-auto">
        <h4 className="text-3xl font-bold text-slate-700 mb-1">
          {Number(dados.cobertura_percentual || 0)
            .toFixed(2)
            .replace(".", ",")}
          %
        </h4>
        <ProgressBarMS
          percentual={Number(dados.cobertura_percentual || 0)}
          meta={Number(dados.meta_otima || 95)}
        />
      </div>
    </div>
  );
}

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

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden text-slate-800">
      <Helmet>
        <title>Cobertura Vacinal</title>
      </Helmet>
      <SidebarPrivate
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <main className="flex-1 flex flex-col h-full w-full overflow-y-auto overflow-x-hidden ml-0 md:ml-[var(--sidebar-width,16rem)] transition-all duration-300">
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

        <div className="p-4 md:p-8 w-full max-w-350 mx-auto space-y-6 animate-in fade-in duration-500 pb-32 md:mb-15">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Activity className="size-8 text-[#1d4ed8] animate-spin" />
            </div>
          ) : (
            <>
              {erro && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 flex items-start gap-3">
                  <Info className="size-5 shrink-0 mt-0.5" />
                  <p className="text-sm">
                    <strong>Falha ao carregar:</strong> {erro}
                  </p>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 text-[#054060] rounded-2xl p-4 flex items-start gap-3 shadow-sm">
                <Info className="size-5 text-[#4180ab] shrink-0 mt-0.5" />
                <p className="text-sm md:text-base leading-relaxed">
                  <strong className="font-bold">Nota sobre os dados:</strong> As
                  informações são importadas diretamente do site oficial
                  (SINAN/DataSUS). Por isso, pode haver um pequeno atraso entre
                  a notificação e a atualização nesta plataforma.
                </p>
              </div>

              {dadosAno.length === 0 && !erro && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-4 text-sm">
                  <strong>Nenhum registro para {anoVigente}.</strong> Anos
                  disponíveis:{" "}
                  {[...new Set(dadosVacinais.map((d) => d.ano))]
                    .sort()
                    .join(", ") || "nenhum"}
                </div>
              )}

              {/* Menu de atalhos */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {Object.keys(FAIXAS_ETARIAS).map((faixa) => {
                  const Icon = TABS_ICONS[faixa];
                  return (
                    <button
                      key={faixa}
                      onClick={() =>
                        document
                          .getElementById(faixa)
                          ?.scrollIntoView({ behavior: "smooth" })
                      }
                      className="bg-white border border-slate-200 hover:border-[#1d4ed8] rounded-2xl p-6 flex flex-col items-center justify-center gap-4 transition-colors group shadow-sm cursor-pointer"
                    >
                      <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                        <Icon className="size-7 text-[#1d4ed8]" />
                      </div>
                      <span className="text-sm font-semibold text-slate-700 text-center">
                        {faixa}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Seções */}
              {Object.entries(FAIXAS_ETARIAS).map(([faixa, regra]) => {
                const vacinasEncontradas = dadosAno.filter((d) =>
                  matchFaixa(d.imunobiologico, regra),
                );

                return (
                  <section key={faixa} id={faixa} className="pt-4 scroll-mt-24">
                    <h2 className="text-lg font-bold text-slate-800 text-center mb-6">
                      {faixa}
                    </h2>
                    {vacinasEncontradas.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {vacinasEncontradas.map((vacina) => (
                          <VacinaCard key={vacina.id} dados={vacina} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10 bg-white rounded-xl border border-slate-200 border-dashed text-slate-400 text-sm font-medium">
                        Aguardando dados para esta faixa etária...
                      </div>
                    )}
                  </section>
                );
              })}

              {/* 🔍 Dev hint: vacinas não categorizadas */}
              {vacinasNaoAlocadas.length > 0 && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-500">
                  <strong className="text-slate-700">
                    {vacinasNaoAlocadas.length} imunobiológico(s) não alocado(s)
                    em nenhuma faixa:
                  </strong>{" "}
                  <span className="font-mono">
                    {vacinasNaoAlocadas.join(" · ")}
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Legenda flutuante */}
        {!loading && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white border border-slate-200 rounded-full px-4 sm:px-8 py-3 shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex flex-wrap gap-4 sm:gap-6 items-center justify-center text-[10px] sm:text-xs font-semibold text-slate-600 z-40 w-[95%] md:w-auto">
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-2.5 rounded-full bg-[#7f1d1d]"></span>{" "}
              0-20%
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-2.5 rounded-full bg-[#e11d48]"></span>{" "}
              21-40%
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-2.5 rounded-full bg-[#f59e0b]"></span>{" "}
              41-60%
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-2.5 rounded-full bg-[#eab308]"></span>{" "}
              61-80%
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-2.5 rounded-full bg-[#10b981]"></span>{" "}
              Avanço significativo ({">"}80%)
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-2.5 rounded-full bg-[#1d4ed8]"></span> Meta
              ótima
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
