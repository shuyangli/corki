import React, { useState, useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import type { Message } from '../types';
import { WineRecommendationAPI } from '../api/wineRecommendation';
import log from 'loglevel';

// Helper to generate unique IDs
const generateId = (): string => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const ChatInterface: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: generateId(),
            text: "Hi there! How can I help you find the perfect wine today? Feel free to ask me anything or share a wine menu by tapping the 📎 icon.",
            sender: 'ai',
        },
    ]);
    const [isAiTyping, setIsAiTyping] = useState<boolean>(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const streamAiResponse = async (userMessageText: string, uploadedFiles: File[] = []): Promise<void> => {
        setIsAiTyping(true);
        const aiMessageId = generateId();
        let currentText = "";

        // Add initial AI message
        setMessages((prev) => [
            ...prev,
            { id: aiMessageId, text: "", sender: 'ai', isStreaming: true, images: [] },
        ]);

        try {
            await WineRecommendationAPI.getRecommendation(
                {
                    prompt: userMessageText,
                    images: uploadedFiles,
                },
                (response) => {
                    if (response.done) {
                        // Finalize AI message
                        setMessages((prevMessages) =>
                            prevMessages.map((msg) =>
                                msg.id === aiMessageId ? { ...msg, text: currentText, isStreaming: false } : msg
                            )
                        );
                        setIsAiTyping(false);
                    } else {
                        currentText += response.content;
                        setMessages((prevMessages) =>
                            prevMessages.map((msg) =>
                                msg.id === aiMessageId ? { ...msg, text: currentText, isStreaming: true } : msg
                            )
                        );
                    }
                }
            );
        } catch (error) {
            log.error('Error getting wine recommendation:', error);
            // Add error message
            setMessages((prevMessages) =>
                prevMessages.map((msg) =>
                    msg.id === aiMessageId
                        ? {
                            ...msg,
                            text: "I apologize, but I encountered an error while processing your request. Please try again.",
                            isStreaming: false,
                        }
                        : msg
                )
            );
            setIsAiTyping(false);
        }
    };

    const handleSendMessage = async (text: string): Promise<void> => {
        if (text.trim()) {
            const userMessage: Message = {
                id: generateId(),
                text: text,
                sender: 'user',
                images: []
            };
            setMessages((prevMessages) => [...prevMessages, userMessage]);
            await streamAiResponse(text);
        }
    };

    const handleSendFiles = async (files: File[]): Promise<void> => {
        const imagePreviewsPromises: Promise<string>[] = [];
        for (const file of files) {
            if (file.type.startsWith('image/')) {
                imagePreviewsPromises.push(new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target?.result as string);
                    reader.onerror = (e) => reject(e);
                    reader.readAsDataURL(file);
                }));
            }
        }

        try {
            const imageDataUrls = await Promise.all(imagePreviewsPromises);
            if (imageDataUrls.length > 0) {
                const userMessageWithImages: Message = {
                    id: generateId(),
                    text: imageDataUrls.length === 1 ? "Uploaded 1 image." : `Uploaded ${imageDataUrls.length} images.`,
                    sender: 'user',
                    images: imageDataUrls,
                };
                setMessages((prevMessages) => [...prevMessages, userMessageWithImages]);
                await streamAiResponse("File upload initiated", files);
            }
        } catch (error) {
            log.error("Error reading files for preview:", error);
            const errorMessage: Message = {
                id: generateId(),
                text: "Sorry, there was an error processing your image(s). Please try again.",
                sender: 'ai',
                isStreaming: false
            };
            setMessages((prev) => [...prev, errorMessage]);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-200px)] max-h-[700px] bg-gray-800 shadow-2xl rounded-lg overflow-hidden">
            <div className="flex-grow p-6 space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                {messages.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} />
                ))}
                <div ref={messagesEndRef} /> {/* For auto-scrolling */}
            </div>
            <ChatInput
                onSendMessage={handleSendMessage}
                onSendFiles={handleSendFiles}
                isAiTyping={isAiTyping}
            />
        </div>
    );
};

export default ChatInterface;