'use client';

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, ShieldAlert, KeyRound, UserMinus } from "lucide-react";
import { LineChartWidget } from "@/components/charts/line-chart";

const mockLoginAttempts = [
    { time: '08:00', success: 420, failed: 12 }, { time: '10:00', success: 850, failed: 24 },
    { time: '12:00', success: 1100, failed: 45 }, { time: '14:00', success: 920, failed: 18 },
    { time: '16:00', success: 750, failed: 8 }, { time: '18:00', success: 320, failed: 4 },
];

const mockBlockedUsers = [
    { id: 'E14920', name: 'Carlos Mendoza', dept: 'Finanzas', reason: 'MAX_LOGIN_ATTEMPTS', date: 'Hoy, 14:20' },
    { id: 'E09112', name: 'Ana Silva', dept: 'Ventas', reason: 'SUSPICIOUS_LOCATION', date: 'Ayer, 09:15' },
];

export default function SecurityPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-destructive flex items-center gap-2">
                        <ShieldAlert className="w-6 h-6" /> Monitor de Seguridad Core
                    </h1>
                    <p className="text-muted-foreground text-sm">Prevención de Intrusiones (IDS) y Gestión de Accesos Basado en Roles (RBAC).</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-card/40 border-border">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-2">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tasa de Accesos Fallidos</p>
                            <div className="p-2 bg-red-500/10 text-red-500 rounded"><KeyRound className="w-4 h-4" /></div>
                        </div>
                        <div className="text-2xl font-bold text-foreground">2.4%</div>
                        <p className="text-xs text-muted-foreground mt-1">Normal (&lt; 5%)</p>
                    </CardContent>
                </Card>
                <Card className="bg-card/40 border-border">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-2">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cuentas Bloqueadas</p>
                            <div className="p-2 bg-orange-500/10 text-orange-500 rounded"><UserMinus className="w-4 h-4" /></div>
                        </div>
                        <div className="text-2xl font-bold text-foreground">12</div>
                        <p className="text-xs text-muted-foreground mt-1">En las últimas 24 hrs</p>
                    </CardContent>
                </Card>
                <Card className="bg-card/40 border-border">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-2">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Estado Endpoint Interno</p>
                            <div className="p-2 bg-green-500/10 text-green-500 rounded"><ShieldCheck className="w-4 h-4" /></div>
                        </div>
                        <div className="text-2xl font-bold text-green-500">PROTECTED</div>
                        <p className="text-xs text-muted-foreground mt-1">Guardia de API Key interna activa</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <LineChartWidget
                        title="Intentos de Autenticación (Hoy)"
                        data={mockLoginAttempts}
                        xKey="time"
                        lines={[
                            { key: 'success', color: '#10b981', name: 'Acceso Exitoso' },
                            { key: 'failed', color: '#ef4444', name: 'Acceso Denegado' },
                        ]}
                    />
                </div>

                <Card className="bg-card/40 border-destructive/20">
                    <CardHeader>
                        <CardTitle className="text-base font-semibold text-destructive">Cuentas en Cuarentena</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {mockBlockedUsers.map(usr => (
                            <div key={usr.id} className="p-3 bg-red-950/20 border border-red-500/10 rounded-lg">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-semibold text-sm">{usr.name} <span className="text-muted-foreground font-mono text-[10px] ml-1">({usr.id})</span></span>
                                    <span className="text-[10px] text-muted-foreground">{usr.date}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-[9px] text-red-400 border-red-500/20">{usr.reason}</Badge>
                                    <span className="text-[10px] text-muted-foreground">Dept: {usr.dept}</span>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
