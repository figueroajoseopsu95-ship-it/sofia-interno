'use client';

import { useAuth } from '@/hooks/use-auth';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { useUiStore } from '@/stores/ui.store';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useAuth();
    const { sidebarOpen } = useUiStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || !isAuthenticated) {
        return null; // Prevents hydration flicker & protects render before router kick
    }

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            {/* Dynamic Sidebar */}
            <Sidebar />

            {/* Main Container */}
            <div
                className={cn(
                    "flex flex-col flex-1 transition-all duration-300 ease-in-out",
                    sidebarOpen ? "ml-64 bg-white" : "ml-0 bg-white"
                )}
            >
                <Header />

                <main className="flex-1 overflow-auto relative">
                    {children}
                </main>
            </div>
        </div>
    );
}
