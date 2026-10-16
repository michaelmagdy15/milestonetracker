import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Folder, X, Check, Users, Calendar, Target, RefreshCw, Settings, GripVertical, ChevronUp, ChevronDown, Receipt, Calculator, FileCheck2, PackageCheck, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useWorkflow, NEXUS_LIFECYCLE_STAGES } from '../context/WorkflowContext';
import type { Project, ProjectPhase } from '../types';
import { motion } from 'framer-motion';
import { RiskIndicator } from '../components/RiskIndicator';
import { decWorkflowTemplate } from '../utils/workflowTemplate';
import { SystemHint } from '../components/SystemHint';
import { NEXUS_LIVE_PROJECTS } from '../data/nexusLiveSeedData';

// --- Separate Component for Phase Management ---
const PhaseConfigModal = ({
    onClose,
    projectPhases,
    addProjectPhase,
    updateProjectPhase,
    deleteProjectPhase
}: {
    onClose: () => void;
    projectPhases: ProjectPhase[];
    addProjectPhase: (phase: Omit<ProjectPhase, 'id'>) => Promise<void>;
    updateProjectPhase: (phase: ProjectPhase) => Promise<void>;
    deleteProjectPhase: (id: string) => Promise<void>;
}) => {
    const [localPhases, setLocalPhases] = useState<ProjectPhase[]>([]);
    const [newPhaseName, setNewPhaseName] = useState('');

    // Sync local phases with Context when it updates superficially
    useEffect(() => {
        setLocalPhases(projectPhases);
    }, [projectPhases]);

    const handleLocalNameChange = (id: string, newName: string) => {
        setLocalPhases(prev => prev.map(p => p.id === id ? { ...p, name: newName } : p));
    };

    const handleNameBlur = async (phase: ProjectPhase) => {
        const original = projectPhases.find(p => p.id === phase.id);
        if (original && original.name !== phase.name) {
            await updateProjectPhase(phase);
        }
    };

    const handleAddPhase = async () => {
        if (!newPhaseName.trim()) return;

        // Optimistically add to local UI
        const newPhase = { name: newPhaseName, orderIndex: localPhases.length };
        setNewPhaseName('');

        await addProjectPhase(newPhase);
    };

    const handlePhaseReorder = async (index: number, direction: 'up' | 'down') => {
        const newPhases = [...localPhases];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        if (swapIndex < 0 || swapIndex >= newPhases.length) return;

        const temp = newPhases[index];
        newPhases[index] = newPhases[swapIndex];
        newPhases[swapIndex] = temp;

        setLocalPhases(newPhases);

        // Execute updates
        for (let i = 0; i < newPhases.length; i++) {
            await updateProjectPhase({ ...newPhases[i], orderIndex: i });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#192631]/40 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-[#1a1a1a] w-full max-w-lg rounded-3xl border border-[#192631]/10 shadow-2xl p-8 relative">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-black text-[#192631] tracking-tight">Project Phases Config</h3>
                    <button onClick={onClose} className="p-2 text-[#192631]/60 hover:text-[#192631] hover:bg-[#192631]/[0.05] rounded-full transition-all">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="space-y-3 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {localPhases.map((phase, index) => (
                        <div key={phase.id} className="flex items-center gap-3 bg-[#192631]/[0.05] p-3 rounded-2xl border border-[#192631]/10 group">
                            <div className="flex flex-col">
                                <button onClick={() => handlePhaseReorder(index, 'up')} disabled={index === 0} className="text-slate-600 hover:text-[#192631] disabled:opacity-30">
                                    <ChevronUp className="w-4 h-4" />
                                </button>
                                <button onClick={() => handlePhaseReorder(index, 'down')} disabled={index === localPhases.length - 1} className="text-slate-600 hover:text-[#192631] disabled:opacity-30">
                                    <ChevronDown className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={phase.name}
                                    onChange={(e) => handleLocalNameChange(phase.id, e.target.value)}
                                    onBlur={() => handleNameBlur(phase)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleNameBlur(phase)}
                                    className="w-full bg-transparent border-none text-sm font-semibold text-[#192631] focus:ring-1 focus:ring-orange-500/50 rounded-lg px-2 py-1"
                                />
                            </div>
                            <button onClick={async () => await deleteProjectPhase(phase.id)} className="p-2 text-slate-600 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-all">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                    {localPhases.length === 0 && <p className="text-sm text-[#192631]/60 py-4 text-center">No phases defined. Please add some.</p>}
                </div>

                <div className="flex gap-3 pt-4 border-t border-[#192631]/10">
                    <input
                        type="text"
                        placeholder="New phase name..."
                        value={newPhaseName}
                        onChange={(e) => setNewPhaseName(e.target.value)}
                        className="flex-1 bg-[#192631]/[0.05] border border-[#192631]/10 rounded-xl px-4 py-3 text-[#192631] font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddPhase()}
                    />
                    <button onClick={handleAddPhase} className="bg-orange-600 hover:bg-orange-500 text-white px-6 py-3 rounded-xl font-bold uppercase text-xs tracking-widest transition-all">
                        Add
                    </button>
                </div>
            </div>
        </div>
    );
};

export const Projects: React.FC = () => {
    const navigate = useNavigate();
    const { role, engineerId } = useAuth();
    const { activeProjectCode, setActiveProjectCode, activeProject } = useWorkflow();
    const { projects, projectPhases, engineers, milestones, entries, addProject, updateProject, deleteProject, addMilestone, addTask, updateProjectOrder, addProjectPhase, updateProjectPhase, deleteProjectPhase, addNotification } = useData();
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isManagingPhases, setIsManagingPhases] = useState(false);
    const [portfolioFilter, setPortfolioFilter] = useState<'all' | 'turnkey' | 'milestones'>('all');

    // Filter projects based on visibility
    const filteredProjects = projects.filter(p => {
        if (role === 'admin') return true;
        if (p.leadDesignerId === engineerId) return true;
        if (p.teamMembers?.includes(engineerId || '')) return true;
        return false;
    });

    const [draggedProjects, setDraggedProjects] = useState<Project[] | null>(null);
    const [draggedProjectIndex, setDraggedProjectIndex] = useState<number | null>(null);
    const orderedProjects = draggedProjects || filteredProjects;

    // Form State
    const [name, setName] = useState('');
    const [hourlyRate, setHourlyRate] = useState('');
    const [budget, setBudget] = useState('');
    const [phase, setPhase] = useState('');
    const [leadDesignerId, setLeadDesignerId] = useState('');
    const [teamMembers, setTeamMembers] = useState<string[]>([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [googleDriveLink, setGoogleDriveLink] = useState('');

    // Phase milestones (inline creation)
    const [phaseMilestones, setPhaseMilestones] = useState<Record<string, string>>({});
    const [applyDecWorkflow, setApplyDecWorkflow] = useState(false);

    const currentPhase = phase || projectPhases[0]?.name || 'Planning';

    const toggleTeamMember = (id: string) => {
        setTeamMembers(prev =>
            prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        const projectId = editingId || crypto.randomUUID();

        const existingProject = editingId ? projects.find(p => p.id === editingId) : null;

        const projectData: Project = {
            id: projectId,
            name,
            hourlyRate: hourlyRate ? parseFloat(hourlyRate) : undefined,
            budget: budget ? parseFloat(budget) : 0,
            phase: currentPhase,
            leadDesignerId: leadDesignerId || undefined,
            teamMembers,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
            googleDriveLink: googleDriveLink || undefined,
            orderIndex: existingProject?.orderIndex ?? projects.length, // Preserve order or set to bottom
        };

        if (editingId) {
            await updateProject(projectData);
        } else {
            await addProject(projectData);

            if (applyDecWorkflow) {
                // Generate milestones and tasks from DEC template
                for (const phaseTpl of decWorkflowTemplate) {
                    const milestoneId = crypto.randomUUID();
                    await addMilestone({
                        id: milestoneId,
                        projectId,
                        name: phaseTpl.name,
                        targetDate: phaseMilestones[phaseTpl.name] || undefined,
                        completedPercentage: 0,
                    });

                    for (const taskName of phaseTpl.tasks) {
                        await addTask({
                            id: crypto.randomUUID(),
                            projectId,
                            milestoneId,
                            title: taskName,
                            status: 'not_started',
                        });
                    }
                }
            } else {
                // Create milestones for each phase that has a deadline
                for (const [phaseName, deadline] of Object.entries(phaseMilestones)) {
                    if (deadline) {
                        await addMilestone({
                            id: crypto.randomUUID(),
                            projectId,
                            name: `${phaseName} Phase`,
                            targetDate: deadline,
                            completedPercentage: 0,
                        });
                    }
                }
            }
        }

        resetForm();
    };

    const startEdit = (project: Project) => {
        setEditingId(project.id);
        setName(project.name);
        setHourlyRate(project.hourlyRate?.toString() || '');
        setBudget(project.budget?.toString() || '');
        setPhase(project.phase || projectPhases[0]?.name || 'Planning');
        setLeadDesignerId(project.leadDesignerId || '');
        setTeamMembers(project.teamMembers || []);
        setStartDate(project.startDate || '');
        setEndDate(project.endDate || '');
        setGoogleDriveLink(project.googleDriveLink || '');
        setPhaseMilestones({});
        setIsAdding(true);
    };

    const resetForm = () => {
        setIsAdding(false);
        setEditingId(null);
        setName('');
        setHourlyRate('');
        setBudget('');
        setPhase(projectPhases[0]?.name || 'Planning');
        setLeadDesignerId('');
        setTeamMembers([]);
        setStartDate('');
        setEndDate('');
        setGoogleDriveLink('');
        setPhaseMilestones({});
        setApplyDecWorkflow(false);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this project?')) {
            deleteProject(id);
        }
    };

    // --- Drag and Drop Logic ---
    const handleDragStart = (index: number) => {
        if (role !== 'admin') return;
        setDraggedProjects([...filteredProjects]);
        setDraggedProjectIndex(index);
    };

    const handleDragEnter = (index: number) => {
        if (role !== 'admin' || draggedProjectIndex === null || draggedProjectIndex === index) return;

        // Ensure index is within the orderedProjects valid bounds
        if (index < 0 || index >= orderedProjects.length) return;

        setDraggedProjects(prev => {
            if (!prev) return prev;
            const newProjects = [...prev];
            const draggedItem = newProjects[draggedProjectIndex];
            newProjects.splice(draggedProjectIndex, 1);
            newProjects.splice(index, 0, draggedItem);
            setDraggedProjectIndex(index);
            return newProjects;
        });
    };

    const handleDragEnd = async () => {
        if (role !== 'admin' || !draggedProjects) return;
        setDraggedProjectIndex(null);

        const finalOrder = [...draggedProjects];
        setDraggedProjects(null); // Revert to using derived filteredProjects

        await updateProjectOrder(finalOrder);
    };

    // --- Phase Management Logic handled in Component ---

    // Compute duration string
    const getDuration = (start?: string, end?: string) => {
        if (!start || !end) return null;
        const ms = new Date(end).getTime() - new Date(start).getTime();
        const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
        if (days < 30) return `${days} days`;
        const months = Math.round(days / 30);
        return `${months} month${months > 1 ? 's' : ''}`;
    };

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
                        Project <span className="text-[#e04b2a]">Library</span>
                    </h2>
                    <div className="h-1 w-20 bg-orange-500 rounded-full mb-4"></div>
                    <p className="text-[#192631]/60 font-medium tracking-wide">Manage and monitor active DEC engineering ventures.</p>
                </div>
                {role === 'admin' && (
                    <div className="flex gap-4">
                        <button
                            onClick={() => setIsManagingPhases(true)}
                            className="flex items-center justify-center space-x-2 bg-[#192631]/[0.05] hover:bg-[#192631]/[0.05] text-[#192631] px-6 py-4 rounded-2xl border border-[#192631]/10 transition-all text-xs font-bold uppercase tracking-widest"
                        >
                            <Settings className="w-4 h-4" />
                            <span>Manage Phases</span>
                        </button>
                        <button
                            onClick={() => setIsAdding(true)}
                            disabled={isAdding}
                            className="flex items-center justify-center space-x-3 bg-orange-600 hover:bg-orange-500 text-white px-8 py-4 rounded-2xl transition-all duration-300 shadow-xl shadow-orange-600/20 hover:shadow-orange-600/40 hover:-translate-y-1 disabled:opacity-50 font-bold uppercase tracking-widest text-[11px]"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Initiate Project</span>
                        </button>
                    </div>
                )}
            </div>

            <SystemHint>
                <p><strong>Projects:</strong> Every engineering project lives here. You can assign Lead Designers, define budgets in AED, and allocate team members.</p>
                <p><strong>Workflow:</strong> Projects are structured into Phases (e.g., Concept, Schematic). When instantiating a new project, you can toggle the 'DEC Architectural Workflow Template' to auto-populate standard phases and sequential tasks under the hood.</p>
                <p><em>Pro Tip: Admin users can drag and drop project cards to reorder them via the grip icon.</em></p>
            </SystemHint>

            {/* PHASE MANAGEMENT MODAL */}
            {isManagingPhases && (
                <PhaseConfigModal
                    onClose={() => setIsManagingPhases(false)}
                    projectPhases={projectPhases}
                    addProjectPhase={addProjectPhase}
                    updateProjectPhase={updateProjectPhase}
                    deleteProjectPhase={deleteProjectPhase}
                />
            )}

            {isAdding && (
                <div className="bg-[#1a1a1a]/60 p-10 rounded-[32px] border border-[#192631]/10 backdrop-blur-3xl shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-500 via-purple-500 to-orange-500"></div>
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-xl font-black text-[#192631] tracking-tight">
                                {editingId ? 'Refine Project Details' : 'Configure New Venture'}
                            </h3>
                            <p className="text-[#192631]/60 text-xs font-bold uppercase tracking-widest mt-1">Strategic Planning</p>
                        </div>
                        <button onClick={resetForm} className="p-2 text-[#192631]/60 hover:text-[#192631] hover:bg-[#192631]/[0.05] rounded-full transition-all">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Row 1: Name + Budget */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="flex items-center justify-between text-[11px] font-bold text-[#192631]/60 uppercase tracking-[0.2em] ml-1">
                                    <span>Project Identity</span>
                                    {name.trim().length > 3 && (
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                // Historical Project Autopsy (AI Estimator)

                                                // 1. Find similar past projects based on keywords in the name
                                                const keywords = name.toLowerCase().split(/\s+/).filter(w => w.length > 2);
                                                const similarProjects = projects.filter(p => {
                                                    if (p.id === editingId) return false;
                                                    const pName = p.name.toLowerCase();
                                                    return keywords.some(kw => pName.includes(kw));
                                                });

                                                if (similarProjects.length === 0) {
                                                    alert("No sufficient historical data found for similar projects.");
                                                    return;
                                                }

                                                // 2. Average the data
                                                let totalBudget = 0;
                                                let totalRate = 0;
                                                let projectsWithBudget = 0;
                                                let projectsWithRate = 0;

                                                const phaseCounts: Record<string, number> = {};

                                                similarProjects.forEach(p => {
                                                    if (p.budget) {
                                                        totalBudget += p.budget;
                                                        projectsWithBudget++;
                                                    }
                                                    if (p.hourlyRate) {
                                                        totalRate += p.hourlyRate;
                                                        projectsWithRate++;
                                                    }
                                                    if (p.phase) {
                                                        phaseCounts[p.phase] = (phaseCounts[p.phase] || 0) + 1;
                                                    }
                                                });

                                                const avgBudget = projectsWithBudget > 0 ? Math.round(totalBudget / projectsWithBudget) : 0;
                                                const avgRate = projectsWithRate > 0 ? Math.round(totalRate / projectsWithRate) : 0;

                                                // Most common phase
                                                let mostCommonPhase = projectPhases[0]?.name || 'Planning';
                                                let maxPhaseCount = 0;
                                                for (const [ph, count] of Object.entries(phaseCounts)) {
                                                    if (count > maxPhaseCount) {
                                                        maxPhaseCount = count;
                                                        mostCommonPhase = ph;
                                                    }
                                                }

                                                // 3. Auto-fill the form
                                                if (avgBudget > 0) setBudget(avgBudget.toString());
                                                if (avgRate > 0) setHourlyRate(avgRate.toString());
                                                setPhase(mostCommonPhase);

                                                addNotification({
                                                    id: crypto.randomUUID(),
                                                    engineerId: engineerId || '',
                                                    message: `AI Estimator applied historical averages from ${similarProjects.length} similar project(s).`,
                                                    isRead: false
                                                });

                                            }}
                                            className="text-[#e04b2a] hover:text-[#e04b2a] transition-colors flex items-center gap-1 bg-[#e04b2a]/10 px-2 py-0.5 rounded border border-[#e04b2a]/25"
                                        >
                                            <RefreshCw className="w-3 h-3" />
                                            AI Estimate
                                        </button>
                                    )}
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-5 py-4 bg-[#192631]/[0.05] border border-[#192631]/10 rounded-2xl text-[#192631] placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:bg-[#192631]/[0.05] transition-all font-medium"
                                    placeholder="e.g. Al Reem Tower Redesign"
                                    autoFocus
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-[11px] font-bold text-[#192631]/60 uppercase tracking-[0.2em] ml-1">Total Budget (AED)</label>
                                <input
                                    type="number"
                                    value={budget}
                                    onChange={(e) => setBudget(e.target.value)}
                                    className="w-full px-5 py-4 bg-[#192631]/[0.05] border border-[#192631]/10 rounded-2xl text-[#192631] placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:bg-[#192631]/[0.05] transition-all font-medium"
                                    placeholder="50000.00"
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                        </div>

                        {/* Row 2: Hourly Rate + Phase + Lead Designer */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="space-y-2">
                                <label className="block text-[11px] font-bold text-[#192631]/60 uppercase tracking-[0.2em] ml-1">Hourly Rate (USD)</label>
                                <input
                                    type="number"
                                    value={hourlyRate}
                                    onChange={(e) => setHourlyRate(e.target.value)}
                                    className="w-full px-5 py-4 bg-[#192631]/[0.05] border border-[#192631]/10 rounded-2xl text-[#192631] placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:bg-[#192631]/[0.05] transition-all font-medium"
                                    placeholder="85.00"
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-[11px] font-bold text-[#192631]/60 uppercase tracking-[0.2em] ml-1">Current Phase</label>
                                <select
                                    value={phase}
                                    onChange={(e) => setPhase(e.target.value)}
                                    className="w-full px-5 py-4 bg-[#192631]/[0.05] border border-[#192631]/10 rounded-2xl text-[#192631] placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:bg-[#192631]/[0.05] transition-all font-medium appearance-none"
                                >
                                    {projectPhases.map(p => (
                                        <option key={p.id} value={p.name} className="bg-[#1a1a1a]">{p.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-[11px] font-bold text-[#192631]/60 uppercase tracking-[0.2em] ml-1">Lead Designer</label>
                                <select
                                    value={leadDesignerId}
                                    onChange={(e) => setLeadDesignerId(e.target.value)}
                                    className="w-full px-5 py-4 bg-[#192631]/[0.05] border border-[#192631]/10 rounded-2xl text-[#192631] placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:bg-[#192631]/[0.05] transition-all font-medium appearance-none"
                                >
                                    <option value="" className="bg-[#1a1a1a]">None</option>
                                    {engineers.map(e => (
                                        <option key={e.id} value={e.id} className="bg-[#1a1a1a]">{e.name} ({e.role})</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Row 3: Google Drive + Start Date + End Date */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="space-y-2">
                                <label className="block text-[11px] font-bold text-[#192631]/60 uppercase tracking-[0.2em] ml-1">Google Drive Folder URL</label>
                                <input
                                    type="url"
                                    value={googleDriveLink}
                                    onChange={(e) => setGoogleDriveLink(e.target.value)}
                                    className="w-full px-5 py-4 bg-[#192631]/[0.05] border border-[#192631]/10 rounded-2xl text-[#192631] placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:bg-[#192631]/[0.05] transition-all font-medium"
                                    placeholder="https://drive.google.com/..."
                                />
                            </div>
                            <div className="space-y-2">
                                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest ml-1">Start Date</span>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full px-5 py-4 bg-[#192631]/[0.05] border border-[#192631]/10 rounded-2xl text-[#192631] focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:bg-[#192631]/[0.05] transition-all font-medium"
                                />
                            </div>
                            <div className="space-y-2">
                                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest ml-1">End Date</span>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full px-5 py-4 bg-[#192631]/[0.05] border border-[#192631]/10 rounded-2xl text-[#192631] focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:bg-[#192631]/[0.05] transition-all font-medium"
                                />
                            </div>
                        </div>

                        {/* Row 4: Team Members */}
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-[11px] font-bold text-[#192631]/60 uppercase tracking-[0.2em] ml-1">
                                <Users className="w-3.5 h-3.5 text-[#e04b2a]" />
                                Delegate Team Members
                            </label>
                            <div className="flex flex-wrap gap-3">
                                {engineers.map(eng => {
                                    const isSelected = teamMembers.includes(eng.id);
                                    return (
                                        <button
                                            key={eng.id}
                                            type="button"
                                            onClick={() => toggleTeamMember(eng.id)}
                                            className={`px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all duration-300 border ${isSelected
                                                ? 'bg-[#e04b2a]/10 border-[#e04b2a]/25 text-[#e04b2a] shadow-lg shadow-orange-500/10'
                                                : 'bg-[#192631]/[0.05] border-[#192631]/10 text-[#192631]/60 hover:text-[#192631] hover:border-[#192631]/10'
                                                }`}
                                        >
                                            {eng.name}
                                            <span className="ml-2 text-[9px] text-slate-600">({eng.location || 'HQ'})</span>
                                        </button>
                                    );
                                })}
                            </div>
                            {teamMembers.length > 0 && (
                                <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest ml-1">
                                    {teamMembers.length} member{teamMembers.length > 1 ? 's' : ''} assigned
                                </div>
                            )}
                        </div>

                        {/* Row 5: Phase Milestones (only for new projects) */}
                        {!editingId && projectPhases.length > 0 && (
                            <div className="space-y-3 border-t border-[#192631]/10 pt-6">
                                <label className="flex items-center gap-3 cursor-pointer group mb-6">
                                    <div className="relative flex items-center justify-center">
                                        <input
                                            type="checkbox"
                                            checked={applyDecWorkflow}
                                            onChange={(e) => setApplyDecWorkflow(e.target.checked)}
                                            className="sr-only"
                                        />
                                        <div className={`w-5 h-5 rounded border transition-all ${applyDecWorkflow ? 'bg-orange-500 border-orange-500' : 'bg-[#192631]/[0.05] border-[#192631]/10 group-hover:border-white/50'}`}>
                                            {applyDecWorkflow && <Check className="w-3.5 h-3.5 text-[#192631] absolute top-0.5 left-0.5" />}
                                        </div>
                                    </div>
                                    <span className="text-[11px] font-bold text-[#192631]/70 uppercase tracking-[0.1em] group-hover:text-[#192631] transition-colors">
                                        Apply DEC Architectural Workflow Template (Auto-generate phases & tasks)
                                    </span>
                                </label>

                                <label className="flex items-center gap-2 text-[11px] font-bold text-[#192631]/60 uppercase tracking-[0.2em] ml-1">
                                    <Target className="w-3.5 h-3.5 text-[#e04b2a]" />
                                    Phase Milestones — Set Deadlines
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {(applyDecWorkflow ? decWorkflowTemplate.map(p => ({ id: p.name, name: p.name })) : projectPhases).map(p => (
                                        <div key={p.id} className="flex items-center gap-3 bg-[#192631]/[0.05] p-4 rounded-2xl border border-[#192631]/10">
                                            <div className="flex-1">
                                                <div className="text-[10px] font-bold text-[#192631] tracking-tight mb-2 truncate leading-relaxed" title={p.name}>{p.name}</div>
                                                <input
                                                    type="date"
                                                    value={phaseMilestones[p.name] || ''}
                                                    onChange={(e) => setPhaseMilestones(prev => ({ ...prev, [p.name]: e.target.value }))}
                                                    className="w-full px-3 py-2 bg-[#192631]/[0.05] border border-[#192631]/10 rounded-xl text-[#192631] text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end space-x-4 pt-4 border-t border-[#192631]/10">
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-8 py-4 text-[#192631]/60 hover:text-[#192631] font-bold uppercase tracking-widest text-[11px] transition-all"
                            >
                                Discard
                            </button>
                            <button
                                type="submit"
                                className="px-10 py-4 bg-white text-black hover:bg-orange-500 hover:text-white rounded-2xl transition-all duration-300 flex items-center space-x-3 shadow-xl font-bold uppercase tracking-widest text-[11px]"
                            >
                                <Check className="w-4 h-4" />
                                <span>{editingId ? 'Update Identity' : 'Establish Project'}</span>
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {orderedProjects.length === 0 && !isAdding && (
                    <div className="col-span-full text-center py-32 bg-[#1a1a1a]/20 rounded-[40px] border-2 border-dashed border-[#192631]/10 flex flex-col items-center justify-center">
                        <div className="w-20 h-20 bg-[#192631]/[0.05] rounded-full flex items-center justify-center mb-6">
                            <Folder className="w-10 h-10 text-slate-700" />
                        </div>
                        <p className="text-[#192631]/70 font-black text-xl tracking-tight mb-2">The library is empty</p>
                        <p className="text-slate-600 text-sm font-bold uppercase tracking-widest">Awaiting first venture initiation</p>
                    </div>
                )}

                {orderedProjects.map((project, index) => {
                    const projectMilestones = milestones.filter(m => m.projectId === project.id);
                    const teamCount = project.teamMembers?.length || 0;
                    const duration = getDuration(project.startDate, project.endDate);

                    return (
                        <div
                            key={project.id}
                            draggable={role === 'admin'}
                            onDragStart={() => handleDragStart(index)}
                            onDragEnter={() => handleDragEnter(index)}
                            onDragEnd={handleDragEnd}
                            onDragOver={(e) => e.preventDefault()}
                            className={`group bg-[#1a1a1a]/40 p-8 rounded-[40px] border border-white/5 hover:border-orange-500/30 backdrop-blur-3xl shadow-2xl transition-all duration-300 ${draggedProjectIndex === index ? 'opacity-40 scale-95' : 'opacity-100'} hover:-translate-y-2 relative overflow-hidden ${role === 'admin' ? 'cursor-grab active:cursor-grabbing' : ''}`}
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-[60px] rounded-full -mr-16 -mt-16 group-hover:bg-[#e04b2a]/10 transition-all duration-500"></div>
                            <div className="flex justify-between items-start mb-6 relative z-10">
                                <div className="w-14 h-14 bg-[#192631]/[0.05] text-white rounded-2xl flex items-center justify-center border border-[#192631]/10 group-hover:bg-orange-500 group-hover:text-white group-hover:border-orange-500 transition-all duration-500 shadow-lg">
                                    <Folder className="w-6 h-6" />
                                </div>
                                {role === 'admin' && (
                                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
                                        <div className="p-2.5 text-slate-700 cursor-grab" title="Drag to reorder">
                                            <GripVertical className="w-4 h-4" />
                                        </div>
                                        <button
                                            onClick={() => startEdit(project)}
                                            className="p-2.5 text-[#192631]/60 hover:text-[#192631] hover:bg-[#192631]/[0.05] rounded-xl transition-all"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(project.id)}
                                            className="p-2.5 text-[#192631]/60 hover:text-red-700 hover:bg-red-400/10 rounded-xl transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="relative z-10 pointer-events-none">
                                <h3 className="font-black text-xl text-[#192631] mb-2 tracking-tight group-hover:text-[#e04b2a] transition-colors">{project.name}</h3>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="h-0.5 w-8 bg-orange-500/30 group-hover:w-12 transition-all duration-500"></div>
                                    {project.hourlyRate ? (
                                        <p className="text-[#192631]/60 text-xs font-bold uppercase tracking-widest">
                                            <span className="text-[#192631]">${project.hourlyRate.toFixed(0)}</span> / Hour
                                        </p>
                                    ) : (
                                        <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest">Rate not set</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    {project.budget !== undefined && project.budget > 0 && (
                                        <div>
                                            <p className="text-[#192631]/60 text-[10px] font-bold uppercase tracking-widest mb-1">Budget</p>
                                            <p className="text-lg font-black text-[#123524]">AED {project.budget.toLocaleString()}</p>
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-[#192631]/60 text-[10px] font-bold uppercase tracking-widest mb-1">Phase</p>
                                        <div className="inline-block px-3 py-1 rounded-full bg-[#e04b2a]/10 border border-[#e04b2a]/25 text-[#e04b2a] text-xs font-bold tracking-widest uppercase">
                                            {project.phase || 'Planning'}
                                        </div>
                                    </div>
                                </div>

                                {/* Team + Duration row */}
                                <div className="flex items-center gap-4 mb-4 flex-wrap">
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#192631]/[0.05] border border-[#192631]/10">
                                        <Users className="w-3 h-3 text-[#e04b2a]" />
                                        <span className="text-[10px] font-black text-[#192631]/70 uppercase tracking-widest">
                                            {teamCount > 0 ? `${teamCount} Member${teamCount > 1 ? 's' : ''}` : 'No Team'}
                                        </span>
                                    </div>
                                    {duration && (
                                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#192631]/[0.05] border border-[#192631]/10">
                                            <Calendar className="w-3 h-3 text-[#e04b2a]" />
                                            <span className="text-[10px] font-black text-[#192631]/70 uppercase tracking-widest">{duration}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Milestones preview */}
                                {projectMilestones.length > 0 && (
                                    <div className="mb-6 space-y-2">
                                        <p className="text-[#192631]/60 text-[10px] font-bold uppercase tracking-widest mb-2">Milestones</p>
                                        {projectMilestones.slice(0, 3).map(m => (
                                            <div key={m.id} className="space-y-2">
                                                <div className="flex items-center justify-between bg-[#192631]/[0.05] px-3 py-2 rounded-xl border border-[#192631]/10">
                                                    <span className="text-xs font-bold text-[#192631] truncate" title={m.name}>{m.name}</span>
                                                    <span className="text-[10px] text-[#192631]/60 font-mono shrink-0">{m.targetDate || '-'}</span>
                                                </div>
                                                <RiskIndicator milestone={m} entries={entries} />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="mb-4">
                                    <p className="text-[#192631]/60 text-[10px] font-bold uppercase tracking-widest mb-1">Lead Designer</p>
                                    <div className="inline-block px-3 py-1 rounded-full bg-[#192631]/[0.05] border border-[#192631]/10 text-[#192631] text-xs font-bold tracking-widest uppercase">
                                        {engineers.find(e => e.id === project.leadDesignerId)?.name || 'Unassigned'}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-4 gap-1.5 relative z-20 pointer-events-auto mt-3 pt-3 border-t border-[#192631]/10">
                                <button
                                    type="button"
                                    onClick={() => navigate('/extracts')}
                                    className="py-2 px-2 rounded-xl bg-[#192631]/[0.05] hover:bg-[#e04b2a]/10 text-[#192631] hover:text-[#e04b2a] text-[10px] font-bold flex items-center justify-center gap-1 transition-all"
                                >
                                    <Receipt className="w-3 h-3" /> Extracts
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigate('/boq')}
                                    className="py-2 px-2 rounded-xl bg-[#192631]/[0.05] hover:bg-[#e04b2a]/10 text-[#192631] hover:text-[#e04b2a] text-[10px] font-bold flex items-center justify-center gap-1 transition-all"
                                >
                                    <Calculator className="w-3 h-3" /> R02 BOQ
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigate('/submittals')}
                                    className="py-2 px-2 rounded-xl bg-[#192631]/[0.05] hover:bg-[#e04b2a]/10 text-[#192631] hover:text-[#e04b2a] text-[10px] font-bold flex items-center justify-center gap-1 transition-all"
                                >
                                    <FileCheck2 className="w-3 h-3" /> Submittals
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigate('/procurement')}
                                    className="py-2 px-2 rounded-xl bg-[#192631]/[0.05] hover:bg-[#e04b2a]/10 text-[#192631] hover:text-[#e04b2a] text-[10px] font-bold flex items-center justify-center gap-1 transition-all"
                                >
                                    <PackageCheck className="w-3 h-3" /> POs
                                </button>
                            </div>

                            <div className="flex gap-3 relative z-20 pointer-events-auto mt-3">
                                <button
                                    onClick={() => navigate(`/projects/${project.id}`)}
                                    className="flex-[2] py-3.5 text-[11px] font-black uppercase tracking-[0.16em] text-white bg-[#192631] hover:bg-[#e04b2a] rounded-2xl transition-all duration-300 shadow-md"
                                >
                                    Inspect Venture & Tasks
                                </button>
                                {role === 'admin' && (
                                    <button
                                        onClick={async (e) => {
                                            const btn = e.currentTarget;
                                            btn.classList.add('animate-spin-slow');
                                            await new Promise(r => setTimeout(r, 1000));
                                            btn.classList.remove('animate-spin-slow');
                                        }}
                                        title="Sync with Zoho CRM"
                                        className="w-12 h-12 bg-[#192631]/[0.05] hover:bg-[#192631]/10 text-[#192631]/60 hover:text-[#192631] rounded-2xl border border-[#192631]/10 transition-all flex items-center justify-center shrink-0"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Active Turnkey Contracting Portfolio Section (C096, C063, C091, etc.) */}
            {portfolioFilter !== 'milestones' && (
                <div className="space-y-5 pt-4">
                    {/* Pinned Active Project Workflow Bar */}
                    <div className="bg-gradient-to-r from-[#192631] via-[#1f303e] to-[#192631] text-white p-6 rounded-3xl border border-[#e04b2a]/40 shadow-xl space-y-4">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div className="space-y-1">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e04b2a]/20 border border-[#e04b2a]/40 text-[#ff8b70] text-[10px] font-black uppercase tracking-widest">
                                    <span>📌 Pinned Active Project Workflow Bar</span>
                                    <span>·</span>
                                    <span>شريط سير عمل المشروع النشط المثبت</span>
                                </div>
                                <div className="flex flex-wrap items-center gap-3 pt-1">
                                    <span className="px-3 py-1 rounded-xl bg-[#e04b2a] text-white font-mono text-sm font-black shadow-sm">
                                        {activeProjectCode}
                                    </span>
                                    <h4 className="text-lg md:text-xl font-black text-white tracking-tight">
                                        {activeProjectCode === 'ALL'
                                            ? 'All 77 Actpert Portfolio Projects (Global View)'
                                            : `${activeProject?.name || activeProjectCode} — ${activeProject?.clientName || ''}`}
                                    </h4>
                                    {activeProject && activeProjectCode !== 'ALL' && (
                                        <span className="text-xs font-bold text-white/70 bg-white/10 px-3 py-1 rounded-full">
                                            {activeProject.location} · Completion: {activeProject.completionPercent}%
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 self-start lg:self-auto">
                                <select
                                    value={activeProjectCode}
                                    onChange={(e) => setActiveProjectCode(e.target.value)}
                                    aria-label="Select Active Project"
                                    className="bg-white/10 hover:bg-white/15 text-white text-xs font-bold rounded-xl px-3.5 py-2.5 border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#e04b2a]"
                                >
                                    <option value="ALL" className="bg-[#192631] text-white">ALL — All 77 Projects</option>
                                    {NEXUS_LIVE_PROJECTS.map(p => (
                                        <option key={p.code} value={p.code} className="bg-[#192631] text-white">
                                            {p.code} — {p.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-2 border-t border-white/10">
                            {NEXUS_LIFECYCLE_STAGES.map((stage) => {
                                const stepShortLabels: Record<number, string> = {
                                    1: '1. BOQ',
                                    2: '2. Submittals',
                                    3: '3. Buy & Stores',
                                    4: '4. Subcontractors',
                                    5: '5. Extracts',
                                    6: '6. Treasury',
                                };
                                const label = stepShortLabels[stage.stepNumber] || `${stage.stepNumber}. ${stage.titleEn}`;
                                return (
                                    <button
                                        key={stage.id}
                                        type="button"
                                        onClick={() => navigate(stage.path)}
                                        className="group flex flex-col justify-between p-3 rounded-2xl bg-white/[0.07] hover:bg-[#e04b2a] border border-white/10 hover:border-[#e04b2a] text-left transition-all shadow-sm hover:-translate-y-0.5"
                                    >
                                        <div className="flex items-center justify-between gap-1 w-full mb-1.5">
                                            <span className="text-xs font-black text-white tracking-tight">
                                                {label}
                                            </span>
                                            <span className="px-1.5 py-0.5 rounded-md bg-white/15 group-hover:bg-white/25 text-[10px] font-mono font-black text-white">
                                                {stage.badge}
                                            </span>
                                        </div>
                                        <div className="text-[11px] font-bold text-white/75 group-hover:text-white truncate">
                                            {stage.titleAr}
                                        </div>
                                        <div className="text-[9px] font-semibold text-white/50 group-hover:text-white/90 truncate mt-0.5">
                                            {stage.ownerRoleEn}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/80 backdrop-blur-xl p-5 rounded-2xl border border-[#192631]/10 shadow-sm">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e04b2a]/10 border border-[#e04b2a]/25 text-[#e04b2a] text-[10px] font-bold uppercase tracking-wider mb-1.5">
                                Live Actpert 77-Project Portfolio · Live Extracts, BOQ, Submittals & Site Custody
                            </div>
                            <h3 className="text-2xl font-black text-[#192631] tracking-tight">
                                Active Contracting <span className="text-[#e04b2a]">Sites & Contracts ({NEXUS_LIVE_PROJECTS.length} Featured / 77 Total)</span>
                            </h3>
                        </div>
                        <div className="flex items-center gap-2 bg-[#192631]/[0.05] p-1.5 rounded-xl border border-[#192631]/10 self-start md:self-auto">
                            <button
                                type="button"
                                onClick={() => setPortfolioFilter('all')}
                                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${portfolioFilter === 'all' ? 'bg-[#e04b2a] text-white shadow-sm' : 'text-[#192631]/70 hover:text-[#192631]'}`}
                            >
                                All Projects
                            </button>
                            <button
                                type="button"
                                onClick={() => setPortfolioFilter('turnkey')}
                                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${portfolioFilter === 'turnkey' ? 'bg-[#e04b2a] text-white shadow-sm' : 'text-[#192631]/70 hover:text-[#192631]'}`}
                            >
                                Contracting Portfolio
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {NEXUS_LIVE_PROJECTS.map(proj => {
                            const isPinned = activeProjectCode === proj.code;
                            return (
                                <div
                                    key={proj.id}
                                    className={`bg-white/80 backdrop-blur-xl rounded-3xl border p-6 shadow-sm transition-all flex flex-col justify-between ${
                                        isPinned
                                            ? 'border-[#e04b2a] ring-2 ring-[#e04b2a]/25 shadow-lg'
                                            : 'border-[#192631]/10 hover:border-[#e04b2a]/40'
                                    }`}
                                >
                                    <div>
                                        <div className="flex items-center justify-between gap-2 mb-3">
                                            <span className="px-3 py-1 rounded-full bg-[#e04b2a]/10 border border-[#e04b2a]/25 text-[#e04b2a] font-mono text-xs font-black">
                                                {proj.code} · Contract #{proj.contractNo}
                                            </span>
                                            <div className="flex items-center gap-1.5">
                                                {isPinned && (
                                                    <span className="px-2.5 py-1 rounded-full bg-[#e04b2a] text-white text-[10px] font-black uppercase tracking-wider">
                                                        📌 Pinned
                                                    </span>
                                                )}
                                                <span className="px-2.5 py-1 rounded-full bg-[#123524]/10 border border-[#123524]/25 text-[#123524] text-[10px] font-bold">
                                                    {proj.status}
                                                </span>
                                            </div>
                                        </div>
                                        <h4 className="text-lg font-black text-[#192631] leading-snug mb-1">
                                            {proj.name}
                                        </h4>
                                        <p className="text-xs text-[#192631]/70 font-medium flex items-center gap-1.5 mb-4">
                                            <MapPin className="w-3.5 h-3.5 text-[#e04b2a]" />
                                            {proj.location} · Client: <strong className="text-[#192631]">{proj.clientName}</strong>
                                        </p>

                                        <div className="grid grid-cols-2 gap-2.5 p-3.5 rounded-2xl bg-[#f5f5f5]/90 border border-[#192631]/10 mb-4">
                                            <div>
                                                <p className="text-[10px] font-bold uppercase text-[#192631]/60">Contract Value</p>
                                                <p className="text-sm font-black text-[#192631]">EGP {proj.contractValue.toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold uppercase text-[#192631]/60">Work Achieved</p>
                                                <p className="text-sm font-black text-[#e04b2a]">EGP {proj.actualWorkAchieved.toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold uppercase text-[#192631]/60">Collected</p>
                                                <p className="text-sm font-black text-[#123524]">EGP {proj.totalCollected.toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold uppercase text-[#192631]/60">Net Balance Due</p>
                                                <p className="text-sm font-black text-[#192631]">EGP {proj.netReceivable.toLocaleString()}</p>
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <div className="flex items-center justify-between text-xs font-bold mb-1">
                                                <span className="text-[#192631]/70">Execution Progress ({proj.extractsCount} Extracts)</span>
                                                <span className="text-[#123524]">{proj.completionPercent}%</span>
                                            </div>
                                            <div className="w-full h-2 rounded-full bg-[#192631]/10 overflow-hidden">
                                                <div
                                                    className="h-full bg-[#e04b2a] rounded-full transition-all"
                                                    style={{ width: `${Math.min(100, proj.completionPercent)}%` }}
                                                />
                                            </div>
                                            <p className="text-[11px] text-[#192631]/65 mt-2">
                                                Site Eng: <strong>{proj.siteEngineer}</strong> · Tech Office: <strong>{proj.leadEngineer}</strong>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-2 pt-3 border-t border-[#192631]/10">
                                        <button
                                            type="button"
                                            onClick={() => setActiveProjectCode(proj.code)}
                                            className={`w-full py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-sm transition-all ${
                                                isPinned
                                                    ? 'bg-[#123524] text-white'
                                                    : 'bg-[#e04b2a]/10 hover:bg-[#e04b2a] text-[#e04b2a] hover:text-white border border-[#e04b2a]/30'
                                            }`}
                                        >
                                            <span>📌 Pin & Open Workflow</span>
                                            <span className="text-[10px] opacity-80">({proj.code})</span>
                                        </button>

                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setActiveProjectCode(proj.code);
                                                    navigate('/extracts');
                                                }}
                                                className="py-2.5 px-3 rounded-xl bg-[#e04b2a] hover:bg-[#c83e1f] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                                            >
                                                <Receipt className="w-3.5 h-3.5" /> Works Extracts
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setActiveProjectCode(proj.code);
                                                    navigate('/boq');
                                                }}
                                                className="py-2.5 px-3 rounded-xl bg-[#192631] hover:bg-[#e04b2a] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                                            >
                                                <Calculator className="w-3.5 h-3.5" /> R02 BOQ & Rates
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setActiveProjectCode(proj.code);
                                                    navigate('/submittals');
                                                }}
                                                className="py-2 px-3 rounded-xl bg-[#192631]/[0.06] hover:bg-[#e04b2a]/10 text-[#192631] hover:text-[#e04b2a] text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                                            >
                                                <FileCheck2 className="w-3.5 h-3.5" /> 51 Submittals
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setActiveProjectCode(proj.code);
                                                    navigate('/procurement');
                                                }}
                                                className="py-2 px-3 rounded-xl bg-[#192631]/[0.06] hover:bg-[#e04b2a]/10 text-[#192631] hover:text-[#e04b2a] text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                                            >
                                                <PackageCheck className="w-3.5 h-3.5" /> POs & Custody
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </motion.div>
    );
};
