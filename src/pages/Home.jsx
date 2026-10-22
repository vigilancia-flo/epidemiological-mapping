import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Map as MapIcon,
  ShieldAlert,
  ArrowRight,
  UserCircle2,
  LockKeyhole,
  Eye,
  EyeOff,
  Loader2,
  Activity,
  TrendingUp,
  Sparkles,
  MapPin,
} from "lucide-react";
import ParticlesBg from "particles-bg";

import EpiDataLogo from "../assets/EPI-DATA.png";
import { useAuth } from "../contexts/AuthContext.jsx";
import PoliLegal from "@/components/Modal/PoliLegal.jsx";
import TermsModal from "@/components/Modal/TermsModal.jsx";
import AboutDeveloper from "../components/Modal/AboutDeveloper";

const FEATURES = [
  {
    icon: MapIcon,
    title: "Mapa de Calor",
    description:
      "Densidade de casos segmentada por quadrantes urbanos e rurais.",
    accent: "from-sky-500/15 to-sky-500/5",
    iconBg: "bg-sky-500/15",
    iconColor: "text-sky-700",
  },
  {
    icon: ShieldAlert,
    title: "Controle de Surtos",
    description: "Mapeamento de risco com atualização mensal contínua.",
    accent: "from-amber-500/15 to-amber-500/5",
    iconBg: "bg-amber-500/15",
    iconColor: "text-amber-700",
  },
  {
    icon: TrendingUp,
    title: "Séries Históricas",
    description: "Comparativo temporal de incidência por agravo e região.",
    accent: "from-emerald-500/15 to-emerald-500/5",
    iconBg: "bg-emerald-500/15",
    iconColor: "text-emerald-700",
  },
];

const INPUT_CLASS =
  "w-full rounded-xl border border-slate-200/80 bg-slate-50/80 py-3 pl-11 pr-3 text-sm font-semibold text-[#054060] outline-none transition-all placeholder:font-medium placeholder:text-slate-400 hover:border-slate-300 hover:bg-slate-50 focus:border-[#054060]/40 focus:bg-white focus:ring-4 focus:ring-[#054060]/10 disabled:cursor-not-allowed disabled:opacity-60";

/* -------------------------------------------------------------------------- */
/*                              Componentes auxiliares                        */
/* -------------------------------------------------------------------------- */

