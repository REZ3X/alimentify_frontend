'use client';

import { useState, useEffect, use } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';

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
        if (percent >= 80) return 'text-green-600 bg-green-100/50 border-green-200';
        if (percent >= 60) return 'text-[#FAB12F] bg-[#FAB12F]/10 border-[#FAB12F]/20';
        return 'text-red-600 bg-red-100/50 border-red-200';
    };

    const getProgressBarColor = (percent) => {
        if (percent >= 80) return 'bg-green-500';
        if (percent >= 60) return 'bg-[#FAB12F]';
        return 'bg-red-500';
    };

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
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100
            }
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FEF3E2]">
                <div className="w-16 h-16 border-4 border-[#FAB12F] border-t-[#FA812F] rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user) return null;

    if (error) {
        return (
            <div className="min-h-screen bg-[#FEF3E2] p-6 flex items-center justify-center font-sans">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="max-w-md w-full bg-white/60 backdrop-blur-xl rounded-4xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 p-8 text-center"
                >
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Error Loading Report</h2>
                    <p className="text-gray-600 mb-8 font-medium">{error}</p>
                    <button
                        onClick={() => router.push('/my/reports')}
                        className="w-full py-4 bg-linear-to-r from-[#FAB12F] to-[#FA812F] text-white rounded-2xl hover:shadow-lg hover:shadow-orange-500/30 transition-all font-bold tracking-wide cursor-pointer"
                    >
                        Back to Reports
                    </button>
                </motion.div>
            </div>
        );
    }

    if (!report) return null;

    return (
        <div className="min-h-screen bg-[#FEF3E2] relative overflow-x-hidden font-sans selection:bg-[#FAB12F] selection:text-white pb-24 pt-28">
            {/* Background Pattern */}
            <div className="fixed inset-0 z-0 opacity-40 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#FAB12F 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

            {/* Decorative Blobs */}
            <div className="fixed top-0 left-0 w-96 h-96 bg-[#FAB12F]/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0"></div>
            <div className="fixed bottom-0 right-0 w-96 h-96 bg-[#FA812F]/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none z-0"></div>

            <Navbar />

            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8"
            >
                {/* Header Section */}
                <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push('/my/reports')}
                            className="p-3 rounded-full bg-white/50 hover:bg-white text-gray-600 hover:text-[#FAB12F] transition-all duration-300 shadow-sm border border-white/50 group cursor-pointer"
                        >
                            <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <span className="px-3 py-1 bg-[#FAB12F]/10 text-[#FA812F] border border-[#FAB12F]/20 rounded-full text-xs font-bold uppercase tracking-wider">
                                    {report.report_type}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${report.status === 'completed' ? 'bg-green-100/50 text-green-700 border-green-200' : 'bg-blue-100/50 text-blue-700 border-blue-200'}`}>
                                    {report.status}
                                </span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
                                Nutrition Report
                            </h1>
                            <p className="text-gray-500 font-medium font-mono text-sm flex items-center gap-2 mt-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {formatDate(report.start_date)} - {formatDate(report.end_date)}
                            </p>
                        </div>
                    </div>
                    
                    <div className={`px-8 py-4 rounded-3xl text-center backdrop-blur-md border shadow-sm ${report.goal_achieved ? 'bg-green-100/50 border-green-200' : 'bg-[#FAB12F]/10 border-[#FAB12F]/20'}`}>
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Goal Status</p>
                        <p className={`text-xl font-black ${report.goal_achieved ? 'text-green-700' : 'text-[#FA812F]'}`}>
                            {report.goal_achieved ? '🎉 Achieved!' : '⏳ In Progress'}
                        </p>
                    </div>
                </motion.div>

                {/* Summary Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <motion.div variants={itemVariants} className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 p-6 hover:bg-white/80 transition-colors">
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Total Days</p>
                        <p className="text-4xl font-black text-gray-800">{report.total_days}</p>
                    </motion.div>
                    <motion.div variants={itemVariants} className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 p-6 hover:bg-white/80 transition-colors">
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Days Logged</p>
                        <div className="flex items-baseline gap-2">
                            <p className="text-4xl font-black text-blue-600">{report.days_logged}</p>
                            <span className="text-xs font-bold text-gray-500 bg-white/50 px-2 py-1 rounded-full border border-white/60">
                                {Math.round((report.days_logged / report.total_days) * 100)}%
                            </span>
                        </div>
                    </motion.div>
                    <motion.div variants={itemVariants} className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 p-6 hover:bg-white/80 transition-colors">
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Total Meals</p>
                        <p className="text-4xl font-black text-green-600">{report.total_meals}</p>
                    </motion.div>
                    <motion.div variants={itemVariants} className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 p-6 hover:bg-white/80 transition-colors">
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Streak</p>
                        <p className="text-4xl font-black text-[#FA812F]">{report.streak_days} <span className="text-2xl">🔥</span></p>
                    </motion.div>
                </div>

                {/* Nutrition Averages */}
                <motion.div 
                    variants={itemVariants}
                    className="bg-white/60 backdrop-blur-xl rounded-4xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 p-8 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#FAB12F]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                    
                    <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3 tracking-tight relative z-10">
                        <span className="w-10 h-10 bg-[#FAB12F]/20 rounded-2xl flex items-center justify-center text-[#FA812F]">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </span>
                        Daily Averages
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 relative z-10">
                        <div className="text-center p-6 bg-white/50 rounded-3xl border border-white/60 hover:shadow-lg transition-all group">
                            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Calories</p>
                            <p className="text-3xl font-black text-gray-800 group-hover:scale-110 transition-transform duration-300">{Math.round(report.avg_calories)}</p>
                            <p className="text-xs font-medium text-gray-400 mt-1 font-mono">kcal/day</p>
                        </div>
                        <div className="text-center p-6 bg-blue-50/50 rounded-3xl border border-blue-100 hover:shadow-lg transition-all group">
                            <p className="text-xs font-bold uppercase tracking-wider text-blue-600/70 mb-2">Protein</p>
                            <p className="text-3xl font-black text-blue-600 group-hover:scale-110 transition-transform duration-300">{Math.round(report.avg_protein_g)}</p>
                            <p className="text-xs font-medium text-blue-400 mt-1 font-mono">g/day</p>
                        </div>
                        <div className="text-center p-6 bg-[#FAB12F]/10 rounded-3xl border border-[#FAB12F]/20 hover:shadow-lg transition-all group">
                            <p className="text-xs font-bold uppercase tracking-wider text-[#FA812F]/70 mb-2">Carbs</p>
                            <p className="text-3xl font-black text-[#FA812F] group-hover:scale-110 transition-transform duration-300">{Math.round(report.avg_carbs_g)}</p>
                            <p className="text-xs font-medium text-[#FAB12F] mt-1 font-mono">g/day</p>
                        </div>
                        <div className="text-center p-6 bg-purple-50/50 rounded-3xl border border-purple-100 hover:shadow-lg transition-all group">
                            <p className="text-xs font-bold uppercase tracking-wider text-purple-600/70 mb-2">Fat</p>
                            <p className="text-3xl font-black text-purple-600 group-hover:scale-110 transition-transform duration-300">{Math.round(report.avg_fat_g)}</p>
                            <p className="text-xs font-medium text-purple-400 mt-1 font-mono">g/day</p>
                        </div>
                    </div>
                </motion.div>

                {/* Goal Compliance */}
                <motion.div 
                    variants={itemVariants}
                    className="bg-white/60 backdrop-blur-xl rounded-4xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 p-8 relative overflow-hidden"
                >
                    <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3 tracking-tight">
                        <span className="w-10 h-10 bg-green-100 rounded-2xl flex items-center justify-center text-green-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </span>
                        Goal Compliance
                    </h2>
                    <div className="space-y-8">
                        {/* Calories */}
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-sm font-bold text-gray-700">Calories</span>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getComplianceColor(report.calories_compliance_percent)}`}>
                                    {Math.round(report.calories_compliance_percent)}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200/50 rounded-full h-4 overflow-hidden p-0.5">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(report.calories_compliance_percent, 100)}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className={`h-full rounded-full shadow-sm ${getProgressBarColor(report.calories_compliance_percent)}`}
                                ></motion.div>
                            </div>
                        </div>

                        {/* Macros Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Protein */}
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-sm font-bold text-gray-700">Protein</span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getComplianceColor(report.protein_compliance_percent)}`}>
                                        {Math.round(report.protein_compliance_percent)}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200/50 rounded-full h-3 overflow-hidden p-0.5">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(report.protein_compliance_percent, 100)}%` }}
                                        transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                                        className={`h-full rounded-full shadow-sm ${getProgressBarColor(report.protein_compliance_percent)}`}
                                    ></motion.div>
                                </div>
                            </div>

                            {/* Carbs */}
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-sm font-bold text-gray-700">Carbs</span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getComplianceColor(report.carbs_compliance_percent)}`}>
                                        {Math.round(report.carbs_compliance_percent)}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200/50 rounded-full h-3 overflow-hidden p-0.5">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(report.carbs_compliance_percent, 100)}%` }}
                                        transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                                        className={`h-full rounded-full shadow-sm ${getProgressBarColor(report.carbs_compliance_percent)}`}
                                    ></motion.div>
                                </div>
                            </div>

                            {/* Fat */}
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-sm font-bold text-gray-700">Fat</span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getComplianceColor(report.fat_compliance_percent)}`}>
                                        {Math.round(report.fat_compliance_percent)}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200/50 rounded-full h-3 overflow-hidden p-0.5">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(report.fat_compliance_percent, 100)}%` }}
                                        transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
                                        className={`h-full rounded-full shadow-sm ${getProgressBarColor(report.fat_compliance_percent)}`}
                                    ></motion.div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-200/50 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
                            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Days On Target</p>
                            <div className="flex items-baseline gap-2">
                                <p className="text-2xl font-black text-gray-900">{report.days_on_target}</p>
                                <p className="text-sm font-medium text-gray-500">/ {report.days_logged} days</p>
                            </div>
                        </div>
                        <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
                            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Goal Type</p>
                            <p className="text-lg font-bold text-gray-900 capitalize">{report.goal_type.replace('_', ' ')}</p>
                        </div>
                    </div>
                </motion.div>

                {/* Best Day & Weight Progress */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Best Day */}
                    {report.best_day_date && (
                        <motion.div variants={itemVariants} className="bg-white/60 backdrop-blur-xl rounded-4xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 p-8">
                            <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3 tracking-tight">
                                <span className="w-10 h-10 bg-yellow-100 rounded-2xl flex items-center justify-center text-yellow-600">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                    </svg>
                                </span>
                                Best Day
                            </h2>
                            <div className="text-center py-6 bg-white/50 rounded-3xl border border-white/60">
                                <p className="text-gray-500 mb-3 font-medium font-mono">{formatDate(report.best_day_date)}</p>
                                <div className="inline-flex items-center px-6 py-3 bg-green-100/50 text-green-800 rounded-full border border-green-200/50">
                                    <span className="text-3xl font-black">{Math.round(report.best_day_compliance)}%</span>
                                    <span className="ml-2 text-sm font-bold uppercase tracking-wider">compliance</span>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Weight Progress */}
                    {report.starting_weight && (
                        <motion.div variants={itemVariants} className="bg-white/60 backdrop-blur-xl rounded-4xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 p-8">
                            <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3 tracking-tight">
                                <span className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                                    </svg>
                                </span>
                                Weight Progress
                            </h2>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-4 bg-white/50 rounded-2xl border border-white/60">
                                    <span className="text-gray-500 text-sm font-medium">Starting Weight</span>
                                    <span className="font-black text-gray-800 text-lg">{report.starting_weight?.toFixed(1)} kg</span>
                                </div>
                                <div className="flex justify-between items-center p-4 bg-white/50 rounded-2xl border border-white/60">
                                    <span className="text-gray-500 text-sm font-medium">Current Weight</span>
                                    <span className="font-black text-gray-800 text-lg">{report.ending_weight?.toFixed(1)} kg</span>
                                </div>
                                <div className="flex justify-between items-center p-4 bg-white/50 rounded-2xl border border-white/60">
                                    <span className="text-gray-500 text-sm font-medium">Change</span>
                                    <span className={`font-black text-lg ${report.weight_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {report.weight_change >= 0 ? '+' : ''}{report.weight_change?.toFixed(1)} kg
                                    </span>
                                </div>
                                {report.target_weight && (
                                    <div className="flex justify-between items-center p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                                        <span className="text-blue-700 text-sm font-bold">Target Weight</span>
                                        <span className="font-black text-blue-700 text-lg">{report.target_weight?.toFixed(1)} kg</span>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Report Info */}
                <motion.div variants={itemVariants} className="text-center text-sm text-gray-400 font-medium font-mono pb-8">
                    <p>Report generated on {formatDate(report.generated_at)}</p>
                </motion.div>
            </motion.div>
        </div>
    );
}
