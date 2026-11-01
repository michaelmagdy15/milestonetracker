import React, { useState } from 'react';
import {
    ShieldAlert,
    Clock,
    FileText,
    Send,
    CheckCircle2,
    Scale,
    MessageSquare,
    Copy,
    Lock
} from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';

interface DelayEvent {
    id: string;
    project: string;
    clause: string;
    eventType: 'Late Client Approval' | 'Authority NOC Delay' | 'Subsurface Obstacle' | 'Material Escalation' | 'Site Access Blocked';
    eventDate: string;
    noticeDeadlineDate: string;
    daysRequested: number;
    financialImpactEgp: number;
    status: 'Notice Served (Safe)' | 'Detailed Claim Under Review' | '28-Day Window Closing Soon';
    criticalPathImpact: boolean;
}

const SAMPLE_DELAY_EVENTS: DelayEvent[] = [
    {
        id: 'EOT-2026-001',
        project: 'Saadiyat Cultural Pavilion',
        clause: 'FIDIC Clause 8.4(b) / 20.1',
        eventType: 'Late Client Approval',
        eventDate: '2026-10-14',
        noticeDeadlineDate: '2026-11-11',
        daysRequested: 21,
        financialImpactEgp: 480000,
        status: 'Notice Served (Safe)',
        criticalPathImpact: true
    },
    {
        id: 'EOT-2026-002',
        project: 'New Zayed Executive Twin Towers',
        clause: 'FIDIC Clause 8.4(d) / 13.8',
        eventType: 'Material Escalation',
        eventDate: '2026-10-22',
        noticeDeadlineDate: '2026-11-19',
        daysRequested: 14,
        financialImpactEgp: 1250000,
        status: '28-Day Window Closing Soon',
        criticalPathImpact: true
    },
    {
        id: 'EOT-2026-003',
        project: 'New Capital Financial High-Rise',
        clause: 'FIDIC Clause 8.4(a)',
        eventType: 'Authority NOC Delay',
        eventDate: '2026-10-05',
        noticeDeadlineDate: '2026-11-02',
        daysRequested: 35,
        financialImpactEgp: 890000,
        status: 'Detailed Claim Under Review',
        criticalPathImpact: true
    }
];

