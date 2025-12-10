export default function DailyStats({ totals }) {
    if (!totals || !totals.consumed || !totals.target) return null;

    const getProgressPercentage = (consumed, target) => {
        if (!target || target === 0) return 0;
        return Math.min(Math.round((consumed / target) * 100), 100);
    };

    const getProgressColor = (percentage) => {
        if (percentage < 50) return 'bg-green-500';
        if (percentage < 80) return 'bg-[#FAB12F]'; // Yellow/Orange
        if (percentage < 100) return 'bg-orange-500';
        return 'bg-red-500';
    };

    const StatItem = ({ label, consumed, target, unit, colorClass }) => {
        const percentage = getProgressPercentage(consumed, target);
        const progressColor = getProgressColor(percentage);
        
        return (
            <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-4xl p-5 flex flex-col justify-between h-full hover:bg-white/80 transition-all duration-300 shadow-[0_8px_32px_0_rgba(0,0,0,0.05)] hover:shadow-lg hover:-translate-y-1">
                <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</span>
                    <span className={`text-[10px] font-black px-2 py-1 rounded-full ${percentage >= 100 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                        {percentage}%
                    </span>
                </div>
                
                <div>
                    <div className="flex items-baseline gap-1 mb-2">
                        <span className="text-2xl font-black text-gray-900 tracking-tight">{Math.round(consumed)}</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase">{unit}</span>
                    </div>
                    
                    <div className="w-full bg-gray-100/50 rounded-full h-2 overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-1000 ease-out ${progressColor} shadow-sm`}
                            style={{ width: `${percentage}%` }}
                        ></div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-in slide-in-from-bottom-4 fade-in duration-500">
            <StatItem 
                label="Calories" 
                consumed={totals.consumed.calories} 
                target={totals.target.calories} 
                unit="kcal"
            />
            <StatItem 
                label="Protein" 
                consumed={totals.consumed.protein_g} 
                target={totals.target.protein_g} 
                unit="g"
            />
            <StatItem 
                label="Carbs" 
                consumed={totals.consumed.carbs_g} 
                target={totals.target.carbs_g} 
                unit="g"
            />
            <StatItem 
                label="Fat" 
                consumed={totals.consumed.fat_g} 
                target={totals.target.fat_g} 
                unit="g"
            />
        </div>
    );
}