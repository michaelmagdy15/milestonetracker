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
    FileSignature,
    Truck,
    Receipt,
    GitBranch,
    ChevronLeft,
    ChevronRight,
    Sparkles,
    Layers,
    ArrowRight,
    CheckCircle2,
    Pin,
    Eye,
    Sun,
    Moon,
    Building2,
    Wrench
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { Logo } from './Logo';
import { MailNotifier } from './MailNotifier';
import { CommandPalette } from './CommandPalette';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { useTenant, DEFAULT_ORG_ID, DEC_ORG_ID } from '../context/TenantContext';
import { useTheme } from '../context/ThemeContext';
import { useWorkflow, NEXUS_LIFECYCLE_STAGES } from '../context/WorkflowContext';
import type { WorkflowPersona } from '../context/WorkflowContext';
import { NEXUS_LIVE_PROJECTS } from '../data/nexusLiveSeedData';

const STEP_CIRCLES = ['①', '②', '③', '④', '⑤', '⑥'];

const NavItem = ({
    to,
    icon: Icon,
    label,
    badge,
    collapsed,
    onClick,
}: {
    to: string;
    icon: React.ElementType;
    label: string;
    badge?: string;
    stepBadge?: number;
    collapsed?: boolean;
    onClick?: () => void;
}) => {
    const location = useLocation();
    const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to + '/'));

    return (
        <Link
            to={to}
            onClick={onClick}
            title={collapsed ? label : undefined}
            className={clsx(
                'flex items-center rounded-xl transition-all duration-200 w-full h-10 px-2.5 relative border touch-manipulation select-none active:scale-[0.98]',
                isActive
                    ? 'bg-[#e04b2a] text-white font-bold shadow-md border-[#e04b2a] ring-1 ring-[#e04b2a]/30'
                    : 'bg-slate-100/70 hover:bg-slate-200/70 text-slate-700 hover:text-slate-950 border-slate-200/70 dark:bg-slate-900/60 dark:hover:bg-slate-800/80 dark:text-slate-300 dark:hover:text-white dark:border-slate-800/70',
                collapsed ? 'justify-center px-0' : 'justify-between'
            )}
        >
            <div className={clsx('flex items-center min-w-0', collapsed ? 'justify-center' : 'gap-2.5')}>
                <Icon className={clsx('w-4 h-4 shrink-0', isActive ? 'text-white' : 'text-current opacity-85')} />
                {!collapsed && (
                    <span className="text-xs font-semibold tracking-tight truncate">
                        {label}
                    </span>
                )}
            </div>
            {!collapsed && badge && (
                <span
                    dir="ltr"
                    className={clsx(
                        'text-[9px] font-black px-1.5 py-0.5 rounded-md shrink-0 ms-1.5',
                        isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-200/80 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    )}
                >
                    {badge}
                </span>
            )}
            {collapsed && badge && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#e04b2a] ring-2 ring-white dark:ring-slate-900" />
            )}
        </Link>
    );
};

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
        if (typeof window !== 'undefined' && window.innerWidth >= 768 && window.innerWidth < 1180) {
            return true;
        }
        return localStorage.getItem('mitrixo_sidebar_collapsed') === 'true';
    });

    const { role, signOut, user, engineerId } = useAuth();
    const { projects, engineers, tasks, entries, notifications, markNotificationRead, addNotification } = useData();
    const { language, setLanguage } = useLanguage();
    const { activeOrg, switchOrganization } = useTenant();
    const { theme, toggleTheme } = useTheme();
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
    const isDecPortal = activeOrg.id === DEC_ORG_ID || activeOrg.name.toUpperCase().includes('DEC');

    const toggleSidebarCollapse = () => {
        setIsSidebarCollapsed(prev => {
            const next = !prev;
            localStorage.setItem('mitrixo_sidebar_collapsed', String(next));
            return next;
        });
    };

    useEffect(() => {
        const handleGlobalShortcut = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setIsCommandPaletteOpen(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleGlobalShortcut);
        return () => window.removeEventListener('keydown', handleGlobalShortcut);
    }, []);

    const [showMoreTools, setShowMoreTools] = useState(false);
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

        projects.forEach(p => {
            if (p.name.toLowerCase().includes(q)) {
                results.push({ type: 'Project', title: p.name, id: p.id, url: `/projects/${p.id}`, icon: FolderKanban });
            }
        });

        engineers.forEach(e => {
            if (e.name.toLowerCase().includes(q) || e.role.toLowerCase().includes(q)) {
                results.push({ type: 'Engineer', title: e.name, subtitle: e.role, id: e.id, url: `/engineers`, icon: Users });
            }
        });

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

    const displayUserName = user?.email?.split('@')[0] || (isDecPortal ? 'Eng. Michael Magdy' : 'Eng. Pierre Afifi');

    return (
        <div
            dir={isAr ? 'rtl' : 'ltr'}
            className="min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-[#f8fafc] dark:bg-[#0b0f19] font-sans text-slate-900 dark:text-slate-100 flex relative selection:bg-[#e04b2a]/20"
        >
            {/* Mitrixo Floating Role Preview Banner — visible when previewing non-CEO persona */}
            {activePersona !== 'ceo' && (
                <div className="fixed bottom-16 lg:bottom-5 left-1/2 -translate-x-1/2 z-[95] animate-in fade-in duration-200">
                    <button
                        type="button"
                        onClick={() => setActivePersona('ceo')}
                        className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-full shadow-lg shadow-amber-500/30 transition-colors"
                    >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Previewing Role: {activePersona.toUpperCase()}</span>
                        <span>·</span>
                        <X className="w-3.5 h-3.5" />
                        <span>Reset to CEO View</span>
                    </button>
                </div>
            )}

            {/* Mobile Drawer Backdrop */}
            {isMobileMenuOpen && (
                <div
                    aria-hidden="true"
                    className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[90] lg:hidden transition-opacity"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Mitrixo Collapsible Sidebar (w-64 expanded ↔ w-[68px] collapsed on desktop) */}
            <aside
                aria-label={isAr ? 'القائمة الجانبية' : 'Main Sidebar Navigation'}
                className={clsx(
                    'fixed inset-y-0 z-[100] h-[100dvh] max-h-[100dvh] lg:h-screen lg:max-h-screen bg-white dark:bg-[#111827] shadow-2xl lg:shadow-none transform transition-all duration-300 ease-out lg:translate-x-0 lg:sticky lg:top-0 lg:z-30 flex flex-col overflow-hidden pointer-events-auto shrink-0 sidebar-transition',
                    isSidebarCollapsed ? 'w-[280px] lg:w-[68px]' : 'w-[280px] lg:w-64',
                    isAr
                        ? 'right-0 left-auto border-s border-slate-200/80 dark:border-slate-800/80'
                        : 'left-0 right-auto border-e border-slate-200/80 dark:border-slate-800/80',
                    isMobileMenuOpen
                        ? 'translate-x-0'
                        : isAr
                        ? 'translate-x-full lg:translate-x-0'
                        : '-translate-x-full lg:translate-x-0'
                )}
            >
                {/* Sidebar Header: Brand Logo + 1-Click Dual-Tenant Switcher (DEC Portal ↔ Nexus ERP) */}
                <div className="p-3 border-b border-slate-200/80 dark:border-slate-800/80 shrink-0 space-y-2.5">
                    <div className={clsx('flex items-center', isSidebarCollapsed ? 'lg:justify-center justify-between' : 'justify-between')}>
                        <div
                            onClick={() => navigate('/')}
                            className="cursor-pointer hover:opacity-90 transition-opacity"
                        >
                            <Logo collapsed={isSidebarCollapsed} />
                        </div>
                        <button
                            type="button"
                            aria-label="Close Sidebar"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="lg:hidden inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* 1-Click Tenant Switcher right at the top of the Sidebar */}
                    {!isSidebarCollapsed ? (
                        <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                            <button
                                type="button"
                                onClick={() => switchOrganization(DEC_ORG_ID)}
                                className={clsx(
                                    'py-1.5 px-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all truncate',
                                    isDecPortal
                                        ? 'bg-[#e04b2a] text-white shadow-sm'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                )}
                                title="Switch to DEC Milestone Portal"
                            >
                                DEC Portal
                            </button>
                            <button
                                type="button"
                                onClick={() => switchOrganization(DEFAULT_ORG_ID)}
                                className={clsx(
                                    'py-1.5 px-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all truncate',
                                    !isDecPortal
                                        ? 'bg-[#192631] text-white shadow-sm'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                )}
                                title="Switch to NEXUS Contracting ERP"
                            >
                                NEXUS ERP
                            </button>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => switchOrganization(isDecPortal ? DEFAULT_ORG_ID : DEC_ORG_ID)}
                            title={isDecPortal ? 'Active: DEC Portal (Click for NEXUS)' : 'Active: NEXUS ERP (Click for DEC Portal)'}
                            className="hidden lg:flex w-full h-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-[#e04b2a] hover:bg-[#e04b2a] hover:text-white transition-colors"
                        >
                            <Building2 className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Scrollable Mitrixo Navigation Rail */}
                <nav className="flex-1 overflow-y-auto p-2.5 space-y-3 no-scrollbar">
                    {/* GROUP 1: OPERATIONS & 5-GATE */}
                    <div className="space-y-1">
                        {!isSidebarCollapsed && (
                            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2.5 pt-1 pb-0.5">
                                {isAr ? 'العمليات والمشاريع' : 'Operations'}
                            </div>
                        )}
                        <NavItem
                            to="/"
                            icon={LayoutDashboard}
                            label={isAr ? 'لوحة القيادة' : 'Dashboard'}
                            collapsed={isSidebarCollapsed}
                            onClick={closeMobileIfOpen}
                        />
                        {role !== 'client' && (
                            <>
                                <NavItem
                                    to="/projects"
                                    icon={FolderKanban}
                                    label={isAr ? 'المشاريع (Projects)' : 'Projects'}
                                    badge="77"
                                    collapsed={isSidebarCollapsed}
                                    onClick={closeMobileIfOpen}
                                />
                                <NavItem
                                    to="/proposals"
                                    icon={FileSignature}
                                    label={isAr ? 'عروض RIBA والـ 5 بوابات' : 'RIBA Proposals & 5-Gate'}
                                    badge="5-Gate"
                                    collapsed={isSidebarCollapsed}
                                    onClick={closeMobileIfOpen}
                                />
                            </>
                        )}
                    </div>

                    {role !== 'client' && (
                        <>
                            {/* GROUP 2: TECHNICAL OFFICE */}
                            <div className="space-y-1">
                                {!isSidebarCollapsed ? (
                                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2.5 pt-1 pb-0.5">
                                        {isAr ? 'المكتب الفني' : 'Technical Office'}
                                    </div>
                                ) : (
                                    <div className="border-t border-slate-200/60 dark:border-slate-800 my-1" />
                                )}
                                <NavItem
                                    to="/boq"
                                    icon={Calculator}
                                    label={isAr ? '① المقايسة R02' : '① BOQ & Pricing'}
                                    badge="839"
                                    collapsed={isSidebarCollapsed}
                                    onClick={closeMobileIfOpen}
                                />
                                <NavItem
                                    to="/submittals"
                                    icon={FileCheck2}
                                    label={isAr ? '② الاعتمادات الفنية' : '② Submittals'}
                                    badge="51"
                                    collapsed={isSidebarCollapsed}
                                    onClick={closeMobileIfOpen}
                                />
                                <NavItem
                                    to="/variations-rfis"
                                    icon={GitBranch}
                                    label={isAr ? 'أوامر التغيير RFIs' : 'Variations & RFIs'}
                                    collapsed={isSidebarCollapsed}
                                    onClick={closeMobileIfOpen}
                                />
                            </div>

                            {/* GROUP 3: SITE & PROCUREMENT */}
                            <div className="space-y-1">
                                {!isSidebarCollapsed ? (
                                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2.5 pt-1 pb-0.5">
                                        {isAr ? 'الموقع والمشتريات' : 'Site & Procurement'}
                                    </div>
                                ) : (
                                    <div className="border-t border-slate-200/60 dark:border-slate-800 my-1" />
                                )}
                                <NavItem
                                    to="/procurement"
                                    icon={Truck}
                                    label={isAr ? '③ المشتريات والمخازن' : '③ Procurement'}
                                    badge="4"
                                    collapsed={isSidebarCollapsed}
                                    onClick={closeMobileIfOpen}
                                />
                                <NavItem
                                    to="/subcontractors"
                                    icon={HardHat}
                                    label={isAr ? '④ مقاولي الباطن' : '④ Subcontractors'}
                                    badge="56"
                                    collapsed={isSidebarCollapsed}
                                    onClick={closeMobileIfOpen}
                                />
                                <NavItem
                                    to="/engineers"
                                    icon={Users}
                                    label={isAr ? 'المهندسين والفرق' : 'Engineers'}
                                    badge="16"
                                    collapsed={isSidebarCollapsed}
                                    onClick={closeMobileIfOpen}
                                />
                                <NavItem
                                    to="/attendance"
                                    icon={CalendarCheck}
                                    label={isAr ? 'الحضور GPS' : 'Attendance & GPS'}
                                    collapsed={isSidebarCollapsed}
                                    onClick={closeMobileIfOpen}
                                />
                            </div>

                            {/* GROUP 4: FINANCE & MANAGEMENT */}
                            <div className="space-y-1">
                                {!isSidebarCollapsed ? (
                                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2.5 pt-1 pb-0.5">
                                        {isAr ? 'المالية والإدارة' : 'Finance & Admin'}
                                    </div>
                                ) : (
                                    <div className="border-t border-slate-200/60 dark:border-slate-800 my-1" />
                                )}
                                <NavItem
                                    to="/extracts"
                                    icon={Receipt}
                                    label={isAr ? '⑤ المستخلصات والعملاء' : '⑤ Extracts & Ledger'}
                                    badge="80"
                                    collapsed={isSidebarCollapsed}
                                    onClick={closeMobileIfOpen}
                                />
                                {role === 'admin' && (
                                    <NavItem
                                        to="/financials"
                                        icon={DollarSign}
                                        label={isAr ? '⑥ الخزينة والسيولة' : '⑥ Financials'}
                                        badge="16"
                                        collapsed={isSidebarCollapsed}
                                        onClick={closeMobileIfOpen}
                                    />
                                )}
                                {!isSidebarCollapsed && (
                                    <button
                                        type="button"
                                        onClick={() => setShowMoreTools(prev => !prev)}
                                        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                                    >
                                        <span className="flex items-center gap-2">
                                            <Wrench className="w-3.5 h-3.5 text-[#e04b2a]" />
                                            {isAr ? 'أدوات إضافية' : 'More Workspace Tools'}
                                        </span>
                                        <ChevronRight className={clsx('w-3.5 h-3.5 transition-transform', showMoreTools && 'rotate-90')} />
                                    </button>
                                )}
                                {(showMoreTools || isSidebarCollapsed) && (
                                    <div className="space-y-1 pt-0.5">
                                        <NavItem
                                            to="/entries"
                                            icon={FileText}
                                            label={isAr ? 'اليوميات' : 'Daily Entries'}
                                            collapsed={isSidebarCollapsed}
                                            onClick={closeMobileIfOpen}
                                        />
                                        <NavItem
                                            to="/meetings"
                                            icon={Calendar}
                                            label={isAr ? 'الاجتماعات' : 'Meetings'}
                                            collapsed={isSidebarCollapsed}
                                            onClick={closeMobileIfOpen}
                                        />
                                        <NavItem
                                            to="/emails"
                                            icon={Mail}
                                            label={isAr ? 'المراسلات' : 'Emails'}
                                            collapsed={isSidebarCollapsed}
                                            onClick={closeMobileIfOpen}
                                        />
                                        {role === 'admin' && (
                                            <NavItem
                                                to="/reports"
                                                icon={PieChart}
                                                label={isAr ? 'التقارير' : 'Reports'}
                                                collapsed={isSidebarCollapsed}
                                                onClick={closeMobileIfOpen}
                                            />
                                        )}
                                        {role === 'admin' && (
                                            <NavItem
                                                to="/settings"
                                                icon={Palette}
                                                label={isAr ? 'إعدادات الهوية' : 'White-Label Studio'}
                                                collapsed={isSidebarCollapsed}
                                                onClick={closeMobileIfOpen}
                                            />
                                        )}
                                        <NavItem
                                            to="/help"
                                            icon={BookOpen}
                                            label={isAr ? 'دليل التشغيل' : 'Help Guide'}
                                            collapsed={isSidebarCollapsed}
                                            onClick={closeMobileIfOpen}
                                        />
                                        <NavItem
                                            to="/profile"
                                            icon={User}
                                            label={isAr ? 'ملفي الشخصي' : 'My Profile'}
                                            collapsed={isSidebarCollapsed}
                                            onClick={closeMobileIfOpen}
                                        />
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </nav>

                {/* Mitrixo-Style Sidebar Footer: Avatar + Role + Theme Toggle + Collapse Toggle + Sign Out */}
                <div className="p-2.5 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/50 flex flex-col gap-2 shrink-0">
                    <div className={clsx('flex items-center', isSidebarCollapsed ? 'justify-center' : 'gap-2.5 px-1')}>
                        <div
                            onClick={() => navigate('/profile')}
                            title="My Profile"
                            className="w-8 h-8 rounded-full bg-[#e04b2a]/15 border border-[#e04b2a]/30 text-[#e04b2a] flex items-center justify-center font-black text-xs cursor-pointer shrink-0"
                        >
                            {displayUserName.charAt(0).toUpperCase()}
                        </div>
                        {!isSidebarCollapsed && (
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                                    {displayUserName}
                                </p>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-[#e04b2a] truncate">
                                    {isDecPortal ? 'DEC Portal' : 'NEXUS ERP'} · {role || 'Admin'}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className={clsx('flex items-center justify-between border-t border-slate-200/60 dark:border-slate-800 pt-2', isSidebarCollapsed ? 'flex-col gap-1.5' : 'flex-row')}>
                        <button
                            type="button"
                            onClick={toggleTheme}
                            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors"
                        >
                            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
                        </button>

                        <button
                            type="button"
                            onClick={toggleSidebarCollapse}
                            title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
                            className="hidden lg:inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors"
                        >
                            {isSidebarCollapsed ? (
                                isAr ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
                            ) : (
                                isAr ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={signOut}
                            title={isAr ? 'تسجيل الخروج' : 'Sign Out'}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-rose-600 hover:bg-rose-500/10 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Pane */}
            <main className="flex-1 flex flex-col min-w-0 max-w-full overflow-x-hidden relative z-10">
                {/* Unified Mitrixo Top Header (Mobile + Desktop) */}
                <header className="sticky top-0 z-40 h-16 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-[#111827]/95 backdrop-blur-xl px-3 sm:px-6 flex items-center justify-between gap-3 shrink-0 shadow-sm">
                    {/* Left: Mobile Menu + Search Input (with Ctrl+K) */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <button
                            type="button"
                            aria-label="Open menu"
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 shrink-0"
                        >
                            <Menu className="w-5 h-5" />
                        </button>

                        <div className="lg:hidden">
                            <Logo showText={false} />
                        </div>

                        {/* Universal Search Bar */}
                        <div ref={searchRef} className="relative flex-1 max-w-md z-30">
                            <div className="flex items-center w-full h-9 px-3 rounded-xl bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 focus-within:border-[#e04b2a] transition-all">
                                <Search className="w-4 h-4 me-2 text-slate-400 shrink-0" />
                                <input
                                    type="text"
                                    placeholder={
                                        isAr
                                            ? 'ابحث في المشاريع، المقايسة، الاعتمادات...'
                                            : 'Search projects, BOQ, submittals, BIM...'
                                    }
                                    className="bg-transparent border-none w-full outline-none text-xs font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400"
                                    value={searchQuery}
                                    onChange={e => {
                                        setSearchQuery(e.target.value);
                                        setIsSearchOpen(true);
                                    }}
                                    onFocus={() => setIsSearchOpen(true)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setIsCommandPaletteOpen(true)}
                                    className="ms-1.5 px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 hover:bg-[#e04b2a] hover:text-white text-[10px] font-black text-slate-500 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors shrink-0"
                                    title="Open Universal Command Palette (Ctrl+K)"
                                >
                                    Ctrl+K
                                </button>
                            </div>

                            {isSearchOpen && searchQuery.trim() && (
                                <div className="absolute top-11 start-0 w-full sm:w-96 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                                    {searchResults.length === 0 ? (
                                        <div className="p-4 text-center text-slate-500 text-xs">
                                            No results found for "{searchQuery}"
                                        </div>
                                    ) : (
                                        <div className="max-h-80 overflow-y-auto py-1.5 no-scrollbar">
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
                                                        className="w-full text-start px-3.5 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3 transition-colors"
                                                    >
                                                        <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-[#e04b2a]">
                                                            <Icon className="w-4 h-4" />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="font-bold text-slate-900 dark:text-white text-xs truncate">{result.title}</p>
                                                            <p className="text-[11px] text-slate-500 truncate">
                                                                <span className="text-[#e04b2a] font-semibold">{result.type}</span>
                                                                {result.subtitle ? ` · ${result.subtitle}` : ''}
                                                            </p>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Active Project Pill + Role Preview + Theme Toggle + Language + Notifications */}
                    <div className="flex items-center gap-2 shrink-0">
                        {/* 1. Active Project Selector (Desktop) */}
                        <div className="hidden xl:flex items-center gap-1.5 h-9 px-3 rounded-xl bg-slate-100/90 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                            <Pin className="w-3.5 h-3.5 text-[#e04b2a] shrink-0" />
                            <select
                                aria-label="Global Active Project Selector"
                                value={activeProjectCode}
                                onChange={e => setActiveProjectCode(e.target.value)}
                                className="bg-transparent border-none text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer max-w-[210px] truncate"
                            >
                                <option value="ALL">
                                    {isAr ? 'كل المشاريع (77 مشروع)' : 'All 77 Projects (Portfolio)'}
                                </option>
                                {NEXUS_LIVE_PROJECTS.map(proj => (
                                    <option key={proj.id} value={proj.code}>
                                        {proj.code} - {proj.clientName}
                                    </option>
                                ))}
                            </select>
                            {activeProject && (
                                <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                                    {activeProject.completionPercent}%
                                </span>
                            )}
                        </div>

                        {/* 2. Mitrixo Role Preview Selector */}
                        <div className="hidden md:flex items-center gap-1.5 h-9 px-2.5 rounded-xl bg-slate-100/90 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                            <Eye className="w-3.5 h-3.5 text-[#e04b2a] shrink-0" />
                            <select
                                aria-label="Role Persona Quick Switcher"
                                value={activePersona}
                                onChange={e => setActivePersona(e.target.value as WorkflowPersona)}
                                className="bg-transparent border-none text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                            >
                                <option value="ceo">{isAr ? 'الإدارة (CEO)' : 'CEO View'}</option>
                                <option value="technical">{isAr ? 'المكتب الفني' : 'Technical Office'}</option>
                                <option value="accounting">{isAr ? 'الحسابات' : 'Accounting'}</option>
                                <option value="logistics">{isAr ? 'المخازن' : 'Logistics'}</option>
                            </select>
                        </div>

                        {/* 3. Guided vs Full ERP Mode Pill */}
                        <button
                            type="button"
                            onClick={toggleViewComplexity}
                            title="Toggle Guided / Full Mode"
                            className={clsx(
                                'hidden sm:inline-flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-bold border transition-all',
                                viewComplexity === 'guided'
                                    ? 'bg-[#123524] text-white border-[#123524]'
                                    : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800'
                            )}
                        >
                            {viewComplexity === 'guided' ? (
                                <>
                                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                                    <span>{isAr ? 'الوضع الموجه' : 'Guided'}</span>
                                </>
                            ) : (
                                <>
                                    <Layers className="w-3.5 h-3.5 text-[#e04b2a]" />
                                    <span>Full ERP</span>
                                </>
                            )}
                        </button>

                        {/* 4. Mitrixo Sun/Moon Theme Toggle */}
                        <button
                            type="button"
                            onClick={toggleTheme}
                            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                            className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:border-[#e04b2a] transition-colors"
                        >
                            {theme === 'dark' ? (
                                <Sun className="w-4 h-4 text-amber-400" />
                            ) : (
                                <Moon className="w-4 h-4 text-slate-700" />
                            )}
                        </button>

                        {/* 5. Segmented Language Switcher */}
                        <div
                            dir="ltr"
                            className="inline-flex items-center h-9 p-0.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800"
                        >
                            <button
                                type="button"
                                onClick={() => setLanguage('en')}
                                className={clsx(
                                    'px-2 h-7 rounded-lg text-[11px] font-black transition-all',
                                    language === 'en'
                                        ? 'bg-[#e04b2a] text-white shadow-sm'
                                        : 'text-slate-600 dark:text-slate-400'
                                )}
                            >
                                EN
                            </button>
                            <button
                                type="button"
                                onClick={() => setLanguage('ar')}
                                className={clsx(
                                    'px-2 h-7 rounded-lg text-[11px] font-black transition-all',
                                    language === 'ar'
                                        ? 'bg-[#e04b2a] text-white shadow-sm'
                                        : 'text-slate-600 dark:text-slate-400'
                                )}
                            >
                                عربي
                            </button>
                        </div>

                        {/* 6. Notifications Bell */}
                        <div ref={notifRef} className="relative">
                            <button
                                type="button"
                                onClick={() => setIsNotifOpen(!isNotifOpen)}
                                className="relative inline-flex items-center justify-center w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:border-[#e04b2a] transition-colors"
                            >
                                <Bell className="w-4 h-4" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#e04b2a] rounded-full ring-2 ring-white dark:ring-slate-900" />
                                )}
                            </button>

                            {isNotifOpen && (
                                <div className="absolute top-11 end-0 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl overflow-hidden z-50">
                                    <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                                        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
                                            {isAr ? 'الإشعارات' : 'Notifications'}
                                        </h3>
                                        <span className="text-[11px] font-bold text-[#e04b2a] px-2 py-0.5 bg-[#e04b2a]/10 rounded-full">
                                            {unreadCount} {isAr ? 'غير مقروء' : 'unread'}
                                        </span>
                                    </div>
                                    <div className="max-h-80 overflow-y-auto no-scrollbar">
                                        {myNotifications.length === 0 ? (
                                            <div className="p-6 text-center text-slate-500 text-xs">
                                                {isAr ? 'لا توجد إشعارات جديدة' : 'No new notifications'}
                                            </div>
                                        ) : (
                                            myNotifications.map(notif => (
                                                <div
                                                    key={notif.id}
                                                    className={clsx(
                                                        'p-3.5 border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer',
                                                        !notif.isRead && 'bg-[#e04b2a]/5'
                                                    )}
                                                    onClick={() => {
                                                        if (!notif.isRead) markNotificationRead(notif.id);
                                                        setIsNotifOpen(false);
                                                    }}
                                                >
                                                    <p className={clsx('text-xs', notif.isRead ? 'text-slate-500' : 'text-slate-900 dark:text-white font-bold')}>
                                                        {notif.message}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400 mt-1">
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
                </header>

                {/* Contextual 6-Stage Step Bar — Shown ONLY on Stage 1–6 pages so the main Dashboard stays clean and uncluttered */}
                {role !== 'client' && activeStageIndex >= 0 && (
                    <div className="px-3 sm:px-6 pt-3 pb-1 shrink-0">
                        <div className="mitrixo-card px-3 py-2 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
                            <div className="flex items-center gap-1.5 min-w-max">
                                <button
                                    type="button"
                                    onClick={() => navigate('/')}
                                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-[#e04b2a] hover:text-white transition-colors flex items-center gap-1.5"
                                >
                                    <LayoutDashboard className="w-3.5 h-3.5" />
                                    <span>{isAr ? 'الرئيسية' : 'Hub'}</span>
                                </button>
                                <span className="text-slate-300 dark:text-slate-700">•</span>
                                {NEXUS_LIFECYCLE_STAGES.map((stage, index) => {
                                    const isCurrent = index === activeStageIndex;
                                    const isCompleted = activeStageIndex > index;
                                    const circleSymbol = STEP_CIRCLES[index] || `${stage.stepNumber}.`;
                                    return (
                                        <React.Fragment key={stage.id}>
                                            <button
                                                type="button"
                                                onClick={() => navigate(stage.path)}
                                                className={clsx(
                                                    'px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0',
                                                    isCurrent
                                                        ? 'bg-[#e04b2a] text-white shadow-sm'
                                                        : isCompleted
                                                        ? 'bg-[#123524] text-white'
                                                        : 'bg-slate-100/80 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                                                )}
                                            >
                                                {isCompleted ? (
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                                                ) : (
                                                    <span>{circleSymbol}</span>
                                                )}
                                                <span className="whitespace-nowrap">{isAr ? stage.titleAr : stage.titleEn}</span>
                                            </button>
                                            {index < NEXUS_LIFECYCLE_STAGES.length - 1 && (
                                                <span className="text-slate-300 dark:text-slate-700 text-[10px]">➔</span>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </div>

                            {nextStage && (
                                <button
                                    type="button"
                                    onClick={() => navigate(nextStage.path)}
                                    className="ms-2 shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#123524] text-white text-xs font-bold"
                                >
                                    <span>{isAr ? `التالي: ${nextStage.titleAr}` : `Next: ${nextStage.titleEn}`}</span>
                                    <ArrowRight className={clsx('w-3.5 h-3.5', isAr && 'rotate-180')} />
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Main Viewport Content */}
                <div className="w-full flex-1 p-3 sm:p-5 lg:p-6 pb-24 lg:pb-8 overflow-y-auto overflow-x-hidden">
                    {children}
                </div>

                {/* Mobile Bottom Tab Bar */}
                {role !== 'client' && (
                    <div className="lg:hidden fixed bottom-0 inset-x-0 z-[80] bg-white/95 dark:bg-[#111827]/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 px-2 pt-1.5 pb-[max(0.45rem,env(safe-area-inset-bottom))]">
                        <div className="grid grid-cols-5 gap-1 max-w-md mx-auto">
                            {[
                                { path: '/', label: isAr ? 'الرئيسية' : 'Hub', icon: LayoutDashboard },
                                { path: '/projects', label: isAr ? 'المشاريع' : 'Projects', icon: FolderKanban },
                                { path: '/proposals', label: isAr ? 'العروض' : '5-Gate', icon: FileSignature },
                                { path: '/boq', label: isAr ? 'المقايسة' : 'BOQ', icon: Calculator },
                                { path: '/financials', label: isAr ? 'المالية' : 'Finance', icon: DollarSign },
                            ].map(tab => {
                                const Icon = tab.icon;
                                const active = tab.path === '/' ? location.pathname === '/' : location.pathname.startsWith(tab.path);
                                return (
                                    <button
                                        key={tab.path}
                                        type="button"
                                        onClick={() => {
                                            closeMobileIfOpen();
                                            navigate(tab.path);
                                        }}
                                        className={clsx(
                                            'flex flex-col items-center justify-center py-1.5 rounded-xl transition-all',
                                            active
                                                ? 'text-[#e04b2a] bg-[#e04b2a]/10 font-black'
                                                : 'text-slate-500 dark:text-slate-400 font-semibold'
                                        )}
                                    >
                                        <Icon className="w-4 h-4 mb-0.5" />
                                        <span className="text-[10px] leading-tight truncate">{tab.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                <MailNotifier />
                <CommandPalette
                    isOpen={isCommandPaletteOpen}
                    onClose={() => setIsCommandPaletteOpen(false)}
                    onOpenProvisioner={() => navigate('/settings')}
                />
            </main>
        </div>
    );
};
