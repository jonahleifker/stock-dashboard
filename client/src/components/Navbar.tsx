import React from "react";

const Navbar: React.FC = () => {
    return (
        <div className="w-full bg-[#131712] border-b border-[#2d372a]">
            <div className="px-6 lg:px-10 py-4 flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-3 text-white">
                        <div className="size-8 flex items-center justify-center bg-primary/20 rounded-lg text-primary">
                            <span className="material-symbols-outlined">candlestick_chart</span>
                        </div>
                        <h2 className="text-white text-xl font-bold tracking-tight">
                            Stock Quote Sheet
                        </h2>
                    </div>
                    {/* Search Bar */}
                    <div className="hidden md:flex items-center bg-[#2d372a] rounded-xl h-10 w-80 px-4 group focus-within:ring-1 ring-primary/50 transition-all">
                        <span className="material-symbols-outlined text-[#a5b6a0] text-[20px]">
                            search
                        </span>
                        <input
                            className="bg-transparent border-none text-white placeholder-[#a5b6a0] text-sm w-full focus:ring-0 focus:outline-none ml-2"
                            placeholder="Search tickers, companies..."
                            type="text"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <button className="relative text-[#a5b6a0] hover:text-white transition-colors">
                        <span className="material-symbols-outlined">notifications</span>
                        <span className="absolute top-0 right-0 size-2 bg-accent-red rounded-full border-2 border-[#131712]"></span>
                    </button>
                    <div
                        className="bg-center bg-no-repeat bg-cover rounded-full size-10 border-2 border-[#2d372a]"
                        style={{
                            backgroundImage:
                                'url("https://lh3.googleusercontent.com/aida-public/AB6AXuB6NjdPzyMl1UkwO2a4kWQQc3KpcVci9Mkk782SRrF0TODZMGHCn-6V423km0SbNW1LV2-1AUy3SVVtUEuXOnCq_I4CS4xvl_FlmsvLBLSN3lYVpKOgfN1ZH6O1URpsP1zj5ShTddnFVdeWyFMmhFbqlJUl2HX2kDi4Xeff7XgS1ZcVWDQUzHXbTqBiE5uz8yR3ob7WgMdh62Rth9oLvDpgFAD_7OKcK4hsxjeLZtROEwwKFfN8Evzy0grviIoWi7HvB5wCNvmhFQ")',
                        }}
                    ></div>
                </div>
            </div>
        </div>
    );
};

export default Navbar;
