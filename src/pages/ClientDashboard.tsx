
import { useData } from '../context/DataContext';
import { FolderKanban, Activity, Briefcase, Calendar, ChevronRight, Award, Box } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { SystemHint } from '../components/SystemHint';

export const ClientDashboard = () => {
    const { projects, entries, milestones, updateMilestone } = useData();

    // Active Projects (projects with entries in last 30 days)
    const thirtyDaysAgo = new Date(new Date().setDate(new Date().getDate() - 30));
    const activeProjectIds = new Set(
        entries
            .filter(e => new Date(e.date) >= thirtyDaysAgo)
            .map(e => e.projectId)
    );
    const activeProjectsCount = activeProjectIds.size;

    // Recent Activity (Anonymized/High-level for clients)
    const recentEntries = [...entries]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 8);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
        >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-4xl lg:text-5xl font-black text-[#192631] tracking-tighter mb-2">
                        Partner <span className="text-[#e04b2a]">Portal</span>
                    </h2>
                    <div className="h-1 w-20 bg-orange-500 rounded-full mb-4"></div>
                    <p className="text-[#192631]/60 font-medium tracking-wide">Real-time oversight of your strategic engineering ventures.</p>
                </div>
                <div className="px-6 py-3 bg-[#192631]/[0.05] rounded-2xl border border-[#192631]/10 backdrop-blur-3xl flex items-center gap-4">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-black text-[#192631]/70 uppercase tracking-widest">Live Feed Synchronized</span>
                </div>
            </div>

            <SystemHint>
                <p><strong>Partner Portal:</strong> A simplified, high-level view designed for clients and external stakeholders to monitor engineering progress without operational clutter.</p>
                <p><strong>Milestone Clearance:</strong> Clients can review project milestones and mark them as 'Approved' or 'Flag for Revision'.</p>
            </SystemHint>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#1a1a1a]/40 p-8 rounded-[40px] border border-[#192631]/10 backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-[#e04b2a]/10 transition-colors"></div>
                    <div className="relative z-10 flex items-center gap-6">
                        <div className="w-16 h-16 bg-[#192631]/[0.05] rounded-2xl flex items-center justify-center border border-[#192631]/10 group-hover:bg-[#e04b2a]/10 group-hover:border-[#e04b2a]/25 transition-all duration-500">
                            <FolderKanban className="w-8 h-8 text-[#192631]/60 group-hover:text-[#e04b2a]" />
                        </div>
                        <div>
                            <p className="text-[#192631]/60 font-bold text-[10px] uppercase tracking-[0.2em] mb-1">Active Ventures</p>
                            <p className="text-4xl font-black text-[#192631] tracking-tighter">
                                {activeProjectsCount}
                                <span className="text-sm font-bold text-slate-700 ml-3">/ {projects.length} Total</span>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-[#1a1a1a]/40 p-8 rounded-[40px] border border-[#192631]/10 backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-[#123524]/10 transition-colors"></div>
                    <div className="relative z-10 flex items-center gap-6">
                        <div className="w-16 h-16 bg-[#192631]/[0.05] rounded-2xl flex items-center justify-center border border-[#192631]/10 group-hover:bg-[#123524]/10 group-hover:border-[#123524]/25 transition-all duration-500">
                            <Activity className="w-8 h-8 text-[#192631]/60 group-hover:text-[#123524]" />
                        </div>
                        <div>
                            <p className="text-[#192631]/60 font-bold text-[10px] uppercase tracking-[0.2em] mb-1">Recent Intelligence</p>
                            <p className="text-4xl font-black text-[#192631] tracking-tighter">{recentEntries.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Interactive 3D BIM Viewer Placeholder */}
            <div className="bg-[#1a1a1a]/40 rounded-[40px] border border-[#192631]/10 backdrop-blur-3xl shadow-2xl p-8 relative overflow-hidden group">
                <div className="flex items-center justify-between mb-8 relative z-10">
                    <div>
                        <h3 className="text-xl font-black text-[#192631] tracking-tight flex items-center gap-4">
                            <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                                <Box className="w-6 h-6 text-[#192631]" />
                            </div>
                            Interactive 3D / BIM Viewer
                        </h3>
                        <p className="text-[#192631]/60 text-[10px] font-bold uppercase tracking-[0.2em] mt-2 ml-14">Powered by WebGL Spatial Engine</p>
                    </div>
                </div>
                <div className="relative w-full aspect-video md:aspect-[21/9] bg-[#f5f5f5]/85 rounded-[24px] border border-[#192631]/10 overflow-hidden flex flex-col items-center justify-center">
                    {/* Placeholder Grid lines */}
                    <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
                    <Box className="w-16 h-16 text-[#192631] font-bold0/30 mb-4 animate-pulse relative z-10" />
                    <p className="text-[#192631] font-bold text-lg relative z-10 tracking-wide">3D Model Space</p>
                    <p className="text-[#192631]/60 font-medium text-sm relative z-10 mt-1">Select a venture to render the architectural framework</p>
                    <div className="absolute bottom-6 right-6 flex gap-3 z-10">
                        <button className="px-6 py-3 bg-blue-500/20 text-[#192631] hover:bg-blue-500/30 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-500/30 transition-all shadow-xl">
                            Load Sample IFC
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity */}
                <div className="lg:col-span-2 bg-[#1a1a1a]/40 rounded-[40px] border border-[#192631]/10 backdrop-blur-3xl shadow-2xl p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-orange-600/10 transition-colors"></div>

                    <div className="flex items-center justify-between mb-10 relative z-10">
                        <h3 className="text-xl font-black text-[#192631] tracking-tight flex items-center gap-4">
                            <div className="p-3 bg-[#e04b2a]/10 rounded-2xl border border-[#e04b2a]/25">
                                <Activity className="w-6 h-6 text-[#e04b2a]" />
                            </div>
                            Operation Feed
                        </h3>
                        <p className="text-[#192631]/60 text-[10px] font-bold uppercase tracking-[0.2em]">Latest Project Updates</p>
                    </div>

                    <div className="space-y-4 relative z-10">
                        {recentEntries.length === 0 ? (
                            <div className="py-20 text-center border-2 border-dashed border-[#192631]/10 rounded-[32px]">
                                <Activity className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                                <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest">No recent orbital data</p>
                            </div>
                        ) : (
                            recentEntries.map((entry, idx) => {
                                const project = projects.find(p => p.id === entry.projectId);
                                return (
                                    <motion.div
                                        key={entry.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="p-6 bg-white/[0.02] hover:bg-white/[0.05] rounded-[32px] border border-[#192631]/10 hover:border-[#e04b2a]/25 transition-all duration-300 group/item"
                                    >
                                        <div className="flex gap-6 items-start">
                                            <div className="w-12 h-12 rounded-2xl bg-[#192631]/[0.05] flex items-center justify-center text-[#e04b2a] font-black text-sm border border-[#192631]/10 group-hover/item:border-[#e04b2a]/25 transition-all">
                                                {project?.name?.charAt(0) || '?'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className="text-md font-black text-[#192631] uppercase tracking-tight group-hover/item:text-[#e04b2a] transition-colors">
                                                        {project?.name}
                                                    </h4>
                                                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{format(new Date(entry.date), 'MMM d, yyyy')}</span>
                                                </div>
                                                <p className="text-[#192631]/70 text-sm font-medium leading-relaxed mb-4">{entry.taskDescription}</p>
                                                <div className="flex items-center gap-4">
                                                    {entry.milestone && (
                                                        <div className="flex items-center gap-2 px-3 py-1 bg-[#e04b2a]/10 rounded-full border border-[#e04b2a]/25">
                                                            <div className="w-1 h-1 bg-orange-400 rounded-full"></div>
                                                            <span className="text-[9px] font-black text-[#e04b2a] uppercase tracking-widest">Phase: {entry.milestone}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-2 px-3 py-1 bg-[#192631]/[0.05] rounded-full border border-[#192631]/10">
                                                        <Calendar className="w-3 h-3 text-[#192631]/60" />
                                                        <span className="text-[9px] font-black text-[#192631]/60 uppercase tracking-widest">Logged Update</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })
                        )}
                    </div>

                    <div className="mt-12 relative z-10">
                        <h3 className="text-xl font-black text-[#192631] tracking-tight flex items-center gap-4 mb-8">
                            <div className="p-3 bg-[#123524]/10 rounded-2xl border border-[#123524]/25">
                                <Award className="w-6 h-6 text-[#123524]" />
                            </div>
                            Milestone Clearance
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {milestones.filter(m => m.clientStatus !== 'approved').slice(0, 4).map(m => (
                                <div key={m.id} className="p-6 bg-[#192631]/[0.05] rounded-[32px] border border-[#192631]/10 flex flex-col justify-between">
                                    <div>
                                        <p className="text-[10px] font-black text-[#192631]/60 uppercase tracking-widest mb-1">{projects.find(p => p.id === m.projectId)?.name}</p>
                                        <h4 className="text-[#192631] font-bold mb-4">{m.name}</h4>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => updateMilestone({ ...m, clientStatus: 'revision' })}
                                            className="flex-1 py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-2xl border border-rose-500/20 text-[10px] font-black uppercase tracking-widest transition-all"
                                        >
                                            Flag for Revision
                                        </button>
                                        <button
                                            onClick={() => updateMilestone({ ...m, clientStatus: 'approved' })}
                                            className="flex-1 py-3 bg-[#123524]/10 hover:bg-emerald-600 hover:text-white text-[#123524] rounded-2xl border border-[#123524]/25 text-[10px] font-black uppercase tracking-widest transition-all"
                                        >
                                            Approve
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Quick Actions / Side Panel */}
                <div className="space-y-8">
                    <div className="bg-[#1a1a1a]/40 p-8 rounded-[40px] border border-[#192631]/10 backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-full -ml-16 -mt-16 blur-3xl group-hover:bg-[#123524]/10 transition-colors"></div>
                        <h3 className="text-xl font-black text-[#192631] tracking-tight uppercase mb-8 flex items-center gap-4">
                            <Briefcase className="w-5 h-5 text-[#192631]/60" />
                            Venture Registry
                        </h3>
                        <div className="space-y-4">
                            {projects.map(p => (
                                <div key={p.id} className="flex items-center justify-between p-5 bg-[#192631]/[0.05] hover:bg-orange-600/10 rounded-2xl border border-[#192631]/10 hover:border-[#e04b2a]/25 transition-all duration-300 cursor-pointer group/card">
                                    <div className="flex items-center gap-4">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                                        <span className="text-sm font-black text-[#192631]/85 group-hover/card:text-[#192631] uppercase tracking-tight">{p.name}</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-700 group-hover/card:text-[#e04b2a] group-hover/card:translate-x-1 transition-all" />
                                </div>
                            ))}
                            {projects.length === 0 && (
                                <div className="text-center py-8">
                                    <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest">No active deployments</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-600/10 to-purple-600/10 border border-[#192631]/10 rounded-[40px] p-8 text-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="w-16 h-16 bg-[#192631]/[0.05] rounded-2xl flex items-center justify-center mx-auto mb-6 border border-[#192631]/10 relative z-10">
                            <Award className="w-8 h-8 text-[#e04b2a]" />
                        </div>
                        <h4 className="text-[#192631] font-black uppercase tracking-tight mb-2 relative z-10">Executive Oversight</h4>
                        <p className="text-[#192631]/60 text-xs font-medium leading-relaxed relative z-10">Providing transparent metrics and high-fidelity reporting for all partner stakeholders.</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
