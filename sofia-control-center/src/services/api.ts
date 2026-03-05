import axios from 'axios';

// Control Center instance. It relies on JWT token with Admin/Superadmin roles.
export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1/control',
    headers: {
        'Content-Type': 'application/json',
    },
});

export const apiCore = axios.create({
    baseURL: process.env.NEXT_PUBLIC_CORE_URL || 'http://localhost:4000/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        // Attempt local JWT fetch (simplified for mock scaffold)
        const token = typeof window !== 'undefined' ? localStorage.getItem('SOFIA_ADMIN_TOKEN') : null;
        if (token && config.headers) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);
