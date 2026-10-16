
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { supabase } from '../lib/supabase';
import { FolderKanban, Users, Clock, TrendingUp, Activity, Briefcase, Settings, Trash2, CheckCircle2, AlertCircle, Camera, UploadCloud, Receipt, Calculator, FileCheck2, PackageCheck, Wallet, HardHat, ArrowUpRight, Compass, ArrowRight, ChevronDown, ChevronUp, ShieldCheck, Truck, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { format, startOfWeek as getStartOfWeek } from 'date-fns';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useWorkflow, NEXUS_LIFECYCLE_STAGES } from '../context/WorkflowContext';
import type { WorkflowPersona } from '../context/WorkflowContext';
import { useLanguage } from '../context/LanguageContext';
import { categorizeApp } from '../utils/appCategorization';
import { GlowButton } from '../components/GlowButton';
import { EditableText } from '../components/EditableText';
import { LiveOperationsMonitor } from '../components/LiveOperationsMonitor';
import { SystemHint } from '../components/SystemHint';

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
        whatToDoEn: string;
        whatToDoAr: string;
        whyItMattersEn: string;
        whyItMattersAr: string;
        route: string;
    }[];
}

const PERSONA_COMMAND_CONFIGS: PersonaConfig[] = [
    {
        id: 'ceo',
        labelEn: 'CEO / Executive',
        labelAr: 'الإدارة التنفيذية (CEO)',
        subtitleEn: 'Eng. Mohamed — Approve pricing discounts, subcontractor grades & liquidity',
        subtitleAr: 'م. محمد — اعتماد نسب الخصم وتقييم مقاولي الباطن ومتابعة السيولة',
        icon: ShieldCheck,
        steps: [
            {
                stepNumber: 1,
                badgeEn: 'Stage 1 · BOQ & Pricing',
                badgeAr: 'مرحلة 1 · المقايسة والتسعير',
                titleEn: 'Approve R02 Contract Pricing & Commercial Discount',
                titleAr: 'اعتماد تسعير مقايسة R02 ونسبة الخصم التجاري',
                whatToDoEn: 'Review the 34 work packages (839 R02 items), inspect unit cost margins, and approve the final contract discount.',
                whatToDoAr: 'مراجعة الـ 34 حزمة أعمال (839 بند R02) وفحص هوامش الربح واعتماد نسبة الخصم النهائية للعميل.',
                whyItMattersEn: 'Locks the official contract baseline so no unapproved cost overruns can occur.',
                whyItMattersAr: 'يثبت خط الأساس التعاقدي الرسمي ويمنع أي تجاوز في التكاليف المعتمدة.',
                route: '/boq',
            },
            {
                stepNumber: 2,
                badgeEn: 'Stage 4 · Site & Subs',
                badgeAr: 'مرحلة 4 · مقاولي الباطن',
                titleEn: 'Audit 4-Pillar Subcontractor Grades (A/B/C) & CPOs',
                titleAr: 'مراجعة تقييم الـ 56 مقاول باطن (A/B/C) والمستخلصات',
                whatToDoEn: 'Evaluate Quality, Pricing, Commitment & Dealing grades across 56 trades and sign off on ST/CPO statements.',
                whatToDoAr: 'فحص تقييم الجودة والسعر والالتزام والتعامل لـ 56 مقاول باطن واعتماد مستخلصات الصنايعية (ST/CPO).',
                whyItMattersEn: 'Ensures only top-graded trades execute site works and prevents overpaying subcontractors.',
                whyItMattersAr: 'يضمن إسناد الأعمال لأكفأ الصنايعية ويمنع صرف أي دفعات بدون استلام هندسي.',
                route: '/subcontractors',
            },
            {
                stepNumber: 3,
                badgeEn: 'Stage 6 · Treasury & Cashflow',
                badgeAr: 'مرحلة 6 · الخزينة والسيولة',
                titleEn: 'Monitor EGP 738,284 Liquidity & 77-Project Margins',
                titleAr: 'متابعة السيولة المتاحة (738,284 ج.م) وربحية المشاريع',
                whatToDoEn: 'Check live balances across 7 cash/bank vaults, 9 credit cards, and net receivables across active projects.',
                whatToDoAr: 'مراجعة الأرصدة اللحظية في 7 خزن وبنوك و9 كروت ائتمان وصافي مستحقات المشاريع الجارية.',
                whyItMattersEn: 'Keeps cashflow positive by aligning supplier disbursements with client collections.',
                whyItMattersAr: 'يحافظ على التدفق النقدي الإيجابي عبر ربط المدفوعات بتحصيل دفعات العملاء.',
                route: '/financials',
            },
        ],
    },
    {
        id: 'technical',
        labelEn: 'Technical Office',
        labelAr: 'المكتب الفني',
        subtitleEn: 'Eng. Pierre Afifi — Price R02 BOQ, submit MS/DR approvals & prepare Works Extracts',
        subtitleAr: 'م. بيير عفيفي — تسعير مقايسة R02 وتقديم اعتمادات MS/DR وإعداد المستخلصات',
        icon: Calculator,
        steps: [
            {
                stepNumber: 1,
                badgeEn: 'Stage 1 · BOQ Engine',
                badgeAr: 'مرحلة 1 · تسعير المقايسة',
                titleEn: 'Complete 11-Component Unit Cost Breakdown (R02)',
                titleAr: 'إدخال تحليل أسعار الوحدة (11 مكون) لبنود R02',
                whatToDoEn: 'Break down materials, wastage, labor, equipment, and overheads across the 839 BOQ sub-items.',
                whatToDoAr: 'تحليل تكلفة الخامات والهالك والمصنعيات والمعدات والمصاريف غير المباشرة لـ 839 بند.',
                whyItMattersEn: 'Sets the exact budget ceiling for site execution and material procurement.',
                whyItMattersAr: 'يحدد السقف المالي الدقيق للمشتريات والتنفيذ بالموقع.',
                route: '/boq',
            },
            {
                stepNumber: 2,
                badgeEn: 'Stage 2 · Document Control',
                badgeAr: 'مرحلة 2 · الاعتمادات الفنية',
                titleEn: 'Submit MS / DR / MIR & Secure Code A or B',
                titleAr: 'تقديم اعتمادات الخامات والرسومات والحصول على كود A/B',
                whatToDoEn: 'Log the 51 technical submittals with standard file coding (01.TDC / 02.DC / 03.TC) and track consultant responses.',
                whatToDoAr: 'تسجيل الـ 51 اعتماد فني بالتكويد القياسي ومتابعة رد الاستشاري للحصول على كود A أو B.',
                whyItMattersEn: 'Unlocking purchasing requires an approved Code A or Code B submittal first.',
                whyItMattersAr: 'لا يمكن إصدار أمر شراء لأي خامة قبل اعتمادها رسمياً بكود A أو B.',
                route: '/submittals',
            },
            {
                stepNumber: 3,
                badgeEn: 'Stage 5 · Works Extracts',
                badgeAr: 'مرحلة 5 · مستخلصات الأعمال',
                titleEn: 'Prepare Cumulative Client Works Extract #4',
                titleAr: 'إعداد المستخلص الجاري التراكمي للعميل',
                whatToDoEn: 'Update current executed quantities and achievement percentages (75%–100%) to generate the client extract.',
                whatToDoAr: 'تحديث الكميات المنفذة الحالية ونسب الصرف (75%–100%) لإصدار المستخلص الجاري للعميل.',
                whyItMattersEn: 'Translates physical site completion directly into billable client revenue.',
                whyItMattersAr: 'يحول نسب الإنجاز الميداني إلى مستحقات مالية جاهزة للتحصيل.',
                route: '/extracts',
            },
        ],
    },
    {
        id: 'accounting',
        labelEn: 'Accounting & Finance',
        labelAr: 'الحسابات والمالية',
        subtitleEn: 'Merna Maged — Issue Payment Requests PR, attach POP & reconcile 80 client ledgers',
        subtitleAr: 'أ. ميرنا ماجد — إصدار طلبات الصرف PR وإرفاق POP ومطابقة 80 حساب عميل',
        icon: Receipt,
        steps: [
            {
                stepNumber: 1,
                badgeEn: 'Stage 3 · NPO ➔ PR ➔ POP',
                badgeAr: 'مرحلة 3 · دورة الصرف',
                titleEn: 'Convert Approved POs to Payment Requests (PR) & Attach POP',
                titleAr: 'تحويل أوامر الشراء لطلبات صرف (PR) وإرفاق إثبات الدفع (POP)',
                whatToDoEn: 'Verify Submittal-gated NPOs, issue official Payment Requests, and attach bank transfer POP receipts.',
                whatToDoAr: 'مراجعة أوامر الشراء المعتمدة وإصدار طلب الصرف (PR) ورفع إيصال التحويل البنكي (POP).',
                whyItMattersEn: 'Enforces strict 3-way financial control before any transfer leaves company accounts.',
                whyItMattersAr: 'يطبق الرقابة الثلاثية الصارمة قبل خروج أي مبالغ من حسابات الشركة.',
                route: '/procurement',
            },
            {
                stepNumber: 2,
                badgeEn: 'Stage 5 · Client Ledgers',
                badgeAr: 'مرحلة 5 · حسابات العملاء',
                titleEn: 'Reconcile 80 Client Account Statements & Extract Billings',
                titleAr: 'مطابقة كشوف حسابات الـ 80 عميل والدفعات المحصلة',
                whatToDoEn: 'Audit customer bank transfers, opening balances, and contract debits (e.g. C096 statement of 107,048 EGP).',
                whatToDoAr: 'مراجعة تحويلات العملاء والأرصدة الافتتاحية ومديونيات المستخلصات (مثل حساب C096 بقيمة 107,048 ج.م).',
                whyItMattersEn: 'Keeps all 80 client statements 100% reconciled and ready for instant PDF export.',
                whyItMattersAr: 'يضمن دقة ومطابقة جميع كشوف حسابات العملاء وجاهزيتها للطباعة الفورية.',
                route: '/extracts',
            },
            {
                stepNumber: 3,
                badgeEn: 'Stage 6 · Vaults & Cards',
                badgeAr: 'مرحلة 6 · الخزن والكروت',
                titleEn: 'Settle 7 Cash/Bank Vaults & 9 Credit Card Installments',
                titleAr: 'تسوية أرصدة الـ 7 خزن والبنوك وأقساط الـ 9 كروت ائتمان',
                whatToDoEn: 'Record daily custody movements (254,833.88 EGP cash/banks) and track unused card limits (483,450.31 EGP).',
                whatToDoAr: 'تسجيل حركات العهدة والبنوك (254,833.88 ج.م) ومتابعة الحدود المتاحة لكروت الائتمان (483,450.31 ج.م).',
                whyItMattersEn: 'Prevents credit card late fees and maintains accurate daily treasury reporting.',
                whyItMattersAr: 'يمنع غرامات التأخير البنكية ويوفر تقرير سيولة يومي دقيق للإدارة.',
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
                whatToDoEn: 'Log stock in/out across Ring Road 1 & 2, Nozha HQ Store, and Active Site Custody.',
                whatToDoAr: 'تسجيل حركات الاستلام والصرف في مخزن الدائري 1 و2 ومخزن النزهة الرئيسي وعهد المواقع.',
                whyItMattersEn: 'Stops duplicate buying of materials already available in company stores.',
                whyItMattersAr: 'يمنع تكرار شراء خامات متوفرة بالفعل في مخازن الشركة.',
                route: '/procurement',
            },
            {
                stepNumber: 2,
                badgeEn: 'Stage 3 · Fleet & OCR',
                badgeAr: 'مرحلة 3 · الأسطول والفواتير',
                titleEn: 'Scan Local Hardware (Mawan) Bills & Dispatch Fleet',
                titleAr: 'مسح فواتير الموانين بالذكاء الاصطناعي وتشغيل النقل',
                whatToDoEn: 'Digitize handwritten site receipts via OCR and dispatch company cars, Uber Bike, or Dababa/Jumbo trucks.',
                whatToDoAr: 'مسح الفواتير اليدوية بالـ OCR وتوجيه سيارات الشركة أو أوبر بايك أو الدبابة/الجامبو للمواقع.',
                whyItMattersEn: 'Captures every petty-cash hardware purchase and optimizes Cairo transport routes.',
                whyItMattersAr: 'يوثق كافة مشتريات العهدة النقدية ويرشد تكاليف الشحن والنقل اليومية.',
                route: '/procurement',
            },
            {
                stepNumber: 3,
                badgeEn: 'Field GPS · 21→20 Cycle',
                badgeAr: 'بصمة GPS · دورة 21←20',
                titleEn: 'Verify Field GPS Check-Ins & Site Transfers',
                titleAr: 'متابعة بصمة الـ GPS الميدانية وتحركات فرق المواقع',
                whatToDoEn: 'Monitor live GPS coordinates for 16 engineers/staff and confirm daily site attendance.',
                whatToDoAr: 'مراجعة مواقع الـ GPS اللحظية لـ 16 مهندس وموظف وتأكيد الحضور الميداني بالمواقع.',
                whyItMattersEn: 'Verifies on-site presence and feeds directly into the 21st-to-20th payroll cycle.',
                whyItMattersAr: 'يؤكد التواجد الفعلي بالمواقع ويغذي مسير الرواتب الشهري (دورة 21 إلى 20) تلقائياً.',
                route: '/attendance',
            },
        ],
    },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};
