export default function MealCard({ meal, onEdit, onDelete }) {
    return (
        <div className="group bg-white/60 backdrop-blur-xl border border-white/50 rounded-[2.5rem] p-6 hover:bg-white/80 transition-all duration-300 shadow-[0_8px_32px_0_rgba(0,0,0,0.05)] hover:shadow-lg hover:-translate-y-1 relative overflow-hidden">
            <div className="flex justify-between items-start gap-4 relative z-10">
                <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 text-lg truncate pr-2 tracking-tight">{meal.food_name}</h4>
                    {meal.serving_size && (
                        <p className="text-sm text-gray-500 font-medium mb-3 font-mono">{meal.serving_size}</p>
                    )}
                    
                    <div className="flex flex-wrap gap-2 mt-2">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50/80 text-orange-700 text-xs font-bold border border-orange-100 shadow-sm">
                            <span>🔥</span>
                            <span className="font-mono">{Math.round(meal.calories)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50/80 text-blue-700 text-xs font-bold border border-blue-100 shadow-sm">
                            <span>🥩</span>
                            <span className="font-mono">{Math.round(meal.protein_g)}g</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50/80 text-green-700 text-xs font-bold border border-green-100 shadow-sm">
                            <span>🌾</span>
                            <span className="font-mono">{Math.round(meal.carbs_g)}g</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-50/80 text-yellow-700 text-xs font-bold border border-yellow-100 shadow-sm">
                            <span>🥑</span>
                            <span className="font-mono">{Math.round(meal.fat_g)}g</span>
                        </div>
                    </div>
                    
                    {meal.notes && (
                        <p className="text-xs text-gray-400 mt-4 italic line-clamp-2 pl-3 border-l-2 border-gray-200">
                            "{meal.notes}"
                        </p>
                    )}
                </div>

                <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute right-0 top-0 bottom-0 justify-center bg-linear-to-l from-white/90 via-white/60 to-transparent pl-12 pr-4 backdrop-blur-[2px]">
                    <button
                        onClick={() => onEdit(meal)}
                        className="p-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 hover:scale-110 transition-all shadow-sm border border-blue-100"
                        title="Edit"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                    <button
                        onClick={() => onDelete(meal._id)}
                        className="p-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 hover:scale-110 transition-all shadow-sm border border-red-100"
                        title="Delete"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                </div>
            </div>
        </div>
    );
}