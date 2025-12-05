'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function RecipesPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [recipes, setRecipes] = useState([]);
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState('grid');
    const [showLogModal, setShowLogModal] = useState(false);
    const [logFormData, setLogFormData] = useState({
        meal_type: 'lunch',
        servings: 1,
        notes: '',
    });

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user) {
            loadRandomRecipes();
        }
    }, [user]);

    const loadRandomRecipes = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.getRandomRecipes(9);
            setRecipes(response.data || []);
        } catch (err) {
            setError(err.message || 'Failed to load recipes');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) {
            loadRandomRecipes();
            return;
        }

        setLoading(true);
        setError(null);
        setSelectedRecipe(null);

        try {
            const response = await api.searchRecipes(searchQuery);
            setRecipes(response.data || []);
        } catch (err) {
            setError(err.message || 'Failed to search recipes');
        } finally {
            setLoading(false);
        }
    };

    const handleRecipeClick = async (mealId) => {
        setLoading(true);
        setError(null);

        try {
            const response = await api.getRecipeById(mealId);
            setSelectedRecipe(response.data);
            setViewMode('detail');
        } catch (err) {
            setError(err.message || 'Failed to load recipe details');
        } finally {
            setLoading(false);
        }
    };

    const getIngredients = (meal) => {
        const ingredients = [];
        for (let i = 1; i <= 20; i++) {
            const ingredient = meal[`strIngredient${i}`];
            const measure = meal[`strMeasure${i}`];
            if (ingredient && ingredient.trim()) {
                ingredients.push({ ingredient, measure: measure || '' });
            }
        }
        return ingredients;
    };

    const openLogModal = () => {
        setLogFormData({
            meal_type: 'lunch',
            servings: 1,
            notes: '',
        });
        setShowLogModal(true);
    };

    const handleLogRecipe = async (e) => {
        e.preventDefault();

        if (!selectedRecipe) return;

        try {


            const mealData = {
                meal_type: logFormData.meal_type,
                food_name: selectedRecipe.strMeal,
                calories: 0,                 protein_g: 0,
                carbs_g: 0,
                fat_g: 0,
                serving_size: `${logFormData.servings} serving(s)`,
                notes: `${selectedRecipe.strCategory || ''} ${selectedRecipe.strArea || ''} recipe. ${logFormData.notes}`.trim(),
            };

            await api.logMeal(mealData);
            setShowLogModal(false);

            const successDiv = document.createElement('div');
            successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 max-w-md';
            successDiv.innerHTML = '<div><strong>✓ Recipe logged!</strong><br/><small>Visit Meal Tracker to add nutrition details</small></div>';
            document.body.appendChild(successDiv);
            setTimeout(() => successDiv.remove(), 4000);
        } catch (err) {
            console.error('Error logging recipe:', err);
            setError(err.message || 'Failed to log recipe');
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
                        <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => {
                                    if (viewMode === 'detail') {
                                        setViewMode('grid');
                                        setSelectedRecipe(null);
                                    } else {
                                        router.push('/my');
                                    }
                                }}
                                className="text-gray-600 hover:text-gray-900"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {viewMode === 'detail' ? 'Recipe Details' : 'Healthy Recipes'}
                            </h1>
                        </div>
                        <button
                            onClick={loadRandomRecipes}
                            disabled={loading}
                            className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 disabled:opacity-50 transition-colors text-sm font-medium"
                        >
                            🔄 Refresh
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                                {viewMode === 'grid' && (
                    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                        <form onSubmit={handleSearch} className="flex gap-4">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search recipes (e.g., chicken, pasta, vegetarian)"
                                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                            >
                                {loading ? 'Searching...' : 'Search'}
                            </button>
                        </form>
                    </div>
                )}

                                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-8">
                        {error}
                    </div>
                )}

                                {loading && viewMode === 'grid' && (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                    </div>
                )}

                                {viewMode === 'grid' && !loading && (
                    <>
                        {recipes.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-md p-12 text-center">
                                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Recipes Found</h3>
                                <p className="text-gray-500">Try a different search term or browse random recipes</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {recipes.map((recipe) => (
                                    <div
                                        key={recipe.idMeal}
                                        onClick={() => handleRecipeClick(recipe.idMeal)}
                                        className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition-all transform hover:-translate-y-1"
                                    >
                                        <div className="relative h-48">
                                            {recipe.strMealThumb ? (
                                                <img
                                                    src={recipe.strMealThumb}
                                                    alt={recipe.strMeal}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                                    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-6">
                                            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                                                {recipe.strMeal}
                                            </h3>
                                            <div className="flex flex-wrap gap-2">
                                                {recipe.strCategory && (
                                                    <span className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                                                        {recipe.strCategory}
                                                    </span>
                                                )}
                                                {recipe.strArea && (
                                                    <span className="text-xs px-3 py-1 bg-purple-100 text-purple-700 rounded-full">
                                                        {recipe.strArea}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                                {viewMode === 'detail' && selectedRecipe && (
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                                                {selectedRecipe.strMealThumb && (
                            <div className="relative h-96">
                                <img
                                    src={selectedRecipe.strMealThumb}
                                    alt={selectedRecipe.strMeal}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}

                        <div className="p-8">
                                                        <div className="mb-6">
                                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                                    {selectedRecipe.strMeal}
                                </h1>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {selectedRecipe.strCategory && (
                                        <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-medium">
                                            {selectedRecipe.strCategory}
                                        </span>
                                    )}
                                    {selectedRecipe.strArea && (
                                        <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full font-medium">
                                            {selectedRecipe.strArea} Cuisine
                                        </span>
                                    )}
                                </div>
                                {selectedRecipe.strTags && (
                                    <div className="flex flex-wrap gap-2">
                                        {selectedRecipe.strTags.split(',').map((tag, index) => (
                                            <span key={index} className="text-sm px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
                                                #{tag.trim()}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="grid md:grid-cols-3 gap-8">
                                                                <div className="md:col-span-1">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Ingredients</h2>
                                    <div className="bg-gray-50 rounded-lg p-6">
                                        <ul className="space-y-3">
                                            {getIngredients(selectedRecipe).map((item, index) => (
                                                <li key={index} className="flex items-start">
                                                    <span className="text-green-600 mr-2">✓</span>
                                                    <span className="text-gray-700">
                                                        <span className="font-medium">{item.measure}</span> {item.ingredient}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                                                <div className="md:col-span-2">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Instructions</h2>
                                    <div className="prose prose-green max-w-none">
                                        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                            {selectedRecipe.strInstructions}
                                        </p>
                                    </div>

                                                                        {selectedRecipe.strYoutube && (
                                        <div className="mt-6">
                                            <a
                                                href={selectedRecipe.strYoutube}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                                            >
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                                </svg>
                                                Watch Video Tutorial
                                            </a>
                                        </div>
                                    )}

                                                                        {selectedRecipe.strSource && (
                                        <div className="mt-4">
                                            <a
                                                href={selectedRecipe.strSource}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-green-600 hover:text-green-700 font-medium inline-flex items-center gap-1"
                                            >
                                                View Original Recipe
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                            </a>
                                        </div>
                                    )}

                                                                        <div className="mt-8 pt-6 border-t border-gray-200">
                                        <button
                                            onClick={openLogModal}
                                            className="w-full sm:w-auto px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            Log This Recipe
                                        </button>
                                        <p className="text-sm text-gray-500 mt-2">
                                            💡 You can add nutrition details later in the Meal Tracker
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

                        {showLogModal && selectedRecipe && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-800">Log Recipe</h2>
                                <button
                                    onClick={() => setShowLogModal(false)}
                                    className="text-gray-500 hover:text-gray-700 text-2xl"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                <h3 className="font-bold text-gray-900 mb-2">{selectedRecipe.strMeal}</h3>
                                <div className="text-sm text-gray-600">
                                    <p>{selectedRecipe.strCategory} • {selectedRecipe.strArea}</p>
                                </div>
                            </div>

                            <form onSubmit={handleLogRecipe} className="space-y-4">
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
                                        Number of Servings *
                                    </label>
                                    <input
                                        type="number"
                                        value={logFormData.servings}
                                        onChange={(e) => setLogFormData({ ...logFormData, servings: e.target.value })}
                                        min="0.5"
                                        step="0.5"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Notes (Optional)
                                    </label>
                                    <textarea
                                        value={logFormData.notes}
                                        onChange={(e) => setLogFormData({ ...logFormData, notes: e.target.value })}
                                        rows="3"
                                        placeholder="Add any notes about this recipe..."
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    ></textarea>
                                </div>

                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                    <p className="text-xs text-yellow-800">
                                        <strong>Note:</strong> Nutrition values will be set to 0. You can edit them later in the Meal Tracker to add accurate nutrition information.
                                    </p>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="submit"
                                        className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                                    >
                                        Log Recipe
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowLogModal(false)}
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
