import { create } from 'zustand';

export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    createdAt: string;
    sources?: any[];
}

export interface Conversation {
    id: string;
    title?: string;
    channel: string;
    status: string;
    createdAt: string;
}

interface ChatState {
    conversations: Conversation[];
    currentConversationId: string | null;
    messages: Message[];

    setConversations: (conversations: Conversation[]) => void;
    addConversation: (conversation: Conversation) => void;
    setCurrentConversation: (id: string | null) => void;

    setMessages: (messages: Message[]) => void;
    addMessage: (message: Message) => void;
    updateMessageChunks: (messageId: string, content: string) => void; // for streaming updates if needed
}

export const useChatStore = create<ChatState>((set) => ({
    conversations: [],
    currentConversationId: null,
    messages: [],

    setConversations: (conversations) => set({ conversations }),
    addConversation: (conversation) => set((state) => ({
        conversations: [conversation, ...state.conversations]
    })),

    setCurrentConversation: (id) => set({ currentConversationId: id }),

    setMessages: (messages) => set({ messages }),
    addMessage: (message) => set((state) => ({
        messages: [...state.messages, message]
    })),

    updateMessageChunks: (messageId, content) => set((state) => ({
        messages: state.messages.map(m =>
            m.id === messageId ? { ...m, content: m.content + content } : m
        )
    })),
}));
