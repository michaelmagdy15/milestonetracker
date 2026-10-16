import React, { useState } from 'react';
import {
    supabase,
    registerContractingCompany,
} from '../lib/supabase';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTenant } from '../context/TenantContext';
import { motion } from 'framer-motion';
import { Building2 } from 'lucide-react';
import clsx from 'clsx';
import { Logo } from '../components/Logo';

const QUICK_COLORS = ['#e04b2a', '#192631', '#123524', '#ff7f50', '#000000'];

export const Login: React.FC = () => {
    const { user, isLoadingAuth } = useAuth();
    const { activeOrg, refreshOrganizations } = useTenant();

    const [mode, setMode] = useState<'login' | 'register-company' | 'signup' | 'forgot-password'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');

    // Self-Serve Contracting Company Registration fields
    const [companyName, setCompanyName] = useState('');
    const tagline = 'Architecture, Turnkey Contracting & ERP Platform';
    const [primaryColor, setPrimaryColor] = useState('#e04b2a');
    const [currency, setCurrency] = useState('EGP');
    const [branchesInput, setBranchesInput] = useState('El Nozha El Gedida HQ, New Cairo, Madinaty');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    if (isLoadingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5] py-12 px-4">
                <div className="text-[#192631]/60 font-mono text-xs uppercase tracking-widest">Loading session...</div>
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

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Ambient Glassmorphic Brand Orbs */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-[#e04b2a]/12 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-[#192631]/10 blur-[120px] rounded-full"></div>
            </div>

            <div className="max-w-lg w-full space-y-6 glass-card p-6 md:p-10 rounded-3xl relative z-10">
                <div className="flex flex-col items-center">
                    <div className="mb-5">
                        <Logo showText={true} darkText={true} variant="orange-symbol" />
                    </div>
                    <h2 className="text-center text-2xl md:text-3xl font-extrabold text-[#192631] tracking-tight">
                        {mode === 'login'
                            ? activeOrg.name === 'Apex Contracting & Engineering' ? 'NEXUS CONTRACTING' : activeOrg.name
                            : mode === 'register-company'
                            ? 'Launch Your Company Workspace'
                            : mode === 'signup'
                            ? `Join ${activeOrg.name}`
                            : 'Reset Access'}
                    </h2>
                    <p className="mt-1.5 text-center text-xs md:text-sm text-[#192631]/70 font-medium">
                        {mode === 'login'
                            ? 'Eng. Pierre Afifi · Architecture & Turnkey Contracting'
                            : mode === 'register-company'
                            ? 'Set up a workspace for your contracting company in seconds'
                            : mode === 'signup'
                            ? 'Create an operative account in this workspace'
                            : 'Enter your email to reset your password'}
                    </p>
                </div>

                {/* Mode Switch Tabs */}
                <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-[#192631]/[0.05] backdrop-blur-md rounded-2xl border border-[#192631]/10">
                    <button
                        type="button"
                        onClick={() => { setMode('login'); setError(null); setMessage(null); }}
                        className={clsx(
                            'py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all',
                            mode === 'login' ? 'bg-[#e04b2a] text-white shadow-md shadow-[#e04b2a]/25' : 'text-[#192631]/70 hover:text-[#192631] hover:bg-white/60'
                        )}
                    >
                        Sign In
                    </button>
                    <button
                        type="button"
                        onClick={() => { setMode('register-company'); setError(null); setMessage(null); }}
                        className={clsx(
                            'py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all',
                            mode === 'register-company' ? 'bg-[#e04b2a] text-white shadow-md shadow-[#e04b2a]/25' : 'text-[#192631]/70 hover:text-[#192631] hover:bg-white/60'
                        )}
                    >
                        New Company
                    </button>
                    <button
                        type="button"
                        onClick={() => { setMode('signup'); setError(null); setMessage(null); }}
                        className={clsx(
                            'py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all',
                            mode === 'signup' ? 'bg-[#e04b2a] text-white shadow-md shadow-[#e04b2a]/25' : 'text-[#192631]/70 hover:text-[#192631] hover:bg-white/60'
                        )}
                    >
                        Join Team
                    </button>
                </div>

                <form className="space-y-4" onSubmit={handleAuth}>
                    {mode === 'register-company' && (
                        <div className="space-y-4 p-4 rounded-2xl bg-white/70 border border-[#192631]/10 shadow-sm">
                            <div className="flex items-center gap-2 text-xs font-bold text-[#e04b2a] uppercase tracking-wider">
                                <Building2 className="w-4 h-4" />
                                Step 1: Contracting Company Branding
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-[#192631]/70 uppercase tracking-widest mb-1.5">
                                    Company Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g., Horizon Contracting & Civil Works"
                                    value={companyName}
                                    onChange={e => setCompanyName(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white/90 border border-[#192631]/15 text-[#192631] placeholder-[#192631]/40 rounded-xl text-sm focus:outline-none focus:border-[#e04b2a]"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-bold text-[#192631]/70 uppercase tracking-widest mb-1.5">
                                        Base Currency
                                    </label>
                                    <select
                                        value={currency}
                                        onChange={e => setCurrency(e.target.value)}
                                        className="w-full px-3 py-2.5 bg-white/90 border border-[#192631]/15 text-[#192631] rounded-xl text-sm"
                                    >
                                        {['AED', 'USD', 'SAR', 'EGP', 'EUR', 'GBP', 'QAR'].map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-[#192631]/70 uppercase tracking-widest mb-1.5">
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
                                                    primaryColor === c ? 'border-[#192631] scale-110 shadow-sm' : 'border-transparent opacity-70'
                                                )}
                                                style={{ backgroundColor: c }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-[#192631]/70 uppercase tracking-widest mb-1.5">
                                    Office Branches (Comma-separated)
                                </label>
                                <input
                                    type="text"
                                    value={branchesInput}
                                    onChange={e => setBranchesInput(e.target.value)}
                                    placeholder="Dubai, Riyadh, Cairo"
                                    className="w-full px-4 py-2 bg-white/90 border border-[#192631]/15 text-[#192631] placeholder-[#192631]/40 rounded-xl text-xs"
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        {(mode === 'signup' || mode === 'register-company') && (
                            <div>
                                <label htmlFor="full-name" className="block text-[11px] font-bold text-[#192631]/80 uppercase tracking-widest mb-1.5 ml-1">
                                    {mode === 'register-company' ? 'Company Admin Full Name *' : 'Full Name *'}
                                </label>
                                <input
                                    id="full-name"
                                    name="fullName"
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 bg-white/85 border border-[#192631]/15 placeholder-[#192631]/40 text-[#192631] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#e04b2a]/30 focus:border-[#e04b2a] text-sm font-semibold shadow-sm"
                                    placeholder="Eng. Ahmed Al-Mansoor"
                                    value={fullName}
                                    onChange={e => setFullName(e.target.value)}
                                />
                            </div>
                        )}

                        <div>
                            <label htmlFor="email-address" className="block text-[11px] font-bold text-[#192631]/80 uppercase tracking-widest mb-1.5 ml-1">
                                {mode === 'login' ? 'Work Email or Username *' : 'Work Email Address *'}
                            </label>
                            <input
                                id="email-address"
                                name="email"
                                type={mode === 'login' ? 'text' : 'email'}
                                autoComplete="username"
                                required
                                className="w-full px-4 py-3 bg-white/85 border border-[#192631]/15 placeholder-[#192631]/40 text-[#192631] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#e04b2a]/30 focus:border-[#e04b2a] text-sm font-semibold shadow-sm"
                                placeholder="pierre@nexus-contracting.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                            />
                        </div>

                        {mode !== 'forgot-password' && (
                            <div>
                                <div className="flex items-center justify-between mb-1.5 ml-1">
                                    <label htmlFor="password" className="block text-[11px] font-bold text-[#192631]/80 uppercase tracking-widest">
                                        Password *
                                    </label>
                                    {mode === 'login' && (
                                        <button
                                            type="button"
                                            onClick={() => setMode('forgot-password')}
                                            className="text-[11px] font-bold text-[#e04b2a] hover:text-[#c83e1f] uppercase tracking-wider"
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
                                    className="w-full px-4 py-3 bg-white/85 border border-[#192631]/15 placeholder-[#192631]/40 text-[#192631] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#e04b2a]/30 focus:border-[#e04b2a] text-sm font-semibold shadow-sm"
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
                            className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/25 text-red-700 text-xs font-semibold text-center"
                        >
                            {error}
                        </motion.div>
                    )}

                    {message && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-3.5 rounded-2xl bg-[#123524]/10 border border-[#123524]/25 text-[#123524] text-xs font-semibold text-center"
                        >
                            {message}
                        </motion.div>
                    )}

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-4 px-4 text-sm font-bold rounded-2xl text-white bg-[#192631] hover:bg-[#e04b2a] disabled:opacity-50 transition-all shadow-lg shadow-[#192631]/15"
                        >
                            {loading
                                ? 'Signing in...'
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
