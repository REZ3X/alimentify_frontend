'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import MarkdownRenderer from '@/components/MarkdownRenderer';

// Custom Select Component with Glassmorphism
const CustomSelect = ({ label, name, value, options, onChange, required, icon }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const selectedOption = options.find(opt => opt.value === value);

    return (
        <div className={`relative ${isOpen ? 'z-50' : 'z-10'}`} ref={wrapperRef}>
            <label className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                {icon && <span className="text-lg">{icon}</span>}
                {label} {required && <span className="text-[#FA812F]">*</span>}
            </label>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full px-5 py-4 bg-white/50 border border-gray-200 rounded-2xl focus:outline-none text-left flex items-center justify-between transition-all duration-300 cursor-pointer ${isOpen ? 'ring-2 ring-[#FAB12F] bg-white/80 shadow-lg' : 'hover:bg-white/60 shadow-inner'}`}
            >
                <span className={`block truncate font-medium ${!selectedOption ? 'text-gray-400' : 'text-gray-900'}`}>
                    {selectedOption ? selectedOption.label : 'Select...'}
                </span>
                <span className={`pointer-events-none flex items-center transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    <svg className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                    </svg>
                </span>
            </button>

            {isOpen && (
                <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl bg-white/90 backdrop-blur-xl shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none animate-in fade-in zoom-in-95 duration-200 origin-top">
                    <div className="py-2 max-h-60 overflow-auto custom-scrollbar">
                        {options.map((option) => (
                            <div
                                key={option.value}
                                onClick={() => {
                                    onChange({ target: { name, value: option.value } });
                                    setIsOpen(false);
                                }}
                                className={`cursor-pointer select-none relative py-3 pl-6 pr-9 transition-colors duration-150 ${value === option.value ? 'bg-[#FAB12F]/10 text-[#FAB12F] font-bold' : 'text-gray-700 hover:bg-[#FAB12F]/5 hover:text-gray-900'}`}
                            >
                                <span className="block truncate">{option.label}</span>
                                {value === option.value && (
                                    <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-[#FAB12F]">
                                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

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

    const genderOptions = [
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' }
    ];

    const activityOptions = [
        { value: 'sedentary', label: 'Sedentary - Little or no exercise' },
        { value: 'lightly_active', label: 'Lightly Active - Exercise 1-3 days/week' },
        { value: 'moderately_active', label: 'Moderately Active - Exercise 3-5 days/week' },
        { value: 'very_active', label: 'Very Active - Exercise 6-7 days/week' },
        { value: 'extra_active', label: 'Extra Active - Very intense exercise daily' }
    ];

    const goalOptions = [
        { value: 'lose_weight', label: 'Lose Weight - Calorie deficit' },
        { value: 'maintain_weight', label: 'Maintain Weight - Balanced diet' },
        { value: 'gain_weight', label: 'Gain Weight - Calorie surplus' },
        { value: 'build_muscle', label: 'Build Muscle - High protein' }
    ];

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/login');
        }
    }, [user, authLoading, router]);

    if (authLoading) {
        return (
            <div className="min-h-screen bg-[#FEF3E2] flex items-center justify-center relative overflow-hidden">
                <div className="fixed inset-0 z-0 opacity-40 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#FAB12F 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
                <div className="text-center relative z-10">
                    <div className="w-16 h-16 border-4 border-[#FAB12F]/30 border-t-[#FA812F] rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    const validateProfileData = () => {
        const errors = [];

        if (formData.age < 13) {
            errors.push('Age must be at least 13 years old to use this service.');
        }
        if (formData.age > 120) {
            errors.push('Please enter a valid age (maximum 120 years).');
        }

        if (formData.height_cm < 50) {
            errors.push('Height seems too low. Please enter a valid height in centimeters (minimum 50cm).');
        }
        if (formData.height_cm > 280) {
            errors.push('Height seems too high. Please enter a valid height in centimeters (maximum 280cm).');
        }

        if (formData.weight_kg < 20) {
            errors.push('Weight seems too low. Please enter a valid weight in kilograms (minimum 20kg).');
        }
        if (formData.weight_kg > 500) {
            errors.push('Weight seems too high. Please enter a valid weight in kilograms (maximum 500kg).');
        }

        if (formData.height_cm && formData.weight_kg) {
            const heightM = formData.height_cm / 100;
            const bmi = formData.weight_kg / (heightM * heightM);
            if (bmi < 10 || bmi > 100) {
                errors.push('The combination of height and weight seems unrealistic. Please verify your measurements.');
            }
        }

        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validateProfileData();
        if (validationErrors.length > 0) {
            setError(validationErrors.join(' '));
            window.scrollTo(0, 0);
            return;
        }

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
            window.scrollTo(0, 0);
        } finally {
            setLoading(false);
        }
    };

    const validateStep1 = () => {
        const errors = validateProfileData();
        if (errors.length > 0) {
            setError(errors.join(' '));
            window.scrollTo(0, 0);
            return false;
        }
        setError(null);
        return true;
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

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
        exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
    };

    return (
        <div className="min-h-screen bg-[#FEF3E2] relative overflow-x-hidden pt-12 pb-40 px-4 sm:px-6 lg:px-8">
            {/* Background Pattern */}
            <div className="fixed inset-0 z-0 opacity-40 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#FAB12F 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
            <div className="fixed top-0 left-0 w-96 h-96 bg-[#FAB12F]/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0"></div>
            <div className="fixed bottom-0 right-0 w-96 h-96 bg-[#FA812F]/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none z-0"></div>

            <div className="max-w-4xl mx-auto relative z-10">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-mono font-bold text-gray-900 tracking-tight mb-2">Health Profile Setup</h1>
                    <p className="text-lg text-gray-600 font-medium">Help us personalize your nutrition journey</p>
                </div>

                {step < 4 && (
                    <div className="mb-8 max-w-2xl mx-auto">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-bold text-gray-700">Step {step} of 3</span>
                            <span className="text-sm font-bold text-[#FA812F]">{Math.round(((step - 1) / 2) * 100)}% Complete</span>
                        </div>
                        <div className="w-full bg-white/50 rounded-full h-3 backdrop-blur-sm border border-white/50">
                            <motion.div
                                className="bg-linear-to-r from-[#FAB12F] to-[#FA812F] h-3 rounded-full shadow-lg shadow-orange-500/20"
                                initial={{ width: 0 }}
                                animate={{ width: `${((step - 1) / 2) * 100}%` }}
                                transition={{ duration: 0.5 }}
                            ></motion.div>
                        </div>
                    </div>
                )}

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-50/80 backdrop-blur-md border border-red-200 text-red-700 px-6 py-4 rounded-2xl mb-6 shadow-sm max-w-2xl mx-auto"
                    >
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit}>
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="bg-white/60 backdrop-blur-xl rounded-4xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 p-8 md:p-10"
                            >
                                <h2 className="text-2xl font-mono font-bold text-gray-900 mb-8 flex items-center gap-3">
                                    <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#FAB12F]/20 text-[#FA812F] font-sans">1</span>
                                    Basic Information
                                </h2>

                                <div className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div>
                                            <label className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                                <span>🎂</span> Age <span className="text-[#FA812F]">*</span>
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    required
                                                    min="13"
                                                    max="120"
                                                    value={formData.age}
                                                    onChange={(e) => updateField('age', parseInt(e.target.value))}
                                                    className="w-full pl-12 pr-5 py-4 bg-white/50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#FAB12F] focus:border-transparent transition-all outline-none font-medium text-gray-900"
                                                    placeholder="25"
                                                />
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">Yrs</span>
                                            </div>
                                        </div>

                                        <div>
                                            <CustomSelect
                                                label="Gender"
                                                name="gender"
                                                value={formData.gender}
                                                options={genderOptions}
                                                onChange={(e) => updateField('gender', e.target.value)}
                                                required
                                                icon="⚧️"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div>
                                            <label className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                                <span>📏</span> Height (cm) <span className="text-[#FA812F]">*</span>
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    required
                                                    min="100"
                                                    max="250"
                                                    step="0.1"
                                                    value={formData.height_cm}
                                                    onChange={(e) => updateField('height_cm', parseFloat(e.target.value))}
                                                    className="w-full pl-12 pr-5 py-4 bg-white/50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#FAB12F] focus:border-transparent transition-all outline-none font-medium text-gray-900"
                                                    placeholder="175.0"
                                                />
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">CM</span>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                                <span>⚖️</span> Weight (kg) <span className="text-[#FA812F]">*</span>
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    required
                                                    min="30"
                                                    max="300"
                                                    step="0.1"
                                                    value={formData.weight_kg}
                                                    onChange={(e) => updateField('weight_kg', parseFloat(e.target.value))}
                                                    className="w-full pl-12 pr-5 py-4 bg-white/50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#FAB12F] focus:border-transparent transition-all outline-none font-medium text-gray-900"
                                                    placeholder="70.0"
                                                />
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">KG</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <CustomSelect
                                            label="Activity Level"
                                            name="activity_level"
                                            value={formData.activity_level}
                                            options={activityOptions}
                                            onChange={(e) => updateField('activity_level', e.target.value)}
                                            required
                                            icon="🏃‍♂️"
                                        />
                                    </div>

                                    <div>
                                        <CustomSelect
                                            label="Health Goal"
                                            name="goal"
                                            value={formData.goal}
                                            options={goalOptions}
                                            onChange={(e) => updateField('goal', e.target.value)}
                                            required
                                            icon="🎯"
                                        />
                                    </div>
                                </div>

                                <div className="mt-10 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (validateStep1()) {
                                                setStep(2);
                                            }
                                        }}
                                        className="px-10 py-4 bg-linear-to-r from-[#FAB12F] to-[#FA812F] text-white rounded-2xl hover:shadow-lg hover:shadow-orange-500/30 transition-all font-bold tracking-wide transform hover:-translate-y-0.5 cursor-pointer"
                                    >
                                        Continue
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="bg-white/60 backdrop-blur-xl rounded-4xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 p-8 md:p-10"
                            >
                                <h2 className="text-2xl font-mono font-bold text-gray-900 mb-2 flex items-center gap-3">
                                    <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#FAB12F]/20 text-[#FA812F] font-sans">2</span>
                                    Medical Information
                                </h2>
                                <p className="text-gray-600 mb-8 ml-13 font-medium">Optional but helps us provide better recommendations</p>

                                <div className="space-y-10">
                                    <div>
                                        <label className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                            <span className="bg-red-100 p-2 rounded-lg text-xl">🏥</span> Medical Conditions
                                        </label>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                            {[
                                                { id: 'Diabetes', icon: '🩸' },
                                                { id: 'Hypertension', icon: '💓' },
                                                { id: 'High Cholesterol', icon: '🍔' },
                                                { id: 'Heart Disease', icon: '🫀' },
                                                { id: 'Thyroid Issues', icon: '🦋' },
                                                { id: 'PCOS', icon: '🌸' }
                                            ].map(item => (
                                                <button
                                                    key={item.id}
                                                    type="button"
                                                    onClick={() => toggleArrayField('medical_conditions', item.id)}
                                                    className={`relative group p-4 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center justify-center gap-2 text-center hover:shadow-md cursor-pointer ${formData.medical_conditions.includes(item.id)
                                                        ? 'border-[#FAB12F] bg-[#FAB12F]/10 text-[#FA812F]'
                                                        : 'border-gray-100 bg-white/50 text-gray-600 hover:border-[#FAB12F]/30 hover:bg-white'
                                                        }`}
                                                >
                                                    <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">{item.icon}</span>
                                                    <span className="font-bold text-sm">{item.id}</span>
                                                    {formData.medical_conditions.includes(item.id) && (
                                                        <div className="absolute top-2 right-2 text-[#FAB12F]">
                                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                                        </div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                            <span className="bg-orange-100 p-2 rounded-lg text-xl">🥜</span> Food Allergies
                                        </label>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                            {[
                                                { id: 'Peanuts', icon: '🥜' },
                                                { id: 'Tree Nuts', icon: '🌰' },
                                                { id: 'Dairy', icon: '🥛' },
                                                { id: 'Eggs', icon: '🥚' },
                                                { id: 'Soy', icon: '🫘' },
                                                { id: 'Shellfish', icon: '🦐' },
                                                { id: 'Gluten', icon: '🍞' },
                                                { id: 'Fish', icon: '🐟' }
                                            ].map(item => (
                                                <button
                                                    key={item.id}
                                                    type="button"
                                                    onClick={() => toggleArrayField('allergies', item.id)}
                                                    className={`relative group p-4 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center justify-center gap-2 text-center hover:shadow-md cursor-pointer ${formData.allergies.includes(item.id)
                                                        ? 'border-red-400 bg-red-50 text-red-600'
                                                        : 'border-gray-100 bg-white/50 text-gray-600 hover:border-red-200 hover:bg-white'
                                                        }`}
                                                >
                                                    <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">{item.icon}</span>
                                                    <span className="font-bold text-sm">{item.id}</span>
                                                    {formData.allergies.includes(item.id) && (
                                                        <div className="absolute top-2 right-2 text-red-500">
                                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                                        </div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                            <span className="bg-green-100 p-2 rounded-lg text-xl">🥗</span> Dietary Preferences
                                        </label>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                            {[
                                                { id: 'Vegetarian', icon: '🥗' },
                                                { id: 'Vegan', icon: '🌿' },
                                                { id: 'Pescatarian', icon: '🐟' },
                                                { id: 'Halal', icon: '🕌' },
                                                { id: 'Kosher', icon: '🕍' },
                                                { id: 'Gluten Free', icon: '🌾' },
                                                { id: 'Dairy Free', icon: '🥛' },
                                                { id: 'Low Carb', icon: '🥩' },
                                                { id: 'Keto', icon: '🥑' }
                                            ].map(item => (
                                                <button
                                                    key={item.id}
                                                    type="button"
                                                    onClick={() => toggleArrayField('dietary_preferences', item.id.toLowerCase().replace(' ', '_'))}
                                                    className={`relative group p-4 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center justify-center gap-2 text-center hover:shadow-md cursor-pointer ${formData.dietary_preferences.includes(item.id.toLowerCase().replace(' ', '_'))
                                                        ? 'border-[#FAB12F] bg-[#FAB12F]/10 text-[#FA812F]'
                                                        : 'border-gray-100 bg-white/50 text-gray-600 hover:border-[#FAB12F]/30 hover:bg-white'
                                                        }`}
                                                >
                                                    <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">{item.icon}</span>
                                                    <span className="font-bold text-sm">{item.id}</span>
                                                    {formData.dietary_preferences.includes(item.id.toLowerCase().replace(' ', '_')) && (
                                                        <div className="absolute top-2 right-2 text-[#FAB12F]">
                                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                                        </div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                                <span>🩸</span> Fasting Blood Sugar (mg/dL)
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    min="50"
                                                    max="400"
                                                    value={formData.fasting_blood_sugar}
                                                    onChange={(e) => updateField('fasting_blood_sugar', e.target.value ? parseFloat(e.target.value) : '')}
                                                    className="w-full pl-12 pr-5 py-4 bg-white/50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#FAB12F] focus:border-transparent transition-all outline-none font-medium text-gray-900"
                                                    placeholder="Optional"
                                                />
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">mg</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-10 flex justify-between">
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="px-8 py-4 bg-white/50 text-gray-700 rounded-2xl hover:bg-white/80 font-bold transition-all border border-gray-200 cursor-pointer"
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setStep(3)}
                                        className="px-10 py-4 bg-linear-to-r from-[#FAB12F] to-[#FA812F] text-white rounded-2xl hover:shadow-lg hover:shadow-orange-500/30 transition-all font-bold tracking-wide transform hover:-translate-y-0.5 cursor-pointer"
                                    >
                                        Continue
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="bg-white/60 backdrop-blur-xl rounded-4xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 p-8 md:p-10"
                            >
                                <h2 className="text-2xl font-mono font-bold text-gray-900 mb-8 flex items-center gap-3">
                                    <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#FAB12F]/20 text-[#FA812F] font-sans">3</span>
                                    Review Your Information
                                </h2>

                                <div className="space-y-6 mb-8">
                                    <div className="bg-white/40 rounded-3xl p-8 border border-white/50 relative overflow-hidden group hover:shadow-lg transition-all duration-500">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FAB12F]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                                        <div className="flex items-center gap-4 mb-6 border-b border-gray-200/50 pb-4">
                                            <div className="w-12 h-12 bg-[#FAB12F] rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-orange-500/20 text-white">
                                                📋
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black text-gray-800">Health Passport</h3>
                                                <p className="text-sm text-gray-500 font-medium">Summary of your profile</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-12">
                                            <div className="flex justify-between items-center group/item">
                                                <span className="font-bold text-gray-500 flex items-center gap-2">
                                                    <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center text-sm">🎂</span>
                                                    Age
                                                </span>
                                                <span className="font-mono font-bold text-gray-900 text-lg bg-white/50 px-3 py-1 rounded-lg border border-white/50">{formData.age}</span>
                                            </div>
                                            <div className="flex justify-between items-center group/item">
                                                <span className="font-bold text-gray-500 flex items-center gap-2">
                                                    <span className="w-8 h-8 rounded-lg bg-pink-50 text-pink-500 flex items-center justify-center text-sm">⚧️</span>
                                                    Gender
                                                </span>
                                                <span className="capitalize font-mono font-bold text-gray-900 text-lg bg-white/50 px-3 py-1 rounded-lg border border-white/50">{formData.gender}</span>
                                            </div>
                                            <div className="flex justify-between items-center group/item">
                                                <span className="font-bold text-gray-500 flex items-center gap-2">
                                                    <span className="w-8 h-8 rounded-lg bg-purple-50 text-purple-500 flex items-center justify-center text-sm">📏</span>
                                                    Height
                                                </span>
                                                <span className="font-mono font-bold text-gray-900 text-lg bg-white/50 px-3 py-1 rounded-lg border border-white/50">{formData.height_cm} cm</span>
                                            </div>
                                            <div className="flex justify-between items-center group/item">
                                                <span className="font-bold text-gray-500 flex items-center gap-2">
                                                    <span className="w-8 h-8 rounded-lg bg-green-50 text-green-500 flex items-center justify-center text-sm">⚖️</span>
                                                    Weight
                                                </span>
                                                <span className="font-mono font-bold text-gray-900 text-lg bg-white/50 px-3 py-1 rounded-lg border border-white/50">{formData.weight_kg} kg</span>
                                            </div>
                                            <div className="flex justify-between items-center group/item col-span-1 sm:col-span-2 border-t border-gray-100 pt-4">
                                                <span className="font-bold text-gray-500 flex items-center gap-2">
                                                    <span className="w-8 h-8 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center text-sm">🏃‍♂️</span>
                                                    Activity
                                                </span>
                                                <span className="capitalize font-mono font-bold text-gray-900 text-lg bg-white/50 px-3 py-1 rounded-lg border border-white/50">{formData.activity_level.replace(/_/g, ' ')}</span>
                                            </div>
                                            <div className="flex justify-between items-center group/item col-span-1 sm:col-span-2">
                                                <span className="font-bold text-gray-500 flex items-center gap-2">
                                                    <span className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center text-sm">🎯</span>
                                                    Goal
                                                </span>
                                                <span className="capitalize font-mono font-bold text-gray-900 text-lg bg-white/50 px-3 py-1 rounded-lg border border-white/50">{formData.goal.replace(/_/g, ' ')}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-[#FAB12F]/10 border border-[#FAB12F]/20 rounded-3xl p-6 flex gap-4 items-start relative overflow-hidden">
                                        <div className="absolute -right-4 -bottom-4 text-9xl opacity-10 rotate-12">🤖</div>
                                        <div className="text-4xl bg-white rounded-2xl p-2 shadow-sm z-10">🤖</div>
                                        <div className="z-10">
                                            <h4 className="font-bold text-gray-900 mb-1">AI Analysis Ready</h4>
                                            <p className="text-sm text-gray-700 font-medium leading-relaxed">
                                                We'll use AI to generate personalized recommendations based on your profile. This may take a moment...
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col-reverse sm:flex-row justify-between gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setStep(2)}
                                        className="w-full sm:w-auto px-8 py-4 bg-white/50 text-gray-700 rounded-2xl hover:bg-white/80 font-bold transition-all border border-gray-200 cursor-pointer"
                                        disabled={loading}
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full sm:w-auto px-10 py-4 bg-linear-to-r from-[#FAB12F] to-[#FA812F] text-white rounded-2xl hover:shadow-lg hover:shadow-orange-500/30 transition-all font-bold tracking-wide transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 min-w-40 cursor-pointer"
                                    >
                                        {loading && (
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        )}
                                        {loading ? 'Generating...' : 'Create'}
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 4 && result && (
                            <motion.div
                                key="step4"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="space-y-6"
                            >
                                <div className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] shadow-xl p-8 text-center border border-white/50 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-[#FAB12F] via-[#FA812F] to-[#FAB12F]"></div>
                                    <div className="text-7xl mb-6 inline-block filter drop-shadow-lg">🎉</div>
                                    <h2 className="text-3xl md:text-4xl font-mono font-bold text-gray-900 mb-3 tracking-tight">Profile Created!</h2>
                                    <p className="text-gray-600 font-medium text-lg max-w-md mx-auto">Your personalized nutrition plan is ready. Here are your daily targets.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-linear-to-br from-blue-50 to-blue-100/50 backdrop-blur-xl rounded-4xl shadow-lg p-6 border border-blue-100 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-200/50 rounded-full blur-2xl"></div>
                                        <h3 className="text-sm font-bold text-blue-600 mb-2 uppercase tracking-wider flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-blue-500"></span> BMI
                                        </h3>
                                        <p className="text-5xl font-mono font-bold text-gray-900 mb-1">{result.bmi.toFixed(1)}</p>
                                        <p className="text-sm font-bold text-blue-500 bg-white/60 inline-block px-3 py-1 rounded-full backdrop-blur-sm">{result.bmi_category}</p>
                                    </div>
                                    <div className="bg-linear-to-br from-orange-50 to-orange-100/50 backdrop-blur-xl rounded-4xl shadow-lg p-6 border border-orange-100 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-orange-200/50 rounded-full blur-2xl"></div>
                                        <h3 className="text-sm font-bold text-orange-600 mb-2 uppercase tracking-wider flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-orange-500"></span> Daily Calories
                                        </h3>
                                        <p className="text-5xl font-mono font-bold text-gray-900 mb-1">{Math.round(result.daily_calories)}</p>
                                        <p className="text-sm font-bold text-orange-500">kcal / day</p>
                                    </div>
                                    <div className="bg-linear-to-br from-purple-50 to-purple-100/50 backdrop-blur-xl rounded-4xl shadow-lg p-6 border border-purple-100 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-purple-200/50 rounded-full blur-2xl"></div>
                                        <h3 className="text-sm font-bold text-purple-600 mb-2 uppercase tracking-wider flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-purple-500"></span> BMR
                                        </h3>
                                        <p className="text-5xl font-mono font-bold text-gray-900 mb-1">{Math.round(result.bmr)}</p>
                                        <p className="text-sm font-bold text-purple-500">kcal / day</p>
                                    </div>
                                </div>

                                <div className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] shadow-xl p-8 border border-white/50">
                                    <h3 className="text-xl font-mono font-bold text-gray-900 mb-8 flex items-center gap-3">
                                        <span className="w-10 h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center text-xl">📊</span>
                                        Daily Macro Targets
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                        <div className="relative p-6 bg-red-50/80 rounded-3xl border border-red-100 overflow-hidden group">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-red-400"></div>
                                            <p className="text-sm font-bold text-gray-600 mb-2 uppercase tracking-wider">Protein</p>
                                            <p className="text-4xl font-mono font-bold text-red-500 mb-1">{Math.round(result.daily_protein_g)}<span className="text-lg text-red-300 ml-1">g</span></p>
                                            <div className="w-full bg-red-200/50 h-2 rounded-full mt-3 overflow-hidden">
                                                <div className="bg-red-500 h-full rounded-full w-3/4"></div>
                                            </div>
                                        </div>
                                        <div className="relative p-6 bg-blue-50/80 rounded-3xl border border-blue-100 overflow-hidden group">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-400"></div>
                                            <p className="text-sm font-bold text-gray-600 mb-2 uppercase tracking-wider">Carbs</p>
                                            <p className="text-4xl font-mono font-bold text-blue-500 mb-1">{Math.round(result.daily_carbs_g)}<span className="text-lg text-blue-300 ml-1">g</span></p>
                                            <div className="w-full bg-blue-200/50 h-2 rounded-full mt-3 overflow-hidden">
                                                <div className="bg-blue-500 h-full rounded-full w-1/2"></div>
                                            </div>
                                        </div>
                                        <div className="relative p-6 bg-yellow-50/80 rounded-3xl border border-yellow-100 overflow-hidden group">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-yellow-400"></div>
                                            <p className="text-sm font-bold text-gray-600 mb-2 uppercase tracking-wider">Fat</p>
                                            <p className="text-4xl font-mono font-bold text-yellow-600 mb-1">{Math.round(result.daily_fat_g)}<span className="text-lg text-yellow-400 ml-1">g</span></p>
                                            <div className="w-full bg-yellow-200/50 h-2 rounded-full mt-3 overflow-hidden">
                                                <div className="bg-yellow-500 h-full rounded-full w-1/3"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {result.ai_recommendations && (
                                    <div className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] shadow-xl p-8 border border-white/50 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-br from-[#FAB12F]/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                                        <h3 className="text-xl font-mono font-bold text-gray-900 mb-6 flex items-center gap-3 relative z-10">
                                            <span className="w-10 h-10 rounded-xl bg-linear-to-br from-[#FAB12F] to-[#FA812F] text-white flex items-center justify-center text-xl shadow-lg shadow-orange-500/20">🤖</span>
                                            AI Recommendations
                                        </h3>
                                        <div className="prose max-w-none relative z-10">
                                            <div className="bg-white/50 p-8 rounded-3xl border border-white/60 shadow-sm">
                                                <MarkdownRenderer content={result.ai_recommendations} />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] shadow-xl p-8 border border-white/50 text-center flex flex-col items-center justify-center gap-4">
                                    <p className="text-gray-600 font-medium text-lg">Your profile has been successfully saved.</p>
                                    <button
                                        onClick={() => router.push('/my')}
                                        className="px-12 py-4 bg-linear-to-r from-[#FAB12F] to-[#FA812F] text-white rounded-2xl hover:shadow-lg hover:shadow-orange-500/30 transition-all font-bold tracking-wide text-lg transform hover:-translate-y-0.5 w-full sm:w-auto cursor-pointer"
                                    >
                                        Go to Dashboard
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </form>
            </div>
        </div>
    );
}