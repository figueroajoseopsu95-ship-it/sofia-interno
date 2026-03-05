import { Loader2 } from 'lucide-react';

export function TypingIndicator() {
    return (
        <div className="flex items-center gap-2 p-4 bg-white border text-gray-500 rounded-xl rounded-tl-sm shadow-sm w-fit max-w-[85%]">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-sm font-medium animate-pulse">SOFIA está procesando la solicitud...</span>
        </div>
    );
}
