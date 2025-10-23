'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

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

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/login');
        }
    }, [user, authLoading, router]);

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

        setLoading(true);
        setError(null);
        setSelectedFood(null);

        try {
            const response = await api.searchFoods(searchQuery, {
                pageNumber: currentPage,
                pageSize: pageSize,
            });
            setSearchResults(response.data);
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
        } catch (err) {
            setError(err.message || 'Failed to search foods');
        } finally {
            setLoading(false);
        }
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
                            <h1 className="text-2xl font-bold text-gray-900">Food Wiki</h1>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                    <form onSubmit={handleSearch} className="flex gap-4">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search for food (e.g., apple, chicken breast, milk)"
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                        <button
                            type="submit"
                            disabled={loading || !searchQuery.trim()}
                            className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                        >
                            {loading ? 'Searching...' : 'Search'}
                        </button>
                    </form>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-8">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                        {searchResults && (
                            <div className="bg-white rounded-xl shadow-md p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">
                                    Search Results ({searchResults.totalHits.toLocaleString()} found)
                                </h2>

                                {searchResults.foods.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">No foods found. Try a different search term.</p>
                                ) : (
                                    <>
                                        <div className="space-y-2 max-h-[600px] overflow-y-auto">
                                            {searchResults.foods.map((food) => (
                                                <button
                                                    key={food.fdcId}
                                                    onClick={() => handleFoodClick(food.fdcId)}
                                                    className="w-full text-left p-4 hover:bg-green-50 rounded-lg transition-colors border border-gray-200 hover:border-green-300"
                                                >
                                                    <h3 className="font-semibold text-gray-900">{food.description}</h3>
                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                        {food.dataType && (
                                                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                                                {food.dataType}
                                                            </span>
                                                        )}
                                                        {food.brandOwner && (
                                                            <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">
                                                                {food.brandOwner}
                                                            </span>
                                                        )}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>

                                        {searchResults.totalPages > 1 && (
                                            <div className="flex justify-between items-center mt-6 pt-6 border-t">
                                                <button
                                                    onClick={() => handlePageChange(currentPage - 1)}
                                                    disabled={currentPage === 1 || loading}
                                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                                                >
                                                    Previous
                                                </button>
                                                <span className="text-sm text-gray-600">
                                                    Page {currentPage} of {searchResults.totalPages}
                                                </span>
                                                <button
                                                    onClick={() => handlePageChange(currentPage + 1)}
                                                    disabled={currentPage === searchResults.totalPages || loading}
                                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                                                >
                                                    Next
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}

                        {!searchResults && !loading && (
                            <div className="bg-white rounded-xl shadow-md p-12 text-center">
                                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Search for Foods</h3>
                                <p className="text-gray-500">Enter a food name to search the USDA Food Database</p>
                            </div>
                        )}
                    </div>

                    <div>
                        {selectedFood && (
                            <div className="bg-white rounded-xl shadow-md p-6 sticky top-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">{selectedFood.description}</h2>

                                <div className="mb-6">
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        <span className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                                            {selectedFood.dataType}
                                        </span>
                                        {selectedFood.brandOwner && (
                                            <span className="text-xs px-3 py-1 bg-purple-100 text-purple-700 rounded-full">
                                                {selectedFood.brandOwner}
                                            </span>
                                        )}
                                    </div>

                                    {selectedFood.ingredients && (
                                        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                                            <h3 className="font-semibold text-gray-900 mb-2">Ingredients</h3>
                                            <p className="text-sm text-gray-700">{selectedFood.ingredients}</p>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">Nutritional Information</h3>
                                    <div className="max-h-[400px] overflow-y-auto space-y-2">
                                        {selectedFood.foodNutrients && selectedFood.foodNutrients.length > 0 ? (
                                            selectedFood.foodNutrients.map((nutrient, index) => (
                                                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                                                    <span className="text-sm text-gray-700">{nutrient.nutrient.name}</span>
                                                    <span className="text-sm font-semibold text-gray-900">
                                                        {nutrient.amount ? nutrient.amount.toFixed(2) : '0'} {nutrient.nutrient.unitName}
                                                    </span>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-gray-500 text-center py-4">No nutritional information available</p>
                                        )}
                                    </div>
                                </div>

                                {selectedFood.foodPortions && selectedFood.foodPortions.length > 0 && (
                                    <div className="mt-6 pt-6 border-t">
                                        <h3 className="text-lg font-bold text-gray-900 mb-4">Serving Sizes</h3>
                                        <div className="space-y-2">
                                            {selectedFood.foodPortions.map((portion, index) => (
                                                <div key={index} className="text-sm text-gray-700">
                                                    {portion.modifier && <span className="font-medium">{portion.modifier}: </span>}
                                                    {portion.amount && <span>{portion.amount} </span>}
                                                    {portion.gramWeight && <span>({portion.gramWeight}g)</span>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {!selectedFood && !loading && searchResults && (
                            <div className="bg-white rounded-xl shadow-md p-12 text-center">
                                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Food</h3>
                                <p className="text-gray-500">Click on a food item to view its detailed nutritional information</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
