
import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Loader2, User, Trash2 } from './icons';
import { getAiCoachResponseStream } from '../services/geminiService';
import type { ChatMessage } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { useTranslation } from '../context/LanguageContext';

interface ChatInterfaceProps {
    systemInstruction: string;
    initialMessage: string;
    sessionKey?: string;
    onClear?: () => void;
    title?: string;
    icon?: React.ReactNode;
    accentColor?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
    initialMessage, 
    sessionKey, 
    onClear,
    title,
    icon,
    accentColor = 'bg-cyan-600'
}) => {
    const { t } = useTranslation();
    const [messages, setMessages] = useState<ChatMessage[]>(() => {
        if (sessionKey) {
            try {
                const stored = sessionStorage.getItem(sessionKey);
                if (stored) return JSON.parse(stored);
            } catch (e) {}
        }
        return [{ role: 'model', text: initialMessage }];
    });
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [apiKeyError, setApiKeyError] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (sessionKey) {
            sessionStorage.setItem(sessionKey, JSON.stringify(messages));
        }
    }, [messages, sessionKey]);

    const handleClear = () => {
        if (sessionKey) sessionStorage.removeItem(sessionKey);
        setMessages([{ role: 'model', text: initialMessage }]);
        if (onClear) onClear();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        setError(null);
        setApiKeyError(false);
        const currentInput = input;
        setMessages(prev => [...prev, { role: 'user', text: currentInput }, { role: 'model', text: '' }]);
        setInput('');
        setIsLoading(true);

        try {
            const stream = await getAiCoachResponseStream(messages, currentInput);
            for await (const chunk of stream) {
                setMessages(prev => {
                    const next = [...prev];
                    const last = next[next.length - 1];
                    if (last) last.text += chunk.text;
                    return next;
                });
            }
        } catch (err: any) {
            const msg = err.toString().toLowerCase();
            if (msg.includes("api key") || msg.includes("permission denied") || msg.includes("authentication") || msg.includes("requested entity was not found")) {
                setApiKeyError(true);
            } else {
                setError(t('AI_COACH_ERROR'));
            }
            setMessages(prev => prev.slice(0, -2));
            setInput(currentInput);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-800/40 rounded-xl overflow-hidden border border-slate-700">
            {title && (
                <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800/60">
                    <div className="flex items-center gap-2 font-bold text-slate-200">
                        {icon} {title}
                    </div>
                    <button onClick={handleClear} className="p-1 text-slate-500 hover:text-red-400 transition-colors">
                        <Trash2 size={18} />
                    </button>
                </div>
            )}
            <div className="flex-grow overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                        {msg.role === 'model' && (
                            <div className={`w-8 h-8 rounded-full ${accentColor} flex items-center justify-center text-white flex-shrink-0`}>
                                <Bot size={20} />
                            </div>
                        )}
                        <div className={`max-w-[85%] p-3 rounded-2xl ${msg.role === 'user' ? 'bg-indigo-500 text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'}`}>
                            {msg.text ? <MarkdownRenderer text={msg.text} /> : <Loader2 className="w-5 h-5 animate-spin text-slate-400" />}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            {apiKeyError && (
                <div className="p-3 bg-red-900/40 text-red-300 text-xs text-center border-t border-red-500/20">
                    {t('API_KEY_MISSING_ERROR_DESC')}
                    <button onClick={() => (window as any).aistudio?.openSelectKey()} className="ml-2 underline font-bold">{t('SET_API_KEY_BUTTON')}</button>
                </div>
            )}
            <form onSubmit={handleSubmit} className="p-3 border-t border-slate-700 bg-slate-900/40 flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder={t('AI_COACH_PLACEHOLDER')}
                    className="flex-grow bg-slate-700 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                    disabled={isLoading}
                />
                <button type="submit" disabled={isLoading || !input.trim()} className={`p-2 rounded-full ${accentColor} text-white shadow-lg disabled:opacity-50`}>
                    <Send size={18} />
                </button>
            </form>
        </div>
    );
};
