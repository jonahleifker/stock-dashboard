import React from "react";

export interface StockData {
    ticker: string;
    name: string;
    price: number;
    changePercent: number;
    marketCap: string;
    peRatio: number;
    volume: string;
}

interface StockTableProps {
    stocks: StockData[];
}

const StockTable: React.FC<StockTableProps> = ({ stocks }) => {
    return (
        <div className="rounded-2xl border border-[#2d372a] bg-[#1a2119] overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[#232b22] border-b border-[#2d372a]">
                            <th className="p-4 text-xs font-semibold text-[#a5b6a0] uppercase tracking-wider w-[120px]">
                                Ticker
                            </th>
                            <th className="p-4 text-xs font-semibold text-[#a5b6a0] uppercase tracking-wider">
                                Price
                            </th>
                            <th className="p-4 text-xs font-semibold text-[#a5b6a0] uppercase tracking-wider">
                                Performance
                            </th>
                            <th className="p-4 text-xs font-semibold text-[#a5b6a0] uppercase tracking-wider">
                                Market Cap
                            </th>
                            <th className="p-4 text-xs font-semibold text-[#a5b6a0] uppercase tracking-wider">
                                P/E Ratio
                            </th>
                            <th className="p-4 text-xs font-semibold text-[#a5b6a0] uppercase tracking-wider text-right">
                                Volume
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2d372a]">
                        {stocks.map((stock) => (
                            <tr
                                key={stock.ticker}
                                className="group hover:bg-[#232b22] transition-colors"
                            >
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="size-8 rounded bg-white/10 flex items-center justify-center text-xs font-bold text-white">
                                            {stock.ticker[0]}
                                        </div>
                                        <div>
                                            <div className="font-bold text-white">{stock.ticker}</div>
                                            <div className="text-xs text-[#a5b6a0]">{stock.name}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 font-mono text-white">
                                    ${stock.price.toFixed(2)}
                                </td>
                                <td className="p-4">
                                    <span
                                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${stock.changePercent >= 0
                                                ? "bg-primary/20 text-primary"
                                                : "bg-accent-red/20 text-accent-red"
                                            }`}
                                    >
                                        <span className="material-symbols-outlined text-[14px]">
                                            {stock.changePercent >= 0 ? "arrow_upward" : "arrow_downward"}
                                        </span>{" "}
                                        {Math.abs(stock.changePercent)}%
                                    </span>
                                </td>
                                <td className="p-4 text-[#a5b6a0]">{stock.marketCap}</td>
                                <td className="p-4 text-[#a5b6a0]">{stock.peRatio}</td>
                                <td className="p-4 text-right text-white font-mono">
                                    {stock.volume}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StockTable;
