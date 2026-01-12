import React, { useState } from "react";
import Navbar from "../components/Navbar";
import StockTable, { StockData } from "../components/StockTable";
import FilterSidebar from "../components/FilterSidebar";

const QuotesHome: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Dummy data matching the design HTML
    const stocks: StockData[] = [
        {
            ticker: "AAPL",
            name: "Apple Inc.",
            price: 150.23,
            changePercent: 1.2,
            marketCap: "$2.4T",
            peRatio: 28.5,
            volume: "55.2M",
        },
        {
            ticker: "TSLA",
            name: "Tesla Inc.",
            price: 240.5,
            changePercent: -0.5,
            marketCap: "$750B",
            peRatio: 52.1,
            volume: "12.1M",
        },
        {
            ticker: "MSFT",
            name: "Microsoft",
            price: 310.0,
            changePercent: 0.8,
            marketCap: "$2.3T",
            peRatio: 32.0,
            volume: "22.4M",
        },
        {
            ticker: "NVDA",
            name: "NVIDIA",
            price: 420.0,
            changePercent: 2.1,
            marketCap: "$1.1T",
            peRatio: 110.5,
            volume: "45.8M",
        },
        {
            ticker: "AMZN",
            name: "Amazon",
            price: 130.0,
            changePercent: -1.1,
            marketCap: "$1.3T",
            peRatio: 105.2,
            volume: "33.2M",
        },
    ];

    return (
        <div className="bg-background-dark font-display antialiased text-white overflow-hidden h-screen flex flex-col">
            <Navbar />

            <main className="flex-1 overflow-y-auto relative bg-[#131712]">
                <div className="layout-container max-w-[1400px] mx-auto px-6 lg:px-10 py-8">
                    {/* Page Header */}
                    <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
                        <div>
                            <h1 className="text-4xl font-black tracking-tight text-white mb-2">
                                Market Quotes
                            </h1>
                            <p className="text-[#a5b6a0] text-base">
                                Real-time data and fundamentals across global markets
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button className="flex items-center gap-2 h-10 px-5 rounded-full bg-[#2d372a] hover:bg-[#384435] text-white text-sm font-bold transition-colors">
                                <span className="material-symbols-outlined text-[18px]">
                                    download
                                </span>
                                <span>Export CSV</span>
                            </button>
                            {/* Filter Toggle Button */}
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className={`flex items-center gap-2 h-10 px-5 rounded-full text-sm font-bold transition-all ${isSidebarOpen
                                        ? "bg-primary text-black shadow-[0_0_15px_rgba(83,210,45,0.3)]"
                                        : "bg-[#2d372a] text-white hover:bg-[#384435]"
                                    }`}
                            >
                                <span className="material-symbols-outlined text-[18px]">
                                    filter_list
                                </span>
                                <span>Filters (4)</span>
                            </button>
                        </div>
                    </div>

                    <StockTable stocks={stocks} />
                </div>
            </main>

            <FilterSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />
        </div>
    );
};

export default QuotesHome;
