import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Navbar from "../components/Navbar";
import BulkAddFavoritesModal from "../components/BulkAddFavoritesModal";
import { favoritesApi, stockApi, FavoriteItem, StockQuote } from "../lib/api";
import { Link } from "react-router-dom";

const Favorites: React.FC = () => {
    const queryClient = useQueryClient();
    const [isAdding, setIsAdding] = useState(false);
    const [isBulkAdding, setIsBulkAdding] = useState(false);
    const [newTicker, setNewTicker] = useState("");
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<{ averagePrice: string; shares: string }>({ averagePrice: "", shares: "" });
    const [showAnalysis, setShowAnalysis] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<any>(null);

    const analyzeMutation = useMutation({
        mutationFn: async () => {
            const response = await favoritesApi.analyzePortfolio();
            return response;
        },
        onSuccess: (data: any) => {
            setAnalysisResult(data.analysis);
            setShowAnalysis(true);
        },
        onError: (error: any) => {
            alert(error.response?.data?.error || "Failed to analyze portfolio");
        }
    });

    const handleAnalyze = () => {
        if (mergedFavorites.length === 0) {
            alert("Add some stocks to your favorites first!");
            return;
        }
        analyzeMutation.mutate();
    };

    // Fetch favorites
    const { data: favorites, isLoading: isFavoritesLoading } = useQuery({
        queryKey: ['favorites'],
        queryFn: favoritesApi.getAll
    });

    // Fetch all stocks to get live prices
    const { data: stocks } = useQuery({
        queryKey: ['stocks'],
        queryFn: () => stockApi.getStocks()
    });

    // Mutations
    const addMutation = useMutation({
        mutationFn: favoritesApi.add,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['favorites'] });
            setIsAdding(false);
            setNewTicker("");
        },
        onError: (error: any) => {
            alert(error.response?.data?.error || "Failed to add favorite");
        }
    });

    const updateMutation = useMutation({
        mutationFn: (data: { id: number; averagePrice?: number; shares?: number }) =>
            favoritesApi.update(data.id, { averagePrice: data.averagePrice, shares: data.shares }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['favorites'] });
            setEditingId(null);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => favoritesApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['favorites'] });
        }
    });

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (newTicker.trim()) {
            addMutation.mutate({ ticker: newTicker.trim() });
        }
    };

    const startEdit = (fav: FavoriteItem) => {
        setEditingId(fav.id);
        setEditForm({
            averagePrice: fav.averagePrice?.toString() || "",
            shares: fav.shares?.toString() || ""
        });
    };

    const saveEdit = (id: number) => {
        const avgPrice = parseFloat(editForm.averagePrice);
        const shareCount = parseFloat(editForm.shares);
        updateMutation.mutate({
            id,
            averagePrice: isNaN(avgPrice) ? undefined : avgPrice,
            shares: isNaN(shareCount) ? undefined : shareCount
        });
    };

    // Merge favorites with live stock data
    const mergedFavorites = favorites?.map(fav => {
        const liveStock = stocks?.find(s => s.ticker === fav.ticker);
        // Fallback to stored stock data if live not found
        const price = liveStock?.currentPrice || fav.Stock?.currentPrice || 0;
        const changePercent = liveStock?.change30d || fav.Stock?.change30d || 0;

        return {
            ...fav,
            price,
            changePercent,
            companyName: liveStock?.companyName || fav.Stock?.companyName || fav.ticker
        };
    }).filter(fav => fav.ticker) || [];  // Show all favorites (removed shares > 0 filter)

    // Calculate totals
    const totalMarketValue = mergedFavorites.reduce((sum, fav) => sum + (fav.price * (fav.shares || 0)), 0);
    const totalCostBasis = mergedFavorites.reduce((sum, fav) => sum + ((fav.averagePrice || 0) * (fav.shares || 0)), 0);
    const totalPnL = totalMarketValue - totalCostBasis;
    const totalPnLPercent = totalCostBasis > 0 ? (totalPnL / totalCostBasis) * 100 : 0;

    return (
        <div className="bg-background-dark font-display antialiased text-white overflow-hidden h-screen flex flex-col">
            <Navbar />

            <main className="flex-1 overflow-y-auto relative bg-background-dark">
                <div className="layout-container max-w-[1400px] mx-auto px-6 lg:px-10 py-8">
                    {/* Header */}
                    <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
                        <div>
                            <h1 className="text-4xl font-black tracking-tight text-white mb-2">
                                Portfolio
                            </h1>
                            <p className="text-text-secondary text-base">
                                Track your portfolio and view true P&L
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setIsBulkAdding(true)}
                            className="flex items-center gap-2 h-10 px-5 rounded-full bg-surface-dark border border-border hover:bg-[#2d372a] text-white text-sm font-bold transition-colors"
                        >
                            <span className="material-symbols-outlined text-[20px]">upload_file</span>
                            <span>Bulk Add</span>
                        </button>
                        <button
                            onClick={handleAnalyze}
                            disabled={analyzeMutation.isPending}
                            className="flex items-center gap-2 h-10 px-5 rounded-full bg-surface-dark border border-border hover:bg-[#2d372a] text-white text-sm font-bold transition-colors disabled:opacity-50"
                        >
                            {analyzeMutation.isPending ? (
                                <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            ) : (
                                <span className="material-symbols-outlined text-[20px] text-accent-purple">smart_toy</span>
                            )}
                            <span>AI Insights</span>
                        </button>
                        <button
                            onClick={() => setIsAdding(true)}
                            className="flex items-center gap-2 h-10 px-5 rounded-full bg-primary hover:bg-[#45b025] text-background-dark text-sm font-bold transition-colors"
                        >
                            <span className="material-symbols-outlined text-[20px]">add</span>
                            <span>Add Stock</span>
                        </button>
                    </div>


                    {/* ... (Summary Cards) ... */}

                    {/* Analysis Result Section */}
                    {showAnalysis && analysisResult && (
                        <div className="mb-8 bg-surface-dark border border-border rounded-xl p-6 animate-in fade-in slide-in-from-top-4 duration-500">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-2xl font-black text-white flex items-center gap-3">
                                        <span className="material-symbols-outlined text-accent-purple">auto_awesome</span>
                                        Portfolio Analysis
                                    </h2>
                                    <p className="text-text-secondary text-sm mt-1">
                                        AI-generated insights based on your current holdings.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowAnalysis(false)}
                                    className="text-text-secondary hover:text-white"
                                >
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Main Summary */}
                                <div className="lg:col-span-2 space-y-6">
                                    <div>
                                        <h3 className="text-sm font-bold uppercase text-text-secondary mb-2">Executive Summary</h3>
                                        <p className="text-white leading-relaxed">{analysisResult.summary}</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <h3 className="text-sm font-bold uppercase text-text-secondary mb-2 flex items-center gap-2">
                                                <span className="material-symbols-outlined text-green-400 text-sm">thumb_up</span>
                                                Strengths
                                            </h3>
                                            <ul className="space-y-2">
                                                {analysisResult.strengths?.map((item: string, i: number) => (
                                                    <li key={i} className="flex items-start gap-2 text-sm text-white">
                                                        <span className="size-1.5 rounded-full bg-green-400 mt-1.5 flex-shrink-0"></span>
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold uppercase text-text-secondary mb-2 flex items-center gap-2">
                                                <span className="material-symbols-outlined text-red-400 text-sm">thumb_down</span>
                                                Weaknesses
                                            </h3>
                                            <ul className="space-y-2">
                                                {analysisResult.weaknesses?.map((item: string, i: number) => (
                                                    <li key={i} className="flex items-start gap-2 text-sm text-white">
                                                        <span className="size-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0"></span>
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* Sidebar Stats */}
                                <div className="space-y-6">
                                    <div className="p-4 rounded-lg bg-background-dark/50 border border-border">
                                        <h3 className="text-sm font-bold uppercase text-text-secondary mb-2">Diversification Score</h3>
                                        <div className="flex items-center gap-4">
                                            <div className="relative size-16 flex items-center justify-center">
                                                <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                                                    <path
                                                        className="text-surface-dark"
                                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="4"
                                                    />
                                                    <path
                                                        className={`${analysisResult.diversificationScore >= 7 ? "text-primary" :
                                                            analysisResult.diversificationScore >= 4 ? "text-yellow-400" : "text-accent-red"
                                                            }`}
                                                        strokeDasharray={`${analysisResult.diversificationScore * 10}, 100`}
                                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="4"
                                                    />
                                                </svg>
                                                <span className="absolute text-xl font-bold text-white">{analysisResult.diversificationScore}</span>
                                            </div>
                                            <p className="text-xs text-text-secondary flex-1">
                                                {analysisResult.diversificationAnalysis}
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-bold uppercase text-text-secondary mb-3">AI Recommendations</h3>
                                        <div className="space-y-3">
                                            {analysisResult.recommendations?.map((rec: any, i: number) => (
                                                <div key={i} className="p-3 rounded bg-background-dark/50 border border-border text-sm">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className={`font-bold uppercase text-xs px-2 py-0.5 rounded ${rec.type === 'buy' ? 'bg-primary/20 text-primary' :
                                                            rec.type === 'sell' ? 'bg-accent-red/20 text-accent-red' :
                                                                'bg-yellow-400/20 text-yellow-400'
                                                            }`}>
                                                            {rec.type}
                                                        </span>
                                                        {rec.ticker && <span className="font-mono text-xs text-white">{rec.ticker}</span>}
                                                        {rec.sector && <span className="text-xs text-text-secondary">{rec.sector}</span>}
                                                    </div>
                                                    <p className="text-gray-300 text-xs leading-relaxed">
                                                        {rec.reasoning}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ... (Add Modal & Table) ... */}


                    {/* Portfolio Summary Card */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-surface-dark border border-border rounded-xl p-6">
                            <p className="text-text-secondary text-sm font-bold uppercase mb-1">Market Value</p>
                            <p className="text-3xl font-black text-white">${totalMarketValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </div>
                        <div className="bg-surface-dark border border-border rounded-xl p-6">
                            <p className="text-text-secondary text-sm font-bold uppercase mb-1">Total P&L ($)</p>
                            <p className={`text-3xl font-black ${totalPnL >= 0 ? "text-primary" : "text-accent-red"}`}>
                                {totalPnL >= 0 ? "+" : "-"}${Math.abs(totalPnL).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                        </div>
                        <div className="bg-surface-dark border border-border rounded-xl p-6">
                            <p className="text-text-secondary text-sm font-bold uppercase mb-1">Total Return (%)</p>
                            <p className={`text-3xl font-black ${totalPnLPercent >= 0 ? "text-primary" : "text-accent-red"}`}>
                                {totalPnLPercent >= 0 ? "+" : ""}{totalPnLPercent.toFixed(2)}%
                            </p>
                        </div>
                    </div>

                    {/* Add Modal/Input */}
                    {isAdding && (
                        <div className="mb-6 p-4 bg-surface-dark border border-border rounded-xl flex gap-3 items-center">
                            <form onSubmit={handleAdd} className="flex-1 flex gap-3">
                                <input
                                    type="text"
                                    value={newTicker}
                                    onChange={(e) => setNewTicker(e.target.value.toUpperCase())}
                                    placeholder="Enter Ticker (e.g. AAPL)"
                                    className="flex-1 bg-background-dark border border-border rounded-lg px-4 py-2 text-white placeholder-text-secondary focus:border-primary focus:outline-none"
                                    autoFocus
                                />
                                <button
                                    type="submit"
                                    disabled={addMutation.isPending || !newTicker}
                                    className="px-6 py-2 bg-primary text-background-dark font-bold rounded-lg hover:bg-[#45b025] disabled:opacity-50"
                                >
                                    {addMutation.isPending ? "Adding..." : "Add"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsAdding(false)}
                                    className="px-6 py-2 bg-[#2d372a] text-white font-bold rounded-lg hover:bg-[#3a4736]"
                                >
                                    Cancel
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Favorites Table */}
                    {isFavoritesLoading ? (
                        <div className="text-center py-20 text-white">Loading favorites...</div>
                    ) : (
                        <div className="bg-surface-dark border border-border rounded-2xl overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-[#232b22] border-b border-border">
                                        <th className="p-4 text-xs font-semibold text-text-secondary uppercase">Ticker</th>
                                        <th className="p-4 text-xs font-semibold text-text-secondary uppercase">Price</th>
                                        <th className="p-4 text-xs font-semibold text-text-secondary uppercase">Avg Price</th>
                                        <th className="p-4 text-xs font-semibold text-text-secondary uppercase">Shares</th>
                                        <th className="p-4 text-xs font-semibold text-text-secondary uppercase">Market Value</th>
                                        <th className="p-4 text-xs font-semibold text-text-secondary uppercase">Open P&L</th>
                                        <th className="p-4 text-xs font-semibold text-text-secondary uppercase text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {mergedFavorites.map((fav) => {
                                        const marketValue = fav.price * (fav.shares || 0);
                                        const costBasis = (fav.averagePrice || 0) * (fav.shares || 0);
                                        const pnl = marketValue - costBasis;
                                        const pnlPercent = costBasis > 0 ? (pnl / costBasis) * 100 : 0;

                                        return (
                                            <tr key={fav.id} className="group hover:bg-[#232b22] transition-colors">
                                                <td className="p-4">
                                                    <Link to={`/company/${fav.ticker}`} className="flex items-center gap-3 hover:text-primary transition-colors">
                                                        <div className="size-8 rounded bg-white/10 flex items-center justify-center text-xs font-bold text-white">
                                                            {fav.ticker[0]}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-white">{fav.ticker}</div>
                                                            <div className="text-xs text-text-secondary max-w-[150px] truncate">{fav.companyName}</div>
                                                        </div>
                                                    </Link>
                                                </td>
                                                <td className="p-4 font-mono text-white">
                                                    ${fav.price.toFixed(2)}
                                                </td>
                                                <td className="p-4">
                                                    {editingId === fav.id ? (
                                                        <input
                                                            type="number"
                                                            value={editForm.averagePrice}
                                                            onChange={(e) => setEditForm({ ...editForm, averagePrice: e.target.value })}
                                                            className="w-24 bg-background-dark border border-border rounded px-2 py-1 text-sm text-white focus:border-primary focus:outline-none"
                                                            placeholder="0.00"
                                                        />
                                                    ) : (
                                                        <span className="font-mono text-white">${fav.averagePrice?.toFixed(2) || '-'}</span>
                                                    )}
                                                </td>
                                                <td className="p-4">
                                                    {editingId === fav.id ? (
                                                        <input
                                                            type="number"
                                                            value={editForm.shares}
                                                            onChange={(e) => setEditForm({ ...editForm, shares: e.target.value })}
                                                            className="w-20 bg-background-dark border border-border rounded px-2 py-1 text-sm text-white focus:border-primary focus:outline-none"
                                                            placeholder="0"
                                                        />
                                                    ) : (
                                                        <span className="font-mono text-white">{fav.shares || '-'}</span>
                                                    )}
                                                </td>
                                                <td className="p-4 font-mono text-white">
                                                    ${marketValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </td>
                                                <td className="p-4">
                                                    <div className={`flex flex-col ${pnl >= 0 ? "text-primary" : "text-accent-red"}`}>
                                                        <span className="font-bold text-sm">
                                                            {pnl >= 0 ? "+" : "-"}${Math.abs(pnl).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                        </span>
                                                        <span className="text-xs">
                                                            {pnlPercent >= 0 ? "+" : ""}{pnlPercent.toFixed(2)}%
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-right">
                                                    {editingId === fav.id ? (
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={() => saveEdit(fav.id)}
                                                                className="text-primary hover:text-white material-symbols-outlined text-[20px]"
                                                                title="Save"
                                                            >
                                                                check
                                                            </button>
                                                            <button
                                                                onClick={() => setEditingId(null)}
                                                                className="text-text-secondary hover:text-white material-symbols-outlined text-[20px]"
                                                                title="Cancel"
                                                            >
                                                                close
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => startEdit(fav)}
                                                                className="text-text-secondary hover:text-primary material-symbols-outlined text-[20px]"
                                                                title="Edit"
                                                            >
                                                                edit
                                                            </button>
                                                            <button
                                                                onClick={() => deleteMutation.mutate(fav.id)}
                                                                className="text-text-secondary hover:text-accent-red material-symbols-outlined text-[20px]"
                                                                title="Delete"
                                                            >
                                                                delete
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {mergedFavorites.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="p-8 text-center text-text-secondary">
                                                No favorites yet. Add stocks to track your portfolio.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                    <BulkAddFavoritesModal
                        isOpen={isBulkAdding}
                        onClose={() => setIsBulkAdding(false)}
                    />
                </div>
            </main >
        </div >
    );
};

export default Favorites;
