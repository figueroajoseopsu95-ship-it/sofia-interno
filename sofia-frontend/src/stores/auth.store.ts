import { create } from 'zustand';

interface User {
    id: string;
    employeeCode: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    status: string;
    position?: string | null;
}

interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    login: (user: User, accessToken: string, refreshToken: string) => void;
    logout: () => void;
    setTokens: (accessToken: string, refreshToken: string) => void;
}

// In-memory token storage (NO localStorage/sessionStorage) per security requirement
export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,

    login: (user, accessToken, refreshToken) => {
        set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
        });
    },

    logout: () => {
        set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
        });
    },

    setTokens: (accessToken, refreshToken) => {
        set({
            accessToken,
            refreshToken,
        });
    },
}));
