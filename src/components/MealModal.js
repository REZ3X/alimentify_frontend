import { useState, useEffect } from 'react';

export default function MealModal({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    isEditing = false,
    onAnalyze,
    analyzing = false
}) {
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

    const [showManualEntry, setShowManualEntry] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
            // If editing, show manual entry by default as data is already there
            if (isEditing) setShowManualEntry(true);
        } else {
            // Reset form when opening fresh
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
        }
    }, [initialData, isEditing, isOpen]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const handleAnalyze = async () => {
        if (onAnalyze) {
            try {
                const result = await onAnalyze(formData.food_name, formData.portion_description);
                if (result && result.is_valid_food !== false) {
                    setFormData(prev => ({
                        ...prev,
                        calories: result.calories || '',
                        protein_g: result.protein_g || '',
                        carbs_g: result.carbs_g || '',
                        fat_g: result.fat_g || '',
                        serving_size: result.serving_size || prev.portion_description || '',
                    }));
                }
            } catch (error) {
                console.error("Analysis failed", error);
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-60 animate-in fade-in duration-200">
            <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar animate-in zoom-in-95 duration-300 border border-white/50">
                <div className="p-8">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                {isEditing ? 'Edit Meal' : 'Add Meal'}
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                {isEditing ? 'Update your meal details below' : 'Track what you ate today'}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                    Meal Type
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {['breakfast', 'lunch', 'dinner', 'snack'].map(type => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => handleInputChange({ target: { name: 'meal_type', value: type } })}
                                            className={`py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${formData.meal_type === type
                                                    ? 'bg-[#FAB12F] text-white shadow-md transform scale-105'
                                                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                                }`}
                                        >
                                            <span className="text-base">
                                                {type === 'breakfast' && '🍳'}
                                                {type === 'lunch' && '🥗'}
                                                {type === 'dinner' && '🍽️'}
                                                {type === 'snack' && '🥨'}
                                            </span>
                                            <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                    Food Name
                                </label>
                                <input
                                    type="text"
                                    name="food_name"
                                    value={formData.food_name}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Grilled Chicken Salad"
                                    className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#FAB12F] focus:border-transparent transition-all text-gray-900"
                                    required
                                />
                            </div>

                            {!isEditing && (
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                        Portion Description (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        name="portion_description"
                                        value={formData.portion_description}
                                        onChange={handleInputChange}
                                        placeholder="e.g., 1 large bowl"
                                        className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#FAB12F] focus:border-transparent transition-all text-gray-900"
                                    />
                                </div>
                            )}
                        </div>

                        {!isEditing && !formData.calories && !showManualEntry && (
                            <button
                                type="button"
                                onClick={handleAnalyze}
                                disabled={analyzing || !formData.food_name}
                                className="w-full py-4 bg-linear-to-r from-[#FAB12F] to-[#FA812F] text-white rounded-2xl font-bold shadow-lg shadow-orange-200 hover:shadow-orange-300 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                            >
                                {analyzing ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Analyzing...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Analyze Nutrition</span>
                                    </>
                                )}
                            </button>
                        )}

                        {!isEditing && !formData.calories && (
                            <button
                                type="button"
                                onClick={() => setShowManualEntry(true)}
                                className="w-full text-sm text-gray-500 hover:text-gray-800 font-medium underline decoration-gray-300 underline-offset-4"
                            >
                                Enter details manually instead
                            </button>
                        )}

                        {(formData.calories || showManualEntry) && (
                            <div className="space-y-6 pt-6 border-t border-gray-100 animate-in slide-in-from-bottom-4 fade-in">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-gray-900">Nutrition Facts</h3>
                                    {!isEditing && !showManualEntry && (
                                        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center gap-1">
                                            ✓ AI Verified
                                        </span>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-orange-50/50 rounded-2xl p-3 border border-orange-100">
                                        <label className="block text-xs font-bold text-orange-800 mb-1">Calories</label>
                                        <input
                                            type="number"
                                            name="calories"
                                            value={formData.calories}
                                            onChange={handleInputChange}
                                            className="w-full bg-transparent font-mono font-bold text-xl text-gray-900 focus:outline-none"
                                            placeholder="0"
                                        />
                                    </div>
                                    <div className="bg-blue-50/50 rounded-2xl p-3 border border-blue-100">
                                        <label className="block text-xs font-bold text-blue-800 mb-1">Protein (g)</label>
                                        <input
                                            type="number"
                                            name="protein_g"
                                            value={formData.protein_g}
                                            onChange={handleInputChange}
                                            className="w-full bg-transparent font-mono font-bold text-xl text-gray-900 focus:outline-none"
                                            placeholder="0"
                                        />
                                    </div>
                                    <div className="bg-green-50/50 rounded-2xl p-3 border border-green-100">
                                        <label className="block text-xs font-bold text-green-800 mb-1">Carbs (g)</label>
                                        <input
                                            type="number"
                                            name="carbs_g"
                                            value={formData.carbs_g}
                                            onChange={handleInputChange}
                                            className="w-full bg-transparent font-mono font-bold text-xl text-gray-900 focus:outline-none"
                                            placeholder="0"
                                        />
                                    </div>
                                    <div className="bg-yellow-50/50 rounded-2xl p-3 border border-yellow-100">
                                        <label className="block text-xs font-bold text-yellow-800 mb-1">Fat (g)</label>
                                        <input
                                            type="number"
                                            name="fat_g"
                                            value={formData.fat_g}
                                            onChange={handleInputChange}
                                            className="w-full bg-transparent font-mono font-bold text-xl text-gray-900 focus:outline-none"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                        Notes (Optional)
                                    </label>
                                    <textarea
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleInputChange}
                                        rows="2"
                                        className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#FAB12F] focus:border-transparent transition-all resize-none text-gray-900"
                                        placeholder="Add any extra details..."
                                    ></textarea>
                                </div>

                                <div className="flex gap-4 pt-2">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="flex-1 py-3.5 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-3.5 bg-[#FAB12F] text-white rounded-2xl font-bold hover:bg-[#FA812F] shadow-lg shadow-orange-200 transition-all"
                                    >
                                        {isEditing ? 'Save Changes' : 'Log Meal'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}