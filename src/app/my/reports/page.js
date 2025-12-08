'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

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
                return '📅';
            case 'Monthly':
                return '📆';
            case 'Yearly':
                return '🗓️';
            default:
                return '📊';
        }
    };

    const getGoalStatusBadge = (achieved) => {
        return achieved ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                ✅ Goal Achieved
            </span>
        ) : (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                ⏳ In Progress
            </span>
        );
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50">
                <div className="text-xl text-gray-600">Loading...</div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">📊 Nutrition Reports</h1>
                    <p className="text-gray-600">Generate and view your meal tracking reports</p>
                </div>

                {/* Alerts */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex justify-between items-center">
                        <span>{error}</span>
                        <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}

                {success && (
                    <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex justify-between items-center">
                        <span>{success}</span>
                        <button onClick={() => setSuccess(null)} className="text-green-500 hover:text-green-700">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}

                {/* Quick Generate Section */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Generate Report</h2>
                    <p className="text-gray-600 mb-6">Generate a report for a preset period and receive it via email</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button
                            onClick={() => generateQuickReport('weekly')}
                            disabled={generating}
                            className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
                                    📅
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 text-lg">Weekly Report</h3>
                                    <p className="text-sm text-gray-600">Last 7 days summary</p>
                                </div>
                            </div>
                        </button>

                        <button
                            onClick={() => generateQuickReport('monthly')}
                            disabled={generating}
                            className="p-6 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center text-2xl">
                                    📆
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 text-lg">Monthly Report</h3>
                                    <p className="text-sm text-gray-600">Last 30 days summary</p>
                                </div>
                            </div>
                        </button>

                        <button
                            onClick={() => generateQuickReport('yearly')}
                            disabled={generating}
                            className="p-6 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center text-2xl">
                                    🗓️
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 text-lg">Yearly Report</h3>
                                    <p className="text-sm text-gray-600">Last 365 days summary</p>
                                </div>
                            </div>
                        </button>
                    </div>

                    {generating && (
                        <div className="mt-4 flex items-center justify-center text-gray-600">
                            <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Generating report...
                        </div>
                    )}
                </div>

                {/* Custom Report Section */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Custom Report</h2>
                            <p className="text-gray-600">Create a report for a specific date range</p>
                        </div>
                        <button
                            onClick={() => setShowCustomForm(!showCustomForm)}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                        >
                            {showCustomForm ? 'Cancel' : '+ Create Custom'}
                        </button>
                    </div>

                    {showCustomForm && (
                        <form onSubmit={generateCustomReport} className="border-t pt-6 mt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                                    <select
                                        value={customReportType}
                                        onChange={(e) => setCustomReportType(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    >
                                        <option value="daily">Daily</option>
                                        <option value="weekly">Weekly</option>
                                        <option value="monthly">Monthly</option>
                                        <option value="yearly">Yearly</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                                    <input
                                        type="date"
                                        value={customStartDate}
                                        onChange={(e) => setCustomStartDate(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                                    <input
                                        type="date"
                                        value={customEndDate}
                                        onChange={(e) => setCustomEndDate(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div className="flex items-end">
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={sendEmail}
                                            onChange={(e) => setSendEmail(e.target.checked)}
                                            className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Send to email</span>
                                    </label>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={generating}
                                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {generating ? 'Generating...' : 'Generate Report'}
                            </button>
                        </form>
                    )}
                </div>

                {/* Reports List */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Previous Reports</h2>

                    {reports.length === 0 ? (
                        <div className="text-center py-12">
                            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Reports Yet</h3>
                            <p className="text-gray-600">Generate your first report using the options above</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {reports.map((report) => (
                                <div
                                    key={report._id || report.id}
                                    className="border border-gray-200 rounded-xl p-6 hover:border-gray-300 transition-colors"
                                >
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl">
                                                {getReportTypeIcon(report.report_type)}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900 text-lg">
                                                    {report.report_type} Report
                                                </h3>
                                                <p className="text-sm text-gray-600">
                                                    {formatDate(report.start_date)} - {formatDate(report.end_date)}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Generated: {formatDate(report.generated_at)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                            {getGoalStatusBadge(report.goal_achieved)}

                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => router.push(`/my/reports/${report._id || report.id}`)}
                                                    className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                                                >
                                                    View Details
                                                </button>
                                                <button
                                                    onClick={() => deleteReport(report._id || report.id)}
                                                    className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Quick Stats */}
                                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide">Days Logged</p>
                                            <p className="text-lg font-semibold text-gray-900">{report.days_logged}/{report.total_days}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide">Total Meals</p>
                                            <p className="text-lg font-semibold text-gray-900">{report.total_meals}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide">Avg Calories</p>
                                            <p className="text-lg font-semibold text-gray-900">{Math.round(report.avg_calories)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide">Streak</p>
                                            <p className="text-lg font-semibold text-gray-900">{report.streak_days} days 🔥</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
