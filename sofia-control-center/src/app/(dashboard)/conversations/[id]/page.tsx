'use client';

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, User, Bot, Clock, Link, Coins, Network } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";

const mockTimeline = [
    { id: '1', role: 'user', time: '14:32:05', content: 'Cual es el calculo del finiquito si renuncio mañana?' },
    { id: '2', role: 'system', time: '14:32:06', content: 'Router Agent evalúa la consulta... Intent "HR_ONBOARDING_EXIT" detectado. Enrutando a RRHH Agent.' },
    {
        id: '3',
        role: 'assistant',
        agent: 'HR Assistant',
        time: '14:32:12',
        content: 'Para calcular tu finiquito por renuncia voluntaria, según el artículo 45 de las Políticas de RRHH, se toma en cuenta:\\n\\n1. **Días trabajados en el mes**\\n2. **Bono Vacacional Fraccionado**\\n3. **Utilidades Fraccionadas**\\n\\n¿Deseas que simulemos el cálculo con tu salario base registrado?',
        sources: ['Política de Liquidaciones 2024 - Secc. 2']
    },
    { id: '4', role: 'user', time: '14:33:01', content: 'Si, por favor' },
    {
        id: '5',
        role: 'assistant',
        agent: 'HR Assistant',
        time: '14:33:14',
        content: 'El cálculo simulado para una renuncia al día de mañana (Salario Base: $850) arroja un estimado de **$324.50** correspondientes a liquidación de compromisos adquiridos.\\n\\n> *Recuerda que esto es referencial y debe ser validado por Capital Humano.*',
        sources: ['Calculadora de Prestaciones v2']
    }
];

export default function ConversationDetailPage() {
    const params = useParams();
    const router = useRouter();

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full bg-card hover:bg-white/10">
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Conversación <span className="text-primary font-mono">{params.id}</span></h1>
                    <p className="text-muted-foreground text-sm flex items-center gap-2">
                        Iniciada vía <Badge variant="outline" className="text-[10px]">Web Chat</Badge> por usuario <span className="font-mono text-primary">E14920</span>
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="font-semibold text-lg border-b border-border pb-2">Timeline del Evento</h3>
                    <div className="space-y-6 pt-4">
                        {mockTimeline.map(msg => (
                            <div key={msg.id} className="flex gap-4">
                                <div className="flex flex-col items-center mt-1">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-indigo-500/20 text-indigo-400' :
                                            msg.role === 'system' ? 'bg-orange-500/20 text-orange-400' :
                                                'bg-blue-500/20 text-blue-400'
                                        }`}>
                                        {msg.role === 'user' ? <User className="w-4 h-4" /> : msg.role === 'system' ? <Network className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                    </div>
                                    <div className="w-px h-full bg-border my-2" />
                                </div>
                                <div className="flex-1 pb-4">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-semibold text-sm capitalize">
                                            {msg.role === 'assistant' ? msg.agent : msg.role === 'system' ? 'Orquestador n8n' : 'E14920'}
                                        </span>
                                        <span className="text-xs text-muted-foreground font-mono">{msg.time}</span>
                                    </div>

                                    {msg.role === 'system' ? (
                                        <div className="p-3 bg-orange-950/20 border border-orange-500/20 text-orange-200/80 rounded-lg text-xs font-mono">
                                            {msg.content}
                                        </div>
                                    ) : (
                                        <div className={`prose prose-invert prose-sm max-w-none ${msg.role === 'user' ? 'text-gray-300' : 'text-gray-200'} bg-card/30 p-4 rounded-xl border border-white/5`}>
                                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                                        </div>
                                    )}

                                    {msg.sources && msg.sources.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {msg.sources.map((src, i) => (
                                                <Badge key={i} variant="secondary" className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px] flex items-center gap-1">
                                                    <Link className="w-3 h-3" /> {src}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        <div className="flex justify-center"><Badge variant="outline" className="text-muted-foreground border-dashed">FIN DE SESIÓN</Badge></div>
                    </div>
                </div>

                {/* Right Panel Metadata */}
                <div className="space-y-4">
                    <Card className="bg-card/50">
                        <CardHeader className="pb-3 border-b border-border/50">
                            <CardTitle className="text-sm">Metadata Técnica</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground flex items-center gap-2"><Clock className="w-4 h-4" /> Duración</span>
                                <span className="text-sm font-semibold">1m 9s</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground flex items-center gap-2"><Coins className="w-4 h-4" /> Tokens Prompt</span>
                                <span className="text-sm font-mono">2,140</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground flex items-center gap-2"><Coins className="w-4 h-4" /> Tokens Completión</span>
                                <span className="text-sm font-mono">312</span>
                            </div>
                            <div className="flex items-center justify-between border-t border-border pt-4">
                                <span className="text-xs font-semibold text-primary">Costo Est. Modelo</span>
                                <span className="text-sm font-mono text-green-400">$0.0019</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-card/50">
                        <CardHeader className="pb-3 border-b border-border/50">
                            <CardTitle className="text-sm">Feedback de Usuario</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 text-center">
                            <span className="text-sm text-muted-foreground italic">El usuario no calíficó la respuestas de esta sesión.</span>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
