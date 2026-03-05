'use client';

import { useAdminStore } from '@/stores/admin.store';
import { useRouter } from 'next/navigation';
import { Bell, LogOut, Settings, Clock, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export function Header() {
    const { user, logout } = useAdminStore();
    const router = useRouter();
    const [timeRange, setTimeRange] = useState('24h');

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    return (
        <header className="h-16 shrink-0 border-b border-border bg-card flex items-center justify-between px-6 sticky top-0 z-10 w-full shadow-sm">
            <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold text-foreground tracking-tight hidden md:block">
                    Visión Global Operativa
                </h2>

                {/* Time Range Selector */}
                <div className="flex items-center gap-1 bg-background/50 p-1 rounded-md border text-sm">
                    <Button variant={timeRange === '24h' ? 'secondary' : 'ghost'} size="sm" onClick={() => setTimeRange('24h')} className="h-7 text-xs">24h</Button>
                    <Button variant={timeRange === '7d' ? 'secondary' : 'ghost'} size="sm" onClick={() => setTimeRange('7d')} className="h-7 text-xs">7 Días</Button>
                    <Button variant={timeRange === '30d' ? 'secondary' : 'ghost'} size="sm" onClick={() => setTimeRange('30d')} className="h-7 text-xs">30 Días</Button>
                </div>
            </div>

            <div className="flex items-center gap-3">

                <Button variant="ghost" size="icon" className="text-muted-foreground relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-destructive animate-pulse" />
                </Button>

                <div className="w-px h-6 bg-border mx-1" />

                <div className="flex items-center gap-3">
                    <div className="hidden md:flex flex-col items-end">
                        <span className="text-sm font-semibold text-foreground leading-none">
                            {user?.firstName} {user?.lastName}
                        </span>
                        <span className="text-[10px] text-primary font-mono uppercase tracking-wider mt-1">
                            {user?.role || 'SYSTEM ADMIN'}
                        </span>
                    </div>

                    <UserCircle className="h-8 w-8 text-muted-foreground" />
                </div>

                <Button variant="ghost" size="icon" onClick={handleLogout} className="text-red-400 hover:text-red-300 hover:bg-red-400/10 ml-2">
                    <LogOut className="h-4 w-4" />
                </Button>
            </div>
        </header>
    );
}
