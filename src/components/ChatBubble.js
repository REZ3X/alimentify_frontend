'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { api } from '@/lib/api';

export default function ChatBubble() {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const bubbleRef = useRef(null);

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
            alert('Failed to start new chat. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleViewChats = () => {
        router.push('/my/chat');
    };

    if (pathname?.startsWith('/my/chat')) {
        return null;
    }

    const handleLogin = () => {
        router.push('/auth/login');
    };

    return (
        <div ref={bubbleRef} className="fixed bottom-6 right-6 z-50">
            {/* Main Chat Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-16 h-16 bg-gradient-to-br from-[#FAB12F] to-[#FA812F] hover:from-[#FA812F] hover:to-[#FAB12F] text-white rounded-full shadow-2xl shadow-[#FAB12F]/40 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group border-2 border-white"
                aria-label="AI Chat Assistant"
            >
                <svg
                    className={`w-7 h-7 transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    {isOpen ? (
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
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
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
            </button>

            {/* Popup Menu */}
            {isOpen && (
                <div className="absolute bottom-20 right-0 w-72 bg-white/95 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl overflow-hidden transform transition-all duration-300 ease-out animate-scale-in">
                    {/* Header */}
                    <div className="bg-gradient-to-br from-[#FAB12F] to-[#FA812F] p-6 text-white">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">Alimentify AI</h3>
                                <p className="text-white/80 text-xs">Your nutrition assistant</p>
                            </div>
                        </div>
                    </div>

                    {/* Menu Options */}
                    <div className="p-4 space-y-2">
                        {!user ? (
                            <button
                                onClick={handleLogin}
                                className="w-full flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-br from-[#FAB12F]/10 to-[#FA812F]/10 hover:from-[#FAB12F]/20 hover:to-[#FA812F]/20 border border-[#FAB12F]/20 transition-all duration-200 group"
                            >
                                <div className="w-10 h-10 bg-gradient-to-br from-[#FAB12F] to-[#FA812F] rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                    </svg>
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="font-semibold text-gray-900">Login to Chat</p>
                                    <p className="text-xs text-gray-600">Sign in to start a conversation</p>
                                </div>
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={handleNewChat}
                                    disabled={isLoading}
                                    className="w-full flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-br from-[#FAB12F]/10 to-[#FA812F]/10 hover:from-[#FAB12F]/20 hover:to-[#FA812F]/20 border border-[#FAB12F]/20 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <div className="w-10 h-10 bg-gradient-to-br from-[#FAB12F] to-[#FA812F] rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                                        {isLoading ? (
                                            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                        )}
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="font-semibold text-gray-900">New Chat</p>
                                        <p className="text-xs text-gray-600">Start a conversation</p>
                                    </div>
                                </button>

                                <button
                                    onClick={handleViewChats}
                                    className="w-full flex items-center gap-3 p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all duration-200 group"
                                >
                                    <div className="w-10 h-10 bg-gray-200 rounded-xl flex items-center justify-center text-gray-600 group-hover:scale-110 transition-transform">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="font-semibold text-gray-900">See All Chats</p>
                                        <p className="text-xs text-gray-600">View all conversations</p>
                                    </div>
                                </button>
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-4 pb-4">
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-3 border border-blue-100">
                            <p className="text-xs text-gray-700 text-center">
                                💡 Ask me to log meals, check stats, or generate reports!
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes scale-in {
                    from {
                        opacity: 0;
                        transform: scale(0.9) translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }

                .animate-scale-in {
                    animation: scale-in 0.2s ease-out;
                }
            `}</style>
        </div>
    );
}
