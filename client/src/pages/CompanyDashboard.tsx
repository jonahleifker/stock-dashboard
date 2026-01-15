import React, { useState } from "react";
import Navbar from "../components/Navbar";

const CompanyDashboard: React.FC = () => {
    const [stockData, setStockData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    React.useEffect(() => {
        const fetchStock = async () => {
            try {
                // Hardcoded to AAPL for now as per the static design, but could be dynamic from params
                const response = await fetch('/api/stocks/AAPL');
                const data = await response.json();

                if (data.success) {
                    setStockData(data.data);
                } else {
                    setError(data.message || 'Failed to fetch stock data');
                }
            } catch (err) {
                setError('Failed to connect to server');
            } finally {
                setLoading(false);
            }
        };

        fetchStock();
    }, []);

    if (loading) {
        return (
            <div className="bg-background-light dark:bg-background-dark font-display flex items-center justify-center min-h-screen">
                <div className="text-white">Loading...</div>
            </div>
        );
    }

    if (error) {
        // Fallback to static data if API fails (for demo purposes) or show error?
        // For now let's show error but maybe we can keep the static structure as default state?
        // Actually, let's just return the error view or the static view with an overlay.
        // Given the user wants to "make sure backend services are running", distinct failure is better than silent falback.
        return (
            <div className="bg-background-light dark:bg-background-dark font-display flex items-center justify-center min-h-screen flex-col gap-4">
                <div className="text-red-500 text-xl font-bold">Error: {error}</div>
                <button onClick={() => window.location.reload()} className="text-white underline">Retry</button>
            </div>
        );
    }

    // Use stockData values where available, fallback to static/default
    const currentPrice = stockData?.currentPrice || 174.50;
    const changePercent = stockData?.change30d || 1.20; // Using 30d change as proxy for main display if 7d not avail
    const isPositive = changePercent >= 0;

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white overflow-hidden selection:bg-primary selection:text-black min-h-screen flex flex-col">
            <Navbar />

            <div className="flex flex-1 min-h-0">
                {/* Left Sidebar (optional/integrated) - preserving the design's layout 
            where the main content is central. Design shows a left sidebar, 
            but our main app uses top nav. I will adapt to use the main content area 
            but keep the internal layout. */
                }

                <main className="flex flex-col flex-1 min-w-0 h-full relative overflow-y-auto bg-[#131712] p-4 md:p-8 lg:px-12 pb-20">
                    <div className="max-w-5xl mx-auto flex flex-col gap-6">
                        {/* Profile Header & Main Stats */}
                        <div className="flex flex-col xl:flex-row gap-6 items-start xl:items-end justify-between animate-fade-in">
                            <div className="flex gap-5 items-center">
                                <div className="bg-white rounded-2xl p-3 size-20 md:size-24 flex items-center justify-center shrink-0 shadow-lg shadow-black/50">
                                    <img
                                        alt={`${stockData?.companyName} Logo`}
                                        className="w-full h-full object-contain p-1"
                                        src={`https://logo.clearbit.com/${stockData?.companyName?.split(' ')[0].toLowerCase()}.com`}
                                        onError={(e) => { (e.target as HTMLImageElement).src = "https://lh3.googleusercontent.com/aida-public/AB6AXuC6f21-rQMvyyMymaDMqBFM9MykuRTQFPK607eKa8Nf1IBI3De8YwGurL2VVe7ZJBigfCRXirss-2SA0uUGStPYUsBo4sQuwwwe0MclUNBzvhRJw1s8_6hFgYRRnwlC31SNFQor_In_jwlWgsV5WnPIu4fpm7emlrKY1_hIhAxq_hSgfiCCGaJATtY7v6QAtfaJV5OEY3VPH9R-pcN8MG3ndh4nV0w2Fg0ebD7iNgXe95dP-4SsTiZor-B90rpeSrxkIhpoKQTvAQ" }}
                                    />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                                            {stockData?.companyName || 'Apple Inc.'}
                                        </h1>
                                        <span className="px-2 py-1 rounded bg-[#2d372a] text-[#a5b6a0] text-xs font-bold tracking-wider">
                                            {stockData?.ticker || 'AAPL'}
                                        </span>
                                    </div>
                                    <p className="text-[#a5b6a0] text-sm md:text-base">
                                        {stockData?.sector || 'Consumer Electronics'} • Mega Cap • Tech
                                    </p>
                                </div>
                            </div>
                            {/* Price Large */}
                            <div className="flex flex-col items-end">
                                <div className="flex items-baseline gap-3">
                                    <span className="text-4xl md:text-5xl font-bold text-white tracking-tighter">
                                        ${currentPrice.toFixed(2)}
                                    </span>
                                    <span className={`text-lg md:text-xl font-bold flex items-center px-2 py-0.5 rounded-lg ${isPositive ? 'text-primary bg-primary/10' : 'text-red-500 bg-red-500/10'}`}>
                                        <span className="material-symbols-outlined text-sm mr-1">
                                            {isPositive ? 'trending_up' : 'trending_down'}
                                        </span>
                                        {Math.abs(changePercent).toFixed(2)}%
                                    </span>
                                </div>
                                <p className="text-[#a5b6a0] text-sm mt-1">
                                    Last Updated: {new Date().toLocaleTimeString()}
                                </p>
                            </div>
                        </div>

                        {/* Quick Stats Row */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-4 rounded-2xl bg-[#1d241c] border border-[#2d372a]">
                                <p className="text-[#a5b6a0] text-xs font-medium uppercase tracking-wider mb-1">
                                    Market Cap
                                </p>
                                <p className="text-white text-xl font-bold">{stockData?.marketCap ? (stockData.marketCap / 1e12).toFixed(2) + 'T' : '2.71T'}</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-[#1d241c] border border-[#2d372a]">
                                <p className="text-[#a5b6a0] text-xs font-medium uppercase tracking-wider mb-1">
                                    High (1Y)
                                </p>
                                <p className="text-white text-xl font-bold">${stockData?.high1yr?.toFixed(2) || '198.23'}</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-[#1d241c] border border-[#2d372a]">
                                <p className="text-[#a5b6a0] text-xs font-medium uppercase tracking-wider mb-1">
                                    High (30d)
                                </p>
                                <p className="text-white text-lg font-bold truncate">
                                    ${stockData?.high30d?.toFixed(2) || '175.05'}
                                </p>
                            </div>
                            <div className="p-4 rounded-2xl bg-[#1d241c] border border-[#2d372a]">
                                <p className="text-[#a5b6a0] text-xs font-medium uppercase tracking-wider mb-1">
                                    52W Range
                                </p>
                                <p className="text-white text-lg font-bold truncate">
                                    -
                                </p>
                            </div>
                        </div>

                        {/* Main Content Sections (Accordions) */}
                        <div className="flex flex-col gap-4 mt-4">
                            {/* Collapsed: Earnings */}
                            <details className="group rounded-2xl bg-[#1d241c] border border-[#2d372a] overflow-hidden transition-all duration-300">
                                <summary className="flex cursor-pointer items-center justify-between px-6 py-4 select-none hover:bg-[#2d372a] transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                                            <span className="material-symbols-outlined">
                                                attach_money
                                            </span>
                                        </div>
                                        <h3 className="text-white text-lg font-bold">
                                            Earnings Summary
                                        </h3>
                                    </div>
                                    <span className="material-symbols-outlined text-[#a5b6a0] transition-transform duration-300 group-open:rotate-180">
                                        expand_more
                                    </span>
                                </summary>
                                <div className="px-6 py-4 border-t border-[#2d372a]">
                                    {/* Content placeholder */}
                                    <p className="text-gray-400">Earnings data goes here...</p>
                                </div>
                            </details>

                            {/* Expanded: Valuation Ratios */}
                            <details
                                className="group rounded-[2rem] bg-[#1a2019] border border-primary/30 shadow-[0_0_20px_rgba(83,210,45,0.05)] overflow-hidden transition-all duration-500"
                                open
                            >
                                <summary className="flex cursor-pointer items-center justify-between px-6 py-5 select-none bg-[#232c21] hover:bg-[#2a3428] transition-colors sticky top-0 z-10 border-b border-[#2d372a]">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                            <span className="material-symbols-outlined">
                                                query_stats
                                            </span>
                                        </div>
                                        <div className="flex flex-col">
                                            <h3 className="text-white text-xl font-bold">
                                                Valuation Ratios
                                            </h3>
                                            <span className="text-xs text-[#a5b6a0] font-medium hidden md:inline-block">
                                                Detailed breakdown of P/E, P/S, and P/B vs Industry
                                            </span>
                                        </div>
                                    </div>
                                    <span className="material-symbols-outlined text-white transition-transform duration-300 group-open:rotate-180">
                                        expand_more
                                    </span>
                                </summary>
                                <div className="p-6 md:p-8">
                                    {/* Valuation Content Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                                        {/* Card 1: Trailing P/E */}
                                        <div className="bg-[#151a14] rounded-3xl p-5 border border-[#2d372a] flex flex-col justify-between group/card hover:border-primary/50 transition-colors relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover/card:opacity-20 transition-opacity">
                                                <span className="material-symbols-outlined text-6xl">
                                                    history
                                                </span>
                                            </div>
                                            <div>
                                                <div className="flex justify-between items-start mb-2">
                                                    <p className="text-[#a5b6a0] text-sm font-semibold">
                                                        Trailing P/E
                                                    </p>
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20">
                                                        PREMIUM
                                                    </span>
                                                </div>
                                                <p className="text-3xl font-bold text-white mt-1">
                                                    28.4x
                                                </p>
                                                <p className="text-xs text-[#a5b6a0] mt-1">
                                                    vs 24.1x Industry Avg
                                                </p>
                                            </div>
                                            <div className="mt-6 h-16 flex items-end gap-1">
                                                {/* Simple Bar Chart Visualization */}
                                                <div
                                                    className="w-1/3 bg-[#2d372a] rounded-t-sm h-[60%] relative group/bar"
                                                    title="Industry"
                                                >
                                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-white bg-black px-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity">
                                                        24.1
                                                    </div>
                                                </div>
                                                <div
                                                    className="w-1/3 bg-[#2d372a] rounded-t-sm h-[80%] relative group/bar"
                                                    title="5Y Avg"
                                                >
                                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-white bg-black px-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity">
                                                        26.5
                                                    </div>
                                                </div>
                                                <div
                                                    className="w-1/3 bg-orange-400/80 rounded-t-md h-[95%] relative group/bar shadow-[0_0_10px_rgba(251,146,60,0.3)]"
                                                    title="Current"
                                                >
                                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-white bg-black px-1 rounded">
                                                        28.4
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Card 2: Forward P/E */}
                                        <div className="bg-[#151a14] rounded-3xl p-5 border border-[#2d372a] flex flex-col justify-between group/card hover:border-primary/50 transition-colors relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover/card:opacity-20 transition-opacity">
                                                <span className="material-symbols-outlined text-6xl">update</span>
                                            </div>
                                            <div>
                                                <div className="flex justify-between items-start mb-2">
                                                    <p className="text-[#a5b6a0] text-sm font-semibold">Forward P/E</p>
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">ATTRACTIVE</span>
                                                </div>
                                                <p className="text-3xl font-bold text-white mt-1">25.1x</p>
                                                <p className="text-xs text-[#a5b6a0] mt-1 text-primary">↓ 3.3x from Trailing</p>
                                            </div>
                                            <div className="mt-6 relative h-16 w-full flex items-center justify-center">
                                                {/* Gauge Visualization using SVG */}
                                                <svg className="w-full h-full overflow-visible" viewBox="0 0 100 50">
                                                    <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#2d372a" strokeLinecap="round" strokeWidth="8"></path>
                                                    <path d="M 10 50 A 40 40 0 0 1 65 20" fill="none" stroke="#53d22d" strokeDasharray="100" strokeDashoffset="0" strokeLinecap="round" strokeWidth="8"></path>
                                                    <circle className="shadow-lg" cx="65" cy="20" fill="white" r="4"></circle>
                                                    <text fill="#a5b6a0" fontFamily="Manrope" fontSize="8" textAnchor="middle" x="50" y="45">Fair Value</text>
                                                </svg>
                                            </div>
                                        </div>

                                        {/* Card 3: Price / Sales */}
                                        <div className="bg-[#151a14] rounded-3xl p-5 border border-[#2d372a] flex flex-col justify-between group/card hover:border-primary/50 transition-colors relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover/card:opacity-20 transition-opacity">
                                                <span className="material-symbols-outlined text-6xl">shopping_cart</span>
                                            </div>
                                            <div>
                                                <div className="flex justify-between items-start mb-2">
                                                    <p className="text-[#a5b6a0] text-sm font-semibold">Price / Sales</p>
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#2d372a] text-[#a5b6a0] border border-[#42513e]">NEUTRAL</span>
                                                </div>
                                                <p className="text-3xl font-bold text-white mt-1">6.2x</p>
                                                <p className="text-xs text-[#a5b6a0] mt-1">In line with peers</p>
                                            </div>
                                            {/* Trend line visualization */}
                                            <div className="mt-6 h-16 w-full relative">
                                                <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 40">
                                                    <defs>
                                                        <linearGradient id="gradientPS" x1="0" x2="0" y1="0" y2="1">
                                                            <stop offset="0%" stopColor="#53d22d" stopOpacity="0.3"></stop>
                                                            <stop offset="100%" stopColor="#53d22d" stopOpacity="0"></stop>
                                                        </linearGradient>
                                                    </defs>
                                                    <path d="M0,35 Q10,32 20,28 T40,25 T60,20 T80,15 T100,22" fill="url(#gradientPS)" stroke="none"></path>
                                                    <path d="M0,35 Q10,32 20,28 T40,25 T60,20 T80,15 T100,22" fill="none" stroke="#53d22d" strokeWidth="2"></path>
                                                    <circle cx="100" cy="22" fill="#53d22d" r="3"></circle>
                                                </svg>
                                            </div>
                                        </div>

                                        {/* Card 4: Price / Book */}
                                        <div className="bg-[#151a14] rounded-3xl p-5 border border-[#2d372a] flex flex-col justify-between group/card hover:border-primary/50 transition-colors relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover/card:opacity-20 transition-opacity">
                                                <span className="material-symbols-outlined text-6xl">auto_stories</span>
                                            </div>
                                            <div>
                                                <div className="flex justify-between items-start mb-2">
                                                    <p className="text-[#a5b6a0] text-sm font-semibold">Price / Book</p>
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">HIGH</span>
                                                </div>
                                                <p className="text-3xl font-bold text-white mt-1">42.1x</p>
                                                <p className="text-xs text-[#a5b6a0] mt-1">High ROI justifies premium</p>
                                            </div>
                                            {/* Multi-bar comparison */}
                                            <div className="mt-6 space-y-2">
                                                <div className="flex items-center gap-2 text-[10px]">
                                                    <span className="w-8 text-[#a5b6a0]">AAPL</span>
                                                    <div className="flex-1 h-2 bg-[#2d372a] rounded-full overflow-hidden">
                                                        <div className="h-full bg-red-400 w-[90%] rounded-full"></div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px]">
                                                    <span className="w-8 text-[#a5b6a0]">MSFT</span>
                                                    <div className="flex-1 h-2 bg-[#2d372a] rounded-full overflow-hidden">
                                                        <div className="h-full bg-[#a5b6a0] w-[75%] rounded-full"></div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px]">
                                                    <span className="w-8 text-[#a5b6a0]">GOOG</span>
                                                    <div className="flex-1 h-2 bg-[#2d372a] rounded-full overflow-hidden">
                                                        <div className="h-full bg-[#a5b6a0] w-[60%] rounded-full"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Analysis Footer inside Accordion */}
                                    <div className="mt-6 pt-6 border-t border-[#2d372a] flex flex-col md:flex-row justify-between items-center gap-4">
                                        <p className="text-sm text-[#a5b6a0]">
                                            <span className="text-primary font-bold">
                                                Analyst Note:
                                            </span>{" "}
                                            Valuation remains elevated but consistent with
                                            high-margin services growth.
                                        </p>
                                        <button className="text-sm font-bold text-white hover:text-primary transition-colors flex items-center gap-1 group">
                                            View Full Valuation Report
                                            <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
                                                arrow_forward
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </details>

                            {/* Collapsed: Analyst Ratings */}
                            <details className="group rounded-2xl bg-[#1d241c] border border-[#2d372a] overflow-hidden transition-all duration-300">
                                <summary className="flex cursor-pointer items-center justify-between px-6 py-4 select-none hover:bg-[#2d372a] transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                                            <span className="material-symbols-outlined">stars</span>
                                        </div>
                                        <h3 className="text-white text-lg font-bold">
                                            Analyst Ratings
                                        </h3>
                                    </div>
                                    <span className="material-symbols-outlined text-[#a5b6a0] transition-transform duration-300 group-open:rotate-180">
                                        expand_more
                                    </span>
                                </summary>
                                <div className="px-6 py-4 border-t border-[#2d372a]">
                                    {/* Content placeholder */}
                                    <p className="text-gray-400">Analyst Data...</p>
                                </div>
                            </details>

                            {/* Collapsed: News Feed */}
                            <details className="group rounded-2xl bg-[#1d241c] border border-[#2d372a] overflow-hidden transition-all duration-300">
                                <summary className="flex cursor-pointer items-center justify-between px-6 py-4 select-none hover:bg-[#2d372a] transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-400">
                                            <span className="material-symbols-outlined">feed</span>
                                        </div>
                                        <h3 className="text-white text-lg font-bold">
                                            News Feed
                                        </h3>
                                    </div>
                                    <span className="material-symbols-outlined text-[#a5b6a0] transition-transform duration-300 group-open:rotate-180">
                                        expand_more
                                    </span>
                                </summary>
                                <div className="px-6 py-4 border-t border-[#2d372a]">
                                    {/* Content placeholder */}
                                    <p className="text-gray-400">Latest News...</p>
                                </div>
                            </details>
                        </div>

                        {/* Footer area */}
                        <div className="mt-12 text-center">
                            <p className="text-[#a5b6a0] text-xs">
                                Data provided for informational purposes only. Last updated: 1 min ago.
                            </p>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default CompanyDashboard;
