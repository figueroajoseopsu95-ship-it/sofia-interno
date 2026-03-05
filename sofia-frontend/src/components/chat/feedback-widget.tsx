import { useState } from 'react';
import { ThumbsUp, ThumbsDown, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/services/api';

interface FeedbackWidgetProps {
    messageId: string;
}

export function FeedbackWidget({ messageId }: FeedbackWidgetProps) {
    const [status, setStatus] = useState<'not_rated' | 'positive' | 'negative'>('not_rated');
    const [showNegativeForm, setShowNegativeForm] = useState(false);
    const [comment, setComment] = useState('');
    const [category, setCategory] = useState('incorrect_info');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const submitFeedback = async (rating: 1 | 2 | 3 | 4 | 5, cat?: string, notes?: string) => {
        setIsSubmitting(true);
        try {
            await api.post('/feedback', {
                messageId,
                rating,
                category: cat,
                comment: notes
            });
            setStatus(rating >= 4 ? 'positive' : 'negative');
            setShowNegativeForm(false);
        } catch (error) {
            console.error('Error submitting feedback', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (status === 'positive') {
        return <div className="mt-2 flex items-center gap-1 text-[11px] text-green-600"><ThumbsUp className="w-3 h-3 fill-current" /> Gracias por tu ayuda.</div>;
    }

    if (status === 'negative') {
        return <div className="mt-2 flex items-center gap-1 text-[11px] text-primary"><ThumbsDown className="w-3 h-3 fill-current" /> Reporte recibido, ajustaremos a SOFIA.</div>;
    }

    return (
        <div className="mt-2 flex flex-col gap-2">
            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => submitFeedback(5)}
                    className="h-6 w-6 rounded-full hover:bg-green-100 hover:text-green-700 text-gray-400"
                    title="Buena respuesta"
                >
                    <ThumbsUp className="h-3 w-3" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowNegativeForm(!showNegativeForm)}
                    className="h-6 w-6 rounded-full hover:bg-red-100 hover:text-red-700 text-gray-400"
                    title="Mala respuesta"
                >
                    <ThumbsDown className="h-3 w-3" />
                </Button>
            </div>

            {showNegativeForm && (
                <div className="flex items-center gap-2 w-full max-w-sm mt-1 animate-in slide-in-from-top-2 fade-in">
                    <select
                        className="h-8 text-[11px] border border-gray-200 rounded-md bg-white text-gray-700 px-2"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        <option value="incorrect_info">Información Incorrecta</option>
                        <option value="outdated">Desactualizada</option>
                        <option value="incomplete">Incompleta</option>
                        <option value="off_topic">Fuera de Contexto</option>
                    </select>
                    <Input
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="¿Qué falló?"
                        className="h-8 text-[11px] placeholder:text-[11px] flex-1 border-gray-200"
                    />
                    <Button
                        size="sm"
                        onClick={() => submitFeedback(1, category, comment)}
                        disabled={isSubmitting}
                        className="h-8 w-8 px-0 shrink-0"
                    >
                        <Send className="w-3 h-3" />
                    </Button>
                </div>
            )}
        </div>
    );
}
