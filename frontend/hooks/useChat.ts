'use client';

import {useState, useEffect} from 'react';
import { Message } from '@/types/chat';

export function useChat() {

    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {

        const savedMessages = localStorage.getItem('chat_history');
        if (savedMessages) {
            try {
                setMessages(JSON.parse(savedMessages));
            } catch (e) {
                console.error("Failed to parse chat history: ", e)
            }
        }

    }, []);

    useEffect(() => { 
        localStorage.setItem('chat_history', JSON.stringify(messages));
    }, [messages])

    const sendMessage = async (content: string) => {

        if (!content.trim() || isLoading) return; // safeguard to prevent empty message sending

        const newUserMsg: Message = {
            id: crypto.randomUUID(),
            role: 'user',
            content: content.trim(),
        };
        const updatedHistory = [...messages, newUserMsg];
        setMessages(updatedHistory);
        setIsLoading(true);

        try {

            const response = await fetch('http://localhost:8000/api/chat', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({messages: updatedHistory}),
            });

            if (!response.ok) {throw new Error(`Server error: ${response.statusText}`);}

            const data = await response.json();
            const agentMessage: Message = {
                id: crypto.randomUUID(),
                role: "agent",
                content: data.reply,
                citations: data.citations,
            };

            setMessages((prev) => [...prev, agentMessage]);

        } catch (error) {

            console.error("Error encountered connecting to backend");
            const errorMessage: Message = {
                id: crypto.randomUUID(),
                role: "agent",
                content: "Error encountered connecting to backend"
            };

            setMessages((prev) => [...prev, errorMessage]);

        } finally {
            setIsLoading(false);
        }

    };

    const clearHistory = () => {
        setMessages([]);
        localStorage.removeItem('chat_history');
    };

    return {messages, sendMessage, isLoading, clearHistory};

}