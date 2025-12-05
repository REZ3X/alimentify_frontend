'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function ProgressPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const [weeklyData, setWeeklyData] = useState([]);
    const [healthProfile, setHealthProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedPeriod, setSelectedPeriod] = useState('week'); 
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/login');
        } else if (user) {
            fetchData();
        }
    }, [user, authLoading, router, selectedPeriod]);

    const fetchData = async () => {
        setLoading(true);
        setError(null);

        try {

            const profile = await api.getHealthProfile();
            setHealthProfile(profile);

            const days = selectedPeriod === 'week' ? 7 : 30;
            const promises = [];
            const dates = [];

            for (let i = days - 1; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dateString = date.toISOString().split('T')[0];
                dates.push(dateString);
                promises.push(
                    api.getDailyMeals(dateString).catch(err => {
                        console.error(`Error fetching meals for ${dateString}:`, err);
                        return { meals: [], daily_totals: null, date: dateString };
                    })
                );
            }

            const results = await Promise.all(promises);
            setWeeklyData(results);
        } catch (err) {
            console.error('Error fetching progress data:', err);
            setError(err.message || 'Failed to load progress data');
        } finally {
            setLoading(false);
        }
    };

    const getWeeklyAverage = (nutrient) => {
        if (!weeklyData.length) return 0;
        const total = weeklyData.reduce((sum, day) => {
            return sum + (day.daily_totals?.consumed?.[nutrient] || 0);
        }, 0);
        return Math.round(total / weeklyData.length);
    };

    const getMaxValue = (nutrient) => {
        if (!weeklyData.length) return 0;
        return Math.max(...weeklyData.map(day => day.daily_totals?.consumed?.[nutrient] || 0));
    };

    const getProgressPercentage = () => {
        if (!healthProfile || !weeklyData.length) return 0;

        const daysWithMeals = weeklyData.filter(day =>
            day.meals && day.meals.length > 0
        ).length;

        return Math.round((daysWithMeals / weeklyData.length) * 100);
    };

    const getCalorieAdherence = () => {
        if (!healthProfile || !weeklyData.length) return 0;

        const targetCalories = healthProfile.daily_calories;
        const daysWithinRange = weeklyData.filter(day => {
            const consumed = day.daily_totals?.consumed?.calories || 0;
            if (consumed === 0) return false;
            const diff = Math.abs(consumed - targetCalories);
            return diff <= targetCalories * 0.1;         }).length;

        return Math.round((daysWithinRange / weeklyData.length) * 100);
    };

    const getDayName = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { weekday: 'short' });
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50">
                <div className="text-xl text-gray-600">Loading...</div>
            </div>
        );
    }

    if (!user) return null;

    if (!healthProfile) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Health Survey First</h2>
                        <p className="text-gray-600 mb-6">
                            Set up your health profile to start tracking your progress
                        </p>
                        <button
                            onClick={() => router.push('/my/health-survey')}
                            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                        >
                            Take Health Survey
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-6">
            <div className="max-w-7xl mx-auto">
                                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">📈 Progress Dashboard</h1>
                    <p className="text-gray-600">Track your nutrition journey and achievements</p>
                </div>

                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                                <div className="mb-6 flex gap-4">
                    <button
                        onClick={() => setSelectedPeriod('week')}
                        className={`px-6 py-2 rounded-lg font-medium transition-colors ${selectedPeriod === 'week'
                                ? 'bg-green-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        Last 7 Days
                    </button>
                    <button
                        onClick={() => setSelectedPeriod('month')}
                        className={`px-6 py-2 rounded-lg font-medium transition-colors ${selectedPeriod === 'month'
                                ? 'bg-green-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        Last 30 Days
                    </button>
                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-gray-600">Tracking Progress</h3>
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mb-2">{getProgressPercentage()}%</div>
                        <p className="text-sm text-gray-600">Days with meals logged</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-gray-600">Calorie Adherence</h3>
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mb-2">{getCalorieAdherence()}%</div>
                        <p className="text-sm text-gray-600">Days within target (±10%)</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-gray-600">Daily Target</h3>
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mb-2">{Math.round(healthProfile.daily_calories)}</div>
                        <p className="text-sm text-gray-600">Calories per day</p>
                    </div>
                </div>

                                <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Calorie Intake Trend</h2>
                    <div className="relative h-64">
                                                <div className="absolute left-0 right-0 border-t-2 border-dashed border-green-500" style={{ top: '50%' }}>
                            <span className="absolute -left-2 -top-6 text-xs text-green-600 font-medium">
                                Target: {Math.round(healthProfile.daily_calories)}
                            </span>
                        </div>

                                                <div className="flex items-end justify-around h-full gap-2">
                            {weeklyData.map((day, index) => {
                                const calories = day.daily_totals?.consumed?.calories || 0;
                                const targetCalories = healthProfile.daily_calories;
                                const maxCalories = Math.max(getMaxValue('calories'), targetCalories * 1.2);
                                const heightPercent = calories > 0 ? (calories / maxCalories) * 100 : 0;
                                const isOverTarget = calories > targetCalories;
                                const isCloseToTarget = Math.abs(calories - targetCalories) <= targetCalories * 0.1;

                                return (
                                    <div key={index} className="flex-1 flex flex-col items-center">
                                        <div className="w-full relative group cursor-pointer">
                                            <div
                                                className={`w-full rounded-t-lg transition-all ${calories === 0
                                                        ? 'bg-gray-200'
                                                        : isCloseToTarget
                                                            ? 'bg-green-500 hover:bg-green-600'
                                                            : isOverTarget
                                                                ? 'bg-red-500 hover:bg-red-600'
                                                                : 'bg-orange-500 hover:bg-orange-600'
                                                    }`}
                                                style={{ height: `${heightPercent}%`, minHeight: calories > 0 ? '8px' : '4px' }}
                                            >
                                                                                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                                    <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap">
                                                        <div className="font-bold">{formatDate(day.date)}</div>
                                                        <div>{Math.round(calories)} cal</div>
                                                        <div className="text-gray-300">{day.meals?.length || 0} meals</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-600 mt-2 font-medium">
                                            {selectedPeriod === 'week' ? getDayName(day.date) : formatDate(day.date)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                                        <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Average Daily Macros</h2>
                        <div className="space-y-6">
                                                        <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-gray-700">Protein</span>
                                    <span className="text-sm font-bold text-blue-600">
                                        {getWeeklyAverage('protein_g')}g / {Math.round(healthProfile.protein_g)}g
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className="bg-blue-500 h-3 rounded-full transition-all"
                                        style={{ width: `${Math.min((getWeeklyAverage('protein_g') / healthProfile.protein_g) * 100, 100)}%` }}
                                    ></div>
                                </div>
                            </div>

                                                        <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-gray-700">Carbs</span>
                                    <span className="text-sm font-bold text-orange-600">
                                        {getWeeklyAverage('carbs_g')}g / {Math.round(healthProfile.carbs_g)}g
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className="bg-orange-500 h-3 rounded-full transition-all"
                                        style={{ width: `${Math.min((getWeeklyAverage('carbs_g') / healthProfile.carbs_g) * 100, 100)}%` }}
                                    ></div>
                                </div>
                            </div>

                                                        <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-gray-700">Fat</span>
                                    <span className="text-sm font-bold text-purple-600">
                                        {getWeeklyAverage('fat_g')}g / {Math.round(healthProfile.fat_g)}g
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className="bg-purple-500 h-3 rounded-full transition-all"
                                        style={{ width: `${Math.min((getWeeklyAverage('fat_g') / healthProfile.fat_g) * 100, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>

                                        <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Macro Distribution</h2>
                        <div className="flex items-center justify-center">
                            {(() => {
                                const protein = getWeeklyAverage('protein_g');
                                const carbs = getWeeklyAverage('carbs_g');
                                const fat = getWeeklyAverage('fat_g');
                                const total = protein * 4 + carbs * 4 + fat * 9; 
                                if (total === 0) {
                                    return (
                                        <div className="text-center text-gray-500 py-12">
                                            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                            </svg>
                                            <p>No data available</p>
                                            <p className="text-sm mt-2">Start logging meals to see your macro distribution</p>
                                        </div>
                                    );
                                }

                                const proteinPercent = Math.round((protein * 4 / total) * 100);
                                const carbsPercent = Math.round((carbs * 4 / total) * 100);
                                const fatPercent = Math.round((fat * 9 / total) * 100);

                                return (
                                    <div className="w-full">
                                        <div className="flex items-center justify-center mb-6">
                                            <div className="relative w-48 h-48">
                                                                                                <div
                                                    className="w-full h-full rounded-full"
                                                    style={{
                                                        background: `conic-gradient(
                                                            #3b82f6 0% ${proteinPercent}%,
                                                            #f97316 ${proteinPercent}% ${proteinPercent + carbsPercent}%,
                                                            #a855f7 ${proteinPercent + carbsPercent}% 100%
                                                        )`,
                                                    }}
                                                ></div>
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center">
                                                        <div className="text-center">
                                                            <div className="text-2xl font-bold text-gray-900">{Math.round(total / weeklyData.length)}</div>
                                                            <div className="text-xs text-gray-600">avg cal/day</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="text-center">
                                                <div className="w-4 h-4 bg-blue-500 rounded-full mx-auto mb-2"></div>
                                                <div className="text-sm font-bold text-gray-900">{proteinPercent}%</div>
                                                <div className="text-xs text-gray-600">Protein</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="w-4 h-4 bg-orange-500 rounded-full mx-auto mb-2"></div>
                                                <div className="text-sm font-bold text-gray-900">{carbsPercent}%</div>
                                                <div className="text-xs text-gray-600">Carbs</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="w-4 h-4 bg-purple-500 rounded-full mx-auto mb-2"></div>
                                                <div className="text-sm font-bold text-gray-900">{fatPercent}%</div>
                                                <div className="text-xs text-gray-600">Fat</div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                </div>

                                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button
                            onClick={() => router.push('/my/meals')}
                            className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all text-left"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Log Meal</h3>
                                    <p className="text-sm text-gray-600">Track your food</p>
                                </div>
                            </div>
                        </button>

                        <button
                            onClick={() => router.push('/my/scan')}
                            className="p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Scan Food</h3>
                                    <p className="text-sm text-gray-600">AI analysis</p>
                                </div>
                            </div>
                        </button>

                        <button
                            onClick={() => router.push('/my/health-survey')}
                            className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all text-left"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Update Profile</h3>
                                    <p className="text-sm text-gray-600">Edit health data</p>
                                </div>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
