import React, { useState } from 'react';
import {
    Sliders,
    TrendingDown,
    ShieldAlert,
    HardHat,
    Lock,
    Unlock,
    CheckCircle2,
    Clock,
    Flame,
    RefreshCw,
    Layers
} from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';

interface BoqExposurePackage {
    packageNumber: string;
    packageName: string;
    baselineBudgetEgp: number;
    steelWeightTons: number;
    cementVolumeM3: number;
    importComponentRatio: number; // 0.0 - 1.0 (USD exposure)
}

const SAMPLE_BOQ_PACKAGES: BoqExposurePackage[] = [
    { packageNumber: 'PKG-02', packageName: 'Reinforced Concrete & Foundation Works', baselineBudgetEgp: 28500000, steelWeightTons: 420, cementVolumeM3: 3100, importComponentRatio: 0.15 },
    { packageNumber: 'PKG-04', packageName: 'Structural Steel Trusses & Skybridge', baselineBudgetEgp: 14200000, steelWeightTons: 280, cementVolumeM3: 0, importComponentRatio: 0.45 },
    { packageNumber: 'PKG-07', packageName: 'Aluminum & Double Glazed Curtain Wall', baselineBudgetEgp: 22000000, steelWeightTons: 35, cementVolumeM3: 0, importComponentRatio: 0.70 },
    { packageNumber: 'PKG-11', packageName: 'HVAC Chillers & Duct Distribution', baselineBudgetEgp: 18500000, steelWeightTons: 15, cementVolumeM3: 0, importComponentRatio: 0.85 },
    { packageNumber: 'PKG-14', packageName: 'Electrical Switchgears & Transformers', baselineBudgetEgp: 16800000, steelWeightTons: 0, cementVolumeM3: 0, importComponentRatio: 0.90 },
];

interface PtwRecord {
    id: string;
    permitType: 'Hot Work (Welding/Cutting)' | 'Confined Space Entry' | 'Deep Trench Excavation' | 'Working at Heights (>2m)';
    location: string;
    subcontractor: string;
    riskLevel: 'High' | 'Critical';
    gasTestPpm?: number;
    ppeVerified: boolean;
    hseOfficerSign: boolean;
    residentEngSign: boolean;
    validUntil: string;
    status: 'Active (Permitted)' | 'Pending Sign-Off' | 'Expired';
}

const SAMPLE_PTW_LIST: PtwRecord[] = [
    { id: 'PTW-2026-081', permitType: 'Hot Work (Welding/Cutting)', location: 'Tower B Skybridge Truss Joint 4', subcontractor: 'Nile Steel Fabrication', riskLevel: 'Critical', ppeVerified: true, hseOfficerSign: true, residentEngSign: true, validUntil: 'Today 18:00', status: 'Active (Permitted)' },
    { id: 'PTW-2026-082', permitType: 'Deep Trench Excavation', location: 'Stormwater Detention Tank (Grid F)', subcontractor: 'Delta Earthworks', riskLevel: 'High', gasTestPpm: 0, ppeVerified: true, hseOfficerSign: true, residentEngSign: false, validUntil: 'Pending Approval', status: 'Pending Sign-Off' },
    { id: 'PTW-2026-083', permitType: 'Working at Heights (>2m)', location: 'Atrium Glass Dome Perimeter', subcontractor: 'Skyline Facade Tech', riskLevel: 'High', ppeVerified: true, hseOfficerSign: true, residentEngSign: true, validUntil: 'Today 17:00', status: 'Active (Permitted)' },
];

interface RetentionRecord {
    id: string;
    subcontractor: string;
    trade: string;
    totalContractEgp: number;
    retentionRatePercent: number; // 5% or 10%
    retentionAmountEgp: number;
    dlpExpiryDate: string; // Defects Liability Period (365 days after TOC)
    bankGuaranteeExpiry: string;
    status: 'Held in Escrow' | 'DLP Maturing Soon' | 'Eligible for Release';
}

