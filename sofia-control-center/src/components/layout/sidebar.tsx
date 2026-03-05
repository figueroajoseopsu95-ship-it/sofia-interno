'use client';

import { cn } from '@/lib/utils';
import {
    LayoutDashboard, Bot, MessageSquare, Database,
    BarChart4, MessageCircleWarning, ScrollText,
    Workflow, ShieldAlert
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const navItems = [
        { name: 'Dashboard Global', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Análitica de Agentes', href: '/agents', icon: Bot },
        { name: 'Conversaciones', href: '/conversations', icon: MessageSquare },
        { name: 'Base RAG', href: '/knowledge', icon: Database },
        { name: 'Finanzas & Costos', href: '/analytics', icon: BarChart4 },
        { name: 'Radar de Feedback', href: '/feedback', icon: MessageCircleWarning },
        { name: 'Logs del Sistema', href: '/logs', icon: ScrollText },
        { name: 'Integración n8n', href: '/n8n', icon: Workflow },
        { name: 'Monitor de Seguridad', href: '/security', icon: ShieldAlert },
    ];

    return (
        <aside className="w-64 flex-shrink-0 flex flex-col border-r border-border bg-card h-full">
            <div className="flex items-center gap-3 px-6 h-16 border-b border-border shrink-0">
                <div className="bg-primary relative rounded w-8 h-8 flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                    S
                </div>
                <div>
                    <span className="text-base font-bold tracking-tight text-foreground block leading-tight">SOFIA</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest block font-mono">Control Center</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">
                    Módulos de Gestión
                </div>
                {navItems.map((item) => {
                    const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                    return (
                        <button
                            key={item.href}
                            onClick={() => router.push(item.href)}
                            className={cn(
                                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                                isActive
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                            )}
                        >
                            <item.icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-muted-foreground")} />
                            {item.name}
                        </button>
                    )
                })}
            </div>

            <div className="p-4 border-t border-border shrink-0">
                <div className="bg-secondary p-3 rounded-lg border border-white/5">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-xs font-medium text-foreground">Core Services Online</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-tight">
                        Conectado a sofia-backend v1.0. RAG Engine y APIs responsivos.
                    </p>
                </div>
            </div>
        </aside>
    );
}
