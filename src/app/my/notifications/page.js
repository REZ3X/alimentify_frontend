'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { notificationManager } from '@/lib/notifications';
import { api } from '@/lib/api';

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

            const successDiv = document.createElement('div');
            successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
            successDiv.textContent = '✓ Settings saved successfully!';
            document.body.appendChild(successDiv);
            setTimeout(() => successDiv.remove(), 3000);
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

    if (authLoading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50">
                <div className="text-xl text-gray-600">Loading...</div>
            </div>
        );
    }

    if (!isSupported) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-lg p-8">
                        <div className="text-center">
                            <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Notifications Not Supported</h2>
                            <p className="text-gray-600">
                                Your browser doesn't support web notifications. Try using a modern browser like Chrome, Firefox, or Edge.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-6">
            <div className="max-w-4xl mx-auto">
                                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">🔔 Notifications</h1>
                    <p className="text-gray-600">Manage your notification preferences</p>
                </div>

                                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${permission === 'granted'
                                    ? 'bg-green-100'
                                    : permission === 'denied'
                                        ? 'bg-red-100'
                                        : 'bg-yellow-100'
                                }`}>
                                {permission === 'granted' ? (
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : permission === 'denied' ? (
                                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                ) : (
                                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                )}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">
                                    {permission === 'granted'
                                        ? 'Notifications Enabled'
                                        : permission === 'denied'
                                            ? 'Notifications Blocked'
                                            : 'Notifications Not Set Up'}
                                </h3>
                                <p className="text-sm text-gray-600">
                                    {permission === 'granted'
                                        ? 'You will receive notifications based on your settings'
                                        : permission === 'denied'
                                            ? 'Please enable notifications in your browser settings'
                                            : 'Grant permission to receive helpful reminders'}
                                </p>
                            </div>
                        </div>
                        {permission !== 'granted' && permission !== 'denied' && (
                            <button
                                onClick={handleRequestPermission}
                                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                            >
                                Enable Notifications
                            </button>
                        )}
                        {permission === 'granted' && (
                            <button
                                onClick={handleTestNotification}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                                Test Notification
                            </button>
                        )}
                    </div>
                </div>

                {permission === 'granted' && (
                    <>
                                                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">Notification Types</h2>
                            <div className="space-y-4">
                                                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">Enable All Notifications</h3>
                                            <p className="text-sm text-gray-600">Master switch for all notifications</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleToggleSetting('enabled')}
                                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${settings.enabled ? 'bg-green-600' : 'bg-gray-300'
                                            }`}
                                    >
                                        <span
                                            className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${settings.enabled ? 'translate-x-7' : 'translate-x-1'
                                                }`}
                                        />
                                    </button>
                                </div>

                                                                <div className={`flex items-center justify-between p-4 rounded-lg border-2 ${settings.enabled ? 'border-gray-200' : 'border-gray-100 opacity-50'
                                    }`}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">Meal Reminders</h3>
                                            <p className="text-sm text-gray-600">Get reminded at meal times</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleToggleSetting('mealReminders')}
                                        disabled={!settings.enabled}
                                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${settings.mealReminders && settings.enabled ? 'bg-blue-600' : 'bg-gray-300'
                                            }`}
                                    >
                                        <span
                                            className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${settings.mealReminders && settings.enabled ? 'translate-x-7' : 'translate-x-1'
                                                }`}
                                        />
                                    </button>
                                </div>

                                                                <div className={`flex items-center justify-between p-4 rounded-lg border-2 ${settings.enabled ? 'border-gray-200' : 'border-gray-100 opacity-50'
                                    }`}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">Daily Summary</h3>
                                            <p className="text-sm text-gray-600">End-of-day progress report (9 PM)</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleToggleSetting('dailySummary')}
                                        disabled={!settings.enabled}
                                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${settings.dailySummary && settings.enabled ? 'bg-purple-600' : 'bg-gray-300'
                                            }`}
                                    >
                                        <span
                                            className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${settings.dailySummary && settings.enabled ? 'translate-x-7' : 'translate-x-1'
                                                }`}
                                        />
                                    </button>
                                </div>

                                                                <div className={`flex items-center justify-between p-4 rounded-lg border-2 ${settings.enabled ? 'border-gray-200' : 'border-gray-100 opacity-50'
                                    }`}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                                            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">Achievements</h3>
                                            <p className="text-sm text-gray-600">Celebrate your milestones</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleToggleSetting('achievements')}
                                        disabled={!settings.enabled}
                                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${settings.achievements && settings.enabled ? 'bg-yellow-600' : 'bg-gray-300'
                                            }`}
                                    >
                                        <span
                                            className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${settings.achievements && settings.enabled ? 'translate-x-7' : 'translate-x-1'
                                                }`}
                                        />
                                    </button>
                                </div>
                            </div>
                        </div>

                                                {settings.enabled && settings.mealReminders && (
                            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                                <h2 className="text-2xl font-bold text-gray-800 mb-6">Meal Times</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            🍳 Breakfast
                                        </label>
                                        <input
                                            type="time"
                                            value={settings.breakfastTime}
                                            onChange={(e) => handleTimeChange('breakfastTime', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            🍱 Lunch
                                        </label>
                                        <input
                                            type="time"
                                            value={settings.lunchTime}
                                            onChange={(e) => handleTimeChange('lunchTime', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            🍽️ Dinner
                                        </label>
                                        <input
                                            type="time"
                                            value={settings.dinnerTime}
                                            onChange={(e) => handleTimeChange('dinnerTime', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                                                <div className="flex justify-end">
                            <button
                                onClick={() => handleSaveSettings()}
                                disabled={saving}
                                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors font-medium"
                            >
                                {saving ? 'Saving...' : 'Save Settings'}
                            </button>
                        </div>
                    </>
                )}

                {permission === 'denied' && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                        <h3 className="text-lg font-bold text-yellow-900 mb-2">How to Enable Notifications</h3>
                        <ol className="list-decimal list-inside space-y-2 text-sm text-yellow-800">
                            <li>Click the lock icon or info icon in your browser's address bar</li>
                            <li>Find the "Notifications" setting</li>
                            <li>Change it from "Block" to "Allow"</li>
                            <li>Refresh this page</li>
                        </ol>
                    </div>
                )}
            </div>
        </div>
    );
}
