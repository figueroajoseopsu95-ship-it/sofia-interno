import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, User } from 'lucide-react';
import { FeedbackWidget } from './feedback-widget';
import { SourceCitation } from './source-citation';
import type { Message } from '@/stores/chat.store';

interface MessageBubbleProps {
    message: Message;
    agentMetadata?: { name: string; latency?: number; model?: string };
}

export function MessageBubble({ message, agentMetadata }: MessageBubbleProps) {
    const isUser = message.role === 'user';

    return (
        <div className={`flex flex-col w-full ${isUser ? 'items-end' : 'items-start'}`}>

            {/* Sender Avatar & Name */}
            <div className={`flex items-center gap-2 mb-1 px-1 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                {isUser ? (
                    <>
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                            <User className="h-3 w-3 text-primary" />
                        </div>
                        <span className="text-xs font-medium text-gray-500">Tú</span>
                    </>
                ) : (
                    <>
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0">
                            <ShieldCheck className="h-3 w-3 text-white" />
                        </div>
                        <span className="text-xs font-bold text-gray-800 tracking-tight">SOFIA</span>
                        {agentMetadata?.name && (
                            <Badge variant="secondary" className="text-[9px] h-4 px-1.5 ml-1">
                                {agentMetadata.name}
                            </Badge>
                        )}
                    </>
                )}
            </div>

            {/* Bubble Container */}
            <div
                className={`px-4 py-3 rounded-2xl max-w-[85%] text-[14px] leading-relaxed shadow-sm ${isUser
                        ? 'bg-primary text-primary-foreground rounded-tr-sm border border-primary/20'
                        : 'bg-white border-gray-200 border rounded-tl-sm text-gray-800'
                    }`}
            >
                {/* prose-invert on user messages: forces white text over dark bg-primary.
                    prose-slate on assistant messages: dark text over white bg. */}
                <div className={`prose prose-sm max-w-none break-words ${isUser ? 'prose-invert' : 'prose-slate'}`}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.content}
                    </ReactMarkdown>
                </div>
            </div>

            {/* Assistant Lower Widgets (Metadata, Sources, Feedback) */}
            {!isUser && (
                <div className="w-full flex flex-col items-start mt-1 pl-1">

                    {/* Diagnostic Info */}
                    {agentMetadata?.latency && (
                        <span className="text-[10px] text-gray-400 mt-0.5">
                            Generado por {agentMetadata.model || 'LLM'} en {agentMetadata.latency}ms
                        </span>
                    )}

                    {/* Render Sources if attached */}
                    {message.sources && message.sources.length > 0 && (
                        <SourceCitation sources={message.sources} />
                    )}

                    {/* Request User Feedback rating */}
                    <FeedbackWidget messageId={message.id} />
                </div>
            )}

        </div>
    );
}
