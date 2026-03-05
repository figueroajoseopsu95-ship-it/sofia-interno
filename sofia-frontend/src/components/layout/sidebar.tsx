'use client';

import { cn } from '@/lib/utils';
import { useUiStore } from '@/stores/ui.store';
import { useChatStore } from '@/stores/chat.store';
import { MessageSquare, PlusCircle, Search, Clock, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter, usePathname } from 'next/navigation';

export function Sidebar() {
    const { sidebarOpen } = useUiStore();
    const { conversations, currentConversationId, setCurrentConversation } = useChatStore();
    const router = useRouter();
    const pathname = usePathname();

    const handleNewChat = () => {
        setCurrentConversation(null); // Deselect current UI view, signals a new blank chat
        router.push('/chat');
    };

    const loadChat = (id: string) => {
        setCurrentConversation(id);
        router.push(`/chat/${id}`); // Assuming dynamic routing for chats
    };

    return (
        <aside
            className={cn(
                "fixed inset-y-0 left-0 z-20 flex w-64 flex-col border-r bg-gray-50 transition-transform duration-300 ease-in-out",
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}
        >
            {/* Brand */}
            <div className="flex shrink-0 items-center justify-between px-6 py-5 border-b border-gray-200">
                <div className="flex items-center gap-2">
                    <ShieldCheck className="h-6 w-6 text-primary" />
                    <span className="text-xl font-bold tracking-tight text-primary">SOFIA</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-4">

                {/* Navigation Actions */}
                <div className="space-y-1">
                    <Button
                        variant={pathname === '/chat' && !currentConversationId ? 'default' : 'outline'}
                        className="w-full justify-start gap-2 shadow-sm"
                        onClick={handleNewChat}
                    >
                        <PlusCircle className="h-4 w-4" />
                        Nuevo Chat
                    </Button>

                    <Button
                        variant={pathname === '/search' ? 'secondary' : 'ghost'}
                        className="w-full justify-start gap-2 text-gray-700"
                        onClick={() => router.push('/search')}
                    >
                        <Search className="h-4 w-4" />
                        Búsqueda Avanzada
                    </Button>
                </div>

                {/* Conversation History */}
                <div className="pt-2">
                    <div className="px-3 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Historial Reciente
                    </div>
                    <div className="space-y-1">
                        {conversations.length === 0 ? (
                            <p className="text-xs text-muted-foreground px-3 italic py-2">Sin conversaciones previas</p>
                        ) : (
                            conversations.slice(0, 15).map(conv => (
                                <button
                                    key={conv.id}
                                    onClick={() => loadChat(conv.id)}
                                    className={cn(
                                        "w-full text-left px-3 py-2 text-sm rounded-md truncate transition-colors flex items-center gap-2",
                                        currentConversationId === conv.id
                                            ? "bg-primary/10 text-primary font-medium"
                                            : "text-gray-600 hover:bg-gray-100"
                                    )}
                                >
                                    <MessageSquare className="h-3 w-3 shrink-0" />
                                    <span className="truncate">{conv.title || 'Nueva Conversación'}</span>
                                </button>
                            ))
                        )}
                    </div>
                </div>

            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50">
                <p className="text-[10px] text-center text-gray-400">
                    SOFIA by Banesco Banco Universal © {new Date().getFullYear()}
                </p>
            </div>
        </aside>
    );
}