const SAMPLE_RETENTION_VAULT: RetentionRecord[] = [
    { id: 'RET-01', subcontractor: 'Al-Ain ReadyMix & Foundation Co.', trade: 'Substructure & Piling', totalContractEgp: 32000000, retentionRatePercent: 10, retentionAmountEgp: 3200000, dlpExpiryDate: '2027-01-15', bankGuaranteeExpiry: '2027-02-15', status: 'Held in Escrow' },
    { id: 'RET-02', subcontractor: 'Nile Fine Woodworks LLC', trade: 'Architectural Joinery', totalContractEgp: 12500000, retentionRatePercent: 5, retentionAmountEgp: 625000, dlpExpiryDate: '2026-12-01', bankGuaranteeExpiry: '2026-12-30', status: 'DLP Maturing Soon' },
    { id: 'RET-03', subcontractor: 'Delta Earthworks & Shoring', trade: 'Excavation & Dewatering', totalContractEgp: 8500000, retentionRatePercent: 10, retentionAmountEgp: 850000, dlpExpiryDate: '2026-10-15', bankGuaranteeExpiry: '2026-11-15', status: 'Eligible for Release' },
];

interface BimClash {
    id: string;
    clashTitle: string;
    location: string;
    disciplineA: string;
    disciplineB: string;
    criticality: 'High Priority' | 'Severe (Pour Blocker)' | 'Moderate';
    resolutionSlaHours: number;
    assignedEngineer: string;
    status: 'Open' | 'In Coordination' | 'Resolved';
}

const SAMPLE_CLASH_LOG: BimClash[] = [
    { id: 'CLS-001', clashTitle: '400mm Chilled Water Pipe penetrates PT Structural Beam B-12', location: 'Level 02 Zone B', disciplineA: 'MEP (HVAC)', disciplineB: 'Structural PT', criticality: 'Severe (Pour Blocker)', resolutionSlaHours: 18, assignedEngineer: 'Eng. Tarek Shawky & Eng. Mohamed Saber', status: 'In Coordination' },
    { id: 'CLS-002', clashTitle: 'Rainwater Leader Riser fouls Architectural Dressing Joinery', location: 'Penthouse Suite 1', disciplineA: 'Plumbing', disciplineB: 'Interior Design', criticality: 'High Priority', resolutionSlaHours: 32, assignedEngineer: 'Eng. Farida Karim', status: 'Open' },
    { id: 'CLS-003', clashTitle: 'Electrical Cable Tray intersects Smoke Exhaust Duct', location: 'Basement 01 Corridor C', disciplineA: 'Electrical', disciplineB: 'Fire & Life Safety', criticality: 'High Priority', resolutionSlaHours: 24, assignedEngineer: 'Eng. Pierre Nabil', status: 'Resolved' },
];

