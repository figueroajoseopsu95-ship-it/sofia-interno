import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';

interface MessageInputProps {
    onSend: (message: string) => void;
    disabled?: boolean;
}

export function MessageInput({ onSend, disabled }: MessageInputProps) {
    const [content, setContent] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleInput = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
    };

    useEffect(() => {
        handleInput();
    }, [content]);

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!content.trim() || disabled) return;
        onSend(content.trim());
        setContent('');
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="relative flex items-end w-full max-w-4xl mx-auto bg-white border border-gray-300 rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-primary/50 overflow-hidden pr-2">
            <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Pregúntale a SOFIA..."
                disabled={disabled}
                className="flex-1 max-h-[120px] min-h-[44px] w-full resize-none bg-transparent px-4 py-3 text-sm outline-none placeholder:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                rows={1}
            />
            <div className="pb-2">
                <Button
                    type="submit"
                    size="icon"
                    disabled={!content.trim() || disabled}
                    className="h-8 w-8 rounded-full bg-primary hover:bg-primary/90 shadow-md transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                >
                    <Send className="h-4 w-4 text-white" />
                </Button>
            </div>
        </form>
    );
}
