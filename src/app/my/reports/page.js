'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';

export default function ReportsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generatingReport, setGeneratingReport] = useState(false);

    const [reportType, setReportType] = useState('weekly');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [sendEmail, setSendEmail] = useState(true);
    const [showGenerateForm, setShowGenerateForm] = useState(false);

    useEffect(() => {
        if (user) {
            fetchReports();
        }
    }, [user]);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const response = await api.getReports();
            setReports(response.reports || []);
        } catch (error) {
            console.error('Error fetching reports:', error);
            toast.error('Failed to load reports');
        } finally {
            setLoading(false);
        }
    }; const handleGenerateReport = async (e) => {
        e.preventDefault();

        if (!startDate || !endDate) {
            toast.error('Please select start and end dates');
            return;
        }

        if (new Date(endDate) < new Date(startDate)) {
            toast.error('End date must be after start date');
            return;
        }

        try {
            setGeneratingReport(true);
            const response = await api.generateReport(reportType, startDate, endDate, sendEmail);

            toast.success(sendEmail ? 'Report generated and sent to email!' : 'Report generated successfully!');
            setShowGenerateForm(false);
            fetchReports();
        } catch (error) {
            console.error('Error generating report:', error);
            toast.error(error.message || 'Failed to generate report');
        } finally {
            setGeneratingReport(false);
        }
    };

    const handleDeleteReport = async (reportId) => {
        if (!confirm('Are you sure you want to delete this report?')) {
            return;
        }

        try {
            await api.deleteReport(reportId);
            toast.success('Report deleted successfully');
            fetchReports();
        } catch (error) {
            console.error('Error deleting report:', error);
            toast.error('Failed to delete report');
        }
    }; const getReportTypeLabel = (type) => {
        const labels = {
            daily: 'Daily',
            weekly: 'Weekly',
            monthly: 'Monthly',
            yearly: 'Yearly'
        };
        return labels[type] || type;
    };

    const getStatusBadgeClass = (status) => {
        const classes = {
            Generated: 'bg-blue-100 text-blue-800',
            Sent: 'bg-green-100 text-green-800',
            Failed: 'bg-red-100 text-red-800'
        };
        return classes[status] || 'bg-gray-100 text-gray-800';
    };

    const setQuickDateRange = (type) => {
        const today = new Date();
        const formatDate = (date) => date.toISOString().split('T')[0];

        switch (type) {
            case 'today':
                setStartDate(formatDate(today));
                setEndDate(formatDate(today));
                setReportType('daily');
                break;
            case 'this_week':
                const weekStart = new Date(today);
                weekStart.setDate(today.getDate() - today.getDay());
                setStartDate(formatDate(weekStart));
                setEndDate(formatDate(today));
                setReportType('weekly');
                break;
            case 'this_month':
                const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
                setStartDate(formatDate(monthStart));
                setEndDate(formatDate(today));
                setReportType('monthly');
                break;
            case 'this_year':
                const yearStart = new Date(today.getFullYear(), 0, 1);
                setStartDate(formatDate(yearStart));
                setEndDate(formatDate(today));
                setReportType('yearly');
                break;
            case 'last_7_days':
                const sevenDaysAgo = new Date(today);
                sevenDaysAgo.setDate(today.getDate() - 7);
                setStartDate(formatDate(sevenDaysAgo));
                setEndDate(formatDate(today));
                setReportType('weekly');
                break;
            case 'last_30_days':
                const thirtyDaysAgo = new Date(today);
                thirtyDaysAgo.setDate(today.getDate() - 30);
                setStartDate(formatDate(thirtyDaysAgo));
                setEndDate(formatDate(today));
                setReportType('monthly');
                break;
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-600">Please log in to view reports</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">

                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Nutrition Reports</h1>
                        <p className="text-gray-600 mt-2">Generate and view your nutrition progress reports</p>
                    </div>
                    <button
                        onClick={() => setShowGenerateForm(!showGenerateForm)}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-md"
                    >
                        {showGenerateForm ? 'Cancel' : '+ Generate New Report'}
                    </button>
                </div>

                {showGenerateForm && (
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Generate New Report</h2>

                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Quick Select</label>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                                {[
                                    { label: 'Today', value: 'today' },
                                    { label: 'This Week', value: 'this_week' },
                                    { label: 'This Month', value: 'this_month' },
                                    { label: 'This Year', value: 'this_year' },
                                    { label: 'Last 7 Days', value: 'last_7_days' },
                                    { label: 'Last 30 Days', value: 'last_30_days' },
                                ].map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => setQuickDateRange(option.value)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <form onSubmit={handleGenerateReport} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Report Type
                                    </label>
                                    <select
                                        value={reportType}
                                        onChange={(e) => setReportType(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    >
                                        <option value="daily">Daily</option>
                                        <option value="weekly">Weekly</option>
                                        <option value="monthly">Monthly</option>
                                        <option value="yearly">Yearly</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Start Date
                                    </label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        End Date
                                    </label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="sendEmail"
                                    checked={sendEmail}
                                    onChange={(e) => setSendEmail(e.target.checked)}
                                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                />
                                <label htmlFor="sendEmail" className="ml-2 text-sm text-gray-700">
                                    Send report to my email ({user.gmail})
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={generatingReport}
                                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {generatingReport ? 'Generating Report...' : 'Generate Report'}
                            </button>
                        </form>
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">My Reports</h2>

                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                            <p className="text-gray-600 mt-4">Loading reports...</p>
                        </div>
                    ) : reports.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-600">No reports generated yet</p>
                            <button
                                onClick={() => setShowGenerateForm(true)}
                                className="mt-4 text-green-600 hover:text-green-700 font-semibold"
                            >
                                Generate your first report →
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {reports.map((report) => (
                                <div
                                    key={report.id}
                                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {getReportTypeLabel(report.report_type)} Report
                                                </h3>
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(report.status)}`}>
                                                    {report.status}
                                                </span>
                                                {report.goal_achieved && (
                                                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                                        🎉 Goal Achieved
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 mb-3">
                                                {report.start_date} to {report.end_date}
                                            </p>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                <div>
                                                    <span className="text-gray-500">Days Logged:</span>
                                                    <p className="font-semibold">{report.days_logged}/{report.total_days}</p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Avg Calories:</span>
                                                    <p className="font-semibold">{report.avg_calories?.toFixed(0)} kcal</p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Compliance:</span>
                                                    <p className="font-semibold">{report.calories_compliance_percent?.toFixed(1)}%</p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Streak:</span>
                                                    <p className="font-semibold">{report.streak_days} days 🔥</p>
                                                </div>
                                            </div>

                                            {report.best_day_date && (
                                                <p className="text-sm text-gray-600 mt-2">
                                                    🏆 Best Day: {report.best_day_date} ({report.best_day_compliance?.toFixed(1)}% compliance)
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex gap-2 ml-4">
                                            <button
                                                onClick={() => router.push(`/my/reports/${report.id}`)}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
                                            >
                                                View Details
                                            </button>
                                            <button
                                                onClick={() => handleDeleteReport(report.id)}
                                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold"
                                            >
                                                Delete
                                            </button>
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
