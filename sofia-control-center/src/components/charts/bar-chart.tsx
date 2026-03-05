'use client';

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from "recharts";

interface BarChartWidgetProps {
    title: string;
    data: any[];
    xKey: string;
    bars: { key: string; color: string; name: string; stackId?: string }[];
    layout?: "horizontal" | "vertical";
}

export function BarChartWidget({ title, data, xKey, bars, layout = "horizontal" }: BarChartWidgetProps) {
    return (
        <Card className="col-span-1 lg:col-span-3 bg-card/50">
            <CardHeader>
                <CardTitle className="text-sm font-medium text-foreground">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} layout={layout} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={layout === "horizontal"} horizontal={layout === "vertical"} />
                            <XAxis dataKey={layout === "horizontal" ? xKey : undefined} type={layout === "horizontal" ? "category" : "number"} stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                            <YAxis dataKey={layout === "vertical" ? xKey : undefined} type={layout === "vertical" ? "category" : "number"} stroke="#888888" fontSize={11} tickLine={false} axisLine={false} width={80} />
                            <Tooltip
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                                itemStyle={{ fontSize: '12px' }}
                            />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))' }} />
                            {bars.map((bar, idx) => (
                                <Bar
                                    key={idx}
                                    dataKey={bar.key}
                                    name={bar.name}
                                    fill={bar.color}
                                    radius={4}
                                    stackId={bar.stackId}
                                />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
