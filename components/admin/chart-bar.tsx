/**
 * components/admin/chart-bar.tsx — Responsive SVG Bar Chart (Monthly Revenue in Thousands)
 */
export function ChartBar() {
  // Monthly Revenue (in thousands INR): Jan(45k), Feb(58k), Mar(112k), Apr(98k), May(154k), Jun(185k)
  const data = [
    { x: 50, y: 180, w: 32, h: 45, label: "Jan", val: "₹45K" },
    { x: 130, y: 180, w: 32, h: 58, label: "Feb", val: "₹58K" },
    { x: 210, y: 180, w: 32, h: 112, label: "Mar", val: "₹112K" },
    { x: 290, y: 180, w: 32, h: 98, label: "Apr", val: "₹98K" },
    { x: 370, y: 180, w: 32, h: 154, label: "May", val: "₹154K" },
    { x: 450, y: 180, w: 32, h: 185, label: "Jun", val: "₹185K" },
  ];

  return (
    <div className="w-full">
      <svg
        viewBox="0 0 500 220"
        className="w-full overflow-visible text-neutral-400 dark:text-neutral-600"
      >
        {/* Gridlines */}
        <line x1="50" y1="30" x2="480" y2="30" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3" />
        <line x1="50" y1="70" x2="480" y2="70" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3" />
        <line x1="50" y1="110" x2="480" y2="110" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3" />
        <line x1="50" y1="150" x2="480" y2="150" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3" />

        {/* Base axis */}
        <line x1="50" y1="190" x2="480" y2="190" stroke="currentColor" strokeWidth="1" />

        {/* Render bars */}
        {data.map((bar, idx) => {
          // Calculate top coordinate based on height (baseline is y=190)
          const barY = 190 - bar.h;
          
          return (
            <g key={idx} className="group/bar cursor-pointer">
              {/* Rectangle bar */}
              <rect
                x={bar.x - bar.w / 2}
                y={barY}
                width={bar.w}
                height={bar.h}
                rx="4"
                fill="#1A1A1A"
                className="transition-all duration-200 fill-neutral-800 hover:fill-[var(--color-accent)] dark:fill-neutral-700 dark:hover:fill-[var(--color-accent)]"
              />

              {/* Hover Value Labels */}
              <text
                x={bar.x}
                y={barY - 8}
                fill="currentColor"
                fontSize="9"
                fontWeight="bold"
                textAnchor="middle"
                className="hidden group-hover/bar:block text-neutral-900 dark:text-white"
              >
                {bar.val}
              </text>

              {/* X-axis Label */}
              <text
                x={bar.x}
                y="210"
                fill="currentColor"
                fontSize="10"
                fontWeight="semibold"
                textAnchor="middle"
              >
                {bar.label}
              </text>
            </g>
          );
        })}

        {/* Y-axis Labels */}
        <text x="25" y="34" fill="currentColor" fontSize="8" fontWeight="bold" textAnchor="middle">₹200K</text>
        <text x="25" y="74" fill="currentColor" fontSize="8" fontWeight="bold" textAnchor="middle">₹150K</text>
        <text x="25" y="114" fill="currentColor" fontSize="8" fontWeight="bold" textAnchor="middle">₹100K</text>
        <text x="25" y="154" fill="currentColor" fontSize="8" fontWeight="bold" textAnchor="middle">₹50K</text>
        <text x="25" y="194" fill="currentColor" fontSize="8" fontWeight="bold" textAnchor="middle">₹0</text>
      </svg>
    </div>
  );
}
