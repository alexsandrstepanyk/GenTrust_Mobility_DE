import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, Building2, Mail, Phone, DollarSign, Users, FileText } from 'lucide-react';

const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3000/api';

interface Department {
    id: string;
    slug: string;
    nameUa: string;
    nameEn: string;
    color: string;
    icon: string;
    description: string;
    status: string;
    budget: number;
    contactEmail?: string;
    contactPhone?: string;
    _count?: {
        users: number;
        reports: number;
    };
}

export default function Departments() {
    const navigate = useNavigate();
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            const token = localStorage.getItem('auth_token') || localStorage.getItem('userToken');
            const response = await axios.get(`${API_URL}/departments-manager`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setDepartments(response.data);
        } catch (err: any) {
            console.error('Error fetching departments:', err);
            setError(err.response?.data?.error || 'Помилка завантаження департаментів');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Завантаження департаментів...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">
                        🏢 Департаменти
                    </h1>
                    <button
                        onClick={() => navigate('/departments/create')}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        Створити департамент
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto p-6">
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                {departments.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                        <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">
                            Департаментів ще немає
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Створіть перший департамент для управління містом
                        </p>
                        <button
                            onClick={() => navigate('/departments/create')}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                        >
                            <Plus className="w-5 h-5" />
                            Створити департамент
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {departments.map((dept) => (
                            <div
                                key={dept.id}
                                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                                style={{ borderTop: `4px solid ${dept.color}` }}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <span className="text-4xl">{dept.icon}</span>
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900">
                                                {dept.nameUa}
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                {dept.nameEn}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        dept.status === 'ACTIVE'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-gray-100 text-gray-700'
                                    }`}>
                                        {dept.status === 'ACTIVE' ? '✅ Активний' : '⏸️ Неактивний'}
                                    </span>
                                </div>

                                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                    {dept.description}
                                </p>

                                <div className="space-y-2 text-sm text-gray-600">
                                    {dept.contactEmail && (
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-4 h-4" />
                                            <span className="truncate">{dept.contactEmail}</span>
                                        </div>
                                    )}
                                    {dept.contactPhone && (
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-4 h-4" />
                                            <span>{dept.contactPhone}</span>
                                        </div>
                                    )}
                                    {dept.budget > 0 && (
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="w-4 h-4" />
                                            <span>€{dept.budget.toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <FileText className="w-4 h-4" />
                                        <span>{dept._count?.reports || 0} звітів</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4" />
                                        <span>{dept._count?.users || 0} співробітників</span>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                                    <button
                                        onClick={() => navigate(`/departments/${dept.id}`)}
                                        className="flex-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                                    >
                                        Деталі
                                    </button>
                                    <button
                                        onClick={() => navigate(`/departments/${dept.slug}`)}
                                        className="flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Dashboard
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
