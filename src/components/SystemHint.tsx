import React, { useState } from 'react';
import { Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const SystemHint = ({ title, children }: { title?: string, children: React.ReactNode }) => {
    const [isVisible, setIsVisible] = useState(true);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div 
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    className="bg-[#e04b2a]/10 border border-[#e04b2a]/25 rounded-2xl p-4 relative group"
                >
                    <button 
                        onClick={() => setIsVisible(false)}
                        className="absolute top-2 right-2 p-1.5 text-[#e04b2a]/50 hover:text-[#e04b2a] bg-white/0 hover:bg-[#192631]/[0.05] rounded-lg transition-all"
                    >
                        <X className="w-4 h-4" />
                    </button>
                    <div className="flex gap-3">
                        <div className="mt-0.5 text-[#e04b2a] flex-shrink-0">
                            <Info className="w-5 h-5" />
                        </div>
                        <div className="pr-6">
                            <h4 className="text-sm font-black text-[#e04b2a] uppercase tracking-widest mb-1.5">
                                {title || "How System Works"}
                            </h4>
                            <div className="text-xs text-[#192631]/80 leading-relaxed font-medium space-y-1">
                                {children}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
