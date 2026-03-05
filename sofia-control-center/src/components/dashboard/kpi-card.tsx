import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: string;
    trendUp?: boolean;
    info?: string;
}

export function KpiCard({ title, value, icon: Icon, trend, trendUp, info }: KpiCardProps) {
    return (
        <Card className="bg-card border-border shadow-sm overflow-hidden group hover:border-primary/40 transition-colors">
            <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</p>
                        <div className="text-3xl font-bold text-foreground tracking-tight">{value}</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                        <Icon className="w-5 h-5" />
                    </div>
                </div>

                <div className="flex items-center justify-between text-xs mt-auto pt-2 border-t border-border/50">
                    {trend && (
                        <span className={cn(
                            "font-medium flex items-center gap-1",
                            trendUp ? "text-green-500" : "text-red-400"
                        )}>
                            {trendUp ? '↑' : '↓'} {trend}
                        </span>
                    )}
                    {info && (
                        <span className="text-muted-foreground ml-auto">{info}</span>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
