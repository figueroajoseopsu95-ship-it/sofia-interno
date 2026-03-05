'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Upload, Filter, ArrowLeft, FileText } from "lucide-react";
import Link from 'next/link';
// TanStack Table simplificada visualmente para scaffold
// Usualmente usariamos @tanstack/react-table here

const mockDocuments = Array.from({ length: 15 }).map((_, i) => ({
    id: `doc_${i}`,
    title: `Documento_Corporativo_v${i}.pdf`,
    collection: i % 3 === 0 ? 'Políticas' : 'Procedimientos',
    type: i % 4 === 0 ? 'docx' : 'pdf',
    status: i === 2 ? 'ERROR' : i === 5 ? 'PROCESSING' : 'INDEXED',
    chunks: Math.floor(Math.random() * 500) + 10,
    pages: Math.floor(Math.random() * 100) + 1,
    date: `2026-03-0${(i % 9) + 1}`,
    size: `${Math.floor(Math.random() * 5) + 1}.${Math.floor(Math.random() * 9)} MB`
}));

export default function DocumentsPage() {
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/knowledge">
                    <Button variant="ghost" size="icon" className="rounded-full bg-card hover:bg-white/10">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold tracking-tight">Gestor de Documentos</h1>
                    <p className="text-muted-foreground text-sm">Explorador de recursos indexados en PGVector.</p>
                </div>
                <Button className="bg-primary hover:bg-primary/90">
                    <Upload className="w-4 h-4 mr-2" /> Upload Document
                </Button>
            </div>

            <Card className="bg-card/50 border-border">
                <CardHeader className="py-4 border-b border-border/50 flex flex-row items-center justify-between">
                    <div className="relative w-72">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar documento..."
                            className="pl-9 h-9 bg-black/20 border-border"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" size="sm" className="h-9"><Filter className="h-4 w-4 mr-2" /> Filtros Avanzados</Button>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="relative w-full overflow-auto max-h-[600px]">
                        <table className="w-full caption-bottom text-sm">
                            <thead className="sticky top-0 bg-card/95 backdrop-blur z-10 [&_tr]:border-b border-border/70">
                                <tr className="border-b transition-colors hover:bg-muted/50">
                                    <th className="h-10 px-4 text-left font-medium text-muted-foreground uppercase text-[10px] tracking-wider">Título</th>
                                    <th className="h-10 px-4 text-left font-medium text-muted-foreground uppercase text-[10px] tracking-wider">Colección</th>
                                    <th className="h-10 px-4 text-left font-medium text-muted-foreground uppercase text-[10px] tracking-wider">Tipo</th>
                                    <th className="h-10 px-4 text-left font-medium text-muted-foreground uppercase text-[10px] tracking-wider">Status</th>
                                    <th className="h-10 px-4 text-right font-medium text-muted-foreground uppercase text-[10px] tracking-wider">Chunks</th>
                                    <th className="h-10 px-4 text-right font-medium text-muted-foreground uppercase text-[10px] tracking-wider">Tamaño</th>
                                    <th className="h-10 px-4 text-right font-medium text-muted-foreground uppercase text-[10px] tracking-wider">Fecha Indexado</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {mockDocuments.map((doc) => (
                                    <tr key={doc.id} className="border-b border-border/30 transition-colors hover:bg-white/5">
                                        <td className="p-4 align-middle font-medium flex items-center gap-2">
                                            <FileText className={`w-4 h-4 ${doc.type === 'pdf' ? 'text-red-400' : 'text-blue-400'}`} />
                                            <span className="truncate max-w-[200px]" title={doc.title}>{doc.title}</span>
                                        </td>
                                        <td className="p-4 align-middle text-muted-foreground">{doc.collection}</td>
                                        <td className="p-4 align-middle text-muted-foreground uppercase text-[10px]">{doc.type}</td>
                                        <td className="p-4 align-middle">
                                            <Badge variant="outline" className={`text-[9px] uppercase ${doc.status === 'INDEXED' ? 'text-green-500 border-green-500/30 bg-green-500/10' :
                                                    doc.status === 'PROCESSING' ? 'text-yellow-500 border-yellow-500/30 bg-yellow-500/10' :
                                                        'text-red-500 border-red-500/30 bg-red-500/10'
                                                }`}>
                                                {doc.status}
                                            </Badge>
                                        </td>
                                        <td className="p-4 align-middle text-right text-muted-foreground font-mono">{doc.chunks}</td>
                                        <td className="p-4 align-middle text-right text-muted-foreground font-mono text-xs">{doc.size}</td>
                                        <td className="p-4 align-middle text-right text-muted-foreground text-xs">{doc.date}</td>
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
