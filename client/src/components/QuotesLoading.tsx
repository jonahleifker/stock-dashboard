import React from "react";

const QuotesLoading: React.FC = () => {
    return (
        <div className="flex-1 overflow-y-auto overflow-x-hidden relative bg-background-dark">
            {/* Loading Indicator Line */}
            <div className="absolute top-0 left-0 w-full h-0.5 bg-surface-dark overflow-hidden">
                <div className="h-full bg-primary/50 w-1/3 absolute top-0 left-0 animate-[shimmer_1.5s_infinite_linear]"></div>
            </div>
            <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-8 flex flex-col gap-6">
                {/* Headline Section */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <h2 className="text-white text-3xl font-bold tracking-tight mb-2">
                            Market Movers
                        </h2>
                        <p className="text-white/50 text-sm">
                            Top performing stocks based on your preferences.
                        </p>
                    </div>
                </div>
                {/* Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-4 p-1">
                    <div className="flex items-center bg-surface-dark/50 p-1 rounded-full">
                        <button className="px-4 py-2 rounded-full bg-white/10 text-white text-sm font-bold shadow-sm">
                            All
                        </button>
                        <button className="px-4 py-2 rounded-full text-white/60 hover:text-white text-sm font-medium transition-colors">
                            Gainers
                        </button>
                        <button className="px-4 py-2 rounded-full text-white/60 hover:text-white text-sm font-medium transition-colors">
                            Losers
                        </button>
                        <button className="px-4 py-2 rounded-full text-white/60 hover:text-white text-sm font-medium transition-colors">
                            Active
                        </button>
                    </div>
                    <div className="flex gap-2">
                        <button className="p-2.5 rounded-full text-white/70 hover:text-white hover:bg-surface-dark transition-colors">
                            <span className="material-symbols-outlined">tune</span>
                        </button>
                        <button className="p-2.5 rounded-full text-white/70 hover:text-white hover:bg-surface-dark transition-colors">
                            <span className="material-symbols-outlined">sort</span>
                        </button>
                        <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 hover:bg-primary/20 text-primary text-sm font-bold transition-colors">
                            <span className="material-symbols-outlined text-[20px]">
                                add
                            </span>
                            <span>Add Ticker</span>
                        </button>
                    </div>
                </div>
                {/* Data Table (Skeleton State) */}
                <div className="w-full rounded-3xl border border-white/5 bg-surface-dark/30 overflow-hidden shadow-2xl shadow-black/40">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[800px]">
                            <thead>
                                <tr className="border-b border-white/5 bg-surface-dark">
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white/40 uppercase tracking-wider w-[25%]">
                                        Symbol
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-white/40 uppercase tracking-wider w-[15%]">
                                        Price
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-white/40 uppercase tracking-wider w-[15%]">
                                        Change %
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-white/40 uppercase tracking-wider w-[15%]">
                                        Market Cap
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-white/40 uppercase tracking-wider w-[15%]">
                                        Volume
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-white/40 uppercase tracking-wider w-[15%]">
                                        7-Day Trend
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {/* Skeleton Rows */}
                                {[0, 75, 150, 225, 300, 375, 450, 525].map((delay, index) => (
                                    <tr
                                        key={index}
                                        className="group animate-pulse"
                                        style={{ animationDelay: `${delay}ms` }}
                                    >
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="size-10 rounded-full bg-surface-dark bg-opacity-50"></div>
                                                <div className="flex flex-col gap-2">
                                                    <div className="h-4 w-16 bg-surface-dark bg-opacity-50 rounded-full"></div>
                                                    <div className="h-3 w-24 bg-surface-dark bg-opacity-30 rounded-full"></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="h-5 w-20 bg-surface-dark bg-opacity-50 rounded-full ml-auto"></div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="h-5 w-16 bg-surface-dark bg-opacity-40 rounded-full ml-auto"></div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="h-5 w-24 bg-surface-dark bg-opacity-50 rounded-full ml-auto"></div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="h-5 w-20 bg-surface-dark bg-opacity-30 rounded-full ml-auto"></div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="h-8 w-24 bg-surface-dark bg-opacity-20 rounded ml-auto relative overflow-hidden">
                                                {/* Simulated Trend Wave */}
                                                <svg
                                                    className="absolute bottom-0 left-0 right-0 h-full w-full text-surface-dark text-opacity-40"
                                                    preserveAspectRatio="none"
                                                    viewBox="0 0 100 40"
                                                >
                                                    <path
                                                        d="M0 30 Q 10 20, 20 30 T 40 30 T 60 20 T 80 30 T 100 10"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                    ></path>
                                                </svg>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                {/* Footer / Pagination Placeholders */}
                <div className="flex items-center justify-between px-2 pt-2 pb-6">
                    <div className="h-4 w-32 bg-surface-dark bg-opacity-30 rounded-full animate-pulse"></div>
                    <div className="flex gap-2">
                        <div className="h-8 w-8 bg-surface-dark bg-opacity-50 rounded-full animate-pulse"></div>
                        <div className="h-8 w-8 bg-surface-dark bg-opacity-50 rounded-full animate-pulse"></div>
                        <div className="h-8 w-8 bg-surface-dark bg-opacity-50 rounded-full animate-pulse"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuotesLoading;
