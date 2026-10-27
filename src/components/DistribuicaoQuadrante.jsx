import React from "react";
import { Building2 } from "lucide-react";

const gradientePorCor = {
  "bg-blue-500": "bg-gradient-to-r from-blue-500 to-blue-400",
  "bg-emerald-500": "bg-gradient-to-r from-emerald-500 to-emerald-400",
  "bg-amber-500": "bg-gradient-to-r from-amber-500 to-amber-400",
  "bg-rose-500": "bg-gradient-to-r from-rose-500 to-rose-400",
  "bg-purple-500": "bg-gradient-to-r from-purple-500 to-purple-400",
};
const getGradiente = (cor) => gradientePorCor[cor] || cor;

export default function DistribuicaoUbs({
  distribuicaoUbs = [],
  endemiaNome = "dengue",
}) {
  const ubsOrdenadas = [...distribuicaoUbs].sort((a, b) => b.value - a.value);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:shadow-[0_8px_24px_-8px_rgba(15,23,42,0.12)] transition-shadow duration-300 p-5 md:p-6 flex flex-col w-full overflow-hidden">
      <div className="mb-5 flex items-start gap-3">
        <div className="p-2 rounded-xl bg-[#4180ab]/10 text-[#4180ab]">
          <Building2 className="size-4" strokeWidth={2.2} />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-800 tracking-tight">
            Distribuição por UBS
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Unidades com mais casos de {endemiaNome}
          </p>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto pr-1">
        {ubsOrdenadas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="size-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-3">
              <Building2 className="size-6 text-slate-300" strokeWidth={1.5} />
            </div>
            <p className="text-sm font-semibold text-slate-600">
              Sem dados suficientes
            </p>
          </div>
        ) : (
          ubsOrdenadas.map((item, idx) => {
            const isTop = idx === 0;
            return (
              <div
                key={idx}
                className={`rounded-xl p-2 -mx-2 transition-colors ${
                  isTop ? "bg-rose-50/40" : ""
                }`}
              >
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="font-semibold text-slate-700 flex items-center gap-2 min-w-0">
                    <span
                      className={`size-2.5 rounded-full shrink-0 ${item.color} shadow-sm`}
                    />
                    <span className="truncate">{item.name}</span>
                    {isTop && (
                      <span className="text-[9px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded shrink-0">
                        TOP
                      </span>
                    )}
                  </span>
                  <span className="font-extrabold text-slate-800 ml-2 tabular-nums">
                    {item.value}
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${getGradiente(item.color)} transition-all duration-1000 ease-out`}
                    style={{
                      width: `${Math.max((item.value / item.max) * 100, 4)}%`,
                    }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
