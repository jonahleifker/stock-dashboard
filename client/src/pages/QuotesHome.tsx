import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import StockTable, { StockData } from "../components/StockTable";
import FilterSidebar, { FilterState } from "../components/FilterSidebar";

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import BulkImportModal from '../components/BulkImportModal';

const QuotesHome: React.FC = () => {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    // Filter State
    const [filters, setFilters] = useState<FilterState>({
        sectors: [],
        marketCap: null,
        valuation: null,
        showFundamentals: true,
        includeOTC: false
    });

    const handleFilterChange = (updates: Partial<FilterState>) => {
        setFilters(prev => ({ ...prev, ...updates }));
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

    // Fetch stocks
    const { data: stocksData, isLoading } = useQuery({
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
    const stocks: StockData[] = stocksData ? stocksData
        .filter((s: any) => {
            // Sector Filter
            if (filters.sectors.length > 0 && (!s.sector || !filters.sectors.includes(s.sector))) return false;

            // Market Cap Filter
            if (filters.marketCap) {
                const cap = s.marketCap || 0;
                if (filters.marketCap === 'small' && cap >= 2e9) return false; // < $2B
                if (filters.marketCap === 'mid' && (cap < 2e9 || cap >= 10e9)) return false; // $2B - $10B
                if (filters.marketCap === 'large' && cap < 10e9) return false; // > $10B
            }

            // Valuation Filter
            if (filters.valuation) {
                // Simplified logic using PE for now
                const pe = s.pe || 0;
                if (filters.valuation === 'undervalued' && (pe <= 0 || pe >= 15)) return false;
                if (filters.valuation === 'fair' && (pe < 15 || pe > 25)) return false;
                if (filters.valuation === 'overvalued' && pe <= 25) return false;
            }

            return true;
        })
        .map((s: any) => ({
            ticker: s.ticker,
            name: s.companyName,
            price: s.currentPrice,
            changePercent: s.change30d || 0,
            marketCap: s.marketCap ? (s.marketCap / 1e9).toFixed(2) + 'B' : '-',
            sector: s.sector,
        })) : [];

    return (
        <div className="bg-background-dark font-display antialiased text-white overflow-hidden h-screen flex flex-col">
            <Navbar />

            <main className="flex-1 overflow-y-auto relative bg-background-dark">
                <div className="layout-container max-w-[1400px] mx-auto px-6 lg:px-10 py-8">
                    {/* Page Header */}
                    <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
                        <div>
                            <h1 className="text-4xl font-black tracking-tight text-white mb-2">
                                Market Quotes
                            </h1>
                            <p className="text-text-secondary text-base">
                                Real-time data and fundamentals across global markets
                            </p>
                            {(filters.sectors.length > 0 || filters.marketCap || filters.valuation) && (
                                <div className="flex flex-wrap gap-2 mt-4">
                                    {filters.sectors.map(s => (
                                        <span key={s} className="px-2 py-1 bg-primary/20 text-primary text-xs font-bold rounded-lg border border-primary/20">
                                            {s}
                                        </span>
                                    ))}
                                    {filters.marketCap && (
                                        <span className="px-2 py-1 bg-secondary text-text-secondary text-xs font-bold rounded-lg border border-border capitalize">
                                            {filters.marketCap} Cap
                                        </span>
                                    )}
                                    {filters.valuation && (
                                        <span className="px-2 py-1 bg-secondary text-text-secondary text-xs font-bold rounded-lg border border-border capitalize">
                                            {filters.valuation}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsImportModalOpen(true)}
                                className="flex items-center gap-2 h-10 px-5 rounded-full bg-secondary hover:bg-[#384435] text-white text-sm font-bold transition-colors"
                            >
                                <span className="material-symbols-outlined text-[18px]">
                                    cloud_upload
                                </span>
                                <span>Bulk Import</span>
                            </button>
                            {/* Filter Toggle Button */}
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className={`flex items-center gap-2 h-10 px-5 rounded-full text-sm font-bold transition-all ${isSidebarOpen
                                    ? "bg-primary text-black shadow-[0_0_15px_rgba(83,210,45,0.3)]"
                                    : "bg-secondary text-white hover:bg-[#384435]"
                                    }`}
                            >
                                <span className="material-symbols-outlined text-[18px]">
                                    filter_list
                                </span>
                                <span>Filters ({[
                                    filters.sectors.length,
                                    filters.marketCap ? 1 : 0,
                                    filters.valuation ? 1 : 0
                                ].reduce((a, b) => a + b, 0)})</span>
                            </button>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="text-white text-center py-20">Loading market data...</div>
                    ) : (
                        <StockTable stocks={stocks} onStockClick={handleStockClick} />
                    )}
                </div>
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

export default QuotesHome;
