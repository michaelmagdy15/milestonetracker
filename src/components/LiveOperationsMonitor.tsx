import { useMemo, useEffect, useState } from 'react';
import { useData } from '../context/DataContext';
import { Activity, Target, Clock, Monitor } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

export const LiveOperationsMonitor = () => {
    const { engineers, appUsageLogs, entries } = useData();
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const activeEngineers = useMemo(() => {
        return engineers.map(eng => {
            const logs = appUsageLogs.filter(l => l.engineerId === eng.id);
            const latestLog = logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
            
            // For prototype display purposes, if log is within 2 hours, consider online
            const isOnline = latestLog && (currentTime.getTime() - new Date(latestLog.timestamp).getTime() < 2 * 60 * 60 * 1000);
            
            const currentTask = entries
                .filter(e => e.engineerId === eng.id)
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

            return {
                id: eng.id,
                name: eng.name,
                role: eng.role,
                isOnline,
                latestLog,
                currentTask
            };
        }).sort((a, b) => {
            if (a.isOnline === b.isOnline) {
                const timeA = a.latestLog ? new Date(a.latestLog.timestamp).getTime() : 0;
                const timeB = b.latestLog ? new Date(b.latestLog.timestamp).getTime() : 0;
                return timeB - timeA;
            }
            return a.isOnline ? -1 : 1;
        });
    }, [engineers, appUsageLogs, entries, currentTime]);

    const onlineCount = activeEngineers.filter(e => e.isOnline).length;

    return (
        <div className="bg-[#1a1a1a]/40 rounded-2xl md:rounded-[32px] border border-[#192631]/10 p-4 md:p-8 backdrop-blur-3xl relative overflow-hidden group mb-4 md:mb-8">
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.03), transparent)' }} />
            
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-8 border-b border-[#192631]/10 pb-6">
                    <div>
                        <h3 className="text-xl font-black text-[#192631] tracking-tight flex items-center gap-3 mb-2">
                            <Activity className="w-6 h-6 text-[#123524] animate-pulse" />
                            Live Operations Central
                        </h3>
                        <p className="text-xs text-[#192631]/60 font-medium">Real-time presence and active application monitoring via WebSockets.</p>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-bold text-[#123524] uppercase tracking-widest bg-[#123524]/10 px-3 py-1.5 rounded-lg border border-[#123524]/25 font-mono flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping shadow-[0_0_10px_rgba(52,211,153,0.8)]"></div>
                            {onlineCount} Online
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    <AnimatePresence>
                        {activeEngineers.map(eng => {
                            const isOnline = eng.isOnline;
                            return (
                                <motion.div 
                                    key={eng.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className={`p-4 rounded-2xl border transition-all duration-300 ${
                                        isOnline 
                                        ? 'bg-emerald-500/5 border-[#123524]/25 shadow-[0_0_20px_rgba(16,185,129,0.05)]' 
                                        : 'bg-[#192631]/[0.05] border-[#192631]/10 opacity-60 hover:opacity-100'
                                    }`}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <div className="w-10 h-10 rounded-xl bg-[#2a2a2a] flex items-center justify-center text-[#192631] font-black text-sm border border-[#192631]/10">
                                                    {eng.name.charAt(0)}
                                                </div>
                                                <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-[#1a1a1a] ${isOnline ? 'bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.8)]' : 'bg-slate-600'}`}></div>
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black text-[#192631] truncate max-w-[120px]">{eng.name}</h4>
                                                <p className="text-[10px] text-[#192631]/60 font-bold uppercase tracking-wider">{eng.role || 'Engineer'}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            {eng.latestLog ? (
                                                <p className="text-[10px] font-mono text-[#192631]/70 flex items-center justify-end gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {formatDistanceToNow(new Date(eng.latestLog.timestamp), { addSuffix: true })}
                                                </p>
                                            ) : (
                                                <p className="text-[10px] font-mono text-slate-600">No data</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2 mt-4">
                                        <div className="flex items-center gap-2 bg-[#f5f5f5]/85 p-2 rounded-lg border border-[#192631]/10">
                                            <Monitor className={`w-3.5 h-3.5 ${isOnline ? 'text-[#123524]' : 'text-[#192631]/60'}`} />
                                            <p className="text-xs text-[#192631]/85 truncate font-medium flex-1">
                                                {eng.latestLog ? eng.latestLog.activeWindow : 'Offline'}
                                            </p>
                                        </div>
                                        
                                        <div className="flex items-center gap-2 bg-[#f5f5f5]/85 p-2 rounded-lg border border-[#192631]/10 mt-1">
                                            <Target className="w-3.5 h-3.5 text-[#e04b2a]" />
                                            <p className="text-xs text-[#192631]/70 truncate italic">
                                                {eng.currentTask ? eng.currentTask.taskDescription : 'No active milestone tracking'}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};
