import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { supabase } from '../lib/supabase';
import {
    FolderKanban,
    Clock,
    Activity,
    Briefcase,
    Settings,
    Trash2,
    CheckCircle2,
    AlertCircle,
    Camera,
    UploadCloud,
    Receipt,
    Calculator,
    FileCheck2,
    PackageCheck,
    Wallet,
    HardHat,
    ArrowUpRight,
    Compass,
    ArrowRight,
    ChevronDown,
    ChevronUp,
    ShieldCheck,
    Truck,
    FileSignature,
    Building2,
    Layers
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format, startOfWeek as getStartOfWeek } from 'date-fns';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTenant, DEC_ORG_ID, DEFAULT_ORG_ID } from '../context/TenantContext';
import { useWorkflow, NEXUS_LIFECYCLE_STAGES } from '../context/WorkflowContext';
import type { WorkflowPersona } from '../context/WorkflowContext';
import { useLanguage } from '../context/LanguageContext';
import { categorizeApp } from '../utils/appCategorization';
import { GlowButton } from '../components/GlowButton';
import { EditableText } from '../components/EditableText';
import { LiveOperationsMonitor } from '../components/LiveOperationsMonitor';

interface PersonaConfig {
    id: WorkflowPersona;
    labelEn: string;
    labelAr: string;
    subtitleEn: string;
    subtitleAr: string;
    icon: any;
    steps: {
        stepNumber: number;
        badgeEn: string;
        badgeAr: string;
        titleEn: string;
        titleAr: string;
        summaryEn: string;
        summaryAr: string;
        route: string;
    }[];
}

