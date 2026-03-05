import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../stores/auth.store';
import { useChatStore } from '../stores/chat.store';

export const useWebSocket = () => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const { accessToken } = useAuthStore();
    const { addMessage } = useChatStore();

    const connect = useCallback(() => {
        if (!accessToken) return;

        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000';

        // Connect to the /chat namespace (backend: @WebSocketGateway({ namespace: '/chat' }))
        // Pass JWT via auth.token (extraHeaders doesn't work for WebSocket in browsers)
        const newSocket = io(`${wsUrl}/chat`, {
            auth: {
                token: accessToken
            },
            reconnectionAttempts: 5,
            reconnectionDelay: 2000,
            transports: ['websocket', 'polling'],
        });

        newSocket.on('connect', () => {
            setIsConnected(true);
            console.log('WS Connected to SOFIA Backend /chat namespace');
        });

        newSocket.on('disconnect', () => {
            setIsConnected(false);
            console.log('WS Disconnected');
        });

        newSocket.on('connect_error', (err) => {
            console.error('WS Connection error:', err.message);
        });

        // Backend emits 'new_message' (snake_case)
        newSocket.on('new_message', (message) => {
            addMessage(message);
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [accessToken, addMessage]);

    useEffect(() => {
        const cleanup = connect();
        return () => {
            if (cleanup) cleanup();
        };
    }, [connect]);

    // Backend expects 'join_conversation' (snake_case)
    const joinRoom = (conversationId: string) => {
        if (socket && isConnected) {
            socket.emit('join_conversation', { conversationId });
        }
    };

    // Backend expects 'leave_conversation' (snake_case)
    const leaveRoom = (conversationId: string) => {
        if (socket && isConnected) {
            socket.emit('leave_conversation', { conversationId });
        }
    };

    return { isConnected, socket, joinRoom, leaveRoom };
};
