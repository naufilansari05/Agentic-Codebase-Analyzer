'use client';

import { Message } from "@/types/chat";

export default function ChatBubble({message}: {message: Message}) {

    const isUser = message.role === 'user';

    return (
    
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div 
        className={`max-w-[75%] rounded-lg p-4 transition-colors ${
          isUser 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700'
        }`}
      >
        <p className="whitespace-pre-wrap text-sm">{message.content}</p>
        
        {/* Render Citations if present */}
        {!isUser && message.citations && message.citations.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-300 dark:border-gray-600">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">References:</p>
            <div className="flex flex-wrap gap-2">
              {message.citations.map((cite, idx) => (
                <span key={idx} className="bg-white dark:bg-gray-700 px-2 py-1 text-xs rounded shadow-sm border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 transition-colors">
                  📄 {cite}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  
    );

}