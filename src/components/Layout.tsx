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
                'flex items-center justify-between px-3 py-2.5 min-h-[44px] lg:min-h-[38px] lg:py-2 rounded-xl border transition-all duration-200 relative overflow-hidden group touch-manipulation select-none',
                isActive
                    ? 'bg-[#e04b2a]/12 text-[#192631] border-[#e04b2a]/35 shadow-sm'
                    : 'bg-transparent border-transparent text-[#192631]/75 hover:border-[#192631]/10 hover:text-[#192631] hover:bg-[#192631]/5 active:bg-[#e04b2a]/10'
            )}
        >
            <div className="flex items-center gap-2.5 min-w-0">
                <div
                    className={clsx(
                        'p-1.5 rounded-lg transition-all duration-200 relative z-10 shrink-0',
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
                        'relative z-10 text-xs lg:text-[11px] tracking-[0.04em] uppercase truncate',
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
    const { language, setLanguage } = useLanguage();
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

    // Prevent background scrolling when mobile sidebar drawer is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isMobileMenuOpen]);

    return (
        <div
            dir={isAr ? 'rtl' : 'ltr'}
            className="min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-[#f5f5f5] font-sans text-[#192631] flex relative selection:bg-[#e04b2a]/20"
        >
            {/* Subtle Architectural Grid & Ambient Orbs (Nexus Brand Guideline Page 5 & 10) */}
            <div
                className="absolute inset-0 opacity-[0.35] pointer-events-none z-0"
                style={{
                    backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(25, 38, 49, 0.08) 1px, transparent 0)',
                    backgroundSize: '24px 24px',
                }}
            />

            {/* Mobile Drawer Backdrop — Placed BEFORE <aside> at z-[90] so <aside> (z-[100]) is always touchable */}
            {isMobileMenuOpen && (
                <div
                    aria-hidden="true"
                    className="fixed inset-0 bg-[#192631]/55 backdrop-blur-[2px] z-[90] lg:hidden transition-opacity"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar — Left in English (LTR), Right in Arabic (RTL), 100dvh touch-scrollable on mobile */}
            <aside
                aria-label={isAr ? 'القائمة الجانبية' : 'Main Sidebar Navigation'}
                className={clsx(
                    'fixed inset-y-0 z-[100] w-[84vw] max-w-[308px] sm:w-80 lg:w-72 h-[100dvh] max-h-[100dvh] lg:h-screen lg:max-h-screen bg-[#f8f9fa] lg:glass-morphism shadow-2xl lg:shadow-none transform transition-transform duration-300 ease-out lg:translate-x-0 lg:sticky lg:top-0 lg:z-30 flex flex-col overflow-hidden pointer-events-auto shrink-0',
                    isAr
                        ? 'right-0 left-auto border-s border-[#192631]/10'
                        : 'left-0 right-auto border-e border-[#192631]/10',
                    isMobileMenuOpen
                        ? 'translate-x-0'
                        : isAr
                        ? 'translate-x-full lg:translate-x-0'
                        : '-translate-x-full lg:translate-x-0'
                )}
            >
                <div className="h-full w-full flex flex-col overflow-hidden">
                    {/* Sticky Sidebar Top Header (Never overlaps Close X button) */}
                    <div className="px-3.5 pt-3.5 pb-2.5 border-b border-[#192631]/10 bg-white/90 shrink-0 space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                            <Logo darkText={true} variant="orange-symbol" />
                            <button
                                type="button"
                                aria-label="Close Sidebar"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#192631]/[0.06] hover:bg-[#e04b2a]/15 text-[#192631] active:scale-95 transition-all shrink-0 touch-manipulation"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Guided vs Full ERP Mode Pill inside Sidebar */}
                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                onClick={toggleViewComplexity}
                                className={clsx(
                                    'flex-1 flex items-center justify-between px-3 py-2 min-h-[40px] rounded-xl border text-xs font-bold transition-all touch-manipulation',
                                    viewComplexity === 'guided'
                                        ? 'bg-[#123524] text-white border-[#123524] shadow-sm'
                                        : 'bg-white text-[#192631] border-[#192631]/15 hover:border-[#e04b2a]'
                                )}
                                title={
                                    isAr
                                        ? 'الوضع المبسط يركز على الـ 6 خطوات الأساسية للمقاولات'
                                        : 'Guided Mode simplifies navigation into the 6 core contracting steps'
                                }
                            >
                                <span className="flex items-center gap-1.5 truncate">
                                    {viewComplexity === 'guided' ? (
                                        <Sparkles className="w-3.5 h-3.5 text-[#e04b2a] shrink-0" />
                                    ) : (
                                        <Layers className="w-3.5 h-3.5 text-[#e04b2a] shrink-0" />
                                    )}
                                    <span className="truncate">
                                        {viewComplexity === 'guided'
                                            ? isAr
                                                ? '⚡ الوضع الموجه (6 خطوات)'
                                                : '⚡ Guided Mode (6 Steps)'
                                            : isAr
                                            ? 'النظام الكامل (Full ERP)'
                                            : 'Full ERP Mode'}
                                    </span>
                                </span>
                                <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/15 shrink-0 ms-1">
                                    {isAr ? 'تبديل' : 'Switch'}
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Independently Touch-Scrollable Navigation Container */}
                    <nav
                        className="space-y-1 flex-1 min-h-0 overflow-y-auto overscroll-contain touch-pan-y px-3 py-2.5"
                        style={{ WebkitOverflowScrolling: 'touch' }}
                    >
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
                        {/* Workspace Switcher inside scrollable area on mobile so footer stays ultra-compact */}
                        {role === 'admin' && organizations.length > 1 && (
                            <div className="pt-3 mt-2 border-t border-[#192631]/10 px-1">
                                <label className="block text-[9px] font-bold text-[#192631]/60 uppercase tracking-widest mb-1">
                                    {isAr ? 'الشركة الفعالة' : 'Active Company Workspace'}
                                </label>
                                <select
                                    value={activeOrg.id}
                                    onChange={e => switchOrganization(e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-[#192631]/15 rounded-xl text-[#192631] text-xs font-bold focus:outline-none focus:border-[#e04b2a]"
                                >
                                    {organizations.map(org => (
                                        <option key={org.id} value={org.id}>
                                            {org.name} ({org.currency})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </nav>

                    {/* Compact Sticky Sidebar Footer (Takes minimal height so nav scrolls freely on iPhone 15 Pro) */}
                    <div className="p-3 border-t border-[#192631]/10 bg-white/95 shrink-0">
                        <div className="flex items-center justify-between gap-2 p-2.5 rounded-2xl bg-[#f5f5f5] border border-[#192631]/10">
                            <div className="flex flex-col min-w-0">
                                <span className="text-[10px] font-extrabold tracking-[0.14em] uppercase text-[#e04b2a] truncate">
                                    {activeOrg.name === 'Apex Contracting & Engineering' ? 'NEXUS CONTRACTING' : activeOrg.name}
                                </span>
                                <span className="font-bold text-[#192631] text-xs truncate">
                                    {user?.email?.split('@')[0] || 'Eng. Pierre Afifi'} ·{' '}
                                    <span className="text-[#123524] uppercase text-[10px]">{role || 'Admin'}</span>
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={signOut}
                                className="inline-flex items-center justify-center w-9 h-9 text-[#e04b2a] bg-white hover:bg-[#e04b2a]/10 border border-[#192631]/10 rounded-xl transition-colors shrink-0 touch-manipulation"
                                title={isAr ? 'تسجيل الخروج' : 'Sign Out'}
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 max-w-full overflow-x-hidden relative z-10">
                {/* Mobile Header — Tailored for iPhone 15 Pro (393px) & All Mobile Sizes */}
                <div className="lg:hidden bg-white/95 backdrop-blur-xl border-b border-[#192631]/10 px-3 py-2.5 flex flex-col gap-2 sticky top-0 z-40 shadow-sm">
                    <div className="flex items-center justify-between gap-1.5">
                        {/* Start Side (Left in English LTR, Right in Arabic RTL): Hamburger Menu + Compact Logo */}
                        <div className="flex items-center gap-2 min-w-0">
                            <button
                                type="button"
                                aria-label={isAr ? 'فتح القائمة الجانبية' : 'Open Sidebar Menu'}
                                onClick={() => setIsMobileMenuOpen(true)}
                                className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#192631] text-white shadow-sm active:scale-95 transition-transform shrink-0 touch-manipulation"
                            >
                                <Menu className="w-5 h-5" />
                            </button>
                            <Logo darkText={true} variant="orange-symbol" />
                        </div>

                        {/* End Side: Segmented [ EN | عربي ] Pill + Guided Toggle + Notifications */}
                        <div className="flex items-center gap-1.5 shrink-0">
                            {/* Unambiguous Segmented Language Switcher */}
                            <div
                                dir="ltr"
                                className="inline-flex items-center rounded-xl bg-[#192631]/[0.06] p-0.5 border border-[#192631]/12"
                            >
                                <button
                                    type="button"
                                    onClick={() => setLanguage('en')}
                                    className={clsx(
                                        'px-2 py-1 rounded-lg text-[10px] font-black transition-all touch-manipulation',
                                        language === 'en'
                                            ? 'bg-[#e04b2a] text-white shadow-sm'
                                            : 'text-[#192631]/70 hover:text-[#192631]'
                                    )}
                                >
                                    EN
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setLanguage('ar')}
                                    className={clsx(
                                        'px-2 py-1 rounded-lg text-[10px] font-black transition-all touch-manipulation',
                                        language === 'ar'
                                            ? 'bg-[#e04b2a] text-white shadow-sm'
                                            : 'text-[#192631]/70 hover:text-[#192631]'
                                    )}
                                >
                                    عربي
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={toggleViewComplexity}
                                title={isAr ? 'تبديل الوضع الموجه / الكامل' : 'Toggle Guided / Full ERP Mode'}
                                className={clsx(
                                    'px-2 py-1.5 min-h-[34px] rounded-xl text-[10px] font-extrabold border transition-colors touch-manipulation',
                                    viewComplexity === 'guided'
                                        ? 'bg-[#123524] text-white border-[#123524]'
                                        : 'bg-white text-[#192631] border-[#192631]/15'
                                )}
                            >
                                {viewComplexity === 'guided' ? (isAr ? '⚡ موجه' : '⚡ Guided') : 'ERP'}
                            </button>

                            <button
                                type="button"
                                aria-label="Notifications"
                                onClick={() => setIsNotifOpen(!isNotifOpen)}
                                className="relative inline-flex items-center justify-center w-9 h-9 text-[#192631]/75 bg-white border border-[#192631]/12 rounded-xl touch-manipulation"
                            >
                                <Bell className="w-4 h-4" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#e04b2a] rounded-full border border-white"></span>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Row 2: Mobile Active Project Selector Pill + Persona Switcher */}
                    <div className="flex items-center gap-1.5">
                        <select
                            aria-label="Active Project Selector Mobile"
                            value={activeProjectCode}
                            onChange={e => setActiveProjectCode(e.target.value)}
                            className="flex-1 min-w-0 px-2.5 py-1.5 min-h-[36px] rounded-xl bg-[#f5f5f5] border border-[#192631]/15 text-[11px] font-bold text-[#192631] truncate focus:outline-none focus:border-[#e04b2a]"
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
                            className="w-[118px] shrink-0 px-2 py-1.5 min-h-[36px] rounded-xl bg-[#f5f5f5] border border-[#192631]/15 text-[11px] font-bold text-[#192631] focus:outline-none focus:border-[#e04b2a]"
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
                    <div className="lg:hidden fixed top-28 right-3 left-3 bg-white/98 backdrop-blur-xl border border-[#192631]/15 shadow-2xl rounded-2xl overflow-hidden z-[85]">
                        <div className="p-3.5 border-b border-[#192631]/10 bg-[#192631]/[0.03] flex justify-between items-center">
                            <h3 className="font-bold text-sm text-[#192631]">
                                {isAr ? 'الإشعارات والتنبيهات' : 'Notifications'}
                            </h3>
                            <span className="text-xs font-medium text-[#192631]/70 px-2 py-0.5 bg-[#192631]/[0.05] rounded-full border border-[#192631]/10">
                                {unreadCount} {isAr ? 'غير مقروء' : 'unread'}
                            </span>
                        </div>
                        <div className="max-h-[55vh] overflow-y-auto no-scrollbar">
                            {myNotifications.length === 0 ? (
                                <div className="p-6 text-center text-[#192631]/60 text-sm">
                                    {isAr ? 'لا توجد إشعارات جديدة' : 'No new notifications'}
                                </div>
                            ) : (
                                myNotifications.map(notif => (
                                    <div
                                        key={notif.id}
                                        className={clsx(
                                            'p-3.5 border-b border-[#192631]/10 last:border-0 hover:bg-[#192631]/[0.04] transition-colors cursor-pointer',
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

                        {/* 4. Segmented Language Switcher (EN LTR Left Sidebar | عربي RTL Right Sidebar) */}
                        <div
                            dir="ltr"
                            className="inline-flex items-center gap-1 p-1 rounded-xl bg-white/90 border border-[#192631]/12 shadow-sm"
                        >
                            <Globe className="w-3.5 h-3.5 text-[#e04b2a] ms-1.5 me-0.5" />
                            <button
                                type="button"
                                onClick={() => setLanguage('en')}
                                className={clsx(
                                    'px-2.5 py-1 rounded-lg text-xs font-extrabold transition-all',
                                    language === 'en'
                                        ? 'bg-[#e04b2a] text-white shadow-sm'
                                        : 'text-[#192631]/70 hover:text-[#192631]'
                                )}
                            >
                                English
                            </button>
                            <button
                                type="button"
                                onClick={() => setLanguage('ar')}
                                className={clsx(
                                    'px-2.5 py-1 rounded-lg text-xs font-extrabold transition-all',
                                    language === 'ar'
                                        ? 'bg-[#e04b2a] text-white shadow-sm'
                                        : 'text-[#192631]/70 hover:text-[#192631]'
                                )}
                            >
                                عربي
                            </button>
                        </div>

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

                {/* Persistent 6-Step Contracting Lifecycle Bar (Swipeable on iPhone 15 Pro & Desktop) */}
                {role !== 'client' && (
                    <div className="px-2.5 sm:px-4 md:px-6 pt-2 pb-1 shrink-0">
                        <div
                            className="bg-white/95 backdrop-blur-md border border-[#192631]/12 rounded-2xl px-2.5 py-1.5 sm:px-3 sm:py-2 shadow-sm flex items-center justify-between gap-2 overflow-x-auto no-scrollbar touch-pan-x"
                            style={{ WebkitOverflowScrolling: 'touch' }}
                        >
                            <div className="flex items-center gap-1 sm:gap-1.5 min-w-max">
                                <button
                                    type="button"
                                    onClick={() => navigate('/')}
                                    className={clsx(
                                        'px-2.5 py-1.5 min-h-[34px] rounded-xl text-[11px] font-extrabold transition-all flex items-center gap-1.5 border touch-manipulation',
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
                                                    'px-2.5 py-1.5 min-h-[34px] rounded-xl text-[11px] font-bold transition-all flex items-center gap-1.5 border shrink-0 touch-manipulation',
                                                    isCurrent
                                                        ? 'bg-[#e04b2a] text-white border-[#e04b2a] shadow-sm'
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
                                                        'text-[9px] font-black px-1.5 py-0.2 rounded hidden sm:inline-block',
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
                                    className="ms-2 shrink-0 flex items-center gap-1.5 px-3 py-1.5 min-h-[34px] rounded-xl bg-[#123524] hover:bg-[#123524]/90 text-white text-[11px] font-extrabold shadow-sm transition-all touch-manipulation"
                                >
                                    <span className="whitespace-nowrap">
                                        {isAr
                                            ? `التالي: ${nextStage.titleAr}`
                                            : `Next: ${nextStage.titleEn}`}
                                    </span>
                                    <ArrowRight className={clsx('w-3.5 h-3.5', isAr && 'rotate-180')} />
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Page Content Container (pb-24 on mobile leaves room for the iOS bottom tab bar) */}
                <div className="w-full flex-1 p-2.5 sm:p-4 md:p-6 pb-24 lg:pb-6 overflow-y-auto overflow-x-hidden">
                    {children}
                </div>

                {/* iPhone 15 Pro / Mobile Bottom Thumb-Zone Navigation Bar */}
                {role !== 'client' && (
                    <div
                        className="lg:hidden fixed bottom-0 inset-x-0 z-[80] bg-white/95 backdrop-blur-xl border-t border-[#192631]/12 px-2 pt-1.5 pb-[max(0.45rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(25,38,49,0.08)]"
                    >
                        <div className="grid grid-cols-5 gap-1 max-w-md mx-auto">
                            <button
                                type="button"
                                onClick={() => {
                                    closeMobileIfOpen();
                                    navigate('/');
                                }}
                                className={clsx(
                                    'flex flex-col items-center justify-center py-1.5 rounded-xl transition-all touch-manipulation',
                                    location.pathname === '/'
                                        ? 'text-[#e04b2a] bg-[#e04b2a]/10 font-black'
                                        : 'text-[#192631]/70 font-semibold'
                                )}
                            >
                                <LayoutDashboard className="w-4 h-4 mb-0.5" />
                                <span className="text-[10px] leading-tight truncate">
                                    {isAr ? 'الرئيسية' : 'Hub'}
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    closeMobileIfOpen();
                                    navigate('/projects');
                                }}
                                className={clsx(
                                    'flex flex-col items-center justify-center py-1.5 rounded-xl transition-all touch-manipulation',
                                    location.pathname.startsWith('/projects')
                                        ? 'text-[#e04b2a] bg-[#e04b2a]/10 font-black'
                                        : 'text-[#192631]/70 font-semibold'
                                )}
                            >
                                <FolderKanban className="w-4 h-4 mb-0.5" />
                                <span className="text-[10px] leading-tight truncate">
                                    {isAr ? 'المشاريع' : 'Projects'}
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    closeMobileIfOpen();
                                    navigate('/boq');
                                }}
                                className={clsx(
                                    'flex flex-col items-center justify-center py-1.5 rounded-xl transition-all touch-manipulation',
                                    location.pathname.startsWith('/boq')
                                        ? 'text-[#e04b2a] bg-[#e04b2a]/10 font-black'
                                        : 'text-[#192631]/70 font-semibold'
                                )}
                            >
                                <Calculator className="w-4 h-4 mb-0.5" />
                                <span className="text-[10px] leading-tight truncate">
                                    {isAr ? '① المقايسة' : '① BOQ'}
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    closeMobileIfOpen();
                                    navigate('/extracts');
                                }}
                                className={clsx(
                                    'flex flex-col items-center justify-center py-1.5 rounded-xl transition-all touch-manipulation',
                                    location.pathname.startsWith('/extracts')
                                        ? 'text-[#e04b2a] bg-[#e04b2a]/10 font-black'
                                        : 'text-[#192631]/70 font-semibold'
                                )}
                            >
                                <Receipt className="w-4 h-4 mb-0.5" />
                                <span className="text-[10px] leading-tight truncate">
                                    {isAr ? '⑤ المستخلص' : '⑤ Extracts'}
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setIsMobileMenuOpen(prev => !prev)}
                                className={clsx(
                                    'flex flex-col items-center justify-center py-1.5 rounded-xl transition-all touch-manipulation',
                                    isMobileMenuOpen
                                        ? 'bg-[#192631] text-white font-black'
                                        : 'text-[#192631]/80 bg-[#192631]/[0.05] font-bold'
                                )}
                            >
                                <Menu className="w-4 h-4 mb-0.5" />
                                <span className="text-[10px] leading-tight truncate">
                                    {isAr ? 'القائمة' : 'Menu'}
                                </span>
                            </button>
                        </div>
                    </div>
                )}
            </main>

            {/* Email Notifications & Permissions Prompt */}
            {role !== 'client' && <MailNotifier />}
        </div>
    );
};

