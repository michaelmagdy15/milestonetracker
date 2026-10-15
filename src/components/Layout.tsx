import React, { useState, useRef, useEffect } from 'react';
import { LayoutDashboard, FolderKanban, Users, FileText, PieChart, Menu, X, LogOut, CalendarCheck, Search, Bell, User, DollarSign, Mail, Calendar, Calculator, BookOpen, Palette, HardHat, FileCheck2, Truck, Receipt, GitBranch } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { Logo } from './Logo';
import { MailNotifier } from './MailNotifier';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { useTenant } from '../context/TenantContext';
import { Globe } from 'lucide-react';

const NavSectionLabel = ({ label }: { label: string }) => (
    <div className="px-3 pt-3.5 pb-1 first:pt-0">
        <span
            className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#192631]/45"
            style={{ fontFamily: "'Aventa', sans-serif" }}
        >
            {label}
        </span>
    </div>
);

const NavItem = ({ to, icon: Icon, label, badge }: { to: string; icon: React.ElementType; label: string; badge?: string }) => {
    const location = useLocation();
    const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to + '/'));

    return (
        <Link
            to={to}
            className={clsx(
                'flex items-center justify-between px-3.5 py-2 rounded-xl border transition-all duration-300 relative overflow-hidden group',
                isActive
                    ? 'bg-[#e04b2a]/12 text-[#192631] border-[#e04b2a]/30 shadow-sm'
                    : 'bg-transparent border-transparent text-[#192631]/75 hover:border-[#192631]/10 hover:text-[#192631] hover:bg-[#192631]/5'
            )}
        >
            <div className="flex items-center space-x-2.5 min-w-0">
                <div
                    className={clsx(
                        'p-1.5 rounded-lg transition-all duration-300 relative z-10 shrink-0',
                        isActive
                            ? 'bg-[#e04b2a] text-white shadow-sm'
                            : 'bg-[#192631]/5 text-[#192631]/70 group-hover:bg-[#e04b2a]/15 group-hover:text-[#e04b2a]'
                    )}
                >
                    <Icon className="w-4 h-4" />
                </div>
                <span
                    className={clsx(
                        'relative z-10 text-[11px] tracking-[0.09em] uppercase truncate',
                        isActive ? 'font-bold text-[#192631]' : 'font-semibold text-[#192631]/80'
                    )}
                    style={{ fontFamily: "'Alte Haas Grotesk', 'Plus Jakarta Sans', sans-serif" }}
                >
                    {label}
                </span>
            </div>
            {badge && (
                <span className={clsx(
                    'text-[9px] font-black px-1.5 py-0.5 rounded-md border shrink-0 ml-1.5',
                    isActive
                        ? 'bg-[#e04b2a] text-white border-[#e04b2a]'
                        : 'bg-[#192631]/5 text-[#192631]/70 border-[#192631]/10'
                )}>
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
    const navigate = useNavigate();

    const notifiedTasksRef = useRef<Set<string>>(new Set());

    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const notifRef = useRef<HTMLDivElement>(null);

    const myNotifications = notifications.filter(n => n.engineerId === engineerId).sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
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
                    const alreadyInDb = notifications.some(n => n.type === 'overdue_task' && n.projectId === task.id && n.engineerId === engineerId);
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
                                projectId: task.id
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
        const results: Array<{ type: string; title: string; subtitle?: string; id: string; url: string; icon: React.ElementType }> = [];

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
                results.push({ type: 'Task', title: t.title, subtitle: `In ${project?.name || 'Unknown'}`, id: t.id, url: `/projects/${t.projectId}`, icon: LayoutDashboard });
            }
        });

        // Search Entries
        entries.forEach(e => {
            if (e.taskDescription.toLowerCase().includes(q) || e.tags?.some(tag => tag.toLowerCase().includes(q))) {
                results.push({ type: 'Entry', title: e.taskDescription.length > 40 ? e.taskDescription.slice(0, 40) + '...' : e.taskDescription, subtitle: `Log Entry`, id: e.id, url: `/entries`, icon: FileText });
            }
        });

        return results.slice(0, 8);
    }, [searchQuery, projects, engineers, tasks, entries]);

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
            <aside className={clsx(
                "fixed inset-y-0 left-0 z-50 w-72 glass-morphism transform transition-all duration-500 ease-in-out lg:translate-x-0 lg:static lg:block h-full",
                isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="h-full flex flex-col p-5 overflow-y-auto no-scrollbar">
                    <div className="mb-4 flex items-center justify-between lg:justify-start space-x-3 shrink-0">
                        <div className="flex items-center justify-center lg:justify-start w-full pb-3.5 border-b border-[#192631]/10">
                            <Logo darkText={true} variant="orange-symbol" />
                        </div>
                        <button
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="lg:hidden absolute top-4 right-4 p-2 text-[#192631]/60 hover:text-[#192631]"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <nav className="space-y-1 flex-1">
                        <NavSectionLabel label="Overview & Projects" />
                        <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
                        {role !== 'client' && <NavItem to="/projects" icon={FolderKanban} label="Projects" badge="46" />}
                        {role !== 'client' && <NavItem to="/meetings" icon={Calendar} label="Meetings" />}
                        {role !== 'client' && <NavItem to="/entries" icon={FileText} label="Daily Entries" />}

                        {role !== 'client' && (
                            <>
                                <NavSectionLabel label="Engineering & Technical" />
                                <NavItem to="/boq" icon={Calculator} label="BOQ & R02 Pricing" badge="839" />
                                <NavItem to="/submittals" icon={FileCheck2} label="Submittals & Coding" badge="51" />
                                <NavItem to="/variations-rfis" icon={GitBranch} label="Variations & RFIs" />
                                <NavItem to="/emails" icon={Mail} label="Emails & Transmittals" />

                                <NavSectionLabel label="Procurement & Field" />
                                <NavItem to="/procurement" icon={Truck} label="Procurement & Stores" badge="4" />
                                <NavItem to="/subcontractors" icon={HardHat} label="Subcontractors" badge="56" />
                                <NavItem to="/engineers" icon={Users} label="Engineers & Team" />
                                <NavItem to="/attendance" icon={CalendarCheck} label="Attendance & GPS" badge="21→20" />
                            </>
                        )}

                        <NavSectionLabel label="Finance & System" />
                        {role !== 'client' && <NavItem to="/extracts" icon={Receipt} label="Extracts & Ledger" badge="E#4" />}
                        {role === 'admin' && <NavItem to="/financials" icon={DollarSign} label="Financials & Treasury" />}
                        {role === 'admin' && <NavItem to="/reports" icon={PieChart} label="Reports" />}
                        {role === 'admin' && <NavItem to="/settings" icon={Palette} label="White-Label Studio" />}
                        <NavItem to="/help" icon={BookOpen} label="Help Guide" />
                        <NavItem to="/profile" icon={User} label="My Profile" />
                    </nav>

                    <div className="pt-4 border-t border-[#192631]/10 flex flex-col space-y-3 shrink-0 mt-4">
                        {role === 'admin' && organizations.length > 1 && (
                            <div className="px-1">
                                <label className="block text-[9px] font-bold text-[#192631]/60 uppercase tracking-widest mb-1">
                                    Active Company Workspace
                                </label>
                                <select
                                    value={activeOrg.id}
                                    onChange={(e) => switchOrganization(e.target.value)}
                                    className="w-full px-3 py-2 bg-white/80 border border-[#192631]/15 rounded-xl text-[#192631] text-xs font-bold focus:outline-none focus:border-[#e04b2a]"
                                >
                                    {organizations.map(org => (
                                        <option key={org.id} value={org.id}>
                                            {org.name} ({org.currency})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="glass-card rounded-2xl p-3.5">
                            <p
                                className="text-[10px] font-bold tracking-[0.22em] uppercase text-[#e04b2a] mb-0.5 truncate"
                                style={{ fontFamily: "'Aventa', sans-serif" }}
                            >
                                {activeOrg.name === 'Apex Contracting & Engineering' ? 'NEXUS CONTRACTING' : activeOrg.name}
                            </p>
                            <p className="text-xs font-medium tracking-tight text-[#192631]/75 truncate">
                                Eng. Pierre Afifi · Cairo, Egypt
                            </p>
                        </div>

                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/70 border border-[#192631]/10">
                            <div className="flex flex-col min-w-0">
                                <span className="font-bold text-[#192631] text-xs truncate uppercase tracking-wider">{user?.email?.split('@')[0] || 'User'}</span>
                                <span className="text-[10px] text-[#e04b2a] font-bold uppercase tracking-widest mt-0.5">{role || 'Engineer'}</span>
                            </div>
                            <button onClick={signOut} className="p-2 text-[#e04b2a] hover:bg-[#e04b2a]/10 rounded-lg transition-colors group" title="Sign Out">
                                <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
                {/* Mobile Header */}
                <div className="lg:hidden glass-morphism border-b border-[#192631]/10 p-4 flex items-center justify-between sticky top-0 z-40">
                    <div className="flex items-center">
                        <Logo className="scale-90 origin-left" darkText={true} variant="orange-symbol" />
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={toggleLanguage}
                            className="flex items-center gap-2 p-2 px-3 text-[#192631]/70 font-bold text-xs uppercase hover:bg-[#192631]/[0.05] hover:text-[#192631] rounded-lg transition-colors border border-[#192631]/10 bg-white/75"
                        >
                            <Globe className="w-4 h-4" />
                            {language === 'en' ? 'EN' : 'AR'}
                        </button>
                        <button
                            onClick={() => setIsNotifOpen(!isNotifOpen)}
                            className="relative p-2 text-[#192631]/60 hover:bg-white/80 rounded-lg"
                        >
                            <Bell className="w-6 h-6" />
                            {unreadCount > 0 && (
                                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#e04b2a] rounded-full border-2 border-white"></span>
                            )}
                        </button>
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="p-2 text-[#192631]/60 hover:bg-white/80 rounded-lg"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Mobile Notifications Dropdown (Absolute overlay) */}
                {isNotifOpen && (
                    <div className="lg:hidden absolute top-16 right-4 left-4 bg-white/95 backdrop-blur-xl border border-[#192631]/12 shadow-2xl rounded-2xl overflow-hidden z-50">
                        <div className="p-4 border-b border-[#192631]/10 bg-[#192631]/[0.03] flex justify-between items-center">
                            <h3 className="font-semibold text-[#192631]">Notifications</h3>
                            <span className="text-xs font-medium text-[#192631]/70 px-2 py-1 bg-[#192631]/[0.05] rounded-full border border-[#192631]/10">{unreadCount} unread</span>
                        </div>
                        <div className="max-h-[60vh] overflow-y-auto no-scrollbar">
                            {myNotifications.length === 0 ? (
                                <div className="p-8 text-center text-[#192631]/60 text-sm">No new notifications</div>
                            ) : (
                                myNotifications.map(notif => (
                                    <div
                                        key={notif.id}
                                        className={clsx("p-4 border-b border-[#192631]/10 last:border-0 hover:bg-[#192631]/[0.04] transition-colors cursor-pointer", !notif.isRead && "bg-[#e04b2a]/10")}
                                        onClick={() => {
                                            if (!notif.isRead) markNotificationRead(notif.id);
                                            setIsNotifOpen(false);
                                        }}
                                    >
                                        <p className={clsx("text-sm", notif.isRead ? "text-[#192631]/65" : "text-[#192631] font-semibold")}>{notif.message}</p>
                                        <p className="text-xs text-[#192631]/55 mt-1">{new Date(notif.createdAt || '').toLocaleString()}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* Top Desktop Bar (Search & Notifications placeholder) */}
                <div className="hidden lg:flex items-center justify-between p-8 pb-0">
                    <div ref={searchRef} className="relative w-full max-w-lg z-30">
                        <div className="glass-morphism px-5 py-3 rounded-2xl text-[#192631]/70 flex items-center w-full shadow-sm focus-within:border-[#e04b2a]/35 focus-within:bg-white/95 transition-all duration-300 group">
                            <Search className="w-5 h-5 mr-3 text-[#192631]/60 group-focus-within:text-[#e04b2a] transition-colors" />
                            <input
                                type="text"
                                placeholder="Search projects, BOQ items, submittals, engineers..."
                                className="bg-transparent w-full outline-none text-[#192631] placeholder-[#192631]/45 text-sm"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setIsSearchOpen(true);
                                }}
                                onFocus={() => setIsSearchOpen(true)}
                            />
                        </div>

                        {isSearchOpen && searchQuery.trim() && (
                            <div className="absolute top-14 left-0 w-full bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl border border-[#192631]/12 overflow-hidden">
                                {searchResults.length === 0 ? (
                                    <div className="p-4 text-center text-[#192631]/60 text-sm">No results found for "{searchQuery}"</div>
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
                                                    className="w-full text-left px-4 py-3 hover:bg-[#192631]/[0.05] flex items-start transition-colors"
                                                >
                                                    <div className="bg-[#192631]/[0.05] p-2 rounded-lg mr-3 text-[#192631]/70 border border-[#192631]/10">
                                                        <Icon className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-[#192631] text-sm">{result.title}</p>
                                                        <div className="flex items-center text-xs text-[#192631]/60 mt-0.5">
                                                            <span className="font-medium text-[#e04b2a] mr-2">{result.type}</span>
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

                    {/* Desktop Controls (Toggle & Notifications) */}
                    <div className="relative z-30 ml-4 hidden lg:flex items-center gap-4">
                        <button
                            onClick={toggleLanguage}
                            className="flex items-center gap-2 px-4 py-2 text-[#192631]/80 font-bold text-xs uppercase hover:bg-white hover:text-[#192631] rounded-xl transition-all border border-[#192631]/12 bg-white/80 backdrop-blur-md shadow-sm"
                        >
                            <Globe className="w-4 h-4 text-[#e04b2a]" />
                            {language === 'en' ? 'English' : 'عربي'}
                        </button>
                        
                        <div ref={notifRef} className="relative">
                            <button
                                onClick={() => setIsNotifOpen(!isNotifOpen)}
                            className="relative p-2.5 text-[#192631]/75 hover:text-[#192631] bg-white/80 hover:bg-white border border-[#192631]/10 rounded-xl transition-colors shadow-sm"
                        >
                            <Bell className="w-5 h-5" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#e04b2a] rounded-full border-2 border-white"></span>
                            )}
                        </button>

                        {isNotifOpen && (
                            <div className="absolute top-12 right-0 w-80 bg-white/95 backdrop-blur-xl border border-[#192631]/12 shadow-2xl rounded-2xl overflow-hidden">
                                <div className="p-4 border-b border-[#192631]/10 bg-[#192631]/[0.03] flex justify-between items-center">
                                    <h3 className="font-semibold text-[#192631]">Notifications</h3>
                                    <span className="text-xs font-medium text-[#192631]/70 px-2 py-1 bg-[#192631]/[0.05] rounded-full border border-[#192631]/10">{unreadCount} unread</span>
                                </div>
                                <div className="max-h-96 overflow-y-auto no-scrollbar">
                                    {myNotifications.length === 0 ? (
                                        <div className="p-8 text-center text-[#192631]/60 text-sm">No new notifications</div>
                                    ) : (
                                        myNotifications.map(notif => (
                                            <div
                                                key={notif.id}
                                                className={clsx("p-4 border-b border-[#192631]/10 last:border-0 hover:bg-[#192631]/[0.04] transition-colors cursor-pointer", !notif.isRead && "bg-[#e04b2a]/10")}
                                                onClick={() => {
                                                    if (!notif.isRead) markNotificationRead(notif.id);
                                                    setIsNotifOpen(false);
                                                }}
                                            >
                                                <p className={clsx("text-sm", notif.isRead ? "text-[#192631]/65" : "text-[#192631] font-semibold")}>{notif.message}</p>
                                                <p className="text-xs text-[#192631]/55 mt-1">{new Date(notif.createdAt || '').toLocaleString()}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                        </div>
                    </div>
                </div>

                <div className="w-full h-full p-3 md:p-6 lg:p-8 overflow-y-auto">
                    {children}
                </div>
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
