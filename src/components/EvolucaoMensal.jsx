// EvolucaoMensal.jsx
import React, { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
  ReferenceDot,
} from "recharts";
import { Activity } from "lucide-react";

export default function EvolucaoMensal({ pacientes = [], escopo = "unidade" }) {
  const dados = useMemo(() => {
    const contagem = {};
    pacientes.forEach((p) => {
      const dt = p.data_notificacao || p.dt_notific;
      if (!dt) return;
      const data = new Date(dt);
      if (isNaN(data)) return;
      const mesAno = `${String(data.getMonth() + 1).padStart(2, "0")}/${data.getFullYear()}`;
      contagem[mesAno] = (contagem[mesAno] || 0) + 1;
    });

    return Object.entries(contagem)
      .map(([data, casos]) => ({ data, casos }))
      .sort((a, b) => {
        const [mA, aA] = a.data.split("/");
        const [mB, aB] = b.data.split("/");
        return Number(aA + mA) - Number(aB + mB);
      })
      .slice(-12);
  }, [pacientes]);

  const total = dados.reduce((s, d) => s + d.casos, 0);
  const media = dados.length > 0 ? Math.round(total / dados.length) : 0;
  const pico = dados.length
    ? dados.reduce((max, d) => (d.casos > max.casos ? d : max), dados[0])
    : null;

  const subtitulo =
    escopo === "unidade"
      ? `${total} casos nos últimos ${dados.length || 12} meses · sua unidade`
      : `${total} casos nos últimos ${dados.length || 12} meses · município`;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:shadow-[0_8px_24px_-8px_rgba(15,23,42,0.12)] transition-shadow duration-300 p-5 md:p-6 flex flex-col w-full overflow-hidden">
      <div className="mb-5 flex items-start gap-3">
        <div className="p-2 rounded-xl bg-[#4180ab]/10 text-[#4180ab]">
          <Activity className="size-4" strokeWidth={2.2} />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-800 tracking-tight">
            Evolução Mensal
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">{subtitulo}</p>
        </div>
      </div>

      <div className="flex-1 min-h-[240px]">
        {dados.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <div className="size-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-3">
              <Activity className="size-6 text-slate-300" strokeWidth={1.5} />
            </div>
            <p className="text-sm font-semibold text-slate-600">
              Sem dados no período
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Registre casos para ver a evolução.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={dados}
              margin={{ top: 20, right: 12, left: -16, bottom: 0 }}
            >
              <defs>
                <linearGradient id="evolucaoCasos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4180ab" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#4180ab" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f1f5f9"
              />
              <XAxis
                dataKey="data"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 500 }}
                minTickGap={20}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 500 }}
                allowDecimals={false}
                domain={[0, "dataMax + 2"]}
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
                formatter={(value) => [`${value} casos`, "Total"]}
                labelStyle={{
                  fontWeight: 700,
                  color: "#0f172a",
                  marginBottom: 4,
                }}
              />
              <ReferenceLine
                y={media}
                stroke="#f59e0b"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: `média ${media}`,
                  position: "insideTopRight",
                  fontSize: 10,
                  fill: "#f59e0b",
                  fontWeight: 600,
                }}
              />
              <Area
                type="monotone"
                dataKey="casos"
                stroke="#4180ab"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#evolucaoCasos)"
                dot={{
                  r: 3.5,
                  fill: "#4180ab",
                  strokeWidth: 2,
                  stroke: "#fff",
                }}
                activeDot={{ r: 6, strokeWidth: 0, fill: "#054060" }}
              />
              {pico && (
                <ReferenceDot
                  x={pico.data}
                  y={pico.casos}
                  r={5}
                  fill="#054060"
                  stroke="#fff"
                  strokeWidth={2}
                  label={{
                    value: `pico ${pico.casos}`,
                    position: "top",
                    fontSize: 10,
                    fill: "#054060",
                    fontWeight: 700,
                  }}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
