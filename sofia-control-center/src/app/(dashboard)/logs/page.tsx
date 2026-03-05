'use client';

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollText, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const mockLogs = [
    { id: 'log_01', type: 'ERROR', src: 'NestJS-Backend', msg: 'Failed to connect to PGVector on attempt 3. Retrying...', time: '2026-03-03 16:45:01', user: 'SYSTEM' },
    { id: 'log_02', type: 'WARN', src: 'RAG-Retrieval', msg: 'Collection FIN threshold below 0.65 (hybrid search degraded)', time: '2026-03-03 16:44:12', user: 'SYSTEM' },
    { id: 'log_03', type: 'INFO', src: 'AuthGuard', msg: 'Successful admin login from IP 192.168.1.45', time: '2026-03-03 16:40:00', user: 'E15401' },
    { id: 'log_04', type: 'INFO', src: 'n8n-Webhook', msg: 'Execution ex_19230 completed in 840ms', time: '2026-03-03 16:38:15', user: 'n8n-core' },
    { id: 'log_05', type: 'FATAL', src: 'Redis-Cluster', msg: 'Connection lost. Switching to follower node.', time: '2026-03-03 16:30:00', user: 'SYSTEM' },
    { id: 'log_06', type: 'INFO', src: 'Document-Syncer', msg: 'Ingested 450 new chunks to PP collection', time: '2026-03-03 16:15:22', user: 'SyncJob' },
];

export default function LogsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">System Logs & Traces</h1>
                    <p className="text-muted-foreground text-sm">Vista cruda del interceptor global del backend para auditoría profunda.</p>
                </div>
                <div className="flex gap-2">
                    <div className="relative w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Buscar por traza o ID..." className="pl-9 h-9 bg-card border-border" />
                    </div>
                    <Button variant="outline" size="icon" className="h-9 w-9"><Filter className="h-4 w-4" /></Button>
                </div>
            </div>

            <Card className="bg-card/50 border-border">
                <CardHeader className="py-4 border-b border-border/50">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <ScrollText className="w-4 h-4 text-primary" /> Live Audit Stream (Últimas 500 entradas)
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="relative w-full overflow-auto max-h-[650px]">
                        <table className="w-full caption-bottom text-sm">
                            <thead className="sticky top-0 bg-card/95 backdrop-blur z-10 [&_tr]:border-b border-border/70">
                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <th className="h-9 px-4 text-left font-medium text-muted-foreground uppercase text-[10px] tracking-wider w-32">Timestamp</th>
                                    <th className="h-9 px-4 text-left font-medium text-muted-foreground uppercase text-[10px] tracking-wider w-24">Level</th>
                                    <th className="h-9 px-4 text-left font-medium text-muted-foreground uppercase text-[10px] tracking-wider w-40">Source / Module</th>
                                    <th className="h-9 px-4 text-left font-medium text-muted-foreground uppercase text-[10px] tracking-wider">Message Payload</th>
                                    <th className="h-9 px-4 text-right font-medium text-muted-foreground uppercase text-[10px] tracking-wider w-24">Actor</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0 font-mono text-[11px]">
                                {mockLogs.map((log) => (
                                    <tr key={log.id} className="border-b border-border/30 transition-colors hover:bg-white/5 data-[state=selected]:bg-muted group">
                                        <td className="p-3 align-middle text-muted-foreground">{log.time}</td>
                                        <td className="p-3 align-middle">
                                            <Badge variant="outline" className={`text-[9px] px-1.5 rounded-sm uppercase tracking-widest ${log.type === 'INFO' ? 'text-blue-500 border-blue-500/30 bg-blue-500/10' :
                                                    log.type === 'WARN' ? 'text-yellow-500 border-yellow-500/30 bg-yellow-500/10' :
                                                        log.type === 'ERROR' ? 'text-red-500 border-red-500/30 bg-red-500/10' :
                                                            'text-purple-500 border-purple-500/30 bg-purple-500/10 ring-1 ring-purple-500 font-bold animate-pulse'
                                                }`}>
                                                {log.type}
                                            </Badge>
                                        </td>
                                        <td className="p-3 align-middle text-gray-300 font-semibold">{log.src}</td>
                                        <td className="p-3 align-middle text-gray-400 group-hover:text-gray-200 transition-colors truncate max-w-md">
                                            {log.msg}
                                        </td>
                                        <td className="p-3 align-middle text-right text-muted-foreground">{log.user}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

        </div>
    );
}
