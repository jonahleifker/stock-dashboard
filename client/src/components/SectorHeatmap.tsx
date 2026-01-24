import React, { useEffect, useState } from "react";
import { stockApi, SectorPerformance } from "../lib/api";

interface SectorData {
    name: string;
    ticker: string;
    changePercent: number;
    size: "large" | "medium" | "small";
}

const SectorHeatmap: React.FC = () => {
    const [sectors, setSectors] = useState<SectorData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSectors = async () => {
            try {
                const data = await stockApi.getSectors();

                // Map backend data to frontend model
                // We need to map the backend sectors to our heatmap layout
                // The backend returns sectors sorted by performance

                // This is a mapping from Sector Name to ETF Ticker
                const sectorTickerMap: Record<string, string> = {
                    "Technology": "XLK",
                    "Financial Services": "XLF",
                    "Healthcare": "XLV",
                    "Consumer Cyclical": "XLY",
                    "Energy": "XLE",
                    "Real Estate": "XLRE",
                    "Utilities": "XLU",
                    "Basic Materials": "XLB",
                    "Industrials": "XLI",
                    "Communication Services": "XLC",
                    "Consumer Defensive": "XLP"
                };

                // Filter for the main sectors we want to display in the grid
                // Ideally this would be dynamic, but the grid layout is somewhat fixed
                // So we'll map the top ones or specific ones

                // For this heatmap grid, we need 6 specific slots
                // Let's try to map the specific sectors we have slots for
                const targetSectors = [
                    { name: "Tech", fullName: "Technology", size: "large" },
                    { name: "Finance", fullName: "Financial Services", size: "medium" },
                    { name: "Health", fullName: "Healthcare", size: "medium" },
                    { name: "Retail", fullName: "Consumer Cyclical", size: "medium" }, // Approx
                    { name: "Energy", fullName: "Energy", size: "medium" },
                    { name: "Real Estate", fullName: "Real Estate", size: "small" }
                ];

                const mappedSectors: SectorData[] = targetSectors.map(target => {
                    const sectorData = data.find(s => s.sector === target.fullName) ||
                        data.find(s => s.sector.includes(target.name)); // Fallback loose match

                    return {
                        name: target.name,
                        ticker: sectorTickerMap[target.fullName] || "UNKNOWN",
                        changePercent: sectorData ? sectorData.avgChange30d : 0,
                        size: target.size as "large" | "medium" | "small"
                    };
                });

                setSectors(mappedSectors);
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch sectors:", err);
                setError("Failed to load sector data");
                setLoading(false);
            }
        };

        fetchSectors();
    }, []);

    const getBackgroundColor = (changePercent: number) => {
        if (changePercent > 2) return "#1a4731";
        if (changePercent > 1) return "#2e5c42";
        if (changePercent > 0) return "#143926";
        if (changePercent > -1) return "#4a2222";
        return "#5c2b2b";
    };

    const getHoverColor = (changePercent: number) => {
        if (changePercent > 2) return "#1f563b";
        if (changePercent > 1) return "#366d4e";
        if (changePercent > 0) return "#1a4831";
        if (changePercent > -1) return "#5e2b2b";
        return "#6e3333";
    };

    if (loading) {
        return (
            <section className="px-5 mt-8">
                <h3 className="text-lg font-bold tracking-tight mb-3">Sector Heatmap</h3>
                <div className="w-full h-[280px] bg-surface-dark/50 animate-pulse rounded-xl"></div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="px-5 mt-8">
                <h3 className="text-lg font-bold tracking-tight mb-3">Sector Heatmap</h3>
                <div className="w-full h-[280px] flex items-center justify-center bg-surface-dark border border-loss/30 rounded-xl text-loss">
                    {error}
                </div>
            </section>
        );
    }

    // Helper to get sector by name safely
    const getSector = (name: string) => sectors.find(s => s.name === name) || { name, ticker: "", changePercent: 0 };

    return (
        <section className="px-5 mt-8">
            <h3 className="text-lg font-bold tracking-tight mb-3">Sector Heatmap</h3>

            <div className="w-full h-[280px] grid grid-cols-4 grid-rows-4 gap-1.5 rounded-xl overflow-hidden bg-background-dark border border-surface-dark/50">
                {/* Technology: Large Block */}
                {(() => {
                    const sector = getSector("Tech");
                    return (
                        <div
                            className="col-span-2 row-span-2 p-3 flex flex-col justify-between cursor-pointer relative group transition-colors"
                            style={{
                                backgroundColor: getBackgroundColor(sector.changePercent),
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = getHoverColor(sector.changePercent);
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = getBackgroundColor(sector.changePercent);
                            }}
                        >
                            <div className="flex justify-between items-start">
                                <span className="text-xs font-bold text-white/90">{sector.name}</span>
                                <span className="text-xs font-bold text-white">
                                    {sector.changePercent > 0 ? "+" : ""}{sector.changePercent.toFixed(1)}%
                                </span>
                            </div>
                            <span className="text-[10px] text-white/50 uppercase">{sector.ticker}</span>
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                        </div>
                    );
                })()}

                {/* Finance: Medium */}
                {(() => {
                    const sector = getSector("Finance");
                    return (
                        <div
                            className="col-span-2 row-span-1 p-3 flex flex-col justify-between cursor-pointer relative transition-colors"
                            style={{ backgroundColor: getBackgroundColor(sector.changePercent) }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = getHoverColor(sector.changePercent);
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = getBackgroundColor(sector.changePercent);
                            }}
                        >
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-white/90">{sector.name}</span>
                                <span className="text-xs font-bold text-white">
                                    {sector.changePercent > 0 ? "+" : ""}{sector.changePercent.toFixed(1)}%
                                </span>
                            </div>
                        </div>
                    );
                })()}

                {/* Health: Medium Vertical */}
                {(() => {
                    const sector = getSector("Health");
                    return (
                        <div
                            className="col-span-1 row-span-2 p-2 flex flex-col justify-between cursor-pointer relative transition-colors"
                            style={{ backgroundColor: getBackgroundColor(sector.changePercent) }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = getHoverColor(sector.changePercent);
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = getBackgroundColor(sector.changePercent);
                            }}
                        >
                            <div>
                                <span className="text-[10px] font-bold text-white/90 block">{sector.name}</span>
                                <span className="text-[10px] font-bold text-white block">
                                    {sector.changePercent > 0 ? "+" : ""}{sector.changePercent.toFixed(1)}%
                                </span>
                            </div>
                            <span className="text-[9px] text-white/50 uppercase">{sector.ticker}</span>
                        </div>
                    );
                })()}

                {/* Retail */}
                {(() => {
                    const sector = getSector("Retail");
                    return (
                        <div
                            className="col-span-1 row-span-2 p-2 flex flex-col justify-between cursor-pointer relative transition-colors"
                            style={{ backgroundColor: getBackgroundColor(sector.changePercent) }} // Use actual value
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = getHoverColor(sector.changePercent);
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = getBackgroundColor(sector.changePercent);
                            }}
                        >
                            <div>
                                <span className="text-[10px] font-bold text-white/90 block">{sector.name}</span>
                                <span className="text-[10px] font-bold text-white block">
                                    {sector.changePercent > 0 ? "+" : ""}{sector.changePercent.toFixed(1)}%
                                </span>
                            </div>
                            <span className="text-[9px] text-white/50 uppercase">{sector.ticker}</span>
                        </div>
                    );
                })()}

                {/* Energy */}
                {(() => {
                    const sector = getSector("Energy");
                    return (
                        <div
                            className="col-span-2 row-span-1 p-3 flex items-center justify-between cursor-pointer relative transition-colors"
                            style={{ backgroundColor: getBackgroundColor(sector.changePercent) }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = getHoverColor(sector.changePercent);
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = getBackgroundColor(sector.changePercent);
                            }}
                        >
                            <span className="text-xs font-bold text-white/90">{sector.name}</span>
                            <span className="text-xs font-bold text-white">
                                {sector.changePercent > 0 ? "+" : ""}{sector.changePercent.toFixed(1)}%
                            </span>
                        </div>
                    );
                })()}

                {/* Utilities (Reusing Real Estate style slot for now or just generic) */}
                <div
                    className="col-span-1 row-span-1 p-2 flex items-center justify-center cursor-pointer relative transition-colors"
                    style={{ backgroundColor: getBackgroundColor(-0.8) }} // Keep hardcoded or map strictly if needed
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = getHoverColor(-0.8);
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = getBackgroundColor(-0.8);
                    }}
                >
                    <span className="text-[10px] font-bold text-white/90">-0.8%</span>
                </div>

                {/* Real Estate */}
                {(() => {
                    const sector = getSector("Real Estate");
                    return (
                        <div
                            className="col-span-3 row-span-1 p-2 flex items-center justify-between cursor-pointer relative transition-colors"
                            style={{ backgroundColor: getBackgroundColor(sector.changePercent) }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = getHoverColor(sector.changePercent);
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = getBackgroundColor(sector.changePercent);
                            }}
                        >
                            <span className="text-xs font-bold text-white/90">{sector.name}</span>
                            <span className="text-xs font-bold text-white">
                                {sector.changePercent > 0 ? "+" : ""}{sector.changePercent.toFixed(1)}%
                            </span>
                        </div>
                    );
                })()}
            </div>
        </section>
    );
};

export default SectorHeatmap;
