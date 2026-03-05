'use client';

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";

interface LineChartWidgetProps {
    title: string;
    data: any[];
    xKey: string;
    lines: { key: string; color: string; name: string }[];
}

export function LineChartWidget({ title, data, xKey, lines }: LineChartWidgetProps) {
    return (
        <Card className="col-span-1 lg:col-span-4 bg-card/50">
            <CardHeader>
                <CardTitle className="text-sm font-medium text-foreground">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey={xKey} stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                            <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                                itemStyle={{ fontSize: '12px' }}
                            />
                            {lines.map((line, idx) => (
                                <Line
                                    key={idx}
                                    type="monotone"
                                    dataKey={line.key}
                                    name={line.name}
                                    stroke={line.color}
                                    strokeWidth={2}
                                    dot={false}
                                    activeDot={{ r: 4 }}
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
