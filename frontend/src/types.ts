export enum MessageSender {
    User = 'user',
    AI = 'ai',
}

export interface Message {
    id: string;
    text: string;
    sender: MessageSender;
    images?: string[]; // Array of data URLs for image previews
    isStreaming?: boolean;
}