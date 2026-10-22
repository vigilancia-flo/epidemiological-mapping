import React from "react";
import {
  X,
  Code,
  Cpu,
  Bot,
  Printer,
  GraduationCap,
  MapPin,
  ExternalLink,
} from "lucide-react";

export default function AboutDeveloper({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="about-dev-title"
    >
      <div
        className="relative w-full max-w-2xl max-h-[100vh] overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between bg-linear-to-r from-[#4180ab] to-[#054060] px-5 py-4 text-white rounded-t-2xl">
          <h2
            id="about-dev-title"
            className="text-lg md:text-xl font-bold tracking-wide"
          >
            Sobre o Desenvolvedor
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="cursor-pointer rounded-lg p-1.5 transition-colors hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-5 md:space-y-6">
          {/* Card de Perfil */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="absolute top-0 left-0 h-1.5 w-full bg-linear-to-r from-[#4180ab] to-[#054060]" />

            <div className="flex flex-col items-center gap-5 p-5 sm:flex-row sm:items-start sm:gap-6 sm:p-6">
              {/* Avatar */}
              <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-slate-100 shadow-md sm:size-28">
                <img
                  src="https://portifoliopro-victorsarris.netlify.app/img/eu.png"
                  alt="Foto de Victor Sarrís"
                  className="h-full w-full object-cover text-slate-400"
                />
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1 text-center sm:text-left">
                <h3 className="text-xl font-black tracking-tight text-slate-800 sm:text-2xl">
                  Victor Sarrís Silva Santos
                </h3>

                <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs font-medium text-slate-600 sm:justify-start sm:text-sm">
                  <span className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5">
                    <GraduationCap
                      size={14}
                      className="shrink-0 text-[#4180ab]"
                    />
                    <span className="text-left">
                      Tec. em Análise e Desenv. de Sistemas
                    </span>
                  </span>
                  <span className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5">
                    <MapPin size={14} className="shrink-0 text-[#4180ab]" />
                    IFPI Campus Floriano
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
                    Desenvolvedor de software apaixonado por tecnologia,
                    inovação e resolução de problemas. Com sólida base acadêmica
                    e prática, focado na criação de sistemas que impactam
                    positivamente a sociedade e a área da saúde.
                  </p>
                  <a
                    href="https://portifoliopro-victorsarris.netlify.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#4180ab] transition-colors hover:text-[#32678c] sm:text-base"
                  >
                    Visitar portfólio
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Stack & Interesses */}
          <div>
            <h3 className="mb-4 flex items-center gap-2 border-b border-slate-200 pb-2 text-lg font-bold text-slate-800 md:text-xl">
              <Bot className="size-5 text-[#4180ab] md:size-6" />
              Stack & Interesses
            </h3>

            <div className="grid grid-cols-1 gap-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 md:grid-cols-2 md:gap-8">
              <div>
                <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700 md:mb-4 md:text-base">
                  <Code size={16} className="text-[#4180ab]" />
                  Desenvolvimento de Software
                </h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Python",
                    "Django Rest Framework",
                    "Ionic",
                    "ReactJS",
                    "TypeScript",
                    "NodeJs",
                    "SBC",
                    "Linux",
                    "Visão Computacional",
                  ].map((tech) => (
                    <span
                      key={tech}
                      className="rounded-lg border border-[#4180ab]/20 bg-[#4180ab]/10 px-3 py-1.5 text-xs font-bold text-[#054060]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700 md:mb-4 md:text-base">
                  <Cpu size={16} className="text-[#4180ab]" />
                  Tecnologias Emergentes
                </h4>
                <div className="flex flex-col gap-2">
                  <span className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700">
                    <Bot size={14} className="shrink-0 text-[#4180ab]" />
                    Integração e Serviços de Inteligência Artificial
                  </span>
                  <span className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700">
                    <Cpu size={14} className="shrink-0 text-[#4180ab]" />
                    Internet das Coisas (IoT)
                  </span>
                  <span className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700">
                    <Printer size={14} className="shrink-0 text-[#4180ab]" />
                    Modelagem CAD e Impressão 3D
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
