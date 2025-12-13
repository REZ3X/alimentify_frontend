'use client';

import { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { api } from '@/lib/api';

export default function ChatPage({ params }) {
    const { user } = useAuth();
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
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (!user) {
            router.push('/auth/login');
            return;
        }

        if (sessionId) {
            loadChatSession();
        }
    }, [user, sessionId]);

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
                alert('Image size must be less than 5MB');
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
            alert('Please add a message describing the meal when sending an image.');
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
            alert('Failed to send message. Please try again.');
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

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#FEF3E2] via-[#FFF8F0] to-[#FFE8CC]">
            <Navbar />

            <div className="pt-24 pb-6 px-4 md:px-8 max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <button
                        onClick={() => router.push('/my/chat')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span className="font-medium">Back to Chats</span>
                    </button>

                    {session && (
                        <h1 className="text-2xl font-bold text-gray-900">{session.title}</h1>
                    )}
                </div>

                {/* Chat Container */}
                <div className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl overflow-hidden h-[calc(100vh-220px)] flex flex-col">
                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#FAB12F] border-t-transparent" />
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <div className="w-20 h-20 bg-gradient-to-br from-[#FAB12F]/20 to-[#FA812F]/20 rounded-full flex items-center justify-center mb-4">
                                    <svg className="w-10 h-10 text-[#FAB12F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Start a conversation</h3>
                                <p className="text-gray-600 max-w-md">
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
                    <div className="border-t border-gray-200 bg-white/60 backdrop-blur-sm p-4">
                        {imagePreview && (
                            <div className="mb-3 relative inline-block">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="h-20 w-20 object-cover rounded-lg border-2 border-[#FAB12F]"
                                />
                                <button
                                    onClick={removeImage}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        )}

                        <form onSubmit={handleSendMessage} className="flex items-end gap-2">
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
                                className="flex-shrink-0 w-10 h-10 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-colors flex items-center justify-center"
                                disabled={isSending}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </button>

                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                placeholder="Ask me anything about nutrition..."
                                className="flex-1 px-4 py-3 bg-gray-100 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#FAB12F] focus:border-transparent resize-none text-gray-900 placeholder:text-gray-500"
                                disabled={isSending}
                            />

                            <button
                                type="submit"
                                disabled={(!inputMessage.trim() && !imageFile) || isSending}
                                className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[#FAB12F] to-[#FA812F] hover:from-[#FA812F] hover:to-[#FAB12F] text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-[#FAB12F]/30"
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
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            <div className={`flex gap-3 max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-[#FAB12F]' : 'bg-gradient-to-br from-purple-500 to-pink-500'
                    }`}>
                    {isUser ? (
                        <span className="text-white text-sm font-bold">{user?.name?.[0] || 'U'}</span>
                    ) : (
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                        </svg>
                    )}
                </div>

                {/* Message Content */}
                <div className="space-y-2">
                    {/* Image Display - Outside bubble */}
                    {message.image_url && (
                        <div className={`${isUser ? 'ml-auto' : 'mr-auto'} max-w-xs relative`}>
                            <img
                                src={message.image_url}
                                alt="Uploaded content"
                                className="w-full h-auto rounded-2xl shadow-lg border-2 border-white"
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

                    <div className={`rounded-2xl px-4 py-3 ${isUser
                        ? 'bg-gradient-to-br from-[#FAB12F] to-[#FA812F] text-white'
                        : 'bg-white border border-gray-200 text-gray-900'
                        }`}>
                        {/* Hide JSON analysis from display, show clean message with markdown */}
                        {message.isLoading ? (
                            <p className="flex items-center gap-2">
                                <span className="animate-spin rounded-full h-4 w-4 border-2 border-[#FAB12F] border-t-transparent"></span>
                                {message.content}
                            </p>
                        ) : (
                            <div className={isUser ? 'markdown-white' : 'markdown-dark'}>
                                <MarkdownRenderer
                                    content={message.content.split('[Image Analysis]')[0].trim() || message.content}
                                />
                            </div>
                        )}


                    </div>
                    <p className="text-xs text-gray-500 mt-1 px-1">
                        {new Date(message.created_at).toLocaleTimeString()}
                    </p>
                </div>
            </div>
        </div>
    );
}
