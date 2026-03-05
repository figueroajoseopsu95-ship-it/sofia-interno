'use client';

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, FileText, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { BarChartWidget } from "@/components/charts/bar-chart";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const mockColDocs = [
    { collection: 'Políticas', docs: 1420 },
    { collection: 'Procedimientos', docs: 3200 },
    { collection: 'Atención al Cliente', docs: 850 },
    { collection: 'Finanzas', docs: 124 },
];

const mockRecentDocs = [
    { id: '1', title: 'Manual_Credito_2026.pdf', status: 'INDEXED', chunks: 450, time: '12s', date: 'Hace 5 min' },
    { id: '2', title: 'Politicas_Vacaciones_V2.docx', status: 'PROCESSING', chunks: 0, time: '-', date: 'Hace 12 min' },
    { id: '3', title: 'Tarifario_Cuentas.xlsx', status: 'ERROR', chunks: 0, time: '2s', date: 'Hace 30 min' },
    { id: '4', title: 'Guia_Prevencion_Fraude.pdf', status: 'INDEXED', chunks: 120, time: '4s', date: 'Hace 1 hora' },
];

export default function KnowledgeBaseOverview() {
    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">RAG Manager Dashboard</h1>
                    <p className="text-muted-foreground text-sm">Resumen de la base de conocimiento vectorial y estado de ingestión.</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/knowledge/documents">
                        <Button variant="outline">Ver Todos los Docs</Button>
                    </Link>
                    <Link href="/knowledge/quality">
                        <Button variant="default">Análisis de Calidad</Button>
                    </Link>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Card className="bg-card/40 border-border">
                    <CardContent className="p-6 flex flex-col justify-center items-center text-center">
                        <FileText className="w-8 h-8 text-blue-500 mb-2" />
                        <p className="text-2xl font-bold">5,594</p>
                        <p className="text-xs text-muted-foreground uppercase">Total Documentos</p>
                    </CardContent>
                </Card>
                <Card className="bg-card/40 border-border">
                    <CardContent className="p-6 flex flex-col justify-center items-center text-center">
                        <Database className="w-8 h-8 text-indigo-500 mb-2" />
                        <p className="text-2xl font-bold">177,200</p>
                        <p className="text-xs text-muted-foreground uppercase">Total Chunks V.</p>
                    </CardContent>
                </Card>
                <Card className="bg-card/40 border-border">
                    <CardContent className="p-6 flex flex-col justify-center items-center text-center">
                        <CheckCircle2 className="w-8 h-8 text-green-500 mb-2" />
                        <p className="text-2xl font-bold">98.5%</p>
                        <p className="text-xs text-muted-foreground uppercase">Tasa de Éxito Index</p>
                    </CardContent>
                </Card>
                <Card className="bg-card/40 border-border">
                    <CardContent className="p-6 flex flex-col justify-center items-center text-center">
                        <div className="flex gap-4">
                            <div className="text-center">
                                <AlertCircle className="w-6 h-6 text-red-500 mx-auto mb-1" />
                                <span className="text-lg font-bold">12</span>
                            </div>
                            <div className="text-center">
                                <Clock className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
                                <span className="text-lg font-bold">45</span>
                            </div>
                        </div>
                        <p className="text-[10px] text-muted-foreground uppercase mt-2">Errores / Pendientes</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
                <BarChartWidget
                    title="Documentos por Colección"
                    data={mockColDocs}
                    xKey="collection"
                    bars={[
                        { key: 'docs', color: '#4f46e5', name: 'Documentos' },
                    ]}
                />

                <Card className="bg-card/50">
                    <CardHeader>
                        <CardTitle className="text-sm font-semibold">Últimos Documentos Procesados</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border/50 text-left text-muted-foreground text-xs">
                                        <th className="pb-2 font-medium">Documento</th>
                                        <th className="pb-2 font-medium">Status</th>
                                        <th className="pb-2 font-medium">Chunks</th>
                                        <th className="pb-2 font-medium">Tiempo</th>
                                    </tr>
                                </thead>
                                <tbody className="[&_tr:last-child]:border-0">
                                    {mockRecentDocs.map(doc => (
                                        <tr key={doc.id} className="border-b border-border/30">
                                            <td className="py-3 max-w-[150px] truncate text-foreground font-medium">{doc.title}</td>
                                            <td className="py-3">
                                                <Badge variant="outline" className={`text-[9px] uppercase ${doc.status === 'INDEXED' ? 'text-green-500 border-green-500/30' :
                                                        doc.status === 'PROCESSING' ? 'text-yellow-500 border-yellow-500/30 animate-pulse' :
                                                            'text-red-500 border-red-500/30'
                                                    }`}>
                                                    {doc.status}
                                                </Badge>
                                            </td>
                                            <td className="py-3 text-muted-foreground">{doc.chunks}</td>
                                            <td className="py-3 text-muted-foreground font-mono">{doc.time}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>

        </div>
    );
}
