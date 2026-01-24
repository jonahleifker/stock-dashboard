import React from "react";

interface ResearchResult {
    summary: string;
    keyFindings: string[];
    sentiment?: {
        overall: 'positive' | 'negative' | 'neutral';
        score: number;
    };
    completedAt: string;
}

interface AntiGravitySectionProps {
    data?: ResearchResult;
    isLoading?: boolean;
    onRefresh?: () => void;
}

const AntiGravitySection: React.FC<AntiGravitySectionProps> = ({
    data,
    isLoading = false,
    onRefresh,
}) => {
    const getSentimentColor = (sentiment?: string) => {
        switch (sentiment) {
            case 'positive': return 'text-primary';
            case 'negative': return 'text-red-500';
            default: return 'text-[#a5b6a0]';
        }
    };

    const getSentimentIcon = (sentiment?: string) => {
        switch (sentiment) {
            case 'positive': return 'sentiment_very_satisfied';
            case 'negative': return 'sentiment_very_dissatisfied';
            default: return 'sentiment_neutral';
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col gap-6 animate-pulse">
                <div className="h-24 bg-[#152012] rounded-xl"></div>
                <div className="space-y-3">
                    <div className="h-4 bg-[#152012] rounded w-3/4"></div>
                    <div className="h-4 bg-[#152012] rounded w-1/2"></div>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-primary text-3xl">psychology</span>
                </div>
                <h4 className="text-white font-bold mb-2">No AI Analysis Found</h4>
                <p className="text-[#a5b6a0] text-sm mb-6 max-w-xs">
                    Trigger Anti-Gravity research to get deep AI-driven insights for this ticker.
                </p>
                <button
                    onClick={onRefresh}
                    className="flex items-center gap-2 px-6 py-2 rounded-full bg-primary text-[#131712] font-bold text-sm hover:scale-105 transition-transform"
                >
                    <span className="material-symbols-outlined text-sm">rocket_launch</span>
                    Launch Analysis
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8">
            {/* AI Summary Card */}
            <div className="relative overflow-hidden rounded-2xl bg-[#0d140b] border border-primary/20 p-6 shadow-[0_0_30px_rgba(83,210,45,0.05)]">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <span className="material-symbols-outlined text-6xl text-primary">auto_awesome</span>
                </div>
                <div className="flex items-center gap-2 mb-4">
                    <span className="flex size-2 rounded-full bg-primary animate-pulse"></span>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">AI Synthesis Engine</span>
                </div>
                <p className="text-lg text-white leading-relaxed font-medium">
                    {data.summary}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Key Findings */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black uppercase tracking-widest text-[#a5b6a0]">Key Findings</h4>
                        <span className="text-[10px] text-[#2d372a] font-mono">CONFIDENCE: 94%</span>
                    </div>
                    <div className="space-y-3">
                        {data.keyFindings.map((finding, idx) => (
                            <div key={idx} className="flex gap-4 p-4 rounded-xl bg-[#0d140b] border border-[#2d372a] group hover:border-primary/30 transition-colors">
                                <span className="material-symbols-outlined text-primary text-[20px] shrink-0">check_circle</span>
                                <p className="text-sm text-[#d1d5db] group-hover:text-white transition-colors">{finding}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sentiment & Metadata */}
                <div className="flex flex-col gap-6">
                    <div className="p-6 rounded-2xl bg-[#0d140b] border border-[#2d372a] flex flex-col gap-6">
                        <div className="flex justify-between items-center">
                            <h4 className="text-xs font-black uppercase tracking-widest text-[#a5b6a0]">Market Sentiment</h4>
                            <span className="text-[10px] text-[#a5b6a0]">{new Date(data.completedAt).toLocaleDateString()}</span>
                        </div>

                        <div className="flex items-center justify-center py-4">
                            <div className="relative size-32 flex items-center justify-center rounded-full border-2 border-[#2d372a]">
                                <div
                                    className="absolute inset-0 rounded-full border-t-2 border-primary"
                                    style={{ transform: `rotate(${data.sentiment?.score ? data.sentiment.score * 360 : 0}deg)` }}
                                ></div>
                                <div className="flex flex-col items-center">
                                    <span className={`material-symbols-outlined text-4xl ${getSentimentColor(data.sentiment?.overall)}`}>
                                        {getSentimentIcon(data.sentiment?.overall)}
                                    </span>
                                    <span className={`text-sm font-black uppercase mt-1 ${getSentimentColor(data.sentiment?.overall)}`}>
                                        {data.sentiment?.overall}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between text-xs font-bold text-[#a5b6a0]">
                                <span>Risk Level</span>
                                <span className="text-white">Medium</span>
                            </div>
                            <div className="h-1.5 w-full bg-[#2d372a] rounded-full overflow-hidden">
                                <div className="h-full w-1/2 bg-yellow-500"></div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={onRefresh}
                        className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-[#2d372a] hover:bg-[#3d4a39] text-white font-bold transition-all border border-white/5"
                    >
                        <span className="material-symbols-outlined">refresh</span>
                        Refresh AI Insights
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AntiGravitySection;
