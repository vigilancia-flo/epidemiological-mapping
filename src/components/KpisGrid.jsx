// KpisGrid.jsx
import React from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Line, LineChart, ResponsiveContainer } from "recharts";

const COLOR_MAP = {
  blue: {
    border: "border-l-blue-500",
    text: "text-blue-600",
    bg: "bg-blue-50",
    spark: "#3b82f6",
  },
  emerald: {
    border: "border-l-emerald-500",
    text: "text-emerald-600",
    bg: "bg-emerald-50",
    spark: "#10b981",
  },
  amber: {
    border: "border-l-amber-500",
    text: "text-amber-600",
    bg: "bg-amber-50",
    spark: "#f59e0b",
  },
  rose: {
    border: "border-l-rose-500",
    text: "text-rose-600",
    bg: "bg-rose-50",
    spark: "#e11d48",
  },
  green: {
    border: "border-l-green-500",
    text: "text-green-600",
    bg: "bg-green-50",
    spark: "#22c55e",
  },
};

export default function KpisGrid({ kpis }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {kpis.map((kpi, idx) => {
        const colors = COLOR_MAP[kpi.color] || COLOR_MAP.blue;
        const trend = kpi.trend || "neutral";
        const trendValue = kpi.trendValue || "0%";
        const temSparkline =
          Array.isArray(kpi.sparkline) && kpi.sparkline.length > 1;

        return (
          <div
            key={idx}
            className={`bg-white rounded-2xl shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:shadow-[0_8px_24px_-8px_rgba(15,23,42,0.12)] transition-all duration-300 border border-slate-100 p-5 md:p-6 border-l-4 ${colors.border} flex flex-col justify-between group`}
          >
            <div className="flex justify-between items-start gap-3">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-semibold text-slate-500 mb-1 truncate">
                  {kpi.title}
                </p>
                <h3 className="text-3xl sm:text-[28px] font-extrabold text-slate-800 tracking-tight leading-none">
                  {kpi.value}
                </h3>
              </div>
              <div
                className={`p-2.5 rounded-xl ${colors.bg} ${colors.text} group-hover:scale-110 transition-transform duration-300 shrink-0`}
              >
                <kpi.icon className="size-5" strokeWidth={2.2} />
              </div>
            </div>

            {temSparkline && (
              <div className="h-8 -mx-2 mt-3">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={kpi.sparkline}>
                    <Line
                      type="monotone"
                      dataKey="v"
                      stroke={colors.spark}
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="flex items-center justify-between mt-4 gap-2">
              <p className="text-[11px] font-medium text-slate-400 truncate">
                {kpi.subtext}
              </p>

              {trend !== "neutral" && (
                <div
                  className={`flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full shrink-0 ${
                    trend === "up"
                      ? "bg-rose-50 text-rose-600"
                      : "bg-emerald-50 text-emerald-600"
                  }`}
                >
                  {trend === "up" ? (
                    <ArrowUpRight className="size-3" strokeWidth={2.5} />
                  ) : (
                    <ArrowDownRight className="size-3" strokeWidth={2.5} />
                  )}
                  {trendValue}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
