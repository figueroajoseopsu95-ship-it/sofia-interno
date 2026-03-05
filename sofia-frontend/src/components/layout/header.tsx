'use client';

import { useAuthStore } from '@/stores/auth.store';
import { useUiStore } from '@/stores/ui.store';
import { useRouter } from 'next/navigation';
import { Menu, LogOut, Code, User as UserIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

export function Header() {
    const { user, logout } = useAuthStore();
    const { toggleSidebar } = useUiStore();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    if (!user) return null;

    return (
        <header className="h-16 shrink-0 border-b flex items-center justify-between px-4 bg-white sticky top-0 z-10 w-full">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={toggleSidebar} aria-label="Toggle Sidebar">
                    <Menu className="h-5 w-5 text-gray-600" />
                </Button>
                <div>
                    <h2 className="text-lg font-semibold text-gray-800 tracking-tight">SOFIA Workspace</h2>
                    <p className="text-xs text-muted-foreground">Internal Knowledge AI</p>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="hidden md:flex flex-col items-end">
                    <span className="text-sm font-medium text-gray-800 tracking-tight">
                        {user.firstName} {user.lastName}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Code className="h-3 w-3" /> {user.role.toUpperCase()}
                    </span>
                </div>

                <Avatar className="border-2 border-primary">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                    </AvatarFallback>
                </Avatar>

                <Button variant="ghost" size="icon" onClick={handleLogout} title="Cerrar Sesión" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                    <LogOut className="h-5 w-5" />
                </Button>
            </div>
        </header>
    );
}
