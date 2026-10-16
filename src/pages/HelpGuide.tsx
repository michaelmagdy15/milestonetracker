import { motion } from 'framer-motion';
import { BookOpen, FolderKanban, Users, Clock, Target, Activity, Zap, HardHat, FileLineChart, MonitorPlay, CalendarDays, Brain, Building2, BarChart3, ShieldCheck, ArrowRight, CheckCircle2, Sparkles, Compass, Briefcase, Calculator, Truck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { NEXUS_LIFECYCLE_STAGES, useWorkflow } from '../context/WorkflowContext';
import type { WorkflowPersona } from '../context/WorkflowContext';

const STAGE_LABEL_OVERRIDES: Record<number, string> = {
    1: 'Stage 1: BOQ & Pricing',
    2: 'Stage 2: Submittals',
    3: 'Stage 3: Buy & Stores',
    4: 'Stage 4: Site & Subcontractors',
    5: 'Stage 5: Client Extracts',
    6: 'Stage 6: Treasury & Cashflow',
};

const ROLE_CHECKLISTS: {
    id: WorkflowPersona;
    roleTitle: string;
    roleSubtitleAr: string;
    badge: string;
    accentColor: string;
    icon: typeof Briefcase;
    steps: { stepNum: number; label: string; subAr: string; path: string; cta: string }[];
}[] = [
    {
        id: 'ceo',
        roleTitle: 'CEO',
        roleSubtitleAr: 'المدير التنفيذي والإدارة العليا',
        badge: 'Stages 1–6 Oversight',
        accentColor: '#123524',
        icon: Briefcase,
        steps: [
            {
                stepNum: 1,
                label: 'Review 77-project profitability, net margin alerts & client extract approvals',
                subAr: 'مراجعة ربحية الـ 77 مشروع واعتماد المستخلصات الجارية',
                path: '/extracts',
                cta: 'Open Extracts ➔',
            },
            {
                stepNum: 2,
                label: 'Inspect site execution progress & approve A/B/C subcontractor CPOs',
                subAr: 'متابعة نسب الإنجاز بالمواقع واعتماد أوامر شغل مقاولي الباطن',
                path: '/subcontractors',
                cta: 'Open Site & Subs ➔',
            },
            {
                stepNum: 3,
                label: 'Audit 7 bank/cash vaults, 9 credit cards & daily liquidity position',
                subAr: 'مراجعة أرصدة الـ 7 خزن والبنوك والـ 9 كروت والسيولة اليومية',
                path: '/financials',
                cta: 'Open Treasury ➔',
            },
        ],
    },
    {
        id: 'technical',
        roleTitle: 'Eng. Pierre - Technical Office',
        roleSubtitleAr: 'م. بيير — المكتب الفني والتسعير',
        badge: 'Stages 1, 2, 3 & 5',
        accentColor: '#e04b2a',
        icon: Compass,
        steps: [
            {
                stepNum: 1,
                label: 'Price 839 R02 BOQ items, run unit cost breakdowns & lock baseline',
                subAr: 'تسعير 839 بند بالمقايسة R02 وتحليل الأسعار وقفل التعاقد',
                path: '/boq',
                cta: 'Go to BOQ ➔',
            },
            {
                stepNum: 2,
                label: 'Submit Material (MS) & Shop Drawings (DR) to secure Code A/B approval',
                subAr: 'تقديم اعتمادات الخامات والرسومات للحصول على كود A أو B',
                path: '/submittals',
                cta: 'Go to Submittals ➔',
            },
            {
                stepNum: 3,
                label: 'Verify measured site quantities & issue technical sign-off on Client Extracts',
                subAr: 'مراجعة الحصر الهندسي والتوقيع الفني على المستخلصات وأوامر الشراء',
                path: '/extracts',
                cta: 'Go to Extracts ➔',
            },
        ],
    },
    {
        id: 'accounting',
        roleTitle: 'Merna Maged - Accounting',
        roleSubtitleAr: 'أ. ميرنا ماجد — الحسابات والمالية',
        badge: 'Stages 3, 5 & 6',
        accentColor: '#0f766e',
        icon: Calculator,
        steps: [
            {
                stepNum: 1,
                label: 'Match supplier POs with Mawan bills & release approved payment orders',
                subAr: 'مطابقة أوامر الشراء مع فواتير الموانين وإصدار أوامر الدفع',
                path: '/procurement',
                cta: 'Go to Buy & Stores ➔',
            },
            {
                stepNum: 2,
                label: 'Generate cumulative Client Extracts, account statements & PR vouchers',
                subAr: 'إصدار المستخلص التراكمي للعميل وكشف الحساب وطلب الصرف PR',
                path: '/extracts',
                cta: 'Go to Extracts ➔',
            },
            {
                stepNum: 3,
                label: 'Reconcile 7 bank/cash vaults, 9 credit cards & daily Custody (العهد) settlements',
                subAr: 'تسوية العهد اليومية ومطابقة أرصدة الخزن والبنوك والكروت',
                path: '/financials',
                cta: 'Go to Treasury ➔',
            },
        ],
    },
    {
        id: 'logistics',
        roleTitle: 'Milad Haroun - Logistics & Warehouses',
        roleSubtitleAr: 'أ. ميلاد هارون — المخازن واللوجستيات',
        badge: 'Stage 3 & Site Dispatch',
        accentColor: '#b45309',
        icon: Truck,
        steps: [
            {
                stepNum: 1,
                label: 'Receive approved PO deliveries & log stock across the 4 Nexus warehouses',
                subAr: 'استلام التوريدات المعتمدة وتسجيلها في الـ 4 مخازن الرئيسية',
                path: '/procurement',
                cta: 'Open Warehouses ➔',
            },
            {
                stepNum: 2,
                label: 'Scan & upload Mawan hardware receipts directly to project cost centers',
                subAr: 'تصوير ورفع فواتير الموانين وربطها بمراكز تكلفة المشاريع',
                path: '/procurement',
                cta: 'Scan Mawan Bills ➔',
            },
            {
                stepNum: 3,
                label: 'Coordinate daily fleet dispatch & verify site material receiving notes',
                subAr: 'تنسيق حركة السيارات اليومية وتأكيد أذون الصرف والاستلام بالموقع',
                path: '/subcontractors',
                cta: 'Verify Site Delivery ➔',
            },
        ],
    },
];

export const HelpGuide = () => {
    const { role } = useAuth();
    const navigate = useNavigate();
    const { activeProjectCode, activePersona, setActivePersona } = useWorkflow();
    
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8 pb-12"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-[#e04b2a]/10 rounded-2xl border border-[#e04b2a]/25">
                        <BookOpen className="w-8 h-8 text-[#e04b2a]" />
                    </div>
                    <div>
                        <h2 className="text-4xl font-black text-[#192631] tracking-tighter mb-1">
                            System <span className="text-[#e04b2a]">Help Guide</span>
                        </h2>
                        <p className="text-[#192631]/60 font-medium tracking-wide">
                            Interactive 6-Stage Execution Playbook, Role Checklists & Platform Reference • Active Project: <span className="font-black text-[#123524]">{activeProjectCode}</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Interactive Playbook: How to Get Things Done in 6 Simple Steps */}
            <div className="bg-white/95 backdrop-blur-xl rounded-[32px] border-2 border-[#123524]/15 p-6 md:p-8 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#123524] via-[#e04b2a] to-[#123524]"></div>

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#123524]/10 text-[#123524] text-xs font-black uppercase tracking-widest mb-2">
                            <Sparkles className="w-3.5 h-3.5 text-[#e04b2a]" />
                            Nexus End-to-End Golden Thread
                        </div>
                        <h3 className="text-2xl md:text-3xl font-black text-[#192631] tracking-tight">
                            How to Get Things Done in 6 Simple Steps <span className="text-[#e04b2a]">(Interactive Playbook)</span>
                        </h3>
                        <p className="text-sm text-[#192631]/65 font-semibold mt-1">
                            Follow the exact sequence below from BOQ pricing to cash collection — click any stage to jump straight to work.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-black text-[#123524] bg-[#123524]/5 border border-[#123524]/15 px-3.5 py-2 rounded-xl self-start">
                        <span>Stage 1: BOQ & Pricing</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#e04b2a]" />
                        <span>Stage 6: Treasury & Cashflow</span>
                    </div>
                </div>

                {/* 6 Stages Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    {NEXUS_LIFECYCLE_STAGES.map((stage) => {
                        const displayTitle = STAGE_LABEL_OVERRIDES[stage.stepNumber] || `Stage ${stage.stepNumber}: ${stage.titleEn}`;
                        return (
                            <div
                                key={stage.id}
                                className="group rounded-2xl border border-[#192631]/10 bg-[#f8f9fa] hover:bg-white hover:border-[#123524]/35 p-5 transition-all shadow-sm hover:shadow-md flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-center justify-between gap-2 mb-3">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#123524] text-white text-xs font-black tracking-wide">
                                            STEP {stage.stepNumber} OF 6
                                        </span>
                                        <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-[#e04b2a]/10 text-[#e04b2a] border border-[#e04b2a]/20">
                                            {stage.badge} Records • {stage.ownerRoleEn}
                                        </span>
                                    </div>
                                    <h4 className="text-base font-black text-[#192631] mb-1">
                                        {displayTitle}
                                    </h4>
                                    <p className="text-xs font-bold text-[#123524] mb-2" dir="rtl">
                                        {stage.titleAr} — {stage.shortDescAr}
                                    </p>
                                    <p className="text-xs text-[#192631]/70 font-medium leading-relaxed mb-4">
                                        {stage.shortDescEn}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => navigate(stage.path)}
                                    className="w-full py-2.5 px-4 rounded-xl bg-[#123524] hover:bg-[#e04b2a] text-white font-black text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                                >
                                    <span>Go to Stage ➔</span>
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* Role-by-Role Daily Checklist */}
                <div className="pt-6 border-t border-[#192631]/10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
                        <div>
                            <h4 className="text-xl font-black text-[#192631] flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-[#123524]" />
                                Role-by-Role Daily Checklist
                            </h4>
                            <p className="text-xs text-[#192631]/65 font-semibold mt-0.5">
                                Exact 3 daily steps for each key Nexus persona with 1-click navigation buttons.
                            </p>
                        </div>
                        <span className="text-xs font-bold text-[#192631]/60">
                            Active Role Filter: <strong className="text-[#e04b2a] uppercase">{activePersona}</strong>
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {ROLE_CHECKLISTS.map((personaCard) => {
                            const IconComponent = personaCard.icon;
                            const isSelectedPersona = activePersona === personaCard.id;
                            return (
                                <div
                                    key={personaCard.id}
                                    className={`rounded-2xl border p-5 transition-all ${
                                        isSelectedPersona
                                            ? 'border-[#123524] bg-[#123524]/[0.03] shadow-md'
                                            : 'border-[#192631]/12 bg-white hover:border-[#192631]/25'
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-3 mb-4 pb-3 border-b border-[#192631]/10">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="p-2.5 rounded-xl text-white shrink-0"
                                                style={{ backgroundColor: personaCard.accentColor }}
                                            >
                                                <IconComponent className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h5 className="text-base font-black text-[#192631]">
                                                        {personaCard.roleTitle}
                                                    </h5>
                                                    {isSelectedPersona && (
                                                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#123524] text-white">
                                                            Active
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs font-bold text-[#192631]/60" dir="rtl">
                                                    {personaCard.roleSubtitleAr}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setActivePersona(personaCard.id)}
                                            className="text-[11px] font-black px-2.5 py-1 rounded-lg border border-[#192631]/15 hover:border-[#123524] text-[#192631]/70 hover:text-[#123524] transition-colors shrink-0 cursor-pointer"
                                        >
                                            {personaCard.badge}
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {personaCard.steps.map((step) => (
                                            <div
                                                key={step.stepNum}
                                                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-xl bg-[#f8f9fa] border border-[#192631]/8"
                                            >
                                                <div className="flex items-start gap-2.5">
                                                    <span
                                                        className="w-5 h-5 rounded-full text-white text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5"
                                                        style={{ backgroundColor: personaCard.accentColor }}
                                                    >
                                                        {step.stepNum}
                                                    </span>
                                                    <div>
                                                        <p className="text-xs font-bold text-[#192631] leading-snug">
                                                            {step.label}
                                                        </p>
                                                        <p className="text-[11px] font-semibold text-[#192631]/55 mt-0.5" dir="rtl">
                                                            {step.subAr}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setActivePersona(personaCard.id);
                                                        navigate(step.path);
                                                    }}
                                                    className="px-3 py-1.5 rounded-lg bg-white hover:bg-[#123524] text-[#123524] hover:text-white border border-[#123524]/25 font-black text-[11px] whitespace-nowrap transition-colors self-end sm:self-center shrink-0 cursor-pointer"
                                                >
                                                    {step.cta}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Section 1: Core Navigation */}
                <div className="bg-[#1a1a1a] rounded-[32px] border border-[#192631]/10 p-8 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-[#123524]/10 transition-colors"></div>
                    <h3 className="text-xl font-black text-[#192631] mb-6 flex items-center gap-3">
                        <Activity className="w-5 h-5 text-[#123524]" />
                        Platform Navigation
                    </h3>
                    <div className="space-y-6 text-sm text-[#192631]/70 font-medium">
                        <div>
                            <strong className="text-[#123524] flex items-center gap-2 mb-1"><Target className="w-4 h-4" /> Dashboard</strong>
                            Your central command center. Provides a real-time overview of active projects, system health, predictive risk algorithms, and daily productivity trends.
                        </div>
                        {role !== 'client' && (
                            <div>
                                <strong className="text-[#123524] flex items-center gap-2 mb-1"><FolderKanban className="w-4 h-4" /> Ventures (Projects)</strong>
                                Navigate here to manage projects, set up AI estimates, and organize milestone phases. Inside each venture, you can distribute tasks using the Smart Assign AI.
                            </div>
                        )}
                        <div>
                            <strong className="text-[#123524] flex items-center gap-2 mb-1"><Users className="w-4 h-4" /> Operatives (Engineers)</strong>
                            Provides visibility into the workforce, their performance metrics, assigned evaluations, and AI-predicted capacity.
                        </div>
                    </div>
                </div>

                {/* Section 2: Command & Control */}
                <div className="bg-[#1a1a1a] rounded-[32px] border border-[#192631]/10 p-8 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-cyan-500/10 transition-colors"></div>
                    <h3 className="text-xl font-black text-[#192631] mb-6 flex items-center gap-3">
                        <MonitorPlay className="w-5 h-5 text-[#192631]" />
                        Command & Control Center
                    </h3>
                    <div className="space-y-6 text-sm text-[#192631]/70 font-medium">
                        {role !== 'client' && (
                            <div>
                                <strong className="text-[#192631] flex items-center gap-2 mb-1"><Activity className="w-4 h-4" /> Live Operations Monitor</strong>
                                A real-time tracking dashboard showing exactly what software your specialists are using right now, their active CAD drawings, and idle time. Crucial for live resource management.
                            </div>
                        )}
                        <div>
                            <strong className="text-[#192631] flex items-center gap-2 mb-1"><CalendarDays className="w-4 h-4" /> Capacity Heatmap</strong>
                            Visualizes operative workloads across the next 4 weeks. Use this 4-week forecast matrix to instantly spot overloaded engineers (marked in Red) or under-utilized staff (marked in Emerald).
                        </div>
                        {role === 'admin' || role === 'project_manager' ? (
                            <div>
                                <strong className="text-[#192631] flex items-center gap-2 mb-1"><BarChart3 className="w-4 h-4" /> Advanced Intelligence Reports</strong>
                                Access high-fidelity analytics across dimensions: Projects (Fiscal Value & Cumulative Hours), Engineers (Activity & Overtime), Productivity (Deep Work Focus Scores), and the System Audit Trail.
                            </div>
                        ) : null}
                    </div>
                </div>

                {/* Section 3: AI & Automation */}
                <div className="bg-[#1a1a1a] rounded-[32px] border border-[#192631]/10 p-8 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-purple-500/10 transition-colors"></div>
                    <h3 className="text-xl font-black text-[#192631] mb-6 flex items-center gap-3">
                        <Brain className="w-5 h-5 text-[#192631]" />
                        AI & Automation Engine
                    </h3>
                    <div className="space-y-6 text-sm text-[#192631]/70 font-medium">
                        <div>
                            <strong className="text-[#192631] flex items-center gap-2 mb-1"><Target className="w-4 h-4" /> Smart Task Allocation</strong>
                            Instead of manually assigning tasks, use the <strong className="text-[#e04b2a]">AI Smart Assign</strong> button. It scans current backlogs and instantly routes the task to the operative with the lowest workload, ensuring perfectly balanced delivery.
                        </div>
                        <div>
                            <strong className="text-[#192631] flex items-center gap-2 mb-1"><HardHat className="w-4 h-4" /> Predictive Risk Analytics</strong>
                            The system continuously monitors burn rates, delayed milestones, and outstanding issues. If a project is trending towards a failure, the AI flags it as <strong className="text-red-700">Critical</strong> before deadlines are actually missed.
                        </div>
                        <div>
                            <strong className="text-[#192631] flex items-center gap-2 mb-1"><Zap className="w-4 h-4" /> AI Project Estimates</strong>
                            When onboarding a new project, the system uses machine learning against historical timeline data to predict accurate completion times, estimated engineering costs, and required personnel count.
                        </div>
                    </div>
                </div>

                {/* Section 4: Key Workflows & Partner Portal */}
                <div className="bg-[#1a1a1a] rounded-[32px] border border-[#192631]/10 p-8 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-[#e04b2a]/10 transition-colors"></div>
                    <h3 className="text-xl font-black text-[#192631] mb-6 flex items-center gap-3">
                        <Building2 className="w-5 h-5 text-[#e04b2a]" />
                        Key Workflows & Partner Portal
                    </h3>
                    <div className="space-y-6 text-sm text-[#192631]/70 font-medium">
                        <div>
                            <strong className="text-[#e04b2a] flex items-center gap-2 mb-1"><Clock className="w-4 h-4" /> Logging Orbital Data (Time Tracking)</strong>
                            Use the <strong>Entries</strong> tab to log daily progress. Ensure your work exports match the task descriptions for our Smart Verification engine to auto-close your tasks.
                        </div>
                        <div>
                            <strong className="text-[#e04b2a] flex items-center gap-2 mb-1"><ShieldCheck className="w-4 h-4" /> Partner Portal (Client Access)</strong>
                            Clients have a dedicated dashboard visualizing live project timelines, cumulative milestones, active blockers, and an integrated 3D/BIM Model spatial engine for reviewing digital twins.
                        </div>
                        {role === 'admin' && (
                            <div>
                                <strong className="text-[#e04b2a] flex items-center gap-2 mb-1"><FileLineChart className="w-4 h-4" /> Actionable Audit Logs</strong>
                                The system records every interaction. Admins can view exact timestamps, record IDs, and data mutations to maintain complete compliance and security over project data.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-[32px] border border-[#192631]/10 p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500/50 to-transparent"></div>
                <h3 className="text-xl font-black text-[#192631] mb-4">Frequently Asked Questions</h3>
                <div className="space-y-4 text-sm text-[#192631]/70 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl h-full">
                        <p className="font-bold text-[#192631] mb-2 text-[13px] uppercase tracking-widest text-[#e04b2a]">Q: How do I assign tasks optimally?</p>
                        <p>A: Within the Venture Details page, add a new task under a milestone and click the <strong className="text-[#192631]">AI Smart Assign</strong> button to instantly locate the operative with the lowest workload.</p>
                    </div>
                    <div className="p-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl h-full">
                        <p className="font-bold text-[#192631] mb-2 text-[13px] uppercase tracking-widest text-[#e04b2a]">Q: How does the system automatically verify tasks?</p>
                        <p>A: When an operative exports a file (like a PDF or DWG) that matches a task's parameters, the smart engine cross-references the application usage logs and automatically transitions the task to "Completed".</p>
                    </div>
                    <div className="p-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl h-full">
                        <p className="font-bold text-[#192631] mb-2 text-[13px] uppercase tracking-widest text-[#e04b2a]">Q: Can I see Total Hours instead of Weekly Activity for an Engineer?</p>
                        <p>A: Yes. In the <strong className="text-[#192631]">Reports</strong> section, switch to the Engineers view and use the Date filters at the top to filter total cumulative hours over any specific period.</p>
                    </div>
                    {role === 'client' && (
                        <div className="p-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl h-full">
                            <p className="font-bold text-[#192631] mb-2 text-[13px] uppercase tracking-widest text-[#e04b2a]">Q: How do I review the 3D BIM Models?</p>
                            <p>A: Navigate to your Partner Portal dashboard. The centralized 3D viewer will load available federated models for your associated projects, allowing you to visually orbit and inspect the design.</p>
                        </div>
                    )}
                </div>
            </div>

        </motion.div>
    );
};
