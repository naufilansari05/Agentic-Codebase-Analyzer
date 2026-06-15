'use client';

import {useState, useEffect} from 'react';
import { Message } from '@/types/chat';

export function useChat() {

    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => { 
        localStorage.setItem('chat_history', JSON.stringify(messages));
    }, [messages])

    const sendMessage = async (content: string) => {

        if (!content.trim()) return; // safeguard to prevent empty message sending

        const newUserMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content,
        };
        setMessages((prev) => [...prev, newUserMsg]);
        setIsLoading(true);

        // TODO: gotta replace this with an actual fetch when backend's set up
        setTimeout(() => {

            const newAgentMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'agent',
                content: 'Placeholder placehodler',
                citations: ['main.py'],
            };
            
            setMessages((prev) => [...prev, newAgentMsg]);
            setIsLoading(false);

        }, 1500);

    };

    const clearHistory = () => {
        setMessages([]);
        localStorage.removeItem('chat_history');
    };

    return {messages, sendMessage, isLoading, clearHistory};

}