export const CommercialRiskAndHseHub: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'inflation' | 'ptw' | 'retention' | 'clash'>('inflation');

    // Inflation Simulator Sliders
    const [steelShiftPercent, setSteelShiftPercent] = useState<number>(25); // +25%
    const [cementShiftPercent, setCementShiftPercent] = useState<number>(15); // +15%
    const [fxUsdShiftPercent, setFxUsdShiftPercent] = useState<number>(20); // +20% USD devaluation

    // Baseline market reference prices
    const BASE_STEEL_PRICE_PER_TON = 42000; // EGP
    const BASE_CEMENT_PRICE_PER_M3 = 2400; // EGP

    // Calculate total cost exposure across packages
    const calculateSimulatedCost = (pkg: BoqExposurePackage) => {
        const currentSteelCost = pkg.steelWeightTons * BASE_STEEL_PRICE_PER_TON;
        const currentCementCost = pkg.cementVolumeM3 * BASE_CEMENT_PRICE_PER_M3;
        const remainingBaselineCost = pkg.baselineBudgetEgp - currentSteelCost - currentCementCost;

        const simulatedSteelCost = currentSteelCost * (1 + steelShiftPercent / 100);
        const simulatedCementCost = currentCementCost * (1 + cementShiftPercent / 100);
        const simulatedImportCost = (remainingBaselineCost * pkg.importComponentRatio) * (1 + fxUsdShiftPercent / 100);
        const simulatedLocalCost = remainingBaselineCost * (1 - pkg.importComponentRatio);

        const totalSimulated = simulatedSteelCost + simulatedCementCost + simulatedImportCost + simulatedLocalCost;
        const varianceEgp = totalSimulated - pkg.baselineBudgetEgp;
        const variancePercent = (varianceEgp / pkg.baselineBudgetEgp) * 100;

        return { totalSimulated, varianceEgp, variancePercent };
    };

    const totalPortfolioBaseline = SAMPLE_BOQ_PACKAGES.reduce((acc, p) => acc + p.baselineBudgetEgp, 0);
    const totalSimulatedPortfolio = SAMPLE_BOQ_PACKAGES.reduce((acc, p) => acc + calculateSimulatedCost(p).totalSimulated, 0);
    const totalVariancePortfolio = totalSimulatedPortfolio - totalPortfolioBaseline;

    const handlePtwSignOff = (ptwId: string) => {
        toast.success(`PTW #${ptwId} authorized by Resident Engineer with digital biometric seal!`);
    };

    const handleReleaseRetention = (retId: string, amount: number) => {
        toast.success(`Retention #${retId} approved for release: EGP ${amount.toLocaleString()} transferred to Subcontractor.`);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-5">
                <div>
                    <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shadow-orange-glow">
                            <ShieldAlert className="w-4 h-4" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                            Commercial Risk, HSE & BIM Coordination
                        </h1>
                        <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
                            Enterprise Tier
                        </span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono">
                        FIDIC 13.8 Material Inflation Simulator, Digital Permit to Work (PTW), Subcontractor Retention Escrow, and 48-Hour BIM Clash SLA.
                    </p>
                </div>

                {/* Tab Navigation */}
                <div className="flex items-center gap-1.5 p-1 bg-black/40 border border-white/5 rounded-xl self-start md:self-auto overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('inflation')}
                        className={clsx(
                            'px-3.5 py-2 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-2 whitespace-nowrap',
                            activeTab === 'inflation'
                                ? 'bg-orange-500 text-white shadow-orange-glow'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                        )}
                    >
                        <TrendingDown className="w-3.5 h-3.5" /> Inflation & FX Stress-Test
                    </button>
                    <button
                        onClick={() => setActiveTab('ptw')}
                        className={clsx(
                            'px-3.5 py-2 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-2 whitespace-nowrap',
                            activeTab === 'ptw'
                                ? 'bg-orange-500 text-white shadow-orange-glow'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                        )}
                    >
                        <HardHat className="w-3.5 h-3.5 text-amber-400" /> Permit to Work (HSE Gate)
                    </button>
                    <button
                        onClick={() => setActiveTab('retention')}
                        className={clsx(
                            'px-3.5 py-2 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-2 whitespace-nowrap',
                            activeTab === 'retention'
                                ? 'bg-orange-500 text-white shadow-orange-glow'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                        )}
                    >
                        <Lock className="w-3.5 h-3.5 text-emerald-400" /> Retention Escrow Vault
                    </button>
                    <button
                        onClick={() => setActiveTab('clash')}
                        className={clsx(
                            'px-3.5 py-2 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-2 whitespace-nowrap',
                            activeTab === 'clash'
                                ? 'bg-orange-500 text-white shadow-orange-glow'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                        )}
                    >
                        <Layers className="w-3.5 h-3.5 text-cyan-400" /> BIM Clash Resolution Matrix
                    </button>
                </div>
            </div>

            {/* TAB 1: INFLATION & FX STRESS-TEST (FIDIC 13.8) */}
            {activeTab === 'inflation' && (
                <div className="space-y-6">
                    {/* Top Stress-Test Sliders */}
                    <div className="p-6 rounded-3xl bg-[#141414] border border-white/5 space-y-5 font-mono">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-white/5 pb-4">
                            <div>
                                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                                    <Sliders className="w-4 h-4 text-orange-400" /> Macroeconomic & Commodity Volatility Simulator
                                </h3>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    Simulate dynamic cost impacts against baseline BOQ rates pursuant to FIDIC Sub-Clause 13.8 (Cost Adjustments).
                                </p>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] text-slate-500 block">TOTAL PORTFOLIO INFLATION IMPACT:</span>
                                <span className="text-xl font-black text-red-400">
                                    +EGP {Math.round(totalVariancePortfolio).toLocaleString()} (+{((totalVariancePortfolio / totalPortfolioBaseline) * 100).toFixed(1)}%)
                                </span>
                            </div>
                        </div>

                        {/* 3 Interactive Sliders */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                            {/* Steel Slider */}
                            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-white font-bold">Rebar Steel Price:</span>
                                    <span className="text-orange-400 font-bold px-2 py-0.5 rounded-md bg-orange-500/10 border border-orange-500/20">
                                        +{steelShiftPercent}%
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="60"
                                    value={steelShiftPercent}
                                    onChange={(e) => setSteelShiftPercent(Number(e.target.value))}
                                    className="w-full accent-orange-500 cursor-pointer"
                                />
                                <span className="text-[10px] text-slate-500 block">
                                    Projected: EGP {Math.round(BASE_STEEL_PRICE_PER_TON * (1 + steelShiftPercent / 100)).toLocaleString()} / Ton
                                </span>
                            </div>

                            {/* Cement Slider */}
                            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-white font-bold">Ready-Mix Cement:</span>
                                    <span className="text-cyan-400 font-bold px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20">
                                        +{cementShiftPercent}%
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="60"
                                    value={cementShiftPercent}
                                    onChange={(e) => setCementShiftPercent(Number(e.target.value))}
                                    className="w-full accent-cyan-400 cursor-pointer"
                                />
                                <span className="text-[10px] text-slate-500 block">
                                    Projected: EGP {Math.round(BASE_CEMENT_PRICE_PER_M3 * (1 + cementShiftPercent / 100)).toLocaleString()} / m³
                                </span>
                            </div>

                            {/* FX / USD Devaluation Slider */}
                            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-white font-bold">FX / USD Exposure:</span>
                                    <span className="text-emerald-400 font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                                        +{fxUsdShiftPercent}%
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="60"
                                    value={fxUsdShiftPercent}
                                    onChange={(e) => setFxUsdShiftPercent(Number(e.target.value))}
                                    className="w-full accent-emerald-400 cursor-pointer"
                                />
                                <span className="text-[10px] text-slate-500 block">
                                    Imported MEP, Glass & Chiller equipment price escalation
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* BOQ Exposure Table */}
                    <div className="glass-card rounded-2xl border border-white/5 bg-[#141414]/90 overflow-hidden shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left font-mono text-xs">
                                <thead>
                                    <tr className="border-b border-white/10 text-slate-400 uppercase tracking-wider text-[10px] bg-black/40">
                                        <th className="py-3 px-4">Package</th>
                                        <th className="py-3 px-4">Work Description</th>
                                        <th className="py-3 px-4 text-right">Baseline Budget (EGP)</th>
                                        <th className="py-3 px-4 text-right">Simulated Cost (EGP)</th>
                                        <th className="py-3 px-4 text-right">Variance Impact</th>
                                        <th className="py-3 px-4">Risk Severity</th>
                                        <th className="py-3 px-4">Action Under FIDIC 13.8</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {SAMPLE_BOQ_PACKAGES.map((pkg) => {
                                        const { totalSimulated, varianceEgp, variancePercent } = calculateSimulatedCost(pkg);
                                        const isHighRisk = variancePercent > 18;
                                        return (
                                            <tr key={pkg.packageNumber} className="hover:bg-white/[0.02] transition-colors">
                                                <td className="py-3.5 px-4 text-orange-400 font-bold">{pkg.packageNumber}</td>
                                                <td className="py-3.5 px-4 text-white font-medium">{pkg.packageName}</td>
                                                <td className="py-3.5 px-4 text-right text-slate-300">
                                                    {pkg.baselineBudgetEgp.toLocaleString()}
                                                </td>
                                                <td className="py-3.5 px-4 text-right text-white font-bold">
                                                    {Math.round(totalSimulated).toLocaleString()}
                                                </td>
                                                <td className="py-3.5 px-4 text-right text-red-400 font-bold">
                                                    +{Math.round(varianceEgp).toLocaleString()} (+{variancePercent.toFixed(1)}%)
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <span
                                                        className={clsx(
                                                            'px-2 py-0.5 rounded-full text-[10px] font-bold border',
                                                            isHighRisk
                                                                ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                                                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                        )}
                                                    >
                                                        {isHighRisk ? 'Critical Margin Erosion' : 'Moderate Exposure'}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <button
                                                        onClick={() => toast.success(`Generated FIDIC 13.8 Price Adjustment Notice for ${pkg.packageNumber} (+EGP ${Math.round(varianceEgp).toLocaleString()})`)}
                                                        className="px-2.5 py-1 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[10px] font-bold transition-all"
                                                    >
                                                        Generate FIDIC 13.8 Claim
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: PERMIT TO WORK (HSE GATE) */}
            {activeTab === 'ptw' && (
                <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3.5 font-mono text-xs">
                        <HardHat className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                Zero-Accident Digital Safety Gate (OSHA & Municipal Safety Compliance)
                            </h4>
                            <p className="text-slate-300 leading-relaxed mt-0.5">
                                High-risk activities are locked on site until the resident engineer and HSE manager digitally sign the gas test, scaffolding harness, and fire watch checklist.
                            </p>
                        </div>
                    </div>

                    <div className="glass-card rounded-2xl border border-white/5 bg-[#141414]/90 overflow-hidden shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left font-mono text-xs">
                                <thead>
                                    <tr className="border-b border-white/10 text-slate-400 uppercase tracking-wider text-[10px] bg-black/40">
                                        <th className="py-3 px-4">Permit ID</th>
                                        <th className="py-3 px-4">Hazardous Activity</th>
                                        <th className="py-3 px-4">Location</th>
                                        <th className="py-3 px-4">Subcontractor</th>
                                        <th className="py-3 px-4 text-center">PPE & Safety Check</th>
                                        <th className="py-3 px-4 text-center">HSE Officer Sign</th>
                                        <th className="py-3 px-4 text-center">Resident Eng Sign</th>
                                        <th className="py-3 px-4">Validity</th>
                                        <th className="py-3 px-4">Authorization</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {SAMPLE_PTW_LIST.map((ptw) => (
                                        <tr key={ptw.id} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="py-3.5 px-4 text-orange-400 font-bold">{ptw.id}</td>
                                            <td className="py-3.5 px-4 text-white font-semibold flex items-center gap-1.5">
                                                {ptw.permitType.includes('Hot') ? <Flame className="w-3.5 h-3.5 text-red-400" /> : <HardHat className="w-3.5 h-3.5 text-amber-400" />}
                                                {ptw.permitType}
                                            </td>
                                            <td className="py-3.5 px-4 text-slate-300">{ptw.location}</td>
                                            <td className="py-3.5 px-4 text-slate-400">{ptw.subcontractor}</td>
                                            <td className="py-3.5 px-4 text-center">
                                                {ptw.ppeVerified ? (
                                                    <span className="text-emerald-400 font-bold text-[10px] inline-flex items-center gap-1">
                                                        <CheckCircle2 className="w-3 h-3" /> Inspected
                                                    </span>
                                                ) : (
                                                    <span className="text-red-400 font-bold text-[10px]">Failed</span>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-4 text-center">
                                                <span className="text-emerald-400 font-bold text-[10px] inline-flex items-center gap-1">
                                                    <CheckCircle2 className="w-3 h-3" /> Signed
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-center">
                                                {ptw.residentEngSign ? (
                                                    <span className="text-emerald-400 font-bold text-[10px] inline-flex items-center gap-1">
                                                        <CheckCircle2 className="w-3 h-3" /> Signed
                                                    </span>
                                                ) : (
                                                    <span className="text-amber-400 font-bold text-[10px]">Awaiting Sign</span>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-4 text-slate-400 text-[11px]">{ptw.validUntil}</td>
                                            <td className="py-3.5 px-4">
                                                {ptw.residentEngSign ? (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                        Permitted On-Site
                                                    </span>
                                                ) : (
                                                    <button
                                                        onClick={() => handlePtwSignOff(ptw.id)}
                                                        className="px-2.5 py-1 rounded-lg bg-orange-500 text-white font-bold text-[10px] shadow-orange-glow hover:bg-orange-600 transition-all"
                                                    >
                                                        Sign & Clear Permit
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 3: RETENTION ESCROW VAULT */}
            {activeTab === 'retention' && (
                <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 font-mono text-xs">
                        <div>
                            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                                <Lock className="w-4 h-4 text-emerald-400" /> Subcontractor Retention Withholding & DLP Maturity
                            </h3>
                            <p className="text-slate-400 mt-0.5">
                                Automated escrow ledger tracking the 5%–10% retention money until the end of the 365-day Defects Liability Period (DLP).
                            </p>
                        </div>
                        <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold">
                            Total Retention Held: EGP 4,675,000
                        </div>
                    </div>

                    <div className="glass-card rounded-2xl border border-white/5 bg-[#141414]/90 overflow-hidden shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left font-mono text-xs">
                                <thead>
                                    <tr className="border-b border-white/10 text-slate-400 uppercase tracking-wider text-[10px] bg-black/40">
                                        <th className="py-3 px-4">Escrow Ref</th>
                                        <th className="py-3 px-4">Subcontractor Firm</th>
                                        <th className="py-3 px-4">Trade Scope</th>
                                        <th className="py-3 px-4 text-right">Contract Sum</th>
                                        <th className="py-3 px-4 text-center">Rate</th>
                                        <th className="py-3 px-4 text-right">Retention Held</th>
                                        <th className="py-3 px-4">DLP Expiry (365D)</th>
                                        <th className="py-3 px-4">Bank Guarantee Expiry</th>
                                        <th className="py-3 px-4">Status & Release</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {SAMPLE_RETENTION_VAULT.map((ret) => (
                                        <tr key={ret.id} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="py-3.5 px-4 text-orange-400 font-bold">{ret.id}</td>
                                            <td className="py-3.5 px-4 text-white font-medium">{ret.subcontractor}</td>
                                            <td className="py-3.5 px-4 text-slate-300">{ret.trade}</td>
                                            <td className="py-3.5 px-4 text-right text-slate-300">
                                                {ret.totalContractEgp.toLocaleString()}
                                            </td>
                                            <td className="py-3.5 px-4 text-center text-cyan-400 font-bold">
                                                {ret.retentionRatePercent}%
                                            </td>
                                            <td className="py-3.5 px-4 text-right text-emerald-400 font-bold">
                                                {ret.retentionAmountEgp.toLocaleString()}
                                            </td>
                                            <td className="py-3.5 px-4 text-slate-300">{ret.dlpExpiryDate}</td>
                                            <td className="py-3.5 px-4 text-slate-400">{ret.bankGuaranteeExpiry}</td>
                                            <td className="py-3.5 px-4">
                                                {ret.status === 'Eligible for Release' ? (
                                                    <button
                                                        onClick={() => handleReleaseRetention(ret.id, ret.retentionAmountEgp)}
                                                        className="px-2.5 py-1 rounded-lg bg-emerald-500 text-black font-bold text-[10px] shadow-emerald-glow hover:bg-emerald-400 transition-all flex items-center gap-1"
                                                    >
                                                        <Unlock className="w-3 h-3" /> Release Escrow
                                                    </button>
                                                ) : (
                                                    <span
                                                        className={clsx(
                                                            'px-2 py-0.5 rounded-full text-[10px] font-bold border',
                                                            ret.status === 'DLP Maturing Soon'
                                                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                                : 'bg-white/5 text-slate-400 border-white/10'
                                                        )}
                                                    >
                                                        {ret.status}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 4: BIM CLASH & RFI 48-HOUR RESOLUTION MATRIX */}
            {activeTab === 'clash' && (
                <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 font-mono text-xs">
                        <div>
                            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                                <Layers className="w-4 h-4 text-cyan-400" /> Navisworks BIM Hard Clash & RFI Resolution Matrix
                            </h3>
                            <p className="text-slate-400 mt-0.5">
                                Real-time clash coordination SLA: Severe MEP vs Structural clashes carry a mandatory 48-hour resolution clock before concrete pours.
                            </p>
                        </div>
                        <button
                            onClick={() => toast.success('Syncing with Autodesk BIM 360 / Navisworks Cloud...')}
                            className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold border border-white/10 flex items-center gap-1.5 transition-all"
                        >
                            <RefreshCw className="w-3 h-3" /> Sync Navisworks Model
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {SAMPLE_CLASH_LOG.map((clash) => {
                            const isSevere = clash.criticality.includes('Severe');
                            return (
                                <div
                                    key={clash.id}
                                    className={clsx(
                                        'p-5 rounded-2xl border transition-all space-y-3 font-mono text-xs',
                                        isSevere
                                            ? 'bg-red-500/5 border-red-500/30'
                                            : 'bg-[#141414] border-white/5 hover:border-white/10'
                                    )}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-orange-400 font-bold">{clash.id}</span>
                                        <span
                                            className={clsx(
                                                'px-2 py-0.5 rounded-full text-[10px] font-bold border',
                                                isSevere
                                                    ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                            )}
                                        >
                                            {clash.criticality}
                                        </span>
                                    </div>

                                    <h4 className="text-sm font-bold text-white leading-snug">{clash.clashTitle}</h4>

                                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-[11px] space-y-1">
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Location:</span>
                                            <span className="text-slate-300">{clash.location}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Disciplines:</span>
                                            <span className="text-cyan-400">{clash.disciplineA} vs {clash.disciplineB}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Assigned:</span>
                                            <span className="text-white font-medium">{clash.assignedEngineer}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-1">
                                        <span className="text-[10px] text-slate-500 flex items-center gap-1">
                                            <Clock className="w-3 h-3 text-amber-400" /> Resolution SLA: {clash.resolutionSlaHours}h Remaining
                                        </span>
                                        <button
                                            onClick={() => toast.success(`RFI auto-drafted and routed to ${clash.assignedEngineer}!`)}
                                            className="px-2.5 py-1 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[10px] font-bold transition-all"
                                        >
                                            Issue RFI Notice
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};
