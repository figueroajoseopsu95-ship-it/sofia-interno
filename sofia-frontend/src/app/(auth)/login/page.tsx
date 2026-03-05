'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api } from '@/services/api';
import { useAuthStore } from '@/stores/auth.store';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const loginSchema = z.object({
    employeeCode: z.string().min(3, 'El código debe tener al menos 3 caracteres'),
    password: z.string().min(6, 'Mínimo 6 caracteres'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuthStore();
    const [errorDesc, setErrorDesc] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormValues) => {
        setErrorDesc('');
        try {
            const res = await api.post('/auth/login', {
                employeeCode: data.employeeCode,
                password: data.password,
            });
            // Save strictly to memory state
            login(res.data.user, res.data.accessToken, res.data.refreshToken);
            router.push('/chat');
        } catch (err: any) {
            setErrorDesc(err.response?.data?.message || 'Error de credenciales o servidor');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Card className="w-full max-w-md shadow-lg border-t-4 border-t-primary">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold text-primary">SOFIA</CardTitle>
                    <CardDescription>
                        Asistente Virtual - Credenciales Banesco
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {errorDesc && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm text-center font-medium">
                                {errorDesc}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Código de Empleado</label>
                            <Input
                                placeholder="Ej. E12345"
                                {...register('employeeCode')}
                                className={errors.employeeCode ? 'border-red-500' : ''}
                                autoComplete="off"
                            />
                            {errors.employeeCode && <p className="text-red-500 text-xs">{errors.employeeCode.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Contraseña Corporativa</label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                {...register('password')}
                                className={errors.password ? 'border-red-500' : ''}
                            />
                            {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
                        </div>

                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? 'Verificando...' : 'Iniciar Sesión Segura'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
