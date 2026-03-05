'use client';

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Workflow, Play, Settings, Webhook, CodeIcon, ShieldCheck } from "lucide-react";

export default function N8nPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2">
                        <Workflow className="w-6 h-6" /> Orquestador n8n
                    </h1>
                    <p className="text-muted-foreground text-sm">Panel de control directo para los Agentes Autónomos e Integraciones HTTP.</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {/* n8n Status Card */}
                <Card className="bg-card/40 border-border">
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">Integración de SOFIA Router (+4 Agentes)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-500/10 text-green-500 rounded"><Webhook className="w-4 h-4" /></div>
                                <div>
                                    <p className="text-sm font-semibold text-foreground">Webhook Principal (Incoming)</p>
                                    <p className="text-[10px] text-muted-foreground font-mono truncate max-w-[200px]">https://n8n.bcv.corp/webhook/sofia-router</p>
                                </div>
                            </div>
                            <Badge variant="outline" className="border-green-500/30 text-green-500 text-[10px]">OPERATIONAL</Badge>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/10 text-blue-500 rounded"><CodeIcon className="w-4 h-4" /></div>
                                <div>
                                    <p className="text-sm font-semibold text-foreground">API Interna SOFIA (Capa Common)</p>
                                    <p className="text-[10px] text-muted-foreground font-mono">X-Internal-API-Key: valid</p>
                                </div>
                            </div>
                            <Badge variant="outline" className="border-blue-500/30 text-blue-500 text-[10px]">CONNECTED</Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Env Variables & Tools Card */}
                <Card className="bg-card/40 border-border">
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">Infrastructura Segura</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 rounded-lg bg-black/20 border border-white/5 font-mono text-[11px] text-muted-foreground space-y-2">
                            <div className="flex justify-between items-center"><span className="text-primary">DB_TYPE:</span> <span className="text-foreground">postgresdb</span></div>
                            <div className="flex justify-between items-center"><span className="text-primary">DB_POSTGRESDB_DATABASE:</span> <span className="text-foreground">sofia_n8n_db</span></div>
                            <div className="flex justify-between items-center"><span className="text-primary">N8N_BASIC_AUTH_USER:</span> <span className="text-foreground">admin</span></div>
                            <div className="flex justify-between items-center"><span className="text-primary">N8N_WORKFLOW_TIMEOUT:</span> <span className="text-foreground">60s</span></div>
                            <div className="flex justify-between items-center"><span className="text-primary">WEBHOOK_URL:</span> <span className="text-green-500">Online</span></div>
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-2 mt-4">
                            <ShieldCheck className="w-4 h-4 text-green-500" /> Los agentes no poseen acceso WAN directo. Solo pueden consultar a SOFIA_INTERNAL_API.
                        </p>
                    </CardContent>
                </Card>
            </div>

        </div>
    );
}
