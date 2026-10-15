import React, { useState } from 'react';
import {
    supabase,
    registerContractingCompany,
    DEFAULT_ADMIN_EMAIL,
    DEFAULT_ADMIN_PASSWORD,
} from '../lib/supabase';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTenant } from '../context/TenantContext';
import { motion } from 'framer-motion';
import { Building2, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';
import clsx from 'clsx';
import { Logo } from '../components/Logo';

const QUICK_COLORS = ['#f3822d', '#2563eb', '#10b981', '#d97706', '#e11d48', '#7c3aed'];

export const Login: React.FC = () => {
    const { user, isLoadingAuth } = useAuth();
    const { activeOrg, refreshOrganizations } = useTenant();

    const [mode, setMode] = useState<'login' | 'register-company' | 'signup' | 'forgot-password'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');

    // Self-Serve Contracting Company Registration fields
    const [companyName, setCompanyName] = useState('');
    const tagline = 'Engineering & Contracting Milestone Tracker';
    const [primaryColor, setPrimaryColor] = useState('#2563eb');
    const [currency, setCurrency] = useState('AED');
    const [branchesInput, setBranchesInput] = useState('Dubai, Abu Dhabi');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    if (isLoadingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f] py-12 px-4">
                <div className="text-slate-400 font-mono text-xs uppercase tracking-widest">Loading session...</div>
            </div>
        );
    }

    if (user && mode !== 'forgot-password') {
        return <Navigate to="/" replace />;
    }

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            if (mode === 'login') {
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (signInError) throw new Error(signInError.message);
            } else if (mode === 'register-company') {
                if (!companyName.trim()) throw new Error('Company Name is required');
                const branches = branchesInput
                    .split(',')
                    .map(s => s.trim())
                    .filter(Boolean);
                await registerContractingCompany({
                    companyName,
                    tagline,
                    primaryColor,
                    currency,
                    branches,
                    adminName: fullName || email.split('@')[0],
                    adminEmail: email,
                    adminPassword: password,
                });
                await refreshOrganizations();
            } else if (mode === 'signup') {
                const { error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                            organization_id: activeOrg.id,
                        },
                    },
                });
                if (signUpError) throw new Error(signUpError.message);
            } else if (mode === 'forgot-password') {
                const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: `${window.location.origin}/reset-password`,
                });
                if (resetError) throw new Error(resetError.message);
                setMessage('Password reset instructions have been processed for that email.');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleQuickAdminLogin = async () => {
        setEmail(DEFAULT_ADMIN_EMAIL);
        setPassword(DEFAULT_ADMIN_PASSWORD);
        setLoading(true);
        setError(null);
        try {
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: DEFAULT_ADMIN_EMAIL,
                password: DEFAULT_ADMIN_PASSWORD,
            });
            if (signInError) throw new Error(signInError.message);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-dec-bg py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500/20 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full"></div>
            </div>

            <div className="max-w-lg w-full space-y-6 bg-[#1a1a1a]/60 backdrop-blur-2xl p-6 md:p-10 rounded-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] relative z-10">
                <div className="flex flex-col items-center">
                    <div className="mb-5">
                        <Logo showText={false} />
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] font-bold uppercase tracking-widest mb-2">
                        <Sparkles className="w-3 h-3" />
                        White-Label Contracting Platform
                    </div>
                    <h2 className="text-center text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                        {mode === 'login'
                            ? activeOrg.name
                            : mode === 'register-company'
                            ? 'Launch Your Company Workspace'
                            : mode === 'signup'
                            ? `Join ${activeOrg.name}`
                            : 'Reset Access'}
                    </h2>
                    <p className="mt-1.5 text-center text-xs md:text-sm text-slate-400 font-medium">
                        {mode === 'login'
                            ? activeOrg.tagline
                            : mode === 'register-company'
                            ? 'Set up a white-label workspace for your contracting company in seconds'
                            : mode === 'signup'
                            ? 'Create an operative account in this workspace'
                            : 'Enter your email to reset your password'}
                    </p>
                </div>

                {/* Mode Switch Tabs */}
                <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-black/40 rounded-2xl border border-white/5">
                    <button
                        type="button"
                        onClick={() => { setMode('login'); setError(null); setMessage(null); }}
                        className={clsx(
                            'py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all',
                            mode === 'login' ? 'bg-orange-500 text-white shadow' : 'text-slate-400 hover:text-white'
                        )}
                    >
                        Sign In
                    </button>
                    <button
                        type="button"
                        onClick={() => { setMode('register-company'); setError(null); setMessage(null); }}
                        className={clsx(
                            'py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all',
                            mode === 'register-company' ? 'bg-orange-500 text-white shadow' : 'text-slate-400 hover:text-white'
                        )}
                    >
                        New Company
                    </button>
                    <button
                        type="button"
                        onClick={() => { setMode('signup'); setError(null); setMessage(null); }}
                        className={clsx(
                            'py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all',
                            mode === 'signup' ? 'bg-orange-500 text-white shadow' : 'text-slate-400 hover:text-white'
                        )}
                    >
                        Join Team
                    </button>
                </div>

                {mode === 'login' && (
                    <div className="p-3.5 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-between gap-3">
                        <div className="text-xs">
                            <p className="font-bold text-orange-300 flex items-center gap-1.5">
                                <ShieldCheck className="w-4 h-4" />
                                Default Platform Admin Account
                            </p>
                            <p className="text-slate-300 font-mono text-[11px] mt-0.5">
                                {DEFAULT_ADMIN_EMAIL} &bull; {DEFAULT_ADMIN_PASSWORD}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={handleQuickAdminLogin}
                            disabled={loading}
                            className="px-3.5 py-2 bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-xl text-xs shrink-0 flex items-center gap-1 shadow-lg transition-all"
                        >
                            1-Click Admin Login
                            <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}

                <form className="space-y-4" onSubmit={handleAuth}>
                    {mode === 'register-company' && (
                        <div className="space-y-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                            <div className="flex items-center gap-2 text-xs font-bold text-orange-400 uppercase tracking-wider">
                                <Building2 className="w-4 h-4" />
                                Step 1: Contracting Company Branding
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                                    Company Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g., Horizon Contracting & Civil Works"
                                    value={companyName}
                                    onChange={e => setCompanyName(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl text-sm focus:outline-none focus:border-orange-500"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                                        Base Currency
                                    </label>
                                    <select
                                        value={currency}
                                        onChange={e => setCurrency(e.target.value)}
                                        className="w-full px-3 py-2.5 bg-[#141414] border border-white/10 text-white rounded-xl text-sm"
                                    >
                                        {['AED', 'USD', 'SAR', 'EGP', 'EUR', 'GBP', 'QAR'].map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                                        Brand Color
                                    </label>
                                    <div className="flex items-center gap-1.5 pt-1">
                                        {QUICK_COLORS.map(c => (
                                            <button
                                                key={c}
                                                type="button"
                                                onClick={() => setPrimaryColor(c)}
                                                className={clsx(
                                                    'w-6 h-6 rounded-lg border transition-transform',
                                                    primaryColor === c ? 'border-white scale-110' : 'border-transparent opacity-70'
                                                )}
                                                style={{ backgroundColor: c }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                                    Office Branches (Comma-separated)
                                </label>
                                <input
                                    type="text"
                                    value={branchesInput}
                                    onChange={e => setBranchesInput(e.target.value)}
                                    placeholder="Dubai, Riyadh, Cairo"
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 text-white rounded-xl text-xs"
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        {(mode === 'signup' || mode === 'register-company') && (
                            <div>
                                <label htmlFor="full-name" className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                                    {mode === 'register-company' ? 'Company Admin Full Name *' : 'Full Name *'}
                                </label>
                                <input
                                    id="full-name"
                                    name="fullName"
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 placeholder-slate-600 text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-sm font-medium"
                                    placeholder="Eng. Ahmed Al-Mansoor"
                                    value={fullName}
                                    onChange={e => setFullName(e.target.value)}
                                />
                            </div>
                        )}

                        <div>
                            <label htmlFor="email-address" className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                                Work Email Address *
                            </label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 placeholder-slate-600 text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-sm font-medium"
                                placeholder="admin@platform.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                            />
                        </div>

                        {mode !== 'forgot-password' && (
                            <div>
                                <div className="flex items-center justify-between mb-1.5 ml-1">
                                    <label htmlFor="password" className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                        Password *
                                    </label>
                                    {mode === 'login' && (
                                        <button
                                            type="button"
                                            onClick={() => setMode('forgot-password')}
                                            className="text-[11px] font-bold text-orange-400 hover:text-orange-300 uppercase tracking-wider"
                                        >
                                            Forgot?
                                        </button>
                                    )}
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 placeholder-slate-600 text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-sm font-medium"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                />
                            </div>
                        )}
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold text-center"
                        >
                            {error}
                        </motion.div>
                    )}

                    {message && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-3.5 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold text-center"
                        >
                            {message}
                        </motion.div>
                    )}

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-4 px-4 text-sm font-bold rounded-2xl text-white bg-orange-600 hover:bg-orange-500 disabled:opacity-50 transition-all shadow-xl shadow-orange-600/20"
                        >
                            {loading
                                ? 'Authenticating with Firebase...'
                                : mode === 'login'
                                ? 'Sign In to Workspace'
                                : mode === 'register-company'
                                ? 'Create Company Workspace & Admin Account'
                                : mode === 'signup'
                                ? 'Create Team Account'
                                : 'Send Reset Link'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
