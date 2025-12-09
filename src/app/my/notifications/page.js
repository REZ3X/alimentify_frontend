'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { notificationManager } from '@/lib/notifications';
import { api } from '@/lib/api';
import Navbar from '@/components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';

export default function NotificationsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const [permission, setPermission] = useState('default');
    const [isSupported, setIsSupported] = useState(true);
    const [settings, setSettings] = useState({
        enabled: false,
        mealReminders: true,
        dailySummary: true,
        achievements: true,
        breakfastTime: '08:00',
        lunchTime: '12:30',
        dinnerTime: '18:30',
    });
    const [healthProfile, setHealthProfile] = useState(null);
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState(null);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user) {
            setIsSupported(notificationManager.isNotificationSupported());
            setPermission(notificationManager.getPermission());

            const savedSettings = localStorage.getItem('notification-settings');
            if (savedSettings) {
                setSettings(JSON.parse(savedSettings));
            }

            loadHealthProfile();
        }
    }, [user]);

    const loadHealthProfile = async () => {
        try {
            const profile = await api.getHealthProfile();
            setHealthProfile(profile);
        } catch (err) {
            console.error('Error loading health profile:', err);
        }
    };

    const handleRequestPermission = async () => {
        const result = await notificationManager.requestPermission();
        setPermission(result);

        if (result === 'granted') {
            setSettings(prev => ({ ...prev, enabled: true }));
            await handleSaveSettings({ ...settings, enabled: true });
        }
    };

    const handleToggleSetting = (key) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleTimeChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSaveSettings = async (settingsToSave = settings) => {
        setSaving(true);

        try {
            localStorage.setItem('notification-settings', JSON.stringify(settingsToSave));
            notificationManager.clearScheduledReminders();

            if (settingsToSave.enabled && settingsToSave.mealReminders && healthProfile) {
                const mealTimes = [
                    { mealType: 'breakfast', time: settingsToSave.breakfastTime },
                    { mealType: 'lunch', time: settingsToSave.lunchTime },
                    { mealType: 'dinner', time: settingsToSave.dinnerTime },
                ];
                notificationManager.scheduleMealReminders(
                    mealTimes,
                    healthProfile.daily_calories
                );
            }

            setSuccessMessage('Settings saved successfully!');
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            console.error('Error saving settings:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleTestNotification = async () => {
        await notificationManager.showCustom(
            '🧪',
            'Test Notification',
            'If you see this, notifications are working perfectly!',
            'test-notification'
        );
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 100 }
        }
    };

    if (authLoading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FEF3E2]">
                <div className="w-16 h-16 border-4 border-[#FAB12F] border-t-[#FA812F] rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!isSupported) {
        return (
            <div className="min-h-screen bg-[#FEF3E2] p-6 flex items-center justify-center font-sans">
                <div className="max-w-md w-full bg-white/60 backdrop-blur-xl rounded-4xl shadow-xl border border-white/50 p-8 text-center">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Notifications Not Supported</h2>
                    <p className="text-gray-600 mb-6 font-medium">
                        Your browser doesn't support web notifications. Try using a modern browser like Chrome, Firefox, or Edge.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FEF3E2] relative overflow-x-hidden font-sans selection:bg-[#FAB12F] selection:text-white pb-24 pt-28">
            {/* Background Pattern */}
            <div className="fixed inset-0 z-0 opacity-40 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#FAB12F 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
            <div className="fixed top-0 left-0 w-96 h-96 bg-[#FAB12F]/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0"></div>
            <div className="fixed bottom-0 right-0 w-96 h-96 bg-[#FA812F]/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none z-0"></div>

            <Navbar />

            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8"
            >
                {/* Header */}
                <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push('/my')}
                            className="p-3 rounded-full bg-white/50 hover:bg-white text-gray-600 hover:text-[#FAB12F] transition-all duration-300 shadow-sm border border-white/50 group cursor-pointer"
                        >
                            <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Notifications</h1>
                            <p className="text-sm text-gray-500 font-medium font-mono">Manage your alerts & reminders 🔔</p>
                        </div>
                    </div>
                </motion.div>

                {/* Success Message Toast */}
                <AnimatePresence>
                    {successMessage && (
                        <motion.div 
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="fixed top-24 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-2xl shadow-lg font-bold flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            {successMessage}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Permission Status Card */}
                <motion.div variants={itemVariants} className="bg-white/60 backdrop-blur-xl rounded-4xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-6 w-full">
                            <div className={`w-16 h-16 shrink-0 rounded-3xl flex items-center justify-center shadow-inner ${
                                permission === 'granted' ? 'bg-green-100 text-green-600' : 
                                permission === 'denied' ? 'bg-red-100 text-red-600' : 'bg-[#FAB12F]/20 text-[#FA812F]'
                            }`}>
                                {permission === 'granted' ? (
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                ) : permission === 'denied' ? (
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                ) : (
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                )}
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-gray-900 mb-1">
                                    {permission === 'granted' ? 'Notifications Active' : permission === 'denied' ? 'Notifications Blocked' : 'Setup Notifications'}
                                </h3>
                                <p className="text-gray-500 font-medium text-sm">
                                    {permission === 'granted' ? 'You\'re all set to receive updates.' : permission === 'denied' ? 'Please enable in browser settings.' : 'Enable to stay on track.'}
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex gap-3 w-full md:w-auto">
                            {permission !== 'granted' && permission !== 'denied' && (
                                <button
                                    onClick={handleRequestPermission}
                                    className="flex-1 md:flex-none px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-bold transition-all shadow-lg shadow-green-500/30 whitespace-nowrap"
                                >
                                    Enable Now
                                </button>
                            )}
                            {permission === 'granted' && (
                                <button
                                    onClick={handleTestNotification}
                                    className="flex-1 md:flex-none px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-500/30 whitespace-nowrap"
                                >
                                    Test Alert
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Notification Types - Always visible but disabled if not granted */}
                <motion.div 
                    variants={itemVariants} 
                    className={`bg-white/60 backdrop-blur-xl rounded-4xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 ${permission !== 'granted' ? 'opacity-50 pointer-events-none grayscale' : ''}`}
                >
                    <h2 className="text-2xl font-black text-gray-900 mb-6 tracking-tight">Notification Types</h2>
                    <div className="space-y-4">
                        {/* Master Switch */}
                        <div className="flex items-center justify-between p-4 bg-white/50 rounded-3xl border border-white/60">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-green-600">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Enable All</h3>
                                    <p className="text-xs text-gray-500 font-medium">Master control</p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleToggleSetting('enabled')}
                                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none ${settings.enabled ? 'bg-green-500' : 'bg-gray-300'}`}
                            >
                                <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-300 ${settings.enabled ? 'translate-x-7' : 'translate-x-1'}`} />
                            </button>
                        </div>

                        {/* Meal Reminders */}
                        <div className={`flex items-center justify-between p-4 bg-white/50 rounded-3xl border border-white/60 transition-opacity ${!settings.enabled && 'opacity-50 pointer-events-none'}`}>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Meal Reminders</h3>
                                    <p className="text-xs text-gray-500 font-medium">Eat on time</p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleToggleSetting('mealReminders')}
                                disabled={!settings.enabled}
                                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none ${settings.mealReminders && settings.enabled ? 'bg-blue-500' : 'bg-gray-300'}`}
                            >
                                <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-300 ${settings.mealReminders && settings.enabled ? 'translate-x-7' : 'translate-x-1'}`} />
                            </button>
                        </div>

                        {/* Daily Summary */}
                        <div className={`flex items-center justify-between p-4 bg-white/50 rounded-3xl border border-white/60 transition-opacity ${!settings.enabled && 'opacity-50 pointer-events-none'}`}>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Daily Summary</h3>
                                    <p className="text-xs text-gray-500 font-medium">9 PM Report</p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleToggleSetting('dailySummary')}
                                disabled={!settings.enabled}
                                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none ${settings.dailySummary && settings.enabled ? 'bg-purple-500' : 'bg-gray-300'}`}
                            >
                                <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-300 ${settings.dailySummary && settings.enabled ? 'translate-x-7' : 'translate-x-1'}`} />
                            </button>
                        </div>

                        {/* Achievements */}
                        <div className={`flex items-center justify-between p-4 bg-white/50 rounded-3xl border border-white/60 transition-opacity ${!settings.enabled && 'opacity-50 pointer-events-none'}`}>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-[#FAB12F]/20 rounded-2xl flex items-center justify-center text-[#FA812F]">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Achievements</h3>
                                    <p className="text-xs text-gray-500 font-medium">Milestones</p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleToggleSetting('achievements')}
                                disabled={!settings.enabled}
                                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none ${settings.achievements && settings.enabled ? 'bg-[#FAB12F]' : 'bg-gray-300'}`}
                            >
                                <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-300 ${settings.achievements && settings.enabled ? 'translate-x-7' : 'translate-x-1'}`} />
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Meal Times */}
                {settings.enabled && settings.mealReminders && (
                    <motion.div variants={itemVariants} className="bg-white/60 backdrop-blur-xl rounded-4xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50">
                        <h2 className="text-2xl font-black text-gray-900 mb-6 tracking-tight">Schedule</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { label: 'Breakfast', icon: '🍳', key: 'breakfastTime' },
                                { label: 'Lunch', icon: '🍱', key: 'lunchTime' },
                                { label: 'Dinner', icon: '🍽️', key: 'dinnerTime' }
                            ].map((meal) => (
                                <div key={meal.key} className="bg-white/50 p-4 rounded-3xl border border-white/60">
                                    <label className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                        <span>{meal.icon}</span> {meal.label}
                                    </label>
                                    <input
                                        type="time"
                                        value={settings[meal.key]}
                                        onChange={(e) => handleTimeChange(meal.key, e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FAB12F] focus:border-transparent outline-none font-mono text-gray-800"
                                    />
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Save Button */}
                {permission === 'granted' && (
                    <motion.div variants={itemVariants} className="flex justify-end pb-8">
                        <button
                            onClick={() => handleSaveSettings()}
                            disabled={saving}
                            className="w-full md:w-auto px-10 py-4 bg-linear-to-r from-[#FAB12F] to-[#FA812F] text-white rounded-2xl hover:shadow-lg hover:shadow-orange-500/30 disabled:opacity-70 disabled:cursor-not-allowed transition-all font-bold tracking-wide text-lg"
                        >
                            {saving ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Saving...
                                </span>
                            ) : 'Save Changes'}
                        </button>
                    </motion.div>
                )}

                {permission === 'denied' && (
                    <motion.div variants={itemVariants} className="bg-red-50/80 backdrop-blur-sm border border-red-100 rounded-3xl p-6">
                        <h3 className="text-lg font-black text-red-900 mb-3 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            Action Required
                        </h3>
                        <ol className="list-decimal list-inside space-y-2 text-sm font-medium text-red-800/80 ml-2">
                            <li>Click the lock icon 🔒 in your browser's address bar</li>
                            <li>Find the "Notifications" setting</li>
                            <li>Change it from "Block" to "Allow"</li>
                            <li>Refresh this page</li>
                        </ol>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}
