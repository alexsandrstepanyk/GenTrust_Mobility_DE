import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    Building2, 
    FileText, 
    List, 
    MapPin, 
    Mail, 
    Phone, 
    DollarSign,
    Settings,
    Save,
    X,
    CheckCircle,
    AlertCircle
} from 'lucide-react';

const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3000/api';

interface DepartmentFormData {
    nameUa: string;
    nameEn?: string;
    color: string;
    icon: string;
    description: string;
    responsibilities: string[];
    regions: string[];
    contactEmail: string;
    contactPhone: string;
    budget: number;
    autoApproveReports: boolean;
    requiresPhotoForReports: boolean;
}

const DEFAULT_EMOJIS = [
    { icon: '🏢', label: 'Office' },
    { icon: '🛣️', label: 'Roads' },
    { icon: '💡', label: 'Lighting' },
    { icon: '🗑️', label: 'Waste' },
    { icon: '🌳', label: 'Parks' },
    { icon: '🚰', label: 'Water' },
    { icon: '🚌', label: 'Transport' },
    { icon: '🌿', label: 'Ecology' },
    { icon: '🎨', label: 'Vandalism' },
    { icon: '🏗️', label: 'Construction' },
    { icon: '⚡', label: 'Energy' },
    { icon: '🔥', label: 'Emergency' },
    { icon: '🚓', label: 'Police' },
    { icon: '🏥', label: 'Health' },
    { icon: '📚', label: 'Education' },
    { icon: '🏟️', label: 'Sports' },
];

const COLORS = [
    '#3B82F6', // Blue
    '#EF4444', // Red
    '#10B981', // Green
    '#F59E0B', // Amber
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#F97316', // Orange
    '#84CC16', // Lime
    '#6366F1', // Indigo
];

