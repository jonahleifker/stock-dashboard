import React, { useState } from "react";

interface CollapsibleSectionProps {
    title: string;
    icon: string;
    previewMetrics?: { label: string; value: string; highlight?: boolean }[];
    children: React.ReactNode;
    defaultOpen?: boolean;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
    title,
    icon,
    previewMetrics = [],
    children,
    defaultOpen = false,
}) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="rounded-2xl bg-[#1e2b1a] p-1 transition-all">
            {/* Collapsed Header */}
            <div
                className="flex items-center justify-between rounded-xl px-5 py-4 cursor-pointer group hover:bg-[#263520] transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-4">
                    <div className="flex size-10 items-center justify-center rounded-full bg-[#2d372a] text-[#a5b6a0] group-hover:text-primary transition-colors">
                        <span className="material-symbols-outlined">{icon}</span>
                    </div>
                    <span className="text-base font-bold text-white">{title}</span>
                </div>

                {!isOpen && previewMetrics.length > 0 && (
                    <div className="hidden md:flex items-center gap-6">
                        {previewMetrics.map((metric, index) => (
                            <React.Fragment key={index}>
                                {index > 0 && <div className="h-6 w-px bg-[#2d372a]"></div>}
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] font-bold uppercase text-[#a5b6a0]">
                                        {metric.label}
                                    </span>
                                    <span
                                        className={`font-mono text-sm font-bold ${metric.highlight ? "text-primary" : "text-white"
                                            }`}
                                    >
                                        {metric.value}
                                    </span>
                                </div>
                            </React.Fragment>
                        ))}
                    </div>
                )}

                <div className="flex items-center gap-3">
                    {!isOpen && (
                        <span className="hidden text-xs font-semibold text-[#a5b6a0] sm:block group-hover:text-white transition-colors">
                            View Details
                        </span>
                    )}
                    <span
                        className={`material-symbols-outlined text-[#a5b6a0] transition-all group-hover:text-white ${isOpen ? "rotate-90" : ""
                            }`}
                    >
                        chevron_right
                    </span>
                </div>
            </div>

            {/* Expanded Content */}
            {isOpen && (
                <div className="px-5 pb-5 pt-2">
                    <div className="rounded-xl bg-[#152012] p-6">{children}</div>
                </div>
            )}
        </div>
    );
};

export default CollapsibleSection;
