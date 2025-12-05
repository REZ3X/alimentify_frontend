'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function NutritionSearchPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [region, setRegion] = useState('global');
    const [loggingMeal, setLoggingMeal] = useState(null);
    const [showLogModal, setShowLogModal] = useState(false);
    const [logFormData, setLogFormData] = useState({
        meal_type: 'breakfast',
        notes: '',
    });
    const [suggestions] = useState([
        '100g chicken breast',
        '1 medium apple',
        '200g cooked rice',
        '150g salmon',
        '1 cup broccoli',
        '2 eggs',
    ]);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/login');
        } else if (user && !results && !loading) {

            loadPopularFoods();
        }
    }, [user, authLoading, router]);

    const loadPopularFoods = async () => {
        const popularSearches = ['apple', 'chicken breast', 'rice', 'banana', 'salmon', 'broccoli'];
        const randomSearch = popularSearches[Math.floor(Math.random() * popularSearches.length)];

        setLoading(true);
        setError(null);

        try {
            const response = await api.searchNutrition(randomSearch);
            setResults(response.data);
            setSearchQuery(randomSearch);
        } catch (err) {
            console.error('Failed to load popular foods:', err);

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
            loadNutritionInfo(randomSuggestion);
        }
    }, [user]);

    const loadNutritionInfo = async (query) => {
        setSearchQuery(query);
        setLoading(true);
        setError(null);
        setResults(null);

        try {
            const response = await api.getNutritionInfo(query);
            setResults(response.data);
        } catch (err) {
            setError(err.message || 'Failed to get nutrition information');
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        loadNutritionInfo(searchQuery);
    };

    const openLogModal = (item) => {
        setLoggingMeal(item);
        setLogFormData({
            meal_type: 'breakfast',
            notes: '',
        });
        setShowLogModal(true);
    };

    const handleLogMeal = async (e) => {
        e.preventDefault();

        if (!loggingMeal) return;

        try {
            const mealData = {
                meal_type: logFormData.meal_type,
                food_name: loggingMeal.name,
                calories: parseFloat(loggingMeal.calories) || 0,
                protein_g: parseFloat(loggingMeal.protein_g) || 0,
                carbs_g: parseFloat(loggingMeal.carbohydrates_total_g) || 0,
                fat_g: parseFloat(loggingMeal.fat_total_g) || 0,
                serving_size: `${loggingMeal.serving_size_g}g`,
                notes: logFormData.notes,
            };

            await api.logMeal(mealData);
            setShowLogModal(false);
            setLoggingMeal(null);

            const successDiv = document.createElement('div');
            successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in';
            successDiv.textContent = '✓ Meal logged successfully!';
            document.body.appendChild(successDiv);
            setTimeout(() => successDiv.remove(), 3000);
        } catch (err) {
            console.error('Error logging meal:', err);
            setError(err.message || 'Failed to log meal');
        }
    };

    const navigateToFoodWiki = () => {
        router.push('/my/food-wiki');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => router.push('/my')}
                                className="text-gray-600 hover:text-gray-900"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <h1 className="text-2xl font-bold text-gray-900">Nutrition Search</h1>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                            <h2 className="text-lg font-bold text-gray-900 mb-2">Quick Nutrition Lookup</h2>
                            <p className="text-sm text-gray-600 mb-4">
                                Get instant nutritional information for any food. Try queries like "100g apple" or "1 cup rice".
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                        <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="flex-1 text-sm text-blue-900">
                            <strong>Looking for detailed USDA database?</strong>
                            <button
                                onClick={navigateToFoodWiki}
                                className="ml-2 text-blue-600 hover:text-blue-800 underline font-medium"
                            >
                                Try Food Wiki instead
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                    <form onSubmit={handleSearch} className="space-y-4">
                        <div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="e.g., 100g banana, 2 eggs, 1 cup milk, chicken breast"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                            />
                            <p className="mt-2 text-sm text-gray-500">
                                💡 Tip: Include quantity and unit for accurate results (e.g., "200g" or "2 cups")
                            </p>
                        </div>

                                                <div>
                            <p className="text-sm text-gray-600 mb-2">Quick suggestions:</p>
                            <div className="flex flex-wrap gap-2">
                                {suggestions.map((suggestion, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => loadNutritionInfo(suggestion)}
                                        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-green-100 hover:text-green-700 transition-colors"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !searchQuery.trim()}
                            className="w-full px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium text-lg"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Searching...
                                </span>
                            ) : (
                                'Search Nutrition'
                            )}
                        </button>
                    </form>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-8">
                        {error}
                    </div>
                )}

                {results && results.length > 0 && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900">Results</h2>
                        {results.map((item, index) => (
                            <div key={index} className="bg-white rounded-xl shadow-md p-6">
                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{item.name}</h3>
                                        <p className="text-lg text-gray-600">
                                            Serving Size: <span className="font-semibold">{item.serving_size_g}g</span>
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-3xl font-bold text-green-600">
                                            {item.calories === 0 ? 'N/A' : item.calories}
                                        </div>
                                        <div className="text-sm text-gray-500">calories</div>
                                    </div>
                                </div>

                                {(item.calories === 0 || item.serving_size_g === 0 || item.protein_g === 0) && (
                                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                        <p className="text-sm text-yellow-800">
                                            <strong>Note:</strong> Some nutritional values may be limited in the free tier.
                                            Try <button onClick={navigateToFoodWiki} className="underline font-medium hover:text-yellow-900">Food Wiki</button> for complete data.
                                        </p>
                                    </div>
                                )}

                                <div className="grid grid-cols-3 gap-4 mb-6">
                                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                                        <div className="text-2xl font-bold text-blue-600">
                                            {item.protein_g === 0 ? 'N/A' : `${item.protein_g}g`}
                                        </div>
                                        <div className="text-sm text-gray-600">Protein</div>
                                    </div>
                                    <div className="bg-orange-50 rounded-lg p-4 text-center">
                                        <div className="text-2xl font-bold text-orange-600">{item.carbohydrates_total_g}g</div>
                                        <div className="text-sm text-gray-600">Carbs</div>
                                    </div>
                                    <div className="bg-purple-50 rounded-lg p-4 text-center">
                                        <div className="text-2xl font-bold text-purple-600">{item.fat_total_g}g</div>
                                        <div className="text-sm text-gray-600">Fat</div>
                                    </div>
                                </div>

                                <div className="border-t pt-6 mb-6">
                                    <h4 className="font-bold text-gray-900 mb-4">Detailed Breakdown</h4>
                                    <div className="grid md:grid-cols-2 gap-x-8 gap-y-3">
                                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                            <span className="text-gray-700">Saturated Fat</span>
                                            <span className="font-semibold text-gray-900">{item.fat_saturated_g}g</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                            <span className="text-gray-700">Cholesterol</span>
                                            <span className="font-semibold text-gray-900">{item.cholesterol_mg}mg</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                            <span className="text-gray-700">Sodium</span>
                                            <span className="font-semibold text-gray-900">{item.sodium_mg}mg</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                            <span className="text-gray-700">Potassium</span>
                                            <span className="font-semibold text-gray-900">{item.potassium_mg}mg</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                            <span className="text-gray-700">Fiber</span>
                                            <span className="font-semibold text-gray-900">{item.fiber_g}g</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                            <span className="text-gray-700">Sugar</span>
                                            <span className="font-semibold text-gray-900">{item.sugar_g}g</span>
                                        </div>
                                    </div>
                                </div>

                                                                <button
                                    onClick={() => openLogModal(item)}
                                    disabled={item.calories === 0}
                                    className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Log This Food
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {results && results.length === 0 && (
                    <div className="bg-white rounded-xl shadow-md p-12 text-center">
                        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Results Found</h3>
                        <p className="text-gray-500">Try a different search term or check your spelling.</p>
                    </div>
                )}

                {!results && !loading && (
                    <div className="bg-white rounded-xl shadow-md p-12 text-center">
                        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Search for Nutrition Info</h3>
                        <p className="text-gray-500">Enter a food item with quantity to get started</p>
                    </div>
                )}
            </div>

                        {showLogModal && loggingMeal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-800">Log Meal</h2>
                                <button
                                    onClick={() => {
                                        setShowLogModal(false);
                                        setLoggingMeal(null);
                                    }}
                                    className="text-gray-500 hover:text-gray-700 text-2xl"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                <h3 className="font-bold text-gray-900 mb-2">{loggingMeal.name}</h3>
                                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                                    <div>Calories: <span className="font-semibold">{loggingMeal.calories}</span></div>
                                    <div>Protein: <span className="font-semibold">{loggingMeal.protein_g}g</span></div>
                                    <div>Carbs: <span className="font-semibold">{loggingMeal.carbohydrates_total_g}g</span></div>
                                    <div>Fat: <span className="font-semibold">{loggingMeal.fat_total_g}g</span></div>
                                </div>
                            </div>

                            <form onSubmit={handleLogMeal} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Meal Type *
                                    </label>
                                    <select
                                        value={logFormData.meal_type}
                                        onChange={(e) => setLogFormData({ ...logFormData, meal_type: e.target.value })}
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
                                        Notes (Optional)
                                    </label>
                                    <textarea
                                        value={logFormData.notes}
                                        onChange={(e) => setLogFormData({ ...logFormData, notes: e.target.value })}
                                        rows="3"
                                        placeholder="Add any notes about this meal..."
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    ></textarea>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="submit"
                                        className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                                    >
                                        Log Meal
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowLogModal(false);
                                            setLoggingMeal(null);
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
    );
}
