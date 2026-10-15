import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Building2,
    Palette,
    Upload,
    Check,
    Plus,
    Trash2,
    Users,
    ShieldCheck,
    RefreshCw,
    Globe,
    Mail,
    Phone,
    MapPin,
    Sparkles,
    Key,
    Layers,
    ArrowRightLeft,
    Copy,
} from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import { useTenant } from '../context/TenantContext';
import {
    getPlatformAccounts,
    adminCreateAccount,
    adminDeleteAccount,
    resetAllPlatformAccountsAndData,
    DEFAULT_ADMIN_EMAIL,
    DEFAULT_ADMIN_PASSWORD,
} from '../lib/supabase';

const BRAND_PRESETS = [
    { name: 'Construction Orange', color: '#f3822d' },
    { name: 'Blueprint Blue', color: '#2563eb' },
    { name: 'Emerald Contracting', color: '#10b981' },
    { name: 'Royal Gold', color: '#d97706' },
    { name: 'Crimson Industrial', color: '#e11d48' },
    { name: 'Violet BIM', color: '#7c3aed' },
    { name: 'Cyan Infrastructure', color: '#06b6d4' },
    { name: 'Lime Survey', color: '#65a30d' },
];

const SURFACE_PRESETS: Array<{ id: 'obsidian' | 'midnight' | 'slate'; name: string; bg: string; desc: string }> = [
    { id: 'obsidian', name: 'Obsidian Dark', bg: '#0f0f0f', desc: 'High-contrast carbon black executive surface' },
    { id: 'midnight', name: 'Midnight Blueprint', bg: '#080d1a', desc: 'Deep architectural navy engineering theme' },
    { id: 'slate', name: 'Industrial Slate', bg: '#0f1419', desc: 'Neutral steel grey field operations surface' },
];

const CURRENCIES = ['AED', 'USD', 'SAR', 'EGP', 'EUR', 'GBP', 'QAR', 'KWD'];

