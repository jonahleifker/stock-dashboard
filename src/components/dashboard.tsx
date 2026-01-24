'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { addTicker, getStockData, getTrackedTickers } from '@/app/actions';
import { bulkAddTickers } from '@/app/upload-actions';
import StockDetails from '@/components/stock-details';
import { Plus, Upload, X } from 'lucide-react'; // Ensure lucide-react is installed or use text

// Define minimal types for UI to avoid 'any' if possible, or just rely on inference
// but since we have strict mode, we should try.
type StockPriceWithTicker = {
    tickerId: string;
    price: number;
    change: number | null;
    changePercent: number | null;
    timestamp: Date;
    ticker: {
        symbol: string;
        name: string | null;
        sector: string | null;
    } | null;
};

export default function Dashboard() {
    const [newTicker, setNewTicker] = useState('');
    const [selectedSector, setSelectedSector] = useState('All');
    const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
    const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
    const [bulkInput, setBulkInput] = useState('');

    const queryClient = useQueryClient();

    // 1. Fetch list of tracked tickers
    const { data: tickers } = useQuery({
        queryKey: ['tickers'],
        queryFn: () => getTrackedTickers(),
    });

    // 2. Fetch stock data for these tickers
    const symbols = tickers?.map(t => t.symbol) || [];
    const { data: stockPrices, isLoading } = useQuery({
        queryKey: ['stockPrices', symbols],
        queryFn: () => getStockData(symbols),
        enabled: symbols.length > 0,
        refetchInterval: 60000,
    });

    const addMutation = useMutation({
        mutationFn: addTicker,
        onSuccess: () => {
            setNewTicker('');
            queryClient.invalidateQueries({ queryKey: ['tickers'] });
        },
    });

    const bulkImportMutation = useMutation({
        mutationFn: bulkAddTickers,
        onSuccess: (data) => {
            alert(data.message);
            setBulkInput('');
            setIsBulkImportOpen(false);
            queryClient.invalidateQueries({ queryKey: ['tickers'] });
        },
    });

    const handleAddTicker = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTicker) return;
        addMutation.mutate(newTicker);
    };

    const handleBulkImport = () => {
        bulkImportMutation.mutate(bulkInput);
    };

    // 3. Extract sectors
    const sectors = ['All', ...Array.from(new Set(tickers?.map(t => t.sector).filter(Boolean) as string[]))];

    // 4. Filter prices
    // We cast to any or unknown first because of the type issues with Prisma return type in current setup
    const prices = stockPrices as unknown as StockPriceWithTicker[] | undefined;

    const filteredPrices = prices?.filter(p =>
        selectedSector === 'All' || p.ticker?.sector === selectedSector
    );

    return (
        <div className="w-full max-w-6xl mx-auto p-6 space-y-8">
            <header className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
                    Stock Dashboard
                </h1>
                <div className="flex gap-2 w-full md:w-auto">
                    <button
                        onClick={() => setIsBulkImportOpen(!isBulkImportOpen)}
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                        title="Bulk Import"
                    >
                        <Upload className="w-5 h-5" />
                    </button>
                    <form onSubmit={handleAddTicker} className="flex gap-2 flex-1 md:flex-none">
                        <input
                            type="text"
                            value={newTicker}
                            onChange={(e) => setNewTicker(e.target.value)}
                            placeholder="Add Ticker..."
                            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-48"
                        />
                        <button
                            type="submit"
                            disabled={addMutation.isPending}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            </header>

            {/* Bulk Import Panel */}
            {isBulkImportOpen && (
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-lg animate-in fade-in slide-in-from-top-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg">Bulk Import Tickers</h3>
                        <button onClick={() => setIsBulkImportOpen(false)}><X className="w-5 h-5" /></button>
                    </div>
                    <textarea
                        className="w-full h-32 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 mb-4 font-mono text-sm"
                        placeholder="Paste tickers here (separated by space, comma, or newline)&#10;Example: AAPL, GOOG, MSFT, TSLA"
                        value={bulkInput}
                        onChange={(e) => setBulkInput(e.target.value)}
                    />
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={() => setIsBulkImportOpen(false)}
                            className="px-4 py-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleBulkImport}
                            disabled={!bulkInput || bulkImportMutation.isPending}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {bulkImportMutation.isPending ? 'Importing...' : 'Import Tickers'}
                        </button>
                    </div>
                </div>
            )}

            {/* Sector Tabs */}
            <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide no-scrollbar">
                {sectors.map(sector => (
                    <button
                        key={sector}
                        onClick={() => setSelectedSector(sector)}
                        className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors text-sm font-medium ${selectedSector === sector
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                    >
                        {sector}
                    </button>
                ))}
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading && <div className="col-span-full text-center py-12">Loading data...</div>}

                {!isLoading && filteredPrices?.map((price) => (
                    <div
                        key={price.tickerId}
                        onClick={() => setSelectedTicker(price.tickerId)}
                        className="group p-6 rounded-xl bg-white dark:bg-gray-900 shadow-sm border border-gray-200 dark:border-gray-800 hover:ring-2 hover:ring-blue-500 transition-all cursor-pointer relative"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-xl font-bold group-hover:text-blue-500 transition-colors">{price.tickerId}</h3>
                                    {price.ticker?.sector && (
                                        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-gray-500">
                                            {price.ticker.sector}
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[200px]">{price.ticker?.name}</p>
                            </div>
                            <div className={`text-lg font-semibold ${(price.changePercent || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {price.price?.toFixed(2)}
                            </div>
                        </div>

                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">Change</span>
                            <div className={`flex items-center gap-1 ${(price.change || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                <span className="font-medium">
                                    {(price.change || 0) > 0 ? '+' : ''}{price.change?.toFixed(2)}
                                </span>
                                <span className="opacity-75">
                                    ({((price.changePercent || 0) * 100).toFixed(2)}%)
                                </span>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400 flex justify-between">
                            <span>Updated: {new Date(price.timestamp).toLocaleTimeString()}</span>
                            <span className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity font-medium">View Details →</span>
                        </div>
                    </div>
                ))}

                {!isLoading && filteredPrices?.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-500 flex flex-col items-center gap-2">
                        <span className="text-xl">📉</span>
                        <p>{selectedSector === 'All' ? 'No stocks tracked yet. Add one above!' : `No stocks in ${selectedSector}.`}</p>
                    </div>
                )}
            </div>

            {/* Details Modal */}
            {selectedTicker && (
                <StockDetails
                    symbol={selectedTicker}
                    onClose={() => setSelectedTicker(null)}
                />
            )}
        </div>
    );
}