function FeatureCard({
  icon: Icon,
  title,
  description,
  accent,
  iconBg,
  iconColor,
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/70 bg-white/70 p-4 shadow-[0_2px_20px_-8px_rgba(5,64,96,0.15)] backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_-10px_rgba(5,64,96,0.25)] sm:p-5">
      <div
        className={`pointer-events-none absolute inset-0 bg-linear-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${accent}`}
        aria-hidden="true"
      />
      <div className="relative flex flex-col items-center gap-3 text-center sm:flex-row sm:items-start sm:gap-4 sm:text-left">
        <div
          className={`flex size-11 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset ring-white/60 ${iconBg}`}
        >
          <Icon
            className={`size-5 sm:size-6 ${iconColor}`}
            aria-hidden="true"
          />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-slate-800 sm:text-[15px]">
            {title}
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-600 sm:text-[13px]">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 Splash                                     */
/* -------------------------------------------------------------------------- */

function SplashLoader({ isFadingOut }) {
  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-linear-to-br from-slate-50 via-[#eef5f9] to-[#dbe9f1] transition-all duration-700 ease-out ${
        isFadingOut
          ? "pointer-events-none opacity-0 scale-[1.02]"
          : "opacity-100 scale-100"
      }`}
      aria-hidden={isFadingOut}
    >
      {/* Blobs de fundo */}
      <div
        className="pointer-events-none absolute -left-32 top-10 h-80 w-80 rounded-full bg-[#054060]/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-sky-400/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative flex flex-col items-center">
        {/* Logo + ondas de ping */}
        <div className="relative flex items-center justify-center">
          <span className="absolute inline-flex size-32 rounded-full bg-[#054060]/15 animate-splash-ping sm:size-40" />
          <span
            className="absolute inline-flex size-32 rounded-full bg-[#054060]/10 animate-splash-ping sm:size-40"
            style={{ animationDelay: "0.5s" }}
          />
          <span
            className="absolute inline-flex size-32 rounded-full bg-[#054060]/5 animate-splash-ping sm:size-40"
            style={{ animationDelay: "1s" }}
          />

          <img
            src={EpiDataLogo}
            alt="EPI-DATA"
            className="relative w-32 drop-shadow-lg animate-splash-breathe sm:w-40"
          />
        </div>

        {/* Texto "Carregando" com fade-up */}
        <div className="mt-10 flex items-center gap-3">
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#054060]/70 animate-splash-fade-up sm:text-xs">
            Carregando
          </span>
          <span className="flex items-center gap-1">
            <span className="size-1 rounded-full bg-[#054060]/70 animate-splash-dot" />
            <span
              className="size-1 rounded-full bg-[#054060]/70 animate-splash-dot"
              style={{ animationDelay: "0.15s" }}
            />
            <span
              className="size-1 rounded-full bg-[#054060]/70 animate-splash-dot"
              style={{ animationDelay: "0.3s" }}
            />
          </span>
        </div>

        {/* Barra de progresso */}
        <div className="relative mt-4 h-1 w-56 overflow-hidden rounded-full bg-[#054060]/10 sm:w-64">
          <span
            className="absolute inset-y-0 w-1/3 rounded-full bg-linear-to-r from-[#054060] via-[#0a7ea3] to-[#054060] animate-splash-bar"
            style={{ animationDelay: "0.2s" }}
          />
        </div>

        {/* Microtexto com delay */}
        <p
          className="mt-5 text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400 animate-splash-fade-up sm:text-[11px]"
          style={{ animationDelay: "0.4s" }}
        >
          Carregando dados
        </p>
      </div>

      <p className="absolute bottom-8 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 sm:text-xs">
        Secretaria de Saúde · Floriano, PI
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   Página                                   */
/* -------------------------------------------------------------------------- */

function Home() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [isAboutDevOpen, setIsAboutDevOpen] = useState(false);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [erroLogin, setErroLogin] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setIsFadingOut(true), 1600);
    const removeTimer = setTimeout(() => setIsLoading(false), 2400);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  const canSubmit = username.trim().length > 0 && password.length > 0;

  async function handleLogin(event) {
    event.preventDefault();
    if (isLoggingIn || !canSubmit) return;

    setErroLogin("");
    setIsLoggingIn(true);

    try {
      const success = await login(username.trim(), password);

      if (success) {
        navigate("/profissional/dashboard", { replace: true });
        return;
      }

      setErroLogin("Credenciais inválidas. Tente novamente.");
    } catch {
      setErroLogin(
        "Não foi possível entrar agora. Tente novamente em instantes.",
      );
    } finally {
      setIsLoggingIn(false);
    }
  }

  return (
    <>
      <Helmet>
        <title>
          SIGEP - Sistema Inteligente · Georreferencial Epidemiológico
        </title>
        <meta
          name="description"
          content="O EPI-DATA é um sistema de mapeamento epidemiológico setorial e dashboard de saúde pública desenvolvido para a Secretaria de Saúde de Floriano, Piauí. O principal objetivo é acompanhar a evolução de casos, monitorar focos de endemias e mapear as zonas de abrangência das Unidades Básicas de Saúde, fornecendo suporte à decisão para o controle de surtos e vetores em tempo real."
        />
      </Helmet>

      {isLoading && <SplashLoader isFadingOut={isFadingOut} />}

      <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-linear-to-br from-slate-50 via-[#eef5f9] to-[#dbe9f1] lg:flex-row">
        <div className="pointer-events-none absolute inset-0 opacity-70">
          <ParticlesBg type="cobweb" color="#054060" num={60} bg={true} />
        </div>

        <div
          className="pointer-events-none absolute -left-32 top-10 h-80 w-80 rounded-full bg-[#054060]/10 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-sky-400/10 blur-3xl"
          aria-hidden="true"
        />

        <main className="relative z-10 flex flex-1 flex-col justify-center p-6 sm:p-10 md:-mt-14 md:p-12 lg:p-16 xl:p-20">
          <div className="mx-auto w-full max-w-2xl">
            {/* ==================== HEADER REDESENHADO ==================== */}
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-8 lg:gap-10">
              <div className="relative shrink-0">
                <span
                  className="absolute inset-0 -z-10 scale-90 rounded-full bg-[#054060]/5 blur-2xl"
                  aria-hidden="true"
                />
                <img
                  src={EpiDataLogo}
                  alt="EPI-DATA"
                  className="w-32 drop-shadow-sm sm:w-36 lg:w-40 xl:w-44"
                />
              </div>

              <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
                <h1 className="text-4xl font-black leading-none tracking-tight sm:text-5xl lg:text-6xl">
                  <span className="relative inline-block">
                    <span className="relative z-10 bg-linear-to-r from-[#054060] via-[#0a7ea3] to-[#054060] bg-clip-text text-transparent">
                      SIGEP
                    </span>
                    <span
                      className="absolute inset-x-0 bottom-1 z-0 h-2.5 -rotate-1 bg-[#054060]/10 sm:h-3"
                      aria-hidden="true"
                    />
                  </span>
                </h1>

                <p className="mt-3 max-w-md text-sm font-semibold leading-snug text-slate-600 sm:text-base lg:text-[17px]">
                  <span className="bg-linear-to-r from-[#054060] to-[#0a7ea3] bg-clip-text text-transparent">
                    Sistema Inteligente
                  </span>{" "}
                  <span className="text-slate-400 font-normal">·</span>{" "}
                  <span className="bg-linear-to-r from-[#054060] to-[#0a7ea3] bg-clip-text text-transparent">
                    Georreferencial Epidemiológico
                  </span>
                </p>

                <span className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-slate-200/70 bg-white/60 px-3 py-1 text-[11px] font-semibold text-slate-500 shadow-sm backdrop-blur-sm">
                  <MapPin
                    className="size-3 text-[#054060]/70"
                    aria-hidden="true"
                  />
                  Floriano · Piauí
                </span>
              </div>
            </div>
            {/* ================== FIM HEADER REDESENHADO ================== */}

            <p className="mt-8 text-center text-base font-medium leading-relaxed text-slate-600 sm:mt-10 sm:text-lg lg:text-left">
              Acompanhe a evolução de casos, dados gerais e as zonas de
              abrangência das UBSs em tempo real para tomada rápida de decisões.
            </p>

            <div className="mt-10 space-y-4 sm:mt-12 sm:space-y-5">
              {FEATURES.map((feature) => (
                <FeatureCard key={feature.title} {...feature} />
              ))}
            </div>

            <div className="mt-10 hidden items-center gap-6 lg:flex">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                <span className="relative flex size-2.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
                </span>
                Dados atualizados em tempo real
              </div>
              <div className="h-5 w-px bg-slate-300" aria-hidden="true" />
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                <Activity
                  className="size-4 text-[#054060]"
                  aria-hidden="true"
                />
                Cobertura total do município
              </div>
            </div>
          </div>
        </main>

        <aside className="relative z-10 flex w-full flex-col justify-center border-t border-white/60 bg-white/70 p-6 shadow-[-30px_0_60px_-40px_rgba(5,64,96,0.25)] backdrop-blur-xl sm:p-10 md:-mt-14 md:p-12 lg:w-[480px] lg:border-l lg:border-t-0 lg:px-14 lg:py-16">
          <div className="mx-auto w-full max-w-md space-y-8 lg:space-y-10">
            <section>
              <div className="mb-3 flex items-center gap-2.5 lg:mb-4">
                <span className="h-px flex-1 bg-linear-to-r from-transparent via-slate-300 to-transparent lg:hidden" />
                <h2 className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 sm:text-[11px]">
                  Acesso Público
                </h2>
                <span className="h-px flex-1 bg-linear-to-r from-transparent via-slate-300 to-transparent lg:hidden" />
                <span className="hidden h-px flex-1 bg-slate-200 lg:block" />
              </div>

              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="group relative flex w-full cursor-pointer items-center justify-between overflow-hidden rounded-2xl bg-linear-to-r from-[#054060] to-[#0a6a8c] px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-[#054060]/20 transition-all duration-300 hover:shadow-xl hover:shadow-[#054060]/30 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#054060]/25 sm:text-base"
              >
                <span
                  className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full"
                  aria-hidden="true"
                />
                <span className="relative">Acessar Painel do Mapa</span>
                <span className="relative flex size-8 items-center justify-center rounded-lg bg-white/15 transition-all duration-300 group-hover:translate-x-0.5 group-hover:bg-white/25">
                  <ArrowRight className="size-4 sm:size-5" aria-hidden="true" />
                </span>
              </button>

              <p className="mt-3 text-center text-xs text-slate-500 sm:text-[13px] lg:text-left">
                Visão geral dos dados epidemiológicos da cidade.
              </p>
            </section>

            <div className="relative flex items-center">
              <span className="h-px flex-1 bg-slate-200" />
              <span className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                ou
              </span>
              <span className="h-px flex-1 bg-slate-200" />
            </div>

            <section className="relative overflow-hidden rounded-2xl border border-white/80 bg-white/90 p-5 shadow-[0_10px_40px_-20px_rgba(5,64,96,0.3)] backdrop-blur-sm sm:p-7">
              <div
                className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-[#054060] via-[#0a7ea3] to-[#054060]"
                aria-hidden="true"
              />

              <div className="mb-2 flex items-center justify-center gap-2 sm:gap-2.5 lg:justify-start">
                <div className="flex size-8 items-center justify-center rounded-lg bg-[#054060]/10">
                  <UserCircle2
                    className="size-4 text-[#054060]"
                    aria-hidden="true"
                  />
                </div>
                <h2 className="text-base font-bold text-slate-800 sm:text-lg">
                  Área do Profissional
                </h2>
              </div>

              <p className="mb-5 text-center text-xs leading-relaxed text-slate-500 sm:mb-6 sm:text-[13px] lg:text-left">
                Acesso restrito para agentes e gestores de saúde da UBS
                previamente cadastrados.
              </p>

              <form className="space-y-3.5" onSubmit={handleLogin} noValidate>
                <div className="relative">
                  <label htmlFor="username" className="sr-only">
                    Login
                  </label>
                  <UserCircle2
                    className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400 transition-colors peer-focus:text-[#054060]"
                    aria-hidden="true"
                  />
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    placeholder="Login"
                    value={username}
                    disabled={isLoggingIn}
                    onChange={(e) => setUsername(e.target.value)}
                    className={INPUT_CLASS}
                  />
                </div>

                <div className="relative">
                  <label htmlFor="password" className="sr-only">
                    Senha
                  </label>
                  <LockKeyhole
                    className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Senha"
                    value={password}
                    disabled={isLoggingIn}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`${INPUT_CLASS} pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={
                      showPassword ? "Ocultar senha" : "Mostrar senha"
                    }
                    aria-pressed={showPassword}
                    className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#054060] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#054060]/30"
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" aria-hidden="true" />
                    ) : (
                      <Eye className="size-4" aria-hidden="true" />
                    )}
                  </button>
                </div>

                {erroLogin && (
                  <p
                    role="alert"
                    className="flex items-start gap-2 rounded-lg border border-rose-100 bg-rose-50 p-2.5 text-[13px] font-medium text-rose-600"
                  >
                    <ShieldAlert
                      className="mt-0.5 size-4 shrink-0"
                      aria-hidden="true"
                    />
                    {erroLogin}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isLoggingIn || !canSubmit}
                  className="group flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl bg-[#054060] px-5 py-3.5 text-sm font-semibold text-white shadow-md shadow-[#054060]/20 transition-all duration-200 hover:bg-[#085883] hover:shadow-lg hover:shadow-[#054060]/30 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#054060]/25 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none sm:py-4 sm:text-base"
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2
                        className="size-4 animate-spin"
                        aria-hidden="true"
                      />
                      <span>Autenticando...</span>
                    </>
                  ) : (
                    <>
                      <LockKeyhole className="size-4" aria-hidden="true" />
                      <span>Fazer Login</span>
                    </>
                  )}
                </button>
              </form>
            </section>

            <footer className="border-t border-slate-200/70 pt-6 text-center lg:text-left">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 sm:text-[11px]">
                Secretaria de Saúde
              </p>
              <p className="text-[11px] font-medium text-slate-400 sm:text-xs">
                Floriano, PI &copy; {new Date().getFullYear()}
              </p>

              <div className="mt-5 flex flex-row flex-wrap items-center justify-center gap-3 lg:justify-start">
                <button
                  type="button"
                  onClick={() => setIsPrivacyModalOpen(true)}
                  className="cursor-pointer rounded-sm text-[10px] font-medium text-slate-400 transition-all hover:text-[#054060] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#054060]/30 sm:text-xs"
                >
                  Política de Privacidade
                </button>

                <span className="text-[10px] text-slate-300" aria-hidden="true">
                  •
                </span>

                <button
                  type="button"
                  onClick={() => setIsTermsModalOpen(true)}
                  className="cursor-pointer rounded-sm text-[10px] font-medium text-slate-400 transition-all hover:text-[#054060] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#054060]/30 sm:text-xs"
                >
                  Termos de Uso
                </button>

                <span className="text-[10px] text-slate-300" aria-hidden="true">
                  •
                </span>

                <button
                  type="button"
                  onClick={() => setIsAboutDevOpen(true)}
                  className="cursor-pointer rounded-sm text-[10px] font-medium text-slate-400 transition-all hover:text-[#054060] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#054060]/30 sm:text-xs"
                >
                  Desenvolvedor
                </button>
              </div>
            </footer>
          </div>
        </aside>

        <PoliLegal
          isOpen={isPrivacyModalOpen}
          onClose={() => setIsPrivacyModalOpen(false)}
        />
        <TermsModal
          isOpen={isTermsModalOpen}
          onClose={() => setIsTermsModalOpen(false)}
        />
        <AboutDeveloper
          isOpen={isAboutDevOpen}
          onClose={() => setIsAboutDevOpen(false)}
        />
      </div>

      {/* ============= KEYFRAMES INLINE (fallback) ============= */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes splash-ping {
              0%   { transform: scale(0.7); opacity: 0.6; }
              80%  { transform: scale(1.6); opacity: 0;   }
              100% { transform: scale(1.6); opacity: 0;   }
            }
            @keyframes splash-breathe {
              0%, 100% { transform: scale(1);    filter: drop-shadow(0 4px 12px rgba(5,64,96,0.15)); }
              50%      { transform: scale(1.06); filter: drop-shadow(0 8px 20px rgba(5,64,96,0.28)); }
            }
            @keyframes splash-bar {
              0%   { transform: translateX(-110%); }
              100% { transform: translateX(320%);  }
            }
            @keyframes splash-fade-up {
              0%   { opacity: 0; transform: translateY(6px); }
              100% { opacity: 1; transform: translateY(0);   }
            }
            @keyframes splash-dot {
              0%, 80%, 100% { opacity: 0.25; transform: translateY(0);    }
              40%           { opacity: 1;    transform: translateY(-2px); }
            }

            .animate-splash-ping    { animation: splash-ping    2.4s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
            .animate-splash-breathe { animation: splash-breathe 2.6s ease-in-out infinite; }
            .animate-splash-bar     { animation: splash-bar     1.6s ease-in-out infinite; }
            .animate-splash-fade-up { animation: splash-fade-up 0.6s ease-out both; }
            .animate-splash-dot     { animation: splash-dot     1.2s ease-in-out infinite; }

            @media (prefers-reduced-motion: reduce) {
              .animate-splash-ping,
              .animate-splash-breathe,
              .animate-splash-bar,
              .animate-splash-fade-up,
              .animate-splash-dot {
                animation: none !important;
              }
            }
          `,
        }}
      />
    </>
  );
}

export default Home;
