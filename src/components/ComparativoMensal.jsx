import React, { useMemo } from "react";
import { ArrowUp, ArrowDown, Minus, TrendingUp } from "lucide-react";

export default function ComparativoMensal({
  pacientes = [],
  escopo = "unidade",
}) {
  const dados = useMemo(() => {
    const hoje = new Date();
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();
    const mesAnterior = mesAtual === 0 ? 11 : mesAtual - 1;
    const anoAnterior = mesAtual === 0 ? anoAtual - 1 : anoAtual;

    let casosMesAtual = 0;
    let casosMesAnterior = 0;

    pacientes.forEach((p) => {
      const dt = p.data_notificacao || p.dt_notific;
      if (!dt) return;
      const data = new Date(dt);
      if (isNaN(data)) return;
      const m = data.getMonth();
      const a = data.getFullYear();
      if (m === mesAtual && a === anoAtual) casosMesAtual++;
      else if (m === mesAnterior && a === anoAnterior) casosMesAnterior++;
    });

    let variacao = 0;
    if (casosMesAnterior > 0) {
      variacao = ((casosMesAtual - casosMesAnterior) / casosMesAnterior) * 100;
    } else if (casosMesAtual > 0) {
      variacao = 100;
    }

    const nomeMesAtual = new Date(anoAtual, mesAtual, 1).toLocaleString(
      "pt-BR",
      { month: "long" },
    );
    const nomeMesAnterior = new Date(
      anoAnterior,
      mesAnterior,
      1,
    ).toLocaleString("pt-BR", { month: "long" });

    return {
      casosMesAtual,
      casosMesAnterior,
      variacao: Math.round(variacao * 10) / 10,
      nomeMesAtual:
        nomeMesAtual.charAt(0).toUpperCase() + nomeMesAtual.slice(1),
      nomeMesAnterior:
        nomeMesAnterior.charAt(0).toUpperCase() + nomeMesAnterior.slice(1),
    };
  }, [pacientes]);

  const {
    casosMesAtual,
    casosMesAnterior,
    variacao,
    nomeMesAtual,
    nomeMesAnterior,
  } = dados;

  const subtitulo =
    escopo === "unidade"
      ? "Mês atual vs. mês anterior na sua unidade"
      : "Mês atual vs. mês anterior no município";

  const maxValor = Math.max(casosMesAtual, casosMesAnterior, 1);
  const pctAnterior = (casosMesAnterior / maxValor) * 100;
  const pctAtual = (casosMesAtual / maxValor) * 100;

  let corVariacao = "text-slate-600";
  let bgVariacao = "bg-slate-50 border-slate-200";
  let IconeVariacao = Minus;
  let textoVariacao = "estável";
  if (variacao > 0) {
    corVariacao = "text-rose-600";
    bgVariacao = "bg-rose-50 border-rose-200";
    IconeVariacao = ArrowUp;
    textoVariacao = "aumento";
  } else if (variacao < 0) {
    corVariacao = "text-emerald-600";
    bgVariacao = "bg-emerald-50 border-emerald-200";
    IconeVariacao = ArrowDown;
    textoVariacao = "redução";
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:shadow-[0_8px_24px_-8px_rgba(15,23,42,0.12)] transition-shadow duration-300 p-5 md:p-6 flex flex-col w-full overflow-hidden">
      <div className="mb-5 flex items-start gap-3">
        <div className="p-2 rounded-xl bg-[#4180ab]/10 text-[#4180ab]">
          <TrendingUp className="size-4" strokeWidth={2.2} />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-800 tracking-tight">
            Comparativo Mensal
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">{subtitulo}</p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-5 items-stretch">
        {/* Mês anterior */}
        <div className="flex flex-col justify-between">
          <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            {nomeMesAnterior}
          </p>
          <p className="text-4xl sm:text-5xl font-black text-slate-700 tracking-tight mt-1">
            {casosMesAnterior}
          </p>
          <p className="text-[10px] text-slate-400 font-medium">casos</p>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mt-3">
            <div
              className="h-full rounded-full bg-gradient-to-r from-slate-400 to-slate-300 transition-all duration-700 ease-out"
              style={{ width: `${pctAnterior}%` }}
            />
          </div>
        </div>

        {/* Mês atual */}
        <div className="flex flex-col justify-between border-l border-slate-100 pl-5">
          <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            {nomeMesAtual}
          </p>
          <p className="text-4xl sm:text-5xl font-black text-[#054060] tracking-tight mt-1">
            {casosMesAtual}
          </p>
          <p className="text-[10px] text-slate-400 font-medium">casos</p>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mt-3">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#4180ab] to-[#5b9bc4] transition-all duration-700 ease-out"
              style={{ width: `${pctAtual}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <div
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${bgVariacao} ${corVariacao}`}
        >
          <IconeVariacao className="size-4" strokeWidth={2.5} />
          <span className="text-base font-extrabold">
            {variacao > 0 ? "+" : ""}
            {variacao}%
          </span>
          <span className="text-xs font-semibold opacity-70">
            {textoVariacao}
          </span>
        </div>
      </div>
    </div>
  );
}
