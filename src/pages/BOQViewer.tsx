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
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#1a1a1a]/60 backdrop-blur-2xl backdrop-blur-xl border border-white/5 rounded-2xl p-5 shadow-sm">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/25 text-orange-400 text-[11px] font-bold uppercase tracking-wider mb-2">
                        <Calculator className="w-3.5 h-3.5" />
                        BOQ, R02 Work Map & Granular Cost Breakdown
                    </div>
                    <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight">
                        BOQ & <span className="text-orange-400">Tendering Engine</span>
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">
                        34 Standard Work Packages · 839 Sub-Items · Eng. Pierre's 11-Component Unit Rate Analyzer · Proportional Site Overheads · Contract Lock
                    </p>
                </div>

                <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/5 self-start lg:self-auto">
                    <button
                        type="button"
                        onClick={() => setActiveView('r02_pricing')}
                        className={clsx(
                            'px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all',
                            activeView === 'r02_pricing'
                                ? 'bg-orange-500 text-white shadow-md shadow-[#e04b2a]/25'
                                : 'text-slate-300 hover:text-white hover:bg-white/60'
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
                                ? 'bg-orange-500 text-white shadow-md'
                                : 'text-slate-300 hover:text-white hover:bg-white/60'
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
                <div className="w-full h-[calc(100vh-14rem)] relative rounded-2xl overflow-hidden border border-white/5 bg-[#1a1a1a]/60 backdrop-blur-2xl backdrop-blur-xl shadow-sm">
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/5 z-10">
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-10 h-10 border-4 border-orange-500/25 border-t-[#e04b2a] rounded-full animate-spin"></div>
                                <p className="text-slate-400 font-mono text-xs uppercase tracking-widest">Loading BOQ Sheet Viewer</p>
                            </div>
                        </div>
                    )}
                    <iframe
                        src="/boq-viewer.html"
                        title="BOQ Viewer"
                        className="w-full h-full border-0 absolute inset-0 bg-[#1a1a1a]"
                        onLoad={() => setIsLoading(false)}
                        allow="fullscreen"
                    />
                </div>
            )}
        </div>
    );
};
