import React, { createContext, useContext, useState, useLayoutEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { normalizeBilingualString } from '../utils/bilingualEngine';

type Language = 'en' | 'ar';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const rawTextNodeMap = new WeakMap<Text, string>();
const rawAttrMap = new WeakMap<Element, { placeholder?: string; title?: string }>();
const HAS_ARABIC_RE = /[\u0600-\u06FF]/;

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>(() => {
        try {
            const saved = localStorage.getItem('nexus_erp_lang');
            if (saved === 'ar' || saved === 'en') return saved;
        } catch {
            // ignore storage errors
        }
        return 'en';
    });

    const rootRef = useRef<HTMLDivElement>(null);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        try {
            localStorage.setItem('nexus_erp_lang', lang);
        } catch {
            // ignore
        }
    };

    const toggleLanguage = () => {
        setLanguage(language === 'en' ? 'ar' : 'en');
    };

    useLayoutEffect(() => {
        const dir = language === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.dir = dir;
        document.documentElement.lang = language;
        document.body.dir = dir;

        const root = rootRef.current;
        if (!root) return;

        let isMutating = false;

        const processSubtree = (container: Node) => {
            if (isMutating) return;
            isMutating = true;
            try {
                const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
                let node: Node | null = walker.currentNode;
                while (node) {
                    if (node.nodeType === Node.TEXT_NODE) {
                        const textNode = node as Text;
                        const parentTag = textNode.parentElement?.tagName;
                        if (parentTag !== 'SCRIPT' && parentTag !== 'STYLE' && parentTag !== 'TEXTAREA') {
                            const currentVal = textNode.nodeValue || '';
                            if (currentVal.trim().length > 0) {
                                let raw = rawTextNodeMap.get(textNode);
                                if (raw === undefined) {
                                    raw = currentVal;
                                    rawTextNodeMap.set(textNode, raw);
                                } else {
                                    const prevEn = normalizeBilingualString(raw, 'en');
                                    const prevAr = normalizeBilingualString(raw, 'ar');
                                    if (currentVal !== raw && currentVal !== prevEn && currentVal !== prevAr) {
                                        raw = currentVal;
                                        rawTextNodeMap.set(textNode, raw);
                                    }
                                }
                                const nextVal = normalizeBilingualString(raw, language);
                                if (nextVal !== currentVal) {
                                    textNode.nodeValue = nextVal;
                                }
                                // Ensure proper BiDi isolation when Arabic text appears inside LTR mode
                                const parentEl = textNode.parentElement;
                                if (parentEl && !parentEl.hasAttribute('dir')) {
                                    if (language === 'en' && HAS_ARABIC_RE.test(nextVal) && parentEl.children.length === 0) {
                                        parentEl.setAttribute('dir', 'auto');
                                    } else if (language === 'ar' && parentEl.getAttribute('dir') === 'auto') {
                                        parentEl.removeAttribute('dir');
                                    }
                                }
                            }
                        }
                    } else if (node.nodeType === Node.ELEMENT_NODE) {
                        const el = node as HTMLElement;
                        const savedAttrs = rawAttrMap.get(el) || {};
                        if (el.hasAttribute('placeholder')) {
                            const curP = el.getAttribute('placeholder') || '';
                            if (savedAttrs.placeholder === undefined) {
                                savedAttrs.placeholder = curP;
                                rawAttrMap.set(el, savedAttrs);
                            }
                            const nextP = normalizeBilingualString(savedAttrs.placeholder, language);
                            if (nextP !== curP) el.setAttribute('placeholder', nextP);
                        }
                        if (el.hasAttribute('title')) {
                            const curT = el.getAttribute('title') || '';
                            if (savedAttrs.title === undefined) {
                                savedAttrs.title = curT;
                                rawAttrMap.set(el, savedAttrs);
                            }
                            const nextT = normalizeBilingualString(savedAttrs.title, language);
                            if (nextT !== curT) el.setAttribute('title', nextT);
                        }
                    }
                    node = walker.nextNode();
                }
            } finally {
                isMutating = false;
            }
        };

        processSubtree(root);

        const observer = new MutationObserver((mutations) => {
            if (isMutating) return;
            for (const m of mutations) {
                if (m.type === 'childList') {
                    m.addedNodes.forEach((added) => processSubtree(added));
                } else if (m.type === 'characterData' && m.target) {
                    processSubtree(m.target);
                }
            }
        });

        observer.observe(root, {
            childList: true,
            subtree: true,
            characterData: true,
        });

        return () => observer.disconnect();
    }, [language]);

    return (
        <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage }}>
            <div ref={rootRef} dir={language === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen">
                {children}
            </div>
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

