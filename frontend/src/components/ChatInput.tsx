import React, { useState, useRef } from 'react';
import { HiOutlinePaperAirplane, HiOutlinePaperClip } from 'react-icons/hi'

interface ChatInputProps {
    onSendMessage: (text: string) => void;
    onSendFiles: (files: File[]) => void;
    isAiTyping: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, onSendFiles, isAiTyping }) => {
    const [inputValue, setInputValue] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // Check if there is text input OR if files are selected (even if text input is empty)
        const filesSelected = fileInputRef.current && fileInputRef.current.files && fileInputRef.current.files.length > 0;
        if (inputValue.trim() || filesSelected) {
            onSendMessage(inputValue.trim()); // Send text even if it's empty, if files are primary action
            setInputValue('');
            // Files are handled by onSendFiles, triggered by onChange of the file input
            // If files were selected but no text, onSendMessage would effectively send empty text,
            // and onSendFiles handles the files. This behavior might need refinement based on exact desired UX.
            // Typically, a send button might be disabled if no text AND no files are staged.
            // Or, sending text and files could be two distinct actions or combined.
            // For this implementation, onSendMessage sends the current text, and onSendFiles (triggered separately) handles files.
        }
    };

    const handleFileAttachClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            if (filesArray.length > 0) {
                onSendFiles(filesArray);
            }
        }
        // Clear the file input value so the same file can be selected again if needed
        if (e.target) e.target.value = '';
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="p-4 bg-gray-800 border-t border-gray-700 sticky bottom-0"
        >
            <div className="flex items-center bg-gray-700 rounded-xl p-1">
                <button
                    type="button"
                    onClick={handleFileAttachClick}
                    className="p-2 text-gray-400 hover:text-emerald-400 transition-colors disabled:opacity-50"
                    aria-label="Attach file"
                    disabled={isAiTyping}
                >
                    <HiOutlinePaperClip className="h-6 w-6" />
                </button>
                <input
                    type="file"
                    multiple
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                    disabled={isAiTyping}
                />
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    placeholder={isAiTyping ? "AI is thinking..." : "Type your message or query..."}
                    className="flex-grow p-3 bg-transparent text-gray-200 placeholder-gray-500 focus:outline-none"
                    disabled={isAiTyping}
                />
                <button
                    type="submit"
                    className="p-3 text-emerald-500 hover:text-emerald-400 disabled:text-gray-500 disabled:opacity-50 transition-colors"
                    aria-label="Send message"
                    disabled={isAiTyping || (!inputValue.trim() && (!fileInputRef.current?.files || fileInputRef.current.files.length === 0))}
                >
                    <HiOutlinePaperAirplane className="h-6 w-6" />
                </button>
            </div>
        </form>
    );
};

export default ChatInput;