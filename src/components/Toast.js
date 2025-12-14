'use client';

import { useEffect, useState } from 'react';

export default function Toast({ message, type = 'info', onClose, duration = 3000 }) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Trigger enter animation
        const enterTimer = setTimeout(() => setIsVisible(true), 10);
        
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // Wait for exit animation
        }, duration);

        return () => {
            clearTimeout(enterTimer);
            clearTimeout(timer);
        };
    }, [duration, onClose]);

    if (!message) return null;

    const bgColors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-[#FAB12F]',
        warning: 'bg-yellow-500'
    };

    const icons = {
        success: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
        ),
        error: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        info: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        warning: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        )
    };

    return (
        <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-[200] transition-all duration-300 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
            <div className="bg-white/90 backdrop-blur-md border border-white/50 shadow-xl shadow-black/5 rounded-2xl pl-2 pr-4 py-2 flex items-center gap-3 min-w-[300px] max-w-md">
                <div className={`p-2 rounded-xl text-white shadow-sm ${bgColors[type]}`}>
                    {icons[type]}
                </div>
                <p className="text-gray-800 font-medium text-sm flex-1">{message}</p>
                <button 
                    onClick={() => { setIsVisible(false); setTimeout(onClose, 300); }} 
                    className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
