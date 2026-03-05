'use client';

import { useAdminStore } from '@/stores/admin.store';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { token, user } = useAdminStore();
    const router = useRouter();
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Basic auth guard for the dashboard area
    useEffect(() => {
        if (mounted) {
            if (!token || !user) {
                router.push('/login');
            } else if (pathname === '/login') {
                router.push('/dashboard');
            }
        }
    }, [token, user, mounted, router, pathname]);

    if (!mounted || !token) {
        return <div className="min-h-screen bg-background" />; // Prevent hydration flicker
    }

    return (
        <div className="flex h-screen overflow-hidden bg-background font-sans dark text-foreground">
            <Sidebar />
            <div className="flex flex-col flex-1 min-w-0">
                <Header />
                <main className="flex-1 overflow-auto relative p-6 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