export default function CreateDepartmentScreen() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [newResponsibility, setNewResponsibility] = useState('');
    const [newRegion, setNewRegion] = useState('');

    const [formData, setFormData] = useState<DepartmentFormData>({
        nameUa: '',
        nameEn: '',
        color: '#3B82F6',
        icon: '🏢',
        description: '',
        responsibilities: [],
        regions: [],
        contactEmail: '',
        contactPhone: '',
        budget: 0,
        autoApproveReports: false,
        requiresPhotoForReports: true,
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else if (type === 'number') {
            setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const addResponsibility = () => {
        if (newResponsibility.trim()) {
            setFormData(prev => ({
                ...prev,
                responsibilities: [...prev.responsibilities, newResponsibility.trim()]
            }));
            setNewResponsibility('');
        }
    };

    const removeResponsibility = (index: number) => {
        setFormData(prev => ({
            ...prev,
            responsibilities: prev.responsibilities.filter((_, i) => i !== index)
        }));
    };

    const addRegion = () => {
        if (newRegion.trim()) {
            setFormData(prev => ({
                ...prev,
                regions: [...prev.regions, newRegion.trim()]
            }));
            setNewRegion('');
        }
    };

    const removeRegion = (index: number) => {
        setFormData(prev => ({
            ...prev,
            regions: prev.regions.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('auth_token') || localStorage.getItem('userToken');
            const autoNameEn = (formData.nameEn || '').trim() || formData.nameUa.trim();

            await axios.post(`${API_URL}/departments-manager/create`, {
                ...formData,
                nameEn: autoNameEn
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setSuccess(true);
            
            setTimeout(() => {
                navigate('/departments');
            }, 2000);
        } catch (err: any) {
            console.error('Create department error:', err);
            setError(err.response?.data?.error || 'Помилка створення департаменту');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Департамент створено!
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Департамент "{formData.nameUa}" успішно додано до системи.
                    </p>
                    <p className="text-sm text-gray-500">
                        Перенаправлення...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/departments')}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <h1 className="text-xl font-bold text-gray-900">
                            Створити новий департамент
                        </h1>
                    </div>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-6">
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        {error}
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Building2 className="w-5 h-5" />
                        Основна інформація
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Назва українською */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Назва департаменту *
                            </label>
                            <input
                                type="text"
                                name="nameUa"
                                value={formData.nameUa}
                                onChange={handleInputChange}
                                required
                                placeholder="напр. Департамент доріг"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Назва англійською */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Назва англійською (необов'язково)
                            </label>
                            <input
                                type="text"
                                name="nameEn"
                                value={formData.nameEn}
                                onChange={handleInputChange}
                                placeholder="e.g. Department of Roads"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Якщо не вказати, буде використано назву департаменту.
                            </p>
                        </div>

                        {/* Іконка */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Іконка (Emoji)
                            </label>
                            <div className="grid grid-cols-6 gap-2">
                                {DEFAULT_EMOJIS.map((emoji) => (
                                    <button
                                        key={emoji.icon}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, icon: emoji.icon }))}
                                        className={`p-2 text-2xl rounded-lg border-2 transition-all ${
                                            formData.icon === emoji.icon
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                        title={emoji.label}
                                    >
                                        {emoji.icon}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Колір */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Колір департаменту
                            </label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {COLORS.map((color) => (
                                    <button
                                        key={color}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, color }))}
                                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                                            formData.color === color
                                                ? 'border-gray-900 scale-110'
                                                : 'border-transparent hover:scale-105'
                                        }`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={formData.color}
                                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                                    className="w-10 h-8 border border-gray-300 rounded"
                                />
                                <input
                                    type="text"
                                    value={formData.color}
                                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                                    className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Опис */}
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <FileText className="w-4 h-4 inline mr-1" />
                            Чим займається департамент *
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            required
                            rows={4}
                            placeholder="Детально опишіть чим займається департамент..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Обов'язки */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <List className="w-5 h-5" />
                        Обов'язки департаменту
                    </h2>

                    <div className="flex gap-2 mb-4">
                        <input
                            type="text"
                            value={newResponsibility}
                            onChange={(e) => setNewResponsibility(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addResponsibility())}
                            placeholder="Додати обов'язок..."
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                        />
                        <button
                            type="button"
                            onClick={addResponsibility}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                            Додати
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {formData.responsibilities.map((resp, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                            >
                                {resp}
                                <button
                                    type="button"
                                    onClick={() => removeResponsibility(index)}
                                    className="hover:text-blue-900"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        ))}
                    </div>
                </div>

                {/* Регіони */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        Регіони відповідальності
                    </h2>

                    <div className="flex gap-2 mb-4">
                        <input
                            type="text"
                            value={newRegion}
                            onChange={(e) => setNewRegion(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRegion())}
                            placeholder="Додати регіон..."
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                        />
                        <button
                            type="button"
                            onClick={addRegion}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                            Додати
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {formData.regions.map((region, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm"
                            >
                                {region}
                                <button
                                    type="button"
                                    onClick={() => removeRegion(index)}
                                    className="hover:text-green-900"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        ))}
                    </div>
                </div>

                {/* Контакти та бюджет */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        Контакти та налаштування
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Mail className="w-4 h-4 inline mr-1" />
                                Email
                            </label>
                            <input
                                type="email"
                                name="contactEmail"
                                value={formData.contactEmail}
                                onChange={handleInputChange}
                                placeholder="department@example.com"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Phone className="w-4 h-4 inline mr-1" />
                                Телефон
                            </label>
                            <input
                                type="tel"
                                name="contactPhone"
                                value={formData.contactPhone}
                                onChange={handleInputChange}
                                placeholder="+380..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <DollarSign className="w-4 h-4 inline mr-1" />
                                Бюджет (€)
                            </label>
                            <input
                                type="number"
                                name="budget"
                                value={formData.budget}
                                onChange={handleInputChange}
                                min="0"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Налаштування */}
                    <div className="mt-4 space-y-3">
                        <label className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                name="autoApproveReports"
                                checked={formData.autoApproveReports}
                                onChange={handleInputChange}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">
                                Автоматичне затвердження звітів (без модерації)
                            </span>
                        </label>

                        <label className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                name="requiresPhotoForReports"
                                checked={formData.requiresPhotoForReports}
                                onChange={handleInputChange}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">
                                Вимагати фото для звітів
                            </span>
                        </label>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={() => navigate('/departments')}
                        className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                    >
                        Скасувати
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2 ${
                            loading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        {loading ? (
                            <>Створення...</>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                Створити департамент
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
