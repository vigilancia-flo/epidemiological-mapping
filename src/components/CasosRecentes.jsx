// CasosRecentes.jsx
import React from "react";
import { ArrowRight, Clock, Inbox } from "lucide-react";

function tempoRelativo(dataStr) {
  if (!dataStr) return "";
  const d = new Date(dataStr);
  if (isNaN(d)) return "";
  const dias = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (dias <= 0) return "hoje";
  if (dias === 1) return "ontem";
  if (dias < 7) return `há ${dias}d`;
  if (dias < 30) return `há ${Math.floor(dias / 7)}sem`;
  if (dias < 365) return `há ${Math.floor(dias / 30)}m`;
  return `há ${Math.floor(dias / 365)}a`;
}

const getBadgeStyle = (corClassificacao) => {
  if (corClassificacao.includes("rose"))
    return {
      badge: "bg-rose-50 text-rose-700 border-rose-200",
      label: "Alarme",
    };
  if (corClassificacao.includes("emerald"))
    return {
      badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
      label: "Descartado",
    };
  if (corClassificacao.includes("slate"))
    return {
      badge: "bg-slate-50 text-slate-600 border-slate-200",
      label: "Inconclusivo",
    };
  return {
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    label: "Suspeito",
  };
};

export default function CasosRecentes({ casos = [], onSelectPaciente }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:shadow-[0_8px_24px_-8px_rgba(15,23,42,0.12)] transition-shadow duration-300 p-5 md:p-6 flex flex-col w-full overflow-hidden">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-800 tracking-tight">
            Casos Recentes
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Últimos registros inseridos
          </p>
        </div>
        <div className="p-2 bg-slate-50 rounded-xl">
          <Clock className="size-4 text-slate-500" />
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-2 overflow-y-auto pr-1">
        {casos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-8 text-center">
            <div className="size-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-3">
              <Inbox className="size-6 text-slate-300" strokeWidth={1.5} />
            </div>
            <p className="text-sm font-semibold text-slate-600">
              Nenhum caso recente
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Novos registros aparecerão aqui.
            </p>
          </div>
        ) : (
          casos.map((caso, idx) => {
            const style = getBadgeStyle(caso.corClassificacao);
            const tempo = tempoRelativo(
              caso.dadosOriginais?.data_notificacao ||
                caso.dadosOriginais?.dt_notific,
            );
            return (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectPaciente?.(caso.dadosOriginais)}
                className="group flex items-center justify-between p-3 rounded-xl bg-slate-50/60 hover:bg-white text-left transition-all duration-200 border border-transparent hover:border-slate-200 hover:shadow-sm cursor-pointer"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    className={`w-1.5 h-11 rounded-full shrink-0 ${caso.corClassificacao} shadow-sm`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">
                        {caso.name}
                      </p>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${style.badge} shrink-0`}
                      >
                        {style.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {caso.condition}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-[11px] text-slate-400 truncate font-medium">
                        {caso.ubs}
                      </p>
                      {tempo && (
                        <>
                          <span className="text-[10px] text-slate-300">•</span>
                          <span className="text-[10px] text-slate-400 font-medium shrink-0">
                            {tempo}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <ArrowRight className="size-4 text-slate-300 group-hover:text-[#4180ab] group-hover:translate-x-1 transition-all duration-200 shrink-0 ml-2" />
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
