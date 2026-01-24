import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import MarketPulseCard from "../components/MarketPulseCard";
import SectorHeatmap from "../components/SectorHeatmap";
import StockTable, { StockData } from "../components/StockTable";
import FilterSidebar from "../components/FilterSidebar";
import BulkImportModal from "../components/BulkImportModal";
import { stockApi } from "../lib/api";
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Default closed to save space on dashboard
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [marketData, setMarketData] = React.useState<any[]>([]);

    // Filter State (placeholder for now to satisfy props)
    const [filters, setFilters] = useState<any>({
        sectors: [],
        marketCap: null,
        valuation: null,
        showFundamentals: true,
        includeOTC: false
    });

    const handleFilterChange = (updates: any) => {
        setFilters((prev: any) => ({ ...prev, ...updates }));
    };

    const handleResetFilters = () => {
        setFilters({
            sectors: [],
            marketCap: null,
            valuation: null,
            showFundamentals: true,
            includeOTC: false
        });
    };

    // Fetch Market Pulse Data
    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const pulse = await stockApi.getMarketPulse();
                setMarketData(pulse);
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            }
        };
        fetchData();
    }, []);

    // Fetch Stocks for Watchlist Table
    const { data: stocksData, isLoading: isStocksLoading } = useQuery({
        queryKey: ['stocks'],
        queryFn: async () => {
            const res = await axios.get('/api/stocks');
            return res.data.data;
        }
    });

    const handleStockClick = (ticker: string) => {
        navigate(`/company/${ticker}`);
    };

    // Transform backend data to StockTable props
    const stocks: StockData[] = stocksData ? stocksData.map((s: any) => ({
        ticker: s.ticker,
        name: s.companyName,
        price: s.currentPrice,
        changePercent: s.change30d || 0,
        marketCap: s.marketCap ? (s.marketCap / 1e9).toFixed(2) + 'B' : '-',
        sector: s.sector,
    })) : [];

    return (
        <div className="bg-background-dark text-white font-display antialiased min-h-screen pb-24 flex flex-col">
            {/* Top App Bar */}
            <header className="sticky top-0 z-40 bg-background-dark/95 backdrop-blur-sm transition-colors duration-300 border-b border-white/5">
                <div className="flex items-center justify-between p-5 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="relative group cursor-pointer">
                            <div
                                className="bg-center bg-no-repeat bg-cover rounded-full size-10 ring-2 ring-primary/20 group-hover:ring-primary transition-all duration-300"
                                style={{
                                    backgroundImage:
                                        'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBAG0i3NUqvd6tHJeLrMFx8Et0-e3IGh393lWvTULwbyni2ZqjBDkoZ7iozImbH2fHoZZOEL320lJ4p1wyYo71KXI7JlK2jcYldJ6sV60rMDjgqXmiilRGRgUqtXR_8WB7IYNBZehhsgoidYUqQStkSkLOWf3ILEqdN3l0hl5fQwa0KRE92q9dQidUhjNRg5oCCRaB6Hu8yVD9g1m9qmSNL4rkrqb9Kp4Ua-amrtn9yMydkVFoWmbwMqdPDS4r5u4clO-FzvnnD3ts")',
                                }}
                            ></div>
                            <div className="absolute bottom-0 right-0 size-3 bg-growth rounded-full border-2 border-background-dark"></div>
                        </div>
                        <div>
                            <h1 className="text-sm text-gray-400 font-medium">Welcome back,</h1>
                            <h2 className="text-base font-bold leading-tight">
                                {user?.displayName || user?.username || "Trader"}
                            </h2>
                        </div>
                    </div>
                    <button className="flex items-center justify-center size-10 rounded-full bg-surface-dark/50 hover:bg-surface-dark transition-colors text-white">
                        <span className="material-symbols-outlined text-[24px]">search</span>
                    </button>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto px-5 pt-4 flex flex-col gap-8">

                {/* Market Pulse Section */}
                <section>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-bold tracking-tight">Market Pulse</h3>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        {marketData.length > 0 ? (
                            marketData.map((data) => (
                                <MarketPulseCard
                                    key={data.index}
                                    index={data.index}
                                    value={data.value}
                                    changePercent={data.changePercent}
                                    sparklineData={data.sparklineData}
                                    isHighlighted={data.index === "BTC"}
                                />
                            ))
                        ) : (
                            <div className="col-span-2 text-center text-gray-500 text-xs py-4">Loading market data...</div>
                        )}
                    </div>
                </section>

                {/* Sector Heatmap */}
                <section>
                    <SectorHeatmap />
                </section>

                {/* Main Watchlist Section */}
                <section className="flex-1 flex flex-col min-h-[500px]">
                    <div className="flex flex-wrap justify-between items-end gap-4 mb-4">
                        <div>
                            <h3 className="text-2xl font-bold tracking-tight text-white">
                                Watchlist
                            </h3>
                            <p className="text-gray-400 text-sm">
                                Real-time filtered market data
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsImportModalOpen(true)}
                                className="flex items-center gap-2 h-9 px-4 rounded-full bg-surface-dark hover:bg-[#384435] text-white text-xs font-bold transition-colors border border-white/5"
                            >
                                <span className="material-symbols-outlined text-[16px]">
                                    cloud_upload
                                </span>
                                <span>Import</span>
                            </button>
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className={`flex items-center gap-2 h-9 px-4 rounded-full text-xs font-bold transition-all border border-white/5 ${isSidebarOpen
                                    ? "bg-primary text-black shadow-[0_0_15px_rgba(83,210,45,0.3)]"
                                    : "bg-surface-dark text-white hover:bg-[#384435]"
                                    }`}
                            >
                                <span className="material-symbols-outlined text-[16px]">
                                    filter_list
                                </span>
                                <span>Filters</span>
                            </button>
                        </div>
                    </div>

                    {isStocksLoading ? (
                        <div className="text-white text-center py-20 bg-surface-dark/30 rounded-3xl">Loading watchlist...</div>
                    ) : (
                        <StockTable stocks={stocks} onStockClick={handleStockClick} />
                    )}
                </section>
            </main>

            <FilterSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                filters={filters}
                onFilterChange={handleFilterChange}
                onReset={handleResetFilters}
            />

            <BulkImportModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
            />
        </div>
    );
};

export default Dashboard;