const itemVariants: any = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: "easeOut"
        }
    }
};


export const Dashboard = () => {
    const navigate = useNavigate();
    const { projects, engineers, entries, clearMonthlyData, appUsageLogs, updateProject, globalSettings, updateGlobalSetting } = useData();
    const { role } = useAuth();
    const { activeProject, activePersona, setActivePersona, viewComplexity, toggleViewComplexity } = useWorkflow();
    const { language } = useLanguage();
    const isAr = language === 'ar';

    // Configurable target hours (Supabase app_settings with localStorage fallback)
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

    const selectedPersonaConfig = PERSONA_COMMAND_CONFIGS.find(p => p.id === activePersona) || PERSONA_COMMAND_CONFIGS[0];

    useEffect(() => {
        if (globalSettings['tracker_version']) setTrackerVersion(globalSettings['tracker_version']);
        if (globalSettings['tracker_update_url']) setTrackerUrl(globalSettings['tracker_update_url']);
    }, [globalSettings]);

    // Load target hours from Supabase on mount
    useEffect(() => {
        (async () => {
            try {
                const { data } = await supabase.from('app_settings').select('value').eq('key', 'target_hours').maybeSingle();
                if (data?.value) {
                    const val = parseInt(data.value);
                    if (!isNaN(val)) setTargetHours(val);
                }
            } catch { /* table may not exist yet, use localStorage fallback */ }
        })();
    }, []);

    const updateTargetHours = async (val: number) => {
        setTargetHours(val);
        localStorage.setItem('dec_target_hours', val.toString());
        // Persist to Supabase (ignore errors if table doesn't exist yet)
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

    // Filter entries: Everyone sees all for stats and overview
    const filteredEntries = entries;

    const totalAppStats = calculateAppUsageStats(appUsageLogs || []);
    const startOfWeek = getStartOfWeek(new Date(), { weekStartsOn: 0 });
    const weeklyAppStats = calculateAppUsageStats(appUsageLogs || [], startOfWeek);

    // Calculate Metrics
    const totalHours = filteredEntries.reduce((sum, e) => sum + e.timeSpent, 0) + totalAppStats.activeHours;

    const weeklyHours = filteredEntries
        .filter(e => new Date(e.date) >= startOfWeek)
        .reduce((sum, e) => sum + e.timeSpent, 0) + weeklyAppStats.activeHours;

    // Active Projects (projects with entries in last 30 days)
    const thirtyDaysAgo = new Date(new Date().setDate(new Date().getDate() - 30));
    const activeProjectIds = new Set(
        filteredEntries
            .filter(e => new Date(e.date) >= thirtyDaysAgo)
            .map(e => e.projectId)
    );
    const activeProjectsCount = activeProjectIds.size;

    // Recent Activity
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
            toast.error("Version is required.");
            return;
        }
        setIsUpdatingTracker(true);
        await updateGlobalSetting('tracker_version', trackerVersion);
        await updateGlobalSetting('tracker_update_url', trackerUrl || 'https://github.com');
        setIsUpdatingTracker(false);
        toast.success("Tracker update deployed! Trackers should auto-update shortly.");
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4 md:space-y-8"
        >
            <div className="text-center md:text-start mb-3 md:mb-6 relative">
                <EditableText
                    settingKey="dashboard_main_title"
                    defaultText={isAr ? 'لوحة القيادة التنفيذية' : 'Insight Dashboard'}
                    as="h2"
                    className="text-2xl md:text-4xl lg:text-5xl font-black text-[#192631] tracking-tighter mb-1 md:mb-2 inline-block relative pe-6"
                />
                <div className="h-1 w-16 md:w-20 bg-orange-500 rounded-full mb-1.5 md:mb-4 md:mx-0 mx-auto mt-1.5"></div>
                <EditableText
                    settingKey="dashboard_subtitle"
                    defaultText={
                        isAr
                            ? 'منصة إدارة المشاريع الهندسية والمقاولات المتكاملة'
                            : 'Enterprise Contracting & Milestone Management Platform'
                    }
                    as="p"
                    className="text-[#192631]/60 font-medium tracking-wide text-xs md:text-base inline-block pe-6"
                />
            </div>

            {/* START HERE: Guided Step-by-Step Command Center */}
            <div className="glass-card rounded-2xl sm:rounded-3xl md:rounded-[32px] p-3.5 sm:p-5 md:p-7 border-2 border-[#e04b2a]/25 bg-gradient-to-br from-white/95 via-white/90 to-[#e04b2a]/[0.04] shadow-xl space-y-4 sm:space-y-6">
                {/* Command Center Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4 border-b border-[#192631]/10 pb-3.5 sm:pb-5">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#e04b2a] text-white flex items-center justify-center shadow-lg shadow-[#e04b2a]/25 shrink-0">
                            <Compass className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="px-2 py-0.5 rounded-full bg-[#e04b2a]/15 text-[#e04b2a] text-[10px] font-black uppercase tracking-widest">
                                    {isAr ? 'ابدأ من هنا · دليل التشغيل السريع' : 'Start Here · Guided Command Center'}
                                </span>
                                <span className="px-2 py-0.5 rounded-full bg-[#123524]/10 text-[#123524] text-[10px] font-bold">
                                    {isAr ? '3 خطوات يومية واضحة' : '3 Simple Steps Today'}
                                </span>
                            </div>
                            <h3 className="text-base sm:text-lg md:text-2xl font-black text-[#192631] tracking-tight mt-1 leading-snug">
                                {isAr
                                    ? 'مركز القيادة التوجيهي — اختر دورك ونفّذ خطواتك اليومية بضغطة واحدة'
                                    : 'Start Here: Guided Step-by-Step Command Center'}
                            </h3>
                            <p className="text-xs md:text-sm text-[#192631]/70 mt-0.5 leading-snug">
                                {isAr ? selectedPersonaConfig.subtitleAr : selectedPersonaConfig.subtitleEn}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 self-start lg:self-center">
                        <button
                            type="button"
                            onClick={toggleViewComplexity}
                            className={`px-3 py-2 min-h-[38px] rounded-xl text-xs font-black border transition-all flex items-center gap-2 touch-manipulation ${
                                viewComplexity === 'guided'
                                    ? 'bg-[#123524] text-white border-[#123524] shadow-sm'
                                    : 'bg-white text-[#192631] border-[#192631]/15 hover:border-[#e04b2a]/40'
                            }`}
                        >
                            <Sparkles className="w-3.5 h-3.5 text-[#e04b2a]" />
                            {viewComplexity === 'guided'
                                ? (isAr ? 'الوضع المبسط مفعّل' : 'Guided Mode Active')
                                : (isAr ? 'الوضع التفصيلي الكامل' : 'Full Expert View')}
                        </button>
                    </div>
                </div>

                {/* a) Persona Selector Tabs — 2x2 Compact Grid on iPhone 15 Pro (393px), 4 cols on Desktop */}
                <div>
                    <div className="text-[11px] font-black uppercase tracking-wider text-[#192631]/60 mb-2">
                        {isAr ? '1. اختر دورك الوظيفي (Persona):' : '1. Select Your Role / Persona:'}
                    </div>
                    <div className="grid grid-cols-2 xl:grid-cols-4 gap-2 sm:gap-2.5">
                        {PERSONA_COMMAND_CONFIGS.map((persona) => {
                            const Icon = persona.icon;
                            const isSelected = activePersona === persona.id;
                            return (
                                <button
                                    key={persona.id}
                                    type="button"
                                    onClick={() => setActivePersona(persona.id)}
                                    className={`p-2.5 sm:p-3.5 rounded-2xl border text-start transition-all flex items-start gap-2 sm:gap-3 touch-manipulation ${
                                        isSelected
                                            ? 'bg-[#192631] text-white border-[#192631] shadow-md ring-2 ring-[#e04b2a]/40'
                                            : 'bg-white/85 hover:bg-white text-[#192631] border-[#192631]/12 hover:border-[#e04b2a]/40'
                                    }`}
                                >
                                    <div
                                        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                                            isSelected ? 'bg-[#e04b2a] text-white' : 'bg-[#192631]/[0.07] text-[#192631]'
                                        }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between gap-1">
                                            <span className="text-xs sm:text-sm font-black truncate">
                                                {isAr ? persona.labelAr : persona.labelEn}
                                            </span>
                                            {isSelected && (
                                                <span className="w-2 h-2 rounded-full bg-[#e04b2a] shrink-0" />
                                            )}
                                        </div>
                                        <p
                                            className={`text-[10px] sm:text-[11px] mt-0.5 sm:mt-1 leading-snug line-clamp-2 ${
                                                isSelected ? 'text-white/80' : 'text-[#192631]/65'
                                            }`}
                                        >
                                            {isAr ? persona.subtitleAr : persona.subtitleEn}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* b) "Your 3 Simple Steps Today" Cards */}
                <div>
                    <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2.5">
                        <span className="text-[11px] font-black uppercase tracking-wider text-[#192631]/60">
                            {isAr
                                ? `2. خطواتك الـ 3 البسيطة اليوم (${selectedPersonaConfig.labelAr}):`
                                : `2. Your 3 Simple Steps Today (${selectedPersonaConfig.labelEn}):`}
                        </span>
                        <span className="text-[11px] font-bold text-[#e04b2a] hidden sm:inline">
                            {isAr ? 'اضغط على أي خطوة للتنفيذ المباشر ➔' : 'Click any step to jump straight to execution ➔'}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
                        {selectedPersonaConfig.steps.map((step) => (
                            <div
                                key={step.stepNumber}
                                className="rounded-2xl bg-white border border-[#192631]/12 hover:border-[#e04b2a]/50 p-3.5 sm:p-4 md:p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-center justify-between gap-2 mb-2.5">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#e04b2a] text-white text-xs font-black">
                                            {isAr ? `الخطوة ${step.stepNumber}` : `Step ${step.stepNumber}`}
                                        </span>
                                        <span className="px-2.5 py-1 rounded-full bg-[#192631]/[0.06] text-[#192631]/80 text-[10px] font-bold uppercase tracking-wider truncate">
                                            {isAr ? step.badgeAr : step.badgeEn}
                                        </span>
                                    </div>

                                    <h4 className="text-sm md:text-base font-black text-[#192631] leading-snug mb-2">
                                        {isAr ? step.titleAr : step.titleEn}
                                    </h4>

                                    <div className="space-y-1.5 sm:space-y-2 text-xs">
                                        <div className="p-2.5 rounded-xl bg-[#192631]/[0.04] border border-[#192631]/8">
                                            <span className="font-black text-[#192631] block mb-0.5">
                                                {isAr ? 'ماذا تفعل الآن؟' : 'What to do:'}
                                            </span>
                                            <p className="text-[#192631]/75 leading-relaxed">
                                                {isAr ? step.whatToDoAr : step.whatToDoEn}
                                            </p>
                                        </div>

                                        <div className="p-2.5 rounded-xl bg-[#123524]/[0.06] border border-[#123524]/15">
                                            <span className="font-black text-[#123524] block mb-0.5">
                                                {isAr ? 'لماذا هذه الخطوة مهمة؟' : 'Why it matters:'}
                                            </span>
                                            <p className="text-[#123524]/90 leading-relaxed">
                                                {isAr ? step.whyItMattersAr : step.whyItMattersEn}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => navigate(step.route)}
                                    className="mt-3 sm:mt-4 w-full py-2.5 min-h-[42px] px-4 rounded-xl bg-[#192631] hover:bg-[#e04b2a] active:bg-[#e04b2a] text-white text-xs font-black transition-colors flex items-center justify-center gap-2 shadow-sm touch-manipulation"
                                >
                                    <span>{isAr ? 'نفّذ هذه الخطوة الآن' : 'Do This Step Now'}</span>
                                    <ArrowRight className={`w-3.5 h-3.5 ${isAr ? 'rotate-180' : ''}`} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* c) Active Project 6-Stage Progress Map */}
                <div className="pt-4 border-t border-[#192631]/10">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[11px] font-black uppercase tracking-wider text-[#192631]/60">
                                {isAr ? '3. خريطة مراحل المشروع النشط (6 مراحل):' : '3. Active Project 6-Stage Progress Map:'}
                            </span>
                            {activeProject ? (
                                <span className="px-2.5 py-0.5 rounded-lg bg-[#e04b2a]/12 border border-[#e04b2a]/30 text-[#e04b2a] text-xs font-black">
                                    {activeProject.code} — {activeProject.name} ({activeProject.completionPercent}% {isAr ? 'إنجاز' : 'Complete'})
                                </span>
                            ) : (
                                <span className="px-2.5 py-0.5 rounded-lg bg-[#192631]/10 text-[#192631] text-xs font-black">
                                    {isAr ? 'جميع المشاريع (77 مشروع)' : 'All Projects Portfolio (77 Projects)'}
                                </span>
                            )}
                        </div>
                        {activeProject && (
                            <span className="text-[11px] font-bold text-[#192631]/65 font-mono">
                                {isAr ? 'المستخلصات:' : 'Extracts:'} #{activeProject.extractsCount} · {isAr ? 'قيمة العقد:' : 'Contract:'} EGP {activeProject.contractValue.toLocaleString()}
                            </span>
                        )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                        {NEXUS_LIFECYCLE_STAGES.map((stage) => (
                            <button
                                key={stage.id}
                                type="button"
                                onClick={() => navigate(stage.path)}
                                className="p-3 rounded-2xl bg-white/90 hover:bg-[#192631] text-[#192631] hover:text-white border border-[#192631]/12 hover:border-[#192631] transition-all text-left group/stage flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-center justify-between gap-1 mb-1.5">
                                        <span className="px-2 py-0.5 rounded-md bg-[#e04b2a]/15 group-hover/stage:bg-[#e04b2a] text-[#e04b2a] group-hover/stage:text-white text-[10px] font-black font-mono">
                                            {stage.stepNumber}. {stage.id.toUpperCase()}
                                        </span>
                                        <span className="text-[10px] font-black font-mono px-1.5 py-0.5 rounded bg-[#192631]/[0.06] group-hover/stage:bg-white/15">
                                            {stage.badge}
                                        </span>
                                    </div>
                                    <div className="text-xs font-black leading-snug">
                                        {isAr ? stage.titleAr : stage.titleEn}
                                    </div>
                                    <p className="text-[10px] opacity-70 mt-1 line-clamp-2 leading-relaxed">
                                        {isAr ? stage.shortDescAr : stage.shortDescEn}
                                    </p>
                                </div>
                                <div className="mt-2.5 pt-2 border-t border-current/10 flex items-center justify-between text-[10px] font-bold">
                                    <span className="truncate opacity-75">{isAr ? stage.ownerRoleAr : stage.ownerRoleEn}</span>
                                    <ArrowUpRight className="w-3 h-3 text-[#e04b2a] shrink-0" />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <SystemHint>
                <p><strong>Dashboard:</strong> This is your command center. It acts as a real-time aggregator combining data from the Desktop Trackers (Live Operations & App Time Breakdown) and manual Milestones (Active Projects & Weekly Goals).</p>
                <p>The <strong>Weekly Goal Tracker</strong> is fueled by each engineer's total accumulated tracked hours against their required weekly minimum.</p>
            </SystemHint>

            {/* Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                <div className="glass-card p-3 md:p-8 rounded-2xl md:rounded-[32px] relative overflow-hidden group hover:border-[#e04b2a]/25 hover:-translate-y-1">
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: 'linear-gradient(135deg, rgba(243, 130, 45, 0.05), transparent)' }} />
                    <div className="relative z-10 text-center md:text-left">
                        <div className="w-10 h-10 md:w-14 md:h-14 bg-[#e04b2a]/10 text-[#e04b2a] rounded-2xl flex items-center justify-center mb-2 md:mb-6 shadow-orange-glow group-hover:bg-[#e04b2a]/10 transition-all duration-500">
                            <FolderKanban className="w-5 h-5 md:w-7 md:h-7" />
                        </div>
                        <EditableText
                            settingKey="dashboard_metric_1_label"
                            defaultText="Active Projects"
                            as="p"
                            className="text-[#192631]/60 font-bold uppercase tracking-[0.2em] text-[10px] mb-2 font-mono"
                        />
                        <p className="text-2xl md:text-4xl font-black text-[#192631] font-mono">{activeProjectsCount} <span className="text-sm font-bold text-slate-600">/ {projects.length}</span></p>
                    </div>
                </div>

                <div className="glass-card p-3 md:p-8 rounded-2xl md:rounded-[32px] relative overflow-hidden group hover:border-[#e04b2a]/25 hover:-translate-y-1">
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: 'linear-gradient(135deg, rgba(243, 130, 45, 0.05), transparent)' }} />
                    <div className="relative z-10 text-center md:text-left">
                        <div className="w-10 h-10 md:w-14 md:h-14 bg-orange-400/10 text-[#e04b2a] rounded-2xl flex items-center justify-center mb-2 md:mb-6 shadow-orange-glow group-hover:bg-orange-400/20 transition-all duration-500">
                            <Users className="w-5 h-5 md:w-7 md:h-7" />
                        </div>
                        <EditableText
                            settingKey="dashboard_metric_2_label"
                            defaultText="Team Size"
                            as="p"
                            className="text-[#192631]/60 font-bold uppercase tracking-[0.2em] text-[10px] mb-2 font-mono"
                        />
                        <p className="text-2xl md:text-4xl font-black text-[#192631] font-mono">{engineers.length}</p>
                    </div>
                </div>

                <div className="glass-card p-3 md:p-8 rounded-2xl md:rounded-[32px] relative overflow-hidden group hover:border-[#123524]/25 hover:-translate-y-1">
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05), transparent)' }} />
                    <div className="relative z-10 text-center md:text-left">
                        <div className="w-10 h-10 md:w-14 md:h-14 bg-[#123524]/10 text-[#123524] rounded-2xl flex items-center justify-center mb-2 md:mb-6 shadow-[0_0_20px_rgba(16,185,129,0.1)] group-hover:bg-[#123524]/10 transition-all duration-500">
                            <Clock className="w-5 h-5 md:w-7 md:h-7" />
                        </div>
                        <EditableText
                            settingKey="dashboard_metric_3_label"
                            defaultText="Weekly Hours"
                            as="p"
                            className="text-[#192631]/60 font-bold uppercase tracking-[0.2em] text-[10px] mb-2 font-mono"
                        />
                        <p className="text-2xl md:text-4xl font-black text-[#192631] font-mono">{weeklyHours.toFixed(1)}</p>
                    </div>
                </div>

                <div className="glass-card p-3 md:p-8 rounded-2xl md:rounded-[32px] relative overflow-hidden group hover:border-purple-500/30 hover:-translate-y-1">
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.05), transparent)' }} />
                    <div className="relative z-10 text-center md:text-left">
                        <div className="w-10 h-10 md:w-14 md:h-14 bg-[#192631]/10 text-[#192631] rounded-2xl flex items-center justify-center mb-2 md:mb-6 group-hover:bg-[#e04b2a]/15 group-hover:text-[#e04b2a] transition-all duration-500">
                            <TrendingUp className="w-5 h-5 md:w-7 md:h-7" />
                        </div>
                        <EditableText
                            settingKey="dashboard_metric_4_label"
                            defaultText="All Time Hours"
                            as="p"
                            className="text-[#192631]/60 font-bold uppercase tracking-[0.2em] text-[10px] mb-2 font-mono"
                        />
                        <p className="text-2xl md:text-4xl font-black text-[#192631] font-mono">{totalHours.toFixed(0)} <span className="text-sm font-bold text-slate-600 tracking-normal capitalize">hrs</span></p>
                    </div>
                </div>
            </div>

            {/* Integrated Nexus Contracting & Operations Quick-Access Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
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
                        title: 'BOQ & R02 Tendering Engine',
                        subtitle: '34 Work Packages · 839 Sub-Items · Eng. Pierre 11-Component Unit Breakdown & Overheads',
                        metric: '34 Pkgs · 839 Items',
                        badge: 'R02 Baseline',
                        icon: Calculator,
                        accent: 'text-[#192631]',
                        bg: 'bg-[#192631]/10 border-[#192631]/20',
                        to: '/boq',
                    },
                    {
                        title: 'Document Control & 51 Submittals',
                        subtitle: 'MS / DR / MIR / SL / SIR Register · Consultant Email Transmittals · Standard File Coding',
                        metric: '51 Clauses',
                        badge: '01.TDC · 02.DC · 03.TC',
                        icon: FileCheck2,
                        accent: 'text-[#e04b2a]',
                        bg: 'bg-[#e04b2a]/10 border-[#e04b2a]/25',
                        to: '/submittals',
                    },
                    {
                        title: 'Procurement, OCR & 4 Warehouses',
                        subtitle: 'Submittal-Gated POs (Code A/B) · WhatsApp Bill OCR · Ring Road 1 & 2, Nozha HQ & Site Custody',
                        metric: '4 Locations',
                        badge: 'NPO · PR · POP',
                        icon: PackageCheck,
                        accent: 'text-[#123524]',
                        bg: 'bg-[#123524]/10 border-[#123524]/25',
                        to: '/procurement',
                    },
                    {
                        title: 'Treasury, 7 Credit Cards & Financials',
                        subtitle: 'Cash & Banks: 254,833.88 EGP · Unused Card Limits: 483,450.31 EGP · 46 Active Projects Matrix',
                        metric: 'EGP 738,284.19',
                        badge: 'Spendable Liquidity',
                        icon: Wallet,
                        accent: 'text-[#123524]',
                        bg: 'bg-[#123524]/10 border-[#123524]/25',
                        to: '/financials',
                    },
                    {
                        title: '56 Subcontractors & Field GPS',
                        subtitle: 'CEO 4-Pillar A/B/C Rating · CPO/ST Statements · Live GPS Staff Whereabouts & 21→20 Cycle',
                        metric: '56 Subs · 16 GPS Staff',
                        badge: 'CPO · ST · GPS',
                        icon: HardHat,
                        accent: 'text-[#192631]',
                        bg: 'bg-[#192631]/10 border-[#192631]/20',
                        to: '/subcontractors',
                    },
                ].map((card) => {
                    const Icon = card.icon;
                    return (
                        <button
                            key={card.to}
                            type="button"
                            onClick={() => navigate(card.to)}
                            className="glass-card p-5 rounded-3xl text-left hover:border-[#e04b2a]/40 hover:-translate-y-0.5 transition-all group flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex items-center justify-between gap-2 mb-3">
                                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${card.bg} ${card.accent}`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <span className="px-2.5 py-1 rounded-full bg-[#192631]/[0.06] border border-[#192631]/10 text-[10px] font-bold text-[#192631]/80 uppercase tracking-wider flex items-center gap-1">
                                        {card.badge}
                                        <ArrowUpRight className="w-3 h-3 text-[#e04b2a] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                    </span>
                                </div>
                                <h3 className="text-base font-black text-[#192631] group-hover:text-[#e04b2a] transition-colors">
                                    {card.title}
                                </h3>
                                <p className="text-xs text-[#192631]/70 mt-1 leading-relaxed">
                                    {card.subtitle}
                                </p>
                            </div>
                            <div className="mt-4 pt-3 border-t border-[#192631]/10 flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#192631]/55">Live Status</span>
                                <span className={`text-sm font-black ${card.accent}`}>{card.metric}</span>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Guided Mode Toggle for Detailed Executive Charts */}
            {viewComplexity === 'guided' && (
                <div className="glass-card rounded-2xl p-4 border border-[#192631]/12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white/80">
                    <div>
                        <p className="text-sm font-black text-[#192631]">
                            {isAr
                                ? 'الرسوم البيانية التنفيذية ومتابعة الفرق المباشرة'
                                : 'Detailed Executive Charts, Live Telemetry & Admin Controls'}
                        </p>
                        <p className="text-xs text-[#192631]/65">
                            {isAr
                                ? 'تم طي الجداول التفصيلية لتبسيط الشاشة — يمكنك إظهارها في أي وقت بضغطة واحدة.'
                                : 'Secondary telemetry, desktop tracker charts, and NVR feeds are collapsed in Guided Mode to keep your workspace clean.'}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowDetailedCharts(prev => !prev)}
                        className="px-4 py-2.5 rounded-xl bg-[#192631] hover:bg-[#e04b2a] text-white text-xs font-black transition-colors flex items-center justify-center gap-2 shrink-0"
                    >
                        <span>
                            {showDetailedCharts
                                ? (isAr ? 'إخفاء الرسوم البيانية التفصيلية' : 'Hide Detailed Executive Charts')
                                : (isAr ? 'إظهار الرسوم البيانية التفصيلية' : 'Show Detailed Executive Charts')}
                        </span>
                        {showDetailedCharts ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                </div>
            )}

            {(viewComplexity === 'full' || showDetailedCharts) && (
                <div className="space-y-4 md:space-y-8">
                    {/* Live Operations Central Monitor */}
                    <LiveOperationsMonitor />

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
                {/* Recent Activity */}
                <motion.div variants={itemVariants} className="lg:col-span-2 glass-card rounded-2xl md:rounded-[32px] p-4 md:p-8 relative overflow-hidden group min-h-[200px] md:min-h-[500px]">
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(243, 130, 45, 0.02), transparent)' }} />
                    <div className="relative z-10 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-8 border-b border-[#192631]/10 pb-6">
                            <h3 className="text-xl font-black text-[#192631] tracking-tight flex items-center gap-3">
                                <Activity className="w-6 h-6 text-[#123524]" />
                                <EditableText
                                    settingKey="dashboard_recent_updates_title"
                                    defaultText="Live Team Activity"
                                    as="span"
                                />
                            </h3>
                            <span className="text-[10px] font-bold text-[#192631]/60 uppercase tracking-widest bg-[#192631]/[0.05] px-3 py-1.5 rounded-full border border-[#192631]/10 font-mono">Real-time Stream</span>
                        </div>
                        <p className="text-xs text-[#192631]/60 mb-6 -mt-4 border-l-2 border-[#123524]/25 pl-3">Watch real-time as team members log hours and update project tasks here.</p>

                        <div className="space-y-4 flex-1">
                            {recentEntries.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-slate-600">
                                    <Activity className="w-12 h-12 mb-4 opacity-20" />
                                    <p className="text-sm font-medium">No activity recorded yet</p>
                                </div>
                            ) : (
                                recentEntries.map(entry => {
                                    const project = projects.find(p => p.id === entry.projectId);
                                    const engineer = engineers.find(e => e.id === entry.engineerId);

                                    return (
                                        <div key={entry.id} className="flex gap-4 group/item hover:bg-[#192631]/[0.05] p-4 rounded-2xl transition-all duration-300 border border-transparent hover:border-[#192631]/10">
                                            <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-[#2a2a2a] flex items-center justify-center text-[#192631] font-black text-sm border border-[#192631]/10 shadow-glass relative">
                                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-4 border-[#1a1a1a]"></div>
                                                {engineer?.name?.charAt(0) || '?'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <p className="text-sm font-black text-[#192631] truncate pr-2">
                                                        {engineer?.name} <span className="text-[#192631]/60 font-bold mx-1">•</span> <span className="text-[#e04b2a]">{project?.name}</span>
                                                    </p>
                                                    <span className="text-xs font-bold text-[#123524]/90 whitespace-nowrap bg-emerald-500/5 px-2 py-0.5 rounded-lg border border-emerald-500/10 font-mono">+{entry.timeSpent.toFixed(1)}h</span>
                                                </div>
                                                <p className="text-sm text-[#192631]/70 line-clamp-1 font-medium italic">"{entry.taskDescription}"</p>
                                                <div className="flex items-center gap-3 mt-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest font-mono">
                                                    <Clock className="w-3 h-3" />
                                                    <span>{format(new Date(entry.date), 'MMM d, HH:mm')}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Quick Actions / Side Panel */}
                <motion.div variants={itemVariants} className="space-y-6">
                    <div className="glass-card rounded-2xl md:rounded-[32px] p-4 md:p-8 text-[#192631] shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(243, 130, 45, 0.1), transparent)' }} />
                        <div className="relative z-10">
                            <EditableText
                                settingKey="dashboard_capacity_goal_title"
                                defaultText="Weekly Goal Tracker"
                                as="h3"
                                className="font-black text-lg mb-2 text-[#192631] tracking-tight"
                            />
                            <p className="text-xs text-[#192631]/60 mb-6">Monitor progress towards the weekly required hours target.</p>
                            <div className="flex items-end gap-3 mb-6 font-mono">
                                <span className="text-3xl md:text-5xl font-black text-[#192631]">{weeklyHours.toFixed(0)}</span>
                                <span className="text-slate-600 font-bold mb-2 uppercase tracking-widest text-[10px] md:text-xs">/ {targetHours} hrs</span>
                            </div>
                            <div className="w-full bg-[#192631]/[0.05] rounded-full h-3 mb-6 overflow-hidden border border-[#192631]/10 p-0.5">
                                <div
                                    className="bg-gradient-to-r from-orange-500 to-orange-400 h-full rounded-full transition-all duration-1000 relative"
                                    style={{ width: `${Math.min(100, (weeklyHours / targetHours) * 100)}% ` }}
                                >
                                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                                </div>
                            </div>
                            <p className="text-xs font-bold text-[#192631]/60 uppercase tracking-widest leading-relaxed">
                                {role === 'admin'
                                    ? `Team is at ${Math.round((weeklyHours / targetHours) * 100)}% of objective.`
                                    : `You've achieved ${Math.round((weeklyHours / targetHours) * 100)}% of your target.`}
                            </p>
                        </div>
                    </div>

                    <div className="bg-[#1a1a1a]/40 rounded-2xl md:rounded-[32px] border border-[#192631]/10 p-4 md:p-8 backdrop-blur-3xl relative overflow-hidden group">
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.05), transparent)' }} />
                        <div className="relative z-10">
                            <h3 className="font-black text-[#192631] text-lg mb-6 flex items-center gap-3">
                                <Briefcase className="w-5 h-5 text-[#e04b2a]" />
                                <EditableText
                                    settingKey="dashboard_active_focus_title"
                                    defaultText="Current Projects"
                                    as="span"
                                />
                            </h3>
                            <p className="text-xs text-[#192631]/60 mb-6 -mt-4">Quick list of the most recent active projects.</p>
                            <div className="space-y-4">
                                {projects.slice(0, 4).map(p => (
                                    <div key={p.id} className="flex items-center justify-between p-4 bg-white/0 hover:bg-[#192631]/[0.05] border border-transparent hover:border-[#192631]/10 rounded-2xl transition-all duration-300 cursor-pointer group/status">
                                        <EditableText
                                            defaultText={p.name}
                                            as="span"
                                            className="text-sm font-bold text-[#192631]/70 group-hover/status:text-[#192631] transition-colors"
                                            onSave={async (newName) => {
                                                await updateProject({ ...p, name: newName });
                                            }}
                                        />
                                        <span className="text-[10px] font-black text-[#e04b2a] uppercase tracking-tighter bg-[#e04b2a]/10 px-3 py-1 rounded-full border border-[#e04b2a]/25">Active</span>
                                    </div>
                                ))}
                                {projects.length === 0 && <p className="text-sm font-bold text-slate-600 italic">No projects tracked.</p>}
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#1a1a1a]/40 rounded-2xl md:rounded-[32px] border border-[#192631]/10 p-4 md:p-8 backdrop-blur-3xl relative overflow-hidden group">
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.05), transparent)' }} />
                        <div className="relative z-10">
                            <h3 className="font-black text-[#192631] text-lg mb-6 flex items-center gap-3">
                                <Activity className="w-5 h-5 text-[#192631]" />
                                <EditableText
                                    settingKey="dashboard_software_analytics_title"
                                    defaultText="App Time Breakdown"
                                    as="span"
                                />
                            </h3>
                            <p className="text-xs text-[#192631]/60 mb-6 -mt-4">Understand where time is spent across different desktop apps.</p>
                            <div className="space-y-4">
                                {(() => {
                                    const total = weeklyAppStats.deepWorkHours + weeklyAppStats.commsHours + weeklyAppStats.adminHours + weeklyAppStats.otherHours;
                                    if (total === 0) return <p className="text-sm font-bold text-slate-600 italic">No app data this week.</p>;

                                    const items = [
                                        { label: 'Deep Work', hours: weeklyAppStats.deepWorkHours, color: 'bg-indigo-500' },
                                        { label: 'Comms', hours: weeklyAppStats.commsHours, color: 'bg-emerald-500' },
                                        { label: 'Admin', hours: weeklyAppStats.adminHours, color: 'bg-amber-500' },
                                        { label: 'Other', hours: weeklyAppStats.otherHours, color: 'bg-slate-500' },
                                    ];

                                    return items.map(item => (
                                        <div key={item.label}>
                                            <div className="flex justify-between text-xs font-bold text-[#192631]/70 mb-2">
                                                <span>{item.label}</span>
                                                <span className="text-[#192631]">{Math.round((item.hours / total) * 100)}% <span className="text-[#192631]/60">({item.hours.toFixed(1)}h)</span></span>
                                            </div>
                                            <div className="w-full bg-[#192631]/[0.05] rounded-full h-2 overflow-hidden border border-[#192631]/10">
                                                <div className={`${item.color} h-full rounded-full`} style={{ width: `${(item.hours / total) * 100}%` }}></div>
                                            </div>
                                        </div>
                                    ));
                                })()}
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#1a1a1a]/40 rounded-2xl md:rounded-[32px] border border-[#192631]/10 p-4 md:p-8 backdrop-blur-3xl relative overflow-hidden group">
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.05), transparent)' }} />
                        <div className="relative z-10">
                            <h3 className="font-black text-red-700 text-lg mb-6 flex items-center gap-3">
                                <AlertCircle className="w-5 h-5" />
                                <EditableText
                                    settingKey="dashboard_wellness_fatigue_title"
                                    defaultText="Health & Wellbeing"
                                    as="span"
                                />
                            </h3>
                            <p className="text-xs text-[#192631]/60 mb-6 -mt-4">Automatic alerts for potential burnout or late-night operations.</p>
                            <div className="space-y-4">
                                {(() => {
                                    const alerts = [];
                                    const uniqueTitles = new Set((appUsageLogs || []).filter(l => new Date(l.timestamp) >= startOfWeek).map(l => l.activeWindow)).size;
                                    const totalHoursWeek = weeklyAppStats.activeHours + weeklyAppStats.nonWorkHours;
                                    const contextSwitchingRate = uniqueTitles / Math.max(1, totalHoursWeek);

                                    if (contextSwitchingRate > 30) {
                                        alerts.push({ label: 'High Fragility', desc: 'Frequent context-switching detected.', color: 'text-[#b45309]' });
                                    }

                                    const lateLogs = (appUsageLogs || []).filter(l => {
                                        const hour = new Date(l.timestamp).getHours();
                                        return hour >= 21 || hour <= 4;
                                    }).length;

                                    if (lateLogs > 50) {
                                        alerts.push({ label: 'Circadian Risk', desc: 'Sustained late-night operations.', color: 'text-red-700' });
                                    }

                                    if (alerts.length === 0) return <p className="text-sm font-bold text-emerald-500/80 italic">Cognitive health is optimal.</p>

                                    return alerts.map(alert => (
                                        <div key={alert.label} className="p-4 bg-[#192631]/[0.05] rounded-2xl border border-[#192631]/10 group/alert">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${alert.color}`}>{alert.label}</span>
                                                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></div>
                                            </div>
                                            <p className="text-xs text-[#192631]/70 font-medium">{alert.desc}</p>
                                        </div>
                                    ));
                                })()}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Live Camera Feeds (Wisenet Local Web Viewer) */}
            {role === 'admin' && (
                <motion.div variants={itemVariants} className="glass-card rounded-2xl md:rounded-[32px] p-4 md:p-8 relative overflow-hidden group mb-4 md:mb-8">
                    <div className="absolute inset-x-0 -top-20 h-40 bg-[#e04b2a]/10 blur-[100px] pointer-events-none"></div>
                    <div className="flex items-center justify-between mb-6 relative z-10 flex-wrap gap-4">
                        <h3 className="font-black text-[#192631] text-lg flex items-center gap-3">
                            <Camera className="w-5 h-5 text-[#e04b2a]" />
                            <EditableText
                                settingKey="dashboard_office_cameras_title"
                                defaultText="Office Cameras"
                                as="span"
                            />
                        </h3>
                        <div className="w-full flex-grow flex-shrink basis-full mt-2 -mb-2">
                            <p className="text-xs text-[#192631]/60">Live feed from the local office NVR box. You must be on the same network to view.</p>
                        </div>
                        <div className="flex items-center gap-3 bg-[#192631]/[0.05] p-2 rounded-xl border border-[#192631]/10">
                            <input
                                type="text"
                                placeholder="NVR IP (e.g., 192.168.1.100)"
                                className="bg-[#f5f5f5]/85 border border-[#192631]/10 text-xs px-3 py-2 rounded-lg text-[#192631] focus:outline-none focus:border-orange-500 w-48 font-mono"
                                id="nvr-ip-input"
                                defaultValue="192.168."
                            />
                        </div>
                    </div>

                    <div className="w-full bg-[#0a0a0a] rounded-2xl border border-[#192631]/10 relative overflow-hidden shadow-inner flex flex-col items-center justify-center min-h-[400px] xl:min-h-[600px]">

                        {/* Notice for the user on how this works */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-[#f5f5f5]/85 backdrop-blur-sm z-10" id="camera-setup-overlay">
                            <Camera className="w-12 h-12 text-orange-500 mb-4 opacity-80" />
                            <h4 className="text-xl font-black text-[#192631] mb-2 tracking-tight">Connect via Local IP</h4>
                            <p className="text-sm text-[#192631]/70 max-w-[600px] mb-6 leading-relaxed bg-[#192631]/[0.05] p-4 rounded-xl border border-[#192631]/10">
                                <strong>Note:</strong> Wisenet cloud UIDs (like <code className="text-[#e04b2a] px-1 bg-[#f5f5f5]/85 rounded">FAM5C...</code>) are proprietary and only work in the official Wisenet mobile app.
                                <br /><br />
                                To view your cameras directly in this web dashboard, you must enter the <strong>Local IP Address</strong> of the XRN-1610SA NVR box (e.g., <code>192.168.1.100</code>). You must be on the same office Wi-Fi as the NVR.
                            </p>

                            <button
                                onClick={() => {
                                    const ip = (document.getElementById('nvr-ip-input') as HTMLInputElement).value;
                                    if (ip && ip !== '192.168.') {
                                        const iframe = document.getElementById('wisenet-iframe') as HTMLIFrameElement;
                                        // Note: Wisenet web viewer handles its own login prompt (HTTP Basic Auth).
                                        // We simply load the IP.
                                        iframe.src = `http://${ip}/`;
                                        document.getElementById('camera-setup-overlay')!.style.display = 'none';
                                    } else {
                                        alert('Please enter a valid local IP address.');
                                    }
                                }}
                                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-lg shadow-orange-500/20"
                            >
                                Load NVR Gateway
                            </button>
                        </div>

                        {/* The actual iframe where the Wisenet Web Viewer will load */}
                        <iframe
                            id="wisenet-iframe"
                            className="w-full h-full absolute inset-0 border-0 z-0 bg-white"
                            sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                            title="Wisenet Camera Viewer"
                        />
                    </div>
                </motion.div>
            )}

            {/* Admin Panel */}
            {
                role === 'admin' && (
                    <motion.div variants={itemVariants} className="bg-[#1a1a1a]/40 rounded-2xl md:rounded-[32px] border border-[#192631]/10 p-4 md:p-8 backdrop-blur-3xl relative overflow-hidden">
                        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500"></div>
                        <h3 className="font-black text-[#192631] text-lg mb-6 flex items-center gap-3">
                            <Settings className="w-5 h-5 text-[#e04b2a]" />
                            <EditableText
                                settingKey="dashboard_admin_controls_title"
                                defaultText="Admin Controls"
                                as="span"
                            />
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Target Hours */}
                            <div className="bg-[#192631]/[0.05] rounded-2xl border border-[#192631]/10 p-6 relative">
                                <h4 className="text-sm font-black text-[#192631]/70 uppercase tracking-widest mb-2">Set Weekly Target</h4>
                                <p className="text-xs text-[#192631]/60 mb-4 leading-relaxed">Adjust the expected working hours per week. This updates the goal bar for everyone.</p>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="number"
                                        value={targetHours}
                                        onChange={(e) => updateTargetHours(Math.max(1, parseInt(e.target.value) || 100))}
                                        className="w-32 px-4 py-3 bg-[#192631]/[0.05] border border-[#192631]/10 rounded-xl text-[#192631] text-2xl font-black text-center focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                                        min="1"
                                    />
                                    <span className="text-[#192631]/60 font-bold text-sm uppercase tracking-wider">hours goal</span>
                                </div>
                                <p className="text-xs text-slate-600 mt-3">This target is shown on the Capacity Goal progress bar above.</p>
                            </div>

                            {/* Clear Monthly Data */}
                            <div className="bg-[#192631]/[0.05] rounded-2xl border border-[#192631]/10 p-6 relative group border-rose-500/20 hover:border-rose-500/50 transition-colors">
                                <h4 className="text-sm font-black text-red-700 uppercase tracking-widest mb-2 flex items-center gap-2"><Trash2 className="w-4 h-4" /> Clear All Data (Reset)</h4>
                                <p className="text-xs text-[#192631]/60 mb-4 leading-relaxed">
                                    Wipes all logged time and tasks for a fresh start. Use with caution! <strong className="text-red-700">Projects, engineers, and files are kept.</strong>
                                </p>
                                {clearSuccess ? (
                                    <div className="flex items-center gap-2 text-[#123524] font-bold text-sm font-mono">
                                        <CheckCircle2 className="w-5 h-5 transition-transform scale-110" />
                                        System data cleared successfully!
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

                        {/* Remote Tracker Updater & Version Monitoring */}
                        <div className="bg-[#192631]/[0.05] rounded-2xl border border-[#192631]/10 p-6 mt-6 relative">
                            <h4 className="text-sm font-black text-[#192631]/70 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <UploadCloud className="w-4 h-4 text-[#e04b2a]" />
                                Manage Tracker Updates
                            </h4>
                            <p className="text-xs text-[#192631]/60 mb-6 leading-relaxed">View current app versions installed by engineers and remotely push automatic updates to their computers.</p>

                            {/* Version Monitoring Table */}
                            <div className="mb-6">
                                <h5 className="text-xs font-bold text-[#192631]/70 uppercase tracking-widest mb-3 border-b border-[#192631]/10 pb-2">Currently Installed Versions</h5>
                                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                                    {engineers.map(eng => {
                                        const isOutdated = eng.trackerVersion && globalSettings['tracker_version'] && eng.trackerVersion !== globalSettings['tracker_version'];
                                        return (
                                            <div key={eng.id} className="flex items-center justify-between bg-white/80 backdrop-blur-md p-3 rounded-xl border border-[#192631]/10">
                                                <span className="text-sm font-medium text-[#192631]/85">{eng.name}</span>
                                                <div className="flex items-center gap-2">
                                                    {eng.trackerVersion ? (
                                                        <span className={`text-xs font-mono font-bold px-2 py-1 rounded-md ${isOutdated ? 'bg-rose-500/20 text-red-700 border border-rose-500/30' : 'bg-[#123524]/10 text-[#123524] border border-[#123524]/25'}`}>
                                                            v{eng.trackerVersion}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs font-mono text-[#192631]/60 px-2 py-1 bg-[#192631]/[0.05] rounded-md border border-[#192631]/10">Unknown</span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {engineers.length === 0 && <p className="text-xs text-[#192631]/60 italic">No engineers found.</p>}
                                </div>
                            </div>

                            {/* Deployment Controls */}
                            <div className="pt-6 border-t border-[#192631]/10">
                                <h5 className="text-xs font-bold text-[#192631]/70 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <UploadCloud className="w-3.5 h-3.5" /> Push Update to Engineers
                                </h5>
                                <p className="text-xs text-[#192631]/60 mb-6 leading-relaxed">
                                    Provide the new version number and executable download link. Background trackers check this setting and will silently self-update if their local version is older.
                                </p>
                                <div className="flex flex-col md:flex-row items-end gap-4">
                                    <div className="flex-1 w-full">
                                        <label className="block text-[10px] font-bold text-[#192631]/60 uppercase tracking-widest mb-2 font-mono">New Version (e.g. 1.0.1)</label>
                                        <input
                                            type="text"
                                            value={trackerVersion}
                                            onChange={e => setTrackerVersion(e.target.value)}
                                            placeholder="e.g. 1.0.1"
                                            className="w-full bg-white/80 backdrop-blur-md text-[#192631] font-mono text-sm border border-[#192631]/10 rounded-xl px-4 py-3 focus:border-[#e04b2a]/25 focus:ring-1 focus:ring-orange-500/50 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="flex-[2] w-full">
                                        <label className="block text-[10px] font-bold text-[#192631]/60 uppercase tracking-widest mb-2 font-mono">Executable URL (.exe)</label>
                                        <input
                                            type="text"
                                            value={trackerUrl}
                                            onChange={e => setTrackerUrl(e.target.value)}
                                            placeholder="https://..."
                                            className="w-full bg-white/80 backdrop-blur-md text-[#192631] font-mono text-sm border border-[#192631]/10 rounded-xl px-4 py-3 focus:border-[#e04b2a]/25 focus:ring-1 focus:ring-orange-500/50 outline-none transition-all"
                                        />
                                    </div>
                                    <GlowButton
                                        variant="primary"
                                        icon={UploadCloud}
                                        onClick={handleDeployTracker}
                                        loading={isUpdatingTracker}
                                        className="w-full md:w-auto h-[46px]"
                                    >
                                        Push Update
                                    </GlowButton>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )
            }
                </div>
            )}
        </motion.div >
    );
};
