import { useState } from 'react';
import { ChevronDown, ChevronUp, FileText } from 'lucide-react';

interface Source {
    title: string;
    page?: number;
    score: number;
    highlight?: string;
}

export function SourceCitation({ sources }: { sources: Source[] }) {
    const [expandedIndices, setExpandedIndices] = useState<number[]>([]);

    if (!sources || sources.length === 0) return null;

    const toggleExpand = (index: number) => {
        setExpandedIndices(prev =>
            prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
        );
    };

    return (
        <div className="mt-3 flex flex-col gap-2 w-full max-w-[85%]">
            <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Fuentes Consultadas
            </div>
            <div className="flex flex-wrap gap-2">
                {sources.map((source, idx) => (
                    <div key={idx} className="bg-white border rounded-lg shadow-sm w-full sm:w-80 overflow-hidden">
                        <div
                            className="flex items-center justify-between p-2 cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => toggleExpand(idx)}
                        >
                            <div className="flex items-center gap-2 overflow-hidden">
                                <FileText className="h-4 w-4 text-primary shrink-0" />
                                <span className="text-xs font-medium text-gray-800 truncate" title={source.title}>
                                    {source.title}
                                </span>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${source.score > 0.8 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    {Math.round(source.score * 100)}%
                                </span>

                                {source.page && (
                                    <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                                        Pag {source.page}
                                    </span>
                                )}
                                {expandedIndices.includes(idx) ? <ChevronUp className="h-3 w-3 text-gray-500" /> : <ChevronDown className="h-3 w-3 text-gray-500" />}
                            </div>
                        </div>

                        {expandedIndices.includes(idx) && source.highlight && (
                            <div className="p-2 pt-0 text-[11px] text-gray-600 bg-gray-50/50 border-t italic ml-6">
                                "...{source.highlight}..."
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
