export interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    images?: string[]; // Array of data URLs for image previews
    isStreaming?: boolean;
}