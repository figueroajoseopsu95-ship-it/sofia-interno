'use client';

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Activity {
    id: string;
    type: 'chat' | 'feedback' | 'agent_execution' | 'alert';
    description: string;
    timestamp: string;
    status?: string;
}

interface ActivityFeedProps {
    activities: Activity[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {

    const getIconColor = (type: string, status?: string) => {
        if (type === 'alert') return 'bg-red-500/20 text-red-500';
        if (type === 'feedback') return 'bg-yellow-500/20 text-yellow-500';
        if (status === 'FAILED') return 'bg-red-500/20 text-red-500';
        return 'bg-primary/20 text-primary';
    };

    return (
        <Card className="col-span-1 lg:col-span-3 h-full">
            <CardHeader>
                <CardTitle className="text-lg">Feed Operativo Reciente</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {activities.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-6">Sin actividad operativa en la ventana</p>
                    ) : (
                        activities.map((act) => (
                            <div key={act.id} className="flex items-start gap-4">
                                {/* Timeline dot */}
                                <div className="relative mt-1">
                                    <div className={`w-2.5 h-2.5 rounded-full ${getIconColor(act.type, act.status)?.replace('20', '500') || 'bg-primary'}`} />
                                    <div className="absolute top-3 left-1/2 -ml-px w-0.5 h-full bg-border" />
                                </div>

                                <div className="flex-1 space-y-1 pb-4">
                                    <p className="text-sm font-medium text-foreground leading-none">
                                        {act.description}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground font-mono">
                                        {format(new Date(act.timestamp), "MMM dd, HH:mm:ss", { locale: es })} • {act.type.toUpperCase()}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
