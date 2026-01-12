import React from "react";
import Navbar from "../components/Navbar";

const TickerMatrix: React.FC = () => {
    return (
        <div className="bg-background-light dark:bg-background-dark text-[#131712] dark:text-white font-display min-h-screen flex flex-col overflow-x-hidden selection:bg-primary selection:text-black">
            <Navbar />

            <main className="flex-1 flex flex-col items-center py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-[1400px] w-full flex flex-col gap-6">
                    {/* Page Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-2 py-0.5 rounded text-xs font-bold bg-primary/20 text-primary uppercase tracking-wider">
                                    Analysis
                                </span>
                                <span className="text-[#a5b6a0] text-xs">Updated 15m ago</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                                Ticker Comparison
                            </h1>
                            <p className="text-[#a5b6a0] text-lg mt-2 font-medium max-w-2xl">
                                Side-by-side fundamentals matrix.{" "}
                                <span className="text-primary">Highlights active</span> for
                                best-in-class metrics.
                            </p>
                        </div>
                        {/* Action Toolbar */}
                        <div className="flex flex-wrap items-center gap-3 bg-surface-dark p-2 rounded-2xl border border-[#2d372a]">
                            {/* Highlights Toggle */}
                            <label className="flex items-center gap-3 cursor-pointer bg-surface-dark-lighter hover:bg-[#34442e] px-4 py-2 rounded-xl transition-all select-none border border-transparent has-[:checked]:border-primary/30 has-[:checked]:bg-primary/10">
                                <div className="relative inline-flex items-center">
                                    <input
                                        defaultChecked
                                        className="peer sr-only"
                                        type="checkbox"
                                    />
                                    <div className="w-9 h-5 bg-[#42513e] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                                </div>
                                <span className="text-sm font-bold text-white">Highlights</span>
                            </label>
                            <div className="w-px h-8 bg-[#42513e]"></div>
                            <button className="flex items-center justify-center size-10 rounded-xl bg-surface-dark-lighter text-white hover:bg-[#34442e] transition-colors border border-transparent hover:border-[#42513e]">
                                <span className="material-symbols-outlined">tune</span>
                            </button>
                            <button className="flex items-center justify-center size-10 rounded-xl bg-surface-dark-lighter text-white hover:bg-[#34442e] transition-colors border border-transparent hover:border-[#42513e]">
                                <span className="material-symbols-outlined">download</span>
                            </button>
                            <button className="bg-primary hover:bg-[#45b025] text-background-dark px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all">
                                <span className="material-symbols-outlined icon-fill text-[20px]">
                                    add
                                </span>
                                Add Ticker
                            </button>
                        </div>
                    </div>

                    {/* Comparison Table Container */}
                    <div className="w-full overflow-hidden rounded-3xl border border-[#2d372a] bg-surface-dark shadow-2xl relative">
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full min-w-[1000px] border-collapse">
                                {/* Table Head */}
                                <thead>
                                    <tr className="bg-[#1a2318] border-b border-[#2d372a]">
                                        {/* Metric Column Header */}
                                        <th className="sticky left-0 z-20 bg-[#1a2318] p-6 text-left border-r border-[#2d372a] w-[200px] shadow-[4px_0_12px_rgba(0,0,0,0.5)]">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[#a5b6a0] text-xs font-semibold uppercase tracking-wider">
                                                    Metric
                                                </span>
                                                <span className="text-white text-lg font-bold">
                                                    Key Data
                                                </span>
                                            </div>
                                        </th>
                                        {/* AAPL Header */}
                                        <th className="p-6 text-left min-w-[200px] group hover:bg-[#222d1f] transition-colors relative">
                                            <div className="flex flex-col gap-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-10 rounded-full bg-white flex items-center justify-center p-1 overflow-hidden shrink-0">
                                                        <img
                                                            className="w-full h-full object-contain"
                                                            alt="Apple Logo"
                                                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBRVHcxCbe4PPy0bbjGD9qGudOljpB5HjyUaXC1_QIEbwJDBylj7CYmIHL2zOs8K3nHZ537g5gXLl9BHIRtxFpZaja8JGb-Dy85_zkfLcsF1lSIeipGzUhpxHpGy8gve_Zzmkwj8229VDWYmN2Momqtv16Ck5hgZMZs3998wCixPyVenc31RxiyQCGvvTkhu86JeExIalFm0IzgDfOvQK-yngYEBLtMnxjndVCkCv8evz79aaIup8l-slxK2BEmsYIF0kChAK9mOQ"
                                                        />
                                                    </div>
                                                    <div>
                                                        <div className="text-white font-black text-xl leading-none">
                                                            AAPL
                                                        </div>
                                                        <div className="text-[#a5b6a0] text-xs font-medium mt-1">
                                                            Apple Inc.
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* Price & Sparkline */}
                                                <div className="flex items-end justify-between mt-2">
                                                    <div>
                                                        <div className="text-white font-bold text-2xl font-mono">
                                                            $175.43
                                                        </div>
                                                        <div className="text-primary text-sm font-bold flex items-center gap-0.5">
                                                            <span className="material-symbols-outlined text-[16px]">
                                                                trending_up
                                                            </span>
                                                            +1.2%
                                                        </div>
                                                    </div>
                                                    <svg
                                                        className="opacity-50 group-hover:opacity-100 transition-opacity"
                                                        fill="none"
                                                        height="30"
                                                        viewBox="0 0 60 30"
                                                        width="60"
                                                    >
                                                        <path
                                                            d="M1 25L10 20L20 22L30 10L40 15L50 5L59 2"
                                                            stroke="#53d22d"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                        ></path>
                                                    </svg>
                                                </div>
                                            </div>
                                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[#a5b6a0] hover:text-white">
                                                <span className="material-symbols-outlined">close</span>
                                            </div>
                                        </th>
                                        {/* MSFT Header */}
                                        <th className="p-6 text-left min-w-[200px] group hover:bg-[#222d1f] transition-colors relative border-l border-[#2d372a]/30">
                                            <div className="flex flex-col gap-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-10 rounded-full bg-white flex items-center justify-center p-2 overflow-hidden shrink-0">
                                                        <img
                                                            className="w-full h-full object-contain"
                                                            alt="Microsoft Logo"
                                                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDU2NprG7cNX6cWNxvDwjk93_doZyA2uy-emUlbLCeZ0n-QAxUJwQm-PXZV0ukkXP0EvlB-wAGS9Eu7-vaEIQPefxycYpueGSNEs8NTkPYIftV2j4QILdkIeOWomYfQ8c5MHpRCDQ2GXYRKzE-v53M_hIqUHF6jdQzpfIMtFpSnEtGzNz-pAK2wP_0kGWg3QK0OBzT331Jf93veHC3X9zMQMwDcJWCBYVnyMSph5oaXHY3ZtqsCQED5OoqeXoIJuZEuH4FZYgbDOw"
                                                        />
                                                    </div>
                                                    <div>
                                                        <div className="text-white font-black text-xl leading-none">
                                                            MSFT
                                                        </div>
                                                        <div className="text-[#a5b6a0] text-xs font-medium mt-1">
                                                            Microsoft
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-end justify-between mt-2">
                                                    <div>
                                                        <div className="text-white font-bold text-2xl font-mono">
                                                            $320.12
                                                        </div>
                                                        <div className="text-primary text-sm font-bold flex items-center gap-0.5">
                                                            <span className="material-symbols-outlined text-[16px]">
                                                                trending_up
                                                            </span>
                                                            +0.8%
                                                        </div>
                                                    </div>
                                                    <svg
                                                        className="opacity-50 group-hover:opacity-100 transition-opacity"
                                                        fill="none"
                                                        height="30"
                                                        viewBox="0 0 60 30"
                                                        width="60"
                                                    >
                                                        <path
                                                            d="M1 15L15 18L30 5L45 10L59 2"
                                                            stroke="#53d22d"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                        ></path>
                                                    </svg>
                                                </div>
                                            </div>
                                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[#a5b6a0] hover:text-white">
                                                <span className="material-symbols-outlined">close</span>
                                            </div>
                                        </th>
                                        {/* GOOGL Header */}
                                        <th className="p-6 text-left min-w-[200px] group hover:bg-[#222d1f] transition-colors relative border-l border-[#2d372a]/30">
                                            <div className="flex flex-col gap-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-10 rounded-full bg-white flex items-center justify-center p-2 overflow-hidden shrink-0">
                                                        <img
                                                            className="w-full h-full object-contain"
                                                            alt="Google Logo"
                                                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAjd7TpcOuakd-c4rRdtDrp6tKur1mHgNpWPxq51CYF2ao71YJEus3Ak9Oua3KdQHhHSliAsRIrHPLPkGH_2c21sTxEMfEfzpwFMAniPrWzRh2Sy7itQO-b6PqhwTlas9OVJMoZ8ksro8ATNPl4ownE-8gDfQV9F2_Qm7hlc3DRSyzOQW8Ldy3XpcsvVWy3waZhZ42WjHt0jzj4zpySrmIWJDURbAtkKionZejBf0bRF7Gye8RSK-k6xflf1rPL0zUcJUsQgIJTXA"
                                                        />
                                                    </div>
                                                    <div>
                                                        <div className="text-white font-black text-xl leading-none">
                                                            GOOGL
                                                        </div>
                                                        <div className="text-[#a5b6a0] text-xs font-medium mt-1">
                                                            Alphabet
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-end justify-between mt-2">
                                                    <div>
                                                        <div className="text-white font-bold text-2xl font-mono">
                                                            $135.60
                                                        </div>
                                                        <div className="text-red-500 text-sm font-bold flex items-center gap-0.5">
                                                            <span className="material-symbols-outlined text-[16px]">
                                                                trending_down
                                                            </span>
                                                            -0.4%
                                                        </div>
                                                    </div>
                                                    <svg
                                                        className="opacity-50 group-hover:opacity-100 transition-opacity"
                                                        fill="none"
                                                        height="30"
                                                        viewBox="0 0 60 30"
                                                        width="60"
                                                    >
                                                        <path
                                                            d="M1 5L15 8L30 25L45 20L59 28"
                                                            stroke="#ef4444"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                        ></path>
                                                    </svg>
                                                </div>
                                            </div>
                                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[#a5b6a0] hover:text-white">
                                                <span className="material-symbols-outlined">close</span>
                                            </div>
                                        </th>
                                        {/* AMZN Header */}
                                        <th className="p-6 text-left min-w-[200px] group hover:bg-[#222d1f] transition-colors relative border-l border-[#2d372a]/30">
                                            <div className="flex flex-col gap-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-10 rounded-full bg-white flex items-center justify-center p-2 overflow-hidden shrink-0">
                                                        <img
                                                            className="w-full h-full object-contain"
                                                            alt="Amazon Logo"
                                                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDsQaKXg9cbx3OAdyopk7agpZ50HHA7o1hI-eue79vPDYB8uqW1xmZq1743w799eNcCAtQ-U_iIigxL16b5OcCS21JTzp8B3ivEVcAhToeplskJtKpPb8AmBlQZffTiASjrH0EkwHV_QrvCqjUQSX952-ehySgmrTQZixdaOH6yh1na1VIYcuvw2RD6TzYxH6IWyqqPqfyemCho7OT5uTbANm9OLv_sxSf9--Ka-qeBFYedH67wQJG2jFGcUBmiDv9nSNQiMXmxvQ"
                                                        />
                                                    </div>
                                                    <div>
                                                        <div className="text-white font-black text-xl leading-none">
                                                            AMZN
                                                        </div>
                                                        <div className="text-[#a5b6a0] text-xs font-medium mt-1">
                                                            Amazon.com
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-end justify-between mt-2">
                                                    <div>
                                                        <div className="text-white font-bold text-2xl font-mono">
                                                            $140.20
                                                        </div>
                                                        <div className="text-primary text-sm font-bold flex items-center gap-0.5">
                                                            <span className="material-symbols-outlined text-[16px]">
                                                                trending_up
                                                            </span>
                                                            +2.1%
                                                        </div>
                                                    </div>
                                                    <svg
                                                        className="opacity-50 group-hover:opacity-100 transition-opacity"
                                                        fill="none"
                                                        height="30"
                                                        viewBox="0 0 60 30"
                                                        width="60"
                                                    >
                                                        <path
                                                            d="M1 20L15 25L30 15L45 10L59 2"
                                                            stroke="#53d22d"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                        ></path>
                                                    </svg>
                                                </div>
                                            </div>
                                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[#a5b6a0] hover:text-white">
                                                <span className="material-symbols-outlined">close</span>
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                {/* Table Body */}
                                <tbody className="text-white">
                                    {/* Market Cap Row */}
                                    <tr className="group border-b border-[#2d372a] hover:bg-[#1f2b1b]">
                                        <td className="sticky left-0 bg-surface-dark group-hover:bg-[#1f2b1b] p-6 font-semibold text-[#a5b6a0] border-r border-[#2d372a] shadow-[4px_0_12px_rgba(0,0,0,0.5)] z-10 transition-colors">
                                            <div className="flex items-center gap-2">
                                                Market Cap
                                                <span
                                                    className="material-symbols-outlined text-[16px] text-[#586355] cursor-help"
                                                    title="Total value of a company's shares of stock"
                                                >
                                                    info
                                                </span>
                                            </div>
                                        </td>
                                        {/* AAPL (Winner) */}
                                        <td className="p-6 font-mono text-lg bg-primary/10 relative">
                                            <div className="flex items-center justify-between">
                                                <span className="text-primary font-bold">2.7T</span>
                                                <div className="size-2 rounded-full bg-primary animate-pulse"></div>
                                            </div>
                                        </td>
                                        <td className="p-6 font-mono text-lg text-[#d1dcd0] border-l border-[#2d372a]/30">
                                            2.4T
                                        </td>
                                        <td className="p-6 font-mono text-lg text-[#d1dcd0] border-l border-[#2d372a]/30">
                                            1.7T
                                        </td>
                                        <td className="p-6 font-mono text-lg text-[#d1dcd0] border-l border-[#2d372a]/30">
                                            1.4T
                                        </td>
                                    </tr>
                                    {/* P/E Ratio Row */}
                                    <tr className="group border-b border-[#2d372a] hover:bg-[#1f2b1b]">
                                        <td className="sticky left-0 bg-surface-dark group-hover:bg-[#1f2b1b] p-6 font-semibold text-[#a5b6a0] border-r border-[#2d372a] shadow-[4px_0_12px_rgba(0,0,0,0.5)] z-10 transition-colors">
                                            <div className="flex items-center gap-2">
                                                P/E Ratio
                                                <span
                                                    className="material-symbols-outlined text-[16px] text-[#586355]"
                                                    title="Price-to-Earnings Ratio"
                                                >
                                                    info
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-6 font-mono text-lg text-[#d1dcd0]">
                                            28.5
                                        </td>
                                        <td className="p-6 font-mono text-lg text-[#d1dcd0] border-l border-[#2d372a]/30">
                                            35.2
                                        </td>
                                        {/* GOOGL (Winner - Lower is better usually) */}
                                        <td className="p-6 font-mono text-lg bg-primary/10 relative border-l border-[#2d372a]/30">
                                            <div className="flex items-center justify-between">
                                                <span className="text-primary font-bold">25.1</span>
                                                <div className="size-2 rounded-full bg-primary animate-pulse"></div>
                                            </div>
                                        </td>
                                        <td className="p-6 font-mono text-lg text-[#d1dcd0] border-l border-[#2d372a]/30">
                                            60.4
                                        </td>
                                    </tr>
                                    {/* Revenue Growth Row */}
                                    <tr className="group border-b border-[#2d372a] hover:bg-[#1f2b1b]">
                                        <td className="sticky left-0 bg-surface-dark group-hover:bg-[#1f2b1b] p-6 font-semibold text-[#a5b6a0] border-r border-[#2d372a] shadow-[4px_0_12px_rgba(0,0,0,0.5)] z-10 transition-colors">
                                            <div className="flex items-center gap-2">
                                                Rev. Growth{" "}
                                                <span className="text-xs font-normal opacity-50">
                                                    (YoY)
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-6 font-mono text-lg text-[#d1dcd0]">
                                            +2.1%
                                        </td>
                                        <td className="p-6 font-mono text-lg text-[#d1dcd0] border-l border-[#2d372a]/30">
                                            +7.8%
                                        </td>
                                        <td className="p-6 font-mono text-lg text-[#d1dcd0] border-l border-[#2d372a]/30">
                                            +5.4%
                                        </td>
                                        {/* AMZN (Winner) */}
                                        <td className="p-6 font-mono text-lg bg-primary/10 relative border-l border-[#2d372a]/30">
                                            <div className="flex items-center justify-between">
                                                <span className="text-primary font-bold">+10.2%</span>
                                                <div className="size-2 rounded-full bg-primary animate-pulse"></div>
                                            </div>
                                        </td>
                                    </tr>
                                    {/* ROE Row */}
                                    <tr className="group border-b border-[#2d372a] hover:bg-[#1f2b1b]">
                                        <td className="sticky left-0 bg-surface-dark group-hover:bg-[#1f2b1b] p-6 font-semibold text-[#a5b6a0] border-r border-[#2d372a] shadow-[4px_0_12px_rgba(0,0,0,0.5)] z-10 transition-colors">
                                            <div className="flex items-center gap-2">
                                                ROE
                                                <span
                                                    className="material-symbols-outlined text-[16px] text-[#586355]"
                                                    title="Return on Equity"
                                                >
                                                    info
                                                </span>
                                            </div>
                                        </td>
                                        {/* AAPL (Winner) */}
                                        <td className="p-6 font-mono text-lg bg-primary/10 relative">
                                            <div className="flex items-center justify-between">
                                                <span className="text-primary font-bold">145%</span>
                                                <div className="size-2 rounded-full bg-primary animate-pulse"></div>
                                            </div>
                                        </td>
                                        <td className="p-6 font-mono text-lg text-[#d1dcd0] border-l border-[#2d372a]/30">
                                            40%
                                        </td>
                                        <td className="p-6 font-mono text-lg text-[#d1dcd0] border-l border-[#2d372a]/30">
                                            25%
                                        </td>
                                        <td className="p-6 font-mono text-lg text-[#d1dcd0] border-l border-[#2d372a]/30">
                                            15%
                                        </td>
                                    </tr>
                                    {/* Debt/Equity Row */}
                                    <tr className="group border-b border-[#2d372a] hover:bg-[#1f2b1b]">
                                        <td className="sticky left-0 bg-surface-dark group-hover:bg-[#1f2b1b] p-6 font-semibold text-[#a5b6a0] border-r border-[#2d372a] shadow-[4px_0_12px_rgba(0,0,0,0.5)] z-10 transition-colors">
                                            <div className="flex items-center gap-2">
                                                Debt/Equity
                                            </div>
                                        </td>
                                        <td className="p-6 font-mono text-lg text-[#d1dcd0]">
                                            1.8
                                        </td>
                                        <td className="p-6 font-mono text-lg text-[#d1dcd0] border-l border-[#2d372a]/30">
                                            0.4
                                        </td>
                                        {/* GOOGL (Winner - Lower is better) */}
                                        <td className="p-6 font-mono text-lg bg-primary/10 relative border-l border-[#2d372a]/30">
                                            <div className="flex items-center justify-between">
                                                <span className="text-primary font-bold">0.05</span>
                                                <div className="size-2 rounded-full bg-primary animate-pulse"></div>
                                            </div>
                                        </td>
                                        <td className="p-6 font-mono text-lg text-[#d1dcd0] border-l border-[#2d372a]/30">
                                            0.6
                                        </td>
                                    </tr>
                                    {/* EPS (TTM) Row */}
                                    <tr className="group border-b border-transparent hover:bg-[#1f2b1b]">
                                        <td className="sticky left-0 bg-surface-dark group-hover:bg-[#1f2b1b] p-6 font-semibold text-[#a5b6a0] border-r border-[#2d372a] shadow-[4px_0_12px_rgba(0,0,0,0.5)] z-10 transition-colors rounded-bl-3xl">
                                            <div className="flex items-center gap-2">EPS (TTM)</div>
                                        </td>
                                        <td className="p-6 font-mono text-lg text-[#d1dcd0]">
                                            $6.13
                                        </td>
                                        {/* MSFT (Winner) */}
                                        <td className="p-6 font-mono text-lg bg-primary/10 relative border-l border-[#2d372a]/30">
                                            <div className="flex items-center justify-between">
                                                <span className="text-primary font-bold">$9.68</span>
                                                <div className="size-2 rounded-full bg-primary animate-pulse"></div>
                                            </div>
                                        </td>
                                        <td className="p-6 font-mono text-lg text-[#d1dcd0] border-l border-[#2d372a]/30">
                                            $5.80
                                        </td>
                                        <td className="p-6 font-mono text-lg text-[#d1dcd0] border-l border-[#2d372a]/30">
                                            $2.90
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        {/* Floating Action Bar */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-[#131712]/90 backdrop-blur-md px-4 py-2 rounded-full border border-[#2d372a] shadow-xl opacity-0 hover:opacity-100 transition-opacity">
                            <button className="text-xs font-bold text-[#a5b6a0] hover:text-white px-2 py-1 uppercase tracking-wide">
                                Export CSV
                            </button>
                            <div className="w-px h-3 bg-[#2d372a]"></div>
                            <button className="text-xs font-bold text-[#a5b6a0] hover:text-white px-2 py-1 uppercase tracking-wide">
                                Share View
                            </button>
                        </div>
                    </div>

                    {/* Cards below table */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                        <div className="bg-surface-dark rounded-3xl p-6 border border-[#2d372a] flex items-start gap-4 hover:border-primary/50 transition-colors cursor-pointer group">
                            <div className="bg-primary/10 p-3 rounded-full text-primary group-hover:bg-primary group-hover:text-black transition-colors">
                                <span className="material-symbols-outlined icon-fill">
                                    lightbulb
                                </span>
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-lg">
                                    Analyst Consensus
                                </h3>
                                <p className="text-[#a5b6a0] mt-1 leading-relaxed">
                                    GOOGL shows the strongest buy signal among the selected group
                                    based on current P/E valuations relative to sector growth.
                                </p>
                            </div>
                        </div>
                        <div className="bg-surface-dark rounded-3xl p-6 border border-[#2d372a] flex items-start gap-4 hover:border-primary/50 transition-colors cursor-pointer group">
                            <div className="bg-primary/10 p-3 rounded-full text-primary group-hover:bg-primary group-hover:text-black transition-colors">
                                <span className="material-symbols-outlined icon-fill">
                                    notifications_active
                                </span>
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-lg">
                                    Upcoming Earnings
                                </h3>
                                <p className="text-[#a5b6a0] mt-1 leading-relaxed">
                                    MSFT is reporting in 3 days. Volatility expected to increase
                                    +/- 5% based on implied volatility metrics.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TickerMatrix;
