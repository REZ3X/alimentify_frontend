'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { notificationManager } from '@/lib/notifications';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import MealModal from '@/components/MealModal';
import { checkFoodForAllergens, formatAllergenWarning } from '@/lib/allergyChecker';

export default function NutritionSearchPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [userAllergies, setUserAllergies] = useState([]);

    // Modal State
    const [showLogModal, setShowLogModal] = useState(false);
    const [selectedFoodForLog, setSelectedFoodForLog] = useState(null);

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

    useEffect(() => {
        const fetchUserAllergies = async () => {
            try {
                const profile = await api.getHealthProfile();
                if (profile && profile.allergies) {
                    setUserAllergies(profile.allergies);
                }
            } catch (err) {
                console.log('No health profile found');
            }
        };
        if (user) {
            fetchUserAllergies();
        }
    }, [user]);

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

    const loadNutritionInfo = async (query) => {
        setSearchQuery(query);
        setLoading(true);
        setError(null);
        setResults(null);

        try {
            const response = await api.getNutritionInfo(query);
            setResults(response.data);
        } catch (err) {
            const errorMessage = err.message || 'Failed to get nutrition information';
            if (errorMessage.includes('unavailable') || errorMessage.includes('service') || errorMessage.includes('503')) {
                notificationManager.error('🔌 Nutrition service temporarily unavailable. Please try again later.');
                setResults(null);
            } else {
                setError(errorMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        loadNutritionInfo(searchQuery);
    };

    const openLogModal = (item) => {
        const initialData = {
            meal_type: 'breakfast',
            food_name: item.name,
            calories: item.calories,
            protein_g: item.protein_g,
            carbs_g: item.carbohydrates_total_g,
            fat_g: item.fat_total_g,
            serving_size: `${item.serving_size_g}g`,
            notes: '',
        };
        setSelectedFoodForLog(initialData);
        setShowLogModal(true);
    };

    const handleLogMeal = async (formData) => {
        try {
            if (userAllergies.length > 0) {
                const allergenCheck = checkFoodForAllergens(formData.food_name, userAllergies);
                if (allergenCheck.hasAllergen) {
                    const warningMessage = formatAllergenWarning(allergenCheck.matchedAllergens, allergenCheck.matchedKeywords);
                    const confirmed = window.confirm(warningMessage);
                    if (!confirmed) {
                        notificationManager.info('Meal logging cancelled due to allergy concerns.');
                        return;
                    }
                }
            }

            await api.logMeal(formData);
            setShowLogModal(false);
            setSelectedFoodForLog(null);

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
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Nutrition Search</h1>
                            <p className="text-sm text-gray-500 font-medium font-mono">Find & Log Your Food 🔍</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* Left Column: Search & Suggestions */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] p-6 sm:p-8 shadow-sm border border-white/50">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Search Food</h2>
                            <form onSubmit={handleSearch} className="space-y-4">
                                <div>
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="e.g., 100g banana"
                                        className="w-full px-6 py-4 bg-white/50 border border-white/50 rounded-2xl focus:ring-2 focus:ring-[#FAB12F] focus:border-transparent text-gray-900 placeholder-gray-400 shadow-inner transition-all"
                                    />
                                    <p className="mt-2 text-xs text-gray-500 ml-2">
                                        💡 Tip: Include quantity (e.g., "200g" or "2 cups")
                                    </p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || !searchQuery.trim()}
                                    className="w-full py-4 bg-linear-to-r from-[#FAB12F] to-[#FA812F] text-white rounded-2xl font-bold shadow-lg shadow-[#FAB12F]/20 hover:shadow-[#FAB12F]/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            Searching...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                            Search
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className="mt-8">
                                <p className="text-sm font-bold text-gray-900 mb-3">Quick Suggestions</p>
                                <div className="flex flex-wrap gap-2">
                                    {suggestions.map((suggestion, index) => (
                                        <button
                                            key={index}
                                            onClick={() => loadNutritionInfo(suggestion)}
                                            className="px-4 py-2 text-sm bg-white/50 text-gray-600 rounded-xl hover:bg-[#FAB12F]/10 hover:text-[#FAB12F] border border-white/50 transition-all duration-200"
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-8 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                                <div className="flex gap-3">
                                    <svg className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div className="text-sm text-blue-900">
                                        <strong>Need more details?</strong>
                                        <button
                                            onClick={navigateToFoodWiki}
                                            className="block mt-1 text-blue-600 hover:text-blue-800 underline font-medium"
                                        >
                                            Check Food Wiki
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Results */}
                    <div className="lg:col-span-2 space-y-6">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-medium border border-red-100 flex items-center gap-3 animate-in slide-in-from-top-2">
                                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                {error}
                            </div>
                        )}

                        {results && results.length > 0 ? (
                            <div className="space-y-6">
                                {results.map((item, index) => (
                                    <div key={index} className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] p-6 sm:p-8 shadow-sm border border-white/50 animate-in slide-in-from-bottom-4 fade-in duration-500" style={{ animationDelay: `${index * 100}ms` }}>
                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                                            <div>
                                                <h3 className="text-2xl font-bold text-gray-900 mb-1 capitalize">{item.name}</h3>
                                                <p className="text-gray-500">
                                                    Serving Size: <span className="font-semibold text-gray-700">{item.serving_size_g}g</span>
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mb-8">
                                            <div className="bg-orange-50/50 rounded-2xl p-4 text-center border border-orange-100">
                                                <div className="text-xl font-bold text-orange-600 mb-1">{item.carbohydrates_total_g}g</div>
                                                <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Carbs</div>
                                            </div>
                                            <div className="bg-purple-50/50 rounded-2xl p-4 text-center border border-purple-100">
                                                <div className="text-xl font-bold text-purple-600 mb-1">{item.fat_total_g}g</div>
                                                <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Fat</div>
                                            </div>
                                        </div>

                                        <div className="bg-white/40 rounded-2xl p-6 mb-6 border border-white/40">
                                            <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                                                Detailed Breakdown
                                            </h4>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-4 text-sm">
                                                {[
                                                    { label: 'Saturated Fat', value: item.fat_saturated_g, unit: 'g' },
                                                    { label: 'Cholesterol', value: item.cholesterol_mg, unit: 'mg' },
                                                    { label: 'Sodium', value: item.sodium_mg, unit: 'mg' },
                                                    { label: 'Potassium', value: item.potassium_mg, unit: 'mg' },
                                                    { label: 'Fiber', value: item.fiber_g, unit: 'g' },
                                                    { label: 'Sugar', value: item.sugar_g, unit: 'g' },
                                                ].map((stat, i) => (
                                                    <div key={i} className="flex flex-col">
                                                        <span className="text-gray-500 text-xs">{stat.label}</span>
                                                        <span className="font-semibold text-gray-900">{stat.value}{stat.unit}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="relative group">
                                            {/* <button
                                                disabled
                                                className="w-full py-4 bg-gray-300 text-gray-500 rounded-2xl font-bold cursor-not-allowed flex items-center justify-center gap-2 opacity-60"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                </svg>
                                                Log This Food
                                            </button> */}
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-4 py-2 bg-gray-800 text-white text-sm rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                                Logging from nutrition search is currently unavailable
                                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            !loading && (
                                <div className="bg-white/40 backdrop-blur-md rounded-[2.5rem] p-12 text-center border border-white/40">
                                    <div className="w-20 h-20 bg-white/50 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Results Found</h3>
                                    <p className="text-gray-500">Try searching for something else or check your spelling.</p>
                                </div>
                            )
                        )}
                    </div>
                </div>
            </main>

            <MealModal
                isOpen={showLogModal}
                onClose={() => setShowLogModal(false)}
                onSubmit={handleLogMeal}
                initialData={selectedFoodForLog}
                isEditing={true}
            />
        </div>
    );
}
