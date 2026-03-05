import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '../stores/auth.store';

export const useAuth = () => {
    const { isAuthenticated, user, logout } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Basic redirect logic if memory token drops but user is in a protected route
        if (!isAuthenticated && !pathname?.startsWith('/login')) {
            router.push('/login');
        }
        // Prevent viewing login page if already authenticated 
        else if (isAuthenticated && pathname === '/login') {
            router.push('/chat');
        }
    }, [isAuthenticated, pathname, router]);

    return { isAuthenticated, user, logout };
};
