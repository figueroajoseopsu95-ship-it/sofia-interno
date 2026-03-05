'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, Activity, Clock, Target, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

// Mock Data
const AGENTS = [
    { name: 'Router Agent', status: 'active', color: 'bg-primary', execs: 14200, latency: 450, sr: 99.9 },
    { name: 'Credit Policies Agent', status: 'active', color: 'bg-green-500', execs: 4210, latency: 1250, sr: 94.2 },
    { name: 'Risk Assessment', status: 'warning', color: 'bg-yellow-500', execs: 852, latency: 2400, sr: 88.5 },
    { name: 'IT Support Bot', status: 'active', color: 'bg-blue-500', execs: 3100, latency: 890, sr: 97.1 },
    { name: 'HR Onboarding', status: 'active', color: 'bg-purple-500', execs: 1205, latency: 1100, sr: 98.4 },
    { name: 'Finance Queries', status: 'offline', color: 'bg-red-500', execs: 0, latency: 0, sr: 0 },
];

export default function AgentsPage() {
    const router = useRouter();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Ecosistema de Agentes (n8n)</h1>
                <p className="text-muted-foreground text-sm">Monitoreo y health checks de la flota de modelos enrutados vía webhook.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {AGENTS.map((agent) => (
                    <Card
                        key={agent.name}
                        className="bg-card/40 border-border hover:border-primary/50 transition-colors cursor-pointer group"
                        onClick={() => router.push(`/agents/${encodeURIComponent(agent.name.toLowerCase().replace(/ /g, '-'))}`)}
                    >
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2.5 rounded-lg ${agent.color}/20 text-${agent.color.replace('bg-', '')}`}>
                                        <Bot className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-foreground">{agent.name}</h3>
                                        <Badge variant="outline" className={`text-[10px] mt-1 uppercase ${agent.status === 'active' ? 'border-green-500/50 text-green-500' :
                                                agent.status === 'warning' ? 'border-yellow-500/50 text-yellow-500' :
                                                    'border-red-500/50 text-red-500'
                                            }`}>
                                            {agent.status}
                                        </Badge>
                                    </div>
                                </div>
                                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>

                            <div className="grid grid-cols-3 gap-2 mt-6 pt-4 border-t border-border/50">
                                <div className="text-center">
                                    <Activity className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
                                    <div className="text-xs font-semibold text-foreground">{agent.execs.toLocaleString()}</div>
                                    <div className="text-[10px] text-muted-foreground">Execs</div>
                                </div>
                                <div className="text-center border-l border-r border-border/50">
                                    <Clock className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
                                    <div className="text-xs font-semibold text-foreground">{agent.latency}ms</div>
                                    <div className="text-[10px] text-muted-foreground">Avg Latency</div>
                                </div>
                                <div className="text-center">
                                    <Target className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
                                    <div className="text-xs font-semibold text-foreground">{agent.sr}%</div>
                                    <div className="text-[10px] text-muted-foreground">Success Rate</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