export const OrganizationSettings: React.FC = () => {
    const {
        activeOrg,
        organizations,
        switchOrganization,
        updateOrganization,
        createOrganization,
        deleteOrganization,
    } = useTenant();

    const [activeTab, setActiveTab] = useState<'branding' | 'tenants' | 'accounts'>('branding');

    // Branding form state
    const [name, setName] = useState(activeOrg.name);
    const [tagline, setTagline] = useState(activeOrg.tagline);
    const [primaryColor, setPrimaryColor] = useState(activeOrg.primaryColor || '#f3822d');
    const [themeSurface, setThemeSurface] = useState<'obsidian' | 'midnight' | 'slate'>(activeOrg.themeSurface || 'obsidian');
    const [logoUrl, setLogoUrl] = useState(activeOrg.logoUrl || '');
    const [faviconUrl, setFaviconUrl] = useState(activeOrg.faviconUrl || '');
    const [currency, setCurrency] = useState(activeOrg.currency || 'AED');
    const [branches, setBranches] = useState<string[]>(activeOrg.branches || ['Main Office']);
    const [newBranch, setNewBranch] = useState('');
    const [email, setEmail] = useState(activeOrg.email || '');
    const [phone, setPhone] = useState(activeOrg.phone || '');
    const [address, setAddress] = useState(activeOrg.address || '');
    const [city, setCity] = useState(activeOrg.city || '');
    const [country, setCountry] = useState(activeOrg.country || '');
    const [plan, setPlan] = useState<'Starter' | 'Professional' | 'Enterprise'>(activeOrg.plan || 'Enterprise');

    // New Tenant modal state
    const [newTenantName, setNewTenantName] = useState('');
    const [newTenantTagline, setNewTenantTagline] = useState('Contracting & Engineering Milestone Tracker');
    const [newTenantColor, setNewTenantColor] = useState('#2563eb');
    const [newTenantCurrency, setNewTenantCurrency] = useState('AED');
    const [newTenantCity, setNewTenantCity] = useState('Dubai');

    // Accounts state
    const [accounts, setAccounts] = useState(() => getPlatformAccounts());
    const [accName, setAccName] = useState('');
    const [accEmail, setAccEmail] = useState('');
    const [accPassword, setAccPassword] = useState('Contractor123!');
    const [accRole, setAccRole] = useState<'admin' | 'engineer' | 'client'>('engineer');
    const accLocation = activeOrg.branches?.[0] || 'Abu Dhabi';
    const [accRate, setAccRate] = useState('100');
    const [isCreatingAccount, setIsCreatingAccount] = useState(false);
    const [isResetting, setIsResetting] = useState(false);

    useEffect(() => {
        setName(activeOrg.name);
        setTagline(activeOrg.tagline);
        setPrimaryColor(activeOrg.primaryColor || '#f3822d');
        setThemeSurface(activeOrg.themeSurface || 'obsidian');
        setLogoUrl(activeOrg.logoUrl || '');
        setFaviconUrl(activeOrg.faviconUrl || '');
        setCurrency(activeOrg.currency || 'AED');
        setBranches(activeOrg.branches || ['Main Office']);
        setEmail(activeOrg.email || '');
        setPhone(activeOrg.phone || '');
        setAddress(activeOrg.address || '');
        setCity(activeOrg.city || '');
        setCountry(activeOrg.country || '');
        setPlan(activeOrg.plan || 'Enterprise');
        setAccounts(getPlatformAccounts());
    }, [activeOrg]);

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'logo' | 'favicon') => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 1.5 * 1024 * 1024) {
            toast.error('Image must be under 1.5 MB');
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            if (target === 'logo') setLogoUrl(result);
            else setFaviconUrl(result);
            toast.success(`${target === 'logo' ? 'Logo' : 'Favicon'} loaded — click Save Branding to apply`);
        };
        reader.readAsDataURL(file);
    };

    const handleSaveBranding = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.error('Company name is required');
            return;
        }
        await updateOrganization({
            name: name.trim(),
            slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
            tagline: tagline.trim(),
            primaryColor,
            themeSurface,
            logoUrl,
            faviconUrl,
            currency,
            branches,
            email,
            phone,
            address,
            city,
            country,
            plan,
        });
    };

    const handleAddBranch = () => {
        const clean = newBranch.trim();
        if (!clean) return;
        if (branches.includes(clean)) {
            toast.error('Branch already exists');
            return;
        }
        setBranches([...branches, clean]);
        setNewBranch('');
    };

    const handleRemoveBranch = (b: string) => {
        if (branches.length <= 1) {
            toast.error('At least one office branch is required');
            return;
        }
        setBranches(branches.filter(item => item !== b));
    };

    const handleCreateTenant = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTenantName.trim()) return;
        await createOrganization({
            name: newTenantName.trim(),
            slug: newTenantName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            tagline: newTenantTagline.trim(),
            primaryColor: newTenantColor,
            themeSurface: 'obsidian',
            currency: newTenantCurrency,
            branches: [newTenantCity || 'Main Office', 'Site Office'],
            city: newTenantCity,
            country: 'UAE',
            plan: 'Enterprise',
        });
        setNewTenantName('');
    };

    const handleCreateAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!accName.trim() || !accEmail.trim() || !accPassword.trim()) return;
        setIsCreatingAccount(true);
        try {
            await adminCreateAccount({
                email: accEmail,
                password: accPassword,
                name: accName,
                role: accRole,
                organizationId: activeOrg.id,
                location: accLocation,
                hourlyRate: parseFloat(accRate) || 0,
                weeklyGoalHours: 40,
            });
            toast.success(`Created ${accRole} account for ${accEmail}`);
            setAccName('');
            setAccEmail('');
            setAccounts(getPlatformAccounts());
        } catch (err: any) {
            toast.error(err.message || 'Failed to create account');
        } finally {
            setIsCreatingAccount(false);
        }
    };

    const handleDeleteAccount = async (id: string, emailStr: string) => {
        if (emailStr === DEFAULT_ADMIN_EMAIL) {
            toast.error('Cannot delete the primary platform administrator account.');
            return;
        }
        await adminDeleteAccount(id);
        toast.success('Account removed');
        setAccounts(getPlatformAccounts());
    };

    const handleResetAll = async () => {
        if (!window.confirm('Are you sure you want to reset ALL accounts and platform data back to the default Admin account (admin@platform.com)?')) {
            return;
        }
        setIsResetting(true);
        try {
            await resetAllPlatformAccountsAndData();
            setAccounts(getPlatformAccounts());
            toast.success('All platform accounts & data have been reset to default Admin!');
        } catch (err: any) {
            toast.error(err.message || 'Reset failed');
        } finally {
            setIsResetting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e04b2a]/10 border border-[#e04b2a]/25 text-[#e04b2a] text-[10px] font-bold uppercase tracking-widest mb-3">
                        <Sparkles className="w-3.5 h-3.5" />
                        Multi-Tenant White-Label SaaS Engine
                    </div>
                    <h2 className="text-3xl lg:text-5xl font-black text-[#192631] tracking-tighter">
                        White-Label <span className="text-[#e04b2a]">Studio</span>
                    </h2>
                    <p className="text-[#192631]/70 text-sm mt-2">
                        Customize contracting company branding, manage multi-tenant workspaces, and control platform accounts on Firebase.
                    </p>
                </div>

                {/* Tab Switcher */}
                <div className="flex items-center bg-[#1a1a1a]/80 p-1.5 rounded-2xl border border-[#192631]/10 self-start">
                    <button
                        onClick={() => setActiveTab('branding')}
                        className={clsx(
                            'flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all',
                            activeTab === 'branding'
                                ? 'bg-orange-500 text-white shadow-orange-glow'
                                : 'text-[#192631]/70 hover:text-[#192631]'
                        )}
                    >
                        <Palette className="w-4 h-4" />
                        Branding & Theme
                    </button>
                    <button
                        onClick={() => setActiveTab('tenants')}
                        className={clsx(
                            'flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all',
                            activeTab === 'tenants'
                                ? 'bg-orange-500 text-white shadow-orange-glow'
                                : 'text-[#192631]/70 hover:text-[#192631]'
                        )}
                    >
                        <Layers className="w-4 h-4" />
                        Workspaces ({organizations.length})
                    </button>
                    <button
                        onClick={() => {
                            setAccounts(getPlatformAccounts());
                            setActiveTab('accounts');
                        }}
                        className={clsx(
                            'flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all',
                            activeTab === 'accounts'
                                ? 'bg-orange-500 text-white shadow-orange-glow'
                                : 'text-[#192631]/70 hover:text-[#192631]'
                        )}
                    >
                        <Users className="w-4 h-4" />
                        Accounts & Reset
                    </button>
                </div>
            </div>

            {/* TAB 1: BRANDING & THEME */}
            {activeTab === 'branding' && (
                <form onSubmit={handleSaveBranding} className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    <div className="xl:col-span-2 space-y-8">
                        {/* Company Identity Card */}
                        <div className="glass-card p-8 rounded-[32px] space-y-6">
                            <div className="flex items-center gap-3 border-b border-[#192631]/10 pb-4">
                                <div className="p-3 rounded-2xl bg-[#e04b2a]/10 text-[#e04b2a] border border-[#e04b2a]/25">
                                    <Building2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-[#192631]">Contracting Company Identity</h3>
                                    <p className="text-xs text-[#192631]/70">Appears in the sidebar, login portal, client dashboard, invoices, and PDF/Excel reports.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[11px] font-bold text-[#192631]/70 uppercase tracking-widest mb-2">
                                        Company Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        placeholder="e.g., Al-Futtaim Contracting LLC"
                                        className="w-full px-4 py-3 bg-[#192631]/[0.05] border border-[#192631]/10 rounded-xl text-[#192631] focus:outline-none focus:border-orange-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-[#192631]/70 uppercase tracking-widest mb-2">
                                        Subscription Tier / Badge
                                    </label>
                                    <select
                                        value={plan}
                                        onChange={e => setPlan(e.target.value as any)}
                                        className="w-full px-4 py-3 bg-[#141414] border border-[#192631]/10 rounded-xl text-[#192631] focus:outline-none focus:border-orange-500"
                                    >
                                        <option value="Starter">Starter</option>
                                        <option value="Professional">Professional</option>
                                        <option value="Enterprise">Enterprise</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-[11px] font-bold text-[#192631]/70 uppercase tracking-widest mb-2">
                                        Platform Tagline / Subtitle
                                    </label>
                                    <input
                                        type="text"
                                        value={tagline}
                                        onChange={e => setTagline(e.target.value)}
                                        placeholder="e.g., Engineering & Construction Milestone Intelligence"
                                        className="w-full px-4 py-3 bg-[#192631]/[0.05] border border-[#192631]/10 rounded-xl text-[#192631] focus:outline-none focus:border-orange-500"
                                    />
                                </div>
                            </div>

                            {/* Logo & Favicon Upload */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#192631]/10">
                                <div>
                                    <label className="block text-[11px] font-bold text-[#192631]/70 uppercase tracking-widest mb-2">
                                        Company Logo (Upload or Image URL)
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={logoUrl}
                                            onChange={e => setLogoUrl(e.target.value)}
                                            placeholder="https://... or upload file"
                                            className="flex-1 px-4 py-2.5 bg-[#192631]/[0.05] border border-[#192631]/10 rounded-xl text-[#192631] text-xs focus:outline-none focus:border-orange-500"
                                        />
                                        <label className="px-4 py-2.5 bg-[#e04b2a]/10 hover:bg-[#e04b2a]/10 text-[#e04b2a] border border-[#e04b2a]/25 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 shrink-0">
                                            <Upload className="w-4 h-4" />
                                            Upload
                                            <input type="file" accept="image/*" className="hidden" onChange={e => handleLogoUpload(e, 'logo')} />
                                        </label>
                                        {logoUrl && (
                                            <button
                                                type="button"
                                                onClick={() => setLogoUrl('')}
                                                className="px-3 py-2.5 bg-red-500/10 text-red-700 rounded-xl text-xs font-bold"
                                            >
                                                Clear
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-[#192631]/70 uppercase tracking-widest mb-2">
                                        Browser Favicon (Upload or URL)
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={faviconUrl}
                                            onChange={e => setFaviconUrl(e.target.value)}
                                            placeholder="Auto-generated if blank"
                                            className="flex-1 px-4 py-2.5 bg-[#192631]/[0.05] border border-[#192631]/10 rounded-xl text-[#192631] text-xs focus:outline-none focus:border-orange-500"
                                        />
                                        <label className="px-4 py-2.5 bg-[#192631]/[0.05] hover:bg-[#192631]/[0.05] text-[#192631]/85 border border-[#192631]/10 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 shrink-0">
                                            <Upload className="w-4 h-4" />
                                            Icon
                                            <input type="file" accept="image/*" className="hidden" onChange={e => handleLogoUpload(e, 'favicon')} />
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Contact & Invoice Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#192631]/10">
                                <div>
                                    <label className="block text-[11px] font-bold text-[#192631]/70 uppercase tracking-widest mb-2">
                                        <Mail className="w-3.5 h-3.5 inline mr-1" /> Corporate Email (For Invoices)
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        className="w-full px-4 py-3 bg-[#192631]/[0.05] border border-[#192631]/10 rounded-xl text-[#192631] text-sm focus:outline-none focus:border-orange-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-[#192631]/70 uppercase tracking-widest mb-2">
                                        <Phone className="w-3.5 h-3.5 inline mr-1" /> Corporate Phone
                                    </label>
                                    <input
                                        type="text"
                                        value={phone}
                                        onChange={e => setPhone(e.target.value)}
                                        className="w-full px-4 py-3 bg-[#192631]/[0.05] border border-[#192631]/10 rounded-xl text-[#192631] text-sm focus:outline-none focus:border-orange-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-[#192631]/70 uppercase tracking-widest mb-2">
                                        <MapPin className="w-3.5 h-3.5 inline mr-1" /> Street Address / Tower
                                    </label>
                                    <input
                                        type="text"
                                        value={address}
                                        onChange={e => setAddress(e.target.value)}
                                        className="w-full px-4 py-3 bg-[#192631]/[0.05] border border-[#192631]/10 rounded-xl text-[#192631] text-sm focus:outline-none focus:border-orange-500"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[11px] font-bold text-[#192631]/70 uppercase tracking-widest mb-2">
                                            City
                                        </label>
                                        <input
                                            type="text"
                                            value={city}
                                            onChange={e => setCity(e.target.value)}
                                            className="w-full px-4 py-3 bg-[#192631]/[0.05] border border-[#192631]/10 rounded-xl text-[#192631] text-sm focus:outline-none focus:border-orange-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-[#192631]/70 uppercase tracking-widest mb-2">
                                            Country
                                        </label>
                                        <input
                                            type="text"
                                            value={country}
                                            onChange={e => setCountry(e.target.value)}
                                            className="w-full px-4 py-3 bg-[#192631]/[0.05] border border-[#192631]/10 rounded-xl text-[#192631] text-sm focus:outline-none focus:border-orange-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Color & Surface Theme Card */}
                        <div className="glass-card p-8 rounded-[32px] space-y-6">
                            <div className="flex items-center gap-3 border-b border-[#192631]/10 pb-4">
                                <div className="p-3 rounded-2xl bg-[#e04b2a]/10 text-[#e04b2a] border border-[#e04b2a]/25">
                                    <Palette className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-[#192631]">Dynamic Brand Color & Theme Engine</h3>
                                    <p className="text-xs text-[#192631]/70">Re-themes all buttons, active highlights, glows, and charts across the platform in real time.</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-[#192631]/70 uppercase tracking-widest mb-3">
                                    Curated Contracting Brand Presets
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {BRAND_PRESETS.map(preset => (
                                        <button
                                            key={preset.color}
                                            type="button"
                                            onClick={() => setPrimaryColor(preset.color)}
                                            className={clsx(
                                                'flex items-center gap-3 p-3 rounded-2xl border text-left transition-all',
                                                primaryColor.toLowerCase() === preset.color.toLowerCase()
                                                    ? 'border-white bg-[#192631]/[0.05] shadow-lg'
                                                    : 'border-[#192631]/10 bg-[#192631]/[0.05] hover:border-[#192631]/10'
                                            )}
                                        >
                                            <span
                                                className="w-6 h-6 rounded-lg shrink-0 shadow-inner border border-[#192631]/10"
                                                style={{ backgroundColor: preset.color }}
                                            />
                                            <span className="text-xs font-bold text-[#192631] truncate">{preset.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center gap-4 pt-2">
                                <label className="text-xs font-bold text-[#192631]/70 uppercase tracking-widest">
                                    Custom Hex Color:
                                </label>
                                <input
                                    type="color"
                                    value={primaryColor}
                                    onChange={e => setPrimaryColor(e.target.value)}
                                    className="w-12 h-10 rounded-lg bg-transparent cursor-pointer border border-[#192631]/10"
                                />
                                <input
                                    type="text"
                                    value={primaryColor}
                                    onChange={e => setPrimaryColor(e.target.value)}
                                    className="w-32 px-3 py-2 bg-[#192631]/[0.05] border border-[#192631]/10 rounded-xl text-[#192631] font-mono text-sm"
                                />
                            </div>

                            {/* Surface Selector */}
                            <div className="pt-4 border-t border-[#192631]/10">
                                <label className="block text-[11px] font-bold text-[#192631]/70 uppercase tracking-widest mb-3">
                                    Background Surface Mode
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {SURFACE_PRESETS.map(s => (
                                        <button
                                            key={s.id}
                                            type="button"
                                            onClick={() => setThemeSurface(s.id)}
                                            className={clsx(
                                                'p-4 rounded-2xl border text-left transition-all',
                                                themeSurface === s.id
                                                    ? 'border-orange-500 bg-[#e04b2a]/10'
                                                    : 'border-[#192631]/10 bg-[#192631]/[0.05] hover:border-[#192631]/10'
                                            )}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-bold text-[#192631] text-sm">{s.name}</span>
                                                <span className="w-5 h-5 rounded-full border border-[#192631]/10" style={{ backgroundColor: s.bg }} />
                                            </div>
                                            <p className="text-xs text-[#192631]/70">{s.desc}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Currency & Branches */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#192631]/10">
                                <div>
                                    <label className="block text-[11px] font-bold text-[#192631]/70 uppercase tracking-widest mb-2">
                                        <Globe className="w-3.5 h-3.5 inline mr-1" /> Primary Currency
                                    </label>
                                    <select
                                        value={currency}
                                        onChange={e => setCurrency(e.target.value)}
                                        className="w-full px-4 py-3 bg-[#141414] border border-[#192631]/10 rounded-xl text-[#192631] focus:outline-none focus:border-orange-500"
                                    >
                                        {CURRENCIES.map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-[#192631]/70 uppercase tracking-widest mb-2">
                                        Office Branches & Project Sites
                                    </label>
                                    <div className="flex gap-2 mb-3">
                                        <input
                                            type="text"
                                            value={newBranch}
                                            onChange={e => setNewBranch(e.target.value)}
                                            placeholder="Add branch (e.g., Riyadh)"
                                            className="flex-1 px-3 py-2 bg-[#192631]/[0.05] border border-[#192631]/10 rounded-xl text-[#192631] text-xs"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddBranch}
                                            className="px-3 py-2 bg-orange-500 text-white rounded-xl text-xs font-bold flex items-center gap-1"
                                        >
                                            <Plus className="w-3.5 h-3.5" /> Add
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {branches.map(b => (
                                            <span
                                                key={b}
                                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#192631]/[0.05] border border-[#192631]/10 text-xs text-[#192631] font-semibold"
                                            >
                                                {b}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveBranch(b)}
                                                    className="text-[#192631]/70 hover:text-red-700"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Live Preview & Save */}
                    <div className="space-y-6">
                        <div className="glass-card p-8 rounded-[32px] space-y-6 sticky top-8">
                            <h3 className="text-lg font-black text-[#192631] uppercase tracking-wider">Live Brand Preview</h3>

                            <div
                                className="p-6 rounded-2xl border border-[#192631]/10 space-y-5 shadow-2xl"
                                style={{
                                    backgroundColor:
                                        themeSurface === 'midnight'
                                            ? '#080d1a'
                                            : themeSurface === 'slate'
                                            ? '#0f1419'
                                            : '#0f0f0f',
                                }}
                            >
                                <div className="flex items-center gap-3">
                                    {logoUrl ? (
                                        <img src={logoUrl} alt={name} className="h-12 w-auto object-contain rounded-lg" />
                                    ) : (
                                        <div
                                            className="w-12 h-12 rounded-2xl flex items-center justify-center text-[#192631] font-black text-lg shadow-lg"
                                            style={{ backgroundColor: primaryColor }}
                                        >
                                            {name
                                                .split(/\s+/)
                                                .map(w => w[0])
                                                .join('')
                                                .slice(0, 2)
                                                .toUpperCase() || 'WL'}
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-black text-[#192631] text-base leading-tight">{name || 'Company Name'}</p>
                                        <p className="text-xs text-[#192631]/70 mt-0.5">{tagline || 'Milestone Tracker'}</p>
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl bg-[#192631]/[0.05] border border-[#192631]/10 space-y-2 text-xs text-[#192631]/85">
                                    <div className="flex justify-between">
                                        <span className="text-[#192631]/60">Primary Currency:</span>
                                        <span className="font-bold text-[#192631]">{currency}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[#192631]/60">Headquarters:</span>
                                        <span className="font-bold text-[#192631]">{city || 'N/A'}, {country || ''}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[#192631]/60">Branches:</span>
                                        <span className="font-bold text-[#192631]">{branches.join(', ')}</span>
                                    </div>
                                </div>

                                <div
                                    className="w-full py-3 rounded-xl text-center text-[#192631] font-bold text-xs uppercase tracking-widest shadow-lg"
                                    style={{ backgroundColor: primaryColor }}
                                >
                                    Sample Branded Action Button
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-4 px-6 bg-orange-600 hover:bg-orange-500 text-white font-black rounded-2xl shadow-xl shadow-orange-600/20 flex items-center justify-center gap-2 transition-all"
                            >
                                <Check className="w-5 h-5" />
                                Save & Apply White-Label Branding
                            </button>
                        </div>
                    </div>
                </form>
            )}

            {/* TAB 2: MULTI-TENANT WORKSPACES */}
            {activeTab === 'tenants' && (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    <div className="xl:col-span-2 space-y-4">
                        <h3 className="text-xl font-black text-[#192631] mb-4">Registered Contracting Companies</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {organizations.map(org => {
                                const isCurrent = org.id === activeOrg.id;
                                return (
                                    <div
                                        key={org.id}
                                        className={clsx(
                                            'glass-card p-6 rounded-3xl border transition-all flex flex-col justify-between gap-4',
                                            isCurrent ? 'border-orange-500 bg-orange-500/5' : 'border-[#192631]/10'
                                        )}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                {org.logoUrl ? (
                                                    <img src={org.logoUrl} alt={org.name} className="w-12 h-12 object-contain rounded-xl" />
                                                ) : (
                                                    <div
                                                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-[#192631] font-black text-base shrink-0"
                                                        style={{ backgroundColor: org.primaryColor || '#f3822d' }}
                                                    >
                                                        {org.name.slice(0, 2).toUpperCase()}
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-black text-[#192631] text-base">{org.name}</h4>
                                                        {isCurrent && (
                                                            <span className="px-2 py-0.5 rounded-full bg-[#e04b2a]/10 text-[#e04b2a] text-[10px] font-bold uppercase">
                                                                Active
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-[#192631]/70 mt-0.5">{org.tagline}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-xs text-[#192631]/70 flex flex-wrap gap-2">
                                            <span className="px-2.5 py-1 rounded-lg bg-[#192631]/[0.05] border border-[#192631]/10 text-[#192631] font-mono">
                                                {org.currency}
                                            </span>
                                            <span className="px-2.5 py-1 rounded-lg bg-[#192631]/[0.05] border border-[#192631]/10">
                                                {org.branches?.join(' • ')}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 pt-2 border-t border-[#192631]/10">
                                            {!isCurrent ? (
                                                <button
                                                    onClick={() => switchOrganization(org.id)}
                                                    className="flex-1 py-2.5 px-4 bg-[#e04b2a]/10 hover:bg-orange-500 text-[#e04b2a] hover:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all"
                                                >
                                                    <ArrowRightLeft className="w-4 h-4" />
                                                    Switch to Workspace
                                                </button>
                                            ) : (
                                                <span className="flex-1 py-2.5 px-4 bg-[#123524]/10 text-[#123524] rounded-xl text-xs font-bold text-center">
                                                    Currently Viewing Workspace
                                                </span>
                                            )}
                                            {organizations.length > 1 && (
                                                <button
                                                    onClick={() => deleteOrganization(org.id)}
                                                    className="p-2.5 text-red-700 hover:bg-red-500/10 rounded-xl transition-colors"
                                                    title="Delete Workspace"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Provision New Contracting Company */}
                    <form onSubmit={handleCreateTenant} className="glass-card p-8 rounded-[32px] space-y-5 h-fit">
                        <h3 className="text-xl font-black text-[#192631] flex items-center gap-2">
                            <Plus className="w-5 h-5 text-[#e04b2a]" />
                            Provision New Company
                        </h3>
                        <p className="text-xs text-[#192631]/70">
                            Create a new isolated workspace for a contracting client company.
                        </p>

                        <div>
                            <label className="block text-[11px] font-bold text-[#192631]/70 uppercase tracking-widest mb-2">
                                Contracting Company Name *
                            </label>
                            <input
                                type="text"
                                required
                                value={newTenantName}
                                onChange={e => setNewTenantName(e.target.value)}
                                placeholder="e.g., Arabtec Construction"
                                className="w-full px-4 py-3 bg-[#192631]/[0.05] border border-[#192631]/10 rounded-xl text-[#192631] text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-[#192631]/70 uppercase tracking-widest mb-2">
                                Tagline
                            </label>
                            <input
                                type="text"
                                value={newTenantTagline}
                                onChange={e => setNewTenantTagline(e.target.value)}
                                className="w-full px-4 py-3 bg-[#192631]/[0.05] border border-[#192631]/10 rounded-xl text-[#192631] text-sm"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[11px] font-bold text-[#192631]/70 uppercase tracking-widest mb-2">
                                    Currency
                                </label>
                                <select
                                    value={newTenantCurrency}
                                    onChange={e => setNewTenantCurrency(e.target.value)}
                                    className="w-full px-3 py-3 bg-[#141414] border border-[#192631]/10 rounded-xl text-[#192631] text-sm"
                                >
                                    {CURRENCIES.map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-[#192631]/70 uppercase tracking-widest mb-2">
                                    Primary City
                                </label>
                                <input
                                    type="text"
                                    value={newTenantCity}
                                    onChange={e => setNewTenantCity(e.target.value)}
                                    className="w-full px-3 py-3 bg-[#192631]/[0.05] border border-[#192631]/10 rounded-xl text-[#192631] text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-[#192631]/70 uppercase tracking-widest mb-2">
                                Brand Accent Color
                            </label>
                            <div className="flex gap-2">
                                {BRAND_PRESETS.slice(0, 6).map(p => (
                                    <button
                                        key={p.color}
                                        type="button"
                                        onClick={() => setNewTenantColor(p.color)}
                                        className={clsx(
                                            'w-8 h-8 rounded-lg border-2 transition-transform',
                                            newTenantColor === p.color ? 'border-white scale-110' : 'border-transparent'
                                        )}
                                        style={{ backgroundColor: p.color }}
                                    />
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-3.5 bg-orange-600 hover:bg-orange-500 text-white font-black rounded-xl text-xs uppercase tracking-widest shadow-lg"
                        >
                            Create Company Workspace
                        </button>
                    </form>
                </div>
            )}

            {/* TAB 3: ACCOUNTS & PLATFORM RESET */}
            {activeTab === 'accounts' && (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    <div className="xl:col-span-2 space-y-6">
                        {/* Default Admin Credentials Banner */}
                        <div className="p-6 rounded-3xl bg-gradient-to-r from-orange-500/15 to-transparent border border-[#e04b2a]/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-[#e04b2a] font-black text-xs uppercase tracking-widest">
                                    <Key className="w-4 h-4" />
                                    Master Platform Admin Credentials (Firebase Auth)
                                </div>
                                <p className="text-[#192631] font-mono text-sm">
                                    Email: <strong className="text-[#e04b2a]">{DEFAULT_ADMIN_EMAIL}</strong> &nbsp;|&nbsp; Password: <strong className="text-[#e04b2a]">{DEFAULT_ADMIN_PASSWORD}</strong>
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    navigator.clipboard.writeText(`${DEFAULT_ADMIN_EMAIL} / ${DEFAULT_ADMIN_PASSWORD}`);
                                    toast.success('Copied Admin credentials!');
                                }}
                                className="px-4 py-2 bg-[#192631]/[0.05] hover:bg-white/15 text-[#192631] rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0"
                            >
                                <Copy className="w-3.5 h-3.5" /> Copy
                            </button>
                        </div>

                        {/* Active Accounts Table */}
                        <div className="glass-card p-6 rounded-[32px] space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-black text-[#192631]">Platform Accounts ({accounts.length})</h3>
                                <button
                                    type="button"
                                    onClick={handleResetAll}
                                    disabled={isResetting}
                                    className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-700 border border-red-500/20 rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
                                >
                                    <RefreshCw className={clsx('w-3.5 h-3.5', isResetting && 'animate-spin')} />
                                    Reset All Accounts & Data
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-sm">
                                    <thead>
                                        <tr className="border-b border-[#192631]/10 text-[#192631]/70 text-[11px] uppercase tracking-wider">
                                            <th className="py-3 px-4">User</th>
                                            <th className="py-3 px-4">Role</th>
                                            <th className="py-3 px-4">Company Workspace</th>
                                            <th className="py-3 px-4">Branch</th>
                                            <th className="py-3 px-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#192631]/10">
                                        {accounts.map(acc => (
                                            <tr key={acc.id} className="hover:bg-[#192631]/[0.05]">
                                                <td className="py-3.5 px-4">
                                                    <p className="font-bold text-[#192631]">{acc.name}</p>
                                                    <p className="text-xs text-[#192631]/70 font-mono">{acc.email}</p>
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <span className="px-2.5 py-1 rounded-full bg-[#e04b2a]/10 text-[#e04b2a] border border-[#e04b2a]/25 text-[10px] font-bold uppercase tracking-wider">
                                                        {acc.role}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4 text-[#192631]/85 text-xs font-semibold">
                                                    {acc.organizationName}
                                                </td>
                                                <td className="py-3.5 px-4 text-[#192631]/70 text-xs">
                                                    {acc.location}
                                                </td>
                                                <td className="py-3.5 px-4 text-right">
                                                    {acc.email !== DEFAULT_ADMIN_EMAIL && (
                                                        <button
                                                            onClick={() => handleDeleteAccount(acc.id, acc.email)}
                                                            className="p-2 text-red-700 hover:bg-red-500/10 rounded-lg"
                                                            title="Delete Account"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
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

                    {/* Provision New User Account */}
                    <form onSubmit={handleCreateAccount} className="glass-card p-8 rounded-[32px] space-y-4 h-fit">
                        <h3 className="text-xl font-black text-[#192631] flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-[#e04b2a]" />
                            Create User Account
                        </h3>
                        <p className="text-xs text-[#192631]/70">
                            Creates a Firebase Auth & Firestore account in <strong>{activeOrg.name}</strong>.
                        </p>

                        <div>
                            <label className="block text-[11px] font-bold text-[#192631]/70 uppercase tracking-widest mb-1.5">
                                Full Name *
                            </label>
                            <input
                                type="text"
                                required
                                value={accName}
                                onChange={e => setAccName(e.target.value)}
                                placeholder="Eng. Tariq Mansour"
                                className="w-full px-4 py-2.5 bg-[#192631]/[0.05] border border-[#192631]/10 rounded-xl text-[#192631] text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-[#192631]/70 uppercase tracking-widest mb-1.5">
                                Email Address *
                            </label>
                            <input
                                type="email"
                                required
                                value={accEmail}
                                onChange={e => setAccEmail(e.target.value)}
                                placeholder="tariq@company.com"
                                className="w-full px-4 py-2.5 bg-[#192631]/[0.05] border border-[#192631]/10 rounded-xl text-[#192631] text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-[#192631]/70 uppercase tracking-widest mb-1.5">
                                Initial Password *
                            </label>
                            <input
                                type="text"
                                required
                                value={accPassword}
                                onChange={e => setAccPassword(e.target.value)}
                                className="w-full px-4 py-2.5 bg-[#192631]/[0.05] border border-[#192631]/10 rounded-xl text-[#192631] font-mono text-sm"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[11px] font-bold text-[#192631]/70 uppercase tracking-widest mb-1.5">
                                    System Role
                                </label>
                                <select
                                    value={accRole}
                                    onChange={e => setAccRole(e.target.value as any)}
                                    className="w-full px-3 py-2.5 bg-[#141414] border border-[#192631]/10 rounded-xl text-[#192631] text-sm"
                                >
                                    <option value="admin">Admin</option>
                                    <option value="engineer">Engineer</option>
                                    <option value="client">Client</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-[#192631]/70 uppercase tracking-widest mb-1.5">
                                    Hourly Rate ({activeOrg.currency})
                                </label>
                                <input
                                    type="number"
                                    value={accRate}
                                    onChange={e => setAccRate(e.target.value)}
                                    className="w-full px-3 py-2.5 bg-[#192631]/[0.05] border border-[#192631]/10 rounded-xl text-[#192631] text-sm"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isCreatingAccount}
                            className="w-full py-3.5 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-black rounded-xl text-xs uppercase tracking-widest shadow-lg"
                        >
                            {isCreatingAccount ? 'Creating in Firebase...' : 'Provision Account'}
                        </button>
                    </form>
                </div>
            )}
        </motion.div>
    );
};
