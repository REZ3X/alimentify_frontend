export default function DateSelector({ viewMode, setViewMode, selectedDate, setSelectedDate, onAddMeal }) {
    return (
        <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-[2.5rem] p-6 mb-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.05)] animate-in slide-in-from-top-4 fade-in duration-500">
            <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
                {/* View Mode Toggles */}
                <div className="flex bg-gray-100/50 p-1.5 rounded-2xl w-full lg:w-auto overflow-x-auto custom-scrollbar">
                    {[
                        { value: 'daily', label: 'Daily' },
                        { value: 'weekly', label: 'Weekly' },
                        { value: 'monthly', label: 'Monthly' },
                        { value: 'yearly', label: 'Yearly' }
                    ].map(mode => (
                        <button
                            key={mode.value}
                            onClick={() => setViewMode(mode.value)}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap flex-1 lg:flex-none cursor-pointer ${
                                viewMode === mode.value
                                    ? 'bg-white text-[#FAB12F] shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                            }`}
                        >
                            {mode.label}
                        </button>
                    ))}
                </div>

                {/* Date Picker & Add Button */}
                <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                    <div className="relative flex-1 sm:flex-none">
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            max={new Date().toISOString().split('T')[0]}
                            className="w-full sm:w-auto px-4 py-3 bg-white/50 border border-white/50 rounded-2xl text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#FAB12F]/50 cursor-pointer"
                        />
                    </div>
                    
                    {viewMode === 'daily' && (
                        <button
                            onClick={onAddMeal}
                            className="px-6 py-3 bg-[#FAB12F] hover:bg-[#FA812F] text-white rounded-2xl font-bold shadow-lg shadow-[#FAB12F]/20 hover:shadow-[#FAB12F]/40 transition-all duration-300 flex items-center justify-center gap-2 group cursor-pointer"
                        >
                            <span className="text-xl leading-none group-hover:rotate-90 transition-transform duration-300">+</span>
                            <span>Log Meal</span>
                        </button>
                    )}
                </div>
            </div>
            
            {viewMode !== 'daily' && (
                <p className="text-center lg:text-right text-xs text-gray-400 mt-3 font-medium">
                    Showing stats for the {viewMode} period ending on {new Date(selectedDate).toLocaleDateString()}
                </p>
            )}
        </div>
    );
}