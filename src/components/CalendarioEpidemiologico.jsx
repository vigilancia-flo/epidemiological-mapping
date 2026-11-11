// src/components/CalendarioEpidemiologico.jsx
import React, { useMemo } from "react";
import { ActivityCalendar } from "react-activity-calendar";
import { CalendarDays, TrendingUp } from "lucide-react";

const formatLocalDate = (d) => {
  const ano = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
};

export default function CalendarioEpidemiologico({
  pacientes = [],
  endemiaNome = "",
  filtroTipo = "todos", // 👈 Novas props vindas do Dashboard
  dataInicio = "",
  dataFim = "",
}) {
  const { dados, totalCasos, diasComCasos, diaMaisAtivo } = useMemo(() => {
    const contagem = {};
    pacientes.forEach((p) => {
      const dt = p.data_notificacao || p.dt_notific;
      if (!dt) return;
      const dia = dt.split("T")[0].split(" ")[0];
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dia)) return;
      contagem[dia] = (contagem[dia] || 0) + 1;
    });

    // 👇 LÓGICA DINÂMICA DE DATAS BASEADA NO FILTRO 👇
    let hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    let inicio, fim;

    if (filtroTipo === "personalizado" && dataInicio && dataFim) {
      inicio = new Date(dataInicio + "T00:00:00");
      fim = new Date(dataFim + "T23:59:59");
    } else if (filtroTipo === "esteAno") {
      inicio = new Date(hoje.getFullYear(), 0, 1);
      fim = new Date(hoje.getFullYear(), 11, 31);
    } else if (filtroTipo === "anoPassado") {
      inicio = new Date(hoje.getFullYear() - 1, 0, 1);
      fim = new Date(hoje.getFullYear() - 1, 11, 31);
    } else if (filtroTipo === "ultimoMes") {
      inicio = new Date(hoje);
      inicio.setMonth(inicio.getMonth() - 1);
      fim = new Date(hoje);
    } else if (filtroTipo === "ultimos3Meses") {
      inicio = new Date(hoje);
      inicio.setMonth(inicio.getMonth() - 3);
      fim = new Date(hoje);
    } else if (filtroTipo === "ultimos6Meses") {
      inicio = new Date(hoje);
      inicio.setMonth(inicio.getMonth() - 6);
      fim = new Date(hoje);
    } else {
      // Se for "todos" ou não tiver filtro, busca o min e max das datas dos pacientes
      // para o calendário se adaptar automaticamente aos dados reais
      if (pacientes.length > 0) {
        let minDate = null;
        let maxDate = null;
        pacientes.forEach((p) => {
          const dt = p.data_notificacao || p.dt_notific;
          if (dt) {
            const d = new Date(dt.split("T")[0] + "T00:00:00");
            if (!isNaN(d.getTime())) {
              if (!minDate || d < minDate) minDate = d;
              if (!maxDate || d > maxDate) maxDate = d;
            }
          }
        });
        if (minDate && maxDate) {
          inicio = new Date(minDate);
          // Adiciona uma folga no final se for o mesmo dia, só para renderizar o grid
          fim = new Date(maxDate);
          if (inicio.getTime() === fim.getTime()) {
            fim.setDate(fim.getDate() + 7);
          }
        } else {
          inicio = new Date(hoje);
          inicio.setDate(inicio.getDate() - 364);
          fim = new Date(hoje);
        }
      } else {
        inicio = new Date(hoje);
        inicio.setDate(inicio.getDate() - 364);
        fim = new Date(hoje);
      }
    }

    // Caso a data de início seja maior que a de fim por algum erro no input
    if (inicio > fim) {
      const temp = inicio;
      inicio = fim;
      fim = temp;
    }

    const arr = [];
    const cursor = new Date(inicio);
    while (cursor <= fim) {
      const iso = formatLocalDate(cursor);
      arr.push({ date: iso, count: contagem[iso] || 0, level: 0 });
      cursor.setDate(cursor.getDate() + 1);
    }

    const max = Math.max(...arr.map((a) => a.count), 1);
    arr.forEach((item) => {
      if (item.count === 0) item.level = 0;
      else if (item.count <= max * 0.25) item.level = 1;
      else if (item.count <= max * 0.5) item.level = 2;
      else if (item.count <= max * 0.75) item.level = 3;
      else item.level = 4;
    });

    const total = arr.reduce((s, a) => s + a.count, 0);
    const dias = arr.filter((a) => a.count > 0).length;
    const pico = arr.reduce(
      (m, a) => (a.count > m.count ? a : m),
      arr[0] || { count: 0, date: "" },
    );

    return {
      dados: arr,
      totalCasos: total,
      diasComCasos: dias,
      diaMaisAtivo: pico,
    };
  }, [pacientes, filtroTipo, dataInicio, dataFim]); // 👈 Adicionado as dependências

  if (totalCasos === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 md:p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 rounded-xl bg-[#4180ab]/10 text-[#4180ab]">
            <CalendarDays className="size-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">
              Calendário Epidemiológico {endemiaNome ? `— ${endemiaNome}` : ""}
            </h3>
            <p className="text-xs text-slate-500">Período selecionado</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="size-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-3">
            <CalendarDays className="size-6 text-slate-300" strokeWidth={1.5} />
          </div>
          <p className="text-sm font-semibold text-slate-600">
            Sem notificações no período
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Os registros diários aparecerão aqui conforme forem inseridos.
          </p>
        </div>
      </div>
    );
  }

  const PALETA_EPIDEMIOLOGICA = [
    "#ebedf0",
    "#bbf7d0",
    "#fde047",
    "#fb923c",
    "#ef4444",
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 md:p-6 w-full overflow-hidden">
      <div className="flex items-start justify-between gap-3 mb-5">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-[#4180ab]/10 text-[#4180ab]">
            <CalendarDays className="size-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">
              Calendário Epidemiológico {endemiaNome ? `— ${endemiaNome}` : ""}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {totalCasos} casos em {diasComCasos} dias · Período filtrado
            </p>
          </div>
        </div>
        {diaMaisAtivo.count > 0 && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-rose-50 border border-rose-100 rounded-full shrink-0">
            <TrendingUp className="size-3.5 text-rose-600" />
            <span className="text-[11px] font-semibold text-rose-700">
              Pico: {diaMaisAtivo.count} em{" "}
              {diaMaisAtivo.date.split("-").reverse().join("/")}
            </span>
          </div>
        )}
      </div>

      <div className="overflow-x-auto pb-1">
        <ActivityCalendar
          data={dados}
          theme={{
            light: PALETA_EPIDEMIOLOGICA,
            dark: PALETA_EPIDEMIOLOGICA,
          }}
          labels={{
            legend: { less: "Menos", more: "Mais" },
            months: [
              "Jan",
              "Fev",
              "Mar",
              "Abr",
              "Mai",
              "Jun",
              "Jul",
              "Ago",
              "Set",
              "Out",
              "Nov",
              "Dez",
            ],
            totalCount: "{{count}} casos no período",
            weekdays: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
          }}
          renderBlock={(block, activity) => {
            const [ano, mes, dia] = activity.date.split("-");
            const dataFormatada = `${dia}/${mes}/${ano}`;

            let tooltipText = "";
            if (activity.count === 0) {
              tooltipText = `Nenhum caso em ${dataFormatada}`;
            } else if (activity.count === 1) {
              tooltipText = `1 caso em ${dataFormatada}`;
            } else {
              tooltipText = `${activity.count} casos em ${dataFormatada}`;
            }

            return (
              <g>
                <title>{tooltipText}</title>
                {block}
              </g>
            );
          }}
          showWeekdayLabels
          blockSize={12}
          blockMargin={3}
          fontSize={11}
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500">
        <span>
          <strong className="text-slate-700">Média diária:</strong>{" "}
          {(totalCasos / (dados.length || 1)).toFixed(2)} casos
        </span>
        <span>
          <strong className="text-slate-700">Dias sem casos:</strong>{" "}
          {dados.length - diasComCasos}
        </span>
        <span>
          <strong className="text-slate-700">Dias com casos:</strong>{" "}
          {diasComCasos}
        </span>
      </div>
    </div>
  );
}
