import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useTenant } from '../context/TenantContext';
import {
    Search,
    FolderKanban,
    FileSignature,
    Calculator,
    Users,
    Building2,
    ArrowRight,
    Sparkles,
    DollarSign,
} from 'lucide-react';

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
    onOpenProvisioner: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
    isOpen,
    onClose,
    onOpenProvisioner,
}) => {
    const navigate = useNavigate();
    const { projects, engineers } = useData();
    const { organizations, switchOrganization } = useTenant();
    const [query, setQuery] = useState('');

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                if (isOpen) onClose();
            } else if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const q = query.trim().toLowerCase();

    const quickCommands = [
        {
            id: 'cmd-proposals',
            label: 'Open RIBA Stage 1–5 Fee Proposals & 5-Gate VO Shield',
            category: '5-Gate Governance',
            icon: FileSignature,
            action: () => {
                navigate('/proposals');
                onClose();
            },
        },
        {
            id: 'cmd-boq',
            label: 'Open BOQ & Payment Certificates (IPC) Hub',
            category: 'Commercial QS',
            icon: Calculator,
            action: () => {
                navigate('/boq');
                onClose();
            },
        },
        {
            id: 'cmd-provision',
            label: 'White-Label Studio & Multi-Tenant Firm Provisioner',
            category: 'Multi-Tenant SaaS',
            icon: Building2,
            action: () => {
                onClose();
                onOpenProvisioner();
            },
        },
        {
            id: 'cmd-financials',
            label: 'Open Executive Financials & Burn Rate Analytics',
            category: 'Finance',
            icon: DollarSign,
            action: () => {
                navigate('/financials');
                onClose();
            },
        },
    ].filter(c => !q || c.label.toLowerCase().includes(q) || c.category.toLowerCase().includes(q));

    const matchedProjects = projects
        .filter(p => !q || p.name.toLowerCase().includes(q))
        .slice(0, 4);

    const matchedEngineers = engineers
        .filter(e => !q || e.name.toLowerCase().includes(q) || e.role.toLowerCase().includes(q))
        .slice(0, 3);

    return (
        <div
            className="fixed inset-0 z-[100] bg-[#192631]/60 backdrop-blur-sm flex items-start justify-center pt-20 p-4"
            onClick={onClose}
        >
            <div
                className="bg-white border border-[#192631]/15 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-4 border-b border-[#192631]/10 flex items-center gap-3">
                    <Search className="w-5 h-5 text-[#e04b2a]" />
                    <input
                        type="text"
                        autoFocus
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Type a command or search projects, engineers, RIBA proposals, workspaces... (Esc to close)"
                        className="w-full bg-transparent text-sm text-[#192631] placeholder-[#192631]/45 focus:outline-none"
                    />
                    <span className="px-2 py-0.5 rounded bg-[#f5f5f5] border border-[#192631]/10 text-[10px] font-black text-[#192631]/60">
                        ESC
                    </span>
                </div>

                <div className="max-h-[65vh] overflow-y-auto p-3 space-y-4">
                    {quickCommands.length > 0 && (
                        <div>
                            <p className="px-3 py-1 text-[10px] font-black text-[#192631]/55 uppercase tracking-widest">
                                Executive Actions
                            </p>
                            <div className="space-y-1 mt-1">
                                {quickCommands.map(cmd => {
                                    const Icon = cmd.icon;
                                    return (
                                        <button
                                            key={cmd.id}
                                            type="button"
                                            onClick={cmd.action}
                                            className="w-full flex items-center justify-between px-3 py-2.5 rounded-2xl hover:bg-[#e04b2a]/10 text-left group transition-all"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-xl bg-[#f5f5f5] text-[#e04b2a] border border-[#192631]/10">
                                                    <Icon className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-[#192631] group-hover:text-[#e04b2a]">
                                                        {cmd.label}
                                                    </p>
                                                    <p className="text-[10px] text-[#192631]/55">{cmd.category}</p>
                                                </div>
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-[#192631]/40 group-hover:text-[#e04b2a]" />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {matchedProjects.length > 0 && (
                        <div>
                            <p className="px-3 py-1 text-[10px] font-black text-[#192631]/55 uppercase tracking-widest">
                                Engineering Ventures ({matchedProjects.length})
                            </p>
                            <div className="space-y-1 mt-1">
                                {matchedProjects.map(p => (
                                    <button
                                        key={p.id}
                                        type="button"
                                        onClick={() => {
                                            navigate(`/projects/${p.id}`);
                                            onClose();
                                        }}
                                        className="w-full flex items-center justify-between px-3 py-2 rounded-2xl hover:bg-[#192631]/5 text-left"
                                    >
                                        <div className="flex items-center gap-3">
                                            <FolderKanban className="w-4 h-4 text-[#123524]" />
                                            <div>
                                                <p className="text-xs font-bold text-[#192631]">{p.name}</p>
                                                <p className="text-[10px] text-[#192631]/55">
                                                    Phase: {p.phase || 'Concept Design'} · Budget: ${(p.budget || 0).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                        <ArrowRight className="w-3.5 h-3.5 text-[#192631]/40" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {matchedEngineers.length > 0 && (
                        <div>
                            <p className="px-3 py-1 text-[10px] font-black text-[#192631]/55 uppercase tracking-widest">
                                Architects & Operatives
                            </p>
                            <div className="space-y-1 mt-1">
                                {matchedEngineers.map(eng => (
                                    <button
                                        key={eng.id}
                                        type="button"
                                        onClick={() => {
                                            navigate('/engineers');
                                            onClose();
                                        }}
                                        className="w-full flex items-center justify-between px-3 py-2 rounded-2xl hover:bg-[#192631]/5 text-left"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Users className="w-4 h-4 text-[#e04b2a]" />
                                            <div>
                                                <p className="text-xs font-bold text-[#192631]">{eng.name}</p>
                                                <p className="text-[10px] text-[#192631]/55">
                                                    {eng.role} · {eng.location || 'Cairo'}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {organizations.length > 1 && (
                        <div>
                            <p className="px-3 py-1 text-[10px] font-black text-[#192631]/55 uppercase tracking-widest">
                                Switch Tenant Firm Workspace
                            </p>
                            <div className="flex flex-wrap gap-2 px-3 pt-1">
                                {organizations.map(org => (
                                    <button
                                        key={org.id}
                                        type="button"
                                        onClick={() => {
                                            switchOrganization(org.id);
                                            onClose();
                                        }}
                                        className="px-3 py-1.5 rounded-xl bg-[#f5f5f5] hover:bg-[#e04b2a]/10 border border-[#192631]/10 text-xs font-bold text-[#192631] flex items-center gap-2"
                                    >
                                        <Sparkles className="w-3 h-3 text-[#e04b2a]" />
                                        {org.name} ({org.currency})
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
