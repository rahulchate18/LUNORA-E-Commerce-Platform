/**
 * components/admin/chart-line.tsx — Responsive SVG Line Chart (Monthly Sales)
 */
import { formatPrice } from "@/lib/mock-data";

export function ChartLine() {
  // Mock monthly sales count: Jan(25), Feb(32), Mar(55), Apr(48), May(74), Jun(95)
  // Dimensions coordinate maps: x, y (for viewBox 0 0 500 220)
  const points = [
    { x: 50, y: 180, label: "Jan", val: 25 },
    { x: 130, y: 160, label: "Feb", val: 32 },
    { x: 210, y: 110, label: "Mar", val: 55 },
    { x: 290, y: 125, label: "Apr", val: 48 },
    { x: 370, y: 70, label: "May", val: 74 },
    { x: 450, y: 30, label: "Jun", val: 95 },
  ];

  // Build SVG path
  const pathData = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  const areaData = `${pathData} L ${points[points.length - 1].x} 190 L ${points[0].x} 190 Z`;

  return (
    <div className="w-full">
      <svg
        viewBox="0 0 500 220"
        className="w-full overflow-visible text-neutral-400 dark:text-neutral-600"
      >
        {/* Gradients */}
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#D4A373" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#D4A373" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Gridlines */}
        <line x1="50" y1="30" x2="450" y2="30" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3" />
        <line x1="50" y1="70" x2="450" y2="70" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3" />
        <line x1="50" y1="110" x2="450" y2="110" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3" />
        <line x1="50" y1="150" x2="450" y2="150" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3" />

        {/* Base Line */}
        <line x1="50" y1="190" x2="450" y2="190" stroke="currentColor" strokeWidth="1" />

        {/* Filled Area */}
        <path d={areaData} fill="url(#lineGrad)" />

        {/* Plot Line */}
        <path
          d={pathData}
          fill="none"
          stroke="#D4A373"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {points.map((p, idx) => (
          <g key={idx} className="group/dot cursor-pointer">
            <circle
              cx={p.x}
              cy={p.y}
              r="4"
              fill="#D4A373"
              stroke="#FFF"
              strokeWidth="1.5"
              className="transition-all duration-200 group-hover/dot:r-6"
            />
            {/* Tooltip tooltip text overlays on hover */}
            <rect
              x={p.x - 20}
              y={p.y - 30}
              width="40"
              height="18"
              rx="4"
              fill="#1A1A1A"
              className="hidden group-hover/dot:block"
            />
            <text
              x={p.x}
              y={p.y - 18}
              fill="#FFF"
              fontSize="9"
              fontWeight="bold"
              textAnchor="middle"
              className="hidden group-hover/dot:block"
            >
              {p.val}
            </text>

            {/* X-axis Month Label */}
            <text
              x={p.x}
              y="210"
              fill="currentColor"
              fontSize="10"
              fontWeight="semibold"
              textAnchor="middle"
            >
              {p.label}
            </text>
          </g>
        ))}

        {/* Y-axis Labels */}
        <text x="25" y="34" fill="currentColor" fontSize="8" fontWeight="bold" textAnchor="middle">100</text>
        <text x="25" y="74" fill="currentColor" fontSize="8" fontWeight="bold" textAnchor="middle">75</text>
        <text x="25" y="114" fill="currentColor" fontSize="8" fontWeight="bold" textAnchor="middle">50</text>
        <text x="25" y="154" fill="currentColor" fontSize="8" fontWeight="bold" textAnchor="middle">25</text>
        <text x="25" y="194" fill="currentColor" fontSize="8" fontWeight="bold" textAnchor="middle">0</text>
      </svg>
    </div>
  );
}
