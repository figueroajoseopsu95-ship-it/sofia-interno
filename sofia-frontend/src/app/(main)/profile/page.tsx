'use client';

import { useAuthStore } from '@/stores/auth.store';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Mail, Building, Briefcase, KeyRound } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function ProfilePage() {
    const { user } = useAuthStore();

    if (!user) return null;

    return (
        <div className="flex flex-col h-full bg-gray-50 p-6 md:p-8">
            <div className="max-w-3xl mx-auto w-full space-y-6">

                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Perfil de Usuario</h1>
                    <p className="text-sm text-gray-500">
                        Asegúrate que la metada incrustada en tu contexto RAG sea correcta. Si hallas errores, contacta a TI.
                    </p>
                </div>

                <Card className="overflow-hidden shadow-md border-0 ring-1 ring-gray-200">
                    <div className="h-24 bg-gradient-to-r from-primary to-accent relative" />

                    <CardContent className="px-6 pb-6 pt-0 relative">
                        <div className="flex justify-between items-end -mt-10 mb-4">
                            <Avatar className="h-20 w-20 border-4 border-white shadow-sm bg-white">
                                <AvatarFallback className="bg-primary/20 text-primary text-xl font-bold">
                                    {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <Badge className="mb-2 bg-black/80 hover:bg-black/80 text-white border-0 shadow-sm font-mono tracking-widest px-3 py-1">
                                E-CODE: {user.employeeCode || user.id.slice(0, 8).toUpperCase()}
                            </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                                        {user.firstName} {user.lastName}
                                    </h2>
                                    <p className="text-primary font-medium">{user.position || 'Colaborador'}</p>
                                </div>

                                <div className="space-y-3 mt-4">
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <Mail className="h-4 w-4 text-gray-400" />
                                        <span>{user.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <Building className="h-4 w-4 text-gray-400" />
                                        <span>Departamento Asignado (Mapeado por AD)</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <KeyRound className="h-4 w-4 text-gray-400" />
                                        <span className="capitalize">Rol del Sistema: <span className="font-bold">{user.role}</span></span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <CalendarDays className="h-4 w-4 text-gray-400" />
                                        <span>Cuenta creada hace X meses</span>
                                    </div>
                                </div>
                            </div>

                            {/* Stats Box */}
                            <div>
                                <div className="bg-gray-50 border rounded-xl p-5 space-y-4">
                                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                                        <Briefcase className="h-4 w-4 text-primary" /> Estadísticas de Uso RAG
                                    </h3>
                                    <Separator />
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Chats Totales</div>
                                            <div className="text-2xl font-bold text-gray-900">42</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Feedback</div>
                                            <div className="text-2xl font-bold text-gray-900">18</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Horas Reducidas</div>
                                            <div className="text-2xl font-bold text-green-600">~14h</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
