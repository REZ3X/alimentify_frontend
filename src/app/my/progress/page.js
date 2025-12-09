'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Navbar from '@/components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: "spring", stiffness: 100 }
    }
};

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

    const stats = useMemo(() => {
        if (!weeklyData.length || !healthProfile) return null;

        const daysWithMeals = weeklyData.filter(day => day.meals && day.meals.length > 0).length;
        const progressPercentage = Math.round((daysWithMeals / weeklyData.length) * 100);

        const targetCalories = healthProfile.daily_calories;
        const daysWithinRange = weeklyData.filter(day => {
            const consumed = day.daily_totals?.consumed?.calories || 0;
            if (consumed === 0) return false;
            const diff = Math.abs(consumed - targetCalories);
            return diff <= targetCalories * 0.1;
        }).length;
        const adherence = Math.round((daysWithinRange / weeklyData.length) * 100);

        const avgCalories = Math.round(weeklyData.reduce((sum, day) => sum + (day.daily_totals?.consumed?.calories || 0), 0) / weeklyData.length);

        return { progressPercentage, adherence, avgCalories };
    }, [weeklyData, healthProfile]);

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
            <div className="min-h-screen flex items-center justify-center bg-[#FEF3E2]">
                <div className="w-16 h-16 border-4 border-[#FAB12F] border-t-[#FA812F] rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user) return null;

    if (!healthProfile) {
        return (
            <div className="min-h-screen bg-[#FEF3E2] relative overflow-x-hidden font-sans selection:bg-[#FAB12F] selection:text-white pb-24 pt-28">
                <Navbar />
                <div className="max-w-4xl mx-auto px-4">
                    <div className="bg-white/60 backdrop-blur-xl rounded-4xl shadow-sm border border-white/50 p-12 text-center">
                        <div className="w-24 h-24 bg-[#FAB12F]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-12 h-12 text-[#FAB12F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Complete Health Survey First</h2>
                        <p className="text-gray-500 mb-8 font-medium">
                            Set up your health profile to start tracking your progress
                        </p>
                        <button
                            onClick={() => router.push('/my/health-survey')}
                            className="px-8 py-4 bg-linear-to-r from-[#FAB12F] to-[#FA812F] text-white rounded-2xl hover:opacity-90 transition-all font-bold shadow-lg shadow-[#FAB12F]/20 cursor-pointer"
                        >
                            Take Health Survey
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FEF3E2] relative overflow-x-hidden font-sans selection:bg-[#FAB12F] selection:text-white pb-24 pt-28">
            {/* Background Pattern */}
            <div className="fixed inset-0 z-0 opacity-40 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#FAB12F 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

            {/* Decorative Blobs */}
            <div className="fixed top-0 left-0 w-96 h-96 bg-[#FAB12F]/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0"></div>
            <div className="fixed bottom-0 right-0 w-96 h-96 bg-[#FA812F]/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none z-0"></div>

            <Navbar />

            <motion.main 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8"
            >
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push('/my')}
                            className="p-3 rounded-full bg-white/50 hover:bg-white text-gray-600 hover:text-[#FAB12F] transition-all duration-300 shadow-sm border border-white/50 group cursor-pointer"
                        >
                            <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Progress Dashboard</h1>
                            <p className="text-sm text-gray-500 font-medium font-mono">Track your nutrition journey 📈</p>
                        </div>
                    </div>

                    <div className="bg-white/40 backdrop-blur-md p-1.5 rounded-2xl border border-white/50 flex gap-1 shadow-sm relative">
                        {['week', 'month'].map((period) => (
                            <button
                                key={period}
                                onClick={() => setSelectedPeriod(period)}
                                className={`relative px-6 py-2.5 rounded-xl font-bold text-sm transition-colors cursor-pointer z-10 ${
                                    selectedPeriod === period ? 'text-white' : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                {selectedPeriod === period && (
                                    <motion.div
                                        layoutId="activePeriod"
                                        className="absolute inset-0 bg-[#FAB12F] rounded-xl shadow-md"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <span className="relative z-10 capitalize">Last {period === 'week' ? '7 Days' : '30 Days'}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {error && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-50/80 backdrop-blur-sm text-red-600 p-4 rounded-2xl text-sm font-medium border border-red-100 flex items-center gap-3"
                    >
                        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {error}
                    </motion.div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <motion.div variants={itemVariants} whileHover={{ y: -4 }} className="bg-white/60 backdrop-blur-xl rounded-4xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-500"></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Consistency</h3>
                                <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-black text-gray-900 tracking-tight">{stats?.progressPercentage || 0}%</span>
                                <span className="text-sm font-medium text-gray-500">logged</span>
                            </div>
                            <div className="mt-3 w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${stats?.progressPercentage || 0}%` }}
                                    transition={{ duration: 1, delay: 0.2 }}
                                    className="bg-blue-500 h-full rounded-full"
                                />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} whileHover={{ y: -4 }} className="bg-white/60 backdrop-blur-xl rounded-4xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-green-100/50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-500"></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Adherence</h3>
                                <div className="w-10 h-10 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 shadow-sm">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                                </div>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-black text-gray-900 tracking-tight">{stats?.adherence || 0}%</span>
                                <span className="text-sm font-medium text-gray-500">on target</span>
                            </div>
                            <div className="mt-3 w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${stats?.adherence || 0}%` }}
                                    transition={{ duration: 1, delay: 0.3 }}
                                    className="bg-green-500 h-full rounded-full"
                                />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} whileHover={{ y: -4 }} className="bg-white/60 backdrop-blur-xl rounded-4xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100/50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-500"></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Avg Intake</h3>
                                <div className="w-10 h-10 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 shadow-sm">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                </div>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-black text-gray-900 tracking-tight">{stats?.avgCalories || 0}</span>
                                <span className="text-sm font-medium text-gray-500">kcal/day</span>
                            </div>
                            <div className="mt-3 flex items-center gap-2 text-xs font-medium text-gray-400">
                                <span>Target: {Math.round(healthProfile.daily_calories)}</span>
                                <div className="flex-1 h-px bg-gray-200"></div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Calorie Trend Chart */}
                <motion.div variants={itemVariants} className="bg-white/60 backdrop-blur-xl rounded-4xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Calorie Trend</h2>
                            <p className="text-sm text-gray-500">Daily intake vs Target</p>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold bg-white/50 px-3 py-1.5 rounded-lg border border-white/60">
                            <div className="w-3 h-3 bg-[#FAB12F] rounded-full"></div>
                            <span className="text-gray-600">Intake</span>
                            <div className="w-3 h-3 border-2 border-dashed border-gray-300 ml-2"></div>
                            <span className="text-gray-600">Target</span>
                        </div>
                    </div>
                    
                    <div className="relative h-72 w-full">
                        {/* Target Line */}
                        <div className="absolute left-0 right-0 border-t-2 border-dashed border-gray-300 z-0 flex items-center pointer-events-none" style={{ top: '50%' }}>
                            <div className="absolute right-0 -top-3 bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                {Math.round(healthProfile.daily_calories)} kcal
                            </div>
                        </div>

                        {/* Scrollable Bars Area */}
                        <div className="overflow-x-auto h-full w-full pb-4 px-2 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-gray-100/50 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300/80 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-[#FAB12F] [&::-webkit-scrollbar-thumb]:transition-colors cursor-grab active:cursor-grabbing">
                            <div className="flex items-end h-full relative z-10 pt-6" style={{ minWidth: selectedPeriod === 'month' ? '250%' : '100%', gap: selectedPeriod === 'month' ? '16px' : '24px', paddingRight: '16px' }}>
                                {weeklyData.map((day, index) => {
                                    const calories = day.daily_totals?.consumed?.calories || 0;
                                    const targetCalories = healthProfile.daily_calories;
                                    const maxCalories = Math.max(getMaxValue('calories'), targetCalories * 1.2);
                                    const heightPercent = calories > 0 ? (calories / maxCalories) * 100 : 0;
                                    const isOverTarget = calories > targetCalories;
                                    const isCloseToTarget = Math.abs(calories - targetCalories) <= targetCalories * 0.1;

                                    return (
                                        <div key={index} className="flex-1 flex flex-col items-center group h-full justify-end" style={{ minWidth: selectedPeriod === 'month' ? '48px' : 'auto' }}>
                                            <div className="w-full relative cursor-pointer flex flex-col justify-end h-[85%]">
                                                <motion.div
                                                    initial={{ height: 0 }}
                                                    animate={{ height: `${heightPercent}%` }}
                                                    transition={{ duration: 0.8, delay: index * 0.05, type: "spring" }}
                                                    className={`w-full rounded-t-2xl relative overflow-hidden ${
                                                        calories === 0 ? 'bg-gray-100' : 
                                                        isCloseToTarget ? 'bg-green-400' : 
                                                        isOverTarget ? 'bg-red-400' : 'bg-[#FAB12F]'
                                                    }`}
                                                    style={{ minHeight: calories > 0 ? '12px' : '4px' }}
                                                >
                                                    {/* Glass Shine Effect */}
                                                    <div className="absolute inset-0 bg-linear-to-b from-white/30 to-transparent opacity-50"></div>
                                                    
                                                    {/* Tooltip */}
                                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-20 translate-y-2 group-hover:translate-y-0">
                                                        <div className="bg-gray-900/90 backdrop-blur-md text-white text-xs rounded-xl py-2 px-3 whitespace-nowrap shadow-xl z-50">
                                                            <div className="font-bold mb-0.5">{formatDate(day.date)}</div>
                                                            <div className="font-mono text-[#FAB12F]">{Math.round(calories)} cal</div>
                                                            <div className="text-gray-400 text-[10px]">{day.meals?.length || 0} meals</div>
                                                        </div>
                                                        <div className="w-2 h-2 bg-gray-900/90 rotate-45 absolute left-1/2 -translate-x-1/2 -bottom-1"></div>
                                                    </div>
                                                </motion.div>
                                            </div>
                                            <div className="h-[15%] flex items-center justify-center">
                                                <div className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider group-hover:text-[#FAB12F] transition-colors whitespace-nowrap">
                                                    {selectedPeriod === 'week' ? getDayName(day.date) : formatDate(day.date)}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Average Macros */}
                    <motion.div variants={itemVariants} className="bg-white/60 backdrop-blur-xl rounded-4xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50">
                        <h2 className="text-2xl font-black text-gray-900 mb-8 tracking-tight">Average Daily Macros</h2>
                        <div className="space-y-8">
                            {[
                                { label: 'Protein', key: 'protein_g', color: 'blue', target: healthProfile.protein_g },
                                { label: 'Carbs', key: 'carbs_g', color: 'orange', target: healthProfile.carbs_g },
                                { label: 'Fat', key: 'fat_g', color: 'purple', target: healthProfile.fat_g }
                            ].map((macro, idx) => (
                                <div key={macro.key}>
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-sm font-bold text-gray-600 flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full bg-${macro.color}-500`}></span>
                                            {macro.label}
                                        </span>
                                        <span className={`text-sm font-black text-${macro.color}-600`}>
                                            {getWeeklyAverage(macro.key)}g <span className="text-gray-400 font-medium">/ {Math.round(macro.target)}g</span>
                                        </span>
                                    </div>
                                    <div className="w-full bg-white rounded-full h-4 overflow-hidden shadow-inner border border-gray-100">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min((getWeeklyAverage(macro.key) / macro.target) * 100, 100)}%` }}
                                            transition={{ duration: 1, ease: "easeOut", delay: idx * 0.2 }}
                                            className={`bg-${macro.color}-500 h-full rounded-full shadow-lg shadow-${macro.color}-500/20 relative`}
                                        >
                                            <div className="absolute inset-0 bg-linear-to-b from-white/30 to-transparent"></div>
                                        </motion.div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Macro Distribution */}
                    <motion.div variants={itemVariants} className="bg-white/60 backdrop-blur-xl rounded-4xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50">
                        <h2 className="text-2xl font-black text-gray-900 mb-8 tracking-tight">Macro Distribution</h2>
                        <div className="flex items-center justify-center h-full pb-4">
                            {(() => {
                                const protein = getWeeklyAverage('protein_g');
                                const carbs = getWeeklyAverage('carbs_g');
                                const fat = getWeeklyAverage('fat_g');
                                const total = protein * 4 + carbs * 4 + fat * 9;
                                
                                if (total === 0) {
                                    return (
                                        <div className="text-center text-gray-400 py-8">
                                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                </svg>
                                            </div>
                                            <p className="font-medium">No data available</p>
                                            <p className="text-sm mt-1 opacity-70">Start logging meals to see your macro distribution</p>
                                        </div>
                                    );
                                }

                                const proteinPercent = Math.round((protein * 4 / total) * 100);
                                const carbsPercent = Math.round((carbs * 4 / total) * 100);
                                const fatPercent = Math.round((fat * 9 / total) * 100);

                                return (
                                    <div className="w-full">
                                        <div className="flex items-center justify-center mb-8">
                                            <div className="relative w-64 h-64">
                                                <motion.div
                                                    initial={{ rotate: -90, opacity: 0 }}
                                                    animate={{ rotate: 0, opacity: 1 }}
                                                    transition={{ duration: 1, type: "spring" }}
                                                    className="w-full h-full rounded-full shadow-xl"
                                                    style={{
                                                        background: `conic-gradient(
                                                            #3b82f6 0% ${proteinPercent}%,
                                                            #f97316 ${proteinPercent}% ${proteinPercent + carbsPercent}%,
                                                            #a855f7 ${proteinPercent + carbsPercent}% 100%
                                                        )`,
                                                    }}
                                                ></motion.div>
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-40 h-40 bg-[#FEF3E2] rounded-full flex items-center justify-center shadow-inner border-4 border-white/50">
                                                        <div className="text-center">
                                                            <div className="text-3xl font-black text-gray-900 tracking-tight">{Math.round(total / weeklyData.length)}</div>
                                                            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">avg cal/day</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                            {[
                                                { label: 'Protein', percent: proteinPercent, color: 'blue' },
                                                { label: 'Carbs', percent: carbsPercent, color: 'orange' },
                                                { label: 'Fat', percent: fatPercent, color: 'purple' }
                                            ].map((item) => (
                                                <div key={item.label} className="text-center p-3 bg-white/40 rounded-2xl border border-white/50 hover:bg-white/60 transition-colors">
                                                    <div className={`w-3 h-3 bg-${item.color}-500 rounded-full mx-auto mb-2 shadow-sm shadow-${item.color}-500/50`}></div>
                                                    <div className="text-lg font-black text-gray-900">{item.percent}%</div>
                                                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{item.label}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    </motion.div>
                </div>

                {/* Quick Actions */}
                <motion.div variants={itemVariants} className="bg-white/60 backdrop-blur-xl rounded-4xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50">
                    <h2 className="text-2xl font-black text-gray-900 mb-8 tracking-tight">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { title: 'Log Meal', desc: 'Track your food', icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6', color: 'green', path: '/my/meals' },
                            { title: 'Scan Food', desc: 'AI analysis', icon: 'M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z', color: 'indigo', path: '/my/scan' },
                            { title: 'Update Profile', desc: 'Edit health data', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z', color: 'purple', path: '/my/health-survey' }
                        ].map((action, idx) => (
                            <motion.button
                                key={idx}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => router.push(action.path)}
                                className="p-6 bg-white/50 border border-white/60 rounded-3xl hover:bg-white hover:shadow-lg transition-all text-left group cursor-pointer relative overflow-hidden"
                            >
                                <div className={`absolute top-0 right-0 w-24 h-24 bg-${action.color}-100/30 rounded-full blur-xl -translate-y-1/2 translate-x-1/2 group-hover:bg-${action.color}-100/50 transition-colors`}></div>
                                <div className="flex items-center gap-4 relative z-10">
                                    <div className={`w-14 h-14 bg-${action.color}-100/50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                                        <svg className={`w-7 h-7 text-${action.color}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={action.icon} />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg group-hover:text-[#FAB12F] transition-colors">{action.title}</h3>
                                        <p className="text-sm text-gray-500 font-medium">{action.desc}</p>
                                    </div>
                                </div>
                            </motion.button>
                        ))}
                    </div>
                </motion.div>
            </motion.main>
        </div>
    );
}
