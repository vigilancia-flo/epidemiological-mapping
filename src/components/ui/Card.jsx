// components/ui/Card.jsx
export function Card({ children, className = "", hover = true }) {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-100/80 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ${
        hover
          ? "hover:shadow-[0_8px_24px_-8px_rgba(15,23,42,0.12)] transition-shadow duration-300"
          : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-start gap-3 mb-5">
      {Icon && (
        <div className="p-2 rounded-xl bg-[#4180ab]/10 text-[#4180ab]">
          <Icon className="size-4" strokeWidth={2.2} />
        </div>
      )}
      <div>
        <h3 className="text-base font-bold text-slate-800 tracking-tight">
          {title}
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}
