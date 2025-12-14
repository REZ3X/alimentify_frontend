'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Toast from '@/components/Toast';
import { api } from '@/lib/api';

export default function ChatBubble() {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const { user } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const bubbleRef = useRef(null);

    const showToast = (message, type = 'info') => {
        setToast({ message, type });
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (bubbleRef.current && !bubbleRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleNewChat = async () => {
        setIsLoading(true);
        try {
            const response = await api.post('/chat/sessions', {});
            if (response.success) {
                const sessionId = response.session.id;
                router.push(`/my/chat/${sessionId}`);
            }
        } catch (error) {
            console.error('Failed to create chat:', error);
            showToast('Failed to start new chat. Please try again.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleViewChats = () => {
        router.push('/my/chat');
    };

    if (pathname?.startsWith('/my/chat') || pathname === '/auth/login' || pathname === '/auth/register') {
        return null;
    }

    const handleLogin = () => {
        router.push('/auth/login');
    };

    return (
        <div ref={bubbleRef} className="fixed bottom-6 right-6 z-[100] font-sans">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
            {/* Main Chat Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-16 h-16 bg-linear-to-br from-[#FAB12F] to-[#FA812F] text-white rounded-full shadow-[0_8px_32px_rgba(250,129,47,0.4)] flex items-center justify-center transition-all duration-500 hover:scale-110 hover:rotate-12 active:scale-95 group border-4 border-white/20 backdrop-blur-md relative overflow-hidden cursor-pointer ${isOpen ? 'rotate-90' : ''}`}
                aria-label="AI Chat Assistant"
            >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 rounded-full"></div>
                <svg
                    className={`w-8 h-8 relative z-10 transition-transform duration-500 ${isOpen ? 'rotate-90 scale-75' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    {isOpen ? (
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M6 18L18 6M6 6l12 12"
                        />
                    ) : (
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                        />
                    )}
                </svg>
                {/* Notification dot */}
                {!isOpen && (
                    <span className="absolute top-3 right-3 w-3 h-3 bg-red-500 rounded-full border-2 border-[#FA812F] animate-pulse z-20"></span>
                )}
            </button>

            {/* Popup Menu */}
            {isOpen && (
                <div className="absolute bottom-24 right-0 w-80 bg-white/10 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] rounded-[2.5rem] overflow-hidden transform transition-all duration-300 ease-out animate-scale-in origin-bottom-right ring-1 ring-white/30">
                    {/* Liquid Gloss Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/5 to-white/10 pointer-events-none z-0"></div>

                    {/* Header */}
                    <div className="relative z-10 p-8 pb-4">
                        <div className="flex items-center gap-4 mb-1">
                            <div className="w-12 h-12 rounded-2xl shadow-lg shadow-[#FAB12F]/20 rotate-3 ring-4 ring-white/20 backdrop-blur-sm overflow-hidden bg-white">
                                <img src="/images/ai.png" alt="Alimentify AI" className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <h3 className="font-mono font-bold text-xl text-gray-900 drop-shadow-sm">Alimentify AI</h3>
                                <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Nutrition Assistant</p>
                            </div>
                        </div>
                    </div>

                    {/* Menu Options */}
                    <div className="relative z-10 p-4 space-y-3">
                        {!user ? (
                            <button
                                onClick={handleLogin}
                                className="w-full flex items-center gap-4 p-4 rounded-3xl bg-white/20 border border-white/30 hover:bg-white/40 hover:border-[#FAB12F]/50 hover:shadow-lg hover:shadow-[#FAB12F]/10 transition-all duration-300 group text-left backdrop-blur-md cursor-pointer"
                            >
                                <div className="w-12 h-12 bg-white/30 rounded-2xl flex items-center justify-center text-gray-500 group-hover:bg-[#FAB12F] group-hover:text-white transition-colors duration-300 shadow-sm">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 group-hover:text-[#FA812F] transition-colors">Login to Chat</p>
                                    <p className="text-xs text-gray-600 font-medium">Sign in to start a conversation</p>
                                </div>
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={handleNewChat}
                                    disabled={isLoading}
                                    className="w-full flex items-center gap-4 p-4 rounded-3xl bg-white/20 border border-white/30 hover:bg-white/40 hover:border-[#FAB12F]/50 hover:shadow-lg hover:shadow-[#FAB12F]/10 transition-all duration-300 group text-left relative overflow-hidden backdrop-blur-md cursor-pointer"
                                >
                                    <div className="absolute inset-0 bg-[#FAB12F]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <div className="w-12 h-12 bg-white/30 rounded-2xl flex items-center justify-center text-[#FA812F] group-hover:scale-110 transition-transform duration-300 relative z-10 shadow-sm">
                                        {isLoading ? (
                                            <svg className="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                        ) : (
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                        )}
                                    </div>
                                    <div className="relative z-10">
                                        <p className="font-bold text-gray-900 group-hover:text-[#FA812F] transition-colors">New Chat</p>
                                        <p className="text-xs text-gray-600 font-medium">Start a fresh conversation</p>
                                    </div>
                                </button>

                                <button
                                    onClick={handleViewChats}
                                    className="w-full flex items-center gap-4 p-4 rounded-3xl bg-white/20 border border-white/30 hover:bg-white/40 hover:border-[#FAB12F]/50 hover:shadow-lg hover:shadow-[#FAB12F]/10 transition-all duration-300 group text-left relative overflow-hidden backdrop-blur-md cursor-pointer"
                                >
                                    <div className="absolute inset-0 bg-[#FAB12F]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <div className="w-12 h-12 bg-white/30 rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-[#FA812F] group-hover:bg-[#FEF3E2] transition-all duration-300 relative z-10 shadow-sm">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                        </svg>
                                    </div>
                                    <div className="relative z-10">
                                        <p className="font-bold text-gray-900 group-hover:text-[#FA812F] transition-colors">History</p>
                                        <p className="text-xs text-gray-600 font-medium">View past conversations</p>
                                    </div>
                                </button>
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="relative z-10 p-4 pt-2">
                        <div className="bg-white/20 rounded-2xl p-4 border border-white/30 flex gap-3 items-start backdrop-blur-md shadow-sm">
                            <span className="text-lg filter drop-shadow-md">💡</span>
                            <p className="text-xs text-gray-700 leading-relaxed font-semibold">
                                Tip: Ask me to analyze your food photos or suggest a meal plan!
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes scale-in {
                    from {
                        opacity: 0;
                        transform: scale(0.8) translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }

                .animate-scale-in {
                    animation: scale-in 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }
            `}</style>
        </div>
    );
}
