import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Loader2, User, BrainCircuit, Trash2 } from './icons';
import { getAiCoachResponseStream } from '../services/geminiService';
import type { ChatMessage } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { useTranslation } from '../context/LanguageContext';

const CHAT_SESSION_KEY = 'ai_coach_chat_session';

const getInitialMessages = (t: (key: string) => string): ChatMessage[] => {
  try {
    const storedMessages = sessionStorage.getItem(CHAT_SESSION_KEY);
    if (storedMessages) {
      return JSON.parse(storedMessages);
    }
  } catch (error) {
    console.error("Could not parse chat session from sessionStorage", error);
    sessionStorage.removeItem(CHAT_SESSION_KEY);
  }
  return [{ 
    role: 'model', 
    text: t('AI_COACH_GREETING')
  }];
};


export const AiCoachPage: React.FC = () => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>(() => getInitialMessages(t));
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [apiKeyError, setApiKeyError] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    try {
      sessionStorage.setItem(CHAT_SESSION_KEY, JSON.stringify(messages));
    } catch (error) {
      console.error("Could not save chat session to sessionStorage", error);
    }
  }, [messages]);
  
  // Update initial message if language changes and it's the only message
  useEffect(() => {
      setMessages(prev => {
          if (prev.length === 1 && prev[0].role === 'model') {
              return [{ role: 'model', text: t('AI_COACH_GREETING') }];
          }
          return prev;
      });
  }, [t]);


  const handleClearChat = () => {
    sessionStorage.removeItem(CHAT_SESSION_KEY);
    setMessages(getInitialMessages(t));
  };

  const handleSetApiKey = async () => {
    if ((window as any).aistudio && (window as any).aistudio.openSelectKey) {
        await (window as any).aistudio.openSelectKey();
        setApiKeyError(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    setError(null);
    setApiKeyError(false);
    
    const currentInput = input;
    const userMessage: ChatMessage = { role: 'user', text: currentInput };
    setMessages(prev => [...prev, userMessage]);
    
    setIsLoading(true);
    
    // Add a placeholder for the model's response
    setMessages(prev => [...prev, { role: 'model', text: '' }]);

    try {
      const stream = await getAiCoachResponseStream(messages, currentInput);
      
      // Clear input only on successful API call
      setInput(''); 

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
      const errorMessage = err.toString().toLowerCase();
      if (errorMessage.includes("api key") || errorMessage.includes("permission denied") || errorMessage.includes("authentication") || errorMessage.includes("requested entity was not found")) {
          setApiKeyError(true);
      } else {
        setError(t('AI_COACH_ERROR'));
      }
      console.error(err);
      // Remove the user message and the placeholder on error, user's text remains in input box
      setMessages(prev => prev.slice(0, -2)); 
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="p-0 md:p-6 bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-2xl max-w-lg mx-auto h-[calc(100vh-200px)] md:h-auto flex flex-col">
      <div className="flex items-center p-4 md:p-0 mb-4 border-b border-slate-700 pb-3">
        <h2 className="text-2xl font-bold text-cyan-300 flex items-center">
            <BrainCircuit className="w-6 h-6 mr-2" /> {t('AI_COACH_TITLE')}
        </h2>
        <button 
            onClick={handleClearChat} 
            title={t('CLEAR_CHAT_TOOLTIP')}
            className="ml-auto p-2 text-slate-400 rounded-full hover:bg-slate-700 hover:text-cyan-300 transition-colors"
            aria-label={t('CLEAR_CHAT_ARIA')}
        >
          <Trash2 size={20} />
        </button>
      </div>

      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'model' && (
              <div className="w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center text-white flex-shrink-0">
                <Bot size={20} />
              </div>
            )}
            <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${msg.role === 'user' ? 'bg-indigo-500 text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'}`}>
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

      {(error || apiKeyError) && (
        <div className="p-4 border-t border-slate-700">
            {apiKeyError && (
                 <div className="p-3 text-center bg-red-900/50 text-red-300 border border-red-500/30 rounded-lg">
                    <p className="font-bold">{t('API_KEY_MISSING_ERROR_TITLE')}</p>
                    <p className="text-sm mt-1">{t('API_KEY_MISSING_ERROR_DESC')}</p>
                     <button onClick={handleSetApiKey} className="mt-3 px-4 py-2 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-700">
                        {t('SET_API_KEY_BUTTON')}
                    </button>
                </div>
            )}
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-4 border-t border-slate-700 flex items-center space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('AI_COACH_PLACEHOLDER')}
          className="flex-grow p-3 bg-slate-700 border border-slate-600 rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-200"
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || !input.trim()} className="p-3 rounded-full bg-cyan-600 text-white disabled:bg-slate-600 transition transform hover:scale-105">
          {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
        </button>
      </form>
    </section>
  );
};