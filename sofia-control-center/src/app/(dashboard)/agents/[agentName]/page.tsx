'use client';

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Activity, Target, Zap, ServerCrash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { LineChartWidget } from "@/components/charts/line-chart";
import { PieChartWidget } from "@/components/charts/pie-chart";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const mockLineData = [
    { day: 'Lun', execs: 1200, latency: 450 }, { day: 'Mar', execs: 1400, latency: 460 },
    { day: 'Mie', execs: 2100, latency: 600 }, { day: 'Jue', execs: 1800, latency: 520 },
    { day: 'Vie', execs: 2900, latency: 850 }, { day: 'Sab', execs: 400, latency: 400 },
    { day: 'Dom', execs: 150, latency: 390 }
];

const mockTokensData = [
    { name: 'Input Tokens', value: 8500200 },
    { name: 'Output Tokens', value: 3105000 },
];

const recentExecutions = [
    { id: 'ex_1', reqId: 'req_84920', status: 'SUCCESS', latency: 420, tokens: 412, cost: 0.0012, time: '10:45:02' },
    { id: 'ex_2', reqId: 'req_84921', status: 'SUCCESS', latency: 415, tokens: 380, cost: 0.0010, time: '10:45:15' },
    { id: 'ex_3', reqId: 'req_84922', status: 'FAILED', latency: 8900, tokens: 0, cost: 0, time: '10:46:12' },
    { id: 'ex_4', reqId: 'req_84923', status: 'SUCCESS', latency: 850, tokens: 1024, cost: 0.0035, time: '10:47:01' },
    { id: 'ex_5', reqId: 'req_84924', status: 'SUCCESS', latency: 430, tokens: 210, cost: 0.0008, time: '10:48:30' },
];

export default function AgentDetailPage() {
    const params = useParams();
    const router = useRouter();
    const agentName = decodeURIComponent((params.agentName as string) || '').replace(/-/g, ' ').toUpperCase();

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full bg-card hover:bg-white/10">
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-3">
                        {agentName}
                        <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/30 border-0">ACTIVE ONLINE</Badge>
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Identificador Interno: <span className="font-mono text-primary">n8n_wf_{params.agentName}</span>
                    </p>
                </div>
            </div>

            {/* Overview Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <KpiCard title="Total Executions (7d)" value="9,950" icon={Activity} trend="8%" trendUp={true} />
                <KpiCard title="Avg Latency" value="450ms" icon={Zap} trend="-10ms" trendUp={true} />
                <KpiCard title="Success Rate" value="99.9%" icon={Target} trend="0.1%" trendUp={true} />
                <KpiCard title="Failed Executions" value="3" icon={ServerCrash} trend="Stable" />
            </div>

            {/* Charts */}
            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <LineChartWidget
                        title="Volumen de Carga vs Degradación (Últimos 7 Días)"
                        data={mockLineData}
                        xKey="day"
                        lines={[
                            { key: 'execs', color: '#4f46e5', name: 'Ejecuciones' },
                            { key: 'latency', color: '#ef4444', name: 'Latencia (ms)' },
                        ]}
                    />
                </div>
                <PieChartWidget
                    title="Consumo Proporcional de Tokens LLM"
                    data={mockTokensData}
                    dataKey="value"
                    nameKey="name"
                />
            </div>

            {/* Executions Table */}
            <Card className="bg-card/50">
                <CardHeader>
                    <CardTitle className="text-base font-semibold">Registro Reciente de Ejecuciones (Live)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm">
                            <thead className="[&_tr]:border-b border-border/50">
                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground uppercase text-[10px] tracking-wider">Time</th>
                                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground uppercase text-[10px] tracking-wider">Execution ID</th>
                                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground uppercase text-[10px] tracking-wider">Status</th>
                                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground uppercase text-[10px] tracking-wider">Latency</th>
                                    <th className="h-10 px-4 text-right align-middle font-medium text-muted-foreground uppercase text-[10px] tracking-wider">Tokens Used</th>
                                    <th className="h-10 px-4 text-right align-middle font-medium text-muted-foreground uppercase text-[10px] tracking-wider">Est. Cost</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {recentExecutions.map((ex) => (
                                    <tr key={ex.id} className="border-b border-border/30 transition-colors hover:bg-white/5 data-[state=selected]:bg-muted">
                                        <td className="p-4 align-middle text-muted-foreground font-mono text-[11px]">{ex.time}</td>
                                        <td className="p-4 align-middle font-mono text-primary text-[11px]">{ex.id}</td>
                                        <td className="p-4 align-middle">
                                            <Badge variant="outline" className={`text-[10px] uppercase ${ex.status === 'SUCCESS' ? 'text-green-500 border-green-500/30' : 'text-red-500 border-red-500/30'}`}>
                                                {ex.status}
                                            </Badge>
                                        </td>
                                        <td className="p-4 align-middle font-medium">{ex.latency}ms</td>
                                        <td className="p-4 align-middle text-right">{ex.tokens.toLocaleString()}</td>
                                        <td className="p-4 align-middle text-right font-mono text-muted-foreground">${ex.cost.toFixed(4)}</td>
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
