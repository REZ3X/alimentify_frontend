'use client';

import { useState, useEffect, use } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function ReportDetailPage({ params }) {
    const resolvedParams = use(params);
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/login');
        } else if (user && resolvedParams.id) {
            fetchReport();
        }
    }, [user, authLoading, router, resolvedParams.id]);

    const fetchReport = async () => {
        try {
            setLoading(true);
            const data = await api.getReportById(resolvedParams.id);
            setReport(data.report);
        } catch (err) {
            console.error('Error fetching report:', err);
            setError(err.message || 'Failed to load report');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getComplianceColor = (percent) => {
        if (percent >= 80) return 'text-green-600 bg-green-100';
        if (percent >= 60) return 'text-yellow-600 bg-yellow-100';
        return 'text-red-600 bg-red-100';
    };

    const getProgressBarColor = (percent) => {
        if (percent >= 80) return 'bg-green-500';
        if (percent >= 60) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50">
                <div className="text-xl text-gray-600">Loading...</div>
            </div>
        );
    }

    if (!user) return null;

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                        <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Report</h2>
                        <p className="text-gray-600 mb-6">{error}</p>
                        <button
                            onClick={() => router.push('/my/reports')}
                            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                        >
                            Back to Reports
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!report) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-6">
            <div className="max-w-5xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => router.push('/my/reports')}
                    className="mb-6 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Reports
                </button>

                {/* Header */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">
                                {report.report_type} Report
                            </h1>
                            <p className="text-gray-600">
                                {formatDate(report.start_date)} - {formatDate(report.end_date)}
                            </p>
                        </div>
                        <div className={`px-6 py-3 rounded-xl text-center ${report.goal_achieved ? 'bg-green-100' : 'bg-yellow-100'}`}>
                            <p className="text-sm font-medium text-gray-600">Goal Status</p>
                            <p className={`text-xl font-bold ${report.goal_achieved ? 'text-green-700' : 'text-yellow-700'}`}>
                                {report.goal_achieved ? '🎉 Achieved!' : '⏳ In Progress'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <p className="text-sm text-gray-500 mb-1">Total Days</p>
                        <p className="text-3xl font-bold text-gray-900">{report.total_days}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <p className="text-sm text-gray-500 mb-1">Days Logged</p>
                        <p className="text-3xl font-bold text-blue-600">{report.days_logged}</p>
                        <p className="text-xs text-gray-500">{Math.round((report.days_logged / report.total_days) * 100)}% compliance</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <p className="text-sm text-gray-500 mb-1">Total Meals</p>
                        <p className="text-3xl font-bold text-green-600">{report.total_meals}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <p className="text-sm text-gray-500 mb-1">Streak</p>
                        <p className="text-3xl font-bold text-orange-500">{report.streak_days} 🔥</p>
                    </div>
                </div>

                {/* Nutrition Averages */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">📊 Daily Nutrition Averages</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="text-center p-4 bg-red-50 rounded-xl">
                            <p className="text-sm text-gray-600 mb-2">Avg Calories</p>
                            <p className="text-3xl font-bold text-red-600">{Math.round(report.avg_calories)}</p>
                            <p className="text-xs text-gray-500">kcal/day</p>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-xl">
                            <p className="text-sm text-gray-600 mb-2">Avg Protein</p>
                            <p className="text-3xl font-bold text-blue-600">{Math.round(report.avg_protein_g)}</p>
                            <p className="text-xs text-gray-500">g/day</p>
                        </div>
                        <div className="text-center p-4 bg-orange-50 rounded-xl">
                            <p className="text-sm text-gray-600 mb-2">Avg Carbs</p>
                            <p className="text-3xl font-bold text-orange-600">{Math.round(report.avg_carbs_g)}</p>
                            <p className="text-xs text-gray-500">g/day</p>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-xl">
                            <p className="text-sm text-gray-600 mb-2">Avg Fat</p>
                            <p className="text-3xl font-bold text-purple-600">{Math.round(report.avg_fat_g)}</p>
                            <p className="text-xs text-gray-500">g/day</p>
                        </div>
                    </div>
                </div>

                {/* Goal Compliance */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">🎯 Goal Compliance</h2>
                    <div className="space-y-6">
                        {/* Calories */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-gray-700">Calories Compliance</span>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getComplianceColor(report.calories_compliance_percent)}`}>
                                    {Math.round(report.calories_compliance_percent)}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                                <div
                                    className={`h-3 rounded-full transition-all ${getProgressBarColor(report.calories_compliance_percent)}`}
                                    style={{ width: `${Math.min(report.calories_compliance_percent, 100)}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Protein */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-gray-700">Protein Compliance</span>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getComplianceColor(report.protein_compliance_percent)}`}>
                                    {Math.round(report.protein_compliance_percent)}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                                <div
                                    className={`h-3 rounded-full transition-all ${getProgressBarColor(report.protein_compliance_percent)}`}
                                    style={{ width: `${Math.min(report.protein_compliance_percent, 100)}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Carbs */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-gray-700">Carbs Compliance</span>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getComplianceColor(report.carbs_compliance_percent)}`}>
                                    {Math.round(report.carbs_compliance_percent)}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                                <div
                                    className={`h-3 rounded-full transition-all ${getProgressBarColor(report.carbs_compliance_percent)}`}
                                    style={{ width: `${Math.min(report.carbs_compliance_percent, 100)}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Fat */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-gray-700">Fat Compliance</span>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getComplianceColor(report.fat_compliance_percent)}`}>
                                    {Math.round(report.fat_compliance_percent)}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                                <div
                                    className={`h-3 rounded-full transition-all ${getProgressBarColor(report.fat_compliance_percent)}`}
                                    style={{ width: `${Math.min(report.fat_compliance_percent, 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Days On Target</p>
                                <p className="text-2xl font-bold text-gray-900">{report.days_on_target} / {report.days_logged} days</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Goal Type</p>
                                <p className="text-lg font-semibold text-gray-900 capitalize">{report.goal_type.replace('_', ' ')}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Best Day & Weight Progress */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Best Day */}
                    {report.best_day_date && (
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">🏆 Best Day</h2>
                            <div className="text-center">
                                <p className="text-sm text-gray-600 mb-2">{formatDate(report.best_day_date)}</p>
                                <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full">
                                    <span className="text-2xl font-bold">{Math.round(report.best_day_compliance)}%</span>
                                    <span className="ml-2 text-sm">compliance</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Weight Progress */}
                    {report.starting_weight && (
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">💪 Weight Progress</h2>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Starting Weight</span>
                                    <span className="font-semibold">{report.starting_weight?.toFixed(1)} kg</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Current Weight</span>
                                    <span className="font-semibold">{report.ending_weight?.toFixed(1)} kg</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Change</span>
                                    <span className={`font-semibold ${report.weight_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {report.weight_change >= 0 ? '+' : ''}{report.weight_change?.toFixed(1)} kg
                                    </span>
                                </div>
                                {report.target_weight && (
                                    <div className="flex justify-between pt-2 border-t">
                                        <span className="text-gray-600">Target Weight</span>
                                        <span className="font-semibold text-blue-600">{report.target_weight?.toFixed(1)} kg</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Report Info */}
                <div className="bg-gray-50 rounded-xl p-4 text-center text-sm text-gray-600">
                    <p>Report generated on {formatDate(report.generated_at)}</p>
                    <p className="text-xs mt-1">
                        Status: <span className="font-medium capitalize">{report.status}</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
