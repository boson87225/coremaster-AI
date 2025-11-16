
import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Loader2, User, X } from './icons';
import { getCompetitionPrepStream } from '../services/geminiService';
import type { ChatMessage } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { useTranslation } from '../context/LanguageContext';

interface CompetitionPrepCoachProps {
  onClose: () => void;
}

export const CompetitionPrepCoach: React.FC<CompetitionPrepCoachProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      role: 'model', 
      text: t('COMPETITION_PREP_GREETING')
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Update greeting if language changes
  useEffect(() => {
      if (messages.length === 1 && messages[0].role === 'model') {
          setMessages([{ role: 'model', text: t('COMPETITION_PREP_GREETING')}]);
      }
  }, [t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    
    const currentInput = input;
    setInput('');
    setIsLoading(true);
    
    setMessages(prev => [...prev, { role: 'model', text: '' }]);

    try {
      const stream = await getCompetitionPrepStream(messages, currentInput);
      
      for await (const chunk of stream) {
        const chunkText = chunk.text;
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage) {
            lastMessage.text += chunkText;
          }
          return newMessages;
        });
      }
    } catch (err: any) {
      console.error(err);
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage) {
          lastMessage.text = t('AI_COACH_ERROR');
        }
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-6 border border-red-500/20 bg-red-900/20 rounded-xl p-4 animate-fade-in">
        <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-bold text-red-300">{t('COMPETITION_PREP_TITLE')}</h4>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-red-500/20">
                <X size={20} className="text-red-300" />
            </button>
        </div>
      <div className="h-80 flex flex-col bg-slate-800 rounded-lg shadow-inner">
        <div className="flex-grow overflow-y-auto p-4 space-y-4">
            {messages.map((msg, index) => (
            <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                {msg.role === 'model' && (
                <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white flex-shrink-0">
                    <Bot size={20} />
                </div>
                )}
                <div className={`max-w-xs p-3 rounded-2xl ${msg.role === 'user' ? 'bg-indigo-500 text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'}`}>
                {msg.text ? <MarkdownRenderer text={msg.text} /> : <Loader2 className="w-5 h-5 animate-spin text-slate-400" />}
                </div>
                {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white flex-shrink-0">
                    <User size={20} />
                </div>
                )}
            </div>
            ))}
            <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSubmit} className="p-2 border-t border-slate-700 flex items-center space-x-2">
            <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('COMPETITION_PREP_PLACEHOLDER')}
            className="flex-grow p-2 bg-slate-700 border border-slate-600 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-200"
            disabled={isLoading}
            />
            <button type="submit" disabled={isLoading || !input.trim()} className="p-2.5 rounded-full bg-red-600 text-white disabled:bg-slate-600">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
        </form>
      </div>
    </div>
  );
};