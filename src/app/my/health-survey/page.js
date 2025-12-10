'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function HealthSurveyPage() {
    const { user, loading: authLoading, checkAuth } = useAuth();
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);

    const [formData, setFormData] = useState({
        age: '',
        gender: 'male',
        height_cm: '',
        weight_kg: '',
        activity_level: 'moderately_active',
        goal: 'maintain_weight',
        medical_conditions: [],
        blood_pressure: null,
        fasting_blood_sugar: '',
        allergies: [],
        dietary_preferences: [],
    });

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/login');
        }
    }, [user, authLoading, router]);

    if (authLoading) {
        return (
            <div className="min-h-screen bg-linear-to-br from-green-50 to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {

            const cleanedData = {
                ...formData,
                fasting_blood_sugar: formData.fasting_blood_sugar === '' ? null : formData.fasting_blood_sugar,
                blood_pressure: formData.blood_pressure === '' ? null : formData.blood_pressure,
                medical_conditions: formData.medical_conditions.length > 0 ? formData.medical_conditions : null,
                allergies: formData.allergies.length > 0 ? formData.allergies : null,
                dietary_preferences: formData.dietary_preferences.length > 0 ? formData.dietary_preferences : null,
            };

            const response = await api.createHealthProfile(cleanedData);
            setResult(response.profile);

            await checkAuth();

            setStep(4);
        } catch (err) {
            setError(err.message || 'Failed to create health profile');
        } finally {
            setLoading(false);
        }
    };

    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const toggleArrayField = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].includes(value)
                ? prev[field].filter(v => v !== value)
                : [...prev[field], value]
        }));
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-green-50 to-blue-50">
                        <div className="bg-white shadow-sm border-b">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <h1 className="text-3xl font-bold text-gray-900">Health Profile Setup</h1>
                    <p className="mt-2 text-gray-600">Help us personalize your nutrition journey</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                                {step < 4 && (
                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700">Step {step} of 3</span>
                            <span className="text-sm text-gray-500">{Math.round((step / 3) * 100)}% Complete</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${(step / 3) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                                        {step === 1 && (
                        <div className="bg-white rounded-xl shadow-md p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Basic Information</h2>

                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Age <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            required
                                            min="13"
                                            max="120"
                                            value={formData.age}
                                            onChange={(e) => updateField('age', parseInt(e.target.value))}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            placeholder="25"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Gender <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            required
                                            value={formData.gender}
                                            onChange={(e) => updateField('gender', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        >
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Height (cm) <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            required
                                            min="100"
                                            max="250"
                                            step="0.1"
                                            value={formData.height_cm}
                                            onChange={(e) => updateField('height_cm', parseFloat(e.target.value))}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            placeholder="175.0"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Weight (kg) <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            required
                                            min="30"
                                            max="300"
                                            step="0.1"
                                            value={formData.weight_kg}
                                            onChange={(e) => updateField('weight_kg', parseFloat(e.target.value))}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            placeholder="70.0"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Activity Level <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        required
                                        value={formData.activity_level}
                                        onChange={(e) => updateField('activity_level', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    >
                                        <option value="sedentary">Sedentary - Little or no exercise</option>
                                        <option value="lightly_active">Lightly Active - Exercise 1-3 days/week</option>
                                        <option value="moderately_active">Moderately Active - Exercise 3-5 days/week</option>
                                        <option value="very_active">Very Active - Exercise 6-7 days/week</option>
                                        <option value="extra_active">Extra Active - Very intense exercise daily</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Health Goal <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        required
                                        value={formData.goal}
                                        onChange={(e) => updateField('goal', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    >
                                        <option value="lose_weight">Lose Weight - Calorie deficit</option>
                                        <option value="maintain_weight">Maintain Weight - Balanced diet</option>
                                        <option value="gain_weight">Gain Weight - Calorie surplus</option>
                                        <option value="build_muscle">Build Muscle - High protein</option>
                                    </select>
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setStep(2)}
                                    className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                                >
                                    Continue
                                </button>
                            </div>
                        </div>
                    )}

                                        {step === 2 && (
                        <div className="bg-white rounded-xl shadow-md p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Medical Information</h2>
                            <p className="text-gray-600 mb-6">Optional but helps us provide better recommendations</p>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Medical Conditions (if any)
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {['Diabetes', 'Hypertension', 'High Cholesterol', 'Heart Disease', 'Thyroid Issues', 'PCOS'].map(condition => (
                                            <button
                                                key={condition}
                                                type="button"
                                                onClick={() => toggleArrayField('medical_conditions', condition)}
                                                className={`px-4 py-2 rounded-lg border-2 transition-colors ${formData.medical_conditions.includes(condition)
                                                    ? 'border-green-600 bg-green-50 text-green-700'
                                                    : 'border-gray-300 hover:border-gray-400'
                                                    }`}
                                            >
                                                {condition}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Food Allergies
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {['Peanuts', 'Tree Nuts', 'Dairy', 'Eggs', 'Soy', 'Shellfish', 'Gluten', 'Fish'].map(allergy => (
                                            <button
                                                key={allergy}
                                                type="button"
                                                onClick={() => toggleArrayField('allergies', allergy)}
                                                className={`px-4 py-2 rounded-lg border-2 transition-colors ${formData.allergies.includes(allergy)
                                                    ? 'border-red-600 bg-red-50 text-red-700'
                                                    : 'border-gray-300 hover:border-gray-400'
                                                    }`}
                                            >
                                                {allergy}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Dietary Preferences
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {['Vegetarian', 'Vegan', 'Pescatarian', 'Halal', 'Kosher', 'Gluten Free', 'Dairy Free', 'Low Carb', 'Keto'].map(pref => (
                                            <button
                                                key={pref}
                                                type="button"
                                                onClick={() => toggleArrayField('dietary_preferences', pref.toLowerCase().replace(' ', '_'))}
                                                className={`px-4 py-2 rounded-lg border-2 transition-colors ${formData.dietary_preferences.includes(pref.toLowerCase().replace(' ', '_'))
                                                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                                                    : 'border-gray-300 hover:border-gray-400'
                                                    }`}
                                            >
                                                {pref}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Fasting Blood Sugar (mg/dL)
                                        </label>
                                        <input
                                            type="number"
                                            min="50"
                                            max="400"
                                            value={formData.fasting_blood_sugar}
                                            onChange={(e) => updateField('fasting_blood_sugar', e.target.value ? parseFloat(e.target.value) : '')}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            placeholder="Optional"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex justify-between">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                                >
                                    Back
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStep(3)}
                                    className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                                >
                                    Continue
                                </button>
                            </div>
                        </div>
                    )}

                                        {step === 3 && (
                        <div className="bg-white rounded-xl shadow-md p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Review Your Information</h2>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between border-b pb-2">
                                    <span className="font-medium text-gray-700">Age:</span>
                                    <span>{formData.age} years</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="font-medium text-gray-700">Gender:</span>
                                    <span className="capitalize">{formData.gender}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="font-medium text-gray-700">Height:</span>
                                    <span>{formData.height_cm} cm</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="font-medium text-gray-700">Weight:</span>
                                    <span>{formData.weight_kg} kg</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="font-medium text-gray-700">Activity Level:</span>
                                    <span className="capitalize">{formData.activity_level.replace('_', ' ')}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="font-medium text-gray-700">Goal:</span>
                                    <span className="capitalize">{formData.goal.replace('_', ' ')}</span>
                                </div>
                            </div>

                            <div className="bg-blue-50 rounded-lg p-4 mb-8">
                                <p className="text-sm text-blue-900">
                                    🤖 We'll use AI to generate personalized recommendations based on your profile. This may take a moment...
                                </p>
                            </div>

                            <div className="flex justify-between">
                                <button
                                    type="button"
                                    onClick={() => setStep(2)}
                                    className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                                    disabled={loading}
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-medium flex items-center gap-2"
                                >
                                    {loading && (
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    )}
                                    {loading ? 'Generating Recommendations...' : 'Create Profile'}
                                </button>
                            </div>
                        </div>
                    )}

                                        {step === 4 && result && (
                        <div className="space-y-6">
                                                        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                                <div className="text-5xl mb-4">🎉</div>
                                <h2 className="text-2xl font-bold text-green-900 mb-2">Profile Created Successfully!</h2>
                                <p className="text-green-700">Here are your personalized nutrition targets and recommendations</p>
                            </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white rounded-xl shadow-md p-6">
                                    <h3 className="text-sm font-medium text-gray-600 mb-2">BMI</h3>
                                    <p className="text-3xl font-bold text-gray-900">{result.bmi.toFixed(1)}</p>
                                    <p className="text-sm text-gray-600 mt-1">{result.bmi_category}</p>
                                </div>
                                <div className="bg-white rounded-xl shadow-md p-6">
                                    <h3 className="text-sm font-medium text-gray-600 mb-2">Daily Calories</h3>
                                    <p className="text-3xl font-bold text-gray-900">{Math.round(result.daily_calories)}</p>
                                    <p className="text-sm text-gray-600 mt-1">kcal</p>
                                </div>
                                <div className="bg-white rounded-xl shadow-md p-6">
                                    <h3 className="text-sm font-medium text-gray-600 mb-2">BMR</h3>
                                    <p className="text-3xl font-bold text-gray-900">{Math.round(result.bmr)}</p>
                                    <p className="text-sm text-gray-600 mt-1">kcal/day</p>
                                </div>
                            </div>

                                                        <div className="bg-white rounded-xl shadow-md p-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">Daily Macro Targets</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="text-center p-4 bg-red-50 rounded-lg">
                                        <p className="text-sm text-gray-600 mb-1">Protein</p>
                                        <p className="text-2xl font-bold text-red-700">{Math.round(result.daily_protein_g)}g</p>
                                    </div>
                                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                                        <p className="text-sm text-gray-600 mb-1">Carbs</p>
                                        <p className="text-2xl font-bold text-blue-700">{Math.round(result.daily_carbs_g)}g</p>
                                    </div>
                                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                                        <p className="text-sm text-gray-600 mb-1">Fat</p>
                                        <p className="text-2xl font-bold text-yellow-700">{Math.round(result.daily_fat_g)}g</p>
                                    </div>
                                </div>
                            </div>

                                                        {result.ai_recommendations && (
                                <div className="bg-white rounded-xl shadow-md p-6">
                                    <h3 className="text-xl font-bold text-gray-900 mb-4">🤖 AI Recommendations</h3>
                                    <div className="prose max-w-none">
                                        <pre className="whitespace-pre-wrap text-sm text-gray-700">{result.ai_recommendations}</pre>
                                    </div>
                                </div>
                            )}

                            <div className="text-center">
                                <button
                                    onClick={() => router.push('/my')}
                                    className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                                >
                                    Go to Dashboard
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
