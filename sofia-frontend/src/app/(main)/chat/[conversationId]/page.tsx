'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/services/api';
import { useChatStore } from '@/stores/chat.store';
import { useWebSocket } from '@/hooks/use-websocket';
import { ChatContainer } from '@/components/chat/chat-container';
import { toast } from 'sonner';

export default function DynamicChatPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const conversationId = params.conversationId as string;
    const firstMessageSentRef = useRef(false);

    const { setMessages, addMessage } = useChatStore();
    const { joinRoom, leaveRoom, isConnected } = useWebSocket();
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);

    // Fetch conversation data — runs only when conversationId changes (not on WS reconnects).
    useEffect(() => {
        if (!conversationId) return;

        const fetchContext = async () => {
            setIsLoading(true);
            try {
                const res = await api.get(`/chat/conversations/${conversationId}`);
                // Backend returns messages as { data: [...], meta: {...} }
                const msgs = res.data.messages?.data ?? res.data.messages ?? [];
                setMessages(Array.isArray(msgs) ? msgs : []);
            } catch (err) {
                toast.error('No se pudo cargar la conversación');
                router.push('/chat');
            } finally {
                setIsLoading(false);
            }
        };

        fetchContext();

        return () => {
            setMessages([]);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [conversationId]);

    // WebSocket room management — separate from fetch to avoid re-fetching on reconnect.
    useEffect(() => {
        if (!conversationId || !isConnected) return;

        joinRoom(conversationId);

        return () => {
            leaveRoom(conversationId);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [conversationId, isConnected]);

    // Send first message automatically if it came from the new chat page
    useEffect(() => {
        const firstMessage = searchParams.get('firstMessage');
        if (firstMessage && !firstMessageSentRef.current && !isLoading) {
            firstMessageSentRef.current = true;
            handleSendMessage(decodeURIComponent(firstMessage));
            // Clean up the URL query param without reloading
            window.history.replaceState({}, '', `/chat/${conversationId}`);
        }
    }, [isLoading, searchParams, conversationId]);

    const handleSendMessage = async (content: string) => {
        if (!content.trim() || isSending) return;

        setIsSending(true);

        try {
            // Optimistic UI: show user message immediately
            addMessage({
                id: `temp-${Date.now()}`,
                role: 'user',
                content,
                createdAt: new Date().toISOString()
            });

            // Send via REST — backend calls n8n synchronously and returns the assistant response
            // Only send 'content' — backend gets channel from the conversation record.
            // Sending extra fields triggers 400 (forbidNonWhitelisted validation).
            const res = await api.post(`/chat/conversations/${conversationId}/messages`, {
                content,
            });

            // Add the assistant response directly from the REST response
            if (res.data) {
                addMessage(res.data);
            }
        } catch (e: any) {
            toast.error(e?.response?.data?.message || 'Error enviando mensaje. El agente podría estar desconectado.');
        } finally {
            setIsSending(false);
        }
    };

    if (isLoading && !isSending) {
        return (
            <div className="flex h-full items-center justify-center bg-gray-50">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <ChatContainer
            isLoading={isSending}
            onSendMessage={handleSendMessage}
        />
    );
}
