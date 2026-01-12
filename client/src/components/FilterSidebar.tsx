import React from "react";

interface FilterSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({ isOpen, onClose }) => {
    return (
        <>
            {/* Overlay */}
            <div
                className={`fixed inset-0 bg-[#0a0f09]/70 backdrop-blur-[3px] z-40 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                onClick={onClose}
            ></div>

            {/* Sidebar */}
            <aside
                className={`fixed right-0 top-0 h-full w-full max-w-[420px] bg-[#152012] border-l border-[#2d372a] shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-[#2d372a] bg-[#152012]">
                    <div>
                        <h3 className="text-white text-xl font-bold">Filter Quotes</h3>
                        <p className="text-xs text-[#a5b6a0] mt-0.5">
                            Refine your market view
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="text-xs font-medium text-[#a5b6a0] hover:text-primary transition-colors underline decoration-dotted underline-offset-4">
                            Reset All
                        </button>
                        <button
                            onClick={onClose}
                            className="size-8 rounded-full bg-[#2d372a] hover:bg-[#384435] text-white flex items-center justify-center transition-colors"
                        >
                            <span className="material-symbols-outlined text-[20px]">
                                close
                            </span>
                        </button>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* Sector Filter */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-[18px]">
                                pie_chart
                            </span>{" "}
                            Sector
                        </label>
                        <div className="flex flex-wrap gap-2">
                            <button className="px-3 py-1.5 rounded-full bg-primary text-black text-sm font-bold flex items-center gap-1.5">
                                Technology{" "}
                                <span className="material-symbols-outlined text-[14px]">
                                    close
                                </span>
                            </button>
                            <button className="px-3 py-1.5 rounded-full bg-primary text-black text-sm font-bold flex items-center gap-1.5">
                                Finance{" "}
                                <span className="material-symbols-outlined text-[14px]">
                                    close
                                </span>
                            </button>
                            {["Healthcare", "Energy", "Consumer", "Industrial"].map(
                                (sector) => (
                                    <button
                                        key={sector}
                                        className="px-3 py-1.5 rounded-full bg-[#2d372a] hover:bg-[#384435] text-[#a5b6a0] hover:text-white text-sm font-medium transition-colors border border-transparent hover:border-[#42513e]"
                                    >
                                        {sector}
                                    </button>
                                )
                            )}
                        </div>
                    </div>

                    {/* Market Cap Filter */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-[18px]">
                                bar_chart
                            </span>{" "}
                            Market Cap
                        </label>
                        <div className="flex bg-[#2d372a] p-1 rounded-xl">
                            <button className="flex-1 py-2 rounded-lg text-sm font-medium text-[#a5b6a0] hover:text-white transition-colors">
                                Small
                            </button>
                            <button className="flex-1 py-2 rounded-lg text-sm font-medium text-[#a5b6a0] hover:text-white transition-colors">
                                Mid
                            </button>
                            <button className="flex-1 py-2 rounded-lg bg-primary text-black text-sm font-bold shadow-sm">
                                Large
                            </button>
                        </div>
                        <p className="text-xs text-[#a5b6a0] pl-1">
                            Showing companies &gt; $100B
                        </p>
                    </div>

                    {/* Valuation Filter */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-[18px]">
                                price_check
                            </span>{" "}
                            Valuation
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            <button className="group flex flex-col items-center justify-center gap-1 p-3 rounded-2xl bg-[#232b22] border-2 border-primary/50 hover:bg-[#2d372a] transition-all">
                                <span className="size-2 rounded-full bg-primary"></span>
                                <span className="text-xs font-bold text-white">
                                    Undervalued
                                </span>
                            </button>
                            <button className="group flex flex-col items-center justify-center gap-1 p-3 rounded-2xl bg-[#1e251d] border border-[#2d372a] hover:border-[#42513e] transition-all">
                                <span className="size-2 rounded-full bg-gray-500"></span>
                                <span className="text-xs font-medium text-[#a5b6a0]">
                                    Fair Value
                                </span>
                            </button>
                            <button className="group flex flex-col items-center justify-center gap-1 p-3 rounded-2xl bg-[#1e251d] border border-[#2d372a] hover:border-[#42513e] transition-all">
                                <span className="size-2 rounded-full bg-accent-red"></span>
                                <span className="text-xs font-medium text-[#a5b6a0]">
                                    Overvalued
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Performance Range Slider */}
                    <div className="space-y-4 pt-2">
                        <div className="flex justify-between items-end">
                            <label className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-[18px]">
                                    trending_up
                                </span>{" "}
                                Performance
                            </label>
                            <span className="text-primary font-mono font-bold text-sm bg-primary/10 px-2 py-1 rounded-md">
                                +5.2% to +24%
                            </span>
                        </div>
                        <div className="relative h-10 flex items-center">
                            {/* Visual Track Background */}
                            <div className="absolute w-full h-1 bg-[#2d372a] rounded-full"></div>
                            {/* Active Track Section (Simulated) */}
                            <div className="absolute left-[20%] right-[20%] h-1 bg-primary rounded-full"></div>
                            {/* Left Thumb (Simulated) */}
                            <div className="absolute left-[20%] size-5 bg-white rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)] cursor-pointer flex items-center justify-center transform -translate-x-1/2 hover:scale-110 transition-transform">
                                <div className="size-1.5 bg-primary rounded-full"></div>
                            </div>
                            {/* Right Thumb (Simulated) */}
                            <div className="absolute right-[20%] size-5 bg-white rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)] cursor-pointer flex items-center justify-center transform translate-x-1/2 hover:scale-110 transition-transform">
                                <div className="size-1.5 bg-primary rounded-full"></div>
                            </div>
                        </div>
                        <div className="flex justify-between text-xs text-[#a5b6a0] font-mono">
                            <span>-50%</span>
                            <span>0%</span>
                            <span>+50%</span>
                        </div>
                    </div>

                    {/* Additional Quick Toggles */}
                    <div className="space-y-3 pt-2 border-t border-[#2d372a]">
                        {[
                            { label: "Show Fundamentals", checked: true },
                            { label: "Include OTC Markets", checked: false },
                        ].map((toggle, idx) => (
                            <div key={idx} className="flex items-center justify-between py-2">
                                <span className="text-sm text-white font-medium">
                                    {toggle.label}
                                </span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        value=""
                                        className="sr-only peer"
                                        defaultChecked={toggle.checked}
                                    />
                                    <div className="w-11 h-6 bg-[#2d372a] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-[#2d372a] bg-[#1a2119]">
                    <button className="w-full flex items-center justify-center gap-2 h-12 bg-primary hover:bg-[#46b325] text-black text-base font-bold rounded-full transition-all shadow-[0_0_20px_rgba(83,210,45,0.2)] hover:shadow-[0_0_25px_rgba(83,210,45,0.4)]">
                        Show 24 Results
                        <span className="material-symbols-outlined text-[20px]">
                            arrow_forward
                        </span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default FilterSidebar;
