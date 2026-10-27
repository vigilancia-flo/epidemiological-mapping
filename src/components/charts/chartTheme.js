// components/charts/chartTheme.js
export const CHART_COLORS = {
  primary: "#4180ab",
  primaryDark: "#054060",
  accent: "#f59e0b",
  danger: "#e11d48",
  success: "#10b981",
  muted: "#94a3b8",
  grid: "#f1f5f9",
};

export const axisProps = {
  axisLine: false,
  tickLine: false,
  tick: { fill: "#94a3b8", fontSize: 11, fontWeight: 500 },
};

export const tooltipProps = {
  cursor: { fill: "rgba(65,128,171,0.06)" },
  contentStyle: {
    borderRadius: 12,
    border: "1px solid #e2e8f0",
    boxShadow: "0 12px 32px -8px rgba(15,23,42,0.15)",
    fontSize: 12,
    padding: "8px 12px",
  },
  labelStyle: { fontWeight: 700, color: "#0f172a", marginBottom: 4 },
  itemStyle: { color: "#475569" },
};
