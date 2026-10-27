import React, { useMemo } from "react";
import {
  Table2,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  FileSearch,
} from "lucide-react";
import { formatarBairro } from "@/lib/bairros";

const extrairBairro = (endereco) => {
  if (!endereco) return "—";
  const partes = endereco
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  if (!partes.length) return "—";
  let ultima = partes[partes.length - 1];
  if (/^[0-9-]+$/.test(ultima) && partes.length >= 2) {
    ultima = partes[partes.length - 2];
  }
  return formatarBairro(ultima);
};

const getStatus = (classi_fin) => {
  const c = String(classi_fin || "").trim();
  if (c === "10" || c === "11")
    return {
      label: "Alarme",
      bg: "bg-rose-50 text-rose-700 border-rose-200",
      Icon: AlertCircle,
    };
  if (c === "5")
    return {
      label: "Descartado",
      bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
      Icon: CheckCircle2,
    };
  if (c === "8")
    return {
      label: "Inconclusivo",
      bg: "bg-slate-50 text-slate-600 border-slate-200",
      Icon: HelpCircle,
    };
  return {
    label: "Suspeito",
    bg: "bg-amber-50 text-amber-700 border-amber-200",
    Icon: AlertTriangle,
  };
};

export default function TabelaCasos({
  pacientes = [],
  escopo = "unidade",
  onSelectPaciente,
}) {
  const ultimos = useMemo(() => {
    return [...pacientes]
      .sort((a, b) => {
        const dtA = a.data_notificacao || a.dt_notific || "0000-00-00";
        const dtB = b.data_notificacao || b.dt_notific || "0000-00-00";
        if (dtA !== dtB) return dtB.localeCompare(dtA);
        return (b.id || 0) - (a.id || 0);
      })
      .slice(0, 10);
  }, [pacientes]);

  const subtitulo =
    escopo === "unidade"
      ? "Os 10 registros mais recentes da sua unidade"
      : "Os 10 registros mais recentes do município";

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:shadow-[0_8px_24px_-8px_rgba(15,23,42,0.12)] transition-shadow duration-300 p-5 md:p-6 flex flex-col w-full overflow-hidden">
      <div className="mb-5 flex items-start gap-3">
        <div className="p-2 rounded-xl bg-[#4180ab]/10 text-[#4180ab]">
          <Table2 className="size-4" strokeWidth={2.2} />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-800 tracking-tight">
            Últimos Casos
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">{subtitulo}</p>
        </div>
      </div>

      <div className="overflow-x-auto -mx-5 md:-mx-6 px-5 md:px-6 max-h-125 overflow-y-auto">
        {ultimos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="size-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-3">
              <FileSearch className="size-7 text-slate-300" strokeWidth={1.5} />
            </div>
            <p className="text-sm font-semibold text-slate-600">
              Nenhum caso registrado neste período
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Tudo tranquilo por aqui.
            </p>
          </div>
        ) : (
          <table className="w-full text-left text-sm text-slate-600 min-w-150 border-separate border-spacing-0">
            <thead className="text-[11px] text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="sticky top-0 z-10 bg-slate-50 px-4 py-3 font-semibold text-left rounded-tl-lg border-b border-slate-100">
                  Data
                </th>
                <th className="sticky top-0 z-10 bg-slate-50 px-4 py-3 font-semibold text-left border-b border-slate-100">
                  Notificação
                </th>
                <th className="sticky top-0 z-10 bg-slate-50 px-4 py-3 font-semibold text-left border-b border-slate-100">
                  Bairro
                </th>
                <th className="sticky top-0 z-10 bg-slate-50 px-4 py-3 font-semibold text-left border-b border-slate-100">
                  Sexo
                </th>
                <th className="sticky top-0 z-10 bg-slate-50 px-4 py-3 font-semibold text-right rounded-tr-lg border-b border-slate-100">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {ultimos.map((p, idx) => {
                const status = getStatus(p.classi_fin);
                const StatusIcon = status.Icon;
                const data = p.data_notificacao || p.dt_notific;
                const dataFmt = data
                  ? data.split("-").reverse().join("/")
                  : "—";
                const clicavel = !!onSelectPaciente;
                return (
                  <tr
                    key={p.id || idx}
                    onClick={clicavel ? () => onSelectPaciente(p) : undefined}
                    className={`group transition-colors ${
                      idx % 2 === 0 ? "bg-white" : "bg-slate-50/40"
                    } ${clicavel ? "cursor-pointer hover:bg-[#4180ab]/5" : ""}`}
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-slate-700 font-semibold tabular-nums border-b border-slate-50">
                      {dataFmt}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-500 font-mono text-xs border-b border-slate-50">
                      #{p.numero_notificacao || p.nu_notific || "S/N"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-600 max-w-45 truncate border-b border-slate-50">
                      {extrairBairro(p.endereco)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap border-b border-slate-50">
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-[10px] font-bold ${
                          p.cs_sexo === "F"
                            ? "bg-pink-50 text-pink-700 ring-1 ring-pink-100"
                            : p.cs_sexo === "M"
                              ? "bg-blue-50 text-blue-700 ring-1 ring-blue-100"
                              : "bg-slate-50 text-slate-500 ring-1 ring-slate-100"
                        }`}
                      >
                        {p.cs_sexo || "?"}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right border-b border-slate-50">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold border ${status.bg}`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
