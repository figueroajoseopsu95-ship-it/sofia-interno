'use client';

import {
    Users, MessageSquare, Target, Activity, Zap, ThumbsUp
} from "lucide-react";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { SystemHealthCards } from "@/components/dashboard/system-health";
import { LineChartWidget } from "@/components/charts/line-chart";
import { PieChartWidget } from "@/components/charts/pie-chart";

// === MOCK DATA FOR SCAFFOLDING ===
const KPIs = [
    { title: "Conversaciones Hoy", value: "8,241", icon: MessageSquare, trend: "12%", trendUp: true },
    { title: "Mensajes Enviados", value: "32,492", icon: Zap, trend: "4%", trendUp: true },
    { title: "Usuarios Activos (24h)", value: "2,194", icon: Users, trend: "1%", trendUp: false },
    { title: "Latencia Promedio", value: "840ms", icon: Activity, trend: "120ms", trendUp: false, info: "Pico: 1.4s" },
    { title: "Consumo LLM Tokens", value: "14.2M", icon: Target, trend: "22%", trendUp: false },
    { title: "Score Feedback RAG", value: "4.8/5", icon: ThumbsUp, trend: "0.2 pts", trendUp: true }
];

const mockLineData = [
    { time: '00:00', convs: 120, lat: 800 }, { time: '04:00', convs: 400, lat: 810 },
    { time: '08:00', convs: 2100, lat: 1100 }, { time: '12:00', convs: 3400, lat: 950 },
    { time: '16:00', convs: 2800, lat: 880 }, { time: '20:00', convs: 900, lat: 820 },
    { time: '23:59', convs: 300, lat: 800 }
];

const mockPieData = [
    { name: 'Políticas Crédito', value: 45 },
    { name: 'Onboarding General', value: 25 },
    { name: 'Soporte TI', value: 20 },
    { name: 'Riesgo y Fraude', value: 10 }
];

const mockHealth = [
    { service: 'postgres' as const, status: 'healthy' as const, latencyMs: 14 },
    { service: 'redis' as const, status: 'healthy' as const, latencyMs: 2 },
    { service: 'n8n' as const, status: 'degraded' as const, latencyMs: 450 }
];

const mockFeed = [
    { id: '1', type: 'alert' as const, description: 'Alta latencia detectada en n8n Risk Agent (>2000ms)', timestamp: new Date().toISOString() },
    { id: '2', type: 'feedback' as const, description: 'User E12334 calificó 1/5 [Outdated] en Créditos VIP', timestamp: new Date(Date.now() - 3600000).toISOString() },
    { id: '3', type: 'chat' as const, description: 'Nueva sesión masiva (300 req/s) detectada en Caracas', timestamp: new Date(Date.now() - 7200000).toISOString() },
    { id: '4', type: 'agent_execution' as const, description: 'Auto-Scaling activó 2 instancias extra de n8n webhook', timestamp: new Date(Date.now() - 8600000).toISOString() }
];

export default function DashboardOverview() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Status Operativo de Inteligencia Artificial</h1>
                <p className="text-muted-foreground text-sm">Resumen en tiempo real del motor conversacional, APIs y rendimiento corporativo.</p>
            </div>

            {/* Row 1: KPIs */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {KPIs.map((kpi, i) => (
                    <KpiCard key={i} {...kpi} />
                ))}
            </div>

            {/* Row 2: Charts */}
            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-6">
                <LineChartWidget
                    title="Tráfico de Mensajes vs Latencia (24h)"
                    data={mockLineData}
                    xKey="time"
                    lines={[
                        { key: 'convs', color: '#4f46e5', name: 'Conversaciones' },
                    ]}
                />
                <PieChartWidget
                    title="Distribución de Intents (Por Agente)"
                    data={mockPieData}
                    dataKey="value"
                    nameKey="name"
                />
            </div>

            {/* Row 3 & 4: Timeline & Health */}
            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-6">
                <ActivityFeed activities={mockFeed} />
                <SystemHealthCards health={mockHealth} />
            </div>
        </div>
    );
}
