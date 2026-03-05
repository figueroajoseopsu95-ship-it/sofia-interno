'use client';

import { useAdminStore } from '@/stores/admin.store';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiCore } from '@/services/api';

export default function AdminLoginPage() {
    const { login } = useAdminStore();
    const [employeeCode, setEmployeeCode] = useState('');
    const [password, setPassword] = useState('');
    const [errorDesc, setErrorDesc] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorDesc('');

        try {
            // Usamos el endpoint del Core principal (sofia-backend)
            const res = await apiCore.post('/auth/login', { employeeCode, password });

            if (res.data.user.role !== 'admin' && res.data.user.role !== 'superadmin') {
                setErrorDesc('Acceso denegado: Se requieren permisos de nivel 3 (Administrador) para ingresar a este portal.');
                setIsLoading(false);
                return;
            }

            login(res.data.accessToken, res.data.user);
            router.push('/dashboard');
        } catch (err: any) {
            setErrorDesc(err.response?.data?.message || 'Error validando identidad del administrador');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
            {/* Visual background for Operations Center vibe */}
            <div className="absolute inset-0 z-0 bg-slate-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />

            <Card className="w-full max-w-md shadow-2xl border-white/10 bg-black/40 backdrop-blur-xl z-10 relative">
                <CardHeader className="text-center pb-4">
                    <div className="mx-auto bg-primary/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 border border-primary/50">
                        <span className="text-primary font-bold text-2xl">SOFIA</span>
                    </div>
                    <CardTitle className="text-2xl font-bold text-white tracking-tight">Control Center</CardTitle>
                    <CardDescription className="text-gray-400">
                        Acceso Exclusivo para Operaciones y TI
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        {errorDesc && (
                            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-md text-sm text-center">
                                {errorDesc}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Admin ID (Cód. Empleado)</label>
                            <Input
                                placeholder="Ej. E12345"
                                value={employeeCode}
                                onChange={(e) => setEmployeeCode(e.target.value)}
                                className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-primary h-11"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Access Token / Password</label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-primary h-11"
                            />
                        </div>

                        <Button type="submit" className="w-full h-11 mt-4 bg-primary hover:bg-primary/90 text-white font-medium" disabled={isLoading}>
                            {isLoading ? 'Autenticando en Directorio...' : 'Autorizar Ingreso'}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <div className="absolute bottom-6 text-center text-[10px] text-gray-600 uppercase tracking-widest z-10 font-mono">
                Banesco Banco Universal - Security Level 3 Required
            </div>
        </div>
    );
}
