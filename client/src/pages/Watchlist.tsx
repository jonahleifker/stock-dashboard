import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Navbar from "../components/Navbar";
import { watchlistApi, stockApi } from "../lib/api";
import { useNavigate, Link } from "react-router-dom";
import { format } from "date-fns";
import ConfirmModal from "../components/ConfirmModal";

const Watchlist: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
    // Add Stock State
    const [isAdding, setIsAdding] = useState(false);
    const [newTicker, setNewTicker] = useState("");
    const [stockToDelete, setStockToDelete] = useState<any>(null);

    interface WatchlistStock {
        ticker: string;
        name: string;
        price: number;
        change7d: number;
        change30d: number;
        change1y: number;
        marketCap: string;
        sector: string;
        id: number;
    }

    // 1. Fetch Watchlist items (separate from Portfolio)
    const { data: watchlistItems, isLoading: isWatchlistLoading } = useQuery({
        queryKey: ['watchlist'],
        queryFn: watchlistApi.getAll
    });

    // 2. Fetch Live Stock Data to display current details
    const { data: stocks, isLoading: isStocksLoading } = useQuery({
        queryKey: ['stocks'],
        queryFn: () => stockApi.getStocks()
    });

    // 3. Merge watchlist tickers with stock data for the table
    const watchlistStocks: WatchlistStock[] = React.useMemo(() => {
        if (!watchlistItems) return [];

        return watchlistItems.map(item => {
            const liveStock = stocks?.find(s => s.ticker === item.ticker);
            // Fallback to stored stock data if live not found
            const stockInfo = liveStock || item.Stock;

            return {
                ticker: item.ticker,
                name: stockInfo?.companyName || item.ticker,
                price: stockInfo?.currentPrice || 0,
                change7d: (stockInfo?.change7d || 0),
                change30d: (stockInfo?.change30d || 0),
                change1y: (stockInfo?.change1y || 0),
                marketCap: stockInfo?.marketCap ? (stockInfo.marketCap / 1e9).toFixed(2) + 'B' : '-',
                sector: stockInfo?.sector || '-',
                id: item.id // Store watchlist item ID for deletion
            };
        });
    }, [watchlistItems, stocks]);

    const deleteMutation = useMutation({
        mutationFn: (id: number) => watchlistApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['watchlist'] });
            setSelectedTicker(null);
            setStockToDelete(null);
        },
        onError: (error: any) => {
            alert(error.response?.data?.error || "Failed to remove from watchlist");
        }
    });

    const addMutation = useMutation({
        mutationFn: watchlistApi.add,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['watchlist'] });
            setIsAdding(false);
            setNewTicker("");
        },
        onError: (error: any) => {
            alert(error.response?.data?.error || "Failed to add to watchlist");
        }
    });

    const handleAddStock = (e: React.FormEvent) => {
        e.preventDefault();
        if (newTicker.trim()) {
            addMutation.mutate({ ticker: newTicker.trim() });
        }
    };

    // 4. News Feed Data
    // We want news for ALL selected favorites, or maybe just the selected one?
    // Request says "news bar on the side that pumps in news for the stocks that are selected."
    // Let's interpret "stocks that are selected" as "stocks in the favorites list".
    // Since we don't have a bulk news endpoint easier to fetch for individual or just show general market news?
    // Actually, let's try to fetch news for the *clicked* stock if one is selected, 
    // OR aggregated news if possible. 
    // For MVP of this feature, let's fetch news for the FIRST stock in the list if none selected, or allow selection.

    // 4. News Feed Data
    // Fetch news for selected ticker OR aggregate news for top favorites
    // If a stock is selected, show news for THAT stock.
    // If nothing selected, show news for the top 5 stocks in the list.

    // 4. News Feed Data
    // We get news from the `stocks` data which is fetched from Yahoo Finance/StockService.
    const newsArticles = React.useMemo(() => {
        if (!stocks) return [];

        const tickersToFetch = selectedTicker
            ? [selectedTicker]
            : watchlistStocks.slice(0, 5).map(s => s.ticker);

        const allNews: any[] = [];

        tickersToFetch.forEach(ticker => {
            const stock = stocks.find(s => s.ticker === ticker);
            if (stock?.news) {
                // Map Yahoo Finance news format to our display format
                const mappedNews = stock.news.map(n => ({
                    title: n.title,
                    url: n.link,
                    sourceName: n.publisher,
                    publishedAt: n.providerPublishTime ? new Date(n.providerPublishTime) : new Date(),
                    // Add generic ID to avoid key warnings if needed, or rely on index
                    id: n.link
                }));
                allNews.push(...mappedNews);
            }
        });

        // Remove duplicates based on URL
        const uniqueNews = Array.from(new Map(allNews.map(item => [item.url, item])).values());

        return uniqueNews.sort((a, b) => {
            const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
            const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
            return dateB - dateA;
        });
    }, [stocks, selectedTicker, watchlistStocks]);

    const isNewsLoading = isStocksLoading;

    const handleStockClick = (ticker: string) => {
        // If clicking a stock in this view, maybe we just select it for the news sidebar?
        // The user said "selectable quote sheet".
        setSelectedTicker(ticker);
    };

    const handleDoubleStockClick = (ticker: string) => {
        navigate(`/company/${ticker}`);
    }

    return (
        <div className="bg-background-dark font-display antialiased text-white h-screen flex flex-col">
            <Navbar />

            <div className="flex-1 flex overflow-hidden">
                {/* Main Content: Quote Sheet */}
                <main className="flex-1 overflow-y-auto p-6 lg:p-10 border-r border-border relative">
                    <div className="flex flex-col gap-4 mb-8">
                        <div>
                            <h1 className="text-4xl font-black tracking-tight text-white mb-2">
                                Watchlist
                            </h1>
                            <p className="text-text-secondary text-base">
                                Your watch list and market pulse.
                            </p>
                        </div>
                        {/* Add Stock Button (aligned left) */}
                        <div className="flex items-center gap-2">
                            {isAdding ? (
                                <form onSubmit={handleAddStock} className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4">
                                    <input
                                        type="text"
                                        value={newTicker}
                                        onChange={(e) => setNewTicker(e.target.value.toUpperCase())}
                                        placeholder="TICKER"
                                        className="h-10 w-32 bg-surface-dark border border-border rounded-lg px-3 text-white text-sm focus:border-primary focus:outline-none uppercase placeholder:normal-case shadow-sm"
                                        autoFocus
                                    />
                                    <button
                                        type="submit"
                                        disabled={addMutation.isPending || !newTicker.trim()}
                                        className="h-10 px-4 bg-primary text-background-dark font-bold rounded-lg hover:bg-[#45b025] text-sm disabled:opacity-50 transition-all shadow-sm flex items-center gap-1"
                                    >
                                        {addMutation.isPending ? 'Adding...' : 'Add'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsAdding(false)}
                                        className="h-10 w-10 flex items-center justify-center text-text-secondary hover:text-white transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">close</span>
                                    </button>
                                </form>
                            ) : (
                                <button
                                    onClick={() => setIsAdding(true)}
                                    className="h-10 px-4 bg-surface-dark border border-border hover:border-primary/50 text-white font-bold rounded-lg hover:bg-[#2d372a] text-sm transition-all shadow-sm flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-[18px]">add</span>
                                    <span>Add Stock</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {isWatchlistLoading ? (
                        <div className="text-center py-20 text-text-secondary">Loading watchlist...</div>
                    ) : watchlistStocks.length === 0 ? (
                        <div className="text-center py-20 bg-surface-dark border border-border rounded-2xl">
                            <p className="text-text-secondary mb-4">No stocks in your watchlist yet.</p>
                        </div>
                    ) : (
                        <div className="bg-surface-dark border border-border rounded-2xl overflow-hidden">
                            {/* Custom Table Wrapper to handle selection styling */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-[#232b22] border-b border-border">
                                            <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider w-[120px]">Ticker</th>
                                            <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider text-right">Price</th>
                                            <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider text-right">1 Week</th>
                                            <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider text-right">1 Month</th>
                                            <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider text-right">1 Year</th>
                                            <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Market Cap</th>
                                            <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Sector</th>
                                            <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider w-[50px]"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {watchlistStocks.map((stock) => (
                                            <tr
                                                key={stock.ticker}
                                                onClick={() => handleStockClick(stock.ticker)}
                                                onDoubleClick={() => handleDoubleStockClick(stock.ticker)}
                                                className={`group hover:bg-[#2d372a] transition-colors cursor-pointer ${selectedTicker === stock.ticker ? "bg-[#2d372a] ring-1 ring-inset ring-primary/20" : ""}`}
                                            >
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="size-8 rounded bg-white/10 flex items-center justify-center text-xs font-bold text-white">
                                                            {stock.ticker[0]}
                                                        </div>
                                                        <div>
                                                            <Link 
                                                                to={`/company/${stock.ticker}`}
                                                                className="font-bold text-white hover:text-primary transition-colors"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                {stock.ticker}
                                                            </Link>
                                                            <div className="text-xs text-text-secondary">{stock.name}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 font-mono text-white text-right">
                                                    ${stock.price?.toFixed(2) ?? '---'}
                                                </td>
                                                {/* 1 Week */}
                                                <td className="p-4 text-right">
                                                    <span className={`text-xs font-bold ${stock.change7d > 0 ? "text-growth" : stock.change7d < 0 ? "text-loss" : "text-white"}`}>
                                                        {stock.change7d > 0 ? "+" : ""}{stock.change7d?.toFixed(2)}%
                                                    </span>
                                                </td>
                                                {/* 1 Month */}
                                                <td className="p-4 text-right">
                                                    <span className={`text-xs font-bold ${stock.change30d > 0 ? "text-growth" : stock.change30d < 0 ? "text-loss" : "text-white"}`}>
                                                        {stock.change30d > 0 ? "+" : ""}{stock.change30d?.toFixed(2)}%
                                                    </span>
                                                </td>
                                                {/* 1 Year */}
                                                <td className="p-4 text-right">
                                                    <span className={`text-xs font-bold ${stock.change1y > 0 ? "text-growth" : stock.change1y < 0 ? "text-loss" : "text-white"}`}>
                                                        {stock.change1y > 0 ? "+" : ""}{stock.change1y?.toFixed(2)}%
                                                    </span>
                                                </td>
                                                <td className="p-4 text-text-secondary">{stock.marketCap}</td>
                                                <td className="p-4 text-text-secondary">{stock.sector || '---'}</td>
                                                <td className="p-4">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setStockToDelete(stock);
                                                        }}
                                                        className="text-text-secondary hover:text-accent-red material-symbols-outlined text-[20px] opacity-0 group-hover:opacity-100 transition-opacity"
                                                        title="Remove from Watchlist"
                                                    >
                                                        delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                    <div className="mt-4 text-xs text-text-secondary flex gap-4">
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">touch_app</span> Click to select for news</span>
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">open_in_new</span> Double click to view details</span>
                    </div>

                    <ConfirmModal
                        isOpen={!!stockToDelete}
                        onClose={() => setStockToDelete(null)}
                        onConfirm={() => {
                            if (stockToDelete) {
                                deleteMutation.mutate(stockToDelete.id);
                            }
                        }}
                        title="Remove Stock"
                        message={`Are you sure you want to remove ${stockToDelete?.ticker} from your watchlist?`}
                        confirmText="Remove"
                        isDanger={true}
                        isLoading={deleteMutation.isPending}
                    />
                </main>

                {/* Sidebar: News Feed */}
                <aside className="w-[400px] bg-surface-dark border-l border-border flex flex-col">
                    <div className="p-6 border-b border-border">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">feed</span>
                            News Feed
                        </h2>
                        {selectedTicker ? (
                            <p className="text-sm text-text-secondary mt-1">
                                Showing news for <span className="font-bold text-white">{selectedTicker}</span>
                            </p>
                        ) : (
                            <p className="text-sm text-text-secondary mt-1">
                                Showing top news for your watchlist
                            </p>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto p-4">
                        {isNewsLoading ? (
                            <div className="text-center py-10 text-text-secondary">Loading news...</div>
                        ) : newsArticles && newsArticles.length > 0 ? (
                            <div className="flex flex-col gap-4">
                                {newsArticles.map((article) => (
                                    <a
                                        key={article.id}
                                        href={article.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block p-4 rounded-xl bg-background-dark border border-border hover:border-primary/50 transition-all group"
                                    >
                                        <h3 className="text-sm font-bold text-white mb-2 group-hover:text-primary transition-colors line-clamp-2">
                                            {article.title}
                                        </h3>
                                        <div className="flex items-center justify-between text-xs text-text-secondary">
                                            <span className="font-medium text-gray-400">{article.sourceName}</span>
                                            <span>{article.publishedAt ? format(new Date(article.publishedAt), "MMM d, h:mm a") : ""}</span>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 text-text-secondary italic">
                                No recent news found.
                            </div>
                        )}
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default Watchlist;
