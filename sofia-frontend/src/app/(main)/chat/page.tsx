'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { api } from '@/services/api';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Bot, Loader2 } from 'lucide-react';
import { useWebSocket } from '@/hooks/use-websocket';
import { toast } from 'sonner';

export default function ChatPage() {
    const [inputValue, setInputValue] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const { user } = useAuthStore();
    const { isConnected } = useWebSocket();
    const router = useRouter();

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || isCreating) return;

        setIsCreating(true);
        try {
            // Create a new conversation then redirect to it with the first message
            const res = await api.post('/chat/conversations', {
                title: inputValue.trim().slice(0, 60)
            });
            const conversationId = res.data.id;
            router.push(`/chat/${conversationId}?firstMessage=${encodeURIComponent(inputValue.trim())}`);
        } catch (err) {
            toast.error('No se pudo crear la conversación. Verifica que el backend esté activo.');
            setIsCreating(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-gray-50 p-4 lg:p-6 max-w-5xl mx-auto w-full">
            <Card className="flex-1 flex flex-col shadow-sm border-t-4 border-primary/50 overflow-hidden">

                {/* Empty State */}
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-6">
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-60">
                        <Bot className="h-16 w-16 text-primary" />
                        <h3 className="text-xl font-semibold text-gray-700">
                            ¡Hola, {user?.firstName}! Soy SOFIA
                        </h3>
                        <p className="text-sm text-gray-500 max-w-sm">
                            Estoy conectada a los manuales internos, políticas de crédito y
                            base de conocimiento de Banesco. ¿En qué te puedo ayudar hoy?
                        </p>
                        {!isConnected && (
                            <p className="text-xs text-amber-500 mt-2">⚠️ Conectando con el servidor...</p>
                        )}
                    </div>
                </CardContent>

                {/* Input Area */}
                <CardFooter className="p-3 bg-white border-t">
                    <form onSubmit={handleSend} className="flex w-full gap-2 items-center">
                        <Input
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Escribe tu consulta aquí..."
                            className="flex-1 rounded-full px-5 bg-gray-50 border-gray-200 focus-visible:ring-primary/50"
                            disabled={isCreating}
                        />
                        <Button
                            type="submit"
                            size="icon"
                            className="rounded-full h-10 w-10 shadow-md transition-transform hover:scale-105"
                            disabled={!inputValue.trim() || isCreating}
                        >
                            {isCreating
                                ? <Loader2 className="h-4 w-4 animate-spin" />
                                : <Send className="h-4 w-4" />
                            }
                        </Button>
                    </form>
                </CardFooter>
            </Card>

            <div className="text-center mt-3">
                <span className="text-[11px] text-gray-400">
                    {isConnected ? '🟢 SOFIA Core Online' : '🔴 Reconectando SOFIA...'} | Las respuestas de la IA pueden requerir validación.
                </span>
            </div>
        </div>
    );
}
