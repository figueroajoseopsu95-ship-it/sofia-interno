'use client';

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AreaChartWidget } from "@/components/charts/area-chart";
import { BarChartWidget } from "@/components/charts/bar-chart";
import { Clock, Zap, Activity } from "lucide-react";

const mockPerformanceTrend = [
    { day: 'Lun', avg: 850, p95: 1200 },
    { day: 'Mar', avg: 820, p95: 1100 },
    { day: 'Mie', avg: 1400, p95: 2800 },
    { day: 'Jue', avg: 900, p95: 1300 },
    { day: 'Vie', avg: 880, p95: 1250 },
    { day: 'Sab', avg: 450, p95: 600 },
    { day: 'Dom', avg: 420, p95: 550 },
];

const mockAgentLatency = [
    { agent: 'Router', p50: 250, p95: 400, p99: 800 },
    { agent: 'Políticas', p50: 1200, p95: 2100, p99: 3500 },
    { agent: 'Onboarding', p50: 900, p95: 1400, p99: 2200 },
    { agent: 'IT Support', p50: 850, p95: 1300, p99: 1800 }
];

export default function AnalyticsPerformancePage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Rendimiento y Latencia (SLA)</h1>
                <p className="text-muted-foreground text-sm">Monitoreo de tiempos de respuesta del motor PostgreSQL (RAG) + OpenAI API.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-card/40 border-border">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-2">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Latencia Media Global</p>
                            <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded"><Activity className="w-4 h-4" /></div>
                        </div>
                        <div className="text-3xl font-bold text-foreground">840ms</div>
                        <p className="text-xs text-green-500 mt-1">Dentro del SLA esperado (&lt; 2000ms)</p>
                    </CardContent>
                </Card>
                <Card className="bg-card/40 border-border">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-2">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">P95 (Global)</p>
                            <div className="p-2 bg-yellow-500/10 text-yellow-500 rounded"><Clock className="w-4 h-4" /></div>
                        </div>
                        <div className="text-3xl font-bold text-foreground">1.8s</div>
                        <p className="text-xs text-muted-foreground mt-1">El 95% de request entran en este rango</p>
                    </CardContent>
                </Card>
                <Card className="bg-card/40 border-border">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-2">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">P99 (Anomalías)</p>
                            <div className="p-2 bg-red-500/10 text-red-500 rounded"><Zap className="w-4 h-4" /></div>
                        </div>
                        <div className="text-3xl font-bold text-foreground">3.2s</div>
                        <p className="text-xs text-red-400 mt-1">Requiere optimización de Vector DB</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
                <AreaChartWidget
                    title="Evolución de Latencia vs Degradación P95 (ms)"
                    data={mockPerformanceTrend}
                    xKey="day"
                    areas={[
                        { key: 'p95', color: '#ef4444', name: 'Percentil 95' },
                        { key: 'avg', color: '#10b981', name: 'Media' },
                    ]}
                />

                <BarChartWidget
                    title="Distribución Percentil por Agente (P50/P95/P99)"
                    data={mockAgentLatency}
                    xKey="agent"
                    bars={[
                        { key: 'p50', color: '#3b82f6', name: 'Media (P50)' },
                        { key: 'p95', color: '#f59e0b', name: 'Degradación 5% (P95)' },
                        { key: 'p99', color: '#ef4444', name: 'Anomalías 1% (P99)' }
                    ]}
                />
            </div>

            <Card className="bg-card/50">
                <CardHeader>
                    <CardTitle className="text-sm font-semibold">Heatmap Simulado (Tráfico por Hora)</CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Simple CSS simulated heatmap strip */}
                    <div className="flex items-center gap-1 w-full overflow-hidden rounded border border-border mt-2 h-16">
                        <div className="h-full flex-1 bg-green-500/20" title="00:00 - Bajo trafico, latencia 200ms"></div>
                        <div className="h-full flex-1 bg-green-500/30" title="04:00 - Bajo trafico, latencia 220ms"></div>
                        <div className="h-full flex-1 bg-yellow-500/50" title="08:00 - Trafico Moderado, latencia 800ms"></div>
                        <div className="h-full flex-[1.5] bg-red-500/80" title="10:00 - Pico de Trafico, latencia 1400ms"></div>
                        <div className="h-full flex-[2] bg-red-500/90" title="12:00 - Pico de Trafico, latencia 2800ms (Degraded)"></div>
                        <div className="h-full flex-1 bg-yellow-500/40" title="15:00 - Trafico Moderado, latencia 700ms"></div>
                        <div className="h-full flex-1 bg-green-500/30" title="20:00 - Bajo trafico, latencia 300ms"></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-2 font-mono uppercase">
                        <span>00:00 AM</span>
                        <span>12:00 PM (Hora pico)</span>
                        <span>23:59 PM</span>
                    </div>
                </CardContent>
            </Card>

        </div>
    );
}
