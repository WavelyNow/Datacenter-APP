"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, X, Bot, Zap, BarChart3, FileText } from 'lucide-react';
import { cn } from '../lib/utils';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    type?: 'text' | 'action' | 'analysis';
}

const SUGGESTIONS = [
    { icon: Zap, label: "Optimize Hydrauics", prompt: "Analyze current hydraulic loops for efficiency optimizations." },
    { icon: FileText, label: "Draft Summary", prompt: "Generate a technical summary of the current project state." },
    { icon: BarChart3, label: "Cost Est.", prompt: "Provide a quick cost estimation based on active components." },
];

export const AICopilot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', role: 'assistant', content: "Hello! I'm your Engineering Copilot. Accessing project context... Ready to assist with calculations, optimizations, or documentation." }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);

    // Auto-scroll to bottom of messages
    const messagesEndRef = React.useRef<HTMLDivElement>(null);
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSendMessage = (text: string) => {
        if (!text.trim()) return;

        const newUserMsg: Message = { id: crypto.randomUUID(), role: 'user', content: text };
        setMessages(prev => [...prev, newUserMsg]);
        setInputValue("");
        setIsTyping(true);

        // Mock AI Response
        setTimeout(() => {
            const responses = [
                "Processing hydraulic data... I've identified two potential optimizations in the primary loop.",
                "Generating report based on current BIM models. Please wait...",
                "I can help with that. The current expansion vessel sizing seems adequate for the calculated volume.",
                "Scanning project for inconsistencies... All checks passed."
            ];
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];

            const newAiMsg: Message = { id: crypto.randomUUID(), role: 'assistant', content: randomResponse };
            setMessages(prev => [...prev, newAiMsg]);
            setIsTyping(false);
        }, 1500);
    };

    return (
        <>
            {/* Floating Trigger Button */}
            {!isOpen && (
                <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-full shadow-lg shadow-primary/40 border border-primary/50 backdrop-blur-md transition-all hover:shadow-primary/60 group"
                >
                    <div className="relative">
                        <Sparkles className="w-5 h-5 animate-pulse" />
                        <span className="absolute inset-0 animate-ping opacity-75 bg-primary-foreground/50 rounded-full" />
                    </div>
                    <span className="font-semibold text-sm tracking-wide group-hover:block hidden md:block">
                        AI Copilot
                    </span>
                </motion.button>
            )}

            {/* Copilot Interface */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-6 right-6 z-[60] w-[90vw] md:w-[400px] h-[600px] max-h-[80vh] flex flex-col glass-panel-heavy rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5 backdrop-blur-md">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
                                    <Bot className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm text-foreground">Engineering Copilot</h3>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Online</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-white/5 rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Chat Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
                            {messages.map((msg) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={msg.id}
                                    className={cn(
                                        "flex gap-3 max-w-[85%]",
                                        msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
                                    )}
                                >
                                    {/* Avatar */}
                                    <div className={cn(
                                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border",
                                        msg.role === 'assistant'
                                            ? "bg-primary/10 border-primary/20 text-primary"
                                            : "bg-secondary border-white/5 text-foreground"
                                    )}>
                                        {msg.role === 'assistant' ? <Sparkles className="w-4 h-4" /> : <div className="text-xs font-bold">ME</div>}
                                    </div>

                                    {/* Bubble */}
                                    <div className={cn(
                                        "p-3 rounded-2xl text-sm leading-relaxed",
                                        msg.role === 'assistant'
                                            ? "bg-secondary/50 text-foreground border border-white/5 rounded-tl-none"
                                            : "bg-primary text-primary-foreground rounded-tr-none shadow-lg shadow-primary/20"
                                    )}>
                                        {msg.content}
                                    </div>
                                </motion.div>
                            ))}

                            {isTyping && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                                        <Bot className="w-4 h-4 text-primary" />
                                    </div>
                                    <div className="bg-secondary/50 p-3 rounded-2xl rounded-tl-none border border-white/5 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                        <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                        <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce" />
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Quick Actions / Suggestions */}
                        {messages.length < 3 && !isTyping && (
                            <div className="px-4 pb-2">
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-2 ml-1">Suggested Actions</p>
                                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                                    {SUGGESTIONS.map((s, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleSendMessage(s.prompt)}
                                            className="flex items-center gap-2 px-3 py-2 bg-secondary/40 hover:bg-secondary/70 border border-white/5 rounded-xl transition-all whitespace-nowrap text-xs text-secondary-foreground hover:border-primary/20"
                                        >
                                            <s.icon className="w-3.5 h-3.5 opacity-70" />
                                            {s.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Input Area */}
                        <div className="p-4 pt-2 bg-gradient-to-t from-black/20 to-transparent">
                            <div className="relative flex items-center gap-2 p-1.5 bg-input/50 border border-white/5 focus-within:border-primary/30 focus-within:bg-input transition-all rounded-2xl">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
                                    placeholder="Ask anything..."
                                    className="flex-1 bg-transparent border-none outline-none px-3 text-sm text-foreground placeholder-muted-foreground/50 h-9"
                                    disabled={isTyping}
                                />
                                <button
                                    onClick={() => handleSendMessage(inputValue)}
                                    disabled={!inputValue.trim() || isTyping}
                                    className="p-2 bg-primary text-primary-foreground rounded-xl disabled:opacity-50 disabled:grayscale hover:brightness-110 transition-all shadow-lg shadow-primary/20"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="mt-2 flex justify-center">
                                <p className="text-[9px] text-muted-foreground/40 font-mono">Powered by Engineering Suite AI v2.1</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
