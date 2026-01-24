'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTickerDetails, addNewsItem, addEarningsReport } from '@/app/upload-actions';

// Icons
import { FileText, TrendingUp, X } from 'lucide-react';

export default function StockDetails({ symbol, onClose }: { symbol: string; onClose: () => void }) {
    const [activeTab, setActiveTab] = useState<'news' | 'earnings'>('news');
    const queryClient = useQueryClient();

    // Forms state
    const [newsForm, setNewsForm] = useState({ title: '', summary: '', url: '' });
    const [earningsForm, setEarningsForm] = useState({ quarter: '', revenue: '', eps: '', notes: '' });

    const { data: ticker, isLoading } = useQuery({
        queryKey: ['ticker', symbol],
        queryFn: () => getTickerDetails(symbol),
    });

    const newsMutation = useMutation({
        mutationFn: async () => addNewsItem(symbol, newsForm.title, newsForm.summary, newsForm.url),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ticker', symbol] });
            setNewsForm({ title: '', summary: '', url: '' });
        }
    });

    const earningsMutation = useMutation({
        mutationFn: async () => addEarningsReport(symbol, earningsForm.quarter, Number(earningsForm.revenue), Number(earningsForm.eps), earningsForm.notes),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ticker', symbol] });
            setEarningsForm({ quarter: '', revenue: '', eps: '', notes: '' });
        }
    });

    if (!symbol) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur">
                    <div>
                        <h2 className="text-2xl font-bold">{symbol}</h2>
                        <p className="text-gray-500">{ticker?.name}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 space-y-6 flex-1">
                    {/* Tabs */}
                    <div className="flex gap-4 border-b border-gray-200 dark:border-gray-800">
                        <button
                            onClick={() => setActiveTab('news')}
                            className={`pb-2 px-1 flex items-center gap-2 ${activeTab === 'news' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
                        >
                            <FileText className="w-4 h-4" /> News & Notes
                        </button>
                        <button
                            onClick={() => setActiveTab('earnings')}
                            className={`pb-2 px-1 flex items-center gap-2 ${activeTab === 'earnings' ? 'border-b-2 border-green-500 text-green-500' : 'text-gray-500'}`}
                        >
                            <TrendingUp className="w-4 h-4" /> Earnings
                        </button>
                    </div>

                    {/* Content Area */}
                    {activeTab === 'news' && (
                        <div className="space-y-6">
                            {/* Add News Form */}
                            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg space-y-3">
                                <h3 className="font-semibold text-sm uppercase tracking-wide text-gray-500">Add News Item</h3>
                                <input
                                    className="w-full p-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                                    placeholder="Headline / Title"
                                    value={newsForm.title}
                                    onChange={e => setNewsForm(prev => ({ ...prev, title: e.target.value }))}
                                />
                                <textarea
                                    className="w-full p-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 h-20"
                                    placeholder="Summary or paste content here..."
                                    value={newsForm.summary}
                                    onChange={e => setNewsForm(prev => ({ ...prev, summary: e.target.value }))}
                                />
                                <div className="flex justify-end">
                                    <button
                                        onClick={() => newsMutation.mutate()}
                                        disabled={!newsForm.title || newsMutation.isPending}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
                                    >
                                        {newsMutation.isPending ? 'Saving...' : 'Save Note'}
                                    </button>
                                </div>
                            </div>

                            {/* List */}
                            <div className="space-y-4">
                                {ticker?.news.length === 0 && <p className="text-center text-gray-400 py-4">No news items yet.</p>}
                                {ticker?.news.map(item => (
                                    <div key={item.id} className="border-l-2 border-blue-500 pl-4 py-1">
                                        <h4 className="font-semibold">{item.title}</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 whitespace-pre-wrap">{item.summary}</p>
                                        <span className="text-xs text-gray-400 mt-2 block">{new Date(item.publishedAt).toLocaleDateString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'earnings' && (
                        <div className="space-y-6">
                            {/* Add Earnings Form */}
                            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg space-y-3">
                                <h3 className="font-semibold text-sm uppercase tracking-wide text-gray-500">Record Earnings</h3>
                                <div className="grid grid-cols-3 gap-2">
                                    <input
                                        className="p-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                                        placeholder="Quarter (e.g. Q3 24)"
                                        value={earningsForm.quarter}
                                        onChange={e => setEarningsForm(prev => ({ ...prev, quarter: e.target.value }))}
                                    />
                                    <input
                                        className="p-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                                        placeholder="Revenue ($B)"
                                        type="number"
                                        value={earningsForm.revenue}
                                        onChange={e => setEarningsForm(prev => ({ ...prev, revenue: e.target.value }))}
                                    />
                                    <input
                                        className="p-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                                        placeholder="EPS ($)"
                                        type="number"
                                        value={earningsForm.eps}
                                        onChange={e => setEarningsForm(prev => ({ ...prev, eps: e.target.value }))}
                                    />
                                </div>
                                <textarea
                                    className="w-full p-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 h-20"
                                    placeholder="Key takeaways / notes..."
                                    value={earningsForm.notes}
                                    onChange={e => setEarningsForm(prev => ({ ...prev, notes: e.target.value }))}
                                />
                                <div className="flex justify-end">
                                    <button
                                        onClick={() => earningsMutation.mutate()}
                                        disabled={!earningsForm.quarter || earningsMutation.isPending}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm"
                                    >
                                        {earningsMutation.isPending ? 'Saving...' : 'Save Report'}
                                    </button>
                                </div>
                            </div>

                            {/* List */}
                            <div className="space-y-4">
                                {ticker?.earnings.length === 0 && <p className="text-center text-gray-400 py-4">No reports recorded yet.</p>}
                                {ticker?.earnings.map(report => (
                                    <div key={report.id} className="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                                        <div className="flex justify-between font-bold mb-2">
                                            <span>{report.quarter}</span>
                                            <span className="text-sm text-gray-400">{new Date(report.reportDate).toLocaleDateString()}</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                                            <div>
                                                <span className="text-gray-500 block">Revenue</span>
                                                <span className="font-mono">{report.revenue}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500 block">EPS</span>
                                                <span className="font-mono">{report.eps}</span>
                                            </div>
                                        </div>
                                        {report.notes && (
                                            <p className="text-sm text-gray-600 dark:text-gray-300 border-t border-gray-100 dark:border-gray-800 pt-2">
                                                {report.notes}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
