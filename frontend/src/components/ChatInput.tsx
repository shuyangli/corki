import React, { useState, useRef } from 'react';
import { HiOutlinePaperAirplane, HiOutlinePaperClip } from 'react-icons/hi'
import log from 'loglevel';

interface ChatInputProps {
    onSendMessage: (text: string, images: File[]) => void;
    disableSend: boolean;
}

interface ChatInputState {
    inputValue: string;
    images: File[];
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disableSend }) => {
    const [state, setState] = useState<ChatInputState>({
        inputValue: '',
        images: [],
    })
    const setInputValue = (value: string) => {
        setState({ ...state, inputValue: value });
    }
    const setImages = (images: File[]) => {
        setState({ ...state, images });
    }
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const inputValue = state.inputValue.trim();
        if (inputValue) {
            onSendMessage(inputValue, state.images);
            setState({
                ...state,
                inputValue: '',
                images: [],
            });
        }
    };

    const handleFileAttachClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            if (filesArray.length > 0) {
                setImages([...state.images, ...filesArray]);
            }
        }
        if (e.target) e.target.value = '';
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="p-4 bg-gray-800 border-t border-gray-700 sticky bottom-0"
        >
            {state.images.length > 0 && (
                <div className="flex flex-wrap gap-2 p-1">
                    {state.images.map((image, index) => (
                        <img key={index} src={URL.createObjectURL(image)} alt="Image upload preview" className="max-w-[80px] max-h-[80px] object-contain rounded border border-gray-500" />
                    ))}
                </div>
            )}
            <div className="flex items-center bg-gray-700 rounded-xl p-1">
                <button
                    type="button"
                    onClick={handleFileAttachClick}
                    className="p-2 text-gray-400 hover:text-emerald-400 transition-colors disabled:opacity-50"
                    aria-label="Attach file"
                    disabled={disableSend}
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
                    disabled={disableSend}
                />
                <input
                    type="text"
                    value={state.inputValue}
                    onChange={handleInputChange}
                    placeholder={disableSend ? "AI is thinking..." : "Type your message or query..."}
                    className="flex-grow p-3 bg-transparent text-gray-200 placeholder-gray-500 focus:outline-none"
                    disabled={disableSend}
                />
                <button
                    type="submit"
                    className="p-3 text-emerald-500 hover:text-emerald-400 disabled:text-gray-500 disabled:opacity-50 transition-colors"
                    aria-label="Send message"
                    disabled={disableSend || (!state.inputValue.trim() && (!fileInputRef.current?.files || fileInputRef.current.files.length === 0))}
                >
                    <HiOutlinePaperAirplane className="h-6 w-6" />
                </button>
            </div>
        </form>
    );
};

export default ChatInput;