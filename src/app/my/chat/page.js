'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { api } from '@/lib/api';

export default function ChatHistoryPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [sessions, setSessions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        if (!user) {
            router.push('/auth/login');
            return;
        }

        loadChatSessions();
    }, [user]);

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
            alert('Failed to start new chat. Please try again.');
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
            alert('Failed to delete chat. Please try again.');
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#FEF3E2] via-[#FFF8F0] to-[#FFE8CC]">
            <Navbar />

            <div className="pt-24 pb-12 px-4 md:px-8 max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    {/* Back Button */}
                    <button
                        onClick={() => router.push('/my')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span className="font-medium">Back to Dashboard</span>
                    </button>

                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">AI Chat Assistant</h1>
                            <p className="text-gray-600">Your personal nutrition and meal tracking companion</p>
                        </div>
                        <button
                            onClick={handleNewChat}
                            disabled={isCreating}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-[#FAB12F] to-[#FA812F] hover:from-[#FA812F] hover:to-[#FAB12F] text-white rounded-2xl font-semibold transition-all shadow-lg shadow-[#FAB12F]/30 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isCreating ? (
                                <>
                                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    New Chat
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Chat Sessions Grid */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#FAB12F] border-t-transparent" />
                    </div>
                ) : sessions.length === 0 ? (
                    <div className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl p-12 text-center">
                        <div className="w-24 h-24 bg-gradient-to-br from-[#FAB12F]/20 to-[#FA812F]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-12 h-12 text-[#FAB12F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">No chats yet</h3>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                            Start your first conversation with Alimentify AI to get personalized nutrition advice and meal tracking assistance.
                        </p>
                        <button
                            onClick={handleNewChat}
                            disabled={isCreating}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-[#FAB12F] to-[#FA812F] hover:from-[#FA812F] hover:to-[#FAB12F] text-white rounded-2xl font-semibold transition-all shadow-lg shadow-[#FAB12F]/30 disabled:opacity-50"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Start Your First Chat
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sessions.map((session) => (
                            <div
                                key={session.id}
                                onClick={() => router.push(`/my/chat/${session.id}`)}
                                className="group bg-white/80 backdrop-blur-xl border border-white/50 shadow-lg hover:shadow-2xl rounded-3xl p-6 cursor-pointer transition-all duration-300 hover:scale-105 hover:-translate-y-1"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-[#FAB12F]/20 to-[#FA812F]/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <svg className="w-6 h-6 text-[#FAB12F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                        </svg>
                                    </div>
                                    <button
                                        onClick={(e) => handleDeleteSession(session.id, e)}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-50 rounded-xl text-red-500 hover:text-red-600"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>

                                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                                    {session.title}
                                </h3>

                                <div className="flex items-center justify-between text-sm text-gray-600">
                                    <span className="flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                        {session.message_count} messages
                                    </span>
                                    <span className="text-xs">
                                        {new Date(session.updated_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Info Cards */}
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-3xl p-6">
                        <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h4 className="font-bold text-gray-900 mb-2">Log Meals</h4>
                        <p className="text-sm text-gray-700">Send meal images or descriptions to automatically log them</p>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-3xl p-6">
                        <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <h4 className="font-bold text-gray-900 mb-2">Check Stats</h4>
                        <p className="text-sm text-gray-700">Ask about your daily nutrition progress and goals</p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-3xl p-6">
                        <div className="w-12 h-12 bg-purple-500 rounded-2xl flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h4 className="font-bold text-gray-900 mb-2">Generate Reports</h4>
                        <p className="text-sm text-gray-700">Request nutrition reports to be generated and emailed</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
