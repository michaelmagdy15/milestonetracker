import React, { useState, useRef, useEffect } from 'react';
import {
    LayoutDashboard,
    FolderKanban,
    Users,
    FileText,
    PieChart,
    Menu,
    X,
    LogOut,
    CalendarCheck,
    Search,
    Bell,
    User,
    DollarSign,
    Mail,
    Calendar,
    Calculator,
    BookOpen,
    Palette,
    HardHat,
    FileCheck2,
    Truck,
    Receipt,
    GitBranch,
    Globe,
    ChevronDown,
    ChevronRight,
    Sparkles,
    Layers,
    ArrowRight,
    CheckCircle2,
    Pin,
    UserCheck,
    Wrench
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { Logo } from './Logo';
import { MailNotifier } from './MailNotifier';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { useTenant } from '../context/TenantContext';
import { useWorkflow, NEXUS_LIFECYCLE_STAGES } from '../context/WorkflowContext';
import type { WorkflowPersona } from '../context/WorkflowContext';
import { NEXUS_LIVE_PROJECTS } from '../data/nexusLiveSeedData';

const STEP_CIRCLES = ['①', '②', '③', '④', '⑤', '⑥'];

const CollapsibleSectionHeader = ({
    label,
    isOpen,
    onToggle,
    stepHint,
}: {
    label: string;
    isOpen: boolean;
    onToggle: () => void;
    stepHint?: string;
}) => (
    <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 pt-3.5 pb-1.5 first:pt-0 group text-start focus:outline-none"
    >
        <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-[#192631]/55 group-hover:text-[#e04b2a] transition-colors truncate">
                {label}
            </span>
            {stepHint && (
                <span className="text-[8px] font-bold px-1.5 py-0.2 rounded bg-[#123524]/10 text-[#123524] shrink-0">
                    {stepHint}
                </span>
            )}
        </div>
        <ChevronDown
            className={clsx(
                'w-3.5 h-3.5 text-[#192631]/40 group-hover:text-[#e04b2a] transition-transform duration-200 shrink-0',
                !isOpen && '-rotate-90 rtl:rotate-90'
            )}
        />
    </button>
);

const NavItem = ({
    to,
    icon: Icon,
    label,
    badge,
    stepBadge,
    onClick,
}: {
    to: string;
    icon: React.ElementType;
    label: string;
    badge?: string;
    stepBadge?: number;
    onClick?: () => void;
}) => {
    const location = useLocation();
    const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to + '/'));

    return (
        <Link
            to={to}
            onClick={onClick}
            className={clsx(
                'flex items-center justify-between px-3 py-2 rounded-xl border transition-all duration-300 relative overflow-hidden group',
                isActive
                    ? 'bg-[#e04b2a]/12 text-[#192631] border-[#e04b2a]/35 shadow-sm'
                    : 'bg-transparent border-transparent text-[#192631]/75 hover:border-[#192631]/10 hover:text-[#192631] hover:bg-[#192631]/5'
            )}
        >
            <div className="flex items-center gap-2.5 min-w-0">
                <div
                    className={clsx(
                        'p-1.5 rounded-lg transition-all duration-300 relative z-10 shrink-0',
                        isActive
                            ? 'bg-[#e04b2a] text-white shadow-sm'
                            : stepBadge
                            ? 'bg-[#123524]/10 text-[#123524] group-hover:bg-[#e04b2a]/15 group-hover:text-[#e04b2a]'
                            : 'bg-[#192631]/5 text-[#192631]/70 group-hover:bg-[#e04b2a]/15 group-hover:text-[#e04b2a]'
                    )}
                >
                    <Icon className="w-4 h-4" />
                </div>
                <span
                    className={clsx(
                        'relative z-10 text-[11px] tracking-[0.06em] uppercase truncate',
                        isActive ? 'font-extrabold text-[#192631]' : 'font-semibold text-[#192631]/85'
                    )}
                >
                    {label}
                </span>
            </div>
            {badge && (
                <span
                    dir="ltr"
                    className={clsx(
                        'text-[9px] font-black px-1.5 py-0.5 rounded-md border shrink-0 ms-1.5',
                        isActive
                            ? 'bg-[#e04b2a] text-white border-[#e04b2a]'
                            : 'bg-[#192631]/5 text-[#192631]/70 border-[#192631]/10'
                    )}
                >
                    {badge}
                </span>
            )}
        </Link>
    );
};

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { role, signOut, user, engineerId } = useAuth();
    const { projects, engineers, tasks, entries, notifications, markNotificationRead, addNotification } = useData();
    const { language, toggleLanguage } = useLanguage();
    const { activeOrg, organizations, switchOrganization } = useTenant();
    const {
        activeProjectCode,
        setActiveProjectCode,
        activeProject,
        viewComplexity,
        toggleViewComplexity,
        activePersona,
        setActivePersona,
    } = useWorkflow();

    const location = useLocation();
    const navigate = useNavigate();
    const isAr = language === 'ar';

    // Sidebar collapsible sections state
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({
        command: true,
        technical: true,
        procurement: true,
        finance: true,
        moreTools: false,
    });

    const toggleSection = (key: string) => {
        setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const notifiedTasksRef = useRef<Set<string>>(new Set());

    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const notifRef = useRef<HTMLDivElement>(null);

    const myNotifications = notifications
        .filter(n => n.engineerId === engineerId)
        .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
    const unreadCount = myNotifications.filter(n => !n.isRead).length;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsSearchOpen(false);
            }
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setIsNotifOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Check for overdue tasks
    useEffect(() => {
        if (!engineerId || tasks.length === 0) return;
        const now = new Date();
        tasks.forEach(task => {
            if (task.status !== 'completed' && task.dueDate && new Date(task.dueDate) < now) {
                if (task.engineerId === engineerId) {
                    const alreadyInDb = notifications.some(
                        n => n.type === 'overdue_task' && n.projectId === task.id && n.engineerId === engineerId
                    );
                    if (!alreadyInDb && !notifiedTasksRef.current.has(task.id)) {
                        notifiedTasksRef.current.add(task.id);
                        if (addNotification) {
                            addNotification({
                                id: crypto.randomUUID(),
                                engineerId: engineerId,
                                message: `Overdue Task: ${task.title}`,
                                isRead: false,
                                createdAt: new Date().toISOString(),
                                type: 'overdue_task',
                                projectId: task.id,
                            });
                        }
                    }
                }
            }
        });
    }, [tasks, notifications, engineerId, addNotification]);

    const searchResults = React.useMemo(() => {
        if (!searchQuery.trim()) return [];

        const q = searchQuery.toLowerCase();
        const results: Array<{
            type: string;
            title: string;
            subtitle?: string;
            id: string;
            url: string;
            icon: React.ElementType;
        }> = [];

        // Search Projects
        projects.forEach(p => {
            if (p.name.toLowerCase().includes(q)) {
                results.push({ type: 'Project', title: p.name, id: p.id, url: `/projects/${p.id}`, icon: FolderKanban });
            }
        });

        // Search Engineers
        engineers.forEach(e => {
            if (e.name.toLowerCase().includes(q) || e.role.toLowerCase().includes(q)) {
                results.push({ type: 'Engineer', title: e.name, subtitle: e.role, id: e.id, url: `/engineers`, icon: Users });
            }
        });

        // Search Tasks
        tasks.forEach(t => {
            if (t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q)) {
                const project = projects.find(p => p.id === t.projectId);
                results.push({
                    type: 'Task',
                    title: t.title,
                    subtitle: `In ${project?.name || 'Unknown'}`,
                    id: t.id,
                    url: `/projects/${t.projectId}`,
                    icon: LayoutDashboard,
                });
            }
        });

        // Search Entries
        entries.forEach(e => {
            if (e.taskDescription.toLowerCase().includes(q) || e.tags?.some(tag => tag.toLowerCase().includes(q))) {
                results.push({
                    type: 'Entry',
                    title: e.taskDescription.length > 40 ? e.taskDescription.slice(0, 40) + '...' : e.taskDescription,
                    subtitle: `Log Entry`,
                    id: e.id,
                    url: `/entries`,
                    icon: FileText,
                });
            }
        });

        return results.slice(0, 8);
    }, [searchQuery, projects, engineers, tasks, entries]);

    // Determine active lifecycle stage index (0..5) or -1 if on dashboard/other page
    const activeStageIndex = NEXUS_LIFECYCLE_STAGES.findIndex(
        stage => location.pathname === stage.path || location.pathname.startsWith(stage.path + '/')
    );
    const nextStage =
        activeStageIndex >= 0 && activeStageIndex < NEXUS_LIFECYCLE_STAGES.length - 1
            ? NEXUS_LIFECYCLE_STAGES[activeStageIndex + 1]
            : undefined;

    const closeMobileIfOpen = () => {
        if (isMobileMenuOpen) setIsMobileMenuOpen(false);
    };

    return (
        <div className="min-h-screen bg-[#f5f5f5] font-sans text-[#192631] flex relative selection:bg-[#e04b2a]/20">
            {/* Subtle Architectural Grid & Ambient Orbs (Nexus Brand Guideline Page 5 & 10) */}
            <div
                className="absolute inset-0 opacity-[0.35] pointer-events-none z-0"
                style={{
                    backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(25, 38, 49, 0.08) 1px, transparent 0)',
                    backgroundSize: '24px 24px',
                }}
            />

            {/* Sidebar — Frosted Glassmorphic Light Panel */}
            <aside
                className={clsx(
                    'fixed inset-y-0 z-50 w-72 glass-morphism transform transition-all duration-500 ease-in-out lg:translate-x-0 lg:static lg:block h-full',
                    isAr ? 'right-0' : 'left-0',
                    isMobileMenuOpen ? 'translate-x-0' : isAr ? 'translate-x-full' : '-translate-x-full'
                )}
            >
                <div className="h-full flex flex-col p-4 overflow-y-auto no-scrollbar">
                    <div className="mb-3 flex items-center justify-between lg:justify-start gap-3 shrink-0">
                        <div className="flex items-center justify-center lg:justify-start w-full pb-3 border-b border-[#192631]/10">
                            <Logo darkText={true} variant="orange-symbol" />
                        </div>
                        <button
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="lg:hidden absolute top-4 end-4 p-2 text-[#192631]/60 hover:text-[#192631]"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Guided vs Full ERP Mode Pill inside Sidebar for quick clarity */}
                    <div className="mb-3 px-1 shrink-0">
                        <button
                            type="button"
                            onClick={toggleViewComplexity}
                            className={clsx(
                                'w-full flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-bold transition-all',
                                viewComplexity === 'guided'
                                    ? 'bg-[#123524] text-white border-[#123524] shadow-sm'
                                    : 'bg-white/80 text-[#192631] border-[#192631]/15 hover:border-[#e04b2a]'
                            )}
                            title={
                                isAr
                                    ? 'الوضع المبسط يركز على الـ 6 خطوات الأساسية للمقاولات'
                                    : 'Guided Mode simplifies navigation into the 6 core contracting steps'
                            }
                        >
                            <span className="flex items-center gap-1.5">
                                {viewComplexity === 'guided' ? (
                                    <Sparkles className="w-3.5 h-3.5 text-[#e04b2a]" />
                                ) : (
                                    <Layers className="w-3.5 h-3.5 text-[#e04b2a]" />
                                )}
                                {viewComplexity === 'guided'
                                    ? isAr
                                        ? '⚡ الوضع الموجه (6 خطوات)'
                                        : '⚡ Guided Mode (6 Steps)'
                                    : isAr
                                    ? 'النظام الكامل (Full ERP)'
                                    : 'Full ERP Mode'}
                            </span>
                            <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/15">
                                {isAr ? 'تبديل' : 'Switch'}
                            </span>
                        </button>
                    </div>

                    <nav className="space-y-1 flex-1">
                        {/* SECTION 1: 1. Command & Projects */}
                        <CollapsibleSectionHeader
                            label={isAr ? '1. القيادة والمشاريع' : '1. Command & Projects'}
                            isOpen={openSections.command}
                            onToggle={() => toggleSection('command')}
                        />
                        {openSections.command && (
                            <div className="space-y-1">
                                <NavItem
                                    to="/"
                                    icon={LayoutDashboard}
                                    label={isAr ? 'لوحة القيادة (Dashboard)' : 'Dashboard'}
                                    onClick={closeMobileIfOpen}
                                />
                                {role !== 'client' && (
                                    <NavItem
                                        to="/projects"
                                        icon={FolderKanban}
                                        label={isAr ? 'المشاريع (Projects)' : 'Projects'}
                                        badge="77"
                                        onClick={closeMobileIfOpen}
                                    />
                                )}
                                {viewComplexity === 'full' && role !== 'client' && (
                                    <>
                                        <NavItem
                                            to="/meetings"
                                            icon={Calendar}
                                            label={isAr ? 'الاجتماعات' : 'Meetings'}
                                            onClick={closeMobileIfOpen}
                                        />
                                        <NavItem
                                            to="/entries"
                                            icon={FileText}
                                            label={isAr ? 'اليوميات والتقارير' : 'Daily Entries'}
                                            onClick={closeMobileIfOpen}
                                        />
                                    </>
                                )}
                            </div>
                        )}

                        {role !== 'client' && (
                            <>
                                {/* SECTION 2: 2. Technical Office (Steps 1–2) */}
                                <CollapsibleSectionHeader
                                    label={isAr ? '2. المكتب الفني (خطوة 1–2)' : '2. Technical Office (Steps 1–2)'}
                                    stepHint="①-②"
                                    isOpen={openSections.technical}
                                    onToggle={() => toggleSection('technical')}
                                />
                                {openSections.technical && (
                                    <div className="space-y-1">
                                        <NavItem
                                            to="/boq"
                                            icon={Calculator}
                                            label={isAr ? '① المقايسة والتسعير R02' : '① BOQ & Pricing'}
                                            badge="839"
                                            stepBadge={1}
                                            onClick={closeMobileIfOpen}
                                        />
                                        <NavItem
                                            to="/submittals"
                                            icon={FileCheck2}
                                            label={isAr ? '② الاعتمادات والتكويد' : '② Submittals & Coding'}
                                            badge="51"
                                            stepBadge={2}
                                            onClick={closeMobileIfOpen}
                                        />
                                        {viewComplexity === 'full' && (
                                            <>
                                                <NavItem
                                                    to="/variations-rfis"
                                                    icon={GitBranch}
                                                    label={isAr ? 'أوامر التغيير والاستفسارات' : 'Variations & RFIs'}
                                                    onClick={closeMobileIfOpen}
                                                />
                                                <NavItem
                                                    to="/emails"
                                                    icon={Mail}
                                                    label={isAr ? 'المراسلات الرسمية' : 'Emails & Transmittals'}
                                                    onClick={closeMobileIfOpen}
                                                />
                                            </>
                                        )}
                                    </div>
                                )}

                                {/* SECTION 3: 3. Site & Procurement (Steps 3–4) */}
                                <CollapsibleSectionHeader
                                    label={isAr ? '3. المشتريات والتنفيذ (خطوة 3–4)' : '3. Site & Procurement (Steps 3–4)'}
                                    stepHint="③-④"
                                    isOpen={openSections.procurement}
                                    onToggle={() => toggleSection('procurement')}
                                />
                                {openSections.procurement && (
                                    <div className="space-y-1">
                                        <NavItem
                                            to="/procurement"
                                            icon={Truck}
                                            label={isAr ? '③ المشتريات والمخازن' : '③ Procurement & Stores'}
                                            badge="4"
                                            stepBadge={3}
                                            onClick={closeMobileIfOpen}
                                        />
                                        <NavItem
                                            to="/subcontractors"
                                            icon={HardHat}
                                            label={isAr ? '④ مقاولي الباطن والتنفيذ' : '④ Subcontractors'}
                                            badge="56"
                                            stepBadge={4}
                                            onClick={closeMobileIfOpen}
                                        />
                                        {viewComplexity === 'full' && (
                                            <>
                                                <NavItem
                                                    to="/engineers"
                                                    icon={Users}
                                                    label={isAr ? 'فريق المهندسين' : 'Engineers & Team'}
                                                    badge="16"
                                                    onClick={closeMobileIfOpen}
                                                />
                                                <NavItem
                                                    to="/attendance"
                                                    icon={CalendarCheck}
                                                    label={isAr ? 'الحضور والانصراف GPS' : 'Attendance & GPS'}
                                                    badge="21→20"
                                                    onClick={closeMobileIfOpen}
                                                />
                                            </>
                                        )}
                                    </div>
                                )}
                            </>
                        )}

                        {/* SECTION 4: 4. Finance & Treasury (Steps 5–6) */}
                        <CollapsibleSectionHeader
                            label={isAr ? '4. المستخلصات والخزينة (خطوة 5–6)' : '4. Finance & Treasury (Steps 5–6)'}
                            stepHint="⑤-⑥"
                            isOpen={openSections.finance}
                            onToggle={() => toggleSection('finance')}
                        />
                        {openSections.finance && (
                            <div className="space-y-1">
                                {role !== 'client' && (
                                    <NavItem
                                        to="/extracts"
                                        icon={Receipt}
                                        label={isAr ? '⑤ المستخلصات وحساب العميل' : '⑤ Extracts & Ledger'}
                                        badge="80"
                                        stepBadge={5}
                                        onClick={closeMobileIfOpen}
                                    />
                                )}
                                {role === 'admin' && (
                                    <NavItem
                                        to="/financials"
                                        icon={DollarSign}
                                        label={isAr ? '⑥ الخزينة والسيولة' : '⑥ Financials & Treasury'}
                                        badge="16"
                                        stepBadge={6}
                                        onClick={closeMobileIfOpen}
                                    />
                                )}
                                {viewComplexity === 'full' && (
                                    <>
                                        {role === 'admin' && (
                                            <NavItem
                                                to="/reports"
                                                icon={PieChart}
                                                label={isAr ? 'التقارير المالية' : 'Reports'}
                                                onClick={closeMobileIfOpen}
                                            />
                                        )}
                                        {role === 'admin' && (
                                            <NavItem
                                                to="/settings"
                                                icon={Palette}
                                                label={isAr ? 'إعدادات الهوية' : 'White-Label Studio'}
                                                onClick={closeMobileIfOpen}
                                            />
                                        )}
                                        <NavItem
                                            to="/help"
                                            icon={BookOpen}
                                            label={isAr ? 'دليل التشغيل' : 'Help Guide'}
                                            onClick={closeMobileIfOpen}
                                        />
                                        <NavItem
                                            to="/profile"
                                            icon={User}
                                            label={isAr ? 'ملفي الشخصي' : 'My Profile'}
                                            onClick={closeMobileIfOpen}
                                        />
                                    </>
                                )}
                            </div>
                        )}

                        {/* In Guided Mode, group secondary utilities inside an expandable "More Tools & Admin (9)" accordion */}
                        {viewComplexity === 'guided' && role !== 'client' && (
                            <div className="pt-3 mt-2 border-t border-[#192631]/10">
                                <button
                                    type="button"
                                    onClick={() => toggleSection('moreTools')}
                                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[#192631]/[0.04] hover:bg-[#192631]/[0.08] text-[#192631]/75 text-[11px] font-bold transition-colors"
                                >
                                    <span className="flex items-center gap-2">
                                        <Wrench className="w-3.5 h-3.5 text-[#e04b2a]" />
                                        {isAr ? 'أدوات إضافية وإدارة (9)' : 'More Tools & Admin (9)'}
                                    </span>
                                    <ChevronRight
                                        className={clsx(
                                            'w-3.5 h-3.5 transition-transform duration-200',
                                            openSections.moreTools && 'rotate-90'
                                        )}
                                    />
                                </button>

                                {openSections.moreTools && (
                                    <div className="mt-1.5 space-y-1 ps-1 border-s-2 border-[#e04b2a]/25">
                                        <NavItem
                                            to="/meetings"
                                            icon={Calendar}
                                            label={isAr ? 'الاجتماعات' : 'Meetings'}
                                            onClick={closeMobileIfOpen}
                                        />
                                        <NavItem
                                            to="/entries"
                                            icon={FileText}
                                            label={isAr ? 'اليوميات' : 'Daily Entries'}
                                            onClick={closeMobileIfOpen}
                                        />
                                        <NavItem
                                            to="/variations-rfis"
                                            icon={GitBranch}
                                            label={isAr ? 'أوامر التغيير RFIs' : 'Variations & RFIs'}
                                            onClick={closeMobileIfOpen}
                                        />
                                        <NavItem
                                            to="/emails"
                                            icon={Mail}
                                            label={isAr ? 'المراسلات' : 'Emails'}
                                            onClick={closeMobileIfOpen}
                                        />
                                        <NavItem
                                            to="/engineers"
                                            icon={Users}
                                            label={isAr ? 'المهندسين' : 'Engineers'}
                                            badge="16"
                                            onClick={closeMobileIfOpen}
                                        />
                                        <NavItem
                                            to="/attendance"
                                            icon={CalendarCheck}
                                            label={isAr ? 'الحضور GPS' : 'Attendance'}
                                            badge="21→20"
                                            onClick={closeMobileIfOpen}
                                        />
                                        {role === 'admin' && (
                                            <NavItem
                                                to="/reports"
                                                icon={PieChart}
                                                label={isAr ? 'التقارير' : 'Reports'}
                                                onClick={closeMobileIfOpen}
                                            />
                                        )}
                                        {role === 'admin' && (
                                            <NavItem
                                                to="/settings"
                                                icon={Palette}
                                                label={isAr ? 'إعدادات الهوية' : 'White-Label Studio'}
                                                onClick={closeMobileIfOpen}
                                            />
                                        )}
                                        <NavItem
                                            to="/help"
                                            icon={BookOpen}
                                            label={isAr ? 'دليل التشغيل' : 'Help Guide'}
                                            onClick={closeMobileIfOpen}
                                        />
                                        <NavItem
                                            to="/profile"
                                            icon={User}
                                            label={isAr ? 'ملفي الشخصي' : 'My Profile'}
                                            onClick={closeMobileIfOpen}
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </nav>

                    <div className="pt-3 border-t border-[#192631]/10 flex flex-col space-y-2.5 shrink-0 mt-3">
                        {role === 'admin' && organizations.length > 1 && (
                            <div className="px-1">
                                <label className="block text-[9px] font-bold text-[#192631]/60 uppercase tracking-widest mb-1">
                                    {isAr ? 'الشركة الفعالة' : 'Active Company Workspace'}
                                </label>
                                <select
                                    value={activeOrg.id}
                                    onChange={e => switchOrganization(e.target.value)}
                                    className="w-full px-3 py-1.5 bg-white/80 border border-[#192631]/15 rounded-xl text-[#192631] text-xs font-bold focus:outline-none focus:border-[#e04b2a]"
                                >
                                    {organizations.map(org => (
                                        <option key={org.id} value={org.id}>
                                            {org.name} ({org.currency})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="glass-card rounded-2xl p-3">
                            <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-[#e04b2a] mb-0.5 truncate">
                                {activeOrg.name === 'Apex Contracting & Engineering' ? 'NEXUS CONTRACTING' : activeOrg.name}
                            </p>
                            <p className="text-xs font-medium tracking-tight text-[#192631]/75 truncate">
                                Eng. Pierre Afifi · Cairo, Egypt
                            </p>
                        </div>

                        <div className="flex items-center justify-between p-2 rounded-xl bg-white/70 border border-[#192631]/10">
                            <div className="flex flex-col min-w-0">
                                <span className="font-bold text-[#192631] text-xs truncate uppercase tracking-wider">
                                    {user?.email?.split('@')[0] || 'User'}
                                </span>
                                <span className="text-[10px] text-[#e04b2a] font-bold uppercase tracking-widest mt-0.5">
                                    {role || 'Engineer'}
                                </span>
                            </div>
                            <button
                                onClick={signOut}
                                className="p-2 text-[#e04b2a] hover:bg-[#e04b2a]/10 rounded-lg transition-colors group"
                                title="Sign Out"
                            >
                                <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
                {/* Mobile Header */}
                <div className="lg:hidden glass-morphism border-b border-[#192631]/10 p-3.5 flex flex-col gap-2.5 sticky top-0 z-40">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <Logo className="scale-90 origin-left" darkText={true} variant="orange-symbol" />
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={toggleViewComplexity}
                                className={clsx(
                                    'px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition-colors',
                                    viewComplexity === 'guided'
                                        ? 'bg-[#123524] text-white border-[#123524]'
                                        : 'bg-white/80 text-[#192631] border-[#192631]/15'
                                )}
                            >
                                {viewComplexity === 'guided' ? '⚡ Guided' : 'Full ERP'}
                            </button>
                            <button
                                onClick={toggleLanguage}
                                className="flex items-center gap-1.5 p-1.5 px-2.5 text-[#192631]/70 font-bold text-xs uppercase hover:bg-[#192631]/[0.05] hover:text-[#192631] rounded-lg transition-colors border border-[#192631]/10 bg-white/75"
                            >
                                <Globe className="w-3.5 h-3.5" />
                                {language === 'en' ? 'EN' : 'AR'}
                            </button>
                            <button
                                onClick={() => setIsNotifOpen(!isNotifOpen)}
                                className="relative p-1.5 text-[#192631]/60 hover:bg-white/80 rounded-lg"
                            >
                                <Bell className="w-5 h-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#e04b2a] rounded-full border border-white"></span>
                                )}
                            </button>
                            <button
                                onClick={() => setIsMobileMenuOpen(true)}
                                className="p-1.5 text-[#192631]/60 hover:bg-white/80 rounded-lg"
                            >
                                <Menu className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Mobile Active Project Selector Pill */}
                    <div className="flex items-center gap-2">
                        <select
                            aria-label="Active Project Selector Mobile"
                            value={activeProjectCode}
                            onChange={e => setActiveProjectCode(e.target.value)}
                            className="flex-1 px-2.5 py-1.5 rounded-xl bg-white/90 border border-[#192631]/15 text-xs font-bold text-[#192631] focus:outline-none focus:border-[#e04b2a]"
                        >
                            <option value="ALL">
                                📌 {isAr ? 'كل المشاريع (77 مشروع)' : 'All 77 Projects (Portfolio)'}
                            </option>
                            {NEXUS_LIVE_PROJECTS.map(proj => (
                                <option key={proj.id} value={proj.code}>
                                    📌 {proj.code} - {proj.clientName} ({proj.location})
                                </option>
                            ))}
                        </select>
                        <select
                            aria-label="Active Persona Mobile"
                            value={activePersona}
                            onChange={e => setActivePersona(e.target.value as WorkflowPersona)}
                            className="px-2.5 py-1.5 rounded-xl bg-white/90 border border-[#192631]/15 text-xs font-bold text-[#192631] focus:outline-none focus:border-[#e04b2a]"
                        >
                            <option value="ceo">{isAr ? 'الإدارة (CEO)' : 'CEO View'}</option>
                            <option value="technical">{isAr ? 'م. بيير (فني)' : 'Pierre (Tech)'}</option>
                            <option value="accounting">{isAr ? 'أ. ميرنا (حسابات)' : 'Merna (Acct)'}</option>
                            <option value="logistics">{isAr ? 'أ. ميلاد (مخازن)' : 'Milad (Store)'}</option>
                        </select>
                    </div>
                </div>

                {/* Mobile Notifications Dropdown (Absolute overlay) */}
                {isNotifOpen && (
                    <div className="lg:hidden absolute top-28 right-4 left-4 bg-white/95 backdrop-blur-xl border border-[#192631]/12 shadow-2xl rounded-2xl overflow-hidden z-50">
                        <div className="p-4 border-b border-[#192631]/10 bg-[#192631]/[0.03] flex justify-between items-center">
                            <h3 className="font-semibold text-[#192631]">Notifications</h3>
                            <span className="text-xs font-medium text-[#192631]/70 px-2 py-1 bg-[#192631]/[0.05] rounded-full border border-[#192631]/10">
                                {unreadCount} unread
                            </span>
                        </div>
                        <div className="max-h-[60vh] overflow-y-auto no-scrollbar">
                            {myNotifications.length === 0 ? (
                                <div className="p-8 text-center text-[#192631]/60 text-sm">No new notifications</div>
                            ) : (
                                myNotifications.map(notif => (
                                    <div
                                        key={notif.id}
                                        className={clsx(
                                            'p-4 border-b border-[#192631]/10 last:border-0 hover:bg-[#192631]/[0.04] transition-colors cursor-pointer',
                                            !notif.isRead && 'bg-[#e04b2a]/10'
                                        )}
                                        onClick={() => {
                                            if (!notif.isRead) markNotificationRead(notif.id);
                                            setIsNotifOpen(false);
                                        }}
                                    >
                                        <p className={clsx('text-sm', notif.isRead ? 'text-[#192631]/65' : 'text-[#192631] font-semibold')}>
                                            {notif.message}
                                        </p>
                                        <p className="text-xs text-[#192631]/55 mt-1">
                                            {new Date(notif.createdAt || '').toLocaleString()}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* Top Desktop Bar: Search + Global Active Project Pill + Guided Mode Toggle + Role Persona + Language & Notifications */}
                <div className="hidden lg:flex items-center justify-between gap-3 px-6 pt-5 pb-3">
                    {/* Search Bar */}
                    <div ref={searchRef} className="relative w-64 xl:w-80 shrink-0 z-30">
                        <div className="glass-morphism px-3.5 py-2 rounded-xl text-[#192631]/70 flex items-center w-full shadow-sm focus-within:border-[#e04b2a]/35 focus-within:bg-white/95 transition-all duration-300 group">
                            <Search className="w-4 h-4 me-2.5 text-[#192631]/60 group-focus-within:text-[#e04b2a] transition-colors shrink-0" />
                            <input
                                type="text"
                                placeholder={
                                    isAr
                                        ? 'ابحث في المشاريع، المقايسة، الاعتمادات...'
                                        : 'Search projects, BOQ, submittals...'
                                }
                                className="bg-transparent w-full outline-none text-[#192631] placeholder-[#192631]/45 text-xs font-medium"
                                value={searchQuery}
                                onChange={e => {
                                    setSearchQuery(e.target.value);
                                    setIsSearchOpen(true);
                                }}
                                onFocus={() => setIsSearchOpen(true)}
                            />
                        </div>

                        {isSearchOpen && searchQuery.trim() && (
                            <div className="absolute top-12 start-0 w-96 bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl border border-[#192631]/12 overflow-hidden">
                                {searchResults.length === 0 ? (
                                    <div className="p-4 text-center text-[#192631]/60 text-sm">
                                        No results found for "{searchQuery}"
                                    </div>
                                ) : (
                                    <div className="max-h-96 overflow-y-auto py-2 no-scrollbar">
                                        {searchResults.map((result, idx) => {
                                            const Icon = result.icon;
                                            return (
                                                <button
                                                    key={`${result.type}-${result.id}-${idx}`}
                                                    onClick={() => {
                                                        navigate(result.url);
                                                        setIsSearchOpen(false);
                                                        setSearchQuery('');
                                                    }}
                                                    className="w-full text-start px-4 py-3 hover:bg-[#192631]/[0.05] flex items-start transition-colors"
                                                >
                                                    <div className="bg-[#192631]/[0.05] p-2 rounded-lg me-3 text-[#192631]/70 border border-[#192631]/10">
                                                        <Icon className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-[#192631] text-sm">{result.title}</p>
                                                        <div className="flex items-center text-xs text-[#192631]/60 mt-0.5">
                                                            <span className="font-medium text-[#e04b2a] me-2">{result.type}</span>
                                                            {result.subtitle && <span>• {result.subtitle}</span>}
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Global Context Controls Strip */}
                    <div className="relative z-30 flex items-center flex-wrap gap-2.5 justify-end flex-1">
                        {/* 1. Global Active Project Selector Pill (`📌 Active Project`) */}
                        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md border border-[#192631]/15 hover:border-[#e04b2a]/50 rounded-xl px-3 py-1.5 shadow-sm transition-all">
                            <Pin className="w-3.5 h-3.5 text-[#e04b2a] shrink-0" />
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#192631]/55 hidden xl:inline">
                                {isAr ? 'المشروع النشط:' : 'Active Project:'}
                            </span>
                            <select
                                aria-label="Global Active Project Selector"
                                value={activeProjectCode}
                                onChange={e => setActiveProjectCode(e.target.value)}
                                className="bg-transparent text-xs font-extrabold text-[#192631] focus:outline-none cursor-pointer max-w-[230px] truncate"
                            >
                                <option value="ALL">
                                    {isAr ? 'كل المشاريع (All 77 Projects)' : 'All 77 Projects (Full Portfolio)'}
                                </option>
                                {NEXUS_LIVE_PROJECTS.map(proj => (
                                    <option key={proj.id} value={proj.code}>
                                        {proj.code} - {proj.clientName} ({proj.location})
                                    </option>
                                ))}
                            </select>
                            {activeProject && (
                                <span
                                    dir="ltr"
                                    className="text-[10px] font-black px-1.5 py-0.5 rounded bg-[#123524]/10 text-[#123524]"
                                >
                                    {activeProject.completionPercent}%
                                </span>
                            )}
                        </div>

                        {/* 2. Role Persona Quick Switcher */}
                        <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md border border-[#192631]/15 rounded-xl px-2.5 py-1.5 shadow-sm">
                            <UserCheck className="w-3.5 h-3.5 text-[#123524] shrink-0" />
                            <select
                                aria-label="Role Persona Quick Switcher"
                                value={activePersona}
                                onChange={e => setActivePersona(e.target.value as WorkflowPersona)}
                                className="bg-transparent text-xs font-bold text-[#192631] focus:outline-none cursor-pointer"
                            >
                                <option value="ceo">{isAr ? 'رؤية الإدارة (CEO View)' : 'CEO View'}</option>
                                <option value="technical">
                                    {isAr ? 'م. بيير (Technical)' : 'Pierre (Technical)'}
                                </option>
                                <option value="accounting">
                                    {isAr ? 'أ. ميرنا (Accounting)' : 'Merna (Accounting)'}
                                </option>
                                <option value="logistics">
                                    {isAr ? 'أ. ميلاد (Logistics)' : 'Milad (Logistics)'}
                                </option>
                            </select>
                        </div>

                        {/* 3. Guided Mode vs. Full ERP Toggle */}
                        <button
                            type="button"
                            onClick={toggleViewComplexity}
                            title={
                                isAr
                                    ? 'الوضع الموجه يبسط الواجهة إلى 6 خطوات واضحة'
                                    : 'Guided Mode simplifies navigation into clear steps'
                            }
                            className={clsx(
                                'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all border shadow-sm',
                                viewComplexity === 'guided'
                                    ? 'bg-[#123524] text-white border-[#123524]'
                                    : 'bg-white/90 text-[#192631] border-[#192631]/15 hover:bg-white'
                            )}
                        >
                            {viewComplexity === 'guided' ? (
                                <>
                                    <Sparkles className="w-3.5 h-3.5 text-[#e04b2a]" />
                                    <span>{isAr ? '⚡ الوضع الموجه' : '⚡ Guided Mode'}</span>
                                </>
                            ) : (
                                <>
                                    <Layers className="w-3.5 h-3.5 text-[#e04b2a]" />
                                    <span>{isAr ? 'Full ERP' : 'Full ERP'}</span>
                                </>
                            )}
                        </button>

                        {/* 4. Language Switcher */}
                        <button
                            onClick={toggleLanguage}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-[#192631]/80 font-bold text-xs uppercase hover:bg-white hover:text-[#192631] rounded-xl transition-all border border-[#192631]/12 bg-white/80 backdrop-blur-md shadow-sm"
                        >
                            <Globe className="w-3.5 h-3.5 text-[#e04b2a]" />
                            {language === 'en' ? 'English' : 'عربي'}
                        </button>

                        {/* 5. Notifications Bell */}
                        <div ref={notifRef} className="relative">
                            <button
                                onClick={() => setIsNotifOpen(!isNotifOpen)}
                                className="relative p-2 text-[#192631]/75 hover:text-[#192631] bg-white/80 hover:bg-white border border-[#192631]/10 rounded-xl transition-colors shadow-sm"
                            >
                                <Bell className="w-4 h-4" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#e04b2a] rounded-full border border-white"></span>
                                )}
                            </button>

                            {isNotifOpen && (
                                <div className="absolute top-11 end-0 w-80 bg-white/95 backdrop-blur-xl border border-[#192631]/12 shadow-2xl rounded-2xl overflow-hidden">
                                    <div className="p-4 border-b border-[#192631]/10 bg-[#192631]/[0.03] flex justify-between items-center">
                                        <h3 className="font-semibold text-[#192631]">Notifications</h3>
                                        <span className="text-xs font-medium text-[#192631]/70 px-2 py-1 bg-[#192631]/[0.05] rounded-full border border-[#192631]/10">
                                            {unreadCount} unread
                                        </span>
                                    </div>
                                    <div className="max-h-96 overflow-y-auto no-scrollbar">
                                        {myNotifications.length === 0 ? (
                                            <div className="p-8 text-center text-[#192631]/60 text-sm">
                                                No new notifications
                                            </div>
                                        ) : (
                                            myNotifications.map(notif => (
                                                <div
                                                    key={notif.id}
                                                    className={clsx(
                                                        'p-4 border-b border-[#192631]/10 last:border-0 hover:bg-[#192631]/[0.04] transition-colors cursor-pointer',
                                                        !notif.isRead && 'bg-[#e04b2a]/10'
                                                    )}
                                                    onClick={() => {
                                                        if (!notif.isRead) markNotificationRead(notif.id);
                                                        setIsNotifOpen(false);
                                                    }}
                                                >
                                                    <p
                                                        className={clsx(
                                                            'text-sm',
                                                            notif.isRead ? 'text-[#192631]/65' : 'text-[#192631] font-semibold'
                                                        )}
                                                    >
                                                        {notif.message}
                                                    </p>
                                                    <p className="text-xs text-[#192631]/55 mt-1">
                                                        {new Date(notif.createdAt || '').toLocaleString()}
                                                    </p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Persistent 6-Step Contracting Lifecycle Bar (Directly below top header inside <main>) */}
                {role !== 'client' && (
                    <div className="px-3 md:px-6 pt-2 pb-1 shrink-0">
                        <div className="bg-white/90 backdrop-blur-md border border-[#192631]/12 rounded-2xl px-3 py-2 shadow-sm flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
                            <div className="flex items-center gap-1.5 min-w-max">
                                <button
                                    type="button"
                                    onClick={() => navigate('/')}
                                    className={clsx(
                                        'px-2.5 py-1.5 rounded-xl text-[11px] font-extrabold transition-all flex items-center gap-1.5 border',
                                        location.pathname === '/'
                                            ? 'bg-[#192631] text-white border-[#192631] shadow-sm'
                                            : 'bg-[#192631]/[0.04] text-[#192631]/75 border-transparent hover:bg-[#192631]/10'
                                    )}
                                >
                                    <LayoutDashboard className="w-3.5 h-3.5 text-[#e04b2a]" />
                                    <span>{isAr ? 'الرئيسية' : 'Hub'}</span>
                                </button>

                                <span className="text-[#192631]/25 font-bold px-0.5">•</span>

                                {NEXUS_LIFECYCLE_STAGES.map((stage, index) => {
                                    const isCurrent = index === activeStageIndex;
                                    const isCompleted = activeStageIndex > index;
                                    const circleSymbol = STEP_CIRCLES[index] || `${stage.stepNumber}.`;

                                    return (
                                        <React.Fragment key={stage.id}>
                                            <button
                                                type="button"
                                                onClick={() => navigate(stage.path)}
                                                title={isAr ? stage.shortDescAr : stage.shortDescEn}
                                                className={clsx(
                                                    'px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1.5 border shrink-0',
                                                    isCurrent
                                                        ? 'bg-[#e04b2a] text-white border-[#e04b2a] shadow-sm scale-[1.02]'
                                                        : isCompleted
                                                        ? 'bg-[#123524] text-white border-[#123524] hover:opacity-95'
                                                        : 'bg-white text-[#192631]/80 border-[#192631]/12 hover:border-[#e04b2a]/50 hover:text-[#192631]'
                                                )}
                                            >
                                                {isCompleted ? (
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                                                ) : (
                                                    <span className="font-extrabold">{circleSymbol}</span>
                                                )}
                                                <span className="whitespace-nowrap">
                                                    {isAr ? stage.titleAr : stage.titleEn}
                                                </span>
                                                <span
                                                    dir="ltr"
                                                    className={clsx(
                                                        'text-[9px] font-black px-1.5 py-0.2 rounded',
                                                        isCurrent
                                                            ? 'bg-white/20 text-white'
                                                            : isCompleted
                                                            ? 'bg-white/15 text-emerald-100'
                                                            : 'bg-[#192631]/[0.06] text-[#192631]/65'
                                                    )}
                                                >
                                                    {stage.badge}
                                                </span>
                                            </button>

                                            {index < NEXUS_LIFECYCLE_STAGES.length - 1 && (
                                                <span className="text-[#192631]/30 text-xs font-bold select-none px-0.5">
                                                    {isAr ? '⬅' : '➔'}
                                                </span>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </div>

                            {/* 1-Click "Next Stage ➔" button on stages 1–5 */}
                            {nextStage && (
                                <button
                                    type="button"
                                    onClick={() => navigate(nextStage.path)}
                                    className="ms-2 shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#123524] hover:bg-[#123524]/90 text-white text-[11px] font-extrabold shadow-sm transition-all"
                                >
                                    <span>
                                        {isAr
                                            ? `الخطوة التالية: ${nextStage.titleAr}`
                                            : `Next Stage: ${nextStage.titleEn}`}
                                    </span>
                                    <ArrowRight className={clsx('w-3.5 h-3.5', isAr && 'rotate-180')} />
                                </button>
                            )}
                        </div>
                    </div>
                )}

                <div className="w-full h-full p-3 md:p-6 lg:p-6 overflow-y-auto">{children}</div>
            </main>

            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-[#192631]/40 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Email Notifications & Permissions Prompt */}
            {role !== 'client' && <MailNotifier />}
        </div>
    );
};
