import React, { useState, useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import { type Message, MessageSender } from '../types';
import { WineRecommendationAPI } from '../api/wineRecommendation';
import log from 'loglevel';

// Helper to generate unique IDs
const generateId = (): string => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const ChatInterface: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: generateId(),
            text: "Hi there! How can I help you find the perfect wine today? Feel free to ask me anything or share a wine menu by tapping the 📎 icon.",
            sender: MessageSender.AI,
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
            { id: aiMessageId, text: "", sender: MessageSender.AI, isStreaming: true, images: [] },
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
        } finally {
            setIsAiTyping(false);
        }
    };

    const handleSendMessage = async (text: string, images: File[]): Promise<void> => {
        // Convert images to data URLs
        let imageDataUrls: string[] = [];
        try {
            const imageLoadingPromises = images.map(async (image) => {
                if (image.type.startsWith('image/')) {
                    return new Promise<string>((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = (e) => resolve(e.target?.result as string);
                        reader.onerror = (e) => reject(e);
                        reader.readAsDataURL(image);
                    });
                }
                return Promise.resolve(undefined);
            });
            imageDataUrls = (await Promise.all(imageLoadingPromises)).filter((url) => url !== undefined);
        } catch (error) {
            log.error('Error converting images to data URLs:', error);
            return;
        }

        if (text.trim()) {
            const userMessage: Message = {
                id: generateId(),
                text: text,
                sender: MessageSender.User,
                images: imageDataUrls
            };
            setMessages((prevMessages) => [...prevMessages, userMessage]);
            await streamAiResponse(text, images);
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
                disableSend={isAiTyping}
            />
        </div>
    );
};

export default ChatInterface;