'use client';

import { useState } from 'react';
import { api } from '@/services/api';
import { Search, Loader2, BookOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface SearchResult {
    id: string;
    content: string;
    score: number;
    metadata: {
        pageNumber: number;
        sectionTitle: string;
        documentTitle: string;
        collection: string;
    };
}

export default function SearchPage() {
    const [query, setQuery] = useState('');
    const [collection, setCollection] = useState('ALL');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const collections = [
        { id: 'ALL', name: 'Todas' },
        { id: 'PSD', name: 'Procedimientos' },
        { id: 'PP', name: 'Políticas' },
        { id: 'FIN', name: 'Finanzas' },
        { id: 'GCB', name: 'Banca Comercial' }
    ];

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsLoading(true);
        setHasSearched(true);
        try {
            // Direct integration con RAG backend
            const res = await api.post('/search', {
                query,
                collectionCode: collection !== 'ALL' ? collection : undefined,
                topK: 10
            });
            setResults(res.data.results || []);
        } catch (err) {
            console.error(err);
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-50/50 p-6 md:p-8 overflow-y-auto">
            <div className="max-w-4xl mx-auto w-full space-y-8">

                {/* Header & Input */}
                <div className="text-center space-y-4 mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-primary">Motor de Búsqueda Vectorial</h1>
                    <p className="text-muted-foreground">Escribe en lenguaje natural. SOFIA entenderá el contexto de tu consulta a través de miles de documentos internos.</p>

                    <form onSubmit={handleSearch} className="flex gap-2 w-full max-w-3xl mx-auto mt-6">
                        <select
                            value={collection}
                            onChange={(e) => setCollection(e.target.value)}
                            className="px-4 border rounded-md bg-white text-sm font-medium focus:ring-2 focus:ring-primary/50 text-gray-700 outline-none w-40"
                        >
                            {collections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Ej. '¿Cuáles son los requisitos de liquidación anticipada en tarjetas black?'"
                                className="pl-10 h-10 w-full"
                            />
                        </div>
                        <Button type="submit" disabled={isLoading || !query.trim()} className="h-10 px-8">
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Descubrir'}
                        </Button>
                    </form>
                </div>

                {/* Results Area */}
                {hasSearched && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b pb-2">
                            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                                {results.length} Resultados Encontrados
                            </h3>
                        </div>

                        {results.length === 0 && !isLoading && (
                            <div className="text-center py-12 text-gray-500">
                                <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                <p>No se encontraron fragmentos relevantes en la base de conocimiento para tu consulta.</p>
                            </div>
                        )}

                        <div className="grid gap-4">
                            {results.map((result) => (
                                <Card key={result.id} className="overflow-hidden hover:border-primary/50 transition-colors">
                                    <CardContent className="p-5">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h4 className="text-lg font-semibold text-gray-800 tracking-tight leading-tight">
                                                    {result.metadata.documentTitle}
                                                </h4>
                                                <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-500">
                                                    <Badge variant="outline" className="text-[10px] font-medium">{result.metadata.collection}</Badge>
                                                    <span>•</span>
                                                    <span>Sección: {result.metadata.sectionTitle || 'General'}</span>
                                                    <span>•</span>
                                                    <span>Página {result.metadata.pageNumber}</span>
                                                </div>
                                            </div>

                                            {/* Relevance Score Pill */}
                                            <div className={`px-2 py-1 rounded-md flex items-center gap-1 shrink-0 ml-4 ${result.score > 0.85 ? 'bg-green-100 text-green-700' :
                                                    result.score > 0.65 ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-red-100 text-red-700'
                                                }`}>
                                                <span className="text-xs font-bold">{Math.round(result.score * 100)}% Relevancia</span>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 rounded-md p-3 border text-sm text-gray-700 prose prose-sm prose-slate max-w-none prose-p:my-1">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {result.content.length > 500 ? result.content.substring(0, 500) + '...' : result.content}
                                            </ReactMarkdown>
                                        </div>

                                        <div className="mt-4 flex justify-end">
                                            <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10">
                                                Abrir doc en visor completo →
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
