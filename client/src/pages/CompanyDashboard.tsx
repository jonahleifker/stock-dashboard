import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import CollapsibleSection from "../components/CollapsibleSection";
import Navbar from "../components/Navbar";
import AntiGravitySection from "../components/AntiGravitySection";
import NotesSection from "../components/NotesSection";
import ArticlesSection from "../components/ArticlesSection";
import { stockApi, StockQuote } from "../lib/api";

interface CompanyData {
    symbol: string;
    name: string;
    sector: string;
    price: number;
    change: number;
    changePercent: number;
    low52Week: number;
    high52Week: number;
    // Fundamentals
    pe?: number;
    peg?: number;
    ps?: number;
    eps?: number;
    dividendYield?: number;
    roe?: number;
    netMargin?: number;
    cash?: string;
    totalDebt?: string;
    earningsDate?: string;
    exDividendDate?: string;
    analystConsensus?: string;
    targetPrice?: number;
}

const CompanyDashboard: React.FC = () => {
    const { ticker } = useParams<{ ticker: string }>();
    const [stock, setStock] = useState<StockQuote | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Mock research data - placeholder until Manus AI is integrated
    const researchData = {
        summary: "Analysis pending integration with Manus AI. This section will provide automated research summaries.",
        keyFindings: [
            "Real-time data integration active",
            "Yahoo Finance connection established",
            "Waiting for AI service configuration"
        ],
        sentiment: {
            overall: 'neutral' as const,
            score: 0.5
        },
        completedAt: new Date().toISOString()
    };

    useEffect(() => {
        const fetchStockData = async () => {
            if (!ticker) return;
            try {
                setLoading(true);
                const data = await stockApi.getStock(ticker);
                if (data) {
                    setStock(data);
                } else {
                    setError("Stock not found");
                }
            } catch (err) {
                console.error("Error fetching stock:", err);
                setError("Failed to load stock data");
            } finally {
                setLoading(false);
            }
        };

        fetchStockData();
    }, [ticker]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-background-dark text-white">Loading...</div>;
    }

    if (error || !stock) {
        return <div className="min-h-screen flex items-center justify-center bg-background-dark text-error">{error || "Stock not found"}</div>;
    }

    // Map API data to component format
    // Note: Some fundamentals like PE, PEG, etc. might strictly come from a details endpoint
    // For now we use available data and placeholders for deep fundamentals if not in StockQuote
    const companyData: CompanyData = {
        symbol: stock.ticker,
        name: stock.companyName,
        sector: stock.sector || "Unknown Sector",
        price: stock.currentPrice,
        change: (stock.change7d || 0) / 100 * stock.currentPrice, // Approximation as 7d change derived
        changePercent: stock.change30d || 0, // Using 30d change as primary or 7d
        low52Week: 0, // Not currently passed in list view
        high52Week: stock.high1yr || 0,
        // Placeholders for deeper fundamentals (requires yahoo-finance2 quoteSummary in deeper fetch)
        pe: stock.pe,
        peg: stock.peg,
        ps: undefined, // Not currently fetched but could be added
        eps: stock.eps,
        dividendYield: stock.dividendYield,
        roe: stock.roe,
        netMargin: stock.netMargin,
        cash: stock.cash ? `$${(stock.cash / 1e9).toFixed(2)}B` : "N/A",
        totalDebt: stock.totalDebt ? `$${(stock.totalDebt / 1e9).toFixed(2)}B` : "N/A",
        earningsDate: stock.earningsDate ? new Date(stock.earningsDate).toLocaleDateString() : "N/A",
        exDividendDate: stock.exDividendDate ? new Date(stock.exDividendDate).toLocaleDateString() : "N/A",
        analystConsensus: stock.recommendation ? stock.recommendation.toUpperCase().replace('_', ' ') : "N/A",
        targetPrice: stock.targetPrice,
    };

    const isPositive = (stock.change30d || 0) >= 0;

    // Calculate range position (fallback if low52 is 0)
    const rangePosition = companyData.high52Week > 0
        ? ((companyData.price / companyData.high52Week) * 100 * 0.8) // Rough visual approx since we lack low52
        : 50;

    return (
        <div className="flex flex-col h-screen bg-background-dark overflow-hidden">
            <Navbar />
            <div className="flex-1 overflow-y-auto p-4 sm:p-8">
                <div className="mx-auto flex max-w-5xl flex-col gap-8">
                    {/* Ticker Header Section */}
                    <section className="flex flex-col gap-6 rounded-3xl bg-[#1e2b1a] p-6 sm:p-8 shadow-2xl ring-1 ring-white/5">
                        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
                            <div className="flex items-start gap-5">
                                <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-white p-3 shadow-lg">
                                    <span className="text-2xl font-bold text-black">{companyData.symbol.charAt(0)}</span>
                                </div>
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h1 className="text-3xl font-bold tracking-tight text-white">{companyData.symbol}</h1>
                                        <span className="rounded-full bg-[#2d372a] px-3 py-1 text-xs font-semibold text-[#a5b6a0]">{companyData.sector}</span>
                                    </div>
                                    <h2 className="mt-1 text-lg font-medium text-[#a5b6a0]">{companyData.name}</h2>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <div className="flex items-baseline gap-3">
                                    <span className="text-4xl font-bold tracking-tight text-white">${companyData.price.toFixed(2)}</span>
                                    <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 ${isPositive ? "bg-primary/10 text-primary" : "bg-red-500/10 text-red-500"}`}>
                                        <span className="material-symbols-outlined text-sm font-bold">{isPositive ? "arrow_upward" : "arrow_downward"}</span>
                                        <span className="text-sm font-bold">{isPositive ? "+" : ""}{(stock.change30d || 0).toFixed(2)}% (30d)</span>
                                    </div>
                                </div>
                                <span className="text-sm font-medium text-[#a5b6a0]">Last updated: {new Date().toLocaleTimeString()}</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex flex-wrap gap-3">
                                <button className="group flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-bold text-[#131712] transition-transform hover:scale-105 active:scale-95">
                                    <span className="material-symbols-outlined text-[20px]">add_circle</span>
                                    <span>Watchlist</span>
                                </button>
                                <button className="flex size-10 items-center justify-center rounded-full bg-[#2d372a] text-white transition-colors hover:bg-[#42513e]">
                                    <span className="material-symbols-outlined text-[20px]">ios_share</span>
                                </button>
                            </div>

                            <div className="flex flex-1 flex-col justify-end gap-2 lg:max-w-md">
                                <div className="flex justify-between text-xs font-medium text-[#a5b6a0]">
                                    <span>52W High: <span className="text-white">${companyData.high52Week.toFixed(2)}</span></span>
                                    <span>Market Cap: <span className="text-white">${((stock.marketCap || 0) / 1e9).toFixed(1)}B</span></span>
                                </div>
                                <div className="relative h-2.5 w-full rounded-full bg-[#2d372a]">
                                    {/* Visual range bar */}
                                    <div className="absolute top-1/2 flex size-4 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-background-dark bg-primary shadow-[0_0_10px_rgba(83,210,45,0.6)]" style={{ left: `${Math.min(rangePosition, 100)}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Column */}
                        <div className="lg:col-span-2 flex flex-col gap-6">

                            {/* Notes Section */}
                            <NotesSection ticker={companyData.symbol} />

                            {/* Articles Section */}
                            <ArticlesSection ticker={companyData.symbol} />

                            {/* Fundamentals Sections (Mock/Partial for now) */}
                            <div className="flex flex-col gap-3">
                                <h3 className="px-2 text-sm font-bold uppercase tracking-wider text-[#a5b6a0]">
                                    Fundamentals
                                </h3>

                                <CollapsibleSection
                                    title="Valuation Ratios"
                                    icon="payments"
                                    previewMetrics={[
                                        { label: "P/E (TTM)", value: companyData.pe?.toFixed(2) || "N/A" },
                                        { label: "PEG", value: companyData.peg?.toFixed(2) || "N/A" },
                                    ]}
                                >
                                    <div className="grid grid-cols-2 gap-4 p-4 text-sm">
                                        <div>
                                            <p className="text-gray-400">EPS (TTM)</p>
                                            <p className="font-medium text-white">${companyData.eps?.toFixed(2)}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400">Target Price</p>
                                            <p className="font-medium text-white">${companyData.targetPrice?.toFixed(2) || 'N/A'}</p>
                                        </div>
                                    </div>
                                </CollapsibleSection>

                                <CollapsibleSection
                                    title="Profitability & Balance Sheet"
                                    icon="account_balance"
                                    previewMetrics={[
                                        { label: "Net Margin", value: companyData.netMargin ? `${(companyData.netMargin * 100).toFixed(2)}%` : "N/A" },
                                        { label: "ROE", value: companyData.roe ? `${(companyData.roe * 100).toFixed(2)}%` : "N/A" },
                                    ]}
                                >
                                    <div className="grid grid-cols-2 gap-4 p-4 text-sm">
                                        <div>
                                            <p className="text-gray-400">Total Cash</p>
                                            <p className="font-medium text-white">{companyData.cash}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400">Total Debt</p>
                                            <p className="font-medium text-white">{companyData.totalDebt}</p>
                                        </div>
                                    </div>
                                </CollapsibleSection>

                                <CollapsibleSection
                                    title="Dividends & Earnings"
                                    icon="event"
                                    previewMetrics={[
                                        { label: "Yield", value: companyData.dividendYield ? `${(companyData.dividendYield * 100).toFixed(2)}%` : "N/A" },
                                        { label: "Ex-Div Date", value: companyData.exDividendDate || "N/A" },
                                    ]}
                                >
                                    <div className="grid grid-cols-1 gap-4 p-4 text-sm">
                                        <div>
                                            <p className="text-gray-400">Next Earnings</p>
                                            <p className="font-medium text-white">{companyData.earningsDate}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400">Analyst Rec</p>
                                            <p className="font-medium text-white">{companyData.analystConsensus}</p>
                                        </div>
                                    </div>
                                </CollapsibleSection>
                            </div>
                        </div>

                        {/* Sidebar Column */}
                        <div className="flex flex-col gap-6">

                            {/* Latest News Section */}
                            {stock.news && stock.news.length > 0 && (
                                <div className="flex flex-col gap-3">
                                    <h3 className="px-2 text-sm font-bold uppercase tracking-wider text-[#a5b6a0]">
                                        Latest News
                                    </h3>
                                    <div className="flex flex-col gap-2">
                                        {stock.news.map((item, idx) => (
                                            <a
                                                key={idx}
                                                href={item.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block p-3 rounded-2xl bg-[#1e2b1a] border border-white/5 hover:bg-[#2d372a] transition-colors"
                                            >
                                                <h4 className="text-xs font-bold text-white line-clamp-2 mb-1">{item.title}</h4>
                                                <div className="flex justify-between items-center text-[10px] text-gray-400">
                                                    <span>{item.publisher}</span>
                                                    <span>{item.providerPublishTime ? new Date(Number(item.providerPublishTime) * 1000).toLocaleDateString() : ''}</span>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {/* Anti-Gravity Section */}
                            <div className="flex flex-col gap-3">
                                <Link to={`/company/${companyData.symbol}/research`} className="flex items-center justify-between px-2 group cursor-pointer hover:bg-white/5 rounded-lg p-2 transition-colors">
                                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                                        <span className="material-symbols-outlined text-sm">auto_awesome</span>
                                        Anti-Gravity
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-[#a5b6a0] bg-[#1e2b1a] px-2 py-0.5 rounded-full border border-white/5">
                                            AI
                                        </span>
                                        <span className="material-symbols-outlined text-gray-500 group-hover:text-primary transition-colors text-sm">arrow_forward</span>
                                    </div>
                                </Link>
                                <AntiGravitySection data={researchData} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompanyDashboard;
