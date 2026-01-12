import React from "react";
import Navbar from "../components/Navbar";

const CompanyResearchNotes: React.FC = () => {
    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display min-h-screen flex flex-col overflow-x-hidden">
            <Navbar />

            {/* Main Layout */}
            <div className="flex-1 w-full max-w-[1440px] mx-auto p-4 md:p-8 flex flex-col">
                {/* Breadcrumbs & Heading Area */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 text-sm font-medium mb-4 text-[#a5b6a0]">
                        <a
                            href="#"
                            className="hover:text-white transition-colors flex items-center gap-1"
                        >
                            <span className="material-symbols-outlined text-[16px]">
                                arrow_back
                            </span>
                            Quotes
                        </a>
                        <span>/</span>
                        <span className="text-primary">TSLA</span>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#2d372a] pb-6">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-2">
                                Notes{" "}
                                <span className="text-[#2d372a] dark:text-[#2d372a] font-light mx-2">
                                    |
                                </span>{" "}
                                <span className="text-primary">TSLA</span>
                            </h1>
                            <div className="flex items-center gap-4 text-[#a5b6a0]">
                                <span className="text-lg font-medium text-white">
                                    Tesla, Inc.
                                </span>
                                <span className="size-1 rounded-full bg-[#a5b6a0]"></span>
                                <span className="text-sm">Last updated: Oct 24, 2023</span>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#2d372a] hover:bg-[#3a4736] text-white text-sm font-bold transition-colors">
                                <span className="material-symbols-outlined text-[18px]">
                                    share
                                </span>
                                Share
                            </button>
                            <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary hover:bg-[#45b025] text-background-dark text-sm font-bold transition-colors shadow-[0_0_15px_rgba(83,210,45,0.3)]">
                                <span className="material-symbols-outlined text-[18px]">
                                    save
                                </span>
                                Save Note
                            </button>
                        </div>
                    </div>
                </div>

                {/* Split Pane Content */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
                    {/* LEFT COLUMN: Structured Analysis (4 cols) */}
                    <div className="lg:col-span-4 flex flex-col gap-8">
                        {/* Scenario Cards Stack */}
                        <section className="flex flex-col gap-4">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-[#a5b6a0] ml-1">
                                Price Scenarios
                            </h3>
                            {/* Bull Case */}
                            <div className="group relative overflow-hidden rounded-xl bg-surface-dark border border-[#2d372a] p-5 transition-all hover:border-primary/50 hover:bg-[#1f2e1b]">
                                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <span className="material-symbols-outlined text-6xl text-primary">
                                        trending_up
                                    </span>
                                </div>
                                <div className="flex justify-between items-start mb-2">
                                    <p className="text-primary text-sm font-bold uppercase tracking-wide">
                                        Bull Case
                                    </p>
                                    <span className="bg-primary/20 text-primary text-xs font-bold px-2 py-1 rounded-md">
                                        +40%
                                    </span>
                                </div>
                                <p className="text-white text-3xl font-black mb-1">$350.00</p>
                                <p className="text-[#a5b6a0] text-sm leading-relaxed">
                                    FSD adoption accelerates beyond projections. Energy storage
                                    margin expansion beats auto.
                                </p>
                            </div>
                            {/* Base Case */}
                            <div className="group relative overflow-hidden rounded-xl bg-surface-dark border border-[#2d372a] p-5 transition-all hover:border-white/30">
                                <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <span className="material-symbols-outlined text-6xl text-white">
                                        trending_flat
                                    </span>
                                </div>
                                <div className="flex justify-between items-start mb-2">
                                    <p className="text-white text-sm font-bold uppercase tracking-wide opacity-80">
                                        Base Case
                                    </p>
                                    <span className="bg-white/10 text-white text-xs font-bold px-2 py-1 rounded-md">
                                        0%
                                    </span>
                                </div>
                                <p className="text-white text-3xl font-black mb-1">$250.00</p>
                                <p className="text-[#a5b6a0] text-sm leading-relaxed">
                                    Deliveries meet consensus. Margins stabilize at 18%.
                                    Cybertruck ramp follows standard curve.
                                </p>
                            </div>
                            {/* Bear Case */}
                            <div className="group relative overflow-hidden rounded-xl bg-surface-dark border border-[#2d372a] p-5 transition-all hover:border-red-500/50 hover:bg-[#2e1b1b]">
                                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <span className="material-symbols-outlined text-6xl text-red-500">
                                        trending_down
                                    </span>
                                </div>
                                <div className="flex justify-between items-start mb-2">
                                    <p className="text-red-500 text-sm font-bold uppercase tracking-wide">
                                        Bear Case
                                    </p>
                                    <span className="bg-red-500/20 text-red-500 text-xs font-bold px-2 py-1 rounded-md">
                                        -40%
                                    </span>
                                </div>
                                <p className="text-white text-3xl font-black mb-1">$150.00</p>
                                <p className="text-[#a5b6a0] text-sm leading-relaxed">
                                    Competition erodes market share. Margins compress further due
                                    to price cuts. Regulatory hurdles.
                                </p>
                            </div>
                        </section>

                        {/* Catalysts & Risks */}
                        <section className="flex flex-col gap-6">
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-widest text-[#a5b6a0] ml-1 mb-3">
                                    Catalysts
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    <div className="flex h-8 items-center gap-2 rounded-full bg-primary/10 border border-primary/20 pl-2 pr-4 hover:bg-primary/20 cursor-pointer transition-colors">
                                        <span className="material-symbols-outlined text-primary text-[18px]">
                                            bolt
                                        </span>
                                        <span className="text-primary text-sm font-bold">
                                            CyberTruck
                                        </span>
                                    </div>
                                    <div className="flex h-8 items-center gap-2 rounded-full bg-primary/10 border border-primary/20 pl-2 pr-4 hover:bg-primary/20 cursor-pointer transition-colors">
                                        <span className="material-symbols-outlined text-primary text-[18px]">
                                            smart_toy
                                        </span>
                                        <span className="text-primary text-sm font-bold">
                                            AI Day
                                        </span>
                                    </div>
                                    <div className="flex h-8 items-center gap-2 rounded-full bg-primary/10 border border-primary/20 pl-2 pr-4 hover:bg-primary/20 cursor-pointer transition-colors">
                                        <span className="material-symbols-outlined text-primary text-[18px]">
                                            trending_down
                                        </span>
                                        <span className="text-primary text-sm font-bold">
                                            Rate Cuts
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-widest text-[#a5b6a0] ml-1 mb-3">
                                    Risks
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    <div className="flex h-8 items-center gap-2 rounded-full bg-orange-500/10 border border-orange-500/20 pl-2 pr-4 hover:bg-orange-500/20 cursor-pointer transition-colors">
                                        <span className="material-symbols-outlined text-orange-500 text-[18px]">
                                            warning
                                        </span>
                                        <span className="text-orange-500 text-sm font-bold">
                                            Competition
                                        </span>
                                    </div>
                                    <div className="flex h-8 items-center gap-2 rounded-full bg-orange-500/10 border border-orange-500/20 pl-2 pr-4 hover:bg-orange-500/20 cursor-pointer transition-colors">
                                        <span className="material-symbols-outlined text-orange-500 text-[18px]">
                                            person_alert
                                        </span>
                                        <span className="text-orange-500 text-sm font-bold">
                                            Key Man Risk
                                        </span>
                                    </div>
                                    <div className="flex h-8 items-center gap-2 rounded-full bg-orange-500/10 border border-orange-500/20 pl-2 pr-4 hover:bg-orange-500/20 cursor-pointer transition-colors">
                                        <span className="material-symbols-outlined text-orange-500 text-[18px]">
                                            gavel
                                        </span>
                                        <span className="text-orange-500 text-sm font-bold">
                                            Regulatory
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* RIGHT COLUMN: Rich Text Editor (8 cols) */}
                    <div className="lg:col-span-8 flex flex-col h-full min-h-[600px] rounded-xl bg-surface-dark border border-[#2d372a] shadow-2xl relative overflow-hidden">
                        {/* Editor Toolbar */}
                        <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 border-b border-[#2d372a] bg-[#1a2517] p-2 px-4">
                            <div className="flex items-center gap-1 border-r border-[#2d372a] pr-2 mr-1">
                                <select className="bg-transparent text-white text-sm font-medium border-none focus:ring-0 cursor-pointer hover:bg-[#2d372a] rounded px-2 py-1 focus:outline-none">
                                    <option>Normal Text</option>
                                    <option>Heading 1</option>
                                    <option>Heading 2</option>
                                    <option>Heading 3</option>
                                </select>
                            </div>
                            <button className="p-1.5 rounded hover:bg-[#2d372a] text-[#a5b6a0] hover:text-white transition-colors">
                                <span className="material-symbols-outlined text-[20px]">
                                    format_bold
                                </span>
                            </button>
                            <button className="p-1.5 rounded hover:bg-[#2d372a] text-[#a5b6a0] hover:text-white transition-colors">
                                <span className="material-symbols-outlined text-[20px]">
                                    format_italic
                                </span>
                            </button>
                            <button className="p-1.5 rounded hover:bg-[#2d372a] text-[#a5b6a0] hover:text-white transition-colors">
                                <span className="material-symbols-outlined text-[20px]">
                                    format_underlined
                                </span>
                            </button>
                            <button className="p-1.5 rounded hover:bg-[#2d372a] text-primary hover:text-primary transition-colors bg-primary/10">
                                <span className="material-symbols-outlined text-[20px]">
                                    format_list_bulleted
                                </span>
                            </button>
                            <button className="p-1.5 rounded hover:bg-[#2d372a] text-[#a5b6a0] hover:text-white transition-colors">
                                <span className="material-symbols-outlined text-[20px]">
                                    format_list_numbered
                                </span>
                            </button>
                            <div className="w-[1px] h-6 bg-[#2d372a] mx-1"></div>
                            <button className="p-1.5 rounded hover:bg-[#2d372a] text-[#a5b6a0] hover:text-white transition-colors">
                                <span className="material-symbols-outlined text-[20px]">
                                    link
                                </span>
                            </button>
                            <button className="p-1.5 rounded hover:bg-[#2d372a] text-[#a5b6a0] hover:text-white transition-colors">
                                <span className="material-symbols-outlined text-[20px]">
                                    image
                                </span>
                            </button>
                            <button className="p-1.5 rounded hover:bg-[#2d372a] text-[#a5b6a0] hover:text-white transition-colors">
                                <span className="material-symbols-outlined text-[20px]">
                                    code_blocks
                                </span>
                            </button>
                            <div className="ml-auto text-xs text-[#a5b6a0] font-mono">
                                Markdown supported
                            </div>
                        </div>

                        {/* Editor Surface */}
                        <div className="flex-1 p-8 md:p-10 overflow-y-auto">
                            <div
                                className="max-w-[75ch] mx-auto editor-content outline-none"
                                contentEditable
                                suppressContentEditableWarning
                            >
                                <h2 className="text-2xl font-bold text-white mb-4">
                                    Q3 Earnings Call Takeaways
                                </h2>
                                <p className="text-[#d1d5db] mb-6 leading-relaxed">
                                    Margins are tighter this quarter, hovering around{" "}
                                    <strong className="text-white">17.9%</strong> excluding
                                    regulatory credits. This was expected given the aggressive price
                                    cuts in China and Europe, but volume is the key metric to watch.
                                    Management emphasized that they are prioritizing fleet growth
                                    over short-term profitability, betting heavily on FSD software
                                    revenue down the line.
                                </p>
                                <div className="my-6 p-4 rounded-lg bg-[#2d372a]/30 border-l-4 border-primary">
                                    <p className="text-sm italic text-[#a5b6a0]">
                                        "We are the only car company that can sell cars at zero profit
                                        and make it up on software economics later." — Elon Musk
                                    </p>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3 mt-8">
                                    Energy Segment Performance
                                </h3>
                                <p className="text-[#d1d5db] mb-4 leading-relaxed">
                                    The energy storage segment is growing significantly faster than
                                    automotive right now. Megapack deployment reached{" "}
                                    <span className="bg-primary/20 text-primary px-1 rounded">
                                        4.0 GWh
                                    </span>
                                    , a record high. This is becoming a material contributor to the
                                    bottom line and could buffer auto margin compression.
                                </p>
                                <h3 className="text-xl font-bold text-white mb-3 mt-8">
                                    Key Action Items
                                </h3>
                                <ul className="list-none space-y-2 mb-8">
                                    <li className="flex items-start gap-3">
                                        <div className="mt-1 size-4 rounded border border-[#a5b6a0] flex items-center justify-center shrink-0"></div>
                                        <span className="text-[#d1d5db]">
                                            Review Model 3 Highland refresh reviews in China for
                                            initial demand signals.
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="mt-1 size-4 rounded bg-primary border border-primary flex items-center justify-center shrink-0 text-background-dark">
                                            <span className="material-symbols-outlined text-[12px] font-bold">
                                                check
                                            </span>
                                        </div>
                                        <span className="text-[#a5b6a0] line-through">
                                            Update DCF model with new margin guidance of 16-18% for
                                            FY24.
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="mt-1 size-4 rounded border border-[#a5b6a0] flex items-center justify-center shrink-0"></div>
                                        <span className="text-[#d1d5db]">
                                            Monitor weekly insurance registration data in China.
                                        </span>
                                    </li>
                                </ul>
                                <p className="text-[#d1d5db] mb-4 leading-relaxed">
                                    Technically, the stock is testing the 200 DMA. If it holds $210,
                                    we might see a run up to earnings next quarter. If it breaks,
                                    $180 is the next major support level.
                                </p>
                            </div>
                        </div>
                        {/* Gradient Overlay at bottom to indicate scroll/depth */}
                        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-surface-dark to-transparent pointer-events-none"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompanyResearchNotes;
