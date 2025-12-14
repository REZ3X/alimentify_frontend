'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';

export default function FoodWikiPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState(null);
    const [selectedFood, setSelectedFood] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 20;

    // Initial load
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/login');
        } else if (user && !searchResults && !loading) {
            loadPopularFoods();
        }
    }, [user, authLoading, router]);

    const loadPopularFoods = async () => {
        const popularSearches = ['chicken', 'milk', 'bread', 'cheese', 'yogurt', 'beef'];
        const randomSearch = popularSearches[Math.floor(Math.random() * popularSearches.length)];

        setLoading(true);
        setError(null);

        try {
            const response = await api.searchFoods(randomSearch, {
                pageNumber: 1,
                pageSize: pageSize,
            });
            setSearchResults(response.data);
            setSearchQuery(randomSearch);
            setCurrentPage(1);
        } catch (err) {
            console.error('Failed to load popular foods:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setLoading(true);
        setError(null);
        setSelectedFood(null);

        try {
            const response = await api.searchFoods(searchQuery, {
                pageNumber: 1,
                pageSize: pageSize,
            });
            setSearchResults(response.data);
            setCurrentPage(1);
        } catch (err) {
            setError(err.message || 'Failed to search foods');
        } finally {
            setLoading(false);
        }
    };

    const handleFoodClick = async (fdcId) => {
        setLoading(true);
        setError(null);

        try {
            const response = await api.getFoodDetails(fdcId);
            setSelectedFood(response.data);
            // Scroll to top on mobile when selecting
            if (window.innerWidth < 1024) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } catch (err) {
            setError(err.message || 'Failed to load food details');
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = async (newPage) => {
        setCurrentPage(newPage);
        setLoading(true);
        setError(null);

        try {
            const response = await api.searchFoods(searchQuery, {
                pageNumber: newPage,
                pageSize: pageSize,
            });
            setSearchResults(response.data);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
            setError(err.message || 'Failed to search foods');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        if (selectedFood) {
            setSelectedFood(null);
        } else {
            router.push('/my');
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
                            onClick={handleBack}
                            className="p-3 rounded-full bg-white/50 hover:bg-white text-gray-600 hover:text-[#FAB12F] transition-all duration-300 shadow-sm border border-white/50 group cursor-pointer"
                        >
                            <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                                {selectedFood ? 'Food Details' : 'Food Wiki'}
                            </h1>
                            <p className="text-sm text-gray-500 font-medium font-mono">
                                {selectedFood ? 'Nutritional breakdown 📊' : 'Explore nutritional facts 🍎'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Search Bar (Only show when not in detail view on mobile, or always on desktop) */}
                <div className={`max-w-2xl mx-auto ${selectedFood ? 'hidden lg:block' : 'block'}`}>
                    <div className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-sm border border-white/50 hover:shadow-md transition-all duration-300 group focus-within:ring-2 focus-within:ring-[#FAB12F]/50">
                        <form onSubmit={handleSearch} className="flex items-center p-2">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search foods (e.g., avocado, salmon)..."
                                className="w-full px-6 py-2 bg-transparent border-none focus:ring-0 text-gray-900 placeholder-gray-400 font-medium"
                            />
                            <button
                                type="submit"
                                disabled={loading || !searchQuery.trim()}
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

                    {/* Popular Tags */}
                    <div className="mt-4 flex flex-wrap justify-center gap-2">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider py-1">Popular:</span>
                        {['chicken', 'milk', 'bread', 'cheese', 'yogurt', 'beef', 'apple'].map((tag) => (
                            <button
                                key={tag}
                                onClick={() => {
                                    setSearchQuery(tag);
                                    // Ideally trigger search here, but for now just set query
                                }}
                                className="px-3 py-1 text-xs font-bold bg-white/40 border border-white/50 rounded-full text-gray-600 hover:bg-[#FAB12F]/10 hover:text-[#FAB12F] transition-colors cursor-pointer uppercase tracking-wide"
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50/80 backdrop-blur-sm text-red-600 p-4 rounded-2xl text-sm font-medium border border-red-100 flex items-center gap-3 animate-in slide-in-from-top-2 max-w-2xl mx-auto">
                        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {error}
                    </div>
                )}

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative items-start">
                    {/* Search Results List */}
                    <div className={`lg:col-span-5 space-y-4 ${selectedFood ? 'hidden lg:block' : 'block'}`}>
                        {searchResults ? (
                            <>
                                <div className="flex justify-between items-center mb-2 px-2">
                                    <h2 className="text-lg font-black text-gray-800 tracking-tight">
                                        Results <span className="text-gray-500 text-sm font-medium ml-2">({searchResults.totalHits.toLocaleString()})</span>
                                    </h2>
                                </div>

                                {searchResults.foods.length === 0 ? (
                                    <div className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] p-12 text-center shadow-sm border border-white/50">
                                        <p className="text-gray-500 font-medium">No foods found.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {searchResults.foods.map((food) => (
                                            <motion.button
                                                key={food.fdcId}
                                                whileHover={{ scale: 1.01 }}
                                                whileTap={{ scale: 0.99 }}
                                                onClick={() => handleFoodClick(food.fdcId)}
                                                className={`w-full text-left p-5 rounded-3xl border transition-all duration-200 cursor-pointer group ${selectedFood?.fdcId === food.fdcId
                                                        ? 'bg-white/80 border-[#FAB12F] shadow-md ring-1 ring-[#FAB12F]/50'
                                                        : 'bg-white/60 backdrop-blur-xl border-white/50 hover:bg-white hover:shadow-lg hover:shadow-[#FAB12F]/5'
                                                    }`}
                                            >
                                                <h3 className="font-bold text-gray-900 truncate group-hover:text-[#FAB12F] transition-colors">{food.description}</h3>
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {food.dataType && (
                                                        <span className="text-[10px] font-bold px-2 py-1 bg-blue-100/50 text-blue-700 rounded-lg uppercase tracking-wider">
                                                            {food.dataType}
                                                        </span>
                                                    )}
                                                    {food.brandOwner && (
                                                        <span className="text-[10px] font-bold px-2 py-1 bg-purple-100/50 text-purple-700 rounded-lg truncate max-w-[200px] uppercase tracking-wider">
                                                            {food.brandOwner}
                                                        </span>
                                                    )}
                                                </div>
                                            </motion.button>
                                        ))}
                                    </div>
                                )}

                                {/* Pagination */}
                                {searchResults.totalPages > 1 && (
                                    <div className="flex justify-center items-center gap-4 mt-6 pt-4">
                                        <button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1 || loading}
                                            className="p-3 rounded-full bg-white/60 border border-white/50 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm transition-all"
                                        >
                                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                            </svg>
                                        </button>
                                        <span className="text-sm font-bold text-gray-600 font-mono">
                                            Page {currentPage}
                                        </span>
                                        <button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === searchResults.totalPages || loading}
                                            className="p-3 rounded-full bg-white/60 border border-white/50 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm transition-all"
                                        >
                                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-12 bg-white/40 backdrop-blur-md rounded-4xl border border-white/50">
                                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <p className="text-gray-500 font-medium">Start searching to see results</p>
                            </div>
                        )}
                    </div>

                    {/* Detail View */}
                    <div className={`lg:col-span-7 ${selectedFood ? 'block' : 'hidden lg:block'}`}>
                        <AnimatePresence mode="wait">
                            {selectedFood ? (
                                <motion.div
                                    key="details"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 20 }}
                                    className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-[2.5rem] shadow-xl p-8 lg:sticky lg:top-32"
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <h2 className="text-3xl font-black text-gray-900 leading-tight tracking-tight">{selectedFood.description}</h2>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mb-8">
                                        <span className="px-4 py-1.5 bg-blue-100/50 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider border border-blue-100">
                                            {selectedFood.dataType}
                                        </span>
                                        {selectedFood.brandOwner && (
                                            <span className="px-4 py-1.5 bg-purple-100/50 text-purple-700 rounded-full text-xs font-bold uppercase tracking-wider border border-purple-100">
                                                {selectedFood.brandOwner}
                                            </span>
                                        )}
                                    </div>

                                    {selectedFood.ingredients && (
                                        <div className="mb-8 p-6 bg-white/50 rounded-3xl border border-white/60 shadow-sm">
                                            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-lg">
                                                <span className="p-1.5 bg-[#FAB12F]/10 rounded-lg text-[#FAB12F]">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                    </svg>
                                                </span>
                                                Ingredients
                                            </h3>
                                            <p className="text-sm text-gray-600 leading-relaxed font-medium">{selectedFood.ingredients}</p>
                                        </div>
                                    )}

                                    <div className="space-y-8">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                                <span className="p-1.5 bg-[#FAB12F]/10 rounded-lg text-[#FAB12F]">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                    </svg>
                                                </span>
                                                Nutritional Info
                                            </h3>
                                            <div className="bg-white/50 rounded-3xl border border-white/60 overflow-hidden shadow-sm">
                                                <div className="max-h-[400px] overflow-y-auto p-2 custom-scrollbar">
                                                    {selectedFood.foodNutrients && selectedFood.foodNutrients.length > 0 ? (
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2">
                                                            {selectedFood.foodNutrients.map((nutrient, index) => (
                                                                <div key={index} className="flex justify-between items-center p-3 bg-white/40 rounded-2xl border border-white/50 hover:bg-white/60 transition-colors">
                                                                    <span className="text-sm font-medium text-gray-600 truncate pr-2">{nutrient.nutrient.name}</span>
                                                                    <span className="text-sm font-black text-gray-900 whitespace-nowrap">
                                                                        {nutrient.amount ? nutrient.amount.toFixed(2) : '0'} <span className="text-xs text-gray-500 font-normal">{nutrient.nutrient.unitName}</span>
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-gray-500 text-center py-8 font-medium">No nutritional information available</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {selectedFood.foodPortions && selectedFood.foodPortions.length > 0 && (
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                                    <span className="p-1.5 bg-[#FAB12F]/10 rounded-lg text-[#FAB12F]">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                                                        </svg>
                                                    </span>
                                                    Serving Sizes
                                                </h3>
                                                <div className="bg-white/50 rounded-3xl border border-white/60 p-4 space-y-2 shadow-sm">
                                                    {selectedFood.foodPortions.map((portion, index) => (
                                                        <div key={index} className="text-sm text-gray-700 flex justify-between items-center p-3 bg-white/40 rounded-2xl border border-white/50">
                                                            <span className="font-medium">{portion.modifier || 'Serving'}</span>
                                                            <span className="font-bold bg-white/50 px-3 py-1 rounded-lg">
                                                                {portion.amount} {portion.gramWeight && <span className="text-gray-500 font-normal">({portion.gramWeight}g)</span>}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="hidden lg:flex flex-col items-center justify-center h-[600px] bg-white/60 backdrop-blur-xl rounded-[2.5rem] border border-white/50 text-center p-12 shadow-sm sticky top-32">
                                    <div className="w-24 h-24 bg-[#FAB12F]/10 rounded-full flex items-center justify-center mb-6 shadow-inner">
                                        <svg className="w-12 h-12 text-[#FAB12F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">Select a Food</h3>
                                    <p className="text-gray-500 max-w-xs font-medium leading-relaxed">Click on any food item from the list to view its detailed nutritional breakdown, ingredients, and serving sizes.</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </main>
        </div>
    );
}
