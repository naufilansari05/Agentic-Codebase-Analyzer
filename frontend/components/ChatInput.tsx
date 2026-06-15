'use client';

import {useState, KeyboardEvent} from 'react';

type Props = {

    onSend: (message: string) => void;
    isLoading: boolean;

};

export default function ChatInput({onSend, isLoading}: Props) {

    const [input, setInput] = useState('');

    const handleSend = () => {

        if (input.trim() && !isLoading) {
            onSend(input);
            setInput('')
        }

    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }

    };

    return (
    <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 transition-colors">
      <div className="flex items-end gap-2 max-w-4xl mx-auto">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about the codebase... (Shift+Enter for new line)"
          className="flex-1 max-h-32 p-3 border border-gray-300 dark:border-gray-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
          rows={1}
          disabled={isLoading}
        />
        <button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  );

}