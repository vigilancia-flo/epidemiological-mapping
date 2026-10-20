import React, { useMemo } from "react";
import {
  Users,
  Activity,
  MapPin,
  CalendarHeart,
  AlertCircle,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import CasosRecentes from "@/components/CasosRecentes";
import DistribuicaoQuadrante from "@/components/DistribuicaoQuadrante";

const COLORS = ["#8b5cf6", "#d946ef", "#f43f5e", "#0ea5e9"];

export default function DashboardSifilis({ pacientes, distribuicaoUbs }) {
  const totalCasos = pacientes.length;
  const casosCongenita = pacientes.filter((p) =>
    p.id_agravo?.toUpperCase().includes("A50"),
  ).length;

  const bairrosAfetados = new Set(pacientes.map((p) => p.nm_ubs || p.un_saude))
    .size;

  const dadosTiposSifilis = useMemo(() => {
    const contagem = {
      "Congênita (A50)": 0,
      "Precoce (A51)": 0,
      "Tardia (A52)": 0,
      "Não Especificada (A53)": 0,
    };

    pacientes.forEach((p) => {
      const cid = p.id_agravo?.toUpperCase() || "";
      if (cid.includes("A50")) contagem["Congênita (A50)"]++;
      else if (cid.includes("A51")) contagem["Precoce (A51)"]++;
      else if (cid.includes("A52")) contagem["Tardia (A52)"]++;
      else contagem["Não Especificada (A53)"]++;
    });

    return Object.entries(contagem)
      .filter(([_, valor]) => valor > 0)
      .map(([nome, valor]) => ({ name: nome, value: valor }));
  }, [pacientes]);

  const dadosEvolucao = useMemo(() => {
    const contagemMes = {};
    pacientes.forEach((p) => {
      if (!p.data_notificacao) return;
      const data = new Date(p.data_notificacao);
      if (!isNaN(data)) {
        const mesAno = `${data.toLocaleString("pt-BR", { month: "short" })}/${data.getFullYear()}`;
        contagemMes[mesAno] = (contagemMes[mesAno] || 0) + 1;
      }
    });

    return Object.entries(contagemMes).map(([data, casos]) => ({
      data,
      casos,
    }));
  }, [pacientes]);

  const casosRecentesFormatados = [...pacientes]
    .sort((a, b) => new Date(b.data_notificacao) - new Date(a.data_notificacao))
    .slice(0, 5)
    .map((paciente) => {
      const isCongenita = paciente.id_agravo?.toUpperCase().includes("A50");
      const statusCor = isCongenita ? "bg-rose-500" : "bg-purple-500";

      return {
        name: `Notificação #${paciente.nu_notific || "S/N"}`,
        condition: `CID: ${paciente.id_agravo || "N/I"} | Data: ${paciente.data_notificacao_display ?? "-"}`,
        ubs: `UBS: ${paciente.nm_ubs || paciente.un_saude || "Não informada"}`,
        corClassificacao: statusCor,
        dadosOriginais: paciente,
      };
    });

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-500">
      {/* Linha 1: KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KpiCard
          title="Total de Notificações"
          value={totalCasos}
          icon={Users}
          color="bg-purple-500"
          bgLight="bg-purple-50"
        />
        <KpiCard
          title="Casos Congênitos (A50)"
          value={casosCongenita}
          icon={CalendarHeart}
          color="bg-pink-500"
          bgLight="bg-pink-50"
          subtitle="Atenção redobrada"
        />
        <KpiCard
          title="Unidades Envolvidas"
          value={bairrosAfetados}
          icon={MapPin}
          color="bg-indigo-500"
          bgLight="bg-indigo-50"
        />
        <KpiCard
          title="Taxa de Registro"
          value={`${totalCasos > 0 ? 100 : 0}%`}
          icon={Activity}
          color="bg-emerald-500"
          bgLight="bg-emerald-50"
          subtitle="Base atualizada"
        />
      </div>

      {/* Linha 2: Gráfico de Curva e Distribuição por UBS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Activity className="size-5 text-purple-600" /> Curva de
            Notificações
          </h3>
          <div className="h-60 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dadosEvolucao}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="data"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  minTickGap={20}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  width={30}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="casos"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  dot={{
                    r: 4,
                    fill: "#8b5cf6",
                    strokeWidth: 2,
                    stroke: "#fff",
                  }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Componente de Distribuição */}
        <DistribuicaoQuadrante distribuicaoUbs={distribuicaoUbs} />
      </div>

      {/* LINHA 3: Casos Recentes + Gráfico de Rosca */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-6 flex flex-col">
          <CasosRecentes
            casos={casosRecentesFormatados}
            onSelectPaciente={(paciente) => {
              console.log("Abrir paciente:", paciente);
            }}
          />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-6 flex flex-col">
          <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <AlertCircle className="size-5 text-purple-600" /> Classificação
            Clínica
          </h3>
          <div className="flex-1 min-h-[200px] sm:min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dadosTiposSifilis}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {dadosTiposSifilis.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-2 justify-center mt-2">
            {dadosTiposSifilis.map((entry, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1.5 text-[11px] sm:text-xs font-medium text-slate-600"
              >
                <span
                  className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full shrink-0"
                  style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                ></span>
                {entry.name}: {entry.value}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, icon: Icon, color, bgLight, subtitle }) {
  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3 sm:gap-4 transition-transform hover:-translate-y-1 duration-300">
      <div
        className={`shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center ${bgLight}`}
      >
        <Icon className={`size-6 sm:size-7 ${color.replace("bg-", "text-")}`} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs sm:text-sm font-semibold text-slate-500 truncate">
          {title}
        </p>
        <h4 className="text-xl sm:text-2xl font-black text-slate-800">
          {value}
        </h4>
        {subtitle && (
          <p className="text-[10px] sm:text-xs font-medium text-slate-400 mt-0.5 truncate">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
