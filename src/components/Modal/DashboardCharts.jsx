import React, { useMemo } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { useIsMobile } from "@/hooks/useIsMobile";

// 1. CURVA EPIDÊMICA (Gráfico de Linha)
// 1. CURVA EPIDÊMICA (Gráfico de Linha)
export function CurvaEpidemica({ pacientes }) {
  const isMobile = useIsMobile();

  const data = useMemo(() => {
    if (!pacientes?.length) return [];

    const map = new Map();
    const pad = (n) => String(n).padStart(2, "0");

    pacientes.forEach((p) => {
      if (!p.data_notificacao) return;
      const d = new Date(`${p.data_notificacao}T12:00:00`);
      if (isNaN(d)) return;

      const year = d.getFullYear();
      const jan1 = new Date(year, 0, 1, 12);
      const firstSunday = new Date(year, 0, 1 + ((7 - jan1.getDay()) % 7), 12);
      const se = Math.max(
        1,
        Math.floor((d - firstSunday) / (86400000 * 7)) + 1,
      );

      const key = `${year}-${pad(se)}`;
      const cur = map.get(key) || {
        key,
        year,
        se,
        start: firstSunday,
        casos: 0,
      };
      cur.casos += 1;
      map.set(key, cur);
    });

    return Array.from(map.values())
      .sort((a, b) => a.start - b.start)
      .map((v) => {
        const d = v.start;
        const dd = pad(d.getDate());
        const mm = pad(d.getMonth() + 1);
        const yy = String(d.getFullYear()).slice(-2);
        return {
          ...v,
          xLabel: `${dd}/${mm}/${yy}`,
          xLabelShort: `${dd}/${mm}`,
        };
      });
  }, [pacientes]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 md:p-6 flex flex-col h-full overflow-hidden w-full">
      <div className="mb-4 md:mb-6 flex items-start justify-between gap-2">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Curva Epidêmica</h3>
          <p className="text-sm text-slate-500">
            Casos notificados por Semana Epidemiológica
          </p>
        </div>
        <span className="shrink-0 rounded-md border border-slate-100 bg-slate-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          SE
        </span>
      </div>

      <div className="flex-1 w-full min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{
              top: 10,
              right: isMobile ? 8 : 16,
              left: isMobile ? -28 : -20,
              bottom: 5,
            }}
          >
            <defs>
              <linearGradient id="grad-epi" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#e11d48" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#e11d48" stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#e2e8f0"
            />
            <XAxis
              dataKey={isMobile ? "xLabelShort" : "xLabel"}
              tick={{ fontSize: isMobile ? 10 : 12, fill: "#64748b" }}
              tickMargin={8}
              minTickGap={isMobile ? 20 : 24}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: isMobile ? 10 : 12, fill: "#64748b" }}
              width={isMobile ? 30 : 40}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip
              cursor={{
                stroke: "#e11d48",
                strokeWidth: 1,
                strokeDasharray: "4 4",
              }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="rounded-lg border border-slate-100 bg-white p-3 shadow-lg">
                    <p className="text-xs font-bold text-slate-800">
                      SE {String(d.se).padStart(2, "0")} / {d.year}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      <span className="font-bold text-rose-600">{d.casos}</span>{" "}
                      {d.casos === 1 ? "caso" : "casos"}
                    </p>
                  </div>
                );
              }}
            />

            <Area
              type="monotone"
              dataKey="casos"
              name="Casos"
              stroke="#e11d48"
              strokeWidth={2.5}
              fill="url(#grad-epi)"
              dot={false}
              activeDot={{
                r: 5,
                strokeWidth: 2,
                fill: "#fff",
                stroke: "#e11d48",
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function StatusDonut({ pacientes }) {
  // 1. Adicionamos o hook para detectar mobile
  const isMobile = useIsMobile();

  const data = useMemo(() => {
    let confirmado = 0,
      alarme = 0,
      descartado = 0,
      inconclusivo = 0,
      suspeito = 0;

    pacientes.forEach((p) => {
      // Pega o valor e remove espaços, garantindo que seja string
      const classFinal = String(p.classi_fin || "").trim();

      if (classFinal === "10") {
        confirmado++; // Dengue Confirmado / Clássico
      } else if (classFinal === "11") {
        alarme++; // Dengue com Sinais de Alarme
      } else if (classFinal === "5") {
        descartado++; // Descartado
      } else if (classFinal === "8") {
        inconclusivo++; // Inconclusivo / Outro agravo
      } else {
        suspeito++; // [Em branco] (Suspeito / Em investigação)
      }
    });

    return [
      { name: "Confirmado", value: confirmado, color: "#ef4444" }, // Vermelho
      { name: "Sinais de Alarme", value: alarme, color: "#9f1239" }, // Vermelho Escuro
      { name: "Suspeito/Investigação", value: suspeito, color: "#f59e0b" }, // Amarelo/Laranja
      { name: "Inconclusivo", value: inconclusivo, color: "#94a3b8" }, // Cinza
      { name: "Descartado", value: descartado, color: "#10b981" }, // Verde
    ].filter((item) => item.value > 0); // Remove os que estão zerados
  }, [pacientes]);

  return (
    // Ajustado padding e overflow para mobile
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 md:p-6 flex flex-col h-full w-full overflow-hidden mb-15">
      <div className="mb-2">
        <h3 className="text-lg font-bold text-slate-800">Status dos Casos</h3>
        <p className="text-sm text-slate-500">
          Proporção da classificação final
        </p>
      </div>
      {/* 2. Reduzimos a margem negativa no mobile para não cortar o gráfico */}
      <div
        className={`flex-1 min-h-[250px] md:min-h-62.5 relative ${isMobile ? "-mt-8" : "-mt-20"}`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              // 3. Deixamos o círculo um pouco menor em telas pequenas
              innerRadius={isMobile ? 50 : 60}
              outerRadius={isMobile ? 70 : 80}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              itemStyle={{ color: "#334155", fontWeight: "500" }}
              contentStyle={{
                borderRadius: "8px",
                border: "none",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div
          className={`flex flex-wrap justify-center gap-2 md:gap-3 ${isMobile ? "-mt-14" : "-mt-18.75"} pb-2`}
        >
          {data.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-600"
            >
              <span
                className="size-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color }}
              ></span>
              <span className="truncate">
                {item.name} ({item.value})
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ========= PERFIL DEMOGRÁFICO (Gráfico de Barras) =========
export function PerfilDemografico({ pacientes }) {
  const isMobile = useIsMobile();
  const data = useMemo(() => {
    const grupos = {
      "0-9": { faixa: "0-9", M: 0, F: 0 },
      "10-19": { faixa: "10-19", M: 0, F: 0 },
      "20-29": { faixa: "20-29", M: 0, F: 0 },
      "30-39": { faixa: "30-39", M: 0, F: 0 },
      "40-49": { faixa: "40-49", M: 0, F: 0 },
      "50-59": { faixa: "50-59", M: 0, F: 0 },
      "60+": { faixa: "60+", M: 0, F: 0 },
    };

    // Função auxiliar para calcular a idade
    const calcularIdade = (dataNasc) => {
      if (!dataNasc) return null;
      const nascimento = new Date(dataNasc);
      const hoje = new Date();
      let idade = hoje.getFullYear() - nascimento.getFullYear();
      const m = hoje.getMonth() - nascimento.getMonth();
      if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
        idade--;
      }
      return idade;
    };

    pacientes.forEach((p) => {
      // O SINAN geralmente salva sexo como "M", "F" ou "I" (Ignorado).
      // Lemos o cs_sexo do seu model:
      const sexo = p.cs_sexo === "M" ? "M" : p.cs_sexo === "F" ? "F" : null;
      const idade = calcularIdade(p.data_nascimento);

      if (sexo && idade !== null) {
        if (idade <= 9) grupos["0-9"][sexo]++;
        else if (idade <= 19) grupos["10-19"][sexo]++;
        else if (idade <= 29) grupos["20-29"][sexo]++;
        else if (idade <= 39) grupos["30-39"][sexo]++;
        else if (idade <= 49) grupos["40-49"][sexo]++;
        else if (idade <= 59) grupos["50-59"][sexo]++;
        else grupos["60+"][sexo]++;
      }
    });

    return Object.values(grupos);
  }, [pacientes]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col h-full">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-800">Perfil Demográfico</h3>
        <p className="text-sm text-slate-500">
          Distribuição por faixa etária e sexo
        </p>
      </div>
      <div className="flex-1 min-h-62.5">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 5, right: 0, left: -20, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#e2e8f0"
            />
            <XAxis
              dataKey="faixa"
              tick={{ fontSize: 11, fill: "#64748b" }}
              tickMargin={10}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 11, fill: "#64748b" }}
            />
            <Tooltip
              cursor={{ fill: "#f1f5f9" }}
              contentStyle={{
                borderRadius: "8px",
                border: "none",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
            />
            <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
            <Bar
              dataKey="M"
              name="Masculino"
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
              barSize={isMobile ? 8 : 12}
            />
            <Bar
              dataKey="F"
              name="Feminino"
              fill="#ec4899"
              radius={[4, 4, 0, 0]}
              barSize={isMobile ? 8 : 12}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
