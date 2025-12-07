'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function ProfileEditPage() {
    const { user, loading: authLoading, checkAuth } = useAuth();
    const router = useRouter();

    const [currentProfile, setCurrentProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [showChanges, setShowChanges] = useState(false);

    const [formData, setFormData] = useState({
        age: '',
        gender: 'male',
        height_cm: '',
        weight_kg: '',
        activity_level: 'moderately_active',
        goal: 'maintain_weight',
        medical_conditions: [],
        allergies: [],
        dietary_preferences: [],
        fasting_blood_sugar: '',
    });

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/login');
        } else if (user) {
            loadHealthProfile();
        }
    }, [user, authLoading, router]);

    const loadHealthProfile = async () => {
        setLoading(true);
        setError(null);

        try {
            const profile = await api.getHealthProfile();
            setCurrentProfile(profile);

            setFormData({
                age: profile.age || '',
                gender: profile.gender || 'male',
                height_cm: profile.height_cm || '',
                weight_kg: profile.weight_kg || '',
                activity_level: profile.activity_level || 'moderately_active',
                goal: profile.goal || 'maintain_weight',
                medical_conditions: profile.medical_conditions || [],
                allergies: profile.allergies || [],
                dietary_preferences: profile.dietary_preferences || [],
                fasting_blood_sugar: profile.fasting_blood_sugar || '',
            });
        } catch (err) {
            console.error('Error loading profile:', err);
            setError('Failed to load profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleArrayInput = (field, value) => {
        const items = value.split(',').map(item => item.trim()).filter(item => item);
        setFormData(prev => ({ ...prev, [field]: items }));
    };

    const calculateChanges = () => {
        if (!currentProfile) return {};

        const changes = {};
        const fields = [
            'age', 'gender', 'height_cm', 'weight_kg',
            'activity_level', 'goal', 'fasting_blood_sugar'
        ];

        fields.forEach(field => {
            const current = currentProfile[field];
            const new_value = formData[field];

            if (field === 'fasting_blood_sugar') {
                const currentVal = current || '';
                const newVal = new_value || '';
                if (currentVal !== newVal) {
                    changes[field] = { from: currentVal, to: newVal };
                }
            } else if (current != new_value) {
                changes[field] = { from: current, to: new_value };
            }
        });

        ['medical_conditions', 'allergies', 'dietary_preferences'].forEach(field => {
            const current = currentProfile[field] || [];
            const new_value = formData[field] || [];

            if (JSON.stringify(current) !== JSON.stringify(new_value)) {
                changes[field] = { from: current, to: new_value };
            }
        });

        return changes;
    };

    const hasChanges = () => {
        return Object.keys(calculateChanges()).length > 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!hasChanges()) {
            setError('No changes detected');
            return;
        }

        setSaving(true);
        setError(null);
        setSuccessMessage('');

        try {

            const cleanedData = {
                ...formData,
                age: parseInt(formData.age),
                height_cm: parseFloat(formData.height_cm),
                weight_kg: parseFloat(formData.weight_kg),
                fasting_blood_sugar: formData.fasting_blood_sugar || null,
            };

            await api.createHealthProfile(cleanedData);
            await checkAuth(); 
            setSuccessMessage('Profile updated successfully! Recalculating your targets...');

            setTimeout(() => {
                loadHealthProfile();
                setSuccessMessage('Profile updated! Your new nutrition targets are ready.');
            }, 1500);
        } catch (err) {
            console.error('Error updating profile:', err);
            setError(err.message || 'Failed to update profile. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const formatFieldName = (field) => {
        return field.split('_').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    };

    const formatValue = (value) => {
        if (Array.isArray(value)) {
            return value.length > 0 ? value.join(', ') : 'None';
        }
        if (value === '' || value === null || value === undefined) {
            return 'Not set';
        }
        return value.toString().replace(/_/g, ' ');
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-green-50 via-white to-blue-50">
                <div className="text-xl text-gray-600">Loading...</div>
            </div>
        );
    }

    if (!user) return null;

    if (!currentProfile) {
        return (
            <div className="min-h-screen bg-linear-to-br from-green-50 via-white to-blue-50 p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Profile Found</h2>
                        <p className="text-gray-600 mb-6">
                            Complete the health survey first to create your profile
                        </p>
                        <button
                            onClick={() => router.push('/my/health-survey')}
                            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                        >
                            Take Health Survey
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const changes = calculateChanges();

    return (
        <div className="min-h-screen bg-linear-to-br from-green-50 via-white to-blue-50 p-6">
            <div className="max-w-4xl mx-auto">
                                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">⚙️ Edit Profile</h1>
                    <p className="text-gray-600">Update your health information and goals</p>
                </div>

                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                {successMessage && (
                    <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                        {successMessage}
                    </div>
                )}

                                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Current Health Stats</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">{currentProfile.bmi?.toFixed(1)}</div>
                            <div className="text-sm text-gray-600">BMI</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">{Math.round(currentProfile.bmr)}</div>
                            <div className="text-sm text-gray-600">BMR (kcal)</div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">{Math.round(currentProfile.tdee)}</div>
                            <div className="text-sm text-gray-600">TDEE (kcal)</div>
                        </div>
                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                            <div className="text-2xl font-bold text-orange-600">{Math.round(currentProfile.daily_calories)}</div>
                            <div className="text-sm text-gray-600">Target (kcal)</div>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Basic Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Age *
                                </label>
                                <input
                                    type="number"
                                    name="age"
                                    value={formData.age}
                                    onChange={handleInputChange}
                                    min="13"
                                    max="120"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Gender *
                                </label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                >
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Height (cm) *
                                </label>
                                <input
                                    type="number"
                                    name="height_cm"
                                    value={formData.height_cm}
                                    onChange={handleInputChange}
                                    min="100"
                                    max="250"
                                    step="0.1"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Weight (kg) *
                                </label>
                                <input
                                    type="number"
                                    name="weight_kg"
                                    value={formData.weight_kg}
                                    onChange={handleInputChange}
                                    min="30"
                                    max="300"
                                    step="0.1"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                                        <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Goals & Activity</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Activity Level *
                                </label>
                                <select
                                    name="activity_level"
                                    value={formData.activity_level}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                >
                                    <option value="sedentary">Sedentary (Little or no exercise)</option>
                                    <option value="lightly_active">Lightly Active (1-3 days/week)</option>
                                    <option value="moderately_active">Moderately Active (3-5 days/week)</option>
                                    <option value="very_active">Very Active (6-7 days/week)</option>
                                    <option value="extra_active">Extra Active (Very intense exercise)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Health Goal *
                                </label>
                                <select
                                    name="goal"
                                    value={formData.goal}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                >
                                    <option value="lose_weight">Lose Weight</option>
                                    <option value="maintain_weight">Maintain Weight</option>
                                    <option value="gain_weight">Gain Weight</option>
                                    <option value="build_muscle">Build Muscle</option>
                                </select>
                            </div>
                        </div>
                    </div>

                                        <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Medical Information (Optional)</h2>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Medical Conditions
                                </label>
                                <input
                                    type="text"
                                    value={formData.medical_conditions.join(', ')}
                                    onChange={(e) => handleArrayInput('medical_conditions', e.target.value)}
                                    placeholder="Diabetes, Hypertension, etc. (comma-separated)"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Allergies
                                </label>
                                <input
                                    type="text"
                                    value={formData.allergies.join(', ')}
                                    onChange={(e) => handleArrayInput('allergies', e.target.value)}
                                    placeholder="Peanuts, Dairy, Gluten, etc. (comma-separated)"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Dietary Preferences
                                </label>
                                <input
                                    type="text"
                                    value={formData.dietary_preferences.join(', ')}
                                    onChange={(e) => handleArrayInput('dietary_preferences', e.target.value)}
                                    placeholder="Vegetarian, Vegan, Keto, etc. (comma-separated)"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Fasting Blood Sugar (mg/dL)
                                </label>
                                <input
                                    type="number"
                                    name="fasting_blood_sugar"
                                    value={formData.fasting_blood_sugar}
                                    onChange={handleInputChange}
                                    min="0"
                                    max="500"
                                    placeholder="Optional"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                                        {hasChanges() && (
                        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-blue-900">Changes to be saved</h3>
                                <button
                                    type="button"
                                    onClick={() => setShowChanges(!showChanges)}
                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    {showChanges ? 'Hide' : 'Show'} Details
                                </button>
                            </div>
                            {showChanges && (
                                <div className="space-y-3">
                                    {Object.entries(changes).map(([field, change]) => (
                                        <div key={field} className="bg-white rounded-lg p-3">
                                            <div className="font-medium text-gray-900 mb-1">{formatFieldName(field)}</div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="text-red-600 line-through">{formatValue(change.from)}</span>
                                                <span className="text-gray-400">→</span>
                                                <span className="text-green-600 font-medium">{formatValue(change.to)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <p className="text-sm text-blue-700 mt-4">
                                💡 Your nutrition targets will be recalculated based on these changes
                            </p>
                        </div>
                    )}

                                        <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={saving || !hasChanges()}
                            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                        >
                            {saving ? 'Saving Changes...' : hasChanges() ? 'Save Changes' : 'No Changes to Save'}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.push('/my')}
                            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
