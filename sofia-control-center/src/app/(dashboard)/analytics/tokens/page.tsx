'use client';

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LineChartWidget } from "@/components/charts/line-chart";
import { BarChartWidget } from "@/components/charts/bar-chart";
import { Cpu, Target, ArrowUpRight } from "lucide-react";

const mockTokenDaily = [
    { day: 'Lun', prompt: 1.2, completion: 0.4 },
    { day: 'Mar', prompt: 1.5, completion: 0.5 },
    { day: 'Mie', prompt: 2.1, completion: 0.8 },
    { day: 'Jue', prompt: 1.8, completion: 0.6 },
    { day: 'Vie', prompt: 2.5, completion: 0.9 },
    { day: 'Sab', prompt: 0.5, completion: 0.2 },
    { day: 'Dom', prompt: 0.2, completion: 0.1 }
];

const mockTokensByAgent = [
    { agent: 'Router', prompt: 3.5, completion: 0.2 },
    { agent: 'Policies', prompt: 4.1, completion: 1.5 },
    { agent: 'IT', prompt: 1.2, completion: 0.8 },
    { agent: 'HR', prompt: 0.8, completion: 0.4 }
];

export default function AnalyticsTokensPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Consumo de Tokens LLM</h1>
                <p className="text-muted-foreground text-sm">Desglose de volúmenes de contexto (Input/Prompt) vs Generación (Output/Completion).</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card className="bg-card/40 border-border">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-2">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Prompt Tokens (7d)</p>
                            <div className="p-2 bg-blue-500/10 text-blue-500 rounded"><Cpu className="w-4 h-4" /></div>
                        </div>
                        <div className="text-3xl font-bold text-foreground">9.8M</div>
                        <p className="text-xs text-muted-foreground mt-1">~95% del costo por Contexto RAG extenso</p>
                    </CardContent>
                </Card>
                <Card className="bg-card/40 border-border">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-2">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Completion Tokens (7d)</p>
                            <div className="p-2 bg-green-500/10 text-green-500 rounded"><Target className="w-4 h-4" /></div>
                        </div>
                        <div className="text-3xl font-bold text-foreground">3.5M</div>
                        <p className="text-xs text-muted-foreground mt-1">Respuestas generadas hacia el cliente</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
                <LineChartWidget
                    title="Curva de Densidad de Tokens (Millones)"
                    data={mockTokenDaily}
                    xKey="day"
                    lines={[
                        { key: 'prompt', color: '#3b82f6', name: 'Prompt Tokens' },
                        { key: 'completion', color: '#10b981', name: 'Completion Tokens' },
                    ]}
                />

                <BarChartWidget
                    title="Consumo por Agente Orquestador (Millones)"
                    data={mockTokensByAgent}
                    xKey="agent"
                    bars={[
                        { key: 'prompt', color: '#3b82f6', name: 'Prompt Tokens', stackId: 'a' },
                        { key: 'completion', color: '#10b981', name: 'Completion Tokens', stackId: 'a' }
                    ]}
                />
            </div>

            <Card className="bg-card/50">
                <CardHeader>
                    <CardTitle className="text-sm font-semibold">Top 10 Usuarios / Consumidores</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {['E14920 - RRHH', 'E09112 - Ventas', 'E11223 - Finanzas', 'E88112 - IT'].map((usr, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-black/20 border border-white/5 rounded-lg">
                                <span className="font-mono text-sm">{usr}</span>
                                <div className="flex items-center gap-4 text-xs">
                                    <span className="text-muted-foreground">Tokens Consultados: <span className="font-semibold text-foreground">{(400000 - i * 80000).toLocaleString()}</span></span>
                                    <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

        </div>
    );
}
