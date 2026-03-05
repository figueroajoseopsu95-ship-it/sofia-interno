'use client';

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";

interface AreaChartWidgetProps {
    title: string;
    data: any[];
    xKey: string;
    areas: { key: string; color: string; name: string }[];
}

export function AreaChartWidget({ title, data, xKey, areas }: AreaChartWidgetProps) {
    return (
        <Card className="col-span-1 lg:col-span-3 bg-card/50">
            <CardHeader>
                <CardTitle className="text-sm font-medium text-foreground">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                {areas.map((area, idx) => (
                                    <linearGradient key={idx} id={`color${area.key}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={area.color} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={area.color} stopOpacity={0} />
                                    </linearGradient>
                                ))}
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey={xKey} stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                            <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                                itemStyle={{ fontSize: '12px' }}
                            />
                            {areas.map((area, idx) => (
                                <Area
                                    key={idx}
                                    type="monotone"
                                    dataKey={area.key}
                                    name={area.name}
                                    stroke={area.color}
                                    fillOpacity={1}
                                    fill={`url(#color${area.key})`}
                                />
                            ))}
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
