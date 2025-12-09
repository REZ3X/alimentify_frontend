'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { notificationManager } from '@/lib/notifications';
import { CaloriesTrendChart, MacrosDistributionChart } from '@/components/NutritionCharts';
import Navbar from '@/components/Navbar';

// Import modular components
import DateSelector from '@/components/DateSelector';
import DailyStats from '@/components/DailyStats';
import MealCard from '@/components/MealCard';
import MealModal from '@/components/MealModal';

export default function MealsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    // State
    const [viewMode, setViewMode] = useState('daily');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [meals, setMeals] = useState([]);
    const [dailyTotals, setDailyTotals] = useState(null);
    const [periodStats, setPeriodStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal State
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingMeal, setEditingMeal] = useState(null);
    const [analyzingFood, setAnalyzingFood] = useState(false);

    // Auth Check
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/login');
        }
    }, [user, authLoading, router]);

    // Data Fetching
    useEffect(() => {
        if (user) {
            if (viewMode === 'daily') {
                fetchDailyMeals();
            } else {
                fetchPeriodStats();
            }
        }
    }, [selectedDate, viewMode, user]);

    const getDateRangeForPeriod = () => {
        const date = new Date(selectedDate);
        let startDate, endDate;

        switch (viewMode) {
            case 'weekly':
                endDate = new Date(date);
                startDate = new Date(date);
                startDate.setDate(startDate.getDate() - 6);
                break;
            case 'monthly':
                endDate = new Date(date);
                startDate = new Date(date);
                startDate.setDate(startDate.getDate() - 29);
                break;
            case 'yearly':
                endDate = new Date(date);
                startDate = new Date(date);
                startDate.setDate(startDate.getDate() - 364);
                break;
            default:
                return { startDate: date, endDate: date };
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
            const { startDate, endDate } = getDateRangeForPeriod();
            const data = await api.getPeriodStats(startDate, endDate);
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

    // Handlers
    const handleAnalyzeFood = async (foodName, portionDescription) => {
        if (!foodName.trim()) return;

        setAnalyzingFood(true);
        try {
            const portionInfo = portionDescription ? ` (${portionDescription})` : '';
            const result = await api.analyzeFoodText(`${foodName}${portionInfo}`);

            if (result.is_valid_food === false) {
                notificationManager.error(result.message || "This doesn't appear to be a valid food item.");
                return null;
            }

            return result;
        } catch (err) {
            console.error('Error analyzing food:', err);
            notificationManager.error('Failed to analyze food. Please try again.');
            throw err;
        } finally {
            setAnalyzingFood(false);
        }
    };

    const handleAddMeal = async (formData) => {
        try {
            const mealData = {
                ...formData,
                calories: parseFloat(formData.calories) || 0,
                protein_g: parseFloat(formData.protein_g) || 0,
                carbs_g: parseFloat(formData.carbs_g) || 0,
                fat_g: parseFloat(formData.fat_g) || 0,
            };

            await api.logMeal(mealData);
            setShowAddModal(false);
            fetchDailyMeals();
            notificationManager.success('Meal added successfully!');
        } catch (err) {
            console.error('Error adding meal:', err);
            notificationManager.error(err.message || 'Failed to add meal');
        }
    };

    const handleEditMeal = async (formData) => {
        if (!editingMeal) return;
        try {
            const mealData = {
                meal_type: formData.meal_type,
                food_name: formData.food_name,
                calories: parseFloat(formData.calories) || 0,
                protein_g: parseFloat(formData.protein_g) || 0,
                carbs_g: parseFloat(formData.carbs_g) || 0,
                fat_g: parseFloat(formData.fat_g) || 0,
                serving_size: formData.serving_size,
                notes: formData.notes,
            };

            await api.updateMeal(editingMeal._id, mealData);
            setShowEditModal(false);
            setEditingMeal(null);
            fetchDailyMeals();
            notificationManager.success('Meal updated successfully!');
        } catch (err) {
            console.error('Error updating meal:', err);
            notificationManager.error(err.message || 'Failed to update meal');
        }
    };

    const handleDeleteMeal = async (mealId) => {
        if (!confirm('Are you sure you want to delete this meal?')) return;
        try {
            await api.deleteMeal(mealId);
            fetchDailyMeals();
            notificationManager.success('Meal deleted successfully');
        } catch (err) {
            console.error('Error deleting meal:', err);
            notificationManager.error(err.message || 'Failed to delete meal');
        }
    };

    const openEditModal = (meal) => {
        setEditingMeal(meal);
        setShowEditModal(true);
    };

    if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-[#FEF3E2]"><div className="w-16 h-16 border-4 border-[#FAB12F] border-t-[#FA812F] rounded-full animate-spin"></div></div>;

    return (
        <div className="min-h-screen bg-[#FEF3E2] relative overflow-x-hidden font-sans selection:bg-[#FAB12F] selection:text-white pb-24 pt-28">
            {/* Background Pattern */}
            <div className="fixed inset-0 z-0 opacity-40 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#FAB12F 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

            {/* Decorative Blobs */}
            <div className="fixed top-0 left-0 w-96 h-96 bg-[#FAB12F]/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0"></div>
            <div className="fixed bottom-0 right-0 w-96 h-96 bg-[#FA812F]/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none z-0"></div>

            <Navbar />

            <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="p-3 rounded-full bg-white/50 hover:bg-white text-gray-600 hover:text-[#FAB12F] transition-all duration-300 shadow-sm border border-white/50 group"
                        >
                            <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Meal Tracker</h1>
                            <p className="text-sm text-gray-500 font-medium font-mono">Fuel your body right 🍎</p>
                        </div>
                    </div>
                </div>

                <DateSelector
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                    onAddMeal={() => setShowAddModal(true)}
                />

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-medium border border-red-100 flex items-center gap-3 animate-in slide-in-from-top-2">
                        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {error}
                    </div>
                )}

                {viewMode === 'daily' ? (
                    <div className="space-y-8">
                        {dailyTotals && <DailyStats totals={dailyTotals} />}

                        {/* Meals Grid - Kanban Style on Desktop */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-start">
                            {['breakfast', 'lunch', 'dinner', 'snack'].map((type) => {
                                const typeMeals = meals.filter(m => m.meal_type === type);

                                return (
                                    <div key={type} className="bg-white/30 backdrop-blur-sm rounded-4xl p-4 border border-white/40 flex flex-col gap-4 min-h-[200px] transition-all hover:bg-white/40">
                                        <div className="flex items-center justify-between px-2">
                                            <h3 className="text-lg font-bold text-gray-900 capitalize flex items-center gap-2">
                                                {type === 'breakfast' && '🍳'}
                                                {type === 'lunch' && '🥗'}
                                                {type === 'dinner' && '🍽️'}
                                                {type === 'snack' && '🥨'}
                                                {type}
                                            </h3>
                                            <span className="text-xs font-bold bg-white/50 px-2 py-1 rounded-full text-gray-500">
                                                {typeMeals.length}
                                            </span>
                                        </div>

                                        <div className="space-y-3">
                                            {typeMeals.length > 0 ? (
                                                typeMeals.map((meal, index) => (
                                                    <MealCard
                                                        key={meal._id?.$oid || meal._id || `meal-${type}-${index}`}
                                                        meal={meal}
                                                        onEdit={openEditModal}
                                                        onDelete={handleDeleteMeal}
                                                    />
                                                ))
                                            ) : (
                                                <div className="h-32 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-white/30 rounded-3xl">
                                                    <span className="text-2xl opacity-50 mb-1">
                                                        {type === 'breakfast' && '☕'}
                                                        {type === 'lunch' && '🥪'}
                                                        {type === 'dinner' && '🌙'}
                                                        {type === 'snack' && '🍪'}
                                                    </span>
                                                    <span className="text-xs font-medium">No meals</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Empty State for entire day */}
                        {meals.length === 0 && !loading && (
                            <div className="text-center py-12">
                                <p className="text-gray-500 text-sm">Start by adding a meal to any category above!</p>
                            </div>
                        )}
                    </div>
                ) : (
                    /* Period Stats View */
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in">
                        {periodStats && (
                            <>
                                <div className="bg-white/60 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-sm border border-white/50">
                                    <h3 className="text-xl font-bold text-gray-900 mb-6">Calories Trend</h3>
                                    <div className="h-80">
                                        <CaloriesTrendChart dailyData={periodStats.daily_data || []} target={periodStats.goal_progress?.target_calories || 2000} />
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div className="bg-white/60 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-sm border border-white/50">
                                        <h3 className="text-xl font-bold text-gray-900 mb-6">Macro Distribution</h3>
                                        <div className="h-80">
                                            <MacrosDistributionChart
                                                averages={{
                                                    protein_g: periodStats.averages?.avg_protein_g || 0,
                                                    carbs_g: periodStats.averages?.avg_carbs_g || 0,
                                                    fat_g: periodStats.averages?.avg_fat_g || 0
                                                }}
                                                targets={{
                                                    protein_g: periodStats.goal_progress?.target_protein_g || 128,
                                                    carbs_g: periodStats.goal_progress?.target_carbs_g || 231,
                                                    fat_g: periodStats.goal_progress?.target_fat_g || 68
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white/60 backdrop-blur-xl p-6 rounded-[2.5rem] shadow-sm border border-white/50">
                                            <h3 className="text-sm font-bold text-gray-500 mb-2">Avg Calories</h3>
                                            <p className="text-3xl font-black text-gray-900">{Math.round(periodStats.averages?.avg_calories || 0)}</p>
                                            <p className="text-xs text-gray-400 mt-1">kcal / day</p>
                                        </div>
                                        <div className="bg-white/60 backdrop-blur-xl p-6 rounded-[2.5rem] shadow-sm border border-white/50">
                                            <h3 className="text-sm font-bold text-gray-500 mb-2">Avg Protein</h3>
                                            <p className="text-3xl font-black text-gray-900">{Math.round(periodStats.averages?.avg_protein_g || 0)}g</p>
                                            <p className="text-xs text-gray-400 mt-1">per day</p>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </main>

            {/* Modals */}
            <MealModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSubmit={handleAddMeal}
                onAnalyze={handleAnalyzeFood}
                analyzing={analyzingFood}
            />

            <MealModal
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setEditingMeal(null);
                }}
                onSubmit={handleEditMeal}
                initialData={editingMeal ? {
                    meal_type: editingMeal.meal_type,
                    food_name: editingMeal.food_name,
                    portion_description: editingMeal.serving_size,
                    calories: editingMeal.calories,
                    protein_g: editingMeal.protein_g,
                    carbs_g: editingMeal.carbs_g,
                    fat_g: editingMeal.fat_g,
                    serving_size: editingMeal.serving_size,
                    notes: editingMeal.notes
                } : null}
                isEditing={true}
            />
        </div>
    );
}
