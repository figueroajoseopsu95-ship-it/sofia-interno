'use client';

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LineChartWidget } from "@/components/charts/line-chart";
import { AlertTriangle, Target, Link as LinkIcon, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const mockQualityTrend = [
    { day: 'Lun', score: 0.82 }, { day: 'Mar', score: 0.84 },
    { day: 'Mie', score: 0.81 }, { day: 'Jue', score: 0.86 },
    { day: 'Vie', score: 0.89 }, { day: 'Sab', score: 0.91 },
    { day: 'Dom', score: 0.92 }
];

const mockWorstQueries = [
    { id: '1', query: '¿Cómo pido un adelanto de utilidades?', score: 0.45, chunks: 1, date: 'Hace 4 hrs' },
    { id: '2', query: 'Pasos para reinicio de VPN MAC OS', score: 0.38, chunks: 0, date: 'Ayer' },
    { id: '3', query: 'Contacto del proveedor de la fiesta de fin de año', score: 0.12, chunks: 0, date: 'Ayer' },
];

export default function QualityPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Análisis de Calidad RAG</h1>
                <p className="text-muted-foreground text-sm">Monitoreo de precisión de recuperación vectorial (Similitud Coseno Media).</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="bg-card/40 border-border">
                    <CardContent className="p-6 text-center">
                        <Target className="w-8 h-8 text-primary mx-auto mb-2" />
                        <p className="text-3xl font-bold text-foreground">0.86</p>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Avg Retrieval Score</p>
                        <div className="mt-4 w-full bg-secondary rounded-full h-2 overflow-hidden">
                            <div className="bg-primary h-full" style={{ width: '86%' }} />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card/40 border-border">
                    <CardContent className="p-6 text-center">
                        <LinkIcon className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
                        <p className="text-3xl font-bold text-foreground">4.2</p>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Avg Chunks per Query</p>
                        <p className="text-[10px] text-muted-foreground mt-2">Umbral ideal: 3 - 5 chunks</p>
                    </CardContent>
                </Card>

                <Card className="bg-card/40 border-border">
                    <CardContent className="p-6 text-center">
                        <AlertTriangle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                        <p className="text-3xl font-bold text-foreground">12.4%</p>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Queries bajo umbral ( &lt; 0.65 )</p>
                        <p className="text-[10px] text-red-400 mt-2 font-medium">Requieren ajuste de vocabulario o indexación</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <LineChartWidget
                        title="Evolución de Precisión RAG (7 Días)"
                        data={mockQualityTrend}
                        xKey="day"
                        lines={[
                            { key: 'score', color: '#10b981', name: 'Avg Similitud Coseno' },
                        ]}
                    />
                </div>

                <Card className="bg-card/50">
                    <CardHeader>
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-red-500" /> Peores Queries Recientes
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {mockWorstQueries.map((q) => (
                            <div key={q.id} className="p-3 bg-red-950/20 border border-red-500/10 rounded-xl relative group">
                                <div className="flex items-center justify-between mb-2">
                                    <Badge variant="outline" className="border-red-500/30 text-red-400 text-[10px] uppercase">
                                        Score: {q.score}
                                    </Badge>
                                    <span className="text-[10px] text-muted-foreground">{q.date}</span>
                                </div>
                                <p className="text-sm font-medium text-foreground">&quot;{q.query}&quot;</p>
                                <p className="text-xs text-muted-foreground mt-2 font-mono">
                                    Chunks Recuperados: {q.chunks}
                                </p>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
