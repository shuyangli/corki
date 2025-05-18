import React from 'react';
import { type Message, MessageSender } from '../types'; // Or define Message interface directly here

interface MessageBubbleProps {
    message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
    const { text, sender, images, isStreaming } = message;
    const isUser = sender === MessageSender.User;

    return (
        <div className={`flex mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div
                className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-xl shadow-md ${isUser
                    ? 'bg-emerald-500 text-white rounded-br-none'
                    : 'bg-gray-700 text-gray-200 rounded-bl-none'
                    }`}
            >
                {images && images.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-2">
                        {images.map((src, index) => (
                            <img
                                key={index}
                                src={src}
                                alt={`upload-preview-${index}`}
                                className="max-w-[80px] max-h-[80px] object-contain rounded border border-gray-500"
                            />
                        ))}
                    </div>
                )}
                <p className="whitespace-pre-wrap break-words text-left">
                    {text}
                    {isStreaming && <span className="inline-block w-1 h-4 bg-gray-400 animate-pulse ml-1"></span>}
                </p>
            </div>
        </div>
    );
};

export default MessageBubble;