import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

interface StockDetailsModalProps {
    ticker: string | null;
    onClose: () => void;
}

const StockDetailsModal: React.FC<StockDetailsModalProps> = ({ ticker, onClose }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'news' | 'earnings'>('overview');
    const queryClient = useQueryClient();

    // Fetch Stock Data
    const { data: stock, isLoading: loadingStock } = useQuery({
        queryKey: ['stock', ticker],
        queryFn: async () => {
            if (!ticker) return null;
            const res = await axios.get(`/api/stocks/${ticker}`);
            return res.data.data;
        },
        enabled: !!ticker,
    });

    // Fetch Earnings
    const { data: earnings } = useQuery({
        queryKey: ['earnings', ticker],
        queryFn: async () => {
            if (!ticker) return [];
            const res = await axios.get(`/api/earnings/${ticker}`);
            return res.data.data;
        },
        enabled: !!ticker && activeTab === 'earnings',
    });

    // Add Earnings Mutation
    const [newEarnings, setNewEarnings] = useState({ quarter: '', reportDate: '', revenue: '', eps: '', notes: '' });
    const addEarningsMutation = useMutation({
        mutationFn: async (data: any) => {
            await axios.post('/api/earnings', { ...data, ticker });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['earnings', ticker] });
            setNewEarnings({ quarter: '', reportDate: '', revenue: '', eps: '', notes: '' }); // Reset form
        },
    });

    if (!ticker) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-[#1a2119] border border-[#2d372a] rounded-2xl w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-[#2d372a] flex justify-between items-center bg-[#232b22]">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            {ticker}
                            {loadingStock && <span className="text-sm font-normal text-[#a5b6a0] animate-pulse">Loading...</span>}
                        </h2>
                        {stock && <p className="text-[#a5b6a0]">{stock.companyName} • {stock.sector}</p>}
                    </div>
                    <div className="flex items-center gap-4">
                        {stock && (
                            <div className="text-right">
                                <div className="text-xl font-mono text-white">${stock.currentPrice?.toFixed(2)}</div>
                                <div className={`text-sm font-bold ${stock.change30d >= 0 ? 'text-primary' : 'text-red-500'}`}>
                                    {stock.change30d?.toFixed(2)}% (30d)
                                </div>
                            </div>
                        )}
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-[#a5b6a0] hover:text-white transition-colors">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-[#2d372a] bg-[#1a2119]">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'overview' ? 'border-primary text-primary' : 'border-transparent text-[#a5b6a0] hover:text-white'}`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('earnings')}
                        className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'earnings' ? 'border-primary text-primary' : 'border-transparent text-[#a5b6a0] hover:text-white'}`}
                    >
                        Earnings Reports
                    </button>
                    <button
                        onClick={() => setActiveTab('news')}
                        className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'news' ? 'border-primary text-primary' : 'border-transparent text-[#a5b6a0] hover:text-white'}`}
                    >
                        News & Notes
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-[#131712]">
                    {activeTab === 'overview' && stock && (
                        <div className="grid grid-cols-2 gap-6">
                            <div className="p-4 bg-[#1a2119] rounded-xl border border-[#2d372a]">
                                <h3 className="text-[#a5b6a0] text-xs font-bold uppercase mb-4">Performance</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between"><span>7 Day</span> <span className={stock.change7d >= 0 ? 'text-primary' : 'text-red-500'}>{stock.change7d?.toFixed(2)}%</span></div>
                                    <div className="flex justify-between"><span>30 Day</span> <span className={stock.change30d >= 0 ? 'text-primary' : 'text-red-500'}>{stock.change30d?.toFixed(2)}%</span></div>
                                    <div className="flex justify-between"><span>90 Day</span> <span className={stock.change90d >= 0 ? 'text-primary' : 'text-red-500'}>{stock.change90d?.toFixed(2)}%</span></div>
                                </div>
                            </div>
                            <div className="p-4 bg-[#1a2119] rounded-xl border border-[#2d372a]">
                                <h3 className="text-[#a5b6a0] text-xs font-bold uppercase mb-4">Highs</h3>
                                <div className="space-y-3 text-white">
                                    <div className="flex justify-between"><span>30 Day High</span> <span>${stock.high30d?.toFixed(2)}</span></div>
                                    <div className="flex justify-between"><span>3 Month High</span> <span>${stock.high3mo?.toFixed(2)}</span></div>
                                    <div className="flex justify-between"><span>1 Year High</span> <span>${stock.high1yr?.toFixed(2)}</span></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'earnings' && (
                        <div className="space-y-8">
                            {/* Add New Earnings Form */}
                            <div className="p-6 bg-[#1a2119] rounded-xl border border-[#2d372a]">
                                <h3 className="text-white font-bold mb-4">Record Earnings Report</h3>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <input
                                        type="text"
                                        placeholder="Quarter (e.g. Q1 2024)"
                                        className="bg-[#131712] border border-[#2d372a] rounded p-3 text-white text-sm"
                                        value={newEarnings.quarter}
                                        onChange={e => setNewEarnings({ ...newEarnings, quarter: e.target.value })}
                                    />
                                    <input
                                        type="date"
                                        className="bg-[#131712] border border-[#2d372a] rounded p-3 text-white text-sm"
                                        value={newEarnings.reportDate}
                                        onChange={e => setNewEarnings({ ...newEarnings, reportDate: e.target.value })}
                                    />
                                    <input
                                        type="number"
                                        placeholder="Revenue (in Billions)"
                                        className="bg-[#131712] border border-[#2d372a] rounded p-3 text-white text-sm"
                                        value={newEarnings.revenue}
                                        onChange={e => setNewEarnings({ ...newEarnings, revenue: e.target.value })}
                                    />
                                    <input
                                        type="number"
                                        placeholder="EPS"
                                        className="bg-[#131712] border border-[#2d372a] rounded p-3 text-white text-sm"
                                        value={newEarnings.eps}
                                        onChange={e => setNewEarnings({ ...newEarnings, eps: e.target.value })}
                                    />
                                </div>
                                <textarea
                                    placeholder="Notes / Guidance..."
                                    className="w-full bg-[#131712] border border-[#2d372a] rounded p-3 text-white text-sm mb-4 h-24"
                                    value={newEarnings.notes}
                                    onChange={e => setNewEarnings({ ...newEarnings, notes: e.target.value })}
                                />
                                <button
                                    onClick={() => addEarningsMutation.mutate(newEarnings)}
                                    disabled={!newEarnings.quarter || !newEarnings.reportDate}
                                    className="px-6 py-2 bg-primary text-black font-bold rounded-full text-sm hover:bg-[#45b025] disabled:opacity-50"
                                >
                                    Save Report
                                </button>
                            </div>

                            {/* Earnings History */}
                            <div className="space-y-4">
                                <h3 className="text-[#a5b6a0] text-xs font-bold uppercase">History</h3>
                                {earnings && earnings.map((report: any) => (
                                    <div key={report.id} className="p-4 bg-[#1a2119] rounded-xl border border-[#2d372a]">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-white text-lg">{report.quarter}</h4>
                                            <span className="text-[#a5b6a0] text-sm">{new Date(report.reportDate).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex gap-6 text-sm mb-3">
                                            <span className="text-white">Revenue: <span className="font-mono text-primary">${report.revenue}B</span></span>
                                            <span className="text-white">EPS: <span className="font-mono text-primary">${report.eps}</span></span>
                                        </div>
                                        {report.notes && <p className="text-[#a5b6a0] text-sm">{report.notes}</p>}
                                    </div>
                                ))}
                                {(!earnings || earnings.length === 0) && (
                                    <div className="text-[#a5b6a0] text-sm italic">No earnings reports recorded yet.</div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'news' && (
                        <div className="text-center py-10 text-[#a5b6a0]">
                            News upload feature coming soon! (Use Notes in global nav for now)
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StockDetailsModal;
