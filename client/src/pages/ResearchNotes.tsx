import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { researchApi, ResearchResult, stockApi, StockQuote } from "../lib/api";

const CompanyResearchNotes: React.FC = () => {
    const { ticker } = useParams<{ ticker: string }>();
    const [research, setResearch] = useState<ResearchResult | null>(null);
    const [stock, setStock] = useState<StockQuote | null>(null);
    const [loading, setLoading] = useState(true);
    const [requesting, setRequesting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [notes, setNotes] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            if (!ticker) return;
            setLoading(true);
            try {
                // Load stock info for header
                const stockData = await stockApi.getStock(ticker);
                setStock(stockData);

                // Load latest research
                const latestResearch = await researchApi.getLatest(ticker);
                if (latestResearch) {
                    setResearch(latestResearch);
                    setNotes(latestResearch.userNotes || "");
                } else {
                    // Triggers auto-request if missing? For now just optional
                }
            } catch (err) {
                console.error("Failed to load research data", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [ticker]);

    const handleGenerateResearch = async () => {
        if (!ticker) return;
        setRequesting(true);
        try {
            await researchApi.request(ticker);
            // Poll for result or just show "Processing" state
            // For simple UX, we might just reload after a delay or show a toaster
            setTimeout(async () => {
                const latest = await researchApi.getLatest(ticker);
                if (latest) setResearch(latest);
                setRequesting(false);
            }, 2000);
        } catch (e) {
            console.error(e);
            setRequesting(false);
        }
    };

    const handleSaveNotes = async () => {
        if (!research) return;
        setSaving(true);
        try {
            const updatedResearch = await researchApi.update(research.requestId, { userNotes: notes });
            setResearch(updatedResearch);
            setIsEditing(false);
        } catch (e) {
            console.error("Failed to save notes", e);
            alert("Failed to save notes. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-background-dark text-white">Loading Research...</div>;
    }

    const priceScenarios = research?.priceScenarios || {
        bull: { price: 0, description: "Loading...", upsidePercent: 0 },
        base: { price: 0, description: "Loading..." },
        bear: { price: 0, description: "Loading...", downsidePercent: 0 }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display min-h-screen flex flex-col overflow-x-hidden">
            <Navbar />

            <div className="flex-1 w-full max-w-[1440px] mx-auto p-4 md:p-8 flex flex-col">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 text-sm font-medium mb-4 text-[#a5b6a0]">
                        <Link to="/quotes" className="hover:text-white transition-colors flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                            Quotes
                        </Link>
                        <span>/</span>
                        <Link to={`/company/${ticker}`} className="hover:text-white transition-colors">
                            {ticker}
                        </Link>
                        <span>/</span>
                        <span className="text-primary">Research</span>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#2d372a] pb-6">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-2">
                                Research <span className="text-[#2d372a] font-light mx-2">|</span> <span className="text-primary">{ticker}</span>
                            </h1>
                            <div className="flex items-center gap-4 text-[#a5b6a0]">
                                <span className="text-lg font-medium text-white">{stock?.companyName || ticker}</span>
                                {research && (
                                    <span className="text-sm">Last analyzed: {new Date(research.completedAt).toLocaleDateString()}</span>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            {!research ? (
                                <button
                                    onClick={handleGenerateResearch}
                                    disabled={requesting}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary hover:bg-[#45b025] text-background-dark text-sm font-bold transition-colors"
                                >
                                    {requesting ? "Analyzing..." : "Generate Research"}
                                </button>
                            ) : (
                                <button
                                    onClick={handleGenerateResearch}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#2d372a] hover:bg-[#3a4736] text-white text-sm font-bold transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[18px]">refresh</span>
                                    Refresh
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content */}
                {!research ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <span className="material-symbols-outlined text-6xl text-[#2d372a] mb-4">analytics</span>
                        <h2 className="text-2xl font-bold text-white mb-2">No Research Available</h2>
                        <p className="text-[#a5b6a0] mb-6 max-w-md">
                            Generate a comprehensive AI analysis for {ticker}, including price targets, catalysts, risks, and earnings takeaways.
                        </p>
                        <button
                            onClick={handleGenerateResearch}
                            disabled={requesting}
                            className="flex items-center gap-2 px-8 py-4 rounded-full bg-primary hover:bg-[#45b025] text-background-dark font-bold text-lg transition-transform hover:scale-105"
                        >
                            <span className="material-symbols-outlined">auto_awesome</span>
                            {requesting ? "Analyzing Market Data..." : "Start Analysis"}
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
                        {/* LEFT COLUMN: Structured Analysis (4 cols) */}
                        <div className="lg:col-span-4 flex flex-col gap-8">

                            {/* My Notes Section */}
                            <section className="flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-[#a5b6a0] ml-1">My Notes</h3>
                                    {!isEditing ? (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="text-xs text-primary hover:text-white transition-colors font-bold uppercase tracking-wider"
                                        >
                                            Edit
                                        </button>
                                    ) : (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    setIsEditing(false);
                                                    setNotes(research.userNotes || "");
                                                }}
                                                className="text-xs text-gray-400 hover:text-white transition-colors font-bold uppercase tracking-wider"
                                                disabled={saving}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleSaveNotes}
                                                className="text-xs text-primary hover:text-white transition-colors font-bold uppercase tracking-wider"
                                                disabled={saving}
                                            >
                                                {saving ? "Saving..." : "Save"}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className={`relative overflow-hidden rounded-xl bg-surface-dark border ${isEditing ? 'border-primary' : 'border-[#2d372a]'} p-5 transition-all`}>
                                    {isEditing ? (
                                        <textarea
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            className="w-full h-32 bg-transparent text-white text-sm leading-relaxed outline-none resize-none placeholder-gray-600"
                                            placeholder="Add your thoughts, strategy, or reminders here..."
                                            autoFocus
                                        />
                                    ) : (
                                        <div className="min-h-[3rem]">
                                            {notes ? (
                                                <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">{notes}</p>
                                            ) : (
                                                <p className="text-gray-600 text-sm italic">No notes added yet. Click edit to add personal insights.</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Price Scenarios */}
                            <section className="flex flex-col gap-4">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-[#a5b6a0] ml-1">Price Scenarios</h3>

                                {/* Bull Case */}
                                <div className="group relative overflow-hidden rounded-xl bg-surface-dark border border-[#2d372a] p-5 transition-all hover:border-primary/50 hover:bg-[#1f2e1b]">
                                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <span className="material-symbols-outlined text-6xl text-primary">trending_up</span>
                                    </div>
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="text-primary text-sm font-bold uppercase tracking-wide">Bull Case</p>
                                        <span className="bg-primary/20 text-primary text-xs font-bold px-2 py-1 rounded-md">
                                            +{priceScenarios.bull.upsidePercent}%
                                        </span>
                                    </div>
                                    <p className="text-white text-3xl font-black mb-1">${priceScenarios.bull.price.toFixed(2)}</p>
                                    <p className="text-[#a5b6a0] text-sm leading-relaxed">{priceScenarios.bull.description}</p>
                                </div>

                                {/* Base Case */}
                                <div className="group relative overflow-hidden rounded-xl bg-surface-dark border border-[#2d372a] p-5 transition-all hover:border-white/30">
                                    <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <span className="material-symbols-outlined text-6xl text-white">trending_flat</span>
                                    </div>
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="text-white text-sm font-bold uppercase tracking-wide opacity-80">Base Case</p>
                                        <span className="bg-white/10 text-white text-xs font-bold px-2 py-1 rounded-md">Target</span>
                                    </div>
                                    <p className="text-white text-3xl font-black mb-1">${priceScenarios.base.price.toFixed(2)}</p>
                                    <p className="text-[#a5b6a0] text-sm leading-relaxed">{priceScenarios.base.description}</p>
                                </div>

                                {/* Bear Case */}
                                <div className="group relative overflow-hidden rounded-xl bg-surface-dark border border-[#2d372a] p-5 transition-all hover:border-red-500/50 hover:bg-[#2e1b1b]">
                                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <span className="material-symbols-outlined text-6xl text-red-500">trending_down</span>
                                    </div>
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="text-red-500 text-sm font-bold uppercase tracking-wide">Bear Case</p>
                                        <span className="bg-red-500/20 text-red-500 text-xs font-bold px-2 py-1 rounded-md">
                                            -{priceScenarios.bear.downsidePercent}%
                                        </span>
                                    </div>
                                    <p className="text-white text-3xl font-black mb-1">${priceScenarios.bear.price.toFixed(2)}</p>
                                    <p className="text-[#a5b6a0] text-sm leading-relaxed">{priceScenarios.bear.description}</p>
                                </div>
                            </section>

                            {/* Catalysts & Risks */}
                            <section className="flex flex-col gap-6">
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-[#a5b6a0] ml-1 mb-3">Catalysts</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {research.catalysts?.map((cat, idx) => (
                                            <div key={idx} className="flex h-auto py-2 items-center gap-2 rounded-full bg-primary/10 border border-primary/20 pl-2 pr-4 hover:bg-primary/20 cursor-default transition-colors">
                                                <span className="material-symbols-outlined text-primary text-[18px]">bolt</span>
                                                <span className="text-primary text-sm font-bold">{cat.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-[#a5b6a0] ml-1 mb-3">Risks</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {research.risks?.map((risk, idx) => (
                                            <div key={idx} className="flex h-auto py-2 items-center gap-2 rounded-full bg-orange-500/10 border border-orange-500/20 pl-2 pr-4 hover:bg-orange-500/20 cursor-default transition-colors">
                                                <span className="material-symbols-outlined text-orange-500 text-[18px]">warning</span>
                                                <span className="text-orange-500 text-sm font-bold">{risk.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* RIGHT COLUMN: Analysis Content */}
                        <div className="lg:col-span-8 flex flex-col h-full min-h-[600px] rounded-xl bg-surface-dark border border-[#2d372a] shadow-2xl relative overflow-hidden">
                            <div className="flex-1 p-8 md:p-10 overflow-y-auto">
                                <h2 className="text-2xl font-bold text-white mb-6">Exec Summary</h2>
                                <p className="text-[#d1d5db] mb-8 leading-relaxed text-lg">
                                    {research.summary}
                                </p>

                                <h3 className="text-xl font-bold text-white mb-4">Key Findings</h3>
                                <ul className="space-y-4 mb-8">
                                    {research.keyFindings.map((finding, idx) => (
                                        <li key={idx} className="flex items-start gap-3">
                                            <div className="mt-1 size-5 rounded bg-[#2d372a] border border-[#a5b6a0] flex items-center justify-center shrink-0 text-primary">
                                                <span className="material-symbols-outlined text-[14px]">check</span>
                                            </div>
                                            <span className="text-[#d1d5db]">{finding}</span>
                                        </li>
                                    ))}
                                </ul>

                                {research.sources && research.sources.length > 0 && (
                                    <>
                                        <h3 className="text-xl font-bold text-white mb-4 mt-8">Primary Sources</h3>
                                        <div className="grid grid-cols-1 gap-3">
                                            {research.sources.map((source, idx) => (
                                                <a key={idx} href={source.url} target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 rounded-lg bg-[#2d372a]/50 border border-white/5 hover:bg-[#2d372a] transition-colors group">
                                                    <div className="flex items-center gap-3">
                                                        <span className="material-symbols-outlined text-[#a5b6a0]">description</span>
                                                        <div>
                                                            <p className="text-white font-medium text-sm group-hover:text-primary transition-colors">{source.title}</p>
                                                            {source.publishedAt && <p className="text-xs text-gray-500">{new Date(source.publishedAt).toLocaleDateString()}</p>}
                                                        </div>
                                                    </div>
                                                    <span className="material-symbols-outlined text-gray-500 group-hover:text-white">open_in_new</span>
                                                </a>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CompanyResearchNotes;
