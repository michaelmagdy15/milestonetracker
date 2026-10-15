import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Users, X, Check, ShieldCheck, Mail, DollarSign, Target, Copy, Calculator, Star, HardHat } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { SystemHint } from '../components/SystemHint';
import type { Engineer } from '../types';
import { motion } from 'framer-motion';
import { startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { EvaluationsModal } from '../components/EvaluationsModal';
import { ResourceHeatmap } from '../components/ResourceHeatmap';
import { SubcontractorsDirectoryHub } from '../components/nexus/SubcontractorsDirectoryHub';

export const Engineers = () => {
    const locationRoute = useLocation();
    const { engineers, projects, tasks, entries, addEngineer, updateEngineer, deleteEngineer } = useData();
    const [activeRosterTab, setActiveRosterTab] = useState<'engineers' | 'subcontractors'>(
        locationRoute.pathname === '/subcontractors' ? 'subcontractors' : 'engineers'
    );
    useEffect(() => {
        if (locationRoute.pathname === '/subcontractors') setActiveRosterTab('subcontractors');
        else if (locationRoute.pathname === '/engineers') setActiveRosterTab('engineers');
    }, [locationRoute.pathname]);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [evaluatingEngineer, setEvaluatingEngineer] = useState<Engineer | null>(null);

    const GoalEditor = ({ engineer }: { engineer: Engineer }) => {
        const [isEditing, setIsEditing] = useState(false);
        const [val, setVal] = useState(engineer.weeklyGoalHours?.toString() || '40');

        const handleSave = () => {
            updateEngineer({ ...engineer, weeklyGoalHours: parseInt(val) || 40 });
            setIsEditing(false);
        };

        if (isEditing) {
            return (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            value={val}
                            onChange={e => setVal(e.target.value)}
                            className="w-20 bg-[#192631]/[0.05] border border-[#192631]/10 rounded px-2 py-1 text-[#192631] text-lg font-black focus:outline-none focus:border-orange-500"
                        />
                        <button onClick={handleSave} className="p-1 text-[#e04b2a] hover:text-[#e04b2a] bg-[#e04b2a]/10 rounded"><Check className="w-4 h-4" /></button>
                        <button onClick={() => setIsEditing(false)} className="p-1 text-[#192631]/70 hover:text-[#192631]/85 bg-[#192631]/[0.05] rounded"><X className="w-4 h-4" /></button>
                    </div>
                </div>
            );
        }
        return (
            <div className="group/edit inline-flex items-center gap-2 cursor-pointer" onClick={() => setIsEditing(true)}>
                <div className="text-2xl font-black text-[#192631]">{engineer.weeklyGoalHours}<span className="text-[10px] ml-1 text-slate-600">H</span></div>
                <div className="p-1 bg-[#192631]/[0.05] rounded opacity-0 group-hover/edit:opacity-100 transition-opacity">
                    <Edit2 className="w-3 h-3 text-[#e04b2a]" />
                </div>
            </div>
        );
    };

    const RateEditor = ({ engineer }: { engineer: Engineer }) => {
        const [isEditing, setIsEditing] = useState(false);
        const [val, setVal] = useState(engineer.hourlyRate?.toString() || '0');

        const handleSave = () => {
            updateEngineer({ ...engineer, hourlyRate: parseFloat(val) || 0 });
            setIsEditing(false);
        };

        if (isEditing) {
            return (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            step="0.01"
                            value={val}
                            onChange={e => setVal(e.target.value)}
                            className="w-20 bg-[#192631]/[0.05] border border-[#192631]/10 rounded px-2 py-1 text-[#192631] text-lg font-black focus:outline-none focus:border-emerald-500"
                        />
                        <button onClick={handleSave} className="p-1 text-[#123524] hover:text-[#123524] bg-[#123524]/10 rounded"><Check className="w-4 h-4" /></button>
                        <button onClick={() => setIsEditing(false)} className="p-1 text-[#192631]/70 hover:text-[#192631]/85 bg-[#192631]/[0.05] rounded"><X className="w-4 h-4" /></button>
                    </div>
                </div>
            );
        }
        return (
            <div className="group/edit inline-flex items-center gap-2 cursor-pointer" onClick={() => setIsEditing(true)}>
                <div className="text-2xl font-black text-[#192631]">{engineer.hourlyRate || 0}<span className="text-[10px] ml-1 text-slate-600">AED/H</span></div>
                <div className="p-1 bg-[#192631]/[0.05] rounded opacity-0 group-hover/edit:opacity-100 transition-opacity">
                    <Edit2 className="w-3 h-3 text-[#123524]" />
                </div>
            </div>
        );
    };

    // Form State
    const [name, setName] = useState('');
    const [role, setRole] = useState('Engineer');
    const [hourlyRate, setHourlyRate] = useState<number>(0);
    const [weeklyGoalHours, setWeeklyGoalHours] = useState<number>(40);
    const [location, setLocation] = useState<'Abu Dhabi' | 'Cairo'>('Cairo');
    const { role: currentUserRole } = useAuth();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        const engineerData: Engineer = {
            id: editingId || crypto.randomUUID(),
            name,
            role,
            hourlyRate,
            weeklyGoalHours,
            location
        };

        if (editingId) {
            updateEngineer(engineerData);
        } else {
            addEngineer(engineerData);
        }

        resetForm();
    };

    const startEdit = (engineer: Engineer) => {
        setEditingId(engineer.id);
        setName(engineer.name);
        setRole(engineer.role || 'Engineer');
        setHourlyRate(engineer.hourlyRate || 0);
        setWeeklyGoalHours(engineer.weeklyGoalHours || 40);
        setLocation(engineer.location || 'Cairo');
        setIsAdding(true);
    };

    const resetForm = () => {
        setIsAdding(false);
        setEditingId(null);
        setName('');
        setRole('Engineer');
        setHourlyRate(0);
        setWeeklyGoalHours(40);
        setLocation('Cairo');
    };

    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleDelete = async (id: string) => {
        try {
            await deleteEngineer(id);
            setDeletingId(null);
        } catch (error) {
            console.error('Delete action failed:', error);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
        >
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div>
                    <h2 className="text-4xl lg:text-5xl font-black text-[#192631] tracking-tighter mb-2">
                        {activeRosterTab === 'subcontractors' ? (
                            <>Subcontractors & <span className="text-[#e04b2a]">Craftsmen (56)</span></>
                        ) : (
                            <>Engineering <span className="text-[#e04b2a]">Roster</span></>
                        )}
                    </h2>
                    <div className="h-1 w-20 bg-[#e04b2a] rounded-full mb-4"></div>
                    <p className="text-[#192631]/70 font-medium tracking-wide">
                        {activeRosterTab === 'subcontractors'
                            ? '56 Registered Subcontractors & Craftsmen · CEO 4-Pillar A/B/C Evaluation Matrix · Subcontractor Statements (ST) & Cash Payment Orders (CPO)'
                            : 'Command and control for your specialist engineering teams and 56 registered trade subcontractors.'}
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="bg-white/80 p-1.5 rounded-2xl border border-[#192631]/10 flex gap-1.5 backdrop-blur-xl shadow-sm">
                        <button
                            type="button"
                            onClick={() => setActiveRosterTab('engineers')}
                            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                                activeRosterTab === 'engineers'
                                    ? 'bg-[#e04b2a] text-white shadow-md shadow-[#e04b2a]/25'
                                    : 'text-[#192631]/75 hover:text-[#192631] hover:bg-[#192631]/[0.05]'
                            }`}
                        >
                            <Users className="w-4 h-4" />
                            <span>In-House Engineers ({engineers.length})</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveRosterTab('subcontractors')}
                            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                                activeRosterTab === 'subcontractors'
                                    ? 'bg-[#e04b2a] text-white shadow-md shadow-[#e04b2a]/25'
                                    : 'text-[#192631]/75 hover:text-[#192631] hover:bg-[#192631]/[0.05]'
                            }`}
                        >
                            <HardHat className="w-4 h-4" />
                            <span>56 Subcontractors & CPO/ST</span>
                        </button>
                    </div>
                    {activeRosterTab === 'engineers' && (currentUserRole === 'admin' || currentUserRole === 'project_manager') && (
                        <button
                            onClick={() => setIsAdding(true)}
                            disabled={isAdding}
                            className="flex items-center justify-center space-x-2 bg-[#192631] hover:bg-[#e04b2a] text-white px-5 py-3 rounded-2xl transition-all duration-300 shadow-md disabled:opacity-50 font-bold uppercase tracking-wider text-xs"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Recruit Specialist</span>
                        </button>
                    )}
                </div>
            </div>

            {activeRosterTab === 'subcontractors' ? (
                <SubcontractorsDirectoryHub />
            ) : (
                <>
                    <SystemHint>
                        <p><strong>Roster:</strong> Manage engineering talent and monitor current workloads.</p>
                        <p><strong>Resource Allocation:</strong> Use the Resource Heatmap to identify over-utilized or available engineers across different projects and tasks.</p>
                    </SystemHint>

                    <ResourceHeatmap engineers={engineers} tasks={tasks} />

            {isAdding && (
                <div className="bg-[#1a1a1a]/60 p-10 rounded-[32px] border border-[#192631]/10 backdrop-blur-3xl shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-500 via-purple-500 to-orange-500"></div>
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h3 className="text-2xl font-black text-[#192631] tracking-tight flex items-center gap-4">
                                <div className="p-3 bg-[#e04b2a]/10 rounded-2xl border border-[#e04b2a]/25">
                                    <Users className="w-6 h-6 text-[#e04b2a]" />
                                </div>
                                {editingId ? 'Modify Credentials' : 'New Operative'}
                            </h3>
                            <p className="text-[#192631]/60 text-[10px] font-bold uppercase tracking-[0.2em] mt-2 ml-14">Specialist Onboarding & Assignment</p>
                        </div>
                        <button onClick={resetForm} className="p-2 text-[#192631]/60 hover:text-[#192631] hover:bg-[#192631]/[0.05] rounded-full transition-all">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="block text-[11px] font-bold text-[#192631]/60 uppercase tracking-[0.2em] ml-1">Operative Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-5 py-4 bg-[#192631]/[0.05] border border-[#192631]/10 rounded-2xl text-[#192631] placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:bg-[#192631]/[0.05] transition-all font-medium"
                                    placeholder="e.g. John Doe"
                                    autoFocus
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-[11px] font-bold text-[#192631]/60 uppercase tracking-[0.2em] ml-1">Tactical Designation</label>
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="w-full px-5 py-4 bg-[#192631]/[0.05] border border-[#192631]/10 rounded-2xl text-[#192631] focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:bg-[#192631]/[0.05] transition-all font-medium appearance-none"
                                >
                                    <option value="Engineer" className="bg-[#1a1a1a]">Engineer</option>
                                    <option value="Senior Engineer" className="bg-[#1a1a1a]">Senior Engineer</option>
                                    <option value="Architect" className="bg-[#1a1a1a]">Architect</option>
                                    <option value="Project Manager" className="bg-[#1a1a1a]">Project Manager</option>
                                    <option value="Draftsman" className="bg-[#1a1a1a]">Draftsman</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-[11px] font-bold text-[#192631]/60 uppercase tracking-[0.2em] ml-1">Hourly Compensation (AED)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#192631]/60" />
                                    <input
                                        type="number"
                                        value={hourlyRate}
                                        onChange={(e) => setHourlyRate(Number(e.target.value))}
                                        className="w-full pl-14 pr-5 py-4 bg-[#192631]/[0.05] border border-[#192631]/10 rounded-2xl text-[#192631] placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:bg-[#192631]/[0.05] transition-all font-medium"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-[11px] font-bold text-[#192631]/60 uppercase tracking-[0.2em] ml-1">Weekly Capability Goal (Hrs)</label>
                                <div className="relative">
                                    <Target className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#192631]/60" />
                                    <input
                                        type="number"
                                        value={weeklyGoalHours}
                                        onChange={(e) => setWeeklyGoalHours(Number(e.target.value))}
                                        className="w-full pl-14 pr-5 py-4 bg-[#192631]/[0.05] border border-[#192631]/10 rounded-2xl text-[#192631] placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:bg-[#192631]/[0.05] transition-all font-medium"
                                        min="0"
                                        step="1"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-[11px] font-bold text-[#192631]/60 uppercase tracking-[0.2em] ml-1">Office Location</label>
                                <select
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value as 'Abu Dhabi' | 'Cairo')}
                                    className="w-full px-5 py-4 bg-[#192631]/[0.05] border border-[#192631]/10 rounded-2xl text-[#192631] focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:bg-[#192631]/[0.05] transition-all font-medium appearance-none"
                                >
                                    <option value="Cairo" className="bg-[#1a1a1a]">Cairo HQ</option>
                                    <option value="Abu Dhabi" className="bg-[#1a1a1a]">Abu Dhabi Branch</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-6 pt-8 border-t border-[#192631]/10">
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-8 py-4 text-[#192631]/60 hover:text-[#192631] font-bold uppercase tracking-widest text-[11px] transition-all"
                            >
                                Discard
                            </button>
                            <button
                                type="submit"
                                className="px-12 py-4 bg-white text-black hover:bg-orange-500 hover:text-white rounded-2xl transition-all duration-300 flex items-center space-x-3 shadow-xl font-black uppercase tracking-widest text-[11px]"
                            >
                                <Check className="w-4 h-4" />
                                <span>Save Credentials</span>
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {engineers.map((engineer, idx) => (
                    <motion.div
                        key={engineer.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="group bg-[#1a1a1a]/40 p-8 rounded-[32px] border border-[#192631]/10 hover:border-[#e04b2a]/25 transition-all duration-500 backdrop-blur-3xl shadow-xl hover:shadow-orange-500/5 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-[#e04b2a]/10 transition-colors"></div>
                        <div className="flex flex-col h-full relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-16 h-16 bg-[#192631]/[0.05] rounded-2xl flex items-center justify-center border border-[#192631]/10 group-hover:border-[#e04b2a]/25 group-hover:bg-[#e04b2a]/10 transition-all duration-500">
                                    <Users className="w-8 h-8 text-[#192631]/60 group-hover:text-[#e04b2a]" />
                                </div>
                                {(currentUserRole === 'admin' || currentUserRole === 'project_manager') && (
                                    <div className="flex gap-2">
                                        {deletingId === engineer.id ? (
                                            <div className="flex items-center gap-2 animate-in fade-in zoom-in duration-300">
                                                <button
                                                    onClick={() => handleDelete(engineer.id)}
                                                    className="px-3 py-2 bg-red-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-500 transition-all shadow-lg shadow-red-600/20"
                                                >
                                                    Confirm
                                                </button>
                                                <button
                                                    onClick={() => setDeletingId(null)}
                                                    className="p-2 bg-[#192631]/[0.05] text-[#192631]/70 hover:text-[#192631] rounded-xl border border-[#192631]/10 transition-all text-xs"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => setEvaluatingEngineer(engineer)}
                                                    className="p-2.5 bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white rounded-xl border border-amber-500/20 transition-all font-bold group/eval relative"
                                                    title="Evaluate Performance"
                                                >
                                                    <Star className="w-4 h-4 group-hover/eval:fill-white transition-all shadow-amber-500/50" />
                                                </button>
                                                <button
                                                    onClick={() => startEdit(engineer)}
                                                    className="p-2.5 bg-[#192631]/[0.05] text-[#192631]/60 hover:text-[#192631] hover:bg-[#192631]/[0.05] rounded-xl border border-[#192631]/10 transition-all"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setDeletingId(engineer.id)}
                                                    className="p-2.5 bg-[#192631]/[0.05] text-[#192631]/60 hover:text-red-500 hover:bg-red-500/10 rounded-xl border border-[#192631]/10 hover:border-red-500/20 transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="flex-1">
                                <h3 className="text-xl font-black text-[#192631] tracking-tight mb-2 group-hover:text-[#e04b2a] transition-colors">{engineer.name}</h3>
                                <div className="flex flex-wrap gap-2 mb-6">
                                    <span className="px-3 py-1 bg-[#192631]/[0.05] rounded-full text-[10px] font-black text-[#192631]/60 border border-[#192631]/10 uppercase tracking-widest group-hover:border-[#e04b2a]/25 group-hover:text-[#e04b2a]">
                                        {engineer.role || 'Specialist'}
                                    </span>
                                    <span className="px-3 py-1 bg-[#192631]/[0.05] rounded-full text-[10px] font-black text-[#192631]/60 border border-[#192631]/10 uppercase tracking-widest group-hover:border-purple-500/20 group-hover:text-[#192631]">
                                        {engineer.location || 'HQ'}
                                    </span>
                                    <span className="px-3 py-1 bg-[#123524]/10 rounded-full text-[10px] font-black text-emerald-500 border border-[#123524]/25 uppercase tracking-widest">
                                        Active
                                    </span>
                                </div>
                                <div
                                    onClick={() => navigator.clipboard.writeText(engineer.id)}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#192631]/[0.05] rounded-xl border border-[#192631]/10 cursor-pointer hover:bg-[#192631]/[0.05] hover:border-[#e04b2a]/25 transition-all text-[#192631]/70 hover:text-[#192631] group/copy"
                                    title="Click to copy Engineer ID"
                                >
                                    <Copy className="w-3 h-3 group-hover/copy:text-[#e04b2a] transition-colors" />
                                    <span className="text-[10px] font-mono tracking-wider">ID: {engineer.id.substring(0, 8)}...</span>
                                </div>

                                <div className="grid grid-cols-2 gap-4 py-4 border-t border-[#192631]/10 mt-4">
                                    <div>
                                        <div className="text-2xl font-black text-[#123524]">
                                            {tasks.filter(t => t.engineerId === engineer.id && t.status !== 'completed').length}
                                        </div>
                                        <div className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Active Tasks</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-black text-[#e04b2a]">
                                            {projects.filter(p => p.leadDesignerId === engineer.id).length}
                                        </div>
                                        <div className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Projects Led</div>
                                    </div>
                                </div>

                                {(currentUserRole === 'admin' || currentUserRole === 'project_manager') && (
                                    <div className="grid grid-cols-2 gap-4 py-6 border-t border-[#192631]/10">
                                        <div>
                                            <RateEditor engineer={engineer} />
                                            <div className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mt-1">Rate</div>
                                        </div>
                                        <div>
                                            <GoalEditor engineer={engineer} />
                                            <div className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mt-1">Goal</div>
                                        </div>
                                        <div className="col-span-2 mt-2 p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 flex items-center justify-between">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Calculator className="w-3.5 h-3.5 text-emerald-500" />
                                                    <div className="text-[9px] font-bold text-emerald-500/70 uppercase tracking-widest">Payout MTD (Live)</div>
                                                </div>
                                                <div className="text-[#192631]/70 text-xs">Based on logged entries this month</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-black text-[#123524]">
                                                    {(() => {
                                                        const monthStart = startOfMonth(new Date());
                                                        const monthEnd = endOfMonth(new Date());
                                                        const engEntries = entries.filter(e =>
                                                            e.engineerId === engineer.id &&
                                                            isWithinInterval(new Date(e.date), { start: monthStart, end: monthEnd })
                                                        );
                                                        const totalHours = engEntries.reduce((sum, e) => sum + e.timeSpent, 0);
                                                        return (totalHours * (engineer.hourlyRate || 0)).toLocaleString(undefined, { maximumFractionDigits: 0 });
                                                    })()}
                                                    <span className="text-[10px] ml-1 text-emerald-500/50 uppercase tracking-wider">AED</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="mt-4 pt-4 border-t border-[#192631]/10">
                                    <p className="text-[9px] font-black text-[#192631]/60 uppercase tracking-widest mb-3">Skills Arsenal</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {(engineer.skills && engineer.skills.length > 0 ? engineer.skills : ['AutoCAD', 'Revit', 'Design']).map(skill => (
                                            <span key={skill} className="px-2 py-1 bg-orange-500/5 text-[#e04b2a]/70 border border-orange-500/10 rounded-lg text-[8px] font-bold uppercase tracking-tighter">
                                                {skill}
                                            </span>
                                        ))}
                                        {(!engineer.skills || engineer.skills.length < 5) && (
                                            <button className="px-2 py-1 bg-[#192631]/[0.05] text-slate-600 border border-[#192631]/10 rounded-lg text-[8px] font-bold uppercase tracking-tighter hover:text-[#192631] transition-all">
                                                + Grow
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-[#192631]/10 flex items-center justify-between">
                                <div className="flex items-center text-[10px] font-bold text-[#192631]/60 uppercase tracking-[0.2em]">
                                    <ShieldCheck className="w-3.5 h-3.5 mr-2 text-orange-500" />
                                    Verified Personnel
                                </div>
                                <button className="p-2 text-[#192631]/60 hover:text-[#e04b2a] transition-colors">
                                    <Mail className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}

                {engineers.length === 0 && !isAdding && (
                    <div className="col-span-full py-32 text-center bg-[#1a1a1a]/40 rounded-[40px] border border-dashed border-[#192631]/10 backdrop-blur-3xl">
                        <div className="w-24 h-24 bg-[#192631]/[0.05] rounded-[40px] flex items-center justify-center mx-auto mb-8 border border-[#192631]/10">
                            <Users className="w-12 h-12 text-slate-700" />
                        </div>
                        <h3 className="text-2xl font-black text-[#192631] tracking-tight">No specialists assigned</h3>
                        <p className="text-[#192631]/60 mt-2 font-medium">Recruit your first engineer to start tracking operations.</p>
                    </div>
                )}
            </div>

                    <EvaluationsModal
                        isOpen={!!evaluatingEngineer}
                        onClose={() => setEvaluatingEngineer(null)}
                        engineer={evaluatingEngineer}
                    />
                </>
            )}
        </motion.div>
    );
};
