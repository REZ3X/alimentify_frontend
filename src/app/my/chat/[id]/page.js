'use client';

import { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import Toast from '@/components/Toast';
import { api } from '@/lib/api';

export default function ChatPage({ params }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const resolvedParams = use(params);
    const sessionId = resolvedParams?.id;

    const [session, setSession] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [toast, setToast] = useState(null);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    const showToast = (message, type = 'info') => {
        setToast({ message, type });
    };

    useEffect(() => {
        if (loading) return;

        if (!user) {
            router.push('/auth/login');
            return;
        }

        if (sessionId) {
            loadChatSession();
        }
    }, [user, sessionId, loading]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadChatSession = async () => {
        setIsLoading(true);
        try {
            const [sessionRes, messagesRes] = await Promise.all([
                api.get(`/chat/sessions/${sessionId}`),
                api.get(`/chat/sessions/${sessionId}/messages`)
            ]);

            if (sessionRes.success) {
                setSession(sessionRes.session);
            }

            if (messagesRes.success) {
                setMessages(messagesRes.messages);
            }
        } catch (error) {
            console.error('Failed to load chat:', error);
            if (error.response?.status === 404) {
                router.push('/my/chat');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageSelect = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                showToast('Image size must be less than 5MB', 'error');
                return;
            }

            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if ((!inputMessage.trim() && !imageFile) || isSending) return;

        if (imageFile && !inputMessage.trim()) {
            showToast('Please add a message describing the meal when sending an image.', 'warning');
            return;
        }

        const userMessage = inputMessage.trim();
        setInputMessage('');
        setIsSending(true);

        const tempUserMessage = {
            id: 'temp-' + Date.now(),
            role: 'user',
            content: userMessage,
            image_url: imageFile ? imagePreview : null,
            created_at: new Date().toISOString(),
        };
        setMessages(prev => [...prev, tempUserMessage]);

        try {
            let payload = {
                message: userMessage
            };

            if (imageFile) {
                const reader = new FileReader();
                reader.onloadend = async () => {
                    const base64Data = reader.result.split(',')[1];
                    payload.image_data = base64Data;
                    payload.mime_type = imageFile.type;

                    await sendMessageToApi(payload);
                };
                reader.readAsDataURL(imageFile);
            } else {
                await sendMessageToApi(payload);
            }

            removeImage();
        } catch (error) {
            console.error('Failed to send message:', error);
            showToast('Failed to send message. Please try again.', 'error');
            setMessages(prev => prev.filter(m => m.id !== tempUserMessage.id));
        } finally {
            setIsSending(false);
        }
    };

    const sendMessageToApi = async (payload) => {
        const loadingText = payload.image_data
            ? 'Analyzing your meal... 🔍'
            : 'Thinking... 🤔';

        const loadingMessage = {
            id: 'loading-' + Date.now(),
            role: 'assistant',
            content: loadingText,
            isLoading: true,
            created_at: new Date().toISOString(),
        };
        setMessages(prev => [...prev, loadingMessage]);

        const response = await api.post(`/chat/sessions/${sessionId}/messages`, payload);

        if (response.success) {
            setMessages(prev => {
                const filtered = prev.filter(m => !m.id.startsWith('temp-') && !m.id.startsWith('loading-'));
                return [...filtered, response.user_message, response.assistant_message];
            });
            setSession(response.session);
        }
    };

    if (loading) return null;
    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#FEF3E2] relative overflow-hidden font-sans selection:bg-[#FAB12F] selection:text-white pb-4 pt-24 md:pb-6 md:pt-28">
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

            <div className="relative z-10 max-w-6xl mx-auto px-3 md:px-6 lg:px-8 h-[calc(100dvh-110px)] md:h-[calc(100vh-140px)] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between mb-4 md:mb-6">
                    <div className="flex items-center gap-3 md:gap-4">
                        <button
                            onClick={() => router.push('/my/chat')}
                            className="p-2 md:p-3 rounded-full bg-white/50 hover:bg-white text-gray-600 hover:text-[#FAB12F] transition-all duration-300 shadow-sm border border-white/50 group"
                        >
                            <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 tracking-tight line-clamp-1">
                                {session?.title || 'New Conversation'}
                            </h1>
                            <p className="text-xs text-gray-500 font-medium font-mono">AI Nutrition Assistant</p>
                        </div>
                    </div>
                </div>

                {/* Chat Container */}
                <div className="flex-1 bg-white/60 backdrop-blur-xl border border-white/50 shadow-sm rounded-[2rem] md:rounded-[2.5rem] overflow-hidden flex flex-col relative">
                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 custom-scrollbar scroll-smooth">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#FAB12F] border-t-transparent" />
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center p-8">
                                <div className="w-24 h-24 bg-[#FAB12F]/10 rounded-full flex items-center justify-center mb-6">
                                    <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-sm rotate-3 ring-4 ring-white/50">
                                        <img src="/images/ai.png" alt="AI" className="w-full h-full object-cover" />
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Start a conversation</h3>
                                <p className="text-gray-500 max-w-md">
                                    Ask me anything about nutrition, meal logging, reports, or your health goals!
                                </p>
                            </div>
                        ) : (
                            messages.map((message) => (
                                <MessageBubble key={message.id} message={message} user={user} />
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 md:p-4 bg-white/40 backdrop-blur-md border-t border-white/40">
                        {imagePreview && (
                            <div className="mb-3 relative inline-block animate-in slide-in-from-bottom-2">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="h-24 w-24 object-cover rounded-2xl border-2 border-white shadow-md"
                                />
                                <button
                                    onClick={removeImage}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors shadow-sm"
                                >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        )}

                        <form onSubmit={handleSendMessage} className="flex items-end gap-2 md:gap-3">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageSelect}
                                className="hidden"
                            />

                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 bg-white/60 hover:bg-white text-gray-500 hover:text-[#FAB12F] rounded-xl md:rounded-2xl transition-all border border-white/50 flex items-center justify-center shadow-sm hover:shadow-md"
                                disabled={isSending}
                                title="Upload image"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </button>

                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    placeholder="Ask anything..."
                                    className="w-full px-4 py-3 md:px-6 md:py-3.5 bg-white/60 border border-white/50 rounded-xl md:rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#FAB12F]/50 focus:border-[#FAB12F] text-gray-900 placeholder:text-gray-400 shadow-sm transition-all text-sm md:text-base"
                                    disabled={isSending}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={(!inputMessage.trim() && !imageFile) || isSending}
                                className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-[#FAB12F] to-[#FA812F] text-white rounded-xl md:rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-[#FAB12F]/20 hover:shadow-[#FAB12F]/40 hover:scale-105 active:scale-95"
                                title={isSending ? 'Processing...' : 'Send message'}
                            >
                                {isSending ? (
                                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MessageBubble({ message, user }) {
    const isUser = message.role === 'user';

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
            <div className={`flex gap-2 md:gap-4 max-w-[92%] md:max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div className={`flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shadow-sm ${isUser ? 'bg-[#FAB12F] text-white' : 'bg-white p-1'
                    }`}>
                    {isUser ? (
                        <span className="font-bold text-sm md:text-base">{user?.name?.[0] || 'U'}</span>
                    ) : (
                        <img src="/images/ai.png" alt="AI" className="w-full h-full rounded-full object-cover" />
                    )}
                </div>

                {/* Message Content */}
                <div className="space-y-2 min-w-0">
                    {/* Image Display - Outside bubble */}
                    {message.image_url && (
                        <div className={`${isUser ? 'ml-auto' : 'mr-auto'} max-w-[200px] md:max-w-xs relative group`}>
                            <img
                                src={message.image_url}
                                alt="Uploaded content"
                                className="w-full h-auto rounded-2xl shadow-md border-2 border-white transition-transform group-hover:scale-[1.02]"
                                style={{ maxHeight: '300px', objectFit: 'cover' }}
                            />
                            {/* Image analyzed badge */}
                            {isUser && message.content.includes('[Image Analysis]') && (
                                <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>Analyzed</span>
                                </div>
                            )}
                        </div>
                    )}

                    <div className={`rounded-2xl md:rounded-[1.5rem] px-4 py-3 md:px-6 md:py-4 shadow-sm ${isUser
                        ? 'bg-[#FAB12F] text-white rounded-tr-none [&_*]:text-white'
                        : 'bg-white/80 backdrop-blur-sm border border-white/50 text-gray-800 rounded-tl-none'
                        }`}>
                        {/* Hide JSON analysis from display, show clean message with markdown */}
                        {message.isLoading ? (
                            <div className="flex items-center gap-3">
                                <div className="flex gap-1">
                                    <span className="w-2 h-2 bg-[#FAB12F] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                    <span className="w-2 h-2 bg-[#FAB12F] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                    <span className="w-2 h-2 bg-[#FAB12F] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                </div>
                                <span className="text-sm font-medium opacity-75 text-gray-600">{message.content}</span>
                            </div>
                        ) : (
                            <div className={`prose prose-sm max-w-none ${isUser ? 'prose-invert text-white' : 'prose-stone'}`}>
                                <MarkdownRenderer
                                    content={message.content.split('[Image Analysis]')[0].trim() || message.content}
                                />
                            </div>
                        )}
                    </div>
                    <p className={`text-[10px] font-medium px-2 ${isUser ? 'text-right text-gray-400' : 'text-left text-gray-400'}`}>
                        {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
            </div>
        </div>
    );
}
