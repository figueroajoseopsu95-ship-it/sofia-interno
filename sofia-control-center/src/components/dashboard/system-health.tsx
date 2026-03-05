'use client';

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Database, Server, Workflow } from "lucide-react";

interface HealthStatus {
    service: 'postgres' | 'redis' | 'n8n';
    status: 'healthy' | 'degraded' | 'down';
    latencyMs: number;
}

interface SystemHealthCardsProps {
    health: HealthStatus[];
}

export function SystemHealthCards({ health }: SystemHealthCardsProps) {

    const getConfig = (service: string) => {
        switch (service) {
            case 'postgres': return { name: 'PostgreSQL PGVector', icon: Database };
            case 'redis': return { name: 'Redis Cache (Global)', icon: Server };
            case 'n8n': return { name: 'n8n Orchestrator Engine', icon: Workflow };
            default: return { name: service, icon: Server };
        }
    };

    const getStatusColor = (status: string) => {
        if (status === 'healthy') return 'bg-green-500/20 text-green-500 border-green-500/20';
        if (status === 'degraded') return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/20';
        return 'bg-red-500/20 text-red-500 border-red-500/20';
    };

    return (
        <Card className="col-span-1 lg:col-span-3 pt-6">
            <CardContent className="grid gap-4 md:grid-cols-3">
                {health.map((h, i) => {
                    const cfg = getConfig(h.service);
                    const IconColor = getStatusColor(h.status);

                    return (
                        <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-black/20">
                            <div className={`p-3 rounded-lg border ${IconColor}`}>
                                <cfg.icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1 space-y-1">
                                <p className="text-sm font-semibold text-card-foreground leading-none">{cfg.name}</p>
                                <div className="flex items-center justify-between mt-1 text-xs">
                                    <span className="uppercase font-mono font-bold tracking-widest opacity-80">{h.status}</span>
                                    <span className="text-muted-foreground">{h.latencyMs}ms</span>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </CardContent>
        </Card>
    );
}
