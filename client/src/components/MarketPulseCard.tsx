import React from "react";

interface MarketPulseCardProps {
    index: string;
    value: string;
    changePercent: number;
    sparklineData?: number[];
    isHighlighted?: boolean;
}

const MarketPulseCard: React.FC<MarketPulseCardProps> = ({
    index,
    value,
    changePercent,
    sparklineData = [0, 25, 20, 10, 15, 20, 5, 10, 2],
    isHighlighted = false,
}) => {
    const isPositive = changePercent >= 0;
    const color = isPositive ? "#4CAF50" : "#EF5350";

    // Generate SVG path from sparkline data
    const generatePath = (data: number[]) => {
        const max = Math.max(...data);
        const min = Math.min(...data);
        const range = max - min || 1;
        const width = 100;
        const height = 30;

        const points = data.map((val, i) => {
            const x = (i / (data.length - 1)) * width;
            const y = height - ((val - min) / range) * height;
            return `${x} ${y}`;
        });

        return `M${points.join(" L")}`;
    };

    const pathData = generatePath(sparklineData);
    const fillPath = `${pathData} V30 H0 Z`;

    return (
        <div
            className={`flex flex-col p-4 rounded-xl bg-surface-dark relative overflow-hidden group ${isHighlighted
                    ? "border border-primary/20 shadow-[0_0_15px_-5px_rgba(25,95,118,0.3)]"
                    : ""
                }`}
        >
            {isHighlighted && (
                <div className="absolute -right-4 -top-4 size-16 bg-primary/10 rounded-full blur-xl"></div>
            )}

            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-4xl">show_chart</span>
            </div>

            <div className="flex items-start justify-between mb-2 relative z-10">
                <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                    {index}
                </span>
                <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm ${isPositive
                            ? "bg-growth/20 text-growth"
                            : "bg-loss/20 text-loss"
                        }`}
                >
                    {isPositive ? "+" : ""}{changePercent.toFixed(1)}%
                </span>
            </div>

            <p className="text-xl font-bold tracking-tight mb-1 relative z-10">
                {value}
            </p>

            <svg
                className={`w-full h-8 overflow-visible relative z-10`}
                style={{ color }}
                fill="none"
                preserveAspectRatio="none"
                viewBox="0 0 100 30"
            >
                <defs>
                    <linearGradient id={`grad-${index}`} x1="0%" x2="0%" y1="0%" y2="100%">
                        <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.2 }} />
                        <stop offset="100%" style={{ stopColor: color, stopOpacity: 0 }} />
                    </linearGradient>
                </defs>
                <path
                    d={pathData}
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="2"
                    vectorEffect="non-scaling-stroke"
                />
                <path d={fillPath} fill={`url(#grad-${index})`} />
            </svg>
        </div>
    );
};

export default MarketPulseCard;
