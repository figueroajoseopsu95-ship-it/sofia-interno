'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChartWidget } from "@/components/charts/line-chart";
import { PieChartWidget } from "@/components/charts/pie-chart";
import { DollarSign, Cpu, TrendingUp } from "lucide-react";

const mockCostData = [
    { day: 'Lun', cost: 12.5 }, { day: 'Mar', cost: 14.2 },
    { day: 'Mie', cost: 21.8 }, { day: 'Jue', cost: 18.4 },
    { day: 'Vie', cost: 29.1 }, { day: 'Sab', cost: 4.5 },
    { day: 'Dom', cost: 2.1 }
];

const mockModelDist = [
    { name: 'gpt-4o', value: 65 },
    { name: 'claude-3-haiku', value: 25 }, // Fast Reranker
    { name: 'text-embedding-3-small', value: 10 }
];

export default function AnalyticsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Finanzas & Costos LLM</h1>
                <p className="text-muted-foreground text-sm">Monitor de facturación corporativa en OpenAI y Anthropic por consumos RAG.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-card/40 border-border">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Costo Acumulado (Mes)</p>
                                <div className="text-3xl font-bold text-foreground mt-2">$342.50</div>
                            </div>
                            <div className="p-3 bg-red-500/10 text-red-500 rounded-lg"><DollarSign className="w-5 h-5" /></div>
                        </div>
                        <div className="mt-4 text-xs font-medium text-red-400 flex items-center gap-1">↑ 12% vs mes anterior</div>
                    </CardContent>
                </Card>

                <Card className="bg-card/40 border-border">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Costo Promedio Diario</p>
                                <div className="text-3xl font-bold text-foreground mt-2">$14.65</div>
                            </div>
                            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-lg"><TrendingUp className="w-5 h-5" /></div>
                        </div>
                        <div className="mt-4 text-xs font-medium text-muted-foreground">Proyección fin de mes: ~$430</div>
                    </CardContent>
                </Card>

                <Card className="bg-card/40 border-border">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Costo por Ticket (Avg)</p>
                                <div className="text-3xl font-bold text-foreground mt-2">$0.003</div>
                            </div>
                            <div className="p-3 bg-purple-500/10 text-purple-500 rounded-lg"><Cpu className="w-5 h-5" /></div>
                        </div>
                        <div className="mt-4 text-xs font-medium text-green-500 flex items-center gap-1">↓ Optimizado (Haiku Rerank)</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <LineChartWidget
                        title="Curva de Gasto Diario (USD)"
                        data={mockCostData}
                        xKey="day"
                        lines={[
                            { key: 'cost', color: '#10b981', name: 'Gasto Generativo' },
                        ]}
                    />
                </div>
                <PieChartWidget
                    title="Distribución del Gasto por Modelo Base"
                    data={mockModelDist}
                    dataKey="value"
                    nameKey="name"
                />
            </div>
        </div>
    );
}
