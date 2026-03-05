'use client';

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AreaChartWidget } from "@/components/charts/area-chart";
import { MessageSquare, MonitorSmartphone, TrendingUp, Users } from "lucide-react";

const mockChannelVolume = [
    { day: 'Lun', web: 850, gchat: 400 },
    { day: 'Mar', web: 920, gchat: 450 },
    { day: 'Mie', web: 1100, gchat: 800 },
    { day: 'Jue', web: 1050, gchat: 750 },
    { day: 'Vie', web: 1300, gchat: 900 },
    { day: 'Sab', web: 350, gchat: 100 },
    { day: 'Dom', web: 200, gchat: 80 },
];

const mockChannelLatencies = [
    { day: 'Lun', web: 820, gchat: 1250 },
    { day: 'Mar', web: 810, gchat: 1100 },
    { day: 'Mie', web: 890, gchat: 1400 },
    { day: 'Jue', web: 850, gchat: 1350 },
    { day: 'Vie', web: 900, gchat: 1450 },
];

export default function AnalyticsChannelsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Comparativa de Canales (Omnicanal)</h1>
                <p className="text-muted-foreground text-sm">Monitor de performance entre SOFIA Web Front (Direct) y Google Chat (API Gateway).</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {/* Web Chat Stats */}
                <Card className="bg-card/40 border-primary/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-semibold text-primary flex items-center gap-2">
                            <MonitorSmartphone className="w-5 h-5" /> SOFIA Web Front
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 mt-2">
                            <div>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Tráfico / Volumen</p>
                                <p className="text-2xl font-bold text-foreground mt-1">68.4%</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">CSAT Promedio</p>
                                <p className="text-2xl font-bold text-green-500 mt-1">94.2%</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Avg Latency</p>
                                <p className="text-xl font-bold text-foreground mt-1">860ms</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Drop Rate</p>
                                <p className="text-xl font-bold text-foreground mt-1">1.2%</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* GChat Stats */}
                <Card className="bg-card/40 border-green-500/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-semibold text-green-500 flex items-center gap-2">
                            <MessageSquare className="w-5 h-5" /> Google Chat Workspace
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 mt-2">
                            <div>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Tráfico / Volumen</p>
                                <p className="text-2xl font-bold text-foreground mt-1">31.6%</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">CSAT Promedio</p>
                                <p className="text-2xl font-bold text-green-500 mt-1">89.5%</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Avg Latency</p>
                                <p className="text-xl font-bold text-yellow-500 mt-1">1,310ms</p>
                                <p className="text-[9px] text-muted-foreground">Gateway overhead</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Drop Rate</p>
                                <p className="text-xl font-bold text-foreground mt-1">4.5%</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
                <AreaChartWidget
                    title="Volumen de Interacciones por Canal (7 Días)"
                    data={mockChannelVolume}
                    xKey="day"
                    areas={[
                        { key: 'web', color: '#4f46e5', name: 'SOFIA Web' },
                        { key: 'gchat', color: '#10b981', name: 'Google Chat' },
                    ]}
                />

                <AreaChartWidget
                    title="Latencia (ms) Comparativa Web vs GChat (5 Días)"
                    data={mockChannelLatencies}
                    xKey="day"
                    areas={[
                        { key: 'web', color: '#4f46e5', name: 'End-to-End Web' },
                        { key: 'gchat', color: '#f59e0b', name: 'End-to-End GChat' },
                    ]}
                />
            </div>

        </div>
    );
}
