'use client';

import { create } from 'zustand';

interface AuthState {
    token: string | null;
    user: any | null;
    login: (token: string, user: any) => void;
    logout: () => void;
}

export const useAdminStore = create<AuthState>((set) => ({
    token: typeof window !== 'undefined' ? localStorage.getItem('SOFIA_ADMIN_TOKEN') : null,
    user: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('SOFIA_ADMIN_USER') || 'null') : null,

    login: (token, user) => {
        localStorage.setItem('SOFIA_ADMIN_TOKEN', token);
        localStorage.setItem('SOFIA_ADMIN_USER', JSON.stringify(user));
        set({ token, user });
    },

    logout: () => {
        localStorage.removeItem('SOFIA_ADMIN_TOKEN');
        localStorage.removeItem('SOFIA_ADMIN_USER');
        set({ token: null, user: null });
    }
}));