const PERSONA_COMMAND_CONFIGS: PersonaConfig[] = [
    {
        id: 'ceo',
        labelEn: 'CEO / Executive',
        labelAr: 'الإدارة التنفيذية (CEO)',
        subtitleEn: 'Eng. Mohamed & Eng. Michael — Approve pricing, 5-Gate VOs & liquidity',
        subtitleAr: 'اعتماد نسب الخصم وبوابات الـ 5 مراحل وتقييم مقاولي الباطن والسيولة',
        icon: ShieldCheck,
        steps: [
            {
                stepNumber: 1,
                badgeEn: 'Stage 1 · BOQ & RIBA',
                badgeAr: 'مرحلة 1 · المقايسة والعروض',
                titleEn: 'Approve R02 Contract Pricing & RIBA Fee Proposals',
                titleAr: 'اعتماد تسعير مقايسة R02 وعروض أتعاب RIBA',
                summaryEn: 'Review 34 work packages (839 R02 items), inspect unit margins, and lock contract baseline.',
                summaryAr: 'مراجعة الـ 34 حزمة أعمال (839 بند R02) وفحص هوامش الربح وتثبيت خط الأساس التعاقدي.',
                route: '/boq',
            },
            {
                stepNumber: 2,
                badgeEn: 'Stage 4 · Site & Subs',
                badgeAr: 'مرحلة 4 · مقاولي الباطن',
                titleEn: 'Audit 4-Pillar Subcontractor Grades (A/B/C) & CPOs',
                titleAr: 'مراجعة تقييم الـ 56 مقاول باطن (A/B/C) والمستخلصات',
                summaryEn: 'Evaluate Quality, Pricing, Commitment & Dealing across 56 trades and sign off ST/CPOs.',
                summaryAr: 'فحص تقييم الجودة والسعر والالتزام لـ 56 مقاول باطن واعتماد مستخلصات الصنايعية.',
                route: '/subcontractors',
            },
            {
                stepNumber: 3,
                badgeEn: 'Stage 6 · Treasury',
                badgeAr: 'مرحلة 6 · الخزينة والسيولة',
                titleEn: 'Monitor EGP 738,284 Liquidity & 77-Project Margins',
                titleAr: 'متابعة السيولة المتاحة (738,284 ج.م) وربحية المشاريع',
                summaryEn: 'Inspect live balances across 7 cash/bank vaults, 9 credit cards, and net project receivables.',
                summaryAr: 'مراجعة الأرصدة اللحظية في 7 خزن وبنوك و9 كروت ائتمان وصافي مستحقات المشاريع.',
                route: '/financials',
            },
        ],
    },
    {
        id: 'technical',
        labelEn: 'Technical Office',
        labelAr: 'المكتب الفني',
        subtitleEn: 'Eng. Pierre Afifi — Price R02 BOQ, submit MS/DR approvals & Works Extracts',
        subtitleAr: 'م. بيير عفيفي — تسعير مقايسة R02 وتقديم اعتمادات MS/DR وإعداد المستخلصات',
        icon: Calculator,
        steps: [
            {
                stepNumber: 1,
                badgeEn: 'Stage 1 · BOQ Engine',
                badgeAr: 'مرحلة 1 · تسعير المقايسة',
                titleEn: 'Complete 11-Component Unit Cost Breakdown (R02)',
                titleAr: 'إدخال تحليل أسعار الوحدة (11 مكون) لبنود R02',
                summaryEn: 'Break down materials, wastage, labor, equipment, and overheads across 839 BOQ items.',
                summaryAr: 'تحليل تكلفة الخامات والهالك والمصنعيات والمعدات والمصاريف غير المباشرة لـ 839 بند.',
                route: '/boq',
            },
            {
                stepNumber: 2,
                badgeEn: 'Stage 2 · Document Control',
                badgeAr: 'مرحلة 2 · الاعتمادات الفنية',
                titleEn: 'Submit MS / DR / MIR & Secure Code A or B',
                titleAr: 'تقديم اعتمادات الخامات والرسومات والحصول على كود A/B',
                summaryEn: 'Log 51 technical submittals with standard file coding (01.TDC / 02.DC / 03.TC).',
                summaryAr: 'تسجيل الـ 51 اعتماد فني بالتكويد القياسي ومتابعة رد الاستشاري للحصول على كود A أو B.',
                route: '/submittals',
            },
            {
                stepNumber: 3,
                badgeEn: 'Stage 5 · Works Extracts',
                badgeAr: 'مرحلة 5 · مستخلصات الأعمال',
                titleEn: 'Prepare Cumulative Client Works Extract #4',
                titleAr: 'إعداد المستخلص الجاري التراكمي للعميل',
                summaryEn: 'Update executed quantities and achievement percentages (75%–100%) for client billing.',
                summaryAr: 'تحديث الكميات المنفذة الحالية ونسب الصرف (75%–100%) لإصدار المستخلص الجاري للعميل.',
                route: '/extracts',
            },
        ],
    },
    {
        id: 'accounting',
        labelEn: 'Accounting & Finance',
        labelAr: 'الحسابات والمالية',
        subtitleEn: 'Merna Maged — Issue Payment Requests PR, attach POP & reconcile 80 ledgers',
        subtitleAr: 'أ. ميرنا ماجد — إصدار طلبات الصرف PR وإرفاق POP ومطابقة 80 حساب عميل',
        icon: Receipt,
        steps: [
            {
                stepNumber: 1,
                badgeEn: 'Stage 3 · NPO ➔ PR ➔ POP',
                badgeAr: 'مرحلة 3 · دورة الصرف',
                titleEn: 'Convert Approved POs to Payment Requests (PR) & Attach POP',
                titleAr: 'تحويل أوامر الشراء لطلبات صرف (PR) وإرفاق إثبات الدفع (POP)',
                summaryEn: 'Verify Submittal-gated NPOs, issue official Payment Requests, and attach bank POP receipts.',
                summaryAr: 'مراجعة أوامر الشراء المعتمدة وإصدار طلب الصرف (PR) ورفع إيصال التحويل البنكي (POP).',
                route: '/procurement',
            },
            {
                stepNumber: 2,
                badgeEn: 'Stage 5 · Client Ledgers',
                badgeAr: 'مرحلة 5 · حسابات العملاء',
                titleEn: 'Reconcile 80 Client Account Statements & Extract Billings',
                titleAr: 'مطابقة كشوف حسابات الـ 80 عميل والدفعات المحصلة',
                summaryEn: 'Audit customer bank transfers, opening balances, and contract debits (e.g. C096 statement).',
                summaryAr: 'مراجعة تحويلات العملاء والأرصدة الافتتاحية ومديونيات المستخلصات لكافة العملاء.',
                route: '/extracts',
            },
            {
                stepNumber: 3,
                badgeEn: 'Stage 6 · Vaults & Cards',
                badgeAr: 'مرحلة 6 · الخزن والكروت',
                titleEn: 'Settle 7 Cash/Bank Vaults & 9 Credit Card Installments',
                titleAr: 'تسوية أرصدة الـ 7 خزن والبنوك وأقساط الـ 9 كروت ائتمان',
                summaryEn: 'Record daily custody movements (254,834 EGP) and track unused card limits (483,450 EGP).',
                summaryAr: 'تسجيل حركات العهدة والبنوك ومتابعة الحدود المتاحة لكروت الائتمان.',
                route: '/financials',
            },
        ],
    },
    {
        id: 'logistics',
        labelEn: 'Logistics & Stores',
        labelAr: 'اللوجستيات والمخازن',
        subtitleEn: 'Milad Haroun — Dispatch fleet, Uber Bike/Trucks & manage 4 warehouses',
        subtitleAr: 'أ. ميلاد هارون — تشغيل الأسطول وأوبر بايك/النقل وإدارة الـ 4 مخازن',
        icon: Truck,
        steps: [
            {
                stepNumber: 1,
                badgeEn: 'Stage 3 · 4 Warehouses',
                badgeAr: 'مرحلة 3 · المخازن الأربعة',
                titleEn: 'Manage Inventory Across 4 Warehouses & Site Custody',
                titleAr: 'إدارة المخزون والتوريد عبر الـ 4 مخازن وعهد المواقع',
                summaryEn: 'Log stock in/out across Ring Road 1 & 2, Nozha HQ Store, and Active Site Custody.',
                summaryAr: 'تسجيل حركات الاستلام والصرف في مخزن الدائري 1 و2 ومخزن النزهة الرئيسي وعهد المواقع.',
                route: '/procurement',
            },
            {
                stepNumber: 2,
                badgeEn: 'Stage 3 · Fleet & OCR',
                badgeAr: 'مرحلة 3 · الأسطول والفواتير',
                titleEn: 'Scan Local Hardware (Mawan) Bills & Dispatch Fleet',
                titleAr: 'مسح فواتير الموانين بالذكاء الاصطناعي وتشغيل النقل',
                summaryEn: 'Digitize handwritten site receipts via OCR and dispatch company cars or trucks.',
                summaryAr: 'مسح الفواتير اليدوية بالـ OCR وتوجيه سيارات الشركة أو الدبابة/الجامبو للمواقع.',
                route: '/procurement',
            },
            {
                stepNumber: 3,
                badgeEn: 'Field GPS · 21→20 Cycle',
                badgeAr: 'بصمة GPS · دورة 21←20',
                titleEn: 'Verify Field GPS Check-Ins & Site Transfers',
                titleAr: 'متابعة بصمة الـ GPS الميدانية وتحركات فرق المواقع',
                summaryEn: 'Monitor live GPS coordinates for 16 engineers/staff and confirm daily site attendance.',
                summaryAr: 'مراجعة مواقع الـ GPS اللحظية لـ 16 مهندس وموظف وتأكيد الحضور الميداني بالمواقع.',
                route: '/attendance',
            },
        ],
    },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.06 }
    }
};

const itemVariants: any = {
    hidden: { opacity: 0, y: 12 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.35, ease: 'easeOut' }
    }
};

