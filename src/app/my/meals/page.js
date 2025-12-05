'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { notificationManager } from '@/lib/notifications';

export default function MealsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [meals, setMeals] = useState([]);
    const [dailyTotals, setDailyTotals] = useState(null);
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
            fetchDailyMeals();
        }
    }, [selectedDate, user, healthProfile]);

    const fetchHealthProfile = async () => {
        try {
            const profile = await api.getHealthProfile();
            setHealthProfile(profile);
        } catch (err) {
            console.error('Error fetching health profile:', err);

        }
    };

    const fetchDailyMeals = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.getDailyMeals(selectedDate);
            console.log('Daily meals response:', data);
            console.log('Daily totals from backend:', data.daily_totals);
            setMeals(data.meals || []);

            if (data.daily_totals) {
                const totals = data.daily_totals;
                console.log('Setting daily totals:', {
                    consumed: {
                        calories: totals.total_calories,
                        protein_g: totals.total_protein_g,
                        carbs_g: totals.total_carbs_g,
                        fat_g: totals.total_fat_g,
                    },
                    target: {
                        calories: totals.target_calories,
                        protein_g: totals.target_protein_g,
                        carbs_g: totals.target_carbs_g,
                        fat_g: totals.target_fat_g,
                    }
                });

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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setFormData({
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
        setShowManualEntry(false);
    };

    const analyzeFood = async () => {
        if (!formData.food_name.trim()) {
            setError('Please enter a food name');
            return;
        }

        setAnalyzingFood(true);
        setError(null);

        try {
            const portionInfo = formData.portion_description
                ? ` (${formData.portion_description})`
                : '';

            console.log('Analyzing food:', `${formData.food_name}${portionInfo}`);
            const result = await api.analyzeFoodText(`${formData.food_name}${portionInfo}`);
            console.log('AI analysis result:', result);

            setFormData(prev => ({
                ...prev,
                calories: result.calories || '',
                protein_g: result.protein_g || '',
                carbs_g: result.carbs_g || '',
                fat_g: result.fat_g || '',
                serving_size: result.serving_size || prev.portion_description || '',
            }));

            const successMsg = '✨ AI analyzed your food! Review and confirm the details.';
            setError(null);

        } catch (err) {
            console.error('Error analyzing food:', err);
            setError('Failed to analyze food. Please enter details manually or try again.');
            setShowManualEntry(true);
        } finally {
            setAnalyzingFood(false);
        }
    };

    const handleAddMeal = async (e) => {
        e.preventDefault();
        setError(null);

        if (!formData.food_name) {
            setError('Food name is required');
            return;
        }

        if (!formData.calories && !showManualEntry) {
            setError('Please click "Analyze with AI" first or enter details manually');
            return;
        }

        try {
            const mealData = {
                ...formData,
                calories: parseFloat(formData.calories) || 0,
                protein_g: parseFloat(formData.protein_g) || 0,
                carbs_g: parseFloat(formData.carbs_g) || 0,
                fat_g: parseFloat(formData.fat_g) || 0,
            };

            console.log('Logging meal with data:', mealData);
            const response = await api.logMeal(mealData);
            console.log('Meal logged successfully:', response);

            setShowAddModal(false);
            resetForm();
            fetchDailyMeals();
        } catch (err) {
            console.error('Error adding meal:', err);
            setError(err.message || 'Failed to add meal');
        }
    };

    const handleEditMeal = async (e) => {
        e.preventDefault();
        setError(null);

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
            resetForm();
            fetchDailyMeals();
        } catch (err) {
            console.error('Error updating meal:', err);
            setError(err.message || 'Failed to update meal');
        }
    };

    const openEditModal = (meal) => {
        setEditingMeal(meal);
        setFormData({
            meal_type: meal.meal_type,
            food_name: meal.food_name,
            calories: meal.calories.toString(),
            protein_g: meal.protein_g.toString(),
            carbs_g: meal.carbs_g.toString(),
            fat_g: meal.fat_g.toString(),
            serving_size: meal.serving_size || '',
            notes: meal.notes || '',
        });
        setShowEditModal(true);
    };

    const handleDeleteMeal = async (mealId) => {
        if (!confirm('Are you sure you want to delete this meal?')) return;

        setError(null);
        try {
            await api.deleteMeal(mealId);
            fetchDailyMeals();
        } catch (err) {
            console.error('Error deleting meal:', err);
            setError(err.message || 'Failed to delete meal');
        }
    };

    const getMealsByType = (type) => {
        return meals.filter(meal => meal.meal_type === type);
    };

    const formatMealType = (type) => {
        return type.charAt(0).toUpperCase() + type.slice(1);
    };

    const getProgressPercentage = (consumed, target) => {
        if (!target || target === 0) return 0;
        return Math.min(Math.round((consumed / target) * 100), 100);
    };

    const getProgressColor = (percentage) => {
        if (percentage < 50) return 'bg-green-500';
        if (percentage < 80) return 'bg-yellow-500';
        if (percentage < 100) return 'bg-orange-500';
        return 'bg-red-500';
    };

    if (authLoading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">📊 Meal Tracker</h1>
                    <p className="text-gray-600">Track your daily meals and nutrition</p>
                </div>

                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                            Select Date
                        </label>
                        <input
                            type="date"
                            id="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            max={new Date().toISOString().split('T')[0]}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-md"
                    >
                        + Add Meal
                    </button>
                </div>

                {!loading && (!user.has_completed_health_survey || !healthProfile) ? (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mb-8">
                        <div className="flex items-center gap-3 mb-3">
                            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h3 className="text-lg font-bold text-yellow-900">Complete Your Health Survey</h3>
                        </div>
                        <p className="text-yellow-800 mb-4">
                            To see your daily nutrition targets and track your progress, please complete the health survey first.
                        </p>
                        <a
                            href="/my/health-survey"
                            className="inline-block px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium"
                        >
                            Take Health Survey
                        </a>
                    </div>
                ) : null}

                {dailyTotals && dailyTotals.consumed && dailyTotals.target && dailyTotals.remaining && (
                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Daily Summary</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-600">Calories</span>
                                    <span className="text-sm font-bold text-gray-800">
                                        {Math.round(dailyTotals.consumed.calories || 0)} / {Math.round(dailyTotals.target.calories || 0)}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className={`h-3 rounded-full transition-all ${getProgressColor(getProgressPercentage(dailyTotals.consumed.calories || 0, dailyTotals.target.calories || 1))}`}
                                        style={{ width: `${getProgressPercentage(dailyTotals.consumed.calories || 0, dailyTotals.target.calories || 1)}%` }}
                                    ></div>
                                </div>
                                <p className="text-xs text-gray-500">
                                    {Math.round(dailyTotals.remaining.calories || 0)} kcal remaining
                                </p>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-600">Protein</span>
                                    <span className="text-sm font-bold text-gray-800">
                                        {Math.round(dailyTotals.consumed.protein_g || 0)} / {Math.round(dailyTotals.target.protein_g || 0)}g
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className={`h-3 rounded-full transition-all ${getProgressColor(getProgressPercentage(dailyTotals.consumed.protein_g || 0, dailyTotals.target.protein_g || 1))}`}
                                        style={{ width: `${getProgressPercentage(dailyTotals.consumed.protein_g || 0, dailyTotals.target.protein_g || 1)}%` }}
                                    ></div>
                                </div>
                                <p className="text-xs text-gray-500">
                                    {Math.round(dailyTotals.remaining.protein_g || 0)}g remaining
                                </p>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-600">Carbs</span>
                                    <span className="text-sm font-bold text-gray-800">
                                        {Math.round(dailyTotals.consumed.carbs_g || 0)} / {Math.round(dailyTotals.target.carbs_g || 0)}g
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className={`h-3 rounded-full transition-all ${getProgressColor(getProgressPercentage(dailyTotals.consumed.carbs_g || 0, dailyTotals.target.carbs_g || 1))}`}
                                        style={{ width: `${getProgressPercentage(dailyTotals.consumed.carbs_g || 0, dailyTotals.target.carbs_g || 1)}%` }}
                                    ></div>
                                </div>
                                <p className="text-xs text-gray-500">
                                    {Math.round(dailyTotals.remaining.carbs_g || 0)}g remaining
                                </p>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-600">Fat</span>
                                    <span className="text-sm font-bold text-gray-800">
                                        {Math.round(dailyTotals.consumed.fat_g || 0)} / {Math.round(dailyTotals.target.fat_g || 0)}g
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className={`h-3 rounded-full transition-all ${getProgressColor(getProgressPercentage(dailyTotals.consumed.fat_g || 0, dailyTotals.target.fat_g || 1))}`}
                                        style={{ width: `${getProgressPercentage(dailyTotals.consumed.fat_g || 0, dailyTotals.target.fat_g || 1)}%` }}
                                    ></div>
                                </div>
                                <p className="text-xs text-gray-500">
                                    {Math.round(dailyTotals.remaining.fat_g || 0)}g remaining
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-12">
                        <div className="text-xl text-gray-600">Loading meals...</div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {['breakfast', 'lunch', 'dinner', 'snack'].map((mealType) => {
                            const typeMeals = getMealsByType(mealType);
                            return (
                                <div key={mealType} className="bg-white rounded-2xl shadow-lg p-6">
                                    <h3 className="text-xl font-bold text-gray-800 mb-4">
                                        {formatMealType(mealType)} ({typeMeals.length})
                                    </h3>
                                    {typeMeals.length === 0 ? (
                                        <p className="text-gray-500 italic">No meals logged for {mealType}</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {typeMeals.map((meal) => (
                                                <div
                                                    key={meal._id}
                                                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                                >
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-gray-800">{meal.food_name}</h4>
                                                        {meal.serving_size && (
                                                            <p className="text-sm text-gray-600">{meal.serving_size}</p>
                                                        )}
                                                        <div className="flex gap-4 mt-2 text-sm text-gray-600">
                                                            <span className="font-medium">{Math.round(meal.calories)} cal</span>
                                                            <span>P: {Math.round(meal.protein_g)}g</span>
                                                            <span>C: {Math.round(meal.carbs_g)}g</span>
                                                            <span>F: {Math.round(meal.fat_g)}g</span>
                                                        </div>
                                                        {meal.notes && (
                                                            <p className="text-xs text-gray-500 mt-1 italic">{meal.notes}</p>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-2 ml-4">
                                                        <button
                                                            onClick={() => openEditModal(meal)}
                                                            className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteMeal(meal._id)}
                                                            className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {showAddModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-gray-800">✨ Add Meal with AI</h2>
                                    <button
                                        onClick={() => {
                                            setShowAddModal(false);
                                            resetForm();
                                        }}
                                        className="text-gray-500 hover:text-gray-700 text-2xl"
                                    >
                                        ×
                                    </button>
                                </div>

                                <div className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
                                    <div className="flex items-start gap-3">
                                        <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <div>
                                            <p className="text-sm font-medium text-blue-900 mb-1">AI-Powered Quick Add</p>
                                            <p className="text-xs text-blue-700">
                                                Just enter what you ate (e.g., "Chicken breast" or "2 slices of pizza"), and our AI will analyze the nutrition for you!
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <form onSubmit={handleAddMeal} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Meal Type *
                                        </label>
                                        <select
                                            name="meal_type"
                                            value={formData.meal_type}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            required
                                        >
                                            <option value="breakfast">🍳 Breakfast</option>
                                            <option value="lunch">🍱 Lunch</option>
                                            <option value="dinner">🍽️ Dinner</option>
                                            <option value="snack">🍎 Snack</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            What did you eat? *
                                        </label>
                                        <input
                                            type="text"
                                            name="food_name"
                                            value={formData.food_name}
                                            onChange={handleInputChange}
                                            placeholder="e.g., Grilled chicken breast, Pasta carbonara, Apple"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Portion/Serving (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            name="portion_description"
                                            value={formData.portion_description}
                                            onChange={handleInputChange}
                                            placeholder="e.g., 200g, 1 medium bowl, 2 slices, 1 cup"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            💡 Adding portion details helps AI give more accurate results
                                        </p>
                                    </div>

                                    {!formData.calories && !showManualEntry && (
                                        <button
                                            type="button"
                                            onClick={analyzeFood}
                                            disabled={analyzingFood || !formData.food_name}
                                            className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {analyzingFood ? (
                                                <>
                                                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    <span>Analyzing with AI...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                                    </svg>
                                                    <span>✨ Analyze with AI</span>
                                                </>
                                            )}
                                        </button>
                                    )}

                                    {!formData.calories && (
                                        <button
                                            type="button"
                                            onClick={() => setShowManualEntry(true)}
                                            className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium"
                                        >
                                            Or enter nutrition details manually →
                                        </button>
                                    )}

                                    {(formData.calories || showManualEntry) && (
                                        <div className="space-y-4 pt-4 border-t border-gray-200">
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="text-lg font-semibold text-gray-800">
                                                    {formData.calories && !showManualEntry ? '✅ Nutrition Details' : '📝 Enter Nutrition Details'}
                                                </h3>
                                                {formData.calories && !showManualEntry && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowManualEntry(true)}
                                                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                                                    >
                                                        Edit
                                                    </button>
                                                )}
                                            </div>

                                            {formData.calories && !showManualEntry && (
                                                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                                                    <p className="text-sm text-green-800">
                                                        ✨ AI has analyzed your food. Review the details below and adjust if needed.
                                                    </p>
                                                </div>
                                            )}

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Calories *
                                                    </label>
                                                    <input
                                                        type="number"
                                                        name="calories"
                                                        value={formData.calories}
                                                        onChange={handleInputChange}
                                                        step="0.1"
                                                        min="0"
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Protein (g)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        name="protein_g"
                                                        value={formData.protein_g}
                                                        onChange={handleInputChange}
                                                        step="0.1"
                                                        min="0"
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Carbs (g)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        name="carbs_g"
                                                        value={formData.carbs_g}
                                                        onChange={handleInputChange}
                                                        step="0.1"
                                                        min="0"
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Fat (g)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        name="fat_g"
                                                        value={formData.fat_g}
                                                        onChange={handleInputChange}
                                                        step="0.1"
                                                        min="0"
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Serving Size
                                                </label>
                                                <input
                                                    type="text"
                                                    name="serving_size"
                                                    value={formData.serving_size}
                                                    onChange={handleInputChange}
                                                    placeholder="e.g., 1 cup, 100g, 2 slices"
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Notes (Optional)
                                                </label>
                                                <textarea
                                                    name="notes"
                                                    value={formData.notes}
                                                    onChange={handleInputChange}
                                                    rows="2"
                                                    placeholder="Optional notes about this meal"
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                ></textarea>
                                            </div>
                                        </div>
                                    )}

                                    {(formData.calories || showManualEntry) && (
                                        <div className="flex gap-4 pt-4">
                                            <button
                                                type="submit"
                                                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                                            >
                                                Add Meal
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowAddModal(false);
                                                    resetForm();
                                                }}
                                                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    )}
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {showEditModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-gray-800">Edit Meal</h2>
                                    <button
                                        onClick={() => {
                                            setShowEditModal(false);
                                            setEditingMeal(null);
                                            resetForm();
                                        }}
                                        className="text-gray-500 hover:text-gray-700 text-2xl"
                                    >
                                        ×
                                    </button>
                                </div>

                                <form onSubmit={handleEditMeal} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Meal Type *
                                        </label>
                                        <select
                                            name="meal_type"
                                            value={formData.meal_type}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            required
                                        >
                                            <option value="breakfast">Breakfast</option>
                                            <option value="lunch">Lunch</option>
                                            <option value="dinner">Dinner</option>
                                            <option value="snack">Snack</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Food Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="food_name"
                                            value={formData.food_name}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Calories *
                                            </label>
                                            <input
                                                type="number"
                                                name="calories"
                                                value={formData.calories}
                                                onChange={handleInputChange}
                                                step="0.1"
                                                min="0"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Protein (g)
                                            </label>
                                            <input
                                                type="number"
                                                name="protein_g"
                                                value={formData.protein_g}
                                                onChange={handleInputChange}
                                                step="0.1"
                                                min="0"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Carbs (g)
                                            </label>
                                            <input
                                                type="number"
                                                name="carbs_g"
                                                value={formData.carbs_g}
                                                onChange={handleInputChange}
                                                step="0.1"
                                                min="0"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Fat (g)
                                            </label>
                                            <input
                                                type="number"
                                                name="fat_g"
                                                value={formData.fat_g}
                                                onChange={handleInputChange}
                                                step="0.1"
                                                min="0"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Serving Size
                                        </label>
                                        <input
                                            type="text"
                                            name="serving_size"
                                            value={formData.serving_size}
                                            onChange={handleInputChange}
                                            placeholder="e.g., 1 cup, 100g, 2 slices"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Notes
                                        </label>
                                        <textarea
                                            name="notes"
                                            value={formData.notes}
                                            onChange={handleInputChange}
                                            rows="3"
                                            placeholder="Optional notes about this meal"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        ></textarea>
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <button
                                            type="submit"
                                            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                        >
                                            Update Meal
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowEditModal(false);
                                                setEditingMeal(null);
                                                resetForm();
                                            }}
                                            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
