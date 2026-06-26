/**
 * components/admin/chart-donut.tsx — Responsive SVG Donut Chart (Category Share)
 */
export function ChartDonut() {
  // Math: circumference = 2 * PI * r (for r=50, C = 314.16)
  // Slices: Tote(35%), Handbags(25%), Slings(20%), Laptop(15%), Accessories(5%)
  const categories = [
    { label: "Tote Bags", percent: 35, val: 110.0, offset: 0, color: "#D4A373" },
    { label: "Handbags", percent: 25, val: 78.5, offset: -110.0, color: "#1A1A1A" },
    { label: "Sling Bags", percent: 20, val: 62.8, offset: -188.5, color: "#A0522D" },
    { label: "Laptop Bags", percent: 15, val: 47.1, offset: -251.3, color: "#1B2A4A" },
    { label: "Accessories", percent: 5, val: 15.7, offset: -298.4, color: "#8FAF8B" },
  ];

  return (
    <div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
      {/* SVG Donut Circle */}
      <div className="relative h-44 w-44 flex-shrink-0">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          {/* Base circle background */}
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="transparent"
            stroke="#F5F5F5"
            strokeWidth="10"
          />

          {categories.map((cat, idx) => (
            <circle
              key={idx}
              cx="60"
              cy="60"
              r="50"
              fill="transparent"
              stroke={cat.color}
              strokeWidth="10"
              strokeDasharray={`${cat.val} 314.16`}
              strokeDashoffset={cat.offset}
              strokeLinecap={cat.percent > 2 ? "round" : "butt"} // round edges if big enough
              className="transition-all duration-300 hover:stroke-[12px] cursor-pointer"
            >
              <title>{`${cat.label}: ${cat.percent}%`}</title>
            </circle>
          ))}
        </svg>

        {/* Center content label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xl font-extrabold text-neutral-900 dark:text-white">100%</span>
          <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">Inventory</span>
        </div>
      </div>

      {/* Donut Legend */}
      <div className="flex-1 space-y-2 text-xs">
        {categories.map((cat, idx) => (
          <div key={idx} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                style={{ backgroundColor: cat.color }}
                className="h-2.5 w-2.5 rounded-full border border-neutral-300/30"
              />
              <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                {cat.label}
              </span>
            </div>
            <span className="font-bold text-neutral-900 dark:text-white">
              {cat.percent}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
