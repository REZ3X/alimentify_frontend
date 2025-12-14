'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Toast from '@/components/Toast';
import { api } from '@/lib/api';

export default function ChatHistoryPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [sessions, setSessions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'info') => {
        setToast({ message, type });
    };

    useEffect(() => {
        if (loading) return;

        if (!user) {
            router.push('/auth/login');
            return;
        }

        loadChatSessions();
    }, [user, loading]);

    const loadChatSessions = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/chat/sessions');
            if (response.success) {
                setSessions(response.sessions);
            }
        } catch (error) {
            console.error('Failed to load chat sessions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleNewChat = async () => {
        setIsCreating(true);
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
            setIsCreating(false);
        }
    };

    const handleDeleteSession = async (sessionId, e) => {
        e.stopPropagation();

        if (!confirm('Are you sure you want to delete this chat?')) {
            return;
        }

        try {
            await api.delete(`/chat/sessions/${sessionId}`);
            setSessions(sessions.filter(s => s.id !== sessionId));
        } catch (error) {
            console.error('Failed to delete session:', error);
            showToast('Failed to delete chat. Please try again.', 'error');
        }
    };

    if (loading) return null;
    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#FEF3E2] relative overflow-x-hidden font-sans selection:bg-[#FAB12F] selection:text-white pb-24 pt-28">
            {/* Background Pattern */}
            <div className="fixed inset-0 z-0 opacity-40 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#FAB12F 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

            {/* Decorative Blobs */}
            <div className="fixed top-0 left-0 w-96 h-96 bg-[#FAB12F]/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0"></div>
            <div className="fixed bottom-0 right-0 w-96 h-96 bg-[#FA812F]/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none z-0"></div>

            <Navbar />

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push('/my')}
                            className="p-3 rounded-full bg-white/50 hover:bg-white text-gray-600 hover:text-[#FAB12F] transition-all duration-300 shadow-sm border border-white/50 group"
                        >
                            <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight">AI Assistant</h1>
                            <p className="text-sm text-gray-500 font-medium font-mono">Your personal nutrition companion 🤖</p>
                        </div>
                    </div>

                    <button
                        onClick={handleNewChat}
                        disabled={isCreating}
                        className="px-6 py-3 bg-gradient-to-r from-[#FAB12F] to-[#FA812F] text-white rounded-2xl font-bold shadow-lg shadow-[#FAB12F]/20 hover:shadow-[#FAB12F]/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isCreating ? (
                            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        )}
                        Start New Chat
                    </button>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* Left Column: Chat Sessions */}
                    <div className="lg:col-span-2 space-y-6">
                        {isLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="h-40 bg-white/40 backdrop-blur-md rounded-[2.5rem] animate-pulse border border-white/20" />
                                ))}
                            </div>
                        ) : sessions.length === 0 ? (
                            <div className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] p-12 text-center shadow-sm border border-white/50">
                                <div className="w-24 h-24 bg-[#FAB12F]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm rotate-3 ring-4 ring-white/50 text-[#FAB12F]">
                                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                        </svg>
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Hello, {user?.name.split(' ')[0]}!</h3>
                                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                                    I'm your personal AI nutritionist. Start a conversation to analyze food, track calories, or get meal plans.
                                </p>
                                <button
                                    onClick={handleNewChat}
                                    className="px-8 py-3 bg-white text-[#FAB12F] font-bold rounded-2xl shadow-sm border border-[#FAB12F]/20 hover:bg-[#FEF3E2] transition-all"
                                >
                                    Start First Conversation
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {sessions.map((session) => (
                                    <div
                                        key={session.id}
                                        onClick={() => router.push(`/my/chat/${session.id}`)}
                                        className="group relative bg-white/60 backdrop-blur-xl border border-white/50 hover:border-[#FAB12F]/50 rounded-[2rem] p-6 cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-[#FAB12F]/10 hover:-translate-y-1"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[#FAB12F] group-hover:scale-110 transition-transform duration-300 ring-2 ring-white/50">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                                </svg>
                                            </div>
                                            <button
                                                onClick={(e) => handleDeleteSession(session.id, e)}
                                                className="p-2 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                                                title="Delete chat"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>

                                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#FA812F] transition-colors">
                                            {session.title || 'New Conversation'}
                                        </h3>

                                        <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                                            <span className="flex items-center gap-1 bg-white/50 px-2 py-1 rounded-lg">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                </svg>
                                                {session.message_count || 0}
                                            </span>
                                            <span>
                                                {new Date(session.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Column: Features/Suggestions */}
                    <div className="space-y-6">
                        <div className="bg-white/40 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/40 sticky top-32">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">What can I do?</h3>
                            <div className="space-y-4">
                                {[
                                    { icon: '📸', title: 'Analyze Food', desc: 'Upload photos to track calories', color: 'bg-blue-50 text-blue-500' },
                                    { icon: '🥗', title: 'Meal Plans', desc: 'Get personalized diet suggestions', color: 'bg-green-50 text-green-500' },
                                    { icon: '📊', title: 'Health Reports', desc: 'Visualize your nutrition progress', color: 'bg-purple-50 text-purple-500' },
                                    { icon: '💡', title: 'Nutrition Tips', desc: 'Ask any food-related questions', color: 'bg-orange-50 text-orange-500' }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-4 p-4 bg-white/60 rounded-2xl hover:bg-white/80 transition-colors cursor-default group">
                                        <div className={`w-12 h-12 rounded-2xl ${item.color} flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform`}>
                                            {item.icon}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 text-sm">{item.title}</h4>
                                            <p className="text-xs text-gray-500">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
