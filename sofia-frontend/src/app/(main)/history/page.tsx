'use client';

import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { MessageSquare, Calendar, Globe, Smartphone, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Conversation {
    id: string;
    title: string;
    channel: string;
    createdAt: string;
    updatedAt: string;
    _count: { messages: number };
}

export default function HistoryPage() {
    const [history, setHistory] = useState<Conversation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await api.get('/chat/conversations?limit=50');
            setHistory(res.data.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const getChannelIcon = (channel: string) => {
        if (channel === 'google_chat') return <Smartphone className="h-3 w-3" />;
        return <Globe className="h-3 w-3" />;
    };

    return (
        <div className="flex flex-col h-full bg-gray-50 p-6 md:p-8">
            <div className="max-w-5xl mx-auto w-full space-y-6">

                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Historial de Conversaciones</h1>
                    <p className="text-sm text-gray-500">
                        Registro auditable de todas tus interacciones recientes con SOFIA, agrupadas por fecha.
                    </p>
                </div>

                {isLoading ? (
                    <div className="animate-pulse space-y-3">
                        {[1, 2, 3, 4].map(k => <div key={k} className="h-20 bg-gray-200 rounded-xl" />)}
                    </div>
                ) : history.length === 0 ? (
                    <Card className="bg-white border-dashed text-center py-12">
                        <MessageSquare className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 font-medium">No posees historial actualmente.</p>
                    </Card>
                ) : (
                    <div className="grid gap-3">
                        {history.map((conv) => (
                            <Card
                                key={conv.id}
                                className="group cursor-pointer hover:border-primary transition-colors bg-white shadow-sm"
                                onClick={() => router.push(`/chat/${conv.id}`)}
                            >
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                            <MessageSquare className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-800 text-sm md:text-base leading-none mb-1.5 group-hover:text-primary transition-colors">
                                                {conv.title || 'Nueva Consulta sin Contexto'}
                                            </h3>
                                            <div className="flex items-center gap-3 text-xs text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {format(new Date(conv.updatedAt), "dd MMM yyyy, p", { locale: es })}
                                                </span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1 font-medium bg-gray-100 px-1.5 py-0.5 rounded">
                                                    {conv._count?.messages || 0} mensajes
                                                </span>
                                                <span>•</span>
                                                <Badge variant="outline" className="text-[9px] flex items-center gap-1 font-mono uppercase">
                                                    {getChannelIcon(conv.channel)} {conv.channel.replace('_', ' ')}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-primary transition-colors" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
}
