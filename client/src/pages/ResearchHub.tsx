import React, { useState, useMemo } from "react";
import { useQuery } from '@tanstack/react-query';
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { stockApi, researchApi, StockQuote } from "../lib/api";

interface NewsItem {
    title: string;
    link: string;
    publisher: string;
    publishedAt: number;
    tickers: string[];
    uuid: string; // unique identifier for deduplication
    isTopNews?: boolean;
}

const ResearchHub: React.FC = () => {
    const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<{
        summary: string;
        affectedStocks: Array<{
            ticker: string;
            impact: 'positive' | 'negative' | 'neutral';
            reasoning: string;
        }>;
    } | null>(null);

    // Analyze news when selected
    React.useEffect(() => {
        if (selectedNews) {
            setIsAnalyzing(true);
            setAnalysisResult(null);

            researchApi.analyzeNews({
                title: selectedNews.title,
                url: selectedNews.link,
                publisher: selectedNews.publisher
            })
                .then(res => {
                    if (res.analysis) {
                        setAnalysisResult(res.analysis);
                    }
                })
                .catch(err => console.error("Analysis failed", err))
                .finally(() => setIsAnalyzing(false));
        } else {
            setAnalysisResult(null);
        }
    }, [selectedNews]);

    // Fetch all stocks for quote sheet data
    const { data: stocks, isLoading: isLoadingStocks } = useQuery({
        queryKey: ['stocks'],
        queryFn: () => stockApi.getStocks()
    });

    // Fetch top market news
    const { data: marketNews, isLoading: isLoadingNews } = useQuery({
        queryKey: ['marketNews'],
        queryFn: () => stockApi.getMarketNews()
    });

    // Aggregate and process news
    const { newsFeed, relatedStocks } = useMemo(() => {
        const newsMap = new Map<string, NewsItem>();
        const stockMap = new Map<string, StockQuote>();

        // Trusted Sources Filter
        const TRUSTED_SOURCES = ['Reuters', 'Bloomberg', 'CNBC', 'Wall Street Journal', 'Financial Times', 'Barrons'];

        const isTrustedSource = (publisher: string) => {
            if (!publisher) return false;
            return TRUSTED_SOURCES.some(source => publisher.toLowerCase().includes(source.toLowerCase()));
        };

        // Index stocks for quick lookup
        stocks?.forEach(stock => {
            stockMap.set(stock.ticker, stock);
        });

        // process market news first (High Importance)
        if (marketNews) {
            marketNews.forEach((article: any) => {
                // Double check trust (backend should filter, but good for safety)
                if (!isTrustedSource(article.publisher)) return;

                const key = article.link || article.title;
                newsMap.set(key, {
                    title: article.title,
                    link: article.link,
                    publisher: article.publisher,
                    publishedAt: article.providerPublishTime ? (typeof article.providerPublishTime === 'number' ? article.providerPublishTime * 1000 : new Date(article.providerPublishTime).getTime()) : Date.now(),
                    tickers: article.relatedTickers || [],
                    uuid: key,
                    isTopNews: true
                } as NewsItem & { isTopNews: boolean });
            });
        }

        // process stock specific news
        if (stocks) {
            stocks.forEach(stock => {
                if (stock.news && Array.isArray(stock.news)) {
                    stock.news.forEach(article => {
                        // Apply trusted source filter
                        if (!isTrustedSource(article.publisher)) return;

                        const key = article.link || article.title;

                        // Only add if not already present (prioritize market news version)
                        if (!newsMap.has(key)) {
                            newsMap.set(key, {
                                title: article.title,
                                link: article.link,
                                publisher: article.publisher,
                                publishedAt: article.providerPublishTime ? (typeof article.providerPublishTime === 'number' ? article.providerPublishTime * 1000 : new Date(article.providerPublishTime).getTime()) : Date.now(),
                                tickers: [stock.ticker],
                                uuid: key
                            });
                        } else {
                            const existing = newsMap.get(key)!;
                            // Add ticker if not already present
                            if (!existing.tickers.includes(stock.ticker)) {
                                existing.tickers.push(stock.ticker);
                            }
                        }
                    });
                }
            });
        }

        // Convert map to array and sort by date descending
        const sortedNews = Array.from(newsMap.values()).sort((a, b) => b.publishedAt - a.publishedAt);

        // Determine related stocks based on selection or top news
        let displayStocks: StockQuote[] = [];

        if (selectedNews) {
            if (analysisResult && analysisResult.affectedStocks.length > 0) {
                // Use AI identified stocks if available
                displayStocks = analysisResult.affectedStocks
                    .map(item => stockMap.get(item.ticker))
                    .filter((s): s is StockQuote => !!s);

                // If AI found no matching stocks in our DB, arguably we should still list them?
                // For now, let's stick to stocks we know about to avoid UI breaking for missing data.
                // But we might want to fetch them if missing.
            } else {
                // Fallback to "guessed" stocks
                displayStocks = selectedNews.tickers
                    .map(t => stockMap.get(t))
                    .filter((s): s is StockQuote => !!s);
            }
        } else {
            // Default: Show stocks from the top news items
            const topTickers = new Set<string>();
            sortedNews.slice(0, 5).forEach(news => {
                news.tickers.forEach(t => topTickers.add(t));
            });
            displayStocks = Array.from(topTickers)
                .map(t => stockMap.get(t))
                .filter((s): s is StockQuote => !!s);
        }

        return { newsFeed: sortedNews, relatedStocks: displayStocks };
    }, [stocks, marketNews, selectedNews, analysisResult]);

    const isLoading = isLoadingStocks || isLoadingNews;

    return (
        <div className="bg-background-dark font-display antialiased text-white overflow-hidden h-screen flex flex-col">
            <Navbar />

            <main className="flex-1 overflow-hidden relative bg-background-dark">
                <div className="flex h-full">
                    {/* Left Column: News Feed */}
                    <div className="w-1/2 lg:w-3/5 border-r border-[#2d372a] flex flex-col h-full">
                        <div className="p-6 border-b border-[#2d372a] bg-background-dark/95 backdrop-blur z-10 sticky top-0">
                            <h1 className="text-2xl font-black tracking-tight text-white mb-1">
                                Market <span className="text-primary">Pulse</span>
                            </h1>
                            <p className="text-[#a5b6a0] text-sm">
                                Real-time developments affecting the market
                            </p>
                        </div>

                        <div className="overflow-y-auto flex-1 p-6 space-y-4">
                            {isLoading ? (
                                <div className="text-center py-10 text-[#a5b6a0]">Loading market data...</div>
                            ) : newsFeed.length === 0 ? (
                                <div className="text-center py-10 text-[#a5b6a0]">No recent news found from trusted sources.</div>
                            ) : (
                                newsFeed.map((news) => (
                                    <div
                                        key={news.uuid}
                                        onClick={() => setSelectedNews(news)}
                                        className={`group cursor-pointer p-5 rounded-xl border transition-all duration-200 ${selectedNews?.uuid === news.uuid
                                            ? 'bg-[#1f2e1b] border-primary shadow-lg shadow-primary/10'
                                            : 'bg-surface-dark border-[#2d372a] hover:border-[#a5b6a0]/50 hover:bg-[#232b22]'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-primary uppercase tracking-wider">{news.publisher}</span>
                                                {news.isTopNews && (
                                                    <span className="px-1.5 py-0.5 rounded bg-accent-red/20 text-accent-red text-[10px] font-bold uppercase border border-accent-red/30">
                                                        Top News
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-xs text-[#a5b6a0]">{new Date(news.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <h3 className="text-lg font-bold text-white mb-3 leading-snug group-hover:text-primary transition-colors">
                                            {news.title}
                                        </h3>

                                        <div className="flex items-center justify-between mt-4">
                                            <div className="flex flex-wrap gap-2">
                                                {news.tickers.map(ticker => (
                                                    <span key={ticker} className="px-2 py-0.5 rounded bg-[#2d372a] border border-[#a5b6a0]/20 text-xs font-mono font-medium text-[#a5b6a0] group-hover:text-white group-hover:border-[#a5b6a0]/50 transition-colors">
                                                        {ticker}
                                                    </span>
                                                ))}
                                            </div>
                                            <a
                                                href={news.link}
                                                target="_blank"
                                                rel="noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                                className="text-primary hover:text-white hover:underline text-xs font-bold flex items-center gap-1"
                                            >
                                                Read Article <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                                            </a>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Right Column: Related Stocks */}
                    <div className="w-1/2 lg:w-2/5 bg-[#131712] flex flex-col h-full border-l border-[#2d372a] -ml-[1px]">
                        <div className="p-6 border-b border-[#2d372a] bg-[#131712]/95 backdrop-blur z-10 sticky top-0 flex flex-col gap-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-lg font-bold text-white uppercase tracking-widest flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">analytics</span>
                                        {selectedNews ? "Analysis & Impact" : "Top Movers"}
                                    </h2>
                                    {selectedNews && (
                                        <button
                                            onClick={() => setSelectedNews(null)}
                                            className="text-xs text-[#a5b6a0] hover:text-primary mt-1 flex items-center gap-1 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-[12px]">arrow_back</span>
                                            Back to Overview
                                        </button>
                                    )}
                                </div>
                            </div>

                            {selectedNews && (
                                <div className="bg-[#1f261d] rounded-lg p-4 border border-[#2d372a]">
                                    {isAnalyzing ? (
                                        <div className="flex items-center gap-3 text-[#a5b6a0] text-sm animate-pulse">
                                            <span className="material-symbols-outlined">auto_awesome</span>
                                            <span>Analyzing article with AI...</span>
                                        </div>
                                    ) : analysisResult ? (
                                        <div className="space-y-3">
                                            <div>
                                                <div className="text-[10px] uppercase font-bold text-primary mb-1">AI Summary</div>
                                                <p className="text-sm text-white leading-relaxed">{analysisResult.summary}</p>
                                            </div>
                                            {/* We can also show specific reasoning for stocks if desired in the list below */}
                                        </div>
                                    ) : (
                                        <div className="text-sm text-[#a5b6a0]">
                                            Unable to analyze. Showing estimated related stocks.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="overflow-y-auto flex-1">
                            {relatedStocks.length === 0 ? (
                                <div className="p-8 text-center">
                                    <p className="text-[#a5b6a0]">No quote data available for selected items.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-[#2d372a]">
                                    {relatedStocks.map(stock => (
                                        <Link
                                            key={stock.ticker}
                                            to={`/company/${stock.ticker}`}
                                            className="block p-4 hover:bg-[#1f261d] transition-colors group"
                                        >
                                            <div className="flex justify-between items-center mb-1">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-10 rounded-lg bg-[#2d372a] flex items-center justify-center font-black text-white text-sm group-hover:bg-primary group-hover:text-black transition-colors">
                                                        {stock.ticker[0]}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-white text-lg">{stock.ticker}</div>
                                                        <div className="text-xs text-[#a5b6a0] truncate max-w-[120px]">{stock.companyName}</div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-mono text-white text-lg font-medium">${stock.currentPrice.toFixed(2)}</div>
                                                    <div className={`text-sm font-bold flex items-center justify-end gap-0.5 ${(stock.change30d || 0) >= 0 ? 'text-primary' : 'text-accent-red'}`}>
                                                        {(stock.change30d || 0) >= 0 ? '▲' : '▼'}
                                                        {(stock.change30d || 0).toFixed(2)}%
                                                    </div>
                                                </div>
                                            </div>

                                            {analysisResult && (
                                                <div className="mt-2 mb-2">
                                                    {(() => {
                                                        const impact = analysisResult.affectedStocks.find(s => s.ticker === stock.ticker);
                                                        if (impact) {
                                                            return (
                                                                <div className={`text-xs p-2 rounded border ${impact.impact === 'positive' ? 'bg-primary/10 border-primary/20 text-primary' :
                                                                        impact.impact === 'negative' ? 'bg-accent-red/10 border-accent-red/20 text-accent-red' :
                                                                            'bg-[#2d372a]/50 border-[#2d372a] text-[#a5b6a0]'
                                                                    }`}>
                                                                    <span className="font-bold uppercase mr-1">{impact.impact}:</span>
                                                                    {impact.reasoning}
                                                                </div>
                                                            );
                                                        }
                                                        return null;
                                                    })()}
                                                </div>
                                            )}

                                            <div className="mt-3 grid grid-cols-3 gap-2">
                                                <div className="bg-[#0f120e] rounded p-2 border border-[#232b22]">
                                                    <div className="text-[10px] text-[#5c6b57] uppercase font-bold">P/E Ratio</div>
                                                    <div className="text-white text-xs font-mono">{stock.pe?.toFixed(1) || '-'}</div>
                                                </div>
                                                <div className="bg-[#0f120e] rounded p-2 border border-[#232b22]">
                                                    <div className="text-[10px] text-[#5c6b57] uppercase font-bold">Mkt Cap</div>
                                                    <div className="text-white text-xs font-mono">{(stock.marketCap ? (stock.marketCap / 1e9).toFixed(1) + 'B' : '-')}</div>
                                                </div>
                                                <div className="bg-[#0f120e] rounded p-2 border border-[#232b22]">
                                                    <div className="text-[10px] text-[#5c6b57] uppercase font-bold">Rel Vol</div>
                                                    <div className="text-white text-xs font-mono">1.2x</div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ResearchHub;