export const Dashboard = () => {
    const navigate = useNavigate();
    const { projects, engineers, entries, clearMonthlyData, appUsageLogs, updateProject, globalSettings, updateGlobalSetting } = useData();
    const { role } = useAuth();
    const { activeOrg, switchOrganization } = useTenant();
    const { activeProject, activePersona, setActivePersona, viewComplexity } = useWorkflow();
    const { language } = useLanguage();
    const isAr = language === 'ar';
    const isDecPortal = activeOrg.id === DEC_ORG_ID || activeOrg.name.toUpperCase().includes('DEC');

    const [targetHours, setTargetHours] = useState(() => {
        const saved = localStorage.getItem('dec_target_hours');
        return saved ? parseInt(saved) : 100;
    });
    const [isClearing, setIsClearing] = useState(false);
    const [clearSuccess, setClearSuccess] = useState(false);
    const [isUpdatingTracker, setIsUpdatingTracker] = useState(false);
    const [trackerVersion, setTrackerVersion] = useState('');
    const [trackerUrl, setTrackerUrl] = useState('');
    const [showDetailedCharts, setShowDetailedCharts] = useState(false);
    const [isPlaybookCollapsed, setIsPlaybookCollapsed] = useState(() => {
        return localStorage.getItem('mitrixo_playbook_collapsed') === 'true';
    });

    const togglePlaybook = () => {
        setIsPlaybookCollapsed(prev => {
            const next = !prev;
            localStorage.setItem('mitrixo_playbook_collapsed', String(next));
            return next;
        });
    };

    const selectedPersonaConfig = PERSONA_COMMAND_CONFIGS.find(p => p.id === activePersona) || PERSONA_COMMAND_CONFIGS[0];

    useEffect(() => {
        if (globalSettings['tracker_version']) setTrackerVersion(globalSettings['tracker_version']);
        if (globalSettings['tracker_update_url']) setTrackerUrl(globalSettings['tracker_update_url']);
    }, [globalSettings]);

    useEffect(() => {
        (async () => {
            try {
                const { data } = await supabase.from('app_settings').select('value').eq('key', 'target_hours').maybeSingle();
                if (data?.value) {
                    const val = parseInt(data.value);
                    if (!isNaN(val)) setTargetHours(val);
                }
            } catch { /* fallback */ }
        })();
    }, []);

    const updateTargetHours = async (val: number) => {
        setTargetHours(val);
        localStorage.setItem('dec_target_hours', val.toString());
        await supabase.from('app_settings')
            .upsert({ key: 'target_hours', value: val.toString(), updated_at: new Date().toISOString() })
            .then(() => { });
    };

    const IDLE_THRESHOLD_SECONDS = 300;

    const calculateAppUsageStats = (logs: any[], sinceDate?: Date) => {
        let activeSeconds = 0;
        let idleSeconds = 0;
        let nonWorkSeconds = 0;
        let deepWorkSeconds = 0;
        let commsSeconds = 0;
        let adminSeconds = 0;
        let otherSeconds = 0;

        const filteredLogs = sinceDate ? logs.filter(l => new Date(l.timestamp) >= sinceDate) : logs;

        filteredLogs.forEach(log => {
            const isLockScreen = log.activeWindow.toLowerCase().includes('lock') || log.activeWindow.toLowerCase().includes('login');
            if (isLockScreen) {
                idleSeconds += log.durationSeconds;
                return;
            }
            const cappedDuration = Math.min(log.durationSeconds, IDLE_THRESHOLD_SECONDS);
            const idleExcess = Math.max(0, log.durationSeconds - IDLE_THRESHOLD_SECONDS);
            idleSeconds += idleExcess;

            const category = categorizeApp(log.activeWindow);
            if (category === 'Deep Work') {
                activeSeconds += cappedDuration;
                deepWorkSeconds += cappedDuration;
            } else if (category === 'Communication') {
                activeSeconds += cappedDuration;
                commsSeconds += cappedDuration;
            } else if (category === 'Admin/Doc') {
                activeSeconds += cappedDuration;
                adminSeconds += cappedDuration;
            } else {
                nonWorkSeconds += cappedDuration;
                otherSeconds += cappedDuration;
            }
        });

        return {
            activeHours: activeSeconds / 3600,
            idleHours: idleSeconds / 3600,
            nonWorkHours: nonWorkSeconds / 3600,
            deepWorkHours: deepWorkSeconds / 3600,
            commsHours: commsSeconds / 3600,
            adminHours: adminSeconds / 3600,
            otherHours: otherSeconds / 3600
        };
    };

    const filteredEntries = entries;
    const totalAppStats = calculateAppUsageStats(appUsageLogs || []);
    const startOfWeek = getStartOfWeek(new Date(), { weekStartsOn: 0 });
    const weeklyAppStats = calculateAppUsageStats(appUsageLogs || [], startOfWeek);

    const totalHours = filteredEntries.reduce((sum, e) => sum + e.timeSpent, 0) + totalAppStats.activeHours;
    const weeklyHours = filteredEntries
        .filter(e => new Date(e.date) >= startOfWeek)
        .reduce((sum, e) => sum + e.timeSpent, 0) + weeklyAppStats.activeHours;

    const thirtyDaysAgo = new Date(new Date().setDate(new Date().getDate() - 30));
    const activeProjectIds = new Set(
        filteredEntries
            .filter(e => new Date(e.date) >= thirtyDaysAgo)
            .map(e => e.projectId)
    );
    const activeProjectsCount = Math.max(activeProjectIds.size, projects.length > 0 ? projects.length : 46);
    const recentEntries = [...filteredEntries]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);

    const handleClearData = async () => {
        const confirmation = window.prompt(
            '⚠️ DANGER: This will permanently delete ALL entries, attendance, tasks, milestones, time entries, notifications, leave requests, and meetings.\n\nProjects, engineers, and files will be kept.\n\nType DELETE to confirm:'
        );
        if (confirmation !== 'DELETE') return;
        setIsClearing(true);
        setClearSuccess(false);
        await clearMonthlyData();
        setIsClearing(false);
        setClearSuccess(true);
        setTimeout(() => setClearSuccess(false), 3000);
    };

    const handleDeployTracker = async () => {
        if (!trackerVersion) {
            toast.error('Version is required.');
            return;
        }
        setIsUpdatingTracker(true);
        await updateGlobalSetting('tracker_version', trackerVersion);
        await updateGlobalSetting('tracker_update_url', trackerUrl || 'https://github.com');
        setIsUpdatingTracker(false);
        toast.success('Tracker update deployed! Trackers should auto-update shortly.');
    };

    const weeklyCapacityPct = Math.min(100, Math.round((weeklyHours / Math.max(1, targetHours)) * 100));

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-5"
        >
            {/* 1. MITRIXO EXECUTIVE FILTER & CONTEXT BAR */}
            <div className="mitrixo-card p-3.5 sm:p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#e04b2a]/10 border border-[#e04b2a]/25 text-[#e04b2a] flex items-center justify-center shrink-0">
                        <Building2 className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight truncate">
                                {isDecPortal
                                    ? (isAr ? 'بوابة DEC لإدارة المراحل الهندسية' : 'DEC Engineering & Milestone Command')
                                    : (isAr ? 'مركز قيادة نكسس للمقاولات' : 'NEXUS Contracting & AEC Command')}
                            </h1>
                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase tracking-wider">
                                {activeProject ? `${activeProject.code} (${activeProject.completionPercent}%)` : '77 Projects Live'}
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {isAr ? selectedPersonaConfig.subtitleAr : selectedPersonaConfig.subtitleEn}
                        </p>
                    </div>
                </div>

                {/* Quick Tenant + Action Controls */}
                <div className="flex items-center flex-wrap gap-2 shrink-0">
                    <div className="inline-flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                        <button
                            type="button"
                            onClick={() => switchOrganization(DEC_ORG_ID)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all ${
                                isDecPortal
                                    ? 'bg-[#e04b2a] text-white shadow-sm'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            DEC Portal
                        </button>
                        <button
                            type="button"
                            onClick={() => switchOrganization(DEFAULT_ORG_ID)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all ${
                                !isDecPortal
                                    ? 'bg-[#192631] text-white shadow-sm'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            NEXUS ERP
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate('/proposals')}
                        className="px-3 py-1.5 h-8 rounded-xl bg-[#e04b2a] hover:bg-[#c93f20] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                    >
                        <FileSignature className="w-3.5 h-3.5" />
                        <span>{isAr ? 'عروض RIBA والـ 5 بوابات' : 'RIBA & 5-Gate Hub'}</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate('/projects')}
                        className="px-3 py-1.5 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-200/80 dark:border-slate-700 transition-colors"
                    >
                        <FolderKanban className="w-3.5 h-3.5 text-[#e04b2a]" />
                        <span>{isAr ? 'المشاريع' : 'Projects'}</span>
                    </button>
                </div>
            </div>

            {/* 2. MITRIXO 5-CARD EXECUTIVE KPI STRIP (Above the Fold with Progress Bars & Drill-Downs) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                {/* KPI 1: Treasury & Spendable Liquidity (Mitrixo Total Payments / Target Card Pattern) */}
                <div
                    onClick={() => navigate('/financials')}
                    className="mitrixo-card p-4 cursor-pointer flex flex-col justify-between"
                >
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                                {isAr ? 'السيولة المتاحة والخزينة' : 'Spendable Liquidity'}
                            </span>
                            <Wallet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                            738,284 <span className="text-xs font-bold text-slate-500">EGP</span>
                        </div>
                        <div className="mt-2 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '74%' }} />
                        </div>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 space-y-1 text-[11px]">
                        <div className="flex justify-between text-slate-500 dark:text-slate-400">
                            <span>{isAr ? 'الخزن والبنوك (7):' : 'Cash & 7 Vaults:'}</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">254,834 EGP</span>
                        </div>
                        <div className="flex justify-between text-slate-500 dark:text-slate-400">
                            <span>{isAr ? 'حدود الكروت (9):' : '9 Credit Limits:'}</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">483,450 EGP</span>
                        </div>
                    </div>
                </div>

                {/* KPI 2: Active Projects & Portfolio */}
                <div
                    onClick={() => navigate('/projects')}
                    className="mitrixo-card p-4 cursor-pointer flex flex-col justify-between"
                >
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                                {isAr ? 'المشاريع النشطة' : 'Active Projects'}
                            </span>
                            <FolderKanban className="w-4 h-4 text-[#e04b2a]" />
                        </div>
                        <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                            {activeProjectsCount} <span className="text-xs font-bold text-slate-400">/ 77</span>
                        </div>
                        <div className="mt-2 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-[#e04b2a] rounded-full"
                                style={{ width: `${activeProject ? activeProject.completionPercent : 87}%` }}
                            />
                        </div>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 space-y-1 text-[11px]">
                        <div className="flex justify-between text-slate-500 dark:text-slate-400">
                            <span>{isAr ? 'المشروع النشط:' : 'Active Focus:'}</span>
                            <span className="font-bold text-[#e04b2a] font-mono">{activeProject ? activeProject.code : 'C096 (87.3%)'}</span>
                        </div>
                        <div className="flex justify-between text-slate-500 dark:text-slate-400">
                            <span>{isAr ? 'المستخلص الجاري:' : 'Latest Extract:'}</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">164,896 EGP</span>
                        </div>
                    </div>
                </div>

                {/* KPI 3: 5-Gate Scope & Variation Order Shield */}
                <div
                    onClick={() => navigate('/proposals')}
                    className="mitrixo-card p-4 cursor-pointer flex flex-col justify-between"
                >
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                                {isAr ? 'حماية النطاق (5-Gate)' : '5-Gate Scope Shield'}
                            </span>
                            <ShieldCheck className="w-4 h-4 text-indigo-500" />
                        </div>
                        <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                            RIBA 1–5
                        </div>
                        <div className="mt-2 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: '100%' }} />
                        </div>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 space-y-1 text-[11px]">
                        <div className="flex justify-between text-slate-500 dark:text-slate-400">
                            <span>{isAr ? 'سقف التعديلات:' : 'Revision Cap:'}</span>
                            <span className="font-bold text-indigo-600 dark:text-indigo-400">Max 2 Free / Stage</span>
                        </div>
                        <div className="flex justify-between text-slate-500 dark:text-slate-400">
                            <span>{isAr ? 'بوابة التعاقد:' : 'Pre-Contract:'}</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">4-Doc Gate Active</span>
                        </div>
                    </div>
                </div>

                {/* KPI 4: Technical Office (BOQ R02 & Submittals) */}
                <div
                    onClick={() => navigate('/boq')}
                    className="mitrixo-card p-4 cursor-pointer flex flex-col justify-between"
                >
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                                {isAr ? 'المقايسة والاعتمادات' : 'BOQ & Submittals'}
                            </span>
                            <Calculator className="w-4 h-4 text-amber-500" />
                        </div>
                        <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                            839 <span className="text-xs font-bold text-slate-400">R02 Items</span>
                        </div>
                        <div className="mt-2 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 rounded-full" style={{ width: '88%' }} />
                        </div>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 space-y-1 text-[11px]">
                        <div className="flex justify-between text-slate-500 dark:text-slate-400">
                            <span>{isAr ? 'حزم الأعمال:' : 'Work Packages:'}</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">34 Packages</span>
                        </div>
                        <div className="flex justify-between text-slate-500 dark:text-slate-400">
                            <span>{isAr ? 'اعتمادات فنية:' : 'Submittals:'}</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">51 (Code A/B)</span>
                        </div>
                    </div>
                </div>

                {/* KPI 5: Engineering Capacity & Weekly Target */}
                <div
                    onClick={() => navigate('/engineers')}
                    className="mitrixo-card p-4 cursor-pointer flex flex-col justify-between"
                >
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                                {isAr ? 'ساعات العمل الأسبوعية' : 'Weekly Engineering Hrs'}
                            </span>
                            <Clock className="w-4 h-4 text-sky-500" />
                        </div>
                        <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                            {weeklyHours.toFixed(1)} <span className="text-xs font-bold text-slate-400">/ {targetHours}h</span>
                        </div>
                        <div className="mt-2 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-sky-500 rounded-full"
                                style={{ width: `${weeklyCapacityPct}%` }}
                            />
                        </div>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 space-y-1 text-[11px]">
                        <div className="flex justify-between text-slate-500 dark:text-slate-400">
                            <span>{isAr ? 'الفريق الهندسي:' : 'Team Strength:'}</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">{engineers.length || 16} Engineers</span>
                        </div>
                        <div className="flex justify-between text-slate-500 dark:text-slate-400">
                            <span>{isAr ? 'إجمالي الساعات:' : 'All-Time Logged:'}</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">{totalHours.toFixed(0)} hrs</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. COLLAPSIBLE ROLE PLAYBOOK & 6-STAGE PIPELINE (Clean, Compact, High-Contrast) */}
            <div className="mitrixo-card p-4 sm:p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-[#e04b2a] text-white flex items-center justify-center shrink-0 shadow-sm">
                            <Compass className="w-4 h-4" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                                    {isAr ? 'خطة العمل اليومية حسب الدور الوظيفي' : 'Role Execution Playbook & 6-Stage Pipeline'}
                                </h2>
                                <span className="px-2 py-0.5 rounded-full bg-[#e04b2a]/10 text-[#e04b2a] text-[10px] font-black uppercase">
                                    {isAr ? selectedPersonaConfig.labelAr : selectedPersonaConfig.labelEn}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Compact Role Selector Pills */}
                        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200/70 dark:border-slate-700">
                            {PERSONA_COMMAND_CONFIGS.map(persona => {
                                const Icon = persona.icon;
                                const isSelected = activePersona === persona.id;
                                return (
                                    <button
                                        key={persona.id}
                                        type="button"
                                        onClick={() => {
                                            setActivePersona(persona.id);
                                            if (isPlaybookCollapsed) setIsPlaybookCollapsed(false);
                                        }}
                                        className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                                            isSelected
                                                ? 'bg-[#192631] text-white shadow-sm'
                                                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                    >
                                        <Icon className="w-3.5 h-3.5" />
                                        <span className="hidden md:inline">{isAr ? persona.labelAr : persona.labelEn}</span>
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            type="button"
                            onClick={togglePlaybook}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold hover:text-slate-900 dark:hover:text-white"
                            title={isPlaybookCollapsed ? 'Expand Playbook' : 'Collapse Playbook'}
                        >
                            <span>{isPlaybookCollapsed ? (isAr ? 'إظهار الخطوات' : 'Expand') : (isAr ? 'طي' : 'Collapse')}</span>
                            {isPlaybookCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                        </button>
                    </div>
                </div>

                {!isPlaybookCollapsed && (
                    <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                        {/* 3 Crisp Action Cards (No bloated multi-box text walls!) */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                            {selectedPersonaConfig.steps.map(step => (
                                <div
                                    key={step.stepNumber}
                                    onClick={() => navigate(step.route)}
                                    className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 hover:border-[#e04b2a] transition-all cursor-pointer flex flex-col justify-between group"
                                >
                                    <div>
                                        <div className="flex items-center justify-between gap-2 mb-2">
                                            <span className="px-2 py-0.5 rounded-md bg-[#e04b2a] text-white text-[10px] font-black uppercase">
                                                {isAr ? `خطوة ${step.stepNumber}` : `Step ${step.stepNumber}`}
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                {isAr ? step.badgeAr : step.badgeEn}
                                            </span>
                                        </div>
                                        <h3 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-[#e04b2a] transition-colors leading-snug">
                                            {isAr ? step.titleAr : step.titleEn}
                                        </h3>
                                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                                            {isAr ? step.summaryAr : step.summaryEn}
                                        </p>
                                    </div>

                                    <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs font-extrabold text-[#e04b2a]">
                                        <span>{isAr ? 'تنفيذ الخطوة الآن' : 'Execute Step'}</span>
                                        <ArrowRight className={`w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform ${isAr ? 'rotate-180' : ''}`} />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Compact 6-Stage Contracting Pipeline Bar */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1">
                            {NEXUS_LIFECYCLE_STAGES.map(stage => (
                                <button
                                    key={stage.id}
                                    type="button"
                                    onClick={() => navigate(stage.path)}
                                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 hover:bg-[#192631] text-slate-800 dark:text-slate-200 hover:text-white border border-slate-200/70 dark:border-slate-800 transition-all text-start group"
                                >
                                    <div className="flex items-center justify-between gap-1 mb-1">
                                        <span className="text-[10px] font-black text-[#e04b2a] font-mono">
                                            0{stage.stepNumber}
                                        </span>
                                        <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
                                            {stage.badge}
                                        </span>
                                    </div>
                                    <div className="text-xs font-extrabold truncate">
                                        {isAr ? stage.titleAr : stage.titleEn}
                                    </div>
                                    <div className="text-[10px] opacity-65 truncate mt-0.5">
                                        {isAr ? stage.ownerRoleAr : stage.ownerRoleEn}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* 4. INTEGRATED 6-MODULE QUICK-ACCESS BENTO GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {[
                    {
                        title: 'RIBA 1–5 Proposals & 5-Gate VO Hub',
                        subtitle: 'Fee calculator · Digital client signature pad · 4-Doc Pre-Contract Gate · Auto-VO Shield',
                        metric: 'RIBA Stages 1–5',
                        badge: '5-Gate Engine',
                        icon: FileSignature,
                        accent: 'text-[#e04b2a]',
                        bg: 'bg-[#e04b2a]/10 border-[#e04b2a]/25',
                        to: '/proposals',
                    },
                    {
                        title: 'BOQ & R02 Tendering Engine',
                        subtitle: '34 Work Packages · 839 Sub-Items · Eng. Pierre 11-Component Unit Breakdown & Overheads',
                        metric: '34 Pkgs · 839 Items',
                        badge: 'R02 Baseline',
                        icon: Calculator,
                        accent: 'text-indigo-600 dark:text-indigo-400',
                        bg: 'bg-indigo-500/10 border-indigo-500/25',
                        to: '/boq',
                    },
                    {
                        title: 'Document Control & 51 Submittals',
                        subtitle: 'MS / DR / MIR / SL / SIR Register · Consultant Email Transmittals · Standard File Coding',
                        metric: '51 Clauses',
                        badge: '01.TDC · 02.DC',
                        icon: FileCheck2,
                        accent: 'text-amber-600 dark:text-amber-400',
                        bg: 'bg-amber-500/10 border-amber-500/25',
                        to: '/submittals',
                    },
                    {
                        title: 'Procurement, OCR & 4 Warehouses',
                        subtitle: 'Submittal-Gated POs (Code A/B) · WhatsApp Bill OCR · Ring Road 1 & 2, Nozha HQ & Site Custody',
                        metric: '4 Locations',
                        badge: 'NPO · PR · POP',
                        icon: PackageCheck,
                        accent: 'text-emerald-600 dark:text-emerald-400',
                        bg: 'bg-emerald-500/10 border-emerald-500/25',
                        to: '/procurement',
                    },
                    {
                        title: 'Works Extracts & Client Ledger',
                        subtitle: 'C096 Extract #4 (164,896 EGP) · Michael Saber Statement (107,048 EGP) · Payment Request #4',
                        metric: 'EGP 164,896.00',
                        badge: 'PDF 1–3 Live',
                        icon: Receipt,
                        accent: 'text-[#e04b2a]',
                        bg: 'bg-[#e04b2a]/10 border-[#e04b2a]/25',
                        to: '/extracts',
                    },
                    {
                        title: '56 Subcontractors & Field GPS',
                        subtitle: 'CEO 4-Pillar A/B/C Rating · CPO/ST Statements · Live GPS Staff Whereabouts & 21→20 Cycle',
                        metric: '56 Subs · 16 Staff',
                        badge: 'CPO · ST · GPS',
                        icon: HardHat,
                        accent: 'text-sky-600 dark:text-sky-400',
                        bg: 'bg-sky-500/10 border-sky-500/25',
                        to: '/subcontractors',
                    },
                ].map((card) => {
                    const Icon = card.icon;
                    return (
                        <button
                            key={card.to}
                            type="button"
                            onClick={() => navigate(card.to)}
                            className="mitrixo-card p-4 text-start group flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex items-center justify-between gap-2 mb-2.5">
                                    <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${card.bg} ${card.accent}`}>
                                        <Icon className="w-4 h-4" />
                                    </div>
                                    <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
                                        {card.badge}
                                        <ArrowUpRight className="w-3 h-3 text-[#e04b2a] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                    </span>
                                </div>
                                <h3 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-[#e04b2a] transition-colors">
                                    {card.title}
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed line-clamp-2">
                                    {card.subtitle}
                                </p>
                            </div>
                            <div className="mt-3.5 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Live Status</span>
                                <span className={`text-xs font-black font-mono ${card.accent}`}>{card.metric}</span>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* 5. TOGGLE FOR DETAILED TELEMETRY, DESKTOP TRACKERS & NVR CAMERAS */}
            {viewComplexity === 'guided' && (
                <div className="mitrixo-card p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                        <Layers className="w-4 h-4 text-[#e04b2a] shrink-0" />
                        <div>
                            <p className="text-xs font-black text-slate-900 dark:text-white">
                                {isAr
                                    ? 'متابعة المهندسين اللحظية، تحليل البرامج الهندسية وكاميرات المكتب'
                                    : 'Live Desktop Tracker Telemetry, CAD/BIM App Breakdown & Admin Controls'}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                {isAr
                                    ? 'إظهار أو إخفاء جداول التتبع المباشر وإعدادات النظام.'
                                    : 'Expand to inspect real-time engineer windows, CAD/BIM deep-work ratios, and NVR feeds.'}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowDetailedCharts(prev => !prev)}
                        className="px-3.5 py-2 rounded-xl bg-[#192631] hover:bg-[#e04b2a] text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shrink-0"
                    >
                        <span>
                            {showDetailedCharts
                                ? (isAr ? 'إخفاء التفاصيل' : 'Hide Telemetry & Admin')
                                : (isAr ? 'إظهار التفاصيل' : 'Show Telemetry & Admin')}
                        </span>
                        {showDetailedCharts ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                </div>
            )}

            {(viewComplexity === 'full' || showDetailedCharts) && (
                <div className="space-y-5">
                    <LiveOperationsMonitor />

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* Recent Activity */}
                        <motion.div variants={itemVariants} className="lg:col-span-2 mitrixo-card p-5 flex flex-col">
                            <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-emerald-500" />
                                    <EditableText
                                        settingKey="dashboard_recent_updates_title"
                                        defaultText="Live Team Activity"
                                        as="span"
                                    />
                                </h3>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full font-mono">
                                    Real-time Stream
                                </span>
                            </div>

                            <div className="space-y-3 flex-1">
                                {recentEntries.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                                        <Activity className="w-8 h-8 mb-2 opacity-30" />
                                        <p className="text-xs font-medium">No activity recorded yet</p>
                                    </div>
                                ) : (
                                    recentEntries.map(entry => {
                                        const project = projects.find(p => p.id === entry.projectId);
                                        const engineer = engineers.find(e => e.id === entry.engineerId);

                                        return (
                                            <div key={entry.id} className="flex gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 p-3 rounded-xl transition-all border border-slate-100 dark:border-slate-800/70">
                                                <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-[#e04b2a]/10 text-[#e04b2a] flex items-center justify-center font-black text-xs border border-[#e04b2a]/20">
                                                    {engineer?.name?.charAt(0) || '?'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-0.5">
                                                        <p className="text-xs font-black text-slate-900 dark:text-white truncate pr-2">
                                                            {engineer?.name} <span className="text-slate-400 mx-1">•</span> <span className="text-[#e04b2a]">{project?.name}</span>
                                                        </p>
                                                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md font-mono">
                                                            +{entry.timeSpent.toFixed(1)}h
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1">"{entry.taskDescription}"</p>
                                                    <div className="flex items-center gap-2 mt-1.5 text-[10px] font-bold text-slate-400 uppercase font-mono">
                                                        <Clock className="w-3 h-3" />
                                                        <span>{format(new Date(entry.date), 'MMM d, HH:mm')}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </motion.div>

                        {/* Side Analytics Column */}
                        <motion.div variants={itemVariants} className="space-y-4">
                            <div className="mitrixo-card p-5">
                                <h3 className="font-black text-slate-900 dark:text-white text-sm mb-3 flex items-center gap-2">
                                    <Briefcase className="w-4 h-4 text-[#e04b2a]" />
                                    <span>Current Active Projects</span>
                                </h3>
                                <div className="space-y-2">
                                    {projects.slice(0, 4).map(p => (
                                        <div
                                            key={p.id}
                                            onClick={() => navigate(`/projects/${p.id}`)}
                                            className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800 rounded-xl transition-all cursor-pointer"
                                        >
                                            <EditableText
                                                defaultText={p.name}
                                                as="span"
                                                className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate"
                                                onSave={async (newName) => {
                                                    await updateProject({ ...p, name: newName });
                                                }}
                                            />
                                            <span className="text-[10px] font-black text-[#e04b2a] uppercase bg-[#e04b2a]/10 px-2 py-0.5 rounded-full">
                                                Active
                                            </span>
                                        </div>
                                    ))}
                                    {projects.length === 0 && <p className="text-xs text-slate-500 italic">No projects tracked.</p>}
                                </div>
                            </div>

                            <div className="mitrixo-card p-5">
                                <h3 className="font-black text-slate-900 dark:text-white text-sm mb-3 flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-indigo-500" />
                                    <span>CAD / BIM App Time Breakdown</span>
                                </h3>
                                <div className="space-y-3">
                                    {(() => {
                                        const total = weeklyAppStats.deepWorkHours + weeklyAppStats.commsHours + weeklyAppStats.adminHours + weeklyAppStats.otherHours;
                                        if (total === 0) return <p className="text-xs text-slate-500 italic">No desktop tracker logs this week.</p>;

                                        const items = [
                                            { label: 'Deep Work (CAD/BIM)', hours: weeklyAppStats.deepWorkHours, color: 'bg-indigo-500' },
                                            { label: 'Communication', hours: weeklyAppStats.commsHours, color: 'bg-emerald-500' },
                                            { label: 'Admin & Docs', hours: weeklyAppStats.adminHours, color: 'bg-amber-500' },
                                            { label: 'Other', hours: weeklyAppStats.otherHours, color: 'bg-slate-500' },
                                        ];

                                        return items.map(item => (
                                            <div key={item.label}>
                                                <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                                                    <span>{item.label}</span>
                                                    <span>{Math.round((item.hours / total) * 100)}% ({item.hours.toFixed(1)}h)</span>
                                                </div>
                                                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                                    <div className={`${item.color} h-full rounded-full`} style={{ width: `${(item.hours / total) * 100}%` }} />
                                                </div>
                                            </div>
                                        ));
                                    })()}
                                </div>
                            </div>

                            <div className="mitrixo-card p-5">
                                <h3 className="font-black text-rose-600 dark:text-rose-400 text-sm mb-2 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    <span>Health & Wellbeing</span>
                                </h3>
                                <div className="space-y-2">
                                    {(() => {
                                        const alerts = [];
                                        const uniqueTitles = new Set((appUsageLogs || []).filter(l => new Date(l.timestamp) >= startOfWeek).map(l => l.activeWindow)).size;
                                        const totalHoursWeek = weeklyAppStats.activeHours + weeklyAppStats.nonWorkHours;
                                        const contextSwitchingRate = uniqueTitles / Math.max(1, totalHoursWeek);

                                        if (contextSwitchingRate > 30) {
                                            alerts.push({ label: 'High Fragility', desc: 'Frequent context-switching detected.', color: 'text-amber-600' });
                                        }

                                        const lateLogs = (appUsageLogs || []).filter(l => {
                                            const hour = new Date(l.timestamp).getHours();
                                            return hour >= 21 || hour <= 4;
                                        }).length;

                                        if (lateLogs > 50) {
                                            alerts.push({ label: 'Circadian Risk', desc: 'Sustained late-night operations.', color: 'text-rose-600' });
                                        }

                                        if (alerts.length === 0) return <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Cognitive health is optimal.</p>;

                                        return alerts.map(alert => (
                                            <div key={alert.label} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                                                <div className="flex justify-between items-center mb-0.5">
                                                    <span className={`text-[10px] font-black uppercase ${alert.color}`}>{alert.label}</span>
                                                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                                                </div>
                                                <p className="text-xs text-slate-600 dark:text-slate-300">{alert.desc}</p>
                                            </div>
                                        ));
                                    })()}
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Office Cameras */}
                    {role === 'admin' && (
                        <motion.div variants={itemVariants} className="mitrixo-card p-5 relative overflow-hidden">
                            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                                <div>
                                    <h3 className="font-black text-slate-900 dark:text-white text-sm flex items-center gap-2">
                                        <Camera className="w-4 h-4 text-[#e04b2a]" />
                                        <span>Office NVR Camera Gateway</span>
                                    </h3>
                                    <p className="text-xs text-slate-500">Live feed from the local office NVR box on the same network.</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        placeholder="NVR IP (e.g., 192.168.1.100)"
                                        className="border text-xs px-3 py-1.5 rounded-lg w-44 font-mono"
                                        id="nvr-ip-input"
                                        defaultValue="192.168."
                                    />
                                    <button
                                        onClick={() => {
                                            const ip = (document.getElementById('nvr-ip-input') as HTMLInputElement).value;
                                            if (ip && ip !== '192.168.') {
                                                const iframe = document.getElementById('wisenet-iframe') as HTMLIFrameElement;
                                                iframe.src = `http://${ip}/`;
                                                const overlay = document.getElementById('camera-setup-overlay');
                                                if (overlay) overlay.style.display = 'none';
                                            } else {
                                                toast.error('Please enter a valid local IP address.');
                                            }
                                        }}
                                        className="bg-[#e04b2a] hover:bg-[#c93f20] text-white font-bold text-xs py-1.5 px-3.5 rounded-lg transition-colors"
                                    >
                                        Load NVR
                                    </button>
                                </div>
                            </div>

                            <div className="w-full bg-slate-950 bim-canvas-dark rounded-xl border border-slate-800 relative overflow-hidden flex flex-col items-center justify-center min-h-[260px]">
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-900/90 z-10" id="camera-setup-overlay">
                                    <Camera className="w-8 h-8 text-[#e04b2a] mb-2" />
                                    <h4 className="text-sm font-black text-white mb-1">Connect via Local Office IP</h4>
                                    <p className="text-xs text-slate-300 max-w-md">
                                        Enter the Local IP Address of the XRN-1610SA NVR box (e.g., <code>192.168.1.100</code>) above and click Load NVR.
                                    </p>
                                </div>
                                <iframe
                                    id="wisenet-iframe"
                                    className="w-full h-full absolute inset-0 border-0 z-0 bg-white"
                                    sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                                    title="Wisenet Camera Viewer"
                                />
                            </div>
                        </motion.div>
                    )}

                    {/* Admin Controls */}
                    {role === 'admin' && (
                        <motion.div variants={itemVariants} className="mitrixo-card p-5">
                            <h3 className="font-black text-slate-900 dark:text-white text-sm mb-4 flex items-center gap-2">
                                <Settings className="w-4 h-4 text-[#e04b2a]" />
                                <span>System & Tracker Administration</span>
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800">
                                    <h4 className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1">Set Weekly Hours Target</h4>
                                    <p className="text-xs text-slate-500 mb-3">Adjust the expected working hours per week across the engineering team.</p>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="number"
                                            value={targetHours}
                                            onChange={(e) => updateTargetHours(Math.max(1, parseInt(e.target.value) || 100))}
                                            className="w-28 px-3 py-2 border rounded-xl text-lg font-black text-center"
                                            min="1"
                                        />
                                        <span className="text-xs font-bold text-slate-500 uppercase">hrs / week</span>
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-rose-500/20">
                                    <h4 className="text-xs font-black text-rose-600 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                        <Trash2 className="w-3.5 h-3.5" /> Clear Monthly Logs
                                    </h4>
                                    <p className="text-xs text-slate-500 mb-3">
                                        Wipes logged time and tasks for a fresh cycle. Projects, engineers, and files are preserved.
                                    </p>
                                    {clearSuccess ? (
                                        <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
                                            <CheckCircle2 className="w-4 h-4" />
                                            System data cleared!
                                        </div>
                                    ) : (
                                        <GlowButton
                                            variant="danger"
                                            icon={Trash2}
                                            onClick={handleClearData}
                                            loading={isClearing}
                                        >
                                            Clear System Data
                                        </GlowButton>
                                    )}
                                </div>
                            </div>

                            {/* Remote Tracker Updater */}
                            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 mt-4">
                                <h4 className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                    <UploadCloud className="w-4 h-4 text-[#e04b2a]" />
                                    Desktop Tracker Version Control
                                </h4>
                                <div className="flex flex-col md:flex-row items-end gap-3">
                                    <div className="flex-1 w-full">
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-mono">New Version</label>
                                        <input
                                            type="text"
                                            value={trackerVersion}
                                            onChange={e => setTrackerVersion(e.target.value)}
                                            placeholder="e.g. 1.0.1"
                                            className="w-full font-mono text-xs border rounded-xl px-3 py-2"
                                        />
                                    </div>
                                    <div className="flex-[2] w-full">
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-mono">Executable URL (.exe)</label>
                                        <input
                                            type="text"
                                            value={trackerUrl}
                                            onChange={e => setTrackerUrl(e.target.value)}
                                            placeholder="https://..."
                                            className="w-full font-mono text-xs border rounded-xl px-3 py-2"
                                        />
                                    </div>
                                    <GlowButton
                                        variant="primary"
                                        icon={UploadCloud}
                                        onClick={handleDeployTracker}
                                        loading={isUpdatingTracker}
                                    >
                                        Push Update
                                    </GlowButton>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            )}
        </motion.div>
    );
};
