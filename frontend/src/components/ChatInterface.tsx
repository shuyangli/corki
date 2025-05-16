import React, { useState, useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import type { Message } from '../types'; // Or define Message interface directly here

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

    // Mock AI streaming function
    const streamMockAiResponse = async (userMessageText: string, uploadedImageSources: string[] = []): Promise<void> => {
        setIsAiTyping(true);
        const aiMessageId = generateId();
        let baseResponseText = "Okay, I'm looking into that for you. ";

        if (uploadedImageSources.length > 0) {
            baseResponseText += `I see you've uploaded ${uploadedImageSources.length} image(s). `;
            if (userMessageText && userMessageText !== "File upload initiated") { // Check if there's actual user text beyond file indication
                baseResponseText += `Regarding your query "${userMessageText}" and the menu... `;
            } else if (uploadedImageSources.length > 0 && (!userMessageText || userMessageText === "File upload initiated")) {
                baseResponseText += `Let's see what's on this menu... `;
            }
        } else if (userMessageText) {
            baseResponseText += `Regarding "${userMessageText}"... `;
        }

        // Add initial AI message part
        setMessages((prev) => [
            ...prev,
            { id: aiMessageId, text: "", sender: 'ai', isStreaming: true, images: [] }, // Ensure images is defined
        ]);

        const fullAiText = baseResponseText + "Let me suggest a wonderful pairing. For seafood, a crisp Sauvignon Blanc is often delightful. For a hearty steak, a Cabernet Sauvignon can be a great choice. If you shared a menu, I might point to the 'Coastal Pinot Grigio' or the 'Reserve Merlot'.";
        let currentText = "";

        for (let i = 0; i < fullAiText.length; i++) {
            await new Promise((resolve) => setTimeout(resolve, 30)); // Simulate typing delay
            currentText += fullAiText[i];
            setMessages((prevMessages) =>
                prevMessages.map((msg) =>
                    msg.id === aiMessageId ? { ...msg, text: currentText, isStreaming: true } : msg
                )
            );
        }

        // Finalize AI message
        setMessages((prevMessages) =>
            prevMessages.map((msg) =>
                msg.id === aiMessageId ? { ...msg, text: currentText, isStreaming: false } : msg
            )
        );
        setIsAiTyping(false);
    };

    const handleSendMessage = async (text: string): Promise<void> => {
        // This function is primarily for text messages.
        // File uploads are handled by handleSendFiles and will also trigger an AI response.
        // If text is empty but files were just uploaded, handleSendFiles will call the AI.
        // If text is provided alongside a file upload (file input onChange triggers first),
        // this function might be called with text afterwards.
        // We only add a new user text message if there's actual text.
        if (text.trim()) {
            const userMessage: Message = {
                id: generateId(),
                text: text,
                sender: 'user',
                images: [] // Text messages don't have images by default
            };
            setMessages((prevMessages) => [...prevMessages, userMessage]);
            await streamMockAiResponse(text); // AI responds to the text
        }
        // If text is empty, we don't add a new message bubble here or call AI again,
        // assuming handleSendFiles already did or will do.
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
                // Pass a generic text for file uploads if no specific user text for this action
                await streamMockAiResponse("File upload initiated", imageDataUrls);
            }
        } catch (error) {
            console.error("Error reading files for preview:", error);
            // Optionally, add an error message to the chat
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