export const FidicEotClaimGenerator: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'claims' | 'generator' | 'whatsapp'>('claims');
    const [selectedEvent, setSelectedEvent] = useState<DelayEvent>(SAMPLE_DELAY_EVENTS[0]);

    // Generator Form State
    const [projectInput, setProjectInput] = useState('Saadiyat Cultural Pavilion');
    const [clauseInput, setClauseInput] = useState('FIDIC Red Book Clause 8.4 (Extension of Time) & Clause 20.1 (Contractor Claims)');
    const [causeInput, setCauseInput] = useState('Failure of Employer to issue approval on IFC Architectural Facade Package A-201 within the contractual 14-day review period.');
    const [daysInput, setDaysInput] = useState('28');
    const [costInput, setCostInput] = useState('650,000');
    const [generatedNotice, setGeneratedNotice] = useState<string>('');

    // WhatsApp Magic Link Sign-Off Modal State
    const [clientPhone, setClientPhone] = useState('+971 50 123 4567');
    const [clientSignedStatus, setClientSignedStatus] = useState(false);

    const handleGenerateContractualNotice = () => {
        const currentDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
        const letter = 
`REF: DEC/EOT/2026/049
DATE: ${currentDate}

TO: The Supervising Consulting Engineer / The Employer
PROJECT: ${projectInput}
CONTRACT: FIDIC Conditions of Contract for Construction (Red Book)
SUBJECT: FORMAL NOTICE OF DELAY & INTENTION TO CLAIM EXTENSION OF TIME (EOT) & PROLONGATION COSTS
CLAUSES REFERENCED: ${clauseInput}

Dear Sirs,

1. NOTICE OF DELAY PURSUANT TO CLAUSE 20.1:
In accordance with Sub-Clause 20.1 [Contractor's Claims] and Sub-Clause 8.4 [Extension of Time for Completion], we hereby give formal notice of the occurrence of an event which has impacted the critical path of the Works.

2. DESCRIPTION OF EVENT:
${causeInput}

3. PROGRAMME IMPACT & CRITICAL PATH ANALYSIS:
The critical path activity is directly obstructed. Preliminary delay analysis indicates a net completion date impact of:
- Requested Extension of Time: ${daysInput} Calendar Days
- Preliminary Site Overhead & Prolongation Assessment: EGP ${costInput} (subject to detailed substantiation).

4. CONTRACTUAL RESERVATION OF RIGHTS:
This notice is issued within the mandatory 28-day window from the date on which the Contractor became aware of the event. All contractual rights to additional time, prolongation preliminaries, and financial compensation under Sub-Clause 8.4, 13.8, and 20.1 are hereby expressly reserved.

Yours faithfully,

Eng. Michael Magdy
Executive Managing Director
Dar El-Khaleej (DEC) Engineering Consultants

----------------------------------------------------------------------
إخطار قانوني رسمي بموجب شروط فيديك (FIDIC Clause 20.1 / 8.4)
بناءً على أحكام العقد المبرم، يُخطر المقاول/الاستشاري المشرف بحدوث تأخير ناتج عن تأخر اعتمادات رب العمل، مع طلب تمديد رسمي للمشروع لمدة ${daysInput} يوماً وحفظ الحقوق المالية بالكامل.`;

        setGeneratedNotice(letter);
        toast.success('Bilingual Contractual Notice generated and ready for service!');
    };

    const handleCopyNotice = () => {
        if (!generatedNotice) return;
        navigator.clipboard.writeText(generatedNotice);
        toast.success('Contractual Notice copied to clipboard!');
    };

    const handleGenerateWhatsAppLink = () => {
        toast.success(`Encrypted WhatsApp Magic Link generated for ${clientPhone}`);
    };

    const handleSimulateClientApproval = () => {
        setClientSignedStatus(true);
        toast.success('Client verified with biometric signature! Milestone legally approved.');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-white/5 pb-5">
                <div className="min-w-0">
                    <div className="flex items-center flex-wrap gap-2 mb-1.5">
                        <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shadow-orange-glow shrink-0">
                            <Scale className="w-4 h-4" />
                        </div>
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
                            FIDIC Delay & EOT Claim Engine
                        </h1>
                        <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 whitespace-nowrap">
                            Clause 20.1 Shield
                        </span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono leading-relaxed">
                        Automated 28-day notice countdown, critical path prolongation compensation, and WhatsApp 1-click client sign-off.
                    </p>
                </div>

                {/* Tab Navigation */}
                <div className="flex items-center gap-1.5 p-1.5 bg-black/40 border border-white/5 rounded-xl overflow-x-auto max-w-full no-scrollbar shrink-0">
                    <button
                        onClick={() => setActiveTab('claims')}
                        className={clsx(
                            'px-3.5 py-2 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-2 whitespace-nowrap',
                            activeTab === 'claims'
                                ? 'bg-orange-500 text-white shadow-orange-glow'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                        )}
                    >
                        <ShieldAlert className="w-3.5 h-3.5" /> Delay Register (28-Day Gate)
                    </button>
                    <button
                        onClick={() => setActiveTab('generator')}
                        className={clsx(
                            'px-3.5 py-2 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-2 whitespace-nowrap',
                            activeTab === 'generator'
                                ? 'bg-orange-500 text-white shadow-orange-glow'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                        )}
                    >
                        <FileText className="w-3.5 h-3.5" /> Notice Generator (Bilingual)
                    </button>
                    <button
                        onClick={() => setActiveTab('whatsapp')}
                        className={clsx(
                            'px-3.5 py-2 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-2 whitespace-nowrap',
                            activeTab === 'whatsapp'
                                ? 'bg-orange-500 text-white shadow-orange-glow'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                        )}
                    >
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-400" /> WhatsApp Magic Sign-Off
                    </button>
                </div>
            </div>

            {/* TAB 1: CLAIMS & 28-DAY NOTICE REGISTER */}
            {activeTab === 'claims' && (
                <div className="space-y-4">
                    {/* Top alert card */}
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3.5">
                        <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                                FIDIC Sub-Clause 20.1 Mandatory 28-Day Bar Rule
                            </h4>
                            <p className="text-xs text-slate-300 leading-relaxed font-mono mt-1">
                                Notice of delay must be served within 28 days of the triggering event. Failure to serve notice extinguishes all contractor rights to additional time and prolongation preliminaries.
                            </p>
                        </div>
                    </div>

                    <div className="glass-card rounded-2xl border border-white/5 bg-[#141414]/90 overflow-hidden shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left font-mono text-xs">
                                <thead>
                                    <tr className="border-b border-white/10 text-slate-400 uppercase tracking-wider text-[10px] bg-black/40">
                                        <th className="py-3 px-4">Claim Ref</th>
                                        <th className="py-3 px-4">Project</th>
                                        <th className="py-3 px-4">Delay Cause</th>
                                        <th className="py-3 px-4">Contract Clause</th>
                                        <th className="py-3 px-4">Event Date</th>
                                        <th className="py-3 px-4 text-center">28-Day Deadline</th>
                                        <th className="py-3 px-4 text-right">EOT Claimed</th>
                                        <th className="py-3 px-4 text-right">Cost Impact (EGP)</th>
                                        <th className="py-3 px-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {SAMPLE_DELAY_EVENTS.map((claim) => (
                                        <tr
                                            key={claim.id}
                                            onClick={() => setSelectedEvent(claim)}
                                            className={clsx(
                                                'hover:bg-white/[0.02] transition-colors cursor-pointer',
                                                selectedEvent.id === claim.id && 'bg-orange-500/5'
                                            )}
                                        >
                                            <td className="py-3.5 px-4 text-orange-400 font-bold">{claim.id}</td>
                                            <td className="py-3.5 px-4 text-white font-medium">{claim.project}</td>
                                            <td className="py-3.5 px-4 text-slate-300">{claim.eventType}</td>
                                            <td className="py-3.5 px-4 text-slate-400">{claim.clause}</td>
                                            <td className="py-3.5 px-4 text-slate-400">{claim.eventDate}</td>
                                            <td className="py-3.5 px-4 text-center">
                                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                                                    {claim.noticeDeadlineDate}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-right text-emerald-400 font-bold">
                                                +{claim.daysRequested} Days
                                            </td>
                                            <td className="py-3.5 px-4 text-right text-white font-bold">
                                                {claim.financialImpactEgp.toLocaleString()}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <span
                                                    className={clsx(
                                                        'px-2 py-0.5 rounded-full text-[10px] font-bold border',
                                                        claim.status === 'Notice Served (Safe)'
                                                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                    )}
                                                >
                                                    {claim.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: NOTICE GENERATOR */}
            {activeTab === 'generator' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left: Input Form */}
                    <div className="p-5 rounded-2xl bg-[#141414] border border-white/5 space-y-4 font-mono text-xs">
                        <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                            <Scale className="w-4 h-4 text-orange-400" /> Contractual Claim Parameters
                        </h3>

                        <div className="space-y-1.5">
                            <label className="text-slate-400 block text-[11px]">Target Project:</label>
                            <input
                                type="text"
                                value={projectInput}
                                onChange={(e) => setProjectInput(e.target.value)}
                                className="w-full p-2.5 rounded-xl bg-black/60 border border-white/10 text-white outline-none focus:border-orange-500/50"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-slate-400 block text-[11px]">Applicable FIDIC Sub-Clauses:</label>
                            <input
                                type="text"
                                value={clauseInput}
                                onChange={(e) => setClauseInput(e.target.value)}
                                className="w-full p-2.5 rounded-xl bg-black/60 border border-white/10 text-white outline-none focus:border-orange-500/50"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-slate-400 block text-[11px]">Factual Cause of Delay & Impact:</label>
                            <textarea
                                rows={3}
                                value={causeInput}
                                onChange={(e) => setCauseInput(e.target.value)}
                                className="w-full p-2.5 rounded-xl bg-black/60 border border-white/10 text-white outline-none focus:border-orange-500/50"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-slate-400 block text-[11px]">EOT Days Requested:</label>
                                <input
                                    type="text"
                                    value={daysInput}
                                    onChange={(e) => setDaysInput(e.target.value)}
                                    className="w-full p-2.5 rounded-xl bg-black/60 border border-white/10 text-white outline-none focus:border-orange-500/50 font-bold"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-slate-400 block text-[11px]">Cost Impact (EGP):</label>
                                <input
                                    type="text"
                                    value={costInput}
                                    onChange={(e) => setCostInput(e.target.value)}
                                    className="w-full p-2.5 rounded-xl bg-black/60 border border-white/10 text-white outline-none focus:border-orange-500/50 font-bold text-emerald-400"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleGenerateContractualNotice}
                            className="w-full py-3 rounded-xl bg-orange-500 text-white font-bold text-xs shadow-orange-glow hover:bg-orange-600 transition-all flex items-center justify-center gap-2 mt-4"
                        >
                            <FileText className="w-4 h-4" /> Generate Bilingual FIDIC Legal Notice
                        </button>
                    </div>

                    {/* Right: Output Preview */}
                    <div className="p-5 rounded-2xl bg-[#141414] border border-white/5 flex flex-col font-mono text-xs">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-white font-bold text-sm flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Contractual Letter Preview
                            </span>
                            {generatedNotice && (
                                <button
                                    onClick={handleCopyNotice}
                                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 flex items-center gap-1 text-[11px]"
                                >
                                    <Copy className="w-3 h-3" /> Copy Letter
                                </button>
                            )}
                        </div>

                        <div className="flex-1 p-4 rounded-xl bg-black/60 border border-white/10 text-slate-300 leading-relaxed font-mono whitespace-pre-wrap overflow-y-auto max-h-[480px]">
                            {generatedNotice || 'Click "Generate Bilingual FIDIC Legal Notice" on the left to compile the formal claim letter.'}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 3: WHATSAPP 1-CLICK MAGIC SIGN-OFF SIMULATOR */}
            {activeTab === 'whatsapp' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left: Generator Card */}
                    <div className="p-5 rounded-2xl bg-[#141414] border border-white/5 space-y-4 font-mono text-xs">
                        <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                            <MessageSquare className="w-5 h-5" />
                            <span>WhatsApp Client Approval Magic Link</span>
                        </div>
                        <p className="text-slate-400 leading-relaxed">
                            Stop waiting weeks for client emails. Send an encrypted, one-click mobile sign-off link directly via WhatsApp. The client inspects the 3D drawing or variation and signs with their finger.
                        </p>

                        <div className="space-y-1.5">
                            <label className="text-slate-400 block text-[11px]">Client Mobile Number:</label>
                            <input
                                type="text"
                                value={clientPhone}
                                onChange={(e) => setClientPhone(e.target.value)}
                                className="w-full p-2.5 rounded-xl bg-black/60 border border-white/10 text-white outline-none focus:border-emerald-500/50"
                            />
                        </div>

                        <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-[11px] space-y-1">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Document to Sign:</span>
                                <span className="text-white font-bold">RIBA Stage 4 Detailed Tender Sign-Off</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Invoice Amount:</span>
                                <span className="text-emerald-400 font-bold">AED 1,470,000 (35% Milestone)</span>
                            </div>
                        </div>

                        <button
                            onClick={handleGenerateWhatsAppLink}
                            className="w-full py-3 rounded-xl bg-emerald-500 text-black font-bold text-xs shadow-[0_0_25px_rgba(16,185,129,0.3)] hover:bg-emerald-400 transition-all flex items-center justify-center gap-2"
                        >
                            <Send className="w-4 h-4" /> Send Magic Sign-Off Link to WhatsApp
                        </button>
                    </div>

                    {/* Right: Client Phone Mobile Simulation */}
                    <div className="flex justify-center">
                        <div className="w-full max-w-[340px] bg-[#0c0c0c] border-[4px] border-[#252525] rounded-[36px] p-4 shadow-2xl space-y-3 font-mono text-xs flex flex-col justify-between min-h-[460px]">
                            {/* Mobile Header */}
                            <div className="border-b border-white/5 pb-2 text-center">
                                <span className="text-[9px] text-slate-500 block">SECURE CLIENT PORTAL</span>
                                <h4 className="text-white font-black text-xs">DEC Engineering Consultant</h4>
                            </div>

                            {/* Mobile Content */}
                            <div className="space-y-2.5">
                                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                                    <span className="text-[10px] text-orange-400 uppercase font-bold block">Approval Request</span>
                                    <h5 className="text-white font-bold text-xs mt-0.5">Saadiyat Cultural Pavilion</h5>
                                    <p className="text-[10px] text-slate-400 mt-1">
                                        Architectural & Structural Drawings (Rev 03 IFC) approved by Municipality.
                                    </p>
                                </div>

                                <div className="p-2.5 rounded-xl bg-black/60 border border-white/5 text-[10px] flex justify-between">
                                    <span className="text-slate-400">Milestone Fee:</span>
                                    <span className="text-emerald-400 font-bold">AED 1,470,000</span>
                                </div>

                                {/* Finger Signature Pad Simulation */}
                                <div className="p-3 rounded-xl bg-black/80 border border-dashed border-white/20 text-center">
                                    <span className="text-[9px] text-slate-500 block mb-1">CLIENT SIGNATURE (FINGER PAD)</span>
                                    <div className="h-12 flex items-center justify-center">
                                        {clientSignedStatus ? (
                                            <span className="text-emerald-400 font-black text-base italic tracking-widest">
                                                Sheikh Mansoor Al-Nahyan (Verified)
                                            </span>
                                        ) : (
                                            <span className="text-slate-600 text-[10px]">Tap Approve to apply digital sign-off</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Action Button */}
                            {clientSignedStatus ? (
                                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-center font-bold text-[11px]">
                                    <CheckCircle2 className="w-4 h-4 mx-auto mb-1" />
                                    Approved & Invoiced to Client ERP
                                </div>
                            ) : (
                                <button
                                    onClick={handleSimulateClientApproval}
                                    className="w-full py-2.5 rounded-xl bg-emerald-500 text-black font-bold text-xs shadow-emerald-glow hover:bg-emerald-400 transition-all flex items-center justify-center gap-1.5"
                                >
                                    <Lock className="w-3.5 h-3.5" /> Approve & Sign Digitally
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
