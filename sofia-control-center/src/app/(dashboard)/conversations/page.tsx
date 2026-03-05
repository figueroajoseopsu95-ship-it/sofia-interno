'use client';

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Calendar, Filter, Eye, Hash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const mockConversations = [
    { id: 'conv_8412', channel: 'Web Chat', title: 'Calculo de finiquito por renuncia', user: 'E14920', msgs: 12, agent: 'Router Agent', date: 'Hoy 14:32' },
    { id: 'conv_8411', channel: 'Google Chat', title: 'Tasas de tarjeta de crédito black', user: 'E09112', msgs: 4, agent: 'Credit Policies', date: 'Hoy 14:10' },
    { id: 'conv_8410', channel: 'Web Chat', title: 'Requisitos para prestamo hipotecario', user: 'E11223', msgs: 24, agent: 'Credit Policies', date: 'Hoy 12:45' },
    { id: 'conv_8409', channel: 'API', title: 'Error VPN Cisco AnyConnect', user: 'E88112', msgs: 6, agent: 'IT Support Bot', date: 'Hoy 09:15' },
    { id: 'conv_8408', channel: 'Google Chat', title: 'Solicitar vacaciones anticipadas', user: 'E01111', msgs: 2, agent: 'HR Onboarding', date: 'Ayer 16:20' },
    { id: 'conv_8407', channel: 'Web Chat', title: 'Formateo de laptop Lenovo', user: 'E45192', msgs: 18, agent: 'IT Support Bot', date: 'Ayer 11:10' },
];

export default function ConversationsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Auditoría de Conversaciones</h1>
                    <p className="text-muted-foreground text-sm">Explorador global de sesiones y turnos del motor conversacional.</p>
                </div>
            </div>

            <Card className="bg-card/50 border-border">
                <CardHeader className="py-4 border-b border-border/50 flex flex-row items-center justify-between">
                    <div className="flex gap-2">
                        <div className="relative w-64">
                            <Hash className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Buscar ID de Conversación..." className="pl-9 h-9 bg-black/20 border-border" />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="h-9"><Calendar className="h-4 w-4 mr-2" /> Rango Fechas</Button>
                        <Button variant="outline" size="sm" className="h-9"><Filter className="h-4 w-4 mr-2" /> Filtros</Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="relative w-full overflow-auto max-h-[600px]">
                        <table className="w-full caption-bottom text-sm">
                            <thead className="sticky top-0 bg-card/95 backdrop-blur z-10 [&_tr]:border-b border-border/70">
                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <th className="h-10 px-4 text-left font-medium text-muted-foreground uppercase text-[10px] tracking-wider w-8" />
                                    <th className="h-10 px-4 text-left font-medium text-muted-foreground uppercase text-[10px] tracking-wider w-24">ID</th>
                                    <th className="h-10 px-4 text-left font-medium text-muted-foreground uppercase text-[10px] tracking-wider">Contexto Principal</th>
                                    <th className="h-10 px-4 text-left font-medium text-muted-foreground uppercase text-[10px] tracking-wider w-32">Usuario</th>
                                    <th className="h-10 px-4 text-left font-medium text-muted-foreground uppercase text-[10px] tracking-wider w-24">Canal</th>
                                    <th className="h-10 px-4 text-left font-medium text-muted-foreground uppercase text-[10px] tracking-wider w-36">Agente Principal</th>
                                    <th className="h-10 px-4 text-center font-medium text-muted-foreground uppercase text-[10px] tracking-wider w-20">Turnos</th>
                                    <th className="h-10 px-4 text-right font-medium text-muted-foreground uppercase text-[10px] tracking-wider w-32">Fecha</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {mockConversations.map((conv) => (
                                    <tr key={conv.id} className="border-b border-border/30 transition-colors hover:bg-white/5 group">
                                        <td className="p-4 align-middle">
                                            <MessageSquare className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                        </td>
                                        <td className="p-4 align-middle font-mono text-primary text-xs">
                                            <Link href={`/conversations/${conv.id}`} className="hover:underline flex items-center gap-1">
                                                {conv.id} <Eye className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </Link>
                                        </td>
                                        <td className="p-4 align-middle font-medium text-foreground truncate max-w-[250px]">{conv.title}</td>
                                        <td className="p-4 align-middle">
                                            <span className="text-xs font-mono text-muted-foreground bg-black/20 px-2 py-1 rounded border border-border/50">{conv.user}</span>
                                        </td>
                                        <td className="p-4 align-middle">
                                            <Badge variant="outline" className={`text-[9px] uppercase ${conv.channel === 'Google Chat' ? 'text-green-500 border-green-500/30' :
                                                    conv.channel === 'Web Chat' ? 'text-blue-500 border-blue-500/30' :
                                                        'text-purple-500 border-purple-500/30'
                                                }`}>
                                                {conv.channel}
                                            </Badge>
                                        </td>
                                        <td className="p-4 align-middle">
                                            <Badge variant="outline" className="text-[9px] uppercase border-primary/30 text-primary bg-primary/10">
                                                {conv.agent}
                                            </Badge>
                                        </td>
                                        <td className="p-4 align-middle text-center font-mono text-muted-foreground">
                                            {conv.msgs}
                                        </td>
                                        <td className="p-4 align-middle text-right text-xs text-muted-foreground whitespace-nowrap">
                                            {conv.date}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
