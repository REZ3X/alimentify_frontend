'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { notificationManager } from '@/lib/notifications';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

export default function MealsPageEnhanced() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const [viewMode, setViewMode] = useState('day'); const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    const [meals, setMeals] = useState([]);
    const [dailyTotals, setDailyTotals] = useState(null);
    const [periodStats, setPeriodStats] = useState(null);
    const [healthProfile, setHealthProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingMeal, setEditingMeal] = useState(null);
    const [analyzingFood, setAnalyzingFood] = useState(false);
    const [showManualEntry, setShowManualEntry] = useState(false);

    const [formData, setFormData] = useState({
        meal_type: 'breakfast',
        food_name: '',
        portion_description: '',
        calories: '',
        protein_g: '',
        carbs_g: '',
        fat_g: '',
        serving_size: '',
        notes: '',
    });

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user && !healthProfile) {
            fetchHealthProfile();
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            if (viewMode === 'day') {
                fetchDailyMeals();
            } else {
                fetchPeriodStats();
            }
        }
    }, [selectedDate, viewMode, user, healthProfile]);

    const fetchHealthProfile = async () => {
        try {
            const profile = await api.getHealthProfile();
            setHealthProfile(profile);
        } catch (err) {
            console.error('Error fetching health profile:', err);
        }
    };

    const getDateRange = () => {
        const date = new Date(selectedDate);
        let startDate, endDate;

        switch (viewMode) {
            case 'week':
                const dayOfWeek = date.getDay();
                startDate = new Date(date);
                startDate.setDate(date.getDate() - dayOfWeek);
                endDate = new Date(startDate);
                endDate.setDate(startDate.getDate() + 6);
                break;
            case 'month':
                startDate = new Date(date.getFullYear(), date.getMonth(), 1);
                endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
                break;
            case 'year':
                startDate = new Date(date.getFullYear(), 0, 1);
                endDate = new Date(date.getFullYear(), 11, 31);
                break;
            default:
                return { startDate: selectedDate, endDate: selectedDate };
        }

        return {
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0]
        };
    };

    const fetchPeriodStats = async () => {
        setLoading(true);
        setError(null);
        try {
            const { startDate, endDate } = getDateRange();
            const data = await api.getPeriodStats(startDate, endDate);
            console.log('Period stats response:', data);
            setPeriodStats(data);
        } catch (err) {
            console.error('Error fetching period stats:', err);
            setError(err.message || 'Failed to load period statistics');
        } finally {
            setLoading(false);
        }
    };

    const fetchDailyMeals = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.getDailyMeals(selectedDate);
            setMeals(data.meals || []);

            if (data.daily_totals) {
                const totals = data.daily_totals;
                setDailyTotals({
                    consumed: {
                        calories: totals.total_calories || 0,
                        protein_g: totals.total_protein_g || 0,
                        carbs_g: totals.total_carbs_g || 0,
                        fat_g: totals.total_fat_g || 0,
                    },
                    target: {
                        calories: totals.target_calories || 2000,
                        protein_g: totals.target_protein_g || 128,
                        carbs_g: totals.target_carbs_g || 231,
                        fat_g: totals.target_fat_g || 68,
                    },
                    remaining: {
                        calories: totals.calories_remaining || 0,
                        protein_g: totals.protein_remaining || 0,
                        carbs_g: totals.carbs_remaining || 0,
                        fat_g: totals.fat_remaining || 0,
                    }
                });
            }
        } catch (err) {
            console.error('Error fetching meals:', err);
            setError(err.message || 'Failed to load meals');
        } finally {
            setLoading(false);
        }
    };

    const handleViewModeChange = (mode) => {
        setViewMode(mode);
        setPeriodStats(null);
        setMeals([]);
        setDailyTotals(null);
    };

    const handleDateNavigation = (direction) => {
        const date = new Date(selectedDate);
        switch (viewMode) {
            case 'day':
                date.setDate(date.getDate() + direction);
                break;
            case 'week':
                date.setDate(date.getDate() + (direction * 7));
                break;
            case 'month':
                date.setMonth(date.getMonth() + direction);
                break;
            case 'year':
                date.setFullYear(date.getFullYear() + direction);
                break;
        }
        setSelectedDate(date.toISOString().split('T')[0]);
    };

    const getProgressPercentage = (consumed, target) => {
        if (!target || target === 0) return 0;
        return Math.min((consumed / target) * 100, 100);
    };

    const getProgressColor = (consumed, target) => {
        if (!target || target === 0) return 'bg-gray-500';
        const percentage = (consumed / target) * 100;
        if (percentage < 70) return 'bg-red-500';
        if (percentage < 90) return 'bg-yellow-500';
        if (percentage <= 110) return 'bg-green-500';
        return 'bg-orange-500';
    };

    const getCalorieTrendChart = () => {
        if (!periodStats || !periodStats.daily_data) return null;

        const data = {
            labels: periodStats.daily_data.map(d => d.date),
            datasets: [
                {
                    label: 'Calories Consumed',
                    data: periodStats.daily_data.map(d => d.calories),
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.5)',
                    tension: 0.4,
                },
                {
                    label: 'Target Calories',
                    data: periodStats.daily_data.map(() => periodStats.goal_progress.target_calories),
                    borderColor: 'rgb(34, 197, 94)',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    borderDash: [5, 5],
                    tension: 0,
                }
            ]
        };

        const options = {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                    labels: { color: '#ffffff' }
                },
                title: {
                    display: true,
                    text: 'Calorie Trend',
                    color: '#ffffff',
                    font: { size: 16 }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: '#9ca3af' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                x: {
                    ticks: { color: '#9ca3af' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                }
            }
        };

        return <Line data={data} options={options} />;
    };

    const getMacroDistributionChart = () => {
        if (!periodStats || !periodStats.averages) return null;

        const data = {
            labels: ['Protein', 'Carbs', 'Fat'],
            datasets: [{
                data: [
                    periodStats.averages.avg_protein_g * 4, periodStats.averages.avg_carbs_g * 4, periodStats.averages.avg_fat_g * 9,],
                backgroundColor: [
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(251, 191, 36, 0.8)',
                ],
                borderColor: [
                    'rgba(239, 68, 68, 1)',
                    'rgba(59, 130, 246, 1)',
                    'rgba(251, 191, 36, 1)',
                ],
                borderWidth: 2,
            }]
        };

        const options = {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                    labels: { color: '#ffffff' }
                },
                title: {
                    display: true,
                    text: 'Average Macro Distribution (Calories)',
                    color: '#ffffff',
                    font: { size: 16 }
                }
            }
        };

        return <Doughnut data={data} options={options} />;
    };

    const getMacroComparisonChart = () => {
        if (!periodStats || !periodStats.averages || !periodStats.goal_progress) return null;

        const data = {
            labels: ['Protein', 'Carbs', 'Fat'],
            datasets: [
                {
                    label: 'Average Consumed (g)',
                    data: [
                        periodStats.averages.avg_protein_g,
                        periodStats.averages.avg_carbs_g,
                        periodStats.averages.avg_fat_g,
                    ],
                    backgroundColor: 'rgba(59, 130, 246, 0.8)',
                },
                {
                    label: 'Daily Target (g)',
                    data: [
                        periodStats.goal_progress.target_protein_g,
                        periodStats.goal_progress.target_carbs_g,
                        periodStats.goal_progress.target_fat_g,
                    ],
                    backgroundColor: 'rgba(34, 197, 94, 0.8)',
                }
            ]
        };

        const options = {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                    labels: { color: '#ffffff' }
                },
                title: {
                    display: true,
                    text: 'Macro Comparison: Actual vs Target',
                    color: '#ffffff',
                    font: { size: 16 }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: '#9ca3af' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                x: {
                    ticks: { color: '#9ca3af' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                }
            }
        };

        return <Bar data={data} options={options} />;
    };

    const renderPeriodView = () => {
        if (loading) {
            return (
                <div className="flex justify-center items-center min-h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            );
        }

        if (!periodStats) {
            return (
                <div className="text-center py-12">
                    <p className="text-gray-400">No data available for this period</p>
                </div>
            );
        }

        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <h3 className="text-sm font-medium text-gray-400 mb-2">Avg Calories/Day</h3>
                        <p className="text-3xl font-bold text-white">
                            {Math.round(periodStats.averages.avg_calories)}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                            Target: {Math.round(periodStats.goal_progress.target_calories)}
                        </p>
                    </div>

                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <h3 className="text-sm font-medium text-gray-400 mb-2">Days Logged</h3>
                        <p className="text-3xl font-bold text-white">
                            {periodStats.totals.days_logged}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                            Total Meals: {periodStats.totals.total_meals}
                        </p>
                    </div>

                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <h3 className="text-sm font-medium text-gray-400 mb-2">Compliance Rate</h3>
                        <p className="text-3xl font-bold text-white">
                            {Math.round(periodStats.goal_progress.calories_compliance_percent)}%
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                            {periodStats.goal_progress.days_on_target} days on target
                        </p>
                    </div>

                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <h3 className="text-sm font-medium text-gray-400 mb-2">Goal Progress</h3>
                        <p className="text-sm text-gray-300 mb-1 capitalize">
                            {periodStats.goal_progress.goal_type.replace('_', ' ')}
                        </p>
                        {periodStats.goal_progress.estimated_progress !== null && (
                            <p className="text-2xl font-bold text-white">
                                {periodStats.goal_progress.estimated_progress > 0 ? '+' : ''}
                                {periodStats.goal_progress.estimated_progress.toFixed(1)} kg
                            </p>
                        )}
                        {periodStats.goal_progress.estimated_progress === null && (
                            <p className="text-sm text-gray-400">Need more data (7+ days)</p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        {getCalorieTrendChart()}
                    </div>

                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        {getMacroDistributionChart()}
                    </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    {getMacroComparisonChart()}
                </div>

                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <h3 className="text-lg font-semibold text-white mb-4">Macro Compliance</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-sm text-gray-400">Protein</span>
                                <span className="text-sm text-white">
                                    {Math.round(periodStats.goal_progress.protein_compliance_percent)}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                                <div
                                    className="bg-red-500 h-2 rounded-full transition-all"
                                    style={{ width: `${Math.min(periodStats.goal_progress.protein_compliance_percent, 100)}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Avg: {Math.round(periodStats.averages.avg_protein_g)}g /
                                Target: {Math.round(periodStats.goal_progress.target_protein_g)}g
                            </p>
                        </div>

                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-sm text-gray-400">Carbs</span>
                                <span className="text-sm text-white">
                                    {Math.round(periodStats.goal_progress.carbs_compliance_percent)}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                                <div
                                    className="bg-blue-500 h-2 rounded-full transition-all"
                                    style={{ width: `${Math.min(periodStats.goal_progress.carbs_compliance_percent, 100)}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Avg: {Math.round(periodStats.averages.avg_carbs_g)}g /
                                Target: {Math.round(periodStats.goal_progress.target_carbs_g)}g
                            </p>
                        </div>

                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-sm text-gray-400">Fat</span>
                                <span className="text-sm text-white">
                                    {Math.round(periodStats.goal_progress.fat_compliance_percent)}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                                <div
                                    className="bg-yellow-500 h-2 rounded-full transition-all"
                                    style={{ width: `${Math.min(periodStats.goal_progress.fat_compliance_percent, 100)}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Avg: {Math.round(periodStats.averages.avg_fat_g)}g /
                                Target: {Math.round(periodStats.goal_progress.target_fat_g)}g
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 overflow-x-auto">
                    <h3 className="text-lg font-semibold text-white mb-4">Daily Breakdown</h3>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-gray-400 border-b border-gray-700">
                                <th className="pb-2">Date</th>
                                <th className="pb-2">Calories</th>
                                <th className="pb-2">Protein (g)</th>
                                <th className="pb-2">Carbs (g)</th>
                                <th className="pb-2">Fat (g)</th>
                                <th className="pb-2">Meals</th>
                            </tr>
                        </thead>
                        <tbody>
                            {periodStats.daily_data.map((day, index) => (
                                <tr key={index} className="border-b border-gray-700">
                                    <td className="py-2 text-white">{day.date}</td>
                                    <td className="py-2 text-white">{Math.round(day.calories)}</td>
                                    <td className="py-2 text-white">{Math.round(day.protein_g)}</td>
                                    <td className="py-2 text-white">{Math.round(day.carbs_g)}</td>
                                    <td className="py-2 text-white">{Math.round(day.fat_g)}</td>
                                    <td className="py-2 text-white">{day.meal_count}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const renderDailyView = () => {
        if (loading) {
            return (
                <div className="flex justify-center items-center min-h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            );
        }

        return (
            <div className="space-y-6">
                {dailyTotals && (
                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4">Today's Progress</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm text-gray-400">Calories</span>
                                    <span className="text-sm text-white">
                                        {Math.round(dailyTotals.consumed.calories)} / {Math.round(dailyTotals.target.calories)}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                    <div
                                        className={`${getProgressColor(dailyTotals.consumed.calories, dailyTotals.target.calories)} h-2 rounded-full transition-all`}
                                        style={{ width: `${getProgressPercentage(dailyTotals.consumed.calories, dailyTotals.target.calories)}%` }}
                                    ></div>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    {Math.round(dailyTotals.remaining.calories)} remaining
                                </p>
                            </div>

                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm text-gray-400">Protein</span>
                                    <span className="text-sm text-white">
                                        {Math.round(dailyTotals.consumed.protein_g)}g / {Math.round(dailyTotals.target.protein_g)}g
                                    </span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                    <div
                                        className={`${getProgressColor(dailyTotals.consumed.protein_g, dailyTotals.target.protein_g)} h-2 rounded-full transition-all`}
                                        style={{ width: `${getProgressPercentage(dailyTotals.consumed.protein_g, dailyTotals.target.protein_g)}%` }}
                                    ></div>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    {Math.round(dailyTotals.remaining.protein_g)}g remaining
                                </p>
                            </div>

                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm text-gray-400">Carbs</span>
                                    <span className="text-sm text-white">
                                        {Math.round(dailyTotals.consumed.carbs_g)}g / {Math.round(dailyTotals.target.carbs_g)}g
                                    </span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                    <div
                                        className={`${getProgressColor(dailyTotals.consumed.carbs_g, dailyTotals.target.carbs_g)} h-2 rounded-full transition-all`}
                                        style={{ width: `${getProgressPercentage(dailyTotals.consumed.carbs_g, dailyTotals.target.carbs_g)}%` }}
                                    ></div>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    {Math.round(dailyTotals.remaining.carbs_g)}g remaining
                                </p>
                            </div>

                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm text-gray-400">Fat</span>
                                    <span className="text-sm text-white">
                                        {Math.round(dailyTotals.consumed.fat_g)}g / {Math.round(dailyTotals.target.fat_g)}g
                                    </span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                    <div
                                        className={`${getProgressColor(dailyTotals.consumed.fat_g, dailyTotals.target.fat_g)} h-2 rounded-full transition-all`}
                                        style={{ width: `${getProgressPercentage(dailyTotals.consumed.fat_g, dailyTotals.target.fat_g)}%` }}
                                    ></div>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    {Math.round(dailyTotals.remaining.fat_g)}g remaining
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-white">Meals</h3>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            + Add Meal
                        </button>
                    </div>

                    {meals.length === 0 ? (
                        <p className="text-center text-gray-400 py-8">No meals logged for this day</p>
                    ) : (
                        <div className="space-y-3">
                            {meals.map((meal) => (
                                <div
                                    key={meal._id}
                                    className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="text-white font-medium">{meal.food_name}</h4>
                                            <p className="text-sm text-gray-400 capitalize">{meal.meal_type}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-white font-semibold">{Math.round(meal.calories)} cal</p>
                                            <p className="text-xs text-gray-400">
                                                P: {Math.round(meal.protein_g)}g | C: {Math.round(meal.carbs_g)}g | F: {Math.round(meal.fat_g)}g
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <div className="max-w-7xl mx-auto p-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold">Meal Tracking & Analytics</h1>
                    <p className="text-gray-400 mt-2">Track your nutrition and monitor your progress</p>
                </div>

                <div className="bg-gray-800 rounded-lg p-4 mb-6 border border-gray-700">
                    <div className="flex flex-wrap gap-2 mb-4">
                        {['day', 'week', 'month', 'year'].map((mode) => (
                            <button
                                key={mode}
                                onClick={() => handleViewModeChange(mode)}
                                className={`px-4 py-2 rounded-lg font-medium transition ${viewMode === mode
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}
                            >
                                {mode.charAt(0).toUpperCase() + mode.slice(1)}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => handleDateNavigation(-1)}
                            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
                        >
                            ← Previous
                        </button>

                        <div className="text-center">
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                            />
                            {viewMode !== 'day' && (
                                <p className="text-sm text-gray-400 mt-1">
                                    {getDateRange().startDate} to {getDateRange().endDate}
                                </p>
                            )}
                        </div>

                        <button
                            onClick={() => handleDateNavigation(1)}
                            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
                        >
                            Next →
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {viewMode === 'day' ? renderDailyView() : renderPeriodView()}
            </div>
        </div>
    );
}
