'use client';

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThumbsDown, ThumbsUp, AlertTriangle, ArrowUpRight } from "lucide-react";
import { PieChartWidget } from "@/components/charts/pie-chart";

const mockFeedbackDist = [
    { name: 'Información Incorrecta', value: 45 },
    { name: 'Fuera de Contexto', value: 30 },
    { name: 'Desactualizada', value: 15 },
    { name: 'Incompleta', value: 10 }
];

const mockRecentNegative = [
    { id: '1', emp: 'E15992', agt: 'Credit Policies Agent', cat: 'Outdated', msg: "SOFIA me dio la tasa política vieja (32%) en lugar de la vigente (34%).", date: 'Hace 5 min' },
    { id: '2', emp: 'E00241', agt: 'Router Agent', cat: 'Off Topic', msg: "Le pregunté por vacaciones y terminó hablandome de tarjetas amex", date: 'Hace 24 min' },
    { id: '3', emp: 'E41092', agt: 'IT Support Bot', cat: 'Incomplete', msg: "Los pasos para resetear pwd no incluyen el link 2FA nuevo", date: 'Hace 2 horas' },
];

export default function FeedbackPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Radar de Feedback y Alucinaciones</h1>
                <p className="text-muted-foreground text-sm">Clasificación de calidad de respuestas reportadas por los colaboradores (User in the Loop).</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-card/40 border-border">
                    <CardContent className="p-6">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">CSAT Global</p>
                        <div className="text-3xl font-bold text-green-500 flex items-center gap-2">92.4% <ThumbsUp className="w-5 h-5" /></div>
                    </CardContent>
                </Card>
                <Card className="bg-card/40 border-border">
                    <CardContent className="p-6">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Respuestas Rechazadas</p>
                        <div className="text-3xl font-bold text-red-400 flex items-center gap-2">7.6% <ThumbsDown className="w-5 h-5" /></div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3 xl:grid-cols-3">
                <PieChartWidget
                    title="Taxonomía de Respuestas Rechazadas (N=421)"
                    data={mockFeedbackDist}
                    dataKey="value"
                    nameKey="name"
                />

                <Card className="col-span-1 lg:col-span-2 bg-card/40">
                    <CardHeader>
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-yellow-500" /> Cola de Ajustes de Contexto Crítico
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {mockRecentNegative.map(fb => (
                            <div key={fb.id} className="p-4 border border-border/50 bg-black/20 rounded-xl relative group">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="border-red-500/30 text-red-400 text-[9px] uppercase">{fb.cat}</Badge>
                                        <span className="text-xs font-mono text-muted-foreground">{fb.emp}</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground">{fb.date}</span>
                                </div>
                                <p className="text-sm font-medium text-foreground">&quot;{fb.msg}&quot;</p>
                                <p className="text-xs text-primary mt-2 flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    Agente Responsable: {fb.agt} <ArrowUpRight className="w-3 h-3" />
                                </p>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
