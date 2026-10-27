import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from "recharts";
import { Users } from "lucide-react";

// Paleta sequencial + cinza para "sem informação"
const FAIXAS = [
  { key: "0-9", min: 0, max: 9, cor: "#bae6fd" },
  { key: "10-19", min: 10, max: 19, cor: "#7dd3fc" },
  { key: "20-39", min: 20, max: 39, cor: "#38bdf8" },
  { key: "40-59", min: 40, max: 59, cor: "#0ea5e9" },
  { key: "60+", min: 60, max: 200, cor: "#0284c7" },
];
const FAIXA_NI = { key: "N/I", cor: "#cbd5e1" };

function calcularIdade(dataNascimento) {
  if (!dataNascimento) return null;
  const nasc = new Date(dataNascimento);
  if (isNaN(nasc)) return null;
  const hoje = new Date();
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
  if (idade < 0 || idade > 130) return null;
  return idade;
}

export default function PerfilFaixaEtaria({ pacientes = [] }) {
  const dados = useMemo(() => {
    const contagem = Object.fromEntries(
      [...FAIXAS, FAIXA_NI].map((f) => [f.key, 0]),
    );

    pacientes.forEach((p) => {
      const idade = calcularIdade(p.data_nascimento);
      if (idade === null) {
        contagem["N/I"]++;
        return;
      }
      const faixa = FAIXAS.find((f) => idade >= f.min && idade <= f.max);
      if (faixa) contagem[faixa.key]++;
      else contagem["N/I"]++;
    });

    return [...FAIXAS, FAIXA_NI].map((f) => ({
      faixa: f.key,
      casos: contagem[f.key],
      cor: f.cor,
    }));
  }, [pacientes]);

  const total = dados.reduce((s, d) => s + d.casos, 0);
  const totalComIdade = dados
    .filter((d) => d.faixa !== "N/I")
    .reduce((s, d) => s + d.casos, 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:shadow-[0_8px_24px_-8px_rgba(15,23,42,0.12)] transition-shadow duration-300 p-5 md:p-6 flex flex-col w-full overflow-hidden">
      <div className="mb-5 flex items-start gap-3">
        <div className="p-2 rounded-xl bg-[#4180ab]/10 text-[#4180ab]">
          <Users className="size-4" strokeWidth={2.2} />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-800 tracking-tight">
            Faixa Etária
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {totalComIdade} com idade · {total - totalComIdade} sem info
          </p>
        </div>
      </div>

      <div className="flex-1 min-h-[220px]">
        {total === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <div className="size-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-3">
              <Users className="size-6 text-slate-300" strokeWidth={1.5} />
            </div>
            <p className="text-sm font-semibold text-slate-600">
              Sem dados de idade
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Notifique pacientes com data de nascimento.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={dados}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f1f5f9"
              />
              <XAxis
                dataKey="faixa"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 500 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 500 }}
                allowDecimals={false}
              />
              <Tooltip
                cursor={{ fill: "rgba(65,128,171,0.06)" }}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 12px 32px -8px rgba(15,23,42,0.15)",
                  fontSize: 12,
                  padding: "8px 12px",
                }}
                formatter={(value, _name, item) => {
                  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
                  return [`${value} casos (${pct}%)`, item.payload.faixa];
                }}
              />
              <Bar dataKey="casos" radius={[6, 6, 0, 0]} maxBarSize={48}>
                {dados.map((entry, idx) => (
                  <Cell key={idx} fill={entry.cor} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
