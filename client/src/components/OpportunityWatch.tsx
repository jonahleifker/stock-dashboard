import React from "react";

export interface OpportunityStock {
    ticker: string;
    name: string;
    sector: string;
    price: number;
    changePercent: number;
    isFeatured?: boolean;
}

export interface OpportunityWatchProps {
    stocks?: OpportunityStock[];
}

const OpportunityWatch: React.FC<OpportunityWatchProps> = ({ stocks }) => {
    // Default stocks if none provided
    const defaultStocks: OpportunityStock[] = [
        {
            ticker: "NVDA",
            name: "NVIDIA Corp.",
            sector: "Tech • Semiconductor",
            price: 450.22,
            changePercent: -2.1,
            isFeatured: true,
        },
        {
            ticker: "TSLA",
            name: "Tesla Inc.",
            sector: "Auto • EV",
            price: 235.4,
            changePercent: -1.8,
        },
        {
            ticker: "AMD",
            name: "AMD",
            sector: "Tech • Chips",
            price: 105.15,
            changePercent: 0.2,
        },
    ];

    const displayStocks = stocks || defaultStocks;

    return (
        <section className="px-5 mt-8 mb-4">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-bold tracking-tight">Opportunity Watch</h3>
                    <p className="text-xs text-gray-500">Retraced stocks with high upside potential</p>
                </div>
            </div>

            <div className="flex flex-col gap-3">
                {displayStocks.map((stock) => (
                    <div
                        key={stock.ticker}
                        className={`flex items-center justify-between p-3 rounded-xl bg-surface-dark hover:bg-surface-dark/80 transition-colors cursor-pointer ${stock.isFeatured
                            ? "border-l-4 border-primary"
                            : "border-l-4 border-gray-700 hover:border-primary"
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-lg bg-white/5 flex items-center justify-center text-white font-bold text-xs">
                                {stock.ticker}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-white">{stock.name}</span>
                                <span className="text-xs text-gray-500">{stock.sector}</span>
                            </div>
                        </div>

                        <div className="flex flex-col items-end">
                            <span className="text-sm font-bold text-white">${stock.price.toFixed(2)}</span>
                            <span
                                className={`text-xs font-medium flex items-center ${stock.changePercent >= 0 ? "text-growth" : "text-loss"
                                    }`}
                            >
                                <span className="material-symbols-outlined text-[12px] mr-0.5">
                                    {stock.changePercent >= 0 ? "trending_flat" : "trending_down"}
                                </span>
                                {stock.changePercent >= 0 ? "+" : ""}
                                {stock.changePercent.toFixed(1)}%{" "}
                                {stock.changePercent >= 0 ? "(Recovering)" : "(Dip)"}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default OpportunityWatch;
