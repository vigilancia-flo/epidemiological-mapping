import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldAlert,
  ArrowLeft,
  Home as HomeIcon,
  MapPin,
  Search,
  LifeBuoy,
} from "lucide-react";
import ParticlesBg from "particles-bg";
import { Helmet } from "react-helmet-async";

export default function NotFound() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate("/", { replace: true });
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-[#eef5f9] to-[#dbe9f1] p-6">
      <Helmet>
        <title>Erro 404</title>
      </Helmet>
      {/* Partículas */}
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <ParticlesBg type="circle" color="#054060" num={50} bg={true} />
      </div>

      {/* Blobs decorativos */}
      <div
        className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-[#054060]/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-sky-400/10 blur-3xl"
        aria-hidden="true"
      />

      {/* Card principal */}
      <div className="relative z-10 w-full max-w-xl">
        <div className="relative overflow-hidden rounded-3xl border border-white/80 bg-white/80 p-8 text-center shadow-[0_20px_60px_-30px_rgba(5,64,96,0.35)] backdrop-blur-xl sm:p-12">
          {/* Faixa superior em gradiente */}
          <div
            className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#054060] via-[#0a7ea3] to-[#054060]"
            aria-hidden="true"
          />

          {/* Ícone com anel pulsante */}
          <div className="relative mx-auto mb-6 flex size-24 items-center justify-center sm:size-28">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-rose-400/20" />
            <span className="relative flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-rose-50 to-rose-100 ring-1 ring-inset ring-rose-200/60 sm:size-24">
              <ShieldAlert
                className="size-10 text-rose-500 sm:size-12"
                aria-hidden="true"
              />
            </span>
          </div>

          {/* 404 grande com gradiente */}
          <h1 className="bg-gradient-to-r from-[#054060] to-[#0a7ea3] bg-clip-text text-6xl font-black tracking-tight text-transparent sm:text-7xl">
            404
          </h1>

          <h2 className="mt-2 text-xl font-bold text-slate-800 sm:text-2xl">
            Página não encontrada
          </h2>

          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-500 sm:text-base">
            A rota que você tentou acessar não existe, foi movida ou você não
            tem permissão para visualizá-la.
          </p>

          {/* Botões de ação */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={handleGoBack}
              className="group inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-6 py-3 text-sm font-semibold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-300/40 sm:text-base"
            >
              <ArrowLeft
                className="size-4 transition-transform group-hover:-translate-x-0.5 sm:size-5"
                aria-hidden="true"
              />
              Voltar
            </button>

            <button
              type="button"
              onClick={() => navigate("/")}
              className="group relative inline-flex cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-[#054060] to-[#0a6a8c] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#054060]/20 transition-all hover:shadow-xl hover:shadow-[#054060]/30 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#054060]/25 sm:text-base"
            >
              <span
                className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full"
                aria-hidden="true"
              />
              <HomeIcon
                className="relative size-4 sm:size-5"
                aria-hidden="true"
              />
              <span className="relative">Página Inicial</span>
            </button>
          </div>
        </div>

        {/* Rodapé */}
        <div className="mt-6 flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-white sm:text-xs">
          SIGEP · Floriano, PI
        </div>
      </div>
    </div>
  );
}
