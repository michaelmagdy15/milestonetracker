import React, { useState } from 'react';
import { Calculator, FileSpreadsheet, Layers } from 'lucide-react';
import clsx from 'clsx';
import { PricingEngineHub } from '../components/nexus/PricingEngineHub';

export const BOQViewer: React.FC = () => {
    const [activeView, setActiveView] = useState<'r02_pricing' | 'spreadsheet_viewer'>('r02_pricing');
    const [isLoading, setIsLoading] = useState(true);

    return (
        <div className="space-y-6 pb-12">
            {/* Unified Header & View Switcher */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white/80 backdrop-blur-xl border border-[#192631]/10 rounded-2xl p-5 shadow-sm">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e04b2a]/10 border border-[#e04b2a]/25 text-[#e04b2a] text-[11px] font-bold uppercase tracking-wider mb-2">
                        <Calculator className="w-3.5 h-3.5" />
                        BOQ, R02 Work Map & Granular Cost Breakdown
                    </div>
                    <h1 className="text-2xl lg:text-3xl font-black text-[#192631] tracking-tight">
                        BOQ & <span className="text-[#e04b2a]">Tendering Engine</span>
                    </h1>
                    <p className="text-xs text-[#192631]/70 mt-1">
                        34 Standard Work Packages · 839 Sub-Items · Eng. Pierre's 11-Component Unit Rate Analyzer · Proportional Site Overheads · Contract Lock
                    </p>
                </div>

                <div className="flex items-center gap-2 bg-[#192631]/[0.05] p-1.5 rounded-2xl border border-[#192631]/10 self-start lg:self-auto">
                    <button
                        type="button"
                        onClick={() => setActiveView('r02_pricing')}
                        className={clsx(
                            'px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all',
                            activeView === 'r02_pricing'
                                ? 'bg-[#e04b2a] text-white shadow-md shadow-[#e04b2a]/25'
                                : 'text-[#192631]/75 hover:text-[#192631] hover:bg-white/60'
                        )}
                    >
                        <Layers className="w-4 h-4" />
                        R02 Pricing & Unit Rate Breakdown (839 Items)
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveView('spreadsheet_viewer')}
                        className={clsx(
                            'px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all',
                            activeView === 'spreadsheet_viewer'
                                ? 'bg-[#192631] text-white shadow-md'
                                : 'text-[#192631]/75 hover:text-[#192631] hover:bg-white/60'
                        )}
                    >
                        <FileSpreadsheet className="w-4 h-4" />
                        Interactive BOQ Sheet Viewer
                    </button>
                </div>
            </div>

            {activeView === 'r02_pricing' ? (
                <PricingEngineHub />
            ) : (
                <div className="w-full h-[calc(100vh-14rem)] relative rounded-2xl overflow-hidden border border-[#192631]/10 bg-white/80 backdrop-blur-xl shadow-sm">
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-[#f5f5f5] z-10">
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-10 h-10 border-4 border-[#e04b2a]/25 border-t-[#e04b2a] rounded-full animate-spin"></div>
                                <p className="text-[#192631]/70 font-mono text-xs uppercase tracking-widest">Loading BOQ Sheet Viewer</p>
                            </div>
                        </div>
                    )}
                    <iframe
                        src="/boq-viewer.html"
                        title="BOQ Viewer"
                        className="w-full h-full border-0 absolute inset-0 bg-white"
                        onLoad={() => setIsLoading(false)}
                        allow="fullscreen"
                    />
                </div>
            )}
        </div>
    );
};
