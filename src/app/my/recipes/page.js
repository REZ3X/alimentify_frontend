'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

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
        setViewMode('grid');

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
            window.scrollTo({ top: 0, behavior: 'smooth' });
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
                calories: 0,
                protein_g: 0,
                carbs_g: 0,
                fat_g: 0,
                serving_size: `${logFormData.servings} serving(s)`,
                notes: `${selectedRecipe.strCategory || ''} ${selectedRecipe.strArea || ''} recipe. ${logFormData.notes}`.trim(),
            };

            await api.logMeal(mealData);
            setShowLogModal(false);

            // Custom toast notification
            const successDiv = document.createElement('div');
            successDiv.className = 'fixed top-24 right-4 bg-white/90 backdrop-blur-xl border border-[#FAB12F]/30 text-gray-800 px-6 py-4 rounded-2xl shadow-xl shadow-[#FAB12F]/10 z-50 max-w-md flex items-center gap-3 animate-in slide-in-from-right duration-300';
            successDiv.innerHTML = `
                <div class="w-8 h-8 bg-[#FAB12F]/20 rounded-full flex items-center justify-center text-[#FAB12F]">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <div>
                    <strong class="block font-bold">Recipe Logged!</strong>
                    <span class="text-sm text-gray-500">Added to your meal tracker</span>
                </div>
            `;
            document.body.appendChild(successDiv);
            setTimeout(() => {
                successDiv.classList.add('animate-out', 'fade-out', 'slide-out-to-right');
                setTimeout(() => successDiv.remove(), 300);
            }, 4000);
        } catch (err) {
            console.error('Error logging recipe:', err);
            setError(err.message || 'Failed to log recipe');
        }
    };

    if (authLoading) {
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

            <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => {
                                if (viewMode === 'detail') {
                                    setViewMode('grid');
                                    setSelectedRecipe(null);
                                } else {
                                    router.back();
                                }
                            }}
                            className="p-3 rounded-full bg-white/50 hover:bg-white text-gray-600 hover:text-[#FAB12F] transition-all duration-300 shadow-sm border border-white/50 group cursor-pointer"
                        >
                            <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                                {viewMode === 'detail' ? 'Recipe Details' : 'Discover Recipes'}
                            </h1>
                            <p className="text-sm text-gray-500 font-medium font-mono">
                                {viewMode === 'detail' ? 'Cook something delicious 👨‍🍳' : 'Find your next healthy meal 🥗'}
                            </p>
                        </div>
                    </div>


                </div>

                {/* Search Bar & Refresh (Only in Grid Mode) */}
                {viewMode === 'grid' && (
                    <div className="max-w-2xl mx-auto flex items-stretch gap-3">
                        <div className="flex-1 bg-white/60 backdrop-blur-xl rounded-3xl shadow-sm border border-white/50 hover:shadow-md transition-all duration-300 group focus-within:ring-2 focus-within:ring-[#FAB12F]/50">
                            <form onSubmit={handleSearch} className="flex items-center p-2">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search recipes..."
                                    className="w-full px-6 py-2 bg-transparent border-none focus:ring-0 text-gray-900 placeholder-gray-400 font-medium"
                                />
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="p-3 bg-[#FAB12F] text-white rounded-2xl font-bold shadow-lg shadow-[#FAB12F]/20 hover:bg-[#FA812F] transition-all duration-300 disabled:opacity-70 cursor-pointer"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    )}
                                </button>
                            </form>
                        </div>

                        <button
                            onClick={loadRandomRecipes}
                            disabled={loading}
                            className="px-5 bg-white/60 backdrop-blur-xl hover:bg-white text-gray-600 hover:text-[#FAB12F] rounded-3xl border border-white/50 shadow-sm hover:shadow-md transition-all duration-300 group flex items-center justify-center cursor-pointer"
                            title="Refresh Recommendations"
                        >
                            <svg className={`w-6 h-6 transform group-hover:rotate-180 transition-transform duration-500 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50/80 backdrop-blur-sm text-red-600 p-4 rounded-2xl text-sm font-medium border border-red-100 flex items-center gap-3 animate-in slide-in-from-top-2 max-w-2xl mx-auto">
                        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {error}
                    </div>
                )}

                {/* Content Area */}
                {loading && viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="bg-white/40 backdrop-blur-md rounded-4xl h-80 animate-pulse"></div>
                        ))}
                    </div>
                ) : viewMode === 'grid' ? (
                    <>
                        {recipes.length === 0 ? (
                            <div className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] p-12 text-center shadow-sm border border-white/50 max-w-md mx-auto mt-12">
                                <div className="w-20 h-20 bg-[#FAB12F]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <svg className="w-10 h-10 text-[#FAB12F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">No Recipes Found</h3>
                                <p className="text-gray-500">Try searching for something else or refresh for random ideas.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {recipes.map((recipe) => (
                                    <div
                                        key={recipe.idMeal}
                                        onClick={() => handleRecipeClick(recipe.idMeal)}
                                        className="group bg-white/60 backdrop-blur-xl rounded-4xl overflow-hidden border border-white/50 shadow-sm hover:shadow-xl hover:shadow-[#FAB12F]/10 transition-all duration-300 cursor-pointer hover:-translate-y-1"
                                    >
                                        <div className="relative h-56 overflow-hidden">
                                            {recipe.strMealThumb ? (
                                                <img
                                                    src={recipe.strMealThumb}
                                                    alt={recipe.strMeal}
                                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                                    <span className="text-gray-400">No Image</span>
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        </div>
                                        <div className="p-6">
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                {recipe.strCategory && (
                                                    <span className="px-3 py-1 bg-[#FAB12F]/10 text-[#FAB12F] text-xs font-bold rounded-full uppercase tracking-wider">
                                                        {recipe.strCategory}
                                                    </span>
                                                )}
                                                {recipe.strArea && (
                                                    <span className="px-3 py-1 bg-orange-100 text-orange-600 text-xs font-bold rounded-full uppercase tracking-wider">
                                                        {recipe.strArea}
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900 line-clamp-2 group-hover:text-[#FAB12F] transition-colors">
                                                {recipe.strMeal}
                                            </h3>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    // Detail View
                    selectedRecipe && (
                        <div className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] overflow-hidden shadow-xl border border-white/50 animate-in fade-in slide-in-from-bottom-8 duration-500">
                            <div className="relative h-80 md:h-96">
                                <img
                                    src={selectedRecipe.strMealThumb}
                                    alt={selectedRecipe.strMeal}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent"></div>
                                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                                    <div className="flex flex-wrap gap-3 mb-4">
                                        {selectedRecipe.strCategory && (
                                            <span className="px-4 py-2 bg-[#FAB12F] text-white text-sm font-bold rounded-xl shadow-lg shadow-[#FAB12F]/20">
                                                {selectedRecipe.strCategory}
                                            </span>
                                        )}
                                        {selectedRecipe.strArea && (
                                            <span className="px-4 py-2 bg-white/20 backdrop-blur-md text-white text-sm font-bold rounded-xl border border-white/30">
                                                {selectedRecipe.strArea} Cuisine
                                            </span>
                                        )}
                                    </div>
                                    <h1 className="text-3xl md:text-5xl font-black text-white mb-2 leading-tight">
                                        {selectedRecipe.strMeal}
                                    </h1>
                                    {selectedRecipe.strTags && (
                                        <div className="flex flex-wrap gap-2 text-white/80 text-sm font-medium">
                                            {selectedRecipe.strTags.split(',').map((tag, index) => (
                                                <span key={index}>#{tag.trim()}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-8 md:p-12 grid md:grid-cols-3 gap-12">
                                {/* Ingredients Column */}
                                <div className="md:col-span-1 space-y-6">
                                    <div className="bg-white/50 rounded-4xl p-6 border border-white/50 shadow-inner">
                                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                            <span className="w-8 h-8 bg-[#FAB12F]/20 rounded-full flex items-center justify-center text-[#FAB12F]">🥕</span>
                                            Ingredients
                                        </h2>
                                        <ul className="space-y-4">
                                            {getIngredients(selectedRecipe).map((item, index) => (
                                                <li key={index} className="flex items-start gap-3 group">
                                                    <div className="w-5 h-5 rounded-full border-2 border-[#FAB12F] flex items-center justify-center mt-0.5 group-hover:bg-[#FAB12F] transition-colors">
                                                        <svg className="w-3 h-3 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </div>
                                                    <span className="text-gray-700 text-sm">
                                                        <span className="font-bold text-gray-900">{item.measure}</span> {item.ingredient}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="relative group">
                                        {/* <button
                                            disabled
                                            className="w-full py-4 bg-gray-300 text-gray-500 rounded-2xl font-bold cursor-not-allowed flex items-center justify-center gap-2 opacity-60"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            Log This Meal
                                        </button> */}
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-4 py-2 bg-gray-800 text-white text-sm rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                            Logging from recipes is currently unavailable
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Instructions Column */}
                                <div className="md:col-span-2 space-y-8">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                            <span className="w-8 h-8 bg-[#FAB12F]/20 rounded-full flex items-center justify-center text-[#FAB12F]">📝</span>
                                            Instructions
                                        </h2>
                                        <div className="prose prose-orange max-w-none">
                                            <p className="text-gray-700 leading-relaxed whitespace-pre-line text-lg">
                                                {selectedRecipe.strInstructions}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-4 pt-6 border-t border-gray-200/50">
                                        {selectedRecipe.strYoutube && (
                                            <a
                                                href={selectedRecipe.strYoutube}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-6 py-3 bg-red-500 text-white rounded-xl font-bold shadow-lg shadow-red-500/20 hover:shadow-red-500/40 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
                                            >
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                                </svg>
                                                Watch Tutorial
                                            </a>
                                        )}
                                        {selectedRecipe.strSource && (
                                            <a
                                                href={selectedRecipe.strSource}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-6 py-3 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 flex items-center gap-2"
                                            >
                                                Original Recipe
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                )}
            </main>

            {/* Log Modal */}
            {showLogModal && selectedRecipe && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowLogModal(false)}></div>
                    <div className="relative bg-[#FEF3E2] rounded-[2.5rem] shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-300">
                        {/* Modal Header */}
                        <div className="bg-[#FAB12F] p-6 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                            <h2 className="text-2xl font-black relative z-10">Log Meal</h2>
                            <p className="text-white/80 text-sm font-medium relative z-10">{selectedRecipe.strMeal}</p>
                            <button
                                onClick={() => setShowLogModal(false)}
                                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors cursor-pointer"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="p-8">
                            <form onSubmit={handleLogRecipe} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Meal Type</label>
                                    <div className="relative">
                                        <select
                                            value={logFormData.meal_type}
                                            onChange={(e) => setLogFormData({ ...logFormData, meal_type: e.target.value })}
                                            className="w-full px-6 py-4 bg-white border border-white/50 rounded-2xl appearance-none focus:ring-2 focus:ring-[#FAB12F] focus:border-transparent text-gray-900 shadow-sm"
                                        >
                                            <option value="breakfast">Breakfast</option>
                                            <option value="lunch">Lunch</option>
                                            <option value="dinner">Dinner</option>
                                            <option value="snack">Snack</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center px-6 pointer-events-none text-gray-500">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Servings</label>
                                    <input
                                        type="number"
                                        value={logFormData.servings}
                                        onChange={(e) => setLogFormData({ ...logFormData, servings: e.target.value })}
                                        min="0.5"
                                        step="0.5"
                                        className="w-full px-6 py-4 bg-white border border-white/50 rounded-2xl focus:ring-2 focus:ring-[#FAB12F] focus:border-transparent text-gray-900 shadow-sm"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Notes</label>
                                    <textarea
                                        value={logFormData.notes}
                                        onChange={(e) => setLogFormData({ ...logFormData, notes: e.target.value })}
                                        rows="3"
                                        placeholder="Any modifications?"
                                        className="w-full px-6 py-4 bg-white border border-white/50 rounded-2xl focus:ring-2 focus:ring-[#FAB12F] focus:border-transparent text-gray-900 shadow-sm resize-none"
                                    ></textarea>
                                </div>

                                <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 flex gap-3">
                                    <svg className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    <p className="text-xs text-orange-800 font-medium">
                                        Nutrition values will be estimated. You can edit them in the Meal Tracker later.
                                    </p>
                                </div>

                                {/* <div className="flex gap-4 pt-2">
                                    <button
                                        type="submit"
                                        className="flex-1 py-4 bg-linear-to-r from-[#FAB12F] to-[#FA812F] text-white rounded-2xl font-bold shadow-lg shadow-[#FAB12F]/20 hover:shadow-[#FAB12F]/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                                    >
                                        Log Recipe
                                    </button>
                                </div> */}
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
