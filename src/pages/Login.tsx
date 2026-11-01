import React, { useState } from 'react';
import {
    supabase,
    registerContractingCompany,
    PIERRE_OWNER_EMAIL,
    PIERRE_OWNER_PASSWORD,
    DEFAULT_ORG_ID,
} from '../lib/supabase';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTenant, DEC_ORG_ID } from '../context/TenantContext';
import { motion } from 'framer-motion';
import { Building2, Compass, Sparkles } from 'lucide-react';
import clsx from 'clsx';
import logo from '../assets/logo.png';

const QUICK_COLORS = ['#f3822d', '#e04b2a', '#192631', '#123524', '#ff7f50'];

export const Login: React.FC = () => {
    const { user, isLoadingAuth } = useAuth();
    const { activeOrg, switchOrganization, refreshOrganizations } = useTenant();

    const isDecSelected = activeOrg.id === DEC_ORG_ID;

    const [mode, setMode] = useState<'login' | 'register-company' | 'signup' | 'forgot-password'>('login');
    const [email, setEmail] = useState(
        isDecSelected ? 'michael@dec.com' : PIERRE_OWNER_EMAIL
    );
    const [password, setPassword] = useState(
        isDecSelected ? 'DEC@2026!' : PIERRE_OWNER_PASSWORD
    );
    const [fullName, setFullName] = useState('');

    // Self-Serve Contracting Company Registration fields
    const [companyName, setCompanyName] = useState('');
    const tagline = 'Architecture, Turnkey Contracting & ERP Platform';
    const [primaryColor, setPrimaryColor] = useState('#f3822d');
    const [currency, setCurrency] = useState('EGP');
    const [branchesInput, setBranchesInput] = useState('El Nozha El Gedida HQ, New Cairo, Madinaty');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    if (isLoadingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f] py-12 px-4 sm:px-6 lg:px-8">
                <div className="text-slate-400 font-mono text-xs uppercase tracking-widest">Loading session...</div>
            </div>
        );
    }

    if (user && mode !== 'forgot-password') {
        return <Navigate to="/" replace />;
    }

    const handleSelectPortal = (targetOrgId: string) => {
        switchOrganization(targetOrgId);
        setError(null);
        setMessage(null);
        setMode('login');
        if (targetOrgId === DEC_ORG_ID) {
            setEmail('michael@dec.com');
            setPassword('DEC@2026!');
        } else {
            setEmail(PIERRE_OWNER_EMAIL);
            setPassword(PIERRE_OWNER_PASSWORD);
        }
    };

    const handleInstantPortalSignIn = async (targetOrgId: string) => {
        setLoading(true);
        setError(null);
        switchOrganization(targetOrgId);
        const loginEmail = targetOrgId === DEC_ORG_ID ? 'michael@dec.com' : PIERRE_OWNER_EMAIL;
        const loginPassword = targetOrgId === DEC_ORG_ID ? 'DEC@2026!' : PIERRE_OWNER_PASSWORD;
        setEmail(loginEmail);
        setPassword(loginPassword);
        try {
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: loginEmail,
                password: loginPassword,
            });
            if (signInError) throw new Error(signInError.message);
            localStorage.setItem('whitelabel_active_org_id', targetOrgId);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

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
                        },
                    },
                });
                if (signUpError) throw new Error(signUpError.message);
                setMessage('Account created and ready.');
            } else if (mode === 'forgot-password') {
                const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: `${window.location.origin}/reset-password`,
                });
                if (resetError) throw new Error(resetError.message);
                setMessage('If an account with that email exists, a password reset link has been sent.');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background elements (Exact e1a8d80 Spec) */}
            <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500/20 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full"></div>
            </div>

            <div className="max-w-md w-full space-y-6 md:space-y-8 bg-[#1a1a1a]/40 backdrop-blur-2xl p-6 md:p-10 rounded-2xl md:rounded-[32px] border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative z-10 transition-all duration-500 hover:border-white/10">
                <div className="flex flex-col items-center">
                    <div className="w-24 h-24 mb-6 relative flex items-center justify-center">
                        <div className="absolute inset-0 bg-orange-500/20 blur-2xl rounded-full"></div>
                        {isDecSelected ? (
                            <img src={logo} alt="DEC Logo" className="w-full h-full object-contain relative z-10 animate-pulse-slow" />
                        ) : (
                            <img src="/nexus-symbol.svg" alt="NEXUS Logo" className="w-20 h-20 object-contain relative z-10 animate-pulse-slow" />
                        )}
                    </div>
                    <h2 className="text-center text-3xl font-extrabold text-white tracking-tight">
                        {mode === 'login'
                            ? 'Welcome Back'
                            : mode === 'register-company'
                            ? 'Launch Workspace'
                            : mode === 'signup'
                            ? 'Create Account'
                            : 'Reset Access'}
                    </h2>
                    <p className="mt-2 text-center text-sm text-slate-400 font-medium">
                        {mode === 'login'
                            ? isDecSelected
                                ? 'DEC Engineering Consultant Tracker'
                                : 'NEXUS Turnkey Contracting & ERP Suite'
                            : mode === 'register-company'
                            ? 'Provision a new white-label AEC tenant'
                            : mode === 'signup'
                            ? 'Sign up to start tracking'
                            : 'Enter your email to receive a reset link'}
                    </p>
                </div>

                {/* Dual-Tenant Switcher (DEC Portal vs NEXUS Contracting) */}
                {mode === 'login' && (
                    <div className="grid grid-cols-2 gap-2 p-1.5 bg-white/5 rounded-2xl border border-white/5">
                        <button
                            type="button"
                            onClick={() => handleSelectPortal(DEC_ORG_ID)}
                            onDoubleClick={() => handleInstantPortalSignIn(DEC_ORG_ID)}
                            className={clsx(
                                'flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all',
                                isDecSelected
                                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30 shadow-orange-glow'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                            )}
                        >
                            <Compass className="w-3.5 h-3.5" />
                            <span>DEC Portal</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => handleSelectPortal(DEFAULT_ORG_ID)}
                            onDoubleClick={() => handleInstantPortalSignIn(DEFAULT_ORG_ID)}
                            className={clsx(
                                'flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all',
                                !isDecSelected
                                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30 shadow-orange-glow'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                            )}
                        >
                            <Building2 className="w-3.5 h-3.5" />
                            <span>NEXUS ERP</span>
                        </button>
                    </div>
                )}

                <form className="mt-6 space-y-6" onSubmit={handleAuth}>
                    <div className="space-y-4">
                        {mode === 'register-company' && (
                            <>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">
                                        Company Name
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={companyName}
                                        onChange={e => setCompanyName(e.target.value)}
                                        placeholder="e.g., Horizon Contracting & Architecture"
                                        className="appearance-none relative block w-full px-4 py-3 bg-white/5 border border-white/5 placeholder-slate-600 text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:bg-white/10 transition-all duration-300 sm:text-sm font-medium"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">
                                            Currency
                                        </label>
                                        <select
                                            value={currency}
                                            onChange={e => setCurrency(e.target.value)}
                                            className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 text-white rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                                        >
                                            <option value="EGP">EGP</option>
                                            <option value="SAR">SAR</option>
                                            <option value="AED">AED</option>
                                            <option value="USD">USD</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">
                                            Brand Accent
                                        </label>
                                        <div className="flex items-center gap-1.5 bg-white/5 border border-white/5 rounded-2xl px-3 py-2.5">
                                            {QUICK_COLORS.map(c => (
                                                <button
                                                    key={c}
                                                    type="button"
                                                    onClick={() => setPrimaryColor(c)}
                                                    className={clsx(
                                                        'w-6 h-6 rounded-full transition-transform',
                                                        primaryColor === c ? 'scale-110 ring-2 ring-white' : 'opacity-70'
                                                    )}
                                                    style={{ backgroundColor: c }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">
                                        Branches / Warehouses
                                    </label>
                                    <input
                                        type="text"
                                        value={branchesInput}
                                        onChange={e => setBranchesInput(e.target.value)}
                                        className="appearance-none relative block w-full px-4 py-3 bg-white/5 border border-white/5 placeholder-slate-600 text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:bg-white/10 transition-all duration-300 sm:text-sm font-medium"
                                    />
                                </div>
                            </>
                        )}

                        {(mode === 'signup' || mode === 'register-company') && (
                            <div>
                                <label
                                    htmlFor="full-name"
                                    className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1"
                                >
                                    Full Name
                                </label>
                                <input
                                    id="full-name"
                                    name="fullName"
                                    type="text"
                                    required
                                    className="appearance-none relative block w-full px-4 py-3 bg-white/5 border border-white/5 placeholder-slate-600 text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:bg-white/10 transition-all duration-300 sm:text-sm font-medium"
                                    placeholder="Eng. Michael Magdy"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                />
                            </div>
                        )}

                        <div>
                            <label
                                htmlFor="email-address"
                                className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1"
                            >
                                Email or Username
                            </label>
                            <input
                                id="email-address"
                                name="email"
                                type="text"
                                autoComplete="email"
                                required
                                className="appearance-none relative block w-full px-4 py-3 bg-white/5 border border-white/5 placeholder-slate-600 text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:bg-white/10 transition-all duration-300 sm:text-sm font-medium"
                                placeholder="michael@dec.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        {mode !== 'forgot-password' && (
                            <div>
                                <div className="flex items-center justify-between mb-2 ml-1">
                                    <label
                                        htmlFor="password"
                                        className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest"
                                    >
                                        Password
                                    </label>
                                    {mode === 'login' && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setMode('forgot-password');
                                                setMessage(null);
                                                setError(null);
                                            }}
                                            className="text-[11px] font-bold text-orange-500 hover:text-orange-400 uppercase tracking-wider transition-colors"
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
                                    className="appearance-none relative block w-full px-4 py-3 bg-white/5 border border-white/5 placeholder-slate-600 text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:bg-white/10 transition-all duration-300 sm:text-sm font-medium"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        )}
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold text-center"
                        >
                            {error}
                        </motion.div>
                    )}

                    {message && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-4 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold text-center"
                        >
                            {message}
                        </motion.div>
                    )}

                    <div className="pt-2 space-y-3">
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-bold rounded-2xl text-white bg-orange-600 hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 focus:ring-offset-[#0f0f0f] disabled:opacity-50 transition-all duration-300 shadow-xl shadow-orange-600/20 hover:shadow-orange-600/40 hover:-translate-y-0.5 active:translate-y-0"
                        >
                            {loading ? (
                                <span className="flex items-center">
                                    <svg
                                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    Processing...
                                </span>
                            ) : mode === 'login' ? (
                                `Sign In to ${isDecSelected ? 'DEC Portal' : 'NEXUS ERP'}`
                            ) : mode === 'register-company' ? (
                                'Launch Contracting Workspace'
                            ) : mode === 'signup' ? (
                                'Sign Up'
                            ) : (
                                'Reset Password'
                            )}
                        </button>
                    </div>

                    <div className="flex items-center justify-between pt-2 text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em]">
                        {mode === 'login' ? (
                            <>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setMode('signup');
                                        setMessage(null);
                                        setError(null);
                                    }}
                                    className="hover:text-white transition-colors"
                                >
                                    Need an account? Sign Up
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setMode('register-company');
                                        setMessage(null);
                                        setError(null);
                                    }}
                                    className="text-orange-400 hover:text-orange-300 flex items-center gap-1 transition-colors"
                                >
                                    <Sparkles className="w-3 h-3" /> New Firm
                                </button>
                            </>
                        ) : (
                            <button
                                type="button"
                                onClick={() => {
                                    setMode('login');
                                    setMessage(null);
                                    setError(null);
                                }}
                                className="w-full text-center hover:text-white transition-colors"
                            >
                                Back to Login
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};
