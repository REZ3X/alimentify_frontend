'use client';

import { useState, useEffect } from 'react';
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

export default function ReportsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const [showCustomForm, setShowCustomForm] = useState(false);
    const [customReportType, setCustomReportType] = useState('weekly');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [sendEmail, setSendEmail] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/login');
        } else if (user) {
            fetchReports();
        }
    }, [user, authLoading, router]);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const data = await api.getUserReports();
            setReports(data.reports || []);
        } catch (err) {
            console.error('Error fetching reports:', err);
            setError(err.message || 'Failed to load reports');
        } finally {
            setLoading(false);
        }
    };

    const generateQuickReport = async (reportType) => {
        setGenerating(true);
        setError(null);
        setSuccess(null);

        try {
            const today = new Date();
            let startDate, endDate;

            endDate = today.toISOString().split('T')[0];

            switch (reportType) {
                case 'weekly':
                    startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                    break;
                case 'monthly':
                    startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                    break;
                case 'yearly':
                    startDate = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                    break;
                default:
                    throw new Error('Invalid report type');
            }

            const result = await api.generateReport(reportType, startDate, endDate, true);
            setSuccess(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report generated and sent to your email!`);
            await fetchReports();
        } catch (err) {
            console.error('Error generating report:', err);
            setError(err.message || 'Failed to generate report');
        } finally {
            setGenerating(false);
        }
    };

    const generateCustomReport = async (e) => {
        e.preventDefault();
        setGenerating(true);
        setError(null);
        setSuccess(null);

        try {
            if (!customStartDate || !customEndDate) {
                throw new Error('Please select both start and end dates');
            }

            if (new Date(customStartDate) > new Date(customEndDate)) {
                throw new Error('Start date must be before end date');
            }

            const result = await api.generateReport(customReportType, customStartDate, customEndDate, sendEmail);
            setSuccess(sendEmail
                ? 'Custom report generated and sent to your email!'
                : 'Custom report generated successfully!'
            );
            setShowCustomForm(false);
            await fetchReports();
        } catch (err) {
            console.error('Error generating custom report:', err);
            setError(err.message || 'Failed to generate custom report');
        } finally {
            setGenerating(false);
        }
    };

    const deleteReport = async (reportId) => {
        if (!confirm('Are you sure you want to delete this report?')) return;

        try {
            await api.deleteReport(reportId);
            setSuccess('Report deleted successfully');
            await fetchReports();
        } catch (err) {
            console.error('Error deleting report:', err);
            setError(err.message || 'Failed to delete report');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getReportTypeIcon = (type) => {
        switch (type) {
            case 'Weekly':
                return (
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                );
            case 'Monthly':
                return (
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                );
            case 'Yearly':
                return (
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-6 h-6 text-[#FAB12F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                );
        }
    };

    const getGoalStatusBadge = (achieved) => {
        return achieved ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Goal Achieved
            </span>
        ) : (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 border border-yellow-200">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                In Progress
            </span>
        );
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FEF3E2]">
                <div className="w-16 h-16 border-4 border-[#FAB12F] border-t-[#FA812F] rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user) return null;

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
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Nutrition Reports</h1>
                            <p className="text-sm text-gray-500 font-medium font-mono">Generate and view your meal tracking reports 📊</p>
                        </div>
                    </div>
                </div>

                {/* Alerts */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="bg-red-50/80 backdrop-blur-sm text-red-600 p-4 rounded-2xl text-sm font-medium border border-red-100 flex justify-between items-center shadow-sm"
                        >
                            <div className="flex items-center gap-3">
                                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <span>{error}</span>
                            </div>
                            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 transition-colors cursor-pointer">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </motion.div>
                    )}

                    {success && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="bg-green-50/80 backdrop-blur-sm text-green-600 p-4 rounded-2xl text-sm font-medium border border-green-100 flex justify-between items-center shadow-sm"
                        >
                            <div className="flex items-center gap-3">
                                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <span>{success}</span>
                            </div>
                            <button onClick={() => setSuccess(null)} className="text-green-400 hover:text-green-600 transition-colors cursor-pointer">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Quick Generate Section */}
                <motion.div variants={itemVariants} className="bg-white/60 backdrop-blur-xl rounded-4xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#FAB12F]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                    <div className="relative z-10">
                        <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Quick Generate</h2>
                        <p className="text-gray-500 mb-8 font-medium">Generate a report for a preset period and receive it via email</p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { type: 'weekly', label: 'Weekly Report', desc: 'Last 7 days summary', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', color: 'blue' },
                                { type: 'monthly', label: 'Monthly Report', desc: 'Last 30 days summary', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01', color: 'green' },
                                { type: 'yearly', label: 'Yearly Report', desc: 'Last 365 days summary', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', color: 'purple' }
                            ].map((item) => (
                                <motion.button
                                    key={item.type}
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => generateQuickReport(item.type)}
                                    disabled={generating}
                                    className={`p-6 bg-white/50 border border-white/60 rounded-3xl hover:bg-white hover:shadow-lg transition-all text-left group cursor-pointer relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    <div className={`absolute top-0 right-0 w-24 h-24 bg-${item.color}-100/30 rounded-full blur-xl -translate-y-1/2 translate-x-1/2 group-hover:bg-${item.color}-100/50 transition-colors`}></div>
                                    <div className="flex items-center gap-4 relative z-10">
                                        <div className={`w-14 h-14 bg-${item.color}-100/50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                                            <svg className={`w-7 h-7 text-${item.color}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-lg group-hover:text-[#FAB12F] transition-colors">{item.label}</h3>
                                            <p className="text-sm text-gray-500 font-medium">{item.desc}</p>
                                        </div>
                                    </div>
                                </motion.button>
                            ))}
                        </div>

                        {generating && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="mt-6 flex items-center justify-center text-gray-600 font-medium bg-white/50 py-3 rounded-xl border border-white/50"
                            >
                                <svg className="animate-spin h-5 w-5 mr-3 text-[#FAB12F]" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Generating report...
                            </motion.div>
                        )}
                    </div>
                </motion.div>

                {/* Custom Report Section */}
                <motion.div variants={itemVariants} className="bg-white/60 backdrop-blur-xl rounded-4xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Custom Report</h2>
                            <p className="text-gray-500 font-medium">Create a report for a specific date range</p>
                        </div>
                        <button
                            onClick={() => setShowCustomForm(!showCustomForm)}
                            className="px-6 py-3 bg-white text-gray-700 rounded-2xl hover:bg-gray-50 transition-all font-bold shadow-sm border border-gray-200 cursor-pointer flex items-center gap-2"
                        >
                            {showCustomForm ? (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    Cancel
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                    Create Custom
                                </>
                            )}
                        </button>
                    </div>

                    <AnimatePresence>
                        {showCustomForm && (
                            <motion.form
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                onSubmit={generateCustomReport}
                                className="overflow-hidden"
                            >
                                <div className="bg-white/40 rounded-3xl p-6 border border-white/50 mb-2">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Report Type</label>
                                            <div className="relative">
                                                <select
                                                    value={customReportType}
                                                    onChange={(e) => setCustomReportType(e.target.value)}
                                                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FAB12F] focus:border-transparent outline-none appearance-none cursor-pointer font-medium text-gray-900"
                                                >
                                                    <option value="daily">Daily</option>
                                                    <option value="weekly">Weekly</option>
                                                    <option value="monthly">Monthly</option>
                                                    <option value="yearly">Yearly</option>
                                                </select>
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Start Date</label>
                                            <input
                                                type="date"
                                                value={customStartDate}
                                                onChange={(e) => setCustomStartDate(e.target.value)}
                                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FAB12F] focus:border-transparent outline-none font-medium text-gray-900 [&::-webkit-calendar-picker-indicator]:opacity-70 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">End Date</label>
                                            <input
                                                type="date"
                                                value={customEndDate}
                                                onChange={(e) => setCustomEndDate(e.target.value)}
                                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FAB12F] focus:border-transparent outline-none font-medium text-gray-900 [&::-webkit-calendar-picker-indicator]:opacity-70 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                                                required
                                            />
                                        </div>

                                        <div className="flex items-end pb-1">
                                            <label className="flex items-center cursor-pointer group p-2 rounded-xl hover:bg-white/50 transition-colors w-full">
                                                <div className="relative flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={sendEmail}
                                                        onChange={(e) => setSendEmail(e.target.checked)}
                                                        className="peer h-6 w-6 cursor-pointer appearance-none rounded-lg border border-gray-300 bg-white checked:border-[#FAB12F] checked:bg-[#FAB12F] transition-all"
                                                    />
                                                    <svg className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                                <span className="ml-3 text-sm font-bold text-gray-700 group-hover:text-gray-900">Send copy to email</span>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={generating}
                                            className="px-8 py-3 bg-linear-to-r from-[#FAB12F] to-[#FA812F] text-white rounded-xl hover:opacity-90 transition-all font-bold shadow-lg shadow-[#FAB12F]/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                        >
                                            {generating ? (
                                                <>
                                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                    </svg>
                                                    Generating...
                                                </>
                                            ) : (
                                                <>
                                                    Generate Report
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Reports List */}
                <motion.div variants={itemVariants} className="bg-white/60 backdrop-blur-xl rounded-4xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50">
                    <h2 className="text-2xl font-black text-gray-900 mb-6 tracking-tight">Previous Reports</h2>

                    {reports.length === 0 ? (
                        <div className="text-center py-16 bg-white/40 rounded-3xl border border-dashed border-gray-300">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">No Reports Yet</h3>
                            <p className="text-gray-500 font-medium">Generate your first report using the options above</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {reports.map((report) => (
                                <motion.div
                                    key={report._id || report.id}
                                    whileHover={{ scale: 1.01 }}
                                    className="bg-white/50 border border-white/60 rounded-3xl p-6 hover:bg-white hover:shadow-lg transition-all group"
                                >
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                        <div className="flex items-start gap-5">
                                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 group-hover:scale-110 transition-transform duration-300">
                                                {getReportTypeIcon(report.report_type)}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 text-lg capitalize">
                                                    {report.report_type} Report
                                                </h3>
                                                <p className="text-sm text-gray-500 font-medium flex items-center gap-2 mt-1">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                    {formatDate(report.start_date)} - {formatDate(report.end_date)}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1 font-mono">
                                                    Generated: {formatDate(report.generated_at)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                            {getGoalStatusBadge(report.goal_achieved)}

                                            <div className="flex gap-2 w-full sm:w-auto">
                                                <button
                                                    onClick={() => router.push(`/my/reports/${report._id || report.id}`)}
                                                    className="flex-1 sm:flex-none px-5 py-2.5 bg-[#FAB12F]/10 text-[#FA812F] rounded-xl hover:bg-[#FAB12F] hover:text-white transition-all text-sm font-bold cursor-pointer"
                                                >
                                                    View Details
                                                </button>
                                                <button
                                                    onClick={() => deleteReport(report._id || report.id)}
                                                    className="px-4 py-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all text-sm font-bold cursor-pointer"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Quick Stats */}
                                    <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-100/50">
                                        <div className="text-center sm:text-left">
                                            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-1">Days Logged</p>
                                            <p className="text-lg font-black text-gray-900">{report.days_logged}<span className="text-gray-400 text-sm font-medium">/{report.total_days}</span></p>
                                        </div>
                                        <div className="text-center sm:text-left">
                                            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-1">Total Meals</p>
                                            <p className="text-lg font-black text-gray-900">{report.total_meals}</p>
                                        </div>
                                        <div className="text-center sm:text-left">
                                            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-1">Avg Calories</p>
                                            <p className="text-lg font-black text-gray-900">{Math.round(report.avg_calories)} <span className="text-xs text-gray-400 font-medium">kcal</span></p>
                                        </div>
                                        <div className="text-center sm:text-left">
                                            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-1">Streak</p>
                                            <p className="text-lg font-black text-[#FA812F]">{report.streak_days} <span className="text-sm">🔥</span></p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </motion.main>
        </div>
    );
}
