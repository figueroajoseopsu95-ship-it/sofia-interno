'use client';

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Pie, PieChart, ResponsiveContainer, Cell, Tooltip, Legend } from "recharts";

interface PieChartWidgetProps {
    title: string;
    data: any[];
    dataKey: string;
    nameKey: string;
}

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export function PieChartWidget({ title, data, dataKey, nameKey }: PieChartWidgetProps) {
    return (
        <Card className="col-span-1 lg:col-span-2 bg-card/50">
            <CardHeader>
                <CardTitle className="text-sm font-medium text-foreground">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey={dataKey}
                                nameKey={nameKey}
                                stroke="none"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                itemStyle={{ fontSize: '12px', fontWeight: 600, color: 'hsl(var(--foreground))' }}
                            />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
