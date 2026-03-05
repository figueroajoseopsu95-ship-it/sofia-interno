import { useEffect, useRef } from 'react';
import { useChatStore } from '@/stores/chat.store';
import { MessageBubble } from './message-bubble';
import { TypingIndicator } from './typing-indicator';
import { MessageInput } from './message-input';
import { Bot } from 'lucide-react';

interface ChatContainerProps {
    isLoading: boolean;
    onSendMessage: (content: string) => void;
    welcomeName?: string;
}

export function ChatContainer({ isLoading, onSendMessage, welcomeName }: ChatContainerProps) {
    const { messages } = useChatStore();
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages, isLoading]);

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] w-full">
            {/* Scrollable Messages Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6"
            >
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-60">
                        <Bot className="h-16 w-16 text-primary" />
                        <h3 className="text-xl font-semibold text-gray-700">
                            ¡Hola{welcomeName ? `, ${welcomeName}` : ''}!
                            ¿En qué te puedo ayudar hoy?
                        </h3>
                        <p className="text-sm text-gray-500 max-w-sm">
                            Prueba preguntarme sobre manuales de crédito, políticas de tarjeta, o búsqueda de procedimientos operativos.
                        </p>
                    </div>
                ) : (
                    messages.map((m) => (
                        <MessageBubble
                            key={m.id}
                            message={m}
                            agentMetadata={m.role === 'assistant' ? { name: 'Router Agent' } : undefined}
                        />
                    ))
                )}

                {isLoading && (
                    <div className="flex w-full items-start">
                        <TypingIndicator />
                    </div>
                )}
            </div>

            {/* Input Fixed Bottom */}
            <div className="p-4 bg-white/80 backdrop-blur-md border-t relative z-10 w-full shrink-0">
                <MessageInput onSend={onSendMessage} disabled={isLoading} />
                <div className="text-center mt-3">
                    <span className="text-[10px] text-gray-400">
                        Las respuestas están respaldadas por RAG Híbrido. SOFIA puede cometer errores. Verifica la info sensible.
                    </span>
                </div>
            </div>
        </div>
    );
}
