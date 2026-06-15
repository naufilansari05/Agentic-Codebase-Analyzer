'use client';

import {useRef, useEffect, useState} from 'react';
import {useChat} from '@/hooks/useChat';
import ChatBubble from './ChatBubble';
import ChatInput from './ChatInput';
import {useTheme} from "next-themes";

export default function ChatInterface() {

    const {messages, sendMessage, isLoading, clearHistory} = useChat();
    const bottomRef = useRef<HTMLDivElement>(null);
    const {theme, setTheme, resolvedTheme} = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
      setMounted(true);
    }, []);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({behavior: 'smooth'});
    }, [messages, isLoading]);

    return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-4 flex justify-between items-center shadow-sm transition-colors">
        <h1 className="font-bold text-gray-800 dark:text-gray-100">Codebase Investigator Agent</h1>
        
        <div className="flex items-center gap-4">
          {mounted && (
            <button 
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              className="text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-md transition-colors"
            >
              {theme === 'dark' ? 'Light' : 'Dark'}
            </button>
          )}
          <button onClick={clearHistory} className="text-sm text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 hover:underline transition-colors">
            Clear History
          </button>
        </div>
      </header>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 ? (
            <div className="text-center text-gray-400 dark:text-gray-500 mt-20">
              <p>No messages yet. Paste a GitHub link and start asking questions!</p>
            </div>
          ) : (
            messages.map((msg) => <ChatBubble key={msg.id} message={msg} />)
          )}
          
          {isLoading && (
            <div className="text-gray-500 dark:text-gray-400 text-sm italic mt-4 animate-pulse">
              Agent is investigating the repository...
            </div>
          )}
          <div ref={bottomRef} /> 
        </div>
      </div>

      <ChatInput onSend={sendMessage} isLoading={isLoading} />
    </div>
  );

}